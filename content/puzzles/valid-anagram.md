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

> [!success]- Open only after you have thought about it
> **Key idea:** two strings are anagrams exactly when every letter appears the same number of times in both. So
> count the letters of one string, then count them down with the other.
>
> **Pattern:** [[hash-map-lookup|hash map lookup]], here as a frequency count: the map stores `letter -> how many`
> instead of `value -> index`.
>
> **Why brute force is too slow:** trying every rearrangement of the first string means n! orderings. Even the
> gentler version, removing each matched letter from a list of the other string, costs [[big-o-notation|O(n²)]]. Sorting both strings
> and comparing works and costs O(n log n), which is fine but not the best.
>
> **Steps:**
>
> 1. If the lengths differ, return `False` at once.
> 2. Walk the first string and add one to the count of each letter.
> 3. Walk the second string and subtract one. If a count would go below zero, that letter is extra: return `False`.
> 4. Equal lengths plus no negative count means every count ended at zero: return `True`.
>
> ```py run
> def is_anagram(s, t):
>     if len(s) != len(t):
>         return False
>     counts = {}
>     for ch in s:
>         counts[ch] = counts.get(ch, 0) + 1
>     for ch in t:
>         if counts.get(ch, 0) == 0:
>             return False
>         counts[ch] -= 1
>     return True
>
> print(is_anagram("listen", "silent"))   # True
> print(is_anagram("rat", "car"))         # False
> print(is_anagram("aab", "abb"))         # False
> print(is_anagram("", ""))               # True
> ```
>
> **Time:** O(n), one pass over each string. **Space:** O(k) for k distinct letters, at most 26 for lowercase
> English, so effectively O(1).
>
> **Unicode follow-up:** nothing changes. A [[hash-map|dict]] keys on any character, so the same code works. (A fixed array of 26
> counters would not, which is why the dict is the safer default.)
>
> **Where else this shows up:** grouping words that are anagrams of each other (use the sorted letters or the count
> tuple as the dict key), checking whether a ransom note can be built from magazine letters, and finding anagram
> windows inside a longer string with a sliding window.
