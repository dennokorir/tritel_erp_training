# crm_tender: discovery notes (v16.0.0.3)

Module path: `/home/dennokorir/Projects/tritel-training/crm_tender`. Manifest name `crm_tender`, summary "Channel", description "Module for managing channel operations" (`__manifest__.py:3-10`). Depends: base, crm, hr, purchase, sales_team, web_cohort (`__manifest__.py:23-30`).

> **Correction to the brief.** The code does **not** add tender details to CRM opportunities and does **not** book OEM bookings against an opportunity. OEM bookings link to **purchase order lines** only. The only addition to the opportunity is the "Vendor Opportunities" tab (OEM + estimated value). Tender details on opportunities come from `tritel_tender_tracker` (see section 8). Despite its name, this module is the **Channel** app.

## 1. Purpose

crm_tender is Tritel's **Channel** app. It holds the list of OEMs (the manufacturers Tritel resells, such as network or software vendors), the distributors Tritel buys them through, and Tritel's OEM courses and staff certifications. On opportunities, salespeople record which OEMs are involved and an estimated value per OEM. Each purchase order line gets an OEM tag, set automatically where the system can tell. The **OEM Booking** records what an OEM credits Tritel with on its partner portal against the purchase lines that sale covers. It then shows the distributor margin, meaning what Tritel paid minus what the OEM recognised. Confirmed bookings feed the accountability framework's "OEM-recognised revenue (USD)" metric. The module also keeps a register of company compliance documents (licences and registrations with expiry dates). Its menus sit under the Tender app.

## 2. Models

### 2.1 New models

| Technical name | Business name | Purpose | File |
|---|---|---|---|
| `crm.oem` | OEM (Vendor) | Manufacturer master record: account manager, distributors, portal link, lifecycle state | models/crm_oem.py:5 |
| `crm.distributor` | Distributor | Distributor master, linked to a supplier contact and the OEMs it carries | models/crm_oem.py:214 |
| `crm.vendor.lead` | Vendor Opportunity | One OEM on one opportunity with an estimated value | models/crm_oem.py:199 |
| `crm.oem.booking` | OEM Booking | Value the OEM recognised on its portal, reconciled to purchase lines | models/crm_oem_booking.py:9 |
| `crm.oem.course` | OEM Course | Course or certification track an OEM requires, with a minimum headcount | models/crm_oem.py:119 |
| `crm.oem.certification` | OEM Certification | One employee's certificate (dates, documents) | models/crm_oem.py:136 |
| `oem.learning.dev` | Learning Development | One employee working towards a course certification, tracked in kanban stages | models/crm_oem.py:250 and **redefined** at :310 |
| `oem.learning.employee.certification` | Employee Certification for OEM Learning | Employee line on a learning record | models/crm_oem.py:183 and **redefined** at :295 |
| `learning.stage` | Learning Stage | Kanban stages for Learning Development | models/crm_oem.py:164 |
| `crm.compliance.company` | Compliance Organization ("Compliance Body") | Issuing body (for example a tax authority or regulator) | models/crm_compliance.py:90 |
| `crm.compliance` | Compliance | One compliance item, such as a licence, with an Active/Expired status | models/crm_compliance.py:3 |
| `crm.compliance.lines` | Compliance History | One validity period with documents | models/crm_compliance.py:55 |
| `crm.tag.type` | CRM Tag Type | Free-text tag category | models/crm_tag.py:4 |
| Wizard `crm.oem.booking.add.lines` | Add purchase lines | Choose purchase lines for a booking | wizards/oem_booking_add_lines.py:6 |
| Wizard `crm.oem.set.lines` | Set OEM | Tag many purchase lines with one OEM at once | wizards/oem_set_lines.py:4 |
| Wizard `pass.fail.wizard` | Pass/Fail Wizard | Record the result of a certification attempt | wizards/pass_fail_wizard.py:5 |

### 2.2 Inherited models

