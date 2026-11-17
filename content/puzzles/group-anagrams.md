---
title: Group Anagrams
type: puzzle
track: cs-fundamentals
description: "Put words made of the same letters into the same group. Find a key that all anagrams share. LeetCode 49."
leetcode: https://leetcode.com/problems/group-anagrams/
pattern: hash-map-lookup
difficulty: medium
created: 2026-11-17
updated: 2026-11-17
---

## The problem

You get a list of lowercase words. Put the words into groups so that two words share a group exactly when one is a rearrangement of the other's letters. Return the groups in any order, with the words inside a group in any order.

Example: `["eat", "tea", "tan", "ate", "nat", "bat"]` → `[["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]`.

What matters: up to 10,000 words, each up to 100 letters. ([on LeetCode](https://leetcode.com/problems/group-anagrams/))

## Think about

- [[valid-anagram|Valid Anagram]] compared two words. Comparing every pair of words here would take how many checks?
- Is there something you can compute from a single word that is identical for all of its anagrams?
- Once you have that, which data structure collects words under it?

> [!tip]- Hint
> Find a "signature" for each word that does not change when the letters are rearranged, and use it as a [[hash-map|dict]] key.

## Solution

Arrives on the next lesson day.
