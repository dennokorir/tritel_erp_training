# Discovery: Tritel Project Delivery (`tritel_project_delivery` 16.0.1.13.0)

Read-only code discovery for training material. Paths are relative to `tritel_project_delivery/` unless stated. "PM" = Delivery Project Manager group, "Head" = Head of Delivery group, "Finance" = Delivery Finance group, "MD" = the single user named in Delivery Settings.

---

## 1. Purpose

When Tritel wins a tender, the delivery team opens a **delivery project** from it. The project manager lists everything the project will pay for (cost items) and the months the money goes out, plus a completion date and milestone dates. This makes up the **delivery baseline**. Finance approves the budget, the Head of Delivery approves the dates, and the MD also approves any large revision. Approval locks the completion date, fixes the exchange rates and creates an Odoo budget (`account_budget`) on the project's cost account. After that, the project tracks planned, expected-to-date, committed (open purchase orders) and spent (posted costs) by budget line, and warns buyers when an order goes over the plan. At the end, the PM records the **handover** and any **client delays**, the Head confirms them, and finance **closes** the project with a final cost. Closing freezes the KPI results: on time, on budget, and both together ("success"). The accountability framework reads these frozen results for the delivery KPIs. The module also adds a **My Actions** to-do screen under Projects, a Projects section on the portal `/my/actions`, and smart buttons on projects, baselines, tenders, purchase orders and analytic accounts.

---

## 2. Models

### 2.1 Model list

| Technical name | Business name | Purpose | File |
|---|---|---|---|
| `delivery.settings` | Delivery Settings | One per company: KPI rules, MD thresholds, cost-account mode, VAT, budget mapping | models/delivery_settings.py:6, models/budget_mapping.py:53 |
| `delivery.budget.category` | Budget Category | Category the budget is summarised in (Equipment, Travel, Contingency…), linked to an Odoo budgetary position | models/delivery_settings.py:95 |
| `delivery.milestone.template` | Standard Milestone | Milestones copied onto every new delivery project | models/delivery_settings.py:126 |
| `delivery.cost.type` | Cost Type | Plain-language type the PM picks on a cost item; maps to a category | models/cost_item.py:19; models/tender_import.py:15 |
| `delivery.starter.item` | Starter Item | Standard cost lines added to every new draft baseline | models/starter_item.py:7 |
| `project.delivery.baseline` | Delivery Baseline (version) | Budget + completion date + milestones; original (v1) or revision; approval workflow | models/baseline.py:27 (+ extensions in tender_import, phasing, tracking, buttons, budget_mapping, whole_orders, closeout, action_followups) |
| `project.delivery.baseline.line` | Budget by category line | Category totals worked out from the cost items (read-only in UI) | models/baseline.py:493 |
| `project.delivery.baseline.milestone` | Baseline milestone | Planned milestone date per version | models/baseline.py:521 |
| `project.delivery.cost.item` | Cost item | One thing the project pays for: qty × unit cost, currency, VAT, pay months, quoted/estimate | models/cost_item.py:33 (+ tender_import.py:40, whole_orders.py:21, budget_mapping.py:507) |
| `project.delivery.handover` | Handover | Handover date + optional certificate; PM submits, Head confirms | models/closeout.py:65 |
| `project.delivery.client.delay` | Client Delay | Period the client held up the work; PM submits, Head approves | models/closeout.py:165 |
| `project.delivery.approval.mixin` (abstract) | – | Shared submitted/decided fields for handover and delay | models/closeout.py:35 |
| `project.delivery.cost.line` (SQL view) | Cost lines (read-only) | Posted expense lines on the cost account, for users without accounting rights | models/buttons.py:22 |
| `project.delivery.commitment` (SQL view) | Order lines (read-only) | Confirmed PO lines on the cost account and the amount still to bill | models/buttons.py:62 |
| `delivery.cost.account.card` (transient) | Cost account card | Read-only summary of the cost account for non-finance users | models/buttons.py:101 |
| `delivery.project.open.wizard` (transient) | Open Delivery Project | Creates or links the project from a won tender | wizards/open_project_wizard.py:6 |
| `delivery.tag.orders.wizard` / `.line` (transient) | Tag Tender Orders | Puts the project cost account on untagged tender PO lines | wizards/tag_orders_wizard.py:11, :54 |
| `delivery.close.wizard` (transient) | Close / Reopen Project | Finance confirms the final cost, or reopens with a reason | models/closeout.py:531 |
| Inherited: `project.project` | Project | Delivery fields, tracking, buttons, close-out, My Actions | models/project.py, tracking.py, buttons.py, closeout.py, my_actions.py, whole_orders.py, action_followups.py |
| Inherited: `tender.initial` | Tender | Delivery project link, budgets/margin buttons, portal badge | models/tender.py, buttons.py:321, my_actions.py:465 |
| Inherited: `purchase.order` / `purchase.order.line` | Purchase order | Default cost account, over-plan warning, untagged notice, button | models/tracking.py:226-309, whole_orders.py:133, buttons.py:380 |
| Inherited: `account.analytic.account` | Cost account | Delivery project / budget buttons | models/buttons.py:401 |

### 2.2 Key fields (exact UI labels)

**Delivery Settings** (`delivery.settings`, models/delivery_settings.py:28-62; budget_mapping.py:72-89)

| Field | UI label | Default | Meaning |
|---|---|---|---|
| date_grace_days | "Completion date grace (days)" | 7 | Handover up to this many days late still counts as on time |
| baseline_due_days | "Baseline due after award (days)" | 14 | Projects without an approved baseline this long after award are flagged |
| contingency_cap_pct | "Contingency cap (%)" | 5.0 | Contingency can be at most this share of the baseline total |
| md_user_id | "MD" | – | The one user who approves big revisions |
| md_budget_pct | "MD approval above budget increase (%)" | 10.0 | Revision budget above v1 by more than this needs the MD |
| md_days | "MD approval above date extension (days)" | 30 | Revision completion date later than v1 by more than this needs the MD |
| cost_account_mode | "New cost accounts" | per_project | "A new plan per project, named after it" / "One shared plan for all delivery projects" |
| analytic_plan_id | "Shared plan for project cost accounts" | "Delivery Projects" plan | Used when mode = shared |
| budget_tail_days | "Budget runs past completion (days)" | 180 | Odoo budget period ends this many days after completion, so late bills still count |
| vat_rate | "VAT rate (%)" | 16.0 | Default VAT used to take VAT out of VAT-inclusive prices |
| fallback_budget_post_id | "Direct project costs position" (was "Budgetary position for unlinked categories") | auto "Delivery costs" on account 500000 | Position for categories with none of their own |
| direct_account_ids | "Direct project cost accounts" (form label "Accounts") | 500000 | Equipment, software, subcontractors, materials, logistics |
| travel_account_ids | "Travel and site accounts" | 750610, 850000, 750120 | |
| bonds_account_ids | "Bond and insurance accounts" | 791010 | |
| contingency_account_id | "Contingency reserve account" (form "Reserve account") | 500900 "Project Contingency Reserve" (auto-created, deprecated) | Account nobody posts to, so contingency shows as planned only |
| travel/bonds/contingency_budget_post_id | "… position" (form "Position") | set by Apply mapping | readonly |
| mapping_note | "Mapping still to do" | computed | Lists unmapped categories / missing contingency account |

**Budget Category** (models/delivery_settings.py:116-124): "name", "What goes in" (description), "Budgetary position", "Contingency" (is_contingency), active. Seeded (data/delivery_data.xml:9-40): Equipment and hardware, Software and licences, Subcontractors, Installation materials, Logistics, Travel and site expenses, Bonds, guarantees and insurance, Contingency (is_contingency).

**Cost Type** (models/cost_item.py:24-30; tender_import.py:18): "Type", "Hint", "Budget category", "Product categories". Seeded (data/cost_type_data.xml): "Equipment we supply", "Software and licences", "Work by a subcontractor", "Cables and site materials", "Shipping and clearance", "Travel and site costs", "Bonds and insurance", "Contingency".

