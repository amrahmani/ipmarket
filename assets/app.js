// Upgraded app.js: listings, chatbot (keyword matching), summarizer, recommender
const LISTINGS = [
  {"id":1,"title":"Solar panel efficiency booster","type":"Patent","industry":"Energy","jurisdiction":"AU","value_min":50000,"value_max":120000,"summary":"A method that increases photovoltaic efficiency via nano-texturing and layered coatings to reduce recombination losses.","file":"AU-2018-1234"},
  {"id":2,"title":"Biodegradable packaging polymer","type":"Patent","industry":"Materials","jurisdiction":"AU","value_min":30000,"value_max":80000,"summary":"A polymer formula designed to biodegrade in compost conditions within 90 days suitable for food packaging.","file":"AU-2019-4421"},
  {"id":3,"title":"Modular IoT sensor housing","type":"Design","industry":"IoT","jurisdiction":"Global","value_min":8000,"value_max":22000,"summary":"A snap-fit housing for environmental sensors with standard connectors and easy battery access.","file":"DS-2020-900"},
  {"id":4,"title":"Wearable cardiac monitor band","type":"Patent","industry":"MedTech","jurisdiction":"AU","value_min":70000,"value_max":150000,"summary":"A lightweight cardiovascular monitoring band with low-power telemetry and adaptive filtering for ambulatory monitoring.","file":"AU-2017-885"},
  {"id":5,"title":"Low-cost water purification membrane","type":"Patent","industry":"Water","jurisdiction":"Global","value_min":20000,"value_max":70000,"summary":"A scalable membrane manufacturing technique enabling lower manufacturing costs while retaining high filtration performance.","file":"PCT-2021-556"},
  {"id":6,"title":"Smart window film (energy-saving)","type":"Patent","industry":"Energy","jurisdiction":"AU","value_min":25000,"value_max":90000,"summary":"An electrochromic film that dynamically controls solar gain and improves building energy efficiency.","file":"AU-2020-112"},
  {"id":7,"title":"Antimicrobial surface coating","type":"Patent","industry":"Materials","jurisdiction":"AU","value_min":15000,"value_max":45000,"summary":"A coating formulation that limits microbial growth on high-touch surfaces with durable adhesion.","file":"AU-2016-223"},
  {"id":8,"title":"Rapid prototyping clamp","type":"Design","industry":"Manufacturing","jurisdiction":"Global","value_min":5000,"value_max":14000,"summary":"A universal clamp system designed for fast reconfiguration on additive manufacturing jigs.","file":"DS-2019-301"},
  {"id":9,"title":"AI-assisted patent summarizer","type":"Software","industry":"LegalTech","jurisdiction":"AU","value_min":12000,"value_max":40000,"summary":"A tool that auto-generates concise lay summaries from patent claims and descriptions.","file":"SW-2022-11"},
  {"id":10,"title":"Thermal battery pack layout","type":"Patent","industry":"Energy","jurisdiction":"Global","value_min":40000,"value_max":110000,"summary":"An optimized battery pack layout reducing thermal hotspots through micro-channel cooling.","file":"PCT-2018-900"},
  {"id":11,"title":"Wear-resistant 3D printing filament","type":"Patent","industry":"Materials","jurisdiction":"Global","value_min":9000,"value_max":27000,"summary":"A filament material formulation improving wear-resistance for functional printed parts.","file":"PCT-2019-77"},
  {"id":12,"title":"Modular surgical instrument set","type":"Patent","industry":"MedTech","jurisdiction":"AU","value_min":60000,"value_max":130000,"summary":"Modular instruments enabling faster OR setup and reduced sterilization burden.","file":"AU-2015-678"}
];

function formatValue(n){ return '$' + n.toLocaleString(); }

/* ----- Listings rendering and filters ----- */
function renderListings(list, containerId='listings'){
  const grid = document.getElementById(containerId);
  if(!grid) return;
  grid.innerHTML = '';
  list.forEach(it=>{
    const div = document.createElement('div');
    div.className = 'card listing';
    div.innerHTML = `<div class="thumb">${it.type}</div>
      <div class="meta">
        <strong>${it.title}</strong>
        <div class="muted" style="margin-top:6px">${it.summary}</div>
        <div class="tags"><span class="tag">${it.type}</span><span class="tag">${it.industry}</span><span class="tag">${it.jurisdiction}</span></div>
        <div style="margin-top:10px;display:flex;justify-content:space-between;align-items:center">
          <div style="font-weight:700">Est. ${formatValue(it.value_min)}–${formatValue(it.value_max)}</div>
          <div><button class="btn btn-primary" onclick="viewListing(${it.id})">View</button></div>
        </div>
      </div>`;
    // record click interest when viewing
    div.querySelector('button')?.addEventListener('click', ()=> recordInterest(it));
    grid.appendChild(div);
  });
}

