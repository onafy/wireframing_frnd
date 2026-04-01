# PRD-Linked Wireframes Design

## Goal

Make every wireframe page in the repo explicitly traceable to a PRD markdown file so designers can create and modify wireframes with the PRD visible as the source of truth.

## Problem

The current wireframing app shows standalone wireframe pages, but it does not preserve the context that should drive those wireframes. This makes it easy for a wireframe to drift away from product intent, especially when multiple people work on the same PRD across different wireframe pages.

## Desired Outcome

- One PRD markdown file can be linked to multiple wireframe pages.
- A wireframe page shows parsed requirement coverage from the linked PRD.
- A wireframe page includes a collapsible side panel for back-and-forth checking against the PRD.
- PRDs are stored in the repo so they are versioned with wireframe changes.
- Missing PRD linkage is visible as a warning state rather than hidden.

## Scope

### In scope

- Store PRDs as markdown files inside the repo.
- Add a wireframe registry that links routes to PRD files.
- Parse PRD title, summary, and requirements from markdown.
- Add a collapsible right-side PRD panel to wireframe pages.
- Show requirement checklist coverage on wireframe pages.
- Show PRD linkage metadata on the dashboard.

### Out of scope

- Rich markdown editing inside the app.
- Automatic semantic extraction from arbitrary PRD prose.
- Persistent checkbox state storage.
- Syncing with Notion, Google Docs, or external PRD systems.

## Recommended Approach

Use a central registry plus a lightweight markdown parser.

This keeps the relationship between PRDs and wireframes explicit and easy to audit. It also supports the required one-to-many model cleanly, because multiple wireframe entries can point to the same PRD path without duplicating PRD content.

## Alternatives Considered

### Per-page PRD metadata inside each page component

This is simpler at first, but the links become scattered across files and are harder to maintain when one PRD is shared by multiple wireframes.

### Convention-only auto-discovery

This reduces config, but the relation between a wireframe and a PRD becomes too implicit and fragile. A naming mismatch would silently break the workflow.

## Information Architecture

### PRD files

Store PRDs in a repo folder such as:

```text
docs/prds/
```

Each PRD is a markdown file that can be reused across multiple wireframes.

Example:

```text
docs/prds/home-experience.md
docs/prds/studio-campaign-setup.md
```

### Wireframe registry

Create a central data file, for example:

```text
src/data/wireframeRegistry.ts
```

Each registry item should define:

- `id`
- `title`
- `route`
- `module`
- `description`
- `status`
- `prdPath`
- optional `prdTitleOverride`

Multiple entries may share the same `prdPath`.

## PRD Markdown Format

The parser will expect a simple and human-friendly convention.

Example:

```md
# Home Experience PRD

## Summary
Landing page for introducing frndOS and routing users to core modules.

## Requirements
- User can understand the value proposition within 5 seconds
- User can see the primary modules available
- User can navigate to Studio from the main CTA
- User can see relevant proof points or use cases

## Notes
Desktop-first for the initial wireframe pass.
```

### Parsing rules

- Title comes from the first `#` heading.
- Summary comes from the `## Summary` section.
- Requirement checklist items come from bullet points under `## Requirements`.
- Preview mode renders the full markdown file.
- If `## Requirements` is missing, the UI should show an empty parsed state instead of failing.

## UI Design

### Dashboard

Each wireframe card should display PRD linkage metadata:

- `Linked PRD` badge when connected
- PRD title or filename
- requirement count when parseable
- `Missing PRD` warning badge when not linked

This makes traceability visible before a page is opened.

### Wireframe page

Each tracked wireframe page should include a collapsible right-side PRD panel.

Panel behavior:

- Default state is collapsed.
- Expands from the right.
- Keeps the wireframe visible while supporting context lookup.
- Supports quick switching between checklist mode and preview mode.

Panel sections:

- PRD title
- PRD file path
- toggle: `Checklist` / `Preview`
- parsed requirement checklist
- coverage summary like `3/5 requirements represented`
- full markdown preview

### Requirement checklist meaning

The checklist is not a technical task list. It is a coverage aid for checking whether the current wireframe represents the needs described by the PRD.

Examples:

- `Brand selection` is represented in the wireframe
- `Asset upload` is represented in the wireframe
- `Approval status` is represented in the wireframe

For the first version, this checklist is derived from PRD requirements and displayed as a review aid. It does not need persistence yet.

## Guardrails

To support the intended workflow that wireframes should always be based on a PRD:

- Registry entries should strongly prefer a valid `prdPath`.
- Dashboard should visibly flag missing PRD linkage.
- Wireframe pages should display a warning state when PRD parsing fails or no PRD is attached.

This should guide behavior without blocking exploratory work completely.

## Technical Design

### Data loading

Use Vite-supported markdown loading for local repo files. The app should read PRD markdown from the repo at build/dev time rather than from an external source.

### Parser

Implement a lightweight parser that:

- extracts title
- extracts summary
- extracts requirements bullets
- returns a parsed object for the UI

The parser should fail softly. Missing sections should produce empty values, not runtime errors.

### Reusable PRD rail

Create a shared UI component, for example:

```text
src/components/prd/PrdRail.tsx
```

This keeps the PRD-linked behavior consistent across wireframe pages instead of duplicating logic per page.

## Error Handling

When a PRD cannot be loaded or parsed:

- show a warning banner or empty state in the panel
- keep the wireframe page usable
- avoid crashing the page

## Testing Strategy

- Verify dashboard cards show PRD linkage and missing-link warnings correctly.
- Verify one PRD can appear on multiple wireframe pages.
- Verify parser handles missing `Summary` or `Requirements` sections safely.
- Verify panel collapse/expand behavior on desktop widths.
- Verify production build still works with markdown-backed PRDs.

## Rollout Plan

### Phase 1

- Add PRD storage convention
- Add registry
- Add parser
- Add PRD rail to tracked pages
- Add dashboard PRD metadata

### Phase 2

- Add richer coverage states
- Add optional requirement notes or comments
- Add authoring guidance for PRD templates

## Open Decisions Resolved

- PRDs are markdown files stored in the repo.
- One PRD can back multiple wireframe pages.
- Requirement checklist is parsed from markdown.
- Full PRD preview appears in a collapsible side panel.
- The feature should act as a workflow guardrail, not a hard blocker.
