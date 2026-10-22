export const editorCommands=[
 ...[['underline','Subrayar','Ctrl+U'],['highlight','Resaltar','Ctrl+Shift+H'],['superscript','Superíndice','Ctrl+Alt+U'],['subscript','Subíndice','Ctrl+Alt+D'],['footnote','Nota al pie','Ctrl+Alt+N'],['bold','Negrita','Ctrl+B'],['italic','Cursiva','Ctrl+I'],['strike','Tachado','Ctrl+Shift+X'],['link','Insertar enlace','Ctrl+Shift+K'],['code','Código en línea','Ctrl+E'],['codeblock','Bloque de código','Ctrl+Shift+C'],['task','Lista de tareas','Ctrl+Alt+T'],['list','Lista con viñetas','Ctrl+Alt+L'],['ordered','Lista numerada','Ctrl+Alt+O'],['quote','Cita','Ctrl+Alt+Q'],['table','Insertar tabla','Ctrl+Alt+B'],['rule','Separador','Ctrl+Alt+R'],['find','Buscar en la nota','Ctrl+F'],['undo','Deshacer','Ctrl+Z'],['redo','Rehacer','Ctrl+Y']].map(([command,label,key])=>({id:'editor-'+command,command,label,key,scope:'editor'})),
 ...[1,2,3,4,5,6].map(level=>({id:'editor-heading'+level,command:'heading'+level,label:'Encabezado '+level,key:'Ctrl+Alt+'+level,scope:'editor'})),
];
export const appCommands=[
 ...editorCommands,
 {id:'open',label:'Abrir Markdown',key:'Ctrl+O'}, {id:'resources',label:'Recursos para apuntes',key:'Ctrl+Shift+M'},
 {id:'new',label:'Nueva nota',key:'Ctrl+N'}, {id:'quick',label:'Buscar y abrir',key:'Ctrl+K'},
 {id:'search',label:'Buscar en todas las notas',key:'Ctrl+Shift+F'}, {id:'view',label:'Cambiar vista',key:'Ctrl+Shift+P'},
 {id:'focus',label:'Modo enfoque',key:'Ctrl+.'}, {id:'settings',label:'Preferencias',key:'Ctrl+,'},
 {id:'save',label:'Guardar',key:'Ctrl+S'}, {id:'template',label:'Plantilla en nota vacía',key:'Ctrl+T'},
 {id:'duplicate',label:'Duplicar nota',key:'Ctrl+D'}, {id:'export',label:'Exportar vista previa',key:'Ctrl+Shift+E'},
 {id:'trash',label:'Mover nota a la papelera',key:'Ctrl+Shift+Backspace'},
];
export function keyFromEvent(e){
 if(['Control','Shift','Alt','Meta'].includes(e.key)||e.isComposing||e.getModifierState?.('AltGraph'))return '';
 let key=e.key===' '?'Space':e.key.length===1?e.key.toUpperCase():e.key;
 return [e.ctrlKey||e.metaKey?'Ctrl':'',e.altKey?'Alt':'',e.shiftKey?'Shift':'',key].filter(Boolean).join('+');
}
const reserved=new Set(['Ctrl+A','Ctrl+C','Ctrl+H','Ctrl+V','Ctrl+X','Ctrl+Shift+Z','Ctrl+Tab','Ctrl+Shift+Tab','Alt+F4']);
export function bindingError(id,key,bindings){
 if(!/^(Ctrl\+|Alt\+)(?:Alt\+)?(?:Shift\+)?(?:[A-Z0-9.,;/-]|F(?:[1-9]|1[0-2])|Backspace|Enter|Space)$/.test(key))return 'Usa Ctrl o Alt más una tecla (puedes añadir Shift).';
 if(reserved.has(key))return 'Ese atajo está reservado para editar texto o para Windows.';
 const conflict=appCommands.find(c=>c.id!==id&&(bindings[c.id]||c.key)===key);
 return conflict?`Ya se usa para «${conflict.label}».`:'';
}
export function bindingsFor(settings){
 const saved=settings?.shortcuts||{},defaults=Object.fromEntries(appCommands.map(c=>[c.id,c.key])),candidate={...defaults};
 for(const c of appCommands)if(typeof saved[c.id]==='string')candidate[c.id]=saved[c.id];
 // New editor defaults must not invalidate a user's existing 1.3 app bindings.
 const used=new Set(Object.values(candidate));
 const alternatives=[...Array.from({length:12},(_,i)=>'Ctrl+Alt+Shift+F'+(i+1)),...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map(k=>k.length===1?'Ctrl+Alt+Shift+'+k:k);
 for(const c of appCommands.filter(c=>c.scope==='editor'||['open','resources'].includes(c.id))){if(Object.hasOwn(saved,c.id))continue;if(appCommands.some(other=>other.id!==c.id&&Object.hasOwn(saved,other.id)&&candidate[other.id]===candidate[c.id])){const free=alternatives.find(k=>!used.has(k));if(free){candidate[c.id]=free;used.add(free);}}}
 return appCommands.some(c=>bindingError(c.id,candidate[c.id],candidate))?defaults:candidate;
}
