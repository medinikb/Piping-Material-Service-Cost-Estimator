// Full workflow regression audit. No source data, rates or workbooks are written.
// Run: node tests/full-workflow-verification.cjs [--excel]
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
const readJson = name => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const controls = new Map();
function control(id) {
  if (!controls.has(id)) controls.set(id, {value: "", dataset: {}, textContent: "", innerHTML: "", hidden: false,
    classList: {add() {}, remove() {}, toggle() {}, contains() {return false;}},
    append() {}, querySelectorAll() {return [];}, setAttribute() {}, removeAttribute() {}, addEventListener() {}});
  return controls.get(id);
}
const context = vm.createContext({console, setTimeout, clearTimeout, ArrayBuffer, Uint8Array,
  document: {querySelector: control, querySelectorAll: () => [], body: control("body")},
  fetch: async name => {
    const file = path.join(root, decodeURIComponent(name));
    return {ok: fs.existsSync(file), status: fs.existsSync(file) ? 200 : 404, json: async () => readJson(decodeURIComponent(name))};
  }});
context.window = context;
const run = source => vm.runInContext(source, context);
run(fs.readFileSync(path.join(root, "special-component-pricing.js"), "utf8"));
for (const name of ["service_cost_rates_CS.js", "service_cost_rates_SS.js", "service_cost_rates_AS.js", "service_cost_engine.js", "pipe_support_calculator_MT.js", "nrl_pwht_rules.js", "unequal_tee_dimensions_C_M.js"]) {
  run(fs.readFileSync(path.join(root, "Piping Service Cost for Web App", name), "utf8"));
}
run(fs.readFileSync(path.join(root, "app.js"), "utf8").split("\npopulateSizeOptions();")[0]);
context.prices = readJson("raw_material_price_library.json");
context.materials = readJson("astm_piping_material_specification_webapp.json");
context.flange = readJson("flange-weight-3-input-model-v2.json");
context.tees = readJson("Piping Service Cost for Web App/unequal_tee_dimensions_C_M.json");
run(`rawMaterialPriceLibrary = prices.raw_material_price_library;
  materialSpecificationRows = prepareMaterialSpecificationRows(materials.material_specification_rows);
  flangeWeightModel = flange; flangeWeightModelStatus = 'loaded';
  unequalTeeDimensions = tees.records; unequalTeeDimensionsStatus = 'loaded';
  elements.year.value = '2026'; elements.rawOverride.value = '999'; elements.coating.value = 'No';
  elements.factorOverride.value = ''; elements.spec.value = 'A106 Gr.B';
  elements.materialBasis.value = ''; elements.materialGradeFamily.value = '';
  elements.serviceLocation.value = 'Assam'; elements.serviceRegulatoryClass.value = 'Non IBR';
  elements.servicePaintingScope.value = 'none'; elements.serviceReworkRate.value = '15';
  elements.serviceCivilSupportScope.value = 'none'; elements.designTemperature.value = '100';
  elements.projectDescription.value = 'Regression verification'; elements.projectNumber.value = 'TEST-20261021';
  renderLineItems = () => {}; renderBomGroupReview = () => {}; renderWhatIfAnalysis = () => {};
  renderPipingServiceCost = () => {}; updateReportGenerated = () => {}; showSuccessMessage = () => {};
  refreshRawMaterialLibrarySelection = () => {};
  var componentRefreshes = 0; renderComponentQuickEstimate = () => {componentRefreshes++;};`);

