# Tritel HR Leave Extensions (`tritel_hr_leave` 16.0.1.5.0): discovery notes

Read at tritel-addons `origin/16.0` = `5c65842` (the local checkout was on another branch, so the code was read from
`git archive origin/16.0 tritel_hr_leave`). Paths below are module-relative. Depends on `hr_holidays`, `portal`, `web`,
`tritel_approvals_dashboard`, `tritel_accountability_framework`, `tritel_tender_tracker` (`__manifest__.py`).
Page plan: `leave-page-plan.md`.

## 1. Purpose

Extends Odoo Time Off without replacing it (balances, allocations, the second HR approval and payroll work entries
behave as in core). It adds:

- a **Time Off home** the app opens on: **My Team** for people with reportees, **My Leave** for everyone (16.0.1.4.0);
- **Team Presence**: who is in, away or waiting, by week or month, grid or calendar, scoped by reporting line
  (16.0.1.1.0, extended 16.0.1.3.0);
- time off on the **Approvals dashboard** and in **My Actions**, with Approve / Refuse / Ask and approver delegation
  (16.0.1.2.0);
- a daily job for reminders, escalation and refusal (16.0.1.2.0);
- the **Company-wide Time Off View** list and hiding service accounts (16.0.1.5.0);
- portal pages `/my/leave`, `/my/team-leave`, `/my/presence`;
- a daily job refusing expired pending requests (`models/hr_leave.py`).

## 2. Models

### 2.1 New models

| Model | Kind | File | Purpose |
|---|---|---|---|
| `tritel.presence.admin` "Company-wide Time Off View" | stored | `models/presence.py:35` | One row per user (`user_id` **User**, internal users only; `note` **Why**). Unique per user: *This person is already on the company-wide view list.* (`:41`) |
| `tritel.presence` "Team Presence" | abstract | `models/presence.py:48` | Visibility (`_company_wide` `:54`, `_is_admin` `:62`, `_scope` `:68`), day status (`_cell`), data for every presence screen (`get_presence_data` `:197`), Excel (`export_presence_xlsx` `:287`) |
| `tritel.leave.home` "Time Off home pages" | abstract | `models/leave_home.py:36` | My Leave (`get_my_leave` `:215`), My Team (`get_my_team` `:255`), balances (`_balances` `:119`), accrual (`_accrual` `:88`), flags (`_flag` `:168`) |
| `tritel.leave.approval.settings` "Time off approval reminders" | transient | `models/hr_leave_approval.py:386` | The **Approvals & Presence** window; writes the company fields on **Save** (`action_save` `:415`) |

### 2.2 Inherited models

- `res.company` (`models/hr_leave_approval.py:37`, `models/leave_home.py:27`): `tritel_leave_remind_days` (2),
  `tritel_leave_escalate_days` (4), `tritel_leave_escalate_before_start` (2), `tritel_leave_refuse_after_start` (True),
  `tritel_presence_busy_pct` (20), `tritel_leave_escalation_user_id`, `tritel_leave_low_days` (3),
  `tritel_leave_unused_pct` (60), `tritel_leave_unused_from_month` (10).
- `hr.leave` (`models/hr_leave_approval.py:53`): **Waiting since** `:56`, **Reminder sent** `:58`, **Escalated on**
  `:59`, **Escalated to** `:60`, **Question open** `:62`; the step clock is reset on every state change (`write`).
  `models/hr_leave.py:9`: the expired-request job.
- `hr.employee` (`models/employee_visibility.py:17`): **Hide from Time Off views** `:20` (tracked), toggle rights `:28`.
- `approval.request.get_dashboard_data`, `accountability.target.get_my_actions`, `tender.initial.get_my_actions`
  (`models/leave_approval_lists.py:40-67`): add the leave queue / the **Time off to approve** group.

### 2.3 Balances (`models/leave_home.py:119-165`)

From core `hr.leave.type.get_employees_days`: **Allocated** = `max_leaves`, **Taken** = `leaves_taken` (approved,
including future days), **Requested** = remaining − virtual remaining, **Balance** = `virtual_remaining_leaves`
(= Allocated − Taken − Requested). Only types with `requires_allocation = yes` and an allocation this year. Main type
(`_main` `:154`): accrual type first, else largest allocation, anything named "sick" last; the "sick" type is found by
name (`_sick`). Accrual: earned so far, next accrual, total expected by 31 Dec capped at the level's maximum (`:88`).

## 3. Workflows

### 3.1 Request steps (`models/hr_leave_approval.py:88-160`)

