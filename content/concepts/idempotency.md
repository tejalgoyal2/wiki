---
title: Idempotency
aliases: [idempotent, idempotence, idempotency key, idempotency keys]
type: concept
track: backend
requires: [http]
description: An operation is idempotent if doing it many times leaves the system in the same state as doing it once, which is what makes retries safe.
depth: solid
sources:
  - https://www.rfc-editor.org/rfc/rfc9110#section-9.2.2
  - https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/
created: 2026-11-18
updated: 2026-11-18
---
<!-- read-first -->
> [!info] Read first
> [[http|HTTP]]
<!-- /read-first -->

An operation is **idempotent** if running it once or running it many times leaves the system in the same state. "Set the light to on" is idempotent. "Flip the light switch" is not. The word describes the effect on state, not the reply: the second call may return a different answer and still be idempotent.

## How it works

Networks lose messages. If a client sends a request and the connection drops, it cannot know whether the server did the work. If the operation is idempotent, the client just sends it again. If not, a retry may do the work twice.

In [[http|HTTP]] (RFC 9110, section 9.2.2) `GET`, `HEAD`, `OPTIONS`, `PUT` and `DELETE` are defined as idempotent, and `POST` and `PATCH` are not. That is a [[promise|promise]] the server's code has to keep: a handler that makes `PUT` increment a counter breaks it.

To make a non-idempotent operation safe to retry, use an **idempotency key**. The client creates a unique ID (a UUID) for one logical action and sends it in a header on every attempt. The server stores the key together with the result of the first attempt. A repeat with the same key returns the stored result and does nothing new. Payment APIs work this way. A key must be kept for a limited time, and a repeat with the same key but a different body should be rejected.

The same idea applies outside HTTP: a job that can run twice without harm ("insert or update by ID", not "append a row"), a queue consumer that ignores a message it has already processed, a pipeline step that rewrites a partition instead of adding to it.

## Example

```py run
accounts = {"a": 100}
processed = {}          # idempotency key -> result

def withdraw(key, account, amount):
    if key in processed:                 # a retry: return the first result
        return processed[key]
    accounts[account] -= amount
    processed[key] = accounts[account]
    return processed[key]

print(withdraw("k1", "a", 30))   # 70
print(withdraw("k1", "a", 30))   # 70  (retry: not charged again)
print(withdraw("k2", "a", 30))   # 40  (a new action)
```

## Traps

- Idempotent does not mean safe. `DELETE` changes state; it is just fine to repeat.
- "Append" and "increment" are not idempotent. "Set to this value" is.
- Check-then-act without a unique constraint races: two retries at once can both pass the check. Enforce the key with a unique index.
- Storing the key forever costs space; storing it too briefly allows duplicates after a long outage.

## Related

[[http-status-codes|Status codes]] such as `503` and `504` are the usual reason to retry. See [[2026-11-18-http|lesson 5]] for the methods table.

## Check yourself

> [!question]- A client retries `PUT /users/7` with the same body three times. How many users exist afterwards, and why?
> One. `PUT` replaces the resource at that URL, so repeating it leaves the same state.

> [!question]- Why does a payment API ask for an idempotency key on `POST`?
> A timeout leaves the client unsure whether the payment happened. With the same key on every retry, the server charges once and returns the stored result for repeats.

<!-- leads-to -->
## Leads to

- [[2026-11-18-http|#5 · HTTP in depth]]: What an HTTP request and response really are, which methods are safe and idempotent, the status codes that matter, and how keep-alive and HTTP/2 make it faster.
- [[http|HTTP]]: The request-and-response protocol that browsers, apps and APIs use to talk to servers, built from a method, a target, headers, a status code and an optional body.
<!-- /leads-to -->
