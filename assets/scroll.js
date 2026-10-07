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

  // ── Hero: el texto sube y se desvanece; el teléfono se acerca y se inclina ──
  gsap.timeline({scrollTrigger:{trigger:".hero",start:"top top",end:"bottom top",scrub:.6}})
    .to(".hero .wrap > div:first-child",{y:-80,opacity:0,ease:"none"},0)
    .to(".hero-shot",{y:-60,scale:.92,rotateX:8,ease:"none"},0)
    .to(".ecg",{opacity:0,ease:"none"},0);
  // Entrada del teléfono al cargar
  gsap.from(".hero-shot",{y:60,opacity:0,duration:1.2,ease:"power3.out",delay:.2});

  // ── Prioridad: las tres franjas entran una tras otra ──
  gsap.from(".band",{x:-40,opacity:0,duration:.8,ease:"power3.out",stagger:.12,
    scrollTrigger:{trigger:".bands",start:"top 78%",once:true}});
  gsap.from(".prio .phone",{y:80,opacity:0,duration:1,ease:"power3.out",
    scrollTrigger:{trigger:".prio",start:"top 70%",once:true}});

  // ── Funciones: el teléfono fijo cambia de pantalla según el paso visible ──
  mm.add("(min-width:901px)",()=>{
    activar(0);
    steps.forEach((s,i)=>ScrollTrigger.create({trigger:s,start:"top 55%",end:"bottom 55%",onToggle:self=>{if(self.isActive)activar(i);}}));
    gsap.from(".story-stage .phone",{scale:.85,opacity:0,duration:1,ease:"power3.out",
      scrollTrigger:{trigger:".story",start:"top 75%",once:true}});
  });
  mm.add("(max-width:900px)",()=>{
    steps.forEach(s=>{
      s.classList.add("on");
      gsap.from(s.querySelector(".step-img"),{y:50,opacity:0,duration:.9,ease:"power3.out",scrollTrigger:{trigger:s,start:"top 85%",once:true}});
    });
  });

  // ── Frase: cada palabra se ilumina al pasar por ella ──
  const q=document.getElementById("quoteTxt");
  if(q){
    q.innerHTML=q.textContent.trim().split(/\s+/).map(w=>`<span class="w">${w}</span>`).join(" ");
    const ws=q.querySelectorAll(".w");
    gsap.to(ws,{opacity:1,ease:"none",stagger:1,scrollTrigger:{trigger:q,start:"top 80%",end:"bottom 45%",scrub:.4}});
  }

  // ── Día y noche: los dos teléfonos se separan al hacer scroll ──
  gsap.fromTo(".duo .phone:first-child",{x:40,rotate:-2},{x:-10,rotate:-6,ease:"none",
    scrollTrigger:{trigger:".duo",start:"top bottom",end:"bottom top",scrub:.6}});
  gsap.fromTo(".duo .phone:last-child",{x:-40,rotate:2},{x:10,rotate:6,ease:"none",
    scrollTrigger:{trigger:".duo",start:"top bottom",end:"bottom top",scrub:.6}});

  // ── Arquitectura: las flechas se dibujan ──
  document.querySelectorAll(".arch path[marker-end]").forEach((p,i)=>{
    const L=p.getTotalLength();p.style.strokeDasharray=L;p.style.strokeDashoffset=L;
    gsap.to(p,{strokeDashoffset:0,duration:.9,delay:i*.25,ease:"power2.inOut",scrollTrigger:{trigger:".arch",start:"top 75%",once:true}});
  });

  // Las imágenes diferidas cambian la altura: se recalculan las posiciones al cargarlas
  document.querySelectorAll("img[loading=lazy]").forEach(img=>img.addEventListener("load",()=>ScrollTrigger.refresh(),{once:true}));
})();
