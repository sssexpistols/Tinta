import React from 'react';
import {ArrowDownLeft,ChevronDown,Link2,FileText} from 'lucide-react';
import {getBacklinks} from './wiki.js';
export default function Backlinks({note,notes,onNavigate}){
 const linked=getBacklinks(note,notes);
 if(!linked.length)return null;
 return <details className="backlinks" open><summary><ChevronDown size={12}/><Link2 size={12}/><span>ENLAZADAS A ESTA NOTA</span><small>{linked.length}</small></summary><div className="backlink-list">{linked.map(source=><button className="backlink" key={source.id} onClick={()=>onNavigate(source.id)} title={`Abrir ${source.title}`}><ArrowDownLeft size={15}/><FileText size={13}/><span className="backlink-title">{source.title||'Sin título'}</span>{source.tags.slice(0,3).map(tag=><span className="tag-chip" key={tag}>{tag}</span>)}</button>)}</div></details>;
}
