---
description: Sync the training portal with the current state of the Accountability, Projects and Tenders modules: update changed docs, create docs for uncovered scope, retire docs for removed features.
argument-hint: [module name(s), comma-separated | all] (default: all)
---

# Docs Sync: Training Portal

Scope: $ARGUMENTS (if empty, all modules in `training-portal/docs-manifest.json`). Several modules (e.g. `tenders,board`) are synced together: one combined detection, plan and apply, with pages shared between them handled once.

Read `CLAUDE.md` and `training-portal/README.md` first and follow the existing page template, illustration standards, frontmatter schema and tone exactly. Do not restyle or restructure existing content unless it is wrong.

## Step 0 — Bootstrap check
- If `training-portal/` or `docs-manifest.json` does not exist, stop and tell me to run the full build prompt first.
- If a module in scope has no manifest entry, treat it as a NEW MODULE: run full discovery for it, as in the original build (Phase 1), and stop for approval before writing.

## Step 1 — Detect change (read-only)
For each module in scope:
1. Run `node training-portal/scripts/coverage-report.mjs --module <name(s)> --changes`. It diffs `<last_synced_commit>..<track_ref>` in the module repo (`repo_root`, not this repo) over the module's own addons AND its `watch` addons, lists the commits, and maps each changed file to the pages that cite it. (By hand: `git -C <repo_root> diff --stat <last_synced_commit>..<track_ref> -- <addons + watch>` and `git -C <repo_root> log --oneline` over the same range.) Summarise what developers changed; a change in a watched addon only matters where it alters what the module's pages describe.
2. The same report gives the current-code inventory against the manifest (add `--suggest` for page hints on gaps). If it warns about addons cited in page sources but neither tracked nor watched, run `--suggest-watch` and propose `watch` entries in the plan.
3. Read the changed files. Classify every finding as:
   - **CHANGED**: an existing documented item whose behaviour, labels, fields, states, transitions, permissions or validation messages changed
   - **NEW**: a user-facing item that exists in code but has no page (new model, state, menu, wizard, report, group, cron/email, computed KPI)
   - **REMOVED**: documented items that no longer exist in code
   - **UNCOVERED (pre-existing)**: older items that were never documented and aren't in `excluded`
   - **NO-OP**: technical-only changes (refactors, tests, non-user-facing). List them, but don't act on them
4. For each CHANGED/REMOVED item, use the manifest to list every page and illustration that references it.

## Step 2 — Sync plan (stop and wait for approval)
Present a table: `Item | Classification | Pages/illustrations affected | Proposed action`. Actions are:
- update text · regenerate illustration · new page · new section in an existing page · retire page (add a redirect) · add to `excluded` (with a reason)

Flag anything where the code intent is ambiguous as a question. Don't guess. If the plan has no actions, say so and stop.

## Step 3 — Apply (after approval)
- **Update** affected pages in place. Keep the URLs stable.
- **Regenerate** every illustration whose depicted elements changed (state diagrams, swimlanes, mockups, role matrix, KPI worked examples). Re-check that callout numbers still match the step numbers.
- **Create** new pages using the standard how-to/concept template, with at least one illustration each. Add them to the sidebar, the relevant role learning paths, glossary, tags and keywords.
- **Retire** removed features: delete or archive the page, add a Netlify redirect in `netlify.toml` to the closest relevant page, and remove dead links.
- Check that cross-module journeys (`/end-to-end/`) still hold if a change touches a module boundary.
- Update the frontmatter `sources` and `verified_commit` on every touched page.
- Update `docs-manifest.json`: inventory mappings, `version`, `last_synced_commit` = current HEAD, `last_synced_at`.
- Add a `/whats-new/` entry in plain language for end users: what changed, who it affects, and links to the pages.

## Step 4 — Verify
- `npm run build` passes, with zero broken links.
- `coverage-report.mjs` reports zero UNCOVERED user-facing items for the synced modules.
- The A–Z index, glossary, tag pages and Pagefind index regenerate.
- Use dummy data only. Scan the diff for real customer names, tender values or credentials.

## Step 5 — Report
Give me a short summary: counts per classification, pages updated/created/retired, illustrations regenerated, open questions, and a suggested commit message. Commit on a branch named `docs-sync/<date>` so Netlify builds a deploy preview for review. Do not merge.