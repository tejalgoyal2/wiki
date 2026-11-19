---
title: Practice
description: Every self-test and interview question in the wiki, grouped by track. Answer before you open each one.
generated: true
nolink: true
---

Every **Check yourself** and **How interviews ask it** question in the wiki, in one place. Say the answer out loud
or write it down **before** opening it: testing yourself is what makes knowledge stick. 119 questions so far. This page is generated from
the notes, so it grows every day.

> [!tip] Prefer flashcards?
> **[Open the Quiz](/quiz/)**: the same questions as cards, scheduled with spaced repetition so each one comes
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

> [!question]- "What is the output of a script with a timer, a promise and `console.log`, and why?"
> Synchronous logs first. Then the promise callback, because the microtask queue is drained right after the script
> finishes. Then the timer, which is a separate task that waits for a later turn of the loop. Say the rule out loud:
> the stack empties, then all microtasks, then render, then the next task.

> [!question]- "Can a promise chain freeze the browser?"
> Yes. The queue must be empty before the loop moves on, so an endless chain of promise callbacks never lets it
> paint or handle input. An endless chain of `setTimeout` calls does not, because each callback is a separate task.

> [!question]- Why does `.then` run before `setTimeout(fn, 0)`?
> `.then` callbacks are microtasks, and the microtask queue is emptied right after the current task; the timer callback is a separate task that waits for a later turn.

> [!question]- What happens if microtasks keep adding microtasks forever?
> The queue never empties, so the browser never renders or handles input: the page freezes.

> [!question]- In a browser, a button has two click listeners and the first queues a microtask. When does it run for a real click versus for `button.click()` called from code?
> For a real click, between the two listeners, because the stack is empty after the first one returns. For `button.click()`
> from your code, after both listeners, because your calling code is still on the stack.

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

## LLMs & RAG

### From [[2026-11-17-tokens|#4 · Tokens and context windows]]

> [!question]- "What is a token, and why not just use words or characters?"
> A token is a piece of text from a fixed vocabulary, mapped to an integer. Words alone need an enormous vocabulary and fail on rare words, names and typos. Characters never fail but make sequences very long, and cost grows with length. Subword tokens sit between: common words are one token, rare ones split into known pieces, so the vocabulary stays manageable and nothing is unknown.

> [!question]- "A user complains that your summariser errors on long documents. How do you debug it?"
> I would count tokens, not characters, with the tokenizer for the exact model. Prompt plus expected output has to fit the context window. If it does not fit, I would split the document into chunks, summarise each, and summarise the summaries. I would also check the output limit and whether the error is a length error or a quality problem on long inputs.

> [!question]- "How would you reduce the cost of an LLM feature?"
> Cut input tokens first: shorter system prompt, trim or summarise old chat history, retrieve only relevant chunks instead of whole documents. Cache a repeated prefix if the provider supports it. Use a smaller model where quality allows. Cap output length. Measure tokens per request in logs so the effect is visible.

> [!question]- Why does a BPE tokenizer never meet an "unknown word"?
> It can always fall back to smaller pieces, down to single characters or bytes, which are all in the vocabulary. A new word is split into known pieces.

> [!question]- Why does a ten-turn chat cost much more than ten separate one-turn requests of the same size?
> Each turn resends the whole history as input, so input tokens add up like 1 + 2 + 3 + ... turns' worth. Cost grows roughly with the square of the number of turns.

> [!question]- You measured a prompt as 4,000 tokens on one model family. Is it 4,000 on another?
> Not necessarily. Each family has its own vocabulary, so counts differ. Use the target model's own counter.

### From [[context-window|Context window]]

> [!question]- A model has a 10,000-token window and your prompt is 9,800 tokens. What is the risk?
> Only 200 tokens remain for the reply, so a longer answer is cut off or the request is rejected.

> [!question]- Why does a long chat get slower and costlier per message?
> Each message resends the whole history, so the input grows every turn.

### From [[token|Token]]

> [!question]- Why use subword tokens instead of whole words?
> A whole-word vocabulary would be huge and would fail on rare words, names and typos. Subwords keep the vocabulary small and let any new word be built from known pieces.

> [!question]- Why can the same prompt cost different amounts on two models?
> Their tokenizers differ, so they split the text into a different number of tokens, and their per-token prices differ too.

