# Accountability sync, 19 Nov 2026: tritel-addons commit 6f83ad9 (tritel_accountability_framework 16.0.1.97.0, e_board 16.0.1.5.2)

Read the code with `git -C <tritel-addons> show origin/16.0:<path>` (tritel-addons =
`/home/dennokorir/Projects/waft-16-tritel/custom/src/Tritel-Technologies/tritel-addons`). New `verified_commit`: the
full hash of origin/16.0 (`git -C <tritel-addons> rev-parse origin/16.0`, 5d691a8…); illustration header
`# docs-sync: verified_commit <first 12 chars>`. Key sources: `views/menu.xml`, `views/menu_people.xml`,
`views/accountability_scorecard_request_views.xml:178-199`, `views/accountability_target_library_views.xml:118-129`,
`static/src/targets_library/targets_library_list.{js,xml}`, `models/accountability_progress_brief.py:42-64`,
`e_board/views/md_review_views.xml:94-98`, `tests/test_menus_by_role.py` (the exact tree per role).

## Product decisions (19 Nov 2026)
- **Keep URLs.** Retitle and rewrite, but keep slugs: `accountability/reports/performance-overview` (now "Company
  Overview"), `accountability/reports/session-coverage` (now "Review Coverage"), `propose-next-years-targets`, etc. Put
  the old names in `keywords`.
- **Menu paths include section headings**: **My Team › Set targets › Team Targets**, **My Team › Review › Team
  Reviews**, **My Team › Approve › Scorecard Changes**. Top menus without headings stay as **People › Scores**,
  **Organisation › Review Coverage**, **Configuration › Settings**. (AUTHORING.md says so.)
- Behaviour that looks unintended: describe what the code does in a calm `:::note[Good to know]`; the lead lists it for
  the developers. Dummy data only (Employee A/B). The tests' user names are synthetic; don't copy them.

## Roles (as in accountability/who-can-do-what)
`group_accountability_user` = Everyone; `group_accountability_supervisor` = Line manager; `group_accountability_admin`
= Accountability administrator (implies Line manager); `hr.group_hr_manager` = HR.

## The new menus (all roles share one order: Company Overview · My Performance · My Team · People · My Actions · Organisation · Configuration)
| Role | Top menus |
|---|---|
| Everyone | **Company Overview** (the app still opens on it); **My Performance** › My Targets, My Reviews, **My Score History**, Progress Briefs (only while "Send progress briefs" is on in any company); **My Actions** |
| Line manager | + **My Team** with headings **Set targets** (Team Targets, Cascades, Milestones, Next Year's Targets) · **Review** (Review Sessions, Team Reviews, Team Scores) · **Approve** (Scorecard Changes, Priority Changes); + **Organisation** › Objectives, Review Coverage |
| HR (no team) | + **People** › Review Sessions (every session; no "mine" filter), All Reviews (Team Reviews views, same filters), **Scores** (the Team Scores screen titled "Scores"; scope "Everyone"), Scorecard Changes, Priority Changes, Next Year's Targets; + Organisation › Review Coverage, **Compliance** (new for HR), Targets Library. HR **no longer sees My Team** unless they also manage people (then both, My Team first). HR without a team still has no Organisation › Objectives. |
| Accountability administrator | Line-manager menus + Organisation › Objectives, Review Coverage, Compliance, Targets Library, **Board Reviews** + **Configuration** › Periods, Metrics, Settings (last menu) |

### Renamed (old → new, verbatim)
| Old | New |
|---|---|
| Performance Overview (menu, client action; was under My Performance) | **Company Overview** (own top menu) |
| Performance Snapshots (menu, action) | **My Score History** |
| Propose Targets | **Next Year's Targets** |
| Cascade Management | **Cascades** |
| Milestone Timeline | **Milestones** |
| Scorecard Change Requests | **Scorecard Changes** |
| Session Coverage (menu, action, screen title) | **Review Coverage** |

### Moved
- Periods, Metrics, Settings: Organisation › → **Configuration ›** (administrators).
- Board Reviews (e_board): My Performance › → **Organisation › Board Reviews** (administrators only). Board pages that
  mention it: board/concepts/md-quarterly-review, board/how-to/acknowledge-the-board-review (email link),
  data/fields/board.yaml, board/who-can-do-what, board/how-to/name-the-board-reviewer (+ `where:`), illustrations
  board/b1-* whose menu bar shows the Accountability app.
- Targets Library: Organisation (seq 40).

### Removed or hidden
- **Organisation › Scorecard Changes** (the HR/administrator log) is gone (item `menu_accountability_scorecard_log`
  REMOVED). One list now: My Team › Approve › Scorecard Changes and People › Scorecard Changes, opening on "Waiting for
  approval" + "Proposed by employees"; clear the filters for the full history. List and form only (the log's pivot is
  gone). Administrators who aren't HR reach it via My Team › Approve.
- **Organisation › Seed Targets Library** is gone (item `menu_accountability_seed_library` REMOVED), replaced by a
  **Seed from this year** button on the Targets Library list: confirmation "Seed from this year" / "Create draft role
  sets from this year's targets: one per job position, one entry per measure. Job positions that already have a role
  set are left alone. Continue?" / button "Seed". Only HR and administrators can seed (others get an access error, but
  only they reach the list). Library empty-state help now says "Seed the library from this year's targets with **Seed
  from this year** above…".
