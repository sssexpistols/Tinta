import {test} from 'node:test';
import assert from 'node:assert/strict';
import {compileExpression,parsePlot,regression} from '../shared/plot.mjs';
import {defaultWriting,writingSettings,proseMask,grammarSuggestions,aiCorrections} from '../shared/writing.mjs';
import {cleanPrediction,predictionContext,predictionPrompt} from '../shared/prediction-context.mjs';
test('expression parser preserves mathematical precedence and never evaluates JavaScript',()=>{
 for(const [formula,x,expected] of [['-x^2',3,-9],['2^3^2',0,512],['2^-2',0,.25],['log10(100)+sin(pi/2)',0,3],['sqrt(x^2)+exp(0)',-4,5]])assert.equal(compileExpression(formula)(x),expected);
 for(const invalid of ['process.exit()','constructor(1)','__proto__(1)','x;alert(1)','2x','sin(x','x**2','x'.repeat(301)])assert.throws(()=>compileExpression(invalid));
 assert.ok(!Number.isFinite(compileExpression('1/x')(0)));
});
test('linear regression recovers slope, intercept and R²; invalid data rejected',()=>{
 assert.deepEqual(regression([[0,1],[1,3],[2,5]]),{slope:2,intercept:1,r2:1});
 const plot=parsePlot(JSON.stringify({points:[[0,1],[1,3],[2,5]],regression:'linear'}));assert.equal(plot.curves[0].fn(4),9);
 for(const spec of [{points:[[1,1],[1,2]],regression:'linear'},{functions:['x'],x:[1,1]},{functions:['globalThis']},{points:[[1,'2']]},{functions:Array(7).fill('x')},{}])assert.throws(()=>parsePlot(JSON.stringify(spec)));
});
test('Windows language default and bilingual settings preserve explicit choices',()=>{
 assert.deepEqual(defaultWriting(['es-MX']).languages,['es-MX']);
 for(const languages of [[],['de-DE'],['es-ES'],['en-US'],['fr-FR','es-MX']])assert.deepEqual(defaultWriting(languages).languages,['en-US']);
 assert.deepEqual(writingSettings({enabled:false,languages:['es-MX','en-US','es-MX','fr-FR']}),{enabled:false,languages:['es-MX','en-US']});
});
test('grammar respects prose offsets, selected languages and fenced/inline math and code',()=>{
 const text='Pulsa Enter o oprimir el botón.\n\n```js\no oprimir\n```\n\n$$x=o oprimir$$\n\na apple y importante. `o oprimir`';
 const suggestions=grammarSuggestions(text,{enabled:true,languages:['es-MX','en-US']});assert.equal(suggestions.length,3);
 for(const s of suggestions)assert.equal(text.slice(s.from,s.to),s.before);
 assert.equal(suggestions[0].after,'u oprimir');assert.equal(suggestions[1].after,'an apple');assert.equal(suggestions[2].after,'e importante');
 assert.equal(proseMask(text).length,text.length);assert.equal(grammarSuggestions('the the',{enabled:true,languages:['es-MX']}).length,0);
 assert.equal(grammarSuggestions('o oprimir',{enabled:false,languages:['es-MX']}).length,0);
});
test('AI grammar accepts only exact, unique, nonoverlapping prose edits',()=>{
 const text='a apple. twice twice. `private code`';
 const result=aiCorrections(text,JSON.stringify({corrections:[{before:'a apple',after:'an apple'},{before:'apple',after:'orange'},{before:'twice',after:'two'},{before:'private code',after:'changed'},{before:'missing',after:'new'}]}));assert.equal(result.length,1);assert.equal(result[0].from,0);
});
test('autocomplete rejects suffix duplication and recognises math/plot requests',()=>{
 const paragraph='Según la documentación oficial de Git, este directorio contiene la historia del proyecto.';
 assert.equal(cleanPrediction(paragraph,predictionContext('Introducción\n\n',paragraph)),'');
 assert.equal(cleanPrediction(paragraph+' Más texto.',predictionContext('Introducción\n\n',paragraph)),'');
 assert.equal(predictionContext('Grafica una regresión con los puntos (0,1), (1,3).\n\n').kind,'plot');
 assert.equal(predictionContext('La fórmula de energía cinética es:\n\n').kind,'math');
 assert.ok(predictionPrompt(predictionContext('Gráfico de x^2:\n\n')).system.includes('Multiplicación explícita'));
});
