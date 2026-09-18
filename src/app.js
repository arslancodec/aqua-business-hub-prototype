import {icon} from './icons.js';
import {modules,configs,hubs,tabRecords} from './data.js';
import {esc,button,badge,statCard,lineChart,table,sectionHead} from './components.js';

const app=document.querySelector('#app');
const overlay=document.querySelector('#overlay-root');
const state={page:'overview',tab:'Overview',hub:'All project hubs',period:'FY 2026-27',query:'',status:'All statuses',menu:false,detailTab:'Overview',overviewTab:'Programme overview',pageNumber:1,dark:localStorage.getItem('abh-theme')==='dark'};
document.body.classList.toggle('dark-mode',state.dark);
let currentRows=[],currentColumns=[],lastFocus,toastTimer;
const expandedWbs=new Set();
const navLink=(id,label,ico,badgeText='')=>`<a href="#/${id}" class="nav-item ${state.page===id?'active':''}" ${state.page===id?'aria-current="page"':''}>${icon(ico)}<span>${label}</span>${badgeText?`<b>${badgeText}</b>`:''}</a>`;
function shell(){
 app.innerHTML=`<aside class="sidebar ${state.menu?'mobile-open':''}" aria-label="Main navigation"><a class="brand" href="#/overview"><span class="brand-symbol"><img src="./public/client-assets/client-company-logo.jpg" alt="Department of Aquaculture and Fisheries logo"/></span><span>Aquaculture & Fisheries<small>Government of the Punjab</small></span></a><button class="workspace-switch" data-action="workspace"><span class="workspace-avatar">ABH</span><span>Aqua Business Hub ERP<small>Integrated management prototype</small></span>${icon('down')}</button><div class="creator-card"><img src="./public/client-assets/nespak-logo.jpg" alt="NESPAK logo"/><span>ERP prototype by<br/><strong>NESPAK</strong></span></div><nav>${modules.map(m=>`${m.group?`<div class="nav-group">${m.group}</div>`:''}${navLink(m.id,m.name,m.icon,m.badge)}`).join('')}</nav><div class="sidebar-bottom"><div class="programme-card"><span class="live-dot"></span> Department programme<p>Strengthening inland fisheries<br/>across Punjab.</p><span class="mini-waves" aria-hidden="true"></span></div>${navLink('settings','Workspace settings','settings')}<button class="profile" data-action="profile"><span class="avatar">AK</span><span>Ahmed Kamal<small>Project Director</small></span>${icon('more')}</button></div></aside><div class="workspace"><header class="topbar"><div class="breadcrumb"><button class="icon-btn mobile-toggle" data-action="menu" aria-label="Open navigation">${icon('menu')}</button><span>Aquaculture & Fisheries</span>${icon('chevron')}<strong>${modules.find(m=>m.id===state.page)?.name||'Workspace settings'}</strong></div><div class="top-tools"><button class="theme-switch ${state.dark?'active':''}" data-action="theme" role="switch" aria-checked="${state.dark}" aria-label="Toggle dark mode"><i></i><span>${state.dark?'Dark':'Light'}</span></button><button class="global-search" data-action="search">${icon('search')}<span>Search anything...</span><kbd>Ctrl K</kbd></button><span class="top-divider"></span><button class="icon-btn" data-action="help" aria-label="Help and demo guide">${icon('help')}</button><button class="icon-btn notification-btn" data-action="notifications" aria-label="Notifications, 3 unread">${icon('bell')}<i></i></button><button class="avatar small" data-action="profile" aria-label="Open profile">AK</button></div></header><main id="main" tabindex="-1">${state.page==='overview'?overview():state.page==='settings'?settings():modulePage()}</main><footer><span>${icon('wave')} Department of Aquaculture & Fisheries <i>&middot;</i> Aqua Business Hub ERP</span><span class="creator-mark"><img src="./public/client-assets/nespak-logo.jpg" alt="NESPAK logo"/> Designed by NESPAK</span><span>Interactive prototype <i>&middot;</i> Illustrative data</span></footer></div>`;
 if(state.menu)app.insertAdjacentHTML('afterbegin','<button class="nav-backdrop" data-action="menu" aria-label="Close navigation"></button>');
 document.querySelector('.sidebar').insertAdjacentHTML('afterbegin',`<button class="icon-btn sidebar-close" data-action="menu" aria-label="Close navigation">${icon('close')}</button>`);
 document.title=`Aquaculture & Fisheries Punjab - ${modules.find(m=>m.id===state.page)?.name||'Settings'}`;
}
function filters(){return `<div class="page-filters"><label>${icon('pin')}<select id="hub-filter" aria-label="Project hub">${['All project hubs',...hubs.map(h=>h.name)].map(v=>`<option ${v===state.hub?'selected':''}>${v}</option>`).join('')}</select></label><label>${icon('calendar')}<select id="period-filter" aria-label="Reporting period">${['FY 2026-27','Q1 Jul-Sep 2026','Q2 Oct-Dec 2026'].map(v=>`<option ${v===state.period?'selected':''}>${v}</option>`).join('')}</select></label><span class="filter-date">Snapshot date: 15 September 2026</span><span class="filter-spacer"></span><span class="snapshot-dot"></span><span class="snapshot-label">${state.hub==='All project hubs'?'Consolidated programme view':esc(state.hub)+' hub view'}</span></div>`;}
function heading(eyebrow,title,description,actions){return `<div class="page-heading"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${description}</p></div><div class="heading-actions">${actions}</div></div>`;}
function overview(){
 const selected=hubs.find(h=>h.name===state.hub);
 return `${heading('EXECUTIVE DASHBOARD','Aqua Business Hub performance cockpit.','A presentation-ready view of finance, delivery, aquaculture, people and governance KPIs.',button('Export brief','export','download')+button('View reports','navigate:reports','arrow','btn primary'))}${filters()}<div class="overview-tabs" role="tablist">${['Programme overview','Financial performance','Operational health'].map(t=>`<button role="tab" aria-selected="${state.overviewTab===t}" class="${state.overviewTab===t?'selected':''}" data-action="overview-tab:${t}">${t}</button>`).join('')}<span>${icon('calendar')} Tuesday, 15 September</span></div>${state.overviewTab==='Financial performance'?financialOverview():state.overviewTab==='Operational health'?operationalOverview():executiveDashboard(selected)}`;
}
function executiveDashboard(selected){
 const hubRows=(selected?[selected]:hubs);
 const kpis=[
  ['Approved PC-I','PKR 2.48B','Development programme baseline','wallet','finance'],
  ['FY allocation','PKR 850M','Current year budget envelope','chart','finance'],
  ['Funds utilized','PKR 342.6M','40.3% of annual allocation','up','finance'],
  ['Physical progress',(selected?selected.progress:'64.8')+'%','Programme delivery progress','engineering','engineering'],
  ['Active batches',selected?String(selected.batches):'28','Production batches under monitoring','fish','aquaculture'],
  ['Water compliance','96.8%','Latest field readings in range','droplet','aquaculture'],
  ['Team members',selected?String(selected.staff):'87','Of 112 sanctioned positions','users','people'],
  ['High priority reviews','02','Director attention required','alert','approvals']
 ];
 return `<section class="gov-hero welcome-banner"><div><div class="banner-label"><span></span> GOVERNMENT OF THE PUNJAB - AQUACULTURE & FISHERIES</div><h2>Integrated control for finance, field delivery and fish production.</h2><p>One dashboard for the Aqua Business Hub programme across Muzaffargarh, Mianwali and Chakwal.</p><div class="gov-hero-actions">${button('Review finance','navigate:finance','wallet')}${button('Open risk watch','navigate:risks','shield','btn primary')}</div></div><div class="hero-metric-strip">${[['78%','Muzaffargarh','+3%'],['64%','Mianwali','+2%'],['52%','Chakwal','-1%'],['1.24M','Seed production','+11%'],['92.4%','Survival','+2.1%'],['02','High priority','reviews']].map(([v,l,n])=>`<button data-action="stat:${l}"><strong>${v}</strong><span>${l}</span><small>${n}</small></button>`).join('')}</div><div class="gov-score"><svg viewBox="0 0 120 120" role="img" aria-label="Programme performance score 82 percent"><circle cx="60" cy="60" r="48"></circle><circle cx="60" cy="60" r="48"></circle></svg><strong>82<small>%</small></strong><span>Programme health</span></div></section><section class="kpi-board">${kpis.map(([label,value,note,ic,target],i)=>`<button class="kpi-tile kpi-${i%4}" data-action="navigate:${target}"><span>${icon(ic)}</span><strong>${value}</strong><small>${label}</small><em>${note}</em><small class="kpi-delta">${i===3?'-6.2%':i===7?'+0.2%':'+'+(i%3===0?'0.8':i%3===1?'10.5':'15.5')+'%'}</small>${sparkline(i)}</button>`).join('')}</section>${programmeTimeline()}<div class="executive-grid"><section class="panel hero-chart">${sectionHead('Financial and physical performance','Budget utilization compared with field progress','Open finance','navigate:finance')}<div class="chart-summary"><strong>PKR 342.6<small>M</small><span>Funds utilized</span></strong><div class="legend"><span><i class="dot teal"></i>Released</span><span><i class="dot sage"></i>Utilized</span></div></div>${lineChart()}<div class="progress-ribbons">${[['Budget utilized','40.3','#0077b6'],['Physical progress',selected?selected.progress:'64.8','#2bb673'],['Water compliance','96.8','#00b4d8']].map(([l,v,c])=>`<button data-action="stat:${l}"><span><strong>${v}%</strong>${l}</span><i><b style="width:${v}%;background:${c}"></b></i></button>`).join('')}</div></section><section class="panel">${sectionHead('Punjab hub map','Delivery status by project hub','Explore hubs','hubs')}<div class="executive-map"><svg viewBox="0 0 360 230" role="img" aria-label="Illustrative map of Punjab project hubs"><defs><linearGradient id="mapWater" x1="0" x2="1"><stop offset="0" stop-color="#e8f8ff"/><stop offset="1" stop-color="#f9fdff"/></linearGradient></defs><rect width="360" height="230" fill="url(#mapWater)"/><path d="m218 15 25 16-4 22 25 21-8 29-25 7-1 29-34 13-19 30-28 10-18 25-30-18 1-29-20-18 23-31 24-7 8-30 30-12 4-27 23-9Z" fill="#dff3fc" stroke="#84d9f5" stroke-width="2"/><path d="m207 30-5 36-21 26-3 36-23 25-5 33" fill="none" stroke="#00b4d8" stroke-width="4" opacity=".45"/><path d="M184 72 153 96 137 152" fill="none" stroke="#0077b6" stroke-dasharray="4 5" stroke-width="2"/><text x="231" y="174" class="map-region">PUNJAB</text>${[['Chakwal',184,72,52,'Attention'],['Mianwali',153,96,64,'On track'],['Muzaffargarh',137,152,78,'On track']].map(([n,x,y,p,s],i)=>`<g class="map-pin executive-pin" role="button" tabindex="0" data-action="hub:${i===0?2:i===1?1:0}" aria-label="Explore ${n}"><circle cx="${x}" cy="${y}" r="16" fill="${s==='Attention'?'#ffc857':'#00b4d8'}" opacity=".22"/><circle cx="${x}" cy="${y}" r="6" fill="${s==='Attention'?'#ffc857':'#0077b6'}" stroke="white" stroke-width="3"/><text x="${x+15}" y="${y+4}">${n} - ${p}%</text></g>`).join('')}</svg></div><div class="hub-score-list">${hubRows.map(h=>`<button data-action="hub:${hubs.indexOf(h)}"><span><strong>${h.name}</strong><small>${h.region}</small></span><i><b style="width:${h.progress}%"></b></i><em>${h.progress}%</em></button>`).join('')}</div></section></div><div class="executive-grid three"><section class="panel">${sectionHead('Budget allocation histogram','PC-I object-code distribution','Open finance','navigate:finance')}<div class="histogram">${[['Civil works',420,100],['Plant & machinery',180,43],['Employee expenses',125,30],['Operations',75,18],['Research',50,12]].map(([l,v,w])=>`<button data-action="allocation:${l}"><span>${l}</span><i><b style="height:${w}%"></b></i><strong>${v}M</strong></button>`).join('')}</div></section><section class="panel">${sectionHead('Aquaculture operating pulse','Production, survival and water watch','Open operations','navigate:aquaculture')}<div class="aqua-gauge-row">${[['Seed production','1.24M','fingerlings','#0077b6'],['Survival','92.4%','average','#2bb673'],['Alerts','02','ponds','#ffc857']].map(([l,v,n,c])=>`<button data-action="navigate:aquaculture"><i style="background:${c}">${icon(l==='Alerts'?'alert':'fish')}</i><strong>${v}</strong><span>${l}<small>${n}</small></span></button>`).join('')}</div><div class="mini-bars">${[['Tilapia',94],['Rohu',92],['Grass carp',89],['Silver carp',92]].map(([l,v])=>`<button data-action="stat:${l} survival"><span>${l}</span><i><b style="width:${v}%"></b></i><strong>${v}%</strong></button>`).join('')}</div></section><section class="panel">${sectionHead('Governance watch','Approvals, risk and reporting readiness','Open inbox','navigate:approvals')}${governancePie()}</section></div>${decisionRadar()}<div class="dashboard-bottom"><section class="panel attention-panel">${sectionHead('Priority action list','Tasks that need leadership attention','Open tracker','navigate:tasks')}${priorityActions()}</section><section class="panel activity-panel">${sectionHead('Management timeline','Latest operational movement')}<div class="timeline">${[['green','Batch BTH-026 reached fingerling stage','Muzaffargarh hatchery','35 min ago'],['blue','Site progress report updated','Mianwali - Engineering','1 hour ago'],['sage','August utilization brief published','Project office - Finance','2 hours ago']].map(([tone,title,sub,time])=>`<button data-action="activity:${title}" class="timeline-item"><i class="timeline-dot ${tone}"></i><span><strong>${title}</strong><small>${sub}<b>${time}</b></small></span></button>`).join('')}</div></section></div>`;
}