| Model | Added fields / behaviour | File |
|---|---|---|
| `crm.lead` | `vendor_lead_ids`: the "Vendor Opportunities" tab | models/crm_lead.py:7 |
| `crm.tag` | `tag_type_id` (Tag Type, many2one), `tag_type` "Tag Type" selection Vendor/Product | models/crm_tag.py:13-14 |
| `hr.employee` | `certification_ids`, `certification_count` (smart button "Certifications"), `oem_certification` "Oem Certification", `color`; `_read` override falls back to `hr.employee.public` for users without employee read rights | models/hr_employee.py |
| `product.template` | `oem_id` "OEM" (new "Channel" tab). Saving it tags the product's untagged, unbooked purchase lines | models/product_template.py:7-13 |
| `product.product` | `write` of `oem_id` tags untagged, unbooked purchase lines | models/product.py:7-21 |
| `purchase.order` | `has_oem` "Has OEM" (computed); "OEM" smart button; cancel hook for bookings | models/purchase.py:9-53 |
| `purchase.order.line` | `oem_id` "OEM", `oem_booking_id` "OEM Booking", `usd_subtotal` "Subtotal (USD)", `usd_rate` "USD Rate", `po_confirmed_date` "Confirmed On", `po_state` "PO Status"; automatic OEM inference; Remove-from-booking; protection against changing the OEM of a booked line | models/purchase.py:56-153 |

### 2.3 Key fields: OEM Booking (`crm.oem.booking`)

| Field | UI label | Meaning | Line |
|---|---|---|---|
| name | "Portal Reference" (required) | Booking, deal or order reference on the OEM portal | :20 |
| oem_id | "OEM" (required; read-only once lines are linked) | Which OEM | :22 |
| portal_date | "Portal Date" | Date shown on the portal, for reference only | :23 |
| state | Draft / Confirmed | See section 3 | :25 |
| currency_id | "Currency" (default USD) | Currency of the portal figure | :28 |
| recognised_amount | "OEM-Recognised Amount" (required, ≥ 0) | What the OEM credits | :30 |
| recognised_usd | "Recognised (USD)" (computed, stored) | Recognised amount in USD | :33 |
| line_ids | "Purchase Lines" | Purchase lines covered. A line can belong to only one booking | :35 |
| lines_cost_usd | "Purchase Cost (USD)" | What Tritel paid the distributors | :37 |
| distributor_margin_usd | "Distributor Margin (USD)" | Cost minus recognised | :40 |
| margin_pct | "Distributor Margin (%)" | Margin ÷ cost | :42 |
| booking_date | "Booking Date" (computed) | Latest PO confirmation date. **Decides which review window the booking counts in** | :48 |
| distributor_names | "Distributors" | Supplier names on the linked POs | :53 |
| margin_warning / line_state_warning | (yellow/red banners) | See 2.4 | :45-46 |
| notes | "Notes" tab | Free text | :54 |

### 2.4 Computed fields: exact calculations

