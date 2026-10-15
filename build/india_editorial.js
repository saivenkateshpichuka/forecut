(function(){
'use strict';
var DATA=%%DATA%%, ORIGINAL_DESCS=%%ORIGINAL_DESCS%%, ORIGINAL_PALETTE=%%ORIGINAL_PALETTE%%;
var h=document.querySelector('.hero2 .htext'),intro=h.querySelector('.intro'),title=h.querySelector('h1'),basis=h.querySelector('.basis');
var initial={title:title.textContent,intro:intro.textContent,basis:basis.textContent,glance:h.querySelector('.glance').innerHTML,stats:h.querySelector('.stats').innerHTML};
var originalNotes=new Map();document.querySelectorAll('.d').forEach(function(d){originalNotes.set(d,d.querySelector('p').textContent);});
var originalSections=[document.getElementById('th').closest('section'),document.getElementById('kc').closest('section')];
var lookbook=document.getElementById('lookbook'),initialLookbook=lookbook?lookbook.querySelector('.lbrow').innerHTML:'';
var names={e:'Emerging',r:'Rising',p:'Peaking',f:'Fading'},colours={e:'chalk',r:'rise',p:'peak',f:'fade'};
window.FCIndiaEditorial=function(i){
 var r=DATA[String(i)],future=!!r;
 document.documentElement.classList.toggle('ir-active',future);
 document.querySelectorAll('[data-report-si]').forEach(function(s){s.hidden=+s.dataset.reportSi!==i;});
 originalSections.forEach(function(s){s.hidden=future;});
 title.textContent=future?r.title:initial.title;intro.textContent=future?r.intro:initial.intro;basis.textContent=future?r.basis+' · Research reviewed 15 October 2026':initial.basis;
 document.querySelectorAll('.scard').forEach(function(c,j){c.classList.toggle('open',j===i);});
 var code=document.querySelector('.sseg button[data-si="'+i+'"] b').textContent.replace(' 🔒','');
 if(window.FCSetSeason)window.FCSetSeason(code,future?r.palette:ORIGINAL_PALETTE,future?r.descs:ORIGINAL_DESCS);
 document.querySelectorAll('.d').forEach(function(d){var n=d.querySelector('h4').textContent,note=d.querySelector('p');note.textContent=future?(r.notes[n]||originalNotes.get(d)):originalNotes.get(d);d.dataset.q=(n+' '+note.textContent+' '+d.closest('.cat').querySelector('h3').textContent).toLowerCase();});
 if(future){
   var count=r.counts,total=Object.keys(count).reduce(function(n,k){return n+count[k];},0);
   var values=[total,8,count.e,count.r,count.p,count.f];h.querySelectorAll('.stats b').forEach(function(b,j){b.textContent=values[j];});
   var g=h.querySelector('.glance');g.replaceChildren();var block=document.createElement('div'),label=document.createElement('h3');label.textContent='Projected development mix · '+code;block.append(label);
   var bar=document.createElement('div');bar.className='mixbar';bar.setAttribute('role','img');bar.setAttribute('aria-label',Object.keys(count).map(function(k){return names[k]+' '+count[k];}).join(', '));
   var key=document.createElement('div');key.className='mixkey';Object.keys(count).forEach(function(k){var b=document.createElement('i');b.style.width=(100*count[k]/total)+'%';b.style.background='var(--'+colours[k]+')';bar.append(b);var s=document.createElement('span');s.style.setProperty('--k','var(--'+colours[k]+')');s.textContent=names[k]+' '+count[k];key.append(s);});
   block.append(bar,key);g.append(block);var explanation=document.createElement('p');explanation.textContent='Editorial development priorities, not market-share data. Emerging = test; Rising = develop; Peaking = core; Fading = reduce newness. 2028 labels describe scenarios.';g.append(explanation);
 }else{h.querySelector('.stats').innerHTML=initial.stats;h.querySelector('.glance').innerHTML=initial.glance;}
 var look=lookbook;if(look){
  look.querySelector('.lbp').textContent=future?'Existing Forecut design illustrations for '+code+'. Select a reference for season-specific notes. Images do not document future runway collections.':"The details we're watching across Indian wear right now. Tap any look for notes, timing and a downloadable card.";
  var row=look.querySelector('.lbrow');
  if(!future){row.innerHTML=initialLookbook;}else{
   var summer=['Linen kurta sets','Breezy resort dresses','Pastel handloom sarees','Angrakha wrap kurtas','Kurta-shirt hybrids','Collared shirt blouses','Chikankari','Linen'];
   var festive=['Light organza lehengas','Tone-on-tone bandhgalas','Tissue sarees in champagne gold','Bandhani','Sarees with belts and jackets','Brocade and Chanderi Nehru jackets','Kantha','Potli bags'];
   row.replaceChildren();(i%2===1?summer:festive).forEach(function(n){
    var d=Array.prototype.find.call(document.querySelectorAll('.d'),function(d){return d.querySelector('h4').textContent===n;}),st=d?d.dataset.life.charAt(i):'-';if(!d||st==='-'||!d.dataset.img)return;
    var button=document.createElement('button');button.type='button';button.className='lbk';button.dataset.name=n;
    var imageBox=document.createElement('span');imageBox.className='lbi';var image=document.createElement('img');image.src=d.dataset.img;image.alt=n+' — illustrative design reference';image.loading='lazy';image.width=440;image.height=550;imageBox.append(image);
    var caption=document.createElement('small');caption.textContent='Projected '+names[st]+' · '+d.closest('.cat').querySelector('h3').textContent;caption.className=st;
    var name=document.createElement('b');name.textContent=n;button.append(imageBox,caption,name);row.append(button);
   });
  }
 }

};
document.querySelectorAll('[data-open-si]').forEach(function(b){b.addEventListener('click',function(){var target=document.querySelector('.sseg button[data-si="'+b.dataset.openSi+'"]');target.click();if(!target.hasAttribute('data-lock')){var section=document.querySelector('[data-report-si="'+b.dataset.openSi+'"]')||h;section.scrollIntoView({behavior:'smooth',block:'start'});}else{document.getElementById('snote').scrollIntoView({behavior:'smooth',block:'center'});}});});
if(lookbook)lookbook.querySelector('.lbrow').addEventListener('click',function(e){var b=e.target.closest('.lbk');if(!b)return;var card=Array.prototype.find.call(document.querySelectorAll('.d'),function(d){return d.querySelector('h4').textContent===b.dataset.name;});if(card&&window.ForecutOpenDetail)window.ForecutOpenDetail(card);});
h.querySelector('.glance').addEventListener('click',function(e){var b=e.target.closest('.mv');if(!b)return;var card=Array.prototype.find.call(document.querySelectorAll('.d'),function(d){return d.querySelector('h4').textContent===b.dataset.name;});if(card&&window.ForecutOpenDetail)window.ForecutOpenDetail(card);});
if(window.FCApply){var apply=window.FCApply;window.FCApply=function(){apply();document.querySelectorAll('.sub').forEach(function(s){var count=s.querySelector('h5 span');if(count)count.textContent=s.querySelectorAll('.d:not([hidden])').length;});};window.FCApply();}
})();
