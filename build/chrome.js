(function(){
var h=document.querySelector('.fch');
if(h){
/* span the full window on pages whose body is narrower */
function fit(){h.style.marginLeft='';h.style.width='';var l=h.getBoundingClientRect().left;if(Math.abs(l)>1){h.style.marginLeft=(-l)+'px';h.style.width=document.documentElement.clientWidth+'px'}}
function align(){var w=[].slice.call(document.querySelectorAll('.w')).filter(function(e){return !e.closest('.fch,.fcf')&&e.getBoundingClientRect().width>900})[0];
var r=document.documentElement;if(!w||innerWidth<=820){r.style.removeProperty('--gx');return}var b=w.getBoundingClientRect(),cs=getComputedStyle(w),pl=parseFloat(cs.paddingLeft)||0,pr=parseFloat(cs.paddingRight)||0;
var x=Math.max(16,Math.round(b.left+pl));r.style.setProperty('--gx',x+'px')}
fit();align();addEventListener('resize',function(){fit();align()});addEventListener('load',function(){fit();align()});
/* touch and keyboard open/close */
var its=[].slice.call(h.querySelectorAll('.it.dd'));
its.forEach(function(it){var a=it.querySelector('.tb');
a.addEventListener('click',function(e){if(matchMedia('(hover:none)').matches&&!it.classList.contains('open')){e.preventDefault();its.forEach(function(o){o.classList.remove('open')});it.classList.add('open')}});
it.addEventListener('keydown',function(e){if(e.key==='Escape'){it.classList.remove('open');a.blur()}})});
document.addEventListener('click',function(e){if(!h.contains(e.target))its.forEach(function(o){o.classList.remove('open')})});
/* mark the current section */
var p=location.pathname.replace(/\.html$/,'').replace(/\/index$/,'/');
h.querySelectorAll('.tb').forEach(function(a){var u=a.getAttribute('href').replace(/\.html$/,'');if(u==='/'?false:(p===u||(u.slice(-1)==='/'&&p.indexOf(u)===0)))a.setAttribute('aria-current','page')});
}
document.addEventListener('click',function(e){var b=e.target.closest('[data-fb]');if(!b)return;e.preventDefault();if(window.FCFeedback)window.FCFeedback.open();else location.href='/account.html#signin'});
})();
