'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { NoteStore, validateState, parseBackup, serializeState, atomicWrite } = require('./storage.cjs');

function state(body = 'Primera idea — 日本語 🌿') {
  return {
    version: 1,
    notes: [{ id: 'one', title: 'Mi nota', body, notebookId: 'inbox', tags: ['Ideas'], status: 'active', createdAt: '2026-10-14T18:00:00.000Z', updatedAt: '2026-10-14T18:00:00.000Z', deletedAt: null, pinned: false, isTemplate: false }],
    notebooks: [{ id: 'inbox', name: 'Inbox' }],
    settings: { theme: 'dark', fontSize: 15, view: 'split', sidebarWidth: 200, listWidth: 300, editorRatio: 0.5 },
    selectedNoteId: 'one',
  };
}

async function fixture(t) {
  const testRoot = path.resolve(process.env.TINTA_TEST_ROOT || os.tmpdir());
  await fs.mkdir(testRoot, { recursive: true });
  const directory = await fs.mkdtemp(path.join(testRoot, 'tinta-store-'));
  t.after(async () => {
    const resolved = path.resolve(directory);
    assert.equal(path.dirname(resolved), testRoot);
    assert.ok(path.basename(resolved).startsWith('tinta-store-'));
    await fs.rm(resolved, { recursive: true, force: true });
  });
  return { directory, store: new NoteStore(directory) };
}

test('first launch returns null without manufacturing or writing state', async t => {
  const { directory, store } = await fixture(t);
  assert.equal(await store.load(), null);
  assert.deepEqual(await fs.readdir(directory), []);
});

test('backup export/import roundtrip preserves Unicode, Markdown, templates and UI fields', () => {
  const input = state('# Café\n\n- [ ] tarea\n\n```js\nlet a = "á"\n```\n');
  input.notes[0].isTemplate = true;
  input.settings.syncScroll = false;
  const recovered = parseBackup(`\uFEFF${serializeState(input)}`);
  assert.deepEqual(recovered, input);
  recovered.notes[0].body = 'changed';
  assert.notEqual(input.notes[0].body, recovered.notes[0].body);
});

test('rejects unknown schema, broken references, duplicated IDs and malformed dates', () => {
  for (const change of [
    s => { s.version = 2; },
    s => { s.notebooks[0].id = 'other'; s.notes[0].notebookId = 'other'; },
    s => { s.notes[0].notebookId = 'missing'; },
    s => { s.notes.push({ ...s.notes[0] }); },
    s => { s.notes[0].updatedAt = 'yesterday'; },
    s => { s.notes[0].deletedAt = false; },
    s => { s.settings.editorRatio = NaN; },
    s => { s.notes[0].status = 'unknown'; },
  ]) {
    const input = state(); change(input);
    assert.throws(() => validateState(input), { code: 'INVALID_STATE' });
  }
  assert.throws(() => parseBackup('{ truncated'), { code: 'INVALID_JSON' });
});

test('successful writes reload exactly and retain two previous valid generations', async t => {
  const { directory, store } = await fixture(t);
  await store.save(state('one'));
  await store.save(state('two'));
  await store.save(state('three'));
  assert.deepEqual(await new NoteStore(directory).load(), state('three'));
  assert.equal(parseBackup(await fs.readFile(store.backupPaths[0], 'utf8')).notes[0].body, 'two');
  assert.equal(parseBackup(await fs.readFile(store.backupPaths[1], 'utf8')).notes[0].body, 'one');
  assert.ok(!(await fs.readdir(directory)).some(name => name.endsWith('.tmp')));
});

test('concurrent saves persist in invocation order and snapshot caller data immediately', async t => {
  const { store } = await fixture(t);
  const jobs = [];
  for (let i = 0; i < 30; i++) {
    const input = state(`revision-${i}`);
    jobs.push(store.save(input));
    input.notes[0].body = 'MUTATED AFTER SAVE';
  }
  await Promise.all(jobs);
  await store.flush();
  assert.equal((await store.load()).notes[0].body, 'revision-29');
  assert.equal(parseBackup(await fs.readFile(store.filePath, 'utf8')).notes[0].body, 'revision-29');
  assert.equal(parseBackup(await fs.readFile(store.backupPaths[0], 'utf8')).notes[0].body, 'revision-28');
  assert.equal(parseBackup(await fs.readFile(store.backupPaths[1], 'utf8')).notes[0].body, 'revision-27');
});

test('repeated unchanged saves do not rotate away useful previous generations', async t => {
  const { store } = await fixture(t);
  await store.save(state('before edit'));
  await store.save(state('after edit'));
  const firstBackup = await fs.readFile(store.backupPaths[0], 'utf8');
  const secondBackup = await fs.readFile(store.backupPaths[1], 'utf8');
  await store.save(state('after edit'));
  await store.save(state('after edit'));
  assert.equal(await fs.readFile(store.backupPaths[0], 'utf8'), firstBackup);
  assert.equal(await fs.readFile(store.backupPaths[1], 'utf8'), secondBackup);
});

