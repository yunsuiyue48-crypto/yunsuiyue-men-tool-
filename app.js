const MODULES=[
{id:"home",name:"首页",desc:"所有功能入口与后续扩展工作台"},
{id:"category",name:"类目指引",desc:"套装 / 正装 / 棉羽精准上新路径"},
{id:"open",name:"开款方向",desc:"套装 / 正装 / 棉羽款式参考"},
{id:"visual",name:"视觉优化",desc:"人模与非人模电商图 Prompt 生成"},
{id:"title",name:"标题优化",desc:"三大类目关键词多选组合"},
{id:"sourcing",name:"招品 / 回品",desc:"预留招品、回品与趋势分析功能"}];

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let currentOpen="套装", currentTitle="套装", currentCategory="套装", visualMode="human";

function go(id){
  $$(".page").forEach(x=>x.classList.toggle("active",x.id===id));
  $$(".nav-btn").forEach(x=>x.classList.toggle("active",x.dataset.go===id));
  const m=MODULES.find(x=>x.id===id); $("#crumb").textContent=id==="home"?"首页 / 工作台":"首页 / "+(m?.name||"");
  window.scrollTo({top:0,behavior:"smooth"});
}
function initNav(){
  $("#mainNav").innerHTML=MODULES.map((m,i)=>`<button class="nav-btn ${i===0?"active":""}" data-go="${m.id}"><span class="num">${String(i+1).padStart(2,"0")}</span>${m.name}</button>`).join("");
  $("#homeModules").innerHTML=MODULES.slice(1).map((m,i)=>`<article class="module-card" data-go="${m.id}"><div class="module-num">模块 ${String(i+1).padStart(2,"0")}</div><h3>${m.name}</h3><p>${m.desc}</p><button class="btn small">进入功能</button></article>`).join("");
  $$("[data-go]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.go)));
}
function copyTextValue(text,ok="已复制"){
  if(!text)return;
  if(navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(()=>alert(ok)).catch(()=>fallbackCopy(text,ok));
  else fallbackCopy(text,ok);
}
function fallbackCopy(text,ok){const t=document.createElement("textarea");t.value=text;document.body.appendChild(t);t.select();document.execCommand("copy");t.remove();alert(ok);}

function renderCategoryOverview(){
  if(typeof CATEGORY_DATA==="undefined")return;
  const names=["套装","正装","棉羽"];
  $("#categoryOverview").innerHTML=names.filter(n=>CATEGORY_DATA[n]).map(name=>{
    const items=CATEGORY_DATA[name]||[];
    const keys=[...new Set(items.map(x=>x.keyword).filter(Boolean))].slice(0,8).join("、");
    return `<article class="overview-card"><h3>${name}</h3><span class="count-badge">${items.length} 条精准路径</span><p>${keys||"查看全部精准路径"}</p><button class="btn small" data-cat="${name}">查看 ${name} 路径</button></article>`;
  }).join("");
  $$("[data-cat]").forEach(b=>b.addEventListener("click",()=>{currentCategory=b.dataset.cat;renderCategoryDetail(currentCategory,true)}));
  renderCategoryDetail(currentCategory,false);
}
function renderCategoryDetail(name,scroll){
  const items=(CATEGORY_DATA&&CATEGORY_DATA[name])||[];
  $("#categoryDetail").innerHTML=`<div class="path-block"><div class="path-head"><h3>${name} · 精准上新路径</h3><span>${items.length} 条</span></div><div class="path-list">${items.map((x,i)=>`<article class="path-card"><div class="path-card-top"><b>${x.keyword||name}</b><span>路径 ${String(i+1).padStart(2,"0")}</span></div><div class="path">${x.path||"—"}</div><div class="path-actions"><button class="copy-path" data-copy="${encodeURIComponent(x.path||"")}">一键复制路径</button><button class="jump-btn" data-open-cat="${name}">查看开款方向 →</button></div></article>`).join("")}</div></div>`;
  $$(".copy-path").forEach(b=>b.addEventListener("click",()=>copyTextValue(decodeURIComponent(b.dataset.copy),"路径已复制")));
  $$("[data-open-cat]").forEach(b=>b.addEventListener("click",()=>{currentOpen=b.dataset.openCat;renderOpenTabs();renderOpenGrid();go("open")}));
  if(scroll)$("#categoryDetail").scrollIntoView({behavior:"smooth",block:"start"});
}
function renderOpenTabs(){
  const cats=["套装","正装","棉羽"];
  $("#openTabs").innerHTML=cats.map(n=>`<button class="tab-btn ${n===currentOpen?"active":""}" data-open-tab="${n}">${n}</button>`).join("");
  $$("[data-open-tab]").forEach(b=>b.addEventListener("click",()=>{currentOpen=b.dataset.openTab;renderOpenTabs();renderOpenGrid()}));
}
function renderOpenGrid(){
  const list=(typeof OPEN_DIRECTION_DATA!=="undefined"&&OPEN_DIRECTION_DATA[currentOpen])||[];
  if(!list.length){$("#openDirectionGrid").innerHTML=`<div class="empty-state"><h3>暂未读取到「${currentOpen}」款式参考</h3><p>请检查 data/open-direction-data.js 与 assets 文件路径。</p></div>`;return;}
  $("#openDirectionGrid").innerHTML=list.map((x,i)=>{
    const image=x.image||x.img||"", pdf=x.pdf||"", tags=(x.tags||[]).map(t=>`<span class="tag">${t}</span>`).join("");
    const preview=image?`<div class="ppt-preview"><img src="${image}" alt="${x.name}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=&quot;preview-placeholder&quot;><div class=&quot;pdf-icon&quot;>🖼️</div><h4>图片加载失败</h4><p>请检查 assets/styles 文件是否完整上传</p></div>'"></div>`:pdf?`<div class="ppt-preview"><iframe src="${pdf}" title="${x.name}" loading="lazy"></iframe></div>`:`<div class="ppt-preview"><div class="preview-placeholder"><div class="pdf-icon">📂</div><h4>暂无素材</h4></div></div>`;
    return `<article class="reference-card"><div class="ppt-card-header"><div class="reference-type">${image?"图片款式参考":"PDF 款式参考"}</div><h3>${x.name||`${currentOpen}款式参考 ${i+1}`}</h3>${x.en?`<p class="reference-en">${x.en}</p>`:""}</div>${preview}<div class="reference-body">${tags?`<div class="tags">${tags}</div>`:""}<div class="card-actions">${pdf?`<button class="view-pdf" data-pdf="${pdf}">全屏查看 PDF 款式参考</button>`:""}${image?`<a class="card-image-link" href="${image}" target="_blank">查看高清款式图片</a>`:""}</div></div></article>`;
  }).join("");
  $$(".view-pdf").forEach(b=>b.addEventListener("click",()=>openPdf(b.dataset.pdf)));
}
function openPdf(pdf){if(!pdf)return;$("#pdfFrame").src=pdf;$("#pdfModal").classList.add("show")}
function initPdfModal(){
  $("#closePdf").addEventListener("click",closePdf);
  $("#pdfModal").addEventListener("click",e=>{if(e.target===$("#pdfModal"))closePdf()});
  document.addEventListener("keydown",e=>{if(e.key==="Escape")closePdf()});
}
function closePdf(){$("#pdfModal").classList.remove("show");$("#pdfFrame").src="";}

function renderVisual(){
  const data=VISUAL_DATA?.[visualMode]||{};
  $$(".mode-tabs [data-visual-mode]").forEach(b=>b.classList.toggle("active",b.dataset.visualMode===visualMode));
  $("#visualControls").innerHTML=Object.entries(data).map(([dim,words])=>`<section class="group-card"><div class="group-title"><h3>${dim}</h3><span>可多选</span></div><div class="choices">${Object.entries(words).map(([label,arr])=>`<button class="choice visual-choice" data-dim="${dim}" data-label="${label}" data-prompt="${encodeURIComponent(arr.join("，"))}">${label}</button>`).join("")}</div></section>`).join("");
  $$(".visual-choice").forEach(b=>b.addEventListener("click",()=>{b.classList.toggle("active");buildVisual()}));
  buildVisual();
}
function buildVisual(){
  const selected=$$(".visual-choice.active").map(b=>decodeURIComponent(b.dataset.prompt));
  let prompt;
  if(!selected.length) prompt="请选择上方选项生成 Prompt。";
  else if(visualMode==="human") prompt=`专业男装电商摄影，真实成年男性模特，${selected.join("，")}。突出服装版型、面料纹理与整体搭配，真实自然光影，高级商业摄影质感，商品主体清晰，移动端电商主图构图优化，无品牌 Logo，无水印。`;
  else prompt=`专业电商商品摄影，${selected.join("，")}。突出商品本体、服装版型、面料纹理和细节，画面干净，层次清晰，适合 TEMU 等跨境电商主图与详情图，无品牌 Logo，无水印，无多余文字。`;
  $("#visualOutput").value=prompt;
}
function initVisualTabs(){$$(".mode-tabs [data-visual-mode]").forEach(b=>b.addEventListener("click",()=>{visualMode=b.dataset.visualMode;renderVisual()}));}

function renderTitleTabs(){
  const cats=["套装","正装","棉羽"].filter(x=>TITLE_DATA?.[x]);
  if(!cats.includes(currentTitle))currentTitle=cats[0];
  $("#titleCategoryTabs").innerHTML=cats.map(x=>`<button class="tab-btn ${x===currentTitle?"active":""}" data-title-tab="${x}">${x}</button>`).join("");
  $$("[data-title-tab]").forEach(b=>b.addEventListener("click",()=>{currentTitle=b.dataset.titleTab;renderTitleTabs();renderTitleControls()}));
}
function renderTitleControls(){
  const data=TITLE_DATA?.[currentTitle]||{};
  $("#titleControls").innerHTML=Object.entries(data).map(([dim,items])=>`<section class="group-card"><div class="group-title"><h3>${dim}</h3><span>多选</span></div><div class="choices">${(items||[]).map(x=>`<button class="choice title-choice" data-dim="${dim}" data-en="${encodeURIComponent(x.en||"")}" data-zh="${encodeURIComponent(x.zh||"")}" title="${x.variants||""}">${x.zh||""}<small>${x.en||"—"}</small></button>`).join("")}</div></section>`).join("");
  $$(".title-choice").forEach(b=>b.addEventListener("click",()=>{b.classList.toggle("active");buildTitle()}));buildTitle();
}
function buildTitle(){
  const order=["品类(Category)","核心品类词","套装规格(Pack/Set)","目标人群(Target)","版型(Fit)","领型(Neckline)","闭合方式(Closure)","袖长(Sleeve)","长度(Length)","面料/材质(Material)","功能特性(Feature)","细节(Detail)","图案/花色(Pattern)","风格(Style)","季节(Season)","节日(Holiday)","场景(Occasion)","颜色(Color)"];
  const selected=$$(".title-choice.active").map(b=>({dim:b.dataset.dim,en:decodeURIComponent(b.dataset.en),zh:decodeURIComponent(b.dataset.zh)})).sort((a,b)=>(order.indexOf(a.dim)+1000)%1000-(order.indexOf(b.dim)+1000)%1000);
  const words=[...new Set(selected.map(x=>x.en||x.zh).filter(Boolean))], title=words.join(", ");
  $("#titleOutput").value=title||"请选择关键词卡片生成英文标题。";
  $("#titleCount").textContent=title?`当前：${words.length} 个关键词 · ${title.length} 个字符`:"";
}
document.addEventListener("DOMContentLoaded",()=>{
  initNav();renderCategoryOverview();renderOpenTabs();renderOpenGrid();initPdfModal();initVisualTabs();renderVisual();renderTitleTabs();renderTitleControls();
  $("#copyVisual").addEventListener("click",()=>copyTextValue($("#visualOutput").value));
  $("#copyTitle").addEventListener("click",()=>copyTextValue($("#titleOutput").value));
});