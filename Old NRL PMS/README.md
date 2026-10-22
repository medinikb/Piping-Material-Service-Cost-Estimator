# Piping BOM-MTO Builder

Live tool: https://medinikb.github.io/Piping-BOM-MTO-Builder/

Static web app for preparing piping BOM/MTO rows from refinery piping material specification data.

The app helps engineers select a pipe class, item, size, and quantity, then automatically fills PMS-based material details for review and export.

## Problem It Solves

Refinery piping engineers and estimation teams often prepare BOM/MTO sheets manually from PMS PDFs. This creates common problems:

- Slow lookup of material, rating, schedule, end connection, and standard.
- Copy-paste errors between PMS PDF, Excel MTO, and estimate sheets.
- Wrong item-size selection for a pipe class.
- Repeated checking of the same PMS tables by different engineers.
- Difficulty reviewing whether a BOM row has a valid PMS match.
- Time loss during proposal, shutdown, revamp, and small-project estimation work.

This app reduces manual lookup time and gives engineers a faster first-pass BOM/MTO preparation workflow.

## Business Cases In Refinery Engineering

| Use Case | Business Value |
| --- | --- |
| Proposal estimation | Faster material take-off preparation for budgetary cost estimates. |
| Small modification jobs | Quick BOM generation for piping changes without rebuilding Excel templates each time. |
| Shutdown planning | Faster review of required pipe, fittings, flanges, valves, gaskets, and bolting items. |
| Cross-checking MTO sheets | Helps reviewers catch item-size combinations that do not match PMS data. |
| Standardization | Gives all engineers one common PMS lookup workflow instead of personal spreadsheets. |
| Error reduction | Reduces manual typing errors in material, schedule/rating, dimension standard, and end/facing fields. |
| Knowledge transfer | Helps junior engineers understand which PMS data applies to each pipe class and size. |
| Audit support | Keeps PMS source notes visible, including special warnings such as the A4F provisional source basis. |

## Current Scope

- Supports 67 pipe classes.
- Uses JSON files as the source data format.
- Provides PMS-driven size dropdowns for most standard items.
- Provides special engineering size lists for reducing tee, concentric reducer, eccentric reducer, concentric swage, and eccentric swage.
- Allows free-text size entry for `Other Group` and `Bolt Group`.
- Auto-generates `Stud with Nuts (Auto from Flange)` rows in BOM Preview from flange bolt data.
- Excludes unmatched rows from preview/export and warns the user.
- Generates an Excel-openable `.xls` file with dynamic file naming.
- Runs as a static website with no backend server.
- Can be hosted on GitHub Pages.

## Supported Pipe Classes

### A-Series

`A1A`, `A1F`, `A1K`, `A1N`, `A1Z`, `A2A`, `A3A`, `A3Y`, `A4F`, `A5A`, `A6N`, `A9A`, `A10A`, `A15A`, `A16A`, `A19A`, `A20A`, `A21A`, `A22A`, `A23A`

### B-Series

`B1A`, `B1F`, `B1K`, `B1N`, `B2A`, `B3A`, `B4D`, `B4D1`, `B4F`, `B4F1`, `B5A`, `B5D`, `B6N`, `B9A`, `B19A`, `B21N`, `B22A`, `B22M`, `B23A`, `B25A`, `B25K`, `B26A`

### D-Series

`D1A`, `D1K`, `D2A`, `D2D`, `D4F`, `D5A`, `D5D`, `D5E`, `D15K`, `D21A`, `D25A`, `D26A`

### E-Series

`E5E`, `E25A`, `E26A`

### F-Series

`F5A`, `F15M`, `F25A`, `F25D`, `F26D`, `F27A`

### G-Series

`G5M`, `G21A`, `G22A`, `G25N`

## Main Features

- Pipe class dropdown for all 67 PMS classes.
- Group-based item filter: pipe, fittings, flanges, valves, bolts, gaskets, strainers, and other items.
- PMS-based size dropdown for each item.
- Special size pair dropdowns for:
  - `Red. Tee`
  - `Con. Reducer`
  - `Ecc. Reducer`
  - `SWAGE.CONC`
  - `SWAGE.ECC`
- Free-text size entry for `Other Group` and `Bolt Group`.
- Free-text unit entry for `Other Group`.
- Quantity entry with numeric validation.
- BOM preview before export.
- Auto `Stud with Nuts (Auto from Flange)` calculation from WN, slip-on, and blind flange dimensional data.
- Dynamic export filename using pipe class and MOC/Job number, for example `A10A_Piping_BOM_MTO_NRMT-2016-00329`.
- Excel download for review or onward estimation work.
- Print / Save as PDF option.
- A4F source limitation warning shown on screen and in Excel export.
- Embedded fallback data for more reliable audit/demo use.

## Important A4F Note

For `A4F`, the app shows a source limitation warning:

