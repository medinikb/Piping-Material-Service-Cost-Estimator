# Step 7 regression verification

Date: 21 October 2026 (Asia/Calcutta).

This log records software checks of the local static estimator. It does not certify the PMS PDF, approve engineering substitutions, confirm supplier market prices, or assert that every source row has a supported price model.

## Existing suites

All five existing suites passed before the new full-workflow sweep:

| Command | Result |
| --- | --- |
| `node tests/material-matching.cjs` | 114 checks; all 1,698 PMS rows parsed |
| `node tests/material-coverage.cjs` | 74 checks against loaded and embedded backup libraries |
| `node tests/component-coverage.cjs` | 43 recognition/quotation-route cases |
| `node tests/special-component-pricing.cjs` | 51 policy checks; 147 bolting/gasket specification rows reviewed for pricing-route eligibility |
| `node tests/pricing-integration.cjs --excel` | 51 integration checks, including native XLSX round-trip and real template extension in memory |

These counts describe assertions/cases in different suites; they should not be interpreted as independent engineering approvals.

## Full-workflow sweep

The new `tests/full-workflow-verification.cjs` loads the real application functions, service libraries, material libraries, flange model and unequal-tee data in a startup-independent JavaScript environment. Browser controls are represented by small test controls, so the sweep does not verify browser layout or Microsoft Excel's interactive recalculation engine.

Every source material record is exercised through its item name or pipe construction type, every available item alias, low and high size endpoints, and selected common sizes inside its stored range. The source-aware run processed 9,640 expanded scenarios from 1,698 rows and 67 classes. Of those, 6,645 produced a calculated rate and 2,995 deliberately required review. A review outcome is not a test failure when the item lacks a supported material, geometry or commercial rule, or its source specification is explicitly unresolved.

The final source-aware run passed **9,675 checks with zero failures**. It uses the actual old PMS builder's `getSourceVerificationAudit` helper to carry source status/note into every source-item scenario. It does not reconstruct that export convention independently. This prevents a source-flagged row with otherwise recognisable material text from bypassing review during the old-builder-to-estimator handoff.

For calculated scenarios, the sweep checks positive finite unit rate, finite total, quantity reconciliation and P90 not below Normal. For unpriced scenarios, it requires a visible reason. It checks numeric material strings `190`, `000`, `163` and `160` cannot automatically price without a confirmed input.

The mixed-BOM fixture exercises a pipe with raw/factor overrides, a flange with raw/factor overrides, a reducing tee with raw/factor overrides, a quoted gasket, an unresolved needle valve and an ordinary gate valve. The workflow checks:

- Repeat upload with a replacement batch key does not duplicate rows.
- Pipe summary and component cost agree on the overridden pipe total.
- Finished quotations take priority over raw/factor inputs and retain their source reference.
- Blank, zero, negative, infinite and non-numeric quantities cannot create totals.
- Background flange and unequal-tee model loading preserves row inputs.
- A year refresh preserves explicit raw/factor overrides and quotations while updating library-based components.
- Asynchronous material-library loading refreshes the manual component preview.
- Full report HTML includes quotation references, rate-basis notes and review items.
- An actual native XLSX serialization/reopening retains quoted/review statuses, quotation references, cached totals and group reconciliation.
- Explicit source-review status blocks raw/factor/finished-unit overrides, survives import/repricing and appears in report/Excel notes. Source-checked, unmarked and not-checked legacy rows do not acquire an invented engineering approval.
- Source-review pipe and valve rows cannot contribute priced Part B service costs while their engineering identity remains unresolved.
- The actual old PMS preview/export functions produce an in-memory HTML-XLS download with the source status and note. Its half-inch size remains the literal `0.5"` through real SheetJS parsing with `raw: true`, worksheet-header detection and estimator import; it does not become an Excel date serial. The test also verifies exported data cells carry text-format hints.

No workbook is written by the test. The optional `--excel` check downloads the same `xlsx-js-style` dependency already used by the application and exercises it in memory.

## Defects found and returned to the parent implementation

