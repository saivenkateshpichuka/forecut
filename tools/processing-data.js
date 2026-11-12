/* Forecut Textile Processing Studio: reference data.
   Dye names are generic Colour Index (C.I.) names, not brand names. Preview colours are approximate screen hues chosen by Forecut.
   Conditions and quantities are typical textbook starting ranges; every process must be confirmed with the dye supplier and a lab dip. */
(function (root) {
  'use strict';
  // fibre -> dye classes that work on it (first = usual choice)
  var FIBRES = {
    'Cotton': ['Reactive', 'Vat', 'Sulphur', 'Direct', 'Indigo', 'Natural', 'Pigment'],
    'Linen': ['Reactive', 'Vat', 'Direct', 'Natural', 'Pigment'],
    'Viscose / rayon': ['Reactive', 'Direct', 'Vat', 'Pigment'],
    'Modal / lyocell': ['Reactive', 'Direct', 'Vat', 'Pigment'],
    'Hemp': ['Reactive', 'Vat', 'Direct', 'Natural', 'Pigment'],
    'Polyester': ['Disperse', 'Pigment'],
    'Nylon (polyamide)': ['Acid', 'Disperse', 'Pigment'],
    'Acrylic': ['Basic', 'Disperse', 'Pigment'],
    'Wool': ['Acid', 'Reactive (wool)', 'Natural', 'Pigment'],
    'Silk': ['Acid', 'Reactive', 'Natural', 'Pigment'],
    'Elastane (in blends)': ['Disperse', 'Acid']
  };

  /* typical exhaust dyeing conditions per class. aux = chemicals in g/L or % owf by shade depth band (light <1%, medium 1–3%, dark >3%) */
  var CLASSES = {
    'Reactive': { fibres: 'Cotton, viscose, linen, modal, silk', temp: 60, tempNote: '60 °C for cold/warm types; 80 °C for hot-brand types', time: 60, ph: '10.5–11 after alkali', lr: 8,
      aux: [['Salt (Glauber’s or common)', 'g/L', [30, 50, 80]], ['Soda ash', 'g/L', [10, 15, 20]], ['Sequestering agent', 'g/L', [1, 1, 1]], ['Levelling agent', 'g/L', [0.5, 1, 1]], ['Soaping agent (wash-off)', 'g/L', [1, 2, 2]]],
      steps: ['Load fabric, add water, sequestrant and levelling agent; run 5 min', 'Add dissolved dye over 10 min', 'Add salt in two or three parts over 20 min', 'Raise to dyeing temperature', 'Add soda ash in parts over 15–20 min', 'Run for fixation (45–60 min)', 'Drain; rinse; soap at 90–95 °C; rinse warm then cold', 'Neutralise with acetic acid if needed; soften'] },
    'Direct': { fibres: 'Cotton, viscose, linen', temp: 90, tempNote: '80–95 °C', time: 45, ph: 'Neutral', lr: 8,
      aux: [['Salt', 'g/L', [5, 10, 20]], ['Soda ash (optional, to help levelling)', 'g/L', [1, 1, 1]], ['Cationic dye-fixing agent (after-treatment)', '% owf', [1, 2, 3]]],
      steps: ['Add dye at 40 °C', 'Raise to 90 °C over 30 min, adding salt in parts', 'Run 45 min, cool to 70 °C', 'Rinse', 'After-treat with fixing agent to improve wet fastness'] },
    'Vat': { fibres: 'Cotton, linen, viscose', temp: 60, tempNote: '50–60 °C depending on dye group', time: 60, ph: '12–13 (reduced)', lr: 8,
      aux: [['Caustic soda', 'g/L', [5, 8, 12]], ['Sodium hydrosulphite (hydros)', 'g/L', [3, 5, 8]], ['Levelling agent', 'g/L', [1, 1, 1]], ['Hydrogen peroxide (oxidation)', 'g/L', [1, 2, 2]], ['Soaping agent', 'g/L', [2, 2, 2]]],
      steps: ['Vat (reduce) the dye with caustic soda and hydros', 'Dye the fabric in the reduced bath', 'Rinse', 'Oxidise with peroxide or air', 'Soap at the boil to develop the true shade', 'Rinse'] },
    'Sulphur': { fibres: 'Cotton (dark, low-cost shades: black, navy, brown)', temp: 85, tempNote: '80–90 °C', time: 45, ph: 'Alkaline', lr: 8,
      aux: [['Reducing agent (sodium sulphide or glucose-based)', 'g/L', [5, 8, 12]], ['Soda ash', 'g/L', [3, 5, 5]], ['Salt', 'g/L', [10, 15, 20]], ['Oxidising agent', 'g/L', [1, 2, 2]]],
      steps: ['Reduce dye', 'Dye at 80–90 °C, adding salt', 'Rinse', 'Oxidise', 'Soap and rinse'] },
    'Indigo': { fibres: 'Cotton (denim warp, hand-dyeing)', temp: 25, tempNote: 'Room temperature to 30 °C', time: 1, ph: '11–12 in the vat', lr: 20,
      aux: [['Caustic soda', 'g/L', [1, 2, 3]], ['Sodium hydrosulphite', 'g/L', [1, 2, 3]]],
      steps: ['Build the reduced vat (yellow-green liquor)', 'Dip fabric 1–2 min without splashing', 'Lift out and air-oxidise 5–10 min until blue', 'Repeat dips for deeper shades', 'Rinse; neutralise; wash'] },
    'Natural': { fibres: 'Cotton, linen, wool, silk', temp: 85, tempNote: '80–90 °C (silk 80 °C)', time: 60, ph: 'Depends on dye', lr: 30,
      aux: [['Tannin pre-mordant (cellulose only, e.g. myrobalan)', '% owf', [8, 10, 12]], ['Alum mordant', '% owf', [10, 15, 20]], ['Iron (to sadden/darken, optional)', '% owf', [0, 1, 2]]],
      steps: ['Scour fabric thoroughly', 'Cellulose: tannin bath, then alum; protein: alum', 'Extract the dye (simmer plant material)', 'Dye at 80–90 °C for 60 min', 'Cool in bath for depth', 'Rinse; wash with a pH-neutral soap'] },
    'Pigment': { fibres: 'All fibres (printing, pad dyeing, garment dye)', temp: 150, tempNote: 'Cure at 150–160 °C for 3–5 min', time: 5, ph: 'Neutral', lr: 0,
      aux: [['Binder', 'g/L', [30, 50, 80]], ['Fixer / cross-linker', 'g/L', [5, 8, 10]], ['Softener', 'g/L', [5, 10, 10]]],
      steps: ['Prepare pad or print paste with pigment, binder and fixer', 'Pad or print', 'Dry', 'Cure at 150–160 °C', 'Check rubbing fastness'] },
    'Disperse': { fibres: 'Polyester, acetate, nylon (pale), elastane blends', temp: 130, tempNote: '130 °C high-temperature (HT) jet; 120–125 °C when elastane is present', time: 45, ph: '4.5–5.5 (acetic acid)', lr: 8,
      aux: [['Dispersing agent', 'g/L', [0.5, 1, 1]], ['Levelling agent', 'g/L', [0.5, 1, 1]], ['Acetic acid (to pH 4.5–5.5)', 'g/L', [0.5, 1, 1]], ['Caustic soda (reduction clearing, dark shades)', 'g/L', [0, 2, 2]], ['Sodium hydrosulphite (reduction clearing)', 'g/L', [0, 2, 2]]],
      steps: ['Set bath at 60 °C with dispersing agent, levelling agent and acid', 'Add dispersed dye', 'Raise 1–2 °C per min to 130 °C', 'Hold 30–60 min', 'Cool to 80 °C, drain', 'Reduction clear at 70–80 °C for medium and dark shades', 'Rinse; neutralise'] },
    'Acid': { fibres: 'Wool, silk, nylon', temp: 98, tempNote: '98 °C for wool and nylon; 85 °C for silk', time: 45, ph: '4–6 (acetic or formic acid)', lr: 15,
      aux: [['Glauber’s salt (levelling)', '% owf', [10, 10, 5]], ['Acetic acid', '% owf', [2, 3, 4]], ['Levelling agent', '% owf', [1, 1, 1]]],
      steps: ['Set bath at 40 °C with salt, acid and levelling agent', 'Add dye', 'Raise slowly to 98 °C (silk 85 °C)', 'Hold 45 min', 'Cool gradually (wool felts with sudden temperature change)', 'Rinse'] },
    'Reactive (wool)': { fibres: 'Wool, silk', temp: 98, tempNote: 'Near boil at pH 4.5–5', time: 60, ph: '4.5–5', lr: 15,
      aux: [['Levelling agent', '% owf', [1, 1, 1]], ['Acetic acid', '% owf', [2, 2, 3]], ['Ammonia (after-clear, pH 8.5)', 'g/L', [1, 1, 2]]],
      steps: ['Set bath with levelling agent and acid', 'Add dye', 'Raise to near boil', 'Hold 60 min', 'After-clear with ammonia at 80 °C', 'Rinse; neutralise'] },
    'Basic': { fibres: 'Acrylic, modacrylic', temp: 98, tempNote: '95–100 °C; slow rise between 75 and 95 °C', time: 45, ph: '4–5', lr: 10,
      aux: [['Retarder (cationic)', '% owf', [2, 1, 0.5]], ['Acetic acid', 'g/L', [1, 1, 1]], ['Glauber’s salt', '% owf', [5, 5, 5]]],
      steps: ['Set bath with retarder, acid and salt', 'Add dye', 'Raise slowly to 98 °C (about 1 °C per 2–3 min above 75 °C)', 'Hold 45 min', 'Cool slowly to avoid creasing'] }
  };

  // generic C.I. names. hex = approximate on-screen hue chosen by Forecut for preview only
  var DYES = [
    ['C.I. Reactive Black 5', 'Reactive', 'Black / navy', '#1d2230'], ['C.I. Reactive Red 195', 'Reactive', 'Red', '#c2213a'], ['C.I. Reactive Yellow 145', 'Reactive', 'Golden yellow', '#e8a91a'],
    ['C.I. Reactive Blue 19', 'Reactive', 'Bright blue', '#1f5fb5'], ['C.I. Reactive Red 120', 'Reactive', 'Red', '#b8203a'], ['C.I. Reactive Blue 21', 'Reactive', 'Turquoise', '#0f8fa0'],
    ['C.I. Reactive Orange 16', 'Reactive', 'Orange', '#e5651e'], ['C.I. Reactive Red 198', 'Reactive', 'Red', '#bd1f3f'], ['C.I. Reactive Blue 222', 'Reactive', 'Navy', '#253a73'],
    ['C.I. Reactive Red 141', 'Reactive', 'Red', '#b31e33'], ['C.I. Reactive Yellow 160', 'Reactive', 'Yellow', '#efc12b'], ['C.I. Reactive Blue 49', 'Reactive', 'Blue', '#2d55a6'],
    ['C.I. Direct Red 81', 'Direct', 'Red', '#c22a3b'], ['C.I. Direct Black 22', 'Direct', 'Black', '#222222'], ['C.I. Direct Yellow 12', 'Direct', 'Yellow', '#f0b72a'],
    ['C.I. Direct Blue 71', 'Direct', 'Blue', '#2c5aa0'], ['C.I. Direct Red 80', 'Direct', 'Red', '#b8273a'], ['C.I. Direct Blue 86', 'Direct', 'Turquoise blue', '#0f78a8'],
    ['C.I. Vat Blue 1 (indigo)', 'Vat', 'Indigo', '#26386b'], ['C.I. Vat Blue 4', 'Vat', 'Blue', '#24418c'], ['C.I. Vat Green 1', 'Vat', 'Green', '#1f6b45'],
    ['C.I. Vat Yellow 2', 'Vat', 'Yellow', '#e2b329'], ['C.I. Vat Brown 1', 'Vat', 'Brown', '#5a3b28'], ['C.I. Vat Orange 1', 'Vat', 'Orange', '#d8681f'],
    ['C.I. Sulphur Black 1', 'Sulphur', 'Black', '#1e1e20'], ['C.I. Sulphur Blue 7', 'Sulphur', 'Navy', '#253050'], ['C.I. Sulphur Brown 10', 'Sulphur', 'Brown', '#5c412d'],
    ['C.I. Natural Blue 1 (indigo)', 'Indigo', 'Indigo', '#2b3d6e'],
    ['Madder root (C.I. Natural Red 8)', 'Natural', 'Red to orange-red', '#b2442f'], ['Cochineal (C.I. Natural Red 4)', 'Natural', 'Crimson to pink', '#a8213f'],
    ['Lac (C.I. Natural Red 25)', 'Natural', 'Crimson', '#9e2537'], ['Turmeric (C.I. Natural Yellow 3)', 'Natural', 'Bright yellow', '#e3b021'],
    ['Weld (C.I. Natural Yellow 2)', 'Natural', 'Lemon yellow', '#d9c43a'], ['Cutch / catechu (C.I. Natural Brown 3)', 'Natural', 'Brown', '#7a4b2c'],
    ['Pomegranate rind', 'Natural', 'Yellow-khaki', '#b59a3e'], ['Myrobalan (harda)', 'Natural', 'Pale yellow; tannin mordant', '#cdb76a'],
    ['Onion skins', 'Natural', 'Orange-gold', '#c8862b'], ['Marigold flowers', 'Natural', 'Yellow-gold', '#d9a326'], ['Indigo leaf (natural vat)', 'Natural', 'Blue', '#2e4778'],
    ['C.I. Disperse Blue 79', 'Disperse', 'Navy', '#232f5c'], ['C.I. Disperse Red 167', 'Disperse', 'Rubine red', '#a4203f'], ['C.I. Disperse Yellow 54', 'Disperse', 'Yellow', '#efc72a'],
    ['C.I. Disperse Orange 30', 'Disperse', 'Orange-brown', '#c35a24'], ['C.I. Disperse Blue 56', 'Disperse', 'Blue', '#2c5ca8'], ['C.I. Disperse Red 60', 'Disperse', 'Pink-red', '#d03a55'],
    ['C.I. Disperse Violet 93', 'Disperse', 'Violet', '#5a3080'], ['C.I. Disperse Yellow 211', 'Disperse', 'Yellow', '#e9b927'], ['C.I. Disperse Blue 165', 'Disperse', 'Turquoise blue', '#1a7aab'],
    ['C.I. Disperse Red 73', 'Disperse', 'Red', '#c42a3a'],
    ['C.I. Acid Blue 25', 'Acid', 'Blue', '#2c4fa0'], ['C.I. Acid Red 1', 'Acid', 'Red', '#cc2b45'], ['C.I. Acid Yellow 17', 'Acid', 'Yellow', '#eec22e'],
    ['C.I. Acid Black 1', 'Acid', 'Blue-black', '#1d2233'], ['C.I. Acid Orange 7', 'Acid', 'Orange', '#e4691f'], ['C.I. Acid Blue 113', 'Acid', 'Navy', '#283a74'],
    ['C.I. Basic Blue 41', 'Basic', 'Blue', '#1f4fa8'], ['C.I. Basic Red 18', 'Basic', 'Red', '#c8273f'], ['C.I. Basic Yellow 28', 'Basic', 'Golden yellow', '#f0b425'],
    ['C.I. Basic Violet 3', 'Basic', 'Violet', '#4b2a8a'],
    ['C.I. Pigment Blue 15:3', 'Pigment', 'Cyan blue', '#1a6fb5'], ['C.I. Pigment Green 7', 'Pigment', 'Green', '#13795b'], ['C.I. Pigment Black 7', 'Pigment', 'Black', '#1b1b1b'],
    ['C.I. Pigment White 6', 'Pigment', 'White', '#f4f4f0'], ['C.I. Pigment Yellow 74', 'Pigment', 'Yellow', '#f2c62a']
  ];

  // two-fibre blends: how to dye them
  var BLENDS = {
    'Cotton|Polyester': 'Two dye classes: disperse for the polyester at 130 °C, then reactive for the cotton at 60 °C (two-bath, or one-bath two-step). Reduction-clear between the stages for dark shades.',
    'Polyester|Viscose / rayon': 'Disperse for polyester at 130 °C, then reactive or direct for viscose. Viscose loses strength when wet: keep tension low.',
    'Cotton|Elastane (in blends)': 'Reactive for cotton. Elastane takes little reactive dye and stays paler; heat-set at no more than about 190 °C.',
    'Elastane (in blends)|Polyester': 'Disperse at 120–125 °C instead of 130 °C to protect the elastane; check stretch recovery after dyeing.',
    'Elastane (in blends)|Nylon (polyamide)': 'Acid dyes at up to 98 °C. Elastane stains lightly; add a levelling agent.',
    'Polyester|Wool': 'Disperse for polyester at 105–110 °C (wool is damaged at 130 °C), then acid dye for wool. A protective agent is usually added.',
    'Cotton|Nylon (polyamide)': 'Acid dyes for nylon and reactive or direct for cotton, in two stages.',
    'Cotton|Linen': 'Both cellulose: one reactive bath dyes both; linen often looks a little lighter and more uneven.',
    'Cotton|Viscose / rayon': 'Both cellulose: one reactive bath. Viscose usually dyes deeper than cotton.',
    'Acrylic|Wool': 'Basic dyes for acrylic and acid dyes for wool; one bath is possible with a compatible auxiliary.',
    'Cotton|Silk': 'Reactive dyes that suit both, or acid for silk and reactive for cotton in two steps.',
    'Polyester|Linen': 'Disperse for polyester at 130 °C, then reactive for linen.'
  };

  /* processing stages. cost = example rate in INR per kg of fabric, labelled as an example in the UI; water in litres per kg */
  var STAGES = [
    ['Pre-treatment', 'Singeing', 1.5, 0, 'Burns off surface fibres for a clean face before dyeing or printing.'],
    ['Pre-treatment', 'Desizing (enzyme)', 3, 10, 'Removes starch size added for weaving.'],
    ['Pre-treatment', 'Scouring', 4, 15, 'Removes natural waxes, oils and dirt so the fabric absorbs evenly.'],
    ['Pre-treatment', 'Bleaching (peroxide)', 5, 15, 'Whitens fabric for pale and bright shades or full white.'],
    ['Pre-treatment', 'Mercerising', 8, 10, 'Caustic treatment of cotton for lustre, strength and deeper dyeing.'],
    ['Pre-treatment', 'Heat-setting (synthetics)', 5, 0, 'Stabilises polyester, nylon and elastane fabrics before dyeing.'],
    ['Dyeing', 'Exhaust dyeing (jet / winch)', 0, 0, 'Uses the dye recipe and cost from the Dye recipe tab.'],
    ['Dyeing', 'Continuous pad dyeing', 18, 8, 'For long runs of one shade.'],
    ['Dyeing', 'Yarn dyeing (package)', 70, 60, 'Dyed before weaving or knitting: stripes, checks, mélange effects.'],
    ['Dyeing', 'Garment dyeing', 60, 60, 'Dyes the sewn garment: soft hand, washed look, small runs.'],
    ['Printing', 'Pigment printing', 25, 2, 'Most common, works on any fibre; slightly stiffer hand.'],
    ['Printing', 'Reactive printing', 35, 20, 'Soft hand on cellulose; needs steaming and washing.'],
    ['Printing', 'Discharge printing', 45, 25, 'Prints light motifs on dark grounds by removing colour.'],
    ['Printing', 'Digital printing (reactive or disperse)', 120, 15, 'Unlimited colours, short runs; priced per metre in practice.'],
    ['Printing', 'Hand block printing', 150, 20, 'Artisan printing; priced per metre or per piece in practice.'],
    ['Washing', 'Enzyme wash', 20, 30, 'Softens and gives a washed look; bio-polish removes surface fuzz.'],
    ['Washing', 'Stone wash (denim)', 30, 40, 'Abrades denim with pumice for contrast and fading.'],
    ['Washing', 'Bleach wash (denim)', 25, 40, 'Lightens denim shade.'],
    ['Washing', 'Silicone softener wash', 10, 15, 'Soft, smooth hand feel.'],
    ['Finishing', 'Softener finish (stenter)', 4, 2, 'Basic soft hand at the stenter.'],
    ['Finishing', 'Resin / easy-care finish', 10, 2, 'Reduces creasing on cotton shirts and trousers.'],
    ['Finishing', 'Water-repellent finish', 18, 2, 'Sheds water; choose PFAS-free chemistry.'],
    ['Finishing', 'Sanforising (compacting)', 4, 0, 'Pre-shrinks cotton to control wash shrinkage.'],
    ['Finishing', 'Peach / brushed finish', 10, 0, 'Raised, suede-like surface.'],
    ['Finishing', 'Calendering', 3, 0, 'Pressed for smoothness and lustre.']
  ];
  root.ForecutProcessing = { FIBRES: FIBRES, CLASSES: CLASSES, DYES: DYES, BLENDS: BLENDS, STAGES: STAGES };
})(window);
