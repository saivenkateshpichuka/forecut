(function(){
var dlg=document.getElementById('dc');
var SK=['AW26','SS27','AW27','SS28','AW28'],H={e:35,r:65,p:100,f:50},C={e:'#FFA400',r:'#00C27A',p:'#FF3D6E',f:'#6D7CFF'},N={e:'Emerging',r:'Rising',p:'Peaking',f:'Fading'};
var DO={e:'Test in small runs and watch the January fairs before committing depth.',r:'Build range depth now; this is the window to add colours and fabrics.',p:'Buy the core, protect margin and plan the exit.',f:'Reduce, clear and keep only proven sellers.'};
function el(i){return document.getElementById(i)}
var DD=null;
function load(cb){if(DD){cb();return}fetch(dlg.dataset.desc).then(function(r){return r.json()}).then(function(d){DD=d;cb()}).catch(function(){DD={};cb()})}
function fill(n){function put(id,box,txt){el(id).textContent=txt||'';el(box).hidden=!txt}
  function go(){var d=DD[n]||{};if(d.o)el('dnote').textContent=d.o;
    var ul=el('dnl');ul.innerHTML='';(d.d||[]).forEach(function(x){var li=document.createElement('li');li.textContent=x;ul.appendChild(li)});el('dnotes').hidden=!(d.d&&d.d.length);
    put('dft','dfab',d.f);put('dut','duse',d.u)}
  if(DD)go();else load(go)}
function graph(L){var W=460,Ht=220,pl=34,pr=34,pt=40,pb=38,pts=[],i,c,x,y,s='',cur=+dlg.dataset.cur,base=Ht-pb,top=pt;
  function Y(v){return base-(v/100)*(base-top)}
  for(i=0;i<5;i++){c=L.charAt(i);x=pl+i*(W-pl-pr)/4;pts.push([x,c=='-'?null:Y(H[c]),c])}
  s+='<defs><linearGradient id="tgs" x1="0" x2="1" y1="0" y2="0">'+pts.map(function(p,k){return '<stop offset="'+(k*25)+'%" stop-color="'+(p[2]=='-'?'#c9cfcb':C[p[2]])+'"/>'}).join('')+'</linearGradient>'+
    '<linearGradient id="tgf" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#1f3d33" stop-opacity=".14"/><stop offset="1" stop-color="#1f3d33" stop-opacity="0"/></linearGradient></defs>';
  [100,65,35].forEach(function(v){var yy=Y(v);s+='<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+yy+'" y2="'+yy+'" stroke="#eceeec" stroke-width="1"/>'});
  pts.forEach(function(p,k){s+='<text x="'+p[0]+'" y="'+(Ht-12)+'" text-anchor="middle" font-size="11.5" font-weight="'+(k==cur?700:500)+'" fill="'+(k==cur?'#1f3d33':'#7d8a84')+'" font-family="Archivo,Arial,sans-serif">'+SK[k]+'</text>'});
  var seg=[],cu=[];pts.forEach(function(p){if(p[1]===null){if(cu.length)seg.push(cu);cu=[]}else cu.push(p)});if(cu.length)seg.push(cu);
  function path(g){var d='M'+g[0][0]+','+g[0][1];for(var k=0;k<g.length-1;k++){var p0=g[Math.max(k-1,0)],p1=g[k],p2=g[k+1],p3=g[Math.min(k+2,g.length-1)];
    d+=' C'+(p1[0]+(p2[0]-p0[0])/6)+','+(p1[1]+(p2[1]-p0[1])/6)+' '+(p2[0]-(p3[0]-p1[0])/6)+','+(p2[1]-(p3[1]-p1[1])/6)+' '+p2[0]+','+p2[1]}return d}
  seg.forEach(function(g){if(g.length<2)return;var d=path(g);
    s+='<path class="tga" d="'+d+' L'+g[g.length-1][0]+','+base+' L'+g[0][0]+','+base+' Z" fill="url(#tgf)"/>';
    s+='<path class="tgl" pathLength="1" d="'+d+'" fill="none" stroke="url(#tgs)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>'});
  pts.forEach(function(p,k){if(p[1]===null)return;var now=k==cur,col=C[p[2]],lab=N[p[2]],w=lab.length*6.4+16,ty=p[1]-(now?24:20);
    if(now)s+='<circle class="tgh" cx="'+p[0]+'" cy="'+p[1]+'" r="10" fill="'+col+'" opacity=".28"/>';
    s+='<g class="tgd" style="--i:'+k+'"><circle cx="'+p[0]+'" cy="'+p[1]+'" r="'+(now?7:5.5)+'" fill="'+col+'" stroke="#fff" stroke-width="2.5"/></g>';
    s+='<g class="tgt" style="--i:'+k+'"><rect x="'+(p[0]-w/2)+'" y="'+(ty-11)+'" width="'+w+'" height="19" rx="9.5" fill="'+col+'" fill-opacity="'+(now?1:.16)+'"/><text x="'+p[0]+'" y="'+(ty+2.5)+'" text-anchor="middle" font-size="10.5" font-weight="700" fill="'+(now?'#fff':'#2b3631')+'" font-family="Archivo,Arial,sans-serif">'+lab+'</text></g>'});
  return '<svg viewBox="0 0 '+W+' '+Ht+'" role="img" aria-label="Trend strength by season" class="tg2">'+s+'</svg>'}

var SL=[],I=0;
function show(alt){var im=el('dimg');if(!SL.length){im.style.display='none';el('dcap').style.display='none';el('dprev').hidden=el('dnext').hidden=true;return}
  var s=SL[I];im.style.display='block';im.src='/img/'+s.f+'.webp';dlg.querySelector('.dci').style.setProperty('--bg','url(/img/'+s.f+'.webp)');im.alt=alt||'';im.className=s.k=='Photo'?'':'flat';el('dcap').style.display='';el('dcap').textContent=s.k;el('dprev').hidden=el('dnext').hidden=SL.length<2}
document.addEventListener('click',function(e){
  var t=e.target.closest('.tile');
  if(t&&dlg){
    var st=t.dataset.st,L=t.dataset.life;window.__cur=snap(t);put('fc-recent',window.__cur,12);
    el('dn').textContent=t.dataset.n;el('dnote').textContent=t.dataset.note;el('dsub').textContent=t.dataset.sub;el('darea').textContent='Detail area: '+t.dataset.a;
    SL=[];if(t.dataset.img)SL.push({f:t.dataset.img,k:'Photo'});(t.dataset.flats?t.dataset.flats.split(','):[]).forEach(function(f,i,a){SL.push({f:f,k:'Flat sketch'+(a.length>1?' '+(i+1)+' of '+a.length:'')})});I=0;show(t.dataset.n);
    el('dpill').innerHTML='<span class="pill s-'+st+'">'+N[st]+' in '+dlg.dataset.code+'</span>';
    fill(t.dataset.n);
    el('dgraph').innerHTML=graph(L);
    var h='';for(var i=0;i<5;i++){var c=L.charAt(i);h+='<div'+(i==+dlg.dataset.cur?' class="now"':'')+'><b>'+SK[i]+'</b><span>'+(c=='-'?'Not in forecast':N[c])+'</span></div>'}
    el('dlife').innerHTML='';el('ddo').textContent=DO[st];
    dlg.showModal();return;
  }
  if(e.target.id=='dnext'){I=(I+1)%SL.length;show(el('dn').textContent);return}
  if(e.target.id=='dprev'){I=(I-1+SL.length)%SL.length;show(el('dn').textContent);return}
  if(e.target.id=='dx'||e.target===dlg){dlg.close();return}
  var s=e.target.closest('.sw');
  if(s&&navigator.clipboard){navigator.clipboard.writeText(s.dataset.copy.toUpperCase());var b=s.querySelector('small');var o=b.textContent;b.textContent='Copied';setTimeout(function(){b.textContent=o},1200)}
  var f=e.target.closest('.af button');
  if(f){var bar=f.parentNode,sec=bar.parentNode;[].forEach.call(bar.children,function(x){x.classList.toggle('on',x===f)});
    [].forEach.call(sec.querySelectorAll('.rcard'),function(c){c.style.display=(f.dataset.aud=='all'||c.dataset.aud==f.dataset.aud)?'':'none'})}
});



function LS(k){try{return JSON.parse(localStorage.getItem(k)||'[]')}catch(e){return[]}}
function SVv(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function put(k,d,max){var a=LS(k).filter(function(x){return x.n!=d.n});a.unshift(d);SVv(k,a.slice(0,max))}
function snap(t){var d=t.dataset;return{n:d.n,a:d.a,note:d.note,life:d.life,st:d.st,img:d.img,flats:d.flats,sub:d.sub}}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
window.FCtiles=function(a){return a.map(function(d){return '<button type="button" class="tile" data-n="'+esc(d.n)+'" data-a="'+esc(d.a)+'" data-note="'+esc(d.note)+'" data-life="'+esc(d.life)+'" data-st="'+esc(d.st)+'" data-img="'+esc(d.img)+'" data-flats="'+esc(d.flats)+'" data-sub="'+esc(d.sub)+'"><span class="ti">'+(d.img?'<img src="/img/'+esc(d.img)+'.webp" alt="" loading="lazy">':'<span class="noimg"></span>')+'</span><span class="tt"><b>'+esc(d.n)+'</b><span class="tm">'+esc(d.a)+' <span class="pill s-'+esc(d.st)+'">'+(N[d.st]||'')+'</span></span></span></button>'}).join('')};
document.addEventListener('click',function(e){var b=e.target.closest('[data-save]');if(!b||!window.__cur)return;put(b.dataset.save=='board'?'fc-board':'fc-spec',window.__cur,60);var o=b.dataset.o||(b.dataset.o=b.textContent);b.textContent='Saved on this device';setTimeout(function(){b.textContent=o},1600)});
(function(){var h=document.getElementById('dsh');if(!h)return;
 function fill(id,key,empty,max){var el=document.getElementById(id);if(!el)return;var a=LS(key).slice(0,max||8);el.innerHTML=a.length?window.FCtiles(a):'<p class="emp">'+empty+'</p>'}
 function cnt(){document.querySelectorAll('[data-count]').forEach(function(n){n.textContent=LS(n.dataset.count).length})}
 fill('d-recent','fc-recent','Nothing opened yet. Open any detail in a forecast and it will appear here.',4);fill('d-board','fc-board','Your board is empty. Open a detail and choose Save to board.',8);
 var sp=document.getElementById('d-spec'),a=LS('fc-spec');if(sp)sp.innerHTML=a.length?a.map(function(d){return '<li><button type="button" class="tile mini" data-n="'+esc(d.n)+'" data-a="'+esc(d.a)+'" data-note="'+esc(d.note)+'" data-life="'+esc(d.life)+'" data-st="'+esc(d.st)+'" data-img="'+esc(d.img)+'" data-flats="'+esc(d.flats)+'" data-sub="'+esc(d.sub)+'"><b>'+esc(d.n)+'</b><span>'+esc(d.a)+'</span></button></li>'}).join(''):'<li class="emp">No details in your spec pack yet.</li>';
 cnt();document.querySelectorAll('[data-clear]').forEach(function(b){b.addEventListener('click',function(){try{localStorage.removeItem(b.dataset.clear)}catch(e){}location.reload()})})})();
/* download the detail card as a PNG */
function wrapT(ctx,t,x,y,w,lh,max){var ws=t.split(/\s+/),l='',n=0;for(var i=0;i<ws.length;i++){var tt=l?l+' '+ws[i]:ws[i];if(ctx.measureText(tt).width>w&&l){ctx.fillText(l,x,y);y+=lh;l=ws[i];if(++n>=max-1){var rest=ws.slice(i).join(' ');while(ctx.measureText(rest+'…').width>w&&rest.length>1)rest=rest.slice(0,-1);ctx.fillText(rest+(i<ws.length-1||ctx.measureText(rest).width>w?'…':''),x,y);return y+lh}}else l=tt}ctx.fillText(l,x,y);return y+lh}
function rr(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function dlPng(){var W=1080,F='Archivo,"DM Sans",Arial,sans-serif',im=el('dimg'),hasP=im&&im.style.display!='none'&&im.naturalWidth>0,svg=el('dgraph').querySelector('svg'),st=dlg.querySelector('.pill');
  var sx=new XMLSerializer().serializeToString(svg).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ');
  var g=new Image();g.onload=function(){
    var c=document.createElement('canvas'),ph=hasP?640:0,cx;c.width=W;c.height=ph+1400;cx=c.getContext('2d');
    cx.fillStyle='#f5f0e8';cx.fillRect(0,0,W,c.height);
    if(hasP){cx.fillStyle='#e8e2d6';cx.fillRect(0,0,W,ph);var r=Math.min((W-80)/im.naturalWidth,(ph-60)/im.naturalHeight),w=im.naturalWidth*r,h=im.naturalHeight*r;cx.save();cx.shadowColor='rgba(0,0,0,.18)';cx.shadowBlur=30;cx.shadowOffsetY=10;cx.drawImage(im,(W-w)/2,(ph-h)/2,w,h);cx.restore()}
    var y=ph+70;cx.textBaseline='alphabetic';
    cx.fillStyle='#a9481f';cx.font='700 22px '+F;cx.fillText((st?st.textContent:'').toUpperCase(),60,y);
    cx.fillStyle='#1f3d33';cx.font='300 60px '+F;y=wrapT(cx,el('dn').textContent,60,y+70,W-120,68,2);
    cx.fillStyle='#8a4b1f';cx.font='600 24px '+F;cx.fillText(el('darea').textContent,60,y+4);
    cx.fillStyle='#2d3935';cx.font='400 27px '+F;y=wrapT(cx,el('dnote').textContent,60,y+50,W-120,40,3);
    var gh=(W-120)*220/460,ch=gh+50;cx.fillStyle='#fff';rr(cx,40,y+14,W-80,ch,18);cx.fill();cx.drawImage(g,60,y+34,W-120,gh);var fy=y+14+ch+36,c2=document.createElement('canvas');
    cx.fillStyle='#1f3d33';cx.fillRect(0,fy,W,84);cx.fillStyle='#f5f0e8';cx.font='600 26px '+F;cx.fillText('FORECUT',60,fy+50);
    cx.font='400 22px '+F;cx.textAlign='right';cx.fillText('forecut.in  ·  '+dlg.dataset.code+' forecast',W-60,fy+50);
    c2.width=W;c2.height=fy+84;c2.getContext('2d').drawImage(c,0,0);c=c2;
    c.toBlob(function(b){var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='forecut-'+el('dn').textContent.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'-'+dlg.dataset.code.toLowerCase()+'.png';document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500)},'image/png')};
  g.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(sx)}
document.addEventListener('click',function(e){var b=e.target.closest('[data-png]');if(!b)return;
  if(!document.documentElement.classList.contains('fc-in')){location.href='/account.html#signup';return}
  b.disabled=true;var o=b.textContent;b.textContent='Preparing…';try{dlPng()}catch(x){}setTimeout(function(){b.disabled=false;b.textContent=o},1400)});
/* live behaviour */
document.addEventListener('click',function(e){var b=e.target.closest('[data-pdf]');if(!b)return;
  if(!document.documentElement.classList.contains('fc-in')){location.href='/account.html#signup';return}
  if(b.dataset.pdf=='dialog')document.body.classList.add('pd');
  var im=[].slice.call(document.images);im.forEach(function(i){i.loading='eager'});
  document.querySelectorAll('.rv').forEach(function(n){n.classList.add('rvd')});
  document.querySelectorAll('.cv').forEach(function(n){n.classList.add('in')});
  Promise.all(im.map(function(i){return i.complete?1:new Promise(function(r){i.onload=i.onerror=r})})).then(function(){setTimeout(function(){window.print()},250)})});
window.addEventListener('afterprint',function(){document.body.classList.remove('pd')});
var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function count(t){var v=+t.dataset.v,s=performance.now();if(rm){t.textContent=v;return}t.textContent='0';(function f(n){var k=Math.min(1,(n-s)/900);t.textContent=Math.round(v*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(f)})(s)}
if('IntersectionObserver' in window&&!rm){
  var io=new IntersectionObserver(function(es){es.forEach(function(x){if(!x.isIntersecting)return;var n=x.target;n.classList.add('in');
    if(n.classList.contains('cv'))n.querySelectorAll('.gv2').forEach(count);io.unobserve(n)})},{threshold:.18});
  document.querySelectorAll('.cv').forEach(function(n){io.observe(n)});
  var rv=document.querySelectorAll('.tile,.rcard,.tc,.hs,.sc2,.ct,.th,.sw,.swm,.bd,.stl2 li');
  rv.forEach(function(n,i){n.classList.add('rv');n.style.setProperty('--d',(i%6)*60+'ms');io.observe(n)});
}else{document.querySelectorAll('.cv').forEach(function(n){n.classList.add('in')})}
})();
