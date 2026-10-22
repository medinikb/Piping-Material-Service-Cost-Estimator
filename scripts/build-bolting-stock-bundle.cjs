// Generated browser asset, not a second editable price list. Node built-ins only.
// Run after changing the master JSON: node scripts/build-bolting-stock-bundle.cjs
// CI/read-only verification: node scripts/build-bolting-stock-bundle.cjs --check
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
const sourceFile = "raw_material_price_library.json";
const outputFile = path.join(root, "bolting-stock-prices.bundle.js");
const source = JSON.parse(fs.readFileSync(path.join(root, sourceFile), "utf8"));
const groups = [];
function collect(node, category) {
  const references = (node.component_stock_price_references || []).filter(reference =>
    (reference.reference_role === "candidate_bolt_stock_basis" && reference.budget_pricing_enabled === true)
      || reference.reference_role === "candidate_gasket_constituent_basis");
  if (references.length) {
    let group = groups.find(group => group.basic_mat_of_const === category);
    if (!group) { group = { basic_mat_of_const: category, component_stock_price_references: [] }; groups.push(group); }
    group.component_stock_price_references.push(...references);
  }
  (node.children || []).forEach(child => collect(child, category));
}
source.raw_material_price_library.forEach(group => collect(group, group.basic_mat_of_const));
const references = groups.flatMap(group => group.component_stock_price_references);
if (!references.length || new Set(references.map(reference => reference.id)).size !== references.length) {
  throw new Error("Master JSON must contain unique bolting-stock and gasket reference observations.");
}
const snapshot = {
  schemaVersion: 1,
  sourceFile,
  referenceMetadata: source.component_price_reference_policy.metadata,
  sourceDataSha256: crypto.createHash("sha256").update(JSON.stringify(source)).digest("hex"),
  groups,
};
const output = "// GENERATED from raw_material_price_library.json. Do not edit prices here.\n"
  + "// Regenerate: node scripts/build-bolting-stock-bundle.cjs\n"
  + "// Classic script works when index.html is opened directly without a server.\n"
  + "globalThis.PIPING_BOLTING_STOCK_SNAPSHOT = Object.freeze("
  + JSON.stringify(snapshot, null, 2).replace(/</g, "\\u003c") + ");\n";
if (process.argv.includes("--check")) {
  if (!fs.existsSync(outputFile) || fs.readFileSync(outputFile, "utf8") !== output) {
    throw new Error("Offline bolt-price bundle is missing or out of sync. Run node scripts/build-bolting-stock-bundle.cjs");
  }
  console.log(`Offline bolt-price bundle matches master JSON (${references.length} stock references).`);
} else if (process.argv.includes("--print")) {
  process.stdout.write(output);
} else {
  fs.writeFileSync(outputFile, output, "utf8");
  console.log(`Generated bolting-stock-prices.bundle.js from master JSON (${references.length} stock references).`);
}
