# Commercial Targets: discovery notes

Module: `tritel_tender_tracker` (manifest version 16.0.1.23.0). Covers the older Commercial Targets screens: role targets, individual targets, achievements, periods, and the `/my/targets` and `/my/achievements` portal pages. The rest of the tender module is in `tenders.md` and is not repeated here.

**Target accounts are a different feature.** `models/target_accounts.py` adds "Target Account", "Target Tier" (Strategic / Growth / Maintain), "Proposed Target" and "Segment" to the customer (`res.partner`). These belong to **account ownership / market coverage**, not to Commercial Targets. That file has no link to `target.*` models. Its write guard imports `can_assign` from `account_ownership.py` (target_accounts.py:13, 115-125). Its setting "Market Coverage measures against" sits with market coverage (target_accounts.py:184-190). It is excluded below.

---

## 1. Purpose

Commercial Targets gives each commercial person a target for a period. It then credits them with a share of every tender won:

- A **period** is a time window, for example a quarter, such as "Q1 2026".
- A **role target** (`target.target`) is a sum for one role in one period, for example "Account Managers: KES X revenue". A named owner (a head) holds it.
- An **individual target** (`target.line`) splits the role target into one figure per person.
- An **achievement** (`target.achievement`) is created by hand when a tender is won. Each person on the tender is credited with the tender value multiplied by attribution points (0–100). The points come from three stages: Pipelining, Bid Submission Support and Post-Submission Influence. Each role has its own maximum points per stage.
- Achievements add up into the individual target, then into the role target, then into the period. Each level shows "% achieved" and a status: Exceeded / On Track / At Risk / Behind.

---

## 2. Models

### 2.1 `target.period`: "Commercial Target Period" (target_period.py:5-89)

| Field | UI label | Meaning |
|---|---|---|
| `name` | "Period Name" | For example "Q1 2026" (required) |
| `date_from` / `date_to` | "Date From" / "Date To" | Window (required) |
| `state` | "State": "Draft" / "Active" / "Closed" | Default Draft. **Nothing reads it.** Period lookup ignores the state (see 3.1) |
| `target_ids` | "Role Targets" | Role targets filed in this period |
| `total_target_value` (computed, stored) | "Total Target Value" | Sum of the role targets' **"Target Value"** (manual figure) |
| `total_achieved_value` (computed, stored) | "Total Achieved Value" | Sum of the role targets' "Achieved Value" |
| `achievement_pct` (computed, stored) | "Achievement (%)" | Achieved ÷ Target × 100, 1 decimal; 0 if no target (target_period.py:46-54) |
| `target_count` | "Role Targets" | Number of role targets |

`_find_period_for_date(d)` returns the first period whose window contains `d`, whatever its state (target_period.py:72-80). Several other records use it to find their period:
- Tender "Period": award date, otherwise submission deadline, otherwise created date (models.py:243-253).
- Opportunity "Period": expected closing date, otherwise created date (crm_lead.py:24-32).
- Achievement "Period" (see 2.4).

Worked example: role targets of 10,000,000 and 4,000,000, with achieved values of 6,000,000 and 1,000,000. The period shows Achievement (%) = 7,000,000 ÷ 14,000,000 × 100 = **50.0**.

### 2.2 `target.target`: "Target" (role target; target.py:11-311)

| Field | UI label | Meaning |
|---|---|---|
| `name` | "Name" | Required |
| `target_type` | "Target Type": "Revenue" / "Number of Tenders" | Label only. **No calculation uses it**; the count-based logic is commented out (target.py:255-264) |
| `role` | "Role": "Account Manager" / "Bid Liaison" / "Technical Presales" | Required. Its individual targets inherit it |
| `employee_id` | "Target Owner" | Required. The **head** who owns the role target (the portal treats it this way, portal_tender.py:207-245) |
| `period_id` | "Period" | Picking a period copies its dates into Date From/To (onchange, target.py:202-206) |
| `date_from` / `date_to` | "Date From" / "Date To" | Required |
| `target_value` | "Target Value" (form KPI "Target") | Typed in by hand |
| `computed_target_value` | "Computed Target Value" (form KPI "Line Target") | Sum of the individual targets' "Target Value" (target.py:126-136). **It is not checked against Target Value** |
| `gross_value` | "Gross Value" (KPI "Gross") | Sum of the individual targets' Gross Value (138-147) |
| `achieved_value` | "Achieved Value" (KPI "Achieved") | Sum of the individual targets' Achieved Value (149-158) |
| `target_vs_gross` | "Target vs Gross (%)" (list "vs Gross %") | Gross ÷ **Target Value** × 100, 1 decimal (160-168) |
| `target_vs_achieved` | "Target vs Achieved (%)" (list "vs Achieved %") | Achieved ÷ **Target Value** × 100 (170-178) |
| `kanban_state` | "Kanban State" | From Target vs Achieved: ≥100 "Exceeded", ≥75 "On Track", ≥50 "At Risk", otherwise "Behind" (185-196) |
| `has_achievements` | "Has Achievements" | True when the role target has **any individual target**, despite the name (180-183) |
| `line_count` | "Line Count" | Number of individual targets |