function priorityActions(){
 const tone=status=>status==='Delayed'?'amber':status==='High priority'?'blue':'sage';
 const ic=status=>status==='Delayed'?'alert':status==='High priority'?'file':'clock';
 const rows=configs.tasks.rows.filter(r=>['Delayed','High priority','Due soon'].includes(r[4])).slice(0,3);
 return `<div class="attention-list">${rows.map(r=>`<button class="attention-item" data-action="navigate:tasks"><span class="attention-icon ${tone(r[4])}">${icon(ic(r[4]))}</span><span><strong>${esc(r[0])}</strong><small>${esc(r[1])} - Due ${esc(r[3])}</small></span><em>${esc(r[2])}</em>${icon('chevron')}</button>`).join('')}</div>`;
}

function programmeTimeline(){
 const steps=[
  ['01','PC-I approved','Baseline locked','complete','#00b4d8'],
  ['02','Procurement started','Packages active','complete','#2bb673'],
  ['03','Civil works active','Sites progressing','active','#ffc857'],
  ['04','Aquaculture operations','Batches monitored','active','#48cae4'],
  ['05','Monitoring & reporting','Monthly brief ready','watch','#7b61ff'],
  ['06','Government review','Director attention','pending','#ff6b6b']
 ];
 return `<section class="programme-timeline" aria-label="Programme progress timeline"><div class="timeline-copy"><span>PROGRAMME ROADMAP</span><strong>From approval to government review</strong><small>Connected view of finance, procurement, construction, operations and reporting.</small></div><div class="timeline-track">${steps.map(([n,title,note,status,color],i)=>`<button data-action="stat:${title}" class="${status}" style="--step:${color};--index:${i}"><i>${n}</i><strong>${title}</strong><small>${note}</small></button>`).join('')}</div></section>`;
}

function premiumInsightStrip(selected){
 const progress=selected?selected.progress:64.8;
 const insights=[
  ['Programme health','82%','Composite score across finance, delivery and governance','up','#00b4d8'],
  ['Delivery confidence',progress+'%','Current physical progress against planned sequence','engineering','#2bb673'],
  ['Budget efficiency','40.3%','Utilized from released funds with controls active','wallet','#ffc857'],
  ['Risk pressure','02','High priority reviews requiring director attention','alert','#ff6b6b']
 ];
 return `<section class="premium-insights" aria-label="Executive insight summary">${insights.map(([label,value,note,ic,color],i)=>`<button data-action="stat:${label}" style="--accent:${color};--pct:${String(value).replace(/[^0-9.]/g,'')||'72'}"><span class="insight-orb">${icon(ic)}</span><strong>${value}</strong><em>${label}</em><small>${note}</small><i class="insight-meter"><b></b></i></button>`).join('')}</section>`;
}
function decisionRadar(){
 const rings=[['Finance',78,'#00b4d8'],['Delivery',65,'#2bb673'],['Water',97,'#48cae4'],['Governance',72,'#ffc857'],['Risk',58,'#ff6b6b']];
 return `<section class="panel decision-radar-panel">${sectionHead('Executive decision radar','Where leadership attention is strongest this week','Open risks','navigate:risks')}<div class="decision-radar"><div class="radar-visual"><svg viewBox="0 0 260 260" role="img" aria-label="Decision radar chart"><defs><radialGradient id="radarGlow" cx="50%" cy="50%"><stop offset="0" stop-color="#00b4d8" stop-opacity=".28"/><stop offset="1" stop-color="#00b4d8" stop-opacity="0"/></radialGradient></defs><circle cx="130" cy="130" r="112" fill="url(#radarGlow)"/><circle cx="130" cy="130" r="96"/><circle cx="130" cy="130" r="68"/><circle cx="130" cy="130" r="40"/><path d="M130 34 217 100 184 207 76 207 43 100Z"/><path class="radar-fill" d="M130 54 188 108 174 185 89 190 62 112Z"/><path class="radar-line" d="M130 54 188 108 174 185 89 190 62 112Z"/>${[[130,54],[188,108],[174,185],[89,190],[62,112]].map(([x,y],i)=>`<circle class="radar-node node-${i}" cx="${x}" cy="${y}" r="6"/>`).join('')}<text x="130" y="23">Finance</text><text x="221" y="99">Delivery</text><text x="181" y="225">Water</text><text x="45" y="225">Governance</text><text x="9" y="99">Risk</text></svg></div><div class="radar-list">${rings.map(([label,val,color])=>`<button data-action="stat:${label}" style="--accent:${color}"><span><i></i><strong>${label}</strong><em>${val}%</em></span><b><small style="width:${val}%"></small></b></button>`).join('')}</div><div class="decision-summary"><strong>Leadership focus</strong><p>Chakwal water alert and pending IPC review are the two items creating most pressure on this week\'s score.</p><button data-action="navigate:approvals">View action inbox ${icon('arrow')}</button></div></div></section>`;
}

