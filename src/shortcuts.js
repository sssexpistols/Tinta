export const appCommands=[
 {id:'new',label:'Nueva nota',key:'Ctrl+N'}, {id:'quick',label:'Buscar y abrir',key:'Ctrl+K'},
 {id:'search',label:'Buscar en todas las notas',key:'Ctrl+Shift+F'}, {id:'view',label:'Cambiar vista',key:'Ctrl+Shift+P'},
 {id:'focus',label:'Modo enfoque',key:'Ctrl+.'}, {id:'settings',label:'Preferencias',key:'Ctrl+,'},
 {id:'save',label:'Guardar',key:'Ctrl+S'}, {id:'template',label:'Plantilla en nota vacía',key:'Ctrl+T'},
 {id:'duplicate',label:'Duplicar nota',key:'Ctrl+D'}, {id:'export',label:'Exportar vista previa',key:'Ctrl+Shift+E'},
 {id:'trash',label:'Mover nota a la papelera',key:'Ctrl+Shift+Backspace'},
];
export function keyFromEvent(e){
 if(['Control','Shift','Alt','Meta'].includes(e.key)||e.isComposing||e.getModifierState?.('AltGraph'))return '';
 let key=e.key.length===1?e.key.toUpperCase():e.key;
 return [e.ctrlKey||e.metaKey?'Ctrl':'',e.altKey?'Alt':'',e.shiftKey?'Shift':'',key].filter(Boolean).join('+');
}
const reserved=new Set(['Ctrl+A','Ctrl+B','Ctrl+C','Ctrl+F','Ctrl+H','Ctrl+I','Ctrl+V','Ctrl+X','Ctrl+Y','Ctrl+Z','Ctrl+Shift+Z','Ctrl+Tab','Ctrl+Shift+Tab','Alt+F4']);
export function bindingError(id,key,bindings){
 if(!/^(Ctrl\+|Alt\+)(?:Alt\+)?(?:Shift\+)?(?:[A-Z0-9.,;/-]|F(?:[1-9]|1[0-2])|Backspace|Enter|Space)$/.test(key))return 'Usa Ctrl o Alt más una tecla (puedes añadir Shift).';
 if(reserved.has(key))return 'Ese atajo está reservado para editar texto o para Windows.';
 const conflict=appCommands.find(c=>c.id!==id&&(bindings[c.id]||c.key)===key);
 return conflict?`Ya se usa para «${conflict.label}».`:'';
}
export function bindingsFor(settings){const saved=settings?.shortcuts||{},defaults=Object.fromEntries(appCommands.map(c=>[c.id,c.key]));const candidate={...defaults};for(const c of appCommands)if(typeof saved[c.id]==='string')candidate[c.id]=saved[c.id];return appCommands.some(c=>bindingError(c.id,candidate[c.id],candidate))?defaults:candidate;}
