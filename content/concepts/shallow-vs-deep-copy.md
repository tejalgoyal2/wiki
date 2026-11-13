---
title: Shallow vs deep copy
aliases: [shallow copy, deep copy, deepcopy, structuredClone]
type: concept
track: python-data
requires: [mutability]
description: A shallow copy makes a new outer container that holds the same inner objects; a deep copy copies everything all the way down.
depth: solid
sources:
  - https://docs.python.org/3/library/copy.html
  - https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone
created: 2026-11-12
updated: 2026-11-12
---
<!-- read-first -->
> [!info] Read first
> [[mutability|Mutability]]
<!-- /read-first -->

Copying a container that holds other [[mutability|mutable]] objects raises a question: copy just the outer box, or
everything inside too?

- **Shallow copy:** a new outer container, but the items inside are the **same objects** as before.
- **Deep copy:** new copies of everything, recursively.

## How to make each

| | Shallow | Deep |
|---|---|---|
| Python | `lst.copy()`, `list(lst)`, `lst[:]`, `dict.copy()`, `copy.copy(x)` | `copy.deepcopy(x)` |
| JavaScript | `[...arr]`, `{...obj}`, `Object.assign({}, obj)` | `structuredClone(obj)` |

## Example

```py run
import copy
config = {"retries": 3, "tags": ["a"]}
s = config.copy()
d = copy.deepcopy(config)
s["tags"].append("b")
print(config["tags"])   # ['a', 'b']  the shallow copy shares the inner list
print(d["tags"])        # ['a']
```

```js run
const config = { retries: 3, tags: ['a'] };
const s = { ...config };
const d = structuredClone(config);
s.tags.push('b');
console.log(config.tags, d.tags);   // [ 'a', 'b' ] [ 'a' ]
```

## Traps

- A shallow copy of a flat list of numbers or strings is enough: those are immutable.
- `JSON.parse(JSON.stringify(x))` as a deep copy loses dates, `undefined`, `Map`, `Set` and functions. Prefer `structuredClone`.
- Deep copies cost time and memory. Copy only what you will change.

## Check yourself

> [!question]- You shallow-copy a list of lists and change `copy[0][0]`. What happens to the original?
> It changes too: both outer lists hold the same inner lists.

> [!question]- What is the modern built-in way to deep-copy in JavaScript?
> `structuredClone(value)`.
