---
title: "Estimating the Maximum Height of a Projectile with Newton Interpolation"
date: "2026-07-07"
description: "Using Newton's divided differences to reconstruct a projectile's trajectory from discrete measurements."
tags: ["Numerical Methods", "Python", "Interpolation", "Mathematics"]
tldr: "Newton interpolation turned a small set of projectile measurements into a polynomial model that could be used to estimate the projectile's maximum height. The project connected divided differences, polynomial interpolation, and numerical optimization in a compact implementation."
takeaways:
  - "Divided differences provide the coefficients of the Newton polynomial."
  - "The interpolation model made it possible to estimate behavior between measured points."
  - "The project was cleaned up into a public implementation with an accompanying LaTeX report."
featured: false
---

> **Source code:** [github.com/htaschne/newton-interpolation](https://github.com/htaschne/newton-interpolation)

Sometimes the most interesting part of a problem isn't finding an answer—it's reconstructing the function that produced the data.

While taking **Numerical Methods**, I was given a simple challenge: estimate the maximum height reached by an artillery projectile. The catch was that there was no equation describing its trajectory. Instead, only a handful of measurements were available.

| Time (s) | Height (m) |
|---------:|-----------:|
| 0 | 1.5 |
| 3 | 1007 |
| 7 | 2075 |
| 10 | 2670 |
| 14 | 3190 |
| 29 | 2339 |
| 31 | 1892 |

Without an explicit function, the first step was to build one.

## Newton Interpolation

I used **Newton's divided differences interpolation**, which constructs a polynomial passing exactly through every measured point.

Unlike expanding a polynomial directly, Newton's form builds it incrementally:

- compute the divided differences table;
- extract the coefficients from the first row;
- evaluate the polynomial efficiently for any value of *t*.

The result was a sixth-degree polynomial, since seven sample points were available.

## Finding the Maximum

Once the interpolation polynomial was available, the problem became much more familiar.

The highest point of the trajectory occurs when

$$
h'(t)=0
$$

Rather than differentiating everything symbolically, I evaluated the polynomial and approximated its derivatives numerically, then applied **Newton's Method** to solve for the root of the first derivative.

Starting from an initial guess near the visible peak, the algorithm quickly converged.

## Result

The estimated maximum occurred at approximately

- **Time:** 18.652473 s
- **Height:** 3402.236046 m

Considering that the original problem only provided discrete measurements, it was satisfying to recover a smooth approximation of the trajectory and use it to estimate quantities that weren't directly given.

## Verifying the Implementation

One simple but important check was ensuring that the interpolation actually reproduced the original measurements.

Evaluating the polynomial at each known time produced the exact heights from the dataset, confirming that the divided differences table had been constructed correctly.

## Comparing with ChatGPT

As part of the assignment, I also asked ChatGPT to solve the same problem using the provided data.

Interestingly, both approaches converged to exactly the same estimated maximum:

| Quantity | Result |
|----------|--------|
| Time of maximum height | **18.652473 s** |
| Maximum height | **3402.236046 m** |

While that doesn't prove the interpolation is physically perfect, it provided additional confidence that the implementation was correct.

## Takeaways

This exercise was a great reminder that numerical methods often begin with incomplete information. Instead of working from equations, we work from observations.

Newton interpolation is elegant because it transforms a collection of discrete samples into a function that can be analyzed just like any analytical model. Once the polynomial exists, techniques like root finding, differentiation, and optimization become available.

It's a small example, but one that illustrates how interpolation and numerical optimization complement each other.
