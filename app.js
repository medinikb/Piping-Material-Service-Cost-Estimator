const odTable = {
  0.5: 21.3,
  0.75: 26.7,
  1: 33.4,
  1.5: 48.3,
  2: 60.3,
  2.5: 73.0,
  3: 88.9,
  4: 114.3,
  5: 141.3,
  6: 168.3,
  8: 219.1,
  10: 273.1,
  12: 323.9,
  14: 355.6,
  16: 406.4,
  18: 457.0,
  20: 508.0,
  22: 559.0,
  24: 610.0,
  26: 660.4,
  28: 711.2,
  30: 762.0,
  32: 812.8,
  34: 863.6,
  36: 914.4,
  38: 965.2,
  40: 1016.0,
  42: 1066.8,
  44: 1117.6,
  46: 1168.4,
  48: 1219.2,
};

const manualSizeExclusions = new Set([1.25, 2.5, 3.5, 5]);

// ASME B16.9-style centre-to-end dimensions supplied for the equal-tee
// weight model. Manual size options remain unchanged; this also supports 2.5 IN BOM rows.
const equalTeeCentreDimensionsMm = {
  0.5: { c: 25.4, m: 25.4 },
  0.75: { c: 28.4, m: 28.4 },
  1: { c: 38.1, m: 38.1 },
  1.5: { c: 57.2, m: 57.2 },
  2: { c: 63.5, m: 63.5 },
  2.5: { c: 76.2, m: 76.2 },
  3: { c: 85.9, m: 85.9 },
  4: { c: 104.6, m: 104.6 },
  5: { c: 124.0, m: 124.0 },
  6: { c: 142.7, m: 142.7 },
  8: { c: 177.8, m: 177.8 },
  10: { c: 215.9, m: 215.9 },
  12: { c: 254.0, m: 254.0 },
  14: { c: 279.4, m: 279.4 },
  16: { c: 304.8, m: 304.8 },
  18: { c: 342.9, m: 342.9 },
  20: { c: 381.0, m: 381.0 },
  22: { c: 419.1, m: 419.1 },
  24: { c: 431.8, m: 431.8 },
  26: { c: 495.3, m: 495.3 },
  28: { c: 520.7, m: 520.7 },
  30: { c: 558.8, m: 558.8 },
  32: { c: 596.9, m: 596.9 },
  34: { c: 635.0, m: 635.0 },
  36: { c: 673.1, m: 673.1 },
  38: { c: 711.2, m: 711.2 },
  40: { c: 749.3, m: 749.3 },
  42: { c: 711.2, m: 762.0 },
  44: { c: 762.0, m: 812.8 },
  46: { c: 800.1, m: 850.9 },
  48: { c: 838.2, m: 889.0 },
};

const rawSteelByYear = {
  2021: 64.75,
  2022: 70.9,
  2023: 57.4,
  2024: 52.2,
  2025: 55.05,
  2026: 56.5,
};

const coatingFactors = {
  Yes: { median: 2.3, p90: 3.8, source: "Coated pipe factor" },
  No: { median: 1.8, p90: 2.7, source: "Non-coated pipe factor" },
};

const bomGroupDefinitions = [
  { name: "Pipe Group", keywords: ["pipe"] },
  {
    name: "Fitting Group",
    keywords: [
      "nipple",
      "elbow 90",
      "elbow 45",
      "elbow",
      "red tee",
      "equal tee",
      "tee",
      "con reducer",
      "con. reducer",
      "ecc reducer",
      "ecc. reducer",
      "reducer",
      "swage conc",
      "swage.conc",
      "cap",
      "cplng full",
      "cplng half",
      "cplng red",
      "coupling",
    ],
  },
  {
    name: "Flange Group",
    keywords: [
      "s.w. flange",
      "sw flange",
      "w.n. flange",
      "wn flange",
      "blind flange",
      "spacer & blind",
      "spacer and blind",
      "spacer",
      "spade",
      "flange",
      "flng.fig.8",
      "fig.8",
      "spcr",
      "bln",
    ],
  },
  {
    name: "Valves Group",
    keywords: ["gate valve", "globe valve", "check valve", "ball valve", "plug valve", "butterfly valve", "valve"],
  },
  { name: "Bolt Group", keywords: ["stud with nuts", "stud", "bolt"] },
  { name: "Gasket Group", keywords: ["gasket"] },
  { name: "Trap/Strainer Group", keywords: ["trap steam", "trap", "strainer temp", "strainer perm", "strainer"] },
  { name: "Other Group", keywords: [] },
];

const componentAliasMap = [
  {
    standardCode: "FIGURE_8_FLANGE",
    standardName: "Figure 8 Flange",
    group: "Flange Group",
    aliases: ["FIGURE-8", "FIGURE 8", "FIG.8 FL", "FIG 8 FL", "FIG.8 FLANGE", "FIG 8 FLANGE"],
  },
  {
    standardCode: "EQUAL_TEE",
    standardName: "Equal Tee",
    group: "Fitting Group",
    aliases: [
      "T.Equal",
      "Equal Tee",
      "Tee Equal",
      "TEE EQUAL",
      "Tee Eq",
      "TEE EQ",
      "Equal. T",
      "Equal .T",
      "Equal T",
      "EQ Tee",
      "EQ. TEE",
    ],
  },
  {
    standardCode: "REDUCING_TEE",
    standardName: "Reducing Tee",
    group: "Fitting Group",
    aliases: ["T.RED", "RED.T", "RED. Tee", "Reducing Tee", "Unequal Tee", "Unequal T", "Reduc. Tee", "Reduc. T.", "Reducing T", "Red Tee", "Red. T"],
  },
  {
    standardCode: "WELD_NECK_FLANGE",
    standardName: "Weld Neck Flange",
    group: "Flange Group",
    aliases: ["FLANG WN", "WN Flange", "Weld Neck Flange", "Well neck flange", "WN Flng", "WN FLG", "WNRF", "WN RF"],
  },
  {
    standardCode: "CONCENTRIC_REDUCER",
    standardName: "Concentric Reducer",
    group: "Fitting Group",
    aliases: [
      "CON.RED",
      "CON RED",
      "CON. RED",
      "CONC.RED",
      "CONC RED",
      "CONC. RED",
      "CONCENTRIC RED",
      "CONCENTRIC REDUCER",
      "CONC REDUCER",
      "CON. REDUCER",
      "CON REDUCER",
      "CONC. REDUCER",
      "CONCENTRIC REDU.",
      "CONC. REDU.",
      "CON REDU.",
      "CONCENTRIC REDN",
      "CONC REDN",
      "CON. REDN",
      "CONCENTRIC REDUCING",
      "REDUCER CONC",
      "REDUCER CON.",
      "REDUCER CONCENTRIC",
      "REDUCE CONC",
      "REDUCE CON.",
      "REDUCE CONCENTRIC",
      "REDUCE (CONC.)",
      "REDUC. CONC",
      "REDUC. CON.",
      "REDUCING CONCENTRIC",
      "RED. CONC",
      "RED CONC",
      "RED. CON.",
      "RED CON.",
    ],
  },
  {
    standardCode: "WELDOLET",
    standardName: "Weldolet",
    group: "Fitting Group",
    aliases: ["WELDOLET", "WELD OLET", "WELD-O-LET", "WELDLET"],
  },
];

const componentFactorMaster = [
  { group: "Pipe Group", component: "Pipe", uom: "M", factor: 1, autoCostAllowed: true, confidence: "High" },
  { group: "Pipe Group", component: "ERW/HFW Pipe", uom: "M", factor: 1, autoCostAllowed: true, confidence: "High" },
  { group: "Pipe Group", component: "SAW Pipe", uom: "M", factor: 1, autoCostAllowed: true, confidence: "High" },
  { group: "Pipe Group", component: "Seamless Pipe", uom: "M", factor: 1, autoCostAllowed: true, confidence: "High" },
  { group: "Fitting Group", component: "Nipple", uom: "NOS", factor: 0.16, autoCostAllowed: true, confidence: "Medium" },
  { group: "Fitting Group", component: "45 Degree Elbow", uom: "NOS", factor: 0.35, autoCostAllowed: true, confidence: "Medium" },
  { group: "Fitting Group", component: "90 Degree Elbow", uom: "NOS", factor: 0.55, autoCostAllowed: true, confidence: "Medium" },
  { group: "Fitting Group", component: "Elbow", uom: "NOS", factor: 0.55, autoCostAllowed: true, confidence: "Medium" },
  { group: "Fitting Group", component: "Equal Tee", uom: "NOS", factor: 0.55, autoCostAllowed: true, confidence: "Medium" },
  { group: "Fitting Group", component: "Reducing Tee", uom: "NOS", factor: 0.4, autoCostAllowed: true, confidence: "Medium" },
  { group: "Fitting Group", component: "Tee", uom: "NOS", factor: 0.55, autoCostAllowed: true, confidence: "Medium" },
  { group: "Fitting Group", component: "Concentric Reducer", uom: "NOS", factor: 0.3, autoCostAllowed: true, confidence: "Medium" },
  { group: "Fitting Group", component: "Eccentric Reducer", uom: "NOS", factor: 0.3, autoCostAllowed: true, confidence: "Medium" },
  { group: "Fitting Group", component: "Reducer", uom: "NOS", factor: 0.3, autoCostAllowed: true, confidence: "Medium" },
  { group: "Fitting Group", component: "Concentric Swage", uom: "NOS", factor: 0.8, autoCostAllowed: true, confidence: "Low" },
  { group: "Fitting Group", component: "Eccentric Swage", uom: "NOS", factor: 0.8, autoCostAllowed: true, confidence: "Low" },
  { group: "Fitting Group", component: "Cap", uom: "NOS", factor: 0.25, autoCostAllowed: true, confidence: "Medium" },
  { group: "Fitting Group", component: "Coupling", uom: "NOS", factor: 0.45, autoCostAllowed: true, confidence: "Medium" },
  { group: "Fitting Group", component: "Full Coupling", uom: "NOS", factor: 0.45, autoCostAllowed: true, confidence: "Medium" },
  { group: "Fitting Group", component: "Half Coupling", uom: "NOS", factor: 0.35, autoCostAllowed: true, confidence: "Medium" },
  { group: "Fitting Group", component: "Reducing Coupling", uom: "NOS", factor: 0.35, autoCostAllowed: true, confidence: "Medium" },
  { group: "Fitting Group", component: "Union", uom: "NOS", factor: 0.35, autoCostAllowed: true, confidence: "Low" },
  { group: "Fitting Group", component: "Weldolet", uom: "NOS", factor: 0.55, autoCostAllowed: true, confidence: "Low" },
  { group: "Flange Group", component: "Flange", uom: "NOS", factor: 0.8, autoCostAllowed: true, confidence: "Medium" },
  { group: "Flange Group", component: "Socket Weld Flange", uom: "NOS", factor: 0.8, autoCostAllowed: true, confidence: "Medium" },
  { group: "Flange Group", component: "Slip-On Flange", uom: "NOS", factor: 0.7, autoCostAllowed: true, confidence: "Medium" },
  { group: "Flange Group", component: "Weld Neck Flange", uom: "NOS", factor: 0.85, autoCostAllowed: true, confidence: "Medium" },
  { group: "Flange Group", component: "Blind Flange", uom: "NOS", factor: 0.65, autoCostAllowed: true, confidence: "Medium" },
  { group: "Flange Group", component: "Threaded Flange", uom: "NOS", factor: 0.55, autoCostAllowed: true, confidence: "Low" },
  { group: "Flange Group", component: "Lap Joint Flange", uom: "NOS", factor: 0.7, autoCostAllowed: true, confidence: "Low" },
  { group: "Flange Group", component: "Figure 8 Flange", uom: "NOS", factor: 0.85, autoCostAllowed: true, confidence: "Low" },
  { group: "Flange Group", component: "Spacer", uom: "NOS", factor: 0.55, autoCostAllowed: true, confidence: "Low" },
  { group: "Flange Group", component: "Spade / Blind", uom: "NOS", factor: 0.55, autoCostAllowed: true, confidence: "Low" },
  { group: "Valves Group", component: "Gate Valve", uom: "NOS", factor: 6.25, autoCostAllowed: true, confidence: "Low" },
  { group: "Valves Group", component: "Globe Valve", uom: "NOS", factor: 8.125, autoCostAllowed: true, confidence: "Low" },
  { group: "Valves Group", component: "Check Valve", uom: "NOS", factor: 5.625, autoCostAllowed: true, confidence: "Low" },
  { group: "Valves Group", component: "Ball Valve", uom: "NOS", factor: 6.875, autoCostAllowed: true, confidence: "Low" },
  { group: "Valves Group", component: "Plug Valve", uom: "NOS", factor: 7.5, autoCostAllowed: true, confidence: "Low" },
  { group: "Valves Group", component: "Butterfly Valve", uom: "NOS", factor: 3.125, autoCostAllowed: true, confidence: "Low" },
  { group: "Valves Group", component: "Valve", uom: "NOS", factor: 6.875, autoCostAllowed: true, confidence: "Low" },
  { group: "Bolt Group", component: "Stud with Nuts", uom: "SET", factor: 0.2, autoCostAllowed: true, confidence: "Low" },
  { group: "Bolt Group", component: "Stud", uom: "NOS", factor: 0.02, autoCostAllowed: true, confidence: "Low" },
  { group: "Bolt Group", component: "Bolt", uom: "NOS", factor: 0.02, autoCostAllowed: true, confidence: "Low" },
  { group: "Gasket Group", component: "Gasket", uom: "NOS", factor: 0.06, autoCostAllowed: true, confidence: "Medium" },
  { group: "Trap/Strainer Group", component: "Steam Trap", uom: "NOS", factor: 2.5, autoCostAllowed: true, confidence: "Low" },
  { group: "Trap/Strainer Group", component: "Trap", uom: "NOS", factor: 2.5, autoCostAllowed: true, confidence: "Low" },
  { group: "Trap/Strainer Group", component: "Temporary Strainer", uom: "NOS", factor: 0.35, autoCostAllowed: true, confidence: "Low" },
  { group: "Trap/Strainer Group", component: "Permanent Strainer", uom: "NOS", factor: 2.0, autoCostAllowed: true, confidence: "Low" },
  { group: "Trap/Strainer Group", component: "Strainer", uom: "NOS", factor: 1.5, autoCostAllowed: true, confidence: "Low" },
  { group: "Other Group", component: "Unclassified", uom: "NOS", factor: 0.0, autoCostAllowed: true, confidence: "Low" },
  { group: "Other Group", component: "Other", uom: "NOS", factor: 0.0, autoCostAllowed: true, confidence: "Low" },
];

const pressureClassMultipliers = {
  150: 1.0,
  300: 2.5375,
  600: 5.709375,
  900: 9.515625,
  1500: 15.225,
  2500: 22.8375,
};

const flangePressureClassMultipliers = {
  150: 1.0,
  300: 1.45,
  600: 3.0,
  900: 4.7,
  1500: 8.0,
  2500: 16.0,
};

const valvePressureClassMultipliers = {
  150: 1.0,
  300: 2.175,
  600: 4.4,
  900: 5.2,
  1500: 8.7,
  2500: 14.4,
};

const valveGateBasePricingBands = [
  { min: 0.5, max: 4, weightCoefficient: 13.13, exponent: 0.87, conversionFactor: 4.2 },
  { min: 6, max: 12, weightCoefficient: 2.0, exponent: 2, conversionFactor: 3.7 },
  { min: 14, max: 24, weightCoefficient: 2.25, exponent: 2, conversionFactor: 3.35 },
  { min: 26, max: 48, weightCoefficient: 3.1, exponent: 2, conversionFactor: 3.0 },
];

const flangeWeightP50Multipliers = {
  WNRF: { small: 3.7, medium: 3.7, large: 3.7 },
  BLRF: { small: 2.9, medium: 2.9, large: 2.9 },
  SORF: { small: 2.71, medium: 2.38, large: 3.3 },
};

const flangeEquivalentPipeFallbackScale = 0.4;

const builtInFlangeWeightFallbacks = {
  'WNRF|150#|0.5"': { weight: 0.48, standard: "ANSI B16.5 built-in fallback" },
  'WNRF|150#|0.75"': { weight: 0.71, standard: "ANSI B16.5 built-in fallback" },
  'WNRF|150#|1"': { weight: 1.01, standard: "ANSI B16.5 built-in fallback" },
  'WNRF|150#|1.5"': { weight: 1.72, standard: "ANSI B16.5 built-in fallback" },
  'WNRF|150#|2"': { weight: 2.58, standard: "ANSI B16.5 built-in fallback" },
  'WNRF|150#|3"': { weight: 4.92, standard: "ANSI B16.5 built-in fallback" },
  'WNRF|150#|4"': { weight: 6.84, standard: "ANSI B16.5 built-in fallback" },
  'WNRF|150#|6"': { weight: 10.6, standard: "ANSI B16.5 built-in fallback" },
  'WNRF|150#|8"': { weight: 17.6, standard: "ANSI B16.5 built-in fallback" },
  'WNRF|150#|10"': { weight: 24.0, standard: "ANSI B16.5 built-in fallback" },
  'WNRF|150#|12"': { weight: 36.5, standard: "ANSI B16.5 built-in fallback" },
  'WNRF|150#|14"': { weight: 48.4, standard: "ANSI B16.5 built-in fallback" },
  'WNRF|150#|16"': { weight: 60.6, standard: "ANSI B16.5 built-in fallback" },
  'WNRF|150#|18"': { weight: 68.3, standard: "ANSI B16.5 built-in fallback" },
  'WNRF|150#|20"': { weight: 84.5, standard: "ANSI B16.5 built-in fallback" },
  'WNRF|150#|22"': { weight: 102.0, standard: "ANSI B16.5 built-in fallback" },
  'WNRF|150#|24"': { weight: 115.0, standard: "ANSI B16.5 built-in fallback" },
  'WNRF|600#|0.5"': { weight: 0.87, standard: "ANSI B16.5 built-in fallback" },
  'WNRF|600#|0.75"': { weight: 1.45, standard: "ANSI B16.5 built-in fallback" },
  'WNRF|600#|1"': { weight: 1.76, standard: "ANSI B16.5 built-in fallback" },
  'WNRF|600#|1.5"': { weight: 3.49, standard: "ANSI B16.5 built-in fallback" },
  'WNRF|600#|2"': { weight: 4.36, standard: "ANSI B16.5 built-in fallback" },
  'WNRF|600#|3"': { weight: 8.53, standard: "ANSI B16.5 built-in fallback" },
  'WNRF|600#|4"': { weight: 17.4, standard: "ANSI B16.5 built-in fallback" },
  'WNRF|600#|6"': { weight: 34.9, standard: "ANSI B16.5 built-in fallback" },
  'WNRF|600#|8"': { weight: 53.9, standard: "ANSI B16.5 built-in fallback" },
  'WNRF|600#|10"': { weight: 86.5, standard: "ANSI B16.5 built-in fallback" },
  'WNRF|600#|12"': { weight: 103.0, standard: "ANSI B16.5 built-in fallback" },
  'WNRF|600#|14"': { weight: 158.0, standard: "ANSI B16.5 built-in fallback" },
  'WNRF|600#|16"': { weight: 219.0, standard: "ANSI B16.5 built-in fallback" },
  'WNRF|600#|18"': { weight: 252.0, standard: "ANSI B16.5 built-in fallback" },
  'WNRF|600#|20"': { weight: 313.0, standard: "ANSI B16.5 built-in fallback" },
  'WNRF|600#|22"': { weight: 380.0, standard: "ANSI B16.5 built-in fallback" },
  'WNRF|600#|24"': { weight: 444.0, standard: "ANSI B16.5 built-in fallback" },
  'BLRF|150#|0.5"': { weight: 0.8, standard: "ANSI B16.5 built-in fallback" },
  'BLRF|150#|0.75"': { weight: 0.9, standard: "ANSI B16.5 built-in fallback" },
  'BLRF|150#|1"': { weight: 1.0, standard: "ANSI B16.5 built-in fallback" },
  'BLRF|150#|1.5"': { weight: 1.4, standard: "ANSI B16.5 built-in fallback" },
  'BLRF|150#|2"': { weight: 1.6, standard: "ANSI B16.5 built-in fallback" },
  'BLRF|150#|3"': { weight: 4.1, standard: "ANSI B16.5 built-in fallback" },
  'BLRF|150#|4"': { weight: 7.7, standard: "ANSI B16.5 built-in fallback" },
  'BLRF|150#|6"': { weight: 11.8, standard: "ANSI B16.5 built-in fallback" },
  'BLRF|150#|8"': { weight: 20.4, standard: "ANSI B16.5 built-in fallback" },
  'BLRF|150#|10"': { weight: 31.8, standard: "ANSI B16.5 built-in fallback" },
  'BLRF|150#|12"': { weight: 50.0, standard: "ANSI B16.5 built-in fallback" },
  'BLRF|150#|14"': { weight: 60.0, standard: "ANSI B16.5 built-in fallback" },
  'BLRF|150#|16"': { weight: 77.0, standard: "ANSI B16.5 built-in fallback" },
  'BLRF|150#|18"': { weight: 95.0, standard: "ANSI B16.5 built-in fallback" },
  'BLRF|150#|20"': { weight: 123.0, standard: "ANSI B16.5 built-in fallback" },
  'BLRF|150#|22"': { weight: 151.0, standard: "ANSI B16.5 built-in fallback" },
  'BLRF|150#|24"': { weight: 187.0, standard: "ANSI B16.5 built-in fallback" },
  'BLRF|600#|0.5"': { weight: 0.76, standard: "ANSI B16.5 built-in fallback" },
  'BLRF|600#|0.75"': { weight: 1.28, standard: "ANSI B16.5 built-in fallback" },
  'BLRF|600#|1"': { weight: 1.6, standard: "ANSI B16.5 built-in fallback" },
  'BLRF|600#|1.5"': { weight: 3.25, standard: "ANSI B16.5 built-in fallback" },
  'BLRF|600#|2"': { weight: 1.15, standard: "ANSI B16.5 built-in fallback" },
  'BLRF|600#|3"': { weight: 8.44, standard: "ANSI B16.5 built-in fallback" },
  'BLRF|600#|4"': { weight: 17.3, standard: "ANSI B16.5 built-in fallback" },
  'BLRF|600#|6"': { weight: 36.1, standard: "ANSI B16.5 built-in fallback" },
  'BLRF|600#|8"': { weight: 58.9, standard: "ANSI B16.5 built-in fallback" },
  'BLRF|600#|10"': { weight: 97.5, standard: "ANSI B16.5 built-in fallback" },
  'BLRF|600#|12"': { weight: 124.0, standard: "ANSI B16.5 built-in fallback" },
  'BLRF|600#|14"': { weight: 151.0, standard: "ANSI B16.5 built-in fallback" },
  'BLRF|600#|16"': { weight: 214.0, standard: "ANSI B16.5 built-in fallback" },
  'BLRF|600#|18"': { weight: 272.0, standard: "ANSI B16.5 built-in fallback" },
  'BLRF|600#|20"': { weight: 349.0, standard: "ANSI B16.5 built-in fallback" },
  'BLRF|600#|22"': { weight: 437.0, standard: "ANSI B16.5 built-in fallback" },
  'BLRF|600#|24"': { weight: 533.0, standard: "ANSI B16.5 built-in fallback" },
  'SORF|150#|0.5"': { weight: 0.8, standard: "ANSI B16.5 built-in fallback" },
  'SORF|150#|0.75"': { weight: 0.9, standard: "ANSI B16.5 built-in fallback" },
  'SORF|150#|1"': { weight: 1.0, standard: "ANSI B16.5 built-in fallback" },
  'SORF|150#|1.5"': { weight: 1.4, standard: "ANSI B16.5 built-in fallback" },
  'SORF|150#|2"': { weight: 2.3, standard: "ANSI B16.5 built-in fallback" },
  'SORF|150#|3"': { weight: 3.6, standard: "ANSI B16.5 built-in fallback" },
  'SORF|150#|4"': { weight: 5.9, standard: "ANSI B16.5 built-in fallback" },
  'SORF|150#|6"': { weight: 8.6, standard: "ANSI B16.5 built-in fallback" },
  'SORF|150#|8"': { weight: 13.6, standard: "ANSI B16.5 built-in fallback" },
  'SORF|150#|10"': { weight: 19.5, standard: "ANSI B16.5 built-in fallback" },
  'SORF|150#|12"': { weight: 29.1, standard: "ANSI B16.5 built-in fallback" },
  'SORF|150#|14"': { weight: 38.6, standard: "ANSI B16.5 built-in fallback" },
  'SORF|150#|16"': { weight: 42.2, standard: "ANSI B16.5 built-in fallback" },
  'SORF|150#|18"': { weight: 54.5, standard: "ANSI B16.5 built-in fallback" },
  'SORF|150#|20"': { weight: 70.0, standard: "ANSI B16.5 built-in fallback" },
  'SORF|150#|22"': { weight: 72.0, standard: "ANSI B16.5 built-in fallback" },
  'SORF|150#|24"': { weight: 95.0, standard: "ANSI B16.5 built-in fallback" },
  'SORF|600#|0.5"': { weight: 0.74, standard: "ANSI B16.5 built-in fallback" },
  'SORF|600#|0.75"': { weight: 1.27, standard: "ANSI B16.5 built-in fallback" },
  'SORF|600#|1"': { weight: 1.52, standard: "ANSI B16.5 built-in fallback" },
  'SORF|600#|1.5"': { weight: 2.96, standard: "ANSI B16.5 built-in fallback" },
  'SORF|600#|2"': { weight: 3.62, standard: "ANSI B16.5 built-in fallback" },
  'SORF|600#|3"': { weight: 7.0, standard: "ANSI B16.5 built-in fallback" },
  'SORF|600#|4"': { weight: 14.5, standard: "ANSI B16.5 built-in fallback" },
  'SORF|600#|6"': { weight: 28.7, standard: "ANSI B16.5 built-in fallback" },
  'SORF|600#|8"': { weight: 43.4, standard: "ANSI B16.5 built-in fallback" },
  'SORF|600#|10"': { weight: 70.3, standard: "ANSI B16.5 built-in fallback" },
  'SORF|600#|12"': { weight: 84.2, standard: "ANSI B16.5 built-in fallback" },
  'SORF|600#|14"': { weight: 98.7, standard: "ANSI B16.5 built-in fallback" },
  'SORF|600#|16"': { weight: 142.0, standard: "ANSI B16.5 built-in fallback" },
  'SORF|600#|18"': { weight: 173.0, standard: "ANSI B16.5 built-in fallback" },
  'SORF|600#|20"': { weight: 220.0, standard: "ANSI B16.5 built-in fallback" },
  'SORF|600#|22"': { weight: 292.0, standard: "ANSI B16.5 built-in fallback" },
  'SORF|600#|24"': { weight: 398.0, standard: "ANSI B16.5 built-in fallback" },
};

const flangeStandardPriority = [
  "ANSI B16.5",
  "BS 3293",
  "ANSI B16.47-API 605",
  "ANSI B16.47-MSS SP-44",
];

let flangeWeightModel = null;
let flangeWeightModelStatus = "loading";
let unequalTeeDimensions = [];
let unequalTeeDimensionsStatus = "loading";

const metricCoarsePitch = {
  6: 1.0,
  8: 1.25,
  10: 1.5,
  12: 1.75,
  14: 2.0,
  16: 2.0,
  18: 2.5,
  20: 2.5,
  22: 2.5,
  24: 3.0,
  27: 3.0,
  30: 3.5,
  33: 3.5,
  36: 4.0,
  39: 4.0,
  42: 4.5,
  45: 4.5,
  48: 5.0,
  52: 5.0,
  56: 5.5,
  60: 5.5,
  64: 6.0,
};

const studBoltPricingBasis = {
  densityKgM3: 7850,
  studCorrectionFactor: 1,
  nutCorrectionFactor: 0.95,
  numberOfNuts: 2,
  commercialRawToFinishedFactor: 2.5,
};

// Maximum across-flats and thickness values from the ASME B18.2.4.6M metric
// heavy-hex table. The 0.95 nut correction below accounts for the simplified hex geometry.
const metricHeavyHexNutDimensions = {
  12: { acrossFlatsMm: 21.0, thicknessMm: 12.3 },
  14: { acrossFlatsMm: 24.0, thicknessMm: 14.3 },
  16: { acrossFlatsMm: 27.0, thicknessMm: 17.1 },
  18: { acrossFlatsMm: 30.0, thicknessMm: 18.9 },
  20: { acrossFlatsMm: 34.0, thicknessMm: 20.7 },
  22: { acrossFlatsMm: 36.0, thicknessMm: 23.6 },
  24: { acrossFlatsMm: 41.0, thicknessMm: 24.2 },
  27: { acrossFlatsMm: 46.0, thicknessMm: 27.5 },
  30: { acrossFlatsMm: 50.0, thicknessMm: 30.7 },
  33: { acrossFlatsMm: 55.0, thicknessMm: 33.6 },
  36: { acrossFlatsMm: 60.0, thicknessMm: 36.6 },
  39: { acrossFlatsMm: 65.0, thicknessMm: 39.0 },
  42: { acrossFlatsMm: 70.0, thicknessMm: 42.0 },
  45: { acrossFlatsMm: 75.0, thicknessMm: 45.0 },
  48: { acrossFlatsMm: 80.0, thicknessMm: 48.0 },
  52: { acrossFlatsMm: 85.0, thicknessMm: 52.0 },
  56: { acrossFlatsMm: 90.0, thicknessMm: 56.0 },
  64: { acrossFlatsMm: 100.0, thicknessMm: 64.0 },
};

const genericComponentFallbackFactors = {
  "Pipe Group": { component: "Generic Pipe", uom: "M", factor: 1, confidence: "Medium" },
  "Fitting Group": { component: "Generic Fitting P80", uom: "NOS", factor: 0.55, confidence: "Low" },
  "Flange Group": { component: "Generic Flange P80", uom: "NOS", factor: 0.85, confidence: "Low" },
  "Valves Group": { component: "Generic Valve P80", uom: "NOS", factor: 7.5, confidence: "Low" },
  "Bolt Group": { component: "Generic Bolt Set P80", uom: "SET", factor: 0.2, confidence: "Low" },
  "Gasket Group": { component: "Generic Gasket P80", uom: "NOS", factor: 0.06, confidence: "Low" },
  "Trap/Strainer Group": { component: "Generic Trap/Strainer P80", uom: "NOS", factor: 2.5, confidence: "Low" },
};

const dnToNps = {
  15: 0.5,
  20: 0.75,
  25: 1,
  40: 1.5,
  50: 2,
  65: 2.5,
  80: 3,
  100: 4,
  150: 6,
  200: 8,
  250: 10,
  300: 12,
  350: 14,
  400: 16,
  450: 18,
  500: 20,
  550: 22,
  600: 24,
  650: 26,
  700: 28,
  750: 30,
  800: 32,
  850: 34,
  900: 36,
  950: 38,
  1000: 40,
  1050: 42,
  1100: 44,
  1150: 46,
  1200: 48,
};

const scheduleThicknessTable = {
  0.5: { "5S": 1.65, "5": 1.65, "10S": 2.11, "10": 2.11, "40S": 2.77, STD: 2.77, HVY: 3.25, "40": 2.77, "80S": 3.73, XS: 3.73, "80": 3.73, "160": 4.75, XXS: 7.47 },
  0.75: { "5S": 1.65, "5": 1.65, "10S": 2.11, "10": 2.11, "40S": 2.87, STD: 2.87, HVY: 3.25, "40": 2.87, "80S": 3.91, XS: 3.91, "80": 3.91, "160": 5.54, XXS: 7.82 },
  1: { "5S": 1.65, "5": 1.65, "10S": 2.77, "10": 2.77, "40S": 3.38, STD: 3.38, HVY: 4.05, "40": 3.38, "80S": 4.55, XS: 4.55, "80": 4.55, "160": 6.35, XXS: 9.09 },
  1.5: { "5S": 1.65, "5": 1.65, "10S": 2.77, "10": 2.77, "40S": 3.68, STD: 3.68, HVY: 4.05, "40": 3.68, "80S": 5.08, XS: 5.08, "80": 5.08, "160": 7.14, XXS: 10.16 },
  2: { "5S": 1.65, "5": 1.65, "10S": 2.77, "10": 2.77, "40S": 3.91, STD: 3.91, HVY: 4.47, "40": 3.91, "80S": 5.54, XS: 5.54, "80": 5.54, "160": 8.71, XXS: 11.07 },
  2.5: { "5S": 2.11, "5": 2.11, "10S": 3.05, "10": 3.05, "40S": 5.16, STD: 5.16, "40": 5.16, "80S": 7.01, XS: 7.01, "80": 7.01, "160": 9.53, XXS: 14.02 },
  3: { "5S": 2.11, "5": 2.11, "10S": 3.05, "10": 3.05, "40S": 5.49, STD: 5.49, HVY: 4.85, "40": 5.49, "80S": 7.62, XS: 7.62, "80": 7.62, "160": 11.13, XXS: 15.24 },
  4: { "5S": 2.11, "5": 2.11, "10S": 3.05, "10": 3.05, "40S": 6.02, STD: 6.02, HVY: 5.4, "40": 6.02, "80S": 8.56, XS: 8.56, "80": 8.56, "120": 11.13, "160": 13.49, XXS: 17.12 },
  5: { HVY: 5.4 },
  6: { "5S": 2.77, "5": 2.77, "10S": 3.4, "10": 3.4, "40S": 7.11, STD: 7.11, HVY: 5.4, "40": 7.11, "80S": 10.97, XS: 10.97, "80": 10.97, "120": 14.27, "160": 18.24, XXS: 21.95 },
  8: { "5S": 2.77, "5": 2.77, "10S": 3.76, "10": 3.76, "20": 6.35, "30": 7.04, "40S": 8.18, STD: 8.18, "40": 8.18, "60": 10.31, "80S": 12.7, XS: 12.7, "80": 12.7, "100": 15.06, "120": 18.24, "140": 20.62, "160": 23.01, XXS: 22.23 },
  10: { "5S": 3.4, "5": 3.4, "10S": 4.19, "10": 4.19, "20": 6.35, "30": 7.8, "40S": 9.27, STD: 9.27, "40": 9.27, "60": 12.7, "80S": 12.7, XS: 12.7, "80": 15.06, "100": 18.24, "120": 21.41, "140": 25.4, "160": 28.58, XXS: 25.4 },
  12: { "5S": 3.96, "5": 4.19, "10S": 4.57, "10": 4.57, "20": 6.35, "30": 8.38, "40S": 9.53, STD: 9.53, "40": 10.31, "60": 14.27, "80S": 12.7, XS: 12.7, "80": 17.45, "100": 21.41, "120": 25.4, "140": 28.58, "160": 33.32, XXS: 25.4 },
  14: { "5S": 3.96, "10S": 4.78, "10": 6.35, "20": 7.92, "30": 9.53, STD: 9.53, "40": 11.13, XS: 12.7, "60": 15.06, "80": 19.05, "100": 23.8, "120": 27.76, "140": 31.75, "160": 35.71 },
  16: { "5S": 4.19, "10S": 4.78, "10": 6.35, "20": 7.92, "30": 9.53, STD: 9.53, "40": 12.7, XS: 12.7, "60": 16.66, "80": 21.41, "100": 26.19, "120": 30.94, "140": 36.53, "160": 40.46 },
  18: { "5S": 4.19, "10S": 4.78, "10": 6.35, "20": 7.92, STD: 9.53, "30": 11.13, XS: 12.7, "40": 14.27, "60": 19.05, "80": 23.8, "100": 29.36, "120": 34.93, "140": 39.67, "160": 45.24 },
  20: { "5S": 4.78, "10S": 5.54, "10": 6.35, STD: 9.53, "20": 9.35, "30": 12.7, XS: 12.7, "40": 15.06, "60": 20.62, "80": 26.19, "100": 32.54, "120": 38.1, "140": 44.45, "160": 49.99 },
  22: { "5S": 4.78, "10S": 5.54, "10": 6.35, STD: 9.53, "20": 9.35, "30": 12.7, XS: 12.7, "40": 15.88, "60": 22.23, "80": 28.57, "100": 34.92, "120": 41.27, "140": 47.62, "160": 53.97 },
  24: { "5S": 5.54, "10S": 6.35, "10": 6.35, STD: 9.53, "20": 9.35, XS: 12.7, "30": 14.27, "40": 17.45, "60": 24.59, "80": 30.94, "100": 38.89, "120": 46.02, "140": 52.37, "160": 59.51 },
  26: { "10": 7.92, STD: 9.53, "20": 12.7, XS: 12.7 },
  28: { "10": 7.92, STD: 9.53, "20": 12.7, XS: 12.7, "30": 15.87 },
  30: { "10": 7.92, STD: 9.53, "20": 12.7, XS: 12.7, "30": 15.87 },
  32: { "10": 7.92, STD: 9.53, "20": 12.7, XS: 12.7, "30": 15.87, "40": 17.45 },
  34: { "10": 7.92, STD: 9.53, "20": 12.7, XS: 12.7, "30": 15.87, "40": 17.45 },
  36: { "10": 7.92, STD: 9.53, "20": 12.7, XS: 12.7, "30": 15.87, "40": 19.05 },
  38: { STD: 9.53, XS: 12.7 },
  40: { STD: 9.53, XS: 12.7 },
  42: { STD: 9.53, XS: 12.7 },
  44: { STD: 9.53, XS: 12.7 },
  46: { STD: 9.53, XS: 12.7 },
  48: { STD: 9.53, XS: 12.7 },
};

const bomColumnAliases = {
  size: ["size", "nps", "pipesize", "nominalsize", "diameter", "dia"],
  thickness: [
    "thickness",
    "thk",
    "thck",
    "schthkrating",
    "schthckrating",
    "schedulethicknessrating",
    "wallthickness",
    "wallthk",
    "thkmm",
    "thicknessmm",
  ],
  length: ["length", "lengthm", "qty", "quantity", "totalm", "meter", "metre", "m"],
  uom: [
    "uom",
    "unitmnos",
    "unitmnoss",
    "unitofmeasure",
    "unit",
    "uommnos",
    "quantitymnos",
    "quantitymnoss",
    "qtymnos",
    "qtymnoss",
    "quantityunit",
    "qtyuom",
  ],
  item: ["items", "item", "itemdescription", "description", "shorttext"],
  coating: ["coating", "coated", "coatingscope", "lining", "pe"],
  spec: ["material", "materials", "materialdescription", "materialspec", "spec", "description", "items"],
  pipeClass: ["pipeclass", "pipingclass", "pmsclass", "lineclass", "materialclass", "class"],
  rawOverride: ["rawsteelrskg", "rawsteel", "rawsteelrate", "rawsteelprice"],
  factorOverride: ["estimatefactoroverride", "factoroverride", "factor", "estimatefactor"],
};

const elements = {
  estimatorQueryForm: document.querySelector("#estimator-query-form"),
  estimatorQueryInput: document.querySelector("#estimator-query"),
  estimatorQueryExamples: document.querySelector("#estimator-query-examples"),
  estimatorQueryResult: document.querySelector("#estimator-query-result"),
  estimatorBomUpload: document.querySelector("#estimator-bom-upload"),
  estimatorBomFile: document.querySelector("#estimator-bom-file"),
  estimatorReportPreview: document.querySelector("#estimator-report-preview"),
  estimatorReportFrame: document.querySelector("#estimator-report-frame"),
  estimatorReportPrint: document.querySelector("#estimator-report-print-button"),
  estimatorReportClose: document.querySelector("#estimator-report-close-button"),
  projectDescription: document.querySelector("#project-description"),
  projectNumber: document.querySelector("#project-number"),
  designTemperature: document.querySelector("#design-temperature"),
  year: document.querySelector("#year"),
  size: document.querySelector("#size"),
  thicknessMode: document.querySelector("#thickness-mode"),
  thicknessLabel: document.querySelector("#thickness-label"),
  thickness: document.querySelector("#thickness"),
  scheduleField: document.querySelector("#schedule-field"),
  schedule: document.querySelector("#schedule"),
  length: document.querySelector("#length"),
  spec: document.querySelector("#spec"),
  materialBasis: document.querySelector("#material-basis"),
  materialGradeFamily: document.querySelector("#material-grade-family"),
  materialStandardOutput: document.querySelector("#material-standard-output"),
  rawMaterialBasisOutput: document.querySelector("#raw-material-basis-output"),
  rawMaterialRangeOutput: document.querySelector("#raw-material-range-output"),
  recommendedRateOutput: document.querySelector("#recommended-rate-output"),
  coating: document.querySelector("#coating"),
  rawOverride: document.querySelector("#raw-override"),
  factorOverride: document.querySelector("#factor-override"),
  factorCsOutput: document.querySelector("#factor-cs-output"),
  addLine: document.querySelector("#add-line-button"),
  addComponent: document.querySelector("#add-component-button"),
  resetComponent: document.querySelector("#reset-component-button"),
  componentGroup: document.querySelector("#component-group"),
  componentType: document.querySelector("#component-type"),
  componentSize: document.querySelector("#component-size"),
  componentUnequalTeeSize: document.querySelector("#component-unequal-tee-size"),
  componentSizeLabel: document.querySelector("#component-size-label"),
  componentRating: document.querySelector("#component-rating"),
  componentRatingField: document.querySelector("#component-rating-field"),
  componentMaterial: document.querySelector("#component-material"),
  componentQuantity: document.querySelector("#component-quantity"),
  componentUom: document.querySelector("#component-uom"),
  componentWarning: document.querySelector("#component-warning"),
  componentOutputGroup: document.querySelector("#component-output-group"),
  componentOutputStatus: document.querySelector("#component-output-status"),
  componentMaterialCategory: document.querySelector("#component-material-category"),
  componentRawRate: document.querySelector("#component-raw-rate"),
  componentFactor: document.querySelector("#component-factor"),
  componentUnitRate: document.querySelector("#component-unit-rate"),
  componentNormalTotal: document.querySelector("#component-normal-total"),
  componentP90Total: document.querySelector("#component-p90-total"),
  componentBasis: document.querySelector("#component-basis"),
  themeToggle: document.querySelector("#theme-toggle"),
  print: document.querySelector("#print-button"),
  exportCsv: document.querySelector("#export-csv-button"),
  bomReport: document.querySelector("#bom-report-button"),
  bomExcelReport: document.querySelector("#bom-excel-report-button"),
  bomUploadReportActions: document.querySelector("#bom-upload-report-actions"),
  bomUploadReport: document.querySelector("#bom-upload-report-button"),
  bomUploadExcelReport: document.querySelector("#bom-upload-excel-report-button"),
  bomUploadReportPreview: document.querySelector("#bom-upload-report-preview"),
  bomUploadReportFrame: document.querySelector("#bom-upload-report-frame"),
  bomUploadReportPrint: document.querySelector("#bom-upload-report-print-button"),
  bomUploadReportClose: document.querySelector("#bom-upload-report-close-button"),
  bomReportPreview: document.querySelector("#bom-report-preview"),
  bomReportFrame: document.querySelector("#bom-report-frame"),
  bomReportPrint: document.querySelector("#bom-report-print-button"),
  bomReportClose: document.querySelector("#bom-report-close-button"),
  reset: document.querySelector("#reset-button"),
  sideNav: document.querySelector("#side-nav"),
  sideBrandHome: document.querySelector("#side-brand-home"),
  sideNavToggle: document.querySelector("#side-nav-toggle"),
  sideNavLinks: document.querySelectorAll(".side-nav nav a"),
  bomFile: document.querySelector("#bom-file"),
  bomDropZone: document.querySelector("#bom-drop-zone"),
  bomStatus: document.querySelector("#bom-status"),
  bomProgress: document.querySelector("#bom-progress"),
  bomProgressRing: document.querySelector("#bom-progress-ring"),
  bomProgressCount: document.querySelector("#bom-progress-count"),
  bomProgressTitle: document.querySelector("#bom-progress-title"),
  bomProgressDetail: document.querySelector("#bom-progress-detail"),
  bomProgressPercent: document.querySelector("#bom-progress-percent"),
  mainBomProgress: document.querySelector("#main-bom-progress"),
  mainBomProgressRing: document.querySelector("#main-bom-progress-ring"),
  mainBomProgressCount: document.querySelector("#main-bom-progress-count"),
  mainBomProgressTitle: document.querySelector("#main-bom-progress-title"),
  mainBomProgressDetail: document.querySelector("#main-bom-progress-detail"),
  mainBomProgressPercent: document.querySelector("#main-bom-progress-percent"),
  successMessage: document.querySelector("#success-message"),
  reportGenerated: document.querySelector("#report-generated"),
  overrideReviewCard: document.querySelector("#override-review-card"),
  overrideReviewList: document.querySelector("#override-review-list"),
  factorSource: document.querySelector("#factor-source"),
  warning: document.querySelector("#warning"),
  odMm: document.querySelector("#od-mm"),
  weightKgm: document.querySelector("#weight-kgm"),
  totalWeight: document.querySelector("#total-weight"),
  rawSteel: document.querySelector("#raw-steel"),
  medianFactor: document.querySelector("#median-factor"),
  medianRsKg: document.querySelector("#median-rs-kg"),
  medianRsM: document.querySelector("#median-rs-m"),
  medianTotal: document.querySelector("#median-total"),
  p90Factor: document.querySelector("#p90-factor"),
  p90RsKg: document.querySelector("#p90-rs-kg"),
  p90RsM: document.querySelector("#p90-rs-m"),
  p90Total: document.querySelector("#p90-total"),
  pipeBasisMaterial: document.querySelector("#pipe-basis-material"),
  pipeBasisSizeWall: document.querySelector("#pipe-basis-size-wall"),
  pipeBasisCoating: document.querySelector("#pipe-basis-coating"),
  pipeBasisRaw: document.querySelector("#pipe-basis-raw"),
  pipeBasisFactor: document.querySelector("#pipe-basis-factor"),
  pipeBasisFinishedRate: document.querySelector("#pipe-basis-finished-rate"),
  pipeBasisRiskReserve: document.querySelector("#pipe-basis-risk-reserve"),
  pipeBasisP90Uplift: document.querySelector("#pipe-basis-p90-uplift"),
  pipeBasisP90Total: document.querySelector("#pipe-basis-p90-total"),
  lineItemsBody: document.querySelector("#line-items-body"),
  lineCount: document.querySelector("#line-count"),
  categoryCount: document.querySelector("#category-count"),
  categoryLineCheck: document.querySelector("#category-line-check"),
  categoryTables: document.querySelector("#category-tables"),
  sortButtons: document.querySelectorAll(".sort-button"),
  summaryWeight: document.querySelector("#summary-weight"),
  summaryMedian: document.querySelector("#summary-median"),
  summaryP90: document.querySelector("#summary-p90"),
  whatIfBase: document.querySelector("#whatif-base"),
  whatIfLow: document.querySelector("#whatif-low"),
  whatIfHigh: document.querySelector("#whatif-high"),
  whatIfRange: document.querySelector("#whatif-range"),
  whatIfDriver: document.querySelector("#whatif-driver"),
  whatIfChart: document.querySelector("#whatif-chart"),
  whatIfBody: document.querySelector("#whatif-body"),
  whatIfScope: document.querySelector("#whatif-scope"),
  whatIfScopeNote: document.querySelector("#whatif-scope-note"),
  whatIfToggles: document.querySelectorAll(".whatif-toggle"),
  whatIfSortButtons: document.querySelectorAll(".whatif-sort-button"),
  bomGroupCount: document.querySelector("#bom-group-count"),
  bomGroupTables: document.querySelector("#bom-group-tables"),
  serviceLocation: document.querySelector("#service-location"),
  serviceRegulatoryClass: document.querySelector("#service-regulatory-class"),
  serviceCostTotalPill: document.querySelector("#service-cost-total-pill"),
  serviceReadyCount: document.querySelector("#service-ready-count"),
  serviceReviewCount: document.querySelector("#service-review-count"),
  serviceErectionQuantity: document.querySelector("#service-erection-quantity"),
  serviceWeldingQuantity: document.querySelector("#service-welding-quantity"),
  serviceErectionTotal: document.querySelector("#service-erection-total"),
  serviceWeldingTotal: document.querySelector("#service-welding-total"),
  serviceValveTotal: document.querySelector("#service-valve-total"),
  serviceReworkRate: document.querySelector("#service-rework-rate"),
  serviceCivilSupportScope: document.querySelector("#service-civil-support-scope"),
  serviceReworkTotal: document.querySelector("#service-rework-total"),
  serviceReworkId: document.querySelector("#service-rework-id"),
  serviceSupportTotal: document.querySelector("#service-support-total"),
  serviceSupportMt: document.querySelector("#service-support-mt"),
  serviceSupportCivilTotal: document.querySelector("#service-support-civil-total"),
  serviceSupportCivilBasis: document.querySelector("#service-support-civil-basis"),
  serviceSupportTableWrap: document.querySelector("#service-support-table-wrap"),
  serviceInsulationTotal: document.querySelector("#service-insulation-total"),
  serviceInsulationBasis: document.querySelector("#service-insulation-basis"),
  serviceInsulationTableWrap: document.querySelector("#service-insulation-table-wrap"),
  servicePaintingScope: document.querySelector("#service-painting-scope"),
  servicePaintingTotal: document.querySelector("#service-painting-total"),
  servicePaintingBasis: document.querySelector("#service-painting-basis"),
  servicePaintingTableWrap: document.querySelector("#service-painting-table-wrap"),
  servicePwhtTotal: document.querySelector("#service-pwht-total"),
  servicePwhtBasis: document.querySelector("#service-pwht-basis"),
  servicePwhtTableWrap: document.querySelector("#service-pwht-table-wrap"),
  serviceDirectTotal: document.querySelector("#service-direct-total"),
  servicePartBWrap: document.querySelector("#service-part-b-wrap"),
  serviceCostTableWrap: document.querySelector("#service-cost-table-wrap"),
  rawSteelSlider: document.querySelector("#raw-steel-slider"),
  rawSteelSliderValue: document.querySelector("#raw-steel-slider-value"),
  rawSteelSliderRate: document.querySelector("#raw-steel-slider-rate"),
  rawSteelSliderBase: document.querySelector("#raw-steel-slider-base"),
  rawSteelSliderThumb: document.querySelector("#raw-steel-slider-thumb"),
  rawSteelSliderProgress: document.querySelector("#raw-steel-slider-progress"),
  rawMaterialSliderPanel: document.querySelector("#raw-material-slider-panel"),
  pipeFactorSlider: document.querySelector("#pipe-factor-slider"),
  pipeFactorSliderValue: document.querySelector("#pipe-factor-slider-value"),
  pipeFactorSliderRate: document.querySelector("#pipe-factor-slider-rate"),
  pipeFactorSliderBase: document.querySelector("#pipe-factor-slider-base"),
  pipeFactorSliderThumb: document.querySelector("#pipe-factor-slider-thumb"),
  pipeFactorSliderProgress: document.querySelector("#pipe-factor-slider-progress"),
  pipeFactorSliderPanel: document.querySelector("#pipe-factor-slider-panel"),
  componentFactorSlider: document.querySelector("#component-factor-slider"),
  componentFactorSliderValue: document.querySelector("#component-factor-slider-value"),
  componentFactorSliderRate: document.querySelector("#component-factor-slider-rate"),
  componentFactorSliderBase: document.querySelector("#component-factor-slider-base"),
  componentFactorSliderThumb: document.querySelector("#component-factor-slider-thumb"),
  componentFactorSliderProgress: document.querySelector("#component-factor-slider-progress"),
  componentFactorSliderPanel: document.querySelector("#component-factor-slider-panel"),
};

const lineItems = [];
const bomGroupItems = [];
const additionalServiceItems = [];
let materialSpecificationRows = [];
let materialSpecificationStatus = "loading";
let rawMaterialPriceLibrary = [];
let rawMaterialPriceLibraryStatus = "loading";
let pwhtRulesData = null;
let pwhtRulesSource = "loading";
// Controlled fallback for a common NRL PMS class. The full JSON library remains
// the primary source; this prevents a failed JSON request from suppressing a
// valid B21N or D25A assessment in a static-browser session.
const builtInPwhtFallbackRules = [
  {
    pipe_class: "B21N",
    rating_lb: 300,
    pipe_material: ["ASTM A312 TP316L, solution heat treated, seamless"],
    size_schedule: "0.5-1.5 in Sch 40S; 2-3 in Sch 10S; 4-16 in Sch 40S",
    rule: { type: "ALL_THICKNESSES_NO_EXEMPTION_STATED", pwht_required: true },
    source_pages: [21, 103],
  },
  {
    pipe_class: "D25A",
    rating_lb: 600,
    pipe_material: ["ASTM A106 Grade B", "Normalized for applicable larger sizes"],
    size_schedule: "0.5-1.5 in Sch 160; 2-8 in XS; 10-14 in Sch 80",
    rule: { type: "WALL_THICKNESS", operator: ">", threshold_mm: 19.05 },
    source_pages: [29, 117],
  },
];
let flangeWeightModelPromise = null;
let successTimer;
let inputError = "";
let sortState = { key: "", direction: "asc" };
let whatIfSortState = { key: "", direction: "asc" };

function setSideNavCollapsed(isCollapsed) {
  if (!elements.sideNav || !elements.sideNavToggle) return;

  document.body.classList.toggle("side-nav-collapsed", isCollapsed);
  elements.sideNav.setAttribute("aria-hidden", "false");
  elements.sideNavToggle.setAttribute("aria-expanded", String(!isCollapsed));
  elements.sideNavToggle.setAttribute(
    "aria-label",
    isCollapsed ? "Open sidebar" : "Close sidebar"
  );
  elements.sideNavToggle.dataset.tooltip = isCollapsed ? "Open sidebar" : "Close sidebar";
}

function setActiveSideNavLink(hash) {
  elements.sideNavLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === hash);
  });
}

function updateActiveSideNavOnScroll() {
  const sectionLinks = Array.from(elements.sideNavLinks)
    .map((link) => ({
      link,
      section: document.querySelector(link.getAttribute("href")),
    }))
    .filter((item) => item.section);

  const activeItem = sectionLinks
    .filter((item) => item.section.getBoundingClientRect().top <= 140)
    .pop() || sectionLinks[0];

  if (activeItem) setActiveSideNavLink(activeItem.link.getAttribute("href"));
}

const builtInMaterialSpecificationRows = [
  {
    id: "MS-001",
    basic_material_of_construction: "Carbon Steel",
    pipes: {
      material_standard: [
        "A 53Gr.A/B",
        "A106Gr.A/B/C",
        "A671/A672",
        "API 5LGr. A25,P/A/B",
        "IS-1239 BLACK",
        "IS-3589 GR.330",
      ],
    },
  },
  {
    id: "MS-002",
    basic_material_of_construction: "Low Temp.CS",
    pipes: { material_standard: ["A333 Gr.1", "A333 Gr.6"] },
  },
  {
    id: "MS-003",
    basic_material_of_construction: "Low & Int.Alloy Steel for Low temp.Service",
    pipes: { material_standard: ["A333 Gr.3", "A333 Gr.4", "A333 Gr.7", "A333 Gr.8", "A333 Gr.9"] },
  },
  {
    id: "MS-008",
    basic_material_of_construction: "High Strength Carbon /Low Alloy Steel. (All API 5L PSL 2 Pipe)",
    pipes: {
      material_standard: [
        "API 5L X42",
        "API 5L X46",
        "API 5L X52",
        "API 5L X56",
        "API 5L X60",
        "API 5L X65",
        "API 5L X70",
        "API 5L X80",
        "API 5L X90",
        "API 5L X100",
        "API 5L X120",
      ],
    },
  },
  {
    id: "MS-016",
    basic_material_of_construction: "Low & Int. Alloy Steel for High temp Service",
    pipes: {
      material_standard: [
        "A335 Gr.P1",
        "A335 Gr.P2",
        "A335 Gr.P36",
        "A335 Gr.P12",
        "A335 Gr.P11",
        "A335 Gr.P15",
        "A335 Gr.P22",
        "A335 Gr.P23",
        "A335 Gr.P21",
        "A335 Gr.P5",
        "A335 Gr.P9",
        "A335 Gr.P91",
        "A335 Gr.P92",
        "A335 Gr.P122",
        "A335Gr.P911",
        "A691 1 CR",
        "A691 5 CR",
        "A691 9 CR",
      ],
    },
  },
  {
    id: "MS-029",
    basic_material_of_construction: "Austenitic Stainless Steel",
    pipes: {
      material_standard: [
        "A312 TP 304",
        "A312 TP 304L",
        "A312 TP 316",
        "A312 TP 316L",
        "A312 TP 321",
        "A312 TP316Ti",
        "A312 TP 347",
        "A312 TP 317",
        "A312 TP 317L",
        "A312 TP 309",
        "A312 TP 310",
        "A358 Gr.304",
        "A358 Gr.316",
        "A358 Gr.316L",
      ],
    },
  },
  {
    id: "MS-040",
    basic_material_of_construction: "Ferritic/Austenitic (Duplex) Stainless Steel",
    pipes: {
      material_standard: [
        "A790 S 31803",
        "A790 S 32205",
        "A790 S 32304",
        "A790 S 32900",
        "A790 S 32950",
        "A790 S 32750",
        "A790 S 32760",
        "A790 S 32550",
        "A790 S 32906",
      ],
    },
  },
  {
    id: "MS-050",
    basic_material_of_construction: "NON-FERROUS MATERIALS - Monel-400 (UNS N04400)",
    pipes: { material_standard: ["B165", "B165 / B725", "UNS N04400"] },
  },
  {
    id: "MS-051",
    basic_material_of_construction: "NON-FERROUS MATERIALS - Inconel / Nickel Alloy",
    pipes: {
      material_standard: [
        "B 423",
        "B 705",
        "UNS N08825",
        "B 407",
        "UNS N08800",
        "B 444",
        "UNS N06625",
        "B167",
        "B517",
        "UNS N06600",
      ],
    },
  },
];

const additionalCarbonSteelPipeStandards = ["IS-1239 BLACK", "IS-3589 GR.330"];

const builtInRawMaterialPriceLibrary = [
  {
    "basic_mat_of_const": "Carbon Steel",
    "children": [
      {
        "ch_comp": "C",
        "pipe_mat_std": [
          "A53 Gr.A/B",
          "A106 Gr.A/B/C",
          "A671/A672",
          "API 5L Gr.A25/P/A/B"
        ],
        "raw_material_basis": "CS billet / bloom / HR coil / plate / skelp",
        "rate_inr_per_kg": {
          "low": 50.0,
          "recommended": 56.5,
          "high": 60.0
        },
        "source_material_name": "Carbon Steel, C",
        "yearly_rate_inr_per_kg": {
          "2021": {
            "low": 55.0,
            "recommended": 64.75,
            "high": 70.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.0,
            "factor_wrt_ss304": 0.268817,
            "factor_wrt_ss316_ss316l": 0.22961,
            "revision_note": "No change"
          },
          "2022": {
            "low": 54.0,
            "recommended": 70.9,
            "high": 80.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.0,
            "factor_wrt_ss304": 0.268815,
            "factor_wrt_ss316_ss316l": 0.182732,
            "revision_note": "No change"
          },
          "2023": {
            "low": 47.0,
            "recommended": 57.4,
            "high": 63.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.0,
            "factor_wrt_ss304": 0.268815,
            "factor_wrt_ss316_ss316l": 0.154509,
            "revision_note": "No change"
          },
          "2024": {
            "low": 47.0,
            "recommended": 52.2,
            "high": 55.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.0,
            "factor_wrt_ss304": 0.268823,
            "factor_wrt_ss316_ss316l": 0.158904,
            "revision_note": "No change"
          },
          "2025": {
            "low": 44.0,
            "recommended": 55.05,
            "high": 61.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.0,
            "factor_wrt_ss304": 0.268812,
            "factor_wrt_ss316_ss316l": 0.167452,
            "revision_note": "No change"
          },
          "2026": {
            "low": 50.0,
            "recommended": 56.5,
            "high": 60.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.0,
            "factor_wrt_ss304": 0.268817,
            "factor_wrt_ss316_ss316l": 0.173579,
            "revision_note": "No change"
          }
        },
        "factor_wrt_cs_by_year": {
          "2021": 1.0,
          "2022": 1.0,
          "2023": 1.0,
          "2024": 1.0,
          "2025": 1.0,
          "2026": 1.0
        },
        "percentile_used": 0.65
      }
    ]
  },
  {
    "basic_mat_of_const": "Low Temp.CS",
    "children": [
      {
        "ch_comp": "C,Si",
        "pipe_mat_std": [
          "A333 Gr.1",
          "A333 Gr.6"
        ],
        "raw_material_basis": "Killed fine grain CS billet / LTCS plate",
        "rate_inr_per_kg": {
          "low": 60.0,
          "recommended": 67.8,
          "high": 72.0
        },
        "source_material_name": "Low Temp CS, C-Si",
        "yearly_rate_inr_per_kg": {
          "2021": {
            "low": 66.0,
            "recommended": 77.7,
            "high": 84.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.2,
            "factor_wrt_ss304": 0.322581,
            "factor_wrt_ss316_ss316l": 0.275532,
            "revision_note": "No change"
          },
          "2022": {
            "low": 64.8,
            "recommended": 85.08,
            "high": 96.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.2,
            "factor_wrt_ss304": 0.322578,
            "factor_wrt_ss316_ss316l": 0.219278,
            "revision_note": "No change"
          },
          "2023": {
            "low": 56.4,
            "recommended": 68.88,
            "high": 75.6,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.2,
            "factor_wrt_ss304": 0.322578,
            "factor_wrt_ss316_ss316l": 0.18541,
            "revision_note": "No change"
          },
          "2024": {
            "low": 56.4,
            "recommended": 62.64,
            "high": 66.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.2,
            "factor_wrt_ss304": 0.322587,
            "factor_wrt_ss316_ss316l": 0.190685,
            "revision_note": "No change"
          },
          "2025": {
            "low": 52.8,
            "recommended": 66.06,
            "high": 73.2,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.2,
            "factor_wrt_ss304": 0.322574,
            "factor_wrt_ss316_ss316l": 0.200943,
            "revision_note": "No change"
          },
          "2026": {
            "low": 60.0,
            "recommended": 67.8,
            "high": 72.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.2,
            "factor_wrt_ss304": 0.322581,
            "factor_wrt_ss316_ss316l": 0.208295,
            "revision_note": "No change"
          }
        },
        "factor_wrt_cs_by_year": {
          "2021": 1.2,
          "2022": 1.2,
          "2023": 1.2,
          "2024": 1.2,
          "2025": 1.2,
          "2026": 1.2
        },
        "percentile_used": 0.65
      }
    ]
  },
  {
    "basic_mat_of_const": "Low & Int.Alloy Steel for Low temp.Service",
    "children": [
      {
        "ch_comp": "3½Ni",
        "pipe_mat_std": [
          "A333 Gr.3"
        ],
        "raw_material_basis": "3.5% nickel alloy steel billet / plate",
        "rate_inr_per_kg": {
          "low": 110.5,
          "recommended": 124.865,
          "high": 132.6
        },
        "source_material_name": "Low temp alloy steel, 3.5Ni",
        "yearly_rate_inr_per_kg": {
          "2021": {
            "low": 121.55,
            "recommended": 143.0975,
            "high": 154.7,
            "percentile_used": 0.65,
            "factor_wrt_cs": 2.21,
            "factor_wrt_ss304": 0.594086,
            "factor_wrt_ss316_ss316l": 0.507438,
            "revision_note": "No change"
          },
          "2022": {
            "low": 119.34,
            "recommended": 156.689,
            "high": 176.8,
            "percentile_used": 0.65,
            "factor_wrt_cs": 2.21,
            "factor_wrt_ss304": 0.594082,
            "factor_wrt_ss316_ss316l": 0.403838,
            "revision_note": "No change"
          },
          "2023": {
            "low": 103.87,
            "recommended": 126.854,
            "high": 139.23,
            "percentile_used": 0.65,
            "factor_wrt_cs": 2.21,
            "factor_wrt_ss304": 0.59408,
            "factor_wrt_ss316_ss316l": 0.341464,
            "revision_note": "No change"
          },
          "2024": {
            "low": 103.87,
            "recommended": 115.362,
            "high": 121.55,
            "percentile_used": 0.65,
            "factor_wrt_cs": 2.21,
            "factor_wrt_ss304": 0.594098,
            "factor_wrt_ss316_ss316l": 0.351178,
            "revision_note": "No change"
          },
          "2025": {
            "low": 97.24,
            "recommended": 121.6605,
            "high": 134.81,
            "percentile_used": 0.65,
            "factor_wrt_cs": 2.21,
            "factor_wrt_ss304": 0.594074,
            "factor_wrt_ss316_ss316l": 0.37007,
            "revision_note": "No change"
          },
          "2026": {
            "low": 110.5,
            "recommended": 124.865,
            "high": 132.6,
            "percentile_used": 0.65,
            "factor_wrt_cs": 2.21,
            "factor_wrt_ss304": 0.594086,
            "factor_wrt_ss316_ss316l": 0.38361,
            "revision_note": "No change"
          }
        },
        "factor_wrt_cs_by_year": {
          "2021": 2.21,
          "2022": 2.21,
          "2023": 2.21,
          "2024": 2.21,
          "2025": 2.21,
          "2026": 2.21
        },
        "percentile_used": 0.65
      },
      {
        "ch_comp": "¾Cr, ¾Ni",
        "pipe_mat_std": [
          "A333 Gr.4"
        ],
        "raw_material_basis": "Cr-Ni low temperature alloy steel billet",
        "rate_inr_per_kg": {
          "low": 78.0,
          "recommended": 88.14,
          "high": 93.6
        },
        "source_material_name": "Low temp alloy steel, 0.75Cr-0.75Ni",
        "yearly_rate_inr_per_kg": {
          "2021": {
            "low": 85.8,
            "recommended": 101.01,
            "high": 109.2,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.56,
            "factor_wrt_ss304": 0.419355,
            "factor_wrt_ss316_ss316l": 0.358191,
            "revision_note": "No change"
          },
          "2022": {
            "low": 84.24,
            "recommended": 110.604,
            "high": 124.8,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.56,
            "factor_wrt_ss304": 0.419352,
            "factor_wrt_ss316_ss316l": 0.285062,
            "revision_note": "No change"
          },
          "2023": {
            "low": 73.32,
            "recommended": 89.544,
            "high": 98.28,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.56,
            "factor_wrt_ss304": 0.419351,
            "factor_wrt_ss316_ss316l": 0.241034,
            "revision_note": "No change"
          },
          "2024": {
            "low": 73.32,
            "recommended": 81.432,
            "high": 85.8,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.56,
            "factor_wrt_ss304": 0.419363,
            "factor_wrt_ss316_ss316l": 0.24789,
            "revision_note": "No change"
          },
          "2025": {
            "low": 68.64,
            "recommended": 85.878,
            "high": 95.16,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.56,
            "factor_wrt_ss304": 0.419347,
            "factor_wrt_ss316_ss316l": 0.261226,
            "revision_note": "No change"
          },
          "2026": {
            "low": 78.0,
            "recommended": 88.14,
            "high": 93.6,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.56,
            "factor_wrt_ss304": 0.419355,
            "factor_wrt_ss316_ss316l": 0.270783,
            "revision_note": "No change"
          }
        },
        "factor_wrt_cs_by_year": {
          "2021": 1.56,
          "2022": 1.56,
          "2023": 1.56,
          "2024": 1.56,
          "2025": 1.56,
          "2026": 1.56
        },
        "percentile_used": 0.65
      },
      {
        "ch_comp": "2½Ni",
        "pipe_mat_std": [
          "A333 Gr.7"
        ],
        "raw_material_basis": "2.5% nickel alloy steel billet / plate",
        "rate_inr_per_kg": {
          "low": 93.0,
          "recommended": 105.09,
          "high": 111.6
        },
        "source_material_name": "Low temp alloy steel, 2.5Ni",
        "yearly_rate_inr_per_kg": {
          "2021": {
            "low": 102.3,
            "recommended": 120.435,
            "high": 130.2,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.86,
            "factor_wrt_ss304": 0.5,
            "factor_wrt_ss316_ss316l": 0.427074,
            "revision_note": "No change"
          },
          "2022": {
            "low": 100.44,
            "recommended": 131.874,
            "high": 148.8,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.86,
            "factor_wrt_ss304": 0.499996,
            "factor_wrt_ss316_ss316l": 0.339881,
            "revision_note": "No change"
          },
          "2023": {
            "low": 87.42,
            "recommended": 106.764,
            "high": 117.18,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.86,
            "factor_wrt_ss304": 0.499995,
            "factor_wrt_ss316_ss316l": 0.287386,
            "revision_note": "No change"
          },
          "2024": {
            "low": 87.42,
            "recommended": 97.092,
            "high": 102.3,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.86,
            "factor_wrt_ss304": 0.50001,
            "factor_wrt_ss316_ss316l": 0.295562,
            "revision_note": "No change"
          },
          "2025": {
            "low": 81.84,
            "recommended": 102.393,
            "high": 113.46,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.86,
            "factor_wrt_ss304": 0.49999,
            "factor_wrt_ss316_ss316l": 0.311462,
            "revision_note": "No change"
          },
          "2026": {
            "low": 93.0,
            "recommended": 105.09,
            "high": 111.6,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.86,
            "factor_wrt_ss304": 0.5,
            "factor_wrt_ss316_ss316l": 0.322857,
            "revision_note": "No change"
          }
        },
        "factor_wrt_cs_by_year": {
          "2021": 1.86,
          "2022": 1.86,
          "2023": 1.86,
          "2024": 1.86,
          "2025": 1.86,
          "2026": 1.86
        },
        "percentile_used": 0.65
      },
      {
        "ch_comp": "9Ni",
        "pipe_mat_std": [
          "A333 Gr.8"
        ],
        "raw_material_basis": "9% nickel steel plate / billet",
        "rate_inr_per_kg": {
          "low": 199.0,
          "recommended": 224.87,
          "high": 238.8
        },
        "source_material_name": "Low temp alloy steel, 9Ni",
        "yearly_rate_inr_per_kg": {
          "2021": {
            "low": 218.9,
            "recommended": 257.705,
            "high": 278.6,
            "percentile_used": 0.65,
            "factor_wrt_cs": 3.98,
            "factor_wrt_ss304": 1.069892,
            "factor_wrt_ss316_ss316l": 0.913848,
            "revision_note": "No change"
          },
          "2022": {
            "low": 214.92,
            "recommended": 282.182,
            "high": 318.4,
            "percentile_used": 0.65,
            "factor_wrt_cs": 3.98,
            "factor_wrt_ss304": 1.069884,
            "factor_wrt_ss316_ss316l": 0.727273,
            "revision_note": "No change"
          },
          "2023": {
            "low": 187.06,
            "recommended": 228.452,
            "high": 250.74,
            "percentile_used": 0.65,
            "factor_wrt_cs": 3.98,
            "factor_wrt_ss304": 1.069882,
            "factor_wrt_ss316_ss316l": 0.614945,
            "revision_note": "No change"
          },
          "2024": {
            "low": 187.06,
            "recommended": 207.756,
            "high": 218.9,
            "percentile_used": 0.65,
            "factor_wrt_cs": 3.98,
            "factor_wrt_ss304": 1.069915,
            "factor_wrt_ss316_ss316l": 0.632438,
            "revision_note": "No change"
          },
          "2025": {
            "low": 175.12,
            "recommended": 219.099,
            "high": 242.78,
            "percentile_used": 0.65,
            "factor_wrt_cs": 3.98,
            "factor_wrt_ss304": 1.069872,
            "factor_wrt_ss316_ss316l": 0.666461,
            "revision_note": "No change"
          },
          "2026": {
            "low": 199.0,
            "recommended": 224.87,
            "high": 238.8,
            "percentile_used": 0.65,
            "factor_wrt_cs": 3.98,
            "factor_wrt_ss304": 1.069892,
            "factor_wrt_ss316_ss316l": 0.690845,
            "revision_note": "No change"
          }
        },
        "factor_wrt_cs_by_year": {
          "2021": 3.98,
          "2022": 3.98,
          "2023": 3.98,
          "2024": 3.98,
          "2025": 3.98,
          "2026": 3.98
        },
        "percentile_used": 0.65
      },
      {
        "ch_comp": "2Ni, 1Cu",
        "pipe_mat_std": [
          "A333 Gr.9"
        ],
        "raw_material_basis": "Ni-Cu low temperature alloy steel billet",
        "rate_inr_per_kg": {
          "low": 110.5,
          "recommended": 124.865,
          "high": 132.6
        },
        "source_material_name": "Low temp alloy steel, 2Ni-1Cu",
        "yearly_rate_inr_per_kg": {
          "2021": {
            "low": 121.55,
            "recommended": 143.0975,
            "high": 154.7,
            "percentile_used": 0.65,
            "factor_wrt_cs": 2.21,
            "factor_wrt_ss304": 0.594086,
            "factor_wrt_ss316_ss316l": 0.507438,
            "revision_note": "No change"
          },
          "2022": {
            "low": 119.34,
            "recommended": 156.689,
            "high": 176.8,
            "percentile_used": 0.65,
            "factor_wrt_cs": 2.21,
            "factor_wrt_ss304": 0.594082,
            "factor_wrt_ss316_ss316l": 0.403838,
            "revision_note": "No change"
          },
          "2023": {
            "low": 103.87,
            "recommended": 126.854,
            "high": 139.23,
            "percentile_used": 0.65,
            "factor_wrt_cs": 2.21,
            "factor_wrt_ss304": 0.59408,
            "factor_wrt_ss316_ss316l": 0.341464,
            "revision_note": "No change"
          },
          "2024": {
            "low": 103.87,
            "recommended": 115.362,
            "high": 121.55,
            "percentile_used": 0.65,
            "factor_wrt_cs": 2.21,
            "factor_wrt_ss304": 0.594098,
            "factor_wrt_ss316_ss316l": 0.351178,
            "revision_note": "No change"
          },
          "2025": {
            "low": 97.24,
            "recommended": 121.6605,
            "high": 134.81,
            "percentile_used": 0.65,
            "factor_wrt_cs": 2.21,
            "factor_wrt_ss304": 0.594074,
            "factor_wrt_ss316_ss316l": 0.37007,
            "revision_note": "No change"
          },
          "2026": {
            "low": 110.5,
            "recommended": 124.865,
            "high": 132.6,
            "percentile_used": 0.65,
            "factor_wrt_cs": 2.21,
            "factor_wrt_ss304": 0.594086,
            "factor_wrt_ss316_ss316l": 0.38361,
            "revision_note": "No change"
          }
        },
        "factor_wrt_cs_by_year": {
          "2021": 2.21,
          "2022": 2.21,
          "2023": 2.21,
          "2024": 2.21,
          "2025": 2.21,
          "2026": 2.21
        },
        "percentile_used": 0.65
      }
    ]
  },
  {
    "basic_mat_of_const": "High Strength Carbon / Low Alloy Steel",
    "children": [
      {
        "ch_comp": "C,Mn,Co,V,Ti",
        "grade_family": "API 5L PSL 2, X42 to X52",
        "pipe_mat_std": [
          "API 5L X42",
          "API 5L X46",
          "API 5L X52"
        ],
        "raw_material_basis": "HSLA plate / TMCP skelp / coil",
        "rate_inr_per_kg": {
          "low": 62.0,
          "recommended": 70.06,
          "high": 74.4
        },
        "source_material_name": "API 5L high strength, X42 to X52",
        "yearly_rate_inr_per_kg": {
          "2021": {
            "low": 68.2,
            "recommended": 80.29,
            "high": 86.8,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.24,
            "factor_wrt_ss304": 0.333333,
            "factor_wrt_ss316_ss316l": 0.284716,
            "revision_note": "No change"
          },
          "2022": {
            "low": 66.96,
            "recommended": 87.916,
            "high": 99.2,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.24,
            "factor_wrt_ss304": 0.333331,
            "factor_wrt_ss316_ss316l": 0.226588,
            "revision_note": "No change"
          },
          "2023": {
            "low": 58.28,
            "recommended": 71.176,
            "high": 78.12,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.24,
            "factor_wrt_ss304": 0.33333,
            "factor_wrt_ss316_ss316l": 0.191591,
            "revision_note": "No change"
          },
          "2024": {
            "low": 58.28,
            "recommended": 64.728,
            "high": 68.2,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.24,
            "factor_wrt_ss304": 0.33334,
            "factor_wrt_ss316_ss316l": 0.197041,
            "revision_note": "No change"
          },
          "2025": {
            "low": 54.56,
            "recommended": 68.262,
            "high": 75.64,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.24,
            "factor_wrt_ss304": 0.333327,
            "factor_wrt_ss316_ss316l": 0.207641,
            "revision_note": "No change"
          },
          "2026": {
            "low": 62.0,
            "recommended": 70.06,
            "high": 74.4,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.24,
            "factor_wrt_ss304": 0.333333,
            "factor_wrt_ss316_ss316l": 0.215238,
            "revision_note": "No change"
          }
        },
        "factor_wrt_cs_by_year": {
          "2021": 1.24,
          "2022": 1.24,
          "2023": 1.24,
          "2024": 1.24,
          "2025": 1.24,
          "2026": 1.24
        },
        "percentile_used": 0.65
      },
      {
        "ch_comp": "C,Mn,Co,V,Ti",
        "grade_family": "API 5L PSL 2, X56 to X70",
        "pipe_mat_std": [
          "API 5L X56",
          "API 5L X60",
          "API 5L X65",
          "API 5L X70"
        ],
        "raw_material_basis": "Higher strength HSLA plate / TMCP skelp",
        "rate_inr_per_kg": {
          "low": 71.0,
          "recommended": 80.23,
          "high": 85.2
        },
        "source_material_name": "API 5L high strength, X56 to X70",
        "yearly_rate_inr_per_kg": {
          "2021": {
            "low": 78.1,
            "recommended": 91.945,
            "high": 99.4,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.42,
            "factor_wrt_ss304": 0.38172,
            "factor_wrt_ss316_ss316l": 0.326046,
            "revision_note": "No change"
          },
          "2022": {
            "low": 76.68,
            "recommended": 100.678,
            "high": 113.6,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.42,
            "factor_wrt_ss304": 0.381718,
            "factor_wrt_ss316_ss316l": 0.259479,
            "revision_note": "No change"
          },
          "2023": {
            "low": 66.74,
            "recommended": 81.508,
            "high": 89.46,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.42,
            "factor_wrt_ss304": 0.381717,
            "factor_wrt_ss316_ss316l": 0.219402,
            "revision_note": "No change"
          },
          "2024": {
            "low": 66.74,
            "recommended": 74.124,
            "high": 78.1,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.42,
            "factor_wrt_ss304": 0.381728,
            "factor_wrt_ss316_ss316l": 0.225644,
            "revision_note": "No change"
          },
          "2025": {
            "low": 62.48,
            "recommended": 78.171,
            "high": 86.62,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.42,
            "factor_wrt_ss304": 0.381713,
            "factor_wrt_ss316_ss316l": 0.237783,
            "revision_note": "No change"
          },
          "2026": {
            "low": 71.0,
            "recommended": 80.23,
            "high": 85.2,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.42,
            "factor_wrt_ss304": 0.38172,
            "factor_wrt_ss316_ss316l": 0.246482,
            "revision_note": "No change"
          }
        },
        "factor_wrt_cs_by_year": {
          "2021": 1.42,
          "2022": 1.42,
          "2023": 1.42,
          "2024": 1.42,
          "2025": 1.42,
          "2026": 1.42
        },
        "percentile_used": 0.65
      },
      {
        "ch_comp": "C,Mn,Co,V,Ti",
        "grade_family": "API 5L PSL 2, X80 to X120",
        "pipe_mat_std": [
          "API 5L X80",
          "API 5L X90",
          "API 5L X100",
          "API 5L X120"
        ],
        "raw_material_basis": "Premium HSLA / TMCP plate / skelp",
        "rate_inr_per_kg": {
          "low": 93.0,
          "recommended": 105.09,
          "high": 111.6
        },
        "source_material_name": "API 5L high strength, X80 to X120",
        "yearly_rate_inr_per_kg": {
          "2021": {
            "low": 102.3,
            "recommended": 120.435,
            "high": 130.2,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.86,
            "factor_wrt_ss304": 0.5,
            "factor_wrt_ss316_ss316l": 0.427074,
            "revision_note": "No change"
          },
          "2022": {
            "low": 100.44,
            "recommended": 131.874,
            "high": 148.8,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.86,
            "factor_wrt_ss304": 0.499996,
            "factor_wrt_ss316_ss316l": 0.339881,
            "revision_note": "No change"
          },
          "2023": {
            "low": 87.42,
            "recommended": 106.764,
            "high": 117.18,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.86,
            "factor_wrt_ss304": 0.499995,
            "factor_wrt_ss316_ss316l": 0.287386,
            "revision_note": "No change"
          },
          "2024": {
            "low": 87.42,
            "recommended": 97.092,
            "high": 102.3,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.86,
            "factor_wrt_ss304": 0.50001,
            "factor_wrt_ss316_ss316l": 0.295562,
            "revision_note": "No change"
          },
          "2025": {
            "low": 81.84,
            "recommended": 102.393,
            "high": 113.46,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.86,
            "factor_wrt_ss304": 0.49999,
            "factor_wrt_ss316_ss316l": 0.311462,
            "revision_note": "No change"
          },
          "2026": {
            "low": 93.0,
            "recommended": 105.09,
            "high": 111.6,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.86,
            "factor_wrt_ss304": 0.5,
            "factor_wrt_ss316_ss316l": 0.322857,
            "revision_note": "No change"
          }
        },
        "factor_wrt_cs_by_year": {
          "2021": 1.86,
          "2022": 1.86,
          "2023": 1.86,
          "2024": 1.86,
          "2025": 1.86,
          "2026": 1.86
        },
        "percentile_used": 0.65
      }
    ]
  },
  {
    "basic_mat_of_const": "Low & Int. Alloy Steel for High temp Service",
    "children": [
      {
        "ch_comp": "C, ½Mo",
        "pipe_mat_std": [
          "A335 Gr.P1",
          "A691 CM65"
        ],
        "raw_material_basis": "C-Mo alloy steel billet",
        "rate_inr_per_kg": {
          "low": 97.5,
          "recommended": 110.175,
          "high": 117.0
        },
        "source_material_name": "C-0.5Mo alloy steel",
        "yearly_rate_inr_per_kg": {
          "2021": {
            "low": 107.25,
            "recommended": 126.2625,
            "high": 136.5,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.95,
            "factor_wrt_ss304": 0.524194,
            "factor_wrt_ss316_ss316l": 0.447739,
            "revision_note": "No change"
          },
          "2022": {
            "low": 105.3,
            "recommended": 138.255,
            "high": 156.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.95,
            "factor_wrt_ss304": 0.52419,
            "factor_wrt_ss316_ss316l": 0.356327,
            "revision_note": "No change"
          },
          "2023": {
            "low": 91.65,
            "recommended": 111.93,
            "high": 122.85,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.95,
            "factor_wrt_ss304": 0.524189,
            "factor_wrt_ss316_ss316l": 0.301292,
            "revision_note": "No change"
          },
          "2024": {
            "low": 91.65,
            "recommended": 101.79,
            "high": 107.25,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.95,
            "factor_wrt_ss304": 0.524204,
            "factor_wrt_ss316_ss316l": 0.309863,
            "revision_note": "No change"
          },
          "2025": {
            "low": 85.8,
            "recommended": 107.3475,
            "high": 118.95,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.95,
            "factor_wrt_ss304": 0.524183,
            "factor_wrt_ss316_ss316l": 0.326532,
            "revision_note": "No change"
          },
          "2026": {
            "low": 97.5,
            "recommended": 110.175,
            "high": 117.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 1.95,
            "factor_wrt_ss304": 0.524194,
            "factor_wrt_ss316_ss316l": 0.338479,
            "revision_note": "No change"
          }
        },
        "factor_wrt_cs_by_year": {
          "2021": 1.95,
          "2022": 1.95,
          "2023": 1.95,
          "2024": 1.95,
          "2025": 1.95,
          "2026": 1.95
        },
        "percentile_used": 0.65
      },
      {
        "ch_comp": "½Cr, ½Mo",
        "pipe_mat_std": [
          "A335 Gr.P2",
          "A335 Gr.P36",
          "A691 ½CR"
        ],
        "raw_material_basis": "Cr-Mo alloy steel billet",
        "rate_inr_per_kg": {
          "low": 110.5,
          "recommended": 124.865,
          "high": 132.6
        },
        "source_material_name": "0.5Cr-0.5Mo alloy steel",
        "yearly_rate_inr_per_kg": {
          "2021": {
            "low": 121.55,
            "recommended": 143.0975,
            "high": 154.7,
            "percentile_used": 0.65,
            "factor_wrt_cs": 2.21,
            "factor_wrt_ss304": 0.594086,
            "factor_wrt_ss316_ss316l": 0.507438,
            "revision_note": "No change"
          },
          "2022": {
            "low": 119.34,
            "recommended": 156.689,
            "high": 176.8,
            "percentile_used": 0.65,
            "factor_wrt_cs": 2.21,
            "factor_wrt_ss304": 0.594082,
            "factor_wrt_ss316_ss316l": 0.403838,
            "revision_note": "No change"
          },
          "2023": {
            "low": 103.87,
            "recommended": 126.854,
            "high": 139.23,
            "percentile_used": 0.65,
            "factor_wrt_cs": 2.21,
            "factor_wrt_ss304": 0.59408,
            "factor_wrt_ss316_ss316l": 0.341464,
            "revision_note": "No change"
          },
          "2024": {
            "low": 103.87,
            "recommended": 115.362,
            "high": 121.55,
            "percentile_used": 0.65,
            "factor_wrt_cs": 2.21,
            "factor_wrt_ss304": 0.594098,
            "factor_wrt_ss316_ss316l": 0.351178,
            "revision_note": "No change"
          },
          "2025": {
            "low": 97.24,
            "recommended": 121.6605,
            "high": 134.81,
            "percentile_used": 0.65,
            "factor_wrt_cs": 2.21,
            "factor_wrt_ss304": 0.594074,
            "factor_wrt_ss316_ss316l": 0.37007,
            "revision_note": "No change"
          },
          "2026": {
            "low": 110.5,
            "recommended": 124.865,
            "high": 132.6,
            "percentile_used": 0.65,
            "factor_wrt_cs": 2.21,
            "factor_wrt_ss304": 0.594086,
            "factor_wrt_ss316_ss316l": 0.38361,
            "revision_note": "No change"
          }
        },
        "factor_wrt_cs_by_year": {
          "2021": 2.21,
          "2022": 2.21,
          "2023": 2.21,
          "2024": 2.21,
          "2025": 2.21,
          "2026": 2.21
        },
        "percentile_used": 0.65
      },
      {
        "ch_comp": "1Cr, ½Mo / 1¼Cr, ½Mo",
        "pipe_mat_std": [
          "A335 Gr.P12",
          "A335 Gr.P11"
        ],
        "raw_material_basis": "Cr-Mo alloy steel billet",
        "rate_inr_per_kg": {
          "low": 119.5,
          "recommended": 135.035,
          "high": 143.4
        },
        "source_material_name": "1Cr-0.5Mo / 1.25Cr-0.5Mo",
        "yearly_rate_inr_per_kg": {
          "2021": {
            "low": 131.45,
            "recommended": 154.7525,
            "high": 167.3,
            "percentile_used": 0.65,
            "factor_wrt_cs": 2.39,
            "factor_wrt_ss304": 0.642473,
            "factor_wrt_ss316_ss316l": 0.548768,
            "revision_note": "No change"
          },
          "2022": {
            "low": 129.06,
            "recommended": 169.451,
            "high": 191.2,
            "percentile_used": 0.65,
            "factor_wrt_cs": 2.39,
            "factor_wrt_ss304": 0.642468,
            "factor_wrt_ss316_ss316l": 0.436729,
            "revision_note": "No change"
          },
          "2023": {
            "low": 112.33,
            "recommended": 137.186,
            "high": 150.57,
            "percentile_used": 0.65,
            "factor_wrt_cs": 2.39,
            "factor_wrt_ss304": 0.642467,
            "factor_wrt_ss316_ss316l": 0.369276,
            "revision_note": "No change"
          },
          "2024": {
            "low": 112.33,
            "recommended": 124.758,
            "high": 131.45,
            "percentile_used": 0.65,
            "factor_wrt_cs": 2.39,
            "factor_wrt_ss304": 0.642486,
            "factor_wrt_ss316_ss316l": 0.379781,
            "revision_note": "No change"
          },
          "2025": {
            "low": 105.16,
            "recommended": 131.5695,
            "high": 145.79,
            "percentile_used": 0.65,
            "factor_wrt_cs": 2.39,
            "factor_wrt_ss304": 0.642461,
            "factor_wrt_ss316_ss316l": 0.400211,
            "revision_note": "No change"
          },
          "2026": {
            "low": 119.5,
            "recommended": 135.035,
            "high": 143.4,
            "percentile_used": 0.65,
            "factor_wrt_cs": 2.39,
            "factor_wrt_ss304": 0.642473,
            "factor_wrt_ss316_ss316l": 0.414854,
            "revision_note": "No change"
          }
        },
        "factor_wrt_cs_by_year": {
          "2021": 2.39,
          "2022": 2.39,
          "2023": 2.39,
          "2024": 2.39,
          "2025": 2.39,
          "2026": 2.39
        },
        "percentile_used": 0.65
      },
      {
        "ch_comp": "2¼Cr, 1Mo",
        "pipe_mat_std": [
          "A335 Gr.P22",
          "A335 Gr.P23"
        ],
        "raw_material_basis": "2.25Cr-1Mo alloy steel billet",
        "rate_inr_per_kg": {
          "low": 155.0,
          "recommended": 175.15,
          "high": 186.0
        },
        "source_material_name": "2.25Cr-1Mo",
        "yearly_rate_inr_per_kg": {
          "2021": {
            "low": 170.5,
            "recommended": 200.725,
            "high": 217.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 3.1,
            "factor_wrt_ss304": 0.833333,
            "factor_wrt_ss316_ss316l": 0.711791,
            "revision_note": "No change"
          },
          "2022": {
            "low": 167.4,
            "recommended": 219.79,
            "high": 248.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 3.1,
            "factor_wrt_ss304": 0.833327,
            "factor_wrt_ss316_ss316l": 0.566469,
            "revision_note": "No change"
          },
          "2023": {
            "low": 145.7,
            "recommended": 177.94,
            "high": 195.3,
            "percentile_used": 0.65,
            "factor_wrt_cs": 3.1,
            "factor_wrt_ss304": 0.833326,
            "factor_wrt_ss316_ss316l": 0.478977,
            "revision_note": "No change"
          },
          "2024": {
            "low": 145.7,
            "recommended": 161.82,
            "high": 170.5,
            "percentile_used": 0.65,
            "factor_wrt_cs": 3.1,
            "factor_wrt_ss304": 0.83335,
            "factor_wrt_ss316_ss316l": 0.492603,
            "revision_note": "No change"
          },
          "2025": {
            "low": 136.4,
            "recommended": 170.655,
            "high": 189.1,
            "percentile_used": 0.65,
            "factor_wrt_cs": 3.1,
            "factor_wrt_ss304": 0.833317,
            "factor_wrt_ss316_ss316l": 0.519103,
            "revision_note": "No change"
          },
          "2026": {
            "low": 155.0,
            "recommended": 175.15,
            "high": 186.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 3.1,
            "factor_wrt_ss304": 0.833333,
            "factor_wrt_ss316_ss316l": 0.538095,
            "revision_note": "No change"
          }
        },
        "factor_wrt_cs_by_year": {
          "2021": 3.1,
          "2022": 3.1,
          "2023": 3.1,
          "2024": 3.1,
          "2025": 3.1,
          "2026": 3.1
        },
        "percentile_used": 0.65
      },
      {
        "ch_comp": "5Cr, ½Mo",
        "pipe_mat_std": [
          "A335 Gr.P5"
        ],
        "raw_material_basis": "5Cr alloy steel billet",
        "rate_inr_per_kg": {
          "low": 155.0,
          "recommended": 175.15,
          "high": 186.0
        },
        "source_material_name": "5Cr-0.5Mo",
        "yearly_rate_inr_per_kg": {
          "2021": {
            "low": 170.5,
            "recommended": 200.725,
            "high": 217.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 3.1,
            "factor_wrt_ss304": 0.833333,
            "factor_wrt_ss316_ss316l": 0.711791,
            "revision_note": "No change"
          },
          "2022": {
            "low": 167.4,
            "recommended": 219.79,
            "high": 248.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 3.1,
            "factor_wrt_ss304": 0.833327,
            "factor_wrt_ss316_ss316l": 0.566469,
            "revision_note": "No change"
          },
          "2023": {
            "low": 145.7,
            "recommended": 177.94,
            "high": 195.3,
            "percentile_used": 0.65,
            "factor_wrt_cs": 3.1,
            "factor_wrt_ss304": 0.833326,
            "factor_wrt_ss316_ss316l": 0.478977,
            "revision_note": "No change"
          },
          "2024": {
            "low": 145.7,
            "recommended": 161.82,
            "high": 170.5,
            "percentile_used": 0.65,
            "factor_wrt_cs": 3.1,
            "factor_wrt_ss304": 0.83335,
            "factor_wrt_ss316_ss316l": 0.492603,
            "revision_note": "No change"
          },
          "2025": {
            "low": 136.4,
            "recommended": 170.655,
            "high": 189.1,
            "percentile_used": 0.65,
            "factor_wrt_cs": 3.1,
            "factor_wrt_ss304": 0.833317,
            "factor_wrt_ss316_ss316l": 0.519103,
            "revision_note": "No change"
          },
          "2026": {
            "low": 155.0,
            "recommended": 175.15,
            "high": 186.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 3.1,
            "factor_wrt_ss304": 0.833333,
            "factor_wrt_ss316_ss316l": 0.538095,
            "revision_note": "No change"
          }
        },
        "factor_wrt_cs_by_year": {
          "2021": 3.1,
          "2022": 3.1,
          "2023": 3.1,
          "2024": 3.1,
          "2025": 3.1,
          "2026": 3.1
        },
        "percentile_used": 0.65
      },
      {
        "ch_comp": "9Cr, 1Mo",
        "pipe_mat_std": [
          "A335 Gr.P9"
        ],
        "raw_material_basis": "9Cr-1Mo alloy steel billet",
        "rate_inr_per_kg": {
          "low": 194.5,
          "recommended": 219.785,
          "high": 233.4
        },
        "source_material_name": "9Cr-1Mo",
        "yearly_rate_inr_per_kg": {
          "2021": {
            "low": 213.95,
            "recommended": 251.8775,
            "high": 272.3,
            "percentile_used": 0.65,
            "factor_wrt_cs": 3.89,
            "factor_wrt_ss304": 1.045699,
            "factor_wrt_ss316_ss316l": 0.893183,
            "revision_note": "No change"
          },
          "2022": {
            "low": 210.06,
            "recommended": 275.801,
            "high": 311.2,
            "percentile_used": 0.65,
            "factor_wrt_cs": 3.89,
            "factor_wrt_ss304": 1.045691,
            "factor_wrt_ss316_ss316l": 0.710827,
            "revision_note": "No change"
          },
          "2023": {
            "low": 182.83,
            "recommended": 223.286,
            "high": 245.07,
            "percentile_used": 0.65,
            "factor_wrt_cs": 3.89,
            "factor_wrt_ss304": 1.045689,
            "factor_wrt_ss316_ss316l": 0.601039,
            "revision_note": "No change"
          },
          "2024": {
            "low": 182.83,
            "recommended": 203.058,
            "high": 213.95,
            "percentile_used": 0.65,
            "factor_wrt_cs": 3.89,
            "factor_wrt_ss304": 1.04572,
            "factor_wrt_ss316_ss316l": 0.618137,
            "revision_note": "No change"
          },
          "2025": {
            "low": 171.16,
            "recommended": 214.1445,
            "high": 237.29,
            "percentile_used": 0.65,
            "factor_wrt_cs": 3.89,
            "factor_wrt_ss304": 1.045678,
            "factor_wrt_ss316_ss316l": 0.65139,
            "revision_note": "No change"
          },
          "2026": {
            "low": 194.5,
            "recommended": 219.785,
            "high": 233.4,
            "percentile_used": 0.65,
            "factor_wrt_cs": 3.89,
            "factor_wrt_ss304": 1.045699,
            "factor_wrt_ss316_ss316l": 0.675223,
            "revision_note": "No change"
          }
        },
        "factor_wrt_cs_by_year": {
          "2021": 3.89,
          "2022": 3.89,
          "2023": 3.89,
          "2024": 3.89,
          "2025": 3.89,
          "2026": 3.89
        },
        "percentile_used": 0.65
      },
      {
        "ch_comp": "9Cr, 1Mo, V / W modified grades",
        "pipe_mat_std": [
          "A335 Gr.P91",
          "A335 Gr.P92",
          "A335 Gr.P911",
          "A335 Gr.P122"
        ],
        "raw_material_basis": "High alloy creep strength billet",
        "rate_inr_per_kg": {
          "low": 265.5,
          "recommended": 300.015,
          "high": 318.6
        },
        "source_material_name": "9Cr-1Mo-V / P91 family",
        "yearly_rate_inr_per_kg": {
          "2021": {
            "low": 292.05,
            "recommended": 343.8225,
            "high": 371.7,
            "percentile_used": 0.65,
            "factor_wrt_cs": 5.31,
            "factor_wrt_ss304": 1.427419,
            "factor_wrt_ss316_ss316l": 1.219229,
            "revision_note": "No change"
          },
          "2022": {
            "low": 286.74,
            "recommended": 376.479,
            "high": 424.8,
            "percentile_used": 0.65,
            "factor_wrt_cs": 5.31,
            "factor_wrt_ss304": 1.427409,
            "factor_wrt_ss316_ss316l": 0.970307,
            "revision_note": "No change"
          },
          "2023": {
            "low": 249.57,
            "recommended": 304.794,
            "high": 334.53,
            "percentile_used": 0.65,
            "factor_wrt_cs": 5.31,
            "factor_wrt_ss304": 1.427406,
            "factor_wrt_ss316_ss316l": 0.820441,
            "revision_note": "No change"
          },
          "2024": {
            "low": 249.57,
            "recommended": 277.182,
            "high": 292.05,
            "percentile_used": 0.65,
            "factor_wrt_cs": 5.31,
            "factor_wrt_ss304": 1.427449,
            "factor_wrt_ss316_ss316l": 0.843781,
            "revision_note": "No change"
          },
          "2025": {
            "low": 233.64,
            "recommended": 292.3155,
            "high": 323.91,
            "percentile_used": 0.65,
            "factor_wrt_cs": 5.31,
            "factor_wrt_ss304": 1.427391,
            "factor_wrt_ss316_ss316l": 0.889173,
            "revision_note": "No change"
          },
          "2026": {
            "low": 265.5,
            "recommended": 300.015,
            "high": 318.6,
            "percentile_used": 0.65,
            "factor_wrt_cs": 5.31,
            "factor_wrt_ss304": 1.427419,
            "factor_wrt_ss316_ss316l": 0.921705,
            "revision_note": "No change"
          }
        },
        "factor_wrt_cs_by_year": {
          "2021": 5.31,
          "2022": 5.31,
          "2023": 5.31,
          "2024": 5.31,
          "2025": 5.31,
          "2026": 5.31
        },
        "percentile_used": 0.65
      }
    ]
  },
  {
    "basic_mat_of_const": "Austenitic Stainless Steel",
    "children": [
      {
        "ch_comp": "18Cr, 8Ni",
        "pipe_mat_std": [
          "A312 TP304",
          "A312 TP304L"
        ],
        "raw_material_basis": "SS 304/304L coil / strip / billet",
        "rate_inr_per_kg": {
          "low": 186.0,
          "recommended": 210.18,
          "high": 223.2
        },
        "source_material_name": "Austenitic SS 304 / 304L",
        "yearly_rate_inr_per_kg": {
          "2021": {
            "low": 204.6,
            "recommended": 240.87,
            "high": 260.4,
            "percentile_used": 0.65,
            "factor_wrt_cs": 3.72,
            "factor_wrt_ss304": 1.0,
            "factor_wrt_ss316_ss316l": 0.854149,
            "revision_note": "No change"
          },
          "2022": {
            "low": 200.88,
            "recommended": 263.748,
            "high": 297.6,
            "percentile_used": 0.65,
            "factor_wrt_cs": 3.72,
            "factor_wrt_ss304": 0.999992,
            "factor_wrt_ss316_ss316l": 0.679763,
            "revision_note": "No change"
          },
          "2023": {
            "low": 174.84,
            "recommended": 213.528,
            "high": 234.36,
            "percentile_used": 0.65,
            "factor_wrt_cs": 3.72,
            "factor_wrt_ss304": 0.999991,
            "factor_wrt_ss316_ss316l": 0.574773,
            "revision_note": "No change"
          },
          "2024": {
            "low": 174.84,
            "recommended": 194.184,
            "high": 204.6,
            "percentile_used": 0.65,
            "factor_wrt_cs": 3.72,
            "factor_wrt_ss304": 1.000021,
            "factor_wrt_ss316_ss316l": 0.591123,
            "revision_note": "No change"
          },
          "2025": {
            "low": 163.68,
            "recommended": 204.786,
            "high": 226.92,
            "percentile_used": 0.65,
            "factor_wrt_cs": 3.72,
            "factor_wrt_ss304": 0.99998,
            "factor_wrt_ss316_ss316l": 0.622923,
            "revision_note": "No change"
          },
          "2026": {
            "low": 186.0,
            "recommended": 210.18,
            "high": 223.2,
            "percentile_used": 0.65,
            "factor_wrt_cs": 3.72,
            "factor_wrt_ss304": 1.0,
            "factor_wrt_ss316_ss316l": 0.645714,
            "revision_note": "No change"
          }
        },
        "factor_wrt_cs_by_year": {
          "2021": 3.72,
          "2022": 3.72,
          "2023": 3.72,
          "2024": 3.72,
          "2025": 3.72,
          "2026": 3.72
        },
        "percentile_used": 0.65
      },
      {
        "ch_comp": "16/18Cr, Ni, Mo",
        "pipe_mat_std": [
          "A312 TP316",
          "A312 TP316L"
        ],
        "raw_material_basis": "Mo-bearing SS 316/316L coil / billet",
        "rate_inr_per_kg": {
          "low": 280.0,
          "recommended": 325.5,
          "high": 350.0
        },
        "source_material_name": "SS316L",
        "yearly_rate_inr_per_kg": {
          "2021": {
            "low": 230.0,
            "recommended": 282.0,
            "high": 310.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 4.355212,
            "factor_wrt_ss304": 1.170756,
            "factor_wrt_ss316_ss316l": 1.0,
            "revision_note": "No change"
          },
          "2022": {
            "low": 310.0,
            "recommended": 388.0,
            "high": 430.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 5.472496,
            "factor_wrt_ss304": 1.47109,
            "factor_wrt_ss316_ss316l": 1.0,
            "revision_note": "No change"
          },
          "2023": {
            "low": 300.0,
            "recommended": 371.5,
            "high": 410.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 6.472125,
            "factor_wrt_ss304": 1.739802,
            "factor_wrt_ss316_ss316l": 1.0,
            "revision_note": "No change"
          },
          "2024": {
            "low": 270.0,
            "recommended": 328.5,
            "high": 360.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 6.293103,
            "factor_wrt_ss304": 1.691729,
            "factor_wrt_ss316_ss316l": 1.0,
            "revision_note": "No change"
          },
          "2025": {
            "low": 280.0,
            "recommended": 328.75,
            "high": 355.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 5.971844,
            "factor_wrt_ss304": 1.605303,
            "factor_wrt_ss316_ss316l": 1.0,
            "revision_note": "No change"
          },
          "2026": {
            "low": 280.0,
            "recommended": 325.5,
            "high": 350.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 5.761062,
            "factor_wrt_ss304": 1.548673,
            "factor_wrt_ss316_ss316l": 1.0,
            "revision_note": "No change"
          }
        },
        "factor_wrt_cs_by_year": {
          "2021": 4.355212,
          "2022": 5.472496,
          "2023": 6.472125,
          "2024": 6.293103,
          "2025": 5.971844,
          "2026": 5.761062
        },
        "percentile_used": 0.65
      },
      {
        "ch_comp": "Ti / Cb stabilized SS",
        "pipe_mat_std": [
          "A312 TP321",
          "A312 TP347"
        ],
        "raw_material_basis": "Stabilized stainless steel coil / billet",
        "rate_inr_per_kg": {
          "low": 252.0,
          "recommended": 284.76,
          "high": 302.4
        },
        "source_material_name": "SS 321 / 347",
        "yearly_rate_inr_per_kg": {
          "2021": {
            "low": 277.2,
            "recommended": 326.34,
            "high": 352.8,
            "percentile_used": 0.65,
            "factor_wrt_cs": 5.04,
            "factor_wrt_ss304": 1.354839,
            "factor_wrt_ss316_ss316l": 1.157234,
            "revision_note": "No change"
          },
          "2022": {
            "low": 272.16,
            "recommended": 357.336,
            "high": 403.2,
            "percentile_used": 0.65,
            "factor_wrt_cs": 5.04,
            "factor_wrt_ss304": 1.354828,
            "factor_wrt_ss316_ss316l": 0.920969,
            "revision_note": "No change"
          },
          "2023": {
            "low": 236.88,
            "recommended": 289.296,
            "high": 317.52,
            "percentile_used": 0.65,
            "factor_wrt_cs": 5.04,
            "factor_wrt_ss304": 1.354826,
            "factor_wrt_ss316_ss316l": 0.778724,
            "revision_note": "No change"
          },
          "2024": {
            "low": 236.88,
            "recommended": 263.088,
            "high": 277.2,
            "percentile_used": 0.65,
            "factor_wrt_cs": 5.04,
            "factor_wrt_ss304": 1.354867,
            "factor_wrt_ss316_ss316l": 0.800877,
            "revision_note": "No change"
          },
          "2025": {
            "low": 221.76,
            "recommended": 277.452,
            "high": 307.44,
            "percentile_used": 0.65,
            "factor_wrt_cs": 5.04,
            "factor_wrt_ss304": 1.354812,
            "factor_wrt_ss316_ss316l": 0.84396,
            "revision_note": "No change"
          },
          "2026": {
            "low": 252.0,
            "recommended": 284.76,
            "high": 302.4,
            "percentile_used": 0.65,
            "factor_wrt_cs": 5.04,
            "factor_wrt_ss304": 1.354839,
            "factor_wrt_ss316_ss316l": 0.874839,
            "revision_note": "No change"
          }
        },
        "factor_wrt_cs_by_year": {
          "2021": 5.04,
          "2022": 5.04,
          "2023": 5.04,
          "2024": 5.04,
          "2025": 5.04,
          "2026": 5.04
        },
        "percentile_used": 0.65
      },
      {
        "ch_comp": "SS316Ti",
        "pipe_mat_std": [
          "A312 TP316Ti"
        ],
        "raw_material_basis": "SS316Ti stabilized stainless stock",
        "rate_inr_per_kg": {
          "low": 425.0,
          "recommended": 480.25,
          "high": 510.0
        },
        "source_material_name": "SS 316Ti",
        "yearly_rate_inr_per_kg": {
          "2021": {
            "low": 467.5,
            "recommended": 550.375,
            "high": 595.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 8.5,
            "factor_wrt_ss304": 2.284946,
            "factor_wrt_ss316_ss316l": 1.951684,
            "revision_note": "No change"
          },
          "2022": {
            "low": 459.0,
            "recommended": 602.65,
            "high": 680.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 8.5,
            "factor_wrt_ss304": 2.284929,
            "factor_wrt_ss316_ss316l": 1.553222,
            "revision_note": "No change"
          },
          "2023": {
            "low": 399.5,
            "recommended": 487.9,
            "high": 535.5,
            "percentile_used": 0.65,
            "factor_wrt_cs": 8.5,
            "factor_wrt_ss304": 2.284925,
            "factor_wrt_ss316_ss316l": 1.313324,
            "revision_note": "No change"
          },
          "2024": {
            "low": 399.5,
            "recommended": 443.7,
            "high": 467.5,
            "percentile_used": 0.65,
            "factor_wrt_cs": 8.5,
            "factor_wrt_ss304": 2.284993,
            "factor_wrt_ss316_ss316l": 1.350685,
            "revision_note": "No change"
          },
          "2025": {
            "low": 374.0,
            "recommended": 467.925,
            "high": 518.5,
            "percentile_used": 0.65,
            "factor_wrt_cs": 8.5,
            "factor_wrt_ss304": 2.284902,
            "factor_wrt_ss316_ss316l": 1.423346,
            "revision_note": "No change"
          },
          "2026": {
            "low": 425.0,
            "recommended": 480.25,
            "high": 510.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 8.5,
            "factor_wrt_ss304": 2.284946,
            "factor_wrt_ss316_ss316l": 1.475422,
            "revision_note": "No change"
          }
        },
        "factor_wrt_cs_by_year": {
          "2021": 8.5,
          "2022": 8.5,
          "2023": 8.5,
          "2024": 8.5,
          "2025": 8.5,
          "2026": 8.5
        },
        "percentile_used": 0.65
      },
      {
        "ch_comp": "25Cr, 20Ni",
        "pipe_mat_std": [
          "A312 TP310"
        ],
        "raw_material_basis": "High nickel, high chromium stainless stock",
        "rate_inr_per_kg": {
          "low": 460.0,
          "recommended": 519.8,
          "high": 552.0
        },
        "source_material_name": "SS 310",
        "yearly_rate_inr_per_kg": {
          "2021": {
            "low": 506.0,
            "recommended": 595.7,
            "high": 644.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 9.2,
            "factor_wrt_ss304": 2.473118,
            "factor_wrt_ss316_ss316l": 2.112411,
            "revision_note": "No change"
          },
          "2022": {
            "low": 496.8,
            "recommended": 652.28,
            "high": 736.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 9.2,
            "factor_wrt_ss304": 2.4731,
            "factor_wrt_ss316_ss316l": 1.681134,
            "revision_note": "No change"
          },
          "2023": {
            "low": 432.4,
            "recommended": 528.08,
            "high": 579.6,
            "percentile_used": 0.65,
            "factor_wrt_cs": 9.2,
            "factor_wrt_ss304": 2.473095,
            "factor_wrt_ss316_ss316l": 1.42148,
            "revision_note": "No change"
          },
          "2024": {
            "low": 432.4,
            "recommended": 480.24,
            "high": 506.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 9.2,
            "factor_wrt_ss304": 2.473169,
            "factor_wrt_ss316_ss316l": 1.461918,
            "revision_note": "No change"
          },
          "2025": {
            "low": 404.8,
            "recommended": 506.46,
            "high": 561.2,
            "percentile_used": 0.65,
            "factor_wrt_cs": 9.2,
            "factor_wrt_ss304": 2.47307,
            "factor_wrt_ss316_ss316l": 1.540563,
            "revision_note": "No change"
          },
          "2026": {
            "low": 460.0,
            "recommended": 519.8,
            "high": 552.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 9.2,
            "factor_wrt_ss304": 2.473118,
            "factor_wrt_ss316_ss316l": 1.596928,
            "revision_note": "No change"
          }
        },
        "factor_wrt_cs_by_year": {
          "2021": 9.2,
          "2022": 9.2,
          "2023": 9.2,
          "2024": 9.2,
          "2025": 9.2,
          "2026": 9.2
        },
        "percentile_used": 0.65
      },
      {
        "ch_comp": "High Mo Austenitic SS - SS317",
        "pipe_mat_std": [
          "A312 TP317"
        ],
        "raw_material_basis": "SS317 high Mo stainless stock",
        "rate_inr_per_kg": {
          "low": 299.6,
          "recommended": 377.86,
          "high": 420.0
        },
        "source_material_name": "SS 317",
        "yearly_rate_inr_per_kg": {
          "2021": {
            "low": 246.1,
            "recommended": 327.935,
            "high": 372.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 5.064633,
            "factor_wrt_ss304": 1.361461,
            "factor_wrt_ss316_ss316l": 1.16289,
            "revision_note": "Revised: anchored to SS316/316L. Min = 1.07×SS316L min; Max = 1.20×SS316L max."
          },
          "2022": {
            "low": 331.7,
            "recommended": 451.495,
            "high": 516.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 6.368054,
            "factor_wrt_ss304": 1.711829,
            "factor_wrt_ss316_ss316l": 1.163647,
            "revision_note": "Revised: anchored to SS316/316L. Min = 1.07×SS316L min; Max = 1.20×SS316L max."
          },
          "2023": {
            "low": 321.0,
            "recommended": 432.15,
            "high": 492.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 7.528746,
            "factor_wrt_ss304": 2.023837,
            "factor_wrt_ss316_ss316l": 1.163257,
            "revision_note": "Revised: anchored to SS316/316L. Min = 1.07×SS316L min; Max = 1.20×SS316L max."
          },
          "2024": {
            "low": 288.9,
            "recommended": 381.915,
            "high": 432.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 7.316379,
            "factor_wrt_ss304": 1.966809,
            "factor_wrt_ss316_ss316l": 1.162603,
            "revision_note": "Revised: anchored to SS316/316L. Min = 1.07×SS316L min; Max = 1.20×SS316L max."
          },
          "2025": {
            "low": 299.6,
            "recommended": 381.76,
            "high": 426.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 6.934787,
            "factor_wrt_ss304": 1.864154,
            "factor_wrt_ss316_ss316l": 1.161247,
            "revision_note": "Revised: anchored to SS316/316L. Min = 1.07×SS316L min; Max = 1.20×SS316L max."
          },
          "2026": {
            "low": 299.6,
            "recommended": 377.86,
            "high": 420.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 6.687788,
            "factor_wrt_ss304": 1.797792,
            "factor_wrt_ss316_ss316l": 1.16086,
            "revision_note": "Revised: anchored to SS316/316L. Min = 1.07×SS316L min; Max = 1.20×SS316L max."
          }
        },
        "factor_wrt_cs_by_year": {
          "2021": 5.064633,
          "2022": 6.368054,
          "2023": 7.528746,
          "2024": 7.316379,
          "2025": 6.934787,
          "2026": 6.687788
        },
        "percentile_used": 0.65
      },
      {
        "ch_comp": "6Mo Austenitic SS",
        "pipe_mat_std": [
          "A312 N08367"
        ],
        "raw_material_basis": "6Mo / super austenitic stainless stock",
        "rate_inr_per_kg": {
          "low": 929.0,
          "recommended": 1049.77,
          "high": 1114.8
        },
        "source_material_name": "6Mo austenitic SS",
        "yearly_rate_inr_per_kg": {
          "2021": {
            "low": 1021.9,
            "recommended": 1203.055,
            "high": 1300.6,
            "percentile_used": 0.65,
            "factor_wrt_cs": 18.58,
            "factor_wrt_ss304": 4.994624,
            "factor_wrt_ss316_ss316l": 4.266152,
            "revision_note": "No change"
          },
          "2022": {
            "low": 1003.32,
            "recommended": 1317.322,
            "high": 1486.4,
            "percentile_used": 0.65,
            "factor_wrt_cs": 18.58,
            "factor_wrt_ss304": 4.994586,
            "factor_wrt_ss316_ss316l": 3.39516,
            "revision_note": "No change"
          },
          "2023": {
            "low": 873.26,
            "recommended": 1066.492,
            "high": 1170.54,
            "percentile_used": 0.65,
            "factor_wrt_cs": 18.58,
            "factor_wrt_ss304": 4.994577,
            "factor_wrt_ss316_ss316l": 2.870773,
            "revision_note": "No change"
          },
          "2024": {
            "low": 873.26,
            "recommended": 969.876,
            "high": 1021.9,
            "percentile_used": 0.65,
            "factor_wrt_cs": 18.58,
            "factor_wrt_ss304": 4.994727,
            "factor_wrt_ss316_ss316l": 2.952438,
            "revision_note": "No change"
          },
          "2025": {
            "low": 817.52,
            "recommended": 1022.829,
            "high": 1133.38,
            "percentile_used": 0.65,
            "factor_wrt_cs": 18.58,
            "factor_wrt_ss304": 4.994526,
            "factor_wrt_ss316_ss316l": 3.111267,
            "revision_note": "No change"
          },
          "2026": {
            "low": 929.0,
            "recommended": 1049.77,
            "high": 1114.8,
            "percentile_used": 0.65,
            "factor_wrt_cs": 18.58,
            "factor_wrt_ss304": 4.994624,
            "factor_wrt_ss316_ss316l": 3.2251,
            "revision_note": "No change"
          }
        },
        "factor_wrt_cs_by_year": {
          "2021": 18.58,
          "2022": 18.58,
          "2023": 18.58,
          "2024": 18.58,
          "2025": 18.58,
          "2026": 18.58
        },
        "percentile_used": 0.65
      },
      {
        "ch_comp": "904L Austenitic SS",
        "pipe_mat_std": [
          "A312 N08904"
        ],
        "raw_material_basis": "904L super austenitic stainless stock",
        "rate_inr_per_kg": {
          "low": 885.0,
          "recommended": 1000.05,
          "high": 1062.0
        },
        "source_material_name": "904L",
        "yearly_rate_inr_per_kg": {
          "2021": {
            "low": 973.5,
            "recommended": 1146.075,
            "high": 1239.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 17.7,
            "factor_wrt_ss304": 4.758065,
            "factor_wrt_ss316_ss316l": 4.064096,
            "revision_note": "No change"
          },
          "2022": {
            "low": 955.8,
            "recommended": 1254.93,
            "high": 1416.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 17.7,
            "factor_wrt_ss304": 4.758028,
            "factor_wrt_ss316_ss316l": 3.234356,
            "revision_note": "No change"
          },
          "2023": {
            "low": 831.9,
            "recommended": 1015.98,
            "high": 1115.1,
            "percentile_used": 0.65,
            "factor_wrt_cs": 17.7,
            "factor_wrt_ss304": 4.75802,
            "factor_wrt_ss316_ss316l": 2.734805,
            "revision_note": "No change"
          },
          "2024": {
            "low": 831.9,
            "recommended": 923.94,
            "high": 973.5,
            "percentile_used": 0.65,
            "factor_wrt_cs": 17.7,
            "factor_wrt_ss304": 4.758163,
            "factor_wrt_ss316_ss316l": 2.812603,
            "revision_note": "No change"
          },
          "2025": {
            "low": 778.8,
            "recommended": 974.385,
            "high": 1079.7,
            "percentile_used": 0.65,
            "factor_wrt_cs": 17.7,
            "factor_wrt_ss304": 4.757972,
            "factor_wrt_ss316_ss316l": 2.963909,
            "revision_note": "No change"
          },
          "2026": {
            "low": 885.0,
            "recommended": 1000.05,
            "high": 1062.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 17.7,
            "factor_wrt_ss304": 4.758065,
            "factor_wrt_ss316_ss316l": 3.07235,
            "revision_note": "No change"
          }
        },
        "factor_wrt_cs_by_year": {
          "2021": 17.7,
          "2022": 17.7,
          "2023": 17.7,
          "2024": 17.7,
          "2025": 17.7,
          "2026": 17.7
        },
        "percentile_used": 0.65
      }
    ]
  },
  {
    "basic_mat_of_const": "Ferritic/Austenitic Duplex Stainless Steel",
    "children": [
      {
        "ch_comp": "Lean Duplex",
        "pipe_mat_std": [
          "A790 S32304"
        ],
        "raw_material_basis": "Lean duplex coil / billet",
        "rate_inr_per_kg": {
          "low": 177.0,
          "recommended": 200.01,
          "high": 212.4
        },
        "source_material_name": "Duplex 2304",
        "yearly_rate_inr_per_kg": {
          "2021": {
            "low": 194.7,
            "recommended": 229.215,
            "high": 247.8,
            "percentile_used": 0.65,
            "factor_wrt_cs": 3.54,
            "factor_wrt_ss304": 0.951613,
            "factor_wrt_ss316_ss316l": 0.812819,
            "revision_note": "No change"
          },
          "2022": {
            "low": 191.16,
            "recommended": 250.986,
            "high": 283.2,
            "percentile_used": 0.65,
            "factor_wrt_cs": 3.54,
            "factor_wrt_ss304": 0.951606,
            "factor_wrt_ss316_ss316l": 0.646871,
            "revision_note": "No change"
          },
          "2023": {
            "low": 166.38,
            "recommended": 203.196,
            "high": 223.02,
            "percentile_used": 0.65,
            "factor_wrt_cs": 3.54,
            "factor_wrt_ss304": 0.951604,
            "factor_wrt_ss316_ss316l": 0.546961,
            "revision_note": "No change"
          },
          "2024": {
            "low": 166.38,
            "recommended": 184.788,
            "high": 194.7,
            "percentile_used": 0.65,
            "factor_wrt_cs": 3.54,
            "factor_wrt_ss304": 0.951633,
            "factor_wrt_ss316_ss316l": 0.562521,
            "revision_note": "No change"
          },
          "2025": {
            "low": 155.76,
            "recommended": 194.877,
            "high": 215.94,
            "percentile_used": 0.65,
            "factor_wrt_cs": 3.54,
            "factor_wrt_ss304": 0.951594,
            "factor_wrt_ss316_ss316l": 0.592782,
            "revision_note": "No change"
          },
          "2026": {
            "low": 177.0,
            "recommended": 200.01,
            "high": 212.4,
            "percentile_used": 0.65,
            "factor_wrt_cs": 3.54,
            "factor_wrt_ss304": 0.951613,
            "factor_wrt_ss316_ss316l": 0.61447,
            "revision_note": "No change"
          }
        },
        "factor_wrt_cs_by_year": {
          "2021": 3.54,
          "2022": 3.54,
          "2023": 3.54,
          "2024": 3.54,
          "2025": 3.54,
          "2026": 3.54
        },
        "percentile_used": 0.65
      },
      {
        "ch_comp": "22Cr, 5½Ni, 3Mo",
        "pipe_mat_std": [
          "A790 S31803",
          "A790 S32205"
        ],
        "raw_material_basis": "Duplex 2205 coil / billet",
        "rate_inr_per_kg": {
          "low": 442.5,
          "recommended": 500.025,
          "high": 531.0
        },
        "source_material_name": "Duplex 2205",
        "yearly_rate_inr_per_kg": {
          "2021": {
            "low": 486.75,
            "recommended": 573.0375,
            "high": 619.5,
            "percentile_used": 0.65,
            "factor_wrt_cs": 8.85,
            "factor_wrt_ss304": 2.379032,
            "factor_wrt_ss316_ss316l": 2.032048,
            "revision_note": "No change"
          },
          "2022": {
            "low": 477.9,
            "recommended": 627.465,
            "high": 708.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 8.85,
            "factor_wrt_ss304": 2.379014,
            "factor_wrt_ss316_ss316l": 1.617178,
            "revision_note": "No change"
          },
          "2023": {
            "low": 415.95,
            "recommended": 507.99,
            "high": 557.55,
            "percentile_used": 0.65,
            "factor_wrt_cs": 8.85,
            "factor_wrt_ss304": 2.37901,
            "factor_wrt_ss316_ss316l": 1.367402,
            "revision_note": "No change"
          },
          "2024": {
            "low": 415.95,
            "recommended": 461.97,
            "high": 486.75,
            "percentile_used": 0.65,
            "factor_wrt_cs": 8.85,
            "factor_wrt_ss304": 2.379081,
            "factor_wrt_ss316_ss316l": 1.406301,
            "revision_note": "No change"
          },
          "2025": {
            "low": 389.4,
            "recommended": 487.1925,
            "high": 539.85,
            "percentile_used": 0.65,
            "factor_wrt_cs": 8.85,
            "factor_wrt_ss304": 2.378986,
            "factor_wrt_ss316_ss316l": 1.481954,
            "revision_note": "No change"
          },
          "2026": {
            "low": 442.5,
            "recommended": 500.025,
            "high": 531.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 8.85,
            "factor_wrt_ss304": 2.379032,
            "factor_wrt_ss316_ss316l": 1.536175,
            "revision_note": "No change"
          }
        },
        "factor_wrt_cs_by_year": {
          "2021": 8.85,
          "2022": 8.85,
          "2023": 8.85,
          "2024": 8.85,
          "2025": 8.85,
          "2026": 8.85
        },
        "percentile_used": 0.65
      },
      {
        "ch_comp": "High alloy duplex",
        "pipe_mat_std": [
          "A790 S32900",
          "A790 S32950",
          "A790 S32550",
          "A790 S32906"
        ],
        "raw_material_basis": "Higher alloy duplex stainless stock",
        "rate_inr_per_kg": {
          "low": 486.5,
          "recommended": 549.745,
          "high": 583.8
        },
        "source_material_name": "Other duplex grades",
        "yearly_rate_inr_per_kg": {
          "2021": {
            "low": 535.15,
            "recommended": 630.0175,
            "high": 681.1,
            "percentile_used": 0.65,
            "factor_wrt_cs": 9.73,
            "factor_wrt_ss304": 2.615591,
            "factor_wrt_ss316_ss316l": 2.234105,
            "revision_note": "No change"
          },
          "2022": {
            "low": 525.42,
            "recommended": 689.857,
            "high": 778.4,
            "percentile_used": 0.65,
            "factor_wrt_cs": 9.73,
            "factor_wrt_ss304": 2.615572,
            "factor_wrt_ss316_ss316l": 1.777982,
            "revision_note": "No change"
          },
          "2023": {
            "low": 457.31,
            "recommended": 558.502,
            "high": 612.99,
            "percentile_used": 0.65,
            "factor_wrt_cs": 9.73,
            "factor_wrt_ss304": 2.615567,
            "factor_wrt_ss316_ss316l": 1.50337,
            "revision_note": "No change"
          },
          "2024": {
            "low": 457.31,
            "recommended": 507.906,
            "high": 535.15,
            "percentile_used": 0.65,
            "factor_wrt_cs": 9.73,
            "factor_wrt_ss304": 2.615645,
            "factor_wrt_ss316_ss316l": 1.546137,
            "revision_note": "No change"
          },
          "2025": {
            "low": 428.12,
            "recommended": 535.6365,
            "high": 593.53,
            "percentile_used": 0.65,
            "factor_wrt_cs": 9.73,
            "factor_wrt_ss304": 2.61554,
            "factor_wrt_ss316_ss316l": 1.629313,
            "revision_note": "No change"
          },
          "2026": {
            "low": 486.5,
            "recommended": 549.745,
            "high": 583.8,
            "percentile_used": 0.65,
            "factor_wrt_cs": 9.73,
            "factor_wrt_ss304": 2.615591,
            "factor_wrt_ss316_ss316l": 1.688925,
            "revision_note": "No change"
          }
        },
        "factor_wrt_cs_by_year": {
          "2021": 9.73,
          "2022": 9.73,
          "2023": 9.73,
          "2024": 9.73,
          "2025": 9.73,
          "2026": 9.73
        },
        "percentile_used": 0.65
      },
      {
        "ch_comp": "Super Duplex",
        "pipe_mat_std": [
          "A790 S32750",
          "A790 S32760",
          "A790 S39274"
        ],
        "raw_material_basis": "Super duplex stainless stock",
        "rate_inr_per_kg": {
          "low": 641.5,
          "recommended": 724.895,
          "high": 769.8
        },
        "source_material_name": "Super Duplex",
        "yearly_rate_inr_per_kg": {
          "2021": {
            "low": 705.65,
            "recommended": 830.7425,
            "high": 898.1,
            "percentile_used": 0.65,
            "factor_wrt_cs": 12.83,
            "factor_wrt_ss304": 3.448925,
            "factor_wrt_ss316_ss316l": 2.945895,
            "revision_note": "No change"
          },
          "2022": {
            "low": 692.82,
            "recommended": 909.647,
            "high": 1026.4,
            "percentile_used": 0.65,
            "factor_wrt_cs": 12.83,
            "factor_wrt_ss304": 3.448899,
            "factor_wrt_ss316_ss316l": 2.344451,
            "revision_note": "No change"
          },
          "2023": {
            "low": 603.01,
            "recommended": 736.442,
            "high": 808.29,
            "percentile_used": 0.65,
            "factor_wrt_cs": 12.83,
            "factor_wrt_ss304": 3.448892,
            "factor_wrt_ss316_ss316l": 1.982347,
            "revision_note": "No change"
          },
          "2024": {
            "low": 603.01,
            "recommended": 669.726,
            "high": 705.65,
            "percentile_used": 0.65,
            "factor_wrt_cs": 12.83,
            "factor_wrt_ss304": 3.448996,
            "factor_wrt_ss316_ss316l": 2.03874,
            "revision_note": "No change"
          },
          "2025": {
            "low": 564.52,
            "recommended": 706.2915,
            "high": 782.63,
            "percentile_used": 0.65,
            "factor_wrt_cs": 12.83,
            "factor_wrt_ss304": 3.448857,
            "factor_wrt_ss316_ss316l": 2.148415,
            "revision_note": "No change"
          },
          "2026": {
            "low": 641.5,
            "recommended": 724.895,
            "high": 769.8,
            "percentile_used": 0.65,
            "factor_wrt_cs": 12.83,
            "factor_wrt_ss304": 3.448925,
            "factor_wrt_ss316_ss316l": 2.22702,
            "revision_note": "No change"
          }
        },
        "factor_wrt_cs_by_year": {
          "2021": 12.83,
          "2022": 12.83,
          "2023": 12.83,
          "2024": 12.83,
          "2025": 12.83,
          "2026": 12.83
        },
        "percentile_used": 0.65
      }
    ]
  },
  {
    "basic_mat_of_const": "Non-Ferrous Materials",
    "children": [
      {
        "ch_comp": "Titanium",
        "pipe_mat_std": [
          "B861",
          "B862"
        ],
        "raw_material_basis": "Titanium sponge / slab / billet / strip",
        "rate_inr_per_kg": {
          "low": 796.5,
          "recommended": 900.045,
          "high": 955.8
        },
        "source_material_name": "Titanium",
        "yearly_rate_inr_per_kg": {
          "2021": {
            "low": 876.15,
            "recommended": 1031.4675,
            "high": 1115.1,
            "percentile_used": 0.65,
            "factor_wrt_cs": 15.93,
            "factor_wrt_ss304": 4.282258,
            "factor_wrt_ss316_ss316l": 3.657686,
            "revision_note": "No change"
          },
          "2022": {
            "low": 860.22,
            "recommended": 1129.437,
            "high": 1274.4,
            "percentile_used": 0.65,
            "factor_wrt_cs": 15.93,
            "factor_wrt_ss304": 4.282226,
            "factor_wrt_ss316_ss316l": 2.91092,
            "revision_note": "No change"
          },
          "2023": {
            "low": 748.71,
            "recommended": 914.382,
            "high": 1003.59,
            "percentile_used": 0.65,
            "factor_wrt_cs": 15.93,
            "factor_wrt_ss304": 4.282218,
            "factor_wrt_ss316_ss316l": 2.461324,
            "revision_note": "No change"
          },
          "2024": {
            "low": 748.71,
            "recommended": 831.546,
            "high": 876.15,
            "percentile_used": 0.65,
            "factor_wrt_cs": 15.93,
            "factor_wrt_ss304": 4.282346,
            "factor_wrt_ss316_ss316l": 2.531342,
            "revision_note": "No change"
          },
          "2025": {
            "low": 700.92,
            "recommended": 876.9465,
            "high": 971.73,
            "percentile_used": 0.65,
            "factor_wrt_cs": 15.93,
            "factor_wrt_ss304": 4.282174,
            "factor_wrt_ss316_ss316l": 2.667518,
            "revision_note": "No change"
          },
          "2026": {
            "low": 796.5,
            "recommended": 900.045,
            "high": 955.8,
            "percentile_used": 0.65,
            "factor_wrt_cs": 15.93,
            "factor_wrt_ss304": 4.282258,
            "factor_wrt_ss316_ss316l": 2.765115,
            "revision_note": "No change"
          }
        },
        "factor_wrt_cs_by_year": {
          "2021": 15.93,
          "2022": 15.93,
          "2023": 15.93,
          "2024": 15.93,
          "2025": 15.93,
          "2026": 15.93
        },
        "percentile_used": 0.65
      },
      {
        "ch_comp": "Inconel / Incoloy 825",
        "pipe_mat_std": [
          "B423",
          "B705",
          "UNS N08825"
        ],
        "raw_material_basis": "Ni-Fe-Cr-Mo alloy stock",
        "rate_inr_per_kg": {
          "low": 1150.5,
          "recommended": 1300.065,
          "high": 1380.6
        },
        "source_material_name": "Incoloy / Inconel 825",
        "yearly_rate_inr_per_kg": {
          "2021": {
            "low": 1265.55,
            "recommended": 1489.8975,
            "high": 1610.7,
            "percentile_used": 0.65,
            "factor_wrt_cs": 23.01,
            "factor_wrt_ss304": 6.185484,
            "factor_wrt_ss316_ss316l": 5.283324,
            "revision_note": "No change"
          },
          "2022": {
            "low": 1242.54,
            "recommended": 1631.409,
            "high": 1840.8,
            "percentile_used": 0.65,
            "factor_wrt_cs": 23.01,
            "factor_wrt_ss304": 6.185437,
            "factor_wrt_ss316_ss316l": 4.204662,
            "revision_note": "No change"
          },
          "2023": {
            "low": 1081.47,
            "recommended": 1320.774,
            "high": 1449.63,
            "percentile_used": 0.65,
            "factor_wrt_cs": 23.01,
            "factor_wrt_ss304": 6.185426,
            "factor_wrt_ss316_ss316l": 3.555246,
            "revision_note": "No change"
          },
          "2024": {
            "low": 1081.47,
            "recommended": 1201.122,
            "high": 1265.55,
            "percentile_used": 0.65,
            "factor_wrt_cs": 23.01,
            "factor_wrt_ss304": 6.185611,
            "factor_wrt_ss316_ss316l": 3.656384,
            "revision_note": "No change"
          },
          "2025": {
            "low": 1012.44,
            "recommended": 1266.7005,
            "high": 1403.61,
            "percentile_used": 0.65,
            "factor_wrt_cs": 23.01,
            "factor_wrt_ss304": 6.185363,
            "factor_wrt_ss316_ss316l": 3.853081,
            "revision_note": "No change"
          },
          "2026": {
            "low": 1150.5,
            "recommended": 1300.065,
            "high": 1380.6,
            "percentile_used": 0.65,
            "factor_wrt_cs": 23.01,
            "factor_wrt_ss304": 6.185484,
            "factor_wrt_ss316_ss316l": 3.994055,
            "revision_note": "No change"
          }
        },
        "factor_wrt_cs_by_year": {
          "2021": 23.01,
          "2022": 23.01,
          "2023": 23.01,
          "2024": 23.01,
          "2025": 23.01,
          "2026": 23.01
        },
        "percentile_used": 0.65
      },
      {
        "ch_comp": "Inconel / Incoloy 800",
        "pipe_mat_std": [
          "B407",
          "UNS N08800"
        ],
        "raw_material_basis": "Ni-Fe-Cr alloy stock",
        "rate_inr_per_kg": {
          "low": 730.0,
          "recommended": 824.9,
          "high": 876.0
        },
        "source_material_name": "Incoloy 800",
        "yearly_rate_inr_per_kg": {
          "2021": {
            "low": 803.0,
            "recommended": 945.35,
            "high": 1022.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 14.6,
            "factor_wrt_ss304": 3.924731,
            "factor_wrt_ss316_ss316l": 3.352305,
            "revision_note": "No change"
          },
          "2022": {
            "low": 788.4,
            "recommended": 1035.14,
            "high": 1168.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 14.6,
            "factor_wrt_ss304": 3.924701,
            "factor_wrt_ss316_ss316l": 2.667887,
            "revision_note": "No change"
          },
          "2023": {
            "low": 686.2,
            "recommended": 838.04,
            "high": 919.8,
            "percentile_used": 0.65,
            "factor_wrt_cs": 14.6,
            "factor_wrt_ss304": 3.924694,
            "factor_wrt_ss316_ss316l": 2.255828,
            "revision_note": "No change"
          },
          "2024": {
            "low": 686.2,
            "recommended": 762.12,
            "high": 803.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 14.6,
            "factor_wrt_ss304": 3.924812,
            "factor_wrt_ss316_ss316l": 2.32,
            "revision_note": "No change"
          },
          "2025": {
            "low": 642.4,
            "recommended": 803.73,
            "high": 890.6,
            "percentile_used": 0.65,
            "factor_wrt_cs": 14.6,
            "factor_wrt_ss304": 3.924655,
            "factor_wrt_ss316_ss316l": 2.444806,
            "revision_note": "No change"
          },
          "2026": {
            "low": 730.0,
            "recommended": 824.9,
            "high": 876.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 14.6,
            "factor_wrt_ss304": 3.924731,
            "factor_wrt_ss316_ss316l": 2.534255,
            "revision_note": "No change"
          }
        },
        "factor_wrt_cs_by_year": {
          "2021": 14.6,
          "2022": 14.6,
          "2023": 14.6,
          "2024": 14.6,
          "2025": 14.6,
          "2026": 14.6
        },
        "percentile_used": 0.65
      },
      {
        "ch_comp": "Inconel 625",
        "pipe_mat_std": [
          "B444",
          "B705",
          "UNS N06625"
        ],
        "raw_material_basis": "Ni-Cr-Mo-Nb alloy stock",
        "rate_inr_per_kg": {
          "low": 2124.0,
          "recommended": 2400.12,
          "high": 2548.8
        },
        "source_material_name": "Inconel 625",
        "yearly_rate_inr_per_kg": {
          "2021": {
            "low": 2336.4,
            "recommended": 2750.58,
            "high": 2973.6,
            "percentile_used": 0.65,
            "factor_wrt_cs": 42.48,
            "factor_wrt_ss304": 11.419355,
            "factor_wrt_ss316_ss316l": 9.75383,
            "revision_note": "No change"
          },
          "2022": {
            "low": 2293.92,
            "recommended": 3011.832,
            "high": 3398.4,
            "percentile_used": 0.65,
            "factor_wrt_cs": 42.48,
            "factor_wrt_ss304": 11.419268,
            "factor_wrt_ss316_ss316l": 7.762454,
            "revision_note": "No change"
          },
          "2023": {
            "low": 1996.56,
            "recommended": 2438.352,
            "high": 2676.24,
            "percentile_used": 0.65,
            "factor_wrt_cs": 42.48,
            "factor_wrt_ss304": 11.419248,
            "factor_wrt_ss316_ss316l": 6.563532,
            "revision_note": "No change"
          },
          "2024": {
            "low": 1996.56,
            "recommended": 2217.456,
            "high": 2336.4,
            "percentile_used": 0.65,
            "factor_wrt_cs": 42.48,
            "factor_wrt_ss304": 11.41959,
            "factor_wrt_ss316_ss316l": 6.750247,
            "revision_note": "No change"
          },
          "2025": {
            "low": 1869.12,
            "recommended": 2338.524,
            "high": 2591.28,
            "percentile_used": 0.65,
            "factor_wrt_cs": 42.48,
            "factor_wrt_ss304": 11.419132,
            "factor_wrt_ss316_ss316l": 7.113381,
            "revision_note": "No change"
          },
          "2026": {
            "low": 2124.0,
            "recommended": 2400.12,
            "high": 2548.8,
            "percentile_used": 0.65,
            "factor_wrt_cs": 42.48,
            "factor_wrt_ss304": 11.419355,
            "factor_wrt_ss316_ss316l": 7.373641,
            "revision_note": "No change"
          }
        },
        "factor_wrt_cs_by_year": {
          "2021": 42.48,
          "2022": 42.48,
          "2023": 42.48,
          "2024": 42.48,
          "2025": 42.48,
          "2026": 42.48
        },
        "percentile_used": 0.65
      },
      {
        "ch_comp": "Inconel 600",
        "pipe_mat_std": [
          "B167",
          "B517",
          "UNS N06600"
        ],
        "raw_material_basis": "High nickel chromium alloy stock",
        "rate_inr_per_kg": {
          "low": 1327.5,
          "recommended": 1500.075,
          "high": 1593.0
        },
        "source_material_name": "Inconel 600",
        "yearly_rate_inr_per_kg": {
          "2021": {
            "low": 1460.25,
            "recommended": 1719.1125,
            "high": 1858.5,
            "percentile_used": 0.65,
            "factor_wrt_cs": 26.55,
            "factor_wrt_ss304": 7.137097,
            "factor_wrt_ss316_ss316l": 6.096144,
            "revision_note": "No change"
          },
          "2022": {
            "low": 1433.7,
            "recommended": 1882.395,
            "high": 2124.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 26.55,
            "factor_wrt_ss304": 7.137043,
            "factor_wrt_ss316_ss316l": 4.851534,
            "revision_note": "No change"
          },
          "2023": {
            "low": 1247.85,
            "recommended": 1523.97,
            "high": 1672.65,
            "percentile_used": 0.65,
            "factor_wrt_cs": 26.55,
            "factor_wrt_ss304": 7.13703,
            "factor_wrt_ss316_ss316l": 4.102207,
            "revision_note": "No change"
          },
          "2024": {
            "low": 1247.85,
            "recommended": 1385.91,
            "high": 1460.25,
            "percentile_used": 0.65,
            "factor_wrt_cs": 26.55,
            "factor_wrt_ss304": 7.137244,
            "factor_wrt_ss316_ss316l": 4.218904,
            "revision_note": "No change"
          },
          "2025": {
            "low": 1168.2,
            "recommended": 1461.5775,
            "high": 1619.55,
            "percentile_used": 0.65,
            "factor_wrt_cs": 26.55,
            "factor_wrt_ss304": 7.136957,
            "factor_wrt_ss316_ss316l": 4.445863,
            "revision_note": "No change"
          },
          "2026": {
            "low": 1327.5,
            "recommended": 1500.075,
            "high": 1593.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 26.55,
            "factor_wrt_ss304": 7.137097,
            "factor_wrt_ss316_ss316l": 4.608525,
            "revision_note": "No change"
          }
        },
        "factor_wrt_cs_by_year": {
          "2021": 26.55,
          "2022": 26.55,
          "2023": 26.55,
          "2024": 26.55,
          "2025": 26.55,
          "2026": 26.55
        },
        "percentile_used": 0.65
      },
      {
        "ch_comp": "Hastelloy C / B family",
        "pipe_mat_std": [
          "B622",
          "B619",
          "UNS N10276",
          "UNS N10665"
        ],
        "raw_material_basis": "Ni-Mo-Cr corrosion resistant alloy stock",
        "rate_inr_per_kg": {
          "low": 2655.0,
          "recommended": 3000.15,
          "high": 3186.0
        },
        "source_material_name": "Hastelloy C / B family",
        "yearly_rate_inr_per_kg": {
          "2021": {
            "low": 2920.5,
            "recommended": 3438.225,
            "high": 3717.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 53.1,
            "factor_wrt_ss304": 14.274194,
            "factor_wrt_ss316_ss316l": 12.192287,
            "revision_note": "No change"
          },
          "2022": {
            "low": 2867.4,
            "recommended": 3764.79,
            "high": 4248.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 53.1,
            "factor_wrt_ss304": 14.274085,
            "factor_wrt_ss316_ss316l": 9.703067,
            "revision_note": "No change"
          },
          "2023": {
            "low": 2495.7,
            "recommended": 3047.94,
            "high": 3345.3,
            "percentile_used": 0.65,
            "factor_wrt_cs": 53.1,
            "factor_wrt_ss304": 14.27406,
            "factor_wrt_ss316_ss316l": 8.204415,
            "revision_note": "No change"
          },
          "2024": {
            "low": 2495.7,
            "recommended": 2771.82,
            "high": 2920.5,
            "percentile_used": 0.65,
            "factor_wrt_cs": 53.1,
            "factor_wrt_ss304": 14.274488,
            "factor_wrt_ss316_ss316l": 8.437808,
            "revision_note": "No change"
          },
          "2025": {
            "low": 2336.4,
            "recommended": 2923.155,
            "high": 3239.1,
            "percentile_used": 0.65,
            "factor_wrt_cs": 53.1,
            "factor_wrt_ss304": 14.273915,
            "factor_wrt_ss316_ss316l": 8.891726,
            "revision_note": "No change"
          },
          "2026": {
            "low": 2655.0,
            "recommended": 3000.15,
            "high": 3186.0,
            "percentile_used": 0.65,
            "factor_wrt_cs": 53.1,
            "factor_wrt_ss304": 14.274194,
            "factor_wrt_ss316_ss316l": 9.217051,
            "revision_note": "No change"
          }
        },
        "factor_wrt_cs_by_year": {
          "2021": 53.1,
          "2022": 53.1,
          "2023": 53.1,
          "2024": 53.1,
          "2025": 53.1,
          "2026": 53.1
        },
        "percentile_used": 0.65
      },
      {
        "ch_comp": "Alloy 20",
        "pipe_mat_std": [
          "B729",
          "B464",
          "UNS N08020"
        ],
        "raw_material_basis": "Ni-Cr-Fe alloy stock",
        "rate_inr_per_kg": {
          "low": 796.5,
          "recommended": 900.045,
          "high": 955.8
        },
        "source_material_name": "Alloy 20",
        "yearly_rate_inr_per_kg": {
          "2021": {
            "low": 876.15,
            "recommended": 1031.4675,
            "high": 1115.1,
            "percentile_used": 0.65,
            "factor_wrt_cs": 15.93,
            "factor_wrt_ss304": 4.282258,
            "factor_wrt_ss316_ss316l": 3.657686,
            "revision_note": "No change"
          },
          "2022": {
            "low": 860.22,
            "recommended": 1129.437,
            "high": 1274.4,
            "percentile_used": 0.65,
            "factor_wrt_cs": 15.93,
            "factor_wrt_ss304": 4.282226,
            "factor_wrt_ss316_ss316l": 2.91092,
            "revision_note": "No change"
          },
          "2023": {
            "low": 748.71,
            "recommended": 914.382,
            "high": 1003.59,
            "percentile_used": 0.65,
            "factor_wrt_cs": 15.93,
            "factor_wrt_ss304": 4.282218,
            "factor_wrt_ss316_ss316l": 2.461324,
            "revision_note": "No change"
          },
          "2024": {
            "low": 748.71,
            "recommended": 831.546,
            "high": 876.15,
            "percentile_used": 0.65,
            "factor_wrt_cs": 15.93,
            "factor_wrt_ss304": 4.282346,
            "factor_wrt_ss316_ss316l": 2.531342,
            "revision_note": "No change"
          },
          "2025": {
            "low": 700.92,
            "recommended": 876.9465,
            "high": 971.73,
            "percentile_used": 0.65,
            "factor_wrt_cs": 15.93,
            "factor_wrt_ss304": 4.282174,
            "factor_wrt_ss316_ss316l": 2.667518,
            "revision_note": "No change"
          },
          "2026": {
            "low": 796.5,
            "recommended": 900.045,
            "high": 955.8,
            "percentile_used": 0.65,
            "factor_wrt_cs": 15.93,
            "factor_wrt_ss304": 4.282258,
            "factor_wrt_ss316_ss316l": 2.765115,
            "revision_note": "No change"
          }
        },
        "factor_wrt_cs_by_year": {
          "2021": 15.93,
          "2022": 15.93,
          "2023": 15.93,
          "2024": 15.93,
          "2025": 15.93,
          "2026": 15.93
        },
        "percentile_used": 0.65
      },
      {
        "ch_comp": "Nickel 200 / 201",
        "pipe_mat_std": [
          "B161",
          "B725",
          "UNS N02200",
          "UNS N02201"
        ],
        "raw_material_basis": "Commercial pure nickel stock",
        "rate_inr_per_kg": {
          "low": 1725.5,
          "recommended": 1949.815,
          "high": 2070.6
        },
        "source_material_name": "Nickel 200 / 201",
        "yearly_rate_inr_per_kg": {
          "2021": {
            "low": 1898.05,
            "recommended": 2234.5225,
            "high": 2415.7,
            "percentile_used": 0.65,
            "factor_wrt_cs": 34.51,
            "factor_wrt_ss304": 9.276882,
            "factor_wrt_ss316_ss316l": 7.923839,
            "revision_note": "No change"
          },
          "2022": {
            "low": 1863.54,
            "recommended": 2446.759,
            "high": 2760.8,
            "percentile_used": 0.65,
            "factor_wrt_cs": 34.51,
            "factor_wrt_ss304": 9.276811,
            "factor_wrt_ss316_ss316l": 6.30608,
            "revision_note": "No change"
          },
          "2023": {
            "low": 1621.97,
            "recommended": 1980.874,
            "high": 2174.13,
            "percentile_used": 0.65,
            "factor_wrt_cs": 34.51,
            "factor_wrt_ss304": 9.276795,
            "factor_wrt_ss316_ss316l": 5.332097,
            "revision_note": "No change"
          },
          "2024": {
            "low": 1621.97,
            "recommended": 1801.422,
            "high": 1898.05,
            "percentile_used": 0.65,
            "factor_wrt_cs": 34.51,
            "factor_wrt_ss304": 9.277073,
            "factor_wrt_ss316_ss316l": 5.483781,
            "revision_note": "No change"
          },
          "2025": {
            "low": 1518.44,
            "recommended": 1899.7755,
            "high": 2105.11,
            "percentile_used": 0.65,
            "factor_wrt_cs": 34.51,
            "factor_wrt_ss304": 9.276701,
            "factor_wrt_ss316_ss316l": 5.778785,
            "revision_note": "No change"
          },
          "2026": {
            "low": 1725.5,
            "recommended": 1949.815,
            "high": 2070.6,
            "percentile_used": 0.65,
            "factor_wrt_cs": 34.51,
            "factor_wrt_ss304": 9.276882,
            "factor_wrt_ss316_ss316l": 5.990215,
            "revision_note": "No change"
          }
        },
        "factor_wrt_cs_by_year": {
          "2021": 34.51,
          "2022": 34.51,
          "2023": 34.51,
          "2024": 34.51,
          "2025": 34.51,
          "2026": 34.51
        },
        "percentile_used": 0.65
      },
      {
        "ch_comp": "Monel 400",
        "pipe_mat_std": [
          "B165",
          "B725",
          "UNS N04400"
        ],
        "raw_material_basis": "Ni-Cu alloy stock",
        "rate_inr_per_kg": {
          "low": 1593.0,
          "recommended": 1800.09,
          "high": 1911.6
        },
        "source_material_name": "Monel 400",
        "yearly_rate_inr_per_kg": {
          "2021": {
            "low": 1752.3,
            "recommended": 2062.935,
            "high": 2230.2,
            "percentile_used": 0.65,
            "factor_wrt_cs": 31.86,
            "factor_wrt_ss304": 8.564516,
            "factor_wrt_ss316_ss316l": 7.315372,
            "revision_note": "No change"
          },
          "2022": {
            "low": 1720.44,
            "recommended": 2258.874,
            "high": 2548.8,
            "percentile_used": 0.65,
            "factor_wrt_cs": 31.86,
            "factor_wrt_ss304": 8.564451,
            "factor_wrt_ss316_ss316l": 5.82184,
            "revision_note": "No change"
          },
          "2023": {
            "low": 1497.42,
            "recommended": 1828.764,
            "high": 2007.18,
            "percentile_used": 0.65,
            "factor_wrt_cs": 31.86,
            "factor_wrt_ss304": 8.564436,
            "factor_wrt_ss316_ss316l": 4.922649,
            "revision_note": "No change"
          },
          "2024": {
            "low": 1497.42,
            "recommended": 1663.092,
            "high": 1752.3,
            "percentile_used": 0.65,
            "factor_wrt_cs": 31.86,
            "factor_wrt_ss304": 8.564693,
            "factor_wrt_ss316_ss316l": 5.062685,
            "revision_note": "No change"
          },
          "2025": {
            "low": 1401.84,
            "recommended": 1753.893,
            "high": 1943.46,
            "percentile_used": 0.65,
            "factor_wrt_cs": 31.86,
            "factor_wrt_ss304": 8.564349,
            "factor_wrt_ss316_ss316l": 5.335036,
            "revision_note": "No change"
          },
          "2026": {
            "low": 1593.0,
            "recommended": 1800.09,
            "high": 1911.6,
            "percentile_used": 0.65,
            "factor_wrt_cs": 31.86,
            "factor_wrt_ss304": 8.564516,
            "factor_wrt_ss316_ss316l": 5.53023,
            "revision_note": "No change"
          }
        },
        "factor_wrt_cs_by_year": {
          "2021": 31.86,
          "2022": 31.86,
          "2023": 31.86,
          "2024": 31.86,
          "2025": 31.86,
          "2026": 31.86
        },
        "percentile_used": 0.65
      },
      {
        "ch_comp": "Aluminium",
        "pipe_mat_std": [
          "B241",
          "B345"
        ],
        "raw_material_basis": "Aluminium billet / extrusion stock / strip",
        "rate_inr_per_kg": {
          "low": 336.5,
          "recommended": 380.245,
          "high": 403.8
        },
        "source_material_name": "Aluminium",
        "yearly_rate_inr_per_kg": {
          "2021": {
            "low": 370.15,
            "recommended": 435.7675,
            "high": 471.1,
            "percentile_used": 0.65,
            "factor_wrt_cs": 6.73,
            "factor_wrt_ss304": 1.80914,
            "factor_wrt_ss316_ss316l": 1.545275,
            "revision_note": "No change"
          },
          "2022": {
            "low": 363.42,
            "recommended": 477.157,
            "high": 538.4,
            "percentile_used": 0.65,
            "factor_wrt_cs": 6.73,
            "factor_wrt_ss304": 1.809126,
            "factor_wrt_ss316_ss316l": 1.229786,
            "revision_note": "No change"
          },
          "2023": {
            "low": 316.31,
            "recommended": 386.302,
            "high": 423.99,
            "percentile_used": 0.65,
            "factor_wrt_cs": 6.73,
            "factor_wrt_ss304": 1.809123,
            "factor_wrt_ss316_ss316l": 1.039844,
            "revision_note": "No change"
          },
          "2024": {
            "low": 316.31,
            "recommended": 351.306,
            "high": 370.15,
            "percentile_used": 0.65,
            "factor_wrt_cs": 6.73,
            "factor_wrt_ss304": 1.809177,
            "factor_wrt_ss316_ss316l": 1.069425,
            "revision_note": "No change"
          },
          "2025": {
            "low": 296.12,
            "recommended": 370.4865,
            "high": 410.53,
            "percentile_used": 0.65,
            "factor_wrt_cs": 6.73,
            "factor_wrt_ss304": 1.809104,
            "factor_wrt_ss316_ss316l": 1.126955,
            "revision_note": "No change"
          },
          "2026": {
            "low": 336.5,
            "recommended": 380.245,
            "high": 403.8,
            "percentile_used": 0.65,
            "factor_wrt_cs": 6.73,
            "factor_wrt_ss304": 1.80914,
            "factor_wrt_ss316_ss316l": 1.168187,
            "revision_note": "No change"
          }
        },
        "factor_wrt_cs_by_year": {
          "2021": 6.73,
          "2022": 6.73,
          "2023": 6.73,
          "2024": 6.73,
          "2025": 6.73,
          "2026": 6.73
        },
        "percentile_used": 0.65
      }
    ]
  }
];

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  elements.themeToggle.setAttribute(
    "aria-label",
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
  );
  document.querySelector("#theme-toggle-label").textContent =
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
}

function toggleTheme() {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem("csPipeTheme", nextTheme);
  applyTheme(nextTheme);
}

function sizeGroup(size) {
  if (size <= 6) return "0.5-6 IN";
  if (size >= 8 && size <= 24) return "8-24 IN";
  if (size >= 26 && size <= 48) return "26-48 IN";
  return "Other";
}

function formatPipeSize(size) {
  const numericSize = Number(size);
  const fractionalSizes = {
    0.5: "1/2",
    0.75: "3/4",
    1.5: "1 1/2",
  };

  return fractionalSizes[numericSize] || String(numericSize).replace(/\.0$/, "");
}

function formatNumber(value, decimals = 2) {
  if (!Number.isFinite(value)) return "-";
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatCurrency(value, decimals = 2) {
  if (!Number.isFinite(value)) return "-";
  // Keep large management totals compact while retaining the underlying exact calculation value.
  const currencyDecimals = 2;
  if (Math.abs(value) >= 100000) {
    return `Rs ${(value / 100000).toLocaleString("en-IN", {
      minimumFractionDigits: currencyDecimals,
      maximumFractionDigits: currencyDecimals,
    })} Lakhs`;
  }
  return `Rs ${value.toLocaleString("en-IN", {
    minimumFractionDigits: currencyDecimals,
    maximumFractionDigits: currencyDecimals,
  })}`;
}

function formatPlainCurrency(value, decimals = 2) {
  if (!Number.isFinite(value)) return "";
  return value.toFixed(decimals);
}

function formatCountInWords(value) {
  const count = Math.max(0, Math.floor(Number(value) || 0));
  const belowTwenty = [
    "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen",
    "Eighteen", "Nineteen",
  ];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const underThousand = (number) => {
    if (number < 20) return belowTwenty[number];
    if (number < 100) return `${tens[Math.floor(number / 10)]}${number % 10 ? ` ${belowTwenty[number % 10]}` : ""}`;
    return `${belowTwenty[Math.floor(number / 100)]} Hundred${number % 100 ? ` ${underThousand(number % 100)}` : ""}`;
  };

  if (count < 1000) return underThousand(count);
  if (count < 100000) return `${underThousand(Math.floor(count / 1000))} Thousand${count % 1000 ? ` ${underThousand(count % 1000)}` : ""}`;
  return String(count);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function cleanDisplayText(value) {
  return String(value || "")
    .replace(/Â½/g, "1/2")
    .replace(/Â¾/g, "3/4")
    .replace(/Â¼/g, "1/4")
    .replace(/Â/g, "")
    .trim();
}

function formatPercentChange(value) {
  const numericValue = Number(value) || 0;
  return `${numericValue > 0 ? "+" : ""}${numericValue}%`;
}

function getFactor(coating) {
  return coatingFactors[coating] || coatingFactors.No;
}

function flattenText(value) {
  if (Array.isArray(value)) return value.map(flattenText).join(" ");
  if (value && typeof value === "object") return Object.values(value).map(flattenText).join(" ");
  return String(value || "");
}

function normalizeMaterialText(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/ASTM/g, "")
    .replace(/GRADE/g, "GR")
    .replace(/\bGRA\b/g, "GR A")
    .replace(/\bGRB\b/g, "GR B")
    .replace(/\bGRC\b/g, "GR C")
    .replace(/[^A-Z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compactMaterialText(value) {
  return normalizeMaterialText(value).replace(/[^A-Z0-9]+/g, "");
}

function extractMaterialSpec(value) {
  const text = normalizeMaterialText(value);
  const compact = compactMaterialText(value);
  const apiMatch = text.match(/\bAPI\s*5L\b/);
  const astmMatch = text.match(/\bA\s*([0-9]{2,4})(?=\b|GR|TP|$)/) || compact.match(/A([0-9]{2,4})(?=GR|TP|WP|WPL|WPHY|F|LF|WCA|WCB|WCC|LCB|LCC|WC|CA|CF|CN|CD|CY|$)/);
  const spec = apiMatch ? "API5L" : astmMatch ? `A${astmMatch[1]}` : "";
  const grades = new Set();

  const addGrade = (grade) => {
    const normalized = String(grade || "").toUpperCase().replace(/[^A-Z0-9]+/g, "");
    if (!normalized) return;
    grades.add(normalized);
    grades.add(normalized.replace(/^GR/, ""));
    grades.add(normalized.replace(/^TP/, ""));
  };

  const tpMatch = text.match(/\bTP\s*([0-9A-Z]+)\b/);
  if (tpMatch) {
    addGrade(`TP${tpMatch[1]}`);
    addGrade(tpMatch[1]);
  }

  const grMatch = text.match(/\bGR\s*([A-Z0-9]+)\b/);
  if (grMatch) addGrade(grMatch[1]);

  const componentGradeMatch = text.match(/\b(WPHY|WPL|WP|LF|F)\s*([A-Z0-9]+)\b/);
  if (componentGradeMatch) {
    addGrade(`${componentGradeMatch[1]}${componentGradeMatch[2]}`);
    addGrade(componentGradeMatch[2]);
  }

  (compact.match(/(?:GR|TP|WPHY|WPL|WP|LF|F)([A-Z0-9]+)/g) || []).forEach((match) =>
    addGrade(match.replace(/^(GR|TP|WPHY|WPL|WP|LF|F)/, ""))
  );
  (compact.match(/WCA|WCB|WCC|LCB|LCC|LC3|LC2|LC9|WC1|WC4|WC5|WC6|WC9|C12A|C12|C5|CA15|CF3M|CF3|CF8M|CF8|CN7M|CD3MWCUN|CD4MCUN|CY40/g) || []).forEach(addGrade);
  (compact.match(/X[0-9]{2,3}/g) || []).forEach(addGrade);

  return { spec, grades: Array.from(grades), compact };
}

function getJsonStandardAliases(standard) {
  const parsed = extractMaterialSpec(standard);
  if (!parsed.spec) return [];

  const normalized = normalizeMaterialText(standard);
  const gradeTokens = new Set(parsed.grades);
  const gradeSectionMatch = normalized.match(/\b(?:GR|TP)\s*([A-Z0-9][A-Z0-9\s\/,.-]*)/);

  if (gradeSectionMatch) {
    gradeSectionMatch[1]
      .split(/[\s\/,.-]+/)
      .map((token) => token.trim())
      .filter(Boolean)
      .forEach((token) => gradeTokens.add(token.replace(/[^A-Z0-9]+/g, "")));
  }

  return [
    {
      spec: parsed.spec,
      grades: Array.from(gradeTokens).filter(Boolean),
      compact: parsed.compact,
      label: String(standard || ""),
    },
  ];
}

function classifyMaterialSpec(specText) {
  const parsedInput = extractMaterialSpec(specText);
  const inputCompact = compactMaterialText(specText);

  if (!materialSpecificationRows.length) {
    return {
      category: "Unclassified",
      matchedStandard: "",
      matchId: "",
      note:
        materialSpecificationStatus === "failed"
          ? "ASTM JSON not loaded"
          : "ASTM JSON loading",
    };
  }

  let bestMatch = null;
  let bestScore = 0;

  materialSpecificationRows.forEach((row) => {
    (row.pipeAliases || []).forEach((alias) => {
      let score = 0;
      if (parsedInput.spec && alias.spec === parsedInput.spec) score += 60;
      if (alias.compact && inputCompact.includes(alias.compact)) score += 45;
      if (parsedInput.compact && alias.compact.includes(parsedInput.compact)) score += 25;

      const matchingGrade = parsedInput.grades.find((grade) => alias.grades.includes(grade));
      if (matchingGrade) score += 45;
      if (parsedInput.spec && alias.spec === parsedInput.spec && !parsedInput.grades.length) {
        score += 10;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          category: row.basic_material_of_construction || "Unclassified",
          matchedStandard: alias.label,
          matchId: row.id,
          note: matchingGrade ? `Matched grade ${matchingGrade}` : "Matched material standard",
        };
      }
    });
  });

  if (!bestMatch || bestScore < 60) {
    const fallbackMatch = classifyMaterialSpecFallback(parsedInput, inputCompact);
    if (fallbackMatch) return fallbackMatch;

    return {
      category: "Unclassified",
      matchedStandard: "",
      matchId: "",
      note: "No ASTM pipe material standard match",
    };
  }

  return bestMatch;
}

function materialGradeHas(parsedInput, ...needles) {
  const gradeText = parsedInput.grades.join(" ");
  return needles.some((needle) => gradeText.includes(needle));
}

function classifyMaterialSpecFallback(parsedInput, inputCompact) {
  const spec = parsedInput.spec;

  if (spec === "A234") {
    if (materialGradeHas(parsedInput, "WPB", "WPC", "B", "C")) {
      return {
        category: "Carbon Steel",
        matchedStandard: "ASTM A234 WPB/WPC",
        matchId: "fallback-a234-carbon",
        note: "Fallback matched carbon steel butt-weld fitting standard",
      };
    }
    if (materialGradeHas(parsedInput, "WP1", "WP5", "WP9", "WP11", "WP12", "WP22", "WP91")) {
      return {
        category: "Low & Int. Alloy Steel for High temp Service",
        matchedStandard: "ASTM A234 alloy fitting",
        matchId: "fallback-a234-alloy",
        note: "Fallback matched alloy steel butt-weld fitting standard",
      };
    }
  }

  if (spec === "A403") {
    return {
      category: "Austenitic Stainless Steel",
      matchedStandard: "ASTM A403 stainless fitting",
      matchId: "fallback-a403-stainless",
      note: "Fallback matched stainless steel fitting standard",
    };
  }

  if (spec === "A182") {
    if (materialGradeHas(parsedInput, "F304", "F304L", "F316", "F316L", "F321", "F347")) {
      return {
        category: "Austenitic Stainless Steel",
        matchedStandard: "ASTM A182 stainless forged component",
        matchId: "fallback-a182-stainless",
        note: "Fallback matched stainless steel forged component standard",
      };
    }
    if (materialGradeHas(parsedInput, "F5", "F9", "F11", "F12", "F22", "F91")) {
      return {
        category: "Low & Int. Alloy Steel for High temp Service",
        matchedStandard: "ASTM A182 alloy forged component",
        matchId: "fallback-a182-alloy",
        note: "Fallback matched alloy steel forged component standard",
      };
    }
  }

  if (spec === "A105") {
    return {
      category: "Carbon Steel",
      matchedStandard: "ASTM A105",
      matchId: "fallback-a105-carbon",
      note: "Fallback matched carbon steel forged component standard",
    };
  }

  if (spec === "A216") {
    if (materialGradeHas(parsedInput, "WCA", "WCB", "WCC")) {
      return {
        category: "Carbon Steel",
        matchedStandard: "ASTM A216 WCA/WCB/WCC",
        matchId: "fallback-a216-carbon-casting",
        note: "Fallback matched carbon steel casting standard",
      };
    }
  }

  if (spec === "A350") {
    return {
      category: "Low Temp.CS",
      matchedStandard: "ASTM A350",
      matchId: "fallback-a350-low-temp",
      note: "Fallback matched low-temperature carbon steel forged component standard",
    };
  }

  if (spec === "A420") {
    return {
      category: "Low Temp.CS",
      matchedStandard: "ASTM A420",
      matchId: "fallback-a420-low-temp",
      note: "Fallback matched low-temperature carbon steel fitting standard",
    };
  }

  if (spec === "A352") {
    if (materialGradeHas(parsedInput, "LCB", "LCC", "LC2", "LC3", "LC9")) {
      return {
        category: "Low Temp.CS",
        matchedStandard: "ASTM A352 low-temperature casting",
        matchId: "fallback-a352-low-temp-casting",
        note: "Fallback matched low-temperature casting standard",
      };
    }
  }

  if (spec === "A217") {
    if (materialGradeHas(parsedInput, "WC1", "WC4", "WC5", "WC6", "WC9", "C5", "C12", "C12A", "CA15")) {
      return {
        category: "Low & Int. Alloy Steel for High temp Service",
        matchedStandard: "ASTM A217 alloy casting",
        matchId: "fallback-a217-alloy-casting",
        note: "Fallback matched alloy steel casting standard",
      };
    }
  }

  if (spec === "A860" || inputCompact.includes("WPHY")) {
    return {
      category: "High Strength Carbon /Low Alloy Steel. (All API 5L PSL 2 Pipe)",
      matchedStandard: "ASTM A860 WPHY",
      matchId: "fallback-a860-high-strength",
      note: "Fallback matched high-strength fitting standard",
    };
  }

  return null;
}

function applyMaterialCategory(item) {
  const match = classifyMaterialSpec(item.spec);
  item.materialCategory = match.category;
  item.materialMatchedStandard = match.matchedStandard;
  item.materialMatchId = match.matchId;
  item.materialMatchNote = match.note;
  return item;
}

function applyBomMaterialCategory(item) {
  const match = classifyMaterialSpec(item.material);
  item.materialCategory = match.category;
  item.materialMatchedStandard = match.matchedStandard;
  item.materialMatchId = match.matchId;
  item.materialMatchNote = match.note;
  return item;
}

function addCarbonSteelPipeStandards(rows) {
  const normalizedRows = Array.isArray(rows) ? rows.map((row) => ({ ...row })) : [];
  const carbonRow = normalizedRows.find((row) =>
    String(row.basic_material_of_construction || "").toLowerCase().includes("carbon steel")
  );

  if (!carbonRow) return normalizedRows;

  carbonRow.pipes = carbonRow.pipes || {};
  const standards = carbonRow.pipes.material_standard || [];
  additionalCarbonSteelPipeStandards.forEach((standard) => {
    if (!standards.some((existing) => compactMaterialText(existing) === compactMaterialText(standard))) {
      standards.push(standard);
    }
  });
  carbonRow.pipes.material_standard = standards;
  return normalizedRows;
}

function prepareMaterialSpecificationRows(rows) {
  return addCarbonSteelPipeStandards(rows).map((row) => ({
    ...row,
    pipeAliases: getMaterialStandardAliases(row),
  }));
}

function normalizeMaterialStandardList(values) {
  const list = Array.isArray(values) ? values : values ? [values] : [];
  const cleaned = list
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .filter((value) => !/\b(no\s+eq|no\s+equivalent|fitting\s+sp|forg|cstg\s*spec|material|same\s+as|pipe)\b/i.test(value));

  const combined = cleaned.length > 1 ? [cleaned.join(" ")] : [];
  return [...cleaned, ...combined];
}

function getMaterialStandardAliases(row) {
  return [
    ...normalizeMaterialStandardList(row.pipes?.material_standard),
    ...normalizeMaterialStandardList(row.socket_weld_fittings?.material_standard),
    ...normalizeMaterialStandardList(row.butt_weld_fittings?.material_standard),
    ...normalizeMaterialStandardList(row.flanges?.material_standard),
    ...normalizeMaterialStandardList(row.castings_material_standard),
  ].flatMap(getJsonStandardAliases);
}

async function loadMaterialSpecificationData() {
  materialSpecificationRows = prepareMaterialSpecificationRows(builtInMaterialSpecificationRows);
  materialSpecificationStatus = "built-in";
  lineItems.forEach(applyMaterialCategory);
  bomGroupItems.forEach(applyBomMaterialCategory);

  try {
    const response = await fetch("astm_piping_material_specification_webapp.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    materialSpecificationRows = prepareMaterialSpecificationRows(
      data.material_specification_rows || []
    );
    materialSpecificationStatus = "loaded";
    lineItems.forEach(applyMaterialCategory);
    bomGroupItems.forEach(applyBomMaterialCategory);
    renderLineItems();
    renderBomGroupReview();
  } catch (error) {
    materialSpecificationRows = prepareMaterialSpecificationRows(builtInMaterialSpecificationRows);
    materialSpecificationStatus = "built-in";
    lineItems.forEach(applyMaterialCategory);
    bomGroupItems.forEach(applyBomMaterialCategory);
    renderLineItems();
    renderBomGroupReview();
  }
}

async function loadPwhtRules() {
  if (globalThis.NRL_PWHT_RULES?.categories) {
    pwhtRulesData = globalThis.NRL_PWHT_RULES;
    pwhtRulesSource = "NRL JavaScript rule library";
    renderPipingServiceCost();
    return;
  }

  try {
    const response = await fetch("Piping%20Service%20Cost%20for%20Web%20App/nrl_pwht_rules.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    pwhtRulesData = await response.json();
    pwhtRulesSource = "NRL JSON library";
  } catch (error) {
    pwhtRulesData = { categories: { local_d25a_fallback: builtInPwhtFallbackRules } };
    pwhtRulesSource = "Built-in PWHT fallback";
  }
  renderPipingServiceCost();
}

async function loadFlangeWeightModel() {
  if (flangeWeightModelStatus === "loaded" && flangeWeightModel?.exactWeights) {
    return flangeWeightModel;
  }
  if (flangeWeightModelPromise) return flangeWeightModelPromise;

  flangeWeightModelStatus = "loading";
  flangeWeightModelPromise = (async () => {
    try {
      const response = await fetch("flange-weight-3-input-model-v2.json");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      flangeWeightModel = await response.json();
      flangeWeightModelStatus = "loaded";
      bomGroupItems.forEach((item) => {
        if (item.group === "Flange Group") {
          item.componentCost = buildComponentCostEstimate({
            group: item.group,
            item: item.item,
            standardName: item.standardName,
            sizeText: item.size,
            thicknessText: item.thickness,
            materialText: item.material,
            quantityText: item.quantity,
            uomText: item.uom,
          });
        }
      });
      renderBomGroupReview();
      return flangeWeightModel;
    } catch (error) {
      flangeWeightModel = null;
      flangeWeightModelStatus = "failed";
      return null;
    } finally {
      flangeWeightModelPromise = null;
    }
  })();

  return flangeWeightModelPromise;
}

async function ensureFlangeWeightModelLoaded() {
  if (flangeWeightModelStatus === "loaded" && flangeWeightModel?.exactWeights) {
    return flangeWeightModel;
  }
  return loadFlangeWeightModel();
}

function repriceUnequalTeeBomItems() {
  // Reprice only unequal/reducing tees after the approved dimensions are available.
  bomGroupItems.forEach((item) => {
    if (item.group === "Fitting Group" && item.componentCost?.component === "Reducing Tee") {
      item.componentCost = buildComponentCostEstimate({
        group: item.group,
        item: item.item,
        standardName: item.standardName,
        sizeText: item.size,
        thicknessText: item.thickness,
        materialText: item.material,
        quantityText: item.quantity,
        uomText: item.uom,
      });
    }
  });
  renderBomGroupReview();
  if (isManualUnequalTeeSelection()) updateComponentFieldLayout(false);
}

async function loadUnequalTeeDimensions() {
  if (Array.isArray(globalThis.UNEQUAL_TEE_DIMENSIONS?.records)) {
    unequalTeeDimensions = globalThis.UNEQUAL_TEE_DIMENSIONS.records;
    unequalTeeDimensionsStatus = unequalTeeDimensions.length ? "loaded" : "failed";
    repriceUnequalTeeBomItems();
    return;
  }

  try {
    const response = await fetch(
      "Piping%20Service%20Cost%20for%20Web%20App/unequal_tee_dimensions_C_M.json"
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    unequalTeeDimensions = Array.isArray(data.records) ? data.records : [];
    unequalTeeDimensionsStatus = unequalTeeDimensions.length ? "loaded" : "failed";
  } catch (error) {
    unequalTeeDimensions = [];
    unequalTeeDimensionsStatus = "failed";
  }

  repriceUnequalTeeBomItems();
}

function resetRawMaterialLibraryOutputs(message = "-") {
  elements.materialStandardOutput.textContent = message;
  elements.rawMaterialBasisOutput.textContent = message;
  elements.rawMaterialRangeOutput.textContent = message;
  elements.recommendedRateOutput.textContent = message;
  elements.factorCsOutput.value = message;
}

function getSelectedRawMaterialGroup() {
  return rawMaterialPriceLibrary.find(
    (group) => group.basic_mat_of_const === elements.materialBasis.value
  );
}

function getSelectedRawMaterialItem() {
  const group = getSelectedRawMaterialGroup();
  if (!group) return null;
  const itemIndex = String(elements.materialGradeFamily.value || "").split("|")[0];
  return (group.children || []).find(
    (_, index) => String(index) === itemIndex
  );
}

function getSelectedPipeMaterialStandard() {
  const item = getSelectedRawMaterialItem();
  if (!item) return "";

  const [, standardIndex = "0"] = String(elements.materialGradeFamily.value || "").split("|");
  const standards = (item.pipe_mat_std || []).map(cleanDisplayText);
  return standards[Number(standardIndex)] || standards[0] || "";
}

function getRawMaterialGradeLabel(item) {
  const family = item?.grade_family || item?.ch_comp || "Grade family";
  const chComp = item?.grade_family && item?.ch_comp ? ` / ${item.ch_comp}` : "";
  return cleanDisplayText(`${family}${chComp}`);
}

function getSelectedPriceYear(year = elements.year.value) {
  const numericYear = Number(year) || 2026;
  return String(numericYear);
}

function getRawMaterialYearRate(item, year = elements.year.value) {
  const selectedYear = getSelectedPriceYear(year);
  const yearlyRate = item?.yearly_rate_inr_per_kg?.[selectedYear];
  const fallbackRate = item?.rate_inr_per_kg || {};
  const rate = yearlyRate || fallbackRate;
  const recommended = Number(rate.recommended);
  const low = Number(rate.low);
  const high = Number(rate.high);
  const factorWrtCs = Number(
    rate.factor_wrt_cs ?? item?.factor_wrt_cs_by_year?.[selectedYear]
  );

  return {
    year: selectedYear,
    low,
    recommended,
    high,
    percentileUsed: Number(rate.percentile_used ?? item?.percentile_used),
    factorWrtCs,
    revisionNote: rate.revision_note || "",
  };
}

function scoreRawMaterialStandardMatch(inputText, standardText) {
  const parsedInput = extractMaterialSpec(inputText);
  const parsedStandard = extractMaterialSpec(standardText);
  const inputCompact = compactMaterialText(inputText);
  const standardCompact = compactMaterialText(standardText);
  let score = 0;

  if (!inputCompact || !standardCompact) return 0;
  if (parsedInput.spec && parsedStandard.spec && parsedInput.spec === parsedStandard.spec) score += 60;
  if (standardCompact && inputCompact.includes(standardCompact)) score += 45;
  if (inputCompact && standardCompact.includes(inputCompact)) score += 25;

  const gradeMatch = parsedInput.grades.find((grade) => parsedStandard.grades.includes(grade));
  if (gradeMatch) score += 45;
  if (parsedInput.spec && parsedInput.spec === parsedStandard.spec && !parsedInput.grades.length) score += 10;

  return score;
}

function getEquivalentPipeSpecForComponentMaterial(specText) {
  const parsed = extractMaterialSpec(specText);
  const compact = parsed.compact || compactMaterialText(specText);
  const hasGrade = (...needles) => materialGradeHas(parsed, ...needles);

  if (parsed.spec === "A234") {
    if (hasGrade("WP1", "1")) return "A335 Gr.P1";
    if (hasGrade("WP5", "5")) return "A335 Gr.P5";
    if (hasGrade("WP9", "9")) return "A335 Gr.P9";
    if (hasGrade("WP11", "11")) return "A335 Gr.P11";
    if (hasGrade("WP12", "12")) return "A335 Gr.P12";
    if (hasGrade("WP22", "22")) return "A335 Gr.P22";
    if (hasGrade("WP91", "91")) return "A335 Gr.P91";
    if (hasGrade("WPB", "B")) return "A106 Gr.B";
    if (hasGrade("WPC", "C")) return "A106 Gr.C";
  }

  if (parsed.spec === "A403") {
    if (hasGrade("WP304L", "304L")) return "A312 TP304L";
    if (hasGrade("WP304", "304")) return "A312 TP304";
    if (hasGrade("WP316L", "316L")) return "A312 TP316L";
    if (hasGrade("WP316", "316")) return "A312 TP316";
    if (hasGrade("WP321", "321")) return "A312 TP321";
    if (hasGrade("WP347", "347")) return "A312 TP347";
  }

  if (parsed.spec === "A182") {
    if (hasGrade("F304L", "304L")) return "A312 TP304L";
    if (hasGrade("F304", "304")) return "A312 TP304";
    if (hasGrade("F316L", "316L")) return "A312 TP316L";
    if (hasGrade("F316", "316")) return "A312 TP316";
    if (hasGrade("F321", "321")) return "A312 TP321";
    if (hasGrade("F347", "347")) return "A312 TP347";
    if (hasGrade("F1", "1")) return "A335 Gr.P1";
    if (hasGrade("F5", "5")) return "A335 Gr.P5";
    if (hasGrade("F9", "9")) return "A335 Gr.P9";
    if (hasGrade("F11", "11")) return "A335 Gr.P11";
    if (hasGrade("F12", "12")) return "A335 Gr.P12";
    if (hasGrade("F22", "22")) return "A335 Gr.P22";
    if (hasGrade("F91", "91")) return "A335 Gr.P91";
  }

  if (parsed.spec === "A105" || compact.includes("A105")) return "A106 Gr.B";
  if (parsed.spec === "A350" && hasGrade("LF2", "2")) return "A333 Gr.6";
  if (parsed.spec === "A420" && hasGrade("WPL6", "6")) return "A333 Gr.6";
  if (parsed.spec === "A860" || compact.includes("WPHY")) {
    const xGrade = parsed.grades.find((grade) => /^X\d{2,3}$/.test(grade));
    const wphyGrade = parsed.grades.find((grade) => /^WPHY\d{2,3}$/.test(grade));
    const gradeNumber = xGrade?.replace("X", "") || wphyGrade?.replace("WPHY", "") || "";
    return gradeNumber ? `API 5L X${gradeNumber}` : "API 5L X52";
  }

  return "";
}

function findRawMaterialPriceBestMatch(specText) {
  let bestMatch = null;
  let bestScore = 0;

  rawMaterialPriceLibrary.forEach((group) => {
    (group.children || []).forEach((item) => {
      (item.pipe_mat_std || []).forEach((standard) => {
        const score = scoreRawMaterialStandardMatch(specText, standard);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = { group, item, standard };
        }
      });
    });
  });

  return bestMatch && bestScore >= 60 ? { ...bestMatch, score: bestScore } : null;
}

function getRawMaterialPriceMapping(specText, year = elements.year.value) {
  const directMatch = findRawMaterialPriceBestMatch(specText);
  const equivalentPipeSpec = directMatch ? "" : getEquivalentPipeSpecForComponentMaterial(specText);
  const equivalentMatch = equivalentPipeSpec ? findRawMaterialPriceBestMatch(equivalentPipeSpec) : null;
  const bestMatch = directMatch || equivalentMatch;

  if (!bestMatch) return null;

  const rate = getRawMaterialYearRate(bestMatch.item, year);
  const recommended = Number(rate.recommended);
  if (!Number.isFinite(recommended) || recommended <= 0) return null;

  const range = `${formatCurrency(Number(rate.low), 2)} to ${formatCurrency(Number(rate.high), 2)}`;
  const basis = cleanDisplayText(bestMatch.item.raw_material_basis || "-");
  const groupName = cleanDisplayText(bestMatch.group.basic_mat_of_const);
  const gradeLabel = getRawMaterialGradeLabel(bestMatch.item);
  const matchedStandard = cleanDisplayText(bestMatch.standard);
  const equivalentNote = equivalentMatch
    ? `; component material ${cleanDisplayText(specText)} mapped to equivalent pipe basis ${cleanDisplayText(
        equivalentPipeSpec
      )}`
    : "";

  return {
    recommended,
    low: Number(rate.low),
    high: Number(rate.high),
    basis,
    range,
    factorWrtCs: rate.factorWrtCs,
    year: rate.year,
    groupName,
    gradeLabel,
    standard: matchedStandard,
    equivalentPipeSpec: equivalentMatch ? cleanDisplayText(equivalentPipeSpec) : "",
    note: `BOM material raw price mapping for ${rate.year}: ${groupName} / ${gradeLabel}; matched ${cleanDisplayText(
      bestMatch.standard
    )}${equivalentNote}; basis ${basis}; range ${range}; factor w.r.t. CS ${formatNumber(rate.factorWrtCs, 2)}`,
  };
}

function populateRawMaterialBasisOptions() {
  elements.materialBasis.innerHTML = '<option value="">Select material group</option>';
  rawMaterialPriceLibrary.forEach((group) => {
    const option = document.createElement("option");
    option.value = group.basic_mat_of_const;
    option.textContent = cleanDisplayText(group.basic_mat_of_const);
    elements.materialBasis.append(option);
  });
}

function populateRawMaterialGradeOptions() {
  const group = getSelectedRawMaterialGroup();
  elements.materialGradeFamily.innerHTML = '<option value="">Select pipe material standard</option>';
  elements.materialGradeFamily.disabled = !group;

  if (!group) {
    resetRawMaterialLibraryOutputs("-");
    return;
  }

  (group.children || []).forEach((item, index) => {
    (item.pipe_mat_std || []).forEach((standard, standardIndex) => {
      const option = document.createElement("option");
      option.value = `${index}|${standardIndex}`;
      option.textContent = cleanDisplayText(standard);
      elements.materialGradeFamily.append(option);
    });
  });
  resetRawMaterialLibraryOutputs("Select pipe material standard");
}

function getDefaultPipeStandardValue(group, itemIndex = 0) {
  const item = group?.children?.[itemIndex];
  if (!item) return "";
  const standards = (item.pipe_mat_std || []).map(cleanDisplayText);
  const preferredIndex = standards.findIndex((standard) => /A106/i.test(standard));
  return `${itemIndex}|${preferredIndex >= 0 ? preferredIndex : 0}`;
}

function refreshRawMaterialLibrarySelection(previousBasis = "", previousGrade = "") {
  populateRawMaterialBasisOptions();

  if (previousBasis) {
    elements.materialBasis.value = previousBasis;
  }

  if (!elements.materialBasis.value) {
    selectDefaultCarbonSteelPrice();
    return;
  }

  populateRawMaterialGradeOptions();

  if (previousGrade) {
    elements.materialGradeFamily.value = previousGrade.includes("|")
      ? previousGrade
      : getDefaultPipeStandardValue(getSelectedRawMaterialGroup(), Number(previousGrade) || 0);
  }

  if (elements.materialGradeFamily.value) {
    applyRawMaterialPriceSelection();
  } else if (isCarbonSteelRawMaterialSelection()) {
    elements.materialGradeFamily.value = getDefaultPipeStandardValue(getSelectedRawMaterialGroup(), 0);
    applyRawMaterialPriceSelection();
  } else {
    clearRawMaterialPriceSelection();
  }
}

function isCarbonSteelRawMaterialSelection() {
  return elements.materialBasis.value === "Carbon Steel";
}

function hasIncompleteNonCarbonSteelSelection() {
  return Boolean(elements.materialBasis.value) &&
    !isCarbonSteelRawMaterialSelection() &&
    !elements.materialGradeFamily.value;
}

function clearRawMaterialPriceSelection() {
  elements.rawOverride.value = "";
  delete elements.rawOverride.dataset.source;
  delete elements.rawOverride.dataset.sourceType;
}

function selectDefaultCarbonSteelPrice() {
  const carbonSteelGroup = rawMaterialPriceLibrary.find(
    (group) => group.basic_mat_of_const === "Carbon Steel"
  );
  if (!carbonSteelGroup) return;

  elements.materialBasis.value = carbonSteelGroup.basic_mat_of_const;
  populateRawMaterialGradeOptions();
  elements.materialGradeFamily.value = getDefaultPipeStandardValue(carbonSteelGroup, 0);
  applyRawMaterialPriceSelection();
}

function applyRawMaterialPriceSelection() {
  const item = getSelectedRawMaterialItem();
  if (!item) {
    resetRawMaterialLibraryOutputs(elements.materialBasis.value ? "Select pipe material standard" : "-");
    clearRawMaterialPriceSelection();
    return;
  }

  const rate = getRawMaterialYearRate(item);
  const standardList = (item.pipe_mat_std || []).map(cleanDisplayText);
  const selectedStandard = getSelectedPipeMaterialStandard() || standardList[0] || "";
  const basis = cleanDisplayText(item.raw_material_basis || "-");
  const range = `${formatCurrency(Number(rate.low), 2)} to ${formatCurrency(Number(rate.high), 2)}`;
  const recommended = Number(rate.recommended);
  const factorWrtCs = Number(rate.factorWrtCs);

  elements.materialStandardOutput.textContent = getRawMaterialGradeLabel(item);
  elements.rawMaterialBasisOutput.textContent = basis;
  elements.rawMaterialRangeOutput.textContent = range;
  elements.recommendedRateOutput.textContent = Number.isFinite(recommended)
    ? formatCurrency(recommended, 2)
    : "-";
  elements.factorCsOutput.value = Number.isFinite(factorWrtCs)
    ? formatNumber(factorWrtCs, 2)
    : "-";

  if (Number.isFinite(recommended) && recommended > 0) {
    elements.rawOverride.value = recommended.toFixed(2);
    elements.spec.value = selectedStandard || "Other spec";
    elements.rawOverride.dataset.sourceType = "materialLibrary";
    elements.rawOverride.dataset.source = `Suggested raw material mapping: ${cleanDisplayText(
      elements.materialBasis.value
    )} / ${getRawMaterialGradeLabel(item)}; year ${rate.year}; basis ${basis}; range ${range}; factor w.r.t. CS ${
      Number.isFinite(factorWrtCs) ? formatNumber(factorWrtCs, 2) : "-"
    }`;
  }
}

async function loadRawMaterialPriceLibrary() {
  const previousBasis = elements.materialBasis.value;
  const previousGrade = elements.materialGradeFamily.value;
  rawMaterialPriceLibrary = builtInRawMaterialPriceLibrary;
  rawMaterialPriceLibraryStatus = "built-in";
  refreshRawMaterialLibrarySelection(previousBasis, previousGrade);

  try {
    const activeBasis = elements.materialBasis.value;
    const activeGrade = elements.materialGradeFamily.value;
    const response = await fetch("raw_material_price_library.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    rawMaterialPriceLibrary = data.raw_material_price_library?.length
      ? data.raw_material_price_library
      : builtInRawMaterialPriceLibrary;
    rawMaterialPriceLibraryStatus = "loaded";
    refreshRawMaterialLibrarySelection(activeBasis, activeGrade);
  } catch (error) {
    rawMaterialPriceLibrary = builtInRawMaterialPriceLibrary;
    rawMaterialPriceLibraryStatus = "failed";
    refreshRawMaterialLibrarySelection(elements.materialBasis.value, elements.materialGradeFamily.value);
  }
}

function normalizeSchedule(value) {
  const raw = String(value || "").trim().toUpperCase();
  if (!raw) return "";

  const normalized = raw
    .replace(/SCHEDULE|SCH\.?|SCHED\.?/g, "")
    .replace(/#/g, "")
    .replace(/STANDARD/g, "STD")
    .replace(/HEAVY/g, "HVY")
    .replace(/EXTRA\s*STRONG/g, "XS")
    .replace(/DOUBLE\s*EXTRA\s*STRONG/g, "XXS")
    .replace(/[^A-Z0-9]+/g, "");

  if (normalized === "SSTD" || normalized === "STD" || normalized === "ST") return "STD";
  if (normalized === "SHVY" || normalized === "HVY" || normalized === "HY") return "HVY";
  if (normalized === "SXS" || normalized === "XS") return "XS";
  if (normalized === "SXXS" || normalized === "XXS") return "XXS";

  const sizeSchedule = normalized.match(/^S?(\d+S?)$/);
  return sizeSchedule ? sizeSchedule[1] : normalized;
}

function getScheduleThickness(size, schedule) {
  const scheduleKey = normalizeSchedule(schedule);
  return scheduleThicknessTable[Number(size)]?.[scheduleKey] ?? NaN;
}

function parseThicknessInput(value, size) {
  const numericValue = parseBomNumber(value);
  const text = String(value || "");
  const hasScheduleSignal = /[A-Za-z#-]/.test(text);

  if (Number.isFinite(numericValue) && !hasScheduleSignal) {
    return numericValue;
  }

  const scheduleThickness = getScheduleThickness(size, value);
  return Number.isFinite(scheduleThickness) ? scheduleThickness : numericValue;
}

function isScheduleOrRatingColumn(headerName) {
  const normalizedHeader = normalizeHeader(headerName);
  return /sch|sched|rating/.test(normalizedHeader);
}

function parseBomThickness(value, size, headerName = "") {
  // A numeric value in a Sch/Thk/Rating column (for example, 80) is a pipe
  // schedule, not an 80 mm wall thickness. Prefer the B36 lookup in that case.
  if (isScheduleOrRatingColumn(headerName)) {
    const scheduleThickness = getScheduleThickness(size, value);
    if (Number.isFinite(scheduleThickness) && scheduleThickness > 0) return scheduleThickness;
  }
  return parseThicknessInput(value, size);
}

function updateThicknessMode() {
  inputError = "";
  const isScheduleMode = elements.thicknessMode.value === "schedule";
  elements.scheduleField.classList.toggle("hidden", !isScheduleMode);
  elements.scheduleField.classList.toggle("schedule-active", isScheduleMode);
  elements.thicknessLabel.textContent = isScheduleMode
    ? "Calculated Thickness MM"
    : "Thickness MM";
  elements.thickness.readOnly = isScheduleMode;

  if (!isScheduleMode) return;

  const size = Number(elements.size.value);
  const thickness = getScheduleThickness(size, elements.schedule.value);
  if (Number.isFinite(thickness)) {
    elements.thickness.value = thickness.toFixed(2);
    elements.warning.textContent = "";
  } else {
    elements.thickness.value = "";
    inputError = "Select valid schedule from B36.10 or B36.19";
    elements.warning.textContent = inputError;
  }
}

function createId() {
  return globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : String(Date.now() + Math.random());
}

function buildEstimate(input) {
  const year = Number(input.year) || 2026;
  const size = Number(input.size);
  const thickness = Number(input.thickness);
  const length = Number(input.length);
  const coating = input.coating === "Yes" ? "Yes" : "No";
  const spec = String(input.spec || "Other spec").trim() || "Other spec";
  const od = odTable[size];
  const group = sizeGroup(size);
  const rawOverride = Number(input.rawOverride);
  const factorOverride = Number(input.factorOverride);
  const rawOverrideApplied = rawOverride > 0;
  const factorOverrideApplied = factorOverride > 0;
  const rawSteel = rawOverrideApplied ? rawOverride : rawSteelByYear[year] || rawSteelByYear[2026];
  const baseFactors = getFactor(coating);
  const p90Multiplier = baseFactors.p90 / baseFactors.median;
  const factors =
    factorOverrideApplied
      ? {
          ...baseFactors,
          median: factorOverride,
          p90: factorOverride * p90Multiplier,
          source: "Custom estimate factor",
        }
      : baseFactors;

  if (!od) {
    return { error: `Pipe size ${input.size || ""} is not available in the OD table.` };
  }

  if (!Number.isFinite(thickness) || !Number.isFinite(length) || thickness <= 0 || length < 0) {
    return { error: "Thickness must be positive and length cannot be negative." };
  }

  if (thickness >= od / 2) {
    return {
      error:
        "Wall thickness is physically impossible because it is greater than or equal to pipe radius.",
    };
  }

  const weightKgm = 0.0246615 * (od - thickness) * thickness;
  const totalWeight = weightKgm * length;
  const medianRsKg = rawSteel * factors.median;
  const p90RsKg = rawSteel * factors.p90;
  const medianRsM = medianRsKg * weightKgm;
  const p90RsM = p90RsKg * weightKgm;
  const medianTotal = medianRsM * length;
  const p90Total = p90RsM * length;

  return applyMaterialCategory({
    id: createId(),
    year,
    size,
    thickness,
    length,
    spec,
    coating,
    od,
    group,
    rawSteel,
    rawSteelSource: input.rawSteelSource || (rawOverrideApplied ? "manualOverride" : "defaultYear"),
    factors,
    rawSteelBasis: rawOverrideApplied
      ? input.rawBasisNote || "User-entered Raw Steel Rs/kg Override"
      : `Default raw steel basis for ${year}`,
    factorBasis: factorOverrideApplied
      ? `User-entered Estimate Factor Override; P90 recalculated using default multiplier ${formatNumber(
          p90Multiplier,
          3
        )}`
      : `Default ${coating === "Yes" ? "coated" : "non-coated"} pipe factor`,
    weightKgm,
    totalWeight,
    medianRsKg,
    p90RsKg,
    medianRsM,
    p90RsM,
    medianTotal,
    p90Total,
  });
}

function getCurrentEstimate() {
  return buildEstimate({
    year: elements.year.value,
    size: elements.size.value,
    thickness: elements.thickness.value,
    length: elements.length.value,
    spec: elements.spec.value,
    coating: elements.coating.value,
    rawOverride: elements.rawOverride.value,
    rawBasisNote: elements.rawOverride.dataset.source,
    rawSteelSource: elements.rawOverride.dataset.sourceType,
    factorOverride: elements.factorOverride.value,
  });
}

// The prompt bar is intentionally local and rule-based. It reuses the same
// material, schedule and service-rate engines as the visible estimator panels.
function getEstimatorQueryComponentDescriptor(query) {
  const text = String(query || "").toUpperCase();
  if (/\b(?:WN|WELD\s*NECK)\s*(?:FLANGE|FLG)?\b|\bFLANGE\b/.test(text)) {
    return {
      group: "Flange Group",
      component: /\b(?:BLIND|BL\.?\s*FLANGE)\b/.test(text)
        ? "Blind Flange"
        : /\b(?:SO|SLIP\s*ON)\b/.test(text)
          ? "SO Flange"
          : "WN Flange",
      uom: "NOS",
    };
  }
  if (/\b(?:GATE|GLOBE|BALL|CHECK|CONTROL|PLUG|BUTTERFLY)?\s*VALVE\b/.test(text)) {
    const component = /\bGATE\b/.test(text)
      ? "Gate Valve"
      : /\bGLOBE\b/.test(text)
        ? "Globe Valve"
        : /\bBALL\b/.test(text)
          ? "Ball Valve"
          : /\bCHECK\b/.test(text)
            ? "Check Valve"
            : /\bCONTROL\b/.test(text)
              ? "Control Valve"
              : "Valve";
    return { group: "Valves Group", component, uom: "NOS" };
  }
  if (/\b(?:ELBOW|ELB)\b/.test(text)) {
    return {
      group: "Fitting Group",
      component: /\b45(?:\s*(?:D|DEG|DEGREE))?\b/.test(text) ? "45 Degree Elbow" : "90 Degree Elbow",
      uom: "NOS",
    };
  }
  if (/\b(?:RED(?:UCING)?\.?\s*T(?:EE)?|T\.\s*RED|REDUCING\s+TEE)\b/.test(text)) {
    return { group: "Fitting Group", component: "Reducing Tee", uom: "NOS" };
  }
  if (/\b(?:EQUAL\s*T(?:EE)?|T\.\s*EQUAL|TEE)\b/.test(text)) {
    return { group: "Fitting Group", component: "Equal Tee", uom: "NOS" };
  }
  if (/\b(?:CONCENTRIC|CON\.?\s*RED|REDUCER)\b/.test(text)) {
    return { group: "Fitting Group", component: "Concentric Reducer", uom: "NOS" };
  }
  if (/\b(?:NIPPLE|COUPLING|CAP|WELDOLET|OLET)\b/.test(text)) {
    const component = /\bNIPPLE\b/.test(text)
      ? "Nipple"
      : /\bCOUPLING\b/.test(text)
        ? "Full Coupling"
        : /\bCAP\b/.test(text)
          ? "Cap"
          : "Weldolet";
    return { group: "Fitting Group", component, uom: "NOS" };
  }
  if (/\b(?:GASKET|SPIRAL\s*WOUND)\b/.test(text)) {
    return { group: "Gasket Group", component: "Gasket", uom: "NOS" };
  }
  if (/\b(?:STUD|BOLT|NUT)\b/.test(text)) {
    return { group: "Bolt Group", component: "Stud Bolt", uom: "SET" };
  }
  return null;
}

function getEstimatorQuerySchedule(query) {
  const text = String(query || "").toUpperCase();
  const match = text.match(/\b(S[-\s]?(?:STD|HVY|XS|XXS|\d{1,3}S?)|SCH(?:EDULE)?\s*[-\s]?(?:STD|HVY|XS|XXS|\d{1,3}S?)|(?:STD|HVY|XS|XXS))\b/);
  return match ? normalizeSchedule(match[1]) : "";
}

function getEstimatorQueryMaterial(query) {
  const text = String(query || "");
  const year = Number(elements.year.value) || 2026;
  const mapped = getRawMaterialPriceMapping(text, year);
  if (mapped?.standard) return mapped.standard;

  if (/\b(?:SS|STAINLESS)\s*316L\b/i.test(text)) return "ASTM A312 TP316L";
  if (/\b(?:SS|STAINLESS)\s*316\b/i.test(text)) return "ASTM A312 TP316";
  if (/\b(?:SS|STAINLESS)\s*304L\b/i.test(text)) return "ASTM A312 TP304L";
  if (/\b(?:SS|STAINLESS)\s*304\b/i.test(text)) return "ASTM A312 TP304";
  // A prompt that says only "SS" still needs a stainless reference, not the
  // active Carbon Steel selection. TP304 is the standard default reference;
  // users can request SS316, SS316L, SS304L, etc. for a specific grade.
  if (/\b(?:SS|STAINLESS(?:\s+STEEL)?)\b/i.test(text)) return "ASTM A312 TP304";
  if (/\b(?:A335\s*)?(?:GR\.?\s*)?P(?:5|9|11|12|22|91)\b/i.test(text)) {
    const grade = text.match(/\bP(5|9|11|12|22|91)\b/i)?.[1] || "5";
    return `ASTM A335 Gr.P${grade}`;
  }
  if (/\bA106\b/i.test(text)) return "ASTM A106 Gr.B";
  if (/\bA53\b/i.test(text)) return "ASTM A53 Gr.B";
  if (/\bAPI\s*5L\b/i.test(text)) return "API 5L Gr.B";
  if (/\bA234\b/i.test(text)) return "ASTM A234 WPB";
  if (/\bA105\b/i.test(text)) return "ASTM A105";

  const currentSpec = String(elements.spec?.value || "").trim();
  if (currentSpec) return currentSpec;
  const currentStandard = String(elements.materialStandardOutput?.textContent || "").trim();
  if (currentStandard && !/^(-|select|library)/i.test(currentStandard)) return currentStandard;
  return "ASTM A106 Gr.B";
}

function hasExplicitEstimatorQueryMaterial(query) {
  const text = String(query || "");
  return /\b(?:CS|CARBON\s+STEEL|SS|STAINLESS(?:\s+STEEL)?|AUSTENITIC|304L?|316L?|A312|A335|A106|A53|API\s*5L|P(?:5|9|11|12|22|91))\b/i.test(text);
}

function getEstimatorQueryMaterialComparisons({ year, size, thickness, length, coating }) {
  const references = [
    { label: "Carbon Steel", spec: "ASTM A106 Gr.B" },
    { label: "Austenitic SS 304L", spec: "ASTM A312 TP304L" },
    { label: "Alloy Steel P11", spec: "ASTM A335 Gr.P11" },
  ];

  return references
    .map((reference) => {
      const rawMapping = getRawMaterialPriceMapping(reference.spec, year);
      if (!rawMapping?.recommended) return null;
      const estimate = buildEstimate({
        year,
        size,
        thickness,
        length,
        spec: reference.spec,
        coating,
        rawOverride: rawMapping.recommended,
        rawSteelSource: "materialLibrary",
        rawBasisNote: rawMapping.note,
        factorOverride: elements.factorOverride.value,
      });
      if (estimate.error) return null;
      const service = getEstimatorQueryService(
        {
          group: "Pipe Group",
          item: "Pipe",
          standardName: "Pipe",
          size: `${formatPipeSize(size)} IN`,
          thickness: `${thickness} mm`,
          material: reference.spec,
          materialCategory: estimate.materialCategory,
          quantity: String(length),
          uom: "M",
          componentCost: { thickness },
        },
        false
      );
      return { ...reference, rawMapping, estimate, service };
    })
    .filter(Boolean);
}

function getEstimatorQueryLength(query) {
  const text = String(query || "");
  const match = text.match(/(?:\b(?:FOR|LENGTH|LEN)\s*)?(\d+(?:\.\d+)?)\s*(?:M|METRE(?:S)?|METER(?:S)?)\b/i);
  return match ? Number(match[1]) : NaN;
}

function getEstimatorQueryDesignTemperature(query) {
  const text = String(query || "");
  const match = text.match(/\b(?:DESIGN\s*)?TEMP(?:ERATURE)?\s*[:=]?\s*(\d+(?:\.\d+)?)\s*(?:DEG(?:REE)?S?\s*)?(?:C|°C)\b/i)
    || text.match(/\b(\d+(?:\.\d+)?)\s*(?:DEG(?:REE)?S?\s*)?(?:C|°C)\b/i);
  return match ? Number(match[1]) : NaN;
}

function getEstimatorQueryQuantity(query) {
  const text = String(query || "");
  const labelledQuantity = text.match(/\b(?:QTY|QUANTITY|NOS?\.?|NO\.)\s*[:=]?\s*(\d+(?:\.\d+)?)/i);
  if (labelledQuantity) return Number(labelledQuantity[1]);

  // Accept normal estimator wording such as "2 nos 6 IN equal tee price".
  // This must be read as quantity 2, not NPS 2.
  const leadingQuantity = text.match(/(?:^|\s)(\d+(?:\.\d+)?)\s*(?:NOS?\.?|NO\.?)(?=\s|$)/i);
  return leadingQuantity ? Number(leadingQuantity[1]) : 1;
}

function getEstimatorQueryCoating(query) {
  const text = String(query || "").toLowerCase();
  if (/\b(?:uncoated|bare|no coating|without coating)\b/.test(text)) return "No";
  if (/\b(?:coated|coating|pe coated|fbe|epoxy lined|lined)\b/.test(text)) return "Yes";
  return elements.coating.value === "Yes" ? "Yes" : "No";
}

function getEstimatorQueryRating(query, schedule) {
  const pressureMatch = String(query || "").match(/\b(150|300|600|900|1500|2500|800|3000|6000)\s*#/i);
  return pressureMatch ? `${pressureMatch[1]}#` : schedule || "STD";
}

function makeEstimatorQueryTable(headers, rows, numericColumns = []) {
  const headerHtml = headers.map((header, index) =>
    `<th class="${numericColumns.includes(index) ? "ask-result-table-number" : ""}">${escapeHtml(header)}</th>`
  ).join("");
  const bodyHtml = rows.map((row) => `<tr>${row.map((value, index) =>
    `<td class="${numericColumns.includes(index) ? "ask-result-table-number" : ""}">${escapeHtml(value)}</td>`
  ).join("")}</tr>`).join("");

  return `
    <div class="ask-result-table-wrap">
      <table class="ask-result-table">
        <thead><tr>${headerHtml}</tr></thead>
        <tbody>${bodyHtml}</tbody>
      </table>
    </div>`;
}

function getEstimatorOutputHeading(showHeading = true) {
  return showHeading ? '<h3 class="ask-result-output-heading">Output</h3>' : "";
}

function estimatorQueryRequestsSteps(query) {
  return /\b(?:step\s*by\s*step|calculation\s+steps?|calculation\s+breakdown|show\s+the\s+calculation)\b/i.test(String(query || ""));
}

function makeEstimatorStep(number, label, formula, result) {
  return `
    <div class="ask-step-row">
      <span class="ask-step-number">${number}</span>
      <strong class="ask-step-label">${escapeHtml(label)}</strong>
      <span class="ask-step-formula">${escapeHtml(formula)}</span>
      <strong class="ask-step-result">${escapeHtml(result)}</strong>
    </div>
  `;
}

function makeEstimatorStepByStepMarkup(answer, query) {
  if (!estimatorQueryRequestsSteps(query)) return "";
  if (answer.kind !== "Pipe" || !answer.estimate) return "";

  const estimate = answer.estimate;
  const steps = [
    makeEstimatorStep(1, "Outside diameter", "NPS converted to actual OD", `${formatNumber(estimate.od, 2)} mm`),
    makeEstimatorStep(2, "Pipe mass", "W = 0.0246615 x (OD - t) x t", `${formatNumber(estimate.weightKgm, 2)} kg/m`),
    makeEstimatorStep(3, "Total pipe weight", answer.hasLength ? `${formatNumber(estimate.weightKgm, 2)} kg/m x ${formatNumber(estimate.length, 2)} m` : "Length not entered", answer.hasLength ? `${formatNumber(estimate.totalWeight, 2)} kg` : "Enter length for total weight"),
    makeEstimatorStep(4, "Finished normal rate", `${formatCurrency(estimate.rawSteel, 2)}/kg x factor ${formatNumber(estimate.factors.median, 2)}`, `${formatCurrency(estimate.medianRsKg, 2)}/kg`),
    makeEstimatorStep(5, "Normal pipe rate", `${formatCurrency(estimate.medianRsKg, 2)}/kg x ${formatNumber(estimate.weightKgm, 2)} kg/m`, `${formatCurrency(estimate.medianRsM, 2)}/m`),
    makeEstimatorStep(6, "P90 pipe rate", `${formatCurrency(estimate.rawSteel, 2)}/kg x factor ${formatNumber(estimate.factors.p90, 2)} x ${formatNumber(estimate.weightKgm, 2)} kg/m`, `${formatCurrency(estimate.p90RsM, 2)}/m`),
  ];

  if (answer.hasLength) {
    steps.push(
      makeEstimatorStep(7, "Normal material total", `${formatCurrency(estimate.medianRsM, 2)}/m x ${formatNumber(estimate.length, 2)} m`, formatCurrency(estimate.medianTotal, 2)),
      makeEstimatorStep(8, "P90 material total", `${formatCurrency(estimate.p90RsM, 2)}/m x ${formatNumber(estimate.length, 2)} m`, formatCurrency(estimate.p90Total, 2)),
    );
    const service = answer.service || {};
    if (service.status === "READY" && Number.isFinite(service.directServiceCost)) {
      steps.push(makeEstimatorStep(9, "Direct pipe service", `${formatNumber(service.erectionQuantity, 2)} IM + ${formatNumber(service.weldingQuantity, 2)} ID`, formatCurrency(service.directServiceCost, 2)));
    }
  }

  return `
    <section class="ask-result-methodology" aria-label="Calculation steps">
      <div class="ask-result-methodology-heading">
        <h4>Calculation steps</h4>
        <span>Formula and rate basis used for this request</span>
      </div>
      ${steps.join("")}
    </section>
  `;
}

function getEstimatorQueryService(item, hasLength) {
  const componentInput = getServiceComponentInput(item);
  const { scope, nps, thicknessMm, lengthM, jointCount, quantity } = componentInput || {};
  if (!scope) return { status: "NOT_AVAILABLE", reason: "No direct service-rate method is available for this component group." };
  if (scope === "Valve") {
    const valve = buildValveServiceEstimate(item);
    return valve.status === "READY"
      ? {
          status: "READY",
          directServiceCost: valve.costs.directServiceCost,
          rateLabel: `${formatCurrency(valve.valveServiceRateRsKg, 2)}/kg`,
          quantityLabel: `${formatNumber(valve.valveWeightKg * valve.quantity, 2)} kg`,
          source: valve.audit.valveServiceSource,
        }
      : valve;
  }

  const engine = globalThis.PipingServiceCost;
  const rateLibrary = getServiceRateLibraryForMaterialCategory(item.materialCategory);
  if (!engine || !rateLibrary.library) {
    return { status: "NOT_AVAILABLE", reason: "Approved IM and ID service rates are not available for this material category." };
  }
  if (!Number.isFinite(nps) || nps <= 0 || !Number.isFinite(thicknessMm) || thicknessMm <= 0) {
    return { status: "REVIEW_REQUIRED", reason: "Size or wall thickness is required for documented service-rate matching." };
  }

  const location = elements.serviceLocation?.value || "ABOVE_GROUND";
  const regulatoryClass = elements.serviceRegulatoryClass?.value || "NON_IBR";
  const erection = scope === "Pipe"
    ? engine.findRate(rateLibrary.library, { location, regulatoryClass, activity: "ERECTION", weldType: "NA", nps, thicknessMm })
    : null;
  const welding = engine.findRate(rateLibrary.library, { location, regulatoryClass, activity: "FABRICATION", weldType: "BUTT_WELD", nps, thicknessMm });

  if (scope === "Pipe" && !hasLength) {
    return {
      status: erection?.status === "READY" && welding.status === "READY" ? "RATE_ONLY" : "REVIEW_REQUIRED",
      erectionRate: erection?.status === "READY" ? erection.rateRs : NaN,
      weldingRate: welding.status === "READY" ? welding.rateRs : NaN,
      source: `${rateLibrary.label} | ${String(location).replace(/_/g, " ")} / ${String(regulatoryClass).replace(/_/g, " ")}`,
      reason: "Enter a pipe length in metres to calculate direct service cost.",
    };
  }

  const serviceInput = {
    nps,
    thicknessMm,
    lengthM: scope === "Pipe" ? lengthM : 0,
    includeErection: scope === "Pipe",
    location,
    regulatoryClass,
    fabricationMode: scope === "Pipe" ? "STOCK_LENGTH_PROXY" : "MANUAL_JOINT_COUNT",
    stockLengthM: 6,
    lineCount: 1,
    jointAllowanceFactor: 1.6,
    straightButtWeldJoints: jointCount,
    escalationFactor: 1,
    contingencyPercent: 0,
  };
  const estimate = engine.calculatePipeService(serviceInput, rateLibrary.library);
  if (estimate.status !== "READY") return estimate;
  return {
    status: "READY",
    erectionRate: estimate.rates.erectionRsPerIM,
    weldingRate: estimate.rates.buttFabricationRsPerID,
    erectionQuantity: estimate.quantities.erectionQuantityIM,
    weldingQuantity: estimate.quantities.buttWeldDiameterInch,
    directServiceCost: estimate.costs.directServiceCost,
    source: `${rateLibrary.label} | ${String(location).replace(/_/g, " ")} / ${String(regulatoryClass).replace(/_/g, " ")}`,
  };
}

function getEstimatorQueryRateLookup(query) {
  const text = String(query || "");
  const asksForPipeWeightMethod = /\b(?:pipe|piping)\b.*\b(?:weight|mass|kg\s*\/?\s*m)\b/i.test(text)
    && /\b(?:how|calculate|calculation|formula|method|methodology|basis)\b/i.test(text);
  if (asksForPipeWeightMethod) {
    return { rateLookup: true, pipeWeightMethodLookup: true };
  }

  // Let users ask in plain language how each recognised component family is priced.
  // Keep this separate from a price query so it explains the existing approved logic.
  const asksForCalculationMethod = /\b(?:how|calculate|calculation|formula|method|methodology|basis)\b/i.test(text);
  if (asksForCalculationMethod) {
    let componentMethodLookup = "";
    if (/\b(?:bolt|bolts|stud|studs|fastener|fasteners|nut|nuts)\b/i.test(text)) {
      componentMethodLookup = "bolt";
    } else if (/\b(?:flange|flanges|wn\s*flange|blind\s*flange|so\s*flange)\b/i.test(text)) {
      componentMethodLookup = "flange";
    } else if (/\b(?:valve|valves|gate\s*valve|globe\s*valve|ball\s*valve|check\s*valve)\b/i.test(text)) {
      componentMethodLookup = "valve";
    } else if (/\b(?:gasket|gaskets)\b/i.test(text)) {
      componentMethodLookup = "gasket";
    } else if (/\b(?:strainer|strainers|trap|traps)\b/i.test(text)) {
      componentMethodLookup = "strainer";
    } else if (/\b(?:fitting|fittings|elbow|elbows|tee|tees|reducer|reducers|coupling|couplings|nipple|nipples|cap|caps)\b/i.test(text)) {
      componentMethodLookup = "fitting";
    } else if (/\b(?:pipe|pipes|piping)\b/i.test(text)) {
      componentMethodLookup = "pipe";
    }
    if (componentMethodLookup) {
      return { rateLookup: true, componentMethodLookup };
    }
  }

  const asksForMaterialMethodology = /\bpart\s*a\b.*\bmaterial\b.*\bmethod(?:ology)?\b/i.test(text)
    || /\bmaterial\s+cost\s+method(?:ology)?\b/i.test(text)
    || /\bmaterial\s+price(?:ing)?\s+method(?:ology)?\b/i.test(text);
  if (asksForMaterialMethodology) {
    return { rateLookup: true, materialMethodologyLookup: true };
  }

  const asksForServiceMethodology = /\bpart\s*b\b.*\bservice\b.*\bmethod(?:ology)?\b/i.test(text)
    || /\bservice\s+cost\s+method(?:ology)?\b/i.test(text)
    || /\bservice\s+price(?:ing)?\s+method(?:ology)?\b/i.test(text);
  if (asksForServiceMethodology) {
    return { rateLookup: true, serviceMethodologyLookup: true };
  }

  const asksForPaintingRate = /\bpaint(?:ing)?\b/i.test(text) && /\b(?:rate|price|unit|cost)\b/i.test(text);
  if (asksForPaintingRate) {
    return {
      rateLookup: true,
      paintingRateLookup: true,
      uninsulatedRate: getPipePaintingRate(65, "UNINSULATED"),
      cuiLowTemperatureRate: getPipePaintingRate(200, "UNDER_INSULATION"),
      cuiHighTemperatureRate: getPipePaintingRate(300, "UNDER_INSULATION"),
    };
  }

  const asksForServiceRateReference = /\b(?:all\s+)?(?:service|services)\s+(?:unit\s+)?(?:rate|rates|price|prices)\b/i.test(text)
    || /\ball\s+unit\s+(?:rate|rates|price|prices)\b/i.test(text)
    || /\b(?:service\s+)?rate\s+(?:list|library|reference)\b/i.test(text);
  if (asksForServiceRateReference) {
    return {
      rateLookup: true,
      serviceRateReferenceLookup: true,
      insulationRates: [
        "100C: Rs 4,578.00/m2",
        "200C: Rs 4,881.00/m2",
        "300C: Rs 5,082.00/m2",
        "400C: Rs 5,587.00/m2",
        "500C: Rs 6,118.00/m2",
      ],
    };
  }

  const asksForInsulationRate = /\binsulation\b/i.test(text) && /\b(?:rate|price|unit|cost)\b/i.test(text);
  if (asksForInsulationRate) {
    return {
      rateLookup: true,
      insulationRateLookup: true,
      insulationRates: [
        "100C: Rs 4,578.00/m2",
        "200C: Rs 4,881.00/m2",
        "300C: Rs 5,082.00/m2",
        "400C: Rs 5,587.00/m2",
        "500C: Rs 6,118.00/m2",
      ],
    };
  }

  const asksForPwhtRate = /\bPWHT\b|\bpost[\s-]*weld\s+heat\s+treat/i.test(text);
  if (asksForPwhtRate && /\b(?:rate|price|unit|cost)\b/i.test(text)) {
    return { rateLookup: true, pwhtRateLookup: true };
  }

  const asksForValveServiceRate = /\bvalve\b/i.test(text)
    && /\b(?:service|installation|rate|price|unit|cost)\b/i.test(text);
  if (asksForValveServiceRate) {
    return { rateLookup: true, valveServiceRateLookup: true };
  }

  const asksForReworkRate = /\b(?:rework|modification)\b/i.test(text)
    && /\b(?:rate|price|unit|cost|allowance)\b/i.test(text);
  if (asksForReworkRate) {
    return { rateLookup: true, reworkRateLookup: true };
  }

  // Civil support is a size-and-scope rate curve. Accept any natural wording
  // that includes both terms, such as "rate for civil support".
  const asksForCivilSupportRate = /\bcivil\b/i.test(text) && /\bsupport\b/i.test(text);
  if (asksForCivilSupportRate) {
    const civilScope = getCivilSupportScope();
    const size = parseBomSize(text);
    const baseRate = Number.isFinite(size) ? calculateCivilSupportCost(size) : NaN;
    return {
      rateLookup: true,
      civilSupportRateLookup: true,
      size,
      baseRate,
      civilScope,
    };
  }

  // A support-rate question does not need an MT unit in the wording. The
  // calculator always reports the approved structural-support rate in Rs/MT.
  const asksForSupportRate = /\b(?:(?:PIPE\s+)?SUPPORTS?|STRUCTURAL\s+SUPPORTS?)\b/i.test(text)
    && /\b(?:rate|rates|price|prices|unit|cost|costs|basis|MT|METRIC\s+TON(?:NE)?|TON(?:NE)?S?)\b/i.test(text);
  if (asksForSupportRate) {
    return {
      rateLookup: true,
      supportRateLookup: true,
      rateRs: pipeSupportRateRsPerMt,
      unit: "MT",
      source: "NRL LPP/WO references 4300080842, 4300083138, 4300083970 and 4300088266",
    };
  }

  // Treat fabrication as the approved butt-welding ID activity. This lets a
  // broad query such as "Fabrication rate for CS" return the CS rate bands
  // without requiring a pipe size.
  const asksForIdRate = /\b(?:ID|INCH[\s-]*DIA|WELD(?:ING)?\s+(?:RATE|RATES|PRICE|COST)|BUTT[\s-]*WELD|FABRICATION(?:\s+(?:RATE|RATES|PRICE|COST))?)\b/i.test(text);
  const asksForImRate = /\b(?:IM|INCH[\s-]*MET(?:RE|ER)|ERECTION(?:\s+(?:RATE|RATES|PRICE|COST))?)\b/i.test(text);
  if (!asksForIdRate && !asksForImRate) return null;

  // ID takes precedence when a user asks for both installation and weld information.
  const activity = asksForIdRate ? "FABRICATION" : "ERECTION";
  const weldType = activity === "FABRICATION" ? "BUTT_WELD" : "NA";
  let materialCategory = "";
  if (/\b(?:CS|CARBON\s+STEEL)\b/i.test(text)) materialCategory = "Carbon Steel";
  else if (/\b(?:SS|STAINLESS(?:\s+STEEL)?)\b/i.test(text)) materialCategory = "Austenitic Stainless Steel";
  else if (/\b(?:AS|ALLOY(?:\s+STEEL)?)\b/i.test(text)) materialCategory = "Low & Int. Alloy Steel for High temp Service";
  else materialCategory = classifyMaterialSpec(getEstimatorQueryMaterial(text)).category;

  const rateLibrary = getServiceRateLibraryForMaterialCategory(materialCategory);
  if (!rateLibrary.library?.rateTable) {
    return {
      error: "Approved service rates are not available for that material category. Select a supported material or enter a full line item for review.",
    };
  }

  const location = elements.serviceLocation?.value || "ABOVE_GROUND";
  const regulatoryClass = elements.serviceRegulatoryClass?.value || "NON_IBR";
  const rows = rateLibrary.library.rateTable
    .filter((row) =>
      (row.location === "ANY" || row.location === location) &&
      row.regulatoryClass === regulatoryClass &&
      row.activity === activity &&
      row.weldType === weldType
    )
    .sort((left, right) =>
      Number(left.npsMinIn) - Number(right.npsMinIn) ||
      Number(left.thicknessMaxInclusiveMm) - Number(right.thicknessMaxInclusiveMm)
    );

  if (!rows.length) {
    return {
      error: `No approved ${activity === "FABRICATION" ? "welding ID" : "erection IM"} rate is available for ${String(location).replace(/_/g, " ")} / ${String(regulatoryClass).replace(/_/g, " ")}.`,
    };
  }

  return {
    rateLookup: true,
    activity,
    unit: activity === "FABRICATION" ? "ID" : "IM",
    materialCategory,
    rateLibrary,
    location,
    regulatoryClass,
    rows,
  };
}

function getEstimatorQueryRawMaterialLookup(query) {
  const text = String(query || "");
  if (!/\braw\s+(?:steel|material|rate)\b/i.test(text)) return null;

  const year = Number(elements.year?.value) || 2026;
  const asksForCatalogue = /\b(?:available|availability|database|all|list|library)\b/i.test(text);
  if (asksForCatalogue) {
    const entries = rawMaterialPriceLibrary.flatMap((group) =>
      (group.children || []).map((item) => {
        const rate = getRawMaterialYearRate(item, year);
        return {
          category: cleanDisplayText(group.basic_mat_of_const),
          grade: getRawMaterialGradeLabel(item),
          standard: cleanDisplayText((item.pipe_mat_std || [])[0] || "Material standard"),
          recommended: rate.recommended,
          low: rate.low,
          high: rate.high,
          factorWrtCs: rate.factorWrtCs,
        };
      })
    ).filter((entry) => Number.isFinite(entry.recommended) && entry.recommended > 0);
    return { rawMaterialCatalogue: true, year, entries };
  }

  const spec = getEstimatorQueryMaterial(text);
  const mapping = getRawMaterialPriceMapping(spec, year);
  if (mapping) return { rawMaterialLookup: true, spec, mapping };

  const fallbackRate = rawSteelByYear[year] || rawSteelByYear[2026];
  return {
    rawMaterialLookup: true,
    spec: "Carbon Steel reference",
    mapping: {
      recommended: fallbackRate,
      range: `${formatCurrency(fallbackRate, 2)} reference`,
      basis: "Carbon Steel raw steel reference",
      groupName: "Carbon Steel",
      gradeLabel: "C",
      standard: "Carbon Steel reference",
      factorWrtCs: 1,
      year,
      note: `Carbon Steel raw-material reference for ${year}.`,
    },
  };
}

function isEstimatorBomTemplateRequest(query) {
  const text = String(query || "");
  return (
    /\b(?:excel\s*)?(?:piping\s*)?bom\s+(?:template|format)\b/i.test(text) ||
    /\b(?:template|format)\b.*\b(?:bom|upload)\b/i.test(text)
  );
}

// The estimator must never treat an unknown material or service as Carbon Steel.
// These checks run before the default pricing fallback used for genuinely generic queries.
function getUnsupportedEstimatorPromptMessage(query) {
  const text = String(query || "");
  const asksForPricing = /\b(?:price|prices|rate|rates|cost|costs|estimate|estimated|calculate|calculation)\b/i.test(text);
  if (!asksForPricing) return "";

  // The rate libraries are maintained only in INR. Catch common currency
  // names, codes, symbols and country references before any INR estimate runs.
  const unsupportedCurrency = /\b(?:usd|us\s*dollars?|dollars?|eur|euros?|gbp|pounds?|aed|dirhams?|sar|riyals?|jpy|yen|yuan|yan|renminbi|cny|krw|won|aud|cad|nzd|chf|francs?|sgd|myr|ringgit|idr|rupiah|thb|baht|zar|rand|rubles?|russia[n]?\s*rubles?|qar|kwd|omr|bhd|japan(?:ese)?\s*(?:currency|yen)?|china(?:\s*(?:currency|yuan))?|usa|united\s*states|uk|united\s*kingdom|europe(?:an)?|australia[n]?|canada|singapore|malaysia|indonesia|thailand|south\s*korea|korea|uae|dubai|saudi(?:\s*arabia)?|qatar|kuwait|oman|bahrain|switzerland|south\s*africa)\b|[$€£¥]/i.test(text);
  if (unsupportedCurrency) {
    return "This estimator provides INR (Rs) estimates only. A foreign-currency request cannot be calculated because no approved exchange-rate basis is included. Please ask in INR, or convert the final INR estimate using your approved project exchange rate.";
  }

  const unsupportedMaterial = [
    { pattern: /\b(?:plastic|pvc|u-?pvc|cpvc)\b/i, label: "Plastic / PVC piping" },
    { pattern: /\b(?:hdpe|ldpe|polyethylene)\b/i, label: "HDPE / polyethylene piping" },
    { pattern: /\b(?:polypropylene|ppr|pp-?r)\b/i, label: "Polypropylene piping" },
    { pattern: /\b(?:frp|grp|gre|pvdf|abs)\b/i, label: "Non-metallic composite piping" },
  ].find((entry) => entry.pattern.test(text));

  if (unsupportedMaterial) {
    return `${unsupportedMaterial.label} is not supported in this estimator. It currently covers mapped metallic piping materials such as Carbon Steel, LTCS, alloy steel, stainless steel, duplex and supported non-ferrous metals. Plastic piping needs its own density, OD/thickness standards, joining method and price library, so no Carbon Steel fallback has been applied.`;
  }

  const unsupportedService = [
    { pattern: /\b(?:freight|transportation\s+freight|delivery\s+charge)\b/i, label: "Freight and delivery" },
    { pattern: /\b(?:gst|tax|taxes|duty)\b/i, label: "Taxes and duties" },
    { pattern: /\b(?:commissioning|start-?up)\b/i, label: "Commissioning" },
    { pattern: /\b(?:scaffold|scaffolding)\b/i, label: "Scaffolding" },
    { pattern: /\b(?:standalone\s+)?(?:ndt|radiography|ultrasonic\s+testing|dye\s+penetrant)\b/i, label: "Standalone NDT / inspection" },
    { pattern: /\b(?:excavation|backfill|concrete\s+foundation)\b/i, label: "Civil excavation or foundation work" },
    { pattern: /\b(?:electrical|instrumentation|fireproofing)\b/i, label: "Electrical, instrumentation or fireproofing work" },
  ].find((entry) => entry.pattern.test(text));

  if (unsupportedService) {
    return `${unsupportedService.label} is not available as a separate service estimate in this version. Available service estimates are pipe and fitting fabrication/erection, flange installation, valve installation, pipe supports, support civil work, painting, insulation, PWHT and rework/modification. No unsupported service rate has been assumed.`;
  }

  return "";
}

function buildEstimatorQueryAnswer(query) {
  const promptText = String(query || "");
  // Methodology questions do not need a pipe size. Resolve them before all
  // pricing and material parsers so they never fall through to a blank result.
  if (/\bpart\s*b\b/i.test(promptText) && /\b(?:service|sor|schedule[\s-]*of[\s-]*rates)\b/i.test(promptText)) {
    return { rateLookup: true, serviceMethodologyLookup: true };
  }
  if (/\bpart\s*a\b/i.test(promptText) && /\b(?:material|component)\b/i.test(promptText)) {
    return { rateLookup: true, materialMethodologyLookup: true };
  }
  if (isEstimatorBomTemplateRequest(promptText)) {
    return { bomTemplate: true };
  }
  const unsupportedPromptMessage = getUnsupportedEstimatorPromptMessage(promptText);
  if (unsupportedPromptMessage) {
    return { error: unsupportedPromptMessage };
  }
  // Prioritize the specific missing-thickness message for prompts such as
  // "48-inch x mm pipe cost" before generic size or schedule validation.
  if (/(?:x|×)\s*mm\b/i.test(promptText)) {
    return {
      error:
        "Wall thickness is missing. Enter a value such as \u201c48-inch x 10 mm pipe cost, including services?\u201d",
    };
  }
  const rateLookup = getEstimatorQueryRateLookup(query);
  if (rateLookup?.supportRateLookup || rateLookup?.civilSupportRateLookup) return rateLookup;
  const rawMaterialLookup = getEstimatorQueryRawMaterialLookup(query);
  if (rawMaterialLookup) return rawMaterialLookup;
  const size = parseBomSize(query);
  if (!Number.isFinite(size) || !odTable[size]) {
    if (rateLookup) return rateLookup;
    return { error: "Add a recognised pipe size, for example: 6 IN STD pipe price for 100 m." };
  }

  const descriptor = getEstimatorQueryComponentDescriptor(query);
  // Do not silently substitute a schedule when the prompt explicitly asks for
  // a thickness but leaves the millimetre value blank, e.g. "48-inch x mm".
  if (/(?:x|×)\s*mm\b/i.test(String(query || ""))) {
    return {
      error:
        "Wall thickness is missing. Enter a value such as \u201c48-inch x 10 mm pipe cost, including services?\u201d",
    };
  }
  const schedule = getEstimatorQuerySchedule(query) || normalizeSchedule(elements.schedule.value || "STD") || "STD";
  const directThickness = String(query || "").match(/\b(\d+(?:\.\d+)?)\s*MM\b/i);
  const thickness = directThickness ? Number(directThickness[1]) : getScheduleThickness(size, schedule);
  if (!Number.isFinite(thickness) || thickness <= 0) {
    return { error: `Select valid schedule from B36.10 or B36.19 for ${formatPipeSize(size)} IN.` };
  }

  const length = getEstimatorQueryLength(query);
  const hasLength = Number.isFinite(length) && length > 0;
  const designTemperatureC = getEstimatorQueryDesignTemperature(query);
  const quantity = getEstimatorQueryQuantity(query);
  const spec = getEstimatorQueryMaterial(query);
  const year = Number(elements.year.value) || 2026;
  const coating = getEstimatorQueryCoating(query);
  const rawMapping = getRawMaterialPriceMapping(spec, year);
  const currentEstimate = getCurrentEstimate();
  const rawSteel = rawMapping?.recommended || currentEstimate.rawSteel;

  if (!descriptor) {
    const estimate = buildEstimate({
      year,
      size,
      thickness,
      length: hasLength ? length : 1,
      spec,
      coating,
      rawOverride: rawSteel,
      rawSteelSource: rawMapping ? "materialLibrary" : currentEstimate.rawSteelSource,
      rawBasisNote: rawMapping?.note || currentEstimate.rawSteelBasis,
      factorOverride: elements.factorOverride.value,
    });
    if (estimate.error) return { error: estimate.error };
    const item = {
      group: "Pipe Group",
      item: "Pipe",
      standardName: "Pipe",
      size: `${formatPipeSize(size)} IN`,
      thickness: directThickness ? `${thickness} mm` : schedule,
      material: spec,
      materialCategory: estimate.materialCategory,
      quantity: String(hasLength ? length : 0),
      uom: "M",
      componentCost: { thickness },
    };
    const materialComparisons = hasExplicitEstimatorQueryMaterial(query)
      ? []
      : getEstimatorQueryMaterialComparisons({
          year,
          size,
          thickness,
          length: hasLength ? length : 1,
          coating,
        });
    return {
      kind: "Pipe",
      estimate,
      service: getEstimatorQueryService(item, hasLength),
      hasLength,
      schedule,
      spec,
      rawMapping,
      designTemperatureC,
      materialComparisons,
      isGenericMaterialQuery: materialComparisons.length > 0,
    };
  }

  const rating = getEstimatorQueryRating(query, schedule);
  const componentCost = buildComponentCostEstimate({
    group: descriptor.group,
    item: descriptor.component,
    standardName: descriptor.component,
    sizeText: `${formatPipeSize(size)} IN`,
    thicknessText: rating,
    materialText: spec,
    quantityText: quantity,
    uomText: descriptor.uom,
    thicknessIsSchedule: true,
  });
  const materialMatch = classifyMaterialSpec(spec);
  const item = {
    group: descriptor.group,
    item: descriptor.component,
    standardName: descriptor.component,
    size: `${formatPipeSize(size)} IN`,
    thickness: rating,
    material: spec,
    materialCategory: materialMatch.category,
    quantity: String(quantity),
    uom: descriptor.uom,
    componentCost,
  };
  return {
    kind: descriptor.component,
    componentCost,
    service: getEstimatorQueryService(item, true),
    quantity,
    schedule: rating,
    spec,
    rawMapping,
  };
}

function isServiceMethodologyPrompt(query) {
  const text = String(query || "");
  return /\bpart\s*b\b/i.test(text)
    && /\b(?:service|sor|schedule[\s-]*of[\s-]*rates)\b/i.test(text);
}

function serviceMethodologyRequestsExample(query) {
  return /\b(?:example|explain|show\s+(?:an?\s+)?example|worked\s+example)\b/i.test(String(query || ""));
}

function materialMethodologyRequestsExample(query) {
  return /\b(?:example|explain|show\s+(?:an?\s+)?example|worked\s+example)\b/i.test(String(query || ""));
}

function renderServiceMethodologyPrompt(target = elements.estimatorQueryResult, showOutputHeading = true, includeExample = false) {
  if (!target) return;
  if (target === elements.estimatorQueryResult) {
    if (elements.estimatorQueryExamples) elements.estimatorQueryExamples.hidden = true;
    target.hidden = false;
  }
  target.innerHTML = `
    ${getEstimatorOutputHeading(showOutputHeading)}
    <div class="ask-result-header">
      <h3>Part B - Service Cost Methodology</h3>
      <span class="ask-result-status">Audit-trail basis</span>
    </div>
    ${makeEstimatorQueryTable(
      ["Service area", "Calculation method / rate basis"],
      [
        ["Rate library", "Carbon Steel uses CS rates, Austenitic Stainless Steel uses SS rates, and Alloy Steel uses AS rates."],
        ["Pipe erection", "Erection quantity = NPS x pipe length in metre x approved Rs/IM rate."],
        ["Pipe welding", "Base joints = ceiling(length / 6 m); estimated joints = ceiling(base joints x 1.60); welding quantity = joints x NPS in ID."],
        ["Fittings and flanges", "Fittings use connection ends for estimated joints; each flange No. equals one estimated joint."],
        ["PWHT", "Applies only where pipe class, material and wall thickness meet NRL PWHT rules; Rs 408.00 to Rs 715.00/ID by material."],
        ["Pipe structural supports", "Pipe kg/m x 0.50 m support height x support count, using suggested spans; structural rate Rs 1,50,000.00/MT."],
        ["Civil pipe support", "300 mm support cost uses the size-based base curve; Inside Unit Battery Limit is 30%, Outside Unit Battery Limit is 100%."],
        ["Painting", "Surface area = pi x OD x length; Rs 1,010.00/m2 default or CUI rate by Design Temperature."],
        ["Insulation", "Surface area = pi x OD x length x provisional P50 Rs/m2 at Design Temperature."],
        ["Valve service", "Calculated valve material weight x BOM quantity x Rs 30.53/kg non-RTJ or Rs 36.64/kg RTJ."],
        ["Rework / modification", "15.00% of total project welding ID using applicable welding-rate basis."],
        ["Review and exclusions", "Unclassified pipe uses CS as visible fallback; unsupported rows remain Review. Materials, commissioning, taxes, escalation and contingency are excluded."],
      ]
    )}
    ${includeExample ? `
      <div class="ask-result-header">
        <h3>Worked example - 6 IN CS pipe, 60 m</h3>
        <span class="ask-result-status">Above Ground / Non-IBR</span>
      </div>
      ${makeEstimatorQueryTable(
        ["Step", "Calculation", "Result"],
        [
          ["Erection quantity", "6 IN x 60 m", "360.00 IM"],
          ["Base joints", "ceiling(60 m / 6 m stock length)", "10 joints"],
          ["Estimated joints", "ceiling(10 x 1.60 planning allowance)", "16 joints"],
          ["Welding quantity", "16 joints x 6 IN", "96.00 ID"],
          ["Erection cost", "360.00 IM x Rs 310.00/IM", "Rs 1,11,600.00"],
          ["Welding cost", "96.00 ID x Rs 860.00/ID", "Rs 82,560.00"],
          ["Direct service cost", "Erection cost + welding cost", "Rs 1,94,160.00"],
        ],
        [2]
      )}
    ` : ""}
    <p class="ask-result-note">${escapeHtml("This is the same Part B methodology shown in Calculation Methodology & Audit Trail and the PDF/Excel reports.")}</p>
  `;
}

function renderEstimatorQueryAnswer(answer, query, target = elements.estimatorQueryResult, showOutputHeading = true) {
  if (!target) return;
  if (target === elements.estimatorQueryResult) {
    if (elements.estimatorQueryExamples) elements.estimatorQueryExamples.hidden = true;
    target.hidden = false;
  }
  if (answer.error) {
    target.innerHTML = `${getEstimatorOutputHeading(showOutputHeading)}<p class="ask-result-error">${escapeHtml(answer.error)}</p>`;
    return;
  }

  if (answer.bomTemplate) {
    target.innerHTML = `
      ${getEstimatorOutputHeading(showOutputHeading)}
      <div class="ask-result-header">
        <h3>Excel BOM template</h3>
        <span class="ask-result-status">Ready to download</span>
      </div>
      ${makeEstimatorQueryTable(
        ["Template contents", "Included"],
        [
          ["Required BOM fields", "Item, Size, Sch/Thk/Rating, Material, Quantity and UOM"],
          ["Sample data", "10 example piping-component rows for quick understanding"],
          ["Use", "Complete the workbook, then upload it through this prompt bar or Upload Excel BOM"],
        ]
      )}
      <a class="template-download ask-template-download" href="Piping%20BOM%20Example%20Template.xlsx" download>
        <span>Download Excel BOM Template</span>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M12 3v12" />
          <path d="m7 10 5 5 5-5" />
          <path d="M5 21h14" />
        </svg>
      </a>
    `;
    return;
  }

  if (answer.rawMaterialCatalogue) {
    const rows = answer.entries.map((entry) => `
      <tr>
        <td>${escapeHtml(`${entry.category} | ${entry.grade}`)}</td>
        <td class="ask-rate-table-number">${formatNumber(entry.recommended, 2)}</td>
        <td class="ask-rate-table-number">${formatNumber(entry.factorWrtCs || 1, 2)}</td>
      </tr>`);
    target.innerHTML = `
      ${getEstimatorOutputHeading(showOutputHeading)}
      <div class="ask-result-header">
        <h3>Available raw material prices</h3>
        <span class="ask-result-status">${answer.entries.length} material families</span>
      </div>
      <div class="ask-rate-table-wrap">
        <table class="ask-rate-table">
          <thead>
            <tr>
              <th>Material family / composition</th>
              <th>Price (Rs/kg)</th>
              <th>CS factor</th>
            </tr>
          </thead>
          <tbody>${rows.join("")}</tbody>
        </table>
      </div>
      <p class="ask-result-note">${escapeHtml(`Year basis: ${answer.year}. Prices are recommended raw-material rates. Ask for SS304 or P11 raw material price per kg to see one material's full range and basis.`)}</p>
    `;
    return;
  }

  if (answer.rawMaterialLookup) {
    const { mapping } = answer;
    target.innerHTML = `
      ${getEstimatorOutputHeading(showOutputHeading)}
      <div class="ask-result-header">
        <h3>${escapeHtml(`${formatCategoryHeading(mapping.groupName)} raw material price`)}</h3>
        <span class="ask-result-status">Reference rate</span>
      </div>
      ${makeEstimatorQueryTable(
        ["Material information", "Value"],
        [
          ["Recommended raw price", `${formatCurrency(mapping.recommended, 2)}/kg`],
          ["Material category", formatCategoryHeading(mapping.groupName)],
          ["Pipe material standard", mapping.standard || answer.spec],
          ["Raw material range", mapping.range || "Reference rate"],
          ["Factor w.r.t. CS", formatNumber(mapping.factorWrtCs || 1, 2)],
          ["Year basis", mapping.year || "Current year"],
        ],
        [1]
      )}
      <p class="ask-result-note">${escapeHtml(mapping.note || `Raw-material basis used for ${answer.spec}.`)}</p>
    `;
    return;
  }

  if (answer.rateLookup) {
    if (answer.pipeWeightMethodLookup) {
      target.innerHTML = `
        ${getEstimatorOutputHeading(showOutputHeading)}
        <div class="ask-result-header">
          <h3>Pipe weight calculation</h3>
          <span class="ask-result-status">ASME nominal basis</span>
        </div>
        ${makeEstimatorQueryTable(
          ["Calculation item", "Formula / definition"],
          [
            ["Pipe mass formula", "W = 0.0246615 x (OD - t) x t"],
            ["W", "Nominal plain-end pipe mass in kg/m"],
            ["OD", "Actual outside diameter in mm, obtained from NPS or DN. Never use nominal size directly."],
            ["t", "Wall thickness in mm, from the selected schedule or entered thickness."],
            ["Total pipe weight", "Total kg = W x pipe length in m"],
            ["Validation", "OD must be greater than 0, t must be greater than 0, and t must be less than OD / 2."],
          ]
        )}
        <p class="ask-result-note">Example: a 6 IN pipe uses OD 168.3 mm, not 6 inches. For a 7.11 mm wall, W = 0.0246615 x (168.3 - 7.11) x 7.11 = 28.26 kg/m.</p>
      `;
      return;
    }
    if (answer.componentMethodLookup) {
      const componentMethods = {
        pipe: {
          title: "Pipes calculation method",
          status: "Weight and factor basis",
          rows: [
            ["Actual OD", "The app converts NPS or DN into actual outside diameter. Nominal size is never used directly as the diameter."],
            ["Pipe mass", "W = 0.0246615 x (OD - t) x t, where W is kg/m and OD and t are in mm."],
            ["Raw material", "The detected ASTM material selects its applicable raw Rs/kg from the year-based material library."],
            ["Finished Rs/kg", "Raw material Rs/kg x pipe estimate factor. The pipe factor changes for coating and can be overridden by the user."],
            ["Normal total", "Pipe kg/m x length in m x finished Rs/kg."],
            ["P90 total", "Normal total x the active P90-to-normal ratio."],
          ],
        },
        fitting: {
          title: "Fittings calculation method",
          status: "Weight and factor basis",
          rows: [
            ["Matching pipe basis", "The selected size and schedule/wall are converted to actual OD and thickness, then pipe kg/m = 0.0246615 x (OD - t) x t."],
            ["90 degree LR elbow", "Developed length = 2.356 x actual OD. Elbow weight = matching-pipe kg/m x developed length. Unit Rs = weight x raw material Rs/kg x size-band elbow factor x material multiplier."],
            ["45 degree elbow", "Uses the matching 90 degree elbow basis. Price = 65% of the 90 degree elbow for NPS 2 to 6 IN, or 60% for NPS 8 to 48 IN."],
            ["Equal tee", "Developed length = 2C + M - 0.5 x OD. Tee weight = matching-pipe kg/m x developed length; the approved size-band Equal Tee factor is then applied."],
            ["Reducing tee", "Uses approved unequal-tee run and branch C/M dimensions. If unavailable, the Equal Tee basis is used as a labelled fallback, not a Review row."],
            ["Other fittings", "Matching-pipe rate x approved fitting factor x applicable pressure and material multipliers x quantity."],
            ["P90", "Normal total x the active P90-to-normal ratio."],
          ],
        },
        flange: {
          title: "Flanges calculation method",
          status: "JSON weight basis",
          rows: [
            ["Flange type", "The item description identifies WN, SO or Blind flange; the relevant small, medium or large size band is selected."],
            ["Theoretical weight", "The approved flange-weight-3-input-model-v2 library supplies the flange weight for the type and size."],
            ["Unit Rs", "Flange weight x material-specific raw Rs/kg x approved P50 base multiplier x applicable pressure/rating multiplier."],
            ["Material", "The ASTM material is classified first, so the matching Carbon Steel, Stainless Steel or Alloy Steel raw-material rate is used."],
            ["Fallback", "When a recognised flange type has no exact library record, the WN flange weight and factor fallback is used and shown in the source note."],
            ["Total and P90", "Normal total = unit Rs x BOM quantity; P90 total = normal total x active P90-to-normal ratio."],
          ],
        },
        valve: {
          title: "Valves calculation method",
          status: "Size and rating basis",
          rows: [
            ["Gate-valve weight", "The app uses the approved gate-valve size-band weight equation and conversion factor for the entered NPS."],
            ["Gate-valve unit Rs", "Calculated valve weight x material-specific raw Rs/kg x the size-band conversion factor x pressure/rating multiplier."],
            ["Other valve types", "The gate-valve 150# basis is adjusted using the approved relative factor for the detected valve type, then the pressure and material multipliers."],
            ["Required inputs", "A recognised valve type, size, rating and material are required. A control valve without a size remains Review for management decision."],
            ["Total and P90", "Normal total = unit Rs x BOM quantity; P90 total = normal total x active P90-to-normal ratio."],
          ],
        },
        bolt: {
          title: "Stud bolts and nuts calculation method",
          status: "Complete-set mass basis",
          rows: [
            ["Readable metric designation", "For M30 x 200, the app extracts 30 mm diameter and 200 mm stud length, then selects the standard coarse thread pitch."],
            ["Stud mass", "Uses the effective thread diameter: d - (0.649519 x pitch), then calculates the fully threaded stud mass at density 7,850 kg/m3."],
            ["Two heavy-hex nuts", "Uses approved ASME B18.2.4.6M heavy-hex dimensions, 0.95 nut correction and two nuts per set."],
            ["Unit Rs", "Complete set mass = stud + two nuts. Unit Rs = set mass x material-specific raw Rs/kg x commercial raw-to-finished factor 2.50."],
            ["Fallback", "Only unreadable or non-metric bolt rows use the existing approved fallback method. Readable metric studs never use nearest-pipe pricing."],
            ["Total and P90", "Normal total = unit Rs x BOM quantity; P90 total = normal total x active P90-to-normal ratio."],
          ],
        },
        gasket: {
          title: "Gaskets calculation method",
          status: "Matching-pipe factor basis",
          rows: [
            ["Matching pipe rate", "The item size and schedule/wall establish the equivalent pipe rate using actual OD, thickness and material raw rate."],
            ["Unit Rs", "Equivalent pipe rate x approved gasket factor x applicable pressure/rating and material multipliers."],
            ["Material", "ASTM material classification selects the appropriate material raw-price mapping where one is available."],
            ["Total and P90", "Normal total = unit Rs x BOM quantity; P90 total = normal total x active P90-to-normal ratio."],
            ["Review rule", "Missing size, rating, material or an approved factor remains Review rather than receiving an invented value."],
          ],
        },
        strainer: {
          title: "Strainers and traps calculation method",
          status: "Matching-pipe factor basis",
          rows: [
            ["Matching pipe rate", "The item size and schedule/wall establish the equivalent pipe rate using actual OD, thickness and material raw rate."],
            ["Unit Rs", "Equivalent pipe rate x approved strainer or trap factor x applicable pressure/rating and material multipliers."],
            ["Material", "ASTM material classification selects the appropriate material raw-price mapping where one is available."],
            ["Total and P90", "Normal total = unit Rs x BOM quantity; P90 total = normal total x active P90-to-normal ratio."],
            ["Review rule", "Missing size, rating, material or an approved factor remains Review rather than receiving an invented value."],
          ],
        },
      };
      const method = componentMethods[answer.componentMethodLookup];
      const showComponentExample = /\b(?:example|worked|sample)\b/i.test(query);
      const componentExamples = {
        pipe: {
          title: "Worked example - 6 IN CS STD pipe, 100 m",
          status: "2026 Carbon Steel basis",
          rows: [
            ["OD and wall", "NPS 6 actual OD 168.3 mm; STD wall 7.11 mm", "168.3 mm / 7.11 mm"],
            ["Pipe mass", "0.0246615 x (168.3 - 7.11) x 7.11", "28.26 kg/m"],
            ["Finished Rs/kg", "Raw Rs 56.50/kg x non-coated normal factor 1.80", "Rs 101.70/kg"],
            ["Pipe rate", "28.26 kg/m x Rs 101.70/kg", "Rs 2,874.41/m"],
            ["Normal total", "100 m x Rs 2,874.41/m", "Rs 2,87,440.62"],
          ],
        },
        fitting: {
          title: "Worked example - 6 IN CS 90 degree LR elbow, STD",
          status: "2026 Carbon Steel basis",
          rows: [
            ["Developed length", "2.356 x actual OD 168.3 mm", "0.397 m"],
            ["Elbow weight", "28.26 kg/m matching-pipe mass x 0.397 m", "11.21 kg per elbow"],
            ["Elbow factor", "Approved 90 degree elbow factor for NPS above 4 to 20 IN", "2.50"],
            ["Normal unit price", "11.21 kg x Rs 56.50/kg x 2.50 x CS multiplier 1.00", "Rs 1,582.98 per No."],
            ["P90 unit price", "Normal unit price x active P90-to-normal ratio 1.50", "Rs 2,374.47 per No."],
          ],
        },
        flange: {
          title: "Worked example - 6 IN CS WN flange, 150#",
          status: "JSON flange-weight basis",
          rows: [
            ["Flange weight", "Approved WN flange library weight", "10.60 kg per No."],
            ["Raw material", "2026 Carbon Steel raw material rate", "Rs 56.50/kg"],
            ["WN multiplier", "Approved WN flange multiplier for this basis", "3.70"],
            ["Normal unit price", "10.60 kg x Rs 56.50/kg x 3.70", "Rs 2,215.93 per No."],
            ["P90 unit price", "Normal unit price x active P90-to-normal ratio 1.50", "Rs 3,323.90 per No."],
          ],
        },
        valve: {
          title: "Worked example - 6 IN CS gate valve, 150#",
          status: "Gate-valve weight basis",
          rows: [
            ["Weight basis", "2.00 x NPS squared = 2.00 x 6 squared", "72.00 kg"],
            ["Raw material", "2026 Carbon Steel raw material rate", "Rs 56.50/kg"],
            ["Conversion factor", "Approved gate-valve factor for NPS 6 to 12 IN", "3.70"],
            ["Normal unit price", "72.00 kg x Rs 56.50/kg x 3.70", "Rs 15,058.80 per No."],
            ["P90 unit price", "Normal unit price x active P90-to-normal ratio 1.50", "Rs 22,588.20 per No."],
          ],
        },
        bolt: {
          title: "Worked example - M30 x 200 stud with two heavy-hex nuts",
          status: "Complete-set mass basis",
          rows: [
            ["Complete set mass", "Calculated fully threaded stud plus two heavy-hex nuts", "1.66 kg per set"],
            ["Raw material", "Material-specific raw rate is selected from ASTM A193 B7 / A194 2H mapping", "Applicable alloy-steel rate"],
            ["Commercial factor", "Approved raw-to-finished factor", "2.50"],
            ["Calculation", "Set mass x material-specific raw Rs/kg x 2.50", "Normal unit Rs"],
            ["P90 unit price", "Normal unit price x active P90-to-normal ratio", "P90 unit Rs"],
          ],
        },
        gasket: {
          title: "Worked example - 6 IN gasket, 150#",
          status: "Matching-pipe factor basis",
          rows: [
            ["Matching pipe rate", "6 IN CS STD pipe normal rate", "Rs 2,874.41/m"],
            ["Gasket factor", "Approved gasket component factor", "0.06"],
            ["Pressure and material multipliers", "150# x Carbon Steel", "1.00 x 1.00"],
            ["Normal unit price", "Rs 2,874.41/m x 0.06 x 1.00 x 1.00", "Rs 172.46 per No."],
            ["P90 unit price", "Normal unit price x active P90-to-normal ratio 1.50", "Rs 258.70 per No."],
          ],
        },
        strainer: {
          title: "Worked example - 6 IN CS strainer, 150#, STD",
          status: "Generic strainer factor",
          rows: [
            ["Matching pipe", "6 IN STD Carbon Steel pipe: 28.26 kg/m x Rs 101.70/kg", "Rs 2,874.41/m"],
            ["Strainer factor", "Approved generic strainer factor", "1.50"],
            ["Pressure and material multipliers", "150# x Carbon Steel", "1.00 x 1.00"],
            ["Normal unit price", "Rs 2,874.41/m x 1.50 x 1.00 x 1.00", "Rs 4,311.62 per No."],
            ["P90 unit price", "Normal unit price x active P90-to-normal ratio 1.50", "Rs 6,467.43 per No."],
          ],
        },
      };
      const example = componentExamples[answer.componentMethodLookup];
      target.innerHTML = `
        ${getEstimatorOutputHeading(showOutputHeading)}
        <div class="ask-result-header">
          <h3>${method.title}</h3>
          <span class="ask-result-status">${method.status}</span>
        </div>
        ${makeEstimatorQueryTable(["Calculation item", "Method / basis"], method.rows)}
        ${showComponentExample && example ? `
          <div class="ask-result-header">
            <h3>${example.title}</h3>
            <span class="ask-result-status">${example.status}</span>
          </div>
          ${makeEstimatorQueryTable(["Calculation item", "Calculation", "Result"], example.rows, [2])}
          ${answer.componentMethodLookup === "strainer" ? `<p class="ask-result-note">The factor is a generic strainer factor. A specific temporary or permanent strainer can use its dedicated approved factor when the BOM description identifies it.</p>` : ""}
        ` : ""}
        <p class="ask-result-note">This answer describes the same approved calculation basis used in Piping Component Cost Review, the PDF report and the editable Excel report. Supplier quotation remains the final commercial validation.</p>
      `;
      return;
    }
    if (answer.materialMethodologyLookup) {
      target.innerHTML = `
        ${getEstimatorOutputHeading(showOutputHeading)}
        <div class="ask-result-header">
          <h3>Part A - Material Cost Methodology</h3>
          <span class="ask-result-status">Audit-trail basis</span>
        </div>
        ${makeEstimatorQueryTable(
          ["Calculation area", "Method / basis"],
          [
            ["Pipe pricing", "Pipe kg/m = 0.0246615 x (OD - t) x t; total = kg/m x length"],
            ["Raw material and P90", "Material-library raw Rs/kg x factor; P90 uses the active P90-to-normal ratio"],
            ["90 degree LR elbows", "2.356 x OD developed length x pipe kg/m x size-band factor"],
            ["45 degree elbows", "50% physical weight; 65% of 90 degree price for 2-6 IN, 60% for 8-48 IN"],
            ["Equal and reducing tees", "2C + M - 0.5 x OD; PO-derived tee factor; reducing tee uses run/branch dimensions or Equal Tee fallback"],
            ["Flanges", "JSON flange weight x material Rs/kg x P50 base multiplier x quantity"],
            ["Valves", "Gate-valve size-band weight basis; other valve types use approved relative factors"],
            ["Stud and two nuts", "Calculated complete-set mass x material Rs/kg x commercial factor 2.50"],
            ["Other components", "Approved matching-pipe and component-factor method x BOM quantity"],
            ["Material classification", "ASTM material specification library determines category and material raw-price mapping"],
            ["Coating", "Pipe-only factor: No 1.80 normal / 2.70 P90; Yes 2.30 normal / 3.80 P90"],
            ["Commercial exclusions", "Taxes, freight, escalation, contingency, packing, wastage and contractor margin"],
          ]
        )}
        ${materialMethodologyRequestsExample(query) ? `
          <div class="ask-result-header">
            <h3>Worked examples for all Part A calculation areas</h3>
            <span class="ask-result-status">2026 Carbon Steel basis</span>
          </div>
          ${makeEstimatorQueryTable(
            ["Example", "Calculation", "Result"],
            [
              ["6 IN CS pipe, 7.11 mm wall", "W = 0.0246615 x (168.3 - 7.11) x 7.11", "28.26 kg/m"],
              ["Pipe material rate", "Rs 56.50/kg raw material x 1.80 normal pipe factor", "Rs 101.70/kg"],
              ["Pipe rate per metre", "28.26 kg/m x Rs 101.70/kg", "Rs 2,874.41/m"],
              ["100 m pipe quantity", "28.26 kg/m x 100 m", "2,826.00 kg"],
              ["6 IN 90 degree LR elbow, STD", "Developed length = 2.356 x 168.3 mm = 0.3965 m; 28.26 kg/m x 0.3965 m", "11.21 kg per elbow"],
              ["Elbow material rate", "11.21 kg x Rs 56.50/kg x 2.50 elbow factor", "Rs 1,582.98 per No."],
              ["6 IN 45 degree elbow", "Matching 90 degree elbow price x 65% for NPS 2 to 6 IN", "Rs 1,028.94 per No."],
              ["6 IN Equal Tee", "2C + M - 0.5 x OD; pipe kg/m x tee developed length x 3.86 tee factor", "PO-derived Equal Tee basis"],
              ["Reducing Tee", "Approved unequal-tee run and branch C/M dimensions; use run-size Equal Tee factor", "Equal Tee fallback is labelled when used"],
              ["6 IN WN flange, 150#, CS", "10.60 kg JSON weight x Rs 56.50/kg x 3.70 WN multiplier", "Rs 2,215.93 per No."],
              ["6 IN gate valve, 150#, CS", "2.00 x 6 squared = 72.00 kg; 72.00 kg x Rs 56.50/kg x 3.70", "Rs 15,058.80 per No."],
              ["M30 x 200 stud and two nuts", "1.66 kg/set x Rs 56.50/kg x 2.50 commercial factor", "Rs 234.88 per set"],
              ["Other fittings, gaskets and strainers", "Matching-pipe rate x approved component factor x quantity", "Approved group pricing basis"],
              ["Material classification", "ASTM A106 Gr.B is Carbon Steel; ASTM A335 Gr.P5 is Low and Intermediate Alloy Steel", "Raw material follows detected category"],
              ["Pipe coating", "Non-coated factor 1.80 normal / 2.70 P90; coated factor 2.30 normal / 3.80 P90", "Applies to pipes only"],
              ["Commercial exclusions", "Taxes, freight, escalation, contingency, packing, wastage and contractor margin", "Excluded unless separately stated"],
            ],
            [2]
          )}
        ` : ""}
        <p class="ask-result-note">${escapeHtml("Rows with missing size, rating, material or approved factor remain Review. This is the same Part A methodology shown in Calculation Methodology & Audit Trail and the PDF/Excel reports.")}</p>
      `;
      return;
    }
    if (answer.serviceMethodologyLookup) {
      renderServiceMethodologyPrompt(target, showOutputHeading, serviceMethodologyRequestsExample(query));
      return;
    }
    if (answer.serviceRateReferenceLookup) {
      target.innerHTML = `
        ${getEstimatorOutputHeading(showOutputHeading)}
        <div class="ask-result-header">
          <h3>Service unit-rate reference</h3>
          <span class="ask-result-status">Current approved basis</span>
        </div>
        ${makeEstimatorQueryTable(
          ["Service item", "Rate / basis"],
          [
            ["Pipe erection and welding", "Ask material, size and wall thickness for IM and ID rate"],
            ["Valve installation", "Rs 30.53/kg non-RTJ | Rs 36.64/kg RTJ"],
            ["Pipe structural supports", "Rs 1,50,000.00/MT"],
            ["Civil pipe support", "Rs 6,000.00 to Rs 26,000.00/No."],
            ["Pipe painting", "Rs 1,010.00/m2 default | Rs 885.00 to Rs 2,220.00/m2 CUI"],
            ["Pipe insulation", answer.insulationRates.join(" | ")],
            ["PWHT", "Rs 408.00 to Rs 715.00/ID by material category"],
            ["Rework / modification", "15.00% of total project welding ID"],
          ]
        )}
        <p class="ask-result-note">${escapeHtml("Pipe, fitting and flange erection/welding rates are selected from the approved CS, SS or alloy-steel service library using material, size, wall thickness, location and IBR status. Ask a specific question such as: 6 IN STD CS pipe erection and welding rate.")}</p>
      `;
      return;
    }
    if (answer.insulationRateLookup) {
      target.innerHTML = `
        ${getEstimatorOutputHeading(showOutputHeading)}
        <div class="ask-result-header">
          <h3>Pipe insulation unit price</h3>
          <span class="ask-result-status">Provisional P50 rate basis</span>
        </div>
        ${makeEstimatorQueryTable(
          ["Design temperature", "Provisional P50 rate"],
          answer.insulationRates.map((rate) => [rate.replace(/\s*\|.*$/, ""), rate.replace(/^.*\|\s*/, "")]),
          [1]
        )}
        <p class="ask-result-note">${escapeHtml("Insulation cost uses outside pipe surface area: pi x OD (m) x length (m). A Design Temperature from 100C to 500C is required for the BOM estimate.")}</p>
      `;
      return;
    }
    if (answer.pwhtRateLookup) {
      target.innerHTML = `
        ${getEstimatorOutputHeading(showOutputHeading)}
        <div class="ask-result-header">
          <h3>PWHT unit price</h3>
          <span class="ask-result-status">Rate per inch-diameter joint</span>
        </div>
        ${makeEstimatorQueryTable(
          ["Material category", "Rate (Rs/ID)"],
          [["Carbon steel / LTCS", "408.00"], ["P11 / P12 / P22 and austenitic SS", "559.00"], ["P5 / P9", "613.00"], ["P91 / P92", "715.00"]],
          [1]
        )}
        <p class="ask-result-note">${escapeHtml("PWHT is applied only when the BOM pipe class, material and wall thickness meet the NRL PWHT rules. The selected rate is multiplied by eligible weld inch-diameter quantity.")}</p>
      `;
      return;
    }
    if (answer.valveServiceRateLookup) {
      target.innerHTML = `
        ${getEstimatorOutputHeading(showOutputHeading)}
        <div class="ask-result-header">
          <h3>Valve service unit price</h3>
          <span class="ask-result-status">IOCL-ME-SOR basis</span>
        </div>
        ${makeEstimatorQueryTable("Valve type,Rate (Rs/kg)".split(","), [["Valve other than RTJ", "30.53"], ["RTJ valve", "36.64"]], [1])}
        <p class="ask-result-note">${escapeHtml("Valve service cost is calculated from the valve weight already derived for the BOM, multiplied by the applicable per-kg service rate.")}</p>
      `;
      return;
    }
    if (answer.reworkRateLookup) {
      target.innerHTML = `
        ${getEstimatorOutputHeading(showOutputHeading)}
        <div class="ask-result-header">
          <h3>Rework / modification allowance</h3>
          <span class="ask-result-status">Planning basis</span>
        </div>
        ${makeEstimatorQueryTable(["Calculation item", "Basis"], [["Allowance", "15.00% of total project welding ID"], ["Rate basis", "Applicable welding rate by material, size and thickness"]])}
        <p class="ask-result-note">${escapeHtml("The app calculates this allowance from total project welding inch-diameter, then applies the weighted welding-rate basis from the priced service rows.")}</p>
      `;
      return;
    }
    if (answer.paintingRateLookup) {
      target.innerHTML = `
        ${getEstimatorOutputHeading(showOutputHeading)}
        <div class="ask-result-header">
          <h3>Pipe painting unit price</h3>
          <span class="ask-result-status">P50 rate basis</span>
        </div>
        ${makeEstimatorQueryTable(
          ["Painting condition", "Rate / basis"],
          [["Uninsulated piping | 65C default", `${formatCurrency(answer.uninsulatedRate.rateRsPerM2, 2)}/m2`], ["Painting under insulation | 65C to 200C", `${formatCurrency(answer.cuiLowTemperatureRate.rateRsPerM2, 2)}/m2`], ["Painting under insulation | 300C to 500C", `${formatCurrency(answer.cuiHighTemperatureRate.rateRsPerM2, 2)}/m2`], ["200C to 300C", "Linear interpolation"]]
        )}
        <p class="ask-result-note">${escapeHtml(`Uninsulated CS/LTCS/alloy piping uses the ${formatCurrency(answer.uninsulatedRate.rateRsPerM2, 2)}/m2 65C default. When a Design Temperature is entered, the calculator uses the painting-under-insulation CUI rates. Painting surface area is calculated separately as pi x OD x length.`)}</p>
      `;
      return;
    }
    if (answer.civilSupportRateLookup) {
      const scope = answer.civilScope;
      const referenceRows = Number.isFinite(answer.size)
        ? [
            ["Civil base rate per support", formatCurrency(answer.baseRate, 2)],
            ["App scope adjustment", `${scope.label} (${formatNumber(scope.factor * 100, 0)}%)`],
            ["Applicable size", `${formatPipeSize(answer.size)} IN`],
          ]
        : [
            ["3 IN base reference", formatCurrency(6000, 2)],
            ["20 IN base reference", formatCurrency(17000, 2)],
            ["48 IN base reference", formatCurrency(26000, 2)],
          ];
      target.innerHTML = `
        ${getEstimatorOutputHeading(showOutputHeading)}
        <div class="ask-result-header">
          <h3>Civil works for pipe supports</h3>
          <span class="ask-result-status">Approved basis</span>
        </div>
        ${makeEstimatorQueryTable(
          ["Civil support item", "Value"],
          [["Current app scope", `${scope.label} (${formatNumber(scope.factor * 100, 0)}%)`], ...referenceRows],
          [1]
        )}
        <p class="ask-result-note">${escapeHtml(`Rate is per individual 300 mm above-ground pipe support. The displayed rates are the full base curve: Rs 6,000 at 3 IN, Rs 17,000 at 20 IN and Rs 26,000 at 48 IN. Intermediate sizes are linearly interpolated and rounded upward to the next Rs 500. The app's ${formatNumber(scope.factor * 100, 0)}% scope setting is used separately only when calculating the uploaded BOM total. ${Number.isFinite(answer.size) ? "The displayed amount is the full base rate for the requested size." : "Ask with a size, for example: 6 IN civil support rate, for the exact base rate."}`)}</p>
      `;
      return;
    }
    if (answer.supportRateLookup) {
      target.innerHTML = `
        ${getEstimatorOutputHeading(showOutputHeading)}
        <div class="ask-result-header">
          <h3>Pipe structural support work rate</h3>
          <span class="ask-result-status">Approved basis</span>
        </div>
        ${makeEstimatorQueryTable(
          ["Structural support item", "Value"],
          [["Rate", `${formatCurrency(answer.rateRs, 2)}/${answer.unit}`], ["Measurement basis", "Net fabricated structural steel weight"], ["Support height basis", `${formatNumber(pipeSupportHeightM, 2)} m per support`]],
          [1]
        )}
        <p class="ask-result-note">${escapeHtml(`Scope includes contractor-supplied structural steel, fabrication, welding, surface preparation, primer/painting, transportation, erection, bolting and alignment. Source: ${answer.source}.`)}</p>
      `;
      return;
    }
    const basis = `${String(answer.location).replace(/_/g, " ")} / ${String(answer.regulatoryClass).replace(/_/g, " ")}`;
    const rows = answer.rows.map((row) => {
      const sizeRange = `${formatPipeSize(row.npsMinIn)}-${formatPipeSize(row.npsMaxIn)} IN`;
      const thicknessRange = `>${formatNumber(row.thicknessMinExclusiveMm, 2)} to ${formatNumber(row.thicknessMaxInclusiveMm, 2)} mm`;
      return [sizeRange, thicknessRange, `${formatCurrency(row.rateRs, 2)}/${row.unit}`];
    });
    const activityLabel = answer.activity === "FABRICATION" ? "Butt-weld rate lookup" : "Erection rate lookup";
    const uniqueSources = [...new Set(answer.rows.map((row) => row.source).filter(Boolean))].join(", ");
    target.innerHTML = `
      ${getEstimatorOutputHeading(showOutputHeading)}
      <div class="ask-result-header">
        <h3>${escapeHtml(`${formatCategoryHeading(answer.materialCategory)} ${activityLabel}`)}</h3>
        <span class="ask-result-status">Approved rate bands</span>
      </div>
      ${makeEstimatorQueryTable(["Size range", "Wall thickness", "Rate"], rows, [2])}
      <p class="ask-result-note">${escapeHtml(`Service basis: ${basis} | Material: ${formatCategoryHeading(answer.materialCategory)} | Unit: ${answer.unit} = inch-diameter. Select a pipe size and thickness to calculate an actual service cost. Source: ${uniqueSources || "approved service rate library"}.`)}</p>
    `;
    return;
  }

  const isPipe = answer.kind === "Pipe";
  const materialReady = isPipe
    ? true
    : hasComponentUnitPrice(answer.componentCost) && hasComponentTotals(answer.componentCost);
  const service = answer.service || {};
  const serviceReady = service.status === "READY" || service.status === "RATE_ONLY";
  const title = isPipe
    ? `${formatPipeSize(answer.estimate.size)} IN ${answer.schedule} pipe estimate`
    : `${formatPipeSize(answer.componentCost.size)} IN ${answer.kind} estimate`;

  if (isPipe) {
    target.innerHTML = renderEstimatorPipeSummary(answer, query, showOutputHeading);
    return;
  }

  const isWeightOnlyQuery =
    /\bweight\b/i.test(query) && !/\b(?:price|cost|rate|estimate)\b/i.test(query);
  if (isWeightOnlyQuery) {
    const componentWeight = Number.isFinite(answer.componentCost?.teeWeightKg)
      ? answer.componentCost.teeWeightKg
      : Number.isFinite(answer.componentCost?.unequalTeeWeightKg)
      ? answer.componentCost.unequalTeeWeightKg
      : Number.isFinite(answer.componentCost?.elbowWeightKg)
      ? answer.componentCost.elbowWeightKg
      : Number.isFinite(answer.componentCost?.flangeWeightKg)
      ? answer.componentCost.flangeWeightKg
      : Number.isFinite(answer.componentCost?.setMassKg)
      ? answer.componentCost.setMassKg
      : Number.isFinite(answer.componentCost?.valveWeightBasis)
      ? answer.componentCost.valveWeightBasis
      : NaN;
    const quantityForWeight = Number.isFinite(answer.componentCost?.quantity)
      ? answer.componentCost.quantity
      : 1;
    if (Number.isFinite(componentWeight)) {
      const weightLabel = Number.isFinite(answer.componentCost?.teeWeightKg)
        ? "Equal tee weight"
        : Number.isFinite(answer.componentCost?.unequalTeeWeightKg)
        ? "Reducing tee weight"
        : Number.isFinite(answer.componentCost?.elbowWeightKg)
        ? "Elbow weight"
        : Number.isFinite(answer.componentCost?.flangeWeightKg)
        ? "Flange weight"
        : Number.isFinite(answer.componentCost?.setMassKg)
        ? "Complete stud set weight"
        : "Valve weight";
      const unitLabel = weightLabel === "Valve weight" ? "kg/No." : "kg/No.";
      const explicitPressureClass = /\b(?:150|300|600|900|1500|2500|3000|6000)\s*#/i.test(query);
      const ratingRows = /valve/i.test(answer.kind)
        ? [[
            "Rating / pressure class",
            `${answer.componentCost?.pressureClass ? `${answer.componentCost.pressureClass}#` : "150#"} ${explicitPressureClass ? "(user supplied)" : "(assumed default; not stated)"}`
          ]]
        : [];
      target.innerHTML = `
        ${getEstimatorOutputHeading(showOutputHeading)}
        <div class="ask-result-header">
          <h3>${escapeHtml(title.replace(/ estimate$/i, " weight"))}</h3>
          <span class="ask-result-status">Ready</span>
        </div>
        ${makeEstimatorQueryTable(
          ["Weight calculation", "Value"],
          [
            ["Material category", formatCategoryHeading(classifyMaterialSpec(answer.spec).category)],
            ...ratingRows,
            ["Quantity", `${formatNumber(quantityForWeight, 0)} No.`],
            ["Weight per item", `${formatNumber(componentWeight, 2)} ${unitLabel}`],
            ["Total weight", `${formatNumber(componentWeight * quantityForWeight, 2)} kg`],
          ],
          [1]
        )}
        <p class="ask-result-note">${escapeHtml(`${answer.componentCost.note || "Weight calculated using the approved component weight basis."} ${/valve/i.test(answer.kind) && !explicitPressureClass ? "The valve weight uses the 150# equivalent pressure multiplier of 1.00 because no rating was stated." : ""} Price and service rates are excluded because this is a weight-only request.`)}</p>
      `;
      return;
    }
  }

  const componentWeightRows = [];
  if (Number.isFinite(answer.componentCost?.teeCentreRunMm)) {
    componentWeightRows.push(
      ["Tee C dimension", `${formatNumber(answer.componentCost.teeCentreRunMm, 1)} mm`],
      ["Tee M dimension", `${formatNumber(answer.componentCost.teeCentreBranchMm, 1)} mm`]
    );
  }
  if (Number.isFinite(answer.componentCost?.teeDevelopedLengthM)) {
    componentWeightRows.push([
      "Tee developed length",
      `${formatNumber(answer.componentCost.teeDevelopedLengthM, 3)} m`
    ]);
  }
  if (Number.isFinite(answer.componentCost?.teeWeightKg)) {
    componentWeightRows.push([
      "Equal tee weight",
      `${formatNumber(answer.componentCost.teeWeightKg, 2)} kg/No.`
    ]);
  }
  const summaryRows = [
    ["Material category", formatCategoryHeading(classifyMaterialSpec(answer.spec).category)],
    ["Raw material", Number.isFinite(answer.componentCost.rawSteel) ? `${formatCurrency(answer.componentCost.rawSteel, 2)}/kg` : "Review"],
    ["Factor used", Number.isFinite(answer.componentCost.factor) ? formatNumber(answer.componentCost.factor, 2) : "Review"],
    ...componentWeightRows,
    ["Unit material", materialReady ? formatCurrency(answer.componentCost.medianUnitRate, 2) : "Review"],
    ...(isWeightOnlyQuery
      ? []
      : [["Normal material total", materialReady ? formatCurrency(answer.componentCost.medianTotal, 2) : "Review"]]),
    ["P90 material total", materialReady ? formatCurrency(answer.componentCost.p90Total, 2) : "Review"],
    ["Erection rate", Number.isFinite(service.erectionRate) ? `${formatCurrency(service.erectionRate, 2)}/IM` : "Not applicable / review"],
    ["Welding rate", Number.isFinite(service.weldingRate) ? `${formatCurrency(service.weldingRate, 2)}/ID` : service.rateLabel || "Not applicable / review"],
    ["Direct service", Number.isFinite(service.directServiceCost) ? formatCurrency(service.directServiceCost, 2) : answer.hasLength ? "Review" : "Enter pipe length"],
  ];

  const status = materialReady && serviceReady ? "Ready" : materialReady ? "Material ready" : "Review required";
  const comparisonNote = answer.isGenericMaterialQuery
    ? `Generic material comparison: main cards use ${answer.spec}; comparison cards use Austenitic Stainless Steel ASTM A312 TP304L and Alloy Steel ASTM A335 Gr.P11 with their own raw-material, erection IM and welding ID references.`
    : `Material: ${answer.spec}`;
  const noteParts = [
    `Query: ${query}`,
    comparisonNote,
    answer.rawMapping?.note || "Current calculator material basis used.",
    service.source || service.reason || "No service rate calculated.",
  ];
  if (isPipe && answer.hasLength && Number.isFinite(service.erectionQuantity)) {
    noteParts.push(`Service quantities: ${formatNumber(service.erectionQuantity, 2)} IM and ${formatNumber(service.weldingQuantity, 2)} ID, using the 6 m stock x 1.60 planning allowance.`);
  }
  if (!isPipe && answer.componentCost?.note) noteParts.push(answer.componentCost.note);
  const methodologyMarkup = makeEstimatorStepByStepMarkup(answer, query);

  target.innerHTML = `
    ${getEstimatorOutputHeading(showOutputHeading)}
    <div class="ask-result-header">
      <h3>${escapeHtml(title)}</h3>
      <span class="ask-result-status ${status === "Review required" ? "review" : ""}">${escapeHtml(status)}</span>
    </div>
    ${makeEstimatorQueryTable(["Calculation item", "Value"], summaryRows, [1])}
    ${methodologyMarkup}
    <p class="ask-result-note">${escapeHtml(noteParts.join(" | "))}</p>
  `;
}

function getEstimatorPipeServiceRows(answer) {
  const estimate = answer.estimate;
  const service = answer.service || {};
  const hasLength = Boolean(answer.hasLength);
  const lengthM = hasLength ? estimate.totalWeight / estimate.weightKgm : NaN;
  const erectionCost = Number.isFinite(service.erectionRate) && Number.isFinite(service.erectionQuantity)
    ? service.erectionRate * service.erectionQuantity
    : NaN;
  const weldingCost = Number.isFinite(service.weldingRate) && Number.isFinite(service.weldingQuantity)
    ? service.weldingRate * service.weldingQuantity
    : NaN;
  const pendingLength = "Enter pipe length in m";
  const rows = [
    ["Pipe erection", Number.isFinite(service.erectionRate) ? `${formatCurrency(service.erectionRate, 2)}/IM` : "Review", Number.isFinite(erectionCost) ? formatCurrency(erectionCost, 2) : pendingLength],
    ["Pipe butt welding", Number.isFinite(service.weldingRate) ? `${formatCurrency(service.weldingRate, 2)}/ID` : "Review", Number.isFinite(weldingCost) ? formatCurrency(weldingCost, 2) : pendingLength],
    ["Pipe erection + welding", service.source || "Approved service-rate library", Number.isFinite(service.directServiceCost) ? formatCurrency(service.directServiceCost, 2) : pendingLength],
  ];

  const surfaceAreaM2 = hasLength ? Math.PI * (odTable[estimate.size] / 1000) * lengthM : NaN;
  const projectTemperature = String(elements.designTemperature?.value || "").trim();
  const queryTemperature = Number(answer.designTemperatureC);
  const projectTemperatureC = projectTemperature ? Number(projectTemperature) : NaN;
  const temperatureC = Number.isFinite(queryTemperature) ? queryTemperature : projectTemperatureC;
  const hasTemperature = Number.isFinite(temperatureC);
  const temperatureLabel = hasTemperature ? `${formatNumber(temperatureC, 0)}C` : "65C default";
  const paintRate = getPipePaintingRate(hasTemperature ? temperatureC : 65, hasTemperature ? "UNDER_INSULATION" : "UNINSULATED");
  const canPaint = isPaintableCarbonOrAlloyPipe(estimate.materialCategory);
  rows.push([
    "Pipe painting",
    canPaint && paintRate ? `${formatCurrency(paintRate.rateRsPerM2, 2)}/m2 | ${temperatureLabel} | ${paintRate.method}` : "CS, LTCS and alloy steel basis only",
    canPaint && paintRate && Number.isFinite(surfaceAreaM2) ? formatCurrency(surfaceAreaM2 * paintRate.rateRsPerM2, 2) : pendingLength,
  ]);

  const insulationRate = hasTemperature ? getInsulationP50Rate(temperatureC) : null;
  rows.push([
    "Pipe insulation",
    insulationRate ? `${formatCurrency(insulationRate.rateRsPerM2, 2)}/m2 | ${insulationRate.method}` : "Enter Design Temperature (100C to 500C)",
    insulationRate && Number.isFinite(surfaceAreaM2) ? formatCurrency(surfaceAreaM2 * insulationRate.rateRsPerM2, 2) : insulationRate ? pendingLength : "Temperature required",
  ]);

  let supportCost = NaN;
  let civilCost = NaN;
  let supportBasis = `${formatCurrency(pipeSupportRateRsPerMt, 0)}/MT`;
  if (hasLength && globalThis.PipeSupportStructural) {
    try {
      const support = globalThis.PipeSupportStructural.calculate({
        npsIn: estimate.size,
        odMm: odTable[estimate.size],
        wallThicknessMm: estimate.thickness,
        pipeLengthM: lengthM,
        operatingFluidDensityKgM3: 0,
        insulationWeightKgM: 0,
        otherLineWeightKgM: 0,
        supportHeightM: pipeSupportHeightM,
        serviceType: "ambient_liquid",
        supportType: "rest",
        installationMode: "individual_stanchion",
        routeComplexity: "normal",
        includeEndSupport: true,
        additionalSupportCount: 0,
      });
      supportCost = support.structuralQuantityMT * pipeSupportRateRsPerMt;
      const civilScope = getCivilSupportScope();
      const civilRate = calculateCivilSupportCost(estimate.size) * civilScope.factor;
      civilCost = support.totalSupportCount * civilRate;
      supportBasis = `${formatNumber(support.structuralQuantityMT, 3)} MT | ${formatNumber(support.totalSupportCount, 0)} supports`;
      rows.push(["Pipe structural supports", supportBasis, formatCurrency(supportCost, 2)]);
      rows.push(["Civil works for pipe supports", `${formatCurrency(civilRate, 2)}/support | ${civilScope.label}`, formatCurrency(civilCost, 2)]);
    } catch {
      rows.push(["Pipe structural supports", "Support calculator review", "Review"]);
    }
  } else {
    rows.push(["Pipe structural supports", `${formatCurrency(pipeSupportRateRsPerMt, 0)}/MT`, pendingLength]);
    rows.push(["Civil works for pipe supports", `${formatCurrency(calculateCivilSupportCost(estimate.size), 2)}/support`, pendingLength]);
  }

  const totalService = [service.directServiceCost, surfaceAreaM2 * (canPaint && paintRate ? paintRate.rateRsPerM2 : 0), surfaceAreaM2 * (insulationRate?.rateRsPerM2 || 0), supportCost, civilCost]
    .reduce((total, value) => total + (Number.isFinite(value) ? value : 0), 0);
  if (hasLength) rows.push(["Total shown service scope", "Erection, welding, painting, insulation and supports", formatCurrency(totalService, 2)]);

  return rows;
}

function renderEstimatorPipeSummary(answer, query, showOutputHeading = true) {
  const estimate = answer.estimate;
  const rawMapping = answer.rawMapping || {};
  const sizeIn = Number(estimate.size);
  const materialLabel = formatCategoryHeading(estimate.materialCategory || "Carbon Steel");
  const standardLabel = answer.spec || "ASTM A106 Gr.B";
  const assumptionMaterial = hasExplicitEstimatorQueryMaterial(query) ? materialLabel : "Carbon Steel";
  const rawLow = Number.isFinite(rawMapping.low) ? rawMapping.low : estimate.rawSteel;
  const rawHigh = Number.isFinite(rawMapping.high) ? rawMapping.high : estimate.rawSteel;
  const rawRange = `${formatCurrency(rawLow, 2)}-${formatCurrency(rawHigh, 2)}/kg`;
  const normalPerM = Number(estimate.medianRsM);
  const p90PerM = Number(estimate.p90RsM);
  const sixMetreNormal = normalPerM * 6;
  const twelveMetreNormal = normalPerM * 12;
  const priceRows = [
    ["Per metre", `${formatCurrency(normalPerM, 2)} normal | ${formatCurrency(p90PerM, 2)} P90`],
    [`Recommended estimate at ${formatCurrency(estimate.rawSteel, 2)}/kg`, `${formatCurrency(normalPerM, 2)}/m`],
    ["One 6 m pipe", formatCurrency(sixMetreNormal, 2)],
    ["One 12 m pipe", formatCurrency(twelveMetreNormal, 2)],
  ];
  if (answer.hasLength) {
    priceRows.push(["Requested length", `${formatCurrency(estimate.medianTotal, 2)} normal | ${formatCurrency(estimate.p90Total, 2)} P90`]);
  }
  const serviceRows = getEstimatorPipeServiceRows(answer);

  return `
    ${getEstimatorOutputHeading(showOutputHeading)}
    <div class="ask-pipe-assumption">
      Assuming <strong>${escapeHtml(`${assumptionMaterial} pipe`)}</strong>:
    </div>
    ${makeEstimatorQueryTable(
      ["Pipe input / basis", "Value"],
      [
        ["Outside diameter", `${formatNumber(odTable[sizeIn], 1)} mm`],
        ["Wall thickness", `${formatNumber(estimate.thickness, 2)} mm`],
        ["Pipe mass", `${formatNumber(estimate.weightKgm, 2)} kg/m`],
        ["Current indicative raw rate", rawRange],
      ],
      [1]
    )}
    <h3 class="ask-pipe-price-heading">Estimated pipe price</h3>
    ${makeEstimatorQueryTable(["Price basis", "Value"], priceRows, [1])}
    <h3 class="ask-pipe-price-heading">Pipe service scope</h3>
    ${makeEstimatorQueryTable(["Service item", "Rate / basis", "Estimated cost"], serviceRows, [2])}
    <p class="ask-result-note">Material basis: ${escapeHtml(standardLabel)} | ${escapeHtml(rawMapping.note || "Current calculator material basis used.")}</p>
  `;
}

function splitEstimatorQueryItems(query) {
  const fragments = String(query || "")
    .split(/[;,\r\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);

  return fragments.reduce((items, fragment) => {
    // A comma in natural language, such as "pipe cost, including services",
    // must not create a second calculation request.
    const previous = items[items.length - 1] || "";
    const isTemperatureValue = /^\d+(?:\.\d+)?\s*(?:deg(?:ree)?s?\s*)?(?:c|°c)\b/i.test(fragment);
    const isTemperatureLeadIn = /\btemp(?:erature)?\s*[:=]?\s*$/i.test(previous);
    if (isTemperatureValue && isTemperatureLeadIn) {
      items[items.length - 1] = `${previous} ${fragment}`;
    } else if (/^(?:including|with)\s+(?:service|services)\b/i.test(fragment) && items.length) {
      items[items.length - 1] = `${items[items.length - 1]}, ${fragment}`;
    } else {
      items.push(fragment);
    }
    return items;
  }, []);
}

function renderEstimatorMultiItemAnswer(queries, summaryText = "") {
  if (!elements.estimatorQueryResult) return;
  if (elements.estimatorQueryExamples) elements.estimatorQueryExamples.hidden = true;

  const items = queries.map((itemQuery, index) => {
    const itemTarget = document.createElement("div");
    renderEstimatorQueryAnswer(buildEstimatorQueryAnswer(itemQuery), itemQuery, itemTarget, false);
    return `
      <section class="ask-multi-item">
        <div class="ask-multi-item-heading">
          <span>Item ${index + 1}</span>
          <strong>${escapeHtml(itemQuery)}</strong>
        </div>
        ${itemTarget.innerHTML}
      </section>`;
  });

  elements.estimatorQueryResult.hidden = false;
  elements.estimatorQueryResult.innerHTML = `
    ${getEstimatorOutputHeading()}
    <div class="ask-multi-result-summary">${escapeHtml(summaryText || `${queries.length} separate estimates calculated`)}</div>
    <div class="ask-multi-result-list">${items.join("")}</div>
  `;
}

function getImplicitEstimatorMultiItems(query) {
  const text = String(query || "").trim();
  const mentionsPipe = /\bpipe\b/i.test(text);
  const mentionsElbow = /\belbow\b/i.test(text);
  if (!mentionsPipe || !mentionsElbow) return null;

  const pipeQuery = text
    .replace(/\b(?:45|90)\s*(?:deg(?:ree)?|d)?\s*elbow\b/gi, "")
    .replace(/\belbow\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  const elbowQuery = text
    .replace(/\bpipe\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return pipeQuery && elbowQuery ? [pipeQuery, elbowQuery] : null;
}

function handleEstimatorQuery(event) {
  event.preventDefault();
  const query = String(elements.estimatorQueryInput?.value || "").trim();
  if (!query) {
    renderEstimatorQueryAnswer({ error: "Type a request, for example: 6 IN STD pipe price for 100 m." }, "");
    return;
  }
  if (isServiceMethodologyPrompt(query)) {
    renderServiceMethodologyPrompt(elements.estimatorQueryResult, true, serviceMethodologyRequestsExample(query));
    return;
  }
  const queries = splitEstimatorQueryItems(query);
  if (queries.length > 1) {
    renderEstimatorMultiItemAnswer(queries);
    return;
  }
  const inferredQueries = getImplicitEstimatorMultiItems(query);
  if (inferredQueries) {
    renderEstimatorMultiItemAnswer(
      inferredQueries,
      "Two estimates calculated: Pipe and 90 degree elbow"
    );
    return;
  }
  renderEstimatorQueryAnswer(buildEstimatorQueryAnswer(query), query);
}

function getLineItemFactorOverride(item) {
  return String(item.factorBasis || "").startsWith("User-entered")
    ? item.factors?.median
    : "";
}

function refreshLineItemYearPrices() {
  if (!lineItems.length) return;

  const selectedYear = Number(elements.year.value) || 2026;
  const refreshedItems = lineItems.map((item) => {
    const rawMapping =
      item.rawSteelSource === "materialLibrary"
        ? getRawMaterialPriceMapping(item.spec, selectedYear)
        : null;
    const rawOverride =
      item.rawSteelSource === "materialLibrary"
        ? rawMapping?.recommended || item.rawSteel
        : item.rawSteelSource === "bomOverride" || item.rawSteelSource === "manualOverride"
          ? item.rawSteel
          : "";

    const refreshed = buildEstimate({
      year: selectedYear,
      size: item.size,
      thickness: item.thickness,
      length: item.length,
      spec: item.spec,
      coating: item.coating,
      rawOverride,
      rawSteelSource: item.rawSteelSource,
      rawBasisNote:
        item.rawSteelSource === "materialLibrary"
          ? rawMapping?.note || item.rawSteelBasis
          : item.rawSteelBasis,
      factorOverride: getLineItemFactorOverride(item),
    });

    if (refreshed.error) return item;

    return {
      ...refreshed,
      id: item.id,
      source: item.source,
      sourceName: item.sourceName,
      sourceKey: item.sourceKey,
    };
  });

  lineItems.splice(0, lineItems.length, ...refreshedItems);
  renderLineItems();
  updateReportGenerated();
}

function renderCurrentEstimate(estimate) {
  elements.factorSource.textContent = `${estimate.factors.source} / ${estimate.group}`;
  elements.odMm.textContent = `${formatNumber(estimate.od, 1)} mm`;
  elements.weightKgm.textContent = formatNumber(estimate.weightKgm, 2);
  elements.totalWeight.textContent = formatNumber(estimate.totalWeight, 2);
  elements.rawSteel.textContent = formatCurrency(estimate.rawSteel, 2);
  elements.medianFactor.textContent = formatNumber(estimate.factors.median, 2);
  elements.medianRsKg.textContent = formatCurrency(estimate.medianRsKg, 2);
  elements.medianRsM.textContent = formatCurrency(estimate.medianRsM, 2);
  elements.medianTotal.textContent = formatCurrency(estimate.medianTotal, 0);
  elements.p90Factor.textContent = formatNumber(estimate.factors.p90, 2);
  elements.p90RsKg.textContent = formatCurrency(estimate.p90RsKg, 2);
  elements.p90RsM.textContent = formatCurrency(estimate.p90RsM, 2);
  elements.p90Total.textContent = formatCurrency(estimate.p90Total, 0);
  const riskReserve = Math.max(estimate.p90Total - estimate.medianTotal, 0);
  const p90Uplift = estimate.medianTotal > 0
    ? ((estimate.p90Total / estimate.medianTotal) - 1) * 100
    : 0;
  elements.pipeBasisMaterial.textContent = estimate.spec || "Not specified";
  elements.pipeBasisSizeWall.textContent = `${formatPipeSize(estimate.size)} IN / ${formatNumber(estimate.thickness, 2)} mm`;
  elements.pipeBasisCoating.textContent = estimate.coating || "No";
  elements.pipeBasisRaw.textContent = formatCurrency(estimate.rawSteel, 2);
  elements.pipeBasisFactor.textContent = formatNumber(estimate.factors.median, 2);
  elements.pipeBasisFinishedRate.textContent = formatCurrency(estimate.medianRsKg, 2);
  elements.pipeBasisRiskReserve.textContent = formatCurrency(riskReserve, 2);
  elements.pipeBasisP90Uplift.textContent = `${formatNumber(p90Uplift, 2)}%`;
  elements.pipeBasisP90Total.textContent = formatCurrency(estimate.p90Total, 2);
  renderWhatIfAnalysis();
}

function calculate() {
  elements.warning.textContent = "";
  updateOverrideReview();

  if (inputError) {
    elements.warning.textContent = inputError;
    return null;
  }

  if (hasIncompleteNonCarbonSteelSelection()) {
    elements.warning.textContent =
      "Select Pipe Material Standard before estimating non-carbon-steel pipe.";
    return null;
  }

  const estimate = getCurrentEstimate();

  if (estimate.error) {
    elements.warning.textContent = estimate.error;
    return null;
  }

  renderCurrentEstimate(estimate);
  return estimate;
}

function renderLineItems() {
  elements.lineCount.textContent = `${lineItems.length} ${lineItems.length === 1 ? "line" : "lines"}`;
  updateOverrideReview();
  updateSortButtons();

  if (lineItems.length === 0) {
    elements.lineItemsBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="12">No pipe lines added yet.</td>
      </tr>
    `;
    elements.summaryWeight.textContent = "-";
    elements.summaryMedian.textContent = "-";
    elements.summaryP90.textContent = "-";
    renderMaterialCategoryTables([]);
    renderWhatIfAnalysis();
    return;
  }

  applySort();
  updateSortButtons();

  elements.lineItemsBody.innerHTML = lineItems
    .map(
      (item) => `
        <tr>
          <td data-label="Size">${formatPipeSize(item.size)} IN</td>
          <td data-label="Thk mm">${formatNumber(item.thickness, 2)}</td>
          <td class="text-column" data-label="Material">${item.spec}</td>
          <td data-label="Length m">${formatNumber(item.length, 2)}</td>
          <td data-label="Coating">${item.coating}</td>
          <td data-label="Factor">${formatNumber(item.factors.median, 2)} / ${formatNumber(item.factors.p90, 2)}</td>
          <td data-label="Kg/m">${formatNumber(item.weightKgm, 2)}</td>
          <td data-label="Total kg">${formatNumber(item.totalWeight, 2)}</td>
          <td data-label="Rs/m">${formatCurrency(item.medianRsM, 2)}</td>
          <td data-label="Normal total">${formatCurrency(item.medianTotal, 0)}</td>
          <td data-label="P90 total">${formatCurrency(item.p90Total, 0)}</td>
          <td data-label="Action">
            <button class="remove-line" type="button" data-id="${item.id}">Remove</button>
          </td>
        </tr>
      `
    )
    .join("");

  const summary = getSummary(lineItems);

  elements.summaryWeight.textContent = `${formatNumber(summary.weight, 2)} kg`;
  elements.summaryMedian.textContent = formatCurrency(summary.median, 0);
  elements.summaryP90.textContent = formatCurrency(summary.p90, 0);
  renderMaterialCategoryTables(lineItems);
  renderWhatIfAnalysis();
}

function groupItemsByMaterialCategory(items) {
  return items.reduce((groups, item) => {
    const category = item.materialCategory || "Unclassified";
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push(item);
    return groups;
  }, new Map());
}

function formatCategoryHeading(category) {
  const cleanCategory = String(category || "Unclassified").trim() || "Unclassified";
  return cleanCategory.replace(/\s+Pipe$/i, "");
}

function getCategoryHeadingClass(category) {
  const normalizedCategory = String(category || "").toLowerCase();
  if (normalizedCategory.includes("unclassified")) return "category-heading-unclassified";
  if (normalizedCategory.includes("duplex")) return "category-heading-duplex";
  if (normalizedCategory.includes("stainless")) return "category-heading-stainless";
  if (normalizedCategory.includes("non-ferrous") || normalizedCategory.includes("monel") || normalizedCategory.includes("inconel")) {
    return "category-heading-nonferrous";
  }
  if (normalizedCategory.includes("alloy")) return "category-heading-alloy";
  if (normalizedCategory.includes("low temp")) return "category-heading-lowtemp";
  if (normalizedCategory.includes("carbon")) return "category-heading-carbon";
  return "category-heading-default";
}

function renderMaterialCategoryTables(items) {
  if (!elements.categoryTables || !elements.categoryCount) return;

  if (!items.length) {
    elements.categoryCount.textContent = "0 categories";
    if (elements.categoryLineCheck) {
      elements.categoryLineCheck.textContent = "Line check: 0 / 0";
      elements.categoryLineCheck.classList.remove("audit-line-check-warning");
    }
    elements.categoryTables.innerHTML =
      '<p class="empty-note">Upload a BOM or add pipe lines to view category-wise tables.</p>';
    return;
  }

  const groups = Array.from(groupItemsByMaterialCategory(items).entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );
  elements.categoryCount.textContent = `${groups.length} ${
    groups.length === 1 ? "category" : "categories"
  }`;
  if (elements.categoryLineCheck) {
    const categorizedLineCount = groups.reduce((total, [, categoryItems]) => total + categoryItems.length, 0);
    const isMatched = categorizedLineCount === items.length;
    elements.categoryLineCheck.textContent = `Line check: ${categorizedLineCount} / ${items.length}`;
    elements.categoryLineCheck.classList.toggle("audit-line-check-warning", !isMatched);
  }

  const categorySummaryTable = `
    <div class="category-estimate-summary">
      <h4>Pipe Material Category Estimate Summary</h4>
      <p class="category-disclaimer">
        Non-CS material estimates use the same factor-based method and are indicative only.
        Validate SS, alloy, duplex, and non-ferrous rates with supplier quotations.
      </p>
      <div class="table-wrap">
        <table class="category-summary-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Line count</th>
              <th>Total kg</th>
              <th>Normal total</th>
              <th>P90 total</th>
              <th>Raw Rs/kg</th>
              <th>Avg Rs/kg</th>
            </tr>
          </thead>
          <tbody>
            ${groups
              .map(([category, categoryItems]) => {
                const summary = getSummary(categoryItems);
                return `
                  <tr>
                    <td class="text-column" data-label="Category">${escapeHtml(formatCategoryHeading(category))}</td>
                    <td data-label="Line count">${categoryItems.length}</td>
                    <td data-label="Total kg">${formatNumber(summary.weight, 2)}</td>
                    <td data-label="Normal total">${formatCurrency(summary.median, 0)}</td>
                    <td data-label="P90 total">${formatCurrency(summary.p90, 0)}</td>
                    <td data-label="Raw Rs/kg">${formatCurrency(getCategoryAverageRawRsKg(categoryItems), 2)}</td>
                    <td data-label="Avg Rs/kg">${formatCurrency(getCategoryAverageRsKg(summary), 2)}</td>
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;

  const categoryDetailTables = groups
    .map(([category, categoryItems]) => {
      const summary = getSummary(categoryItems);
      return `
        <article class="category-table-card">
          <div class="category-table-title">
            <div>
              <h4 class="${getCategoryHeadingClass(category)}">${escapeHtml(
                formatCategoryHeading(category)
              )}</h4>
              <p>${categoryItems.length} ${
                categoryItems.length === 1 ? "line" : "lines"
              } | ${formatNumber(summary.weight, 2)} kg | <span class="category-summary-rs">${formatCurrency(
                summary.median,
                0
              )}</span> normal total</p>
            </div>
          </div>
          <div class="table-wrap">
            <table class="category-table">
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Thk mm</th>
                  <th class="text-column">BOM Material</th>
                  <th>Length m</th>
                  <th>Total kg</th>
                  <th>Rs/m</th>
                  <th>Normal total</th>
                  <th>P90 total</th>
                </tr>
              </thead>
              <tbody>
                ${categoryItems
                  .map(
                    (item) => `
                      <tr>
                        <td data-label="Size">${formatPipeSize(item.size)} IN</td>
                        <td data-label="Thk mm">${formatNumber(item.thickness, 2)}</td>
                        <td class="text-column" data-label="BOM Material">${escapeHtml(item.spec)}</td>
                        <td data-label="Length m">${formatNumber(item.length, 2)}</td>
                        <td data-label="Total kg">${formatNumber(item.totalWeight, 2)}</td>
                        <td data-label="Rs/m">${formatCurrency(item.medianRsM, 2)}</td>
                        <td data-label="Normal total">${formatCurrency(item.medianTotal, 0)}</td>
                        <td data-label="P90 total">${formatCurrency(item.p90Total, 0)}</td>
                      </tr>
                    `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
          <details class="category-audit-details">
            <summary>Audit matching details</summary>
            <div class="table-wrap">
              <table class="category-audit-table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th class="text-column">BOM Material</th>
                    <th class="text-column">Matched JSON Standard</th>
                    <th>Match ID</th>
                  </tr>
                </thead>
                <tbody>
                  ${categoryItems
                    .map(
                      (item) => `
                        <tr>
                          <td data-label="Size">${formatPipeSize(item.size)} IN</td>
                          <td class="text-column" data-label="BOM Material">${escapeHtml(item.spec)}</td>
                          <td class="text-column" data-label="Matched JSON Standard">${escapeHtml(
                            item.materialMatchedStandard || item.materialMatchNote || "No match"
                          )}</td>
                          <td data-label="Match ID">${escapeHtml(item.materialMatchId || "-")}</td>
                        </tr>
                      `
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
          </details>
        </article>
      `;
    })
    .join("");

  elements.categoryTables.innerHTML = categorySummaryTable + categoryDetailTables;
}

function normalizeBomGroupText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\bw\s+n\b/g, "wn")
    .replace(/\bs\s+w\b/g, "sw")
    .replace(/\s+/g, " ")
    .trim();
}

function isBomNoteLikeItem(itemText) {
  const raw = String(itemText || "").trim();
  const normalized = normalizeBomGroupText(raw);
  if (!normalized) return true;

  const sizeOnlyPattern =
    /^(\d+(?:\.\d+)?|\d+\s+\d+\/\d+|\d+\/\d+)\s*(?:in|inch|mm|nb)?$/i;
  const ratingOnlyPattern = /^\d+\s*(?:#|lb|class)?$/i;
  const boltSizeOnlyPattern = /^m\d+\s*x\s*\d+$/i;
  const notePattern = /\b(as per|refer|provided by|procure with|datasheet|data sheet|note)\b/i;

  return (
    sizeOnlyPattern.test(raw.replace(/["']/g, "")) ||
    ratingOnlyPattern.test(raw) ||
    boltSizeOnlyPattern.test(raw) ||
    notePattern.test(raw)
  );
}

function getComponentAliasMatch(itemText) {
  const normalized = normalizeBomGroupText(itemText);
  if (!normalized) return null;

  return componentAliasMap.find((component) =>
    component.aliases.some((alias) => normalized.includes(normalizeBomGroupText(alias)))
  );
}

function classifyBomGroup(itemText) {
  const normalized = normalizeBomGroupText(itemText);
  if (!normalized) return { group: "Other Group", standardName: "" };
  if (isBomNoteLikeItem(itemText)) return { group: "Other Group", standardName: "" };

  const aliasMatch = getComponentAliasMatch(itemText);
  if (aliasMatch) {
    return { group: aliasMatch.group, standardName: aliasMatch.standardName };
  }

  const group = bomGroupDefinitions.find((definition) =>
    definition.keywords.some((keyword) => normalized.includes(normalizeBomGroupText(keyword)))
  );

  return { group: group ? group.name : "Other Group", standardName: "" };
}

function getElbowAngleFactorMatch(groupName, itemText, standardName = "") {
  if (groupName !== "Fitting Group") return null;
  const text = String(`${standardName} ${itemText}` || "").toUpperCase();
  if (!/\bELBOW\b|\bEL\b/.test(text)) return null;

  const normalized = normalizeBomGroupText(text);
  const compact = text.replace(/[^A-Z0-9]/g, "");
  const is45 =
    /\b45\s*(?:D|DEG|DEGREE|DEGREES)\b/i.test(text) ||
    normalized.includes("45 degree") ||
    normalized.includes("45 deg") ||
    compact.includes("ELBOW45D") ||
    compact.includes("ELBOW45DEG") ||
    compact.includes("EL45D") ||
    compact.includes("EL45DEG");
  const is90 =
    /\b90\s*(?:D|DEG|DEGREE|DEGREES)\b/i.test(text) ||
    normalized.includes("90 degree") ||
    normalized.includes("90 deg") ||
    compact.includes("ELBOW90D") ||
    compact.includes("ELBOW90DEG") ||
    compact.includes("EL90D") ||
    compact.includes("EL90DEG");

  if (is45) {
    return componentFactorMaster.find(
      (entry) => entry.group === "Fitting Group" && entry.component === "45 Degree Elbow"
    );
  }
  if (is90) {
    return componentFactorMaster.find(
      (entry) => entry.group === "Fitting Group" && entry.component === "90 Degree Elbow"
    );
  }

  // A BOM or quick-estimate selection that says only "Elbow" has no angle
  // information. Treat it as a 90 degree elbow by default, rather than using
  // the generic 0.55 component factor. A declared 45 degree elbow still uses
  // its dedicated 45 degree commercial-rate rule above.
  return componentFactorMaster.find(
    (entry) => entry.group === "Fitting Group" && entry.component === "90 Degree Elbow"
  );
}

function getTeeFactorMatch(groupName, itemText, standardName = "") {
  if (groupName !== "Fitting Group") return null;
  const text = String(`${standardName} ${itemText}` || "").toUpperCase();
  const isTee = /\bTEE\b/.test(text) || /\bT\s*\.\s*RED\b/.test(text);
  if (!isTee) return null;

  const isReducing = /\b(?:RED(?:UC(?:ING)?)?|UNEQUAL)\b/.test(text);
  if (isReducing) {
    return componentFactorMaster.find(
      (entry) => entry.group === "Fitting Group" && entry.component === "Reducing Tee"
    );
  }

  // A tee without a reducing/unequal qualifier is an Equal Tee for pricing.
  // This prevents the retired generic 0.55 factor from being used for normal tees.
  return componentFactorMaster.find(
    (entry) => entry.group === "Fitting Group" && entry.component === "Equal Tee"
  );
}

function getComponentFactorMatch(groupName, itemText, standardName = "") {
  const elbowAngleMatch = getElbowAngleFactorMatch(groupName, itemText, standardName);
  if (elbowAngleMatch) return elbowAngleMatch;

  const teeMatch = getTeeFactorMatch(groupName, itemText, standardName);
  if (teeMatch) return teeMatch;

  const normalizedItem = normalizeBomGroupText(`${standardName} ${itemText}`);
  const sameGroupFactors = componentFactorMaster.filter((entry) => entry.group === groupName);

  const exactOrContained = sameGroupFactors
    .map((entry) => ({
      entry,
      normalizedComponent: normalizeBomGroupText(entry.component),
    }))
    .filter(
      (match) =>
        match.normalizedComponent &&
        normalizedItem.includes(match.normalizedComponent)
    )
    .sort((a, b) => b.normalizedComponent.length - a.normalizedComponent.length)[0]?.entry;
  if (exactOrContained) return exactOrContained;

  const genericFallback = genericComponentFallbackFactors[groupName];
  if (genericFallback) {
    return {
      group: groupName,
      ...genericFallback,
      autoCostAllowed: true,
      isGenericFallback: true,
    };
  }

  return {
    group: "Other Group",
    component: "Generic Other P80",
    uom: "NOS",
    factor: 0,
    autoCostAllowed: false,
    confidence: "Low",
    isGenericFallback: true,
  };
}

function parsePressureClass(...values) {
  const text = values.map((value) => String(value || "")).join(" ").toUpperCase();
  const classMatch = text.match(/\b(?:CLASS|CL|#)\s*(150|300|600|800|900|1500|2500|3000|6000)(?=\D|$)/);
  if (classMatch) return classMatch[1];

  const ratingMatch = text.match(/\b(150|300|600|800|900|1500|2500|3000|6000)\s*(?:#|LB|LBS|CLASS|CL|["”])(?=\D|$)/);
  return ratingMatch ? ratingMatch[1] : "";
}

function hasComponentRatingText(value) {
  return /\b\d{2,4}\s*(?:#|LB|LBS|CLASS|CL|["”])(?=\D|$)/i.test(String(value || ""));
}

function getPressureMultiplier(pressureClass, groupName = "") {
  if (groupName === "Flange Group") return flangePressureClassMultipliers[pressureClass] || 1;
  if (groupName === "Valves Group") return valvePressureClassMultipliers[pressureClass] || 1;
  return pressureClassMultipliers[pressureClass] || 1;
}

function getMaterialMultiplier() {
  return 1;
}

function getDefaultComponentSchedule(size, group = "") {
  if (group === "Bolt Group") return "XS";
  if (group === "Flange Group" || group === "Valves Group") return "STD";
  return Number(size) < 2 ? "160" : "STD";
}

function getValveComponentPipeBasis(size) {
  const numericSize = Number(size);

  if (numericSize >= 10 && numericSize <= 48) {
    const thickness = 9.27 + (numericSize - 10) * 1.4;
    return {
      thickness,
      label: `Formula thickness ${formatNumber(thickness, 2)} mm = 9.27 + (NPS - 10) x 1.40 for 10-48 IN valve`,
    };
  }

  return {
    thickness: getScheduleThickness(numericSize, "STD"),
    label: "STD matching pipe basis",
  };
}

function getGateValveFactor() {
  return (
    componentFactorMaster.find(
      (entry) => entry.group === "Valves Group" && entry.component === "Gate Valve"
    )?.factor || 1
  );
}

function getValveGateBasePricingBand(size) {
  const numericSize = Number(size);
  return valveGateBasePricingBands.find(
    (band) => numericSize >= band.min && numericSize <= band.max
  );
}

function buildValveUnitRateEstimate({
  size,
  rawSteel,
  componentFactor,
  pressureMultiplier,
  materialMultiplier,
  p90Ratio,
}) {
  const numericSize = Number(size);
  const band = getValveGateBasePricingBand(numericSize);
  const gateValveFactor = getGateValveFactor();
  const valveFactor = Number(componentFactor?.factor);
  const usableP90Ratio = Number.isFinite(p90Ratio) && p90Ratio > 0 ? p90Ratio : 1.5;

  if (
    !band ||
    !Number.isFinite(numericSize) ||
    !Number.isFinite(rawSteel) ||
    !Number.isFinite(valveFactor) ||
    !Number.isFinite(gateValveFactor) ||
    gateValveFactor <= 0
  ) {
    return null;
  }

  const exponent = Number.isFinite(Number(band.exponent)) ? Number(band.exponent) : 2;
  const weightBasis = band.weightCoefficient * Math.pow(numericSize, exponent);
  const gateValve150Rate = weightBasis * rawSteel * band.conversionFactor;
  const valveRatio = valveFactor / gateValveFactor;
  const medianUnitRate =
    gateValve150Rate * valveRatio * pressureMultiplier * materialMultiplier;

  return {
    weightBasis,
    weightCoefficient: band.weightCoefficient,
    conversionFactor: band.conversionFactor,
    exponent,
    gateValveFactor,
    valveRatio,
    gateValve150Rate,
    medianUnitRate,
    p90UnitRate: medianUnitRate * usableP90Ratio,
    basisLabel: `Valve table basis: W = ${formatNumber(
      band.weightCoefficient,
      2
    )} x N^${formatNumber(exponent, 2)}, conversion factor ${formatNumber(
      band.conversionFactor,
      2
    )}; other valves scaled by factor ratio vs Gate Valve.`,
  };
}

function normalizeFlangeType(itemText = "", componentName = "", standardName = "") {
  const text = normalizeBomGroupText(`${standardName} ${componentName} ${itemText}`);
  if (/\bblind\b|\bblindflange\b|\bblindflg\b|\bblrf\b|\bbl\s*rf\b|\bbln\b|\bblank\b|\bblankflange\b|\bbl\b/.test(text)) return "BLRF";
  if (/\bweldneck\b|\bweld neck\b|\bweldingneck\b|\bwelding neck\b|\bwel neck\b|\bwell neck\b|\bneckflange\b|\bwn\b|\bwnrf\b|\bwn\s*rf\b|\bwnflange\b|\bwnflg\b|\bflangwn\b|\bflangewn\b/.test(text)) return "WNRF";
  if (/\bslipon\b|\bslip on\b|\bsliponflange\b|\bsliponflg\b|\bso\b|\bsorf\b|\bso\s*rf\b|\bsoflange\b|\bsoflg\b|\bs o\b/.test(text)) return "SORF";
  return "";
}

function getFlangeDisplayType(flangeType) {
  if (flangeType === "BLRF") return "Blind";
  if (flangeType === "SORF") return "SO";
  return "WN";
}

function getFlangeSizeBand(size) {
  const numericSize = Number(size);
  if (!Number.isFinite(numericSize) || numericSize <= 0) return "";
  if (numericSize <= 2) return "small";
  if (numericSize <= 8) return "medium";
  return "large";
}

function formatFlangeNpsKey(size) {
  const numericSize = Number(size);
  if (!Number.isFinite(numericSize) || numericSize <= 0) return "";
  return `${Number.isInteger(numericSize) ? numericSize : numericSize.toString()}"`;
}

function getFlangeDnFromModel(size, npsKey) {
  const fromTable = Number(flangeWeightModel?.npsToDn?.[npsKey]);
  if (Number.isFinite(fromTable) && fromTable > 0) return fromTable;
  const numericSize = Number(size);
  if (!Number.isFinite(numericSize) || numericSize <= 0) return NaN;
  const mappedDn = Number(
    Object.entries(dnToNps).find(([, nps]) => Number(nps) === numericSize)?.[0]
  );
  return Number.isFinite(mappedDn) && mappedDn > 0 ? mappedDn : numericSize * 25;
}

function interpolateFlangeWeight(flangeType, ratingKey, size, npsKey) {
  if (!flangeWeightModel?.standardCurves) return null;
  const targetDn = getFlangeDnFromModel(size, npsKey);
  if (!Number.isFinite(targetDn) || targetDn <= 0) return null;

  for (const standard of flangeStandardPriority) {
    const series = flangeWeightModel.standardCurves[`${flangeType}|${ratingKey}|${standard}`];
    if (!Array.isArray(series) || series.length < 2) continue;

    const sorted = series
      .map((point) => ({
        dn: Number(point.dn),
        nps: point.nps,
        weight: Number(point.weight),
      }))
      .filter((point) => Number.isFinite(point.dn) && Number.isFinite(point.weight) && point.weight > 0)
      .sort((a, b) => a.dn - b.dn);

    const lower = [...sorted].reverse().find((point) => point.dn <= targetDn);
    const upper = sorted.find((point) => point.dn >= targetDn);
    if (!lower || !upper) continue;
    if (lower.dn === upper.dn) {
      return {
        weight: lower.weight,
        standard,
        method: `Standard curve exact point ${lower.nps || npsKey}`,
      };
    }

    const weight = Math.exp(
      Math.log(lower.weight) +
        ((Math.log(targetDn) - Math.log(lower.dn)) / (Math.log(upper.dn) - Math.log(lower.dn))) *
          (Math.log(upper.weight) - Math.log(lower.weight))
    );

    return {
      weight,
      standard,
      method: `Log interpolation between ${lower.nps || `${lower.dn} DN`} and ${
        upper.nps || `${upper.dn} DN`
      }`,
    };
  }

  return null;
}

function lookupFlangeWeight(flangeType, ratingKey, size, npsKey) {
  const exactKey = `${flangeType}|${ratingKey}|${npsKey}`;
  const exact = flangeWeightModel?.exactWeights?.[exactKey];
  if (exact) {
    return {
      exactKey,
      weight: Number(exact.weight),
      standard: exact.standard || "",
      method: "Exact JSON weight",
    };
  }

  const builtIn = builtInFlangeWeightFallbacks[exactKey];
  if (builtIn) {
    return {
      exactKey,
      weight: Number(builtIn.weight),
      standard: builtIn.standard,
      method: `Built-in ${ratingKey} fallback weight`,
    };
  }

  const interpolated = interpolateFlangeWeight(flangeType, ratingKey, size, npsKey);
  return interpolated ? { exactKey, ...interpolated } : null;
}

function buildFlangeWeightUnitRateEstimate({
  item,
  standardName,
  componentFactor,
  size,
  pressureClass,
  rawSteel,
  materialMultiplier,
  p90Ratio,
}) {
  const detectedFlangeType = normalizeFlangeType(item, componentFactor?.component, standardName);
  const flangeType = detectedFlangeType || "WNRF";
  const sizeBand = getFlangeSizeBand(size);
  const p50Multiplier = flangeWeightP50Multipliers[flangeType]?.[sizeBand];
  const ratingKey = `${pressureClass || "150"}#`;
  const npsKey = formatFlangeNpsKey(size);
  const usableP90Ratio = Number.isFinite(p90Ratio) && p90Ratio > 0 ? p90Ratio : 1.5;

  if (!p50Multiplier) return null;

  const lookupAttempts = [
    { type: flangeType, rating: ratingKey, reason: detectedFlangeType ? "" : "Flange type not clear; WN fallback used." },
  ];
  if (flangeType !== "WNRF") {
    lookupAttempts.push({
      type: "WNRF",
      rating: ratingKey,
      reason: `${getFlangeDisplayType(flangeType)} ${ratingKey} weight not found; WN fallback used.`,
    });
  }
  let lookup = null;
  let lookupFlangeType = flangeType;
  let lookupRatingKey = ratingKey;
  let fallbackReason = "";
  for (const attempt of lookupAttempts) {
    lookup = lookupFlangeWeight(attempt.type, attempt.rating, size, npsKey);
    if (lookup && Number.isFinite(lookup.weight) && lookup.weight > 0) {
      lookupFlangeType = attempt.type;
      lookupRatingKey = attempt.rating;
      fallbackReason = attempt.reason;
      break;
    }
  }

  if (!lookup || !Number.isFinite(lookup.weight) || lookup.weight <= 0) {
    return {
      error: "Flange weight is not available in the JSON model. Review required.",
      flangeType,
      sizeBand,
      p50Multiplier,
      exactKey: `${flangeType}|${ratingKey}|${npsKey}`,
    };
  }

  if (!Number.isFinite(rawSteel) || rawSteel <= 0) {
    return {
      error: "Raw material rate is not available for this flange.",
      flangeType,
      detectedFlangeType,
      sizeBand,
      p50Multiplier,
      exactKey: lookup.exactKey,
    };
  }

  const lookupSizeBand = getFlangeSizeBand(size);
  const lookupP50Multiplier = flangeWeightP50Multipliers[lookupFlangeType]?.[lookupSizeBand] || p50Multiplier;
  const medianUnitRate = lookup.weight * rawSteel * lookupP50Multiplier * materialMultiplier;

  return {
    flangeType: lookupFlangeType,
    detectedFlangeType,
    flangeFallbackUsed: Boolean(fallbackReason),
    flangeFallbackReason: fallbackReason,
    sizeBand,
    npsKey,
    ratingKey: lookupRatingKey,
    originalRatingKey: ratingKey,
    exactKey: lookup.exactKey,
    weightKg: lookup.weight,
    standard: lookup.standard,
    lookupMethod: lookup.method,
    p50Multiplier: lookupP50Multiplier,
    medianUnitRate,
    p90UnitRate: medianUnitRate * usableP90Ratio,
    basisLabel: `Flange JSON weight basis ${lookupFlangeType} ${lookupRatingKey} ${npsKey}: ${formatNumber(
      lookup.weight,
      2
    )} kg, ${lookup.method}, P50 multiplier ${formatNumber(lookupP50Multiplier, 2)}.${
      fallbackReason ? ` ${fallbackReason}` : ""
    }`,
  };
}

function parseMetricStudDesignation(...values) {
  const text = values.map((value) => String(value || "")).join(" ").toUpperCase();
  const match = text.match(/\bM\s*(\d+(?:\.\d+)?)\s*[X\u00D7]\s*(\d+(?:\.\d+)?)\b/);
  if (!match) return null;

  return {
    diameterMm: Number(match[1]),
    lengthMm: Number(match[2]),
  };
}

function calculateMetricStudBoltSetMass({
  diameterMm,
  lengthMm,
  pitchMm,
  nutAcrossFlatsMm,
  nutThicknessMm,
  densityKgM3 = studBoltPricingBasis.densityKgM3,
  studCorrectionFactor = studBoltPricingBasis.studCorrectionFactor,
  nutCorrectionFactor = studBoltPricingBasis.nutCorrectionFactor,
  numberOfNuts = studBoltPricingBasis.numberOfNuts,
}) {
  const values = {
    diameterMm: Number(diameterMm),
    lengthMm: Number(lengthMm),
    pitchMm: Number(pitchMm),
    nutAcrossFlatsMm: Number(nutAcrossFlatsMm),
    nutThicknessMm: Number(nutThicknessMm),
    densityKgM3: Number(densityKgM3),
    studCorrectionFactor: Number(studCorrectionFactor),
    nutCorrectionFactor: Number(nutCorrectionFactor),
    numberOfNuts: Number(numberOfNuts),
  };

  if (Object.values(values).some((value) => !Number.isFinite(value) || value <= 0)) {
    return null;
  }

  if (values.nutAcrossFlatsMm <= values.diameterMm) return null;

  const effectiveDiameterMm = values.diameterMm - 0.649519 * values.pitchMm;
  if (effectiveDiameterMm <= 0) return null;

  const studAreaMm2 = (Math.PI / 4) * Math.pow(effectiveDiameterMm, 2);
  const studVolumeMm3 = studAreaMm2 * values.lengthMm * values.studCorrectionFactor;
  const studMassKg = studVolumeMm3 * values.densityKgM3 * 1e-9;
  const grossNutHexAreaMm2 = (Math.sqrt(3) / 2) * Math.pow(values.nutAcrossFlatsMm, 2);
  const nutHoleAreaMm2 = (Math.PI / 4) * Math.pow(effectiveDiameterMm, 2);
  const netNutAreaMm2 = grossNutHexAreaMm2 - nutHoleAreaMm2;
  if (netNutAreaMm2 <= 0) return null;

  const oneNutVolumeMm3 = netNutAreaMm2 * values.nutThicknessMm * values.nutCorrectionFactor;
  const oneNutMassKg = oneNutVolumeMm3 * values.densityKgM3 * 1e-9;
  const totalNutMassKg = oneNutMassKg * values.numberOfNuts;
  const massPerSetKg = studMassKg + totalNutMassKg;

  return {
    ...values,
    effectiveDiameterMm,
    studAreaMm2,
    studVolumeMm3,
    studMassKg,
    grossNutHexAreaMm2,
    nutHoleAreaMm2,
    netNutAreaMm2,
    oneNutVolumeMm3,
    oneNutMassKg,
    totalNutMassKg,
    massPerSetKg,
  };
}

function buildMetricStudBoltUnitRateEstimate({ designationText, rawSteel, p90Ratio }) {
  const designation = parseMetricStudDesignation(designationText);
  if (!designation) return null;
  if (!Number.isFinite(Number(rawSteel)) || Number(rawSteel) <= 0) {
    return { error: "Raw material rate is not available for this metric stud set." };
  }

  const pitchMm = metricCoarsePitch[designation.diameterMm];
  if (!Number.isFinite(pitchMm)) {
    return { error: "Standard coarse thread pitch is not available for this metric stud size. Review required." };
  }
  const nutDimensions = metricHeavyHexNutDimensions[designation.diameterMm];
  if (!nutDimensions) {
    return { error: "Nut dimensions are not available for this stud set. Review required." };
  }

  const mass = calculateMetricStudBoltSetMass({
    ...designation,
    pitchMm,
    nutAcrossFlatsMm: nutDimensions.acrossFlatsMm,
    nutThicknessMm: nutDimensions.thicknessMm,
  });
  if (!mass) return { error: "Stud-and-nut mass calculation is invalid. Review required." };

  const commercialFactor = studBoltPricingBasis.commercialRawToFinishedFactor;
  const usableP90Ratio = Number.isFinite(p90Ratio) && p90Ratio > 0 ? p90Ratio : 1.5;
  const medianUnitRate = mass.massPerSetKg * Number(rawSteel) * commercialFactor;

  return {
    ...mass,
    commercialFactor,
    medianUnitRate,
    p90UnitRate: medianUnitRate * usableP90Ratio,
    basisLabel: `Metric stud-and-two-heavy-hex-nut basis M${formatNumber(
      designation.diameterMm,
      0
    )} x ${formatNumber(designation.lengthMm, 0)} mm; ASME B18.2.4.6M heavy hex nuts, pitch ${formatNumber(
      pitchMm,
      2
    )} mm`,
  };
}

function getDefaultComponentThickness(size, thicknessText, group = "", thicknessIsSchedule = false) {
  const isPipeGroup = group === "Pipe Group";
  const hasPressureClass = Boolean(parsePressureClass(thicknessText));
  const hasRatingText = hasComponentRatingText(thicknessText);

  if (group === "Valves Group") {
    return getValveComponentPipeBasis(size).thickness;
  }

  if (!isPipeGroup && (hasPressureClass || hasRatingText)) {
    return getScheduleThickness(size, getDefaultComponentSchedule(size, group));
  }

  if (thicknessIsSchedule) {
    const scheduleThickness = getScheduleThickness(size, thicknessText);
    if (Number.isFinite(scheduleThickness) && scheduleThickness > 0) return scheduleThickness;
  }

  const parsedThickness = parseThicknessInput(thicknessText, size);
  if (Number.isFinite(parsedThickness) && parsedThickness > 0) return parsedThickness;
  return getScheduleThickness(size, isPipeGroup ? "STD" : getDefaultComponentSchedule(size, group));
}

function getButtWeldFittingWeightFactor(size) {
  const nps = Number(size);
  if (nps === 2) return 5.0;
  if (nps > 2 && nps <= 4) return 3.5;
  if (nps > 4 && nps <= 20) return 2.5;
  if (nps > 20 && nps <= 26) return 2.8;
  if (nps > 26 && nps <= 48) return 3.2;
  return NaN;
}

function getEqualTeeConversionFactor(size) {
  const nps = Number(size);
  // Minimum finished-rate factors derived from direct uncoated CS Equal Tee
  // PO evidence, normalised against the raw steel rate in each PO year.
  if (nps >= 2 && nps <= 4) return 4.41;
  if (nps >= 6 && nps <= 20) return 3.86;
  if (nps >= 24 && nps <= 48) return 3.55;
  return NaN;
}

function build90DegreeElbowUnitRateEstimate({ size, pipeBasis, materialMultiplier, p90Ratio }) {
  const nps = Number(size);
  const odMm = odTable[nps];
  const wallThicknessMm = Number(pipeBasis?.thickness);
  const elbowFactor = getButtWeldFittingWeightFactor(nps);
  if (!Number.isFinite(odMm) || !Number.isFinite(wallThicknessMm) || wallThicknessMm <= 0) {
    return { error: "90 degree elbow OD or wall thickness is unavailable." };
  }
  if (!Number.isFinite(elbowFactor)) {
    return { error: "Weight-based 90 degree elbow factors are available from NPS 2 IN to 48 IN." };
  }
  if (!Number.isFinite(pipeBasis?.rawSteel) || pipeBasis.rawSteel <= 0) {
    return { error: "Raw material rate is unavailable for the 90 degree elbow." };
  }

  // Long-radius 90 degree elbow developed length = pi/2 x 1.5 x actual OD = 2.356D.
  const developedLengthM = (2.356 * odMm) / 1000;
  const pipeWeightKgm = 0.0246615 * (odMm - wallThicknessMm) * wallThicknessMm;
  const elbowWeightKg = pipeWeightKgm * developedLengthM;
  const medianUnitRate = elbowWeightKg * pipeBasis.rawSteel * elbowFactor * materialMultiplier;
  const usableP90Ratio = Number.isFinite(p90Ratio) && p90Ratio > 0 ? p90Ratio : 1.5;

  return {
    odMm,
    wallThicknessMm,
    developedLengthM,
    pipeWeightKgm,
    elbowWeightKg,
    elbowFactor,
    angleDegrees: 90,
    medianUnitRate,
    p90UnitRate: medianUnitRate * usableP90Ratio,
    basisLabel: `90 degree LR elbow weight basis: L = 2.356 x OD ${formatNumber(
      odMm,
      2
    )} mm = ${formatNumber(developedLengthM, 3)} m; elbow wt = ${formatNumber(
      pipeWeightKgm,
      2
    )} kg/m x ${formatNumber(developedLengthM, 3)} m = ${formatNumber(elbowWeightKg, 2)} kg.`,
  };
}

function build45DegreeElbowUnitRateEstimate(input) {
  const ninetyDegreeEstimate = build90DegreeElbowUnitRateEstimate(input);
  if (ninetyDegreeEstimate.error) return ninetyDegreeEstimate;

  const nps = Number(input?.size);
  // The physical developed length remains half of a matching 90 degree LR elbow.
  // The approved commercial price ratio is deliberately higher than 50% to cover
  // small-bore fabrication economics and varies by the specified size bands.
  const priceRatio = nps >= 2 && nps <= 6 ? 0.65 : nps >= 8 && nps <= 48 ? 0.6 : NaN;
  if (!Number.isFinite(priceRatio)) {
    return { error: "45 degree elbow price ratios are available from NPS 2 IN to 48 IN." };
  }

  const developedLengthM = ninetyDegreeEstimate.developedLengthM * 0.5;
  const elbowWeightKg = ninetyDegreeEstimate.elbowWeightKg * 0.5;
  const medianUnitRate = ninetyDegreeEstimate.medianUnitRate * priceRatio;
  return {
    ...ninetyDegreeEstimate,
    angleDegrees: 45,
    developedLengthM,
    elbowWeightKg,
    priceRatio,
    medianUnitRate,
    p90UnitRate: ninetyDegreeEstimate.p90UnitRate * priceRatio,
    basisLabel: `45 degree LR elbow weight basis: L = 1.178 x OD ${formatNumber(
      ninetyDegreeEstimate.odMm,
      2
    )} mm = ${formatNumber(developedLengthM, 3)} m; elbow wt = ${formatNumber(
      ninetyDegreeEstimate.pipeWeightKgm,
      2
    )} kg/m x ${formatNumber(developedLengthM, 3)} m = ${formatNumber(elbowWeightKg, 2)} kg. Commercial rate = ${formatNumber(
      priceRatio * 100,
      0
    )}% of the matching 90 degree elbow rate.`,
  };
}

function buildEqualTeeUnitRateEstimate({ size, pipeBasis, materialMultiplier, p90Ratio }) {
  const nps = Number(size);
  const odMm = odTable[nps];
  const dimensions = equalTeeCentreDimensionsMm[nps];
  const wallThicknessMm = Number(pipeBasis?.thickness);
  const teeFactor = getEqualTeeConversionFactor(nps);

  if (!dimensions || !Number.isFinite(odMm) || !Number.isFinite(wallThicknessMm) || wallThicknessMm <= 0) {
    return { error: "Equal tee OD, centre dimensions, or wall thickness is unavailable." };
  }
  if (!Number.isFinite(teeFactor)) {
    return { error: "PO-derived Equal Tee conversion factors are available from NPS 2 IN to 48 IN." };
  }
  if (!Number.isFinite(pipeBasis?.rawSteel) || pipeBasis.rawSteel <= 0) {
    return { error: "Raw material rate is unavailable for the equal tee." };
  }

  // Remove the shared centre overlap so the pipe-weight basis reflects the tee's actual metal length.
  const developedLengthM = (2 * dimensions.c + dimensions.m - 0.5 * odMm) / 1000;
  if (!Number.isFinite(developedLengthM) || developedLengthM <= 0) {
    return { error: "Calculated equal tee developed length is invalid." };
  }
  const pipeWeightKgm = 0.0246615 * (odMm - wallThicknessMm) * wallThicknessMm;
  const teeWeightKg = pipeWeightKgm * developedLengthM;
  const medianUnitRate = teeWeightKg * pipeBasis.rawSteel * teeFactor * materialMultiplier;
  const usableP90Ratio = Number.isFinite(p90Ratio) && p90Ratio > 0 ? p90Ratio : 1.5;

  return {
    odMm,
    wallThicknessMm,
    centreRunMm: dimensions.c,
    centreBranchMm: dimensions.m,
    developedLengthM,
    pipeWeightKgm,
    teeWeightKg,
    teeFactor,
    medianUnitRate,
    p90UnitRate: medianUnitRate * usableP90Ratio,
    basisLabel: `Equal tee weight basis: L = 2C + M - 0.5 x OD = 2 x ${formatNumber(
      dimensions.c,
      1
    )} mm + ${formatNumber(dimensions.m, 1)} mm - 0.5 x ${formatNumber(odMm, 1)} mm = ${formatNumber(
      developedLengthM,
      3
    )} m; tee wt = ${formatNumber(pipeWeightKgm, 2)} kg/m x ${formatNumber(
      developedLengthM,
      3
    )} m = ${formatNumber(teeWeightKg, 2)} kg. PO-derived minimum conversion factor = ${formatNumber(teeFactor, 2)}.`,
  };
}

function buildSmallBoreEqualTeeFallbackEstimate({
  size,
  pipeBasis,
  materialMultiplier,
  pressureMultiplier,
}) {
  const nps = Number(size);
  const equalTeeFactor = componentFactorMaster.find(
    (entry) => entry.group === "Fitting Group" && entry.component === "Equal Tee"
  )?.factor;

  if (
    !Number.isFinite(nps) ||
    !Number.isFinite(odTable[nps]) ||
    !Number.isFinite(equalTeeFactor) ||
    !Number.isFinite(pipeBasis?.medianRsM) ||
    !Number.isFinite(pipeBasis?.p90RsM)
  ) {
    return { error: "Small-bore Equal Tee fallback rate is unavailable." };
  }

  return {
    teeFactor: equalTeeFactor,
    medianUnitRate: pipeBasis.medianRsM * equalTeeFactor * pressureMultiplier * materialMultiplier,
    p90UnitRate: pipeBasis.p90RsM * equalTeeFactor * pressureMultiplier * materialMultiplier,
    basisLabel: `Small-bore Equal Tee commercial fallback: ${formatPipeSize(
      nps
    )} IN matching pipe Rs/m x approved Equal Tee factor ${formatNumber(equalTeeFactor, 2)}.`,
    fallbackMethod: "small-bore commercial factor",
  };
}

function parseUnequalTeeSizes(sizeText) {
  const sizeParts = String(sizeText || "")
    .replace(/\u00C2?\u00BD/g, " 1/2")
    .replace(/\u00C2?\u00BE/g, " 3/4")
    .replace(/\u00C2?\u00BC/g, " 1/4")
    .split(/\s*[X\u00D7]\s*/i)
    .map((part) => parseBomSize(part));

  if (sizeParts.length < 2 || !Number.isFinite(sizeParts[0]) || !Number.isFinite(sizeParts[1])) {
    return null;
  }

  return { runSize: sizeParts[0], branchSize: sizeParts[1] };
}

function getUnequalTeeBranchThickness({
  branchSize,
  thicknessText,
  thicknessIsSchedule,
  runThicknessMm,
  defaultSchedule,
}) {
  const text = String(thicknessText || "");
  const hasSchedule =
    thicknessIsSchedule || /\b(?:SCH(?:EDULE)?|STD|S-STD|XS|XXS|HVY|\d+S)\b/i.test(text);
  const directThickness = parseBomNumber(text);
  const hasDirectThickness =
    Number.isFinite(directThickness) && directThickness > 0 && !hasSchedule && !hasComponentRatingText(text);
  if (hasDirectThickness) return Number(runThicknessMm);

  return getScheduleThickness(branchSize, hasSchedule ? text : defaultSchedule);
}

function buildUnequalTeeUnitRateEstimate({
  sizeText,
  thicknessText,
  thicknessIsSchedule,
  defaultSchedule,
  pipeBasis,
  materialMultiplier,
  p90Ratio,
}) {
  if (unequalTeeDimensionsStatus !== "loaded") {
    return { error: "Approved unequal tee C/M dimensions are not available. Review required." };
  }

  const sizes = parseUnequalTeeSizes(sizeText);
  if (!sizes || sizes.runSize < 2 || sizes.runSize > 48 || sizes.branchSize <= 0 || sizes.branchSize > sizes.runSize) {
    return { error: "Unequal tee run and branch sizes must be readable from NPS 2 IN to 48 IN." };
  }

  const dimensions = unequalTeeDimensions.find(
    (record) =>
      Number(record.run_size_in) === sizes.runSize && Number(record.branch_size_in) === sizes.branchSize
  );
  if (!dimensions) {
    return {
      error: `Approved unequal tee dimensions are unavailable for ${formatPipeSize(sizes.runSize)} IN x ${formatPipeSize(sizes.branchSize)} IN. Review required.`,
    };
  }

  const runOdMm = odTable[sizes.runSize];
  const branchOdMm = odTable[sizes.branchSize];
  const runThicknessMm = Number(pipeBasis?.thickness);
  const branchThicknessMm = getUnequalTeeBranchThickness({
    branchSize: sizes.branchSize,
    thicknessText,
    thicknessIsSchedule,
    runThicknessMm,
    defaultSchedule,
  });
  // Use the same PO-derived conversion factor as an Equal Tee, based on
  // the reducing tee's run size. This keeps equal and reducing tee pricing aligned.
  const teeFactor = getEqualTeeConversionFactor(sizes.runSize);

  if (
    !Number.isFinite(runOdMm) ||
    !Number.isFinite(branchOdMm) ||
    !Number.isFinite(runThicknessMm) ||
    !Number.isFinite(branchThicknessMm) ||
    runThicknessMm <= 0 ||
    branchThicknessMm <= 0
  ) {
    return { error: "Unequal tee OD or wall thickness is unavailable." };
  }
  if (!Number.isFinite(teeFactor)) {
    return { error: "PO-derived Reducing Tee conversion factors are available from NPS 2 IN to 48 IN." };
  }
  if (!Number.isFinite(pipeBasis?.rawSteel) || pipeBasis.rawSteel <= 0) {
    return { error: "Raw material rate is unavailable for the unequal tee." };
  }

  const runLengthM = (2 * Number(dimensions.C_mm) - 0.5 * runOdMm) / 1000;
  const branchLengthM = Number(dimensions.M_mm) / 1000;
  if (!Number.isFinite(runLengthM) || !Number.isFinite(branchLengthM) || runLengthM <= 0 || branchLengthM <= 0) {
    return { error: "Calculated unequal tee developed length is invalid." };
  }

  const runPipeWeightKgm = 0.0246615 * (runOdMm - runThicknessMm) * runThicknessMm;
  const branchPipeWeightKgm = 0.0246615 * (branchOdMm - branchThicknessMm) * branchThicknessMm;
  const teeWeightKg = runPipeWeightKgm * runLengthM + branchPipeWeightKgm * branchLengthM;
  const medianUnitRate = teeWeightKg * pipeBasis.rawSteel * teeFactor * materialMultiplier;
  const usableP90Ratio = Number.isFinite(p90Ratio) && p90Ratio > 0 ? p90Ratio : 1.5;

  return {
    runSize: sizes.runSize,
    branchSize: sizes.branchSize,
    runOdMm,
    branchOdMm,
    runThicknessMm,
    branchThicknessMm,
    centreRunMm: Number(dimensions.C_mm),
    centreBranchMm: Number(dimensions.M_mm),
    runLengthM,
    branchLengthM,
    developedLengthM: runLengthM + branchLengthM,
    runPipeWeightKgm,
    branchPipeWeightKgm,
    teeWeightKg,
    teeFactor,
    medianUnitRate,
    p90UnitRate: medianUnitRate * usableP90Ratio,
    basisLabel: `Unequal tee weight basis: run ${formatPipeSize(sizes.runSize)} IN x branch ${formatPipeSize(
      sizes.branchSize
    )} IN; run L = 2C - 0.5 x OD = ${formatNumber(runLengthM, 3)} m, branch L = M = ${formatNumber(
      branchLengthM,
      3
    )} m; tee wt = ${formatNumber(teeWeightKg, 2)} kg. PO-derived conversion factor = ${formatNumber(teeFactor, 2)}.`,
  };
}

function buildComponentCostEstimate({
  group,
  item,
  standardName,
  sizeText,
  thicknessText,
  materialText,
  quantityText,
  uomText,
  thicknessIsSchedule = false,
}) {
  const componentFactor = getComponentFactorMatch(group, item, standardName);
  const quantity = parseBomNumber(quantityText);
  const hasValidQuantity = Number.isFinite(quantity) && quantity > 0;
  const size = parseComponentSize(sizeText, group);
  const isControlValve = group === "Valves Group" && /\bCONTROL\s*VALVE\b/i.test(`${item || ""} ${standardName || ""}`);
  const defaultSchedule = getDefaultComponentSchedule(size, group);
  const thickness = getDefaultComponentThickness(size, thicknessText, group, thicknessIsSchedule);
  const valvePipeBasis = group === "Valves Group" ? getValveComponentPipeBasis(size) : null;
  const matchingPipeBasis =
    group === "Pipe Group"
      ? "BOM pipe thickness/schedule"
      : valvePipeBasis
        ? valvePipeBasis.label
      : `${defaultSchedule} matching pipe basis`;
  const rawMapping = getRawMaterialPriceMapping(materialText, elements.year.value);
  const rawOverride = rawMapping?.recommended || elements.rawOverride.value || rawSteelByYear[elements.year.value] || rawSteelByYear[2026];
  const metricStudDesignation =
    group === "Bolt Group" ? parseMetricStudDesignation(sizeText, item) : null;
  const pipeBasis = buildEstimate({
    year: elements.year.value,
    size,
    thickness,
    length: 1,
    spec: rawMapping?.standard || materialText || elements.spec.value,
    coating: elements.coating.value,
    rawOverride,
    rawSteelSource: rawMapping ? "materialLibrary" : "defaultYear",
    rawBasisNote: rawMapping?.note || "Component estimate used current/default raw material basis",
    factorOverride: elements.factorOverride.value,
  });

  // A control valve cannot be budget-priced without its nominal size. Do not
  // allow the generic valve factor to hide this missing procurement input.
  if (isControlValve && (!Number.isFinite(size) || size <= 0)) {
    return {
      component: "Control Valve",
      factor: componentFactor?.factor ?? 0,
      factorUom: componentFactor?.uom || "NOS",
      confidence: "Low",
      autoCostAllowed: false,
      unitCostAllowed: false,
      totalCostAllowed: false,
      quantity: hasValidQuantity ? quantity : NaN,
      uom: normalizeHeader(uomText) || componentFactor?.uom || "NOS",
      reviewMessage: "Review: Control valve size is missing. Management decision required before pricing.",
      note: "Control valve size is missing. Enter the nominal valve size or obtain a supplier budgetary quotation before including this item in the estimate.",
    };
  }

  if (!componentFactor?.autoCostAllowed || Number(componentFactor?.factor) <= 0) {
    return {
      component: componentFactor?.component || standardName || "Other",
      factor: componentFactor?.factor ?? 0,
      factorUom: componentFactor?.uom || "",
      confidence: componentFactor?.confidence || "Low",
      autoCostAllowed: false,
      note: "Manual review required; no approved positive factor is available.",
    };
  }

  const pressureClass = parsePressureClass(item, thicknessText);
  const pressureMultiplier = getPressureMultiplier(pressureClass, group);
  const materialMultiplier = getMaterialMultiplier(materialText);
  const normalizedUom = normalizeHeader(uomText);
  const quantityBasis = hasValidQuantity ? quantity : NaN;
  const defaultFactors = getFactor(elements.coating.value);
  const p90Ratio =
    Number.isFinite(pipeBasis.p90RsM) && Number.isFinite(pipeBasis.medianRsM) && pipeBasis.medianRsM > 0
      ? pipeBasis.p90RsM / pipeBasis.medianRsM
      : defaultFactors.p90 / defaultFactors.median;
  const elbowUnitEstimate =
    ["90 Degree Elbow", "45 Degree Elbow"].includes(componentFactor?.component) &&
    Number(size) >= 2 && Number(size) <= 48 && !pipeBasis.error
      ? (componentFactor.component === "45 Degree Elbow"
          ? build45DegreeElbowUnitRateEstimate
          : build90DegreeElbowUnitRateEstimate)({
            size,
            pipeBasis,
            materialMultiplier,
            p90Ratio,
          })
      : null;
  const equalTeeUnitEstimate =
    componentFactor?.component === "Equal Tee" &&
    Number(size) >= 2 && Number(size) <= 48 && !pipeBasis.error
      ? buildEqualTeeUnitRateEstimate({
          size,
          pipeBasis,
          materialMultiplier,
          p90Ratio,
        })
      : null;
  const unequalTeeUnitEstimate =
    componentFactor?.component === "Reducing Tee" && !pipeBasis.error
      ? buildUnequalTeeUnitRateEstimate({
          sizeText,
          thicknessText,
          thicknessIsSchedule,
          defaultSchedule,
          pipeBasis,
          materialMultiplier,
          p90Ratio,
        })
      : null;
  const unequalTeeSizes =
    componentFactor?.component === "Reducing Tee" ? parseUnequalTeeSizes(sizeText) : null;
  // When an approved unequal-tee C/M pair is unavailable, use the run-size equal tee
  // as a clearly labelled commercial fallback. Bad or unreadable BOM dimensions remain Review.
  const equalTeeFallbackEstimate =
    componentFactor?.component === "Reducing Tee" &&
    unequalTeeUnitEstimate?.error &&
    unequalTeeSizes &&
    Number.isFinite(unequalTeeSizes.runSize) &&
    odTable[unequalTeeSizes.runSize] &&
    unequalTeeSizes.runSize <= 48 &&
    unequalTeeSizes.branchSize > 0 &&
    unequalTeeSizes.branchSize <= unequalTeeSizes.runSize
      ? (() => {
          const fallback =
            unequalTeeSizes.runSize >= 2
              ? buildEqualTeeUnitRateEstimate({
                  size: unequalTeeSizes.runSize,
                  pipeBasis,
                  materialMultiplier,
                  p90Ratio,
                })
              : buildSmallBoreEqualTeeFallbackEstimate({
                  size: unequalTeeSizes.runSize,
                  pipeBasis,
                  materialMultiplier,
                  pressureMultiplier,
                });
          return fallback.error
            ? null
            : {
                ...fallback,
                // The fallback has supplied a price, so retain the original issue for
                // auditability without presenting this row as an unpriced review item.
                fallbackReason: unequalTeeUnitEstimate.error.replace(/\s*Review required\.?/i, "").trim(),
                runSize: unequalTeeSizes.runSize,
                branchSize: unequalTeeSizes.branchSize,
              };
        })()
      : null;
  const flangeUnitEstimate =
    group === "Flange Group"
      ? buildFlangeWeightUnitRateEstimate({
          item,
          standardName,
          componentFactor,
          size,
          pressureClass,
          rawSteel: pipeBasis.rawSteel || Number(rawOverride),
          materialMultiplier,
          p90Ratio,
        })
      : null;
  const flangeFallbackUnitEstimate =
    group === "Flange Group" && flangeUnitEstimate?.error && !pipeBasis.error
      ? (() => {
          const fallbackBand = getFlangeSizeBand(size);
          const fallbackMultiplier =
            flangeWeightP50Multipliers.WNRF[fallbackBand] || componentFactor.factor || 1;
          const effectiveFallbackMultiplier =
            fallbackMultiplier * flangeEquivalentPipeFallbackScale;
          return {
            flangeType: "WNRF",
            sizeBand: fallbackBand,
            p50Multiplier: fallbackMultiplier,
            fallbackScale: flangeEquivalentPipeFallbackScale,
            effectiveFallbackMultiplier,
            medianUnitRate: pipeBasis.medianRsM * effectiveFallbackMultiplier * materialMultiplier,
            p90UnitRate: pipeBasis.p90RsM * effectiveFallbackMultiplier * materialMultiplier,
            basisLabel: `Last-resort WN fallback flange basis: equivalent pipe rate x WN P50 multiplier ${formatNumber(
              fallbackMultiplier,
              2
            )} x fallback scale ${formatNumber(flangeEquivalentPipeFallbackScale, 2)}. ${
              flangeUnitEstimate.error
            }`,
            note: `Last-resort WN fallback used because ${flangeUnitEstimate.error}`,
          };
        })()
      : null;
  const valveUnitEstimate =
    group === "Valves Group"
      ? buildValveUnitRateEstimate({
          size,
          rawSteel: pipeBasis.rawSteel,
          componentFactor,
          pressureMultiplier,
          materialMultiplier,
          p90Ratio,
        })
      : null;
  const studBoltUnitEstimate =
    metricStudDesignation
      ? buildMetricStudBoltUnitRateEstimate({
          designationText: `${sizeText} ${item}`,
          rawSteel: pipeBasis.rawSteel || Number(rawOverride),
          p90Ratio,
        })
      : null;

  if (metricStudDesignation && studBoltUnitEstimate?.error) {
    return {
      component: componentFactor.component,
      factor: studBoltPricingBasis.commercialRawToFinishedFactor,
      componentFactor: componentFactor.factor,
      factorUom: componentFactor.uom,
      confidence: componentFactor.confidence,
      autoCostAllowed: false,
      size,
      quantity: quantityBasis,
      uom: normalizedUom || componentFactor.uom,
      note: studBoltUnitEstimate.error,
    };
  }

  if (pipeBasis.error) {
    return {
      component: componentFactor.component,
      factor: componentFactor.factor,
      factorUom: componentFactor.uom,
      confidence: componentFactor.confidence,
      autoCostAllowed: false,
      note: pipeBasis.error || "Size/thickness is not readable for component estimate.",
    };
  }

  if (unequalTeeUnitEstimate?.error && !equalTeeFallbackEstimate) {
    return {
      component: componentFactor.component,
      factor: componentFactor.factor,
      factorUom: componentFactor.uom,
      confidence: componentFactor.confidence,
      autoCostAllowed: false,
      unitCostAllowed: false,
      totalCostAllowed: false,
      size,
      thickness,
      quantity: quantityBasis,
      uom: normalizedUom || componentFactor.uom,
      note: unequalTeeUnitEstimate.error,
    };
  }

  const medianUnitRate =
    studBoltUnitEstimate?.medianUnitRate ??
    elbowUnitEstimate?.medianUnitRate ??
    equalTeeUnitEstimate?.medianUnitRate ??
    unequalTeeUnitEstimate?.medianUnitRate ??
    equalTeeFallbackEstimate?.medianUnitRate ??
    flangeUnitEstimate?.medianUnitRate ??
    flangeFallbackUnitEstimate?.medianUnitRate ??
    valveUnitEstimate?.medianUnitRate ??
    pipeBasis.medianRsM * componentFactor.factor * pressureMultiplier * materialMultiplier;
  const p90UnitRate =
    studBoltUnitEstimate?.p90UnitRate ??
    elbowUnitEstimate?.p90UnitRate ??
    equalTeeUnitEstimate?.p90UnitRate ??
    unequalTeeUnitEstimate?.p90UnitRate ??
    equalTeeFallbackEstimate?.p90UnitRate ??
    flangeUnitEstimate?.p90UnitRate ??
    flangeFallbackUnitEstimate?.p90UnitRate ??
    valveUnitEstimate?.p90UnitRate ??
    pipeBasis.p90RsM * componentFactor.factor * pressureMultiplier * materialMultiplier;

  return {
    component: componentFactor.component,
    factor:
      studBoltUnitEstimate?.commercialFactor ??
      elbowUnitEstimate?.elbowFactor ??
      equalTeeUnitEstimate?.teeFactor ??
      unequalTeeUnitEstimate?.teeFactor ??
      equalTeeFallbackEstimate?.teeFactor ??
      flangeUnitEstimate?.p50Multiplier ??
      flangeFallbackUnitEstimate?.p50Multiplier ??
      valveUnitEstimate?.conversionFactor ??
      componentFactor.factor,
    componentFactor: componentFactor.factor,
    factorUom: componentFactor.uom,
    confidence: componentFactor.confidence,
    isGenericFallback: Boolean(componentFactor.isGenericFallback),
    autoCostAllowed: hasValidQuantity,
    unitCostAllowed: true,
    totalCostAllowed: hasValidQuantity,
    size,
    thickness,
    quantity: quantityBasis,
    uom: normalizedUom || componentFactor.uom,
    rawSteel: pipeBasis.rawSteel || Number(rawOverride),
    pipeBasisRsM: pipeBasis.medianRsM,
    rawMaterialBasis: pipeBasis.rawSteelBasis,
    equivalentPipeSpec: rawMapping?.equivalentPipeSpec || "",
    studDiameterMm: studBoltUnitEstimate?.diameterMm ?? "",
    studLengthMm: studBoltUnitEstimate?.lengthMm ?? "",
    studPitchMm: studBoltUnitEstimate?.pitchMm ?? "",
    studEffectiveDiameterMm: studBoltUnitEstimate?.effectiveDiameterMm ?? "",
    studMassKg: studBoltUnitEstimate?.studMassKg ?? "",
    oneNutMassKg: studBoltUnitEstimate?.oneNutMassKg ?? "",
    totalNutMassKg: studBoltUnitEstimate?.totalNutMassKg ?? "",
    setMassKg: studBoltUnitEstimate?.massPerSetKg ?? "",
    setTotalMassKg: studBoltUnitEstimate
      ? studBoltUnitEstimate.massPerSetKg * quantityBasis
      : "",
    nutAcrossFlatsMm: studBoltUnitEstimate?.nutAcrossFlatsMm ?? "",
    nutThicknessMm: studBoltUnitEstimate?.nutThicknessMm ?? "",
    studCorrectionFactor: studBoltUnitEstimate?.studCorrectionFactor ?? "",
    nutCorrectionFactor: studBoltUnitEstimate?.nutCorrectionFactor ?? "",
    numberOfNuts: studBoltUnitEstimate?.numberOfNuts ?? "",
    studCommercialFactor: studBoltUnitEstimate?.commercialFactor ?? "",
    elbowDevelopedLengthM: elbowUnitEstimate?.developedLengthM ?? "",
    elbowWeightKg: elbowUnitEstimate?.elbowWeightKg ?? "",
    elbowWeightFactor: elbowUnitEstimate?.elbowFactor ?? "",
    teeCentreRunMm: equalTeeUnitEstimate?.centreRunMm ?? "",
    teeCentreBranchMm: equalTeeUnitEstimate?.centreBranchMm ?? "",
    teeDevelopedLengthM: equalTeeUnitEstimate?.developedLengthM ?? "",
    teeWeightKg: equalTeeUnitEstimate?.teeWeightKg ?? "",
    teeWeightFactor: equalTeeUnitEstimate?.teeFactor ?? "",
    unequalTeeRunSize: unequalTeeUnitEstimate?.runSize ?? "",
    unequalTeeBranchSize: unequalTeeUnitEstimate?.branchSize ?? "",
    unequalTeeRunLengthM: unequalTeeUnitEstimate?.runLengthM ?? "",
    unequalTeeBranchLengthM: unequalTeeUnitEstimate?.branchLengthM ?? "",
    unequalTeeWeightKg: unequalTeeUnitEstimate?.teeWeightKg ?? "",
    unequalTeeWeightFactor: unequalTeeUnitEstimate?.teeFactor ?? "",
    equalTeeFallbackUsed: Boolean(equalTeeFallbackEstimate),
    equalTeeFallbackRunSize: equalTeeFallbackEstimate?.runSize ?? "",
    equalTeeFallbackBranchSize: equalTeeFallbackEstimate?.branchSize ?? "",
    flangeType: flangeUnitEstimate?.flangeType ?? flangeFallbackUnitEstimate?.flangeType ?? "",
    flangeSizeBand: flangeUnitEstimate?.sizeBand ?? flangeFallbackUnitEstimate?.sizeBand ?? "",
    flangeWeightKg: flangeUnitEstimate?.weightKg ?? "",
    flangeWeightStandard: flangeUnitEstimate?.standard ?? "",
    flangeWeightMethod: flangeUnitEstimate?.lookupMethod ?? "",
    flangeLookupKey: flangeUnitEstimate?.exactKey ?? "",
    flangeP50Multiplier: flangeUnitEstimate?.p50Multiplier ?? flangeFallbackUnitEstimate?.p50Multiplier ?? "",
    flangeFallbackUsed: Boolean(flangeFallbackUnitEstimate),
    valveWeightBasis: valveUnitEstimate?.weightBasis ?? "",
    valveConversionFactor: valveUnitEstimate?.conversionFactor ?? "",
    valveFactorRatio: valveUnitEstimate?.valveRatio ?? "",
    pressureClass,
    pressureMultiplier,
    materialMultiplier,
    medianUnitRate,
    p90UnitRate,
    medianTotal: hasValidQuantity ? medianUnitRate * quantityBasis : NaN,
    p90Total: hasValidQuantity ? p90UnitRate * quantityBasis : NaN,
    matchingPipeBasis:
      studBoltUnitEstimate?.basisLabel ||
      elbowUnitEstimate?.basisLabel ||
      equalTeeUnitEstimate?.basisLabel ||
      unequalTeeUnitEstimate?.basisLabel ||
      equalTeeFallbackEstimate?.basisLabel ||
      flangeUnitEstimate?.basisLabel ||
      flangeFallbackUnitEstimate?.basisLabel ||
      valveUnitEstimate?.basisLabel ||
      matchingPipeBasis,
    note: `${hasValidQuantity ? "" : "Unit Rs calculated, but Quantity is not readable; Normal and P90 totals require review. "}${studBoltUnitEstimate
      ? `Metric complete set: stud ${formatNumber(
          studBoltUnitEstimate.studMassKg,
          3
        )} kg + ${formatNumber(studBoltUnitEstimate.numberOfNuts, 0)} heavy hex nuts x ${formatNumber(
          studBoltUnitEstimate.oneNutMassKg,
          3
        )} kg = ${formatNumber(studBoltUnitEstimate.massPerSetKg, 3)} kg/set. Raw ${formatCurrency(
          pipeBasis.rawSteel || Number(rawOverride),
          2
        )}/kg x commercial raw-to-finished factor ${formatNumber(
         studBoltUnitEstimate.commercialFactor,
         2
       )}. Calculated mass excludes washers, coatings, chamfers and manufacturing tolerances.`
      : elbowUnitEstimate
      ? `${formatNumber(elbowUnitEstimate.angleDegrees, 0)} degree LR elbow weight basis: developed length = ${
          elbowUnitEstimate.angleDegrees === 45 ? "1.178" : "2.356"
        } x actual OD ${formatNumber(
          elbowUnitEstimate.odMm,
          2
        )} mm = ${formatNumber(elbowUnitEstimate.developedLengthM, 3)} m; elbow weight = ${formatNumber(
          elbowUnitEstimate.elbowWeightKg,
          2
        )} kg. Unit Rs = elbow weight x raw ${formatCurrency(
          pipeBasis.rawSteel,
          2
        )}/kg x elbow factor ${formatNumber(elbowUnitEstimate.elbowFactor, 2)} x material factor ${formatNumber(materialMultiplier, 2)}. Material-specific raw rate is selected from the material library.`
      : equalTeeUnitEstimate
      ? `Equal tee weight basis: L = 2C + M - 0.5 x OD = 2 x ${formatNumber(
          equalTeeUnitEstimate.centreRunMm,
          1
        )} mm + ${formatNumber(equalTeeUnitEstimate.centreBranchMm, 1)} mm - 0.5 x ${formatNumber(
          equalTeeUnitEstimate.odMm,
          1
        )} mm = ${formatNumber(
          equalTeeUnitEstimate.developedLengthM,
          3
        )} m; tee weight = ${formatNumber(equalTeeUnitEstimate.teeWeightKg, 2)} kg. Unit Rs = tee weight x raw ${formatCurrency(
          pipeBasis.rawSteel,
          2
        )}/kg x tee factor ${formatNumber(equalTeeUnitEstimate.teeFactor, 2)} x material factor ${formatNumber(
          materialMultiplier,
          2
        )}. Material-specific raw rate is selected from the material library.`
      : equalTeeFallbackEstimate
      ? `Equal Tee fallback used for reducing tee ${formatPipeSize(
          equalTeeFallbackEstimate.runSize
        )} IN x ${formatPipeSize(equalTeeFallbackEstimate.branchSize)} IN because ${equalTeeFallbackEstimate.fallbackReason} Fallback unit price = ${formatCurrency(
          equalTeeFallbackEstimate.medianUnitRate,
          2
        )}; ${
          equalTeeFallbackEstimate.fallbackMethod === "small-bore commercial factor"
            ? `the run size is below NPS 2 IN, so the price uses matching run-size pipe Rs/m x approved Equal Tee factor ${formatNumber(
                equalTeeFallbackEstimate.teeFactor,
                2
              )}.`
            : `it is calculated as an equal tee of run size ${formatPipeSize(
                equalTeeFallbackEstimate.runSize
              )} IN using the approved equal-tee weight basis and tee factor ${formatNumber(
                equalTeeFallbackEstimate.teeFactor,
                2
              )}.`
        } Validate against supplier quotation.`
      : unequalTeeUnitEstimate
      ? `Unequal tee weight basis: run ${formatPipeSize(unequalTeeUnitEstimate.runSize)} IN x branch ${formatPipeSize(
          unequalTeeUnitEstimate.branchSize
        )} IN. Run weight = ${formatNumber(unequalTeeUnitEstimate.runPipeWeightKgm, 2)} kg/m x ${formatNumber(
          unequalTeeUnitEstimate.runLengthM,
          3
        )} m; branch weight = ${formatNumber(unequalTeeUnitEstimate.branchPipeWeightKgm, 2)} kg/m x ${formatNumber(
          unequalTeeUnitEstimate.branchLengthM,
          3
        )} m; total tee weight = ${formatNumber(unequalTeeUnitEstimate.teeWeightKg, 2)} kg. Unit Rs = tee weight x raw ${formatCurrency(
          pipeBasis.rawSteel,
          2
        )}/kg x tee factor ${formatNumber(unequalTeeUnitEstimate.teeFactor, 2)} x material factor ${formatNumber(
          materialMultiplier,
          2
        )}. Material-specific raw rate is selected from the material library.`
      : flangeUnitEstimate
      ? `Flange weight model: ${flangeUnitEstimate.flangeType} ${flangeUnitEstimate.ratingKey} ${
          flangeUnitEstimate.npsKey
        }, ${formatNumber(flangeUnitEstimate.weightKg, 2)} kg from ${
          flangeUnitEstimate.standard || "JSON"
        } (${flangeUnitEstimate.lookupMethod}). ${
          flangeUnitEstimate.flangeFallbackUsed
            ? `Fallback applied: ${flangeUnitEstimate.flangeFallbackReason} `
            : ""
        }Unit Rs = weight x raw ${formatCurrency(
          pipeBasis.rawSteel || Number(rawOverride),
          2
        )}/kg x P50 multiplier ${formatNumber(
          flangeUnitEstimate.p50Multiplier,
          2
        )} x material multiplier ${formatNumber(materialMultiplier, 2)}. Rating effect is included in flange weight; no extra flange pressure multiplier is applied.`
      : flangeFallbackUnitEstimate
      ? `Flange fallback: ${flangeFallbackUnitEstimate.note}. Unit Rs = equivalent pipe rate ${formatCurrency(
          pipeBasis.medianRsM,
          2
        )}/m x WN P50 multiplier ${formatNumber(
          flangeFallbackUnitEstimate.p50Multiplier,
          2
        )} x fallback scale ${formatNumber(
          flangeFallbackUnitEstimate.fallbackScale,
          2
        )} x material multiplier ${formatNumber(materialMultiplier, 2)}.`
      : valveUnitEstimate
      ? `${componentFactor.isGenericFallback ? "Generic fallback P80 applied. " : ""}Valve table: W ${formatNumber(
          valveUnitEstimate.weightBasis,
          2
        )} kg basis x raw ${formatCurrency(pipeBasis.rawSteel, 2)}/kg x conversion ${formatNumber(
          valveUnitEstimate.conversionFactor,
          2
        )} x valve ratio ${formatNumber(
          valveUnitEstimate.valveRatio,
          2
        )} x pressure multiplier ${formatNumber(
          pressureMultiplier,
          2
        )} x material multiplier ${formatNumber(materialMultiplier, 2)}.`
      : `${componentFactor.isGenericFallback ? "Generic fallback P80 applied. " : ""}Component factor ${formatNumber(
          componentFactor.factor,
          2
        )} x pressure multiplier ${formatNumber(
          pressureMultiplier,
          2
        )} x material multiplier ${formatNumber(materialMultiplier, 2)} x 1m equivalent pipe rate.`}`,
  };
}

function buildBomGroupItem(row, columns, sourceName, sourceKey) {
  const itemText = columns.item ? row[columns.item] : "";
  const sizeText = columns.size ? row[columns.size] : "";
  const thicknessText = columns.thickness ? row[columns.thickness] : "";
  const lengthText = columns.length ? row[columns.length] : "";
  const uomText = columns.uom ? row[columns.uom] : "";
  const materialText = columns.spec ? row[columns.spec] : "";
  const pipeClassText = String(columns.pipeClass ? row[columns.pipeClass] : "").trim() || columns.defaultPipeClass || "";

  if (!String(itemText || "").trim()) return null;
  const classification = classifyBomGroup(itemText);
  const materialMatch = classifyMaterialSpec(materialText);
  const componentCost = buildComponentCostEstimate({
    group: classification.group,
    item: itemText,
    standardName: classification.standardName,
    sizeText,
    thicknessText,
    materialText,
    quantityText: lengthText,
    uomText,
    thicknessIsSchedule: isScheduleOrRatingColumn(columns.thickness),
  });

  return {
    id: createId(),
    sourceName,
    sourceKey,
    group: classification.group,
    standardName: classification.standardName,
    item: String(itemText || "").trim(),
    size: String(sizeText || "").trim(),
    thickness: String(thicknessText || "").trim(),
    material: String(materialText || "").trim(),
    pipeClass: String(pipeClassText || "").trim(),
    materialCategory: materialMatch.category,
    materialMatchedStandard: materialMatch.matchedStandard,
    materialMatchId: materialMatch.matchId,
    materialMatchNote: materialMatch.note,
    quantity: String(lengthText || "").trim(),
    uom: String(uomText || "").trim(),
    componentCost,
  };
}

const manualComponentGroups = [
  "Fitting Group",
  "Flange Group",
  "Valves Group",
  "Bolt Group",
  "Gasket Group",
  "Trap/Strainer Group",
];

const manualComponentDefaults = {
  "Fitting Group": { size: "4 IN", rating: "STD", material: "ASTM A234 WPB" },
  "Flange Group": { size: "4 IN", rating: "150#", material: "ASTM A105" },
  "Valves Group": { size: "4 IN", rating: "150#", material: "ASTM A216 WCB" },
  "Bolt Group": { size: "M24 x 145", rating: "", material: "ASTM A193 B7 / ASTM A194 2H" },
  "Gasket Group": { size: "4 IN", rating: "150#", material: "SS304" },
  "Trap/Strainer Group": { size: "4 IN", rating: "150#", material: "ASTM A216 WCB" },
};

function populateComponentGroups() {
  if (!elements.componentGroup) return;
  elements.componentGroup.innerHTML = manualComponentGroups
    .map((group) => `<option value="${escapeHtml(group)}">${escapeHtml(group.replace(" Group", ""))}</option>`)
    .join("");
  elements.componentGroup.value = "Fitting Group";
  populateComponentTypes({ applyDefaults: true });
}

function populateComponentTypes({ applyDefaults = false } = {}) {
  if (!elements.componentGroup || !elements.componentType) return;
  const group = elements.componentGroup.value;
  const uniqueComponents = [...new Set(
    componentFactorMaster
      .filter((entry) => entry.group === group && entry.factor > 0)
      .map((entry) => entry.component)
  )];
  elements.componentType.innerHTML = uniqueComponents
    .map((component) => `<option value="${escapeHtml(component)}">${escapeHtml(component)}</option>`)
    .join("");
  updateComponentFieldLayout(applyDefaults);
}

function isManualUnequalTeeSelection() {
  return (
    elements.componentGroup?.value === "Fitting Group" &&
    elements.componentType?.value === "Reducing Tee"
  );
}

function getManualComponentSizeValue() {
  return isManualUnequalTeeSelection()
    ? String(elements.componentUnequalTeeSize?.value || "")
    : String(elements.componentSize?.value || "");
}

function populateUnequalTeeSizeOptions() {
  if (!elements.componentUnequalTeeSize) return;

  if (unequalTeeDimensionsStatus !== "loaded") {
    const message = unequalTeeDimensionsStatus === "failed"
      ? "Approved unequal tee sizes are unavailable"
      : "Loading approved unequal tee sizes...";
    elements.componentUnequalTeeSize.innerHTML = `<option value="">${escapeHtml(message)}</option>`;
    return;
  }

  // The approved weight-factor method starts at NPS 2 IN, so do not offer
  // smaller JSON rows that would correctly remain Review-required.
  const records = unequalTeeDimensions.filter((record) => Number(record.run_size_in) >= 2).sort(
    (a, b) =>
      Number(a.run_size_in) - Number(b.run_size_in) ||
      Number(a.branch_size_in) - Number(b.branch_size_in)
  );
  const currentValue = elements.componentUnequalTeeSize.value;
  elements.componentUnequalTeeSize.innerHTML = records
    .map((record) => {
      const label = `${formatPipeSize(record.run_size_in)} IN x ${formatPipeSize(record.branch_size_in)} IN`;
      return `<option value="${escapeHtml(label)}">${escapeHtml(label)}</option>`;
    })
    .join("");

  const hasCurrentValue = [...elements.componentUnequalTeeSize.options].some(
    (option) => option.value === currentValue
  );
  if (hasCurrentValue) {
    elements.componentUnequalTeeSize.value = currentValue;
  } else {
    const preferredValue = "4 IN x 3 IN";
    elements.componentUnequalTeeSize.value = [...elements.componentUnequalTeeSize.options].some(
      (option) => option.value === preferredValue
    )
      ? preferredValue
      : elements.componentUnequalTeeSize.options[0]?.value || "";
  }
}

function updateComponentFieldLayout(applyDefaults = false) {
  if (!elements.componentGroup) return;
  const group = elements.componentGroup.value;
  const isBolt = group === "Bolt Group";
  const isUnequalTee = isManualUnequalTeeSelection();
  const defaults = manualComponentDefaults[group] || manualComponentDefaults["Fitting Group"];
  elements.componentSizeLabel.textContent = isBolt
    ? "Metric Size / Designation"
    : isUnequalTee
      ? "Run Size IN x Branch Size IN"
      : "Size IN";
  elements.componentSize.placeholder = isBolt ? "Example: M24 x 145" : "Example: 4 IN or 6 IN x 4 IN";
  elements.componentSize.hidden = isUnequalTee;
  elements.componentUnequalTeeSize.hidden = !isUnequalTee;
  if (isUnequalTee) populateUnequalTeeSizeOptions();
  elements.componentRatingField.hidden = isBolt;

  if (applyDefaults) {
    elements.componentSize.value = defaults.size;
    elements.componentRating.value = defaults.rating;
    elements.componentMaterial.value = defaults.material;
  }

  const factorMatch = getComponentFactorMatch(group, elements.componentType.value, elements.componentType.value);
  elements.componentUom.value = factorMatch?.uom || "NOS";
  renderComponentQuickEstimate();
}

function getCurrentComponentQuickEstimate() {
  const group = elements.componentGroup.value;
  const component = elements.componentType.value;
  const sizeText = getManualComponentSizeValue().trim();
  const thicknessText = elements.componentRatingField.hidden ? "" : elements.componentRating.value.trim();
  const materialText = elements.componentMaterial.value.trim();
  const quantityText = elements.componentQuantity.value;

  if (!group || !component || !sizeText || !materialText) {
    return { error: "Select a component type and enter size and material before estimating." };
  }

  const cost = buildComponentCostEstimate({
    group,
    item: component,
    standardName: component,
    sizeText,
    thicknessText,
    materialText,
    quantityText,
    uomText: elements.componentUom.value,
    thicknessIsSchedule: true,
  });
  const materialMatch = classifyMaterialSpec(materialText);
  return { group, component, sizeText, thicknessText, materialText, quantityText, materialMatch, cost };
}

function renderComponentQuickEstimate() {
  if (!elements.componentOutputGroup) return;
  const preview = getCurrentComponentQuickEstimate();
  const clearOutput = (message) => {
    elements.componentOutputGroup.textContent = "Component estimate";
    elements.componentOutputStatus.textContent = "Review required";
    elements.componentOutputStatus.classList.add("review");
    elements.componentMaterialCategory.textContent = "-";
    elements.componentRawRate.textContent = "-";
    elements.componentFactor.textContent = "-";
    elements.componentUnitRate.textContent = "-";
    elements.componentNormalTotal.textContent = "-";
    elements.componentP90Total.textContent = "-";
    elements.componentBasis.textContent = message;
    elements.componentWarning.textContent = message;
  };
  if (preview.error) {
    clearOutput(preview.error);
    return null;
  }

  const { cost } = preview;
  const priced = hasComponentUnitPrice(cost);
  const hasTotals = hasComponentTotals(cost);
  elements.componentOutputGroup.textContent = `${preview.component} | ${preview.group.replace(" Group", "")}`;
  elements.componentOutputStatus.textContent = priced && hasTotals ? "Ready" : "Review required";
  elements.componentOutputStatus.classList.toggle("review", !(priced && hasTotals));
  elements.componentMaterialCategory.textContent = formatCategoryHeading(preview.materialMatch.category || "Unclassified");
  elements.componentRawRate.textContent = Number.isFinite(cost.rawSteel) ? formatCurrency(cost.rawSteel, 2) : "Review";
  elements.componentFactor.textContent = Number.isFinite(cost.factor) ? formatNumber(cost.factor, 2) : "Review";
  elements.componentUnitRate.textContent = priced ? formatCurrency(cost.medianUnitRate, 2) : "Review";
  elements.componentNormalTotal.textContent = hasTotals ? formatCurrency(cost.medianTotal, 2) : "Review";
  elements.componentP90Total.textContent = hasTotals ? formatCurrency(cost.p90Total, 2) : "Review";
  elements.componentBasis.textContent = cost.note || cost.matchingPipeBasis || "Calculation basis is not available.";
  elements.componentWarning.textContent = priced && hasTotals ? "" : cost.note || "Complete the required component information to calculate the estimate.";
  return preview;
}

function addManualComponent() {
  const preview = renderComponentQuickEstimate();
  if (!preview || !hasComponentUnitPrice(preview.cost) || !hasComponentTotals(preview.cost)) {
    elements.componentWarning.textContent = preview?.cost?.note || "Complete the required information before adding this component.";
    return;
  }

  bomGroupItems.push({
    id: createId(),
    sourceName: "Manual component input",
    sourceKey: "manual-component",
    group: preview.group,
    standardName: preview.component,
    item: preview.component,
    size: preview.sizeText,
    thickness: preview.thicknessText || "-",
    material: preview.materialText,
    materialCategory: preview.materialMatch.category,
    materialMatchedStandard: preview.materialMatch.matchedStandard,
    materialMatchId: preview.materialMatch.matchId,
    materialMatchNote: preview.materialMatch.note,
    quantity: String(preview.quantityText),
    uom: elements.componentUom.value,
    componentCost: preview.cost,
  });
  renderBomGroupReview();
  renderWhatIfAnalysis();
  updateReportGenerated();
  showSuccessMessage(`${preview.component} added to Piping Component Cost Review.`);
}

function resetComponentQuickEstimate() {
  elements.componentGroup.value = "Fitting Group";
  elements.componentQuantity.value = "1";
  populateComponentTypes({ applyDefaults: true });
  elements.componentWarning.textContent = "";
}

function hasComponentUnitPrice(cost = {}) {
  return Boolean(cost.unitCostAllowed ?? cost.autoCostAllowed) && Number.isFinite(cost.medianUnitRate);
}

function hasComponentTotals(cost = {}) {
  return Boolean(cost.totalCostAllowed ?? cost.autoCostAllowed) && Number.isFinite(cost.medianTotal);
}

function groupBomItems(items) {
  const groups = new Map(bomGroupDefinitions.map((definition) => [definition.name, []]));
  items.forEach((item) => {
    if (!groups.has(item.group)) groups.set(item.group, []);
    groups.get(item.group).push(item);
  });
  return Array.from(groups.entries()).filter(([, groupItems]) => groupItems.length > 0);
}

function getComponentCostSummary(items) {
  return items.reduce(
    (summary, item) => {
      const cost = item.componentCost || {};
      const normal = Number(cost.medianTotal) || 0;
      const p90 = Number(cost.p90Total) || 0;
      return {
        priced: summary.priced + (cost.autoCostAllowed && normal > 0 ? 1 : 0),
        review: summary.review + (!cost.autoCostAllowed || normal <= 0 ? 1 : 0),
        normal: summary.normal + normal,
        p90: summary.p90 + p90,
      };
    },
    { priced: 0, review: 0, normal: 0, p90: 0 }
  );
}

function getBomGroupHeadingClass(groupName) {
  const normalized = String(groupName || "").toLowerCase();
  if (normalized.includes("pipe")) return "bom-heading-pipe";
  if (normalized.includes("fitting")) return "bom-heading-fitting";
  if (normalized.includes("flange")) return "bom-heading-flange";
  if (normalized.includes("valves")) return "bom-heading-valve";
  if (normalized.includes("bolt")) return "bom-heading-bolt";
  if (normalized.includes("gasket")) return "bom-heading-gasket";
  if (normalized.includes("trap") || normalized.includes("strainer")) return "bom-heading-trap";
  return "bom-heading-other";
}

function getServiceRateLibraryForMaterialCategory(category) {
  const normalizedCategory = String(category || "Unclassified").trim().toLowerCase();
  const libraries = globalThis.PIPING_SERVICE_COST_RATE_LIBRARIES || {};
  if (normalizedCategory === "carbon steel" || normalizedCategory === "unclassified") {
    return {
      code: "CS",
      label: normalizedCategory === "unclassified" ? "CS fallback - unclassified material" : "Carbon Steel",
      library: globalThis.PIPING_SERVICE_COST_RATES,
      isFallback: normalizedCategory === "unclassified",
    };
  }
  if (normalizedCategory.includes("austenitic stainless")) {
    return { code: "SS", label: "Austenitic Stainless Steel", library: libraries.SS, isFallback: false };
  }
  if (normalizedCategory.includes("alloy")) {
    return { code: "AS", label: "Alloy Steel", library: libraries.AS, isFallback: false };
  }
  return { code: "", label: "", library: null, isFallback: false };
}

function getFittingServiceJointCount(item, quantity) {
  const text = `${item.standardName || ""} ${item.item || ""}`.toUpperCase();
  if (/\b(TEE|T\.EQUAL|T\.RED|RED\.\s*TEE|EQUAL\.?\s*T)\b/.test(text)) return quantity * 3;
  if (/\b(CAP|WELDOLET|WELD[\s-]?OLET|OLET)\b/.test(text)) return quantity;
  // Elbows, reducers, couplings and other in-line fittings use two connection ends.
  return quantity * 2;
}

function isTeeFitting(item) {
  const text = `${item.standardName || ""} ${item.item || ""}`.toUpperCase();
  return /\b(TEE|T\.EQUAL|T\.RED|RED\.?\s*TEE|REDUCING\s+TEE|EQUAL\.?\s*T)\b/.test(text);
}

function isRtjValve(item) {
  const text = `${item.item || ""} ${item.standardName || ""} ${item.thickness || ""}`.toUpperCase();
  return /\bRTJ\b|RING\s*TYPE\s*JOINT/.test(text);
}

function buildValveServiceEstimate(item) {
  const quantity = parseBomNumber(item.quantity);
  // This weight is already calculated by the approved valve material-cost basis.
  const valveWeightKg = Number(item.componentCost?.valveWeightBasis);
  const rtj = isRtjValve(item);
  const serviceRateRsKg = rtj ? 36.64 : 30.53;

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return {
      item,
      scope: "Valve",
      status: "REVIEW_REQUIRED",
      reason: "Valve quantity is missing or invalid for valve service-cost calculation.",
    };
  }
  if (!Number.isFinite(valveWeightKg) || valveWeightKg <= 0) {
    return {
      item,
      scope: "Valve",
      status: "REVIEW_REQUIRED",
      reason: "Calculated valve weight is unavailable. Review the valve size, type and material-cost basis before pricing service.",
    };
  }

  const unitServiceCost = valveWeightKg * serviceRateRsKg;
  return {
    item,
    scope: "Valve",
    status: "READY",
    quantity,
    quantityLabel: "Qty.",
    valveWeightKg,
    valveServiceRateRsKg: serviceRateRsKg,
    valveServiceBasis: rtj ? "RTJ valve" : "Valve other than RTJ",
    costs: {
      erectionCost: 0,
      buttFabricationCost: 0,
      valveServiceCost: unitServiceCost * quantity,
      directServiceCost: unitServiceCost * quantity,
    },
    audit: {
      valveServiceSource: `IOCL-ME-SOR | ${rtj ? "RTJ valve" : "Valve other than RTJ"} | ${formatCurrency(serviceRateRsKg, 2)}/kg`,
    },
  };
}

function getServiceComponentInput(item) {
  const group = item.group || "";
  const nps = group === "Pipe Group" ? parseBomSize(item.size) : parseComponentSize(item.size, group);
  const thicknessMm = Number(item.componentCost?.thickness) || parseBomThickness(item.thickness, nps, "Sch/Thk/Rating");
  const quantity = parseBomNumber(item.quantity);

  if (group === "Pipe Group") {
    return {
      scope: "Pipe",
      nps,
      thicknessMm,
      lengthM: quantity,
      jointCount: null,
      quantity,
      quantityLabel: "Length m",
      jointBasis: "6 m stock-length proxy x 1.60 allowance",
    };
  }
  if (group === "Fitting Group") {
    return {
      scope: "Fitting",
      nps,
      thicknessMm,
      lengthM: 0,
      jointCount: Number.isFinite(quantity) && quantity > 0 ? getFittingServiceJointCount(item, quantity) : NaN,
      quantity,
      quantityLabel: "Qty.",
      jointBasis: "Connection-end proxy: Tee = 3; Cap/Weldolet = 1; other fittings = 2 per No.",
    };
  }
  if (group === "Flange Group") {
    return {
      scope: "Flange",
      nps,
      thicknessMm,
      lengthM: 0,
      jointCount: quantity,
      quantity,
      quantityLabel: "Qty.",
      jointBasis: "One flange joint per BOM No.",
    };
  }
  if (group === "Valves Group") {
    return {
      scope: "Valve",
      quantity,
      quantityLabel: "Qty.",
    };
  }
  return null;
}

function getPipingServiceEstimate() {
  const location = elements.serviceLocation?.value || "ABOVE_GROUND";
  const regulatoryClass = elements.serviceRegulatoryClass?.value || "NON_IBR";
  const serviceEngine = globalThis.PipingServiceCost;
  const serviceItems = bomGroupItems.filter((item) =>
    (item.group === "Pipe Group" && isMeterUom(item.uom)) ||
    item.group === "Fitting Group" ||
    item.group === "Flange Group" ||
    item.group === "Valves Group"
  );

  const rows = serviceItems.map((item) => {
    const componentInput = getServiceComponentInput(item);
    const { scope, nps, thicknessMm, lengthM, jointCount, quantity, quantityLabel, jointBasis } = componentInput || {};
    if (scope === "Valve") return buildValveServiceEstimate(item);
    const materialCategory = String(item.materialCategory || "").trim().toLowerCase();
    const rateLibrary = getServiceRateLibraryForMaterialCategory(materialCategory);
    if (!serviceEngine) {
      return { item, scope, status: "REVIEW_REQUIRED", reason: "Piping service calculation engine is unavailable." };
    }
    if (!rateLibrary.library) {
      return {
        item,
        scope,
        status: "REVIEW_REQUIRED",
        reason: `Approved IM and ID service rates are not available for ${formatCategoryHeading(item.materialCategory || "Unclassified")} piping.`,
      };
    }
    if (!Number.isFinite(nps) || nps <= 0) {
      return { item, scope, status: "REVIEW_REQUIRED", reason: `${scope || "Component"} size is missing or invalid for service-rate matching.` };
    }
    if (!Number.isFinite(thicknessMm) || thicknessMm <= 0) {
      return { item, scope, status: "REVIEW_REQUIRED", reason: `${scope || "Component"} thickness or schedule is missing for service-rate matching.` };
    }
    if (scope === "Pipe" && (!Number.isFinite(lengthM) || lengthM <= 0)) {
      return { item, scope, status: "REVIEW_REQUIRED", reason: "Pipe length in metres is missing or invalid." };
    }
    if (scope !== "Pipe" && (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(jointCount) || jointCount <= 0)) {
      return { item, scope, status: "REVIEW_REQUIRED", reason: `${scope || "Component"} quantity is missing or invalid for service-joint calculation.` };
    }

    const serviceInput = {
        nps,
        thicknessMm,
        lengthM,
        includeErection: scope === "Pipe",
        location,
        regulatoryClass,
        fabricationMode: scope === "Pipe" ? "STOCK_LENGTH_PROXY" : "MANUAL_JOINT_COUNT",
        stockLengthM: 6,
        lineCount: 1,
        jointAllowanceFactor: 1.6,
        straightButtWeldJoints: jointCount,
        escalationFactor: 1,
        contingencyPercent: 0,
      };
    let estimate = serviceEngine.calculatePipeService(serviceInput, rateLibrary.library);

    // Approved fallback for small equal/reducing tees: the service library has
    // a valid 0-10 mm fitting rate for sub-2 IN sizes, but no documented
    // 10-20 mm band below 2 IN. Keep the BOM thickness unchanged and use the
    // approved equal-tee service band only for service-rate matching.
    if (
      estimate.status !== "READY" &&
      scope === "Fitting" &&
      isTeeFitting(item) &&
      nps < 2 &&
      /No documented .* rate/i.test(estimate.reason || "")
    ) {
      const fallbackThicknessMm = 10;
      const fallbackEstimate = serviceEngine.calculatePipeService(
        { ...serviceInput, thicknessMm: fallbackThicknessMm },
        rateLibrary.library
      );
      if (fallbackEstimate.status === "READY") {
        estimate = {
          ...fallbackEstimate,
          audit: {
            ...fallbackEstimate.audit,
            warning: `${fallbackEstimate.audit?.warning || ""} Equal/reducing tee fallback used: sub-2 IN service rate matched to the approved 0-10 mm equal-tee band; BOM thickness remains ${formatNumber(thicknessMm, 2)} mm.`.trim(),
            serviceThicknessBasisMm: fallbackThicknessMm,
            serviceFallback: "Approved equal-tee service-rate fallback",
          },
        };
      }
    }
    return {
      item, scope, nps, thicknessMm, lengthM, quantity, quantityLabel, jointBasis,
      rateLibrary, useCarbonSteelFallback: rateLibrary.isFallback, ...estimate,
    };
  });

  const summary = rows.reduce(
    (summary, row) => {
      if (row.status !== "READY") {
        summary.review += 1;
        return summary;
      }
      summary.ready += 1;
      summary.totalErectionIm += row.quantities?.erectionQuantityIM || 0;
      summary.erection += row.costs.erectionCost;
      summary.welding += row.costs.buttFabricationCost;
      summary.totalProjectId += row.quantities?.buttWeldDiameterInch || 0;
      summary.valve += row.costs.valveServiceCost || 0;
      summary.direct += row.costs.directServiceCost;
      return summary;
    },
    { location, regulatoryClass, rows, ready: 0, review: 0, totalErectionIm: 0, erection: 0, welding: 0, valve: 0, totalProjectId: 0, reworkId: 0, rework: 0, direct: 0 }
  );
  // Rework/modification uses the same approved welding-rate mix as the uploaded BOM.
  // It is 15% of total eligible project welding ID and is kept visible for review.
  summary.reworkRatePercent = getReworkRatePercent();
  summary.reworkId = summary.totalProjectId * (summary.reworkRatePercent / 100);
  summary.rework = summary.welding * (summary.reworkRatePercent / 100);
  summary.pipeSupport = getPipeSupportEstimate();
  summary.civilSupport = getCivilSupportEstimate(summary.pipeSupport, getCivilSupportScope());
  summary.pipeSupportCivil = summary.civilSupport.cost;
  summary.insulation = getPipeInsulationEstimate();
  summary.painting = getPipePaintingEstimate();
  summary.pwht = getPwhtEstimate(rows);
  summary.additionalServices = additionalServiceItems.map((item) => ({ ...item, amount: item.quantity * item.rate }));
  summary.additionalServiceCost = summary.additionalServices.reduce((total, item) => total + item.amount, 0);
  summary.ready += summary.additionalServices.length;
  summary.direct += summary.rework + summary.pipeSupport.cost + summary.pipeSupportCivil + summary.insulation.cost + summary.painting.cost + summary.pwht.cost + summary.additionalServiceCost;
  return summary;
}

const pipeSupportRateRsPerMt = 150000;
const pipeSupportHeightM = 0.5;
const defaultReworkRatePercent = 15;
const civilSupportScopes = {
  INSIDE_BATTERY_LIMIT: { label: "Inside Unit Battery Limit", factor: 0.3 },
  OUTSIDE_BATTERY_LIMIT: { label: "Outside Unit Battery Limit", factor: 1 },
};

function getCivilSupportScope() {
  return civilSupportScopes[elements.serviceCivilSupportScope?.value] || civilSupportScopes.INSIDE_BATTERY_LIMIT;
}

// Preliminary above-ground civil foundation cost for one individual pipe support.
// The approved size curve is rounded upward to the next Rs 500 for budgeting.
function calculateCivilSupportCost(pipeSizeInch) {
  const diameterIn = Number(pipeSizeInch);
  if (!Number.isFinite(diameterIn) || diameterIn <= 0) {
    throw new Error("Pipe size must be a positive number.");
  }

  let cost;
  if (diameterIn <= 3) {
    cost = 6000;
  } else if (diameterIn <= 20) {
    cost = 6000 + ((17000 - 6000) / (20 - 3)) * (diameterIn - 3);
  } else if (diameterIn <= 48) {
    cost = 17000 + ((26000 - 17000) / (48 - 20)) * (diameterIn - 20);
  } else {
    cost = 26000 + ((26000 - 17000) / (48 - 20)) * (diameterIn - 48);
  }
  return Math.ceil(cost / 500) * 500;
}

function getCivilSupportEstimate(pipeSupportSummary, civilScope) {
  const rows = (pipeSupportSummary?.rows || []).map((row) => {
    if (row.status !== "READY") return { ...row, civilStatus: "REVIEW_REQUIRED", civilReason: row.reason };
    const baseCivilCostPerSupport = calculateCivilSupportCost(row.nps);
    const supportCount = row.support.totalSupportCount;
    return {
      ...row,
      civilStatus: "READY",
      supportCount,
      baseCivilCostPerSupport,
      civilCostPerSupport: baseCivilCostPerSupport * civilScope.factor,
      civilCost: supportCount * baseCivilCostPerSupport * civilScope.factor,
    };
  });
  return rows.reduce((summary, row) => {
    if (row.civilStatus !== "READY") {
      summary.review += 1;
      return summary;
    }
    summary.ready += 1;
    summary.supportCount += row.supportCount;
    summary.cost += row.civilCost;
    return summary;
  }, { rows, ready: 0, review: 0, supportCount: 0, cost: 0, scopeLabel: civilScope.label, factorPercent: civilScope.factor * 100 });
}

function getReworkRatePercent() {
  const enteredRate = Number(elements.serviceReworkRate?.value);
  return Number.isFinite(enteredRate) && enteredRate >= 0 ? enteredRate : defaultReworkRatePercent;
}
const insulationP50RateTable = [
  { temperatureC: 100, rateRsPerM2: 4578 },
  { temperatureC: 200, rateRsPerM2: 4881 },
  { temperatureC: 300, rateRsPerM2: 5082 },
  { temperatureC: 400, rateRsPerM2: 5587 },
  { temperatureC: 500, rateRsPerM2: 6118 },
];

function getInsulationP50Rate(temperatureC) {
  if (!Number.isFinite(temperatureC) || temperatureC < 100 || temperatureC > 500) return null;
  const exact = insulationP50RateTable.find((entry) => entry.temperatureC === temperatureC);
  if (exact) return { ...exact, method: "Table rate" };
  for (let index = 1; index < insulationP50RateTable.length; index += 1) {
    const lower = insulationP50RateTable[index - 1];
    const upper = insulationP50RateTable[index];
    if (temperatureC < upper.temperatureC) {
      const fraction = (temperatureC - lower.temperatureC) / (upper.temperatureC - lower.temperatureC);
      return {
        temperatureC,
        rateRsPerM2: lower.rateRsPerM2 + fraction * (upper.rateRsPerM2 - lower.rateRsPerM2),
        method: `Linear interpolation between ${lower.temperatureC}C and ${upper.temperatureC}C`,
      };
    }
  }
  return null;
}

function getPipeInsulationEstimate() {
  const rawTemperature = String(elements.designTemperature?.value || "").trim();
  const temperatureC = Number(rawTemperature);
  const rate = rawTemperature ? getInsulationP50Rate(temperatureC) : null;
  const pipeItems = bomGroupItems.filter(
    (item) => item.group === "Pipe Group" && isMeterUom(item.uom)
  );
  const rows = pipeItems.map((item) => {
    const input = getServiceComponentInput(item);
    const nps = Number(input?.nps);
    const thicknessMm = Number(input?.thicknessMm);
    const lengthM = Number(input?.lengthM);
    const odMm = odTable[nps];
    if (!rawTemperature) return { item, status: "NOT_CONFIGURED", reason: "Enter Design Temperature (100C to 500C) to calculate insulation cost." };
    if (!rate) return { item, status: "REVIEW_REQUIRED", reason: "Design Temperature must be within the approved 100C to 500C insulation-rate table." };
    if (!Number.isFinite(nps) || !Number.isFinite(odMm) || !Number.isFinite(thicknessMm) || !Number.isFinite(lengthM) || nps <= 0 || thicknessMm <= 0 || lengthM <= 0) {
      return { item, status: "REVIEW_REQUIRED", reason: "Pipe size, thickness, or length is missing for insulation surface-area calculation." };
    }
    const surfaceAreaM2 = Math.PI * (odMm / 1000) * lengthM;
    return { item, status: "READY", nps, odMm, thicknessMm, lengthM, surfaceAreaM2, rate, cost: surfaceAreaM2 * rate.rateRsPerM2 };
  });
  return rows.reduce(
    (summary, row) => {
      if (row.status !== "READY") {
        if (row.status === "REVIEW_REQUIRED") summary.review += 1;
        return summary;
      }
      summary.ready += 1;
      summary.surfaceAreaM2 += row.surfaceAreaM2;
      summary.cost += row.cost;
      return summary;
    },
    { rows, temperatureC: rawTemperature ? temperatureC : null, rate, ready: 0, review: 0, surfaceAreaM2: 0, cost: 0 }
  );
}

function isPaintableCarbonOrAlloyPipe(category) {
  const normalized = String(category || "").toLowerCase();
  return normalized.includes("carbon") || normalized.includes("low temp") || normalized.includes("alloy");
}

function getPipePaintingRate(temperatureC, scope) {
  if (scope === "UNINSULATED") {
    return {
      rateRsPerM2: 1010,
      system: "Inorganic zinc silicate + high-build epoxy + acrylic polyurethane",
      dft: "325 microns",
      method: "65C default uninsulated-piping P50 rate",
    };
  }
  if (!Number.isFinite(temperatureC) || temperatureC < 65 || temperatureC > 500) return null;
  if (temperatureC <= 200) {
    return { rateRsPerM2: 885, system: "Epoxy phenolic, two coats", dft: "250 microns", method: "CUI P50 rate for 65C to 200C" };
  }
  if (temperatureC < 300) {
    const rateRsPerM2 = 885 + ((temperatureC - 200) / 100) * (2220 - 885);
    return {
      rateRsPerM2,
      system: "Transition between epoxy phenolic and high-temperature CUI systems",
      dft: "250 to 300 microns",
      method: "Linear interpolation between 200C and 300C CUI P50 rates",
    };
  }
  return {
    rateRsPerM2: 2220,
    system: "Titanium-catalysed inorganic ceramic copolymer / high-temperature CUI system",
    dft: "300 microns",
    method: "CUI P50 rate for 300C to 500C",
  };
}

function getPipePaintingEstimate() {
  const rawTemperature = String(elements.designTemperature?.value || "").trim();
  // Blank temperature uses the uninsulated 65C default; an entered temperature uses the CUI table.
  const usesDefaultTemperature = !rawTemperature;
  const temperatureC = usesDefaultTemperature ? 65 : Number(rawTemperature);
  const scope = usesDefaultTemperature ? "UNINSULATED" : "UNDER_INSULATION";
  if (elements.servicePaintingScope) elements.servicePaintingScope.value = scope;
  const rate = getPipePaintingRate(temperatureC, scope);
  const pipeItems = bomGroupItems.filter((item) => item.group === "Pipe Group" && isMeterUom(item.uom));
  const rows = pipeItems.map((item) => {
    if (!isPaintableCarbonOrAlloyPipe(item.materialCategory)) {
      return { item, status: "EXCLUDED", reason: "Painting P50 table is approved only for CS, LTCS, and alloy-steel piping." };
    }
    const input = getServiceComponentInput(item);
    const nps = Number(input?.nps);
    const thicknessMm = Number(input?.thicknessMm);
    const lengthM = Number(input?.lengthM);
    const odMm = odTable[nps];
    if (!rate) return { item, status: "REVIEW_REQUIRED", reason: scope === "UNDER_INSULATION" ? "CUI painting requires a Design Temperature from 65C to 500C." : "Painting rate is unavailable." };
    if (!Number.isFinite(nps) || !Number.isFinite(odMm) || !Number.isFinite(thicknessMm) || !Number.isFinite(lengthM) || nps <= 0 || thicknessMm <= 0 || lengthM <= 0) {
      return { item, status: "REVIEW_REQUIRED", reason: "Pipe size, thickness, or length is missing for painting surface-area calculation." };
    }
    const surfaceAreaM2 = Math.PI * (odMm / 1000) * lengthM;
    return { item, status: "READY", nps, odMm, thicknessMm, lengthM, surfaceAreaM2, rate, cost: surfaceAreaM2 * rate.rateRsPerM2 };
  });
  return rows.reduce(
    (summary, row) => {
      if (row.status === "READY") {
        summary.ready += 1;
        summary.surfaceAreaM2 += row.surfaceAreaM2;
        summary.cost += row.cost;
      } else if (row.status === "REVIEW_REQUIRED") summary.review += 1;
      else if (row.status === "EXCLUDED") summary.excluded += 1;
      return summary;
    },
    { rows, scope, temperatureC, usesDefaultTemperature, rate, ready: 0, review: 0, excluded: 0, surfaceAreaM2: 0, cost: 0 }
  );
}

function normalizePwhtText(value) {
  return String(value || "").toUpperCase().replace(/[^A-Z0-9]+/g, "");
}

function isPwhtMaterialMatch(itemMaterial, ruleMaterials) {
  const item = normalizePwhtText(itemMaterial);
  return (ruleMaterials || []).some((ruleMaterial) => {
    const rule = normalizePwhtText(ruleMaterial);
    const pGrade = rule.match(/P(91|92|11|12|22|5|9)/);
    if (pGrade) return item.includes(`P${pGrade[1]}`) && item.includes("A335");
    if (rule.includes("API5L")) return item.includes("API5L") && (item.includes("GRADEB") || item.includes("GRB"));
    if (rule.includes("A106")) return item.includes("A106") && (item.includes("GRADEB") || item.includes("GRB"));
    if (rule.includes("A312")) {
      const stainlessGrade = rule.match(/TP(304L|304|316L|316|321)/);
      return item.includes("A312") && (!stainlessGrade || item.includes(`TP${stainlessGrade[1]}`));
    }
    return item.includes(rule) || rule.includes(item);
  });
}

function getPwhtRate(item) {
  const material = normalizePwhtText(item.material);
  const category = String(item.materialCategory || "").toLowerCase();
  if (/P91|P92/.test(material)) return { rateRsPerId: 715, factor: 1.75, basis: "Creep-strength enhanced steel P91/P92" };
  if (/P5|P9/.test(material)) return { rateRsPerId: 613, factor: 1.5, basis: "High alloy Cr-Mo P5/P9" };
  if (category.includes("austenitic stainless")) return { rateRsPerId: 559, factor: 1.37, basis: "Stainless steel uses alloy-steel PWHT rate" };
  if (/P11|P12|P22/.test(material) || category.includes("alloy")) return { rateRsPerId: 559, factor: 1.37, basis: "Low alloy steel P11/P12/P22" };
  return { rateRsPerId: 408, factor: 1, basis: category.includes("low temp") ? "LTCS uses carbon-steel PWHT rate" : "Carbon-steel PWHT rate" };
}

function getPwhtEstimate(serviceRows) {
  const rules = pwhtRulesData?.categories
    ? Object.values(pwhtRulesData.categories).flat()
    : [];
  const rows = serviceRows.filter((row) => row.scope === "Pipe").map((row) => {
    // Pipe Service has already parsed the BOM dimensions and calculated the
    // joint basis. PWHT reuses those values rather than parsing the BOM again.
    const nps = Number(row.nps);
    const thicknessMm = Number(row.thicknessMm);
    const lengthM = Number(row.lengthM);
    if (!Number.isFinite(nps) || nps <= 0 || !Number.isFinite(thicknessMm) || thicknessMm <= 0 || !Number.isFinite(lengthM) || lengthM <= 0) {
      return { item: row.item, status: "REVIEW_REQUIRED", reason: "Pipe size, wall thickness, or length is unavailable for PWHT calculation." };
    }
    const joints = Number(row.quantities?.straightButtWeldJoints) || Math.ceil((lengthM / 6) * 1.6);
    const pwhtId = nps * joints;
    const pipeServiceValues = { item: row.item, nps, thicknessMm, joints, pwhtId };
    if (!rules.length) return { ...pipeServiceValues, status: "REVIEW_REQUIRED", reason: "NRL PWHT rules are not loaded." };
    if (!Number.isFinite(pwhtId) || pwhtId <= 0) {
      return { ...pipeServiceValues, status: "REVIEW_REQUIRED", reason: "PWHT inch-diameter quantity is unavailable." };
    }
    const pipeClass = normalizePwhtText(row.item.pipeClass);
    if (!pipeClass) return { ...pipeServiceValues, status: "REVIEW_REQUIRED", reason: "Piping Class / PMS Class is required to confirm PWHT applicability." };
    const matchedRule = rules.find((rule) => normalizePwhtText(rule.pipe_class) === pipeClass && isPwhtMaterialMatch(row.item.material, rule.pipe_material));
    if (!matchedRule) return { ...pipeServiceValues, status: "NOT_APPLICABLE", reason: "No PWHT-required rule matched this Piping Class and material." };
    const rule = matchedRule.rule || {};
    let pwhtRequired = Boolean(rule.pwht_required);
    if (rule.type === "WALL_THICKNESS") {
      pwhtRequired = rule.operator === ">=" ? thicknessMm >= Number(rule.threshold_mm) : thicknessMm > Number(rule.threshold_mm);
    }
    if (!pwhtRequired) return { ...pipeServiceValues, status: "NOT_APPLICABLE", reason: `PWHT threshold not reached (${rule.operator || "rule"} ${rule.threshold_mm || ""} mm).`, matchedRule };
    const rate = getPwhtRate(row.item);
    return { ...pipeServiceValues, status: "READY", rate, matchedRule, cost: pwhtId * rate.rateRsPerId };
  });
  return rows.reduce((summary, row) => {
    if (row.status === "READY") { summary.ready += 1; summary.id += row.pwhtId; summary.cost += row.cost; }
    else if (row.status === "REVIEW_REQUIRED") summary.review += 1;
    else summary.notApplicable += 1;
    return summary;
  }, { rows, ready: 0, review: 0, notApplicable: 0, id: 0, cost: 0 });
}

function getPipeSupportEstimate() {
  const calculator = globalThis.PipeSupportStructural;
  const pipeItems = bomGroupItems.filter(
    (item) => item.group === "Pipe Group" && isMeterUom(item.uom)
  );
  const rows = pipeItems.map((item) => {
    const input = getServiceComponentInput(item);
    const nps = Number(input?.nps);
    const thicknessMm = Number(input?.thicknessMm);
    const lengthM = Number(input?.lengthM);
    const odMm = odTable[nps];
    if (!calculator) {
      return { item, status: "REVIEW_REQUIRED", reason: "Pipe support calculator is unavailable." };
    }
    if (!Number.isFinite(nps) || !Number.isFinite(odMm) || !Number.isFinite(thicknessMm) || !Number.isFinite(lengthM) || nps <= 0 || thicknessMm <= 0 || lengthM <= 0) {
      return { item, status: "REVIEW_REQUIRED", reason: "Pipe size, thickness, or length is missing for support-weight calculation." };
    }
    try {
      const support = calculator.calculate({
        npsIn: nps,
        odMm,
        wallThicknessMm: thicknessMm,
        pipeLengthM: lengthM,
        operatingFluidDensityKgM3: 0,
        insulationWeightKgM: 0,
        otherLineWeightKgM: 0,
        supportHeightM: pipeSupportHeightM,
        serviceType: "ambient_liquid",
        supportType: "rest",
        installationMode: "individual_stanchion",
        routeComplexity: "normal",
        includeEndSupport: true,
        additionalSupportCount: 0,
      });
      return { item, status: "READY", nps, thicknessMm, lengthM, support, cost: support.structuralQuantityMT * pipeSupportRateRsPerMt };
    } catch (error) {
      return { item, status: "REVIEW_REQUIRED", reason: error.message || "Pipe support weight could not be calculated." };
    }
  });
  return rows.reduce(
    (summary, row) => {
      if (row.status !== "READY") {
        summary.review += 1;
        return summary;
      }
      summary.ready += 1;
      summary.supportCount += row.support.totalSupportCount;
      summary.weightKg += row.support.structuralQuantityKg;
      summary.weightMt += row.support.structuralQuantityMT;
      summary.cost += row.cost;
      return summary;
    },
    { rows, ready: 0, review: 0, supportCount: 0, weightKg: 0, weightMt: 0, cost: 0 }
  );
}

function getServicePartBRows(summary) {
  const scopeTotals = (scope) => {
    const rows = summary.rows.filter((row) => row.scope === scope);
    const pricedRows = rows.filter((row) => row.status === "READY");
    return {
      rows,
      review: rows.length - pricedRows.length,
      weldingId: pricedRows.reduce((total, row) => total + (Number(row.quantities?.buttWeldDiameterInch) || 0), 0),
      weldingCost: pricedRows.reduce((total, row) => total + (Number(row.costs?.buttFabricationCost) || 0), 0),
      erectionIm: pricedRows.reduce((total, row) => total + (Number(row.quantities?.erectionQuantityIM) || 0), 0),
      erectionCost: pricedRows.reduce((total, row) => total + (Number(row.costs?.erectionCost) || 0), 0),
      valveWeightKg: pricedRows.reduce((total, row) => total + ((Number(row.valveWeightKg) || 0) * (Number(row.quantity) || 0)), 0),
      valveCost: pricedRows.reduce((total, row) => total + (Number(row.costs?.valveServiceCost) || 0), 0),
    };
  };
  const pipe = scopeTotals("Pipe");
  const fitting = scopeTotals("Fitting");
  const flange = scopeTotals("Flange");
  const valve = scopeTotals("Valve");
  const statusFor = (quantity, review) => review > 0 ? "REVIEW REQUIRED" : quantity > 0 ? "READY" : "NOT APPLICABLE";
  const line = (slNo, shortDescription, activityDescription, unit, quantity, amount, source, review = 0) => ({
    slNo,
    shortDescription,
    activityDescription,
    unit,
    quantity,
    rate: quantity > 0 ? amount / quantity : 0,
    amount,
    source,
    status: statusFor(quantity, review),
  });

  const calculatedRows = [
    line(1, "Piping Spool Fabrication and Erection", "Fabrication, cutting, edge preparation, fit-up, welding, handling, transportation, erection, alignment, NDT, pressure testing or hydrostatic testing, flushing and reinstatement, as applicable.", "ID", pipe.weldingId, pipe.weldingCost, "Approved material-category ID rate library", pipe.review),
    line(2, "Installation of Pipe Fittings", "Cutting, fit-up, welding and installation of elbows, tees, reducers, caps, couplings and other piping fittings, including alignment, NDT and pressure testing or hydrostatic testing, as applicable.", "ID", fitting.weldingId, fitting.weldingCost, "Matching-pipe ID rate x fitting connection-end proxy", fitting.review),
    line(3, "Installation of Flanges and Flanged Joints", "Fabrication, fit-up, welding and erection of flanges, including alignment, NDT, pressure testing, gasket installation, bolting, tightening and final box-up of flanged joints.", "ID", flange.weldingId, flange.weldingCost, "Matching-pipe ID rate x 1 joint per flange", flange.review),
    line(4, "Erection of Pipes Other Than Fabricated Spools", "Handling, transportation, lifting, positioning, erection, alignment and securing of straight pipes or piping components supplied as loose items, excluding shop-fabricated or field-fabricated spools.", "IM", pipe.erectionIm, pipe.erectionCost, "Approved material-category IM rate library", pipe.review),
    line(5, "Valve Installation", "Transportation, handling, lifting, positioning, erection and assembly of valves, including gasket installation, bolting, alignment, PMI, functional testing, pressure testing and final box-up, as applicable.", "kg", valve.valveWeightKg, valve.valveCost, "IOCL-ME-SOR: RTJ / non-RTJ valve kg rate", valve.review),
    line(6, "Piping Rework and Modification", "Dismantling, cutting, removal, re-routing, modification and reinstallation of existing piping, fittings, flanges, valves and supports, including edge preparation, fit-up, welding, NDT, PWHT, pressure testing, touch-up painting and reinstatement, as applicable.", "ID", summary.reworkId, summary.rework, `${formatNumber(summary.reworkRatePercent, 2)}% of eligible project welding ID and matched welding cost`),
    line(7, "Pipe Structural Support Works", "Supply, fabrication, cutting, drilling, welding, surface preparation, priming, transportation, erection, alignment and installation of structural steel pipe supports, including clamps, guides, shoes, brackets, stools and associated hardware.", "MT", summary.pipeSupport.weightMt, summary.pipeSupport.cost, "NRL LPP/WO adopted rate: Rs 1,50,000/MT", summary.pipeSupport.review),
    line(8, "Civil Works for Pipe Supports", "Excavation, PCC, RCC, reinforcement, formwork, foundation construction, installation of anchor bolts or embedded plates, non-shrink grouting, curing, backfilling, compaction and disposal of surplus excavated material.", "Nos.", summary.civilSupport.supportCount, summary.pipeSupportCivil, `${summary.civilSupport.scopeLabel} (${formatNumber(summary.civilSupport.factorPercent, 0)}%) x 300 mm above-ground, size-based civil cost per support: 3 IN = Rs 6,000; 20 IN = Rs 17,000; 48 IN = Rs 26,000; linear interpolation and upward rounding to Rs 500.`, summary.civilSupport.review),
    line(9, "Piping Painting and Identification Works", "Supply of all materials and execution of surface preparation, abrasive blasting, primer application, intermediate and finish coats, touch-up painting, colour coding, flow-direction marking and line identification, as per the approved painting specification.", "m2", summary.painting.surfaceAreaM2, summary.painting.cost, summary.painting.rate ? `${summary.painting.rate.method} | ${summary.painting.rate.dft}` : "Painting rate requires review", summary.painting.review),
    line(10, "Piping Insulation Works", "Supply and installation of insulation material, cladding, bands, fasteners, sealants and accessories, including surface preparation, joint sealing, weatherproofing and completion of insulation at fittings, valves, flanges and supports.", "m2", summary.insulation.surfaceAreaM2, summary.insulation.cost, summary.insulation.rate ? summary.insulation.rate.method : "Insulation rate requires Design Temperature", summary.insulation.review),
    line(11, "Post-Weld Heat Treatment", "Carrying out PWHT of weld joints, including heating arrangement, thermocouple installation, controlled heating, soaking and cooling, temperature monitoring and chart recording, hardness testing and submission of PWHT reports, as applicable.", "ID", summary.pwht.id, summary.pwht.cost, "NRL PWHT rule and material-category ID rate", summary.pwht.review),
  ];
  const additionalRows = (summary.additionalServices || []).map((item, index) => ({
    slNo: calculatedRows.length + index + 1,
    shortDescription: item.description,
    activityDescription: item.details || "User-entered additional service.",
    unit: item.unit,
    quantity: item.quantity,
    rate: item.rate,
    amount: item.amount,
    source: "User-entered additional service rate",
    status: "READY",
    isUserEntered: true,
    additionalServiceId: item.id,
  }));
  return [...calculatedRows, ...additionalRows];
}

function addAdditionalServiceItem() {
  const form = elements.servicePartBWrap?.querySelector("#additional-service-form");
  if (!form) return;
  const description = form.querySelector("[name='description']")?.value.trim() || "";
  const details = form.querySelector("[name='details']")?.value.trim() || "";
  const unit = form.querySelector("[name='unit']")?.value.trim() || "";
  const quantity = Number(form.querySelector("[name='quantity']")?.value);
  const rate = Number(form.querySelector("[name='rate']")?.value);
  if (!description || !unit || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(rate) || rate <= 0) {
    window.alert("Enter service description, unit, a quantity greater than zero, and a valid rate.");
    return;
  }
  additionalServiceItems.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    description,
    details,
    unit,
    quantity,
    rate,
  });
  renderPipingServiceCost();
}

function removeAdditionalServiceItem(id) {
  const index = additionalServiceItems.findIndex((item) => item.id === id);
  if (index >= 0) {
    additionalServiceItems.splice(index, 1);
    renderPipingServiceCost();
  }
}

function renderPipingServicePartB(summary) {
  if (!elements.servicePartBWrap) return;
  const rows = getServicePartBRows(summary);
  const reviewCount = rows.filter((row) => row.status === "REVIEW REQUIRED").length;
  elements.servicePartBWrap.innerHTML = `
    <article class="service-part-b-card">
      <div class="category-table-title">
        <div>
          <h3>Part B - Service Schedule-of-Rates Detail</h3>
          <p>Work-package quantity, rate, cost basis and review status | ${rows.length - reviewCount} priced work packages | ${reviewCount} need review | <span class="category-summary-rs">${formatCurrency(summary.direct, 2)}</span> direct service cost</p>
        </div>
        <span class="source-pill">Schedule-of-rates basis</span>
      </div>
      <div class="table-wrap">
        <table class="bom-group-table service-part-b-table">
          <thead><tr><th>Sl. No.</th><th>Short Description</th><th class="text-column">Job Description / Activities</th><th>Unit</th><th>Quantity</th><th>Rate</th><th>Amount</th><th class="text-column">Rate Source / Note</th><th>Status</th></tr></thead>
          <tbody>${rows.map((row) => `<tr class="${row.status === "REVIEW REQUIRED" ? "review-row" : ""}${row.isUserEntered ? " user-entered-service-row" : ""}"><td>${row.slNo}</td><td>${escapeHtml(row.shortDescription)}</td><td class="text-column">${escapeHtml(row.activityDescription)}</td><td>${row.unit}</td><td>${row.quantity > 0 ? formatNumber(row.quantity, row.unit === "MT" ? 3 : 2) : "-"}</td><td>${row.rate > 0 ? formatCurrency(row.rate, 2) : "-"}</td><td>${row.amount > 0 ? formatCurrency(row.amount, 2) : "-"}</td><td class="text-column">${escapeHtml(row.source)}</td><td>${row.status === "REVIEW REQUIRED" ? "Review required" : row.isUserEntered ? "User entered" : row.status === "READY" ? "Ready" : "Not applicable"}${row.isUserEntered ? `<button class="additional-service-remove" type="button" data-remove-additional-service="${row.additionalServiceId}" aria-label="Remove ${escapeHtml(row.shortDescription)}" title="Remove this additional service">x</button>` : ""}</td></tr>`).join("")}</tbody>
          <tfoot><tr><td colspan="6">Direct Service Cost Total</td><td>${formatCurrency(summary.direct, 2)}</td><td colspan="2">Taxes, escalation and contingency excluded</td></tr></tfoot>
        </table>
      </div>
      <form class="additional-service-form" id="additional-service-form">
        <label><span>Additional service</span><input name="description" type="text" placeholder="e.g. Temporary piping work" required /></label>
        <label><span>Job Description</span><input name="details" type="text" placeholder="Describe the service activity" /></label>
        <label><span>Quantity</span><input name="quantity" type="number" min="0.01" step="0.01" placeholder="0" required /></label>
        <label><span>Unit</span><input name="unit" type="text" placeholder="LS, Nos., m2" required /></label>
        <label><span>Rate Rs/unit</span><input name="rate" type="number" min="0.01" step="0.01" placeholder="0.00" required /></label>
        <button class="additional-service-add" type="submit" title="Add service">+</button>
      </form>
    </article>`;
}

function renderPipingServiceCost() {
  if (!elements.serviceCostTableWrap) return;
  const summary = getPipingServiceEstimate();
  elements.serviceReadyCount.textContent = summary.ready;
  elements.serviceReviewCount.textContent = summary.review;
  elements.serviceErectionQuantity.textContent = formatNumber(summary.totalErectionIm, 2);
  elements.serviceWeldingQuantity.textContent = formatNumber(summary.totalProjectId, 2);
  elements.serviceErectionTotal.textContent = formatCurrency(summary.erection, 2);
  elements.serviceWeldingTotal.textContent = formatCurrency(summary.welding, 2);
  elements.serviceValveTotal.textContent = formatCurrency(summary.valve, 2);
  elements.serviceReworkTotal.textContent = formatCurrency(summary.rework, 2);
  elements.serviceReworkId.textContent = `${formatNumber(summary.reworkId, 2)} ID (${formatNumber(summary.reworkRatePercent, 2)}%)`;
  elements.serviceSupportTotal.textContent = formatCurrency(summary.pipeSupport.cost, 2);
  elements.serviceSupportMt.textContent = `${formatNumber(summary.pipeSupport.weightMt, 3)} MT @ ${formatCurrency(pipeSupportRateRsPerMt, 0)}/MT`;
  elements.serviceSupportCivilTotal.textContent = formatCurrency(summary.pipeSupportCivil, 2);
  elements.serviceSupportCivilBasis.textContent = `${summary.civilSupport.scopeLabel} (${formatNumber(summary.civilSupport.factorPercent, 0)}%) | ${formatNumber(summary.civilSupport.supportCount, 0)} supports`;
  elements.serviceInsulationTotal.textContent = formatCurrency(summary.insulation.cost, 2);
  elements.serviceInsulationBasis.textContent = summary.insulation.rate
    ? `${formatNumber(summary.insulation.surfaceAreaM2, 2)} m2 @ ${formatCurrency(summary.insulation.rate.rateRsPerM2, 2)}/m2 (${formatNumber(summary.insulation.temperatureC, 0)}C)`
    : "Enter Design Temperature (100C to 500C)";
  elements.servicePaintingTotal.textContent = formatCurrency(summary.painting.cost, 2);
  elements.servicePaintingBasis.textContent = summary.painting.rate
    ? `${formatNumber(summary.painting.surfaceAreaM2, 2)} m2 @ ${formatCurrency(summary.painting.rate.rateRsPerM2, 2)}/m2 | ${summary.painting.usesDefaultTemperature ? "65C default" : `${formatNumber(summary.painting.temperatureC, 0)}C`} | ${summary.painting.rate.dft}`
    : "Review Design Temperature / painting system";
  elements.servicePwhtTotal.textContent = formatCurrency(summary.pwht.cost, 2);
  elements.servicePwhtBasis.textContent = `${summary.pwht.ready} applicable | ${formatNumber(summary.pwht.id, 2)} ID | ${summary.pwht.review} review`;
  elements.serviceDirectTotal.textContent = formatCurrency(summary.direct, 2);
  elements.serviceCostTotalPill.textContent = `Direct service cost: ${formatCurrency(summary.direct, 2)}`;
  renderPipingServicePartB(summary);

  if (!summary.rows.length) {
    elements.serviceCostTableWrap.innerHTML =
      '<p class="empty-note">Upload a BOM with pipe, fitting, flange, or valve rows to calculate supported service cost.</p>';
    return summary;
  }

  const rowsByScopeAndCategory = summary.rows.reduce((groups, row) => {
    const scope = row.scope || "Pipe";
    const category = row.item.materialCategory || "Unclassified";
    if (!groups.has(scope)) groups.set(scope, new Map());
    if (!groups.get(scope).has(category)) groups.get(scope).set(category, []);
    groups.get(scope).get(category).push(row);
    return groups;
  }, new Map());

  const scopeOrder = ["Pipe", "Fitting", "Flange", "Valve"];
  elements.serviceCostTableWrap.innerHTML = scopeOrder
    .filter((scope) => rowsByScopeAndCategory.has(scope))
    .map((scope) => `<section class="service-scope-section"><h3>${escapeHtml(scope)} Service</h3>${Array.from(rowsByScopeAndCategory.get(scope).entries())
      .sort(([firstCategory], [secondCategory]) => firstCategory.localeCompare(secondCategory))
      .map(([category, categoryRows]) => {
      const categoryReady = categoryRows.filter((row) => row.status === "READY");
      const categoryReview = categoryRows.length - categoryReady.length;
      const categoryDirect = categoryReady.reduce(
        (total, row) => total + (Number(row.costs?.directServiceCost) || 0),
        0
      );
      const tableHeaders =
        scope === "Pipe"
          ? ["Component", "Size", "Thk mm", "BOM Material", "Length m", "Est. Joints", "Erection IM", "Welding ID", "Erection Rate", "Welding Rate", "Erection Cost", "Welding Cost", "Direct Service Cost", "Status / Rate Source"]
          : scope === "Valve"
          ? ["Component", "Size", "BOM Material", "Qty.", "Valve Wt kg", "Service Rate", "Valve Service Cost", "Direct Service Cost", "Status / Rate Source"]
          : ["Component", "Size", "Thk mm", "BOM Material", "Qty.", "Est. Joints", "Welding ID", "Welding Rate", "Welding Cost", "Direct Service Cost", "Status / Rate Source"];
      const rowCells = (row) => {
        const isReady = row.status === "READY";
        const source = isReady
          ? [row.audit?.erectionSource, row.audit?.buttFabricationSource, row.audit?.valveServiceSource].filter(Boolean).join(" | ")
          : row.reason || "Review required.";
        const component = `<td>${escapeHtml(row.item.item || row.scope || "Component")}</td>`;
        const size = `<td>${isReady && scope !== "Valve" ? `${formatPipeSize(row.nps)} IN` : escapeHtml(row.item.size || "-")}</td>`;
        const material = `<td class="text-column">${escapeHtml(row.item.material || "Unclassified")}</td>`;
        const status = `<td>${isReady ? escapeHtml(row.scope === "Valve" ? row.audit?.valveServiceSource || "IOCL-ME-SOR" : `${row.rateLibrary?.label || "Ready"} | ${source}`) : `Review - ${escapeHtml(source)}`}</td>`;
        if (scope === "Valve") {
          return `${component}${size}${material}
            <td>${isReady ? `${formatNumber(row.quantity, 2)} ${escapeHtml(row.item.uom || "Nos.")}` : escapeHtml(row.item.quantity || "-")}</td>
            <td>${isReady ? formatNumber(row.valveWeightKg, 2) : "Review"}</td>
            <td>${isReady ? `${formatCurrency(row.valveServiceRateRsKg, 2)}/kg` : "Review"}</td>
            <td>${isReady ? formatCurrency(row.costs.valveServiceCost, 2) : "Review"}</td>
            <td>${isReady ? formatCurrency(row.costs.directServiceCost, 2) : "Review"}</td>${status}`;
        }
        const thickness = `<td>${isReady ? formatNumber(row.thicknessMm, 2) : "Review"}</td>`;
        const quantity = `<td>${isReady ? `${formatNumber(scope === "Pipe" ? row.lengthM : row.quantity, 2)} ${escapeHtml(scope === "Pipe" ? "m" : row.item.uom || "Nos.")}` : escapeHtml(row.item.quantity || "-")}</td>`;
        const joints = `<td>${isReady ? formatNumber(row.quantities.straightButtWeldJoints, 0) : "Review"}</td>`;
        const weldingId = `<td>${isReady ? formatNumber(row.quantities.buttWeldDiameterInch, 2) : "Review"}</td>`;
        const weldingRate = `<td>${isReady ? formatCurrency(row.rates.buttFabricationRsPerID, 2) : "Review"}</td>`;
        const weldingCost = `<td>${isReady ? formatCurrency(row.costs.buttFabricationCost, 2) : "Review"}</td>`;
        if (scope !== "Pipe") return `${component}${size}${thickness}${material}${quantity}${joints}${weldingId}${weldingRate}${weldingCost}<td>${isReady ? formatCurrency(row.costs.directServiceCost, 2) : "Review"}</td>${status}`;
        return `${component}${size}${thickness}${material}${quantity}${joints}
          <td>${isReady ? formatNumber(row.quantities.erectionQuantityIM, 2) : "Review"}</td>${weldingId}
          <td>${isReady ? formatCurrency(row.rates.erectionRsPerIM, 2) : "Review"}</td>${weldingRate}
          <td>${isReady ? formatCurrency(row.costs.erectionCost, 2) : "Review"}</td>${weldingCost}
          <td>${isReady ? formatCurrency(row.costs.directServiceCost, 2) : "Review"}</td>${status}`;
      };
      return `
        <article class="category-table-card service-category-card">
          <div class="category-table-title">
            <div>
              <h4 class="${getCategoryHeadingClass(category)}">${escapeHtml(formatCategoryHeading(category))}</h4>
              <p>${categoryRows.length} ${categoryRows.length === 1 ? "line" : "lines"} | ${categoryReady.length} priced | ${categoryReview} review | <span class="category-summary-rs">${formatCurrency(categoryDirect, 2)}</span> direct service cost</p>
            </div>
          </div>
          <div class="table-wrap">
            <table class="bom-group-table service-cost-table">
              <thead>
                <tr>${tableHeaders.map((header) => `<th${header === "BOM Material" ? ' class="text-column"' : ""}>${header}</th>`).join("")}</tr>
              </thead>
              <tbody>
                ${categoryRows.map((row) => {
                  const isReady = row.status === "READY";
                  return `
                    <tr class="${isReady ? "" : "review-row"}">
                      ${rowCells(row)}
                    </tr>`;
                }).join("")}
              </tbody>
            </table>
          </div>
        </article>`;
      }).join("")}</section>`)
    .join("");
  if (elements.serviceSupportTableWrap) {
    const supportSummary = summary.pipeSupport;
    elements.serviceSupportTableWrap.innerHTML = supportSummary.rows.length
      ? `<article class="category-table-card service-category-card pipe-support-card">
          <div class="category-table-title"><div><h3>Pipe Support Structural Cost</h3><p>${supportSummary.ready} priced | ${supportSummary.review} review | ${formatNumber(supportSummary.supportCount, 0)} supports | <span class="category-summary-rs">${formatNumber(supportSummary.weightMt, 3)} MT</span> structural steel | ${formatCurrency(supportSummary.cost, 2)}</p></div></div>
          <div class="table-wrap"><table class="bom-group-table service-cost-table pipe-support-table"><thead><tr><th>Pipe Size</th><th>Thk mm</th><th>Length m</th><th>Supports</th><th>Support Steel MT</th><th>Rate Rs/MT</th><th>Support Cost</th><th>Status / Basis</th></tr></thead><tbody>${supportSummary.rows.map((row) => row.status === "READY" ? `<tr><td>${formatPipeSize(row.nps)} IN</td><td>${formatNumber(row.thicknessMm, 2)}</td><td>${formatNumber(row.lengthM, 2)}</td><td>${formatNumber(row.support.totalSupportCount, 0)}</td><td>${formatNumber(row.support.structuralQuantityMT, 3)}</td><td>${formatCurrency(pipeSupportRateRsPerMt, 0)}</td><td>${formatCurrency(row.cost, 2)}</td><td>${formatNumber(row.support.adoptedSupportSpacingM, 2)} m max span | ${formatNumber(row.support.pipeMetalWeightKgM, 2)} kg/m x ${formatNumber(pipeSupportHeightM, 2)} m per support</td></tr>` : `<tr class="review-row"><td>${escapeHtml(row.item.size || "-")}</td><td>Review</td><td>${escapeHtml(row.item.quantity || "-")}</td><td>Review</td><td>Review</td><td>Review</td><td>Review</td><td>Review - ${escapeHtml(row.reason)}</td></tr>`).join("")}</tbody></table></div>
        </article>`
      : '<p class="empty-note">Upload pipe rows measured in metres to calculate structural support weight.</p>';
  }
  if (elements.serviceInsulationTableWrap) {
    const insulation = summary.insulation;
    elements.serviceInsulationTableWrap.innerHTML = insulation.rows.length
      ? `<article class="category-table-card service-category-card pipe-insulation-card">
          <div class="category-table-title"><div><h3>Pipe Insulation Cost</h3><p>${insulation.ready} priced | ${insulation.review} review | <span class="category-summary-rs">${formatNumber(insulation.surfaceAreaM2, 2)} m2</span> outside surface area | ${insulation.rate ? `${formatNumber(insulation.temperatureC, 0)}C at ${formatCurrency(insulation.rate.rateRsPerM2, 2)}/m2` : "temperature required"} | ${formatCurrency(insulation.cost, 2)}</p></div></div>
          <div class="table-wrap"><table class="bom-group-table service-cost-table pipe-insulation-table"><thead><tr><th>Pipe Size</th><th>OD mm</th><th>Length m</th><th>Surface Area m2</th><th>P50 Rate Rs/m2</th><th>Insulation Cost</th><th>Status / Basis</th></tr></thead><tbody>${insulation.rows.map((row) => row.status === "READY" ? `<tr><td>${formatPipeSize(row.nps)} IN</td><td>${formatNumber(row.odMm, 2)}</td><td>${formatNumber(row.lengthM, 2)}</td><td>${formatNumber(row.surfaceAreaM2, 2)}</td><td>${formatCurrency(row.rate.rateRsPerM2, 2)}</td><td>${formatCurrency(row.cost, 2)}</td><td>${escapeHtml(row.rate.method)} | Design Temperature ${formatNumber(insulation.temperatureC, 0)}C</td></tr>` : `<tr class="review-row"><td>${escapeHtml(row.item.size || "-")}</td><td>Review</td><td>${escapeHtml(row.item.quantity || "-")}</td><td>Review</td><td>Review</td><td>Review</td><td>Review - ${escapeHtml(row.reason)}</td></tr>`).join("")}</tbody></table></div>
        </article>`
      : '<p class="empty-note">Upload pipe rows measured in metres to calculate insulation surface area.</p>';
  }
  if (elements.servicePaintingTableWrap) {
    const painting = summary.painting;
    elements.servicePaintingTableWrap.innerHTML = painting.rows.length
      ? `<article class="category-table-card service-category-card pipe-painting-card">
          <div class="category-table-title"><div><h3>Pipe Painting Cost</h3><p>${painting.ready} priced | ${painting.review} review | ${painting.excluded} excluded | <span class="category-summary-rs">${formatNumber(painting.surfaceAreaM2, 2)} m2</span> surface area | ${painting.rate ? `${escapeHtml(painting.rate.method)} at ${formatCurrency(painting.rate.rateRsPerM2, 2)}/m2 (${painting.usesDefaultTemperature ? "65C default" : `${formatNumber(painting.temperatureC, 0)}C`})` : "rate review required"} | ${formatCurrency(painting.cost, 2)}</p></div></div>
          <div class="table-wrap"><table class="bom-group-table service-cost-table pipe-painting-table"><thead><tr><th>Pipe Size</th><th>OD mm</th><th>Length m</th><th>Surface Area m2</th><th>Painting System</th><th>DFT</th><th>P50 Rate Rs/m2</th><th>Painting Cost</th><th>Status / Basis</th></tr></thead><tbody>${painting.rows.map((row) => row.status === "READY" ? `<tr><td>${formatPipeSize(row.nps)} IN</td><td>${formatNumber(row.odMm, 2)}</td><td>${formatNumber(row.lengthM, 2)}</td><td>${formatNumber(row.surfaceAreaM2, 2)}</td><td class="text-column">${escapeHtml(row.rate.system)}</td><td>${escapeHtml(row.rate.dft)}</td><td>${formatCurrency(row.rate.rateRsPerM2, 2)}</td><td>${formatCurrency(row.cost, 2)}</td><td>${escapeHtml(row.rate.method)} | ${painting.usesDefaultTemperature ? "65C default" : `${formatNumber(painting.temperatureC, 0)}C`}</td></tr>` : `<tr class="${row.status === "EXCLUDED" ? "" : "review-row"}"><td>${escapeHtml(row.item.size || "-")}</td><td>-</td><td>${escapeHtml(row.item.quantity || "-")}</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>${row.status === "EXCLUDED" ? "Excluded -" : "Review -"} ${escapeHtml(row.reason)}</td></tr>`).join("")}</tbody></table></div>
        </article>`
      : '<p class="empty-note">Upload CS, LTCS, or alloy-steel pipe rows measured in metres to calculate painting cost.</p>';
  }
  if (elements.servicePwhtTableWrap) {
    const pwht = summary.pwht;
    elements.servicePwhtTableWrap.innerHTML = pwht.rows.length
      ? `<article class="category-table-card service-category-card pipe-pwht-card"><div class="category-table-title"><div><h3>PWHT Cost (If Applicable)</h3><p>${pwht.ready} applicable | ${pwht.notApplicable} not applicable | ${pwht.review} review | <span class="category-summary-rs">${formatNumber(pwht.id, 2)} ID</span> | ${formatCurrency(pwht.cost, 2)}</p></div></div><div class="table-wrap"><table class="bom-group-table service-cost-table pipe-pwht-table"><thead><tr><th>Pipe Class</th><th>Pipe Size</th><th>Thk mm</th><th>BOM Material</th><th>Est. Joints</th><th>PWHT ID</th><th>Rate Rs/ID</th><th>PWHT Cost</th><th>Status / Rule</th></tr></thead><tbody>${pwht.rows.map((row) => row.status === "READY" ? `<tr><td>${escapeHtml(row.item.pipeClass)}</td><td>${formatPipeSize(row.nps)} IN</td><td>${formatNumber(row.thicknessMm, 2)}</td><td class="text-column">${escapeHtml(row.item.material)}</td><td>${formatNumber(row.joints, 0)}</td><td>${formatNumber(row.pwhtId, 2)}</td><td>${formatCurrency(row.rate.rateRsPerId, 2)}</td><td>${formatCurrency(row.cost, 2)}</td><td>${escapeHtml(row.rate.basis)} | ${escapeHtml(row.matchedRule.pipe_class)} | ${escapeHtml(row.matchedRule.rule.type)}</td></tr>` : `<tr class="${row.status === "NOT_APPLICABLE" ? "" : "review-row"}"><td>${escapeHtml(row.item.pipeClass || "-")}</td><td>${Number.isFinite(row.nps) ? `${formatPipeSize(row.nps)} IN` : escapeHtml(row.item.size || "-")}</td><td>${Number.isFinite(row.thicknessMm) ? formatNumber(row.thicknessMm, 2) : "-"}</td><td class="text-column">${escapeHtml(row.item.material || "-")}</td><td>${Number.isFinite(row.joints) ? formatNumber(row.joints, 0) : "-"}</td><td>${Number.isFinite(row.pwhtId) ? formatNumber(row.pwhtId, 2) : "-"}</td><td>-</td><td>-</td><td>${row.status === "NOT_APPLICABLE" ? "Not applicable -" : "Review -"} ${escapeHtml(row.reason)}</td></tr>`).join("")}</tbody></table></div></article>`
      : '<p class="empty-note">Upload pipe rows to evaluate PWHT applicability against the NRL rules.</p>';
  }
  return summary;
}

function renderBomGroupReview() {
  if (!elements.bomGroupCount || !elements.bomGroupTables) return;

  elements.bomGroupCount.textContent = `${bomGroupItems.length} ${
    bomGroupItems.length === 1 ? "item" : "items"
  }`;

  if (!bomGroupItems.length) {
    elements.bomGroupTables.innerHTML =
      '<p class="empty-note">Upload a BOM to view group-wise item tables.</p>';
    renderPipingServiceCost();
    return;
  }

  const overallComponentSummary = getComponentCostSummary(bomGroupItems);
  const summaryHtml = `
    <div class="component-cost-summary">
      <article>
        <span>Priced components</span>
        <strong>${overallComponentSummary.priced}</strong>
      </article>
      <article>
        <span>Need review</span>
        <strong>${overallComponentSummary.review}</strong>
      </article>
      <article>
        <span>Normal component estimate</span>
        <strong>${formatCurrency(overallComponentSummary.normal, 0)}</strong>
      </article>
      <article>
        <span>P90 component estimate</span>
        <strong>${formatCurrency(overallComponentSummary.p90, 0)}</strong>
      </article>
    </div>
    <p class="audit-note">
      Component estimate basis: approved group method x quantity. WN/SO/Blind flanges use flange-weight-3-input-model-v2 JSON weight x raw material rate x P50 base multiplier. Metric stud sets use calculated stud-and-two-heavy-hex-nut mass x raw material rate x commercial factor 2.50.
      Generic low-confidence rows should be validated with supplier quotation.
    </p>
  `;

  elements.bomGroupTables.innerHTML = summaryHtml + groupBomItems(bomGroupItems)
    .map(
      ([groupName, groupItems]) => {
        const groupSummary = getComponentCostSummary(groupItems);
        const isBoltGroup = /bolt/i.test(groupName);
        return `
        <article class="bom-group-card">
          <div class="bom-group-title">
            <h4 class="${getBomGroupHeadingClass(groupName)}">${escapeHtml(groupName)}</h4>
            <p>${groupItems.length} ${groupItems.length === 1 ? "item" : "items"} | <span class="bom-group-normal-total">${formatCurrency(
              groupSummary.normal,
              0
            )}</span> normal | ${formatCurrency(groupSummary.p90, 0)} P90</p>
          </div>
          <div class="table-wrap">
            <table class="bom-group-table${isBoltGroup ? " bolt-group-table" : ""}">
              <colgroup>
                <col class="bom-col-item" />
                <col class="bom-col-size" />
                <col class="bom-col-rating" />
                <col class="bom-col-material" />
                <col class="bom-col-category" />
                <col class="bom-col-qty" />
                <col class="bom-col-uom" />
                ${isBoltGroup ? '<col class="bom-col-set-weight" />' : ""}
                <col class="bom-col-factor" />
                <col class="bom-col-unit-rate" />
                <col class="bom-col-total" />
                <col class="bom-col-total" />
                <col class="bom-col-source" />
              </colgroup>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Size</th>
                  <th>Sch/Thk/Rating</th>
                  <th class="text-column">Material</th>
                  <th class="text-column">Material Category</th>
                  <th>Qty.</th>
                  <th>UOM</th>
                  ${isBoltGroup ? "<th>Set wt (kg)</th>" : ""}
                  <th>Factor</th>
                  <th>Unit Rs</th>
                  <th>Normal Total</th>
                  <th>P90 Total</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                ${groupItems
                  .map((item) => {
                    const cost = item.componentCost || {};
                    const needsReview = !hasComponentUnitPrice(cost) || !hasComponentTotals(cost);
                    return `
                      <tr class="${needsReview ? "review-row" : ""}">
                        <td data-label="Item">${escapeHtml(item.item)}${
                          cost.reviewMessage
                            ? `<span class="review-inline-note">${escapeHtml(cost.reviewMessage)}</span>`
                            : ""
                        }</td>
                        <td data-label="Size">${escapeHtml(item.size || "-")}</td>
                        <td data-label="Sch/Thk/Rating">${escapeHtml(item.thickness || "-")}</td>
                        <td class="text-column" data-label="Material">${escapeHtml(item.material || "-")}</td>
                        <td class="text-column" data-label="Material Category">${escapeHtml(
                          formatCategoryHeading(item.materialCategory || "Unclassified")
                        )}</td>
                        <td data-label="Qty.">${escapeHtml(item.quantity || "-")}</td>
                        <td data-label="UOM">${escapeHtml(item.uom || "-")}</td>
                        ${
                          isBoltGroup
                            ? `<td data-label="Set wt (kg)">${
                                Number.isFinite(cost.setMassKg) ? formatNumber(cost.setMassKg, 3) : "-"
                              }</td>`
                            : ""
                        }
                        <td data-label="Factor">${
                          Number.isFinite(cost.factor) ? formatNumber(cost.factor, 2) : "-"
                        }${
                          cost.isGenericFallback
                            ? '<span class="fallback-pill">Generic fallback</span>'
                            : ""
                        }</td>
                        <td data-label="Unit Rs">${hasComponentUnitPrice(cost) ? formatCurrency(cost.medianUnitRate, 0) : "Review"}${
                          cost.equalTeeFallbackUsed
                            ? '<span class="fallback-pill">Equal tee fallback</span>'
                            : ""
                        }</td>
                        <td data-label="Normal Total">${hasComponentTotals(cost) ? formatCurrency(cost.medianTotal, 0) : "Review"}</td>
                        <td data-label="P90 Total">${hasComponentTotals(cost) ? formatCurrency(cost.p90Total, 0) : "Review"}</td>
                        <td data-label="Source">${escapeHtml(item.sourceName || "-")}</td>
                      </tr>
                    `;
                  })
                  .join("")}
              </tbody>
            </table>
          </div>
        </article>
      `;
      }
    )
    .join("");
  renderPipingServiceCost();
}

function getSummary(items) {
  return items.reduce(
    (total, item) => ({
      weight: total.weight + item.totalWeight,
      median: total.median + item.medianTotal,
      p90: total.p90 + item.p90Total,
    }),
    { weight: 0, median: 0, p90: 0 }
  );
}

function getCategoryAverageRsKg(summary) {
  return summary.weight > 0 ? summary.median / summary.weight : 0;
}

function getCategoryAverageRawRsKg(items) {
  return getWeightedAverage(items, (item) => item.rawSteel);
}

function getWeightedAverage(items, valueGetter, weightGetter = (item) => item.totalWeight) {
  const totalWeight = items.reduce((sum, item) => sum + (Number(weightGetter(item)) || 0), 0);
  if (totalWeight <= 0) return 0;

  return (
    items.reduce(
      (sum, item) => sum + (Number(valueGetter(item)) || 0) * (Number(weightGetter(item)) || 0),
      0
    ) / totalWeight
  );
}

function getPipeScenarioTotals(items, options = {}) {
  const rawMultiplier = options.rawMultiplier ?? 1;
  const factorMultiplier = options.factorMultiplier ?? 1;
  const coatingOverride = options.coatingOverride;

  return items.reduce(
    (total, item) => {
      const baseFactor = coatingOverride ? getFactor(coatingOverride) : item.factors;
      const medianFactor = baseFactor.median * factorMultiplier;
      const p90Factor = baseFactor.p90 * factorMultiplier;
      const rawSteel = item.rawSteel * rawMultiplier;
      const medianRsKg = rawSteel * medianFactor;
      const p90RsKg = rawSteel * p90Factor;
      const medianTotal = medianRsKg * item.weightKgm * item.length;
      const p90Total = p90RsKg * item.weightKgm * item.length;

      return {
        rawSteel: total.rawSteel + rawSteel * item.totalWeight,
        factorWeight: total.factorWeight + item.totalWeight,
        medianFactor: total.medianFactor + medianFactor * item.totalWeight,
        p90Factor: total.p90Factor + p90Factor * item.totalWeight,
        median: total.median + medianTotal,
        p90: total.p90 + p90Total,
      };
    },
    { rawSteel: 0, factorWeight: 0, medianFactor: 0, p90Factor: 0, median: 0, p90: 0 }
  );
}

function getComponentScenarioTotals(items, options = {}) {
  const rawMultiplier = options.rawMultiplier ?? 1;
  const factorMultiplier = options.factorMultiplier ?? 1;
  return items.reduce(
    (total, item) => {
      const cost = item.componentCost || {};
      if (!hasComponentTotals(cost)) return total;
      const baseNormal = Number(cost.medianTotal) || 0;
      const baseP90 = Number(cost.p90Total) || 0;
      const rawSteel = Number(cost.rawSteel) || 0;
      const componentFactor = Number(cost.factor ?? cost.componentFactor) || 0;
      const scale = rawMultiplier * factorMultiplier;
      return {
        median: total.median + baseNormal * scale,
        p90: total.p90 + baseP90 * scale,
        rawSteelTotal: total.rawSteelTotal + rawSteel * baseNormal * scale,
        factorTotal: total.factorTotal + componentFactor * baseNormal * scale,
        basisWeight: total.basisWeight + baseNormal * scale,
      };
    },
    { median: 0, p90: 0, rawSteelTotal: 0, factorTotal: 0, basisWeight: 0 }
  );
}

function getWhatIfScopeData() {
  const scope = elements.whatIfScope?.value || "complete";
  const pipeItems = lineItems.length > 0
    ? lineItems
    : bomGroupItems.length > 0
      ? []
      : (() => {
          const currentEstimate = getCurrentEstimate();
          return currentEstimate.error ? [] : [currentEstimate];
        })();
  const componentItems = bomGroupItems.filter(
    (item) => item.group !== "Pipe Group" && hasComponentTotals(item.componentCost || {})
  );
  return { scope, pipeItems, componentItems };
}

function getCombinedRawSteel(pipeTotals, componentTotals) {
  const pipeRaw = pipeTotals.factorWeight > 0 ? pipeTotals.rawSteel / pipeTotals.factorWeight : NaN;
  const componentRaw = componentTotals.basisWeight > 0
    ? componentTotals.rawSteelTotal / componentTotals.basisWeight
    : NaN;
  const pipeCost = pipeTotals.median || 0;
  const componentCost = componentTotals.median || 0;
  const totalCost = pipeCost + componentCost;
  if (totalCost <= 0) return NaN;
  return (
    (Number.isFinite(pipeRaw) ? pipeRaw * pipeCost : 0) +
    (Number.isFinite(componentRaw) ? componentRaw * componentCost : 0)
  ) / totalCost;
}

function updateWhatIfScopeControls(data = getWhatIfScopeData()) {
  const pipeAvailable = data.scope !== "components" && data.pipeItems.length > 0;
  const componentAvailable = data.scope !== "pipe" && data.componentItems.length > 0;
  const availability = {
    "Raw Material": pipeAvailable || componentAvailable,
    "Pipe Factor": pipeAvailable,
    "Component Factor": componentAvailable,
    Coating: pipeAvailable,
  };
  elements.whatIfToggles.forEach((toggle) => {
    const available = Boolean(availability[toggle.value]);
    toggle.disabled = !available;
    toggle.closest("label")?.classList.toggle("is-disabled", !available);
  });

  const isCaseSelected = (caseName) =>
    Array.from(elements.whatIfToggles).some(
      (toggle) => toggle.value === caseName && toggle.checked && !toggle.disabled
    );

  const setSliderAvailability = (slider, panel, available) => {
    slider.disabled = !available;
    panel.classList.toggle("is-disabled", !available);
  };
  setSliderAvailability(
    elements.rawSteelSlider,
    elements.rawMaterialSliderPanel,
    availability["Raw Material"] && isCaseSelected("Raw Material")
  );
  setSliderAvailability(
    elements.pipeFactorSlider,
    elements.pipeFactorSliderPanel,
    pipeAvailable && isCaseSelected("Pipe Factor")
  );
  setSliderAvailability(
    elements.componentFactorSlider,
    elements.componentFactorSliderPanel,
    componentAvailable && isCaseSelected("Component Factor")
  );

  const scopeNotes = {
    pipe: "Pipe values only. Raw material, pipe factor, and coating scenarios apply.",
    components: "Recognised non-pipe components only. Raw material and component-factor scenarios apply.",
    complete: "Pipes and recognised non-pipe components are included. Coating scenarios affect pipe values only.",
  };
  elements.whatIfScopeNote.textContent = scopeNotes[data.scope];
}

function getWhatIfScenarios(data = getWhatIfScopeData()) {
  const includePipes = data.scope !== "components";
  const includeComponents = data.scope !== "pipe";
  const hasPipes = includePipes && data.pipeItems.length > 0;
  const hasComponents = includeComponents && data.componentItems.length > 0;
  if (!hasPipes && !hasComponents) return [];

  const currentPipeCoating = data.pipeItems.filter((item) => item.coating === "Yes").length > data.pipeItems.length / 2
    ? "Yes"
    : "No";
  const manualRawChange = Number(elements.rawSteelSlider.value) || 0;
  const manualPipeFactorChange = Number(elements.pipeFactorSlider.value) || 0;
  const manualComponentFactorChange = Number(elements.componentFactorSlider.value) || 0;
  const scenarioInputs = [{ name: "Base case", type: "Base" }];
  const manualInputs = [];
  const addPercentageCases = (name, type, optionKey) => {
    [-20, -10, 10, 20].forEach((change) => {
      scenarioInputs.push({
        name: `${name} ${formatPercentChange(change)}`,
        type,
        [optionKey]: 1 + change / 100,
      });
    });
  };
  if (hasPipes || hasComponents) addPercentageCases("Raw material", "Raw Material", "rawMultiplier");
  if (hasPipes) addPercentageCases("Pipe factor", "Pipe Factor", "pipeFactorMultiplier");
  if (hasComponents) addPercentageCases("Component factor", "Component Factor", "componentFactorMultiplier");
  if (hasPipes) {
    scenarioInputs.push(
      { name: "Coating No", type: "Coating", coatingOverride: "No" },
      { name: "Coating Yes", type: "Coating", coatingOverride: "Yes" }
    );
  }
  if (manualRawChange !== 0 && (hasPipes || hasComponents)) {
    manualInputs.push({
      name: `Manual raw material ${formatPercentChange(manualRawChange)}`,
      type: "Raw Material",
      rawMultiplier: 1 + manualRawChange / 100,
    });
  }
  if (manualPipeFactorChange !== 0 && hasPipes) {
    manualInputs.push({
      name: `Manual pipe factor ${formatPercentChange(manualPipeFactorChange)}`,
      type: "Pipe Factor",
      pipeFactorMultiplier: 1 + manualPipeFactorChange / 100,
    });
  }
  if (manualComponentFactorChange !== 0 && hasComponents) {
    manualInputs.push({
      name: `Manual component factor ${formatPercentChange(manualComponentFactorChange)}`,
      type: "Component Factor",
      componentFactorMultiplier: 1 + manualComponentFactorChange / 100,
    });
  }
  scenarioInputs.splice(1, 0, ...manualInputs);

  const buildScenario = (input) => {
    const rawMultiplier = input.rawMultiplier ?? 1;
    const pipeTotals = hasPipes
      ? getPipeScenarioTotals(data.pipeItems, {
          rawMultiplier,
          factorMultiplier: input.pipeFactorMultiplier ?? 1,
          coatingOverride: input.coatingOverride,
        })
      : { median: 0, p90: 0, rawSteel: 0, factorWeight: 0, medianFactor: 0, p90Factor: 0 };
    const componentTotals = hasComponents
      ? getComponentScenarioTotals(data.componentItems, {
          rawMultiplier,
          factorMultiplier: input.componentFactorMultiplier ?? 1,
        })
      : { median: 0, p90: 0, rawSteelTotal: 0, factorTotal: 0, basisWeight: 0 };
    const median = pipeTotals.median + componentTotals.median;
    const p90 = pipeTotals.p90 + componentTotals.p90;
    return {
      ...input,
      rawSteel: getCombinedRawSteel(pipeTotals, componentTotals),
      pipeFactor: pipeTotals.factorWeight > 0 ? pipeTotals.medianFactor / pipeTotals.factorWeight : NaN,
      componentFactor: componentTotals.basisWeight > 0 ? componentTotals.factorTotal / componentTotals.basisWeight : NaN,
      coating: hasPipes ? (input.coatingOverride ? `Pipe: ${input.coatingOverride}` : `Pipe: Current (${currentPipeCoating})`) : "Not applicable",
      median,
      p90,
    };
  };

  const base = buildScenario(scenarioInputs[0]);
  return scenarioInputs.map((input) => {
    const scenario = input.type === "Base" ? base : buildScenario(input);
    return {
      ...scenario,
      change: base.median > 0 ? (scenario.median / base.median - 1) * 100 : 0,
    };
  });
}

function getSelectedWhatIfTypes() {
  return new Set(
    Array.from(elements.whatIfToggles)
      .filter((toggle) => toggle.checked && !toggle.disabled)
      .map((toggle) => toggle.value)
  );
}

function filterWhatIfScenarios(scenarios) {
  const selectedTypes = getSelectedWhatIfTypes();
  return scenarios.filter(
    (scenario) => scenario.type === "Base" || selectedTypes.has(scenario.type)
  );
}

function getWhatIfSortValue(scenario, key) {
  if (key === "name" || key === "coating") return String(scenario[key] || "").toLowerCase();
  return Number(scenario[key]);
}

function sortWhatIfScenarios(scenarios) {
  const pinnedScenarios = scenarios.filter(
    (scenario) => scenario.type === "Base" || scenario.name.startsWith("Manual ")
  );
  const sortableScenarios = scenarios.filter(
    (scenario) => scenario.type !== "Base" && !scenario.name.startsWith("Manual ")
  );

  if (!whatIfSortState.key) return [...pinnedScenarios, ...sortableScenarios];

  const direction = whatIfSortState.direction === "asc" ? 1 : -1;
  const sortedScenarios = [...sortableScenarios].sort((a, b) => {
    const valueA = getWhatIfSortValue(a, whatIfSortState.key);
    const valueB = getWhatIfSortValue(b, whatIfSortState.key);

    if (typeof valueA === "string" || typeof valueB === "string") {
      return String(valueA).localeCompare(String(valueB)) * direction;
    }

    return ((Number(valueA) || 0) - (Number(valueB) || 0)) * direction;
  });

  return [...pinnedScenarios, ...sortedScenarios];
}

function updateWhatIfSortButtons() {
  elements.whatIfSortButtons.forEach((button) => {
    const isActive = button.dataset.sort === whatIfSortState.key;
    const icon = button.querySelector("span");
    button.setAttribute("aria-sort", isActive ? whatIfSortState.direction : "none");
    if (icon) icon.textContent = isActive ? (whatIfSortState.direction === "asc" ? "↑" : "↓") : "↕";
  });
}

function handleWhatIfSort(event) {
  const button = event.target.closest(".whatif-sort-button");
  if (!button) return;

  const key = button.dataset.sort;
  if (whatIfSortState.key === key) {
    whatIfSortState.direction = whatIfSortState.direction === "asc" ? "desc" : "asc";
  } else {
    whatIfSortState = { key, direction: "asc" };
  }

  renderWhatIfAnalysis();
}

function updateRawSteelSliderDisplay(data = getWhatIfScopeData()) {
  const change = Number(elements.rawSteelSlider.value) || 0;
  const baseRawSteel = getWhatIfScenarios(data).find((scenario) => scenario.type === "Base")?.rawSteel;
  const adjustedRawSteel = baseRawSteel * (1 + change / 100);
  const sliderTone = change < 0 ? "negative" : change > 0 ? "positive" : "base";
  const sliderMin = Number(elements.rawSteelSlider.min) || -30;
  const sliderMax = Number(elements.rawSteelSlider.max) || 30;
  const sliderPosition = ((change - sliderMin) / (sliderMax - sliderMin)) * 100;
  const thumbOffset = 16 - 28 * (sliderPosition / 100);

  elements.rawSteelSliderValue.textContent = formatPercentChange(change);
  elements.rawSteelSliderValue.dataset.tone = sliderTone;
  elements.rawSteelSliderRate.dataset.tone = sliderTone;
  elements.rawSteelSlider.dataset.tone = sliderTone;
  elements.rawSteelSliderThumb.dataset.tone = sliderTone;
  elements.rawSteelSliderProgress.dataset.tone = sliderTone;
  elements.rawSteelSliderThumb.style.left = `calc(${sliderPosition}% + ${thumbOffset}px)`;
  elements.rawSteelSliderProgress.style.width = `${sliderPosition}%`;

  if (!Number.isFinite(baseRawSteel) || baseRawSteel <= 0) {
    elements.rawSteelSliderRate.textContent = "-";
    elements.rawSteelSliderBase.textContent = "Base value: -";
    return;
  }

  elements.rawSteelSliderRate.textContent = `${formatCurrency(adjustedRawSteel, 2)}/kg`;
  elements.rawSteelSliderBase.textContent = `Base value: ${formatCurrency(baseRawSteel, 2)}/kg`;
}

function handleRawSteelSlider() {
  renderWhatIfAnalysis();
}

function updateFactorSliderDisplay({ slider, value, rate, base, thumb, progress, baseFactor }) {
  const change = Number(slider.value) || 0;
  const sliderTone = change < 0 ? "negative" : change > 0 ? "positive" : "base";
  const sliderMin = Number(slider.min) || -30;
  const sliderMax = Number(slider.max) || 30;
  const sliderPosition = ((change - sliderMin) / (sliderMax - sliderMin)) * 100;
  const thumbOffset = 16 - 28 * (sliderPosition / 100);

  value.textContent = formatPercentChange(change);
  value.dataset.tone = sliderTone;
  rate.dataset.tone = sliderTone;
  slider.dataset.tone = sliderTone;
  thumb.dataset.tone = sliderTone;
  progress.dataset.tone = sliderTone;
  thumb.style.left = `calc(${sliderPosition}% + ${thumbOffset}px)`;
  progress.style.width = `${sliderPosition}%`;

  if (!Number.isFinite(baseFactor) || baseFactor <= 0) {
    rate.textContent = "-";
    base.textContent = "Base value: -";
    return;
  }

  rate.textContent = formatNumber(baseFactor * (1 + change / 100), 2);
  base.textContent = `Base value: ${formatNumber(baseFactor, 2)}`;
}

function updateFactorSliderDisplays(data = getWhatIfScopeData()) {
  const baseScenario = getWhatIfScenarios(data).find((scenario) => scenario.type === "Base");
  updateFactorSliderDisplay({
    slider: elements.pipeFactorSlider,
    value: elements.pipeFactorSliderValue,
    rate: elements.pipeFactorSliderRate,
    base: elements.pipeFactorSliderBase,
    thumb: elements.pipeFactorSliderThumb,
    progress: elements.pipeFactorSliderProgress,
    baseFactor: baseScenario?.pipeFactor,
  });
  updateFactorSliderDisplay({
    slider: elements.componentFactorSlider,
    value: elements.componentFactorSliderValue,
    rate: elements.componentFactorSliderRate,
    base: elements.componentFactorSliderBase,
    thumb: elements.componentFactorSliderThumb,
    progress: elements.componentFactorSliderProgress,
    baseFactor: baseScenario?.componentFactor,
  });
}

function handleFactorSlider() {
  renderWhatIfAnalysis();
}

function renderWhatIfAnalysis() {
  const data = getWhatIfScopeData();
  updateWhatIfScopeControls(data);
  updateRawSteelSliderDisplay(data);
  updateFactorSliderDisplays(data);
  const scenarios = filterWhatIfScenarios(getWhatIfScenarios(data));
  updateWhatIfSortButtons();

  if (!scenarios.length) {
    elements.whatIfBase.textContent = "-";
    elements.whatIfLow.textContent = "-";
    elements.whatIfHigh.textContent = "-";
    elements.whatIfRange.textContent = "-";
    elements.whatIfDriver.textContent = "-";
    elements.whatIfChart.innerHTML = `<p class="empty-note">Add pipe lines or recognised piping components to view scenarios for the selected scope.</p>`;
    elements.whatIfBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="8">No scenarios are available for the selected scope.</td>
      </tr>
    `;
    return;
  }

  const base = scenarios[0];
  const sortedByValue = [...scenarios].sort((a, b) => a.median - b.median);
  const low = sortedByValue[0];
  const high = sortedByValue[sortedByValue.length - 1];
  const biggest =
    high.type !== "Base"
      ? high
      : scenarios
          .filter((scenario) => scenario.type !== "Base")
          .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))[0];
  const maxMedian = Math.max(...scenarios.map((scenario) => scenario.median), 1);
  const displayScenarios = sortWhatIfScenarios(scenarios);
  const chartScenarios = displayScenarios.filter((scenario) => scenario.type !== "Base");
  const getScenarioClass = (scenario) => {
    const classes = [];
    if (scenario === base || scenario.name === base.name) classes.push("scenario-base");
    else if (scenario === low || scenario.name === low.name) classes.push("scenario-low");
    else if (scenario === high || scenario.name === high.name) classes.push("scenario-high");
    else classes.push("scenario-standard");

    return classes.join(" ");
  };

  elements.whatIfBase.textContent = formatCurrency(base.median, 0);
  elements.whatIfLow.textContent = formatCurrency(low.median, 0);
  elements.whatIfHigh.textContent = formatCurrency(high.median, 0);
  elements.whatIfRange.textContent = formatCurrency(high.median - low.median, 0);
  elements.whatIfDriver.textContent = biggest ? biggest.type : "-";

  const scenarioBars = chartScenarios
    .map(
      (scenario) => `
        <div class="scenario-bar ${getScenarioClass(scenario)}">
          <span>${scenario.name}</span>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${Math.max((scenario.median / maxMedian) * 100, 4)}%"></div>
          </div>
          <strong>${formatCurrency(scenario.median, 0)}</strong>
        </div>
      `
    )
    .join("") || `<p class="empty-note">Select one or more cases to compare with the base estimate.</p>`;

  elements.whatIfChart.innerHTML = `
    <div class="scenario-chart-heading">
      <strong>Scenario Impact vs Base</strong>
      <span>Base = ${formatCurrency(base.median, 2)}</span>
    </div>
    ${scenarioBars}
  `;

  elements.whatIfBody.innerHTML = displayScenarios
    .map(
      (scenario) => `
        <tr class="${getScenarioClass(scenario)}">
          <td data-label="Scenario">${scenario.name}</td>
          <td data-label="Raw material">${formatCurrency(scenario.rawSteel, 2)}</td>
          <td data-label="Pipe factor">${formatNumber(scenario.pipeFactor, 2)}</td>
          <td data-label="Component factor">${formatNumber(scenario.componentFactor, 2)}</td>
          <td data-label="Coating">${scenario.coating}</td>
          <td data-label="Normal total">${formatCurrency(scenario.median, 0)}</td>
          <td data-label="P90 total">${formatCurrency(scenario.p90, 0)}</td>
          <td data-label="Change vs base">${scenario.change >= 0 ? "+" : ""}${formatNumber(scenario.change, 1)}%</td>
        </tr>
      `
    )
    .join("");
}

function getReportItems() {
  const currentEstimate = getCurrentEstimate();
  if (lineItems.length > 0) return lineItems;
  return currentEstimate.error ? [] : [currentEstimate];
}

function getSortValue(item, key) {
  if (key === "medianFactor") return item.factors.median;
  if (key === "spec" || key === "coating") return String(item[key] || "").toLowerCase();
  return Number(item[key]);
}

function applySort() {
  if (!sortState.key) return;

  const direction = sortState.direction === "asc" ? 1 : -1;
  lineItems.sort((a, b) => {
    const valueA = getSortValue(a, sortState.key);
    const valueB = getSortValue(b, sortState.key);

    if (typeof valueA === "string" || typeof valueB === "string") {
      return String(valueA).localeCompare(String(valueB)) * direction;
    }

    return ((Number(valueA) || 0) - (Number(valueB) || 0)) * direction;
  });
}

function updateSortButtons() {
  elements.sortButtons.forEach((button) => {
    const isActive = button.dataset.sort === sortState.key;
    const icon = button.querySelector("span");
    button.setAttribute("aria-sort", isActive ? sortState.direction : "none");
    if (icon) icon.textContent = isActive ? (sortState.direction === "asc" ? "↑" : "↓") : "↕";
  });
}

function handleSort(event) {
  const button = event.target.closest(".sort-button");
  if (!button) return;

  const key = button.dataset.sort;
  if (sortState.key === key) {
    sortState.direction = sortState.direction === "asc" ? "desc" : "asc";
  } else {
    sortState = { key, direction: "asc" };
  }

  applySort();
  renderLineItems();
}

function buildManualPipeGroupItem(estimate) {
  const materialMatch = classifyMaterialSpec(estimate.spec);
  return {
    id: createId(),
    sourceName: "Manual pipe quick estimate",
    sourceKey: `manual-pipe-${estimate.id}`,
    group: "Pipe Group",
    standardName: "Pipe",
    item: "Pipe",
    size: `${formatPipeSize(estimate.size)} IN`,
    thickness: `${formatNumber(estimate.thickness, 2)} mm`,
    material: estimate.spec,
    materialCategory: materialMatch.category,
    materialMatchedStandard: materialMatch.matchedStandard,
    materialMatchId: materialMatch.matchId,
    materialMatchNote: materialMatch.note,
    quantity: String(estimate.length),
    uom: "M",
    componentCost: {
      autoCostAllowed: true,
      unitCostAllowed: true,
      totalCostAllowed: true,
      medianUnitRate: estimate.medianRsM,
      p90UnitRate: estimate.p90RsM,
      medianTotal: estimate.medianTotal,
      p90Total: estimate.p90Total,
      factor: estimate.factors.median,
      rawSteel: estimate.rawSteel,
      thickness: estimate.thickness,
      note: "Manual pipe quick estimate using the displayed pipe weight, raw material rate and estimate factor.",
    },
  };
}

function addCurrentLine() {
  if (hasIncompleteNonCarbonSteelSelection()) {
    const message = "Please select Pipe Material Standard before adding non-carbon-steel pipe.";
    elements.warning.textContent = message;
    elements.materialGradeFamily.focus();
    window.alert(message);
    return;
  }

  const estimate = calculate();
  if (!estimate) return;

  estimate.source = "manual";
  lineItems.push(estimate);
  bomGroupItems.push(buildManualPipeGroupItem(estimate));
  renderLineItems();
  renderBomGroupReview();
  renderWhatIfAnalysis();
  updateReportGenerated();
  showSuccessMessage(`${formatPipeSize(estimate.size)} IN pipe line added to the estimate, component review and service estimate.`);
}

function removeLine(id) {
  const index = lineItems.findIndex((item) => item.id === id);
  const removedItem = index >= 0 ? lineItems[index] : null;
  if (index >= 0) lineItems.splice(index, 1);
  if (removedItem?.source === "manual") {
    const sourceKey = `manual-pipe-${removedItem.id}`;
    for (let groupIndex = bomGroupItems.length - 1; groupIndex >= 0; groupIndex -= 1) {
      if (bomGroupItems[groupIndex].sourceKey === sourceKey) bomGroupItems.splice(groupIndex, 1);
    }
    renderBomGroupReview();
  }
  renderLineItems();
  if (lineItems.length === 0) {
    clearReportGenerated();
  } else {
    updateReportGenerated();
  }
}

function normalizeHeader(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function findBomColumn(headers, aliases) {
  const normalizedHeaders = headers.map((header) => ({
    original: header,
    normalized: normalizeHeader(header),
  }));

  for (const alias of aliases) {
    const match = normalizedHeaders.find(
      (header) => header.normalized === normalizeHeader(alias)
    );
    if (match) return match.original;
  }

  return undefined;
}

function parseBomNumber(value) {
  if (typeof value === "number") return value;
  const text = String(value || "").replace(/,/g, "");
  const match = text.match(/-?(?:\d+\.?\d*|\.\d+)/);
  return match ? Number(match[0]) : NaN;
}

function getNearestPipeSizeFromMm(mmValue) {
  const diameter = Number(mmValue);
  if (!Number.isFinite(diameter) || diameter <= 0) return NaN;

  return Object.entries(odTable)
    .map(([size, od]) => ({ size: Number(size), difference: Math.abs(Number(od) - diameter) }))
    .sort((a, b) => a.difference - b.difference || b.size - a.size)[0]?.size ?? NaN;
}

function parseMetricFastenerSize(value) {
  const designation = parseMetricStudDesignation(value);
  if (designation) return getNearestPipeSizeFromMm(designation.diameterMm);

  const text = String(value || "").toUpperCase().replace(/\s+/g, "");
  const diameterOnlyMatch = text.match(/\bM(\d+(?:\.\d+)?)\b/);
  return diameterOnlyMatch ? getNearestPipeSizeFromMm(Number(diameterOnlyMatch[1])) : NaN;
}

function parseComponentSize(value, group = "") {
  if (group === "Bolt Group") {
    const metricFastenerSize = parseMetricFastenerSize(value);
    if (Number.isFinite(metricFastenerSize)) return metricFastenerSize;
  }

  return parseBomSize(value);
}

function parseBomSize(value) {
  if (typeof value === "number" && odTable[value]) return value;

  const text = String(value || "")
    .toUpperCase()
    .replace(/\u00C2?\u00BD/g, " 1/2")
    .replace(/\u00C2?\u00BE/g, " 3/4")
    .replace(/\u00C2?\u00BC/g, " 1/4");

  // BOM notes such as "IN PLACE OF 18-PRV-3501" are descriptions, not an
  // 18 IN nominal size. Never derive a size from a replacement reference.
  if (/\bIN\s+PLACE\s+OF\b/.test(text)) return NaN;

  const dottedFractionMatch = text.match(/\b(\d+)\.(\d+)\s*\/\s*(\d+)\b/);
  if (dottedFractionMatch) {
    const fractionSize =
      Number(dottedFractionMatch[1]) +
      Number(dottedFractionMatch[2]) / Number(dottedFractionMatch[3]);
    return odTable[fractionSize] ? fractionSize : NaN;
  }

  const wholeFractionMatch = text.match(/\b(\d+)\s+(\d+)\s*\/\s*(\d+)\b/);
  if (wholeFractionMatch) {
    const fractionSize =
      Number(wholeFractionMatch[1]) +
      Number(wholeFractionMatch[2]) / Number(wholeFractionMatch[3]);
    return odTable[fractionSize] ? fractionSize : NaN;
  }

  // Preserve leading-decimal pipe sizes such as .5" and .75". Without this
  // check, the generic numeric pattern can incorrectly read .5" as 5".
  const leadingDecimalMatch = text.match(/(?:^|[^0-9])(\.\d+)(?=\s*(?:["']|IN\b|INCH\b|$))/);
  if (leadingDecimalMatch) {
    const decimalSize = Number(leadingDecimalMatch[1]);
    return odTable[decimalSize] ? decimalSize : NaN;
  }

  const fractionMatch = text.match(/\b(\d+)\s*\/\s*(\d+)\b/);
  if (fractionMatch) {
    const fractionSize = Number(fractionMatch[1]) / Number(fractionMatch[2]);
    return odTable[fractionSize] ? fractionSize : NaN;
  }

  const dnMatch = text.match(/\bDN\s*(\d+(\.\d+)?)/);
  if (dnMatch) {
    const dnValue = Number(dnMatch[1]);
    return dnToNps[dnValue] || Math.round((dnValue / 25) * 2) / 2;
  }

  // Prefer an explicit inch size before considering an unlabelled number.
  // This avoids reading "2 nos 6 IN equal tee" as a 2 IN component.
  const explicitInchMatch = text.match(/\b(\d+(?:\.\d+)?|\.\d+)\s*(?:["']|IN\b|INCH\b|INCHES\b)/);
  const explicitInchSize = explicitInchMatch ? Number(explicitInchMatch[1]) : NaN;
  if (odTable[explicitInchSize]) return explicitInchSize;

  const labelledNpsMatch = text.match(/\b(?:NPS|NB)\s*(\d+(?:\.\d+)?|\.\d+)/);
  const labelledNpsSize = labelledNpsMatch ? Number(labelledNpsMatch[1]) : NaN;
  if (odTable[labelledNpsSize]) return labelledNpsSize;

  const npsMatch = text.match(/\b(\d+(\.\d+)?|\.\d+)/);
  const npsSize = npsMatch ? Number(npsMatch[2]) : NaN;
  if (odTable[npsSize]) return npsSize;

  const parsedSize = parseBomNumber(value);
  return odTable[parsedSize] ? parsedSize : NaN;
}

function parseBomCoating(value, fallback = "No") {
  const text = String(value || "").toLowerCase();
  if (!text.trim()) return fallback === "Yes" ? "Yes" : "No";
  if (/\b(no|bare|uncoated|none|na|n\/a)\b/.test(text)) return "No";
  if (/\b(yes|coated|coat|pe|polyethylene|epoxy|lined|lining|fbe)\b/.test(text)) return "Yes";
  return fallback === "Yes" ? "Yes" : "No";
}

function isMeterUom(value) {
  const text = normalizeHeader(value);
  if (!text) return false;
  return ["m", "meter", "metre", "meters", "metres"].includes(text);
}

function isPipeItem(value) {
  const text = String(value || "").toLowerCase();
  if (!text.trim()) return true;
  const looksLikePipe = /\bpipe\b|pipes|piping/.test(text);
  const looksLikeFitting =
    /\belbow\b|\btee\b|\bflange\b|\bvalve\b|\bgasket\b|\breducer\b|\bcap\b|\bbend\b/.test(text);
  return looksLikePipe && !looksLikeFitting;
}

function worksheetToBomRows(sheet) {
  const matrix = globalThis.XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
    blankrows: false,
  });

  let bestHeaderIndex = -1;
  let bestScore = 0;

  matrix.forEach((row, rowIndex) => {
    const headers = row.map((cell) => String(cell || ""));
    const score = [
      findBomColumn(headers, bomColumnAliases.size),
      findBomColumn(headers, bomColumnAliases.thickness),
      findBomColumn(headers, bomColumnAliases.length),
    ].filter(Boolean).length;

    if (score > bestScore) {
      bestScore = score;
      bestHeaderIndex = rowIndex;
    }
  });

  if (bestHeaderIndex < 0 || bestScore < 3) {
    return [];
  }

  const rawHeaders = matrix[bestHeaderIndex].map((header, index) => {
    const cleanHeader = String(header || "").trim();
    return cleanHeader || `Column ${index + 1}`;
  });

  return matrix
    .slice(bestHeaderIndex + 1)
    .map((row) =>
      rawHeaders.reduce((record, header, index) => {
        record[header] = row[index] ?? "";
        return record;
      }, {})
    )
    .filter((row) =>
      Object.values(row).some((value) => String(value || "").trim() !== "")
    );
}

function cleanBomContextValue(value) {
  return String(value || "")
    .replace(/^[\s:：\-–—]+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractValueBesideLabel(matrix, rowIndex, columnIndex) {
  const row = matrix[rowIndex] || [];
  for (let index = columnIndex + 1; index < row.length; index += 1) {
    const value = cleanBomContextValue(row[index]);
    if (value) return value;
  }

  for (let index = rowIndex + 1; index < Math.min(matrix.length, rowIndex + 4); index += 1) {
    const value = cleanBomContextValue(matrix[index]?.[columnIndex]);
    if (value) return value;
  }

  return "";
}

function extractBomProjectContext(workbook, fileName = "") {
  const context = {
    projectNumber: "",
    projectDescription: "",
  };

  const projectNumberFromFile = String(fileName || "").match(/MOC[-_\s]*(\d{4})[-_\s]*([A-Z0-9]+)[-_\s]*([A-Z0-9]+)[-_\s]*V?(\d+)[-_\s]*(\d+)/i);
  const fallbackProjectNumber = projectNumberFromFile
    ? `MOC/${projectNumberFromFile[1]}/${projectNumberFromFile[2]}-${projectNumberFromFile[3]}/V${projectNumberFromFile[4]}/${projectNumberFromFile[5]}`
    : "";

  for (const sheetName of workbook.SheetNames || []) {
    const sheet = workbook.Sheets[sheetName];
    const matrix = globalThis.XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
      blankrows: false,
    });
    const scanRows = matrix.slice(0, 45);

    for (let rowIndex = 0; rowIndex < scanRows.length; rowIndex += 1) {
      const row = scanRows[rowIndex] || [];
      for (let columnIndex = 0; columnIndex < row.length; columnIndex += 1) {
        const text = cleanBomContextValue(row[columnIndex]);
        if (!text) continue;

        if (!context.projectNumber) {
          const projectNumberMatch = text.match(/\b(?:project|moc|job)\s*(?:no|number)\.?\s*[:：\-–—]*\s*(.+)$/i);
          if (projectNumberMatch) {
            context.projectNumber =
              cleanBomContextValue(projectNumberMatch[1]) || extractValueBesideLabel(scanRows, rowIndex, columnIndex);
          }
        }

        if (!context.projectDescription) {
          const descriptionMatch = text.match(/\b(?:project|job|moc)\s*description\s*[:：\-–—]*\s*(.*)$/i);
          if (descriptionMatch) {
            context.projectDescription =
              cleanBomContextValue(descriptionMatch[1]) || extractValueBesideLabel(scanRows, rowIndex, columnIndex);
          }
        }

        if (context.projectNumber && context.projectDescription) return context;
      }
    }
  }

  if (!context.projectNumber && fallbackProjectNumber) context.projectNumber = fallbackProjectNumber;
  return context;
}

function extractBomPmsClass(workbook) {
  // Some controlled BOMs state one PMS class in the document reference rather
  // than repeating it in every table row. Use that value only as a fallback.
  for (const sheetName of workbook.SheetNames || []) {
    const sheet = workbook.Sheets[sheetName];
    const matrix = globalThis.XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
      blankrows: false,
    });

    for (const row of matrix.slice(0, 45)) {
      for (const cell of row || []) {
        const text = String(cell || "").replace(/\s+/g, " ").trim();
        const match = text.match(/\b(?:PIPING\s+)?PMS\b[^A-Z0-9]*\(?\s*([A-G]\d{2}[A-Z])\s*\)?/i);
        if (match) return match[1].toUpperCase();
      }
    }
  }

  return "";
}

function applySingleBomProjectContext(context) {
  const projectNumber = cleanBomContextValue(context?.projectNumber);
  const projectDescription = cleanBomContextValue(context?.projectDescription);

  if (projectNumber) elements.projectNumber.value = projectNumber;
  if (projectDescription) elements.projectDescription.value = projectDescription;
}

function setBomStatus(message, type = "") {
  elements.bomStatus.textContent = message;
  elements.bomStatus.className = `bom-status${type ? ` ${type}` : ""}`;
}

function formatBomProcessingTime(elapsedMs) {
  const milliseconds = Number(elapsedMs);
  if (!Number.isFinite(milliseconds) || milliseconds < 0) return "";
  if (milliseconds < 1000) return "in less than 1 second";

  const seconds = Math.round((milliseconds / 1000) * 10) / 10;
  return `in ${seconds} ${seconds === 1 ? "second" : "seconds"}`;
}

function updateBomProgress(
  completed,
  total,
  fileName = "",
  state = "processing",
  elapsedMs = NaN,
  target = "prompt"
) {
  const safeTotal = Math.max(Number(total) || 0, 1);
  const safeCompleted = Math.min(Math.max(Number(completed) || 0, 0), safeTotal);
  const percent = Math.round((safeCompleted / safeTotal) * 100);
  const isComplete = state === "complete";

  const progressViews = [
    {
      target: "prompt",
      root: elements.bomProgress,
      ring: elements.bomProgressRing,
      count: elements.bomProgressCount,
      title: elements.bomProgressTitle,
      detail: elements.bomProgressDetail,
      percent: elements.bomProgressPercent,
    },
    {
      target: "main",
      root: elements.mainBomProgress,
      ring: elements.mainBomProgressRing,
      count: elements.mainBomProgressCount,
      title: elements.mainBomProgressTitle,
      detail: elements.mainBomProgressDetail,
      percent: elements.mainBomProgressPercent,
      enabled: elements.mainBomProgress?.dataset.enabled === "true",
    },
  ].filter((view) => view.target === target && view.root && view.ring && view.enabled !== false);

  progressViews.forEach((view) => {
    view.root.hidden = false;
    view.ring.style.setProperty("--progress", `${percent}%`);
    view.ring.setAttribute("aria-valuenow", String(percent));
    view.count.textContent = `${safeCompleted} / ${safeTotal}`;
    view.title.textContent = isComplete
      ? "BOM files processed"
      : `Reading file ${Math.min(safeCompleted + 1, safeTotal)} of ${safeTotal}`;
    view.detail.textContent = isComplete
      ? `${safeTotal} selected ${safeTotal === 1 ? "file has" : "files have"} been processed ${formatBomProcessingTime(elapsedMs)}.`
      : fileName || "Preparing selected BOM files...";
    view.percent.textContent = isComplete ? "100% complete" : `${percent}% complete`;
  });
}

function importBomRows(rows, sourceName = "BOM", options = {}) {
  if (!rows.length) {
    setBomStatus("The uploaded BOM does not contain any readable rows.", "error");
    return { imported: 0, skipped: 0, supportedItems: 0 };
  }

  const headers = Object.keys(rows[0]);
  const sizeColumn = findBomColumn(headers, bomColumnAliases.size);
  const thicknessColumn = findBomColumn(headers, bomColumnAliases.thickness);
  const lengthColumn = findBomColumn(headers, bomColumnAliases.length);
  const coatingColumn = findBomColumn(headers, bomColumnAliases.coating);
  const specColumn = findBomColumn(headers, bomColumnAliases.spec);
  const itemColumn = findBomColumn(headers, bomColumnAliases.item);
  const uomColumn = findBomColumn(headers, bomColumnAliases.uom);
  const rawColumn = findBomColumn(headers, bomColumnAliases.rawOverride);
  const factorColumn = findBomColumn(headers, bomColumnAliases.factorOverride);
  const pipeClassColumn = findBomColumn(headers, bomColumnAliases.pipeClass);
  const defaultPipeClass = String(options.defaultPipeClass || "").trim();
  const sourceKey = options.replaceBatchKey || sourceName;

  const missing = [];
  if (!sizeColumn) missing.push("Size / NPS / DN");
  if (!thicknessColumn) missing.push("Thickness / THK");
  if (!lengthColumn) missing.push("Length / Qty");

  if (missing.length) {
    setBomStatus(`Missing required BOM column(s): ${missing.join(", ")}.`, "error");
    return { imported: 0, skipped: rows.length, supportedItems: 0 };
  }

  let imported = 0;
  let skipped = 0;
  let supportedItems = 0;

  if (options.replaceBatchKey) {
    for (let index = lineItems.length - 1; index >= 0; index -= 1) {
      if (
        lineItems[index].source === "bom" &&
        lineItems[index].sourceKey === options.replaceBatchKey
      ) {
        lineItems.splice(index, 1);
      }
    }
    for (let index = bomGroupItems.length - 1; index >= 0; index -= 1) {
      if (bomGroupItems[index].sourceKey === options.replaceBatchKey) {
        bomGroupItems.splice(index, 1);
      }
    }
  }

  rows.forEach((row) => {
    const groupItem = buildBomGroupItem(
      row,
      {
        item: itemColumn,
        size: sizeColumn,
        thickness: thicknessColumn,
        length: lengthColumn,
        uom: uomColumn,
        spec: specColumn,
        pipeClass: pipeClassColumn,
        defaultPipeClass,
      },
      sourceName,
      sourceKey
    );
    if (groupItem) {
      bomGroupItems.push(groupItem);
      if (groupItem.group !== "Other Group") supportedItems += 1;
    }

    if (uomColumn && !isMeterUom(row[uomColumn])) {
      skipped += 1;
      return;
    }

    if (!uomColumn && itemColumn && !isPipeItem(row[itemColumn])) {
      skipped += 1;
      return;
    }

    const rowSize = parseBomSize(row[sizeColumn]);
    const rowThickness = parseBomThickness(row[thicknessColumn], rowSize, thicknessColumn);
    const rowSpec = specColumn ? row[specColumn] : elements.spec.value;
    const bomRawOverride = rawColumn ? parseBomNumber(row[rawColumn]) : NaN;
    const hasBomRawOverride = Number.isFinite(bomRawOverride) && bomRawOverride > 0;
    const rowRawPriceMapping = hasBomRawOverride
      ? null
      : getRawMaterialPriceMapping(rowSpec, elements.year.value);
    const rowRawOverride = hasBomRawOverride
      ? bomRawOverride
      : rowRawPriceMapping?.recommended || "";
    const estimate = buildEstimate({
      year: elements.year.value,
      size: rowSize,
      thickness: rowThickness,
      length: parseBomNumber(row[lengthColumn]),
      spec: rowSpec,
      coating: coatingColumn
        ? parseBomCoating(row[coatingColumn], elements.coating.value)
        : elements.coating.value,
      rawOverride: rowRawOverride,
      rawSteelSource: hasBomRawOverride
        ? "bomOverride"
        : rowRawPriceMapping
          ? "materialLibrary"
          : "defaultYear",
      rawBasisNote: hasBomRawOverride
        ? "BOM-entered Raw Steel Rs/kg"
        : rowRawPriceMapping?.note || "Default raw steel basis; no BOM material raw-price match",
      factorOverride: factorColumn ? parseBomNumber(row[factorColumn]) : "",
    });

    if (estimate.error) {
      skipped += 1;
      return;
    }

    estimate.source = "bom";
    estimate.sourceName = sourceName;
    estimate.sourceKey = sourceKey;
    lineItems.push(estimate);
    imported += 1;
  });

  renderLineItems();
  renderBomGroupReview();
  renderWhatIfAnalysis();
  // Keep service and PWHT totals ready immediately after upload, even while
  // the collapsed service panel has not yet been opened by the user.
  renderPipingServiceCost();
  if (imported > 0) {
    updateReportGenerated();
    showSuccessMessage(`${imported} BOM pipe ${imported === 1 ? "line" : "lines"} imported.`);
  }

  const mappedColumns = [
    `size: ${sizeColumn}`,
    `thickness: ${thicknessColumn}`,
    `length: ${lengthColumn}`,
    coatingColumn ? `coating: ${coatingColumn}` : "",
    defaultPipeClass && !pipeClassColumn ? `PMS class fallback: ${defaultPipeClass}` : "",
  ]
    .filter(Boolean)
    .join("; ");
  const statusType = supportedItems > 0 ? "success" : "error";
  const skippedNote =
    skipped > 0 ? " Non-pipe rows, non-meter UoM rows, or invalid pipe data were skipped." : "";
  setBomStatus(
    supportedItems > 0
      ? `${sourceName}: recognised ${supportedItems} piping item(s), imported ${imported} pipe line(s), skipped ${skipped}. Mapped columns: ${mappedColumns}.${skippedNote}`
      : "This Excel file does not contain recognised piping BOM items. Please use the Download Example BOM Template above, complete the required fields, and upload it again.",
    statusType
  );

  return { imported, skipped, supportedItems };
}

window.importBomRows = importBomRows;

async function processBomFiles(files, { sourceInput = elements.bomFile, showPromptResult = false } = {}) {
  if (!files.length) return;

  const isMainBomUpload = sourceInput === elements.bomFile;
  // A previous valid upload must not leave report actions visible while a new
  // file is being checked. They are restored only after recognised BOM items exist.
  if (isMainBomUpload && elements.bomUploadReportActions) {
    elements.bomUploadReportActions.hidden = true;
  }
  if (isMainBomUpload && elements.bomUploadReportPreview) {
    elements.bomUploadReportPreview.hidden = true;
    elements.bomUploadReportFrame.removeAttribute("srcdoc");
  }
  const progressTarget = isMainBomUpload ? "main" : "prompt";
  if (elements.bomProgress) {
    elements.bomProgress.hidden = isMainBomUpload;
  }
  if (elements.mainBomProgress) {
    elements.mainBomProgress.dataset.enabled = isMainBomUpload ? "true" : "false";
    elements.mainBomProgress.hidden = !isMainBomUpload;
  }

  if (!globalThis.XLSX) {
    setBomStatus(
      "Excel parser did not load. Check internet connection and reload the page.",
      "error"
    );
    return;
  }

  const processingStartedAt = globalThis.performance?.now?.() ?? Date.now();
  updateBomProgress(0, files.length, files[0]?.name || "", "processing", NaN, progressTarget);
  await new Promise((resolve) => window.requestAnimationFrame(resolve));

  await ensureFlangeWeightModelLoaded();

  const results = [];

  for (const [index, file] of files.entries()) {
    updateBomProgress(index, files.length, file.name, "processing", NaN, progressTarget);
    await new Promise((resolve) => window.requestAnimationFrame(resolve));
    try {
      const data = await file.arrayBuffer();
      const workbook = globalThis.XLSX.read(data, { type: "array" });
      const projectContext = files.length === 1 ? extractBomProjectContext(workbook, file.name) : null;
      const defaultPipeClass = extractBomPmsClass(workbook);
      if (projectContext) applySingleBomProjectContext(projectContext);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = worksheetToBomRows(sheet);
      const sourceKey = `${file.name}:${file.size}:${file.lastModified}`;
      const result = importBomRows(rows, file.name, {
        replaceBatchKey: sourceKey,
        defaultPipeClass,
      });
      results.push({
        file: file.name,
        ...result,
        projectContextApplied:
          Boolean(projectContext?.projectNumber) || Boolean(projectContext?.projectDescription),
      });
    } catch (error) {
      results.push({ file: file.name, imported: 0, skipped: 0, error: error.message });
    }

    updateBomProgress(index + 1, files.length, file.name, "processing", NaN, progressTarget);
    await new Promise((resolve) => window.requestAnimationFrame(resolve));
  }

  const imported = results.reduce((total, result) => total + result.imported, 0);
  const skipped = results.reduce((total, result) => total + result.skipped, 0);
  const supportedItems = results.reduce((total, result) => total + (result.supportedItems || 0), 0);
  const failed = results.filter((result) => result.error);
  const fileSummary = results
    .map((result) =>
      result.error
        ? `${result.file}: failed`
        : `${result.file}: ${result.imported} imported, ${result.skipped} skipped${
            result.projectContextApplied ? ", project info extracted" : ""
          }`
    )
    .join(" | ");

  if (failed.length) {
    setBomStatus(
      `${files.length} file(s) processed with ${failed.length} error(s). ${fileSummary}`,
      supportedItems > 0 ? "success" : "error"
    );
  } else {
    setBomStatus(
      supportedItems > 0
        ? `${files.length} file(s) processed. Recognised ${supportedItems} piping item(s), imported ${imported} pipe line(s), skipped ${skipped}. ${fileSummary}`
        : "This Excel file does not contain recognised piping BOM items. Please use the Download Example BOM Template above, complete the required fields, and upload it again.",
      supportedItems > 0 ? "success" : "error"
    );
  }

  const processingFinishedAt = globalThis.performance?.now?.() ?? Date.now();
  updateBomProgress(
    files.length,
    files.length,
    "",
    "complete",
    processingFinishedAt - processingStartedAt,
    progressTarget
  );

  // Reuse the exact report generators from Component Cost Review, but make
  // their shortcuts available immediately below a successful BOM upload.
  if (elements.bomUploadReportActions) {
    elements.bomUploadReportActions.hidden = supportedItems <= 0;
    if (isMainBomUpload && supportedItems > 0) {
      window.requestAnimationFrame(() => {
        elements.bomUploadReportActions.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }
  if (elements.bomUploadReportPreview) {
    elements.bomUploadReportPreview.hidden = true;
    elements.bomUploadReportFrame.removeAttribute("srcdoc");
  }

  sourceInput.value = "";
  if (showPromptResult) {
    renderEstimatorBomUploadResult({ files, imported, skipped, supportedItems, failed: failed.length });
  }
}

function renderEstimatorBomUploadResult({ files, imported, skipped, supportedItems, failed }) {
  if (!elements.estimatorQueryResult) return;

  const hasSupportedItems = Number(supportedItems) > 0;
  const status = !hasSupportedItems ? "Unsupported upload" : failed ? "Review upload status" : "Ready";
  const statusClass = !hasSupportedItems || failed ? "review" : "";
  const fileLabel = `${files.length} ${files.length === 1 ? "file" : "files"}`;

  elements.estimatorQueryExamples.hidden = true;
  elements.estimatorQueryResult.hidden = false;
  elements.estimatorQueryResult.innerHTML = `
    <div class="ask-result-header">
      <h3>Excel BOM upload</h3>
      <span class="ask-result-status ${statusClass}">${status}</span>
    </div>
    <h3 class="ask-result-output-heading">Output</h3>
    ${makeEstimatorQueryTable(
      ["Upload result", "Value"],
      [
        ["Selected files", fileLabel],
        ["Recognised piping items", String(supportedItems || 0)],
        ["Pipe rows imported", String(imported)],
        ["Rows skipped", String(skipped)],
        ["Files needing review", String(failed)],
      ],
      [1]
    )}
    <p class="${hasSupportedItems ? "ask-result-note" : "ask-result-error"}">${hasSupportedItems
      ? "The uploaded BOM is ready for the same material and service reports used by Piping Component Cost Review."
      : "This file does not contain recognised piping BOM items, so a report cannot be generated. Type \"Give me Excel BOM template file\" in the Ask Estimator bar to download the template, complete it, and upload it again."}</p>
    ${hasSupportedItems ? `<div class="ask-upload-actions">
      <button type="button" class="report-button" data-ask-print-report>Print / Save PDF</button>
      <button type="button" class="excel-report-button" data-ask-excel-report>Download Excel Report</button>
    </div>` : ""}
  `;

  // Keep the completed upload progress and its prompt output together in the viewport.
  window.requestAnimationFrame(() => {
    elements.bomProgress?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

async function handleBomUpload(event) {
  await processBomFiles(Array.from(event.target.files || []), { sourceInput: event.target });
}

async function handleEstimatorBomUpload(event) {
  await processBomFiles(Array.from(event.target.files || []), {
    sourceInput: event.target,
    showPromptResult: true,
  });
}

function handleBomDrag(event) {
  event.preventDefault();
  elements.bomDropZone.classList.add("drag-over");
}

function handleBomDragLeave(event) {
  event.preventDefault();
  elements.bomDropZone.classList.remove("drag-over");
}

async function handleBomDrop(event) {
  event.preventDefault();
  elements.bomDropZone.classList.remove("drag-over");
  await processBomFiles(Array.from(event.dataTransfer?.files || []));
}

function showSuccessMessage(message) {
  window.clearTimeout(successTimer);
  elements.successMessage.textContent = message;
  successTimer = window.setTimeout(() => {
    elements.successMessage.textContent = "";
  }, 3000);
}

function clearSuccessMessage() {
  window.clearTimeout(successTimer);
  elements.successMessage.textContent = "";
}

function updateReportGenerated() {
  const generatedAt = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  elements.reportGenerated.textContent = `Report generated: ${generatedAt}`;
}

function clearReportGenerated() {
  elements.reportGenerated.textContent = "";
}

function highlightOverride(value) {
  return `<span class="override-value">${value}</span>`;
}

function getOverrideNotes(items = getReportItems(), useHtml = false) {
  const notes = [];

  items.forEach((item, index) => {
    const defaultFactors = getFactor(item.coating);
    const hasRawOverride = item.rawSteelBasis.includes("Override");
    const hasFactorOverride = item.factorBasis.includes("Override");
    const rawSteelValue = formatNumber(item.rawSteel, 2);
    const normalFactorValue = formatNumber(item.factors.median, 2);
    const p90Multiplier = defaultFactors.p90 / defaultFactors.median;

    if (!hasRawOverride && !hasFactorOverride) return;

    notes.push(
      `Line ${index + 1}: ${formatPipeSize(item.size)} IN; ${
        hasRawOverride
          ? `raw steel override Rs ${useHtml ? highlightOverride(rawSteelValue) : rawSteelValue} per kg; `
          : ""
      }${
        hasFactorOverride
          ? `normal factor override ${useHtml ? highlightOverride(normalFactorValue) : normalFactorValue}; P90 recalculated to ${
              useHtml ? highlightOverride(formatNumber(item.factors.p90, 2)) : formatNumber(item.factors.p90, 2)
            } using default multiplier ${formatNumber(p90Multiplier, 3)}; `
          : ""
      }default factor set ${formatNumber(defaultFactors.median, 2)} / ${formatNumber(defaultFactors.p90, 2)}.`
    );
  });

  return notes;
}

function updateOverrideReview() {
  const notes = getOverrideNotes(getReportItems(), true);
  elements.overrideReviewCard.hidden = notes.length === 0;
  elements.overrideReviewList.innerHTML = notes
    .map((note) => `<li>${note}</li>`)
    .join("");
}

function csvCell(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function buildCsvRows() {
  calculate();
  const items = getReportItems();
  const summary = getSummary(items);
  const overrideNotes = getOverrideNotes(items);
  const rows = [];

  rows.push(["Piping Material & Service Cost Estimator - Audit Report"]);
  rows.push(["Estimate scope", "Part A material estimate plus separate Part B direct-service estimate; not a total installed project cost"]);
  rows.push([elements.reportGenerated.textContent]);
  rows.push(["Project / Job No.", elements.projectNumber?.value.trim() || "Not specified"]);
  rows.push(["Project / Job Description", elements.projectDescription?.value.trim() || "Not specified"]);
  rows.push(["Design Temperature (°C)", elements.designTemperature?.value.trim() || "Not specified"]);
  rows.push([]);
  rows.push(["Line Item Calculation"]);
  rows.push([
    "Year",
    "Size IN",
    "OD mm",
    "Thickness mm",
    "Length m",
    "Material Spec",
    "Material Category",
    "Matched JSON Pipe Standard",
    "Coating",
    "Raw Steel Rs/kg",
    "Normal Factor",
    "P90 Factor",
    "Kg/m",
    "Total kg",
    "Normal Rs/kg",
    "P90 Rs/kg",
    "Normal Total Rs",
    "P90 Total Rs",
  ]);

  items.forEach((item) => {
    rows.push([
      item.year,
      `${formatPipeSize(item.size)} IN`,
      formatNumber(item.od, 1),
      formatNumber(item.thickness, 2),
      formatNumber(item.length, 2),
      item.spec,
      item.materialCategory || "Unclassified",
      item.materialMatchedStandard || item.materialMatchNote || "",
      item.coating,
      formatPlainCurrency(item.rawSteel, 2),
      formatPlainCurrency(item.factors.median, 2),
      formatPlainCurrency(item.factors.p90, 2),
      formatPlainCurrency(item.weightKgm, 2),
      formatPlainCurrency(item.totalWeight, 2),
      formatPlainCurrency(item.medianRsKg, 2),
      formatPlainCurrency(item.p90RsKg, 2),
      formatPlainCurrency(item.medianTotal, 0),
      formatPlainCurrency(item.p90Total, 0),
    ]);
  });

  rows.push([]);
  rows.push(["Material Category Summary"]);
  rows.push([
    "Category",
    "Line Count",
    "Total Weight kg",
    "Normal Total Rs",
    "P90 Total Rs",
    "Raw Rs/kg",
    "Average Rs/kg",
  ]);
  Array.from(groupItemsByMaterialCategory(items).entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([category, categoryItems]) => {
      const categorySummary = getSummary(categoryItems);
      rows.push([
        category,
        categoryItems.length,
        formatPlainCurrency(categorySummary.weight, 2),
        formatPlainCurrency(categorySummary.median, 0),
        formatPlainCurrency(categorySummary.p90, 0),
        formatPlainCurrency(getCategoryAverageRawRsKg(categoryItems), 2),
        formatPlainCurrency(getCategoryAverageRsKg(categorySummary), 2),
      ]);
    });
  rows.push([
    "Category pricing note",
    "Non-CS material estimates use the same factor-based method and are indicative only. Validate SS, alloy, duplex, and non-ferrous rates with supplier quotations.",
  ]);

  rows.push([]);
  rows.push(["Summary"]);
  rows.push(["Total Weight kg", formatPlainCurrency(summary.weight, 2)]);
  rows.push(["Normal Estimate Rs", formatPlainCurrency(summary.median, 0)]);
  rows.push(["P90 Estimate Rs", formatPlainCurrency(summary.p90, 0)]);
  rows.push([]);
  rows.push(["Material What-if Analysis"]);
  rows.push([
    "Scenario",
    "Raw Material Rs/kg",
    "Pipe Factor",
    "Component Factor",
    "Coating",
    "Normal Total Rs",
    "P90 Total Rs",
    "Change vs Base %",
  ]);
  sortWhatIfScenarios(filterWhatIfScenarios(getWhatIfScenarios())).forEach((scenario) => {
    rows.push([
      scenario.name,
      formatPlainCurrency(scenario.rawSteel, 2),
      formatPlainCurrency(scenario.pipeFactor, 2),
      formatPlainCurrency(scenario.componentFactor, 2),
      scenario.coating,
      formatPlainCurrency(scenario.median, 0),
      formatPlainCurrency(scenario.p90, 0),
      formatPlainCurrency(scenario.change, 1),
    ]);
  });
  rows.push([
    "What-if basis",
    "Raw material varies by +/-10% and +/-20% across the selected scope. Pipe factor and coating apply only to pipe values; component factor applies only to recognised non-pipe component values.",
  ]);
  if (bomGroupItems.length) {
    const componentSummary = getComponentCostSummary(bomGroupItems);
    rows.push([]);
    rows.push(["Piping Component Cost Review"]);
    rows.push(["Component pricing basis", "Approved group method x quantity; WN/SO/Blind flanges use flange-weight JSON weight x raw material Rs/kg x P50 base multiplier; metric stud sets use calculated stud-and-two-nut mass x raw material Rs/kg x commercial factor 2.50"]);
    rows.push(["Priced Components", componentSummary.priced]);
    rows.push(["Need Review", componentSummary.review]);
    rows.push(["Normal Component Estimate Rs", formatPlainCurrency(componentSummary.normal, 0)]);
    rows.push(["P90 Component Estimate Rs", formatPlainCurrency(componentSummary.p90, 0)]);
    rows.push([]);
    rows.push(["Group", "Item Count", "Normal Total Rs", "P90 Total Rs"]);
    groupBomItems(bomGroupItems).forEach(([groupName, groupItems]) => {
      const groupSummary = getComponentCostSummary(groupItems);
      rows.push([
        groupName,
        groupItems.length,
        formatPlainCurrency(groupSummary.normal, 0),
        formatPlainCurrency(groupSummary.p90, 0),
      ]);
    });
    rows.push([]);
    rows.push(["BOM Group Details"]);
    rows.push([
      "Group",
      "Item",
      "Matched Component",
      "Size",
      "Sch/Thk/Rating",
      "Material",
      "Material Category",
      "Matched ASTM Standard",
      "Quantity",
      "UOM",
      "Factor",
      "Component Factor for Valve Ratio",
      "Generic Fallback Used",
      "Equal Tee Fallback Used",
      "Pressure Class",
      "Class Multiplier",
      "Material Multiplier",
      "Matching Pipe Basis",
      "Stud Mass kg/Set",
      "One Nut Mass kg",
      "Two Nuts Mass kg",
      "Complete Set Mass kg",
      "Total Set Mass kg",
      "Stud Pitch mm",
      "Stud Effective Diameter mm",
      "Nut Across Flats mm",
      "Nut Thickness mm",
      "Stud Correction Factor",
      "Nut Correction Factor",
      "Number of Nuts",
      "Unit Rs",
      "Normal Total Rs",
      "P90 Total Rs",
      "Confidence",
      "Auto Cost Note",
      "Source",
    ]);
    groupBomItems(bomGroupItems).forEach(([groupName, groupItems]) => {
      groupItems.forEach((item) => {
        const cost = item.componentCost || {};
        rows.push([
          groupName,
          item.item,
          cost.component || item.standardName || "",
          item.size,
          item.thickness,
          item.material,
          item.materialCategory || "Unclassified",
          item.materialMatchedStandard || item.materialMatchNote || "",
          item.quantity,
          item.uom,
          Number.isFinite(cost.factor) ? formatPlainCurrency(cost.factor, 2) : "",
          Number.isFinite(cost.componentFactor) ? formatPlainCurrency(cost.componentFactor, 3) : "",
          cost.isGenericFallback ? "Yes" : "No",
          cost.equalTeeFallbackUsed ? "Yes" : "No",
          cost.pressureClass || "",
          formatPlainCurrency(cost.pressureMultiplier || 1, 2),
          formatPlainCurrency(cost.materialMultiplier || 1, 2),
          cost.matchingPipeBasis || "",
          Number.isFinite(cost.studMassKg) ? formatPlainCurrency(cost.studMassKg, 3) : "",
          Number.isFinite(cost.oneNutMassKg) ? formatPlainCurrency(cost.oneNutMassKg, 3) : "",
          Number.isFinite(cost.totalNutMassKg) ? formatPlainCurrency(cost.totalNutMassKg, 3) : "",
          Number.isFinite(cost.setMassKg) ? formatPlainCurrency(cost.setMassKg, 3) : "",
          Number.isFinite(cost.setTotalMassKg) ? formatPlainCurrency(cost.setTotalMassKg, 3) : "",
          Number.isFinite(cost.studPitchMm) ? formatPlainCurrency(cost.studPitchMm, 2) : "",
          Number.isFinite(cost.studEffectiveDiameterMm)
            ? formatPlainCurrency(cost.studEffectiveDiameterMm, 3)
            : "",
          Number.isFinite(cost.nutAcrossFlatsMm) ? formatPlainCurrency(cost.nutAcrossFlatsMm, 2) : "",
          Number.isFinite(cost.nutThicknessMm) ? formatPlainCurrency(cost.nutThicknessMm, 2) : "",
          Number.isFinite(cost.studCorrectionFactor)
            ? formatPlainCurrency(cost.studCorrectionFactor, 2)
            : "",
          Number.isFinite(cost.nutCorrectionFactor)
            ? formatPlainCurrency(cost.nutCorrectionFactor, 2)
            : "",
          Number.isFinite(cost.numberOfNuts) ? formatPlainCurrency(cost.numberOfNuts, 0) : "",
          hasComponentUnitPrice(cost) ? formatPlainCurrency(cost.medianUnitRate, 0) : "",
          hasComponentTotals(cost) ? formatPlainCurrency(cost.medianTotal, 0) : "",
          hasComponentTotals(cost) ? formatPlainCurrency(cost.p90Total, 0) : "",
          cost.confidence || "",
          cost.note || "",
          item.sourceName,
        ]);
      });
    });
  }
  rows.push([]);
  rows.push(["Raw Steel Basis"]);
  rows.push(["Line", "Year", "Raw Steel Rs/kg", "Basis"]);
  items.forEach((item, index) => {
    rows.push([
      index + 1,
      item.year,
      formatPlainCurrency(item.rawSteel, 2),
      item.rawSteelBasis,
    ]);
  });
  if (overrideNotes.length > 0) {
    rows.push([]);
    rows.push(["Reviewer Override Check"]);
    overrideNotes.forEach((note) => rows.push([note]));
  }
  rows.push([]);
  rows.push(["Calculation Methodology"]);
  rows.push(["Pipe mass formula", "W = 0.0246615 x (OD - t) x t"]);
  rows.push(["W", "Pipe mass in kg/m"]);
  rows.push(["OD", "Actual outside diameter in mm from the built-in OD table"]);
  rows.push(["t", "Wall thickness in mm entered by the user"]);
  rows.push(["Total weight", "W x length in meter"]);
  rows.push(["Finished Rs/kg", "Raw steel Rs/kg x estimate factor"]);
  rows.push(["Rs/m", "Finished Rs/kg x pipe kg/m"]);
  rows.push(["Total Rs", "Rs/m x pipe length"]);
  rows.push(["90 degree LR elbow", "Developed length = 2.356 x actual OD. Elbow weight = pipe kg/m x developed length. CS factor bands: 2 IN = 5.00; above 2 to 4 IN = 3.50; above 4 to 20 IN = 2.50; above 20 to 26 IN = 2.80; above 26 to 48 IN = 3.20. Unit Rs = elbow weight x raw material Rs/kg x factor x material multiplier."]);
  rows.push(["45 degree elbow", "Uses 50% of the matching 90 degree elbow physical weight. Unit price = 65% of the matching 90 degree elbow price for NPS 2 to 6 IN, and 60% for NPS 8 to 48 IN."]);
  rows.push(["Equal tee", "Developed length = 2C + M - 0.5 x OD. Tee weight = pipe kg/m x developed length. PO-derived conversion factors: NPS 2 to 4 IN = 4.41; NPS 6 to 20 IN = 3.86; NPS 24 to 48 IN = 3.55. Unit Rs = tee weight x raw material Rs/kg x factor x material multiplier."]);
  rows.push(["Reducing tee", "Uses approved unequal-tee C and M dimensions. The run and branch pipe-weight portions are combined, then the same PO-derived Equal Tee factor is used for the run size. If dimensions are unavailable, the readable run-size Equal Tee price is used and labelled Equal tee fallback."]);
  rows.push(["Component Total Rs", "Approved group method x quantity; WN/SO/Blind flange price = JSON flange weight x raw material Rs/kg x P50 base multiplier; metric stud set price = complete-set mass x raw material Rs/kg x commercial factor 2.50"]);
  rows.push(["Reducing tee fallback", "When approved unequal-tee dimensions cannot produce a price, the app uses the equal-tee weight price for the readable run size and marks the row Equal tee fallback. Validate against supplier quotation."]);
  rows.push(["Metric stud mass", "Effective diameter = nominal diameter - (0.649519 x coarse pitch); stud mass = (PI/4) x effective diameter^2 x length x density x 1E-9"]);
  rows.push(["Heavy hex nut mass", "One-nut mass = [(SQRT(3)/2 x across-flats^2) - (PI/4 x effective diameter^2)] x nut thickness x 0.95 x density x 1E-9; two nuts are added to each stud"]);
  rows.push(["Metric stud set exclusions", "Calculated kg excludes washers, coatings, chamfers, thread tolerances, packing and manufacturing variation"]);
  rows.push([]);
  rows.push(["Factor Method"]);
  rows.push(["Coating Yes", "Normal factor 2.30, P90 factor 3.80"]);
  rows.push(["Coating No", "Normal factor 1.80, P90 factor 2.70"]);
  rows.push([
    "Estimate Factor Override",
    "Replaces normal factor; P90 is recalculated using the default P90-to-normal factor ratio",
  ]);
  rows.push([]);
  rows.push(["Material Category Basis"]);
  rows.push(["Category source", "astm_piping_material_specification_webapp.json"]);
  rows.push(["Pricing basis", "Same factor-based method is used across material categories in this version"]);
  rows.push([
    "Non-CS validation",
    "Validate SS, alloy, duplex, and non-ferrous rates with supplier quotations",
  ]);
  rows.push([]);
  rows.push(["Coating Definition"]);
  rows.push(["Internal coating", "Epoxy lined"]);
  rows.push(["External coating", "PE coated, meaning polyethylene coated"]);
  rows.push(["Coating Yes", "Use for internal coating, external coating, or both"]);
  rows.push([]);
  rows.push(["Disclaimer"]);
  rows.push([
    "This tool provides indicative Part A material and Part B direct-service estimates. Activities not explicitly included, testing, freight, taxes, packing, wastage, contractor margin, and commercial terms are excluded unless separately stated.",
  ]);

  return rows;
}

function exportCsvReport() {
  updateReportGenerated();
  const csv = buildCsvRows().map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const dateStamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `piping-cost-estimator-audit-report-${dateStamp}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function setExcelCell(sheet, address, value, style = {}) {
  const cell = typeof value === "object" && value !== null && (value.f || Object.prototype.hasOwnProperty.call(value, "v"))
    ? value
    : { v: value };
  // SheetJS needs an explicit cell type when a value is assigned manually.
  // Without it, some desktop Excel versions can show generated rows as blank.
  if (!cell.t) {
    if (typeof cell.v === "number") cell.t = "n";
    else if (typeof cell.v === "boolean") cell.t = "b";
    else if (cell.v === null || cell.v === undefined || cell.v === "") cell.t = "z";
    else cell.t = "s";
  }
  cell.s = style;
  sheet[address] = cell;
}

function buildPipingServicePartBSheet(serviceSummary) {
  const sheet = globalThis.XLSX.utils.aoa_to_sheet([[]]);
  const rows = getServicePartBRows(serviceSummary);
  const fill = (color) => ({ patternType: "solid", fgColor: { rgb: color } });
  const border = { bottom: { style: "thin", color: { rgb: "D7E2EC" } } };
  const titleStyle = { fill: fill("0B365F"), font: { color: { rgb: "FFFFFF" }, bold: true, sz: 16 }, alignment: { vertical: "center" } };
  const subtitleStyle = { fill: fill("153E66"), font: { color: { rgb: "D9EAF7" }, sz: 10 }, alignment: { vertical: "center" } };
  const labelStyle = { fill: fill("EAF3F8"), font: { color: { rgb: "0B365F" }, bold: true, sz: 9 }, alignment: { vertical: "center" }, border };
  const headerStyle = { fill: fill("EAF3F8"), font: { color: { rgb: "0B365F" }, bold: true, sz: 10 }, alignment: { horizontal: "center", vertical: "center", wrapText: true }, border };
  const textStyle = { font: { color: { rgb: "172B4D" } }, alignment: { vertical: "center", wrapText: true }, border };
  const currencyStyle = { ...textStyle, numFmt: '"Rs "#,##0.00' };
  const reviewStyle = { ...textStyle, font: { color: { rgb: "B42318" }, bold: true } };
  const userEnteredStyle = { fill: fill("FFF3E5"), font: { color: { rgb: "A1440A" }, bold: true }, alignment: { vertical: "center", wrapText: true }, border };
  const userEnteredCurrencyStyle = { ...userEnteredStyle, numFmt: '"Rs "#,##0.00' };
  const totalStyle = { fill: fill("FFF1E8"), font: { color: { rgb: "C62828" }, bold: true }, alignment: { vertical: "center" }, border, numFmt: '"Rs "#,##0.00' };
  const projectDescription = elements.projectDescription?.value.trim() || "Not specified";
  const projectNumber = elements.projectNumber?.value.trim() || "Not specified";

  setExcelCell(sheet, "A1", "Part B - Service Schedule-of-Rates Detail", titleStyle);
  setExcelCell(sheet, "A2", "Work-package quantity, rate, cost basis and review status", subtitleStyle);
  setExcelCell(sheet, "A3", "PROJECT / JOB DESCRIPTION", labelStyle);
  setExcelCell(sheet, "B3", projectDescription, textStyle);
  setExcelCell(sheet, "F3", "PROJECT NO. / MOC NO. / JOB NO.", labelStyle);
  setExcelCell(sheet, "G3", projectNumber, textStyle);
  ["SL. NO.", "SHORT DESCRIPTION", "JOB DESCRIPTION / ACTIVITIES", "UNIT", "QUANTITY", "RATE (Rs)", "AMOUNT (Rs)", "RATE SOURCE / NOTE", "STATUS"].forEach((header, column) => {
    setExcelCell(sheet, globalThis.XLSX.utils.encode_cell({ r: 3, c: column }), header, headerStyle);
  });
  rows.forEach((row, index) => {
    const excelRow = index + 5;
    const rowStyle = row.status === "REVIEW REQUIRED" ? reviewStyle : row.isUserEntered ? userEnteredStyle : textStyle;
    const values = [row.slNo, row.shortDescription, row.activityDescription, row.unit, row.quantity || "-", row.rate || "-", row.amount || "-", row.source, row.status === "REVIEW REQUIRED" ? "Review required" : row.isUserEntered ? "User entered" : row.status === "READY" ? "Ready" : "Not applicable"];
    values.forEach((value, column) => {
      const style = (column === 5 || column === 6) && typeof value === "number" ? (row.isUserEntered ? userEnteredCurrencyStyle : currencyStyle) : rowStyle;
      setExcelCell(sheet, globalThis.XLSX.utils.encode_cell({ r: excelRow - 1, c: column }), value, style);
    });
  });
  const totalRow = rows.length + 5;
  setExcelCell(sheet, `A${totalRow}`, "DIRECT SERVICE COST TOTAL", { ...totalStyle, numFmt: "General" });
  setExcelCell(sheet, `G${totalRow}`, { t: "n", f: `SUM(G5:G${totalRow - 1})`, v: serviceSummary.direct }, totalStyle);
  setExcelCell(sheet, `H${totalRow}`, "Taxes, escalation and contingency excluded", { ...totalStyle, numFmt: "General" });
  setExcelCell(sheet, `A${totalRow + 2}`, "Approval note", labelStyle);
  setExcelCell(sheet, `B${totalRow + 2}`, "This Part B summary is generated from the detailed Piping Service Cost calculation sheet. Rows marked Review required need a confirmed rate or missing BOM information before management approval.", textStyle);
  sheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
    { s: { r: 2, c: 1 }, e: { r: 2, c: 4 } },
    { s: { r: 2, c: 6 }, e: { r: 2, c: 8 } },
    { s: { r: totalRow - 1, c: 0 }, e: { r: totalRow - 1, c: 5 } },
    { s: { r: totalRow - 1, c: 7 }, e: { r: totalRow - 1, c: 8 } },
    { s: { r: totalRow + 1, c: 1 }, e: { r: totalRow + 1, c: 8 } },
  ];
  sheet["!cols"] = [{ wch: 9 }, { wch: 34 }, { wch: 58 }, { wch: 9 }, { wch: 13 }, { wch: 15 }, { wch: 17 }, { wch: 44 }, { wch: 17 }];
  sheet["!rows"] = [{ hpt: 28 }, { hpt: 19 }, { hpt: 24 }, { hpt: 32 }];
  sheet["!ref"] = globalThis.XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: totalRow + 1, c: 8 } });
  sheet["!autofilter"] = { ref: `A4:I${totalRow - 1}` };
  return sheet;
}

function buildEditableComponentSheet(groupName, groupItems) {
  const workbookRows = [
    ["Piping Material & Service Cost Estimator - Editable Component Cost Sheet"],
    ["Group", groupName],
    ["Edit pale-yellow cells only. Unit Rs, totals, and P90 values recalculate automatically in Microsoft Excel."],
    [],
    [
      "Item", "Size", "Rating / Thk", "Material", "Material Category", "Qty", "UOM",
      "Base Rate Rs", "Factor", "Unit Rs", "P90 Ratio", "Normal Total Rs", "P90 Total Rs",
      "Rate Status", "Source / Note",
    ],
  ];
  const sheet = globalThis.XLSX.utils.aoa_to_sheet(workbookRows);
  const headingStyle = { fill: { patternType: "solid", fgColor: { rgb: "0B365F" } }, font: { color: { rgb: "FFFFFF" }, bold: true }, alignment: { horizontal: "center", vertical: "center", wrapText: true }, border: { bottom: { style: "thin", color: { rgb: "D7E2EC" } } } };
  const titleStyle = { fill: { patternType: "solid", fgColor: { rgb: "0B365F" } }, font: { color: { rgb: "FFFFFF" }, bold: true, sz: 15 }, alignment: { vertical: "center" } };
  const editStyle = { fill: { patternType: "solid", fgColor: { rgb: "FFF2CC" } }, font: { color: { rgb: "172B4D" } }, alignment: { vertical: "center" }, border: { bottom: { style: "thin", color: { rgb: "E6D69A" } } } };
  const formulaStyle = { fill: { patternType: "solid", fgColor: { rgb: "EAF4F1" } }, font: { color: { rgb: "0B365F" } }, alignment: { vertical: "center" }, border: { bottom: { style: "thin", color: { rgb: "C5E3DA" } } } };
  const reviewStyle = { fill: { patternType: "solid", fgColor: { rgb: "FDECEC" } }, font: { color: { rgb: "B42318" }, bold: true }, alignment: { vertical: "center" } };
  const standardStyle = { alignment: { vertical: "center", wrapText: true } };
  const currencyEditStyle = { ...editStyle, numFmt: '"Rs "#,##0.00' };
  const currencyFormulaStyle = { ...formulaStyle, numFmt: '"Rs "#,##0.00' };
  setExcelCell(sheet, "A1", "Piping Material & Service Cost Estimator - Editable Component Cost Sheet", titleStyle);
  for (let column = 0; column < 15; column += 1) {
    setExcelCell(sheet, globalThis.XLSX.utils.encode_cell({ r: 4, c: column }), workbookRows[4][column], headingStyle);
  }

  groupItems.forEach((item, itemIndex) => {
    const rowNumber = itemIndex + 6;
    const cost = item.componentCost || {};
    const hasUnitRate = hasComponentUnitPrice(cost);
    const hasTotalRate = hasComponentTotals(cost);
    const quantity = Number(String(item.quantity || "").replace(/,/g, ""));
    const hasQuantity = Number.isFinite(quantity) && quantity > 0;
    const factor = Number(cost.factor);
    const usableFactor = Number.isFinite(factor) && factor > 0 ? factor : 1;
    const unitRate = hasUnitRate ? Number(cost.medianUnitRate) : NaN;
    const baseRate = Number.isFinite(unitRate) ? unitRate / usableFactor : "";
    const p90Ratio = Number.isFinite(cost.p90UnitRate) && Number.isFinite(unitRate) && unitRate > 0
      ? Number(cost.p90UnitRate) / unitRate
      : Number.isFinite(cost.p90Total) && Number.isFinite(cost.medianTotal) && cost.medianTotal > 0
        ? Number(cost.p90Total) / Number(cost.medianTotal)
        : "";
    const detail = [
      item.item || "", item.size || "", item.thickness || "", item.material || "",
      formatCategoryHeading(item.materialCategory || "Unclassified"), hasQuantity ? quantity : "", item.uom || "",
      baseRate, Number.isFinite(unitRate) ? usableFactor : "", "", p90Ratio, "", "",
      hasUnitRate && hasTotalRate ? "Priced" : "Review",
      [cost.note || "", item.sourceName || ""].filter(Boolean).join(" | "),
    ];
    detail.forEach((value, column) => {
      const address = globalThis.XLSX.utils.encode_cell({ r: rowNumber - 1, c: column });
      const isEditable = [5, 7, 8, 10].includes(column) && value !== "";
      setExcelCell(sheet, address, value, isEditable ? (column === 7 ? currencyEditStyle : editStyle) : standardStyle);
    });

    const unitAddress = `J${rowNumber}`;
    const normalAddress = `L${rowNumber}`;
    const p90Address = `M${rowNumber}`;
    setExcelCell(sheet, unitAddress, {
      t: hasUnitRate ? "n" : "s",
      f: `IF(AND(ISNUMBER(H${rowNumber}),ISNUMBER(I${rowNumber})),H${rowNumber}*I${rowNumber},"Review")`,
      v: Number.isFinite(unitRate) ? unitRate : "Review",
    }, hasUnitRate ? currencyFormulaStyle : reviewStyle);
    setExcelCell(sheet, normalAddress, {
      t: hasTotalRate ? "n" : "s",
      f: `IF(AND(ISNUMBER(F${rowNumber}),ISNUMBER(J${rowNumber})),F${rowNumber}*J${rowNumber},"Review")`,
      v: hasTotalRate ? Number(cost.medianTotal) : "Review",
    }, hasTotalRate ? currencyFormulaStyle : reviewStyle);
    setExcelCell(sheet, p90Address, {
      t: hasTotalRate ? "n" : "s",
      f: `IF(AND(ISNUMBER(L${rowNumber}),ISNUMBER(K${rowNumber})),L${rowNumber}*K${rowNumber},"Review")`,
      v: hasTotalRate ? Number(cost.p90Total) : "Review",
    }, hasTotalRate ? currencyFormulaStyle : reviewStyle);
    if (!hasUnitRate || !hasTotalRate) {
      setExcelCell(sheet, `N${rowNumber}`, "Review", reviewStyle);
    }
  });

  const totalRow = groupItems.length + 8;
  setExcelCell(sheet, `A${totalRow}`, "Group total", { font: { bold: true, color: { rgb: "0B365F" } } });
  setExcelCell(sheet, `L${totalRow}`, { t: "n", f: `SUM(L6:L${totalRow - 2})`, v: getComponentCostSummary(groupItems).normal }, currencyFormulaStyle);
  setExcelCell(sheet, `M${totalRow}`, { t: "n", f: `SUM(M6:M${totalRow - 2})`, v: getComponentCostSummary(groupItems).p90 }, currencyFormulaStyle);
  setExcelCell(sheet, `A${totalRow + 2}`, "Workbook note", { font: { bold: true, color: { rgb: "0B365F" } } });
  setExcelCell(sheet, `B${totalRow + 2}`, "Base Rate Rs, Factor, Qty and P90 Ratio are editable. The app-calculated Unit Rs is represented as Base Rate x Factor so commercial changes flow into all totals.", standardStyle);
  sheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 14 } }, { s: { r: 2, c: 0 }, e: { r: 2, c: 14 } }, { s: { r: totalRow + 1, c: 1 }, e: { r: totalRow + 1, c: 14 } }];
  sheet["!cols"] = [
    { wch: 26 }, { wch: 13 }, { wch: 17 }, { wch: 24 }, { wch: 25 }, { wch: 10 }, { wch: 10 },
    { wch: 15 }, { wch: 11 }, { wch: 14 }, { wch: 12 }, { wch: 18 }, { wch: 17 }, { wch: 13 }, { wch: 48 },
  ];
  sheet["!rows"] = [{ hpt: 24 }, {}, { hpt: 30 }, {}, { hpt: 32 }];
  // Expand the worksheet range beyond the original header rows. Without this,
  // SheetJS writes the headings but omits the BOM rows added below them.
  sheet["!ref"] = globalThis.XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: totalRow + 1, c: 14 },
  });
  sheet["!autofilter"] = { ref: `A5:O${Math.max(groupItems.length + 5, 5)}` };
  return { sheet, totalRow };
}

function buildPipingServiceCostSheet(serviceSummary) {
  const sheet = globalThis.XLSX.utils.aoa_to_sheet([[]]);
  const navy = "0B365F";
  const borderColor = "D7E2EC";
  const fill = (color) => ({ patternType: "solid", fgColor: { rgb: color } });
  const border = { bottom: { style: "thin", color: { rgb: borderColor } } };
  const titleStyle = { fill: fill(navy), font: { color: { rgb: "FFFFFF" }, bold: true, sz: 16 }, alignment: { vertical: "center" } };
  const labelStyle = { fill: fill("EAF3F8"), font: { color: { rgb: navy }, bold: true, sz: 10 }, alignment: { vertical: "center" }, border };
  const textStyle = { font: { color: { rgb: "172B4D" } }, alignment: { vertical: "center", wrapText: true }, border };
  const currencyStyle = { ...textStyle, numFmt: '"Rs "#,##0.00' };
  const headerStyle = { fill: fill("EAF3F8"), font: { color: { rgb: navy }, bold: true, sz: 10 }, alignment: { horizontal: "center", vertical: "center", wrapText: true }, border };
  const reviewStyle = { ...textStyle, font: { color: { rgb: "B42318" }, bold: true } };
  const projectDescription = elements.projectDescription?.value.trim() || "Not specified";
  const projectNumber = elements.projectNumber?.value.trim() || "Not specified";
  const designTemperature = elements.designTemperature?.value.trim() || "Not specified";

  setExcelCell(sheet, "A1", "Piping Service Cost Estimate", titleStyle);
  setExcelCell(sheet, "A2", "Preliminary pipe, fitting and flange erection/welding plus valve weight-based service cost", { fill: fill("153E66"), font: { color: { rgb: "D9EAF7" }, sz: 10 } });
  setExcelCell(sheet, "A3", "PROJECT / JOB DESCRIPTION", labelStyle);
  setExcelCell(sheet, "B3", projectDescription, textStyle);
  setExcelCell(sheet, "G3", "PROJECT NO. / MOC NO. / JOB NO.", labelStyle);
  setExcelCell(sheet, "H3", projectNumber, textStyle);
  setExcelCell(sheet, "A4", "INSTALLATION LOCATION", labelStyle);
  setExcelCell(sheet, "B4", serviceSummary.location.replace("_", " "), textStyle);
  setExcelCell(sheet, "D4", "REGULATORY CLASS", labelStyle);
  setExcelCell(sheet, "E4", serviceSummary.regulatoryClass.replace("_", "-"), textStyle);
  setExcelCell(sheet, "G4", "STOCK-LENGTH PROXY", labelStyle);
  setExcelCell(sheet, "H4", "Pipe: 6 m x 1.60, rounded up; fitting: connection ends; flange: 1 joint/No.; valve: calculated kg basis.", textStyle);
  setExcelCell(sheet, "K4", "DESIGN TEMPERATURE (C)", labelStyle);
  setExcelCell(sheet, "L4", designTemperature, textStyle);
  setExcelCell(sheet, "N4", "PAINTING SCOPE", labelStyle);
  setExcelCell(sheet, "O4", serviceSummary.painting.scope === "UNINSULATED" ? "Uninsulated CS/LTCS/AS piping" : "Painting under insulation (CUI)", textStyle);

  const headers = ["Component", "Size", "Thk mm", "BOM Material", "Material Category", "Length / Qty.", "Est. Joints", "Erection IM", "Welding ID", "Erection Rate Rs/IM", "Welding Rate Rs/ID", "Erection Cost", "Welding Cost", "Valve Wt kg", "Valve Rate Rs/kg", "Valve Service Cost", "Direct Service Cost", "Status / Rate Source"];
  headers.forEach((header, index) => setExcelCell(sheet, globalThis.XLSX.utils.encode_cell({ r: 5, c: index }), header, headerStyle));
  serviceSummary.rows.forEach((row, index) => {
    const excelRow = index + 7;
    const ready = row.status === "READY";
    const rowStyle = ready ? textStyle : reviewStyle;
    const source = ready
      ? [row.audit?.erectionSource, row.audit?.buttFabricationSource, row.audit?.valveServiceSource].filter(Boolean).join(" | ")
      : row.reason || "Review required.";
    const values = ready
      ? [row.item.item || row.scope || "Component", row.scope === "Valve" ? row.item.size || "-" : `${formatPipeSize(row.nps)} IN`, row.scope === "Valve" ? "-" : row.thicknessMm, row.item.material || "Unclassified", formatCategoryHeading(row.item.materialCategory || "Unclassified"), row.scope === "Pipe" ? row.lengthM : row.quantity, row.scope === "Valve" ? "-" : row.quantities.straightButtWeldJoints, row.scope === "Valve" ? "-" : row.quantities.erectionQuantityIM, row.scope === "Valve" ? "-" : row.quantities.buttWeldDiameterInch, row.scope === "Valve" ? "-" : row.rates.erectionRsPerIM, row.scope === "Valve" ? "-" : row.rates.buttFabricationRsPerID, row.scope === "Valve" ? "-" : row.costs.erectionCost, row.scope === "Valve" ? "-" : row.costs.buttFabricationCost, row.scope === "Valve" ? row.valveWeightKg : "-", row.scope === "Valve" ? row.valveServiceRateRsKg : "-", row.scope === "Valve" ? row.costs.valveServiceCost : "-", row.costs.directServiceCost, `${row.scope === "Valve" ? row.valveServiceBasis : row.rateLibrary?.label || "Ready"} | ${source}`]
      : [row.item.item || row.scope || "Component", row.item.size || "-", "Review", row.item.material || "Unclassified", formatCategoryHeading(row.item.materialCategory || "Unclassified"), row.item.quantity || "-", "Review", "Review", "Review", "Review", "Review", "Review", "Review", "Review", "Review", "Review", "Review", `Review - ${source}`];
    values.forEach((value, column) => {
      const address = globalThis.XLSX.utils.encode_cell({ r: excelRow - 1, c: column });
      const style = [9, 10, 11, 12, 14, 15, 16].includes(column) && ready ? currencyStyle : rowStyle;
      setExcelCell(sheet, address, value, style);
    });
  });
  const totalRow = Math.max(serviceSummary.rows.length + 8, 8);
  const totalStyle = { fill: fill("D9EAF7"), font: { color: { rgb: navy }, bold: true }, numFmt: '"Rs "#,##0.00' };
  setExcelCell(sheet, `A${totalRow}`, `REWORK / MODIFICATION (${formatNumber(serviceSummary.reworkRatePercent, 2)}% TOTAL PROJECT ID)`, { ...totalStyle, border });
  setExcelCell(sheet, `I${totalRow}`, serviceSummary.reworkId, { ...totalStyle, numFmt: '0.00 "ID"' });
  setExcelCell(sheet, `Q${totalRow}`, serviceSummary.rework, totalStyle);
  setExcelCell(sheet, `A${totalRow + 1}`, "PIPE SUPPORT STRUCTURAL COST", { ...totalStyle, border });
  setExcelCell(sheet, `N${totalRow + 1}`, serviceSummary.pipeSupport.weightMt, { ...totalStyle, numFmt: '0.000 "MT"' });
  setExcelCell(sheet, `O${totalRow + 1}`, pipeSupportRateRsPerMt, totalStyle);
  setExcelCell(sheet, `Q${totalRow + 1}`, serviceSummary.pipeSupport.cost, totalStyle);
  setExcelCell(sheet, `A${totalRow + 2}`, `CIVIL COST FOR PIPE SUPPORT (${serviceSummary.civilSupport.scopeLabel.toUpperCase()} ${formatNumber(serviceSummary.civilSupport.factorPercent, 0)}%)`, { ...totalStyle, border });
  setExcelCell(sheet, `N${totalRow + 2}`, serviceSummary.civilSupport.supportCount, { ...totalStyle, numFmt: '0 "Nos."' });
  setExcelCell(sheet, `O${totalRow + 2}`, serviceSummary.civilSupport.supportCount > 0 ? serviceSummary.pipeSupportCivil / serviceSummary.civilSupport.supportCount : 0, totalStyle);
  setExcelCell(sheet, `Q${totalRow + 2}`, serviceSummary.pipeSupportCivil, totalStyle);
  setExcelCell(sheet, `A${totalRow + 3}`, "PIPE PAINTING COST (P50)", { ...totalStyle, border });
  setExcelCell(sheet, `N${totalRow + 3}`, serviceSummary.painting.surfaceAreaM2, { ...totalStyle, numFmt: '0.00 "m2"' });
  setExcelCell(sheet, `O${totalRow + 3}`, serviceSummary.painting.rate?.rateRsPerM2 || 0, totalStyle);
  setExcelCell(sheet, `Q${totalRow + 3}`, serviceSummary.painting.cost, totalStyle);
  setExcelCell(sheet, `A${totalRow + 4}`, "PIPE INSULATION COST (P50)", { ...totalStyle, border });
  setExcelCell(sheet, `N${totalRow + 4}`, serviceSummary.insulation.surfaceAreaM2, { ...totalStyle, numFmt: '0.00 "m2"' });
  setExcelCell(sheet, `O${totalRow + 4}`, serviceSummary.insulation.rate?.rateRsPerM2 || 0, totalStyle);
  setExcelCell(sheet, `Q${totalRow + 4}`, serviceSummary.insulation.cost, totalStyle);
  setExcelCell(sheet, `A${totalRow + 5}`, "PWHT COST (IF APPLICABLE)", { ...totalStyle, border });
  setExcelCell(sheet, `I${totalRow + 5}`, serviceSummary.pwht.id, { ...totalStyle, numFmt: '0.00 "ID"' });
  setExcelCell(sheet, `Q${totalRow + 5}`, serviceSummary.pwht.cost, totalStyle);
  setExcelCell(sheet, `A${totalRow + 6}`, "DIRECT SERVICE COST TOTAL", { ...totalStyle, border });
  setExcelCell(sheet, `L${totalRow + 6}`, serviceSummary.erection, totalStyle);
  setExcelCell(sheet, `M${totalRow + 6}`, serviceSummary.welding, totalStyle);
  setExcelCell(sheet, `P${totalRow + 6}`, serviceSummary.valve, totalStyle);
  setExcelCell(sheet, `Q${totalRow + 6}`, serviceSummary.direct, totalStyle);
  setExcelCell(sheet, `A${totalRow + 8}`, "Audit note", labelStyle);
  setExcelCell(sheet, `B${totalRow + 8}`, "PWHT is evaluated only where the BOM Piping Class / PMS Class, material, and thickness match nrl_pwht_rules. PWHT quantity uses eligible pipe welding ID. CS and LTCS use Rs 408/ID; low-alloy P11/P12/P22 use Rs 559/ID; high-alloy P5/P9 use Rs 613/ID; P91/P92 use Rs 715/ID; Austenitic Stainless Steel uses the alloy-steel Rs 559/ID rate. Rows without a class or an exact applicable rule stay Review or Not applicable and are excluded. Pipe rows use erection plus welding: each pipe row is one run, with 6 m stock-length joints x 1.60, rounded up. Fittings use matching-pipe butt-weld rates with a connection-end proxy. Escalation, contingency, commissioning, taxes and commercial terms are excluded.", textStyle);
  sheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 17 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 17 } },
    { s: { r: 2, c: 1 }, e: { r: 2, c: 5 } },
    { s: { r: 2, c: 7 }, e: { r: 2, c: 12 } },
    { s: { r: totalRow + 7, c: 1 }, e: { r: totalRow + 7, c: 17 } },
  ];
  sheet["!cols"] = [{ wch: 18 }, { wch: 11 }, { wch: 10 }, { wch: 26 }, { wch: 24 }, { wch: 11 }, { wch: 12 }, { wch: 12 }, { wch: 11 }, { wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 13 }, { wch: 15 }, { wch: 18 }, { wch: 19 }, { wch: 48 }];
  sheet["!rows"] = [{ hpt: 27 }, { hpt: 19 }, { hpt: 23 }, { hpt: 23 }, {}, { hpt: 29 }];
  sheet["!ref"] = globalThis.XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: totalRow + 7, c: 17 } });
  sheet["!autofilter"] = { ref: `A6:R${Math.max(serviceSummary.rows.length + 6, 6)}` };
  return sheet;
}

function getUnsupportedBomUploadMessage() {
  return "This Excel file does not contain recognised piping BOM items. Please use the Download Example BOM Template under Upload Excel BOM, complete the required fields, and upload it again.";
}

function hasSupportedPipingBomItems() {
  return bomGroupItems.some((item) => item.group && item.group !== "Other Group");
}

function exportEditableBomExcelReport() {
  if (!hasSupportedPipingBomItems()) {
    window.alert(getUnsupportedBomUploadMessage());
    return;
  }
  if (!globalThis.XLSX) {
    window.alert("Excel export is not available yet. Reload the page and try again.");
    return;
  }

  const classifiedGroups = groupBomItems(bomGroupItems);
  // A source BOM may contain an unfamiliar component name. Keep its row in the
  // editable report instead of allowing an empty workbook to be downloaded.
  const groups = classifiedGroups.length
    ? classifiedGroups
    : [["Uploaded BOM Items", [...bomGroupItems]]];
  const workbook = globalThis.XLSX.utils.book_new();
  const serviceSummary = getPipingServiceEstimate();
  const usedNames = new Set();
  const groupSheets = groups.map(([groupName, groupItems]) => {
    let sheetName = String(groupName).replace(/[\\/?*\[\]:]/g, "").slice(0, 31) || "Component Group";
    let suffix = 2;
    while (usedNames.has(sheetName)) {
      sheetName = `${sheetName.slice(0, 28)} ${suffix}`;
      suffix += 1;
    }
    usedNames.add(sheetName);
    const built = buildEditableComponentSheet(groupName, groupItems);
    globalThis.XLSX.utils.book_append_sheet(workbook, built.sheet, sheetName);
    return { groupName, groupItems, sheetName, totalRow: built.totalRow };
  });

  const totalSummary = getComponentCostSummary(bomGroupItems);
  const servicePartBRows = getServicePartBRows(serviceSummary);
  const servicePartBTotalRow = servicePartBRows.length + 5;
  const serviceTotalFormula = `'Service Cost Part B'!G${servicePartBTotalRow}`;
  const dashboardGroups = [...groupSheets]
    .map((group) => ({ ...group, summary: getComponentCostSummary(group.groupItems) }))
    .sort((a, b) => b.summary.normal - a.summary.normal);
  const executiveSheet = globalThis.XLSX.utils.aoa_to_sheet([[]]);
  const colors = { navy: "0B365F", orange: "FF681F", cyan: "6FCAD0", teal: "56E3C4", light: "F3F8FB", line: "D7E2EC", text: "0B365F", red: "B42318" };
  const fill = (color) => ({ patternType: "solid", fgColor: { rgb: color } });
  const border = { bottom: { style: "thin", color: { rgb: colors.line } } };
  const titleStyle = { fill: fill(colors.navy), font: { color: { rgb: "FFFFFF" }, bold: true, sz: 17 }, alignment: { vertical: "center" } };
  const subtitleStyle = { fill: fill("153E66"), font: { color: { rgb: "D9EAF7" }, sz: 10 }, alignment: { vertical: "center" } };
  const projectLabelStyle = { fill: fill(colors.light), font: { color: { rgb: "57708C" }, bold: true, sz: 9 }, alignment: { vertical: "center" } };
  const projectValueStyle = { fill: fill(colors.light), font: { color: { rgb: colors.text }, bold: true }, alignment: { vertical: "center", wrapText: true } };
  const sectionStyle = { fill: fill(colors.navy), font: { color: { rgb: "FFFFFF" }, bold: true, sz: 12 }, alignment: { vertical: "center" } };
  const headerStyle = { fill: fill("EAF3F8"), font: { color: { rgb: colors.text }, bold: true, sz: 10 }, alignment: { horizontal: "center", vertical: "center", wrapText: true }, border };
  const textStyle = { font: { color: { rgb: "172B4D" } }, alignment: { vertical: "center" }, border };
  const currencyStyle = { font: { color: { rgb: colors.text } }, alignment: { vertical: "center" }, border, numFmt: '"Rs "#,##0.00' };
  const percentStyle = { font: { color: { rgb: "57708C" } }, alignment: { vertical: "center" }, border, numFmt: "0.00%" };
  const kpi = (color) => ({ fill: fill(color), font: { color: { rgb: "FFFFFF" }, bold: true, sz: 15 }, alignment: { vertical: "center", horizontal: "left" } });
  const kpiCurrency = (color) => ({ ...kpi(color), numFmt: '"Rs "#,##0.00' });
  const kpiLabel = (color) => ({ fill: fill(color), font: { color: { rgb: "DDEAF4" }, bold: true, sz: 9 }, alignment: { vertical: "center" } });
  const projectDescription = elements.projectDescription?.value.trim() || "Not specified";
  const projectNumber = elements.projectNumber?.value.trim() || "Not specified";
  const designTemperature = elements.designTemperature?.value.trim() || "Not specified";
  const componentHeaderRow = 13;
  const componentStartRow = componentHeaderRow + 1;
  const componentEndRow = componentStartRow + dashboardGroups.length - 1;
  const totalRow = componentEndRow + 1;
  const groupCostHeaderRow = componentHeaderRow;
  const groupCostStartRow = componentStartRow;
  const bridgeHeaderRow = componentHeaderRow;
  const bridgeStartRow = componentStartRow;
  const maximumNormal = Math.max(...dashboardGroups.map((group) => group.summary.normal), 1);

  setExcelCell(executiveSheet, "A1", "Piping Material & Service Cost Estimate Report", titleStyle);
  setExcelCell(executiveSheet, "A2", "Part A material estimate plus Part B direct piping service cost - editable Excel workbook", subtitleStyle);
  setExcelCell(executiveSheet, "A3", "PROJECT / JOB DESCRIPTION", projectLabelStyle);
  setExcelCell(executiveSheet, "B3", projectDescription, projectValueStyle);
  setExcelCell(executiveSheet, "I3", "PROJECT NO. / MOC NO. / JOB NO.", projectLabelStyle);
  setExcelCell(executiveSheet, "J3", projectNumber, projectValueStyle);
  setExcelCell(executiveSheet, "A4", "YEAR BASIS", projectLabelStyle);
  setExcelCell(executiveSheet, "B4", elements.year?.value || "Not specified", projectValueStyle);
  setExcelCell(executiveSheet, "D4", "DESIGN TEMPERATURE (C)", projectLabelStyle);
  setExcelCell(executiveSheet, "E4", designTemperature, projectValueStyle);
  setExcelCell(executiveSheet, "I4", "TOTAL BOM ITEMS", projectLabelStyle);
  setExcelCell(executiveSheet, "J4", bomGroupItems.length, projectValueStyle);

  setExcelCell(executiveSheet, "A7", "PART A - MATERIAL BASE", kpiLabel(colors.orange));
  setExcelCell(executiveSheet, "A8", { t: "n", f: `C${totalRow}`, v: totalSummary.normal }, kpiCurrency(colors.orange));
  setExcelCell(executiveSheet, "E7", "PART B - DIRECT SERVICE", kpiLabel(colors.navy));
  setExcelCell(executiveSheet, "E8", { t: "n", f: serviceTotalFormula, v: serviceSummary.direct }, kpiCurrency(colors.navy));
  setExcelCell(executiveSheet, "I7", "TOTAL BASE PROJECT COST", kpiLabel(colors.teal));
  setExcelCell(executiveSheet, "I8", { t: "n", f: `C${totalRow}+${serviceTotalFormula}`, v: totalSummary.normal + serviceSummary.direct }, kpiCurrency(colors.teal));
  setExcelCell(executiveSheet, "M7", "APPROVAL ENVELOPE", kpiLabel(colors.cyan));
  setExcelCell(executiveSheet, "M8", { t: "n", f: `D${totalRow}+${serviceTotalFormula}`, v: totalSummary.p90 + serviceSummary.direct }, kpiCurrency(colors.cyan));

  setExcelCell(executiveSheet, "A11", "Part A - Component Cost Summary", sectionStyle);
  ["Group", "Items", "Normal Total", "P90 Total", "Risk Reserve", "Share", "Status"].forEach((label, column) => {
    setExcelCell(executiveSheet, globalThis.XLSX.utils.encode_cell({ r: componentHeaderRow - 1, c: column }), label, headerStyle);
  });
  dashboardGroups.forEach((group, index) => {
    const row = componentStartRow + index;
    const quotedSheetName = `'${group.sheetName.replace(/'/g, "''")}'`;
    const share = totalSummary.normal > 0 ? group.summary.normal / totalSummary.normal : 0;
    const status = group.summary.review > 0 ? "Review required" : "Priced";
    setExcelCell(executiveSheet, `A${row}`, group.groupName, textStyle);
    setExcelCell(executiveSheet, `B${row}`, group.groupItems.length, textStyle);
    setExcelCell(executiveSheet, `C${row}`, { t: "n", f: `${quotedSheetName}!L${group.totalRow}`, v: group.summary.normal }, currencyStyle);
    setExcelCell(executiveSheet, `D${row}`, { t: "n", f: `${quotedSheetName}!M${group.totalRow}`, v: group.summary.p90 }, currencyStyle);
    setExcelCell(executiveSheet, `E${row}`, { t: "n", f: `D${row}-C${row}`, v: Math.max(group.summary.p90 - group.summary.normal, 0) }, currencyStyle);
    setExcelCell(executiveSheet, `F${row}`, { t: "n", f: `IFERROR(C${row}/$C$${totalRow},0)`, v: share }, percentStyle);
    setExcelCell(executiveSheet, `G${row}`, status, status === "Review required" ? { ...textStyle, font: { color: { rgb: colors.red }, bold: true } } : textStyle);
  });
  setExcelCell(executiveSheet, `A${totalRow}`, "TOTAL ESTIMATED MATERIAL COST", { fill: fill("D9EAF7"), font: { color: { rgb: colors.text }, bold: true }, border });
  setExcelCell(executiveSheet, `C${totalRow}`, { t: "n", f: `SUM(C${componentStartRow}:C${componentEndRow})`, v: totalSummary.normal }, { fill: fill("D9EAF7"), font: { color: { rgb: colors.text }, bold: true }, numFmt: '"Rs "#,##0.00' });
  setExcelCell(executiveSheet, `D${totalRow}`, { t: "n", f: `SUM(D${componentStartRow}:D${componentEndRow})`, v: totalSummary.p90 }, { fill: fill("D9EAF7"), font: { color: { rgb: colors.text }, bold: true }, numFmt: '"Rs "#,##0.00' });
  setExcelCell(executiveSheet, `E${totalRow}`, { t: "n", f: `D${totalRow}-C${totalRow}`, v: Math.max(totalSummary.p90 - totalSummary.normal, 0) }, { fill: fill("D9EAF7"), font: { color: { rgb: colors.text }, bold: true }, numFmt: '"Rs "#,##0.00' });
  setExcelCell(executiveSheet, `F${totalRow}`, { t: "n", f: "1", v: 1 }, { fill: fill("D9EAF7"), font: { color: { rgb: colors.text }, bold: true }, numFmt: "0.0%" });

  setExcelCell(executiveSheet, "I11", "Part A - Group-wise Cost", sectionStyle);
  ["Group", "Normal Total", "Share", "Visual bar"].forEach((label, offset) => {
    setExcelCell(executiveSheet, globalThis.XLSX.utils.encode_cell({ r: groupCostHeaderRow - 1, c: 8 + offset }), label, headerStyle);
  });
  const barColors = [colors.orange, "2F6E9E", colors.cyan, colors.navy, "5E8FAE", "86C9D5", "AFCAD9"];
  dashboardGroups.forEach((group, index) => {
    const row = groupCostStartRow + index;
    const sourceRow = componentStartRow + index;
    const barStyle = { font: { color: { rgb: barColors[index % barColors.length] }, bold: true, sz: 13 }, alignment: { vertical: "center" } };
    setExcelCell(executiveSheet, `I${row}`, { t: "s", f: `A${sourceRow}`, v: group.groupName }, textStyle);
    setExcelCell(executiveSheet, `J${row}`, { t: "n", f: `C${sourceRow}`, v: group.summary.normal }, currencyStyle);
    setExcelCell(executiveSheet, `K${row}`, { t: "n", f: `F${sourceRow}`, v: totalSummary.normal > 0 ? group.summary.normal / totalSummary.normal : 0 }, percentStyle);
    setExcelCell(executiveSheet, `L${row}`, { t: "s", f: `REPT(\"█\",MAX(1,ROUND(K${row}*24,0)))`, v: "█".repeat(Math.max(1, Math.round((group.summary.normal / maximumNormal) * 24))) }, barStyle);
  });

  setExcelCell(executiveSheet, "N11", "Project Approval Bridge", sectionStyle);
  ["Stage", "Value", "Visual"].forEach((label, offset) => {
    setExcelCell(executiveSheet, globalThis.XLSX.utils.encode_cell({ r: bridgeHeaderRow - 1, c: 13 + offset }), label, headerStyle);
  });
  const bridgeRows = [
    { label: "Part A - Material base", formula: `C${totalRow}`, value: totalSummary.normal, color: colors.orange },
    { label: "Part B - Service base", formula: serviceTotalFormula, value: serviceSummary.direct, color: colors.navy },
    { label: "Total base project cost", formula: `C${totalRow}+${serviceTotalFormula}`, value: totalSummary.normal + serviceSummary.direct, color: "2F6E9E" },
    { label: "Material reserve", formula: `D${totalRow}-C${totalRow}`, value: Math.max(totalSummary.p90 - totalSummary.normal, 0), color: colors.cyan },
    { label: "Approval envelope", formula: `D${totalRow}+${serviceTotalFormula}`, value: totalSummary.p90 + serviceSummary.direct, color: colors.teal },
  ];
  bridgeRows.forEach((bridge, index) => {
    const row = bridgeStartRow + index;
    const bridgeStyle = { fill: fill(bridge.color), font: { color: { rgb: "FFFFFF" }, bold: true }, alignment: { vertical: "center" } };
    setExcelCell(executiveSheet, `N${row}`, bridge.label, bridgeStyle);
    setExcelCell(executiveSheet, `O${row}`, { t: "n", f: bridge.formula, v: bridge.value }, { ...bridgeStyle, numFmt: '"Rs "#,##0.00' });
    setExcelCell(executiveSheet, `P${row}`, { t: "s", f: `REPT(\"█\",MAX(1,ROUND(O${row}/MAX($O$${bridgeStartRow}:$O$${bridgeStartRow + 2})*16,0)))`, v: "█".repeat(Math.max(1, Math.round((bridge.value / Math.max(totalSummary.p90, 1)) * 16))) }, bridgeStyle);
  });

  const partBHeaderRow = Math.max(totalRow + 3, bridgeStartRow + bridgeRows.length + 2);
  const partBStartRow = partBHeaderRow + 2;
  const sortedServicePartBRows = servicePartBRows
    .map((serviceRow, index) => ({ ...serviceRow, serviceSheetRow: index + 5 }))
    .sort((first, second) => second.amount - first.amount);
  const partBEndRow = partBStartRow + sortedServicePartBRows.length - 1;
  const partBTotalRow = partBEndRow + 1;
  setExcelCell(executiveSheet, `I${partBHeaderRow}`, "Part B - Service Cost Summary", sectionStyle);
  ["Work Package", "Direct Cost", "Share", "Visual bar"].forEach((label, offset) => {
    setExcelCell(executiveSheet, globalThis.XLSX.utils.encode_cell({ r: partBHeaderRow, c: 8 + offset }), label, headerStyle);
  });
  const maximumServiceCost = Math.max(...sortedServicePartBRows.map((row) => row.amount), 1);
  sortedServicePartBRows.forEach((serviceRow, index) => {
    const row = partBStartRow + index;
    const isReview = serviceRow.status === "REVIEW REQUIRED";
    const rowStyle = isReview ? { ...textStyle, font: { color: { rgb: colors.red }, bold: true } } : textStyle;
    const share = serviceSummary.direct > 0 ? serviceRow.amount / serviceSummary.direct : 0;
    const barStyle = { font: { color: { rgb: isReview ? colors.red : barColors[index % barColors.length] }, bold: true, sz: 13 }, alignment: { vertical: "center" } };
    const visualBlock = String.fromCharCode(9608);
    const visualBar = visualBlock.repeat(Math.max(1, Math.round((serviceRow.amount / maximumServiceCost) * 24)));
    const serviceSheetRow = serviceRow.serviceSheetRow;
    setExcelCell(executiveSheet, `I${row}`, serviceRow.shortDescription, rowStyle);
    setExcelCell(executiveSheet, `J${row}`, { t: "n", f: `'Service Cost Part B'!G${serviceSheetRow}`, v: serviceRow.amount }, isReview ? { ...currencyStyle, font: { color: { rgb: colors.red }, bold: true } } : currencyStyle);
    setExcelCell(executiveSheet, `K${row}`, { t: "n", f: `IFERROR(J${row}/$J$${partBTotalRow},0)`, v: share }, percentStyle);
    setExcelCell(executiveSheet, `L${row}`, { t: "s", f: `REPT("${visualBlock}",MAX(1,ROUND(K${row}*24,0)))`, v: visualBar }, barStyle);
    // Retained only temporarily to avoid changing unrelated generated code; it must not overwrite the clean Excel bar.
    if (false) {
    setExcelCell(executiveSheet, `L${row}`, { t: "s", f: `REPT(\"â–ˆ\",MAX(1,ROUND(K${row}*24,0)))`, v: "â–ˆ".repeat(Math.max(1, Math.round((serviceRow.amount / maximumServiceCost) * 24))) }, barStyle);
    }
  });
  setExcelCell(executiveSheet, `I${partBTotalRow}`, "TOTAL DIRECT SERVICE COST", { fill: fill("D9EAF7"), font: { color: { rgb: colors.text }, bold: true }, border });
  setExcelCell(executiveSheet, `J${partBTotalRow}`, { t: "n", f: serviceTotalFormula, v: serviceSummary.direct }, { fill: fill("D9EAF7"), font: { color: { rgb: colors.text }, bold: true }, numFmt: '"Rs "#,##0.00' });
  setExcelCell(executiveSheet, `K${partBTotalRow}`, { t: "n", f: "1", v: 1 }, { fill: fill("D9EAF7"), font: { color: { rgb: colors.text }, bold: true }, numFmt: "0.0%" });

  const noteRow = partBTotalRow + 3;
  setExcelCell(executiveSheet, `A${noteRow}`, "Workbook inputs", { fill: fill("FFF2CC"), font: { color: { rgb: colors.text }, bold: true } });
  setExcelCell(executiveSheet, `B${noteRow}`, "Pale-yellow cells in each group sheet are editable: Qty, Base Rate Rs, Factor and P90 Ratio. All totals and this Executive Summary recalculate in Excel.", { fill: fill("FFFBEA"), font: { color: { rgb: colors.text } }, alignment: { wrapText: true } });
  setExcelCell(executiveSheet, `A${noteRow + 1}`, "Scope", { fill: fill(colors.light), font: { color: { rgb: colors.text }, bold: true } });
  setExcelCell(executiveSheet, `B${noteRow + 1}`, "Part A is an indicative material estimate. Part B is direct piping service cost. Taxes, freight, escalation, contingency, packing, wastage, contractor margin and commercial terms are excluded unless separately stated.", { fill: fill(colors.light), font: { color: { rgb: colors.text } }, alignment: { wrapText: true } });
  executiveSheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 15 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 15 } },
    { s: { r: 2, c: 1 }, e: { r: 2, c: 7 } }, { s: { r: 2, c: 9 }, e: { r: 2, c: 15 } },
    { s: { r: 3, c: 1 }, e: { r: 3, c: 7 } }, { s: { r: 3, c: 9 }, e: { r: 3, c: 15 } },
    { s: { r: 6, c: 0 }, e: { r: 6, c: 3 } }, { s: { r: 7, c: 0 }, e: { r: 8, c: 3 } },
    { s: { r: 6, c: 4 }, e: { r: 6, c: 7 } }, { s: { r: 7, c: 4 }, e: { r: 8, c: 7 } },
    { s: { r: 6, c: 8 }, e: { r: 6, c: 11 } }, { s: { r: 7, c: 8 }, e: { r: 8, c: 11 } },
    { s: { r: 6, c: 12 }, e: { r: 6, c: 15 } }, { s: { r: 7, c: 12 }, e: { r: 8, c: 15 } },
    { s: { r: 10, c: 0 }, e: { r: 10, c: 6 } }, { s: { r: 10, c: 8 }, e: { r: 10, c: 11 } }, { s: { r: 10, c: 13 }, e: { r: 10, c: 15 } },
    { s: { r: partBHeaderRow - 1, c: 8 }, e: { r: partBHeaderRow - 1, c: 11 } },
    { s: { r: noteRow - 1, c: 1 }, e: { r: noteRow - 1, c: 15 } }, { s: { r: noteRow, c: 1 }, e: { r: noteRow, c: 15 } },
  ];
  executiveSheet["!cols"] = [{ wch: 25 }, { wch: 10 }, { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 12 }, { wch: 17 }, { wch: 3 }, { wch: 25 }, { wch: 16 }, { wch: 11 }, { wch: 29 }, { wch: 3 }, { wch: 18 }, { wch: 17 }, { wch: 22 }];
  executiveSheet["!rows"] = [{ hpt: 30 }, { hpt: 20 }, { hpt: 26 }, { hpt: 22 }, {}, {}, { hpt: 19 }, { hpt: 26 }, { hpt: 26 }, {}, { hpt: 22 }, { hpt: 21 }];
  executiveSheet["!ref"] = globalThis.XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: noteRow, c: 15 } });
  executiveSheet["!autofilter"] = { ref: `A${componentHeaderRow}:G${componentEndRow}` };
  globalThis.XLSX.utils.book_append_sheet(workbook, executiveSheet, "Executive Summary");
  workbook.SheetNames.unshift(workbook.SheetNames.pop());

  globalThis.XLSX.utils.book_append_sheet(
    workbook,
    buildPipingServicePartBSheet(serviceSummary),
    "Service Cost Part B"
  );

  globalThis.XLSX.utils.book_append_sheet(
    workbook,
    buildPipingServiceCostSheet(serviceSummary),
    "Piping Service Cost"
  );

  const methodSheet = globalThis.XLSX.utils.aoa_to_sheet([
    ["Calculation Methodology & Audit Trail"],
    ["Key pricing basis, derived quantities, rate sources and exclusions."],
    [],
    ["Part A - Material Cost Methodology"],
    ["Component pricing", "Each component follows its approved group method and quantity basis."],
    ["Pipe weight", "W = 0.0246615 x (OD - t) x t, where OD is actual outside diameter in mm and t is wall thickness in mm. Pipe total weight = kg/m x length."],
    ["90 degree LR elbows", "Developed length = 2.356 x actual OD. Elbow weight = pipe kg/m x developed length. CS factor bands: 2 IN = 5.00; above 2 to 4 IN = 3.50; above 4 to 20 IN = 2.50; above 20 to 26 IN = 2.80; above 26 to 48 IN = 3.20. Unit Rs = elbow weight x raw material Rs/kg x factor x material multiplier."],
    ["45 degree elbows", "Uses 50% of the matching 90 degree elbow physical weight. Unit price = 65% of matching 90 degree elbow price for NPS 2 to 6 IN, and 60% for NPS 8 to 48 IN."],
    ["Equal tees", "Developed length = 2C + M - 0.5 x OD. Tee weight = pipe kg/m x developed length. PO-derived conversion factors: NPS 2 to 4 IN = 4.41; NPS 6 to 20 IN = 3.86; NPS 24 to 48 IN = 3.55. Unit Rs = tee weight x raw material Rs/kg x factor x material multiplier."],
    ["Reducing tees", "Uses approved unequal-tee C and M dimensions; run and branch pipe-weight portions are combined, then the same PO-derived Equal Tee factor is used for the run size. When dimensions cannot produce a price, the readable run-size Equal Tee price is used and labelled Equal tee fallback."],
    ["Flanges", "WN, SO and Blind flange cost = JSON flange weight x raw material Rs/kg x P50 base multiplier x quantity."],
    ["Metric stud sets", "Cost = calculated stud-and-two-heavy-hex-nut mass x raw material Rs/kg x commercial raw-to-finished factor 2.50 x quantity. ASME B18.2.4.6M heavy-hex nut dimensions are used."],
    ["Other components", "Non-pipe components continue to use their approved component pricing methods."],
    ["Excluded from stud-set mass", "Washers, coatings, chamfers, thread tolerances and manufacturing variation."],
    ["Commercial scope", "This is an indicative material and direct-service estimate. Taxes, freight, escalation, contingency, packing, wastage, contractor margin and commercial terms are excluded unless separately stated."],
    [],
    ["Part B - Service Cost Methodology"],
    ["Rate library", "Carbon Steel uses CS rates, Austenitic Stainless Steel uses SS rates, and Alloy Steel uses AS rates. Unclassified rows use CS as a visible fallback; other unsupported categories remain Review."],
    ["Pipe erection and welding", "Each pipe row is treated as one run. Base joints = ceiling(pipe length / 6 m); estimated joints = ceiling(base joints x 1.60). Erection quantity = NPS x length in IM; welding quantity = estimated joints x NPS in ID."],
    ["PWHT", "Applied only when BOM Piping Class / PMS Class, material and wall thickness match NRL PWHT rules. Eligible rates are CS/LTCS Rs 408/ID, P11/P12/P22 Rs 559/ID, P5/P9 Rs 613/ID, and P91/P92 Rs 715/ID. Austenitic Stainless Steel uses the Rs 559/ID alloy-steel rate."],
    ["Pipe supports", `Structural steel per support = matching pipe kg/m x ${formatNumber(pipeSupportHeightM, 2)} m support height. Total structural steel MT = per-support steel x support count, using suggested maximum spans: 1 IN = 2 m, 2 IN = 3 m, 3-4 IN = 4 m, and 6-48 IN = 6 m; then x Rs 1,50,000/MT. Civil support cost for a 300 mm above-ground support = individual support count x size-based civil cost per support: 3 IN = Rs 6,000, 20 IN = Rs 17,000 and 48 IN = Rs 26,000, linearly interpolated and rounded upward to the next Rs 500. Inside Unit Battery Limit uses 30% of this civil cost; Outside Unit Battery Limit uses 100%.`],
    ["Insulation and painting", "Insulation = pi x OD (m) x length (m) x provisional P50 Rs/m2 at Design Temperature. Painting uses the same surface area: Rs 1,010/m2 at the 65C default; under-insulation rates are Rs 885/m2 from 65C to 200C, interpolate to Rs 2,220/m2 from 200C to 300C, then remain Rs 2,220/m2 to 500C."],
    ["Valve service", "Calculated valve material-cost weight x BOM quantity x IOCL-ME-SOR rate."],
    ["Excluded", "Commissioning, taxes, escalation and contingency."],
    [],
    ["Audit note", "Rows marked Review have incomplete BOM information or no calculated rate. Complete the required input before relying on the group total. Starting values are taken from the Piping Material & Service Cost Estimator calculation at the time of export."],
  ]);
  const methodHeaderStyle = { fill: fill(colors.navy), font: { color: { rgb: "FFFFFF" }, bold: true, sz: 15 }, alignment: { vertical: "center" } };
  const methodSubtitleStyle = { fill: fill(colors.light), font: { color: { rgb: "58708F" }, italic: true }, alignment: { wrapText: true, vertical: "center" } };
  const methodSectionStyle = { fill: fill("D9EAF7"), font: { color: { rgb: colors.navy }, bold: true, sz: 12 }, alignment: { vertical: "center" } };
  const methodLabelStyle = { fill: fill("F3F8FB"), font: { color: { rgb: colors.text }, bold: true }, alignment: { wrapText: true, vertical: "top" }, border };
  const methodTextStyle = { fill: fill("FFFFFF"), font: { color: { rgb: colors.text } }, alignment: { wrapText: true, vertical: "top" }, border };
  setExcelCell(methodSheet, "A1", "Calculation Methodology & Audit Trail", methodHeaderStyle);
  setExcelCell(methodSheet, "A2", "Key pricing basis, derived quantities, rate sources and exclusions.", methodSubtitleStyle);
  [4, 17].forEach((row) => setExcelCell(methodSheet, `A${row}`, methodSheet[`A${row}`].v, methodSectionStyle));
  [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 18, 19, 20, 21, 22, 23, 24, 26].forEach((row) => {
    setExcelCell(methodSheet, `A${row}`, methodSheet[`A${row}`].v, methodLabelStyle);
    setExcelCell(methodSheet, `B${row}`, methodSheet[`B${row}`].v, methodTextStyle);
  });
  methodSheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 1 } },
    { s: { r: 16, c: 0 }, e: { r: 16, c: 1 } },
  ];
  methodSheet["!cols"] = [{ wch: 31 }, { wch: 128 }];
  methodSheet["!rows"] = [{ hpt: 27 }, { hpt: 22 }, {}, { hpt: 22 }, { hpt: 28 }, { hpt: 35 }, { hpt: 62 }, { hpt: 35 }, { hpt: 52 }, { hpt: 52 }, { hpt: 35 }, { hpt: 45 }, { hpt: 28 }, { hpt: 28 }, { hpt: 42 }, {}, { hpt: 22 }, { hpt: 42 }, { hpt: 42 }, { hpt: 55 }, { hpt: 70 }, { hpt: 55 }, { hpt: 28 }, { hpt: 28 }, {}, { hpt: 42 }];
  methodSheet["!ref"] = globalThis.XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: 25, c: 1 } });
  globalThis.XLSX.utils.book_append_sheet(workbook, methodSheet, "Method and Audit");
  workbook.CalcPr = { calcMode: "auto", fullCalcOnLoad: "1", forceFullCalc: "1" };

  // A unique name prevents Excel from reopening an older same-day report that is still open.
  const fileStamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "").replace("T", "_");
  globalThis.XLSX.writeFile(workbook, `piping-material-cost-estimate-${fileStamp}.xlsx`);
  showSuccessMessage(
    `Excel report downloaded with ${bomGroupItems.length} BOM ${bomGroupItems.length === 1 ? "item" : "items"} across ${groups.length} ${groups.length === 1 ? "group" : "groups"}.`
  );
}

function printReport() {
  updateReportGenerated();
  document
    .querySelectorAll(".category-review-details, .category-audit-details, .bom-group-details, .service-cost-details, .audit-details")
    .forEach((details) => {
      details.open = true;
    });
  window.print();
}

function getBomReportGeneratedText() {
  return new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildBomCostReportHtml() {
  const groups = groupBomItems(bomGroupItems);
  const summary = getComponentCostSummary(bomGroupItems);
  const serviceSummary = getPipingServiceEstimate();
  const fallbackCount = bomGroupItems.filter((item) => item.componentCost?.isGenericFallback).length;
  const reportDate = getBomReportGeneratedText();
  const reportFileStamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "").replace("T", "_");
  const projectDescription = elements.projectDescription?.value.trim() || "Not specified";
  const projectNumber = elements.projectNumber?.value.trim() || "Not specified";
  const designTemperature = elements.designTemperature?.value.trim() || "Not specified";
  const groupStats = groups.map(([groupName, groupItems], groupIndex) => {
    const groupSummary = getComponentCostSummary(groupItems);
    const share = summary.normal > 0 ? (groupSummary.normal / summary.normal) * 100 : 0;
    const reserve = Math.max(groupSummary.p90 - groupSummary.normal, 0);
    const hasReview = groupSummary.review > 0 || groupSummary.normal <= 0;
    const status = hasReview ? "Pending" : share >= 40 ? "Priority" : "Checked";
    const action = hasReview
      ? `${groupSummary.review} (${formatCountInWords(groupSummary.review)}) ${
          groupSummary.review === 1 ? "item needs" : "items need"
        } review to calculate the group total.`
      : share >= 40
        ? "Validate rate source, class and factor"
        : "Routine check";
    return {
      groupIndex,
      groupName,
      groupItems,
      ...groupSummary,
      share,
      reserve,
      status,
      action,
    };
  });
  const maxP90 = Math.max(...groupStats.map((group) => group.p90), 1);
  const costDriver = groupStats.reduce(
    (driver, group) => (group.normal > driver.normal ? group : driver),
    { groupName: "Not available", normal: 0, share: 0 }
  );
  const riskReserve = Math.max(summary.p90 - summary.normal, 0);
  const totalBaseProjectCost = summary.normal + serviceSummary.direct;
  const totalApprovalEnvelope = summary.p90 + serviceSummary.direct;
  const materialBaseShare = totalBaseProjectCost > 0 ? (summary.normal / totalBaseProjectCost) * 100 : 0;
  const serviceBaseShare = totalBaseProjectCost > 0 ? (serviceSummary.direct / totalBaseProjectCost) * 100 : 0;
  const reserveLoading = totalBaseProjectCost > 0 ? (riskReserve / totalBaseProjectCost) * 100 : 0;
  const totalReviewItems = summary.review + serviceSummary.review;
  const totalPricedItems = summary.priced + serviceSummary.ready;
  const serviceCoreInstallation = serviceSummary.welding + serviceSummary.erection + serviceSummary.valve;
  const serviceAssociatedWorks = serviceSummary.pipeSupport.cost + serviceSummary.pipeSupportCivil + serviceSummary.painting.cost + serviceSummary.insulation.cost;
  const serviceSpecialProcesses = serviceSummary.rework + serviceSummary.pwht.cost;
  const serviceAdditionalWorks = serviceSummary.additionalServiceCost || 0;
  const serviceDriver = getServicePartBRows(serviceSummary)
    .filter((row) => row.status === "READY")
    .reduce((largest, row) => (Number(row.amount || 0) > largest.amount ? { label: row.shortDescription, amount: Number(row.amount || 0) } : largest), { label: "Not available", amount: 0 });
  const pricedWithoutFallback = Math.max(summary.priced - fallbackCount, 0);
  const totalTrackedItems = Math.max(pricedWithoutFallback + summary.review + fallbackCount, 1);
  const pricedPct = (pricedWithoutFallback / totalTrackedItems) * 100;
  const reviewPct = (summary.review / totalTrackedItems) * 100;
  const reviewStart = pricedPct;
  const fallbackStart = pricedPct + reviewPct;
  const sortedGroupStatsForChart = [...groupStats].sort((a, b) => b.normal - a.normal);
  const groupRows = sortedGroupStatsForChart
    .map((group) => {
      return `
        <tr class="${group.status === "Pending" ? "pending-row pending-navigation-row" : ""}"${
          group.status === "Pending"
            ? ` data-review-target="material-group-${group.groupIndex}" tabindex="0" role="link" aria-label="Go to ${escapeHtml(group.groupName)} items needing review"`
            : ""
        }>
          <td>${escapeHtml(group.groupName)}</td>
          <td>${group.groupItems.length}</td>
          <td>${formatCurrency(group.normal, 0)}</td>
          <td>${formatCurrency(group.p90, 0)}</td>
          <td>${formatCurrency(group.reserve, 0)}</td>
          <td>${formatNumber(group.share, 1)}%</td>
          <td>${
            group.status === "Pending"
              ? `<a class="badge pending pending-link" href="#material-group-${group.groupIndex}" data-review-target="material-group-${group.groupIndex}" title="Go to the original items needing review">${group.status}</a>`
              : `<span class="badge ${group.status.toLowerCase()}">${group.status}</span>`
          }</td>
          <td class="${group.status === "Pending" ? "pending-action" : ""}">${escapeHtml(group.action)}</td>
        </tr>
      `;
    })
    .join("");
  const barRows = sortedGroupStatsForChart
    .map((group, groupIndex) => {
      const normalWidth = Math.max((group.normal / maxP90) * 100, group.normal > 0 ? 2 : 0);
      const p90Width = Math.max((group.p90 / maxP90) * 100, group.p90 > 0 ? 2 : 0);
      return `
        <div class="bar-row">
          <div class="bar-label">${escapeHtml(group.groupName)}</div>
          <div class="bar-track">
            <span class="bar-risk" style="width:${formatNumber(p90Width, 1)}%"></span>
            <span class="bar-base ${groupIndex === 0 ? "tone-driver" : `tone-${((groupIndex - 1) % 3) + 1}`}" style="width:${formatNumber(
              normalWidth,
              1
            )}%"></span>
          </div>
          <div class="bar-value">
            <strong>${formatCurrency(group.normal, 0)}</strong>
            <span>${formatNumber(group.share, 1)}%</span>
          </div>
        </div>
      `;
    })
    .join("");
  const serviceCategoryRows = [
    { category: "Core piping installation", sourceRows: "Rows 1-5", amount: serviceCoreInstallation, review: serviceSummary.review, action: "Focus on fabrication, erection and rate source" },
    { category: "Associated works", sourceRows: "Rows 7-10", amount: serviceAssociatedWorks, review: serviceSummary.pipeSupport.review + serviceSummary.painting.review + serviceSummary.insulation.review, action: "Support, civil, painting and insulation" },
    { category: "Modification & special processes", sourceRows: "Rows 6 and 11", amount: serviceSpecialProcesses, review: serviceSummary.pwht.review, action: "Rework and PWHT" },
    ...(serviceAdditionalWorks > 0 ? [{ category: "User-entered additional services", sourceRows: "Additional rows", amount: serviceAdditionalWorks, review: 0, action: "Validate user-entered scope and rate" }] : []),
  ]
    .map((entry) => {
      const status = entry.review > 0 ? "Pending" : "Ready";
      const share = serviceSummary.direct > 0 ? (entry.amount / serviceSummary.direct) * 100 : 0;
      return `<tr class="${status === "Pending" ? "pending-row" : ""}"><td>${entry.category}</td><td>${entry.sourceRows}</td><td>${formatCurrency(entry.amount, 0)}</td><td>${formatNumber(share, 1)}%</td><td><span class="badge ${status === "Pending" ? "pending" : "checked"}">${status}</span></td><td>${entry.action}</td></tr>`;
    })
    .join("");
  const detailSections = groupStats
    .map((group, groupIndex) => {
      const isBoltGroup = /bolt/i.test(group.groupName);
      return `
        <section class="report-group" id="material-group-${groupIndex}">
          <div class="report-group-title">
            <span>${groupIndex + 1}</span>
            <div>
              <h2>${escapeHtml(group.groupName)}</h2>
              <p>${group.groupItems.length} item(s) | Normal ${formatCurrency(
                group.normal,
                0
              )} | P90 ${formatCurrency(group.p90, 0)}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Size</th>
                <th>Rating / Thk</th>
                <th>Material</th>
                <th>Material Category</th>
                <th>Qty</th>
                <th>UOM</th>
                ${isBoltGroup ? "<th>Set wt (kg)</th>" : ""}
                <th>Factor</th>
                <th>Unit Rs</th>
                <th>Normal Total</th>
                <th>P90 Total</th>
              </tr>
            </thead>
            <tbody>
              ${group.groupItems
                .map((item) => {
                  const cost = item.componentCost || {};
                  const needsReview = !hasComponentUnitPrice(cost) || !hasComponentTotals(cost);
                  return `
                    <tr class="${needsReview ? "pending-row" : ""}">
                      <td>${escapeHtml(item.item)}</td>
                      <td>${escapeHtml(item.size || "-")}</td>
                      <td>${escapeHtml(item.thickness || "-")}</td>
                      <td>${escapeHtml(item.material || "-")}</td>
                      <td>${escapeHtml(formatCategoryHeading(item.materialCategory || "Unclassified"))}</td>
                      <td>${escapeHtml(item.quantity || "-")}</td>
                      <td>${escapeHtml(item.uom || "-")}</td>
                      ${
                        isBoltGroup
                          ? `<td>${Number.isFinite(cost.setMassKg) ? formatNumber(cost.setMassKg, 3) : "-"}</td>`
                          : ""
                      }
                      <td>${Number.isFinite(cost.factor) ? formatNumber(cost.factor, 2) : "-"}${
                        cost.isGenericFallback
                          ? ' <small class="fallback">Fallback</small>'
                          : cost.equalTeeFallbackUsed
                            ? ' <small class="fallback">Equal tee fallback</small>'
                            : ""
                      }</td>
                      <td>${hasComponentUnitPrice(cost) ? formatCurrency(cost.medianUnitRate, 0) : "Review"}</td>
                      <td>${hasComponentTotals(cost) ? formatCurrency(cost.medianTotal, 0) : "Review"}</td>
                      <td>${hasComponentTotals(cost) ? formatCurrency(cost.p90Total, 0) : "Review"}</td>
                    </tr>
                  `;
                })
                .join("")}
            </tbody>
          </table>
        </section>
      `;
    })
    .join("");
  const servicePartBRows = getServicePartBRows(serviceSummary);
  const servicePartBReview = servicePartBRows.filter((row) => row.status === "REVIEW REQUIRED").length;
  const serviceScheduleCards = servicePartBRows
    .map((row) => {
      const isReview = row.status === "REVIEW REQUIRED";
      const quantity = row.quantity > 0 ? `${formatNumber(row.quantity, row.unit === "MT" ? 3 : 2)} ${row.unit}` : "No eligible quantity";
      const rate = row.rate > 0 ? `${formatCurrency(row.rate, 2)}/${row.unit}` : "Rate requires review";
      return `<div class="service-schedule-card${isReview ? " review-card" : ""}">
        <span class="service-card-label"><b class="service-card-reference">${row.slNo}</b>${escapeHtml(row.shortDescription)}</span>
        <strong class="service-card-quantity">Qty: ${quantity}</strong>
        <small class="service-card-cost">Cost: ${row.amount > 0 ? formatCurrency(row.amount, 0) : "Rs 0.00"}</small>
        <small class="service-card-rate">Rate: ${rate}${isReview ? " | Review required" : ""}</small>
      </div>`;
    })
    .join("");
  const servicePartBSection = `
    <section class="service-part-b-report">
      <div class="service-part-b-report-head">
        <div><h3>Part B - Service Schedule-of-Rates Detail</h3><p>Work-package quantity, rate, cost basis and review status | ${servicePartBRows.length - servicePartBReview} priced work packages | ${servicePartBReview} need review</p></div>
        <span>Direct service cost: ${formatCurrency(serviceSummary.direct, 2)}</span>
      </div>
      <table class="service-part-b-report-table">
        <thead><tr><th>Sl.</th><th>Short Description</th><th>Job Description / Activities</th><th>Unit</th><th>Quantity</th><th>Rate</th><th>Amount</th><th>Rate Source / Note</th><th>Status</th></tr></thead>
        <tbody>${servicePartBRows.map((row) => `<tr class="${row.status === "REVIEW REQUIRED" ? "pending-row" : ""}${row.isUserEntered ? " user-entered-service-row" : ""}"><td>${row.slNo}</td><td>${escapeHtml(row.shortDescription)}</td><td>${escapeHtml(row.activityDescription)}</td><td>${row.unit}</td><td>${row.quantity > 0 ? formatNumber(row.quantity, row.unit === "MT" ? 3 : 2) : "-"}</td><td>${row.rate > 0 ? formatCurrency(row.rate, 2) : "-"}</td><td>${row.amount > 0 ? formatCurrency(row.amount, 2) : "-"}</td><td>${escapeHtml(row.source)}</td><td>${row.status === "REVIEW REQUIRED" ? "Review required" : row.isUserEntered ? "User entered" : row.status === "READY" ? "Ready" : "Not applicable"}</td></tr>`).join("")}</tbody>
        <tfoot><tr><td colspan="6">Direct Service Cost Total</td><td>${formatCurrency(serviceSummary.direct, 2)}</td><td colspan="2">Taxes, escalation and contingency excluded</td></tr></tfoot>
      </table>
    </section>`;
  const serviceVisualItems = servicePartBRows
    .filter((row) => row.amount > 0 || row.status === "REVIEW REQUIRED")
    .sort((first, second) => second.amount - first.amount);
  const maximumServiceItemCost = Math.max(...serviceVisualItems.map((row) => row.amount), 1);
  const serviceItemBars = serviceVisualItems
    .map((row, index) => {
      const share = serviceSummary.direct > 0 ? (row.amount / serviceSummary.direct) * 100 : 0;
      const width = Math.max((row.amount / maximumServiceItemCost) * 100, row.amount > 0 ? 2 : 0);
      const quantity = row.quantity > 0 ? `${formatNumber(row.quantity, row.unit === "MT" ? 3 : 2)} ${row.unit}` : "Review";
      const rate = row.rate > 0 ? `${formatCurrency(row.rate, 2)}/${row.unit}` : "Review";
      return `<div class="bar-row service-bar-row">
        <div class="bar-label" title="${escapeHtml(row.shortDescription)}">${escapeHtml(row.shortDescription)}</div>
        <div class="bar-track"><span class="bar-base ${index === 0 ? "tone-driver" : `tone-${((index - 1) % 3) + 1}`}" style="width:${formatNumber(width, 1)}%"></span></div>
        <div class="bar-value"><div class="bar-value-line"><strong>${formatCurrency(row.amount, 2)}</strong><b class="bar-quantity"> | Qty: ${quantity}</b></div><div class="bar-value-line"><span>${formatNumber(share, 1)}%</span><b class="bar-rate"> | Rate: ${rate}</b></div></div>
      </div>`;
    })
    .join("");
  const serviceVisualSection = `
    <section class="report-panel service-distribution-panel">
      <h2>Service Item Cost Distribution</h2>
      <div class="bar-list">${serviceItemBars || '<p class="meta">No service items are ready for visual comparison.</p>'}</div>
      <p class="report-note">Items are ordered from highest to lowest direct service cost.</p>
    </section>`;
  const serviceRowsByScopeAndCategory = serviceSummary.rows.reduce((groups, row) => {
    const scope = row.scope || "Pipe";
    const category = row.item.materialCategory || "Unclassified";
    if (!groups.has(scope)) groups.set(scope, new Map());
    if (!groups.get(scope).has(category)) groups.get(scope).set(category, []);
    groups.get(scope).get(category).push(row);
    return groups;
  }, new Map());
  const serviceDetailedScopeOrder = ["Pipe", "Fitting", "Flange", "Valve"];
  const serviceDetailedSections = serviceDetailedScopeOrder
    .filter((scope) => serviceRowsByScopeAndCategory.has(scope))
    .map((scope, scopeIndex) => {
      const headers = scope === "Pipe"
        ? ["Component", "Size", "Thk mm", "BOM Material", "Length m", "Est. Joints", "Erection IM", "Welding ID", "Erection Rate", "Welding Rate", "Erection Cost", "Welding Cost", "Direct Service Cost", "Status / Rate Source"]
        : scope === "Valve"
        ? ["Component", "Size", "BOM Material", "Qty.", "Valve Wt kg", "Service Rate", "Valve Service Cost", "Direct Service Cost", "Status / Rate Source"]
        : ["Component", "Size", "Thk mm", "BOM Material", "Qty.", "Est. Joints", "Welding ID", "Welding Rate", "Welding Cost", "Direct Service Cost", "Status / Rate Source"];
      const categoryTables = Array.from(serviceRowsByScopeAndCategory.get(scope).entries())
        .sort(([first], [second]) => first.localeCompare(second))
        .map(([category, categoryRows]) => {
          const body = categoryRows.map((row) => {
            const ready = row.status === "READY";
            const source = ready ? [row.audit?.erectionSource, row.audit?.buttFabricationSource, row.audit?.valveServiceSource].filter(Boolean).join(" | ") : row.reason || "Review required.";
            const component = `<td>${escapeHtml(row.item.item || scope)}</td>`;
            const size = `<td>${ready && scope !== "Valve" ? `${formatPipeSize(row.nps)} IN` : escapeHtml(row.item.size || "-")}</td>`;
            const material = `<td>${escapeHtml(row.item.material || "Unclassified")}</td>`;
            const status = `<td>${ready ? escapeHtml(scope === "Valve" ? row.audit?.valveServiceSource || "IOCL-ME-SOR" : `${row.rateLibrary?.label || "Ready"} | ${source}`) : `Review - ${escapeHtml(source)}`}</td>`;
            if (scope === "Valve") return `<tr class="${ready ? "" : "pending-row"}">${component}${size}${material}<td>${ready ? formatNumber(row.quantity, 2) : "Review"}</td><td>${ready ? formatNumber(row.valveWeightKg, 2) : "Review"}</td><td>${ready ? `${formatCurrency(row.valveServiceRateRsKg, 2)}/kg` : "Review"}</td><td>${ready ? formatCurrency(row.costs.valveServiceCost, 2) : "Review"}</td><td>${ready ? formatCurrency(row.costs.directServiceCost, 2) : "Review"}</td>${status}</tr>`;
            const thickness = `<td>${ready ? formatNumber(row.thicknessMm, 2) : "Review"}</td>`;
            const quantity = `<td>${ready ? formatNumber(scope === "Pipe" ? row.lengthM : row.quantity, 2) : "Review"}</td>`;
            const joints = `<td>${ready ? formatNumber(row.quantities.straightButtWeldJoints, 0) : "Review"}</td>`;
            const weldingId = `<td>${ready ? formatNumber(row.quantities.buttWeldDiameterInch, 2) : "Review"}</td>`;
            const weldingRate = `<td>${ready ? formatCurrency(row.rates.buttFabricationRsPerID, 2) : "Review"}</td>`;
            const weldingCost = `<td>${ready ? formatCurrency(row.costs.buttFabricationCost, 2) : "Review"}</td>`;
            if (scope !== "Pipe") return `<tr class="${ready ? "" : "pending-row"}">${component}${size}${thickness}${material}${quantity}${joints}${weldingId}${weldingRate}${weldingCost}<td>${ready ? formatCurrency(row.costs.directServiceCost, 2) : "Review"}</td>${status}</tr>`;
            return `<tr class="${ready ? "" : "pending-row"}">${component}${size}${thickness}${material}${quantity}${joints}<td>${ready ? formatNumber(row.quantities.erectionQuantityIM, 2) : "Review"}</td>${weldingId}<td>${ready ? formatCurrency(row.rates.erectionRsPerIM, 2) : "Review"}</td>${weldingRate}<td>${ready ? formatCurrency(row.costs.erectionCost, 2) : "Review"}</td>${weldingCost}<td>${ready ? formatCurrency(row.costs.directServiceCost, 2) : "Review"}</td>${status}</tr>`;
          }).join("");
          return `<section class="service-detail-category"><div class="service-detail-category-head"><h4>${escapeHtml(formatCategoryHeading(category))}</h4></div><table class="service-detail-report-table"><thead><tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table></section>`;
        }).join("");
      const scopeRows = Array.from(serviceRowsByScopeAndCategory.get(scope).values()).flat();
      const scopeReady = scopeRows.filter((row) => row.status === "READY");
      const scopeReview = scopeRows.length - scopeReady.length;
      const scopeCost = scopeReady.reduce((amount, row) => amount + (Number(row.costs?.directServiceCost) || 0), 0);
      return `<section class="service-detail-scope"><div class="service-detail-scope-head"><span class="service-scope-number">${scopeIndex + 1}</span><div><h3>${scope} Service</h3><p>${scopeRows.length} item(s) | Direct service ${formatCurrency(scopeCost, 2)} | ${scopeReview} review</p></div></div>${categoryTables}</section>`;
    }).join("");
  const serviceReportRows = serviceSummary.rows
    .map((row) => {
      const isReady = row.status === "READY";
      return `
        <tr class="${isReady ? "" : "pending-row"}">
          <td>${escapeHtml(row.item.item || row.scope || "Component")}</td>
          <td>${isReady && row.scope !== "Valve" ? `${formatPipeSize(row.nps)} IN` : escapeHtml(row.item.size || "-")}</td>
          <td>${isReady && row.scope !== "Valve" ? formatNumber(row.thicknessMm, 2) : "-"}</td>
          <td>${escapeHtml(row.item.material || "Unclassified")}</td>
          <td>${escapeHtml(formatCategoryHeading(row.item.materialCategory || "Unclassified"))}</td>
          <td>${isReady ? `${formatNumber(row.scope === "Pipe" ? row.lengthM : row.quantity, 2)} ${escapeHtml(row.scope === "Pipe" ? "m" : row.item.uom || "Nos.")}` : escapeHtml(row.item.quantity || "-")}</td>
          <td>${isReady && row.scope !== "Valve" ? formatNumber(row.quantities.straightButtWeldJoints, 0) : "-"}</td>
          <td>${isReady && row.scope !== "Valve" ? formatNumber(row.quantities.erectionQuantityIM, 2) : "-"}</td>
          <td>${isReady && row.scope !== "Valve" ? formatNumber(row.quantities.buttWeldDiameterInch, 2) : "-"}</td>
          <td>${isReady && row.scope !== "Valve" ? formatCurrency(row.costs.erectionCost, 0) : "-"}</td>
          <td>${isReady && row.scope !== "Valve" ? formatCurrency(row.costs.buttFabricationCost, 0) : "-"}</td>
          <td>${isReady && row.scope === "Valve" ? `${formatNumber(row.valveWeightKg, 2)} kg` : "-"}</td>
          <td>${isReady && row.scope === "Valve" ? `${formatCurrency(row.valveServiceRateRsKg, 2)}/kg` : "-"}</td>
          <td>${isReady && row.scope === "Valve" ? formatCurrency(row.costs.valveServiceCost, 0) : "-"}</td>
          <td>${isReady ? formatCurrency(row.costs.directServiceCost, 0) : "Review"}</td>
          <td>${escapeHtml(isReady ? row.scope === "Valve" ? row.audit?.valveServiceSource || "IOCL-ME-SOR" : `${row.rateLibrary?.label || "Ready"} (${row.rateLibrary?.code || "-"})` : row.reason || "Review required")}</td>
        </tr>`;
    })
    .join("");
  const displayServiceLocation = serviceSummary.location === "ABOVE_GROUND" ? "Above Ground" : "Underground";
  const displayRegulatoryClass = serviceSummary.regulatoryClass === "NON_IBR" ? "Non-IBR" : "IBR";
  const serviceReportSection = `
    <div class="section-head service-section-head report-page-start">
      <div><h2>Part B - Piping Service Cost</h2><p>Direct service estimate using schedule-of-rates and derived quantity logic.</p></div>
      <span class="pill">No service reserve applied</span>
    </div>
    <div class="subsection-head report-summary-title"><h3>Piping Service Cost Summary</h3><span>No Estimate Bridge</span></div>
    <div class="part-summary-grid">
      <article><span>Direct service cost</span><strong>${formatCurrency(serviceSummary.direct, 0)}</strong><small>Taxes, escalation and contingency excluded.</small></article>
      <article><span>Core piping installation</span><strong>${formatCurrency(serviceCoreInstallation, 0)}</strong><small>${formatNumber(serviceSummary.direct > 0 ? (serviceCoreInstallation / serviceSummary.direct) * 100 : 0, 1)}% of service cost.</small></article>
      <article><span>Associated works</span><strong>${formatCurrency(serviceAssociatedWorks, 0)}</strong><small>${formatNumber(serviceSummary.direct > 0 ? (serviceAssociatedWorks / serviceSummary.direct) * 100 : 0, 1)}% of service cost.</small></article>
      <article><span>Main cost driver</span><strong>${escapeHtml(serviceDriver.label)}</strong><small>${formatCurrency(serviceDriver.amount, 0)} direct cost.</small></article>
    </div>
    ${serviceVisualSection}
    <section class="service-build-up-panel report-page-start">
      <div class="service-build-up-heading">
        <div><h3>Service Basis, Quantities & Cost Build-up</h3><p>Key work volumes and preliminary direct-service cost allowances.</p></div>
        <span>Direct SOR cost only</span>
      </div>
      <div class="service-report-summary">
      ${serviceScheduleCards}
      <div><span>Service basis</span><strong>${escapeHtml(displayServiceLocation)} / ${escapeHtml(displayRegulatoryClass)}</strong></div>
      <div><span>Eligible service rows</span><strong>${serviceSummary.ready}</strong></div>
      <div><span>Need review</span><strong>${serviceSummary.review}</strong></div>
      <div><span>Direct service cost</span><strong>${formatCurrency(serviceSummary.direct, 0)}</strong></div>
      </div>
    </section>
    <section class="service-category-summary-report">
      <div class="subsection-head"><h3>Service Cost Category Summary</h3><span>Direct SOR cost only</span></div>
      <table><thead><tr><th>Category</th><th>Source Rows</th><th>Direct Cost</th><th>Share</th><th>Status</th><th>Management Review</th></tr></thead><tbody>${serviceCategoryRows}<tr class="service-total-row"><td>Total service cost</td><td>Rows 1-11</td><td>${formatCurrency(serviceSummary.direct, 0)}</td><td>100.0%</td><td><span class="badge checked">Ready</span></td><td>Taxes, escalation and contingency excluded</td></tr></tbody></table>
      <p class="report-note">Do not add the material reserve percentage automatically to Part B. Any future service contingency should be based on approved quantity, productivity, site-condition or schedule uncertainty.</p>
    </section>
    ${servicePartBSection}
    <div class="part-section-heading service-detail-heading report-page-start">
      <div><h2>Part B - Service Schedule-of-Rates Detail</h2><p>Work-package quantity, rate, cost basis and review status.</p></div>
      <span class="pill">Schedule-of-rates backup</span>
    </div>
    ${serviceSummary.rows.length ? serviceDetailedSections : "<p class=\"meta\">No supported pipe, fitting, flange, or valve rows were available for service-cost calculation.</p>"}
    `;
  const bridgeBaseline = 244;
  const bridgePlotHeight = 165;
  const bridgeMax = Math.max(summary.normal, summary.p90, summary.normal + riskReserve, 1);
  const baseHeight = Math.max((summary.normal / bridgeMax) * bridgePlotHeight, summary.normal > 0 ? 34 : 0);
  const p90Height = Math.max((summary.p90 / bridgeMax) * bridgePlotHeight, summary.p90 > 0 ? 34 : 0);
  const baseTop = bridgeBaseline - baseHeight;
  const p90Top = bridgeBaseline - p90Height;
  const reserveHeight = Math.max(baseTop - p90Top, riskReserve > 0 ? 26 : 0);
  const reserveTop = baseTop - reserveHeight;
  const projectBridgeMax = Math.max(totalApprovalEnvelope, 1);
  const projectMaterialHeight = Math.max((summary.normal / projectBridgeMax) * bridgePlotHeight, summary.normal > 0 ? 34 : 0);
  const projectServiceHeight = Math.max((serviceSummary.direct / projectBridgeMax) * bridgePlotHeight, serviceSummary.direct > 0 ? 26 : 0);
  const projectTotalHeight = Math.max((totalBaseProjectCost / projectBridgeMax) * bridgePlotHeight, totalBaseProjectCost > 0 ? 34 : 0);
  const projectApprovalHeight = Math.max((totalApprovalEnvelope / projectBridgeMax) * bridgePlotHeight, totalApprovalEnvelope > 0 ? 34 : 0);
  const projectMaterialTop = bridgeBaseline - projectMaterialHeight;
  const projectTotalTop = bridgeBaseline - projectTotalHeight;
  const projectApprovalTop = bridgeBaseline - projectApprovalHeight;
  const projectReserveHeight = Math.max(projectTotalTop - projectApprovalTop, riskReserve > 0 ? 26 : 0);
  const projectReserveTop = projectTotalTop - projectReserveHeight;

  return `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Pipe_Price_Predictor_BOM_Report_${reportFileStamp}</title>
        <style>
          :root {
            --navy: #07335d;
            --blue: #27608f;
            --teal: #6fd1d7;
            --mint: #5df8d8;
            --orange: #ff681f;
            --green: #1d7a58;
            --text: #05213d;
            --muted: #5c718b;
            --border: #d8e3ef;
            --soft: #f5f8fc;
            --paper: #ffffff;
          }
          * { box-sizing: border-box; }
          html {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          body {
            margin: 0;
            background: #f3f8fa;
            color: var(--text);
            font-family: Arial, Helvetica, sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .report {
            width: min(1140px, calc(100% - 32px));
            margin: 24px auto;
            background: var(--paper);
            border: 1px solid var(--border);
            border-radius: 22px;
            overflow: hidden;
            box-shadow: 0 20px 50px rgba(7, 51, 93, 0.12);
          }
          .topbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px 28px;
            background:
              linear-gradient(90deg, rgba(7, 51, 93, 0.96), rgba(39, 96, 143, 0.78)),
              linear-gradient(180deg, var(--navy) 0 42%, var(--blue) 42% 69%, var(--teal) 69% 87%, var(--mint) 87% 100%);
            color: #fff;
          }
          .topbar strong { font-size: 24px; line-height: 1.15; }
          .topbar small {
            display: block;
            margin-top: 4px;
            color: rgba(255,255,255,0.76);
            font-size: 12px;
            font-weight: 500;
          }
          .topbar span {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 34px;
            padding: 0 12px;
            height: 34px;
            border-radius: 999px;
            background: rgba(255,255,255,0.13);
            font-size: 12px;
            white-space: nowrap;
            font-weight: 700;
          }
          .report-project-info {
            display: grid;
            grid-template-columns: minmax(0, 1.45fr) minmax(0, 1.05fr) minmax(190px, 0.7fr);
            gap: 16px;
            padding: 16px 32px;
            border-bottom: 1px solid var(--border);
            background: #eaf2f8;
          }
          .project-info-item {
            display: grid;
            gap: 5px;
          }
          .project-info-item span {
            color: var(--muted);
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.06em;
            text-transform: uppercase;
          }
          .project-info-item strong {
            color: var(--navy);
            font-size: 14px;
            line-height: 1.4;
          }
          .project-temperature-label { white-space: nowrap; }
          .hero {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
            gap: 24px;
            padding: 30px 32px;
            border-bottom: 1px solid var(--border);
          }
          .eyebrow {
            margin: 0 0 8px;
            color: var(--muted);
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }
          h1 {
            margin: 0 0 12px;
            color: var(--navy);
            font-size: 34px;
            line-height: 1.05;
          }
          .ready {
            display: inline-flex;
            max-width: 100%;
            gap: 6px;
            align-items: center;
            margin: 0 0 10px;
            color: var(--green);
            font-size: 11px;
            line-height: 1.25;
            font-weight: 700;
          }
          .ready::before {
            content: "";
            width: 7px;
            height: 7px;
            flex: 0 0 7px;
            border-radius: 50%;
            background: var(--green);
          }
          .scope-note {
            margin: -3px 0 10px;
            color: #9a4f00;
            font-size: 10px;
            font-weight: 600;
            line-height: 1.4;
          }
          .meta {
            margin: 0;
            color: var(--muted);
            font-size: 11px;
            line-height: 1.45;
          }
          .meta-list {
            display: grid;
            gap: 6px;
            margin: 0;
            color: var(--muted);
            font-size: 12px;
            line-height: 1.45;
          }
          .cards {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 16px;
            padding: 22px 32px;
          }
          .card {
            border: 1px solid var(--border);
            border-radius: 16px;
            background: #fff;
            padding: 16px;
          }
          .card.c1 { box-shadow: inset 0 4px 0 var(--navy); }
          .card.c2 { box-shadow: inset 0 4px 0 var(--blue); }
          .card.c3 { box-shadow: inset 0 4px 0 var(--teal); }
          .card.c4 { box-shadow: inset 0 4px 0 var(--orange); }
          .card-label {
            margin-bottom: 8px;
            color: var(--muted);
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.07em;
            text-transform: uppercase;
          }
          .card-value {
            color: var(--navy);
            font-size: 24px;
            font-weight: 800;
            line-height: 1.1;
          }
          .card-note {
            margin-top: 7px;
            color: var(--muted);
            font-size: 12px;
            line-height: 1.45;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            border-top: 1px solid var(--border);
          }
          .summary-grid article {
            padding: 18px 22px;
            border-right: 1px solid var(--border);
            background: #fbfdff;
          }
          .summary-grid article:last-child { border-right: 0; }
          .summary-grid span {
            display: block;
            margin-bottom: 8px;
            color: var(--muted);
            font-size: 12px;
          }
          .summary-grid strong {
            color: var(--navy);
            font-size: 22px;
          }
          .donut-wrap {
            display: grid;
            grid-template-columns: 156px 1fr;
            align-items: center;
            gap: 18px;
          }
          .composition-title {
            grid-column: 1 / -1;
            margin: 0 0 2px;
            color: var(--navy);
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }
          .donut {
            display: grid;
            place-items: center;
            width: 150px;
            height: 150px;
            border-radius: 50%;
            background: conic-gradient(
              var(--orange) 0 ${formatNumber(materialBaseShare, 1)}%,
              var(--blue) ${formatNumber(materialBaseShare, 1)}% 100%
            );
            position: relative;
          }
          .donut::after {
            content: "";
            position: absolute;
            inset: 24px;
            border-radius: 50%;
            background: #fff;
            z-index: 0;
          }
          .donut-center {
            position: relative;
            z-index: 1;
            display: grid;
            gap: 3px;
            width: 90px;
            text-align: center;
          }
          .donut-center span {
            color: var(--muted);
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.05em;
            text-transform: uppercase;
          }
          .donut-center strong { color: var(--navy); font-size: 12px; line-height: 1.12; overflow-wrap: normal; }
          .composition-copy {
            display: grid;
            gap: 13px;
            color: var(--muted);
            font-size: 13px;
          }
          .composition-item { display: grid; grid-template-columns: 14px 1fr; gap: 10px; align-items: start; }
          .composition-item strong { display: block; color: var(--navy); font-size: 15px; }
          .composition-item small { display: block; margin-top: 4px; color: var(--muted); font-size: 12px; }
          .composition-dot {
            width: 14px;
            height: 14px;
            margin-top: 3px;
            border-radius: 50%;
            background: var(--orange);
          }
          .composition-dot.service { background: var(--blue); }
          .reserve-callout { display: grid; gap: 2px; margin: 8px 0 0 24px; color: var(--teal); font-size: 11px; font-weight: 600; }
          .reserve-callout small { color: var(--muted); font-size: 9px; font-weight: 400; }
          .group-wise-item-count { margin: -3px 0 11px; color: var(--muted); font-size: 11px; }
          .group-wise-item-count strong { color: var(--navy); }
          .dot {
            display: inline-block;
            width: 10px;
            height: 10px;
            margin-right: 8px;
            border-radius: 50%;
            background: var(--orange);
          }
          .content { padding: 24px 32px 30px; }
          .consolidated-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 18px;
            margin-bottom: 16px;
          }
          .approval-strip {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 10px;
            margin-bottom: 26px;
          }
          .approval-strip article,
          .part-summary-grid article {
            padding: 13px;
            border: 1px solid var(--border);
            border-radius: 10px;
            background: #f8fcfd;
          }
          .approval-strip span,
          .part-summary-grid span {
            display: block;
            color: var(--muted);
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.03em;
            text-transform: uppercase;
          }
          .approval-strip strong,
          .part-summary-grid strong { display: block; margin-top: 6px; color: var(--navy); font-size: 15px; }
          .approval-strip .attention { color: #b42318; }
          .part-section-heading {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            margin: 28px 0 14px;
            padding: 16px 18px;
            border: 1px solid #2b6388;
            border-radius: 7px;
            background: #1a5278;
          }
          .part-section-heading h2 { margin: 0; color: #fff; font-size: 24px; }
          .part-section-heading p { margin: 5px 0 0; color: #e1edf6; font-size: 12px; }
          .part-section-heading .pill { border-color: rgba(255, 255, 255, 0.45); background: rgba(255, 255, 255, 0.12); color: #fff; }
          .service-detail-heading { margin: 24px 0 14px; border-color: #2e6f99; background: #245f87; }
          .service-detail-heading p { color: #fff; }
          .service-detail-heading .pill { border-color: rgba(255, 255, 255, 0.68); background: rgba(255, 255, 255, 0.14); color: #fff; }
          .part-summary-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 10px;
            margin: 0 0 16px;
          }
          .part-summary-grid small { display: block; margin-top: 5px; color: var(--muted); font-size: 10px; line-height: 1.4; }
          .subsection-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 0; padding: 10px 12px; background: #eaf3f8; border: 1px solid var(--border); border-bottom: 0; border-radius: 10px 10px 0 0; }
          .subsection-head h3 { margin: 0; color: var(--navy); font-size: 15px; }
          .subsection-head span { color: #c94f12; font-size: 11px; font-weight: 700; }
          .service-category-summary-report { margin: 0 0 16px; border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
          .service-category-summary-report table { margin: 0; }
          .service-total-row td { background: #eaf3f8; color: var(--navy); font-weight: 700; }
          .report-note { margin: 0; padding: 10px 12px; color: var(--muted); font-size: 11px; line-height: 1.45; background: #f8fcfd; }
          .visual-grid {
            display: grid;
            grid-template-columns: 1.05fr 0.95fr;
            gap: 18px;
            margin-bottom: 22px;
          }
          .service-distribution-panel { margin: 0 0 18px; break-inside: avoid; page-break-inside: avoid; }
          .bar-row.service-bar-row { grid-template-columns: 200px minmax(160px, 1fr) 330px; gap: 12px; }
          .bar-row.service-bar-row .bar-label { overflow: visible; text-overflow: clip; white-space: normal; line-height: 1.25; }
          .bar-row.service-bar-row .bar-value { width: 255px; min-width: 0; margin-left: 18px; text-align: left; }
          .report-panel {
            border: 1px solid var(--border);
            border-radius: 18px;
            background: #fff;
            padding: 18px;
          }
          .report-panel h2 {
            margin: 0 0 14px;
            color: var(--navy);
            font-size: 18px;
          }
          .bar-list {
            display: grid;
            gap: 14px;
          }
          .bar-row {
            display: grid;
            grid-template-columns: 150px minmax(180px, 1fr) 112px;
            gap: 12px;
            align-items: center;
            font-size: 12px;
          }
          .bar-label {
            font-weight: 700;
            color: var(--text);
          }
          .bar-track {
            position: relative;
            height: 18px;
            border-radius: 999px;
            background: #dceaf0;
            overflow: hidden;
          }
          .bar-risk,
          .bar-base {
            position: absolute;
            inset: 0 auto 0 0;
            border-radius: 999px;
          }
          .bar-risk { background: #dceaf0; }
          .bar-base.tone-driver { background: var(--orange); }
          .bar-base.tone-1 { background: var(--navy); }
          .bar-base.tone-2 { background: var(--blue); }
          .bar-base.tone-3 { background: var(--teal); }
          .bar-value {
            color: var(--text);
            font-weight: 700;
            text-align: right;
          }
          .bar-value strong,
          .bar-value span {
            display: block;
          }
          .bar-value span {
            margin-top: 2px;
            color: var(--muted);
            font-size: 10px;
            font-weight: 700;
          }
          .bridge-chart {
            width: 100%;
            height: auto;
            display: block;
            margin: 4px 0 18px;
          }
          .bridge-axis {
            stroke: #d7e6ed;
            stroke-width: 2;
          }
          .bridge-dash {
            stroke: var(--blue);
            stroke-width: 2.5;
            stroke-dasharray: 7 7;
          }
          .bridge-base {
            fill: #0b4969;
          }
          .bridge-service {
            fill: var(--orange);
          }
          .bridge-total {
            fill: var(--blue);
          }
          .bridge-reserve {
            fill: #6ccbd2;
          }
          .bridge-p90 {
            fill: #5df0d0;
          }
          .bridge-value {
            fill: var(--text);
            font-size: 14px;
            font-weight: 800;
          }
          .bridge-label {
            fill: var(--muted);
            font-size: 13px;
            font-weight: 700;
          }
          .bridge-note {
            margin: -4px 0 14px;
            color: var(--muted);
            font-size: 12px;
            line-height: 1.45;
          }
          .mini-strip {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 12px;
          }
          .mini {
            border: 1px solid var(--border);
            border-radius: 14px;
            background: #f8fcfd;
            padding: 13px;
          }
          .mini strong {
            display: block;
            margin-bottom: 5px;
            color: var(--navy);
            font-size: 13px;
          }
          .mini span {
            color: var(--muted);
            font-size: 12px;
            line-height: 1.45;
          }
          .mini .data-quality-warning {
            color: #b42318;
            font-weight: 700;
          }
          .section-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            margin: 0 0 12px;
          }
          .section-head h2 {
            margin: 0;
            color: var(--navy);
            font-size: 23px;
          }
          .section-head p { margin: 4px 0 0; color: var(--muted); font-size: 12px; }
          .methodology-audit-heading { margin-top: 28px; }
          .service-section-head {
            margin: 28px 0 14px;
            padding: 16px 18px;
            border: 1px solid #2e6f99;
            border-radius: 7px;
            background: #245f87;
          }
          .service-section-head h2 { color: #fff; }
          .service-section-head p { color: #fff; }
          .service-section-head .pill { border-color: rgba(255, 255, 255, 0.68); background: rgba(255, 255, 255, 0.14); color: #fff; }
          .service-build-up-panel { margin: 16px 0 12px; padding: 12px; border: 1px solid var(--border); border-radius: 12px; background: #fff; }
          .service-build-up-heading { display: flex; justify-content: space-between; align-items: center; gap: 14px; margin: 0 0 10px; padding: 10px 12px; border-bottom: 1px solid var(--border); border-radius: 8px; background: #eaf3f8; }
          .service-build-up-heading h3 { margin: 0; color: var(--navy); font-size: 15px; }
          .service-build-up-heading p { margin: 3px 0 0; color: var(--muted); font-size: 10px; }
          .service-build-up-heading span { color: var(--muted); font-size: 10px; font-weight: 700; white-space: nowrap; }
          .service-report-summary {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 10px;
            margin: 0;
          }
          .service-part-b-report {
            margin: 0 0 14px;
            border: 1px solid var(--border);
            border-radius: 10px;
            overflow: hidden;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .service-part-b-report-head {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 16px;
            padding: 12px 14px;
            background: #eaf3f8;
            border-bottom: 1px solid var(--border);
          }
          .service-part-b-report-head h3 { margin: 0; color: var(--navy); font-size: 15px; }
          .service-part-b-report-head p { margin: 4px 0 0; color: var(--muted); font-size: 10px; }
          .service-part-b-report-head span { color: #b42318; font-weight: 700; font-size: 12px; white-space: nowrap; }
          .service-part-b-report-table { width: 100%; border-collapse: collapse; font-size: 9px; }
          .service-part-b-report-table th { padding: 8px 6px; background: #0b365f; color: #fff; text-align: left; font-size: 8px; text-transform: uppercase; }
          .service-part-b-report-table td { padding: 7px 6px; border-bottom: 1px solid var(--border); vertical-align: top; }
          .service-part-b-report-table .user-entered-service-row td { background: #fff3e5; color: #a1440a; font-weight: 700; }
          .service-part-b-report-table tfoot td { background: #fff1e8; color: #b42318; font-weight: 700; }
          .service-detail-scope { margin-top: 20px; break-inside: avoid; page-break-inside: avoid; }
          .service-detail-scope-head { display: flex; gap: 10px; align-items: center; padding: 0 0 8px; }
          .service-scope-number { display: grid; place-items: center; width: 22px; height: 22px; flex: 0 0 22px; border-radius: 50%; background: var(--orange); color: #fff; font-size: 12px; font-weight: 700; }
          .service-detail-scope-head h3 { margin: 0; color: var(--navy); font-size: 20px; line-height: 1.1; }
          .service-detail-scope-head p { margin: 4px 0 0; color: var(--muted); font-size: 11px; }
          .service-detail-category { margin-top: 7px; border: 1px solid var(--border); border-radius: 7px; overflow: hidden; }
          .service-detail-category-head { display: flex; justify-content: space-between; gap: 12px; align-items: center; padding: 9px 12px; background: #eaf3f8; color: var(--muted); font-size: 10px; }
          .service-detail-category-head h4 { margin: 0; color: var(--navy); font-size: 12px; }
          .service-detail-report-table { width: 100%; border-collapse: collapse; font-size: 8px; }
          .service-detail-report-table th { padding: 7px 5px; background: #f4f9fb; color: var(--navy); text-align: left; font-size: 7px; text-transform: uppercase; }
          .service-detail-report-table td { padding: 6px 5px; border-top: 1px solid var(--border); vertical-align: top; }
          .service-report-summary div {
            padding: 12px;
            border: 1px solid var(--border);
            border-radius: 12px;
            background: #fff;
          }
          .service-report-summary span { display:block; color:var(--muted); font-size:11px; font-weight:700; text-transform:uppercase; }
          .service-report-summary strong { display:block; margin-top:6px; color:var(--navy); font-size:16px; }
          .service-report-summary .service-card-label { display:flex; align-items:center; gap:6px; color:var(--muted); font-size:10px; font-weight:700; line-height:1.2; text-transform:none; }
          .service-report-summary .service-card-reference { display:inline-flex; flex:0 0 16px; align-items:center; justify-content:center; width:16px; height:16px; margin:0; border:1px solid #111827; border-radius:50%; background:transparent; color:#111827; font-size:9px; font-weight:700; }
          .service-report-summary .service-schedule-card small { display:block; line-height:1.3; }
          .service-report-summary .service-schedule-card .service-card-quantity { margin-top:7px; color:var(--navy); font-size:16px; font-weight:700; }
          .service-report-summary .service-schedule-card .service-card-cost { margin-top:4px; color:var(--muted); font-size:10px; font-weight:500; }
          .service-report-summary .service-schedule-card .service-card-rate { margin-top:2px; color:var(--muted); font-size:9px; font-weight:400; }
          .service-report-summary .review-card { border-color:#e7b4aa; background:#fff9f7; }
          .service-method { margin-top: 12px; }
          .pill {
            border: 1px solid #ffd1bb;
            border-radius: 999px;
            background: #fff7f2;
            color: #c94f12;
            font-size: 12px;
            font-weight: 700;
            padding: 8px 12px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 12px;
          }
          th {
            padding: 10px 8px;
            border-bottom: 1px solid var(--border);
            color: var(--muted);
            font-size: 11px;
            letter-spacing: 0.03em;
            text-align: left;
            text-transform: uppercase;
          }
          .badge {
            display: inline-block;
            min-width: 68px;
            padding: 4px 9px;
            border-radius: 999px;
            font-size: 10px;
            font-weight: 800;
            text-align: center;
          }
          .badge.checked {
            background: rgba(111, 209, 215, 0.18);
            color: #16656d;
          }
          .badge.priority {
            background: rgba(39, 96, 143, 0.15);
            color: var(--navy);
          }
          .badge.pending {
            background: rgba(255, 104, 31, 0.12);
            color: #c94f12;
          }
          .pending-link {
            cursor: pointer;
            text-decoration: none;
          }
          .pending-link:hover,
          .pending-link:focus-visible {
            background: #c94f12;
            color: #ffffff;
            outline: none;
          }
          .pending-navigation-row {
            cursor: pointer;
          }
          .pending-navigation-row:hover td,
          .pending-navigation-row:focus-visible td {
            background: rgba(255, 104, 31, 0.10);
          }
          .pending-navigation-row:focus-visible {
            outline: 2px solid #ff681f;
            outline-offset: -2px;
          }
          .pending-action {
            color: #b42318;
            font-weight: 700;
          }
          .pending-row td {
            color: #b42318;
            font-weight: 700;
          }
          td {
            padding: 10px 8px;
            border-bottom: 1px solid var(--border);
            vertical-align: top;
          }
          .report-group {
            break-inside: avoid;
            margin-top: 22px;
            scroll-margin-top: 18px;
          }
          .report-group:target {
            outline: 2px solid #ff681f;
            outline-offset: 6px;
            border-radius: 6px;
          }
          .report-group.report-jump-target {
            outline: 3px solid #ff681f;
            outline-offset: 6px;
            border-radius: 6px;
          }
          .report-group-title {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 8px;
          }
          .report-group-title span {
            display: inline-grid;
            place-items: center;
            width: 22px;
            height: 22px;
            border-radius: 999px;
            background: var(--orange);
            color: #fff;
            font-size: 12px;
            font-weight: 700;
          }
          .report-group-title h2 {
            margin: 0;
            color: var(--navy);
            font-size: 18px;
          }
          .report-group-title p {
            margin: 3px 0 0;
            color: var(--muted);
            font-size: 12px;
          }
          .fallback {
            display: inline-block;
            margin-left: 5px;
            padding: 2px 6px;
            border-radius: 999px;
            background: #fff1e8;
            color: #c94f12;
            font-size: 10px;
            font-weight: 700;
          }
          .method {
            margin-top: 20px;
            padding: 16px;
            border: 1px solid var(--border);
            border-radius: 10px;
            background: var(--soft);
            color: var(--muted);
            font-size: 12px;
            line-height: 1.55;
          }
          .method > strong {
            display: block;
            color: var(--ink);
            margin-bottom: 7px;
          }
          .method-list {
            margin: 0;
            padding-left: 18px;
          }
          .method-list li {
            margin: 4px 0;
            padding-left: 2px;
          }
          .method-list strong {
            color: var(--ink);
          }
          .method-list code {
            font-family: Consolas, "Courier New", monospace;
            font-size: 11px;
          }
          .methodology-audit-block {
            margin-top: 28px;
            padding: 16px;
            border: 1px solid var(--border);
            border-radius: 10px;
            background: var(--soft);
          }
          .methodology-audit-block .section-head { margin-bottom: 12px; }
          .methodology-audit-block .method {
            margin: 0;
            padding: 0;
            border: 0;
            border-radius: 0;
            background: transparent;
          }
          .methodology-audit-block .method + .method {
            margin-top: 14px;
            padding-top: 14px;
            border-top: 1px solid var(--border);
          }
          .method-section-title {
            display: block;
            margin-bottom: 8px;
            padding-left: 10px;
            border-left: 4px solid var(--navy);
            color: var(--navy);
            font-size: 16px;
            line-height: 1.2;
          }
          footer {
            padding: 18px 32px 28px;
            color: var(--muted);
            font-size: 12px;
            line-height: 1.6;
            border-top: 1px solid var(--border);
          }
          .report-actions {
            display: flex;
            align-items: center;
            gap: 14px;
            justify-content: flex-end;
            padding: 14px 20px;
            background: #f8fbff;
            border-top: 1px solid var(--border);
          }
          .print-button {
            border: 0;
            border-radius: 999px;
            background: linear-gradient(135deg, var(--orange), #c94f12);
            color: #fff;
            cursor: pointer;
            font-weight: 700;
            padding: 10px 18px;
          }
          .pdf-save-note {
            margin: 0 auto 0 0;
            color: var(--muted);
            font-size: 11px;
            line-height: 1.45;
          }
          .page-number-footer {
            display: none;
          }
          .bar-value .bar-value-line { display: block; white-space: nowrap; }
          .bar-value .bar-value-line strong,
          .bar-value .bar-value-line span { display: inline; }
          .bar-value .bar-quantity,
          .bar-value .bar-rate { color: var(--text); font-size: 10px; font-weight: 700; }
          .bar-row.service-bar-row .bar-value .bar-value-line + .bar-value-line { margin-top: 2px; text-align: left; }
          .bar-row.service-bar-row .bar-value .bar-value-line + .bar-value-line { color: var(--muted); font-size: 9px; font-weight: 400; }
          .bar-row.service-bar-row .bar-value .bar-value-line + .bar-value-line span,
          .bar-row.service-bar-row .bar-value .bar-value-line + .bar-value-line .bar-rate { color: var(--muted); font-size: 9px; font-weight: 400; }
          @page {
            size: A4 landscape;
            margin: 10mm 9mm 17mm;
            @bottom-right {
              content: "Page No: " counter(page) " of " counter(pages);
              color: #5c718b;
              font-family: Arial, Helvetica, sans-serif;
              font-size: 10px;
            }
          }
          @media print {
            * {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            body {
              background: #f3f8fa !important;
              color: var(--text) !important;
            }
            .report {
              width: 100%;
              margin: 0 auto 12mm;
              border: 1px solid var(--border);
              border-radius: 18px;
              box-shadow: none;
              overflow: visible;
            }
            .report-actions { display: none; }
            .report-page-start {
              break-before: page;
              page-break-before: always;
            }
            .report-page-start + .service-detail-scope,
            .service-detail-heading {
              break-after: avoid;
              page-break-after: avoid;
            }
            .topbar {
              padding: 20px 28px;
              border-bottom: 3px solid #68c9d1;
              border-top-left-radius: 22px;
              border-top-right-radius: 22px;
            }
            .topbar strong { font-size: 24px; line-height: 1.15; }
            .topbar small { margin-top: 4px; font-size: 12px; }
            .topbar span { height: 34px; font-size: 12px; }
            .report-project-info { padding: 16px 32px; }
            .project-info-item span { font-size: 11px; }
            .project-info-item strong { font-size: 14px; }
            .hero {
              padding: 9px 16px;
              grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
            }
            .hero h1 { margin-bottom: 6px; font-size: 29px; }
            .eyebrow { margin-bottom: 4px; font-size: 10px; }
            .ready { font-size: 10px; }
            .scope-note, .meta { margin-top: 5px; font-size: 9px; }
            .donut-wrap { grid-template-columns: 122px 1fr; gap: 10px; }
            .composition-title { margin-bottom: 0; font-size: 13px; }
            .donut { width: 116px; height: 116px; }
            .donut::after { inset: 19px; }
            .donut-center span { font-size: 8px; }
            .donut-center { width: 68px; }
            .donut-center strong { font-size: 9px; }
            .composition-copy { gap: 7px; font-size: 9px; }
            .composition-item { grid-template-columns: 10px 1fr; gap: 7px; }
            .composition-item strong { font-size: 10px; }
            .composition-item small { margin-top: 2px; font-size: 9px; }
            .composition-dot { width: 10px; height: 10px; margin-top: 1px; }
            .reserve-callout { gap: 1px; margin: 5px 0 0 17px; font-size: 8px; }
            .reserve-callout small { font-size: 7px; }
            .group-wise-item-count { margin: -1px 0 7px; font-size: 8px; }
            .cards {
              padding: 7px 16px;
              gap: 8px;
            }
            .card {
              padding: 8px;
            }
            .card-value {
              font-size: 17px;
            }
            .card-label { margin-bottom: 4px; font-size: 9px; }
            .card-note { margin-top: 4px; font-size: 8px; }
            .summary-grid article {
              padding: 10px 18px;
            }
            .content {
              padding: 8px 16px 18px;
            }
            .consolidated-grid { gap: 10px; margin-bottom: 8px; }
            .approval-strip { gap: 6px; margin-bottom: 0; }
            .report-panel { padding: 9px; }
            .report-panel h2 { margin-bottom: 7px; font-size: 14px; }
            .bridge-note { margin: 4px 0; font-size: 9px; }
            .bar-list { gap: 7px; }
            .bar-row { font-size: 9px; }
            .bar-track { height: 11px; }
            .approval-strip article { padding: 8px; }
            .approval-strip span, .part-summary-grid span { font-size: 8px; }
            .approval-strip strong, .part-summary-grid strong { margin-top: 4px; font-size: 12px; }
            .approval-strip small, .part-summary-grid small { margin-top: 3px; font-size: 8px; }
            .visual-grid {
              grid-template-columns: 1.05fr 0.95fr;
              gap: 14px;
              margin-bottom: 16px;
            }
            .service-distribution-panel { margin-bottom: 14px; }
            .bar-row.service-bar-row { grid-template-columns: 170px minmax(100px, 1fr) 330px; gap: 8px; }
            .report-panel {
              padding: 12px;
            }
            .bridge-chart {
              max-height: 205px;
              margin-bottom: 10px;
            }
            .bridge-note {
              margin-bottom: 10px;
            }
            .mini {
              padding: 9px;
            }
            .mini strong,
            .mini span {
              font-size: 11px;
            }
            .bar-list {
              gap: 10px;
            }
            .bar-row {
              grid-template-columns: 126px minmax(150px, 1fr) 94px;
              gap: 10px;
            }
            .topbar,
            .hero,
            .report-project-info,
            .cards,
            .summary-grid,
            .visual-grid,
            .service-distribution-panel,
            .consolidated-grid,
            .approval-strip,
            .part-summary-grid,
            .report-panel,
            .report-group,
            .component-cost-summary-panel,
            .service-build-up-panel,
            .service-part-b-report,
            .method,
            footer {
              break-inside: avoid;
              page-break-inside: avoid;
            }
          }
          @media (max-width: 860px) {
            .hero,
            .visual-grid,
            .service-distribution-panel,
            .cards,
            .summary-grid,
            .consolidated-grid,
            .approval-strip,
            .part-summary-grid,
            .service-report-summary {
              grid-template-columns: 1fr;
            }
            .bar-row {
              grid-template-columns: 1fr;
            }
            .bar-value {
              text-align: left;
            }
            .mini-strip {
              grid-template-columns: 1fr;
            }
          }
        </style>
      </head>
      <body>
        <main class="report">
          <header class="topbar">
            <div>
              <strong>Piping Material &amp; Service Cost Estimate Report</strong>
              <small>Consolidated management review with material-cost and direct-service-cost backup</small>
            </div>
            <span>Draft for review</span>
          </header>
          <section class="report-project-info">
            <div class="project-info-item">
              <span>Project / Job Description</span>
              <strong>${escapeHtml(projectDescription)}</strong>
            </div>
            <div class="project-info-item">
              <span>Project No. / MOC No. / Job No.</span>
              <strong>${escapeHtml(projectNumber)}</strong>
            </div>
            <div class="project-info-item">
              <span class="project-temperature-label">Design Temperature (&deg;C)</span>
              <strong>${escapeHtml(designTemperature)}</strong>
            </div>
          </section>
          <section class="hero">
            <div>
              <p class="eyebrow">Total base project cost</p>
              <h1>${formatCurrency(totalBaseProjectCost, 0)}</h1>
              <p class="ready">Material and direct service estimate ready for review</p>
              <p class="scope-note">Material base plus direct service cost. Taxes, freight, escalation,<br>contingency and commercial additions are excluded.</p>
              <p class="meta">Report generated: ${escapeHtml(reportDate)} | Year basis: ${escapeHtml(
                elements.year.value
              )} |<br>Consolidated budgetary estimate</p>
            </div>
            <div class="donut-wrap">
              <h2 class="composition-title">Project Cost Composition</h2>
              <div class="donut">
                <div class="donut-center"><strong>${formatCurrency(totalBaseProjectCost, 2)}</strong></div>
              </div>
              <div class="composition-copy">
                <div class="composition-item"><span class="composition-dot"></span><div><strong>Part A - Piping Material</strong><small>${formatCurrency(summary.normal, 2)} | ${formatNumber(materialBaseShare, 1)}%</small></div></div>
                <div class="composition-item"><span class="composition-dot service"></span><div><strong>Part B - Piping Services</strong><small>${formatCurrency(serviceSummary.direct, 2)} | ${formatNumber(serviceBaseShare, 1)}%</small></div></div>
                <div class="reserve-callout">Material reserve: ${formatCurrency(riskReserve, 2)}<small>Reserve is excluded from the donut and added separately to Part A.</small></div>
              </div>
            </div>
          </section>
          <section class="cards">
            <article class="card c1">
              <div class="card-label">Total base project cost</div>
              <div class="card-value">${formatCurrency(totalBaseProjectCost, 0)}</div>
              <div class="card-note">Part A material base + Part B direct service.</div>
            </article>
            <article class="card c2">
              <div class="card-label">Material risk reserve</div>
              <div class="card-value">${formatCurrency(riskReserve, 0)}</div>
              <div class="card-note">Restricted to Part A material estimate.</div>
            </article>
            <article class="card c3">
              <div class="card-label">Total approval envelope</div>
              <div class="card-value">${formatCurrency(totalApprovalEnvelope, 0)}</div>
              <div class="card-note">Part A P90 material + Part B service base.</div>
            </article>
            <article class="card c4">
              <div class="card-label">Estimate readiness</div>
              <div class="card-value">${totalReviewItems > 0 ? `${totalPricedItems} priced / ${totalReviewItems} review` : "Ready for review"}</div>
              <div class="card-note">${totalReviewItems > 0 ? "Pending items need a management decision." : "All included items have a calculated basis."}</div>
            </article>
          </section>
          <section class="content">
            <div class="consolidated-grid">
              <section class="report-panel project-approval-panel">
                <h2>Project Approval Bridge</h2>
                <svg class="bridge-chart project-approval-chart" viewBox="0 0 1200 330" role="img" aria-label="Project approval bridge from material and service base to approval envelope">
                  <line class="bridge-axis" x1="38" y1="${formatNumber(bridgeBaseline, 1)}" x2="1162" y2="${formatNumber(bridgeBaseline, 1)}" />
                  <line class="bridge-dash" x1="200" y1="${formatNumber(projectMaterialTop, 1)}" x2="300" y2="${formatNumber(projectMaterialTop, 1)}" />
                  <line class="bridge-dash" x1="420" y1="${formatNumber(projectTotalTop, 1)}" x2="520" y2="${formatNumber(projectTotalTop, 1)}" />
                  <line class="bridge-dash" x1="640" y1="${formatNumber(projectTotalTop, 1)}" x2="740" y2="${formatNumber(projectTotalTop, 1)}" />
                  <line class="bridge-dash" x1="860" y1="${formatNumber(projectApprovalTop, 1)}" x2="960" y2="${formatNumber(projectApprovalTop, 1)}" />

                  <text class="bridge-value" x="140" y="${formatNumber(Math.max(projectMaterialTop - 12, 18), 1)}" text-anchor="middle">${formatCurrency(summary.normal, 0)}</text>
                  <rect class="bridge-base" x="80" y="${formatNumber(projectMaterialTop, 1)}" width="120" height="${formatNumber(projectMaterialHeight, 1)}" rx="14" />
                  <text class="bridge-label" x="140" y="304" text-anchor="middle"><tspan x="140" dy="0">Material</tspan><tspan x="140" dy="15">base</tspan></text>

                  <text class="bridge-value" x="360" y="${formatNumber(Math.max(projectTotalTop - 12, 18), 1)}" text-anchor="middle">+${formatCurrency(serviceSummary.direct, 0)}</text>
                  <rect class="bridge-service" x="300" y="${formatNumber(projectTotalTop, 1)}" width="120" height="${formatNumber(projectServiceHeight, 1)}" rx="14" />
                  <text class="bridge-label" x="360" y="304" text-anchor="middle"><tspan x="360" dy="0">Service</tspan><tspan x="360" dy="15">base</tspan></text>

                  <text class="bridge-value" x="580" y="${formatNumber(Math.max(projectTotalTop - 12, 18), 1)}" text-anchor="middle">${formatCurrency(totalBaseProjectCost, 0)}</text>
                  <rect class="bridge-total" x="520" y="${formatNumber(projectTotalTop, 1)}" width="120" height="${formatNumber(projectTotalHeight, 1)}" rx="14" />
                  <text class="bridge-label" x="580" y="304" text-anchor="middle"><tspan x="580" dy="0">Total</tspan><tspan x="580" dy="15">base</tspan></text>

                  <text class="bridge-value" x="800" y="${formatNumber(Math.max(projectReserveTop - 12, 18), 1)}" text-anchor="middle">+${formatCurrency(riskReserve, 0)}</text>
                  <rect class="bridge-reserve" x="740" y="${formatNumber(projectReserveTop, 1)}" width="120" height="${formatNumber(projectReserveHeight, 1)}" rx="14" />
                  <text class="bridge-label" x="800" y="304" text-anchor="middle"><tspan x="800" dy="0">Material</tspan><tspan x="800" dy="15">reserve</tspan></text>

                  <text class="bridge-value" x="1020" y="${formatNumber(Math.max(projectApprovalTop - 12, 18), 1)}" text-anchor="middle">${formatCurrency(totalApprovalEnvelope, 0)}</text>
                  <rect class="bridge-p90" x="960" y="${formatNumber(projectApprovalTop, 1)}" width="120" height="${formatNumber(projectApprovalHeight, 1)}" rx="14" />
                  <text class="bridge-label" x="1020" y="304" text-anchor="middle"><tspan x="1020" dy="0">Approval</tspan><tspan x="1020" dy="15">envelope</tspan></text>
                </svg>
                <p class="bridge-note">Material base + service base = total base; add the Part A material reserve for the approval envelope.</p>
              </section>
            </div>
            <div class="approval-strip">
              <article><span>Approval request</span><strong>${formatCurrency(totalApprovalEnvelope, 0)}</strong><small>Approve the consolidated budget envelope.</small></article>
              <article><span>Reserve discipline</span><strong>${formatNumber(reserveLoading, 1)}%</strong><small>Apply reserve to Part A material cost only.</small></article>
              <article><span>Critical validation</span><strong>${escapeHtml(costDriver.groupName)}</strong><small>Validate the highest material cost driver.</small></article>
              <article><span>Pending condition</span><strong class="${totalReviewItems > 0 ? "attention" : ""}">${totalReviewItems > 0 ? `${totalReviewItems} review item(s)` : "No pending item"}</strong><small>${totalReviewItems > 0 ? "Price or dispose of review-required items." : "Estimate is ready for management review."}</small></article>
            </div>
            <div class="part-section-heading report-page-start">
              <div><h2>Part A - Piping Material Cost</h2><p>Material estimate with factor backup, explicit reserve and P90 approval envelope.</p></div>
              <span class="pill">Material reserve retained</span>
            </div>
            <div class="subsection-head report-summary-title"><h3>Piping Material Cost Summary</h3></div>
            <div class="part-summary-grid">
              <article><span>Base estimate</span><strong>${formatCurrency(summary.normal, 0)}</strong><small>Normal case for planning and comparison.</small></article>
              <article><span>P90 estimate</span><strong>${formatCurrency(summary.p90, 0)}</strong><small>Conservative material envelope for approval.</small></article>
              <article><span>Risk reserve</span><strong>${formatCurrency(riskReserve, 0)}</strong><small>Difference between P90 and base estimate.</small></article>
              <article><span>Main cost driver</span><strong>${escapeHtml(costDriver.groupName)}</strong><small>${formatNumber(costDriver.share, 1)}% share of material base.</small></article>
            </div>
            <div class="visual-grid">
              <section class="report-panel">
                <h2>Group-wise Cost</h2>
                <p class="group-wise-item-count"><strong>Total BOM items =</strong> <strong>${bomGroupItems.length}</strong></p>
                <div class="bar-list">${barRows}</div>
              </section>
              <section class="report-panel">
                <h2>Estimate Bridge</h2>
                <svg class="bridge-chart" viewBox="0 0 600 300" role="img" aria-label="Estimate bridge from base estimate to P90 estimate">
                  <line class="bridge-axis" x1="24" y1="${formatNumber(bridgeBaseline, 1)}" x2="576" y2="${formatNumber(
                    bridgeBaseline,
                    1
                  )}" />
                  <line class="bridge-dash" x1="130" y1="${formatNumber(baseTop, 1)}" x2="245" y2="${formatNumber(
                    baseTop,
                    1
                  )}" />
                  <line class="bridge-dash" x1="350" y1="${formatNumber(reserveTop, 1)}" x2="440" y2="${formatNumber(
                    reserveTop,
                    1
                  )}" />
                  <text class="bridge-value" x="77.5" y="${formatNumber(Math.max(baseTop - 12, 18), 1)}" text-anchor="middle">${formatCurrency(
                    summary.normal,
                    0
                  )}</text>
                  <rect class="bridge-base" x="52" y="${formatNumber(baseTop, 1)}" width="105" height="${formatNumber(
                    baseHeight,
                    1
                  )}" rx="14" />
                  <text class="bridge-label" x="104.5" y="278" text-anchor="middle">Base</text>

                  <text class="bridge-value" x="297.5" y="${formatNumber(Math.max(reserveTop - 12, 18), 1)}" text-anchor="middle">+${formatCurrency(
                    riskReserve,
                    0
                  )}</text>
                  <rect class="bridge-reserve" x="245" y="${formatNumber(reserveTop, 1)}" width="105" height="${formatNumber(
                    reserveHeight,
                    1
                  )}" rx="14" />
                  <text class="bridge-label" x="297.5" y="278" text-anchor="middle">Risk reserve</text>

                  <text class="bridge-value" x="492.5" y="${formatNumber(Math.max(p90Top - 12, 18), 1)}" text-anchor="middle">${formatCurrency(
                    summary.p90,
                    0
                  )}</text>
                  <rect class="bridge-p90" x="440" y="${formatNumber(p90Top, 1)}" width="105" height="${formatNumber(
                    p90Height,
                    1
                  )}" rx="14" />
                  <text class="bridge-label" x="492.5" y="278" text-anchor="middle">P90</text>
                </svg>
                <p class="bridge-note">Visual bridge: base estimate plus risk reserve equals the P90 budget envelope.</p>
                <div class="mini-strip">
                  <div class="mini">
                    <strong>Management focus</strong>
                    <span>Check the highest-value group first before approval.</span>
                  </div>
                  <div class="mini">
                    <strong>Risk focus</strong>
                    <span>Keep the reserve visible so exposure is clear.</span>
                  </div>
                  <div class="mini">
                    <strong>Data quality</strong>
                    <span class="${summary.review > 0 ? "data-quality-warning" : ""}">${
                      summary.review > 0
                        ? "Some items still need a confirmed price or management decision."
                        : "All BOM items have a calculated price."
                    }</span>
                  </div>
                </div>
              </section>
            </div>
            <section class="component-cost-summary-panel report-page-start">
            <div class="section-head">
              <div><h2>Component Cost Summary</h2><p>Group-level material cost, reserve and action status for management review.</p></div>
              <span class="pill">${summary.review > 0 ? `${summary.review} review item(s)` : "Ready for review"}</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Group</th>
                  <th>Items</th>
                  <th>Base Cost</th>
                  <th>P90 Cost</th>
                  <th>Reserve</th>
                  <th>Share</th>
                  <th>Status</th>
                  <th>Required Action</th>
                </tr>
              </thead>
              <tbody>${groupRows}</tbody>
            </table>
            </section>
            <div class="part-section-heading report-page-start">
              <div><h2>Part A - Material Cost Detail</h2><p>Line-level calculation backup by piping component group.</p></div>
              <span class="pill">Audit backup</span>
            </div>
            ${detailSections}
            ${serviceReportSection}
            <section class="methodology-audit-block report-page-start">
              <div class="section-head">
                <div><h2>Calculation Methodology &amp; Audit Trail</h2><p>Key pricing basis, derived quantities, rate sources and exclusions.</p></div>
              </div>
              <div class="method">
                <strong class="method-section-title">Part A - Material Cost Methodology</strong>
                <ul class="method-list">
                  <li><strong>Component pricing:</strong> each component follows its approved group method and quantity basis.</li>
                  <li><strong>Pipe weight:</strong> W = 0.0246615 x (OD - t) x t, where OD is actual outside diameter in mm and t is wall thickness in mm. Total pipe weight = kg/m x length.</li>
                  <li><strong>90 degree LR elbows:</strong> developed length = 2.356 x actual OD; elbow weight = pipe kg/m x developed length. CS factor bands are 2 IN = 5.00; above 2 to 4 IN = 3.50; above 4 to 20 IN = 2.50; above 20 to 26 IN = 2.80; above 26 to 48 IN = 3.20. Unit Rs = elbow weight x raw material Rs/kg x factor x material multiplier.</li>
                  <li><strong>45 degree elbows:</strong> use 50% of matching 90 degree elbow physical weight. Unit price = 65% of matching 90 degree elbow price for NPS 2 to 6 IN, and 60% for NPS 8 to 48 IN.</li>
                  <li><strong>Equal tees:</strong> developed length = 2C + M - 0.5 x OD; tee weight = pipe kg/m x developed length. PO-derived factors are NPS 2 to 4 IN = 4.41, NPS 6 to 20 IN = 3.86, and NPS 24 to 48 IN = 3.55.</li>
                  <li><strong>Reducing tees:</strong> approved unequal-tee C and M dimensions define the run and branch weight portions; the same PO-derived Equal Tee factor is used for the run size. Where dimensions cannot produce a price, the run-size Equal Tee price is used and labelled Equal tee fallback.</li>
                  <li><strong>Flanges:</strong> WN, SO and Blind flange cost = JSON flange weight x raw material Rs/kg x P50 base multiplier x quantity.</li>
                  <li><strong>Metric stud sets:</strong> cost = calculated stud-and-two-heavy-hex-nut mass x raw material Rs/kg x commercial raw-to-finished factor 2.50 x quantity. ASME B18.2.4.6M heavy-hex nut dimensions are used.</li>
                  <li><strong>Other components:</strong> non-pipe components continue to use their approved component pricing methods.</li>
                  <li><strong>Excluded from stud-set mass:</strong> washers, coatings, chamfers, thread tolerances and manufacturing variation.</li>
                  <li><strong>Commercial scope:</strong> this is an indicative material and direct-service estimate. Taxes, freight, escalation, contingency, packing, wastage, contractor margin and commercial terms are excluded unless separately stated.</li>
                </ul>
              </div>
              <div class="method service-method">
                <strong class="method-section-title">Part B - Service Cost Methodology</strong>
                <ul class="method-list">
                  <li><strong>Rate library:</strong> Carbon Steel uses CS rates, Austenitic Stainless Steel uses SS rates, and Alloy Steel uses AS rates. Unclassified rows use CS as a visible fallback; other unsupported categories remain Review.</li>
                  <li><strong>Pipe erection and welding:</strong> each pipe row is one run. Base joints = ceiling(pipe length / 6 m); estimated joints = ceiling(base joints x 1.60). Erection quantity = NPS x length in IM; welding quantity = estimated joints x NPS in ID.</li>
                  <li><strong>PWHT:</strong> applied only when BOM Piping Class / PMS Class, material and wall thickness match <code>nrl_pwht_rules</code>. Eligible rates are CS/LTCS Rs 408/ID, P11/P12/P22 Rs 559/ID, P5/P9 Rs 613/ID, and P91/P92 Rs 715/ID. Austenitic Stainless Steel uses the Rs 559/ID alloy-steel rate.</li>
                  <li><strong>Pipe supports:</strong> structural steel per support = matching pipe kg/m x ${formatNumber(pipeSupportHeightM, 2)} m support height. Total structural steel MT = per-support steel x support count, using suggested maximum spans: 1 IN = 2 m, 2 IN = 3 m, 3-4 IN = 4 m, and 6-48 IN = 6 m; then x Rs 1,50,000/MT. Civil support cost for a 300 mm above-ground support = individual support count x size-based civil cost per support: 3 IN = Rs 6,000, 20 IN = Rs 17,000 and 48 IN = Rs 26,000, linearly interpolated and rounded upward to the next Rs 500. Inside Unit Battery Limit uses 30% of this civil cost; Outside Unit Battery Limit uses 100%.</li>
                  <li><strong>Insulation and painting:</strong> insulation = pi x OD (m) x length (m) x provisional P50 Rs/m2 at Design Temperature. Painting uses the same surface area: Rs 1,010/m2 at the 65C default; under-insulation rates are Rs 885/m2 from 65C to 200C, interpolate to Rs 2,220/m2 from 200C to 300C, then remain Rs 2,220/m2 to 500C.</li>
                  <li><strong>Valve service:</strong> calculated valve material-cost weight x BOM quantity x IOCL-ME-SOR rate.</li>
                  <li><strong>Excluded:</strong> commissioning, taxes, escalation and contingency.</li>
                </ul>
              </div>
            </section>
          </section>
          <footer>
            This report is intended for budgetary planning and management review. Final commercial value shall be validated through latest approved rate source, vendor quotation, PMS/specification, quantity take-off, taxes, freight, inspection, delivery basis, site constraints and commercial conditions.
          </footer>
          <div class="report-actions">
            <p class="pdf-save-note">If Adobe says the file is already open, close the old PDF or save this report with a new file name.</p>
            <button class="print-button" onclick="window.print()">Print / Save PDF</button>
          </div>
        </main>
        <div class="page-number-footer" aria-hidden="true"></div>
      </body>
    </html>`;
}

function enableReportPendingNavigation(frame = elements.bomReportFrame) {
  const reportDocument = frame.contentDocument;
  if (!reportDocument || reportDocument.body.dataset.pendingNavigationBound === "true") return;

  reportDocument.body.dataset.pendingNavigationBound = "true";
  const jumpToPendingReview = (trigger) => {
    const target = reportDocument.getElementById(trigger.dataset.reviewTarget);
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "start" });
    target.classList.add("report-jump-target");
    window.setTimeout(() => target.classList.remove("report-jump-target"), 2200);
  };

  reportDocument.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-review-target]");
    if (!trigger) return;

    event.preventDefault();
    jumpToPendingReview(trigger);
  });
  reportDocument.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const trigger = event.target.closest(".pending-navigation-row[data-review-target]");
    if (!trigger) return;

    event.preventDefault();
    jumpToPendingReview(trigger);
  });
}

function printBomCostReport() {
  if (!hasSupportedPipingBomItems()) {
    window.alert(getUnsupportedBomUploadMessage());
    return;
  }

  elements.bomReportPreview.hidden = false;
  elements.bomReportFrame.addEventListener(
    "load",
    () => enableReportPendingNavigation(elements.bomReportFrame),
    { once: true }
  );
  elements.bomReportFrame.srcdoc = buildBomCostReportHtml();
  elements.bomReportPreview.scrollIntoView({ behavior: "smooth", block: "start" });
}

function openEstimatorBomReport() {
  if (!hasSupportedPipingBomItems()) {
    window.alert(getUnsupportedBomUploadMessage());
    return;
  }

  elements.estimatorReportPreview.hidden = false;
  elements.estimatorReportFrame.addEventListener(
    "load",
    () => enableReportPendingNavigation(elements.estimatorReportFrame),
    { once: true }
  );
  elements.estimatorReportFrame.srcdoc = buildBomCostReportHtml();
  elements.estimatorReportPreview.scrollIntoView({ behavior: "smooth", block: "start" });
}

function openBomUploadReport() {
  if (!hasSupportedPipingBomItems()) {
    window.alert(getUnsupportedBomUploadMessage());
    return;
  }

  elements.bomUploadReportPreview.hidden = false;
  elements.bomUploadReportFrame.addEventListener(
    "load",
    () => enableReportPendingNavigation(elements.bomUploadReportFrame),
    { once: true }
  );
  elements.bomUploadReportFrame.srcdoc = buildBomCostReportHtml();
  elements.bomUploadReportPreview.scrollIntoView({ behavior: "smooth", block: "start" });
}

function printBomReportFrame() {
  if (elements.bomReportPreview.hidden) {
    printBomCostReport();
    return;
  }

  const frameWindow = elements.bomReportFrame.contentWindow;
  if (!frameWindow) return;

  frameWindow.focus();
  frameWindow.print();
}

function printEstimatorBomReportFrame() {
  if (elements.estimatorReportPreview.hidden) {
    openEstimatorBomReport();
    return;
  }

  const frameWindow = elements.estimatorReportFrame.contentWindow;
  if (!frameWindow) return;
  frameWindow.focus();
  frameWindow.print();
}

function printBomUploadReportFrame() {
  if (elements.bomUploadReportPreview.hidden) {
    openBomUploadReport();
    return;
  }

  const frameWindow = elements.bomUploadReportFrame.contentWindow;
  if (!frameWindow) return;
  frameWindow.focus();
  frameWindow.print();
}

function closeBomReportPreview() {
  elements.bomReportPreview.hidden = true;
  elements.bomReportFrame.removeAttribute("srcdoc");
}

function closeEstimatorBomReportPreview() {
  elements.estimatorReportPreview.hidden = true;
  elements.estimatorReportFrame.removeAttribute("srcdoc");
}

function closeBomUploadReportPreview() {
  elements.bomUploadReportPreview.hidden = true;
  elements.bomUploadReportFrame.removeAttribute("srcdoc");
}

function populateSizeOptions() {
  Object.keys(odTable)
    .map(Number)
    .filter((size) => !manualSizeExclusions.has(size))
    .sort((a, b) => a - b)
    .forEach((size) => {
      const option = document.createElement("option");
      option.value = size;
      option.textContent = `${size} IN`;
      if (size === 6) option.selected = true;
      elements.size.append(option);
    });
}

function resetForm() {
  elements.projectDescription.value = "";
  elements.projectNumber.value = "";
  elements.designTemperature.value = "";
  elements.servicePaintingScope.value = "UNINSULATED";
  elements.year.value = "2026";
  elements.size.value = "6";
  elements.thicknessMode.value = "schedule";
  elements.schedule.value = "STD";
  elements.thickness.value = "";
  elements.length.value = "100";
  elements.spec.value = "ASTM A106";
  selectDefaultCarbonSteelPrice();
  elements.coating.value = "No";
  elements.factorOverride.value = "";
  elements.bomFile.value = "";
  elements.rawSteelSlider.value = "0";
  elements.pipeFactorSlider.value = "0";
  elements.componentFactorSlider.value = "0";
  elements.rawSteelSliderValue.textContent = "0%";
  setBomStatus("No BOM uploaded yet.");
  clearSuccessMessage();
  clearReportGenerated();
  lineItems.splice(0, lineItems.length);
  bomGroupItems.splice(0, bomGroupItems.length);
  updateThicknessMode();
  renderLineItems();
  renderBomGroupReview();
  calculate();
}

function initializeShowHideSummaryLabels() {
  document.querySelectorAll("details > summary").forEach((summary) => {
    const details = summary.parentElement;
    const showLabel = summary.dataset.showLabel || summary.textContent.trim();
    if (!(details instanceof HTMLDetailsElement) || !/^Show\b/i.test(showLabel)) return;

    summary.dataset.showLabel = showLabel;
    const updateLabel = () => {
      summary.textContent = details.open
        ? showLabel.replace(/^Show\b/i, "Hide")
        : showLabel;
    };

    updateLabel();
    details.addEventListener("toggle", updateLabel);
  });
}

populateSizeOptions();
populateComponentGroups();
loadMaterialSpecificationData();
loadRawMaterialPriceLibrary();
loadFlangeWeightModel();
loadUnequalTeeDimensions();
loadPwhtRules();

// Keep the decision-support lab after the detailed BOM component review.
const scenarioPlayground = document.querySelector("#what-if-analysis");
const componentCostReview = document.querySelector("#bom-group-review");
if (scenarioPlayground && componentCostReview) {
  componentCostReview.insertAdjacentElement("afterend", scenarioPlayground);
}

initializeShowHideSummaryLabels();
renderBomGroupReview();
document.querySelectorAll("input:not([data-ignore-calculation]), select, textarea").forEach((control) => {
  control.addEventListener("input", () => {
    if (control === elements.rawOverride) {
      delete elements.rawOverride.dataset.source;
      delete elements.rawOverride.dataset.sourceType;
    }
    clearSuccessMessage();
    updateThicknessMode();
    calculate();
  });
  control.addEventListener("change", () => {
    clearSuccessMessage();
    updateThicknessMode();
    calculate();
  });
});
elements.estimatorQueryForm?.addEventListener("submit", handleEstimatorQuery);
document.querySelectorAll("[data-estimator-example]").forEach((example) => {
  example.addEventListener("click", () => {
    elements.estimatorQueryInput.value = example.dataset.estimatorExample || "";
    elements.estimatorQueryInput.focus();
    handleEstimatorQuery(new Event("submit", { cancelable: true }));
  });
});
elements.materialBasis.addEventListener("change", () => {
  populateRawMaterialGradeOptions();
  if (isCarbonSteelRawMaterialSelection()) {
    elements.materialGradeFamily.value = "0";
    applyRawMaterialPriceSelection();
  } else {
    clearRawMaterialPriceSelection();
  }
  calculate();
});
elements.materialGradeFamily.addEventListener("change", () => {
  applyRawMaterialPriceSelection();
  updateThicknessMode();
  calculate();
});
elements.year.addEventListener("change", () => {
  if (elements.rawOverride.dataset.sourceType === "materialLibrary") {
    applyRawMaterialPriceSelection();
  }
  refreshLineItemYearPrices();
  calculate();
  renderComponentQuickEstimate();
});
elements.addLine.addEventListener("click", addCurrentLine);
elements.addComponent.addEventListener("click", addManualComponent);
elements.resetComponent.addEventListener("click", resetComponentQuickEstimate);
elements.componentGroup.addEventListener("change", () => populateComponentTypes({ applyDefaults: true }));
elements.componentType.addEventListener("change", () => updateComponentFieldLayout(false));
[elements.componentSize, elements.componentUnequalTeeSize, elements.componentRating, elements.componentMaterial, elements.componentQuantity].forEach((control) => {
  control.addEventListener("input", renderComponentQuickEstimate);
  control.addEventListener("change", renderComponentQuickEstimate);
});
elements.sortButtons.forEach((button) => button.addEventListener("click", handleSort));
elements.whatIfSortButtons.forEach((button) => button.addEventListener("click", handleWhatIfSort));
elements.whatIfToggles.forEach((toggle) => toggle.addEventListener("change", renderWhatIfAnalysis));
elements.whatIfScope.addEventListener("change", renderWhatIfAnalysis);
elements.rawSteelSlider.addEventListener("input", handleRawSteelSlider);
elements.pipeFactorSlider.addEventListener("input", handleFactorSlider);
elements.componentFactorSlider.addEventListener("input", handleFactorSlider);
elements.serviceLocation.addEventListener("change", renderPipingServiceCost);
elements.serviceRegulatoryClass.addEventListener("change", renderPipingServiceCost);
elements.servicePaintingScope.addEventListener("change", renderPipingServiceCost);
elements.serviceReworkRate.addEventListener("input", renderPipingServiceCost);
elements.serviceReworkRate.addEventListener("change", renderPipingServiceCost);
elements.serviceCivilSupportScope.addEventListener("change", renderPipingServiceCost);
elements.servicePartBWrap.addEventListener("submit", (event) => {
  if (!event.target.matches("#additional-service-form")) return;
  event.preventDefault();
  addAdditionalServiceItem();
});
elements.servicePartBWrap.addEventListener("click", (event) => {
  const removeButton = event.target.closest("[data-remove-additional-service]");
  if (removeButton) removeAdditionalServiceItem(removeButton.dataset.removeAdditionalService);
});
elements.designTemperature.addEventListener("input", renderPipingServiceCost);
elements.designTemperature.addEventListener("change", renderPipingServiceCost);
elements.bomFile.addEventListener("change", handleBomUpload);
elements.estimatorBomUpload.addEventListener("click", () => elements.estimatorBomFile.click());
document.querySelectorAll("[data-estimator-bom-upload]").forEach((button) => {
  button.addEventListener("click", () => elements.estimatorBomFile.click());
});
elements.estimatorBomFile.addEventListener("change", handleEstimatorBomUpload);
elements.estimatorQueryResult.addEventListener("click", (event) => {
  if (event.target.closest("[data-ask-print-report]")) {
    openEstimatorBomReport();
    return;
  }
  if (event.target.closest("[data-ask-excel-report]")) {
    exportEditableBomExcelReport();
  }
});
elements.bomDropZone.addEventListener("dragover", handleBomDrag);
elements.bomDropZone.addEventListener("dragleave", handleBomDragLeave);
elements.bomDropZone.addEventListener("drop", handleBomDrop);
elements.themeToggle.addEventListener("click", toggleTheme);
elements.sideBrandHome.addEventListener("click", () => {
  document.querySelector("#top")?.scrollIntoView({ behavior: "smooth", block: "start" });
  setActiveSideNavLink("#calculator");
});
elements.sideNavToggle.addEventListener("click", () =>
  setSideNavCollapsed(!document.body.classList.contains("side-nav-collapsed"))
);
elements.sideNavLinks.forEach((link) => {
  link.addEventListener("click", () => setActiveSideNavLink(link.getAttribute("href")));
});
window.addEventListener("scroll", updateActiveSideNavOnScroll, { passive: true });
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setSideNavCollapsed(true);
});
elements.print.addEventListener("click", printReport);
elements.exportCsv.addEventListener("click", exportCsvReport);
elements.bomReport.addEventListener("click", printBomCostReport);
elements.bomExcelReport.addEventListener("click", exportEditableBomExcelReport);
// The upload shortcut opens its own in-place preview directly below the
// Upload Excel BOM actions, avoiding a jump to another part of the page.
elements.bomUploadReport.addEventListener("click", openBomUploadReport);
elements.bomUploadExcelReport.addEventListener("click", exportEditableBomExcelReport);
elements.bomReportPrint.addEventListener("click", printBomReportFrame);
elements.bomReportClose.addEventListener("click", closeBomReportPreview);
elements.bomUploadReportPrint.addEventListener("click", printBomUploadReportFrame);
elements.bomUploadReportClose.addEventListener("click", closeBomUploadReportPreview);
elements.estimatorReportPrint.addEventListener("click", printEstimatorBomReportFrame);
elements.estimatorReportClose.addEventListener("click", closeEstimatorBomReportPreview);
elements.lineItemsBody.addEventListener("click", (event) => {
  if (event.target.matches(".remove-line")) {
    removeLine(event.target.dataset.id);
  }
});
elements.reset.addEventListener("click", resetForm);
applyTheme(localStorage.getItem("csPipeTheme") || "light");
resetForm();
updateActiveSideNavOnScroll();
