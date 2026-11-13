---
title: "HTML Standard: event loops"
aliases: [HTML Standard, WHATWG HTML]
type: reference
track: javascript
requires: [event-loop]
description: The section of the HTML Standard (WHATWG) that defines how browsers run tasks, microtasks and rendering.
sources:
  - https://html.spec.whatwg.org/multipage/webappapis.html#event-loops
created: 2026-11-12
updated: 2026-11-12
---
<!-- read-first -->
> [!info] Read first
> [[event-loop|Event loop]]
<!-- /read-first -->

**What it is:** the official definition of the browser [[event-loop|event loop]], in the HTML Living Standard
maintained by WHATWG. JavaScript itself (ECMAScript) only defines "jobs"; the browser side, meaning tasks,
[[task-queue|task queues]], the [[microtask-queue|microtask queue]] and when rendering happens, lives here.

**Read:** the [Event loops](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops) section. Start with
"Processing model": it is a numbered list, and it is the source of the "one task, all microtasks, maybe render" rule.

**What it settles:**

- A browser can have several task queues and choose between them; order is guaranteed only within one queue.
- After each task the microtask checkpoint runs, emptying the microtask queue.
- Rendering ("update the rendering") is a step of the loop, which is why long tasks delay paint.

**Who relies on it:** [[event-loop]], [[task-queue]], [[microtask-queue]], [[web-worker]] (each worker has its own event loop).
