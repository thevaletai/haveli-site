/* ================= ORDER FOR PICKUP =================
   Reads the takeout menu from data/menu.json, builds a cart, and sends the order
   as a pre-written text to the restaurant's AI assistant. Payment happens at pickup. */
const ORDER_PHONE_FALLBACK = "+15064365787";
const KEY_CART = "haveli-cart-v1", KEY_WHO = "haveli-order-who";
const mem = { get(k){ try{ return JSON.parse(localStorage.getItem(k)) }catch{ return null } }, set(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)) }catch{} } };

let MENU = { categories: [] }, cart = mem.get(KEY_CART) || [], phone = ORDER_PHONE_FALLBACK;
const num = v => { const n = parseFloat(String(v ?? "").replace(/[^0-9.]/g, "")); return isFinite(n) ? n : 0 };
const fmt = n => "$" + (Math.round(n * 100) / 100).toFixed(2).replace(/\.00$/, "");
const fmtExact = n => "$" + (Math.round(n * 100) / 100).toFixed(2);
const prettyPhone = p => p.replace(/^\+1(\d{3})(\d{3})(\d{4})$/, "$1-$2-$3");

/* every option group that applies to an item: its own + its category's (e.g. "Add a protein") */
const groupsFor = (cat, it) => [...(it.groups || []), ...(cat.groups || [])];
const findItem = key => { for (const c of MENU.categories) for (const it of c.items) if (c.id + "|" + it.name === key) return { cat: c, it }; return null };

/* price for one unit given the chosen options */
function unitPrice(cat, it, sel){
  let base = num(it.price);
  groupsFor(cat, it).forEach((g, gi) => {
    const pick = sel[gi]; if (pick == null) return;
    const picks = Array.isArray(pick) ? pick : [pick];
    picks.forEach(ci => { const o = g.list[ci]; if (!o) return;
      if (g.type === "size") base = num(o.price);
      else base += num(o.price);
    });
  });
  return base;
}
function describe(cat, it, sel){
  const parts = [];
  groupsFor(cat, it).forEach((g, gi) => {
    const pick = sel[gi]; if (pick == null) return;
    const picks = (Array.isArray(pick) ? pick : [pick]).map(ci => g.list[ci]).filter(Boolean);
    if (!picks.length) return;
    parts.push(picks.map(o => g.type === "addon" ? "+ " + o.name : o.name).join(", "));
  });
  return parts.join(" · ");
}

/* ================= MENU LIST ================= */
const listEl = $("#orderMenu"), chipsEl = $("#chips");
function renderMenu(){
  const cats = MENU.categories.filter(c => !c.hidden && !c.dineInOnly && c.items.some(i => !i.hidden));
  chipsEl.innerHTML = cats.map((c, i) => `<button class="chip${i ? "" : " on"}" data-id="${esc(c.id)}">${esc(c.title)}</button>`).join("");
  listEl.innerHTML = cats.map(c => `
    <div class="cat" id="cat-${esc(c.id)}" data-id="${esc(c.id)}">
      <div class="cat-title"><svg class="leaf" style="color:var(--gold)" aria-hidden="true"><use href="#i-leaf"/></svg><h3>${esc(c.title)}</h3></div>
      ${c.note ? `<p class="cat-note">${esc(c.note)}</p>` : ""}
      <div class="o-items">${c.items.filter(i => !i.hidden).map(it => {
        const key = c.id + "|" + it.name, p = displayPrice(it);
        return `<button class="o-item" data-key="${esc(key)}">
          <span class="o-top"><b>${esc(it.name)}</b>${it.chefsPick ? '<i class="pill star">Fav</i>' : ""}${it.heat ? `<i class="pill hot">${["","Medium","Hot","Double hot"][it.heat]}</i>` : ""}</span>
          ${it.desc ? `<span class="o-desc">${esc(it.desc)}</span>` : ""}
          <span class="o-bot"><span class="o-price">${esc(p ? (/^[+$]/.test(p) ? p : "$" + p) : "")}</span><span class="o-add" aria-hidden="true">+ Add</span></span>
        </button>`;
      }).join("")}</div>
    </div>`).join("");
  observeCats();
}
listEl.addEventListener("click", e => { const b = e.target.closest(".o-item"); if (b) openItem(b.dataset.key) });
chipsEl.addEventListener("click", e => { const b = e.target.closest(".chip"); if (!b) return; document.getElementById("cat-" + b.dataset.id)?.scrollIntoView({ behavior: "smooth" }) });
let catObs;
function observeCats(){
  catObs && catObs.disconnect();
  catObs = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return;
    chipsEl.querySelectorAll(".chip").forEach(c => { const on = c.dataset.id === e.target.dataset.id; c.classList.toggle("on", on);
      if (on) chipsEl.scrollTo({ left: c.offsetLeft - chipsEl.clientWidth / 2 + c.clientWidth / 2, behavior: "smooth" }); });
  }), { rootMargin: "-40% 0px -55% 0px" });
  listEl.querySelectorAll(".cat").forEach(c => catObs.observe(c));
}