function applyFilters(){
  const q = (document.getElementById('q')?.value||'').toLowerCase();
  const type = document.getElementById('type')?.value || '';
  const industry = document.getElementById('industry')?.value || '';
  let filtered = LISTINGS.filter(it=>{
    if(type && it.type !== type) return false;
    if(industry && it.industry !== industry) return false;
    if(q && !(it.title.toLowerCase().includes(q) || it.summary.toLowerCase().includes(q) || it.file.toLowerCase().includes(q))) return false;
    return true;
  });
  filtered = filtered.sort((a,b)=>b.value_max - a.value_max);
  renderListings(filtered);
}

/* ----- Recommender system (localStorage-based) ----- */
function recordInterest(item){
  try{
    const key = 'ipmarket_user_interests';
    const cur = JSON.parse(localStorage.getItem(key) || '{}');
    cur[item.industry] = (cur[item.industry] || 0) + 1;
    localStorage.setItem(key, JSON.stringify(cur));
  }catch(e){ console.warn(e); }
}

function getRecommendations(limit=4){
  try{
    const key = 'ipmarket_user_interests';
    const cur = JSON.parse(localStorage.getItem(key) || '{}');
    const industries = Object.keys(cur).sort((a,b)=>cur[b]-cur[a]);
    if(industries.length===0){
      // new user: return top value listings
      return LISTINGS.slice().sort((a,b)=>b.value_max - a.value_max).slice(0,limit);
    }
    // prefer listings matching top industries, then fill rest
    let rec = [];
    industries.forEach(ind=>{
      rec = rec.concat(LISTINGS.filter(l=>l.industry===ind && !rec.includes(l)));
    });
    // add high-value ones if not enough
    const fill = LISTINGS.slice().sort((a,b)=>b.value_max - a.value_max).filter(l=>!rec.includes(l)).slice(0,limit-rec.length);
    rec = rec.concat(fill).slice(0,limit);
    return rec;
  }catch(e){ return LISTINGS.slice(0,limit); }
}

/* ----- Simple summarizer (mock) ----- */
function generateSummaryForListing(item){
  // Very simple extractive-style summary: pick key phrases and create 2-3 sentences
  const sentences = [];
  sentences.push(`${item.title} is a ${item.type.toLowerCase()} in the ${item.industry} sector aimed at addressing a practical problem.`);
  sentences.push(`Lay summary: ${item.summary}`);
  const est = Math.round((item.value_min + item.value_max)/2);
  sentences.push(`Indicative valuation range: ${formatValue(item.value_min)} – ${formatValue(item.value_max)} (avg ${formatValue(est)}).`);
  return sentences.join(' ');
}

/* ----- Chatbot (keyword matching + short-session memory) ----- */
const CHAT_FALLBACK = "Sorry, I didn't fully understand. Could you rephrase or ask about listing, valuation, or how to list an IP?";
const FAQS = [
  {q:['what is ipmarket','what is this','what do you do'],'a':'IPMARKET is a curated marketplace to help IP owners and buyers connect — we provide AI-assisted lay summaries, valuation hints, and matchmaking support.'},
  {q:['how to list','how do i list','sell my ip','list my ip'],'a':'To list, go to the Seller page, fill the guided form and choose any premium services like featured listing or editorial summary. In production listings are reviewed before publication.'},
  {q:['valuation','value','estimate'],'a':'Valuations shown are indicative estimates based on comparable values and heuristics. For deals we recommend an expert valuation before signing.'},
  {q:['contact','contact seller','how to contact'],'a':'On each listing use the "Contact seller" button to start an inquiry. Early-stage platform often requires an NDA before full disclosure.'},
  {q:['fees','price','commission','cost'],'a':'Monetisation models include featured listing fees, paid editorial summaries, institutional subscriptions, and success commissions on closed deals.'},
  {q:['ai','summary','summarization'],'a':'AI features provide concise lay summaries and auto-tags. They are meant to reduce search costs; in production they are calibrated against expert review.'},
];

function chatbotRespond(input, sessionMemory){
  const txt = input.toLowerCase().trim();
  // direct match FAQs via keywords
  for(const f of FAQS){
    for(const k of f.q){
      if(txt.includes(k)) return f.a;
    }
  }
  // check for listing-specific queries like "tell me about <term>"
  for(const it of LISTINGS){
    if(txt.includes(it.title.toLowerCase()) || txt.includes(it.file.toLowerCase())){
      return `About "${it.title}": ${it.summary} Indicative value ${formatValue(it.value_min)}–${formatValue(it.value_max)}.`;
    }
  }
  // context-aware: refer to last topic in memory (last user message)
  const last = sessionMemory[sessionMemory.length-1] || '';
  if(last){
    if(last.includes('valuation') || last.includes('value')) return 'If you want a detailed valuation we recommend contacting a valuation expert; the site shows indicative ranges only.';
  }
  // keyword simple intent
  if(txt.match(/(license|licensing|licensee)/)) return 'Licensing is a common route — we recommend selecting "For license" in the listing details and contacting the owner to discuss terms.';
  if(txt.match(/(buy|purchase|acquire)/)) return 'To purchase or acquire, contact the seller and consider an exclusivity/term sheet. Platform supports inquiries and NDA flows.');
  // fallback
  return CHAT_FALLBACK;
}

