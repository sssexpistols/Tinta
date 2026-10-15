import './previewControls.css';
const glyph=path=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}"/></svg>`;
const icons={copy:glyph('M9 9h12v12H9z M5 15H3V3h12v2'),source:glyph('m8 8-4 4 4 4 m8-8 4 4-4 4 M14 4l-4 16'),plus:glyph('M12 5v14 M5 12h14'),minus:glyph('M5 12h14'),reset:glyph('M3 3v6h6 M3 9a9 9 0 1 1 0 7'),expand:glyph('M8 3H3v5 M16 3h5v5 M3 16v5h5 M21 16v5h-5'),close:glyph('m6 6 12 12 M18 6 6 18')};
function button(label,icon,action){const b=document.createElement('button');b.type='button';b.className='preview-control';b.title=label;b.setAttribute('aria-label',label);b.innerHTML=icons[icon];b.addEventListener('click',async e=>{e.preventDefault();e.stopPropagation();await action(b);});return b;}
async function feedback(button,job){button.disabled=true;try{await job();button.dataset.feedback='success';button.textContent='✓';button.setAttribute('aria-label','Copiado');}catch{button.dataset.feedback='error';button.textContent='!';button.setAttribute('aria-label','No se pudo copiar');}finally{button.disabled=false;setTimeout(()=>{if(button.isConnected){button.innerHTML=button.dataset.icon;button.setAttribute('aria-label',button.title);delete button.dataset.feedback;}},1600);}}
function copyButton(label,icon,job){const b=button(label,icon,b=>feedback(b,job));b.dataset.icon=icons[icon];return b;}
const copyText=text=>window.tinta?.copyText?window.tinta.copyText(text):navigator.clipboard.writeText(text);
async function copyDiagram(svg){
 const clone=svg.cloneNode(true),box=svg.viewBox.baseVal,width=box.width||800,height=box.height||600;
 const scale=Math.min(2,4096/Math.max(width,height));clone.setAttribute('xmlns','http://www.w3.org/2000/svg');clone.setAttribute('width',String(width*scale));clone.setAttribute('height',String(height*scale));clone.removeAttribute('style');
 clone.style.setProperty('background','transparent','important');
 const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)],{type:'image/svg+xml;charset=utf-8'}));
 try{const image=new Image();image.src=url;await image.decode();const canvas=document.createElement('canvas');canvas.width=Math.ceil(width*scale);canvas.height=Math.ceil(height*scale);const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0,canvas.width,canvas.height);await window.tinta.copyImage(canvas.toDataURL('image/png'));}finally{URL.revokeObjectURL(url);}
}
function attachDiagram(figure,source,expand){
 const svg=figure.querySelector('svg');if(!svg)return;
 figure.classList.add('interactive-diagram');const viewport=document.createElement('div');viewport.className='diagram-viewport';viewport.tabIndex=0;viewport.setAttribute('aria-label','Diagrama: arrastra para mover; + y − para zoom; 0 para restablecer');const box=svg.viewBox.baseVal;viewport.style.aspectRatio=`${box.width||800} / ${box.height||600}`;svg.before(viewport);viewport.append(svg);
 let zoom=1,x=0,y=0,drag=null;const controls=document.createElement('div');controls.className='diagram-navigation';const counter=document.createElement('output');counter.setAttribute('aria-label','Nivel de zoom');
 const paint=()=>{svg.style.transform=`translate(${x}px, ${y}px) scale(${zoom})`;counter.textContent=Math.round(zoom*100)+'%';};
 const change=factor=>{zoom=Math.min(4,Math.max(.25,zoom*factor));paint();};const reset=()=>{zoom=1;x=y=0;paint();};
 controls.append(button('Acercar diagrama','plus',()=>change(1.25)),button('Restablecer diagrama','reset',reset),button('Alejar diagrama','minus',()=>change(.8)),counter);
 if(expand)controls.append(button('Ampliar diagrama','expand',()=>expand(svg,source)));
 const copy=document.createElement('div');copy.className='diagram-copy';copy.append(copyButton('Copiar Mermaid','source',()=>copyText(source)),copyButton('Copiar imagen del diagrama','copy',()=>copyDiagram(svg)));
 figure.append(copy,controls);paint();
 viewport.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,startX:x,startY:y};viewport.setPointerCapture(e.pointerId);viewport.classList.add('is-dragging');});
 viewport.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;x=drag.startX+e.clientX-drag.x;y=drag.startY+e.clientY-drag.y;paint();});
 const end=()=>{drag=null;viewport.classList.remove('is-dragging');};viewport.addEventListener('pointerup',end);viewport.addEventListener('pointercancel',end);viewport.addEventListener('dblclick',reset);
 viewport.addEventListener('wheel',e=>{if(!e.ctrlKey)return;e.preventDefault();change(e.deltaY<0?1.1:1/1.1);},{passive:false});
 viewport.addEventListener('keydown',e=>{if(e.ctrlKey||e.altKey||e.metaKey)return;if(['+','=','-','0','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();e.stopPropagation();if(e.key==='+'||e.key==='=')change(1.25);else if(e.key==='-')change(.8);else if(e.key==='0')reset();else{x+=e.key==='ArrowLeft'?20:e.key==='ArrowRight'?-20:0;y+=e.key==='ArrowUp'?20:e.key==='ArrowDown'?-20:0;paint();}}});
}
export function installPreviewControls(article,isCurrent){
 let dialog=null;
 function expand(svg,source){
  if(dialog)return;const previous=document.activeElement;dialog=document.createElement('dialog');dialog.className='diagram-dialog';dialog.dataset.previewDialog='true';dialog.setAttribute('aria-label','Diagrama ampliado');
  const heading=document.createElement('div');heading.className='diagram-dialog-heading';const title=document.createElement('strong');title.textContent='Diagrama';
  const close=()=>{if(!dialog||dialog.classList.contains('is-closing'))return;const target=dialog;target.classList.add('is-closing');setTimeout(()=>{target.close();target.remove();if(dialog===target)dialog=null;previous?.isConnected&&previous.focus();},matchMedia('(prefers-reduced-motion:reduce)').matches?0:160);};
  heading.append(title,button('Cerrar diagrama ampliado','close',close));const figure=document.createElement('figure');figure.className='mermaid-diagram';const clone=svg.cloneNode(true);clone.style.transform='';figure.append(clone);dialog.append(heading,figure);document.body.append(dialog);attachDiagram(figure,source);dialog.addEventListener('cancel',e=>{e.preventDefault();close();});dialog.addEventListener('click',e=>{if(e.target===dialog)close();});dialog.showModal();
 }
 for(const pre of article.querySelectorAll('pre.code-block')){const code=pre.querySelector('code');if(!code)continue;const parts=[...code.querySelectorAll('.code-source')];const source=parts.length?parts.map(part=>part.textContent).join('\n'):code.textContent;pre.classList.add('interactive-code');pre.append(copyButton('Copiar código','copy',()=>copyText(source)));}
 // Mermaid keeps the source outside SVG so copying never includes UI or line numbers.
 for(const figure of article.querySelectorAll('.mermaid-diagram'))if(isCurrent())attachDiagram(figure,figure.tintaSource||'',expand);
 return ()=>{if(dialog){dialog.close();dialog.remove();dialog=null;}};
}
