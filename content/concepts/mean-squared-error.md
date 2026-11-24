---
title: Mean squared error
aliases: [MSE, loss function, loss functions, squared error, sum of squared errors]
type: concept
track: ml
requires: [overfitting]
description: The average of the squared gaps between a model's predictions and the true values, used as the score a regression model tries to make small.
depth: solid
sources:
  - https://www.statlearning.com/
  - https://scikit-learn.org/stable/modules/model_evaluation.html#mean-squared-error
created: 2026-11-24
updated: 2026-11-24
---
<!-- read-first -->
> [!info] Read first
> [[overfitting|Overfitting]]
<!-- /read-first -->

A **loss function** turns "how wrong is this model?" into one number, so a computer can try to make it smaller.
**Mean squared error** (MSE) is the most common loss for predicting a number: take each prediction's error, square it,
and average over all examples.

```
MSE = (1/n) * sum of (prediction - truth)²
```

## How it works

Squaring does three things. It makes every error positive, so a +3 and a -3 do not cancel. It punishes big errors far
more than small ones: an error of 10 costs 100, ten errors of 1 cost 10 in total. And it is smooth, so the slope of
the loss exists everywhere, which is what [[gradient-descent|gradient descent]] needs.

Reading the number: MSE is in squared units (dollars², degrees²). Take the square root to get **RMSE**, which is in
the original units and reads as "a typical error". Mean absolute error (MAE) skips the squaring, so it treats all
errors in proportion and is less pulled by outliers.

| Loss | Formula | Reacts to outliers | Smooth |
|---|---|---|---|
| MSE | mean of error² | Strongly | Yes |
| MAE | mean of abs(error) | Weakly | Not at 0 |
| Huber | squared for small errors, linear for big | Weakly | Yes |

MSE also has a statistical reason. If the noise around the true line follows a normal (bell) distribution, the line that
minimises MSE is the maximum-likelihood line. That is one reason [[linear-regression|linear regression]] uses it.

## Example

```py run
truth = [3, 5, 4, 7, 6]
guess = [3, 5, 4, 7, 16]          # one prediction is off by 10

errors = [g - t for g, t in zip(guess, truth)]
mse = sum(e * e for e in errors) / len(errors)
mae = sum(abs(e) for e in errors) / len(errors)
print(mse, mse ** 0.5)            # 20.0 4.47213595499958
print(mae)                        # 2.0
```

One bad prediction gives an MSE of 20, though four of five are perfect. MAE says 2. Which one you want depends on
whether a big miss is much worse than several small ones.

## Traps

- A low training MSE says nothing about new data; compare it with the validation MSE ([[overfitting|overfitting]]).
- MSE is not comparable across targets with different units or scales. Use RMSE, or R², which compares to a baseline.
- Outliers can dominate it. Check the biggest errors before trusting the average.

## Related

[[linear-regression|Linear regression]] minimises it. [[gradient-descent|Gradient descent]] follows its slope. The
lesson that builds it from scratch is [[2026-11-24-linear-regression|#9 · Linear regression from scratch]].

## Check yourself

> [!question]- Why square the errors instead of just averaging them?
> Plain errors of opposite sign cancel, so a bad model could score zero. Squaring makes every error count, punishes large errors more, and gives a smooth slope.

> [!question]- A model's MSE is 25 on house prices in thousands of dollars. What is a typical error?
> About 5 thousand dollars, the square root (RMSE). MSE is in squared units, so it is hard to read directly.

<!-- leads-to -->
## Leads to

- [[2026-11-24-linear-regression|#9 · Linear regression from scratch]]: Fit a straight line to data in plain Python, first with a formula and then with gradient descent, and learn what the loss, the learning rate and the assumptions do.
- [[gradient-descent|Gradient descent]]: An algorithm that finds good model parameters by repeatedly stepping in the direction that lowers the loss fastest, using the slope of the loss at the current point.
- [[linear-regression|Linear regression]]: A model that predicts a number as a weighted sum of its inputs plus a constant, fitted by choosing the weights that make the squared errors smallest.
<!-- /leads-to -->