### From [[byte-pair-encoding|Byte-pair encoding]]

> [!question]- Why does BPE never meet an unknown word?
> The smallest pieces (characters or bytes) are always in the vocabulary, so any text can be split into known pieces.

> [!question]- Why must merges be replayed in the order they were learned?
> Each merge was chosen because of the pieces that existed at that point. A later merge may depend on an earlier one, so another order gives a different result.

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

### From [[unit-testing|Unit testing]]

> [!question]- Why replace a database call with a fake in a unit test?
> A real database is slow and its state can change between runs, so the test would be slow and unrepeatable. A fake returns fixed data, so the test checks only your logic.

> [!question]- What is the difference between a unit and an integration test?
> A unit test checks one piece in isolation. An integration test checks that several real pieces work together, such as your code with an actual database.

### From [[2026-11-18-http|#5 · HTTP in depth]]

> [!question]- "What is the difference between PUT and POST?"
> `PUT` replaces the resource at a URL the client names, and it is idempotent: sending it twice leaves the same state. `POST` hands the server a body to process, usually to create something at a URL the server picks, and it is not idempotent: sending it twice can create two things. So I can retry a `PUT` after a timeout, but a `POST` needs an idempotency key first.

> [!question]- "A payment request timed out. What should the client do?"
> It does not know whether the payment happened, so it must not just send the request again. The client should send the same idempotency key on every attempt. The server stores the key with the result and returns the stored result for a repeat, so the card is charged once. I would also let the client look up the payment by that key to see its final state.

> [!question]- "What does HTTP/2 fix over HTTP/1.1, and what does it not fix?"
> It multiplexes many requests as independent streams over one connection, so a slow response no longer blocks the ones behind it, and it compresses headers. It still runs on TCP, so one lost packet stalls every stream until it is resent. HTTP/3 moves to QUIC over UDP so that a loss only delays its own stream.

> [!question]- Why is `DELETE` idempotent even though the second call returns a different status code?
> Idempotency is about server state, not the response. After the first `DELETE` the item is gone; after the second it is still gone. The response differs (`204` then `404`), but the state is the same.

> [!question]- Your client gets `403` on an API call. Should it retry after a few seconds? What about `503`?
> No for `403`: the server understood the request and refused it, so retrying the same request gives the same answer. Yes for `503` (with backoff, and respecting `Retry-After`), because it means the server is temporarily unable to handle the request, and the method must be idempotent.

> [!question]- Ten requests go to one HTTPS host with a 50 ms round trip. Roughly how much does keep-alive save compared with a new connection per request?
> With a new TCP and TLS 1.3 connection each time, each request costs about 3 round trips (150 ms), so 1,500 ms in all. With keep-alive the two handshake round trips are paid once and each request costs one, so about 600 ms. It saves roughly 900 ms in this model.

### From [[continuous-integration|Continuous integration]]

> [!question]- What is the difference between continuous integration and continuous delivery?
> CI builds and tests every change automatically. Continuous delivery goes further and keeps every passing change ready to release, or releases it automatically.

> [!question]- Why does a pipeline stop at the first failing stage?
> Later stages assume the earlier ones passed. Deploying code whose tests failed defeats the purpose of the checks, and stopping gives fast feedback.

### From [[http|HTTP]]

> [!question]- What does it mean that HTTP is stateless?
> Each request carries everything the server needs; the server does not remember earlier requests from the same client. State, such as a login, is carried by the client in cookies or tokens on each request.

> [!question]- What stays the same and what changes between HTTP/1.1 and HTTP/2?
> The semantics stay: methods, status codes and headers mean the same. The wire format changes from text to binary frames, and many requests can share one connection at once.

### From [[http-status-codes|HTTP status codes]]

> [!question]- What is the difference between 401 and 403?
> 401: the server does not know who you are, so log in. 403: it knows who you are and the answer is no.

> [!question]- Which of 400, 429 and 503 is worth retrying later?
> 429 and 503. A 400 means the request itself is wrong, so the same request fails again.

### From [[idempotency|Idempotency]]

> [!question]- A client retries `PUT /users/7` with the same body three times. How many users exist afterwards, and why?
> One. `PUT` replaces the resource at that URL, so repeating it leaves the same state.

