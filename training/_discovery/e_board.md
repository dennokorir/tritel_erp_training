# E-Board (`e_board` 16.0.1.5.0): discovery notes

Module path: `/home/dennokorir/Projects/tritel-training/e_board`. Line references are per file. AF = `tritel_accountability_framework`.

---

## 1. Purpose

E-Board is a private website area (portal) for Tritel's Board of Directors, reached at `/my/board`. Board members get a summary of company performance they can only look at. It covers sales and purchase invoices, the tender win rate, expenses, open receivables and payables ("Financial Position"), payroll, profitability of won tenders, and post-dated cheques waiting for board signatures. Board members can do three things there: sign cheques, add their own confidential commission or facilitation cost lines to a won tender's business case, and act as the named Board Reviewer of the Managing Director. The MD is the top-level employee. A daily job opens one review for the MD at the end of every calendar quarter. The MD adds results and submits it. The board member accepts or changes each result and signs off in the portal. The sign-off becomes normal accountability reviews, and the MD then acknowledges it. The Performance tab also shows organisation-wide accountability totals, either live or "as at" a past month end, with no names. Back-office staff decide which sales and purchase orders the board sees. They invite board members from the contact list. System administrators see an access log of every board page visit and action.

---

## 2. Models

### 2.1 New models

| Technical name | Business name | Purpose | File |
|---|---|---|---|
| `accountability.board.review` | Board Review of the Top-Level Employee ("Board Reviews") | One quarterly MD review pack. Has chatter and activities. | models/accountability_board_review.py:29 |
| `accountability.board.review.line` | Board Review Target | One target inside the pack | models/accountability_board_review.py:284 |
| `e.board.access.log` | E-Board Portal Access Log | Audit row for each portal page visit or action | models/access_log.py:5 |
| `board.invite.wizard` (transient) | Invite Board Viewer | Sends invitations and grants the Board Viewer group | models/board_invite_wizard.py:5 |

#### `accountability.board.review` key fields

