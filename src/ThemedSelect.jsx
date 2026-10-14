import React,{useEffect,useId,useRef,useState} from 'react';
import {ChevronDown,Check} from 'lucide-react';

export default function ThemedSelect({label,value,options,onChange,disabled=false}){
 const [open,setOpen]=useState(false),[index,setIndex]=useState(0);
 const root=useRef(null),trigger=useRef(null),id=useId();
 const selected=options.find(o=>o.value===value);
 useEffect(()=>{if(!open)return;const dismiss=e=>{if(!root.current?.contains(e.target))setOpen(false);};document.addEventListener('pointerdown',dismiss);return()=>document.removeEventListener('pointerdown',dismiss);},[open]);
 useEffect(()=>{if(open)root.current?.querySelector('[role=option][data-focused=true]')?.focus();},[open,index]);
 const close=()=>{setOpen(false);trigger.current?.focus();};
 return <div className="themed-select" ref={root} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setOpen(false);}} onKeyDown={e=>{
  if(e.key==='Escape'&&open){e.preventDefault();e.stopPropagation();close();}
  if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();setOpen(true);setIndex(i=>e.key==='Home'?0:e.key==='End'?options.length-1:(i+(e.key==='ArrowDown'?1:-1)+options.length)%options.length);}
 }}>
  <button ref={trigger} type="button" className="select-trigger" aria-label={label} aria-haspopup="listbox" aria-expanded={open} aria-controls={id} disabled={disabled} onClick={()=>{setIndex(Math.max(0,options.findIndex(o=>o.value===value)));setOpen(!open);}}>{selected?.icon}<span>{selected?.label||'Seleccionar'}</span><ChevronDown size={12}/></button>
  {open&&<div id={id} className="themed-options popover" role="listbox" aria-label={label}>{options.map((o,i)=><button type="button" key={o.value} role="option" aria-selected={o.value===value} data-focused={i===index} tabIndex={i===index?0:-1} onFocus={()=>setIndex(i)} onClick={()=>{onChange(o.value);close();}}>{o.icon}<span>{o.label}</span>{o.value===value&&<Check size={13}/>}</button>)}</div>}
 </div>;
}
