/* ================= MENU DATA =================
   item: [name, price, alsoKnownAs, description, flags]
   flags: v = vegetarian · n = meat/fish · p = choose protein · t = Canadian twist · s = chef's pick
          h1 = medium · h2 = medium-hot · h3 = very hot */
const MENU = [
 {id:"starters",t:"Starters",items:[
  ["The Samosa Pair","9 / 10","Samosa","Two, with tamarind and mint. Vegetable 9 · Chicken 10.","v"],
  ["Yogurt Bombs","8","Dahi Puri","Crisp puris, potato, chickpeas, yogurt, chutneys, sev.","v"],
  ["Crushed Potato Crunch","9","Aloo Tikki Chaat","Crispy potato patties, yogurt, chutneys, onion and sev.","v"],
  ["Bombay Butter Buns","13","Pav Bhaji","Spiced mashed-vegetable curry, buttered toasted pav buns, onion, lemon.","v"],
  ["The Mumbai Slider","9","Vada Pav","Mumbai's burger: spiced potato fritter in a soft pav with garlic and green chutneys.","v"],
  ["Papad, Dressed or Naked","5 / 3","Masala or Plain Papad","Crisp papad; masala is topped with onion, tomato and cilantro.","v"],
  ["Crackle Fritters","11","Veg Pakoda","Vegetables in spiced gram-flour batter, fried crispy. Mint chutney.","v"],
  ["The 65","14","Chicken 65","Crispy fried chicken, curry leaf, yogurt-chili glaze, lime.","n h1"],
  ["Firecracker Paneer","13","Chili Paneer","Crunchy paneer in Indo-Chinese chili glaze.","v h1"],
  ["Street Popcorn Chicken","14","Chaat Popcorn Chicken","Bite-sized crispy chicken, chaat masala, curry leaf, mint dip.","n t"],
  ["Naan Pull-Aparts","13","Garlic Cheese Naan","Mozzarella-stuffed naan, garlic ghee. Dip: butter masala, tikka or korma.","v t"],
  ["Nacho Papad-os","16","Papadum Nachos","Papadum shards, chana masala, cheese, mango salsa, yogurt, jalapeño. Butter chicken +5.","v t"],
  ["Butter Chicken Poutine","16","","Fries, cheese curds, butter chicken gravy, cilantro, pickled onion.","n t s"],
  ["Maritime Masala Bites","16","Fish & Chips Bites","Ajwain-battered haddock, masala chip crumb, curry-leaf tartar.","n t"]]},
 {id:"street",t:"Naan Street Food",fresh:1,note:"All handhelds come with masala fries. Upgrade to chaat fries +3 or butter chicken poutine +5.",items:[
  ["The Makhani Crunch","18","Butter Chicken Crispy Sandwich","Fried chicken dunked in butter masala, mint slaw, pickled onion, naan bun.","n t s"],
  ["The Kolkata Wrap","16","Tandoori Chicken Kathi Roll","Paratha, tandoori chicken, onion, green chutney.","n"],
  ["Hakka Heat Melt","17","Chili Chicken Naan Melt","Chili chicken, peppers and mozzarella in naan.","n t h1"],
  ["The Chaat Stack","15","Aloo Tikki Sandwich","Potato-pea patty, tamarind, mint, slaw, sev.","v t"],
  ["The Garam Smash","18","Masala Smash Burger","Double patty, masala onions, cheddar, chutney mayo.","n t"],
  ["Skewer & Swirl","16","Seekh Kebab Naan Roll","Lamb-and-beef kebab, mint raita, pickled onion, naan.","n"]]},
 {id:"wings",t:"Wings",wings:1,note:"Marinated, very thinly breaded and fried super crispy, then hand-tossed in Chef Vic's signature blend. Juicy, meaty wings with some of the most meat on the bone in Fredericton. Raita and pickled onion on the side. Pick your flavour:",items:[
  ["Tandoori","","","Our classic tandoori spice, crisped in the tandoor instead of the fryer.","n t"],
  ["Butter Chicken","","","Our makhani gravy, reduced thick. Mild.","n t"],
  ["Honey Hot","","","Honey and chili, sticky with a kick.","n t h2"],
  ["Salt & Pepper","","","Dry-tossed with cracked pepper, chaat masala and lime.","n t"],
  ["Pain in the Butt","","","You know the drill. Very hot.","n t h3"]]},
 {id:"curries",t:"Curries",proteins:1,note:"Served with basmati rice. Add naan +4. Choose mild, medium or hot.",items:[
  ["House Butter Chicken","22","","The Haveli classic. Rich tomato, cream, cashew and fenugreek sauce. Mild.","n s"],
  ["Tikka Masala","22","","Tandoor-charred pieces in spiced tomato cream sauce. Medium.","p h1"],
  ["Dhaba Curry","22","","Smoky, roadside-style curry in onion-tomato gravy. Best with bone-in goat. Medium-hot.","p h2"],
  ["Korma","22","","Rich, creamy gravy with coconut, almond and warm spices. Mild.","p"],
  ["Nizami Handi","24","","Creamy and sweet: the Hyderabadi white curry of cashew, cream, coconut and green cardamom. No chili, no tomato. Mild.","p s"],
  ["Paneer Tikka Masala","21","","Grilled paneer tikka in a flavourful tomato-based gravy. Medium.","v h1"],
  ["Kadai","21","","Bell peppers, onion and tomato in kadai masala. Medium-hot.","p h2"],
  ["Daal Makhani","19","","Black lentils and kidney beans slow-cooked overnight, finished with butter and cream. Mild.","v"]]},
 {id:"classics",t:"Thaali & Punjabi Favourites",note:"The dishes Fredericton orders most. A thaali is a whole meal on one tray: plain rice, butter naan or two rotis, raita and a sweet.",items:[
  ["Veg Thaali","21","","One daal and two vegetable curries.","v"],
  ["Non-Veg Thaali","26","","Butter chicken, lamb curry and chickpeas.","n"],
  ["Chicken Tikka Biryani","22","","Basmati layered with grilled chicken tikka, fried onions and whole spices. Raita on the side.","n"],
  ["Chana Bhatura","18","","Spicy chickpea curry with two puffed, deep-fried bhatura. Extra bhatura +5.","v"],
  ["Amritsari Kulcha","19","","Stuffed, tandoor-baked flatbread brushed with butter, served with chole or daal.","v"]]},
 {id:"tandoor",t:"Tandoor & Grill",items:[
  ["Tandoori Chicken","18 / 32","","Bone-in chicken, overnight yogurt-spice marinade, charred in the tandoor. Half 18 · Full 32.","n"],
  ["Lahori Chicken Tikka","20","","Boneless chicken in a Lahori spice blend, grilled smoky in the tandoor. Mint chutney, onion, lemon.","n"],
  ["Achari Chicken Tikka","20","","Boneless chicken in a tangy pickling-spice marinade of mustard, fennel and nigella, charred in the tandoor.","n"],
  ["Afghani Chicken","20","","Chicken in a creamy cashew, yogurt and black-pepper marinade, charred gently. Mild.","n"],
  ["Masala Steak Frites","32","","Tandoor-charred striploin, green chutney chimichurri, masala fries.","n t s"]]},
 {id:"sides",t:"Breads, Rice & Sides",items:[
  ["Naan","4 / 5 / 5 / 6","","Butter · garlic · masala · garlic chili.","v"],
  ["Roti","3 / 4 / 4","","Plain · butter · ghee.","v"],
  ["Plain Rice","5","","Steamed basmati.","v"],
  ["Raita","4","","Cool yogurt with cucumber.","v"],
  ["Extra Gravy","5","","","v"]]},
 {id:"sweets",t:"Sweets",items:[
  ["Gulab Jamun Sticky Toffee","9","","Syrup-soaked milk dumplings, jaggery toffee, vanilla ice cream.","v t s"],
  ["Mango Kulfi Sundae","9","","Whipped cream, pistachio, rose syrup.","v t"]]},
 {id:"bar",t:"From the Bar",note:"Draught, local bottles and a short wine list. Ask your server.",items:[
  ["Tamarind Margarita","15","","","v"],
  ["Mango Chili Mule","14","","","v"],
  ["Masala Old Fashioned","16","","","v"],
  ["Rose Gin Fizz","15","","","v"],
  ["Mango Lassi","8","","The crowd favourite.","v"],
  ["Masala Chai","4","","","v"]]},
 {id:"kids",t:"Little Haveli",note:"For guests 10 and under. Everything here is made mild, with no chili anywhere.",items:[
  ["Tikka Nuggets & Fries","10","","Yogurt-marinated chicken bites, crispy coating, fries and honey-mango dip.","n t"],
  ["Creamy Butter Chicken Rice Bowl","11","","Mild butter chicken over basmati rice.","n"],
  ["Naan Grilled Cheese","9","","Buttery naan with melted cheddar and mild tomato-cashew dip.","v t"],
  ["Butter Chicken Mac & Cheese","11","","Creamy cheddar mac stirred with mild butter chicken sauce.","n t"],
  ["Build-Your-Own Naan Pizza","10","","Naan, mild tomato sauce and mozzarella, plus up to three toppings: chicken tikka, sweet corn, peppers, paneer, pepperoni, pineapple or extra cheese. We'll draw a face on it if you ask.","v t"],
  ["Mango Kulfi Pop","+2","","Finish with one.","v"]]}
];

