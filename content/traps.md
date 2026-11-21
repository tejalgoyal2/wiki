---
title: Common traps
description: Every trap, gotcha and misconception from the wiki in one page, grouped by track.
generated: true
nolink: true
---

The mistakes that bite people in real code and in interviews, collected from every note. Each one links back to the
note that explains it. This page is generated, so it grows as the wiki does.

## JavaScript

### [[2026-11-11-event-loop|#1 · The event loop]]

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

### [[2026-11-20-closures-and-scope|#7 · Closures and scope]]

- **Closures capture variables, not values.** If the variable changes before the closure runs, the closure sees the change. To freeze a value, make a new variable per iteration or call.
- **`var` ignores blocks.** A `var` inside `if`, `for` or `{}` belongs to the whole function.
- **Shadowing into the dead zone.** `let x = 1; { console.log(x); let x = 2; }` throws. The inner `let x` is hoisted to the top of its block, so inside the block `x` means the inner one, which is not ready yet.
- **`const` is not [[mutability|immutable]].** It locks the name, not the object.
- **Stale closures in React.** `useEffect(() => { setInterval(() => setCount(count + 1), 1000) }, [])` keeps showing 1: the interval callback closed over the `count` from the first render, which is always 0. Use the updater form `setCount(c => c + 1)` or list `count` in the dependencies.
- **Closures keep memory alive.** A long-lived callback (an event listener, a timer, a cache) keeps its whole environment reachable. In V8 (Chrome, Node), closures made in the same scope share one context object, so a large array used only by a short-lived callback can stay alive as long as a long-lived sibling closure does. Remove listeners and clear timers you no longer need.
- **Python's `UnboundLocalError`.** Assigning to a name anywhere in a function makes it local for the whole function. Use `nonlocal` (or `global`) to assign to an outer variable.

### [[async-await|async / await]]

- `array.forEach(async ...)` does not wait. Use `for...of` with `await`, or `Promise.all(array.map(...))`.
- An `await` inside a loop makes the loop sequential. Sometimes that is right (rate limits), often it is just slow.
- Forgetting `await` gives you a promise object instead of the value, and errors from it go unhandled.

### [[closure|Closure]]

- **The loop bug.** Callbacks created in a `for (var i ...)` loop all share one `i` and all see its final value.
  `let` gives each iteration its own variable. Python's `[lambda: i for i in range(3)]` has the same bug; fix it
  with a default argument, `lambda i=i: i`.
- **Stale values.** A closure created during an early React render keeps that render's state. It does not see later
  renders unless it is recreated.
- **Memory.** A long-lived closure keeps its whole environment reachable. Unregister listeners and clear timers
  when you are done.

### [[event-loop|Event loop]]

- **`setTimeout(fn, 0)` is a minimum delay, not "now".** The callback waits for the current task and every microtask,
  and it waits longer if the thread is busy:

  ```js run
  const start = Date.now();
  setTimeout(() => console.log('waited at least 50 ms:', Date.now() - start >= 50), 0);
  while (Date.now() - start < 50) {}   // block the thread for 50 ms
  console.log('loop finished');
  // loop finished
  // waited at least 50 ms: true
  ```

  Browsers also clamp nested timers: after several levels of nesting, the minimum delay becomes 4 ms.
- **Endless microtasks starve rendering; endless tasks do not.** A promise chain that keeps adding microtasks never
  lets the loop reach the render step, so the page freezes. A chain of `setTimeout` calls is fine, because the browser
  can paint between tasks. In Node.js, recursive `process.nextTick` starves I/O in the same way.
- **Heavy synchronous code blocks everything,** including clicks, rendering and other timers. Move it to a
  [[web-worker|Web Worker]], or split it into chunks that each run as a separate task.
- **`nextTick` vs promise order depends on module type in Node.js.** In a CommonJS file, top-level `process.nextTick`
  runs before a top-level `.then`. In an ES module (`.mjs`), the module itself is evaluated asynchronously, so the
  promise microtask can run first. Inside callbacks, `nextTick` is always first. Do not write code whose correctness
  depends on this.
