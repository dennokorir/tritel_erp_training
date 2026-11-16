# Discovery: Tender Tracker (`tritel_tender_tracker` 16.0.1.23.0)

Read-only code discovery for end-user training. All paths are relative to `tritel_tender_tracker/` unless stated. "The code is the truth": anything uncertain is in section 9.

---

## 1. Purpose

The Tender Tracker ("Tender Manager" app) is where Tritel's commercial team records every public tender and RFQ it considers, from first sighting to outcome. A tender moves through a fixed status path (Draft → Bidding → Evaluation → Won / Prequalified / Lost, or Dropped / Cancelled), and the status drives the board column. Around that core it runs the **bid desk** (who takes each bid, with a fair-workload check; a document readiness checklist; recording the real submission time and receipt), **bid quality** (must-win flags, a manager's quality check after submission, confirmed disqualifications with a named cause), **prequalifications** (a shortlisting that should bring RFQs), **project summaries** for won tenders (request → write → review → library → marketing pack), **customer activities** (touchpoints with customers), **market coverage** (where each customer sits on a coverage ladder), **account ownership and target accounts**, **commercial targets and achievements**, a **My Actions** to-do list, and a **portal** (`/my/...`) for the same people. The Accountability Framework, Project Delivery and the board portal read its data.

---

## 2. Models

### 2.1 Model list

| Technical name | Business name | Purpose | File |
|---|---|---|---|
| `tender.initial` | Tender | The tender/RFQ record. Extended by 12 files (workflow, bid quality, bid desk, summaries, library, marketing pack, prequal link, My Actions, auto-fill, touch strip). | models/models.py:12 |
| `tender.initial.line` | Tender Document Lines | "Documents" tab rows (name + files). | models/models.py:951 |
| `tender.stage` | Tender Stage | Board columns. 8 seeded stages (data/stages_data.xml). | models/models.py:1015 |
| `tender.tags` | Tender Tags | "Tags"; also prequalification "Categories". | models/models.py:993 |
| `tender.users` | Tender Users | Legacy contact list ("Users" config). Not used by the workflow. | models/models.py:1005 |
| `tender.response` | Tender Response Requirements | Legacy checklist ("Tender Responses" config). | models/models.py:1028 |
| `tender.minutes` / `tender.bidder` | Tender Minutes / Bidder | Opening-meeting minutes and competitor bids; feed the "Competition" tab. Menu is commented out. | models/models.py:1049, 1073 |
| `custom.mail.thread` | Custom Mail Thread | Technical; unused by UI. | models/models.py:1042 |
| `tender.lost.reason` / `tender.drop.reason` | Lost / Drop Reason | Reasons; "Disqualification" tick added. | models/tender_lost_reason.py, tender_drop_reason.py; models/bid_quality.py:75-90 |
| `tender.cancel.reason` | Tender Cancel Reason | Reasons for Cancel (4 seeded). | models/tender_workflow.py:24 |
| `tender.quality.guideline` | Bid Quality Guideline | Guidelines a bid is scored against (8 seeded). | models/bid_quality.py:49 |
| `tender.quality.line` | Bid Quality Check Line | One guideline as scored on one tender (keeps its own wording). | models/bid_quality.py:60 |
| `tender.requirement` | Standard Bid Document | Template rows for the readiness checklist (8 seeded). | models/bid_desk.py:39 |
| `tender.readiness.line` | Bid Readiness Item | One checklist document on one tender. | models/bid_desk.py:52 |
| `tender.bid.desk.member` | Full-time Bid Liaison | Who takes a full share of bids (Fair Workload). | models/bid_desk.py:134 |
| `prequalification.registration` | Prequalification | Prequalification "pipeline": validity window, RFQs logged, follow-up. Legacy `stage_id` (registration.stage) still exists. | models/prequalification_models.py:10; models/prequalification_pipeline.py:11 |
| `registration.stage` | Prequalification/Registration Stage | Legacy stages (Draft/Submitted/Qualified/Failed). | models/prequalification_models.py:87 |
| `tender.pillar` | Project Pillar | Business pillars (seed: Productivity, Connectivity). | models/project_summary.py:74 |
| `tender.summary.heading` | Project Summary Heading | Headings a summary is written under (8 seeded). | models/project_summary.py:87 |
| `tender.summary.event` | Project Summary History | Request/submit/send back/approve/reopen history. | models/project_summary.py:164 |
| `tender.summary.export` | Marketing Pack Export | Log + file of each marketing pack download. | models/summary_marketing_pack.py:42 |
| `tender.business.case` / `.line` | Tender Business Case / Line | Cost & margin case per tender; approval by Head of Commercial. | models/tender_business_case.py:7, 208 |
| `tender.portal.access.log` | Commercial Portal Access Log | Who opened which portal page. | models/tender_portal_access_log.py |
| `res.partner.activity` | Partner Activity ("Customer Activity") | A customer touch (planned or done). | models/res_partner.py:174; models/partner_activity_touchpoints.py:90 |
| `res.partner.activity.type` | Partner Activity Type | Touch types, each with a default channel. | models/res_partner.py:356; partner_activity_touchpoints.py:45 |
| `res.partner.last.seen.stages` | Partner Last Seen Stages | Buckets 1-30 … over 120 days, Never Seen. | models/res_partner.py:162 |
| `target.period` | Commercial Target Period | Quarter/period; tenders and leads are filed into one. | models/target_period.py:5 |
| `target.target` / `target.line` / `target.achievement` | Role target / individual target / achievement | Commercial targets and attribution of won tenders. | models/target.py:12, 315, 552 |
| `tritel.market.coverage` (abstract) | Market Coverage | Data service for the Market Coverage screen. | models/market_coverage.py:39 |
| `tritel.touchpoints` (abstract) | Customer Touchpoints | Data service for Customer Activities screens. | models/touchpoints.py:24 |
| `tritel.assign.owner.wizard` | Assign Account Manager | Bulk owner assignment. | models/account_ownership.py:246 |
| Extensions | `res.partner`, `hr.employee`, `crm.lead`, `sale.order`, `purchase.order`, `account.move`, `res.users`, `digest.digest`, `res.config.settings` | see below | |

Wizards (transient): `tender.move.wizard` (status moves), `lost.reason`, `drop.reason`, `tender.must.win.wizard`, `tender.quality.wizard`(+`.line`), `tender.dq.confirm.wizard`, `tender.submission.wizard`, `tenders.assign.wizard` (Assign AM / BL / Presales), `tender.summary.wizard`, `tender.summary.bulk.wizard`(+`.line`), `tender.summary.marketing.wizard`, `tender.evaluation.report.wizard`, `pipeline.report.wizard`, `res.partner.activity.wizard` / `.filter.wizard` (menus commented out).

### 2.2 Tender (`tender.initial`) – key fields

| Field | UI label | Business meaning | Ref |
|---|---|---|---|
| `ref_no` | "Ref" ("Tender Number") | Tender/document reference; required. | models.py:25 |
| `res_model` | (description box, placeholder "Tender description / scope of works…"; "Tender" in lists) | Tender title/scope. Also the record name. | tender_views.xml:290 |
| `priority` | star ("Starred") | Normal / Important. | models.py:52 |
| `partner_id` | "Customer" | Required. Onchange fills Account Manager from the customer. | models.py:36, 439 |
| `currency_id`, `expected_revenue` | "Tender Currency", "Expected Revenue" | Bid value in tender currency. | models.py:73-80 |
| `expected_revenue_cc` | shown as "≈ …" when foreign | Value converted to company currency (computed, below). | models.py:81, 460 |
| `account_manager_id` | "Account Manager" | Read-only on form; set by "Assign" or from customer. | models.py:102 |
| `bid_liaison_id` | "Bid Liaison" | Read-only; set by "Assign". | models.py:103 |
| `technical_presales_id` | "Technical Pre-sales Engineer" | Read-only; set by "Assign". | models.py:104 |
| `oem_ids`, `tag_ids` | "OEMs", "Tags" | OEM list comes from crm_tender (`crm.oem`). | models.py:60-61 |
| `crm_lead_id` | "Source/Pipeline" | The CRM opportunity it came from (only same customer). | models.py:105; tender_views.xml:337 |
| `prequalification_id` | "From Prequalification" | Set when logged as an RFQ under a prequalification. | prequalification_pipeline.py:106 |
| `validity_period` | "Validity Period (Days)" | Tender Info tab. | models.py:28 |
| `submission_deadline` | "Submission Deadline" | Tender Info tab, **editable there**. (Also appears read-only on Bid Readiness and Bid Quality tabs – per brief this is a read-only copy; treat as editable only on Tender Info.) | models.py:29 |
| `opening_date` | "Tender Opening Date" | | models.py:30 |
| `award_date` | "Award Date" | Visible when Won/Prequalified; required to mark Won. | models.py:145 |
| `period_id` | "Period" | Computed (below). | models.py:184 |
| `bid_bond_required` | "Bid Bond Required" | Adds Bid bond to checklist; +1 effort point. Not on any backend view; shown read-only on the portal only – see Gaps. | models.py:32 |
| `kanban_state` | "Status" | The tender status (section 3). | models.py:63 |
| `stage_id` | "Stage" | Board column, computed from Status. | tender_workflow.py:37 |
| `lost_reason_id`/`lost_reason_feedback`, `drop_reason_id`/`drop_reason_feedback`, `cancel_reason_id`/`cancel_note` | "Lost Reason", "Drop Reason"/"Drop Reason Feedback", "Cancel Reason"/"Cancel Note" | Closing reasons. | models.py:40-47; tender_workflow.py:40-41 |
| `closed_from` | "Closed From" | Status a Dropped/Cancelled tender was in (for Reopen). | tender_workflow.py:38 |
| `line_ids` | "Documents" tab | Uploaded tender documents. | models.py:96 |
| `sale_order_ids`, `purchase_order_ids`, `customer_invoice_ids`, `vendor_bill_ids` | smart buttons "Sales", "Purchases", "Invoices", "Bills" | Linked SO/PO/invoices. SO/PO tags shown only when Won. | models.py:108-143 |
| `achievement_ids` | "Target Achievements" tab | Attribution lines (Won/Prequalified only). | models.py:146 |
| `project_summary` | "Project Summary" tab | HTML summary (Won only). | models.py:144 |
| `channel_id` | "Channel" (chatter) | Discuss channel that mirrors tender messages. | models.py:37, 899-920 |

