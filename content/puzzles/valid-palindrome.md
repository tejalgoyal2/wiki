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

Arrives on the next lesson day.
