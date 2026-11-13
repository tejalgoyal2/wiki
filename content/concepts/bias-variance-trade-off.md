---
title: Bias-variance trade-off
aliases: [bias-variance tradeoff, bias and variance, bias-variance decomposition]
type: concept
track: ml
requires: [overfitting]
description: A model's error on new data comes from bias (too rigid), variance (too sensitive to its sample) and noise; making it more flexible trades one for the other.
depth: solid
sources:
  - https://hastie.su.domains/ElemStatLearn/
  - https://www.statlearning.com/
  - https://doi.org/10.1162/neco.1992.4.1.1
created: 2026-11-13
updated: 2026-11-13
---
<!-- read-first -->
> [!info] Read first
> [[overfitting|Overfitting]]
<!-- /read-first -->

Imagine training the same kind of model many times, each time on a fresh sample of data. **Bias** is how far its
average prediction is from the truth. **Variance** is how much its predictions jump around from one sample to the
next. A rigid model has high bias and low variance; a flexible one has the reverse. The best model sits where their
total is smallest.

## How it works

If labels are `y = f(x) + noise`, the expected squared error of a trained model at a point `x` splits exactly into
three parts (*The Elements of Statistical Learning*, section 7.3):

```
expected error = bias² + variance + irreducible noise
```

| Part | Example of a model where it is large |
|---|---|
| Bias² | A straight line fitted to a curve: wrong the same way on every sample |
| Variance | A 1-nearest-neighbour model or a very deep tree: changes a lot with each sample |
| Irreducible noise | Present for every model: no model can predict random noise in the labels |

As flexibility grows, bias falls and variance rises. Validation error therefore traces a U shape: high on the left
(underfitting), lowest in the middle, rising on the right ([[overfitting]]). More training data lowers variance
without raising bias, which is why more data helps flexible models most.

The decomposition is exact for squared error. For other losses, such as classification accuracy, the same intuition
holds, but the maths does not split as cleanly.

## Example

| Model | Bias | Variance |
|---|---|---|
| Predict the training mean everywhere | High | Very low |
| Linear regression on a curved pattern | High | Low |
| k-nearest neighbours, k = 1 | Low | High |
| One deep decision tree | Low | High |
| Random forest (many trees averaged) | Low | Lower than one tree |

The last row is a useful idea: averaging many high-variance models trained on different samples (bagging) cancels
much of their variance while keeping their low bias.

## Traps

- **"Bias" here is not fairness bias.** It means systematic error of the model family, not discrimination against
  a group. Interviews sometimes test whether you mix them up.
- **Very large models do not always follow the U.** Heavily over-parameterised networks can see test error fall
  again past the point where they fit training data perfectly ("double descent"). The classic U is still the right
  first answer, and the right way to choose is still validation error.

## Related

[[train-validation-test-split|Train, validation and test split]] and [[cross-validation|cross-validation]] are how you
find the bottom of the U in practice. Lesson: [[2026-11-13-overfitting|#3 · Overfitting and the bias-variance trade-off]].

## Check yourself

> [!question]- Why does a random forest usually beat a single deep decision tree?
> A deep tree has low bias but high variance. Averaging many trees, each trained on a different bootstrap sample,
> cancels much of that variance while keeping the low bias.

> [!question]- Adding more training data helps which part of the error, and which part never changes?
> More data mainly lowers variance. The irreducible noise in the labels never changes, whatever the model or data size.
