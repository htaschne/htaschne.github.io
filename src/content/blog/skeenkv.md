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

I wanted to understand atomic multicast beyond reading papers. The idea sounds compact when described abstractly: send a message to a subset of processes, and make sure overlapping destinations deliver related messages in a compatible order. The details become less compact in code. Which process proposes the order? When is a timestamp final?

To answer those questions, I built **SkeenKV**, a small distributed key-value store around Skeen's atomic multicast protocol. I implemented the original algorithm and the ACK-gated extension proposed by Pacheco et al., then benchmarked both versions under in-memory and artificial-latency settings.

The project was not meant to become a production database. I built it because distributed protocols are easier to reason about once I can run them and watch where the ordering rules matter.

## What Is Atomic Multicast?

Broadcast sends a message to everyone. Multicast sends a message to a selected group.

That difference matters in a partitioned database. Suppose a key-value store is split across three partitions:

```text
P0 owns keys 0, 3, 6, ...
P1 owns keys 1, 4, 7, ...
P2 owns keys 2, 5, 8, ...
```

A write to key `4` only needs partition `P1`. Broadcasting that write to `P0` and `P2` would waste work. A range query over keys `0..5`, on the other hand, touches all three partitions. This is where multicast becomes useful: each operation can be sent only to the partitions whose state it may read or write.

The hard part is ordering.

Imagine two operations:

```text
A targets P0 and P1
B targets P1 and P2
```

They overlap at `P1`, so `P1` cannot deliver them in an arbitrary order. If different partitions observe incompatible histories, the store becomes hard to reason about.

Atomic multicast gives us this rule: if two messages are delivered at common destinations, those common destinations must deliver them in the same relative order. For a partitioned store, this lets each operation run only where it needs to run while still giving overlapping operations a shared serialization point.

## How Skeen's Algorithm Works

Skeen's protocol avoids a single central sequencer. Instead, the destinations collaborate to assign a timestamp to each multicast message.

Each partition has a logical clock. The clock is not wall-clock time. It is a counter that moves forward when protocol events happen, giving messages a way to be ordered without asking the operating system what time it is.

The protocol works roughly like this:

1. A coordinator sends `START` to every destination in the multicast set.
2. Each destination increments its logical clock and proposes a timestamp.
3. Once the proposals are known, the maximum proposed timestamp becomes the final timestamp.
4. The final timestamp is sent back to the destinations.
5. A destination delivers finalized messages in timestamp order, as long as no earlier local candidate can still appear ahead of them.

In SkeenKV, timestamps are pairs: a logical clock value plus the partition ID, which breaks ties deterministically when two clocks have the same value.

A simplified run with three destinations looks like this:

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

No single node permanently owns the order for every operation. Each multicast group participates in ordering its own message. The tricky part is that every destination has only local knowledge: its queue, the proposals it has received, and the final timestamps it has learned. A delivery rule can look correct locally while still being too weak for a stronger global property.

That is where the extension by Pacheco et al. becomes relevant.

## The ACK-Gated Extension

The later paper observed that the original protocol can be insufficient for a stronger property called **atomic global order**.

The issue is subtle. Skeen's original protocol gives each message a final timestamp, and overlapping destinations agree on delivery order. But a partitioned state machine may also need to know that once an operation is delivered, later overlapping multicasts cannot create a global ordering cycle.

Suppose message `m` targets `P0` and `P1`. Partition `P1` delivers `m`. After that delivery, another message `m'` is multicast to `P0` and `P2`.

There is now a real-time relationship:

```text
m was delivered before m' was multicast
```

But because `m` and `m'` overlap only at `P0`, the messages that reach `P0` can still be scheduled in a way that lets `P0` deliver `m'` before `m`. Locally, each destination may be following the timestamp rules it knows. Globally, the combined order now contains a cycle:

```text
m happened before m'
m' was delivered before m
```

That is the kind of execution the ACK-gated extension is designed to prevent.

The change is conceptually simple. After a destination learns the final timestamp for a message, it sends an `ACK` to the other destinations. A message is not deliverable until ACKs from the full destination set have arrived.

So the strengthened protocol adds one more gate:

```text
START -> proposals -> FINAL_TS -> ACKs -> delivery
```

The ACK does not change how the final timestamp is chosen. It changes when a finalized message may be released to the application. I found this easiest to understand as a barrier: before anyone exposes this operation as delivered, everyone in its destination set must have crossed the same final-timestamp point.

That extra barrier is not free. It adds messages, state, and waiting. The question is how much it costs and what guarantee it buys.

## Building SkeenKV