| Field (file:line) | Calculation | Worked example (dummy) |
|---|---|---|
| `usd_subtotal`, `usd_rate` on PO line (purchase.py:75-88) | Rate = order currency → USD on the PO **confirmation date**, falling back to order date, then now. USD subtotal = line subtotal (untaxed) × rate, rounded. USD lines use rate 1 | Line KES 1,300,000, rate 0.0077 → USD 10,010.00 |
| `lines_cost_usd` (crm_oem_booking.py:69) | Sum of linked lines' `usd_subtotal` | 2 lines USD 6,000 + 4,000 → 10,000.00 |
| `booking_date` (:70-71) | Latest `date_approve` among the linked POs, as a date. Empty if no lines | POs confirmed 3 Mar and 18 Mar → 18 Mar |
| `recognised_usd` (:72-77) | If the currency is not USD: convert at the rate on booking_date, else portal_date, else today. Otherwise the amount as entered | EUR 8,000 at 1.10 → USD 8,800.00 |
| `distributor_margin_usd` (:78) | lines_cost_usd − recognised_usd | 10,000 − 9,000 = 1,000.00 |
| `margin_pct` (:79-80) | margin ÷ lines_cost_usd × 100 (0 if no cost) | 1,000 ÷ 10,000 = 10.00 % |
| `margin_warning` (:82-89) | Lines exist and margin < 0 → "The OEM recognises more than was paid for these lines. Check the amount or the linked lines." Lines exist and margin % > 25 (`MARGIN_WARN_PCT`, :6) → "Distributor margin of X% is unusually high. Check the amount or the linked lines." | Cost 10,000, recognised 7,000 → 30 % → warning |
| `line_state_warning` (:96-102) | Lists linked POs not in state purchase/done: "Includes lines from purchase orders that are no longer confirmed: {POs}. Reset to draft, remove them, check the amount and confirm again." | A linked PO is cancelled → red banner |
| `purchase_order_ids` (:68) | Distinct POs of the lines (not stored) | |
| OEM `recognised_ytd_usd` "OEM-Recognised YTD (USD)" (:170) | Sum of recognised_usd over the OEM's **confirmed** bookings with booking_date on or after 1 Jan of the current year | 3 bookings USD 5k + 9k + 6k → 20,000 |
| OEM `lines_cost_ytd_usd` "Purchase Cost YTD (USD)" (:171) | Same bookings, sum of lines_cost_usd | 23,000 |
| OEM `avg_margin_pct` "Average Distributor Margin (%)" (:172) | (cost YTD − recognised YTD) ÷ cost YTD × 100 (weighted, not an average of the percentages) | (23,000−20,000)/23,000 = 13.04 % |
| OEM `awaiting_usd` "Awaiting OEM Confirmation (USD)", `awaiting_count` (:174-182) | PO lines tagged with this OEM, PO purchase/done, PO confirmed this year, no booking or booking not confirmed: sum of USD subtotals and count | 4 such lines totalling USD 12,500 |
| OEM `purchase_order_count` "Purchase Orders" (crm_oem.py:114) | Distinct POs with lines tagged to this OEM, excluding states 'cancelled' and 'draft' (see Gap G6) | |
| OEM `vendor_lead_count` (:56), `course_count`, `certification_count` (:60) | Counts of the related records | |
| PO `has_oem` (purchase.py:14) | True if any line has an OEM | |
| Wizard `selected_usd` "Selected (USD)" (oem_booking_add_lines.py:20) | Sum of the selected lines' USD subtotals | |
| `crm.compliance.compliance_state` "Compliance Status" (crm_compliance.py:22) | "Active" if the history line with the latest end date is Active, else "Expired" | Latest line ends 30 Jun next year → Active |
| `crm.compliance.lines.state` (:69-75) | "Active" if end date > today, else "Expired" (also Expired when there is no end date) | Ends today → Expired |
| `crm.compliance` date_start/date_end (:30-41) | Dates of the history line with the latest end date | |
| `attachment_url` (:26) | Link to the first document on the latest line | |
| `crm.oem.certification.attachment_state` "Attached" (crm_oem.py:157) | Yes if any document is attached, else No | |
| `oem.learning.dev.kanban_state` first definition (:279) | Overridden by the second class (:345). Not effective | |

## 3. Workflows

### 3.1 State/selection fields

| Model.field | Values (label) |
|---|---|
| crm.oem.booking.state | draft "Draft", confirmed "Confirmed" |
| crm.oem.state | draft "Onboarding", open "Active", closed "Archived" |
| crm.distributor.state | draft "Onboarding", open "Active", closed "Archived" |
| oem.learning.dev.kanban_state (statusbar, clickable) | draft "Registration", ongoing "Ongoing", pass "Pass", fail "Fail" |
| oem.learning.dev.state | registration / ongoing / completion (no UI seen) |
| oem.learning.dev.stage_id | learning.stage: "Planning"(draft), "Ongoing", "Passed"(pass), "Failed"(fail) (data/learning_stages.xml) |
| oem.learning.employee.certification.state | registration / ongoing / certified |
| crm.oem.certification.state | active "Active", expired "Expired" (manual, no automation) |
| learning.stage.kanban_state | as for learning dev kanban_state |
| crm.compliance.compliance_state / lines.state | computed, Active/Expired |
| crm.tag.tag_type | vendor "Vendor", product "Product" |
| pass.fail.wizard.state "Certification Status" | pass "Pass", fail "Fail" |

### 3.2 Transitions

