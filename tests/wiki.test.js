import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeTitle, resolveWikiTarget, makeWikiLink, scanWikiLinks, getBacklinks, renameWikiLinks } from '../src/wiki.js'

const target = { id: 'note-a', title: 'Mi nueva nota', body: '' }
const notes = [target, { id: 'trash', title: 'Borrada', deletedAt: '2026-10-14' }, { id: 'template', title: 'Plantilla', isTemplate: true }]

test('title lookup accepts spaces, casing, and Unicode normalization; IDs have priority', () => {
  assert.equal(normalizeTitle('  Mi   NUEVA nota '), 'mi nueva nota')
  assert.equal(resolveWikiTarget(' mi  Nueva NOTA ', notes), target)
  assert.equal(resolveWikiTarget(' note-a ', notes), target)
  assert.equal(normalizeTitle('Cafe\u0301'), normalizeTitle('Café'))
  assert.equal(resolveWikiTarget('Borrada', notes), undefined)
  assert.equal(resolveWikiTarget('trash', notes), undefined)
  assert.equal(resolveWikiTarget('Plantilla', notes), undefined)
  assert.equal(resolveWikiTarget('', notes), undefined)
})

test('generated links keep pointing to their ID after renames and sanitize delimiters', () => {
  const text = makeWikiLink(target)
  assert.equal(text, '[[note-a|Mi nueva nota]]')
  const [link] = scanWikiLinks(text)
  const renamed = { ...target, title: 'Otro nombre' }
  assert.equal(resolveWikiTarget(link.target, [renamed]), renamed)
  assert.equal(makeWikiLink({ id: 'safe', title: 'A [B]|\nC' }), '[[safe|A B C]]')
})

test('scanner reports precise offsets, targets and aliases, including multiword titles', () => {
  const body = '💡 [[ Mi nueva nota ]] y [[note-a|Mi alias con espacios]]'
  const links = scanWikiLinks(body)
  assert.equal(links.length, 2)
  assert.equal(links[0].target, 'Mi nueva nota')
  assert.equal(links[1].label, 'Mi alias con espacios')
  for (const link of links) assert.equal(body.slice(link.from, link.to), link.raw)
})

test('code examples and escaped brackets do not become relationships', () => {
  const body = ['`[[inline]]`', '`` ` [[long-inline]] ``', '```md', '[[fenced]]', '```', '~~~', '[[tilde]]', '~~~', '> ```', '> [[quoted-code]]', '> ```', '\\[[escaped]]', '[[real]]'].join('\n')
  assert.deepEqual(scanWikiLinks(body).map(link => link.target), ['real'])
  assert.deepEqual(scanWikiLinks('```\n[[unclosed fence]]'), [])
  assert.equal(scanWikiLinks('an unmatched ` then [[real]]')[0].target, 'real')
})

test('backlinks deduplicate sources and exclude self, templates, trash and code', () => {
  const source = { id: 'source', body: '[[Mi nueva nota]] and [[note-a|Alias]]' }
  const all = [target, source, source, { id: 'example', body: '`[[note-a]]`' }, { id: 'template', body: '[[note-a]]', isTemplate: true }, { id: 'deleted', body: '[[note-a]]', deletedAt: 'today' }]
  assert.deepEqual(getBacklinks(target, all).map(note => note.id), ['source'])
  assert.deepEqual(getBacklinks({ ...target, deletedAt: 'today' }, all), [])
})

test('renaming upgrades legacy title links but preserves aliases, IDs and examples', () => {
  const body = '[[ mi NUEVA  nota ]] [[Mi nueva nota|Alias]] [[note-a|Original]] `[[Mi nueva nota]]` [[Otra]]'
  const updated = renameWikiLinks(body, target, 'Nombre nuevo', notes)
  assert.equal(updated, '[[note-a|Nombre nuevo]] [[note-a|Alias]] [[note-a|Original]] `[[Mi nueva nota]]` [[Otra]]')
  assert.equal(getBacklinks({ ...target, title: 'Nombre nuevo' }, [{ ...target, title: 'Nombre nuevo' }, { id: 'source', body: updated }]).length, 1)
})
