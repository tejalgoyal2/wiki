---
title: Hash map lookup (pattern)
aliases: [complement lookup, seen set]
type: pattern
track: cs-fundamentals
requires: [hash-map]
description: Walk the input once and remember what you've seen in a hash map or set, so each "have I seen X?" question costs O(1).
created: 2026-11-12
updated: 2026-11-12
---
<!-- read-first -->
> [!info] Read first
> [[hash-map|Hash map]]
<!-- /read-first -->

**When to use it:** the brute force compares every pair ([[big-o-notation|O(n²)]]), and the question for each item is
"have I already seen a value that fits with this one?".

**The move:** walk once. For each item, first **ask** the map about its partner, then **store** the item.

```py
seen = {}                      # or set() if you only need yes/no
for i, x in enumerate(items):
    partner = ...              # what x needs (target - x, x itself, a running sum ...)
    if partner in seen:
        ...                    # found it
    seen[x] = i
```

Cost: O(n) time, O(n) extra space. You trade memory for speed.

## Problems that use it

| Puzzle | What you remember | Partner of x |
|---|---|---|
| [[two-sum\|Two Sum]] | value → index | `target - x` |
| [[contains-duplicate\|Contains Duplicate]] | values (a set) | `x` itself |
| Subarray Sum Equals K | running sum → count | `running - k` |
| [[valid-anagram\|Valid Anagram]] | letter → count | (compare counts) |

## Traps

- Ask before you store, or an item can pair with itself.
- If the input is already sorted, two pointers may solve it in O(1) space instead.

Built on the [[hash-map|hash map]] concept.
