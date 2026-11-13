---
title: "Leakage in data mining (Kaufman et al., 2012)"
aliases: [Kaufman et al.]
type: reference
track: ml
requires: [data-leakage]
description: The classic paper that defines data leakage, shows how to avoid it by keeping training and prediction data separate, and how to detect it.
sources:
  - https://doi.org/10.1145/2382577.2382579
created: 2026-11-13
updated: 2026-11-13
---
<!-- read-first -->
> [!info] Read first
> [[data-leakage|Data leakage]]
<!-- /read-first -->

**What it is:** "Leakage in data mining: formulation, detection, and avoidance" by Shachar Kaufman, Saharon Rosset,
Claudia Perlich and Ori Stitelman, published in *ACM Transactions on Knowledge Discovery from Data*, volume 6, issue 4
(December 2012). Several of the authors had won data mining competitions and seen leakage up close.

**Read:** the abstract and introduction first, for the definition and the competition examples (the INFORMS 2010 Data
Mining Challenge and the IJCNN 2011 Social Network Challenge are named in the abstract). Then the section on avoiding
leakage, which is the part you can apply at work.

**What it settles:**

- **A definition.** Leakage is information about the target that should not legitimately be available to learn from.
  The test is not "is this column correlated with the label?" but "would the model have this when it makes a real
  prediction?".
- **It is broader than a bad column.** The paper covers cases where rows are not independent of each other, such as
  related records on both sides of a split, which a simple feature check misses.
- **Avoidance is a data-management habit.** Record when each piece of data became available, and keep the data used
  for learning separate from the data used for prediction ("learn-predict separation").
- **Detection is possible after the fact,** for example by looking for features that are suspiciously predictive,
  when you did not control how the data was collected.

**Who relies on it:** [[data-leakage]], [[train-validation-test-split]], [[cross-validation]].