function sparkline(index){
 const series=[
  [[2,27],[12,23],[22,21],[32,28],[42,32],[52,27],[62,14],[72,13],[82,15],[94,14],[108,15]],
  [[2,30],[14,27],[26,24],[38,22],[50,18],[60,8],[70,14],[80,19],[92,16],[108,13]],
  [[2,29],[12,22],[24,18],[36,24],[48,33],[58,30],[70,15],[82,10],[94,12],[108,17]],
  [[2,30],[13,25],[25,22],[37,27],[49,34],[59,32],[71,17],[84,13],[96,16],[108,16]],
  [[2,31],[14,25],[26,22],[38,27],[50,32],[62,28],[74,15],[86,12],[98,14],[108,16]],
  [[2,31],[13,21],[24,15],[36,18],[48,29],[60,25],[72,11],[84,8],[96,11],[108,15]],
  [[2,32],[14,27],[26,25],[38,31],[50,31],[62,21],[74,18],[86,18],[98,17],[108,14]],
  [[2,31],[14,24],[26,21],[38,26],[50,32],[62,30],[74,17],[86,16],[98,16],[108,15]]
 ];
 const pts=series[index%series.length];
 const line=pts.map(([x,y],i)=>`${i?'L':'M'}${x} ${y}`).join(' ');
 const area=`${line} L108 38 L2 38 Z`;
 const [x,y]=pts.at(-1);
 return `<svg class="kpi-line" viewBox="0 0 110 40" aria-hidden="true"><path class="kpi-area" d="${area}"/><path class="kpi-trend" d="${line}"/><circle class="kpi-end" cx="${x}" cy="${y}" r="2.15"/></svg>`;
}
function governancePie(){
 const items=[
  ['Awaiting review',8,'approvals','eye','#00b4d8',14.8,0],
  ['High priority',2,'approvals','alert','#ff6b6b',3.7,-14.8],
  ['Open risks',12,'risks','shield','#ffc857',22.2,-18.5],
  ['Reports ready',32,'reports','chart','#2bb673',59.3,-40.7]
 ];
 return `<div class="governance-pie big"><button class="governance-donut" data-action="navigate:approvals" aria-label="Governance watch summary"><svg viewBox="0 0 200 200" role="img" aria-label="Governance watch pie chart"><circle class="donut-base" cx="100" cy="100" r="70"/>${items.map(([l,v,t,ic,c,pct,offset],i)=>`<circle class="donut-slice slice-${i}" cx="100" cy="100" r="70" pathLength="100" stroke="${c}" stroke-dasharray="${pct} ${100-pct}" stroke-dashoffset="${offset}"/>`).join('')}</svg><span><strong>54</strong><small>Total signals</small></span></button><div class="governance-pie-labels">${items.map(([l,v,target,ic,c])=>`<button data-action="navigate:${target}" style="--tone:${c}"><i></i><strong>${String(v).padStart(2,'0')}</strong><small>${l}</small></button>`).join('')}</div></div>`;
}
function financialOverview(){return `<div class="stat-grid">${configs.finance.stats.map((s,i)=>statCard(...s,i)).join('')}</div><div class="dashboard-grid"><section class="panel">${sectionHead('Funding & expenditure','Quarterly trend Â- PKR million','Open finance','navigate:finance')}${lineChart()}<div class="legend padded"><span><i class="dot teal"></i>Released</span><span><i class="dot sage"></i>Utilized</span></div></section>${budgetPanel()}</div><section class="panel register-panel">${sectionHead('Object-code performance','FY 2026â€“27 allocation snapshot','Explore budget','navigate:finance')}${overviewTable(configs.finance)}</section>`;}
function operationalOverview(){return `<div class="stat-grid">${configs.aquaculture.stats.map((s,i)=>statCard(...s,i)).join('')}</div>${aquaPanels()}<section class="panel register-panel">${sectionHead('Production batches','Biological traceability across the programme','Open operations','navigate:aquaculture')}${overviewTable(configs.aquaculture)}</section>`;}
function overviewTable(config){currentRows=config.rows;currentColumns=config.columns;return table(config.columns,config.rows);}
function budgetPanel(){return `<section class="panel">${sectionHead('Allocation by component','Approved annual budget')}<div class="allocation-body"><div class="donut"><div><small>FY ALLOCATION</small><strong>850<span>M</span></strong><small>PKR</small></div></div><div class="allocation-legend">${[['Civil works','420M','#247869'],['Plant & machinery','180M','#80a88a'],['Employee expenses','125M','#b5c385'],['Operations & research','125M','#e2d4b5']].map(([l,v,c])=>`<button data-action="allocation:${l}"><i style="background:${c}"></i><span>${l}</span><strong>${v}</strong></button>`).join('')}</div></div></section>`;}
function aquaPanels(){return `<div class="dashboard-grid"><section class="panel">${sectionHead('Production lifecycle','Season 2026 Â- All freshwater species','View batches','tab:Production batches')}<div class="lifecycle">${[['Eggs','1.86M','01'],['Hatchlings','1.64M','02'],['Fry','1.42M','03'],['Fingerlings','1.24M','04']].map(([l,v,n])=>`<button data-action="lifecycle:${l}"><small>${n}</small>${icon('fish')}<strong>${v}</strong><span>${l}</span></button>`).join('')}</div><div class="aqua-note">${icon('leaf')} 92.4% average survival <span>Across 28 active batches</span></div>${lineChart('aqua')}<div class="legend padded"><span><i class="dot teal"></i>Nile tilapia</span><span><i class="dot sage"></i>Carp species</span></div></section><section class="panel water-panel">${sectionHead('Water quality watch','Latest field observations Â- Today, 09:00','Full log','water-log')}<div class="water-hero"><span>${icon('droplet')}</span><div><strong>96.8<small>%</small></strong><p>Readings within target range</p></div></div>${[['Dissolved oxygen','6.2','mg/L','5.0â€“8.0'],['Temperature','27.4','Â°C','24â€“30'],['pH level','7.6','','6.5â€“8.5']].map(([l,v,u,range])=>`<button class="water-reading" data-action="water:${l}"><span>${l}<small>Target ${range}</small></span><strong>${v} <small>${u}</small></strong><span class="reading-status"></span></button>`).join('')}<button class="alert-callout" data-action="risk-alert">${icon('alert')}<span><strong>Pond C-03 needs attention</strong><small>Low dissolved oxygen Â- 3.8 mg/L</small></span>${icon('chevron')}</button></section></div>`;}

function statusOptionsForCurrentView(){
 const rows=getRecords().rows;
 const found=[...new Set(rows.map(r=>r.at(-1)))];
 const preferred=state.page==='engineering'&&state.tab==='Work packages'?['On track','High priority','Delayed','Completed']:null;
 return preferred?[...preferred.filter(s=>found.includes(s)),...found.filter(s=>!preferred.includes(s))]:found;
}

function modulePage(){
 const c=configs[state.page];
 return `${heading(c.eyebrow,c.title,c.description,button('Export','export','download')+button(c.action,'create','plus','btn primary'))}${filters()}<div class="module-tabs" role="tablist">${c.tabs.map(t=>`<button role="tab" aria-selected="${state.tab===t}" data-action="tab:${t}" class="${state.tab===t?'selected':''}">${t}${t==='Awaiting review'?'<span>8</span>':''}</button>`).join('')}</div>${modulePhotoBand()}${state.tab===c.tabs[0]?`<div class="stat-grid">${c.stats.map((s,i)=>statCard(...s,i)).join('')}</div>${state.page==='finance'?financeEntryActions():''}${moduleVisual()}`:''}<section class="panel register-panel">${sectionHead(registerTitle(),registerSubtitle())}<div class="table-toolbar"><label class="table-search">${icon('search')}<input id="table-search" placeholder="Search ${state.page==='people'?'people':'records'}..." value="${esc(state.query)}" aria-label="Search records"/></label><div class="toolbar-right"><label class="status-filter">${icon('filter')}<select id="status-filter" aria-label="Filter by status"><option>All statuses</option>${statusOptionsForCurrentView().map(s=>`<option ${state.status===s?'selected':''}>${s}</option>`).join('')}</select></label>${state.page==='engineering'&&state.tab==='Work packages'?'':button('Filters','advanced-filters','filter')}</div></div><div id="table-content">${renderTable()}</div></section>`;
}
function modulePhotoBand(){
 const photos={
  finance:['module-banners/finance.jpg','Public investment tracking','wallet','Budget, releases and utilization for Aqua Business Hubs.'],
  procurement:['module-banners/procurement.jpg','Procurement for fisheries infrastructure','bag','Packages, vendors and contract milestones connected to field delivery.'],
  engineering:['module-banners/engineering.jpg','Site works and field progress','engineering','Civil works, measurements and quality records across project hubs.'],
  people:['module-banners/people.jpg','Project teams and field service','users','Staff, attendance and service delivery teams supporting Punjab fisheries.'],
  aquaculture:['module-banners/aquaculture.jpg','Fish farms, seed and water quality','fish','Production batches, pond monitoring, feed and health observations.'],
  assets:['module-banners/assets.jpg','Stores, equipment and farm assets','box','Inventory, equipment, maintenance and movement records.'],
  research:['module-banners/research.jpg','Research, training and extension','flask','Trials, farmer training, SOPs and field learning activities.'],
  documents:['module-banners/documents.jpg','Project documentation archive','file','PC-I files, drawings, technical reports and supporting evidence.'],
  approvals:['module-banners/approvals.jpg','Review stages and governance','circlecheck','Static review states for finance, procurement, engineering and HR records.'],
  risks:['module-banners/risks.jpg','Risk watch for fisheries projects','shield','Operational, construction and water-quality risks with mitigation actions.'],
  tasks:['module-banners/reports.jpg','Tasks, deadlines and accountability','calendar','Assign actions, monitor due dates and focus delayed work.'],
  reports:['module-banners/reports.jpg','Management reports and insights','chart','Briefs and dashboards for decision makers and project leadership.']
 };
 const [img,title,ic,copy]=photos[state.page]||photos.aquaculture;
 return `<section class="module-photo-band"><img src="./public/client-assets/${img}" alt="${esc(title)}"/><div><span>${icon(ic)} ${esc(configs[state.page]?.eyebrow||'AQUACULTURE & FISHERIES')}</span><h2>${esc(title)}</h2><p>${esc(copy)}</p></div><button class="photo-chip" data-action="help">${icon('eye')} Prototype view</button></section>`;
}
function financeEntryActions(){
 return `<section class="finance-entry-actions" aria-label="Finance entry shortcuts"><div><strong>Finance entry shortcuts</strong><span>Prototype forms for budget baseline and utilization records.</span></div><div>${button('Update budget baseline','finance-form:baseline','wallet')}${button('Add fund utilization','finance-form:utilization','up','btn primary')}</div></section>`;
}

