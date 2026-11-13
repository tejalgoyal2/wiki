---
title: "#1 · The event loop"
type: lesson
lesson: 1
track: javascript
requires: [call-stack, thread]
description: How JavaScript does many things at once with one thread, and why promise callbacks run before timers.
puzzle: two-sum
market_word: Java
sources:
  - https://html.spec.whatwg.org/multipage/webappapis.html#event-loops
  - https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick
created: 2026-11-11
updated: 2026-11-12
---
<!-- read-first -->
> [!info] Read first
> [[call-stack|Call stack]] · [[thread|Thread]]
<!-- /read-first -->

> [!abstract] Today
> How JavaScript does many things at once with only one [[thread|thread]]. About 25 minutes: the lesson, then the puzzle.

## The idea

JavaScript runs your code on **one thread with one [[call-stack|call stack]]**. It can only do one thing at a time. When you start
something slow (a timer, a network request, reading a file), JavaScript hands it to the browser or to Node, and keeps
going. When the slow thing finishes, its callback is put in a **queue**. [[event-loop|The event loop]] is the rule that decides when a
waiting callback gets to run: **only when the call stack is empty**.

That one rule explains most "why did this print in that order?" questions.

## How it really works

There are two kinds of queue, and they are not equal:

| Queue | What goes in it | When it runs |
|---|---|---|
| **[[task-queue\|Task queue]]** (macrotasks) | `setTimeout`, `setInterval`, UI events like clicks, network and file I/O callbacks | One task per turn of the loop |
| **[[microtask-queue\|Microtask queue]]** | [[promise\|Promise]] callbacks (`.then`, `.catch`, `.finally`), the rest of an `async` function after `await`, `queueMicrotask` | All of them, right after the current task |

One turn of the loop in a browser:

1. Take **one** task and run it until the stack is empty. Your whole script file counts as the first task.
2. Run **every** microtask. If a microtask adds another microtask, that one runs too, in the same round. The queue must be **completely empty** before moving on.
3. Maybe render: run `requestAnimationFrame` callbacks, recalculate styles and layout, paint. On a 60 Hz screen this chance comes about every 16.7 ms.
4. Go back to step 1.

**The key sentence: after every task, all microtasks run before the next task and before the next paint.**

Two details interviewers like:

- `setTimeout(fn, 0)` does not mean "now". It means "put `fn` in the task queue after at least 0 ms". If the stack is busy for 2 seconds, `fn` waits 2 seconds. Browsers also enforce a minimum of about 4 ms once timers are nested 5 levels deep.
- `await` splits an `async` function in two. Everything **before** the first `await` runs immediately, like normal code. Everything **after** it is scheduled as a microtask once the awaited value is ready. Calling an `async` function returns a promise straight away.

## Example

Predict the output before you open the answer.

```js run
console.log('A');

setTimeout(() => console.log('B'), 0);

Promise.resolve().then(() => console.log('C'));

queueMicrotask(() => console.log('D'));

(async () => {
  console.log('E');
  await null;
  console.log('F');
})();

console.log('G');
```

> [!success]- Answer: A E G C D F B
> The script itself is one task. It prints **A**, schedules B in the task queue, puts C and D in the microtask queue,
> runs the [[async-await|async function]] up to `await` (prints **E**, then puts "print F" in the microtask queue), and prints **G**.
>
> The stack is now empty, so all microtasks run in the order they were added: **C, D, F**.
>
> Only then does the loop take the next task: **B**.

Now the reason this matters for real pages:

```js
// Version 1: the page freezes forever
function spin() { Promise.resolve().then(spin); }
spin();

// Version 2: the page keeps working
function spin2() { setTimeout(spin2, 0); }
spin2();
```

Version 1 keeps adding microtasks while the microtask queue is being emptied, so step 2 never ends: no paint, no
clicks, nothing. Version 2 adds **tasks**, and between two tasks the browser can paint and handle clicks. Same idea,
very different result.

## Traps

**1. `forEach` does not wait for `async` callbacks.**

```js
const ids = [1, 2, 3];
ids.forEach(async (id) => {
  await save(id);
});
console.log('all saved'); // prints BEFORE any save finishes
```

