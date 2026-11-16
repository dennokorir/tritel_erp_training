# Accountability: questions raised while writing the training pages (2026-11-16)

The pages document what the code does today. Where it's confusing, they carry a calm "Good to know" note.
Each question below is either a decision for the product owner or a candidate fix. Answering one may mean
updating the page(s) listed.

## Decisions on rules

1. **Late Set: creation date or activation date?** The code uses the target's creation date. The deadline's
   help text and the activation note say "activated". Pages: concepts/targets, workflows/target, faq.
2. **Close objectives before the period?** Achievement is worked out only when an objective itself is closed.
   Closing the period doesn't close its objectives. An objective closed after its period keeps
   "Not Set", because the figures are frozen. Pages: workflows/objective, how-to/hr-admin/open-and-close-periods.
3. **Exempting someone:** only *new* targets become Development. Should their existing targets switch too?
   Page: how-to/hr-admin/exempt-staff.
4. **Should staff type their own actuals?** The portal's **Update Actual** and the target form's actual both
   count towards the score before any review. Page: how-to/everyone/my-performance-portal.
5. **Number targets entered by hand are rated on pace.** **Measure Over** defaults to **Period to date**, but
   the field only shows once a metric is chosen. Page: calculations/ratings.
6. **A target value of 0 always scores 0%**, even for "Lower is Better". Should training warn against it?
   Page: calculations/target-scores.
7. **A manager with no scored team members** gets an overall score of only 40% of their own score.
   Intended early in the year? Page: calculations/own-team-overall.
8. **Own + Team weights aren't required to total 100.** 50/60 would let scores exceed 100%.
9. **Fixed timings:** confirm these are policy, or make them settings:
   - 2-day review reminder
   - 7-day "Late" mark
   - 3/6-day age bands
   - 7-day brief send window
   - milestone reminders at 7, 3 and 1 days
10. **Escalation contacts** who are not managers or HR see escalations only through My Actions. Is that OK?
11. **Who holds the Accountability Administrator role** (HR, MD's office, IT)?
12. **Progress briefs, market coverage, bid desk and bid quality metrics:** are they on and set up in
    production, and under what names? The pages say "once an administrator sets them up".
13. **OEM-recognised revenue** is organisation-wide, not per person. Is it meant for the channel manager only?

## Who can press what (candidate fixes)

14. **Adopt / Decline** and **Approve Pull / Deny Pull** don't check who presses them. Pages tell staff only
    the recipient or owner should use them.
15. **Any line manager can activate, close or reset any objective**, in any department.
16. **Change-request approvers** are the submitter's manager plus all HR. Administrators approve only when
    there's no manager and nobody in HR.

## Confusing screens (candidate fixes)

17. **Two "Sign Off" buttons:** the Conduct Review window's **Sign Off** sends the review to the employee; the
    review form's **Sign Off** closes it without asking them. Rename one?
18. **Review session "Mark Done"** has no checks. Draft reviews stay draft and those employees are never notified.
19. **"Compliance Floor"** holds the upper limit for "At or below ceiling" SLA targets. Relabel it?
20. **On-Track / Needs Attention threshold settings** are stored but not on the settings form, and not used.
21. **Performance Overview** always prints "Composite = 40% Own + 60% Team Avg", whatever the settings say.
22. **Session "Scored (%)"** counts skipped and N/A lines as scored. The session average counts each employee
    equally, though its text says "weighted by target weight".
23. **Team Reviews pivot:** "Avg Score (%)" is summed rather than averaged, and open reviews count 0 turnaround days.
24. **Compliance screen:**
    - a pull request's status shows the raw value "pull_requested";
    - the empty-screen text mentions a "Cascade ↓ from My Targets" button that isn't there;
    - the "Cascade Recipients" grouping never appears.
25. **Portal Update Actual on SLA targets** raises an error the portal doesn't catch, so the employee sees an error page.
26. **Backend Request Review** only changes the status. Only the portal version gives the manager a to-do.
27. **Activating through a change request** never shows the "New Balance" window or the "Review the Balance" to-do.
28. **Send briefs now** works even while "Send progress briefs" is switched off.
29. **A period's Close button** has no confirmation question.
30. **Dead code:**
    - the "Withdraw from Scorecard" window can't be reached;
    - the "Created by Cascade From" grouping is never filled.
31. **Spelling:** Session Coverage spells "Semi-annual"; everywhere else it's "Semi-Annual".
