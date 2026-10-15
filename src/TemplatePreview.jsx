import React, {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {renderMarkdown} from './MarkdownPreview.jsx';
import {renderDiagrams} from './diagrams.js';
import {templateCategory} from './templateCatalog.js';
import './templatePreview.css';

function Preview({item, anchor, theme, keep, close, hide}) {
  const ref=useRef(), [point,setPoint]=useState({left:-1000,top:0});
  const html=useMemo(()=>renderMarkdown(item.body,[]),[item.body]);
  useLayoutEffect(()=>{
    const box=ref.current.getBoundingClientRect();
    const left=anchor.right+8+box.width<innerWidth?anchor.right+8:anchor.left-box.width-8;
    setPoint({left:Math.max(8,Math.min(left,innerWidth-box.width-8)),top:Math.max(8,Math.min(anchor.top,innerHeight-box.height-8))});
  },[anchor]);
  useEffect(()=>{
    let alive=true;const article=ref.current.querySelector('article');article.innerHTML=html;
    article.querySelectorAll('input').forEach(input=>input.disabled=true);
    article.querySelectorAll('a').forEach(a=>{a.removeAttribute('href');a.removeAttribute('tabindex');});
    void renderDiagrams(article,theme,()=>alive);
    return()=>{alive=false;};
  },[html,theme]);
  return createPortal(<section ref={ref} className="template-hover-preview" style={point} role="region" aria-label={'Vista previa de plantilla: '+item.title} onMouseEnter={keep} onMouseLeave={close} onFocus={keep} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))close();}}>
    <header><div><small>{templateCategory(item)}</small><strong>{item.title}</strong></div><button aria-label="Cerrar vista previa de plantilla" onClick={hide}>×</button></header>
    <p>{item.description||'Tu estructura personal'}</p>
    <div className="template-preview-scroll" tabIndex={0} aria-label="Contenido de la plantilla"><article className="markdown-body" dangerouslySetInnerHTML={{__html:html}}/></div>
    <footer>Vista previa · Selecciona la plantilla para abrirla.</footer>
  </section>,document.body);
}

export function useTemplatePreview(theme, scope) {
  const [preview,setPreview]=useState(null),openTimer=useRef(),closeTimer=useRef();
  const clear=()=>{clearTimeout(openTimer.current);clearTimeout(closeTimer.current);};
  const hide=()=>{clear();setPreview(null);};
  const close=()=>{clear();closeTimer.current=setTimeout(()=>setPreview(null),180);};
  useEffect(()=>{hide();},[scope]);
  useEffect(()=>{
    const escape=e=>{if(e.key==='Escape')hide();};
    const outside=e=>{if(!e.target.closest('.template-hover-preview'))hide();};
    // Scrolling a card into view may finish after pointerenter. Close an open
    // preview, but let the pending hover measure its final anchor position.
    const scroll=e=>{if(!e.target.closest?.('.template-hover-preview'))setPreview(null);};
    document.addEventListener('keydown',escape,true);document.addEventListener('pointerdown',outside,true);
    window.addEventListener('resize',hide);document.addEventListener('scroll',scroll,true);
    return()=>{clear();document.removeEventListener('keydown',escape,true);document.removeEventListener('pointerdown',outside,true);window.removeEventListener('resize',hide);document.removeEventListener('scroll',scroll,true);};
  },[]);
  function show(item,target,delay){
    clear();
    openTimer.current=setTimeout(()=>{if(!target.isConnected)return;const rect=target.getBoundingClientRect();setPreview({item,anchor:{left:rect.left,right:rect.right,top:rect.top}});},delay);
  }
  return {
    handlers:item=>item?{onMouseEnter:e=>show(item,e.currentTarget,400),onMouseLeave:close,onFocus:e=>show(item,e.currentTarget,400),onBlur:e=>{if(!e.relatedTarget?.closest('.template-hover-preview'))close();}}:{},
    hide,
    preview:preview?<Preview {...preview} theme={theme} keep={clear} close={close} hide={hide}/>:null,
  };
}
