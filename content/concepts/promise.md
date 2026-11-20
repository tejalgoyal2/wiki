---
title: Promise
aliases: [promises, Promise.all, Promise.allSettled, Promise.race, Promise.any]
type: concept
track: javascript
requires: [event-loop]
description: An object that stands for a result that isn't ready yet. It is pending, then fulfilled with a value or rejected with an error, exactly once.
depth: deep
sources:
  - https://tc39.es/ecma262/#sec-promise-objects
  - https://tc39.es/ecma262/#sec-promise-resolve-functions
  - https://tc39.es/ecma262/#sec-newpromiseresolvethenablejob
  - https://tc39.es/ecma262/#sec-promise.prototype.then
  - https://promisesaplus.com/
  - https://nodejs.org/api/process.html#event-unhandledrejection
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
created: 2026-11-12
updated: 2026-11-20
---
<!-- read-first -->
> [!info] Read first
> [[event-loop|Event loop]]
<!-- /read-first -->

A promise is a placeholder for a value that will arrive later. It starts **pending** and then **settles** exactly
once: **fulfilled** with a value, or **rejected** with a reason (usually an `Error`). After it settles, it never changes.

The mental model: a promise is a receipt. You get it immediately, the order is filled later, and anyone holding the
receipt can ask to be told when it is ready, even if they ask after it was filled.

## How it works

- `new Promise((resolve, reject) => { ... })`: the function you pass (the executor) runs **immediately and synchronously**. Only the delivery of the result is later.
- `.then(onFulfilled, onRejected)` registers callbacks and **returns a new promise**, which is how chains work. Whatever a callback returns becomes the next promise's value; if it throws, the next promise rejects.
- Callbacks always run as [[microtask-queue|microtasks]], even when the promise is already settled.

### Inside a promise

The spec describes a promise as an object with a few internal slots:

| Slot | Holds |
|---|---|
| `[[PromiseState]]` | `pending`, `fulfilled` or `rejected` |
| `[[PromiseResult]]` | the value or the reason, once settled |
| `[[PromiseFulfillReactions]]`, `[[PromiseRejectReactions]]` | lists of callbacks waiting for the result |
| `[[PromiseIsHandled]]` | whether anyone has ever attached a rejection handler |

The executor receives two functions, `resolve` and `reject`. They share a flag ("already resolved"), so only the
**first** call of either one does anything. Later calls are silently ignored, and an error thrown inside the executor
after `resolve` was called is ignored too. An error thrown before that rejects the promise.

When the promise settles, each waiting reaction is put on the [[microtask-queue|microtask queue]] as a job, and the
reaction lists are cleared. When `.then` is called on a promise that has **already** settled, the job is queued at
once. Either way, the callback never runs synchronously inside `.then`, so code after `.then(...)` always runs first.
This rule, "always asynchronous", is what makes promise code predictable: there is no case where a callback runs
sometimes now and sometimes later.

### Resolving is not the same as fulfilling

`resolve(x)` does not always fulfill with `x`. If `x` is a **thenable** (any object with a `then` method, including
another promise), the promise **adopts** its state: it waits for `x` and settles the same way. So "resolved" means
"locked in to a final outcome", which may still be pending. Only `reject` settles directly with what you pass.

Adoption is done by a separate job (NewPromiseResolveThenableJob in the spec), which calls `x.then(...)` on the next
microtask turn. That is why resolving with a promise costs extra microtask turns compared with resolving with a plain
value, which you can see in the ordering example below. `Promise.resolve(p)` is the shortcut: if `p` is already a
native promise from the same constructor, it returns `p` itself.

### What `.then` returns

`.then` creates a new promise, `p2`, and settles it from the callback:

- the callback returns a plain value → `p2` fulfills with it;
- the callback returns a promise or thenable → `p2` adopts it (this is how you chain async steps);
- the callback throws → `p2` rejects with the thrown error;
- no callback for this outcome → the value or reason passes through unchanged.

The last rule is why a single `.catch` at the end of a chain catches a failure from any earlier step: each `.then`
without a rejection handler passes the rejection along. `.catch(f)` is `.then(undefined, f)`, and `.finally(f)` runs
`f` either way and then passes the original value or reason through, unless `f` itself throws or returns a rejected
promise.