1. `loadFlangeWeightModel` and `repriceUnequalTeeBomItems` originally rebuilt component estimates without saved raw-price overrides, factor overrides, confirmed finished rates or quotation references. The parent added a shared repricing helper that carries those inputs through background loads and year changes.
2. Initial asynchronous library loading did not refresh the manual component preview. The parent added preview refreshes so a valid default does not remain temporarily labelled as unmapped after the library is available.
3. A browser handoff exposed half-inch text being guessed as an Excel date during HTML-XLS upload. The parent added literal-text parsing and export text-format hints; the new in-memory producer/parser/import check guards that handoff.

The new workflow checks are regression guards for those cases. Application changes are owned by the parent task; this verification task only adds its test and this log.

## Separate browser/download checks reported by the parent task

The parent task additionally exercised the real browser and reported:

- The available project BOM template imported 10 component items and 2 pipe rows.
- The default WCB component estimate refreshed correctly after library loading.
- A quoted gasket at Rs 750 for quantity 2 produced Rs 1,500.
- An actual downloaded XLSX report reopened using openpyxl with formulas and quotation reference retained. Desktop Microsoft Excel recalculation was not run.
- An actual old PMS HTML-XLS download retained its half-inch size and source-review status after estimator upload: 0 priced items, 1 review item, with material and Part B service costs excluded.
- The five existing estimator suites were rerun successfully (333 assertions/cases); the separate source-verification suite passed 22,804 checks. See `source-verification-log.md` for the source-audit scope and limitations.

The originally mentioned Downloads workbook `Piping BOM Example Template (2).xlsx` was not available during this run, so these checks do not claim to have retested that exact user file.

## Run command

```powershell
node tests/full-workflow-verification.cjs --excel
```

The command returns a JSON summary with the current source-row count, expanded scenarios, successful assertions and any failures. Re-run after source corrections because material outcomes and counts can change. Source corrections are documented separately in `source-verification-log.md`.

## Metric stud / heavy-hex nut pricing stages 1 and 2 — 21 October 2026

This later entry supersedes the earlier two-nut-only bolting limit. Supported scope is B7 fully threaded studs, 2H heavy-hex nuts and B7/2H sets with an explicit count (default two). Reuses existing mass equations; no gasket model, grade approvals, service-rate changes or NRL factor calibration were introduced. Default 2.50 is visibly provisional. Confirmed raw rates and positive factor overrides are audited; dimensions/counts persist during repricing. Headed bolts, other grades, coatings, washers, imperial/incomplete sizes and source-review rows remain excluded from automatic pricing.

Checks completed:

- `node --check app.js` and `node --check special-component-pricing.js`.
- `node tests/bolting-weight-pricing.cjs --excel`: 46 focused checks, including independently calculated M20 x 110 weights, piece/set reconciliation, counts, invalid inputs, nonlookup dimensions, override scaling, repricing, BOM adapter and native XLSX serialization/reopening (including a three-nut, factor-override row).
- `node tests/special-component-pricing.cjs`: 53 policy checks; all 147 original PMS bolt/gasket rows still require actual usable geometry/rate prerequisites.
- `node tests/pricing-integration.cjs --excel`: 53 checks. The former standalone 2H nut Review fixture now uses unsupported 2HM; supported nuts have dedicated positive and negative tests.
- Material matching 114 checks; material coverage 74 checks; component recognition 43 cases; pipe conversion-factor display 13 checks; source verification 22,804 checks.
- `node tests/full-workflow-verification.cjs --excel`: 9,675 checks, zero failures; 67 classes, 1,698 source rows and 9,640 expanded scenarios.
- Actual browser: M20 x 110 set at illustrative common Rs 90/kg and provisional 2.50 gives Rs 102.65/set; single stud/nut, a three-nut set, factor 3.00, override badges, full printable report notes and no browser console errors verified. The irrelevant rating field remains hidden for bolting.
- Actual browser-downloaded workbook reopened read-only with openpyxl: correct set/nut rates, numeric raw/factor/weights/counts, composition, provisional factor source, formula links and no serialized Excel error cells. The source NRL register and original BOM template were not edited.

