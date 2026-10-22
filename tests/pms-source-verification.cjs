'use strict';
// Step 6 source audit: source-checked means transcription evidence, not engineering approval.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const dataDir = path.join(root, 'Old NRL PMS', 'data');
let checks = 0;
function check(condition, message) { checks++; assert.ok(condition, message); }
const expectedReviewedRows = [
  {
    "pipeClass": "A16A",
    "id": "pipe-efsw-16-24",
    "material": "ASTM A GTL GR.B60 CL12",
    "sourcePage": 194,
    "status": "needs_review"
  },
  {
    "pipeClass": "A4F",
    "id": "pipe-seamless-small",
    "material": "ASTM A335 GR.P5",
    "sourcePage": 175,
    "status": "needs_review"
  },
  {
    "pipeClass": "A4F",
    "id": "pipe-seamless-medium",
    "material": "ASTM A335 GR.P5",
    "sourcePage": 175,
    "status": "needs_review"
  },
  {
    "pipeClass": "A4F",
    "id": "pipe-seamless-8-12",
    "material": "ASTM A335 GR.P5",
    "sourcePage": 175,
    "status": "needs_review"
  },
  {
    "pipeClass": "A4F",
    "id": "pipe-seamless-14",
    "material": "ASTM A335 GR.P5",
    "sourcePage": 175,
    "status": "needs_review"
  },
  {
    "pipeClass": "A4F",
    "id": "pipe-efsw-16-18",
    "material": "ASTM A691 GR.5CR CL42",
    "sourcePage": 175,
    "status": "needs_review"
  },
  {
    "pipeClass": "A4F",
    "id": "flange-wn-0-5-18",
    "material": "ASTM A182 GR.F5",
    "sourcePage": 175,
    "status": "needs_review"
  },
  {
    "pipeClass": "A4F",
    "id": "flange-blind-0-5-18",
    "material": "ASTM A182 GR.F5",
    "sourcePage": 175,
    "status": "needs_review"
  },
  {
    "pipeClass": "A4F",
    "id": "fig8-flange",
    "material": "ASTM A182 GR.F5",
    "sourcePage": 175,
    "status": "needs_review"
  },
  {
    "pipeClass": "A4F",
    "id": "spacer-blind-10-18",
    "material": "ASTM A182 GR.F5",
    "sourcePage": 175,
    "status": "needs_review"
  },
  {
    "pipeClass": "A4F",
    "id": "fitting-sw-0-5-1-5",
    "material": "ASTM A182 GR.F5",
    "sourcePage": 175,
    "status": "needs_review"
  },
  {
    "pipeClass": "A4F",
    "id": "fitting-bw-2-14",
    "material": "ASTM A234 GR.WP5",
    "sourcePage": 175,
    "status": "needs_review"
  },
  {
    "pipeClass": "A4F",
    "id": "fitting-bw-16-18",
    "material": "ASTM A234 GR.WP5W",
    "sourcePage": 175,
    "status": "needs_review"
  },
  {
    "pipeClass": "A4F",
    "id": "caps-scrf",
    "material": "ASTM A182 GR.F5",
    "sourcePage": 175,
    "status": "needs_review"
  },
  {
    "pipeClass": "A4F",
    "id": "valve-gate-sw",
    "material": "A182 GR.F5, 13%CR + STEL",
    "sourcePage": 176,
    "status": "needs_review"
  },
  {
    "pipeClass": "A4F",
    "id": "valve-globe-sw",
    "material": "A182 GR.F5, 13%CR + STEL",
    "sourcePage": 176,
    "status": "needs_review"
  },
  {
    "pipeClass": "A4F",
    "id": "valve-check-sw",
    "material": "A182 GR.F5, 13%CR + STEL",
    "sourcePage": 176,
    "status": "needs_review"
  },
  {
    "pipeClass": "A4F",
    "id": "valve-gate-rf",
    "material": "A217 GR.C5, 13%CR + STEL",
    "sourcePage": 176,
    "status": "needs_review"
  },
  {
    "pipeClass": "A4F",
    "id": "valve-globe-rf",
    "material": "A217 GR.C5, 13%CR + STEL",
    "sourcePage": 176,
    "status": "needs_review"
  },
  {
    "pipeClass": "A4F",
    "id": "valve-check-rf",
    "material": "A217 GR.C5, 13%CR + STEL",
    "sourcePage": 176,
    "status": "needs_review"
  },
  {
    "pipeClass": "A4F",
    "id": "stud-bolts",
    "material": "A193 GR.B16 / A194 GR.4",
    "sourcePage": 176,
    "status": "needs_review"
  },
  {
    "pipeClass": "A4F",
    "id": "gasket-spiral",
    "material": "SS316 SPR.WND + CA FIL",
    "sourcePage": 176,
    "status": "needs_review"
  },
  {
    "pipeClass": "A4F",
    "id": "strainer-perm-sw",
    "material": "B: A182 F5; INT: SS304",
    "sourcePage": 176,
    "status": "needs_review"
  },
  {
    "pipeClass": "A4F",
    "id": "strainer-perm-bw-2-14",
    "material": "B: A234 WP5; INT: SS304",
    "sourcePage": 176,
    "status": "needs_review"
  },
  {
    "pipeClass": "A4F",
    "id": "strainer-perm-bw-16-18",
    "material": "B: A234 WP5W; INT: SS304",
    "sourcePage": 176,
    "status": "needs_review"
  },
  {
    "pipeClass": "B1F",
    "id": "perm-str-bw-16-42",
    "material": "B: A235GWP5W; INT:SS304",
    "sourcePage": 185,
    "status": "needs_review"
  },
  {
    "pipeClass": "B1F",
    "id": "pipe-seamless-pe-0-5-1-5",
    "material": "ASTM A 312 TP 316L",
    "sourcePage": 186,
    "status": "needs_review"
  },
  {
    "pipeClass": "B1F",
    "id": "pipe-seamless-be-2-6",
    "material": "ASTM A 312 TP 316L",
    "sourcePage": 186,
    "status": "needs_review"
  },
  {
    "pipeClass": "B1F",
    "id": "pipe-e-f-s-w-be-8-8",
    "material": "ASTM A 358 TP 316L CL1",
    "sourcePage": 186,
    "status": "needs_review"
  },
  {
    "pipeClass": "B1F",
    "id": "pipe-e-f-s-w-be-10-12",
    "material": "ASTM A 358 TP 316L CL1",
    "sourcePage": 186,
    "status": "needs_review"
  },
  {
    "pipeClass": "B1F",
    "id": "flange-w-n-flange-rf-0-5-1-5",
    "material": "ASTM A 182 GR.F316L",
    "sourcePage": 186,
    "status": "needs_review"
  },
  {
    "pipeClass": "B1F",
    "id": "flange-w-n-flange-rf-2-12",
    "material": "ASTM A 182 GR.F316L",
    "sourcePage": 186,
    "status": "needs_review"
  },
  {
    "pipeClass": "B1F",
    "id": "flange-blind-flange-rf-0-5-10-5",
    "material": "ASTM A 182 GR.F316L",
    "sourcePage": 186,
    "status": "needs_review"
  },
  {
    "pipeClass": "B1F",
    "id": "flange-blind-flange-rf-2-12",
    "material": "ASTM A 182 GR.F316L",
    "sourcePage": 186,
    "status": "needs_review"
  },
  {
    "pipeClass": "B1F",
    "id": "flange-spcr-bln-ff-10-12",
    "material": "ASTM A 182 GR.F316L",
    "sourcePage": 186,
    "status": "needs_review"
  },
  {
    "pipeClass": "B1F",
    "id": "fitting-sw-0-5-1-5",
    "material": "ASTM A 182 GR.F316L",
    "sourcePage": 186,
    "status": "needs_review"
  },
  {
    "pipeClass": "B1F",
    "id": "fitting-bw-2-6",
    "material": "ASTM A403 GR.WP316L",
    "sourcePage": 186,
    "status": "needs_review"
  },
  {
    "pipeClass": "B1F",
    "id": "fitting-bw-8-12",
    "material": "ASTM A403 GR.WP316LW",
    "sourcePage": 186,
    "status": "needs_review"
  },
  {
    "pipeClass": "B1F",
    "id": "caps-scrf-0-5-1-5",
    "material": "ASTM A 182 GR.F316L",
    "sourcePage": 186,
    "status": "needs_review"
  },
  {
    "pipeClass": "B1K",
    "id": "valve-gate-rf-2-12",
    "material": "A315GRCF8, TRIMSS304",
    "sourcePage": 98,
    "status": "needs_review"
  },
  {
    "pipeClass": "B1K",
    "id": "valve-globe-rf-2-8",
    "material": "A315GRCF8, TRIMSS304",
    "sourcePage": 98,
    "status": "needs_review"
  },
  {
    "pipeClass": "B1K",
    "id": "valve-check-rf-2-12",
    "material": "A315GRCF8, TRIMSS304",
    "sourcePage": 98,
    "status": "needs_review"
  },
  {
    "pipeClass": "B21N",
    "id": "valve-ball-rf-2-16",
    "material": "A315GRCF3M, TRIM. T-8",
    "sourcePage": 104,
    "status": "needs_review"
  },
  {
    "pipeClass": "B21N",
    "id": "valve-globe-sw-0-5-1-5",
    "material": "A182GRF347, TR+STELL.",
    "sourcePage": 104,
    "status": "source_checked",
    "originalMaterial": "190"
  },
  {
    "pipeClass": "B5D",
    "id": "pipe-e-f-s-w-be-16-16",
    "material": "ASTM A 6916R1, 25CRCL42",
    "sourcePage": 101,
    "status": "needs_review"
  },
  {
    "pipeClass": "B5D",
    "id": "pipe-e-f-s-w-be-18-20",
    "material": "ASTM A 6916R1, 25CRCL42",
    "sourcePage": 101,
    "status": "needs_review"
  },
  {
    "pipeClass": "B5D",
    "id": "pipe-e-f-s-w-be-22-24",
    "material": "ASTM A 6916R1, 25CRCL42",
    "sourcePage": 101,
    "status": "needs_review"
  },
  {
    "pipeClass": "B5D",
    "id": "fitting-sw-0-5-1-5",
    "material": "ASTM A 152 GR.F11",
    "sourcePage": 101,
    "status": "needs_review"
  },
  {
    "pipeClass": "B5D",
    "id": "caps-scrf-0-5-1-5",
    "material": "ASTM A 152 GR.F11",
    "sourcePage": 101,
    "status": "needs_review"
  },
  {
    "pipeClass": "D1K",
    "id": "fitting-bw-2-6",
    "material": "ASTM A403 GR.WP3045",
    "sourcePage": 121,
    "status": "needs_review"
  },
  {
    "pipeClass": "G5M",
    "id": "valve-gate-bw-b-16-34-2-12",
    "material": "A182 GRCFBC, TRIM SS347",
    "sourcePage": 152,
    "status": "needs_review"
  },
  {
    "pipeClass": "G5M",
    "id": "valve-globe-bw-y-type-2-12",
    "material": "A182 GRCFBC, TRIM SS347",
    "sourcePage": 152,
    "status": "needs_review"
  },
  {
    "pipeClass": "G5M",
    "id": "valve-check-bw-stopchk-2-12",
    "material": "A182 GRCFBC, TRIM SS347",
    "sourcePage": 152,
    "status": "needs_review"
  },
  {
    "pipeClass": "G5M",
    "id": "valve-check-bw-bs-1868-2-12",
    "material": "A182 GRCFBC, TRIM SS347",
    "sourcePage": 152,
    "status": "needs_review"
  },
  {
    "pipeClass": "B23A",
    "id": "valve-globe-sw-0-5-1-5",
    "material": "A105, TRIM 316 + STEL",
    "sourcePage": 96,
    "status": "source_checked",
    "originalMaterial": "163"
  },
  {
    "pipeClass": "B26A",
    "id": "valve-globe-sw-0-5-1-5",
    "material": "A105,TRIM 316+STEL",
    "sourcePage": 164,
    "status": "source_checked",
    "originalMaterial": "160"
  },
  {
    "pipeClass": "B22A",
    "id": "valve-check-rf-2-24",
    "material": "",
    "sourcePage": 94,
    "status": "needs_review",
    "originalMaterial": "000"
  },
  {
    "pipeClass": "A19A",
    "id": "pipe-seamless-4-8",
    "material": "API 5L GR.B",
    "sourcePage": 190,
    "status": "needs_review"
  },
  {
    "pipeClass": "A19A",
    "id": "pipe-seamless-8-14",
    "material": "API 5L GR.B",
    "sourcePage": 190,
    "status": "needs_review"
  },
  {
    "pipeClass": "A19A",
    "id": "pipe-efsw-16-16",
    "material": "ASTM A672 GR C70 L22",
    "sourcePage": 190,
    "status": "needs_review"
  },
  {
    "pipeClass": "B4D1",
    "id": "pipe-seamless-be-2-6",
    "material": "ASTM A 335 GR.P11",
    "sourcePage": 171,
    "status": "needs_review"
  },
  {
    "pipeClass": "B4D1",
    "id": "pipe-seamless-be-3-10",
    "material": "ASTM A 335 GR.P11",
    "sourcePage": 171,
    "status": "needs_review"
  }
];
const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.json'));
const classes = {};
let rows = 0;
for (const file of files) {
  const spec = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8').replace(/^\uFEFF/, ''));
  check(typeof spec.pipeClass === 'string' && !!spec.pipeClass, file + ': class required');
  check(!classes[spec.pipeClass], file + ': duplicate class');
  check(Array.isArray(spec.items) && spec.items.length > 0, file + ': items required');
  check(spec.source && Array.isArray(spec.source.pages), file + ': source pages required');
  classes[spec.pipeClass] = spec;
  const ids = new Set();
  for (const row of spec.items) {
    rows++;
    const label = spec.pipeClass + '/' + row.id;
    check(typeof row.id === 'string' && !!row.id && !ids.has(row.id), label + ': unique row id');
    ids.add(row.id);
    for (const key of ['group', 'item', 'type', 'endFacing', 'schThkRating', 'faceFinishRadius', 'dimensionStandard', 'material', 'unit']) {
      check(typeof row[key] === 'string', label + ': string ' + key);
    }
    check(Number.isFinite(row.lowSize) && row.lowSize > 0 && Number.isFinite(row.highSize) && row.highSize >= row.lowSize, label + ': positive ordered interval');
    check(Number.isInteger(row.sourcePage) && row.sourcePage >= 1 && row.sourcePage <= 195, label + ': valid PDF page');
    check(!/^\d+$/.test(row.material.trim()), label + ': numeric code must not masquerade as a material');
    if (!row.material.trim()) check(row.verificationStatus === 'needs_review' && !!row.verificationNote, label + ': blank material must be blocked for review');
    if (row.verificationStatus) {
      check(['source_checked', 'needs_review'].includes(row.verificationStatus), label + ': known verification status');
      if (row.verificationStatus === 'needs_review') check(!!row.verificationNote, label + ': review reason required');
    }
    if (row.sourceCorrection) {
      check(row.sourceCorrection.verifiedMaterial === row.material, label + ': corrected material matches evidence');
      check(row.sourceCorrection.sourcePage === row.sourcePage, label + ': correction evidence page');
      check(typeof row.sourceCorrection.originalMaterial === 'string' && !!row.sourceCorrection.reason && row.sourceCorrection.verifiedOn === '2026-10-21', label + ': complete audit trail');
    }
  }
}
check(files.length === 67 && Object.keys(classes).length === 67, '67 source classes retained');
check(rows === 1698, '1698 source rows retained without silently deleting gaps');
for (const expected of expectedReviewedRows) {
  const row = classes[expected.pipeClass].items.find(row => row.id === expected.id);
  check(!!row, expected.pipeClass + '/' + expected.id + ': reviewed row retained');
  for (const key of ['material', 'sourcePage']) check(row[key] === expected[key], expected.pipeClass + '/' + expected.id + ': expected ' + key);
  check(row.verificationStatus === expected.status, expected.pipeClass + '/' + expected.id + ': expected review status');
  if (Object.hasOwn(expected, 'originalMaterial')) check(row.sourceCorrection.originalMaterial === expected.originalMaterial, expected.id + ': original value preserved');
}
const allRows = Object.values(classes).flatMap(spec => spec.items);
check(allRows.filter(row => row.verificationStatus === 'needs_review').length === 59, '59 unresolved review rows');
check(allRows.filter(row => row.verificationStatus === 'source_checked').length === 3, '3 source-checked corrections');
check(allRows.filter(row => row.sourceCorrection).length === 4, '4 corrected values, including blank unsupported material');
check(classes.A4F.items.every(row => row.verificationStatus === 'needs_review'), 'all borrowed A4F rows flagged');
check(classes.B1F.items.filter(row => row.sourcePage === 186).length === 13 && classes.B1F.items.filter(row => row.sourcePage === 186).every(row => row.verificationStatus === 'needs_review'), '13 wrong-source B1F rows flagged');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'Old NRL PMS', 'src', 'pipe-spec-data.js'), 'utf8'), context);
check(Object.keys(context.window.PIPE_SPEC_DATA).length === 67, 'offline backup class coverage');
for (const [pipeClass, spec] of Object.entries(classes)) check(JSON.stringify(context.window.PIPE_SPEC_DATA[pipeClass]) === JSON.stringify(spec), pipeClass + ': JSON/offline backup exact equality');
// Rating variants can intentionally overlap. Only the known pipe schedule ambiguities are review-blocked here.
let overlaps = 0;
for (const spec of Object.values(classes)) for (let i = 0; i < spec.items.length; i++) for (let j = i + 1; j < spec.items.length; j++) {
  const a = spec.items[i], b = spec.items[j];
  if (a.item === b.item && a.type === b.type && a.endFacing === b.endFacing && Math.max(a.lowSize, b.lowSize) <= Math.min(a.highSize, b.highSize) && a.schThkRating !== b.schThkRating) overlaps++;
}
check(overlaps === 9, '9 differing-rating overlap pairs inventoried; not silently merged');
console.log('PASS: ' + checks + ' checks; 67 classes / 1698 rows; 3 source-checked corrections; 59 needs-review rows; exact offline backup parity.');

