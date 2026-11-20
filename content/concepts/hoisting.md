---
title: Hoisting
aliases: [hoisted]
type: concept
track: javascript
requires: [lexical-scope]
description: JavaScript creates every name declared in a scope before running any of the scope's code; var starts as undefined, functions start ready, let/const/class start unusable.
depth: solid
sources:
  - https://tc39.es/ecma262/#sec-functiondeclarationinstantiation
  - https://tc39.es/ecma262/#sec-variable-statement
  - https://tc39.es/ecma262/#sec-let-and-const-declarations
created: 2026-11-20
updated: 2026-11-20
---
<!-- read-first -->
> [!info] Read first
> [[lexical-scope|Lexical scope]]
<!-- /read-first -->

Hoisting is the name for a simple fact: before JavaScript runs the code in a scope, it scans the scope and creates
every name declared in it. Nothing physically moves to the top; the names just exist from the start. What differs is
the state each kind of name starts in.

## How it works

| Declaration | Created at | Starts as | Use before its line |
|---|---|---|---|
| `var x` | start of the function | `undefined` | gives `undefined` |
| `function f() {}` | start of the function | the finished function | works |
| `let x`, `const x` | start of the block | uninitialized | throws `ReferenceError` |
| `class C {}` | start of the block | uninitialized | throws `ReferenceError` |
| `var f = () => {}` | start of the function | `undefined` | calling it throws `TypeError` |

The stretch where a `let`, `const` or `class` name exists but cannot be used is the
[[temporal-dead-zone|temporal dead zone]].

Only the **declaration** is hoisted, never the assignment. `var x = 5` acts like `var x` at the top and `x = 5`
on its own line.

## Example

```js run
console.log(typeof hello, typeof later);   // function undefined
function hello() {}
var later = () => {};

try { new Thing(); } catch (e) { console.log(e.name); }   // ReferenceError
class Thing {}

function f() { return g(); }       // fine: g is only read when f runs
const g = () => 'ok';
console.log(f());                  // ok
```

The last example matters in practice. A function can mention a `const` declared below it, as long as the function
is not **called** until after that line has run. The dead zone is about time, not position on the page.

## Traps

- Reading a `var` before its line gives `undefined` silently, which hides bugs. Prefer `let` and `const`.
- Function **expressions** and arrow functions assigned to variables are not hoisted as functions; only their
  variable is.
- In non-strict code, function declarations inside blocks have legacy rules (Annex B of the spec) that are easy
  to get wrong. Use strict mode or modules, where they are simply block-scoped.

## Related

[[lexical-scope|Lexical scope]] says which scope a name belongs to; hoisting says when it is created there.

## Check yourself

> [!question]- What does `console.log(a); var a = 1;` print, and what if you replace `var` with `let`?
> With `var`, `undefined`: the name exists from the start with that value. With `let`, a `ReferenceError`, because
> the name is in its temporal dead zone until its line runs.

> [!question]- Can you call a function declaration above the line where it is written? An arrow function stored in a `const`?
> The declaration, yes: it is hoisted with its body. The arrow function, no: the `const` is in its dead zone, so the
> call throws a `ReferenceError`.

<!-- leads-to -->
## Leads to

- [[temporal-dead-zone|Temporal dead zone]]: The time between entering a block and running a let, const or class declaration, during which the name exists but any access throws a ReferenceError.
<!-- /leads-to -->
