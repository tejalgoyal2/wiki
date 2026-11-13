---
title: Practice
description: Every self-test and interview question in the wiki, grouped by track. Answer before you open each one.
generated: true
nolink: true
---

Every **Check yourself** and **How interviews ask it** question in the wiki, in one place. Say the answer out loud
or write it down **before** opening it: testing yourself is what makes knowledge stick. 62 questions so far. This page is generated from
the notes, so it grows every day.

> [!tip] Prefer flashcards?
> **[Open the Quiz](/static/quiz/)**: the same questions as cards, scheduled with spaced repetition so each one comes
> back just before you would forget it. Your progress stays in your browser.

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

> [!question]- A microtask queues another microtask. Does the new one run before the next `setTimeout` callback?
> Yes. The microtask queue is emptied completely, including microtasks added while it is being emptied, before the
> loop takes the next task.

> [!question]- Inside an `fs.readFile` callback in Node.js, you call `setTimeout(fn, 0)` and `setImmediate(fn)`. Which runs first?
> `setImmediate`. The callback runs in the poll phase, and the check phase, where `setImmediate` callbacks run, comes
> right after it. Timers only run when the loop next reaches the timers phase.

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

## ML & Data Science

### From [[2026-11-13-overfitting|#3 · Overfitting and the bias-variance trade-off]]

> [!question]- "Your model gets 99% on training data and 70% on test data. What is going on and what do you do?"
> That gap is overfitting: the model fits noise in the training data that does not carry over. First I would rule out
> a split problem, such as test rows that come from a different period or population than the training rows. Then I would reduce
> variance: a simpler model or fewer features, regularisation (L1/L2, dropout, early stopping, shallower trees), or
> more training data. I would compare options with cross-validation on the training data, and only look at the test
> set again at the very end.

> [!question]- "Why do you need a validation set if you already have a test set?"
> Because choosing a model is itself fitting. If I try many settings and keep the one that scores best on a held-out
> set, that score is biased upward: some of it is luck that suits that particular set. The validation set absorbs
> those choices. The test set is used once, after all decisions are made, so its score is an honest estimate of
> performance on new data.

> [!question]- "Your churn model had an AUC of 0.97 offline and is close to random in production. Where do you look?"
> Leakage first. I would look for features that are only known after the outcome, such as status fields updated when
> the customer leaves, and check feature importance for a single column that dominates. I would check that the split
> respected time, that the same customer did not appear in both training and test data, and that scaling or encoding
> was fitted on training rows only. Then I would compare the production feature values with the training ones, since
> a pipeline that computes a feature differently online is another common cause.

> [!question]- A model's training error keeps falling as you make it more flexible. What usually happens to its validation error, and why?
> It falls at first, then rises. More flexibility lowers bias, but past some point the model starts fitting the noise
> in the training data, so its variance grows faster than its bias shrinks. The best setting is where validation
> error is lowest, not training error.

> [!question]- You standardise every column using the mean and standard deviation of the whole dataset, then split. What is wrong?
> The test rows helped compute the mean and standard deviation, so information from the test set entered training.
> Fit the scaler on the training rows only and apply that same fitted scaler to the validation and test rows.

> [!question]- You have three years of sales data and want to predict next month. How should you split it?
> By time, not at random: train on the earliest data, validate on the months after it, and test on the most recent
> months. A random split lets the model learn from the future, which it cannot do in production.

### From [[bias-variance-trade-off|Bias-variance trade-off]]

> [!question]- Why does a random forest usually beat a single deep decision tree?
> A deep tree has low bias but high variance. Averaging many trees, each trained on a different bootstrap sample,
> cancels much of that variance while keeping the low bias.

> [!question]- Adding more training data helps which part of the error, and which part never changes?
> More data mainly lowers variance. The irreducible noise in the labels never changes, whatever the model or data size.

### From [[cross-validation|Cross-validation]]

> [!question]- Why report the spread of the k scores and not only the mean?
> The spread shows how much the estimate depends on which rows were held out. Two models whose means differ by less
> than that spread may not really be different.

> [!question]- Your data has 20 rows per customer. Which kind of cross-validation do you use, and why?
> Group k-fold by customer. Otherwise the same customer appears in training and validation folds, and the model can
> score well by recognising customers instead of learning the pattern.

### From [[data-leakage|Data leakage]]

> [!question]- You fill missing ages with the mean age of the whole dataset, then split. Is that leakage?
> Yes, a mild one: the test rows helped compute the mean. Compute the mean on the training rows and use that same
> value to fill the validation and test rows.

> [!question]- A loan-default model uses "number of collection calls". Why is that suspicious?
> Collection calls happen after a borrower misses payments, which is part of defaulting. At the moment of deciding
> on a loan, the value does not exist yet, so the model is learning from the outcome.

### From [[overfitting|Overfitting]]

> [!question]- Training accuracy 99%, validation accuracy 72%. Name three things you could try.
> Get more training data, use a simpler model or fewer features, and add regularisation (an L2 penalty, dropout,
> a depth limit or early stopping). Compare them with validation or cross-validation, not training accuracy.

> [!question]- What does underfitting look like in the numbers?
> Training and validation error are both high and close together. The model cannot even fit the data it learned
> from, so it needs more flexibility or better features.

### From [[train-validation-test-split|Train, validation and test split]]

> [!question]- Why is the validation score of your best model usually a little too optimistic?
> Because you picked that model for having the best validation score. Some of its advantage is luck that suits those
> specific validation rows, and that luck will not repeat on new data. The untouched test set gives the honest number.

> [!question]- You have a year of daily data. Should you shuffle before splitting?
> No. Split by time so the model is trained on earlier days and evaluated on later ones, which is how it will be used.

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
