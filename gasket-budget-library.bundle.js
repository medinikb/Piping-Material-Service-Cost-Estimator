// GENERATED: default policy + published geometry; do not edit this bundle.
globalThis.PIPING_GASKET_BUDGET_LIBRARY = {
  "policy": {
    "schemaVersion": 1,
    "version": "2026-10-22-budget-v9",
    "status": "PROVISIONAL_BUDGET_ONLY",
    "authorization": "Product owner approved defaults on 2026-10-22 to reduce routine gasket input. Numerical allowances below are initial estimating assumptions, not manufacturer prices or PO calibration.",
    "scope": "Material budget only, excluding tax/freight. No design, stock-form, asbestos-substitution or procurement approval. Missing sizes use labelled geometry allowances; unsupported constructions and ambiguous specifications require confirmed inputs.",
    "families": {
      "SHEET_RING": {
        "yieldPercent": 80,
        "factor": 3,
        "thicknessMm": 3
      },
      "FULL_FACE": {
        "yieldPercent": 75,
        "factor": 3,
        "thicknessMm": 3
      },
      "SPIRAL_WOUND": {
        "yieldPercent": 85,
        "factor": 1.8,
        "thicknessMm": 4.5,
        "ringThicknessMm": 3,
        "metalVolumeFraction": 0.3,
        "fillerVolumeFraction": 0.5,
        "rings": "BOTH"
      },
      "RTJ": {
        "yieldPercent": 70,
        "factor": 4,
        "flankAngleDegrees": 23
      }
    },
    "materials": {
      "SS304": {
        "densityKgM3": 8000,
        "fallbackRawRsKg": 210
      },
      "SS304L": {
        "densityKgM3": 8000,
        "fallbackRawRsKg": 210
      },
      "SS304H": {
        "densityKgM3": 8000,
        "fallbackRawRsKg": 260
      },
      "SS316": {
        "densityKgM3": 8000,
        "fallbackRawRsKg": 320
      },
      "SS316L": {
        "densityKgM3": 8000,
        "fallbackRawRsKg": 370
      },
      "SS321": {
        "densityKgM3": 8000,
        "fallbackRawRsKg": 350
      },
      "SOFT_IRON": {
        "densityKgM3": 7850,
        "fallbackRawRsKg": 90
      },
      "5CR": {
        "densityKgM3": 7850,
        "fallbackRawRsKg": 180
      },
      "CARBON_STEEL": {
        "densityKgM3": 7850,
        "fallbackRawRsKg": 90
      },
      "CAF": {
        "densityKgM3": 1800,
        "fallbackRawRsKg": 250
      },
      "NON_ASBESTOS": {
        "densityKgM3": 1800,
        "fallbackRawRsKg": 250
      },
      "BUTYL": {
        "densityKgM3": 1200,
        "fallbackRawRsKg": 180
      },
      "PTFE": {
        "densityKgM3": 2200,
        "fallbackRawRsKg": 1250
      },
      "GRAPHITE": {
        "densityKgM3": 1400,
        "fallbackRawRsKg": 350
      }
    },
    "defaultWithoutClass": {
      "stainlessConstruction": "SPIRAL_WOUND",
      "stainlessFiller": "GRAPHITE",
      "innerRingMaterial": "same-as-winding",
      "outerRingMaterial": "CARBON_STEEL",
      "pressureRating": 150,
      "pressureRatingByThicknessMm": {
        "5": 300
      },
      "ungradedSpiralMaterial": "SS316L"
    },
    "p90Ratio": 1.5,
    "sizeFallback": {
      "enabled": true,
      "nominalMmPerInch": 25.4,
      "method": "CONSTANT_SECTION",
      "note": "Estimated dimensions: nearest same-construction, same-pressure table row retains radial widths and cross-section; diameters shift by nominal size difference x 25.4. Full-face hole count and hole diameter retain the reference values. This is a cost allowance, not standard dimensions, flange-series identification, fit or manufacturing approval."
    },
    "calibrationNote": "All density values, yield percentages, metal/filler/void volume shares, unspecified thickness/ring choices, fallback raw allowances and conversion factors are estimating assumptions. They require validation against actual weights/quotes. Manufacturer dimension tables do not validate these commercial defaults. No live or selected-year price claim is made. Metal 30% + filler 50% leaves 20% void in the winding envelope. This is an approximate mass model, not a winding design calculation. RTJ corner fillets are neglected. Spiral-wound default factor 1.8 is retained by explicit product-owner budget-estimating choice. The 34-row SS316L comparison with PO 4500030816 dated 2025-07-08 (aggregate matching factor about 1.586) is historical reference only and does not set the default. PO includes packing/testing/freight, excludes GST; app raw references are not PO-date mill prices. Not a like-for-like current quotation or validation of all grades/sizes. See Validation/gasket-po4500030816-benchmark.json."
  },
  "dimensions": {
    "schemaVersion": 1,
    "sourceUrl": "https://www.lamons.com/wp-content/uploads/2021/09/Lamons-Gasket-Fastener-Handbook.pdf",
    "sourceTitle": "Lamons Gasket & Fastener Handbook (2015)",
    "checkedOn": "2026-10-22",
    "scope": "Published nominal geometry only. Dimensions are not design approval or a mass/price quotation.",
    "spiral": [
      {
        "nps": 0.5,
        "rating": 150,
        "sourcePage": 72,
        "innerIdMm": 14.2,
        "windingIdMm": 19.1,
        "windingOdMm": 31.8,
        "outerOdMm": 47.6
      },
      {
        "nps": 0.75,
        "rating": 150,
        "sourcePage": 72,
        "innerIdMm": 20.6,
        "windingIdMm": 25.4,
        "windingOdMm": 39.7,
        "outerOdMm": 57.2
      },
      {
        "nps": 1,
        "rating": 150,
        "sourcePage": 72,
        "innerIdMm": 26.9,
        "windingIdMm": 31.8,
        "windingOdMm": 47.6,
        "outerOdMm": 66.7
      },
      {
        "nps": 1.25,
        "rating": 150,
        "sourcePage": 72,
        "innerIdMm": 38.1,
        "windingIdMm": 47.6,
        "windingOdMm": 60.3,
        "outerOdMm": 76.2
      },
      {
        "nps": 1.5,
        "rating": 150,
        "sourcePage": 72,
        "innerIdMm": 44.5,
        "windingIdMm": 54,
        "windingOdMm": 69.9,
        "outerOdMm": 85.7
      },
      {
        "nps": 2,
        "rating": 150,
        "sourcePage": 72,
        "innerIdMm": 55.6,
        "windingIdMm": 69.9,
        "windingOdMm": 85.7,
        "outerOdMm": 104.8
      },
      {
        "nps": 2.5,
        "rating": 150,
        "sourcePage": 72,
        "innerIdMm": 66.5,
        "windingIdMm": 82.6,
        "windingOdMm": 98.4,
        "outerOdMm": 123.8
      },
      {
        "nps": 3,
        "rating": 150,
        "sourcePage": 72,
        "innerIdMm": 81,
        "windingIdMm": 101.6,
        "windingOdMm": 120.7,
        "outerOdMm": 136.5
      },
      {
        "nps": 4,
        "rating": 150,
        "sourcePage": 72,
        "innerIdMm": 106.4,
        "windingIdMm": 127,
        "windingOdMm": 149.2,
        "outerOdMm": 174.6
      },
      {
        "nps": 5,
        "rating": 150,
        "sourcePage": 72,
        "innerIdMm": 131.8,
        "windingIdMm": 155.6,
        "windingOdMm": 177.8,
        "outerOdMm": 196.9
      },
      {
        "nps": 6,
        "rating": 150,
        "sourcePage": 72,
        "innerIdMm": 157.2,
        "windingIdMm": 182.6,
        "windingOdMm": 209.6,
        "outerOdMm": 222.3
      },
      {
        "nps": 8,
        "rating": 150,
        "sourcePage": 72,
        "innerIdMm": 215.9,
        "windingIdMm": 233.4,
        "windingOdMm": 263.5,
        "outerOdMm": 279.4
      },
      {
        "nps": 10,
        "rating": 150,
        "sourcePage": 72,
        "innerIdMm": 268.2,
        "windingIdMm": 287.3,
        "windingOdMm": 317.5,
        "outerOdMm": 339.7
      },
      {
        "nps": 12,
        "rating": 150,
        "sourcePage": 72,
        "innerIdMm": 317.5,
        "windingIdMm": 339.7,
        "windingOdMm": 374.7,
        "outerOdMm": 409.6
      },
      {
        "nps": 14,
        "rating": 150,
        "sourcePage": 72,
        "innerIdMm": 349.3,
        "windingIdMm": 371.5,
        "windingOdMm": 406.4,
        "outerOdMm": 450.9
      },
      {
        "nps": 16,
        "rating": 150,
        "sourcePage": 72,
        "innerIdMm": 400.1,
        "windingIdMm": 422.3,
        "windingOdMm": 463.6,
        "outerOdMm": 514.4
      },
      {
        "nps": 18,
        "rating": 150,
        "sourcePage": 72,
        "innerIdMm": 449.3,
        "windingIdMm": 474.7,
        "windingOdMm": 527.1,
        "outerOdMm": 549.3
      },
      {
        "nps": 20,
        "rating": 150,
        "sourcePage": 72,
        "innerIdMm": 500.1,
        "windingIdMm": 525.5,
        "windingOdMm": 577.9,
        "outerOdMm": 606.4
      },
      {
        "nps": 24,
        "rating": 150,
        "sourcePage": 72,
        "innerIdMm": 603.3,
        "windingIdMm": 628.7,
        "windingOdMm": 685.8,
        "outerOdMm": 717.6
      },
      {
        "nps": 0.5,
        "rating": 300,
        "sourcePage": 73,
        "innerIdMm": 14.2,
        "windingIdMm": 19.1,
        "windingOdMm": 31.8,
        "outerOdMm": 54
      },
      {
        "nps": 0.75,
        "rating": 300,
        "sourcePage": 73,
        "innerIdMm": 20.6,
        "windingIdMm": 25.4,
        "windingOdMm": 39.7,
        "outerOdMm": 66.7
      },
      {
        "nps": 1,
        "rating": 300,
        "sourcePage": 73,
        "innerIdMm": 26.9,
        "windingIdMm": 31.8,
        "windingOdMm": 47.6,
        "outerOdMm": 73
      },
      {
        "nps": 1.25,
        "rating": 300,
        "sourcePage": 73,
        "innerIdMm": 38.1,
        "windingIdMm": 47.6,
        "windingOdMm": 60.3,
        "outerOdMm": 82.6
      },
      {
        "nps": 1.5,
        "rating": 300,
        "sourcePage": 73,
        "innerIdMm": 44.5,
        "windingIdMm": 54,
        "windingOdMm": 69.9,
        "outerOdMm": 95.3
      },
      {
        "nps": 2,
        "rating": 300,
        "sourcePage": 73,
        "innerIdMm": 55.6,
        "windingIdMm": 69.9,
        "windingOdMm": 85.7,
        "outerOdMm": 111.1
      },
      {
        "nps": 2.5,
        "rating": 300,
        "sourcePage": 73,
        "innerIdMm": 66.5,
        "windingIdMm": 82.6,
        "windingOdMm": 98.4,
        "outerOdMm": 130.2
      },
      {
        "nps": 3,
        "rating": 300,
        "sourcePage": 73,
        "innerIdMm": 81,
        "windingIdMm": 101.6,
        "windingOdMm": 120.7,
        "outerOdMm": 149.2
      },
      {
        "nps": 4,
        "rating": 300,
        "sourcePage": 73,
        "innerIdMm": 106.4,
        "windingIdMm": 127,
        "windingOdMm": 149.2,
        "outerOdMm": 181
      },
      {
        "nps": 5,
        "rating": 300,
        "sourcePage": 73,
        "innerIdMm": 131.8,
        "windingIdMm": 155.6,
        "windingOdMm": 177.8,
        "outerOdMm": 215.9
      },
      {
        "nps": 6,
        "rating": 300,
        "sourcePage": 73,
        "innerIdMm": 157.2,
        "windingIdMm": 182.6,
        "windingOdMm": 209.6,
        "outerOdMm": 250.8
      },
      {
        "nps": 8,
        "rating": 300,
        "sourcePage": 73,
        "innerIdMm": 215.9,
        "windingIdMm": 233.4,
        "windingOdMm": 263.5,
        "outerOdMm": 308
      },
      {
        "nps": 10,
        "rating": 300,
        "sourcePage": 73,
        "innerIdMm": 268.2,
        "windingIdMm": 287.3,
        "windingOdMm": 317.5,
        "outerOdMm": 362
      },
      {
        "nps": 12,
        "rating": 300,
        "sourcePage": 73,
        "innerIdMm": 317.5,
        "windingIdMm": 339.7,
        "windingOdMm": 374.7,
        "outerOdMm": 422.3
      },
      {
        "nps": 14,
        "rating": 300,
        "sourcePage": 73,
        "innerIdMm": 349.3,
        "windingIdMm": 371.5,
        "windingOdMm": 406.4,
        "outerOdMm": 485.8
      },
      {
        "nps": 16,
        "rating": 300,
        "sourcePage": 73,
        "innerIdMm": 400.1,
        "windingIdMm": 422.3,
        "windingOdMm": 463.6,
        "outerOdMm": 539.8
      },
      {
        "nps": 18,
        "rating": 300,
        "sourcePage": 73,
        "innerIdMm": 449.3,
        "windingIdMm": 474.7,
        "windingOdMm": 527.1,
        "outerOdMm": 596.9
      },
      {
        "nps": 20,
        "rating": 300,
        "sourcePage": 73,
        "innerIdMm": 500.1,
        "windingIdMm": 525.5,
        "windingOdMm": 577.9,
        "outerOdMm": 654.1
      },
      {
        "nps": 24,
        "rating": 300,
        "sourcePage": 73,
        "innerIdMm": 603.3,
        "windingIdMm": 628.7,
        "windingOdMm": 685.8,
        "outerOdMm": 774.7
      },
      {
        "nps": 0.5,
        "rating": 400,
        "sourcePage": 73,
        "innerIdMm": 14.2,
        "windingIdMm": 19.1,
        "windingOdMm": 31.8,
        "outerOdMm": 54
      },
      {
        "nps": 0.75,
        "rating": 400,
        "sourcePage": 73,
        "innerIdMm": 20.6,
        "windingIdMm": 25.4,
        "windingOdMm": 39.7,
        "outerOdMm": 66.7
      },
      {
        "nps": 1,
        "rating": 400,
        "sourcePage": 73,
        "innerIdMm": 26.9,
        "windingIdMm": 31.8,
        "windingOdMm": 47.6,
        "outerOdMm": 73
      },
      {
        "nps": 1.25,
        "rating": 400,
        "sourcePage": 73,
        "innerIdMm": 38.1,
        "windingIdMm": 47.6,
        "windingOdMm": 60.3,
        "outerOdMm": 82.6
      },
      {
        "nps": 1.5,
        "rating": 400,
        "sourcePage": 73,
        "innerIdMm": 44.5,
        "windingIdMm": 54,
        "windingOdMm": 69.9,
        "outerOdMm": 95.3
      },
      {
        "nps": 2,
        "rating": 400,
        "sourcePage": 73,
        "innerIdMm": 55.6,
        "windingIdMm": 69.9,
        "windingOdMm": 85.7,
        "outerOdMm": 111.1
      },
      {
        "nps": 2.5,
        "rating": 400,
        "sourcePage": 73,
        "innerIdMm": 66.5,
        "windingIdMm": 82.6,
        "windingOdMm": 98.4,
        "outerOdMm": 130.2
      },
      {
        "nps": 3,
        "rating": 400,
        "sourcePage": 73,
        "innerIdMm": 81,
        "windingIdMm": 101.6,
        "windingOdMm": 120.7,
        "outerOdMm": 149.2
      },
      {
        "nps": 4,
        "rating": 400,
        "sourcePage": 73,
        "innerIdMm": 102.6,
        "windingIdMm": 120.7,
        "windingOdMm": 149.2,
        "outerOdMm": 177.8
      },
      {
        "nps": 5,
        "rating": 400,
        "sourcePage": 73,
        "innerIdMm": 128.3,
        "windingIdMm": 147.6,
        "windingOdMm": 177.8,
        "outerOdMm": 212.7
      },
      {
        "nps": 6,
        "rating": 400,
        "sourcePage": 73,
        "innerIdMm": 154.9,
        "windingIdMm": 174.6,
        "windingOdMm": 209.6,
        "outerOdMm": 247.7
      },
      {
        "nps": 8,
        "rating": 400,
        "sourcePage": 73,
        "innerIdMm": 205.7,
        "windingIdMm": 225.4,
        "windingOdMm": 263.5,
        "outerOdMm": 304.8
      },
      {
        "nps": 10,
        "rating": 400,
        "sourcePage": 73,
        "innerIdMm": 255.3,
        "windingIdMm": 274.6,
        "windingOdMm": 317.5,
        "outerOdMm": 358.8
      },
      {
        "nps": 12,
        "rating": 400,
        "sourcePage": 73,
        "innerIdMm": 307.3,
        "windingIdMm": 327,
        "windingOdMm": 374.7,
        "outerOdMm": 419.1
      },
      {
        "nps": 14,
        "rating": 400,
        "sourcePage": 73,
        "innerIdMm": 342.9,
        "windingIdMm": 362,
        "windingOdMm": 406.4,
        "outerOdMm": 482.6
      },
      {
        "nps": 16,
        "rating": 400,
        "sourcePage": 73,
        "innerIdMm": 389.9,
        "windingIdMm": 412.8,
        "windingOdMm": 463.6,
        "outerOdMm": 536.6
      },
      {
        "nps": 18,
        "rating": 400,
        "sourcePage": 73,
        "innerIdMm": 438.2,
        "windingIdMm": 469.9,
        "windingOdMm": 527.1,
        "outerOdMm": 593.7
      },
      {
        "nps": 20,
        "rating": 400,
        "sourcePage": 73,
        "innerIdMm": 489,
        "windingIdMm": 520.7,
        "windingOdMm": 577.9,
        "outerOdMm": 647.7
      },
      {
        "nps": 24,
        "rating": 400,
        "sourcePage": 73,
        "innerIdMm": 590.6,
        "windingIdMm": 628.7,
        "windingOdMm": 685.8,
        "outerOdMm": 768.4
      },
      {
        "nps": 0.5,
        "rating": 600,
        "sourcePage": 74,
        "innerIdMm": 14.2,
        "windingIdMm": 19.1,
        "windingOdMm": 31.8,
        "outerOdMm": 54
      },
      {
        "nps": 0.75,
        "rating": 600,
        "sourcePage": 74,
        "innerIdMm": 20.6,
        "windingIdMm": 25.4,
        "windingOdMm": 39.7,
        "outerOdMm": 66.7
      },
      {
        "nps": 1,
        "rating": 600,
        "sourcePage": 74,
        "innerIdMm": 26.9,
        "windingIdMm": 31.8,
        "windingOdMm": 47.6,
        "outerOdMm": 73
      },
      {
        "nps": 1.25,
        "rating": 600,
        "sourcePage": 74,
        "innerIdMm": 38.1,
        "windingIdMm": 47.6,
        "windingOdMm": 60.3,
        "outerOdMm": 82.6
      },
      {
        "nps": 1.5,
        "rating": 600,
        "sourcePage": 74,
        "innerIdMm": 44.5,
        "windingIdMm": 54,
        "windingOdMm": 69.9,
        "outerOdMm": 95.3
      },
      {
        "nps": 2,
        "rating": 600,
        "sourcePage": 74,
        "innerIdMm": 55.6,
        "windingIdMm": 69.9,
        "windingOdMm": 85.7,
        "outerOdMm": 111.1
      },
      {
        "nps": 2.5,
        "rating": 600,
        "sourcePage": 74,
        "innerIdMm": 66.5,
        "windingIdMm": 82.6,
        "windingOdMm": 98.4,
        "outerOdMm": 130.2
      },
      {
        "nps": 3,
        "rating": 600,
        "sourcePage": 74,
        "innerIdMm": 81,
        "windingIdMm": 101.6,
        "windingOdMm": 120.7,
        "outerOdMm": 149.2
      },
      {
        "nps": 3.5,
        "rating": 600,
        "sourcePage": 74,
        "innerIdMm": 88.9,
        "windingIdMm": 104.8,
        "windingOdMm": 133.4,
        "outerOdMm": 161.9
      },
      {
        "nps": 4,
        "rating": 600,
        "sourcePage": 74,
        "innerIdMm": 102.6,
        "windingIdMm": 120.7,
        "windingOdMm": 149.2,
        "outerOdMm": 193.7
      },
      {
        "nps": 5,
        "rating": 600,
        "sourcePage": 74,
        "innerIdMm": 128.3,
        "windingIdMm": 147.6,
        "windingOdMm": 177.8,
        "outerOdMm": 241.3
      },
      {
        "nps": 6,
        "rating": 600,
        "sourcePage": 74,
        "innerIdMm": 154.9,
        "windingIdMm": 174.6,
        "windingOdMm": 209.6,
        "outerOdMm": 266.7
      },
      {
        "nps": 8,
        "rating": 600,
        "sourcePage": 74,
        "innerIdMm": 205.7,
        "windingIdMm": 225.4,
        "windingOdMm": 263.5,
        "outerOdMm": 320.7
      },
      {
        "nps": 10,
        "rating": 600,
        "sourcePage": 74,
        "innerIdMm": 255.3,
        "windingIdMm": 274.6,
        "windingOdMm": 317.5,
        "outerOdMm": 400.1
      },
      {
        "nps": 12,
        "rating": 600,
        "sourcePage": 74,
        "innerIdMm": 307.3,
        "windingIdMm": 327,
        "windingOdMm": 374.7,
        "outerOdMm": 457.2
      },
      {
        "nps": 14,
        "rating": 600,
        "sourcePage": 74,
        "innerIdMm": 342.9,
        "windingIdMm": 362,
        "windingOdMm": 406.4,
        "outerOdMm": 492.1
      },
      {
        "nps": 16,
        "rating": 600,
        "sourcePage": 74,
        "innerIdMm": 389.9,
        "windingIdMm": 412.8,
        "windingOdMm": 463.6,
        "outerOdMm": 565.2
      },
      {
        "nps": 18,
        "rating": 600,
        "sourcePage": 74,
        "innerIdMm": 438.2,
        "windingIdMm": 469.9,
        "windingOdMm": 527.1,
        "outerOdMm": 612.8
      },
      {
        "nps": 20,
        "rating": 600,
        "sourcePage": 74,
        "innerIdMm": 489,
        "windingIdMm": 520.7,
        "windingOdMm": 577.9,
        "outerOdMm": 682.6
      },
      {
        "nps": 24,
        "rating": 600,
        "sourcePage": 74,
        "innerIdMm": 590.6,
        "windingIdMm": 628.7,
        "windingOdMm": 685.8,
        "outerOdMm": 790.6
      },
      {
        "nps": 0.5,
        "rating": 900,
        "sourcePage": 74,
        "innerIdMm": 14.2,
        "windingIdMm": 19.1,
        "windingOdMm": 31.8,
        "outerOdMm": 63.5
      },
      {
        "nps": 0.75,
        "rating": 900,
        "sourcePage": 74,
        "innerIdMm": 20.6,
        "windingIdMm": 25.4,
        "windingOdMm": 39.7,
        "outerOdMm": 69.9
      },
      {
        "nps": 1,
        "rating": 900,
        "sourcePage": 74,
        "innerIdMm": 26.9,
        "windingIdMm": 31.8,
        "windingOdMm": 47.6,
        "outerOdMm": 79.4
      },
      {
        "nps": 1.25,
        "rating": 900,
        "sourcePage": 74,
        "innerIdMm": 33.3,
        "windingIdMm": 39.7,
        "windingOdMm": 60.3,
        "outerOdMm": 88.9
      },
      {
        "nps": 1.5,
        "rating": 900,
        "sourcePage": 74,
        "innerIdMm": 41.4,
        "windingIdMm": 47.6,
        "windingOdMm": 69.9,
        "outerOdMm": 98.4
      },
      {
        "nps": 2,
        "rating": 900,
        "sourcePage": 74,
        "innerIdMm": 52.3,
        "windingIdMm": 58.7,
        "windingOdMm": 85.7,
        "outerOdMm": 142.9
      },
      {
        "nps": 2.5,
        "rating": 900,
        "sourcePage": 74,
        "innerIdMm": 63.5,
        "windingIdMm": 69.9,
        "windingOdMm": 98.4,
        "outerOdMm": 165.1
      },
      {
        "nps": 3,
        "rating": 900,
        "sourcePage": 74,
        "innerIdMm": 78.7,
        "windingIdMm": 95.3,
        "windingOdMm": 120.7,
        "outerOdMm": 168.3
      },
      {
        "nps": 4,
        "rating": 900,
        "sourcePage": 74,
        "innerIdMm": 102.6,
        "windingIdMm": 120.7,
        "windingOdMm": 149.2,
        "outerOdMm": 206.4
      },
      {
        "nps": 5,
        "rating": 900,
        "sourcePage": 74,
        "innerIdMm": 128.3,
        "windingIdMm": 147.6,
        "windingOdMm": 177.8,
        "outerOdMm": 247.7
      },
      {
        "nps": 6,
        "rating": 900,
        "sourcePage": 74,
        "innerIdMm": 154.9,
        "windingIdMm": 174.6,
        "windingOdMm": 209.6,
        "outerOdMm": 288.9
      },
      {
        "nps": 8,
        "rating": 900,
        "sourcePage": 74,
        "innerIdMm": 196.9,
        "windingIdMm": 222.3,
        "windingOdMm": 257.2,
        "outerOdMm": 358.8
      },
      {
        "nps": 10,
        "rating": 900,
        "sourcePage": 74,
        "innerIdMm": 246.1,
        "windingIdMm": 276.2,
        "windingOdMm": 311.2,
        "outerOdMm": 435
      },
      {
        "nps": 12,
        "rating": 900,
        "sourcePage": 74,
        "innerIdMm": 292.1,
        "windingIdMm": 323.9,
        "windingOdMm": 368.3,
        "outerOdMm": 498.5
      },
      {
        "nps": 14,
        "rating": 900,
        "sourcePage": 74,
        "innerIdMm": 320.8,
        "windingIdMm": 355.6,
        "windingOdMm": 400.1,
        "outerOdMm": 520.7
      },
      {
        "nps": 16,
        "rating": 900,
        "sourcePage": 74,
        "innerIdMm": 374.7,
        "windingIdMm": 412.8,
        "windingOdMm": 457.2,
        "outerOdMm": 574.7
      },
      {
        "nps": 18,
        "rating": 900,
        "sourcePage": 74,
        "innerIdMm": 425.5,
        "windingIdMm": 463.6,
        "windingOdMm": 520.7,
        "outerOdMm": 638.2
      },
      {
        "nps": 20,
        "rating": 900,
        "sourcePage": 74,
        "innerIdMm": 482.6,
        "windingIdMm": 520.7,
        "windingOdMm": 571.5,
        "outerOdMm": 698.5
      },
      {
        "nps": 24,
        "rating": 900,
        "sourcePage": 74,
        "innerIdMm": 590.6,
        "windingIdMm": 628.7,
        "windingOdMm": 679.5,
        "outerOdMm": 838.2
      },
      {
        "nps": 0.5,
        "rating": 1500,
        "sourcePage": 75,
        "innerIdMm": 14.2,
        "windingIdMm": 19.1,
        "windingOdMm": 31.8,
        "outerOdMm": 63.5
      },
      {
        "nps": 0.75,
        "rating": 1500,
        "sourcePage": 75,
        "innerIdMm": 20.6,
        "windingIdMm": 25.4,
        "windingOdMm": 39.7,
        "outerOdMm": 69.9
      },
      {
        "nps": 1,
        "rating": 1500,
        "sourcePage": 75,
        "innerIdMm": 26.9,
        "windingIdMm": 31.8,
        "windingOdMm": 47.6,
        "outerOdMm": 79.4
      },
      {
        "nps": 1.25,
        "rating": 1500,
        "sourcePage": 75,
        "innerIdMm": 33.3,
        "windingIdMm": 39.7,
        "windingOdMm": 60.3,
        "outerOdMm": 88.9
      },
      {
        "nps": 1.5,
        "rating": 1500,
        "sourcePage": 75,
        "innerIdMm": 41.4,
        "windingIdMm": 47.6,
        "windingOdMm": 69.9,
        "outerOdMm": 98.4
      },
      {
        "nps": 2,
        "rating": 1500,
        "sourcePage": 75,
        "innerIdMm": 52.3,
        "windingIdMm": 58.7,
        "windingOdMm": 85.7,
        "outerOdMm": 142.9
      },
      {
        "nps": 2.5,
        "rating": 1500,
        "sourcePage": 75,
        "innerIdMm": 63.5,
        "windingIdMm": 69.9,
        "windingOdMm": 98.4,
        "outerOdMm": 165.1
      },
      {
        "nps": 3,
        "rating": 1500,
        "sourcePage": 75,
        "innerIdMm": 78.7,
        "windingIdMm": 92.1,
        "windingOdMm": 120.7,
        "outerOdMm": 174.6
      },
      {
        "nps": 4,
        "rating": 1500,
        "sourcePage": 75,
        "innerIdMm": 97.8,
        "windingIdMm": 117.5,
        "windingOdMm": 149.2,
        "outerOdMm": 209.6
      },
      {
        "nps": 5,
        "rating": 1500,
        "sourcePage": 75,
        "innerIdMm": 124.5,
        "windingIdMm": 142.9,
        "windingOdMm": 177.8,
        "outerOdMm": 254
      },
      {
        "nps": 6,
        "rating": 1500,
        "sourcePage": 75,
        "innerIdMm": 147.3,
        "windingIdMm": 171.5,
        "windingOdMm": 209.6,
        "outerOdMm": 282.6
      },
      {
        "nps": 8,
        "rating": 1500,
        "sourcePage": 75,
        "innerIdMm": 196.9,
        "windingIdMm": 215.9,
        "windingOdMm": 257.2,
        "outerOdMm": 352.4
      },
      {
        "nps": 10,
        "rating": 1500,
        "sourcePage": 75,
        "innerIdMm": 246.1,
        "windingIdMm": 266.7,
        "windingOdMm": 311.2,
        "outerOdMm": 435
      },
      {
        "nps": 12,
        "rating": 1500,
        "sourcePage": 75,
        "innerIdMm": 292.1,
        "windingIdMm": 323.9,
        "windingOdMm": 368.3,
        "outerOdMm": 520.7
      },
      {
        "nps": 14,
        "rating": 1500,
        "sourcePage": 75,
        "innerIdMm": 320.8,
        "windingIdMm": 362,
        "windingOdMm": 400.1,
        "outerOdMm": 577.9
      },
      {
        "nps": 16,
        "rating": 1500,
        "sourcePage": 75,
        "innerIdMm": 368.3,
        "windingIdMm": 406.4,
        "windingOdMm": 457.2,
        "outerOdMm": 641.4
      },
      {
        "nps": 18,
        "rating": 1500,
        "sourcePage": 75,
        "innerIdMm": 425.5,
        "windingIdMm": 463.6,
        "windingOdMm": 520.7,
        "outerOdMm": 704.9
      },
      {
        "nps": 20,
        "rating": 1500,
        "sourcePage": 75,
        "innerIdMm": 476.3,
        "windingIdMm": 514.4,
        "windingOdMm": 571.5,
        "outerOdMm": 755.7
      },
      {
        "nps": 24,
        "rating": 1500,
        "sourcePage": 75,
        "innerIdMm": 577.9,
        "windingIdMm": 616,
        "windingOdMm": 679.5,
        "outerOdMm": 901.7
      },
      {
        "nps": 0.5,
        "rating": 2500,
        "sourcePage": 75,
        "innerIdMm": 14.2,
        "windingIdMm": 19.1,
        "windingOdMm": 31.8,
        "outerOdMm": 69.9
      },
      {
        "nps": 0.75,
        "rating": 2500,
        "sourcePage": 75,
        "innerIdMm": 20.6,
        "windingIdMm": 25.4,
        "windingOdMm": 39.7,
        "outerOdMm": 76.2
      },
      {
        "nps": 1,
        "rating": 2500,
        "sourcePage": 75,
        "innerIdMm": 26.9,
        "windingIdMm": 31.8,
        "windingOdMm": 47.6,
        "outerOdMm": 85.7
      },
      {
        "nps": 1.25,
        "rating": 2500,
        "sourcePage": 75,
        "innerIdMm": 33.3,
        "windingIdMm": 39.7,
        "windingOdMm": 60.3,
        "outerOdMm": 104.8
      },
      {
        "nps": 1.5,
        "rating": 2500,
        "sourcePage": 75,
        "innerIdMm": 41.4,
        "windingIdMm": 47.6,
        "windingOdMm": 69.9,
        "outerOdMm": 117.5
      },
      {
        "nps": 2,
        "rating": 2500,
        "sourcePage": 75,
        "innerIdMm": 52.3,
        "windingIdMm": 58.7,
        "windingOdMm": 85.7,
        "outerOdMm": 146.1
      },
      {
        "nps": 2.5,
        "rating": 2500,
        "sourcePage": 75,
        "innerIdMm": 63.5,
        "windingIdMm": 69.9,
        "windingOdMm": 98.4,
        "outerOdMm": 168.3
      },
      {
        "nps": 3,
        "rating": 2500,
        "sourcePage": 75,
        "innerIdMm": 78.7,
        "windingIdMm": 92.1,
        "windingOdMm": 120.7,
        "outerOdMm": 196.9
      },
      {
        "nps": 4,
        "rating": 2500,
        "sourcePage": 75,
        "innerIdMm": 97.8,
        "windingIdMm": 117.5,
        "windingOdMm": 149.2,
        "outerOdMm": 235
      },
      {
        "nps": 5,
        "rating": 2500,
        "sourcePage": 75,
        "innerIdMm": 124.5,
        "windingIdMm": 142.9,
        "windingOdMm": 177.8,
        "outerOdMm": 279.4
      },
      {
        "nps": 6,
        "rating": 2500,
        "sourcePage": 75,
        "innerIdMm": 147.3,
        "windingIdMm": 171.5,
        "windingOdMm": 209.6,
        "outerOdMm": 317.5
      },
      {
        "nps": 8,
        "rating": 2500,
        "sourcePage": 75,
        "innerIdMm": 196.9,
        "windingIdMm": 215.9,
        "windingOdMm": 257.2,
        "outerOdMm": 387.4
      },
      {
        "nps": 10,
        "rating": 2500,
        "sourcePage": 75,
        "innerIdMm": 246.1,
        "windingIdMm": 269.9,
        "windingOdMm": 311.2,
        "outerOdMm": 476.3
      },
      {
        "nps": 12,
        "rating": 2500,
        "sourcePage": 75,
        "innerIdMm": 292.1,
        "windingIdMm": 317.5,
        "windingOdMm": 368.3,
        "outerOdMm": 549.3
      }
    ],
    "sheet": [
      {
        "nps": 0.5,
        "rating": 150,
        "sourcePage": 39,
        "idMm": 21,
        "odMm": 48
      },
      {
        "nps": 0.75,
        "rating": 150,
        "sourcePage": 39,
        "idMm": 27,
        "odMm": 57
      },
      {
        "nps": 1,
        "rating": 150,
        "sourcePage": 39,
        "idMm": 33,
        "odMm": 67
      },
      {
        "nps": 1.25,
        "rating": 150,
        "sourcePage": 39,
        "idMm": 42,
        "odMm": 76
      },
      {
        "nps": 1.5,
        "rating": 150,
        "sourcePage": 39,
        "idMm": 49,
        "odMm": 86
      },
      {
        "nps": 2,
        "rating": 150,
        "sourcePage": 39,
        "idMm": 60,
        "odMm": 105
      },
      {
        "nps": 2.5,
        "rating": 150,
        "sourcePage": 39,
        "idMm": 73,
        "odMm": 124
      },
      {
        "nps": 3,
        "rating": 150,
        "sourcePage": 39,
        "idMm": 89,
        "odMm": 137
      },
      {
        "nps": 3.5,
        "rating": 150,
        "sourcePage": 39,
        "idMm": 102,
        "odMm": 162
      },
      {
        "nps": 4,
        "rating": 150,
        "sourcePage": 39,
        "idMm": 114,
        "odMm": 175
      },
      {
        "nps": 5,
        "rating": 150,
        "sourcePage": 39,
        "idMm": 141,
        "odMm": 197
      },
      {
        "nps": 6,
        "rating": 150,
        "sourcePage": 39,
        "idMm": 168,
        "odMm": 222
      },
      {
        "nps": 8,
        "rating": 150,
        "sourcePage": 39,
        "idMm": 219,
        "odMm": 279
      },
      {
        "nps": 10,
        "rating": 150,
        "sourcePage": 39,
        "idMm": 273,
        "odMm": 340
      },
      {
        "nps": 12,
        "rating": 150,
        "sourcePage": 39,
        "idMm": 324,
        "odMm": 410
      },
      {
        "nps": 14,
        "rating": 150,
        "sourcePage": 39,
        "idMm": 356,
        "odMm": 451
      },
      {
        "nps": 16,
        "rating": 150,
        "sourcePage": 39,
        "idMm": 406,
        "odMm": 514
      },
      {
        "nps": 18,
        "rating": 150,
        "sourcePage": 39,
        "idMm": 457,
        "odMm": 549
      },
      {
        "nps": 20,
        "rating": 150,
        "sourcePage": 39,
        "idMm": 508,
        "odMm": 607
      },
      {
        "nps": 24,
        "rating": 150,
        "sourcePage": 39,
        "idMm": 610,
        "odMm": 718
      },
      {
        "nps": 0.5,
        "rating": 300,
        "sourcePage": 40,
        "idMm": 21,
        "odMm": 54
      },
      {
        "nps": 0.75,
        "rating": 300,
        "sourcePage": 40,
        "idMm": 27,
        "odMm": 67
      },
      {
        "nps": 1,
        "rating": 300,
        "sourcePage": 40,
        "idMm": 33,
        "odMm": 73
      },
      {
        "nps": 1.25,
        "rating": 300,
        "sourcePage": 40,
        "idMm": 42,
        "odMm": 83
      },
      {
        "nps": 1.5,
        "rating": 300,
        "sourcePage": 40,
        "idMm": 49,
        "odMm": 95
      },
      {
        "nps": 2,
        "rating": 300,
        "sourcePage": 40,
        "idMm": 60,
        "odMm": 111
      },
      {
        "nps": 2.5,
        "rating": 300,
        "sourcePage": 40,
        "idMm": 73,
        "odMm": 130
      },
      {
        "nps": 3,
        "rating": 300,
        "sourcePage": 40,
        "idMm": 89,
        "odMm": 149
      },
      {
        "nps": 3.5,
        "rating": 300,
        "sourcePage": 40,
        "idMm": 102,
        "odMm": 165
      },
      {
        "nps": 4,
        "rating": 300,
        "sourcePage": 40,
        "idMm": 114,
        "odMm": 181
      },
      {
        "nps": 5,
        "rating": 300,
        "sourcePage": 40,
        "idMm": 141,
        "odMm": 216
      },
      {
        "nps": 6,
        "rating": 300,
        "sourcePage": 40,
        "idMm": 168,
        "odMm": 251
      },
      {
        "nps": 8,
        "rating": 300,
        "sourcePage": 40,
        "idMm": 219,
        "odMm": 308
      },
      {
        "nps": 10,
        "rating": 300,
        "sourcePage": 40,
        "idMm": 273,
        "odMm": 362
      },
      {
        "nps": 12,
        "rating": 300,
        "sourcePage": 40,
        "idMm": 324,
        "odMm": 422
      },
      {
        "nps": 14,
        "rating": 300,
        "sourcePage": 40,
        "idMm": 356,
        "odMm": 486
      },
      {
        "nps": 16,
        "rating": 300,
        "sourcePage": 40,
        "idMm": 406,
        "odMm": 540
      },
      {
        "nps": 18,
        "rating": 300,
        "sourcePage": 40,
        "idMm": 457,
        "odMm": 597
      },
      {
        "nps": 20,
        "rating": 300,
        "sourcePage": 40,
        "idMm": 508,
        "odMm": 654
      },
      {
        "nps": 24,
        "rating": 300,
        "sourcePage": 40,
        "idMm": 610,
        "odMm": 775
      },
      {
        "nps": 0.5,
        "rating": 400,
        "sourcePage": 40,
        "idMm": 21,
        "odMm": 54
      },
      {
        "nps": 0.75,
        "rating": 400,
        "sourcePage": 40,
        "idMm": 27,
        "odMm": 67
      },
      {
        "nps": 1,
        "rating": 400,
        "sourcePage": 40,
        "idMm": 33,
        "odMm": 73
      },
      {
        "nps": 1.25,
        "rating": 400,
        "sourcePage": 40,
        "idMm": 42,
        "odMm": 83
      },
      {
        "nps": 1.5,
        "rating": 400,
        "sourcePage": 40,
        "idMm": 49,
        "odMm": 95
      },
      {
        "nps": 2,
        "rating": 400,
        "sourcePage": 40,
        "idMm": 60,
        "odMm": 111
      },
      {
        "nps": 2.5,
        "rating": 400,
        "sourcePage": 40,
        "idMm": 73,
        "odMm": 130
      },
      {
        "nps": 3,
        "rating": 400,
        "sourcePage": 40,
        "idMm": 89,
        "odMm": 149
      },
      {
        "nps": 3.5,
        "rating": 400,
        "sourcePage": 40,
        "idMm": 102,
        "odMm": 162
      },
      {
        "nps": 4,
        "rating": 400,
        "sourcePage": 40,
        "idMm": 114,
        "odMm": 178
      },
      {
        "nps": 5,
        "rating": 400,
        "sourcePage": 40,
        "idMm": 141,
        "odMm": 213
      },
      {
        "nps": 6,
        "rating": 400,
        "sourcePage": 40,
        "idMm": 168,
        "odMm": 248
      },
      {
        "nps": 8,
        "rating": 400,
        "sourcePage": 40,
        "idMm": 219,
        "odMm": 305
      },
      {
        "nps": 10,
        "rating": 400,
        "sourcePage": 40,
        "idMm": 273,
        "odMm": 359
      },
      {
        "nps": 12,
        "rating": 400,
        "sourcePage": 40,
        "idMm": 324,
        "odMm": 419
      },
      {
        "nps": 14,
        "rating": 400,
        "sourcePage": 40,
        "idMm": 356,
        "odMm": 483
      },
      {
        "nps": 16,
        "rating": 400,
        "sourcePage": 40,
        "idMm": 406,
        "odMm": 536
      },
      {
        "nps": 18,
        "rating": 400,
        "sourcePage": 40,
        "idMm": 457,
        "odMm": 594
      },
      {
        "nps": 20,
        "rating": 400,
        "sourcePage": 40,
        "idMm": 508,
        "odMm": 648
      },
      {
        "nps": 24,
        "rating": 400,
        "sourcePage": 40,
        "idMm": 610,
        "odMm": 768
      },
      {
        "nps": 0.5,
        "rating": 600,
        "sourcePage": 41,
        "idMm": 21,
        "odMm": 54
      },
      {
        "nps": 0.75,
        "rating": 600,
        "sourcePage": 41,
        "idMm": 27,
        "odMm": 67
      },
      {
        "nps": 1,
        "rating": 600,
        "sourcePage": 41,
        "idMm": 33,
        "odMm": 73
      },
      {
        "nps": 1.25,
        "rating": 600,
        "sourcePage": 41,
        "idMm": 42,
        "odMm": 83
      },
      {
        "nps": 1.5,
        "rating": 600,
        "sourcePage": 41,
        "idMm": 49,
        "odMm": 95
      },
      {
        "nps": 2,
        "rating": 600,
        "sourcePage": 41,
        "idMm": 60,
        "odMm": 111
      },
      {
        "nps": 2.5,
        "rating": 600,
        "sourcePage": 41,
        "idMm": 73,
        "odMm": 130
      },
      {
        "nps": 3,
        "rating": 600,
        "sourcePage": 41,
        "idMm": 89,
        "odMm": 149
      },
      {
        "nps": 3.5,
        "rating": 600,
        "sourcePage": 41,
        "idMm": 102,
        "odMm": 162
      },
      {
        "nps": 4,
        "rating": 600,
        "sourcePage": 41,
        "idMm": 114,
        "odMm": 194
      },
      {
        "nps": 5,
        "rating": 600,
        "sourcePage": 41,
        "idMm": 141,
        "odMm": 241
      },
      {
        "nps": 6,
        "rating": 600,
        "sourcePage": 41,
        "idMm": 168,
        "odMm": 267
      },
      {
        "nps": 8,
        "rating": 600,
        "sourcePage": 41,
        "idMm": 219,
        "odMm": 321
      },
      {
        "nps": 10,
        "rating": 600,
        "sourcePage": 41,
        "idMm": 273,
        "odMm": 400
      },
      {
        "nps": 12,
        "rating": 600,
        "sourcePage": 41,
        "idMm": 324,
        "odMm": 457
      },
      {
        "nps": 14,
        "rating": 600,
        "sourcePage": 41,
        "idMm": 356,
        "odMm": 492
      },
      {
        "nps": 16,
        "rating": 600,
        "sourcePage": 41,
        "idMm": 406,
        "odMm": 565
      },
      {
        "nps": 18,
        "rating": 600,
        "sourcePage": 41,
        "idMm": 457,
        "odMm": 613
      },
      {
        "nps": 20,
        "rating": 600,
        "sourcePage": 41,
        "idMm": 508,
        "odMm": 683
      },
      {
        "nps": 24,
        "rating": 600,
        "sourcePage": 41,
        "idMm": 610,
        "odMm": 791
      },
      {
        "nps": 0.5,
        "rating": 900,
        "sourcePage": 41,
        "idMm": 21,
        "odMm": 64
      },
      {
        "nps": 0.75,
        "rating": 900,
        "sourcePage": 41,
        "idMm": 27,
        "odMm": 70
      },
      {
        "nps": 1,
        "rating": 900,
        "sourcePage": 41,
        "idMm": 33,
        "odMm": 79
      },
      {
        "nps": 1.25,
        "rating": 900,
        "sourcePage": 41,
        "idMm": 42,
        "odMm": 89
      },
      {
        "nps": 1.5,
        "rating": 900,
        "sourcePage": 41,
        "idMm": 49,
        "odMm": 99
      },
      {
        "nps": 2,
        "rating": 900,
        "sourcePage": 41,
        "idMm": 60,
        "odMm": 143
      },
      {
        "nps": 2.5,
        "rating": 900,
        "sourcePage": 41,
        "idMm": 73,
        "odMm": 165
      },
      {
        "nps": 3,
        "rating": 900,
        "sourcePage": 41,
        "idMm": 89,
        "odMm": 168
      },
      {
        "nps": 4,
        "rating": 900,
        "sourcePage": 41,
        "idMm": 114,
        "odMm": 206
      },
      {
        "nps": 5,
        "rating": 900,
        "sourcePage": 41,
        "idMm": 141,
        "odMm": 248
      },
      {
        "nps": 6,
        "rating": 900,
        "sourcePage": 41,
        "idMm": 168,
        "odMm": 289
      },
      {
        "nps": 8,
        "rating": 900,
        "sourcePage": 41,
        "idMm": 219,
        "odMm": 359
      },
      {
        "nps": 10,
        "rating": 900,
        "sourcePage": 41,
        "idMm": 273,
        "odMm": 435
      },
      {
        "nps": 12,
        "rating": 900,
        "sourcePage": 41,
        "idMm": 324,
        "odMm": 498
      },
      {
        "nps": 14,
        "rating": 900,
        "sourcePage": 41,
        "idMm": 356,
        "odMm": 521
      },
      {
        "nps": 16,
        "rating": 900,
        "sourcePage": 41,
        "idMm": 406,
        "odMm": 575
      },
      {
        "nps": 18,
        "rating": 900,
        "sourcePage": 41,
        "idMm": 457,
        "odMm": 638
      },
      {
        "nps": 20,
        "rating": 900,
        "sourcePage": 41,
        "idMm": 508,
        "odMm": 699
      },
      {
        "nps": 24,
        "rating": 900,
        "sourcePage": 41,
        "idMm": 610,
        "odMm": 838
      }
    ],
    "fullFace": [
      {
        "nps": 0.5,
        "rating": 150,
        "sourcePage": 42,
        "idMm": 21,
        "odMm": 89,
        "holeCount": 4,
        "holeDiameterMm": 15.748,
        "boltCircleMm": 60.3
      },
      {
        "nps": 0.75,
        "rating": 150,
        "sourcePage": 42,
        "idMm": 27,
        "odMm": 99,
        "holeCount": 4,
        "holeDiameterMm": 15.748,
        "boltCircleMm": 69.9
      },
      {
        "nps": 1,
        "rating": 150,
        "sourcePage": 42,
        "idMm": 33,
        "odMm": 108,
        "holeCount": 4,
        "holeDiameterMm": 15.748,
        "boltCircleMm": 79.4
      },
      {
        "nps": 1.25,
        "rating": 150,
        "sourcePage": 42,
        "idMm": 42,
        "odMm": 118,
        "holeCount": 4,
        "holeDiameterMm": 15.748,
        "boltCircleMm": 88.9
      },
      {
        "nps": 1.5,
        "rating": 150,
        "sourcePage": 42,
        "idMm": 49,
        "odMm": 127,
        "holeCount": 4,
        "holeDiameterMm": 15.748,
        "boltCircleMm": 98.4
      },
      {
        "nps": 2,
        "rating": 150,
        "sourcePage": 42,
        "idMm": 60,
        "odMm": 152,
        "holeCount": 4,
        "holeDiameterMm": 19.049999999999997,
        "boltCircleMm": 120.7
      },
      {
        "nps": 2.5,
        "rating": 150,
        "sourcePage": 42,
        "idMm": 73,
        "odMm": 178,
        "holeCount": 4,
        "holeDiameterMm": 19.049999999999997,
        "boltCircleMm": 139.7
      },
      {
        "nps": 3,
        "rating": 150,
        "sourcePage": 42,
        "idMm": 89,
        "odMm": 191,
        "holeCount": 4,
        "holeDiameterMm": 19.049999999999997,
        "boltCircleMm": 152.4
      },
      {
        "nps": 3.5,
        "rating": 150,
        "sourcePage": 42,
        "idMm": 102,
        "odMm": 216,
        "holeCount": 8,
        "holeDiameterMm": 19.049999999999997,
        "boltCircleMm": 177.8
      },
      {
        "nps": 4,
        "rating": 150,
        "sourcePage": 42,
        "idMm": 114,
        "odMm": 229,
        "holeCount": 8,
        "holeDiameterMm": 19.049999999999997,
        "boltCircleMm": 190.5
      },
      {
        "nps": 5,
        "rating": 150,
        "sourcePage": 42,
        "idMm": 141,
        "odMm": 254,
        "holeCount": 8,
        "holeDiameterMm": 22.352,
        "boltCircleMm": 215.9
      },
      {
        "nps": 6,
        "rating": 150,
        "sourcePage": 42,
        "idMm": 168,
        "odMm": 279,
        "holeCount": 8,
        "holeDiameterMm": 22.352,
        "boltCircleMm": 241.3
      },
      {
        "nps": 8,
        "rating": 150,
        "sourcePage": 42,
        "idMm": 219,
        "odMm": 343,
        "holeCount": 8,
        "holeDiameterMm": 22.352,
        "boltCircleMm": 298.5
      },
      {
        "nps": 10,
        "rating": 150,
        "sourcePage": 42,
        "idMm": 273,
        "odMm": 406,
        "holeCount": 12,
        "holeDiameterMm": 25.4,
        "boltCircleMm": 362
      },
      {
        "nps": 12,
        "rating": 150,
        "sourcePage": 42,
        "idMm": 324,
        "odMm": 483,
        "holeCount": 12,
        "holeDiameterMm": 25.4,
        "boltCircleMm": 431.8
      },
      {
        "nps": 14,
        "rating": 150,
        "sourcePage": 42,
        "idMm": 356,
        "odMm": 533,
        "holeCount": 12,
        "holeDiameterMm": 28.448,
        "boltCircleMm": 476.3
      },
      {
        "nps": 16,
        "rating": 150,
        "sourcePage": 42,
        "idMm": 406,
        "odMm": 597,
        "holeCount": 16,
        "holeDiameterMm": 28.448,
        "boltCircleMm": 539.8
      },
      {
        "nps": 18,
        "rating": 150,
        "sourcePage": 42,
        "idMm": 457,
        "odMm": 635,
        "holeCount": 16,
        "holeDiameterMm": 31.75,
        "boltCircleMm": 577.9
      },
      {
        "nps": 20,
        "rating": 150,
        "sourcePage": 42,
        "idMm": 508,
        "odMm": 699,
        "holeCount": 20,
        "holeDiameterMm": 31.75,
        "boltCircleMm": 635
      },
      {
        "nps": 24,
        "rating": 150,
        "sourcePage": 42,
        "idMm": 610,
        "odMm": 813,
        "holeCount": 20,
        "holeDiameterMm": 35.05199999999999,
        "boltCircleMm": 749.3
      },
      {
        "nps": 0.5,
        "rating": 300,
        "sourcePage": 42,
        "idMm": 21,
        "odMm": 95,
        "holeCount": 4,
        "holeDiameterMm": 16.002,
        "boltCircleMm": 66.8
      },
      {
        "nps": 0.75,
        "rating": 300,
        "sourcePage": 42,
        "idMm": 27,
        "odMm": 117,
        "holeCount": 4,
        "holeDiameterMm": 19.049999999999997,
        "boltCircleMm": 82.6
      },
      {
        "nps": 1,
        "rating": 300,
        "sourcePage": 42,
        "idMm": 33,
        "odMm": 124,
        "holeCount": 4,
        "holeDiameterMm": 19.049999999999997,
        "boltCircleMm": 88.9
      },
      {
        "nps": 1.25,
        "rating": 300,
        "sourcePage": 42,
        "idMm": 42,
        "odMm": 133,
        "holeCount": 4,
        "holeDiameterMm": 19.049999999999997,
        "boltCircleMm": 98.4
      },
      {
        "nps": 1.5,
        "rating": 300,
        "sourcePage": 42,
        "idMm": 49,
        "odMm": 155,
        "holeCount": 4,
        "holeDiameterMm": 22.352,
        "boltCircleMm": 114.3
      },
      {
        "nps": 2,
        "rating": 300,
        "sourcePage": 42,
        "idMm": 60,
        "odMm": 165,
        "holeCount": 8,
        "holeDiameterMm": 19.049999999999997,
        "boltCircleMm": 127
      },
      {
        "nps": 2.5,
        "rating": 300,
        "sourcePage": 42,
        "idMm": 73,
        "odMm": 191,
        "holeCount": 8,
        "holeDiameterMm": 22.352,
        "boltCircleMm": 149.2
      },
      {
        "nps": 3,
        "rating": 300,
        "sourcePage": 42,
        "idMm": 89,
        "odMm": 210,
        "holeCount": 8,
        "holeDiameterMm": 22.352,
        "boltCircleMm": 168.3
      },
      {
        "nps": 3.5,
        "rating": 300,
        "sourcePage": 42,
        "idMm": 102,
        "odMm": 229,
        "holeCount": 8,
        "holeDiameterMm": 22.352,
        "boltCircleMm": 184.2
      },
      {
        "nps": 4,
        "rating": 300,
        "sourcePage": 42,
        "idMm": 114,
        "odMm": 254,
        "holeCount": 8,
        "holeDiameterMm": 22.352,
        "boltCircleMm": 200
      },
      {
        "nps": 5,
        "rating": 300,
        "sourcePage": 42,
        "idMm": 141,
        "odMm": 279,
        "holeCount": 8,
        "holeDiameterMm": 22.352,
        "boltCircleMm": 235
      },
      {
        "nps": 6,
        "rating": 300,
        "sourcePage": 42,
        "idMm": 168,
        "odMm": 318,
        "holeCount": 12,
        "holeDiameterMm": 22.352,
        "boltCircleMm": 269.9
      },
      {
        "nps": 8,
        "rating": 300,
        "sourcePage": 42,
        "idMm": 219,
        "odMm": 381,
        "holeCount": 12,
        "holeDiameterMm": 25.4,
        "boltCircleMm": 330.2
      },
      {
        "nps": 10,
        "rating": 300,
        "sourcePage": 42,
        "idMm": 273,
        "odMm": 445,
        "holeCount": 16,
        "holeDiameterMm": 28.701999999999995,
        "boltCircleMm": 387.4
      },
      {
        "nps": 12,
        "rating": 300,
        "sourcePage": 42,
        "idMm": 324,
        "odMm": 521,
        "holeCount": 16,
        "holeDiameterMm": 31.75,
        "boltCircleMm": 450.9
      },
      {
        "nps": 14,
        "rating": 300,
        "sourcePage": 42,
        "idMm": 356,
        "odMm": 584,
        "holeCount": 20,
        "holeDiameterMm": 31.75,
        "boltCircleMm": 514.4
      },
      {
        "nps": 16,
        "rating": 300,
        "sourcePage": 42,
        "idMm": 406,
        "odMm": 648,
        "holeCount": 20,
        "holeDiameterMm": 35.05199999999999,
        "boltCircleMm": 571.5
      },
      {
        "nps": 18,
        "rating": 300,
        "sourcePage": 42,
        "idMm": 457,
        "odMm": 711,
        "holeCount": 24,
        "holeDiameterMm": 35.05199999999999,
        "boltCircleMm": 628.7
      },
      {
        "nps": 20,
        "rating": 300,
        "sourcePage": 42,
        "idMm": 508,
        "odMm": 775,
        "holeCount": 24,
        "holeDiameterMm": 35.05199999999999,
        "boltCircleMm": 685.8
      },
      {
        "nps": 24,
        "rating": 300,
        "sourcePage": 42,
        "idMm": 610,
        "odMm": 914,
        "holeCount": 24,
        "holeDiameterMm": 41.401999999999994,
        "boltCircleMm": 812.8
      },
      {
        "nps": 0.5,
        "rating": 400,
        "sourcePage": 43,
        "idMm": 21,
        "odMm": 95,
        "holeCount": 4,
        "holeDiameterMm": 16.002,
        "boltCircleMm": 66.5
      },
      {
        "nps": 0.75,
        "rating": 400,
        "sourcePage": 43,
        "idMm": 27,
        "odMm": 117,
        "holeCount": 4,
        "holeDiameterMm": 19.049999999999997,
        "boltCircleMm": 82.6
      },
      {
        "nps": 1,
        "rating": 400,
        "sourcePage": 43,
        "idMm": 33,
        "odMm": 124,
        "holeCount": 4,
        "holeDiameterMm": 19.049999999999997,
        "boltCircleMm": 88.9
      },
      {
        "nps": 1.25,
        "rating": 400,
        "sourcePage": 43,
        "idMm": 42,
        "odMm": 133,
        "holeCount": 4,
        "holeDiameterMm": 19.049999999999997,
        "boltCircleMm": 98.4
      },
      {
        "nps": 1.5,
        "rating": 400,
        "sourcePage": 43,
        "idMm": 49,
        "odMm": 156,
        "holeCount": 4,
        "holeDiameterMm": 22.352,
        "boltCircleMm": 114.3
      },
      {
        "nps": 2,
        "rating": 400,
        "sourcePage": 43,
        "idMm": 60,
        "odMm": 165,
        "holeCount": 8,
        "holeDiameterMm": 19.049999999999997,
        "boltCircleMm": 127
      },
      {
        "nps": 2.5,
        "rating": 400,
        "sourcePage": 43,
        "idMm": 73,
        "odMm": 191,
        "holeCount": 8,
        "holeDiameterMm": 22.352,
        "boltCircleMm": 149.2
      },
      {
        "nps": 3,
        "rating": 400,
        "sourcePage": 43,
        "idMm": 89,
        "odMm": 210,
        "holeCount": 8,
        "holeDiameterMm": 22.352,
        "boltCircleMm": 168.3
      },
      {
        "nps": 3.5,
        "rating": 400,
        "sourcePage": 43,
        "idMm": 102,
        "odMm": 229,
        "holeCount": 8,
        "holeDiameterMm": 25.4,
        "boltCircleMm": 184.2
      },
      {
        "nps": 4,
        "rating": 400,
        "sourcePage": 43,
        "idMm": 114,
        "odMm": 254,
        "holeCount": 8,
        "holeDiameterMm": 25.4,
        "boltCircleMm": 200
      },
      {
        "nps": 5,
        "rating": 400,
        "sourcePage": 43,
        "idMm": 141,
        "odMm": 279,
        "holeCount": 8,
        "holeDiameterMm": 25.4,
        "boltCircleMm": 235
      },
      {
        "nps": 6,
        "rating": 400,
        "sourcePage": 43,
        "idMm": 168,
        "odMm": 318,
        "holeCount": 12,
        "holeDiameterMm": 25.4,
        "boltCircleMm": 269.9
      },
      {
        "nps": 8,
        "rating": 400,
        "sourcePage": 43,
        "idMm": 219,
        "odMm": 381,
        "holeCount": 12,
        "holeDiameterMm": 28.701999999999995,
        "boltCircleMm": 330.2
      },
      {
        "nps": 10,
        "rating": 400,
        "sourcePage": 43,
        "idMm": 273,
        "odMm": 445,
        "holeCount": 16,
        "holeDiameterMm": 31.75,
        "boltCircleMm": 387.4
      },
      {
        "nps": 12,
        "rating": 400,
        "sourcePage": 43,
        "idMm": 324,
        "odMm": 521,
        "holeCount": 16,
        "holeDiameterMm": 35.05199999999999,
        "boltCircleMm": 450.9
      },
      {
        "nps": 14,
        "rating": 400,
        "sourcePage": 43,
        "idMm": 356,
        "odMm": 584,
        "holeCount": 20,
        "holeDiameterMm": 35.05199999999999,
        "boltCircleMm": 514.4
      },
      {
        "nps": 16,
        "rating": 400,
        "sourcePage": 43,
        "idMm": 406,
        "odMm": 648,
        "holeCount": 20,
        "holeDiameterMm": 38.099999999999994,
        "boltCircleMm": 571.5
      },
      {
        "nps": 18,
        "rating": 400,
        "sourcePage": 43,
        "idMm": 457,
        "odMm": 711,
        "holeCount": 24,
        "holeDiameterMm": 38.099999999999994,
        "boltCircleMm": 628.7
      },
      {
        "nps": 20,
        "rating": 400,
        "sourcePage": 43,
        "idMm": 508,
        "odMm": 775,
        "holeCount": 24,
        "holeDiameterMm": 41.401999999999994,
        "boltCircleMm": 685.8
      },
      {
        "nps": 24,
        "rating": 400,
        "sourcePage": 43,
        "idMm": 610,
        "odMm": 914,
        "holeCount": 24,
        "holeDiameterMm": 47.751999999999995,
        "boltCircleMm": 812.8
      },
      {
        "nps": 0.5,
        "rating": 600,
        "sourcePage": 43,
        "idMm": 21,
        "odMm": 95,
        "holeCount": 4,
        "holeDiameterMm": 16.002,
        "boltCircleMm": 66.8
      },
      {
        "nps": 0.75,
        "rating": 600,
        "sourcePage": 43,
        "idMm": 27,
        "odMm": 117,
        "holeCount": 4,
        "holeDiameterMm": 19.049999999999997,
        "boltCircleMm": 82.6
      },
      {
        "nps": 1,
        "rating": 600,
        "sourcePage": 43,
        "idMm": 33,
        "odMm": 124,
        "holeCount": 4,
        "holeDiameterMm": 19.049999999999997,
        "boltCircleMm": 88.9
      },
      {
        "nps": 1.25,
        "rating": 600,
        "sourcePage": 43,
        "idMm": 42,
        "odMm": 133,
        "holeCount": 4,
        "holeDiameterMm": 19.049999999999997,
        "boltCircleMm": 98.4
      },
      {
        "nps": 1.5,
        "rating": 600,
        "sourcePage": 43,
        "idMm": 49,
        "odMm": 156,
        "holeCount": 4,
        "holeDiameterMm": 22.352,
        "boltCircleMm": 114.3
      },
      {
        "nps": 2,
        "rating": 600,
        "sourcePage": 43,
        "idMm": 60,
        "odMm": 165,
        "holeCount": 8,
        "holeDiameterMm": 19.049999999999997,
        "boltCircleMm": 127
      },
      {
        "nps": 2.5,
        "rating": 600,
        "sourcePage": 43,
        "idMm": 73,
        "odMm": 191,
        "holeCount": 8,
        "holeDiameterMm": 22.352,
        "boltCircleMm": 149.2
      },
      {
        "nps": 3,
        "rating": 600,
        "sourcePage": 43,
        "idMm": 89,
        "odMm": 210,
        "holeCount": 8,
        "holeDiameterMm": 22.352,
        "boltCircleMm": 168.3
      },
      {
        "nps": 3.5,
        "rating": 600,
        "sourcePage": 43,
        "idMm": 102,
        "odMm": 229,
        "holeCount": 8,
        "holeDiameterMm": 25.4,
        "boltCircleMm": 184.2
      },
      {
        "nps": 4,
        "rating": 600,
        "sourcePage": 43,
        "idMm": 114,
        "odMm": 273,
        "holeCount": 8,
        "holeDiameterMm": 25.4,
        "boltCircleMm": 215.9
      },
      {
        "nps": 5,
        "rating": 600,
        "sourcePage": 43,
        "idMm": 141,
        "odMm": 330,
        "holeCount": 8,
        "holeDiameterMm": 28.701999999999995,
        "boltCircleMm": 266.7
      },
      {
        "nps": 6,
        "rating": 600,
        "sourcePage": 43,
        "idMm": 168,
        "odMm": 356,
        "holeCount": 12,
        "holeDiameterMm": 28.701999999999995,
        "boltCircleMm": 292.1
      },
      {
        "nps": 8,
        "rating": 600,
        "sourcePage": 43,
        "idMm": 219,
        "odMm": 419,
        "holeCount": 12,
        "holeDiameterMm": 31.75,
        "boltCircleMm": 349.3
      },
      {
        "nps": 10,
        "rating": 600,
        "sourcePage": 43,
        "idMm": 273,
        "odMm": 508,
        "holeCount": 16,
        "holeDiameterMm": 35.05199999999999,
        "boltCircleMm": 431.8
      },
      {
        "nps": 12,
        "rating": 600,
        "sourcePage": 43,
        "idMm": 324,
        "odMm": 559,
        "holeCount": 20,
        "holeDiameterMm": 35.05199999999999,
        "boltCircleMm": 489
      },
      {
        "nps": 14,
        "rating": 600,
        "sourcePage": 43,
        "idMm": 356,
        "odMm": 603,
        "holeCount": 20,
        "holeDiameterMm": 38.099999999999994,
        "boltCircleMm": 527.1
      },
      {
        "nps": 16,
        "rating": 600,
        "sourcePage": 43,
        "idMm": 406,
        "odMm": 686,
        "holeCount": 20,
        "holeDiameterMm": 41.401999999999994,
        "boltCircleMm": 603.3
      },
      {
        "nps": 18,
        "rating": 600,
        "sourcePage": 43,
        "idMm": 457,
        "odMm": 743,
        "holeCount": 20,
        "holeDiameterMm": 44.449999999999996,
        "boltCircleMm": 654.1
      },
      {
        "nps": 20,
        "rating": 600,
        "sourcePage": 43,
        "idMm": 508,
        "odMm": 813,
        "holeCount": 24,
        "holeDiameterMm": 44.449999999999996,
        "boltCircleMm": 723.9
      },
      {
        "nps": 24,
        "rating": 600,
        "sourcePage": 43,
        "idMm": 610,
        "odMm": 940,
        "holeCount": 24,
        "holeDiameterMm": 50.8,
        "boltCircleMm": 838.2
      }
    ],
    "rtjMappings": [
      {
        "nps": 0.5,
        "rating": 300,
        "ring": "R-11",
        "sourcePage": 117
      },
      {
        "nps": 0.5,
        "rating": 400,
        "ring": "R-11",
        "sourcePage": 117
      },
      {
        "nps": 0.5,
        "rating": 600,
        "ring": "R-11",
        "sourcePage": 117
      },
      {
        "nps": 0.5,
        "rating": 900,
        "ring": "R-12",
        "sourcePage": 117
      },
      {
        "nps": 0.5,
        "rating": 1500,
        "ring": "R-12",
        "sourcePage": 117
      },
      {
        "nps": 0.5,
        "rating": 2500,
        "ring": "R-13",
        "sourcePage": 117
      },
      {
        "nps": 0.75,
        "rating": 300,
        "ring": "R-13",
        "sourcePage": 117
      },
      {
        "nps": 0.75,
        "rating": 400,
        "ring": "R-13",
        "sourcePage": 117
      },
      {
        "nps": 0.75,
        "rating": 600,
        "ring": "R-13",
        "sourcePage": 117
      },
      {
        "nps": 0.75,
        "rating": 900,
        "ring": "R-14",
        "sourcePage": 117
      },
      {
        "nps": 0.75,
        "rating": 1500,
        "ring": "R-14",
        "sourcePage": 117
      },
      {
        "nps": 0.75,
        "rating": 2500,
        "ring": "R-16",
        "sourcePage": 117
      },
      {
        "nps": 1,
        "rating": 150,
        "ring": "R-15",
        "sourcePage": 117
      },
      {
        "nps": 1,
        "rating": 300,
        "ring": "R-16",
        "sourcePage": 117
      },
      {
        "nps": 1,
        "rating": 400,
        "ring": "R-16",
        "sourcePage": 117
      },
      {
        "nps": 1,
        "rating": 600,
        "ring": "R-16",
        "sourcePage": 117
      },
      {
        "nps": 1,
        "rating": 900,
        "ring": "R-16",
        "sourcePage": 117
      },
      {
        "nps": 1,
        "rating": 1500,
        "ring": "R-16",
        "sourcePage": 117
      },
      {
        "nps": 1,
        "rating": 2500,
        "ring": "R-18",
        "sourcePage": 117
      },
      {
        "nps": 1.25,
        "rating": 150,
        "ring": "R-17",
        "sourcePage": 117
      },
      {
        "nps": 1.25,
        "rating": 300,
        "ring": "R-18",
        "sourcePage": 117
      },
      {
        "nps": 1.25,
        "rating": 400,
        "ring": "R-18",
        "sourcePage": 117
      },
      {
        "nps": 1.25,
        "rating": 600,
        "ring": "R-18",
        "sourcePage": 117
      },
      {
        "nps": 1.25,
        "rating": 900,
        "ring": "R-18",
        "sourcePage": 117
      },
      {
        "nps": 1.25,
        "rating": 1500,
        "ring": "R-18",
        "sourcePage": 117
      },
      {
        "nps": 1.25,
        "rating": 2500,
        "ring": "R-21",
        "sourcePage": 117
      },
      {
        "nps": 1.5,
        "rating": 150,
        "ring": "R-19",
        "sourcePage": 117
      },
      {
        "nps": 1.5,
        "rating": 300,
        "ring": "R-20",
        "sourcePage": 117
      },
      {
        "nps": 1.5,
        "rating": 400,
        "ring": "R-20",
        "sourcePage": 117
      },
      {
        "nps": 1.5,
        "rating": 600,
        "ring": "R-20",
        "sourcePage": 117
      },
      {
        "nps": 1.5,
        "rating": 900,
        "ring": "R-20",
        "sourcePage": 117
      },
      {
        "nps": 1.5,
        "rating": 1500,
        "ring": "R-20",
        "sourcePage": 117
      },
      {
        "nps": 1.5,
        "rating": 2500,
        "ring": "R-23",
        "sourcePage": 117
      },
      {
        "nps": 2,
        "rating": 150,
        "ring": "R-22",
        "sourcePage": 117
      },
      {
        "nps": 2,
        "rating": 300,
        "ring": "R-23",
        "sourcePage": 117
      },
      {
        "nps": 2,
        "rating": 400,
        "ring": "R-23",
        "sourcePage": 117
      },
      {
        "nps": 2,
        "rating": 600,
        "ring": "R-23",
        "sourcePage": 117
      },
      {
        "nps": 2,
        "rating": 900,
        "ring": "R-24",
        "sourcePage": 117
      },
      {
        "nps": 2,
        "rating": 1500,
        "ring": "R-24",
        "sourcePage": 117
      },
      {
        "nps": 2,
        "rating": 2500,
        "ring": "R-26",
        "sourcePage": 117
      },
      {
        "nps": 2.5,
        "rating": 150,
        "ring": "R-25",
        "sourcePage": 117
      },
      {
        "nps": 2.5,
        "rating": 300,
        "ring": "R-26",
        "sourcePage": 117
      },
      {
        "nps": 2.5,
        "rating": 400,
        "ring": "R-26",
        "sourcePage": 117
      },
      {
        "nps": 2.5,
        "rating": 600,
        "ring": "R-26",
        "sourcePage": 117
      },
      {
        "nps": 2.5,
        "rating": 900,
        "ring": "R-27",
        "sourcePage": 117
      },
      {
        "nps": 2.5,
        "rating": 1500,
        "ring": "R-27",
        "sourcePage": 117
      },
      {
        "nps": 2.5,
        "rating": 2500,
        "ring": "R-28",
        "sourcePage": 117
      },
      {
        "nps": 3,
        "rating": 150,
        "ring": "R-29",
        "sourcePage": 117
      },
      {
        "nps": 3,
        "rating": 300,
        "ring": "R-31",
        "sourcePage": 117
      },
      {
        "nps": 3,
        "rating": 400,
        "ring": "R-31",
        "sourcePage": 117
      },
      {
        "nps": 3,
        "rating": 600,
        "ring": "R-31",
        "sourcePage": 117
      },
      {
        "nps": 3,
        "rating": 900,
        "ring": "R-31",
        "sourcePage": 117
      },
      {
        "nps": 3,
        "rating": 1500,
        "ring": "R-35",
        "sourcePage": 117
      },
      {
        "nps": 3,
        "rating": 2500,
        "ring": "R-32",
        "sourcePage": 117
      },
      {
        "nps": 4,
        "rating": 150,
        "ring": "R-36",
        "sourcePage": 117
      },
      {
        "nps": 4,
        "rating": 300,
        "ring": "R-37",
        "sourcePage": 117
      },
      {
        "nps": 4,
        "rating": 400,
        "ring": "R-37",
        "sourcePage": 117
      },
      {
        "nps": 4,
        "rating": 600,
        "ring": "R-37",
        "sourcePage": 117
      },
      {
        "nps": 4,
        "rating": 900,
        "ring": "R-37",
        "sourcePage": 117
      },
      {
        "nps": 4,
        "rating": 1500,
        "ring": "R-39",
        "sourcePage": 117
      },
      {
        "nps": 4,
        "rating": 2500,
        "ring": "R-38",
        "sourcePage": 117
      },
      {
        "nps": 5,
        "rating": 150,
        "ring": "R-40",
        "sourcePage": 117
      },
      {
        "nps": 5,
        "rating": 300,
        "ring": "R-41",
        "sourcePage": 117
      },
      {
        "nps": 5,
        "rating": 400,
        "ring": "R-41",
        "sourcePage": 117
      },
      {
        "nps": 5,
        "rating": 600,
        "ring": "R-41",
        "sourcePage": 117
      },
      {
        "nps": 5,
        "rating": 900,
        "ring": "R-41",
        "sourcePage": 117
      },
      {
        "nps": 5,
        "rating": 1500,
        "ring": "R-44",
        "sourcePage": 117
      },
      {
        "nps": 5,
        "rating": 2500,
        "ring": "R-42",
        "sourcePage": 117
      },
      {
        "nps": 6,
        "rating": 150,
        "ring": "R-43",
        "sourcePage": 117
      },
      {
        "nps": 6,
        "rating": 300,
        "ring": "R-45",
        "sourcePage": 117
      },
      {
        "nps": 6,
        "rating": 400,
        "ring": "R-45",
        "sourcePage": 117
      },
      {
        "nps": 6,
        "rating": 600,
        "ring": "R-45",
        "sourcePage": 117
      },
      {
        "nps": 6,
        "rating": 900,
        "ring": "R-45",
        "sourcePage": 117
      },
      {
        "nps": 6,
        "rating": 1500,
        "ring": "R-46",
        "sourcePage": 117
      },
      {
        "nps": 6,
        "rating": 2500,
        "ring": "R-47",
        "sourcePage": 117
      },
      {
        "nps": 8,
        "rating": 150,
        "ring": "R-48",
        "sourcePage": 117
      },
      {
        "nps": 8,
        "rating": 300,
        "ring": "R-49",
        "sourcePage": 117
      },
      {
        "nps": 8,
        "rating": 400,
        "ring": "R-49",
        "sourcePage": 117
      },
      {
        "nps": 8,
        "rating": 600,
        "ring": "R-49",
        "sourcePage": 117
      },
      {
        "nps": 8,
        "rating": 900,
        "ring": "R-49",
        "sourcePage": 117
      },
      {
        "nps": 8,
        "rating": 1500,
        "ring": "R-50",
        "sourcePage": 117
      },
      {
        "nps": 8,
        "rating": 2500,
        "ring": "R-51",
        "sourcePage": 117
      },
      {
        "nps": 10,
        "rating": 150,
        "ring": "R-52",
        "sourcePage": 117
      },
      {
        "nps": 10,
        "rating": 300,
        "ring": "R-53",
        "sourcePage": 117
      },
      {
        "nps": 10,
        "rating": 400,
        "ring": "R-53",
        "sourcePage": 117
      },
      {
        "nps": 10,
        "rating": 600,
        "ring": "R-53",
        "sourcePage": 117
      },
      {
        "nps": 10,
        "rating": 900,
        "ring": "R-53",
        "sourcePage": 117
      },
      {
        "nps": 10,
        "rating": 1500,
        "ring": "R-54",
        "sourcePage": 117
      },
      {
        "nps": 10,
        "rating": 2500,
        "ring": "R-55",
        "sourcePage": 117
      },
      {
        "nps": 12,
        "rating": 150,
        "ring": "R-56",
        "sourcePage": 117
      },
      {
        "nps": 12,
        "rating": 300,
        "ring": "R-57",
        "sourcePage": 117
      },
      {
        "nps": 12,
        "rating": 400,
        "ring": "R-57",
        "sourcePage": 117
      },
      {
        "nps": 12,
        "rating": 600,
        "ring": "R-57",
        "sourcePage": 117
      },
      {
        "nps": 12,
        "rating": 900,
        "ring": "R-57",
        "sourcePage": 117
      },
      {
        "nps": 12,
        "rating": 1500,
        "ring": "R-58",
        "sourcePage": 117
      },
      {
        "nps": 12,
        "rating": 2500,
        "ring": "R-60",
        "sourcePage": 117
      },
      {
        "nps": 14,
        "rating": 150,
        "ring": "R-59",
        "sourcePage": 117
      },
      {
        "nps": 14,
        "rating": 300,
        "ring": "R-61",
        "sourcePage": 117
      },
      {
        "nps": 14,
        "rating": 400,
        "ring": "R-61",
        "sourcePage": 117
      },
      {
        "nps": 14,
        "rating": 600,
        "ring": "R-61",
        "sourcePage": 117
      },
      {
        "nps": 14,
        "rating": 900,
        "ring": "R-62",
        "sourcePage": 117
      },
      {
        "nps": 14,
        "rating": 1500,
        "ring": "R-63",
        "sourcePage": 117
      },
      {
        "nps": 16,
        "rating": 150,
        "ring": "R-64",
        "sourcePage": 117
      },
      {
        "nps": 16,
        "rating": 300,
        "ring": "R-65",
        "sourcePage": 117
      },
      {
        "nps": 16,
        "rating": 400,
        "ring": "R-65",
        "sourcePage": 117
      },
      {
        "nps": 16,
        "rating": 600,
        "ring": "R-65",
        "sourcePage": 117
      },
      {
        "nps": 16,
        "rating": 900,
        "ring": "R-66",
        "sourcePage": 117
      },
      {
        "nps": 16,
        "rating": 1500,
        "ring": "R-67",
        "sourcePage": 117
      },
      {
        "nps": 18,
        "rating": 150,
        "ring": "R-68",
        "sourcePage": 117
      },
      {
        "nps": 18,
        "rating": 300,
        "ring": "R-69",
        "sourcePage": 117
      },
      {
        "nps": 18,
        "rating": 400,
        "ring": "R-69",
        "sourcePage": 117
      },
      {
        "nps": 18,
        "rating": 600,
        "ring": "R-69",
        "sourcePage": 117
      },
      {
        "nps": 18,
        "rating": 900,
        "ring": "R-70",
        "sourcePage": 117
      },
      {
        "nps": 18,
        "rating": 1500,
        "ring": "R-71",
        "sourcePage": 117
      },
      {
        "nps": 20,
        "rating": 150,
        "ring": "R-72",
        "sourcePage": 117
      },
      {
        "nps": 20,
        "rating": 300,
        "ring": "R-73",
        "sourcePage": 117
      },
      {
        "nps": 20,
        "rating": 400,
        "ring": "R-73",
        "sourcePage": 117
      },
      {
        "nps": 20,
        "rating": 600,
        "ring": "R-73",
        "sourcePage": 117
      },
      {
        "nps": 20,
        "rating": 900,
        "ring": "R-74",
        "sourcePage": 117
      },
      {
        "nps": 20,
        "rating": 1500,
        "ring": "R-75",
        "sourcePage": 117
      },
      {
        "nps": 22,
        "rating": 150,
        "ring": "R-80",
        "sourcePage": 117
      },
      {
        "nps": 22,
        "rating": 300,
        "ring": "R-81",
        "sourcePage": 117
      },
      {
        "nps": 22,
        "rating": 400,
        "ring": "R-81",
        "sourcePage": 117
      },
      {
        "nps": 22,
        "rating": 600,
        "ring": "R-81",
        "sourcePage": 117
      },
      {
        "nps": 24,
        "rating": 150,
        "ring": "R-76",
        "sourcePage": 117
      },
      {
        "nps": 24,
        "rating": 300,
        "ring": "R-77",
        "sourcePage": 117
      },
      {
        "nps": 24,
        "rating": 400,
        "ring": "R-77",
        "sourcePage": 117
      },
      {
        "nps": 24,
        "rating": 600,
        "ring": "R-77",
        "sourcePage": 117
      },
      {
        "nps": 24,
        "rating": 900,
        "ring": "R-78",
        "sourcePage": 117
      },
      {
        "nps": 24,
        "rating": 1500,
        "ring": "R-79",
        "sourcePage": 117
      },
      {
        "nps": 26,
        "rating": 300,
        "ring": "R-93",
        "sourcePage": 117
      },
      {
        "nps": 26,
        "rating": 400,
        "ring": "R-93",
        "sourcePage": 117
      },
      {
        "nps": 26,
        "rating": 600,
        "ring": "R-93",
        "sourcePage": 117
      },
      {
        "nps": 26,
        "rating": 900,
        "ring": "R-100",
        "sourcePage": 117
      },
      {
        "nps": 28,
        "rating": 300,
        "ring": "R-94",
        "sourcePage": 117
      },
      {
        "nps": 28,
        "rating": 400,
        "ring": "R-94",
        "sourcePage": 117
      },
      {
        "nps": 28,
        "rating": 600,
        "ring": "R-94",
        "sourcePage": 117
      },
      {
        "nps": 28,
        "rating": 900,
        "ring": "R-101",
        "sourcePage": 117
      },
      {
        "nps": 30,
        "rating": 300,
        "ring": "R-95",
        "sourcePage": 117
      },
      {
        "nps": 30,
        "rating": 400,
        "ring": "R-95",
        "sourcePage": 117
      },
      {
        "nps": 30,
        "rating": 600,
        "ring": "R-95",
        "sourcePage": 117
      },
      {
        "nps": 30,
        "rating": 900,
        "ring": "R-102",
        "sourcePage": 117
      },
      {
        "nps": 32,
        "rating": 300,
        "ring": "R-96",
        "sourcePage": 117
      },
      {
        "nps": 32,
        "rating": 400,
        "ring": "R-96",
        "sourcePage": 117
      },
      {
        "nps": 32,
        "rating": 600,
        "ring": "R-96",
        "sourcePage": 117
      },
      {
        "nps": 32,
        "rating": 900,
        "ring": "R-103",
        "sourcePage": 117
      },
      {
        "nps": 34,
        "rating": 300,
        "ring": "R-97",
        "sourcePage": 117
      },
      {
        "nps": 34,
        "rating": 400,
        "ring": "R-97",
        "sourcePage": 117
      },
      {
        "nps": 34,
        "rating": 600,
        "ring": "R-97",
        "sourcePage": 117
      },
      {
        "nps": 34,
        "rating": 900,
        "ring": "R-104",
        "sourcePage": 117
      },
      {
        "nps": 36,
        "rating": 300,
        "ring": "R-98",
        "sourcePage": 117
      },
      {
        "nps": 36,
        "rating": 400,
        "ring": "R-98",
        "sourcePage": 117
      },
      {
        "nps": 36,
        "rating": 600,
        "ring": "R-98",
        "sourcePage": 117
      },
      {
        "nps": 36,
        "rating": 900,
        "ring": "R-105",
        "sourcePage": 117
      }
    ],
    "rtjRings": [
      {
        "ring": "R-11",
        "pitchMm": 34.14,
        "widthMm": 6.35,
        "heightMm": 9.7,
        "flatMm": 4.32,
        "sourcePage": 118
      },
      {
        "ring": "R-12",
        "pitchMm": 39.7,
        "widthMm": 7.95,
        "heightMm": 12.7,
        "flatMm": 5.23,
        "sourcePage": 118
      },
      {
        "ring": "R-13",
        "pitchMm": 42.88,
        "widthMm": 7.95,
        "heightMm": 12.7,
        "flatMm": 5.23,
        "sourcePage": 118
      },
      {
        "ring": "R-14",
        "pitchMm": 44.45,
        "widthMm": 7.95,
        "heightMm": 12.7,
        "flatMm": 5.23,
        "sourcePage": 118
      },
      {
        "ring": "R-15",
        "pitchMm": 47.63,
        "widthMm": 7.95,
        "heightMm": 12.7,
        "flatMm": 5.23,
        "sourcePage": 118
      },
      {
        "ring": "R-16",
        "pitchMm": 50.8,
        "widthMm": 7.95,
        "heightMm": 12.7,
        "flatMm": 5.23,
        "sourcePage": 118
      },
      {
        "ring": "R-17",
        "pitchMm": 57.15,
        "widthMm": 7.95,
        "heightMm": 12.7,
        "flatMm": 5.23,
        "sourcePage": 118
      },
      {
        "ring": "R-18",
        "pitchMm": 60.33,
        "widthMm": 7.95,
        "heightMm": 12.7,
        "flatMm": 5.23,
        "sourcePage": 118
      },
      {
        "ring": "R-19",
        "pitchMm": 65.1,
        "widthMm": 7.95,
        "heightMm": 12.7,
        "flatMm": 5.23,
        "sourcePage": 118
      },
      {
        "ring": "R-20",
        "pitchMm": 68.28,
        "widthMm": 7.95,
        "heightMm": 12.7,
        "flatMm": 5.23,
        "sourcePage": 118
      },
      {
        "ring": "R-21",
        "pitchMm": 72.24,
        "widthMm": 11.13,
        "heightMm": 16,
        "flatMm": 7.75,
        "sourcePage": 118
      },
      {
        "ring": "R-22",
        "pitchMm": 82.55,
        "widthMm": 7.95,
        "heightMm": 12.7,
        "flatMm": 5.23,
        "sourcePage": 118
      },
      {
        "ring": "R-23",
        "pitchMm": 82.55,
        "widthMm": 11.13,
        "heightMm": 16,
        "flatMm": 7.75,
        "sourcePage": 118
      },
      {
        "ring": "R-24",
        "pitchMm": 95.25,
        "widthMm": 11.13,
        "heightMm": 16,
        "flatMm": 7.75,
        "sourcePage": 118
      },
      {
        "ring": "R-25",
        "pitchMm": 101.6,
        "widthMm": 7.95,
        "heightMm": 12.7,
        "flatMm": 5.23,
        "sourcePage": 118
      },
      {
        "ring": "R-26",
        "pitchMm": 101.6,
        "widthMm": 11.13,
        "heightMm": 16,
        "flatMm": 7.75,
        "sourcePage": 118
      },
      {
        "ring": "R-27",
        "pitchMm": 107.95,
        "widthMm": 11.13,
        "heightMm": 16,
        "flatMm": 7.75,
        "sourcePage": 118
      },
      {
        "ring": "R-28",
        "pitchMm": 111.13,
        "widthMm": 12.7,
        "heightMm": 17.5,
        "flatMm": 8.66,
        "sourcePage": 118
      },
      {
        "ring": "R-29",
        "pitchMm": 114.3,
        "widthMm": 7.95,
        "heightMm": 12.7,
        "flatMm": 5.23,
        "sourcePage": 118
      },
      {
        "ring": "R-30",
        "pitchMm": 117.48,
        "widthMm": 11.13,
        "heightMm": 16,
        "flatMm": 7.75,
        "sourcePage": 118
      },
      {
        "ring": "R-31",
        "pitchMm": 123.83,
        "widthMm": 11.13,
        "heightMm": 16,
        "flatMm": 7.75,
        "sourcePage": 118
      },
      {
        "ring": "R-32",
        "pitchMm": 127,
        "widthMm": 12.7,
        "heightMm": 17.5,
        "flatMm": 8.66,
        "sourcePage": 118
      },
      {
        "ring": "R-33",
        "pitchMm": 131.78,
        "widthMm": 7.95,
        "heightMm": 12.7,
        "flatMm": 5.23,
        "sourcePage": 118
      },
      {
        "ring": "R-34",
        "pitchMm": 131.78,
        "widthMm": 11.13,
        "heightMm": 16,
        "flatMm": 7.75,
        "sourcePage": 118
      },
      {
        "ring": "R-35",
        "pitchMm": 136.53,
        "widthMm": 11.13,
        "heightMm": 16,
        "flatMm": 7.75,
        "sourcePage": 118
      },
      {
        "ring": "R-36",
        "pitchMm": 149.23,
        "widthMm": 7.95,
        "heightMm": 12.7,
        "flatMm": 5.23,
        "sourcePage": 118
      },
      {
        "ring": "R-37",
        "pitchMm": 149.23,
        "widthMm": 11.13,
        "heightMm": 16,
        "flatMm": 7.75,
        "sourcePage": 118
      },
      {
        "ring": "R-38",
        "pitchMm": 157.18,
        "widthMm": 15.88,
        "heightMm": 20.6,
        "flatMm": 10.49,
        "sourcePage": 118
      },
      {
        "ring": "R-39",
        "pitchMm": 161.93,
        "widthMm": 11.13,
        "heightMm": 16,
        "flatMm": 7.75,
        "sourcePage": 118
      },
      {
        "ring": "R-40",
        "pitchMm": 171.45,
        "widthMm": 7.95,
        "heightMm": 12.7,
        "flatMm": 5.23,
        "sourcePage": 118
      },
      {
        "ring": "R-41",
        "pitchMm": 180.98,
        "widthMm": 11.13,
        "heightMm": 16,
        "flatMm": 7.75,
        "sourcePage": 118
      },
      {
        "ring": "R-42",
        "pitchMm": 190.5,
        "widthMm": 19.05,
        "heightMm": 23.9,
        "flatMm": 12.32,
        "sourcePage": 118
      },
      {
        "ring": "R-43",
        "pitchMm": 193.68,
        "widthMm": 7.95,
        "heightMm": 12.7,
        "flatMm": 5.23,
        "sourcePage": 118
      },
      {
        "ring": "R-44",
        "pitchMm": 193.68,
        "widthMm": 11.13,
        "heightMm": 16,
        "flatMm": 7.75,
        "sourcePage": 118
      },
      {
        "ring": "R-45",
        "pitchMm": 211.15,
        "widthMm": 11.13,
        "heightMm": 16,
        "flatMm": 7.75,
        "sourcePage": 118
      },
      {
        "ring": "R-46",
        "pitchMm": 211.15,
        "widthMm": 12.7,
        "heightMm": 17.5,
        "flatMm": 8.66,
        "sourcePage": 118
      },
      {
        "ring": "R-47",
        "pitchMm": 228.6,
        "widthMm": 19.05,
        "heightMm": 23.9,
        "flatMm": 12.32,
        "sourcePage": 118
      },
      {
        "ring": "R-48",
        "pitchMm": 247.65,
        "widthMm": 7.95,
        "heightMm": 12.7,
        "flatMm": 5.23,
        "sourcePage": 118
      },
      {
        "ring": "R-49",
        "pitchMm": 269.88,
        "widthMm": 11.13,
        "heightMm": 16,
        "flatMm": 7.75,
        "sourcePage": 118
      },
      {
        "ring": "R-50",
        "pitchMm": 269.88,
        "widthMm": 15.88,
        "heightMm": 20.6,
        "flatMm": 10.49,
        "sourcePage": 118
      },
      {
        "ring": "R-51",
        "pitchMm": 279.4,
        "widthMm": 22.23,
        "heightMm": 26.9,
        "flatMm": 14.81,
        "sourcePage": 118
      },
      {
        "ring": "R-52",
        "pitchMm": 304.8,
        "widthMm": 7.95,
        "heightMm": 12.7,
        "flatMm": 5.23,
        "sourcePage": 118
      },
      {
        "ring": "R-53",
        "pitchMm": 323.85,
        "widthMm": 11.13,
        "heightMm": 16,
        "flatMm": 7.75,
        "sourcePage": 118
      },
      {
        "ring": "R-54",
        "pitchMm": 323.85,
        "widthMm": 15.88,
        "heightMm": 20.6,
        "flatMm": 10.49,
        "sourcePage": 118
      },
      {
        "ring": "R-55",
        "pitchMm": 342.9,
        "widthMm": 28.58,
        "heightMm": 35.1,
        "flatMm": 19.05,
        "sourcePage": 118
      },
      {
        "ring": "R-56",
        "pitchMm": 381,
        "widthMm": 7.95,
        "heightMm": 12.7,
        "flatMm": 5.23,
        "sourcePage": 118
      },
      {
        "ring": "R-57",
        "pitchMm": 381,
        "widthMm": 11.13,
        "heightMm": 16,
        "flatMm": 7.75,
        "sourcePage": 118
      },
      {
        "ring": "R-58",
        "pitchMm": 381,
        "widthMm": 22.23,
        "heightMm": 26.9,
        "flatMm": 14.81,
        "sourcePage": 119
      },
      {
        "ring": "R-59",
        "pitchMm": 396.88,
        "widthMm": 7.95,
        "heightMm": 12.7,
        "flatMm": 5.23,
        "sourcePage": 119
      },
      {
        "ring": "R-60",
        "pitchMm": 406.4,
        "widthMm": 31.75,
        "heightMm": 38.1,
        "flatMm": 22.33,
        "sourcePage": 119
      },
      {
        "ring": "R-61",
        "pitchMm": 419.1,
        "widthMm": 11.13,
        "heightMm": 16,
        "flatMm": 7.75,
        "sourcePage": 119
      },
      {
        "ring": "R-62",
        "pitchMm": 419.1,
        "widthMm": 15.88,
        "heightMm": 20.6,
        "flatMm": 10.49,
        "sourcePage": 119
      },
      {
        "ring": "R-63",
        "pitchMm": 419.1,
        "widthMm": 25.4,
        "heightMm": 31.8,
        "flatMm": 17.3,
        "sourcePage": 119
      },
      {
        "ring": "R-64",
        "pitchMm": 454.03,
        "widthMm": 7.95,
        "heightMm": 12.7,
        "flatMm": 5.23,
        "sourcePage": 119
      },
      {
        "ring": "R-65",
        "pitchMm": 469.9,
        "widthMm": 11.13,
        "heightMm": 16,
        "flatMm": 7.75,
        "sourcePage": 119
      },
      {
        "ring": "R-66",
        "pitchMm": 469.9,
        "widthMm": 15.88,
        "heightMm": 20.6,
        "flatMm": 10.49,
        "sourcePage": 119
      },
      {
        "ring": "R-67",
        "pitchMm": 469.9,
        "widthMm": 28.58,
        "heightMm": 35.1,
        "flatMm": 19.81,
        "sourcePage": 119
      },
      {
        "ring": "R-68",
        "pitchMm": 517.53,
        "widthMm": 7.95,
        "heightMm": 12.7,
        "flatMm": 5.23,
        "sourcePage": 119
      },
      {
        "ring": "R-69",
        "pitchMm": 533.4,
        "widthMm": 11.13,
        "heightMm": 16,
        "flatMm": 7.75,
        "sourcePage": 119
      },
      {
        "ring": "R-70",
        "pitchMm": 533.4,
        "widthMm": 19.05,
        "heightMm": 23.9,
        "flatMm": 12.32,
        "sourcePage": 119
      },
      {
        "ring": "R-71",
        "pitchMm": 533.4,
        "widthMm": 28.58,
        "heightMm": 35.1,
        "flatMm": 19.81,
        "sourcePage": 119
      },
      {
        "ring": "R-72",
        "pitchMm": 558.8,
        "widthMm": 7.95,
        "heightMm": 12.7,
        "flatMm": 5.23,
        "sourcePage": 119
      },
      {
        "ring": "R-73",
        "pitchMm": 584.2,
        "widthMm": 12.7,
        "heightMm": 17.5,
        "flatMm": 8.66,
        "sourcePage": 119
      },
      {
        "ring": "R-74",
        "pitchMm": 584.2,
        "widthMm": 19.05,
        "heightMm": 23.9,
        "flatMm": 12.32,
        "sourcePage": 119
      },
      {
        "ring": "R-75",
        "pitchMm": 584.2,
        "widthMm": 31.75,
        "heightMm": 38.1,
        "flatMm": 22.33,
        "sourcePage": 119
      },
      {
        "ring": "R-76",
        "pitchMm": 673.1,
        "widthMm": 7.95,
        "heightMm": 12.7,
        "flatMm": 5.23,
        "sourcePage": 119
      },
      {
        "ring": "R-77",
        "pitchMm": 692.15,
        "widthMm": 15.88,
        "heightMm": 20.6,
        "flatMm": 10.49,
        "sourcePage": 119
      },
      {
        "ring": "R-78",
        "pitchMm": 692.15,
        "widthMm": 25.4,
        "heightMm": 31.8,
        "flatMm": 17.3,
        "sourcePage": 119
      },
      {
        "ring": "R-79",
        "pitchMm": 692.15,
        "widthMm": 34.93,
        "heightMm": 41.4,
        "flatMm": 24.82,
        "sourcePage": 119
      },
      {
        "ring": "R-80",
        "pitchMm": 615.95,
        "widthMm": 7.95,
        "heightMm": 12.7,
        "flatMm": 5.23,
        "sourcePage": 119
      },
      {
        "ring": "R-81",
        "pitchMm": 635,
        "widthMm": 14.3,
        "heightMm": 19.1,
        "flatMm": 9.58,
        "sourcePage": 119
      },
      {
        "ring": "R-82",
        "pitchMm": 57.15,
        "widthMm": 11.13,
        "heightMm": 16,
        "flatMm": 7.75,
        "sourcePage": 119
      },
      {
        "ring": "R-84",
        "pitchMm": 63.5,
        "widthMm": 11.13,
        "heightMm": 16,
        "flatMm": 7.75,
        "sourcePage": 119
      },
      {
        "ring": "R-85",
        "pitchMm": 79.38,
        "widthMm": 12.7,
        "heightMm": 17.5,
        "flatMm": 8.66,
        "sourcePage": 119
      },
      {
        "ring": "R-86",
        "pitchMm": 90.5,
        "widthMm": 15.88,
        "heightMm": 20.6,
        "flatMm": 10.49,
        "sourcePage": 119
      },
      {
        "ring": "R-87",
        "pitchMm": 100.03,
        "widthMm": 15.88,
        "heightMm": 20.6,
        "flatMm": 10.49,
        "sourcePage": 119
      },
      {
        "ring": "R-88",
        "pitchMm": 123.83,
        "widthMm": 19.05,
        "heightMm": 23.9,
        "flatMm": 12.32,
        "sourcePage": 119
      },
      {
        "ring": "R-89",
        "pitchMm": 114.3,
        "widthMm": 19.05,
        "heightMm": 23.9,
        "flatMm": 12.32,
        "sourcePage": 119
      },
      {
        "ring": "R-90",
        "pitchMm": 155.58,
        "widthMm": 22.23,
        "heightMm": 26.9,
        "flatMm": 14.81,
        "sourcePage": 119
      },
      {
        "ring": "R-91",
        "pitchMm": 260.35,
        "widthMm": 31.75,
        "heightMm": 38.1,
        "flatMm": 22.33,
        "sourcePage": 119
      },
      {
        "ring": "R-92",
        "pitchMm": 228.6,
        "widthMm": 11.13,
        "heightMm": 16,
        "flatMm": 7.75,
        "sourcePage": 119
      },
      {
        "ring": "R-93",
        "pitchMm": 749.3,
        "widthMm": 19.05,
        "heightMm": 23.9,
        "flatMm": 12.32,
        "sourcePage": 119
      },
      {
        "ring": "R-94",
        "pitchMm": 800.1,
        "widthMm": 19.05,
        "heightMm": 23.9,
        "flatMm": 12.32,
        "sourcePage": 119
      },
      {
        "ring": "R-95",
        "pitchMm": 857.25,
        "widthMm": 19.05,
        "heightMm": 23.9,
        "flatMm": 12.32,
        "sourcePage": 119
      },
      {
        "ring": "R-96",
        "pitchMm": 914.4,
        "widthMm": 22.23,
        "heightMm": 26.9,
        "flatMm": 14.81,
        "sourcePage": 119
      },
      {
        "ring": "R-97",
        "pitchMm": 965.2,
        "widthMm": 22.23,
        "heightMm": 26.9,
        "flatMm": 14.81,
        "sourcePage": 119
      },
      {
        "ring": "R-98",
        "pitchMm": 1022.35,
        "widthMm": 22.23,
        "heightMm": 26.9,
        "flatMm": 14.81,
        "sourcePage": 119
      },
      {
        "ring": "R-99",
        "pitchMm": 234.95,
        "widthMm": 11.13,
        "heightMm": 16,
        "flatMm": 7.75,
        "sourcePage": 119
      },
      {
        "ring": "R-100",
        "pitchMm": 749.3,
        "widthMm": 28.58,
        "heightMm": 35.1,
        "flatMm": 19.81,
        "sourcePage": 119
      },
      {
        "ring": "R-101",
        "pitchMm": 800.1,
        "widthMm": 31.75,
        "heightMm": 38.1,
        "flatMm": 22.33,
        "sourcePage": 119
      },
      {
        "ring": "R-102",
        "pitchMm": 857.25,
        "widthMm": 31.75,
        "heightMm": 38.1,
        "flatMm": 22.33,
        "sourcePage": 119
      },
      {
        "ring": "R-103",
        "pitchMm": 914.4,
        "widthMm": 31.75,
        "heightMm": 38.1,
        "flatMm": 22.33,
        "sourcePage": 119
      },
      {
        "ring": "R-104",
        "pitchMm": 965.2,
        "widthMm": 34.93,
        "heightMm": 41.4,
        "flatMm": 24.82,
        "sourcePage": 119
      },
      {
        "ring": "R-105",
        "pitchMm": 1022.35,
        "widthMm": 34.93,
        "heightMm": 41.4,
        "flatMm": 24.82,
        "sourcePage": 119
      }
    ]
  }
};
