// GENERATED from raw_material_price_library.json. Do not edit prices here.
// Regenerate: node scripts/build-bolting-stock-bundle.cjs
// Classic script works when index.html is opened directly without a server.
globalThis.PIPING_BOLTING_STOCK_SNAPSHOT = Object.freeze({
  "schemaVersion": 1,
  "sourceFile": "raw_material_price_library.json",
  "referenceMetadata": {
    "title": "Bolt and gasket manufacturing input price references",
    "currency": "INR",
    "unit": "kg",
    "source_type": "public_supplier_listing",
    "source_checked_on": "2026-10-21",
    "price_effective_date": null,
    "price_valid_until": null,
    "verification_status": "provisional_internet_reference",
    "approved_for_procurement": false,
    "automatic_budget_pricing_enabled": true,
    "raw_to_finished_conversion_factors": null,
    "tax_basis": "not_confirmed",
    "freight_basis": "not_confirmed",
    "note": "Observed supplier advertisements for manufacturing stock, not confirmed current quotations, certified finished component prices or market averages. The check date does not establish the effective date of a price. Stock form, size, condition, quantity, certification and commercial terms can change the price.",
    "activation_note": "Bolting observations marked budget_pricing_enabled with exact budget_grade_mappings supply default raw-stock defaults for their budget_year only. Gasket observations retain candidate/reference status, not approved stock status. The separately owner-enabled AUTO gasket budget policy may use exact candidates as estimating references with limitations recorded; Manual mode still requires suitability acceptance. Existing pipe recommended/yearly prices are unchanged. No procurement approval, engineering substitution, live-market update or finished-factor calibration is implied. Source-review and unsupported-construction safeguards remain in force.",
    "conversion_basis_note": "A bar, strip, foil or sheet already includes processing from primary feedstock. Future conversion factors must start from the listed stock condition to avoid counting that processing twice. Stud and nut stock costs may differ. Composite gaskets require constituent metal, filler and ring costs rather than one universal steel rate.",
    "history_note": "No historical yearly rates, recommended market rates, low/high ranges or grade-equivalence approvals have been inferred from these single advertised observations.",
    "storage_note": "Each observation is stored exactly once inside raw_material_price_library. Shared provenance, default status, currency, units, commercial unknowns and unset conversion factors apply to every component_stock_price_references record. SS304/304L observations attach to the existing 304/304L family; SS316 and SS316L observations attach to the existing shared 316/316L family while retaining distinct grade and stock details. AISI 4140 is category-level under High Strength Carbon / Low Alloy Steel, not equivalent to any existing pipe grade. Graphite and PTFE are in Non-Metallic Materials, whose empty children list intentionally supplies no active pipe-price mapping."
  },
  "sourceDataSha256": "8b05c9f89f07257451c5190b5a7cf3edcc3e86ea5d0280e66915a4065d8ea88c",
  "groups": [
    {
      "basic_mat_of_const": "Carbon Steel",
      "component_stock_price_references": [
        {
          "id": "sae1020-round-bar-parag",
          "material_family": "Carbon Steel",
          "material_grade": "SAE 1020",
          "stock_form": "Plain round bar",
          "listed_dimensions": "Listed diameter range 10-300 mm; lengths 3 m, 6 m or cut; condition varies",
          "observed_rate_inr_per_kg": 65,
          "minimum_order_kg": 150,
          "source_supplier": "Parag Steel & Alloys Private Limited",
          "source_title": "Carbon Steel Round Bar SAE 1020",
          "source_url": "https://www.paragsteelroundbar.com/carbon-steel-round-bar-sae-1020-7047305.html",
          "reference_role": "candidate_bolt_stock_basis",
          "intended_use": "Default low-carbon round-stock budget allowance for A307 A/B bolt or stud material only.",
          "limitations": "SAE 1020 is a commercial carbon-stock allowance, not certification of ASTM A307 A/B chemistry/mechanical compliance. No nut grade is inferred from an A307 bolt designation. Finished headed bolts, coatings and grade-specific conversion factors remain unsupported.",
          "budget_pricing_enabled": true,
          "budget_year": 2026,
          "source_checked_on": "2026-10-21",
          "budget_part": "bolt",
          "budget_grade_mappings": [
            "A307 A",
            "A307 B"
          ],
          "budget_nut_allowance_grade_mappings": [
            "A307 B"
          ],
          "budget_nut_allowance_note": "Owner-requested budget allowance for the explicit A307 B / A307 B BOM pair only: reuse this carbon-stock rate for the nut constituent, without certifying A307 as a nut standard or replacing it with an inferred nut grade. Confirm actual nut specification, heavy-hex dimensions and testing before procurement. Not a new supplier quotation.",
          "technical_source_urls": [
            "https://www.portlandbolt.com/technical/faqs/grade-8-and-astm-a325-bolts-compared/"
          ],
          "rate_selection_note": "Supplier's advertised INR/kg rate; not a finished fastener price or historical-year rate. Tax and freight not confirmed."
        }
      ]
    },
    {
      "basic_mat_of_const": "High Strength Carbon / Low Alloy Steel",
      "component_stock_price_references": [
        {
          "id": "aisi4140-black-round-bar-bhagwati",
          "material_family": "Alloy Steel",
          "material_grade": "AISI 4140",
          "stock_form": "Black round bar",
          "listed_dimensions": "Listed diameter 120 mm; length 6 m; supplier also advertises a wider size range",
          "observed_rate_inr_per_kg": 90,
          "minimum_order_kg": 100,
          "source_supplier": "Bhagwati Enterprise",
          "source_title": "SAE 4140 Alloy Steel Round Bars",
          "source_url": "https://www.bhagwatienterprise.co.in/alloy-steel-bars.html",
          "reference_role": "candidate_bolt_stock_basis",
          "intended_use": "Automatic default 4140 raw-stock budget basis for A193 B7 and B7M studs, following the manufacturer's base-material table.",
          "limitations": "Not a certified finished B7/B7M price, a nut-stock price or a complete-set price. Sharing raw 4140 stock does not establish the same heat treatment, testing or conversion factor for B7 and B7M. The advertised 120 mm stock price may differ from actual fastener-stock size/condition.",
          "budget_pricing_enabled": true,
          "budget_year": 2026,
          "source_checked_on": "2026-10-21",
          "budget_part": "stud",
          "budget_grade_mappings": [
            "A193 B7",
            "A193 B7M",
            "A320 L7"
          ],
          "a320_l7_budget_note": "Budget raw-stock family allowance only, using the existing advertised 4140 rate; not a finished L7 stud price, low-temperature qualification or grade substitution. Material-family reference: https://www.a320bolts.com/grades/ (reviewed 2026-10-22). Impact testing, heat treatment, certification and generic conversion factor require confirmation for procurement; no new market rate was collected.",
          "technical_source_urls": [
            "https://lsfh.com/materials-and-stock/"
          ],
          "rate_selection_note": "Existing Rs 90/kg observation rechecked; amount unchanged. Advertised input-stock price, not a firm quote."
        },
        {
          "id": "c45-bright-round-bar-kr-steel",
          "material_family": "Carbon Steel",
          "material_grade": "C45",
          "stock_form": "Bright / polished round bar",
          "listed_dimensions": "Listed diameter 12 mm; length 6 m; thickness range 12.7 mm as displayed by supplier",
          "observed_rate_inr_per_kg": 70,
          "minimum_order_kg": 1000,
          "source_supplier": "K.R. Steel Udyog",
          "source_title": "C45 Carbon Steel Bright Bars",
          "source_url": "https://www.krsteeludyog.in/carbon-steel.html",
          "reference_role": "candidate_bolt_stock_basis",
          "intended_use": "Automatic default C45 raw-stock budget basis for A194 2H and 2HM nuts, following the manufacturer's base-material table.",
          "limitations": "Raw bar allowance only. Does not certify a finished 2H/2HM nut, heat treatment, hardness, proof load, sour-service requirements or dimensional suitability. Advertised size/MOQ may differ from the actual order. Do not apply a stud's commercial factor as an approved 2HM factor.",
          "budget_pricing_enabled": true,
          "budget_year": 2026,
          "source_checked_on": "2026-10-21",
          "budget_part": "nut",
          "budget_grade_mappings": [
            "A194 2H",
            "A194 2HM"
          ],
          "technical_source_urls": [
            "https://lsfh.com/materials-and-stock/"
          ],
          "rate_selection_note": "Use the explicitly C45 bright-bar listing at Rs 70/kg, not the page's EN8D/flat-bar prices. Tax/freight not confirmed."
        },
        {
          "id": "a193-b16-black-round-bar-cp-steel",
          "material_family": "Alloy Steel",
          "material_grade": "ASTM A193 B16 stock",
          "stock_form": "Black round bar",
          "listed_dimensions": "Supplier lists Size 16 mm and Dia 120 mm; confirm required bar size before procurement",
          "observed_rate_inr_per_kg": 80,
          "observed_low_inr_per_kg": 75,
          "observed_high_inr_per_kg": 80,
          "minimum_order_kg": 50,
          "source_supplier": "C P Steel Suppliers",
          "source_title": "ASTM A193 GR B16 Black Steel Round Bar",
          "source_url": "https://www.cpsteelsuppliers.in/astm-a193-gr-b16-black-steel-round-bar.htm",
          "reference_role": "candidate_bolt_stock_basis",
          "intended_use": "Automatic default raw-bar budget reference for A193 B16; not a finished B16 stud rate.",
          "limitations": "Single advertised supplier range, not a market range. Size fields are inconsistent and must be confirmed. Material certification, final heat treatment/testing and finished B16 conversion factor are not established by this listing.",
          "budget_pricing_enabled": true,
          "budget_year": 2026,
          "source_checked_on": "2026-10-21",
          "budget_part": "stud",
          "budget_grade_mappings": [
            "A193 B16"
          ],
          "technical_source_urls": [
            "https://lsfh.com/materials-and-stock/"
          ],
          "rate_selection_note": "Select the displayed upper endpoint Rs 80/kg from the supplier's Rs 75-80/kg range; no invented midpoint, escalation or finish allowance. Other B16 listings with conflicting D3/EN8D/stainless/nickel-alloy fields were rejected."
        },
        {
          "id": "sae4042-black-round-bar-tk-steel",
          "material_family": "Carbon Molybdenum Steel",
          "material_grade": "SAE 4042",
          "stock_form": "Black round bar",
          "listed_dimensions": "Diameter and length not stated in the selected SAE4042 listing; confirm actual requirements",
          "observed_rate_inr_per_kg": 65,
          "minimum_order_kg": 2000,
          "source_supplier": "TK Steel Rolling Mills Private Limited",
          "source_title": "SAE4042 Round Bar",
          "source_url": "https://www.tksteels.in/round-steel-bar.html",
          "reference_role": "candidate_bolt_stock_basis",
          "intended_use": "Automatic default SAE 4042 raw-stock budget basis for A194 Grade 4 nuts; Delta Fastener identifies 4042 for Grade 4.",
          "limitations": "Raw stock only; does not certify finished A194 Grade 4 nuts or suitability for a project specification. MOQ 2000 kg is not a retail small-order quote. Do not substitute 4140 Grade 7 nut stock or a B16 finished-factor rule.",
          "budget_pricing_enabled": true,
          "budget_year": 2026,
          "source_checked_on": "2026-10-21",
          "budget_part": "nut",
          "budget_grade_mappings": [
            "A194 4"
          ],
          "technical_source_urls": [
            "https://www.deltafastener.com/nuts-heavy-hex.php"
          ],
          "rate_selection_note": "Supplier's explicit SAE4042 listing at Rs 65/kg; tax/freight not confirmed."
        }
      ]
    },
    {
      "basic_mat_of_const": "Austenitic Stainless Steel",
      "component_stock_price_references": [
        {
          "id": "ss304-304l-strip-0p25mm-nevio",
          "reference_material_keys": [
            "SS304",
            "SS304L"
          ],
          "material_family": "Stainless Steel",
          "material_grade": "SS304/304L as jointly described in supplier listing",
          "stock_form": "Slit strip, coil cut",
          "listed_dimensions": "Thickness 0.25 mm; width 3.2 mm",
          "observed_rate_inr_per_kg": 210,
          "minimum_order_kg": 100,
          "source_supplier": "Nevio Steelage Private Limited",
          "source_title": "Stainless Steel 304l Strip",
          "source_url": "https://www.neviosteelage.in/stainless-steel-strip.html",
          "reference_role": "candidate_gasket_constituent_basis",
          "intended_use": "Candidate thin stainless-strip price input for a future gasket constituent model.",
          "limitations": "The listing combines SS304 and SS304L wording; this observation does not approve substitution between grades. Confirm the required grade, strip dimensions, temper and gasket-manufacturing suitability. Excludes filler, rings and finished gasket manufacture."
        },
        {
          "id": "ss316-strip-1p5mm-nevio",
          "reference_material_keys": [
            "SS316"
          ],
          "material_family": "Stainless Steel",
          "material_grade": "SS316",
          "stock_form": "Flat strip, cut length, 2B finish",
          "listed_dimensions": "Thickness 1.50 mm; width 25 mm",
          "observed_rate_inr_per_kg": 320,
          "minimum_order_kg": 100,
          "source_supplier": "Nevio Steelage Private Limited",
          "source_title": "316 Stainless Steel Strip",
          "source_url": "https://www.neviosteelage.in/stainless-steel-strip.html",
          "reference_role": "candidate_gasket_constituent_basis",
          "intended_use": "Stainless stock reference for a future gasket constituent model where the required stock form is compatible.",
          "limitations": "This 1.50 mm strip is not a verified spiral-winding strip input. Thinner winding strip, ring or jacket stock may require different dimensions, condition, processing and price. Excludes filler, other rings and finished gasket manufacture."
        },
        {
          "id": "ss316l-strip-1mm-nevio",
          "reference_material_keys": [
            "SS316L"
          ],
          "material_family": "Stainless Steel",
          "material_grade": "SS316L",
          "stock_form": "Strip",
          "listed_dimensions": "Thickness 1 mm; listed width range 4.5-1500 mm",
          "observed_rate_inr_per_kg": 370,
          "minimum_order_kg": 100,
          "source_supplier": "Nevio Steelage Private Limited",
          "source_title": "Stainless Steel 316l Strips",
          "source_url": "https://www.neviosteelage.in/stainless-steel-strip.html",
          "reference_role": "candidate_gasket_constituent_basis",
          "intended_use": "Separate SS316L stock reference for a future gasket constituent model.",
          "limitations": "This 1 mm stock is not a verified thin spiral-winding strip price. Confirm required dimensions, condition and grade certification. Do not merge SS316L with SS316 automatically. Excludes filler, other rings and finished gasket manufacture."
        }
      ]
    },
    {
      "basic_mat_of_const": "Non-Metallic Materials",
      "component_stock_price_references": [
        {
          "id": "flexible-graphite-foil-wingraph",
          "reference_material_keys": [
            "GRAPHITE"
          ],
          "material_family": "Graphite",
          "material_grade": "Flexible graphite; purity and gasket-specific grade not confirmed",
          "stock_form": "Foil",
          "listed_dimensions": "Supplier lists thickness up to 5 mm; required filler thickness not established",
          "observed_rate_inr_per_kg": 350,
          "minimum_order_kg": 50,
          "source_supplier": "Win Graph Seals",
          "source_title": "Flexible Graphite Foil",
          "source_url": "https://www.wingraphseals.net/graphite-foil.html",
          "reference_role": "candidate_gasket_constituent_basis",
          "intended_use": "Candidate graphite constituent price reference for a future gasket raw-material model.",
          "limitations": "Graphite is not steel. Purity, oxidation resistance, additives, density and required filler-tape dimensions are not confirmed. This is not approval for a particular gasket service and is not the price of a complete graphite or spiral-wound gasket."
        },
        {
          "id": "ptfe-sheet-1mm-wingraph",
          "reference_material_keys": [
            "PTFE"
          ],
          "material_family": "PTFE",
          "material_grade": "PTFE; supplier describes virgin PTFE products",
          "stock_form": "Sheet, roll packaging",
          "listed_dimensions": "Thickness 1 mm; sheet area not confirmed",
          "observed_rate_inr_per_kg": 1250,
          "minimum_order_kg": null,
          "source_supplier": "Win Graph Seals",
          "source_title": "PTFE Sheet",
          "source_url": "https://www.wingraphseals.net/ceramic-fabric.html",
          "reference_role": "candidate_gasket_constituent_basis",
          "intended_use": "Candidate sheet-stock input for a future cut-sheet PTFE gasket estimate.",
          "limitations": "PTFE is not steel. Confirm grade, density, dimensions and certification. Do not use this sheet price automatically for spiral-wound filler tape, expanded PTFE or a finished gasket. Cutting yield and conversion factor remain undefined."
        }
      ]
    }
  ]
});
