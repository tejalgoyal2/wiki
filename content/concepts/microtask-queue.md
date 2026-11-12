---
title: Microtask queue
aliases: [microtask, microtasks, queueMicrotask]
type: concept
track: javascript
description: A high-priority queue for promise callbacks and await continuations. It is emptied completely after every task.
depth: solid
sources:
  - https://html.spec.whatwg.org/multipage/webappapis.html#microtask-queue
  - https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide
created: 2026-11-12
updated: 2026-11-12
---

Microtasks are small jobs that must run **as soon as the current task finishes**, before the next task and before the
next paint. They are why [[promise|promise]] callbacks run before timers.

## What goes in it

- Promise reactions: `.then`, `.catch`, `.finally` callbacks.
- The rest of an `async` function after an `await`.
- `queueMicrotask(fn)`.
- `MutationObserver` callbacks.

## How it works

After each task, the [[event-loop|event loop]] runs microtasks until the queue is **empty**, including any microtasks
that those microtasks add. Only then does it render or take another task.

```js run
queueMicrotask(() => {
  console.log('first');
  queueMicrotask(() => console.log('added during the drain'));
});
setTimeout(() => console.log('task'), 0);
// first
// added during the drain
// task
```

## Traps

- A microtask that keeps scheduling microtasks blocks the page completely: no paint, no input.
- In Node.js, `process.nextTick` callbacks have their own queue that runs **before** promise microtasks.

## Check yourself

> [!question]- Why does `.then` run before `setTimeout(fn, 0)`?
> `.then` callbacks are microtasks, and the microtask queue is emptied right after the current task; the timer callback is a separate task that waits for a later turn.

> [!question]- What happens if microtasks keep adding microtasks forever?
> The queue never empties, so the browser never renders or handles input: the page freezes.
