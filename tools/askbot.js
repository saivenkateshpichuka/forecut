/* Ask Forecut: a free help bot for every member. No AI model and no key: it answers from Forecut's own help topics, the page you
   are on, and the site search index. Returns plain text with [links](/path). window.ForecutBot.answer(question) -> Promise<{text}>.
   Later this can be upgraded to an AI model behind the same call. */
(function () {
  'use strict';
  if (window.ForecutBot) return;
  var MAIL = 'hello@forecut.in';
  var TOOLS = [
    ['trend-to-style', 'Trend to Style Brief', 1, 'Arrange collection, mood and accessories boards, then turn a trend detail into an editable style brief.', 'trend brief mood board accessories style idea design direction'],
    ['rangeboard', 'Collection Planner', 1, 'Plan seasonal styles, colourways, sizes, quantities, prices and delivery drops.', 'collection range plan assortment drops colourways quantities'],
    ['style-tracker', 'Style Tracker', 1, 'Track every style from brief to store: status, owner, milestones, samples, approvals and what is blocking you.', 'style status milestones samples approvals critical path blocked'],
    ['swatchsmith', 'Colour Palette Builder', 2, 'Build a season palette from Forecut forecasts or your own colours, and export swatch sheets.', 'colour color palette swatch pantone tcx shade'],
    ['materials-library', 'Fabric & Trims Library', 2, 'Keep every fabric and trim in one library with composition, GSM, width, shrinkage, price, MOQ and lead time.', 'fabric trim material library gsm moq supplier shrinkage'],
    ['textile-calculator', 'Textile Calculator', 2, 'Work out yarn, GSM, weaving, knitting and fabric costing.', 'textile yarn gsm weaving knitting fabric costing calculator weight count'],
    ['textile-processing-studio', 'Textile Processing Studio', 2, 'Plan dyeing, printing, washing and finishing, cost a batch and price a processing route per kg and per metre.', 'dye dyeing print wash finishing process recipe batch'],
    ['size-chart-builder', 'Size Chart Builder', 3, 'Grade your measurements across sizes with your own steps and tolerances.', 'size chart grading measurement tolerance points of measure'],
    ['pattern-maker', 'Garment Studio', 3, 'Draft block patterns, sew them in 3D on a mannequin to check fit, and download patterns for sampling.', 'pattern block 3d drape sew mannequin garment fit toile'],
    ['tech-pack-builder', 'Tech Pack Builder', 4, 'Bring sketches, callouts, materials and measurements into a supplier-ready tech pack.', 'tech pack specification factory bom callout construction'],
    ['fit-qc-studio', 'Fit & QC Studio', 4, 'Run fit sessions and inspections: measure against the graded spec, log issues, set AQL and compare before and after.', 'fit qc quality inspection aql sample defects'],
    ['decoration-cost-estimator', 'Embroidery & Print Cost', 4, 'Estimate the cost per piece of embroidery or print decoration.', 'embroidery print decoration cost per piece'],
    ['pricefold', 'Price & Margin Calculator', 5, 'Calculate product costs, channel fees, returns and the price needed for your target margin.', 'price pricing margin cost gst mrp markup channel returns'],
    ['evenpoint', 'Break-even Calculator', 5, 'Find how many pieces you must sell to cover costs, and the risk of unsold stock.', 'break even order quantity investment sell through risk'],
    ['cutclock', 'Production Calendar', 5, 'Work backward from launch to plan sampling, sourcing, production and delivery.', 'calendar schedule deadline timeline launch production plan'],
    ['care-label-generator', 'Care Label Generator', 6, 'Create a care label from fibre content and care instructions.', 'care label wash symbols composition fibre'],
    ['product-description-writer', 'Product Description Writer', 6, 'Turn verified product facts into editable English or Hindi listing titles, bullets and tags.', 'product description listing title bullets tags hindi'],
    ['export-market-checker', 'Export Market Checker', 6, 'Organise order research by country with official sources and an export checklist.', 'export market country rules compliance shipping checklist']
  ];
  var STEPS = { 1: 'Plan the collection', 2: 'Colour and fabric', 3: 'Pattern and fit', 4: 'Sampling and tech pack', 5: 'Costing and production', 6: 'Labels, listing and export' };
  var FAQ = [
    ['What is Forecut', 'Forecut turns runways, retail and fabric fairs into seasonal fashion forecasts, colour and region reading, plus studio tools that take a trend all the way to a tech pack, costing and export checks. Start at [What we do](/what-we-do) or open the [forecasts](/forecasts/).', 'what is forecut about what do you do'],
    ['Forecasts', 'Forecasts are organised season, then audience, then category, then the report. Seasons live now: SS27, AW27, SS28 and AW28. Open [Forecasts](/forecasts/) and choose a season.', 'forecast report season trend ss27 aw27 ss28 aw28 where find'],
    ['Free or paid', 'Forecut tools are free for registered members, and your work is saved in your browser and synced to your account. For plans, student access or team use, write to ' + MAIL + '.', 'free paid price cost plan subscription how much pay'],
    ['Sign in', 'Use [Sign in](/account) to sign in or create a free account. If a tool shows "Sign in", open it again after you log in.', 'sign in login log in signup sign up register account create'],
    ['Student access', 'Students and alumni can get free access with a code. Open your [account](/account), enter the code, and access switches on by itself. No code? Write to ' + MAIL + '.', 'student alumni college university nift code access free'],
    ['Save my work', 'Every tool saves in this browser as you work and syncs to your account when you are signed in. Link work to a style with the Style box at the top so all tools share it. Use each tool\'s Export buttons for a copy you can send.', 'save saved backup lost data sync export download'],
    ['Styles', 'A style links your work across every tool: pick one in the Style box at the top of any tool, or press **+ New style**. [All styles](/tools) shows them together.', 'style link new style active style multiple tools same'],
    ['Magazine', 'The Forecut magazine is a monthly issue you read like a book, with the month highlights, fashion news, business and brand of the month. Open the [magazine](/magazine/).', 'magazine issue monthly read flip book news'],
    ['Search', 'Press **Ctrl K** (or **Cmd K**) for search, or open [Search](/search) to find any detail, report or article.', 'search find look shortcut ctrl k'],
    ['Services', 'Forecut helps designers, brands, fashion schools and students. See [Services](/services/) for each, and write to ' + MAIL + ' for your case.', 'services designers brands schools students consulting work with you hire custom'],
    ['Contact', 'Email ' + MAIL + '. A real person reads it.', 'contact email help support human reach talk speak phone'],
    ['Install the app', 'On a phone, open forecut.in in your browser and use "Add to Home Screen" to install it like an app. On a computer, use the install icon in the address bar.', 'install app phone home screen pwa mobile android iphone'],
    ['Hindi', 'The Product Description Writer produces English or Hindi listing copy. Most of Forecut is in English.', 'hindi language translate'],
    ['Print or PDF', 'Use each tool\'s export or Print buttons to save a PDF. Forecast reports can be saved from the report page.', 'print pdf download report save'],
    ['AI assistant', 'This is the Forecut help bot: it answers from Forecut\'s own pages and tools, with no AI model. If you have your own Claude or OpenAI key you can add it in settings (the gear) for deeper AI answers about your style data. Forecut never sees the key.', 'ai gpt chatgpt claude key api bot assistant']
  ];
  var STOP = {}; 'a an the is are am i me my to of in on for and or it this that with how do does can what which where when why you your we our please tell about from be at as by if so do get use using want need'.split(' ').forEach(function (w) { STOP[w] = 1; });
  var WEAK = { style: 1, styl: 1, trend: 1, tool: 1, forecut: 1, fashion: 1, collection: 1, collect: 1, work: 1, make: 1, page: 1 };
  function tok(s) { var a = tok0(s), b = a.filter(function (w) { return !WEAK[w]; }); return b.length ? b : a; }
  function tok0(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9ऀ-ॿ ]+/g, ' ').split(/\s+/).filter(function (w) { return w && !STOP[w]; }).map(function (w) { return w.length > 3 ? w.replace(/(ing|ed|es|s|e)$/, '') : w; }); }
  function score(q, text) { var t = tok(text), set = {}; t.forEach(function (w) { set[w] = 1; }); var s = 0; q.forEach(function (w) { if (set[w]) s += 1; }); return s; }
  var IDX = null;
  function index() { if (IDX) return Promise.resolve(IDX); return fetch('/search-index.json').then(function (r) { return r.json(); }).then(function (d) { IDX = d; return d; }).catch(function () { IDX = []; return IDX; }); }
  function pageIntro() {
    var h = document.querySelector('.fx-title h1'), p = document.querySelector('.fx-title p, .fx-sub, .fx-title .fx-sub');
    var how = document.querySelector('details.fx-how, .fx-how, .fx-help'), t = '';
    if (h) t += '**' + h.textContent.trim() + '**\n';
    if (p) t += p.textContent.trim() + '\n';
    if (how) { var x = (how.innerText || '').replace(/\n{2,}/g, '\n').trim(); if (x) t += '\n' + x.slice(0, 900); }
    return t.trim();
  }
  function curTool() { var s = (location.pathname.split('/').pop() || '').replace(/\.html$/, ''); for (var i = 0; i < TOOLS.length; i++) if (TOOLS[i][0] === s) return TOOLS[i]; return null; }
  function nextSteps() {
    var c = curTool(); if (!c) return 'Open [All tools](/tools) and start at step 1, Plan the collection. Steps run: ' + Object.keys(STEPS).map(function (k) { return k + ' ' + STEPS[k]; }).join(', ') + '.';
    var after = TOOLS.filter(function (t) { return t[2] === c[2] + 1; }).slice(0, 3), same = TOOLS.filter(function (t) { return t[2] === c[2] && t[0] !== c[0]; }).slice(0, 2);
    var o = 'You are on **' + c[1] + '**, step ' + c[2] + ' (' + STEPS[c[2]] + ').';
    if (same.length) o += '\nAlso in this step: ' + same.map(function (t) { return '[' + t[1] + '](/' + t[0] + ')'; }).join(', ') + '.';
    if (after.length) o += '\nNext step (' + STEPS[c[2] + 1] + '): ' + after.map(function (t) { return '[' + t[1] + '](/' + t[0] + ')'; }).join(', ') + '.';
    else o += '\nThis is the last step. Review your work in [Style Tracker](/style-tracker).';
    return o;
  }
  function answer(question) {
    var q0 = String(question || '').toLowerCase(), q = tok(question);
    if (!q.length) return Promise.resolve({ text: 'Ask me anything about Forecut, for example "how do I price a style?"' });
    if (/(explain|what is|what does|how (do|to) (i )?use|how does).*(this|page|tool)|^(this|page|tool)\b|explain this/.test(q0)) { var pi = pageIntro(); if (pi) return Promise.resolve({ text: pi }); }
    if (/(next|after this|what now|what should i do|where (do|should) i (go|start)|get started|start)/.test(q0) && q.length < 9) return Promise.resolve({ text: nextSteps() });
    var cands = [];
    TOOLS.forEach(function (t) { var s = score(q, t[1] + ' ' + t[1] + ' ' + t[4]) + score(q, t[3]) * 0.4; if (q0.indexOf(t[1].toLowerCase()) > -1) s += 4; if (s > 0) cands.push({ s: s + 0.01, text: '**' + t[1] + '** (step ' + t[2] + ', ' + STEPS[t[2]] + ')\n' + t[3] + '\nOpen [' + t[1] + '](/' + t[0] + ').' }); });
    FAQ.forEach(function (f) { var s = score(q, f[0] + ' ' + f[0] + ' ' + f[2]) * 1.2; if (q0.indexOf(f[0].toLowerCase()) > -1) s += 3; if (s > 0) cands.push({ s: s, text: f[1] }); });
    cands.sort(function (a, b) { return b.s - a.s; });
    var best = cands[0], strong = best && best.s >= 1;
    return index().then(function (d) {
      var hits = [];
      if (d && d.length) d.forEach(function (x) { var s = score(q, x.n) * 2 + score(q, x.x || '') * 0.5 + (x.c ? score(q, x.c) * 0.3 : 0); if (s >= Math.min(2, q.length)) hits.push({ s: s + (x.t === 'p' || x.t === 'r' || x.t === 'i' ? 0.6 : 0), x: x }); });
      hits.sort(function (a, b) { return b.s - a.s; });
      var seen = {}, isTool = function (u) { var sl = String(u || '').replace(/^\//, '').replace(/\.html.*$/, ''); return TOOLS.some(function (t) { return t[0] === sl; }); }, links = hits.filter(function (h) { var k = h.x.n; if (seen[k]) return false; if (strong && isTool(h.x.u)) return false; seen[k] = 1; return true; }).slice(0, 4).map(function (h) { var u = String(h.x.u || ''); return '- [' + h.x.n + '](' + (/^https?:/.test(u) ? u : '/' + u.replace(/^\//, '')) + ')' + (h.x.x ? ': ' + String(h.x.x).slice(0, 110) : ''); });
      var out = [];
      if (strong) out.push(best.text); else if (best && !links.length) out.push(best.text);
      if (links.length) out.push((out.length ? '\nYou may also want:\n' : 'These pages on Forecut match what you asked:\n') + links.join('\n'));
      if (!out.length) out.push('I could not find that on Forecut. Try different words, press **Ctrl K** to search, or email ' + MAIL + ' and a person will reply.');
      return { text: out.join('\n') };
    });
  }
  window.ForecutBot = { answer: answer, suggestions: function () { var c = curTool(); return [c ? 'Explain this page' : 'What is Forecut?', 'What should I do next?', 'Is Forecut free?', 'How do I save my work?']; } };
})();
