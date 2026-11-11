/* Shared, dependency-free calculations. Rates are decimals; money excludes product tax. */
(function(root){
'use strict';
const finite=(x,name)=>{if(!Number.isFinite(x))throw Error(name+' must be a number.');return x;};
const nonneg=(x,name)=>{finite(x,name);if(x<0)throw Error(name+' cannot be negative.');return x;};
const rate=(x,name,max=1)=>{nonneg(x,name);if(x>max)throw Error(name+' is out of range.');return x;};
function price(x){
 ['cost','fixed','forward','reverse'].forEach(k=>nonneg(x[k],k));
 ['tax','commission','gateway','feeTax','discount','returns','resale','refundedFees'].forEach(k=>rate(x[k],k));
 if(x.returns>=1)throw Error('Return rate must be below 100%.');
 nonneg(x.mrp,'MRP');
 const sale=x.mrp*(1-x.discount), revenue=sale/(1+x.tax);
 const feeBase=x.basis==='gross'?sale:revenue;
 const transaction=x.commission*feeBase+x.gateway*sale+x.fixed;
 const feeMultiplier=1+(x.claimCredit?0:x.feeTax);
 const keptFees=transaction*feeMultiplier+x.forward;
 const returnAttempts=x.returns/(1-x.returns);
 const returnBurden=returnAttempts*(x.forward+x.reverse+(1-x.resale)*x.cost+transaction*(1-x.refundedFees)*feeMultiplier);
 const netRevenue=revenue-keptFees-returnBurden;
 const contribution=netRevenue-x.cost;
 return {sale,revenue,keptFees,returnBurden,netRevenue,cost:x.cost,contribution,margin:revenue?contribution/revenue:0,markup:x.cost?contribution/x.cost:0};
}
function solvePrice(x,target,ending9=false){
 rate(target,'Target margin'); if(target>=1)throw Error('Target margin must be below 100%.');
 if(x.discount>=1)throw Error('A 100% discount cannot achieve a target margin.');
 const a=price({...x,mrp:0}),b=price({...x,mrp:100});
 const slope=(b.contribution-a.contribution-target*b.revenue)/100;
 if(slope<=0)throw Error('This margin is impossible with these fees and return assumptions.');
 let mrp=Math.max(0,-a.contribution/slope);
 mrp=ending9?Math.ceil((mrp-9)/10)*10+9:Math.ceil(mrp*100)/100;
 return {mrp,...price({...x,mrp})};
}
function breakEven(x){
 ['fixed','variable','proceeds','quantity'].forEach(k=>nonneg(x[k],k));
 if(!Number.isInteger(x.quantity)||x.quantity<1)throw Error('Order quantity must be a positive whole number.');
 rate(x.sellThrough,'Sell-through');rate(x.recovery,'Recovery');
 const contribution=x.proceeds-x.variable;
 const investment=x.fixed+x.quantity*x.variable;
 const profit=q=>q*x.proceeds+(x.quantity-q)*x.recovery*x.proceeds-investment;
 const denom=x.quantity*x.proceeds*(1-x.recovery);
 const required=denom?(investment-x.quantity*x.recovery*x.proceeds)/denom:null;
 return {contribution,investment,profit:profit(x.quantity*x.sellThrough),breakEven:contribution>0?Math.ceil(x.fixed/contribution):null,required,profitAt:profit};
}
function rangeTotals(styles){
 let units=0,skus=0,revenue=0,cost=0;
 styles.forEach(s=>{const q=s.colours*s.sizes*s.perSku;units+=q;skus+=s.colours*s.sizes;revenue+=q*s.price;cost+=q*s.cost;});
 return {units,skus,revenue,cost,average:units?revenue/units:0};
}
function allocate(total,shares){
 if(!Number.isInteger(total)||total<0||shares.some(x=>!Number.isFinite(x)||x<0)||Math.abs(shares.reduce((a,b)=>a+b,0)-100)>0.001)throw Error('Category shares must total 100% and styles must be a whole number.');
 const raw=shares.map(s=>s*total/100),out=raw.map(Math.floor);
 const order=raw.map((x,i)=>({i,r:x-out[i]})).sort((a,b)=>b.r-a.r||a.i-b.i);
 const left=total-out.reduce((a,b)=>a+b,0);for(let n=0;n<left;n++)out[order[n].i]++;
 return out;
}
const dateString=d=>d.toISOString().slice(0,10);
function parseDate(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s))throw Error('Enter dates as YYYY-MM-DD.');const d=new Date(s+'T12:00:00Z');if(!Number.isFinite(+d)||dateString(d)!==s)throw Error('Enter a valid date.');return d;}
function schedule(launch,tasks,weekends=[0],holidays=[]){
 let cursor=parseDate(launch);const days=new Set(holidays);holidays.forEach(parseDate);
 if(weekends.length>=7)throw Error('At least one working day is required.');
 const working=d=>!weekends.includes(d.getUTCDay())&&!days.has(dateString(d));
 const previous=d=>{d.setUTCDate(d.getUTCDate()-1);return d;};
 const result=[];
 for(let i=tasks.length-1;i>=0;i--){const t=tasks[i];if(!Number.isInteger(t.days)||t.days<1||t.days>365)throw Error('Each task needs 1–365 working days.');while(!working(cursor))previous(cursor);const end=dateString(cursor);for(let n=1;n<t.days;n++){previous(cursor);while(!working(cursor))previous(cursor);}result.unshift({...t,start:dateString(cursor),end});previous(cursor);}
 return result;
}
function rgb(hex){if(!/^#[\da-f]{6}$/i.test(hex))throw Error('Use a six-digit HEX colour.');return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));}
function contrast(a,b){const l=h=>rgb(h).map(v=>v/255).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[0.2126,0.7152,0.0722][i],0);const x=l(a),y=l(b);return(Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);}
function cmyk(h){const [r,g,b]=rgb(h).map(v=>v/255),k=1-Math.max(r,g,b);return k===1?[0,0,0,100]:[(1-r-k)/(1-k)*100,(1-g-k)/(1-k)*100,(1-b-k)/(1-k)*100,k*100];}
const api={price,solvePrice,breakEven,rangeTotals,allocate,schedule,rgb,contrast,cmyk,parseDate};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ForecutMath=api;
})(typeof globalThis!=='undefined'?globalThis:this);
