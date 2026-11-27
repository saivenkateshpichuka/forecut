/* Forecut AI assistant (Stage 11). Bring your own key: the person pastes their own Claude (Anthropic) or OpenAI key into
   the settings box here. It is kept only in this browser, is never synced or backed up, and requests go straight from
   the browser to the provider, so Forecut never sees the key or the conversation. The assistant is given the current
   tool's page and the active style's saved work, and is told to use only those facts. window.ForecutAI */
(function () {
  'use strict';
  if (window.ForecutAI) return;
  var KEY = 'fc-ai-key', CFG = 'fc-ai-cfg';
  var PROV = {
    anthropic: { name: 'Claude (Anthropic)', model: 'claude-sonnet-5-5', keyHint: 'sk-ant-…', where: 'console.anthropic.com → API keys' },
    openai: { name: 'OpenAI', model: 'gpt-4.1-mini', keyHint: 'sk-…', where: 'platform.openai.com → API keys' }
  };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function J(k, d) { try { var v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } }
  function cfg() { return Object.assign({ provider: 'anthropic', model: '', context: true }, J(CFG, {})); }
  function key() { try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } }
  function slug() { return (location.pathname.split('/').pop() || '').replace(/\.html$/, ''); }
  var ACTIONS = {
    'tech-pack-builder': ['Check this tech pack for gaps before I send it', 'Draft construction notes from what is here', 'Write an email to the factory requesting the proto sample'],
    'size-chart-builder': ['Check my size chart and grading for mistakes', 'Explain how to measure each point for the factory'],
    'fit-qc-studio': ['Summarise this fit session and the next steps', 'Draft fit comments for the factory'],
    'style-tracker': ['What is blocking my styles, and what should I do first?', 'Write a status update for my buyer'],
    pricefold: ['Explain my margin and what I could change'], evenpoint: ['Explain my break-even and the biggest risk'],
    'product-description-writer': ['Improve this product description without adding claims'],
    'care-label-generator': ['Check my care label wording and symbols'],
    'export-market-checker': ['What should I confirm before shipping to this market?'],
    'materials-library': ['Compare the materials I have for this style'],
    rangeboard: ['Review my collection balance'], cutclock: ['Which steps in my schedule are most at risk?'],
    'trend-to-style': ['Turn this brief into three design directions'], 'textile-processing-studio': ['Explain this dye recipe and what to check with the dyer']
  };
  var DEF = ['Explain this page to me', 'What should I do next on this style?'];
  /* ---------- what the assistant is told ---------- */
  function styleContext() {
    var F = window.ForecutStyle, s = F && F.active && F.active(), out = [];
    if (s) out.push('Active style: ' + s.id + ' · ' + s.name + ' · season ' + s.season + ' · ' + (s.category || '') + ' ' + (s.garment || '') + ' · status ' + s.status + ' · Rev ' + (s.rev || 1) + (window.ForecutRev && ForecutRev.current() ? ' (' + ForecutRev.current().status + ')' : ''));
    var st = J('fc-production-studio-v1', null);
    if (st) {
      var b = st.brief || {}; out.push('Style brief: ' + ['name', 'garment', 'fabric', 'colour', 'collar', 'sleeve', 'trend', 'notes'].map(function (k) { return b[k] ? k + ': ' + b[k] : ''; }).filter(Boolean).join('; '));
      var z = st.size || {}; if ((z.rows || []).length) out.push('Size chart (' + (z.unit || 'cm') + ', ' + (z.mode || '') + ', sizes ' + (z.labels || '') + ', base ' + (z.base || '') + '): ' + z.rows.slice(0, 30).map(function (r) { return (r.code ? r.code + ' ' : '') + r.name + ' base ' + r.base + ' ±' + r.tolerance + ' grade -' + r.down + '/+' + r.up; }).join(' | '));
      var p = st.pack || {}; if ((p.bom || []).length) out.push('Bill of materials: ' + p.bom.slice(0, 40).map(function (r) { return r.item + ' ' + r.quantity + ' ' + r.unit + ' @ ₹' + r.price + (r.supplier ? ' from ' + r.supplier : '') + ' [' + (r.approval || 'Pending') + ']'; }).join(' | '));
      if (p.construction) out.push('Construction notes: ' + String(p.construction).slice(0, 1500));
      if ((p.callouts || []).length) out.push('Callouts: ' + p.callouts.slice(0, 30).map(function (c) { return c.location + ': ' + c.note; }).join(' | '));
      if ((p.qc || []).length) out.push('Quality checkpoints: ' + p.qc.slice(0, 20).map(function (q) { return q.stage + ' – ' + q.point + ': ' + q.standard; }).join(' | '));
      var c = st.care || {}; if (c.shell) out.push('Care label: ' + ['shell', 'lining', 'wash', 'bleach', 'dry', 'iron', 'professional', 'origin', 'market'].map(function (k) { return c[k] ? k + ' ' + c[k] : ''; }).filter(Boolean).join('; '));
    }
    var fq = J('fc-fitqc', null); if (fq && fq.sessions && fq.sessions.length) { var x = fq.sessions[fq.sessions.length - 1]; out.push('Latest fit/QC session: ' + x.type + ' ' + x.date + ' size ' + x.size + ', decision ' + (x.decision || 'none') + '; open issues: ' + x.issues.filter(function (i) { return i.status === 'Open'; }).map(function (i) { return '[' + i.sev + '] ' + i.desc + (i.action ? ' → ' + i.action : ''); }).join(' | ')); }
    var pc = J('fc-pm-cost', null); if (pc && pc.fabricPerGarment) out.push('Garment Studio costing: fabric ' + pc.fabricPerGarment + ' m per garment on ' + pc.fabricWidth + ' cm' + (pc.marker ? ', marker efficiency ' + pc.marker.eff + '%' : '') + (pc.total ? ', cost ₹' + pc.total : ''));
    return out.join('\n');
  }
  function pageContext() {
    var app = document.getElementById('app') || document.querySelector('main'); if (!app) return '';
    var t = (app.innerText || '').replace(/\n{3,}/g, '\n\n').trim(); return t.length > 9000 ? t.slice(0, 9000) + '\n…(page text shortened)' : t;
  }
  function system() {
    var kit = J('fc-brand-kit', {}), tool = (document.querySelector('.fx-title h1') || {}).textContent || document.title.split('|')[0];
    return 'You are the Forecut assistant inside the "' + tool.trim() + '" tool, helping a fashion brand' + (kit.name ? ' (' + kit.name + ')' : '') + ' with product development: trends, design, tech packs, sizing, materials, costing, sampling, quality and export. ' +
      'Rules: Use only the facts in the provided page and style data for anything about this person\'s style or numbers; if something needed is missing, say what is missing instead of guessing. ' +
      'Never invent test results, certifications, prices, supplier names, regulations or measurements. For legal, safety or customs requirements, give general guidance and tell them to confirm with the official source. ' +
      'Money is in Indian rupees (₹) unless the data says otherwise; measurements follow the units in the data. Be concise and practical: short headings, bullet points, and ready-to-use wording when they ask for an email or notes. ' +
      'Do not claim to have changed anything in Forecut; you can only suggest. Write in the same language as the question.';
  }
  /* ---------- calls ---------- */
  function ask(msgs) {
    var c = cfg(), k = key(), P = PROV[c.provider] || PROV.anthropic, model = c.model || P.model;
    if (!k) return Promise.reject(new Error('Add your API key in settings first.'));
    if (c.provider === 'openai') {
      return fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + k }, body: JSON.stringify({ model: model, max_tokens: 1500, messages: [{ role: 'system', content: system() }].concat(msgs) }) })
        .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw apiErr(r.status, j); return { text: j.choices[0].message.content, usage: j.usage ? j.usage.prompt_tokens + ' in · ' + j.usage.completion_tokens + ' out' : '' }; }); });
    }
    return fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': k, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' }, body: JSON.stringify({ model: model, max_tokens: 1500, system: system(), messages: msgs }) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw apiErr(r.status, j); return { text: (j.content || []).filter(function (b) { return b.type === 'text'; }).map(function (b) { return b.text; }).join('\n'), usage: j.usage ? j.usage.input_tokens + ' in · ' + j.usage.output_tokens + ' out' : '' }; }); });
  }
  function apiErr(code, j) { var m = (j && j.error && (j.error.message || j.error.type)) || ''; return new Error(code === 401 ? 'The key was not accepted. Check it in settings.' : code === 429 ? 'The provider says you have hit a rate or spending limit. Wait a moment or check your account.' : code === 404 ? 'That model name was not found for your key. Change it in settings.' : 'The provider returned an error (' + code + '): ' + m); }
  /* ---------- panel ---------- */
  var hist = J('fc-ai-chat-' + slug(), []), open = false, root, list, ta, busy = false;
  function md(t) { var h = esc(t).replace(/\[([^\]]+)\]\(((?:https:\/\/|\/)[^)\s]+)\)/g, '<a href="$2">$1</a>').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`([^`]+)`/g, '<code>$1</code>'); return h.split(/\n/).map(function (l) { if (/^#{1,4}\s/.test(l)) return '<h5>' + l.replace(/^#+\s/, '') + '</h5>'; if (/^\s*[-•*]\s/.test(l)) return '<li>' + l.replace(/^\s*[-•*]\s/, '') + '</li>'; if (/^\s*\d+[.)]\s/.test(l)) return '<li>' + l.replace(/^\s*\d+[.)]\s/, '') + '</li>'; return l ? '<p>' + l + '</p>' : ''; }).join('').replace(/(<li>.*?<\/li>)+/g, function (m) { return '<ul>' + m + '</ul>'; }); }
  function saveHist() { try { sessionStorage.setItem('fc-ai-chat-' + slug(), JSON.stringify(hist.slice(-20))); } catch (e) { } }
  hist = (function () { try { return JSON.parse(sessionStorage.getItem('fc-ai-chat-' + slug()) || '[]'); } catch (e) { return []; } })();
  function draw() {
    var c = cfg(), acts = key() ? (ACTIONS[slug()] || []).concat(DEF) : (window.ForecutBot ? window.ForecutBot.suggestions() : []);
    list.innerHTML = (hist.length ? '' : '<div class="ai-hi"><b>' + (key() ? 'Ask about this page or your style.' : 'Ask Forecut. Free for every member.') + '</b><p>' + (key() ? 'I can see this tool and your active style’s saved work' + (c.context ? '' : ' (turned off in settings)') + '.' : 'Ask how a tool works, where to find something, or what to do next. Answers come from Forecut\u2019s own pages and tools. Have your own Claude or OpenAI key? Add it in settings (the gear) for AI answers about your style data.') + '</p></div>')
      + hist.map(function (m, i) { return '<div class="ai-m ' + m.role + '">' + (m.role === 'user' ? '<p>' + esc(m.show || m.content) + '</p>' : md(m.content) + '<div class="ai-x">' + (m.usage ? '<small>' + esc(m.usage) + ' tokens</small>' : '') + '<button type="button" data-copy="' + i + '">Copy</button></div>') + '</div>'; }).join('')
      + (busy ? '<div class="ai-m assistant ai-busy"><p>Thinking…</p></div>' : '');
    root.querySelector('.ai-acts').innerHTML = acts.map(function (a) { return '<button type="button" data-q="' + esc(a) + '">' + esc(a) + '</button>'; }).join('');
    list.scrollTop = list.scrollHeight;
  }
  function send(q) {
    q = String(q || '').trim(); if (!q || busy) return;
    if (!key()) { if (!window.ForecutBot) { hist.push({ role: 'assistant', content: 'The help bot is still loading. Try again in a moment.' }); draw(); return; } hist.push({ role: 'user', content: q, show: q }); busy = true; draw(); ta.value = ''; window.ForecutBot.answer(q).then(function (r) { hist.push({ role: 'assistant', content: r.text, bot: true }); }).catch(function () { hist.push({ role: 'assistant', content: 'Something went wrong. Email hello@forecut.in and we will help.' }); }).then(function () { busy = false; saveHist(); draw(); }); return; }
    var c = cfg(), content = q;
    if (c.context && !hist.length) content = q + '\n\n--- Current page (' + document.title.split('|')[0].trim() + ') ---\n' + pageContext() + '\n\n--- My style data ---\n' + (styleContext() || 'No active style.');
    hist.push({ role: 'user', content: content, show: q }); busy = true; draw(); ta.value = '';
    ask(hist.map(function (m) { return { role: m.role, content: m.content }; })).then(function (r) { hist.push({ role: 'assistant', content: r.text || '(no answer)', usage: r.usage }); })
      .catch(function (e) { hist.push({ role: 'assistant', content: '⚠ ' + (e.message === 'Failed to fetch' ? 'Could not reach the provider. Check your connection, or whether your network blocks it.' : e.message) }); })
      .then(function () { busy = false; saveHist(); draw(); });
  }
  function settings() {
    var c = cfg(), k = key(), w = document.createElement('div'); w.className = 'ai-set'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-modal', 'true'); w.setAttribute('aria-label', 'Assistant settings');
    w.innerHTML = '<form><h3>Assistant settings</h3><p class="ai-n">Use your own account with an AI provider. You pay them directly for what you use; Forecut adds no charge. Your key is saved only in this browser: it is not synced, not included in backups and never sent to Forecut. Requests go straight from this browser to the provider.</p>'
      + '<label>Provider<select name="p">' + Object.keys(PROV).map(function (p) { return '<option value="' + p + '"' + (p === c.provider ? ' selected' : '') + '>' + PROV[p].name + '</option>'; }).join('') + '</select></label>'
      + '<label>Model<input name="m" value="' + esc(c.model) + '" placeholder="' + esc(PROV[c.provider].model) + '"><small>Leave empty for the default shown, or type any model your key can use.</small></label>'
      + '<label>API key<input name="k" type="password" autocomplete="off" spellcheck="false" placeholder="' + (k ? '•••••• saved (type to replace)' : PROV[c.provider].keyHint) + '"><small>Create one at ' + esc(PROV[c.provider].where) + '. Set a monthly spending limit there.</small></label>'
      + '<label class="ai-cb"><input type="checkbox" name="c"' + (c.context ? ' checked' : '') + '> Send this page and my active style’s data with my first question</label>'
      + '<div class="ai-b"><button type="submit" class="pri">Save</button>' + (k ? '<button type="button" data-rm>Remove key</button>' : '') + '<button type="button" data-cl>Close</button></div></form>';
    document.body.appendChild(w);
    var f = w.querySelector('form'); f.p.onchange = function () { f.m.placeholder = PROV[f.p.value].model; };
    f.onsubmit = function (e) { e.preventDefault(); try { localStorage.setItem(CFG, JSON.stringify({ provider: f.p.value, model: f.m.value.trim(), context: f.c.checked })); if (f.k.value.trim()) localStorage.setItem(KEY, f.k.value.trim()); } catch (x) { } w.remove(); draw(); ta.focus(); };
    w.querySelector('[data-cl]').onclick = function () { w.remove(); }; var rm = w.querySelector('[data-rm]'); if (rm) rm.onclick = function () { if (!confirm('Remove your API key from this browser?')) return; localStorage.removeItem(KEY); w.remove(); draw(); };
    w.addEventListener('keydown', function (e) { if (e.key === 'Escape') w.remove(); }); setTimeout(function () { (k ? f.m : f.k).focus(); }, 30);
  }
  function build() {
    var css = document.createElement('style'); css.textContent = '.ai-fab{position:fixed;right:18px;bottom:18px;z-index:9500;border:0;border-radius:99px;background:#214538;color:#fff;font:700 14px "DM Sans",sans-serif;padding:11px 16px;box-shadow:0 10px 26px rgba(0,0,0,.25);cursor:pointer}.ai-fab span{color:#f3c58a}'
      + '.ai-p{position:fixed;right:18px;bottom:18px;z-index:9600;width:min(420px,calc(100vw - 24px));height:min(640px,calc(100vh - 36px));background:#fffdf8;border:1px solid #e3ddd1;border-radius:16px;box-shadow:0 24px 60px rgba(0,0,0,.3);display:flex;flex-direction:column;font:14px/1.5 "DM Sans",sans-serif;color:#1b1d20}'
      + '.ai-h{display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid #eee7da}.ai-h b{flex:1}.ai-h button{border:0;background:none;cursor:pointer;font-size:16px;color:#555;padding:4px 6px}.ai-l{flex:1;overflow:auto;padding:12px 14px}.ai-hi{background:#f4f8f5;border-radius:12px;padding:10px 12px}.ai-hi p{margin:4px 0 0;color:#555}'
      + '.ai-m{margin:10px 0}.ai-m.user p{background:#214538;color:#fff;border-radius:12px 12px 2px 12px;padding:8px 11px;margin:0 0 0 40px;white-space:pre-wrap}.ai-m.assistant{background:#fff;border:1px solid #ece5d8;border-radius:12px 12px 12px 2px;padding:8px 12px;margin-right:20px}.ai-m.assistant p{margin:4px 0}.ai-m h5{margin:8px 0 2px;font:700 13px "DM Sans",sans-serif}.ai-m ul{margin:4px 0;padding-left:18px}.ai-m code{background:#f1ece2;padding:0 4px;border-radius:4px}.ai-x{display:flex;justify-content:space-between;align-items:center;margin-top:4px}.ai-x small{color:#999}.ai-x button{border:1px solid #ddd;background:#fff;border-radius:6px;font-size:12px;cursor:pointer;padding:2px 8px}.ai-busy p{color:#888}'
      + '.ai-acts{display:flex;gap:6px;overflow-x:auto;padding:8px 14px 0}.ai-acts button{flex:0 0 auto;border:1px solid #d9e3dc;background:#f4f8f5;color:#214538;border-radius:99px;padding:5px 10px;font:600 12px "DM Sans",sans-serif;cursor:pointer;white-space:nowrap}'
      + '.ai-in{display:flex;gap:8px;padding:10px 14px 12px}.ai-in textarea{flex:1;resize:none;border:1px solid #d8d0c3;border-radius:10px;padding:8px 10px;font:14px "DM Sans",sans-serif;min-height:42px;max-height:120px}.ai-in button{border:0;border-radius:10px;background:#214538;color:#fff;font:700 13px "DM Sans",sans-serif;padding:0 14px;cursor:pointer}.ai-f{padding:0 14px 10px;font-size:11px;color:#8a857c}'
      + '.ai-set{position:fixed;inset:0;z-index:10040;background:rgba(20,17,15,.5);display:grid;place-items:center;padding:16px}.ai-set form{background:#fffdf8;border-radius:14px;padding:20px 22px;width:100%;max-width:460px;font:14px/1.5 "DM Sans",sans-serif;display:flex;flex-direction:column;gap:10px}.ai-set h3{margin:0;font:600 22px "Source Serif 4",Georgia,serif}.ai-n{margin:0;color:#555;font-size:13px}.ai-set label{display:flex;flex-direction:column;gap:4px;font-weight:600;font-size:13px}.ai-set small{font-weight:400;color:#777}.ai-set input,.ai-set select{font:14px "DM Sans",sans-serif;padding:8px 10px;border:1px solid #d8d0c3;border-radius:8px}.ai-cb{flex-direction:row!important;align-items:center;font-weight:400!important}.ai-b{display:flex;gap:8px;flex-wrap:wrap}.ai-b button{border:1px solid #d8d0c3;background:#fff;border-radius:8px;padding:8px 14px;font:700 13px "DM Sans",sans-serif;cursor:pointer}.ai-b .pri{background:#214538;color:#fff;border-color:#214538}'
      + '@media (max-width:820px){.ai-fab{bottom:calc(84px + env(safe-area-inset-bottom));right:12px;padding:9px 13px;font-size:13px}}@media print{.ai-fab,.ai-p{display:none!important}}';
    document.head.appendChild(css);
    var fab = document.createElement('button'); fab.type = 'button'; fab.className = 'ai-fab no-print'; fab.innerHTML = '<span>✦</span> Ask Forecut'; fab.setAttribute('aria-label', 'Open Ask Forecut'); document.body.appendChild(fab); if (!window.ForecutBot) { var sc = document.createElement('script'); sc.src = '/tools/askbot.js?v=20261128a'; sc.async = true; document.head.appendChild(sc); } if (document.getElementById('pm-app')) { fab.style.right = 'min(372px, 40vw)'; fab.style.bottom = '38px'; }
    root = document.createElement('div'); root.className = 'ai-p no-print'; root.hidden = true; root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'Forecut AI assistant');
    root.innerHTML = '<div class="ai-h"><b>✦ Ask Forecut</b><button type="button" data-new title="New conversation" aria-label="New conversation">↺</button><button type="button" data-set title="Use my own AI key (optional)" aria-label="Settings">⚙</button><button type="button" data-close aria-label="Close">×</button></div><div class="ai-l" aria-live="polite"></div><div class="ai-acts"></div><form class="ai-in"><textarea rows="1" placeholder="Ask about this page or your style…" aria-label="Your question"></textarea><button type="submit">Send</button></form><div class="ai-f">Answers can be wrong. Check facts, numbers and rules before you use them.</div>';
    document.body.appendChild(root); list = root.querySelector('.ai-l'); ta = root.querySelector('textarea');
    fab.onclick = function () { open = true; root.hidden = false; fab.hidden = true; draw(); ta.focus(); };
    root.querySelector('[data-close]').onclick = function () { open = false; root.hidden = true; fab.hidden = false; fab.focus(); };
    root.querySelector('[data-set]').onclick = settings;
    root.querySelector('[data-new]').onclick = function () { hist = []; saveHist(); draw(); };
    root.querySelector('form').onsubmit = function (e) { e.preventDefault(); send(ta.value); };
    ta.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(ta.value); } if (e.key === 'Escape') root.querySelector('[data-close]').click(); });
    root.addEventListener('click', function (e) { var q = e.target.closest('[data-q]'); if (q) return send(q.dataset.q); var c = e.target.closest('[data-copy]'); if (c) { var m = hist[+c.dataset.copy]; if (m && navigator.clipboard) navigator.clipboard.writeText(m.content).then(function () { c.textContent = 'Copied'; }); } });
  }
  window.ForecutAI = { ask: ask, styleContext: styleContext, open: function () { var f = document.querySelector('.ai-fab'); if (f) f.click(); } };
  if (document.readyState !== 'loading') build(); else document.addEventListener('DOMContentLoaded', build);
})();