SkeenKV wraps the protocol in a small key-value store. Each partition owns part of the key space. A `PUT` targets one partition. A range query may target multiple partitions, depending on which keys fall inside the range. That gave me a simple way to generate both single-destination and multi-destination operations.

The implementation supports configurable `N`-partition clusters. I used that to run the same protocol over `N=2`, `N=3`, and `N=5` without hard-coding a fixed set of participants.

There are two transports:

- an in-memory transport for tests and benchmarks;
- an HTTP transport for running partitions as separate processes.

Both transports use the same protocol state machine. The in-memory transport maps a partition ID directly to a local `Skeen` instance. The HTTP transport sends the same protocol messages as JSON to `/internal/protocol`. Docker Compose files run multi-partition clusters locally.

The most useful piece was the deterministic protocol scheduler. Normal distributed tests are often unsatisfying because they depend on timing. If a bug only appears when one message arrives before another, sleeping for a few milliseconds is not a real test. For SkeenKV, I built a scheduled transport that queues protocol messages instead of delivering them immediately. Tests can release messages by request ID, message type, sender, receiver, or destination set. That made it possible to reproduce the unsafe schedule discussed in the paper and then run the same schedule against the ACK-gated implementation.

The tests also record per-partition delivery order and build a graph from those orders. If adding the real-time edge creates a cycle, the test has reproduced the ordering problem. In strengthened mode, the same trace is blocked until the required ACKs arrive.

## Results

I ran benchmarks up to `N=5` partitions.

The in-memory benchmark measures local protocol overhead without artificial network delay. For full-destination operations, the original protocol was consistently faster:

| Cluster | Original | ACK-gated |
|--------:|---------:|----------:|
| N=2, dst=2 | 0.293 ms/op | 0.350 ms/op |
| N=3, dst=3 | 0.488 ms/op | 0.608 ms/op |
| N=5, dst=5 | 0.751 ms/op | 1.193 ms/op |

Single-destination operations were almost unchanged, which makes sense. The ACK gate matters when multiple destinations participate. When the destination set has one partition, there is no real peer barrier to wait for.

I also ran artificial-latency benchmarks with `N=3`. These benchmarks inject fixed delay into protocol messages. They are not a model of a real network with jitter, packet loss, congestion, and tail latency. They are a way to see how extra protocol phases react when messages become slower.

For full-destination operations with delay on protocol messages:

| Artificial delay | Original | ACK-gated |
|-----------------:|---------:|----------:|
| 1 ms | 8.085 ms/op | 12.670 ms/op |
| 5 ms | 39.436 ms/op | 61.753 ms/op |
| 10 ms | 76.789 ms/op | 120.357 ms/op |

The gap grows as latency grows because the strengthened protocol adds ACKs on the delivery path. That is the expected trade-off. The original protocol does less coordination and finishes sooner. The ACK-gated protocol coordinates more before exposing delivery, which gives the stronger ordering guarantee but makes latency more visible.

The ACK-specific benchmark isolates that cost further. With `N=3`, `dst=3`, and delay applied only to ACK messages, strengthened mode rose from about `0.610 ms/op` at zero ACK delay to `5.673 ms/op` at 1 ms, `29.648 ms/op` at 5 ms, and `58.860 ms/op` at 10 ms.

None of these numbers should be read as a production performance claim. They are small-cluster measurements for an educational implementation. They do make the mechanism visible: small protocol changes can have measurable performance implications, especially when the change adds a message phase to the critical path.

## Takeaways

Reading a distributed systems paper and implementing the protocol are very different experiences.

On paper, Skeen's algorithm is a clean sequence of timestamp proposals and final timestamps. In code, I had to decide what state each request carries, when logical clocks advance, how to merge range-query results, how to avoid delivering too early, and how to test schedules that normal execution might only hit by chance.

The ACK-gated extension was also more interesting in code than in prose. The implementation change is not huge: add ACK messages, track which destinations have acknowledged, and include that condition in the delivery predicate. But that small change alters the shape of the protocol. It adds a barrier, and the benchmarks show the cost of that barrier clearly.

The project also reinforced how important deterministic testing is for distributed systems. If a correctness argument depends on message ordering, the test should control message ordering. Once I had the scheduler, the protocol stopped feeling like a black box.

SkeenKV is still intentionally limited. It assumes static membership and reliable processes. It does not implement crash recovery, persistent logs, view changes, replicated partition groups, or dynamic reconfiguration.

For me, the value of the project was narrower: I wanted to understand atomic multicast well enough to implement it, break it in a controlled way, strengthen it, and measure the trade-off.

The implementation and benchmark data are available here:

[github.com/htaschne/skeenkv](https://github.com/htaschne/skeenkv)
