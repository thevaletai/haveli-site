/* ================= MENU DATA =================
   Menu items and prices live in data/menu.json, which is edited from admin.html.
   item: {name, price, aka?, desc?, type: "veg"|"meat"|"protein", twist?, chefsPick?, heat?: 1-3} */
let MENU = [];
const optionsHtml = c => !c.options || !c.options.list.length ? "" :
  `<div class="cat-extra">${c.options.label?`<div class="eyebrow" style="margin-bottom:12px">${esc(c.options.label)}</div>`:""}<div class="proteins">${c.options.list.map(o=>`<div class="prot"><b>${esc(o.name)}</b><span>${esc(o.price)}</span></div>`).join("")}</div></div>`;

const chips = $("#chips"), body = $("#menuBody");
function renderChips(){
  chips.innerHTML = MENU.map((c,i)=>`<button class="chip${i?"":" on"}" data-id="${esc(c.id)}">${esc(c.title)}<small>${c.items.length}</small></button>`).join("");
}

function heatPill(h){
  if(!h) return "";
  const lbl = ["","Medium","Med-hot","Very hot"][h];
  return `<i class="pill hot">${chiliSvg.repeat(h)}${lbl}</i>`;
}
function renderMenu(){
  const q = $("#q").value.trim().toLowerCase();
  const veg = $("#vegOnly").checked, tw = $("#twistOnly").checked;
  const rx = q ? new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g,"\\$&") + ")","ig") : null;
  const hl = s => rx ? esc(s||"").replace(rx,"<mark>$1</mark>") : esc(s||"");
  let shown = 0;
  body.innerHTML = MENU.map(c=>{
    const items = c.items.filter(it=>{
      if (it.hidden) return false;
      if (veg && it.type==="meat") return false;
      if (tw && !it.twist) return false;
      if (q && ![it.name,it.aka,it.desc,c.title].join(" ").toLowerCase().includes(q)) return false;
      return true;
    });
    const btn = chips.querySelector(`[data-id="${CSS.escape(c.id)}"]`);
    if (btn){ btn.hidden = !items.length; btn.querySelector("small").textContent = items.length; }
    if (!items.length) return "";
    shown += items.length;
    return `<div class="cat" id="cat-${esc(c.id)}" data-id="${esc(c.id)}">
      <div class="cat-title"><svg class="leaf" style="color:var(--gold)" aria-hidden="true"><use href="#i-leaf"/></svg><h3>${esc(c.title)}</h3>${c.isNew?'<span class="new">New</span>':""}</div>
      ${c.note?`<p class="cat-note">${esc(c.note)}</p>`:""}
      ${optionsHtml(c)}
      <div class="items">${items.map(it=>{
        const kind = {meat:"n",protein:"p"}[it.type] || "v";
        const title = {n:"Contains meat or fish",p:"Choose your protein",v:"Vegetarian"}[kind];
        const p = (it.price||"").trim();
        return `<div class="item">
          <div class="item-top">
            <span class="item-name"><i class="vb ${kind}" title="${title}"></i>${hl(it.name)}${it.twist?`<i class="pill twist">${leafSvg}Twist</i>`:""}${heatPill(it.heat)}${it.chefsPick?'<i class="pill star">Chef\'s pick</i>':""}</span>
            ${p?`<span class="dots"></span><span class="item-price">${esc(/^[+$]/.test(p)?p:"$"+p)}</span>`:""}
          </div>
          ${it.aka?`<span class="aka">${hl(it.aka)}</span>`:""}
          ${it.desc?`<p>${hl(it.desc)}</p>`:""}
        </div>`}).join("")}</div></div>`;
  }).join("");
  $("#empty").style.display = shown ? "none" : "block";
  observeCats();
}
chips.addEventListener("click", e=>{
  const b = e.target.closest(".chip"); if(!b) return;
  const el = document.getElementById("cat-"+b.dataset.id);
  if (el) el.scrollIntoView({behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"});
});
let tmr; $("#q").addEventListener("input",()=>{clearTimeout(tmr);tmr=setTimeout(renderMenu,120)});
$("#vegOnly").addEventListener("change",renderMenu);
$("#twistOnly").addEventListener("change",renderMenu);

let catObs;
function setChip(id){
  chips.querySelectorAll(".chip").forEach(c=>{
    const on = c.dataset.id===id; c.classList.toggle("on",on);
    if (on) chips.scrollTo({left:c.offsetLeft - chips.clientWidth/2 + c.clientWidth/2, behavior:"smooth"});
  });
}
function observeCats(){
  catObs && catObs.disconnect();
  catObs = new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting) setChip(e.target.dataset.id) }),{rootMargin:"-40% 0px -55% 0px"});
  body.querySelectorAll(".cat").forEach(c=>catObs.observe(c));
}
/* load the published menu (bypass the CDN cache so price changes show right away) */
(window.MENU_DATA ? Promise.resolve(window.MENU_DATA) : fetch("data/menu.json?v="+Date.now(),{cache:"no-store"}).then(r=>r.json()))
  .then(d=>{ MENU=d.categories.filter(c=>!c.hidden); renderChips(); renderMenu(); })
  .catch(()=>{ body.innerHTML='<p class="empty" style="display:block">The menu didn\'t load. Please refresh, or call us at 506-455-1717.</p>'; });