const failures = [];
let checks = 0;
function check(label, fn) {
  try {fn(); checks++;} catch (error) {failures.push({label, error: error.message});}
}
const records = fs.readdirSync(path.join(root, "Old NRL PMS/data")).filter(name => name.endsWith(".json")).flatMap(name => {
  const data = readJson(path.join("Old NRL PMS/data", name));
  return data.items.map(item => ({...item, pipeClass: data.pipeClass}));
});
// Use the actual builder's export-audit helper, rather than reconstructing its
// source-review convention independently in this test.
const oldSource = fs.readFileSync(path.join(root, "Old NRL PMS/src/app.js"), "utf8");
const auditStart = oldSource.indexOf("function getSourceVerificationAudit(spec)");
const auditEnd = oldSource.indexOf("function renderPreview(", auditStart);
assert.ok(auditStart >= 0 && auditEnd > auditStart, "Old PMS builder must export source audit fields");
run(oldSource.slice(auditStart, auditEnd));
const stdSizes = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8, 10, 12, 16, 24, 36, 48];
let scenarios = 0, priced = 0, review = 0;
const priceGroups = new Map();
for (const row of records) {
  context.sourceRow = row;
  const sourceAudit = run("getSourceVerificationAudit(sourceRow)");
  const names = row.item === "Pipe" ? [row.type || "Pipe"] : [...new Set([row.item, ...(row.aliases || [])])];
  const sizes = [...new Set([row.lowSize, row.highSize, ...stdSizes.filter(size => size >= row.lowSize && size <= row.highSize && [0.5, 4, 12, 24, 48].includes(size))])];
  for (const item of names) for (const size of sizes) {
    context.fixture = {item, sizeText: String(size), thicknessText: row.schThkRating, materialText: row.material, quantityText: "2", uomText: row.unit, thicknessIsSchedule: true, ...sourceAudit};
    const label = `${row.pipeClass}/${item}/${size}/${row.material}`;
    check(label, () => {
      const cost = run(`(() => {const match = classifyBomGroup(fixture.item); return buildComponentCostEstimate({...fixture, group: match.group, standardName: match.standardName});})()`);
      const unit = Boolean(cost.unitCostAllowed ?? cost.autoCostAllowed) && Number.isFinite(cost.medianUnitRate);
      if (sourceAudit.sourceVerificationStatus === "Review required") assert.equal(unit, false, "A source flag must survive PMS export to estimator pricing");
      if (unit) {
        assert.ok(cost.medianUnitRate > 0);
        assert.ok(Number.isFinite(cost.medianTotal));
        assert.ok(Math.abs(cost.medianTotal - 2 * cost.medianUnitRate) < 0.000001);
        assert.ok(cost.p90Total >= cost.medianTotal);
        priced++;
      } else {assert.ok(cost.note || cost.reviewMessage); review++;}
      priceGroups.set(row.group, (priceGroups.get(row.group) || 0) + 1);
      scenarios++;
    });
  }
}
for (const material of ["190", "000", "163", "160"]) {
  context.material = material;
  check(`Numeric material ${material} cannot auto-price`, () => assert.equal(run(`buildComponentCostEstimate({group:'Valves Group', item:'Gate Valve', sizeText:'4 IN', thicknessText:'150#', materialText:material, quantityText:'1', uomText:'Nos'}).unitCostAllowed`), false));
}
for (const quantity of ["", "0", "-1", "Infinity", "not numeric"]) {
  context.quantity = quantity;
  for (const quoted of [false, true]) {
    context.quoted = quoted;
    check(`invalid quantity ${JSON.stringify(quantity)}, quoted=${quoted}`, () => {
      const cost = run(`buildComponentCostEstimate({group:'Valves Group', item:'Gate Valve', sizeText:'4 IN', thicknessText:'150#', materialText:'A216 WCB', quantityText:quantity, uomText:'Nos', unitRateOverrideText:quoted?'500':''})`);
      assert.equal(cost.totalCostAllowed, false);
      assert.equal(Number.isFinite(cost.medianTotal), false);
      assert.equal(cost.unitCostAllowed, true);
    });
  }
}
for (const status of ["needs_review", "Review required", "Needs Review", "NEEDS_REVIEW"]) {
  context.sourceStatus = status;
  check(`source review flag ${status} blocks raw and finished-price overrides`, () => {
    const cost = run(`buildComponentCostEstimate({group:'Valves Group', item:'Gate Valve', sizeText:'4 IN', thicknessText:'150#', materialText:'A216 WCB', quantityText:'1', uomText:'Nos', rawOverrideText:'500', factorOverrideText:'3', unitRateOverrideText:'900', sourceVerificationStatus:sourceStatus, sourceVerificationNote:'Verify against controlled PMS page 130'})`);
    assert.equal(cost.sourceReviewRequired, true);
    assert.equal(cost.unitCostAllowed, false);
    assert.equal(cost.totalCostAllowed, false);
    assert.match(cost.note, /controlled PMS page 130/);
  });
}
for (const status of ["Source checked", "Not checked", ""]) {
  context.sourceStatus = status;
  check(`source status ${JSON.stringify(status)} does not invent a review block`, () => {
    const cost = run(`buildComponentCostEstimate({group:'Valves Group', item:'Gate Valve', sizeText:'4 IN', thicknessText:'150#', materialText:'A216 WCB', quantityText:'1', uomText:'Nos', sourceVerificationStatus:sourceStatus})`);
    assert.ok(Number.isFinite(cost.medianUnitRate));
    assert.equal(cost.sourceReviewRequired, undefined);
  });
}

