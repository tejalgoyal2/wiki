---
title: Promise
aliases: [promises, Promise.all, Promise.allSettled, Promise.race, Promise.any]
type: concept
track: javascript
requires: [event-loop]
description: An object that stands for a result that isn't ready yet. It is pending, then fulfilled with a value or rejected with an error, exactly once.
depth: solid
sources:
  - https://tc39.es/ecma262/#sec-promise-objects
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
created: 2026-11-12
updated: 2026-11-12
---
<!-- read-first -->
> [!info] Read first
> [[event-loop|Event loop]]
<!-- /read-first -->

A promise is a placeholder for a value that will arrive later. It starts **pending** and then **settles** exactly
once: **fulfilled** with a value, or **rejected** with a reason (usually an `Error`). After it settles, it never changes.

## How it works

- `new Promise((resolve, reject) => { ... })`: the function you pass (the executor) runs **immediately and synchronously**. Only the delivery of the result is later.
- `.then(onFulfilled, onRejected)` registers callbacks and **returns a new promise**, which is how chains work. Whatever a callback returns becomes the next promise's value; if it throws, the next promise rejects.
- Callbacks always run as [[microtask-queue|microtasks]], even when the promise is already settled.

## Combining promises

| Method | Settles when | Rejects when |
|---|---|---|
| `Promise.all([...])` | all fulfill (gives an array of values, in input order) | **any** rejects (fail fast) |
| `Promise.allSettled([...])` | all settle (gives `{status, value / reason}` objects) | never |
| `Promise.race([...])` | the first one settles, either way | the first one rejects |
| `Promise.any([...])` | the first one fulfills | all reject (`AggregateError`) |

```js run
const wait = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));
Promise.all([wait(30, 'a'), wait(10, 'b')]).then((v) => console.log(v));   // [ 'a', 'b' ]  (input order, not finish order)
Promise.race([wait(30, 'a'), wait(10, 'b')]).then((v) => console.log(v));  // b
```

## Traps

- A rejected promise nobody handles becomes an "unhandled rejection" (in Node 15+ this crashes the process by default).
- Forgetting to `return` inside a `.then` breaks the chain: the next step gets `undefined` and doesn't wait.
- A promise does not make work run in parallel or on another [[thread|thread]]. See [[concurrency-vs-parallelism]].

## Related

[[async-await]] is syntax built on promises.

## Check yourself

> [!question]- Does the executor function passed to `new Promise` run now or later?
> Now, synchronously. Only the `.then` callbacks run later, as microtasks.

> [!question]- You need results from five requests, but one failing should not lose the other four. Which method?
> `Promise.allSettled`.

<!-- leads-to -->
## Leads to

- [[async-await|async / await]]: Syntax that lets promise-based code read top to bottom. An async function always returns a promise; await pauses only that function.
- [[microtask-queue|Microtask queue]]: A high-priority queue for promise callbacks and await continuations. It is emptied completely after every task.
<!-- /leads-to -->
