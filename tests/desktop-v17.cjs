const {_electron:electron}=require('playwright'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'.test-results','v17-'+Date.now()),results=[],errors=[];
let app,page;
const pass=message=>{results.push(message);console.log('PASS '+message);};
async function body(value){await page.locator('.cm-content').click();await page.keyboard.press('Control+a');await page.keyboard.insertText(value);}
async function text(){return page.locator('.cm-content').evaluate(el=>el.cmTile.root.view.state.doc.toString());}
async function saved(){await page.keyboard.press('Control+s');await page.waitForFunction(()=>document.querySelector('.sidebar-footer').textContent.includes('Guardado en este equipo'));return JSON.parse(await fs.readFile(path.join(dir,'notes.json'),'utf8'));}
const diagrams=[
 'flowchart TD\n A["Una explicación suficientemente larga para comprobar que las palabras permanecen completas dentro del nodo"] --> B["Resultado de la comprobación"]',
 'sequenceDiagram\n participant A as Una persona con un nombre largo que necesita varias líneas\n participant B as Servicio de procesamiento\n A->>B: Este mensaje describe una operación con muchas palabras que no deben cortarse\n Note over A,B: Una nota muy larga sobre el proceso completo y el resultado esperado para todas las personas que participan',
 'stateDiagram-v2\n state "La solicitud está esperando una revisión detallada por la persona responsable" as Revision\n [*] --> Revision\n Revision --> [*]',
 'classDiagram\n class RegistroDeResultados {\n +String descripcionDeLaOperacion\n +guardarResultadoValidado()\n }',
 'erDiagram\n USUARIO ||--o{ APUNTE : escribe\n APUNTE {\n string contenidoMarkdown\n string tituloDescriptivo\n }',
 'mindmap\n root((Conceptos importantes))\n  Una explicación larga con diferentes palabras que necesitan espacio para aparecer completas\n   Ejemplo',
 'pie title Una distribución de resultados con etiquetas descriptivas\n "Primera categoría con una descripción que debe permanecer visible" : 45\n "Segunda categoría" : 55',
];
(async()=>{
 await fs.mkdir(dir,{recursive:true});
 const source=path.join(dir,'apuntes de física.md');
 await fs.writeFile(source,'# Física\n\nEnergía $E=mc^2$.\n\n==Importante==\n');
 const env={...process.env,TINTA_TEST_MODE:'1',TINTA_DATA_DIR:dir};delete env.ELECTRON_RUN_AS_NODE;
 app=await electron.launch({executablePath:process.env.TINTA_ELECTRON_PATH||path.resolve(root,'../../outputs/Tinta/node_modules/electron/dist/electron.exe'),args:process.env.TINTA_PACKAGED?['--no-sandbox','--disable-gpu',source]:[root,'--no-sandbox','--disable-gpu',source],env});
 page=await app.firstWindow();page.setDefaultTimeout(20000);page.on('pageerror',e=>errors.push(e.message));
 await page.getByLabel('Título de la nota',{exact:true}).waitFor();
 await page.waitForFunction(()=>document.querySelector('#note-title')?.value==='apuntes de física');
 await page.locator('.math-inline svg').waitFor();assert.equal(await page.locator('.markdown-body mark').innerText(),'Importante');
 assert.equal(await fs.readFile(source,'utf8'),'# Física\n\nEnergía $E=mc^2$.\n\n==Importante==\n');pass('Opening a Markdown path on launch imports and renders it without modifying the original');
 await app.evaluate(({clipboard})=>{clipboard.writeText=t=>globalThis.testText=t;clipboard.readText=()=>globalThis.testText||'';clipboard.writeImage=i=>globalThis.testImage=i;clipboard.readImage=()=>globalThis.testImage;});
 const second=path.join(dir,'otro archivo.markdown');await fs.writeFile(second,'# Otra idea\n\n<u>Subrayado</u>');
 await app.evaluate(({app},file)=>app.emit('second-instance',{},[process.execPath,...(app.isPackaged?[]:['.']),file],process.cwd()),second);
 await page.waitForFunction(()=>document.querySelector('#note-title')?.value==='otro archivo');
 assert.equal(await page.locator('.markdown-body u').innerText(),'Subrayado');pass('A file opened while Tinta is running reaches the existing window');
 await page.evaluate(()=>{const transfer=new DataTransfer();transfer.items.add(new File(['# Arrastrado\n\n> [!NOTE] Nota\n> **Una idea**.'],'arrastrado.md',{type:'text/markdown'}));document.querySelector('.cm-content').dispatchEvent(new DragEvent('drop',{dataTransfer:transfer,bubbles:true,cancelable:true}));});
 await page.waitForFunction(()=>document.querySelector('#note-title')?.value==='arrastrado');
 await page.locator('.study-callout').waitFor();pass('Dropping a Markdown file on the editor opens a note instead of inserting its filename');
 // Ctrl+O opens the real dialog path, mocked here so the test is unattended.
 await app.evaluate(({dialog},file)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[file]});},source);
 await page.locator('.cm-content').click();await page.keyboard.press('Control+o');
 await page.waitForFunction(()=>document.querySelector('#note-title')?.value==='apuntes de física');
 pass('Ctrl+O opens Markdown while the editor has focus');
 await body('Texto para estudiar');await page.keyboard.press('Control+a');await page.keyboard.press('Control+u');assert.equal(await text(),'<u>Texto para estudiar</u>');
 await page.keyboard.press('Control+Shift+h');assert.equal(await text(),'<u>==Texto para estudiar==</u>');
 await page.locator('.markdown-body u mark').waitFor();await page.keyboard.press('Control+z');assert.equal(await text(),'<u>Texto para estudiar</u>');pass('Underline/highlight wrap the selection and undo cleanly');
 await page.keyboard.press('Control+End');await page.keyboard.press('Control+Alt+n');
 await page.locator('.footnote-ref a').waitFor();assert.ok((await text()).includes('[^nota1]:'));assert.equal(await page.locator('.footnotes li').count(),1);
 await page.locator('.footnote-ref a').click();assert.equal((await page.locator('.footnotes li').innerText()).replace(/\s+/g,' ').trim(),'Fuente o explicación. ↩');pass('Footnote command inserts an editable reference and navigable definition');
 await page.locator('.cm-content').click();await page.keyboard.press('Control+End');await page.keyboard.press('Control+Shift+m');
 await page.getByLabel('Buscar recurso').fill('cancelación');await page.getByRole('button',{name:'Insertar Cancelación y resultado',exact:true}).click();
 await page.getByRole('dialog').waitFor({state:'detached'});await page.locator('.math-figure .diagram-viewport > svg').waitFor();
 assert.equal(await page.locator('.science-error').count(),0);pass('Resource library inserts at the cursor and extended LaTeX cancellation renders');
 await body('```calculate\n{"operation":"integral","expression":"x^2","from":0,"to":3}\n```\n\n```calculate\n{"operation":"statistics","values":[2,4,6]}\n```\n\n\\[\n\\begin{pmatrix}1&2\\\\3&4\\end{pmatrix}\n\\]\n\n```plot\n{"title":"Una comparación con un título muy largo que debe dividirse en varias líneas para conservar todas las palabras de la función y su derivada en el gráfico","functions":["x^2"],"derivatives":["x^2"],"x":[-3,3],"y":[-7,10]}\n```');
 await page.locator('.study-calculation').nth(1).waitFor();await page.locator('.math-figure .diagram-viewport > svg').waitFor();await page.locator('.plot-figure svg').first().waitFor();
 assert.ok((await page.locator('.study-calculation').first().innerText()).includes('Integral ≈\t9'));
 assert.ok((await page.locator('.plot-figure figcaption').innerText()).includes('d/dx'));
 assert.ok(await page.locator('.plot-title tspan').count()>1);
 const titleBounds=await page.locator('.plot-title').evaluate(el=>({x:el.getBBox().x,right:el.getBBox().x+el.getBBox().width,width:el.ownerSVGElement.viewBox.baseVal.width}));assert.ok(titleBounds.x>=0&&titleBounds.right<=titleBounds.width);
 assert.equal(await page.locator('.science-error').count(),0);pass('Numerical integral/statistics, display brackets, matrices and derivative plots render');
 await body(diagrams.map(source=>'```mermaid\n'+source+'\n```').join('\n\n'));
 await page.waitForFunction(n=>document.querySelectorAll('.mermaid-diagram .diagram-viewport > svg').length===n,diagrams.length,{timeout:90000});
 const bounds=await page.locator('.mermaid-diagram .diagram-viewport > svg').evaluateAll(svgs=>svgs.map(svg=>{
  const box=svg.viewBox.baseVal,contents=svg.getBBox();
  const texts=[...svg.querySelectorAll('text')].map(t=>({text:t.textContent,box:t.getBBox(),font:getComputedStyle(t).fontFamily}));
  return {box:{x:box.x,y:box.y,width:box.width,height:box.height},contents:{x:contents.x,y:contents.y,width:contents.width,height:contents.height},text:texts.map(t=>t.text).join(' '),fonts:[...new Set(texts.map(t=>t.font))]};
 }));
 for(const b of bounds){assert.ok(b.contents.x>=b.box.x-1&&b.contents.y>=b.box.y-1&&b.contents.x+b.contents.width<=b.box.x+b.box.width+1&&b.contents.y+b.contents.height<=b.box.y+b.box.height+1,JSON.stringify(b));}
 assert.ok((await page.locator('.mermaid-diagram').nth(0).locator('tspan').count())>3);
 await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setSize(1000,780));
 await page.waitForTimeout(80);
 const clipped=await page.locator('.mermaid-diagram .diagram-viewport > svg').evaluateAll(svgs=>svgs.filter(svg=>{const b=svg.getBBox(),m=svg.getScreenCTM(),parent=svg.parentElement.getBoundingClientRect();const start=new DOMPoint(b.x,b.y).matrixTransform(m),end=new DOMPoint(b.x+b.width,b.y+b.height).matrixTransform(m);return start.x<parent.left-1||start.y<parent.top-1||end.x>parent.right+1||end.y>parent.bottom+1;}).length);assert.equal(clipped,0,'Drawn SVG contents fit the viewport at 100% on a narrow window');
 await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setSize(1500,940));
 await fs.writeFile(path.join(dir,'diagram-bounds.json'),JSON.stringify(bounds,null,2));
 await page.getByRole('button',{name:'Ampliar diagrama',exact:true}).first().click();await page.locator('.diagram-dialog[open]').waitFor();await page.screenshot({path:path.join(dir,'diagram-expanded.png')});await page.getByRole('button',{name:'Cerrar diagrama ampliado'}).click();await page.locator('.diagram-dialog').waitFor({state:'detached'});
 pass('Flow, sequence, state, class, ER, mind map and pie labels stay inside their SVG bounds');
 await page.getByRole('button',{name:'Copiar imagen del diagrama',exact:true}).first().click();await page.waitForFunction(()=>document.querySelector('button[title="Copiar imagen del diagrama"][data-feedback=success]'));
 const png=await app.evaluate(()=>globalThis.testImage.toPNG().toString('base64'));
 const alpha=await page.evaluate(async data=>{const i=new Image();i.src='data:image/png;base64,'+data;await i.decode();const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const ctx=c.getContext('2d');ctx.drawImage(i,0,0);const bytes=ctx.getImageData(0,0,c.width,c.height).data;return {clear:bytes.filter((x,n)=>n%4===3&&x===0).length,ink:bytes.filter((x,n)=>n%4===3&&x>0).length};},png);assert.ok(alpha.clear>100&&alpha.ink>100);pass('Wrapped diagram still copies as a visible PNG with transparent background');
 await body('# Apuntes enriquecidos\n\n==Idea clave== y <u>concepto</u>.[^fuente]\n\n> [!SUMMARY] Resumen\n> Una idea explicada con mis palabras.\n\n[^fuente]: Una *fuente* con página.\n\n```math\n\\int_0^3 x^2\\,dx=9\n```\n\n```calculate\n{"operation":"integral","expression":"x^2","from":0,"to":3}\n```');
 await page.locator('.math-figure .diagram-viewport > svg').waitFor();
 await app.evaluate(({dialog},file)=>{dialog.showSaveDialog=async()=>({canceled:false,filePath:file});},path.join(dir,'apuntes.html'));
 await page.keyboard.press('Control+Shift+e');await page.getByLabel('Formato de exportación',{exact:true}).click();await page.getByRole('option',{name:'HTML',exact:true}).click();await page.getByRole('button',{name:'Guardar vista previa',exact:true}).click();await page.getByRole('dialog').waitFor({state:'detached'});
 const html=await fs.readFile(path.join(dir,'apuntes.html'),'utf8');for(const expected of ['<mark>','<u>','study-callout','href="#fn-1"','Integral ≈','<svg'])assert.ok(html.includes(expected),expected);
 await saved();await page.locator('.presence.is-closing').waitFor({state:'detached'});await page.screenshot({path:path.join(dir,'study.png')});assert.deepEqual(errors,[]);pass('HTML export keeps annotations, footnote navigation, formula and calculation results');
 await fs.writeFile(path.join(dir,'results.json'),JSON.stringify({passed:results.length,results},null,2));
 const closing=app.waitForEvent('close');await page.getByLabel('Cerrar Tinta',{exact:true}).click();await closing;console.log('RESULTS '+dir);
})().catch(async error=>{console.error(error);console.error(errors);if(page)console.error((await page.locator('.markdown-body').innerHTML().catch(()=>'')).slice(0,3500));if(page)await page.screenshot({path:path.join(dir,'failure.png')}).catch(()=>{});if(app)await app.close().catch(()=>{});process.exitCode=1;});