Core states: `draft` **To Submit**, `confirm` **To Approve**, `validate1` **Second Approval**, `validate` **Approved**,
`refuse` **Refused**, `cancel` **Cancelled**. Step waited on (`_tritel_step`): manager when `confirm` and validation
type `both`/`manager`; HR when `validate1` + `both`, or `confirm` + `hr`. Step owner (`_tritel_step_owner` `:100`):
manager step = employee's `leave_manager_id` (**Time Off** approver) or the manager's user; HR step = the leave type's
responsible. Who may decide (`_tritel_role` `:120`): owner; delegate (manager step only, via an active
`approval.delegation`); escalated-to users; Time Off officers (not their own request). Delegate/escalated decisions
are logged *Approved by X for Y (delegation).* / *… after escalation (waiting for Y).*

### 3.2 Decisions (`:163-210`)

`tritel_approve` (approve or validate the current step), `tritel_refuse` (reason required, posted to the employee),
`tritel_ask` (question posted to the employee; **Question open** until the employee posts on the request).

## 4. Menus and views

### 4.1 Backend

| Menu | Action | File |
|---|---|---|
| **Time Off › Home** (sequence 0, the app opens here) | client `tritel_leave_home` mode home | `views/leave_home_views.xml:16` |
| **Time Off › My Time Off › My Leave** | client mode leave | `views/leave_home_views.xml:18` |
| **Time Off › Team Presence** | client `tritel_team_presence` | `views/presence_views.xml:7` |
| **Time Off › Configuration › Approvals & Presence** (Time Off administrators) | settings window | `views/leave_approval_views.xml:51` |
| **Time Off › Configuration › Company-wide Time Off View** (Time Off administrators) | editable list | `views/presence_views.xml:30` |

- Request form (manager view): **Approval** group with the five fields, shown once **Waiting since** is set
  (`views/leave_approval_views.xml:59`).
- Employee form: **Hide from Time Off views** / **Show in Time Off views** header buttons (visible to those who may
  toggle), the tick box on **HR Settings › Status**, the grey banner; search filter **Hidden from Time Off views**;
  bulk server actions in **Action** bound to Time Off administrators (`views/employee_visibility_views.xml:4-59`).
- Approvals dashboard: **Time Off to Approve** section with **Approve**, **Refuse**, **Ask** and the dialogs
  *Refuse time off* / *Ask about this time off* (`static/src/approvals/leave_dashboard.xml`, `.js:37-80`).
- Time Off home and Team Presence screens: `static/src/home/leave_home.xml`, `static/src/presence/team_presence.xml`.

### 4.2 Portal

| Route | Page | File |
|---|---|---|
| `/my/leave` | My Leave (needs a linked employee, else back to `/my`) | `controllers/leave_home.py:32` |
| `/my/team-leave` | My Team's Leave (managers and company-wide list, else `/my/leave`) | `controllers/leave_home.py:39` |
| `/my/team-leave/<id>` | A team member's leave (403 if not allowed) | `controllers/leave_home.py:49` |
| `/my/presence` | Team Presence (week/month, grid/calendar, filters in the address; last filters remembered in the browser) | `controllers/presence.py:27` |
| `/tritel_hr_leave/presence/export` | Excel download (404 unless allowed) | `controllers/presence.py:89` |

Portal home and the user menu get **Team Presence**, **My Leave** and **My Team's Leave** links
(`views/presence_views.xml:230-250`, `views/leave_home_portal.xml:176-194`).

## 5. Roles

No new security groups. Rights come from:

| Who | Source | Gets |
|---|---|---|
| Company-wide list | `tritel.presence.admin` row, or `base.group_system` (`models/presence.py:54`) | Everyone in Team Presence; My Team "Everyone in the company"; anyone's leave history; Excel; hide/show from the form |
| Time Off administrator | `hr_holidays.group_hr_holidays_manager` | Everyone in Team Presence and Excel (`_is_admin` `:62`); Configuration menus; settings and list access (`security/ir.model.access.csv`); hide/show (form and bulk) |
| Time Off officer | `hr_holidays.group_hr_holidays_user` | Can decide others' waiting requests (`_tritel_role`); no wider view (`_can_see` `models/leave_home.py:70`) |
| Manager | has active reports | Full view of everyone below in Team Presence; My Team; histories of people below |
| Everyone | linked employee | Self in full; same-manager peers as In/Away |

Delegation (watched addon `tritel_approvals_dashboard`): any internal user may create their own delegation
(`approval.delegation` ACL `base.group_user`); **Approvals › Delegation Management** is for Approvals Administrators;
one active delegation per approver; no self-delegation.

