# AGENTS.md

## Project Identity

LifeOS is a modular context-aware life operating system.

The goal is to build an intelligent system that helps users:
- manage memory
- understand context
- reduce cognitive overload
- support routines and decision making
- maintain privacy-by-context

---

## Architecture Philosophy

LifeOS follows clean architecture principles.

Direction of dependencies:

apps -> adapters -> application -> core

Rules:
- core must remain framework-independent
- application contains use cases only
- adapters contain external integrations
- apps are only entry points and UI/API layers

---

## Coding Rules

- Prefer simple readable code over clever code
- Explain important architectural decisions
- Avoid unnecessary abstractions
- Keep modules small and focused
- Do not mix infrastructure with business logic
- Never place database logic inside core

---

## Privacy Philosophy

Privacy is a first-class system feature.

Every memory, context snapshot, and agent task should support:
- privacy scopes
- contextual permissions
- future encryption support

---

## UI Philosophy

The interface should feel:
- calm
- minimal
- cognitively light
- emotionally safe
- context-aware

Avoid clutter and overwhelming dashboards.

---

## Development Rules

- Explain every important step for beginner developers
- Prefer iterative development
- Do not generate massive systems at once
- Build features incrementally
- Always explain file structure changes

---

## Long-Term Vision

LifeOS may later include:
- AI agents
- semantic memory
- routines engine
- contextual recommendations
- local AI models
- encrypted memory systems
- automation workflows
- voice interaction

Design decisions should preserve modularity for future growth.