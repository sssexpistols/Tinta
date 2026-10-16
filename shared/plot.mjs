const functions={sin:Math.sin,cos:Math.cos,tan:Math.tan,asin:Math.asin,acos:Math.acos,atan:Math.atan,sqrt:Math.sqrt,abs:Math.abs,exp:Math.exp,log:Math.log,ln:Math.log,log10:Math.log10,floor:Math.floor,ceil:Math.ceil};
// Small expression grammar, never eval/Function or access to JS objects.
export function compileExpression(source){
 if(typeof source!=='string'||source.length>300)throw new Error('La expresión admite hasta 300 caracteres.');
 const tokens=source.match(/(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?|[a-zA-Z][a-zA-Z0-9]*|[()+*/^,-]/g)||[];
 if(tokens.join('')!==source.replace(/\s/g,''))throw new Error('Usa x, números, operadores y funciones matemáticas.');
 let pos=0,depth=0;
 const peek=()=>tokens[pos],take=()=>tokens[pos++];
 function atom(){if(++depth>40)throw new Error('Expresión demasiado compleja.');let node;const t=take();if(t==='('){node=sum();if(take()!==')')throw new Error('Falta cerrar un paréntesis.');}else if(t==='x')node=x=>x;else if(t==='pi')node=()=>Math.PI;else if(t==='e')node=()=>Math.E;else if(Object.hasOwn(functions,t)){if(take()!=='(')throw new Error('Las funciones necesitan paréntesis.');const a=sum();if(take()!==')')throw new Error('Falta cerrar una función.');node=x=>functions[t](a(x));}else if(t&&/^(?:\d|\.)/.test(t)){const n=Number(t);node=()=>n;}else throw new Error('Símbolo desconocido: '+(t||'fin'));depth--;return node;}
 function power(){let a=atom();if(peek()==='^'){take();const b=unary(),base=a;a=x=>Math.pow(base(x),b(x));}return a;}
 function unary(){if(peek()==='+'){take();return unary();}if(peek()==='-'){take();const a=unary();return x=>-a(x);}return power();}
 function product(){let a=unary();while(['*','/'].includes(peek())){const op=take(),b=unary(),left=a;a=x=>op==='*'?left(x)*b(x):left(x)/b(x);}return a;}
 function sum(){let a=product();while(['+','-'].includes(peek())){const op=take(),b=product(),left=a;a=x=>op==='+'?left(x)+b(x):left(x)-b(x);}return a;}
 const result=sum();if(pos!==tokens.length)throw new Error('Usa multiplicación explícita, por ejemplo 2*x.');return result;
}
export function regression(points){
 if(points.length<2)throw new Error('La regresión necesita al menos dos puntos.');
 const n=points.length,mx=points.reduce((s,p)=>s+p[0],0)/n,my=points.reduce((s,p)=>s+p[1],0)/n;
 const sxx=points.reduce((s,p)=>s+(p[0]-mx)**2,0);if(sxx===0)throw new Error('La regresión necesita valores x distintos.');
 const slope=points.reduce((s,p)=>s+(p[0]-mx)*(p[1]-my),0)/sxx,intercept=my-slope*mx;
 const sse=points.reduce((s,p)=>s+(p[1]-slope*p[0]-intercept)**2,0),sst=points.reduce((s,p)=>s+(p[1]-my)**2,0);
 return {slope,intercept,r2:sst===0?(sse<1e-12?1:0):1-sse/sst};
}
export function parsePlot(source){
 if(source.length>30000)throw new Error('El gráfico supera 30.000 caracteres.');
 let spec;try{spec=JSON.parse(source);}catch{throw new Error('El bloque plot necesita JSON válido.');}
 if(!spec||typeof spec!=='object'||Array.isArray(spec))throw new Error('Configuración de gráfico no válida.');
 const range=(value,fallback)=>{const r=value||fallback;if(!Array.isArray(r)||r.length!==2||!r.every(Number.isFinite)||r[0]>=r[1]||r.some(x=>Math.abs(x)>1e9))throw new Error('El rango necesita dos números crecientes entre −1e9 y 1e9.');return r;};
 const points=spec.points||[];if(!Array.isArray(points)||points.length>500||points.some(p=>!Array.isArray(p)||p.length!==2||!p.every(v=>Number.isFinite(v)&&Math.abs(v)<=1e9)))throw new Error('Usa hasta 500 puntos [x, y] finitos.');
 const fit=spec.regression==='linear'?regression(points):null;
 const expressions=spec.functions||[];if(!Array.isArray(expressions)||expressions.length>6)throw new Error('Usa hasta seis funciones.');
 const curves=expressions.map(expression=>({label:expression,fn:compileExpression(expression)}));
 if(fit)curves.push({label:`y = ${fit.slope.toPrecision(5)} x + ${fit.intercept.toPrecision(5)}`,fn:x=>fit.slope*x+fit.intercept});
 if(!curves.length&&!points.length)throw new Error('Añade functions o points al gráfico.');
 const bounds=axis=>{const values=points.map(p=>p[axis]);const min=Math.min(...values),max=Math.max(...values),pad=(max-min)*.15||1;return [min-pad,max+pad];};
 return {title:String(spec.title||'Gráfico').slice(0,160),x:range(spec.x,points.length?bounds(0):[-10,10]),y:range(spec.y,points.length?bounds(1):[-10,10]),points,curves,fit};
}
