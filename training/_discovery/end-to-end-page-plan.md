# End-to-end journeys: page plan (slugs are fixed)

Each journey follows one piece of work across systems and departments, then links to the how-to page for every
step. All four sections are written, so pages may link to ANY existing page under
`src/content/docs/` (check the slug exists before linking), plus `reference/*` and `roles/*`.

The repository is public: describe intended behaviour, never access gaps; dummy data only.

| Slug | Title | What it follows |
|---|---|---|
| end-to-end/index | End-to-end journeys | Why journeys; one big Mermaid map of how the systems feed each other (CRM opportunity → tender → won → delivery project → handover/close → Accountability targets; OEM bookings → OEM revenue; customer activities → coverage; bid desk → bid KPIs; board sees the results); which journey to read for your role |
| end-to-end/opportunity-to-accountability | From opportunity to your scorecard | **The main journey (required by the brief).** Opportunity in CRM → tender created and linked → team nominated → bid confirmed → readiness → submitted → won (award date) → achievements attributed → delivery project opened → baseline approved → delivered and handed over → closed → revenue, pipeline, bid and delivery metrics update targets → reviews → board summary. Swimlanes: Commercial, Channel, Delivery, Finance & Accounts, HR / line manager, the system |
| end-to-end/oem-booking-to-revenue-target | From an OEM purchase to the OEM revenue target | Purchase order with OEM lines → OEM booking created, lines added, confirmed → booking date → OEM-recognised revenue metric → target score → review |
| end-to-end/customer-activity-to-coverage | From a customer visit to coverage and activity targets | Account ownership → planned touch → logged activity → coverage ladder → market coverage and activity metrics → targets |
| end-to-end/bid-desk-to-bid-kpis | From bid desk work to bid KPIs | Bid Liaison nominated (fair workload) → readiness checklist → submission recorded (on time or late) → quality scored / disqualification confirmed → bid desk and bid quality metrics → Bid Liaison and Presales targets |
| end-to-end/project-to-delivery-kpi | From a won tender to the Delivery KPI | Won tender → delivery project → baseline (dates + budget) → client delays → handover → close-out result → on-time and on-budget metrics → the project manager's targets → review |

Each journey page (pageType: journey, module: end-to-end):
1. One-paragraph summary, and who is involved (role badges via `roles:`).
2. A Mermaid `flowchart TD` swimlane (one subgraph per department or "The system"), short labels.
3. A step table: # · Who · Where (menu path) · What happens · Guide (link to the how-to page).
4. "What carries across": which fields/figures travel from one system to the next (plain English), with timings
   (nightly jobs, settle days, review windows).
5. "Where it can go wrong": the 4–6 most common breaks (e.g. tender not linked to its opportunity; achievements not
   attributed; project not linked to its tender; booking left in draft), each with the fix and a link.
6. At least one `type: calc` or `type: screen` picture where it helps (e.g. the main journey: a worked example of
   one won tender's value flowing into revenue targets).
