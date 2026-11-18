---
title: Top K Frequent Elements
type: puzzle
track: cs-fundamentals
description: "Return the k values that appear most often in a list, faster than sorting everything. LeetCode 347."
leetcode: https://leetcode.com/problems/top-k-frequent-elements/
pattern: hash-map-lookup
difficulty: medium
created: 2026-11-18
updated: 2026-11-18
---

## The problem

You get a list of integers and a number `k`. Return the `k` values that occur most often. The answer may be in any order, and you can assume it is unique (no tie decides who makes the cut).

Example: `nums = [1, 1, 1, 2, 2, 3]`, `k = 2` → `[1, 2]`. Value 1 appears three times, value 2 twice, value 3 once.

What matters: the list can hold up to 100,000 numbers, and the follow-up asks for something better than [[big-o-notation|O(n log n)]] time. ([on LeetCode](https://leetcode.com/problems/top-k-frequent-elements/))

## Think about

- Counting how often each value appears is a job you have seen in [[valid-anagram|Valid Anagram]]. What does that give you, and what does it cost?
- If you sort the counts, what is the cost? Do you need the full order, or only the top `k`?
- A value can appear at most `n` times. What could you use as an array index, so that no sorting is needed?

> [!tip]- Hint
> After counting, group the values by how many times they appeared. Then read the groups from the highest count down until you have `k` values.

## Solution

Arrives on the next lesson day.
