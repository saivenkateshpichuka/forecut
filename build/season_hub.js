(function(){
var dlg=document.getElementById('dc');
var SK=['AW26','SS27','AW27','SS28','AW28'],H={e:35,r:65,p:100,f:50},C={e:'#D9A441',r:'#2F6B4F',p:'#14231F',f:'#9AA39E'},N={e:'Emerging',r:'Rising',p:'Peaking',f:'Fading'};
var DO={e:'Test in small runs and watch the January fairs before committing depth.',r:'Build range depth now; this is the window to add colours and fabrics.',p:'Buy the core, protect margin and plan the exit.',f:'Reduce, clear and keep only proven sellers.'};
function el(i){return document.getElementById(i)}
document.addEventListener('click',function(e){
  var t=e.target.closest('.tile');
  if(t&&dlg){
    var st=t.dataset.st,L=t.dataset.life;
    el('dn').textContent=t.dataset.n;el('dnote').textContent=t.dataset.note;el('dsub').textContent=t.dataset.sub+', '+t.dataset.a;
    var im=el('dimg');if(t.dataset.img){im.src='/img/'+t.dataset.img+'.webp';im.alt=t.dataset.n;im.style.display='block'}else{im.style.display='none'}
    el('dpill').innerHTML='<span class="pill s-'+st+'">'+N[st]+' in SS27</span>';
    var h='';for(var i=0;i<5;i++){var c=L.charAt(i);h+='<div'+(i==1?' class="now"':'')+'>'+(c=='-'?'':'<i style="height:'+H[c]+'%;background:'+C[c]+'"></i>')+'<b>'+SK[i]+'</b><span>'+(c=='-'?'Not in forecast':N[c])+'</span></div>'}
    el('dlife').innerHTML=h;el('ddo').textContent=DO[st];
    dlg.showModal();return;
  }
  if(e.target.id=='dx'||e.target===dlg){dlg.close();return}
  var s=e.target.closest('.sw');
  if(s&&navigator.clipboard){navigator.clipboard.writeText(s.dataset.copy.toUpperCase());var b=s.querySelector('small');var o=b.textContent;b.textContent='Copied';setTimeout(function(){b.textContent=o},1200)}
  var f=e.target.closest('.af button');
  if(f){var bar=f.parentNode,sec=bar.parentNode;[].forEach.call(bar.children,function(x){x.classList.toggle('on',x===f)});
    [].forEach.call(sec.querySelectorAll('.rcard'),function(c){c.style.display=(f.dataset.aud=='all'||c.dataset.aud==f.dataset.aud)?'':'none'})}
});
})();
