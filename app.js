const MODULES=[
{id:"home",name:"首页",desc:"所有功能入口与运营工作台"},
{id:"category",name:"类目指引",desc:"套装 / 正装 / 棉羽精准上新路径"},
{id:"open",name:"开款方向",desc:"套装 / 正装 / 棉羽款式参考"},
{id:"visual",name:"视觉优化",desc:"人模与非人模电商图 Prompt 生成"},
{id:"title",name:"标题优化",desc:"三大类目关键词组合"},
{id:"sourcing",name:"招品 / 回品",desc:"预留招品、回品与趋势分析功能"}];

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
let currentOpen="套装";
let currentTitle="套装";
let currentVisualMode="human";

function esc(v=""){return String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
function normalizeCategory(v){v=String(v||"").trim().toLowerCase();if(["套装","set","sets"].includes(v))return"套装";if(["正装","formal","formals"].includes(v))return"正装";if(["棉羽","padded","padding","downwear","棉服","羽绒服"].includes(v))return"棉羽";return v;}
function go(id){$$(".page").forEach(p=>p.classList.toggle("active",p.id===id));$$(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.go===id));const m=MODULES.find(x=>x.id===id);$("#crumb").textContent=id==="home"?"首页 / 工作台":"首页 / "+(m?.name||"");window.scrollTo({top:0,behavior:"smooth"});}

