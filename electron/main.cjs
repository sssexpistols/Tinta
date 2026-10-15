'use strict';

const { app, BrowserWindow, Menu, ipcMain, dialog, shell, session, clipboard } = require('electron');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { NoteStore, parseBackup, serializeState, atomicWrite, MAX_BYTES } = require('./storage.cjs');

app.setName('Tinta');
app.setAppUserModelId('app.tinta.notes');
const dataDirectory = process.env.TINTA_DATA_DIR ? path.resolve(process.env.TINTA_DATA_DIR) : path.join(app.getPath('appData'), 'Tinta');
fs.mkdirSync(dataDirectory, { recursive: true });
fs.mkdirSync(path.join(dataDirectory, 'session'), { recursive: true });
app.setPath('userData', dataDirectory);
app.setPath('sessionData', path.join(dataDirectory, 'session'));
app.setPath('crashDumps', path.join(dataDirectory, 'crash-dumps'));
app.setAppLogsPath(path.join(dataDirectory, 'logs'));

const store = new NoteStore(dataDirectory);
const testPort=process.env.TINTA_TEST_MODE==='1'&&process.env.TINTA_DATA_DIR&&/^\d{4,5}$/.test(process.env.TINTA_OLLAMA_TEST_PORT||'')?Number(process.env.TINTA_OLLAMA_TEST_PORT):11434;
const ollama = new (require('./ollama.cjs').OllamaService)(dataDirectory,{base:'http://127.0.0.1:'+testPort});
const aiReady = ollama.load();
const entryPath = path.resolve(__dirname, '../dist/index.html');
const entryUrl = pathToFileURL(entryPath).href;
const testMode = process.env.TINTA_TEST_MODE === '1';
let mainWindow = null;
let closeApproved = false;
let closePending = false;
let closeTimer = null;
let rendererGone = false;
let devUrl = null;

if (process.env.TINTA_DEV_URL) {
  const candidate = new URL(process.env.TINTA_DEV_URL);
  if (candidate.protocol !== 'http:' || !['localhost', '127.0.0.1', '[::1]'].includes(candidate.hostname)) throw new Error('TINTA_DEV_URL debe ser un servidor HTTP local.');
  devUrl = candidate;
}

