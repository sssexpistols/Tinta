// Wiki links use stable note IDs; human-written [[titles]] remain supported.
export function normalizeTitle(title = '') {
  return String(title).normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase()
}

export function resolveWikiTarget(target, notes = []) {
  const name = String(target || '').trim()
  if (!name) return undefined
  const live = notes.filter(note => !note.deletedAt && !note.isTemplate)
  return live.find(note => note.id === name) || live.find(note => normalizeTitle(note.title) === normalizeTitle(name))
}

export function makeWikiLink(note) {
  const label = String(note.title || 'Sin título').replace(/[\[\]|\r\n]/g, ' ').replace(/\s+/g, ' ').trim() || 'Sin título'
  return `[[${note.id}|${label}]]`
}

function escapedAt(text, position) {
  let count = 0
  while (position > 0 && text[--position] === '\\') count++
  return count % 2 === 1
}

// Mask code without changing UTF-16 positions, so callers can safely edit ranges.
function codeMask(text) {
  const mask = new Uint8Array(text.length)
  let fence = null
  let position = 0
  for (const line of text.match(/[^\n]*(?:\n|$)/g) || []) {
    if (!line) continue
    // Also recognize fenced code nested in a Markdown blockquote.
    const content = line.replace(/^(?: {0,3}> ?)+/, '')
    const delimiter = /^ {0,3}(`{3,}|~{3,})(.*)/.exec(content)
    if (fence) {
      mask.fill(1, position, position + line.length)
      if (delimiter && delimiter[1][0] === fence.char && delimiter[1].length >= fence.length && !delimiter[2].trim()) fence = null
    } else if (delimiter && (delimiter[1][0] !== '`' || !delimiter[2].includes('`'))) {
      fence = { char: delimiter[1][0], length: delimiter[1].length }
      mask.fill(1, position, position + line.length)
    }
    position += line.length
  }
  for (let i = 0; i < text.length; i++) {
    if (mask[i] || text[i] !== '`' || escapedAt(text, i)) continue
    let end = i + 1
    while (text[end] === '`') end++
    const length = end - i
    let cursor = end
    while (cursor < text.length) {
      if (mask[cursor]) break
      if (text[cursor] !== '`') { cursor++; continue }
      let closing = cursor + 1
      while (text[closing] === '`') closing++
      if (closing - cursor === length) {
        mask.fill(1, i, closing)
        end = closing
        break
      }
      cursor = closing
    }
    i = end - 1
  }
  return mask
}

export function scanWikiLinks(body = '') {
  const text = String(body)
  const mask = codeMask(text)
  const links = []
  for (const match of text.matchAll(/\[\[([^\[\]\r\n]+)\]\]/g)) {
    const from = match.index
    const to = from + match[0].length
    if (mask[from] || escapedAt(text, from)) continue
    const [targetPart, ...alias] = match[1].split('|')
    const target = targetPart.trim()
    if (!target) continue
    links.push({ from, to, target, label: alias.length ? alias.join('|').trim() : target, raw: match[0] })
  }
  return links
}

export function getBacklinks(note, notes = []) {
  if (!note || note.deletedAt || note.isTemplate) return []
  const seen = new Set()
  return notes.filter(source => {
    if (source.id === note.id || source.deletedAt || source.isTemplate || seen.has(source.id)) return false
    if (!scanWikiLinks(source.body).some(link => resolveWikiTarget(link.target, notes)?.id === note.id)) return false
    seen.add(source.id)
    return true
  })
}

// Upgrade legacy title references before a rename. Explicit aliases are kept.
export function renameWikiLinks(body, oldNote, newTitle, notes = []) {
  if (!oldNote || oldNote.title === newTitle) return body
  let result = String(body || '')
  for (const link of scanWikiLinks(result).reverse()) {
    if (link.target === oldNote.id || resolveWikiTarget(link.target, notes)?.id !== oldNote.id) continue
    const hasAlias = link.raw.slice(2, -2).includes('|')
    const replacement = hasAlias ? `[[${oldNote.id}|${link.label}]]` : makeWikiLink({ ...oldNote, title: newTitle })
    result = result.slice(0, link.from) + replacement + result.slice(link.to)
  }
  return result
}
