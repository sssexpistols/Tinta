import React from 'react';
import {Moon,Sun,Palette,Terminal,Hash} from 'lucide-react';
export default function EditorPreferences({settings,onChange}) {
 const theme=settings.colorTheme||settings.theme;
 return <>
  <div className="setting-row"><div><b>Apariencia</b><small>Elige la luz de tu espacio.</small></div><div className="segmented theme-options">{[{id:'dark',name:'Oscuro',Icon:Moon},{id:'light',name:'Claro',Icon:Sun},{id:'gruvbox',name:'Gruvbox',Icon:Palette}].map(({id,name,Icon})=><button key={id} className={theme===id?'selected':''} onClick={()=>onChange({theme:id==='gruvbox'?'dark':id,colorTheme:id})}><Icon size={14}/>{name}</button>)}</div></div>
  <div className="setting-row"><div><b><Terminal size={14}/> Modo Vim</b><small>Normal, insertar, visual y comandos con :.</small></div><button role="switch" aria-label="Modo Vim" aria-checked={!!settings.vimMode} className={`switch ${settings.vimMode?'on':''}`} onClick={()=>onChange({vimMode:!settings.vimMode})}><span/></button></div>
  <div className="setting-row"><div><b><Hash size={14}/> Números relativos</b><small>Distancia al cursor; la línea actual conserva su número.</small></div><button role="switch" aria-label="Números relativos" aria-checked={settings.relativeNumbers!==false} className={`switch ${settings.relativeNumbers!==false?'on':''}`} onClick={()=>onChange({relativeNumbers:settings.relativeNumbers===false})}><span/></button></div>
  {settings.vimMode&&<div className="vim-help"><kbd>i</kbd> insertar <kbd>Esc</kbd> normal <kbd>v</kbd> visual <kbd>:w</kbd> guardar<br/><span>Movimientos h j k l, números + movimiento, dd, yy, p, u y búsqueda /.</span></div>}
 </>;
}
