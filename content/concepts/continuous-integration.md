---
title: Continuous integration
aliases: [CI/CD, continuous delivery, Jenkins, build pipeline, CI pipeline]
type: concept
track: backend
requires: [unit-testing]
description: Automatically building and testing the code on every push so that broken changes are caught within minutes; CI/CD adds automatic delivery to users.
depth: solid
sources:
  - https://martinfowler.com/articles/continuousIntegration.html
  - https://www.jenkins.io/doc/book/pipeline/
  - https://docs.github.com/en/actions/about-github-actions/understanding-github-actions
created: 2026-11-18
updated: 2026-11-18
---
<!-- read-first -->
> [!info] Read first
> [[unit-testing|Unit testing]]
<!-- /read-first -->

**Continuous integration** (CI) means every change is merged into the shared branch often, and a server builds the code and runs the tests on every push. A broken change shows up within minutes, while its author still remembers it. **Continuous delivery** (the "CD" in CI/CD) adds the next step: every change that passes can be released, and often is, with little manual work.

## How it works

A CI system watches a repository. A push or pull request starts a **pipeline**, a list of stages that each must pass:

1. Check out the code.
2. Install dependencies and build.
3. Run [[unit-testing|unit tests]], then slower integration tests, plus linters and security scans.
4. Publish an artifact (a package or container image).
5. For CD: deploy to staging, run a smoke test (often an [[http|HTTP]] call that must return `200`), then to production.

If a stage fails, the pipeline stops and the change is blocked. The pipeline is written as code and stored in the repo: a `Jenkinsfile` for **Jenkins**, a YAML file under `.github/workflows` for GitHub Actions, `.gitlab-ci.yml` for GitLab CI. Jenkins is an open-source server you run yourself, with a large plugin ecosystem; many large companies still use it. Hosted tools remove the need to run the server.

Tests only help if they are fast and trustworthy. A suite that takes an hour or fails at random teaches people to ignore red builds.

## Example

The idea in a few lines of Python: run the stages in order and stop at the first failure.

```py run
def run_pipeline(stages):
    for name, step in stages:
        ok = step()
        print(f"{name}: {'ok' if ok else 'FAILED'}")
        if not ok:
            return False
    return True

stages = [("build", lambda: True), ("unit tests", lambda: True),
          ("integration tests", lambda: False), ("deploy", lambda: True)]
print(run_pipeline(stages))
# build: ok
# unit tests: ok
# integration tests: FAILED
# False   (deploy never ran)
```

## Traps

- Merging only once a week is not integration. Small, frequent changes keep conflicts small.
- A flaky test is worse than none: people stop trusting the signal.
- Secrets in pipeline files leak. Use the tool's secret store.
- "Passes on my machine" is why CI builds in a clean environment.

## Related

[[unit-testing|Unit tests]] are the first gate. The market-word note in [[2026-11-18-http|lesson 5]] ties it to job posts.

## Check yourself

> [!question]- What is the difference between continuous integration and continuous delivery?
> CI builds and tests every change automatically. Continuous delivery goes further and keeps every passing change ready to release, or releases it automatically.

> [!question]- Why does a pipeline stop at the first failing stage?
> Later stages assume the earlier ones passed. Deploying code whose tests failed defeats the purpose of the checks, and stopping gives fast feedback.
