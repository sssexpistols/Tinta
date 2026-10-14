import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { Compartment, EditorSelection, EditorState, Prec, Transaction } from '@codemirror/state'
import { EditorView, drawSelection, dropCursor, highlightSpecialChars, keymap, placeholder, rectangularSelection } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { bracketMatching, HighlightStyle, indentOnInput, syntaxHighlighting } from '@codemirror/language'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { acceptCompletion, autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap, hasNextSnippetField, nextSnippetField, snippet, startCompletion } from '@codemirror/autocomplete'
import { highlightSelectionMatches, search, searchKeymap } from '@codemirror/search'
import { tags } from '@lezer/highlight'
import './editor.css'

const markdownColors = HighlightStyle.define([
  { tag: tags.heading1, color: 'var(--syntax-heading, #ed6fbb)', fontWeight: '700', fontSize: '1.52em', lineHeight: '1.45' },
  { tag: tags.heading2, color: 'var(--syntax-heading, #ed6fbb)', fontWeight: '700', fontSize: '1.3em', lineHeight: '1.45' },
  { tag: [tags.heading3, tags.heading4, tags.heading5, tags.heading6], color: 'var(--syntax-heading, #ed6fbb)', fontWeight: '700', fontSize: '1.12em' },
  { tag: [tags.processingInstruction, tags.meta], color: 'var(--syntax-punctuation, #78b7ee)' },
  { tag: tags.strong, fontWeight: '700' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strikethrough, textDecoration: 'line-through', color: 'var(--muted)' },
  { tag: [tags.link, tags.url], color: 'var(--syntax-punctuation, #78b7ee)', textDecoration: 'underline', textUnderlineOffset: '3px' },
  { tag: [tags.monospace, tags.string], color: 'var(--syntax-string, #a6d5ad)' },
  { tag: tags.quote, color: 'var(--muted)' },
  { tag: [tags.keyword, tags.operator, tags.bool, tags.null], color: 'var(--syntax-heading, #ed6fbb)' },
  { tag: [tags.number, tags.atom], color: 'var(--syntax-number, #e6b679)' },
  { tag: [tags.function(tags.variableName), tags.className], color: 'var(--syntax-punctuation, #78b7ee)' },
  { tag: tags.comment, color: 'var(--muted)', fontStyle: 'italic' },
])

