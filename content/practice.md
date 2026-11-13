---
title: Practice
description: Every self-test and interview question in the wiki, grouped by track. Answer before you open each one.
generated: true
nolink: true
---

Every **Check yourself** and **How interviews ask it** question in the wiki, in one place. Say the answer out loud
or write it down **before** opening it: testing yourself is what makes knowledge stick. 44 questions so far. This page is generated from
the notes, so it grows every day.

## JavaScript

### From [[2026-11-11-event-loop|#1 · The event loop]]

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

### From [[async-await|async / await]]

> [!question]- What does calling an async function return immediately?
> A pending promise. Its body has run only up to the first `await`.

> [!question]- Two independent API calls are awaited one after the other. How do you make them faster?
> Start both, then `await Promise.all([...])`, so they wait at the same time.

### From [[event-loop|Event loop]]

> [!question]- What has to be true before a queued callback can run?
> The call stack must be empty. Then all microtasks run first, and only after that the next task.

> [!question]- Why can a page stay responsive while it waits for a network request?
> The request is handled by the browser outside the JavaScript thread. The thread is free until the response's callback is queued and run.

### From [[microtask-queue|Microtask queue]]

> [!question]- Why does `.then` run before `setTimeout(fn, 0)`?
> `.then` callbacks are microtasks, and the microtask queue is emptied right after the current task; the timer callback is a separate task that waits for a later turn.

> [!question]- What happens if microtasks keep adding microtasks forever?
> The queue never empties, so the browser never renders or handles input: the page freezes.

### From [[promise|Promise]]

> [!question]- Does the executor function passed to `new Promise` run now or later?
> Now, synchronously. Only the `.then` callbacks run later, as microtasks.

> [!question]- You need results from five requests, but one failing should not lose the other four. Which method?
> `Promise.allSettled`.

### From [[task-queue|Task queue]]

> [!question]- How many tasks does the event loop run before it empties the microtask queue?
> One.

> [!question]- Name three things that create tasks.
> Timers (`setTimeout`, `setInterval`), user events like clicks, and I/O callbacks such as network or file responses.

### From [[web-worker|Web Worker]]

> [!question]- Why can't a worker update the page directly?
> Workers have no access to the DOM. They send results back with `postMessage`, and the main thread updates the page.

> [!question]- Your page freezes for 2 seconds while sorting a huge array. What are two fixes?
> Move the sort into a Web Worker, or split the work into small chunks scheduled with `setTimeout` so the browser can paint between them.

## Python & Data

### From [[2026-11-12-python-object-model|#2 · Python's object model]]

> [!question]- "Is Python pass by value or pass by reference?"
> Neither exactly. Python passes a reference to the object, and the parameter becomes a new name bound to that same
> object. If the function mutates the object, for example appending to a list, the caller sees it. If the function
> rebinds the parameter with `=`, only the local name moves and the caller is not affected. With immutable objects
> like ints and strings you cannot mutate, so it looks like pass by value. People call this pass by object reference,
> or pass by assignment.

> [!question]- "What does this print, and how would you fix it?"
> ```py run
> def f(n, seen=set()):
>     seen.add(n)
>     return len(seen)
> print(f(1), f(2), f(1))
> ```
>
> **1 2 2.** The default `set()` was created once, when the function was defined, so all three calls share it. Fix:
> default to `None` and create a new set inside the function when the argument is `None`.

> [!question]- "Hard mode: what happens here?"
> ```py
> t = ([1], 2)
> t[0] += [3]
> ```
>
> It raises `TypeError: 'tuple' object does not support item assignment`, **and** `t` is now `([1, 3], 2)`.
> `t[0] += [3]` runs in two steps: first the list's in-place add mutates the list (this works), then Python tries to
> store the result back into `t[0]` (this fails, because tuples cannot be assigned to). It shows exactly the difference
> between mutating an object and rebinding a slot.

> [!question]- What is the difference between `a == b` and `a is b`, and when should you use `is`?
> `==` compares values (it calls `__eq__`); `is` checks whether both names point at the very same object. Use `is`
> only for singletons such as `None`, `True` and `False`; use `==` for everything else.

> [!question]- Why does `def f(x, items=[])` keep items from earlier calls, and what is the fix?
> Default values are evaluated once, when the `def` line runs, and the same list object is reused on every call, so
> appends pile up. Fix: use `items=None` and create a new list inside the function when `items is None`.

