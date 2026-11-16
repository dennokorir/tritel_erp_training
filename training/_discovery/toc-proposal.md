# Tritel Systems Training Portal — proposed table of contents

Status: **proposal, awaiting approval** (2026-11-16). Built from the discovery files in this folder
(accountability.md, projects.md, tenders.md, crm_tender.md), read from tritel-erp 16.0 @ eec18b4.

Legend: 🎨 = illustration planned (every how-to page has one). Role badges in brackets.
Roles used across the portal: **Everyone**, **Line manager** (anyone with reportees), **Account Manager**,
**Bid Liaison**, **Head of Commercial**, **Technical Presales**, **Head of Channel**, **Channel user**,
**Delivery PM**, **Head of Delivery**, **Delivery Finance**, **MD**, **HR**, **System administrator**.

**Decisions (2026-11-16):**
- Known gaps: document current behaviour, with a short "Good to know" note where it confuses; fix list kept separately.
- Extra scope, all included: Channel OEMs and bookings; Channel Compliance, distributors and learning; tender Commercial Targets; e_board (board portal and MD review).
- Screens: SVG wireframes built from the view XML, with numbered callouts. No screenshots of real data.
- Roles: the department mapping below is approved, plus the Everyone, Line manager and MD paths.

---

## / Home
- What each system is for, who uses it, one-line "start here" per role 🎨 (one-picture map of the three systems)

## /getting-started/
1. Logging in: the back office and the portal (/my) — which one you use and why 🎨
2. Finding your way: apps, menus, breadcrumbs, search 🎨
3. Lists, boards (kanban) and forms; filters, group by, favourites 🎨
4. Chatter, activities (to-dos) and notifications 🎨
5. Your My Actions lists — Accountability, Tenders, Projects and the portal page 🎨
6. Getting help and reporting a problem

## /accountability/  (Accountability Framework)
**Overview** — purpose, who uses it, system map 🎨

**Concepts**
1. Periods and objectives
2. Targets: number targets, service-level (SLA) targets, milestone targets
3. Metrics: targets that update themselves (catalogue of all ~40 metrics, grouped)
4. Weights, share of score and priorities
5. Own, Team and Overall score
6. Cascading targets: push, pull, adopt, decline
7. Reviews, review sessions and review packs
8. Ratings and progress briefs
9. Snapshots and "as at" figures
10. Exempt staff, withdrawn targets and development targets

**Workflows** (one state diagram each 🎨; swimlanes where several roles act)
- Period · Objective · Target · Cascade · Milestone stage · Scorecard change request
- Review session · Review pack (swimlane: manager → employee → HR) · Review concern (swimlane) · Progress brief · Priority change

**How-to: everyone**
- See my performance (Performance Overview) · My Targets · Update a milestone · Acknowledge new priorities
- Respond to my review pack (acknowledge or raise a concern) · My Performance on the portal · Read my brief and snapshots

**How-to: line managers**
- Set team targets · Propose next year's targets · Push / approve or deny pulls · Rebalance weights
- Milestone dates and confirmations · Plan a review session · Conduct a review (review pack) · Team Reviews board
- Team Scores · Request a scorecard change · Withdraw a target

**How-to: HR and administrators**
- Open and close periods · Objectives · Targets library (seed, publish) · Metrics: set up and test
- Settings · Compliance and Session Coverage · Decide scorecard changes and escalations · Exempt staff · Access rights sync

**Reports** — Performance Overview (as at), Team Scores, Snapshots and Compare (PDF), Session Coverage, Compliance

**How it's calculated** 🎨 (worked examples, dummy numbers) — target score by type · milestone score · time-weighted weights · share of score · own/team/overall · objective achievement · ratings · session averages · metric families

**FAQ**

## /projects/  (Project Delivery)
**Overview** — system map 🎨

**Concepts** — delivery project · baseline (dates + budget) · cost items, categories and contingency · the Odoo budget · tracking: planned, committed, spent, left, forecast · handover · client delays · close-out · the Delivery KPI (time + budget)

**Workflows** 🎨 — Baseline (swimlane: PM → Head → Finance → MD) · Handover · Client delay · Close-out · Budget status

**How-to**
- Open a delivery project from a won tender · Link an existing project [Delivery PM, Head]
- Build a baseline: cost item builder, starter items, phasing · Send for approval [Delivery PM]
- Approve dates [Head] · Approve budget [Delivery Finance] · Approve a large revision [MD]
- Request a revision · Track the budget (smart buttons, tracking popup) · Tag purchase orders to the project
- Record a handover · Log a client delay · Approve a delay · Confirm a handover
- Close a project · Review costs after close [Delivery Finance]
- Projects My Actions · Delivery settings, cost types and categories [Head, Finance]