**Starter Item** (models/starter_item.py:12-21): "What", "Type", "Qty", "Unit" (default lot), "Unit cost" (company currency, before VAT, 0 = PM prices it), "% of other costs", "Note" (becomes the item's Reference). Seeded (data/starter_item_data.xml): Travel and site costs; Freight, clearing and delivery to site; Performance bond and insurance; Contingency 5%.

**Delivery Baseline** (models/baseline.py:34-90 and extensions)

| Field | UI label | Meaning |
|---|---|---|
| project_id | (title) | Delivery project |
| version / kind | "Baseline v…" · "Original"/"Revision" | v1 is original; each revision +1 |
| state | Status | see §3 |
| completion_date | "Completion date" | Planned completion; becomes the project's end date on approval |
| reason | "Reason for revision" | Required on revisions |
| return_note | "Note for the project manager" | Approver's note when returning |
| item_ids | "Cost items" (tab "Costs") | Cost item builder |
| line_ids | "Budget by category" (tab "Summary by category") | Worked out from items |
| milestone_line_ids | "Milestones" | Milestone name + "Planned date" |
| amount_total | "Budget total" | Σ category lines |
| amount_contingency | "Contingency" | Σ contingency category lines |
| quoted_share | "Quoted (%)" | |
| foreign_share | "Foreign currency (%)" | |
| rates_indicative | "Rates indicative" | Some foreign items still on today's rate |
| budget_vs_original_pct | "Budget vs original (%)" | |
| days_vs_original | "Days vs original" | |
| budget_change / date_change_days | "Budget vs previous" / "Days vs previous" (labels set in view) | |
| expected_revenue | "Expected revenue" | Tender's expected revenue in company currency |
| other_projects_total | "Other projects on this tender" | |
| shared_projects | "Projects sharing the revenue" | |
| margin_left / margin_pct | "Margin left" / "Margin left (%)" | |
| over_revenue | "Over expected revenue" | |
| spend_plan_html | "Spend plan" ("Spend plan by month") | Month × category table |
| early_month_note | "Payment months before the project start" | |
| changes_html | "Changes from the previous version" (tab "Changes") | Added / Changed / Removed items |
| mapping_note | "Budget mapping still to do" | |
| quote_files_label | "Quote files" ("Quote files attached") | "X of Y quoted lines" |
| confirmed_by/on, head_approved_by ("Dates approved by"), finance_approved_by ("Budget approved by"), md_approved_by ("MD approval by"), approved_on | Approvals tab | |
| budget_id | "Odoo budget" | Only visible to `account.group_account_readonly` |
| revenue_locked_rate | "Revenue rate" | Tender currency rate fixed with the budget |

**Cost Item** (models/cost_item.py:438-463 and extensions)

| Field | UI label | Meaning |
|---|---|---|
| name | "What" | e.g. "48-port PoE switches" (placeholder) |
| type_id | "Type" | Picks the category |
| quantity / unit | "Qty" / "Unit" | Unit default "units" |
| unit_price | "Unit cost" | In the item currency |
| item_currency_id | "Currency" | Default company currency |
| price_includes_vat | "Incl. VAT" | VAT is taken out |
| vat_rate | "VAT %" | Default from settings |
| contingency_pct | "% of other costs" | Contingency items only |
| month_from / month_to | "Pay from" / "Pay until" | Snapped to the 1st of the month |
| basis | "Quoted"/"Estimate" | Default Estimate |
| reference | "Reference" | Quote or PO number |
| quote_file | "Quote file" | Optional attachment |
| locked_rate / locked_on | "Fixed rate" / "Rate fixed on" | Set at finance approval |
| amount_currency | "Total (item currency, before VAT)" | |
| amount | "Total (before VAT)" | Company currency |
| source_kind | "Imported from" | Legacy: Supplier quote or PO / Sales order item / Whole purchase order / Whole sales order / Starter item |
| changed_from_quote | "Changed from quote" | Legacy imported lines only |

**Project additions** (models/project.py:170-188; tracking.py:34-42; closeout.py:266-303; action_followups.py:61-65; buttons.py:120-135)

| Field | UI label | Meaning |
|---|---|---|
| delivery_project | "Delivery project" | Opened from a won tender and measured |
| tender_id | "Tender" | Won tender (`kanban_state = won`) |
| award_date / contract_value | "Award date" / "Contract value" | From the tender (contract value = tender "Expected Revenue") |
| delivery_baseline_id | "Approved baseline" | Highest approved version |
| delivery_baseline_state | "Baseline" | see §3 |
| approved_completion_date / approved_budget_total | "Approved completion date" / "Approved delivery budget" | |
| baseline_due_date | "Baseline due" | |
| track_planned/committed/spent/left/forecast | "Planned", "Committed", "Spent", "Left", "Forecast at completion" | Stored; refreshed nightly / on demand |
| track_status | "Budget status" | No approved budget / On track / Fully committed / Over plan |
| track_refreshed_on | "Figures as of" | |
| handover_state | "Handover" | Not recorded / Draft / Waiting / Confirmed / Returned / Closed |
| handover_date | "Handover date" | Confirmed handover |
| approved_delay_days | "Approved client delay (days)" | |
| delivery_closed, closed_on, closed_by | "Closed", "Closed on", "Closed by" | |
| close_spent, close_committed, close_adjustment, close_adjustment_note, final_cost | "Spent at close", "Open orders at close", "Adjustment", "Adjustment note", "Final cost (before VAT)" | |
| close_budget, close_baseline_version, close_completion_date, close_handover_date, close_delay_days, close_grace_days, close_days_late | "Approved budget at close", "Baseline version at close", "Approved completion date at close", "Handover date at close", "Approved client delay at close (days)", "Grace at close (days)", "Days late" | Frozen |
| close_scored, close_on_time, close_on_budget, close_success, close_result | "Scored", "On time", "On budget", "On time and on budget", "Result" | Frozen KPI result |
| after_close_amount | "Costs after close" | |
| after_close_pending / after_close_reviewed | "Costs after close to review" / "Costs after close reviewed" | |

**Handover** (models/closeout.py:71-81): "Project", "Handover date" (default today), "Handover certificate" (optional), "Note", state; mixin: "Decided by", "Decided on", "Note from the Head of Delivery" (form: "Note when returning").
**Client Delay** (models/closeout.py:171-182): "Project", "From", "To", "Days", "What the client delayed, and why", "Evidence" (optional), state; form label for decision note "Note when rejecting".
**Close wizard** (models/closeout.py:535-549): "Spent", "Open orders", "Proposed final cost", "Adjustment", "Why", "Final cost", "Approved budget", "Reason for reopening".
**Open Delivery Project wizard** (wizards/open_project_wizard.py:10-23): "Won tender", "Client", "Award date" (shown as "Award Date" via the tender field), "Existing project", "Project name", "Project manager", "Start date", "Cost account".

### 2.3 Calculations (formula + worked example)

All amounts are in company currency (the baseline view says "in KES"), before VAT, unless stated.

| # | Calculation | Formula in words | Worked example (dummy numbers) | Source |
|---|---|---|---|---|
| C1 | Cost item amount | gross = Qty × Unit cost. If "Incl. VAT" is ticked, net = gross ÷ (1 + VAT%/100), otherwise net = gross. Amount = net × rate (rate 1 for company currency; else the fixed rate, else today's rate), rounded. | 10 × 5,800 = 58,000 incl. 16% VAT → 50,000. USD item: 2 × 1,000 = 2,000 USD × 130.00 = 260,000 | models/baseline.py:124-138, 114-122 |
| C2 | Contingency item | If the item has "% of other costs": amount = (Σ non-contingency item amounts) × % / 100. Otherwise it is priced like a normal item (qty × unit cost). | Other items total 1,000,000; 5% → 50,000 | baseline.py:139-143 |
| C3 | Budget by category | Sum of item amounts per category. Lines are rebuilt every time an item changes. | Equipment 700,000; Subcontractors 250,000; Travel 50,000; Contingency 50,000 | baseline.py:144-155 |
| C4 | Budget total / Contingency | Budget total = Σ category lines (contingency included). Contingency = Σ lines whose category is contingency. | 1,050,000 / 50,000 | baseline.py:168-172 |
| C5 | Contingency cap (at confirm) | Blocks if contingency > total × cap% (+0.005). Total includes the contingency. | Cap 5%: 50,000 vs 5% × 1,050,000 = 52,500 → OK. At 6% (60,000 of 1,060,000) the limit is 53,000 → error "Contingency is 5.7% of the budget; the limit is 5.0%." | baseline.py:315-318 |
| C6 | Quoted (%) / Foreign currency (%) | Σ amount of non-contingency items marked Quoted (or foreign) ÷ Σ non-contingency amount × 100 | 600,000 quoted of 1,000,000 → 60% | baseline.py:103-111 |
| C7 | Changes vs previous | Budget vs previous = total − previous total; Days vs previous = completion − previous completion (days) | v2 1,100,000 vs v1 1,050,000 → +50,000; 15 Jun vs 31 May → +15 | baseline.py:174-189 |
| C8 | vs original | Budget vs original (%) = (total − v1 total) ÷ v1 total × 100; Days vs original = completion − v1 completion | v3 1,200,000 vs v1 1,050,000 → +14.3%; +40 days | baseline.py:186-189 |
| C9 | Which approvals are needed | Head: always. Finance: original, or a revision whose category totals or item details changed. MD: revision AND (budget vs original % > MD % OR days vs original > MD days). Only increases trigger it (strictly greater than). | v3 above: 14.3% > 10 → MD needed; 40 > 30 → MD needed | baseline.py:191-199 |
| C10 | Expected revenue / Margin left | Expected revenue = tender Expected Revenue × rate (fixed revenue rate after budget approval, else today's). Margin left = revenue − this budget total − latest live (draft/waiting/approved) budget of each other delivery project on the same tender. Margin left (%) = margin ÷ revenue × 100. Over expected revenue when margin < 0. | Revenue 1,500,000; this 1,050,000; another project 300,000 → margin 150,000 = 10% | models/tender_import.py:77-104 |
| C11 | Spend plan by month | Each non-contingency item with "Pay from" is split evenly across "Pay from"…"Pay until" (one month when empty). Each month is rounded to 2 decimals and the last month takes the remainder. Contingency is spread in proportion to each month's other spend; with no other spend it goes in the completion month. "Planned to date" = months up to the current month. | 120,000 Jan–Mar → 40,000 per month. Other spend Jan 400k, Feb 600k; contingency 50,000 → Jan 20,000, Feb 30,000 | models/phasing.py:199-226, 234-267 |
| C12 | Odoo budget lines | One series per budgetary position (categories without a position use the "Direct project costs" fallback). Each month with planned spend becomes one line with planned_amount = −amount. Empty months in between merge into one zero line. The first line starts at the project start (or the earliest pay month) and the last runs to completion + tail days (or the end of the last pay month). Budget is created, confirmed and validated. | Completion 30 Jun, tail 180 → budget ends 27 Dec | phasing.py:285-333 |
| C13 | Tracking rows | Rows are budgetary positions (shared position = shared row; no position = "Not split yet"). **Planned** = Σ approved category lines. **Expected by now** = phasing for months ≤ current month. **Committed** = for confirmed/locked PO lines on the cost account: (ordered − billed qty) × price excl. tax × project's analytic share %, converted at today's rate. **Spent** = Σ (−amount) of analytic lines on the cost account whose ledger account type starts with "expense". **Left** = planned − committed − spent. **Forecast at completion** = max(planned, committed + spent). | Planned 700,000; committed 200,000; spent 450,000 → left 50,000; forecast 700,000 | models/tracking.py:76-123, 177-178 |
| C14 | Row / project status | Row: "Over plan" if committed + spent > planned + 0.5; "Fully committed" if planned > 0 and committed + spent ≥ 99.5% of planned; else "On track". Project: Over plan if any row is over; Fully committed only if every row is; else On track. | Row 700,000 planned, 698,000 used → Fully committed | tracking.py:125-148 |
| C15 | Over-plan warning on a PO | For each delivery project on the order's lines: room = planned − committed (excluding this order) − spent for the row. Warns if this order's open amount on the row > room + 0.5. | Room 80,000, order 100,000 → "…this order is 100,000; 80,000 was left in the plan (over by 20,000)." | tracking.py:258-287 |
| C16 | Smart button "Spent %" | track_spent ÷ track_planned × 100, rounded | 450,000 / 1,050,000 → "Spent 43%" | buttons.py:163-164 |
| C17 | Tender "Delivery budgets" / "Margin left" | Σ over the tender's delivery projects of the approved baseline total (else latest live version). Margin = tender expected revenue converted at **today's** rate − that sum. | 1,500,000 − 1,350,000 = 150,000 | buttons.py:331-346 |
| C18 | Client delay "Days" | To − From + 1 (inclusive) | 1–10 Mar → 10 | closeout.py:187-190 |
| C19 | Approved client delay (days) | Number of distinct calendar days covered by **approved** delays. Overlaps count once. | 1–10 Mar and 5–12 Mar → 12 days (not 18) | closeout.py:326-332 |
| C20 | Close figures | Spent = Σ(−amount) of expense analytic lines on the cost account. Open orders = committed as in C13. Proposed final cost = spent + open orders. Final cost = proposed + adjustment (a note is required if adjustment ≠ 0). | 980,000 + 40,000 + 0 = 1,020,000 | closeout.py:335-353, 412-425, 561-564 |
| C21 | **Time KPI** (days late / on time) | deadline = approved completion date (latest approved baseline) + approved client delay days. Days late = max(handover date − deadline, 0). On time if days late ≤ grace days (setting, default 7). Grace is **not** subtracted from "Days late". | Completion 31 Mar + 10 delay days → 10 Apr; handover 15 Apr → 5 days late → on time. Handover 20 Apr → 10 days late → Late | closeout.py:384-410 |
| C22 | **Budget KPI** (on budget) | On budget if final cost ≤ approved budget total (latest approved baseline, contingency included). No tolerance. Currency comparison is rounded. | 1,020,000 ≤ 1,050,000 → On budget | closeout.py:404-405 |
| C23 | Result | Success = on time AND on budget. Result: "On time and on budget" / "Late" / "Over budget" / "Late and over budget". "Not scored" if there is no approved baseline, no confirmed handover or no completion date. | | closeout.py:398-409 |
| C24 | Costs after close | (spent + open orders now) − (spent at close + open orders at close). Shown if ≥ 0.5 in absolute value. | Closed at 1,020,000; now 1,035,000 → 15,000 | closeout.py:355-363 |
| C25 | Baseline due | (award date, else project creation date) + baseline due days | Award 1 Mar + 14 → 15 Mar | models/project.py:206-210 |
| C26 | Project baseline status | Approved version exists: "Revision pending" if a draft/waiting version also exists, else "Approved". No approved version: "Waiting for approval" if one is confirmed, "Baseline in draft" if one is draft, else "No baseline". | | project.py:190-204 |
| C27 | Accountability KPI rate (other module) | For an employee: projects they manage (project manager) with a **confirmed handover dated in the window**, closed and scored. Rate = count meeting the flag ÷ counted × 100. If fewer than 3 are counted, the previous window of the same length is added. Settle days 30. | 2 of 3 on time → 66.7% | tritel_accountability_framework/models/metric_hook_delivery.py:44-127 |

---

## 3. Workflows

### 3.1 State / selection fields

| Model.field | Values (UI label) | File |
|---|---|---|
| baseline.state | draft "Draft" → confirmed "Waiting for approval" → approved "Approved" → superseded "Superseded"; cancelled "Withdrawn" | baseline.py:42-45 |
| baseline.kind | original "Original", revision "Revision" | baseline.py:40 |
| project.delivery_baseline_state | none "No baseline", draft "Baseline in draft", waiting "Waiting for approval", approved "Approved", revision "Revision pending" | project.py:158-164 |
| project.track_status | none "No approved budget", on_track "On track", committed "Fully committed", over "Over plan" | tracking.py:24 |
| handover.state | draft "Draft", submitted "Waiting for confirmation", confirmed "Confirmed", returned "Returned" | closeout.py:80-81 |
| client_delay.state | draft "Draft", submitted "Waiting for approval", approved "Approved", rejected "Rejected" | closeout.py:181-182 |
| project.handover_state | none "Not recorded", draft, submitted "Waiting", confirmed, returned, closed "Closed" | closeout.py:268-270 |
| project.close_result | success "On time and on budget", late "Late", over "Over budget", both "Late and over budget", not_scored "Not scored" | closeout.py:298-300 |
| cost_item.basis | quoted "Quoted", estimate "Estimate" | cost_item.py:456 |
| cost_item.source_kind | purchase, sale, purchase_order, sale_order, starter (legacy / starter marker) | tender_import.py:47, whole_orders.py:24 |
| settings.cost_account_mode | per_project, shared | delivery_settings.py:46-50 |
| close_wizard.mode | close "Close", reopen "Reopen" | closeout.py:536 |
| tag_orders_line.order_state | RFQ, RFQ sent, To approve, Purchase order, Locked, Cancelled | tag_orders_wizard.py:62 |

### 3.2 Transitions: Delivery Baseline

| From → To | Button (view) | Method | Who (view groups / code checks) |
|---|---|---|---|
| (none) → Draft v1 | Tender: "Open Delivery Project" / "Add Delivery Project" → wizard "Open Delivery Project". Project Delivery tab: "Draft Baseline". Smart button "Delivery baseline". My Actions: "Start baseline" | wizard `action_confirm` (open_project_wizard.py:61); `project.action_delivery_baseline` (project.py:308) → `_start_for` | PM (wizard checks group; button groups=PM). The smart button has no group; `_start_for` creates the record, and creating a baseline needs the PM ACL. |
| Approved → new Draft (revision v n+1, copy of the approved one) | Project: "Request Revision"; My Actions "Request revision" | `action_delivery_baseline` → `_start_for` (baseline.py:262-271) | PM. Blocked if the project is closed (closeout.py:524-528) |
| Draft → Waiting for approval | "Confirm for Approval" | `action_confirm` (baseline.py:286; extended in phasing.py:270, tender_import.py:143, action_followups.py:31) | PM (button groups + AccessError) |
| Waiting → (dates approved) | "Approve Dates" (shown if can_approve_head) | `action_approve_head` → `_approve('head')` | Head, not yet given |
| Waiting → (budget approved; rates fixed) | "Approve Budget" | `action_approve_finance` | Finance, when finance is needed |
| Waiting → (MD approved) | "MD Approve" | `action_approve_md` | User = Settings "MD" |
| Waiting → Approved (auto, when all needed approvals are in). The previous Approved version → Superseded and its Odoo budget is cancelled | (last approval) | `_finalize_if_ready` (baseline.py:410-428) | System |
| Waiting → Draft (all approvals cleared) | "Return to Draft" (visible to anyone waiting_for_me) + "Note for the project manager"; My Actions "Return" with a note | `action_return` (baseline.py:381) | Any pending approver, or any Head |
| Draft/Waiting → Withdrawn | "Withdraw" (confirm prompt "Withdraw this baseline? It stays on record but no longer counts."); My Actions "Withdraw" (revisions) | `action_withdraw` (baseline.py:401) | Button groups=PM. **The method itself has no group check.** |
| Draft/Withdrawn → deleted | (standard delete) | `unlink` (baseline.py:245) | PM ACL (unlink) |

On approval (`_finalize_if_ready`): exchange rates are fixed, the project end date is set to the completion date, project milestones are created or updated with the baseline dates, the Odoo budget is created (C12), tracking is refreshed (buttons.py:295-299), the PM is notified (a message, not a to-do), and the project chatter gets a summary.

### 3.3 Transitions: Handover

| From → To | Button | Method | Who |
|---|---|---|---|
| – → Draft | Project header "Record Handover" (when handover is none/draft/returned); My Actions "Record handover" | `action_record_handover` (closeout.py:485) | PM (button groups; create checks PM) |
| Draft/Returned → Waiting for confirmation | "Submit for Confirmation" | `action_submit` (closeout.py:115) | PM. Blocked if another handover is waiting or confirmed |
| Waiting → Confirmed | "Confirm Handover"; My Actions "Confirm" | `action_confirm_handover` (closeout.py:130) | Head |
| Waiting/Confirmed → Returned | "Return" + "Note when returning"; My Actions "Return" | `action_return` (closeout.py:147) | Head; note required |

### 3.4 Transitions: Client Delay

| From → To | Button | Method | Who |
|---|---|---|---|
| – → Draft | Project header "Log Client Delay"; My Actions "Log client delay" | `action_log_client_delay` (closeout.py:492) | PM |
| Draft → Waiting for approval | "Submit for Approval" | `action_submit` (closeout.py:226) | PM |
| Waiting → Approved | "Approve"; My Actions "Approve" | `action_approve` (closeout.py:238) | Head |
| Waiting/Approved → Rejected | "Reject" + "Note when rejecting"; My Actions "Reject" | `action_reject` (closeout.py:249) | Head; note required |

There is no path from Rejected or Returned back to Draft for a delay. A rejected delay is final (only Draft can be edited).

### 3.5 Transitions: Project close-out

| From → To | Button | Method | Who |
|---|---|---|---|
| Open → Closed (results frozen) | Header "Close Project" → wizard "Close Project" | `action_close_project` → `delivery.close.wizard.action_confirm` → `_delivery_close` (closeout.py:412) | Finance. Blockers: already closed; a baseline in draft or waiting; approved baseline but no confirmed handover; a handover waiting; a client delay waiting |
| Closed → Open (results cleared, old figures posted to chatter) | Header "Reopen" → "Reopen Project" + "Reason for reopening"; My Actions "Reopen" | `_delivery_reopen` (closeout.py:451) | Finance |
| Costs after close → reviewed | "Mark reviewed"; My Actions "Mark reviewed" | `action_mark_after_close_reviewed` (action_followups.py:74) | Finance |

### 3.6 Other actions

| Action | Button | Who |
|---|---|---|
| Link an existing project to a won tender | Delivery tab "Link to Won Tender" | PM |
| Refresh tracking | "Refresh" (Budget tracking) | Anyone who sees the form (no group) |
| Tag tender PO lines | "Tag tender orders" / stat "Untagged tender order lines" → "Tag Ticked Lines" | Head or Finance |
| Apply Odoo budget mapping | Delivery Settings "Apply mapping" | Head, Finance or Accounting Adviser (`account.group_account_manager`) |
| Mark milestone reached | My Actions "Mark reached" | The project's manager, Head, or Project Administrator |
| Remind | My Actions "Remind" (once per day per record) | PM of the project, whoever submitted it, or Head |

---

## 4. Menus and views

| Menu path | Action | Views | Visible to | What users do |
|---|---|---|---|---|
| Project › My Actions | client action `tritel_project_my_actions` | OWL screen | project.group_project_user | Tiles "To do / Overdue / Waiting on others"; grouped items with buttons (see below) |
| Project › Delivery › Delivery Projects | `action_delivery_projects` (domain delivery_project = True) | list (project_delivery_tree + tracking columns), form | PM, Finance (Head via PM) | List with baseline state, approved completion, budget, Committed/Spent/Left/Forecast, Budget status |
| Project › Delivery › Waiting for My Approval | `action_baselines_mine` (filter "Waiting for me") | list, form | PM, Finance | Approvers open baselines to approve or return |
| Project › Delivery › All Baselines | `action_baselines` (default filter "Waiting for approval") | list, form | PM, Finance | Filters: Waiting for me, Waiting for approval, Draft, Approved (current), Revisions; group by Project/Status |
| Project › Delivery › Handovers | `action_handovers` (filter "Waiting for confirmation") | list, form | PM, Finance | Head confirms or returns |
| Project › Delivery › Client Delays | `action_client_delays` (filter "Waiting for approval") | list, form | PM, Finance | Head approves or rejects |
| Project › Delivery › Projects to Link | `action_projects_to_link` (delivery_project = False) | list, form | Head | Open non-delivery projects and use "Link to Won Tender" |
| Project › Configuration › Delivery › Delivery Settings | server action → settings form | form | Head, Finance (**and** Project Administrator, see Gaps) | KPI rules, MD approval, budgets and cost accounts, Odoo budget mapping, "Apply mapping" |
| … › Cost Types | `action_delivery_cost_types` | editable list | Head | Type, Hint, Budget category, Product categories |
| … › Budget Categories | `action_delivery_categories` | editable list | Head, Finance (parent menu) | Name, What goes in, Budgetary position, Contingency |
| … › Starter Items | `action_delivery_starter_items` | editable list | Head, Finance | |
| … › Standard Milestones | `action_delivery_milestone_tpl` | editable list | Head | |

Project search gets the extra filters "Needs baseline", "Baseline waiting for approval" and "Not linked to a tender" (views/project_views.xml:86-101). The Project kanban card gets an "Open project" link (project_views.xml:121-133).

**Project form** (views/project_views.xml, tracking_views.xml, closeout_views.xml, buttons_views.xml):
- Header: "Record Handover" (PM), "Log Client Delay" (PM), "Close Project" (Finance), "Reopen" (Finance).
- **Delivery** tab: notice "This project is not linked to a won tender…" + "Link to Won Tender". Groups "Tender" (Tender, Award date, Contract value, Baseline due) and "Approved baseline". Buttons "Draft Baseline" / "Request Revision" (PM) / "Open Baseline in Progress". "Budget tracking" table with status badge, "Figures as of", "Refresh", "Tag tender orders". List of baseline versions.
- **Handover & close** tab: costs-after-close alert + "Mark reviewed", "Result" groups, handover date, approved delay days, Handover list, Client delays list.

**Smart buttons**

| Screen | Button (string / subtitle) | Opens | Visibility / group |
|---|---|---|---|
| Project | "Delivery baseline" (label "Approved vN" / "Waiting vN" in amber / "Draft vN" / "No baseline"; sub "N revisions" / "vN waiting" / "vN in draft" / "Baseline") | Version in progress, else approved; starts v1 if none | delivery project |
| Project | "Approved delivery budget" ("Delivery budget") | Approved baseline | has approved baseline |
| Project | "Spent so far" (sub "Spent N%") | Finance (analytic + accounting read): analytic lines; others: read-only "Cost lines · project" list/pivot | cost lines > 0 |
| Project | "Committed" | Purchase users: POs; others: read-only "Order lines · project" (filter "Still to bill") | commitments > 0 |
| Project | "Budget left" (green/amber/red; sub "Left · status") | "Budget tracking" popup + untagged tender orders table | approved baseline |
| Project | "Cost account" (account name; "Plan: …") | Finance: analytic account; others: "Cost account" card | delivery project |
| Project | "Won tender" ("Tender" / tender number) | Tender | has tender |
| Project | "Purchase orders" ("Orders") | POs on the cost account | purchase.group_purchase_user |
| Project | "Vendor bills" ("Bills") | Bills/refunds | account.group_account_readonly |
| Project | "Odoo budget lines" | Odoo budget | account.group_account_readonly |
| Project | "Untagged tender order lines" | Tag wizard | Head, Finance |
| Project | "Automatic tagging rules" | Analytic distribution models | account.group_account_readonly |
| Project | "Handover" (handover state) | Handovers list | delivery project |
| Baseline | "Odoo Budget" | crossovered.budget | account.group_account_readonly, has budget |
| Baseline | "Project", "Tender", "Baseline versions" ("Revisions"), "Margin left" (red when over revenue) | project / tender / versions / tracking popup | |
| Tender | "Delivery projects" ("Delivery"), "Delivery budgets", "Margin left", "Untagged order lines" (Head/Finance) | projects / baseline(s) / tracking / tag wizard | has delivery project |
| Tender header | "Open Delivery Project" (won, none yet), "Add Delivery Project" (won, already has one) | Open wizard | PM |
| Purchase order | "Left in delivery plan" (red if over plan) | Delivery project | project.group_project_user |
| Purchase order | Alerts "Over the delivery plan.", "Not tagged to the project.", multi-project notice | – | computed |
| Analytic account | "Delivery project", "Delivery budget" | Project / approved baseline | |

**My Actions groups** (models/my_actions.py:87-352), with the exact titles:
- PM: "Baselines to draft" (Start baseline), "Baselines sent back to you", "Revisions in progress" (Withdraw), "Handovers to record" (Record handover, Log client delay), "Handovers sent back to you", "Client delays to submit".
- Approvers: "Baselines to approve: dates" (Approve dates / Return), "Baselines to approve: budget" (Approve budget / Return), "Revisions to approve (MD)" (Approve / Return).
- Head: "Handovers to confirm" (Confirm / Return), "Client delays to approve" (Approve / Reject), "Baselines overdue on your team" (Remind), link "Projects not linked to a won tender" ("Projects to link").
- PM (own) / Head (all): "Projects over their approved budget" (Open tracking, Request revision).
- Head/Finance: link "Tender order lines not tagged to their project" ("Tag orders").
- Finance: "Projects to close" (Close project), "Costs after close" (Mark reviewed / Open / Reopen).
- Everyone (any project): "Overdue milestones" (Mark reached), "My overdue tasks" (capped at 50 + link "More overdue tasks"), "Tasks due this week".
- "Waiting on others" (Remind).
- Portal `/my/actions`: a Projects section with nav pills "Tenders · N to do" and "Projects · N to do". Items open in the backend (controllers/portal.py; views/portal_my_actions_templates.xml).

---

## 5. Roles

### 5.1 Groups used

| Group | Own/borrowed | Implies | Likely Tritel dept | Role summary |
|---|---|---|---|---|
| Delivery Project Manager (`group_delivery_pm`) | Own | Project User, Milestones | Delivery | Opens projects from won tenders, drafts and confirms baselines, requests revisions, records handovers and client delays |
| Head of Delivery (`group_delivery_head`) | Own | PM | Delivery | Approves dates and every revision, confirms handovers, approves or rejects delays, tags orders, settings, cost types, milestones |
| Delivery Finance (`group_delivery_finance`) | Own | Project User, Milestones (not PM) | Finance & Accounts | Approves budgets, closes and reopens projects, reviews costs after close, tags orders, mapping |
| MD (settings field `md_user_id`) | Not a group | – | Management (guess) | Approves revisions above the thresholds |
| `base.group_user` | Borrowed | – | All | Read settings, categories, cost types, templates, starter items; create cost account cards |
| `base.group_system` | Borrowed | – | IT | Full access to settings |
| `project.group_project_user` | Borrowed | – | All project users | Read baselines/items/handovers/delays; write is ACL-granted but code limits it to the return note; My Actions menu; PO "Left in delivery plan" button |
| `project.group_project_manager` | Borrowed | – | – | Mark any milestone reached from My Actions; needed to see the Project › Configuration menu |
| `account.group_account_readonly` | Borrowed | – | Finance | See Odoo budget, Vendor bills, Tagging rules; Spent / Cost account open raw accounting records |
| `analytic.group_analytic_accounting` | Borrowed | – | – | Together with the accounting group, opens the raw analytic records |
| `account.group_account_manager` | Borrowed | – | Finance | Can Apply mapping |
| `purchase.group_purchase_user` | Borrowed | – | Procurement (guess) | "Purchase orders" button; Committed opens POs; sees legacy source PO fields |
| `sales_team.group_sale_salesman` | Borrowed | – | Commercial | Sees legacy source sales fields |

Commercial / Channel: there is no group in this module. Account managers only touch it through the tender (they see the tender buttons, and opening a project needs PM). **Guess:** commercial staff have no write role here.

### 5.2 Model access (security/ir.model.access.csv) R/W/C/D

| Model | Internal user | Project user | PM | Head | Finance | System |
|---|---|---|---|---|---|---|
| delivery.settings | R | – | – | RWC | RW | RWCD |
| delivery.budget.category | R | – | – | RWC | RWC | – |
| delivery.milestone.template | R | – | – | RWCD | – | – |
| delivery.cost.type | R | – | – | RWCD | – | – |
| delivery.starter.item | R | – | – | RWCD | RWCD | – |
| project.delivery.baseline | – | RW* | RWCD | (via PM) | RW | – |
| baseline line / baseline milestone | – | R | RWCD | (via PM) | RW | – |
| project.delivery.cost.item | – | R | RWCD | (via PM) | RW | – |
| project.delivery.handover | – | R | RWCD | (via PM) | R | – |
| project.delivery.client.delay | – | R | RWCD | (via PM) | R | – |
| cost line / commitment views | – | R | | | | – |
| delivery.cost.account.card | RWC | | | | | |
| open project wizard | – | – | RWCD | | – | |
| tag orders wizard + lines | – | – | – | RWCD | RWCD | |
| close wizard | – | – | – | – | RWCD | |

\* Code allows non-PM/non-Finance users to write only `return_note` (baseline.py:233-237). **No record rules (`ir.rule`) exist in the module.** Every project user can read every baseline, handover and delay.

### 5.3 Groups × actions matrix

| Action | PM | Head | Finance | MD user | Project user |
|---|---|---|---|---|---|
| Open/link delivery project from won tender | ✔ | ✔ | – | – | – |
| Draft / edit / confirm baseline | ✔ | ✔ | edit items only (ACL; no confirm) | – | view |
| Withdraw baseline | ✔ (button) | ✔ | (method unguarded) | – | – |
| Approve Dates | – | ✔ | – | – | – |
| Approve Budget | – | – | ✔ | – | – |
| MD Approve | – | – | – | ✔ | – |
| Return baseline | if approver | ✔ | if approver | if approver | – |
| Record / submit handover, log / submit delay | ✔ | ✔ | – | – | – |
| Confirm / return handover; approve / reject delay | – | ✔ | – | – | – |
| Close / reopen project; mark costs after close reviewed | – | – | ✔ | – | – |
| Tag tender orders | – | ✔ | ✔ | – | – |
| Apply budget mapping | – | ✔ | ✔ | – | – |
| Edit settings | – | ✔ | ✔ (write) | – | – |
| Cost types / standard milestones | – | ✔ | – | – | – |
| Starter items / budget categories | – | ✔ | ✔ | – | – |
| Refresh tracking | ✔ | ✔ | ✔ | – | ✔ |

---

## 6. Automations

| Type | Name / trigger | What it does | File |
|---|---|---|---|
| Cron (daily, noupdate) | "Project Delivery: flag projects without an approved baseline" → `_cron_delivery_baseline_due` | For active delivery projects in No baseline / Draft past "Baseline due" and not yet reminded: to-do "Delivery baseline overdue" for the PM + all Heads; sets `baseline_reminded_on` (only once per project) | data/delivery_data.xml:57-66; project.py:343-360 |
| Cron (daily, noupdate) | "Project Delivery: costs posted after a project closed" → `_cron_costs_after_close` | For closed projects whose costs after close changed since the last notice and are not reviewed: to-do "Costs after close" for every Finance user | data/closeout_data.xml; closeout.py:504-518; action_followups.py:92-98 |
| Cron (daily, **not** noupdate) | "Project Delivery: refresh budget tracking" → `_cron_refresh_tracking` | Recomputes stored tracking figures on all active delivery projects | views/tracking_views.xml:235-244; tracking.py:155-158 |
| post_init_hook | on install | Hides the legacy Project Tracker menu; creates settings; seeds default accounts; creates the 500900 contingency account; applies mapping | hooks.py |
| Auto-created on Open Delivery Project | wizard confirm | Project (sudo) if new; cost account (in a new plan named after the project, or in the shared plan) unless one is chosen or suggested; the 7 delivery stages (Initiation, Survey & Design, Procurement, Delivery & Installation, Configuration & Testing, Handover, Closed); standard milestones; chatter "Delivery project opened from tender …"; PM follows; draft baseline v1 with starter items and chatter "Draft started with N starter items…" | open_project_wizard.py:61-95; project.py:213-253; whole_orders.py:58-71 |
| Cost account suggestion | wizard onchange | Matches existing analytic accounts by project name / tender title / tender number (exact = 3, contains = 2; +0.5 if unused, −2 if used by a project, +0.2 if it has lines; needs ≥ 2) | project.py:255-288 |
| Auto-created on approval | `_finalize_if_ready` | Odoo budget (`crossovered.budget`) "… · delivery budget vN", confirmed and validated; previous budget cancelled; project end date + milestones updated | baseline.py:410-474; phasing.py:285-333 |
| Default cost account on PO lines | `purchase.order.line._compute_analytic_distribution` | If the PO's tender has exactly one delivery project with a cost account, sets it at 100% | tracking.py:226-239 |
| PO confirm | `button_confirm` | If the order is over plan: posts "Over the delivery plan when confirmed" on the PO and notifies the PM on the baseline chatter ("Order over the delivery plan: …"). It does not block. | tracking.py:289-309 |
| Activities (to-dos) | baseline confirm | "Approve delivery baseline: dates" (Heads), "…: budget" (Finance users), "Approve delivery baseline revision (MD)" (MD); over-revenue note appended | baseline.py:19-23, 340-349; tender_import.py:134-141 |
| | baseline return | "Delivery baseline returned" to the PM | baseline.py:394-396 |
| | handover submit | "Confirm project handover" to every Head | closeout.py:83, 125 |
| | handover confirm | "Close delivery project" to every Finance user (on the project) | closeout.py:140-144 |
| | handover return | "Handover returned" to the submitter / PM | closeout.py:158-161 |
| | delay submit | "Approve client delay" to every Head | closeout.py:184, 233 |
| Auto-clearing to-dos | follow-ups | Role to-dos are deleted on approve/return/withdraw. "Delivery baseline returned" is marked done on reconfirm/withdraw. "Delivery baseline overdue" is marked done on confirm/approve. "Handover returned" is marked done on resubmit. "Close delivery project" is removed on close. "Costs after close" is marked done on review. | baseline.py:351-353; action_followups.py; closeout.py:427 |
| Notifications (messages) | approval, close, reopen, reminders | Approved summary to the PM; "Project closed" summary; "Reopened"; "Reminder from My Actions: …" to the people it is waiting on (once per day per author per record) | baseline.py:425-427; closeout.py:428, 459; my_actions.py:440-461 |
| Mail templates | – | **None** (no `mail.template` records) | – |
| Sequences | – | **None** | – |
| Reports | – | **None** (no report/ folder) | – |

---

## 7. Validation messages

| Message | Type | When | File:line |
|---|---|---|---|
| "Delivery settings cannot be negative." | ValidationError | Any setting < 0 | models/delivery_settings.py:70 |
| "There is already a delivery settings record for this company." | SQL constraint | Second settings record | delivery_settings.py:26 |
| "Accounts %s are in both "%s" and the fallback "%s". Remove them from "%s" first, or the same cost would count twice." | ValidationError | Category position shares accounts with the fallback | delivery_settings.py:136-139 |
| "Set the shared plan for project cost accounts in Delivery Settings first." | UserError | Shared mode without a plan when creating a cost account | project.py:244 |
| "The completion date of %s comes from its approved baseline. Request a revision to change it." | UserError | Editing the project end date when it has an approved baseline | project.py:302-304 |
| "Link this project to its won tender first." | UserError | Baseline on a non-delivery project | project.py:312 |
| "Only a won tender can open a delivery project." | UserError | Tender not Won | tender.py:382; open_project_wizard.py:66 |
| "Quantities, costs and percentages cannot be negative (%s)." | ValidationError | Negative item values | cost_item.py:484 |
| ""Pay until" is before "Pay from" on %s." | ValidationError | Months reversed | cost_item.py:486 |
| "Starter items cannot have negative values (%s)." | ValidationError | | starter_item.py:553 |
| "This baseline version already exists." | SQL constraint | Duplicate project+version | baseline.py:92 |
| "You can only write a return note on a delivery baseline." | AccessError | Non-PM/Finance edits other fields | baseline.py:237 |
| "Baseline v%s is %s and can no longer be edited. Return it to draft or request a revision." | UserError | Locked fields on a non-draft baseline | baseline.py:241-242 |
| "Only draft or withdrawn baselines can be deleted." | UserError | | baseline.py:247 |
| "Each budget category can appear only once in a baseline." | ValidationError | | baseline.py:255 |
| "Only a draft baseline can be confirmed." | UserError | | baseline.py:290 |
| "Only delivery project managers can confirm a baseline." | AccessError | | baseline.py:292 |
| "Set the completion date." | UserError | Confirm without a date | baseline.py:294 |
| "List the costs: what the project will pay for." | UserError | No items | baseline.py:297 |
| "Give the contingency a percentage or an amount." | UserError | Contingency with neither % nor unit cost | baseline.py:301 |
| ""%s" needs a quantity and a unit cost." | UserError | Item qty or cost ≤ 0 | baseline.py:304 |
| ""%s" needs the month it will be paid." | UserError | No "Pay from" | baseline.py:306 |
| "The budget total must be above zero." | UserError | | baseline.py:308 |
| "Give every milestone a date: %s." | UserError | | baseline.py:311 |
| "Milestones cannot fall after the completion date: %s." | UserError | | baseline.py:314 |
| "Contingency is %.1f%% of the budget; the limit is %s%%." | UserError | Cap exceeded (C5) | baseline.py:317-318 |
| "Explain the reason for this revision." | UserError | Revision without a reason | baseline.py:321 |
| "This revision changes nothing compared with v%s." | UserError | | baseline.py:323 |
| "These costs are paid after the completion date plus %s days (%s): %s." | UserError | Pay month after completion + tail | phasing.py:277-278 |
| "This revision needs the MD, but no MD is set in Delivery Settings." | UserError | At confirm | baseline.py:345 |
| "This baseline is not waiting for approval." | UserError | Approve on a non-waiting baseline | baseline.py:358 |
| "You cannot give this approval, or it has already been given." | AccessError | | baseline.py:361 |
| "Only a baseline waiting for approval can be returned." | UserError | | baseline.py:384 |
| "Only an approver can return this baseline." | AccessError | | baseline.py:387 |
| "Write a note for the project manager before returning the baseline." | UserError | | baseline.py:389 |
| "Only a draft or waiting baseline can be withdrawn." | UserError | | baseline.py:404 |
| "Baseline v%s is %s; its budget and milestones can no longer be edited." | UserError | Editing lines/items/milestones on a non-draft baseline | baseline.py:555-556 |
| "Only finance or the Head of Delivery can change the budget mapping." | UserError | | budget_mapping.py:461 |
| "Choose at least one direct project cost account (usually 500000 Cost of sales)." | UserError | | budget_mapping.py:463 |
| "Account %s is in both "%s" and "%s". Each account may sit in one position only, or the same cost would count twice." | UserError | | budget_mapping.py:470-471 |
| "Only the Head of Delivery or finance can tag orders." | AccessError | | tracking.py:219; tag_orders_wizard.py:22 |
| "Tick the lines to tag." | UserError | | tag_orders_wizard.py:44 |
| "Only delivery project managers can open delivery projects." | AccessError | | open_project_wizard.py:64 |
| "Choose the project manager." | UserError | | open_project_wizard.py:68 |
| "This project is already linked to tender %s." | UserError | | open_project_wizard.py:72 |
| "Cost account %s is already used by project %s." | UserError | | open_project_wizard.py:79 |
| "Give the project a name." | UserError | | open_project_wizard.py:85 |
| "%s is closed. Finance can reopen it first." | UserError | Handover/delay change or new baseline on a closed project | closeout.py:54, 527 |
| "Only delivery project managers can record a handover." / "…submit a handover." | AccessError | | closeout.py:91, 116 |
| "This handover is %s; it can no longer be edited." | UserError | | closeout.py:102-103 |
| "Only draft or returned handovers can be deleted." | UserError | | closeout.py:109 |
| "Only a draft or returned handover can be submitted." | UserError | | closeout.py:120 |
| "%s already has a handover waiting or confirmed." | UserError | | closeout.py:122 |
| "Only the Head of Delivery can confirm a handover." / "…return a handover." | AccessError | | closeout.py:131, 148 |
| "Only a submitted handover can be confirmed." | UserError | | closeout.py:135 |
| "Only a submitted or confirmed handover can be returned." | UserError | | closeout.py:152 |
| "Write a note explaining what needs to change, then return it." | UserError | | closeout.py:154 |
| "The delay ends before it starts." | UserError (in a constraint) | | closeout.py:196 |
| "Only delivery project managers can log a client delay." / "…submit a client delay." | AccessError | | closeout.py:203, 227 |
| "Only a draft client delay can be edited." / "Only draft client delays can be deleted." / "Only a draft client delay can be submitted." | UserError | | closeout.py:214, 220, 231 |
| "Only the Head of Delivery can approve a client delay." / "…reject a client delay." | AccessError | | closeout.py:239, 250 |
| "Only a submitted client delay can be approved." / "Only a submitted or approved client delay can be rejected." | UserError | | closeout.py:243, 254 |
| "Write a note explaining why, then reject it." | UserError | | closeout.py:256 |
| Close blockers: "%s is already closed." / "Baseline v%s is %s. Approve or withdraw it first." / "The handover must be recorded and confirmed by the Head of Delivery first." / "A handover is waiting for confirmation." / "A client delay is waiting for approval." | UserError (joined); also shown in the wizard under "This project cannot close yet." | | closeout.py:366-382, 418 |
| "Only finance can close a delivery project." / "Only finance can reopen a delivery project." / "Only finance can close or reopen a delivery project." | AccessError | | closeout.py:415, 454, 474 |
| "Explain the adjustment to the final cost." | UserError | | closeout.py:420 |
| "%s is not closed." / "Give the reason for reopening." | UserError | | closeout.py:456, 458 |
| "Only finance can mark costs after close as reviewed." | AccessError | | action_followups.py:76 |
| My Actions: "This action is not available from My Actions." (AccessError), "This record no longer exists. Refresh My Actions.", "Write a note for the project manager.", "Write a note explaining why.", "Only the Head of Delivery can do this." (AccessError), "Only the project manager can mark this milestone reached." (AccessError), "This baseline is no longer waiting for approval.", "This handover is no longer waiting for confirmation.", "This client delay is no longer waiting for approval.", "Nothing is waiting on anyone here.", "Only the project manager, whoever submitted it, or the Head of Delivery can send a reminder." (AccessError), "There is nobody else to remind.", "You already sent a reminder about this today." | mixed | | my_actions.py:359-457 |

Warnings that do not block: "Costs are over the expected revenue. You can still confirm; the approvers will see this." (baseline form); "Over the delivery plan. You can still confirm; the project manager will be told." (PO form); "Not tagged to the project." (PO form); "Odoo budget mapping is not finished." (baseline form); "Foreign-currency amounts use today's rate until finance approves the budget."

---

## 8. Cross-module touchpoints

| Module | Touchpoint | Detail |
|---|---|---|
| `tritel_tender_tracker` (`tender.initial`) | Tender → project | Only `kanban_state == 'won'` ("Won"). Buttons "Open Delivery Project" / "Add Delivery Project" open the wizard. Several projects per tender are allowed. Wizard name defaults to the tender title (`res_model`, the record name) or "Tender Number" (`ref_no`). Client comes from the tender `partner_id`. "Award Date" and "Expected Revenue" (+ "Tender Currency") feed the baseline due date, contract value and margin. |
| | Purchase/sales orders | `purchase.order.tender_id` (defined in tender tracker, models/purchase.py:6) drives the default cost account, untagged detection and the Tag wizard. |
| | My Actions | Extends tender tracker portal `/my/actions` (`TenderPortal`) and `get_my_actions_badge` so the badge counts project to-dos too. |
| `tritel_accountability_framework` | Delivery KPI hooks | `metric_hook_delivery.py`: three hooks, "Delivery success rate (on time and on budget)", "Delivery on-time completion rate" and "Delivery on-budget rate". They read confirmed handovers in the window (by handover date) for projects whose PM is the employee's user, then the frozen `close_success` / `close_on_time` / `close_on_budget`. Not yet closed or not scored = listed but not counted. Fewer than 3 counted → the previous window is added. Settle 30 days. Seeding: `scripts/seed_delivery_kpis.py` (quarterly Threshold targets, floor 0, ideal 100, development-only while TRIAL). |
| Odoo Budgets (`account_budget`, `project_account_budget`) | Approval creates a `crossovered.budget` per version, per position per month (negative planned amounts = cost). The old budget is cancelled on a new approval. Positions: "Direct project costs" (500000), "Project travel and site" (750610, 850000, 750120), "Project bonds and insurance" (791010), "Project contingency" (500900 Project Contingency Reserve, deprecated, cost-of-revenue type, auto-created). Fallback "Delivery costs" position on 500000 if mapping was never applied. |
| Analytic (`analytic`) | Each delivery project has a cost account (`analytic_account_id`). Plan "Delivery Projects" seeded. Spent = analytic lines on expense-type accounts. Tagging rules = `account.analytic.distribution.model`. |
| Purchase (`purchase`) | Committed from confirmed/locked PO lines with the cost account in `analytic_distribution`. Over-plan warning and post-confirm notice. Tag wizard writes the distribution on lines without one. Bills keep their own distribution. |
| Sale (`sale`) | Dependency only for legacy `sale_line_id` / `sale_order_id` history fields. |
| Project (`project`) | Stages, milestones (`allow_milestones`), end date (`date`) locked to the approved baseline, kanban "Open project" link. |
| `project_tracker` (legacy) | Its root menu is hidden on install (hooks.py). |
| `scripts/relink_cost_account.py` | Manual production script: moves a project and its budget lines to the cost account finance actually uses. |

---

## 9. Gaps / questions for the product owner

1. **Configuration menu is hidden from Head/Finance.** Project › Configuration needs `project.group_project_manager` (odoo/addons/project/views/project_views.xml:11-12), and none of the delivery groups imply it. Do Head of Delivery and Delivery Finance users also need Project Administrator to reach Delivery Settings, Cost Types and the rest?
2. **MD has no group and no menu.** The MD is a single user in Settings. The Delivery menu needs PM or Finance, so a plain MD would work only from the to-do / My Actions, and needs at least Project User to read baselines. Which groups should the MD hold? Is a deputy possible?
3. **No record rules.** Every project user can read every baseline, budget, handover and delay, including figures on other PMs' projects. Is that intended?
4. **Cost types say "Set once by finance"** (cost_item.py:428), but only Head has write access to `delivery.cost.type` and the menu. Should Finance maintain cost types?
5. **Withdraw has no server-side group check** (baseline.py:401). Any user with write access (e.g. Finance) could call it, and My Actions "Withdraw" passes straight to it. Is that intended?
6. **"Return to Draft" visibility.** The button shows only to pending approvers (`waiting_for_me`), but the method also allows any Head. Should the Head always see it?
7. **Grace vs "Days late".** "Days late" is recorded before grace (5 days late but "On time"). Training should explain this. Also, the accountability narrative hard-codes "7-day grace" while the setting can change.
8. **Budget KPI uses the latest approved revision** and includes contingency. Is a project "on budget" if its budget was revised upward just before close (with MD approval above 10%)? Confirm the policy.
9. **Contingency row in tracking** sits on a reserve account with no actuals, so it never fills. A project rarely shows "Fully committed" overall, and contingency inflates "Left". Is that understood and acceptable?
10. **Tender margin uses today's rate** (buttons.py:344), while the baseline margin uses the fixed revenue rate after approval. Figures can differ between the tender and the baseline.
11. **Baseline overdue reminder fires once per project** (`baseline_reminded_on` is never reset). Should it repeat?
12. **Tracking cron in a non-noupdate file** (views/tracking_views.xml:235). Manual edits (interval, active) are reset on every upgrade.
13. **Close-out on non-delivery projects.** "Record Handover", "Log Client Delay" and "Close Project" appear on every project. A project without an approved baseline closes as "Not scored". Is that desired for internal projects?
14. **Rejected client delay is final.** It cannot go back to Draft, and the Head can reject an already approved delay. Can the PM re-log it? Is it audited?
15. **Stale help text:** Starter Items says "next to the tender's orders" (delivery_settings_views.xml:155), but import was removed in 1.8.0. The baseline view hard-codes "in KES".
16. **Starter items with 0 unit cost** block confirmation ("needs a quantity and a unit cost"), so PMs must delete unneeded starters. Training should cover this.
17. **Pay months before project start** are allowed and only noted in chatter. Pay months after completion + 180 days are blocked.
18. **Delivery Finance does not imply PM**, but the ACL gives Finance write on cost items and baseline lines. Can finance edit a PM's draft items (before confirm)? Is that intended?
19. **My Actions UI renders the breadcrumbs toolbar twice** (static/src/my_actions/project_my_actions.xml, two identical `tt-ma-toolbar` blocks). This is a cosmetic bug.
20. **Commercial/Channel roles:** no role here. Confirm that account managers only see the tender buttons, and that Procurement only sees PO warnings and buttons.
21. **Multi-project tenders:** the default cost account on PO lines applies only when the tender has exactly one delivery project. Otherwise buyers must pick the account on each line. Who trains buyers on this?

---

## 10. Sources (files read)

- `__manifest__.py`, `hooks.py`, `__init__.py`
- `security/delivery_security.xml`, `security/ir.model.access.csv` (no ir.rule records anywhere in the module)
- `data/delivery_data.xml`, `data/cost_type_data.xml`, `data/starter_item_data.xml`, `data/closeout_data.xml`
- `models/`: `__init__.py`, `delivery_settings.py`, `project.py`, `tender.py`, `cost_item.py`, `starter_item.py`, `baseline.py`, `tender_import.py`, `phasing.py`, `budget_mapping.py`, `tracking.py`, `whole_orders.py`, `buttons.py`, `closeout.py`, `my_actions.py`, `action_followups.py`
- `wizards/open_project_wizard.py`, `wizards/open_project_wizard_views.xml`, `wizards/tag_orders_wizard.py`, `wizards/tag_orders_wizard_views.xml`
- `views/`: `menus.xml`, `baseline_views.xml`, `project_views.xml`, `tender_views.xml`, `tracking_views.xml`, `closeout_views.xml`, `buttons_views.xml`, `delivery_settings_views.xml`, `budget_mapping_views.xml`, `whole_orders_views.xml`, `my_actions_views.xml`, `portal_my_actions_templates.xml`
- `controllers/portal.py`
- `static/src/my_actions/project_my_actions.js`, `.xml` (skimmed labels)
- `scripts/seed_delivery_kpis.py`, `scripts/seed_delivery_kpis_production.py` (header only), `scripts/relink_cost_account.py` (header only)
- `migrations/*` (headers), `tests/test_my_actions.py` (test names)
- Cross-module: `tritel_accountability_framework/models/metric_hook_delivery.py`; `tritel_tender_tracker/models/models.py` (kanban_state, ref_no, expected_revenue, award_date), `tritel_tender_tracker/models/purchase.py` (tender_id on PO); Odoo core `addons/project/views/project_views.xml` (menu groups)
- No `report/` folder and no mail templates or sequences in the module.
