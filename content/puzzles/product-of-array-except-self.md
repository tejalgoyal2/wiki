---
title: Product of Array Except Self
type: puzzle
track: cs-fundamentals
description: "For each position in a list, give the product of every other number, in O(n) time and without dividing. LeetCode 238."
leetcode: https://leetcode.com/problems/product-of-array-except-self/
pattern: prefix-sum
difficulty: medium
created: 2026-11-19
updated: 2026-11-19
---

## The problem

You get a list of integers. Build a new list of the same length where each position holds the product of all the
**other** numbers in the input, that is, everything except the number at that same position.

Example: `nums = [1, 2, 3, 4]` → `[24, 12, 8, 6]`. Position 0 gets `2 × 3 × 4 = 24`, position 1 gets `1 × 3 × 4 = 12`,
and so on.

What matters: the list has between 2 and 100,000 numbers, each between -30 and 30, and every answer fits in a
32-bit integer. You must run in O(n) time and you may **not** use division. The follow-up asks for O(1) extra space,
not counting the output list. ([on LeetCode](https://leetcode.com/problems/product-of-array-except-self/))

## Think about

- The obvious answer multiplies everything except one item, for every position. What is its
  [[big-o-notation|complexity]]?
- Dividing the total product by `nums[i]` would be one pass. Apart from being banned, which input breaks it?
- The product "everything except position i" splits into two parts. What are they, and can you reuse work between
  neighbouring positions?

> [!tip]- Hint
> Everything except position `i` is (everything to the left of `i`) times (everything to the right of `i`). One pass
> from the left can compute the first part for every position; one pass from the right, the second.

## Solution

> [!success]- Open only after you have thought about it
> **Key idea:** the product of everything except position `i` is (the product of everything to its left) times (the
> product of everything to its right). Both parts can be built for every position in one pass each, by carrying a
> running product, so no work is repeated and no division is needed.
>
> **Pattern:** [[prefix-sum|prefix sums]], with multiplication in place of addition: a prefix product from the left
> and a suffix product from the right.
>
> **Why brute force is too slow:** multiplying the other n - 1 numbers for each of n positions is O(n²), about
> 10 billion steps for 100,000 numbers. The division shortcut (total product divided by `nums[i]`) is banned, and it
> also breaks on zeros: with one zero you would divide by zero, and the answer is not zero everywhere.
>
> **Steps:**
>
> 1. Make `answer` full of 1s. Walk left to right with `left = 1`. Store `left` in `answer[i]` (the product of
>    everything before `i`), then multiply `left` by `nums[i]`.
> 2. Walk right to left with `right = 1`. Multiply `answer[i]` by `right` (the product of everything after `i`),
>    then multiply `right` by `nums[i]`.
>
> ```py run
> def product_except_self(nums):
>     n = len(nums)
>     answer = [1] * n
>     left = 1
>     for i in range(n):                 # answer[i] = product of nums[:i]
>         answer[i] = left
>         left *= nums[i]
>     right = 1
>     for i in range(n - 1, -1, -1):     # times product of nums[i+1:]
>         answer[i] *= right
>         right *= nums[i]
>     return answer
>
> print(product_except_self([1, 2, 3, 4]))         # [24, 12, 8, 6]
> print(product_except_self([-1, 1, 0, -3, 3]))    # [0, 0, 9, 0, 0]
> print(product_except_self([0, 0, 2]))            # [0, 0, 0]
> print(product_except_self([5, 7]))               # [7, 5]
> ```
>
> **Time:** O(n), two passes. **Space:** O(1) extra: the output list does not count, and the rest is two variables.
> A first version often keeps separate `prefix` and `suffix` lists (O(n) extra); the trick for the follow-up is to
> build the prefix part inside the output and carry the suffix part in one variable.
>
> **Where else this shows up:** any "everything except this one" or "everything up to here" question: range sums,
> running balances, "trapping rain water" (the highest bar to the left and to the right of each position), and
> left-and-right sweeps in general.
