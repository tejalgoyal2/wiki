---
title: Lexical scope
aliases: [lexical scoping, block scope, function scope, scope chain, static scope]
type: concept
track: javascript
requires: [call-stack]
description: The rule that a name refers to the variable in the nearest enclosing scope in the source code, decided by where code is written, not where it is called from.
depth: solid
sources:
  - https://tc39.es/ecma262/#sec-environment-records
  - https://docs.python.org/3.13/reference/executionmodel.html#resolution-of-names
created: 2026-11-20
updated: 2026-11-20
---
<!-- read-first -->
> [!info] Read first
> [[call-stack|Call stack]]
<!-- /read-first -->

Scope is the region of code where a name can be used. **Lexical** scope means those regions follow the nesting of
the source code. To find what a name means, start where it is used and look outward through the enclosing blocks
and functions, as written, until you reach the global scope. JavaScript, Python, Go, [[java|Java]] and almost every modern
language work this way.

## How it works

Each scope has its own table of names, and a link to the scope that encloses it. A lookup checks the current table,
then follows the links outward: the scope chain. The first match wins, so an inner name **shadows** an outer one
with the same spelling. If nothing matches, JavaScript throws `ReferenceError` and Python raises `NameError`.

What creates a scope differs by language:

| | New scope for |
|---|---|
| JavaScript `let`, `const`, `class` | every block `{ ... }`, including each loop iteration |
| JavaScript `var` | only functions (and the global scope) |
| Python | functions, classes, modules (not `if` or `for` blocks) |
| Go, Java, C | every block |

## Example

```js run
const x = 'global';
function show() { return x; }        // written at the top level, so x means the global x
function caller() {
  const x = 'caller';
  return show();                     // being called from here does not matter
}
console.log(caller());               // global

function outer() {
  const a = 1;
  if (true) {
    const b = 2;                     // block-scoped: gone after the }
    var c = 3;                       // function-scoped: belongs to outer
  }
  console.log(a, typeof b, c);       // 1 undefined 3
}
outer();
```

If `show` printed `caller`, that would be **dynamic** scope, where lookup follows the chain of calls. Bash and
some old Lisps work that way. Lexical scope is what makes code readable: you can tell what a name means from the
page.

## Traps

- **`var` ignores blocks.** A `var` inside an `if` or a loop is visible in the whole function.
- **Python's loop variable outlives the loop**, and assigning to a name anywhere in a function makes it local to the
  whole function (`UnboundLocalError` if read first). Use `nonlocal` or `global` to assign outward.
- **Shadowing by accident.** An inner `let user` hides the outer `user` for the whole block, even before its line
  (see [[temporal-dead-zone|temporal dead zone]]).

## Related

[[closure|Closures]] are lexical scope that outlives the call. [[hoisting|Hoisting]] says when names in a scope are
created.

## Check yourself

> [!question]- A function defined at the top level reads `x`. It is called from inside another function that has its own `x`. Which `x` does it read?
> The top-level `x`. Lexical scope follows where the function was written, not who called it.

> [!question]- Does an `if` block create a new scope in Python? In JavaScript?
> Not in Python: only functions, classes and modules do. In JavaScript it does for `let`, `const` and `class`, but
> not for `var`.

<!-- leads-to -->
## Leads to

- [[closure|Closure]]: A function together with the variables from the scope where it was created. It can keep using them after that scope has returned.
- [[hoisting|Hoisting]]: JavaScript creates every name declared in a scope before running any of the scope's code; var starts as undefined, functions start ready, let/const/class start unusable.
- [[temporal-dead-zone|Temporal dead zone]]: The time between entering a block and running a let, const or class declaration, during which the name exists but any access throws a ReferenceError.
<!-- /leads-to -->
