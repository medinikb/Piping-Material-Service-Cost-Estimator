# Piping Material & Service Cost Estimator

Live tool: https://medinikb.github.io/Pipe-Price-Predictor/

Piping Material & Service Cost Estimator is a free public BOM-based tool for two separate budgetary views: **Part A - Piping Material Cost** and **Part B - Piping Service Cost**. It estimates pipes, fittings, flanges, valves, bolts, gaskets, and strainers from manual inputs or uploaded BOM files.

The tool is designed for refinery, oil and gas, piping, procurement, and project cost-estimation teams. **Pipe Price Predictor** remains a natural secondary term for existing users and search visibility.

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
- Rates match location, IBR status, pipe size and wall thickness. Unsupported combinations stay marked **Review** and are excluded from the service total.
- No escalation, contingency, taxes, freight, commissioning, or commercial terms are included unless separately stated. PWHT is included only when the documented rule conditions are met.

The Part B direct-service total remains separate from the Part A material total to prevent an implied installed-project cost.

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

Metric stud-set pricing for readable BOM sizes such as `M24x145` uses a separate complete-set weight basis: one fully threaded stud plus two heavy-hex nuts.

```text
Effective diameter = nominal diameter - (0.649519 x standard coarse pitch)
Stud mass kg = (PI / 4) x effective diameter^2 x length mm x 7850 x 1E-9
One nut mass kg = [(SQRT(3) / 2 x across flats^2) - (PI / 4 x effective diameter^2)] x nut thickness x 0.95 x 7850 x 1E-9
Complete set mass kg = stud mass kg + (2 x one nut mass kg)
Normal unit Rs = complete set mass kg x raw material Rs/kg x 2.50
P90 unit Rs = normal unit Rs x the current P90-to-normal factor ratio
Total Rs = unit Rs x BOM quantity
```

The commercial raw-to-finished factor is `2.50`. The nut lookup uses ASME B18.2.4.6M metric heavy-hex dimensions, including the appropriate geometry for A193 B7 / A194 2H-style sets. A readable metric designation with no approved heavy-hex nut dimension is sent to **Review** and is not priced using the old nearest-pipe fallback. Washers, coatings, chamfers, thread tolerances, packing and manufacturing variation are excluded from calculated mass and should be validated against supplier data.

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

This tool provides indicative Part A material and Part B direct-service estimates. Total base project cost means material base plus supported direct service only; it is not a total installed project cost. Activities not explicitly included, testing, freight, taxes, packing, wastage, contractor margin, commercial terms, and all other services are excluded unless separately stated.
