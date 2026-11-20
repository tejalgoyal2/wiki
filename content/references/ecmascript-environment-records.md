---
title: "ECMAScript spec: environment records"
aliases: [environment record, environment records]
type: reference
track: javascript
requires: [closure]
description: The part of the ECMAScript specification that defines scopes as environment records linked to their outer scope, which is how closures, let and const are specified.
sources:
  - https://tc39.es/ecma262/#sec-environment-records
  - https://tc39.es/ecma262/#sec-ordinaryfunctioncreate
  - https://tc39.es/ecma262/#sec-createperiterationenvironment
created: 2026-11-20
updated: 2026-11-20
---
<!-- read-first -->
> [!info] Read first
> [[closure|Closure]]
<!-- /read-first -->

**What it is:** the section of the ECMAScript Language Specification (ECMA-262, maintained by TC39) that defines how
names are stored and found. Every scope is an **environment record**: a set of bindings plus a link to the outer
record. There are kinds for declarations (functions and blocks), objects (the global object and `with`), functions,
modules and the global scope.

**Read:**

- [Environment Records](https://tc39.es/ecma262/#sec-environment-records): start with the overview and the table of
  abstract methods. "HasBinding", "InitializeBinding" and "GetBindingValue" are the steps behind every lookup.
- [OrdinaryFunctionCreate](https://tc39.es/ecma262/#sec-ordinaryfunctioncreate): where a new function object
  stores the current environment in its `[[Environment]]` slot. This one line is what makes closures.
- [CreatePerIterationEnvironment](https://tc39.es/ecma262/#sec-createperiterationenvironment): why each iteration of
  `for (let i ...)` gets its own `i`.
- [Let and Const Declarations](https://tc39.es/ecma262/#sec-let-and-const-declarations): the short note that
  defines the temporal dead zone.

**What it settles:**

- Lookup follows outer links set when a function is **created**, not when it is called, so scope is lexical.
- A binding can exist but be uninitialized, and reading it throws `ReferenceError`.
- `var` declarations go into the function's record; `let`, `const` and `class` go into the block's.

**Who relies on it:** [[closure]], [[lexical-scope]], [[hoisting]], [[temporal-dead-zone]], and the lesson
[[2026-11-20-closures-and-scope|#7 · Closures and scope]].
