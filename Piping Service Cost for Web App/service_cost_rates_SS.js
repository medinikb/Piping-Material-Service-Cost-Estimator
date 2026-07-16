(function (global) {
  "use strict";

  const library = {
  "schemaVersion": "1.0.0",
  "libraryCode": "SS",
  "materialFamily": "STAINLESS_STEEL",
  "modelName": "Stainless Steel Piping Service Cost Rate Library",
  "currency": "INR",
  "sourceDocument": "Chapter_3_STAINLESS STEEL PIPING (NON IBR).docx",
  "targetRepository": "https://github.com/medinikb/Piping-Cost-Estimator",
  "supportedLocations": [
    "ABOVE_GROUND"
  ],
  "supportedRegulatoryClasses": [
    "NON_IBR"
  ],
  "measurementBasis": {
    "ID": "inch-diameter = weld or service joint count multiplied by applicable nominal diameter in inches",
    "IM": "inch-metre = nominal pipe size in inches multiplied by installed pipe length in metres",
    "M": "metre",
    "MAN_DAY": "8-hour man-day as stated in the source"
  },
  "governance": {
    "rateNature": "Source schedule-of-rates values, not market quotations.",
    "rateEscalation": "Apply a separately approved escalation factor. The library does not silently escalate source rates.",
    "riskAllowance": "Apply contingency separately from the direct service cost.",
    "unsupportedCombinations": "Return Review Required. Do not extrapolate outside documented size, thickness, IBR, or location ranges.",
    "doubleCountingGuardrail": "The broad piping scope already includes many fittings, testing and inline activities. Do not add duplicate costs without checking the source scope.",
    "materialSpecificGuardrail": "This chapter contains stainless-steel Non-IBR above-ground piping rates only. IBR and underground cases must return Review Required."
  },
  "rateTable": [
    {
      "location": "ABOVE_GROUND",
      "regulatoryClass": "NON_IBR",
      "activity": "FABRICATION",
      "weldType": "BUTT_WELD",
      "thicknessMinExclusiveMm": 0,
      "thicknessMaxInclusiveMm": 10,
      "npsMinIn": 0.5,
      "npsMaxIn": 36,
      "unit": "ID",
      "rateRs": 1680,
      "source": "BPCL-Kochi",
      "formulaReference": "",
      "note": ""
    },
    {
      "location": "ABOVE_GROUND",
      "regulatoryClass": "NON_IBR",
      "activity": "FABRICATION",
      "weldType": "FILLET_WELD",
      "thicknessMinExclusiveMm": 0,
      "thicknessMaxInclusiveMm": 10,
      "npsMinIn": 0.5,
      "npsMaxIn": 36,
      "unit": "ID",
      "rateRs": 1360,
      "source": "BPCL-Kochi",
      "formulaReference": "",
      "note": ""
    },
    {
      "location": "ABOVE_GROUND",
      "regulatoryClass": "NON_IBR",
      "activity": "ERECTION",
      "weldType": "NA",
      "thicknessMinExclusiveMm": 0,
      "thicknessMaxInclusiveMm": 10,
      "npsMinIn": 0.5,
      "npsMaxIn": 36,
      "unit": "IM",
      "rateRs": 400,
      "source": "BPCL-Kochi",
      "formulaReference": "",
      "note": ""
    },
    {
      "location": "ABOVE_GROUND",
      "regulatoryClass": "NON_IBR",
      "activity": "FABRICATION",
      "weldType": "BUTT_WELD",
      "thicknessMinExclusiveMm": 10,
      "thicknessMaxInclusiveMm": 20,
      "npsMinIn": 2,
      "npsMaxIn": 36,
      "unit": "ID",
      "rateRs": 2120,
      "source": "BPCL-Kochi",
      "formulaReference": "",
      "note": ""
    },
    {
      "location": "ABOVE_GROUND",
      "regulatoryClass": "NON_IBR",
      "activity": "ERECTION",
      "weldType": "NA",
      "thicknessMinExclusiveMm": 10,
      "thicknessMaxInclusiveMm": 20,
      "npsMinIn": 2,
      "npsMaxIn": 36,
      "unit": "IM",
      "rateRs": 460,
      "source": "BPCL-Kochi",
      "formulaReference": "",
      "note": ""
    },
    {
      "location": "ABOVE_GROUND",
      "regulatoryClass": "NON_IBR",
      "activity": "FABRICATION",
      "weldType": "BUTT_WELD",
      "thicknessMinExclusiveMm": 20,
      "thicknessMaxInclusiveMm": 30,
      "npsMinIn": 8,
      "npsMaxIn": 36,
      "unit": "ID",
      "rateRs": 5170,
      "source": "BPCL-Kochi",
      "formulaReference": "",
      "note": ""
    },
    {
      "location": "ABOVE_GROUND",
      "regulatoryClass": "NON_IBR",
      "activity": "ERECTION",
      "weldType": "NA",
      "thicknessMinExclusiveMm": 20,
      "thicknessMaxInclusiveMm": 30,
      "npsMinIn": 8,
      "npsMaxIn": 36,
      "unit": "IM",
      "rateRs": 490,
      "source": "BPCL-Kochi",
      "formulaReference": "",
      "note": ""
    },
    {
      "location": "ABOVE_GROUND",
      "regulatoryClass": "NON_IBR",
      "activity": "FABRICATION",
      "weldType": "BUTT_WELD",
      "thicknessMinExclusiveMm": 30,
      "thicknessMaxInclusiveMm": 40,
      "npsMinIn": 8,
      "npsMaxIn": 36,
      "unit": "ID",
      "rateRs": 6730,
      "source": "BPCL-Kochi",
      "formulaReference": "",
      "note": ""
    },
    {
      "location": "ABOVE_GROUND",
      "regulatoryClass": "NON_IBR",
      "activity": "ERECTION",
      "weldType": "NA",
      "thicknessMinExclusiveMm": 30,
      "thicknessMaxInclusiveMm": 40,
      "npsMinIn": 8,
      "npsMaxIn": 36,
      "unit": "IM",
      "rateRs": 550,
      "source": "BPCL-Kochi",
      "formulaReference": "",
      "note": ""
    },
    {
      "location": "ABOVE_GROUND",
      "regulatoryClass": "NON_IBR",
      "activity": "FABRICATION",
      "weldType": "BUTT_WELD",
      "thicknessMinExclusiveMm": 40,
      "thicknessMaxInclusiveMm": 50,
      "npsMinIn": 8,
      "npsMaxIn": 36,
      "unit": "ID",
      "rateRs": 8045,
      "source": "Derived in uploaded document",
      "formulaReference": "=6730*(50/35)^0.8",
      "note": ""
    },
    {
      "location": "ABOVE_GROUND",
      "regulatoryClass": "NON_IBR",
      "activity": "ERECTION",
      "weldType": "NA",
      "thicknessMinExclusiveMm": 40,
      "thicknessMaxInclusiveMm": 50,
      "npsMinIn": 8,
      "npsMaxIn": 36,
      "unit": "IM",
      "rateRs": 681,
      "source": "Derived in uploaded document",
      "formulaReference": "=550*(50/35)^0.6",
      "note": ""
    },
    {
      "location": "ANY",
      "regulatoryClass": "NON_IBR",
      "activity": "FLAME_CUTTING",
      "weldType": "NA",
      "thicknessMinExclusiveMm": 0,
      "thicknessMaxInclusiveMm": 10,
      "npsMinIn": 0.5,
      "npsMaxIn": 36,
      "unit": "ID",
      "rateRs": 507,
      "source": "NRL-ME-AMC",
      "formulaReference": "",
      "note": ""
    },
    {
      "location": "ANY",
      "regulatoryClass": "NON_IBR",
      "activity": "FLAME_CUTTING",
      "weldType": "NA",
      "thicknessMinExclusiveMm": 10,
      "thicknessMaxInclusiveMm": 20,
      "npsMinIn": 0.5,
      "npsMaxIn": 36,
      "unit": "ID",
      "rateRs": 768,
      "source": "Derived in uploaded document",
      "formulaReference": "=507*(20/10)^0.6",
      "note": ""
    },
    {
      "location": "ANY",
      "regulatoryClass": "NON_IBR",
      "activity": "FLAME_CUTTING",
      "weldType": "NA",
      "thicknessMinExclusiveMm": 20,
      "thicknessMaxInclusiveMm": 30,
      "npsMinIn": 0.5,
      "npsMaxIn": 36,
      "unit": "ID",
      "rateRs": 980,
      "source": "Derived in uploaded document",
      "formulaReference": "=507*(30/10)^0.6",
      "note": ""
    },
    {
      "location": "ANY",
      "regulatoryClass": "NON_IBR",
      "activity": "FLAME_CUTTING",
      "weldType": "NA",
      "thicknessMinExclusiveMm": 30,
      "thicknessMaxInclusiveMm": 40,
      "npsMinIn": 0.5,
      "npsMaxIn": 36,
      "unit": "ID",
      "rateRs": 1164,
      "source": "Derived in uploaded document",
      "formulaReference": "=507*(40/10)^0.6",
      "note": ""
    },
    {
      "location": "ANY",
      "regulatoryClass": "NON_IBR",
      "activity": "FLAME_CUTTING",
      "weldType": "NA",
      "thicknessMinExclusiveMm": 40,
      "thicknessMaxInclusiveMm": 50,
      "npsMinIn": 0.5,
      "npsMaxIn": 36,
      "unit": "ID",
      "rateRs": 1331,
      "source": "Derived in uploaded document",
      "formulaReference": "=507*(50/10)^0.6",
      "note": ""
    }
  ],
  "specialRates": {
    "salvaging": {
      "unit": "ID",
      "rateRs": 1343,
      "source": "IOC-ME-SOR (average)",
      "heightRule": "Beyond 5 m above or below ground, add 10% for each additional 5 m band.",
      "scaffolding": "Excluded and payable separately when required.",
      "applicability": "Stainless-steel pipe ends of different sizes, grades and thicknesses within the documented scope."
    },
    "manpower": [
      {
        "category": "SKILLED",
        "unit": "MAN_DAY",
        "rateRs": 1760,
        "source": "BPCL-Kochi"
      },
      {
        "category": "SEMI_SKILLED",
        "unit": "MAN_DAY",
        "rateRs": 1700,
        "source": "BPCL-Kochi"
      },
      {
        "category": "UNSKILLED",
        "unit": "MAN_DAY",
        "rateRs": 1640,
        "source": "BPCL-Kochi"
      }
    ]
  }
};

  global.PIPING_SERVICE_COST_RATES_SS = library;
  global.PIPING_SERVICE_COST_RATE_LIBRARIES =
    global.PIPING_SERVICE_COST_RATE_LIBRARIES || {};
  global.PIPING_SERVICE_COST_RATE_LIBRARIES.SS = library;
})(typeof window !== "undefined" ? window : globalThis);
