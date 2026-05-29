# Engineering Rules

LifeOS is built as a local-first, privacy-first system. These rules keep the codebase simple enough to understand while leaving room for later AI, agents, and encrypted memory work.

## Clean Architecture

Dependency direction remains:

```text
apps -> adapters -> application -> core
```

- `packages/core` contains domain types only.
- `packages/application` contains use cases and repository ports.
- `packages/adapters` contains SQLite and other infrastructure implementations.
- `apps/api` and `apps/web` are entry points that wire dependencies together.

Business logic should not depend on HTTP, React, SQLite, environment variables, or framework APIs.

## KISS, YAGNI, DRY

LifeOS prefers small deterministic use cases over broad abstractions.

- Add abstractions only when repeated behavior is already visible.
- Keep validation and request parsing helpers simple and explicit.
- Avoid adding AI, embeddings, agents, or cloud services before deterministic foundations are useful.

## Secure Coding Basics

Current API rules:

- JSON request bodies are size-limited.
- Invalid JSON returns a consistent error shape.
- Request body parsing happens in `apps/api`, not in domain logic.
- Environment variables configure ports, allowed origins, and database path.
- SQLite access stays in adapters.

The API still does not include authentication because LifeOS is currently local-first development software.

## Accessibility Basics

The web UI follows lightweight WCAG-oriented basics:

- Keyboard focus states are visible.
- Status messages use `role="status"` and `aria-live="polite"`.
- Query controls expose pressed state with `aria-pressed`.
- Form inputs use visible labels.

LifeOS UI should stay calm, minimal, and readable.

## Twelve-Factor Basics

Configuration is separated from code where it matters today:

- API port: `PORT`, default `4000`.
- SQLite path: `LIFEOS_SQLITE_PATH`, default `data/local/lifeos.sqlite`.
- CORS origins: `LIFEOS_ALLOWED_ORIGINS`, default local Vite origins.
- Web API base URL: `VITE_LIFEOS_API_URL`, default `http://localhost:4000`.

Safe local defaults allow a beginner developer to run the app without extra setup.

## Testing Rules

Use case tests should prefer in-memory repositories. This keeps tests fast and avoids coupling application behavior to SQLite or HTTP.

Current minimal coverage includes:

- `CaptureMemoryUseCase`
- `CaptureContextUseCase`
- `GenerateNextBestStepUseCase`
- `GenerateMemoryHygieneReportUseCase`

Future tests should be added near the use case they protect.
