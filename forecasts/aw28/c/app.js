(function(){
var dlg=document.getElementById('dc');
var SK=['AW26','SS27','AW27','SS28','AW28'],H={e:35,r:65,p:100,f:50},C={e:'#D9A441',r:'#2F6B4F',p:'#14231F',f:'#9AA39E'},N={e:'Emerging',r:'Rising',p:'Peaking',f:'Fading'};
var DO={e:'Test in small runs and watch the January fairs before committing depth.',r:'Build range depth now; this is the window to add colours and fabrics.',p:'Buy the core, protect margin and plan the exit.',f:'Reduce, clear and keep only proven sellers.'};
function el(i){return document.getElementById(i)}
var DD=null;
function load(cb){if(DD){cb();return}fetch(dlg.dataset.desc).then(function(r){return r.json()}).then(function(d){DD=d;cb()}).catch(function(){DD={};cb()})}
function fill(n){function put(id,box,txt){el(id).textContent=txt||'';el(box).hidden=!txt}
  function go(){var d=DD[n]||{};if(d.o)el('dnote').textContent=d.o;
    var ul=el('dnl');ul.innerHTML='';(d.d||[]).forEach(function(x){var li=document.createElement('li');li.textContent=x;ul.appendChild(li)});el('dnotes').hidden=!(d.d&&d.d.length);
    put('dft','dfab',d.f);put('dut','duse',d.u)}
  if(DD)go();else load(go)}
function graph(L){var W=360,Ht=130,pl=36,pr=36,pt=14,pb=18,pts=[],x,y,i,c,s='';
  for(i=0;i<5;i++){c=L.charAt(i);x=pl+i*(W-pl-pr)/4;y=c=='-'?null:Ht-pb-(H[c]/100)*(Ht-pb-pt);pts.push([x,y,c])}
  for(i=0;i<4;i++){s+='<line x1="'+(pl+i*(W-pl-pr)/4)+'" x2="'+(pl+i*(W-pl-pr)/4)+'" y1="'+pt+'" y2="'+(Ht-pb)+'" class="gv"/>'}
  s+='<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+(Ht-pb)+'" y2="'+(Ht-pb)+'" class="ga"/>';
  var seg=[],cur=[];pts.forEach(function(p){if(p[1]===null){if(cur.length)seg.push(cur);cur=[]}else cur.push(p)});if(cur.length)seg.push(cur);
  seg.forEach(function(g){if(g.length>1)s+='<polyline fill="none" stroke="#14231F" stroke-width="2" points="'+g.map(function(p){return p[0]+','+p[1]}).join(' ')+'"/>'});
  pts.forEach(function(p,k){if(p[1]===null)return;s+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="'+(k==+dlg.dataset.cur?7:5)+'" fill="'+C[p[2]]+'" stroke="#fff" stroke-width="2"/>'});
  return '<svg viewBox="0 0 '+W+' '+Ht+'" role="img" aria-label="Trend strength by season" class="gr">'+s+'</svg>'}

var SL=[],I=0;
function show(alt){var im=el('dimg');if(!SL.length){im.style.display='none';el('dcap').style.display='none';el('dprev').hidden=el('dnext').hidden=true;return}
  var s=SL[I];im.style.display='block';im.src='/img/'+s.f+'.webp';im.alt=alt||'';im.className=s.k=='Photo'?'':'flat';el('dcap').style.display='';el('dcap').textContent=s.k;el('dprev').hidden=el('dnext').hidden=SL.length<2}
document.addEventListener('click',function(e){
  var t=e.target.closest('.tile');
  if(t&&dlg){
    var st=t.dataset.st,L=t.dataset.life;
    el('dn').textContent=t.dataset.n;el('dnote').textContent=t.dataset.note;el('dsub').textContent=t.dataset.sub;el('darea').textContent='Detail area: '+t.dataset.a;
    SL=[];if(t.dataset.img)SL.push({f:t.dataset.img,k:'Photo'});(t.dataset.flats?t.dataset.flats.split(','):[]).forEach(function(f,i,a){SL.push({f:f,k:'Flat sketch'+(a.length>1?' '+(i+1)+' of '+a.length:'')})});I=0;show(t.dataset.n);
    el('dpill').innerHTML='<span class="pill s-'+st+'">'+N[st]+' in '+dlg.dataset.code+'</span>';
    fill(t.dataset.n);
    el('dgraph').innerHTML=graph(L);
    var h='';for(var i=0;i<5;i++){var c=L.charAt(i);h+='<div'+(i==+dlg.dataset.cur?' class="now"':'')+'><b>'+SK[i]+'</b><span>'+(c=='-'?'Not in forecast':N[c])+'</span></div>'}
    el('dlife').innerHTML=h;el('ddo').textContent=DO[st];
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
})();
