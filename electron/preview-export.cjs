'use strict';
function escape(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function previewDocument(payload){
 if(!payload||!['html','pdf'].includes(payload.format)||!['dark','light','gruvbox'].includes(payload.theme)||typeof payload.html!=='string'||typeof payload.css!=='string'||payload.html.length>32*1024*1024||payload.css.length>200000)throw new Error('Vista previa no válida.');
 // Renderer HTML is sanitized. This first policy also keeps exported files inert.
 const policy="default-src 'none'; style-src 'unsafe-inline'; img-src data: https:; font-src 'none'; base-uri 'none'; form-action 'none'";
 return `<!doctype html><html lang="es" data-theme="${payload.theme}"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${policy}"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(payload.title||'Nota')}</title><style>${payload.css.replace(/<\/style/gi,'')}</style></head><body><main>${payload.html}</main></body></html>`;
}
module.exports={previewDocument};
