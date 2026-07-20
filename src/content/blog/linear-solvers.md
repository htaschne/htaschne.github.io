---
title: "Solving Linear Systems in C"
date: "2026-04-01"
description: "Implementing Gaussian Elimination, Jacobi and Gauss-Seidel while modeling a probabilistic processor network."
tags: ["Numerical Methods", "C", "Linear Algebra", "Algorithms"]
readingTime: "5 min read"
tldr: "The processor carousel problem became much clearer after translating the probabilistic request flow into a system of linear equations. Implementing Gaussian Elimination, Jacobi, and Gauss-Seidel made it possible to compare direct and iterative approaches on the same model."
takeaways:
  - "The steady-state workload distribution can be represented as a linear system."
  - "Gaussian Elimination gives a direct solution, while Jacobi and Gauss-Seidel build approximations iteratively."
  - "The final repository presents the coursework as a clean C numerical methods project."
featured: false
---

> **Source code:** [github.com/htaschne/linear-system-solvers](https://github.com/htaschne/linear-system-solvers)

This one began as a **Numerical Methods** assignment and then refused to stay as just an assignment.

The prompt described a fictional "processor carousel", which is a very assignment-looking way to say: requests move between processors with certain probabilities until they eventually finish.

At first I treated it like a simulation problem. Then the model clicked into place and it became a linear algebra problem. Each processor had an expected workload, each workload depended on its neighbors, and the whole thing turned into a system of equations.

After submitting it, I went back and cleaned up the repository. The original version worked, but it had that "written under deadline pressure" energy. I wanted the public version to be readable enough that future me could open it without immediately apologizing to myself.

## From Probabilities to Linear Algebra

The processor carousel is easier to reason about once you stop imagining actual processors.

Each processor can receive work, pass some of it to neighboring processors, or complete a request. The probabilities are fixed. If the system stabilizes, each processor reaches an expected workload that stops changing.

That steady state is the door into linear algebra.

Instead of simulating request after request, I could write one equation per processor. Each equation describes one workload in terms of the probabilities around it and the workloads of nearby processors.

Once the matrix exists, the story disappears. Now it is just:

```text
Ax = b
```

At that point the project became less about the carousel and more about how to solve the system cleanly in C.

## Three Different Approaches

I implemented three solvers because the assignment asked for them, but also because comparing them side by side made the methods less abstract.

### Gaussian Elimination

Gaussian Elimination is the direct one. Transform the system into triangular form, then solve it with back substitution.

I like how mechanical it feels. Eliminate a variable. Move to the next row. Keep going. Then walk backward and recover the solution.

Of course, "mechanical" does not mean "hard to mess up." Indexing still matters. Pivoting matters. Numerical stability is always waiting in the corner. C will also happily let you write nonsense if you ask politely.

### Jacobi Iteration

Jacobi felt different because it does not try to solve everything at once.

Start with a guess. Compute a better guess. Repeat. Each new value uses values from the previous iteration, so the implementation naturally separates "old" and "new" arrays.

This made convergence visible in a way I liked. You can watch the residual shrink and see the approximation crawl toward the answer.

### Gauss-Seidel Iteration

Gauss-Seidel is Jacobi's slightly impatient sibling.

It reuses newly computed values immediately during the same iteration. That small change can make it converge faster, because each update benefits from the work that just happened.

Implementing both methods made the difference much clearer than reading the definitions. Jacobi feels like updating in snapshots. Gauss-Seidel feels like updating in place.

I probably understood that before writing the code, but I did not really feel it until I had both loops in front of me.

## Lessons Learned

The main lesson was that the math is only half the project.

The model tells you that a linear system exists. The implementation still has to answer all the annoying practical questions: how to store matrices, how to parse input, how to separate the problem setup from the solvers, and how to check that the output is not quietly wrong.

The cleanup after the assignment was useful because it forced that separation. The processor carousel defines one problem, but the solvers should not know or care about the story. Once `A` and `b` are built, Gaussian Elimination, Jacobi, and Gauss-Seidel can just operate on the system.

If I were doing it again, I would add more tests around edge cases and probably spend more time on pivoting behavior. Past me was focused on getting the methods working. Present me is more suspicious of numerical code that only passes the happy path.

## Repository

The cleaned-up implementation is available here:

[github.com/htaschne/linear-system-solvers](https://github.com/htaschne/linear-system-solvers)

It includes:

- C implementation.
- Gaussian Elimination.
- Jacobi iteration.
- Gauss-Seidel iteration.
- An accompanying LaTeX report.