context.fixtureRows = [
  {Item: "PIPE SEAMLESS", Size: "6 IN", "Sch/Thck/Rating": "SCH 40", Material: "A106 Gr.B", Quantity: "10", UOM: "M", "Raw Steel Rs/kg Override": "100", "Estimate Factor Override": "2", "Confirmed Unit Rate Rs": "", "Quotation Reference": ""},
  {Item: "W.N. Flange", Size: "4 IN", "Sch/Thck/Rating": "150#", Material: "A105", Quantity: "2", UOM: "Nos", "Raw Steel Rs/kg Override": "500", "Estimate Factor Override": "3", "Confirmed Unit Rate Rs": "", "Quotation Reference": ""},
  {Item: "Reducing Tee", Size: "6 IN x 4 IN", "Sch/Thck/Rating": "STD", Material: "A234 WPB", Quantity: "2", UOM: "Nos", "Raw Steel Rs/kg Override": "200", "Estimate Factor Override": "4", "Confirmed Unit Rate Rs": "", "Quotation Reference": ""},
  {Item: "Gasket", Size: "4 IN", "Sch/Thck/Rating": "150#", Material: "SS304 + CAF", Quantity: "3", UOM: "Nos", "Raw Steel Rs/kg Override": "999", "Estimate Factor Override": "9", "Confirmed Unit Rate Rs": "750", "Quotation Reference": "SUPPLIER-Q77"},
  {Item: "Needle Valve", Size: "4 IN", "Sch/Thck/Rating": "150#", Material: "A216 WCB", Quantity: "1", UOM: "Nos", "Raw Steel Rs/kg Override": "", "Estimate Factor Override": "", "Confirmed Unit Rate Rs": "", "Quotation Reference": ""},
  {Item: "Gate Valve", Size: "4 IN", "Sch/Thck/Rating": "150#", Material: "A216 WCB", Quantity: "1", UOM: "Nos", "Raw Steel Rs/kg Override": "", "Estimate Factor Override": "", "Confirmed Unit Rate Rs": "", "Quotation Reference": ""},
];
check("mixed BOM upload and replace-batch repeat", () => {
  run("importBomRows(fixtureRows, 'Regression BOM', {replaceBatchKey:'regression'});");
  assert.equal(run("bomGroupItems.length"), 6);
  assert.equal(run("lineItems.length"), 1);
  run("importBomRows(fixtureRows, 'Regression BOM', {replaceBatchKey:'regression'});");
  assert.equal(run("bomGroupItems.length"), 6);
  assert.equal(run("lineItems.length"), 1);
  assert.equal(run("getComponentCostSummary(bomGroupItems).review"), 2);
});
check("BOM raw/factor priority and retired finished-price inputs ignored", () => {
  assert.equal(run("bomGroupItems[0].componentCost.rawSteel"), 100);
  assert.equal(run("bomGroupItems[0].componentCost.factor"), 2);
  assert.equal(run("bomGroupItems[3].componentCost.unitCostAllowed"), false);
  // A gasket's raw input is now retained for audit, never a finished price.
  assert.equal(run("bomGroupItems[3].componentCost.rawSteel"), 999);
  assert.equal(run("bomGroupItems[3].componentCost.gasketRawReferenceOnly"), true);
  assert.equal(run("hasComponentTotals(bomGroupItems[3].componentCost)"), false);
  assert.equal(run("bomGroupItems[3].componentCost.quotationReference"), undefined);
  assert.match(run("bomGroupItems[3].inputAuditNote"), /ignored/);
  assert.equal(run("lineItems[0].medianTotal"), run("bomGroupItems[0].componentCost.medianTotal"));
});
context.saved = run("bomGroupItems.map(item => ({unit: item.componentCost.medianUnitRate, raw:item.componentCost.rawSteel, factor:item.componentCost.factor, quote:item.componentCost.quotedUnitRateApplied}))");
function retained(index) {
  context.i = index;
  const cost = run("bomGroupItems[i].componentCost");
  assert.equal(cost.rawSteel, context.saved[index].raw);
  assert.equal(cost.factor, context.saved[index].factor);
  assert.equal(cost.quotedUnitRateApplied, context.saved[index].quote);
  assert.equal(cost.medianUnitRate, context.saved[index].unit);
}

