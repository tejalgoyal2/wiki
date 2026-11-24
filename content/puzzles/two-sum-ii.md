---
title: Two Sum II
type: puzzle
track: python-data
description: "Find the two positions in a sorted list whose numbers add up to a target, using no extra memory. LeetCode 167."
leetcode: https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/
pattern: two-pointers
difficulty: medium
created: 2026-11-21
updated: 2026-11-24
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

> [!success]- Open only after you have thought about it
> **Key idea:** the list is sorted, so the sum of the two end numbers tells you which end to give up. If the sum is
> too small, the left number is too small for every partner still in range, so drop it. If the sum is too big, the
> right number is too big for every partner, so drop it. You never need to remember what you saw, so no dict.
>
> **Pattern:** [[two-pointers|two pointers]] from both ends.
>
> **Why brute force is too slow:** trying every pair is [[big-o-notation|O(n²)]], about 450 million pairs for 30,000
> numbers. The [[hash-map-lookup|dict]] answer from [[two-sum|Two Sum]] is O(n) in time but breaks the constant-memory
> rule. Binary search for each partner gives O(n log n) and still works, but two pointers is simpler and faster.
>
> **Steps:**
>
> 1. Set `left = 0` and `right = len(numbers) - 1`.
> 2. Add the two numbers. If the sum equals the target, return the positions plus one.
> 3. If the sum is smaller than the target, move `left` up. If it is larger, move `right` down.
>
> ```py run
> def two_sum(numbers, target):
>     left, right = 0, len(numbers) - 1
>     while left < right:
>         total = numbers[left] + numbers[right]
>         if total == target:
>             return [left + 1, right + 1]
>         if total < target:
>             left += 1
>         else:
>             right -= 1
>     return []
>
> print(two_sum([2, 7, 11, 15], 9))       # [1, 2]
> print(two_sum([2, 3, 4], 6))            # [1, 3]
> print(two_sum([-1, 0], -1))             # [1, 2]
> print(two_sum([-5, -3, 0, 4, 9], 1))    # [2, 4]
> ```
>
> **Time:** O(n). Each step moves one pointer inward, so there are at most n - 1 steps.
> **Space:** O(1): two integers.
>
> **Where else it shows up:** [[3sum|3Sum]] (today's puzzle) runs this exact loop once for each choice of the first
> number. Container With Most Water, removing duplicates from a sorted list, and merging two sorted lists use the same
> idea of two indexes that only move one way.
