---
title: Overfitting
aliases: [overfit, overfits, underfitting, underfit]
type: concept
track: ml
requires: [train-validation-test-split]
description: When a model learns the noise in its training data along with the real pattern, so it scores well in training and worse on new data.
depth: solid
sources:
  - https://hastie.su.domains/ElemStatLearn/
  - https://www.statlearning.com/
created: 2026-11-13
updated: 2026-11-13
---
<!-- read-first -->
> [!info] Read first
> [[train-validation-test-split|Train, validation and test split]]
<!-- /read-first -->

A model overfits when it fits its training data **too** well: it learns the random quirks of that particular sample
along with the real pattern. Its training score looks excellent, and its score on new data is worse. Underfitting is
the opposite: the model is too simple to capture the real pattern and does badly everywhere.

## How it works

Real labels are a true pattern plus noise. A flexible model (a deep decision tree, a high-degree polynomial,
k-nearest neighbours with k = 1, a large neural network trained too long) has enough freedom to bend through every
training point, noise included. The noise will be different in new data, so the bends that matched it are now wrong.

You detect it by comparing two numbers:

| Training error | Validation error | Diagnosis |
|---|---|---|
| High | High | Underfitting (too simple) |
| Low | Low, close to training | A good fit |
| Very low | Clearly higher | Overfitting (too flexible) |

The cures all reduce how much the model can bend, or give it more real pattern to learn from:

- more training data;
- a simpler model or fewer features;
- regularisation: a penalty on large weights (L1, L2), dropout, limits on tree depth;
- early stopping: stop training when validation error starts rising.

## Example

k-nearest neighbours predicts by averaging the labels of the k closest training points. With k = 1, every training
point predicts its own label, so training error is exactly zero. On a noisy sine curve with 40 training points, lesson
3 measured a validation error of 0.203 at k = 1 and 0.121 at k = 3. The model with perfect training error was the
worse one.

## Traps

- **A big gap is not always overfitting.** If test data comes from a different time or population than the training
  data, the gap can be distribution shift. Check the split before adding regularisation.
- **A suspiciously good validation score is not a good fit.** It is more often [[data-leakage|data leakage]].
- **Choosing among many models can overfit the [[train-validation-test-split|validation set]].** That is why the final number comes from a test set
  you did not use for choices.

## Related

[[bias-variance-trade-off|The bias-variance trade-off]] is the theory behind it. [[cross-validation|Cross-validation]]
gives a steadier estimate of validation error. Lesson: [[2026-11-13-overfitting|#3 · Overfitting and the bias-variance trade-off]].

## Check yourself

> [!question]- Training accuracy 99%, validation accuracy 72%. Name three things you could try.
> Get more training data, use a simpler model or fewer features, and add regularisation (an L2 penalty, dropout,
> a depth limit or early stopping). Compare them with validation or cross-validation, not training accuracy.

> [!question]- What does underfitting look like in the numbers?
> Training and validation error are both high and close together. The model cannot even fit the data it learned
> from, so it needs more flexibility or better features.

<!-- leads-to -->
## Leads to

- [[bias-variance-trade-off|Bias-variance trade-off]]: A model's error on new data comes from bias (too rigid), variance (too sensitive to its sample) and noise; making it more flexible trades one for the other.
<!-- /leads-to -->
