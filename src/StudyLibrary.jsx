import React, {useState} from 'react';
import {studyResources} from './studyResources.js';
export default function StudyLibrary({onInsert}) {
 const [category,setCategory]=useState('Todas'),[query,setQuery]=useState('');
 const normalize=value=>value.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
 const items=studyResources.filter(item=>(category==='Todas'||item.category===category)&&normalize(item.title+' '+item.description).includes(normalize(query)));
 return <div className="study-library">
  <div className="modal-eyebrow">APUNTES Y CONOCIMIENTO</div><h2>Recursos para tus notas</h2>
  <p className="modal-description">Inserta un ejemplo editable en el cursor. Selecciona texto antes de abrir para reemplazarlo. Los cálculos son locales y las aproximaciones se indican.</p>
  <input className="study-library-search" autoFocus aria-label="Buscar recurso" placeholder="Matrices, química, citas, repaso…" value={query} onChange={e=>setQuery(e.target.value)}/>
  <div className="study-tabs">{['Todas',...new Set(studyResources.map(x=>x.category))].map(name=><button key={name} aria-pressed={category===name} onClick={()=>setCategory(name)}>{name}</button>)}</div>
  <div className="study-resource-list">{items.map(item=><section className="study-resource" key={item.id}><header><b>{item.title}</b><button className="secondary-button" aria-label={'Insertar '+item.title} onClick={()=>onInsert(item.body)}>Insertar</button></header><small>{item.description}</small><pre>{item.body}</pre></section>)}{!items.length&&<p>No hay recursos que coincidan con la búsqueda.</p>}</div>
 </div>;
}