All the percentages divide by the manual "Target Value", not by "Line Target".

### 2.3 `target.line`: "Target Line" (individual target; target.py:314-548)

| Field | UI label | Meaning |
|---|---|---|
| `target_id` | "Target" | Parent role target (required; deleted with the parent) |
| `employee_id` | "Employee" | The person (required). It does not have to match the Target Owner |
| `role` | "Role" | Copied from the parent (read-only) |
| `period_id` | "Period" | Copied from the parent (read-only) |
| `date_from` / `date_to` | "Date From" / "Date To" | Required. Entered on each line; **not copied from the parent** |
| `target_value` | "Target Value" | The person's quota |
| `gross_value` | "Gross Value" | Sum of the achievements' Gross Value (463-473) |
| `achieved_value` | "Achieved Value" | Sum of the achievements' Achieved Value (475-484) |
| `achievement_pct` | "Achievement (%)" (role target tab: "Ach. %") | Achieved ÷ Target × 100, 1 decimal, capped at 999.9 (486-494) |
| `achievement_state` | "Achievement State" | Same bands as 2.2: ≥100 Exceeded, ≥75 On Track, ≥50 At Risk, otherwise Behind (496-503) |
| `achievement_count` | "Achievement Count" | Number of achievements |

The display name is "<Target name> - <Employee>" (408-412). Searching matches the target or the employee (441-450).

Worked example: target 5,000,000, with achievements of 2,500,000 and 1,400,000. Achieved = 3,900,000 → 78.0% → "On Track".

### 2.4 `target.achievement`: "Target Achievement" (target.py:551-853; has chatter)

| Field | UI label | Meaning |
|---|---|---|
| `name` | "Name" (form label "Achievement"; list/search label "Opportunity") | Required. Filled automatically as "Q<n> <year>" from the award date (see below) |
| `target_line_id` | "Target Line" (tender tab: "Target") | Required; it chooses the person. Read-only after the first save |
| `target_id` | "Target" | Copied from the individual target |
| `employee_id` | "Employee" | Copied from the individual target |
| `role` | "Role" | **Entered separately (required)**; not copied from the target. It sets the stage maximums |
| `tender_id` | "Tender" | The won tender |
| `partner_id` / `crm_lead_id` | "Customer" / "Opportunity" | Copied from the tender |
| `award_date` | "Award Date" | Copied from the tender |
| `date_from` / `date_to` | "Date From" / "Date To" | Required. Set to the calendar quarter of the award date (target.py:761-787) |
| `period_id` | "Period" | Award date's period, otherwise the individual target's period, otherwise the period of Date From (660-671) |
| `pipelining_pct` | "Pipelining" | Stage points, 0 to the role maximum |
| `bid_support_pct` | "Bid Submission Support" | Stage points |
| `post_submission_pct` | "Post-Submission Influence" | Stage points |
| `achieved_value_percentage` | "% Achievement" | Sum of the three stage points (maximum 100) (799-805) |
| `gross_value` | "Gross Value" | The tender's "Expected Revenue" in company currency, split equally between this role's lines on the tender (see below) |
| `achieved_value` | "Achieved Value" | Gross × % Achievement ÷ 100 |
| `res_partner_activity_ids` | "Related Activities" (tab "Activities") | Customer activities linked by "Compute Related Activities" |

**Stage maximums per role** (target.py:790-794; the form banners read "Attribution Model — …"):

