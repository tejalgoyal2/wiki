---
title: Data leakage
aliases: [target leakage, train-test contamination]
type: concept
track: ml
requires: [train-validation-test-split]
description: When information the model will not have at prediction time gets into training, so offline scores look better than real-world performance.
depth: solid
sources:
  - https://doi.org/10.1145/2382577.2382579
  - https://scikit-learn.org/stable/common_pitfalls.html
  - https://doi.org/10.1016/j.patter.2023.100804
created: 2026-11-13
updated: 2026-11-13
---
<!-- read-first -->
> [!info] Read first
> [[train-validation-test-split|Train, validation and test split]]
<!-- /read-first -->

Data leakage is when a model learns from information it will not have when it is used for real. The offline
evaluation looks excellent; in production the model is much worse. It is the most common reason an ML result does
not hold up.

## How it works

The held-out score is only honest if the held-out rows had **no influence** on training, and if every feature is
something that would exist at the moment of a real prediction. Leakage breaks one of those two conditions.

| Kind | What happens | Fix |
|---|---|---|
| Preprocessing leakage | Scaling, imputing or feature selection fitted on all rows, test rows included | Fit on training rows only; use a `Pipeline` |
| Target leakage | A feature is a consequence of the label ("refund issued" when predicting fraud) | For each column, ask: would this exist at prediction time? |
| Temporal leakage | Random split on time-ordered data, so the model trains on the future | Split by time |
| Group leakage | Rows from the same person or object in both training and test | Split by group |
| Test-set tuning | Repeatedly checking the test score and adjusting | Decide on validation; touch test once |

## Example

Lesson 3 builds a dataset where the labels are coin flips and all 2,000 features are random noise. Selecting the 10
"best" features using every row, then testing on 20 held-out rows, gives 85% accuracy. Selecting them from the
training rows only gives 40%, which is what pure guessing on 20 rows can look like. Nothing in the data was real;
the 85% came entirely from letting the test labels choose the features.

## Traps

- **One feature dominates the importance chart.** That is often a leak, not a breakthrough. Look at what it records
  and when it is filled in.
- **IDs and timestamps can leak.** A patient ID or a row number can correlate with the label if data was collected or
  sorted by outcome.
- **The serving pipeline computes features differently.** If training used a field cleaned after the fact, and
  production sees the raw value, it is the same problem from the other side.

## In the wild

Kapoor and Narayanan found leakage behind many machine-learning results in published science that did not reproduce
([*Patterns*, 2023](https://doi.org/10.1016/j.patter.2023.100804)). In their case study on civil war prediction, the
claim that complex models beat logistic regression did not survive once the leakage was fixed.

## Related

[[leakage-in-data-mining|Leakage in data mining (Kaufman et al., 2012)]] is the classic paper on it.
[[cross-validation|Cross-validation]] needs the same care inside every fold. Lesson:
[[2026-11-13-overfitting|#3 · Overfitting and the bias-variance trade-off]].

## Check yourself

> [!question]- You fill missing ages with the mean age of the whole dataset, then split. Is that leakage?
> Yes, a mild one: the test rows helped compute the mean. Compute the mean on the training rows and use that same
> value to fill the validation and test rows.

> [!question]- A loan-default model uses "number of collection calls". Why is that suspicious?
> Collection calls happen after a borrower misses payments, which is part of defaulting. At the moment of deciding
> on a loan, the value does not exist yet, so the model is learning from the outcome.

<!-- leads-to -->
## Leads to

- [[leakage-in-data-mining|Leakage in data mining (Kaufman et al., 2012)]]: The classic paper that defines data leakage, shows how to avoid it by keeping training and prediction data separate, and how to detect it.
<!-- /leads-to -->
