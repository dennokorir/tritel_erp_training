# Projects sync, 19 Nov 2026: tritel-addons `83d4cd6..5d691a8` (tritel_project_delivery 16.0.1.13.x → 16.0.1.17.2)

Read the code with `git -C <tritel-addons> show origin/16.0:<path>` (tritel-addons =
`/home/dennokorir/Projects/waft-16-tritel/custom/src/Tritel-Technologies/tritel-addons`, now on 16.0 = origin/16.0).
Commits: 2840ee6 (roles, menus by role, Accounting › Project Budgets, 16.0.1.14.0), 7e30c06 (purchase commitments
against budgets; "baseline" → "Delivery Budget", 16.0.1.15.0/16.0.1.16.0), b8f6775 (project codes, Cost Accounts to
Sort Out, 16.0.1.17.0), a754a93 (code guards, 16.0.1.17.1), 9da28d6 (Correct Code, 16.0.1.17.2).
New `verified_commit`: `5d691a8` (full: run `git -C <tritel-addons> rev-parse origin/16.0`). Illustration header:
`# docs-sync: verified_commit 5d691a8xxxxx` (12 chars, use rev-parse).

## Product decisions (17–19 Nov 2026)
- **Keep URLs.** Retitle pages and rewrite text with the new names, but keep every slug (build-a-baseline,
  workflows/baseline, concepts/baselines, remind-overdue-baselines, fix-a-returned-baseline, calculations/baseline-due,
  …). Add the old names ("baseline", "delivery baseline") to `keywords` so search still finds them.
- **Menu paths include section headings**: `Project › Delivery › Projects › My Delivery Projects`,
  `Project › Delivery › To approve › Waiting for Me`, `Project › Delivery › Setup › Delivery Settings`,
  `Accounting › Project Budgets › Tracking › Budget vs Actual`. (AUTHORING.md is updated to say so.)
- **Behaviour that looks unintended** is described as the code does it, in a calm `:::note[Good to know]`, never as a
  bug. The lead lists these for the developers.
- **Do not document the 16.0.1.14.0 role set-up**: `models/delivery_access.py` `ROLE_PLAN` holds real logins. Say only
  that Delivery Finance and Head of Delivery are given by hand.
- Dummy data only: Employee A/B, projects like "P26-049 · Data Centre Upgrade", vendors "Vendor A".
- Purchase approvals (purchase_approval_request) and the general Approvals dashboard are **out of scope**: a separate
  Approvals module will cover them.

## What changed, by commit