/* ================= ITEM DIALOG ================= */
const dlg = $("#optDialog");
let cur = null; // { key, cat, it, sel, qty, editIndex }
function openItem(key, editIndex){
  const f = findItem(key); if (!f) return;
  const line = editIndex != null ? cart[editIndex] : null;
  cur = { key, ...f, sel: line ? clone(line.sel) : {}, qty: line ? line.qty : 1, editIndex };
  const groups = groupsFor(f.cat, f.it);
  // sensible defaults: first size is pre-selected so the price is always clear
  if (!line) groups.forEach((g, gi) => { if (g.type === "size") cur.sel[gi] = 0 });
  $("#dlgTitle").textContent = f.it.name;
  $("#dlgDesc").textContent = f.it.desc || "";
  $("#dlgNotes").value = line ? line.notes || "" : "";
  $("#dlgGroups").innerHTML = groups.map((g, gi) => {
    const multi = g.type === "addon" && !g.single, req = g.type === "size" || (g.type === "choice" && g.required !== false);
    return `<fieldset class="dlg-group" data-g="${gi}">
      <legend>${esc(g.label)} <small>${req ? "Required" : multi ? (g.max ? `Optional · up to ${g.max}` : "Optional · pick any") : "Optional"}</small></legend>
      ${g.list.map((o, ci) => {
        const checked = multi ? (cur.sel[gi] || []).includes(ci) : cur.sel[gi] === ci;
        const price = o.price ? (g.type === "size" ? fmt(num(o.price)) : "+" + fmt(num(o.price))) : "";
        return `<label class="dlg-opt"><input type="${multi ? "checkbox" : "radio"}" name="g${gi}" value="${ci}"${checked ? " checked" : ""}${req ? " required" : ""}>
          <span>${esc(o.name)}</span><em>${price}</em></label>`;
      }).join("")}
      ${!req && !multi ? `<label class="dlg-opt none"><input type="radio" name="g${gi}" value=""${cur.sel[gi] == null ? " checked" : ""}><span>No thanks</span><em></em></label>` : ""}
    </fieldset>`;
  }).join("");
  updateDlg();
  dlg.showModal();
}
function readSel(){
  const groups = groupsFor(cur.cat, cur.it), sel = {};
  groups.forEach((g, gi) => {
    const inputs = [...$("#dlgGroups").querySelectorAll(`[name="g${gi}"]:checked`)].map(i => i.value).filter(v => v !== "").map(Number);
    if (g.type === "addon" && !g.single){ if (inputs.length) sel[gi] = inputs; }
    else if (inputs.length) sel[gi] = inputs[0];
  });
  return sel;
}
function updateDlg(){
  cur.sel = readSel();
  $("#dlgQty").textContent = cur.qty;
  $("#dlgAdd").textContent = `${cur.editIndex != null ? "Update" : "Add to order"} · ${fmt(unitPrice(cur.cat, cur.it, cur.sel) * cur.qty)}`;
}
$("#dlgGroups").addEventListener("change", e => {
  // respect "up to N" limits on add-on groups
  const fs = e.target.closest("fieldset"), g = groupsFor(cur.cat, cur.it)[+fs.dataset.g];
  if (g && g.max && e.target.checked && fs.querySelectorAll("input:checked").length > g.max){ e.target.checked = false; fs.classList.add("need"); setTimeout(() => fs.classList.remove("need"), 900); }
  updateDlg();
});
dlg.addEventListener("click", e => {
  const q = e.target.closest("[data-q]"); if (q){ cur.qty = Math.max(1, Math.min(50, cur.qty + +q.dataset.q)); updateDlg(); }
  if (e.target === dlg) dlg.close(); // click on the backdrop
});
$("#dlgClose").onclick = () => dlg.close();
$("#dlgForm").addEventListener("submit", e => {
  e.preventDefault();
  const missing = $("#dlgGroups").querySelector("fieldset:has([required]):not(:has(:checked))");
  if (missing){ missing.classList.add("need"); missing.scrollIntoView({ block: "nearest" }); return; }
  const line = { key: cur.key, sel: readSel(), qty: cur.qty, notes: $("#dlgNotes").value.trim() };
  if (cur.editIndex != null) cart[cur.editIndex] = line; else cart.push(line);
  saveCart(); dlg.close();
  if (cur.editIndex == null) pulseFab();
});

