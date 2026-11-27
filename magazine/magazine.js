(function(){
var book=document.getElementById('book'),pages=[].slice.call(document.querySelectorAll('#src>.pg')),N=pages.length,mob=matchMedia('(max-width:820px)'),cur=0,lf=[],ctl={};
function mk(){book.innerHTML='';lf=[];
 if(mob.matches){pages.forEach(function(p,i){var l=document.createElement('div');l.className='lf';var f=document.createElement('div');f.className='fc';f.appendChild(p.cloneNode(true));l.appendChild(f);book.appendChild(l);lf.push(l)});return}
 for(var i=0;i<N;i+=2){var l=document.createElement('div');l.className='lf';var f=document.createElement('div'),b=document.createElement('div');f.className='fc';b.className='bk';
  f.appendChild(pages[i].cloneNode(true));if(pages[i+1])b.appendChild(pages[i+1].cloneNode(true));l.appendChild(f);l.appendChild(b);book.appendChild(l);lf.push(l)}}
function show(n,quiet){n=Math.max(0,Math.min(N-1,n));cur=n;
 if(mob.matches){lf.forEach(function(l,i){l.classList.toggle('cur',i==n)});book.className='book'}
 else{var k=Math.ceil(n/2);/* leaves flipped = those whose back page index < n */ lf.forEach(function(l,i){l.classList.toggle('fl',(2*i+1)<=n);l.style.zIndex=(2*i+1)<=n?i:(lf.length-i);if(quiet)l.style.transition='none'});
  book.className='book'+(n==0?' s0':(n>=N-1&&N%2==1?'':'' ));if(n==0)book.className='book s0';else if(n>=N-1&&N%2==0)book.className='book se';
  if(quiet)setTimeout(function(){lf.forEach(function(l){l.style.transition=''})},60)}
 ctl.cnt.textContent=(n+1)+' / '+N;ctl.rng.value=n;ctl.prev.disabled=n==0;ctl.next.disabled=n>=N-1;history.replaceState(null,'','#p'+(n+1))}
function step(d){show(mob.matches?cur+d:(d>0?(cur==0?1:cur+2):(cur<=1?0:cur-2)))}
ctl.prev=document.getElementById('prev');ctl.next=document.getElementById('next');ctl.rng=document.getElementById('rng');ctl.cnt=document.getElementById('cnt');
ctl.prev.onclick=function(){step(-1)};ctl.next.onclick=function(){step(1)};ctl.rng.max=N-1;ctl.rng.oninput=function(){show(+this.value)};
document.addEventListener('keydown',function(e){if(e.key=='ArrowRight'||e.key==' ')step(1);if(e.key=='ArrowLeft')step(-1);if(e.key=='Escape')document.getElementById('toc').classList.remove('on')});
book.addEventListener('click',function(e){if(e.target.closest('a'))return;var r=book.getBoundingClientRect();step((e.clientX-r.left)>r.width/2?1:-1)});
var sx=null;book.addEventListener('touchstart',function(e){sx=e.touches[0].clientX},{passive:true});book.addEventListener('touchend',function(e){if(sx==null)return;var d=e.changedTouches[0].clientX-sx;if(Math.abs(d)>40)step(d<0?1:-1);sx=null});
document.getElementById('tocb').onclick=function(){document.getElementById('toc').classList.add('on')};document.getElementById('tocx').onclick=function(){document.getElementById('toc').classList.remove('on')};
document.addEventListener('click',function(e){var a=e.target.closest('[data-go]');if(!a)return;e.preventDefault();show(+a.dataset.go-1);document.getElementById('toc').classList.remove('on')});
document.getElementById('fs').onclick=function(){var d=document.documentElement;document.fullscreenElement?document.exitFullscreen():d.requestFullscreen&&d.requestFullscreen()};
mob.addEventListener('change',function(){mk();show(cur,1)});
mk();var h=+(location.hash.replace('#p',''))||1;show(h-1,1);
})();