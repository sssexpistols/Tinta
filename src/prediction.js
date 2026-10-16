import {predictionContext} from '../shared/prediction-context.mjs';
import {StateEffect,StateField,Prec} from '@codemirror/state';
import {Decoration,EditorView,WidgetType,ViewPlugin,keymap} from '@codemirror/view';
import {completionStatus} from '@codemirror/autocomplete';
const suggestion=StateEffect.define();
class Ghost extends WidgetType{
 constructor(text){super();this.text=text;}
 eq(other){return other.text===this.text;}
 toDOM(){const span=document.createElement('span');span.className='ai-ghost';span.textContent=this.text;span.setAttribute('aria-label','Sugerencia de IA; Tab para aceptar');return span;}
}
const field=StateField.define({
 create:()=>({text:'',pos:0}),
 update(value,tr){if(tr.docChanged||tr.selection)value={text:'',pos:0};for(const e of tr.effects)if(e.is(suggestion))value=e.value;return value;},
 provide:f=>EditorView.decorations.from(f,value=>value.text?Decoration.set([Decoration.widget({widget:new Ghost(value.text),side:1}).range(value.pos)]):Decoration.none),
});
export function prediction(propsRef,modeRef){
 const api=window.tinta;
 const plugin=ViewPlugin.fromClass(class{
  constructor(view){this.view=view;this.serial=0;this.timer=null;this.id=null;this.destroyed=false;this.typedAt=0;}
  cancel(){clearTimeout(this.timer);this.serial++;if(this.id)api?.aiCancel(this.id).catch(()=>{});this.id=null;propsRef.current.onAiStatus?.('IA local');}
  eligible(){const p=propsRef.current;return !!(api&&p.aiEnabled&&!p.readOnly&&this.view.hasFocus&&(!p.vimMode||modeRef.current==='INSERT')&&this.view.state.selection.main.empty&&!completionStatus(this.view.state)&&!this.view.composing);}
  update(update){
   if(update.docChanged||update.selectionSet||update.focusChanged){
    this.cancel();
    // Only actual typing starts a request; opening a note or moving the cursor does not.
    const typed=this.typedAt&&performance.now()-this.typedAt<1500;
    this.typedAt=0;
    if(typed&&update.docChanged&&update.transactions.some(t=>t.isUserEvent('input')&&!t.isUserEvent('input.complete'))){const serial=this.serial;this.timer=setTimeout(()=>this.request(serial),950);}
   }
  }
  async request(serial){
   if(!this.eligible()||serial!==this.serial)return;
   const view=this.view,state=view.state,pos=state.selection.main.head,note=propsRef.current.noteId;
   const context=predictionContext(state.sliceDoc(0,pos),state.sliceDoc(pos,Math.min(state.doc.length,pos+1000)),propsRef.current.noteTitle||'');const {before,after,title,topic,quotePrefix}=context;if(!before.trim())return;
   this.id=crypto.randomUUID();propsRef.current.onAiStatus?.('Pensando localmente…');
   try{const result=await api.aiPredict({id:this.id,before,after,title,topic,quotePrefix});if(this.destroyed||serial!==this.serial)return;
    if(this.eligible()&&propsRef.current.noteId===note&&view.state.doc===state.doc&&view.state.selection.main.head===pos&&result.text){view.dispatch({effects:suggestion.of({text:result.text,pos})});propsRef.current.onAiStatus?.('Tab acepta · Esc descarta');}
    else propsRef.current.onAiStatus?.('IA local');
   }catch{if(!this.destroyed&&serial===this.serial)propsRef.current.onAiStatus?.('Ollama no disponible · revisa Preferencias');}
  }
  destroy(){this.destroyed=true;this.cancel();}
 });
 function dismiss(view){const instance=view.plugin(plugin);instance?.cancel();const had=!!view.state.field(field).text;view.dispatch({effects:suggestion.of({text:'',pos:0})});propsRef.current.onAiStatus?.('IA local');return had;}
 return [field,plugin,EditorView.domEventHandlers({keydown(event,view){
  // Enter may be handled by CodeMirror before the browser emits beforeinput.
  if(event.isTrusted&&event.key==='Enter'&&!event.ctrlKey&&!event.altKey&&!event.metaKey){const instance=view.plugin(plugin);if(instance)instance.typedAt=performance.now();}
 },beforeinput(event,view){
  // DOM reconciliation, cursor motion and accepting a widget are not typing.
  const instance=view.plugin(plugin);
  if(instance)instance.typedAt=event.isTrusted&&['insertText','insertLineBreak','insertParagraph','insertCompositionText'].includes(event.inputType)?performance.now():0;
 }}),Prec.highest(keymap.of([
  {key:'Tab',run(view){const value=view.state.field(field);if(!value.text||!view.plugin(plugin)?.eligible())return false;view.plugin(plugin).cancel();view.dispatch({changes:{from:value.pos,insert:value.text},selection:{anchor:value.pos+value.text.length},userEvent:'input.complete.ai'});propsRef.current.onAiStatus?.('IA local');return true;}},
  {key:'Escape',run:view=>{const had=dismiss(view);return propsRef.current.vimMode?false:had;}},
 ])),ViewPlugin.define(view=>({update(u){if(u.focusChanged&&!view.hasFocus)queueMicrotask(()=>{if(view.dom.isConnected)dismiss(view);});}}))];
}
