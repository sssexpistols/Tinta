const {test}=require('node:test'),assert=require('node:assert/strict'),{EventEmitter}=require('node:events');
const {AiSetup}=require('./ai-setup.cjs'),{Updates}=require('./updates.cjs');
function ollama(){return {base:'http://127.0.0.1:11434',config:{enabled:false,model:''},models:async()=>[],async configure(config){this.config=config;}};}
test('setup selects modest model by RAM and does nothing until explicitly requested',async()=>{
 for(const [ram,model] of [[4,'1.5b'],[8,'3b'],[16,'7b']]){const service=new AiSetup(ollama(),'.',{memory:ram*1024**3,fetchImpl:()=>{throw Error('Unexpected network');}});const status=await service.status();assert.ok(status.recommended.endsWith(model));assert.equal(status.config.enabled,false);assert.equal(status.phase,'idle');}
});
test('model pull streams progress then activates only a confirmed local model',async()=>{
 const local=ollama();let sent;
 const service=new AiSetup(local,'.',{fetchImpl:async(url,request)=>{sent={url,body:JSON.parse(request.body)};return new Response('{"status":"pulling","total":100,"completed":50}\n{"status":"success"}\n');}});
 await assert.rejects(service.pull('unknown:cloud'));await service.pull('qwen2.5:1.5b');assert.equal(sent.url,'http://127.0.0.1:11434/api/pull');assert.equal(sent.body.stream,true);assert.equal(service.state.phase,'complete');assert.equal(local.config.enabled,true);
});
test('failed and cancelled model downloads never activate prediction',async()=>{
 const local=ollama(),failed=new AiSetup(local,'.',{fetchImpl:async()=>new Response('{"error":"no space"}\n')});await failed.pull('qwen2.5:3b');assert.equal(failed.state.phase,'error');assert.equal(local.config.enabled,false);
 const cancelled=new AiSetup(local,'.',{fetchImpl:(_url,{signal})=>new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(Error('cancelled'))))});const job=cancelled.pull('qwen2.5:3b');cancelled.cancel();await job;assert.equal(cancelled.state.phase,'cancelled');assert.equal(local.config.enabled,false);
});
test('updates require download and successful save before quit/install',async()=>{
 const updater=new EventEmitter();let installed=false,approved=false;updater.quitAndInstall=()=>installed=true;
 updater.checkForUpdates=async()=>updater.emit('update-available',{version:'1.7.0'});updater.downloadUpdate=async()=>updater.emit('update-downloaded',{version:'1.7.0'});
 const service=new Updates(updater);assert.equal(updater.autoInstallOnAppQuit,false);assert.equal(updater.autoDownload,false);
 await assert.rejects(service.install(async()=>{},()=>{}));await service.check();assert.equal(service.state.phase,'available');await service.download();
 await assert.rejects(service.install(async()=>{throw Error('disk full');},()=>approved=true));assert.equal(installed,false);assert.equal(approved,false);
 await service.install(async()=>{},()=>approved=true);assert.equal(installed,true);assert.equal(approved,true);
});
