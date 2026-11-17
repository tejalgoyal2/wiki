---
title: B-tree
aliases: [b-trees, B-trees, B+ tree, B+ trees, btree]
type: concept
track: cs-fundamentals
requires: [big-o-notation]
description: A balanced search tree with many keys per node, used for database indexes because it finds a key in very few disk reads.
depth: solid
sources:
  - https://doi.org/10.1007/BF00288683
  - https://www.postgresql.org/docs/current/btree.html
created: 2026-11-17
updated: 2026-11-17
---
<!-- read-first -->
> [!info] Read first
> [[big-o-notation|Big-O notation]]
<!-- /read-first -->

A **B-tree** keeps keys in sorted order in a tree where each node holds many keys, not just one. Each node usually fills one disk page. It was introduced by Bayer and McCreight in 1972 for large indexes on disk, and it is still the default index in most relational databases (PostgreSQL's `CREATE INDEX` makes one unless you ask for another type).

## How it works

A node with `m` keys has `m + 1` children. The keys split the key range: everything under the first child is smaller than the first key, and so on. To find a key, read the root, pick the child whose range contains it, and repeat until you reach a leaf. All leaves are at the same depth, so every lookup costs the same.

Because a node holds hundreds of keys, the tree is very shallow. The height is about log base *f* of *n*, where *f* is the fanout (children per node). With a fanout of 100, a billion keys need about 5 levels. Since each level is one page read from disk, a lookup costs a handful of reads. A binary tree would need around 30 levels.

**Insert:** find the leaf. If it has room, add the key. If it is full, split it in two and push the middle key up to the parent, which may split in turn. The tree grows at the root, so it stays balanced. **Delete** merges or borrows between neighbours to keep nodes at least half full.

**B+ tree:** the common variant. Only the leaves hold the row pointers, and leaves are linked in order, so a range query (`WHERE x BETWEEN 10 AND 20`) finds the start once and then walks along the leaves. Many databases, including MySQL's InnoDB, use this form.

## Example

```py run
import math

def levels(n_keys, fanout):
    return math.ceil(math.log(n_keys, fanout))

print(levels(1_000_000_000, 100))   # 5
print(levels(1_000_000_000, 2))     # 30
```

## Traps

- An index speeds reads but slows writes, since each insert must also update the tree.
- A B-tree helps with `=`, ranges and sorting. It does not help with `LIKE '%text'` (unknown prefix).
- A multi-column index is ordered by its first column first; a query on only the second column cannot use it well.
- Random keys (such as random UUIDs) spread inserts over the whole tree and cause more page splits than increasing keys.

## Related

Compare with the [[hash-map|hash map]]: [[big-o-notation|O(1)]] lookups, but no ordering and no range queries.

## Check yourself

> [!question]- Why is a B-tree shallower than a binary search tree with the same keys?
> Each node has many children, so each level cuts the search space by a factor of the fanout, not by two.

> [!question]- Why do databases prefer a B-tree over a hash index for most columns?
> A B-tree keeps keys sorted, so it handles ranges and ordering as well as equality. A hash index handles only equality.
