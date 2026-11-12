---
title: Thread
aliases: [threads, multithreading, multi-threaded, single-threaded, main thread]
type: concept
track: cs-fundamentals
description: A sequence of instructions the operating system can schedule. Threads in one process share memory; each has its own call stack.
depth: solid
sources:
  - https://docs.python.org/3/library/threading.html
  - https://peps.python.org/pep-0703/
  - https://developer.mozilla.org/en-US/docs/Glossary/Thread
created: 2026-11-12
updated: 2026-11-12
---

A thread is one line of execution inside a program. A **process** is a running program with its own memory; it has
at least one thread, and can have many. Threads in the same process **share memory** (the heap, global variables)
but each has its **own** [[call-stack|call stack]].

## How it works

- The operating system scheduler switches between threads (a context switch) many times a second. On a machine with several CPU cores, threads can also run truly at the same moment.
- Sharing memory makes threads cheap to communicate, and dangerous: two threads changing the same data can interleave in surprising ways (a race condition). Locks prevent that, and bring their own problem (deadlock).

## In the languages you use

| Language | Threads |
|---|---|
| JavaScript | Your code runs on one main thread; the [[event-loop\|event loop]] gives it [[concurrency-vs-parallelism\|concurrency]]. Real extra threads come from [[web-worker\|Web Workers]] (browser) or `worker_threads` (Node), which don't share normal variables. |
| Python (CPython) | Real OS threads, but the GIL lets only one run Python bytecode at a time, so threads help with waiting (I/O), not with CPU-heavy work. Python 3.13 added an optional [[gil\|free-threaded]] build without the GIL (PEP 703). |
| [[java\|Java]], C# | Real threads that run in parallel on multiple cores, plus thread pools and higher-level tools. |

## Example

```py run
import threading, time

def fetch(name):
    time.sleep(0.2)          # stands in for a network call; the GIL is released while waiting
    print("done", name)

start = time.time()
threads = [threading.Thread(target=fetch, args=(i,)) for i in range(3)]
for t in threads: t.start()
for t in threads: t.join()
print(round(time.time() - start, 1) < 0.5)   # True: the three waits overlapped
```

## Check yourself

> [!question]- What do two threads of the same process share, and what don't they share?
> They share the process's memory (heap, globals). Each has its own call stack and registers.

> [!question]- Why don't Python threads speed up a CPU-heavy loop in standard CPython?
> The GIL lets only one thread execute Python bytecode at a time. Use processes (multiprocessing) or the free-threaded build instead.
