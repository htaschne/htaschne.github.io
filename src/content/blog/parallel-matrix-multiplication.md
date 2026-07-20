---
title: "Scaling Matrix Multiplication with MPI in Go"
date: "2026-07-05"
description: "Exploring distributed matrix multiplication in Go using MPI and analyzing how performance scales across multiple processes."
tags: ["Go", "MPI", "Parallel Computing", "Distributed Systems", "Performance"]
tldr: "Parallelizing matrix multiplication with MPI produced a major speedup over the sequential version, with the best result at eight processes. The experiment also showed that adding more processes is not always better, since communication and synchronization costs can eventually outweigh the benefits."
takeaways:
  - "Row-based decomposition made the workload simple to distribute."
  - "The parallel version preserved the same numerical results as the sequential implementation."
  - "Eight processes produced the best observed runtime in the experiment."
featured: false
---

Matrix multiplication is one of those problems that looks almost too perfect for parallel programming.

Every output cell is just a dot product. Rows can be split up. The loops are obvious. You look at it and think, "This should scale nicely."

So for a **Parallel and Distributed Processing Fundamentals** assignment, I implemented a sequential version and an MPI version in Go, then ran the benchmarks on the Atlântica cluster.

This looked easy. It was mostly easy. Then the performance numbers started being more interesting than the code.

## The Problem

The baseline was the familiar triple-loop matrix multiplication.

It is straightforward, but **O(n³)** gets rude very quickly.

For the experiment I used square matrices of size:

**5000 × 5000**

Large enough that the sequential version takes real time, and large enough that communication overhead has somewhere to hide.

## Parallelizing the Work

I used a classic **Master–Worker** layout.

The master process is responsible for:

- generating the input matrices;
- distributing rows of matrix **A**;
- broadcasting matrix **B**;
- collecting partial results.

Each worker receives a subset of rows from **A** and the full matrix **B**, then computes its slice of the result.

The nice part is that rows of the output are independent. Once the worker has its inputs, it can mostly stay busy without talking to anyone.

The less nice part is that **B** still has to be broadcast, and the result still has to come back. Distributed programs always find a way to make the "simple" part less simple.

## Verifying Correctness

Before caring about speed, I needed to make sure the parallel version was not just producing fast garbage.

I checked:

- the four corner values of the resulting matrix;
- a checksum of the entire matrix;
- the sequential and parallel outputs.

All runs matched the sequential output.

This is not the glamorous part of parallel programming, but it is the part that lets you sleep. A speedup number means nothing if the result matrix is wrong.

## Performance Results

Then I ran the MPI version with different process counts and compared it with the sequential baseline.

| Processes | Time (s) | Speedup |
|----------:|---------:|--------:|
| 1 | 3354.69 | 1.00× |
| 4 | 459.34 | 7.30× |
| 8 | 241.87 | 13.87× |
| 16 | 268.30 | 12.50× |

The best run was with **8 processes**. It cut the runtime from almost **56 minutes** to just over **4 minutes**.

That was the moment where the assignment stopped feeling like a required benchmark table and started feeling like a real performance experiment.

## Superlinear Speedup?

The part I did not expect was the speedup.

The 4-process and 8-process runs were faster than linear scaling would suggest. At first glance, that looks suspicious. My first reaction was basically: did I measure this wrong?

After checking the outputs and rerunning the experiment, the likely explanation was cache behavior.

Instead of one process dragging the entire workload through memory, each process worked on a smaller chunk. That smaller working set can fit better into cache, which reduces expensive memory access and can produce **superlinear speedup**.

I love when benchmarks make me suspicious and then teach me something.

## When More Processes Stop Helping

Then I tried **16 processes**, because of course I did.

It got slower.

The computation itself became smaller for each worker, but the overhead of:

- communication,
- synchronization,
- process management

started to dominate the total execution time.

That was the useful correction to my intuition. More processes did not automatically mean more speed. At some point the work per process gets smaller, but the coordination costs do not politely disappear.

## Amdahl's Law in Practice

This is where **Amdahl's Law** stops being a diagram from slides and starts being something you can feel in the numbers.

Matrix multiplication is highly parallelizable, but not every part of the program is computation. Data distribution, synchronization, and result collection still exist, and they limit how far scaling can go.

The best result came from balancing computation and communication, not from using the largest process count available.

## What I Learned

This was my first real chance to build and benchmark an MPI program.

The code was not the hardest part. The harder part was learning to trust the numbers only after checking that the experiment was actually measuring what I thought it was measuring.

- parallel algorithms are often simple—the communication isn't;
- speedup alone doesn't tell the whole story;
- cache effects can have a surprisingly large impact on performance;
- measuring and analyzing results is just as important as writing the code.

If I did this again, I would collect more runs per process count and plot variance instead of relying on one table. This graph exists because I did not trust myself enough by the end, and honestly that instinct was probably correct.
