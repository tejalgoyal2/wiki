---
title: Contains Duplicate
type: puzzle
track: cs-fundamentals
description: "Does any value appear twice? One pass with a set. LeetCode 217."
leetcode: https://leetcode.com/problems/contains-duplicate/
pattern: hash-map-lookup
difficulty: easy
created: 2026-11-12
updated: 2026-11-12
---

## The problem

You get a list of whole numbers. Return `True` if any value appears at least twice, and `False` if every value is
different.

Example: `[4, 1, 7, 1]` → `True` (1 appears twice). `[4, 1, 7]` → `False`.

What matters: the list can have up to 100,000 numbers, and they can be very large or negative, so you can't use them
as positions in a fixed-size array. ([on LeetCode](https://leetcode.com/problems/contains-duplicate/))

## Think about

- Comparing every pair works. For 100,000 numbers, roughly how many comparisons is that?
- If you sort the list first, where would two equal numbers end up? What does sorting cost?
- What do you need to remember about the numbers you have already walked past, and which structure answers "have I seen this?" in constant time?

> [!tip]- Hint
> [[two-sum|Two Sum]] used a [[hash-map|dict]] to remember values and where they were. Here you only need to remember the values.

## Solution

Arrives on the next lesson day. Think first.
