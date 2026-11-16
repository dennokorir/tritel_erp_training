# Projects (Project Delivery): questions raised while writing the training pages (2026-11-16)

The pages describe what `tritel_project_delivery` 16.0.1.13.0 does today, with "Good to know" notes where it
confuses. Each item is a decision for the product owner or a candidate fix.

## Access and roles

1. **Configuration menu:** Head of Delivery and Delivery Finance reach **Project › Configuration** only if they
   also have Project Administrator. Should the delivery roles grant that?
2. **The MD** isn't a role. They approve from the to-do or Projects My Actions.
   - Which access should the MD have (at least Project user)?
   - Should there be a deputy?
   - On a change of MD, should waiting to-dos move to the new person?
3. **No record rules:** every project user can read every baseline, budget, handover and client delay. Intended?
4. **Cost types:** the help text says "set once by finance", but only the Head of Delivery can edit them.
   Should finance get access?
5. **Withdraw** on a baseline has no role check in the code.
6. **Return to Draft** disappears for an approver once they have approved, the Head included, though the code
   still lets any Head return it. Keep the button visible to the Head?
7. **Projects to Link** is Head-only. Project managers are told to use the **Not linked to a tender** filter instead.

## Rules

8. **A revision that only moves pay months is refused** (*This revision changes nothing compared with vN.*).
   Should re-phasing alone be allowed?
9. **The budget total can change between Confirm and finance approval.** Items are re-priced at each step's
   exchange rate.
10. **MD thresholds are worked out live**, not fixed at confirm.
    - Raising them while a revision waits can leave it with nobody able to approve.
    - Lowering them adds an MD approval with no to-do.
11. **Costs on expense accounts outside every budgetary position** land on "Not split yet", which has nothing
    planned, so the project shows **Over plan**.
12. **The contingency row never fills**, so a project rarely shows **Fully committed** overall.
13. **"Days late" is recorded before the grace period**: a project can show 5 days late and still be On time.
14. **Rejected client delays are final** and can't be re-drafted.
    - Can the Head reject an already-approved delay?
    - Should delays be checked against the project's dates?
    - The Days total adds rejected and overlapping delays.
15. **Client delay decisions** only post in the chatter. The project manager gets no to-do or notification.
16. **The overdue-baseline to-do fires once per project, ever.** Should it repeat?
17. **Returning a confirmed handover** leaves finance's *Close delivery project* to-do open.
18. **Changing a cost type's budget category** silently re-files items on existing baselines, approved ones included.
19. **Tag Tender Orders** lists every untagged line on the tender in each project's window. With several
    projects on one tender, lines can be tagged to the wrong one.
20. **Close Project** shows on every project, not only delivery projects.
21. **Tender and baseline margins** differ.
    - They use different exchange rates.
    - The baseline counts another project's latest draft revision; the tender counts its approved version first.

## Screens

22. **The tracking table is live, but the status badge, smart buttons and My Actions** use the nightly stored
    figures, so they can disagree during the day.
23. **"Open tracking"** in My Actions opens the project form, not the tracking window.
24. **"Projects over their approved budget"** shows the Head everything. Everyone else, Finance included, sees
    only projects they manage. Projects with a revision in progress are left out.
25. The smart button reads **"1 revisions"**.
26. **Labels with no wording set** in the code show Odoo's defaults: **Basis**, **Confirmed By**,
    **Confirmed On**, **Approved On**. Please confirm on screen.
27. **The whole-orders page:** orders are no longer imported into a baseline. The page is now
    "Enter a supplier order or quote in a baseline". Keep it, or merge it into "Build a baseline"?
28. **Ledger account codes** (500000, 750610, 850000, 750120, 791010, 500900) appear on the finance pages.
    They are the code's defaults, not real data. OK to publish?