function engineeringWorkPackages(){return [
 {name:'Hatchery & nursery block',location:'Muzaffargarh',start:'01 Jul 2026',duration:'153 days',progress:'78%',due:'30 Nov 2026',status:'On track',children:[
  ['Site preparation & layout','01 Jul 2026','18 days','100%','18 Jul 2026','Completed'],
  ['Civil structure works','19 Jul 2026','72 days','86%','30 Sep 2026','On track'],
  ['Nursery tanks & plumbing','01 Oct 2026','45 days','62%','15 Nov 2026','High priority'],
  ['Testing and handover','16 Nov 2026','15 days','10%','30 Nov 2026','On track']
 ]},
 {name:'Research laboratory',location:'Mianwali',start:'15 Jul 2026',duration:'154 days',progress:'64%',due:'15 Dec 2026',status:'On track',children:[
  ['Building shell completion','15 Jul 2026','65 days','82%','18 Sep 2026','On track'],
  ['Lab benching and utilities','19 Sep 2026','52 days','58%','10 Nov 2026','On track'],
  ['Equipment installation','11 Nov 2026','24 days','18%','05 Dec 2026','High priority'],
  ['Calibration and readiness','06 Dec 2026','10 days','0%','15 Dec 2026','On track']
 ]},
 {name:'Water intake & treatment',location:'Chakwal',start:'01 Aug 2026',duration:'212 days',progress:'52%',due:'28 Feb 2027',status:'Delayed',children:[
  ['Intake chamber excavation','01 Aug 2026','45 days','74%','15 Sep 2026','Delayed'],
  ['Pipeline and valve works','16 Sep 2026','68 days','45%','22 Nov 2026','High priority'],
  ['Treatment filtration units','23 Nov 2026','65 days','20%','26 Jan 2027','On track'],
  ['Commissioning and water testing','27 Jan 2027','33 days','0%','28 Feb 2027','On track']
 ]},
 {name:'Administration building',location:'Muzaffargarh',start:'01 Jun 2026',duration:'153 days',progress:'86%',due:'31 Oct 2026',status:'Completed',children:[
  ['Foundation and frame','01 Jun 2026','48 days','100%','18 Jul 2026','Completed'],
  ['Finishing works','19 Jul 2026','74 days','88%','30 Sep 2026','Completed'],
  ['Furniture and ICT setup','01 Oct 2026','24 days','45%','24 Oct 2026','On track'],
  ['Final inspection','25 Oct 2026','7 days','0%','31 Oct 2026','On track']
 ]},
 {name:'Solar & electrical works',location:'Mianwali',start:'10 Sep 2026',duration:'144 days',progress:'42%',due:'31 Jan 2027',status:'High priority',children:[
  ['Electrical room preparation','10 Sep 2026','28 days','65%','07 Oct 2026','High priority'],
  ['Solar panel mounting','08 Oct 2026','46 days','34%','22 Nov 2026','Delayed'],
  ['Inverter and battery installation','23 Nov 2026','42 days','10%','03 Jan 2027','On track'],
  ['Load testing and energization','04 Jan 2027','28 days','0%','31 Jan 2027','On track']
 ]}
];}
function engineeringWorkPackageFlatRows(){return engineeringWorkPackages().flatMap(pkg=>[[pkg.name,pkg.location,pkg.start,pkg.duration,pkg.progress,pkg.due,pkg.status],...pkg.children.map(child=>[child[0],pkg.location,child[1],child[2],child[3],child[4],child[5]])]);}
function renderWorkPackageHierarchy(){
 const q=state.query.toLowerCase();
 const status=state.status;
 const visible=[];
 const rows=engineeringWorkPackages().map((pkg,pi)=>{
  const childRows=pkg.children.map((child,ci)=>({type:'child',pi,ci,name:child[0],location:pkg.location,start:child[1],duration:child[2],progress:child[3],due:child[4],status:child[5]}));
  const parent={type:'parent',pi,name:pkg.name,location:pkg.location,start:pkg.start,duration:pkg.duration,progress:pkg.progress,due:pkg.due,status:pkg.status,children:childRows};
  const matches=row=>(!q||[row.name,row.location,row.start,row.duration,row.progress,row.due,row.status].join(' ').toLowerCase().includes(q))&&(status==='All statuses'||row.status===status);
  const matchingChildren=childRows.filter(matches);
  const parentMatches=matches(parent);
  if(parentMatches||matchingChildren.length){
   const shownChildren=parentMatches?childRows:matchingChildren;
   const expanded=expandedWbs.has(String(pi))||q||status!=='All statuses';
   visible.push(parent,...(expanded?shownChildren:[]));
   return {parent,children:shownChildren,expanded};
  }
  return null;
 }).filter(Boolean);
 currentColumns=['Work package / subtask','Location','Start date','Duration','Physical progress','Due date','Status'];
 currentRows=visible.map(r=>[r.name,r.location,r.start,r.duration,r.progress,r.due,r.status]);
 const progressCell=p=>`<div class="inline-progress wbs-progress"><span>${esc(p)}</span><div><i style="width:${parseFloat(p)||0}%"></i></div></div>`;
 const indexOf=row=>Math.max(0,currentRows.findIndex(r=>r[0]===row.name));
 const rowHtml=(row,expanded=false,childCount=0)=>`<tr class="wbs-${row.type}" data-action="${row.type==='parent'?'wbs-toggle:'+row.pi:'record:'+indexOf(row)}" tabindex="0" aria-expanded="${row.type==='parent'?expanded:''}"><td><button class="record-link wbs-name" data-action="${row.type==='parent'?'wbs-toggle:'+row.pi:'record:'+indexOf(row)}"><span class="wbs-chevron ${expanded?'open':''}">${row.type==='parent'?icon('chevron'):''}</span><span class="wbs-marker">${row.type==='parent'?icon('building'):icon('circlecheck')}</span><span class="wbs-title"><strong>${esc(row.name)}</strong>${row.type==='child'?'<small>Subtask under work package</small>':`<small>${childCount} subtasks - click to ${expanded?'hide':'view'}</small>`}</span></button></td><td>${esc(row.location)}</td><td>${esc(row.start)}</td><td>${esc(row.duration)}</td><td>${progressCell(row.progress)}</td><td>${esc(row.due)}</td><td>${badge(row.status)}</td><td>${row.type==='parent'?`<button class="wbs-row-arrow ${expanded?'open':''}" data-action="wbs-toggle:${row.pi}" aria-label="${expanded?'Hide':'Show'} subtasks">${icon('chevron')}</button>`:icon('chevron')}</td></tr>`;
 return `<div class="table-scroll"><table class="wbs-table"><thead><tr>${currentColumns.map(c=>`<th scope="col">${esc(c)}</th>`).join('')}<th scope="col"><span class="sr-only">Details</span></th></tr></thead><tbody>${rows.length?rows.map(group=>rowHtml(group.parent,group.expanded,group.children.length)+(group.expanded?group.children.map(row=>rowHtml(row)).join(''):'' )).join(''):`<tr><td colspan="${currentColumns.length+1}" class="empty-state">${icon('search')}<h3>No matching work packages</h3><p>Try another status or clear the search.</p></td></tr>`}</tbody></table></div><div class="table-pagination"><span>${currentRows.length?'Showing 1-'+currentRows.length:'0'} of ${currentRows.length} records</span><span>Hierarchical WBS register</span><div><button disabled aria-label="Previous page">${icon('chevron','rotate')}</button><button class="current" aria-label="Page 1" aria-current="page">1</button><button disabled aria-label="Next page">${icon('chevron')}</button></div></div>`;
}