Bid quality / bid desk / summary fields are listed in 2.4–2.6.

### 2.3 Computed fields on the tender – exact logic

| Field (label) | What it calculates | Worked example | Ref |
|---|---|---|---|
| `expected_revenue_cc` "Expected Revenue (CC)" | Expected Revenue converted from tender currency to company currency at the rate on Award Date, else Submission Deadline date, else today. | USD 10,000; award date 1 Mar; rate 1 USD = 130 KES on 1 Mar → KES 1,300,000. | models.py:460-475 |
| `is_foreign_currency` | Tender currency ≠ company currency → shows "≈ …". | | models.py:477 |
| `period_id` "Period" | The `target.period` whose From–To covers: Award Date, else Submission Deadline date, else creation date. Empty if no period covers it. | Award date 15 Feb 2026, period "Q1 2026" 1 Jan–31 Mar → Period = Q1 2026. No award, deadline 3 Apr → Q2 2026. | models.py:243-253; target_period.py:73 |
| `kanban_urgency` "Urgency" | Won/Prequalified: Warning if an attribution is pending, else OK. Evaluation/Lost/Cancelled/Dropped: OK. Draft/Bidding with deadline: Critical if ≤7 days to deadline, Warning if ≤21, else OK. Draft/Bidding without deadline: Warning. | Bidding, deadline in 5 days → Critical; in 15 → Warning; in 30 → OK. | models.py:213-241 |
| `am_attributed` / `bl_attributed` / `tp_attributed` | An achievement line exists for that role. | | models.py:193-203 |
| `hoc_attribution_pending` "HoC Attribution Pending" | Status Won AND (AM set but no AM line OR BL set but no BL line). Prequalified does not count. | | models.py:204-208 |
| `hoch_attribution_pending` "HoCh Attribution Pending" | Status Won AND Presales set but no Presales line. | | models.py:209-211 |
| `res_partner_activity_count` "Activities" | Count of linked customer activities in state Done. | | models.py:364 |
| `lot_bid_amount_ids` "Competition" | From Tender Minutes: bid amounts summed per (firm, lot), shown as a firm × lot matrix. | | models.py:922-948 |
| `can_reopen` | User is Administrator and a reopen target exists. | | tender_workflow.py:50-55 |
| `submitted_late` "Submitted Late" | Actual Submission > Submission Deadline (both datetimes). | Deadline 10 Mar 10:00, actual 10 Mar 10:30 → Yes. Actual 09:45 → No. | bid_quality.py:138-143 |
| `quality_is_overdue` | Quality Check = To Score and due date < today. | | bid_quality.py:145-150 |
| `must_win_badge` "Priority" | "Must-Win" text when flagged (list badge). | | bid_quality.py:133 |
| `bid_can_score` / `bid_can_confirm` | User is the quality scorer / DQ confirmer (2.4). | | bid_quality.py:152-158 |
| `readiness_progress` "Progress" | "X of Y ready" where Y = checklist lines not marked Not Needed, X = those with status Ready. Not a percentage. | 8 lines, 1 Not Needed, 5 Ready, 2 Missing → "5 of 7 ready". | bid_desk.py:174-179 |
| `bd_can_readiness` | User is Bid Liaison, Bid Liaison's manager (`parent_id`), or Tender Administrator. | | bid_desk.py:182-187, 200-205 |
| `bd_can_record` | Actual Submission set AND user in the above set AND (submission not yet recorded OR user is not the Bid Liaison) – i.e. once recorded only the manager/admin can re-record. | | bid_desk.py:188-189 |
| `prequalification_count` | Prequalifications created from this tender. | | prequalification_pipeline.py:110 |
| Summary computes | see 2.6 | | |

### 2.4 Bid quality (on the tender) – models/bid_quality.py

Fields: "Must-Win" `is_must_win`, "Why Must-Win", "Flagged By", "Flagged On"; "Actual Submission" `submitted_on`; "Quality Check" `quality_state` (Not Due / To Score / Scored); "Quality Check Due"; "Quality Score (%)"; "Scored By"; "Scored On"; "Quality Check Note"; "Guidelines" lines; "Disqualification" `dq_state` (None / To Confirm / Confirmed); "Caused By" `dq_cause` (Bid Liaison, Technical Presales, Account Manager, OEM or supplier, Client, Other); "Evidence"; "Recorded By"; "Recorded On"; "Confirm By"; "Confirmed By"; "Confirmed On" (lines 96-131). All of these are protected: a direct edit raises the AccessError at line 181; only the buttons change them.

| Rule | Logic | Ref |
|---|---|---|
| When quality check starts | First move to Evaluation: Actual Submission = now (if empty), Quality Check = To Score, due = today + 10 days. | 191-199 |
| Who scores | Bid Liaison's manager (employee `parent_id` user); if none usable, Head of Commercial users; then Administrators. Never the Bid Liaison themself; only active internal users. | 209-221 |
| **Quality Score (%)** | met ÷ (guidelines not "Not applicable") × 100, rounded to 1 decimal. At least one guideline must apply. | 323-327 |
| Worked example | 8 guidelines: 6 Met, 1 Not met, 1 Not applicable → 6 ÷ 7 = **85.7%**. | |
| Who confirms a disqualification | Cause = Technical Presales → presales person's manager; otherwise Bid Liaison's manager (fallback HoC, then Admins), never the person at fault. If the confirmer changes the cause to someone another manager answers for, it is re-routed and stays To Confirm. | 223-237, 378-404 |
| DQ reset | Any later status other than Lost/Dropped clears the disqualification (logged). | 200-206 |
| Must-win | Only Head of Commercial / Administrator (FLAG_GROUPS). `MUST_WIN_LOCKS_AFTER_SUBMISSION = False`: currently can be flagged at any status; emails only go out while Draft/Bidding. | 22-25, 257-300 |

**Bid Quality Score (Accountability Framework, not this module)** – `tritel_accountability_framework/models/metric_hook_bid_quality.py:23-140`: per tender score = Quality Score, or 0% for a confirmed disqualification caused by the Bid Liaison (counted in the quarter it was confirmed); weight 3 if must-win else 1; unscored bids left out; result = Σ(score × weight) ÷ Σ weight. Example: A must-win 90% (×3 = 270), B 80% (×1 = 80), C confirmed DQ caused by BL 0% (×1 = 0) → 350 ÷ 5 = **70.0%**. "Bid Compliance (Technical Presales)" is the same with every non-fault bid at 100%.

### 2.5 Bid desk – models/bid_desk.py

Fields on tender: "Readiness" `readiness_state` (Not Started / In Progress / Confirmed Ready), "Confirmed Ready On", "Confirmed By", "Checklist" lines, "Submission Recorded", "Recorded By", "Recorded On", "Submission Receipt", "Bid Decision Made" `decision_on`, "Why Assigned Despite Load" `assignment_reason`, hidden `bid_desk_tracked` (True for tenders created after install, line 191-195), `must_win_in_time` (lines 149-172).

Checklist line ("Document", "Prepared By" = Bid Liaison / Technical Presales, "Document Files", "Valid Until", "Not Needed", "Status"):

| Status | Rule (lines 70-81) |
|---|---|
| Not Needed | "Not Needed" ticked |
| Missing | no file, or document has expiry but "Valid Until" empty |
| Expired | has expiry and Valid Until < deadline date (Nairobi time) |
| Ready | otherwise |

