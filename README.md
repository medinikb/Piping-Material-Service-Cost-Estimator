# Piping Material & Service Cost Estimator

Live tool: https://medinikb.github.io/Piping-Material-Service-Cost-Estimator/

Piping Material & Service Cost Estimator is a free public BOM-based tool for two separate budgetary views: **Part A - Piping Material Cost** and **Part B - Piping Service Cost**. It estimates pipes, fittings, flanges, valves, bolts, gaskets, and strainers from manual inputs or uploaded BOM files.

The tool is designed for refinery, oil and gas, piping, procurement, and project cost-estimation teams. **Pipe Price Predictor** remains a natural secondary term for existing users and search visibility.

### Pipe conversion-factor display — 21 October 2026

Pipe rows in Component Cost Review, the full material/service report and CSV now show the actual conversion factors as **Normal / P90**, for example **1.80 / 2.70** for default non-coated pipe. The old `1.00` was an additional component multiplier applied to an already-converted pipe rate, not the raw-to-finished conversion factor. Both uploaded and manually added pipe rows now record their actual Normal and P90 factors for consistent audit. Other component factor conventions are unchanged.

No unit-rate, weight or total calculation was changed. Valid BOM/page factor overrides and coated-pipe factors retain their existing values; an override of 1.30 displays 1.30 / 1.95 under the non-coated 1.50 P90 ratio. Missing/unpriced items do not acquire a calculated factor display. Default non-coated factors remain 1.80 and 2.70, not a forced replacement for approved overrides or coated-pipe factors.

The editable Excel pipe sheet keeps a numeric **Normal Factor** in column J so the existing price formulas continue to work. Column Q adds a read-only **Pipe Factor (Normal / P90)** audit pair linked to Normal Factor and P90 Ratio (column L). The displayed pair updates with those inputs in Excel; cached exported values and formula references are regression-tested, but native desktop Excel interactive recalculation was not run. Regenerate existing reports/downloads after refreshing the local app with Ctrl+F5.

Verification: `node tests/pipe-conversion-factor.cjs --excel`. The focused checks reproduce the screenshot's Rs40,606.75/m and Rs57,035.21/m rates unchanged, test default/coated/override/manual pipe factors, compare on-screen/full-report output and serialize/reopen the editable workbook. The Excel check uses the app's existing export library; it does not modify the original template.

### Material matching correction — 21 October 2026

Material identity now uses complete grade tokens rather than substring matches. F11 maps to the existing P11 raw-price basis, WP22 (including class/weld suffixes) maps to P22, and a compound description such as `B: A182GRF5;INT:SS304` uses the F5 body/P5 basis. The complete original material description remains available in reports; trim/internals do not receive a separate price allowance in this correction.

WPB/WPC welded fitting variants remain Carbon Steel, API 5L Gr.B is distinguished from X grades, and A217 alloy castings are classified as alloy steel. Unknown grades cannot select an unrelated grade just by sharing a standard number. No raw-price library values, weight formulas, BOM override priorities, or missing-material fallback policies were changed. Missing library coverage remains a separate follow-up.

Verification: run `node tests/material-matching.cjs` from this folder. Checks cover both loaded and embedded backup libraries, component unit-rate inputs, and parsing all 1,698 PMS rows across the 67 classes.

### Missing material-price handling — 21 October 2026

An item without an approved raw-price mapping now shows **Review required** instead of using the page's current raw rate or the default steel rate. A valid positive, finite raw-price override entered for that item permits the existing calculation; a factor override alone does not. This applies to BOM component pricing, imported pipe lines, pipe quick estimates and prompt estimates. Unpriced BOM items remain in Component Cost Review and the report/Excel group sheets with the reason; they are excluded from material totals and the priced pipe summary.

For manual components, use **Component Quick Estimate → Raw Steel Rs/kg Override**. For BOMs, use the existing **Raw Steel Rs/kg Override** column. Manual pipe estimates retain their existing override field. The override must be a confirmed raw-material rate, not a supplier's finished component unit price. Blank/zero/negative/non-finite overrides do not resolve a missing mapping. Library and BOM values are not changed by this policy. Service pricing remains a separate calculation using its existing service-rate rules.

## Material and component coverage — Steps 3, 4 and 5 (21 October 2026)

The app uses calculated material estimates only. Supported components use an explicit material-library or confirmed raw Rs/kg basis with the existing calculation. Finished-unit quotation entry has been removed from both manual entry and BOM import at the product owner's request. Items without a defensible calculation remain Review required and are excluded from material totals. This removal does not add missing bolt/gasket pricing models or market rates.

### Step 3: additional material price bases

After the Step 6 source corrections, the existing library maps 265 of the 344 distinct material descriptions in the 67 PMS class files (1,480 of 1,698 specification rows). This is raw-price mapping coverage, not a claim that every component/size has an automatic finished unit rate. The 79 unmapped descriptions include bolting/gasket descriptions, incomplete or doubtful source text, lined constructions and unsupported materials. Explicit source-review flags can still prevent a mapped item from being priced.

Additional mappings cover A216 WCB cast bodies, grade-specific A217/A351 castings, supported A358 stainless welded pipes, A672 carbon-steel plate pipes, supported A691 alloy plate-pipe grades, IS1239 black/IS3589 Gr330 carbon-steel stock allowances, and supported A515/A285 plate descriptions. The default A216 WCB gate valve now uses the existing carbon-steel stock price basis. These commercial raw-stock allowances are explicitly labelled in the calculation/report notes; they are **not engineering material substitutions** and do not add an independently verified market quotation. No library rate amounts were changed.

### Step 4: bolting and gaskets

- Supported metric pricing includes **A193 B7 fully threaded studs**, **A194 2H heavy-hex nuts**, and their complete sets. Use `M20 x 110` for a stud/set and `M20` for a nut. A B7/2H pair description is also accepted for individual pieces. A generic Nut input explicitly uses the heavy-hex assumption shown in the audit; explicitly ordinary hex, lock, thin or other unsupported nut constructions remain Review.
- Existing geometry formulas are reused: density 7,850 kg/m3, effective diameter `d - 0.649519 * pitch`, the stud cylinder formula, hex-minus-hole nut formula and 0.95 nut shape correction are unchanged. Only the included pieces change. Stud only = stud mass; nut only = one-nut mass; set = stud mass + nut count x one-nut mass. Default set count is two. An explicit count in a BOM description (`Stud with 3 Nuts`) or Quick Estimate field replaces it; conflicting counts are rejected.
- Raw cost now uses **stud kg x stud stock Rs/kg + included nut kg x nut stock Rs/kg**, then applies the item conversion factor. Exact mapped, source-linked **2026 provisional internet stock defaults** are automatic when the raw override is blank. A positive BOM/manual raw override takes priority and applies a common rate to both pieces. Stock prices do not certify finished grades or calibrate conversion factors. Existing pipe recommended/yearly rates and gasket pricing are unchanged.
- Default factor **2.50 is provisional and not NRL calibrated**. Quick Estimate has an item-level Estimate Factor Override; the existing BOM override column also replaces the factor once. The pipe panel's factor and coating inputs do not affect bolting. P90 retains the established uncoated P90/Normal ratio of 1.50. Quantity must be a positive whole-number piece/set count. Kg and LOT cannot be treated as counts.
- Quick Estimate accepts confirmed pitch, nut across-flats and nut thickness in mm. Blank dimensions use the exact existing metric lookup. Missing sizes remain Review unless all required missing dimensions are supplied; no nearest-size or imperial conversion is guessed. Manual rows retain geometry, nut count and factor during background repricing. BOM inputs use standard lookup geometry and may state nut count in the description.
- Screen/report notes show composition, weights, individual stock rates, factor/source, supplier URLs, check date and limitations. Excel keeps A:P and adds bolting audit columns Q:AG (R:AH in a mixed pipe-audit sheet), including separate stud/nut prices and source URLs/date. Column F is labelled **Effective Raw Steel Rs/kg** for bolting: raw cost / included kg, a weight-weighted rate, not the average of two prices. F, J (factor), G (quantity) and L (P90 ratio) remain editable. I = included kg x F; K = I x J. Editing F applies a common override to both displayed part rates. Source columns identify Excel edits; the long Source / Note retains the original app calculation. Geometry/composition are fixed at export and require regeneration after changes. Non-bolting formulas are unchanged. Serialized values/formulas are tested, not native desktop Excel recalculation.
- B7M/2HM, B16/4 and A307 now have source-backed raw-stock references visible for audit, but their **finished unit prices remain Review** until their own supported conversion/model rules are added. Incomplete/imperial geometry, headed bolts, coatings and washers also remain Review; a known raw price does not approve a finished model. Source-review flags still block pricing first. A307 specifies the bolt stock here; no nut grade is invented from that designation.
- Gasket raw inputs are now visible independently of finished pricing. Matching saved references are SS304/304L strip Rs 210/kg, SS316 strip Rs 320/kg, SS316L strip Rs 370/kg, graphite foil Rs 350/kg and PTFE sheet Rs 1,250/kg. These are the existing JSON observations, not newly verified/live/year-specific prices. A positive BOM/manual raw override takes display priority (e.g. Rs 66/kg), with the saved references still available in the source notes. Exact reference keys are stored beside each observation; no SS316/316L or unsupported-grade substitution is allowed. Jointly advertised SS304/304L stock remains explicitly unverified for grade substitution.
- Without a complete Manual build or a supported AUTO budget/default build, constituent references stay separate and the finished price stays Review. Both routes use the weight calculator; no legacy generic 0.06 pipe factor is used. Source-review flags still block first. Expandable calculation notes expose constituent weights/rates, stock suitability, source URLs, yield and factor.

