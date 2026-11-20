---
title: Temporal dead zone
aliases: [TDZ]
type: concept
track: javascript
requires: [hoisting, lexical-scope]
description: The time between entering a block and running a let, const or class declaration, during which the name exists but any access throws a ReferenceError.
depth: solid
sources:
  - https://tc39.es/ecma262/#sec-let-and-const-declarations
  - https://tc39.es/ecma262/#sec-declarative-environment-records
created: 2026-11-20
updated: 2026-11-20
---
<!-- read-first -->
> [!info] Read first
> [[hoisting|Hoisting]] · [[lexical-scope|Lexical scope]]
<!-- /read-first -->

A `let`, `const` or `class` name is created when its block starts, like every hoisted name, but it starts
**uninitialized**. Until the line that declares it has run, reading it, writing it, or even asking `typeof` about it
throws a `ReferenceError`. That window is the temporal dead zone. "Temporal" because it is about **when** code runs,
not where it sits on the page.

## How it works

When a block starts, the engine adds each `let`, `const` and `class` name to the block's scope with no value, and
marks it uninitialized. Any access checks that mark first. Running the declaration line sets the value (or
`undefined` for a bare `let x;`) and clears the mark.

The spec's wording is that such variables "may not be accessed in any way until the variable's LexicalBinding is
evaluated."

## Example

```js run
let x = 1;
{
  try {
    console.log(x);          // the inner x below already owns this name in the block
  } catch (e) {
    console.log(e.name);     // ReferenceError
  }
  let x = 2;
  console.log(x);            // 2
}
console.log(typeof neverDeclared);   // undefined: typeof is safe for names that don't exist
```

The outer `x` is shadowed for the **whole** block, including the lines before the inner `let x`. Many people expect
the first line to print 1.

## Why it exists

Without it, `const` could be read as `undefined` first and as its real value later, so it would not really be
constant. Throwing early also catches use-before-define bugs that `var` hides by returning `undefined`.

## Traps

- **`typeof` is not a safe check here.** It is for undeclared names; on a dead-zone name it throws.
- **Default parameters have one too.** `function f(a = b, b = 1) {}` throws when called without arguments, because
  `b` is still in its dead zone when `a`'s default is computed.
- **Circular module imports.** A module that reads an imported `const` before the exporting module has run its
  declaration gets a `ReferenceError`.

## Related

[[hoisting|Hoisting]] creates the name; the dead zone lasts until the declaration runs. See
[[lexical-scope|Lexical scope]] for which block owns the name.

## Check yourself

> [!question]- Why does `typeof x` throw inside the dead zone but return `"undefined"` for a name that was never declared?
> In the dead zone, the name exists in the scope but is marked uninitialized, and any access, `typeof` included,
> checks that mark and throws. A name that was never declared is not found at all, and `typeof` is defined to return
> `"undefined"` in that case.

> [!question]- A function above a `const` declaration reads that `const`. Is that an error?
> Only if the function is called before the `const` line has run. The dead zone is about time, not position.
