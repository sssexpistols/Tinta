'use strict';
class Updates {
 constructor(updater){
  this.updater=updater;this.state={phase:updater?'idle':'unavailable',version:'',progress:0,message:updater?'Buscar nuevas versiones en GitHub.':'Las actualizaciones están disponibles en la versión instalada.'};
  if(!updater)return;
  updater.autoDownload=false;updater.autoInstallOnAppQuit=false;updater.allowDowngrade=false;
  updater.on('checking-for-update',()=>this.set({phase:'checking',message:'Buscando actualizaciones…'}));
  updater.on('update-available',info=>this.set({phase:'available',version:info.version,message:'Nueva versión disponible: '+info.version}));
  updater.on('update-not-available',()=>this.set({phase:'current',message:'Tinta está al día.'}));
  updater.on('download-progress',info=>this.set({phase:'downloading',progress:Math.round(info.percent),message:'Descargando actualización…'}));
  updater.on('update-downloaded',info=>this.set({phase:'downloaded',version:info.version,progress:100,message:'Actualización lista. Guarda y reinicia cuando quieras.'}));
  updater.on('error',error=>this.set({phase:'error',message:'No se pudo actualizar: '+error.message.slice(0,300)}));
 }
 set(patch){this.state={...this.state,...patch};}
 async check(){if(!this.updater||['checking','downloading','downloaded'].includes(this.state.phase))return this.state;try{await this.updater.checkForUpdates();}catch(e){this.set({phase:'error',message:'No se pudo consultar GitHub. Inténtalo más tarde.'});}return this.state;}
 async download(){if(!this.updater||this.state.phase!=='available')throw new Error('Primero busca una actualización disponible.');this.set({phase:'downloading',progress:0});try{await this.updater.downloadUpdate();}catch(e){this.set({phase:'error',message:'No se pudo descargar la actualización. Vuelve a buscar para reintentar.'});}return this.state;}
 async install(flush,beforeQuit){if(!this.updater||this.state.phase!=='downloaded')throw new Error('La actualización todavía no está lista.');await flush();beforeQuit();this.updater.quitAndInstall(false,true);}
}
module.exports={Updates};
