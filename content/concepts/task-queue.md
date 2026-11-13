---
title: Task queue
aliases: [task queues, macrotask, macrotasks, macrotask queue, callback queue]
type: concept
track: javascript
requires: [event-loop]
description: Where callbacks for timers, events and I/O wait. The event loop runs one task per turn, then all microtasks.
depth: solid
sources:
  - https://html.spec.whatwg.org/multipage/webappapis.html#task-queue
created: 2026-11-12
updated: 2026-11-12
---
<!-- read-first -->
> [!info] Read first
> [[event-loop|Event loop]]
<!-- /read-first -->

A task is a unit of work the [[event-loop|event loop]] runs from start to finish: a `setTimeout` callback, a click
handler, a network or file callback, or the script itself. Tasks wait in task queues. People often call them
**macrotasks** to contrast them with [[microtask-queue|microtasks]].

## How it works

- The loop takes **one** task, runs it until the [[call-stack|call stack]] is empty, then empties the microtask queue, then may render.
- The [[html-standard-event-loops|HTML Standard]] allows **several task queues** (for example one for user input and one for timers), and the browser may pick which queue to serve next. That is how browsers keep clicks responsive under load. Within one queue, order is first in, first out.
- A timer's delay is the minimum time before its task is **queued**, not the time it runs.

## Example

```js run
setTimeout(() => console.log('timer 1'), 0);
setTimeout(() => console.log('timer 2'), 0);
Promise.resolve().then(() => console.log('microtask'));
// microtask, timer 1, timer 2
```

## Traps

- "Macrotask" is a nickname. The specs say "task".
- Between two tasks the browser can paint; inside one long task it cannot. Long tasks (over 50 ms) are what make pages feel slow.

## Check yourself

> [!question]- How many tasks does the event loop run before it empties the microtask queue?
> One.

> [!question]- Name three things that create tasks.
> Timers (`setTimeout`, `setInterval`), user events like clicks, and I/O callbacks such as network or file responses.

<!-- leads-to -->
## Leads to

- [[microtask-queue|Microtask queue]]: A high-priority queue for promise callbacks and await continuations. It is emptied completely after every task.
<!-- /leads-to -->
