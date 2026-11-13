---
title: Train, validation and test split
aliases: [train/test split, training set, validation set, test set, holdout set]
type: concept
track: ml
description: Cutting labelled data into three groups - one to fit the model, one to choose between models, one to measure the final choice honestly.
depth: solid
sources:
  - https://scikit-learn.org/stable/modules/cross_validation.html
  - https://hastie.su.domains/ElemStatLearn/
created: 2026-11-13
updated: 2026-11-13
---

Before you train anything, you cut your labelled data into three groups that never overlap. Each answers a different
question, and mixing them up is the most common way to fool yourself about how good a model is.

## How it works

| Split | Question it answers | Typical share |
|---|---|---|
| **Training set** | What parameters fit this data? | 60-80% |
| **Validation set** | Which model, features and hyperparameters should I keep? | 10-20% |
| **Test set** | How well will my final choice do on data it has never seen? | 10-20% |

The model learns its parameters (weights, tree splits) from the training set only. You compare candidate models on
the validation set. When every decision is made, you run the chosen model on the test set **once** and report that
number.

The test set must be separate from the validation set because choosing is a kind of fitting. If you try 100 settings
and keep the best validation score, that score includes some luck that happened to suit those particular rows. The
test set took no part in any choice, so its score has no such luck built in.

When there is not much data, a single validation split is noisy. [[cross-validation|Cross-validation]] rotates the
validation role across several folds of the training data instead. The test set still stays outside.

## Example

```py run
import random

rows = list(range(100))          # stand-ins for 100 labelled examples
random.seed(42)                  # fixed seed: the same split every run
random.shuffle(rows)
train, val, test = rows[:70], rows[70:85], rows[85:]
print(len(train), len(val), len(test))          # 70 15 15
print(set(train) & set(val), set(val) & set(test))  # set() set()
```

Fix the seed so the split is the same every time you run the script; otherwise your "test set" quietly changes
between experiments and earlier numbers stop being comparable.

## Traps

- **Shuffling time-ordered data.** If rows have dates, split by date: train on the past, test on the future.
- **Related rows on both sides.** Several rows per user or patient must all land in the same split, or the model can
  recognise the user instead of learning the pattern.
- **Imbalanced classes.** With 2% positives, a random 15% split might hold very few. Use a stratified split, which
  keeps the class ratio the same in every group.
- **Fitting preprocessing before splitting.** That is [[data-leakage|data leakage]]: scalers, encoders and feature
  selection must be fitted on the training set only.

## Related

[[overfitting|Overfitting]] is what the validation set detects. [[bias-variance-trade-off|The bias-variance trade-off]]
explains why validation error first falls, then rises. Lesson: [[2026-11-13-overfitting|#3 · Overfitting and the bias-variance trade-off]].

## Check yourself

> [!question]- Why is the validation score of your best model usually a little too optimistic?
> Because you picked that model for having the best validation score. Some of its advantage is luck that suits those
> specific validation rows, and that luck will not repeat on new data. The untouched test set gives the honest number.

> [!question]- You have a year of daily data. Should you shuffle before splitting?
> No. Split by time so the model is trained on earlier days and evaluated on later ones, which is how it will be used.

<!-- leads-to -->
## Leads to

- [[cross-validation|Cross-validation]]: Estimating how well a model generalises by training it k times, each time holding out a different part of the training data, and averaging the scores.
- [[data-leakage|Data leakage]]: When information the model will not have at prediction time gets into training, so offline scores look better than real-world performance.
- [[overfitting|Overfitting]]: When a model learns the noise in its training data along with the real pattern, so it scores well in training and worse on new data.
<!-- /leads-to -->
