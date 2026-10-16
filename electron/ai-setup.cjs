'use strict';
const os = require('node:os');
const fs = require('node:fs/promises');
const path = require('node:path');
const {spawn} = require('node:child_process');
const MODELS = [
 {name:'qwen2.5:1.5b',label:'Ligero · 1.5B',size:'≈ 1 GB',ram:4},
 {name:'qwen2.5:3b',label:'Equilibrado · 3B',size:'≈ 2 GB',ram:8},
 {name:'qwen2.5:7b',label:'Mayor calidad · 7B',size:'≈ 4.7 GB',ram:16},
];
class AiSetup {
 constructor(ollama,directory,{spawnImpl=spawn,memory=os.totalmem(),fetchImpl=fetch}={}){
  this.ollama=ollama;this.directory=directory;this.spawn=spawnImpl;this.memory=memory;this.fetch=fetchImpl;this.controller=null;
  this.state={phase:'idle',message:'La IA es opcional. Puedes usar todas las herramientas de notas sin descargar modelos.',progress:0};
 }
 async status(){
  let models=[],available=false;try{models=await this.ollama.models();available=true;}catch{}
  const ram=Math.round(this.memory/1024**3),recommended=ram>=16?MODELS[2].name:ram>=8?MODELS[1].name:MODELS[0].name;
  return {...this.state,ram,recommended,choices:MODELS,available,models,config:this.ollama.config};
 }
 async requested(){const file=path.join(this.directory,'ai-setup-requested');try{await fs.access(file);await fs.unlink(file);return true;}catch{return false;}}
 async installRuntime(){
  if(['installing','downloading'].includes(this.state.phase))throw new Error('Ya hay una instalación en curso.');
  this.state={phase:'installing',progress:0,message:'Instalando Ollama mediante Windows Package Manager…'};
  // Fixed executable/arguments: renderer input can never become a shell command.
  try{
   await new Promise((resolve,reject)=>{
    const child=this.spawn('winget.exe',['install','--id','Ollama.Ollama','--exact','--source','winget','--silent','--disable-interactivity','--accept-source-agreements','--accept-package-agreements'],{windowsHide:true,stdio:'ignore',shell:false});
    const timer=setTimeout(()=>{child.kill();reject(new Error('La instalación tardó demasiado. Instala Ollama desde ollama.com/download/windows.'));},600000);timer.unref?.();
    child.once('error',()=>{clearTimeout(timer);reject(new Error('No se pudo iniciar winget. Instala Ollama desde ollama.com/download/windows y vuelve aquí.'));});
    child.once('exit',code=>{clearTimeout(timer);code===0?resolve():reject(new Error('Windows no completó la instalación. Abre el instalador oficial de Ollama y vuelve a buscar modelos.'));});
   });
   this.state={phase:'ready',progress:0,message:'Ollama instalado. Abre Ollama si Windows todavía no lo inició; después descarga el modelo.'};
   try{
    const executable=path.join(process.env.LOCALAPPDATA||'', 'Programs','Ollama','ollama.exe');await fs.access(executable);
    const child=this.spawn(executable,['serve'],{windowsHide:true,stdio:'ignore',detached:true,shell:false});child.on('error',()=>{});child.unref();
   }catch{}
  }catch(e){this.state={phase:'error',progress:0,message:e.message};}
  return this.state;
 }
 async pull(model){
  if(!MODELS.some(m=>m.name===model))throw new Error('Elige un modelo del catálogo local.');
  if(['installing','downloading'].includes(this.state.phase))throw new Error('Ya hay una instalación en curso.');
  const controller=new AbortController();this.controller=controller;
  this.state={phase:'downloading',progress:0,message:'Descargando '+model+'…',model};
  const timer=setTimeout(()=>controller.abort(),3600000);timer.unref?.();
  try{
   const response=await this.fetch(this.ollama.base+'/api/pull',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model,stream:true}),signal:controller.signal,redirect:'error'});
   if(!response.ok||!response.body)throw new Error('Ollama no pudo iniciar la descarga. Comprueba tu conexión.');
   let pending='',success=false;const decoder=new TextDecoder();
   const consume=line=>{if(!line.trim())return;const data=JSON.parse(line);if(data.error)throw new Error(String(data.error).slice(0,300));if(data.status==='success')success=true;this.state={...this.state,message:String(data.status||'Descargando…').slice(0,200),progress:data.total?Math.min(100,Math.round((data.completed||0)/data.total*100)):this.state.progress};};
   for await(const chunk of response.body){pending+=decoder.decode(chunk,{stream:true});if(pending.length>65536)throw new Error('Respuesta de descarga no válida.');let end;while((end=pending.indexOf('\n'))>=0){consume(pending.slice(0,end));pending=pending.slice(end+1);}}
   pending+=decoder.decode();consume(pending);
   if(controller.signal.aborted)throw new Error('Descarga cancelada.');
   if(!success)throw new Error('La descarga terminó sin confirmar el modelo. Inténtalo de nuevo.');
   await this.ollama.configure({enabled:true,model});
   this.state={phase:'complete',progress:100,message:'Modelo instalado y predicción local activada.',model};
  }catch(e){this.state={phase:controller.signal.aborted?'cancelled':'error',progress:0,message:controller.signal.aborted?'Descarga cancelada. Puedes reanudarla después.':e.message};}
  finally{clearTimeout(timer);if(this.controller===controller)this.controller=null;}
  return this.state;
 }
 cancel(){this.controller?.abort();return true;}
}
module.exports={AiSetup,MODELS};
