# Tenders section (tender tracker, Channel, Commercial Targets): page plan (slugs are fixed; link only to these)

Modules: `tritel_tender_tracker` (16.0.1.23.x), `crm_tender` (16.0.0.3, the **Channel** app), Commercial Targets
inside the tender tracker. Discovery notes: `tenders.md`, `crm_tender.md`, `commercial_targets.md`.
Pages may also link to: `getting-started/*`, any slug in `accountability-page-plan.md` and `projects-page-plan.md`,
`reference/glossary`, `reference/states`, `reference/fields/tenders`, `roles/<department>`.

Role ids: account-manager, bid-liaison, head-commercial, presales (Technical Presales), head-channel,
channel-user, tender-admin (the Tender Tracker's "Administrator" role: call it **Tender administrator**),
everyone, system-admin, hr, finance.

Decisions already taken (2026-11-16): document today's behaviour with "Good to know" notes; Commercial Targets'
role and individual targets, the Dashboard and /my/targets are **being replaced** by Accountability revenue targets
(short page, not full how-tos); achievement attribution on won tenders is live and gets full pages.
Note: the Submission Deadline is editable on the **Tender Info** tab (a fix for it reverting is on its way).

## Agent T1: overview, concepts, workflows (tender tracker)
| Slug | Title | Type |
|---|---|---|
| tenders/index | Tenders and Channel | overview (system map: opportunity → tender → bid desk → submission → result → project summary / delivery project / attribution; the Channel app; who uses what) |
| tenders/concepts/tenders-and-statuses | Tenders, statuses and the board | concept |
| tenders/concepts/roles-on-a-tender | Account Manager, Bid Liaison and Technical Presales | concept (nominations, who assigns whom) |
| tenders/concepts/opportunities-and-tenders | Opportunities and tenders | concept (Source/Pipeline link; nothing created automatically; presales rule on CRM stages) |
| tenders/concepts/prequalifications | Prequalifications | concept |
| tenders/concepts/bid-readiness | The bid readiness checklist | concept |
| tenders/concepts/must-win-and-bid-quality | Must-win tenders, bid quality and disqualifications | concept |
| tenders/concepts/bid-desk-workload | The bid desk and fair workload | concept |
| tenders/concepts/business-cases | Tender business cases | concept |
| tenders/concepts/project-summaries | Project summaries and the library | concept |
| tenders/concepts/customer-activities | Customer activities and touchpoints | concept |
| tenders/concepts/market-coverage | Market coverage, account ownership and target accounts | concept |
| tenders/concepts/the-portal | The commercial portal | concept (/my/dashboard, /my/tenders, /my/pipeline, /my/customers, /my/summaries, /my/actions — who sees what) |
| tenders/workflows/tender-status | Tender status workflow | workflow (+ swimlane AM → Head of Commercial/Channel → Bid Liaison → Presales) |
| tenders/workflows/bid-readiness | Bid readiness workflow | workflow |
| tenders/workflows/quality-and-disqualification | Quality check and disqualification workflow | workflow |
| tenders/workflows/prequalification | Prequalification workflow | workflow |
| tenders/workflows/project-summary | Project summary workflow | workflow (+ swimlane manager → writer) |
| tenders/workflows/business-case | Business case workflow | workflow |
| tenders/workflows/customer-activity | Customer activity and target account workflow | workflow |
Also: `src/data/glossary/tenders.yaml` (40–60 terms) and `src/data/states/tenders.yaml`.

## Agent T2: how-to, the tender lifecycle
| Slug | Title | Roles |
|---|---|---|
| tenders/how-to/bids/create-a-tender | Create a tender from an opportunity | account-manager |
| tenders/how-to/bids/nominate-the-team | Nominate the Account Manager, Bid Liaison and Presales | head-commercial, head-channel |
| tenders/how-to/bids/confirm-the-bid | Confirm the bid | account-manager |
| tenders/how-to/bids/work-the-readiness-checklist | Work the bid readiness checklist | bid-liaison, presales |
| tenders/how-to/bids/mark-submitted | Mark a tender submitted | bid-liaison |
| tenders/how-to/bids/record-the-result | Record the result: Won, Lost, Prequalified, Drop or Cancel | account-manager, head-commercial |
| tenders/how-to/bids/reopen-a-tender | Reopen a tender | tender-admin |
| tenders/how-to/bids/prequalifications-and-rfqs | Follow up a prequalification and log an RFQ | account-manager, bid-liaison |
| tenders/how-to/bids/flag-a-must-win | Flag a must-win tender | head-commercial |
| tenders/how-to/bids/score-bid-quality | Score a bid's quality | head-commercial |
| tenders/how-to/bids/confirm-a-disqualification | Confirm the cause of a disqualification | head-commercial |
| tenders/how-to/bids/business-case | Prepare and approve a business case | account-manager, head-commercial |
| tenders/how-to/bids/attribute-a-won-tender | Attribute a won tender (achievements) | head-commercial, head-channel |
| tenders/how-to/bids/tender-my-actions | Work through Tender My Actions | account-manager, bid-liaison, presales, head-commercial, head-channel |
| tenders/how-to/bids/follow-up-reports | Run the Tender and Pipeline Follow Up reports | account-manager, head-commercial |

## Agent T3: how-to, summaries, customers and the portal
| Slug | Title | Roles |
|---|---|---|
| tenders/how-to/customers/request-a-project-summary | Request a project summary | head-channel, head-commercial |
| tenders/how-to/customers/write-a-project-summary | Write and submit a project summary | presales |
| tenders/how-to/customers/review-a-project-summary | Review, send back or approve a summary | head-channel, head-commercial |
| tenders/how-to/customers/use-the-summary-library | Find references in the summary library | everyone |
| tenders/how-to/customers/export-for-marketing | Export a marketing pack | head-channel, head-commercial |
| tenders/how-to/customers/log-a-customer-activity | Log a customer activity | account-manager, presales |
| tenders/how-to/customers/plan-customer-touches | Plan customer touches | account-manager |
| tenders/how-to/customers/read-the-customer-activities-screen | Read the Customer Activities screen | account-manager, head-commercial |
| tenders/how-to/customers/market-coverage | Use the Market Coverage screen | account-manager, head-commercial |
| tenders/how-to/customers/account-ownership | Claim, assign and classify accounts | account-manager, head-commercial |
| tenders/how-to/customers/portal-dashboard | Use the Commercial Dashboard and portal pages | account-manager, bid-liaison, presales |

## Agent T4: Channel and Commercial Targets
| Slug | Title | Type |
|---|---|---|
| tenders/channel/index | The Channel app | overview |
| tenders/channel/oems-and-distributors | OEMs and distributors | concept + how-to |
| tenders/channel/vendor-opportunities | Vendor opportunities on a CRM opportunity | how-to |
| tenders/channel/oem-bookings | OEM bookings | concept |
| tenders/channel/book-oem-purchases | Book OEM purchases: create, add lines, confirm, remove a line | how-to |
| tenders/channel/cancelled-orders | When a purchase order is cancelled | how-to |
| tenders/channel/tag-untagged-purchases | Set the OEM on untagged purchases | how-to |
| tenders/channel/compliance | Compliance documents and the compliance calendar | how-to |
| tenders/channel/certifications-and-learning | Certifications and learning development | how-to |
| tenders/channel/booking-workflow | OEM booking workflow | workflow |
| tenders/commercial-targets/index | Commercial Targets: what's live and what's being replaced | concept |
| tenders/commercial-targets/target-periods | Target periods | concept + how-to |
| tenders/commercial-targets/achievements | How achievements are split and counted | calculation |
Also: `src/data/glossary/channel.yaml` and `src/data/states/channel.yaml`.

## Agent T5: calculations, permissions, FAQ, field reference
| Slug | Title |
|---|---|
| tenders/calculations/bid-quality-score | Bid quality score |
| tenders/calculations/workload-points | Bid desk workload points |
| tenders/calculations/readiness-progress | Readiness progress |
| tenders/calculations/coverage-ladder | The market coverage ladder |
| tenders/calculations/late-submission | Late submission and submission dates |
| tenders/calculations/business-case-margin | Business case margin |
| tenders/calculations/oem-bookings | OEM booking value and booking date |
| tenders/who-can-do-what | Who can do what (permission matrices: tenders, bid desk, summaries, customers, Channel) |
| tenders/faq | Tenders and Channel FAQ |
Also: `src/data/fields/tenders.yaml` (tender form tabs, prequalification, business case, summary, customer activity, OEM booking).
