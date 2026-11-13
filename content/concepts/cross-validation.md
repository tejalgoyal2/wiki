---
title: Cross-validation
aliases: [k-fold cross-validation, k-fold]
type: concept
track: ml
requires: [train-validation-test-split]
description: Estimating how well a model generalises by training it k times, each time holding out a different part of the training data, and averaging the scores.
depth: solid
sources:
  - https://scikit-learn.org/stable/modules/cross_validation.html
  - https://hastie.su.domains/ElemStatLearn/
created: 2026-11-13
updated: 2026-11-13
---
<!-- read-first -->
> [!info] Read first
> [[train-validation-test-split|Train, validation and test split]]
<!-- /read-first -->

One validation split gives one noisy number: a lucky or unlucky split can move it a lot. Cross-validation uses all of
the training data for validation, one part at a time, and averages the results.

## How it works

k-fold cross-validation:

1. Split the training data into k equal parts (folds). Five or ten is common.
2. For each fold: train on the other k - 1 folds, score on this one.
3. Report the mean of the k scores, and their spread.

Every row is used for validation exactly once and for training k - 1 times. The [[train-validation-test-split|test set]] is **not** part of this; it
stays aside for the final measurement.

Variants for data that is not independent:

| Variant | Use when |
|---|---|
| Stratified k-fold | Classes are imbalanced: keeps the class ratio the same in every fold |
| Group k-fold | Several rows belong to one user or patient: keeps each group inside one fold |
| Time series split | Rows are ordered in time: each fold trains on the past and validates on what follows |

## Example

```py run
def k_fold_indices(n, k):
    fold = n // k
    for i in range(k):
        start, stop = i * fold, (i + 1) * fold if i < k - 1 else n
        val = list(range(start, stop))
        train = [j for j in range(n) if j < start or j >= stop]
        yield train, val

for train, val in k_fold_indices(10, 3):
    print("validate on", val, "| train on", len(train), "rows")
# validate on [0, 1, 2] | train on 7 rows
# validate on [3, 4, 5] | train on 7 rows
# validate on [6, 7, 8, 9] | train on 6 rows
```

In real code, use scikit-learn's `KFold` or `cross_val_score`, and shuffle first unless the order carries meaning.

## Traps

- **Preprocessing outside the folds leaks.** Scaling or selecting features on all the training data, then
  cross-validating, lets each validation fold shape its own preprocessing. Put the steps in a `Pipeline` so they are
  refitted inside every fold. See [[data-leakage|data leakage]].
- **Tuning and reporting on the same folds is optimistic.** If you also need an honest score from cross-validation
  alone, use nested cross-validation: an inner loop to tune, an outer loop to score.
- **It costs k times the training.** For large models or datasets, a single validation split is often good enough.

## Related

[[overfitting|Overfitting]] is what it measures. Lesson: [[2026-11-13-overfitting|#3 · Overfitting and the bias-variance trade-off]].

## Check yourself

> [!question]- Why report the spread of the k scores and not only the mean?
> The spread shows how much the estimate depends on which rows were held out. Two models whose means differ by less
> than that spread may not really be different.

> [!question]- Your data has 20 rows per customer. Which kind of cross-validation do you use, and why?
> Group k-fold by customer. Otherwise the same customer appears in training and validation folds, and the model can
> score well by recognising customers instead of learning the pattern.
