import test from 'node:test';
import assert from 'node:assert/strict';
import {Marked} from 'marked';
import {studyMarkdown} from '../src/studyMarkdown.js';
import {calculate} from '../shared/calculation.mjs';
import {parsePlot,compileExpression} from '../shared/plot.mjs';
import {bindingsFor} from '../src/shortcuts.js';
import {studyResources} from '../src/studyResources.js';
function render(text){const md=new Marked();const study=studyMarkdown(md);md.use({extensions:study.extensions,renderer:study.renderer});return md.parse(text)+study.footnotes();}
test('annotations preserve nested Markdown and do not reinterpret code',()=>{
 const html=render('==**Clave**== y `==literal==`.\n\n```js\n==codigo==\n```\n\n> [!TIP] Repaso\n> Una **idea**.\n');
 assert.ok(html.includes('<mark><strong>Clave</strong></mark>'));
 assert.ok(html.includes('<code>==literal==</code>'));
 assert.ok(html.includes('==codigo=='));
 assert.ok(html.includes('class="study-callout callout-tip"')&&html.includes('<strong>idea</strong>'));
 const recall=render('<details>\n<summary>Mostrar respuesta</summary>\n\nUna **respuesta**.\n\n</details>\n');
 assert.ok(recall.includes('<details class="study-recall">')&&recall.includes('<strong>respuesta</strong>'));
});
test('footnotes resolve forward references, reuse numbers and isolate documents',()=>{
 const html=render('Idea[^libro] y otra[^libro].[^desconocida]\n\n[^libro]: Autor, *Obra*.\n    Página 24.\n');
 assert.equal((html.match(/href="#fn-1"/g)||[]).length,2);
 assert.ok(html.includes('id="fnref-1-2"'));
 assert.ok(html.includes('<em>Obra</em>')&&html.includes('Página 24'));
 assert.ok(html.includes('[^desconocida]'));
 assert.equal(render('[^libro]\n').includes('footnote-ref'),false);
 assert.ok(render('Circular[^a]\n\n[^a]: Referencia a sí misma[^a]\n').length<2000);
});
test('calculus and statistics produce known results with explicit limits',()=>{
 const evaluate=spec=>calculate(JSON.stringify(spec));
 assert.ok(Math.abs(evaluate({operation:'integral',expression:'x^2',from:0,to:3}).rows[2][1]-9)<1e-9);
 assert.ok(Math.abs(evaluate({operation:'derivative',expression:'sin(x)',at:0}).rows[2][1]-1)<1e-8);
 assert.equal(evaluate({operation:'statistics',values:[2,4,4,6,9]}).rows[1][1],5);
 assert.equal(evaluate({operation:'statistics',values:[8]}).rows[5][1],'No definida (n < 2)');
 for(const spec of [{operation:'statistics',values:[]},{operation:'integral',expression:'1/x',from:-1,to:1},{operation:'integral',expression:'x',from:0,to:Infinity},{operation:'derivative',expression:'process.exit()',at:0}])assert.throws(()=>evaluate(spec));
 assert.ok(Math.abs(parsePlot('{"derivatives":["x^2"]}').curves[0].fn(3)-6)<1e-8);
 assert.equal(compileExpression('log2(8)+cbrt(8)+sign(-2)')(0),4);
});
test('library calculation examples are executable and keyboard upgrades preserve custom choices',()=>{
 for(const resource of studyResources){const match=/^```(plot|calculate)\n([\s\S]+)\n```$/.exec(resource.body);if(match)(match[1]==='plot'?parsePlot:calculate)(match[2]);}
 const old={shortcuts:{new:'Ctrl+O',quick:'Ctrl+U',save:'Ctrl+Shift+M'}},bindings=bindingsFor(old);
 for(const [key,value] of Object.entries(old.shortcuts))assert.equal(bindings[key],value);
 assert.notEqual(bindings.open,'Ctrl+O');assert.notEqual(bindings['editor-underline'],'Ctrl+U');
 assert.equal(new Set(Object.values(bindings)).size,Object.values(bindings).length);
});
