import DOMPurify from 'dompurify';
import {calculate} from '../shared/calculation.mjs';
import {parsePlot} from '../shared/plot.mjs';
import './science.css';
let mathPromise;
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function mathEngine(){
 if(!mathPromise)mathPromise=Promise.all([import('mathjax-full/js/mathjax.js'),import('mathjax-full/js/input/tex.js'),import('mathjax-full/js/output/svg.js'),import('mathjax-full/js/adaptors/liteAdaptor.js'),import('mathjax-full/js/handlers/html.js'),import('mathjax-full/js/input/tex/ams/AmsConfiguration.js'),import('mathjax-full/js/input/tex/mhchem/MhchemConfiguration.js'),import('mathjax-full/js/input/tex/cancel/CancelConfiguration.js'),import('mathjax-full/js/input/tex/boldsymbol/BoldsymbolConfiguration.js')]).then(([{mathjax},{TeX},{SVG},{liteAdaptor},{RegisterHTMLHandler}])=>{const adaptor=liteAdaptor();RegisterHTMLHandler(adaptor);return {adaptor,doc:mathjax.document('',{InputJax:new TeX({packages:['base','ams','mhchem','cancel','boldsymbol'],maxBuffer:12000,maxMacros:500}),OutputJax:new SVG({fontCache:'none'})})};});
 return mathPromise;
}
export async function mathSVG(source,display=true){
 if(source.length>12000)throw new Error('La fórmula supera 12.000 caracteres.');
 if(/\\(?:href|html|require|include|input|def|gdef|newcommand|renewcommand|write|read|csname)\b/.test(source))throw new Error('Esta instrucción no está disponible en las fórmulas.');
 const {doc,adaptor}=await mathEngine();const node=doc.convert(source,{display,em:16,ex:8,containerWidth:1000});const html=adaptor.outerHTML(node);
 if(html.includes('data-mjx-error'))throw new Error('Revisa la sintaxis LaTeX.');
 return DOMPurify.sanitize(html,{USE_PROFILES:{svg:true,svgFilters:true},FORBID_TAGS:['foreignObject','script','image','a'],FORBID_ATTR:['href','xlink:href']});
}
export function plotSVG(source,theme){
 const plot=parsePlot(source),W=760,left=64,right=22,bottom=48,iw=W-left-right;
 const measure=document.createElement('canvas').getContext('2d');measure.font='15px Segoe UI,Arial';
 const titleLines=[];let line='';
 for(const word of plot.title.split(/\s+/)){
  if(line&&measure.measureText(line+' '+word).width>iw){titleLines.push(line);line='';}
  for(const char of (line?' ':'')+word){if(measure.measureText(line+char).width>iw){titleLines.push(line);line='';}line+=char;}
 }
 if(line)titleLines.push(line);
 const top=38+Math.max(0,titleLines.length-1)*20,H=420+Math.max(0,titleLines.length-1)*20,ih=H-top-bottom;
 const color=theme==='light'?'#34343b':theme==='gruvbox'?'#ebdbb2':'#d5d5db',grid=theme==='light'?'#dedee5':theme==='gruvbox'?'#504945':'#33333b';
 const colors=theme==='gruvbox'?['#fabd2f','#8ec07c','#fb4934','#83a598','#d3869b','#b8bb26']:['#9b86ed','#50b9b0','#e9ac58','#ed7298','#65a6df','#82b668'];
 const px=x=>left+(x-plot.x[0])/(plot.x[1]-plot.x[0])*iw,py=y=>top+ih-(y-plot.y[0])/(plot.y[1]-plot.y[0])*ih;
 let svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(plot.title)}"><text class="plot-title" fill="${color}" font-size="15" font-family="Segoe UI,Arial">${titleLines.map((text,i)=>`<tspan x="${left}" y="${22+i*20}">${esc(text)}</tspan>`).join('')}</text>`;
 for(let i=0;i<=5;i++){const x=left+iw*i/5,y=top+ih*i/5;svg+=`<path d="M${x} ${top}V${top+ih}M${left} ${y}H${left+iw}" fill="none" stroke="${grid}"/><text x="${x}" y="${H-24}" text-anchor="middle" fill="${color}" font-size="11">${Number((plot.x[0]+(plot.x[1]-plot.x[0])*i/5).toPrecision(4))}</text><text x="${left-8}" y="${y+4}" text-anchor="end" fill="${color}" font-size="11">${Number((plot.y[1]-(plot.y[1]-plot.y[0])*i/5).toPrecision(4))}</text>`;}
 if(plot.x[0]<=0&&plot.x[1]>=0)svg+=`<path d="M${px(0)} ${top}V${top+ih}" stroke="${color}" opacity=".5"/>`;
 if(plot.y[0]<=0&&plot.y[1]>=0)svg+=`<path d="M${left} ${py(0)}H${left+iw}" stroke="${color}" opacity=".5"/>`;
 plot.curves.forEach((curve,index)=>{let d='',previous=null;for(let i=0;i<=600;i++){const x=plot.x[0]+(plot.x[1]-plot.x[0])*i/600,y=curve.fn(x);if(!Number.isFinite(y)||y<plot.y[0]||y>plot.y[1]){previous=null;continue;}const next=[px(x),py(y)];d+=(previous&&Math.abs(next[1]-previous[1])<ih/2?'L':'M')+next.map(v=>v.toFixed(2)).join(' ');previous=next;}svg+=`<path d="${d}" fill="none" stroke="${colors[index%colors.length]}" stroke-width="2.3"><title>${esc(curve.label)}</title></path>`;});
 for(const [x,y] of plot.points)if(x>=plot.x[0]&&x<=plot.x[1]&&y>=plot.y[0]&&y<=plot.y[1])svg+=`<circle cx="${px(x)}" cy="${py(y)}" r="4" fill="${colors[1]}" stroke="${color}" stroke-width=".7"><title>(${x}, ${y})</title></circle>`;
 svg+='</svg>';return {svg,plot};
}
export async function renderScience(container,theme='dark',isCurrent=()=>true){
 for(const host of container.querySelectorAll('.math-source,.plot-source,.calculate-source')){
  if(!isCurrent())return;const source=host.textContent,plot=host.classList.contains('plot-source'),inline=host.tagName==='SPAN';
  try{
   if(host.classList.contains('calculate-source')){
    const result=calculate(source),section=document.createElement('section');section.className='study-calculation';
    const format=value=>typeof value==='number'?Number(value.toPrecision(10)).toLocaleString('es-MX',{maximumSignificantDigits:10}):value;
    section.innerHTML='<h4>'+esc(result.title)+'</h4><table><thead><tr><th>Magnitud</th><th>Resultado</th></tr></thead><tbody>'+result.rows.map(([label,value])=>'<tr><td>'+esc(label)+'</td><td>'+esc(format(value))+'</td></tr>').join('')+'</tbody></table><p>'+esc(result.note)+'</p><details><summary>Ver cálculo</summary><pre class="code-block"><code class="code-source">'+esc(source)+'</code></pre></details>';
    if(isCurrent())host.replaceWith(section);continue;
   }
   let html,description='';if(plot){const result=plotSVG(source,theme);html=result.svg;description=result.plot.curves.map(c=>c.label).join(' · ')+(result.plot.fit?` · R² = ${result.plot.fit.r2.toFixed(5)}`:'');}else html=await mathSVG(source,!inline);
   if(!isCurrent())return;const figure=document.createElement(inline?'span':'figure');figure.className=plot?'science-figure plot-figure':inline?'math-inline':'science-figure math-figure';figure.setAttribute('aria-label',plot?'Gráfico matemático':'Fórmula LaTeX');figure.innerHTML=html;figure.tintaSource=source;
   if(!plot){const svg=figure.querySelector('svg');if(svg)svg.style.setProperty('--math-width',svg.getAttribute('width')||'auto');}
   if(description){const caption=document.createElement('figcaption');caption.textContent=description;figure.append(caption);}host.replaceWith(figure);
  }catch(e){if(!isCurrent())return;host.classList.add('science-error');host.setAttribute('title',e.message);const message=document.createElement('small');message.className='science-error-message';message.textContent=e.message;host.after(message);}
 }
}
