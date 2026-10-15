import test from 'node:test';
import assert from 'node:assert/strict';
import hljs from 'highlight.js';
import {highlightLines} from '../src/highlightLines.js';
import {emptyConfirmedTrash} from '../src/trash.js';

test('multiline highlight tokens stay balanced across blank, nested and Unicode lines',()=>{
  const source='/* comentario largo\n\n  continúa aquí */\nconst html = "<tag> & texto";';
  const html=hljs.highlight(source,{language:'javascript'}).value;
  const lines=highlightLines(html);
  assert.equal(lines.length,source.split('\n').length);
  for(const line of lines)assert.equal((line.match(/<span\b/g)||[]).length,(line.match(/<\/span>/g)||[]).length);
  assert.ok(lines[0].includes('hljs-comment')&&lines[1].includes('hljs-comment')&&lines[2].includes('hljs-comment'));
  const plain=lines.join('\n').replace(/<[^>]*>/g,'').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#x27;/g,"'").replace(/&amp;/g,'&');
  assert.equal(plain,source);
});
test('confirmed empty trash preserves live, restored and newly trashed notes',()=>{
  const state={selectedNoteId:'old',notes:[{id:'old',deletedAt:'today'},{id:'restored',deletedAt:null},{id:'new',deletedAt:'today'},{id:'live',deletedAt:null}]};
  const result=emptyConfirmedTrash(state,['old','restored']);
  assert.deepEqual(result.notes.map(n=>n.id),['restored','new','live']);
  assert.equal(result.selectedNoteId,'restored');assert.equal(state.notes.length,4);
});
test('emptying the last note leaves a valid empty selection and is idempotent',()=>{
  const result=emptyConfirmedTrash({notes:[{id:'last',deletedAt:'today'}],selectedNoteId:'last'},['last']);
  assert.deepEqual(result,{notes:[],selectedNoteId:''});
  assert.deepEqual(emptyConfirmedTrash(result,['last']),result);
});
