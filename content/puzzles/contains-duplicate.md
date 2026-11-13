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

> [!success]- Open only after you have thought about it
> **Key idea:** walk the list once and keep a set of the values already passed. The moment the current value is
> already in the set, you have found a duplicate.
>
> **Pattern:** [[hash-map-lookup|hash map lookup]], in its simplest form: a "seen set" that only answers yes or no.
>
> **Why brute force is too slow:** comparing every pair is about n²/2 comparisons, roughly 5 billion for 100,000
> numbers. Sorting first and comparing neighbours works in [[big-o-notation|O(n log n)]], but it changes the input or needs a copy.
>
> **Steps:**
>
> 1. Make an empty set `seen`.
> 2. For each value `x`: if `x` is in `seen`, return `True`.
> 3. Otherwise add `x` to `seen` and keep going.
> 4. If the loop ends, every value was different: return `False`.
>
> ```py run
> def contains_duplicate(nums):
>     seen = set()
>     for x in nums:
>         if x in seen:          # seen it before: that's a duplicate
>             return True
>         seen.add(x)
>     return False
>
> print(contains_duplicate([4, 1, 7, 1]))      # True
> print(contains_duplicate([4, 1, 7]))         # False
> print(contains_duplicate([]))                # False
> print(contains_duplicate([-10**9, 10**9, -10**9]))  # True
>
> # The one-liner works too, but always builds the whole set before answering
> print(len(set([4, 1, 7, 1])) != 4)           # True
> ```
>
> **Time:** O(n) on average, since each set lookup and insert is O(1) on average, and the loop stops at the first
> duplicate. **Space:** O(n) for the set in the worst case (no duplicates).
>
> **Where else this shows up:** finding the first repeated character in a string, detecting a cycle by remembering
> visited nodes, de-duplicating events by ID in a data pipeline, and the "have I seen this window?" check in sliding
> window problems.
