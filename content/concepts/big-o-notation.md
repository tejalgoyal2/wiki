---
title: Big-O notation
aliases: [Big-O, big O, time complexity, space complexity, O(n), O(1), O(n log n), O(n²)]
type: concept
track: cs-fundamentals
description: A way to say how an algorithm's time or memory grows as the input grows, ignoring constants.
depth: deep
sources:
  - https://wiki.python.org/moin/TimeComplexity
  - https://github.com/python/cpython/blob/3.13/Objects/listsort.txt
  - https://github.com/python/cpython/blob/3.13/Objects/listobject.c
  - https://en.wikipedia.org/wiki/Big_O_notation
created: 2026-11-12
updated: 2026-11-19
---

Big-O describes **how cost grows with input size n**, not how fast code is on one machine. It keeps the biggest term
and drops constants: `3n² + 10n + 7` is O(n²).

## The common classes

| Big-O | Name | n = 10,000 means about | Example |
|---|---|---|---|
| O(1) | constant | 1 step | dict lookup, array index |
| O(log n) | logarithmic | 14 steps | binary search |
| O(n) | linear | 10,000 steps | one pass over a list |
| O(n log n) | linearithmic | 140,000 steps | good sorting |
| O(n²) | quadratic | 100,000,000 steps | checking every pair |
| O(2ⁿ) | exponential | astronomically many | trying every subset |

A useful rule for interviews: around **10⁸ simple steps per second**. So O(n²) with n = 10⁴ is borderline, and with n = 10⁵ it is too slow.

## How to read your own code

- A loop over n items: O(n). A loop inside a loop over the same items: O(n²).
- Halving the problem each step: O(log n).
- Hidden costs count: `x in some_list` is O(n); `x in some_set` is O(1) on average. `list.insert(0, x)` is O(n).
- **Space complexity** is the same idea for extra memory: a [[hash-map|hash map]] of everything seen is O(n) space.
- **Amortized** cost: an occasional slow step spread over many fast ones (a list or dict growing) still averages O(1).

## Example

```py run
def has_pair_quadratic(nums, target):          # O(n²) time, O(1) space
    return any(nums[i] + nums[j] == target
               for i in range(len(nums)) for j in range(i + 1, len(nums)))

def has_pair_linear(nums, target):             # O(n) time, O(n) space
    seen = set()
    for x in nums:
        if target - x in seen:
            return True
        seen.add(x)
    return False

print(has_pair_quadratic([3, 9, 4, 7], 11), has_pair_linear([3, 9, 4, 7], 11))   # True True
```

## Going deeper

### What the notation actually says

"f(n) is O(g(n))" means: there is some constant c and some starting size n₀ such that for every n ≥ n₀,
f(n) ≤ c · g(n). In words, past some point, f never grows faster than a fixed multiple of g. Two things follow.

- **Constants and small terms disappear.** `3n² + 10n + 7` is at most `4n²` once n ≥ 11, so it is O(n²).
- **Big-O is an upper bound.** Strictly, a linear function is also O(n²), because n ≤ n² for n ≥ 1. Nobody says
  that in practice; when engineers say "O(n)" they mean the tightest bound they know.

The related symbols make the difference precise:

| Symbol | Means | Read it as |
|---|---|---|
| O(g) | grows at most like g | "no worse than" |
| Ω(g) | grows at least like g | "no better than" |
| Θ(g) | both: grows exactly like g | "the same as" |

Interviews almost always say Big-O and mean Θ. Use Ω when it adds information: "any comparison sort needs
Ω(n log n) comparisons in the worst case" is a statement about every possible algorithm, not just yours.

### Best, average and worst case are a separate question

Big-O describes how *a* function grows. Which function you are describing is a different choice:

- **Worst case:** the slowest input of size n. Insertion sort on reversed input: O(n²).
- **Best case:** the fastest. Insertion sort on already sorted input: O(n).
- **Average case:** the expected cost over some distribution of inputs. Insertion sort on random input: O(n²),
  about n²/4 comparisons.
- **[[amortized-analysis|Amortized]]:** the cost per operation over a whole sequence of operations, on any input.
  Appending to a [[dynamic-array|dynamic array]] is O(1) amortized.

When nobody says which, assume worst case, except for [[hash-map|hash map]] operations, where "O(1)" conventionally
means average.

### Where log n comes from