Checklist built on move to Bidding (or "Create Checklist"): one line per active Standard Bid Document not already present; "Bid bond" only when Bid Bond Required (lines 217-232). "Confirm Ready" re-adds bid bond if now required and refuses while any line is Missing/Expired (244-259).

**Effort points (workload)** per tender (lines 317-329): Cancelled = 0; else base 1 (Dropped = 0.5); +1 if captured less than 7 days before the deadline (deadline − creation); +1 if Bid Bond Required; +2 if must-win flagged before submission.
Example: tender created 5 days before deadline, bid bond required, flagged must-win while Bidding → 1 + 1 + 1 + 2 = **5 points**.

**Fair Workload screen (Assign Bid Liaison)** (lines 367-404; wizard wizards/bid_desk_wizards.py:28-67): for the current calendar quarter (Nairobi), for each "Bid Desk Team" member with "Full-time on Bids": points = Σ effort points of their non-cancelled tenders with a submission deadline in the quarter; "Open now" = their Draft/Bidding tenders; clash = another of their open tenders with a deadline within 3 days of this one. Team average = (Σ points + this tender's points) ÷ number of members; "Over fair share" if (their points + this tender's points, unless already assigned) > average × 1.15. "Suggested" = lowest points (then fewest open) among those neither over nor clashing. Choosing someone over/clashing makes "Why This Person?" required and is logged.
Example: A 6, B 4, C 2 points, new tender 2 points → average (12+2)/3 = 4.67, limit 5.37. A → 8 (over), B → 6 (over), C → 4 (OK) → C "Suggested" if no clash.

### 2.6 Project summary – models/project_summary.py

Fields: "Summary Status" `summary_state`, "Summary Writer", "Summary Requested By/On", "Summary Due", "Summary Submitted On", "Review Due", "Reviewer's Note", "Summary Approved By/On", "Customer Naming" (Can be named / Anonymise / Not yet asked), "Primary Pillar", "Secondary Pillars", "Tritel's Role" (Prime contractor / Subcontractor / Partner), "Motion" (Project / Channel), "History" (lines 188-236).

| Computed | Logic | Example | Ref |
|---|---|---|---|
| "Next Deadline" | In review → Review Due; Writing/Changes requested → Summary Due; else empty. | | 243-251 |
| "Summary Overdue" / "Days Waiting" | Next Deadline < today; days since Submitted On (in review) or Requested On (writing/changes). | | 253-261 |
| "Headings Filled" / "Headings Required" / "Headings" / "Progress" | Required headings with content ÷ required headings. Pillars heading counts when Primary Pillar set; Tritel's role heading when Role AND Motion set; others when the text under the heading has any letter/digit. | 8 required headings, 6 filled → "6 of 8", 75%. | 268-291 |
| "Award Year" | Year of Award Date. | | 263 |
| "Sector" | Customer's Industry. | | 232 |
| rights | manager = Administrator / Head of Commercial / Head of Channel; can edit = assigned writer while Writing/Changes; can review = manager who is not the writer. | | 317-327, 746-751 |

Due defaults: writing 7 days, review 5 days (lines 14-15).

### 2.7 Customer activities and coverage

`res.partner.activity` fields (res_partner.py:181-214; partner_activity_touchpoints.py:93-110): Name, Feedback, Date, Customer, Account Manager, Responsible ("Person making the touch"), Type (required), State "Planned"/"Done", "Tender", "Lead/Pipeline", "Related Target Achievement", "Valid", "Validity Note", "Activity Phase", "Participant Role", "Channel", "Touch Phase", "Entered Late", "Overdue Plan".

| Computed | Logic | Ref |
|---|---|---|
| "Valid" / "Validity Note" / "Activity Phase" (used for target attribution) | Not linked → invalid "Not linked to a pipeline or tender". Pipeline: invalid if logged (create date) before the opportunity was created, else valid "Pipelining". Tender: invalid if logged before tender created or after award date; else "Bid Submission Support" if logged on/before deadline date, otherwise "Post-Submission Influence". Uses the **entry (create) date**, not the touch date. | res_partner.py:216-285 |
| "Participant Role" | AM / Presales / Bid Liaison if the responsible user holds that role on the linked tender/opportunity; else from job title keywords (director/chief/head of… → Leadership; presales/engineer/solution/architect → Presales; account manager/sales/BD → AM; bid/tender → Bid Liaison); else from Tender Tracker group; else Other. | partner_activity_touchpoints.py:113-158 |
| "Channel" | From the activity type's channel (types get a channel guessed from their name). | 37-66, 161-164 |
| "Touch Phase" (by **touch date**) | No tender/lead → Account-level; lead only → Pipelining; tender: after award → Delivery & Collection (if Won) else Post-submission; before tender created → Pipelining; after deadline → Post-submission; otherwise Bid Support. | 166-193 |
| "Entered Late" | Entered more than 7 days after the touch date. | 83, 173 |
| "Overdue Plan" | Planned and date < today. | 196-205 |

Marking Done (`set_done`, "Mark as Done") posts the feedback on the tender/opportunity chatter; saving Done requires a date not in the future and updates the customer's Last Seen (res_partner.py:291-342).

**Coverage ladder** (`res.partner.coverage_rung` "Coverage", market_coverage.py:4-11, 140-156, 387-396). Facts per customer from all tenders, all opportunities (including archived) and Done touches. Highest rung that applies:

| Rung | Rule |
|---|---|
| Anchor | 2+ wins (Won tenders + opportunities in a Won CRM stage) |
| Named | exactly 1 win |
| Prequalified | a Prequalified tender, no win |
| In play | an open tender (Draft/Bidding/Evaluation) or an open opportunity (first three CRM stages, active) |
| Contested | a Lost tender, or an opportunity neither won nor open |
| Engaged | only Dropped/Cancelled tenders, raw leads, or Done touches |
| Untouched | has an Account Manager, nothing else |

Example: customer with 1 Won tender and 1 Lost tender → Named. Customer with a Lost tender and an open Bidding tender → In play.
Market Coverage KPIs (lines 249-268): Reached = rung ≠ Untouched; Named share = (Anchor+Named) ÷ Reached × 100; "Win rate" uses wins ÷ decided (won + lost). Market measured against "Engaged customers + assigned accounts" or "Target accounts" (Settings, target_accounts.py:184-190).

**Account ownership** (account_ownership.py): "Needs Owner" = engaged (tender, opportunity or Done touch) and no Account Manager; "Suggested Owner"/"Why": the single active AM on its deals, else the most recent of several, else (if deals only by archived AMs) none "Previous account manager archived", else the AM who made most touches (lines 81-97). Saving a tender/opportunity for an unowned customer sets the customer's AM from the deal (271-311). Changing a customer's AM also re-assigns its Draft/Bidding tenders, planned touches and open opportunities (res_partner.py:44-55).

**Role cards** (hr_employee_roles.py:15-31, 89-108): an employee is listed as AM / Bid Liaison / Presales if they hold that role on a tender or opportunity created in the last 24 months, or (AM) own a customer, or are in the role's group. Cards count open/24-month/won tenders and opportunities, customers, "Named Share (%)" = customers won ÷ customers bid on as AM (lines 182-190), touches in 90 days, overdue planned touches.

### 2.8 Targets (brief)

`target.line` "Achievement (%)" = Achieved ÷ Target × 100 (cap 999.9); state Exceeded ≥100, On Track ≥75, At Risk ≥50, else Behind (target.py:486-503; same bands on `target.target`, 186-198). Achievement line: Gross Value = tender Expected Revenue (CC) split equally among lines of the same role on the tender; "% Achievement" = Pipelining + Bid Submission Support + Post-Submission Influence points, each capped by role (AM 40/20/40, BL 0/60/40, Presales 60/40/0); auto-score per stage = min(valid activities in that phase ÷ 3, 1) × ceiling; Achieved Value = Gross × % ÷ 100 (target.py:599-628, 682-742, 794-840). Example: AM, tender KES 1,000,000, 2 valid Pipelining, 3 Bid Support, 0 Post-submission → 26.7 + 20 + 0 = 46.7% → KES 467,000.

---

## 3. Workflows

### 3.1 Tender status (`kanban_state` "Status") and board column (`stage_id`)

Values: Draft, Bidding, Evaluation, Won, Prequalified, Lost, Cancelled, Dropped (models.py:63-72). Status is the only source of truth; the column is computed from it via stage xml ids (tender_workflow.py:1-6, 44-59). Direct edits of Status are refused ("Use the buttons on the tender to change its status.", line 152). Header statusbar shows Draft, Bidding, Evaluation (tender_views.xml:254).

