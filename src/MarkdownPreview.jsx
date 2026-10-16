import React, { useEffect, useMemo, useRef } from 'react'
import { Marked } from 'marked'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js'
import { resolveWikiTarget } from './wiki'
import './editor.css'
import {parseCodeInfo} from './codeBlocks.js'
import {highlightLines} from './highlightLines.js'
import {renderDiagrams} from './diagrams.js'
import {renderScience} from './science.js'
import {installPreviewControls} from './previewControls.js'

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])
}

export function renderMarkdown(value, notes) {
  let taskIndex = 0
  const markdown = new Marked({
    gfm: true,
    breaks: true,
    renderer: {
      html({ text }) {
        // Only our renderers may attach interactive note/task metadata.
        return DOMPurify.sanitize(text, { ALLOW_DATA_ATTR: false, FORBID_ATTR: ['data-note-id', 'data-task-index', 'data-wiki-create'] })
      },
      code({ text, lang }) {
        const {language,filename,title,line}=parseCodeInfo(lang)
        if(language.toLowerCase()==='mermaid')return `<pre class="mermaid-source">${escapeHTML(text)}</pre>`
        if(['math','latex','tex'].includes(language.toLowerCase()))return `<pre class="math-source">${escapeHTML(text)}</pre>`
        if(language.toLowerCase()==='plot')return `<pre class="plot-source">${escapeHTML(text)}</pre>`
        let content = escapeHTML(text)
        if (language && hljs.getLanguage(language)) {
          try { content = hljs.highlight(text, { language, ignoreIllegals: true }).value } catch { /* Keep escaped plain text for invalid grammars. */ }
        }
        const header=filename||title||line?`<div class="code-file-header">${title?`<b>${escapeHTML(title)}</b>`:''}${filename?`<span class="code-filename">${escapeHTML(filename)}</span>`:''}${line?`<small>Línea ${line}</small>`:''}</div>`:''
        const numbered=line?highlightLines(content).map((html,i)=>`<span class="code-row"><span class="code-line-numbers" aria-hidden="true">${line+i}</span><span class="code-source">${html}</span></span>`).join(''):`<span class="code-source">${content}</span>`
        return `${header?'<section class="code-with-file">'+header:''}<pre class="code-block"${language ? ` data-language="${escapeHTML(language)}"` : ''}><code class="hljs${line?' has-line-numbers':''}${language ? ` language-${escapeHTML(language)}` : ''}">${numbered}</code></pre>${header?'</section>':''}`
      },
      checkbox({ checked }) {
        return `<input type="checkbox" class="markdown-task" data-task-index="${taskIndex++}" aria-label="Marcar tarea"${checked ? ' checked' : ''}> `
      },
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens)
        return `<a href="${escapeHTML(href)}"${title ? ` title="${escapeHTML(title)}"` : ''} rel="noopener noreferrer">${text}</a>`
      },
    },
    extensions: [{name:'displayMath',level:'block',start(src){return src.indexOf('$$')},tokenizer(src){const m=/^\$\$[ \t]*\n?([\s\S]+?)\n?\$\$(?:\n|$)/.exec(src);if(m)return {type:'displayMath',raw:m[0],text:m[1]};},renderer(t){return `<pre class="math-source">${escapeHTML(t.text)}</pre>`;}},{name:'inlineMath',level:'inline',start(src){return src.search(/\$|\\\(/)},tokenizer(src){const m=/^\$(?!\s)([^$\n]*?\S)\$(?!\d)/.exec(src)||/^\\\(([\s\S]+?)\\\)/.exec(src);if(m)return {type:'inlineMath',raw:m[0],text:m[1]};},renderer(t){return `<span class="math-source">${escapeHTML(t.text)}</span>`;}},{
      name: 'wikilink', level: 'inline',
      start(src) { return src.indexOf('[[') },
      tokenizer(src) {
        const match = /^\[\[([^\]\n]+)\]\]/.exec(src)
        if (match) return { type: 'wikilink', raw: match[0], target: match[1] }
      },
      renderer(token) {
        const [target, ...aliasParts] = token.target.split('|')
        const name = target.trim()
        const note = resolveWikiTarget(name, notes)
        const label = aliasParts.length ? aliasParts.join('|').trim() : (note?.title || name)
        if (!name) return escapeHTML(token.raw)
        if (!note) return `<a class="wiki-link missing" href="#create-note" data-wiki-create="${escapeHTML(name)}" title="Crear nota: ${escapeHTML(name)}">${escapeHTML(label)}</a>`
        return `<a class="wiki-link" href="#note=${encodeURIComponent(note.id)}" data-note-id="${escapeHTML(note.id)}" title="Abrir ${escapeHTML(note.title || 'Sin título')}">${escapeHTML(label)}</a>`
      },
    }],
  })
  return DOMPurify.sanitize(markdown.parse(value || ''), {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['style', 'form', 'button', 'textarea', 'select', 'option', 'iframe', 'video', 'audio', 'object', 'embed'],
    FORBID_ATTR: ['style', 'srcset', 'formaction', 'action', 'autofocus'],
    ADD_ATTR: ['data-note-id', 'data-task-index', 'data-wiki-create', 'data-language', 'target'],
  })
}