- **Progress Briefs** menu is hidden unless "Send progress briefs" is on in any company (`_sync_progress_brief_menu`).

### Size (pages / illustrations containing each old label)
Performance Overview 14/2 · Session Coverage 12/3 · Cascade Management 8/0 · Organisation › Settings 8/(+5 menu bars) ·
Organisation › Periods 6/1 · Propose Targets 5/1 · Scorecard Change Requests 5/2 · Performance Snapshots 4/2 ·
My Team › … 22 (check HR wording: HR now uses People) · Organisation › Metrics 3 · Milestone Timeline 3 ·
My Performance › Progress Briefs 3 · My Performance › Board Reviews 1 + fields/board · Organisation › Scorecard Changes 1/1
· Seed Targets Library 1. About 24 how-to/report pages have a stale `where:`. 51 illustrations need their `menu:` bar
redrawn (47 accountability screens + board b1-prepare-line, b1-acknowledge, b1-prepare-review, b1-name-reviewer);
about 12 also need the breadcrumb. Matrix `matrix-organisation`: drop the Scorecard Changes row, Periods/Metrics/Settings
under Configuration, Compliance for HR. `matrix-targets` `shows` line: drop the removed id.

### Menu bars for illustrations (role-appropriate)
- Everyone: `[Company Overview, My Performance, My Actions]`
- Line manager: `[Company Overview, My Performance, My Team, My Actions, Organisation]`
- HR: `[Company Overview, My Performance, People, My Actions, Organisation]`
- Administrator: `[Company Overview, My Performance, My Team, My Actions, Organisation, Configuration]`
Mark the active one as before (`{label: X, active: true, n: N}` keeps any callout number).

## Who writes what (agents work in this worktree only)
| Agent | Owns |
|---|---|
| **AA** — text | every page under `src/content/docs/accountability/**` (existing), `getting-started/*`, `roles/*`, `board/**`, `end-to-end/*`, `tenders/**` mentions; `src/data/{glossary,fields,states}/{accountability,board}.yaml` |
| **AB** — illustrations + new page | every `src/illustrations/accountability/*.yaml`, the 4 board b1 illustrations, the new page `accountability/menus` ("Accountability menus", reference, roles [everyone, line-manager, hr, accountability-admin] — check ids in src/data/site.ts) and its matrix illustration `accountability/matrix-menus` (copy the pattern of `leave/menus.mdx` + `leave/matrix-menus.yaml`) |
| Lead | sidebar, What's new, manifest, build, coverage |
