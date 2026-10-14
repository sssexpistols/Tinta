import DOMPurify from 'dompurify';
import appStyles from './styles.css?raw';
import editorStyles from './editor.css?raw';
import {renderMarkdown} from './MarkdownPreview.jsx';
import {dateLabel} from './model.js';
import {getBacklinks} from './wiki.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function buildPreviewExport(note,notes,theme,metadata=true){
 const safeTheme=['dark','light','gruvbox'].includes(theme)?theme:'dark';
 const content=document.createElement('div');content.innerHTML=renderMarkdown(note.body,notes);
 content.querySelectorAll('input').forEach(el=>el.disabled=true);
 content.querySelectorAll('a').forEach(el=>{const href=el.getAttribute('href')||'';if(!/^https?:\/\//i.test(href)){el.removeAttribute('href');el.title='Referencia interna: '+el.textContent;}el.removeAttribute('data-note-id');el.removeAttribute('data-wiki-create');});
 const backlinks=getBacklinks(note,notes).map(n=>`<span class="export-backlink">↙ ${esc(n.title)}</span>`).join(' ');
 const context=metadata?`<div class="note-context"><div class="note-dates"><div><span><small>CREADA</small><time>${esc(dateLabel(note.createdAt))}</time></span></div><div><span><small>ACTUALIZADA</small><time>${esc(dateLabel(note.updatedAt))}</time></span></div></div>${backlinks?`<div class="backlinks"><small>ENLAZADAS A ESTA NOTA</small><p>${backlinks}</p></div>`:''}</div>`:'';
 return {theme:safeTheme,title:note.title,html:DOMPurify.sanitize(`${context}<article class="markdown-body">${content.innerHTML}</article>`),css:appStyles+'\n'+editorStyles+`\nhtml,body{height:auto!important;overflow:visible!important;min-height:100%;background:var(--bg-editor);color:var(--text)}body{margin:0;padding:32px;font-family:'Segoe UI',Arial,sans-serif}body>main{max-width:980px;margin:0 auto;display:block}.markdown-body{padding:0!important;overflow:visible!important}.note-context{margin-bottom:20px}.note-dates{margin:0}.export-backlink{color:var(--wiki-link,var(--accent));margin-right:12px}.markdown-body pre{white-space:pre-wrap;break-inside:avoid}.markdown-body pre code{white-space:pre-wrap;overflow-wrap:anywhere}.markdown-body table{max-width:100%;overflow:visible}img{max-width:100%}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}@page{size:A4;margin:14mm}@media print{body{padding:0}.markdown-body h1,.markdown-body h2,.markdown-body h3{break-after:avoid}.note-context,tr,img{break-inside:avoid}}`};
}