| From → To | Button (form) | Method | Who (button groups / checks) | Extra requirements / side effects |
|---|---|---|---|---|
| Draft → Bidding | "Confirm Bid" | `action_confirm_tender_bid` (tender_workflow.py:216) | Any internal user (no groups) | Legacy check: Bid Liaison and Technical Presales must be assigned unless Administrator (models.py:329-332). Records "Bid Decision Made"; builds readiness checklist (bid_desk.py:208-215). Board drag Draft→Bidding also works (only "simple" move). |
| Bidding → Evaluation | "Mark Submitted" (wizard "Mark Submitted": "Actually Submitted" required, "Submission Receipt", "Note") | `action_open_move_wizard` ctx move_target=evaluation → `tender.move.wizard.action_apply` | Visible only if `bd_can_readiness`; enforced: Bid Liaison, BL's manager or Administrator (tender_workflow.py:106-107) | Submission time not in future. Quality check → To Score, due +10 days. With receipt: submission recorded. Closes nomination to-dos. |
| Evaluation → Won | "Won" (wizard "Mark as Won": "Award Date" required) | same, target won | Any internal user | CRM opportunity set Won; nomination to-dos closed; "Tender Won/Prequalified alert" email; project summary to-dos resume if any. |
| Evaluation → Prequalified | "Prequalified" (wizard "Mark as Prequalified": "Valid From", "Valid Until", "Categories") | same; `action_set_prequalified` | Any internal user | Creates a Prequalification (Active, follow-up in 30 days; "Dates Unknown" if dates missing); opportunity set Won; won email. |
| Evaluation → Lost | "Lost" (wizard: "Tender lost reason", "Closing Note", and if reason is a disqualification "Caused By" + "Evidence") | `lost.reason.action_lost_reason_apply` → `action_set_lost` | Any internal user | Opportunity set Lost (moved to CRM "Lost" stage); lost email; DQ recorded To Confirm. |
| Draft/Bidding → Dropped | "Drop" (wizard: "Tender drop reason", "Closing Note", DQ fields) | `drop.reason.action_drop_reason_apply` → `action_set_drop` | Any internal user | Closed From stored; drop email; "Bid Decision Made" stamped if empty. |
| Draft/Bidding/Evaluation → Cancelled | "Cancel" (wizard "Cancel Tender": "Why Cancelled" required, "Note") | move wizard, target cancelled | Any internal user | Closed From stored; nomination to-dos closed. No email. |
| Reopen (one step back) | "Reopen" (wizard "Reopen Tender": "Reason" required) | `action_open_move_wizard` ctx move_reopen | Administrator only (button `can_reopen`; check tender_workflow.py:95-96) | Won/Prequalified/Lost → Evaluation; Dropped/Cancelled → status it was closed from (default Bidding/Evaluation); Evaluation → Bidding; Bidding → Draft. CRM opportunity not reopened (logged). |
| Prequalified → (RFQ) | "Log RFQ" | `action_log_rfq` | Any | Opens a new tender pre-filled from the prequalification. |

Board drag-and-drop (static/src/js/tender_board_moves.js → `action_board_move`, tender_workflow.py:171-190): moves to Lost/Dropped open the reason pop-up; Evaluation/Won/Prequalified/Cancelled open the move wizard; backward drags only for Administrators (as Reopen). Delete: Administrator only (models.py:444-450).

Legacy guard still active underneath (models.py:326-354): non-admins cannot change Prequalified/Cancelled/Dropped tenders' status and Won can only go to Prequalified.

### 3.2 Other state fields

