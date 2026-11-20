---
title: Go (programming language)
aliases: [Golang]
type: concept
track: backend
requires: [thread, concurrency-vs-parallelism]
description: A compiled, statically typed language from Google built for servers and tools, known for fast builds, single-binary deploys and cheap concurrency with goroutines and channels.
depth: solid
sources:
  - https://go.dev/ref/spec
  - https://go.dev/doc/effective_go
  - https://go.dev/blog/loopvar-preview
created: 2026-11-20
updated: 2026-11-20
---
<!-- read-first -->
> [!info] Read first
> [[thread|Thread]] · [[concurrency-vs-parallelism|Concurrency vs parallelism]]
<!-- /read-first -->

Go (often called Golang, after its old website) is a compiled, statically typed language released by Google in
2009. It was designed for large server codebases: a small language that is quick to read, quick to compile, and
easy to deploy. Docker, Kubernetes, Terraform and Prometheus are written in it, which is why platform, DevOps and
backend job posts ask for it.

## How it works

- **Compiled to one static binary.** `go build` produces a single executable with its dependencies inside. Deploying
  is copying one file, which suits containers.
- **Small type system.** Structs, interfaces, slices, maps, and generics since Go 1.18. No classes and no
  inheritance. A type satisfies an interface just by having its methods; there is no `implements` keyword.
- **Errors are values.** Functions return `(result, err)`, and callers check `if err != nil`. There are no
  exceptions for normal failures.
- **Goroutines.** `go f()` runs `f` concurrently. Goroutines are cheap (they start with a small stack that grows),
  and the Go runtime schedules many of them onto a few OS threads, so a server can run one per request.
- **Channels.** Typed pipes between goroutines. The motto from Effective Go: "Do not communicate by sharing memory;
  instead, share memory by communicating."
- **Garbage collected**, with a collector tuned for short pauses.

## Example

A web server that answers every request in its own goroutine, with no extra code for that:

```go
package main

import (
	"fmt"
	"net/http"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "hello, %s\n", r.URL.Path[1:])
	})
	http.ListenAndServe(":8080", nil)
}
```

The handler is a closure. Go's closures follow the same rules as JavaScript's: they capture variables, not values.

## Compared with what you know

| | Go | Python | Node.js |
|---|---|---|---|
| Typing | static, compiled | dynamic | dynamic (TypeScript adds static checks) |
| Concurrency | goroutines on many threads | threads limited by the GIL (before [[gil\|free-threaded]] builds), or asyncio | one thread with an [[event-loop\|event loop]] |
| Deploy | one binary | interpreter plus packages | runtime plus `node_modules` |

## Traps

- **Loop variables before Go 1.22.** A loop declared one variable for all iterations, so goroutines and closures
  started in the loop often saw only the last value. Go 1.22 gives each iteration its own variable (for modules that
  declare `go 1.22` or later).
- **Goroutine leaks.** A goroutine blocked forever on a channel nobody writes to is never freed.
- **Nil maps.** Reading a nil map is fine; writing to one panics. Create maps with `make`.

## Related

[[concurrency-vs-parallelism|Concurrency vs parallelism]], [[thread|Thread]], [[closure|Closure]],
[[microservices|Microservices]] (a common use).

## Check yourself

> [!question]- Why is Go popular for infrastructure tools and services?
> It compiles to a single static binary that is easy to ship in a container, builds fast, and makes concurrency cheap
> with goroutines, which fits servers that handle many connections at once.

> [!question]- What changed about `for` loops in Go 1.22, and why?
> Each iteration now gets a new loop variable. Before, all iterations shared one, so closures and goroutines that
> kept a reference to it often saw the final value, a very common bug.