| Role | Pipelining | Bid Submission Support | Post-Submission Influence | Total |
|---|---|---|---|---|
| Account Manager | 40 | 20 | 40 | 100 |
| Bid Liaison | 0 (hidden) | 60 | 40 | 100 |
| Technical Presales | 60 | 40 | 0 (hidden) | 100 |

**Gross value split** (target.py:681-742). The system finds every achievement on the same tender with the same role. Gross = tender Expected Revenue (company currency) ÷ number of those achievements. Achieved = Gross × % ÷ 100.

**Automatic stage scores** (target.py:823-840). The "Compute Related Activities" button links every customer activity on the tender, and on the tender's opportunity, whose "Responsible" user is this employee's user (842-850). It then sets each stage score = min(valid activities in that phase ÷ 3, 1) × stage maximum, rounded to 1 decimal. Activity validity and phase come from `res.partner.activity` (res_partner.py:216-285):

- Activity on an **opportunity** → valid if logged on or after the opportunity was created; phase "Pipelining".
- Activity on a **tender** → valid if logged on or after the tender was created and not after the award date. Phase "Bid Submission Support" if logged on or before the submission deadline, otherwise "Post-Submission Influence".
- Not linked to either → not valid ("Not linked to a pipeline or tender").
- "Logged" means the record's created date, not the activity's "Date" field.

**Worked example.** A won tender has Expected Revenue of 2,000,000. Two Account Managers have achievement lines on it, so each gets Gross = 1,000,000. AM-1 has 2 valid Pipelining, 3 Bid Support and 1 Post-Submission activities:

- Pipelining = 2/3 × 40 = 26.7
- Bid Support = 1 × 20 = 20
- Post-Submission = 1/3 × 40 = 13.3
- % Achievement = 60.0 → Achieved Value = 600,000

The Bid Liaison on the same tender is the only line for that role, so their Gross = 2,000,000.

**Achievement colour bands** are different from the target bands:
- Form ribbon: "Excellent" ≥ 90, "Meets Expectation" 50–<90, "Below Target" < 50.
- Search filters: "🏆 Excellent (≥ 90%)", "🎯 Meets Expectations (50–90%)", "⚠️ Below Target (< 50%)".
- List: green / amber / red (target_views.xml:1138-1180, 1203-1217, 1749-1758).

---

## 3. Workflows

### 3.1 Period states (target_period.py:82-89; form target_period_views.xml:33-41)

| Button | Method | Shown when | Result |
|---|---|---|---|
| "Set Active" | `action_activate` | State is not Active | → Active |
| "Close Period" | `action_close` | State is Active | → Closed |
| "Reset to Draft" | `action_reset_draft` | State is Closed | → Draft |

No group restriction: any internal user can click them. **Closing a period locks nothing.** No code checks the state.

### 3.2 Role and individual targets
These have no state. Each person's status (Exceeded / On Track / At Risk / Behind) is recalculated whenever their achievements change.

### 3.3 Attributing a won tender (manual)
1. A tender becomes Won or Prequalified. Its "Target Achievements" tab appears (tender_views.xml:408-428).
2. The tender gets flags (models.py:193-210):
   - "HoC Attribution Pending" is set if the tender is **Won** and its Account Manager or Bid Liaison has no achievement line. It is for the Head of Commercial.
   - "HoCh Attribution Pending" is set if the tender is Won and the Technical Presales person has no line. It is for the Head of Channel.
   - A Prequalified tender earns nothing; its RFQs earn instead.
   - Each flag also turns the tender's urgency to "Warning" (models.py:219-226).
3. My Actions shows "Achievements to attribute", with the hint "Attribute the achievement on the tender's Target Achievements tab." (my_actions.py:96-104).
4. The head adds a line on that tab. They choose "Target" (the individual target), "Role", the % or stage points and "Name". The quarter dates come from the award date.
5. To score from activities, they open the line and click **"Compute Related Activities"** (form header, target_views.xml:1187-1190). This **overwrites** any points typed by hand.

Who can do this: the menus and access rights do not restrict it. Every internal user has create, read, write and delete rights on achievements and individual targets (ir.model.access.csv:28-29). The head roles exist only in the My Actions routing.

---

## 4. Menus, views and portal pages

All menus sit under "Tender Manager". None of them is limited to a group (target_views.xml:620-623, 1068-1069, 1824-1825; target_period_views.xml:114-118).