/* ----- Page initializers ----- */
function initHome(){
  renderListings(LISTINGS.slice(0,8));
  document.getElementById('k_listings').innerText = LISTINGS.length;
  document.getElementById('k_inquiries').innerText = 42;
  document.getElementById('k_matches').innerText = 9;
  drawMiniChart();
  renderChatWidget();
}

function loadListingPage(){
  const params = new URLSearchParams(location.search);
  const id = Number(params.get('id')||'1');
  const it = LISTINGS.find(x=>x.id===id) || LISTINGS[0];
  document.getElementById('lst_title').innerText = it.title;
  document.getElementById('lst_type').innerText = it.type;
  document.getElementById('lst_ind').innerText = it.industry;
  document.getElementById('lst_jur').innerText = it.jurisdiction;
  document.getElementById('lst_val').innerText = formatValue(it.value_min) + ' – ' + formatValue(it.value_max);
  document.getElementById('lst_sum').innerText = it.summary;
  document.getElementById('lst_file').innerText = it.file;
  document.getElementById('lst_owner').innerText = 'University / Inventor';
  const score = Math.round(60 + Math.random()*30);
  document.getElementById('ai_score').innerText = score + '/100';
  document.getElementById('ai_note').innerText = 'Indicative: use expert valuation for deals.';
  document.getElementById('lst_rail_title').innerText = it.title;
  document.getElementById('lst_rail_sub').innerText = formatValue(it.value_min) + '–' + formatValue(it.value_max);
  drawValuationChart(it);
  // hook generate summary button
  document.getElementById('gen_summary')?.addEventListener('click', ()=>{
    const summ = generateSummaryForListing(it);
    const el = document.getElementById('ai_generated_summary');
    el.innerText = summ;
    // record interest
    recordInterest(it);
  });
  renderChatWidget();
}

function initSeller(){
  document.getElementById('created_listings').innerText = 4;
  renderChatWidget();
}

function initAdmin(){
  const rows = [
    ['Metric','Value'],
    ['Total listings', LISTINGS.length],
    ['New inquiries (30d)', 42],
    ['Conversions (30d)', '9'],
    ['Avg. est. value', '$52,000']
  ];
  const tbl = document.getElementById('admin_table');
  rows.forEach(r=>{ const tr = document.createElement('tr'); tr.innerHTML = `<td>${r[0]}</td><td>${r[1]}</td>`; tbl.appendChild(tr); });
  drawAdminChart();
  renderChatWidget();
}

/* ----- Charts (simple) ----- */
function drawMiniChart(){
  const container = document.getElementById('mini_chart');
  if(!container) return;
  container.innerHTML = '';
  const vals = [20,40,30,60,50,70,80];
  vals.forEach(v=>{ const div = document.createElement('div'); div.className = 'bar'; div.style.height = v + '%'; container.appendChild(div); });
}

function drawValuationChart(item){
  const el = document.getElementById('valuation_chart');
  if(!el) return;
  el.innerHTML = '';
  const min = item.value_min, max = item.value_max;
  const avg = Math.round((min+max)/2);
  const bars = [min, avg, max];
  bars.forEach(b=>{ const bar = document.createElement('div'); bar.className = 'bar'; bar.style.height = Math.min(100, Math.round((b/150000)*100)) + '%'; bar.title = b; el.appendChild(bar); });
}

function drawAdminChart(){ const el = document.getElementById('admin_chart'); if(!el) return; el.innerHTML = ''; const months = [10,12,8,18,22,34]; months.forEach(m=>{ const bar = document.createElement('div'); bar.className = 'bar'; bar.style.height = (m*2) + '%'; bar.title = m; el.appendChild(bar); }); }

/* ----- Recommender UI ----- */
function renderRecommendations(){
  const rec = getRecommendations(4);
  const container = document.getElementById('recs');
  if(!container) return;
  container.innerHTML = '<h4 style="margin-top:0">Recommended for you</h4>';
  rec.forEach(it=>{
    const div = document.createElement('div');
    div.className = 'card listing';
    div.innerHTML = `<div class="thumb">${it.type}</div><div class="meta"><strong>${it.title}</strong><div class="muted" style="margin-top:6px">${it.summary}</div><div style="margin-top:8px"><button class="btn btn-primary" onclick="viewListing(${it.id})">View</button></div></div>`;
    container.appendChild(div);
  });
}

