---
title: HTTP status codes
aliases: [status code, status codes, HTTP status code, HTTP status]
type: concept
track: backend
requires: [http]
description: The three-digit number in an HTTP response that tells the client what happened, grouped by the first digit into success, redirect, client error and server error.
depth: solid
sources:
  - https://www.rfc-editor.org/rfc/rfc9110#section-15
  - https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml
created: 2026-11-18
updated: 2026-11-18
---
<!-- read-first -->
> [!info] Read first
> [[http|HTTP]]
<!-- /read-first -->

The **status code** is a three-digit number in the first line of every [[http|HTTP]] response. Code, not people, reads it: clients, proxies, caches and monitoring all branch on it. The text after the number (the reason phrase) is only a label. RFC 9110 defines the meanings, and IANA keeps the registry.

## How it works

The first digit is the class:

| Class | Meaning |
|---|---|
| 1xx | Informational: keep going (`100 Continue`, `101 Switching Protocols`) |
| 2xx | Success |
| 3xx | The resource is somewhere else, or unchanged |
| 4xx | The client's request is wrong |
| 5xx | The server failed on a valid request |

The ones you will use daily:

| Code | Use it when |
|---|---|
| 200 OK | A normal success with a body |
| 201 Created | `POST` or `PUT` made a new resource; send a `Location` header |
| 204 No Content | Success, nothing to return (often `DELETE`) |
| 301 / 308 | Moved permanently (308 keeps the method) |
| 302 / 307 | Moved temporarily (307 keeps the method) |
| 304 Not Modified | The cached copy is still good |
| 400 Bad Request | The request is malformed |
| 401 Unauthorized | Not authenticated: who are you? |
| 403 Forbidden | Authenticated but not allowed |
| 404 Not Found | No such resource |
| 409 Conflict | Clashes with the current state (duplicate, version mismatch) |
| 422 Unprocessable Content | Well-formed but fails validation |
| 429 Too Many Requests | Rate limited; may include `Retry-After` |
| 500 Internal Server Error | An unexpected bug |
| 502 / 503 / 504 | Bad reply from upstream / unavailable / upstream timed out |

The class guides retries. A 4xx will fail the same way next time, so fix the request. A 502, 503, 504, or a 429 with a wait, may succeed later, and it is safe to retry when the method is [[idempotency|idempotent]].

## Example

```py run
def should_retry(method, status):
    idempotent = method in {"GET", "HEAD", "OPTIONS", "PUT", "DELETE"}
    return idempotent and status in {429, 502, 503, 504}

print(should_retry("GET", 503))    # True
print(should_retry("POST", 503))   # False
print(should_retry("GET", 404))    # False
```

## Traps

- `200` with `{"error": ...}` in the body fools every tool that reads the status.
- `401` is the confusing name: it really means unauthenticated.
- Do not return `500` for bad input; that is a `4xx`. Do not return `404` to hide a permission problem unless you mean to.
- Redirect codes differ on whether a `POST` becomes a `GET` when followed (301 and 302 may; 307 and 308 do not).

## Related

[[2026-11-18-http|Lesson 5]] places them next to methods and headers.

## Check yourself

> [!question]- What is the difference between 401 and 403?
> 401: the server does not know who you are, so log in. 403: it knows who you are and the answer is no.

> [!question]- Which of 400, 429 and 503 is worth retrying later?
> 429 and 503. A 400 means the request itself is wrong, so the same request fails again.
