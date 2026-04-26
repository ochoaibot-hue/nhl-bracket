# nhl-bracket — Progress Log

> Ocho maintains this file. Every agent updates their row when status changes.
> Format: update `Status` and `Output` when you start or finish a task.

---

## Status Table

| # | Task | Agent | Status | Output | Notes |
|---|------|-------|--------|--------|-------|
| 1 | Create project plan + task board | Ocho | ✅ done | kanban.json | 11-task breakdown complete |
| 2 | NHL API research: endpoints, payloads, season IDs, fields | Cinco | ✅ done | research/api-findings.md | Real API fetched; season=20252026/2026; all 5 endpoints documented |
| 3 | Data model + schemas: Team, Game, Series, Round, Bracket | Siete | ✅ done | design/schemas.md | Full TS interfaces + ranking formula + QA checklist |
| 4 | Architecture: stack, caching, polling, env/config | Ocho | ✅ done | design/architecture.md | Fastify + React/Vite + in-memory cache; polling + defensive normalization |
| 5 | NHL API client wrapper + retry/backoff | Diez | 🔄 doing | src/server/services/nhlClient.ts | Started (Ocho scaffolding) |
| 6 | Normalization layer: NHL payloads → canonical model | Diez | 🔄 doing | src/server/services/normalize/* | Started (Ocho scaffolding) |
| 7 | Server routes: bracket, series, standings, scores, game | Diez | 🔄 doing | src/server/routes/* | Bracket+rankings routes implemented; series/game routes pending |
| 8 | UI: bracket rendering, series cards, rankings, game modal | Diez | 🔄 doing | src/client/* | Bracket UI implemented; rankings UI pending |
| 9 | Caching: in-memory + TTL + ETag | Diez | 🔄 doing | src/server/services/cache.ts | TTL caching implemented; ETag conditional fetch pending |
| 10 | QA: acceptance criteria + test script | Siete | 🔄 doing | docs/qa-checklist.md | Checklist drafted; final validation after #7+#8 |
| 11 | README + run/deploy instructions | Ocho | ✅ done | README.md | Starter README added |

**Legend:** ✅ done · 🔄 doing · ⏳ todo · ❌ blocked · 🔁 revision

---

## Agent Output Index

| File | Written by | Description |
|------|-----------|-------------|
| `research/api-findings.md` | Cinco | NHL API endpoint reference + sample payloads |
| `design/schemas.md` | Siete | TypeScript interfaces + normalization rules |
| `design/architecture.md` | Ocho | Stack decisions + system design |
| `design/ranking-formula.md` | Siete | Ranking algorithm + weights |
| `docs/qa-checklist.md` | Siete | Acceptance criteria + test cases |
| `src/` | Diez | All implementation code |
| `README.md` | Ocho | Final run + deploy instructions |

---

## Decisions Log

| Date | Decision | Made by | Rationale |
|------|----------|---------|-----------|
| 2026-04-25 | 11-task phased plan adopted | Ocho | Matches project brief phases |
| 2026-04-25 | "Citi" agent → absorbed into Ocho + Siete | Ocho | Agent doesn't exist; UX spec → Siete |

---

## Open Questions

- [x] Season ID: bracket uses `2026`, carousel uses `20252026` — both confirmed working (2026-04-25)
- [x] Logo URLs: `https://assets.nhle.com/logos/nhl/svg/{ABBREV}_light.svg` — stable; some include `?season=` query string, strip when caching
- [ ] Framework choice: Express vs Fastify, plain HTML vs React? (Ocho to decide after #2+#3)

---

## How to update this file

When you **start** a task: change ⏳ to 🔄, fill in Output filename.
When you **finish** a task: change 🔄 to ✅, confirm Output file exists.
When **blocked**: change to ❌ and add a note.
Ocho reviews this file before every delegation decision.
