# Board portal: questions raised while writing the training pages (2026-11-16)

The pages describe how `e_board` behaves today, with "Good to know" notes where it may confuse. These are
decisions or wording checks for the product owner.

## MD quarterly review

1. **Naming a reviewer mid-quarter** opens a review for the most recent finished quarter. For example, naming
   one in November opens Q3. Intended?
2. **Removing the Board Reviewer** while a review is With the board leaves nobody able to sign it, because a
   backup needs a reviewer. What should happen?
3. **The MD has no Board Reviews menu.** They reach the review through the to-do or My Actions.
4. **A result of 0 with a comment** can be submitted.
5. **Signed-off reviews can't be reopened.**
6. **Reminders:** with no backup named, only one reminder is sent.
7. **Metric results are fixed when the review opens.**
8. **"Result (proposed X, scores Y%)"** always shows the proposed score. A changed result's score appears only
   after sign-off.
9. **The score basis** is the part of a target the MD keeps after cascading. The card shows the full target value.

## Board members and invitations

10. **Inviting someone who is already a staff user** sends them the sign-up email. What should happen instead?
11. **Removing a board member's access:** nothing in the module does it. Should the guide say "a System
    administrator removes the Board Viewer role"?
12. **The invitation email** says the link lasts 24 hours, but no expiry is set on the link.

## Figures

13. **The organisation score and its rating label** use different figures.
14. **"Hide from Board Portal"** hides an order from the Financial Position lists, but its invoices still count
    in Revenue and Total Spend.
15. **Aging cells** include order balances aged from the order date. The lists behind them show invoices only,
    so a list can add up to less than its cell.
16. **Credit notes** aren't taken off Revenue or Total Spend.
17. **Tender figures by quarter** follow overlapping tender periods. With year-long periods, a quarter shows the
    whole year.
18. **Payroll:** a payslip counts only once its pay period has ended, so the current month is missing mid-month.
    May the guide show salary rule codes (P030, P120 …), or should it use their on-screen names?
19. **"As at" for a closed period** has no "Today" option. The dropdown shows the period-end option while live
    figures are on screen.
20. **"No business case" vs Draft:** a tender with a case but no cost lines counts as "No business case".
21. **"Today" on the access log** may start at midnight server time rather than Kenya time.
22. **Cheques:** **Sign** still shows on a fully authorised cheque the user hasn't signed. Only PDC managers can
    delete a wrong signature. Should the FAQ name that role?
