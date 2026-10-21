const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os');
const {decodeMarkdown,markdownPaths,readMarkdownFiles}=require('./markdown-files.cjs');
test('Markdown files decode UTF-8 and UTF-16 without changing source content',()=>{
 assert.equal(decodeMarkdown(Buffer.from('\uFEFF# Apuntes\r\nEspañol')), '# Apuntes\nEspañol');
 assert.equal(decodeMarkdown(Buffer.from('\uFEFF# México','utf16le')),'# México');
 assert.throws(()=>decodeMarkdown(Buffer.from([0xff,0x00,0x00])));
 assert.throws(()=>decodeMarkdown(Buffer.from('abc\0def')));
 const files=markdownPaths(['--debug','un archivo.MD','program.exe','un archivo.MD']);
 assert.equal(files.length,1);assert.ok(files[0].endsWith('un archivo.MD'));
});
test('opening a batch isolates failed files and never writes to the originals',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'tinta-open-'));
 try{
  const good=path.join(dir,'fórmulas.md'),bad=path.join(dir,'binary.md');
  await fs.writeFile(good,'# Fórmulas\n\n$x^2$');await fs.writeFile(bad,Buffer.from([0,1,2]));
  const result=await readMarkdownFiles([good,bad,path.join(dir,'missing.md')]);
  assert.deepEqual(result.files,[{name:'fórmulas',body:'# Fórmulas\n\n$x^2$'}]);assert.equal(result.errors.length,2);
  assert.equal(await fs.readFile(good,'utf8'),'# Fórmulas\n\n$x^2$');
  await assert.rejects(readMarkdownFiles(Array(51).fill(good)));
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});
