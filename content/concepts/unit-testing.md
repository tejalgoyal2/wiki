---
title: Unit testing
aliases: [unit test, unit tests, unit-tested]
type: concept
track: backend
description: Checking one small piece of code, such as a function, on its own with fixed inputs and expected outputs, run automatically on every change.
depth: solid
sources:
  - https://docs.python.org/3/library/unittest.html
  - https://docs.pytest.org/en/stable/
  - https://jestjs.io/docs/getting-started
created: 2026-11-17
updated: 2026-11-17
---

A **unit test** runs one small unit of code, usually a function or a class, with known inputs and checks that the result is what you expect. A suite of them runs in seconds and runs again on every push, so a change that breaks old behaviour shows up at once.

## How it works

A good test has three steps, often called arrange, act, assert: set up the input, call the code, check the result. It fails loudly when the result is wrong and passes silently otherwise.

Good unit tests are fast, repeatable (same result every run), independent of each other, and about one behaviour. To get there, tests cut out slow or unpredictable parts: the network, the clock, a database, a random number generator. You replace those with a **stub** or **fake** that returns fixed data, or a **mock** that also records how it was called.

Unit tests sit at the bottom of a pyramid. Above them are integration tests (several parts together, such as your code and a real database) and end-to-end tests (the whole system). Unit tests are cheap, so you have many; the higher kinds are slower, so you have fewer.

Common tools: `unittest` and `pytest` in Python (3.13 ships `unittest`; `pytest` is a package), Jest or Vitest in JavaScript.

## Example

```py run
def apply_discount(price, percent):
    if not 0 <= percent <= 100:
        raise ValueError("percent must be between 0 and 100")
    return round(price * (1 - percent / 100), 2)

def test_normal_discount():
    assert apply_discount(80, 25) == 60.0

def test_zero_discount():
    assert apply_discount(80, 0) == 80

def test_rejects_bad_percent():
    try:
        apply_discount(80, 120)
    except ValueError:
        return
    raise AssertionError("expected ValueError")

for t in (test_normal_discount, test_zero_discount, test_rejects_bad_percent):
    t()
print("all passed")   # all passed
```

A runner such as pytest finds functions named `test_*` for you and reports each failure with details.

## Traps

- Testing implementation details (which helper was called) instead of behaviour. The test then breaks on every refactor.
- Tests that depend on order, the current time or a live service, so they fail at random.
- Over-mocking: if everything is mocked, the test proves only that the mocks agree with themselves.
- Treating a coverage percentage as quality. Lines run is not the same as behaviour checked.

## Related

Tests around code that calls a language model keep the model behind a stub; see [[2026-11-17-tokens|#4 · Tokens and context windows]].

## Check yourself

> [!question]- Why replace a database call with a fake in a unit test?
> A real database is slow and its state can change between runs, so the test would be slow and unrepeatable. A fake returns fixed data, so the test checks only your logic.

> [!question]- What is the difference between a unit and an integration test?
> A unit test checks one piece in isolation. An integration test checks that several real pieces work together, such as your code with an actual database.

<!-- leads-to -->
## Leads to

- [[continuous-integration|Continuous integration]]: Automatically building and testing the code on every push so that broken changes are caught within minutes; CI/CD adds automatic delivery to users.
<!-- /leads-to -->
