# nhl-bracket — Node.js Web App for Stanley Cup Playoffs

## Overview
A live Stanley Cup Playoffs bracket application built with Node.js, TypeScript, and React/Vite. Displays bracket, series cards, rankings, game detail, and path to Cup insights using NHL's public API (api-web.nhle.com/v1).

## Dependencies
- `npm install` to install project dependencies.

## Running the app
- `npm run dev` starts a development server.
- `npm run build` creates production assets.
- `npm run test` runs unit tests (if any are written).

## Project Structure
```
projects/nhl-bracket/
  src/              - Application code
    client/         - React frontend
      components/   - Reusable UI components
        Badge.js    - Team badges
        GameModal.js- Game detail modal
        Rankings.js - Standings display
        QuickQA.js  - Quick QA checklist
        QAChecklist.js - Detailed QA checklist
    routes/         - Server-side routing logic
      index.ts      - Main route handler
    services/       - API client & data normalization
      nhlClient.ts  - NHL API interaction layer
      normalize.ts  - Data transformation logic
      cache.ts      - In-memory caching strategy
    pages/          - Top-level React components
      Brackets/     - Bracket display page
        index.js    - Route handler and content
      QA/           - Quality assurance section
        index.js    - Root component for QA page
  docs/            - Documentation & test scripts
    qa-checklist.md - Detailed QA checklist
  design/          - Design documents
    schemas.md     - Data model definitions
    architecture.md- System design and stack decisions
    ranking-formula.md - Path to Cup calculation logic
  research/        - NHL API findings
    api-findings.md- Endpoint reference + sample payloads
  PROGRESS.md      - Task progress tracking
  kanban.json      - Current task assignments
  README.md        - Project overview & instructions
```