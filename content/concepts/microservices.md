---
title: Microservices
aliases: [microservice, microservice architecture, monolith]
type: concept
track: backend
description: Building one product as several small services that each own one job and their own data, and talk over the network.
depth: solid
sources:
  - https://martinfowler.com/articles/microservices.html
  - https://github.com/donnemartin/system-design-primer#microservices
created: 2026-11-12
updated: 2026-11-12
---

A **monolith** is one application, deployed as one unit, usually with one database. **Microservices** split the
product into small services (users, payments, notifications), each with **its own data**, deployed **on its own**,
talking over HTTP/gRPC or a message queue such as Kafka.

## What it buys, and what it costs

| You gain | You pay |
|---|---|
| Teams ship their service without waiting for everyone | Every call is a network call: slower, and it can fail |
| Scale only the busy part (e.g. search) | Data is spread out; no single transaction across services |
| A bug or crash is contained to one service | Debugging needs tracing across services |
| Each service can use the right tool | More deploys, more monitoring, more infrastructure (Docker, Kubernetes) |

A common view: **start with a well-structured monolith**, split out a service when a team or scaling need forces it.

## How services talk

- **Synchronous:** service A calls B over HTTP and waits. Simple, but A is down when B is down.
- **Asynchronous:** A publishes an event ("order placed") to a queue; B, C, D react when they can. More resilient, harder to follow.

## Related

[[java]] and Spring Boot are a common microservice stack in large companies. Lesson 35 covers this in depth.

## Check yourself

> [!question]- Why do microservices make "one transaction across everything" hard?
> Each service owns its own database, so there is no single database transaction that covers all of them; you need patterns like sagas or events instead.

> [!question]- Name one good reason to split a service out of a monolith.
> One part needs to scale very differently (for example search under heavy load), or a separate team needs to deploy it on its own schedule.
