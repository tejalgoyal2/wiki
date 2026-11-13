---
title: Concurrency vs parallelism
aliases: [concurrency, concurrent, parallelism, parallel execution]
type: concept
track: cs-fundamentals
requires: [thread]
description: Concurrency is dealing with many things in progress at once; parallelism is doing many things at the same instant.
depth: solid
sources:
  - https://go.dev/blog/waza-talk
created: 2026-11-12
updated: 2026-11-12
---
<!-- read-first -->
> [!info] Read first
> [[thread|Thread]]
<!-- /read-first -->

**Concurrency** is about structure: several tasks are *in progress* during the same period, and they take turns.
**Parallelism** is about execution: several tasks *run at the same instant*, on different CPU cores. Rob Pike's talk
"Concurrency is not parallelism" (2012) is the classic explanation.

A cook with three pots on the stove, stirring each in turn, is concurrent. Three cooks each stirring one pot is parallel.

## Where you meet it

| Setup | Concurrent? | Parallel? |
|---|---|---|
| JavaScript with the [[event-loop\|event loop]] | Yes: many requests in flight | No: your code runs on one [[thread]] |
| Python threads (standard CPython) | Yes | Not for Python bytecode: the [[gil\|GIL]] lets one thread run at a time |
| Python `multiprocessing`, [[java\|Java]] threads, Go goroutines on many cores | Yes | Yes |
| A [[web-worker\|Web Worker]] next to the main thread | Yes | Yes |

## Why it matters

- **Waiting-bound work** (network, disk): concurrency is enough. While one task waits, another runs.
- **CPU-bound work** (maths, parsing, image processing): you need parallelism, meaning more cores doing real work.

Choosing the wrong one is a classic interview trap: adding threads to a CPU-heavy Python loop makes it no faster.

## Check yourself

> [!question]- Is a Node.js server handling 1,000 open requests concurrent, parallel, or both?
> Concurrent. Its JavaScript runs on one thread; the requests are in progress together but don't execute at the same instant (unless you add worker threads or more processes).

> [!question]- Your program spends most of its time waiting for an API. Concurrency or parallelism?
> Concurrency: overlap the waiting. More cores won't help code that is idle.

<!-- leads-to -->
## Leads to

- [[event-loop|Event loop]]: The rule that decides when queued callbacks run in JavaScript - only when the call stack is empty, microtasks first.
- [[gil|GIL (Global Interpreter Lock)]]: A lock in CPython that lets only one thread run Python bytecode at a time. Python 3.13 added an optional build without it.
<!-- /leads-to -->
