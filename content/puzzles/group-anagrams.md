---
title: Group Anagrams
type: puzzle
track: cs-fundamentals
description: "Put words made of the same letters into the same group. Find a key that all anagrams share. LeetCode 49."
leetcode: https://leetcode.com/problems/group-anagrams/
pattern: hash-map-lookup
difficulty: medium
created: 2026-11-17
updated: 2026-11-18
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

> [!success]- Open only after you have thought about it
> **Key idea:** all anagrams share one thing: their letters in sorted order. `"eat"`, `"tea"` and `"ate"` all sort to
> `"aet"`. Use that sorted word as the dict key, and collect the original words under it.
>
> **Pattern:** [[hash-map-lookup|hash map lookup]], here as **grouping by key**: the map stores `signature -> list of
> words` instead of `value -> index`.
>
> **Why brute force is too slow:** comparing every pair of words with the check from [[valid-anagram|Valid Anagram]]
> takes about n²/2 checks, around 50 million for 10,000 words, and each check also reads the letters. Grouping
> needs one pass.
>
> **Steps:**
>
> 1. Make an empty [[hash-map|dict]] whose values are lists.
> 2. For each word, compute its signature: the sorted letters joined into a string.
> 3. Append the word to the list stored under that signature.
> 4. Return the dict's values.
>
> ```py run
> from collections import defaultdict
>
> def group_anagrams(words):
>     groups = defaultdict(list)
>     for w in words:
>         key = "".join(sorted(w))      # same letters -> same key
>         groups[key].append(w)
>     return list(groups.values())
>
> print(group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"]))
> # [['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]
> print(group_anagrams([""]))      # [['']]
> print(group_anagrams(["a"]))     # [['a']]
> ```
>
> **Time:** O(n · k log k) for n words of length at most k, because each word is sorted. **Space:** O(n · k) for the
> stored words.
>
> **A faster key:** for lowercase English words, count the letters instead of sorting. A tuple of 26 counts is
> hashable, so it works as a key and costs O(k) per word, giving O(n · k) overall. A list cannot be a key because it
> is [[mutability|mutable]]; the tuple fixes that.
>
> ```py run
> def group_anagrams_counts(words):
>     groups = {}
>     for w in words:
>         counts = [0] * 26
>         for ch in w:
>             counts[ord(ch) - ord("a")] += 1
>         groups.setdefault(tuple(counts), []).append(w)
>     return list(groups.values())
>
> print(group_anagrams_counts(["eat", "tea", "tan", "ate", "nat", "bat"]))
> # [['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]
> ```
>
> **Where else this shows up:** grouping any items by a canonical form: duplicate files by content hash, log lines by
> error signature, or customers by normalised email.
