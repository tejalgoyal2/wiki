---
title: Integration testing
aliases: [integration test, integration tests, integration-tested]
type: concept
track: backend
requires: [unit-testing]
description: Testing that several real parts of a system work together, such as your code with an actual database or another service, rather than each part alone.
depth: solid
sources:
  - https://docs.pytest.org/en/stable/
  - https://martinfowler.com/bliki/IntegrationTest.html
  - https://martinfowler.com/articles/practical-test-pyramid.html
created: 2026-11-24
updated: 2026-11-24
---
<!-- read-first -->
> [!info] Read first
> [[unit-testing|Unit testing]]
<!-- /read-first -->

An **integration test** checks that parts of a system work **together**: your function with a real database, two
services over [[http|HTTP]], or the whole path from loading data to producing a prediction. A [[unit-testing|unit test]]
fakes everything outside one function. An integration test removes some of those fakes, so it can catch what unit
tests cannot: wrong column names, mismatched formats, bad configuration, and wrong assumptions about the other side.

## How it works

Pick the boundary you want to test and use real parts on both sides of it. A common choice is the data layer: run a
real (often throwaway, in-memory or containerised) database and call your code against it. For a web API, start the app
and send real requests. Keep only the slow or costly outsiders fake, such as a payment provider's live service.

Integration tests are slower and need set-up and clean-up, so there are fewer of them than unit tests (the **test
pyramid**), and they run in [[continuous-integration|CI]] on every push. They fail for more reasons, so a good one
fails with a message that says which side is wrong.

## Example

A small pipeline, tested end to end with a real in-memory SQLite database:

```py run
import sqlite3

def save_scores(db, rows):
    db.executemany("INSERT INTO scores(name, value) VALUES (?, ?)", rows)

def average(db):
    return db.execute("SELECT AVG(value) FROM scores").fetchone()[0]

def test_save_and_average():
    db = sqlite3.connect(":memory:")                  # a real database engine
    db.execute("CREATE TABLE scores(name TEXT, value REAL)")
    save_scores(db, [("ana", 80), ("bo", 100)])
    assert average(db) == 90.0

test_save_and_average()
print("integration test passed")   # integration test passed
```

A unit test with a fake database would pass even if the SQL had a typo. This one would fail.

## Traps

- Shared state between tests (a leftover table) makes results depend on order. Reset the state for every test.
- Calling live third-party services makes tests flaky and slow. Use the provider's test mode or a local stand-in.
- Testing everything this way. Put detailed logic in fast unit tests and use few integration tests for the seams.
- Machine-learning code: unit test the loss and [[gradient-descent|gradients]]; add one integration test that fits a tiny known dataset
  and checks the result (see [[2026-11-24-linear-regression|lesson 9]]).

## Related

[[unit-testing|Unit testing]] is the layer below. [[continuous-integration|Continuous integration]] runs both.

## Check yourself

> [!question]- Why can a test suite of only unit tests pass while the app is broken?
> Each unit test fakes the parts around it, so it never checks the joins: a wrong SQL column, a changed JSON field, or a mismatched setting. Integration tests exercise those joins.

> [!question]- What should you fake in an integration test?
> Only what is slow, costly or outside your control, such as a live payment service. Keep the parts whose interaction you want to test real.
