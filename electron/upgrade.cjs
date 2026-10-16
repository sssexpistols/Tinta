'use strict';
const fs=require('node:fs/promises');
const path=require('node:path');
const {serializeState}=require('./storage.cjs');
// Additive settings keep schema v1 readable by Tinta 1.0.0. Preserve a separate,
// immutable pre-upgrade snapshot before any 1.5 save can rotate normal backups.
async function preserveUpgradeSnapshot(directory,state){
 if(!state)return;
 const file=path.join(directory,'notes.before-v1.6.0.json');
 try{await fs.writeFile(file,serializeState(state),{encoding:'utf8',flag:'wx',mode:0o600});}
 catch(error){if(error.code!=='EEXIST')throw error;}
}
module.exports={preserveUpgradeSnapshot};
