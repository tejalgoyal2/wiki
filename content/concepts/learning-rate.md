---
title: Learning rate
aliases: [step size, learning rates, alpha (learning rate)]
type: concept
track: ml
requires: [gradient-descent]
description: The number that scales each gradient descent step. Too small and training crawls; too large and the loss jumps around or explodes.
depth: solid
sources:
  - https://www.deeplearningbook.org/contents/optimization.html
  - https://developers.google.com/machine-learning/crash-course/linear-regression/hyperparameters
created: 2026-11-24
updated: 2026-11-24
---
<!-- read-first -->
> [!info] Read first
> [[gradient-descent|Gradient descent]]
<!-- /read-first -->

The **learning rate** is the size of each step in [[gradient-descent|gradient descent]]. The update is
`parameter = parameter - learning_rate * gradient`. The gradient says which way is downhill and how steep it is; the
learning rate decides how far to go that way.

## How it works

You set it before training, so it is a **hyperparameter**: the model does not learn it. There are three regimes:

| Learning rate | What the loss does |
|---|---|
| Too small | Falls slowly, so training takes very long and may stop early |
| About right | Falls quickly, then settles near the minimum |
| Too large | Overshoots the minimum, bounces from side to side, or grows without limit |

Why large rates explode: near a bowl-shaped minimum, the gradient grows with the distance from it. A big step lands
further away than you started, where the gradient is bigger still, so the next step is bigger again.

The right value depends on the **scale of the features**. A feature measured in thousands makes the gradient thousands
of times larger, so the same rate that works for a feature between 0 and 1 now diverges. This is why you standardise
features before gradient descent.

Common practice: try values on a log scale (0.1, 0.01, 0.001), watch the loss curve, and lower the rate during
training (a **schedule**) or use an optimiser such as Adam that adapts it per parameter.

## Example

The loss `(w - 3)²` has its minimum at `w = 3`, and its gradient is `2 * (w - 3)`. Start at 0 and take five steps:

```py run
def run(lr, steps=5):
    w = 0.0
    for _ in range(steps):
        w -= lr * 2 * (w - 3)
    return round(w, 3)

print(run(0.1))    # 2.017   slow but heading the right way
print(run(0.5))    # 3.0     lands on the minimum in one step
print(run(1.0))    # 6.0     jumps 0 -> 6 -> 0 -> 6, never settles
print(run(1.1))    # 10.465  each step overshoots by more: diverging
```

For this loss, any rate above 1.0 diverges. For a real model the limit depends on the data, which is why you watch
the loss and do not trust one setting.

## Traps

- Reading a falling loss as success. A tiny rate also gives a falling loss, just too slowly to finish.
- Forgetting to scale features, then blaming the model when the loss becomes `nan` or `inf`.
- Tuning the rate on the test set. Use a validation set ([[train-validation-test-split|splits]]).

## Related

[[gradient-descent|Gradient descent]] uses it. [[mean-squared-error|Mean squared error]] is the loss it is
usually applied to first. See [[2026-11-24-linear-regression|lesson 9]] for a run on real numbers.

## Check yourself

> [!question]- Your training loss goes to `nan` after a few steps. What is the first thing to try?
> Lower the learning rate (for example by 10 times) and standardise the features. A rate that is too large makes each step overshoot further, until the numbers overflow.

> [!question]- Is the learning rate learned during training?
> No. It is a hyperparameter you choose before training. Optimisers such as Adam adjust the effective step size, but they still start from a rate you set.
