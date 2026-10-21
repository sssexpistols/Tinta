import {compileExpression} from './plot.mjs';
const finite = value => {if(!Number.isFinite(value))throw new Error('La función no es finita en el punto o intervalo indicado.');return value;};
export function derivative(fn, x) {
 const h=1e-5*Math.max(1,Math.abs(x));
 return finite((finite(fn(x+h))-finite(fn(x-h)))/(2*h));
}
export function calculate(source) {
 if(source.length>30000)throw new Error('El cálculo supera 30.000 caracteres.');
 let spec;try{spec=JSON.parse(source);}catch{throw new Error('El bloque calculate necesita JSON válido.');}
 if(!spec||typeof spec!=='object')throw new Error('Configuración de cálculo no válida.');
 if(spec.operation==='statistics'){
  const values=spec.values;
  if(!Array.isArray(values)||!values.length||values.length>1000||values.some(x=>!Number.isFinite(x)||Math.abs(x)>1e9))throw new Error('Usa entre 1 y 1.000 números finitos entre −1e9 y 1e9.');
  const sorted=[...values].sort((a,b)=>a-b),n=values.length,mean=values.reduce((a,b)=>a+b,0)/n;
  return {title:'Resumen estadístico',rows:[['Cantidad',n],['Media',mean],['Mediana',n%2?sorted[(n-1)/2]:(sorted[n/2-1]+sorted[n/2])/2],['Mínimo',sorted[0]],['Máximo',sorted[n-1]],['Desviación estándar muestral',n>1?Math.sqrt(values.reduce((s,x)=>s+(x-mean)**2,0)/(n-1)):'No definida (n < 2)']],note:'Estadística descriptiva de los valores proporcionados; no infiere propiedades de una población.'};
 }
 const fn=compileExpression(spec.expression);
 const coordinate=value=>{if(!Number.isFinite(value)||Math.abs(value)>1e6)throw new Error('Usa coordenadas finitas entre −1e6 y 1e6.');return value;};
 if(spec.operation==='derivative'){
  const x=coordinate(spec.at);
  return {title:'Derivada numérica',rows:[['Punto',x],['f(x)',finite(fn(x))],["f′(x) ≈",derivative(fn,x)]],note:'Diferencias centrales. Esta aproximación no demuestra diferenciabilidad; revisa discontinuidades y extremos.'};
 }
 if(spec.operation==='integral'){
  const a=coordinate(spec.from),b=coordinate(spec.to);
  if(a===b)throw new Error('Los límites de integración deben ser distintos.');
  const simpson=n=>{const h=(b-a)/n;let sum=finite(fn(a))+finite(fn(b));for(let i=1;i<n;i++)sum+=(i%2?4:2)*finite(fn(a+i*h));return finite(sum*h/3);};
  const coarse=simpson(512),fine=simpson(1024);
  return {title:'Integral definida numérica',rows:[['Desde',a],['Hasta',b],['Integral ≈',fine],['Diferencia entre dos resoluciones',Math.abs(fine-coarse)]],note:'Simpson compuesto (1.024 intervalos). Requiere una función continua y suficientemente suave. La diferencia mostrada no es una cota garantizada del error ni detecta todas las singularidades.'};
 }
 throw new Error('Operación no disponible: usa statistics, derivative o integral.');
}