function registerTitle(){if(state.tab==='Overview')return ({finance:'Budget by object code',procurement:'Active procurement packages',engineering:'Work package register',people:'Your project team',aquaculture:'Active production batches',assets:'Assets & inventory watch',research:'Research & training programmes',documents:'Document register',approvals:'Review inbox',risks:'Risk register',tasks:'Task & deadline register',reports:'Report library'})[state.page]||'Programme register';return state.tab;}
function registerSubtitle(){return state.hub==='All project hubs'?'All project hubs - September 2026':`${esc(state.hub)} - September 2026`;}
function getRecords(){
 const c=configs[state.page];
 if(state.page==='engineering'&&state.tab==='Work packages')return {columns:['Work package / subtask','Location','Start date','Duration','Physical progress','Due date','Status'],rows:engineeringWorkPackageFlatRows()};
 if(tabRecords[state.tab])return tabRecords[state.tab];
 let rows=c.rows;
 const filtersByTab={'Financial records':r=>r[2]==='Finance','Technical drawings':r=>r[2]==='Engineering','Correspondence':r=>r[2]==='Project office','Policies & SOPs':r=>r[2]==='Aquaculture','Finance':r=>r[2]==='Finance','Procurement':r=>r[2]==='Procurement','Engineering':r=>state.page==='reports'?r[1]==='Engineering':r[2]==='Engineering','HR & admin':r=>r[2]==='HR & admin','Financial':r=>r[1]==='Financial','Operational':r=>r[1]==='Operational','People':r=>r[1]==='People','Research trials':r=>r[0].includes('trial')||r[0].includes('performance'),'Training calendar':r=>!r[0].includes('trial')&&!r[0].includes('performance'),'Due this week':r=>r[4]!=='Completed','Delayed tasks':r=>r[4]==='Delayed','High priority':r=>r[4]==='High priority','Completed':r=>r[4]==='Completed'};
 if(filtersByTab[state.tab])rows=rows.filter(filtersByTab[state.tab]);
 return {columns:c.columns,rows};
}
function renderTable(){
 if(state.page==='engineering'&&state.tab==='Work packages')return renderWorkPackageHierarchy();
 const data=getRecords(); currentColumns=data.columns;
 currentRows=data.rows.filter(r=>(!state.query||r.join(' ').toLowerCase().includes(state.query.toLowerCase()))&&(state.status==='All statuses'||r.at(-1)===state.status));
 if(state.hub!=='All project hubs'&&['engineering','people','aquaculture','assets','research','risks'].includes(state.page))currentRows=currentRows.filter(r=>r.join(' ').includes(state.hub)||r.join(' ').includes('All hubs'));
 return table(currentColumns,currentRows)+`<div class="table-pagination"><span>${currentRows.length?'Showing 1-'+currentRows.length:'0'} of ${currentRows.length} records</span><span>Illustrative register</span><div><button disabled aria-label="Previous page">${icon('chevron','rotate')}</button><button class="current" aria-label="Page 1" aria-current="page">1</button><button disabled aria-label="Next page">${icon('chevron')}</button></div></div>`;
}

function actionTrackerVisual(){
 const rows=configs.tasks.rows;
 const counts={delayed:rows.filter(r=>r[4]==='Delayed').length,due:rows.filter(r=>['Due soon','High priority'].includes(r[4])).length,progress:rows.filter(r=>r[4]==='In progress').length,completed:rows.filter(r=>r[4]==='Completed').length};
 const total=rows.length;
 const timeline=[['Delayed',counts.delayed,'#ff6b6b'],['Due soon',counts.due,'#ffc857'],['In progress',counts.progress,'#00b4d8'],['Completed',counts.completed,'#2bb673']];
 const modules=[['Aquaculture',1,'#00b4d8'],['Engineering',2,'#7b61ff'],['Procurement',1,'#ffc857'],['Finance',1,'#2bb673'],['Documents',1,'#48cae4'],['Research',1,'#90be6d'],['Assets',1,'#f8961e']];
 return `<div class="task-command-strip"><div><span class="eyebrow">TODAY'S ACTION CONTROL</span><h2>${counts.delayed} delayed, ${counts.due} due soon</h2><p>Use this tracker for tasks, owners, due dates, priority and status follow-up.</p></div><div class="task-rings">${timeline.map(([label,value,color])=>`<button data-action="tab:${label==='Delayed'?'Delayed tasks':label==='Due soon'?'Due this week':label}" style="--tone:${color};--pct:${Math.max(12,Math.round(value/total*100))}"><strong>${String(value).padStart(2,'0')}</strong><span>${label}</span></button>`).join('')}</div></div><div class="dashboard-grid task-grid"><section class="panel task-deadline-panel">${sectionHead('Deadline pressure','Tasks grouped by current delivery status','Add task','create')}<div class="task-bars">${timeline.map(([label,value,color])=>`<button data-action="tab:${label==='Delayed'?'Delayed tasks':label==='Due soon'?'Due this week':label}" style="--tone:${color}"><span><strong>${label}</strong><small>${value} task${value===1?'':'s'}</small></span><i><b style="width:${Math.max(8,value/total*100)}%"></b></i><em>${Math.round(value/total*100)}%</em></button>`).join('')}</div></section><section class="panel task-calendar-panel">${sectionHead('Due date radar','Upcoming deadlines by day','View delayed','tab:Delayed tasks')}<div class="deadline-radar">${rows.slice(0,7).map((r,i)=>`<button data-action="record:${i}" class="${r[4].toLowerCase().replace(/\s+/g,'-')}"><small>${r[3].split(' ')[0]}</small><strong>${r[3].split(' ')[1]}</strong><span>${r[0]}</span><em>${r[4]}</em></button>`).join('')}</div></section></div><section class="panel task-module-panel">${sectionHead('Workload by module','Where action items are coming from','High priority','tab:High priority')}<div class="module-load-chart">${modules.map(([label,value,color])=>`<button data-action="stat:${label} tasks" style="--tone:${color};--height:${Math.max(18,value*28)}%"><i><b></b></i><strong>${value}</strong><span>${label}</span></button>`).join('')}</div></section>`;
}


function engineeringWbsDashboard(){
 const packages=engineeringWorkPackages();
 const children=packages.flatMap(p=>p.children.map(c=>({package:p.name,name:c[0],start:c[1],duration:c[2],progress:c[3],due:c[4],status:c[5]})));
 const count=status=>children.filter(c=>c.status===status).length;
 const total=children.length;
 const metrics=[['Total subtasks',String(total).padStart(2,'0'),'Across 5 work packages','building','#00b4d8'],['Completed',String(count('Completed')).padStart(2,'0'),'Finished WBS items','circlecheck','#2bb673'],['High priority',String(count('High priority')).padStart(2,'0'),'Need management focus','alert','#ffc857'],['Delayed',String(count('Delayed')).padStart(2,'0'),'Past planned sequence','clock','#ff6b6b']];
 return `<section class="panel wbs-dashboard-panel">${sectionHead('WBS delivery breakdown','Subtask hierarchy progress across engineering work packages','Open work packages','tab:Work packages')}<div class="wbs-metric-grid">${metrics.map(([label,value,note,ic,color])=>`<button data-action="tab:${label==='Total subtasks'?'Work packages':label==='High priority'?'Work packages':label}" style="--tone:${color}"><i>${icon(ic)}</i><strong>${value}</strong><span>${label}<small>${note}</small></span></button>`).join('')}</div><div class="wbs-package-progress">${packages.map(pkg=>{const delayed=pkg.children.filter(c=>c[5]==='Delayed').length;const high=pkg.children.filter(c=>c[5]==='High priority').length;return `<button data-action="tab:Work packages" class="${pkg.status.toLowerCase().replace(/\s+/g,'-')}" style="--pct:${parseFloat(pkg.progress)||0}"><span><strong>${esc(pkg.name)}</strong><small>${pkg.children.length} subtasks - ${pkg.status}${high?` - ${high} high priority`:''}${delayed?` - ${delayed} delayed`:''}</small></span><i><b style="width:${parseFloat(pkg.progress)||0}%"></b></i><em>${pkg.progress}</em></button>`}).join('')}</div></section>`;
}

