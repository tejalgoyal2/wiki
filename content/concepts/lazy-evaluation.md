---
title: Lazy evaluation
aliases: [eager evaluation, lazy iteration]
type: concept
track: python-data
requires: [iterator]
description: Computing a value only when something asks for it, instead of up front. It saves memory on large or endless data and lets a pipeline stop early.
depth: solid
sources:
  - https://docs.python.org/3.13/library/itertools.html
  - https://docs.python.org/3.13/howto/functional.html#generator-expressions-and-list-comprehensions
created: 2026-11-21
updated: 2026-11-21
---
<!-- read-first -->
> [!info] Read first
> [[iterator|Iterator]]
<!-- /read-first -->

**Eager** code computes everything now and stores the result. **Lazy** code computes one item when the consumer asks
for it, then forgets it. The difference matters for memory, for speed when you only need a few items, and for data
that never ends.

## How it works

In Python, [[iterator|iterators]] and [[generator|generators]] are lazy. A pipeline of them pulls one item through
every stage at a time:

```py run
def numbers():
    n = 0
    while True:               # endless
        yield n
        n += 1

evens = (n for n in numbers() if n % 2 == 0)
squares = (n * n for n in evens)

first = []
for s in squares:
    first.append(s)
    if len(first) == 4:
        break
print(first)                  # [0, 4, 16, 36]
```

Only the numbers 0 to 6 were ever created. An eager version would never finish.

## Memory

```py run
import sys
eager = [n for n in range(1_000_000)]
lazy = (n for n in range(1_000_000))
print(sys.getsizeof(eager) > 1_000_000)   # True   millions of bytes, plus the int objects
print(sys.getsizeof(lazy) < 1_000)        # True   a few hundred bytes, whatever the length
```

## Tools

`itertools.islice` takes the first few items, `chain` joins streams, `takewhile` stops on a condition. Files are lazy
too: `for line in open(path)` reads one line at a time.

## Traps

- Laziness hides work. An error or a slow step happens at the consumer, far from where you wrote it.
- You cannot ask a lazy stream for its length or index into it.
- Lazy is not always faster: if you need every item twice, store them once in a list.

## Related

Python's `range` is a lazy sequence; `list(range(n))` makes it eager.

## Check yourself

> [!question]- When is a list better than a generator?
> When you need to read the data more than once, need its length, or need to index into it.

> [!question]- Why does the endless `numbers()` pipeline above finish?
> Each stage pulls one item at a time, and the loop breaks after four results, so the rest is never computed.