export default function MarkdownPreview({ value = '', notes = [], onNavigate, onCreateNote, onToggleTask, scrollRatio, theme='dark' }) {
  const containerRef = useRef(null)
  const html = useMemo(() => renderMarkdown(value, notes), [value, notes])

  useEffect(() => {
    const container = containerRef.current
    if (!container || scrollRatio == null || !Number.isFinite(scrollRatio)) return
    container.scrollTop = Math.max(0, Math.min(1, scrollRatio)) * (container.scrollHeight - container.clientHeight)
  }, [scrollRatio])

  useEffect(()=>{let alive=true,cleanup;const article=containerRef.current?.querySelector('.markdown-body');if(article){article.innerHTML=html;void Promise.all([renderDiagrams(article,theme,()=>alive),renderScience(article,theme,()=>alive)]).then(()=>{if(alive)cleanup=installPreviewControls(article,()=>alive);});}return()=>{alive=false;cleanup?.();};},[html,theme])

  useEffect(() => {
    // Apply after resetting the preview, including when only its theme changes.
    // Only Markdown-generated tasks can edit the document; arbitrary HTML controls stay inert.
    const container = containerRef.current
    container.querySelectorAll('input').forEach(input => {
      input.disabled = !input.classList.contains('markdown-task') || input.type !== 'checkbox' || input.dataset.taskIndex == null || !onToggleTask
    })
    container.querySelectorAll('img').forEach(img => { img.loading = 'lazy'; img.decoding = 'async' })
    // Raw rendered Markdown inputs are not React-controlled nodes, so listen to the native event.
    function change(event) {
      const input = event.target
      if (!input.matches('input.markdown-task[type="checkbox"]') || input.dataset.taskIndex == null) return
      const index = Number(input.dataset.taskIndex)
      if (Number.isInteger(index) && index >= 0) onToggleTask?.(index, input.checked)
    }
    container.addEventListener('change', change)
    return () => container.removeEventListener('change', change)
  }, [html, theme, onToggleTask])

  async function onClick(event) {
    const anchor = event.target.closest?.('a')
    if (!anchor) return
    const id = anchor.dataset.noteId
    if (id) {
      event.preventDefault()
      if (resolveWikiTarget(id, notes)) onNavigate?.(id)
      return
    }
    const title = anchor.dataset.wikiCreate
    if (title) {
      event.preventDefault()
      const existing = resolveWikiTarget(title, notes)
      const created = existing || await onCreateNote?.(title)
      if (created?.id) onNavigate?.(created.id)
      return
    }
    const href = anchor.getAttribute('href') || ''
    event.preventDefault()
    if (/^https?:\/\//i.test(href)) window.open(href, '_blank', 'noopener,noreferrer')
  }

  return <div className="markdown-preview" ref={containerRef} onClick={onClick} aria-label="Vista previa de la nota">
    {value.trim() ? <article className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} /> : <div className="preview-empty"><span>Tu próxima idea empieza aquí.</span><small>La vista previa se actualiza mientras escribes.</small></div>}
  </div>
}
