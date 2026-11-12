---
title: Two Sum
type: puzzle
track: cs-fundamentals
description: "Find the two positions whose numbers add up to a target, in one pass. LeetCode 1."
leetcode: https://leetcode.com/problems/two-sum/
pattern: hash-map-lookup
difficulty: easy
created: 2026-11-11
updated: 2026-11-11
---

## The problem

You get a list of whole numbers and a target number. Find the **two positions** whose numbers add up to the target,
and return those two positions. There is always exactly one answer, and you cannot use the same position twice.

Example: numbers `[3, 9, 4, 7]`, target `11` → answer `[2, 3]`, because 4 + 7 = 11.

What matters: the list can have up to 10,000 numbers, and numbers can be negative. The real question is: can you do
better than checking every pair? ([on LeetCode](https://leetcode.com/problems/two-sum/))

## Think about

- Checking every pair works. For 10,000 numbers, about how many pairs is that?
- When you stand on a number `x`, you already know exactly which other value would complete the answer. Which value?
- What data structure answers "have I already seen this value, and where?" instantly?

> [!tip]- Hint
> Walk through the list only once. Before you remember the current number, ask whether its partner (`target - x`) is
> already remembered.

## Solution

> [!success]- Open only after you have thought about it
> **Key idea:** for each number `x`, the partner you need is exactly `target - x`. Remember every number you have
> seen in a [[hash-map|dict]], and check for the partner in [[big-o-notation|O(1)]].
>
> **Pattern:** [[hash-map-lookup|hash map lookup]] ("complement lookup").
>
> **Why brute force is too slow:** checking every pair is about n²/2 comparisons, around 50 million for 10,000 numbers.
>
> **Steps:**
>
> 1. Make an empty dict `seen` that maps value → index.
> 2. Walk the list with the index `i` and value `x`.
> 3. If `target - x` is in `seen`, return `[seen[target - x], i]`.
> 4. Otherwise store `seen[x] = i` and keep going. Checking before storing stops you from using the same position twice.
>
> ```py run
> def two_sum(nums, target):
>     seen = {}                      # value -> index
>     for i, x in enumerate(nums):
>         need = target - x
>         if need in seen:
>             return [seen[need], i]
>         seen[x] = i
>     return []
>
> print(two_sum([3, 9, 4, 7], 11))            # [2, 3]
> print(two_sum([3, 3], 6))                   # [0, 1]
> print(two_sum([-1, -2, -3, -4, -5], -8))    # [2, 4]
> ```
>
> **Time:** O(n), one pass with O(1) average dict lookups. **Space:** O(n) for the dict.
>
> **Where else this shows up:** any "find a pair with a property" question, such as counting pairs with a given
> difference, or subarray sum equals K (store running sums instead of values).
