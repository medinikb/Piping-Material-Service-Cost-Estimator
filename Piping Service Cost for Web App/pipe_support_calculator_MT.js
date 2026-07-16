/*
 * Budgetary pipe-support structural-steel quantity calculator.
 * This is a parametric estimate only; it is not a stress-analysis or support-design tool.
 */
(function (root) {
  "use strict";

  const MAXIMUM_SPAN_BY_NPS = [
    { maxNps: 1, spanM: 2 },
    { maxNps: 2, spanM: 3 },
    { maxNps: 4, spanM: 4 },
    { maxNps: 48, spanM: 6 },
  ];

  function requirePositive(name, value) {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(`${name} must be greater than zero.`);
    }
  }

  function getSuggestedMaximumSpanM(npsIn) {
    const matchedBand = MAXIMUM_SPAN_BY_NPS.find((band) => npsIn <= band.maxNps);
    if (!matchedBand) {
      throw new Error("Suggested pipe support span is available only up to NPS 48.");
    }
    return matchedBand.spanM;
  }

  function calculate(input) {
    if (!input || typeof input !== "object") {
      throw new Error("Pipe-support input is required.");
    }

    const npsIn = Number(input.npsIn);
    const odMm = Number(input.odMm);
    const wallThicknessMm = Number(input.wallThicknessMm);
    const pipeLengthM = Number(input.pipeLengthM);
    const supportHeightM = input.supportHeightM === undefined ? 0.5 : Number(input.supportHeightM);
    requirePositive("npsIn", npsIn);
    requirePositive("odMm", odMm);
    requirePositive("wallThicknessMm", wallThicknessMm);
    requirePositive("pipeLengthM", pipeLengthM);
    requirePositive("supportHeightM", supportHeightM);
    if ((2 * wallThicknessMm) >= odMm) {
      throw new Error("Wall thickness produces an invalid internal diameter.");
    }

    const adoptedSupportSpacingM = getSuggestedMaximumSpanM(npsIn);
    const pipeMetalWeightKgM = 0.02466 * wallThicknessMm * (odMm - wallThicknessMm);
    const totalSupportCount = Math.max(1, Math.ceil(pipeLengthM / adoptedSupportSpacingM) + 1);

    // Direct support basis: a 500 mm support uses 500 mm of the matching pipe section.
    const supportWeightKg = pipeMetalWeightKgM * supportHeightM;
    const normalSupportSteelKg = totalSupportCount * supportWeightKg;
    const routeComplexityAllowanceKg = 0;
    const structuralQuantityKg = normalSupportSteelKg;

    return {
      adoptedSupportSpacingM,
      spacingSource: "suggested_maximum_span",
      supportHeightM,
      totalSupportCount,
      pipeMetalWeightKgM,
      governingLineWeightKgM: pipeMetalWeightKgM,
      supportReactionKN: null,
      normalSupportWeightKg: supportWeightKg,
      normalSupportSteelKg,
      routeComplexityPercent: 0,
      routeComplexityAllowanceKg,
      structuralQuantityKg,
      structuralQuantityMT: structuralQuantityKg / 1000,
      calculationBasis: "Support steel = pipe kg/m x support height x support count",
    };
  }

  root.PipeSupportStructural = { calculate, getSuggestedMaximumSpanM };
})(typeof self !== "undefined" ? self : this);
