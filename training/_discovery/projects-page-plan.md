# Projects section (Project Delivery): page plan (slugs are fixed; link only to these)

Module: `tritel_project_delivery` (16.0.1.13.0). Discovery notes: `projects.md`.
All slugs are under `src/content/docs/`. Pages may also link to: `getting-started/*`, any page in
`accountability-page-plan.md` (for example `accountability/concepts/metrics`,
`accountability/calculations/metric-families`), `reference/glossary`, `reference/states`,
`reference/fields/projects`, and `roles/<department>`.

Role ids: delivery-pm (Delivery Project Manager), head-delivery (Head of Delivery),
delivery-finance (Delivery Finance), md (the Managing Director, named in Delivery Settings, not a role),
finance (Finance & Accounts generally, e.g. accountants who see Odoo budgets and bills),
account-manager (sees the tender buttons), everyone.

## Agent P1: overview, concepts, workflows, glossary, states
| Slug | Title | Type |
|---|---|---|
| projects/index | Project Delivery | overview (system map: won tender → delivery project → baseline → Odoo budget → orders and bills → tracking → handover → close → Delivery KPI; who does what; where to start) |
| projects/concepts/delivery-projects | Delivery projects | concept (what makes a project a delivery project; link to the won tender; Projects to Link) |
| projects/concepts/baselines | Delivery baselines and revisions | concept (dates + budget; versions; original vs revision; what approval locks) |
| projects/concepts/cost-items-and-categories | Cost items, cost types and budget categories | concept (Quoted vs Estimate, VAT, currency, starter items, whole orders) |
| projects/concepts/contingency | Contingency | concept |
| projects/concepts/odoo-budget-and-cost-account | The Odoo budget and the cost account | concept (analytic account, budgetary positions, automatic tagging) |
| projects/concepts/budget-tracking | Budget tracking: planned, committed, spent, left | concept |
| projects/concepts/approvals | Who approves what | concept (Head = dates, Finance = budget, MD = big revisions; thresholds) |
| projects/concepts/handover-and-close-out | Handover and close-out | concept |
| projects/concepts/client-delays | Client delays | concept |
| projects/concepts/delivery-kpi | The Delivery KPI: on time and on budget | concept (links to accountability metric pages) |
| projects/workflows/baseline | Baseline workflow | workflow (+ swimlane PM → Head → Finance → MD) |
| projects/workflows/handover | Handover workflow | workflow (+ swimlane PM → Head) |
| projects/workflows/client-delay | Client delay workflow | workflow |
| projects/workflows/close-out | Close-out workflow | workflow (close, reopen, costs after close) |
| projects/workflows/budget-status | Budget status | workflow (No approved budget / On track / Fully committed / Over plan) |
Also: `src/data/glossary/projects.yaml` (30–50 terms) and `src/data/states/projects.yaml`.

## Agent P2: how-to for delivery project managers
| Slug | Title | Roles |
|---|---|---|
| projects/how-to/delivery-pm/open-a-delivery-project | Open a delivery project from a won tender | delivery-pm |
| projects/how-to/delivery-pm/link-an-existing-project | Link an existing project to its tender | delivery-pm, head-delivery |
| projects/how-to/delivery-pm/build-a-baseline | Build a baseline with the cost item builder | delivery-pm |
| projects/how-to/delivery-pm/add-whole-orders | Enter a supplier order or quote in a baseline (orders are no longer imported) | delivery-pm |
| projects/how-to/delivery-pm/phase-the-spend | Plan when the money goes out | delivery-pm |
| projects/how-to/delivery-pm/set-dates-and-milestones | Set the completion date and milestones | delivery-pm |
| projects/how-to/delivery-pm/send-for-approval | Send a baseline for approval | delivery-pm |
| projects/how-to/delivery-pm/fix-a-returned-baseline | Fix a baseline that was sent back | delivery-pm |
| projects/how-to/delivery-pm/request-a-revision | Request a revision | delivery-pm, head-delivery |
| projects/how-to/delivery-pm/track-the-budget | Track the budget | delivery-pm, head-delivery, delivery-finance |
| projects/how-to/delivery-pm/record-a-handover | Record a handover | delivery-pm |
| projects/how-to/delivery-pm/log-a-client-delay | Log a client delay | delivery-pm |
| projects/how-to/delivery-pm/my-actions | Work through Projects My Actions | delivery-pm, head-delivery, delivery-finance, md |

## Agent P3: how-to for approvers, finance and set-up
| Slug | Title | Roles |
|---|---|---|
| projects/how-to/approvers/approve-dates | Approve a baseline's dates | head-delivery |
| projects/how-to/approvers/approve-budget | Approve a baseline's budget | delivery-finance |
| projects/how-to/approvers/approve-a-large-revision | Approve a large revision | md |
| projects/how-to/approvers/confirm-a-handover | Confirm or return a handover | head-delivery |
| projects/how-to/approvers/approve-a-client-delay | Approve or reject a client delay | head-delivery |
| projects/how-to/approvers/tag-orders-to-a-project | Tag orders to their project | head-delivery, delivery-finance |
| projects/how-to/approvers/close-a-project | Close or reopen a project | delivery-finance |
| projects/how-to/approvers/review-costs-after-close | Review costs posted after close | delivery-finance |
| projects/how-to/approvers/remind-overdue-baselines | Chase overdue baselines | head-delivery |
| projects/how-to/approvers/delivery-settings | Change the Delivery settings | head-delivery, delivery-finance |
| projects/how-to/approvers/cost-types-and-categories | Maintain cost types, categories, starter items and standard milestones | head-delivery, delivery-finance |

## Agent P4: calculations, reports, permissions, FAQ, field reference
| Slug | Title |
|---|---|
| projects/calculations/cost-items | How a cost item's amount is worked out (quantity, VAT, currency, contingency, cap) |
| projects/calculations/budget-lines-and-phasing | Budget by category, spend by month and the Odoo budget lines |
| projects/calculations/tracking-figures | Planned, expected to date, committed, spent, left, forecast and status |
| projects/calculations/margin | Expected revenue and margin left |
| projects/calculations/revisions-and-approvals | What changed, and which approvals a revision needs |
| projects/calculations/delay-days | Client delay days |
| projects/calculations/close-and-kpi | Close figures, the result and the Delivery KPI |
| projects/calculations/baseline-due | Baseline due date and the project's baseline status |
| projects/reports/project-at-a-glance | The project form at a glance (smart buttons) |
| projects/reports/projects-over-budget | Projects over their approved budget |
| projects/who-can-do-what | Who can do what (permission matrices) |
| projects/faq | Projects FAQ |
Also: `src/data/fields/projects.yaml`.
