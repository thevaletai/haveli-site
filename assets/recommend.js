/* ================= "LET HAVELI PICK" RECOMMENDER =================
   Scores every dish in data/menu.json against what the guest tells us
   (cravings, diet, spice, age, group, hunger, allergies, adventurousness)
   and builds a small meal with a reason for each pick. Runs entirely in the browser.
   If data/menu.json ever has "aiEndpoint", a free-text box appears that sends the same
   answers plus the guest's own words to that endpoint (e.g. a Claude-powered worker). */
(() => {
  const root = document.getElementById("recommender");
  if (!root) return;

  /* ---------- questions ---------- */
  const Q = {
    cravings: { label: "What are you craving?", multi: true, options: [
      ["creamy", "Rich & creamy"], ["smoky", "Smoky, from the tandoor"], ["street", "Street food & snacks"],
      ["rice", "Biryani & rice"], ["wok", "Indo-Chinese"], ["fusion", "Canadian twists"],
      ["comfort", "Lentils & home-style"], ["sweet", "Something sweet"] ] },
    diet: { label: "How do you eat?", options: [["any", "I eat everything"], ["veg", "Vegetarian"]] },
    proteins: { label: "Favourite proteins", multi: true, hideWhen: { diet: "veg" }, options: [
      ["chicken", "Chicken"], ["lamb", "Lamb & goat"], ["beef", "Beef"], ["fish", "Fish"], ["paneer", "Paneer"] ] },
    spice: { label: "Spice level", options: [["0", "Mild"], ["1", "Medium"], ["2", "Hot"], ["3", "Double hot"]] },
    age: { label: "Who's eating?", options: [["adult", "Adult (19+)"], ["teen", "Teen"], ["kid", "Kid (10 & under)"]] },
    group: { label: "Party size", options: [["1", "Just me"], ["2", "Two of us"], ["family", "Family with kids"], ["big", "Big group"]] },
    hunger: { label: "How hungry?", options: [["light", "Light bite"], ["hungry", "Hungry"], ["starving", "Starving"]] },
    style: { label: "Go with", options: [["familiar", "Crowd favourites"], ["new", "Something new"]] },
    allergies: { label: "Allergies or avoid", multi: true, options: [["nuts", "Nuts"], ["dairy", "Dairy"], ["gluten", "Gluten"]] },
  };
  const DEFAULTS = { cravings: [], diet: "any", proteins: [], spice: "1", age: "adult", group: "2", hunger: "hungry", style: "familiar", allergies: [] };
  const KEY = "haveli-picks-v1";
  let ans = { ...DEFAULTS, ...(load() || {}) };
  function load(){ try{ return JSON.parse(localStorage.getItem(KEY)) }catch{ return null } }
  function save(){ try{ localStorage.setItem(KEY, JSON.stringify(ans)) }catch{} }

  /* ---------- dish profiles, worked out from the menu text ---------- */
  const has = (t, words) => words.some(w => t.includes(w));
  function profile(cat, it){
    const t = [it.name, it.aka, it.desc, cat.title].join(" ").toLowerCase();
    const p = { tags: new Set(), proteins: new Set(), allergens: new Set(), cat, it };
    // proteins
    if (has(t, ["chicken", "wings", "moose bites"])) p.proteins.add("chicken");
    if (has(t, ["lamb", "goat", "gosht", "mutton"])) p.proteins.add("lamb");
    if (has(t, ["beef", "steak", "striploin", "burger", "patty"])) p.proteins.add("beef");
    if (has(t, ["fish", "haddock", "shrimp"])) p.proteins.add("fish");
    if (has(t, ["paneer"])) p.proteins.add("paneer");
    // proteins the guest can choose: the dish's own options plus its category add-ons (e.g. curries)
    [...(it.groups || []), ...(it.noCatGroups ? [] : (cat.groups || []))].forEach(g => g.list.forEach(o => { const n = o.name.toLowerCase();
      if (/chicken/.test(n)) p.proteins.add("chicken"); if (/beef/.test(n)) p.proteins.add("beef"); if (/paneer/.test(n)) p.proteins.add("paneer");
      if (/lamb|goat/.test(n)) p.proteins.add("lamb"); if (/fish|shrimp/.test(n)) p.proteins.add("fish"); }));
    p.isDrink = cat.section === "bar";
    // cravings
    if (has(t, ["cream", "butter", "korma", "malai", "makhani", "coconut", "cashew", "kofta", "handi", "mango curry", "mac"])) p.tags.add("creamy");
    if (has(t, ["tandoor", "tikka", "grill", "charred", "clay"])) p.tags.add("smoky");
    if (["starters", "street"].includes(cat.id) || has(t, ["chaat", "pav", "puri", "slider", "nachos", "pakora", "samosa", "fritter"])) p.tags.add("street");
    if (has(t, ["biryani", "rice"])) p.tags.add("rice");
    if (cat.id === "indo-chinese" || has(t, ["hakka", "chilli", "chili glaze", "manchurian", "noodle"])) p.tags.add("wok");
    if (it.twist) p.tags.add("fusion");
    if (cat.section === "bar") { p.tags.clear(); if (has(t, ["mango", "colada", "lassi", "sweet"])) p.tags.add("sweet"); }
    if (has(t, ["daal", "dal ", "lentil", "chana", "chickpea", "saag", "aloo", "home-style", "homestyle"])) p.tags.add("comfort");
    if (cat.id === "desserts" || has(t, ["gulab", "kheer", "sundae", "kulfi", "toffee"])) p.tags.add("sweet");
    // allergens: the admin's list wins; otherwise read them from the description
    if (Array.isArray(it.allergens)) it.allergens.forEach(a => p.allergens.add(a));
    else {
      if (has(t, ["cashew", "almond", "pistachio", "peanut", "nut "])) p.allergens.add("nuts");
      if (has(t, ["cream", "butter", "yogurt", "yoghurt", "paneer", "cheese", "cheddar", "mozzarella", "ghee", "malai", "kulfi", "ice cream", "raita", "lassi", "curd", "milk", "kheer", "makhani", "mac", "naan", "kulcha", "bhatura", "paratha", "colada", "chai"])) p.allergens.add("dairy");
      if (has(t, ["naan", "roti", "paratha", "bread", "bun", "pav", "brioche", "breaded", "noodle", "wrap", "puri", "poori", "bhatura", "kulcha", "papdi", "samosa", "pizza", "soy", "mac"])) p.allergens.add("gluten");
    }
    return p;
  }

  /* ---------- scoring ---------- */
  function score(p, a){
    const { it, cat } = p, why = [];
    const heat = it.heat || 0, maxHeat = a.age === "kid" ? 0 : +a.spice;
    if (it.hidden) return null;
    if (a.age === "kid" && cat.id !== "kids" && cat.id !== "desserts" && cat.section !== "bar") {
      if (heat > 0 || p.tags.has("smoky") && !p.tags.has("creamy")) return null;
    }
    if (heat > maxHeat) return null;
    if (a.diet === "veg" && it.type === "meat") return null;
    for (const al of a.allergies) if (p.allergens.has(al)) return null;
    let s = 1;
    // cravings
    const hits = a.cravings.filter(c => p.tags.has(c));
    s += hits.length * 4;
    hits.forEach(c => why.push({ creamy: "rich and creamy", smoky: "charred in the tandoor", street: "street-food style", rice: "fragrant rice", wok: "wok-tossed Indo-Chinese", fusion: "a Canadian twist", comfort: "home-style comfort", sweet: "a sweet finish" }[c]));
    // proteins
    if (a.diet !== "veg" && a.proteins.length) {
      const ph = a.proteins.filter(x => p.proteins.has(x));
      if (ph.length) { s += 3; why.push(`your ${ph[0] === "lamb" ? "lamb & goat" : ph[0]}`); }
      else if (it.type === "meat") s -= 2;
    }
    if (a.diet === "veg" && it.type !== "meat") { s += 1; if (it.type === "veg" && !p.isDrink) why.push("vegetarian"); }
    // spice: reward dishes near the guest's comfort zone
    if (maxHeat > 0 && heat === maxHeat) { s += 1.5; why.push(["", "a gentle kick", "proper heat", "serious heat"][heat]); }
    if (maxHeat === 0 && heat === 0 && a.age !== "kid" && !p.isDrink) why.push("mild");
    // sensible defaults so every pick has a reason
    if (!why.length) {
      const n = it.name.toLowerCase();
      if (cat.id === "sides") why.push(/rice/.test(n) ? "goes with everything" : /raita|yogurt/.test(n) ? "cools the heat" : "to scoop up every bit");
      else if (cat.id === "desserts") why.push("a sweet finish");
      else if (p.isDrink) why.push(/nb|brewing/i.test(it.desc || "") ? "a local NB brew" : cat.id === "zero-proof" ? "alcohol-free" : "pairs well with spice");
    }
    // style
    if (a.style === "familiar" && it.chefsPick) { s += 3; why.unshift("a Haveli favourite"); }
    else if (it.chefsPick) { s += 1; }
    if (a.style === "new" && it.twist) { s += 3; if (!why.includes("a Canadian twist")) why.push("a Canadian twist"); }
    if (a.style === "new" && !it.chefsPick && it.desc) s += 0.5;
    // kids
    if (a.age === "kid" && cat.id === "kids") { s += 6; why.unshift("made for kids, zero spice"); }
    return { p, s, why: [...new Set(why.filter(Boolean))].slice(0, 3) };
  }

  /* ---------- build the meal ---------- */
  const COURSE = {
    starter: c => ["starters", "wings"].includes(c.id),
    main: c => ["street", "tandoor", "biryani", "curries", "thaali", "favourites", "indo-chinese", "wings"].includes(c.id),
    side: c => c.id === "sides",
    dessert: c => c.id === "desserts",
    kids: c => c.id === "kids",
    drink: c => c.section === "bar",
  };
  function pick(all, test, n, used, opts = {}){
    const out = [], cats = new Set();
    for (const r of all.filter(r => test(r.p.cat) && !used.has(r.p.it.name) && !r.p.it.menuOnly)
      .filter(r => !opts.filter || opts.filter(r)).sort((a, b) => b.s - a.s)) {
      if (out.length >= n) break;
      if (opts.spread && cats.has(r.p.cat.id) && out.length < n - 0) { if (cats.size < 3) continue; }
      out.push(r); cats.add(r.p.cat.id); used.add(r.p.it.name);
    }
    // top up if spreading across sections left gaps
    if (out.length < n) for (const r of all.filter(r => test(r.p.cat) && !used.has(r.p.it.name) && !r.p.it.menuOnly).sort((a, b) => b.s - a.s)) {
      if (out.length >= n) break; out.push(r); used.add(r.p.it.name);
    }
    return out;
  }
  function recommend(a){
    const cats = (window.__HAVELI_MENU?.categories || []).filter(c => !c.hidden);
    const all = [];
    cats.forEach(c => c.items.forEach(it => { const r = score(profile(c, it), a); if (r) all.push(r); }));
    const used = new Set(), sections = [];
    const groupN = { "1": 1, "2": 2, family: 3, big: 4 }[a.group] || 2;
    const isKid = a.age === "kid";
    if (isKid) {
      sections.push(["For the little one", pick(all, COURSE.kids, 2, used)]);
      // every kids meal already comes with a free gulab jamun (the menu-only "Sweet Treat")
    } else {
      const wantsSweetOnly = a.cravings.length === 1 && a.cravings[0] === "sweet";
      if (a.hunger !== "light" || groupN > 1) sections.push(["Start with", pick(all, COURSE.starter, a.hunger === "starving" || groupN >= 3 ? 2 : 1, used)]);
      if (!wantsSweetOnly) sections.push([groupN > 1 ? "Mains to share" : "Your main", pick(all, COURSE.main, a.hunger === "light" ? 1 : Math.min(groupN, 3), used, { spread: true })]);
      if (a.hunger !== "light") sections.push(["On the side", pick(all, COURSE.side, a.hunger === "starving" || groupN >= 3 ? 2 : 1, used,
        { filter: r => /naan|roti|paratha|rice|raita|kulcha/i.test(r.p.it.name) })]);
      if (a.group === "family") sections.push(["For the kids", pick(all, COURSE.kids, 1, used)]);
      if (a.cravings.includes("sweet") || a.hunger === "starving" || groupN >= 3) sections.push(["Sweet finish", pick(all, COURSE.dessert, 1, used)]);
      const zeroProof = cats.find(c => c.id === "zero-proof");
      const drinks = a.age === "adult" ? pick(all, COURSE.drink, 1, used) : pick(all, c => c === zeroProof, 1, used);
      sections.push(["To drink", drinks]);
    }
    return sections.filter(([, list]) => list.length);
  }

  /* ---------- render ---------- */
  const flame = '<svg class="rc-flame" aria-hidden="true"><use href="#i-chili"/></svg>';
  function renderForm(){
    const ai = window.__HAVELI_MENU?.aiEndpoint;
    root.querySelector("#rcForm").innerHTML = Object.entries(Q).map(([k, q]) => {
      const hidden = q.hideWhen && Object.entries(q.hideWhen).some(([hk, hv]) => ans[hk] === hv);
      return `<fieldset class="rc-q rc-${k}${hidden ? " rc-off" : ""}"><legend>${q.label}</legend><div class="rc-opts">${q.options.map(([v, l]) => {
        const on = q.multi ? ans[k].includes(v) : ans[k] === v;
        const extra = k === "spice" ? flame.repeat(+v) : "";
        return `<button type="button" class="rc-chip${on ? " on" : ""}" data-k="${k}" data-v="${v}" aria-pressed="${on}">${extra}${l}</button>`;
      }).join("")}</div></fieldset>`;
    }).join("") + (ai ? `<label class="rc-q rc-free"><span class="rc-legend">Or tell us in your own words</span><textarea id="rcFree" rows="2" placeholder="e.g. my daughter hates onions, I love lamb and want something I've never tried"></textarea></label>` : "");
  }
  function cardHtml(r){
    const { it, cat } = r.p, key = cat.id + "|" + it.name, price = displayPrice(it);
    const orderable = (typeof ORDERING_OPEN === "undefined" || ORDERING_OPEN) && !cat.dineInOnly && !it.menuOnly;
    return `<article class="rc-card">
      <div class="rc-top"><h4>${esc(it.name)}</h4><span class="rc-price">${esc(money(price))}</span></div>
      ${it.desc ? `<p class="rc-desc">${esc(it.desc)}</p>` : ""}
      ${r.why.length ? `<p class="rc-why"><b>Why:</b> ${esc(r.why.join(" · "))}</p>` : ""}
      <div class="rc-acts">${orderable ? `<a class="rc-add" href="order.html#add=${encodeURIComponent(key)}">+ Add to order</a>` : (cat.dineInOnly ? `<span class="rc-dine">Dine-in only</span>` : "")}
        <button type="button" class="rc-see" data-cat="${esc(cat.id)}" data-name="${esc(it.name)}">See on menu</button></div>
    </article>`;
  }
  function renderResults(sections, note){
    const res = root.querySelector("#rcResults");
    if (!sections.length) { res.innerHTML = `<p class="rc-empty">Nothing on the menu fits all of that. Try a higher spice level or fewer allergies, or call us and we'll make it work.</p>`; return; }
    res.innerHTML = `<div class="rc-head"><h3>Your Haveli picks</h3><button type="button" class="rc-again" id="rcShuffle">Show me others</button></div>
      ${note ? `<p class="rc-note">${esc(note)}</p>` : ""}
      ${sections.map(([title, list]) => `<div class="rc-course"><h5>${esc(title)}</h5><div class="rc-cards">${list.map(cardHtml).join("")}</div></div>`).join("")}
      <p class="rc-allergy">${ans.allergies.length ? "We've left out dishes whose description mentions " + ans.allergies.join(", ") + ". " : ""}We cook in a shared kitchen with dairy, nuts, gluten and shared fryers, so always tell us about allergies before ordering.</p>`;
    res.hidden = false;
    res.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }

  /* "Show me others" skips the dishes just shown */
  let shown = new Set();
  function run(fresh){
    if (fresh) shown = new Set();
    const menuBackup = window.__HAVELI_MENU;
    const filtered = { ...menuBackup, categories: menuBackup.categories.map(c => ({ ...c, items: c.items.filter(i => !shown.has(i.name)) })) };
    window.__HAVELI_MENU = filtered;
    let sections = recommend(ans);
    window.__HAVELI_MENU = menuBackup;
    if (!sections.length && shown.size) { shown = new Set(); sections = recommend(ans); }
    sections.forEach(([, list]) => list.forEach(r => shown.add(r.p.it.name)));
    renderResults(sections);
  }

  async function runAI(text){
    const res = root.querySelector("#rcResults");
    res.hidden = false; res.innerHTML = `<p class="rc-empty">Asking our menu expert…</p>`;
    try {
      const r = await fetch(window.__HAVELI_MENU.aiEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers: ans, message: text }) });
      if (!r.ok) throw new Error(r.status);
      const d = await r.json(); // { note?: string, picks: [{ name, why }] }
      const byName = {}; window.__HAVELI_MENU.categories.forEach(c => c.items.forEach(it => { byName[it.name] = { p: { it, cat: c } } }));
      const picks = (d.picks || []).map(x => byName[x.name] && { ...byName[x.name], why: [x.why].filter(Boolean) }).filter(Boolean);
      if (!picks.length) throw new Error("no picks");
      renderResults([["Picked for you", picks]], d.note);
    } catch { run(true); }
  }

  root.addEventListener("click", e => {
    const c = e.target.closest(".rc-chip");
    if (c) {
      const k = c.dataset.k, v = c.dataset.v, q = Q[k];
      if (q.multi) ans[k] = ans[k].includes(v) ? ans[k].filter(x => x !== v) : [...ans[k], v];
      else ans[k] = v;
      if (k === "age" && v === "kid") ans.spice = "0";
      save(); renderForm(); return;
    }
    if (e.target.closest("#rcGo")) {
      const free = root.querySelector("#rcFree")?.value.trim();
      if (free && window.__HAVELI_MENU?.aiEndpoint) runAI(free); else run(true);
      return;
    }
    if (e.target.closest("#rcShuffle")) { run(false); return; }
    if (e.target.closest("#rcReset")) { ans = { ...DEFAULTS }; save(); renderForm(); root.querySelector("#rcResults").hidden = true; return; }
    const see = e.target.closest(".rc-see");
    if (see) {
      const card = [...document.querySelectorAll(`#cat-${CSS.escape(see.dataset.cat)} .item`)].find(el => el.querySelector(".item-name")?.textContent.trim().startsWith(see.dataset.name));
      const target = card || document.getElementById("cat-" + see.dataset.cat);
      if (target) { target.scrollIntoView({ behavior: "smooth", block: "center" }); target.classList.add("rc-flash"); setTimeout(() => target.classList.remove("rc-flash"), 2200); }
    }
  });
  root.querySelector("#rcToggle")?.addEventListener("click", () => {
    const open = root.classList.toggle("open");
    root.querySelector("#rcToggle").setAttribute("aria-expanded", open);
  });

  (window.MENU_DATA ? Promise.resolve(window.MENU_DATA) : fetch("data/menu.json?v=" + Date.now(), { cache: "no-store" }).then(r => r.json()))
    .then(d => { window.__HAVELI_MENU = d; renderForm(); root.classList.add("ready"); })
    .catch(() => { root.hidden = true; });
})();
