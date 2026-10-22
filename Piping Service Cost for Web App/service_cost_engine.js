(function (global) {
  "use strict";

  function asPositiveNumber(value, name, allowZero) {
    const number = Number(value);
    const valid = Number.isFinite(number) && (allowZero ? number >= 0 : number > 0);
    if (!valid) throw new Error(`${name} must be ${allowZero ? "zero or positive" : "positive"}.`);
    return number;
  }

  function normalise(value) {
    return String(value || "").trim().toUpperCase();
  }

  function findRate(data, query) {
    if (!data || !Array.isArray(data.rateTable)) {
      return { status: "REVIEW_REQUIRED", reason: "Service rate library is unavailable." };
    }

    const nps = Number(query.nps);
    const thicknessMm = Number(query.thicknessMm);
    const location = normalise(query.location);
    const regulatoryClass = normalise(query.regulatoryClass);
    const activity = normalise(query.activity);
    const weldType = normalise(query.weldType || "NA");

    if (!Number.isFinite(nps) || nps <= 0 || !Number.isFinite(thicknessMm) || thicknessMm <= 0) {
      return { status: "REVIEW_REQUIRED", reason: "Positive actual pipe size and wall thickness are required for service-rate selection." };
    }
    const expectedUnit = normalise(query.unit || ({ ERECTION: "IM", FABRICATION: "ID", FLAME_CUTTING: "ID" })[activity]);
    const sameConditions = (row) => (row.location === "ANY" || row.location === location) &&
      row.regulatoryClass === regulatoryClass && row.activity === activity && row.weldType === weldType &&
      thicknessMm > Number(row.thicknessMinExclusiveMm) && thicknessMm <= Number(row.thicknessMaxInclusiveMm) &&
      (!expectedUnit || row.unit === expectedUnit);

    const match = data.rateTable.find((row) => {
      return (
        sameConditions(row) &&
        nps >= Number(row.npsMinIn) &&
        nps <= Number(row.npsMaxIn)
      );
    });

    if (!match) {
      // Owner-authorised budget assumption: copy only a documented higher-size
      // unit RATE in this same library/band/condition, never larger quantities.
      const candidates = query.allowHigherSizeFallback === false || !expectedUnit ? [] : data.rateTable
        .filter((row) => sameConditions(row) && Number.isFinite(Number(row.npsMinIn)) &&
          Number(row.npsMinIn) > nps && Number.isFinite(Number(row.npsMaxIn)) && Number(row.npsMaxIn) >= Number(row.npsMinIn) &&
          Number.isFinite(Number(row.rateRs)) && Number(row.rateRs) > 0)
        .sort((a, b) => Number(a.npsMinIn) - Number(b.npsMinIn));
      if (candidates.length) {
        const selected = candidates[0];
        const nearest = candidates.filter((row) => Number(row.npsMinIn) === Number(selected.npsMinIn));
        if (nearest.some((row) => row.rateRs !== selected.rateRs || row.source !== selected.source ||
          row.thicknessMinExclusiveMm !== selected.thicknessMinExclusiveMm || row.thicknessMaxInclusiveMm !== selected.thicknessMaxInclusiveMm)) {
          return { status: "REVIEW_REQUIRED", reason: `Conflicting next-higher-size ${activity} rates require approval; no rate was selected.` };
        }
        const fallbackAudit = {
          actualNpsIn: nps, rateBasisNpsIn: Number(selected.npsMinIn), actualThicknessMm: thicknessMm,
          thicknessMinExclusiveMm: Number(selected.thicknessMinExclusiveMm), thicknessMaxInclusiveMm: Number(selected.thicknessMaxInclusiveMm),
          libraryCode: data.libraryCode || data.materialFamily || "Selected material library", location, regulatoryClass,
          activity, weldType, unit: selected.unit, rateRs: Number(selected.rateRs), source: selected.source || "Source not specified",
        };
        const fallbackNote = `Budget fallback: ${nps} IN -> ${fallbackAudit.rateBasisNpsIn} IN; ${activity}/${weldType}; thickness >${fallbackAudit.thicknessMinExclusiveMm} to ${fallbackAudit.thicknessMaxInclusiveMm} mm; ${fallbackAudit.libraryCode}; ${location}/${regulatoryClass}; Rs ${fallbackAudit.rateRs}/${fallbackAudit.unit}; ${fallbackAudit.source}. Actual size/quantities retained. Approval required; not guaranteed conservative.`;
        return { ...selected, status: "READY", pricingStatus: "BUDGET_FALLBACK", budgetFallbackUsed: true, requiresApproval: true, fallbackAudit, fallbackNote };
      }
      return {
        status: "REVIEW_REQUIRED",
        reason:
          `No documented ${activity} rate for ${location}, ${regulatoryClass}, ` +
          `${nps} IN and ${thicknessMm} mm. No eligible exact or next-higher-size rate under matching conditions; review required.`
      };
    }

    if (!Number.isFinite(Number(match.rateRs)) || Number(match.rateRs) <= 0) {
      return { status: "REVIEW_REQUIRED", reason: `The matched ${activity} service rate is missing or invalid; review required.` };
    }
    return { ...match, status: "READY", pricingStatus: "EXACT", budgetFallbackUsed: false };
  }

  function calculateAutoStraightJoints(lengthM, stockLengthM, lineCount, jointAllowanceFactor = 1.6) {
    const length = asPositiveNumber(lengthM, "Length", true);
    const stock = asPositiveNumber(stockLengthM, "Stock length");
    const lines = Math.max(1, Math.round(asPositiveNumber(lineCount, "Line count")));
    const allowance = asPositiveNumber(jointAllowanceFactor, "Joint allowance factor");
    if (length === 0) return 0;

    const averageLengthPerLine = length / lines;
    // A 6 m pipe row still represents one planned field joint/service allowance.
    // Use the number of stock-length segments, not only the joins between segments.
    const baseJoints = Math.ceil(averageLengthPerLine / stock) * lines;
    // Allow for associated piping/components and always round the joint count upward.
    return Math.ceil(baseJoints * allowance);
  }

  function calculatePipeService(input, data) {
    try {
      const nps = asPositiveNumber(input.nps, "NPS");
      const thicknessMm = asPositiveNumber(input.thicknessMm, "Thickness");
      const lengthM = asPositiveNumber(input.lengthM, "Length", true);
      const location = normalise(input.location || "ABOVE_GROUND");
      const regulatoryClass = normalise(input.regulatoryClass || "NON_IBR");
      const fabricationMode = normalise(input.fabricationMode || "MANUAL");
      const includeErection = input.includeErection !== false;
      const escalationFactor = asPositiveNumber(input.escalationFactor ?? 1, "Escalation factor");
      const contingencyPercent = asPositiveNumber(input.contingencyPercent ?? 0, "Contingency percent", true);

      const erectionRate = includeErection
        ? findRate(data, {
            location,
            regulatoryClass,
            activity: "ERECTION",
            allowHigherSizeFallback: input.allowHigherSizeFallback,
            weldType: "NA",
            nps,
            thicknessMm
          })
        : null;

      if (erectionRate && erectionRate.status !== "READY") return erectionRate;

      let straightButtWeldJoints = 0;
      if (fabricationMode === "STOCK_LENGTH_PROXY") {
        straightButtWeldJoints = calculateAutoStraightJoints(
          lengthM,
          input.stockLengthM ?? 6,
          input.lineCount ?? 1,
          input.jointAllowanceFactor ?? 1.6
        );
      } else if (fabricationMode === "MANUAL_JOINT_COUNT") {
        straightButtWeldJoints = asPositiveNumber(
          input.straightButtWeldJoints ?? 0,
          "Straight butt-weld joints",
          true
        );
      } else if (fabricationMode !== "MANUAL_DIAMETER_INCH") {
        throw new Error(
          "Fabrication mode must be MANUAL_DIAMETER_INCH, MANUAL_JOINT_COUNT, or STOCK_LENGTH_PROXY."
        );
      }

      const extraButtWeldDiameterInch = asPositiveNumber(
        input.extraButtWeldDiameterInch ?? 0,
        "Extra butt-weld diameter-inch",
        true
      );
      const filletWeldDiameterInch = asPositiveNumber(
        input.filletWeldDiameterInch ?? 0,
        "Fillet-weld diameter-inch",
        true
      );
      const flameCutDiameterInch = asPositiveNumber(
        input.flameCutDiameterInch ?? 0,
        "Flame-cut diameter-inch",
        true
      );

      const manualButtWeldDiameterInch = fabricationMode === "MANUAL_DIAMETER_INCH"
        ? asPositiveNumber(input.buttWeldDiameterInch ?? 0, "Butt-weld diameter-inch", true)
        : straightButtWeldJoints * nps + extraButtWeldDiameterInch;

      let buttFabricationRate = null;
      let filletFabricationRate = null;
      let flameCutRate = null;

      if (manualButtWeldDiameterInch > 0) {
        buttFabricationRate = findRate(data, {
          location,
          regulatoryClass,
          activity: "FABRICATION",
          weldType: "BUTT_WELD",
          allowHigherSizeFallback: input.allowHigherSizeFallback,
          nps,
          thicknessMm
        });
        if (buttFabricationRate.status !== "READY") return buttFabricationRate;
      }

      if (filletWeldDiameterInch > 0) {
        filletFabricationRate = findRate(data, {
          location,
          regulatoryClass,
          activity: "FABRICATION",
          weldType: "FILLET_WELD",
          allowHigherSizeFallback: input.allowHigherSizeFallback,
          nps,
          thicknessMm
        });
        if (filletFabricationRate.status !== "READY") return filletFabricationRate;
      }

      if (flameCutDiameterInch > 0) {
        flameCutRate = findRate(data, {
          location,
          regulatoryClass,
          activity: "FLAME_CUTTING",
          allowHigherSizeFallback: input.allowHigherSizeFallback,
          weldType: "NA",
          nps,
          thicknessMm
        });
        if (flameCutRate.status !== "READY") return flameCutRate;
      }

      const erectionQuantityIM = includeErection ? nps * lengthM : 0;
      const erectionCost = includeErection ? erectionQuantityIM * erectionRate.rateRs : 0;
      const buttFabricationCost =
        manualButtWeldDiameterInch * (buttFabricationRate ? buttFabricationRate.rateRs : 0);
      const filletFabricationCost =
        filletWeldDiameterInch * (filletFabricationRate ? filletFabricationRate.rateRs : 0);
      const flameCuttingCost =
        flameCutDiameterInch * (flameCutRate ? flameCutRate.rateRs : 0);

      const directServiceCost =
        erectionCost + buttFabricationCost + filletFabricationCost + flameCuttingCost;
      const escalatedServiceCost = directServiceCost * escalationFactor;
      const contingencyAmount = escalatedServiceCost * contingencyPercent / 100;
      const budgetServiceCost = escalatedServiceCost + contingencyAmount;
      const sizeFallbacks = [erectionRate, buttFabricationRate, filletFabricationRate, flameCutRate]
        .filter((rate) => rate?.budgetFallbackUsed).map((rate) => ({ ...rate.fallbackAudit, note: rate.fallbackNote }));
      const fallbackNote = sizeFallbacks.map((rate) => rate.note).join(" | ");

      return {
        status: "READY",
        pricingStatus: sizeFallbacks.length ? "BUDGET_FALLBACK" : "EXACT",
        budgetFallbackUsed: sizeFallbacks.length > 0,
        requiresApproval: sizeFallbacks.length > 0,
        inputs: {
          nps,
          thicknessMm,
          lengthM,
          location,
          regulatoryClass,
          fabricationMode,
          includeErection,
          jointAllowanceFactor: fabricationMode === "STOCK_LENGTH_PROXY"
            ? Number(input.jointAllowanceFactor ?? 1.6)
            : 1,
          escalationFactor,
          contingencyPercent
        },
        quantities: {
          erectionQuantityIM,
          straightButtWeldJoints,
          buttWeldDiameterInch: manualButtWeldDiameterInch,
          filletWeldDiameterInch,
          flameCutDiameterInch
        },
        rates: {
          erectionRsPerIM: erectionRate ? erectionRate.rateRs : 0,
          buttFabricationRsPerID: buttFabricationRate ? buttFabricationRate.rateRs : 0,
          filletFabricationRsPerID: filletFabricationRate ? filletFabricationRate.rateRs : 0,
          flameCuttingRsPerID: flameCutRate ? flameCutRate.rateRs : 0
        },
        costs: {
          erectionCost,
          buttFabricationCost,
          filletFabricationCost,
          flameCuttingCost,
          directServiceCost,
          escalatedServiceCost,
          contingencyAmount,
          budgetServiceCost,
          budgetServiceCostPerM: lengthM > 0 ? budgetServiceCost / lengthM : 0
        },
        audit: {
          sizeFallbacks,
          fallbackNote,
          erectionSource: erectionRate ? erectionRate.source : "",
          buttFabricationSource: buttFabricationRate ? buttFabricationRate.source : "",
          filletFabricationSource: filletFabricationRate ? filletFabricationRate.source : "",
          flameCuttingSource: flameCutRate ? flameCutRate.source : "",
          formulaReference: buttFabricationRate ? buttFabricationRate.formulaReference : "",
          warning: fallbackNote + (fallbackNote ? " " : "") + (
            fabricationMode === "STOCK_LENGTH_PROXY"
              ? "Fabrication is a planning proxy based on average line length, 6 m stock length, and a 1.60 joint allowance for associated piping/components. Replace with actual weld diameter-inch for a detailed estimate."
              : includeErection
                ? "Fabrication is based on user-entered weld quantities."
                : "Welding-only component service: no erection IM is applied.")
        }
      };
    } catch (error) {
      return { status: "REVIEW_REQUIRED", reason: error.message };
    }
  }

  function calculateSalvaging(input, data) {
    try {
      const diameterInch = asPositiveNumber(input.diameterInch, "Salvaging diameter-inch", true);
      const elevationMagnitudeM = asPositiveNumber(input.elevationMagnitudeM ?? 0, "Elevation magnitude", true);
      const base = data?.specialRates?.salvaging;
      if (!base) return { status: "REVIEW_REQUIRED", reason: "Salvaging rate is unavailable." };

      const additionalBands = elevationMagnitudeM > 5
        ? Math.ceil((elevationMagnitudeM - 5) / 5)
        : 0;
      const heightFactor = 1 + additionalBands * 0.10;
      const cost = diameterInch * Number(base.rateRs) * heightFactor;

      return {
        status: "READY",
        diameterInch,
        baseRateRsPerID: Number(base.rateRs),
        additionalHeightBands: additionalBands,
        heightFactor,
        cost,
        note: base.scaffolding
      };
    } catch (error) {
      return { status: "REVIEW_REQUIRED", reason: error.message };
    }
  }

  const api = {
    findRate,
    calculateAutoStraightJoints,
    calculatePipeService,
    calculateSalvaging
  };

  global.PipingServiceCost = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
