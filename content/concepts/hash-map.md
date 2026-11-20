---
title: Hash map
aliases: [hash maps, hash table, hash tables, hashmap, dictionary, dict]
type: concept
track: cs-fundamentals
requires: [big-o-notation]
description: A key-value store that finds any key in O(1) time on average by turning the key into an array position with a hash function.
depth: deep
sources:
  - https://docs.python.org/3/library/stdtypes.html#mapping-types-dict
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
  - https://docs.python.org/3/reference/datamodel.html#object.__hash__
  - https://peps.python.org/pep-0456/
  - https://tc39.es/ecma262/#sec-map-objects
created: 2026-11-12
updated: 2026-11-18
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

## Going deeper

### Why a hash function has to be both fast and spread out

The array behind a hash map is small compared with the set of possible keys, so many keys must share slots. A good hash function does two jobs. It is cheap to compute, because it runs on every lookup. And it spreads keys evenly, so no slot collects far more than its share. If it sent every key to slot 0, the table would turn into one long list and every lookup would be O(n).

Two rules link hashing and equality, and breaking either breaks the table:

1. If `a == b`, then `hash(a) == hash(b)`. Otherwise a key could be stored in one slot and searched for in another.
2. A key's hash must not change while it is in the table. This is why Python's `list` and `dict` are not hashable (they are [[mutability|mutable]]), while `int`, `str` and a `tuple` of hashable items are.

Rule 1 is easy to break in your own classes. If you define `__eq__` and not `__hash__`, Python sets `__hash__` to `None` and the object cannot be a key. If you define both, make sure that objects that compare equal produce the same hash:

```py run
class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __eq__(self, other):
        return (self.x, self.y) == (other.x, other.y)
    def __hash__(self):
        return hash((self.x, self.y))      # same fields as __eq__

visited = {Point(1, 2)}
print(Point(1, 2) in visited)   # True: equal and same hash
print(Point(2, 1) in visited)   # False
```

Python also **randomizes** the hash of `str` and `bytes` once per process (salting, described in PEP 456 and on by default). Two runs of the same program give different `hash("abc")` values. That is deliberate: it stops an attacker from crafting many keys that collide on purpose to slow a server down (a hash-flooding attack). The consequence for you: never store `hash()` output, and do not depend on the iteration order of a `set` of strings between runs. A `dict` is different: since Python 3.7 it keeps insertion order as a language guarantee.

### Collisions: chaining versus open addressing

There are two main ways to handle two keys that land in the same slot.

**Chaining.** Each slot holds a small list (or tree) of entries. A lookup goes to the slot and scans the list. Java's `HashMap` does this, and since Java 8 it converts a long chain into a balanced tree so a bad case costs O(log n) instead of O(n). Chaining degrades smoothly: a table with load factor 2 just has chains of about two entries.

**Open addressing.** Each slot holds one entry. If the slot is taken, the table **probes**: it tries another slot by a fixed rule, such as the next one (linear probing) or a pseudo-random sequence. CPython's dict uses open addressing with a perturbed probe sequence. Lookups touch nearby memory, which is fast on modern [[cpu|CPUs]], but the table must stay well below full, or the probe sequences get long.

Deletion shows the difference. In chaining you remove the entry from the list. In open addressing you cannot simply empty the slot, because a later key may have been placed past it while probing, and a lookup that stops at an empty slot would miss it. The usual fix is a **tombstone**, a marker that means "deleted, keep probing", which is cleaned up when the table is rebuilt.

### Load factor and resizing

