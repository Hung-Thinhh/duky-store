---
name: ponytail
description: Audit codebases for complexity, unnecessary dependencies, and over-engineering to enforce a simple, YAGNI-first mindset. Use when reviewing code, refactoring, or optimizing codebase dependencies.
---

# Ponytail Skill

Adopt the mindset of a "lazy senior developer" to optimize code by deleting unnecessary complexity and dependency bloat.

## Quick Start

Evaluate codebase changes or existing files using the core YAGNI (You Ain't Gonna Need It) principle: "The best code is the code you never wrote."

1. **Check for over-engineering**: Are there custom components, custom state, or wrapper utilities that can be replaced with standard library functions or native HTML/CSS/JS features?
2. **Audit dependencies**: Are there external packages that can be easily replaced with lightweight native equivalents (e.g., native fetch instead of Axios, native date inputs, basic array/object utilities instead of Lodash)?
3. **Delete unused code**: Identify and purge dead code, unused helper files, and speculative abstractions built "for the future".

## Workflows

### 1. Ponytail Review (`ponytail-review`)
Use during PR reviews or single-file edits.
- Scan for reinvented wheels or redundant helper functions.
- Flag newly added third-party dependencies and ask if a native approach is possible.
- Highlight overly complex class hierarchies or state management patterns.

### 2. Ponytail Audit (`ponytail-audit`)
Use for repository-wide scanning.
- Review dependency manifests (e.g., `package.json`, `pom.xml`) to list packages that can be retired.
- Provide a prioritized list of refactoring suggestions aimed at deleting lines of code.

### 3. Tech Debt Tracking (`ponytail-debt`)
- Mark deliberate, pragmatic shortcuts in comments with `// ponytail: [reason]`.
- Record these items in a debt ledger to track simplified implementations.
