# Time Off section (tritel_hr_leave): page plan (slugs are fixed; link only to these)

Module: `tritel_hr_leave` 16.0.1.5.0, at tritel-addons `origin/16.0` = `5c65842fdc84ad076ab9c765615755de221683e8`.
Read the code from the extracted copy at `origin/16.0` (the local checkout is on another branch), e.g.
`git -C <tritel-addons> show origin/16.0:tritel_hr_leave/<path>`. Watched: `tritel_approvals_dashboard`
(only its Time Off section and approver delegation are in scope). Odoo core Time Off (`hr_holidays`) is described only
where these pages need it; use Odoo 16's labels.

Section: sidebar **Time Off**, URLs `/leave/…`, frontmatter `module: leave`. Discovery notes: `leave.md`.

Pages may also link to: `getting-started/*`, `roles/<department>`, `reference/glossary`, `reference/states`,
`reference/fields/leave`, and any slug in the other page plans.

Role ids: everyone, line-manager, hr (HR staff and Time Off administrators), system-admin.
In text: "Time Off administrators" (Odoo's Time Off › Administrator right), "Time Off officers" (Time Off › Officer),
"people on the Company-wide Time Off View list".

## Product decisions (from the product owner, 17 Nov 2026)
- The job **HR Leave: Cancel Expired Pending Requests** is switched **on** in production. Document it: every day it
  refuses requests still in **To Submit**, **To Approve** or **Second Approval** whose last day has passed, including
  requests waiting for HR. This contradicts the settings screen text ("A request the manager approved that is still
  waiting for HR is escalated, never refused"): describe what happens, in a calm `:::note[Good to know]`.
- Approvals dashboard: document only its **Time Off to Approve** section and approver delegation as it affects time off.

## Agent L1: overview, concepts, everyone
| Slug | Title | Type |
|---|---|---|
| leave/index | Time Off | overview (what Tritel adds to Odoo Time Off; who uses what; Mermaid flowchart TD map) |
| leave/concepts/balances | Balances: allocated, taken, requested | concept (Balance = Allocated − Taken − Requested; accrual, next accrual, by 31 Dec; the leading type; sick days) |
| leave/concepts/who-sees-what | Who sees whose time off | concept (full vs In/Away; managers; company-wide list; Time Off administrators; hidden accounts; leave history) |
| leave/how-to/everyone/my-leave | Check my leave and request time off | how-to, everyone |
| leave/how-to/everyone/team-presence | See who is in with Team Presence | how-to, everyone |
| leave/how-to/everyone/on-the-portal | Use My Leave and Team Presence on the portal | how-to, everyone |
| leave/how-to/everyone/answer-a-question | Answer a question on my request | how-to, everyone |

## Agent L2: approvals, managers, workflow, calculations
| Slug | Title | Type |
|---|---|---|
| leave/concepts/approval-steps | Approval steps, delegates and escalation | concept |
| leave/workflows/time-off-request | Time off request workflow | workflow (stateDiagram-v2 + swimlane: Employee, Approver, Delegate, Escalation, HR, System) |
| leave/how-to/line-managers/my-team | Use My Team | how-to, line-manager |
| leave/how-to/line-managers/approve-time-off | Approve, refuse or ask about time off | how-to, line-manager, hr |
| leave/how-to/line-managers/delegate-approvals | Delegate my approvals while I'm away | how-to, line-manager |
| leave/calculations/reminders-and-escalation | Reminders, escalation and automatic refusal | calculation (working days; worked timeline example; both daily jobs) |
| leave/calculations/busy-days-and-flags | Busy days, Low and Not taking leave | calculation |
Also: `src/data/states/leave.yaml` (the request statuses as Odoo 16 labels them).

## Agent L3: HR, permissions, FAQ, reference data, discovery notes
| Slug | Title | Type |
|---|---|---|
| leave/how-to/hr/settings | Set reminders, escalation and flags | how-to, hr |
| leave/how-to/hr/company-wide-view | Give HR the company-wide view | how-to, hr |
| leave/how-to/hr/hide-service-accounts | Hide service accounts from Time Off | how-to, hr |
| leave/how-to/hr/download-presence | Download Team Presence to Excel | how-to, hr |
| leave/who-can-do-what | Who can do what | reference (type: matrix illustration) |
| leave/faq | Time Off FAQ | faq |
Also: `src/data/glossary/leave.yaml` (10–20 terms, none already defined elsewhere), `src/data/fields/leave.yaml`,
`training/_discovery/leave.md` (discovery notes, same shape as `e_board.md`).

## Integration (lead)
Manifest entry `leave`, sidebar, module lists, `getting-started/my-actions` (the **Time off to approve** group),
learning paths (`roles/everyone`, `roles/line-managers`, `roles/hr`), What's new, build and coverage.