- **A `for` loop of `await`s runs one at a time.** Each `await` hands control back to the loop and waits. To run
  independent requests together, start them all first and `await Promise.all(...)`.

### [[hoisting|Hoisting]]

- Reading a `var` before its line gives `undefined` silently, which hides bugs. Prefer `let` and `const`.
- Function **expressions** and arrow functions assigned to variables are not hoisted as functions; only their
  variable is.
- In non-strict code, function declarations inside blocks have legacy rules (Annex B of the spec) that are easy
  to get wrong. Use strict mode or modules, where they are simply block-scoped.

### [[lexical-scope|Lexical scope]]

- **`var` ignores blocks.** A `var` inside an `if` or a loop is visible in the whole function.
- **Python's loop variable outlives the loop**, and assigning to a name anywhere in a function makes it local to the
  whole function (`UnboundLocalError` if read first). Use `nonlocal` or `global` to assign outward.
- **Shadowing by accident.** An inner `let user` hides the outer `user` for the whole block, even before its line
  (see [[temporal-dead-zone|temporal dead zone]]).

### [[microtask-queue|Microtask queue]]

- A microtask that keeps scheduling microtasks blocks the page completely: no paint, no input.
- In Node.js, `process.nextTick` callbacks have their own queue that runs **before** promise microtasks.
- Awaiting a value that is already available still yields. `await` always gives other microtasks queued earlier a chance
  to run first.
- Do not rely on exact tick counts between two promise chains. The numbers can differ between engines and versions.
- A heavy synchronous loop inside a `.then` callback is still a long task. Putting work in a microtask makes it run
  earlier, not off the [[thread|main thread]]. For that you need a [[web-worker|web worker]].
- `queueMicrotask` is not a delay. If you want the browser to render before your code runs, you need a task or
  `requestAnimationFrame`, not a microtask.

### [[promise|Promise]]

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

### [[task-queue|Task queue]]

- "Macrotask" is a nickname. The specs say "task".
- Between two tasks the browser can paint; inside one long task it cannot. Long tasks (over 50 ms) are what make pages feel slow.

### [[temporal-dead-zone|Temporal dead zone]]

- **`typeof` is not a safe check here.** It is for undeclared names; on a dead-zone name it throws.
- **Default parameters have one too.** `function f(a = b, b = 1) {}` throws when called without arguments, because
  `b` is still in its dead zone when `a`'s default is computed.
- **Circular module imports.** A module that reads an imported `const` before the exporting module has run its
  declaration gets a `ReferenceError`.

## Python & Data

### [[2026-11-12-python-object-model|#2 · Python's object model]]

**1. The mutable default argument.** Default values are evaluated **once**, when the `def` line runs, and stored on
the function. A mutable default is shared by every call.

```py run
def add_item(item, bucket=[]):
    bucket.append(item)
    return bucket

print(add_item("a"))          # ['a']
print(add_item("b"))          # ['a', 'b']   <- the same list again
print(add_item.__defaults__)  # (['a', 'b'],)

# Fix: use None as the signal and build a new list inside
def add_item(item, bucket=None):
    if bucket is None:
        bucket = []
    bucket.append(item)
    return bucket
```

The same trap appears with `{}` and `set()` defaults.

**2. [[shallow-vs-deep-copy|Shallow copy]] vs deep copy.** `lst.copy()`, `list(lst)`, `lst[:]` and `dict.copy()` make a **shallow copy**: a new
outer container that holds the **same inner objects**. `copy.deepcopy()` copies everything, all the way down.

```py run
import copy
grid = [[0, 0], [0, 0]]
shallow = grid.copy()
deep = copy.deepcopy(grid)
shallow[0][0] = 1
print(grid)                                    # [[1, 0], [0, 0]]  <- changed!
print(deep)                                    # [[0, 0], [0, 0]]
print(shallow is grid, shallow[0] is grid[0])  # False True
```

**3. `[[0] * 2] * 2` makes one row twice.** The outer `*` repeats the reference, not the row.

```py run
board = [[0] * 2] * 2
board[0][0] = 1
print(board)    # [[1, 0], [1, 0]]
board = [[0] * 2 for _ in range(2)]   # a new row each time
board[0][0] = 1
print(board)    # [[1, 0], [0, 0]]
```

