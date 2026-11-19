---
title: Bucket sort (pattern)
aliases: [counting sort]
type: pattern
track: cs-fundamentals
requires: [hash-map, big-o-notation]
description: When the values you would sort by are small whole numbers, use them as list indexes ("buckets") and read the buckets in order, which costs O(n) instead of O(n log n).
sources:
  - https://docs.python.org/3/library/collections.html#collections.Counter
  - https://docs.python.org/3/library/heapq.html
created: 2026-11-19
updated: 2026-11-19
---
<!-- read-first -->
> [!info] Read first
> [[hash-map|Hash map]] · [[big-o-notation|Big-O notation]]
<!-- /read-first -->

**When to use it:** you need items in order of some key, and that key is a whole number in a small, known range:
a count that can't exceed `n`, an age from 0 to 150, a grade from 0 to 100, a letter from `a` to `z`.

**The move:** make one empty bucket per possible key. Drop each item into the bucket at its key. Read the buckets
from one end to the other. A general sort compares items, and comparison sorts can't beat [[big-o-notation|O(n log n)]]. Bucket sort
never compares, so it can.

```py run
def sort_by_small_key(items, key, max_key):
    buckets = [[] for _ in range(max_key + 1)]
    for item in items:
        buckets[key(item)].append(item)
    return [item for bucket in buckets for item in bucket]

people = [("ana", 31), ("bo", 22), ("cy", 31), ("di", 19)]
print(sort_by_small_key(people, key=lambda p: p[1], max_key=150))
# [('di', 19), ('bo', 22), ('ana', 31), ('cy', 31)]
```

Cost: O(n + m) time and space, where m is the number of possible keys. It is stable: items with the same key keep
their input order.

## When not to use it

- **The key range is huge or unknown.** Sorting 1,000 numbers that can be anywhere up to 10⁹ would need a billion
  buckets. Use a normal sort, or a heap if you only need the top `k`.
- **The keys are not whole numbers.** Floats can be bucketed by range (`int(x * 10)`), but then each bucket needs its
  own sort.

## Seen in

- [[top-k-frequent-elements|Top K Frequent Elements]]: count with a [[hash-map|hash map]], then bucket the values by count.
- Counting letters with a 26-slot list in [[valid-anagram|Valid Anagram]] and [[group-anagrams|Group Anagrams]] is the
  same idea: the letter is the index.
