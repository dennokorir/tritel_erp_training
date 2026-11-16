# Board section (e_board): page plan (slugs are fixed; link only to these)

Module: `e_board` 16.0.1.5.x. Discovery notes: `e_board.md`. Code: `tritel-erp` repository, module `e_board`
(read it from the local checkout `/home/dennokorir/Projects/tritel-training/e_board`, which is 16.0).
**Inviting board members:** describe the behaviour of the fix on branch `board-invite-access`
(`/home/dennokorir/Projects/tritel-board-invite/e_board`): only **System administrators** and
**Accountability administrators** see and use "Invite as Board Viewer". Don't describe who else could use it
before the fix; this repository is public.

Pages may also link to: `getting-started/*`, any slug in the accountability, projects and tenders page plans,
`reference/glossary`, `reference/states`, `reference/fields/board`, `roles/<department>`.

Role ids: board (Board member: a portal user with the Board Viewer role), md (Managing Director),
accountability-admin, system-admin, finance (finance or sales staff who set the board flags on orders), everyone.
"Board Reviewer" and "Backup Board Reviewer" are board members named in the Accountability settings, not roles.

## Agent B1: overview, concepts, the MD review, administration
| Slug | Title | Type |
|---|---|---|
| board/index | The Board portal | overview (who uses it; the six tabs; how a board member gets in; map in Mermaid flowchart TD) |
| board/concepts/the-board-portal | What the board sees | concept (each tab in one paragraph, with the data it comes from) |
| board/concepts/md-quarterly-review | The MD's quarterly review | concept |
| board/concepts/as-at-figures | "As at" figures and what's left out | concept (as-at months; "Exclude from Board Position" and "Hide from Board Portal") |
| board/workflows/md-review | MD review workflow | workflow (stateDiagram-v2 + swimlane flowchart TD: System, MD, Board Reviewer, Backup Board Reviewer) |
| board/how-to/prepare-the-md-review | Prepare and submit the quarterly review | how-to, md |
| board/how-to/acknowledge-the-board-review | Acknowledge the board's sign-off | how-to, md |
| board/how-to/review-the-md | Review and sign off the MD's quarter | how-to, board |
| board/how-to/invite-board-members | Invite a board member | how-to, system-admin, accountability-admin |
| board/how-to/name-the-board-reviewer | Name the Board Reviewer and backup | how-to, accountability-admin |
| board/how-to/exclude-or-hide-orders | Exclude or hide an order from the board | how-to, finance |
Also: `src/data/glossary/board.yaml` (15–30 terms) and `src/data/states/board.yaml`.

## Agent B2: the board member's pages, calculations, permissions, FAQ, fields
| Slug | Title | Type |
|---|---|---|
| board/how-to/read-performance | Read the Performance tab | how-to, board |
| board/how-to/financial-position | Read the Financial Position | how-to, board |
| board/how-to/payroll | Read the Payroll tab | how-to, board |
| board/how-to/profitability | Read Profitability and add a commission line | how-to, board |
| board/how-to/sign-cheques | Sign post-dated cheques | how-to, board |
| board/how-to/access-log | Check the board portal access log | how-to, system-admin |
| board/calculations/md-review-figures | How the MD review figures are worked out | calculation |
| board/calculations/organisation-score | Organisation score and rating | calculation |
| board/calculations/financial-position | Receivables, payables, backlog and exposure | calculation |
| board/calculations/payroll-cost | Payroll employer cost | calculation |
| board/who-can-do-what | Who can do what | reference (matrices) |
| board/faq | Board portal FAQ | faq |
Also: `src/data/fields/board.yaml`.
