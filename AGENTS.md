# AGENTS.md

## Project Overview

This repository contains FRnD wireframes built with React, TypeScript, Vite, and Tailwind CSS.

The main purpose of the repo is to explore and review product wireframes quickly, while keeping each wireframe connected to its source PRD.

## Setup Commands

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Start dev server on network: `npm run dev -- --host 0.0.0.0`
- Build production bundle: `npm run build`
- Run lint: `npm run lint`
- Preview production build: `npm run preview`

## Project Structure

- `src/pages/` contains wireframe pages such as `home` and `studio`
- `src/pages/dashboard/DashboardPage.tsx` is the main index of wireframes
- `src/data/wireframeRegistry.ts` is the source of truth for wireframe metadata
- `src/components/prd/` contains the PRD rail UI and markdown preview components
- `src/lib/prdCatalog.ts` loads and parses markdown PRDs from the repo
- `docs/prds/` contains markdown PRDs linked to wireframes

## Wireframe Workflow

- Every tracked wireframe should have an entry in `src/data/wireframeRegistry.ts`
- Every tracked wireframe should include:
  - `owner`
  - `route`
  - `module`
  - `status`
  - `prdPath`
- One PRD may be linked to multiple wireframes
- PRDs should live in `docs/prds/`

## PRD Format

For best parser compatibility, PRD markdown files should use this structure:

```md
# PRD Title

## Summary
Short summary paragraph.

## Requirements
- Requirement one
- Requirement two
```

The current parser extracts:

- title from the first `#`
- summary from `## Summary`
- checklist items from bullet points under `## Requirements`

If a PRD uses a more complex source document, create a parser-friendly repo-backed version in `docs/prds/` rather than pointing the UI directly to an incompatible source file.

## UI and Styling Guidelines

- Assume dark mode first
- Avoid pure black text on dark surfaces
- Avoid harsh white outlines on dark UI; prefer subtle dark borders such as `#2a2a2a`, `#2d2d2d`, or `#343434`
- Use explicit text colors for overlay controls and utility UI when contrast matters
- Preserve the existing visual language already established in the repo before introducing new patterns

## PRD Rail Guidance

- Keep the PRD rail lightweight and non-blocking
- The rail should support collapse/minimize behavior so it does not cover the wireframe unnecessarily
- Checklist items are coverage aids, not engineering task state
- Missing PRDs should show warning states without breaking the page

## Agentation

Agentation is enabled for development only.

- MCP health check: `npx agentation-mcp doctor`
- MCP server: `npx agentation-mcp server`

Do not expose Agentation UI in production builds.

## Change Guidance

- Prefer updating the registry and shared PRD components before hardcoding metadata into page files
- Reuse shared UI for PRD-linked behavior instead of duplicating logic per page
- Keep parser behavior fail-soft; missing sections should not crash the page
- After editing UI, run `npm run build`

## Git Notes

- The worktree may contain uncommitted changes
- Do not revert unrelated user changes
- Keep changes scoped to the requested task
