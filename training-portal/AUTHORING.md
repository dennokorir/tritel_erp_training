# Authoring guide

How to write pages for the Tritel Systems Training Portal. Read this before adding or changing a page.
The worked example to copy is
`src/content/docs/accountability/how-to/everyone/respond-to-my-review.mdx` and its picture
`src/illustrations/accountability/review-pack-form.yaml`.

## Ground rules

1. **The code is the truth.** Every label, button, menu path, status, rule and message must come from the
   Odoo module source (views, models, wizards, controllers, security). The discovery notes in
   `../training/_discovery/<module>.md` are a map with file:line references. Use them to find things, then
   check the code itself before you write. If the code is ambiguous, don't guess: leave it out and list it as a
   question in your hand-back.
2. **Write for non-technical staff.** Plain English, short sentences, active voice, "you". Never use model names
   (`accountability.target`), field names (`ack_deadline`), method names, XML or Python, or words like
   "record rule", "group" or "wizard". Say "the window that opens", "line managers", "HR".
3. **Exact labels.** Buttons, menus, fields, tabs and statuses appear **in bold**, spelled exactly as on screen
   (the `string=` in the view; a view's `string=` wins over the field's). Messages the system shows go in
   *italics*. Menu paths are written **App › Menu › Item**. When a menu groups its items under section headings (for example **My Team** in Accountability, **Project › Delivery**), include the heading: **My Team › Set targets › Team Targets**.
4. **Dummy data only.** Never copy real names, customers, tenders, amounts or dates from data files or a
   database. Use Employee A / B / C, Customer A / B, TND-2026-001, PRJ-2026-001, FY 2026, round numbers.
5. **Document today's behaviour.** Where the system is confusing or inconsistent (the discovery notes list gaps
   in section 9), describe what it actually does and add a short note:
   `:::note[Good to know]` … `:::`. Keep the note factual and calm: what happens, and what to do about it.
   Never write "bug", "broken" or blame anyone.
6. **One illustration per how-to page, at least.** The build fails without one.

## Page types and their shape

Every page is `.mdx` (or `.md` if it has no components). Frontmatter fields:

| Field | Required | Notes |
|---|---|---|
| `title` | yes | Task pages start with a verb: "Respond to my review". Concepts are nouns: "Review packs". |
| `description` | yes | One sentence; it is the search-result snippet. |
| `module` | yes | `accountability`, `projects`, `tenders`, `board`, `general`, `end-to-end`, `reference` |
| `pageType` | yes | `overview`, `concept`, `how-to`, `workflow`, `calculation`, `report`, `faq`, `journey`, `role-path` |
| `roles` | yes | Role ids from `src/data/roles.yaml`: who does this (how-to) or who it's for (other pages). Drives the Role search filter. |
| `tags` | yes | 1–4 lowercase topics, e.g. `[reviews, my actions]`. Reuse existing tags before inventing one. |
| `keywords` | yes | How staff actually talk, including synonyms not on the page: "appraisal", "KPI", "LPO", "bid", "sign off". 5–12 entries. Never shown; indexed for search. |
| `where` | how-to | Menu path as a list: `[Accountability, My Team, Team Targets]` |
| `before` | how-to | Prerequisites, one sentence each (HTML allowed: `<strong>`). |
| `related` | optional | Page slugs, e.g. `accountability/workflows/review-pack`. The build fails if a slug doesn't exist, so only use slugs from the page plan. |
| `sources` | yes | Module-relative files the page was written from. Used to find pages to update when code changes. |
| `sidebar` | optional | `{ order: N }` to order pages inside a sidebar group. |

### How-to page
Header box is automatic (from `roles`, `where`, `before`). Then, in this order:
1. One or two sentences: what this task is and when you'd do it.
2. `<Illustration name="…" caption="…" />` — a wireframe whose callout numbers match the steps.
3. `## Steps` — a numbered list using exact labels. Sub-steps for dialogs.
4. `## What happens next` — status changes, emails, to-dos, records created, what other people see.
5. `## Common mistakes` — a table: *Message* · Why it happens · What to do. Take messages from
   `UserError` / `ValidationError` / `AccessError` texts in the code (the discovery notes list them in section 7).
   Replace `{name}`-style placeholders with dummy values. Leave the section out if there are none.
6. Optional `:::note[Good to know]`.

### Concept page
What it is (2–4 short paragraphs), a picture (Mermaid or a wireframe), the key terms with their on-screen
labels, and links to the tasks that use it.

### Workflow page
One Mermaid `stateDiagram-v2` of the statuses, with each arrow labelled `Button label (who)`. Then a table:
Status · What it means · Moves to · Who moves it. For workflows where several roles take turns, add a swimlane
(Mermaid `flowchart LR` with one `subgraph` per role). Also add the statuses to `src/data/states/<area>.yaml`.

### Calculation page
Plain-English rule, then a `type: calc` illustration with a worked example (dummy numbers), then edge cases
(caps, zero targets, missing values, N/A). Cite the code in `sources`.

### Report page
What the screen shows, how to filter it, what each figure means, a wireframe with callouts.

### FAQ
`## Question?` headings with short answers that link to the task page.