Limits at that stage: advertised raw-stock references were not automatic defaults and one common confirmed rate was used per row. The subsequent stock-default integration below supersedes those two limitations. Native desktop Excel recalculation and every device size were not verified. Geometry/composition are fixed within an export; regenerate after changing them in the app. Historical entries above describe the earlier workflow and are retained as history.

## Automatic bolting raw-stock budget defaults — 21 October 2026

User requested that internet references actually supply missing bolt-category defaults. The existing 4140 Rs 90/kg observation was activated for budget use with exact B7/B7M mappings, and four source-linked observations were added once each: C45 Rs 70/kg (2H/2HM nuts), B16 black bar Rs 80/kg (upper endpoint of the advertised 75-80 range), SAE4042 Rs 65/kg (Grade 4 nuts), SAE1020 Rs 65/kg (commercial A307 A/B bolt-stock allowance). Supplier and base-stock technical links, listed stock condition/size, MOQ and limitations are in the JSON. These are saved, provisional 2026 advertisements, not live feeds, certified grade equivalence or procurement approval. No historical rates were inferred.

The supported B7/2H model now sums individual raw costs: stud kg x stud stock price + included nut kg x nut stock price, then applies the existing provisional factor or item override. A raw override takes priority and applies one common rate to both pieces. The numeric effective rate in Excel is raw cost / included kg, not a simple average. This changes commercial inputs and raw-cost combination, not the established engineering mass equations. Source-review, geometry and unsupported-finished-model guards remain active. B7M/2HM, B16/4 and A307 show available raw references without acquiring unsupported finished rates.

Verification performed:

- New `node tests/bolting-stock-defaults.cjs --excel`: **32 checks**, including all exact mappings, distinct stud/nut costs, overrides, historical-year exclusion, missing JSON fallback, source flags, unknown/partial grades, duplicate active references, ambiguous multiple grades, unchanged gasket policy, import/repricing, source audit and XLSX serialization/reopening.
- Every one of the 67 PMS bolting rows has a source-backed stud/bolt stock reference. 63 have an identifiable nut-stock reference. The four A307 rows do not establish a supported nut grade; none was invented. This is raw-stock coverage, not finished-price or source-engineering approval.
- Hash checks confirm original pipe-price metadata and all 39 original grade-family records (including yearly/recommended rates) remain unchanged. Ten stock observations have unique IDs and only declared/required schema fields. No duplicate root price collection was created.
- Existing suites: 45 bolting weight/override checks, 53 special-component policy checks, 53 calculated-only integration checks, 14 pipe-factor/Excel checks, 114 material matching checks, 74 material coverage checks, 43 component recognition cases and 22,804 source-verification checks passed.
- Full workflow with Excel: **9,675 checks**, zero failures, across 67 classes / 1,698 source rows / 9,640 expanded scenarios.
- Browser: Year 2026, M20 x 110 B7/2H, Qty 10 and both overrides blank produced stud Rs 90/kg, nut Rs 70/kg, **Rs 91.29/set**, total **Rs 912.89**. Raw override 100 and factor override 3 produced **Rs 136.87/set**. B16/4 displayed raw Rs 80/65 with finished Unit Rs still Review. Full printable report showed the constituent rates, provisional badges and sources; no browser console errors were captured.
- Actual browser-downloaded XLSX was reopened read-only. It retained effective rate 80.03967836232707, separate rates 90/70, URLs, check date 2026-10-21, cached unit/total values, live formula links and the 100/3 override row; no serialized error cells. Native desktop Excel recalculation was not tested.

The app still needs its JSON to load (serve the static app normally); if unavailable it does not invent a replacement bolt-stock default. Previous rate/download claims remain historical. Regenerate reports after Ctrl+F5 to obtain the new basis. Gasket references, finished gasket policy, original BOM template and NRL register were not modified by this change.

## Missing bolting prices when JSON loading fails — 21 October 2026

