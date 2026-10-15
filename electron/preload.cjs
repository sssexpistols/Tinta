'use strict';

const { contextBridge, ipcRenderer } = require('electron');

let beforeCloseCallback = null;
let handlingClose = false;
ipcRenderer.on('tinta:before-close', async () => {
  if (handlingClose) return;
  handlingClose = true;
  try {
    if (beforeCloseCallback) await beforeCloseCallback();
    await ipcRenderer.invoke('tinta:ready-to-close');
  } catch {
    // The renderer owns the visible error; main must leave the window open.
    await ipcRenderer.invoke('tinta:close-failed').catch(() => {});
  } finally { handlingClose = false; }
});

contextBridge.exposeInMainWorld('tinta', Object.freeze({
  platform: process.platform,
  copyText: text => ipcRenderer.invoke('tinta:copy-text',text),
  load: () => ipcRenderer.invoke('tinta:load'),
  save: state => ipcRenderer.invoke('tinta:save', state),
  getStorageStatus: () => ipcRenderer.invoke('tinta:storage-status'),
  importFiles: () => ipcRenderer.invoke('tinta:import-files'),
  aiConfig: () => ipcRenderer.invoke('tinta:ai-config'),
  aiModels: () => ipcRenderer.invoke('tinta:ai-models'),
  aiConfigure: config => ipcRenderer.invoke('tinta:ai-configure',config),
  aiPredict: request => ipcRenderer.invoke('tinta:ai-predict',request),
  aiCancel: id => ipcRenderer.invoke('tinta:ai-cancel',id),
  exportPreview: payload => ipcRenderer.invoke('tinta:export-preview',payload),
  exportNote: note => ipcRenderer.invoke('tinta:export-note', note),
  exportBackup: state => ipcRenderer.invoke('tinta:export-backup', state),
  importBackup: () => ipcRenderer.invoke('tinta:import-backup'),
  openDataFolder: () => ipcRenderer.invoke('tinta:open-data-folder'),
  openExternal: url => ipcRenderer.invoke('tinta:open-external', url),
  windowAction: action => ipcRenderer.invoke('tinta:window-action', action),
  readyToClose: () => ipcRenderer.invoke('tinta:ready-to-close'),
  onBeforeClose: callback => {
    if (typeof callback !== 'function') throw new TypeError('Se esperaba una función.');
    beforeCloseCallback = callback;
    return () => { if (beforeCloseCallback === callback) beforeCloseCallback = null; };
  },
  onWindowState: callback => {
    if (typeof callback !== 'function') throw new TypeError('Se esperaba una función.');
    let active = true;
    const listener = (_event, state) => { if (active) callback(state); };
    ipcRenderer.on('tinta:window-state-changed', listener);
    ipcRenderer.invoke('tinta:window-state').then(state => { if (active) callback(state); }).catch(() => {});
    return () => { active = false; ipcRenderer.removeListener('tinta:window-state-changed', listener); };
  },
}));