const editorTheme = EditorView.theme({
  '&': { height: '100%', backgroundColor: 'var(--bg-editor, #101112)', color: 'var(--text, #d9dce2)', fontSize: 'var(--editor-font-size, 15px)' },
  '&.cm-focused': { outline: 'none' },
  '.cm-scroller': { overflow: 'auto', fontFamily: '"Cascadia Code", "Consolas", "SFMono-Regular", monospace', lineHeight: '1.75' },
  '.cm-content': { padding: '20px 0 140px', minHeight: '100%', caretColor: 'var(--accent, #9d93f5)' },
  '.cm-line': { padding: '0 26px' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--accent, #a79dff)', borderLeftWidth: '2px' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': { backgroundColor: 'var(--editor-selection, #615b8755)' },
  '.cm-selectionMatch': { backgroundColor: 'var(--editor-selection, #615b8755)' },
  '.cm-placeholder': { color: 'var(--muted, #777d87)', fontFamily: 'inherit' },
  '.cm-matchingBracket': { backgroundColor: 'var(--editor-selection, #615b8755)', outline: '1px solid var(--accent)', borderRadius: '2px' },
  '.cm-tooltip': { border: '1px solid var(--border, #303139)', borderRadius: '9px', backgroundColor: 'var(--panel, #1c1d21)', color: 'var(--text)', boxShadow: '0 12px 36px #0005', overflow: 'hidden', fontFamily: '"Segoe UI", sans-serif' },
  '.cm-tooltip-autocomplete > ul': { fontFamily: 'inherit', maxHeight: '280px', maxWidth: '420px', minWidth: '265px', padding: '5px' },
  '.cm-tooltip-autocomplete > ul > li': { padding: '7px 9px', borderRadius: '5px', display: 'flex', alignItems: 'center', gap: '5px' },
  '.cm-tooltip-autocomplete > ul > li[aria-selected]': { backgroundColor: 'var(--editor-selection, #615b8755)', color: 'var(--text)' },
  '.cm-completionLabel': { flex: '1', fontSize: '13px' },
  '.cm-completionDetail': { fontStyle: 'normal', fontSize: '11px', color: 'var(--muted)', marginLeft: '16px' },
  '.cm-completionMatchedText': { textDecoration: 'none', color: 'var(--accent)', fontWeight: '600' },
  '.cm-completionIcon': { opacity: '.6', fontSize: '14px', width: '18px' },
  '.cm-panels': { backgroundColor: 'var(--panel, #1c1d21)', color: 'var(--text)' },
  '.cm-panels-top': { borderBottom: '1px solid var(--border)' },
  '.cm-searchMatch': { backgroundColor: '#cfa04844', outline: '1px solid #cfa04888' },
  '.cm-searchMatch.cm-searchMatch-selected': { backgroundColor: '#cfa04888' },
  '.cm-activeLine': { backgroundColor: 'transparent' },
  '.cm-selectionLayer': { zIndex: '-1' },
})

const snippetTemplates = [
  ['tabla', 'table', 'Tabla de dos columnas', '| ${Columna 1} | ${Columna 2} |\n| --- | --- |\n| ${Contenido} | ${Contenido} |\n'],
  ['tarea', 'task', 'Lista de tareas', '- [ ] ${Nueva tarea}'],
  ['lista', 'list', 'Lista con viñetas', '- ${Primer elemento}\n- ${Segundo elemento}'],
  ['numerada', 'numbered', 'Lista numerada', '1. ${Primer elemento}\n2. ${Segundo elemento}'],
  ['codigo', 'code', 'Bloque de código', '```${javascript}\n${// Tu código}\n```'],
  ['cita', 'quote', 'Cita', '> ${Escribe una cita}'],
  ['encabezado', 'heading', 'Encabezado de sección', '## ${Título}'],
  ['enlace', 'link', 'Enlace web', '[${texto}](${https://})'],
  ['imagen', 'image', 'Imagen', '![${Descripción}](${https://})'],
  ['separador', 'divider', 'Línea divisoria', '\n---\n'],
]

function getStats(text) {
  return { words: (text.match(/[\p{L}\p{N}]+(?:[’'_\-][\p{L}\p{N}]+)*/gu) || []).length, characters: text.length }
}

function completionSource(propsRef) {
  return (context) => {
    const line = context.state.doc.lineAt(context.pos)
    const before = context.state.sliceDoc(line.from, context.pos)
    const wiki = /\[\[([^\]\n]*)$/.exec(before)
    if (wiki) {
      const from = context.pos - wiki[1].length
      return {
        from,
        options: (propsRef.current.notes || []).filter(n => n.id !== propsRef.current.noteId && !n.deletedAt).map(note => ({
          label: note.title || 'Sin título', type: 'text', detail: 'Nota',
          apply(view, completion, replaceFrom, replaceTo) {
            const tail = view.state.sliceDoc(replaceTo, replaceTo + 2)
            const title = (note.title || 'Sin título').replace(/[\[\]\n|]/g, ' ')
            const sameTitles = (propsRef.current.notes || []).filter(n => (n.title || 'Sin título') === (note.title || 'Sin título') && !n.deletedAt)
            const text = sameTitles.length > 1 ? `${note.id}|${title}]]` : `${title}]]`
            view.dispatch({ changes: { from: replaceFrom, to: replaceTo + (tail === ']]' ? 2 : tail.startsWith(']') ? 1 : 0), insert: text }, selection: { anchor: replaceFrom + text.length }, userEvent: 'input.complete' })
          },
        })),
        validFor: /^[^\]\n]*$/,
      }
    }
    const slash = /(?:^|\s)\/([\p{L}]*)$/u.exec(before)
    if (!slash) return null
    const from = context.pos - slash[1].length
    const slashFrom = from - 1
    return {
      from,
      options: [
        ...snippetTemplates.map(([label, english, detail, template]) => ({
          label, displayLabel: `/${label}`, detail, type: 'keyword', boost: 1,
          apply(view, completion, replaceFrom, replaceTo) { snippet(template)(view, completion, slashFrom, replaceTo) },
          info: `/${label} · /${english}`,
        })),
        ...snippetTemplates.map(([spanish, label, detail, template]) => ({
          label, displayLabel: `/${label}`, detail, type: 'keyword', boost: -5,
          apply(view, completion, replaceFrom, replaceTo) { snippet(template)(view, completion, slashFrom, replaceTo) },
        })),
        { label: 'fecha', displayLabel: '/fecha', detail: 'Fecha de hoy', type: 'keyword', apply(view, completion, replaceFrom, replaceTo) {
          const date = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())
          view.dispatch({ changes: { from: slashFrom, to: replaceTo, insert: date }, selection: { anchor: slashFrom + date.length }, userEvent: 'input.complete' })
        } },
      ],
      validFor: /^[\p{L}]*$/u,
    }
  }
}

const MarkdownEditor = forwardRef(function MarkdownEditor({ noteId, value = '', onChange, notes = [], onNavigate, fontSize = 15, onStats, onScrollRatio }, ref) {
  const containerRef = useRef(null)
  const viewRef = useRef(null)
  const propsRef = useRef({})
  propsRef.current = { noteId, value, onChange, notes, onNavigate, fontSize, onStats, onScrollRatio }
  const activeNoteRef = useRef(noteId)
  const historiesRef = useRef(new Map())
  const suppressChange = useRef(false)
  const fontCompartment = useRef(new Compartment())
  const createStateRef = useRef(null)

  function insert(text) {
    const view = viewRef.current
    if (!view) return
    const { from, to } = view.state.selection.main
    view.dispatch({ changes: { from, to, insert: text }, selection: { anchor: from + text.length }, scrollIntoView: true, userEvent: 'input' })
    view.focus()
  }

  function wrap(before, after = before, fallback = 'texto') {
    const view = viewRef.current
    if (!view) return
    const { from, to } = view.state.selection.main
    const selected = view.state.sliceDoc(from, to)
    if (from >= before.length && view.state.sliceDoc(from - before.length, from) === before && view.state.sliceDoc(to, to + after.length) === after) {
      view.dispatch({ changes: [{ from: from - before.length, to: from, insert: '' }, { from: to, to: to + after.length, insert: '' }], selection: EditorSelection.range(from - before.length, to - before.length), scrollIntoView: true, userEvent: 'input' })
    } else {
      const content = selected || fallback
      view.dispatch({ changes: { from, to, insert: before + content + after }, selection: EditorSelection.range(from + before.length, from + before.length + content.length), scrollIntoView: true, userEvent: 'input' })
    }
    view.focus()
  }

  function prefixLines(prefix, matcher) {
    const view = viewRef.current
    if (!view) return
    const selection = view.state.selection.main
    const first = view.state.doc.lineAt(selection.from)
    const last = view.state.doc.lineAt(selection.to)
    const changes = []
    for (let number = first.number; number <= last.number; number++) {
      const line = view.state.doc.line(number)
      const existing = matcher?.exec(line.text)
      changes.push({ from: line.from, to: line.from + (existing?.[0].length || 0), insert: existing ? '' : prefix })
    }
    view.dispatch({ changes, scrollIntoView: true, userEvent: 'input' })
    view.focus()
  }

  function command(name) {
    const view = viewRef.current
    if (!view) return false
    switch (name) {
      case 'bold': wrap('**', '**', 'negrita'); break
      case 'italic': wrap('*', '*', 'cursiva'); break
      case 'strike': wrap('~~', '~~', 'texto'); break
      case 'code': {
        const selected = view.state.sliceDoc(view.state.selection.main.from, view.state.selection.main.to)
        selected.includes('\n') ? wrap('```\n', '\n```', 'código') : wrap('`', '`', 'código')
        break
      }
      case 'link': wrap('[', '](https://)', 'texto del enlace'); break
      case 'task': prefixLines('- [ ] ', /^\s*[-*+] \[[ xX]\] /); break
      case 'heading': prefixLines('## ', /^#{1,6} /); break
      case 'quote': prefixLines('> ', /^> /); break
      case 'list': prefixLines('- ', /^[-*+] /); break
      case 'table': {
        const { from, to } = view.state.selection.main
        const atLineStart = view.state.doc.lineAt(from).from === from
        snippet(`${atLineStart ? '' : '\n\n'}| \${Columna 1} | \${Columna 2} |\n| --- | --- |\n| \${Contenido} | \${Contenido} |\n`)(view, { label: 'tabla' }, from, to)
        view.focus()
        break
      }
      case 'autocomplete': startCompletion(view); break
      default: return false
    }
    return true
  }

  useImperativeHandle(ref, () => ({ focus: () => viewRef.current?.focus(), insert, wrap, command }), [])

  useEffect(() => {
    const source = completionSource(propsRef)
    createStateRef.current = (doc) => EditorState.create({
      doc,
      extensions: [
        history(), drawSelection(), dropCursor(), highlightSpecialChars(), rectangularSelection(),
        EditorState.allowMultipleSelections.of(true), EditorView.lineWrapping,
        markdown({ base: markdownLanguage, codeLanguages: languages, completeHTMLTags: false }),
        indentOnInput(), bracketMatching(), closeBrackets(), syntaxHighlighting(markdownColors),
        autocompletion({ override: [source], activateOnTyping: true, icons: true, defaultKeymap: false, maxRenderedOptions: 20 }),
        Prec.highest(keymap.of([
          { key: 'Tab', run: v => hasNextSnippetField(v.state) ? nextSnippetField(v) : acceptCompletion(v) },
          ...completionKeymap,
        ])),
        search({ top: true }), highlightSelectionMatches(),
        keymap.of([
          { key: 'Mod-b', run: () => command('bold') },
          { key: 'Mod-i', run: () => command('italic') },
          { key: 'Mod-Shift-k', run: () => command('link') },
          ...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap, ...searchKeymap, indentWithTab,
        ]),
        placeholder('Empieza a escribir… / para insertar, [[ para enlazar una nota'),
        editorTheme,
        fontCompartment.current.of(EditorView.theme({ '&': { fontSize: `${propsRef.current.fontSize}px` } })),
        EditorView.contentAttributes.of({ 'aria-label': 'Contenido de la nota en Markdown', spellcheck: 'true', autocapitalize: 'off', autocorrect: 'off' }),
        EditorView.updateListener.of(update => {
          if (!update.docChanged) return
          const nextValue = update.state.doc.toString()
          if (!suppressChange.current) propsRef.current.onChange?.(nextValue)
          propsRef.current.onStats?.(getStats(nextValue))
        }),
        EditorView.domEventHandlers({
          scroll(event, view) {
            if (event.target !== view.scrollDOM) return
            const max = view.scrollDOM.scrollHeight - view.scrollDOM.clientHeight
            propsRef.current.onScrollRatio?.(max > 0 ? view.scrollDOM.scrollTop / max : 0)
          },
          mousedown(event, view) {
            if (!event.ctrlKey && !event.metaKey) return false
            const pos = view.posAtCoords({ x: event.clientX, y: event.clientY })
            if (pos == null) return false
            const line = view.state.doc.lineAt(pos)
            for (const match of line.text.matchAll(/\[\[([^\]\n]+)\]\]/g)) {
              if (pos < line.from + match.index || pos > line.from + match.index + match[0].length) continue
              const target = match[1].split('|')[0].trim()
              const note = propsRef.current.notes.find(n => !n.deletedAt && (n.id === target || n.title?.toLocaleLowerCase() === target.toLocaleLowerCase()))
              if (note) { event.preventDefault(); propsRef.current.onNavigate?.(note.id); return true }
            }
            return false
          },
        }),
      ],
    })
    const view = new EditorView({ state: createStateRef.current(propsRef.current.value), parent: containerRef.current })
    viewRef.current = view
    activeNoteRef.current = propsRef.current.noteId
    propsRef.current.onStats?.(getStats(propsRef.current.value))
    return () => { view.destroy(); viewRef.current = null }
  }, [])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    suppressChange.current = true
    try {
      if (noteId !== activeNoteRef.current) {
        historiesRef.current.set(activeNoteRef.current, { state: view.state, scroll: view.scrollDOM.scrollTop })
        // Bound the undo cache so long sessions do not retain every opened document.
        if (historiesRef.current.size > 40) historiesRef.current.delete(historiesRef.current.keys().next().value)
        const cached = historiesRef.current.get(noteId)
        view.setState(cached?.state.doc.toString() === value ? cached.state : createStateRef.current(value))
        activeNoteRef.current = noteId
        view.dispatch({ effects: fontCompartment.current.reconfigure(EditorView.theme({ '&': { fontSize: `${propsRef.current.fontSize}px` } })) })
        view.scrollDOM.scrollTop = cached?.scroll || 0
        propsRef.current.onStats?.(getStats(value))
      } else if (view.state.doc.toString() !== value) {
        // Map the cursor through only the changed range (checkboxes, imports, undo outside the editor).
        const previous = view.state.doc.toString()
        let start = 0
        while (start < previous.length && start < value.length && previous[start] === value[start]) start++
        let oldEnd = previous.length, newEnd = value.length
        while (oldEnd > start && newEnd > start && previous[oldEnd - 1] === value[newEnd - 1]) { oldEnd--; newEnd-- }
        view.dispatch({ changes: { from: start, to: oldEnd, insert: value.slice(start, newEnd) }, annotations: Transaction.addToHistory.of(false) })
      }
    } finally { suppressChange.current = false }
  }, [noteId, value])

  useEffect(() => {
    viewRef.current?.dispatch({ effects: fontCompartment.current.reconfigure(EditorView.theme({ '&': { fontSize: `${fontSize}px` } })) })
  }, [fontSize])

  return <div className="markdown-editor" ref={containerRef} />
})

export default MarkdownEditor