Gasket regression: `node tests/gasket-raw-references.cjs --excel` checks reference-only fallback without the AUTO module: manual/default/BOM raw display, exact matching, invalid inputs, composite constituents, excluded totals, source guards, offline parity and Excel serialization/reopening. New AUTO mode is verified separately below.
- Explicit polymer, rubber-lined or jacketed material descriptions remain Review required. A raw-price override cannot enable a steel-weight estimate for the complete construction. The ordinary pipe coating input remains separate.

#### Internet raw-stock defaults — checked 21 October 2026

These five observations are stored once each under existing categories in `raw_material_price_library.json`. Per-observation exact grade mappings share a price reference without duplicating it. `component_price_reference_policy` schema version 3 distinguishes automatic budget use from procurement approval; gasket observations retain candidate status rather than approved-stock status. Manual mode requires explicit acceptance of suitability. The separately authorized AUTO budget policy may use candidates provisionally with visible limitations, not as approved ring/winding stock. The old blanket `approved_for_automatic_pricing` flag is replaced by budget-use and procurement-approval fields.

### Gasket weight-based budget pricing (option 2, Manual mode)

`gasket-weight-pricing.js` provides the independent calculation. `app.js` connects manual inputs, optional BOM columns, report audit, repricing and editable Excel export. No paid account or new runtime package is needed; deploy the new scripts/catalog alongside the existing static files.

- Unit Rs = sum(finished constituent kg per ONE gasket × constituent Rs/kg) / (yield % / 100) × entered gasket conversion factor. The conversion factor includes fabrication, inspection, overhead and margin as entered; do not add these twice. Tax/freight excluded.
- Sheet ring/full-face: confirmed kg, or actual OD/ID/thickness in mm and density in kg/m3. Dimension weight = π/4 × (OD² − ID² − hole count × hole diameter²) × thickness × density × 10^-9. Full-face dimensions require hole deductions. Hole placement/fit is not verified.
- Spiral wound: entered winding, filler and included inner/outer ring masses and rates; explicitly select NONE/INNER/OUTER/BOTH. Raw Steel Override applies only to the primary/winding constituent, never every constituent. Ring rates are always explicit.
- RTJ: confirmed kg and explicit primary raw rate. No washer approximation or automatic strip-price substitution. Other single-material measured gaskets use confirmed kg; arbitrary multi-material constructions other than spiral wound need a separate model.
- Yield (above 0, at most 100), conversion factor (positive) and a calculation/drawing basis are required, with no hidden defaults. Gasket Conversion Factor takes priority over the generic BOM Estimate Factor Override. Quantity must be a positive whole piece count. P90 ratio ≥1; blank uses the existing 1.50 app budget scenario, NOT a statistical probability calibration.
- No historical PO finished-unit prices are used. Saved candidate raw references require `Gasket Accept Stock References = Yes` after stock-form suitability review, or enter explicit raw rates. Blank rates are not guessed for CAF/butyl/RTJ or unknown grades.
- `gasket-class-catalog.bundle.js` is generated from the original 67 PMS class JSON files (80 gasket rows); it carries specification metadata, not geometry or prices. Build/check with `node scripts/build-gasket-class-catalog.cjs [--check]`. Optional class selection validates exact class, size range, material and construction. F15M has no gasket specification; A4F's source-review flag remains blocked. Contradictory type/material source rows need confirmation; original files are not silently corrected. A separately confirmed design can be estimated without linking a class, but is not certified as PMS compliant.
- Manual mode: choose Gasket and enter construction and required weight inputs under Advanced. Changing class/size clears prior design-specific inputs. AUTO now supplies routine geometry and budget assumptions as described below. Custom designs still require confirmed inputs.
- For Upload Excel BOM, add the exact optional column labels in `GasketWeightPricing.fields` or start with `Gasket Weight BOM Example.csv`. All sample numbers are demonstration assumptions. Save as .xlsx in Excel if desired; do not treat the sample as approved project data. For dimensions use Gasket OD mm, Gasket ID mm, Gasket Thickness mm, Gasket Density kg/m3, Gasket Bolt Hole Count, Gasket Bolt Hole Diameter mm and method DIMENSIONS. Weight method MASS uses Gasket Primary Weight kg/No. Source review always takes precedence over entered overrides.
- Report details and CSV retain the complete numeric build. Excel adds original constituent weights/rates, yield, dimensions/basis and sources. Its yellow Qty/Base/Factor/P90 cells remain commercial adjustments: changing Base replaces the original weight/yield build; original audit columns do not recalculate. Regenerate from the app after engineering input changes. Composite raw Rs/kg is a net-mass-weighted audit rate, not a second pricing multiplier.

Verify: `node tests/gasket-weight-pricing.cjs --excel`, then existing gasket/bolt/pipe/service/source suites. These are budget calculations, not gasket design approval, procurement quotations or source certification.

### Automatic gasket budget mode (2026-10-22)

Purpose: reduce routine entry to class + size + quantity, or type/material + size + rating + quantity. The class selects gasket type/material and, when unambiguous, its matching flange pressure class. Advanced is collapsed by default. No account, API key, paid package or server is needed; publish the added scripts/bundles alongside `index.html`.

Source and behavior are separate:

