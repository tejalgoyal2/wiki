---
title: CPU
aliases: [CPUs, processor core, processor cores, CPU core, CPU cores]
type: concept
track: cs-fundamentals
description: The chip that executes a program's instructions one after another; it has cores, registers and caches, and its speed depends heavily on how fast data reaches it.
depth: solid
sources:
  - https://people.freebsd.org/~lstewart/articles/cpumemory.pdf
created: 2026-11-17
updated: 2026-11-17
---

The **CPU** (central processing unit) is the part of a computer that runs your program. It fetches an instruction from memory, decodes it, executes it (add two numbers, compare, jump, load or store a value), and moves on to the next one, billions of times per second.

## How it works

**Core.** One core runs one stream of instructions at a time. A modern CPU has several cores, so it can truly run several streams at once. That is [[concurrency-vs-parallelism|parallelism]]. Some cores also present two hardware threads to the operating system (marketed as hyper-threading or SMT) by sharing parts of one core.

**Registers** are the few tiny, very fast storage slots the instructions work on directly.

**Caches.** Main memory is slow compared to the CPU: a read from it can take hundreds of CPU cycles. So the CPU keeps recently used data in small, fast caches (usually L1, L2 and L3, each bigger and slower than the last). Code that reads memory in order, or reuses the same data, hits the cache and runs much faster. Code that jumps around memory misses the cache and waits. This is why an array is often faster than a linked list with the same Big-O cost (see [[big-o-notation|Big-O notation]]).

**The scheduler.** The operating system gives each runnable [[thread|thread]] a turn on a core, then switches to another. There are usually far more threads than cores, so switching is constant. Each switch has a cost.

**Clock speed** (GHz) is the number of cycles per second. It matters less than it used to: cores differ in how much work they do per cycle, and waiting for memory often dominates.

## Example

```py run
import os
print(os.cpu_count() >= 1)   # True: logical CPUs the operating system sees
```

`os.cpu_count()` returns the number of logical CPUs, which counts hardware threads, not only physical cores.

## Traps

- More threads than cores does not add speed for CPU-bound work. In CPython, the [[gil|GIL]] also stops threads running Python code in parallel; use processes for CPU-bound work.
- A program waiting on disk or network leaves the CPU idle. That is I/O-bound work, and threads or async help there.
- Big-O ignores the cache. Two O(n) loops can differ a lot in real time.

## Related

[[thread|Threads]] run on cores. The [[event-loop|event loop]] keeps one thread busy without blocking.

## Check yourself

> [!question]- Why does a program with 100 CPU-bound threads on a 4-core machine not run 100 times faster?
> Only four threads can run at once. The rest wait for a turn, and switching between them adds cost.

> [!question]- Why can scanning an array be faster than scanning a linked list of the same length?
> Array elements sit next to each other, so each cache load brings in several of them. Linked nodes are scattered, so more reads go to slow main memory.
