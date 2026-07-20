---
title: "Estimating the Maximum Height of a Projectile with Newton Interpolation"
date: "2026-06-01"
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

This started as a Numerical Methods assignment, which is usually how these things sneak onto my GitHub.

The problem looked simple enough: estimate the maximum height reached by a projectile. The annoying part was that there was no function for the trajectory. Just a few measured points and the expectation that I would somehow turn them into an answer.

So the first job was not finding the maximum.

It was inventing a reasonable function from the data.

| Time (s) | Height (m) |
|---------:|-----------:|
| 0 | 1.5 |
| 3 | 1007 |
| 7 | 2075 |
| 10 | 2670 |
| 14 | 3190 |
| 29 | 2339 |
| 31 | 1892 |

Seven points. No equation. Enough information to make the problem interesting, but not enough to pretend this was physics in a clean vacuum.

## Newton Interpolation

I used **Newton's divided differences interpolation** to build a polynomial that passes through every provided point.

The nice part of Newton's form is that it builds the polynomial incrementally. I did not have to start by expanding some giant expression by hand, which is good because past me has made enough indexing mistakes for one semester.

- compute the divided differences table;
- extract the coefficients from the first row;
- evaluate the polynomial efficiently for any value of *t*.

Because there were seven sample points, the interpolating polynomial ended up degree six.

That sounds a little dramatic for a projectile, and it is. This is not a perfect physical model. It is a numerical reconstruction from sparse data. But for the assignment, that was exactly the point: take incomplete measurements and make them usable.

## Finding the Maximum

Once the polynomial existed, the problem changed shape.

Instead of staring at a table of heights, I could ask the usual calculus question: where does the derivative become zero?

The highest point of the trajectory occurs when

$$
h'(t)=0
$$

I could have differentiated everything symbolically, but I was already writing code and did not feel like turning the project into an algebra cleanup exercise. So I evaluated the polynomial, approximated derivatives numerically, and used **Newton's Method** to find the root of the first derivative.

Starting near the visible peak, it converged quickly.

Honestly, this was the satisfying part. The table became a polynomial, the polynomial became a derivative, and the derivative gave back a time. Small numerical methods pipeline, but it actually felt like one.

## Result

The estimated maximum occurred at approximately

- **Time:** 18.652473 s
- **Height:** 3402.236046 m

That number is not magic. It is the maximum of the interpolated polynomial, not a guarantee about the real projectile. Still, given only seven samples, getting a smooth curve and a plausible peak out of it was pretty neat.

## Verifying the Implementation

The first version of the code produced a number, which is always dangerous because numbers look official even when the program is wrong.

So I added the obvious sanity check: evaluate the polynomial at the original sample times and make sure it returns the original heights.

If the interpolation cannot reproduce the points it was built from, everything after that is just confidently wrong.

That check passed, which made me trust the divided differences table enough to move on.

## Comparing with ChatGPT

The assignment also asked for a comparison with ChatGPT, so I gave it the same data and asked for the estimate.

Both approaches landed on the same values:

| Quantity | Result |
|----------|--------|
| Time of maximum height | **18.652473 s** |
| Maximum height | **3402.236046 m** |

That does not prove the model is physically perfect. It does suggest that my implementation and the independent calculation were doing the same thing, which is the kind of boring agreement I like in numerical code.

## Takeaways

The thing I liked about this assignment is that it started with missing information.

There was no clean function. There were only observations. Newton interpolation gave me a way to turn those observations into something I could evaluate, differentiate, and optimize.

If I were doing this again outside an assignment, I would be more careful about the modeling assumptions and probably compare interpolation choices. A sixth-degree polynomial can behave badly outside the sampled range, and it is very easy to forget that when the output looks precise.

Still, as a compact project, it connected the pieces nicely: divided differences, polynomial evaluation, numerical derivatives, Newton's Method, and verification. Not bad for a table of seven points.
