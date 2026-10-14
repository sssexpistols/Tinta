const { _electron: electron }=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const appDir=root;
const dataDir=path.join(root,'.test-results','e2e-'+Date.now());
const results=[];let app,page;const errors=[];
const env={...process.env,TINTA_TEST_MODE:'1',TINTA_DATA_DIR:dataDir};delete env.ELECTRON_RUN_AS_NODE;
async function launch(){app=await electron.launch({executablePath:process.env.TINTA_ELECTRON_PATH||path.join(appDir,'node_modules/electron/dist/electron.exe'),args:[appDir,"--no-sandbox","--disable-gpu","--enable-logging=stderr"],env,timeout:30000});page=await app.firstWindow();page.on('pageerror',error=>errors.push(error.message));await page.getByLabel('Título de la nota',{exact:true}).waitFor();}
function pass(name){results.push(name);console.log('PASS '+name);}
async function body(text){const edit=page.locator('.cm-content');await edit.click();await page.keyboard.press('Control+a');await page.keyboard.insertText(text);}
async function close(){const closed=app.waitForEvent('close');await page.getByRole('button',{name:'Cerrar Tinta',exact:true}).click();await closed;}
(async()=>{
 await launch();
 await page.locator('.markdown-preview h1').waitFor();
 await page.screenshot({path:path.join(dataDir,'screenshot.png')});pass('Arranque, Markdown y captura inicial');
 await page.keyboard.press('Control+n');await page.getByLabel('Título de la nota',{exact:true}).fill('Prueba de persistencia');
 await body('# Hola Tinta\n\n- [ ] Una tarea\n\n| Nombre | Valor |\n| --- | --- |\n| Prueba | 42 |\n\n```javascript\nconst valor = 42;\n```');
 await page.locator('.markdown-preview table').waitFor();assert.equal(await page.locator('.markdown-preview h1').innerText(),'Hola Tinta');assert.equal(await page.locator('.markdown-preview table td').last().innerText(),'42');pass('Crear nota, tabla GFM y resaltado de código');
 await page.locator('.markdown-preview input[type=checkbox]').check();await page.waitForFunction(()=>document.querySelector('.cm-content').innerText.includes('- [x]'));pass('Tarea de vista previa actualiza Markdown');
 await page.getByLabel('Estado de la nota',{exact:true}).selectOption('completed');
 await page.getByRole('button',{name:'Etiqueta',exact:true}).click();await page.getByPlaceholder('Trabajo, Ideas, Aprendizaje…').fill('Pruebas, Personal');await page.getByRole('button',{name:'Listo',exact:true}).click();
 await page.getByLabel('Buscar notas',{exact:true}).fill('Prueba de persistencia');assert.equal(await page.locator('.note-card').count(),1);await page.getByLabel('Limpiar búsqueda').click();pass('Estado, etiquetas y búsqueda');
 await page.getByRole('button',{name:'Solo editor',exact:true}).click();assert.equal(await page.locator('.preview-pane').count(),0);
 await page.getByRole('button',{name:'Editor y vista previa',exact:true}).click();assert.equal(await page.locator('.preview-pane').count(),1);pass('Cambio de vistas');
 await body('/tabla');await page.locator('.cm-tooltip-autocomplete').waitFor({timeout:5000});await page.waitForTimeout(200);await page.keyboard.press('Enter');await page.waitForFunction(()=>document.querySelector('.cm-content').innerText.includes('|'));pass('Autocompletado de bloques con / y Enter');
 await body('[[');await page.locator('.cm-tooltip-autocomplete').waitFor({timeout:5000});await page.keyboard.insertText('GIT');await page.waitForTimeout(350);await page.keyboard.press('Enter');assert.ok((await page.locator('.cm-content').innerText()).includes('GIT'));await page.locator('.markdown-preview a.wiki-link').waitFor();pass('Autocompletado de enlaces internos');
 await page.keyboard.press('Control+k');await page.getByLabel('Buscar y abrir una nota').fill('GIT');await page.keyboard.press('Enter');await page.waitForFunction(()=>document.getElementById('note-title').value==='GIT');pass('Selector rápido Ctrl+K');
 await page.keyboard.press('Control+k');await page.getByLabel('Buscar y abrir una nota').fill('Prueba de persistencia');await page.keyboard.press('Enter');
 await page.getByLabel('Opciones de la nota',{exact:true}).click();await page.getByRole('button',{name:'Mover a papelera',exact:true}).click();await page.locator('.side-nav').getByRole('button',{name:/Papelera/}).click();await page.getByRole('button',{name:'Restaurar',exact:true}).click();await page.locator('.side-nav').getByRole('button',{name:/Todas las notas/}).click();pass('Papelera y restauración');
 await page.getByLabel('Nueva libreta',{exact:true}).click();await page.getByLabel('Nombre',{exact:true}).fill('Proyectos');await page.getByRole('button',{name:'Guardar',exact:true}).click();assert.ok(await page.locator('.notebook-row').getByText('Proyectos',{exact:true}).count());pass('Crear libreta');
 await page.keyboard.press('Control+k');await page.getByLabel('Buscar y abrir una nota').fill('Prueba de persistencia');await page.keyboard.press('Enter');
 await page.getByLabel('Libreta de la nota',{exact:true}).selectOption({label:'Proyectos'});
 await body('# Persistencia final\n\nEste texto debe sobrevivir al cierre inmediato.');
 await close();await launch();assert.equal(await page.getByLabel('Título de la nota',{exact:true}).inputValue(),'Prueba de persistencia');assert.ok((await page.locator('.cm-content').innerText()).includes('sobrevivir al cierre inmediato'));assert.equal(await page.getByLabel('Libreta de la nota',{exact:true}).locator('option:checked').innerText(),'Proyectos');pass('Cierre inmediato, reinicio y persistencia en disco');
 await page.getByLabel('Preferencias · Ctrl+,',{exact:true}).click();await page.getByRole('button',{name:'Claro',exact:true}).click();assert.equal(await page.locator('html').getAttribute('data-theme'),'light');await page.screenshot({path:path.join(dataDir,'light.png')});await page.getByRole('button',{name:'Oscuro',exact:true}).click();await page.getByLabel('Cerrar diálogo',{exact:true}).click();pass('Preferencias y tema claro/oscuro');
 await body('<img src=x onerror="window.__injected=true"><script>window.__injected=true</script>\n\n[mal](javascript:alert(1))');assert.equal(await page.evaluate(()=>window.__injected),undefined);assert.equal(await page.locator('.markdown-preview script').count(),0);assert.equal(await page.locator('.markdown-preview [onerror]').count(),0);pass('HTML peligroso sanitizado');
 assert.deepEqual(errors,[]);pass('Sin errores JavaScript');await close();
 await fs.writeFile(path.join(dataDir,'results.json'),JSON.stringify({passed:results.length,results,dataDir},null,2));
})().catch(async error=>{console.error(error);if(page)await page.screenshot({path:path.join(dataDir,'failure.png')}).catch(()=>{});if(app)await app.close().catch(()=>{});process.exitCode=1;});
