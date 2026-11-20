# Projects sync, 20 Nov 2026: tritel-addons 154c7e8 (tritel_project_delivery 16.0.1.18.0)

"Projects and tenders searchable both ways, link only, Link Projects to Tenders". No migrations. Read code with
`git -C /home/dennokorir/Projects/waft-16-tritel/custom/src/Tritel-Technologies/tritel-addons show origin/16.0:<path>`;
`git … show 154c7e8 --stat` for the files. `verified_commit`: full hash of origin/16.0; illustration header 12 chars.
Vocabulary from the 19 Nov sync: training/_discovery/projects-sync-2026-11-19.md (Delivery Budget, project codes
"P26-049 · Data Centre Upgrade", menu paths with section headings). Dummy data only (Customer A/B, P26-0xx,
TND-2026-00x). Odd behaviour → calm `:::note[Good to know]`.

## What changed
**"Link only" is a new option; nothing was removed.** Opening or creating a delivery project works as before.

### Searchable both ways
- Projects (all project lists): search field **Tender** (tender number `ref_no` or title); filters **Linked to a tender**
  (Tender set), **Not linked to a tender** (now: Tender empty — before it meant "not a delivery project", so link-only
  projects have left it), **Marked No tender**; group by **Tender**; optional **Tender** column (hidden) in the project
  list.
- Tenders (Tender Manager): search field **Project (code or name)**; filters **With project**, **Without project**,
  **Won, no project** (archived projects count); list column **Projects** (shown) with the linked codes.
- Tender form stat button: was "Delivery projects" (subtitle *Delivery*), now **Projects** (subtitle *Projects*), value
  still the codes; help *"Projects linked to this tender: delivery projects and projects linked for reference. Opens the
  project, or the list when there are several."*; now also archived and link-only projects.
- **Open Delivery Project / Add Delivery Project** depend only on live delivery projects: a won tender whose only
  project is link-only still shows **Open Delivery Project**.

### Link only (the Link to Won Tender window, also the tender's Open Delivery Project window once an Existing project is picked)
- Radio **Link as**: **Delivery project** / **Link only**, shown only when **Existing project** is filled.
- Link only hides Project manager, Start date and the cost-account group; the confirm button becomes **Link Tender**;
  info: *"Link only records the tender on the project for reference. It stays out of delivery tracking: no stages, budget
  or reminders, and it doesn't count in the delivery KPIs. You can make it a delivery project later with Link to Won
  Tender."*; read-only **Other candidates** when suggestions exist.
- Effect: sets the project's Tender, clears No tender, fills the customer from the tender if empty, chatter *"Linked to
  tender **X** for reference (not a delivery project)."*
- The project's Delivery tab then shows *"Linked to tender [tender] for reference. It is not a delivery project, so it is
  not measured by the delivery KPIs."* with **Make It a Delivery Project** (Delivery PM group, incl. the Head), which
  opens the same window with the tender pre-filled and read-only.
- Messages: *"Only the Head of Delivery, Delivery Finance or a delivery project manager can link projects to tenders."* ·
  *"Only a won tender can be linked."* · *"%s is already linked to tender %s."* · *"Link only needs an existing
  project."*; delivery mode unchanged *"Only delivery project managers can open delivery projects."*
- Delivery Finance now has access to the window. Good to know: Finance still sees **Link as › Delivery project**, which
  fails for them with the message above; they use Link only.

### New screen: Link Projects to Tenders
- Menus: **Project › Delivery › Setup › Link Projects to Tenders** (Head of Delivery, Delivery Finance) and **Accounting ›
  Project Budgets › Tracking › Link Projects to Tenders** (Delivery Finance only).
- Lists active projects with no Tender and not marked No tender; no create/delete; rows with no suggestion greyed. Empty:
  *"Every active project is linked to a tender or marked No tender."*
- Columns **Code**, **Name**, **Customer**, **Opened**, **Match** (green **Certain** / amber **Possible**), **Suggested
  tender**, **Why**, **Other candidates** (up to two more).
- Suggestions (won tenders only, up to 3): **Certain** when the tender number (≥6 characters normalised) appears in the
  project name or its cost account's name — Why *"Tender number %s is in the project or its cost account"*; **Possible**:
  won tenders of the same commercial customer, closest title first — Why *"Won tender for the same customer"*. Good to
  know: Possible candidates can include tenders already linked to other projects.
- Row buttons **Link…** (opens Link to Won Tender with the suggestion filled, tender editable, Link only the default) and
  **No Tender** (confirm *"Mark this project as having no tender? It leaves this list."*).
- Bulk: **Action › Link to Suggested Tender (link only)** (Head, Delivery Finance) → *"%s project(s) linked to their
  suggested tender."* + *" %s skipped (already linked or no suggestion)."* Good to know: it appears in the Action menu of
  every project list, not only this screen.
- Good to know: **No tender** can't be undone from a screen except by linking the project; a link can't be removed or
  moved to another tender (*"%s is already linked to tender %s."*).
- Good to know: My Actions' "Projects not linked to a won tender" and **Projects Not in Delivery** still count link-only
  and No-tender projects (they look at "not a delivery project").

## Pages and illustrations to touch (agent PL owns all of this)
- NEW how-to **projects/how-to/approvers/link-projects-to-tenders** — "Link projects to their tenders" (roles
  head-delivery, delivery-finance; where [Project, Delivery, Setup, Link Projects to Tenders]) + new screen illustration
  `projects/appr-link-projects-tenders` (shows tritel_project_delivery:menu:menu_delivery_link_projects_tenders,
  …:menu:menu_acc_pb_link_projects_tenders, …:field:project.project.tender_suggestion_id, …:field:project.project.
  tender_suggestion_note, …:field:project.project.tender_candidate_ids, …:selection:project.project.
  tender_suggestion_kind).
- link-an-existing-project: Link only branch, its errors, a section "Make a link-only project a delivery project"
  (**Make It a Delivery Project**, id view_ext:project.edit_project:button:make-it-a-delivery-project); the Not linked
  filter change. Redraw `projects/pm-link-project` with the **Link as** radio.
- open-a-delivery-project: Existing project now shows Link as; Open Delivery Project still shows when the only project
  is link-only; "already has a *delivery* project".
- concepts/delivery-projects: new section "Find a tender's projects and a project's tender" (both search directions,
  filters, column, group by); the **Projects** button; link-only projects aren't measured.
- project-codes, reports/project-at-a-glance, projects/index, menus.mdx (Setup and Tracking tables), who-can-do-what:
  the **Projects** button rename and the new menu rows; redraw `projects/matrix-menus` (two new rows) and add the row in
  `matrix-closeout-setup` if fitting.
- glossary/fields/states projects.yaml: Link only, Certain / Possible match, Suggested tender, Why, Other candidates,
  Marked No tender; fix the stale "Projects to link" glossary entry if still present.
- tenders/concepts/tenders-and-statuses (filters, search field, column, **Projects** button in the smart-button list),
  tenders/concepts/business-cases (button rename).
- end-to-end/project-to-delivery-kpi (button rename; "isn't linked" troubleshooting: a project linked for reference isn't
  measured — fix with Make It a Delivery Project) and end-to-end/opportunity-to-accountability (same addition).
- Illustration headers: replace the removed id `tritel_project_delivery:view_ext:tritel_tender_tracker.view_tender_form:
  button:delivery-projects` with `…:button:projects` in every `# docs-sync: shows` line (no visual change needed).
