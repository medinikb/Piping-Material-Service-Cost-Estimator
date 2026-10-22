    const dataStatus = document.getElementById('dataStatus');
    const inputBody = document.getElementById('inputBody');
    const previewArea = document.getElementById('previewArea');
    const sourceText = document.getElementById('sourceText');
    const specNotice = document.getElementById('specNotice');
    const previewConfirmation = document.getElementById('previewConfirmation');
    const groupSelect = document.getElementById('groupSelect');
    const pipeClassSelect = document.getElementById('pipeClass');
    const themeToggle = document.getElementById('theme-toggle');
    const themeToggleLabel = document.getElementById('theme-toggle-label');

    let specData = null;
    let wnFlangeRecords = [];
    let slipOnBlindFlangeRecords = [];
    let projectRows = [];
    let specLoadFailed = false;
    let previewConfirmationTimer = null;
    let lastPreviewRowKeys = new Set();

    function applyTheme(theme) {
      const selectedTheme = theme === 'dark' ? 'dark' : 'light';
      document.documentElement.dataset.theme = selectedTheme;
      const label = selectedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
      themeToggle.setAttribute('aria-label', label);
      themeToggleLabel.textContent = label;
    }

    function toggleTheme() {
      const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('pmsBomTheme', nextTheme);
      applyTheme(nextTheme);
    }

    function previewRowKey(rowData) {
      return [
        rowData.tr?.dataset.group || rowData.group || '',
        rowData.index || '',
        rowData.item || '',
        rowData.sizeText || '',
        rowData.storedUnit || rowData.tr?.querySelector?.('.js-unit')?.value || ''
      ].join('|');
    }

    function showPreviewConfirmation(message = 'Item added to BOM Preview') {
      previewConfirmation.textContent = message;
      previewConfirmation.classList.add('show');
      window.clearTimeout(previewConfirmationTimer);
      previewConfirmationTimer = window.setTimeout(() => {
        previewConfirmation.classList.remove('show');
        previewConfirmation.textContent = '';
      }, 2000);
    }

    const pipeClassFiles = {
      A1A: 'data/A1A.json',
      A1F: 'data/A1F.json',
      A1K: 'data/A1K.json',
      A1N: 'data/A1N.json',
      A1Z: 'data/A1Z.json',
      A2A: 'data/A2A.json',
      A3A: 'data/A3A.json',
      A3Y: 'data/A3Y.json',
      A4F: 'data/A4F.json',
      A5A: 'data/A5A.json',
      A6N: 'data/A6N.json',
      A9A: 'data/A9A.json',
      A10A: 'data/A10A.json',
      A15A: 'data/A15A.json',
      A16A: 'data/A16A.json',
      A19A: 'data/A19A.json',
      A20A: 'data/A20A.json',
      A21A: 'data/A21A.json',
      A22A: 'data/A22A.json',
      A23A: 'data/A23A.json',
      B1A: 'data/B1A.json',
      B1F: 'data/B1F.json',
      B1K: 'data/B1K.json',
      B1N: 'data/B1N.json',
      B2A: 'data/B2A.json',
      B3A: 'data/B3A.json',
      B4D: 'data/B4D.json',
      B4D1: 'data/B4D1.json',
      B4F: 'data/B4F.json',
      B4F1: 'data/B4F1.json',
      B5A: 'data/B5A.json',
      B5D: 'data/B5D.json',
      B6N: 'data/B6N.json',
      B9A: 'data/B9A.json',
      B19A: 'data/B19A.json',
      B21N: 'data/B21N.json',
      B22A: 'data/B22A.json',
      B22M: 'data/B22M.json',
      B23A: 'data/B23A.json',
      B25A: 'data/B25A.json',
      B25K: 'data/B25K.json',
      B26A: 'data/B26A.json',
      D1A: 'data/D1A.json',
      D1K: 'data/D1K.json',
      D2A: 'data/D2A.json',
      D2D: 'data/D2D.json',
      D4F: 'data/D4F.json',
      D5A: 'data/D5A.json',
      D5D: 'data/D5D.json',
      D5E: 'data/D5E.json',
      D15K: 'data/D15K.json',
      D21A: 'data/D21A.json',
      D25A: 'data/D25A.json',
      D26A: 'data/D26A.json',
      E5E: 'data/E5E.json',
      E25A: 'data/E25A.json',
      E26A: 'data/E26A.json',
      F5A: 'data/F5A.json',
      F15M: 'data/F15M.json',
      F25A: 'data/F25A.json',
      F25D: 'data/F25D.json',
      F26D: 'data/F26D.json',
      F27A: 'data/F27A.json',
      G5M: 'data/G5M.json',
      G21A: 'data/G21A.json',
      G22A: 'data/G22A.json',
      G25N: 'data/G25N.json'
    };

    const baseInputCatalog = [
      { group: 'Pipe Group', item: 'Pipe', minSize: 0.5, maxSize: 48, unit: 'M' },
      { group: 'Pipe Group', item: 'Nipple', minSize: 0.5, maxSize: 1.5, unit: 'Nos' },
      { group: 'Fitting Group', item: 'Elbow 90 deg.', minSize: 0.5, maxSize: 48, unit: 'Nos' },
      { group: 'Fitting Group', item: 'Elbow 45 deg.', minSize: 0.5, maxSize: 48, unit: 'Nos' },
      { group: 'Fitting Group', item: 'Red. Tee', minSize: 0.5, maxSize: 48, unit: 'Nos' },
      { group: 'Fitting Group', item: 'Equal Tee', minSize: 0.5, maxSize: 48, unit: 'Nos' },
      { group: 'Fitting Group', item: 'Con. Reducer', minSize: 0.75, maxSize: 48, unit: 'Nos' },
      { group: 'Fitting Group', item: 'Ecc. Reducer', minSize: 0.75, maxSize: 48, unit: 'Nos' },
      { group: 'Fitting Group', item: 'SWAGE.CONC', minSize: 0.5, maxSize: 3, unit: 'Nos' },
      { group: 'Fitting Group', item: 'SWAGE.ECC', minSize: 0.5, maxSize: 3, unit: 'Nos' },
      { group: 'Fitting Group', item: 'CAP', minSize: 0.5, maxSize: 48, unit: 'Nos' },
      { group: 'Fitting Group', item: 'CPLNG.FULL', minSize: 0.5, maxSize: 1.5, unit: 'Nos' },
      { group: 'Fitting Group', item: 'CPLNG.HALF', minSize: 0.5, maxSize: 1.5, unit: 'Nos' },
      { group: 'Fitting Group', item: 'CPLNG.LH', minSize: 0.5, maxSize: 1.5, unit: 'Nos' },
      { group: 'Fitting Group', item: 'CPLNG.RED', minSize: 0.5, maxSize: 1.5, unit: 'Nos' },
      { group: 'Fitting Group', item: 'Mitre', minSize: 8, maxSize: 48, unit: 'Nos', classes: ['A10A', 'A1A', 'A2A', 'A3A'] },
      { group: 'Flange Group', item: 'Flange', minSize: 0.5, maxSize: 48, unit: 'Nos' },
      { group: 'Flange Group', item: 'Blind Flange', minSize: 0.5, maxSize: 48, unit: 'Nos' },
      { group: 'Flange Group', item: 'FLNG.FIG.8', minSize: 0.5, maxSize: 16, unit: 'Nos' },
      { group: 'Flange Group', item: 'SPCR & BLN', minSize: 3, maxSize: 48, unit: 'Nos' },
      { group: 'Valves Group', item: 'Gate Valve', minSize: 0.25, maxSize: 42, unit: 'Nos' },
      { group: 'Valves Group', item: 'Globe Valve', minSize: 0.25, maxSize: 16, unit: 'Nos' },
      { group: 'Valves Group', item: 'Check Valve', minSize: 0.25, maxSize: 24, unit: 'Nos' },
      { group: 'Valves Group', item: 'Needle Valve', minSize: 0.25, maxSize: 1.5, unit: 'Nos', classes: ['A1A', 'A21A'] },
      { group: 'Valves Group', item: 'Angle Valve', minSize: 0.5, maxSize: 1.5, unit: 'Nos', classes: ['A2A', 'A3A'] },
      { group: 'Valves Group', item: 'Ball Valve', minSize: 0.5, maxSize: 16, unit: 'Nos' },
      { group: 'Valves Group', item: 'Plug Valve', minSize: 0.5, maxSize: 36, unit: 'Nos' },
      { group: 'Valves Group', item: 'Butterfly Valve', minSize: 3, maxSize: 48, unit: 'Nos' },
      { group: 'Bolt Group', item: 'Stud with Nuts', minSize: 0.5, maxSize: 48, unit: 'Nos' },
      { group: 'Bolt Group', item: 'Machine Bolt', minSize: 0.5, maxSize: 48, unit: 'Nos', classes: ['A1Z', 'A3A', 'A3Y'] },
      { group: 'Bolt Group', item: 'Nut', minSize: 0.5, maxSize: 48, unit: 'Nos', classes: ['A3A'] },
      { group: 'Gasket Group', item: 'Gasket', minSize: 0.5, maxSize: 48, unit: 'Nos' },
      { group: 'Trap/Strainer Group', item: 'Trap Steam', minSize: 0.5, maxSize: 1.5, unit: 'Nos' },
      { group: 'Trap/Strainer Group', item: 'Strainer Temp', minSize: 1.5, maxSize: 24, unit: 'Nos' },
      { group: 'Trap/Strainer Group', item: 'Strainer Perm', minSize: 0.5, maxSize: 24, unit: 'Nos' },
      { group: 'Other Group', item: '', minSize: 0.25, maxSize: 48, unit: '' }
    ];

    const standardSizes = [
      0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8,
      10, 12, 14, 16, 18, 20, 22, 24, 26, 28,
      30, 32, 34, 36, 38, 40, 42, 44, 46, 48
    ];
    const pipeClassSizeLimits = {
      A23A: 32
    };
    const reducingTeeBranchSizes = {
      0.75: [0.5],
      1: [0.5, 0.75],
      1.5: [0.5, 0.75, 1],
      2: [0.75, 1, 1.5],
      3: [1, 1.5, 2],
      4: [1.5, 2, 3],
      6: [3, 4],
      8: [3, 4, 6],
      10: [4, 6, 8],
      12: [6, 8, 10],
      14: [6, 8, 10, 12],
      16: [6, 8, 10, 12, 14],
      18: [8, 10, 12, 14, 16],
      20: [8, 10, 12, 16, 18],
      22: [14, 16, 18, 20],
      24: [10, 16, 18, 20],
      26: [10, 14, 16, 20, 22, 24],
      28: [10, 14, 16, 18, 20, 26],
      30: [14, 16, 18, 20, 24, 28],
      32: [16, 18, 20, 24, 28, 30],
      34: [16, 18, 20, 24, 28, 30, 32],
      36: [16, 18, 20, 24, 28, 30, 32],
      38: [18, 20, 24, 28, 30, 34, 36],
      40: [20, 22, 24, 26, 28, 30, 32, 34, 36, 38],
      42: [16, 18, 20, 22, 24, 28, 30, 32, 34, 36],
      44: [24, 26, 28, 30, 36, 38, 42],
      46: [24, 26, 30, 32, 36, 40, 44],
      48: [24, 26, 28, 30, 34, 36, 38, 40, 44, 46]
    };
    const reducerSmallEndSizes = {
      0.75: [0.5],
      1: [0.5, 0.75],
      1.5: [0.5, 0.75, 1],
      2: [0.75, 1, 1.5],
      3: [1.5, 2],
      4: [1.5, 2, 3],
      6: [3, 4],
      8: [4, 6],
      10: [4, 6, 8],
      12: [6, 8, 10],
      14: [6, 8, 10, 12],
      16: [8, 10, 12, 14],
      18: [10, 12, 14, 16],
      20: [12, 14, 16, 18],
      22: [14, 16, 18, 20],
      24: [16, 18, 20],
      26: [18, 20, 22, 24],
      28: [18, 20, 24, 26],
      30: [20, 24, 26, 28],
      32: [24, 26, 28, 30],
      34: [24, 26, 28, 30, 32],
      36: [24, 26, 30, 32, 34],
      38: [26, 28, 30, 32, 34, 36],
      40: [30, 32, 34, 36, 38],
      42: [30, 32, 34, 36, 38, 40],
      44: [36, 38, 40, 42],
      46: [38, 40, 42, 44],
      48: [40, 42, 44, 46]
    };
    const swageSmallEndSizes = {
      0.75: [0.5],
      1: [0.25, 0.5, 0.75],
      1.5: [0.5, 0.75, 1],
      2: [0.5, 0.75, 1, 1.5],
      3: [1, 1.5, 2],
      4: [1, 1.5, 2, 3]
    };

    // Static fallback keeps the MVP usable when someone opens index.html directly
    // from a folder and the browser blocks reading the separate JSON file.
    const fallbackSpecData = {
      pipeClass: 'A10A',
      source: {
        document: 'Piping Mat. Specification#NRL.pdf',
        sheets: ['A10A sheet 2 of 3', 'A10A sheet 3 of 3'],
        pages: [75, 76],
        note: 'Fallback copy for offline file opening. Main source is data/A10A.json.'
      },
      items: []
    };

    const embeddedFallbackSpecData = {
      "A23A": {
            "pipeClass": "A23A",
            "source": {
                  "document": "Piping Mat. Specification#NRL.pdf",
                  "sheets": [
                        "A23A sheet 2 of 3",
                        "A23A sheet 3 of 3"
                  ],
                  "pages": [
                        79,
                        80
                  ],
                  "note": "MVP data manually structured from A23A material specification rows. Verify against source PDF before procurement issue."
            },
            "items": [
                  {
                        "id": "pipe-seamless-0-5-1-5",
                        "group": "Pipes",
                        "item": "Pipe",
                        "type": "Pipe (Seamless)",
                        "endFacing": "PE",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "S160",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 36.10",
                        "material": "API 5L GR.B",
                        "unit": "M",
                        "sourcePage": 79
                  },
                  {
                        "id": "pipe-seamless-2",
                        "group": "Pipes",
                        "item": "Pipe",
                        "type": "Pipe (Seamless)",
                        "endFacing": "BE",
                        "lowSize": 2,
                        "highSize": 2,
                        "schThkRating": "XS",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 36.10",
                        "material": "API 5L GR.B",
                        "unit": "M",
                        "sourcePage": 79
                  },
                  {
                        "id": "pipe-seamless-3-6",
                        "group": "Pipes",
                        "item": "Pipe",
                        "type": "Pipe (Seamless)",
                        "endFacing": "BE",
                        "lowSize": 3,
                        "highSize": 6,
                        "schThkRating": "STD",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 36.10",
                        "material": "API 5L GR.B",
                        "unit": "M",
                        "sourcePage": 79
                  },
                  {
                        "id": "pipe-seamless-8-14",
                        "group": "Pipes",
                        "item": "Pipe",
                        "type": "Pipe (Seamless)",
                        "endFacing": "BE",
                        "lowSize": 8,
                        "highSize": 14,
                        "schThkRating": "STD",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 36.10",
                        "material": "API 5L GR.B",
                        "unit": "M",
                        "sourcePage": 79
                  },
                  {
                        "id": "pipe-seamless-16-26",
                        "group": "Pipes",
                        "item": "Pipe",
                        "type": "Pipe (Seamless)",
                        "endFacing": "BE",
                        "lowSize": 16,
                        "highSize": 26,
                        "schThkRating": "STD",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 36.10",
                        "material": "API 5L GR.B",
                        "unit": "M",
                        "sourcePage": 79
                  },
                  {
                        "id": "pipe-seamless-28-32",
                        "group": "Pipes",
                        "item": "Pipe",
                        "type": "Pipe (Seamless)",
                        "endFacing": "BE",
                        "lowSize": 28,
                        "highSize": 32,
                        "schThkRating": "XS",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 36.10",
                        "material": "API 5L GR.B",
                        "unit": "M",
                        "sourcePage": 79
                  },
                  {
                        "id": "flange-sw",
                        "group": "Flanges",
                        "item": "S.W. Flange",
                        "type": "SW",
                        "endFacing": "RF",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "125 AARH",
                        "dimensionStandard": "B - 16.5",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 79,
                        "aliases": [
                              "Flange"
                        ]
                  },
                  {
                        "id": "flange-wn-2-24",
                        "group": "Flanges",
                        "item": "W.N. Flange",
                        "type": "WN",
                        "endFacing": "RF",
                        "lowSize": 2,
                        "highSize": 24,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "125 AARH",
                        "dimensionStandard": "B - 16.5",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 79,
                        "aliases": [
                              "Flange"
                        ]
                  },
                  {
                        "id": "flange-wn-26-32",
                        "group": "Flanges",
                        "item": "W.N. Flange",
                        "type": "WN",
                        "endFacing": "RF",
                        "lowSize": 26,
                        "highSize": 32,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "125 AARH",
                        "dimensionStandard": "API - 605",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 79,
                        "aliases": [
                              "Flange"
                        ]
                  },
                  {
                        "id": "flange-blind-0-24",
                        "group": "Flanges",
                        "item": "Blind Flange",
                        "type": "BLIND",
                        "endFacing": "RF",
                        "lowSize": 0.5,
                        "highSize": 24,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "125 AARH",
                        "dimensionStandard": "B - 16.5",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 79
                  },
                  {
                        "id": "flange-blind-26-32",
                        "group": "Flanges",
                        "item": "Blind Flange",
                        "type": "BLIND",
                        "endFacing": "RF",
                        "lowSize": 26,
                        "highSize": 32,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "125 AARH",
                        "dimensionStandard": "API - 605",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 79
                  },
                  {
                        "id": "fig8-flange",
                        "group": "Flanges",
                        "item": "Figure 8 Flange",
                        "type": "FIG.8.FL",
                        "endFacing": "FF",
                        "lowSize": 0.5,
                        "highSize": 8,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "125 AARH",
                        "dimensionStandard": "API - 590",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 79,
                        "aliases": [
                              "FLNG.FIG.8"
                        ]
                  },
                  {
                        "id": "spacer-blind-10-24",
                        "group": "Flanges",
                        "item": "SPCR & BLN",
                        "type": "SPCR & BLN",
                        "endFacing": "FF",
                        "lowSize": 10,
                        "highSize": 24,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "125 AARH",
                        "dimensionStandard": "API - 590",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 79
                  },
                  {
                        "id": "spacer-blind-26-32",
                        "group": "Flanges",
                        "item": "SPCR & BLN",
                        "type": "SPCR & BLN",
                        "endFacing": "FF",
                        "lowSize": 26,
                        "highSize": 32,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "125 AARH",
                        "dimensionStandard": "EIL'STD",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 79
                  },
                  {
                        "id": "fitting-sw-0-1-5",
                        "group": "Fittings",
                        "item": "Fitting",
                        "type": "SW",
                        "endFacing": "SW",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "6000 #",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 16.11",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 79,
                        "aliases": [
                              "Elbow 90 deg.",
                              "Elbow 45 deg.",
                              "Equal Tee",
                              "Red. Tee",
                              "Reducing Tee",
                              "Coupling",
                              "CPLNG.FULL",
                              "CPLNG.HALF",
                              "CPLNG.LH",
                              "CPLNG.RED",
                              "SWAGE.CONC",
                              "SWAGE.ECC"
                        ]
                  },
                  {
                        "id": "fitting-bw-2-14",
                        "group": "Fittings",
                        "item": "Fitting",
                        "type": "BW",
                        "endFacing": "BW",
                        "lowSize": 2,
                        "highSize": 14,
                        "schThkRating": "As per matching pipe",
                        "faceFinishRadius": "R = 1.50",
                        "dimensionStandard": "B - 16.9",
                        "material": "ASTM A234 GR.WPB",
                        "unit": "Nos",
                        "sourcePage": 79,
                        "aliases": [
                              "Elbow 90 deg.",
                              "Elbow 45 deg.",
                              "Equal Tee",
                              "Red. Tee",
                              "Reducing Tee",
                              "Con. Reducer",
                              "Ecc. Reducer"
                        ]
                  },
                  {
                        "id": "fitting-bw-16-32",
                        "group": "Fittings",
                        "item": "Fitting",
                        "type": "BW",
                        "endFacing": "BW",
                        "lowSize": 16,
                        "highSize": 32,
                        "schThkRating": "As per matching pipe",
                        "faceFinishRadius": "R = 1.51",
                        "dimensionStandard": "B - 16.9",
                        "material": "ASTM A234 GR.WPB",
                        "unit": "Nos",
                        "sourcePage": 79,
                        "aliases": [
                              "Elbow 90 deg.",
                              "Elbow 45 deg.",
                              "Equal Tee",
                              "Red. Tee",
                              "Reducing Tee",
                              "Con. Reducer",
                              "Ecc. Reducer"
                        ]
                  },
                  {
                        "id": "caps-scrf",
                        "group": "Fittings",
                        "item": "Cap",
                        "type": "SCRF",
                        "endFacing": "SCRF",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "6000 #",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 16.11",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 79,
                        "aliases": [
                              "CAP"
                        ]
                  },
                  {
                        "id": "valve-gate-sw",
                        "group": "Valves",
                        "item": "Gate Valve",
                        "type": "GATE",
                        "endFacing": "SW",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "800 #",
                        "faceFinishRadius": "",
                        "dimensionStandard": "API - 602",
                        "material": "A105, TRIM 18/8 SS",
                        "unit": "Nos",
                        "sourcePage": 80
                  },
                  {
                        "id": "valve-globe-sw",
                        "group": "Valves",
                        "item": "Globe Valve",
                        "type": "GLOBE",
                        "endFacing": "SW",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "800 #",
                        "faceFinishRadius": "",
                        "dimensionStandard": "BS - 5352",
                        "material": "A105, TRIM 316+STEL",
                        "unit": "Nos",
                        "sourcePage": 80
                  },
                  {
                        "id": "valve-globe-sw-ytype",
                        "group": "Valves",
                        "item": "Globe Valve",
                        "type": "GLOBE",
                        "endFacing": "SW",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "1500 #",
                        "faceFinishRadius": "Y - TYPE",
                        "dimensionStandard": "BS - 5352",
                        "material": "A105, TRIM 316+STEL",
                        "unit": "Nos",
                        "sourcePage": 80
                  },
                  {
                        "id": "valve-check-sw",
                        "group": "Valves",
                        "item": "Check Valve",
                        "type": "CHECK",
                        "endFacing": "SW",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "800 #",
                        "faceFinishRadius": "",
                        "dimensionStandard": "BS - 5352",
                        "material": "A105, TRIM 18/8 SS",
                        "unit": "Nos",
                        "sourcePage": 80
                  },
                  {
                        "id": "valve-gate-rf",
                        "group": "Valves",
                        "item": "Gate Valve",
                        "type": "GATE",
                        "endFacing": "RF",
                        "lowSize": 2,
                        "highSize": 24,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "125 AARH",
                        "dimensionStandard": "API - 600",
                        "material": "A216 GRWCB, TRIM 18/8SS",
                        "unit": "Nos",
                        "sourcePage": 80
                  },
                  {
                        "id": "valve-globe-rf",
                        "group": "Valves",
                        "item": "Globe Valve",
                        "type": "GLOBE",
                        "endFacing": "RF",
                        "lowSize": 2,
                        "highSize": 12,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "125 AARH",
                        "dimensionStandard": "BS - 1873",
                        "material": "A216 GRWCB, TRIM 18/8SS",
                        "unit": "Nos",
                        "sourcePage": 80
                  },
                  {
                        "id": "valve-check-rf",
                        "group": "Valves",
                        "item": "Check Valve",
                        "type": "CHECK",
                        "endFacing": "RF",
                        "lowSize": 2,
                        "highSize": 24,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "125 AARH",
                        "dimensionStandard": "BS - 1868",
                        "material": "A216 GRWCB, TRIM 18/8SS",
                        "unit": "Nos",
                        "sourcePage": 80
                  },
                  {
                        "id": "valve-ball-sw",
                        "group": "Valves",
                        "item": "Ball Valve",
                        "type": "BALL",
                        "endFacing": "SW",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "600 #",
                        "faceFinishRadius": "",
                        "dimensionStandard": "ORBIT",
                        "material": "A216 GRWCB, TRIM T - 7",
                        "unit": "Nos",
                        "sourcePage": 80
                  },
                  {
                        "id": "valve-ball-rf",
                        "group": "Valves",
                        "item": "Ball Valve",
                        "type": "BALL",
                        "endFacing": "RF",
                        "lowSize": 2,
                        "highSize": 14,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "125 AARH",
                        "dimensionStandard": "ORBIT",
                        "material": "A216 GRWCB, TRIM T - 7",
                        "unit": "Nos",
                        "sourcePage": 80
                  },
                  {
                        "id": "stud-bolts",
                        "group": "Bolting",
                        "item": "Stud with Nuts",
                        "type": "STUD + NUTS",
                        "endFacing": "-",
                        "lowSize": 0.5,
                        "highSize": 32,
                        "schThkRating": "-",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 18.2",
                        "material": "A193 GR.B7 / A194 GR.2H",
                        "unit": "Nos",
                        "sourcePage": 80
                  },
                  {
                        "id": "gasket-spiral-0-24",
                        "group": "Gasket",
                        "item": "Gasket",
                        "type": "SPIRAL",
                        "endFacing": "-",
                        "lowSize": 0.5,
                        "highSize": 24,
                        "schThkRating": "5MM",
                        "faceFinishRadius": "",
                        "dimensionStandard": "API - 601",
                        "material": "SPIRAL, WND SS304 + CAF",
                        "unit": "Nos",
                        "sourcePage": 80
                  },
                  {
                        "id": "gasket-spiral-26-32",
                        "group": "Gasket",
                        "item": "Gasket",
                        "type": "SPIRAL",
                        "endFacing": "-",
                        "lowSize": 26,
                        "highSize": 32,
                        "schThkRating": "5MM",
                        "faceFinishRadius": "",
                        "dimensionStandard": "API - 605",
                        "material": "SPIRAL, WND SS304 + CAF",
                        "unit": "Nos",
                        "sourcePage": 80
                  },
                  {
                        "id": "perm-strainer-sw",
                        "group": "Trap/Strainer",
                        "item": "Permanent Strainer",
                        "type": "PERM STR",
                        "endFacing": "SW",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "800 #",
                        "faceFinishRadius": "Y TYPE",
                        "dimensionStandard": "MNF'STD",
                        "material": "B: A105; INT RNLS: SS304",
                        "unit": "Nos",
                        "sourcePage": 80,
                        "aliases": [
                              "Strainer Perm",
                              "Strainer Temp"
                        ]
                  },
                  {
                        "id": "perm-strainer-bw-2-14",
                        "group": "Trap/Strainer",
                        "item": "Permanent Strainer",
                        "type": "PERM STR",
                        "endFacing": "BW",
                        "lowSize": 2,
                        "highSize": 14,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "Y TYPE",
                        "dimensionStandard": "EIL'STD",
                        "material": "B: A234 GPB; INTS: SS304",
                        "unit": "Nos",
                        "sourcePage": 80,
                        "aliases": [
                              "Strainer Perm",
                              "Strainer Temp"
                        ],
                        "note": "Material text kept as printed in the source table: 'A234 GPB'. Verify whether this is intended as A234 Gr.WPB before procurement issue."
                  },
                  {
                        "id": "perm-strainer-bw-16-24",
                        "group": "Trap/Strainer",
                        "item": "Permanent Strainer",
                        "type": "PERM STR",
                        "endFacing": "BW",
                        "lowSize": 16,
                        "highSize": 24,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "Y TYPE",
                        "dimensionStandard": "EIL'STD",
                        "material": "B: A234 GPB; INTS: SS304",
                        "unit": "Nos",
                        "sourcePage": 80,
                        "aliases": [
                              "Strainer Perm",
                              "Strainer Temp"
                        ],
                        "note": "Material text kept as printed in the source table: 'A234 GPB'. Verify whether this is intended as A234 Gr.WPB before procurement issue."
                  }
            ]
      }
      ,
      "A2A": {
            "pipeClass": "A2A",
            "source": {
                  "document": "Piping Mat. Specification#NRL.pdf",
                  "sheets": [
                        "A2A sheet 2 of 3",
                        "A2A sheet 3 of 3"
                  ],
                  "pages": [
                        71,
                        72
                  ],
                  "note": "MVP data manually structured from A2A material specification rows. Verify against source PDF before procurement issue."
            },
            "items": [
                  {
                        "id": "pipe-seamless-small",
                        "group": "Pipes",
                        "item": "Pipe",
                        "type": "Pipe (Seamless) (IBR)",
                        "endFacing": "PE",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "XS",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 36.10",
                        "material": "ASTM A 106 GR.B",
                        "unit": "M",
                        "sourcePage": 71
                  },
                  {
                        "id": "pipe-seamless-medium",
                        "group": "Pipes",
                        "item": "Pipe",
                        "type": "Pipe (Seamless) (IBR)",
                        "endFacing": "BE",
                        "lowSize": 2,
                        "highSize": 6,
                        "schThkRating": "STD",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 36.10",
                        "material": "ASTM A 106 GR.B",
                        "unit": "M",
                        "sourcePage": 71
                  },
                  {
                        "id": "pipe-seamless-8-12",
                        "group": "Pipes",
                        "item": "Pipe",
                        "type": "Pipe (Seamless) (IBR)",
                        "endFacing": "BE",
                        "lowSize": 8,
                        "highSize": 12,
                        "schThkRating": "S20",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 36.10",
                        "material": "ASTM A 106 GR.B",
                        "unit": "M",
                        "sourcePage": 71
                  },
                  {
                        "id": "pipe-seamless-14",
                        "group": "Pipes",
                        "item": "Pipe",
                        "type": "Pipe (Seamless) (IBR)",
                        "endFacing": "BE",
                        "lowSize": 14,
                        "highSize": 14,
                        "schThkRating": "S10",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 36.10",
                        "material": "ASTM A 106 GR.B",
                        "unit": "M",
                        "sourcePage": 71
                  },
                  {
                        "id": "pipe-efsw-16-24",
                        "group": "Pipes",
                        "item": "Pipe",
                        "type": "Pipe (E.F.S.W.) (IBR)",
                        "endFacing": "BE",
                        "lowSize": 16,
                        "highSize": 24,
                        "schThkRating": "6.00 mm",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 36.10",
                        "material": "ASTM A672 GRC70 CL 12",
                        "unit": "M",
                        "sourcePage": 71
                  },
                  {
                        "id": "pipe-efsw-26-28",
                        "group": "Pipes",
                        "item": "Pipe",
                        "type": "Pipe (E.F.S.W.) (IBR)",
                        "endFacing": "BE",
                        "lowSize": 26,
                        "highSize": 28,
                        "schThkRating": "8.00 mm",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 36.10",
                        "material": "ASTM A672 GRC70 CL 12",
                        "unit": "M",
                        "sourcePage": 71
                  },
                  {
                        "id": "flange-sw",
                        "group": "Flanges",
                        "item": "S.W. Flange",
                        "aliases": [
                              "Flange"
                        ],
                        "type": "SW (IBR)",
                        "endFacing": "RF",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR. FIN",
                        "dimensionStandard": "B - 16.5",
                        "material": "ASTM A 105",
                        "unit": "Nos",
                        "sourcePage": 71
                  },
                  {
                        "id": "flange-wn-2-24",
                        "group": "Flanges",
                        "item": "W.N. Flange",
                        "aliases": [
                              "Flange"
                        ],
                        "type": "WN (IBR)",
                        "endFacing": "RF",
                        "lowSize": 2,
                        "highSize": 24,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR. FIN",
                        "dimensionStandard": "B - 16.5",
                        "material": "ASTM A 105",
                        "unit": "Nos",
                        "sourcePage": 71
                  },
                  {
                        "id": "flange-wn-26-28",
                        "group": "Flanges",
                        "item": "W.N. Flange",
                        "aliases": [
                              "Flange"
                        ],
                        "type": "WN (IBR)",
                        "endFacing": "RF",
                        "lowSize": 26,
                        "highSize": 28,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR. FIN",
                        "dimensionStandard": "API - 605",
                        "material": "ASTM A 105",
                        "unit": "Nos",
                        "sourcePage": 71
                  },
                  {
                        "id": "flange-blind-0-24",
                        "group": "Flanges",
                        "item": "Blind Flange",
                        "type": "BLIND (IBR)",
                        "endFacing": "RF",
                        "lowSize": 0.5,
                        "highSize": 24,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR. FIN",
                        "dimensionStandard": "B - 16.5",
                        "material": "ASTM A 105",
                        "unit": "Nos",
                        "sourcePage": 71
                  },
                  {
                        "id": "flange-blind-26-28",
                        "group": "Flanges",
                        "item": "Blind Flange",
                        "type": "BLIND (IBR)",
                        "endFacing": "RF",
                        "lowSize": 26,
                        "highSize": 28,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR. FIN",
                        "dimensionStandard": "API - 605",
                        "material": "ASTM A 105",
                        "unit": "Nos",
                        "sourcePage": 71
                  },
                  {
                        "id": "fig8-flange",
                        "group": "Flanges",
                        "item": "Figure 8 Flange",
                        "aliases": [
                              "FLNG.FIG.8"
                        ],
                        "type": "FIG.8 FL (IBR)",
                        "endFacing": "FF",
                        "lowSize": 0.5,
                        "highSize": 8,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR. FIN",
                        "dimensionStandard": "API - 590",
                        "material": "ASTM A 105",
                        "unit": "Nos",
                        "sourcePage": 71
                  },
                  {
                        "id": "spacer-blind-10-24",
                        "group": "Flanges",
                        "item": "SPCR & BLN",
                        "type": "SPCR & BLN (IBR)",
                        "endFacing": "FF",
                        "lowSize": 10,
                        "highSize": 24,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR. FIN",
                        "dimensionStandard": "API - 590",
                        "material": "ASTM A 105",
                        "unit": "Nos",
                        "sourcePage": 71
                  },
                  {
                        "id": "spacer-blind-26-28",
                        "group": "Flanges",
                        "item": "SPCR & BLN",
                        "type": "SPCR & BLN (IBR)",
                        "endFacing": "FF",
                        "lowSize": 26,
                        "highSize": 28,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR. FIN",
                        "dimensionStandard": "EIL'STD",
                        "material": "ASTM A 105",
                        "unit": "Nos",
                        "sourcePage": 71
                  },
                  {
                        "id": "fitting-sw-0-1-5",
                        "group": "Fittings",
                        "item": "Fitting",
                        "aliases": [
                              "Elbow 90 deg.",
                              "Elbow 45 deg.",
                              "Red. Tee",
                              "Equal Tee",
                              "Con. Reducer",
                              "Ecc. Reducer",
                              "SWAGE.CONC",
                              "SWAGE.ECC",
                              "CPLNG.FULL",
                              "CPLNG.HALF",
                              "CPLNG.LH",
                              "CPLNG.RED"
                        ],
                        "type": "SW (IBR)",
                        "endFacing": "SW",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "3000 #",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 16.11",
                        "material": "ASTM A 105",
                        "unit": "Nos",
                        "sourcePage": 71
                  },
                  {
                        "id": "fitting-bw-2-14",
                        "group": "Fittings",
                        "item": "Fitting",
                        "aliases": [
                              "Elbow 90 deg.",
                              "Elbow 45 deg.",
                              "Red. Tee",
                              "Equal Tee",
                              "Con. Reducer",
                              "Ecc. Reducer"
                        ],
                        "type": "BW (IBR)",
                        "endFacing": "BW",
                        "lowSize": 2,
                        "highSize": 14,
                        "schThkRating": "As per matching pipe",
                        "faceFinishRadius": "R = 1.50",
                        "dimensionStandard": "B - 16.9",
                        "material": "ASTM A234 GR.WPB",
                        "unit": "Nos",
                        "sourcePage": 71
                  },
                  {
                        "id": "fitting-bw-16-24",
                        "group": "Fittings",
                        "item": "Fitting",
                        "aliases": [
                              "Elbow 90 deg.",
                              "Elbow 45 deg.",
                              "Red. Tee",
                              "Equal Tee",
                              "Con. Reducer",
                              "Ecc. Reducer"
                        ],
                        "type": "BW (IBR)",
                        "endFacing": "BW",
                        "lowSize": 16,
                        "highSize": 24,
                        "schThkRating": "As per matching pipe",
                        "faceFinishRadius": "R = 1.50",
                        "dimensionStandard": "B - 16.9",
                        "material": "ASTM A234 GR.WPCW",
                        "unit": "Nos",
                        "sourcePage": 71
                  },
                  {
                        "id": "fitting-bw-26-28",
                        "group": "Fittings",
                        "item": "Fitting",
                        "aliases": [
                              "Elbow 90 deg.",
                              "Elbow 45 deg.",
                              "Red. Tee",
                              "Equal Tee",
                              "Con. Reducer",
                              "Ecc. Reducer"
                        ],
                        "type": "BW (IBR)",
                        "endFacing": "BW",
                        "lowSize": 26,
                        "highSize": 28,
                        "schThkRating": "As per matching pipe",
                        "faceFinishRadius": "R = 1.50",
                        "dimensionStandard": "B - 16.9",
                        "material": "ASTM A234 GR.WPCW",
                        "unit": "Nos",
                        "sourcePage": 71
                  },
                  {
                        "id": "mitres-26-28",
                        "group": "Fittings",
                        "item": "Mitre",
                        "type": "BW (IBR)",
                        "endFacing": "BW",
                        "lowSize": 26,
                        "highSize": 28,
                        "schThkRating": "As per matching pipe",
                        "faceFinishRadius": "R = 1.50 CALC",
                        "dimensionStandard": "EIL'STD",
                        "material": "ASTM A 672 GRC70 CL12",
                        "unit": "Nos",
                        "sourcePage": 71
                  },
                  {
                        "id": "caps-scrf",
                        "group": "Fittings",
                        "item": "Cap",
                        "aliases": [
                              "CAP"
                        ],
                        "type": "SCRF (IBR)",
                        "endFacing": "SCRF",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "3000 #",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 16.11",
                        "material": "ASTM A 105",
                        "unit": "Nos",
                        "sourcePage": 71
                  },
                  {
                        "id": "valve-gate-sw",
                        "group": "Valves",
                        "item": "Gate Valve",
                        "type": "GATE (IBR)",
                        "endFacing": "SW",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "800 #",
                        "faceFinishRadius": "",
                        "dimensionStandard": "API - 602",
                        "material": "A105, 13% CR. TRIM",
                        "unit": "Nos",
                        "sourcePage": 72
                  },
                  {
                        "id": "valve-globe-sw",
                        "group": "Valves",
                        "item": "Globe Valve",
                        "type": "GLOBE (IBR)",
                        "endFacing": "SW",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "800 #",
                        "faceFinishRadius": "",
                        "dimensionStandard": "BS - 5352",
                        "material": "A105, 13% CR. TRIM",
                        "unit": "Nos",
                        "sourcePage": 72
                  },
                  {
                        "id": "valve-check-sw",
                        "group": "Valves",
                        "item": "Check Valve",
                        "type": "CHECK (IBR)",
                        "endFacing": "SW",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "800 #",
                        "faceFinishRadius": "",
                        "dimensionStandard": "BS - 5352",
                        "material": "A105, 13% CR. TRIM",
                        "unit": "Nos",
                        "sourcePage": 72
                  },
                  {
                        "id": "valve-angle-sw",
                        "group": "Valves",
                        "item": "Angle Valve",
                        "type": "ANGLE (IBR)",
                        "endFacing": "SW",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "800 #",
                        "faceFinishRadius": "",
                        "dimensionStandard": "BS - 5352",
                        "material": "A105, 13% CR. TRIM",
                        "unit": "Nos",
                        "sourcePage": 72
                  },
                  {
                        "id": "valve-gate-rf",
                        "group": "Valves",
                        "item": "Gate Valve",
                        "type": "GATE (IBR)",
                        "endFacing": "RF",
                        "lowSize": 2,
                        "highSize": 24,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR. FIN",
                        "dimensionStandard": "API - 600",
                        "material": "A216GRWCB, 13% CR. TRIM",
                        "unit": "Nos",
                        "sourcePage": 72
                  },
                  {
                        "id": "valve-globe-rf",
                        "group": "Valves",
                        "item": "Globe Valve",
                        "type": "GLOBE (IBR)",
                        "endFacing": "RF",
                        "lowSize": 2,
                        "highSize": 12,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR. FIN",
                        "dimensionStandard": "BS - 1873",
                        "material": "A216GRWCB, 13% CR. TRIM",
                        "unit": "Nos",
                        "sourcePage": 72
                  },
                  {
                        "id": "valve-check-rf",
                        "group": "Valves",
                        "item": "Check Valve",
                        "type": "CHECK (IBR)",
                        "endFacing": "RF",
                        "lowSize": 2,
                        "highSize": 24,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR. FIN",
                        "dimensionStandard": "BS - 1868",
                        "material": "A216GRWCB, 13% CR. TRIM",
                        "unit": "Nos",
                        "sourcePage": 72
                  },
                  {
                        "id": "valve-ball-rf",
                        "group": "Valves",
                        "item": "Ball Valve",
                        "type": "BALL (IBR)",
                        "endFacing": "RF",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR. FIN",
                        "dimensionStandard": "BS - 5351",
                        "material": "A216GRWCB, 13% CR. TRIM",
                        "unit": "Nos",
                        "sourcePage": 72
                  },
                  {
                        "id": "stud-bolts",
                        "group": "Bolting",
                        "item": "Stud with Nuts",
                        "type": "STUD + NUTS (IBR)",
                        "endFacing": "-",
                        "lowSize": 0.5,
                        "highSize": 48,
                        "schThkRating": "-",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 18.2",
                        "material": "A193 GR. B7 / A194 GR. 2H",
                        "unit": "Nos",
                        "sourcePage": 72
                  },
                  {
                        "id": "gasket-ring-0-24",
                        "group": "Gasket",
                        "item": "Gasket",
                        "type": "RING (IBR)",
                        "endFacing": "-",
                        "lowSize": 0.5,
                        "highSize": 24,
                        "schThkRating": "2MM",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 16.21",
                        "material": "IS - 2712 - GR. W/I",
                        "unit": "Nos",
                        "sourcePage": 72
                  },
                  {
                        "id": "gasket-ring-26-28",
                        "group": "Gasket",
                        "item": "Gasket",
                        "type": "RING (IBR)",
                        "endFacing": "-",
                        "lowSize": 26,
                        "highSize": 28,
                        "schThkRating": "2MM",
                        "faceFinishRadius": "",
                        "dimensionStandard": "API - 605",
                        "material": "IS - 2712 - GR. W/I",
                        "unit": "Nos",
                        "sourcePage": 72
                  },
                  {
                        "id": "trap-rf",
                        "group": "Trap/Strainer",
                        "item": "Trap",
                        "aliases": [
                              "Trap Steam"
                        ],
                        "type": "TRAP (IBR)",
                        "endFacing": "RF",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "THRMDNMC",
                        "dimensionStandard": "MNF'STD",
                        "material": "B: A105; T: 13% CR; SS304",
                        "unit": "Nos",
                        "sourcePage": 72
                  },
                  {
                        "id": "perm-strainer-sw",
                        "group": "Trap/Strainer",
                        "item": "Permanent Strainer",
                        "aliases": [
                              "Strainer Perm"
                        ],
                        "type": "PERM STR (IBR)",
                        "endFacing": "SW",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "800 #",
                        "faceFinishRadius": "Y TYPE",
                        "dimensionStandard": "MNF'STD",
                        "material": "B: A105; INT; SS304",
                        "unit": "Nos",
                        "sourcePage": 72
                  },
                  {
                        "id": "perm-strainer-bw-2-14",
                        "group": "Trap/Strainer",
                        "item": "Permanent Strainer",
                        "aliases": [
                              "Strainer Perm"
                        ],
                        "type": "PERM STR (IBR)",
                        "endFacing": "BW",
                        "lowSize": 2,
                        "highSize": 14,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "Y TYPE",
                        "dimensionStandard": "EIL'STD",
                        "material": "B: A234 GRWPB; INT: SS304",
                        "unit": "Nos",
                        "sourcePage": 72
                  },
                  {
                        "id": "perm-strainer-bw-16-24",
                        "group": "Trap/Strainer",
                        "item": "Permanent Strainer",
                        "aliases": [
                              "Strainer Perm"
                        ],
                        "type": "PERM STR (IBR)",
                        "endFacing": "BW",
                        "lowSize": 16,
                        "highSize": 24,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "Y TYPE",
                        "dimensionStandard": "EIL'STD",
                        "material": "B: A234 GWPCW; INT: SS304",
                        "unit": "Nos",
                        "sourcePage": 72
                  }
            ]
      },
      "A3A": {
            "pipeClass": "A3A",
            "source": {
                  "document": "Piping Mat. Specification#NRL.pdf",
                  "sheets": [
                        "A3A sheet 2 of 3",
                        "A3A sheet 3 of 3"
                  ],
                  "pages": [
                        69,
                        70
                  ],
                  "note": "MVP data manually structured from A3A material specification rows. Verify against source PDF before procurement issue."
            },
            "items": [
                  {
                        "id": "pipe-seamless-0-25-0-5",
                        "group": "Pipes",
                        "item": "Pipe",
                        "type": "Pipe (Seamless)",
                        "endFacing": "PE",
                        "lowSize": 0.25,
                        "highSize": 0.5,
                        "schThkRating": "XS",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 36.10",
                        "material": "API 5L GR.B",
                        "unit": "M",
                        "sourcePage": 69
                  },
                  {
                        "id": "pipe-cwelded-0-75-1",
                        "group": "Pipes",
                        "item": "Pipe",
                        "type": "Pipe (C.WELDED)",
                        "endFacing": "PE",
                        "lowSize": 0.75,
                        "highSize": 1.0,
                        "schThkRating": "HVY",
                        "faceFinishRadius": "",
                        "dimensionStandard": "IS-1239",
                        "material": "IS-1239 BLACK",
                        "unit": "M",
                        "sourcePage": 69
                  },
                  {
                        "id": "pipe-cwelded-2-6",
                        "group": "Pipes",
                        "item": "Pipe",
                        "type": "Pipe (C.WELDED)",
                        "endFacing": "BE",
                        "lowSize": 2,
                        "highSize": 6,
                        "schThkRating": "HVY",
                        "faceFinishRadius": "",
                        "dimensionStandard": "IS-1239",
                        "material": "IS-1239 BLACK",
                        "unit": "M",
                        "sourcePage": 69
                  },
                  {
                        "id": "pipe-erw-8-14",
                        "group": "Pipes",
                        "item": "Pipe",
                        "type": "Pipe (E.R.W.)",
                        "endFacing": "BE",
                        "lowSize": 8,
                        "highSize": 14,
                        "schThkRating": "6.35 mm",
                        "faceFinishRadius": "",
                        "dimensionStandard": "IS-3589",
                        "material": "IS-3589 GR.330",
                        "unit": "M",
                        "sourcePage": 69
                  },
                  {
                        "id": "pipe-erw-16-18",
                        "group": "Pipes",
                        "item": "Pipe",
                        "type": "Pipe (E.R.W.)",
                        "endFacing": "BE",
                        "lowSize": 16,
                        "highSize": 18,
                        "schThkRating": "8.00 mm",
                        "faceFinishRadius": "",
                        "dimensionStandard": "IS-3589",
                        "material": "IS-3589 GR.330",
                        "unit": "M",
                        "sourcePage": 69
                  },
                  {
                        "id": "pipe-erw-20-24",
                        "group": "Pipes",
                        "item": "Pipe",
                        "type": "Pipe (E.R.W.)",
                        "endFacing": "BE",
                        "lowSize": 20,
                        "highSize": 24,
                        "schThkRating": "10.0 mm",
                        "faceFinishRadius": "",
                        "dimensionStandard": "IS-3589",
                        "material": "IS-3589 GR.330",
                        "unit": "M",
                        "sourcePage": 69
                  },
                  {
                        "id": "pipe-erw-26-32",
                        "group": "Pipes",
                        "item": "Pipe",
                        "type": "Pipe (E.R.W.)",
                        "endFacing": "BE",
                        "lowSize": 26,
                        "highSize": 32,
                        "schThkRating": "10.0 mm",
                        "faceFinishRadius": "",
                        "dimensionStandard": "IS-3589",
                        "material": "IS-3589 GR.330",
                        "unit": "M",
                        "sourcePage": 69
                  },
                  {
                        "id": "pipe-erw-34-36",
                        "group": "Pipes",
                        "item": "Pipe",
                        "type": "Pipe (E.R.W.)",
                        "endFacing": "BE",
                        "lowSize": 34,
                        "highSize": 36,
                        "schThkRating": "10.0 mm",
                        "faceFinishRadius": "",
                        "dimensionStandard": "IS-3589",
                        "material": "IS-3589 GR.330",
                        "unit": "M",
                        "sourcePage": 69
                  },
                  {
                        "id": "pipe-erw-38-48",
                        "group": "Pipes",
                        "item": "Pipe",
                        "type": "Pipe (E.R.W.)",
                        "endFacing": "BE",
                        "lowSize": 38,
                        "highSize": 48,
                        "schThkRating": "12.0 mm",
                        "faceFinishRadius": "",
                        "dimensionStandard": "IS-3589",
                        "material": "IS-3589 GR.330",
                        "unit": "M",
                        "sourcePage": 69
                  },
                  {
                        "id": "flange-sw",
                        "group": "Flanges",
                        "item": "S.W. Flange",
                        "aliases": [
                              "Flange"
                        ],
                        "type": "SW",
                        "endFacing": "RF",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR.FIN",
                        "dimensionStandard": "B - 16.5",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 69
                  },
                  {
                        "id": "flange-so-2-24",
                        "group": "Flanges",
                        "item": "S.O. Flange",
                        "aliases": [
                              "Flange"
                        ],
                        "type": "SO",
                        "endFacing": "RF",
                        "lowSize": 2,
                        "highSize": 24,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR.FIN",
                        "dimensionStandard": "B - 16.5",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 69
                  },
                  {
                        "id": "flange-so-26-48",
                        "group": "Flanges",
                        "item": "S.O. Flange",
                        "aliases": [
                              "Flange"
                        ],
                        "type": "SO",
                        "endFacing": "FF",
                        "lowSize": 26,
                        "highSize": 48,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR.FIN",
                        "dimensionStandard": "EIL'STD",
                        "material": "ASTM A285 GR.C",
                        "unit": "Nos",
                        "sourcePage": 69
                  },
                  {
                        "id": "flange-blind-0-24",
                        "group": "Flanges",
                        "item": "Blind Flange",
                        "type": "BLIND",
                        "endFacing": "RF",
                        "lowSize": 0.5,
                        "highSize": 24,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR.FIN",
                        "dimensionStandard": "B - 16.5",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 69
                  },
                  {
                        "id": "flange-blind-26-48",
                        "group": "Flanges",
                        "item": "Blind Flange",
                        "type": "BLIND",
                        "endFacing": "FF",
                        "lowSize": 26,
                        "highSize": 48,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR.FIN",
                        "dimensionStandard": "EIL'STD",
                        "material": "ASTM A285 GR.C",
                        "unit": "Nos",
                        "sourcePage": 69
                  },
                  {
                        "id": "fig8-flange",
                        "group": "Flanges",
                        "item": "Figure 8 Flange",
                        "aliases": [
                              "FLNG.FIG.8"
                        ],
                        "type": "FIG.8.FL",
                        "endFacing": "FF",
                        "lowSize": 0.5,
                        "highSize": 8,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR.FIN",
                        "dimensionStandard": "API - 590",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 69
                  },
                  {
                        "id": "spacer-blind-10-24",
                        "group": "Flanges",
                        "item": "SPCR & BLN",
                        "type": "SPCR & BLN",
                        "endFacing": "FF",
                        "lowSize": 10,
                        "highSize": 24,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR.FIN",
                        "dimensionStandard": "API - 590",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 69
                  },
                  {
                        "id": "spacer-blind-26-48",
                        "group": "Flanges",
                        "item": "SPCR & BLN",
                        "type": "SPCR & BLN",
                        "endFacing": "FF",
                        "lowSize": 26,
                        "highSize": 48,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR.FIN",
                        "dimensionStandard": "EIL'STD",
                        "material": "ASTM A285 GR.C",
                        "unit": "Nos",
                        "sourcePage": 69
                  },
                  {
                        "id": "fitting-sw-0-5-1-5",
                        "group": "Fittings",
                        "item": "Fitting",
                        "aliases": [
                              "Elbow 90 deg.",
                              "Elbow 45 deg.",
                              "Equal Tee",
                              "Red. Tee",
                              "Reducing Tee",
                              "Coupling",
                              "CPLNG.FULL",
                              "CPLNG.HALF",
                              "CPLNG.LH",
                              "CPLNG.RED",
                              "SWAGE.CONC",
                              "SWAGE.ECC"
                        ],
                        "type": "SW",
                        "endFacing": "SW",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "3000 #",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 16.11",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 69
                  },
                  {
                        "id": "fitting-bw-2-6",
                        "group": "Fittings",
                        "item": "Fitting",
                        "aliases": [
                              "Elbow 90 deg.",
                              "Elbow 45 deg.",
                              "Equal Tee",
                              "Red. Tee",
                              "Reducing Tee",
                              "Con. Reducer",
                              "Ecc. Reducer"
                        ],
                        "type": "BW",
                        "endFacing": "BW",
                        "lowSize": 2,
                        "highSize": 6,
                        "schThkRating": "As per matching pipe",
                        "faceFinishRadius": "R = 1.50",
                        "dimensionStandard": "B - 16.9",
                        "material": "ASTM A234 GR.WPB",
                        "unit": "Nos",
                        "sourcePage": 69
                  },
                  {
                        "id": "caps-scrf",
                        "group": "Fittings",
                        "item": "Cap",
                        "aliases": [
                              "CAP"
                        ],
                        "type": "SCRF",
                        "endFacing": "SCRF",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "CALC",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 16.11",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 69
                  },
                  {
                        "id": "caps-bw-8-48",
                        "group": "Fittings",
                        "item": "Cap",
                        "aliases": [
                              "CAP"
                        ],
                        "type": "BW",
                        "endFacing": "BW",
                        "lowSize": 8,
                        "highSize": 48,
                        "schThkRating": "3000 #",
                        "faceFinishRadius": "R = 1.50",
                        "dimensionStandard": "B - 16.9",
                        "material": "ASTM A234 GR.WPCW",
                        "unit": "Nos",
                        "sourcePage": 69
                  },
                  {
                        "id": "mitres-8-48",
                        "group": "Fittings",
                        "item": "Mitre",
                        "type": "BW",
                        "endFacing": "BW",
                        "lowSize": 8,
                        "highSize": 48,
                        "schThkRating": "As per matching pipe",
                        "faceFinishRadius": "R = 1.50",
                        "dimensionStandard": "EIL'STD",
                        "material": "IS-3589 GR.330",
                        "unit": "Nos",
                        "sourcePage": 69
                  },
                  {
                        "id": "reducers-8-48",
                        "group": "Fittings",
                        "item": "Reducer",
                        "aliases": [
                              "Con. Reducer",
                              "Ecc. Reducer"
                        ],
                        "type": "BW",
                        "endFacing": "BW",
                        "lowSize": 8,
                        "highSize": 48,
                        "schThkRating": "As per matching pipe",
                        "faceFinishRadius": "",
                        "dimensionStandard": "EIL'STD",
                        "material": "IS-3589 GR.330",
                        "unit": "Nos",
                        "sourcePage": 69
                  },
                  {
                        "id": "valve-gate-sw",
                        "group": "Valves",
                        "item": "Gate Valve",
                        "type": "GATE",
                        "endFacing": "SW",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "800 #",
                        "faceFinishRadius": "",
                        "dimensionStandard": "API - 602",
                        "material": "A105, 13% CR. TRIM",
                        "unit": "Nos",
                        "sourcePage": 70
                  },
                  {
                        "id": "valve-globe-sw",
                        "group": "Valves",
                        "item": "Globe Valve",
                        "type": "GLOBE",
                        "endFacing": "SW",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "800 #",
                        "faceFinishRadius": "",
                        "dimensionStandard": "BS - 5352",
                        "material": "A105, 13% CR. TRIM",
                        "unit": "Nos",
                        "sourcePage": 70
                  },
                  {
                        "id": "valve-check-sw",
                        "group": "Valves",
                        "item": "Check Valve",
                        "type": "CHECK",
                        "endFacing": "SW",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "800 #",
                        "faceFinishRadius": "",
                        "dimensionStandard": "BS - 5352",
                        "material": "A105, 13% CR. TRIM",
                        "unit": "Nos",
                        "sourcePage": 70
                  },
                  {
                        "id": "valve-angle-sw",
                        "group": "Valves",
                        "item": "Angle Valve",
                        "type": "ANGLE",
                        "endFacing": "SW",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "800 #",
                        "faceFinishRadius": "",
                        "dimensionStandard": "BS - 5352",
                        "material": "A105, 13% CR. TRIM",
                        "unit": "Nos",
                        "sourcePage": 70
                  },
                  {
                        "id": "valve-gate-rf-2-24",
                        "group": "Valves",
                        "item": "Gate Valve",
                        "type": "GATE",
                        "endFacing": "RF",
                        "lowSize": 2,
                        "highSize": 24,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR.FIN",
                        "dimensionStandard": "API - 600",
                        "material": "A216GRWCB, 13% CR. TRIM",
                        "unit": "Nos",
                        "sourcePage": 70
                  },
                  {
                        "id": "valve-gate-rf-26-30",
                        "group": "Valves",
                        "item": "Gate Valve",
                        "type": "GATE",
                        "endFacing": "RF",
                        "lowSize": 26,
                        "highSize": 30,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR.FIN",
                        "dimensionStandard": "API - 600",
                        "material": "A216GRWCB, 13% CR. TRIM",
                        "unit": "Nos",
                        "sourcePage": 70
                  },
                  {
                        "id": "valve-globe-rf",
                        "group": "Valves",
                        "item": "Globe Valve",
                        "type": "GLOBE",
                        "endFacing": "RF",
                        "lowSize": 2,
                        "highSize": 12,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR.FIN",
                        "dimensionStandard": "BS - 1873",
                        "material": "A216GRWCB, 13% CR. TRIM",
                        "unit": "Nos",
                        "sourcePage": 70
                  },
                  {
                        "id": "valve-check-rf-2-24",
                        "group": "Valves",
                        "item": "Check Valve",
                        "type": "CHECK",
                        "endFacing": "RF",
                        "lowSize": 2,
                        "highSize": 24,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR.FIN",
                        "dimensionStandard": "BS - 1868",
                        "material": "A216GRWCB, 13% CR. TRIM",
                        "unit": "Nos",
                        "sourcePage": 70
                  },
                  {
                        "id": "valve-check-rf-26-30",
                        "group": "Valves",
                        "item": "Check Valve",
                        "type": "CHECK",
                        "endFacing": "RF",
                        "lowSize": 26,
                        "highSize": 30,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR.FIN",
                        "dimensionStandard": "BS - 1868",
                        "material": "A216GRWCB, 13% CR. TRIM",
                        "unit": "Nos",
                        "sourcePage": 70
                  },
                  {
                        "id": "valve-butterfly",
                        "group": "Valves",
                        "item": "Butterfly Valve",
                        "aliases": [
                              "Triple Offset BIR'FLY Valve"
                        ],
                        "type": "BIR'FLY",
                        "endFacing": "WAF",
                        "lowSize": 3,
                        "highSize": 48,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR.FIN",
                        "dimensionStandard": "BS - 5155",
                        "material": "A216GRWCB, 13% CR. TRIM",
                        "unit": "Nos",
                        "sourcePage": 70
                  },
                  {
                        "id": "valve-check-waf",
                        "group": "Valves",
                        "item": "Check Valve",
                        "type": "CHECK",
                        "endFacing": "WAF",
                        "lowSize": 26,
                        "highSize": 48,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR.FIN",
                        "dimensionStandard": "BS - 1868",
                        "material": "A105, 13% CR. BALL",
                        "unit": "Nos",
                        "sourcePage": 70
                  },
                  {
                        "id": "valve-ball-rf",
                        "group": "Valves",
                        "item": "Ball Valve",
                        "type": "BALL",
                        "endFacing": "RF",
                        "lowSize": 0.5,
                        "highSize": 16,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR.FIN",
                        "dimensionStandard": "BS - 5351",
                        "material": "A105, 13% CR. BALL",
                        "unit": "Nos",
                        "sourcePage": 70
                  },
                  {
                        "id": "machine-bolt",
                        "group": "Bolting",
                        "item": "Machine Bolt",
                        "type": "M/C BOLT",
                        "endFacing": "-",
                        "lowSize": 0.5,
                        "highSize": 48,
                        "schThkRating": "-",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 18.2",
                        "material": "A307 GR.B",
                        "unit": "Nos",
                        "sourcePage": 70,
                        "note": "PDF lists M/C BOLT separately. Automatic bolt size/count calculation is a future feature."
                  },
                  {
                        "id": "nut",
                        "group": "Bolting",
                        "item": "Nut",
                        "type": "NUT",
                        "endFacing": "-",
                        "lowSize": 0.5,
                        "highSize": 48,
                        "schThkRating": "-",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 18.2",
                        "material": "A307 GR.B",
                        "unit": "Nos",
                        "sourcePage": 70,
                        "note": "PDF lists NUT separately. Automatic nut size/count calculation is a future feature."
                  },
                  {
                        "id": "gasket-ring-0-24",
                        "group": "Gasket",
                        "item": "Gasket",
                        "type": "RING",
                        "endFacing": "-",
                        "lowSize": 0.5,
                        "highSize": 24,
                        "schThkRating": "2MM",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 16.21",
                        "material": "IS-2712-GR.W/3",
                        "unit": "Nos",
                        "sourcePage": 70
                  },
                  {
                        "id": "gasket-ring-26-48",
                        "group": "Gasket",
                        "item": "Gasket",
                        "type": "RING",
                        "endFacing": "-",
                        "lowSize": 26,
                        "highSize": 48,
                        "schThkRating": "2MM",
                        "faceFinishRadius": "",
                        "dimensionStandard": "EIL'STD",
                        "material": "IS-2712-GR.W/3",
                        "unit": "Nos",
                        "sourcePage": 70
                  },
                  {
                        "id": "trap-rf",
                        "group": "Trap/Strainer",
                        "item": "Trap",
                        "aliases": [
                              "Trap Steam"
                        ],
                        "type": "TRAP",
                        "endFacing": "RF",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "THRMONMC",
                        "dimensionStandard": "MNF'STD",
                        "material": "B: A105; T: 13% CR; SS304",
                        "unit": "Nos",
                        "sourcePage": 70
                  },
                  {
                        "id": "perm-strainer-sw",
                        "group": "Trap/Strainer",
                        "item": "Permanent Strainer",
                        "aliases": [
                              "Strainer Perm",
                              "Strainer Temp"
                        ],
                        "type": "PERM STR",
                        "endFacing": "SW",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "800 #",
                        "faceFinishRadius": "Y TYPE",
                        "dimensionStandard": "MNF'STD",
                        "material": "B: A105; INT; SS304",
                        "unit": "Nos",
                        "sourcePage": 70
                  },
                  {
                        "id": "perm-strainer-bw-2-6",
                        "group": "Trap/Strainer",
                        "item": "Permanent Strainer",
                        "aliases": [
                              "Strainer Perm",
                              "Strainer Temp"
                        ],
                        "type": "PERM STR",
                        "endFacing": "BW",
                        "lowSize": 2,
                        "highSize": 6,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "Y TYPE",
                        "dimensionStandard": "EIL'STD",
                        "material": "B: A234 GRWPB; INT: SS304",
                        "unit": "Nos",
                        "sourcePage": 70
                  },
                  {
                        "id": "perm-strainer-bw-8-32",
                        "group": "Trap/Strainer",
                        "item": "Permanent Strainer",
                        "aliases": [
                              "Strainer Perm",
                              "Strainer Temp"
                        ],
                        "type": "PERM STR",
                        "endFacing": "BW",
                        "lowSize": 8,
                        "highSize": 32,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "Y TYPE",
                        "dimensionStandard": "EIL'STD",
                        "material": "B: A234 GWPBW; INT: SS304",
                        "unit": "Nos",
                        "sourcePage": 70
                  }
            ]
      },
      "A5A": {
            "pipeClass": "A5A",
            "source": {
                  "document": "Piping Mat. Specification#NRL.pdf",
                  "sheets": [
                        "A5A sheet 2 of 3",
                        "A5A sheet 3 of 3"
                  ],
                  "pages": [
                        71,
                        72
                  ],
                  "note": "MVP data manually structured from A5A material specification rows. Verify against source PDF before procurement issue."
            },
            "items": [
                  {
                        "id": "pipe-seamless-0-5",
                        "group": "Pipes",
                        "item": "Pipe",
                        "type": "Pipe (Seamless)",
                        "endFacing": "PE",
                        "lowSize": 0.5,
                        "highSize": 0.5,
                        "schThkRating": "XS",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 36.10",
                        "material": "ASTM A106 GR.B",
                        "unit": "M",
                        "sourcePage": 71
                  },
                  {
                        "id": "pipe-seamless-2-6",
                        "group": "Pipes",
                        "item": "Pipe",
                        "type": "Pipe (Seamless)",
                        "endFacing": "BE",
                        "lowSize": 2,
                        "highSize": 6,
                        "schThkRating": "STD",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 36.10",
                        "material": "ASTM A106 GR.B",
                        "unit": "M",
                        "sourcePage": 71
                  },
                  {
                        "id": "pipe-seamless-8-14",
                        "group": "Pipes",
                        "item": "Pipe",
                        "type": "Pipe (Seamless)",
                        "endFacing": "BE",
                        "lowSize": 8,
                        "highSize": 14,
                        "schThkRating": "S20",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 36.10",
                        "material": "ASTM A106 GR.B",
                        "unit": "M",
                        "sourcePage": 71
                  },
                  {
                        "id": "pipe-efsw-16-22",
                        "group": "Pipes",
                        "item": "Pipe",
                        "type": "Pipe (E.F.S.W.)",
                        "endFacing": "BE",
                        "lowSize": 16,
                        "highSize": 22,
                        "schThkRating": "6.00 mm",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 36.10",
                        "material": "ASTM A672 GR.B60 CL.12",
                        "unit": "M",
                        "sourcePage": 71
                  },
                  {
                        "id": "pipe-efsw-24-30",
                        "group": "Pipes",
                        "item": "Pipe",
                        "type": "Pipe (E.F.S.W.)",
                        "endFacing": "BE",
                        "lowSize": 24,
                        "highSize": 30,
                        "schThkRating": "8.00 mm",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 36.10",
                        "material": "ASTM A672 GR.B60 CL.12",
                        "unit": "M",
                        "sourcePage": 71
                  },
                  {
                        "id": "flange-wn-0-5-1-5",
                        "group": "Flanges",
                        "item": "W.N. Flange",
                        "aliases": [
                              "Flange"
                        ],
                        "type": "WN",
                        "endFacing": "RF",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "125 AARH",
                        "dimensionStandard": "B - 16.5",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 71
                  },
                  {
                        "id": "flange-wn-2-24",
                        "group": "Flanges",
                        "item": "W.N. Flange",
                        "aliases": [
                              "Flange"
                        ],
                        "type": "WN",
                        "endFacing": "RF",
                        "lowSize": 2,
                        "highSize": 24,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "125 AARH",
                        "dimensionStandard": "B - 16.5",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 71
                  },
                  {
                        "id": "flange-wn-26-30",
                        "group": "Flanges",
                        "item": "W.N. Flange",
                        "aliases": [
                              "Flange"
                        ],
                        "type": "WN",
                        "endFacing": "RF",
                        "lowSize": 26,
                        "highSize": 30,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "125 AARH",
                        "dimensionStandard": "API - 605",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 71
                  },
                  {
                        "id": "flange-blind-0-5-1-5",
                        "group": "Flanges",
                        "item": "Blind Flange",
                        "type": "BLIND",
                        "endFacing": "RF",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "125 AARH",
                        "dimensionStandard": "B - 16.5",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 71
                  },
                  {
                        "id": "flange-blind-2-24",
                        "group": "Flanges",
                        "item": "Blind Flange",
                        "type": "BLIND",
                        "endFacing": "RF",
                        "lowSize": 2,
                        "highSize": 24,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "125 AARH",
                        "dimensionStandard": "B - 16.5",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 71
                  },
                  {
                        "id": "flange-blind-26-30",
                        "group": "Flanges",
                        "item": "Blind Flange",
                        "type": "BLIND",
                        "endFacing": "RF",
                        "lowSize": 26,
                        "highSize": 30,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "125 AARH",
                        "dimensionStandard": "API - 605",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 71
                  },
                  {
                        "id": "fig8-flange-0-5-1-5",
                        "group": "Flanges",
                        "item": "Figure 8 Flange",
                        "aliases": [
                              "FLNG.FIG.8"
                        ],
                        "type": "FIG.8.FL",
                        "endFacing": "FF",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "125 AARH",
                        "dimensionStandard": "API - 590",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 71
                  },
                  {
                        "id": "fig8-flange-2-8",
                        "group": "Flanges",
                        "item": "Figure 8 Flange",
                        "aliases": [
                              "FLNG.FIG.8"
                        ],
                        "type": "FIG.8.FL",
                        "endFacing": "FF",
                        "lowSize": 2,
                        "highSize": 8,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "125 AARH",
                        "dimensionStandard": "API - 590",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 71
                  },
                  {
                        "id": "spacer-blind-10-24",
                        "group": "Flanges",
                        "item": "SPCR & BLN",
                        "type": "SPCR & BLN",
                        "endFacing": "FF",
                        "lowSize": 10,
                        "highSize": 24,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "125 AARH",
                        "dimensionStandard": "API - 590",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 71
                  },
                  {
                        "id": "spacer-blind-26-30",
                        "group": "Flanges",
                        "item": "SPCR & BLN",
                        "type": "SPCR & BLN",
                        "endFacing": "FF",
                        "lowSize": 26,
                        "highSize": 30,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "125 AARH",
                        "dimensionStandard": "EIL'STD",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 71
                  },
                  {
                        "id": "fitting-sw-0-5-1-5",
                        "group": "Fittings",
                        "item": "Fitting",
                        "aliases": [
                              "Elbow 90 deg.",
                              "Elbow 45 deg.",
                              "Equal Tee",
                              "Red. Tee",
                              "Reducing Tee",
                              "Coupling",
                              "CPLNG.FULL",
                              "CPLNG.HALF",
                              "CPLNG.LH",
                              "CPLNG.RED",
                              "SWAGE.CONC",
                              "SWAGE.ECC"
                        ],
                        "type": "SW",
                        "endFacing": "SW",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "3000 #",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 16.11",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 71
                  },
                  {
                        "id": "fitting-bw-2-14",
                        "group": "Fittings",
                        "item": "Fitting",
                        "aliases": [
                              "Elbow 90 deg.",
                              "Elbow 45 deg.",
                              "Equal Tee",
                              "Red. Tee",
                              "Reducing Tee",
                              "Con. Reducer",
                              "Ecc. Reducer"
                        ],
                        "type": "BW",
                        "endFacing": "BW",
                        "lowSize": 2,
                        "highSize": 14,
                        "schThkRating": "As per matching pipe",
                        "faceFinishRadius": "R = 1.50",
                        "dimensionStandard": "B - 16.9",
                        "material": "ASTM A234 GR.WPB",
                        "unit": "Nos",
                        "sourcePage": 71
                  },
                  {
                        "id": "fitting-bw-16-30",
                        "group": "Fittings",
                        "item": "Fitting",
                        "aliases": [
                              "Elbow 90 deg.",
                              "Elbow 45 deg.",
                              "Equal Tee",
                              "Red. Tee",
                              "Reducing Tee",
                              "Con. Reducer",
                              "Ecc. Reducer"
                        ],
                        "type": "BW",
                        "endFacing": "BW",
                        "lowSize": 16,
                        "highSize": 30,
                        "schThkRating": "As per matching pipe",
                        "faceFinishRadius": "R = 1.51",
                        "dimensionStandard": "B - 16.9",
                        "material": "ASTM A234 GR.WPBW",
                        "unit": "Nos",
                        "sourcePage": 71
                  },
                  {
                        "id": "caps-scrf",
                        "group": "Fittings",
                        "item": "Cap",
                        "aliases": [
                              "CAP"
                        ],
                        "type": "SCRF",
                        "endFacing": "SCRF",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "3000 #",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 16.11",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 71
                  },
                  {
                        "id": "valve-gate-sw",
                        "group": "Valves",
                        "item": "Gate Valve",
                        "type": "GATE",
                        "endFacing": "SW",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "800 #",
                        "faceFinishRadius": "",
                        "dimensionStandard": "API - 602",
                        "material": "A105, 13% CR. TRIM",
                        "unit": "Nos",
                        "sourcePage": 72
                  },
                  {
                        "id": "valve-globe-sw",
                        "group": "Valves",
                        "item": "Globe Valve",
                        "type": "GLOBE",
                        "endFacing": "SW",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "800 #",
                        "faceFinishRadius": "",
                        "dimensionStandard": "BS - 5352",
                        "material": "A105, 13% CR. TRIM",
                        "unit": "Nos",
                        "sourcePage": 72
                  },
                  {
                        "id": "valve-check-sw",
                        "group": "Valves",
                        "item": "Check Valve",
                        "type": "CHECK",
                        "endFacing": "SW",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "800 #",
                        "faceFinishRadius": "",
                        "dimensionStandard": "BS - 5352",
                        "material": "A105, 13% CR. TRIM",
                        "unit": "Nos",
                        "sourcePage": 72
                  },
                  {
                        "id": "valve-gate-rf",
                        "group": "Valves",
                        "item": "Gate Valve",
                        "type": "GATE",
                        "endFacing": "RF",
                        "lowSize": 2,
                        "highSize": 24,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "125 AARH",
                        "dimensionStandard": "API - 600",
                        "material": "A216 GR.WCB, 13% CR. TRIM",
                        "unit": "Nos",
                        "sourcePage": 72
                  },
                  {
                        "id": "valve-globe-rf",
                        "group": "Valves",
                        "item": "Globe Valve",
                        "type": "GLOBE",
                        "endFacing": "RF",
                        "lowSize": 2,
                        "highSize": 8,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "125 AARH",
                        "dimensionStandard": "BS - 1873",
                        "material": "A216 GR.WCB, 13% CR. TRIM",
                        "unit": "Nos",
                        "sourcePage": 72
                  },
                  {
                        "id": "valve-check-rf",
                        "group": "Valves",
                        "item": "Check Valve",
                        "type": "CHECK",
                        "endFacing": "RF",
                        "lowSize": 2,
                        "highSize": 24,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "125 AARH",
                        "dimensionStandard": "BS - 1868",
                        "material": "A216 GR.WCB, 13% CR. TRIM",
                        "unit": "Nos",
                        "sourcePage": 72
                  },
                  {
                        "id": "valve-butterfly-rf",
                        "group": "Valves",
                        "item": "Butterfly Valve",
                        "aliases": [
                              "BIR'FLY Valve"
                        ],
                        "type": "BIR'FLY",
                        "endFacing": "RF",
                        "lowSize": 2,
                        "highSize": 30,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "125 AARH",
                        "dimensionStandard": "API - 609",
                        "material": "A216 GR.WCB, 13% CR. TRIM",
                        "unit": "Nos",
                        "sourcePage": 72
                  },
                  {
                        "id": "valve-ball-rf",
                        "group": "Valves",
                        "item": "Ball Valve",
                        "type": "BALL",
                        "endFacing": "RF",
                        "lowSize": 0.5,
                        "highSize": 24,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "125 AARH",
                        "dimensionStandard": "BS - 5351",
                        "material": "A216 GR.WCB, 13% CR. BALL",
                        "unit": "Nos",
                        "sourcePage": 72
                  },
                  {
                        "id": "stud-bolts",
                        "group": "Bolting",
                        "item": "Stud with Nuts",
                        "type": "STUD + NUTS",
                        "endFacing": "-",
                        "lowSize": 0.5,
                        "highSize": 30,
                        "schThkRating": "-",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 18.2",
                        "material": "A193 GR.B7 / A194 GR.2H",
                        "unit": "Nos",
                        "sourcePage": 72,
                        "note": "MVP stores bolt material only. Automatic bolt size/count calculation is a future feature."
                  },
                  {
                        "id": "gasket-spiral-0-5-1-5",
                        "group": "Gasket",
                        "item": "Gasket",
                        "type": "SPIRAL",
                        "endFacing": "-",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "5MM",
                        "faceFinishRadius": "",
                        "dimensionStandard": "API - 601",
                        "material": "SS304 SPR.WND + CA FIL",
                        "unit": "Nos",
                        "sourcePage": 72
                  },
                  {
                        "id": "gasket-spiral-2-24",
                        "group": "Gasket",
                        "item": "Gasket",
                        "type": "SPIRAL",
                        "endFacing": "-",
                        "lowSize": 2,
                        "highSize": 24,
                        "schThkRating": "5MM",
                        "faceFinishRadius": "",
                        "dimensionStandard": "API - 601",
                        "material": "SS304 SPR.WND + CA FIL",
                        "unit": "Nos",
                        "sourcePage": 72
                  },
                  {
                        "id": "gasket-spiral-26-30",
                        "group": "Gasket",
                        "item": "Gasket",
                        "type": "SPIRAL",
                        "endFacing": "-",
                        "lowSize": 26,
                        "highSize": 30,
                        "schThkRating": "5MM",
                        "faceFinishRadius": "",
                        "dimensionStandard": "API - 605",
                        "material": "SS304 SPR.WND + CA FIL",
                        "unit": "Nos",
                        "sourcePage": 72
                  },
                  {
                        "id": "perm-strainer-sw",
                        "group": "Trap/Strainer",
                        "item": "Permanent Strainer",
                        "aliases": [
                              "Strainer Perm",
                              "Strainer Temp"
                        ],
                        "type": "PERM STR",
                        "endFacing": "SW",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "800 #",
                        "faceFinishRadius": "Y TYPE",
                        "dimensionStandard": "MNF'STD",
                        "material": "B: A105; INT: SS304",
                        "unit": "Nos",
                        "sourcePage": 72
                  },
                  {
                        "id": "perm-strainer-bw-2-14",
                        "group": "Trap/Strainer",
                        "item": "Permanent Strainer",
                        "aliases": [
                              "Strainer Perm",
                              "Strainer Temp"
                        ],
                        "type": "PERM STR",
                        "endFacing": "BW",
                        "lowSize": 2,
                        "highSize": 14,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "Y TYPE",
                        "dimensionStandard": "EIL'STD",
                        "material": "B: A234 WPB; INT: SS304",
                        "unit": "Nos",
                        "sourcePage": 72
                  },
                  {
                        "id": "perm-strainer-bw-16-24",
                        "group": "Trap/Strainer",
                        "item": "Permanent Strainer",
                        "aliases": [
                              "Strainer Perm",
                              "Strainer Temp"
                        ],
                        "type": "PERM STR",
                        "endFacing": "BW",
                        "lowSize": 16,
                        "highSize": 24,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "Y TYPE",
                        "dimensionStandard": "EIL'STD",
                        "material": "B: A234 WPBW; INT: SS304",
                        "unit": "Nos",
                        "sourcePage": 72
                  }
            ]
      },
      "A9A": {
            "pipeClass": "A9A",
            "source": {
                  "document": "Piping Mat. Specification#NRL.pdf",
                  "sheets": [
                        "A9A sheet 2 of 3",
                        "A9A sheet 3 of 3"
                  ],
                  "pages": [
                        73,
                        74
                  ],
                  "note": "MVP data manually structured from A9A material specification rows. Verify against source PDF before procurement issue."
            },
            "items": [
                  {
                        "id": "pipe-seamless-small",
                        "group": "Pipes",
                        "item": "Pipe",
                        "type": "Pipe (Seamless)",
                        "endFacing": "PE",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "XS",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 36.10",
                        "material": "API 5L GR.B",
                        "unit": "M",
                        "sourcePage": 73
                  },
                  {
                        "id": "pipe-seamless-2-3",
                        "group": "Pipes",
                        "item": "Pipe",
                        "type": "Pipe (Seamless)",
                        "endFacing": "BE",
                        "lowSize": 2,
                        "highSize": 3,
                        "schThkRating": "XS",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 36.10",
                        "material": "API 5L GR.B",
                        "unit": "M",
                        "sourcePage": 73
                  },
                  {
                        "id": "pipe-seamless-4-6",
                        "group": "Pipes",
                        "item": "Pipe",
                        "type": "Pipe (Seamless)",
                        "endFacing": "BE",
                        "lowSize": 4,
                        "highSize": 6,
                        "schThkRating": "STD",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 36.10",
                        "material": "API 5L GR.B",
                        "unit": "M",
                        "sourcePage": 73
                  },
                  {
                        "id": "pipe-seamless-8-14",
                        "group": "Pipes",
                        "item": "Pipe",
                        "type": "Pipe (Seamless)",
                        "endFacing": "BE",
                        "lowSize": 8,
                        "highSize": 14,
                        "schThkRating": "S20",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 36.10",
                        "material": "API 5L GR.B",
                        "unit": "M",
                        "sourcePage": 73
                  },
                  {
                        "id": "pipe-efsw-16-24",
                        "group": "Pipes",
                        "item": "Pipe",
                        "type": "Pipe (E.F.S.W.)",
                        "endFacing": "BE",
                        "lowSize": 16,
                        "highSize": 24,
                        "schThkRating": "8.00 mm",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 36.10",
                        "material": "ASTM A672 GR.B60 CL.12",
                        "unit": "M",
                        "sourcePage": 73
                  },
                  {
                        "id": "pipe-efsw-26-28",
                        "group": "Pipes",
                        "item": "Pipe",
                        "type": "Pipe (E.F.S.W.)",
                        "endFacing": "BE",
                        "lowSize": 26,
                        "highSize": 28,
                        "schThkRating": "10.0 mm",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 36.10",
                        "material": "ASTM A672 GR.B60 CL.12",
                        "unit": "M",
                        "sourcePage": 73
                  },
                  {
                        "id": "flange-sw",
                        "group": "Flanges",
                        "item": "S.W. Flange",
                        "aliases": [
                              "Flange"
                        ],
                        "type": "SW",
                        "endFacing": "RF",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR.FIN",
                        "dimensionStandard": "B - 16.5",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 73
                  },
                  {
                        "id": "flange-wn-2-24",
                        "group": "Flanges",
                        "item": "W.N. Flange",
                        "aliases": [
                              "Flange"
                        ],
                        "type": "WN",
                        "endFacing": "RF",
                        "lowSize": 2,
                        "highSize": 24,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR.FIN",
                        "dimensionStandard": "B - 16.5",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 73
                  },
                  {
                        "id": "flange-wn-26-28",
                        "group": "Flanges",
                        "item": "W.N. Flange",
                        "aliases": [
                              "Flange"
                        ],
                        "type": "WN",
                        "endFacing": "RF",
                        "lowSize": 26,
                        "highSize": 28,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR.FIN",
                        "dimensionStandard": "API - 605",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 73
                  },
                  {
                        "id": "flange-blind-0-24",
                        "group": "Flanges",
                        "item": "Blind Flange",
                        "type": "BLIND",
                        "endFacing": "RF",
                        "lowSize": 0.5,
                        "highSize": 24,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR.FIN",
                        "dimensionStandard": "B - 16.5",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 73
                  },
                  {
                        "id": "flange-blind-26-28",
                        "group": "Flanges",
                        "item": "Blind Flange",
                        "type": "BLIND",
                        "endFacing": "RF",
                        "lowSize": 26,
                        "highSize": 28,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR.FIN",
                        "dimensionStandard": "API - 605",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 73
                  },
                  {
                        "id": "fig8-flange",
                        "group": "Flanges",
                        "item": "Figure 8 Flange",
                        "aliases": [
                              "FLNG.FIG.8"
                        ],
                        "type": "FIG.8.FL",
                        "endFacing": "FF",
                        "lowSize": 0.5,
                        "highSize": 8,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR.FIN",
                        "dimensionStandard": "API - 590",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 73
                  },
                  {
                        "id": "spacer-blind-10-24",
                        "group": "Flanges",
                        "item": "SPCR & BLN",
                        "type": "SPCR & BLN",
                        "endFacing": "FF",
                        "lowSize": 10,
                        "highSize": 24,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR.FIN",
                        "dimensionStandard": "API - 590",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 73
                  },
                  {
                        "id": "spacer-blind-26-28",
                        "group": "Flanges",
                        "item": "SPCR & BLN",
                        "type": "SPCR & BLN",
                        "endFacing": "FF",
                        "lowSize": 26,
                        "highSize": 28,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR.FIN",
                        "dimensionStandard": "EIL'STD",
                        "material": "ASTM A515 GR.C70 (NORM)",
                        "unit": "Nos",
                        "sourcePage": 73
                  },
                  {
                        "id": "fitting-sw-0-1-5",
                        "group": "Fittings",
                        "item": "Fitting",
                        "aliases": [
                              "Elbow 90 deg.",
                              "Elbow 45 deg.",
                              "Equal Tee",
                              "Red. Tee",
                              "Reducing Tee",
                              "Coupling",
                              "CPLNG.FULL",
                              "CPLNG.HALF",
                              "CPLNG.LH",
                              "CPLNG.RED",
                              "SWAGE.CONC",
                              "SWAGE.ECC"
                        ],
                        "type": "SW",
                        "endFacing": "SW",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "3000 #",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 16.11",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 73
                  },
                  {
                        "id": "fitting-bw-2-14",
                        "group": "Fittings",
                        "item": "Fitting",
                        "aliases": [
                              "Elbow 90 deg.",
                              "Elbow 45 deg.",
                              "Equal Tee",
                              "Red. Tee",
                              "Reducing Tee",
                              "Con. Reducer",
                              "Ecc. Reducer"
                        ],
                        "type": "BW",
                        "endFacing": "BW",
                        "lowSize": 2,
                        "highSize": 14,
                        "schThkRating": "As per matching pipe",
                        "faceFinishRadius": "R = 1.50",
                        "dimensionStandard": "B - 16.9",
                        "material": "ASTM A234 GR.WPB",
                        "unit": "Nos",
                        "sourcePage": 73
                  },
                  {
                        "id": "fitting-bw-16-28",
                        "group": "Fittings",
                        "item": "Fitting",
                        "aliases": [
                              "Elbow 90 deg.",
                              "Elbow 45 deg.",
                              "Equal Tee",
                              "Red. Tee",
                              "Reducing Tee",
                              "Con. Reducer",
                              "Ecc. Reducer"
                        ],
                        "type": "BW",
                        "endFacing": "BW",
                        "lowSize": 16,
                        "highSize": 28,
                        "schThkRating": "As per matching pipe",
                        "faceFinishRadius": "R = 1.51",
                        "dimensionStandard": "B - 16.9",
                        "material": "ASTM A234 GR.WPCW",
                        "unit": "Nos",
                        "sourcePage": 73
                  },
                  {
                        "id": "caps-scrf",
                        "group": "Fittings",
                        "item": "Cap",
                        "aliases": [
                              "CAP"
                        ],
                        "type": "SCRF",
                        "endFacing": "SCRF",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "3000 #",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 16.11",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 73
                  },
                  {
                        "id": "valve-gate-sw",
                        "group": "Valves",
                        "item": "Gate Valve",
                        "type": "GATE",
                        "endFacing": "SW",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "800 #",
                        "faceFinishRadius": "",
                        "dimensionStandard": "API - 602",
                        "material": "A105, 13% CR. TRIM",
                        "unit": "Nos",
                        "sourcePage": 74
                  },
                  {
                        "id": "valve-globe-sw",
                        "group": "Valves",
                        "item": "Globe Valve",
                        "type": "GLOBE",
                        "endFacing": "SW",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "800 #",
                        "faceFinishRadius": "",
                        "dimensionStandard": "BS - 5352",
                        "material": "A105, 13% CR. TRIM",
                        "unit": "Nos",
                        "sourcePage": 74
                  },
                  {
                        "id": "valve-check-sw",
                        "group": "Valves",
                        "item": "Check Valve",
                        "type": "CHECK",
                        "endFacing": "SW",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "800 #",
                        "faceFinishRadius": "",
                        "dimensionStandard": "BS - 5352",
                        "material": "A105, 13% CR. TRIM",
                        "unit": "Nos",
                        "sourcePage": 74
                  },
                  {
                        "id": "valve-gate-rf",
                        "group": "Valves",
                        "item": "Gate Valve",
                        "type": "GATE",
                        "endFacing": "RF",
                        "lowSize": 2,
                        "highSize": 24,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR.FIN",
                        "dimensionStandard": "API - 600",
                        "material": "A216 GR.WCB, 13% CR. TRIM",
                        "unit": "Nos",
                        "sourcePage": 74
                  },
                  {
                        "id": "valve-globe-rf",
                        "group": "Valves",
                        "item": "Globe Valve",
                        "type": "GLOBE",
                        "endFacing": "RF",
                        "lowSize": 2,
                        "highSize": 12,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR.FIN",
                        "dimensionStandard": "BS - 1873",
                        "material": "A216 GR.WCB, 13% CR. TRIM",
                        "unit": "Nos",
                        "sourcePage": 74
                  },
                  {
                        "id": "valve-check-rf",
                        "group": "Valves",
                        "item": "Check Valve",
                        "type": "CHECK",
                        "endFacing": "RF",
                        "lowSize": 2,
                        "highSize": 24,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR.FIN",
                        "dimensionStandard": "BS - 1868",
                        "material": "A216 GR.WCB, 13% CR. TRIM",
                        "unit": "Nos",
                        "sourcePage": 74
                  },
                  {
                        "id": "valve-ball-rf",
                        "group": "Valves",
                        "item": "Ball Valve",
                        "type": "BALL",
                        "endFacing": "RF",
                        "lowSize": 0.5,
                        "highSize": 16,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR.FIN",
                        "dimensionStandard": "BS - 5351",
                        "material": "A105 SEAT; SEAT PIPE TRIM",
                        "unit": "Nos",
                        "sourcePage": 74
                  },
                  {
                        "id": "stud-bolts",
                        "group": "Bolting",
                        "item": "Stud with Nuts",
                        "type": "STUD + NUTS",
                        "endFacing": "-",
                        "lowSize": 0.5,
                        "highSize": 28,
                        "schThkRating": "-",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 18.2",
                        "material": "A193 GR.B7 / A194 GR.2H",
                        "unit": "Nos",
                        "sourcePage": 74,
                        "note": "MVP stores bolt material only. Automatic bolt size/count calculation is a future feature."
                  },
                  {
                        "id": "gasket-spiral-0-24",
                        "group": "Gasket",
                        "item": "Gasket",
                        "type": "SPIRAL",
                        "endFacing": "-",
                        "lowSize": 0.5,
                        "highSize": 24,
                        "schThkRating": "2MM",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 16.21",
                        "material": "IS - 2712 - GR. 0/1",
                        "unit": "Nos",
                        "sourcePage": 74
                  },
                  {
                        "id": "gasket-spiral-26-28",
                        "group": "Gasket",
                        "item": "Gasket",
                        "type": "SPIRAL",
                        "endFacing": "-",
                        "lowSize": 26,
                        "highSize": 28,
                        "schThkRating": "2MM",
                        "faceFinishRadius": "",
                        "dimensionStandard": "API - 605",
                        "material": "IS - 2712 - GR. 0/1",
                        "unit": "Nos",
                        "sourcePage": 74
                  },
                  {
                        "id": "perm-strainer-sw",
                        "group": "Trap/Strainer",
                        "item": "Permanent Strainer",
                        "aliases": [
                              "Strainer Perm",
                              "Strainer Temp"
                        ],
                        "type": "PERM STR",
                        "endFacing": "SW",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "800 #",
                        "faceFinishRadius": "Y TYPE",
                        "dimensionStandard": "MNF'STD",
                        "material": "B: A105; INT: SS304",
                        "unit": "Nos",
                        "sourcePage": 74
                  },
                  {
                        "id": "perm-strainer-bw-2-14",
                        "group": "Trap/Strainer",
                        "item": "Permanent Strainer",
                        "aliases": [
                              "Strainer Perm",
                              "Strainer Temp"
                        ],
                        "type": "PERM STR",
                        "endFacing": "BW",
                        "lowSize": 2,
                        "highSize": 14,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "Y TYPE",
                        "dimensionStandard": "EIL'STD",
                        "material": "B: A234 GR.WPB; INT: SS304",
                        "unit": "Nos",
                        "sourcePage": 74
                  },
                  {
                        "id": "perm-strainer-bw-16-28",
                        "group": "Trap/Strainer",
                        "item": "Permanent Strainer",
                        "aliases": [
                              "Strainer Perm",
                              "Strainer Temp"
                        ],
                        "type": "PERM STR",
                        "endFacing": "BW",
                        "lowSize": 16,
                        "highSize": 28,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "Y TYPE",
                        "dimensionStandard": "EIL'STD",
                        "material": "B: A234 GR.WPCW; INT: SS304",
                        "unit": "Nos",
                        "sourcePage": 74
                  }
            ]
      },
      "A21A": {
            "pipeClass": "A21A",
            "source": {
                  "document": "Piping Mat. Specification#NRL.pdf",
                  "sheets": [
                        "A21A sheet 2 of 3",
                        "A21A sheet 3 of 3"
                  ],
                  "pages": [
                        161,
                        162
                  ],
                  "note": "MVP data manually structured from A21A material specification rows. Verify against source PDF before procurement issue."
            },
            "items": [
                  {
                        "id": "pipe-seamless-small",
                        "group": "Pipes",
                        "item": "Pipe",
                        "type": "Pipe (Seamless)",
                        "endFacing": "PE",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "XS",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 36.10",
                        "material": "API 5L GR.B",
                        "unit": "M",
                        "sourcePage": 161
                  },
                  {
                        "id": "pipe-seamless-2-6",
                        "group": "Pipes",
                        "item": "Pipe",
                        "type": "Pipe (Seamless)",
                        "endFacing": "BE",
                        "lowSize": 2,
                        "highSize": 6,
                        "schThkRating": "STD",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 36.10",
                        "material": "API 5L GR.B",
                        "unit": "M",
                        "sourcePage": 161
                  },
                  {
                        "id": "pipe-seamless-8-12",
                        "group": "Pipes",
                        "item": "Pipe",
                        "type": "Pipe (Seamless)",
                        "endFacing": "BE",
                        "lowSize": 8,
                        "highSize": 12,
                        "schThkRating": "S20",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 36.10",
                        "material": "API 5L GR.B",
                        "unit": "M",
                        "sourcePage": 161
                  },
                  {
                        "id": "pipe-seamless-14",
                        "group": "Pipes",
                        "item": "Pipe",
                        "type": "Pipe (Seamless)",
                        "endFacing": "BE",
                        "lowSize": 14,
                        "highSize": 14,
                        "schThkRating": "S10",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 36.10",
                        "material": "API 5L GR.B",
                        "unit": "M",
                        "sourcePage": 161
                  },
                  {
                        "id": "pipe-efsw-16-24",
                        "group": "Pipes",
                        "item": "Pipe",
                        "type": "Pipe (E.F.S.W.)",
                        "endFacing": "BE",
                        "lowSize": 16,
                        "highSize": 24,
                        "schThkRating": "6.00 mm",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 36.10",
                        "material": "ASTM A 672 GRC70 CL12",
                        "unit": "M",
                        "sourcePage": 161
                  },
                  {
                        "id": "flange-wn-0-5-24",
                        "group": "Flanges",
                        "item": "W.N. Flange",
                        "aliases": [
                              "Flange"
                        ],
                        "type": "WN",
                        "endFacing": "RF",
                        "lowSize": 0.5,
                        "highSize": 24,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR.FIN",
                        "dimensionStandard": "B - 16.5",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 161
                  },
                  {
                        "id": "flange-blind-0-5-24",
                        "group": "Flanges",
                        "item": "Blind Flange",
                        "type": "BLIND",
                        "endFacing": "RF",
                        "lowSize": 0.5,
                        "highSize": 24,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR.FIN",
                        "dimensionStandard": "B - 16.5",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 161
                  },
                  {
                        "id": "fig8-flange",
                        "group": "Flanges",
                        "item": "Figure 8 Flange",
                        "aliases": [
                              "FLNG.FIG.8"
                        ],
                        "type": "FIG.8.FL",
                        "endFacing": "FF",
                        "lowSize": 0.5,
                        "highSize": 8,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR.FIN",
                        "dimensionStandard": "API - 590",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 161
                  },
                  {
                        "id": "spacer-blind-10-24",
                        "group": "Flanges",
                        "item": "SPCR & BLN",
                        "type": "SPCR & BLN",
                        "endFacing": "FF",
                        "lowSize": 10,
                        "highSize": 24,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR.FIN",
                        "dimensionStandard": "API - 590",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 161
                  },
                  {
                        "id": "fitting-sw-0-5-1-5",
                        "group": "Fittings",
                        "item": "Fitting",
                        "aliases": [
                              "Elbow 90 deg.",
                              "Elbow 45 deg.",
                              "Equal Tee",
                              "Red. Tee",
                              "Reducing Tee",
                              "Coupling",
                              "CPLNG.FULL",
                              "CPLNG.HALF",
                              "CPLNG.LH",
                              "CPLNG.RED",
                              "SWAGE.CONC",
                              "SWAGE.ECC"
                        ],
                        "type": "SW",
                        "endFacing": "SW",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "3000 #",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 16.11",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 161
                  },
                  {
                        "id": "fitting-bw-2-14",
                        "group": "Fittings",
                        "item": "Fitting",
                        "aliases": [
                              "Elbow 90 deg.",
                              "Elbow 45 deg.",
                              "Equal Tee",
                              "Red. Tee",
                              "Reducing Tee",
                              "Con. Reducer",
                              "Ecc. Reducer"
                        ],
                        "type": "BW",
                        "endFacing": "BW",
                        "lowSize": 2,
                        "highSize": 14,
                        "schThkRating": "As per matching pipe",
                        "faceFinishRadius": "R = 1.50",
                        "dimensionStandard": "B - 16.9",
                        "material": "ASTM A234 GR.WPB",
                        "unit": "Nos",
                        "sourcePage": 161
                  },
                  {
                        "id": "fitting-bw-16-24",
                        "group": "Fittings",
                        "item": "Fitting",
                        "aliases": [
                              "Elbow 90 deg.",
                              "Elbow 45 deg.",
                              "Equal Tee",
                              "Red. Tee",
                              "Reducing Tee",
                              "Con. Reducer",
                              "Ecc. Reducer"
                        ],
                        "type": "BW",
                        "endFacing": "BW",
                        "lowSize": 16,
                        "highSize": 24,
                        "schThkRating": "As per matching pipe",
                        "faceFinishRadius": "R = 1.50",
                        "dimensionStandard": "B - 16.9",
                        "material": "ASTM A234 GR.WPCW",
                        "unit": "Nos",
                        "sourcePage": 161
                  },
                  {
                        "id": "caps-scrf",
                        "group": "Fittings",
                        "item": "Cap",
                        "aliases": [
                              "CAP"
                        ],
                        "type": "SCRF",
                        "endFacing": "SCRF",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "3000 #",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 16.11",
                        "material": "ASTM A105",
                        "unit": "Nos",
                        "sourcePage": 161
                  },
                  {
                        "id": "valve-gate-sw",
                        "group": "Valves",
                        "item": "Gate Valve",
                        "type": "GATE",
                        "endFacing": "SW",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "800 #",
                        "faceFinishRadius": "",
                        "dimensionStandard": "API - 602",
                        "material": "BODY- A105, TRIM-13%CR",
                        "unit": "Nos",
                        "sourcePage": 162
                  },
                  {
                        "id": "valve-globe-sw",
                        "group": "Valves",
                        "item": "Globe Valve",
                        "type": "GLOBE",
                        "endFacing": "SW",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "800 #",
                        "faceFinishRadius": "",
                        "dimensionStandard": "BS - 5352",
                        "material": "BODY- A105, TRIM-13%CR",
                        "unit": "Nos",
                        "sourcePage": 162
                  },
                  {
                        "id": "valve-check-sw",
                        "group": "Valves",
                        "item": "Check Valve",
                        "type": "CHECK",
                        "endFacing": "SW",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "800 #",
                        "faceFinishRadius": "",
                        "dimensionStandard": "BS - 5352",
                        "material": "BODY- A105, TRIM-13%CR",
                        "unit": "Nos",
                        "sourcePage": 162
                  },
                  {
                        "id": "valve-needle-sw",
                        "group": "Valves",
                        "item": "Needle Valve",
                        "type": "NEEDLE",
                        "endFacing": "SW",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "800 #",
                        "faceFinishRadius": "",
                        "dimensionStandard": "BS - 5352",
                        "material": "BODY- A105, TRIM-13%CR",
                        "unit": "Nos",
                        "sourcePage": 162
                  },
                  {
                        "id": "valve-plug-rf",
                        "group": "Valves",
                        "item": "Plug Valve",
                        "type": "PLUG",
                        "endFacing": "RF",
                        "lowSize": 0.5,
                        "highSize": 8,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR.FIN",
                        "dimensionStandard": "BS - 5353",
                        "material": "BODY- A105, HARD PLUG",
                        "unit": "Nos",
                        "sourcePage": 162
                  },
                  {
                        "id": "valve-ball-rf",
                        "group": "Valves",
                        "item": "Ball Valve",
                        "type": "BALL",
                        "endFacing": "RF",
                        "lowSize": 0.5,
                        "highSize": 16,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR.FIN",
                        "dimensionStandard": "BS - 5351",
                        "material": "BODY- A105, 13%CR BALL",
                        "unit": "Nos",
                        "sourcePage": 162
                  },
                  {
                        "id": "valve-gate-rf",
                        "group": "Valves",
                        "item": "Gate Valve",
                        "type": "GATE",
                        "endFacing": "RF",
                        "lowSize": 2,
                        "highSize": 24,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR.FIN",
                        "dimensionStandard": "API - 600",
                        "material": "BODY- A216GRWCB, 13%CR.T",
                        "unit": "Nos",
                        "sourcePage": 162
                  },
                  {
                        "id": "valve-globe-rf",
                        "group": "Valves",
                        "item": "Globe Valve",
                        "type": "GLOBE",
                        "endFacing": "RF",
                        "lowSize": 2,
                        "highSize": 12,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR.FIN",
                        "dimensionStandard": "BS - 1873",
                        "material": "BODY- A216GRWCB, 13%CR.T",
                        "unit": "Nos",
                        "sourcePage": 162,
                        "note": "Source PDF row label appears as CHECK, but BS - 1873 corresponds to Globe valve logic. Verify before procurement issue."
                  },
                  {
                        "id": "valve-check-rf",
                        "group": "Valves",
                        "item": "Check Valve",
                        "type": "CHECK",
                        "endFacing": "RF",
                        "lowSize": 2,
                        "highSize": 24,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "SERR.FIN",
                        "dimensionStandard": "BS - 1868",
                        "material": "BODY- A216GRWCB, 13%CR.T",
                        "unit": "Nos",
                        "sourcePage": 162
                  },
                  {
                        "id": "stud-bolts",
                        "group": "Bolting",
                        "item": "Stud with Nuts",
                        "type": "STUD + NUTS",
                        "endFacing": "-",
                        "lowSize": 0.5,
                        "highSize": 24,
                        "schThkRating": "-",
                        "faceFinishRadius": "",
                        "dimensionStandard": "B - 18.2",
                        "material": "A193 GR.B7 / A194 GR.2H",
                        "unit": "Nos",
                        "sourcePage": 162,
                        "note": "MVP stores bolt material only. Automatic bolt size/count calculation is a future feature."
                  },
                  {
                        "id": "gasket-spiral-0-5-24",
                        "group": "Gasket",
                        "item": "Gasket",
                        "type": "SPIRAL",
                        "endFacing": "-",
                        "lowSize": 0.5,
                        "highSize": 24,
                        "schThkRating": "5 mm",
                        "faceFinishRadius": "",
                        "dimensionStandard": "API - 601",
                        "material": "SS304; SPR.WND + CA FIL",
                        "unit": "Nos",
                        "sourcePage": 162
                  },
                  {
                        "id": "trap-rf",
                        "group": "Trap/Strainer",
                        "item": "Trap",
                        "type": "TRAP",
                        "endFacing": "RF",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "THRMDNMC",
                        "dimensionStandard": "MNF'STD",
                        "material": "B: A105; T: 13%CR; SS304",
                        "unit": "Nos",
                        "sourcePage": 162,
                        "aliases": [
                              "Trap Steam"
                        ]
                  },
                  {
                        "id": "perm-strainer-sw",
                        "group": "Trap/Strainer",
                        "item": "Permanent Strainer",
                        "type": "PERM STR",
                        "endFacing": "SW",
                        "lowSize": 0.5,
                        "highSize": 1.5,
                        "schThkRating": "800 #",
                        "faceFinishRadius": "Y TYPE",
                        "dimensionStandard": "MNF'STD",
                        "material": "B: A105; INT: SS304",
                        "unit": "Nos",
                        "sourcePage": 162,
                        "aliases": [
                              "Strainer Perm",
                              "Strainer Temp"
                        ]
                  },
                  {
                        "id": "perm-strainer-bw-2-14",
                        "group": "Trap/Strainer",
                        "item": "Permanent Strainer",
                        "type": "PERM STR",
                        "endFacing": "BW",
                        "lowSize": 2,
                        "highSize": 14,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "Y TYPE",
                        "dimensionStandard": "EIL'STD",
                        "material": "B: A234 GR.WPB; INT: SS304",
                        "unit": "Nos",
                        "sourcePage": 162,
                        "aliases": [
                              "Strainer Perm",
                              "Strainer Temp"
                        ]
                  },
                  {
                        "id": "perm-strainer-bw-16-24",
                        "group": "Trap/Strainer",
                        "item": "Permanent Strainer",
                        "type": "PERM STR",
                        "endFacing": "BW",
                        "lowSize": 16,
                        "highSize": 24,
                        "schThkRating": "150 #",
                        "faceFinishRadius": "Y TYPE",
                        "dimensionStandard": "EIL'STD",
                        "material": "B: A234 GR.WPB; INT: SS304",
                        "unit": "Nos",
                        "sourcePage": 162,
                        "aliases": [
                              "Strainer Perm",
                              "Strainer Temp"
                        ]
                  }
            ]
      }
};

    async function initApp() {
      syncProjectTextWithPipeClass();
      await loadWnFlangeData();
      await loadSlipOnBlindFlangeData();
      await loadPipeClassData(pipeClassSelect.value);
      fillGroupSelect();
      renderCatalogRows();
      renderAll();
    }

    function syncProjectTextWithPipeClass() {
      document.getElementById('referenceDoc').value = `PMS for NRL - Piping Class ${pipeClassSelect.value}`;
      syncExportFileName();
    }

    function syncExportFileName() {
      const mocJobNo = document.getElementById('clientName').value.trim();
      const mocSuffix = mocJobNo ? `_${mocJobNo}` : '';
      document.getElementById('exportFileName').value = `${pipeClassSelect.value}_Piping_BOM_MTO${mocSuffix}`;
    }

    async function loadWnFlangeData() {
      if (window.WN_FLANGE_DATA && Array.isArray(window.WN_FLANGE_DATA)) {
        wnFlangeRecords = JSON.parse(JSON.stringify(window.WN_FLANGE_DATA));
      }

      try {
        const response = await fetch('Piping_Data/wn_flanges_data_0_5_to_48.json', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Could not read WN flange data');
        }
        const flangeData = await response.json();
        wnFlangeRecords = Array.isArray(flangeData.records) ? flangeData.records : [];
      } catch (error) {
        if (!wnFlangeRecords.length) {
          wnFlangeRecords = [];
        }
      }
    }

    async function loadSlipOnBlindFlangeData() {
      if (window.SLIP_ON_BLIND_FLANGE_DATA && Array.isArray(window.SLIP_ON_BLIND_FLANGE_DATA)) {
        slipOnBlindFlangeRecords = JSON.parse(JSON.stringify(window.SLIP_ON_BLIND_FLANGE_DATA));
      }

      try {
        const response = await fetch('Piping_Data/slip_on_blind_flanges_data.json', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Could not read slip-on/blind flange data');
        }
        const flangeData = await response.json();
        slipOnBlindFlangeRecords = Array.isArray(flangeData.records) ? flangeData.records : [];
      } catch (error) {
        if (!slipOnBlindFlangeRecords.length) {
          slipOnBlindFlangeRecords = [];
        }
      }
    }

    async function loadPipeClassData(pipeClass) {
      try {
        const response = await fetch(pipeClassFiles[pipeClass], { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`Could not read ${pipeClassFiles[pipeClass]}`);
        }
        specData = await response.json();
        specLoadFailed = false;
        dataStatus.textContent = `${specData.pipeClass || pipeClass} data loaded`;
      } catch (error) {
        specData = getEmbeddedFallback(pipeClass);
        specLoadFailed = !specData.items.length;
        dataStatus.textContent = specLoadFailed
          ? `${pipeClass} data file not loaded`
          : `${specData.pipeClass || pipeClass} data loaded from backup`;
      }

      if (pipeClass === 'B1F') {
        const unavailableGroups = new Set(['Pipes', 'Flanges', 'Fittings']);
        specData.items = specData.items.filter((item) => !unavailableGroups.has(item.group));
      }

      sourceText.textContent = `Source: ${specData.source.document}.`;
      renderSpecNotice();
    }

    function renderSpecNotice() {
      if (!specNotice || !specData || pipeClassSelect.value !== 'A4F') {
        if (specNotice) {
          specNotice.innerHTML = '';
        }
        return;
      }

      const noticeText = getA4FSourceNoticeText();
      if (!noticeText) {
        specNotice.innerHTML = '';
        return;
      }

      specNotice.innerHTML = `
        <div class="spec-notice">
          <strong>A4F PMS source limitation</strong>
          ${escapeHtml(noticeText)}
        </div>
      `;
    }

    function getA4FSourceNoticeText() {
      if (!specData || pipeClassSelect.value !== 'A4F') {
        return '';
      }

      const sheets = Array.isArray(specData.source.sheets) ? specData.source.sheets : [];
      const hasProvisionalA1FSource = sheets.some((sheet) => sheet.includes('A1F sheet 2'))
        || sheets.some((sheet) => sheet.includes('A1F sheet 3'));

      if (!hasProvisionalA1FSource) {
        return '';
      }

      return 'A4F sheet 2 of 3 and sheet 3 of 3 are not available in the supplied PMS file. For clarity, this A4F data uses A4F sheet 1 of 3 plus A1F sheet 2 of 3 and A1F sheet 3 of 3 as the nearest available material-table basis. Verify against the controlled A4F PMS before procurement or final issue.';
    }

    function getEmbeddedFallback(pipeClass) {
      if (window.PIPE_SPEC_DATA && window.PIPE_SPEC_DATA[pipeClass]) {
        return JSON.parse(JSON.stringify(window.PIPE_SPEC_DATA[pipeClass]));
      }

      if (embeddedFallbackSpecData[pipeClass]) {
        return JSON.parse(JSON.stringify(embeddedFallbackSpecData[pipeClass]));
      }

      if (pipeClass !== 'A10A') {
        return {
          pipeClass,
          source: {
            document: 'Pipe class JSON file could not be loaded',
            sheets: [],
            pages: [],
            note: 'Run the app through the local server so the browser can read the JSON files.'
          },
          items: []
        };
      }

      // A light fallback is populated from the same rows needed for MVP tests.
      fallbackSpecData.items = [
        row('Pipes', 'Pipe', 'Pipe (Seamless)', 'PE', 0.5, 1.5, 'XS', 'B - 36.10', 'API 5L GR.B', 'M', 75),
        row('Pipes', 'Pipe', 'Pipe (Seamless)', 'BE', 2, 6, 'STD', 'B - 36.10', 'API 5L GR.B', 'M', 75),
        row('Pipes', 'Pipe', 'Pipe (Seamless)', 'BE', 8, 8, 'S20', 'B - 36.10', 'API 5L GR.B', 'M', 75),
        row('Pipes', 'Pipe', 'Pipe (E.R.W.)', 'BE', 10, 12, 'S20', 'B - 36.10', 'API 5L GR.B', 'M', 75),
        row('Pipes', 'Pipe', 'Pipe (E.R.W.)', 'BE', 14, 14, 'S10', 'B - 36.10', 'API 5L GR.B', 'M', 75),
        row('Pipes', 'Pipe', 'Pipe (E.F.S.W.)', 'BE', 16, 24, '6.00 mm', 'B - 36.10', 'API 5L GR.B', 'M', 75),
        row('Pipes', 'Pipe', 'Pipe (E.F.S.W.)', 'BE', 26, 36, '8.00 mm', 'B - 36.10', 'API 5L GR.B', 'M', 75),
        row('Pipes', 'Pipe', 'Pipe (E.F.S.W.)', 'BE', 38, 48, '10.0 mm', 'B - 36.10', 'API 5L GR.B', 'M', 75),
        row('Fittings', 'Fitting', 'SW', 'SW', 0.5, 1.5, '3000 #', 'B - 16.11', 'ASTM A105', 'Nos', 75, ['Elbow 90 deg.', 'Elbow 45 deg.', 'Equal Tee', 'Red. Tee', 'Coupling', 'CPLNG.FULL', 'CPLNG.HALF', 'CPLNG.LH', 'CPLNG.RED', 'SWAGE.CONC', 'SWAGE.ECC']),
        row('Fittings', 'Fitting', 'BW', 'BW', 2, 14, 'As per matching pipe', 'B - 16.9', 'ASTM A234 GR.WPB', 'Nos', 75, ['Elbow 90 deg.', 'Elbow 45 deg.', 'Equal Tee', 'Red. Tee', 'Con. Reducer', 'Ecc. Reducer']),
        row('Fittings', 'Fitting', 'BW', 'BW', 16, 24, 'As per matching pipe', 'B - 16.9', 'ASTM A234 GR.WPCW', 'Nos', 75, ['Elbow 90 deg.', 'Elbow 45 deg.', 'Equal Tee', 'Red. Tee', 'Con. Reducer', 'Ecc. Reducer']),
        row('Fittings', 'Cap', 'SCRF', 'SCRF', 0.5, 1.5, '3000 #', 'B - 16.11', 'ASTM A105', 'Nos', 75, ['CAP']),
        row('Fittings', 'Mitre', 'BW', 'BW', 26, 48, 'As per matching pipe', "EIL'STD", 'API 5L GR.B', 'Nos', 75),
        row('Fittings', 'Reducer', 'BW', 'BW', 26, 48, 'As per matching pipe', "EIL'STD", 'API 5L GR.B', 'Nos', 75, ['Con. Reducer', 'Ecc. Reducer']),
        row('Flanges', 'S.W. Flange', 'SW', 'RF', 0.5, 1.5, '150 #', 'B - 16.5', 'ASTM A105', 'Nos', 75, ['Flange']),
        row('Flanges', 'W.N. Flange', 'WN', 'RF', 2, 24, '150 #', 'B - 16.5', 'ASTM A105', 'Nos', 75, ['Flange']),
        row('Flanges', 'W.N. Flange', 'WN', 'RF', 26, 48, '150 #', 'API - 605', 'ASTM A105', 'Nos', 75, ['Flange']),
        row('Flanges', 'Blind Flange', 'BLIND', 'RF', 0.5, 24, '150 #', 'B - 16.5', 'ASTM A105', 'Nos', 75),
        row('Flanges', 'Blind Flange', 'BLIND', 'RF', 26, 48, '150 #', 'API - 605', 'ASTM A105', 'Nos', 75),
        row('Flanges', 'Figure 8 Flange', 'FIG.8.FL', 'FF', 0.5, 8, '150 #', 'API - 590', 'ASTM A105', 'Nos', 75, ['FLNG.FIG.8']),
        row('Flanges', 'SPCR & BLN', 'SPCR & BLN', 'FF', 10, 24, '150 #', 'API - 590', 'ASTM A105', 'Nos', 75),
        row('Flanges', 'SPCR & BLN', 'SPCR & BLN', 'FF', 26, 48, '150 #', "EIL'STD", 'ASTM A105', 'Nos', 75),
        row('Valves', 'Gate Valve', 'GATE', 'SW', 0.5, 1.5, '800 #', 'API - 602', 'BODY A216 GRWCB, 13%CR,T', 'Nos', 76),
        row('Valves', 'Gate Valve', 'GATE', 'RF', 2, 24, '150 #', 'API - 600', 'BODY A216 GRWCB, 13%CR,T', 'Nos', 76),
        row('Valves', 'Globe Valve', 'GLOBE', 'SW', 0.5, 1.5, '800 #', 'BS - 1873', 'BODY A216 GRWCB, 13%CR,T', 'Nos', 76),
        row('Valves', 'Globe Valve', 'GLOBE', 'RF', 2, 12, '150 #', 'BS - 1873', 'BODY A216 GRWCB, 13%CR,T', 'Nos', 76),
        row('Valves', 'Check Valve', 'CHECK', 'SW', 0.5, 1.5, '800 #', 'BS - 1868', 'BODY A216 GRWCB, 13%CR,T', 'Nos', 76),
        row('Valves', 'Check Valve', 'CHECK', 'RF', 2, 24, '150 #', 'BS - 1868', 'BODY A216 GRWCB, 13%CR,T', 'Nos', 76),
        row('Valves', 'Butterfly Valve', "BIR'FLY", 'WAF', 3, 48, '150 #', 'BS - 5155', 'BODY A216 GRWCB, 13%CR', 'Nos', 76, ["Triple Offset BIR'FLY Valve"]),
        row('Bolting', 'Stud with Nuts', 'STUD + NUTS', '-', 0.5, 48, '-', 'B - 18.2', 'A193 GR.B7 / A194 GR.2H', 'Nos', 76),
        row('Gasket', 'Gasket', 'RING', '-', 0.5, 24, '2MM', 'B - 16.21', 'IS - 2712 - GR. 0/1', 'Nos', 76),
        row('Gasket', 'Gasket', 'RING', '-', 26, 28, '2MM', 'API - 605', 'IS - 2712 - GR. 0/1', 'Nos', 76),
        row('Trap/Strainer', 'Trap', 'TRAP', 'RF', 0.5, 1.5, '150 #', "MNF'STD", 'B: A234 GWPCW; INT: SS304', 'Nos', 76, ['Trap Steam']),
        row('Trap/Strainer', 'Permanent Strainer', 'PERM STR', 'SW', 0.5, 1.5, '800 #', "MNF'STD", 'B: A105; INT: SS304', 'Nos', 76, ['Strainer Perm', 'Strainer Temp']),
        row('Trap/Strainer', 'Permanent Strainer', 'PERM STR', 'BW', 2, 14, '150 #', "EIL'STD", 'B: A234 GRWPB; INT: SS304', 'Nos', 76, ['Strainer Perm', 'Strainer Temp']),
        row('Trap/Strainer', 'Permanent Strainer', 'PERM STR', 'BW', 16, 24, '150 #', "EIL'STD", 'B: A234 GWPCW; INT: SS304', 'Nos', 76, ['Strainer Perm', 'Strainer Temp'])
      ];
      return fallbackSpecData;
    }

    function row(group, item, type, endFacing, lowSize, highSize, schThkRating, dimensionStandard, material, unit, sourcePage, aliases = []) {
      return {
        group,
        item,
        aliases,
        type,
        endFacing,
        lowSize,
        highSize,
        schThkRating,
        faceFinishRadius: '',
        dimensionStandard,
        material,
        unit,
        sourcePage
      };
    }

    function fillGroupSelect() {
      groupSelect.innerHTML = '<option value="">All Groups</option>';
      const groups = Array.from(new Set(getInputCatalog().map((item) => item.group)));
      groups.forEach((group) => {
        const option = document.createElement('option');
        option.value = group;
        option.textContent = group;
        groupSelect.appendChild(option);
      });
      groupSelect.value = 'Pipe Group';
    }

    function getVisibleCatalog() {
      return getInputCatalog().filter((catalogItem) => {
        return !groupSelect.value || catalogItem.group === groupSelect.value;
      });
    }

    function getInputCatalog() {
      const selectedClass = pipeClassSelect.value;
      return baseInputCatalog.filter((catalogItem) => {
        if ((selectedClass === 'A1A' || selectedClass === 'A2A' || selectedClass === 'A3A' || selectedClass === 'A5A' || selectedClass === 'A9A' || selectedClass === 'A21A') && catalogItem.item === 'Nipple') {
          return false;
        }
        if ((selectedClass === 'A2A' || selectedClass === 'A3A' || selectedClass === 'A5A' || selectedClass === 'A9A') && catalogItem.item === 'Plug Valve') {
          return false;
        }
        if (selectedClass === 'A2A' && ['Butterfly Valve', 'Strainer Temp'].includes(catalogItem.item)) {
          return false;
        }
        if (selectedClass === 'A9A' && catalogItem.item === 'Butterfly Valve') {
          return false;
        }
        if (selectedClass === 'A21A' && ['Butterfly Valve', 'Angle Valve'].includes(catalogItem.item)) {
          return false;
        }
        if (selectedClass === 'A3A' && catalogItem.item === 'Stud with Nuts') {
          return false;
        }
        if ((selectedClass === 'A5A' || selectedClass === 'A9A') && catalogItem.item === 'Trap Steam') {
          return false;
        }
        if (catalogItem.classes && !catalogItem.classes.includes(selectedClass)) {
          return false;
        }
        return true;
      });
    }

    function renderCatalogRows() {
      syncVisibleRowsToProject();
      inputBody.innerHTML = '';
      getVisibleCatalog().forEach((catalogItem) => {
        const savedRows = projectRows.filter((row) => row.group === catalogItem.group && row.item === catalogItem.item);
        if (savedRows.length === 0) {
          inputBody.appendChild(createCatalogRow(catalogItem));
          return;
        }
        savedRows.forEach((savedRow) => {
          inputBody.appendChild(createCatalogRow(catalogItem, savedRow));
        });
      });
      renderAll();
    }

    function createCatalogRow(catalogItem, values = {}) {
      const tr = document.createElement('tr');
      tr.dataset.group = catalogItem.group;
      tr.dataset.item = catalogItem.item;
      tr.dataset.unit = catalogItem.unit;
      tr.dataset.minSize = catalogItem.minSize;
      tr.dataset.maxSize = catalogItem.maxSize;

      const itemCell = catalogItem.group === 'Other Group'
        ? '<td><input class="js-custom-item" placeholder="User can type here"></td>'
        : `<td class="item-label">${escapeHtml(catalogItem.item)}</td>`;
      const sizeCell = ['Other Group', 'Bolt Group'].includes(catalogItem.group)
        ? `<td><input class="js-size" type="text" placeholder="User can type here" value="${escapeHtml(values.sizeText ?? '')}"></td>`
        : `<td><select class="js-size">${createSizeOptions(catalogItem)}</select></td>`;
      const unitCell = catalogItem.group === 'Other Group'
        ? `<td><input class="js-unit" type="text" placeholder="User can type here" value="${escapeHtml(values.unit ?? catalogItem.unit ?? '')}"></td>`
        : `<td><input class="js-unit" readonly value="${escapeHtml(catalogItem.unit || '')}"></td>`;

      tr.innerHTML = `
        ${itemCell}
        ${sizeCell}
        <td>
          <input class="js-quantity" type="text" inputmode="decimal" value="${escapeHtml(values.quantity ?? '0')}">
          <div class="row-message js-quantity-message" aria-live="polite"></div>
        </td>
        ${unitCell}
        <td>
          <button class="btn-action btn-add js-add-after" type="button" title="Add row below">+</button>
          <button class="btn-action btn-remove js-remove" type="button" title="Remove row">x</button>
        </td>
      `;

      if (values.sizeText && !['Other Group', 'Bolt Group'].includes(catalogItem.group)) {
        tr.querySelector('.js-size').value = values.sizeText;
      }
      tr.querySelectorAll('input, select, textarea').forEach((field) => {
        if (field.classList.contains('js-quantity')) {
          return;
        }
        field.addEventListener('input', renderAll);
        field.addEventListener('change', renderAll);
        if (catalogItem.group === 'Other Group') {
          field.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              const newRow = addDuplicateRowAfter(tr);
              newRow.querySelector('.js-custom-item').focus();
              renderAll();
            }
          });
        }
      });
      const quantityInput = tr.querySelector('.js-quantity');
      quantityInput.addEventListener('input', (event) => {
        validateQuantityInput(event.target);
        renderAll();
      });
      quantityInput.addEventListener('change', renderAll);
      quantityInput.addEventListener('focus', (event) => {
        if (event.target.value === '0') {
          event.target.value = '';
        }
      });
      quantityInput.addEventListener('blur', (event) => {
        if (event.target.value.trim() === '') {
          event.target.value = '0';
          renderAll();
        }
      });
      quantityInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          const newRow = addDuplicateRowAfter(tr);
          const nextFocusField = catalogItem.group === 'Other Group'
            ? newRow.querySelector('.js-custom-item')
            : newRow.querySelector('.js-size');
          nextFocusField.focus();
          renderAll();
        }
      });
      tr.querySelector('.js-add-after').addEventListener('click', () => {
        addDuplicateRowAfter(tr);
        renderAll();
      });
      tr.querySelector('.js-remove').addEventListener('click', () => {
        tr.remove();
        renderAll();
      });

      return tr;
    }

    function createSizeOptions(catalogItem) {
      let options = '<option value="">Select Size</option>';
      getSupportedSizes(catalogItem)
        .forEach((size) => {
          options += `<option value="${size}">${formatSizeOption(size)}</option>`;
        });
      return options;
    }

    function getSupportedSizes(catalogItem) {
      const selectedClass = pipeClassSelect.value;
      const classMaxSize = catalogItem.item === 'Pipe' && pipeClassSizeLimits[selectedClass]
        ? pipeClassSizeLimits[selectedClass]
        : catalogItem.maxSize;
      const catalogSizes = standardSizes.filter((size) => {
        return size >= catalogItem.minSize && size <= classMaxSize;
      });

      if (!specData || !Array.isArray(specData.items) || !catalogItem.item) {
        return catalogSizes;
      }

      const lookupNames = getItemLookupNames(catalogItem.item);
      const matchingSpecs = specData.items.filter((spec) => {
        return lookupNames.some((lookupName) => {
          const normalizedItem = normalize(lookupName);
          return normalize(spec.item) === normalizedItem ||
            (spec.aliases || []).some((alias) => normalize(alias) === normalizedItem);
        });
      });

      if (matchingSpecs.length === 0) {
        return [];
      }

      const supportedRunSizes = catalogSizes.filter((size) => {
        return matchingSpecs.some((spec) => size >= spec.lowSize && size <= spec.highSize);
      });

      if (catalogItem.item === 'Red. Tee') {
        return getReducingTeeSizes(supportedRunSizes);
      }

      if (catalogItem.item === 'Con. Reducer' || catalogItem.item === 'Ecc. Reducer') {
        return getReducerSizes(supportedRunSizes);
      }

      if (catalogItem.item === 'SWAGE.CONC' || catalogItem.item === 'SWAGE.ECC') {
        return getSwageSizes(supportedRunSizes);
      }

      return supportedRunSizes;
    }

    function formatSizeOption(size) {
      if (typeof size === 'string' && size.includes('x')) {
        return formatCompoundSize(size);
      }
      return `${size}"`;
    }

    function getReducingTeeSizes(runSizes) {
      return runSizes.flatMap((runSize) => {
        return (reducingTeeBranchSizes[runSize] || [])
          .filter((branchSize) => branchSize < runSize)
          .map((branchSize) => `${runSize} x ${runSize} x ${branchSize}`);
      });
    }

    function getReducerSizes(runSizes) {
      return runSizes.flatMap((runSize) => {
        return (reducerSmallEndSizes[runSize] || [])
          .filter((smallEndSize) => smallEndSize < runSize)
          .map((smallEndSize) => `${runSize} x ${smallEndSize}`);
      });
    }

    function getSwageSizes(runSizes) {
      return runSizes.flatMap((runSize) => {
        return (swageSmallEndSizes[runSize] || [])
          .filter((smallEndSize) => smallEndSize < runSize)
          .map((smallEndSize) => `${runSize} x ${smallEndSize}`);
      });
    }

    function getItemLookupNames(itemName) {
      if (itemName === 'Con. Reducer' || itemName === 'Ecc. Reducer') {
        return [itemName, 'Reducing Tee'];
      }
      if (['Stud with Nuts', 'Machine Bolt', 'Machine Bolt with Nut'].includes(itemName)) {
        return ['Stud with Nuts', 'Machine Bolt', 'Machine Bolt with Nut'];
      }
      return [itemName];
    }

    function formatCompoundSize(sizeText) {
      return sizeText
        .split('x')
        .map((part) => `${formatSizeToken(parseSingleSize(part.trim().replace(/"/g, '')))}"`)
        .join(' x ');
    }

    function formatSizeToken(size) {
      const numericSize = Number(size);
      const normalizedSize = Number.isFinite(numericSize) ? numericSize : size;
      const fractionMap = {
        0.5: '1/2',
        0.75: '3/4',
        1.5: '1 1/2'
      };
      return fractionMap[normalizedSize] || String(normalizedSize);
    }

    function addDuplicateRowAfter(sourceRow) {
      const catalogItem = {
        group: sourceRow.dataset.group,
        item: sourceRow.dataset.item,
        unit: sourceRow.dataset.unit,
        minSize: Number(sourceRow.dataset.minSize),
        maxSize: Number(sourceRow.dataset.maxSize)
      };
      const duplicateRow = createCatalogRow(catalogItem);
      sourceRow.parentNode.insertBefore(duplicateRow, sourceRow.nextSibling);
      return duplicateRow;
    }

    function validateQuantityInput(input) {
      const originalValue = input.value;
      let cleanedValue = originalValue.replace(/[^0-9.]/g, '');
      const firstDotIndex = cleanedValue.indexOf('.');
      if (firstDotIndex !== -1) {
        cleanedValue = cleanedValue.slice(0, firstDotIndex + 1)
          + cleanedValue.slice(firstDotIndex + 1).replace(/\./g, '');
      }

      if (cleanedValue !== originalValue) {
        input.value = cleanedValue;
        showQuantityMessage(input, 'Enter numeric value');
      }
    }

    function showQuantityMessage(input, message) {
      const messageElement = input.closest('td').querySelector('.js-quantity-message');
      if (!messageElement) {
        return;
      }

      messageElement.textContent = message;
      messageElement.classList.add('show');
      clearTimeout(messageElement.hideTimer);
      messageElement.hideTimer = setTimeout(() => {
        messageElement.textContent = '';
        messageElement.classList.remove('show');
      }, 2000);
    }

    function findCatalogItem(itemName) {
      return getInputCatalog().find((candidate) => candidate.item === itemName);
    }

    function renderAll() {
      const rows = readRows();
      syncVisibleRowsToProject(rows);
      rows.forEach(updateInputRow);
      renderPreview(getProjectPreviewRows(rows));
    }

    function readRows() {
      return Array.from(inputBody.querySelectorAll('tr')).map((tr, index) => {
        const customItemInput = tr.querySelector('.js-custom-item');
        const item = customItemInput ? customItemInput.value.trim() : tr.dataset.item;
        const sizeText = tr.querySelector('.js-size').value.trim();
        const quantity = tr.querySelector('.js-quantity').value.trim();
        const lookup = findSpecMatch(item, sizeText);
        const isCustom = Boolean(customItemInput);
        const isBlank = !item && !sizeText && !quantity;
        return { tr, index: index + 1, item, sizeText, quantity, lookup, isBlank, isCustom };
      });
    }

    function syncVisibleRowsToProject(visibleRows = readRows()) {
      const visibleGroups = new Set(Array.from(inputBody.querySelectorAll('tr')).map((tr) => tr.dataset.group));
      if (visibleGroups.size === 0) {
        return;
      }

      projectRows = projectRows.filter((row) => !visibleGroups.has(row.group));

      visibleRows.forEach((rowData) => {
        if (!rowData.item || (!rowData.sizeText && Number(rowData.quantity) <= 0)) {
          return;
        }
        projectRows.push({
          group: rowData.tr.dataset.group,
          item: rowData.item,
          sizeText: rowData.sizeText,
          quantity: rowData.quantity || '0',
          unit: rowData.tr.querySelector('.js-unit').value || rowData.tr.dataset.unit || '',
          isCustom: rowData.isCustom
        });
      });
    }

    function getProjectPreviewRows(currentVisibleRows) {
      const visibleGroups = new Set(currentVisibleRows.map((row) => row.tr.dataset.group));
      const storedRows = projectRows
        .filter((row) => !visibleGroups.has(row.group))
        .map((row, index) => {
          const lookup = findSpecMatch(row.item, row.sizeText);
          return {
            tr: null,
            index: index + 1,
            item: row.item,
            sizeText: row.sizeText,
            quantity: row.quantity,
            lookup,
            isBlank: false,
            isCustom: row.isCustom,
            storedUnit: row.unit
          };
        });

      return [...storedRows, ...currentVisibleRows];
    }

    function updateInputRow(rowData) {
      const { tr, lookup, quantity } = rowData;
      if (tr.dataset.group === 'Other Group') {
        return;
      }

      clearAutoFields(tr);

      const catalogItem = findCatalogItem(rowData.item);
      if (catalogItem) {
        tr.querySelector('.js-unit').value = catalogItem.unit || '';
      }

      if (!rowData.item || !rowData.sizeText) {
        return;
      }

      if (!lookup.size) {
        return;
      }

      if (lookup.matches.length === 0) {
        return;
      }

      const selected = lookup.matches[0];
      tr.querySelector('.js-unit').value = selected.unit || '';
    }

    function clearAutoFields(tr) {
      tr.querySelector('.js-unit').value = '';
    }

    function findSpecMatch(itemName, sizeText) {
      const size = parseSize(sizeText);
      if (!itemName || !size) {
        return { size, matches: [] };
      }

      if (specLoadFailed || !specData || !Array.isArray(specData.items)) {
        return { size, matches: [] };
      }

      const lookupNames = getItemLookupNames(itemName);
      const matches = specData.items.filter((spec) => {
        const itemMatch = lookupNames.some((lookupName) => {
          const normalizedItem = normalize(lookupName);
          return normalize(spec.item) === normalizedItem ||
            (spec.aliases || []).some((alias) => normalize(alias) === normalizedItem);
        });
        return itemMatch && size >= spec.lowSize && size <= spec.highSize;
      });

      return { size, matches };
    }

    function parseSize(sizeText) {
      if (!sizeText) {
        return null;
      }

      const cleaned = sizeText
        .toLowerCase()
        .replace(/"/g, '')
        .replace(/\s+/g, '')
        .replace(/inch/g, '');

      const pieces = cleaned.split('x').map(parseSingleSize).filter((value) => value !== null);
      if (pieces.length === 0) {
        return null;
      }

      // For reducer and branch sizes like 14x12, the larger diameter controls lookup.
      return Math.max(...pieces);
    }

    function parseSingleSize(value) {
      if (!value) {
        return null;
      }

      if (value.includes('/')) {
        const parts = value.split('/');
        const top = Number(parts[0]);
        const bottom = Number(parts[1]);
        if (bottom > 0) {
          return top / bottom;
        }
        return null;
      }

      const numberValue = Number(value);
      return Number.isFinite(numberValue) ? numberValue : null;
    }

    function getDisplayRating(spec, size) {
      if (spec.schThkRating !== 'As per matching pipe') {
        return spec.schThkRating || '';
      }

      const pipeMatch = specData.items.find((candidate) => {
        return candidate.item === 'Pipe' && size >= candidate.lowSize && size <= candidate.highSize;
      });

      return pipeMatch?.schThkRating || 'As per matching pipe';
    }

    function getAutoStudRowForFlange(rowData, flangeSpec) {
      if (rowData.item !== 'Flange' || !rowData.lookup.size || Number(rowData.quantity) <= 0) {
        return null;
      }

      const flangeRecord = findFlangeBoltRecord(rowData.lookup.size, flangeSpec);
      if (!flangeRecord || !flangeRecord.number_of_bolts_n) {
        return null;
      }

      const studSpec = findStudSpec(rowData.lookup.size) || findA3ABoltingSpec(rowData.lookup.size);
      if (!studSpec) {
        return null;
      }

      const quantity = Number(rowData.quantity) * Number(flangeRecord.number_of_bolts_n);
      const studLength = Number(flangeRecord.stud_length_L_mm);
      const studSize = `${flangeRecord.bolt_thread_bt || ''}${Number.isFinite(studLength) ? ` x ${studLength} mm` : ''}`.trim();

      return {
        item: 'Stud with Nuts (Auto from Flange)',
        sizeText: studSize,
        rating: studSpec.schThkRating || '-',
        material: studSpec.material || '',
        dimensionStandard: studSpec.dimensionStandard || '',
        endFacing: studSpec.endFacing || '',
        quantity: formatCalculatedQuantity(quantity),
        unit: studSpec.unit || 'Nos',
        ...getSourceVerificationAudit(studSpec)
      };
    }

    function findFlangeBoltRecord(size, flangeSpec) {
      const sourceRecords = getFlangeBoltRecords(flangeSpec);
      const rating = normalizeRating(flangeSpec.schThkRating);
      const preferredStandard = normalizeFlangeStandard(flangeSpec.dimensionStandard);
      const preferredType = getPreferredFlangeDataType(flangeSpec);
      const candidates = sourceRecords.filter((record) => {
        const typeMatch = !preferredType || normalize(record.type) === normalize(preferredType);
        return record && typeMatch && Number(record.nps_in) === size && normalizeRating(record.rating_class) === rating;
      });

      if (preferredStandard) {
        const standardMatch = candidates.find((record) => normalize(record.standard).includes(preferredStandard));
        if (standardMatch) {
          return standardMatch;
        }
      }

      return candidates[0] || null;
    }

    function getFlangeBoltRecords(flangeSpec) {
      if (isWnFlange(flangeSpec)) {
        return wnFlangeRecords;
      }
      if (isSlipOnOrBlindFlange(flangeSpec)) {
        return slipOnBlindFlangeRecords;
      }
      return wnFlangeRecords.length ? wnFlangeRecords : slipOnBlindFlangeRecords;
    }

    function getPreferredFlangeDataType(flangeSpec) {
      if (isBlindFlange(flangeSpec)) {
        return 'BLRF';
      }
      if (isSlipOnOrBlindFlange(flangeSpec)) {
        return 'SORF';
      }
      return 'WNRF';
    }

    function isWnFlange(flangeSpec) {
      return normalize(flangeSpec.item).includes('wnflange') || normalize(flangeSpec.type) === 'wn';
    }

    function isBlindFlange(flangeSpec) {
      return normalize(flangeSpec.item).includes('blind') || normalize(flangeSpec.type).includes('blind');
    }

    function isSlipOnOrBlindFlange(flangeSpec) {
      const normalizedItem = normalize(flangeSpec.item);
      const normalizedType = normalize(flangeSpec.type);
      return isBlindFlange(flangeSpec)
        || normalizedItem.includes('soflange')
        || normalizedItem.includes('swflange')
        || normalizedType === 'so'
        || normalizedType === 'sw';
    }

    function findStudSpec(size) {
      const boltingItemNames = getItemLookupNames('Stud with Nuts').map(normalize);
      return specData.items.find((candidate) => {
        const isBoltingMatch = boltingItemNames.includes(normalize(candidate.item)) ||
          (candidate.aliases || []).some((alias) => boltingItemNames.includes(normalize(alias)));
        return isBoltingMatch && size >= candidate.lowSize && size <= candidate.highSize;
      });
    }

    function findA3ABoltingSpec(size) {
      if (pipeClassSelect.value !== 'A3A') {
        return null;
      }

      return specData.items.find((candidate) => {
        return candidate.item === 'Machine Bolt' && size >= candidate.lowSize && size <= candidate.highSize;
      }) || specData.items.find((candidate) => {
        return candidate.item === 'Nut' && size >= candidate.lowSize && size <= candidate.highSize;
      });
    }

    function normalizeRating(value) {
      return String(value || '').replace(/\s+/g, '').replace(/LB$/i, '#').toUpperCase();
    }

    function normalizeFlangeStandard(value) {
      const normalizedValue = normalize(value);
      if (normalizedValue.includes('b165')) {
        return 'ansib165';
      }
      if (normalizedValue.includes('api605')) {
        return 'api605';
      }
      if (normalizedValue.includes('bs3293')) {
        return 'bs3293';
      }
      return '';
    }

    function formatCalculatedQuantity(value) {
      return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, '');
    }

    function hasExportableQuantity(rowData) {
      const quantity = Number(rowData.quantity || 0);
      return Number.isFinite(quantity) && quantity >= 0;
    }

    // Carry source uncertainty into the exported BOM instead of losing it at hand-off.
    function getSourceVerificationAudit(spec) {
      const correction = spec.sourceCorrection;
      return {
        sourceVerificationStatus: spec.verificationStatus === 'needs_review' ? 'Review required'
          : spec.verificationStatus === 'source_checked' ? 'Source checked' : 'Not checked',
        sourceVerificationNote: spec.verificationNote || (correction
          ? `Source page ${correction.sourcePage}: ${correction.reason}`
          : 'No row-level source verification recorded; pricing is not engineering approval.')
      };
    }

    function renderPreview(rows, requireQuantity = false) {
      const validRows = rows.filter((rowData) => {
        if (!rowData.item || !rowData.sizeText) {
          return false;
        }
        return !requireQuantity || hasExportableQuantity(rowData);
      });
      const rowsNeedingReview = getRowsNeedingSpecReview(validRows);
      const matchedRows = validRows.filter((rowData) => rowData.lookup.matches.length > 0);
      const currentPreviewRowKeys = new Set(matchedRows.map(previewRowKey));
      const hasNewPreviewRow = [...currentPreviewRowKeys].some((key) => !lastPreviewRowKeys.has(key));

      if (validRows.length === 0) {
        lastPreviewRowKeys = currentPreviewRowKeys;
        previewArea.innerHTML = specLoadFailed
          ? `<div class="preview-empty">${escapeHtml(pipeClassSelect.value)} data file is not loaded. Open the app through the local server and refresh before preparing the BOM.</div>`
          : '<div class="preview-empty">Add valid BOM rows to preview the final output.</div>';
        return;
      }

      if (specLoadFailed) {
        lastPreviewRowKeys = currentPreviewRowKeys;
        previewArea.innerHTML = `<div class="preview-empty">${escapeHtml(pipeClassSelect.value)} data file is not loaded. Open the app through the local server and refresh before preparing the BOM.</div>`;
        return;
      }

      if (matchedRows.length === 0) {
        lastPreviewRowKeys = currentPreviewRowKeys;
        previewArea.innerHTML = `
          <div class="preview-empty">
            No matching PMS data found for the selected item and size. Check the pipe class, item, and size before export.
          </div>
          ${renderSpecReviewWarning(rowsNeedingReview)}
        `;
        return;
      }

      const sourceNoticeText = getA4FSourceNoticeText();
      const sourceNoticeRow = sourceNoticeText
        ? `<tr><td colspan="11" class="excel-warning"><strong>A4F PMS source limitation:</strong> ${escapeHtml(sourceNoticeText)}</td></tr>`
        : '';

      const headerHtml = `
        <table id="exportTable">
          <tbody>
            <tr><th colspan="11">${escapeHtml(document.getElementById('clientName').value)}</th></tr>
            <tr><td colspan="11">${escapeHtml(document.getElementById('projectTitle').value)}</td></tr>
            <tr><td colspan="11">MOC / Project Description: ${escapeHtml(document.getElementById('mocDescription').value)}</td></tr>
            <tr><td colspan="4">Prepared by: ${escapeHtml(document.getElementById('preparedBy').value)}</td><td colspan="2">Revision: ${escapeHtml(document.getElementById('revision').value)}</td><td colspan="5">Pipe Class: ${escapeHtml(pipeClassSelect.value)}</td></tr>
            <tr><td colspan="11">Reference: ${escapeHtml(document.getElementById('referenceDoc').value)}</td></tr>
            ${sourceNoticeRow}
            <tr>
              <th>Sl. No.</th>
              <th>Items</th>
              <th>Size</th>
              <th>Sch/Thck/Rating</th>
              <th>Material</th>
              <th>Dimension / Design Std</th>
              <th>End / Facing</th>
              <th>Quantity</th>
              <th>Unit (M/NOS)</th>
              <th>Source Verification Status</th>
              <th>Source Verification Note</th>
            </tr>
      `;

      const previewRows = matchedRows.flatMap((rowData) => {
        const spec = rowData.lookup.matches[0];
        const baseRow = {
          item: getPreviewItemName(rowData.item, spec),
          sizeText: formatSize(rowData.sizeText),
          rating: getDisplayRating(spec, rowData.lookup.size),
          material: spec.material || '',
          dimensionStandard: spec.dimensionStandard || '',
          endFacing: spec.endFacing || '',
          quantity: rowData.quantity || '0',
          unit: spec.unit || '',
          ...getSourceVerificationAudit(spec)
        };
        const autoStudRow = getAutoStudRowForFlange(rowData, spec);
        return autoStudRow ? [baseRow, autoStudRow] : [baseRow];
      });

      const bodyHtml = previewRows.map((row, index) => {
        return `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(row.item)}</td>
            <td>${escapeHtml(row.sizeText)}</td>
            <td>${escapeHtml(row.rating)}</td>
            <td>${escapeHtml(row.material)}</td>
            <td>${escapeHtml(row.dimensionStandard)}</td>
            <td>${escapeHtml(row.endFacing)}</td>
            <td>${escapeHtml(row.quantity)}</td>
            <td>${escapeHtml(row.unit)}</td>
            <td>${escapeHtml(row.sourceVerificationStatus)}</td>
            <td>${escapeHtml(row.sourceVerificationNote)}</td>
          </tr>
        `;
      }).join('');

      previewArea.innerHTML = `${renderSpecReviewWarning(rowsNeedingReview)}${headerHtml}${bodyHtml}</tbody></table>`;
      if (hasNewPreviewRow) {
        showPreviewConfirmation();
      }
      lastPreviewRowKeys = currentPreviewRowKeys;
    }

    function getRowsNeedingSpecReview(rows) {
      return rows.filter((rowData) => {
        return rowData.item && rowData.sizeText && rowData.lookup.size && rowData.lookup.matches.length === 0;
      });
    }

    function renderSpecReviewWarning(rows) {
      if (rows.length === 0) {
        return '';
      }

      const details = rows
        .slice(0, 5)
        .map((rowData) => `${rowData.item} ${formatSize(rowData.sizeText)}`)
        .join(', ');
      const more = rows.length > 5 ? `, plus ${rows.length - 5} more` : '';
      return `
        <div class="warning-box show">
          No PMS match for ${escapeHtml(pipeClassSelect.value)}: ${escapeHtml(details + more)}. These rows are excluded from the preview and export.
        </div>
      `;
    }

    function getPreviewItemName(selectedItem, spec) {
      let displayName = selectedItem;
      if (selectedItem === 'Pipe') {
        displayName = spec.type;
      } else if (selectedItem === 'Flange') {
        displayName = spec.item;
      }

      // A1A PMS identifies these two selected items by their face/type code.
      if (pipeClassSelect.value === 'A1A' &&
        ['Trap Steam', 'Strainer Perm'].includes(selectedItem) &&
        spec.faceFinishRadius) {
        displayName = `${selectedItem} (${spec.faceFinishRadius})`;
      }

      if (spec.type && spec.type.includes('(IBR)') && !displayName.includes('(IBR)')) {
        return `${displayName} (IBR)`;
      }

      return displayName;
    }

    function formatSize(sizeText) {
      const text = sizeText.trim();
      if (text.toLowerCase().includes('x')) {
        return formatCompoundSize(text);
      }
      const numericSize = Number(text);
      if (Number.isFinite(numericSize)) {
        return formatSizeOption(numericSize);
      }
      return text.endsWith('"') ? text : `${text}"`;
    }

    function clearRow(tr) {
      const customItemInput = tr.querySelector('.js-custom-item');
      if (customItemInput) {
        customItemInput.value = '';
      }
      tr.querySelector('.js-size').value = '';
      tr.querySelector('.js-quantity').value = '';
      tr.querySelector('.js-unit').value = tr.dataset.unit || '';
    }

    function exportExcel() {
      renderAll();
      const rows = readRows();
      const projectPreviewRows = getProjectPreviewRows(rows);
      const invalidRows = projectPreviewRows.filter((rowData) => {
        if (rowData.isBlank || (!rowData.sizeText && !rowData.quantity)) {
          return false;
        }
        return !hasExportableQuantity(rowData);
      });
      const rowsNeedingReview = getRowsNeedingSpecReview(projectPreviewRows.filter((rowData) => {
        return rowData.item && rowData.sizeText && hasExportableQuantity(rowData);
      }));

      if (invalidRows.length > 0) {
        const proceed = confirm('Some rows need review. Export only valid rows?');
        if (!proceed) {
          return;
        }
      }

      if (rowsNeedingReview.length > 0) {
        alert('Some rows do not match the selected PMS pipe class and cannot be exported. Please correct the item or size before export.');
        renderAll();
        return;
      }

      renderPreview(projectPreviewRows, true);
      const exportTable = document.getElementById('exportTable');
      if (!exportTable) {
        alert('No valid rows are available for export.');
        renderAll();
        return;
      }

      const exportTableForExcel = exportTable.cloneNode(true);
      // Inch descriptions such as 0.5" must not be guessed as Excel dates.
      exportTableForExcel.querySelectorAll('td').forEach((cell) => {
        cell.setAttribute('data-t', 's');
        cell.style.setProperty('mso-number-format', '\\@');
      });
      exportTableForExcel.querySelectorAll('th').forEach((headerCell) => {
        headerCell.setAttribute('bgcolor', '#27608f');
        headerCell.style.backgroundColor = '#27608f';
        headerCell.style.color = '#ffffff';
        headerCell.style.fontWeight = 'bold';
      });

      const html = `
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              table { border-collapse: collapse; font-family: Arial, sans-serif; }
              th, td { border: 1px solid #333; padding: 6px; vertical-align: top; }
              th { background-color: #27608f; color: #ffffff; font-weight: bold; }
              .excel-warning { background: #fff2cc; color: #7a4a00; font-weight: normal; }
            </style>
          </head>
          <body>${exportTableForExcel.outerHTML}</body>
        </html>
      `;
      const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
      const link = document.createElement('a');
      const fileName = sanitizeFileName(document.getElementById('exportFileName').value || `${pipeClassSelect.value}_Piping_BOM_MTO_${document.getElementById('clientName').value.trim()}`);
      link.href = URL.createObjectURL(blob);
      link.download = `${fileName}.xls`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);
      renderAll();
    }

    function sanitizeFileName(value) {
      return value.replace(/[^a-z0-9_-]+/gi, '_').replace(/^_+|_+$/g, '');
    }

    function normalize(value) {
      return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
    }

    function escapeHtml(value) {
      return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    document.getElementById('exportBtn').addEventListener('click', exportExcel);
    document.getElementById('printBtn').addEventListener('click', () => window.print());
    themeToggle.addEventListener('click', toggleTheme);
    groupSelect.addEventListener('change', renderCatalogRows);
    pipeClassSelect.addEventListener('change', async () => {
      projectRows = [];
      syncProjectTextWithPipeClass();
      await loadPipeClassData(pipeClassSelect.value);
      fillGroupSelect();
      groupSelect.value = 'Pipe Group';
      renderCatalogRows();
      renderAll();
    });
    document.querySelectorAll('#projectTitle, #mocDescription, #clientName, #preparedBy, #revision, #referenceDoc').forEach((field) => {
      field.addEventListener('input', renderAll);
    });
    document.getElementById('clientName').addEventListener('input', () => {
      syncExportFileName();
      renderAll();
    });

    applyTheme(localStorage.getItem('pmsBomTheme') || 'light');
    initApp();
