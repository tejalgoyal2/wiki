---
title: "PEP 255: Simple Generators"
aliases: [PEP 255]
type: reference
track: python-data
requires: [generator]
description: The Python Enhancement Proposal that added yield and generator functions to the language, with the reasons for pausing a function instead of building a list.
sources:
  - https://peps.python.org/pep-0255/
  - https://peps.python.org/pep-0234/
created: 2026-11-21
updated: 2026-11-21
---
<!-- read-first -->
> [!info] Read first
> [[generator|Generator]]
<!-- /read-first -->

**What it is:** PEP 255, "Simple Generators", the proposal that gave Python the `yield` statement (Python 2.2). It
sits next to PEP 234, "Iterators", which defined the `__iter__` and `__next__` protocol that generators plug into.

**Read:** the Motivation section first. It explains why producers that keep state between values were awkward to
write by hand, and shows that a function which can pause removes the need for a class with saved fields. Then the
sections on the semantics of `yield` and `return` in a generator.

**What it settles:**

- a function containing `yield` is a generator function, and calling it returns an iterator without running the body;
- each `next()` resumes after the last `yield`, with the local state kept;
- `return` inside a generator ends it, and falling off the end raises `StopIteration`.

**Later changes worth knowing:** PEP 342 added `send()`, `throw()` and `close()`, and PEP 380 added `yield from`.
PEP 289 added generator expressions.

**Notes that rely on it:** [[generator|generator]] and [[iterator|iterator]].
