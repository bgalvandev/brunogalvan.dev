---
name: backend-architecture
description: Add server-rendered pages, forms, APIs, database access, or external service integrations to the website. Use when a concrete feature needs runtime I/O.
---

# Backend Architecture

There is currently no runtime backend or database. Read `docs/architecture.md`
and [astro-development](../astro-development/SKILL.md) before introducing either.

1. Identify whether data is public and fresh enough at build time. Public content
   can use an Astro content collection; confidential/request-specific work needs
   a server runtime. Do not query a database from browser code.
2. Select a supported deployment adapter with an ADR covering environment,
   connection lifecycle, secrets, cost and operational limits. Keep public routes
   prerendered where appropriate. Mark only runtime routes `prerender = false`.
3. In `src/modules/<feature>`, put invariants/value types in `domain`, use cases and
   narrow I/O ports in `application`, and concrete persistence/service adapters in
   `infrastructure`. `interface` validates and maps external inputs/outputs.
4. Wire dependencies in a route or server entry point. Shared `src/server` code
   can own runtime environment validation, but must not depend on features.
5. Validate untrusted input at the boundary. Apply authorization before protected
   operations, constrain payload size and queries, and avoid leaking internal
   exceptions. For forms, implement pending, success and recoverable failure text
   in both locales; evaluate abuse and CSRF protections for the actual endpoint.
6. Keep secrets in server-only environment configuration. Return explicit public
   view data; never serialize credentials or full persistence records by default.
7. Test domain rules, use-case failures with port fakes, and adapters against the
   actual service/test database where relevant. Browser tests cover the real user
   outcome. For schema changes, define migration, backup and rollback strategy.

The import gate checks declared dependencies, not authorization or data safety.
Inspect transitive browser dependencies and emitted assets after runtime changes.
Do not install an ORM, authentication system, Docker, event bus or DI framework
until the concrete requirement justifies it. A website can have server features
without becoming a client-rendered application.