| Object | From → To | Button label | Method | Who can trigger |
|---|---|---|---|---|
| OEM Booking | Draft → Confirmed | "Confirm" | `action_confirm` (crm_oem_booking.py:118) | Channel Manager/Admin, Purchase Manager (write ACL) |
| OEM Booking | Confirmed → Draft | "Reset to Draft" | `action_reset_draft` (:130) | same |
| OEM Booking | (Draft) add lines | "Add purchase lines" → wizard "Add to booking" | `action_add_lines` (:133) / `action_add` (wizard :25) | same; lines are written with sudo |
| OEM Booking | (Draft) remove line | "Remove" (red ×, per line) | `purchase.order.line.action_remove_from_oem_booking` (purchase.py:97) | button limited to `crm_tender.group_manager`, `purchase.group_purchase_manager` |
| Purchase order | any → Cancelled | "Cancel" (standard) | `button_cancel` → `_oem_bookings_on_cancel` (purchase.py:25-53) | Purchase users |
| OEM | Onboarding → Active | "Confirm" (confirm prompt "Set Active?") | `set_open` (crm_oem.py:52) | users with OEM write rights (CRM leads group) |
| OEM | Active → Onboarding | "Draft" | `set_draft` (:48) | same |
| OEM | any → Archived / Onboarding | Archive / Unarchive (standard) | `write` override sets state closed/draft (:39-46) | same |
| Distributor | same three as OEM | "Confirm" / "Draft" / archive | crm_oem.py:232-247 | all internal users (global ACL) |
| Learning Development | Ongoing → Pass/Fail | "Pass/Fail Certification" (visible only in Ongoing) → wizard "Submit" | `action_pass_fail` (:375) → `update_certification` (wizard :19) | write: Channel User+; create: Manager+; delete: Admin |
| Learning Development | any ↔ any | click statusbar / drag kanban stage | onchanges (:363-373) | same |
| Compliance | add validity period | "Create" (header) | `crm_compliance_line_view_form_new_action` (crm_compliance.py:44) | everyone (global ACL) |

## 4. Menus and views

Root app menu **"Channel"** (crm_oem_views.xml:415, own icon, sequence 6).

| Menu path | Action (model) | Views | What the user does |
|---|---|---|---|
| Channel › OEMs(Vendors) | `crm_oem_action` "CRM OEMs" (crm.oem; shows archived too) | kanban, list, form | Maintain OEMs. Smart buttons: "Opportunities" (Vendor Pipeline), "Purchase Orders", "Bookings", "Awaiting OEM". Section "Channel performance this year (USD)". Tabs "Distributors", "Solution Engineers", "Certifications"; kanban has a portal-link button |
| Channel › OEM Bookings | `action_crm_oem_booking` (grouped by OEM) | list, form, pivot, graph | Record portal value, add lines, confirm. Filters "Confirmed", "Draft", "This Year"; group by "OEM", "Booking Month" |
| Channel › Untagged Purchases (Channel Manager only) | `action_purchase_lines_untagged` (purchase.order.line; confirmed POs since **2026-01-01**) | editable list | Set the OEM on each line inline, or select lines and use Action › "Set OEM". Default filter "No OEM", grouped by "Distributor" |
| Channel › Distributors | `action_crm_distributor` | kanban, list, form | Maintain distributors (tab "OEMs(Vendors)") |
| Channel › Certifications | `action_oem_certification` "OEM(Vendor) Certification" | kanban, list, form | Staff certificates, grouped by OEM and Course. Filters "Active", "Attached", "Not Attached" |
| Channel › Learning Development | `action_oem_learning` | kanban, list, form | Track staff certification progress |
| Channel › Configuration › Courses | `action_oem_courses` "OEM(Vendor) Courses" | list, form | Courses, minimum requirement, certification name |
| Channel › Configuration › Learning Stages | `action_learning_stages` | list, form | Stage set-up |
| Employees › (hr.menu_hr_employee_payroll) › Certifications | `action_oem_certification` | as above | HR view of certificates |
| CRM › Configuration › Tag Types | `crm_tag_type_action` | editable list | Tag categories |
| Tender › Compliance › Compliance | `crm_compliance_action` (grouped by body) | kanban, list, form | Compliance items. "Create" adds a validity period with documents |
| Tender › Compliance › Compliance Organization | `crm_compliance_company_action` "Compliance Company" | kanban, list, form | Issuing bodies |
| Tender › Compliance › Compliance Calendar | `action_compliance_history` "Compliance Churn" | calendar, list, form, cohort | Expiry calendar |
| Tender › Compliance › Compliance Churn | `action_compliance_churn` "Compliance History" | cohort | Renewal and churn analysis |