`forEach` ignores the promises its callback returns. Use `for (const id of ids) { await save(id); }` to go one by one,
or `await Promise.all(ids.map(save));` to run them all at once and wait for all of them.

**2. Long synchronous code blocks everything.** A loop that takes 3 seconds blocks timers, clicks and painting for 3
seconds, because nothing else can run until the stack is empty. Split the work into chunks with `setTimeout`, or move
it to a [[web-worker|Web Worker]] (a real second thread).

**3. Node.js has extra queues.** `process.nextTick` callbacks run before promise microtasks. In the main script, the
order of `setTimeout(fn, 0)` and `setImmediate(fn)` is not guaranteed; inside an I/O callback, `setImmediate` always
runs first. Since Node 11, microtasks run after each individual timer callback, the same as in browsers.

**4. Promises are not threads.** `new Promise(resolve => { /* heavy loop */ })` still runs the heavy loop right now, on
the main thread. A promise changes **when the result is delivered**, not where the work happens.

## How interviews ask it

> [!question]- "JavaScript is single-threaded. So how can it do several things at the same time?"
> The JavaScript engine runs my code on one thread, but the environment around it (the browser or Node) is not
> single-threaded. Timers, network requests and file reads are done by the environment. When one finishes, its
> callback goes into a queue, and the event loop runs it when the call stack is empty. Promise callbacks go into a
> separate microtask queue that is fully emptied after each task, so they run before timers. So JavaScript is
> [[concurrency-vs-parallelism|concurrent]] (many things in progress) without being parallel (two pieces of my code running at the same moment),
> unless I use Web Workers or worker threads.

> [!question]- "What does this print?"
> ```js run
> setTimeout(() => console.log(1));
> Promise.resolve().then(() => {
>   console.log(2);
>   setTimeout(() => console.log(3));
> });
> Promise.resolve().then(() => console.log(4));
> console.log(5);
> ```
>
> **5, 2, 4, 1, 3.** 5 is synchronous. Then the microtasks: 2 (which schedules timer 3 behind timer 1), then 4. Then
> the tasks in order: 1, then 3.

> [!question]- "Write a sleep function and use it."
> ```js run
> const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
>
> async function demo() {
>   console.log('wait...');
>   await sleep(1000);
>   console.log('one second later');
> }
>
> demo();
> ```
>
> The usual follow-up: "Does `sleep` block the page?" No. `await` gives the thread back; the rest of `demo` comes back
> as a microtask after the timer task resolves the promise.

## Build it

In a React or Next.js project, add a test page with a number that counts up using `requestAnimationFrame`, and a
button that runs a 2-second busy loop. Click it and watch the counter freeze. Then fix it two ways: split the loop into
chunks with `setTimeout`, and move it into a Web Worker. You will have seen the event loop instead of only reading
about it, and it makes a good short answer to "tell me about a performance problem".

## Check yourself

> [!question]- After a script finishes, which runs first: a `setTimeout(fn, 0)` callback or a `.then` callback? Why?
> The `.then` callback. It is a microtask, and all microtasks run as soon as the current task (the script) ends,
> before the loop takes the next task, which is where the timer callback waits.

> [!question]- Why can an endless chain of promise callbacks freeze a page, while an endless chain of `setTimeout` calls does not?
> The microtask queue must be completely empty before the browser can paint or take the next task. A promise chain
> keeps refilling it, so that never happens. Each `setTimeout` callback is a separate task, and the browser can paint
> and handle input between tasks.

> [!question]- When you call an `async` function, which part of its body runs immediately?
> Everything up to the first `await`. At that point the function returns a pending promise to the caller, and the rest
> runs later as a microtask, once the awaited value is ready.

## Puzzle

Today's puzzle is [[two-sum|Two Sum]]: think about it away from the keyboard, then read the hint. The solution
arrives tomorrow.

## Market word: Java

[[java|Java]] was the most-asked skill in this week's Canadian entry-level job posts that this wiki doesn't cover yet
(58 of 1,200 posts), mostly at banks and large companies. It is statically typed and compiles to bytecode that runs on
the JVM. If you know C#, it is a short step: classes, interfaces, generics and garbage collection work almost the
same way, and Spring Boot plays the role `ASP.NET Core` plays for C#.
