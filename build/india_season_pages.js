(function(){'use strict';
var input=document.getElementById('detail-search'),select=document.getElementById('detail-category'),count=document.getElementById('detail-count');
function filter(){var q=(input.value||'').trim().toLowerCase(),cat=select.value,n=0;document.querySelectorAll('.detail-card').forEach(function(card){var ok=(!cat||card.dataset.category===cat)&&(!q||card.dataset.search.indexOf(q)>-1);card.hidden=!ok;if(ok)n++;});count.textContent=n+' details';document.getElementById('detail-empty').hidden=n>0;}
if(input&&select){input.addEventListener('input',filter);select.addEventListener('change',filter);filter();}
})();
