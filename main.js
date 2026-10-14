(function(){
"use strict";
var $=function(s,c){return(c||document).querySelector(s)},$$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
var reduce=matchMedia("(prefers-reduced-motion:reduce)").matches,fine=matchMedia("(pointer:fine)").matches;

/* Tema */
$("#tg").addEventListener("click",function(){var t=document.documentElement.dataset.theme==="dark"?"light":"dark";document.documentElement.dataset.theme=t;try{localStorage.setItem("theme",t)}catch(e){}});

/* Texto que se descifra al cargar */
function scramble(el){
  var end=el.textContent,ch="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/{}#",t0=performance.now(),dur=900+end.length*18;
  el.setAttribute("aria-label",end);
  (function f(now){var p=Math.min(1,(now-t0)/dur),n=Math.floor(p*end.length),s="";
    for(var i=0;i<end.length;i++)s+=(i<n||end[i]===" ")?end[i]:ch[Math.floor(Math.random()*ch.length)];
    el.textContent=s;if(p<1)requestAnimationFrame(f);else el.textContent=end})(t0);
}
if(!reduce)$$(".scr").forEach(scramble);

/* Fondo: malla hexagonal que reacciona al ratón */
var cv=$("#bg"),cx=cv.getContext("2d"),mouse={x:-999,y:-999},W,H,vis=true;
function size(){var r=cv.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);W=r.width;H=r.height;cv.width=W*d;cv.height=H*d;cx.setTransform(d,0,0,d,0,0)}
function draw(){
  var st=getComputedStyle(document.documentElement),a=st.getPropertyValue("--sage").trim(),b=st.getPropertyValue("--amb").trim(),S=38,R=150;
  cx.clearRect(0,0,W,H);
  for(var j=0,y=S/2;y<H+S;j++,y+=S*.866){
    for(var x=(j%2?S/2:0);x<W+S;x+=S){
      var dx=x-mouse.x,dy=y-mouse.y,d=Math.sqrt(dx*dx+dy*dy),k=d<R?1-d/R:0,px=x,py=y;
      if(k>0){px+=dx/d*k*26;py+=dy/d*k*26}
      cx.globalAlpha=.22+k*.78;cx.fillStyle=k>.15?b:a;
      cx.beginPath();cx.arc(px,py,1.5+k*3,0,6.283);cx.fill();
    }
  }
}
function loop(){if(vis)draw();requestAnimationFrame(loop)}
size();addEventListener("resize",size);
new IntersectionObserver(function(e){vis=e[0].isIntersecting}).observe(cv);
cv.parentNode.addEventListener("pointermove",function(e){var r=cv.getBoundingClientRect();mouse.x=e.clientX-r.left;mouse.y=e.clientY-r.top});
cv.parentNode.addEventListener("pointerleave",function(){mouse.x=mouse.y=-999});
if(reduce)draw();else loop();

/* Cursor con retardo y botones magnéticos (solo con ratón) */
if(fine&&!reduce){
  var cur=$("#cur"),tx=0,ty=0,cxp=0,cyp=0;
  addEventListener("pointermove",function(e){tx=e.clientX;ty=e.clientY;cur.classList.add("on")});
  (function m(){cxp+=(tx-cxp)*.18;cyp+=(ty-cyp)*.18;cur.style.transform="translate("+cxp+"px,"+cyp+"px)";requestAnimationFrame(m)})();
  document.addEventListener("pointerover",function(e){cur.classList.toggle("big",!!e.target.closest("a,button,.nd,.card"))});
  $$(".mag").forEach(function(el){
    el.addEventListener("pointermove",function(e){var r=el.getBoundingClientRect();el.style.transform="translate("+(e.clientX-r.left-r.width/2)*.25+"px,"+(e.clientY-r.top-r.height/2)*.35+"px)"});
    el.addEventListener("pointerleave",function(){el.style.transform=""});
  });
}

/* Tarjetas: inclinación 3D y brillo que sigue al cursor */
$$(".card").forEach(function(c){
  c.addEventListener("pointermove",function(e){var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
    c.style.setProperty("--mx",x*100+"%");c.style.setProperty("--my",y*100+"%");
    if(!reduce&&fine){c.style.setProperty("--ry",(x-.5)*8+"deg");c.style.setProperty("--rx",(.5-y)*8+"deg")}});
  c.addEventListener("pointerleave",function(){c.style.setProperty("--rx","0deg");c.style.setProperty("--ry","0deg")});
});

/* Filtros de proyectos */
$$(".fl").forEach(function(b){b.addEventListener("click",function(){
  $$(".fl").forEach(function(x){x.setAttribute("aria-pressed",x===b)});var f=b.dataset.f;
  $$(".card").forEach(function(c){c.hidden=f!=="all"&&c.dataset.t.indexOf(f)<0})})});

/* Diagrama hexagonal */
var N=[["Laravel","Backend de Rekom, LecturaXP y Casino educativo."],["API REST","Consumo de APIs externas en Rekom y LecturaXP."],
["RabbitMQ","Mensajería asíncrona para integrar servicios en mis prácticas."],["TypeScript","Proyectos internos de las prácticas, trabajando en equipo."],
["Python","Lo uso junto a TypeScript en los proyectos internos de las prácticas."],["JavaScript","Dungeon game: un juego completo con HTML, CSS y JavaScript."]],
P=[[200,52],[330,126],[330,274],[200,348],[70,274],[70,126]],h="",info=$("#info");
P.forEach(function(p){h+='<line class="ln" x1="200" y1="200" x2="'+p[0]+'" y2="'+p[1]+'"/>'});
N.forEach(function(n,i){h+='<g class="nd" tabindex="0" role="button" aria-label="'+n[0]+'" data-i="'+i+'"><circle cx="'+P[i][0]+'" cy="'+P[i][1]+'" r="36"/><text x="'+P[i][0]+'" y="'+(P[i][1]+4)+'">'+n[0]+'</text></g>'});
$("#g").innerHTML=h;
function sel(e){var i=+e.getAttribute("data-i");$$(".nd").forEach(function(x){x.classList.toggle("on",x===e)});info.innerHTML="<b>"+N[i][0]+".</b> "+N[i][1]}
$$(".nd").forEach(function(e){e.addEventListener("click",function(){sel(e)});e.addEventListener("keydown",function(k){if(k.key==="Enter"||k.key===" "){k.preventDefault();sel(e)}})});

/* Cinta de tecnologías, barra de progreso y volver arriba */
var mq=$("#mq");mq.innerHTML+=mq.innerHTML;
var tp=$("#top"),bar=$("#bar");
addEventListener("scroll",function(){var m=document.documentElement.scrollHeight-innerHeight;bar.style.setProperty("--p",m>0?scrollY/m:0);tp.classList.toggle("v",scrollY>600)},{passive:true});
tp.addEventListener("click",function(){scrollTo({top:0})});
})();