(The Compliance menus have parent `tritel_tender_tracker.tender_root_menu`, crm_compliance_views.xml:100.)

**Additions to other screens**

| Screen | Addition | File |
|---|---|---|
| CRM opportunity form | New tab **"Vendor Opportunities"** after Internal Notes: editable list with Name (the opportunity name), OEM (`vendor_id`), Tags (`tag_ids`, product tags), "Estimated Value" (`amount`). **No buttons or other fields** | views/crm_lead_views.xml:9-19 |
| Vendor Pipeline (from OEM "Opportunities" button) | Opportunities kanban/list, search pre-filled with the OEM name | crm_lead_views.xml:37; crm_oem.py:65 |
| Purchase order form | "Has OEM" after Vendor; "OEM" smart button (lines grouped by OEM); "OEM" column on lines (optional) | views/purchase_views.xml |
| Product form | Tab "Channel" with "OEM" | views/product_template_views.xml |
| Employee form | Smart button "Certifications" | views/hr_employee.xml |
| CRM tag list | "Tag Type" columns | views/crm_tag.xml:23-32 |
| Purchase lines list (any) | Action › "Set OEM" (Channel Manager group) | crm_oem_booking_views.xml:255-263 |

## 5. Roles

Category **"Channel"** (security/crm_tender_security.xml): User ⊂ Manager ⊂ Administrator.

| Group | Can do | Likely Tritel department |
|---|---|---|
| Channel / User (`crm_tender.group_user`) | Read OEM bookings only; Learning Development read/write (no create) | Channel, Commercial (guess) |
| Channel / Manager (`group_manager`) | Full CRUD on bookings; Add-lines and Set-OEM wizards; "Remove" button; "Untagged Purchases" menu; read-only on purchase.order and purchase.order.line; create Learning Development | Channel manager (guess) |
| Channel / Administrator | Plus delete Learning Development | Channel lead / IT (guess) |
| Purchase / Administrator (`purchase.group_purchase_manager`) | Full CRUD on bookings and both wizards; "Remove" button | Finance & Accounts / Procurement (guess) |
| CRM "use leads" (`crm.group_use_lead`) | OEM read/write/create (no delete) | Commercial |
| Sales "All Documents" (`sales_team.group_sale_salesman_all_leads`) | OEM full incl. delete | Commercial managers |
| All internal users (ACLs with no group) | Full CRUD on vendor leads, tag types, compliance (all 3 models), distributors, courses, certifications, employee-certification lines, learning stages | Everyone, including HR (certifications) and Commercial/Bids (compliance) |

No record rules (`ir.rule`) in the module.

## 6. Automations

| Trigger | Effect | File |
|---|---|---|
| New purchase line (create) without an OEM | OEM inferred: the product's OEM; otherwise, if the supplier (or its company) is a Distributor carrying exactly **one** OEM, that OEM | purchase.py:117-143 |
| Product chosen on a PO line (onchange) | Same inference if no OEM is set yet | purchase.py:131 |
| OEM set on a product/template | Product's existing purchase lines with no OEM and no booking are tagged | product.py:13; product_template.py:9 |
| "Set OEM" wizard with "Also set on the products" (default on) | Lines tagged (booked lines skipped); products **without** an OEM also get it; toast "N line(s) tagged {OEM}." | oem_set_lines.py:16-28 |
| PO cancelled, booking **Draft** | Lines removed from booking; chatter note "{PO} was cancelled, so its lines were removed: … By {user}." | purchase.py:41-45 |
| PO cancelled, booking **Confirmed** | Lines stay; chatter note "…was cancelled, but this confirmed booking still includes: … Reset it to draft, remove the lines, check the recognised amount and confirm again." + **To-Do activity** for the booking creator: "{PO} was cancelled: correct this booking" (only if that user is active and can read bookings); red banner on form | purchase.py:46-53 |
| "Remove" on a booking line | Chatter note "Removed {PO · product · USD x}. By {user}." | purchase.py:111 |
| Pass/Fail wizard "Submit" with Pass, no certificate yet | Creates a `crm.oem.certification` (employee, start/end dates from learning record) | pass_fail_wizard.py:25-34 |
| Archive/unarchive OEM or Distributor | state → Archived / Onboarding | crm_oem.py:39, :232 |
| Migration 16.0.0.2 | Computed USD values for all PO lines; auto-tagged confirmed lines since 2026-01-01 where the OEM was certain | migrations/16.0.0.2/post-migrate.py |
| Data | 4 learning stages (noupdate) | data/learning_stages.xml |

