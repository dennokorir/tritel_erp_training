# Tritel Systems Training Portal

Illustrated, searchable end-user guides for the systems Tritel runs on in Odoo 16:

| Section | Odoo module(s) |
|---|---|
| Accountability | `tritel_accountability_framework` |
| Projects | `tritel_project_delivery` |
| Tenders and Channel | `tritel_tender_tracker`, `crm_tender` |
| Board | `e_board` |

Built with [Astro](https://astro.build) + [Starlight](https://starlight.astro.build) (static output, Pagefind search),
deployed on Netlify. The Odoo modules live alongside in this repository; the portal is only documentation and is
never installed in Odoo.

## Preview locally

```sh
cd training-portal
npm ci
npm run dev          # http://localhost:4321, live reload (search works only in a build)
npm run build        # full build into dist/, with the link check
npm run preview      # serve dist/ (search works here)
```

Node 22 or newer.

## How the site is put together

```
training-portal/
  AUTHORING.md                 how to write a page — read this first
  astro.config.mjs             site config and the sidebar
  src/content/docs/            the pages (.mdx / .md), one folder per section
  src/illustrations/           picture sources (YAML) — turned into SVG on every build
  src/data/
    roles.yaml                 the roles used in frontmatter, and their learning path
    glossary/<area>.yaml       glossary terms (auto-linked on every page)
    states/<area>.yaml         workflow statuses for /reference/states/
    fields/<module>.yaml       field reference for /reference/fields/<module>/
  src/components/              page wrapper (search filters, how-to header) and <Illustration>
  src/plugins/                 glossary auto-linking
  scripts/
    build-index.mjs            generates pictures, glossary, states, fields, tags and the A–Z index
    render-illustrations.mjs   the picture renderer (also a check-only CLI)
    check-links.mjs            fails the build on a broken link, anchor, or a how-to without a picture
    check-mermaid.mjs          local QA: finds Mermaid diagrams that fail to draw (needs Chrome)
../training/_discovery/        what the code does, module by module (not published)
../netlify.toml                Netlify build settings and security headers
```

Generated pages (`/reference/index/`, `/reference/glossary/`, `/reference/states/`, `/reference/tags/…`,
`/reference/fields/…`) and the SVGs are gitignored: edit their sources in `src/data/` and `src/illustrations/`.

## Add a page

1. Find where it belongs in the sidebar (`astro.config.mjs`); most groups list a folder automatically.
2. Copy the closest existing page. For a task page, copy
   `src/content/docs/accountability/how-to/everyone/respond-to-my-review.mdx`.
3. Fill in the frontmatter (see AUTHORING.md): `module`, `roles`, `tags` and `keywords` drive search and its
   Module/Role filters; `sources` lists the code the page describes.
4. Draw its picture: add `src/illustrations/<module>/<name>.yaml`, check it with
   `node scripts/render-illustrations.mjs src/illustrations/<module>/<name>.yaml`, and embed it with
   `<Illustration name="<module>/<name>" />`.
5. Add any new terms to `src/data/glossary/`, and new statuses to `src/data/states/`.
6. `npm run build` must pass.

## Regenerate pictures, glossary and the index

`npm run generate` (also runs at the start of every `dev` and `build`).

## When the Odoo code changes

Each page lists the files it was written from in its `sources:` frontmatter. To find pages to review after a change:

```sh
git diff --name-only <old>..<new> -- tritel_accountability_framework tritel_project_delivery tritel_tender_tracker crm_tender e_board \
  | xargs -I{} grep -rl "{}" training-portal/src/content/docs
```

Re-run discovery for the module (see `../training/_discovery/`) when a release changes screens or workflows.

## Keeping the portal in step with the code

The portal documents five Odoo modules (Accountability, Project Delivery, the tender tracker, Channel and the Board portal) from the `tritel-erp` repository (pulled into the Waft project by
git-aggregator). Change tracking lives in three places:

- **`docs-manifest.json`**: per module (`accountability`, `projects`, `tenders`, `board`):
  - `addons`, `addons_path`, `repo_root`: where the code is (all four modules share one git repo);
  - `track_ref`: the branch the docs follow (`origin/16.0`), read directly so the checked-out branch doesn't matter;
  - `watch`: supporting addons (`{ "addon": …, "reason": … }`) whose changes should trigger a review of the module's
    pages without being inventoried as its own, e.g. `tritel_pdc` for the Board's cheque signing;
  - `last_synced_commit` / `last_synced_at`: the code the portal was last synced to;
  - `items`: every documented code element (`<addon>:<kind>:<key>`, e.g. `tritel_tender_tracker:selection:tender.initial.kanban_state`)
    with its label, source file, and the `pages` and `illustrations` (YAML files, or `page#mermaid-N`) that show it;
  - `excluded`: elements deliberately not documented, each with a reason.
- **Page frontmatter**: `sources:` (module-relative code files) and `verified_commit:` (the commit the page was checked against).
- **Illustrations**: a `# docs-sync:` header in each YAML picture and a `%% docs-sync:` line in each Mermaid diagram,
  naming the elements they depict.

`node scripts/coverage-report.mjs [--module <key>] [--json] [--suggest]` reads the code at `track_ref` and lists every
user-facing element as COVERED, EXCLUDED, UNCOVERED or TECHNICAL, plus manifest entries that no longer exist (REMOVED).
The `/docs-sync` command (`.claude/commands/docs-sync.md`) uses it to find what changed since `last_synced_commit`,
proposes a plan, and after approval updates pages, pictures and the manifest.

Elements include portal pages (`route` items, e.g. `e_board:route:/my/board/cheques`) as well as models, fields, menus, roles,
windows, reports, scheduled jobs and email templates. Extensions of other modules are elements of the addon that adds them:
`view_ext` (a button, tab or labelled field added to another module's view) and `field` (a field added to another module's
model, counted when it is shown).

Related modules:

```sh
node scripts/coverage-report.mjs --module tenders,board          # several modules, one report; shared pages listed once
node scripts/coverage-report.mjs --suggest-watch                 # propose watch lists from depends + page sources
node scripts/coverage-report.mjs --module board --changes        # what changed since last sync, owned + watched, → pages
```

The report warns when a page cites an addon that no module tracks or watches. `/docs-sync tenders,board` syncs several
modules in one pass. Odoo core and Enterprise addons are not watched: check them by hand when Odoo itself is updated.

## Deploy

Netlify builds from `netlify.toml` at the repository root: base `training-portal`, command `npm run build`,
publish `dist`, Node 22. Pushes that change only Odoo modules skip the build. Every pull request gets a deploy
preview. The site must never contain real names, customers, tender values or production data — use the dummy
names listed in AUTHORING.md.