## Example

```js run
const p = new Promise((resolve, reject) => {
  console.log('1. executor runs now');
  resolve('first');
  resolve('second');             // ignored: already resolved
  reject(new Error('nope'));     // ignored too
});
p.then((v) => console.log('3. then got', v));
console.log('2. after new Promise');

Promise.resolve(1)
  .then((v) => v + 1)
  .then((v) => { throw new Error('boom at ' + v); })
  .then(() => console.log('skipped'))
  .catch((e) => { console.log('4. caught:', e.message); return 'recovered'; })
  .finally(() => console.log('5. finally runs either way'))
  .then((v) => console.log('6. value after finally:', v));
// 1. executor runs now
// 2. after new Promise
// 3. then got first
// 4. caught: boom at 2
// 5. finally runs either way
// 6. value after finally: recovered
```

Note that `.catch` **recovers**: it returned a value, so the chain after it is fulfilled again. Rethrow inside
`.catch` if the error should keep travelling.

### Second example: sequence vs parallel

The most common performance bug with promises is awaiting independent work one item at a time.

```js run
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const task = (name, ms) => sleep(ms).then(() => name);

async function sequential() {
  const a = await task('a', 50);    // b does not start until a is done
  const b = await task('b', 50);
  return [a, b];                    // about 100 ms
}
async function parallel() {
  const [a, b] = await Promise.all([task('a', 50), task('b', 50)]);  // both started at once
  return [a, b];                    // about 50 ms
}
sequential().then((r) => console.log('sequential', r));   // sequential [ 'a', 'b' ]
parallel().then((r) => console.log('parallel', r));       // parallel [ 'a', 'b' ]
```

The work starts when the function that **creates** the promise is called, not when you `await` it. So
`Promise.all([task(), task()])` starts both first and then waits for both. Use the sequential form only when step
two needs step one's result, or when you must limit how much runs at once.

### Third example: ordering with adoption

```js run
const log = [];
const inner = Promise.resolve('inner');
const outer = new Promise((resolve) => resolve(inner));   // adopts inner: extra turns
outer.then(() => log.push('outer'));
Promise.resolve().then(() => log.push('a')).then(() => log.push('b')).then(() => log.push('c'));
setTimeout(() => console.log(log.join(' ')));   // a b outer c   (Node 24)
console.log(outer === inner, Promise.resolve(inner) === inner);   // false true
```

`outer` resolved "immediately", but its callback ran after two steps of the other chain, because adoption took two
microtask turns: one to call `inner.then`, one to deliver the result. You should never rely on this exact order in
real code. It is here to show that resolving with a promise is not free.

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

None of these **cancel** the losers. When `Promise.all` rejects early or `Promise.race` settles, the other operations
keep running; their results are just ignored. To actually stop work (a `fetch`, for example), pass an
`AbortController` signal to it.

A common use of `race` is a timeout: race the real work against a promise that rejects after N milliseconds. Again,
the real work keeps going unless you also abort it.

## Edge cases

- **Empty inputs.** `Promise.all([])` fulfills at once with `[]`. `Promise.any([])` rejects at once with an
  `AggregateError`. `Promise.race([])` stays pending forever.
- **Non-promise items.** All four methods pass each item through `Promise.resolve`, so plain values are allowed:
  `Promise.all([1, wait(10, 2)])` gives `[1, 2]`.
- **Throwing in the executor.** `new Promise(() => { throw new Error('x') })` does not throw to the caller; it
  returns a rejected promise.
- **Throwing later, inside a callback the executor scheduled** (for example inside a `setTimeout` in the executor),
  is not caught by the promise. It is an ordinary uncaught exception. Call `reject` there instead.
- **Thenables that misbehave.** If a thenable calls both of its callbacks, or calls one twice, only the first call
  counts. This protection comes from the same "already resolved" flag.

## Traps

