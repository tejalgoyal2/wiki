---
title: Call stack
aliases: [stack frame, stack frames, stack overflow]
type: concept
track: cs-fundamentals
description: The list of functions currently running, newest on top. A function's frame is pushed when it is called and popped when it returns.
depth: deep
sources:
  - https://developer.mozilla.org/en-US/docs/Glossary/Call_stack
  - https://docs.python.org/3/library/sys.html#sys.setrecursionlimit
created: 2026-11-12
updated: 2026-11-21
---

The call stack is how a program remembers **where it is** and **where to go back to**. Each function call pushes a
**frame** (its arguments, local variables and return address) on top. When the function returns, its frame is popped
and execution continues in the frame below. Last in, first out.

## How it works

```js run
function b() {
  console.log('in b');            // stack: b, a
}
function a() {
  console.log('in a');            // stack: a
  b();                            // push b
  console.log('back in a');       // b was popped; a continues where it left off
}
a();
// in a
// in b
// back in a
```

Each thread has its own call stack. In JavaScript there is one [[thread|main thread]], so there is one call stack, and the
[[event-loop|event loop]] only runs a queued callback when that stack is empty.

## Stack overflow

The stack has a fixed size. Recursion that never stops (or goes too deep) fills it:

- JavaScript throws `RangeError: Maximum call stack size exceeded`.
- Python raises `RecursionError`; the default limit is 1000 frames (`sys.getrecursionlimit()`).

```py run
import sys
def depth(n):
    try:
        return depth(n + 1)
    except RecursionError:
        return n
print(depth(0) < sys.getrecursionlimit())   # True
```

Fixes: make sure every recursion has a base case, or rewrite deep recursion as a loop with your own stack (a list).

## What is inside a frame

A frame is more than "arguments and locals". In practice it holds:

| Part | What it is for |
|---|---|
| Arguments and local variables | The function's own data. Large objects are not stored here, only references to them on the heap |
| Return address | Which instruction to continue at in the caller once this function returns |
| Saved registers | Values the caller needs back after the call (in compiled languages) |
| Scope link | In JavaScript and Python, a pointer to the outer environment, which is how a [[closure\|closure]] finds its variables |

Python is a good place to see this, because frames are ordinary objects you can inspect:

```py run
import sys

def inner():
    frame = sys._getframe()            # the current frame
    caller = frame.f_back              # the frame below this one
    return frame.f_code.co_name, caller.f_code.co_name

def outer():
    return inner()

print(outer())                         # ('inner', 'outer')
```

Each frame points to the frame that called it, so the "stack" is really a linked list from the newest frame down to
the first call. A traceback is that list printed from top to bottom.

## Why the stack is fast, and why it is small

A call only needs to move a pointer and write a few values, so it is very cheap. The memory is handed back by simply
moving the pointer again on return, with no garbage collector involved. The price is that the stack has a fixed size
chosen when the thread is created, often a few hundred kilobytes to a few megabytes, and the frame sizes decide how
many calls fit. This is why a recursive function with big frames overflows earlier than one with small frames.

The heap has the opposite trade: it is large and flexible, objects can live as long as someone points at them, but
allocating and freeing costs more. A value must go on the heap whenever it has to outlive the call that made it.
That is exactly what happens to the variables a closure captures.

## Recursion depth in real languages

| Runtime | Limit | What you see |
|---|---|---|
| CPython 3.13 | 1000 frames by default (`sys.setrecursionlimit` changes it) | `RecursionError` |
| JavaScript (V8) | roughly 10,000 simple frames; depends on frame size | `RangeError: Maximum call stack size exceeded` |
| [[java\|Java]] | set by the thread stack size, often around 10,000 to 20,000 frames | `StackOverflowError` |

These numbers are rules of thumb that differ between versions and machines. Python's limit is a safety counter, not
the real memory limit: raising it too far crashes the whole interpreter instead of raising an exception.