/* ================= CART ================= */
function lineInfo(l){
  const f = findItem(l.key); if (!f) return null;
  const unit = unitPrice(f.cat, f.it, l.sel);
  return { ...f, unit, total: unit * l.qty, opts: describe(f.cat, f.it, l.sel) };
}
function saveCart(){ mem.set(KEY_CART, cart); renderCart(); }
function renderCart(){
  // drop lines whose item was removed from the menu since they were added
  cart = cart.filter(l => findItem(l.key));
  const lines = cart.map(lineInfo), sub = lines.reduce((s, l) => s + l.total, 0), count = cart.reduce((s, l) => s + l.qty, 0);
  $("#cartLines").innerHTML = !cart.length ? `<p class="cart-empty">Your order is empty. Tap any dish to add it.</p>` :
    lines.map((l, i) => `<div class="c-line" data-i="${i}">
      <div class="c-main"><b>${esc(l.it.name)}</b>${l.opts ? `<span>${esc(l.opts)}</span>` : ""}${cart[i].notes ? `<span class="c-note">“${esc(cart[i].notes)}”</span>` : ""}
        <button class="c-edit" data-a="edit">Edit</button></div>
      <div class="c-side"><span class="c-total">${fmt(l.total)}</span>
        <div class="qty sm"><button data-a="dec" aria-label="One less ${esc(l.it.name)}">−</button><span>${cart[i].qty}</span><button data-a="inc" aria-label="One more ${esc(l.it.name)}">+</button></div></div>
    </div>`).join("");
  const who = mem.get(KEY_WHO) || {};
  $("#cartFoot").innerHTML = !cart.length ? "" : `
    <div class="c-sub"><span>Subtotal</span><b>${fmtExact(sub)}</b></div>
    <p class="c-tax">Plus tax. You pay when you pick up.</p>
    <label class="field"><span class="flabel">Your name</span><input id="oName" autocomplete="name" value="${esc(who.name || "")}" required></label>
    <label class="field"><span class="flabel">Pickup time</span><input id="oTime" value="${esc(who.time || "As soon as possible")}" placeholder="As soon as possible, or e.g. 6:30 pm"></label>
    <label class="field"><span class="flabel">Anything else?</span><textarea id="oNotes" rows="2" placeholder="Allergies, cutlery, extra napkins…">${esc(who.notes || "")}</textarea></label>
    <button class="btn btn-gold c-send" id="sendText"><svg><use href="#i-bag"/></svg>Text my order</button>
    <div class="c-alt"><button class="link-btn" id="copyOrder">Copy order</button> · <a class="link-btn" href="tel:${phone}">Call ${prettyPhone(phone)}</a> · <button class="link-btn" id="clearCart">Start over</button></div>
    <p class="c-how">This opens your messages app with the order written out to ${prettyPhone(phone)}. Press send and our AI assistant will confirm it.</p>`;
  $("#cartFab").hidden = !count;
  $("#fabCount").textContent = count + (count === 1 ? " item" : " items");
  $("#fabTotal").textContent = fmt(sub);
}
$("#cartLines").addEventListener("click", e => {
  const b = e.target.closest("[data-a]"); if (!b) return;
  const i = +b.closest(".c-line").dataset.i;
  if (b.dataset.a === "inc") cart[i].qty = Math.min(50, cart[i].qty + 1);
  if (b.dataset.a === "dec"){ cart[i].qty--; if (cart[i].qty < 1) cart.splice(i, 1); }
  if (b.dataset.a === "edit") return openItem(cart[i].key, i);
  saveCart();
});
$("#cartFoot").addEventListener("input", () => mem.set(KEY_WHO, { name: $("#oName")?.value, time: $("#oTime")?.value, notes: $("#oNotes")?.value }));
$("#cartFoot").addEventListener("click", e => {
  if (e.target.closest("#sendText")) sendOrder();
  if (e.target.closest("#copyOrder")) copyOrder();
  if (e.target.closest("#clearCart") && confirm("Clear your order and start over?")){ cart = []; saveCart(); }
});