**4. `is` with numbers and strings is luck.** CPython keeps one shared object for each small int from -5 to 256, so
`int("256") is int("256")` is `True` but `int("257") is int("257")` is `False`. That is an implementation detail, not a
rule. Compare values with `==`.

**5. A tuple is immutable; its contents may not be.** `t = ([1], 2)` then `t[0].append(99)` works and gives
`([1, 99], 2)`. The tuple still points at the same list; the list changed. And a tuple can only be a [[hash-map|dict]] key or set
member if everything inside it is hashable, so `([1], 2)` cannot be a key.

### [[2026-11-21-iterators-and-generators|#8 · Iterators and generators]]

- **One-shot.** `sum(gen)` twice gives the real answer, then `0`. A function that returns a generator can be consumed once. If you need two passes, make a list, or call the generator function again.
- **Silent exhaustion.** `if gen:` is always true: a generator object has no length and is never "empty" as a truth value. Use `next(gen, None)` to peek.
- **Late errors.** An exception in the body appears at the `next()` call that reached it, far from where the generator was created. Debugging pipelines means finding which stage raised.
- **Late binding in generator expressions.** Only the outermost iterable is evaluated at once. Everything else waits for the first `next()`:

```py run
x = 10
g = (x * i for i in range(3))   # range(3) is evaluated now; x is looked up later
x = 100
print(list(g))                  # [0, 100, 200]   it used the new x
```

- **`tee` and memory.** `itertools.tee` copies one iterator into several, but it buffers the items that one copy has seen and another has not. Far apart consumers can use as much memory as a list.
- **Not a list.** No `len()`, no indexing, no slicing with `[:3]`. Use `islice`.
- **Python-only habit.** JavaScript has the same idea (`function*`, `Symbol.iterator`, and async iterators for streams). The protocol differs: JavaScript's `next()` returns `{ value, done }` instead of raising an exception.

### [[generator|Generator]]

- A generator is one-shot, like any iterator. A second `list(g)` is empty.
- In a generator expression only the outermost iterable is evaluated immediately; everything else waits until the
  first `next()`.
- Exceptions raised inside the body appear at the `next()` call, not at the line that created the generator.
- `return value` inside a generator ends it and carries the value in `StopIteration.value`.

### [[iterator|Iterator]]

- Exhausted iterators look like empty ones. Check whether a function returns a list or an iterator.
- `map`, `filter`, `zip`, `enumerate` and `reversed` return iterators in Python 3, not lists.
- Changing a list while iterating over it moves the position under the iterator, so items get skipped.

### [[lazy-evaluation|Lazy evaluation]]

- Laziness hides work. An error or a slow step happens at the consumer, far from where you wrote it.
- You cannot ask a lazy stream for its length or index into it.
- Lazy is not always faster: if you need every item twice, store them once in a list.

### [[shallow-vs-deep-copy|Shallow vs deep copy]]

- A shallow copy of a flat list of numbers or strings is enough: those are immutable.
- `JSON.parse(JSON.stringify(x))` as a deep copy loses dates, `undefined`, `Map`, `Set` and functions. Prefer `structuredClone`.
- Deep copies cost time and memory. Copy only what you will change.

## ML & Data Science

### [[2026-11-13-overfitting|#3 · Overfitting and the bias-variance trade-off]]

Most real failures are not overfitting in the textbook sense. They are data leakage: information from outside the
training data, or from the future, gets into training, so the held-out score is too good. The model then fails in
production, where that information is not there. Kaufman and colleagues, in a 2012 paper, describe it as using
information that would not legitimately be available when the model makes real predictions. Four forms come up again
and again.

**1. Preprocessing on all the data before splitting.** Scaling, filling in missing values, or selecting features
using the full dataset lets the test rows shape the model. The effect can be huge. Below, the labels are coin flips
and every feature is random noise, so no honest model can beat 50%.