The **load factor** is entries divided by slots. It controls the trade-off between memory and speed. At a low load factor there are few collisions and a lot of unused memory. At a high one the table is compact and collisions pile up. Implementations choose a threshold (CPython resizes a dict when it is about two thirds full; Java's `HashMap` defaults to 0.75) and **rebuild** the table into a bigger array when it is crossed.

Rebuilding means re-inserting every entry, because the slot is `hash % capacity` and the capacity changed. That step costs O(n). It still gives O(1) **amortized** inserts: if the capacity doubles each time, the total work for n inserts is n plus n/2 plus n/4 and so on, which adds up to less than 2n, so each insert pays a constant on average. One insert in a long run is slow; the average is not.

You can watch the growth in CPython (the exact sizes are an implementation detail and change between versions):

```py run
import sys

d, last = {}, sys.getsizeof({})
resizes = 0
for i in range(100):
    d[i] = i
    size = sys.getsizeof(d)
    if size != last:
        resizes += 1
        last = size
print(resizes > 1, len(d))   # True 100  (the table grew several times)
```

Practical consequences: pre-size when you know the count (some languages let you give a capacity), and expect a latency spike when a very large map resizes in a request path.

### The cost hidden in "O(1)"

O(1) hides constants. A lookup must hash the key, and hashing a string reads every character, so it is O(length of the key). Python caches a string's hash after the first computation, which hides this for repeated lookups of the same string object. Comparing a long key for equality also costs O(length) when the hash matches. A million lookups with 1 KB keys are not the same as a million with small integers.

A hash map also gives up two things an array or a sorted structure has. It has no order by key value (a dict keeps insertion order, not sorted order), and it cannot answer "the smallest key greater than x" or a range query. For those, use a sorted array with binary search, or a tree such as a [[b-tree|B-tree]].

### Second example: counting and grouping

Hash maps shine for two jobs: **counting** (`key -> number`) and **grouping** (`key -> list`). Both appear in puzzles such as [[valid-anagram|Valid Anagram]] and [[group-anagrams|Group Anagrams]], and in daily work.

```py run
from collections import Counter, defaultdict

log = ["GET /a", "POST /b", "GET /a", "GET /c", "POST /b", "GET /a"]

counts = Counter(log)                    # counting
print(counts.most_common(2))             # [('GET /a', 3), ('POST /b', 2)]

by_method = defaultdict(list)            # grouping
for line in log:
    method, path = line.split()
    by_method[method].append(path)
print(dict(by_method))
# {'GET': ['/a', '/a', '/c', '/a'], 'POST': ['/b', '/b']}
```

### Edge cases that bite

- **Mutating during iteration.** Adding or removing keys while looping over a dict raises `RuntimeError: dictionary changed size during iteration` in Python. Loop over `list(d)` if you need to change it.
- **`NaN` as a key.** In Python, `float("nan") != float("nan")`, yet a dict checks identity first, so the same `nan` object can be found while another `nan` cannot. Avoid floats as keys when a value might be `NaN`.
- **`1`, `1.0` and `True`.** They are equal and hash alike, so they are the same key: `{1: "a", True: "b"}` has one entry.
- **JavaScript objects versus `Map`.** A plain object turns keys into strings (`obj[1]` is `obj["1"]`) and inherits names such as `toString` from its prototype. A `Map` keeps real key types and iterates in insertion order. Use `Map` for general key-value data and a `Set` for membership.
- **Unhashable keys.** A list key raises `TypeError: unhashable type`. Convert it to a tuple first.

## How interviews ask it

> [!question]- "How does a hash map work, and why is lookup O(1)?"
> A hash function turns the key into an integer, and that integer modulo the array size picks a slot, so the lookup jumps straight there without searching. Collisions are handled by chaining or probing, and the table is resized when it gets too full, which keeps chains and probe sequences short. So the average cost is constant. The worst case is O(n) if everything collides.

> [!question]- "What makes a good key, and what makes a bad one?"
> A good key is immutable, hashable, cheap to hash, and has equality consistent with its hash. A bad key is mutable (its hash could change while stored), expensive to hash (a huge string), or has equal objects with different hashes.

> [!question]- "When would you not use a hash map?"
> When you need keys in sorted order, range queries, or the next larger key. A sorted array or a tree is better. Also when memory is tight, since a hash map keeps extra empty slots to stay fast.

## Related

The [[hash-map-lookup|hash map lookup]] pattern solves [[two-sum|Two Sum]], [[contains-duplicate|Contains Duplicate]] and [[group-anagrams|Group Anagrams]]. A slowdown from n² to n is large: for a million items, a trillion steps against a million (see [[big-o-notation|Big-O]]).

## Check yourself

> [!question]- Why is a dict lookup O(1) on average but O(n) in the worst case?
> The hash picks the slot directly. If many keys collide in the same slot, the lookup has to walk through all of them.

> [!question]- Why can't a Python list be a dict key?
> Lists are [[mutability|mutable]], so their hash could change after insertion and the key would be lost in the wrong slot. Python makes lists unhashable.

<!-- leads-to -->
## Leads to

- [[bucket-sort|Bucket sort (pattern)]]: When the values you would sort by are small whole numbers, use them as list indexes ("buckets") and read the buckets in order, which costs O(n) instead of O(n log n).
- [[hash-map-lookup|Hash map lookup (pattern)]]: Walk the input once and remember what you've seen in a hash map or set, so each "have I seen X?" question costs O(1).
- [[prefix-sum|Prefix sum (pattern)]]: Precompute running totals once, in O(n), so that the sum (or product) of any range, or of everything before or after a position, is O(1) to read.
<!-- /leads-to -->
