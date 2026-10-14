'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

const MAX_BYTES = 64 * 1024 * 1024;
const STATUSES = new Set(['active', 'onhold', 'completed', 'dropped']);

class StorageError extends Error {
  constructor(code, message, cause) {
    super(message, { cause });
    this.name = 'StorageError';
    this.code = code;
  }
}

function fail(message) {
  throw new StorageError('INVALID_STATE', `La copia de notas no es válida: ${message}`);
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isText(value, max = 10000) {
  return typeof value === 'string' && value.length <= max;
}

function isId(value) {
  return isText(value, 256) && value.length > 0;
}

function isDate(value) {
  return typeof value === 'string' && value.length <= 64 && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value));
}

/** Validate the complete application state and return a detached JSON snapshot. */
function validateState(input) {
  if (!isObject(input) || input.version !== 1) fail('versión de formato desconocida.');
  if (!Array.isArray(input.notes) || input.notes.length > 100000) fail('lista de notas incorrecta.');
  if (!Array.isArray(input.notebooks) || input.notebooks.length > 10000) fail('lista de cuadernos incorrecta.');
  const notebooks = new Set();
  for (const notebook of input.notebooks) {
    if (!isObject(notebook) || !isId(notebook.id) || !isText(notebook.name, 1000) || !notebook.name.trim()) fail('cuaderno incompleto.');
    if (notebooks.has(notebook.id)) fail('identificadores de cuaderno duplicados.');
    notebooks.add(notebook.id);
  }
  if (!notebooks.has('inbox')) fail('falta el cuaderno Inbox necesario para importar y crear notas.');
  const ids = new Set();
  for (const note of input.notes) {
    if (!isObject(note) || !isId(note.id) || ids.has(note.id)) fail('identificador de nota incorrecto o duplicado.');
    ids.add(note.id);
    if (!isText(note.title) || !isText(note.body, 16 * 1024 * 1024)) fail('título o contenido de nota incorrecto.');
    if (!notebooks.has(note.notebookId)) fail('una nota hace referencia a un cuaderno inexistente.');
    if (!Array.isArray(note.tags) || note.tags.length > 256 || !note.tags.every(tag => isText(tag, 256) && tag.trim().length > 0)) fail('etiquetas incorrectas.');
    if (!STATUSES.has(note.status)) fail('estado de nota desconocido.');
    if (!isDate(note.createdAt) || !isDate(note.updatedAt) || !(note.deletedAt === null || isDate(note.deletedAt))) fail('fecha de nota incorrecta.');
    if (typeof note.pinned !== 'boolean' || typeof note.isTemplate !== 'boolean') fail('propiedades de nota incompletas.');
  }
  const settings = input.settings;
  if (!isObject(settings) || !['dark', 'light'].includes(settings.theme) || !['split', 'editor', 'preview'].includes(settings.view)) fail('preferencias incorrectas.');
  for (const key of ['fontSize', 'sidebarWidth', 'listWidth', 'editorRatio']) {
    if (!Number.isFinite(settings[key])) fail(`preferencia ${key} incorrecta.`);
  }
  if (settings.fontSize < 10 || settings.fontSize > 40 || settings.sidebarWidth < 100 || settings.sidebarWidth > 600 || settings.listWidth < 150 || settings.listWidth > 800 || settings.editorRatio < 0.1 || settings.editorRatio > 0.9) fail('preferencias fuera de rango.');
  if (!isText(input.selectedNoteId, 256)) fail('selección de nota incorrecta.');
  let serialized;
  try { serialized = JSON.stringify(input); } catch (error) { throw new StorageError('INVALID_STATE', 'Los datos no se pueden convertir a JSON.', error); }
  if (Buffer.byteLength(serialized, 'utf8') > MAX_BYTES) fail('el archivo supera el límite de 64 MB.');
  return JSON.parse(serialized);
}

function parseBackup(text) {
  if (!(typeof text === 'string' || Buffer.isBuffer(text)) || Buffer.byteLength(text) > MAX_BYTES) fail('tamaño de archivo incorrecto.');
  let value;
  try { value = JSON.parse(text.toString().replace(/^\uFEFF/, '')); } catch (error) { throw new StorageError('INVALID_JSON', 'No se pudo leer el JSON de notas. El archivo original se conserva.', error); }
  return validateState(value);
}

function serializeState(state) {
  return `${JSON.stringify(validateState(state), null, 2)}\n`;
}

