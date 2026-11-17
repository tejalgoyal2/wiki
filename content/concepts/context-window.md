---
title: Context window
aliases: [context windows, context length, context limit]
type: concept
track: llm-rag
requires: [token]
description: The maximum number of tokens a language model can take in and produce in one request, prompt and reply together.
depth: solid
sources:
  - https://docs.anthropic.com/en/docs/build-with-claude/context-windows
  - https://arxiv.org/abs/1706.03762
created: 2026-11-17
updated: 2026-11-17
---
<!-- read-first -->
> [!info] Read first
> [[token|Token]]
<!-- /read-first -->

The **context window** is the model's working memory for one request, measured in [[token|tokens]]. Everything the model can use must fit inside it: the system prompt, the conversation so far, any documents you paste in, and the reply it is writing. The model remembers nothing outside the window; between requests it keeps no memory unless you send the text again.

## How it works

An API call is stateless. A chat app keeps the history and resends it with each new message, so the window fills as the conversation grows. When input plus output would exceed the limit, the API returns an error or the output is cut short; the exact behaviour depends on the provider. Many providers also set a separate cap on output length.

Why the limit exists: in a transformer every token attends to the earlier tokens (Vaswani et al., 2017), so compute and memory grow with length. Bigger windows are possible but cost more time and money, and quality on very long inputs can be uneven, so a large window is not a reason to paste everything in.

Common ways to live within it:

- **Retrieval:** search for the relevant chunks and send only those (this is RAG).
- **Summarising:** replace old history with a short summary.
- **Chunking:** process a long document piece by piece and combine the results.
- **Prompt caching:** some providers charge less for a repeated prefix.

## Example

```py run
WINDOW = 1000                      # a small made-up limit, in tokens
def fits(prompt_tokens, max_reply_tokens):
    return prompt_tokens + max_reply_tokens <= WINDOW

print(fits(700, 200))   # True
print(fits(900, 200))   # False: the reply may not fit
```

## Traps

- Forgetting to reserve room for the reply.
- Measuring the prompt in characters. Count tokens with the target model's counter.
- Assuming the model will use every part of a long context equally well.

## Related

See [[2026-11-17-tokens|#4 · Tokens and context windows]].

## Check yourself

> [!question]- A model has a 10,000-token window and your prompt is 9,800 tokens. What is the risk?
> Only 200 tokens remain for the reply, so a longer answer is cut off or the request is rejected.

> [!question]- Why does a long chat get slower and costlier per message?
> Each message resends the whole history, so the input grows every turn.
