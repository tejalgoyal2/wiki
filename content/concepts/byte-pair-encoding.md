---
title: Byte-pair encoding
aliases: [BPE]
type: concept
track: llm-rag
requires: [token]
description: A way to build a tokenizer vocabulary by repeatedly merging the most frequent adjacent pair of pieces, so common text is short and rare text still works.
depth: solid
sources:
  - https://arxiv.org/abs/1508.07909
  - https://aclanthology.org/P16-1162/
created: 2026-11-18
updated: 2026-11-18
---
<!-- read-first -->
> [!info] Read first
> [[token|Token]]
<!-- /read-first -->

**Byte-pair encoding** (BPE) is a method that learns a [[token|token]] vocabulary from text. It starts with the smallest pieces and builds bigger ones from whatever occurs together most often. Sennrich, Haddow and Birch (2016) applied it to neural translation so rare words could be split into known subwords instead of becoming an "unknown" symbol. The idea itself is older and came from data compression.

## How it works

Training:

1. Start with a vocabulary of single characters (or single bytes).
2. Count every adjacent pair of pieces in the training text.
3. Merge the most frequent pair into one new piece and add it to the vocabulary. Record the merge.
4. Repeat until the vocabulary reaches the wanted size.

Encoding new text: split it into single characters, then replay the recorded merges **in the order they were learned**. Frequent words end as a single token; rare words stay in several pieces.

Byte-level BPE starts from the 256 possible byte values instead of characters. Every string, in any language, can be encoded, so nothing is unknown. The price is that characters outside plain ASCII take several bytes and may take more tokens.

## Example

```py run
def merge(word, pair):
    out, i = [], 0
    while i < len(word):
        if i < len(word) - 1 and (word[i], word[i + 1]) == pair:
            out.append(word[i] + word[i + 1]); i += 2
        else:
            out.append(word[i]); i += 1
    return out

merges = [("l", "o"), ("lo", "w")]       # learned from a corpus where "low" is common
word = list("lower")
for pair in merges:
    word = merge(word, pair)
print(word)   # ['low', 'e', 'r']
```

## Traps

- The merge order is part of the tokenizer. Replaying merges in a different order gives different tokens.
- A vocabulary learned on English splits other languages and code into more pieces, so the same meaning costs more tokens.
- BPE is not the only method. WordPiece and the Unigram model (SentencePiece) also build subword vocabularies.

## Related

[[2026-11-17-tokens|Lesson 4]] trains a small BPE tokenizer in plain Python. See also [[context-window|context windows]].

## Check yourself

> [!question]- Why does BPE never meet an unknown word?
> The smallest pieces (characters or bytes) are always in the vocabulary, so any text can be split into known pieces.

> [!question]- Why must merges be replayed in the order they were learned?
> Each merge was chosen because of the pieces that existed at that point. A later merge may depend on an earlier one, so another order gives a different result.
