# Finished-unit quotation removal

Date: 21 October 2026. This change supersedes the quotation-entry portions of the earlier Steps 3–7 implementation and historical regression log.

## Product change

The owner asked to remove Confirmed Unit Rate Rs / UOM and Quotation Reference from both manual entry and the BOM/report workflow. Supported components now use calculated estimates only. Raw Steel Rs/kg Override and Estimate Factor Override remain available through their existing inputs; this change adds no new manufacturing factors, geometry models, raw prices or service rates.

## Changed files and responsibilities

- `index.html`: removes both manual inputs and obsolete BOM help. Its audit section explains calculated-only pricing and legacy-input handling. Script cache versions are refreshed.
- `app.js`: removes finished-price parsing/calculation, saved quotation values, associated event handlers, template expansion and quoted-output branches. The template link serves the original workbook. Old finished-price/reference inputs are ignored with a visible upload warning and per-item audit note. Supported pipes remain in the pipe summary; source-review flags still block material and direct-service pricing.
- `special-component-pricing.js`: unsupported items use the explicit review route, not a quotation-entry route. Existing B7/2H metric stud-and-two-nut calculations remain unchanged.
- Tests: recognition/policy assertions use review status. Integration and full-workflow tests verify retired inputs cannot override calculations or enable unsupported items. The CSV fixture contains fake legacy prices solely for migration testing.
- `README.md` and `component-coverage-notes.md`: current workflow documentation.

No original PMS PDF, source class JSON, raw-price library, service-rate library or original XLSX template was edited. Previously downloaded user workbooks are not modified. Re-export reports for the new basis.

## Verification

- Syntax checks: main app and component policy.
- Material matching: 114 cases, including parsing all 1,698 PMS rows.
- Material coverage: 74 checks, loaded and backup libraries.
- Component recognition: 43 cases.
- Special component policy: 51 checks and 147 PMS bolt/gasket rows.
- Calculated-only integration: 53 checks, including native XLSX serialization/reopening and read-only inspection of the original template.
- Source audit: 22,804 checks, unchanged source/offline-data parity.
- Full workflow: 9,675 checks, 9,640 expanded scenarios from all 67 classes / 1,698 source rows; no failures. The source-aware outcome remains 6,645 calculated and 2,995 Review scenarios. These are software checks, not source engineering approval.

Real browser checks confirmed the two manual inputs are absent; M24 x 145 B7/2H at a test raw rate of Rs200/kg calculates Rs411.16 per set with the existing factor 2.50; gasket warnings no longer ask for a finished price; the template downloads without generated quotation columns. A legacy CSV imported one calculated pipe and one Review gasket with an explicit ignored-input warning. The actual downloaded report was reopened read-only: raw Rs100/kg and factor2 were retained, the gasket remained Review, legacy reference values and removed field labels were absent. Desktop Microsoft Excel interactive recalculation was not tested.

## User checks

1. Refresh the local app with Ctrl+F5 and open Component Quick Estimate. The two removed fields should not appear.
2. Select Bolt / Stud with Nuts, M24 x 145, ASTM A193 B7 / ASTM A194 2H, quantity1, and enter a confirmed raw rate. The supported set should calculate.
3. Download a fresh BOM template. It should retain raw/factor override columns without adding finished-unit pricing/reference columns.
4. Upload a BOM, then regenerate the report and Excel. Calculated items retain raw Rs/kg and factor; unsupported constructions remain Review.
5. For a migration test only, upload `tests/fixtures/calculated-only-legacy-bom.csv`. Its fake finished prices must not be used; the upload and report should explain that legacy inputs were ignored.

Gaskets and unsupported bolt constructions still need approved calculation and rate models. Removing quotation inputs does not itself complete those models. Changes are local, not published to the live website.