const PROTEINS = [["Tofu",20],["Paneer",21],["Chicken",22],["Beef",25],["Lamb",26],["Goat",26]];
const extras = {
  proteins: `<div class="cat-extra"><div class="eyebrow" style="margin-bottom:12px">Choose your protein</div><div class="proteins">${PROTEINS.map(([n,p])=>`<div class="prot"><b>${n}</b><span>${p}</span></div>`).join("")}</div></div>`,
  wings: `<div class="cat-extra wing-prices">${[["1 lb",17],["2 lb",30],["4 lb Platter",56]].map(([n,p])=>`<div class="prot"><b>${n}</b><span>${p}</span></div>`).join("")}</div>`
};

const chips = $("#chips"), body = $("#menuBody");
chips.innerHTML = MENU.map((c,i)=>`<button class="chip${i?"":" on"}" data-id="${c.id}">${c.t}<small>${c.items.length}</small></button>`).join("");

function heatPill(f){
  const m = f.match(/h(\d)/); if(!m) return "";
  const lbl = ["","Medium","Med-hot","Very hot"][m[1]];
  return `<i class="pill hot">${chiliSvg.repeat(+m[1])}${lbl}</i>`;
}
function renderMenu(){
  const q = $("#q").value.trim().toLowerCase();
  const veg = $("#vegOnly").checked, tw = $("#twistOnly").checked;
  const rx = q ? new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g,"\\$&") + ")","ig") : null;
  const hl = s => rx ? esc(s).replace(rx,"<mark>$1</mark>") : esc(s);
  let shown = 0;
  body.innerHTML = MENU.map(c=>{
    const items = c.items.filter(([n,p,a,d,f])=>{
      const fl = f.split(" ");
      if (veg && fl.includes("n")) return false;
      if (tw && !fl.includes("t")) return false;
      if (q && !(n+" "+a+" "+d+" "+c.t).toLowerCase().includes(q)) return false;
      return true;
    });
    const btn = chips.querySelector(`[data-id="${c.id}"]`);
    btn.hidden = !items.length; btn.querySelector("small").textContent = items.length;
    if (!items.length) return "";
    shown += items.length;
    return `<div class="cat" id="cat-${c.id}" data-id="${c.id}">
      <div class="cat-title"><svg class="leaf" style="color:var(--gold)" aria-hidden="true"><use href="#i-leaf"/></svg><h3>${c.t}</h3>${c.fresh?'<span class="new">New</span>':""}</div>
      ${c.note?`<p class="cat-note">${c.note}</p>`:""}
      ${c.proteins?extras.proteins:""}${c.wings?extras.wings:""}
      <div class="items">${items.map(([n,p,a,d,f])=>{
        const fl=f.split(" "), kind = fl.includes("n")?"n":fl.includes("p")?"p":"v";
        const title = {n:"Contains meat or fish",p:"Choose your protein",v:"Vegetarian"}[kind];
        return `<div class="item">
          <div class="item-top">
            <span class="item-name"><i class="vb ${kind}" title="${title}"></i>${hl(n)}${fl.includes("t")?`<i class="pill twist">${leafSvg}Twist</i>`:""}${heatPill(f)}${fl.includes("s")?'<i class="pill star">Chef\'s pick</i>':""}</span>
            ${p?`<span class="dots"></span><span class="item-price">${p.startsWith("+")?p:"$"+p}</span>`:""}
          </div>
          ${a?`<span class="aka">${hl(a)}</span>`:""}
          ${d?`<p>${hl(d)}</p>`:""}
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
renderMenu();

