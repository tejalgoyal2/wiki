---
title: "Path: what code costs"
type: path
track: cs-fundamentals
description: Seven notes, in order, on judging how fast and how memory-hungry code is - Big-O, the call stack, dynamic arrays, amortized cost, hash maps, B-trees and two patterns. About 50 minutes.
created: 2026-11-19
updated: 2026-11-19
---

Read these in order. Each one assumes the ones before it. About 50 minutes in total; stop after any step.

1. [[big-o-notation|Big-O notation]]: how cost grows with input size, and how to read it from code.
2. [[call-stack|Call stack]]: where function calls live, and why deep recursion costs memory.
3. [[dynamic-array|Dynamic array]]: how a Python list grows, and which list operations are cheap.
4. [[amortized-analysis|Amortized analysis]]: why an occasional O(n) resize still averages out to O(1).
5. [[hash-map|Hash map]]: O(1) average lookups, and what can make them slow.
6. [[b-tree|B-tree]]: a different trade-off, built for data that lives on disk.
7. Two patterns that use them: [[hash-map-lookup|hash map lookup]] and [[bucket-sort|bucket sort]].

**Then test yourself:** the lesson [[2026-11-19-big-o-for-real|#6 · Big-O for real]], and the puzzles
[[two-sum|Two Sum]] and [[top-k-frequent-elements|Top K Frequent Elements]].
