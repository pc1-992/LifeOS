# LifeOS Architecture

## Main Idea

Clean architecture separates your project into layers. Each layer has a job.

## Layers

### 1. Core

`packages/core`

This is the heart of LifeOS. It contains pure business concepts:

- Context snapshot
- Memory
- Routine
- Agent task
- Privacy scope

Core code should be easy to test because it does not talk to databases, HTTP, files, or AI APIs.

### 2. Application

`packages/application`

This layer defines use cases. A use case is an action the system can perform, such as:

- Capture a new memory
- Suggest a routine
- Plan an agent task
- Check whether data can be used in the current context

Application code depends on interfaces called ports. A port says what the app needs, but not how it is implemented.

### 3. Adapters

`packages/adapters`

Adapters connect LifeOS to the outside world:

- SQLite database
- AI model providers
- Calendar APIs
- File system
- Email
- Notifications

Adapters implement the ports from the application layer.

### 4. Apps

`apps/api` and `apps/web`

Apps are entry points:

- The API receives HTTP requests.
- The web app gives the user a UI.

Apps should mostly wire things together. They should not contain the core business logic.

## Dependency Direction

Allowed:

```text
web/api -> adapters -> application -> core
```

Avoid:

```text
core -> database
core -> API
application -> web
```

## Privacy-by-Context

Privacy should not be an afterthought. Every memory and context item should carry a privacy scope.

Example scopes:

- `private`: only local personal use
- `trusted`: can be used by trusted agents
- `shareable`: can be shown outside the system

The first implementation is simple, but the boundary is already present in the domain model.
