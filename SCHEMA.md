# SCHEMA: how this wiki is written

The rules every page follows, whether Claude or a person writes it. Read this before adding or changing a page.

## Note types and folders

| Type | Folder | What it is | Changes later? |
|---|---|---|---|
| `lesson` | `content/lessons/` | One day's lesson: 20-30 minutes, teaches one idea in depth | Only to fix mistakes |
| `concept` | `content/concepts/` | One term, explained so it stands alone. The evergreen reference | Yes: grows over time |
| `puzzle` | `content/puzzles/` | One coding problem in our own words, hints, then the solution | Solution is added the day after |
| `pattern` | `content/patterns/` | A problem-solving pattern (sliding window, hash map lookup ...) | Yes |
| `reference` | `content/references/` | One primary source: an RFC, a spec section, a PEP, a paper. What it says, in our words, and which concepts rely on it | Rarely |
| `path` | `content/paths/` | A reading order for a goal ("Backend from zero") | Yes |
| `review` | `content/reviews/` | Sunday recap and mock interview | No |

File names are lowercase-hyphen (`microtask-queue.md`). Lessons start with the date (`2026-11-11-event-loop.md`).

## Frontmatter

```yaml
title: Microtask queue            # how the note is named everywhere
aliases: [microtask, microtasks]  # other spellings; the linker links these too
type: concept
track: javascript                 # javascript | python-data | ml | llm-rag | backend | cs-fundamentals
description: One line. Shown in link previews and search results.
depth: solid                      # concept only: solid (300-600 words) | deep (1,500+)
sources:                          # primary sources first: specs, RFCs, official docs, papers
  - https://html.spec.whatwg.org/multipage/webappapis.html#microtask-queue
created: 2026-11-11
updated: 2026-11-11
```

Lessons also have `lesson: <number>`, `puzzle: <puzzle note name>` and `market_word: <term>`.

## Links

- Write plain text. `scripts/link.mjs` turns the first mention of every note title or alias on a page into a link.
  Link by hand only when the wording differs (`[[thread|the main thread]]`).
- Aliases must be specific enough not to match ordinary English. "promise" is fine in this wiki; "set" is not.
- Never link inside code, headings or callout titles. The linker already skips them.

## Writing rules

- Plain, simple English. Short sentences. Define a term the first time, or let the link do it.
- Mental model first, then how it really works, then an example, then the traps.
- Every concept note: a one-line `description`, **How it works**, an **Example**, **Traps** (if any),
  **Related**, and **Check yourself** questions as folded callouts (`> [!question]- ...`).
- Code that is meant to run gets `run` after the language (` ```js run `). `scripts/check.mjs` runs it; a failing block fails the build.
  Snippets that must not run (infinite loops, browser-only APIs) are left without `run`.
- Facts that depend on a version name the version (Python 3.13, Node 22, Java 25).

## Sources and licenses

- Link to primary sources freely: RFCs, the HTML and ECMAScript standards, PEPs, official docs, papers.
- **Explain in our own words.** Short quotes (a sentence) with a link are fine.
- Adapting longer text needs a compatible license and credit on the page:
  CC BY 4.0 (system-design-primer), MIT (tech-interview-handbook) are fine with credit;
  CC BY-SA (Wikipedia, MDN prose) would make the page share-alike, so do not adapt it, only link.
- IETF-stream RFCs allow derivative works only inside the IETF process: link and quote briefly, never adapt.
- Never copy LeetCode problem text. Describe the problem in our own words and link to it.

## Daily budget

One lesson, its puzzle, up to 5 new concept notes, and 1 existing note made deeper (the most-linked note that is still `solid`).
Quality over count: a missing note is better than a wrong one.