function moduleVisual(){
 if(state.page==='finance')return `<div class="dashboard-grid"><section class="panel">${sectionHead('Funds release & utilization','Cumulative actuals and forecast Â- PKR million')}${lineChart()}<div class="legend padded"><span><i class="dot teal"></i>Released</span><span><i class="dot sage"></i>Utilized</span></div></section>${budgetPanel()}</div>`;
 if(state.page==='aquaculture')return aquaPanels();
 if(state.page==='engineering')return `<div class="dashboard-grid"><section class="panel">${sectionHead('Physical vs planned progress','Programme S-curve - FY 2026-27')}${lineChart('engineering')}<div class="legend padded"><span><i class="dot teal"></i>Planned</span><span><i class="dot sage"></i>Actual / forecast</span></div></section><section class="panel">${sectionHead('Upcoming milestones','Critical dates across active work packages')}<div class="milestone-list">${[['22','SEP','Hatchery roof slab inspection','Muzaffargarh - Civil works'],['30','SEP','Water intake pressure test','Chakwal - Infrastructure'],['15','OCT','Laboratory fit-out handover','Mianwali - Research block']].map(([d,m,l,s])=>`<button data-action="milestone:${l}"><span class="date-tile"><strong>${d}</strong>${m}</span><span><strong>${l}</strong><small>${s}</small></span>${icon('chevron')}</button>`).join('')}</div></section></div>${engineeringWbsDashboard()}`;
 if(state.page==='procurement')return `<section class="panel pipeline-panel">${sectionHead('Procurement pipeline','A connected view from requisition to delivery')}<div class="pipeline">${[['Requisition','08','01'],['Tendering','06','02'],['Evaluation','06','03'],['Awarded','04','04'],['Delivery','05','05'],['Completed','18','06']].map(([l,n,i])=>`<button data-action="pipeline:${l}"><span>${i} ${icon('arrow')}</span><strong>${n}</strong><small>${l}</small></button>`).join('')}</div></section>`;
 if(state.page==='people')return `<div class="people-band"><div><span class="eyebrow">YOUR PEOPLE, CONNECTED</span><h2>One team. A shared purpose.</h2><p>87 specialists bringing the programme to life.</p></div><div class="avatar-stack">${['AM','HR','SA','UA','FK'].map((v,i)=>`<button style="--avatar-color:${['#cbdac5','#e7d9c4','#cad9de','#d7d0df','#c2d6cc'][i]}" data-action="person:${i}" aria-label="View ${configs.people.rows[i][0]}">${v}</button>`).join('')}<span>+82</span></div>${button('Employee self-service','self-service','arrow')}</div>`;
 if(state.page==='documents')return `<div class="collection-grid">${[['wallet','Financial records','248 documents'],['engineering','Technical drawings','186 documents'],['mail','Correspondence','624 documents'],['shield','Policies & SOPs','226 documents']].map(([ic,t,n])=>`<button class="collection-card" data-action="tab:${t}">${icon(ic)}<strong>${t}</strong><span>${n} ${icon('arrow')}</span></button>`).join('')}</div>`;
 if(state.page==='research')return `<div class="feature-strip"><div class="feature-icon">${icon('leaf')}</div><div><div class="eyebrow">UPCOMING FIELD PROGRAMME</div><h2>Sustainable pond management</h2><p>22 September - Muzaffargarh hub - 40 registered farmers</p></div>${button('View programme','training-detail','arrow')}</div>`;
 if(state.page==='risks')return `<div class="risk-summary"><div>${icon('shield')}<strong>Focus this week</strong><span>Resolve water quality and construction schedule risks at Chakwal.</span></div>${button('Review mitigation plan','tab:Mitigation actions','arrow')}</div>`;
 if(state.page==='tasks')return actionTrackerVisual();
 return '';
}
function settings(){return `${heading('WORKSPACE PREFERENCES','Your working environment.','Presentation preferences and project workspace information.','')}<div class="settings-grid"><section class="panel">${sectionHead('Programme profile','Workspace information')}<div class="settings-content"><label>Programme name<input value="Establishment of Aqua Business Hubs" readonly/></label><label>Implementing region<input value="Punjab, Pakistan" readonly/></label><label>Financial year<select><option>2026â€“27</option><option>2025â€“26</option></select></label><label>Display currency<select><option>PKR Â- Pakistani rupee</option></select></label>${button('Preview preferences','preferences','eye','btn primary')}</div></section><section class="panel">${sectionHead('Presentation settings','Adjust your viewing experience')}<div class="settings-content">${[['compact','Compact tables','Use a denser view for project registers.'],['motion','Reduce motion','Minimize transitions while presenting.']].map(([id,l,d])=>`<label class="setting-toggle"><span><strong>${l}</strong><small>${d}</small></span><input type="checkbox" id="${id}" ${document.body.classList.contains(id)?'checked':''}/></label>`).join('')}<div class="info-callout">${icon('eye')}<p>This workspace uses illustrative records. Preferences apply only to the current browser session.</p></div></div></section></div>`;}

function openOverlay(title,subtitle,content,type='drawer',foot=''){
 lastFocus=document.activeElement;
 overlay.innerHTML=`<div class="overlay-backdrop" data-action="close"></div><section class="overlay ${type}" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><header class="overlay-header"><div><div class="eyebrow">AQUA BUSINESS HUB</div><h2 id="dialog-title">${esc(title)}</h2>${subtitle?`<p>${esc(subtitle)}</p>`:''}</div><button class="icon-btn" data-action="close" aria-label="Close dialog">${icon('close')}</button></header><div class="overlay-body">${content}</div>${foot?`<footer class="overlay-footer">${foot}</footer>`:''}</section>`;
 document.body.classList.add('overlay-open');
 setTimeout(()=>overlay.querySelector('input,button,select')?.focus(),20);
}
function closeOverlay(){overlay.innerHTML='';document.body.classList.remove('overlay-open');lastFocus?.focus();}
function toast(message){const el=document.querySelector('#toast');el.innerHTML=icon('circlecheck')+esc(message);el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),3800);}
function detail(title,fields,status='In review',kind='record'){
 state.detailTab='Overview';
 const content=`<div class="detail-status">${badge(status)}<span>Updated 14 September 2026</span></div><div class="detail-tabs" role="tablist">${['Overview','Documents','Activity'].map((t,i)=>`<button role="tab" aria-selected="${i===0}" data-action="detail-tab:${t}" class="${i===0?'selected':''}">${t}</button>`).join('')}</div><div id="detail-pane">${detailOverview(fields,kind)}</div>`;
 openOverlay(title,'Project record Â- September 2026',content,'drawer',button('Close','close')+button(kind==='approval'?'Preview review stage':'View linked records','linked:'+kind,'arrow','btn primary'));
 overlay.dataset.fields=JSON.stringify(fields);overlay.dataset.kind=kind;
}
function detailOverview(fields,kind){return `<dl class="detail-fields">${fields.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>${kind==='batch'?`<h3 class="detail-section-title">Batch traceability</h3><div class="vertical-steps">${[['Egg collection','12 Aug Â- 280,000 eggs'],['Hatchlings','16 Aug Â- 264,000 hatchlings'],['Nursery transfer','25 Aug Â- Nursery N-04'],['Fingerling stage','15 Sep Â- 240,000 stock']].map(([t,d])=>`<div>${icon('circlecheck')}<span><strong>${t}</strong><small>${d}</small></span></div>`).join('')}</div>`:`<h3 class="detail-section-title">Project context</h3><p class="detail-copy">Part of the Aqua Business Hub development programme. Supporting records are available in the document centre for project review.</p>`}<div class="related-card">${icon('file')}<span><strong>Supporting project record</strong><small>Latest edition Â- PDF Â- 2.4 MB</small></span><button class="icon-btn" data-action="document-preview" aria-label="Preview supporting document">${icon('eye')}</button></div>`;}
function createForm(mode='default'){
 const c=configs[state.page];const action=c?.action||'New project record';
 const financeBaseline=state.page==='finance'&&mode==='baseline';
 const financeUtilization=state.page==='finance'&&mode==='utilization';
 const title=financeBaseline?'Update budget baseline':financeUtilization?'Add fund utilization':action;
 const fields=financeBaseline?['Budget reference','Approved PC-I / FY allocation','Amount (PKR)']:state.page==='people'?['Full name','Designation','Department']:state.page==='aquaculture'?['Batch reference','Observation type','Reading / observation']:state.page==='finance'?['Payment reference','Beneficiary','Amount (PKR)']:state.page==='documents'?['Document title','Document reference','Collection']:state.page==='research'?['Programme title','Trainer / lead','Expected participants']:state.page==='tasks'?['Task title','Assigned to','Due date']:state.page==='risks'?['Risk title','Risk owner','Severity']:['Record title','Reference number','Responsible officer'];
 openOverlay(title,'Prepare a record for the presentation.',`<form id="prototype-form"><div class="form-note">${icon('eye')} Preview a designed entry state using example information.</div>${fields.map((f,i)=>`<label class="form-field">${f}<input name="field${i}" placeholder="${['Enter '+f.toLowerCase(),'e.g. ABH-2026-042','Enter '+f.toLowerCase()][i]}" required ${f==='Amount (PKR)'?'type="number" min="0"':''}/></label>`).join('')}<div class="form-row"><label class="form-field">Project hub<select name="hub">${hubs.map(h=>`<option>${h.name}</option>`).join('')}</select></label><label class="form-field">Date<input name="date" type="date" value="2026-09-15" required/></label></div><label class="form-field">Notes<textarea name="notes" placeholder="Add context for the project team..." rows="3"></textarea></label>${state.page==='documents'?'<label class="upload-zone">'+icon('file')+'<strong>Select a supporting file</strong><span>Filename preview only</span><input type="file" id="file-preview" accept=".pdf,.docx,.xlsx,.png,.jpg"/><span id="file-name"></span></label>':''}<div class="form-actions">${button('Cancel','close')}<button class="btn primary" type="submit">Preview record ${icon('arrow')}</button></div></form>`,'modal');
}
function reportPreview(){openOverlay('Executive programme brief','September 2026 Â- Prepared for project leadership',`<div class="report-paper"><div class="report-brand">${icon('fish')} AQUA BUSINESS HUB <span>MONTHLY BRIEF / 09.26</span></div><h2>Programme performance<br/>at a glance.</h2><p>Establishment of Aqua Business Hubs Â- Punjab</p><div class="report-metrics"><div><strong>64.8%</strong>Physical progress</div><div><strong>342.6M</strong>PKR utilized</div><div><strong>28</strong>Active batches</div></div><h3>Management summary</h3><p>The programme continues across Muzaffargarh, Mianwali and Chakwal. Construction is progressing with priority attention on water intake works at Chakwal. Hatchery operations recorded 1.24 million fingerlings during the current season.</p><h3>Priorities for the next period</h3><ul><li>Complete hatchery roof slab inspections at Muzaffargarh.</li><li>Review the RAS filtration technical evaluation.</li><li>Monitor Pond C-03 water quality and aeration.</li></ul><div class="report-stamp">ILLUSTRATIVE PRESENTATION COPY</div></div>`,'modal wide',button('Close','close')+button('Print / save PDF','print','download','btn primary'));}