```py run
import sys

def count_down(n):
    return 0 if n == 0 else 1 + count_down(n - 1)

print(count_down(500))                 # 500
try:
    count_down(100_000)
except RecursionError:
    print("too deep")                  # too deep
print(sys.getrecursionlimit())         # 1000
```

## Turning recursion into a loop

Any recursion can be rewritten with your own stack, a plain list on the heap. Depth-first search is the standard case:

```py run
def dfs(graph, start):
    seen, order = set(), []
    stack = [start]                    # our own call stack
    while stack:
        node = stack.pop()
        if node in seen:
            continue
        seen.add(node)
        order.append(node)
        stack.extend(reversed(graph[node]))
    return order

graph = {"a": ["b", "c"], "b": ["d"], "c": [], "d": []}
print(dfs(graph, "a"))                 # ['a', 'b', 'd', 'c']
```

The list grows on the heap, so depth is limited by memory, not by the frame limit.

## Frames that do not die: generators and async

A normal frame is destroyed when its function returns. A [[generator|generator]]'s frame is different: when it
yields, the frame is **detached** from the stack and kept on the heap, so it can be resumed later and carry on with
its locals intact. `async` functions work the same way: at an `await`, the rest of the function is saved and the
[[event-loop|event loop]] takes over. That is why a paused generator costs a few hundred bytes and no stack depth,
and why you can have a million of them.

## Tail calls

If the last thing a function does is call another function, the old frame is not needed any more, and a runtime could
reuse it. That is a tail call. The ECMAScript standard includes tail-call optimisation, but in practice only Safari's
engine ships it; Python and Java do not do it, and the Python language owner has said it will stay that way, to keep
tracebacks complete. Do not rely on it in interviews: write the loop.

## How interviews ask it

> [!question]- "What happens in memory when a function calls itself with no base case?"
> Each call pushes a new frame on the stack. None is popped, because no call returns. The fixed-size stack fills up and the runtime raises `RecursionError` in Python or `RangeError` in JavaScript, or crashes the process in languages that do not check.

> [!question]- "A recursive solution works on small inputs and overflows on large ones. What are your options?"
> Rewrite it as a loop with an explicit stack, or turn it into a bottom-up version. In Python you may raise the recursion limit slightly, but that is risky, because a too-large limit crashes the interpreter. Check first whether the recursion is needed at all.

## Related

The heap is where objects live; frames on the stack only hold references to them. [[generator|Generators]] keep their frames on the heap so they can pause.

## Check yourself

> [!question]- What does a stack frame hold?
> The function's arguments, its local variables, and where to return to when it finishes.

> [!question]- Why does infinite recursion crash instead of running forever?
> Each call adds a frame and none are removed, so the fixed-size stack fills up and the runtime raises an error.

<!-- leads-to -->
## Leads to

- [[2026-11-11-event-loop|#1 · The event loop]]: How JavaScript does many things at once with one thread, and why promise callbacks run before timers.
- [[2026-11-20-closures-and-scope|#7 · Closures and scope]]: How JavaScript decides which variable a name means, why a function keeps the variables it was born with, what var, let and const really change, and the loop-and-setTimeout bug that every interview asks about.
- [[2026-11-21-iterators-and-generators|#8 · Iterators and generators]]: How a Python for loop really works, what the iterator protocol is, how yield pauses a function, and how to build lazy pipelines that process huge or endless data in constant memory.
- [[closure|Closure]]: A function together with the variables from the scope where it was created. It can keep using them after that scope has returned.
- [[event-loop|Event loop]]: The rule that decides when queued callbacks run in JavaScript - only when the call stack is empty, microtasks first.
- [[generator|Generator]]: A Python function that uses yield to produce values one at a time, pausing between them. Calling it returns an iterator, and the function body does not start running until you ask for the first value.
- [[lexical-scope|Lexical scope]]: The rule that a name refers to the variable in the nearest enclosing scope in the source code, decided by where code is written, not where it is called from.
- [[thread|Thread]]: A sequence of instructions the operating system can schedule. Threads in one process share memory; each has its own call stack.
<!-- /leads-to -->
