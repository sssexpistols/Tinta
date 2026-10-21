const math = (id,title,description,source,category='Matemáticas') => ({id,title,description,category,body:'```math\n'+source+'\n```'});
export const studyResources = [
 math('fraction','Fracciones y raíces','Sustituye numerador, denominador e índice de la raíz.',String.raw`\frac{a+b}{c},\qquad \sqrt{x},\qquad \sqrt[n]{x}`),
 math('quadratic','Ecuación cuadrática','Para ax² + bx + c = 0, con a distinto de cero.',String.raw`x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}`),
 math('system','Sistema de ecuaciones','Alinea cada ecuación de un sistema.',String.raw`\begin{cases}2x+y=5\\x-y=1\end{cases}`),
 math('matrix','Matrices y determinantes','Cambia los elementos; & separa columnas y \\\\ filas.',String.raw`A=\begin{pmatrix}a&b\\c&d\end{pmatrix},\qquad \det(A)=ad-bc`),
 math('steps','Derivación paso a paso','Usa aligned para justificar cada transformación.',String.raw`\begin{aligned}(x+1)^2&=x^2+2x+1\\\frac{d}{dx}(x+1)^2&=2x+2\end{aligned}`),
 math('limit','Límites','Ejemplo con x en radianes.',String.raw`\lim_{x\to0}\frac{\sin x}{x}=1`),
 math('derivative','Derivadas y gradiente','Derivada ordinaria y vector de derivadas parciales.',String.raw`\frac{df}{dx},\qquad \nabla f=\left(\frac{\partial f}{\partial x},\frac{\partial f}{\partial y}\right)`),
 math('integral','Integrales','Teorema fundamental: F es una primitiva de f.',String.raw`\int_a^b f(x)\,dx=F(b)-F(a)`),
 math('series','Sumatorias y series','Serie geométrica válida para |r| menor que 1.',String.raw`\sum_{k=0}^{\infty}r^k=\frac{1}{1-r},\qquad |r|<1`),
 math('piecewise','Función por partes','Especifica la condición correspondiente a cada expresión.',String.raw`f(x)=\begin{cases}x^2&x\ge0\\-x&x<0\end{cases}`),
 math('probability','Probabilidad condicional y Bayes','P(B) debe ser mayor que cero.',String.raw`P(A\mid B)=\frac{P(B\mid A)\,P(A)}{P(B)}`),
 math('statistics','Media y varianza muestral','La varianza muestral requiere n mayor que 1.',String.raw`\bar x=\frac1n\sum_{i=1}^n x_i,\qquad s^2=\frac{\sum_{i=1}^n(x_i-\bar x)^2}{n-1}`),
 math('normal','Distribución normal','σ es la desviación estándar, mayor que cero.',String.raw`f(x)=\frac{1}{\sigma\sqrt{2\pi}}\exp\left(-\frac{(x-\mu)^2}{2\sigma^2}\right)`),
 math('vectors','Vectores','Producto escalar y norma euclidiana.',String.raw`\mathbf u\cdot\mathbf v=\sum_i u_i v_i,\qquad \|\mathbf v\|=\sqrt{\sum_i v_i^2}`),
 math('physics','Movimiento y energía','Aceleración constante; registra unidades y supuestos.',String.raw`x(t)=x_0+v_0t+\tfrac12at^2,\qquad E_k=\tfrac12mv^2`,'Ciencia'),
 math('chemistry','Reacción química','mhchem admite elementos, enlaces, cargas y estados.',String.raw`\ce{2H2(g) + O2(g) -> 2H2O(l)},\qquad \ce{SO4^2-}`,'Ciencia'),
 math('units','Magnitudes y unidades','Mantén las unidades en letra recta.',String.raw`v=\frac{\Delta x}{\Delta t}=3.2\,\mathrm{m\,s^{-1}}`,'Ciencia'),
 math('cancel','Cancelación y resultado','Muestra cancelaciones sin borrar pasos de la explicación.',String.raw`\frac{\cancel{a}\,b}{\cancel{a}\,c}=\boxed{\frac bc},\qquad a\ne0,\ c\ne0`),
 {id:'curves',category:'Gráficos y cálculo',title:'Comparar funciones',description:'Trigonometría en radianes. Multiplicación explícita: 2*x.',body:'```plot\n{"title":"Seno y coseno","x":[-6.28,6.28],"y":[-1.5,1.5],"functions":["sin(x)","cos(x)"]}\n```'},
 {id:'tangent',category:'Gráficos y cálculo',title:'Función y derivada',description:'La derivada se aproxima numéricamente; revisa los puntos no diferenciables.',body:'```plot\n{"title":"Una función y su derivada","x":[-3,3],"y":[-7,10],"functions":["x^2"],"derivatives":["x^2"]}\n```'},
 {id:'numeric-integral',category:'Gráficos y cálculo',title:'Integral definida numérica',description:'Regla de Simpson compuesta. Usa una función continua en el intervalo; no es cálculo simbólico.',body:'```calculate\n{"operation":"integral","expression":"x^2","from":0,"to":3}\n```'},
 {id:'numeric-derivative',category:'Gráficos y cálculo',title:'Derivada en un punto',description:'Diferencias centrales. No usar para concluir diferenciabilidad.',body:'```calculate\n{"operation":"derivative","expression":"sin(x)","at":0}\n```'},
 {id:'data-summary',category:'Gráficos y cálculo',title:'Resumen estadístico',description:'Cantidad, media, mediana, rango y desviación estándar muestral.',body:'```calculate\n{"operation":"statistics","values":[2,4,4,6,9]}\n```'},
 {id:'highlight',category:'Apuntes',title:'Resaltar y subrayar',description:'Selecciona texto y usa los botones del editor o los atajos configurables.',body:'==Idea importante== y <u>concepto subrayado</u>.'},
 {id:'footnote',category:'Escritura',title:'Cita con nota al pie',description:'Cada identificador enlaza con su referencia. Añade la fuente y la página reales.',body:'Una afirmación que necesito respaldar.[^fuente]\n\n[^fuente]: Apellido, Nombre. *Título*. Editorial, año, p. [página].'},
 {id:'callout',category:'Apuntes',title:'Recuadro de información',description:'También: TIP, IMPORTANT, WARNING, QUESTION, EXAMPLE, SUMMARY y QUOTE.',body:'> [!NOTE] Idea clave\n> Explica aquí la idea con tus propias palabras.\n>\n> - Evidencia: [fuente o ejemplo]\n> - Relación: [[Otra nota]]'},
 {id:'recall',category:'Apuntes',title:'Pregunta de repaso',description:'Una respuesta plegable permite practicar sin verla primero.',body:'### ¿Qué necesito recordar?\n\n<details>\n<summary>Mostrar respuesta</summary>\n\nEscribe la respuesta y un ejemplo propio.\n\n</details>'},
 {id:'glossary',category:'Escritura',title:'Glosario y vocabulario',description:'Distingue significado, contexto y ejemplo propio.',body:'| Término | Significado | Ejemplo propio | Fuente |\n| --- | --- | --- | --- |\n| [palabra] | [definición] | [oración] | [página/enlace] |'},
];

