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

## Backend & System Design

| Term | In one line |
|---|---|
| [[java\|Java]] | A statically typed, object-oriented language that compiles to bytecode for the JVM. Heavily used in banks and large companies. |
| [[microservices\|Microservices]] | Building one product as several small services that each own one job and their own data, and talk over the network. |

## CS Fundamentals

| Term | In one line |
|---|---|
| [[big-o-notation\|Big-O notation]] | A way to say how an algorithm's time or memory grows as the input grows, ignoring constants. |
| [[call-stack\|Call stack]] | The list of functions currently running, newest on top. A function's frame is pushed when it is called and popped when it returns. |
| [[concurrency-vs-parallelism\|Concurrency vs parallelism]] | Concurrency is dealing with many things in progress at once; parallelism is doing many things at the same instant. |
| [[hash-map\|Hash map]] | A key-value store that finds any key in O(1) time on average by turning the key into an array position with a hash function. |
| [[hash-map-lookup\|Hash map lookup (pattern)]] | Walk the input once and remember what you've seen in a hash map or set, so each "have I seen X?" question costs O(1). |
| [[thread\|Thread]] | A sequence of instructions the operating system can schedule. Threads in one process share memory; each has its own call stack. |
