(function(){
var b=document.querySelector('.mbtn'),m=document.getElementById('mmenu');
if(b&&m){b.addEventListener('click',function(){var o=m.classList.toggle('open');b.setAttribute('aria-expanded',o);document.body.style.overflow=o?'hidden':''});}
/* forecasts filters */
var shelf=document.getElementById('shelf');
if(shelf){var f={season:'all',topic:'all'};document.querySelectorAll('[data-f]').forEach(function(g){g.addEventListener('click',function(e){var c=e.target.closest('button.ch');if(!c)return;g.querySelectorAll('.ch').forEach(function(x){x.classList.toggle('on',x===c)});f[g.dataset.f]=c.dataset.v;var n=0;shelf.querySelectorAll('.cov').forEach(function(cv){var ok=(f.season==='all'||cv.dataset.season===f.season)&&(f.topic==='all'||cv.dataset.topic===f.topic);cv.classList.toggle('hide',!ok);if(ok)n++});document.getElementById('fnone').classList.toggle('hide',n>0);document.getElementById('fcount').textContent=(f.season==='all'&&f.topic==='all')?'Showing every season and topic':'Showing the matching reports'})});}
/* insights filter */
var il=document.getElementById('ilist');
if(il){document.querySelector('[data-f=kind]').addEventListener('click',function(e){var c=e.target.closest('button.ch');if(!c)return;this.querySelectorAll('.ch').forEach(function(x){x.classList.toggle('on',x===c)});var v=c.dataset.v;document.querySelectorAll('[data-kind]').forEach(function(a){a.classList.toggle('hide',v!=='all'&&a.dataset.kind!==v)})});}
/* tools: recently used (same store as the tool pages: {slug, at}) */
window.recentTools=function(){try{var r=JSON.parse(localStorage.getItem('fc-recent-tools')||'[]'),seen={},out=[];r.forEach(function(x){var sl=typeof x==='string'?x:(x&&(x.slug||(x.u&&x.u.replace(/^\/|\.html$/g,''))));if(sl&&!seen[sl]){seen[sl]=1;out.push(sl)}});return out}catch(e){return[]}}
var TN={};document.querySelectorAll('a.tcard,a.tool').forEach(function(a){var sl=a.getAttribute('href').replace(/^\/|\.html$/g,'');var t=a.querySelector('.tt');if(t)TN[sl]=t.textContent});
var rc=document.getElementById('recent');
if(rc){var RT=window.recentTools().filter(function(sl){return TN[sl]}).slice(0,4);if(RT.length){var h='<p class="small gr" style="margin-bottom:10px">Recently used</p><div class="flt">';RT.forEach(function(sl){h+='<a class="ch" href="/'+sl+'.html">'+TN[sl]+'</a>'});rc.innerHTML=h+'</div>'}}
document.querySelectorAll('a.tool,a.tcard').forEach(function(a){a.addEventListener('click',function(){try{var sl=a.getAttribute('href').replace(/^\/|\.html$/g,'');var r=JSON.parse(localStorage.getItem('fc-recent-tools')||'[]').filter(function(x){return (x&&x.slug)!==sl&&x!==sl});r.unshift({slug:sl,at:Date.now()});localStorage.setItem('fc-recent-tools',JSON.stringify(r.slice(0,15)))}catch(e){}})});
/* install Forecut Studio */
var ib=document.getElementById('instStudio'),bip=null;
window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();bip=e});
if(ib){ib.addEventListener('click',function(){var m=document.getElementById('instMsg');if(bip){bip.prompt();bip.userChoice.then(function(){bip=null})}else{m.hidden=false;m.textContent=/iPhone|iPad|Mac/.test(navigator.userAgent)?'In Safari, tap Share, then Add to Home Screen (on a Mac: File, Add to Dock).':'In Chrome or Edge, open the browser menu and choose Install Forecut Studio. If it is already installed, open it from your apps.'}})}
/* greeting + detail of the day + continue reading */
var g=document.getElementById('greet');if(g){var hr=new Date().getHours();g.textContent=(hr<12?'Good morning.':hr<17?'Good afternoon.':'Good evening.')}
var P=window.FC_DOTD;if(P&&P.length){var d=new Date(),i=Math.floor((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()))/864e5)%P.length,x=P[i];
 document.getElementById('dimg').src=x.src||('/img/'+x.img+'.webp');document.getElementById('dimg').alt=x.n;document.getElementById('dname').textContent=x.n;document.getElementById('dnote').textContent=x.note;document.getElementById('dcat').textContent=x.k;document.getElementById('darea').textContent=x.a;
 document.getElementById('dst').textContent=x.st+' in '+x.s+(x.nx?', '+x.nx+' next season':'');document.getElementById('ddate').textContent='Detail of the day, '+d.toLocaleDateString('en-GB',{day:'numeric',month:'long'});
 var t=/Footwear/.test(x.k)?'footwear':/Menswear/.test(x.k)?'menswear':'womenswear';document.getElementById('dlink').href='/'+x.sk+'-'+t+'.html';}