export const studyTemplates = [
 {id:'builtin-literary-analysis',title:'Lectura y análisis literario',category:'Estudio',description:'Leer con evidencia, interpretar y construir una tesis.',tags:['Lectura','Escritura'],body:`# [Obra y autor]

## Ficha y propósito
Título: [obra] · Autor: [nombre] · Edición: [editorial y año]
Páginas / capítulo: [rango] · Fecha: [día]
Pregunta de lectura: [qué quiero comprender].

## Contexto sin suposiciones
- Contexto documentado: [fuente].
- Género y destinatario: [evidencia].
- Lo que aún necesito investigar: [pregunta].

## Resumen en mis palabras
[Describe qué ocurre o qué se defiende, sin confundirlo con tu valoración.]

## Pasajes y anotaciones
> [!QUOTE] Pasaje relevante
> [Transcribe un fragmento breve y registra su página.]

| Pasaje / página | Recurso o idea | Efecto en la lectura | Interpretación alternativa |
| --- | --- | --- | --- |
| [referencia] | [metáfora, tono, contraste…] | [qué produce y cómo] | [otra lectura posible] |

## Voz, estructura y personajes
- ¿Quién habla y qué sabe? [Narrador, perspectiva y fiabilidad].
- ¿Cómo se organiza el tiempo? [Orden, ritmo y omisiones].
- ¿Qué desea cada personaje? [Deseo, obstáculo y transformación].
- ¿Qué tensiones se repiten? [Motivos, símbolos y contradicciones].

## Tesis provisional
==[Una interpretación discutible y concreta]==.

1. Razón: [afirmación].
2. Evidencia: [pasaje y página].
3. Explicación: [cómo sostiene la razón].
4. Objeción: [lectura que cuestionaría tu tesis].
5. Respuesta o revisión: [qué ajustarías].

## Vocabulario
| Palabra | Sentido en este contexto | Ejemplo propio |
| --- | --- | --- |
| [término] | [significado] | [oración] |

## Revisión final
- [ ] Separé hechos del texto e interpretaciones.
- [ ] Cada afirmación importante tiene una referencia.
- [ ] Evité atribuir intenciones al autor sin evidencia.
- [ ] Expliqué por qué los recursos importan.
- [ ] Anoté una pregunta abierta para la siguiente lectura.

## Referencias
[^obra]: [Autor. Título. Edición, año, páginas.]
`},
 {id:'builtin-argument-writing',title:'Ensayo y escritura argumentativa',category:'Estudio',description:'Planear, redactar y revisar un argumento con fuentes.',tags:['Escritura'],body:`# [Título de trabajo]

## Propósito y lector
Quiero que [lector] comprenda [idea] para [propósito].
Extensión / entrega: [palabras y fecha].
Pregunta central: [pregunta que admite discusión].

## Tesis y alcance
==[Respuesta concreta a la pregunta]==.
Define los términos: [qué significan en este ensayo].
Delimita: [qué periodo, casos o condiciones estudiarás].

## Mapa del argumento
| Sección | Afirmación | Evidencia / fuente | Cómo sostiene la tesis |
| --- | --- | --- | --- |
| Introducción | [problema] | [contexto] | [relevancia] |
| Desarrollo 1 | [razón] | [cita/dato] | [explicación] |
| Desarrollo 2 | [razón] | [cita/dato] | [explicación] |
| Objeción | [mejor contraargumento] | [fuente] | [respuesta o límite] |
| Conclusión | [resultado] | [síntesis] | [implicación] |

## Borrador
### Introducción
[Presenta el problema, explica por qué importa y formula la tesis.]

### Desarrollo
[Una idea por párrafo: afirmación → evidencia → explicación → conexión.]

### Objeción y respuesta
[Representa con justicia la postura contraria. Ajusta la tesis si hace falta.]

### Conclusión
[Responde la pregunta, reconoce límites y explica qué se sigue del argumento.]

## Revisión en dos pasadas
### Argumento
- [ ] Las razones sostienen la tesis.
- [ ] Las fuentes son pertinentes y están identificadas.
- [ ] Distinguí paráfrasis y citas textuales.
- [ ] No presenté correlación como causalidad.

### Estilo
- [ ] Cada párrafo tiene una función clara.
- [ ] Eliminé repeticiones y términos vagos.
- [ ] Revisé concordancia, puntuación y conectores.
- [ ] Leí en voz alta para detectar frases difíciles.

## Registro de fuentes
| Fuente | Página / enlace | Idea utilizada | Dónde la cité |
| --- | --- | --- | --- |
| [autor y año] | [referencia] | [idea] | [sección] |
`},
];
