---
title: GIL (Global Interpreter Lock)
aliases: [global interpreter lock, free-threaded]
type: concept
track: python-data
description: A lock in CPython that lets only one thread run Python bytecode at a time. Python 3.13 added an optional build without it.
depth: solid
sources:
  - https://docs.python.org/3/glossary.html#term-global-interpreter-lock
  - https://peps.python.org/pep-0703/
  - https://docs.python.org/3/howto/free-threading-python.html
created: 2026-11-12
updated: 2026-11-12
---

The GIL is a single lock inside CPython (the standard Python). A [[thread]] must hold it to run Python bytecode, so
in one process only **one thread executes Python code at a time**, even on a 16-core machine.

## Why it exists

CPython manages memory with reference counts on every object. One global lock keeps those counts correct without
putting a lock on every object, which made the interpreter simpler and single-threaded code fast.

## What it means in practice

- **I/O-bound work is fine with threads.** The GIL is released while a thread waits on the network, disk or `time.sleep`, so other threads run.
- **CPU-bound work does not speed up with threads.** Use `multiprocessing` / `ProcessPoolExecutor` (separate processes, each with its own GIL), or libraries like NumPy that do heavy work in C and release the GIL.
- **Free-threaded Python.** Python 3.13 added an optional build without the GIL ([PEP 703](https://peps.python.org/pep-0703/)), usually installed as `python3.13t`. It is opt-in, and some C extensions still need updates to support it.

```py run
import sys
gil = getattr(sys, "_is_gil_enabled", lambda: True)()
print("GIL enabled:", gil)   # True on a normal build
```

## Related

[[concurrency-vs-parallelism]] explains why this is a parallelism limit, not a concurrency limit.

## Check yourself

> [!question]- You use 8 threads to resize 8,000 images in pure Python and it is no faster. Why, and what do you change?
> The work is CPU-bound and the GIL lets one thread run Python at a time. Use processes (`ProcessPoolExecutor`) or a library that releases the GIL.

> [!question]- Why do threads still help a script that downloads 100 web pages?
> Downloading is mostly waiting, and the GIL is released while a thread waits on I/O, so the downloads overlap.