```py run
import random

random.seed(1)
n_rows, n_features = 60, 2000
# pure noise: the labels are coin flips and no feature has anything to do with them
X = [[random.gauss(0, 1) for _ in range(n_features)] for _ in range(n_rows)]
y = [random.randint(0, 1) for _ in range(n_rows)]

def top_features(rows, labels, k=10):
    # score each feature by the gap between its mean in class 1 and in class 0
    def gap(j):
        a = [r[j] for r, l in zip(rows, labels) if l == 1]
        b = [r[j] for r, l in zip(rows, labels) if l == 0]
        return abs(sum(a) / len(a) - sum(b) / len(b))
    return sorted(range(len(rows[0])), key=gap, reverse=True)[:k]

def nearest_centroid_accuracy(train, test, feats):
    def centroid(c):
        rows = [r for r, l in train if l == c]
        return [sum(r[j] for r in rows) / len(rows) for j in feats]
    cents = {c: centroid(c) for c in (0, 1)}
    def dist(r, c):
        return sum((r[j] - m) ** 2 for j, m in zip(feats, cents[c]))
    hits = sum(min((0, 1), key=lambda c: dist(r, c)) == l for r, l in test)
    return hits / len(test)

data = list(zip(X, y))
train, test = data[:40], data[40:]

leaky = top_features(X, y)                                            # features chosen using ALL rows
honest = top_features([r for r, _ in train], [l for _, l in train])  # features chosen using train rows only
print("leaky :", nearest_centroid_accuracy(train, test, leaky))   # leaky : 0.85
print("honest:", nearest_centroid_accuracy(train, test, honest))  # honest: 0.4
```

