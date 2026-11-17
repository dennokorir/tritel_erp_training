# Time Off section (tritel_hr_leave): page plan (slugs are fixed; link only to these)

Module: `tritel_hr_leave` 16.0.1.7.1, at tritel-addons `origin/16.0` = `83d4cd69791094ea2f3440c9ee07e2d7ff0e7a02` (first written at 16.0.1.5.0, `5c65842`).
Read the code from the extracted copy at `origin/16.0` (the local checkout is on another branch), e.g.
`git -C <tritel-addons> show origin/16.0:tritel_hr_leave/<path>`. Watched: `tritel_approvals_dashboard`
(only its Time Off section and approver delegation are in scope). Odoo core Time Off (`hr_holidays`) is described only
where these pages need it; use Odoo 16's labels.

Section: sidebar **Time Off**, URLs `/leave/…`, frontmatter `module: leave`. Discovery notes: `leave.md`.

Pages may also link to: `getting-started/*`, `roles/<department>`, `reference/glossary`, `reference/states`,
`reference/fields/leave`, and any slug in the other page plans.

Role ids: everyone, line-manager, hr (HR staff and Time Off administrators), system-admin.
In text: "Time Off administrators" (Odoo's Time Off › Administrator right), "Time Off officers" (Time Off › Officer),
"people on the Company-wide Viewers list" (the menu was renamed from Company-wide Time Off View in 16.0.1.7.0).

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

## Sync 2: 16.0.1.6.0 to 16.0.1.7.1 (17 Nov 2026, `5c65842..83d4cd6`)
Read with `git -C <tritel-addons> show origin/16.0:<path>`. Commits: 88c4235 Leave Coverage and allocation rules,
c601585 Time Off menus by role, 9d33649 access clean-up (a one-off migration naming real logins: **do not document who**).

### Product decisions (17 Nov 2026)
- Leave Coverage is documented as **Time Off officers only**. The code also lets people on the Company-wide Viewers list
  open it read-only, but its menu is officer-only, so they can't reach it. Don't mention the viewer route.
- The list is called **Company-wide Viewers** (menu **Time Off › Configuration › Company-wide Viewers**); glossary keeps
  "Company-wide Time Off View" as an alias. Settings screen is **Approvals and Reminders**.
- Quote Tritel's set-up as it stands, adding that HR can change it under **Configuration › Leave Types**: Annual Leave
  earns monthly (accrual plan), Sick Off is a yearly grant of 30 days, Maternity and Paternity need no allocation but one
  request is at most 90 and 14 days, Overtime is on request. The Public Holiday leave type is archived (public holidays
  come from Configuration › Public Holidays). Earning allocations are open-ended (no 31 December end).

### Menus by role (`views/menus_by_role.xml`), Odoo top-menu order
| Menu | Items | Who sees it |
|---|---|---|
| Home | My Team / My Leave | everyone |
| My Leave | My Requests, My Calendar, My Allocations | everyone |
| Team Presence | | everyone |
| To Approve | Leave Requests (opens on the **Waiting for me** filter) | Time Off approvers (Odoo adds the hidden Time Off Responsible group to every time-off approver) and up |
| Manage | Leave Coverage, All Allocations, All Leave Requests, Company Calendar (was Overview) | Time Off officers and up |
| Reporting | Leave Taken (was by Employee), Balances (was by Type) | Time Off officers and up |
| Configuration | Leave Types, Monthly Earning Plans (accrual plans), Public Holidays, Company-wide Viewers, Approvals and Reminders | Time Off administrators |
Hidden: the duplicate Time Off › My Time Off › My Leave item, Stress Days. Approvers no longer get the allocations list.

### New pages
| Slug | Title | Type | Owner |
|---|---|---|---|
| leave/concepts/allocations | How staff get leave: allocations | concept (Earns monthly / Yearly grant / On request; join date = first contract date; Kind; Allocated/Taken/Left; worked example) | Agent S1 |
| leave/how-to/hr/set-up-leave-types | Set how staff get each leave type | how-to, hr (Time Off administrators) | Agent S1 |
| leave/how-to/hr/leave-coverage | Find and fill allocation gaps with Leave Coverage | how-to, hr (Time Off officers) | Agent S1 |
| leave/how-to/hr/adjust-a-balance | Adjust a leave balance | how-to, hr (Time Off officers) | Agent S1 |
| leave/menus | Time Off menus | reference (matrix illustration) | Agent S2 |
Lead: existing pages, menu bars in existing illustrations, who-can-do-what, sidebar, roles, What's new, manifest.
