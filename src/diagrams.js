import DOMPurify from 'dompurify';
let enginePromise,queue=Promise.resolve(),serial=0;
const cache=new Map();
const palettes={dark:{background:'#141416',primaryColor:'#292238',primaryTextColor:'#d5d5db',primaryBorderColor:'#8d75d4',lineColor:'#b8a455',secondaryColor:'#242428',tertiaryColor:'#1b1b1f'},light:{background:'#f8f8fa',primaryColor:'#ede8fa',primaryTextColor:'#292932',primaryBorderColor:'#7160d3',lineColor:'#7355ac',secondaryColor:'#f0edf8',tertiaryColor:'#ffffff'},gruvbox:{background:'#1d2021',primaryColor:'#3c3836',primaryTextColor:'#ebdbb2',primaryBorderColor:'#d79921',lineColor:'#fabd2f',secondaryColor:'#504945',tertiaryColor:'#282828'}};
export function renderDiagram(source,theme='dark'){
 const key=theme+'\0'+source;if(cache.has(key))return Promise.resolve(cache.get(key));
 const task=queue.catch(()=>{}).then(async()=>{
  if(source.length>30000)throw new Error('Diagrama demasiado grande (máximo 30.000 caracteres).');
  // Config comes from the app, never from a note's init directive/front matter.
  if(/%%\s*\{/.test(source)||/^\s*---/.test(source))throw new Error('Usa el tema de Tinta; las directivas de configuración no están habilitadas.');
  const {default:mermaid}=await(enginePromise||=(import('mermaid')));
  // Measure and display with the SAME font; changing fonts after layout clips labels.
  await document.fonts.ready;
  const fontFamily='Segoe UI, Arial, sans-serif';
  mermaid.initialize({startOnLoad:false,securityLevel:'strict',theme:'base',fontFamily,fontSize:16,themeVariables:{...(palettes[theme]||palettes.dark),fontFamily,fontSize:'16px'},htmlLabels:false,markdownAutoWrap:true,wrap:true,
   flowchart:{htmlLabels:false,useMaxWidth:true,wrappingWidth:220,padding:18,diagramPadding:16},
   sequence:{wrap:true,wrapPadding:16,width:200,actorFontFamily:fontFamily,noteFontFamily:fontFamily,messageFontFamily:fontFamily},
   state:{htmlLabels:false,wrappingWidth:220,padding:16,diagramPadding:16},
   class:{htmlLabels:false,padding:16,diagramPadding:16},
   c4:{wrap:true,wrapPadding:16},
   maxTextSize:30000,maxEdges:300,suppressErrorRendering:true});
  const {svg}=await mermaid.render('tinta-diagram-'+(++serial),source);
  const clean=fitDiagramBounds(DOMPurify.sanitize(svg,{USE_PROFILES:{svg:true,svgFilters:true},FORBID_TAGS:['foreignObject','script','image','a'],FORBID_ATTR:['href','xlink:href']}));
  if(cache.size>=60)cache.delete(cache.keys().next().value);cache.set(key,clean);return clean;
 });queue=task;return task;
}
// Some Mermaid renderers omit long captions/legends from their viewBox. Measure
// the sanitized SVG offscreen, with its own styles, and retain all drawn content.
function fitDiagramBounds(markup){
 const host=document.createElement('div');host.style.cssText='position:fixed;left:-100000px;top:0;visibility:hidden;pointer-events:none';host.innerHTML=markup;document.body.append(host);
 try{
  const svg=host.querySelector('svg');if(!svg)return markup;
  const box=svg.viewBox.baseVal,bounds=svg.getBBox(),pad=16;
  const x=Math.min(box.x,bounds.x-pad),y=Math.min(box.y,bounds.y-pad);
  const right=Math.max(box.x+box.width,bounds.x+bounds.width+pad),bottom=Math.max(box.y+box.height,bounds.y+bounds.height+pad);
  if([x,y,right,bottom].every(Number.isFinite)&&right>x&&bottom>y){
   svg.setAttribute('viewBox',`${x} ${y} ${right-x} ${bottom-y}`);
   svg.setAttribute('preserveAspectRatio','xMidYMid meet');
   svg.style.maxWidth=`${right-x}px`;
  }
  return svg.outerHTML;
 }finally{host.remove();}
}
export async function renderDiagrams(container,theme,isCurrent=()=>true){
 for(const host of container.querySelectorAll('.mermaid-source')){
  if(!isCurrent())return;
  const source=host.textContent;
  try{const svg=await renderDiagram(source,theme);if(!isCurrent())return;const figure=document.createElement('figure');figure.className='mermaid-diagram';figure.setAttribute('aria-label','Diagrama Mermaid');figure.innerHTML=svg;figure.tintaSource=source;host.replaceWith(figure);}
  catch(e){if(!isCurrent())return;const error=document.createElement('div');error.className='diagram-error';error.setAttribute('role','status');error.textContent='No se pudo dibujar Mermaid. Revisa la sintaxis. '+(source.length>30000?'El bloque supera 30.000 caracteres.':'');host.before(error);host.classList.add('mermaid-invalid');}
 }
}
