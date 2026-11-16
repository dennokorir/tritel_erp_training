# Accountability section: page plan (slugs are fixed; link only to these)

All slugs are under `src/content/docs/`. `related:` and in-text links may point at any page in this list,
plus `getting-started/*` and `reference/glossary`, `reference/states`, `reference/index`,
`reference/fields/accountability`, `roles/<department>` (departments: everyone, line-managers, commercial, channel,
delivery, finance-and-accounts, hr, md-and-board).

Role ids: everyone, line-manager, hr, accountability-admin, md, board, account-manager, bid-liaison, head-commercial,
presales, head-channel, delivery-pm, head-delivery, delivery-finance, finance, system-admin.
In Accountability, "line manager" = the automatic Supervisor role (anyone who manages at least one employee);
"accountability administrator" = the manual Administrator role; "HR" = Odoo's Employees: Administrator.

## Agent 1: overview and concepts
| Slug | Title | Type |
|---|---|---|
| accountability/index | Accountability Framework | overview (system map in Mermaid; who uses it; the year in one picture; where to start) |
| accountability/concepts/periods-and-objectives | Periods and objectives | concept |
| accountability/concepts/targets | Targets | concept (number, SLA, milestone; manual vs metric-driven; draft/active; late set) |
| accountability/concepts/metrics | Metrics: targets that update themselves | concept (catalogue of every metric, grouped, plain English, with source system) |
| accountability/concepts/weights-and-share-of-score | Weights, share of score and priorities | concept |
| accountability/concepts/scores | Own, Team and Overall score | concept |
| accountability/concepts/cascading | Cascading targets | concept (push, pull, adopt, decline) |
| accountability/concepts/reviews | Reviews, review sessions and review packs | concept |
| accountability/concepts/ratings-and-briefs | Ratings and progress briefs | concept |
| accountability/concepts/snapshots-and-as-at | Snapshots and "as at" figures | concept |
| accountability/concepts/exempt-withdrawn-development | Exempt staff, withdrawn and development targets | concept |
Also: `src/data/glossary/accountability.yaml` (all Accountability terms; 40–70 entries).

## Agent 2: workflows
| Slug | Title |
|---|---|
| accountability/workflows/period | Period workflow |
| accountability/workflows/objective | Objective workflow |
| accountability/workflows/target | Target workflow |
| accountability/workflows/cascade | Cascade workflow |
| accountability/workflows/milestone-stage | Milestone stage workflow |
| accountability/workflows/scorecard-change-request | Scorecard change request workflow |
| accountability/workflows/review-session | Review session workflow |
| accountability/workflows/review-pack | Review pack workflow (swimlane: manager, employee, escalation) |
| accountability/workflows/review-concern | Review concern workflow (swimlane) |
| accountability/workflows/progress-brief | Progress brief workflow |
| accountability/workflows/priority-change | Priority change workflow |
Also: `src/data/states/accountability.yaml` (every status of every workflow above).

## Agent 3: how-to for everyone, and for HR and administrators
| Slug | Title | Roles |
|---|---|---|
| accountability/how-to/everyone/see-my-performance | See my performance | everyone |
| accountability/how-to/everyone/my-targets | Check my targets | everyone |
| accountability/how-to/everyone/update-a-milestone | Update a milestone | everyone |
| accountability/how-to/everyone/acknowledge-new-priorities | Acknowledge new priorities | everyone |
| accountability/how-to/everyone/respond-to-my-review | Respond to my review | everyone (**already written: the example**) |
| accountability/how-to/everyone/my-performance-portal | Use My Performance on the portal | everyone |
| accountability/how-to/everyone/read-briefs-and-snapshots | Read my progress briefs and snapshots | everyone |
| accountability/how-to/hr-admin/open-and-close-periods | Open and close a period | accountability-admin |
| accountability/how-to/hr-admin/objectives | Set up objectives | line-manager, accountability-admin |
| accountability/how-to/hr-admin/targets-library | Maintain the targets library | hr, accountability-admin |
| accountability/how-to/hr-admin/metrics | Set up and test a metric | accountability-admin |
| accountability/how-to/hr-admin/settings | Change the Accountability settings | accountability-admin |
| accountability/how-to/hr-admin/compliance-and-coverage | Check compliance and session coverage | line-manager, hr, accountability-admin |
| accountability/how-to/hr-admin/decide-changes-and-escalations | Decide scorecard changes and escalations | hr, accountability-admin |
| accountability/how-to/hr-admin/exempt-staff | Exempt a member of staff | hr, accountability-admin |
| accountability/how-to/hr-admin/access-rights | Fix someone's access | hr, accountability-admin |

## Agent 4: how-to for line managers, and reports
| Slug | Title |
|---|---|
| accountability/how-to/line-managers/set-team-targets | Set targets for my team |
| accountability/how-to/line-managers/propose-next-years-targets | Propose next year's targets |
| accountability/how-to/line-managers/push-and-pull-targets | Push a target down, or approve a pull |
| accountability/how-to/line-managers/rebalance-weights | Rebalance weights |
| accountability/how-to/line-managers/milestone-dates-and-confirmations | Set milestone dates and confirm milestones |
| accountability/how-to/line-managers/plan-a-review-session | Plan a review session |
| accountability/how-to/line-managers/conduct-a-review | Conduct a review |
| accountability/how-to/line-managers/team-reviews-board | Track reviews on the Team Reviews board |
| accountability/how-to/line-managers/team-scores | See my team's scores |
| accountability/how-to/line-managers/request-a-scorecard-change | Request a scorecard change |
| accountability/how-to/line-managers/withdraw-a-target | Withdraw a target |
| accountability/reports/performance-overview | Performance Overview |
| accountability/reports/snapshots-and-compare | Snapshots and Compare |
| accountability/reports/session-coverage | Session Coverage |
| accountability/reports/compliance | Compliance |
| accountability/reports/review-analysis | Review analysis |

## Agent 5: calculations, FAQ, field reference, permissions
| Slug | Title |
|---|---|
| accountability/calculations/target-scores | How a target's score is calculated (number, SLA) |
| accountability/calculations/milestone-scores | How a milestone target is scored |
| accountability/calculations/weights-over-time | Time-weighted weights |
| accountability/calculations/share-of-score | Share of score |
| accountability/calculations/own-team-overall | Own, Team and Overall score |
| accountability/calculations/objective-achievement | Objective achievement |
| accountability/calculations/ratings | Ratings |
| accountability/calculations/review-averages | Review and session averages |
| accountability/calculations/metric-families | How metrics count (revenue, pipeline, activity, coverage, bid desk, delivery, review behaviour) |
| accountability/who-can-do-what | Who can do what (permission matrices, `type: matrix`, one per area: targets, reviews, organisation) |
| accountability/faq | Accountability FAQ |
Also: `src/data/fields/accountability.yaml` (field reference by screen).
