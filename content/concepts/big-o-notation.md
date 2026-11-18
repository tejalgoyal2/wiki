---
title: Big-O notation
aliases: [Big-O, big O, time complexity, space complexity, O(n), O(1), O(n log n), O(n²)]
type: concept
track: cs-fundamentals
description: A way to say how an algorithm's time or memory grows as the input grows, ignoring constants.
depth: solid
sources:
  - https://en.wikipedia.org/wiki/Big_O_notation
created: 2026-11-12
updated: 2026-11-12
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

## Check yourself

> [!question]- What is the time complexity of checking `if x in my_list` inside a loop over `my_list`?
> O(n²): an O(n) membership test, n times. Turning the list into a set first makes it O(n).

> [!question]- Why do we drop constants, so that 5n and n are both O(n)?
> Big-O describes growth. As n gets large, the shape of the curve dominates; constants depend on hardware and details.

<!-- leads-to -->
## Leads to

- [[b-tree|B-tree]]: A balanced search tree with many keys per node, used for database indexes because it finds a key in very few disk reads.
- [[hash-map|Hash map]]: A key-value store that finds any key in O(1) time on average by turning the key into an array position with a hash function.
<!-- /leads-to -->
