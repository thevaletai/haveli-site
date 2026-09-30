/* scrolling dish ticker */
const mq = ["Butter Chicken Poutine","Tandoori Wings","The Garam Smash","Nizami Handi","Maritime Masala Bites","Naan Pull-Aparts","Masala Old Fashioned","Masala Steak Frites","Gulab Jamun Sticky Toffee","The Makhani Crunch"];
const one = mq.map((d,i)=>`<span>${i%3===1?`<em>${d}</em>`:d}<svg><use href="#i-leaf"/></svg></span>`).join("");
$("#marquee").innerHTML = one + one;

/* ================= GOLD SPICE SPARKS ================= */
(()=>{
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const c = $("#sparks"), x = c.getContext("2d"); let W,H,P=[],run=true;
  const dpr = Math.min(devicePixelRatio||1, 2);
  const size = ()=>{ W=c.offsetWidth; H=c.offsetHeight; c.width=W*dpr; c.height=H*dpr; x.setTransform(dpr,0,0,dpr,0,0) };
  size(); addEventListener("resize", size);
  const N = innerWidth < 700 ? 40 : 85;
  const mk = (y)=>({x:Math.random()*W, y:y ?? H+10, r:Math.random()*1.8+.4, vy:-(Math.random()*.6+.2), vx:(Math.random()-.5)*.3, a:Math.random()*.7+.2, w:Math.random()*6.28, h: Math.random()<.18 ? 8 : 42});
  for(let i=0;i<N;i++) P.push(mk(Math.random()*H));
  new IntersectionObserver(([e])=>{ run=e.isIntersecting; if(run) requestAnimationFrame(tick) }).observe(c);
  function tick(){
    if(!run) return;
    x.clearRect(0,0,W,H);
    for(const p of P){
      p.w += .02; p.x += p.vx + Math.sin(p.w)*.25; p.y += p.vy;
      if(p.y < -10) Object.assign(p, mk());
      const g = x.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*4);
      g.addColorStop(0,`hsla(${p.h},95%,70%,${p.a})`); g.addColorStop(1,`hsla(${p.h},95%,60%,0)`);
      x.fillStyle=g; x.beginPath(); x.arc(p.x,p.y,p.r*4,0,6.28); x.fill();
    }
    requestAnimationFrame(tick);
  }
})();
