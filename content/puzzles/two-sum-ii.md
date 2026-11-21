---
title: Two Sum II
type: puzzle
track: python-data
description: "Find the two positions in a sorted list whose numbers add up to a target, using no extra memory. LeetCode 167."
leetcode: https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/
pattern: two-pointers
difficulty: medium
created: 2026-11-21
updated: 2026-11-21
---

## The problem

You get a list of whole numbers **already sorted from smallest to largest**, and a target. Find the two positions
whose numbers add up to the target. Return them counting from 1, smaller position first. Exactly one answer exists,
and you may not use the same position twice. Your solution must use only a constant amount of extra memory.

Example: numbers `[2, 7, 11, 15]`, target `9` returns `[1, 2]`, because 2 + 7 = 9.

What matters: the list can have up to 30,000 numbers, and numbers can be negative. The extra-memory rule rules out
the [[hash-map|dict]] you used for [[two-sum|Two Sum]]. ([on LeetCode](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/))

## Think about

- Two Sum used a dict. Which fact about this input lets you drop the dict?
- Stand on the smallest and the largest number. If their sum is too big, which of the two can never be part of the
  answer?
- How many steps can the two positions take in total before they meet?

> [!tip]- Hint
> Put one index at each end. If the sum is too small, the left number is too small for every partner, so move left
> up. If it is too big, move right down.

## Solution

Arrives on the next lesson day.
