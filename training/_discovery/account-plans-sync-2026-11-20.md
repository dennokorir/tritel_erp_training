# Account plans sync, 20 Nov 2026: tritel-addons `5d691a8..bba3de2`

tritel_tender_tracker 16.0.1.25.0 → 16.0.1.28.0, tritel_accountability_framework 16.0.1.98.0 → 16.0.1.99.0.
Commits: 81bff81 (account plans and the account manager KPI), 773277d (customer organogram), ea531de (account plan
tracking), d2f7db1 (organogram widget fix), c6dcd75 (account plan privacy by hierarchy).
Read code with `git -C /home/dennokorir/Projects/waft-16-tritel/custom/src/Tritel-Technologies/tritel-addons show
origin/16.0:<path>` (key files: tritel_tender_tracker/models/{account_plans,account_plan_tracking,account_plan_privacy,
account_portfolio,customer_roles,target_accounts}.py, views/{account_plan_views,target_accounts_views,
partner_activity_touchpoints_views}.xml, security/account_plan_security.xml, data/account_plan_cron.xml,
static/src/{organogram,portfolio,…}; tritel_accountability_framework/models/{metric_hook_account_plans,
accountability_metric}.py). Verify every label you write against the code.
`verified_commit`: full hash of origin/16.0 (`git … rev-parse origin/16.0`); illustration header 12 chars.

## Product decisions (20 Nov 2026)
- The reminders job **"Account Plans: reminders and escalation"** ships switched **off**. Describe the reminders fully
  but framed as working "once your administrator turns on the job" (Settings › Technical › Scheduled Actions), never as
  already happening.
- **Supervisors approve quarterly reviews from the plan's Quarterly reviews tab** (the review opens in a window with
  Approve / Return for Changes). Plan Reviews (opens on "To approve") lists what waits, but a review opened from there
  fills the page and its footer buttons don't show (Odoo 16 shows a form footer only in a dialog). Decided 20 Nov 2026;
  to be confirmed on a test server. Previously: approve from Plan Reviews. The My Actions item opens the plan, so supervisors go on from its Quarterly reviews tab. Plans are
  approved from the plan itself (Approve / Return for Changes) or from **Account Plans** (filter To approve).
- New cross-module journey **end-to-end/account-plan-to-am-kpi** (tier → plan → quarterly review → approval → KPI).
- Behaviour that looks unintended: describe what the code does in a calm `:::note[Good to know]`; never call it a bug.
- Dummy data only: Customer A/B, Employee A/B/C, "Customer A · 2026", round KES figures. Don't reuse test-fixture names
  ("OG …", "PV …") or the database name in scripts/attribution_baseline_2025.py.
- Menu paths: **Tender Manager › Tender Customers › Account Plans** etc. (AUTHORING.md: include section headings).

## What users get

