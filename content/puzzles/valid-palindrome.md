---
title: Valid Palindrome
type: puzzle
track: javascript
description: "Decide whether a sentence reads the same forwards and backwards once you ignore case and everything that is not a letter or digit. LeetCode 125."
leetcode: https://leetcode.com/problems/valid-palindrome/
pattern: two-pointers
difficulty: easy
created: 2026-11-20
updated: 2026-11-20
---

## The problem

You get a string. Throw away every character that is not a letter or a digit, and treat upper and lower case as the
same. Is what is left the same read forwards and backwards? Return `true` or `false`.

Example: `"Never odd, or even."` → `true`. Keeping only letters and digits, in lower case, gives `neveroddoreven`,
which reads the same both ways. `"race a car"` → `false` (`raceacar` backwards is `racaecar`).

What matters: the string has between 1 and 200,000 characters, all printable ASCII. An input with no letters or
digits at all, such as `" , "`, counts as a palindrome. ([on LeetCode](https://leetcode.com/problems/valid-palindrome/))

## Think about

- The easy answer builds a cleaned copy and compares it with its reverse. What does that cost in extra memory, and
  can you check the string where it is, without building anything?
- If you compare the first and last characters, then the second and second-to-last, when can you stop?
- What should each side do when it is standing on a space or a comma?

> [!tip]- Hint
> Put one index at the start and one at the end. Move each one inward past characters that don't count, compare the
> two characters they land on (in lower case), and step both inward. Stop when they meet.

## Solution

> [!success]- Open only after you have thought about it
> **Key idea:** a palindrome is symmetric, so you only need to compare characters in mirrored positions. Put one
> index at each end and walk them toward each other. Skip anything that is not a letter or digit as you go, so no
> cleaned copy is ever built.
>
> **Pattern:** [[two-pointers|two pointers]] from both ends.
>
> **Why brute force is too slow (or too wasteful):** building a cleaned, lower-case copy and comparing it with its
> reverse is still [[big-o-notation|O(n)]] time, so it is fine on speed. It costs O(n) extra memory, and in an interview it hides the
> pattern the question is testing.
>
> **Steps:**
>
> 1. Set `left = 0` and `right = len(s) - 1`.
> 2. While `left < right`: move `left` forward while it points at a character that is not alphanumeric; move `right`
>    backward in the same way.
> 3. If the two lower-cased characters differ, return `False`. Otherwise step both inward.
> 4. If the pointers meet, return `True`.
>
> ```py run
> def is_palindrome(s):
>     left, right = 0, len(s) - 1
>     while left < right:
>         while left < right and not s[left].isalnum():
>             left += 1
>         while left < right and not s[right].isalnum():
>             right -= 1
>         if s[left].lower() != s[right].lower():
>             return False
>         left += 1
>         right -= 1
>     return True
>
> print(is_palindrome("Never odd, or even."))   # True
> print(is_palindrome("race a car"))            # False
> print(is_palindrome(" , "))                   # True
> print(is_palindrome("0P"))                    # False
> ```
>
> **Time:** O(n), each index moves at most n steps in total. **Space:** O(1).
> Note the inner `left < right` checks: without them a string of only punctuation would push the pointers past each
> other and raise an `IndexError`.
>
> **Where else this shows up:** reversing an array in place, "valid palindrome II" (one deletion allowed), merging
> two sorted lists, and today's puzzle, [[two-sum-ii|Two Sum II]].
