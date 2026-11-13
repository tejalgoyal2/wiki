---
title: Call stack
aliases: [stack frame, stack frames, stack overflow]
type: concept
track: cs-fundamentals
description: The list of functions currently running, newest on top. A function's frame is pushed when it is called and popped when it returns.
depth: solid
sources:
  - https://developer.mozilla.org/en-US/docs/Glossary/Call_stack
  - https://docs.python.org/3/library/sys.html#sys.setrecursionlimit
created: 2026-11-12
updated: 2026-11-12
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

## Related

The heap is where objects live; frames on the stack only hold references to them.

## Check yourself

> [!question]- What does a stack frame hold?
> The function's arguments, its local variables, and where to return to when it finishes.

> [!question]- Why does infinite recursion crash instead of running forever?
> Each call adds a frame and none are removed, so the fixed-size stack fills up and the runtime raises an error.

<!-- leads-to -->
## Leads to

- [[2026-11-11-event-loop|#1 · The event loop]]: How JavaScript does many things at once with one thread, and why promise callbacks run before timers.
- [[event-loop|Event loop]]: The rule that decides when queued callbacks run in JavaScript - only when the call stack is empty, microtasks first.
- [[thread|Thread]]: A sequence of instructions the operating system can schedule. Threads in one process share memory; each has its own call stack.
<!-- /leads-to -->