var rep=document.getElementById('report');
if(rep){try{localStorage.setItem('fc-last-report',JSON.stringify({u:location.pathname,t:document.querySelector('h1').textContent,s:document.title.split(' ')[0]}))}catch(e){}
}
window.addEventListener('hashchange',function(){if(rep&&(location.hash==='#preview'||location.hash==='#member'))location.reload()});
var cl=document.getElementById('contlink');if(cl){try{var lr=JSON.parse(localStorage.getItem('fc-last-report')||'null');if(lr){cl.href=lr.u;document.getElementById('conttitle').textContent=lr.t;document.getElementById('contseason').textContent=lr.s}}catch(e){}}
})();
(function(){
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
/* hero slideshow */
var H=document.getElementById('hero');
if(H&&window.FC_HERO){var S=H.querySelectorAll('.hs'),D=window.FC_HERO,i=0,t=null,card=H.querySelector('.hcard'),pb=document.getElementById('hpause');
 function show(n){S[i].classList.remove('on');i=n%S.length;S[i].classList.add('on');var d=D[i];card.classList.remove('in');void card.offsetWidth;
  document.getElementById('hl').textContent=d.l;document.getElementById('hn').textContent=d.n;document.getElementById('hk').textContent=d.k+', '+d.a.toLowerCase();document.getElementById('hnote').textContent=d.note;document.getElementById('hnx').textContent=d.nx;card.classList.add('in')}
 function play(){t=setInterval(function(){show(i+1)},6000);H.classList.add('run')}
 function stop(){clearInterval(t);t=null;H.classList.remove('run')}
 if(!RM&&S.length>1){play();card.classList.add('in')}else{pb.hidden=true}
 pb.addEventListener('click',function(){if(t){stop();pb.textContent='Play';pb.setAttribute('aria-label','Play the slideshow')}else{play();pb.textContent='Pause';pb.setAttribute('aria-label','Pause the slideshow')}});}
/* forecasts filter */
var sh=document.getElementById('shelf');
if(sh&&document.querySelector('.stabs')){var fs='all',ft='all';
 function apply(){var n=0;sh.querySelectorAll('.sgrp').forEach(function(g){var c=0;g.querySelectorAll('.cv').forEach(function(cv){var ok=ft==='all'||cv.dataset.topic===ft;cv.classList.toggle('hide',!ok);if(ok)c++});var ok=(fs==='all'||g.dataset.season===fs)&&c>0;g.classList.toggle('hide',!ok);if(ok)n++});document.getElementById('fnone').classList.toggle('hide',n>0)}
 function setS(v){fs=v;document.querySelectorAll('.stabs button').forEach(function(b){b.classList.toggle('on',b.dataset.v===v);b.setAttribute('aria-pressed',b.dataset.v===v)});apply()}
 document.querySelector('.stabs').addEventListener('click',function(e){var b=e.target.closest('button');if(b)setS(b.dataset.v)});
 document.getElementById('ftopic').addEventListener('change',function(){ft=this.value;apply()});
 document.getElementById('fregion').addEventListener('change',function(){if(this.value)window.open(this.value,'_blank')});
 var hs=location.hash.slice(1);if(hs&&document.querySelector('.stabs [data-v="'+hs+'"]'))setS(hs);}
/* report section nav highlight */
var rn=document.querySelector('.rnav');
if(rn&&'IntersectionObserver' in window){var links={};rn.querySelectorAll('a').forEach(function(a){links[a.getAttribute('href').slice(1)]=a});
 var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){rn.querySelectorAll('a').forEach(function(a){a.classList.remove('on')});var a=links[e.target.id];if(a){a.classList.add('on');a.scrollIntoView({block:'nearest',inline:'nearest'})}}})},{rootMargin:'-30% 0px -60% 0px'});
 document.querySelectorAll('.rs').forEach(function(s){io.observe(s)});}
