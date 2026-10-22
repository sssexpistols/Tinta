const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const calloutNames = {note:'Nota',tip:'Consejo',important:'Importante',warning:'Atención',question:'Pregunta',example:'Ejemplo',summary:'Resumen',quote:'Cita'};

// Per-document state: footnote numbering and definitions never leak between notes.
export function studyMarkdown(markdown) {
  const definitions = new Map(), references = new Map();
  const key = text => text.trim().toLocaleLowerCase();
  return {
    extensions: [
      {
        name:'studyDetails', level:'block',
        start(src) { return src.indexOf('<details>'); },
        tokenizer(src) {
          const match = /^<details>\s*<summary>([^<\n]+)<\/summary>\s*\n([\s\S]*?)\n<\/details>(?:\n|$)/i.exec(src);
          if (match) return {type:'studyDetails',raw:match[0],title:match[1],body:match[2]};
        },
        renderer(token) { return `<details class="study-recall"><summary>${escapeHTML(token.title)}</summary>${markdown.parse(token.body)}</details>`; },
      },
      {
        name:'highlight', level:'inline',
        start(src) { return src.indexOf('=='); },
        tokenizer(src) {
          const match = /^==(?=\S)([^\n]+?\S|[^\s=])==/.exec(src);
          if (match) return {type:'highlight', raw:match[0], tokens:this.lexer.inlineTokens(match[1])};
        },
        renderer(token) { return `<mark>${this.parser.parseInline(token.tokens)}</mark>`; },
      },
      {
        name:'footnoteDefinition', level:'block',
        start(src) { return src.search(/^\[\^[^\]\n]+\]:/m); },
        tokenizer(src) {
          const match = /^\[\^([^\]\n]{1,80})\]:[ \t]*([^\n]*(?:\n(?: {4}|\t)[^\n]*)*)(?:\n|$)/.exec(src);
          if (!match) return;
          if (definitions.size < 100) definitions.set(key(match[1]), match[2].replace(/\n(?: {4}|\t)/g, '\n'));
          return {type:'footnoteDefinition',raw:match[0]};
        },
        renderer() { return ''; },
      },
      {
        name:'footnoteReference', level:'inline',
        start(src) { return src.indexOf('[^'); },
        tokenizer(src) {
          const match = /^\[\^([^\]\n]{1,80})\]/.exec(src);
          if (match) return {type:'footnoteReference',raw:match[0],id:key(match[1])};
        },
        renderer(token) {
          if (!definitions.has(token.id)) return escapeHTML(token.raw);
          if (!references.has(token.id)) references.set(token.id, {number:references.size+1,count:0});
          const ref = references.get(token.id), occurrence = ++ref.count;
          return `<sup class="footnote-ref" id="fnref-${ref.number}-${occurrence}"><a href="#fn-${ref.number}" aria-label="Nota al pie ${ref.number}">${ref.number}</a></sup>`;
        },
      },
    ],
    renderer: {
      blockquote({text,tokens}) {
        const match = /^\[!(NOTE|TIP|IMPORTANT|WARNING|QUESTION|EXAMPLE|SUMMARY|QUOTE)\][ \t]*([^\n]*)(?:\n|$)/i.exec(text);
        if (!match) return `<blockquote>${this.parser.parse(tokens)}</blockquote>`;
        const type = match[1].toLowerCase();
        return `<aside class="study-callout callout-${type}"><div class="callout-title">${escapeHTML(match[2] || calloutNames[type])}</div>${markdown.parse(text.slice(match[0].length))}</aside>`;
      },
    },
    footnotes() {
      if (!references.size) return '';
      const entries = [];
      for (const [id, ref] of references) {
        const body = markdown.parse(definitions.get(id));
        entries.push(`<li id="fn-${ref.number}">${body}<a class="footnote-back" href="#fnref-${ref.number}-1" aria-label="Volver a la referencia ${ref.number}">↩</a></li>`);
      }
      return `<section class="footnotes" aria-label="Notas al pie"><hr><ol>${entries.join('')}</ol></section>`;
    },
  };
}
