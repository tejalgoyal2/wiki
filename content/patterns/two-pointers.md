---
title: Two pointers (pattern)
aliases: [two pointer, two-pointer technique, two-pointer]
type: pattern
track: cs-fundamentals
requires: [big-o-notation]
description: Keep two indexes into the same sequence and move them by a rule, so one pass replaces checking every pair.
created: 2026-11-21
updated: 2026-11-21
---
<!-- read-first -->
> [!info] Read first
> [[big-o-notation|Big-O notation]]
<!-- /read-first -->

**When to use it:** the input is a sequence (often sorted, or symmetric), the brute force looks at every pair
([[big-o-notation|O(n²)]]), and you can tell from the current pair which pointer should move.

**The move:** place one pointer at each end (or one behind the other). Look at the pair. A rule tells you which
pointer to move, and moving it never skips a possible answer. Each pointer only moves one way, so the total work is
O(n) and the extra space is O(1).

```py
left, right = 0, len(items) - 1
while left < right:
    value = combine(items[left], items[right])
    if value == goal:
        ...                  # found it
    elif value < goal:
        left += 1            # need something bigger: the left side is too small
    else:
        right -= 1           # need something smaller: the right side is too big
```

Why it is safe: in a sorted list, if the pair at the two ends is too small, then the left item is too small for
**every** partner still in range, so it can be dropped for good. The same argument drops the right item when the sum
is too big.

## Two common shapes

| Shape | Pointers start | Example |
|---|---|---|
| Opposite ends, move inward | `0` and `n - 1` | [[valid-palindrome\|Valid Palindrome]], [[two-sum-ii\|Two Sum II]] |
| Same direction (slow and fast) | both at `0` | remove duplicates in place, a sliding window |

## Compare with hash map lookup

[[hash-map-lookup|Hash map lookup]] also turns a pair search into one pass, but spends O(n) memory. Two pointers
needs the order (sorted input) and spends none. If the input is sorted, prefer two pointers; if it is not, a [[hash-map|hash map]]
is cheaper than sorting first.

## Problems that use it

| Puzzle | Rule for moving |
|---|---|
| [[valid-palindrome\|Valid Palindrome]] | compare ends, step both inward |
| [[two-sum-ii\|Two Sum II]] | sum too small: move left; too big: move right |