### 2840ee6, 16.0.1.14.0
- **Delivery Project Manager role is automatic**: anyone who is Project Manager on an active delivery project gets it,
  and loses it when they no longer manage one. Checked when a project's manager, delivery flag or archive changes, and
  daily by cron *"Project Delivery: Project Manager role follows the projects"* (`data/delivery_access_data.xml`).
  Heads of Delivery are never touched (`models/delivery_access.py:45`). Delivery Finance and Head of Delivery are given
  by hand. Note: opening a delivery project still requires the PM role (`open_project_wizard.py:63` *"Only delivery
  project managers can open delivery projects."*), so someone who manages no delivery project yet can't open one; a
  Head opens it for them (Good to know).
- **Project › Delivery** has three sections (`views/menus.xml`; `tests/test_delivery_menus.py:88-104` gives each role's
  tree):
  - **To approve** (Delivery Finance, Heads): **Waiting for Me** (was "Waiting for My Approval").
  - **Projects**: **My Delivery Projects** (PMs; opens on the "own projects" filter, clear it to see all), **Delivery
    Projects** (Finance and Heads only now), **Projects Not in Delivery** (Head; was "Projects to Link"), **Delivery
    Budgets** (was "All Baselines"), **Budget Commitments** (7e30c06), **My Submissions** (PMs: your budgets still
    waiting, filter "My submissions, waiting"), **Handovers**, **Client Delays**.
  - **Setup** (was Project › Configuration › Delivery): Delivery Settings, Cost Types (Head), Budget Categories (Finance
    now too), Starter Items, Standard Milestones (Head), **Cost Accounts to Sort Out** (b8f6775).
- **Accounting › Project Budgets** (`views/accounting_menus.xml`), Delivery Finance sees all; accounting managers see
  only Tracking › Cost Accounts to Sort Out (tests 145-159):
  - **To approve › Budgets to Approve** (opens on "Waiting for me"; empty: *"No budget is waiting for your approval."*),
    **To approve › Costs After Close** (closed delivery projects, new filter "Costs after close to review"; empty:
    *"No closed project has costs after close waiting for review."*)
  - **Tracking › Budget vs Actual** (delivery projects, opens on new filters **Over plan** and **Fully committed**;
    also **On track**, **No approved budget**), **Tracking › Delivery Budgets**, **Tracking › Budget Commitments**,
    **Tracking › Cost Accounts to Sort Out**
  - **Accounting › Configuration › Project Budgets**: Delivery Settings, Budget Categories, Starter Items.

### 7e30c06, 16.0.1.15.0 / 16.0.1.16.0
- **Accounting budget lines** (budget form and budget-line list) get **Committed** (confirmed purchase orders not yet
  billed, before tax), **Draft** (requests for quotation; never reduce Available), **Available** = |Planned| − |Actual|
  − Committed (red below 0), **Used (%)** = (Actual + Committed) / Planned. Cart and file icons open the order lines
  behind Committed and Draft (`views/purchase_budget_views.xml:4-37`).
- **Matching** (`models/purchase_budget.py:4-9`): an order line counts against a budget line of a confirmed or validated
  budget when its cost account includes the budget line's cost account (counted at that share), its expense account
  (product, then category, through the fiscal position) is in the line's budgetary position, and the order date is in
  the line's dates.
- **Purchase order budget status**: **Budget status** badge under the title and a column in PO lists; a **Budget** badge
  per line; **Budget impact** tab (Budget line, Planned, Actual, Committed (other orders), This order, Left after).
  Values, least to most serious: **Within budget**, **No cost account**, **No budget line**, **Budget planned at 0**,
  **Over budget**; the order shows its worst line. "Over" = Left after < −0.5. An RFQ is assessed as if confirmed.
  Search: **Over budget**, **Budget flags**, **No cost account**, group by **Budget status**. Nightly cron *"Purchase:
  refresh budget status of open orders"*.
  Good to know: budgets are phased monthly (`phasing.py:5-7`: one line per budgetary position per month, empty months
  merged into one zero line), so an order dated in a month with no planned spend shows **Budget planned at 0**, and an
  order bigger than its month's phasing shows **Over budget** even when the project total has room.
  Good to know: the order also keeps **Budget Available** (was "Left in delivery plan", `buttons_views.xml:356-366`),
  which compares with the *delivery plan by budget category* (*"Red when this order takes a budget category over its
  plan"*). The two can disagree; neither blocks confirmation (check `purchase_budget.py` / buttons and say what the code
  does).
- **Assign Cost Accounts** wizard: header button on the PO (purchase users; hidden when locked or cancelled), and an
  Action-menu entry on the list. **Apply to**: All lines / Lines without a cost account (default) / Selected lines.
  **Mode**: 100% to one account / Split by %. Suggests the account when the tender has exactly one delivery project;
  "Budget impact if applied" preview. Chatter: *"Cost account set on %s line(s): %s."* / *"Budget status now: %s."*
  Errors (`wizards/assign_cost_accounts.py:78-87`): *"No lines to change: choose another "Apply to", or tick some
  lines."*, *"Choose the cost account."*, *"The split adds up to %s%; it must be 100%."*, *"%s is locked or cancelled;
  its lines can't change."*
- **Budget Commitments** report (pivot and list), one row per budget line × order line, rebuilt each time it opens:
  Budget, Project code, Cost account, Budgetary position, Order, Vendor, Order date, state (Confirmed / Request for
  quotation), Ordered, Billed, Committed, Draft. Menus: Purchase › Reporting (purchase managers), Accounting › Project
  Budgets › Tracking (Finance), Project › Delivery › Projects (every delivery role; company-wide).
- **Renames (16.0.1.16.0)** — technical names unchanged. Old → new (verbatim):

| Old | New |
|---|---|
| Waiting for My Approval | Waiting for Me |
| All Baselines (menu) / Delivery Baselines (action) | Delivery Budgets |
| Projects to Link | Projects Not in Delivery |
| Project › Configuration › Delivery | Project › Delivery › Setup |
| Project › Delivery › Delivery Projects (for PMs) | Project › Delivery › Projects › My Delivery Projects |
| Confirm for Approval | Submit for Approval |
| MD Approve | Approve as MD |
| Return to Draft | Return for Changes |
| Submit for Confirmation (handover) | Submit for Approval |
| Delivery baseline (project button, form title) | Delivery Budget |
| Odoo Budget (button on the budget form) | Accounting Budget |
| Odoo budget lines | Accounting budget lines |
| Odoo budget mapping | Accounting budget mapping |
| Odoo Budgets (help) | Accounting Budgets |
| Baseline versions | Budget Versions |
| Left in delivery plan (PO button) | Budget Available |
| Draft Baseline / Open Baseline in Progress | Draft Budget / Open Budget in Progress |
| Approved baseline (group, field) | Approved budget |
| Needs baseline / Baseline waiting for approval (filters) | Needs a budget / Budget waiting for approval |
| States No baseline / Baseline in draft | No budget / Budget in draft |
| Field "Baseline" (project's baseline state) | Budget status |
| Baseline version / Baseline due / Original baseline / Baseline version at close | Budget version / Budget due / Original budget / Budget version at close |
| Baseline due after award (days) | Budget due after award (days) |
| My Actions: Baselines to draft / Baselines sent back to you / Baselines to approve: dates / Baselines to approve: budget / Baselines overdue on your team; Start baseline; No baseline yet | Budgets to draft / Budgets sent back to you / Budgets to approve: dates / Budgets to approve: budget / Budgets overdue on your team; Start budget; No budget yet |
| To-dos: Delivery baseline returned / overdue; Approve delivery baseline: dates / budget / revision (MD) | Delivery Budget returned / overdue; Approve delivery budget: dates / budget / revision (MD) |
| Cron "…without an approved baseline" | "…without an approved budget" |

  Verify each against the code before writing (grep the views/models at origin/16.0). In prose use "Delivery Budget"
  (the thing), "budget v2" / "revision". "Budget status" now names three things: the project's approval state
  (No budget / Budget in draft / Waiting for approval / Approved / Revision pending, `project.py:32`), the tracking
  status (On track / Fully committed / Over plan, `tracking.py:39`) and the purchase order's status
  (`purchase_budget.py:111`). Use the on-screen label and make clear from context which one; the glossary gets one
  entry explaining the three.

### b8f6775 / a754a93 / 9da28d6 — project codes
- **Every project** (not only delivery) gets a code: `P` + two-digit year opened + `-` + running number that never
  restarts, at least 3 digits (`P26-049`). Unique per company, never reused; given on create; a copied project gets a new
  one. Shown as "P26-049 · Name" everywhere; search by code or name (**Project code** search field); in the list,
  delivery list, form header. Upgrade numbered existing projects (archived too) by creation date and creation year.
- **The cost account carries the project's code**, so purchase lines, bills, journal items and budgets find it by code;
  renaming a project renames its account. Linking a clashing account is refused: *"%(account)s is already the cost
  account of %(project)s."* / *"%(account)s carries the code of %(project)s."* + *"… Choose another cost account for
  %s."* The code on a project's cost account is read-only (*"For a project's cost account this is the project code. It
  changes through the project."*); changing it directly: *"%(account)s is the cost account of %(project)s, so its code
  comes from the project. A settings administrator can correct the project code instead."*
- **Correct Code** (header button, settings administrators `base.group_system`): Project, Current code, New code
  ("e.g. P26-049"), Reason, Cost account; warning *"The code changes everywhere it shows, including the cost account.
  Documents and spreadsheets that quote the old code keep it."* Chatter *"Project code corrected from old to new:
  reason"*. Refusals (`wizards/correct_project_code.py:27-50`, `project_code.py:61-66`): *"Only a settings administrator
  can correct a project code."*, *"%s isn't a project code. Use the pattern P26-049: P, two digits, a dash, three or more
  digits."*, *"%s is already this project's code."*, *"Give the reason for the correction."*, *"%(code)s belongs to
  %(project)s."*, *"A project code can't be cleared."*, *"Project codes change only through Correct Code on the project,
  by a settings administrator."* Numbering skips a number a corrected code already uses.
- **Cost Accounts to Sort Out** (Accounting › Project Budgets › Tracking; Project › Delivery › Setup): cost accounts with
  no project and not marked as a department account; Cost lines, Total, Last used; filters **Has costs** / **No costs**.
  Row actions: **Link to Project** (wizard listing projects without a cost account; *"The cost account takes the
  project's code, and its costs count towards that project."*), **Department Account** (*"Mark this as a department
  cost account? It leaves this list and gets no project code."*), **Archive** (*"This account holds costs. Archiving
  hides it from new orders and bills; its costs stay in the books."*). Errors: *"Only Delivery Finance, the Head of
  Delivery or an accounting manager can sort out cost accounts."*, *"%s is already linked to a project."*, *"Choose the
  project."*, *"%s already has a cost account."*
- Codes also show on the tender's **Delivery projects** button (the codes instead of a count), Delivery Budget names
  ("P26-049 · Name · budget v2"), handovers ("Handover of P26-049 · Name"), My Actions items, Budget Commitments.

## Who writes what (agents work in this worktree only; don't edit files another agent owns)
| Agent | Owns |
|---|---|
| **PA** — text, concepts and overview | `src/content/docs/projects/{index,faq,who-can-do-what}.mdx`, `projects/concepts/*`, `projects/workflows/*`, `projects/calculations/*` (existing), `projects/reports/*` (existing), `src/data/{glossary,fields,states}/projects.yaml` |
| **PB** — text, how-tos and outside Projects | `projects/how-to/**` (existing pages), `end-to-end/*`, `getting-started/*`, `roles/delivery.mdx`, `roles/finance-and-accounts.mdx`, `tenders/**` mentions |
| **PC** — illustrations | every existing `src/illustrations/projects/*.yaml` (and `general/form-parts.yaml` if it shows baseline labels) |
| **PD** — new pages | the 8 new pages below and their new illustrations |
| Lead | sidebar, other roles pages, What's new, manifest, AUTHORING.md, leave stamps, build, coverage |

### New pages (PD)
| Slug | Title | Type | Roles |
|---|---|---|---|
| projects/menus | Project Delivery menus | reference (matrix illustration `projects/matrix-menus`, like `leave/menus` + `leave/matrix-menus`) | everyone in delivery, delivery-finance, head-delivery |
| projects/concepts/project-codes | Project codes | concept | everyone |
| projects/how-to/approvers/correct-a-project-code | Correct a project code | how-to | system-admin |
| projects/how-to/approvers/sort-out-cost-accounts | Sort out cost accounts with no project | how-to | delivery-finance, head-delivery, finance |
| projects/how-to/approvers/check-an-order-against-the-budget | Check a purchase order against the budget | how-to | delivery-finance, finance, delivery-pm |
| projects/how-to/approvers/assign-cost-accounts | Set the cost account on order lines | how-to | finance, delivery-finance (purchase users) |
| projects/calculations/purchase-commitments | How orders count against an accounting budget | calculation (worked example, calc illustration) | delivery-finance, finance |
| projects/reports/budget-commitments | Budget Commitments | report | delivery-finance, delivery-pm |
Use the role ids that exist in `src/data/site.ts` (check before writing). Other pages may link to these slugs.
