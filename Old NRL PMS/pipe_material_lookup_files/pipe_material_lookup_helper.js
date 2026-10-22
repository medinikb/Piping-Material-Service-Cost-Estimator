// Pipe Material Lookup Helper
// Use with pipe_material_lookup_webapp.json.
// Typical flow:
//   const data = await fetch("pipe_material_lookup_webapp.min.json").then(r => r.json());
//   const candidates = findPipeMaterialByDescription(data, "SEAMLESS PIPE/ 6.0 INCH/XS/BE/ASME B-36.10/ ASTM A 106 GR.B");
//   console.log(candidates.map(r => r.materialNo));

export function normalizePipeDescription(input) {
  if (!input) return "";

  let s = String(input).toUpperCase();
  s = s.replace(/[”"“″]/g, " INCH ");

  const replacements = [
    [/SEAMLESSPIPE/g, "SEAMLESS PIPE"],
    [/WELDEDPIPE/g, "WELDED PIPE"],
    [/C\.WELDEDPIPE/g, "C WELDED PIPE"],
    [/C\.WELDED PIPE/g, "C WELDED PIPE"],
    [/C\.WELDED/g, "C WELDED"],
    [/E\.FS\.W/g, "EFSW"],
    [/E\. FS\. W/g, "EFSW"],
    [/EFS\.W/g, "EFSW"],
    [/ASTMA/g, "ASTM A"],
    [/ASTM  A/g, "ASTM A"],
    [/ASMEB/g, "ASME B"],
    [/ASME  B/g, "ASME B"],
    [/API5L/g, "API 5L"]
  ];

  for (const [pattern, replacement] of replacements) {
    s = s.replace(pattern, replacement);
  }

  s = s.replace(/\bAPI\s*5L\s*GR/g, "API 5L GR");
  s = s.replace(/\bB[-\s]?36[.\s]?10\b/g, "B36.10");
  s = s.replace(/\bB[-\s]?36[.\s]?19\b/g, "B36.19");
  s = s.replace(/\bASME\s+B36\.10\b/g, "ASME B36.10");
  s = s.replace(/\bASME\s+B36\.19\b/g, "ASME B36.19");
  s = s.replace(/\bA\s+(\d{3})\b/g, "A$1");
  s = s.replace(/\bASTM\s+(\d{3})\b/g, "ASTM A$1");
  s = s.replace(/\bTP\s*([0-9]{3}[A-Z]?)\b/g, "TP$1");
  s = s.replace(/\bGR[.\s]*([A-Z0-9.]+)\b/g, "GR.$1");
  s = s.replace(/\bCL[.\s]*(\d+)\b/g, "CL.$1");
  s = s.replace(/\bSCH[.\s]*(XS|XXS|STD|\d+)\b/g, "SCH $1");
  s = s.replace(/\s+/g, " ").trim();

  return s;
}

export function makePipeLookupKey(input) {
  return normalizePipeDescription(input)
    .replace(/[^A-Z0-9.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function findPipeMaterialByDescription(data, bomDescription) {
  const key = makePipeLookupKey(bomDescription);
  const materialNos = data.indices.byLookupKey[key] || [];
  return materialNos.map(no => data.records[data.indices.byMaterialNo[no]]);
}

export function filterPipeMaterials(data, criteria = {}) {
  const {
    sizeInch,
    sizeNps,
    schedule,
    thicknessMm,
    endConnection,
    pipeType,
    dimensionalStandard,
    materialSpec,
    serviceTag
  } = criteria;

  return data.records.filter(record => {
    const a = record.attributes;

    if (sizeInch !== undefined && sizeInch !== null && Number(a.sizeInch) !== Number(sizeInch)) return false;
    if (sizeNps && a.sizeNps !== String(sizeNps)) return false;
    if (schedule && a.schedule !== String(schedule).toUpperCase()) return false;
    if (thicknessMm !== undefined && thicknessMm !== null && Number(a.thicknessMm) !== Number(thicknessMm)) return false;
    if (endConnection && !a.endConnections.includes(String(endConnection).toUpperCase())) return false;
    if (pipeType && a.pipeType !== String(pipeType).toUpperCase()) return false;
    if (dimensionalStandard && !a.dimensionalStandards.includes(dimensionalStandard)) return false;
    if (materialSpec && !a.materialSpecs.includes(materialSpec)) return false;
    if (serviceTag && !a.serviceTags.includes(String(serviceTag).toUpperCase())) return false;

    return true;
  });
}
