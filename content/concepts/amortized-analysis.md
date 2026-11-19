---
title: Amortized analysis
aliases: [amortized cost, amortized O(1), amortized time, amortised]
type: concept
track: cs-fundamentals
requires: [big-o-notation, dynamic-array]
description: Measuring the cost of an operation averaged over any sequence of operations, so a rare expensive step (like a resize) still counts as cheap per call.
depth: solid
sources:
  - https://wiki.python.org/moin/TimeComplexity
  - https://github.com/python/cpython/blob/3.13/Objects/listobject.c
created: 2026-11-19
updated: 2026-11-19
---
<!-- read-first -->
> [!info] Read first
> [[big-o-notation|Big-O notation]] · [[dynamic-array|Dynamic array]]
<!-- /read-first -->

Some operations are usually cheap and occasionally expensive. **Amortized analysis** asks: over **any** sequence of
n operations, what is the total cost? Divide by n and you get the amortized cost per operation. If the total is O(n),
each operation is amortized O(1), even if one of them took O(n).

## How it works

The standard example is appending to a [[dynamic-array|dynamic array]] such as a Python list. Appends write into
spare capacity at O(1). When the array is full, it allocates a bigger block and copies everything: O(n) for that one
append.

If the capacity **doubles** when full, n appends cause copies of 1, 2, 4, ..., up to n/2 items. That geometric sum
is less than n. Add n ordinary writes and the total is under 2n, so each append costs under 2 units on average.

Two ways people reason about it:

- **Aggregate:** add up the total for n operations and divide, as above.
- **Banker's (accounting):** charge every cheap append a little extra, say 3 units instead of 1, and save the
  surplus. When a resize comes, the saved credit pays for the copy. If the bank never goes negative, the charged
  price is a valid amortized cost.

The growth must be by a **factor**. Growing by a fixed number of slots, say 10, makes the copies sum to about
n²/20: still O(n²) in total, so O(n) per append.

## Example

Count the work done by a binary counter that you increment n times. One increment can flip many bits (`0111` to
`1000`), but most flip only one or two.

```py run
def increment_cost(n, bits=32):
    counter, flips = [0] * bits, 0
    for _ in range(n):
        i = 0
        while counter[i] == 1:       # carry: turn trailing 1s into 0s
            counter[i] = 0
            flips += 1
            i += 1
        counter[i] = 1
        flips += 1
    return flips

for n in [1_000, 1_000_000]:
    print(n, increment_cost(n) / n < 2)   # True True: under 2 flips per increment
```

The worst single increment flips about log n bits, but the amortized cost is O(1): bit 0 flips every time, bit 1
every second time, bit 2 every fourth, and so on, which sums to under 2n.

## Traps

- **Amortized is not average case.** Average case assumes typical inputs. Amortized holds for every sequence of
  operations, even adversarial ones. A [[hash-map|hash map]] lookup is O(1) on *average*; its resize cost is O(1)
  *amortized*.
- **One call can still be slow.** If every single operation must finish within a deadline (audio, games, a tight
  latency target), amortized O(1) is not enough.
- **Shrinking needs care.** If an array halves as soon as it is half empty, alternating append and pop at that
  boundary resizes every time. Implementations shrink later (for example at a quarter full).

## Related

[[big-o-notation|Big-O notation]] · [[dynamic-array|Dynamic array]] · [[hash-map|Hash map]] ·
[[2026-11-19-big-o-for-real|#6 · Big-O for real]]

## Check yourself

> [!question]- A list grows by 50% each time it fills. Is append amortized O(1)?
> Yes. Any constant growth factor above 1 makes the copy sizes a geometric series whose sum is a constant times n.

> [!question]- What is the difference between "O(1) average" and "O(1) amortized"?
> Average is over likely inputs and can be broken by bad inputs. Amortized is a guarantee over any sequence of
> operations: the total for n operations is O(n), even if individual operations vary.
