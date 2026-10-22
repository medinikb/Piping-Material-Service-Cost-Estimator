/*
 * Pricing-route policy for items that cannot use a nearest-pipe material factor.
 * This module supplies no market prices and performs no weight calculation.
 * The existing metric stud engine remains the geometry/weight authority.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.SpecialComponentPricing = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function normalize(value) {
    return String(value || "").toUpperCase().replace(/\s+/g, " ").trim();
  }

  // Owner-approved budget exception only; do not enable other lined materials.
  function isRubberLinedCsBudgetMaterial(value) {
    const compact=normalize(value).replace(/&#(?:xA0|160);|&nbsp;/gi,' ').replace(/[^A-Z0-9]/g,'');
    return /^(?:ASTM)?A106(?:GR|GRADE)?BRUB(?:BER)?LIN(?:ED|ING)?$/.test(compact);
  }

  function isRubberLinedCsFittingBudgetMaterial(value) {
    const compact=normalize(value).replace(/&#(?:xA0|160);|&nbsp;/gi,' ').replace(/[^A-Z0-9]/g,'');
    return /^(?:ASTM)?A234(?:GR|GRADE)?WPBRUB(?:BER)?(?:LIN(?:ED|ING)?)?$/.test(compact);
  }

  function isRubberLinedCsFlangeBudgetMaterial(value) {
    const compact=normalize(value).replace(/&#(?:xA0|160);|&nbsp;/gi,' ').replace(/[^A-Z0-9]/g,'');
    return /^(?:ASTM)?A105RUB(?:BER)?(?:LIN(?:ED|ING)?)?$/.test(compact);
  }

  function routeResult(route, reason, details = {}) {
    return {
      applies: route !== "standard",
      route,
      calculationAllowed: route !== "review",
      requiresReview: route === "review",
      reason,
      ...details,
    };
  }

  function review(reason, details) {
    return routeResult("review", `${reason} A supported calculation model and approved rate basis are required; a raw-price override alone cannot price this construction.`, details);
  }

  function normalizeBoltingMaterial(materialText) {
    // Labels and punctuation separate constituents; never drop grade suffixes.
    return normalize(materialText).replace(/ASTM|ASME/g,'')
      .replace(/\b(?:BOLTS?|STUDS?|NUTS?)\s*:?/g,' ')
      .replace(/[,;]/g,'/').replace(/\bAND\b|&/g,'/')
      .replace(/A\s*194\s*GR\s*E[.\s]*(2HM|2H)(?=\b|\/|$)/g,'A194 GR $1')
      .replace(/[^A-Z0-9/]/g,'');
  }

  function identifyBoltingMaterial(materialText) {
    const compact = normalizeBoltingMaterial(materialText);
    // Full grade boundaries matter: B7M/2HM must never be accepted as B7/2H.
    const hasPair = (stud, nut) => new RegExp(`A193(?:GR)?${stud}(?=/|A194|$)`).test(compact)
      && new RegExp(`A194(?:GR)?${nut}(?=/|$)`).test(compact);
    if (hasPair("B7M", "2HM")) return "A193 B7M / A194 2HM";
    if (hasPair("B16", "4")) return "A193 B16 / A194 4";
    if (hasPair("B7", "2H")) return "A193 B7 / A194 2H";
    if (/^A307(?:GR)?B\/A307(?:GR)?B$/.test(compact)) return 'A307 B / A307 B';
    if (/^A320(?:GR)?L7\/A194(?:GR)?4$/.test(compact)) return 'A320 L7 / A194 4';
    if (/A307(?:GR)?[AB](?=\/|GALV|$)/.test(compact)) return "A307";
    return "Unverified bolting grade";
  }

  function parseMetricSetSize(sizeText) {
    // Require an explicit metric diameter and length; flange NPS is not bolt diameter.
    const text = normalize(sizeText).replace(/\u00d7/g, "X").replace(/^\s*,\s*/, '');
    const match = text.match(/^M\s*(\d+(?:\.\d+)?)\s*X\s*(\d+(?:\.\d+)?)\s*(?:MM|L)?$/);
    if (!match) return null;
    const diameterMm = Number(match[1]);
    const lengthMm = Number(match[2]);
    if (!Number.isFinite(diameterMm) || !Number.isFinite(lengthMm) || diameterMm <= 0 || lengthMm <= 0) return null;
    return { diameterMm, lengthMm };
  }

  function classifySpecialComponentPricing(input = {}) {
    const { group, item, materialText, sizeText } = input || {};
    const normalizedGroup = normalize(group);
    const normalizedItem = normalize(item);
    const material = normalize(materialText);

    if (/^FLANGE(?:S)?(?: GROUP)?$/.test(normalizedGroup) && isRubberLinedCsFlangeBudgetMaterial(materialText)) {
      return routeResult('standard','Owner-approved coated-CS budget allowance for rubber-lined A105 flanges; retain flange weight and manufacturing factor.',{coatedCsFlangeBudgetAllowance:true});
    }

    if (/^FITTING(?:S)?(?: GROUP)?$/.test(normalizedGroup) && isRubberLinedCsFittingBudgetMaterial(materialText)) {
      return routeResult('standard','Owner-approved coated-CS budget allowance for rubber-lined A234 WPB fittings; retain fitting geometry and manufacturing factor.',{coatedCsFittingBudgetAllowance:true});
    }

    if (/^PIPE(?: GROUP)?$/.test(normalizedGroup) && isRubberLinedCsBudgetMaterial(materialText)) {
      return routeResult('standard','Owner-approved CS coated-pipe budget allowance for A106 Gr.B rubber-lined pipe; not a separately priced rubber-lining scope.',{coatedCsBudgetAllowance:true});
    }

    // Explicit nonmetallic/lining text in the material field cannot use the
    // existing steel-density model. The ordinary page Coating option is separate.
    if (/\b(?:HDPE|MDPE|LDPE|POLYETHYLENE|POLYPROPYLENE|POLYMER|PVC|CPVC|PVDF|PTFE|RUBBER|RUB|BUTYL|LINED|LINING|JACKET|JACKETED)\b|\bPE\s*(?:3406|100|80)\b|\bD\s*(?:3035|3261)\b|\bRUB\s*[.:-]\s*(?:LIN|LON)/.test(material)) {
      return review("The material specifies a nonmetallic or lined construction; the steel-weight model does not cover its complete construction.", { materialFamily: "Nonmetallic / lined" });
    }

    const gasket = /GASKET/.test(normalizedGroup) || /\bGASKET\b/.test(normalizedItem);
    if (gasket) {
      let materialFamily = "Gasket";
      if (/SPIRAL|SPR\s*[.]?\s*WND|SP[R]?\s*WND/.test(material) || /SPIRAL/.test(normalizedItem)) materialFamily = "Spiral wound gasket";
      else if (/SOFT\s*IRON|BHN|\bRTJ\b/.test(material)) materialFamily = "Metallic / ring-joint gasket";
      else if (/2712|\bCAF\b/.test(material)) materialFamily = "Sheet gasket";
      return review("Gasket pricing needs the finished gasket type, size, rating, facing and filler/material specification. No approved gasket calculation and rate library is loaded.", { materialFamily });
    }

    const bolting = /BOLT|BOLTING/.test(normalizedGroup) || /\b(?:STUDS?|BOLTS?|NUTS?|WASHERS?)\b/.test(normalizedItem);
    if (!bolting) return routeResult("standard", "Use the existing material and component pricing rules.");

    const materialFamily = identifyBoltingMaterial(material);
    const hasStud = /\bSTUDS?\b/.test(normalizedItem);
    const hasNut = /\bNUTS?\b/.test(normalizedItem);
    const isStudSet = hasStud && (hasNut || /\bSET\b/.test(normalizedItem));
    const construction = isStudSet ? "set" : hasStud ? "stud" : hasNut ? "nut" : "unsupported";
    if (construction === "unsupported" || /\b(?:MACHINE|HEADED|ANCHOR|WASHERS?|JAM|LOCK|THIN|SLOTTED|CASTLE|SQUARE|FLANGE)\b/.test(normalizedItem)
      || (/\bHEX[\s-]+NUTS?\b/.test(normalizedItem) && !/\bHEAVY[\s-]+HEX[\s-]+NUTS?\b/.test(normalizedItem))) {
      return review("Only fully threaded metric studs and heavy-hex nuts are supported; headed bolts, other nut constructions and washers need their own mass model.", { materialFamily });
    }
    if (/\bGALV(?:ANI[ZS]ED)?\b|\b(?:ZINC|PTFE|COATED|PLATED)\b/.test(`${material} ${normalizedItem}`)) {
      return review("The specified bolt coating or finish is not included in the existing stud-and-nut conversion factor.", { materialFamily });
    }
    const compactMaterial = normalizeBoltingMaterial(materialText);
    const supportedMaterial = ["A193 B7 / A194 2H", "A193 B7M / A194 2HM", "A193 B16 / A194 4", "A307 B / A307 B", "A320 L7 / A194 4"].includes(materialFamily)
      || (construction === "stud" && /^A193(?:GR)?B7$/.test(compactMaterial))
      || (construction === "nut" && /^A194(?:GR)?2H$/.test(compactMaterial));
    if (!supportedMaterial) {
      return review("This bolting grade/combination has no complete supported budget rule. No nut grade or missing constituent rate is inferred from a stud grade.", { materialFamily });
    }
    const nutSize = construction === "nut" && normalize(sizeText).match(/^M\s*(\d+(?:\.\d+)?)\s*(?:MM)?$/);
    const geometry = construction === "nut"
      ? (nutSize && Number(nutSize[1]) > 0 ? { diameterMm: Number(nutSize[1]), lengthMm: 0 } : null)
      : parseMetricSetSize(sizeText);
    if (!geometry) {
      return review("Enter actual metric stud diameter and length (M24 x 145 mm), or nut diameter (M24). Flange NPS, imperial designations and incomplete sizes cannot use this metric mass model.", { materialFamily });
    }
    // Explicit counts in BOM descriptions take precedence over the default two.
    const words = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4 };
    const counts = [...normalizedItem.matchAll(/\b(\d+(?:\.\d+)?|ONE|TWO|THREE|FOUR)\s*(?:HEAVY[\s-]*HEX\s*)?NUTS?\b/g)]
      .map(match => words[match[1]] || Number(match[1]));
    const enteredCount = String(input.numberOfNuts ?? "").trim();
    const numberOfNuts = construction === "stud" ? 0 : construction === "nut" ? 1
      : enteredCount !== "" ? Number(enteredCount) : counts[0] ?? (/\bNUT\b/.test(normalizedItem) && !/\bNUTS\b/.test(normalizedItem) ? 1 : 2);
    if (!Number.isInteger(numberOfNuts) || numberOfNuts < 0 || (construction === "set" && numberOfNuts < 1)
      || counts.some(count => count !== numberOfNuts)) {
      return review("Nut count must be a positive whole number for a set and agree with its description.", { materialFamily });
    }
    return routeResult(construction === "set" ? "metric-stud-set" : `metric-${construction}`, "Use the metric mass model with exact mapped default stock rates or a confirmed raw-price override; default factor 2.50 is default, not NRL calibrated.", {
      materialFamily,
      geometry,
      construction,
      numberOfNuts,
      gradeBudgetAssumption: materialFamily === 'A307 B / A307 B'
        ? 'Budget allowance: both pieces use the saved carbon round-stock allowance. A307 in the nut field is retained from the BOM, not validated as a nut standard; confirm the actual nut specification before procurement. Generic factor and heavy-hex geometry are estimating assumptions.'
        : materialFamily !== 'A193 B7 / A194 2H' && construction === 'set'
        ? 'Existing metric geometry and generic default factor are budget assumptions for this exact grade pair, not grade-specific PO calibration or finished-fastener certification. Any low-temperature impact testing or certification requires procurement confirmation.' : '',
      requiresConfirmedRawRate: false,
      requiresAvailableRawRate: true,
    });
  }

  return Object.freeze({ classifySpecialComponentPricing, identifyBoltingMaterial, normalizeBoltingMaterial, parseMetricSetSize, isRubberLinedCsBudgetMaterial, isRubberLinedCsFittingBudgetMaterial, isRubberLinedCsFlangeBudgetMaterial });
});
