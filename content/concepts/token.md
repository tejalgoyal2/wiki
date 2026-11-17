---
title: Token
aliases: [tokens, tokenizer, tokenizers, tokenization]
type: concept
track: llm-rag
description: A piece of text, mapped to an integer, that a language model reads and writes instead of letters or words.
depth: solid
sources:
  - https://arxiv.org/abs/1508.07909
  - https://arxiv.org/abs/1808.06226
  - https://docs.anthropic.com/en/docs/build-with-claude/token-counting
created: 2026-11-17
updated: 2026-11-17
---

A **token** is the unit a language model works in. A **tokenizer** is the program that cuts text into tokens and maps each one to an integer ID from a fixed list, the **vocabulary**. The model only ever sees and predicts these IDs.

## How it works

A token can be a whole word, part of a word, a single character, a space plus a word, or a raw byte. Frequent strings get their own token; rare strings are built from several. Vocabularies hold tens of thousands to a few hundred thousand entries and are learned from a large body of text, most often with [[byte-pair-encoding|byte-pair encoding]]: start from single characters or bytes and repeatedly merge the most frequent adjacent pair.

The tokenizer is part of the model. Each model family has its own vocabulary, so the same text gives different counts on different models, and token IDs from one model mean nothing to another.

Token count drives three things: the price (APIs bill per token), the latency (more input to process, and output is produced one token at a time) and the limit (the [[context-window|context window]] is counted in tokens).

## Example

```py run
for s in ["hello", "héllo", "你好", "😀"]:
    print(repr(s), len(s), len(s.encode("utf-8")))
# 'hello' 5 5
# 'héllo' 5 6
# '你好' 2 6
# '😀' 1 4
```

Byte-level tokenizers start from these UTF-8 bytes. Character count is not byte count, and neither is token count.

## Traps

- English averages roughly four characters per token. That is a rule of thumb for English prose, not for code, numbers or other languages.
- `hello`, ` hello` and `Hello` are usually different tokens.
- Counting with another model's tokenizer gives only an estimate. Use the provider's counter for the model you call.
- Because the model sees chunks, not letters, letter-level tasks (count the r's, reverse a word) are unreliable. Do them in code.

## Related

Introduced in [[2026-11-17-tokens|#4 · Tokens and context windows]]. Tokens are what an embedding model turns into vectors, and what a transformer attends over.

## Check yourself

> [!question]- Why use subword tokens instead of whole words?
> A whole-word vocabulary would be huge and would fail on rare words, names and typos. Subwords keep the vocabulary small and let any new word be built from known pieces.

> [!question]- Why can the same prompt cost different amounts on two models?
> Their tokenizers differ, so they split the text into a different number of tokens, and their per-token prices differ too.

<!-- leads-to -->
## Leads to

- [[context-window|Context window]]: The maximum number of tokens a language model can take in and produce in one request, prompt and reply together.
<!-- /leads-to -->
