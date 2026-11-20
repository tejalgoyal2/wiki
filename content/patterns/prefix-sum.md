---
title: Prefix sum (pattern)
aliases: [prefix sums, prefix product, prefix products, running total]
type: pattern
track: cs-fundamentals
requires: [big-o-notation, hash-map]
description: Precompute running totals once, in O(n), so that the sum (or product) of any range, or of everything before or after a position, is O(1) to read.
sources:
  - https://docs.python.org/3.13/library/itertools.html#itertools.accumulate
created: 2026-11-20
updated: 2026-11-20
---
<!-- read-first -->
> [!info] Read first
> [[big-o-notation|Big-O notation]] · [[hash-map|Hash map]]
<!-- /read-first -->

**When to use it:** a question asks for the sum, count or product of many ranges of the same list, or of "everything
before" or "everything after" each position. If an inner loop keeps adding up a stretch of the list, a prefix array
can replace it.

**The move:** build `prefix[k]` = the total of the first `k` items, with `prefix[0] = 0`. Then the total of
`nums[i:j]` is `prefix[j] - prefix[i]`: everything up to `j`, minus everything before `i`. One [[big-o-notation|O(n)]] pass, then every
range is O(1).

```py run
from itertools import accumulate

nums = [3, 1, 4, 1, 5, 9, 2]
prefix = [0] + list(accumulate(nums))
print(prefix)                         # [0, 3, 4, 8, 9, 14, 23, 25]

def range_sum(i, j):                  # sum of nums[i:j]
    return prefix[j] - prefix[i]

print(range_sum(2, 5), sum(nums[2:5]))   # 10 10
```

The extra `0` at the front is what makes the formula work for ranges that start at index 0. Without it you need a
special case.

## Two variations worth knowing

**Prefix sums plus a hash map.** "How many subarrays sum to `k`?" A subarray ending here sums to `k` exactly when
some earlier running total equals `running - k`. Keep a [[hash-map|hash map]] of how many times each running total
has appeared: O(n) instead of O(n²), and it works with negative numbers, where a sliding window does not.

```py run
def subarrays_summing_to(nums, k):
    seen = {0: 1}                     # the empty prefix
    running = count = 0
    for x in nums:
        running += x
        count += seen.get(running - k, 0)
        seen[running] = seen.get(running, 0) + 1
    return count

print(subarrays_summing_to([1, 1, 1], 2))          # 2
print(subarrays_summing_to([1, 2, 3, -3, 3], 3))   # 5
```

**Prefix and suffix together.** For "everything except position i", combine a running result from the left with
one from the right. Products don't subtract, so instead of `prefix[j] - prefix[i]` you multiply the two sides.

## When not to use it

- **The list changes between queries.** One update forces an O(n) rebuild. Use a Fenwick tree or a segment tree,
  which update and query in O(log n).
- **Only one range is asked for.** Just add it up.

## Seen in

- [[product-of-array-except-self|Product of Array Except Self]]: a prefix product from the left times a suffix
  product from the right.
- Range sum queries, running balances in a ledger, cumulative counts in SQL window functions
  (`SUM(x) OVER (ORDER BY t)`), and 2D prefix sums for the total of any rectangle in an image or grid.
