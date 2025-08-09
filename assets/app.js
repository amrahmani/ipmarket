
const LISTINGS = [
  {"id":1,"title":"Solar panel efficiency booster","type":"Patent","industry":"Energy","jurisdiction":"AU","value_min":50000,"value_max":120000,"summary":"A method that increases photovoltaic efficiency via nano-texturing and layered coatings to reduce recombination losses."},
  {"id":2,"title":"Biodegradable packaging polymer","type":"Patent","industry":"Materials","jurisdiction":"AU","value_min":30000,"value_max":80000,"summary":"A polymer formula designed to biodegrade in compost conditions within 90 days suitable for food packaging."},
  {"id":3,"title":"Modular IoT sensor housing","type":"Design","industry":"IoT","jurisdiction":"Global","value_min":8000,"value_max":22000,"summary":"A snap-fit housing for environmental sensors with standard connectors and easy battery access."},
  {"id":4,"title":"Wearable cardiac monitor band","type":"Patent","industry":"MedTech","jurisdiction":"AU","value_min":70000,"value_max":150000,"summary":"A lightweight cardiovascular monitoring band with low-power telemetry and adaptive filtering for ambulatory monitoring."},
  {"id":5,"title":"Low-cost water purification membrane","type":"Patent","industry":"Water","jurisdiction":"Global","value_min":20000,"value_max":70000,"summary":"A scalable membrane manufacturing technique enabling lower manufacturing costs while retaining high filtration performance."},
  {"id":6,"title":"Smart window film (energy-saving)","type":"Patent","industry":"Energy","jurisdiction":"AU","value_min":25000,"value_max":90000,"summary":"An electrochromic film that dynamically controls solar gain and improves building energy efficiency."},
  {"id":7,"title":"Antimicrobial surface coating","type":"Patent","industry":"Materials","jurisdiction":"AU","value_min":15000,"value_max":45000,"summary":"A coating formulation that limits microbial growth on high-touch surfaces with durable adhesion."},
  {"id":8,"title":"Rapid prototyping clamp","type":"Design","industry":"Manufacturing","jurisdiction":"Global","value_min":5000,"value_max":14000,"summary":"A universal clamp system designed for fast reconfiguration on additive manufacturing jigs."},
  {"id":9,"title":"AI-assisted patent summarizer","type":"Software","industry":"LegalTech","jurisdiction":"AU","value_min":12000,"value_max":40000,"summary":"A tool that auto-generates concise lay summaries from patent claims and descriptions."},
  {"id":10,"title":"Thermal battery pack layout","type":"Patent","industry":"Energy","jurisdiction":"Global","value_min":40000,"value_max":110000,"summary":"An optimized battery pack layout reducing thermal hotspots through micro-channel cooling."},
  {"id":11,"title":"Wear-resistant 3D printing filament","type":"Patent","industry":"Materials","jurisdiction":"Global","value_min":9000,"value_max":27000,"summary":"A filament material formulation improving wear-resistance for functional printed parts."},
  {"id":12,"title":"Modular surgical instrument set","type":"Patent","industry":"MedTech","jurisdiction":"AU","value_min":60000,"value_max":130000,"summary":"Modular instruments enabling faster OR setup and reduced sterilization burden."}
];

function formatValue(l){
  return '$' + l.toLocaleString();
}

function renderListings(list){
  const grid = document.getElementById('listings');
  if(!grid) return;
  grid.innerHTML = '';
  list.forEach(it=>{
    const div = document.createElement('div');
    div.className = 'card listing';
    div.innerHTML = `<div class="thumb">${it.type}</div>
      <div class="meta">
        <strong>${it.title}</strong>
        <div style="color:var(--muted);margin-top:6px">${it.summary}</div>
        <div class="tags"><span class="tag">${it.type}</span><span class="tag">${it.industry}</span><span class="tag">${it.jurisdiction}</span></div>
        <div style="margin-top:10px;display:flex;justify-content:space-between;align-items:center">
          <div style="font-weight:700">Est. ${formatValue(it.value_min)}–${formatValue(it.value_max)}</div>
          <div><button class="btn btn-primary" onclick="viewListing(${it.id})">View</button></div>
        </div>
      </div>`;
    grid.appendChild(div);
  });
}

function viewListing(id){
  // navigate to listing page with id param
  location.href = 'listing.html?id=' + id;
}

function applyFilters(){
  const q = (document.getElementById('q')?.value||'').toLowerCase();
  const type = document.getElementById('type')?.value || '';
  const industry = document.getElementById('industry')?.value || '';
  const filtered = LISTINGS.filter(it=>{
    if(type && it.type !== type) return false;
    if(industry && it.industry !== industry) return false;
    if(q && !(it.title.toLowerCase().includes(q) || it.summary.toLowerCase().includes(q))) return false;
    return true;
  });
  renderListings(filtered);
}

function initHome(){
  renderListings(LISTINGS.slice(0,8));
  // sample KPI numbers
  document.getElementById('k_listings').innerText = LISTINGS.length;
  document.getElementById('k_inquiries').innerText = 34;
  document.getElementById('k_matches').innerText = 7;
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
  // mock AI "confidence" and valuation score
  const score = Math.round(60 + Math.random()*30);
  document.getElementById('ai_score').innerText = score + '/100';
  document.getElementById('ai_note').innerText = 'AI suggests this asset is well-suited for licensing in target sectors; estimate is indicative only.';
}

function mockInquiry(){
  alert('Inquiry sent to seller (demo). A seller will reply in the real product.');
}

function initSeller(){
  document.getElementById('created_listings').innerText = 4;
}

function initAdmin(){
  // simple mock chart using DOM
  const rows = [
    ['Metric','Value'],
    ['Total listings', LISTINGS.length],
    ['New inquiries (30d)', 34],
    ['Conversions (30d)', '7'],
    ['Avg. est. value', '$48,000']
  ];
  const tbl = document.getElementById('admin_table');
  rows.forEach(r=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r[0]}</td><td>${r[1]}</td>`;
    tbl.appendChild(tr);
  });
}

document.addEventListener('DOMContentLoaded',()=>{
  if(document.body.dataset.page==='home') initHome();
  if(document.body.dataset.page==='listing') loadListingPage();
  if(document.body.dataset.page==='seller') initSeller();
  if(document.body.dataset.page==='admin') initAdmin();
  // bind filters
  const btn = document.getElementById('btn_filter');
  if(btn) btn.addEventListener('click', applyFilters);
});
