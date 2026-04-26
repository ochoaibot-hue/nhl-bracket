# nhl-bracket — Project Context

> Ocho reads this at the start of every session involving this project.
> Update when significant decisions, blockers, or state changes occur.

## What this is
A Node.js web app showing a live Stanley Cup Playoffs bracket using NHL's public API (api-web.nhle.com/v1). Displays bracket, series cards, rankings, game detail, and "path to Cup" insights.

## Current phase
**Phase 1 — Discovery** (in progress)
- Cinco: researching NHL API endpoints and sample payloads
- Siete: defining data schemas and normalization rules
- Diez: waiting for Phase 1 outputs

## Where things live
```
projects/nhl-bracket/
  PROGRESS.md       ← status table (check this first)
  CONTEXT.md        ← this file
  kanban.json       ← task assignments
  research/         ← Cinco's API findings
  design/           ← schemas, architecture, ranking formula
  src/              ← Diez's code (scaffolded here)
  docs/             ← QA checklist, API quirks
```

## Key constraints
- NHL API base: https://api-web.nhle.com/v1
- Season format TBD: 2026 or 20252026 (Cinco confirming)
- Stack: Node.js + TypeScript (framework TBD after Phase 1)
- Must handle missing/partial API data gracefully (sports APIs are unreliable)

## Agent roles
- **Ocho**: orchestrates, makes architecture decisions, writes README, final acceptance test
- **Cinco**: all API research + re-checks during build
- **Siete**: schemas, normalization rules, ranking formula, QA checklist
- **Diez**: all implementation code (client, normalization, routes, UI, caching)
