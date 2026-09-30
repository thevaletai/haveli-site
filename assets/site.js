/* ================= RENDER ================= */
const $ = s => document.querySelector(s);
const esc = s => s.replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const leafSvg = '<svg><use href="#i-leaf"/></svg>';
const chiliSvg = '<svg style="width:10px;height:10px"><use href="#i-chili"/></svg>';

/* ================= NAV / UI ================= */
const nav = $("#nav"), bar = $("#actionbar");
const onScroll = ()=>{ nav.classList.toggle("solid", scrollY > 40 || document.body.classList.contains("page-menu")); bar.classList.toggle("show", scrollY > innerHeight * .6) };
addEventListener("scroll", onScroll, {passive:true}); onScroll();

const burger = $("#burger"), drawer = $("#drawer");
function toggleMenu(open){
  document.body.classList.toggle("menu-open", open);
  burger.setAttribute("aria-expanded", open); drawer.setAttribute("aria-hidden", !open);
  burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  document.body.style.overflow = open ? "hidden" : "";
}
burger.addEventListener("click", ()=>toggleMenu(!document.body.classList.contains("menu-open")));
drawer.addEventListener("click", e=>{ if(e.target.closest("a")) toggleMenu(false) });
addEventListener("keydown", e=>{ if(e.key==="Escape") toggleMenu(false) });


/* highlight the nav link for the section in view (home page) */
const navLinks=[...document.querySelectorAll(".nav-links a[href*='#']")];
const secObs = new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting) navLinks.forEach(a=>a.classList.toggle("active", a.hash==="#"+e.target.id));
}),{rootMargin:"-45% 0px -50% 0px"});
navLinks.forEach(a=>{ const el=document.getElementById(a.hash.slice(1)); if(el) secObs.observe(el) });

const rv = new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("in"); rv.unobserve(e.target) } }),{threshold:.12, rootMargin:"0px 0px -40px 0px"});
/* run after page scripts have rendered their cards */
addEventListener("DOMContentLoaded",()=>document.querySelectorAll(".reveal").forEach(el=>rv.observe(el)));

$("#yr").textContent = new Date().getFullYear();