- `gasket-standard-dimensions.json`: nominal dimensions from the Lamons Gasket & Fastener Handbook (2015), [manufacturer source](https://www.lamons.com/wp-content/uploads/2021/09/Lamons-Gasket-Fastener-Handbook.pdf). Source page numbers are retained. There are 129 spiral rows (pp.72–75), 99 sheet rows (pp.39–41), 80 full-face rows (pp.42–43), 154 NPS/class-to-RTJ mappings (p.117) and 94 octagonal R-ring sections (pp.118–119). These historical nominal dimensions are NOT a claim of compliance with the current standard, source-PMS fit, or job-specific dimensions. No interpolation/nearest-size or class substitution is used.
- `scripts/extract-gasket-dimensions.py`: reproducibly extracts the numeric rows from a downloaded source at `tmp/gasket-sources/lamons.pdf`, using physical-page clipping to exclude the PDF's off-page duplicated tables. Marked nonstandard/ambiguous rows are excluded. Original PMS source files remain unchanged.
- `gasket-budget-policy.json` plus its schema: initial **provisional** estimating assumptions authorized in principle by the product owner, NOT manufacturer-confirmed defaults or PO calibration. Densities: SS 8000, iron/CS/5Cr 7850, CAF 1800, butyl 1200, PTFE 2200, graphite 1400 kg/m3. Family yield/factor: sheet ring 80%/3, full-face 75%/3, spiral 85%/5, RTJ 70%/4. Unspecified sheet thickness 3 mm; winding 4.5 mm; rings 3 mm. An explicit PMS `n MM` gasket thickness wins. Spiral envelope volume uses 30% metal, 50% filler, 20% void; these fractions are NOT a validated winding design.
- Provisional fallback Rs/kg: 304/304L 210, 304H 260, 316 320, 316L 370, 321 350, iron/CS 90, 5Cr 180, CAF 250, butyl 180, PTFE 1250, graphite 350. Exact saved constituent observations are used before these allowances, except RTJ never activates a thin-strip observation as ring-stock evidence. An allowance equal to a strip observation is still a separate unverified ring-stock allowance, not a supplier ring-stock quote. Prices are NOT live or selected-year values. Unknown grades are not shortened/substituted.
- `gasket-budget-pricing.js`: prepares missing geometry, masses and commercial inputs, then delegates arithmetic and validation to the existing weight calculator. Sheet/full-face use actual annular area with holes. Spiral uses separate winding/filler/inner/outer masses; unspecified stainless construction defaults to spiral, unspecified filler to graphite, inner ring same metal, outer ring CS, both rings included—all recorded assumptions, not engineering approval. RTJ mass = π × pitch diameter × octagonal area × density × 10^-9. Octagonal area = W×H − (W−C)^2 / (2×tan(23°)); corner fillets are neglected. Not an oval/RX/BX/washer model.
- `gasket-budget-library.bundle.js`: generated offline snapshot of policy and geometry. Rebuild/check using `node scripts/build-gasket-budget-bundle.cjs [--check]`. After editing policy JSON, rebuild the bundle, increment version and rerun tests. Startup performs no external data download.

Input priority: entered primary raw override > exact candidate observation (where allowed) > labelled provisional allowance. Entered gasket factor > generic BOM Estimate Factor Override > family factor. Entered geometry/constituent weights, filler/ring rates, yield, density and P90 ratio override their relevant defaults. Primary raw override NEVER applies to all constituents. AUTO accepts candidate stock observations provisionally without another item-level checkbox; Manual retains explicit reference acceptance.

BOMs with ordinary fields default to AUTO. `Gasket Pricing Mode = AUTO` explicitly allows partial Advanced overrides plus defaults. Legacy BOMs with explicit geometry/weights and no mode keep the strict Manual calculation; add AUTO if partial geometry should be completed. Factor/yield/rate-only overrides do not disable automation. `Gasket Pricing Mode = MANUAL` disables defaults. Complete original weight-BOM examples remain compatible.

Safety: source-review flags block first. Wrong class material/construction or pressure rating, job-specific flange dimensions, missing RTJ mapping, unknown grades/constructions and inconsistent source rows stay Review. F15M still has no gasket specification and A4F remains source-flagged. Physical dimensions and material/service suitability require engineering approval. Factor-only multiplication may not capture small-order machining/setup costs; calibrate provisional factors and allowances against actual purchases before budget reliance.

Report/CSV source notes retain the full build. Excel adds AUTO/MANUAL, policy version, all assumptions and published geometry source; AUTO rows say Budget estimate. Snapshot fields remain original app data after commercial Excel edits. Rebuild in the app after changing geometry/weights/rates/yield. Yellow Base/Factor/Qty/P90 remain editable as before.

Verification: `node tests/gasket-automatic-budget.cjs --excel`. The declared routine-size grid across 67 classes includes 837 scenarios with a gasket source row: 724 auto-priced (86.5%), 113 Review. This is software scenario coverage, not actual-project BOM coverage, price accuracy or source engineering approval. It excludes sizes with no gasket row (including F15M), so it is not 86.5% of every conceivable gasket. Class source flags are retained in the denominator. Validate actual-project coverage by uploading the BOM; report notes show AUTO count / total gasket rows. Next reliability improvement: replace provisional policy inputs with documented actual weights and matched commercial calibration, without adding fields for routine users.

| Bolting grade(s) | Commercial input-stock basis | Provisional Rs/kg | Supplier source |
|---|---|---:|---|
| A193 B7 / B7M stud stock | AISI 4140 black round bar | 90 | [Bhagwati Enterprise](https://www.bhagwatienterprise.co.in/alloy-steel-bars.html) |
| A194 2H / 2HM nut stock | C45 bright round bar | 70 | [K.R. Steel Udyog](https://www.krsteeludyog.in/carbon-steel.html) |
| A193 B16 stud stock | Advertised B16 black round bar | 80 | [C P Steel Suppliers](https://www.cpsteelsuppliers.in/astm-a193-gr-b16-black-steel-round-bar.htm) |
| A194 Grade 4 nut stock | SAE 4042 black round bar | 65 | [TK Steel](https://www.tksteels.in/round-steel-bar.html) |
| A307 A / B bolt stock | SAE 1020 carbon round bar allowance | 65 | [Parag Steel & Alloys](https://www.paragsteelroundbar.com/carbon-steel-round-bar-sae-1020-7047305.html) |

Grade/base-stock references are recorded separately: [LSFH](https://lsfh.com/materials-and-stock/) identifies 4140 for B7/B7M and C45 for 2H/2HM; [Delta Fastener](https://www.deltafastener.com/nuts-heavy-hex.php) identifies 4042 for Grade 4. A307's 1020 allowance is commercial only, not automatic grade compliance; see [Portland Bolt's qualification warning](https://www.portlandbolt.com/technical/faqs/grade-8-and-astm-a325-bolts-compared/). B16 uses the upper endpoint of the supplier's advertised Rs 75-80/kg range. Its Size/Dia fields are inconsistent and are retained as a procurement warning, not a geometry lookup. Other B16 listings with contradictory D3, EN8D, stainless or nickel-alloy identities were rejected. These are single advertisements with stock-size/MOQ limitations, not market averages or binding quotations; tax/freight and effective quotation dates are unconfirmed.

Defaults are not backfilled into 2021-2025. For another year, an unknown grade or an ambiguous mapping, enter a confirmed raw override or leave the item Review. No internet request is made during each calculation: the app reads saved observations. This is not a live steel-price feed.

**Offline price-loading correction:** the app first requests the master JSON without using a stale browser cache. If that request fails, it uses `bolting-stock-prices.bundle.js`, a generated copy of the same saved references loaded before the calculator. This resolves the missing bolt prices when the JSON cannot load, including the direct-file launch scenario. Audit notes identify the bundled source. A successfully loaded JSON always takes priority; its disabled or missing defaults are not silently replaced by the offline copy. Keep the bundle beside `index.html` when copying or publishing the app.

There is still only one editable price list: `raw_material_price_library.json`. After a maintainer edits it, regenerate the deployment copy with `node scripts/build-bolting-stock-bundle.cjs`, then verify with `node scripts/build-bolting-stock-bundle.cjs --check`. These maintenance commands require Node.js, with no extra packages. App users need neither Node.js nor a server for this fallback. Deploy the JSON and regenerated bundle together; an old bundle would otherwise retain old observations when JSON loading fails.

Screenshot regression example: Year 2026, `M24 x 145`, `ASTM A193 B7 / ASTM A194 2H`, one set and blank overrides gives stud Rs 90/kg, nut Rs 70/kg, factor 2.50 and **Rs 165.64/set**. The failed-request path, actual Quick Estimate renderer and exported Excel values are automated tests. Direct `file://` browser visual testing was unavailable in this environment; native desktop Excel recalculation is also not certified.

Test: Year 2026; Bolt > Stud with Nuts; size `M20 x 110`; material `A193 B7 / A194 2H`; Qty 10; raw/factor overrides blank. Stud Rs 90/kg and nut Rs 70/kg give raw cost Rs 36.515671/unit, effective raw Rs 80.039678/kg and provisional finished Rs **91.29/set**, total **Rs 912.89**. A common raw override of Rs 90/kg instead gives Rs **102.65/set**, preserving the earlier override example.

### Step 5: component recognition and calculated-only workflow

Mitres, crosses, stub ends, unsupported nut constructions, spacer/blind sets, left-hand couplings and specialist needle/angle/diaphragm/three-way valves are recognised but remain Review required where a dedicated calculation is missing. Existing S.W./S.O./W.N. flange, swage and coupling aliases route to the existing supported methods. Unrecognised names are not automatically priced with a broad generic factor. A generic `Fitting` row requires its actual supported type.

In **Component Quick Estimate**, the two finished-unit quotation fields have been removed. Use the remaining item, size, rating, material, quantity and optional raw Rs/kg input. Supported items calculate as before. Raw Steel Rs/kg and Factor remain visible for audit in the component review, full report and editable Excel group sheets.

The template download now serves the original example workbook without adding finished-price columns or a quotation guide. BOMs containing old finished-unit pricing/reference columns remain readable, but those inputs are ignored. A visible upload warning and per-item audit note identify populated retired inputs; their amounts and references are not retained in the new reports. Supported pipe rows are calculated normally and included in the pipe summary even if an old finished-price column is populated. Raw steel/factor overrides and source-review flags retain their existing behaviour. Regenerate older downloads to obtain the new report basis; previously saved files are not changed.

Material and service costs remain separate. No service-rate amounts or approved CS/SS/AS applicability rules were changed. A raw-stock allowance is a recorded commercial input, not automatic approval of the original PMS data or engineering specification.

### Step 6: source verification and safe hand-off

The source audit checks all 67 JSON class files for structural problems and compares suspicious entries with the supplied original PMS pages. Three material transcription errors were corrected: B21N `190` to `A182 GR.F347`, B23A `163` to `A105` with its printed trim description, and B26A `160` to `A105` with its printed trim description. B22A `000` was an adjacent code, not a material; its source material cell is blank and the row remains Review required. The original PDF is unchanged.

There are 59 explicitly flagged source-review rows, including provisional A4F rows borrowed from A1F, B1F rows from another class's page, ambiguous printed materials and size-range problems. Details and source pages are recorded in `source-verification-log.md`; the offline class registry is synchronized with the JSON files. This is a targeted source audit, **not full engineering certification of all 1,698 rows**.

The PMS BOM builder adds **Source Verification Status** and **Source Verification Note** to its preview and Excel export. The estimator retains these columns through import, background repricing, report notes and downloadable Excel. An explicit `Review required` / `needs_review` flag prevents both material and direct-service pricing, even if a raw/factor override is entered. Confirm and correct the controlled specification first, then re-export it with its review status resolved by the responsible engineer. `Not checked` means no row-level verification is recorded; it does not mean approved. Legacy BOMs without these columns remain compatible, so old exports must be regenerated to carry new flags.

### Step 7: complete workflow checks

The verification covers BOM import and repeat uploads, material/factor overrides, ignored legacy finished-price inputs, year changes, background flange/tee/library loading, report generation and Excel serialization/reopening. Background refreshes retain item-level overrides and migration audit notes; the initial quick estimate refreshes after its libraries finish loading. HTML-XLS and CSV imports retain literal sizes rather than guessing inch descriptions as dates. No engineering weight formulas or raw/service rate amounts were changed. The historical Step 7 log describes the earlier quotation-enabled version; current tests verify the calculated-only behaviour.

Browser checks include the default WCB gate valve, a quoted gasket, the existing example BOM upload, an actual PMS `.xls` export/import with source-review exclusion, and a downloaded `.xlsx` report reopened to check formulas and audit fields. These do not certify desktop Excel recalculation, every screen size or every possible input combination. See `regression-verification-log.md` for automated scope and limits.

### Verification

From this project folder, run:

```powershell
node --check app.js
node tests/material-matching.cjs
node tests/material-coverage.cjs
node tests/component-coverage.cjs
node tests/special-component-pricing.cjs
node tests/bolting-weight-pricing.cjs --excel
node tests/bolting-stock-defaults.cjs --excel
node scripts/build-bolting-stock-bundle.cjs --check
node tests/bolting-offline-loading.cjs --excel
node tests/pricing-integration.cjs --excel
node tests/pms-source-verification.cjs
node tests/full-workflow-verification.cjs --excel
```

The integration/full-workflow `--excel` commands retrieve the same Excel library already used by the app and check calculated/review cells, raw/factor overrides, legacy-input warnings, totals, native XLSX serialization/reopening and the unchanged original template. They do not overwrite the original template. The tests also exercise all 1,698 class rows and the 147 bolting/gasket specification rows. These checks do not replace a source-PMS engineering verification.

### Compact Component Quick Estimate output — 21 October 2026

The successful estimate shows a derived unit price, for example **Rs 165.64/set (provisional)**. For supported bolting, the stud/nut composition, estimated weights and full Unit Rs formula through the applied factor also remain visible, as requested. Select **Calculation details & sources** to expand/collapse the remaining weighted raw rate, supplier URLs, dates, geometry assumptions and limitations. It starts collapsed, supports keyboard access and keeps long URLs within the output panel. Raw prices, factors and totals remain visible in their existing cards. Review/error messages remain visible without requiring expansion. Calculations, complete saved audit notes, full reports and Excel exports are unchanged. The visible formula updates for stock defaults and user overrides; these are not fixed example figures.

To test, refresh with Ctrl+F5, repeat the M24 x 145 B7/2H example above, expand the details, then change the raw/factor overrides and check the price updates. Test an unsupported year to confirm its Review reason stays visible. No additional software or account is required. Automated checks: `node tests/bolting-offline-loading.cjs --excel` and `node tests/pricing-integration.cjs --excel`. Browser layout was not visually verified for this change.

## What The Tool Does

- Calculates actual pipe outside diameter from nominal pipe size.
- Converts pipe schedule values such as `STD`, `S-STD`, `HVY`, `Heavy`, `SCH 40`, `S-80`, and `5S` into wall thickness in mm.
- Calculates pipe kg per meter using the built-in pipe kg per meter calculator.
- Calculates total pipe weight from kg/m and pipe length.
- Estimates normal material cost and P90 budget estimate.
- Provides a suggested raw material price mapping dropdown by material group and pipe material standard.
- Supports coated and non-coated pipe estimates using the current factor-based method.
- Allows user override for raw steel Rs/kg.
- Allows user override for estimate factor.
- Supports multiple pipe sizes in one combined estimate.
- Imports one or more Excel BOM files in `.xlsx`, `.xls`, or `.csv` format.
- Budget-prices recognised BOM components as Pipe, Fitting, Flange, Valves, Bolt, Gasket, Trap/Strainer, or Other.
- Groups pipe rows by material category and shows category-wise estimate totals.
- Provides an on-screen report preview, printable / Save as PDF report, and editable Excel report workbook.
- Provides an Ask Estimator prompt for direct rate questions, multi-item checks, BOM upload, template download, and report access.

## Who Can Use It

This tool is useful for:

- Refinery piping cost estimation teams
- Oil and gas project cost engineers
- Piping material engineers
- Procurement and contracts teams
- Project planning and budgeting teams
- Users doing procurement rate validation for piping material rates
- Students and engineers learning transparent pipe cost estimation

## Problem It Solves

Piping material and direct-service rates are often difficult to compare because quotations may be given by length, weight, coating condition, schedule, material grade, pressure rating, component type, work package, or commercial basis. This tool gives a transparent calculation trail so users can compare material and supported direct-service estimates using one consistent method.

The business benefit is simple: it helps users quickly check whether pipe and component material rates look reasonable before going deeper into vendor quotation, negotiation, or budget approval.

## Key Use Cases

- Prepare preliminary Part A material estimates for pipes and piping components.
- Compare coated and non-coated pipe estimate cases.
- Check vendor rates against raw steel basis and conversion factor.
- Build a multi-size pipe estimate from manual entries.
- Upload a piping BOM and create a group-wise component material estimate.
- Create a P90 budget estimate for approval or contingency discussion.
- Export an audit report for internal review.
- Use material category review to identify CS, AS, SS, and unclassified pipe items in the BOM.
- Use Piping Component Cost Review to inspect priced pipes, fittings, flanges, valves, bolts, gaskets, traps/strainers, and other items.
- Use Piping Service Cost Estimate to prepare a separate preliminary Part B direct-service estimate for pipe erection, fitting/flange welding, valve weight-based service, pipe supports, painting, insulation, and PWHT where the approved basis supports it.
- Select a suggested raw material rate by Basic Mat. Of Const. and pipe material standard.

## Ask Estimator

The **Ask Estimator** bar at the top of the page provides a quick, browser-local way to query the same calculation basis without navigating through every panel.

- Ask one or more questions, for example `6 IN STD pipe price, 10 IN 90 degree elbow price`.
- Ask for supported rate information such as raw material prices, erection, welding, supports, painting, insulation, PWHT, fittings, flanges, valves, bolts, gaskets, and strainers.
- Upload a recognised BOM from the prompt bar and open the same PDF or Excel report used by the component review.
- Type `Give me Excel BOM template file` to download the recognised BOM template.
- The public tool reports only in INR. Requests for USD, Yen, or another currency receive a clear alert because no exchange-rate conversion basis is included.

The prompt bar is a guided calculator, not an external AI service. It uses only the rate libraries and formulas included in this static GitHub Pages project.

## Excel BOM Upload

Users can click or drag-and-drop one or more piping BOM files directly in the browser. The tool reads the first sheet of each file and imports valid pipe rows into the multi-size estimate table.

Each BOM file is treated as its own batch. Uploading the same file again refreshes that file's previous rows, while other BOM files and manually added rows are preserved.

The public page includes a **Download Example BOM Template** button linked to `Piping BOM Example Template.xlsx`, so users can start from a recognised multi-component BOM format.

### Required BOM Columns

| Required input | Accepted column examples |
|---|---|
| Pipe size | `Size`, `NPS`, `DN`, `Pipe Size`, `Nominal Size` |
| Thickness | `Thickness`, `THK`, `Sch/Thck/Rating`, `Wall Thickness`, `THK mm` |
| Length | `Length`, `Qty`, `Quantity`, `Length m`, `Total m` |

### Optional BOM Columns

| Optional input | Accepted column examples |
|---|---|
| Unit of measure | `UoM`, `Unit`, `Unit (M/NOS)` |
| Coating | `Coating`, `Coated`, `Coating Scope`, `Lining` |
| Material spec | `Material`, `Material Spec`, `Spec`, `Material Description` |
| Raw steel override | `Raw Steel Rs/kg`, `Raw Steel Rate`, `Raw Steel Price` |
| Estimate factor override | `Estimate Factor Override`, `Factor Override`, `Factor` |

### BOM Parsing Notes

- The BOM file is parsed in the user's browser.
- No server upload or database is used.
- This keeps the GitHub Pages version simple, static, and privacy-friendly.
- The importer scans the sheet to find the actual table header, so title rows above the BOM table are allowed.
- If a unit column is available, rows with unit `M`, `Meter`, or `Metre` are treated as pipe length rows.
- Pipe-length rows are added to Pipe Material Estimate Summary. Recognised fittings, flanges, valves, bolts, gaskets, traps/strainers, and other BOM items are retained and budget-priced in Piping Component Cost Review.
- Schedule text is converted to mm using the built-in pipe schedule lookup table before weight and price are calculated.
- A valid row-level `Raw Steel Rs/kg Override` and/or `Estimate Factor Override` applies to both the Pipe Material Estimate Summary and Piping Component Cost Review for that BOM row. When either field is blank or invalid, the app keeps its normal material-library/default rate and component-method factor.

## Pipe Material Category Review

The app includes a collapsed **Pipe Material Category Review** section. It helps users see how uploaded pipe rows are grouped for review and shows a **Pipe Material Category Estimate Summary**.

Examples:

| BOM material text | Review category |
|---|---|
| `ASTM A106 GR.B` | Carbon Steel Pipe |
| `API 5L GR.B` | Carbon Steel Pipe |
| `IS-1239 BLACK` | Carbon Steel Pipe |
| `IS-3589 GR.330` | Carbon Steel Pipe |
| `ASTM A335 GR P5` | Alloy Steel Pipe |
| `ASTM A312 TP 316L` | Stainless Steel Pipe |
| Unknown material | Unclassified Pipe |

This section is for review and audit support. It does not stop valid pipe rows from being estimated.

The category summary includes line count, total kg, normal total, P90 total, raw Rs/kg, and average finished Rs/kg for each detected material category. Non-CS material estimates use the same factor-based method and are indicative only. Validate SS, alloy, duplex, and non-ferrous rates with supplier quotations.

## Suggested Raw Material Rate Library

The input panel includes a **Suggested Raw Material Rate** selector.

Users select:

1. `Basic Mat. Of Const.`
2. `Pipe Material Standard`

The app then shows:

- Ch.Comp / Grade Family
- Indicative Raw Material
- Raw material price range
- Recommended Rs/kg
- Factor w.r.t. CS for the selected year

After the user selects a pipe material standard, the related Ch.Comp / Grade Family and recommended Rs/kg for the selected **Year** are filled automatically. This makes the estimate easier for non-specialist users because they can choose familiar pipe standards instead of metallurgy shorthand.

The reference data is stored in `raw_material_price_library.json` and includes year-wise rates from 2021 to 2026. **Factor w.r.t. CS** compares that material's raw Rs/kg with Carbon Steel raw Rs/kg for the same year. It is a comparison indicator only; it does not replace the Median factor or P90 factor used for finished pipe estimate.

## Piping Component Cost Review

The app includes a collapsed **Piping Component Cost Review** section before Scenario Playground (What-if Analysis). It groups and budget-prices uploaded BOM rows based on the item description using the group list from `Group.docx`.

Supported groups:

| Group | Example item names |
|---|---|
| Pipe Group | `Pipe`, `Nipple` |
| Fitting Group | `Elbow 90 Deg`, `Elbow 45 Deg`, `Tee`, `Reducer`, `Cap`, `Coupling` |
| Flange Group | `S.W. Flange`, `W.N. Flange`, `Blind Flange`, `Spcr & Bln` |
| Valves Group | `Gate Valve`, `Globe Valve`, `Check Valve`, `Ball Valve`, `Plug Valve`, `Butterfly Valve` |
| Bolt Group | `Stud with Nuts`, `Bolt` |
| Gasket Group | `Gasket` |
| Trap/Strainer Group | `Trap Steam`, `Strainer Temp`, `Strainer Perm` |
| Other Group | Any uploaded item that does not match the above groups |

Size-only, rating-only, bolt-size-only, and note-style item text such as `AS PER DATASHEET`, `provided by`, `procure with`, or `note` is grouped under **Other Group**.

Alias handling is also included for common BOM variations:

| Alias examples | Standard component | Group |
|---|---|---|
| `FIGURE-8`, `FIG.8 FL` | Figure 8 Flange | Flange Group |
| `T.Equal`, `Equal. T`, `EQ Tee` | Equal Tee | Fitting Group |
| `T.RED`, `RED.T`, `Reducing Tee`, `Reduc. T.` | Reducing Tee | Fitting Group |
| `FLANG WN`, `WN Flange`, `Well neck flange`, `WN Flng` | Weld Neck Flange | Flange Group |
| `CON.RED`, `CONC.RED`, `CON REDU.`, `REDUCER CONC`, `Reduce (Conc.)`, `RED. CONC` | Concentric Reducer | Fitting Group |
| `WELDOLET`, `WELD OLET`, `WELD-O-LET` | Weldolet | Fitting Group |

Compact elbow text such as `ELBOW 45D`, `ELBOW 45 DEG`, `ELBOW 90D`, and `ELBOW 90 DEG` is explicitly matched before the generic elbow factor. This keeps 45 degree elbows at factor `0.35` and 90 degree elbows at factor `0.55`.

This helps users audit a complete Part A material estimate, while Pipe Material Estimate Summary remains focused on pipe length rows.

## Piping Service Cost Estimate

The collapsed **Piping Service Cost Estimate** section appears below Piping Component Cost Review. It uses browser-local approved service-rate libraries to estimate preliminary pipe erection plus fitting and flange welding cost by detected material category, and a separate weight-based valve service estimate.

- Select one installation location and regulatory class for the uploaded BOM.
- Carbon Steel uses the CS rate library. Austenitic Stainless Steel uses the SS rate library. Alloy Steel uses the AS rate library.
- Unclassified pipe, fitting, and flange rows use the Carbon Steel rate as a visible fallback. Unsupported categories, including duplex and non-ferrous materials where no matching approved library exists, are marked Review and excluded.
- Every eligible pipe BOM row measured in metres is treated as one pipe run.
- Pipe base straight joints use a transparent 6 m stock-length planning proxy: `ceiling(length / 6)`. The result is multiplied by `1.60` for associated piping/components and always rounded upward. Fittings use a connection-end proxy: Tee = 3, Cap/Weldolet = 1, and other fittings = 2 per No. Each flange No. equals one estimated joint.
- Erection quantity is `NPS x length in metres` in inch-metre (IM); welding quantity is estimated joints x NPS in inch-diameter (ID).
- Valve service cost uses the valve weight already calculated for material cost x BOM quantity x IOCL-ME-SOR rate: `Rs 30.53/kg` for valves other than RTJ and `Rs 36.64/kg` for RTJ valves.
- Rework/modification allowance uses `15% x total eligible project welding ID`; its cost is `15% x matched welding cost` so the original CS, SS, and alloy welding-rate mix is retained.
- Pipe support structural cost uses `pipe_support_calculator_MT.js`. Each support uses 500 mm of matching pipe-weight basis, with the support count derived from the configured pipe-span table. The calculated structural quantity is reported in MT and priced at `Rs 1,50,000/MT` based on NRL LPP/WO references 4300080842, 4300083138, 4300083970 and 4300088266. The adopted rate includes contractor-supplied structural steel, fabrication, welding, surface preparation, primer/painting, transportation, erection, bolting and alignment, measured on net fabricated weight.
- Civil cost for each 300 mm above-ground pipe support uses the calculated number of individual supports multiplied by a size-based civil cost per support: 3 IN = Rs 6,000, 20 IN = Rs 17,000 and 48 IN = Rs 26,000. Intermediate sizes are linearly interpolated and rounded upward to the next Rs 500. Inside Unit Battery Limit is the default and applies 30% of this cost; Outside Unit Battery Limit applies 100%.
- Pipe insulation cost is calculated only for valid pipe rows as `pi x OD (m) x length (m) x provisional P50 Rs/m2`. The P50 insulation-rate table is `100C = Rs 4,578/m2`, `200C = Rs 4,881/m2`, `300C = Rs 5,082/m2`, `400C = Rs 5,587/m2`, and `500C = Rs 6,118/m2`. A temperature between listed points uses straight-line interpolation; a blank temperature or one outside `100C to 500C` is shown as Review and excluded from the insulation total.
- Pipe painting cost uses the same outside surface area for CS, LTCS, and alloy-steel pipes. A blank Design Temperature uses **Uninsulated CS/LTCS/AS piping** at the 65C default P50 rate of `Rs 1,010/m2`; an entered temperature automatically uses **Painting under insulation (CUI)**. The CUI P50 rate is `Rs 885/m2` for `65C to 200C` using epoxy phenolic, two coats, and `Rs 2,220/m2` for `300C to 500C` using the high-temperature CUI system. Temperatures from `above 200C to below 300C` use linear interpolation between these two P50 rates. SS, duplex, non-ferrous, and unclassified materials are visibly excluded until their approved painting system is supplied.
- PWHT is calculated only for Pipe Group rows where the BOM includes a `Pipe Class`, `Piping Class`, `PMS Class`, `Line Class`, `Material Class`, or `Class` column that matches `nrl_pwht_rules`, together with the required material and wall-thickness condition. PWHT uses the existing eligible welding inch-diameter quantity. Rates are `Rs 408/ID` for CS/LTCS, `Rs 559/ID` for P11/P12/P22 and Austenitic Stainless Steel, `Rs 613/ID` for P5/P9, and `Rs 715/ID` for P91/P92. Missing class information stays visibly marked Review.
- Rates first match location, IBR status, pipe size and wall thickness exactly. Under the owner-authorised budget policy, a size-only gap may use the nearest higher documented NPS rate in the same material library, thickness band, activity, weld type, location, regulatory class and unit. Only the unit rate changes: quantities, joints, weight and surface area retain the actual dimensions. No lower-size, thinner-band or cross-material substitution is allowed.
- Such rows are included in budget totals as **Budget fallback - approval required**, not as an exact/approved rate. The original size, selected rate-basis size, thickness band, rate and source are retained on screen, in the printable report and Excel, including affected rework allowances. Larger-size rates are not guaranteed conservative. If no eligible higher rate exists, or a source specification requires review, the row remains **Review** and unpriced. Valve weight-based rates, support mass, area-based services and PWHT rules are unchanged. This is an explicit app-owner exception to the source libraries' no-extrapolation guidance; source tables have not been changed.
- No escalation, contingency, taxes, freight, commissioning, or commercial terms are included unless separately stated. PWHT is included only when the documented rule conditions are met.

The Part B direct-service total remains separate from the Part A material total to prevent an implied installed-project cost.

Service fallback regression: `node tests/service-size-fallback.cjs --excel` checks rate boundaries, condition guards, actual quantities, report labels and Excel serialization/reopening. For the G5M sample, 6 IN XXS SS (21.95 mm), 60 m uses the 8 IN >20 to 30 mm rates: Rs 490/IM and Rs 5,170/ID. Actual quantities remain 360 IM and 96 ID (16 joints), giving Rs 672,720 direct erection/welding cost before associated works. Exact 8 IN S160 pricing is unchanged.

## Calculation Basis

Pipe mass formula:

```text
W = 0.0246615 x (OD - t) x t
```

Where:

- `W` = pipe mass in kg/m
- `OD` = actual pipe outside diameter in mm
- `t` = wall thickness in mm

Important: the app uses actual outside diameter from the built-in OD table. It does not calculate weight by directly using nominal pipe size as diameter.

Pricing method:

```text
Total weight = W x length in meter
Finished Rs/kg = raw steel Rs/kg x estimate factor
Rs/m = finished Rs/kg x pipe kg/m
Total Rs = Rs/m x pipe length
```

WN, SO, and Blind flange pricing uses the `flange-weight-3-input-model-v2.json` weight model instead of the old matching-pipe approximation.

```text
Flange unit Rs = flange weight kg x raw material Rs/kg x P50 base multiplier
Normal total Rs = flange unit Rs x BOM quantity
P90 total Rs = normal total Rs x the current P90-to-normal factor ratio
```

The flange weight is selected by flange type, size and pressure rating. The P50 base multiplier depends on flange type and size band:

| Flange type | Size band | P50 base multiplier |
|---|---|---:|
| WN | Small <= 2 inch | 3.70 |
| WN | Medium > 2 to 8 inch | 3.70 |
| WN | Large > 8 inch | 3.70 |
| Blind | Small <= 2 inch | 2.90 |
| Blind | Medium > 2 to 8 inch | 2.90 |
| Blind | Large > 8 inch | 2.90 |
| SO | Small <= 2 inch | 2.71 |
| SO | Medium > 2 to 8 inch | 2.38 |
| SO | Large > 8 inch | 3.30 |

If a flange row is not clearly identified as WN, SO, or Blind, the app uses WN flange weight and WN factor as the fallback basis. Flange weight is always searched by flange type, rating, and size together. If the exact type/rating/size is not available, the app tries WN with the same rating and size, including same-rating interpolation when a curve exists. It no longer silently downgrades an unknown rating to 150#. Built-in 150# and 600# fallback weight tables for WN, SO, and Blind flanges up to 24 inch are included so common flange rows are not priced from equivalent-pipe rate if the external JSON file is slow or unavailable. Only as the last resort, equivalent-pipe fallback uses: equivalent pipe rate x WN flange factor x 0.40. The fallback reason is kept in the audit note.

Metric stud/nut pricing uses a separate included-piece weight basis. A set such as `M24x145` defaults to one fully threaded stud plus two heavy-hex nuts; an explicit nut count changes only the included nut weight. A single stud excludes nuts; a standalone heavy-hex nut (`M24`) excludes the stud.

```text
Effective diameter = nominal diameter - (0.649519 x standard coarse pitch)
Stud mass kg = (PI / 4) x effective diameter^2 x length mm x 7850 x 1E-9
One nut mass kg = [(SQRT(3) / 2 x across flats^2) - (PI / 4 x effective diameter^2)] x nut thickness x 0.95 x 7850 x 1E-9
Complete set mass kg = stud mass kg + (included nut count x one nut mass kg)
Raw cost Rs = stud mass kg x stud stock Rs/kg + included nut mass kg x nut stock Rs/kg
Normal unit Rs = raw cost Rs x item factor
Effective raw Rs/kg = raw cost Rs / included piece mass kg (weight-weighted)
Raw override, if entered = common stock rate for both stud and nuts
Item factor = positive item override, otherwise provisional 2.50 (not NRL calibrated)
P90 unit Rs = normal unit Rs x the established uncoated P90-to-normal ratio (1.50)
Total Rs = unit Rs x BOM quantity
```

The default commercial factor `2.50` remains a provisional assumption, not a purchase-derived factor. The nut lookup uses ASME B18.2.4.6M heavy-hex dimensions. Missing required dimensions remain **Review** unless supplied as confirmed mm inputs in Quick Estimate; the nearest-pipe fallback is never used. The first-stage supported grades are B7 studs and 2H heavy-hex nuts. Washers, coatings, chamfers, thread tolerances, packing and manufacturing variation are excluded from calculated mass. See Step 4 for raw-rate confirmation, override, report and unsupported-grade rules.

## Default Factor Logic

| Coating | Normal / Median factor | P90 factor |
|---|---:|---:|
| Yes | 2.30 | 3.80 |
| No | 1.80 | 2.70 |

Coating definition used in the app:

- Internal coating: epoxy lined
- External coating: PE coated, meaning polyethylene coated

If `Estimate Factor Override` is entered, it replaces the normal / median estimate factor. The P90 factor is recalculated using the default P90-to-median relationship so the conservative estimate moves consistently with the user's override.

## Scenario Playground (What-if Analysis)

The app includes a collapsed **Scenario Playground (What-if Analysis)** section. It helps users understand how the Part A material estimate and grouped component estimate change when:

- Raw steel rate changes by +/-10% and +/-20%
- Pipe factor changes by +/-10% and +/-20%
- Component factor changes by +/-10% and +/-20%
- Coating assumption changes between Yes and No
- Manual raw-material, pipe-factor, and component-factor sliders are moved

Direct service rates remain unchanged. This keeps the scenario result clear: it tests commercial material assumptions without implying that schedule-of-rates service costs have also changed.

## Reports And Audit Trail

The tool includes:

- On-screen report preview, printable report / Save as PDF
- Editable Excel report workbook with Executive Summary, Part A group sheets, Part B service-cost detail, and Method and Audit sheets. Each Part A group sheet shows the raw steel Rs/kg and factor used for every component row, including default and BOM-override values.
- Excel BOM import status
- Raw steel Rs/kg basis
- Factor basis
- Override review
- Pipe weight methodology
- Coating definition
- Material category review
- Piping component cost review
- Piping service-cost basis, quantities, rate sources, and review rows
- Calculation disclaimer

The report is intended to help users defend the calculation trail during internal review.

## Deployment

This project is a static GitHub Pages web app.

Files normally required for GitHub upload:

| File | Purpose |
|---|---|
| `index.html` | Main webpage structure and SEO tags |
| `style.css` | Visual design, mobile layout, print layout, light/dark mode |
| `app.js` | Calculator logic, BOM import, sorting, category review, report export |
| `Piping BOM Example Template.xlsx` | Downloadable example BOM template |
| `astm_piping_material_specification_webapp.json` | Material category reference data |
| `raw_material_price_library.json` | Suggested raw material price mapping for dropdown autofill |
| `bolting-stock-prices.bundle.js` | Generated offline component-stock observations; keep beside index.html and regenerate after master JSON edits |
| `flange-weight-3-input-model-v2.json` | Flange type, size, rating, and weight reference data |
| `Piping Service Cost for Web App/` | CS, SS, and AS service libraries, PWHT rules, support logic, and fitting-dimension references |
| `assets/` | Icons and local visual assets used by the static page |
| `README.md` | GitHub project explanation |
| `sitemap.xml` | Search indexing support |
| `AGENTS.md` | Future Codex project instructions |
| `DESIGN_SYSTEM.md` | Reusable style guidance |

No backend server is required for normal use.

## What's Next

> **Vision:** evolve Piping Material & Service Cost Estimator from a piping calculator into an AI-enabled project cost-estimation and knowledge-management platform.

### 1. Support All AACE Estimate Classes

Extend from **Class 5 conceptual estimates** to **Class 1 definitive estimates**, with suitable scope definition, accuracy range, contingency, documentation, and approval review.

### 2. Introduce Natural-Language Estimating

Let users create, change, and query estimate items in plain language, for example: `Add 15 m2 of insulation to Section B` or `Show the impact of a 10% stainless-steel increase`.

### 3. Extract Quantities From Documents

Read engineering drawings, PDFs, datasheets, and scanned documents using OCR and structured parsing. Users will still review, correct, and approve extracted quantities before they affect an estimate.

### 4. Reduce Estimation Cycle Time by 50%

Target at least a **50% reduction** in median time from initial draft to final review through reusable libraries, standard workflows, automation, and faster revisions.

### 5. Expand to Full Project Disciplines

Extend beyond piping to civil and structural, mechanical, electrical, instrumentation and control, process and utilities, safety and firefighting, and project-management indirect costs.

### 6. Strengthen In-House Capability

Convert internal engineering knowledge, historical cost data, and calculation methods into maintainable in-house software, reducing dependence on external consultants.

### 7. Accelerate Learning for New Joiners

Use the platform to explain formulas, assumptions, cost drivers, exclusions, and review requirements so new engineers and estimators become productive faster.

### 8. Preserve Domain Expertise

Capture the working knowledge of engineers, estimators, procurement professionals, and project managers as reusable rules, validated libraries, and decision logic that remains available when people change roles or retire.

> **Roadmap principle:** these are future goals, not current functions. Each future module will retain transparent calculations, visible assumptions, review-required handling for incomplete data, and an auditable report trail.

## Limitations

- Part A material and Part B direct-service estimates are indicative. The service panel covers only activities supported by the displayed rate and rule basis.
- It is not a vendor quotation.
- It is not a purchase recommendation.
- It does not calculate a complete installed piping cost.
- It does not include activities not explicitly shown in Part B, taxes, GST, freight, unloading, wastage, hydrotest, NDT, commissioning, contractor margin, commercial escalation, or delivery terms unless users separately include those in their own assumptions.
- Final pricing must be validated with supplier quotation and project-specific commercial terms.

## Disclaimer

Specific input alias (2026-10-22): recognise `ASTM 105` as `ASTM A105` for
material classification and existing raw-price lookup. Original entered/BOM
wording remains untouched in the app and reports. This is only the explicitly
approved 105 alias, not a rule to add A to any ASTM number. No weight formula,
conversion factor, pressure multiplier or pricing table changes. Test:
`node tests/astm105-alias.cjs --excel`.

Valve construction-prefix parsing (2026-10-22): remove only the recognised
leading `BB, OS&Y,` construction prefix when identifying the pressure-body
material. `BB, OS& Y, A105/HF` and `BB, OS& Y, A105/13CR` therefore use the same
existing A105 body pricing as bare A105. Full original descriptions and trim
remain in reports/Excel. No formula, manufacturing factor, size band, pressure
multiplier, raw-price table or trim premium was added/changed. In particular,
800# retains its prior multiplier behaviour; no 900# substitution is introduced.
Unknown bodies and unsupported lined construction remain Review. Test actual
supplied files and Excel: `node tests/valve-body-prefix.cjs --folder --excel`.

Document-header gasket class correction (2026-10-22): the supplied
Testing_CS pipe predictor folder contains 60 gasket rows. The real uploader
extracts a default PMS class from document headers; earlier isolated tests did
not reproduce that step. This caused otherwise priceable rows to be rejected
for missing A33A/A31F/A68A catalog entries or material-description mismatches.
Track class provenance as row/document. A document-derived class with no unique
compatible gasket match is advisory: cost from the BOM description and retain
the full class discrepancy in calculation/report/Excel audit notes. This does
not certify the row to that class. Explicit row classes, manual class selections,
source-review flags and existing matched-class safeguards stay enforced.
Preserve provenance when repricing. Also recognise 5MM THK as 5 mm so the
owner's missing-rating 300# rule applies. No material rates or factors change.
Read-only source-workbook regression and in-memory Excel round-trip:
`node tests/gasket-upload-regression.cjs "Testing_CS pipe predictor" --excel`.
The original workbooks are never edited by this test.

5 mm gasket pressure default (2026-10-22, budget-v9): when no explicit pressure
rating or controlling PMS rating is available, use 300# for a described/entered
5 mm gasket. Recognise 5MM, 5 MM, 05MM, 5.0 mm and description thickness. Store
this rule in gasket-budget-policy.json, not in the dimension table. Explicit
ratings and controlling pipe classes retain priority; other missing ratings keep
their existing 150# budget default. Retain actual 5 mm thickness and factor 1.8
for spiral-wound gaskets. Record the owner-rule assumption in app/report/Excel
notes. This is a cost-estimating convention, not a physical thickness/rating
equivalence or approval for installation.

Gasket inch-notation import correction (2026-10-22): actual local workbooks use
two apostrophes for inches (2'', 6'', 8'', 1.1/2''). These visually resemble a
double quote in reports but were rejected by the strict gasket size parser.
Normalise paired straight/curly apostrophes and prime marks before parsing.
Original BOM text stays unchanged. No price, factor, geometry or source-review
policy changes. Regression includes actual workbook reads with
`node tests/gasket-upload-regression.cjs` and paired-quote fixture/Excel tests
with `node tests/gasket-bom-text.cjs --excel`.

A307 / L7 budget extension (2026-10-22): explicit A307 B/A307 B stud-and-nut
pairs use the existing SAE1020 carbon-stock allowance for both constituents
(currently 65/65 Rs/kg for 2026). The nut standard as entered is not certified;
actual nut specification and heavy-hex dimensions need procurement confirmation.
Only the exact explicit pair enables this allowance; no nut grade is inferred
from a lone A307 stud designation. A320 L7/A194 Grade 4 uses the existing 4140
stock observation and Grade 4 nut observation (currently 90/65 Rs/kg).
L7 material-family reference: https://www.a320bolts.com/grades/ (reviewed
2026-10-22); no new market price was collected. Low-temperature impact tests,
heat treatment and certificates are not validated by a raw-stock reference.
Both routes use existing metric mass equations and generic default factor 2.50,
not new grade-specific purchase calibration. Raw/factor overrides retain priority.
Original descriptions, rate sources and warnings remain in reports/Excel.
Different/mixed pairs, L7M/L7X, coatings and source-review flags remain blocked.
No pipe/service rates or gasket defaults change. Reprocess after refresh.

Gasket BOM text correction (2026-10-22, budget-v8): normalise fractional inch
notation including 1.1/2 inches, recognise SP.WND/SPR.WND and CA FIL, and read
thickness from the rating/thickness column or description (e.g. 05MM, THK.2MM,
2MM THK, 4.5 T). Advanced thickness has priority. Pressure class still comes
from an explicit supported rating or a unique controlling PMS flange class.
For rows without a controlling class and with a blank/dash or thickness-only
rating, assume 150# for budget costing and record that assumption in app/report/
Excel notes. Explicit invalid ratings, unknown SS grades, manual-mode requirements,
source flags and class conflicts still block. SS316L and spiral factor 1.8 remain.
Nonasbestos/BS7531 sheet uses a distinct NON_ASBESTOS budget key with 1800 kg/m3
and Rs 250/kg, copied from the existing commercial sheet allowance, not an
asbestos composition/substitution or independently verified BS7531 price. The
ungraded trade description SPIRAL WOUND (32TB) uses an explicitly assumed
SS316L/graphite costing basis only; it does not identify/approve that trade grade.
Other explicitly stated unknown alloys cannot use that fallback. These assumptions
require confirmation before procurement. Original descriptions remain untouched.
Reproduce screenshot-format regression: `node tests/gasket-bom-text.cjs --excel`.

Bolt BOM formats and grade-pair budgets (2026-10-22): recognise constituent
labels such as "Bolt A193 Gr B7, Nut A194 Gr 2H" and the explicit A194
"GRE. 2H"/"GRE. 2HM" typing variants. Keep original BOM text. Metric sizes
accept leading comma, whitespace and length suffix L (e.g. M 14 x 70L).
If Size has no metric designation, an explicit metric designation in Rating/Thk
can supply geometry; the source fields and resolution are retained in the note.
An invalid Size beginning M is not silently replaced. No diameter is inferred
from flange NPS. Actual metric dimensions still require lookup/confirmed inputs.

B7M/2HM and B16/Grade 4 pairs now use the existing metric mass equations with
their exact separate saved stock inputs (currently 90/70 and 80/65 Rs/kg for
2026) and the existing 2.50 default budget factor. The factor is a generic
estimating assumption, not grade-specific purchase calibration or certification.
Positive item overrides remain authoritative; original B7/2H prices are unchanged.
No new stock price is invented. A307 pairs lack a supported nut-stock basis;
A320 L7 lacks a complete mapped pricing basis and remains Review. Mixed grades,
unknown suffixes, washers, source-review flags and unsupported geometry remain
blocked. App and Excel notes retain the rates, assumptions and any size-field
resolution. Reprocess BOMs after refreshing. Tests:
`node tests/bolt-bom-formats.cjs --excel` and the existing bolting suites.

A217 WC6 spacing correction (2026-10-22): recognise WC 6, including NBSP and
line-break spacing, as WC6 within A217 specifications. This activates the existing
P11 alloy-steel budget raw-price mapping; no raw prices or valve formulas change.
Original body/trim descriptions remain unchanged in reports and Excel. WC60,
WC6X and other unknown grades are not shortened to WC6. Reprocess the BOM after
refreshing. Regression command: `node tests/material-matching.cjs`.

Flange aliases (2026-10-22): FLANGE,SW / FLANGE,SO / FLANGE,BLIND / FLANGE,WN
and corresponding spaced/dotted/FLG variants resolve to Socket Weld, Slip-On,
Blind and Weld Neck Flange. Both BOM import and direct component pricing use
the dedicated existing factor. Original descriptions remain in reports/Excel.
No raw rates, weights or pricing formulas are changed. Socket-weld entries
retain the existing disclosed WN weight fallback; alias recognition does not
establish an exact SW weight. Unsupported constructions/source reviews remain
blocked. Refresh/reprocess the BOM; test with
`node tests/flange-bom-aliases.cjs --excel`.

Rubber-lined flange extension (2026-10-22): A105 (RUB), (RUB LIN), (RUB LINED)
and (RUBBER LINED) use the CS raw-price basis for supported flange methods.
Retain flange JSON weight and manufacturing multiplier; apply the same existing
coating uplift as lined fittings: Normal x (2.30/1.80), P90 x (3.80/2.70), once.
The page coating selection cannot double-count it. The displayed effective
factor includes the uplift; positive raw/factor overrides retain priority.
Original material and allowance notes remain in reports and Excel. This is not
a separate rubber-lining quotation, lining weight or engineering approval.
Unknown grades, unsupported flange constructions and source-review flags remain
Review. Ordinary unlined flanges, service rates and gasket defaults are unchanged.

Rubber-lined fitting extension (2026-10-22): A234 WPB (RUB), (RUB LIN), and
(RUBBER LINED) use the CS raw-price basis for supported fitting calculations.
Fitting geometry and manufacturing factors remain intact. Apply the existing
CS coating uplift once: normal x (2.30/1.80), P90 x (3.80/2.70). The fitting's
pipe basis starts uncoated, so the page coating selector cannot double-count
this allowance. Displayed effective factor includes the normal uplift. A valid
factor override replaces this combined factor once; raw overrides retain priority.
This allowance is not a separately measured/quoted lining cost or lining weight.
Other grades, unknown constructions, source-review flags and unsupported fitting
geometry remain Review. Original material and allowance notes are retained in
reports and Excel. Services and ordinary unlined fittings are unchanged.

Owner-approved pipe budget mappings (2026-10-22): IS-1239 (with or without BLACK)
and IS-3589 Gr.330 use the existing A106 Gr.B carbon-steel raw-price basis, not
an engineering equivalence. NBSP and its common HTML encodings are accepted.
A106 Gr.B + (RUB LIN) uses CS raw prices and the existing coated-CS pipe allowance
(Normal 2.30 / P90 3.80), even when the page coating selector is No. Original
material descriptions remain in reports; positive raw/factor overrides retain
priority. This is an estimating allowance, not an independently measured or
quoted rubber lining price or added lining weight. No new lining market rate is
invented. Other lined/nonmetallic constructions remain Review. Gasket defaults,
service-rate rules and raw-price library values are unchanged. Reprocess rows
and regenerate reports after refresh. Test: `node tests/cs-pipe-budget-mappings.cjs --excel`.

Spiral-wound gasket default conversion factor is restored to 1.8 (2026-10-22,
budget-v7) by the owner's explicit budget-estimating choice. The historical PO
comparison does not determine the default.
Quick Estimate's starting gasket material remains SS316L; selected pipe classes
and entered/BOM materials are not replaced. Raw-rate libraries, geometry, yield
and the P90 ratio are unchanged. Positive user/BOM factor overrides still take priority;
sheet-ring, full-face and RTJ defaults remain unchanged. Regenerate reports after
refreshing/reprocessing estimates to apply the new default.

Benchmark: 34 SS316L/graphite B16.5 rows with standard table geometry, retaining
PO quantities, total Rs 1,595,129. Current raw/weight/yield model at factor 1.8
totals Rs 1,810,738.03; at 1.6 it totals Rs 1,609,544.92 (+0.90%). The aggregate
matching factor is 1.5856696, rounded to 1.6. This is not a least-squares fit or
proof of per-item accuracy: size-level differences remain. Seven large Series A
rows use estimated geometry and were excluded from fitting, as were nine SS321
rows and ten unsupported nickel-alloy rows. Neither SS321 nor other gasket
families/material grades are independently validated by this SS316L comparison.
The July 2025 PO includes packing/forwarding, inspection/testing and freight but
excludes GST; app raw observations are not verified PO-date prices and freight
is excluded by the app. No escalation or freight deduction was invented.
Consequently 1.6 remains a historical comparison only, not the active default,
an isolated manufacturing factor or today's supplier rate. The active default
is 1.8. The policy note travels into app
calculation details and Excel. Reproduce with `node tests/gasket-po-benchmark.cjs`;
the checked input rows and qualifications are retained in
`Validation/gasket-po4500030816-benchmark.json`. No service rates are changed.

### Gasket missing-size allowance (2026-10-22, budget-v2)

Automatic gasket costing now retains exact table geometry first. For a missing size,
it uses the nearest row of the same construction and pressure class as a cost-only
reference. Diameters shift by (requested NPS minus reference NPS) x 25.4 mm;
radial widths, thickness and winding fractions remain unchanged. Full-face hole
count/diameter retain the reference values. Missing RTJ sizes retain the reference
octagonal section and shift pitch diameter; no standard R-number is assigned.
The unchanged constituent weight/yield/rate/factor method calculates the price.
This is an estimating assumption, not a manufacturer table, validated flange fit,
Series A/B identification, or procurement/design approval. Reference size, pressure,
geometry and policy version are recorded in app calculation details and Excel.
Confirmed weights and user overrides remain authoritative. No pressure-class
substitution is made. Unsupported constructions/materials, source-review flags,
class conflicts and job-specific designs still require confirmed inputs. This
does not guarantee a verified automatic price for literally every custom gasket.

This tool provides indicative Part A material and Part B direct-service estimates. Total base project cost means material base plus supported direct service only; it is not a total installed project cost. Activities not explicitly included, testing, freight, taxes, packing, wastage, contractor margin, commercial terms, and all other services are excluded unless separately stated.
