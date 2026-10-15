import React,{useEffect,useRef,useState} from 'react';
// Keep the last rendered dialog long enough to animate its exit.
export default function Presence({children}){
 const last=useRef(children),[shown,setShown]=useState(!!children);
 if(children)last.current=children;
 useEffect(()=>{if(children){setShown(true);return;}const timer=setTimeout(()=>setShown(false),matchMedia('(prefers-reduced-motion: reduce)').matches?0:170);return()=>clearTimeout(timer);},[!!children]);
 return children||shown?<div className={`presence ${children?'is-open':'is-closing'}`} aria-hidden={!children} inert={!children?true:undefined}>{children||last.current}</div>:null;
}
