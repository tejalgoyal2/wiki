---
title: Java
aliases: [JVM, Java Virtual Machine]
type: concept
track: backend
description: A statically typed, object-oriented language that compiles to bytecode for the JVM. Heavily used in banks and large companies.
depth: solid
sources:
  - https://docs.oracle.com/en/java/javase/
  - https://openjdk.org/projects/jdk/
created: 2026-11-12
updated: 2026-11-12
---

Java is a statically typed, object-oriented language. You compile `.java` files to **bytecode** (`.class` files),
and the **JVM** (Java Virtual Machine) runs that bytecode on any operating system. The JVM starts by interpreting it,
then a JIT (just-in-time) compiler turns hot code into fast machine code while the program runs.

## Why job posts ask for it

Banks, insurers, telecoms and large retailers run much of their backend on Java, usually with the **Spring Boot**
framework, plus Kafka, SQL databases and [[microservices]]. It was the most-asked missing skill in the Canadian
entry-level posts this wiki tracks (see [[2026-11-11-event-loop|lesson 1]]).

## If you know C#, Python or TypeScript

| Idea | Java |
|---|---|
| Types | Declared and checked at compile time; `var` infers local types (Java 10+) |
| Memory | Garbage collected, like C#, Python and JavaScript |
| [[concurrency-vs-parallelism\|Concurrency]] | Real [[thread\|threads]] that run in parallel; virtual threads since Java 21 |
| Collections | `List`/`ArrayList`, `Map`/`HashMap` (a [[hash-map\|hash map]]), `Set`/`HashSet` |
| Web framework | Spring Boot (the role ASP.NET Core plays in C#, or FastAPI in Python) |
| Versions | Long-term support releases: 17, 21, 25 |

```java
import java.util.HashMap;
import java.util.Map;

public class TwoSum {
    static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            Integer j = seen.get(target - nums[i]);
            if (j != null) return new int[] { j, i };
            seen.put(nums[i], i);
        }
        return new int[0];
    }
}
```

The same [[two-sum|Two Sum]] solution as in Python, with types spelled out.

## Check yourself

> [!question]- What does the JVM run, and why does that make Java portable?
> It runs bytecode. The same bytecode runs on any OS that has a JVM, so you compile once.

> [!question]- What is the Java equivalent of Python's dict?
> `Map`, most often the `HashMap` implementation.
