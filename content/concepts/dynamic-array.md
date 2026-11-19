---
title: Dynamic array
aliases: [dynamic arrays, resizable array, growable array, ArrayList]
type: concept
track: cs-fundamentals
requires: [big-o-notation]
description: An array that grows on demand by moving into a larger block of memory when full; Python's list, JavaScript's Array and Java's ArrayList work this way.
depth: solid
sources:
  - https://github.com/python/cpython/blob/3.13/Objects/listobject.c
  - https://wiki.python.org/moin/TimeComplexity
  - https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/ArrayList.html
created: 2026-11-19
updated: 2026-11-19
---
<!-- read-first -->
> [!info] Read first
> [[big-o-notation|Big-O notation]]
<!-- /read-first -->

A plain array is one block of memory with a fixed number of slots. That makes indexing fast (slot i is at a
known offset) but means it can't grow. A **dynamic array** keeps the fast indexing and adds growth: it holds a
block with some spare room, its **capacity**, and when that runs out it moves everything to a bigger block.

Python's `list`, [[java|Java]]'s `ArrayList` and C++'s `std::vector` are dynamic arrays. JavaScript engines store
dense arrays the same way.

## How it works

- `size` is how many items are in use; `capacity` is how many fit before a move.
- **Index, set, append with room, pop from the end:** O(1).
- **Append when full:** allocate a block larger by a constant factor, copy all n items, free the old block: O(n)
  for that call, O(1) [[amortized-analysis|amortized]].
- **Insert or delete at the front or middle:** every later item shifts one slot: O(n).

CPython grows a list by about 1/8 of its size plus a small constant (see `list_resize` in `Objects/listobject.c`).
You can watch it grow in the example below.

## Example

```py run
import sys

lst = []
prev = sys.getsizeof(lst)
for i in range(20):
    lst.append(i)
    size = sys.getsizeof(lst)
    if size != prev:
        print(f"len {len(lst):2}: {prev} -> {size} bytes")
        prev = size
# On 64-bit CPython 3.14 (each slot is an 8-byte pointer):
# len  1: 56 -> 88 bytes     capacity 4
# len  5: 88 -> 120 bytes    capacity 8
# len  9: 120 -> 184 bytes   capacity 16
# len 17: 184 -> 248 bytes   capacity 24
```

Twenty appends, only four moves. The exact sizes depend on the Python version and platform; the shape does not.

## Traps

- **`list.pop(0)` and `list.insert(0, x)` are O(n).** For a queue, use `collections.deque`, which is O(1) at both ends.
- **Pre-sizing is rarely needed in Python.** `[None] * n` is fine when you know n, but appending in a loop is already
  amortized O(1).
- **References, not values.** A Python list stores pointers to objects, so `getsizeof` counts the slots, not the
  objects they point at.
- **Memory can stay high.** A list that grew to a million items and was then mostly cleared with `pop()` keeps some
  of its capacity until it shrinks or is rebuilt.

## Related

[[amortized-analysis|Amortized analysis]] · [[big-o-notation|Big-O notation]] · [[hash-map|Hash map]] (which resizes
the same way)

## Check yourself

> [!question]- Why is `append` O(1) amortized but `insert(0, x)` O(n) on a Python list?
> Append writes into spare capacity at the end and only occasionally resizes, which averages out to O(1). Inserting at
> the front must shift every existing item one slot to the right, every time.

> [!question]- Why does a dynamic array grow by a factor rather than by, say, 100 slots?
> Growing by a fixed amount means a full copy every 100 appends, so n appends copy about n²/200 items: O(n) per append.
> A factor makes the copies a geometric series that sums to O(n) total.

<!-- leads-to -->
## Leads to

- [[amortized-analysis|Amortized analysis]]: Measuring the cost of an operation averaged over any sequence of operations, so a rare expensive step (like a resize) still counts as cheap per call.
<!-- /leads-to -->
