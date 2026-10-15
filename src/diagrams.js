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
  mermaid.initialize({startOnLoad:false,securityLevel:'strict',theme:'base',themeVariables:palettes[theme]||palettes.dark,htmlLabels:false,flowchart:{htmlLabels:false,useMaxWidth:true},maxTextSize:30000,maxEdges:300,suppressErrorRendering:true});
  const {svg}=await mermaid.render('tinta-diagram-'+(++serial),source);
  const clean=DOMPurify.sanitize(svg,{USE_PROFILES:{svg:true,svgFilters:true},FORBID_TAGS:['foreignObject','script','image','a'],FORBID_ATTR:['href','xlink:href']});
  if(cache.size>=60)cache.delete(cache.keys().next().value);cache.set(key,clean);return clean;
 });queue=task;return task;
}
export async function renderDiagrams(container,theme,isCurrent=()=>true){
 for(const host of container.querySelectorAll('.mermaid-source')){
  if(!isCurrent())return;
  const source=host.textContent;
  try{const svg=await renderDiagram(source,theme);if(!isCurrent())return;const figure=document.createElement('figure');figure.className='mermaid-diagram';figure.setAttribute('aria-label','Diagrama Mermaid');figure.innerHTML=svg;host.replaceWith(figure);}
  catch(e){if(!isCurrent())return;const error=document.createElement('div');error.className='diagram-error';error.setAttribute('role','status');error.textContent='No se pudo dibujar Mermaid. Revisa la sintaxis. '+(source.length>30000?'El bloque supera 30.000 caracteres.':'');host.before(error);host.classList.add('mermaid-invalid');}
 }
}