| Path / URL | Model, views | What the user does or sees | Who |
|---|---|---|---|
| Tender Manager › Commercial Targets › **Dashboard** (action "Targets Dashboard") | `target.target` kanban, list, form | Cards grouped by Role, "Current Period" filter on. Each card shows Target, Line Target, Gross, Achieved and a status colour. The form has buttons "Target lines" and "Achievements", KPIs "Target / Line Target / Gross / Achieved / vs Gross / vs Achieved", groups "Classification" and "Period & Value", and a "Target Lines" tab that can be edited in place. Filters: "Current Period", "Has Lines", the four states, "Account Managers / Bid Liaisons / Technical Presales". Group by: Period, Role, Target Type, Employee, State | All internal users. Cannot delete (no delete right) |
| … › **Manage Individual Targets** (action "Targets") | `target.line` kanban, tree, form | Form buttons "Target" and "Achievements"; groups "General" and "Values"; read-only "Achievements" tab. Filters: state, "Current Period"; group by Period / State / Employee / Role | All internal users (can delete) |
| … › **Target Achievements** | `target.achievement` kanban, list, form | Form: "Compute Related Activities"; "Tender" button; role banner; groups "Employee & Role", "Tender / Opportunity", "Period", "Stage Attribution", "Financial Performance"; "Activities" tab (valid ones coloured by phase). List totals "Total Gross Value" / "Total Achieved". Filters: bands, roles, "This Month"; group by Employee / Role / Target / Tender / Period Start / Period End | All internal users |
| Tender Manager › Configuration › **Target Periods** | `target.period` tree, form | List with "Total Target", "Total Achieved", "Achievement %". The form has the state buttons and a read-only "Role Targets" tab | All internal users (cannot delete) |
| Tender form › "Target Achievements" tab | `tender.initial.achievement_ids` | Add or edit attribution lines (visible only when Won or Prequalified) | Anyone who can edit the tender |
| `/my` home tile **"Targets & Achievements"** | Count = the user's own individual targets (all periods) | Opens `/my/targets` | Users in any of the six tender groups (portal_tender_templates.xml:14-28) |
| **`/my/targets`**: "Performance Targets" (portal_tender.py:1763-2045) | Period selector ("Current Period" + list), "All Roles", person pickers ("All Account Managers / All Bid Liaisons / All Tech Presales"), "Clear ×" | Gauge cards for each person. Sections: "My Targets", "My Personal Quota", "My Quota", "Account Manager Targets", "Bid Liaison Targets", "Technical Presales Targets", "Organisation Targets" (table "Owner / Employee, Target, Role, Target Value, Achieved, %, Status"); "No targets for this period." | Needs a linked employee, otherwise error. Account Managers, Bid Liaisons and Technical Presales see only their own individual targets. Head of Commercial: own role targets and quota, plus all AM and BL lines. Head of Channel: own, plus all TP lines. Administrator: everything plus "Organisation Targets" |
| **`/my/achievements`**: "Achievements" (portal_tender.py:2047-2213) | Filters "All Periods / All Roles / All AMs / All BLs / All TPs", "Clear" | Achievements grouped by tender (latest award first), 10 tenders per page. Columns "Employee, Role, Attribution (Pipeline x/40, Bid x/20, Post x/40), Overall %, Gross Value, Achieved Value". The "Total" row shows the **average** % and the **first line's** gross (not a sum). "No achievements found for the selected filters." | Account Managers, Bid Liaisons and Technical Presales: own lines. HoC: own + all AMs and BLs. HoCh: own + all TPs. Admin: all employees |
| `/my/dashboard`, `/my/dashboard2` | Tender dashboards | Target and achievement KPIs and "View All Targets →" / "Achievements →" links (portal_tender_templates.xml:113-1621; portal_dashboard2_templates.xml:538,580) | Tender roles |

Both portal pages record a visit in the portal access log (portal_tender.py:2042, 2210).

---

## 5. Roles

Groups are defined in security.xml:11-56.

| Role | Backend (Commercial Targets) | Portal | Attribution duty |
|---|---|---|---|
| Account Manager | Same as any internal user: full create, read and write on all four models; delete on individual targets and achievements | Own individual targets and achievements | None |
| Bid Liaison | Same | Own | None |
| Technical Presales ("Technical Pre-sales") | Same | Own | None |
| Head of Channel | Same | Own role targets and quota + all TP lines and achievements | Attributes Technical Presales on won tenders ("HoCh Attribution Pending") |
| Head of Commercial | Same | Own + all AM and BL lines and achievements | Attributes AM and BL on won tenders ("HoC Attribution Pending") |
| Administrator | Same | Everything, including "Organisation Targets"; can filter by all three roles | Can see both pending queues in My Actions |
| Portal group "Tender Tracker Portal User" | Read only on period, target, line and achievement. The access rule allows all records (`[(1,'=',1)]`, security.xml:82-113); the controllers narrow what is shown | — | — |