With 2,000 noise features, some happen to line up with the 20 test labels by chance. Choosing features while looking
at those labels finds them, and the test score jumps to 85% on pure noise. The fix: fit every preprocessing step on
the training rows only, then apply it to the others. In scikit-learn, put the steps in a `Pipeline` so
cross-validation refits them inside every fold (see scikit-learn's
[common pitfalls](https://scikit-learn.org/stable/common_pitfalls.html) page).

**2. Features that are only known after the answer.** Predicting whether a customer will cancel, with a column
"days since last support call about cancelling". Predicting a diagnosis with a column for the treatment given. These
are called target leakage: the feature is a consequence of the label. Ask of every column: at the moment the model
makes this prediction in real life, would this value exist yet?

**3. A random split on time-ordered data.** If you shuffle a year of daily sales and split randomly, the model trains
on December and is tested on November. In production it will never see the future. Split by time: train on the past,
validate on what came after (scikit-learn's `TimeSeriesSplit` does this for cross-validation).

**4. The same entity on both sides.** Several X-rays from one patient, several rows per user, near-duplicate
images. If the patient is in both training and test sets, the model can recognise the patient instead of the disease.
Split by group, so all rows of one patient land on one side (`GroupKFold`).

**And the quiet one: tuning on the test set.** Every time you look at the test score and change something, some of
the test set leaks into your choices. Use validation for decisions; use test once.

### [[bias-variance-trade-off|Bias-variance trade-off]]

- **"Bias" here is not fairness bias.** It means systematic error of the model family, not discrimination against
  a group. Interviews sometimes test whether you mix them up.
- **Very large models do not always follow the U.** Heavily over-parameterised networks can see test error fall
  again past the point where they fit training data perfectly ("double descent"). The classic U is still the right
  first answer, and the right way to choose is still validation error.

### [[cross-validation|Cross-validation]]

- **Preprocessing outside the folds leaks.** Scaling or selecting features on all the training data, then
  cross-validating, lets each validation fold shape its own preprocessing. Put the steps in a `Pipeline` so they are
  refitted inside every fold. See [[data-leakage|data leakage]].
- **Tuning and reporting on the same folds is optimistic.** If you also need an honest score from cross-validation
  alone, use nested cross-validation: an inner loop to tune, an outer loop to score.
- **It costs k times the training.** For large models or datasets, a single validation split is often good enough.

### [[data-leakage|Data leakage]]

- **One feature dominates the importance chart.** That is often a leak, not a breakthrough. Look at what it records
  and when it is filled in.
- **IDs and timestamps can leak.** A patient ID or a row number can correlate with the label if data was collected or
  sorted by outcome.
- **The serving pipeline computes features differently.** If training used a field cleaned after the fact, and
  production sees the raw value, it is the same problem from the other side.

### [[overfitting|Overfitting]]

- **A big gap is not always overfitting.** If test data comes from a different time or population than the training
  data, the gap can be distribution shift. Check the split before adding regularisation.
- **A suspiciously good validation score is not a good fit.** It is more often [[data-leakage|data leakage]].
- **Choosing among many models can overfit the [[train-validation-test-split|validation set]].** That is why the final number comes from a test set
  you did not use for choices.

### [[train-validation-test-split|Train, validation and test split]]

- **Shuffling time-ordered data.** If rows have dates, split by date: train on the past, test on the future.
- **Related rows on both sides.** Several rows per user or patient must all land in the same split, or the model can
  recognise the user instead of learning the pattern.
- **Imbalanced classes.** With 2% positives, a random 15% split might hold very few. Use a stratified split, which
  keeps the class ratio the same in every group.
- **Fitting preprocessing before splitting.** That is [[data-leakage|data leakage]]: scalers, encoders and feature
  selection must be fitted on the training set only.

## LLMs & RAG

### [[2026-11-17-tokens|#4 · Tokens and context windows]]

- **Counting characters or words.** English averages roughly four characters per token, but that is a rule of thumb for English prose only. Code, numbers, other languages and emoji differ.
- **Using another model's tokenizer.** Vocabularies differ between model families. A count from one is only an estimate for another.
- **Forgetting the reply.** Input plus output must fit in the window. Many APIs also cap the output length separately.
- **Leading spaces and case.** `hello`, ` hello` and `Hello` are usually different tokens. Stray whitespace in a prompt changes the count and can change behaviour slightly.
- **Letter-level tasks.** "How many r's in strawberry?" asks about characters, but the model sees a few chunks. Do exact string work in code.
- **Numbers.** Long numbers are split into chunks in tokenizer-specific ways, which is one reason arithmetic on long numbers is unreliable.

### [[byte-pair-encoding|Byte-pair encoding]]

- The merge order is part of the tokenizer. Replaying merges in a different order gives different tokens.
- A vocabulary learned on English splits other languages and code into more pieces, so the same meaning costs more tokens.
- BPE is not the only method. WordPiece and the Unigram model (SentencePiece) also build subword vocabularies.

### [[context-window|Context window]]

- Forgetting to reserve room for the reply.
- Measuring the prompt in characters. Count tokens with the target model's counter.
- Assuming the model will use every part of a long context equally well.

### [[token|Token]]

- English averages roughly four characters per token. That is a rule of thumb for English prose, not for code, numbers or other languages.
- `hello`, ` hello` and `Hello` are usually different tokens.
- Counting with another model's tokenizer gives only an estimate. Use the provider's counter for the model you call.
- Because the model sees chunks, not letters, letter-level tasks (count the r's, reverse a word) are unreliable. Do them in code.

## Backend & System Design

### [[2026-11-18-http|#5 · HTTP in depth]]

- **Using GET to change things.** Crawlers, link previewers and browsers prefetch GET URLs. A "delete" link that is a GET will eventually be clicked by a robot.
- **Retrying POST blindly.** A timeout does not mean failure. Use an idempotency key, or make the operation idempotent.
- **Returning 200 with an error in the body.** Clients, proxies and monitoring read the status code. Use the right one.
- **Mixing up 401 and 403.** 401 is about identity, 403 is about permission.
- **Forgetting `Content-Length`** on a keep-alive connection. The client cannot tell where the response ends, so it hangs or the server has to close the connection.
- **"HTTP/2 is always faster".** It helps with many small requests. On a lossy network the shared TCP connection can be slower than several separate ones.
- **Treating the reason phrase as data.** `404 Not Found` and `404 Nope` are the same response. Only the number counts (and HTTP/2 drops the phrase entirely).

### [[kafka|Apache Kafka]]

- No global order across partitions. Choose the key so that events that must stay in order share a key.
- Consumers get records **at least once** by default; after a crash a record can be seen twice, so handle repeats
  (see [[idempotency|idempotency]]).
- A slow consumer does not slow producers; it just falls behind, which you see as lag (the gap between the newest
  offset and its offset).

### [[continuous-integration|Continuous integration]]

- Merging only once a week is not integration. Small, frequent changes keep conflicts small.
- A flaky test is worse than none: people stop trusting the signal.
- Secrets in pipeline files leak. Use the tool's secret store.
- "Passes on my machine" is why CI builds in a clean environment.

### [[go-language|Go (programming language)]]

- **Loop variables before Go 1.22.** A loop declared one variable for all iterations, so goroutines and closures
  started in the loop often saw only the last value. Go 1.22 gives each iteration its own variable (for modules that
  declare `go 1.22` or later).
- **Goroutine leaks.** A goroutine blocked forever on a channel nobody writes to is never freed.
- **Nil maps.** Reading a nil map is fine; writing to one panics. Create maps with `make`.

### [[http|HTTP]]

- Statelessness does not mean no state: cookies and [[token|tokens]] carry state with each request.
- A `GET` must not change data. Robots and prefetchers send `GET` freely.
- The status code is the contract. A `200` with an error message in the body hides failures from clients and monitoring.
- Versions change performance, not meaning. Code written against methods and status codes works on all three.

### [[http-status-codes|HTTP status codes]]

- `200` with `{"error": ...}` in the body fools every tool that reads the status.
- `401` is the confusing name: it really means unauthenticated.
- Do not return `500` for bad input; that is a `4xx`. Do not return `404` to hide a permission problem unless you mean to.
- Redirect codes differ on whether a `POST` becomes a `GET` when followed (301 and 302 may; 307 and 308 do not).

### [[idempotency|Idempotency]]

- Idempotent does not mean safe. `DELETE` changes state; it is just fine to repeat.
- "Append" and "increment" are not idempotent. "Set to this value" is.
- Check-then-act without a unique constraint races: two retries at once can both pass the check. Enforce the key with a unique index.
- Storing the key forever costs space; storing it too briefly allows duplicates after a long outage.

### [[tcp|TCP]]

- **Assuming one `send` equals one `recv`.** Reads can return part of a message or several messages. Always frame.
- **Reliable does not mean delivered.** TCP retries, but if the connection breaks, data in flight is lost and the
  sender may not know whether the other side processed it. That is why [[idempotency|idempotency]] matters.
- **Head-of-line blocking.** Because bytes are delivered in order, one lost packet stalls everything behind it on that
  connection. HTTP/3 moves to QUIC over UDP partly for this reason.

### [[tls|TLS]]

- **Turning verification off** (`verify=False` in `requests`, `CERT_NONE`) to make an error go away. The connection
  is still encrypted, but to whoever answered, which is exactly what TLS is meant to stop.
- **Expired certificates** are a common cause of outages. Automate renewal (for example with ACME and Let's Encrypt)
  and monitor expiry dates.
- **Encryption is not authorization.** TLS proves who the server is; it says nothing about whether the user may do
  what they ask.

### [[unit-testing|Unit testing]]

- Testing implementation details (which helper was called) instead of behaviour. The test then breaks on every refactor.
- Tests that depend on order, the current time or a live service, so they fail at random.
- Over-mocking: if everything is mocked, the test proves only that the mocks agree with themselves.
- Treating a coverage percentage as quality. Lines run is not the same as behaviour checked.

## CS Fundamentals

### [[2026-11-19-big-o-for-real|#6 · Big-O for real]]

- **"One loop means O(n)."** Only if the body is O(1). A slice, `in` on a list, `sorted`, `pop(0)` or `str.replace` inside the loop multiplies.
- **Building a string or list with `+` in a loop.** Each `+` copies everything so far: O(n²) in principle. CPython can sometimes extend a string in place, but do not rely on it; use `"".join(parts)` or `list.append`. `sum(list_of_lists, [])` is quadratic for the same reason.
- **Forgetting the stack.** A recursive solution with "no extra data structures" is still O(depth) space, and in Python it fails past about 1,000 levels.
- **Treating amortized as worst case.** Amortized O(1) means one call can still be O(n). That is fine for throughput and not fine for strict latency.
- **Calling hash lookups O(1) without the word "average".** The worst case is O(n) when keys collide.
- **Merging two different sizes into one n.** Two nested loops over lists of size n and m are O(n · m). If m is always 26, that is O(n).
- **Optimizing the wrong part.** An O(n log n) sort before an O(n²) loop does not matter; the loop does. Find the dominant term first.

### [[amortized-analysis|Amortized analysis]]

- **Amortized is not average case.** Average case assumes typical inputs. Amortized holds for every sequence of
  operations, even adversarial ones. A [[hash-map|hash map]] lookup is O(1) on *average*; its resize cost is O(1)
  *amortized*.
- **One call can still be slow.** If every single operation must finish within a deadline (audio, games, a tight
  latency target), amortized O(1) is not enough.
- **Shrinking needs care.** If an array halves as soon as it is half empty, alternating append and pop at that
  boundary resizes every time. Implementations shrink later (for example at a quarter full).

### [[b-tree|B-tree]]

- An index speeds reads but slows writes, since each insert must also update the tree.
- A B-tree helps with `=`, ranges and sorting. It does not help with `LIKE '%text'` (unknown prefix).
- A multi-column index is ordered by its first column first; a query on only the second column cannot use it well.
- Random keys (such as random UUIDs) spread inserts over the whole tree and cause more page splits than increasing keys.

### [[big-o-notation|Big-O notation]]

- **Counting lines instead of work.** `x in items`, slicing, `sorted`, `pop(0)` and `+` on lists are each one line
  and O(n) or more.
- **Ignoring constants when n is small.** For n = 20, an O(n²) loop over a list can beat an O(n) solution that builds
  a dict. Big-O is about growth, not about which is faster today.
- **Forgetting the call stack.** Recursion n levels deep is O(n) space even without any data structure.
- **Dropping a variable that matters.** O(n + m) is not O(n) if m can be much larger than n.
- **Saying O(1) for a hash lookup without "average".** Its worst case is O(n).

### [[cpu|CPU]]

- More threads than cores does not add speed for CPU-bound work. In CPython, the [[gil|GIL]] also stops threads running Python code in parallel; use processes for CPU-bound work.
- A program waiting on disk or network leaves the CPU idle. That is I/O-bound work, and threads or async help there.
- Big-O ignores the cache. Two O(n) loops can differ a lot in real time.

### [[dynamic-array|Dynamic array]]

- **`list.pop(0)` and `list.insert(0, x)` are O(n).** For a queue, use `collections.deque`, which is O(1) at both ends.
- **Pre-sizing is rarely needed in Python.** `[None] * n` is fine when you know n, but appending in a loop is already
  amortized O(1).
- **References, not values.** A Python list stores pointers to objects, so `getsizeof` counts the slots, not the
  objects they point at.
- **Memory can stay high.** A list that grew to a million items and was then mostly cleared with `pop()` keeps some
  of its capacity until it shrinks or is rebuilt.

### [[hash-map|Hash map]]

- Keys must be **hashable** and must not change: lists can't be dict keys; tuples of hashable values can.
- In JavaScript, plain objects turn keys into strings (`obj[1]` and `obj["1"]` are the same key). Use `Map` for real keys of any type.
- O(1) is an average. Bad hash functions, or deliberately crafted keys, can make it slow.

### [[hash-map-lookup|Hash map lookup (pattern)]]

- Ask before you store, or an item can pair with itself.
- If the input is already sorted, [[two-pointers|two pointers]] may solve it in O(1) space instead.

Built on the [[hash-map|hash map]] concept.

### [[thread|Thread]]

- **"It worked when I ran it"** is not evidence. Races are about rare timings.
- **`join()` forgotten:** the main thread may exit, or read results, before workers finish.
- **Locks held across slow calls:** you turn a parallel program back into a serial one.
- **Threads for CPU work in CPython:** with the GIL they add overhead and no speed-up. Use `multiprocessing` or the free-threaded build.
- **Shared mutable defaults and globals:** the same trap as in [[mutability|mutable default arguments]], now with timing on top.
- **Unbounded thread creation:** one thread per request can exhaust memory (each thread reserves stack space). Use a pool.
