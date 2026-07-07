---
title: "Solving Linear Systems in C"
date: "2026-07-07"
description: "Implementing Gaussian Elimination, Jacobi and Gauss-Seidel while modeling a probabilistic processor network."
tags: ["Numerical Methods", "C", "Linear Algebra", "Algorithms"]
readingTime: "5 min read"
featured: false
---

> **Source code:** [github.com/htaschne/linear-system-solvers](https://github.com/htaschne/linear-system-solvers)

This project began as an assignment for my **Numerical Methods** course.

The challenge was not simply implementing linear solvers. The assignment described a fictional "processor carousel", a probabilistic system where requests circulate between processors until they are eventually completed.

Once the model was established, the problem stopped looking like a story about processors and started looking like a linear algebra problem. The expected workload of each processor could be described by a system of linear equations, and solving that system became the core implementation task.

After finishing the assignment, I decided to clean up the repository, improve the documentation, and publish it as a small portfolio project. I wanted it to show more than a finished exercise: I wanted the code to be readable, organized, and useful as a reference for classic numerical methods.

## From Probabilities to Linear Algebra

The processor carousel is easier to understand intuitively than formally.

Each processor can receive work, pass part of that work to its neighbors, or complete a request. Those transitions are controlled by predefined probabilities. Over time, if the system stabilizes, every processor reaches an expected workload that no longer changes from one step to the next.

That steady state is what turns the problem into linear algebra.

Instead of simulating request after request, we can express the long-term behavior of the system as equations. Each equation describes one processor in terms of the probabilities around it and the workloads of its neighbors. Put together, those equations form a linear system.

From there, the question becomes practical: how should the system be solved?

## Three Different Approaches

I implemented three solvers so I could compare direct and iterative approaches on the same problem.

### Gaussian Elimination

Gaussian Elimination is a direct method. It transforms the system into triangular form and then solves it through back substitution.

What I like about this method is that it feels mechanical in the best way. Each step has a clear purpose: eliminate variables, simplify the system, and recover the solution.

It is also a good reminder that direct methods can be straightforward to reason about, but still require careful implementation details around indexing, pivoting, and numerical stability.

### Jacobi Iteration

Jacobi is an iterative method. Instead of transforming the whole system at once, it starts with an approximate solution and repeatedly improves it.

The important detail is that each new value is computed using values from the previous iteration. That makes the method conceptually clean: one full pass reads from the old estimate and writes a new one.

It also makes convergence visible. You can watch the approximation move toward the final solution as the residual gets smaller.

### Gauss-Seidel Iteration

Gauss-Seidel is similar to Jacobi, but it immediately reuses newly computed values during the same iteration.

That small difference changes the behavior of the algorithm. In many systems, Gauss-Seidel converges faster because each update can benefit from the work that just happened before it.

Implementing both methods side by side made the distinction much clearer than just reading about it. Jacobi feels like updating in snapshots; Gauss-Seidel feels like updating in place.

## Lessons Learned

This project was a useful reminder that mathematical models often become software engineering problems.

The math identifies the structure of the solution, but the implementation still has to answer practical questions: how to represent matrices, how to separate input parsing from solving, how to keep the algorithms understandable, and how to verify that the output is correct.

It also reinforced the value of separating modeling from implementation. The processor carousel defines the problem, but the solvers should not depend on that story. Once the matrix is built, Gaussian Elimination, Jacobi, and Gauss-Seidel can operate on the system as general algorithms.

That separation is what made the repository worth polishing. A university assignment can be more than a submission if the code is cleaned up, documented, and structured so someone else can learn from it.

## Repository

The full implementation is available on GitHub:

[github.com/htaschne/linear-system-solvers](https://github.com/htaschne/linear-system-solvers)

The repository includes:

- C implementation.
- Gaussian Elimination.
- Jacobi iteration.
- Gauss-Seidel iteration.
- An accompanying LaTeX report.