A logarithm counts how many times you can halve something before it reaches 1. Halving a million takes about 20
steps; a billion, about 30. So any algorithm that throws away a constant fraction of the work each step (binary
search, a balanced tree such as a [[b-tree|B-tree]], a heap's sift-down) is O(log n).

The base of the logarithm does not matter in Big-O: log₂ n and log₁₀ n differ by a constant factor (about 3.32),
so both are just O(log n).

**n log n** appears when you do O(n) work on each of log n levels. Merge sort splits the list in half, sorts each
half, then merges in O(n). The splitting goes log₂ n levels deep, and each level merges n items in total. Python's
`sorted` (Timsort, with the Powersort merge order since Python 3.11) is O(n log n) in the worst case and close to
O(n) on data that is already mostly sorted.

### Second example: counting instead of timing

Counting comparisons removes all noise from the measurement. Merge sort against insertion sort on the same random data:

```py run
import math, random

def merge_sort(xs, count):
    if len(xs) <= 1:
        return xs
    mid = len(xs) // 2
    left, right = merge_sort(xs[:mid], count), merge_sort(xs[mid:], count)
    out, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        count[0] += 1
        if left[i] <= right[j]:
            out.append(left[i]); i += 1
        else:
            out.append(right[j]); j += 1
    return out + left[i:] + right[j:]

def insertion_sort(xs, count):
    xs = xs[:]
    for k in range(1, len(xs)):
        j = k
        while j > 0:
            count[0] += 1
            if xs[j - 1] <= xs[j]:
                break
            xs[j - 1], xs[j] = xs[j], xs[j - 1]
            j -= 1
    return xs

random.seed(1)
for n in [1000, 2000, 4000]:
    data = [random.random() for _ in range(n)]
    m, ins = [0], [0]
    assert merge_sort(data, m) == insertion_sort(data, ins) == sorted(data)
    print(n, m[0], round(n * math.log2(n)), ins[0], n * n // 4)
# 1000 8697 9966 240029 250000
# 2000 19402 21932 986796 1000000
# 4000 42828 47863 3960782 4000000
```

Merge sort tracks n log₂ n and roughly doubles when n doubles. Insertion sort tracks n²/4 and quadruples. At
n = 4,000 the gap is already 90 times, and it keeps widening.

### More than one variable

Use one letter per independent size. A graph algorithm that visits every vertex and edge is O(V + E), not O(n).
Searching for a pattern of length m in a text of length n by trying every position is O(n · m). Collapsing these
into a single n hides the case that matters: O(V + E) is linear for a sparse graph but O(V²) for a dense one.

A size that is fixed by the problem is a constant. Counting letters with a 26-slot array is O(n) time and O(1)
space, because 26 does not grow with the input.

### When "n" is a number, not a length

Complexity is measured against the size of the input. For a list, that is its length. For a single number, it is
the number of **digits**, not the value. Checking whether n is prime by trying divisors up to √n is O(√n) in the
value, which sounds fast. But a 30-digit number has a square root of about 10¹⁵, far too many divisions. Measured
in digits d, the cost is about 10^(d/2): exponential. Algorithms like this, polynomial in the value but exponential
in its length, are called pseudo-polynomial. Dynamic programming over an amount (coin change, knapsack) is the
common interview case.

### Reading the constraints in an interview

The input limits tell you which complexity is expected, using the rough budget of 10⁸ simple steps per second:

| Largest n | Usually expected |
|---|---|
| up to 12 | O(n!) or O(2ⁿ · n): try every arrangement or subset |
| up to 25 | O(2ⁿ) |
| up to 500 | O(n³) |
| up to 5,000 | O(n²) |
| up to 10⁶ | O(n log n) or O(n) |
| above 10⁷ | O(n), O(log n) or O(1) |

Python runs simple steps more slowly than C++ or [[java|Java]], so treat the boundaries as optimistic in Python.

### Interview angle

When you state a complexity, say four things: the time, the space, what n (and any other letter) means, and which
step dominates. "O(n log n) time because of the sort; the scan after it is O(n). O(n) extra space for the sorted
copy." If asked to improve, the usual moves are: replace a search inside a loop with a hash lookup, precompute
running totals, sort once to unlock two pointers or binary search, or stop early when the answer is found. The
lesson [[2026-11-19-big-o-for-real|#6 · Big-O for real]] works through the hidden costs of Python built-ins.

## Traps

- **Counting lines instead of work.** `x in items`, slicing, `sorted`, `pop(0)` and `+` on lists are each one line
  and O(n) or more.
- **Ignoring constants when n is small.** For n = 20, an O(n²) loop over a list can beat an O(n) solution that builds
  a dict. Big-O is about growth, not about which is faster today.
- **Forgetting the call stack.** Recursion n levels deep is O(n) space even without any data structure.
- **Dropping a variable that matters.** O(n + m) is not O(n) if m can be much larger than n.
- **Saying O(1) for a hash lookup without "average".** Its worst case is O(n).

## In the wild

Complexity is not only an interview topic. Two well-known outages came from code whose cost grew much faster than its input:

- **Cloudflare, 2 July 2019.** A new firewall rule contained a regular expression that "backtracked enormously" and
  pushed [[cpu|CPUs]] serving [[http|HTTP]] traffic to nearly 100% across the network, taking Cloudflare's proxy down for 27 minutes.
  The regex engine tried exponentially many ways to match one string.
  ([Cloudflare's postmortem](https://blog.cloudflare.com/details-of-the-cloudflare-outage-on-july-2-2019/))
- **[[call-stack|Stack Overflow]], 20 July 2016.** A post containing about 20,000 consecutive spaces hit a whitespace-trimming
  regex whose cost was O(n²) in the length of that whitespace. The site was down for about 34 minutes; the fix
  replaced the regex with a plain substring operation.
  ([postmortem](https://stackstatus.tumblr.com/post/147710624694/outage-postmortem-july-20-2016))

You can watch exponential growth happen with Python's own regex engine, which also backtracks:

```py run
import re, time

def cost(n):
    start = time.perf_counter()
    re.match(r"(a+)+$", "a" * n + "b")    # fails, but only after trying every way to split the a's
    return time.perf_counter() - start

small, big = cost(14), cost(18)
print(big / small > 4)    # True: 4 more characters, roughly 16 times the work (2^4)
```

The lesson: when input comes from users, know the worst case, not just the average. Linear-time regex engines
(RE2, Rust's `regex`) exist precisely to rule this out.

## Related

[[amortized-analysis|Amortized analysis]] · [[dynamic-array|Dynamic array]] · [[hash-map|Hash map]] ·
[[call-stack|Call stack]] · [[bucket-sort|Bucket sort]]

## Check yourself

> [!question]- What is the time complexity of checking `if x in my_list` inside a loop over `my_list`?
> O(n²): an O(n) membership test, n times. Turning the list into a set first makes it O(n).

> [!question]- Why do we drop constants, so that 5n and n are both O(n)?
> Big-O describes growth. As n gets large, the shape of the curve dominates; constants depend on hardware and details.

> [!question]- Binary search halves the range each step. Why does it not matter whether we write O(log₂ n) or O(log n)?
> Logarithms in different bases differ by a constant factor (log₂ n is about 3.32 × log₁₀ n), and Big-O drops constant factors.

> [!question]- An algorithm loops from 2 up to √n to test whether the number n is prime. Is it fast?
> Only for small numbers. Input size is the number of digits d, and √n is about 10^(d/2), so the cost is exponential
> in the input size. A 30-digit number would need about 10¹⁵ divisions.

<!-- leads-to -->
## Leads to

- [[2026-11-19-big-o-for-real|#6 · Big-O for real]]: How to read the time and space cost of code you actually write - hidden costs in built-ins, amortized O(1) appends, the memory recursion uses, and how to check your answer by measuring.
- [[amortized-analysis|Amortized analysis]]: Measuring the cost of an operation averaged over any sequence of operations, so a rare expensive step (like a resize) still counts as cheap per call.
- [[b-tree|B-tree]]: A balanced search tree with many keys per node, used for database indexes because it finds a key in very few disk reads.
- [[bucket-sort|Bucket sort (pattern)]]: When the values you would sort by are small whole numbers, use them as list indexes ("buckets") and read the buckets in order, which costs O(n) instead of O(n log n).
- [[dynamic-array|Dynamic array]]: An array that grows on demand by moving into a larger block of memory when full; Python's list, JavaScript's Array and Java's ArrayList work this way.
- [[hash-map|Hash map]]: A key-value store that finds any key in O(1) time on average by turning the key into an array position with a hash function.
<!-- /leads-to -->
