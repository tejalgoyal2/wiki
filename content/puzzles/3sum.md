---
title: 3Sum
aliases: [three sum]
type: puzzle
track: ml
description: "Find every group of three numbers in a list that add up to zero, with no group repeated. LeetCode 15."
leetcode: https://leetcode.com/problems/3sum/
pattern: two-pointers
difficulty: medium
created: 2026-11-24
updated: 2026-11-24
---

## The problem

You get a list of whole numbers. Find every group of three numbers, taken from three different positions, that add
up to zero. Return the groups as lists. The same group of values must not appear twice, and the order of the groups
and of the numbers inside a group does not matter.

Example: `[-1, 0, 1, 2, -1, -4]` gives `[[-1, -1, 2], [-1, 0, 1]]`. The value `-1` appears twice in the input, so
`[-1, 0, 1]` could be built two ways, but it is reported once.

What matters: the list has between 3 and 3,000 numbers, and they can be negative, zero or positive. Trying every
triple is far too slow at that size. ([on LeetCode](https://leetcode.com/problems/3sum/))

## Think about

- If you fix the first number, what problem is left for the other two? Have you solved it before this week?
- Sorting costs [[big-o-notation|O(n log n)]]. What does it give you that makes the leftover problem easy?
- How do you stop the same group from appearing twice when the input has repeated values?

> [!tip]- Hint
> Sort the list. For each first number, run [[two-sum-ii|Two Sum II]] on the numbers to its right, with the target
> set to minus the first number. Skip a first number if it equals the one before it, and skip repeated values after
> you record a group.

## Solution

Arrives on the next lesson day.
