---
title: HTTP
aliases: [HTTPS, HTTP/1.1, HTTP/2, HTTP/3, hypertext transfer protocol]
type: concept
track: backend
requires: [idempotency]
description: The request-and-response protocol that browsers, apps and APIs use to talk to servers, built from a method, a target, headers, a status code and an optional body.
depth: solid
sources:
  - https://www.rfc-editor.org/rfc/rfc9110
  - https://www.rfc-editor.org/rfc/rfc9112
  - https://www.rfc-editor.org/rfc/rfc9113
  - https://www.rfc-editor.org/rfc/rfc9114
created: 2026-11-18
updated: 2026-11-18
---
<!-- read-first -->
> [!info] Read first
> [[idempotency|Idempotency]]
<!-- /read-first -->

**HTTP** (HyperText Transfer Protocol) is how a client asks a server for something and gets an answer. The client sends a **request**, the server sends one **response**, and the exchange ends. The server keeps no memory of the client between exchanges, so HTTP is **stateless**. HTTPS is HTTP carried inside an encrypted [[tls|TLS]] connection.

## How it works

A request has a **method** (what to do), a **target** (the path, such as `/items/9`), **headers** (metadata as `name: value` lines) and sometimes a **body**. A response has a **status code**, headers and sometimes a body.

```text
GET /items/9 HTTP/1.1
Host: example.com
Accept: application/json

HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 18

{"name": "pencil"}
```

The meaning of methods, status codes and headers is defined once, in RFC 9110, and is the same in every version. The versions differ in how the bytes travel:

| Version | Wire format | Parallel requests on one connection |
|---|---|---|
| HTTP/1.1 (RFC 9112) | Text | No: responses come back in order |
| HTTP/2 (RFC 9113) | Binary frames in streams, compressed headers | Yes, over one [[tcp\|TCP]] connection |
| HTTP/3 (RFC 9114) | Binary frames over QUIC | Yes, and a lost packet only delays its own stream |

HTTP/1.1 keeps a connection open by default (**keep-alive**), so the cost of the TCP and TLS handshakes is paid once, not for every request.

## Example

```py run
import socket, threading
from http.server import BaseHTTPRequestHandler, HTTPServer

class H(BaseHTTPRequestHandler):
    def do_GET(self):
        body = b"hello"
        self.send_response(200)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
    def log_message(self, *a):
        pass

srv = HTTPServer(("127.0.0.1", 0), H)
threading.Thread(target=srv.serve_forever, daemon=True).start()
s = socket.create_connection(srv.server_address)
s.sendall(b"GET / HTTP/1.1\r\nHost: x\r\nConnection: close\r\n\r\n")
data = b""
while chunk := s.recv(1024):
    data += chunk
print(data.decode().splitlines()[0])   # HTTP/1.0 200 OK  (this server speaks 1.0 unless you set 1.1)
print(data.split(b"\r\n\r\n")[1])      # b'hello'
srv.shutdown()
```

## Traps

- Statelessness does not mean no state: cookies and [[token|tokens]] carry state with each request.
- A `GET` must not change data. Robots and prefetchers send `GET` freely.
- The status code is the contract. A `200` with an error message in the body hides failures from clients and monitoring.
- Versions change performance, not meaning. Code written against methods and status codes works on all three.

## Related

[[idempotency|Idempotency]] decides which requests are safe to retry. [[http-status-codes|Status codes]] tell the client what happened. The full walk-through is in [[2026-11-18-http|lesson 5]]. [[microservices|Microservices]] talk to each other mostly over HTTP.

## Check yourself

> [!question]- What does it mean that HTTP is stateless?
> Each request carries everything the server needs; the server does not remember earlier requests from the same client. State, such as a login, is carried by the client in cookies or tokens on each request.

> [!question]- What stays the same and what changes between HTTP/1.1 and HTTP/2?
> The semantics stay: methods, status codes and headers mean the same. The wire format changes from text to binary frames, and many requests can share one connection at once.

<!-- leads-to -->
## Leads to

- [[2026-11-18-http|#5 · HTTP in depth]]: What an HTTP request and response really are, which methods are safe and idempotent, the status codes that matter, and how keep-alive and HTTP/2 make it faster.
- [[http-status-codes|HTTP status codes]]: The three-digit number in an HTTP response that tells the client what happened, grouped by the first digit into success, redirect, client error and server error.
- [[idempotency|Idempotency]]: An operation is idempotent if doing it many times leaves the system in the same state as doing it once, which is what makes retries safe.
<!-- /leads-to -->
