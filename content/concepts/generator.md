---
title: Generator
aliases: [generators, generator function, generator expression, generator expressions]
type: concept
track: python-data
requires: [iterator, call-stack]
description: A Python function that uses yield to produce values one at a time, pausing between them. Calling it returns an iterator, and the function body does not start running until you ask for the first value.
depth: solid
sources:
  - https://docs.python.org/3.13/reference/expressions.html#yield-expressions
  - https://peps.python.org/pep-0255/
  - https://peps.python.org/pep-0289/
created: 2026-11-21
updated: 2026-11-21
---
<!-- read-first -->
> [!info] Read first
> [[iterator|Iterator]] · [[call-stack|Call stack]]
<!-- /read-first -->

A function with `yield` in its body is a **generator function**. Calling it does not run the body. It returns a
**generator object**, which is an [[iterator|iterator]]. Each `next()` runs the body until the next `yield`, hands
that value out, and **pauses** with all local variables kept.

## How it works

```py run
def count_up(limit):
    print("start")
    n = 0
    while n < limit:
        yield n          # pause here, give n to the caller
        n += 1
    print("end")

g = count_up(2)          # nothing printed yet
print(next(g))           # start, then 0
print(next(g))           # 1
print(list(g))           # end, then []   the rest runs, no more values
```

The paused function is a frame that lives on the heap, not on the [[call-stack|call stack]], so it can be resumed
later from anywhere. When the body ends, the generator raises `StopIteration`.

## Generator expressions

A comprehension in parentheses is a generator written in one line:

```py run
squares = (n * n for n in range(5))
print(next(squares))      # 0
print(sum(squares))       # 30   (1 + 4 + 9 + 16)
```

A list comprehension `[...]` builds everything now. A generator expression `(...)` builds nothing until asked.

## Traps

- A generator is one-shot, like any iterator. A second `list(g)` is empty.
- In a generator expression only the outermost iterable is evaluated immediately; everything else waits until the
  first `next()`.
- Exceptions raised inside the body appear at the `next()` call, not at the line that created the generator.
- `return value` inside a generator ends it and carries the value in `StopIteration.value`.

## Related

[[lazy-evaluation|Lazy evaluation]] is the idea; generators are Python's main tool for it.

## Check yourself

> [!question]- You call a generator function. When does its first line run?
> At the first `next()`, not at the call. The call only creates the generator object.

> [!question]- Why can a generator resume after pausing, when a normal function's frame is gone after it returns?
> Its frame is kept on the heap while it is paused, so its locals and its position survive.

<!-- leads-to -->
## Leads to

- [[pep-255-simple-generators|PEP 255: Simple Generators]]: The Python Enhancement Proposal that added yield and generator functions to the language, with the reasons for pausing a function instead of building a list.
<!-- /leads-to -->
