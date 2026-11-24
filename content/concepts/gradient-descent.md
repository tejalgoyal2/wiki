---
title: Gradient descent
aliases: [gradient, gradients, stochastic gradient descent, SGD, batch gradient descent]
type: concept
track: ml
requires: [mean-squared-error]
description: An algorithm that finds good model parameters by repeatedly stepping in the direction that lowers the loss fastest, using the slope of the loss at the current point.
depth: solid
sources:
  - https://www.deeplearningbook.org/contents/numerical.html
  - https://www.statlearning.com/
  - https://scikit-learn.org/stable/modules/sgd.html
created: 2026-11-24
updated: 2026-11-24
---
<!-- read-first -->
> [!info] Read first
> [[mean-squared-error|Mean squared error]]
<!-- /read-first -->

**Gradient descent** minimises a loss by walking downhill. Picture the loss as a landscape where each parameter is a
direction on the map. At your current spot, the **gradient** (the vector of slopes, one per parameter) points uphill.
So you step the opposite way, then measure again.

## How it works

1. Start with any parameters (zeros or small random numbers).
2. Compute the gradient of the loss with respect to each parameter, over the training data.
3. Update each parameter: `p = p - learning_rate * gradient`.
4. Repeat until the loss stops falling.

The [[learning-rate|learning rate]] sets the step size. For a loss shaped like a bowl, which [[mean-squared-error|MSE]]
for a straight line is, there is one minimum and gradient descent reaches it if the rate is small enough.

Three flavours differ only in how much data feeds each gradient:

| Flavour | Data per step | Trade-off |
|---|---|---|
| Batch | All rows | Exact slope, slow when data is big |
| Stochastic (SGD) | One row | Very noisy, cheap, can escape poor spots |
| Mini-batch | A small group (32 to 1024) | The default for neural networks |

For [[linear-regression|linear regression]] you can also solve for the minimum directly (the normal equation). Gradient
descent matters because it works for models with no direct formula, such as neural networks, where the loss has many
valleys and the method finds a good one, not always the best.

## Example

```py run
# Minimise (w - 3)² + 1 by hand.
w = 0.0
for step in range(1, 6):
    grad = 2 * (w - 3)       # slope of the loss at w
    w -= 0.2 * grad
    print(step, round(w, 3))
# 1 1.2
# 2 1.92
# 3 2.352
# 4 2.611
# 5 2.767
```

Each step covers 40% of the remaining distance to 3, because the step is `0.2 * 2 * distance`. The steps shrink
by themselves as the slope flattens near the bottom.

## Traps

- Features on very different scales make the landscape a long narrow valley, and the path zigzags. Standardise first.
- A wrong gradient formula still trains, just badly. Check it against a numeric estimate: `(loss(w + h) - loss(w - h)) / (2h)`.
- Stopping at a flat spot is not the same as the best answer outside convex problems such as linear regression.

## Related

[[linear-regression|Linear regression]] is the first model to fit with it. See [[2026-11-24-linear-regression|lesson 9]].

## Check yourself

> [!question]- Why do we subtract the gradient instead of adding it?
> The gradient points in the direction the loss grows fastest. To make the loss smaller we go the opposite way.

> [!question]- What is the difference between batch gradient descent and SGD?
> Batch computes each gradient over all rows and is exact but slow on big data. SGD uses one row (or a mini-batch) per step, so each step is cheap and noisy.

<!-- leads-to -->
## Leads to

- [[learning-rate|Learning rate]]: The number that scales each gradient descent step. Too small and training crawls; too large and the loss jumps around or explodes.
- [[linear-regression|Linear regression]]: A model that predicts a number as a weighted sum of its inputs plus a constant, fitted by choosing the weights that make the squared errors smallest.
<!-- /leads-to -->