## Illustrations

Write a YAML file under `src/illustrations/<module>/<name>.yaml`; the build turns it into a themed SVG. Embed it:

```mdx
import Illustration from '../../../../components/Illustration.astro';   {/* depth depends on the page */}
<Illustration name="accountability/review-pack-form" caption="…" />
```

Check a picture without a full build: `node scripts/render-illustrations.mjs src/illustrations/accountability/x.yaml`

Every file needs `type`, `title` (short name), `desc` (one-sentence description: becomes the alt text), and
`source` (the view or model file it was drawn from).

### `type: screen` (wireframes, built from the view XML)
```yaml
frame:
  grid: true                     # Odoo's app-switcher icon (or a number to put a callout on it)
  app: Accountability            # navy app bar
  menu: [My Performance, {label: My Team, active: true, n: 1}]
  breadcrumb: [Team Targets, Grow qualified pipeline]
blocks:                          # drawn top to bottom
  - buttons: [{label: Activate, primary: true, n: 2}, {label: Withdraw}]
    status: {steps: [Draft, Active, Closed], current: Draft, n: 3}   # optional, same row, right side
  - title: {text: Grow qualified pipeline, sub: "Target · FY 2026", n: 4}
  - smart: [{label: Reviews, value: "3", tone: good, n: 5}]
  - fields: [[{label: Owner, value: Employee A, n: 6}, {label: Period, value: FY 2026}]]  # rows of 1 or 2
  - tabs: {items: [Milestones, Reviews], active: Milestones, n: 7}
  - table: {columns: [Stage, Due], widths: [3, 1], rows: [[Survey, {text: Overdue, badge: true, tone: bad}]], n: 8}
  - tiles: [{label: To do, value: "4", tone: warn, n: 9}]
  - search: {facets: [My Sessions], placeholder: "Search…", filters: [Filters, Group By], n: 10}
  - kanban: [{title: Draft, count: 2, cards: [{title: TND-2026-001, lines: [Customer A], tag: Must-win, tagTone: bad, n: 11}]}]
  - bars: [{label: Employee A, value: 80, max: 100, tone: good, mark: 60}]
  - note: {text: "Banner text exactly as on screen", tone: warn, n: 12}
  - heading: Section title
  - text: Plain paragraph
  - divider: true
  - dialog: {title: Raise a Concern, n: 13, blocks: [ ...any blocks... ]}     # a pop-up window
  - columns: [{panel: true, blocks: [...]}, {panel: true, blocks: [...]}]  # side-by-side panels
```
Tones: `good`, `warn`, `bad`, `accent`, `muted`. Table cells may be strings or `{text, badge, tone, bold}`.
**Quote any cell that contains a comma** (`"Freight, clearing and delivery"`): unquoted, YAML splits it into two
cells. The renderer refuses a row whose cell count doesn't match the columns.
Rows may be `{cells: [...], highlight: true, n: 3}`.
Draw only what the steps need: the buttons, fields and tabs the reader must find. 6–12 rows of content at most.
Callout numbers must match the numbered steps on the page.

### `type: calc` (how it's calculated)
```yaml
heading: Number target, higher is better
inputs: [{label: Target, value: "100"}, {label: Actual, value: "80"}]
steps: [{label: "Score = Actual ÷ Target × 100", value: "80 ÷ 100 × 100"}]
result: {label: Score, value: "80%", tone: good}
bars: [{label: Employee A, value: 80, tone: good}]      # optional
note: The score never goes above 100%.                   # optional
```

### `type: matrix` (who can do what)
```yaml
columns: [Everyone, Line manager, HR, Accountability administrator]
rows:
  - {group: Targets}
  - {action: Create targets for my team, cells: [n, p, y, y]}   # y yes · p partly · n no
legend: {p: Own team only}
```

### Mermaid
Use fenced ```` ```mermaid ```` blocks for state diagrams, swimlanes, system maps and journeys. Keep to
`stateDiagram-v2` and `flowchart TD` (top to bottom: `LR` chains come out 2,000–3,000 px wide). Keep arrow
labels short; put lists such as "who approves what" in a `note right of <state>` instead of on an arrow. Quote labels that contain punctuation: `A["Draft (new)"]`. Use
business names, never model names. One diagram per idea; no more than ~12 nodes.

## Glossary, states and fields

- **Glossary:** add terms to `src/data/glossary/<area>.yaml` (`term`, optional `aliases`, `definition` in one or
  two plain sentences, `module`, optional `see:` list of page slugs). A term may only be defined once across all
  files. The first mention of a term on every page links to it automatically.
- **States:** `src/data/states/<area>.yaml`, one entry per status:
  `{module, workflow, link, state, meaning, next, who}` — `link` is the workflow page URL.
- **Fields:** `src/data/fields/<module>.yaml`:
  `screens: [{name, where, fields: [{label, meaning, where}]}]`, exact labels.

## Checking your work

- `node scripts/render-illustrations.mjs <yaml files>` — pictures render.
- `npm run build` — full build, broken-link check, and the "every how-to has a picture" check. Run it only when
  nobody else is building in the same folder.
- Read the page as a new member of staff would: could they do the task with only this page?
