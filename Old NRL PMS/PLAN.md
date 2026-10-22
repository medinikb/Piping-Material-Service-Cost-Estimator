# Plan: Scale PMS Web App To All 67 Pipe Specs

## Summary

The best method is to convert the app from a “single large file MVP” into a **data-driven web app**.

In simple terms: keep the screen and app logic small, and move every pipe spec into separate, verified data files. This makes the app easier to maintain, easier to check against the PMS PDF, and safer for future business use.

Current issue:
- `index.html` contains screen layout, styling, app behavior, and embedded pipe-spec backup data together.
- This is acceptable for MVP, but not practical for 67 pipe specs.
- Adding all specs into one file would make the app difficult to audit, slow to edit, and risky for engineering use.

Recommended target:
- One clean app shell.
- One pipe-spec list/registry.
- One JSON data file per pipe spec.
- Shared lookup logic used by all specs.
- Validation/reporting so missing or doubtful data is visible.

## Key Changes

### 1. Split The App Into Maintainable Modules

Recommended structure:

```text
PMS_webapp/
  index.html
  src/
    styles.css
    app.js
    pipeSpecRegistry.js
    bomLogic.js
    exportLogic.js
    validationLogic.js
  data/
    A-series/
      A1A.json
      A2A.json
      ...
    B-series/
      B1A.json
      B2A.json
      ...
    D-series/
      D1A.json
      ...
    E-series/
    F-series/
    G-series/
  docs/
    source-pms.pdf
    data-verification-log.xlsx
```

Business benefit:
- Easier to maintain.
- Easier to assign data entry/review work.
- Lower risk of breaking the full app when one pipe spec changes.
- Easier future upgrade to a proper database if the tool becomes a serious internal system.

### 2. Use One Standard Data Format For Every Pipe Spec

Every pipe spec file should follow the same structure:

```text
Pipe class name
Source document and page references
Engineering notes
List of material items
Size range
Rating / schedule / thickness
Material
Standard
End / facing
Unit
Verification status
```

Do not create a different format for each class.

Important fields:
- `pipeClass`
- `series`
- `source`
- `items`
- `group`
- `item`
- `type`
- `lowSize`
- `highSize`
- `schThkRating`
- `dimensionStandard`
- `material`
- `endFacing`
- `unit`
- `sourcePage`
- `verificationStatus`

Recommended verification statuses:
- `draft`
- `checked`
- `approved`
- `needs_review`

Business benefit:
- The app can clearly show whether a result is ready for engineering use or only draft.
- Reduces procurement and project risk.
- Helps separate “data entry done” from “engineering verified”.

### 3. Add A Pipe Spec Registry

Create one central list of all 67 specs, grouped by series.

Pipe spec list to include:

```text
A-series:
A1A, A2A, A3A, A4F, A5A, A9A, A10A, A15A, A16A, A19A, A20A, A21A, A22A, A23A, A1F, A1K, A1N, A1Z, A3Y, A6N

B-series:
B1A, B2A, B3A, B4D, B4D1, B4F, B4F1, B5A, B5D, B9A, B19A, B21N, B22A, B22M, B23A, B25A, B25K, B26A, B1F, B1K, B1N, B6N

D-series:
D1A, D2A, D4F, D5A, D21A, D25A, D26A, D1K, D2D, D5D, D5E, D15K

E-series:
E25A, E26A, E5E

F-series:
F5A, F15M, F25A, F25D, F26D, F27A

G-series:
G21A, G22A, G5M, G25N
```

The app should use this registry to:
- Show all available pipe specs.
- Load the correct data file.
- Show missing specs as “not yet digitized”.
- Prevent hidden mistakes caused by hardcoded dropdown values.

### 4. Build The Product In Phases

Phase 1: Clean structure
- Keep current functionality.
- Move CSS out of `index.html`.
- Move JavaScript logic out of `index.html`.
- Keep current supported specs working.

Phase 2: Standardize data
- Convert existing specs into the final JSON format.
- Rename files consistently, for example `A10A.json`, not mixed names like `a10a.json` and `pipe_class_A1A.json`.
- Add verification status and source-page references.

Phase 3: Complete all 67 specs
- Add remaining pipe spec JSON files series by series.
- Recommended order: complete A-series first, then B-series, then D/E/F/G.
- Track progress in a verification log.

Phase 4: Add quality checks
- Add an internal validation page or report showing:
  - Missing pipe specs
  - Empty material fields
  - Invalid size ranges
  - Duplicate/conflicting item rules
  - Specs still marked `draft` or `needs_review`

Phase 5: Business-ready improvements
- Add user-friendly warnings when data is incomplete.
- Add project save/load later if needed.
- Add revision history if multiple engineers will use the app.
- Add login/database only after the static version proves useful.

## Test Plan

For each pipe spec:
- Select the pipe class from the dropdown.
- Enter common items such as Pipe, Elbow, Tee, Reducer, Flange, Gasket, Stud Bolt, Gate Valve, Globe Valve, Check Valve.
- Test small, medium, and large sizes.
- Confirm generated material details match the PMS PDF.
- Export Excel and compare output with the existing Phase-2 BOM format.
- Confirm incomplete specs show a warning instead of silently producing wrong output.

Acceptance criteria:
- All 67 specs appear in the app.
- Missing or unverified specs are clearly marked.
- Existing A10A behavior still works.
- The app does not require editing `index.html` whenever a pipe spec is added.
- A non-coder can add or review pipe-spec data by working mostly inside the `data` folder.

## Assumptions

- The app should remain a simple static web app for now, deployable on GitHub Pages.
- No database is needed for the next version.
- PMS PDF remains the engineering source of truth.
- JSON files are the best next step because they are simple, low-cost, and maintainable.
- Data must be treated as engineering-sensitive: every spec should have a clear verification status before business/procurement use.