No crons, no mail templates, no emails sent.

## 7. Validation messages

| Text | Type | File:line | When |
|---|---|---|---|
| "The recognised amount cannot be negative." | SQL constraint | crm_oem_booking.py:57 | Saving a negative OEM-Recognised Amount |
| "{n} linked line(s) are not tagged {OEM}: {POs}. Tag them first or remove them." | ValidationError | crm_oem_booking.py:109 | Saving a booking with lines whose OEM differs |
| "Only lines on confirmed purchase orders can be booked: {POs}." | ValidationError | crm_oem_booking.py:114 | Saving a booking whose lines' PO is not Purchase Order/Locked. **Also fires on any later booking save after a linked PO is cancelled** (see G4) |
| "'{ref}': link the purchase lines this booking covers before confirming." | UserError | crm_oem_booking.py:121 | Confirm with no lines |
| "'{ref}': enter the amount the OEM recognises." | UserError | :123 | Confirm with amount 0 |
| "'{ref}': remove the lines from purchase orders that are no longer confirmed before confirming: {POs}." | UserError | :126 | Confirm with lines on unconfirmed POs |
| "Reset confirmed bookings to draft before deleting them." | UserError | :143 | Deleting a confirmed booking |
| "'{ref}' is confirmed. Reset the booking to draft before removing lines." | UserError | purchase.py:108 | "Remove" on a confirmed booking (server-side guard; button is hidden anyway) |
| "{n} line(s) are already in an OEM booking ({refs}); remove them from the booking before changing their OEM." | UserError | purchase.py:149 | Changing the OEM of a booked line (unless context `crm_tender_allow_booked_oem`) |
| Standard access error | AccessError | purchase.py:105-106; oem_booking_add_lines.py:31 | Removing/adding lines without booking write rights |

Non-blocking banners: margin_warning and line_state_warning (section 2.4).

## 8. Cross-module touchpoints

**Tender tracker (`tritel_tender_tracker`)**
- Tender tracker **depends on** crm_tender (tritel_tender_tracker/__manifest__.py:18).
- Opportunity ↔ tender is defined **in the tender tracker, not here**: `tender.initial.crm_lead_id` "Source/Pipeline" (tritel_tender_tracker/models/models.py:105). `crm.lead.tender_ids` "Tenders", `tenders_count`, `account_manager_id`, `technical_presales_id` (tritel_tender_tracker/models/crm_lead.py:8-13). Winning or losing a tender calls `crm_lead_id.action_set_won()` / `action_set_lost()` (models.py:534, 562, 593).
- Tenders use crm_tender's OEMs: `tender.initial.oem_ids` "OEMs" (models.py:61), shown on the tender form, the portal tender page, project summaries, the summary library and the marketing-pack wizard.
- `purchase.order.tender_id` is added by the tender tracker (tritel_tender_tracker/models/purchase.py:6). The accountability worksheet shows the tender reference for OEM lines when it is present.
- crm_tender places its Compliance menus under `tritel_tender_tracker.tender_root_menu`, but does not list the tender tracker as a dependency (see G1).

**Accountability framework** (`tritel_accountability_framework/models/metric_hook_oem.py`; no manifest dependency, hooks offered only when the models exist)
- Hook **"OEM-recognised revenue (USD)"** (:23-121) sums `recognised_usd` of **confirmed** bookings for the chosen OEM ("Measured For") with `booking_date` inside the review window. It shows cost and margin, and lists tagged PO lines confirmed in the window without a confirmed booking as "awaiting OEM confirmation (not counted)". `settle_days=30`.
- Ratio metric "OEM-recognised revenue vs target" (accountability_metric.py:282).
- Hook **"OEM pipeline (vendor leads)"** (:125-161) sums `crm.vendor.lead.amount` for the OEM on active, open (not won, not folded-stage) opportunities, as a snapshot with no currency conversion. Vendor leads without a value are flagged.
- Training point: a booking counts in the month of its **latest PO confirmation**, not the portal date. Late confirmations of a booking change past figures until the settle period ends.

