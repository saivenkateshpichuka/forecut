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
</style>'''
G = '<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>'
BODY = f'''<div class="acc" id="acc">
 <section id="saved" class="svd"><h2>Saved details</h2><p class="sub" id="svsub">Tap the ♡ Save button on any detail to keep it here. Saved on this device.</p><div class="svl" id="svl"></div></section>
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
 <div id="mev" class="me" hidden>
  <div class="row"><div class="av" id="av"></div><div><b id="mn"></b><small id="mm"></small></div></div>
  <div class="plan"><span class="tg">Early access</span><b style="font:700 16px DM Sans,sans-serif;display:block">Full access, complimentary</b><p>Every season is unlocked for you until plans open on 1 January 2027, including AW27, SS28, AW28 and India Summer 27 to Festive 28, plus reports and PDF downloads. The first 100 subscribers become Founding Members: full access for ₹999 in year one, kept on renewal. <a href="index.html#pricing">See pricing</a>.</p></div>
  <p class="msg" id="vmsg"></p>
  <div class="qk"><a href="regions.html">Regions</a><a href="india.html">India</a><a href="aw26.html">AW26</a><a href="reports.html">Reports</a><a href="journal.html">Journal</a></div>
  <button class="go" type="button" id="out" style="background:transparent;color:var(--ink);border:1px solid var(--grid)">Sign out</button>
 </div>
</div>
<script>
  (function sv() {{ let L = []; try {{ L = JSON.parse(localStorage.getItem('fc-saved') || '[]'); }} catch (e) {{}}
    const box = document.getElementById('svl'), NM = {{e: 'Emerging', r: 'Rising', p: 'Peaking', f: 'Fading'}};
    box.innerHTML = '';
    if (!L.length) {{ document.getElementById('svsub').textContent = 'Nothing saved yet. Open any detail and tap ♡ Save to keep it here.'; }}
    L.forEach((x, i) => {{ const a = document.createElement('a'); a.className = 'svi'; a.href = x.page;
      a.innerHTML = '<span class="ph">' + (x.img ? '<img alt="" src="/' + x.img.replace(/^\//, '') + '">' : '') + '</span><span><b></b><small></small></span><button type="button" aria-label="Remove">✕</button>';
      a.querySelector('b').textContent = x.name; a.querySelector('small').textContent = (x.season || '') + ' · ' + (NM[x.st] || '') + ' · ' + (x.cat || '');
      a.querySelector('button').onclick = (e) => {{ e.preventDefault(); L.splice(i, 1); try {{ localStorage.setItem('fc-saved', JSON.stringify(L)); }} catch (er) {{}} sv(); }};
      box.appendChild(a); }}); }})();
</script>
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
    $('sub').textContent = m === 'up' ? 'Free until 1 January 2027. Founding Members get year one for ₹999.' : 'Sign in to your Forecut account.';
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
    $('authv').hidden = !!u; $('mev').hidden = !u; if (!u) return;
    const name = u.displayName || (u.email || '').split('@')[0];
    $('mn').textContent = name; $('mm').textContent = u.email || '';
    $('av').innerHTML = u.photoURL ? '<img alt="" referrerpolicy="no-referrer" src="' + u.photoURL + '">' : name.charAt(0).toUpperCase();
    $('vmsg').textContent = u.emailVerified || !u.email ? '' : 'Check your inbox to verify your email address.';
    $('vmsg').className = 'msg ok';
  }});
}});
</script>'''
h = HEAD.format(title='Sign in · Forecut').replace('</style></head>', '</style>' + CSS + '</head>', 1)
open('../account.html', 'w').write(h + BODY + FOOT)
print('account ok')
