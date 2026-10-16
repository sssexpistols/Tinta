const template=(id,title,description,tags,body)=>({id:`builtin-${id}`,title,description,tags,body,notebookId:'inbox'});
export const builtInTemplates=[
 template('study','Sesión de estudio','Aprender, explicar con tus palabras y practicar.',['Estudio'],`# Tema: [qué voy a aprender]

## Objetivo de hoy
Al terminar podré: [acción concreta].

## Lo que ya sé
- [Conocimiento previo]

## Ideas clave, con mis palabras
1. [Idea + ejemplo sencillo]
2. [Idea + ejemplo sencillo]

## Práctica sin mirar los apuntes
- [ ] Explicar el tema en dos minutos.
- [ ] Resolver: [ejercicio].
- [ ] Comparar mi solución y corregir errores.

## Preguntas que me faltan
- [Pregunta]

## Repaso
| Cuándo | Qué recordar sin mirar | Resultado |
| --- | --- | --- |
| Mañana | [Pregunta] | [Respuesta] |
| En una semana | [Pregunta] | [Respuesta] |

## Fuentes
- [Título](https://)
`),
 template('cornell','Apuntes Cornell','Preguntas a la izquierda, explicación y resumen.',['Estudio'],`# [Tema de la clase o lectura]

Fecha: [día] · Fuente: [libro, clase o enlace]

| Pregunta / palabra clave | Apuntes con mis palabras |
| --- | --- |
| ¿Qué problema resuelve? | [Explicación] |
| ¿Cómo funciona? | [Pasos y ejemplo] |
| ¿Cuándo no conviene? | [Límite o excepción] |

## Resumen de cinco líneas
[Explica lo esencial sin copiar la fuente.]

## Comprobar mi comprensión
- [ ] Tapar la columna de apuntes y responder las preguntas.
- [ ] Crear un ejemplo propio.
- [ ] Anotar lo que todavía no entiendo.
`),
 template('clean-code','Revisión de código limpio','Cambios pequeños, legibles y comprobables.',['Código','Revisión'],`# Revisión: [módulo o función]

## Comportamiento que debe conservarse
Entrada: [ejemplo] → salida esperada: [ejemplo].

## Problema de lectura o mantenimiento
[Qué resulta confuso y por qué. Evita cambiar solo por preferencia personal.]

## Lista de revisión
- [ ] Los nombres explican la intención.
- [ ] Cada función tiene una responsabilidad clara.
- [ ] Los errores se manejan explícitamente.
- [ ] No hay duplicación que merezca una abstracción común.
- [ ] Las dependencias y efectos secundarios son visibles.
- [ ] Los comentarios explican decisiones, no repiten el código.
- [ ] Las pruebas cubren el comportamiento y los casos límite.

## Cambio propuesto
Antes: [fragmento o descripción].
Después: [fragmento o descripción].

## Verificación
| Caso | Resultado esperado | Resultado obtenido |
| --- | --- | --- |
| Caso habitual | [Valor] | [Valor] |
| Entrada inválida | [Error] | [Error] |

## Decisiones y compromisos
[Qué mejora y qué coste añade.]
`),
 template('pattern','Patrón de diseño','Elegir un patrón por el problema que resuelve.',['Código','Diseño'],`# Patrón: [Strategy, Factory, Observer…]

## Problema concreto
[Qué cambia con frecuencia o qué dependencia cuesta mantener.]

## Solución más simple
[Cómo lo resolvería sin este patrón.]

## Participantes
| Pieza | Responsabilidad | Colabora con |
| --- | --- | --- |
| [Interfaz] | [Contrato] | [Consumidor] |
| [Implementación] | [Comportamiento] | [Interfaz] |

## Ejemplo mínimo

\`\`\`typescript
// Escribe un ejemplo pequeño del comportamiento.
\`\`\`

## Cuándo usarlo / cuándo evitarlo
- Usar si: [evidencia del problema].
- Evitar si: [complejidad innecesaria].

## Pruebas
- [ ] El consumidor funciona con dos implementaciones distintas.
- [ ] Se conserva el comportamiento esperado.

## Decisión
[Adoptar / posponer y motivo.]
`),
 template('deploy','Despliegue de una app','Preparar, verificar, publicar y poder volver atrás.',['Despliegue'],`# Despliegue: [app] · [versión]

Entorno: [pruebas / producción] · Responsable: [nombre] · Fecha: [día]

## Qué cambia
[Comportamiento nuevo y quién se beneficia.]

## Antes de publicar
- [ ] Pruebas y compilación completadas.
- [ ] Variables de entorno documentadas (solo nombres, sin secretos).
- [ ] Copia de seguridad verificada.
- [ ] Migraciones compatibles y recuperación ensayada.
- [ ] Versión anterior disponible.

## Pasos de despliegue
1. [Comando o acción y resultado esperado].
2. [Comando o acción y resultado esperado].
3. [Verificación de salud].

## Prueba rápida
- [ ] Abrir la app.
- [ ] Completar el flujo principal: [describir].
- [ ] Revisar errores y métricas: [dónde].

## Volver a la versión anterior
Se activa si: [señal concreta de fallo].
Pasos: [versión, comando y tratamiento de los datos].

## Resultado
[Hora, versión publicada y problemas observados.]
`),
 template('tasks','Tareas y prioridades','Una lista práctica para el día o un proyecto.',['Tareas'],`# Tareas: [día o proyecto]

## Resultado más importante
[Qué quiero dejar terminado.]

## Hoy
- [ ] [Acción concreta] · prioridad alta · [tiempo estimado]
- [ ] [Acción concreta] · prioridad media · [tiempo estimado]
- [ ] [Acción pequeña] · prioridad baja · [tiempo estimado]

## Pendientes
- [ ] [Siguiente acción]

## Bloqueos
| Tarea | Qué falta | Próximo paso |
| --- | --- | --- |
| [Tarea] | [Bloqueo] | [Acción / responsable] |

## Hecho y aprendido
- [Resultado]

## Preparar mañana
- [ ] [Primera acción del próximo día]
`),
 template('debug','Investigación de un error','Reproducir, comprobar una hipótesis y verificar la solución.',['Código','Debug'],`# Error: [síntoma visible]

## Esperado / observado
Esperaba: [resultado].
Ocurrió: [resultado y mensaje exacto, sin datos sensibles].

## Cómo reproducirlo
Entorno y versión: [datos].
1. [Paso]
2. [Paso]

## Hipótesis y evidencia
| Hipótesis | Cómo comprobarla | Resultado |
| --- | --- | --- |
| [Causa posible] | [Experimento] | [Evidencia] |

## Causa y solución mínima
[Qué fallaba y por qué este cambio lo corrige.]

## Verificación
- [ ] Ya no reproduce el error.
- [ ] El flujo habitual sigue funcionando.
- [ ] Se añadió una prueba útil de regresión.
`),
 template('adr','Decisión de arquitectura','Comparar opciones y guardar el motivo de una decisión.',['Arquitectura'],`# Decisión: [título breve]

Estado: [propuesta / aceptada / reemplazada] · Fecha: [día]

## Contexto y restricciones
[Problema, volumen esperado, equipo, tiempo y límites.]

## Opciones
| Opción | Ventaja | Coste / riesgo |
| --- | --- | --- |
| [A] | [Beneficio] | [Coste] |
| [B] | [Beneficio] | [Coste] |

## Decisión y motivo
[Elegimos… porque…]

## Consecuencias
- [Qué simplifica]
- [Qué complica]

## Cuándo revisarla
[Cambio de requisitos o medida que justificaría reconsiderarla.]
`),
];
