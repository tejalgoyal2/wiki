---
title: Top K Frequent Elements
type: puzzle
track: cs-fundamentals
description: "Return the k values that appear most often in a list, faster than sorting everything. LeetCode 347."
leetcode: https://leetcode.com/problems/top-k-frequent-elements/
pattern: hash-map-lookup
difficulty: medium
created: 2026-11-18
updated: 2026-11-19
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

> [!success]- Open only after you have thought about it
> **Key idea:** a value can appear at most `n` times, so the counts are small whole numbers. Use each count as an
> **index** into a list of buckets, then read the buckets from the top. No sorting needed.
>
> **Pattern:** [[bucket-sort|bucket sort]] on top of [[hash-map-lookup|hash map lookup]]: the hash map counts, the
> buckets order.
>
> **Why brute force is too slow:** counting and then sorting all distinct values by count is O(n log n), which is
> fine in practice but is exactly what the follow-up rules out. Counting each value with `nums.count(x)` for every
> distinct `x` is far worse: O(n²), around 10 billion steps for 100,000 numbers.
>
> **Steps:**
>
> 1. Count every value with a [[hash-map|dict]] (or `Counter`): O(n).
> 2. Make `n + 1` empty buckets. Put each value in the bucket whose index is its count.
> 3. Walk the buckets from index `n` down to 1, collecting values until you have `k`.
>
> ```py run
> from collections import Counter
>
> def top_k_frequent(nums, k):
>     counts = Counter(nums)                        # value -> how many times
>     buckets = [[] for _ in range(len(nums) + 1)]  # index = a count
>     for value, c in counts.items():
>         buckets[c].append(value)
>     result = []
>     for c in range(len(nums), 0, -1):             # highest count first
>         for value in buckets[c]:
>             result.append(value)
>             if len(result) == k:
>                 return result
>     return result
>
> print(top_k_frequent([1, 1, 1, 2, 2, 3], 2))       # [1, 2]
> print(top_k_frequent([7], 1))                      # [7]
> print(top_k_frequent([4, 4, -1, -1, -1, 5], 1))    # [-1]
> ```
>
> **Time:** O(n): one pass to count, one pass to fill buckets, at most one pass over the buckets.
> **Space:** O(n) for the counts and the buckets.
>
> **The other good answer:** keep a heap of size `k`. `heapq.nlargest(k, counts, key=counts.get)` does this in
> O(n log k). It is the better choice when counts are not bounded by `n` (for example, scores), or when the data is a
> stream and you cannot know `n` in advance.
>
> ```py run
> import heapq
> from collections import Counter
>
> counts = Counter([1, 1, 1, 2, 2, 3])
> print(heapq.nlargest(2, counts, key=counts.get))   # [1, 2]
> ```
>
> **Where else this shows up:** "most frequent words", "top error codes in a log", trending hashtags; and any time
> the keys you would sort by are small integers (ages, grades, counts), bucket or counting sort beats a general sort.
