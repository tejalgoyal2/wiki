---
title: Linear regression
aliases: [linear model, least squares, ordinary least squares, OLS, linear fit, line of best fit]
type: concept
track: ml
requires: [mean-squared-error, gradient-descent]
description: A model that predicts a number as a weighted sum of its inputs plus a constant, fitted by choosing the weights that make the squared errors smallest.
depth: solid
sources:
  - https://www.statlearning.com/
  - https://hastie.su.domains/ElemStatLearn/
  - https://scikit-learn.org/stable/modules/linear_model.html#ordinary-least-squares
created: 2026-11-24
updated: 2026-11-24
---
<!-- read-first -->
> [!info] Read first
> [[mean-squared-error|Mean squared error]] · [[gradient-descent|Gradient descent]]
<!-- /read-first -->

**Linear regression** predicts a number from one or more inputs as a weighted sum: `prediction = w1*x1 + w2*x2 + ... + b`.
With one input this is a straight line, where `w` is the **slope** and `b` is the **intercept**. "Fitting" means
choosing `w` and `b` so the [[mean-squared-error|mean squared error]] on the training data is as small as possible.

## How it works

You can find the best weights two ways, and they agree:

- **Closed form.** For one input, `w = sum((x - mean_x) * (y - mean_y)) / sum((x - mean_x)²)` and
  `b = mean_y - w * mean_x`. For many inputs it is the normal equation, `w = (XᵀX)⁻¹ Xᵀy`. Exact, but the matrix work
  grows quickly with the number of features.
- **[[gradient-descent|Gradient descent]].** Start anywhere and step downhill. Slower for small problems, but it scales
  to huge data and is the same method that trains neural networks.

The model "is linear" in its **weights**, not necessarily in the raw inputs. Adding a squared input `x²` as a new
column still gives a linear model.

The classic assumptions: the relationship is roughly linear, errors are independent with similar spread
(**homoscedasticity**), and for reliable confidence intervals, roughly normal. Inputs that are copies of each other
(**multicollinearity**) make the individual weights unstable even when predictions are fine.

## Example

```py run
xs = [1, 2, 3, 4, 5]
ys = [3, 5, 4, 7, 6]
n = len(xs)
mx, my = sum(xs) / n, sum(ys) / n
w = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / sum((x - mx) ** 2 for x in xs)
b = my - w * mx
print(round(w, 3), round(b, 3))    # 0.8 2.6
print(round(w * 6 + b, 3))         # 7.4   the prediction for x = 6
```

## Traps

- One outlier can tilt the whole line, because squared error punishes big misses.
- Predicting far outside the range of the training inputs (extrapolating) trusts the line where it has seen nothing.
- Correlation in the data is not a cause; a weight is a pattern in the sample, not a lever.
- Many features and few rows overfit; see [[overfitting|overfitting]].

## Related

Built step by step in [[2026-11-24-linear-regression|lesson 9]]. Its sibling for yes/no answers is logistic regression
(lesson 15). Measure it honestly with a [[train-validation-test-split|train/validation/test split]].

## Check yourself

> [!question]- What does R² = 0.64 mean?
> The line explains 64% of the variation in the target around its mean. The other 36% is left over as error. It compares the model with always predicting the mean.

> [!question]- Is `y = w1*x + w2*x²` a linear model?
> Yes. It is linear in the weights `w1` and `w2`; the `x²` is just a second input column.
