---
title: Glossary
description: Every concept and pattern in the wiki, with its one-line definition.
generated: true
nolink: true
---

Every term in the wiki in one line. Hover a term for a preview, click it for the full note.
This page is generated from the notes themselves, so it is always complete.

## JavaScript

| Term | In one line |
|---|---|
| [[async-await\|async / await]] | Syntax that lets promise-based code read top to bottom. An async function always returns a promise; await pauses only that function. |
| [[event-loop\|Event loop]] | The rule that decides when queued callbacks run in JavaScript - only when the call stack is empty, microtasks first. |
| [[microtask-queue\|Microtask queue]] | A high-priority queue for promise callbacks and await continuations. It is emptied completely after every task. |
| [[promise\|Promise]] | An object that stands for a result that isn't ready yet. It is pending, then fulfilled with a value or rejected with an error, exactly once. |
| [[task-queue\|Task queue]] | Where callbacks for timers, events and I/O wait. The event loop runs one task per turn, then all microtasks. |
| [[web-worker\|Web Worker]] | A real background thread for JavaScript in the browser. It has no DOM access and talks to the page by passing messages. |

## Python & Data

| Term | In one line |
|---|---|
| [[gil\|GIL (Global Interpreter Lock)]] | A lock in CPython that lets only one thread run Python bytecode at a time. Python 3.13 added an optional build without it. |
| [[mutability\|Mutability]] | Whether an object can be changed after it is created. It decides what other names pointing at the same object will see. |
| [[shallow-vs-deep-copy\|Shallow vs deep copy]] | A shallow copy makes a new outer container that holds the same inner objects; a deep copy copies everything all the way down. |

## ML & Data Science

| Term | In one line |
|---|---|
| [[bias-variance-trade-off\|Bias-variance trade-off]] | A model's error on new data comes from bias (too rigid), variance (too sensitive to its sample) and noise; making it more flexible trades one for the other. |
| [[cross-validation\|Cross-validation]] | Estimating how well a model generalises by training it k times, each time holding out a different part of the training data, and averaging the scores. |
| [[data-leakage\|Data leakage]] | When information the model will not have at prediction time gets into training, so offline scores look better than real-world performance. |
| [[overfitting\|Overfitting]] | When a model learns the noise in its training data along with the real pattern, so it scores well in training and worse on new data. |
| [[train-validation-test-split\|Train, validation and test split]] | Cutting labelled data into three groups - one to fit the model, one to choose between models, one to measure the final choice honestly. |

## LLMs & RAG

| Term | In one line |
|---|---|
| [[byte-pair-encoding\|Byte-pair encoding]] | A way to build a tokenizer vocabulary by repeatedly merging the most frequent adjacent pair of pieces, so common text is short and rare text still works. |
| [[context-window\|Context window]] | The maximum number of tokens a language model can take in and produce in one request, prompt and reply together. |
| [[token\|Token]] | A piece of text, mapped to an integer, that a language model reads and writes instead of letters or words. |

## Backend & System Design

| Term | In one line |
|---|---|
| [[continuous-integration\|Continuous integration]] | Automatically building and testing the code on every push so that broken changes are caught within minutes; CI/CD adds automatic delivery to users. |
| [[http\|HTTP]] | The request-and-response protocol that browsers, apps and APIs use to talk to servers, built from a method, a target, headers, a status code and an optional body. |
| [[http-status-codes\|HTTP status codes]] | The three-digit number in an HTTP response that tells the client what happened, grouped by the first digit into success, redirect, client error and server error. |
| [[idempotency\|Idempotency]] | An operation is idempotent if doing it many times leaves the system in the same state as doing it once, which is what makes retries safe. |
| [[java\|Java]] | A statically typed, object-oriented language that compiles to bytecode for the JVM. Heavily used in banks and large companies. |
| [[microservices\|Microservices]] | Building one product as several small services that each own one job and their own data, and talk over the network. |
| [[tcp\|TCP]] | The transport protocol that turns unreliable network packets into a reliable, ordered stream of bytes between two programs; HTTP/1.1 and HTTP/2 run on top of it. |
| [[tls\|TLS]] | The protocol that encrypts a connection and proves the server's identity with a certificate; it is the S in HTTPS. |
| [[unit-testing\|Unit testing]] | Checking one small piece of code, such as a function, on its own with fixed inputs and expected outputs, run automatically on every change. |

## CS Fundamentals

| Term | In one line |
|---|---|
| [[amortized-analysis\|Amortized analysis]] | Measuring the cost of an operation averaged over any sequence of operations, so a rare expensive step (like a resize) still counts as cheap per call. |
| [[b-tree\|B-tree]] | A balanced search tree with many keys per node, used for database indexes because it finds a key in very few disk reads. |
| [[big-o-notation\|Big-O notation]] | A way to say how an algorithm's time or memory grows as the input grows, ignoring constants. |
| [[bucket-sort\|Bucket sort (pattern)]] | When the values you would sort by are small whole numbers, use them as list indexes ("buckets") and read the buckets in order, which costs O(n) instead of O(n log n). |
| [[call-stack\|Call stack]] | The list of functions currently running, newest on top. A function's frame is pushed when it is called and popped when it returns. |
| [[concurrency-vs-parallelism\|Concurrency vs parallelism]] | Concurrency is dealing with many things in progress at once; parallelism is doing many things at the same instant. |
| [[cpu\|CPU]] | The chip that executes a program's instructions one after another; it has cores, registers and caches, and its speed depends heavily on how fast data reaches it. |
| [[dynamic-array\|Dynamic array]] | An array that grows on demand by moving into a larger block of memory when full; Python's list, JavaScript's Array and Java's ArrayList work this way. |
| [[hash-map\|Hash map]] | A key-value store that finds any key in O(1) time on average by turning the key into an array position with a hash function. |
| [[hash-map-lookup\|Hash map lookup (pattern)]] | Walk the input once and remember what you've seen in a hash map or set, so each "have I seen X?" question costs O(1). |
| [[thread\|Thread]] | A sequence of instructions the operating system can schedule. Threads in one process share memory; each has its own call stack. |