The only Commercial Targets restrictions in the backend are the stage maximums. There are no record rules for internal users.

---

## 6. Automations

| Item | Behaviour | Source |
|---|---|---|
| Scheduled jobs | **None** for targets. The module's two scheduled jobs are summary reminders and Last Seen | data/ir_cron_data.xml |
| Emails / templates | **None** for targets or achievements | data/mail_templates.xml (no target references) |
| Achievement line creation | **Never automatic.** Heads add them by hand on the tender | — |
| Pending-attribution flags | Stored on the tender, recalculated when achievements, the role people or the status change. Shown in My Actions ("Achievements to attribute") and as tender urgency "Warning" | models.py:148-226; my_actions.py:96-104 |
| Stage scores from activities | Only when "Compute Related Activities" is clicked: 3 valid activities in a phase = full stage points | target.py:823-853 |
| Gross / achieved recompute | Automatic when the tender's Expected Revenue (CC), the role or the points change; all sibling lines are recomputed | target.py:681-742 |
| Period filing | Tenders, opportunities and achievements are filed into periods automatically by date | models.py:243-264; crm_lead.py:24-38; target.py:660-671 |
| Migrations | 16.0.1.0.2 backfilled tender and opportunity periods; 16.0.1.0.3 backfilled achievement periods (early versions) | migrations/16.0.1.0.2, 16.0.1.0.3 |

---

## 7. Validation messages

| Message | Where | When |
|---|---|---|
| "End date must be on or after start date." | target_period.py:60 | Period ends before it starts |
| "Period '<name>' overlaps with '<other>'. Target periods must not overlap." | target_period.py:67-70 | Two periods' dates overlap (whatever their state) |
| "Target value must be a positive number." | target.py:243 (role target), 512 (individual) | Target Value < 0 (database rule) |
| "End date must be on or after the start date." | target.py:247 | Role target Date To < Date From |
| "End date must be on or after start date." | target.py:517 | Individual target Date To < Date From |
| "The 'Award Date' field is missing. Please provide a value before executing this action." | target.py:764 | Achievement: Target or Tender is changed while the tender has no Award Date. This can also fire when only the individual target is picked first |
| "'<Stage>' cannot be negative." | target.py:814-816 | A stage points field < 0 |
| "'<Stage>' cannot exceed <max> for role '<Role>'." | target.py:817-821 | Points above the role maximum. For example, Pipelining > 0 for a Bid Liaison gives "'Pipelining' cannot exceed 0 for role 'Bid Liaison'." |
| "You must be linked to an employee to access the tender portal." (AccessError) | portal_tender.py:1779, 2057 | Opening /my/targets or /my/achievements without a linked employee |

---

## 8. Relationship to the Accountability Framework (AF)

**Data flow.** AF reads `target.achievement` only. It never reads `target.target`, `target.line` or `target.period`; its own `period_id` and `target_value` belong to AF models. AF does not declare a dependency on the tender module (its manifest depends on base, web, hr, mail, portal, web_gantt). It creates these metrics only if `target.achievement` exists (accountability_metric.py:265-266, 468-522):

| AF metric code | Name | Calculation |
|---|---|---|
| `achieved_revenue_am` / `_bl` / `_tp` | "Achieved revenue (attributed) — Account Manager / Bid Liaison / Technical Presales" | Sum of achievement **Achieved Value** for the role, tender status Won, by award date within the review window, per employee |
| `gross_awarded_am` | "Gross awarded value — Account Manager" | Sum of **Gross Value** (AM) |
| `awards_count_am` | "Awarded tenders — Account Manager" | Count of AM achievement lines |
| `attribution_rate_am` | "Attribution rate — Account Manager" | Achieved ÷ Gross |
| `achieved_vs_target_am` | "Achieved revenue vs revenue target — Account Manager" | Achieved ÷ the AF reference revenue target |

