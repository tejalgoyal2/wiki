---
title: Valid Anagram
type: puzzle
track: cs-fundamentals
description: "Are two words made of exactly the same letters? Count once, compare once. LeetCode 242."
leetcode: https://leetcode.com/problems/valid-anagram/
pattern: hash-map-lookup
difficulty: easy
created: 2026-11-13
updated: 2026-11-13
---

## The problem

You get two strings. Return `True` if the second one uses exactly the same letters as the first, each one the same
number of times, just possibly in a different order. Otherwise return `False`.

Example: `"listen"` and `"silent"` → `True`. `"rat"` and `"tar"` → `True`. `"rat"` and `"car"` → `False`.
`"aab"` and `"abb"` → `False` (same letters, different counts).

What matters: each string can be up to 50,000 characters, made of lowercase English letters. The follow-up asks what
changes if the strings can hold any Unicode characters. ([on LeetCode](https://leetcode.com/problems/valid-anagram/))

## Think about

- If the two strings have different lengths, do you need to look at any letters at all?
- If you sorted both strings, what would two anagrams look like? What does sorting cost?
- [[contains-duplicate|Contains Duplicate]] only needed to know whether a value was seen. What do you need to know about each letter here?

> [!tip]- Hint
> Count how many times each letter appears in the first string, then count down with the second. What must every
> count be at the end?

## Solution

Arrives on the next lesson day. Think first.