> [!question]- Why does a payment API ask for an idempotency key on `POST`?
> A timeout leaves the client unsure whether the payment happened. With the same key on every retry, the server charges once and returns the stored result for repeats.

### From [[tcp|TCP]]

> [!question]- How many round trips does a TCP connection cost before the first byte of data can be sent?
> One: the `SYN` / `SYN-ACK` exchange. The client's final `ACK` can travel together with its first data.

> [!question]- Your server reads `recv(1024)` once and parses the result as one JSON message. Why does it fail sometimes?
> TCP does not keep message boundaries. A read can return half a message, or two messages glued together. Add framing,
> such as a length prefix, and read until the whole message has arrived.

### From [[tls|TLS]]

> [!question]- What three guarantees does TLS add on top of TCP?
> Confidentiality (encryption), integrity (tampering is detected) and server authentication (a certificate that
> chains to a trusted authority and matches the host name).

> [!question]- How many round trips does a fresh HTTPS request over TLS 1.3 take, from nothing to the response?
> About three: one for the TCP handshake, one for the TLS handshake, and one for the request and response.

## CS Fundamentals

### From [[big-o-notation|Big-O notation]]

> [!question]- What is the time complexity of checking `if x in my_list` inside a loop over `my_list`?
> O(n²): an O(n) membership test, n times. Turning the list into a set first makes it O(n).

> [!question]- Why do we drop constants, so that 5n and n are both O(n)?
> Big-O describes growth. As n gets large, the shape of the curve dominates; constants depend on hardware and details.

> [!question]- Binary search halves the range each step. Why does it not matter whether we write O(log₂ n) or O(log n)?
> Logarithms in different bases differ by a constant factor (log₂ n is about 3.32 × log₁₀ n), and Big-O drops constant factors.

> [!question]- An algorithm loops from 2 up to √n to test whether the number n is prime. Is it fast?
> Only for small numbers. Input size is the number of digits d, and √n is about 10^(d/2), so the cost is exponential
> in the input size. A 30-digit number would need about 10¹⁵ divisions.

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

> [!question]- "How does a hash map work, and why is lookup O(1)?"
> A hash function turns the key into an integer, and that integer modulo the array size picks a slot, so the lookup jumps straight there without searching. Collisions are handled by chaining or probing, and the table is resized when it gets too full, which keeps chains and probe sequences short. So the average cost is constant. The worst case is O(n) if everything collides.

> [!question]- "What makes a good key, and what makes a bad one?"
> A good key is immutable, hashable, cheap to hash, and has equality consistent with its hash. A bad key is mutable (its hash could change while stored), expensive to hash (a huge string), or has equal objects with different hashes.

> [!question]- "When would you not use a hash map?"
> When you need keys in sorted order, range queries, or the next larger key. A sorted array or a tree is better. Also when memory is tight, since a hash map keeps extra empty slots to stay fast.

> [!question]- Why is a dict lookup O(1) on average but O(n) in the worst case?
> The hash picks the slot directly. If many keys collide in the same slot, the lookup has to walk through all of them.

> [!question]- Why can't a Python list be a dict key?
> Lists are [[mutability|mutable]], so their hash could change after insertion and the key would be lost in the wrong slot. Python makes lists unhashable.

### From [[thread|Thread]]

> [!question]- What do two threads of the same process share, and what don't they share?
> They share the process's memory (heap, globals). Each has its own call stack and registers.

> [!question]- Why don't Python threads speed up a CPU-heavy loop in standard CPython?
> The GIL lets only one thread execute Python bytecode at a time. Use processes (multiprocessing) or the free-threaded build instead.

> [!question]- Two threads each run `counter += 1` a million times on a shared counter, with no lock. Why can the total come out too low?
> `counter += 1` is read, add, write. If both threads read the same value before either writes, one increment is lost. A lock around the update makes the three steps happen as one.

> [!question]- How do you stop two threads from deadlocking on two locks?
> Make every thread take the locks in the same global order (say `a` before `b`). Then no cycle of waiting can form. Holding locks for as short a time as possible also helps.

> [!question]- You need to download 200 web pages in Python. Threads, processes or async, and why?
> Threads or async. The work is waiting on the network, and the GIL is released while a thread waits. Processes would work but cost more memory for no gain.