function isOwnUrl(url) {
  try {
    const candidate = new URL(url);
    if (devUrl) return candidate.origin === devUrl.origin;
    return candidate.protocol === 'file:' && candidate.href.split(/[?#]/)[0] === entryUrl;
  } catch { return false; }
}

function assertSender(event) {
  if (!mainWindow || event.sender !== mainWindow.webContents || event.senderFrame !== mainWindow.webContents.mainFrame || !isOwnUrl(event.senderFrame.url)) throw new Error('Solicitud no autorizada.');
}

function handle(channel, callback) {
  ipcMain.handle(channel, (event, ...args) => { assertSender(event); return callback(...args); });
}

function safeExternal(value) {
  if (typeof value !== 'string' || value.length > 8192) return false;
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return false;
    void shell.openExternal(url.href).catch(() => {});
    return true;
  } catch { return false; }
}

function safeFilename(title, extension) {
  let name = String(title || 'Sin título').replace(/[<>:"/\\|?*\u0000-\u001F]/g, '-').replace(/[. ]+$/g, '').trim().slice(0, 100) || 'Sin título';
  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(name)) name = `Nota-${name}`;
  return `${name}${extension}`;
}

function windowState() { return { maximized: Boolean(mainWindow?.isMaximized()) }; }

function cancelClose() {
  clearTimeout(closeTimer);
  closeTimer = null;
  closePending = false;
}

async function finishClose() {
  if (!closePending || !mainWindow || mainWindow.isDestroyed()) return;
  try {
    await store.flush();
    clearTimeout(closeTimer);
    closeApproved = true;
    mainWindow.close();
  } catch (error) {
    cancelClose();
    if (!testMode) await dialog.showMessageBox(mainWindow, { type: 'error', title: 'No se pudo guardar', message: 'Tinta permanece abierta para proteger tus cambios.', detail: error.message, buttons: ['Volver a las notas'] });
  }
}

async function askCloseWithoutFlush() {
  if (!closePending || !mainWindow || mainWindow.isDestroyed()) return;
  if (testMode) { cancelClose(); return; }
  const { response } = await dialog.showMessageBox(mainWindow, {
    type: 'warning', title: 'El editor no respondió', message: 'No se pudo confirmar el último guardado.',
    detail: 'Puedes volver a las notas e intentar guardar de nuevo. Si cierras ahora, se conservarán los cambios que ya se guardaron en disco.',
    buttons: ['Volver a las notas', 'Cerrar sin confirmar'], defaultId: 0, cancelId: 0, noLink: true,
  });
  if (response === 1 && mainWindow && !mainWindow.isDestroyed()) {
    await store.flush().catch(() => {});
    closeApproved = true;
    mainWindow.destroy();
  } else cancelClose();
}

function registerIpc() {
  handle('tinta:copy-text',text=>{if(typeof text!=='string'||text.length>65536)throw new Error('Texto para copiar no válido.');clipboard.writeText(text);if(clipboard.readText()!==text)throw new Error('No se pudo acceder al portapapeles. Inténtalo de nuevo.');return true;});
  handle('tinta:ai-config', async()=>{await aiReady;return ollama.config;});
  handle('tinta:ai-models', ()=>ollama.models());
  handle('tinta:ai-configure', async config=>{await aiReady;return ollama.configure(config);});
  handle('tinta:ai-predict', async request=>{await aiReady;return ollama.predict(request);});
  handle('tinta:ai-cancel', id=>ollama.cancel(id));
  handle('tinta:export-preview', async payload=>{
    const html=require('./preview-export.cjs').previewDocument(payload);
    const result=await dialog.showSaveDialog(mainWindow,{title:'Exportar vista previa',defaultPath:safeFilename(payload.title,'.'+payload.format),filters:[{name:payload.format.toUpperCase(),extensions:[payload.format]}]});
    if(result.canceled||!result.filePath)return false;
    if(payload.format==='html'){await atomicWrite(result.filePath,html);return true;}
    const printSession=session.fromPartition('tinta-export-'+require('node:crypto').randomUUID());
    printSession.setPermissionRequestHandler((_wc,_perm,callback)=>callback(false));
    printSession.webRequest.onBeforeRequest((details,callback)=>callback({cancel:!(details.url.startsWith('data:')||(details.resourceType==='image'&&details.url.startsWith('https:')))}));
    const printWindow=new BrowserWindow({show:false,webPreferences:{session:printSession,sandbox:true,contextIsolation:true,nodeIntegration:false,javascript:false}});
    printWindow.webContents.setWindowOpenHandler(()=>({action:'deny'}));
    try{await Promise.race([printWindow.loadURL('data:text/html;charset=utf-8,'+encodeURIComponent(html)),new Promise((_,reject)=>{const timer=setTimeout(()=>reject(new Error('La exportación tardó demasiado; revisa las imágenes externas.')),20000);timer.unref();})]);const pdf=await printWindow.webContents.printToPDF({printBackground:true,preferCSSPageSize:true,pageSize:'A4'});await atomicWrite(result.filePath,pdf);return true;}
    finally{printWindow.destroy();await printSession.clearStorageData();}
  });
  handle('tinta:load', async () => { const state=await store.load(); await require('./upgrade.cjs').preserveUpgradeSnapshot(dataDirectory,state); return state; });
  handle('tinta:save', state => store.save(state));
  handle('tinta:storage-status', () => store.getStatus());
  handle('tinta:window-state', windowState);
  handle('tinta:window-action', action => {
    if (action === 'minimize') mainWindow.minimize();
    else if (action === 'maximize') mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
    else if (action === 'close') mainWindow.close();
    else throw new Error('Acción de ventana desconocida.');
  });
  handle('tinta:ready-to-close', () => finishClose());
  handle('tinta:close-failed', () => { cancelClose(); return { ok: true }; });
  handle('tinta:open-external', safeExternal);
  handle('tinta:open-data-folder', async () => {
    await fsp.mkdir(dataDirectory, { recursive: true });
    const error = await shell.openPath(dataDirectory);
    if (error) throw new Error(error);
    return true;
  });
  handle('tinta:import-files', async () => {
    if (testMode) return [];
    const result = await dialog.showOpenDialog(mainWindow, { title: 'Importar notas Markdown', properties: ['openFile', 'multiSelections'], filters: [{ name: 'Notas Markdown y texto', extensions: ['md', 'markdown', 'mdown', 'txt'] }] });
    if (result.canceled) return [];
    const files = [];
    for (const filePath of result.filePaths) {
      const stat = await fsp.stat(filePath);
      if (!stat.isFile() || stat.size > 16 * 1024 * 1024) throw new Error(`El archivo ${path.basename(filePath)} supera el límite de 16 MB.`);
      files.push({ name: path.basename(filePath, path.extname(filePath)), body: (await fsp.readFile(filePath, 'utf8')).replace(/^\uFEFF/, '') });
    }
    return files;
  });
  handle('tinta:export-note', async note => {
    if (!note || typeof note.title !== 'string' || typeof note.body !== 'string' || Buffer.byteLength(note.body) > MAX_BYTES) throw new Error('La nota no es válida.');
    if (testMode) return false;
    const result = await dialog.showSaveDialog(mainWindow, { title: 'Exportar nota Markdown', defaultPath: safeFilename(note.title, '.md'), filters: [{ name: 'Markdown', extensions: ['md'] }] });
    if (result.canceled || !result.filePath) return false;
    await atomicWrite(result.filePath, note.body);
    return true;
  });
  handle('tinta:export-backup', async state => {
    const content = serializeState(state);
    if (testMode) return false;
    const day = new Date().toLocaleDateString('sv-SE');
    const result = await dialog.showSaveDialog(mainWindow, { title: 'Guardar copia de todas las notas', defaultPath: `Tinta-${day}.json`, filters: [{ name: 'Copia de Tinta', extensions: ['json'] }] });
    if (result.canceled || !result.filePath) return false;
    await atomicWrite(result.filePath, content);
    return true;
  });
  handle('tinta:import-backup', async () => {
    if (testMode) return null;
    const result = await dialog.showOpenDialog(mainWindow, { title: 'Abrir copia de Tinta', properties: ['openFile'], filters: [{ name: 'Copia de Tinta', extensions: ['json'] }] });
    if (result.canceled || !result.filePaths[0]) return null;
    const filePath = result.filePaths[0];
    const stat = await fsp.stat(filePath);
    if (!stat.isFile() || stat.size > MAX_BYTES) throw new Error('La copia supera el límite de 64 MB.');
    return parseBackup(await fsp.readFile(filePath, 'utf8'));
  });
}

function createWindow() {
  closeApproved = false;
  rendererGone = false;
  mainWindow = new BrowserWindow({
    width: 1500, height: 940, minWidth: 900, minHeight: 580, show: false,
    frame: false, autoHideMenuBar: true, backgroundColor: '#0c0d0f', title: 'Tinta '+require('../package.json').version,
    icon: path.join(__dirname, '../assets/tinta.ico'),
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, sandbox: true, nodeIntegration: false, webSecurity: true, spellcheck: true, devTools: Boolean(devUrl) || testMode },
  });
  const contents = mainWindow.webContents;
  contents.setWindowOpenHandler(({ url }) => { safeExternal(url); return { action: 'deny' }; });
  contents.on('will-navigate', (event, url) => { if (!isOwnUrl(url)) { event.preventDefault(); safeExternal(url); } });
  contents.on('will-redirect', (event, url) => { if (!isOwnUrl(url)) event.preventDefault(); });
  contents.on('will-attach-webview', event => event.preventDefault());
  contents.on('render-process-gone', () => { rendererGone = true; });
  mainWindow.on('maximize', () => contents.send('tinta:window-state-changed', windowState()));
  mainWindow.on('unmaximize', () => contents.send('tinta:window-state-changed', windowState()));
  mainWindow.once('ready-to-show', () => mainWindow?.show());
  mainWindow.on('close', event => {
    if (closeApproved) return;
    event.preventDefault();
    if (closePending) return;
    closePending = true;
    if (rendererGone || contents.isDestroyed()) { void askCloseWithoutFlush(); return; }
    contents.send('tinta:before-close');
    closeTimer = setTimeout(() => void askCloseWithoutFlush(), 12000);
  });
  mainWindow.on('closed', () => { ollama.cancel(); cancelClose(); mainWindow = null; });
  if (devUrl) void mainWindow.loadURL(devUrl.href);
  else void mainWindow.loadFile(entryPath);
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => { if (mainWindow) { if (mainWindow.isMinimized()) mainWindow.restore(); mainWindow.show(); mainWindow.focus(); } });
  app.whenReady().then(() => {
    Menu.setApplicationMenu(null);
    session.defaultSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
    session.defaultSession.setPermissionCheckHandler(() => false);
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      const devConnect = devUrl ? ` ${devUrl.origin} ws://${devUrl.host}` : '';
      const policy = `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self'${devConnect}; object-src 'none'; base-uri 'none'; frame-src 'none'; form-action 'none'`;
      callback({ responseHeaders: { ...details.responseHeaders, 'Content-Security-Policy': [policy] } });
    });
    registerIpc();
    createWindow();
  }).catch(error => { if (!testMode) dialog.showErrorBox('Tinta no pudo iniciar', error.message); app.exit(1); });
  app.on('window-all-closed', () => app.quit());
}