| Model.field (label) | Values | Transitions | Who |
|---|---|---|---|
| tender `readiness_state` ("Readiness") | Not Started → In Progress → Confirmed Ready | Auto on Bidding or "Create Checklist" → In Progress; "Confirm Ready" (all lines Ready/Not Needed) → Confirmed Ready; "Reopen" → In Progress | BL, BL's manager, Administrator (bid_desk.py:234-269). Line edits: also the person preparing that document (Presales for Presales rows), only while not confirmed (83-94). |
| tender `submission_confirmed` ("Submission Recorded") | False → True | "Add Receipt" (Bid Quality tab) / Mark Submitted with receipt; receipt required | `bd_can_record` (BL/manager/admin; BL can't re-record) (272-294) |
| tender `quality_state` ("Quality Check") | Not Due → To Score → Scored | Auto at Evaluation; "Score Bid" / "Change Score" (wizard "Bid Quality Check": "Actual Submission", guideline results Met / Not met / Not applicable, note, "Save Score") | BL's manager (fallback HoC, Admin) (303-342) |
| tender `dq_state` ("Disqualification") | None → To Confirm → Confirmed | Lost/Drop with a Disqualification reason → To Confirm (due +7 days); "Confirm Cause" (wizard "Confirm Disqualification": "Caused By", note) → Confirmed; leaving Lost/Dropped → None | Confirmer per 2.4 |
| tender `is_must_win` | flag on/off | "Flag Must-Win" / "Remove Must-Win" (wizard: reason required) | Head of Commercial, Administrator (button groups + check) |
| tender `summary_state` ("Summary Status") | Not requested → Writing → In review → Changes requested → Writing… → Complete | see 3.3 | |
| `prequalification.registration.pq_state` ("Status") | Applied, Active, Expired, Renewed, Closed (default Active) | Statusbar is clickable (any user); cron Active → Expired after Valid Until | Any internal user (no checks) |
| `prequalification.registration.stage_id` (legacy) | Draft, Submitted, Qualified, Failed | Not shown in new views | — |
| `tender.business.case.state` ("Status") | Draft → Submitted → Approved / Rejected; → Draft | "Submit for Review" (anyone), "Approve"/"Reject" (button groups HoC, Admin; Reject needs "Rejection Reason"), "Reset to Draft" (Admin) | tender_business_case.py:165-197; views/tender_business_case_views.xml:13-25 |
| `target.period.state` ("State") | Draft → Active → Closed → Draft | "Set Active", "Close Period", "Reset to Draft" | No groups (target_period_views.xml:34-41) |
| `res.partner.activity.state` | Planned → Done | "Mark as Done" / screen "complete" | Any internal user (within scope on screen) |
| crm.lead stage | — | Leaving the first three stages (except to "Lost") requires a Technical Presales (crm_lead.py:62-71); moving to "Lost" clears presales nomination to-dos (181-204) | |
| `res.partner` target account | proposed → target (tier Strategic/Growth/Maintain) / declined | "Propose as Target" (anyone); "Approve", "Decline", "Target: …" tiers, "Apply Suggested Sector" | HoC, Admin (target_accounts.py:114-181) |

### 3.3 Project summary transitions

| From → To | Button (backend workspace / portal) | Method | Who |
|---|---|---|---|
| Not requested → Writing | "Request summary" (wizard: "Writer" default = tender's Presales user, "Due" default +7) / "Request summaries" bulk from Summary Tracker list | `action_summary_request` (479-517), bulk wizard | Manager (Admin/HoC/HoCh); tender must be Won |
| Writing/Changes → same (new writer/date) | "Reassign" | `action_summary_request` | Manager |
| Writing/Changes → In review | "Submit for review" | `action_summary_submit` (519-537) | Assigned writer only; needs Primary Pillar, Tritel's role, Motion and content under every required heading |
| In review → Changes requested | "Send back" (note "What needs to change" required) | `action_summary_send_back` (539-556) | Manager who is not the writer |
| In review → Complete | "Approve" (choose "Customer naming") | `action_summary_approve` (558-576) | Manager who is not the writer |
| Complete → Writing | "Reopen" (confirm: leaves the library) | `action_summary_reopen` (578-594) | Manager who is not the writer |
| any open → (nudge) | "Remind" (My Actions, waiting items) | `action_summary_remind` (646-660) | Manager |

Tender leaving Won pauses the summary to-dos (text kept); returning to Won resumes them and emails whoever it waits on (596-602).

---

## 4. Menus, views, client actions, portal

### 4.1 Backend menus (root "Tender Manager", menu.xml)

| Menu path | Action → model / tag | Views | What the user does | Groups |
|---|---|---|---|---|
| Tender Manager › Tenders › All Tenders | `action_tender` → tender.initial | kanban, list, form, calendar, pivot, graph | Main board (columns = statuses, period filter bar defaults to active period, column summaries); open/create tenders; filters "My …", "Bidding", "Under Evaluation", "Won", "Must-Win", "Quality Check To Score", "Disqualification To Confirm", "Not Confirmed Ready", "Submission Not Recorded", summary filters, attribution-pending filters | all internal |
| … › Tenders › Prequalifications | `action_prequalification_pipeline` | kanban (by Status), list, form | Track prequalification windows, "Log RFQ", see RFQs/Bids/Won/Value Won | all |
| … › Tenders › Summary Tracker | server action → `action_open_summary_tracker` | list, kanban, calendar, pivot, graph, workspace form | Managers: all Won tenders; others: summaries they write. "Request summaries" bulk button (managers) | all (domain by role) |
| … › Tenders › Project Summaries | client action `tritel_tender_summary_library` | OWL screen: Gallery, Reader, Pillar × sector, Timeline, Reference finder; "Export for Marketing" | Browse Complete summaries, copy text, find references | Library group + 6 tender role groups |
| … › Tenders › Export for Marketing | wizard `tender.summary.marketing.wizard` | form | Filter Complete summaries (pillars, sectors, OEMs, years, role, motion, naming), preview, "Download pack (.md)", "Save as default brief" (Admin) | same 7 groups |
| … › Tenders › Marketing Exports | `tender.summary.export` | list, form | Past downloads (own; Admins see all) | same 7 groups |
| Tender Manager › My Actions | client action `tritel_tender_my_actions` | OWL: To do / Waiting on others | Work through own to-dos (section 6) | all |
| Tender Manager › Tender Customers › Customer Activities | client `tritel_touchpoints` | OWL workspace tabs Customers (heatmap), People (profiles), Planned; quick Log/Plan forms; list fallback | Log/plan touches, see coverage of customers | all (data scoped, 4.4) |
| … › Account Managers / Bid Liaisons / Technical Presales | `hr.employee` kanban (role cards) | kanban | Role cards with clickable counts (open/24-month/won tenders & opportunities, customers, touches, planned overdue, coverage) – the "role menus" | all |
| … › Market Coverage | client `tritel_market_coverage` | OWL tabs Overview, Accounts, Sectors, Share of account, Account managers | Coverage ladder, KPIs, filters by period/AM/sector | all (scoped) |
| … › Account Ownership | res.partner list (filter Needs Owner) | list | "Accept Suggestion", "Assign To…", "Mark as Company" (HoC/Admin), "Claim for Me" (AMs), merge look-alikes | all; buttons limited |
| … › Classify Accounts | res.partner list (in addressable market, Unclassified) | list | "Apply Suggested Sector", "Target: Strategic/Growth/Maintain", "Approve Proposed", "Decline Proposed" (HoC/Admin), "Propose as Target" | all; buttons limited |
| … › Customers | `action_tender_customers` res.partner | kanban, list, form | Customer records with tenders, activities, coverage filters | all |
| Tender Manager › Commercial Targets › Dashboard | `target.target` | kanban, list, form | Role targets | all |
| … › Manage Individual Targets | `target.line` | kanban, list, form | Individual targets | all |
| … › Target Achievements | `target.achievement` | list, form | Attribution lines, "compute related activities" | all |
| Tender Manager › Reporting › Tender Follow Up Report | wizard → PDF | form | Tenders by status (default Evaluation) with activity updates in a date range | all |
| CRM › Reporting › Pipeline Follow Up Report | wizard → PDF | form | Opportunities by stage with activity updates | CRM users |
| Tender Manager › Configuration › Users / Stages / Tags / Lost Reasons / Drop Reasons / Cancel Reasons / Tender Responses / Applications' Stages / Target Periods / Customer Tags / Activity Types / Last Seen Stages | respective models | list/form | Reference data | all internal (ACL-limited; Cancel Reasons write = HoC/Admin) |
| … › Configuration › Pillars, Summary Headings | tender.pillar, tender.summary.heading | list | Edit pillars/headings (headings can't be deleted, only switched off) | Admin, HoC, HoCh |
| … › Configuration › Bid Quality Guidelines, Standard Bid Documents, Bid Desk Team | guideline / requirement / bid desk member | editable list | Maintain guidelines, checklist template, full-time bid liaisons | HoC, Admin |

Also: crm_tender places its Compliance menus under Tender Manager (see crm_tender.md G1). Settings: "Market Coverage measures against" (res.config.settings). Hidden actions without menu: "Tenders for bid Liaison", Named/Touched Customers (kept for old links).

Tender form tabs: "Tender Info", "Documents", "Competition", "Bid Readiness" (when Bidding or checklist exists), "Bid Quality" (when must-win, submitted, or DQ), "Tender Lost Reason" (Lost), "Drop Reason" (Dropped), "Project Summary" (Won; "Open summary workspace"), "Target Achievements" (Won/Prequalified). Smart buttons: Pipeline, Activities, Sales, Purchases, Invoices, Bills, Business Case, Prequalification, plus Delivery buttons from tritel_project_delivery. Touch strip widget on tender and opportunity forms (partner_activity_touchpoints_views.xml:189-210).

### 4.2 Portal (`controllers/portal_tender.py`)

| URL | Shows | Who can open |
|---|---|---|
| `/my/dashboard` (306) | Commercial dashboard by persona (counts, targets, pipeline). Landing page for tender roles (models/portal_home.py) | users linked to an employee, else error |
| `/my/dashboard2` (1132) | Performance dashboard | Administrator only (others redirected) |
| `/my/tenders` (1311) | Tender list with status groups, period and AM/BL/Presales filters | employee-linked; hierarchy domain (4.4) |
| `/my/tenders/<id>` (1546) | Tender detail, activities, summary panel | in hierarchy, or summary writer, or manager on a Won tender |
| `/my/summaries` (1738) | Summary tracker tiles by status | internal users (managers all Won; others own) |
| `/my/summaries/<id>` (1624) | Summary workspace (write, submit, request, approve, send back, reopen via POST `/my/tenders/<id>/summary`, 1639) | writer, managers; once Complete also Library group / tender roles in scope |
| `/my/summaries/library` (1694) | Library: gallery, map, timeline, finder | Library group, managers, Admin (all); tender roles (own scope) |
| `/my/actions` (1683) | My Actions | internal users |
| `/my/targets` (1763), `/my/achievements` (2047) | Targets and achievements by period/person | employee-linked |
| `/my/pipeline`, `/my/pipeline/<id>` (2215, 2431) | CRM opportunities by persona | employee-linked; 404 outside scope |
| `/my/customers` (2463) | Customer performance with period comparison | employee-linked |
| `/my/access-log` (2791) | Portal access log | Administrator only |
| `/my/dashboard/counters` (2952) | JSON badge counts | logged in |

Every visit is logged to `tender.portal.access.log` (`_log_portal_visit`, line 290).

### 4.3 Client actions / widgets (static/src)

`tritel_tender_my_actions`, `tritel_tender_summary_library`, `tritel_touchpoints`, `tritel_touchpoints_timeline` (customer "Touchpoints" smart button), `tritel_market_coverage`; field widgets `tender_desc`, `touch_strip`; view `summary_tracker_calendar`; patches for tender kanban period bar, CRM period bar, column summaries, board moves.

### 4.4 Visibility scopes (who sees which records)

- Backend: **no record rules for internal users on tenders**; ACL gives every internal user read/write/create on `tender.initial` (no delete) (security/ir.model.access.csv line 2). Portal-group rules are `[(1,'=',1)]` (security.xml:71-146).
- Portal hierarchy (`_get_user_hierarchy_domain`, controller 39-87): tenders where AM, BL or Presales is in the viewable set: self; Head of Channel + all Presales-group employees; Head of Commercial + all AM and BL-group employees; Administrator: everyone.
- Pipeline (229-276): Admin/HoC/HoCh all opportunities; AM own (AM or salesperson); Presales where presales; BL where linked tenders have them as BL.
- Customer Activities / Market Coverage (touchpoints.py:31-46): HoC, Administrator, HR Manager see all; others see their own touches and those of everyone below them in the employee hierarchy (and those teams' accounts).

---

## 5. Roles

### 5.1 Groups (security/security.xml; category "Tender Tracker")

| XML id | Display name | Likely department | Main powers |
|---|---|---|---|
| `group_account_manager` | Account Manager | Commercial | Listed as AM; claim unowned customers ("Claim for Me" needs AM role); propose target accounts; portal sees own tenders/opportunities; library + export. |
| `group_bid_liaison` | Bid Liaison | Commercial (bid desk) – guess | When BL on a tender: run readiness checklist, "Mark Submitted", record receipt. |
| `group_technical_presales` | Technical Pre-sales | Channel – guess (Head of Channel nominates/attributes presales) | Prepare Presales checklist rows; default summary writer; library. |
| `group_channel_manager` | Head of Channel | Channel | Assign Account Manager and Technical Presales (tender + opportunity); summary manager; pillars/headings; attribute presales achievements; nomination to-dos. |
| `group_hod_commercial` | Head of Commercial | Commercial | Assign Bid Liaison; must-win; fallback quality scorer/DQ confirmer; business case approve/reject; account ownership & target accounts; bid desk config; summary manager; full touchpoint scope. |
| `group_administrator` | Administrator | Commercial operations / system owner – guess | Everything above, Reopen/move back, delete tenders, skip legacy nomination checks, save marketing brief, see all exports, access log. |
| `group_summary_library` | Project Summary Library | Marketing – guess (not one of the five listed departments) | Read Complete summaries (library, export). Implies internal user. |
| `group_tender_portal_user` | Tender Tracker Portal User | any | Read-only rules on tenders/targets/achievements/activities/business cases. |
| (external) `hr.group_hr_manager` | HR Manager | HR | Full scope on Customer Activities / Market Coverage (touchpoints.py:17-21). |

Finance & Accounts: no dedicated group; they meet the tender only through `tender_id` on invoices/bills/SO/PO (account_move.py, sale_order.py, purchase.py) and Project Delivery.

### 5.2 Groups × actions matrix

Legend: ✔ allowed; (c) conditional on being the named person/manager; – not allowed; "all" = any internal user.

| Action | AM | BL | Presales | HoCh | HoC | Admin |
|---|---|---|---|---|---|---|
| Create/edit tender fields | all | all | all | all | all | all |
| Delete tender | – | – | – | – | – | ✔ |
| Assign Account Manager / Technical Presales | – | – | – | ✔ | – | ✔ |
| Assign Bid Liaison | – | – | – | – | ✔ | ✔ |
| Confirm Bid (Draft→Bidding) | ✔* | ✔* | ✔* | ✔* | ✔* | ✔ (*BL+Presales must be assigned) |
| Readiness checklist / Confirm Ready | – | (c) own tender | (c) own rows only | (c) if BL's manager | (c) if BL's manager | ✔ |
| Mark Submitted | – | (c) | – | (c) | (c) | ✔ |
| Won / Prequalified / Lost / Drop / Cancel | all | all | all | all | all | all |
| Reopen / drag back | – | – | – | – | – | ✔ |
| Flag/Remove Must-Win | – | – | – | – | ✔ | ✔ |
| Score bid quality | – | – (never own) | – | (c) BL's manager | (c) manager or fallback | (c) last fallback |
| Confirm disqualification | (c) as manager | (c) | (c) | (c) | (c) fallback | (c) fallback |
| Request/reassign/approve/send back/reopen summary | – | – | – | ✔ | ✔ | ✔ |
| Write/submit summary | (c) writer | (c) | (c) default writer | (c) | (c) | (c) |
| Project Summaries library / Export for Marketing | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ (+ Library group) |
| Approve/Reject business case | – | – | – | – | ✔ | ✔ (Reset: Admin) |
| Account ownership assign / accept / mark company / merge | – | – | – | – | ✔ | ✔ |
| Claim customer | ✔ (AM role) | – | – | – | ✔ | ✔ |
| Target accounts approve/tier/classify | – | – | – | – | ✔ | ✔ |
| Pillars / Summary Headings config | – | – | – | ✔ | ✔ | ✔ |
| Guidelines / Standard Bid Documents / Bid Desk Team / Cancel Reasons edit | – | – | – | – | ✔ | ✔ |
| Customer Activities: see all | – (team) | – (team) | – (team) | – (team) | ✔ | ✔ |

---

## 6. Automations

### 6.1 Scheduled actions (all daily)

| Cron | Code | What it does | Ref |
|---|---|---|---|
| "Tender: Overdue Project Summary Reminders" | `_cron_summary_overdue_reminders` | Won tenders with summary Writing/Changes/In review: the day after the due date, then every 7 days, email writer+requester (or reviewer+requester) "Overdue: project summary". | data/ir_cron_data.xml:4; project_summary.py:662-679 |
| "Partner: Last Seen" | `_scheduler_compute_last_seen_stage` | Re-buckets customers into Last Seen stages (30/60/90/120/over/never). | ir_cron_data.xml:13; res_partner.py:102-120 |
| "Tender: Prequalification Follow-up" | `_cron_prequalification_followup` | Active past Valid Until → Expired; notices at 60 and 30 days before expiry; "No RFQ … for N days" at 60 days quiet, then every 30. | tender_workflow_data.xml:21; prequalification_pipeline.py:81-93 |
| "Tender: Bid Readiness Reminders" | `_cron_bid_readiness_reminders` | Draft/Bidding not confirmed ready: email BL + Presales at 5 and 3 days before deadline ("should be confirmed at least 72 hours before"). | bid_desk_data.xml:45; bid_desk.py:407-417 |
| "Tender: Bid Quality Reminders" | `_cron_bid_quality_reminders` | Must-win Draft/Bidding: warnings 7, 3, 1 days before deadline to the team; overdue quality checks and DQ confirmations: day after due, then weekly, to scorer/confirmer. | bid_quality_data.xml:55; bid_quality.py:411-431 |

### 6.2 Emails and templates

| Template / email | Trigger | Recipients | Ref |
|---|---|---|---|
| "Tender Won/Prequalified alert" (subject "Congratutulations 🎉🎉") | Won or Prequalified | To: Admin, HoC, HoCh users; Cc: AM, Presales, BL | data/mail_templates.xml:491; models.py:855; tender_workflow.py:135-138 |
| "Tender lost alert" | Lost | same pattern | mail_templates.xml:322 |
| "Tender drop alert" | Dropped | same pattern | mail_templates.xml:154 |
| "Team Resource Alert" (tender) | After any Assign (AM/BL/Presales) on a tender | To: AM, Presales, BL; Cc: Admin, HoC, HoCh | mail_templates.xml:868; models.py:766 |
| "Team Resource Alert" (opportunity) | Assign AM/Presales on an opportunity | AM, Presales; Cc heads | mail_templates.xml:682; crm_lead.py:152 |
| "Tender deadline alert" | `action_send_mail` – **no caller found** | — | mail_templates.xml:5; models.py:752 |
| Bid quality emails (qweb `bid_quality_email`) | must-win flagged/removed (only Draft/Bidding), quality scored (to BL), DQ to confirm / confirmed (to person at fault), cron reminders | as named | bid_quality.py:246-254 |
| Summary emails (qweb `summary_email`, `summary_email_bulk`) | request, reassign, due change, submit, send back, approve, reopen, back to Won, reminder, overdue | named people only, never the actor | project_summary.py:620-644 |
| Weekly digest "Tenders/Commercial Periodic Digest" | Odoo digest | KPIs "Activities Logged", "Tenders" added | data/digest_data.xml; models/digest.py |

### 6.3 Activities (to-dos) created automatically

| Activity type | When | For whom | Ref |
|---|---|---|---|
| "Required Nomination of Technnical Pre-sales" | Tender created; opportunity created | every Head of Channel user | models.py:306-313; crm_lead.py:45-54 |
| "Required Nomination of Bid Liaison" | Tender created | every Head of Commercial user | models.py:315-322 |
| "Nomination for Technnical Pre-sales" / "… Bid Liaison" / "… Account Manager" | After Assign | the nominee | tenders_assignment_wizard.py |
| "Write Project Summary" / "Review Project Summary" | summary request/submit/send back | writer / requester (or another manager) | project_summary.py:457-477 |
| Nomination to-dos removed | on Evaluation, Won, Prequalified, Lost, Dropped, Cancelled (and opportunity → Lost) | — | models.py:636-641; tender_workflow.py:130-147 |

### 6.4 Auto-created / auto-set records

Readiness checklist lines (Bidding); prequalification (Prequalified); tender.summary.event rows; tender.summary.export on download; customer AM from deal; AM cascade to open deals; opportunity AM + salesperson from customer on create/partner change (crm_lead.py:57-58, 77-80); opportunity Won/Lost from tender; invoice `tender_id` copied from SO/PO (sale_order.py, purchase.py); `bid_desk_tracked` on new tenders; chatter notes via `_summary_log` on most steps; portal access log.

### 6.5 My Actions groups (models/my_actions.py; bid_quality.py:434; bid_desk.py:419; prequalification_pipeline.py:140)

"Summaries to write", "Summaries sent back to you", "Summaries to review" (managers), link "Won tenders with no summary requested" (managers), "Pre-sales engineers to nominate" (HoCh/Admin; Draft/Bidding without presales), "Account managers to nominate" (HoCh/Admin; open without AM), "Bid liaisons to nominate" (HoC/Admin), "Achievements to attribute" (HoC: AM/BL; HoCh: presales), "Business cases to approve" (HoC/Admin), "Business cases to finish", link "Overdue planned customer touches", "Must-win tenders closing soon" (≤7 days), "Bid quality checks to score", "Disqualifications to confirm", "Bids to confirm ready" (≤5 days; overdue < 72h), "Submissions to record", "Prequalifications to follow up", waiting: "Summaries waiting on others", "Business cases waiting for approval". Nominations count as overdue once the deadline has passed.

---

## 7. Validation messages

| Message (exact) | Type | File:line | When |
|---|---|---|---|
| "Use the buttons on the tender to change its status." | UserError | models/tender_workflow.py:152 | Editing Status directly |
| "Open the tender to move it to %s." | UserError | tender_workflow.py:167 | Board drag (write path) to a status needing details |
| "Only Tender Tracker Administrators can move a tender back." | UserError | tender_workflow.py:179 | Non-admin drags backwards |
| "A tender in %s can't move to %s." | UserError | tender_workflow.py:105, 182 | Not an allowed forward move |
| "Only Tender Tracker Administrators can reopen a tender." | AccessError | tender_workflow.py:96 | Reopen by non-admin |
| "A %s tender can only be reopened to %s." | UserError | tender_workflow.py:98 | Wrong reopen target |
| "Please give a reason for reopening." | UserError | tender_workflow.py:101 | Empty reason |
| "Only the Bid Liaison or their manager can mark a bid as submitted." | AccessError | tender_workflow.py:107 | Mark Submitted by others |
| "Please enter the award date." | UserError | tender_workflow.py:109 | Won without award date |
| "Please choose why the tender was cancelled." | UserError | tender_workflow.py:111 | Cancel without reason |
| "A reason is required. Please use the Lost button on the tender." / "…Drop button…" | UserError | tender_workflow.py:113, 115; bid_quality.py:177 | Lost/Dropped without reason |
| "This tender can't be reopened." | UserError | tender_workflow.py:212 | No reopen target |
| "'Valid From' is after 'Valid Until'." | UserError | wizards/tender_move_wizard.py:44 | Prequalified wizard |
| "The submission time can't be in the future." | UserError | tender_move_wizard.py:49; bid_desk.py:286 | Mark Submitted / Add Receipt |
| "Missing bid liaison. Please assign one before proceeding!" | ValidationError | models/models.py:330 | Leaving Draft without BL (non-admin) |
| "Missing technical presales engineer. Please assign one before proceeding" | ValidationError | models.py:332 | Leaving Draft without Presales |
| "You can only transition to "Bidding", "Cancelled", or "Dropped" stage from draft tender!" | ValidationError | models.py:342 | Legacy guard |
| "You can only transition to "Evaluation", "Cancelled", or "Dropped" stage from bidding stage in tender!" | ValidationError | models.py:345 | Legacy guard |
| "You can only transition to "Won", "Prequalified", "Lost" or "Cancelled" from evaluation!" | ValidationError | models.py:348 | Legacy guard |
| "You can only transition to "Prequalified" stage from Won stage!" | ValidationError | models.py:351 | Legacy guard |
| "You can not change a tender in "Prequalified", "Cancelled" or "Dropped" stage!!" | ValidationError | models.py:354 | Legacy guard |
| "Only an administrator can delete tender records." | UserError | models.py:447 | Delete |
| "The selected tender doesn't have an opening date set." | ValidationError | models.py:1070 | Tender Minutes onchange |
| "Must-win, quality check and disqualification details can only be changed with the buttons on the tender." | AccessError | models/bid_quality.py:181 | Direct edit of protected fields |
| "Only Head of Commercial or a Tender Tracker Administrator can change must-win." | AccessError | bid_quality.py:259 | Must-win by others |
| "Must-win can only be changed before the tender is submitted." | UserError | bid_quality.py:263 | Currently disabled (flag False) |
| "This tender is already must-win." | UserError | bid_quality.py:281 | |
| "This bid has not been submitted yet." | UserError | bid_quality.py:305 | Score before Evaluation |
| "Only the Bid Liaison's manager can score this bid." | AccessError | bid_quality.py:307 | |
| "The actual submission date cannot be in the future." | UserError | bid_quality.py:322 | Quality wizard |
| "At least one guideline must apply to this bid." | UserError | bid_quality.py:326 | All N/A |
| "There is no disqualification waiting to be confirmed on this tender." | UserError | bid_quality.py:374 | |
| "You are not the person who confirms this disqualification." | AccessError | bid_quality.py:376 | |
| "Please say who caused the disqualification and give the evidence." | UserError | wizards/tender_lost.py:25; tender_dropped.py:25 | DQ reason without cause/evidence |
| "This checklist is confirmed. Reopen it to make changes." | UserError | models/bid_desk.py:90, 103 | Editing/adding to confirmed checklist |
| "Only the person preparing this document, the Bid Liaison or their manager can change it." | AccessError | bid_desk.py:94 | |
| "Only the Bid Liaison or their manager can add items." | AccessError | bid_desk.py:105 | |
| "Only the Bid Liaison or their manager can remove items, while the checklist is open." | AccessError | bid_desk.py:130 | |
| "Only the Bid Liaison or their manager can do this." | AccessError | bid_desk.py:236 | Create/Confirm/Reopen checklist |
| "There is no open checklist to confirm." | UserError | bid_desk.py:249 | |
| "This bid isn't ready yet:\n- <doc>: missing/expired" | UserError | bid_desk.py:255 | Confirm Ready with gaps |
| "This checklist isn't confirmed." | UserError | bid_desk.py:266 | |
| "You can't record this submission." | AccessError | bid_desk.py:275, 284 | |
| "Please attach the submission receipt." | UserError | bid_desk.py:288 | |
| "Please say why this person should take the bid." | UserError | wizards/bid_desk_wizards.py:59 | Over-share/clash assignment without reason |
| "There is already an active heading called %s." | ValidationError | models/project_summary.py:117 | |
| "%s is tied to its fields, so it stays active and required." | ValidationError | project_summary.py:123 | |
| "A heading can't be tied to fields from here." | AccessError | project_summary.py:128, 135 | |
| "Switch the heading off instead of deleting it." | UserError | project_summary.py:146 | |
| "%s is the primary pillar, so it can't be a secondary one as well." | ValidationError | project_summary.py:314 | |
| "The project summary's status and people can only change through its workflow." | AccessError | project_summary.py:335 | |
| "Only the assigned writer can edit a project summary, while it's being written." | UserError | project_summary.py:337 | |
| "Only an Administrator, Head of Commercial or Head of Channel can do this." | AccessError | project_summary.py:346 | |
| "You wrote this summary, so someone else needs to review it." | UserError | project_summary.py:351 | |
| "A project summary can only be requested for a won tender." | UserError | project_summary.py:485 | |
| "This summary is under review or approved, so it can't be reassigned now." | UserError | project_summary.py:487 | |
| "Choose an active internal user as the writer." | UserError | project_summary.py:489 | |
| "Only the assigned writer can submit this summary, while it's being written." | AccessError | project_summary.py:522 | |
| "Choose the primary pillar, Tritel's role, the motion. Add content under: …" (built) | UserError | project_summary.py:407-422, 525 | Incomplete submit |
| "Only a summary in review can be sent back." / "…approved." | UserError | project_summary.py:543, 562 | |
| "Add a note so the writer knows what to change." | UserError | project_summary.py:546 | |
| "Choose whether the customer can be named before approving." | UserError | project_summary.py:564 | |
| "Only an approved summary can be reopened." | UserError | project_summary.py:582 | |
| "This summary isn't waiting on anyone." / "This summary is waiting on you." | UserError | project_summary.py:653, 655 | Remind |
| "The project summary library is for people with library access or a tender role." | AccessError | models/summary_library.py:53 | |
| "This summary is not in your library." | AccessError | summary_library.py:232 | Copy text |
| "Only people who can open the project summary library can export it." | AccessError | wizards/summary_marketing_wizard.py:53, 131 | |
| "No Complete summaries match these filters." | UserError | summary_marketing_wizard.py:134 | |
| "Only a Tender Tracker Administrator can change the default brief." | AccessError | summary_marketing_wizard.py:150 | |
| "Only the Head of Commercial or a Tender Administrator can assign account managers." | AccessError | models/account_ownership.py:184, 258 | |
| "Only account managers can claim customers." | AccessError | account_ownership.py:206 | |
| "%s already has an account manager." | UserError | account_ownership.py:209 | |
| "Only the Head of Commercial or a Tender Administrator can set target accounts. Use "Propose as Target" instead." | AccessError | models/target_accounts.py:117 | |
| "…can classify customers in bulk." / "…approve target accounts." / "…decline proposed targets." / "…set target tiers." | AccessError | target_accounts.py:130, 152, 161, 170 | |
| "Unsupported search on Coverage: %s" | UserError | models/market_coverage.py:405 | Technical |
| "You can only view yourself and the people who report to you." | AccessError | models/touchpoints.py:73 | |
| "You can only view profiles of yourself and the people who report to you." | AccessError | touchpoints.py:336 | |
| "This planned touch is not one you can reschedule." / "This touch is not one you can complete." | AccessError | touchpoints.py:413, 423 | |
| "Activity date cannot be greater than today!" / "Date is Mandatory!" | ValidationError | models/res_partner.py:302, 307 | Marking a touch Done |
| "Please ensure that technical pre-sales engineer has been assigned for this opportunity!" | ValidationError | models/crm_lead.py:70 | Opportunity leaving early stages |
| "Please enter a rejection reason before rejecting." | ValidationError | models/tender_business_case.py:187 | |
| "Description is required on all cost lines." | ValidationError | tender_business_case.py:290 | |
| "The 'Award Date' field is missing. Please provide a value before executing this action." | UserError | models/target.py:764 | Achievement onchange |
| "'%s' cannot be negative." / "'%s' cannot exceed N for role '%s'." | ValidationError | target.py:814, 818 | Stage points |
| "End date must be on or after start date." / "Period '%s' overlaps with '%s'. Target periods must not overlap." | ValidationError | models/target_period.py:60, 67 | |
| "You must be linked to an employee to access the tender portal." | AccessError | controllers/portal_tender.py:313, 1139, 1320, 1779, 2057, 2225, 2438, 2471 | Portal pages |
| "You do not have permission to view this tender." | AccessError | portal_tender.py:1556 | |
| SQL: "Tag name already exists!", "This pillar already exists.", "This person is already on the list.", "A business case already exists for this tender.", "Target value must be a positive number.", "End date must be on or after start date." | constraint | models.py:1002; project_summary.py:84; bid_desk.py:140; tender_business_case.py:201; target.py:507-517 | |

---

## 8. Cross-module touchpoints

| Module | Link | Ref |
|---|---|---|
| CRM / crm_tender | **No automatic conversion found**: a tender is created by hand (or via "Log RFQ") and linked to an opportunity in "Source/Pipeline" (same customer only). Opportunity shows "Tenders" smart button. Won/Prequalified tender → `crm_lead_id.action_set_won()`; Lost → `action_set_lost()` (moves to the module's "Lost" CRM stage, crm_stage_data.xml). Opportunity form gets "Assign Account Manager"/"Assign Tech-Presales" (HoCh/Admin), "My Pipeline" filter, Period. OEMs come from crm_tender `crm.oem`. | tender_workflow.py:135-142; crm_lead.py; views/crm_lead_views.xml |
| Sales / Purchase / Accounting | `tender_id` on sale.order, purchase.order, account.move; SO/PO pass it to invoices. Business case "Actual" figures use confirmed SO/PO totals. | sale_order.py, purchase.py, account_move.py; tender_business_case.py:122-161 |
| tritel_project_delivery | `project.project.tender_id`; "open delivery project" only for Won tenders ("Only a won tender can open a delivery project."); adds projects to My Actions badge. | tritel_project_delivery/models/tender.py:21-26; wizards/open_project_wizard.py:65 |
| tritel_accountability_framework | Metrics read tender data: Bid Quality Score (BL), Bid Compliance (Presales) – quality_score, dq_*, is_must_win, submitted_on; Submission Buffer, Ready at 72 Hours, Repeat Error Rate, Bid Decision Lead Time, Fair Workload Balance, Deadline Clash-Free – submission_confirmed, readiness_state, decision_on, `_bd_effort_points`, `_bd_is_short_notice`, bid_desk_tracked; coverage metrics (Named share, New named accounts, Target accounts named) – coverage_rung, target accounts; activity metrics (pipeline/tender evaluation update coverage) – customer activities. | tritel_accountability_framework/models/metric_hook_bid_quality.py, metric_hook_bid_desk.py, metric_hook_coverage.py, metric_hook_activity.py, tender_history.py |
| tritel_portal_home | `/my` routes tender-role users (with employee) to `/my/dashboard` (priority 20). | models/portal_home.py:15-26 |
| e_board, tritel_ar_collections, tritel_pdc, tritel_hr_leave | Read or reference tender data / groups (not analysed in depth). | grep only |
| hr | Employee `parent_id` (manager) decides quality scorer, DQ confirmer, readiness managers, touchpoint team scope. | bid_quality.py:209-243; touchpoints.py:31-46 |

---

## 9. Gaps / questions for the product owner

1. **Backend visibility**: no record rules restrict internal users – any internal user can read and edit every tender in the backend; the role hierarchy only applies on the portal and touchpoint screens. Intended? (The summary library docstring assumes record rules exist – summary_library.py:8-9, 57.)
2. **Who may close a tender?** "Won", "Prequalified", "Lost", "Drop", "Cancel" have no group or method check – any internal user can close any tender. Only "Mark Submitted" (BL/manager/admin) and "Reopen" (admin) are guarded.
3. **Legacy guard still active** (models.py:326-354): leaving Draft needs both Bid Liaison and Technical Presales unless Administrator; messages talk about "stage". Is the double rule intended, and is the presales requirement correct for every tender?
4. **Opportunity → tender**: there is no button or automation creating a tender from a CRM opportunity; confirm the expected manual process (create tender, pick "Source/Pipeline"). Reopening a tender does not reopen the opportunity.
5. **Must-win lock** is switched off "temporarily" (bid_quality.py:22-24). Should must-win be locked after submission again?
6. **Prequalification status** is freely clickable by anyone; Applied/Renewed/Closed have no rules or automation. Who owns it, and what does Renewed mean?
7. **"Tender deadline alert"** template and `action_send_mail` are never called – dead, or should a cron send it?
8. **Account manager nomination**: My Actions asks Head of Channel/Admin to nominate account managers and the "Assign" AM button is limited to Head of Channel/Admin – confirm AM assignment belongs to Channel, not Commercial. No "Required Nomination of Account Manager" to-do is created on tender creation.
9. **Bid Bond Required** drives the bid bond checklist item and +1 effort point, but no backend view in this module shows it; it is only displayed read-only on the portal tender page (views/portal_tender_detail_templates.xml:137). Users currently have no way to set it in the UI. Add it to the Tender Info tab?
10. **Fair workload**: the tender's own points are added to the team average even when it is already counted for its current Bid Liaison; and the screen is empty until "Bid Desk Team" is filled. Confirm formula and who maintains the team.
11. Business case "Approve"/"Reject" are only hidden by button groups (no method check); target periods can be activated/closed by any user; tender stages are editable by all internal users.
12. Validity/Activity Phase (targets) uses the **entry date**, while Touch Phase uses the **touch date** – two different phase concepts with similar names; training must explain both or one should be dropped.
13. Disqualification reason "Disqualified: late submission" is not linked to the computed "Submitted Late" flag.
14. "Reference status" summary heading is required for submission but excluded from the marketing pack (by design – contacts). Confirm writers should still fill it.
15. Submission Deadline is shown read-only on Bid Readiness / Bid Quality tabs (per brief: read-only copy on another branch); train users to edit it only on Tender Info.
16. Legacy/unused: Users, Tender Responses, Applications' Stages, Tender Minutes (menu commented out), registration stages – hide or retire?
17. Spelling in UI: activity types "Technnical", won email subject "Congratutulations".

---

## 10. Sources (files read)

`__manifest__.py`; models: `models.py`, `tender_workflow.py`, `bid_quality.py`, `bid_desk.py`, `project_summary.py`, `summary_library.py`, `summary_marketing_pack.py`, `prequalification_models.py`, `prequalification_pipeline.py`, `market_coverage.py`, `account_ownership.py`, `target_accounts.py`, `touchpoints.py`, `partner_activity_touchpoints.py`, `deal_touch_strip.py` (part), `res_partner.py`, `hr_employee.py` (skim), `hr_employee_roles.py`, `my_actions.py`, `portal_home.py`, `crm_lead.py`, `tender_business_case.py`, `target.py` (computes), `target_period.py`, `tender_lost_reason.py`, `tender_drop_reason.py`, `sale_order.py`, `purchase.py`, `account_move.py`, `digest.py`, `tender_portal_access_log.py`; wizards: `tender_move_wizard.py`, `bid_quality_wizards.py`, `bid_desk_wizards.py`, `tender_lost.py`, `tender_dropped.py`, `tenders_assignment_wizard.py`, `tender_summary_wizard.py`, `tender_summary_bulk_wizard.py`, `summary_marketing_wizard.py`, wizard XML (buttons); security: `security.xml`, `summary_marketing_security.xml`, `ir.model.access.csv`; data: all files (stages, crons, activity types, templates headers, requirements, guidelines, reasons, headings, pillars, digest, last seen); views: `menu.xml`, `tender_views.xml` (form, search, actions, menus), `bid_quality_views.xml`, `bid_desk_views.xml`, `tender_workflow_views.xml`, `project_summary_views.xml` (header, actions, menus), `summary_library_views.xml`, `crm_lead_views.xml`, grep of `hr_employee.xml`, `res_partner.xml`, `partner_activity_touchpoints_views.xml`, `account_ownership_views.xml`, `target_accounts_views.xml`, `target_period_views.xml`, `target_views.xml`, `tender_business_case_views.xml`; report: `tender_evaluation_report.py`, `pipeline_report.py`, menu XML; controllers: `portal_tender.py` (helpers 1-305, routes, 1546-1760); static: JS registries and tab labels (`market_coverage.js`, `summary_library.js`, `touchpoints_workspace.js`, `tender_board_moves.js`, `tender_period_bar.js`). Cross-module: `tritel_accountability_framework/models/metric_hook_bid_quality.py`, labels in `metric_hook_bid_desk.py`, `metric_hook_coverage.py`, `metric_hook_activity.py`; `tritel_project_delivery/models/tender.py`, `wizards/open_project_wizard.py`; `training/_discovery/crm_tender.md`. Not read in full: portal QWeb templates, OWL templates, `mail_templates.xml` bodies, `target_views.xml` body, migrations, i18n.