The preceding JSON-required limitation is superseded for saved bolting stock defaults. The legacy fallback had pipe prices but no bolting observations, so a failed master JSON request reproduced the user's Review screenshot despite valid M24 x 145 geometry. The app now loads a generated classic-script snapshot before its calculator, merges its saved observations into the fallback and records the actual source. Fresh valid JSON remains authoritative, including deliberately disabled defaults; unsupported years, grades, geometry and source-review exclusions remain guarded. No mass equation, conversion factor or service-rate rule was changed.

The master JSON remains the sole editable price source. `scripts/build-bolting-stock-bundle.cjs` generates the browser asset; `--check` verifies exact synchronization. Deploy both data files and the updated index/app together. Missing bundle plus failed JSON remains Review with an actionable file message, rather than inventing a rate.

`node tests/bolting-offline-loading.cjs --excel` passed 18 checks: exact five enabled bolting observations, script order, failed/404/invalid JSON requests, no-store fetch, valid-JSON priority, disabled-default protection, real Quick Estimate output, override priority, historical-year exclusion, missing dimensions, unsupported-grade finished-price exclusion, source flags, missing bundle and XLSX serialization/reopening. For Year 2026 / M24 x 145 / B7 + 2H / Qty 1 / blank overrides, the tested display and export show stud Rs 90/kg, nut Rs 70/kg, factor 2.50 and finished **Rs 165.64/set**. Tests run in an isolated JavaScript environment; they do not modify user workbooks.

Existing bolting stock (32), bolting weight (45), integration (53) and full workflow (9,675) checks with Excel serialization passed. The workflow covers 67 classes, 1,698 source rows and 9,640 expanded scenarios, with zero failures. Browser visual verification of a double-click `file://` launch was unavailable because the browser tool blocks local-file URLs; no alternative browser launch was attempted. Desktop Excel interactive recalculation was not tested.

After concurrent reference-data additions, the offline test was rerun successfully against the combined bundle, filtering its assertions to the five enabled bolting observations. The generator synchronization check passed for all ten bundled component observations. Additional preservation checks passed: special-component policy 53, pipe-factor/Excel 14 and service-size fallback 36. JavaScript syntax checks passed for app, generated bundle and generator. Other component reference records and unrelated service edits were retained.

## Compact quick-estimate calculation details — 21 October 2026

At the user's request, successful Component Quick Estimates now show only a short derived-price sentence below the existing output cards. The complete unchanged calculation note is inside a native, initially collapsed `details` control labelled Calculation details & sources. No new library is needed. Text is assigned as text, not executable markup; long URLs wrap and the control has a keyboard focus indicator. Expanded details remain open during valid recalculation. Review/error reasons stay visible and hide/reset the details control, rather than disappearing behind it. Full reports, Excel audit data, mass equations, rates and factors were not altered.

Verification: JavaScript syntax; 20 offline-loading/real-renderer/Excel checks, including short output, preserved complete note, collapsed HTML structure, open-state retention, override updates and visible Review reasons; 53 pricing integration/Excel checks; 14 pipe-factor/Excel checks; 32 bolting-stock/Excel checks. All passed. No browser visual inspection or desktop Excel interactive recalculation was performed for this presentation-only change. Changed files: index.html, style.css, app.js, focused test and documentation.

### Follow-up: keep the bolting calculation visible

The user requested that composition, weights and the complete Unit Rs expression through the factor remain outside the button. The bolting calculation now exposes a summary and remaining-details string; their concatenation preserves the full original audit note used by reports and Excel. The Quick Estimate shows the derived price plus that calculation summary, while the button contains only the remaining audit information. Other component and gasket presentation logic is retained. No price, mass, factor or service formula was changed.

Passed: app syntax; 20 offline-loading/real-renderer/Excel checks (now asserting the exact M24 x 145 visible weights/formula, source separation, complete audit-note reconstruction and updated raw/factor override formula); 45 bolting weight/pricing/Excel checks; 53 pricing integration/Excel checks. Native browser layout and desktop Excel recalculation were not visually verified.