function orderText(){
  const lines = cart.map(lineInfo), sub = lines.reduce((s, l) => s + l.total, 0);
  const name = $("#oName").value.trim(), time = $("#oTime").value.trim() || "As soon as possible", notes = $("#oNotes").value.trim();
  const out = ["New pickup order from the Haveli website", `Name: ${name}`, `Pickup: ${time}`, ""];
  lines.forEach((l, i) => {
    out.push(`${cart[i].qty} x ${l.it.name}${l.opts ? ` (${l.opts})` : ""} - ${fmtExact(l.total)}`);
    if (cart[i].notes) out.push(`   Note: ${cart[i].notes}`);
  });
  out.push("", `Subtotal: ${fmtExact(sub)} (before tax, paying at pickup)`);
  if (notes) out.push(`Notes: ${notes}`);
  return out.join("\n");
}
function needName(){
  const n = $("#oName"); if (n.value.trim()) return false;
  n.focus(); n.closest(".field").classList.add("need"); return true;
}
function sendOrder(){
  if (needName()) return;
  // "?&body=" is read correctly by both iPhone and Android messages apps
  location.href = `sms:${phone}?&body=${encodeURIComponent(orderText())}`;
  $("#cartFoot .c-how").innerHTML = `<b>Your messages app should be open with the order.</b> Press send and we'll confirm by text. On a computer? Use <b>Copy order</b> and text it to ${prettyPhone(phone)}.`;
}
async function copyOrder(){
  if (needName()) return;
  try{ await navigator.clipboard.writeText(orderText()); $("#copyOrder").textContent = "Copied ✓"; }
  catch{ prompt("Copy your order:", orderText()); }
}

/* ================= MOBILE CART SHEET ================= */
const cartEl = $("#cart");
$("#cartFab").onclick = () => { cartEl.classList.add("open"); document.body.style.overflow = "hidden" };
$("#cartClose").onclick = () => { cartEl.classList.remove("open"); document.body.style.overflow = "" };
function pulseFab(){ const f = $("#cartFab"); f.classList.remove("pulse"); void f.offsetWidth; f.classList.add("pulse"); }

/* ================= LOAD ================= */
(window.MENU_DATA ? Promise.resolve(window.MENU_DATA) : fetch("data/menu.json?v=" + Date.now(), { cache: "no-store" }).then(r => r.json()))
  .then(d => { MENU = d; if (d.orderPhone) phone = d.orderPhone; renderMenu(); renderCart(); })
  .catch(() => { listEl.innerHTML = `<p class="empty" style="display:block">The menu didn't load. Please refresh, or call us at ${prettyPhone(phone)}.</p>`; });
function clone(o){ return JSON.parse(JSON.stringify(o)) }