### From [[b-tree|B-tree]]

> [!question]- Why is a B-tree shallower than a binary search tree with the same keys?
> Each node has many children, so each level cuts the search space by a factor of the fanout, not by two.

> [!question]- Why do databases prefer a B-tree over a hash index for most columns?
> A B-tree keeps keys sorted, so it handles ranges and ordering as well as equality. A hash index handles only equality.

### From [[cpu|CPU]]

> [!question]- Why does a program with 100 CPU-bound threads on a 4-core machine not run 100 times faster?
> Only four threads can run at once. The rest wait for a turn, and switching between them adds cost.

> [!question]- Why can scanning an array be faster than scanning a linked list of the same length?
> Array elements sit next to each other, so each cache load brings in several of them. Linked nodes are scattered, so more reads go to slow main memory.

### From [[2026-11-19-big-o-for-real|#6 · Big-O for real]]

> [!question]- "What is the time and space complexity of your solution?" (asked after nearly every coding question)
> Answer both, and name the variables. For example: "O(n) time, because I make one pass and each set operation is O(1) on average. O(n) extra space, for the set, in the worst case when every item is distinct. The output list does not count as extra space." If there is a sort, say O(n log n) and name which step dominates. If it is recursive, give the stack depth as part of the space.

> [!question]- "Why is appending to a dynamic array O(1) if it sometimes has to copy everything?"
> Because the capacity grows by a constant factor. With doubling, appending n items triggers copies of 1, 2, 4, up to n/2 items, which sum to less than n. So n appends do less than 2n work in total, which is O(1) per append amortized. If it grew by a fixed number of slots instead, the copies would sum to about n²/2 and append would be O(n). A single append can still be O(n); amortized is a bound over the whole sequence.

> [!question]- "Can you do better?" (about an O(n²) solution)
> First check what the input size allows: with n up to 10⁵, O(n²) is about 10¹⁰ steps, too slow, so O(n log n) or O(n) is expected. Then look for repeated work: an inner loop that searches can usually become a hash lookup; an inner loop that sums a range can use a precomputed running total; sorting first can unlock two pointers or binary search. Say the trade-off out loud: most speedups spend O(n) memory to save time.

> [!question]- What is the complexity of `for x in a: if x in b: count += 1`, with `len(a) = n` and `b` a list of size m? What if `b` is a set?
> With a list, each `in` scans up to m items, so O(n · m). With a set, each `in` is O(1) on average, so O(n), plus O(m) once to build the set if you have to make it.

> [!question]- A list's capacity grows by 1.125 times each time it fills, not 2 times. Is `append` still amortized O(1)?
> Yes. Any constant growth factor above 1 makes the copy sizes a geometric series, whose sum is a constant multiple of n. A smaller factor means more frequent copies (a bigger constant) but less wasted memory. Only growing by a fixed number of slots breaks it, giving O(n) per append.

> [!question]- A recursive function visits each of n items once and creates no lists. What is its space complexity, and what happens in Python at n = 50,000?
> O(n) for the call stack, because n frames are waiting at the deepest point. In Python it raises `RecursionError` long before that, since the default limit is 1,000 frames. Rewrite it as a loop.

### From [[amortized-analysis|Amortized analysis]]

> [!question]- A list grows by 50% each time it fills. Is append amortized O(1)?
> Yes. Any constant growth factor above 1 makes the copy sizes a geometric series whose sum is a constant times n.

> [!question]- What is the difference between "O(1) average" and "O(1) amortized"?
> Average is over likely inputs and can be broken by bad inputs. Amortized is a guarantee over any sequence of
> operations: the total for n operations is O(n), even if individual operations vary.

### From [[dynamic-array|Dynamic array]]

> [!question]- Why is `append` O(1) amortized but `insert(0, x)` O(n) on a Python list?
> Append writes into spare capacity at the end and only occasionally resizes, which averages out to O(1). Inserting at
> the front must shift every existing item one slot to the right, every time.

> [!question]- Why does a dynamic array grow by a factor rather than by, say, 100 slots?
> Growing by a fixed amount means a full copy every 100 appends, so n appends copy about n²/200 items: O(n) per append.
> A factor makes the copies a geometric series that sums to O(n) total.
