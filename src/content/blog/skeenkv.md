---
title: "Implementing and Evaluating Skeen's Protocol"
date: "2026-07-08"
description: "Building SkeenKV to understand atomic multicast, Skeen's original algorithm, and the ACK-gated extension proposed by Pacheco et al."
tags: ["Distributed Systems", "Go", "Atomic Multicast", "Key-Value Stores", "Benchmarks"]
readingTime: "9 min read"
tldr: "I built SkeenKV to understand atomic multicast by implementing Skeen's original protocol and the ACK-gated extension proposed by Pacheco et al. The implementation made the safety trade-off concrete: the original protocol is faster, while the ACK-gated variant adds coordination to provide stronger ordering guarantees."
takeaways:
  - "Atomic multicast is useful when operations touch only some partitions, but overlapping destination sets still need a consistent order."
  - "Skeen's protocol assigns order through timestamp proposals and a final timestamp broadcast."
  - "The ACK-gated extension adds a delivery barrier that prevents a subtle atomic-global-order violation, at measurable latency cost."
featured: false
---

I wanted to understand atomic multicast without only nodding at papers.

The idea sounds tidy in prose: send a message to some processes, not all of them, and still make sure overlapping destinations agree on order.

Then you try to implement it and the tidy part disappears. Which node proposes the timestamp? When is a message final? What does "deliverable" mean when another message might still arrive and ruin your day?

So I built **SkeenKV**, a small key-value store around Skeen's atomic multicast protocol. I implemented the original algorithm, then the ACK-gated extension proposed by Pacheco et al., and then I may have accidentally built a benchmark and deterministic scheduler around it.

This was never meant to become a production database. It was a way to make a distributed systems paper executable enough that I could argue with it.

## What Is Atomic Multicast?

Broadcast sends a message to everyone. Multicast sends it to a selected group.

That distinction matters if a key-value store is partitioned. Suppose the key space is split like this:

```text
P0 owns keys 0, 3, 6, ...
P1 owns keys 1, 4, 7, ...
P2 owns keys 2, 5, 8, ...
```

A write to key `4` only needs `P1`. Broadcasting it to `P0` and `P2` would be wasted work. A range query over `0..5`, though, touches all three partitions.

That is where multicast becomes useful. Send each operation only where it needs to go.

The hard part is ordering.

Imagine two operations:

```text
A targets P0 and P1
B targets P1 and P2
```

They overlap at `P1`, so `P1` has to pick an order. If the partitions observe incompatible histories, the store starts behaving like a system nobody wants to debug.

Atomic multicast gives overlapping operations a shared order without forcing every operation through every partition.

## How Skeen's Algorithm Works

Skeen's protocol avoids a permanent central sequencer. The destinations collaborate to assign a timestamp to each multicast message.

Each partition has a logical clock. Not wall-clock time. Just a counter that advances as protocol events happen.

The shape of the protocol is:

1. A coordinator sends `START` to every destination in the multicast set.
2. Each destination increments its logical clock and proposes a timestamp.
3. Once the proposals are known, the maximum proposed timestamp becomes the final timestamp.
4. The final timestamp is sent back to the destinations.
5. A destination delivers finalized messages in timestamp order, as long as no earlier local candidate can still appear ahead of them.

In SkeenKV, timestamps are pairs: a logical clock value plus the partition ID, which breaks ties deterministically when two clocks have the same value.

Here is the version I kept coming back to while implementing it:

```centered-diagram
client / coordinator              P0                         P1                          P2
        |                          |                          |                           |
        | -------- START --------> |                          |                           |
        | ------------------------------- START ------------> |                           |
        | ---------------------------------------------------------- START -------------> |
        |                          |                          |                           |
        |                          | propose 4                | propose 7                 | propose 5
        | <------ LOCAL_TS 4 ----- |                          |                           |
        | <------------------------------ LOCAL_TS 7 -------- |                           |
        | <--------------------------------------------------------- LOCAL_TS 5 --------- |
        |                          |                          |                           |
        | final = max(4, 7, 5) = 7 |                          |                           |
        | -------- FINAL_TS 7 ---> |                          |                           |
        | ------------------------------- FINAL_TS 7 -------> |                           |
        | ---------------------------------------------------------- FINAL_TS 7 --------> |
        |                          |                          |                           |
        |                          | deliver in final timestamp order across destinations |
```

No single node permanently owns the global order. Each multicast group helps order its own message.

That sounds elegant, and it is, but the local-state part is where I got nervous. Each destination only sees its queue, its proposals, and the final timestamps it has learned. A delivery rule can look reasonable locally and still be too weak globally.

That is where the Pacheco et al. extension enters the story.

## The ACK-Gated Extension

The later paper points out that the original protocol can be insufficient for **atomic global order**.

The bug pattern is subtle enough that I had to draw it a few times before it felt real.

Skeen's original protocol gives each message a final timestamp, and overlapping destinations agree on delivery order. But a partitioned state machine may also need a stronger guarantee: once an operation is delivered, later overlapping multicasts should not be able to create a cycle in the global order.

Suppose message `m` targets `P0` and `P1`. Partition `P1` delivers `m`. After that delivery, another message `m'` is multicast to `P0` and `P2`.

Now there is a real-time relationship:

```text
m was delivered before m' was multicast
```