/* ----- CSV export ----- */
function exportCSV(){
  let csv = 'id,title,type,industry,jurisdiction,est_min,est_max,file\n';
  LISTINGS.forEach(l=>{ csv += `${l.id},"${l.title.replace(/"/g,'""')}",${l.type},${l.industry},${l.jurisdiction},${l.value_min},${l.value_max},${l.file}\n`; });
  const blob = new Blob([csv], {type: 'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'listings_export.csv'; a.click();
  URL.revokeObjectURL(url);
}

/* ----- Chat widget rendering + behavior ----- */
function renderChatWidget(){
  // avoid duplicating
  if(document.getElementById('chat-root')) return;
  const wrapper = document.createElement('div');
  wrapper.id = 'chat-root';
  wrapper.className = 'chat-widget';
  wrapper.innerHTML = `<button id="chat-toggle" class="chat-toggle">Chat with us</button>
    <div id="chat-window" class="chat-window" aria-hidden="true">
      <div class="chat-header"><div style="font-weight:700">IPMARKET Assistant</div><button id="chat-close" class="close">✕</button></div>
      <div id="chat-body" class="chat-body"></div>
      <div class="chat-input"><input id="chat-input" placeholder="Ask about listings, valuation, or how to list..." /><button id="chat-send" class="btn btn-primary">Send</button></div>
    </div>`;
  document.body.appendChild(wrapper);
  // events
  const toggle = document.getElementById('chat-toggle');
  const win = document.getElementById('chat-window');
  const close = document.getElementById('chat-close');
  const send = document.getElementById('chat-send');
  const input = document.getElementById('chat-input');
  const body = document.getElementById('chat-body');
  let sessionMemory = []; // last user messages
  toggle.addEventListener('click', ()=>{ win.style.display='flex'; toggle.style.display='none'; input.focus(); renderBotMessage('Hi — I can help with listings, valuations, and how to list your IP. Try asking "how to list my IP" or "valuation".'); });
  close.addEventListener('click', ()=>{ win.style.display='none'; toggle.style.display='block'; });
  send.addEventListener('click', ()=>{ const v = input.value.trim(); if(!v) return; renderUserMessage(v); sessionMemory.push(v); const resp = chatbotRespond(v, sessionMemory); setTimeout(()=>renderBotMessage(resp), 400); input.value=''; });
  input.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ send.click(); } });
  // helper renderers
  function renderUserMessage(text){ const d = document.createElement('div'); d.className='msg user'; d.innerHTML = `<div class="bubble">${escapeHtml(text)}</div>`; body.appendChild(d); body.scrollTop = body.scrollHeight; }
  function renderBotMessage(text){ const d = document.createElement('div'); d.className='msg bot'; d.innerHTML = `<div class="bubble">${escapeHtml(text)}</div>`; body.appendChild(d); body.scrollTop = body.scrollHeight; }
  function escapeHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
}

/* ----- Utilities ----- */
function recordInterest(item){ // already defined earlier but safe-guard
  try{ const key='ipmarket_user_interests'; const cur=JSON.parse(localStorage.getItem(key) || '{}'); cur[item.industry]=(cur[item.industry]||0)+1; localStorage.setItem(key, JSON.stringify(cur)); }catch(e){}
}

function getRecommendations(limit=4){
  try{ const key='ipmarket_user_interests'; const cur=JSON.parse(localStorage.getItem(key) || '{}'); const industries=Object.keys(cur).sort((a,b)=>cur[b]-cur[a]); if(industries.length===0){ return LISTINGS.slice().sort((a,b)=>b.value_max - a.value_max).slice(0,limit); } let rec=[]; industries.forEach(ind=>{ rec = rec.concat(LISTINGS.filter(l=>l.industry===ind && !rec.includes(l))); }); const fill = LISTINGS.slice().sort((a,b)=>b.value_max - a.value_max).filter(l=>!rec.includes(l)).slice(0,limit-rec.length); rec = rec.concat(fill).slice(0,limit); return rec; }catch(e){ return LISTINGS.slice(0,limit); }
}

/* ----- Document ready ----- */
document.addEventListener('DOMContentLoaded', ()=>{
  try{
    if(document.body.dataset.page==='home') initHome();
    if(document.body.dataset.page==='listing') loadListingPage();
    if(document.body.dataset.page==='seller') initSeller();
    if(document.body.dataset.page==='admin') initAdmin();
    document.getElementById('btn_filter')?.addEventListener('click', applyFilters);
    document.getElementById('export_csv')?.addEventListener('click', exportCSV);
    // render recommendations section if present
    renderRecommendations();
  }catch(e){ console.error(e); }
});