# Tenders, Channel and Commercial Targets: questions raised while writing the training pages (2026-11-16)

The pages describe what `tritel_tender_tracker` and `crm_tender` do today, with "Good to know" notes where it
confuses. Each item is a decision for the product owner or a candidate fix.

## Tender access and status moves

1. **No back-office restrictions on tenders.** Every internal user can see and edit every tender. The record
   rules apply to portal users only.
2. **Won, Prequalified, Lost, Drop and Cancel have no role check.** Should they be limited to a role?
3. **The team check runs on every status move**, Drop and Cancel from Draft included. Non-administrators
   can't move a tender at all without both a Bid Liaison and a Technical Presales. Keep it?
4. **Nobody can delete a tender**, Tender administrators included. Intended?
5. **Reopening from Evaluation to Bidding** keeps **Actual Submission** and **Quality Check** as they were.
   Reset them?
6. **Bid Bond Required can't be set in the back office.** Until it can, the bid bond checklist row and its +1
   workload point never apply. Add it to the Tender Info tab?
7. **The must-win lock after submission** is switched off "temporarily". Turn it back on?
8. **"Disqualified: late submission"** isn't linked to the **Submitted Late** flag.
9. **Prequalification status bar:**
   - anyone can click it to any status;
   - **Renewed** can't be chosen on it;
   - only Active prequalifications get expiry reminders.
   What do Applied, Renewed and Closed mean, and who owns them?

## Business cases

10. **Reject can't succeed in the back office.** **Rejection Reason** shows only once a case is already
    Rejected, so Reject always stops with *Please enter a rejection reason before rejecting.*
11. **The case "owner" is whoever first clicks the Business Case button.**
    - If a Head of Commercial opens it first, they never see it under *Business cases to approve*.
    - The "to finish" items then go to them, not the Account Manager.
12. **Approve / Reject** are hidden from other roles but have no check behind them. Cost lines stay editable
    after approval.
13. **Actuals use confirmed order totals including VAT**, while the estimate's cost lines are before tax. A
    "gain" in gross profit can be only VAT.

## Bid desk and quality

14. **Fair workload:**
    - a tender's own points are added to the team total even when they're already in its Bid Liaison's figure;
    - its points are also added when its deadline is outside the quarter;
    - a tender with no deadline counts 1 point.
15. **Bid Quality Score:**
    - a disqualification blamed on the Bid Liaison counts 0% even on a dropped, never-submitted tender;
    - a disqualification still "To Confirm" counts at the bid's score;
    - a scored cancelled tender counts.

## Summaries, customers and the portal

16. **The summary library in the back office** shows every Complete summary to every tender-role user. The
    portal limits people to their own scope.
17. **Export for Marketing** works for anyone with library access, not only the two heads.
18. **Portal Reopen** of a summary has no confirmation; the back office asks first.
19. **"Reference status"** is required but never shown in the library or the packs.
20. **Approve Proposed** makes every ticked customer a target account, proposed or not.
21. **Dashboard counts:** touch counts and Recent Activities include planned activities, and Recent Activities
    ignores the period.
22. **/my/customers:** Bid Liaisons and Presales can pick any Account Manager's accounts.
23. **Portal teams for heads** are everyone in the matching role. Customer Activities and Market Coverage use
    the reporting line instead.
24. **A future-dated "log"** saves the touch, then fails to mark it done, leaving a hidden planned touch.
25. **"Touch Phase" and "Activity Phase"** are two different ideas with similar names.
26. **Coverage ladder:** only the three standard early CRM stages count as "open". An active opportunity in any
    later stage, or an archived one that wasn't won, makes the customer **Contested**. What are Tritel's first
    three stages called?
27. **Achievements to attribute** shows only to the two heads, not to Tender administrators.

## Channel (crm_tender)

28. **Cancelled orders:** after a purchase order is cancelled, a confirmed booking still counts in full.
    **Confirm** refuses until the cancelled lines are removed.
29. **The OEM purchase order count** still counts cancelled orders (it checks 'cancelled', Odoo uses 'cancel').
30. **Untagged Purchases:** Channel Managers can only read purchase lines, so editing the OEM in the list needs
    purchasing rights. **Set OEM** works without them. Who owns tagging?
31. **Learning Development:**
    - a pass creates a certificate with no course, name or OEM;
    - the Pass/Fail **Date** isn't stored;
    - dragging a card doesn't change its status;
    - certificates are always Active.
32. **Compliance menu titles are swapped:** **Compliance Calendar** opens "Compliance Churn", and
    **Compliance Churn** opens "Compliance History". Are expiry reminders wanted for compliance documents and
    certificates?
33. **Estimated Value** on vendor opportunities: which currency should staff type?
34. **Load order:** crm_tender's Compliance menus hang under the tender tracker's menu without depending on it.
    A fresh install of crm_tender alone would fail.

## Commercial Targets

35. **Attribution lines still need an individual target.** Once the old targets are replaced, what will a line
    attach to?
36. **"Number of Tenders" targets** still sum money. Period "Closed" locks nothing, and **Set Active** shows on
    closed periods.
37. **% Achievement** may display ×100 (for example 6000%). Please confirm on screen.

## Small fixes

38. **Typos:** "Technnical" in to-do names; "Congratutulations" in the won email subject.
