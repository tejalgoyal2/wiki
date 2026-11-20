---
title: "Path: how JavaScript runs your code"
type: path
track: javascript
description: Eight steps, in order, from the call stack and scope to async/await. About an hour and a quarter.
created: 2026-11-13
updated: 2026-11-20
---

Read these in order. Each one assumes the ones before it. About an hour and a quarter in total; stop after any step.

1. [[call-stack|Call stack]]: how a program remembers where it is.
2. [[lexical-scope|Lexical scope]] and [[closure|Closure]]: how a function finds its variables, and keeps them after its caller returns.
3. [[thread|Thread]]: one line of execution, and why JavaScript has one for your code.
4. [[concurrency-vs-parallelism|Concurrency vs parallelism]]: doing many things at once without doing them at the same instant.
5. [[event-loop|Event loop]]: the rule that decides what runs next.
6. [[task-queue|Task queue]] and [[microtask-queue|Microtask queue]]: the two lines callbacks wait in, and why one always goes first.
7. [[promise|Promise]] and [[async-await|async / await]]: the tools you actually write, and what they do to the queues.
8. [[web-worker|Web Worker]]: the way out when one thread is not enough.

**Then test yourself:** the JavaScript section of [[practice|Practice]], and the lessons
[[2026-11-11-event-loop|#1 · The event loop]] and [[2026-11-20-closures-and-scope|#7 · Closures and scope]].