function initNav(){
 $("#mainNav").innerHTML=MODULES.map((m,i)=>`<button class="nav-btn ${i===0?"active":""}" data-go="${m.id}"><span class="num">${String(i+1).padStart(2,"0")}</span>${m.name}</button>`).join("");
 $("#homeModules").innerHTML=MODULES.slice(1).map((m,i)=>`<article class="module-card" data-go="${m.id}"><div class="module-num">模块 ${String(i+1).padStart(2,"0")}</div><h3>${m.name}</h3><p>${m.desc}</p><button class="btn small">进入功能</button></article>`).join("");
 $$("[data-go]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.go)));
}

function renderCategoryOverview(){
 if(typeof CATEGORY_DATA==="undefined")return;
 $("#categoryOverview").innerHTML=Object.entries(CATEGORY_DATA).map(([name,items])=>{
  const labels=[...new Set(items.map(x=>x.keyword).filter(Boolean))].join("、");
  return `<article class="overview-card"><h3>${esc(name)}</h3><span class="count-badge">${items.length} 条精准路径</span><p>${esc(labels||"查看全部精准路径")}</p><button class="btn small" data-cat="${esc(name)}">查看 ${esc(name)} 路径</button></article>`;
 }).join("");
 $$("[data-cat]").forEach(b=>b.addEventListener("click",()=>renderCategoryDetail(b.dataset.cat,true)));
 renderCategoryDetail("套装",false);
}
function renderCategoryDetail(name,scroll){
 const items=CATEGORY_DATA?.[name]||[];
 $("#categoryDetail").innerHTML=`<div class="path-block"><div class="path-head"><h3>${esc(name)} · 精准上新路径</h3><span>${items.length} 条</span></div><div class="path-list">${
 items.map((x,i)=>`<div class="path-row"><b>${esc(x.keyword||name)}</b><div class="path">${esc(x.path||"—")}</div><button class="copy-path" data-copy-path="${i}">复制路径</button><button class="jump-btn" data-open-cat="${esc(name)}">查看开款方向 →</button></div>`).join("")
 }</div></div>`;
 $$("[data-copy-path]").forEach(b=>b.addEventListener("click",async()=>{
   const text=items[Number(b.dataset.copyPath)]?.path||"";await copyRaw(text);const old=b.textContent;b.textContent="已复制 ✓";setTimeout(()=>b.textContent=old,1200);
 }));
 $$("[data-open-cat]").forEach(b=>b.addEventListener("click",()=>{currentOpen=normalizeCategory(b.dataset.openCat);renderOpenTabs();renderOpenGrid();go("open");}));
 if(scroll)$("#categoryDetail").scrollIntoView({behavior:"smooth",block:"start"});
}

function renderOpenTabs(){
 const cats=["套装","正装","棉羽"];currentOpen=normalizeCategory(currentOpen);
 $("#openTabs").innerHTML=cats.map(c=>`<button class="tab-btn ${c===currentOpen?"active":""}" data-open-tab="${c}">${c}</button>`).join("");
 $$("[data-open-tab]").forEach(b=>b.addEventListener("click",()=>{currentOpen=b.dataset.openTab;renderOpenTabs();renderOpenGrid();}));
}
function buildPdfUrl(pdf,page){
 if(!pdf)return"";
 const clean=pdf.split("#")[0];
 const params=[];
 if(page)params.push("page="+encodeURIComponent(page));
 params.push("toolbar=0","navpanes=0","scrollbar=1");
 return clean+"#"+params.join("&");
}
function getPreview(item){
 const image=item.image||item.img||item.cover||"";
 if(image)return `<div class="ppt-preview"><img src="${esc(image)}" alt="${esc(item.name||"款式参考")}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=&quot;preview-placeholder&quot;><div class=&quot;pdf-icon&quot;>🖼️</div><h4>图片未找到</h4><p>请检查 assets 文件路径</p></div>'"></div>`;
 if(item.pdf)return `<div class="ppt-preview"><iframe src="${esc(buildPdfUrl(item.pdf,item.pdfPage))}" title="${esc(item.name||"PDF参考")}" loading="lazy"></iframe></div>`;
 return `<div class="ppt-preview"><div class="preview-placeholder"><div class="pdf-icon">📂</div><h4>暂未添加素材</h4><p>请在 data/open-direction-data.js 添加 image 或 pdf 路径</p></div></div>`;
}
function renderOpenGrid(){
 const list=OPEN_DIRECTION_DATA?.[currentOpen]||[];
 if(!list.length){$("#openDirectionGrid").innerHTML=`<div class="empty-state"><h3>暂未读取到「${esc(currentOpen)}」款式参考</h3><p>请检查 data/open-direction-data.js</p></div>`;return;}
 $("#openDirectionGrid").innerHTML=list.map((x,i)=>`<article class="reference-card"><div class="ppt-card-header"><div class="reference-type">${x.image?"款式图片参考":"PDF 款式参考"}</div><h3>${esc(x.name||currentOpen+"款式参考 "+(i+1))}</h3>${x.en?`<p class="reference-en">${esc(x.en)}</p>`:""}</div>${getPreview(x)}<div class="reference-body">${x.tags?.length?`<div class="tags">${x.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join("")}</div>`:""}<div class="card-actions">${x.pdf?`<button class="view-pdf" data-pdf="${esc(x.pdf)}" data-page="${esc(x.pdfPage||"")}">全屏查看 PDF 款式参考</button>`:""}${x.image?`<a class="card-image-link" href="${esc(x.image)}" target="_blank" rel="noopener">查看高清款式图片</a>`:""}</div></div></article>`).join("");
 $$(".view-pdf").forEach(b=>b.addEventListener("click",()=>openPdf(b.dataset.pdf,b.dataset.page)));
}
function openPdf(pdf,page){const url=buildPdfUrl(pdf,page);$("#pdfFrame").src=url;$("#pdfModal").classList.add("show");}
function closePdf(){ $("#pdfModal").classList.remove("show");$("#pdfFrame").src=""; }
function initPdfModal(){ $("#closePdf").addEventListener("click",closePdf);$("#pdfModal").addEventListener("click",e=>{if(e.target===$("#pdfModal"))closePdf();});document.addEventListener("keydown",e=>{if(e.key==="Escape")closePdf();});}

function renderVisualMode(){
 const data=currentVisualMode==="human"?VISUAL_DATA:NONHUMAN_VISUAL_DATA;
 $("#visualControls").innerHTML=Object.entries(data).map(([dim,words])=>`<section class="group-card"><div class="group-title"><h3>${esc(dim)}</h3><span>可多选</span></div><div class="choices">${words.map(w=>`<button class="choice visual-choice" data-dim="${esc(dim)}" data-word="${esc(w)}">${esc(w)}</button>`).join("")}</div></section>`).join("");
 $$(".visual-choice").forEach(b=>b.addEventListener("click",()=>{b.classList.toggle("active");buildVisual();}));
 buildVisual();
}
function initVisualTabs(){$$(".mode-btn").forEach(b=>b.addEventListener("click",()=>{currentVisualMode=b.dataset.mode;$$(".mode-btn").forEach(x=>x.classList.toggle("active",x===b));renderVisualMode();}));}
function buildVisual(){
 const words=$$(".visual-choice.active").map(b=>b.dataset.word);
 const prefix=currentVisualMode==="human"?"专业男装电商摄影，真实成年男性模特，":"专业男装电商商品摄影，无人模展示，";
 const text=words.length?prefix+words.join("，")+"。突出商品版型、面料纹理与真实质感，商品主体清晰，真实自然光影，高级商业摄影质感，移动端电商主图构图优化，无品牌 Logo，无水印。":"请选择上方选项生成 Prompt。";
 $("#visualOutput").value=text;
}

function renderTitleTabs(){
 const cats=["套装","正装","棉羽"].filter(x=>TITLE_DATA?.[x]);if(!TITLE_DATA?.[currentTitle])currentTitle=cats[0];
 $("#titleCategoryTabs").innerHTML=cats.map(c=>`<button class="tab-btn ${c===currentTitle?"active":""}" data-title-tab="${c}">${c}</button>`).join("");
 $$("[data-title-tab]").forEach(b=>b.addEventListener("click",()=>{currentTitle=b.dataset.titleTab;renderTitleTabs();renderTitleControls();}));
}
function renderTitleControls(){
 const data=TITLE_DATA?.[currentTitle]||{};
 $("#titleControls").innerHTML=Object.entries(data).map(([dim,items])=>`<section class="group-card"><div class="group-title"><h3>${esc(dim)}</h3><span>多选</span></div><div class="choices">${items.map(x=>`<button class="choice title-choice" data-dim="${esc(dim)}" data-en="${esc(x.en||"")}" data-zh="${esc(x.zh||"")}">${esc(x.zh||"")}<small>${esc(x.en||"—")}</small></button>`).join("")}</div></section>`).join("");
 $$(".title-choice").forEach(b=>b.addEventListener("click",()=>{b.classList.toggle("active");buildTitle();}));
 buildTitle();
}
function buildTitle(){
 const order=["套装规格(Pack/Set)","目标人群(Target)","核心品类词","版型(Fit)","风格(Style)","面料/材质(Material)","图案/花色(Pattern)","领型细节(Neckline/Detail)","包含部件说明(Components)","季节(Season)","多场景/卖点(Occasion/Feature)","颜色(Color)"];
 const arr=$$(".title-choice.active").map(b=>({dim:b.dataset.dim,en:b.dataset.en,zh:b.dataset.zh}));
 arr.sort((a,b)=>((order.indexOf(a.dim)===-1?999:order.indexOf(a.dim))-(order.indexOf(b.dim)===-1?999:order.indexOf(b.dim))));
 const words=[...new Set(arr.map(x=>x.en||x.zh).filter(Boolean))];const title=words.join(", ");
 $("#titleOutput").value=title||"请选择关键词卡片生成英文标题。";
 $("#titleCount").textContent=title?`当前：${words.length} 个关键词 · ${title.length} 个字符`:"";
}
async function copyRaw(text){if(!text)return;try{await navigator.clipboard.writeText(text);}catch(e){const ta=document.createElement("textarea");ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand("copy");ta.remove();}}
function copyText(id){copyRaw($(id).value).then(()=>alert("已复制"));}

document.addEventListener("DOMContentLoaded",()=>{
 initNav();renderCategoryOverview();renderOpenTabs();renderOpenGrid();initPdfModal();initVisualTabs();renderVisualMode();renderTitleTabs();renderTitleControls();
 $("#copyVisual").addEventListener("click",()=>copyText("#visualOutput"));$("#copyTitle").addEventListener("click",()=>copyText("#titleOutput"));
});