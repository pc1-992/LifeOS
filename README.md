# LifeOS

LifeOS is a modular intelligent life operating system. The long-term goal is context awareness, AI agents, routines, memory, semantic understanding, and privacy-by-context.

## Current Stage

This repository is only the clean foundation. It defines the architecture and first boundaries before adding heavy frameworks or AI integrations.

## Recommended Stack

- Language: TypeScript
- Package manager: pnpm workspaces
- Web app: React with Vite
- API: Node.js with Fastify
- Local database: SQLite
- Database layer: Drizzle ORM
- Background jobs: start simple with in-process workers, later move to a queue
- AI provider boundary: adapter-based, so OpenAI/local models can be swapped later
- Vector memory: start with a repository interface, later add SQLite vector extension, Qdrant, or pgvector

## Folder Map

```text
apps/
  api/            HTTP API entry point
  web/            User interface
packages/
  core/           Pure domain model: entities, value objects, rules
  application/    Use cases and ports: what the system can do
  adapters/       Infrastructure: databases, AI providers, external tools
  shared/         Small shared utilities and cross-app types
docs/             Architecture and learning notes
scripts/          Developer automation
```

## Clean Architecture Rule

Dependencies point inward:

```text
apps -> adapters -> application -> core
```

`core` must not import from apps, adapters, databases, web frameworks, or AI SDKs.

## Next Commands

After dependencies are added:

```bash
pnpm install
pnpm dev
```

For now, read `docs/ARCHITECTURE.md` and `docs/TECH_STACK.md` first.
