---
title: Iterator
aliases: [iterators, iterable, iterables, iterator protocol]
type: concept
track: python-data
requires: [mutability]
description: An object that hands out the items of a sequence one at a time through next(), and raises StopIteration when it runs out. An iterable is anything you can ask for a fresh iterator.
depth: solid
sources:
  - https://docs.python.org/3.13/library/stdtypes.html#iterator-types
  - https://docs.python.org/3.13/glossary.html#term-iterator
  - https://peps.python.org/pep-0234/
created: 2026-11-21
updated: 2026-11-21
---
<!-- read-first -->
> [!info] Read first
> [[mutability|Mutability]]
<!-- /read-first -->

Two words, two jobs. An **iterable** is something you can loop over: a list, a string, a [[hash-map|dict]], a file. An **iterator**
is the object that does the looping: it remembers a position and gives you the next item each time you ask.

## How it works

The protocol has two methods:

- `__iter__()` on an iterable returns an iterator.
- `__next__()` on an iterator returns the next item, or raises `StopIteration` when there are none left.

An iterator's own `__iter__` returns `self`, so an iterator is also an iterable. A `for` loop is just this:

```py run
items = ["a", "b", "c"]
it = iter(items)          # calls items.__iter__()
print(next(it))           # a
print(next(it))           # b
print(next(it))           # c
try:
    next(it)
except StopIteration:
    print("done")         # done
```

`for x in items:` does exactly that: call `iter()` once, call `next()` until `StopIteration`, and swallow it.

## The one-shot rule

A list is iterable and can give you many independent iterators. An iterator is **used up** once it reaches the end,
and it never goes back:

```py run
it = iter([1, 2, 3])
print(sum(it))            # 6
print(sum(it))            # 0   the iterator is exhausted, no error
print(iter(it) is it)     # True
```

That silent `0` is the most common iterator bug. If you need two passes, keep the data in a list, or ask the
iterable for a new iterator each time.

## Writing your own

```py run
class Countdown:
    def __init__(self, start):
        self.n = start
    def __iter__(self):
        return self
    def __next__(self):
        if self.n <= 0:
            raise StopIteration
        self.n -= 1
        return self.n + 1

print(list(Countdown(3)))   # [3, 2, 1]
```

Most of the time a [[generator|generator]] is shorter: it builds the same object for you.

## Traps

- Exhausted iterators look like empty ones. Check whether a function returns a list or an iterator.
- `map`, `filter`, `zip`, `enumerate` and `reversed` return iterators in Python 3, not lists.
- Changing a list while iterating over it moves the position under the iterator, so items get skipped.

## Related

[[lazy-evaluation|Lazy evaluation]] is why iterators matter: they produce items on demand.

## Check yourself

> [!question]- What is the difference between an iterable and an iterator?
> An iterable can produce an iterator when you call `iter()` on it. An iterator keeps the position and has `__next__`; its `__iter__` returns itself.

> [!question]- You run `sum(it)` twice on the same iterator. What happens the second time?
> It returns 0 with no error, because the iterator was used up by the first call.

<!-- leads-to -->
## Leads to

- [[generator|Generator]]: A Python function that uses yield to produce values one at a time, pausing between them. Calling it returns an iterator, and the function body does not start running until you ask for the first value.
- [[lazy-evaluation|Lazy evaluation]]: Computing a value only when something asks for it, instead of up front. It saves memory on large or endless data and lets a pipeline stop early.
<!-- /leads-to -->