| Field | UI label | Meaning |
|---|---|---|
| `name` (computed, stored) | (title) | "Board review · <employee> · Q<n> <year>". Quarter = ((month of `date_to` − 1) // 3) + 1 (:53-56). Example: date_to 31 Mar 2027 gives "Board review · <MD> · Q1 2027" |
| `employee_id` | (Employee) | The top-level employee (the MD) |
| `period_id` | (Period) | The active accountability period the quarter falls in |
| `date_from` / `date_to` | "Quarter From" / "Quarter To" | Calendar quarter |
| `state` | statusbar | See §3 |
| `line_ids` | "Targets" | The target lines |
| `submitted_on` | (Submitted On) | Date the MD submitted. Starts the 7-day and 14-day clocks |
| `reminder_sent`, `backup_opened` | –, "Open to the Backup" | Chase flags |
| `signed_by_id`, `signed_on` | "Signed By", (Signed On) | The board member who signed off |
| `md_comment` | "Your Comment" | The MD's reply. Can only be edited in the Signed off state (:66). Shown to the signer |
| `acknowledged_on` | (Acknowledged On) | |
| SQL constraint | "This quarter already has a board review." | One per employee per `date_to` (:50) |

#### `accountability.board.review.line` key fields

| Field | UI label | Meaning |
|---|---|---|
| `target_id` | (Target) | The MD's accountability target |
| `window_from/to` | (Window From/To) | Part of the quarter this target is reviewed for (see §6) |
| `has_metric` | "From a Metric" (shown as "Metric" in the list) | The result was calculated by the system. The MD cannot change it |
| `not_applicable` / `na_reason` | "Nothing to Measure" | The metric reported no data. The portal shows "Nothing to measure" |
| `metric_error` | (Metric Error) | The metric failed. The line falls back to a result the MD enters |
| `metric_breakdown` | "How It Was Calculated" | The metric's explanation, shown to the board |
| `proposed_value` | "Result" | Metric value, or the value the MD typed |
| `md_note` | "Comment" | The MD's comment. Required on lines without a metric (:207) |
| `evidence_ids` | "Evidence" | Attachments. The board downloads them from the portal |
| `board_value` / `board_comment` | "Board Result" / "Board Comment" | Copied from `proposed_value` on submit (:210), then set by the board on sign-off |
| `proposed_score` / `board_score` (computed) | "Score (%)" / "Board Score (%)" | See below |
| `review_id` | – | The `accountability.review` created at sign-off |

**Score calculation** (`_score_for`, :322-329)
- No target, or the line is "Nothing to Measure": 0.
- Milestone target: the value is read as % complete, kept between 0 and 100. Example: 75 scores 75%. 130 scores 100%.
- Quantitative or threshold target: AF `_projected_score(value)` (AF models/accountability_target.py:592).
  - Quantitative "maximize": min(value ÷ basis × 100, 100). Example: basis 120,000,000 and result 90,000,000 scores 75%.
  - Quantitative "minimize": min(basis ÷ value × 100, 100). An entered 0 scores 100. Example: basis 5 incidents and result 8 scores 62.5%.
  - Threshold: band score between floor, target and ceiling.
- Any other target type scores 0 (AF :600).

### 2.2 Inherited models

| Model | Additions | File |
|---|---|---|
| `accountability.config` | `board_reviewer_user_id` "Board Reviewer" and `board_backup_user_id` "Backup Board Reviewer". Both are limited to portal users (share) in Board Viewer. A constraint also blocks employees. Any change is posted to chatter and emailed to old and new reviewers (:49-63) | models/accountability_extensions.py:14-63 |
| `hr.employee` | `_is_board_reviewed()`: true when the employee has no manager, has direct reports, and a Board Reviewer is named (:69-73) | :66 |
| `accountability.target` | `board_reviewed` (computed, hidden). Blocks review requests, typed results and normal reviewing for the MD's targets. Adds a "Board reviews" group to My Actions | :76-115 |
| `accountability.review` | `board_signed_by_id` "Signed by the Board" and `board_review_id`. `reviewer_id` becomes optional. Check: a reviewer or a board signer is required ("A review needs a reviewer or a board sign-off.") | :118-138 |
| `accountability.period` | `_board_period_for`, `_board_org_summary`, `_board_org_summary_as_at` (Performance tab figures) | models/accountability_board_summary.py:25-143 |
| `sale.order` / `purchase.order` | `board_position_exclude` "Exclude from Board Position", `board_exclude_reason` "Exclusion Reason", `board_portal_hide` "Hide from Board Portal", `board_portal_hide_reason` "Hide Reason" | models/sale_order.py:8-28, models/purchase_order.py:8-28 |
| `res.partner` | `board_invite_pending` (technical, no UI). Set when an invitation is sent and cleared on sign-up | models/res_partner.py:8 |
| `res.users` | On sign-up, an invited partner gets Board Viewer (:9-17). Portal home sends board viewers to `/my/board` with priority 10 (:19-24) | models/res_users.py |

### 2.3 Organisation summary ("Performance" tab, accountability block)

Built in `_board_org_summary` (accountability_board_summary.py:42-94). The period is the newest accountability period that is not Draft and overlaps the board's selected dates (:29-32). If no period matches, the page shows "Accountability: No accountability period covers the selected dates."

| Tile / column (exact label) | Calculation |
|---|---|
| "Organisation Score" | Weighted mean of the top-level objectives' live scores, weighted by objective weight (:71). Each objective's score is the weighted mean of its *measured* targets' scores, weighted by period weight (AF objective :205). Objectives with nothing measured are left out. Shown as a whole % or "–" |
| caption "<rating> · based on X of Y objectives" | The rating comes from the *pace-adjusted* `rating_score`, not from the score shown (:57-63, 72-73). X = objectives − unmeasured |
| "Objectives Meeting Expectations" "N of M" | Objectives rated Meets Expectations, Exceeds Expectations or Outstanding (:84). Caption "<n> not yet measured" counts objectives with status "Not yet measured" or "No targets set" |
| "Targets Reviewed" % | Counted targets with at least one signed review ÷ counted targets (:76, 87-89) |
| "Staff with Targets" % | Participating employees (non-exempt) who own a counted target ÷ participating employees (:74-75, 90-92) |
| "Strategic Objectives · <period> · Year to Date" (or "As at <date>") | One row per top-level objective: "Objective", "Score", "%", "Reviewed" ("x of y"), "Status". Sorted worst status first (:70) |

Status labels (:10). Rating levels from AF Settings boundaries (default 50 / 60 / 70 / 80): "Unsatisfactory" <50, "Needs Improvement" 50 to under 60, "Meets Expectations" 60 to under 70, "Exceeds Expectations" 70 to under 80, "Outstanding" 80 or more. Extra statuses: "Not yet measured" (targets exist, none has a result) and "No targets set".

**Worked example**
- Objective A has weight 2 and score 80. Objective B has weight 1 and score 50. Objective C has targets but no results.
- Organisation Score = (80×2 + 50×1) ÷ 3 = 70%. C is left out, so the caption reads "based on 2 of 3 objectives".
- If the pace-adjusted ratings are A = 85 and B = 50, the rated mean is (170 + 50) ÷ 3 = 73.3, which is "Exceeds Expectations".
- Objectives Meeting Expectations = 1 of 3 (A is Outstanding, B is Needs Improvement, C is Not yet measured). Caption: "1 not yet measured".
- Targets: 40 counted, 26 with a signed review, so Targets Reviewed = 65%.
- Staff: 35 participants, 28 with targets, so Staff with Targets = 80%.

**"As at" figures** (`_board_org_summary_as_at`, :96-143)
- Used when an "As at" date earlier than today is chosen from the selector.
- Options: "Today", then each past month end in the period, with month ends at the end of a quarter marked "· quarter end" (AF snapshot :40).
- The date is kept inside the period's start and end (:102).
- Each target is rebuilt by the AF snapshot engine (`_target_as_at`). Only finished reviews covering up to that date count, and the weights in force on that date are used.
- Same tiles and formulas. Objective score = weighted mean of `full_score` by `weight_share`.
- Caption: "Figures as they stood on <date>, rebuilt from the reviews covering up to that date."
- The page states: "Scores build up over the year, so the quarter buttons don't change them."

### 2.4 Commercial and financial figures (portal controller, not stored)

File: controllers/e_board_controller.py. The date range comes from the URL: custom range, else quarter, else year, else the current year (:49-82).

| Label | Calculation (line) | Example |
|---|---|---|
| "Revenue" | Sum of `amount_total_signed` (includes tax) of posted customer invoices with invoice date in range (:85-150). Caption: "<n> invoices · <n> orders". Orders = confirmed sales orders by order date, untaxed, converted to company currency | 3 invoices of 1,000,000 each gives 3.0M |
| "Total Spend" | Same calculation for posted vendor bills (:152-215) | 1.8M |
| "Net Position" (Performance tab) | Revenue − Total Spend. Caption: "Revenue minus spend" (:568) | 3.0M − 1.8M = 1.2M |
| "Won Tenders" | Sum of `expected_revenue` of tenders with kanban_state = won, in tender target periods overlapping the range (:217-291) | |
| "Win Rate" | won ÷ (won + lost + dropped) × 100. Cancelled tenders are not "decided" (:249-250). Colour: 50% or more good, 30% or more warning, else danger | 6 won, 9 lost, 3 dropped gives 33% |
| CRM pipeline | Opportunities with deadline in range: count and sum of expected revenue (:253-261) | |
| "Expenses by Account" | Top 8 expense accounts (types expense, depreciation, direct cost) from posted vendor bill lines in range (:293-329) | |
| Financial Position: receivables | Unpaid or partly paid posted customer invoices (residual), plus the uninvoiced backlog of confirmed SOs that are neither excluded nor hidden (:380-460) | Invoices residual 2.0M + SO backlog 0.5M = 2.5M |
| Order backlog (`_order_exposure`) | Order total including tax, converted at the order date, minus posted invoices net of refunds. Never below 0. "Total Exposure" = backlog + unpaid residual on its invoices (:342-378) | SO 1,160,000, invoiced 580,000, 200,000 unpaid: backlog 580,000, exposure 780,000 |
| Aging buckets | Days past the invoice due date (orders: days since order date): up to 30, 31-60, 61-90, over 90 (:331-340) | |
| Financial Position net | Receivables − payables. "Favourable" if 0 or more, else "Adverse" (:633-646) | |
| Payroll "YTD Gross Payroll" / "Net Pay to Employees" | Salary rule codes P030 and P120 on payslips that are done or paid, not credit notes, current company, 1 Jan to today (:980-1108) | |
| "Total Employer Cost" | Gross (P030) + employer NSSF (P065) + employer Housing Levy (P118). Caption: "Gross + ER NSSF + Housing Levy (ER)" | 10M + 0.2M + 0.15M = 10.35M |
| "Active Headcount" | Distinct employees on done or paid payslips in the year | |
| Year-on-year % | (gross − prior-year gross for the same months) ÷ prior-year gross. "No prior-year data" if there is none | |
| "Pay Composition" | Net Pay, PAYE (P105), NSSF (P055), NHIF/SHA (P106), Housing (P110), each as a share of their total | |
| Profitability: "Won Tenders", "Estimated GP", "Actual GP", "Analysis Gaps" | Won tenders only. Figures come from the tender's first business case (`total_revenue`, `gross_profit`, `actual_gp`, `variance_gp`). Gaps list: no revenue, no business case, no cost lines, business case still Draft, no confirmed SO, no confirmed PO (:1153-1264) | |
| PDC Cheques: "Awaiting My Signature", "Fully Authorised", "Overdue / Critical" | Cheques in draft or issued state. Awaiting = not fully signed and not yet signed by me. Critical = urgency is critical or overdue, caption "Due within 3 days or already overdue". Default required signatures = 2. Each group shows cheque coverage against the bill or PO amount: exact, under or over (:1545-1727) | |

---

## 3. Workflows

### 3.1 `accountability.board.review.state` (:23)

Values: `preparing` "Being prepared", `with_board` "With the board", `signed` "Signed off", `acknowledged` "Acknowledged".

| From | To | Trigger (label) | Method / route | Who |
|---|---|---|---|---|
| (none) | Being prepared | Daily cron (§6) | `_open_one` :156 | System |
| Being prepared | With the board | "Submit to the Board". Confirm text: "Submit this quarter to the board? You can't change it afterwards." | `action_submit` :197 | Only the reviewed employee (the MD's user) (:93-96) |
| With the board | Signed off | "Sign Off" (portal form) | POST `/my/board/md-review/<id>/sign` gives `_board_sign` :231 | The Board Reviewer. The Backup Board Reviewer can also sign once `backup_opened` is set (after 14 days). The review row is locked, so the first signer wins (:238) |
| With the board | With the board (backup opened) | Cron at 14 or more days | `_chase` :179 | System |
| Signed off | Acknowledged | "Acknowledge" (backend form) | `action_acknowledge` :217 | Only the MD |

No path back. There is no cancel, reopen or reset-to-draft.

### 3.2 Sign-off effects (:252-281)

- Per applicable line:
  - `board_value` and `board_comment` are saved.
  - An `accountability.review` is created with `actual_value` = the board value and notes "<MD>: <comment>" / "<board member>: <comment>". It is created in `pending_ack`, then `action_sign_off()` runs, and the review is linked to the line.
  - A note is posted on the target: "Signed off by X in <review>".
- "Nothing to Measure" lines: a draft review is created and marked not applicable with the stated reason.
- The MD gets the activity "Acknowledge Board Review" and an email.
- If the review had been opened to the backup, the other reviewer is told nothing more is needed.

### 3.3 Other selections

- `e.board.access.log.action`: View, Sign, Add, Edit, Delete, Search. Write-once audit data, with no workflow.
- Board Position flags on SO and PO are booleans. The reason is required when the flag is ticked (views/sale_order_views.xml:13-20).

---

## 4. Menus and views

### 4.1 Backend

| Menu path | Action | Views | What a user does |
|---|---|---|---|
| Accountability › My Performance › "Board Reviews" (seq 60, **only `group_accountability_admin`**) | `accountability_board_review_action` "Board Reviews" | list (Name, Quarter To, State badge, Signed By), form | Admins read. The MD prepares here (form "Submit to the Board", lines editable while Being prepared) and acknowledges ("Acknowledge" plus "Your Comment"). Create and delete are disabled. Empty text: "No board reviews yet. A review opens here after each quarter, once a board reviewer is named in Configuration." (views/md_review_views.xml) |
| Accountability › Organisation › Settings (admin) | AF config | form, plus group "Board Review of the Top-Level Employee" with "Board Reviewer" and "Backup Board Reviewer" | Name the board reviewers (views/md_review_accountability_views.xml:3-17) |
| Target form (AF) | – | "Request Review" hidden and "Actual" read-only when board-reviewed. Reviews list gets a "Signed by the Board" column | (md_review_accountability_views.xml:20-38) |
| Review list and form (AF) | – | "Signed by the Board" (optional, hidden by default in the list) | |
| Sales › Order form › "Other Info" tab | – | Group "Board Position Report": "Exclude from Board Position", "Exclusion Reason", "Hide from Board Portal", "Hide Reason" | Finance or Sales hide or exclude an order from the board |
| Sales order search | – | Filters "Excluded from Board Position", "Hidden from Board Portal" | |
| Purchase › Order form › "Other Information" tab (`purchase_delivery_invoice`) | – | Same group | |
| Purchase order search | – | Same filters | |
| Contacts list or form › Action › "Invite as Board Viewer" | server action, then wizard "Invite as Board Viewer" | form: "Board Members" (contacts with an email), "Personal Message (optional)", buttons "Send Invitation" / "Cancel" | Invite board members (views/board_invite_wizard_views.xml) |

No backend menu for the access log. It can only be viewed in the portal.

### 4.2 Portal

Every board page has a tab bar: "Performance", "Financial Position", "Payroll", "Profitability", "PDC Cheques", "MD Review" (only for people with reviews, with a yellow count of waiting reviews) and "Access Log" (admins only).

| URL | Shows | Who |
|---|---|---|
| `/my/board` | "E-Board" Performance: year and quarter pickers, the 5 KPI tiles, the accountability block with "As at", "Commercial Performance — Tenders & Pipeline", "Revenue — Sales Invoices", "Procurement — Purchase Invoices", "Expenses by Account" | Board Viewer or System admin. Anyone else gets 403 |
| `/my/position` | "Financial Position" snapshot: receivables against payables, by source, aging, top customers and vendors, net verdict | same |
| `/my/position/invoices?type=receivable|payable&aging=` | Outstanding invoices list with aging filter | same |
| `/my/position/orders?type=` | "Outstanding Sales Order Balance" / "Outstanding Purchase Order Balance", plus an excluded section with "Reason for Exclusion" | same |
| `/my/payroll?year=` | "Payroll" dashboard | same |
| `/my/board/profitability` (search, period, show=incomplete/ready) | Won tenders GP table | same |
| `/my/board/profitability/<tender>` | Business case detail. Commission lines show "— Confidential —". Form "Add Commission / Facilitation Line" ("Description *", "Currency", "Quantity", "Unit Amount", "Add Line"). On your own lines: "Edit", "Save Changes", "Delete" | same. Only the board member who created a commission line can edit or delete it |
| `/my/board/cheques?filter=pending|complete&view=grouped|flat` | "PDC Cheques for Signing", with a "Sign" button per cheque | same |
| POST `/my/board/cheques/<id>/sign` | Adds the user's signature (once only) | same |
| `/my/board/md-review` | "MD Review" list ("Quarterly reviews of the Managing Director's targets…") | Board Viewer (an empty list if they have no reviews), or anyone with a review to view |
| `/my/board/md-review/<id>` | Pack: per-target window, unit, target value, "Calculated by the system" / "Entered by <MD>", MD comment, "How It Was Calculated" breakdown, evidence links. Signer form: "Result (proposed X, scores Y%)", "Comment (required if you change the result)", "Sign Off" | The Board Reviewer while the review is With the board, the backup once opened, and the signer afterwards. Anyone else gets 404 |
| `/my/board/md-review/<id>/evidence/<att>` | Downloads evidence | same |
| `/my/board/access-log` | "Access Log": "Page Views Today", "Active Users Today", "Actions Taken Today", filters (user, page, action, dates), 20 per page | `base.group_system` only |
| `/my` (from tritel_portal_home) | Sends board viewers to `/my/board` ahead of tender (20) and recruitment (30) workspaces | Board Viewer |

---

## 5. Roles

| Group (xml id) | Name | What it gives |
|---|---|---|
| `e_board.group_board_viewer` | "Board Viewer" (category "E-Board") | All board portal pages. Read access to sale.order, account.move/line/account, purchase.order, crm.lead, tender.initial, res.partner, target.period, hr.payslip/line/run, hr.department, hr.employee, pdc.cheque. Read, write and create on pdc.cheque.signature (security/ir.model.access.csv). Can be named Board Reviewer if a portal user and not an employee |
| `base.group_system` | Settings / Administrator | All board pages, the Access Log, full rights on `e.board.access.log` |
| `base.group_user` | Internal User | Full rights on `board.invite.wizard`, so any internal user can open "Invite as Board Viewer" |
| `tritel_accountability_framework.group_accountability_user` | Accountability / User | Read and write on board reviews and lines. A record rule limits this to reviews where they are the reviewed employee (security/md_review_rules.xml:3-24) |
| `tritel_accountability_framework.group_accountability_admin` | Accountability / Administrator | Read every board review (rule with read only), the "Board Reviews" menu, the Board Reviewer settings |

Likely mapping (*guess*):
- Board member: Board Viewer, portal user. One of them is named Board Reviewer and one Backup.
- MD: an Accountability User, and the top-level employee.
- HR or the performance owner: Accountability Admin.
- Finance & Accounts: internal Sales or Purchase users who set the board flags on orders and send invitations.
- System admin: group_system.

| Action | Board Viewer | Board Reviewer / Backup | MD | Accountability Admin | Internal user | System admin |
|---|---|---|---|---|---|---|
| View the board pages | ✓ | ✓ | ✗* | ✗* | ✗ | ✓ |
| Sign a PDC cheque | ✓ | ✓ | – | – | – | ✓ |
| Add, edit or delete own commission line | ✓ | ✓ | – | – | – | ✓ |
| Open the MD Review list | ✓ (empty) | ✓ | – | – | – | – |
| Sign off an MD review | ✗ | ✓ (backup after 14 days) | ✗ | ✗ | ✗ | ✗ |
| Prepare and submit the MD review | ✗ | ✗ | ✓ | ✗ (read only) | ✗ | ✗ (unless sudo) |
| Acknowledge the board sign-off | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Name board reviewers | ✗ | ✗ | ✗ | ✓ | ✗ | (✓ if also Accountability Admin) |
| Set "Exclude / Hide" on SO or PO | ✗ | ✗ | (✓ if Sales or Purchase user) | – | ✓ with SO/PO write | ✓ |
| Invite a board viewer | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ |
| View the Access Log | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |

*Unless they also hold Board Viewer or group_system.

---

## 6. Automations

| What | Detail | File |
|---|---|---|
| Cron "Accountability: Board Reviews" | Runs daily and calls `_cron_board_reviews`. Opens due reviews (only if a Board Reviewer is named) and always chases | data/md_review_cron.xml, models/accountability_board_review.py:118-123 |
| Opening (`_open_due` / `_open_one`) | Quarter = the most recent finished calendar quarter. For each employee with no manager and with direct reports, and for each active accountability period overlapping the quarter, one review is created if none exists for that `date_to`. Targets included: state active, pending review or reviewed; not fully cascaded; not development-only; live during the quarter. Window = the quarter clipped to the period, or the period start to quarter end when the target's metric basis is "to date". Metric targets are calculated now and pre-filled. If nothing is included, no review is created | :126-176 |
| Example | On 1 Apr 2027 the cron opens "Q1 2027", 1 Jan to 31 Mar. A year-to-date revenue metric line covers the period start to 31 Mar | |
| On open | Activity "Prepare Board Review" for the MD (due in 7 days). Email "Prepare your board review: <name>" | :172-175, data/md_review_activity_types.xml |
| On submit | Email to the reviewer "Board review to sign off: <name>" with link "Open the review". The prepare activity is marked done | :210-214 |
| Reminder | 7 or more days after submit, once: "Reminder: board review waiting: <name>" to the reviewer | :190-193 |
| Backup | 14 or more days after submit, if a backup is set: `backup_opened`. The backup gets "Board review needs your sign-off" and the reviewer gets "Board review opened to the backup" | :183-189 |
| On sign-off | Accountability reviews are created and signed off (§3.2). Activity "Acknowledge Board Review" for the MD (due in 5 days). Email "The board has signed off: <name>". If the backup was opened, the other reviewer gets "Board review signed" | :252-281 |
| On acknowledge | Email to the signer "Board review acknowledged: <name>", including the MD comment | :217-229 |
| Reviewer change | Chatter note and email "Board reviewers changed" to old and new reviewers | accountability_extensions.py:49-63 |
| Invitation emails | Contact with an active portal user: Board Viewer added straight away, email "E-Board: Board Access Granted" ("Your board portal access is ready — <company>", button "Open Board Portal →"). Otherwise: signup token, `board_invite_pending` set, email "E-Board: Board Viewer Invitation" ("You're invited to <company> Executive Board Portal", optional personal message, button "Set up my account →", text "valid for 24 hours") | board_invite_wizard.py:19-42, data/mail_template_board_invite.xml |
| Sign-up hook | When an invited partner signs up, Board Viewer is added and the flag cleared | res_users.py:9-17 |
| Access log | Each page view and action writes `e.board.access.log` (user, page, route, action, detail, IP). Errors are ignored | e_board_controller.py:34-45 |
| Migration 16.0.1.2.0 | Open targets of the top-level employee in active periods were moved to a quarterly cadence, with a chatter note | migrations/16.0.1.2.0/post-migrate.py |

---

## 7. Validation messages

| Text | Type | File:line | When |
|---|---|---|---|
| "This is set by the review itself." | AccessError | accountability_board_review.py:61 | A user edits a protected field on a review (state, dates, signer…) |
| "This review has been submitted, so it can no longer be changed." | UserError | :64, :337 | Lines edited after Being prepared |
| "You can comment once the board has signed off." | UserError | :66 | "Your Comment" written outside Signed off |
| "Only %s can do this." | AccessError | :96 | Someone other than the MD submits or acknowledges |
| "This review has already been submitted." | UserError | :201 | Submit when not Being prepared |
| "No board reviewer is named in the accountability configuration." | UserError | :204 | Submit with no reviewer named |
| "Add your result and a comment for: <targets>" | UserError | :207 | Submit while a manual, applicable line has no comment |
| "There is no board sign-off to acknowledge." | UserError | :221 | Acknowledge when not Signed off |
| "This review has already been signed off, or is not yours to sign." | portal alert | :241 | Sign-off by the wrong person, or a second signer |
| "Enter a result for <target>." | portal alert | :246 | Empty or non-numeric result |
| "Say why you changed the result for <target>." | portal alert | :249 | Board value differs from the proposal by more than 0.005 and no comment |
| "This is set by the review itself." | AccessError | :334 | A line field other than Result, Comment or Evidence edited |
| "'<target>' comes from a metric. The board member can adjust it." | UserError | :339 | The MD edits Result on a metric or N/A line |
| "This quarter already has a board review." | SQL | :50 | Duplicate quarter |
| "<user> cannot review the top-level employee: board reviewers must be board portal users who are not employees." | ValidationError | accountability_extensions.py:33 | Reviewer or backup is internal, not Board Viewer, or linked to an employee |
| "The backup must be a different person from the board reviewer." | ValidationError | :36 | |
| "Name the board reviewer before the backup." | ValidationError | :38 | |
| "These targets are reviewed by the board each quarter. Prepare the review under Board Reviews when it opens." | UserError | :92 | "Request Review" on the MD's targets |
| "Results for these targets come from the quarterly board review." | UserError | :99 | Typing an actual value on the MD's target |
| "'<target>' is reviewed by the board each quarter." | UserError | :137 | Creating a normal review for the MD's target |
| "A review needs a reviewer or a board sign-off." | SQL | :127 | |
| HTTP 403 Forbidden | – | e_board_controller.py:550 etc.; md_review.py:22; access log :1765 | User is not a Board Viewer or admin |
| HTTP 404 | – | md_review.py:15, :61; controller :1349 | Review not viewable or evidence not found; tender missing |
| Wizard form required fields | view | sale/purchase views | "Exclusion Reason" / "Hide Reason" become required when the flag is ticked |

Portal commission and cheque actions fail without a message: they redirect back. An empty description is ignored, and an existing signature is not duplicated.

---

## 8. Cross-module touchpoints

**Accountability framework**
- "MD" means any employee with no manager and with direct reports (`_is_board_reviewed`). The code says "top-level employee". The portal calls this person "Managing Director".
- Once a Board Reviewer is named, nobody (admins included) can review, request a review for, or type results on the MD's targets. Only the board sign-off writes results. It does this by creating normal `accountability.review` records, so scores, history, snapshots and ratings work as they do for anyone else. Review lists show "Signed by the Board", and the AF portal target page shows the board signer's name.
- Reviews are per calendar quarter inside the AF period (FY), using AF cadence helpers. In migration 16.0.1.2.0 the MD's targets were moved to the quarterly cadence.
- The MD sees a "Board reviews" group in My Actions ("Prepare the quarter for the board, or acknowledge its sign-off.") for reviews in Being prepared or Signed off.
- What the board sees from AF: only organisation totals on the Performance tab (§2.3), with no names or individual scores. The full target list is visible only to the MD's own reviewer, in the MD Review pages.
- Rating boundaries and "As at" options come from AF Settings and the snapshot engine.

**Sales and purchase**
- The flags control the Financial Position report. "Exclude from Board Position" removes the order's backlog from totals but lists it under the excluded section with its reason. "Hide from Board Portal" removes the order from every position list.
- Commercial tiles use invoices and tenders (`tritel_tender_tracker`). Cheques come from `tritel_pdc`. Business cases come from the tender tracker.

**Portal home**: `tritel_portal_home` `/my` sends Board Viewers to `/my/board` (priority 10, the highest).

---

## 9. Gaps / questions for the product owner

1. **The MD has no backend menu.** "Board Reviews" is visible only to Accountability Admins. The MD's emails say "Open Board Reviews to see the results and acknowledge". The MD can only get there through the activity or My Actions. Is that intended?
2. **Anyone internal can make a board member.** `board.invite.wizard` is open to every internal user, and it grants the Board Viewer group with sudo. Should this be limited to admins or HR?
3. **Portal users get direct read access to a lot of data.** Board Viewer ACLs give read on payslips, employees, invoices, CRM and partners with no record rules, while the pages already use sudo. Is the direct model access needed?
4. **Org Score and its label use different numbers.** The Organisation Score shows the plain score, but the rating label and objective status use the pace-adjusted score. They can disagree (for example, a score of 62% labelled "Exceeds Expectations"). Train on this, or align them?
5. **Hidden orders are only hidden from position lists.** "Hide from Board Portal" applies only there. The order's invoices still count in Revenue, Total Spend and the outstanding invoice lists, and its value still counts in the Performance tab order count and value. Intended?
6. **Submit only checks the comment.** The message "Add your result and a comment" fires only when the comment is missing. A blank (0) result with a comment passes. Should a result be mandatory?
7. **Several top-level employees, or none.** Each employee with no manager and with reports gets a review. If there are none (or the MD has a manager set), no review opens and normal reviewing stays. Confirm the HR org chart setup.
8. **No way out once submitted.** There is no cancel, reopen or unsubmit. What happens if the board signs wrongly, or the MD submits by mistake?
9. **No backup means one reminder only.** If no backup is configured there is a single 7-day reminder and no escalation after that.
10. **Fallback when no tender period matches.** If no tender `target.period` overlaps the selected range, the tender stats use **all** tenders.
11. **Board members can write cost data.** Commission/facilitation lines change the business case GP, and are hidden as "— Confidential —". Who approves them? Are internal users aware?
12. **Timing is unclear.** The cron opens reviews the day after the quarter ends, with metrics calculated at that moment. Late postings after that are not picked up. Is that acceptable?
13. **Any board viewer can sign any cheque.** The cheque "Sign" button has no check that the user is an authorised signatory beyond Board Viewer. Required signatures come from `tritel_pdc`.
14. **Revenue includes tax** (`amount_total_signed`). Sales and purchase order values use untaxed amounts. Should the labels make this clear?
15. **The access log is portal-only** with no backend menu, and has no retention or clean-up rule.

---

## 10. Sources

- e_board: `__manifest__.py`, `models/{access_log,accountability_board_review,accountability_board_summary,accountability_extensions,board_invite_wizard,purchase_order,res_partner,res_users,sale_order}.py`, `controllers/{e_board_controller,md_review}.py`, `security/{security.xml,ir.model.access.csv,md_review_rules.xml}`, `data/{md_review_cron,md_review_activity_types,mail_template_board_invite}.xml`, `views/{md_review_views,md_review_accountability_views,sale_order_views,purchase_order_views,board_invite_wizard_views,portal_md_review_templates}.xml`, plus labels from `views/portal_{e_board,position,position_detail,payroll,profitability,profitability_detail,cheques,access_log}_templates.xml`, `migrations/16.0.1.2.0/post-migrate.py`.
- AF (reference only): `models/accountability_rating.py`, `accountability_target.py` (:38-60, :592-601), `accountability_target_weights.py` (:83-170), `accountability_objective.py` (:189-210), `accountability_snapshot.py` (:40-75), `accountability_exempt.py` (:105-115), `cadence.py`, `security/ir_groups.xml`, `views/menu.xml`.
- `tritel_portal_home/models/res_users.py`, `controllers/main.py`.
- Not read in full: `static/src/css/e_board.css` (styling only). The large portal templates were read for labels only. There is no `wizard/` or `report/` folder in this module.