**Reports** — tracking popup, smart buttons, "Projects over budget"
**How it's calculated** 🎨 — cost items (VAT, currency) · contingency cap · budget lines · tracking figures · margin · delay days · time and budget KPI
**FAQ**

## /tenders/  (Tender Tracker + Channel)
**Overview** — system map 🎨

**Concepts** — tender, status and board column · prequalification · roles on a tender (AM, Bid Liaison, Presales) · bid readiness checklist · must-win · bid quality and disqualification · bid desk workload · project summaries and the library · customer activities and the coverage ladder · account ownership and target accounts · Channel: OEMs, vendor opportunities and OEM bookings

**Workflows** 🎨 — Tender status (swimlane: AM → Head of Commercial / Channel → Bid Liaison) · Prequalification · Readiness · Quality check · Disqualification · Project summary (swimlane) · Business case · OEM booking

**How-to**
- Create a tender from an opportunity · Confirm the bid · Assign AM, Bid Liaison, Presales
- Work the readiness checklist · Mark submitted · Record the result (Won, Lost, Prequalified, Drop, Cancel) · Reopen
- Prequalifications and logging an RFQ · Flag a must-win · Score bid quality · Record a disqualification
- Request, write, review a project summary · Use the library · Export for marketing
- Log a customer activity · Plan touches · Market Coverage · Account ownership and classifying accounts
- Portal: dashboard, tenders, pipeline, customers · Tender Follow Up report
- Commercial Targets (commercial_targets.md):
  - **Attribute a won tender** (achievement lines on the tender's "Target Achievements" tab) [Head of Commercial, Head of Channel]. This is active and feeds the accountability revenue targets.
  - Target periods (the calendar that tenders and opportunities are filed into).
  - Role and individual targets, the Dashboard, and the portal pages /my/targets and /my/achievements. These look like legacy that overlaps the accountability revenue targets. Awaiting a decision: document them, or mark them "being replaced".

**Channel** (sub-section of /tenders/channel/)
- OEMs and distributors · vendor opportunities (the "Vendor Opportunities" tab on an opportunity)
- OEM bookings: create, add purchase lines, confirm, remove a line, what happens when an order is cancelled
- Compliance · Learning Development and certifications

**How it's calculated** 🎨 — bid quality score · workload points · readiness % · coverage ladder · late submission · commercial target achievement % · OEM booking value and date
**FAQ**

## /board/  (E-Board)
From e_board.md. This is a portal for board members, with six tabs.
- Overview: what the board sees, and how board members are invited 🎨
- Performance tab: KPI tiles, organisation score "as at", tenders and pipeline, revenue [Board]
- Financial Position: receivables against payables, aging, outstanding invoices and orders [Board]
- Payroll · Profitability (won-tender gross profit, business case, commission lines) [Board]
- PDC Cheques: signing cheques from the portal [Board]
- The MD's quarterly review: Being prepared → With the board → Signed off → Acknowledged (swimlane: system → MD → board member → backup reviewer) 🎨
- Back office for finance and sales staff: "Exclude from Board Position" and "Hide from Board Portal" on sales and purchase orders [Finance, Sales]
- Settings: naming the board reviewer and backup reviewer [Accountability administrator]
- How it's calculated 🎨: MD review figures, organisation score and rating, order backlog, payroll employer cost

## /end-to-end/
1. Opportunity → Tender → Award → Project → Accountability (the main journey) 🎨
2. OEM booking → OEM-recognised revenue target 🎨
3. Customer activity → coverage and activity targets 🎨
4. Bid desk → bid readiness, quality and workload targets 🎨
5. Project delivery → Delivery KPI (time and budget) 🎨

## /roles/<department>/  (learning paths: which pages, in what order)
- commercial (Account Manager, Bid Liaison, Head of Commercial)
- channel (Technical Presales, Head of Channel, Channel users)
- delivery (Delivery PM, Head of Delivery)
- finance-and-accounts (Delivery Finance, budget approval, close-out)
- hr (HR, accountability administration)
- plus cross-cutting paths: **everyone**, **line managers** and **MD and board**

## /reference/
- glossary (A–Z, every business term and field label)
- index (A–Z master index, generated)
- states (every workflow state, all modules, one table)
- roles-matrix (groups × actions, one graphic per system) 🎨
- fields/accountability · fields/projects · fields/tenders (generated field reference)
- tags/<tag> (generated)

---

Rough size: ~120 pages (≈ 70 how-to, 25 concept, 15 workflow/calculation, 10 reference/roles) and
~110 illustrations. Built module by module as in the brief.