### Tiers renamed (target accounts)
Labels: **Key account** (was Strategic), **Major growth** (was Growth), **Maintain** (`target_accounts.py:16`; stored
values unchanged). Customer form: read-only **Tier Since** (reset when the tier changes; help "A tier counts for a
quarter only if it was set before the quarter started."). **Propose as Target** → **Propose as Key Account** and
**Propose as Major Growth**; proposal reads "Proposed as <tier>, awaiting approval"; **Approve Proposed** uses the
proposed tier (falls back to Major growth). Classify Accounts: buttons **Target: Key Account**, **Target: Major Growth**
+ the two Propose buttons; new columns **Tier Since** (hidden), **Proposed Tier**, **Awarded, gross (4Q)**, **Awarded,
attributed (4Q)**. Stale error kept in code: *Only the Head of Commercial or a Tender Administrator can set target
accounts. Use "Propose as Target" instead.* (quote as is; Good to know that the button is now Propose as Key Account /
Major Growth).

### Account plan (`tender.account.plan`)
One per customer (company) per year (*This customer already has a plan for that year.*); title "Customer A · 2026".
Header: Customer, Year, Tier, **Account manager** (from the customer), **Approver** (the account manager's employee
Manager's user), Last customer activity, **Due date**, **Timeliness** badge, **Waiting (working days)** (while
Submitted), **Head of Commercial informed**. Buttons: **Submit for Approval** (Draft/Returned), **Approve** and **Return
for Changes** (Submitted), **Quarterly Review** and **Revise Plan** (Approved → back to Draft). Statusbar Draft ·
Submitted · Approved; Returned shows "Returned for changes: <note>".
Tabs: **Goal and awarded value** (Awarded value goal (attributed), Q1–Q4 goal — typing the annual goal splits ÷4 when
the quarters are empty; Focus areas (solution pillars); Won before; table "Awarded value by quarter (account manager
attribution)": Quarter, Gross, Attributed, Goal, Attributed year before, in millions "12.0M"); **Strategy and risks**
(Account strategy, Risks); **Key people** (compact organogram, Build from Contacts, Open Full Screen, list: Person, Job
title, Reports to, Influence (Decision maker / Approver / Influencer / Gatekeeper / User), Relationship (Warm / Neutral /
Cooling), Covered by, Last met, Role in decisions (hidden), Note; choosing the customer pre-fills up to 6 active
contacts); **Objectives and actions** (Action, Owner, Due, State Open / On track / Done / Dropped); **Quarterly reviews**
(read-only list). Submit creates the approver to-do "Approve account plan: …"; Return creates "Account plan returned:
…" with the note.
Customer form stat buttons (company customers, plan audience only): **Account Plan** ("2026 · reviewed 14 Apr", state,
or "No plan"; opens or creates this year's plan), **Organogram** ("5 of 7 roles" / "Not started"), **Awarded, 4Q**
(attributed, last 4 quarters incl. current). Good to know: Awarded, 4Q and the plan's quarter table don't filter on won
tenders while the KPI counts won tenders only.

### Quarterly review (`tender.account.plan.review`)
Opened in a dialog from **Quarterly Review**: during the review window it opens the quarter just ended (until quarter
end + 14 + 5 days), after that the current quarter. Fields: **Status** Green / Amber / Red, **What changed this
quarter**, **Next steps**, **Due date** = quarter end + 14 days, **Counts until** = due + 5 days, **Timeliness** Not due
yet / Approved on time / Approved late / Overdue / Missed. Buttons Submit for Approval, Approve, Return for Changes,
Close. Approving posts "Review **Q1 2026** approved (Green): …" on the plan; an approved review is locked. Return wizard:
**What needs to change** (required), **Return for Changes** / **Cancel**.

### Who sees and does what (after c6dcd75)
Audience of a plan: the customer's account manager, every manager above them in the employee **Manager** chain, and
every Head of Commercial. Record rules on plans, reviews, key people, actions and customer roles. **Tender
Administrators no longer see every plan**; peers don't see each other's. Edit content: the account manager or the Head
of Commercial. Approve/return: the direct supervisor (Approver) or the Head of Commercial; higher managers view only.
Change a plan's due date: Head of Commercial only. Organogram edit: the account manager or the Head of Commercial.
Outside the audience the customer-form figures, organogram, contacts' role labels and recent activity are hidden.
Tender attribution (`target.achievement`): read by the credited person and their managers; read and edit by Head of
Commercial, Head of Channel, Tender Administrator; nobody else (was: every internal user could read and edit).
Good to know: a Head of Commercial who is also the account manager can approve their own plan (the group passes
`_check_can_approve`).
Messages: *Only the account manager of Customer A can change its plan.* · *Only the account manager's supervisor can
approve or return this.* · *Employee A has no supervisor in the org chart to approve the plan.* · *Write what changed
this quarter before submitting.* · *The account manager has no supervisor in the org chart to approve the review.* ·
*An approved review can no longer change.* · *This plan already has a review for that quarter.* · *Only the Head of
Commercial can change a plan's due date.* · *This plan is for 2026; open the plan for 2027 to review this quarter.* ·
*Only Customer A's account manager or the Head of Commercial can change its organogram.* · *Customer A's account plan
and organogram are only visible to its account manager, their managers and the Head of Commercial.*

### Organogram (`tender.customer.role`)
Roles belong to the customer and are reused by every year's plan; a role can be a placeholder with no contact. Rules:
*This contact already holds a role at this customer.* · *A role cannot report to itself or to one of its own reports.* ·
*A role can only report to a role at the same customer.* · *Employee A is not a contact of Customer A.* Removing a role
moves its reports up. **Build from Contacts** adds one role per contact without one (*3 role(s) added from contacts.* /
*Every contact already has a role.*). Editing Reports to on a key-people line edits the chart.
Compact view (Key people tab): "x of y roles with a named contact", "x of y decision makers and approvers warm",
**Gaps** (max 8): *No contact at <role>.*, *<person> (<role>) has not been met this year.*, *<person> is cooling: last
met <date>.*; empty "No roles yet. Use Build from Contacts, or open the full screen to add roles."; unsaved "Save the plan
to see the organogram." (Old browser tabs may show "5 of 7 roles" text instead of the chart until reloaded.)
Full screen ("Organogram", from the plan or the customer's Organogram button): **Show** Everyone at the customer / This
plan's key people; **Colour by** Relationship / Last met (90 days, year, longer) / Covered by; zoom; **Add Person**
(Name, Email, Role (job title), Reports to — creates the contact); **Add Role**; drag a card to change who it reports
to, drop at the top for top-level; side panel with role, reports to, influence, relationship, covered by, last met,
email, phone, note, Recent activity, **Log Activity**, **Edit**, **Remove Role** (confirm).
**Contacts met**: new field on the customer activity log form, activity form and list ("Who you met (sets Last met on
the organogram)").

### Tracking
Settings › Tender Tracker › **Account Plans** (defaults): Plan approved by (MM-DD) 01-31 · Review due, days after quarter
end 14 · Grace days for the KPI 5 · First reminder, days before due 14 · Then every (working days) 3 · Remind the
supervisor after (working days) 2 · Escalate waiting approvals after (working days) 5 · Escalate overdue after (working
days) 5 · Escalations go to (empty = everyone in the Head of Commercial group) · Weekly summary to the Head of
Commercial (on). Working days Mon–Fri, no holidays.
Timeliness: plan approved on or before due = on time, after = late, not approved and past due = Overdue. Review approved
by due = on time, by Counts until = late, otherwise **Missed** (even if approved later).
Daily job (switched off when shipped; 05:00, skips weekends): who must act = Key / Major growth target accounts with an
account manager; due when no plan for the year, plan Draft/Returned, or the approved plan's review-quarter review not
submitted. Emails: account managers "Account plans due" (from 14 days before due, then every 3 working days);
supervisors "N account plan item(s) waiting for your approval"; one-off escalation "Account plans escalated" (overdue ≥5
or waiting ≥5 working days; sets Head of Commercial informed); Monday "Account plans this week" ("Employee A: 1 overdue ·
0 waiting approval · 3 of 5 reviewed for Q1 2026"). Each send is logged (internal; no menu).
**Plan Review Board** (Tender Customers menu): filters Year, Account manager, Tier (Key and Major growth / All target
accounts); Grid / Kanban; tiles Plans approved x/y (due date, overdue), "<Q> reviews approved", Waiting approval
(oldest, working days), Overdue (plans, reviews), Approval turnaround; grid Account, Tier, Plan <year>, Q1–Q4 cells
(Approved / Approved late / Waiting n days / Returned / Overdue / Missed / Not started / No approved plan), Avg approval;
grouped by account manager "x of y reviewed for Q"; kanban by review state; legend text.
**My Portfolio**: Portfolio tab tiles "Plans reviewed · <Q>" x/5, Awarded value growth ("target 10% · vs the same days
last year"), Awarded this quarter, Open pipeline; table Customer, Tier, Plan (Reviewed / Review due / No plan / Draft /
Waiting approval / Returned), Last review, Attributed (QTD), Gross (QTD), Same days last year, Pipeline; filter "Key and
Major growth only". **Team** tab for leads: Account manager, Customers, Key + growth, Plans reviewed, Awarded growth,
Attributed (QTD), Waiting approval, Not tiered; footer "Key + growth below 5 means that account manager can't reach the
plan target until more accounts are tiered." Who is listed: Head of Commercial all; a manager those below; an account
manager themselves. Good to know: the 5 and 10% are fixed on this screen, not read from the person's Accountability
target.
**My Actions** (Tender Manager › My Actions and portal /my/actions): "Account plans to write", "Account plans returned to
you", "Account plan reviews due" (account managers), "Account plans and reviews to approve" (supervisors), and a
"Customers with no tier" link to Classify Accounts; hints: "Key and Major growth accounts need an approved plan for the
year." / "Make the changes and submit again." / "Open the plan and use Quarterly Review. Each approved review counts
towards your target." / "Approve, or return with a note." / "Propose your Key and Major growth accounts."
Menus under **Tender Manager › Tender Customers**: **My Portfolio**, **Account Plans** (default This year), **Plan
Reviews** (default To approve), **Plan Review Board**. No groups on the menus: others see empty screens (Good to know).

### Account manager KPIs (Accountability)
1. **Account plans reviewed** (code `account_plans_reviewed`, unit accounts; "Suggested floor 3, ideal 5."): number of the
   person's Key account and Major growth target accounts tiered before the window started (empty Tier Since counts) whose
   plan has a review for a quarter in the window approved by its Counts until date; each account once. Waits 19 days
   after the window (fixed in code). Worksheet: Customer / Tier / Review ("Q2 2026 (approved late)" or "Not reviewed") /
   Approved; too-late tiers "Tiered <date>, counts next quarter". Example Q2 2026 (1 Apr–30 Jun; due 14 Jul; counts until
   19 Jul): 6 accounts, one tiered 10 Apr (counts next quarter) → 5 eligible; 3 approved by 14 Jul, 1 on 17 Jul (late,
   counts), 1 on 22 Jul (missed) → **4**. Good to know: the 19 days are fixed even if Tender settings change the review
   or grace days; with a year-to-date window an account still counts once.
2. **Awarded value growth vs same quarter last year** (code `awarded_growth_yoy`, unit %; "Suggested floor 0, ideal 10."):
   (attributed awarded in the window − same window a year earlier) ÷ year-earlier × 100; account manager attribution on
   won tenders by award date; gross shown alongside; year-earlier 0 → no data (*No attributed awards for Employee A in 01
   Apr 2025 – 30 Jun 2025, so there is no baseline to grow from.*). No own settle days → Metric Settle Period (3).
   Worksheet: Period / Customer / Tender / Award date / Gross (KES) / Attributed (KES), flag "awaiting attribution".
   Example 12,000,000 vs 10,000,000 = **+20.0%**. 2025 figures may be estimated baselines (lines named "… · 2025 baseline
   (estimated)").
Both are Coded Logic options only when the Tender Tracker is installed.

## Who writes what (this worktree only; don't edit files another agent owns)
| Agent | Owns |
|---|---|
| **TA** concepts, workflow, calcs, settings | NEW tenders/concepts/account-plans.mdx, tenders/concepts/account-plan-privacy.mdx, tenders/workflows/account-plan.mdx, tenders/calculations/account-plan-due-dates.mdx; EXISTING tenders/configuration.mdx (new Account Plans settings section); their illustrations |
| **TB** how-tos | NEW tenders/how-to/account-plans/{write-an-account-plan, submit-a-quarterly-review, approve-plans-and-reviews, map-the-customer-organogram, plan-review-board, my-portfolio}.mdx and their illustrations |
| **TC** existing Tenders + journeys | EXISTING tenders pages (market-coverage, account-ownership, customer-activity workflow, log-a-customer-activity, commercial-targets/*, attribute-a-won-tender, tender-my-actions, who-can-do-what, index, faq), getting-started/my-actions, roles/commercial, roles/line-managers, end-to-end/customer-activity-to-coverage, NEW end-to-end/account-plan-to-am-kpi; EXISTING tenders illustrations (cust-classify-accounts, cust-touch-log, matrix-customers, cust-coverage-overview, workflow pictures); src/data/{glossary,fields,states}/tenders.yaml (incl. new terms for all of the above) |
| **TD** Accountability KPI | NEW accountability/calculations/account-manager-kpi.mdx (+ calc illustration); EXISTING accountability/calculations/metric-families, accountability/concepts/metrics, accountability/how-to/hr-admin/metrics; src/data/glossary/accountability.yaml (KPI terms only) |
| Lead | sidebar, What's new, manifest, build, coverage |
Slugs above are fixed; any agent may link to them.
