---
title: Closure
aliases: [closures]
type: concept
track: javascript
requires: [lexical-scope, call-stack]
description: A function together with the variables from the scope where it was created. It can keep using them after that scope has returned.
depth: solid
sources:
  - https://tc39.es/ecma262/#sec-ordinaryfunctioncreate
  - https://tc39.es/ecma262/#sec-environment-records
  - https://docs.python.org/3.13/reference/executionmodel.html#resolution-of-names
created: 2026-11-20
updated: 2026-11-20
---
<!-- read-first -->
> [!info] Read first
> [[lexical-scope|Lexical scope]] · [[call-stack|Call stack]]
<!-- /read-first -->

A closure is a function that remembers the variables around the place it was written. Return it, store it or pass
it as a callback, and it can still read and change those variables, even after the function that created them has
returned.

## How it works

When JavaScript creates a function object, it stores the current scope (an [[ecmascript-environment-records|environment record]], in the spec's words)
in a hidden slot of that object, `[[Environment]]`. Each time the function is called, the new scope for that call
gets the stored environment as its **outer** scope. Name lookup walks outward from there, by the rules of
[[lexical-scope|lexical scope]].

Normally a call's local variables disappear when the call's frame leaves the [[call-stack|call stack]]. If a
function created during the call is still reachable, it points to the call's environment, so the garbage collector
keeps that environment alive. Nothing is copied.

Two consequences follow:

- A closure holds **variables, not values**. If the variable changes later, the closure sees the new value.
- Every call creates **new** variables, so two calls of a factory give two independent closures. Functions created
  in the **same** call share the same variables.

## Example

```js run
function makeAdder(n) {
  return (x) => x + n;              // n is remembered from the call that made this function
}
const add5 = makeAdder(5);
const add10 = makeAdder(10);
console.log(add5(1), add10(1));     // 6 11

function once(fn) {
  let done = false, result;         // private state, one set per call of once
  return (...args) => {
    if (!done) { done = true; result = fn(...args); }
    return result;
  };
}
let calls = 0;
const init = once(() => ++calls);
init(); init(); init();
console.log(calls);                 // 1
```

Python closures work the same way. Each captured variable lives in a **cell** that both functions share
(`f.__closure__` lists them), and you need `nonlocal` to assign to one from the inner function.

## Where you meet them

Callbacks and event handlers, `setTimeout`, React hooks and components, module patterns with private state,
decorators in Python, and helpers such as `once`, `memoize` and `debounce`.

## Traps

- **The loop bug.** Callbacks created in a `for (var i ...)` loop all share one `i` and all see its final value.
  `let` gives each iteration its own variable. Python's `[lambda: i for i in range(3)]` has the same bug; fix it
  with a default argument, `lambda i=i: i`.
- **Stale values.** A closure created during an early React render keeps that render's state. It does not see later
  renders unless it is recreated.
- **Memory.** A long-lived closure keeps its whole environment reachable. Unregister listeners and clear timers
  when you are done.

## Related

[[lexical-scope|Lexical scope]] decides which variables a closure can see. [[hoisting|Hoisting]] and the
[[temporal-dead-zone|temporal dead zone]] decide when they can be used.

## Check yourself

> [!question]- Two functions are returned from one call of a factory. Do they share variables?
> Yes. Both were created in the same call's environment, so they see the same variables. A second call of the
> factory would create a separate set.

> [!question]- A closure reads a variable that is later reassigned. Which value does it see when it runs?
> The current value at the time it runs. Closures capture the variable itself, not a snapshot of its value.

<!-- leads-to -->
## Leads to

- [[ecmascript-environment-records|ECMAScript spec: environment records]]: The part of the ECMAScript specification that defines scopes as environment records linked to their outer scope, which is how closures, let and const are specified.
<!-- /leads-to -->
