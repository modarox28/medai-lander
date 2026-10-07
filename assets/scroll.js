// scroll.js — Desplazamiento suave y animaciones ligadas al scroll.
// Lenis suaviza la rueda del mouse y el trackpad (en celular se deja el scroll nativo,
// que ya es suave). GSAP ScrollTrigger mueve los elementos según la posición del scroll.
// Con "reducir movimiento" activado no se aplica nada: la página se ve completa y estática.
(function(){
  const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const steps=[...document.querySelectorAll(".step")];
  const shots=[...document.querySelectorAll(".story-stage img")];
  const dots=[...document.querySelectorAll(".story-dots i")];

  // Paso activo del relato de funciones (también sin animaciones, para cambiar la pantalla)
  function activar(i){
    steps.forEach((s,k)=>s.classList.toggle("on",k===i));
    shots.forEach((s,k)=>s.classList.toggle("on",k===i));
    dots.forEach((s,k)=>s.classList.toggle("on",k===i));
  }


  // ── Simulador de signos vitales (mismos límites que src/utils/clinical.js de la app) ──
  const LIM={
    fc:v=>v<50||v>130?"critical":v<60||v>100?"warning":"normal",
    pa:v=>v<90||v>180?"critical":v<100||v>150?"warning":"normal",
    sat:v=>v<90?"critical":v<95?"warning":"normal",
    t:v=>v>40||v<35?"critical":v>38.5||v<36?"warning":"normal",
    fr:v=>v<8||v>30?"critical":v<12||v>24?"warning":"normal"};
  const NOM={fc:"la frecuencia cardiaca",pa:"la presión sistólica",sat:"la saturación",t:"la temperatura",fr:"la frecuencia respiratoria"};
  const TXT={normal:"Normal",warning:"Alerta",critical:"Crítico"};
  const NIV={VERDE:["Verde","Puede esperar","Atención en máximo 120 min"],AMARILLO:["Amarillo","Urgente","Atención en máximo 30 min"],ROJO:["Rojo","Atención inmediata","Atención en máximo 15 min"]};
  const simOut=document.getElementById("simOut");
  function sim(){
    if(!simOut)return;
    const est={};
    for(const k of Object.keys(LIM)){
      const inp=document.getElementById("v-"+k),v=parseFloat(inp.value);
      inp.style.setProperty("--p",((v-inp.min)/(inp.max-inp.min)*100)+"%");
      document.getElementById("o-"+k).textContent=k==="t"?v.toFixed(1):v;
      est[k]=LIM[k](v);
      const st=document.getElementById("s-"+k);st.dataset.s=est[k];st.textContent=TXT[est[k]];
    }
    const crit=Object.keys(est).filter(k=>est[k]==="critical"),warn=Object.keys(est).filter(k=>est[k]==="warning");
    const nivel=crit.length?"ROJO":warn.length?"AMARILLO":"VERDE";
    const [lvl,what,time]=NIV[nivel];
    simOut.dataset.l=nivel;
    document.getElementById("simLvl").textContent=lvl;
    document.getElementById("simWhat").textContent=what;
    document.getElementById("simTime").textContent=time;
    const lista=a=>a.map(k=>NOM[k]).join(", ").replace(/, ([^,]*)$/," y $1");
    document.getElementById("simWhy").textContent=crit.length?`Valor crítico en ${lista(crit)}.`:warn.length?`Fuera de rango: ${lista(warn)}.`:"Todos los signos vitales están en rango normal.";
    // el trazo late al ritmo de la frecuencia cardiaca
    simOut.style.setProperty("--beat",(60/parseFloat(document.getElementById("v-fc").value)).toFixed(2)+"s");
  }
  document.querySelectorAll("#sim input").forEach(i=>i.addEventListener("input",()=>{
    document.querySelectorAll(".sim-presets button").forEach(b=>b.setAttribute("aria-pressed","false"));sim();}));
  document.querySelectorAll(".sim-presets button").forEach(b=>b.addEventListener("click",()=>{
    const v=b.dataset.p.split(",");["fc","pa","sat","t","fr"].forEach((k,i)=>document.getElementById("v-"+k).value=v[i]);
    document.querySelectorAll(".sim-presets button").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));sim();}));
  sim();

  // ── Míralo de cerca: pantalla y tema ──
  const view={v:"dash",t:"dark"};
  const viewA=document.getElementById("viewA"),viewB=document.getElementById("viewB");
  const NOMV={dash:"Pantalla de inicio",cola:"Cola de espera",hc:"Lista de pacientes",scores:"Scores clínicos"};
  function segPill(seg){const on=seg.querySelector("[aria-pressed=true]"),p=seg.querySelector(".seg-pill");if(on&&p){p.style.width=on.offsetWidth+"px";p.style.transform=`translateX(${on.offsetLeft-4}px)`;}}
  function verVista(){
    if(!viewA)return;
    const src=`assets/img/m-${view.v}${view.t==="light"?"-light":""}.webp`;
    if(viewA.getAttribute("src")===src)return;
    viewB.src=src;viewB.classList.remove("out");
    const fin=()=>{viewA.src=src;viewA.alt=`${NOMV[view.v]} en modo ${view.t==="light"?"claro":"oscuro"}`;viewB.classList.add("out");};
    if(viewB.complete)setTimeout(fin,460);else viewB.onload=()=>setTimeout(fin,460);
  }
  const vseg=document.getElementById("viewSeg");
  if(vseg){
    vseg.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{
      vseg.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));view.v=b.dataset.v;segPill(vseg);verVista();}));
    document.querySelectorAll(".sw").forEach(b=>b.addEventListener("click",()=>{
      document.querySelectorAll(".sw").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));view.t=b.dataset.t;verVista();}));
    requestAnimationFrame(()=>segPill(vseg));addEventListener("resize",()=>segPill(vseg));
    document.fonts&&document.fonts.ready.then(()=>segPill(vseg));
  }

  // ── Carrusel "Lo más destacado" ──
  const track=document.getElementById("hlTrack"),cards=[...document.querySelectorAll(".hl-card")],hdots=[...document.querySelectorAll(".hl-dot")],play=document.getElementById("hlPlay");
  let hlI=0,hlRun=!reduce,hlTimer=null,hlLock=false;
  const ICO_PAUSA='<svg viewBox="0 0 24 24"><path d="M7 5h3v14H7zM14 5h3v14h-3z"/></svg>',ICO_PLAY='<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
  function hlMark(i){
    hlI=i;
    hdots.forEach((d,k)=>{d.classList.toggle("on",k===i);d.setAttribute("aria-selected",String(k===i));d.classList.remove("run","paused","static");});
    const d=hdots[i];if(!d)return;void d.offsetWidth;d.classList.add(hlRun?"run":"static");
    clearTimeout(hlTimer);if(hlRun)hlTimer=setTimeout(()=>hlGo((hlI+1)%cards.length),5000);
  }
  function hlGo(i){
    if(!track)return;hlLock=true;
    track.scrollTo({left:cards[i].offsetLeft-cards[0].offsetLeft,behavior:reduce?"auto":"smooth"});
    hlMark(i);setTimeout(()=>hlLock=false,700);
  }
  function hlSet(run){hlRun=run;play.innerHTML=run?ICO_PAUSA:ICO_PLAY;play.setAttribute("aria-label",run?"Pausar":"Reproducir");hlMark(hlI);}
  if(track){
    hdots.forEach((d,i)=>d.addEventListener("click",()=>hlGo(i)));
    play.addEventListener("click",()=>hlSet(!hlRun));
    let t;track.addEventListener("scroll",()=>{if(hlLock)return;clearTimeout(t);t=setTimeout(()=>{
      const x=track.scrollLeft,w=cards[1].offsetLeft-cards[0].offsetLeft;const i=Math.round(x/w);if(i!==hlI)hlMark(Math.max(0,Math.min(cards.length-1,i)));},120);},{passive:true});
    ["pointerdown","focusin"].forEach(ev=>track.addEventListener(ev,()=>{if(hlRun)hlSet(false);}));
    // Solo corre cuando el carrusel está a la vista
    new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)clearTimeout(hlTimer);else hlMark(hlI);}),{threshold:.4}).observe(track);
    hlSet(hlRun);
  }

  // ── Números que cuentan al aparecer ──
  function contar(el){
    const n=+el.dataset.n,suf=el.querySelector("small")?.outerHTML||"";
    if(reduce){return;}
    const t0=performance.now(),d=1100;
    (function f(t){const k=Math.min(1,(t-t0)/d),e=1-Math.pow(1-k,3);el.innerHTML=Math.round(n*e)+suf;if(k<1)requestAnimationFrame(f);})(t0);
  }
  const ion=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){contar(e.target);ion.unobserve(e.target);}}),{threshold:.6});
  document.querySelectorAll(".num b[data-n]").forEach(b=>ion.observe(b));

  if(reduce||!window.gsap||!window.ScrollTrigger){
    // Sin librerías o con movimiento reducido: se marca el paso visible con IntersectionObserver
    if(steps.length)activar(0);
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)activar(steps.indexOf(e.target));}),{rootMargin:"-45% 0px -45% 0px"});
    steps.forEach(s=>io.observe(s));
    document.querySelectorAll(".quote-txt").forEach(q=>q.style.opacity=1);
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // ── Desplazamiento suave ──
  const lenis=new Lenis({duration:1.15,easing:t=>Math.min(1,1.001-Math.pow(2,-10*t)),smoothWheel:true});
  lenis.on("scroll",ScrollTrigger.update);
  gsap.ticker.add(t=>lenis.raf(t*1000));
  gsap.ticker.lagSmoothing(0);
  // Los enlaces del menú también se deslizan suave, dejando espacio para la barra fija
  document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener("click",e=>{
    const id=a.getAttribute("href");
    const dest=id==="#"?0:document.querySelector(id);
    if(dest===null)return;
    e.preventDefault();
    lenis.scrollTo(dest,{offset:-72,duration:1.4});
    if(id!=="#")history.replaceState(null,"",id);
  }));

  const mm=gsap.matchMedia();

  // ── Hero: el texto se aleja y el equipo sube hasta quedar de frente ──
  gsap.timeline({scrollTrigger:{trigger:".hero",start:"top top",end:"bottom top",scrub:.6}})
    .to(".hero-copy",{y:-90,opacity:0,ease:"none"},0);
  gsap.fromTo("#heroDevice",{y:90,scale:.9,rotateX:14},{y:0,scale:1,rotateX:0,ease:"none",
    scrollTrigger:{trigger:"#heroDevice",start:"top bottom",end:"top 18%",scrub:.6}});
  gsap.fromTo(".hero-phone",{x:70,y:40},{x:0,y:0,ease:"none",
    scrollTrigger:{trigger:"#heroDevice",start:"top bottom",end:"top 18%",scrub:.6}});
  gsap.from(".hero-copy > *",{y:30,opacity:0,duration:1,ease:"power3.out",stagger:.08,delay:.1});

  // ── Lo más destacado: las tarjetas entran desde la derecha ──
  gsap.from(".hl-card",{x:120,opacity:0,duration:1,ease:"power3.out",stagger:.08,scrollTrigger:{trigger:".hl-track",start:"top 80%",once:true}});

  // ── Simulador: entra el panel de resultado ──
  gsap.from(".sim-out",{y:60,opacity:0,duration:1,ease:"power3.out",scrollTrigger:{trigger:".sim-grid",start:"top 75%",once:true}});

  // ── Míralo de cerca: el teléfono sube y se endereza ──
  gsap.fromTo("#viewPhone",{y:80,rotate:-4,scale:.94},{y:0,rotate:0,scale:1,ease:"none",scrollTrigger:{trigger:".view",start:"top bottom",end:"center center",scrub:.6}});

  // ── Funciones: el teléfono fijo cambia de pantalla según el paso visible ──
  mm.add("(min-width:901px)",()=>{
    activar(0);
    steps.forEach((s,i)=>ScrollTrigger.create({trigger:s,start:"top 55%",end:"bottom 55%",onToggle:self=>{if(self.isActive)activar(i);}}));
    gsap.from(".story-stage .phone",{scale:.85,opacity:0,duration:1,ease:"power3.out",
      scrollTrigger:{trigger:".story",start:"top 75%",once:true}});
  });
  // En celular: la sección queda fija bajo la barra y el scroll avanza los pasos
  mm.add("(max-width:900px)",()=>{
    const story=document.querySelector(".story");
    if(!story)return;
    story.classList.add("pin-m");
    activar(0);
    const n=steps.length;
    const st=ScrollTrigger.create({
      trigger:story,start:"top 68px",end:()=>"+="+Math.round(innerHeight*.75*n),
      pin:true,anticipatePin:1,
      onUpdate:self=>activar(Math.min(n-1,Math.floor(self.progress*n*0.999)))
    });
    return()=>{story.classList.remove("pin-m");st.kill();steps.forEach(s=>s.classList.remove("on"));};
  });

  // ── Frase: cada palabra se ilumina al pasar por ella ──
  const q=document.getElementById("quoteTxt");
  if(q){
    q.innerHTML=q.textContent.trim().split(/\s+/).map(w=>`<span class="w">${w}</span>`).join(" ");
    const ws=q.querySelectorAll(".w");
    gsap.to(ws,{opacity:1,ease:"none",stagger:1,scrollTrigger:{trigger:q,start:"top 80%",end:"bottom 45%",scrub:.4}});
  }

  // ── Arquitectura: las flechas se dibujan ──
  document.querySelectorAll(".arch path[marker-end]").forEach((p,i)=>{
    const L=p.getTotalLength();p.style.strokeDasharray=L;p.style.strokeDashoffset=L;
    gsap.to(p,{strokeDashoffset:0,duration:.9,delay:i*.25,ease:"power2.inOut",scrollTrigger:{trigger:".arch",start:"top 75%",once:true}});
  });

  // Las imágenes diferidas cambian la altura: se recalculan las posiciones al cargarlas
  document.querySelectorAll("img[loading=lazy]").forEach(img=>img.addEventListener("load",()=>ScrollTrigger.refresh(),{once:true}));
})();