test('rejected state cannot overwrite persisted notes and later valid saves still succeed', async t => {
  const { store } = await fixture(t);
  await store.save(state('keep me'));
  const bytes = await fs.readFile(store.filePath, 'utf8');
  await assert.rejects(store.save({ version: 999 }), { code: 'INVALID_STATE' });
  assert.equal(await fs.readFile(store.filePath, 'utf8'), bytes);
  await store.save(state('valid again'));
  assert.equal((await store.load()).notes[0].body, 'valid again');
});

test('corrupt primary recovers backup without writing, then archives original before saving', async t => {
  const { directory, store } = await fixture(t);
  await store.save(state('earlier'));
  await store.save(state('latest'));
  const corrupt = '{"notes": [ TRUNCATED';
  await fs.writeFile(store.filePath, corrupt);
  const recovered = new NoteStore(directory);
  assert.equal((await recovered.load()).notes[0].body, 'earlier');
  assert.equal(recovered.getStatus().recoveredFrom, store.backupPaths[0]);
  assert.ok(recovered.getStatus().warning);
  assert.equal(await fs.readFile(store.filePath, 'utf8'), corrupt);
  await recovered.save(state('repaired'));
  const archives = (await fs.readdir(directory)).filter(name => name.startsWith('notes.json.corrupt-'));
  assert.equal(archives.length, 1);
  assert.equal(await fs.readFile(path.join(directory, archives[0]), 'utf8'), corrupt);
  assert.equal((await new NoteStore(directory).load()).notes[0].body, 'repaired');
});

test('second backup recovers when both primary and first backup are damaged', async t => {
  const { directory, store } = await fixture(t);
  await store.save(state('one'));
  await store.save(state('two'));
  await store.save(state('three'));
  await fs.writeFile(store.filePath, 'bad primary');
  await fs.writeFile(store.backupPaths[0], 'bad backup');
  const recovered = new NoteStore(directory);
  assert.equal((await recovered.load()).notes[0].body, 'one');
  assert.equal(recovered.getStatus().recoveredFrom, store.backupPaths[1]);
  await recovered.save(state('after recovery'));
  const archives = (await fs.readdir(directory)).filter(name => name.includes('.corrupt-'));
  assert.equal(archives.length, 2);
  const texts = await Promise.all(archives.map(name => fs.readFile(path.join(directory, name), 'utf8')));
  assert.deepEqual(texts.sort(), ['bad backup', 'bad primary']);
});

test('missing primary still recovers an existing valid backup', async t => {
  const { directory, store } = await fixture(t);
  await fs.writeFile(store.backupPaths[0], serializeState(state('backup only')));
  assert.equal((await store.load()).notes[0].body, 'backup only');
  await store.save(state('restored file'));
  assert.equal((await new NoteStore(directory).load()).notes[0].body, 'restored file');
});

test('unrecoverable data blocks both load and save and preserves every original byte', async t => {
  const { directory, store } = await fixture(t);
  const files = [store.filePath, ...store.backupPaths];
  await Promise.all(files.map((file, index) => fs.writeFile(file, `unreadable original ${index}`)));
  const before = await Promise.all(files.map(file => fs.readFile(file, 'utf8')));
  await assert.rejects(store.load(), { code: 'RECOVERY_REQUIRED' });
  await assert.rejects(store.save(state('must not replace')), { code: 'RECOVERY_REQUIRED' });
  assert.deepEqual(await Promise.all(files.map(file => fs.readFile(file, 'utf8'))), before);
  assert.equal((await fs.readdir(directory)).length, 3);
});

test('external edits are detected rather than overwritten by a stale instance', async t => {
  const { directory, store } = await fixture(t);
  await store.save(state('known'));
  const external = serializeState(state('changed externally'));
  await fs.writeFile(store.filePath, external);
  await assert.rejects(store.save(state('stale write')), { code: 'EXTERNAL_CHANGE' });
  await assert.rejects(store.flush(), { code: 'EXTERNAL_CHANGE' });
  assert.equal(await fs.readFile(store.filePath, 'utf8'), external);
  assert.equal((await new NoteStore(directory).load()).notes[0].body, 'changed externally');
});

test('failed backup write does not replace the main file; queue can recover', async t => {
  const { directory, store } = await fixture(t);
  await store.save(state('keep this version'));
  const original = await fs.readFile(store.filePath, 'utf8');
  // A directory at the second backup path forces a real filesystem failure.
  await fs.mkdir(store.backupPaths[1]);
  await assert.rejects(store.save(state('write must fail')));
  assert.equal(await fs.readFile(store.filePath, 'utf8'), original);
  await fs.rmdir(store.backupPaths[1]);
  await store.save(state('subsequent save works'));
  assert.equal((await new NoteStore(directory).load()).notes[0].body, 'subsequent save works');
});

test('atomic writer replaces complete UTF-8 file and removes temporary files', async t => {
  const { directory } = await fixture(t);
  const destination = path.join(directory, 'export.md');
  await fs.writeFile(destination, 'old');
  await atomicWrite(destination, '# Nuevo\n\nMéxico 🌿');
  assert.equal(await fs.readFile(destination, 'utf8'), '# Nuevo\n\nMéxico 🌿');
  assert.deepEqual(await fs.readdir(directory), ['export.md']);
});