Flags in AF worksheets: "award(s) awaiting attribution" (% Achievement = 0) and "award(s) where the attribution % doesn't match the stage points" (accountability_metric.py:363-379).

**Overlap.** Both systems measure revenue achieved per person per period, and AF works from the same attribution data. AF has its own targets, periods, weights, reviews and scores. The Commercial Targets quotas, role targets and periods are therefore a second, parallel set of revenue targets with their own percentages and status bands. "Number of Tenders" targets overlap with AF's award-count metric, but here they are not actually counted (2.2).

**Legacy or active? The answer is split (based on the code only):**

| Part | Verdict | Evidence |
|---|---|---|
| Achievement lines and attribution | **Active and needed** | AF revenue metrics read them; My Actions routes "Achievements to attribute" (recent My Actions work); tender urgency depends on them; buttons have newly added help text |
| Target periods | **Active** as a calendar | Tenders and opportunities are filed by period; there are period filter bars in the tender and opportunity lists (static/src/js/tender_period_bar.js, crm_period_bar.js); the portal dashboards use them |
| Role targets, individual targets, Dashboard, /my/targets | **Probably legacy, but not marked as such** | They duplicate AF revenue targets; nothing in AF reads them; no deprecation comment, no hidden menu, no migration after 16.0.1.0.3 touches them; menus and the portal tile are still live; there are leftovers from earlier versions (commented-out "Manage Role Targets" menu and old views, commented count logic) |

---

## 9. Gaps / questions for the product owner

1. **Is Commercial Targets (role targets and individual targets) still used, or is the Accountability Framework now the system of record for revenue targets?** If it is replaced, should the Dashboard, Manage Individual Targets and the "Targets & Achievements" tile be hidden?
2. **"Number of Tenders" target type does nothing.** It still adds money values and compares them with the target. Is the type still wanted?
3. **There are no role restrictions in the backend.** Any internal user can create or edit any target or achievement, including their own stage points. Should only the heads and the Administrator be able to?
4. **"Compute Related Activities" overwrites stage points typed by hand.** Which wins: manual judgement or the activity count? There is also no reminder to run it again after more activities are logged.
5. **Role on an achievement is typed by hand.** It can differ from the role of the individual target, and it is not checked against the person's role on the tender. Is that intended?
6. **Role target "Target Value" is not checked against "Line Target"** (the sum of individual targets). All percentages use the manual figure.
7. **Period state has no effect.** Closing does not lock achievements or targets. Should it?
8. **Bands are inconsistent.** Targets use 100 / 75 / 50; achievements use 90 / 50 ("Excellent / Meets Expectation / Below Target"). Which should training teach?
9. **Gross value has two calculations.** `_compute_gross_value` gives the unsplit tender value; `_compute_achieved_value` also writes the split value (target.py:673-742). Confirm the split always shows in practice.
10. **Prequalified tenders show the "Target Achievements" tab but never raise a pending flag** (Won only). Should achievements ever be recorded on prequalifications?
11. **The "Award Date missing" error can appear just from picking a Target before a Tender** on a new achievement.
12. **The /my/achievements "Total" row averages %** and shows the first line's gross, not a sum. Is that the intended reading?
13. **"Manage Individual Targets" is meant to open grouped by state but does not.** It defaults to `search_default_group_by_state`, while the filter is named `group_state` (target_views.xml:1060 vs 688).
14. **Activities count by "Responsible" user only.** Activities logged by someone else for the person, or with no linked tender or opportunity, never count.

---

## 10. Sources

- tritel_tender_tracker:
  - models/target.py, target_period.py, target_accounts.py
  - models/models.py (lines 140-264)
  - models/crm_lead.py (10-40), res_partner.py (190-290), my_actions.py (85-110)
  - views/target_views.xml, target_period_views.xml, tender_views.xml (400-430), menu.xml, portal_targets_achievements_templates.xml, portal_tender_templates.xml (tile 9-30, links)
  - security/ir.model.access.csv, security.xml
  - data/ir_cron_data.xml, mail_templates.xml (grep)
  - controllers/portal_tender.py (17-246, 1763-2213)
  - migrations/16.0.1.0.2, 16.0.1.0.3
  - __manifest__.py
- tritel_accountability_framework: models/accountability_metric.py (255-540), __manifest__.py, grep over the whole module
- training/_discovery/tenders.md §2.8 (for overlap only)
