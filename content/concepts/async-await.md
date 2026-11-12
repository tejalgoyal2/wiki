---
title: async / await
aliases: [async/await, async function, async functions, await]
type: concept
track: javascript
description: Syntax that lets promise-based code read top to bottom. An async function always returns a promise; await pauses only that function.
depth: solid
sources:
  - https://tc39.es/ecma262/#sec-async-function-definitions
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
created: 2026-11-12
updated: 2026-11-12
---

`async` and `await` are a nicer way to write [[promise|promise]] chains. The code reads like normal step-by-step
code, but it does not block the [[thread|thread]].

## How it works

- An `async` function **always returns a promise**. `return 5` fulfills it with 5; `throw` rejects it.
- The body runs synchronously **until the first `await`**. Then the function pauses, the caller continues, and the rest of the body is scheduled as a [[microtask-queue|microtask]] once the awaited value is ready.
- `await` on something that isn't a promise just wraps it in a resolved promise.
- Errors: use `try / catch` around `await`, exactly like synchronous code.
- In ES modules, `await` also works at the top level.

## Sequential vs parallel

```js run
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function sequential() {
  const t = Date.now();
  await wait(100);
  await wait(100);
  return Date.now() - t;            // about 200 ms
}

async function parallel() {
  const t = Date.now();
  await Promise.all([wait(100), wait(100)]);
  return Date.now() - t;            // about 100 ms
}

sequential().then((ms) => console.log('sequential >= 200:', ms >= 195));
parallel().then((ms) => console.log('parallel < 200:', ms < 195));
```

Start independent work first, then await it together.

## Traps

- `array.forEach(async ...)` does not wait. Use `for...of` with `await`, or `Promise.all(array.map(...))`.
- An `await` inside a loop makes the loop sequential. Sometimes that is right (rate limits), often it is just slow.
- Forgetting `await` gives you a promise object instead of the value, and errors from it go unhandled.

## Check yourself

> [!question]- What does calling an async function return immediately?
> A pending promise. Its body has run only up to the first `await`.

> [!question]- Two independent API calls are awaited one after the other. How do you make them faster?
> Start both, then `await Promise.all([...])`, so they wait at the same time.