function registerPreview(){
 const c=configs[state.page];
 openOverlay(c.title+' Â- Register preview',state.hub+' Â- '+state.period,`<div class="report-paper"><div class="report-brand">${icon(c.stats[0][3])} AQUA BUSINESS HUB <span>REGISTER / 09.26</span></div><h2>${esc(registerTitle())}</h2><p>${esc(state.hub)} Â- September 2026 snapshot</p><div class="export-records">${currentRows.length?currentRows.map(r=>`<section><h3>${esc(r[0])}</h3><dl>${currentColumns.slice(1).map((col,i)=>`<div><dt>${esc(col)}</dt><dd>${esc(r[i+1])}</dd></div>`).join('')}</dl></section>`).join(''):'<p>No records match the selected filters.</p>'}</div><div class="report-stamp">ILLUSTRATIVE PRESENTATION COPY</div></div>`,'modal wide',button('Close','close')+button('Print / save PDF','print','download','btn primary'));
}
function documentPreview(title){
 const name=title||overlay.querySelector('#dialog-title')?.textContent||'Supporting project record';
 openOverlay('Document preview','Illustrative page Â- '+name,`<div class="report-paper"><div class="report-brand">${icon('file')} AQUA BUSINESS HUB <span>PROJECT RECORD</span></div><h2>${esc(name)}</h2><p>Document register Â- Reference ABH-DOC-2026 Â- Revision 01</p><h3>Record summary</h3><p>This designed document page represents the supporting information associated with the selected project record.</p><dl class="detail-fields"><div><dt>Programme</dt><dd>Establishment of Aqua Business Hubs</dd></div><div><dt>Recorded date</dt><dd>14 September 2026</dd></div><div><dt>Record owner</dt><dd>Project management office</dd></div><div><dt>Document category</dt><dd>Supporting project evidence</dd></div></dl><h3>Review notes</h3><p>Supporting schedules, technical observations and reference documents are listed with the originating record. This page is a visual preview; original document contents are not included in this prototype.</p><div class="report-stamp">ILLUSTRATIVE DOCUMENT PREVIEW</div></div>`,'modal wide',button('Close','close')+button('Print preview','print','download','btn primary'));
}

