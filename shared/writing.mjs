export function defaultWriting(preferred=[]) {
 const first=String(preferred[0]||'').toLowerCase();
 return {enabled:true,languages:[first==='es-mx'?'es-MX':'en-US']};
}
export function writingSettings(value,preferred=[]) {
 const fallback=defaultWriting(preferred);
 if(!value||typeof value.enabled!=='boolean'||!Array.isArray(value.languages))return fallback;
 const languages=[...new Set(value.languages.filter(x=>['es-MX','en-US'].includes(x)))];
 return {enabled:value.enabled,languages:languages.length?languages:fallback.languages};
}
// Keep offsets while excluding Markdown syntax that isn't prose.
export function proseMask(text) {
 let fence=null,math=false;
 return text.split('\n').map(line=>{
  const mark=/^\s*(?:>\s*)?(`{3,}|~{3,})/.exec(line);
  if(mark){if(!fence)fence=mark[1];else if(mark[1][0]===fence[0]&&mark[1].length>=fence.length)fence=null;return ' '.repeat(line.length);}
  if(fence)return ' '.repeat(line.length);
  if(/^\s*\$\$/.test(line)){if(math)math=false;else math=!/^\s*\$\$[\s\S]*\$\$\s*$/.test(line);return ' '.repeat(line.length);}
  if(math||/^ {4}|^\t/.test(line))return ' '.repeat(line.length);
  return line.replace(/`+[^`]*`+|\$[^$\n]+\$|\[\[[^\]]*\]\]|https?:\/\/\S+|<[^>]*>/g,m=>' '.repeat(m.length));
 }).join('\n');
}
export function grammarSuggestions(text,settings) {
 if(!settings?.enabled)return [];
 const mask=proseMask(text),items=[];
 const add=(match,replacement,reason)=>items.push({from:match.index,to:match.index+match[0].length,before:match[0],after:replacement,reason,source:'Regla local'});
 if(settings.languages.includes('es-MX')){
  for(const m of mask.matchAll(/\b[oO](\s+)(h?o[\p{L}]+)\b/giu))add(m,(m[0][0]==='O'?'U':'u')+m[1]+m[2],'En español, «o» cambia a «u» ante el sonido /o/: «u oprimir».');
  for(const m of mask.matchAll(/\b[yY](\s+)((?:i(?![aeou])|hi(?![ea]))[\p{L}]+)\b/giu))add(m,(m[0][0]==='Y'?'E':'e')+m[1]+m[2],'Revisa el cambio de «y» a «e» ante el sonido /i/.');
 }
 if(settings.languages.includes('en-US')){
  for(const m of mask.matchAll(/\b[aA](\s+)((?:apple|orange|example|idea|error|hour|honest)\w*)\b/g))add(m,(m[0][0]==='A'?'An':'an')+m[1]+m[2],'Use “an” before a vowel sound.');
  for(const m of mask.matchAll(/\b[aA]n(\s+)((?:user|university|unique|useful|one-time)\w*)\b/g))add(m,(m[0][0]==='A'?'A':'a')+m[1]+m[2],'Use “a” before this consonant sound.');
 }
 for(const m of mask.matchAll(/\b(the|and|a|an|el|la|los|las|de|para) +\1\b/giu))if(settings.languages.includes(/^(the|and|a|an)$/i.test(m[1])?'en-US':'es-MX'))add(m,m[1],'Palabra repetida. Comprueba si la repetición es intencional.');
 return items.sort((a,b)=>a.from-b.from);
}
export function aiCorrections(text,response) {
 let parsed;try{parsed=JSON.parse(response.replace(/^\s*```(?:json)?\s*|\s*```\s*$/g,''));}catch{return [];}
 if(!Array.isArray(parsed.corrections))return [];
 const mask=proseMask(text),used=[];
 for(const item of parsed.corrections.slice(0,30)){
  if(typeof item.before!=='string'||typeof item.after!=='string'||!item.before.trim()||item.before===item.after||item.before.length>500||item.after.length>800)continue;
  const from=mask.indexOf(item.before);if(from<0||mask.indexOf(item.before,from+1)!==-1)continue;
  const to=from+item.before.length;if(used.some(x=>from<x.to&&to>x.from))continue;
  used.push({from,to,before:item.before,after:item.after,reason:String(item.reason||'Revisión gramatical local').slice(0,300),source:'Ollama local'});
 }
 return used.sort((a,b)=>a.from-b.from);
}
