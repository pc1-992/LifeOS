# LifeOS Technology Stack

## Beginner-Friendly Choice

Use one main language first: TypeScript. This reduces context switching because the browser app, backend API, shared types, and agent logic can all use the same language.

## Recommended Tools

| Area | Choice | Why |
| --- | --- | --- |
| Language | TypeScript | Strong types help catch mistakes early. |
| Workspace | pnpm workspaces | Keeps multiple apps/packages in one repo without copying code. |
| Web | React + Vite | Fast local development and a large ecosystem. |
| API | Fastify | Lightweight, fast, and TypeScript-friendly. |
| Database | SQLite first | Simple local development with one file. |
| ORM | Drizzle | TypeScript-first SQL schema and queries. |
| AI | Adapter interface first | Prevents the app from depending directly on one AI provider. |
| Memory search | Repository interface first | Lets us start simple and add vector search later. |

## Why Not Start With Everything?

LifeOS can eventually include agents, embeddings, background jobs, vector databases, calendars, files, and permissions. Adding all of that immediately makes the project hard to learn and hard to debug.

The safer path is:

1. Define the domain model.
2. Add simple use cases.
3. Add local persistence.
4. Add the API.
5. Add the web app.
6. Add AI adapters.
7. Add semantic memory.
8. Add privacy and permission enforcement across every context.

## First Milestone

Build a tiny vertical slice:

1. Capture a context snapshot.
2. Store it as memory.
3. Ask the system what routine or agent action is relevant.
4. Show the result in the web app.
