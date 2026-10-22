# Component recognition changes — 21 October 2026

PMS names now identify their actual component and group. S.W./S.O./W.N. flange labels select Socket Weld / Slip-On / Weld Neck respectively. SWAGE.CONC/ECC and CPLNG.FULL/HALF/RED use their existing named factors. Ecc. Reducer selects the existing eccentric-reducer rule.

Mitre, Cross, Stub End, standalone Nut, combined SPCR & BLN, Left Hand Coupling, Needle Valve, Angle Valve, Diaphragm Valve and Three Way Valve are explicitly recognised but remain Review required because the app has no dedicated approved weight/factor model for those types. No new positive factors or equations have been invented. The combined spacer/blind set is not priced as one generic flange. A generic PMS `Fitting` row needs its actual supported fitting type.

Whole-phrase aliases and longest matching prevent `Nut` from overriding `Stud with Nuts`, preserve the special status of `Angle Globe Valve`, and avoid classifying unrelated words such as nutmeg. Unrecognised group names no longer receive a positive generic component factor. An explicitly selected existing generic `Valve` or `Flange` choice retains its existing budget model; this is separate from an unrecognised named type.

The finished-unit quotation workflow has been removed at the product owner's request. Recognition uses `requiresReview` and `reviewReason` for unsupported types. Classification alone does not approve a service rate or relax material/geometry requirements.

Test: `node tests/component-coverage.cjs`.
