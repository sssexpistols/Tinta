'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
const EXTENSIONS = new Set(['.md', '.markdown', '.mdown', '.txt']);
const MAX_FILE = 16 * 1024 * 1024;
function markdownPaths(args, cwd = process.cwd()) {
  return [...new Set(args.filter(value => typeof value === 'string' && !value.startsWith('-') && EXTENSIONS.has(path.extname(value).toLowerCase())).map(value => path.resolve(cwd, value)))];
}
function decodeMarkdown(bytes) {
  if (bytes.length > MAX_FILE) throw new Error('El archivo supera 16 MB.');
  let encoding = 'utf-8';
  if (bytes[0] === 0xff && bytes[1] === 0xfe) encoding = 'utf-16le';
  if (bytes[0] === 0xfe && bytes[1] === 0xff) encoding = 'utf-16be';
  let text;
  try { text = new TextDecoder(encoding, { fatal: true }).decode(bytes); }
  catch { throw new Error('Guarda el archivo como UTF-8 o UTF-16 para abrirlo en Tinta.'); }
  if (text.includes('\0')) throw new Error('El archivo contiene datos binarios; se esperaba Markdown.');
  return text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
}
async function readMarkdownFiles(paths) {
  if (paths.length > 50) throw new Error('Abre hasta 50 archivos a la vez.');
  const files = [], errors = [];
  let total = 0;
  for (const filePath of [...new Set(paths)]) {
    try {
      if (!EXTENSIONS.has(path.extname(filePath).toLowerCase())) throw new Error('Extensión no compatible.');
      const handle = await fs.open(filePath, 'r');
      try {
        const stat = await handle.stat();
        if (!stat.isFile() || stat.size > MAX_FILE) throw new Error('El archivo no es texto o supera 16 MB.');
        if (total + stat.size > 48 * 1024 * 1024) throw new Error('El grupo de archivos supera 48 MB.');
        // Bound the actual read as well, in case a file grows after stat().
        const bytes = Buffer.alloc(stat.size + 1);
        let bytesRead=0;
        while(bytesRead<bytes.length){
          const chunk=await handle.read(bytes,bytesRead,bytes.length-bytesRead,bytesRead);
          if(!chunk.bytesRead)break;
          bytesRead+=chunk.bytesRead;
        }
        if (bytesRead !== stat.size) throw new Error('El archivo cambió mientras se abría; vuelve a intentarlo.');
        files.push({name:path.basename(filePath, path.extname(filePath)), body:decodeMarkdown(bytes.subarray(0, bytesRead))});
        total += bytesRead;
      } finally { await handle.close(); }
    } catch (error) { errors.push(`${path.basename(filePath)}: ${error.message}`); }
  }
  return {files, errors};
}
module.exports = {markdownPaths, decodeMarkdown, readMarkdownFiles};