## 6. Automations

| Job | Schedule | File | What it does |
|---|---|---|---|
| **Time Off: Approval Reminders and Escalation** | daily, active | `data/leave_approval_cron.xml:5`, `models/hr_leave_approval.py:329` | Per waiting request (hidden employees skipped): refuse at the manager step once the first day has passed (if the setting is on), with a note; escalate after N working days or 1+ working day waited and ≤ K days before the start, to the owner's manager, else the named person, else Time Off administrators (`:313`), with to-dos and a note; remind the owner (and their delegates) after M working days. Once per step each. |
| **HR Leave: Cancel Expired Pending Requests** | daily, installed inactive; **on in production** (product owner, 17 Nov 2026) | `data/ir_cron_data.xml:5`, `models/hr_leave.py:13` | Refuses every request in `draft`, `confirm`, `validate1` whose `date_to` is before today (falls back to writing `refuse` if the refusal fails). No note; no exception for the HR step or hidden employees. |

Working days (`_tritel_working_days`): Monday–Friday less company-wide public holidays of the company calendar.

## 7. Validation messages

| Message | File |
|---|---|
| *You can't decide Employee A's Annual Leave: it is waiting for Employee B.* | `models/hr_leave_approval.py:141` |
| *Give a reason for refusing, so the employee knows why.* | `:177` |
| *Write the question to ask.* | `:188` |
| *This time off request no longer exists.* | `:301` |
| *Remind after at least 1 working day, and escalate later than the reminder.* | `:418` |
| *Time off settings saved.* | `:428` |
| *Refused automatically: it was still waiting for approval when the leave started (…). Request it again if you still need it.* | `:348` |
| *Only Time Off Administrators and people on the Company-wide Time Off View list can hide or show employees in the Time Off views.* | `models/employee_visibility.py:39` |
| *Only HR and presence administrators can download Team Presence.* | `models/presence.py:294` |
| *You can't see Employee A's time off.* | `models/leave_home.py:222` |
| *This person is already on the company-wide view list.* | `models/presence.py:41` |

## 8. Cross-module touchpoints

- **My Actions** (Accountability and Tender Manager): group **Time off to approve** (`models/leave_approval_lists.py:8-37`).
  Documented page: `getting-started/my-actions`.
- **Approvals dashboard** (`tritel_approvals_dashboard`, watched): leave queue and KPI counts (`:40-51`); delegation.
- Team Presence uses public holidays (`resource.calendar.leaves` without a resource) and each employee's working calendar.

## 9. Gaps / questions for the product owner

1. **Expired-request job.** Installed switched off; if on, it refuses requests waiting for HR, contradicting the
   settings window's "escalated, never refused". *Answer (17 Nov 2026): it is on in production; document it.* Pages
   describe it in a calm "Good to know" on the settings page, the FAQ and the reminders calculation.
2. **Approvals dashboard scope.** *Answer: document only its Time Off section and approver delegation; watch the addon.*
3. **Section name.** *Answer: sidebar "Time Off", URLs `/leave/`, module key `leave`.*
4. Rights split, documented as is: hide/show from the employee form is open to Time Off administrators and the
   company-wide list, but the bulk **Action** entries are bound to Time Off administrators only.
5. The sick leave type is recognised by "sick" in its name (`_sick`, `_main`, `_requests`): a differently named sick
   type is treated as an ordinary type. Documented in the FAQ.
6. Team Presence and the working-day count assume Monday to Friday and the Africa/Nairobi time zone when the employee
   has none (`models/presence.py:22-23`).

## 10. Sources

`__manifest__.py`; `models/hr_leave.py`, `models/presence.py`, `models/hr_leave_approval.py`,
`models/leave_approval_lists.py`, `models/leave_home.py`, `models/employee_visibility.py`;
`controllers/presence.py`, `controllers/leave_home.py`; `views/presence_views.xml`, `views/leave_approval_views.xml`,
`views/leave_home_views.xml`, `views/leave_home_portal.xml`, `views/employee_visibility_views.xml`;
`data/ir_cron_data.xml`, `data/leave_approval_cron.xml`; `security/ir.model.access.csv`;
`static/src/approvals/*`, `static/src/home/*`, `static/src/presence/*`; tests `tests/*.py`.
Watched: `tritel_approvals_dashboard/models/approval_delegation.py`, `views/approval_delegation_views.xml`,
`views/dashboard_views.xml`, `security/*`.
