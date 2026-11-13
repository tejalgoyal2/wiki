---
title: "Path: how JavaScript runs your code"
type: path
track: javascript
description: Seven notes, in order, from the call stack to async/await. About an hour.
created: 2026-11-13
updated: 2026-11-13
---

Read these in order. Each one assumes the ones before it. About an hour in total; stop after any step.

1. [[call-stack|Call stack]]: how a program remembers where it is.
2. [[thread|Thread]]: one line of execution, and why JavaScript has one for your code.
3. [[concurrency-vs-parallelism|Concurrency vs parallelism]]: doing many things at once without doing them at the same instant.
4. [[event-loop|Event loop]]: the rule that decides what runs next.
5. [[task-queue|Task queue]] and [[microtask-queue|Microtask queue]]: the two lines callbacks wait in, and why one always goes first.
6. [[promise|Promise]] and [[async-await|async / await]]: the tools you actually write, and what they do to the queues.
7. [[web-worker|Web Worker]]: the way out when one thread is not enough.

**Then test yourself:** the JavaScript section of [[practice|Practice]], and the lesson
[[2026-11-11-event-loop|#1 · The event loop]].
