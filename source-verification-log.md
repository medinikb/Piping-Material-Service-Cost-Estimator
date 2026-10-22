# PMS source verification — Step 6

Verified on 2026-10-21 against `Old NRL PMS/Piping Mat. Specification#NRL.pdf` (195 pages). Page numbers below are one-based PDF pages, not printed sheet numbers. The original PDF was not modified.

## Scope and limits

All 67 class JSON files / 1,698 rows were checked programmatically for schema, unique row IDs, positive ordered size intervals, material-code suspects, valid source-page references and conflicting-rating overlaps. These checks are not a line-by-line engineering approval of all 1,698 rows.

16 original PDF pages were rendered and visually inspected: **4, 94, 96, 98, 101, 104, 121, 152, 164, 171, 175, 176, 185, 186, 190, 194**. Inspection focused on suspicious material values, class provenance and the known pipe-range conflicts. No guessed ASTM grades or replacement source sheets were introduced.

Results: **3 confirmed material corrections**, **1 invalid numeric material cleared to blank**, and **59 rows marked `needs_review`**. The 59 are: 24 provisional A4F rows, 13 wrong-page B1F rows, 16 ambiguous material rows, 5 pipe-range rows, and 1 malformed/blank B22A row. The three confirmed corrections use `source_checked`, meaning transcription checked, not procurement or engineering approval.

## Evidence-backed corrections

| Class / row ID | Original material | Verified material | PDF page | Visual evidence |
| --- | --- | --- | --- | --- |
| B21N / valve-globe-sw-0-5-1-5 | 190 | A182GRF347, TR+STELL. | 104 | Material is in the material column; 190 is in the adjacent valve-code column. |
| B23A / valve-globe-sw-0-5-1-5 | 163 | A105, TRIM 316 + STEL | 96 | Material is in the material column; 163 is in the adjacent valve-code column. |
| B26A / valve-globe-sw-0-5-1-5 | 160 | A105,TRIM 316+STEL | 164 | Material is in the material column; 160 is in the adjacent valve-code column. |
| B22A / valve-check-rf-2-24 | 000 | blank — review required | 94 | Source material cell is blank. 000 is a valve code. Rating BALL and dimension 02 also indicate shifted extraction fields; these other fields were not guessed or repaired. |

Each corrected row retains `sourceCorrection.originalMaterial`, `verifiedMaterial`, `sourcePage`, `verifiedOn` and `reason`. Unresolved rows carry `verificationStatus: needs_review` and `verificationNote`.

## Ambiguous materials retained, not silently repaired

The following text is visibly present in the source itself. A controlled source or engineering clarification is required; changing A315 to A351, A152 to A182, etc. would otherwise invent an approval.

| Class | Row IDs | Source material | PDF page | Rows |
| --- | --- | --- | --- | --- |
| A16A | pipe-efsw-16-24 | ASTM A GTL GR.B60 CL12 | 194 | 1 |
| B1F | perm-str-bw-16-42 | B: A235GWP5W; INT:SS304 | 185 | 1 |
| B1K | valve-gate-rf-2-12; valve-globe-rf-2-8; valve-check-rf-2-12 | A315GRCF8, TRIMSS304 | 98 | 3 |
| B21N | valve-ball-rf-2-16 | A315GRCF3M, TRIM. T-8 | 104 | 1 |
| B5D | pipe-e-f-s-w-be-16-16; pipe-e-f-s-w-be-18-20; pipe-e-f-s-w-be-22-24 | ASTM A 6916R1, 25CRCL42 | 101 | 3 |
| B5D | fitting-sw-0-5-1-5; caps-scrf-0-5-1-5 | ASTM A 152 GR.F11 | 101 | 2 |
| D1K | fitting-bw-2-6 | ASTM A403 GR.WP3045 | 121 | 1 |
| G5M | valve-gate-bw-b-16-34-2-12; valve-globe-bw-y-type-2-12; valve-check-bw-stopchk-2-12; valve-check-bw-bs-1868-2-12 | A182 GRCFBC, TRIM SS347 | 152 | 4 |

## Missing source and range conflicts

| Class / rows | PDF page | Finding and disposition |
| --- | --- | --- |
| A4F / all 24 rows | 4, 175, 176 | Page 4 is A4F sheet 1. Pages 175–176 are A1F sheets 2–3, not A4F. Every provisional borrowed row is flagged. Obtain controlled A4F sheets 2–3; no approved replacement was fabricated. |
| B1F / 13 rows with sourcePage 186 | 185, 186 | Page 185 is B1F sheet 3, but 186 is A1N sheet 2. The 13 existing wrong-class rows are flagged and retained for audit. Obtain controlled B1F sheet 2; no missing B1F pipe/flange/fitting specifications were inferred. |
| A19A / pipe-seamless-4-8 and pipe-seamless-8-14 | 190 | STD 4–8 IN and S20 8–14 IN overlap at 8 IN. Both source intervals retained and flagged. |
| A19A / pipe-efsw-16-16 | 190 | PDF prints LOW 18 / HIGH 16. The pre-existing normalized 16–16 range is flagged as unverified, not presented as a source-approved correction. |
| B4D1 / pipe-seamless-be-2-6 and pipe-seamless-be-3-10 | 171 | XS 2–6 IN and S60 3–10 IN overlap at 3–6 IN. Both intervals retained and flagged. |

There are nine differing-rating overlap pairs by matching item/type/end-facing: A19A, A23A, B21N, two B22A pairs, B23A, B25A, B26A, B4D1. Valve alternatives can intentionally share sizes with different ratings or Y-type descriptions, so they were not blanket-merged or declared invalid. B22A's malformed RF record is separately review-blocked above. The audit found no duplicate IDs, invalid numeric interval ordering in current structured data, or out-of-range/missing sourcePage values. This does not certify that every interval matches the PDF.

## Synchronized copies and tests

Source JSON remains authoritative. Corrected values and review flags were synchronized into `Old NRL PMS/src/pipe-spec-data.js`. Five pre-existing offline-copy differences (A1Z, A20A, A3Y, B25A, F5A) were also synchronized from their current JSON without changing those authoritative source records. All 67 offline objects now exactly equal the corresponding JSON objects. The smaller embedded fallback in `Old NRL PMS/src/app.js` covers six unaffected classes, so it required no source-data changes.

Run from the app folder with Node.js installed:

```powershell
node tests/pms-source-verification.cjs
```

The regression checks cover all 67 source schemas / 1,698 rows, all 62 reviewed row identities and values, four original-value audit trails, three source-checked statuses, 59 unresolved statuses, known source-provenance gaps, nine overlap pairs, and exact JSON/offline-copy parity. The estimator integration and browser/export checks are tracked separately by the main task.

## Product-owner action

Provide controlled replacement A4F/B1F sheets and clarify the 16 ambiguous source materials plus the five range records and malformed B22A record. Until then, these rows must remain visibly Review; a price mapping alone must not turn an uncertain specification into an approved estimate.