> [!question]- You copy a list of lists with `new = old.copy()` and then change `new[0][0]`. Does `old` change? Why?
> Yes. `.copy()` is shallow: it makes a new outer list holding the same inner lists, so `new[0]` and `old[0]` are the
> same object. Use `copy.deepcopy(old)` to copy the inner lists too.

### From [[gil|GIL (Global Interpreter Lock)]]

> [!question]- You use 8 threads to resize 8,000 images in pure Python and it is no faster. Why, and what do you change?
> The work is CPU-bound and the GIL lets one thread run Python at a time. Use processes (`ProcessPoolExecutor`) or a library that releases the GIL.

> [!question]- Why do threads still help a script that downloads 100 web pages?
> Downloading is mostly waiting, and the GIL is released while a thread waits on I/O, so the downloads overlap.

### From [[mutability|Mutability]]

> [!question]- Why does `x += 1` on an int never affect another name that pointed at the same int?
> Ints are immutable, so `+=` builds a new int and rebinds `x`; the other name still points at the old one.

> [!question]- Does `const` make a JavaScript array immutable?
> No. `const` only prevents assigning a new value to the name. The array itself can still be mutated.

### From [[shallow-vs-deep-copy|Shallow vs deep copy]]

> [!question]- You shallow-copy a list of lists and change `copy[0][0]`. What happens to the original?
> It changes too: both outer lists hold the same inner lists.

> [!question]- What is the modern built-in way to deep-copy in JavaScript?
> `structuredClone(value)`.

## Backend & System Design

### From [[java|Java]]

> [!question]- What does the JVM run, and why does that make Java portable?
> It runs bytecode. The same bytecode runs on any OS that has a JVM, so you compile once.

> [!question]- What is the Java equivalent of Python's dict?
> `Map`, most often the `HashMap` implementation.

### From [[microservices|Microservices]]

> [!question]- Why do microservices make "one transaction across everything" hard?
> Each service owns its own database, so there is no single database transaction that covers all of them; you need patterns like sagas or events instead.

> [!question]- Name one good reason to split a service out of a monolith.
> One part needs to scale very differently (for example search under heavy load), or a separate team needs to deploy it on its own schedule.

## CS Fundamentals

### From [[big-o-notation|Big-O notation]]

> [!question]- What is the time complexity of checking `if x in my_list` inside a loop over `my_list`?
> O(n²): an O(n) membership test, n times. Turning the list into a set first makes it O(n).

> [!question]- Why do we drop constants, so that 5n and n are both O(n)?
> Big-O describes growth. As n gets large, the shape of the curve dominates; constants depend on hardware and details.

### From [[call-stack|Call stack]]

> [!question]- What does a stack frame hold?
> The function's arguments, its local variables, and where to return to when it finishes.

> [!question]- Why does infinite recursion crash instead of running forever?
> Each call adds a frame and none are removed, so the fixed-size stack fills up and the runtime raises an error.

### From [[concurrency-vs-parallelism|Concurrency vs parallelism]]

> [!question]- Is a Node.js server handling 1,000 open requests concurrent, parallel, or both?
> Concurrent. Its JavaScript runs on one thread; the requests are in progress together but don't execute at the same instant (unless you add worker threads or more processes).

> [!question]- Your program spends most of its time waiting for an API. Concurrency or parallelism?
> Concurrency: overlap the waiting. More cores won't help code that is idle.

### From [[hash-map|Hash map]]

> [!question]- Why is a dict lookup O(1) on average but O(n) in the worst case?
> The hash picks the slot directly. If many keys collide in the same slot, the lookup has to walk through all of them.

> [!question]- Why can't a Python list be a dict key?
> Lists are [[mutability|mutable]], so their hash could change after insertion and the key would be lost in the wrong slot. Python makes lists unhashable.

### From [[thread|Thread]]

> [!question]- What do two threads of the same process share, and what don't they share?
> They share the process's memory (heap, globals). Each has its own call stack and registers.

> [!question]- Why don't Python threads speed up a CPU-heavy loop in standard CPython?
> The GIL lets only one thread execute Python bytecode at a time. Use processes (multiprocessing) or the free-threaded build instead.
