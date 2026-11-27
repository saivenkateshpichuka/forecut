(function(){
if(window.__fcm)return;window.__fcm=1;
var p=location.pathname.replace(/\.html$/,'');
if(/^\/(apps|admin)/.test(p))return;
var I={
home:'<svg viewBox="0 0 24 24"><path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z"/></svg>',
fc:'<svg viewBox="0 0 24 24"><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></svg>',
col:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="9" cy="10" r="1.4"/><circle cx="14" cy="9" r="1.4"/><circle cx="15" cy="14" r="1.4"/></svg>',
ins:'<svg viewBox="0 0 24 24"><path d="M5 4h11l3 3v13H5zM8 10h8M8 14h8M8 18h5"/></svg>',
menu:'<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'};
var S=[['ss27','SS27','Spring Summer 2027'],['aw27','AW27','Autumn Winter 2027'],['ss28','SS28','Spring Summer 2028'],['aw28','AW28','Autumn Winter 2028']];
var C=[['themes','Themes'],['colour','Colour'],['silhouettes','Silhouettes'],['fabrics','Fabrics and materials'],['womenswear','Womenswear'],['menswear','Menswear'],['kidswear','Kidswear'],['footwear','Footwear'],['knitwear','Knitwear'],['trims','Trims and details'],['accessories','Accessories'],['styling','Styling']];
function on(x){return x==='/'?p==='/'||p==='/index':p.indexOf(x)===0}
var tabs=[['/home.html','Home',I.home,p==='/home'||p==='/'||p==='/index'],['/forecasts/','Forecasts',I.fc,/^\/forecasts/.test(p)],['/colour.html','Colour',I.col,/^\/colour/.test(p)],['/insights.html','Insights',I.ins,/^\/insights/.test(p)]];
var bar=document.createElement('nav');bar.className='mbar';bar.setAttribute('aria-label','App');
bar.innerHTML=tabs.map(function(t){return '<a href="'+t[0]+'"'+(t[3]?' class="on" aria-current="page"':'')+'>'+t[2]+'<span>'+t[1]+'</span></a>'}).join('')+'<button type="button" id="mmb" aria-expanded="false" aria-controls="mdr">'+I.menu+'<span>Menu</span></button>';
var d=document.createElement('div');d.className='mdraw';d.id='mdr';d.setAttribute('role','dialog');d.setAttribute('aria-label','Menu');d.hidden=true;
d.innerHTML='<div class="mdh"><b>Menu</b><button type="button" id="mdx" aria-label="Close menu">&times;</button></div>'+
'<div class="mda"><a class="out-only mdb" href="/account.html#signup">Sign up</a><a class="out-only mdl" href="/account.html#signin">Log in</a><a class="in-only mdb" href="/home.html">Your Home</a></div>'+
S.map(function(s){return '<details'+(p.indexOf('/forecasts/'+s[0])===0?' open':'')+'><summary><b>'+s[1]+'</b><span>'+s[2]+'</span></summary><div class="mdg">'+C.map(function(c){return '<a href="/forecasts/'+s[0]+'/c/'+c[0]+'.html">'+c[1]+'</a>'}).join('')+'<a class="all" href="/forecasts/'+s[0]+'/">All '+s[1]+'</a></div></details>'}).join('')+
'<div class="mdk"><a href="/forecasts/">All forecasts</a><a href="/regions.html">Regional forecasts</a><a href="/india.html">India forecasts</a><a href="/#services">Services</a><a href="/about.html">About</a><a href="/insights.html">Insights</a><a href="mailto:hello@forecut.in">hello@forecut.in</a></div>';
function add(){document.body.appendChild(d);document.body.appendChild(bar);
var b=document.getElementById('mmb'),x=document.getElementById('mdx');
function set(o){d.hidden=!o;b.setAttribute('aria-expanded',o);document.documentElement.classList.toggle('mlock',o)}
b.addEventListener('click',function(){set(d.hidden)});x.addEventListener('click',function(){set(false)});
d.addEventListener('click',function(e){if(e.target.closest('a'))set(false)});
document.addEventListener('keydown',function(e){if(e.key==='Escape')set(false)});
var cur=document.querySelector('.catnav a.cur,.catnav a[aria-current]');if(cur&&cur.scrollIntoView)try{cur.parentNode.scrollLeft=cur.offsetLeft-20}catch(e){}}
if(document.body)add();else document.addEventListener('DOMContentLoaded',add);
})();
