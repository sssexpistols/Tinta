'use strict';
const fs=require('node:fs/promises'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),pkg=require('../package.json');
(async()=>{
 // Builder also launches npm for dependency discovery; support portable Node installs.
 process.env.PATH=path.dirname(process.execPath)+path.delimiter+process.env.PATH;
 const buildRoot=path.join(root,'.build');await fs.mkdir(buildRoot,{recursive:true});const stage=await fs.mkdtemp(path.join(buildRoot,'installer-'));
 for(const folder of ['dist','electron','assets','shared'])await fs.cp(path.join(root,folder),path.join(stage,folder),{recursive:true,filter:file=>!file.endsWith('.test.cjs')});
 for(const file of ['package.json','package-lock.json'])await fs.copyFile(path.join(root,'packaging/runtime',file),path.join(stage,file));
 const npm=process.env.npm_execpath;
 if(!npm)throw Error('Ejecuta npm run installer para usar el runtime npm actual.');
 const install=spawnSync(process.execPath,[npm,'ci','--omit=dev','--ignore-scripts','--no-audit','--cache',path.join(buildRoot,'npm-cache')],{cwd:stage,stdio:'inherit',windowsHide:true});if(install.status!==0)throw Error('No se pudieron preparar las dependencias de actualizaciones.');
 const runtime=JSON.parse(await fs.readFile(path.join(stage,'package.json'),'utf8'));runtime.version=pkg.version;
 // Runtime deps were installed from a lockfile. Builder can traverse them directly,
 // avoiding an additional PowerShell/npm discovery subprocess on Windows.
 runtime.packageManager='traversal@1';
 await fs.writeFile(path.join(stage,'package.json'),JSON.stringify(runtime,null,2));
 await fs.copyFile(path.join(root,'THIRD-PARTY-NOTICES.txt'),path.join(stage,'THIRD-PARTY-NOTICES.txt'));
 await require('electron-builder').build({projectDir:stage,targets:require('electron-builder').Platform.WINDOWS.createTarget(process.argv.includes('--dir')?['dir']:['nsis'],require('electron-builder').Arch.x64),publish:'never',config:{
  appId:'app.tinta.notes',productName:'Tinta',artifactName:'Tinta-Setup-${version}.${ext}',
  toolsets:{nsis:'1.2.1'},
  directories:{app:stage,output:process.env.TINTA_RELEASE_DIR||path.join(root,'.build','release')},
  electronVersion:require('electron/package.json').version,
  ...(process.env.TINTA_ELECTRON_DIST?{electronDist:process.env.TINTA_ELECTRON_DIST}:{}),
  asar:true,npmRebuild:false,files:['**/*','!package-lock.json'],
  win:{icon:path.join(root,'assets/tinta.ico'),signAndEditExecutable:true},
  nsis:{oneClick:false,perMachine:false,allowToChangeInstallationDirectory:true,deleteAppDataOnUninstall:false,include:path.join(root,'packaging/installer.nsh'),createDesktopShortcut:true,shortcutName:'Tinta',installerLanguages:['es_ES','en_US']},
  publish:[{provider:'github',owner:'sssexpistols',repo:'Tinta',releaseType:'release'}],
 }});
 console.log((process.argv.includes('--dir')?'Application bundle ready: ':'Installer ready: ')+pkg.version);
})().catch(e=>{console.error(e);process.exit(1);});