async function main() {
  run("flangeWeightModelStatus = 'not-loaded'; flangeWeightModelPromise = null;");
  await run("loadFlangeWeightModel()");
  check("background flange model load retains raw/factor overrides", () => retained(1));
  run("repriceUnequalTeeBomItems()");
  check("background reducing tee load retains raw/factor overrides", () => retained(2));
  // Old templates may still carry finished prices; they must not enable the retired route.
  run("fixtureRows[1]['Confirmed Unit Rate Rs']='900'; fixtureRows[1]['Quotation Reference']='FLANGE-Q'; importBomRows(fixtureRows, 'Regression BOM', {replaceBatchKey:'regression'});");
  run("flangeWeightModelStatus = 'not-loaded'; flangeWeightModelPromise = null;");
  await run("loadFlangeWeightModel()");
  check("background flange load retains calculation, not legacy finished price", () => {
    retained(1);
    assert.equal(run("bomGroupItems[1].componentCost.quotationReference"), undefined);
    assert.match(run("bomGroupItems[1].inputAuditNote"), /ignored/);
  });
  check("pipe year refresh preserves BOM overrides", () => {
    run("elements.year.value='2025'; refreshLineItemYearPrices();");
    assert.equal(run("lineItems[0].rawSteel"), 100);
    assert.equal(run("lineItems[0].factors.median"), 2);
  });
  const before = run("componentRefreshes");
  await run("loadMaterialSpecificationData()");
  await run("loadRawMaterialPriceLibrary()");
  check("asynchronous library loading refreshes the component preview", () => assert.ok(run("componentRefreshes") > before));
  if (run("typeof refreshBomComponentPrices") === "function") {
    run("refreshBomComponentPrices()");
    check("year repricing retains raw/factor overrides and legacy input warning", () => {
      retained(1);
      assert.equal(run("bomGroupItems[1].componentCost.quotationReference"), undefined);
      assert.match(run("bomGroupItems[1].inputAuditNote"), /ignored/);
    });
    check("year repricing updates unoverridden material-library component rate", () => {
      assert.equal(run("bomGroupItems[5].componentCost.rawSteel"), run("getRawMaterialPriceMapping('A216 WCB','2025').recommended"));
      assert.equal(run("lineItems[0].medianTotal"), run("bomGroupItems[0].componentCost.medianTotal"));
    });
  }
  context.sourceFlaggedRows = [
    {...context.fixtureRows[0], 'Source Verification Status':'Review required', 'Source Verification Note':'Verify against controlled PMS page 130', 'Confirmed Unit Rate Rs':'900', 'Quotation Reference':'NOT-APPROVAL'},
    {...context.fixtureRows[5], 'Source Verification Status':'needs_review', 'Source Verification Note':'Unresolved material identity', 'Raw Steel Rs/kg Override':'500', 'Confirmed Unit Rate Rs':'900'},
  ];
  check("source flag columns persist through BOM import and repricing", () => {
    run("importBomRows(sourceFlaggedRows, 'Flagged BOM', {replaceBatchKey:'flagged'});");
    assert.equal(run("lineItems.length"), 1);
    assert.equal(run("bomGroupItems.length"), 8);
    assert.equal(run("bomGroupItems[6].componentCost.sourceReviewRequired"), true);
    assert.equal(run("bomGroupItems[7].componentCost.sourceReviewRequired"), true);
    assert.equal(run("getComponentCostSummary(bomGroupItems).review"), 4);
    run("refreshBomComponentPrices()");
    assert.equal(run("bomGroupItems[6].componentCost.sourceReviewRequired"), true);
    assert.equal(run("bomGroupItems[7].componentCost.sourceReviewRequired"), true);
  });
  check("source-review pipe and valve rows are excluded from priced service costs", () => {
    const flagged = run("getPipingServiceEstimate().rows.filter(row => row.item.sourceKey === 'flagged')");
    assert.equal(flagged.length, 2);
    assert.ok(flagged.every(row => row.status === "REVIEW_REQUIRED"));
    assert.ok(flagged.every(row => !row.costs || !row.costs.directServiceCost));
  });
  check("full print report retains price basis, legacy warning and Review notes", () => {
    const html = run("buildBomCostReportHtml()");
    assert.ok(!html.includes("SUPPLIER-Q77"));
    assert.ok(!html.includes("FLANGE-Q"));
    assert.ok(html.includes("Legacy finished-unit pricing inputs were ignored"));
    assert.ok(!html.includes("Quotation Reference"));
    assert.ok(!html.includes("Confirmed Unit Rate"));
    assert.ok(html.includes("Rate sources and review notes"));
    assert.ok(html.includes("Needle Valve"));
    assert.ok(html.includes("Review"));
    assert.ok(html.includes("controlled PMS page 130"));
  });
  if (process.argv.includes("--excel")) {
    const response = await fetch("https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js");
    if (!response.ok) throw new Error(`Excel library HTTP ${response.status}`);
    run(await response.text());
    check("actual Old PMS preview/export preserves half-inch size and source audit", () => {
      // Run the real preview and export producers; the tiny DOM adapter only
      // captures the HTML download in memory instead of saving a workbook.
      const preview = {innerHTML: ""};
      let exportedHtml = "";
      function tableClone() {
        const original = preview.innerHTML;
        const cells = [...original.matchAll(/<(td|th)(\s[^>]*)?>([\s\S]*?)<\/\1>/g)].map(match => ({tag: match[1], attrs: {}, style: {setProperty(key, value) {this[key] = value;}}, setAttribute(key, value) {this.attrs[key] = value;}}));
        return {querySelectorAll: tag => cells.filter(cell => cell.tag === tag), get outerHTML() {
          let index = 0;
          return original.replace(/<(td|th)(\s[^>]*)?>([\s\S]*?)<\/\1>/g, (whole, tag, attrs = "", body) => {
            const cell = cells[index++];
            const extra = Object.entries(cell.attrs).map(([key,value]) => ` ${key}="${value}"`).join("");
            const style = Object.entries(cell.style).filter(([,value]) => typeof value !== "function").map(([key,value]) => `${key}:${value}`).join(";");
            return `<${tag}${attrs}${extra} style="${style}">${body}</${tag}>`;
          });
        }};
      }
      const oldVm = vm.createContext({previewArea: preview, pipeClassSelect: {value: "Regression"}, specLoadFailed: false, lastPreviewRowKeys: new Set(),
        document: {getElementById: id => id === "exportTable" ? {cloneNode: tableClone} : {value: "Regression"}, createElement: () => ({click() {}, remove() {}}), body: {appendChild() {}}},
        Blob: class {constructor(parts) {exportedHtml = parts.join("");}}, URL: {createObjectURL: () => "memory:regression", revokeObjectURL() {}},
        confirm: () => true, alert: message => {throw new Error(message);},
        getA4FSourceNoticeText: () => "", showPreviewConfirmation() {}, renderAll() {},
        getAutoStudRowForFlange: () => null, previewRowKey: row => row.item + row.sizeText,
        getDisplayRating: spec => spec.schThkRating, hasExportableQuantity: row => Number(row.quantity) > 0,
        getProjectPreviewRows: rows => rows,
        escapeHtml: value => String(value ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")});
      const oldRun = source => vm.runInContext(source, oldVm);
      for (const name of ["getSourceVerificationAudit", "renderPreview", "getRowsNeedingSpecReview", "renderSpecReviewWarning", "getPreviewItemName", "formatSize", "formatSizeOption", "exportExcel", "sanitizeFileName"]) {
        const start = oldSource.indexOf(`function ${name}(`);
        const end = oldSource.indexOf("\n    function ", start + 1);
        assert.ok(start >= 0 && end > start, `Missing Old PMS function ${name}`);
        oldRun(oldSource.slice(start, end));
      }
      oldVm.testRows = [{item: "Pipe", sizeText: "0.5", quantity: "2", lookup: {size: 0.5, matches: [{type: "Pipe (Seamless)", material: "A106 Gr.B", schThkRating: "XS", unit: "M", verificationStatus: "needs_review", verificationNote: "Verify half-inch row against controlled PMS"}]}}];
      oldRun("readRows = () => testRows; renderPreview(testRows, true); exportExcel();");
      assert.match(preview.innerHTML, /Source Verification Status/);
      assert.match(exportedHtml, /data-t="s"/);
      assert.match(exportedHtml, /mso-number-format:\\@/);
      context.oldPmsExportHtml = exportedHtml;
      const rows = run("(() => {const bytes=Uint8Array.from(oldPmsExportHtml, c=>c.charCodeAt(0)); const wb=XLSX.read(bytes,{type:'array',raw:true}); return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,defval:''});})()");
      const data = rows.find(row => row[1] === "Pipe (Seamless)");
      assert.ok(data, "Actual exported pipe row was not parsed");
      assert.equal(data[2], '0.5"', "Inch text must not become an Excel date serial");
      assert.equal(data[9], "Review required");
      assert.match(data[10], /controlled PMS/);
      context.oldPmsRows = run("(() => {const bytes=Uint8Array.from(oldPmsExportHtml, c=>c.charCodeAt(0)); const wb=XLSX.read(bytes,{type:'array',raw:true}); return worksheetToBomRows(wb.Sheets[wb.SheetNames[0]]);})()");
      run("importBomRows(oldPmsRows, 'Actual Old PMS export', {replaceBatchKey:'actual-old-export'});");
      assert.equal(run("bomGroupItems[bomGroupItems.length-1].size"), '0.5"');
      assert.equal(run("bomGroupItems[bomGroupItems.length-1].componentCost.sourceReviewRequired"), true);
      run("for(let index=bomGroupItems.length-1;index>=0;index--){if(bomGroupItems[index].sourceKey==='actual-old-export')bomGroupItems.splice(index,1);}");
    });
    context.expectedFlangeUnit = context.saved[1].unit;
    check("Excel calculated/review values reconcile without retired pricing fields", () => {
      run(`(() => {const built=buildEditableComponentSheet('Regression', bomGroupItems); const wb=XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb,built.sheet,'Regression');
        const bytes=XLSX.write(wb,{type:'array',bookType:'xlsx'}); const back=XLSX.read(bytes,{type:'array',cellFormula:true});
        if(back.Sheets.Regression.O7.v!=='Priced' || back.Sheets.Regression.K7.v!==expectedFlangeUnit || back.Sheets.Regression.O9.v!=='Review required' || back.Sheets.Regression.O10.v!=='Review required') throw new Error('Calculated/review status or value changed');
        const total=getComponentCostSummary(bomGroupItems).normal;
        if(back.Sheets.Regression['M'+built.totalRow].v!==total) throw new Error('Group total did not reconcile');
        if(!back.Sheets.Regression.P9.v.includes('ignored')) throw new Error('Legacy input warning missing');
        const text=XLSX.utils.sheet_to_csv(back.Sheets.Regression);
        if(/SUPPLIER-Q77|FLANGE-Q|Confirmed Unit Rate|Quotation Reference/.test(text)) throw new Error('Removed price inputs leaked into Excel');
        if(back.Sheets.Regression.O12.v!=='Review required' || !back.Sheets.Regression.P12.v.includes('controlled PMS page 130')) throw new Error('Source review flag or reason missing');
      })()`);
    });
  }
  const result = {classes: new Set(records.map(row=>row.pipeClass)).size, sourceRows: records.length, expandedScenarios: scenarios, automaticallyPriced: priced, reviewRequired: review, checksPassed: checks, failures, note: "Expanded scenarios test software routes/consistency, not source-PDF engineering approval of every row."};
  console.log(JSON.stringify(result, null, 2));
  if (failures.length) process.exitCode = 1;
}
main().catch(error => {console.error(error);process.exitCode=1;});
