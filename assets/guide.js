/* guide tabs */
const gtabs = [...document.querySelectorAll(".gtab")];
function selectTab(i){
  gtabs.forEach((t,j)=>{ t.setAttribute("aria-selected", i===j); t.tabIndex = i===j?0:-1;
    document.getElementById(t.getAttribute("aria-controls")).classList.toggle("on", i===j); });
}
gtabs.forEach((t,i)=>{
  t.addEventListener("click",()=>selectTab(i));
  t.addEventListener("keydown",e=>{
    if(e.key==="ArrowRight"||e.key==="ArrowLeft"){ const n=(i+(e.key==="ArrowRight"?1:-1)+gtabs.length)%gtabs.length; selectTab(n); gtabs[n].focus(); }
  });
});
selectTab(0);

