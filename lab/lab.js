/* Consumer Behavior Test Lab — shared rendering.
   Used by the study page (lab/index.html) and the tutorial preview (abtest/index.html),
   so students see exactly what participants will see. */
(function(){
"use strict";
const BG = {white:"#ffffff", gray:"#e9edee", black:"#0b0b0b"};
const esc = s => String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

function fmtPrice(x){
  const n = Number(x); if(!isFinite(n)) return "";
  const [d,c] = n.toFixed(2).split(".");
  return `$${Number(d).toLocaleString()}<sup>${c}</sup>`;
}
function starsHTML(r){
  const v = Math.max(0, Math.min(5, Number(r)||0));
  return `<span class="stars"><span class="base">★★★★★</span><span class="fill" style="width:${(v/5*100).toFixed(1)}%">★★★★★</span></span>`;
}
function bgColor(study){ return BG[study.bg] || study.bg || BG.white; }

/* The two listings for one study in one version ("A" = original, "B" = redesign). */
function listings(study, version){
  const ex = study.extras || {}, pr = study.price || {mode:"none"}, cl = study.client || {}, co = study.comp || {};
  const pick = (k, who) => ex[k] ? ex[k][who] : null;
  const priceFor = who => pr.mode==="same" ? pr.value
    : pr.mode==="custom" ? (who==="comp" ? pr.comp : (version==="B" ? (pr.clientB!=null&&pr.clientB!=="" ? pr.clientB : pr.clientA) : pr.clientA))
    : null;
  const client = { who:"client", brand: version==="B" ? (cl.brandB || cl.brandA) : cl.brandA,
    img: version==="B" ? cl.imgB : cl.imgA, price: priceFor("client"),
    stars: pick("stars","client"), reviews: pick("reviews","client"), bought: pick("bought","client"), badge: pick("badge","client") };
  const comp = { who:"comp", brand: co.brand, img: co.img, price: priceFor("comp"),
    stars: pick("stars","comp"), reviews: pick("reviews","comp"), bought: pick("bought","comp"), badge: pick("badge","comp") };
  return {client, comp};
}

function placeholder(label){
  return `<div class="ph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 17l-5-5-9 8"/></svg><span>${esc(label)}</span></div>`;
}

function cardHTML(L, side, bg, btnLabel, ratio){
  const has = v => v!=null && v!=="";
  const rating = (has(L.stars) || has(L.reviews))
    ? `<div class="rating">${has(L.stars)?`${Number(L.stars).toFixed(1)} ${starsHTML(L.stars)}`:""}${has(L.reviews)?` <span class="rcount">(${Number(L.reviews).toLocaleString()})</span>`:""}</div>` : "";
  return `<div class="card" data-who="${L.who}" data-side="${side}">
    <div class="imgwrap" style="background:${esc(bg)};aspect-ratio:${Number(ratio)||1}">${has(L.badge)?`<div class="badge">${esc(L.badge)}</div>`:""}${
      L.img ? `<img src="${esc(L.img)}" alt="" draggable="false">` : placeholder(L.who==="comp"?"Competitor image":"Your product image")}</div>
    <div class="info">
      <div class="brand">${esc(L.brand || (L.who==="comp"?"Competitor brand":"Your client's brand"))}</div>
      ${rating}
      ${has(L.bought)?`<div class="pop">${esc(L.bought)} bought in past month</div>`:""}
      <div class="spacer"></div>
      ${has(L.price)?`<div class="price">${fmtPrice(L.price)}</div>`:""}
      <div class="ship">Free Shipping · 30-Day Free Returns</div>
      <button class="buy" type="button" data-who="${L.who}">${esc(btnLabel||"Add to Cart")}</button>
    </div>
  </div>`;
}

/* One full choice screen. clientLeft = true puts the client's product on the left. */
/* Box shape (width/height) shared by both products, and whether to stack them one above the other. */
function layoutOf(study){
  const L = study.layout || {}, ratio = Math.min(3, Math.max(0.5, Number(L.ratio) || 1));
  const stack = L.arrange==="stack" || (L.arrange!=="side" && ratio >= 1.35);
  return {ratio, stack};
}
function trialHTML(study, version, clientLeft){
  const lay = layoutOf(study);
  const {client, comp} = listings(study, version), bg = bgColor(study);
  const cat = (study.category||"").trim();
  const left = clientLeft ? client : comp, right = clientLeft ? comp : client;
  return `<div class="trial${lay.stack?" wide":""}">
    ${cat?`<div class="searchline">Results for "${esc(cat.toLowerCase())}"</div><h1 class="cat-title">${esc(cat)}</h1>`:""}
    <div class="qbanner"><span class="qt">${esc(study.question || "Which would you choose?")}</span></div>
    <div class="grid${lay.stack?" stack":""}">${cardHTML(left,"L",bg,null,lay.ratio)}${cardHTML(right,"R",bg,null,lay.ratio)}</div>
    ${followupHTML(study)}
  </div>`;
}
/* Optional question shown under the two products, answered Yes (1) / No (0). */
const FOLLOWUP_DEFAULT = "Would you buy a product like one of these in real life?";
function hasFollowup(study){ return !!(study.followup && study.followup.on); }
function followupHTML(study){
  if(!hasFollowup(study)) return "";
  return `<div class="fu">
    <p class="fq">${esc(study.followup.text || FOLLOWUP_DEFAULT)}</p>
    <div class="fbtns"><button type="button" class="fbtn" data-r="1">Yes</button><button type="button" class="fbtn" data-r="0">No</button></div>
    <button type="button" class="next" disabled>Next →</button>
  </div>`;
}

window.LAB = {layoutOf, BG, esc, fmtPrice, starsHTML, listings, cardHTML, trialHTML, bgColor, hasFollowup, FOLLOWUP_DEFAULT};
})();
