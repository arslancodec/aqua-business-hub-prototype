import {icon} from './icons.js';
export const esc = v => String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const button = (label,action,ico='',cls='btn') => `<button class="${cls}" data-action="${esc(action)}">${ico?icon(ico):''}${esc(label)}</button>`;
export function badge(value) {
 const tone=/attention|low release|due|medium|low stock|review|evaluation/i.test(value)?'amber':/high|overdue/i.test(value)?'red':/draft|archived|leave|planned|restricted/i.test(value)?'neutral':'green';
 return `<span class="badge ${tone}"><i></i>${esc(value)}</span>`;
}
export function statCard(label,value,note,ico='chart',index=0) {
 return `<button class="stat-card" data-action="stat:${esc(label)}"><div class="stat-label">${esc(label)}<span class="stat-icon tint-${index%4}">${icon(ico)}</span></div><div class="stat-value">${String(value).replace('PKR ','<small>PKR</small> ')}</div><div class="stat-note">${String(note).startsWith('+')?'<span class="positive">'+icon('up')+esc(note)+'</span>':esc(note)}<span class="stat-arrow">${icon('up')}</span></div></button>`;
}
export function lineChart(mode='finance') {
 const eng=mode==='engineering', aqua=mode==='aqua';
 const a=eng?'M50 178C100 168 110 168 150 150S215 138 250 116 310 104 350 80 410 70 450 45 515 36 550 20':aqua?'M50 90C90 95 110 65 150 72S210 98 250 65 315 45 350 56 410 25 450 40 510 20 550 28':'M50 181C90 176 110 177 150 160S212 153 250 128 313 114 350 95 410 86 450 58 510 49 550 27';
 const b=eng?'M50 188C95 185 120 180 150 166S215 149 250 143 310 124 350 108 410 97 450 76 510 67 550 57':aqua?'M50 126C90 124 110 108 150 114S210 127 250 104 313 108 350 89 410 99 450 81 510 85 550 70':'M50 188C100 185 118 186 150 180S220 174 250 157 313 153 350 132 410 132 450 108 515 99 550 78';
 const aria=eng?'Planned and actual construction progress':aqua?'Illustrative survival trend for tilapia and carp':'Cumulative funds released and utilized, July to December';
 return `<svg class="line-chart" viewBox="0 0 590 230" role="img" aria-label="${aria}"><defs><linearGradient id="chart-fill-${mode}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0077b6" stop-opacity=".34"/><stop offset="58%" stop-color="#00b4d8" stop-opacity=".20"/><stop offset="100%" stop-color="#0077b6" stop-opacity=".04"/></linearGradient></defs>${[30,70,110,150,190].map((y,i)=>`<line x1="48" y1="${y}" x2="565" y2="${y}" stroke="#e8ece9" stroke-dasharray="3 4"/><text x="0" y="${y+4}">${aqua?[100,95,90,85,80][i]+'%':eng?[100,75,50,25,0][i]+'%':[600,450,300,150,0][i]}</text>`).join('')}<path d="${a}L550 195H50Z" fill="url(#chart-fill-${mode})"/><path d="${a}" fill="none" stroke="#237c6c" stroke-width="3"/><path d="${b}" fill="none" stroke="#b4bf7d" stroke-width="2.5" ${eng?'stroke-dasharray="5 5"':''}/>${['Jul','Aug','Sep','Oct','Nov','Dec'].map((m,i)=>`<text x="${50+i*100}" y="223" text-anchor="middle">${m}</text>`).join('')}<circle cx="250" cy="${aqua?65:eng?116:128}" r="5" fill="#237c6c" stroke="white" stroke-width="3"/></svg>`;
}
export function table(columns,rows,detailPrefix='record') {
 const splitLabel = value => String(value).split(/\s+-\s+/);
 return `<div class="table-scroll"><table><thead><tr>${columns.map(c=>`<th scope="col">${esc(c)}</th>`).join('')}<th scope="col"><span class="sr-only">Details</span></th></tr></thead><tbody>${rows.length?rows.map((row,i)=>`<tr data-action="${detailPrefix}:${i}" tabindex="0" aria-label="View ${esc(row[0])}">${row.map((c,j)=>{const parts=splitLabel(c);return `<td>${j===0?`<button class="record-link" data-action="${detailPrefix}:${i}">${esc(parts[0])}${parts.length>1?`<span>${esc(parts.slice(1).join(' - '))}</span>`:''}</button>`:j===row.length-1?badge(c):String(c).includes('%')&&!String(c).includes('/')?`<div class="inline-progress"><span>${esc(c)}</span><div><i style="width:${parseFloat(c)||0}%"></i></div></div>`:esc(c)}</td>`}).join('')}<td>${icon('chevron')}</td></tr>`).join(''):`<tr><td colspan="${columns.length+1}" class="empty-state">${icon('search')}<h3>No matching records</h3><p>Try another name or clear the current filters.</p></td></tr>`}</tbody></table></div>`;
}
export function sectionHead(title,subtitle='',link='',action='') {
 return `<div class="section-head"><div><h2>${title}</h2>${subtitle?`<p>${subtitle}</p>`:''}</div>${link?button(link,action,'arrow','text-btn'):''}</div>`;
}