- A rejected promise nobody handles becomes an "unhandled rejection". Browsers report it in the console; in Node 15+ it crashes the process by default (the `--unhandled-rejections` flag changes that).
- Forgetting to `return` inside a `.then` breaks the chain: the next step gets `undefined` and doesn't wait.
- A promise does not make work run in parallel or on another [[thread|thread]]. See [[concurrency-vs-parallelism]].
- **Attaching the handler too late.** If you create a promise, do slow synchronous work, and only then attach
  `.catch`, the rejection may already have been reported as unhandled. Attach handlers in the same turn you create
  the promise.
- **`forEach` with an async callback.** `items.forEach(async (x) => { await save(x) })` does not wait for anything:
  `forEach` ignores the returned promises. Use `for...of` with `await` (sequential) or
  `await Promise.all(items.map(save))` (parallel).
- **Wrapping a promise in `new Promise`.** `new Promise((res) => fetch(url).then(res))` loses rejections, because
  nothing calls `reject`. Just return `fetch(url)`.

## How interviews ask it

> [!question]- "Implement `Promise.all`."
> Return a new promise. Keep a results array the size of the input and a counter of how many are still pending. For
> each item, call `Promise.resolve(item).then(...)`: store the value at its **index** (so the order matches the
> input, not the finish order), decrement the counter, and resolve with the array when it reaches zero. Pass the
> outer `reject` as the rejection handler, so the first failure rejects the whole thing. Handle the empty input by
> resolving with `[]` at once. Calling `reject` again for later failures is harmless, because a promise settles only
> once.

```js run
function promiseAll(items) {
  return new Promise((resolve, reject) => {
    const results = new Array(items.length);
    let left = items.length;
    if (left === 0) return resolve(results);
    items.forEach((item, i) => {
      Promise.resolve(item).then((value) => {
        results[i] = value;
        left -= 1;
        if (left === 0) resolve(results);
      }, reject);
    });
  });
}
const wait = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));
promiseAll([wait(30, 'a'), 'b', wait(10, 'c')]).then((v) => console.log(v));     // [ 'a', 'b', 'c' ]
promiseAll([]).then((v) => console.log(v));                                         // []
promiseAll([wait(10, 'x'), Promise.reject(new Error('bad'))])
  .catch((e) => console.log('rejected:', e.message));                               // rejected: bad
```

> [!question]- "What is the difference between `.then(f, g)` and `.then(f).catch(g)`?"
> In the first, `g` handles only a rejection of the original promise; if `f` throws, `g` does not see it. In the
> second, `.catch(g)` is attached to the promise returned by `.then(f)`, so it handles both a rejection of the
> original and an error thrown by `f`. The second is usually what you want.

> [!question]- "You need to call an API for 1,000 ids. How do you do it?"
> Not one at a time (too slow) and not all 1,000 at once with `Promise.all` (it can overload the server or hit rate
> limits, and one failure rejects everything). Run them with a concurrency limit, for example a pool of 5 to 10
> workers that each take the next id from a shared list, and collect results with `allSettled`-style records so
> failures can be retried. Add a timeout and retries with backoff for [[idempotency|idempotent]] requests.

## Related

[[async-await]] is syntax built on promises: `await p` waits for `p` the same way `.then` does, and an `async`
function always returns a promise. Promise callbacks are [[closure|closures]], which is how a `.then` callback
still sees the variables of the code that created it.

## Check yourself

> [!question]- Does the executor function passed to `new Promise` run now or later?
> Now, synchronously. Only the `.then` callbacks run later, as microtasks.

> [!question]- You need results from five requests, but one failing should not lose the other four. Which method?
> `Promise.allSettled`.

> [!question]- A `.catch` handler logs the error and returns nothing. Is the promise after it fulfilled or rejected?
> Fulfilled, with `undefined`. A handler that returns normally recovers the chain. Rethrow if the error should keep
> propagating.

> [!question]- `Promise.race([fetchA(), timeout(1000)])` rejects with the timeout. Is the request stopped?
> No. `race` only decides which result you see; the request keeps running. Pass an `AbortController` signal to the
> request and abort it on timeout to really stop it.

<!-- leads-to -->
## Leads to

- [[async-await|async / await]]: Syntax that lets promise-based code read top to bottom. An async function always returns a promise; await pauses only that function.
- [[microtask-queue|Microtask queue]]: A high-priority queue for promise callbacks and await continuations. It is emptied completely after every task.
<!-- /leads-to -->