`A4F sheet 2 of 3 and sheet 3 of 3 are not available in the supplied PMS file. For clarity, this A4F data uses A4F sheet 1 of 3 plus A1F sheet 2 of 3 and A1F sheet 3 of 3 as the nearest available material-table basis. Verify against the controlled A4F PMS before procurement or final issue.`

This warning is included both in the web preview and downloaded Excel file.

## Project Files

| File / Folder | Purpose |
| --- | --- |
| `index.html` | Main app page and screen layout. |
| `src/app.js` | App logic: pipe class loading, item-size matching, BOM preview, validation, and export. |
| `src/styles.css` | App styling and print layout. |
| `src/pipe-spec-data.js` | Embedded backup copy of all pipe spec JSON data. |
| `src/wn-flange-data.js` | Embedded backup copy of WN flange bolt/stud dimensional data. |
| `src/slip-on-blind-flange-data.js` | Embedded backup copy of slip-on and blind flange bolt/stud dimensional data. |
| `data/*.json` | Source pipe class data files. Each file follows `PIPECLASS.json`, for example `A10A.json`. |
| `Piping_Data/wn_flanges_data_0_5_to_48.json` | WN flange data used for auto stud/nut calculation. |
| `Piping_Data/slip_on_blind_flanges_data.json` | Slip-on and blind flange data used for auto stud/nut calculation. |
| `README.md` | Project explanation, usage, and deployment notes. |

## Recommended Public GitHub Structure

```text
PMS_webapp/
  index.html
  README.md
  src/
    app.js
    styles.css
    pipe-spec-data.js
    wn-flange-data.js
    slip-on-blind-flange-data.js
  data/
    A1A.json
    A2A.json
    ...
    G25N.json
  Piping_Data/
    wn_flanges_data_0_5_to_48.json
    slip_on_blind_flanges_data.json
```

Do not upload private PDFs, client documents, temporary screenshots, or confidential Excel files unless you have permission to publish them.

The original `.xlsx` source workbooks are not required for the public web app if the JSON and embedded JavaScript data files are included.

## How To Run Locally

Open the project folder in a terminal and run a simple local server.

Using Python:

```powershell
python -m http.server 8080 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:8080/
```

If Python is not available, the app can still be hosted directly on GitHub Pages.

## How To Use

1. Open the app.
2. Select the required pipe class.
3. Enter project details.
4. Select an item group.
5. Select item size from the PMS-driven dropdown, or type manually where free text is enabled.
6. Enter quantity.
7. Review the BOM Preview.
8. Check any auto-generated `Stud with Nuts (Auto from Flange)` rows for flange items.
9. Correct any row that has no PMS match.
10. Click `Download Excel File`.
11. Verify the exported BOM against the controlled PMS before final issue.

## Automatic Stud/Nut Calculation

When a valid flange row is entered, the app can automatically add `Stud with Nuts (Auto from Flange)` in the BOM Preview.

The calculation uses:

- Flange size.
- Flange rating.
- Flange standard.
- Number of bolts from flange dimensional data.
- Stud length and bolt thread from flange dimensional data.
- Flange quantity entered by the user.

Calculation:

```text
Stud/Nut Quantity = Flange Quantity x Number of Bolts per Flange
```

Example:

```text
Flange Quantity = 2
Number of Bolts = 4
Auto Stud/Nut Quantity = 8
```

The app uses:

- WN flange data for W.N. Flange.
- Slip-on flange data for slip-on/socket-weld style flange rows.
- Blind flange data for Blind Flange rows.

## Engineering Caution

This app supports faster BOM/MTO preparation, but it does not replace engineering judgment.

Before procurement, construction, or final estimate issue, verify against:

- Controlled PMS documents.
- Latest project specifications.
- P&ID and line list requirements.
- Approved valve, gasket, bolting, and fitting standards.
- Client or refinery-specific notes.
- Any project deviation or material substitution approval.

## GitHub Pages Deployment

1. Create a GitHub repository.
2. Upload `index.html`, `src/`, `data/`, and `README.md`.
3. Go to repository `Settings`.
4. Open `Pages`.
5. Select deployment from the main branch.
6. Save and open the GitHub Pages URL.

## Limitations

- Auto stud/nut calculation currently supports flange-based bolting only.
- The exported file is Excel-openable `.xls` generated from HTML, not a native `.xlsx` workbook.
- The app depends on the accuracy of the JSON PMS conversion.
- Some engineering choices, such as whether a bolting row should be manually adjusted for a specific job, still require user review.
- Public release should only include data that is approved for public sharing.

## Future Roadmap

- Native `.xlsx` export.
- More detailed bolt, nut, and washer logic for non-flange cases.
- Separate engineering audit report for auto-calculated bolting rows.
- Searchable PMS item library.
- Engineering review status for each pipe class.
- Version history for JSON data changes.
- User upload/import of project MTO rows.
- Better audit report showing source page and PMS note per exported row.