/** Replace a file only after the new bytes have been written and flushed. */
async function atomicWrite(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.${process.pid}.${randomUUID()}.tmp`;
  let handle;
  try {
    handle = await fs.open(tempPath, 'wx', 0o600);
    await handle.writeFile(content, 'utf8');
    await handle.sync();
    await handle.close();
    handle = null;
    // Do not remove the existing file first: rename keeps a complete old/new file.
    for (let attempt = 0; ; attempt++) {
      try { await fs.rename(tempPath, filePath); break; }
      catch (error) {
        // Antivirus/indexers may briefly hold a Windows file open. Retrying the
        // same atomic replacement never creates a gap without the old file.
        if (process.platform !== 'win32' || !['EPERM', 'EACCES', 'EBUSY'].includes(error.code) || attempt >= 4) throw error;
        await new Promise(resolve => setTimeout(resolve, 25 * 2 ** attempt));
      }
    }
    if (process.platform !== 'win32') {
      let directory;
      try { directory = await fs.open(path.dirname(filePath), 'r'); await directory.sync(); } finally { await directory?.close(); }
    }
  } finally {
    await handle?.close().catch(() => {});
    await fs.unlink(tempPath).catch(error => { if (error.code !== 'ENOENT') throw error; });
  }
}

async function readCandidate(filePath) {
  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile() || stat.size > MAX_BYTES) throw new StorageError('FILE_TOO_LARGE', 'El archivo no es un archivo de notas válido o supera 64 MB.');
    const raw = await fs.readFile(filePath, 'utf8');
    try { return { exists: true, raw, state: parseBackup(raw) }; } catch (error) { return { exists: true, raw, error }; }
  } catch (error) {
    return error.code === 'ENOENT' ? { exists: false } : { exists: true, error };
  }
}

class NoteStore {
  constructor(directory) {
    this.directory = path.resolve(directory);
    this.filePath = path.join(this.directory, 'notes.json');
    this.backupPaths = [path.join(this.directory, 'notes.backup.json'), path.join(this.directory, 'notes.backup.2.json')];
    this._tail = Promise.resolve();
    this._loaded = false;
    this._state = null;
    this._expectedRaw = undefined;
    this._primaryExisted = false;
    this._lastGood = null;
    this._lastSaveError = null;
    this._status = { dataPath: this.filePath, recoveredFrom: null, warning: null };
  }

  _enqueue(operation) {
    const pending = this._tail.then(operation);
    this._tail = pending.catch(() => {});
    return pending;
  }

  async _load() {
    if (this._loaded) return this._state === null ? null : validateState(this._state);
    const primary = await readCandidate(this.filePath);
    this._primaryExisted = primary.exists;
    this._expectedRaw = primary.raw;
    if (primary.state) {
      this._state = primary.state;
      this._lastGood = serializeState(primary.state);
      this._loaded = true;
      return validateState(primary.state);
    }
    let anyExisted = primary.exists;
    for (const backupPath of this.backupPaths) {
      const backup = await readCandidate(backupPath);
      anyExisted ||= backup.exists;
      if (backup.state) {
        this._state = backup.state;
        this._lastGood = serializeState(backup.state);
        this._loaded = true;
        this._status.recoveredFrom = backupPath;
        this._status.warning = 'Se recuperó la última copia válida de tus notas. El archivo dañado se conservará al guardar. Revisa las notas más recientes.';
        return validateState(backup.state);
      }
    }
    if (anyExisted) {
      throw new StorageError('RECOVERY_REQUIRED', `No se pudieron leer las notas ni sus copias de seguridad. No se sobrescribirá ningún archivo. Abre ${this.directory} para recuperar una copia válida.`, primary.error);
    }
    this._loaded = true;
    return null;
  }

  load() { return this._enqueue(() => this._load()); }

  getStatus() { return { ...this._status }; }

  async _preserveInvalid(filePath, candidate) {
    if (!candidate.exists || candidate.state) return;
    const preserved = `${filePath}.corrupt-${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID().slice(0, 8)}`;
    // An exclusive copy preserves even an unsupported future-version backup.
    await fs.copyFile(filePath, preserved, fs.constants.COPYFILE_EXCL);
  }

  async save(input) {
    // Snapshot before joining the queue: caller mutation cannot alter this save.
    const snapshot = validateState(input);
    const content = serializeState(snapshot);
    return this._enqueue(async () => {
      try {
        await this._load();
        const primary = await readCandidate(this.filePath);
        if (primary.exists !== this._primaryExisted || (primary.exists && (primary.raw === undefined || primary.raw !== this._expectedRaw))) {
          throw new StorageError('EXTERNAL_CHANGE', 'El archivo de notas cambió fuera de Tinta o no se puede leer. Se detuvo el guardado para protegerlo. Reinicia Tinta para volver a cargarlo.');
        }
        if (primary.state && content === primary.raw) {
          this._lastSaveError = null;
          return { ok: true };
        }
        await fs.mkdir(this.directory, { recursive: true });
        await this._preserveInvalid(this.filePath, primary);
        const [first, second] = await Promise.all(this.backupPaths.map(readCandidate));
        await this._preserveInvalid(this.backupPaths[0], first);
        if (first.state) {
          await this._preserveInvalid(this.backupPaths[1], second);
          await atomicWrite(this.backupPaths[1], serializeState(first.state));
        }
        await atomicWrite(this.backupPaths[0], this._lastGood || content);
        await atomicWrite(this.filePath, content);
        this._state = snapshot;
        this._lastGood = content;
        this._expectedRaw = content;
        this._primaryExisted = true;
        this._lastSaveError = null;
        return { ok: true };
      } catch (error) {
        this._lastSaveError = error;
        throw error;
      }
    });
  }

  async flush() {
    await this._tail;
    if (this._lastSaveError) throw this._lastSaveError;
  }
}

module.exports = { NoteStore, StorageError, validateState, parseBackup, serializeState, atomicWrite, MAX_BYTES };
