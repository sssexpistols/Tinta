import React,{useState} from 'react';
import {LayoutTemplate,ArrowRight} from 'lucide-react';
import {templateCategories,templateCategory} from './templateCatalog.js';
export default function TemplatePicker({templates,onUse,target}){
 const [category,setCategory]=useState('Todas'),[query,setQuery]=useState('');
 const shown=templates.filter(t=>(category==='Todas'||templateCategory(t)===category)&&`${t.title} ${t.description||''}`.toLowerCase().includes(query.toLowerCase()));
 return <><h2>Empieza con una estructura</h2><p className="modal-description">{target?'Aplicar a esta nota vacía.':'Crear una nota desde una plantilla.'} Completa los campos entre corchetes.</p><input autoFocus className="modal-input" aria-label="Buscar plantilla" placeholder="Buscar plantilla…" value={query} onChange={e=>setQuery(e.target.value)}/><div className="template-categories" aria-label="Categorías de plantillas">{templateCategories.map(c=><button key={c} aria-pressed={c===category} onClick={()=>setCategory(c)}>{c}</button>)}</div><div className="template-list">{shown.map(t=><button key={t.id} onClick={()=>onUse(t)}><LayoutTemplate size={20}/><span><b>{t.title}</b><small>{templateCategory(t)} · {t.description||'Tu plantilla personal'}</small></span><ArrowRight size={15}/></button>)}{!shown.length&&<p className="modal-description">No hay plantillas en esta búsqueda.</p>}</div></>;
}
