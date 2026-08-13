# Legal review

Last full review: 13 August 2026

This note records the legal sources behind the three calculators. It is a
maintenance aid, not a substitute for legal advice. Recheck all sources before
changing calculation rules.

## Deadline calculator

Primary source: [Swiss Civil Procedure Code, arts. 142-146](https://www.fedlex.admin.ch/eli/cc/2010/262/de)

- Day periods start on the following day; month periods use the corresponding
  calendar day. A missing target day is replaced by the last day of the month.
- Under art. 142 para. 1bis CPC, ordinary post without proof of receipt,
  including A-Post Plus, delivered on a weekend or recognized holiday is deemed
  delivered on the next working day.
- The holiday in art. 142 para. 3 CPC is the holiday recognized at the court
  location. Because recognition can vary locally, the UI requires explicit
  holiday selection and no longer assumes a canton-wide list.
- Court holidays apply to ordinary and simplified proceedings. Art. 145 para. 2
  excludes only conciliation and summary proceedings. This point was explicitly
  rechecked because older summaries sometimes also exclude simplified cases.
- Since 1 January 2025, art. 145 para. 4 CPC applies CPC court holidays to all
  DEBA actions filed in court, but not to complaints before the supervisory
  authority. The former general reservation in favour of DEBA holidays must not
  be restored.
- Calendar and PDF day counters omit suspended days and do not invent an extra
  deadline day when the final date moves under art. 142 para. 3 CPC.

## Prescription calculator

Primary sources:

- [Swiss Code of Obligations](https://www.fedlex.admin.ch/eli/cc/27/317_321_377/de),
  especially arts. 60, 67, 127-139, 210, 371 and 454
- [Debt Enforcement and Bankruptcy Act](https://www.fedlex.admin.ch/eli/cc/11/529_488_529/de),
  especially art. 149a
- [Insurance Contract Act](https://www.fedlex.admin.ch/eli/cc/24/233_245_233/de),
  especially art. 46

- Dates are strict calendar dates. Leap-day anniversaries are clamped to the
  last valid day of February.
- For claims with relative and absolute periods, both source dates are required.
- Personal injury is split by legal basis: tort claims use art. 60 para. 1bis CO
  and contractual claims use art. 128a CO. Both have a three-year relative and
  twenty-year absolute period, but contractual claims require knowledge only of
  the damage, not of the liable person.
- Under art. 210 para. 3 CO, the one-year period for defects in cultural property
  starts on discovery and the thirty-year maximum starts at contract conclusion.
- DEBA art. 149a is represented by separate choices: twenty years from issue of
  the loss certificate against the debtor, and at most one year from opening of
  the succession against heirs. The earlier expiry always controls.
- An interruption restarts prescription under arts. 137-138 CO. The entered
  restart date must be the legally relevant date: recognition, the latest debt
  enforcement act, completion of the relevant court instance, or the date on
  which the claim can again be asserted after bankruptcy.
- A claim acknowledged in a document or established by a judgment receives the
  new ten-year period under art. 137 para. 2 CO.
- Suspension under art. 134 CO is described on the site but is not calculated;
  its factual prerequisites require an individual legal assessment.

## Termination calculator

Primary sources:

- [Swiss Code of Obligations](https://www.fedlex.admin.ch/eli/cc/27/317_321_377/de),
  especially arts. 266c-266e, 266l, 335b and 335c
- [Insurance Contract Act](https://www.fedlex.admin.ch/eli/cc/24/233_245_233/de),
  especially arts. 35a and 89
- [Federal Office of Public Health guidance on changing basic insurance](https://www.bag.admin.ch/de/praemien-und-kosten-antworten-auf-haeufige-fragen)

- Employment periods are calculated to month-end with calendar-safe month
  arithmetic. The selected service-year phase remains the user's responsibility.
- Rental, private-insurance and subscription end dates cannot be inferred from
  the notice date. The calculator therefore requires the real contractual,
  customary or insurance-year end and checks whether notice was received in time.
- VVG art. 35a permits ordinary termination at the end of the third or a later
  insurance year with three months' notice; an earlier contractual right remains
  possible. The entered end date is validated as the day before the corresponding
  anniversary of the first insurance year stated in the policy. Life insurance
  instead follows VVG art. 89 and can be terminated by the policyholder after one
  year.
- Basic insurance normally changes on 1 January after receipt by 30 November.
  A 1 July change with receipt by 31 March is limited to the standard model with
  free choice of doctor and the ordinary CHF 300 deductible. Weekend cutoffs are
  moved to the preceding weekday; a local holiday at the insurer's seat must be
  checked manually.
- Subscription periods shown are examples from contracts or terms and conditions,
  not general statutory periods.

## Verification

Run `node test.js`, then rebuild all six offline packages with
`node offline-bundle/build-all-offline.js`. The generated ZIP files are part of
the release and must be reviewed together with the online pages.
