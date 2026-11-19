---
title: Product of Array Except Self
type: puzzle
track: cs-fundamentals
description: "For each position in a list, give the product of every other number, in O(n) time and without dividing. LeetCode 238."
leetcode: https://leetcode.com/problems/product-of-array-except-self/
pattern: prefix-sum
difficulty: medium
created: 2026-11-19
updated: 2026-11-19
---

## The problem

You get a list of integers. Build a new list of the same length where each position holds the product of all the
**other** numbers in the input, that is, everything except the number at that same position.

Example: `nums = [1, 2, 3, 4]` → `[24, 12, 8, 6]`. Position 0 gets `2 × 3 × 4 = 24`, position 1 gets `1 × 3 × 4 = 12`,
and so on.

What matters: the list has between 2 and 100,000 numbers, each between -30 and 30, and every answer fits in a
32-bit integer. You must run in O(n) time and you may **not** use division. The follow-up asks for O(1) extra space,
not counting the output list. ([on LeetCode](https://leetcode.com/problems/product-of-array-except-self/))

## Think about

- The obvious answer multiplies everything except one item, for every position. What is its
  [[big-o-notation|complexity]]?
- Dividing the total product by `nums[i]` would be one pass. Apart from being banned, which input breaks it?
- The product "everything except position i" splits into two parts. What are they, and can you reuse work between
  neighbouring positions?

> [!tip]- Hint
> Everything except position `i` is (everything to the left of `i`) times (everything to the right of `i`). One pass
> from the left can compute the first part for every position; one pass from the right, the second.

## Solution

Arrives on the next lesson day.
