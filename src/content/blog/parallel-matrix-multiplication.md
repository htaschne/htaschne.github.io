---
title: "Scaling Matrix Multiplication with MPI in Go"
date: "2026-07-07"
description: "Exploring distributed matrix multiplication in Go using MPI and analyzing how performance scales across multiple processes."
tags: ["Go", "MPI", "Parallel Computing", "Distributed Systems", "Performance"]
featured: false
---

Matrix multiplication is one of those classic problems that appears everywhere—from scientific computing and simulations to machine learning. It's also a great exercise for understanding parallel programming because the work can be divided naturally across multiple processors.

For a recent assignment in **Parallel and Distributed Processing Fundamentals**, I implemented both a sequential and a distributed version of square matrix multiplication using **MPI in Go**, then benchmarked the implementation on the Atlântica cluster.

## The Problem

The baseline algorithm is the familiar triple-loop matrix multiplication.

Although straightforward, it has a time complexity of **O(n³)**, making it increasingly expensive as matrices grow larger.

For the experiments, I used matrices of size:

**5000 × 5000**

Large enough that the benefits—and limitations—of parallelization become apparent.

## Parallelizing the Work

The implementation follows a classic **Master–Worker** architecture.

The master process is responsible for:

- generating the input matrices;
- distributing rows of matrix **A**;
- broadcasting matrix **B**;
- collecting partial results.

Each worker receives only a subset of the rows and computes its corresponding portion of the output matrix.

Since each row of the result can be computed independently, the workload is naturally balanced with very little synchronization required during computation.

## Verifying Correctness

Performance is only meaningful if the results are correct.

To validate the implementation, I compared:

- the four corner values of the resulting matrix;
- a checksum of the entire matrix;
- the sequential and parallel outputs.

All executions produced identical results, giving confidence that the distributed computation behaved exactly like the sequential algorithm.

## Performance Results

I executed the parallel implementation using different numbers of MPI processes on the Atlântica cluster and compared them against the sequential baseline.

| Processes | Time (s) | Speedup |
|----------:|---------:|--------:|
| 1 | 3354.69 | 1.00× |
| 4 | 459.34 | 7.30× |
| 8 | 241.87 | 13.87× |
| 16 | 268.30 | 12.50× |

The most interesting result was the execution with **8 processes**, which reduced execution time from almost **56 minutes** to just over **4 minutes**.

## Superlinear Speedup?

One surprising observation was that the runs with 4 and 8 processes achieved a **speedup greater than the number of processes**.

At first glance this seems impossible, but it's actually a well-known phenomenon called **superlinear speedup**.

A likely explanation is improved cache utilization.

Instead of one process working with the entire dataset, each process manipulates only a fraction of the matrices. That smaller working set fits much better into the processor caches, reducing expensive memory accesses and allowing the application to outperform the theoretical linear expectation.

## When More Processes Stop Helping

Interestingly, moving from **8 to 16 processes** actually made the program slower.

The computation itself became smaller for each worker, but the overhead of:

- communication,
- synchronization,
- process management

started to dominate the total execution time.

This is a good reminder that adding more parallelism doesn't always improve performance. Every distributed program has a point where coordination costs begin to outweigh the benefits.

## Amdahl's Law in Practice

This experiment also illustrates **Amdahl's Law**.

Matrix multiplication is highly parallelizable, so most of the runtime benefits from additional processes. However, the sequential portions—data distribution, synchronization, and result collection—still place an upper bound on the achievable speedup.

In practice, the best performance came from finding the right balance between computation and communication rather than simply maximizing the number of processes.

## What I Learned

This project was my first opportunity to build and benchmark a distributed application using MPI.

Beyond implementing matrix multiplication itself, it reinforced several practical ideas:

- parallel algorithms are often simple—the communication isn't;
- speedup alone doesn't tell the whole story;
- cache effects can have a surprisingly large impact on performance;
- measuring and analyzing results is just as important as writing the code.

It was a fun exercise that connected concepts like MPI, scalability, cache locality, and Amdahl's Law into a single, practical project.
