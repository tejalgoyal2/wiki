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

### [[async-await|async / await]]

- `array.forEach(async ...)` does not wait. Use `for...of` with `await`, or `Promise.all(array.map(...))`.
- An `await` inside a loop makes the loop sequential. Sometimes that is right (rate limits), often it is just slow.
- Forgetting `await` gives you a promise object instead of the value, and errors from it go unhandled.

### [[event-loop|Event loop]]

- `setTimeout(fn, 0)` is a minimum delay, not "now".
- Endless microtasks starve rendering; endless tasks do not.
- Heavy synchronous code blocks everything. Move it to a [[web-worker|Web Worker]] or split it into chunks.

### [[microtask-queue|Microtask queue]]

- A microtask that keeps scheduling microtasks blocks the page completely: no paint, no input.
- In Node.js, `process.nextTick` callbacks have their own queue that runs **before** promise microtasks.

### [[promise|Promise]]

- A rejected promise nobody handles becomes an "unhandled rejection" (in Node 15+ this crashes the process by default).
- Forgetting to `return` inside a `.then` breaks the chain: the next step gets `undefined` and doesn't wait.
- A promise does not make work run in parallel or on another [[thread|thread]]. See [[concurrency-vs-parallelism]].

### [[task-queue|Task queue]]

- "Macrotask" is a nickname. The specs say "task".
- Between two tasks the browser can paint; inside one long task it cannot. Long tasks (over 50 ms) are what make pages feel slow.

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

### [[shallow-vs-deep-copy|Shallow vs deep copy]]

- A shallow copy of a flat list of numbers or strings is enough: those are immutable.
- `JSON.parse(JSON.stringify(x))` as a deep copy loses dates, `undefined`, `Map`, `Set` and functions. Prefer `structuredClone`.
- Deep copies cost time and memory. Copy only what you will change.

## CS Fundamentals

### [[hash-map|Hash map]]

- Keys must be **hashable** and must not change: lists can't be dict keys; tuples of hashable values can.
- In JavaScript, plain objects turn keys into strings (`obj[1]` and `obj["1"]` are the same key). Use `Map` for real keys of any type.
- O(1) is an average. Bad hash functions, or deliberately crafted keys, can make it slow.

### [[hash-map-lookup|Hash map lookup (pattern)]]

- Ask before you store, or an item can pair with itself.
- If the input is already sorted, two pointers may solve it in O(1) space instead.

Built on the [[hash-map|hash map]] concept.
