---
title: Mutability
aliases: [mutable, immutable, immutability, mutate, mutating]
type: concept
track: python-data
description: Whether an object can be changed after it is created. It decides what other names pointing at the same object will see.
depth: solid
sources:
  - https://docs.python.org/3/reference/datamodel.html#objects-values-and-types
  - https://developer.mozilla.org/en-US/docs/Glossary/Mutable
created: 2026-11-12
updated: 2026-11-12
---

A **mutable** object can be changed in place; an **immutable** one cannot, so every "change" builds a new object.
This matters because names (variables) point at objects: if two names point at one mutable object, a change through
one name is visible through the other.

## Which is which

| | Mutable | Immutable |
|---|---|---|
| Python | `list`, `dict`, `set`, most class instances | `int`, `float`, `str`, `tuple`, `frozenset`, `bytes`, `None` |
| JavaScript | objects, arrays, `Map`, `Set` | primitives: numbers, strings, booleans, `null`, `undefined`, `bigint`, `symbol` |

In JavaScript, `const` only stops **rebinding** the name; a `const` array can still be pushed to. `Object.freeze` makes
an object shallowly immutable.

## Example

```py run
a = [1, 2]; b = a; b.append(3); print(a)    # [1, 2, 3]  same list, mutated
s = "hi";  t = s; t += "!";     print(s)    # hi         str is immutable: t now points at a new string
```

```js run
const arr = [1, 2];
arr.push(3);            // allowed: mutation
console.log(arr);       // [ 1, 2, 3 ]
// arr = [];            // TypeError: Assignment to constant variable (rebinding)
```

## Why immutability is popular

- Safe to share between functions and [[thread|threads]]: nobody can change it under you.
- Can be a [[hash-map|hash map]] key (it must stay hashable).
- React state relies on it: you replace objects instead of mutating them, so a cheap `===` check spots changes.

## Related

[[2026-11-12-python-object-model|#2 · Python's object model]], [[shallow-vs-deep-copy]].

## Check yourself

> [!question]- Why does `x += 1` on an int never affect another name that pointed at the same int?
> Ints are immutable, so `+=` builds a new int and rebinds `x`; the other name still points at the old one.

> [!question]- Does `const` make a JavaScript array immutable?
> No. `const` only prevents assigning a new value to the name. The array itself can still be mutated.
