"""Write ../account.html (sign in / sign up / my account) in the shared page style."""
import html
src = open('legal.py').read(); ns = {}; exec(src.split('\nP = ')[0], ns)
HEAD, FOOT = ns['HEAD'], ns['FOOT']
CSS = '''<style>
[hidden]{display:none!important}
.svd{margin:0 0 22px;padding-bottom:18px;border-bottom:1px solid var(--grid)}.svd h2{font:700 20px "DM Sans",sans-serif;margin:0 0 4px}
.svl{display:grid;gap:8px;margin-top:10px}.svi{display:flex;gap:12px;align-items:center;text-decoration:none;color:var(--ink);border:1px solid var(--grid);border-radius:12px;padding:8px;background:var(--paper)}
.svi .ph{width:52px;height:52px;border-radius:8px;background:var(--grid);overflow:hidden;flex:none}.svi img{width:100%;height:100%;object-fit:cover}
.svi b{display:block;font:700 15px "DM Sans",sans-serif}.svi small{color:var(--muted);font:500 12.5px "DM Sans",sans-serif}
.svi button{all:unset;cursor:pointer;margin-left:auto;color:var(--muted);font-size:18px;padding:6px}
.acc{max-width:440px;margin:34px auto 10px;background:var(--paper-2);border:1px solid var(--grid);border-radius:16px;padding:26px 26px 22px}
.acc h1{font-size:30px!important;margin:0 0 6px!important}.acc .sub{color:var(--muted);margin:0 0 18px;font-size:15px}
.tabs{display:grid;grid-template-columns:1fr 1fr;background:var(--paper);border:1px solid var(--grid);border-radius:10px;padding:4px;margin-bottom:18px}
.tabs button{all:unset;cursor:pointer;text-align:center;padding:9px;border-radius:7px;font:600 14.5px "DM Sans",sans-serif;color:var(--muted)}
.tabs button[aria-selected="true"]{background:var(--mat);color:var(--mat-ink)}
.gbtn{all:unset;box-sizing:border-box;cursor:pointer;width:100%;display:flex;align-items:center;justify-content:center;gap:10px;border:1px solid var(--grid);background:#fff;color:#1c1714;border-radius:10px;padding:12px;font:600 15px "DM Sans",sans-serif}
.gbtn:hover{border-color:#1c1714}.gbtn svg{width:18px;height:18px}
.or{display:flex;align-items:center;gap:10px;color:var(--muted);font:600 12px "DM Sans",sans-serif;letter-spacing:.08em;text-transform:uppercase;margin:16px 0}.or::before,.or::after{content:"";flex:1;height:1px;background:var(--grid)}
.f label{display:block;font:600 13px "DM Sans",sans-serif;margin:10px 0 5px}
.f input{box-sizing:border-box;width:100%;font:16px "DM Sans",sans-serif;padding:12px 13px;border-radius:10px;border:1px solid var(--grid);background:var(--paper);color:var(--ink)}
.f input:focus{outline:2px solid var(--chalk);outline-offset:1px}
.go{all:unset;box-sizing:border-box;cursor:pointer;width:100%;text-align:center;margin-top:16px;background:var(--mat);color:var(--mat-ink);border-radius:10px;padding:13px;font:700 15px "DM Sans",sans-serif}
.go[disabled]{opacity:.6;cursor:wait}
.lnk{all:unset;cursor:pointer;color:var(--ink);text-decoration:underline;font:500 13.5px "DM Sans",sans-serif;margin-top:10px;display:inline-block}
.msg{min-height:20px;margin:12px 0 0;font:500 14px "DM Sans",sans-serif}.msg.err{color:#c0392b}.msg.ok{color:#00894a}
.fine{font-size:13px!important;color:var(--muted)!important;margin-top:16px}
.me{display:grid;gap:12px}.me .row{display:flex;align-items:center;gap:14px}.me .av{width:54px;height:54px;border-radius:50%;background:var(--mat);color:var(--mat-ink);display:grid;place-items:center;font:700 22px "DM Sans",sans-serif;overflow:hidden;flex:none}.me .av img{width:100%;height:100%;object-fit:cover}
.me b{font:700 19px "DM Sans",sans-serif;display:block}.me small{color:var(--muted)}
.plan{border:1px solid var(--grid);border-radius:12px;padding:14px;background:var(--paper)}.plan .tg{display:inline-block;font:700 11px "DM Sans",sans-serif;letter-spacing:.06em;text-transform:uppercase;background:linear-gradient(135deg,#00a85a,#1fd17f);color:#fff;padding:4px 9px;border-radius:99px;margin-bottom:6px}
.plan p{margin:4px 0 0;font-size:14.5px!important}
.qk{display:flex;flex-wrap:wrap;gap:8px}.qk a{font:600 13.5px "DM Sans",sans-serif;text-decoration:none;color:var(--ink);border:1px solid var(--grid);border-radius:99px;padding:7px 12px;background:var(--paper)}

.wrap:has(#dash:not([hidden])){max-width:1320px!important}
.dash{max-width:1280px;margin:26px auto 40px;padding:0 4px}
.dh{display:flex;align-items:center;gap:18px;flex-wrap:wrap;padding:22px 24px;border:1px solid var(--grid);border-radius:18px;background:var(--paper-2)}
.dh .av{width:64px;height:64px;border-radius:50%;overflow:hidden;background:var(--mat);color:var(--mat-ink);display:grid;place-items:center;font:700 26px "DM Sans",sans-serif;flex:none}.dh .av img{width:100%;height:100%;object-fit:cover}
.dh .who{flex:1;min-width:200px}.dh .who b{display:block;font:700 22px "DM Sans",sans-serif}.dh .who small{color:var(--muted);font:500 14px "DM Sans",sans-serif}
.chip{display:inline-block;font:700 11px "DM Sans",sans-serif;letter-spacing:.06em;text-transform:uppercase;background:linear-gradient(135deg,#00a85a,#1fd17f);color:#fff;padding:4px 10px;border-radius:99px;margin-top:6px}
.dbtn{all:unset;box-sizing:border-box;cursor:pointer;font:600 14px "DM Sans",sans-serif;padding:10px 16px;border-radius:10px;border:1px solid var(--grid);background:var(--paper);color:var(--ink);display:inline-flex;align-items:center;gap:8px;text-decoration:none}.dbtn:hover{border-color:var(--ink)}.dbtn.pri{background:var(--mat);color:var(--mat-ink);border-color:var(--mat)}.dbtn.sm{padding:7px 12px;font-size:13px}.dbtn.bad{color:#c0392b}
.dg{display:grid;grid-template-columns:230px minmax(0,1fr);gap:22px;margin-top:22px;align-items:start}
.dnav{position:sticky;top:16px;display:grid;gap:4px;padding:10px;border:1px solid var(--grid);border-radius:16px;background:var(--paper-2)}
.dnav button{all:unset;cursor:pointer;display:flex;justify-content:space-between;align-items:center;padding:11px 14px;border-radius:10px;font:600 15px "DM Sans",sans-serif;color:var(--muted)}.dnav button:hover{color:var(--ink);background:var(--paper)}
.dnav button[aria-current=true]{background:var(--mat);color:var(--mat-ink)}.dnav small{font:700 11px "DM Sans",sans-serif;opacity:.75}
.pane{display:grid;gap:18px}.card{border:1px solid var(--grid);border-radius:16px;background:var(--paper-2);padding:20px 22px}.card h2{font:700 19px "DM Sans",sans-serif!important;margin:0 0 4px!important}.card .sub{color:var(--muted);font:14px/1.5 "DM Sans",sans-serif;margin:0 0 14px}
.kpis{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px}.kpi{border:1px solid var(--grid);border-radius:14px;padding:14px 16px;background:var(--paper);text-decoration:none;color:var(--ink)}.kpi span{display:block;color:var(--muted);font:600 12.5px "DM Sans",sans-serif}.kpi b{display:block;font:700 28px "DM Sans",sans-serif;margin-top:4px}.kpi small{color:var(--muted);font:12.5px "DM Sans",sans-serif}
.rec{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px}.rc{display:flex;gap:12px;align-items:center;border:1px solid var(--grid);border-radius:14px;padding:12px;background:var(--paper);text-decoration:none;color:var(--ink)}.rc:hover{border-color:var(--ink)}.rc i{width:42px;height:42px;border-radius:10px;background:var(--mat);color:var(--mat-ink);display:grid;place-items:center;font:700 15px "DM Sans",sans-serif;font-style:normal;flex:none}.rc b{display:block;font:700 15px "DM Sans",sans-serif}.rc small{color:var(--muted);font:12.5px "DM Sans",sans-serif}
.pj{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px}.pc{border:1px solid var(--grid);border-radius:14px;background:var(--paper);overflow:hidden;display:flex;flex-direction:column}.pc .th{height:130px;background:var(--grid);display:flex;overflow:hidden;align-items:center;justify-content:center}.pc .th img{width:100%;height:100%;object-fit:contain;background:#fff}.pc .th span{flex:1;height:100%}.pc .th em{font:700 13px "DM Sans",sans-serif;color:var(--muted);font-style:normal}
.pc .bd{padding:12px 14px;display:grid;gap:4px;flex:1}.pc .bd small.k{font:700 10.5px "DM Sans",sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--chalk)}.pc .bd b{font:700 16px "DM Sans",sans-serif}.pc .bd span{color:var(--muted);font:13.5px "DM Sans",sans-serif}.pc .ft{display:flex;gap:8px;padding:0 14px 14px;flex-wrap:wrap}
.ft2{width:100%;border-collapse:collapse;font:14px "DM Sans",sans-serif}.ft2 th{text-align:left;color:var(--muted);font-weight:600;font-size:12.5px;padding:8px;border-bottom:1px solid var(--grid)}.ft2 td{padding:9px 8px;border-bottom:1px solid var(--grid);vertical-align:middle}.ft2 td:last-child{text-align:right}
.meter{height:10px;border-radius:99px;background:var(--grid);overflow:hidden;margin:8px 0}.meter i{display:block;height:100%;background:linear-gradient(90deg,#00a85a,#e08a5e)}
.bk{display:grid;grid-template-columns:minmax(0,1fr) minmax(300px,440px);gap:18px;align-items:start}.bkf{display:grid;grid-template-columns:1fr 1fr;gap:12px 14px}.bkf .full{grid-column:1/-1}
.bkf label,.bkc label{display:grid;gap:5px;font:600 13px "DM Sans",sans-serif;color:var(--muted)}.bkf input,.bkf select,.bkf textarea{box-sizing:border-box;width:100%;font:15px "DM Sans",sans-serif;padding:10px 12px;border-radius:10px;border:1px solid var(--grid);background:var(--paper);color:var(--ink)}
.bkh{grid-column:1/-1;font:700 12px "DM Sans",sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--chalk);margin:10px 0 0}
.bkc{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}.bkc div{display:grid;gap:6px}.bkc input[type=color]{width:100%;height:54px;border:1px solid var(--grid);border-radius:10px;padding:3px;background:var(--paper);cursor:pointer}.bkc input[type=text]{box-sizing:border-box;width:100%;font:13px ui-monospace,Menlo,monospace;padding:6px 8px;border-radius:8px;border:1px solid var(--grid);background:var(--paper);color:var(--ink);text-transform:uppercase}
.logo-in{display:flex;align-items:center;gap:14px}.logo-in .lb{width:84px;height:84px;border:1px dashed var(--grid);border-radius:12px;display:grid;place-items:center;background:#fff;overflow:hidden}.logo-in .lb img{max-width:100%;max-height:100%;object-fit:contain}
.prev{position:sticky;top:16px;display:grid;gap:14px}.pv-r{background:#fff;color:#1b1d20;border-radius:12px;padding:18px;box-shadow:0 8px 24px rgba(0,0,0,.18)}.pv-r .hd{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid var(--bp);padding-bottom:10px}.pv-r .lg{display:flex;align-items:center;gap:10px}.pv-r .lg img{height:34px;max-width:90px;object-fit:contain}.pv-r .bn{font-size:17px;font-weight:700;color:var(--bp)}.pv-r h3{margin:4px 0 0;font-size:22px}.pv-r small{font-size:11px;color:#777}
.pv-r .sec{margin-top:12px;padding:6px 10px;background:color-mix(in srgb,var(--bp) 10%,white);border-left:3px solid var(--bp);font-weight:700;font-size:13px;color:var(--bp)}.pv-r table{width:100%;border-collapse:collapse;font-size:11.5px;margin-top:8px}.pv-r th{background:var(--bp);color:#fff;text-align:left;padding:5px 7px}.pv-r td{padding:5px 7px;border-bottom:1px solid #eee}
.pv-t{display:flex;gap:14px;align-items:stretch}.tag{width:150px;min-height:230px;border-radius:10px;padding:26px 14px 14px;position:relative;box-shadow:0 8px 24px rgba(0,0,0,.18);display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px}.tag::before{content:"";position:absolute;top:10px;left:50%;width:10px;height:10px;margin-left:-5px;border-radius:50%;background:var(--paper-2)}.tag img{max-width:80px;max-height:50px;object-fit:contain}.tag b{font-size:20px;line-height:1.1}.tag em{font-style:normal;font-size:11px;opacity:.85}.tag small{margin-top:auto;font-size:10px;opacity:.8}
.pv-s{flex:1;display:grid;gap:6px}.pv-s div{display:flex;align-items:center;gap:8px;font:12px ui-monospace,Menlo,monospace}.pv-s i{width:36px;height:36px;border-radius:8px;border:1px solid rgba(0,0,0,.12);flex:none}.pv-s span{font-family:"DM Sans",sans-serif;font-weight:600;color:var(--muted);font-size:12px}
.bkf label.dbtn,.logo-in label.dbtn{display:inline-flex;width:auto;justify-self:start;color:var(--ink);font:600 13px "DM Sans",sans-serif}
.fcbrand{position:fixed;inset:0;z-index:10002;background:rgba(20,17,15,.6);display:grid;place-items:center;padding:16px;overflow:auto}.fcb-in{position:relative;background:var(--paper-2);color:var(--ink);max-width:600px;width:100%;border-radius:18px;padding:26px;box-shadow:0 30px 80px rgba(0,0,0,.35);font:15px/1.5 "DM Sans",sans-serif}.fcb-in h3{font:600 27px/1.15 "Source Serif 4",Georgia,serif;margin:10px 0 6px}.fcb-in p{color:var(--muted);margin:0 0 14px}
.fcb-in .x{all:unset;cursor:pointer;position:absolute;top:14px;right:16px;font-size:22px;color:var(--muted)}.fcb-g{display:grid;grid-template-columns:1fr 1fr;gap:12px 14px}.fcb-g>label,.fcb-c label{display:grid;gap:5px;font:600 13px "DM Sans",sans-serif;color:var(--muted)}.fcb-g input:not([type=color]):not([type=file]),.fcb-g select{box-sizing:border-box;width:100%;font:15px "DM Sans",sans-serif;padding:10px 12px;border-radius:10px;border:1px solid var(--grid);background:var(--paper);color:var(--ink)}
.fcb-logo{grid-column:1/-1;display:flex;align-items:center;gap:12px}.fcb-logo .lb{width:72px;height:72px;border:1px dashed var(--grid);border-radius:12px;display:grid;place-items:center;background:#fff;overflow:hidden;color:#999}.fcb-logo .lb img{max-width:100%;max-height:100%;object-fit:contain}
.fcb-c{grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr 1.4fr;gap:12px}.fcb-c input[type=color]{width:100%;height:44px;border:1px solid var(--grid);border-radius:10px;padding:3px;background:var(--paper)}.fcb-in .ac{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:18px}.fcb-in .hint{color:var(--muted);font-size:12.5px}.fcb-in .er{color:#c0392b;font-size:13.5px;margin:8px 0 0;min-height:18px}
@media (max-width:600px){.fcb-g,.fcb-c{grid-template-columns:1fr}}
.empty{padding:20px;border:1px dashed var(--grid);border-radius:14px;color:var(--muted);font:14px "DM Sans",sans-serif;text-align:center}
.saved-ok{color:#00894a;font:600 13px "DM Sans",sans-serif;min-height:18px}
@media (max-width:900px){.dg{grid-template-columns:1fr}.dnav{position:static;display:flex;overflow:auto}.dnav button{white-space:nowrap}.bk{grid-template-columns:1fr}.prev{position:static}.bkc{grid-template-columns:repeat(3,1fr)}.bkf{grid-template-columns:1fr}}
</style>'''
G = '<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>'
BODY = f'''<div class="acc" id="acc">
 <div id="authv">
  <h1 id="ttl">Welcome back</h1><p class="sub" id="sub">Sign in to your Forecut account.</p>
  <div class="tabs" role="tablist"><button type="button" role="tab" id="t-in" aria-selected="true">Sign in</button><button type="button" role="tab" id="t-up" aria-selected="false">Sign up</button></div>
  <button class="gbtn" type="button" id="gbtn">{G}<span>Continue with Google</span></button>
  <div class="or">or</div>
  <span id="signup" style="display:block;position:relative;top:-80px"></span><form class="f" id="form" novalidate>
   <div id="nmw" hidden><label for="nm">Full name</label><input id="nm" autocomplete="name" placeholder="Your name"></div>
   <label for="em">Email</label><input id="em" type="email" autocomplete="email" placeholder="you@brand.com" required>
   <label for="pw">Password</label><input id="pw" type="password" autocomplete="current-password" placeholder="At least 6 characters" required>
   <button class="go" type="submit" id="go">Sign in</button>
  </form>
  <button class="lnk" type="button" id="forgot">Forgot password?</button>
  <p class="msg" id="msg" role="status"></p>
  <p class="fine">By continuing you agree to the <a href="terms.html">Terms</a> and <a href="privacy.html">Privacy Policy</a>. Forecut is free during early access.</p>
 </div>
</div>
<div class="dash" id="dash" hidden>
 <header class="dh"><div class="av" id="av"></div><div class="who"><b id="mn"></b><small id="mm"></small><br><span class="chip">Early access · all seasons unlocked</span><p class="msg" id="vmsg" style="margin:6px 0 0"></p></div>
  <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="dbtn pri" type="button" onclick="window.FCFeedback&amp;&amp;FCFeedback.open()">Give feedback · get 1 year free</button><button class="dbtn" type="button" id="dlall">Download all my work</button><button class="dbtn" type="button" id="rsall">Restore</button><input type="file" id="rsfile" accept=".json" hidden><button class="dbtn" type="button" id="out">Sign out</button></div></header>
 <div class="dg"><nav class="dnav" id="dnav" aria-label="Account sections"></nav><div id="pane"></div></div>
</div>
<script src="tools/style-id.js?v=fx-20261115h" defer></script><script src="tools/revisions.js?v=fx-20261115h" defer></script><script src="account-dash.js?v=3" defer></script>
<script type="module">
function ready(f) {{ window.FCAuth ? f() : document.addEventListener('fcauth-ready', f, {{ once: true }}); }}
ready(function () {{

  const A = window.FCAuth, $ = (i) => document.getElementById(i);
  let mode = 'in';
  const next = new URLSearchParams(location.search).get('next');
  function setMode(m) {{
    mode = m; $('t-in').setAttribute('aria-selected', m === 'in'); $('t-up').setAttribute('aria-selected', m === 'up');
    $('nmw').hidden = m !== 'up'; $('go').textContent = m === 'up' ? 'Create account' : 'Sign in';
    $('ttl').textContent = m === 'up' ? 'Create your account' : 'Welcome back';
    $('sub').textContent = m === 'up' ? 'Sign in free for the full trial until 1 January 2027.' : 'Sign in to your Forecut account.';
    $('pw').autocomplete = m === 'up' ? 'new-password' : 'current-password'; $('forgot').hidden = m === 'up'; say('');
  }}
  function say(t, ok) {{ const e = $('msg'); e.textContent = t; e.className = 'msg' + (t ? (ok ? ' ok' : ' err') : ''); }}
  $('t-in').onclick = () => setMode('in'); $('t-up').onclick = () => setMode('up');
  if (location.hash === '#signup') setMode('up');
  function done() {{ if (next && next.startsWith('/') && !next.startsWith('//') && !/account/.test(next)) location.href = next; }}
  $('gbtn').onclick = async () => {{ say(''); try {{ await A.google(); done(); }} catch (e) {{ say(A.msg(e)); }} }};
  $('form').onsubmit = async (ev) => {{
    ev.preventDefault(); const em = $('em').value.trim(), pw = $('pw').value; $('go').disabled = true; say('');
    try {{
      if (mode === 'up') {{ await A.signUp($('nm').value.trim(), em, pw); }} else {{ await A.signIn(em, pw); }}
      done();
    }} catch (e) {{ say(A.msg(e)); }} finally {{ $('go').disabled = false; }}
  }};
  $('forgot').onclick = async () => {{ const em = $('em').value.trim(); if (!em) return say('Enter your email above, then tap Forgot password.');
    try {{ await A.reset(em); say('Password reset email sent to ' + em + '.', true); }} catch (e) {{ say(A.msg(e)); }} }};
  $('out').onclick = () => A.signOut();
  A.onChange((u) => {{
    $('acc').hidden = !!u; $('dash').hidden = !u; if (!u) return; window.__fcUser = u; window.FCDash && window.FCDash.user(u);
    const name = u.displayName || (u.email || '').split('@')[0];
    $('mn').textContent = name; $('mm').textContent = u.email || '';
    $('av').innerHTML = u.photoURL ? '<img alt="" referrerpolicy="no-referrer" src="' + u.photoURL + '">' : name.charAt(0).toUpperCase(); document.title = 'My account · Forecut';
    $('vmsg').textContent = u.emailVerified || !u.email ? '' : 'Check your inbox to verify your email address.';
    $('vmsg').className = 'msg ok';
  }});
}});
</script>'''
h = HEAD.format(title='Sign in · Forecut').replace('</style></head>', '</style>' + CSS + '</head>', 1)
open('../account.html', 'w').write(h + BODY + FOOT)
import shutil; shutil.copy('account_dash.js', '../account-dash.js')
print('account ok')
