---
title: Hash map
aliases: [hash maps, hash table, hash tables, hashmap, dictionary, dict]
type: concept
track: cs-fundamentals
requires: [big-o-notation]
description: A key-value store that finds any key in O(1) time on average by turning the key into an array position with a hash function.
depth: solid
sources:
  - https://docs.python.org/3/library/stdtypes.html#mapping-types-dict
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
created: 2026-11-12
updated: 2026-11-12
---
<!-- read-first -->
> [!info] Read first
> [[big-o-notation|Big-O notation]]
<!-- /read-first -->

A hash map stores **key → value** pairs and finds a key without searching. It runs the key through a **hash
function** to get a number, and uses that number to pick a slot in an array. Python's `dict` and `set`, JavaScript's
`Map` and `Set`, and [[java|Java]]'s `HashMap` are all hash tables.

## How it works

1. `hash(key)` gives an integer. Equal keys must give equal hashes.
2. `hash % capacity` picks a slot (bucket).
3. Two different keys can land in the same slot: a **collision**. It is handled by keeping a small list per slot (chaining) or by probing for the next free slot (open addressing; CPython's dict does this).
4. When the table gets too full (high **load factor**), it grows, usually doubling, and re-inserts everything. That one step is slow, but it is rare, so inserts stay [[big-o-notation|O(1)]] **amortized**.

| Operation | Average | Worst case (everything collides) |
|---|---|---|
| Look up, insert, delete | O(1) | O(n) |

## Example

```py run
seen = {}
for word in ["to", "be", "or", "not", "to", "be"]:
    seen[word] = seen.get(word, 0) + 1
print(seen)   # {'to': 2, 'be': 2, 'or': 1, 'not': 1}  (dicts keep insertion order since Python 3.7)
```

## Traps

- Keys must be **hashable** and must not change: lists can't be dict keys; tuples of hashable values can.
- In JavaScript, plain objects turn keys into strings (`obj[1]` and `obj["1"]` are the same key). Use `Map` for real keys of any type.
- O(1) is an average. Bad hash functions, or deliberately crafted keys, can make it slow.

## Related

The [[hash-map-lookup|hash map lookup]] pattern solves [[two-sum|Two Sum]] and [[contains-duplicate|Contains Duplicate]].

## Check yourself

> [!question]- Why is a dict lookup O(1) on average but O(n) in the worst case?
> The hash picks the slot directly. If many keys collide in the same slot, the lookup has to walk through all of them.

> [!question]- Why can't a Python list be a dict key?
> Lists are [[mutability|mutable]], so their hash could change after insertion and the key would be lost in the wrong slot. Python makes lists unhashable.

<!-- leads-to -->
## Leads to

- [[hash-map-lookup|Hash map lookup (pattern)]]: Walk the input once and remember what you've seen in a hash map or set, so each "have I seen X?" question costs O(1).
<!-- /leads-to -->
