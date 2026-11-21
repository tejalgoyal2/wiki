---
title: "#2 · Python's object model"
type: lesson
lesson: 2
track: python-data
description: What a Python variable really is, and why changing one list can change another.
puzzle: contains-duplicate
market_word: microservices
sources:
  - https://docs.python.org/3/reference/datamodel.html#objects-values-and-types
  - https://docs.python.org/3/faq/programming.html#why-are-default-values-shared-between-objects
  - https://docs.python.org/3/library/copy.html
created: 2026-11-12
updated: 2026-11-12
---

> [!abstract] Today
> What a Python variable really is, and why changing one list can change another. About 25 minutes: warm-up, lesson, puzzle.

## Warm-up

> [!question]- After a script finishes, which runs first: a `setTimeout(fn, 0)` callback or a `.then` callback? Why?
> The `.then` callback. It is a microtask, and the whole [[microtask-queue|microtask queue]] is emptied as soon as the current task (the
> script) ends. Only after that does [[event-loop|the event loop]] take the next task, which is where the timer callback is waiting.
> From [[2026-11-11-event-loop|#1 · The event loop]].

## The idea

In Python, **a variable is a name tag, not a box**. Every value (a number, a string, a list, a function) is an
**object** that lives in memory. A name like `a` just points at an object. `b = a` never copies anything: it puts a
second name tag on the same object.

Whether that matters depends on one question: **can the object change after it is created?**

## How it really works

Every object has three things:

| Part | What it is | Can it change? |
|---|---|---|
| **Identity** | Which object it is. `id(x)` shows it (in CPython, the memory address) | Never |
| **Type** | What kind of object it is: `type(x)` | Never (in practice) |
| **Value** | The data inside | Only if the type is **[[mutability\|mutable]]** |

**Mutable** means "can be changed in place": `list`, `dict`, `set`, and most objects of your own classes.
**Immutable** means "cannot be changed": `int`, `float`, `str`, `tuple`, `frozenset`, `bytes`, `None`.

Two kinds of operation look similar but are completely different:

- **Rebinding** a name: `x = something`. The name now points at another object. No object changes.
- **Mutating** an object: `lst.append(4)`, `d["k"] = 1`. The object itself changes, so **every name that points at it sees the change**.

You can never mutate an immutable object. So for an `int`, `y += 1` must build a new int and rebind `y`. For a list,
`+=` mutates in place.

**`==` vs `is`:** `a == b` asks "same value?" (it calls `__eq__`). `a is b` asks "same object?" (same identity). Use
`is` only for singletons like `None`, `True`, `False`. For everything else, use `==`.

**Function calls follow the same rule.** Python passes the object reference into the function (often called "pass by
object reference" or "pass by assignment"). The parameter is a new name for the caller's object. Mutating it changes
the caller's object; rebinding it does not.

## Example

Predict each printed line before opening the answer.

```py run
a = [1, 2, 3]
b = a
b.append(4)
print(a)          # ?
print(a is b)     # ?
c = [1, 2, 3, 4]
print(a == c, a is c)   # ?

x = 10
y = x
y += 1
print(x, y)       # ?

nums = [1]; alias = nums; nums += [2]; print(alias)   # ?
tup = (1,); alias2 = tup; tup += (2,); print(alias2)   # ?

def change(lst):
    lst.append(1)
    lst = [9]
    return lst

mine = [0]
out = change(mine)
print(mine, out)  # ?
```

**See it:** [step through this code in Python Tutor](https://pythontutor.com/visualize.html#code=a%20%3D%20%5B1%2C%202%2C%203%5D%0Ab%20%3D%20a%0Ab.append%284%29%0Ac%20%3D%20%5B1%2C%202%2C%203%2C%204%5D%0Ax%20%3D%2010%0Ay%20%3D%20x%0Ay%20%2B%3D%201%0A%0Adef%20change%28lst%29%3A%0A%20%20%20%20lst.append%281%29%0A%20%20%20%20lst%20%3D%20%5B9%5D%0A%20%20%20%20return%20lst%0A%0Amine%20%3D%20%5B0%5D%0Aout%20%3D%20change%28mine%29%0A&cumulative=false&mode=display&py=3).
It draws every name as an arrow to its object, so you can watch `a` and `b` point at the same list.

> [!success]- Answer
> ```
> [1, 2, 3, 4]   # b and a are the same list
> True
> True False     # equal values, different objects
> 10 11          # ints are immutable: y += 1 rebinds y
> [1, 2]         # list += mutates in place; alias sees it
> (1,)           # tuple += builds a new tuple; alias keeps the old one
> [0, 1] [9]     # append mutated the caller's list; lst = [9] only rebound the local name
> ```

## Traps

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

## How interviews ask it

> [!question]- "Is Python pass by value or pass by reference?"
> Neither exactly. Python passes a reference to the object, and the parameter becomes a new name bound to that same
> object. If the function mutates the object, for example appending to a list, the caller sees it. If the function
> rebinds the parameter with `=`, only the local name moves and the caller is not affected. With immutable objects
> like ints and strings you cannot mutate, so it looks like pass by value. People call this pass by object reference,
> or pass by assignment.

> [!question]- "What does this print, and how would you fix it?"
> ```py run
> def f(n, seen=set()):
>     seen.add(n)
>     return len(seen)
> print(f(1), f(2), f(1))
> ```
>
> **1 2 2.** The default `set()` was created once, when the function was defined, so all three calls share it. Fix:
> default to `None` and create a new set inside the function when the argument is `None`.

> [!question]- "Hard mode: what happens here?"
> ```py
> t = ([1], 2)
> t[0] += [3]
> ```
>
> It raises `TypeError: 'tuple' object does not support item assignment`, **and** `t` is now `([1, 3], 2)`.
> `t[0] += [3]` runs in two steps: first the list's in-place add mutates the list (this works), then Python tries to
> store the result back into `t[0]` (this fails, because tuples cannot be assigned to). It shows exactly the difference
> between mutating an object and rebinding a slot.

## Build it

Pick one of your Python projects. Find every function with a list, dict or set as a default value (search for `=[]`,
`={}` and `=set()` in parameter lists) and every place a config dict is copied before it is changed. Fix the defaults
with the `None` pattern and decide for each copy whether it needs to be deep. Then turn on the ruff rule `B006`
("mutable argument default") so the trap can't come back.

## Check yourself

> [!question]- What is the difference between `a == b` and `a is b`, and when should you use `is`?
> `==` compares values (it calls `__eq__`); `is` checks whether both names point at the very same object. Use `is`
> only for singletons such as `None`, `True` and `False`; use `==` for everything else.

> [!question]- Why does `def f(x, items=[])` keep items from earlier calls, and what is the fix?
> Default values are evaluated once, when the `def` line runs, and the same list object is reused on every call, so
> appends pile up. Fix: use `items=None` and create a new list inside the function when `items is None`.

> [!question]- You copy a list of lists with `new = old.copy()` and then change `new[0][0]`. Does `old` change? Why?
> Yes. `.copy()` is shallow: it makes a new outer list holding the same inner lists, so `new[0]` and `old[0]` are the
> same object. Use `copy.deepcopy(old)` to copy the inner lists too.

## Puzzle

Today: [[contains-duplicate|Contains Duplicate]]. Yesterday's [[two-sum|Two Sum]] now has its solution.

## Market word: microservices

In 46 of 1,200 Canadian entry-level job posts this week. It means building one product as several small services that
each own one job and their own data (users, payments, notifications), deploy on their own, and talk over [[http|HTTP]] or a
message queue such as [[kafka|Kafka]]. Companies want it because large teams can ship and scale parts independently, at the cost
of network calls, harder debugging and data spread across services. A FastAPI backend and a Next.js frontend talking
over HTTP are already two services; Docker is how each one is usually packaged. Lesson 35 covers [[microservices|monolith]] vs
microservices in depth.