/* sign-in state: signed-out readers see the overview and inspiration, then a sign-up block */
var rep=document.getElementById('report'),gated=false;
function gate(on){if(!rep)return;if(on===gated)return;gated=on;rep.querySelectorAll('.rs').forEach(function(s,k){if(k>1)s.classList.toggle('hide',on)});var g=document.getElementById('gate');if(g){g.classList.toggle('hide',!on);if(on)rep.after(g)}}
function setUser(u){if(!u&&window.FC_PRIVATE){location.replace('/');return}var R=document.documentElement;R.classList.toggle('fc-in',!!u);try{u?localStorage.setItem('fc-in','1'):localStorage.removeItem('fc-in')}catch(e){}
 var av=document.getElementById('fcav');if(av&&u){var n=(u.displayName||u.email||'').trim();av.textContent=n?n[0].toUpperCase():'You'}
 var gr=document.getElementById('greet');if(gr&&u&&u.displayName){gr.textContent=gr.textContent.replace(/\.$/,', '+u.displayName.split(' ')[0]+'.')}
 gate(!u||location.hash==='#preview');
 if(u&&document.body.dataset.page==='landing'&&!/forecut\.in/.test(document.referrer)&&!/[?&]stay/.test(location.search))location.replace('/home')}
gate(!document.documentElement.classList.contains('fc-in')||location.hash==='#preview');
(function wait(n){if(window.FCAuth&&FCAuth.onChange){FCAuth.onChange(setUser)}else if(n<80)setTimeout(function(){wait(n+1)},100);else if(window.FC_PRIVATE&&!document.documentElement.classList.contains('fc-in'))location.replace('/')})(0);
document.addEventListener('click',function(e){var a=e.target.closest('[data-pdf]');if(a&&!document.documentElement.classList.contains('fc-in')){e.preventDefault();location.href='/account.html#signup'}});
/* lifecycle table: fill in when it comes into view */
var lcs=document.querySelectorAll('.lct,.cdev,.tdev,.sboard,.chg');
/* what we do: slow cross-fade between pictures */
document.querySelectorAll('.wim.fade').forEach(function(w,n){var f=w.querySelectorAll('.wf');if(f.length<2||RM)return;var i=0;setTimeout(function(){setInterval(function(){f[i].classList.remove('on');i=(i+1)%f.length;f[i].classList.add('on')},5200)},n*1700)});
/* marquee rows: repeat the items so the loop is seamless, pause on hover or focus */
document.querySelectorAll('.marq .mtrack').forEach(function(t){if(RM){t.parentNode.classList.add('still');return}var kids=[].slice.call(t.children);kids.forEach(function(k){var c=k.cloneNode(true);c.setAttribute('aria-hidden','true');c.tabIndex=-1;t.appendChild(c)});t.style.setProperty('--dur',(kids.length*4.5)+'s')});
/* rising now: season tabs */
document.querySelectorAll('.rtabs').forEach(function(tb){tb.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;tb.querySelectorAll('button').forEach(function(x){var on=x===b;x.classList.toggle('on',on);x.setAttribute('aria-selected',on);document.getElementById(x.dataset.p).classList.toggle('hide',!on)})})});
if(lcs.length){if(RM||!('IntersectionObserver' in window)){lcs.forEach(function(t){t.classList.add('vis')})}else{var lio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('vis');lio.unobserve(e.target)}})},{threshold:.2});lcs.forEach(function(t){lio.observe(t)})}}
/* Home: saved details and tools you used */
var sv=document.getElementById('saved');
if(sv){try{var L=JSON.parse(localStorage.getItem('fc-saved')||'[]');if(L.length){sv.innerHTML=L.slice(0,6).map(function(x){var n=document.createElement('i');n.textContent=x.n||x.name||'';return '<a href="'+(x.u||x.page||'/forecasts.html')+'">'+(x.p?'<span class="sim"><img src="/img/'+x.p+'.webp" alt=""></span>':'<span class="sim"></span>')+'<span><b>'+n.innerHTML+'</b><span class="small gr">'+(x.s||x.season||'')+'</span></span></a>'}).join('')+(L.length>6?'<a class="lk" href="/account.html">See all</a>':'')}}catch(e){}}
var mt=document.getElementById('mytools');
if(mt&&window.FC_TOOLS){var RT2=window.recentTools().filter(function(sl){return FC_TOOLS[sl]}).slice(0,4);if(RT2.length){mt.innerHTML=RT2.map(function(sl){return '<a href="/'+sl+'.html"><b>'+FC_TOOLS[sl][0]+'</b><span class="small gr">'+FC_TOOLS[sl][1]+'</span></a>'}).join('')}}
if(mt){try{var R=JSON.parse(localStorage.getItem('fc-recent-tools')||'[]');if(R.length){mt.innerHTML=R.slice(0,4).map(function(x){var n=document.createElement('i');n.textContent=x.t;return '<a href="'+x.u+'"><b>'+n.innerHTML+'</b><span class="small gr">Used recently</span></a>'}).join('')}}catch(e){}}
/* forecast finder */
var ff=document.getElementById('fform');
if(ff){ff.addEventListener('submit',function(e){e.preventDefault();var m=ff.m.value;if(m){location.href=m}else{location.href='/'+ff.s.value+'-'+ff.t.value+'.html'}})}
/* detail pop-up */
var DM=document.getElementById('dm'),FI=window.FC_ITEMS;
if(DM&&FI){var cards=[].slice.call(document.querySelectorAll('button.item')),cur=-1,last=null,ST={e:'Emerging',r:'Rising',p:'Peaking',f:'Fading'},SC={e:'st-e',r:'st-r',p:'st-p',f:'st-f'};
 function saved(){try{return JSON.parse(localStorage.getItem('fc-saved')||'[]')}catch(e){return[]}}
 function esc(x){var e=document.createElement('i');e.textContent=x;return e.innerHTML}
 function curve(life,ci){var X={e:46,r:98,p:160,f:236},NM=ST,COL={e:'#d0703f',r:'#2e7d55',p:'#b07a24',f:'#8a6f86'};
  function y(x){return 92-74*Math.exp(-Math.pow((x-160)/62,2))}
  var pts=[];for(var x=8;x<=312;x+=4)pts.push(x+','+y(x).toFixed(1));var ch=life.charAt(ci);if(!X[ch])return '';
  var cx=X[ch],done=[];for(var x2=8;x2<=cx;x2+=4)done.push(x2+','+y(x2).toFixed(1));
  var s='<svg viewBox="0 -18 320 146" role="img" aria-label="Trend curve: '+NM[ch]+' in '+FI.seasons[ci]+'"><polyline points="'+pts.join(' ')+'" fill="none" stroke="#e6ded3" stroke-width="5" stroke-linecap="round"/>';
  s+='<polyline class="tcdone" points="'+done.join(' ')+'" fill="none" stroke="'+COL[ch]+'" stroke-width="5" stroke-linecap="round" pathLength="100"/>';
  ['e','r','p','f'].forEach(function(k,ix){var on=k===ch;s+='<circle cx="'+X[k]+'" cy="'+y(X[k]).toFixed(1)+'" r="'+(on?8:4.5)+'" fill="'+(on?COL[k]:'#fff')+'" stroke="'+COL[k]+'" stroke-width="2.5"'+(on?' class="tcdot"':'')+' style="--k:'+ix+'"/><text x="'+X[k]+'" y="120" text-anchor="middle" font-size="11.5" font-weight="'+(on?700:500)+'" fill="'+(on?COL[k]:'#8a817a')+'">'+NM[k]+'</text>'});
  s+='<text x="'+cx+'" y="'+(y(cx)-16).toFixed(1)+'" text-anchor="middle" font-size="12" font-weight="700" fill="#1c1714">'+FI.seasons[ci]+'</text></svg>';
  var nx=life.charAt(ci+1),msg={e:'Early signals: test in small quantities.',r:'Growth is building: the best time to invest.',p:'At its height: keep in core ranges, avoid over-buying.',f:'Demand is slowing: clear stock and move on.'}[ch];
  if(FI.seasons[ci+1])msg+=X[nx]?' Next, '+FI.seasons[ci+1]+': '+NM[nx].toLowerCase()+'.':' Leaves the forecast in '+FI.seasons[ci+1]+'.';
  return s+'<p class="small gr">'+msg+'</p>'}
 function fill(i){var d=FI.items[i],c=cards[i],im=c.querySelector('img'),dimg=document.getElementById('dmimg');
  var di=DM.querySelector('.dmi'),ph=c.querySelector('.ph');di.classList.toggle('none',!im);di.style.cssText=im?'':ph.getAttribute('style');var pe=di.querySelector('em');if(pe)pe.remove();if(im){dimg.src=im.src;dimg.alt=d.n}else{dimg.removeAttribute('src');var e2=document.createElement('em');e2.textContent=d.a;di.appendChild(e2)}
  document.getElementById('dmk').textContent=d.k+', '+d.a.toLowerCase();document.getElementById('dmn').textContent=d.n;document.getElementById('dmnote').textContent=d.note;
  var st=document.getElementById('dmst');st.textContent=ST[d.st]+' in '+FI.seasons[FI.si];st.className='stage '+SC[d.st];
  var nx=d.l[FI.si+1];document.getElementById('dmnx').textContent=FI.si<4?(ST[nx]?ST[nx]+' in '+FI.seasons[FI.si+1]:'Leaves the forecast in '+FI.seasons[FI.si+1]):'';
  var h='';for(var j=0;j<5;j++){var s=d.l[j];h+='<div class="c-'+(s==='-'?'n':s)+(j===FI.si?' now':'')+'" style="--d:'+(j*90)+'ms"><b>'+FI.seasons[j]+'</b><span>'+(ST[s]||'Not in forecast')+'</span></div>'}
  document.getElementById('dmlc').innerHTML=h;
  document.getElementById('dmth').innerHTML=d.th.length?'<h3>Part of these themes</h3><p class="gr">'+d.th.join(', ')+'</p>':'';
  document.getElementById('dmcurve').innerHTML=curve(d.l,FI.si);
  document.getElementById('dmd').innerHTML=(d.d||[]).map(function(x){return '<li>'+esc(x)+'</li>'}).join('');
  document.getElementById('dmf').textContent=d.f||'';document.getElementById('dmu').textContent=d.u||'';
  document.getElementById('dmnote').textContent=d.o||d.note;
  var pin=document.getElementById('dmpin');pin.hidden=!d.p;if(d.p)pin.href='https://www.pinterest.com/pin/create/button/?url='+encodeURIComponent(location.origin+location.pathname)+'&media='+encodeURIComponent(location.origin+'/img/'+d.p+'.webp')+'&description='+encodeURIComponent(d.n+', '+FI.seasons[FI.si]+' forecast by Forecut');
  var sv=document.getElementById('dmsave'),on=saved().some(function(x){return x.n===d.n});sv.textContent=on?'Saved':'Save detail';sv.setAttribute('aria-pressed',on);
  document.getElementById('dmprev').disabled=i===0;document.getElementById('dmnext').disabled=i===cards.length-1;cur=i}
 function open(i){last=cards[i];fill(i);DM.hidden=false;document.body.style.overflow='hidden';DM.classList.remove('in');void DM.offsetWidth;DM.classList.add('in');
  var im=cards[i].querySelector('img'),big=DM.querySelector('.dmi');
  if(im&&!RM&&big.animate){var a=im.getBoundingClientRect(),b=big.getBoundingClientRect();if(b.width&&b.height)big.animate([{transform:'translate('+(a.left-b.left)+'px,'+(a.top-b.top)+'px) scale('+(a.width/b.width)+','+(a.height/b.height)+')'},{transform:'none'}],{duration:460,easing:'cubic-bezier(.2,.75,.2,1)'})}
  DM.querySelector('.dmx').focus()}
 function close(){DM.classList.remove('in');document.body.style.overflow='';setTimeout(function(){DM.hidden=true},RM?0:180);last&&last.focus()}
 function step(n){var j=cur+n;if(j<0||j>=cards.length)return;var t=DM.querySelector('.dmt');fill(j);if(!RM&&t.animate)t.animate([{opacity:0,transform:'translateX('+(n*24)+'px)'},{opacity:1,transform:'none'}],{duration:260,easing:'ease-out'});DM.querySelector('.dmi').animate&&!RM&&DM.querySelector('.dmi').animate([{opacity:.2},{opacity:1}],{duration:260})}
 cards.forEach(function(c,i){c.addEventListener('click',function(){open(i)})});
 DM.addEventListener('click',function(e){if(e.target.closest('[data-close]'))close()});
 document.getElementById('dmprev').addEventListener('click',function(){step(-1)});document.getElementById('dmnext').addEventListener('click',function(){step(1)});
 document.getElementById('dmsave').addEventListener('click',function(){var d=FI.items[cur],L=saved(),k=L.findIndex(function(x){return x.n===d.n});if(k<0)L.unshift({n:d.n,s:FI.seasons[FI.si],u:location.pathname,p:d.p,k:d.k});else L.splice(k,1);try{localStorage.setItem('fc-saved',JSON.stringify(L.slice(0,200)))}catch(e){}fill(cur)});
 document.addEventListener('keydown',function(e){if(DM.hidden)return;if(e.key==='Escape')close();else if(e.key==='ArrowRight')step(1);else if(e.key==='ArrowLeft')step(-1);else if(e.key==='Tab'){var f=[].slice.call(DM.querySelectorAll('button:not([disabled]),a[href]'));var a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}});}
 document.addEventListener('click',function(e){var b=e.target.closest('[data-print]');if(!b)return;e.preventDefault();
  if(!document.documentElement.classList.contains('fc-in')){location.href='/account.html#signup';return}
  [].forEach.call(document.querySelectorAll('img[loading=lazy]'),function(i){i.loading='eager'});document.documentElement.classList.add('printing');
  var im=[].filter.call(document.images,function(i){return !i.complete}),n=im.length,go=function(){setTimeout(function(){window.print()},150)};
  if(!n)go();else{var t=setTimeout(go,4000);im.forEach(function(i){i.addEventListener('load',function(){if(--n===0){clearTimeout(t);go()}},{once:true});i.addEventListener('error',function(){if(--n===0){clearTimeout(t);go()}},{once:true})})}});
})();