But `m` and `m'` overlap only at `P0`. With the wrong schedule, `P0` can still deliver `m'` before `m`.

Locally, everyone may think they are obeying the rules. Globally, the history contains a cycle:

```text
m happened before m'
m' was delivered before m
```

This looked cursed enough that I had to turn it into a deterministic test.

The ACK-gated extension adds a barrier. After a destination learns the final timestamp for a message, it sends an `ACK` to the other destinations. A message is not deliverable until ACKs from the full destination set have arrived.

So the protocol becomes:

```text
START -> proposals -> FINAL_TS -> ACKs -> delivery
```

The ACK does not change the final timestamp. It changes when a finalized message is allowed to reach the application.

That barrier costs messages, state, and latency. The useful question is how much.

## Building SkeenKV

SkeenKV wraps the protocol in a small key-value store. Each partition owns part of the key space. A `PUT` targets one partition. A range query may target multiple partitions.

That gave me a clean way to generate both single-destination and multi-destination operations without inventing a fake workload completely detached from the protocol.

The implementation supports configurable `N`-partition clusters, so I could run the same code with `N=2`, `N=3`, and `N=5`.

There are two transports:

- an in-memory transport for tests and benchmarks;
- an HTTP transport for running partitions as separate processes.

Both transports use the same protocol state machine. The in-memory transport maps a partition ID directly to a local `Skeen` instance. The HTTP transport sends the same protocol messages as JSON to `/internal/protocol`. Docker Compose runs multi-partition clusters locally.

The most useful piece was the deterministic protocol scheduler.

Normal distributed tests can be unsatisfying because timing bugs hide behind sleep calls. If a bug only appears when one message arrives before another, `time.Sleep` is not a correctness argument.

So the scheduled transport queues protocol messages instead of delivering them immediately. Tests can release messages by request ID, message type, sender, receiver, or destination set. That made it possible to reproduce the unsafe schedule from the paper and then run the same schedule against the ACK-gated version.

The tests also record per-partition delivery order and build a graph from those orders. If adding the real-time edge creates a cycle, the test reproduced the ordering problem. In strengthened mode, the same trace blocks until the required ACKs arrive.

This scheduler is probably my favorite part of the project. It turned the protocol from "I hope this race happens" into "run exactly this trace."

## Results

After the correctness work, I ran benchmarks up to `N=5` partitions.

The in-memory benchmark measures local protocol overhead without artificial network delay. For full-destination operations, the original protocol was faster:

| Cluster | Original | ACK-gated |
|--------:|---------:|----------:|
| N=2, dst=2 | 0.293 ms/op | 0.350 ms/op |
| N=3, dst=3 | 0.488 ms/op | 0.608 ms/op |
| N=5, dst=5 | 0.751 ms/op | 1.193 ms/op |

Single-destination operations barely changed, which makes sense. If there is only one destination, there is no peer barrier to wait for.

Then I added artificial latency with `N=3`. These runs inject fixed delay into protocol messages. They are not a real network model. No jitter, no packet loss, no congestion, no tail latency. Just a controlled way to see how extra protocol phases behave when messages get slower.

For full-destination operations with delay on protocol messages:

| Artificial delay | Original | ACK-gated |
|-----------------:|---------:|----------:|
| 1 ms | 8.085 ms/op | 12.670 ms/op |
| 5 ms | 39.436 ms/op | 61.753 ms/op |
| 10 ms | 76.789 ms/op | 120.357 ms/op |

The gap grows as latency grows because the strengthened protocol adds ACKs on the delivery path. That is the trade-off I expected, but it was still useful to see it in numbers.

The ACK-specific benchmark isolates that cost further. With `N=3`, `dst=3`, and delay applied only to ACK messages, strengthened mode rose from about `0.610 ms/op` at zero ACK delay to `5.673 ms/op` at 1 ms, `29.648 ms/op` at 5 ms, and `58.860 ms/op` at 10 ms.

None of these numbers should be read as production claims. This is a small educational implementation. But they do make the mechanism visible: adding one message phase to the critical path shows up quickly.

## Takeaways

Reading a distributed systems paper and implementing the protocol are not the same activity.

On paper, Skeen's algorithm is a clean sequence of timestamp proposals and final timestamps. In code, I had to decide what state each request carries, when logical clocks advance, how to merge range-query results, how to avoid delivering too early, and how to test schedules that normal execution might only hit by accident.

The ACK-gated extension was also more useful to implement than to merely describe. The code change is not huge: add ACK messages, track which destinations acknowledged, and include that condition in the delivery predicate. But that small change changes the shape of the protocol.

The big lesson was deterministic testing. If the correctness argument depends on message ordering, the test should control message ordering. Once I had the scheduler, the protocol stopped feeling like a black box.

SkeenKV is still intentionally limited. It assumes static membership and reliable processes. It does not implement crash recovery, persistent logs, view changes, replicated partition groups, or dynamic reconfiguration.

If I took it further, I would probably add persistent logs or failure handling next. Future me is probably going to regret saying that publicly.

For now, the project did what I wanted: implement atomic multicast, break the original protocol in a controlled way, strengthen it, and measure the cost.

The implementation and benchmark data are available here:

[github.com/htaschne/skeenkv](https://github.com/htaschne/skeenkv)