function handleAction(action){
 const [name,...parts]=action.split(':');const value=parts.join(':');
 if(name==='close'){closeOverlay();return;}
 if(name==='navigate'){closeOverlay();location.hash='/'+value;return;}
 if(name==='menu'){state.menu=!state.menu;shell();return;}
 if(name==='theme'){state.dark=!state.dark;document.body.classList.toggle('dark-mode',state.dark);localStorage.setItem('abh-theme',state.dark?'dark':'light');shell();return;}
 if(name==='tab'){if(!configs[state.page]?.tabs.includes(value)){location.hash='/aquaculture';state.tab=value;}else state.tab=value;state.query='';state.status='All statuses';shell();return;}
 if(name==='overview-tab'){state.overviewTab=value;shell();return;}
 if(name==='wbs-toggle'){expandedWbs.has(value)?expandedWbs.delete(value):expandedWbs.add(value);document.querySelector('#table-content').innerHTML=renderTable();return;}
 if(name==='record'){const row=currentRows[Number(value)];if(row)detail(row[0],currentColumns.map((k,i)=>[k,row[i]]),row.at(-1),state.page==='aquaculture'?'batch':state.page==='approvals'?'approval':state.page==='documents'?'document':'record');return;}
 if(name==='create'){createForm();return;}
 if(name==='finance-form'){createForm(value);return;}
 if(name==='export'){configs[state.page]&&state.page!=='reports'?registerPreview():reportPreview();return;}
 if(name==='document-preview'||name==='file-detail'){documentPreview(value);return;}
 if(name==='print'){window.print();return;}
 if(name==='detail-tab'){
  overlay.querySelectorAll('.detail-tabs button').forEach(b=>{const active=b.textContent===value;b.classList.toggle('selected',active);b.setAttribute('aria-selected',active);});
  const pane=overlay.querySelector('#detail-pane');
  pane.innerHTML=value==='Overview'?detailOverview(JSON.parse(overlay.dataset.fields),overlay.dataset.kind):value==='Documents'?`<h3 class="detail-section-title">Linked documents</h3>${['Supporting certificate.pdf','Technical schedule.pdf','Review notes.pdf'].map((f,i)=>`<button class="document-row" data-action="file-detail:${f}">${icon('file')}<span><strong>${f}</strong><small>Version ${i+1} Â- 14 Sep 2026 Â- PDF</small></span>${icon('eye')}</button>`).join('')}`:`<div class="vertical-steps">${[['Record updated','14 Sep 2026, 10:30 Â- Project team'],['Supporting document attached','13 Sep 2026, 14:15 Â- Documentation officer'],['Record created','12 Sep 2026, 09:00 Â- Responsible officer']].map(([t,s])=>`<div>${icon('circlecheck')}<span><strong>${t}</strong><small>${s}</small></span></div>`).join('')}</div>`;return;
 }
 if(name==='hub'){const h=hubs[Number(value)];detail(h.name+' Aqua Business Hub',[['Region',h.region],['Physical progress',h.progress+'%'],['Active production batches',h.batches],['Team members',h.staff],['Development allocation','PKR '+h.budget],['Site lead',h.name==='Muzaffargarh'?'Dr. Ayesha Malik':'Resident project team']],h.status);return;}
 if(name==='hubs'||name==='workspace'){openOverlay('Punjab programme','Three centres. One shared ambition.',`<div class="hub-directory">${hubs.map((h,i)=>`<button data-action="hub:${i}"><span class="directory-icon">${icon('building')}</span><div><h3>${h.name}</h3><p>${h.region} Â- ${h.staff} team members</p>${badge(h.status)}</div><strong>${h.progress}%</strong>${icon('chevron')}</button>`).join('')}</div>`,'modal');return;}
 if(name==='programme'){detail('Growing a sustainable blue economy',[['Programme','Establishment of Aqua Business Hubs'],['Region','Punjab, Pakistan'],['Approved PC-I','PKR 2.48 billion'],['Implementation period','July 2025 â€“ June 2028'],['Project hubs','Muzaffargarh, Mianwali, Chakwal'],['Focus','Hatcheries, research, farmer training & sustainable production']],'On track');return;}
 if(name==='risk-alert'){detail('Water quality Â- Pond C-03',[['Location','Chakwal Aqua Business Hub'],['Batch','BTH-024 Â- Grass carp'],['Dissolved oxygen','3.8 mg/L'],['Target range','5.0â€“8.0 mg/L'],['Recorded at','15 Sep 2026 Â- 08:45'],['Responsible officer','Dr. Ayesha Malik'],['Recorded mitigation','Increase aeration and repeat field sampling']],'Attention');return;}
 if(name==='approval-detail'){detail('IPC #08 Â- Hatchery civil works',[['Contractor','Punjab Infrastructure Ltd.'],['Certified amount','PKR 18.6M'],['Package','Muzaffargarh hatchery block'],['Submitted by','Hassan Raza'],['Reference','IPC-2026-008'],['Stage','Project Director review']],'In review','approval');return;}
 if(name==='delivery'){detail('Laboratory equipment delivery',[['Vendor','Scientific Supplies PK'],['Contract','PR-031'],['Value','PKR 18.4M'],['Expected delivery','20 Sep 2026'],['Destination','Chakwal laboratory']],'Delivery due');return;}
 if(name==='notifications'){openOverlay('Notifications','Three updates for your attention.',`<div class="notification-list">${[['risk-alert','alert','Pond C-03 water quality alert','Dissolved oxygen reading needs review.','15 min ago'],['approval-detail','file','IPC #08 submitted for review','Hatchery civil works Â- PKR 18.6M','1 hour ago'],['delivery','box','Upcoming laboratory delivery','Delivery due on 20 September.','2 hours ago']].map(([a,ic,t,d,time])=>`<button data-action="${a}"><span class="attention-icon amber">${icon(ic)}</span><div><strong>${t}</strong><p>${d}</p><small>${time}</small></div>${icon('chevron')}</button>`).join('')}</div>`);return;}
 if(name==='profile'||name==='self-service'){detail(name==='profile'?'Ahmed Kamal':'Employee self-service',[['Designation','Project Director'],['Employee code','ABH-001'],['Location','Project management office'],['Department','Programme leadership'],['Attendance today','Present Â- 08:42'],['Annual leave balance','18 days']],'Present');return;}
 if(name==='person'){const r=configs.people.rows[Number(value)];detail(r[0],configs.people.columns.map((c,i)=>[c,r[i]]),r.at(-1));return;}
 if(name==='help'){openOverlay('A guided view of your programme','A presentation-ready frontend experience.',`<div class="guide-intro">${icon('globe')}<h3>Start with the big picture.</h3><p>Explore the executive overview, then follow a financial record, work package or fish production batch into its detail view.</p></div><div class="guide-links">${[['finance','wallet','Follow the funds','Explore allocations, payments and PC-I versions.'],['engineering','engineering','Visit the project sites','Review work packages, measurements and milestones.'],['aquaculture','fish','Trace a production batch','Explore lifecycle stages, feed and water quality.']].map(([id,ic,t,d])=>`<button data-action="navigate:${id}">${icon(ic)}<span><strong>${t}</strong><small>${d}</small></span>${icon('arrow')}</button>`).join('')}</div><div class="info-callout">${icon('eye')}<p>This is a UI/UX prototype. Records, charts and review stages are illustrative; no transactions or approvals are processed.</p></div>`,'modal');return;}
 if(name==='search'){openOverlay('Search your workspace','Find modules and illustrative project records.',`<label class="command-input">${icon('search')}<input id="global-query" placeholder="Try â€˜tilapiaâ€™, â€˜budgetâ€™ or â€˜hatcheryâ€™" autocomplete="off"/></label><div id="search-results">${searchResults('')}</div>`,'modal');setTimeout(()=>document.querySelector('#global-query')?.focus(),30);return;}
 if(name==='search-record'){const [page,index]=value.split('/');const c=configs[page],r=c.rows[+index];detail(r[0],c.columns.map((k,i)=>[k,r[i]]),r.at(-1),page==='aquaculture'?'batch':'record');return;}
 if(name==='advanced-filters'){openOverlay('Refine your view','Choose the location and record status.',`<form id="filter-form"><label class="form-field">Project hub<select name="hub">${['All project hubs',...hubs.map(h=>h.name)].map(h=>`<option ${h===state.hub?'selected':''}>${h}</option>`).join('')}</select></label><label class="form-field">Status<select name="status">${['All statuses',...new Set(getRecords().rows.map(r=>r.at(-1)))].map(s=>`<option ${s===state.status?'selected':''}>${s}</option>`).join('')}</select></label><label class="form-field">Record contains<input name="query" value="${esc(state.query)}" placeholder="Reference, name or department"/></label><div class="form-actions">${button('Reset filters','reset-filters')}<button type="submit" class="btn primary">Apply filters</button></div></form>`,'modal');return;}
 if(name==='reset-filters'){state.hub='All project hubs';state.status='All statuses';state.query='';closeOverlay();shell();return;}
 if(name==='water-log'){location.hash='/aquaculture';state.tab='Water quality';if(state.page==='aquaculture')shell();return;}
 if(name==='linked'){
  if(value==='approval'){openOverlay('Review stage preview','IPC-2026-008 Â- Designed workflow state',`<div class="vertical-steps">${[['Prepared','Engineer / QS Â- 12 September'],['Certified','Manager Engineering Â- 14 September'],['Director review','Current presentation stage'],['Finance verification','Subsequent stage']].map(([t,d])=>`<div>${icon('circlecheck')}<span><strong>${t}</strong><small>${d}</small></span></div>`).join('')}</div><div class="info-callout">${icon('eye')}<p>These are static review stages. No approval, payment or accounting action is performed.</p></div>`,'drawer',button('Close preview','close','check','btn primary'));}else{closeOverlay();location.hash='/documents';}return;
 }
 if(name==='stat'){const target=/cost|fund|balance|allocation|payroll|value/i.test(value)?'finance':/batch|survival|water|seed/i.test(value)?'aquaculture':/progress|work|IPC|observation/i.test(value)?'engineering':/team|position|present|member/i.test(value)?'people':state.page==='overview'?'reports':state.page;detail(value,[['Programme',state.hub],['Reporting period',state.period],['Snapshot date','15 September 2026'],['Source register',configs[target]?.title||'Management information'],['Data basis','Illustrative programme snapshot']],'Current');return;}
 if(name==='preferences'){toast('Preferences previewed for this session.');return;}
 if(name==='training-detail'){detail('Sustainable pond management',[['Date','22 September 2026 - 09:00-16:00'],['Location','Muzaffargarh training centre'],['Trainer','Dr. Ayesha Malik'],['Participants','40 registered farmers'],['Topics','Pond preparation, stocking, feeding and water quality']],'Scheduled');return;}
 if(name==='pipeline'){detail(value+' packages',[['Pipeline stage',value],['Financial year','2026â€“27'],['Lead department','Procurement & contracts'],['Next milestone','Committee review Â- 18 September'],['Sample package','PR-026 Â- RAS filtration systems']],value==='Completed'?'Completed':'In progress');return;}
 if(name==='lifecycle'){detail(value+' Â- Production lifecycle',[['Stage',value],['Season','2026'],['Species','Nile tilapia, Rohu, Grass carp, Silver carp'],['Lead','Dr. Ayesha Malik'],['Linked batch','BTH-026 Â- Nile tilapia']],'Healthy','batch');return;}
 if(name==='water'){detail(value+' monitoring',[['Location','Muzaffargarh Â- Pond A-04'],['Parameter',value],['Sample time','15 Sep 2026 Â- 08:30'],['Recorded by','Aquaculture field officer'],['Instrument','Calibrated multi-parameter meter']],'Optimal');return;}
 if(['activity','milestone','allocation','file-detail'].includes(name)){detail(value,[['Programme','Aqua Business Hub'],['Location',state.hub],['Reporting period','September 2026'],['Responsible team',name==='milestone'?'Engineering':name==='allocation'?'Finance':'Project management office'],['Reference','ABH-2026-042']],'Current');return;}
}
function searchResults(query){
 const q=query.trim().toLowerCase();const foundModules=modules.filter(m=>m.name.toLowerCase().includes(q));
 const records=q?Object.entries(configs).flatMap(([p,c])=>c.rows.map((r,i)=>({p,r,i}))).filter(x=>x.r.join(' ').toLowerCase().includes(q)).slice(0,8):[];
 return `${foundModules.length?'<div class="search-category">MODULES</div>':''}${foundModules.map(m=>`<button class="search-result" data-action="navigate:${m.id}">${icon(m.icon)}<span>${m.name}</span>${icon('arrow')}</button>`).join('')}${records.length?'<div class="search-category">PROJECT RECORDS</div>':''}${records.map(x=>`<button class="search-result" data-action="search-record:${x.p}/${x.i}">${icon('file')}<span>${esc(x.r[0])}<small>${configs[x.p].eyebrow}</small></span>${icon('arrow')}</button>`).join('')}${!foundModules.length&&!records.length?'<div class="empty-state">'+icon('search')+'<h3>No results found</h3><p>Try a module name, site or record reference.</p></div>':''}`;
}
document.addEventListener('click',e=>{const target=e.target.closest('[data-action]');if(target)handleAction(target.dataset.action);});
document.addEventListener('input',e=>{
 if(e.target.id==='table-search'){state.query=e.target.value;document.querySelector('#table-content').innerHTML=renderTable();}
 if(e.target.id==='global-query')document.querySelector('#search-results').innerHTML=searchResults(e.target.value);
});
document.addEventListener('change',e=>{
 if(e.target.id==='hub-filter'){state.hub=e.target.value;shell();}
 if(e.target.id==='period-filter'){state.period=e.target.value;shell();toast('Reporting context changed. Figures remain an illustrative September snapshot.');}
 if(e.target.id==='status-filter'){state.status=e.target.value;document.querySelector('#table-content').innerHTML=renderTable();}
 if(['compact','motion'].includes(e.target.id))document.body.classList.toggle(e.target.id,e.target.checked);
 if(e.target.id==='file-preview')document.querySelector('#file-name').textContent=e.target.files[0]?.name||'';
});
document.addEventListener('submit',e=>{
 e.preventDefault();
 if(e.target.id==='filter-form'){const f=new FormData(e.target);state.hub=f.get('hub');state.status=f.get('status');state.query=f.get('query');closeOverlay();shell();}
 if(e.target.id==='prototype-form'){const f=new FormData(e.target);const title=f.get('field0');openOverlay('Record preview','Your designed entry state is ready.',`<div class="success-preview">${icon('circlecheck')}<h3>${esc(title)}</h3><p>This preview demonstrates the completed form state.<br/>No record has been saved or submitted.</p></div><dl class="detail-fields"><div><dt>Reference / detail</dt><dd>${esc(f.get('field1'))}</dd></div><div><dt>Additional information</dt><dd>${esc(f.get('field2'))}</dd></div><div><dt>Project hub</dt><dd>${esc(f.get('hub'))}</dd></div><div><dt>Date</dt><dd>${esc(f.get('date'))}</dd></div><div><dt>Notes</dt><dd>${esc(f.get('notes')||'No notes added')}</dd></div></dl>`,'modal',button('Done','close','check','btn primary'));}
});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'){closeOverlay();state.menu=false;document.querySelector('.sidebar')?.classList.remove('mobile-open');document.querySelector('.nav-backdrop')?.remove();}
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();handleAction('search');}
 if((e.key==='Enter'||e.key===' ')&&e.target.matches('tr[data-action],.map-pin')){e.preventDefault();handleAction(e.target.dataset.action);}
 if(e.key==='Tab'&&overlay.innerHTML){const items=[...overlay.querySelectorAll('button,input,select,textarea,a[href],[tabindex="0"]')].filter(el=>!el.disabled);const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}
});
function route(){const p=location.hash.replace('#/','').split('/')[0]||'overview';const prior=state.page;state.page=configs[p]||p==='settings'||p==='overview'?p:'overview';if(prior!==state.page&&!(state.page==='aquaculture'&&['Water quality','Production batches'].includes(state.tab)))state.tab=configs[state.page]?.tabs[0]||'Overview';state.query='';state.status='All statuses';state.menu=false;closeOverlay();shell();window.scrollTo(0,0);}
window.addEventListener('hashchange',route);route();









