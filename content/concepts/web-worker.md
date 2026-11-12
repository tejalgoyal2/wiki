---
title: Web Worker
aliases: [web workers, worker threads, worker_threads]
type: concept
track: javascript
description: A real background thread for JavaScript in the browser. It has no DOM access and talks to the page by passing messages.
depth: solid
sources:
  - https://html.spec.whatwg.org/multipage/workers.html
  - https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers
  - https://nodejs.org/api/worker_threads.html
created: 2026-11-12
updated: 2026-11-12
---

A Web Worker runs a JavaScript file on a **separate [[thread]]**, so heavy work doesn't freeze the page. It has its
own [[event-loop|event loop]] and its own global scope.

## How it works

```js
// main.js (in the page)
const worker = new Worker('worker.js');
worker.postMessage({ n: 40 });
worker.onmessage = (e) => console.log('result', e.data);

// worker.js
self.onmessage = (e) => {
  const fib = (n) => (n < 2 ? n : fib(n - 1) + fib(n - 2));
  self.postMessage(fib(e.data.n));    // heavy work, but the page stays smooth
};
```

- Messages are **copied** (structured clone), not shared. Large binary data can be **transferred** instead (an `ArrayBuffer` moves to the worker and becomes unusable on the sending side), which avoids the copy.
- Workers **cannot touch the DOM**. They compute; the page updates the UI with the result.
- Real shared memory exists (`SharedArrayBuffer` with `Atomics`), but browsers only allow it on cross-origin isolated pages.
- Node.js has the same idea in `worker_threads`.

## When to use one

Parsing big files, image processing, heavy maths, search indexing: anything that would take more than ~50 ms on the main thread.
Not for network calls: those already happen outside your thread.

## Check yourself

> [!question]- Why can't a worker update the page directly?
> Workers have no access to the DOM. They send results back with `postMessage`, and the main thread updates the page.

> [!question]- Your page freezes for 2 seconds while sorting a huge array. What are two fixes?
> Move the sort into a Web Worker, or split the work into small chunks scheduled with `setTimeout` so the browser can paint between them.