**Purchase**: PO lines carry OEM, USD value, booking link; cancel hook; Purchase Managers co-own bookings.

**HR**: certifications on the employee form and in the Employees menu; `hr.employee._read` override for restricted readers.

## 9. Gaps / questions for the product owner

| # | Gap / question |
|---|---|
| G1 | Compliance menus need `tritel_tender_tracker.tender_root_menu`, but crm_tender does not depend on the tender tracker, and the tender tracker depends on crm_tender. This works only if the menu already exists; a fresh install of crm_tender alone would fail. Should Compliance move to the tender tracker? |
| G2 | The brief says bookings are "booked against an opportunity". In the code they link to PO lines only, with no opportunity or tender field. Is a link to the opportunity or tender wanted? |
| G3 | `crm.oem.write` and `crm.distributor.write` do not return the result of `super()` (crm_oem.py:46, 239), and they set state on unarchive to "Onboarding" even when the record was Active before. Intended? |
| G4 | After a PO is cancelled, a **confirmed** booking keeps the line. The `_check_lines` constraint then blocks **any** save of that booking (even Notes) with "Only lines on confirmed purchase orders…" until it is reset and the line removed. Is that acceptable? |
| G5 | `oem.learning.dev` and `oem.learning.employee.certification` are each defined twice (crm_oem.py:183/295, :250/310). The second definition wins, so `kanban_state` is not computed. Which Learning Development behaviour is current? Is anyone using Learning Development? |
| G6 | `purchase_order_count` and the OEM PO-lines action exclude state 'cancelled', but Odoo's cancelled state is 'cancel', so cancelled POs are still counted (crm_oem.py:111, 116). |
| G7 | The Untagged Purchases worklist has a hard-coded start date of 2026-01-01 (crm_oem_booking_views.xml:375). Should it move each financial year? |
| G8 | The margin warning threshold of 25 % is hard-coded (crm_oem_booking.py:6). Is that the right threshold? |
| G9 | The Channel / User group can only read bookings, and Channel menus have no group restriction except Untagged Purchases. Who should see OEM Bookings? Which Tritel department owns Channel? |
| G10 | Many models have global ACLs (all internal users have full CRUD, including delete) on compliance, distributors, certifications and vendor leads. Intended? |
| G11 | Vendor Opportunity "Estimated Value" has no currency; the OEM pipeline metric sums it as entered. Which currency should users enter? |
| G12 | `crm.oem.certification.state` (Active/Expired) never changes automatically, and nothing alerts on compliance or certificate expiry. Are reminders wanted? |
| G13 | Tag Types: both `tag_type_id` (configurable) and `tag_type` (fixed Vendor/Product) exist; only `tag_type == 'product'` is used (vendor lead tags). Which one should users fill in? |
| G14 | Solution Engineers tab and "Certifications" tab on the OEM form (tree with no columns, crm_oem_views.xml:179-184): are these in use? |

## 10. Sources

`__manifest__.py`; `models/{__init__,crm_compliance,crm_lead,crm_oem,crm_oem_booking,crm_tag,hr_employee,product,product_template,purchase}.py`; `wizards/{__init__,oem_booking_add_lines,oem_set_lines,pass_fail_wizard}.py`, `wizards/pass_fail_wizard.xml`; `views/{crm_lead_views,crm_oem_booking_views,purchase_views,hr_employee,crm_tag,product_template_views}.xml` (full), `views/crm_oem_views.xml` and `views/crm_compliance_views.xml` (structure, menus, headers, key forms); `security/{crm_tender_security.xml,ir.model.access.csv}`; `data/learning_stages.xml`; `migrations/16.0.0.2/post-migrate.py`. No `report/` folder; `static/` holds only the icon.
Cross-module: `tritel_tender_tracker/__manifest__.py`, `models/crm_lead.py`, `models/models.py` (oem_ids, crm_lead_id), `models/purchase.py`, grep of tender tracker for oem/crm.lead; `tritel_accountability_framework/__manifest__.py`, `models/metric_hook_oem.py`, `models/accountability_metric.py:268-310`.
