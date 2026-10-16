// Original guided worksheets. Only built-in templates use these additions;
// personal templates remain exactly as the user saved them.
export const templateGuides = {
study: String.raw`
## Preparar una sesión realista
Tiempo disponible: [minutos]. Material abierto: [capítulo, documentación o ejercicio].
Divide el objetivo en una habilidad observable: en lugar de «entender Git», escribe «explicar qué cambia al preparar y confirmar un archivo».

| Tramo | Actividad | Evidencia que voy a producir |
| --- | --- | --- |
| Inicio, 5 min | Recordar sin consultar | [Tres ideas y una duda] |
| Desarrollo, 20 min | Leer y probar un ejemplo | [Resultado o captura] |
| Cierre, 10 min | Resolver sin guía | [Solución propia] |

## Ejemplo guiado y transferencia
Ejemplo de cómo rellenar: al estudiar un algoritmo de búsqueda, anotaría la entrada, cada comparación y la posición encontrada; después repetiría con una entrada vacía.

Mi ejemplo de hoy:
1. Entrada o situación: [caso pequeño].
2. Predicción antes de probar: [qué creo que ocurrirá y por qué].
3. Resultado observado: [qué ocurrió realmente].
4. Diferencia con mi predicción: [explicación corregida].
5. Caso nuevo: [cambia una condición; resuélvelo sin copiar].

## Registro de errores útiles
| Lo que confundí | Por qué parecía correcto | Regla que ahora usaré |
| --- | --- | --- |
| [Idea] | [Supuesto] | [Regla y límite] |

## Tarjetas para recuperar de memoria
- Pregunta de mecanismo: ¿[cómo ocurre X]? Respuesta oculta hasta repasar: [respuesta].
- Pregunta de decisión: ¿[cuándo elegir X en lugar de Y]? [criterio].
- Pregunta de límite: ¿[qué entrada rompe mi explicación]? [contraejemplo].

## Cierre de la sesión
Confianza antes / después: [1–5] / [1–5]. Evidencia que justifica esa confianza: [ejercicio resuelto].
- [ ] Puedo explicar la idea sin leer una definición.
- [ ] Dejé anotada una duda concreta para la próxima sesión.
- [ ] El siguiente repaso tiene fecha y pregunta, no solo «repasar tema».
`,
cornell: String.raw`
## Antes de escuchar o leer
Propósito: [qué pregunta espero responder]. Prerrequisitos: [dos conceptos que necesito recordar].
No intentes transcribir todo: captura afirmaciones, razones, ejemplos y excepciones. Al terminar, convierte cada idea importante en una pregunta de la columna izquierda.

## Desarrollo de los apuntes
| Pregunta para recuperar de memoria | Explicación, evidencia y ejemplo |
| --- | --- |
| ¿Qué significa [término] sin usar esa palabra? | [Definición propia; página o minuto] |
| ¿Qué ocurre primero y qué lo causa? | [Secuencia de pasos] |
| ¿Qué supuesto necesita esta afirmación? | [Condición y excepción] |
| ¿Cómo lo comprobaría? | [Experimento o ejercicio pequeño] |
| ¿En qué se diferencia de [otra idea]? | [Distinción que evita una confusión] |

## Ejemplo de una fila bien completada
**Pregunta:** ¿Qué diferencia hay entre preparar y confirmar cambios en Git?

**Apunte:** Preparar elige el contenido que formará parte del siguiente commit. Confirmar registra esa instantánea en el repositorio. Si edito de nuevo el archivo después de prepararlo, debo preparar también esos cambios para incluirlos. Comprobaré la diferencia con un archivo de prueba.

Mi propia fila desarrollada: [pregunta, explicación y forma de comprobarla].

## Conectar, contrastar y preguntar
- Se relaciona con: [[Concepto relacionado]]. La conexión concreta es: [explicación].
- La fuente afirma: [afirmación y referencia]. Yo todavía no entiendo: [pregunta precisa].
- Un ejemplo donde no aplicaría: [caso].
- Una pregunta para el profesor o para investigar: [pregunta].

## Repaso activo posterior
Tapa los apuntes y responde mirando solo las preguntas. Marca 0 si no recuerdas, 1 si necesitas una pista y 2 si explicas y ejemplificas.

| Fecha | Preguntas intentadas | Resultado 0–2 | Qué voy a corregir |
| --- | --- | --- | --- |
| [Mañana] | [Filas] | [Puntuación] | [Acción] |
| [En una semana] | [Filas] | [Puntuación] | [Acción] |
`,
'clean-code': String.raw`
## Recorrido de lectura
Lee primero el código como una persona que necesita modificarlo, no como quien lo escribió.
- Punto de entrada y consumidor: [ruta y función].
- Estado que lee o modifica: [variables, archivo, base de datos].
- Efectos que pueden fallar: [red, disco, eventos].
- Pregunta que tardé en contestar: [qué hace, quién valida o quién libera el recurso].

## Hallazgos priorizados
| Ubicación | Dificultad observable | Cambio pequeño | Beneficio y posible coste |
| --- | --- | --- | --- |
| [Archivo:línea] | [Ej.: misma validación en tres rutas] | [Extraer regla común] | [Una regla; nueva dependencia] |
| [Archivo:línea] | [Evidencia] | [Cambio] | [Compromiso] |

## Ejemplo de intención explícita
Ejemplo didáctico; adapta los nombres y contratos a tu dominio:

~~~typescript filename="src/prices.ts" title="Una regla de precio con unidades visibles"
export function totalInCents(unitPriceInCents: number, quantity: number) {
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new Error('quantity debe ser un entero no negativo');
  }
  return unitPriceInCents * quantity;
}
~~~

Contrato pendiente de decidir: ¿se permiten precios negativos?, ¿qué límites numéricos necesita el negocio? Un nombre claro no sustituye esas decisiones.

## Revisar abstracciones sin sobreingeniería
- ¿Las repeticiones representan la misma regla o solo se parecen? [evidencia].
- ¿La nueva interfaz reduce el conocimiento que necesita el consumidor? [antes / después].
- ¿Una función pequeña gana claridad o fuerza a saltar entre demasiados archivos? [ejemplo].
- ¿Qué cambio futuro real se vuelve más fácil? [caso concreto].

## Plan de revisión y seguimiento
1. Guardar una prueba del comportamiento actual: [caso y comando].
2. Cambiar una responsabilidad por vez: [primer diff].
3. Revisar errores, recursos y compatibilidad: [resultado].
4. Registrar lo pospuesto con motivo: [tarea y criterio para retomarla].
`,
pattern: String.raw`
## Fuerzas que compiten
Variación esperada: [qué cambiará]. Parte estable: [qué no debería depender de ese cambio].
Restricciones: [rendimiento, serialización, equipo, runtime]. No introduzcas un patrón solo por su nombre: compáralo con una función o una condición simple.

## Ejemplo trabajado: Strategy
Situación didáctica: distintos pedidos usan reglas de envío distintas. La regla se pasa como una función; no hace falta una jerarquía de clases para empezar.

~~~typescript filename="src/shipping.ts" title="Elegir una política sin acoplar al consumidor"
type Order = { subtotalInCents: number };
type Shipping = (order: Order) => number;
const standard: Shipping = () => 500;
const freeAboveThreshold: Shipping = order =>
  order.subtotalInCents >= 5000 ? 0 : 500;
export function total(order: Order, shipping: Shipping) {
  return order.subtotalInCents + shipping(order);
}
// total({ subtotalInCents: 6000 }, freeAboveThreshold) === 6000
~~~

## Adaptación a mi problema
| Elemento del ejemplo | Equivalente en mi dominio | Regla que debe respetar |
| --- | --- | --- |
| Consumidor total | [Función] | [Invariante] |
| Política Shipping | [Contrato] | [Entrada y salida] |
| Implementaciones | [Variantes reales] | [Casos límite] |

## Secuencia de colaboración
1. [Quién elige la implementación y cuándo].
2. [Quién entrega los datos al contrato].
3. [Quién maneja errores y efectos secundarios].
4. [Quién conserva o libera el estado].

## Contraste y coste
Alternativa sin patrón: [código o descripción]. Patrón cercano: [nombre]. Diferencia decisiva: [qué problema resuelve cada uno].
- [ ] Existen al menos dos variantes reales, o una necesidad demostrable de variación.
- [ ] Puedo probar el consumidor sin depender de infraestructura.
- [ ] El coste de añadir otra variante está localizado.
- [ ] Documenté cuándo simplificar o retirar esta abstracción.
`,
deploy: String.raw`
## Inventario de la entrega
| Elemento | Valor verificable | Dónde comprobarlo |
| --- | --- | --- |
| Commit y etiqueta | [SHA / versión] | [Repositorio] |
| Artefacto | [Ruta e identificador] | [Registro de compilación] |
| Configuración | [Nombres de variables, sin valores secretos] | [Entorno] |
| Datos | [Versión de esquema] | [Comprobación] |
| Respaldo | [Fecha y ubicación] | [Ensayo de restauración] |

## Ejecución con puntos de control
| Orden | Acción o comando | Resultado esperado | Si falla |
| --- | --- | --- | --- |
| 1 | [Preparar entorno] | [Dependencias disponibles] | [Detener y diagnosticar] |
| 2 | [Aplicar cambios compatibles] | [Verificación de datos] | [Procedimiento] |
| 3 | [Iniciar nueva versión] | [Health check] | [Volver al artefacto anterior] |
| 4 | [Probar flujo principal] | [Resultado concreto] | [Responsable y decisión] |

## Observación después de publicar
Ventana de observación: [minutos]. Referencia antes del cambio: [tasa de errores, latencia, consumo].
Un proceso encendido no demuestra que funcione: completa una operación real y comprueba que su resultado persista.

| Señal | Umbral para investigar | Umbral para revertir | Responsable |
| --- | --- | --- | --- |
| [Errores del flujo principal] | [Valor y duración] | [Valor y duración] | [Nombre] |
| [Latencia / integridad] | [Valor] | [Valor] | [Nombre] |

## Recuperación de datos y compatibilidad
- ¿La versión anterior puede leer los datos escritos por la nueva? [prueba].
- ¿Una migración necesita revertirse o es preferible corregir hacia adelante? [decisión].
- ¿Qué cambios de usuarios posteriores al respaldo se perderían al restaurarlo? [alcance].
- ¿Cómo se valida que la restauración funcionó? [consulta o prueba].

## Acta de entrega
Inicio / fin: [horas]. Publicado por: [nombre]. Versión realmente en ejecución: [evidencia].
Incidencias: [qué ocurrió y acción tomada]. Próximo seguimiento: [fecha y responsable].
`,
tasks: String.raw`
## Captura y clasificación
Anota primero lo que ocupa tu atención. Después convierte cada pendiente en una acción que puedas empezar sin otra reunión contigo mismo.

| Pendiente recibido | Siguiente acción concreta | Resultado visible | Fecha real |
| --- | --- | --- | --- |
| [«Mejorar documentación»] | [Escribir ejemplo de instalación] | [PR con ejemplo probado] | [Día] |
| [Pendiente] | [Verbo + objeto] | [Evidencia de terminado] | [Día o sin fecha] |

## Capacidad del día
Tiempo utilizable: [horas, descontando reuniones y descansos]. Reserva para imprevistos: [minutos].
Máximo de tareas en curso: [número pequeño]. Si aparece algo urgente, indicaré qué tarea se pospone: [regla de decisión].

| Bloque de tiempo | Trabajo elegido | Primer paso de cinco minutos |
| --- | --- | --- |
| [Hora de inicio–fin] | [Tarea prioritaria] | [Abrir archivo / preparar datos] |
| [Hora de inicio–fin] | [Tarea secundaria] | [Acción] |

## Criterios para terminar
Tarea principal: [nombre]. Se considera terminada cuando:
- [ ] [Resultado que otra persona puede verificar].
- [ ] [Prueba o revisión necesaria].
- [ ] [Entrega, registro o documentación mínima].

No pertenece a esta tarea: [mejora tentadora que puede esperar].

## Esperando a alguien o a algo
| Dependencia | A quién / qué espero | Fecha de seguimiento | Alternativa mientras tanto |
| --- | --- | --- | --- |
| [Tarea] | [Persona / proceso] | [Día] | [Acción independiente] |

## Revisión de cierre
- Completado frente a lo planeado: [resultado].
- Estimación frente a tiempo real: [diferencia y causa].
- Interrupción que puedo reducir mañana: [una acción].
- Pendiente que puedo eliminar o delegar: [cuál y por qué].
- Primera tarea de mañana ya preparada: [archivo, contexto y siguiente paso].
`,
debug: String.raw`
## Reducir el caso sin perder el fallo
Dato mínimo que lo provoca: [entrada]. Última versión conocida sin fallo: [commit]. Primera versión con fallo: [commit o desconocido].
Al quitar [componente o paso], el fallo [permanece / desaparece]. Evita cambiar varios factores a la vez: necesitas poder atribuir el resultado a una causa.

## Seguir el dato de principio a fin
| Frontera | Entrada observada | Salida esperada | Salida observada | Evidencia |
| --- | --- | --- | --- | --- |
| [UI → servicio] | [Valor] | [Valor] | [Valor] | [Log o prueba] |
| [Servicio → almacenamiento] | [Valor] | [Valor] | [Valor] | [Referencia] |

## Ejemplo de investigación
Síntoma didáctico: el título cambia al seleccionar una nota, pero el editor muestra la anterior. Hipótesis: la carga está protegida por una condición de solo lectura. Experimento: alternar dos notas con cuerpos diferentes y comparar título, editor y preview. Evidencia decisiva: una rama retorna antes de sincronizar el contenido.

Mi investigación: [describe el experimento que distingue tu hipótesis de otra explicación posible].

## Explicar la causa, no solo el parche
Cadena causal: [condición inicial] → [decisión incorrecta] → [estado inválido] → [síntoma].
La condición que faltaba era: [invariante]. La corrección la restablece porque: [razonamiento].
Otras rutas con el mismo supuesto: [archivos o funciones revisados].

## Matriz de regresión
| Caso | Antes del arreglo | Después | Prueba que lo protege |
| --- | --- | --- | --- |
| Reproducción mínima | [Fallo] | [Correcto] | [Nombre] |
| Caso habitual | [Correcto] | [Correcto] | [Nombre] |
| Caso límite / error | [Resultado] | [Resultado] | [Nombre] |

## Cierre para quien lo revise
Commit: [SHA]. Causa resumida en una frase: [explicación]. Riesgo residual: [límite conocido]. Señal para detectar una recaída: [comprobación observable].
`,
adr: String.raw`
## Factores de decisión ordenados
No todas las ventajas pesan igual. Ordena los factores antes de elegir una tecnología o estructura.
1. [Restricción obligatoria: datos, latencia, compatibilidad].
2. [Prioridad del producto o del equipo].
3. [Preferencia negociable].

## Comparación respaldada por evidencia
| Criterio | Peso / prioridad | Opción A | Opción B | Mantener lo actual |
| --- | --- | --- | --- | --- |
| [Operación diaria] | [Alta] | [Medición o experiencia] | [Evidencia] | [Coste actual] |
| [Facilidad de cambio] | [Media] | [Experimento] | [Experimento] | [Limitación] |
| [Coste total] | [Alta] | [Desarrollo + operación] | [Estimación] | [Estimación] |

Evita una puntuación precisa si solo tienes opiniones: marca qué celdas necesitan una prueba o una consulta.

## Prueba de concepto que reduce incertidumbre
Pregunta que decide entre opciones: [pregunta]. Experimento mínimo: [qué construir y con qué datos].
Límite de tiempo: [horas]. Resultado que permitiría adoptar: [umbral]. Resultado que descartaría: [umbral].

## Transición y reversibilidad
- Primera parte que cambia: [módulo].
- Coexistencia temporal: [adaptador o frontera].
- Datos que necesitan transformación: [esquema y compatibilidad].
- Coste de deshacer la decisión: [trabajo y pérdida potencial].
- Punto a partir del cual es difícil revertir: [evento].

## Consecuencias aceptadas y revisión
Aceptamos [coste] para obtener [beneficio]. Mitigaremos [riesgo] mediante [acción con responsable].
Revisar si [métrica] supera [umbral] o cambia [supuesto]. Próxima revisión: [fecha].

## Registro y referencias
Participantes: [nombres]. Objeciones pendientes: [preguntas]. Decisión relacionada: [[Otra decisión]].
Fuentes: [documentación, medición, discusión]. Si se reemplaza esta decisión, enlaza la nueva y conserva aquí el motivo original.
`,
codebase: String.raw`
## Preparar un recorrido reproducible
Repositorio: [URL o ruta]. Rama y commit: [referencia exacta]. Objetivo de la lectura: [cambio o pregunta].
Instalación y prueba realizadas: [comandos y resultados]. Datos de ejemplo: [ubicación]. Describe cualquier servicio necesario para que otra persona repita tu recorrido.

## Seguir un caso de uso completo
Caso: [por ejemplo, crear y guardar una nota].

~~~mermaid
flowchart LR
  Entrada[Acción del usuario] --> Interfaz[Interfaz]
  Interfaz --> Logica[Reglas del dominio]
  Logica --> Datos[Persistencia]
  Datos --> Resultado[Confirmación o error]
~~~

Reemplaza los nombres por módulos reales y añade las rutas de error. No deduzcas el comportamiento solo por el nombre de un archivo: localiza la llamada y su consumidor.

| Paso | Archivo y símbolo | Dato que recibe | Dato que devuelve | Efectos |
| --- | --- | --- | --- | --- |
| 1 | [Entrada] | [Evento] | [Solicitud] | [Estado] |
| 2 | [Servicio] | [Solicitud] | [Resultado] | [Disco / red] |

## Contratos e invariantes
- ¿Dónde se valida la entrada externa? [archivo y caso de prueba].
- ¿Quién es dueño del estado y quién puede modificarlo? [respuesta].
- ¿Qué debe ser siempre cierto? [invariante].
- ¿Cómo se propaga un error hasta el usuario? [recorrido].
- ¿Cómo se liberan recursos al cancelar o cerrar? [evidencia].

## Una modificación de prueba
Cambio pequeño que confirma mi comprensión: [experimento local]. Predicción: [archivos afectados]. Resultado: [qué cambió realmente]. Prueba ejecutada: [comando].

## Mapa de aprendizaje pendiente
| Duda | Evidencia actual | Dónde investigar después | Prioridad |
| --- | --- | --- | --- |
| [Pregunta] | [Hecho o hipótesis] | [Archivo, test o documentación] | [Alta / media] |

Conclusión para el próximo cambio: tocaría [módulo], protegería [contrato] y verificaría [flujo].
`,
performance: String.raw`
## Diseñar una comparación justa
Carga representativa: [datos pequeños, habituales y grandes]. Estado de caché: [frío / caliente]. Concurrencia: [número]. Versión compilada y modo: [release / debug].
Registra las condiciones que podrían cambiar el resultado: procesos en segundo plano, red, energía, JIT y almacenamiento.

## Descomponer el tiempo
| Etapa | Tiempo o porcentaje | Herramienta / evidencia | Hipótesis |
| --- | --- | --- | --- |
| [Lectura de entrada] | [Medición] | [Perfil] | [Causa] |
| [Cálculo] | [Medición] | [Perfil] | [Causa] |
| [Render / escritura] | [Medición] | [Perfil] | [Causa] |

## Ejemplo de hipótesis falsable
En lugar de «el render es lento», formula: «al abrir 5.000 notas se recalcula el índice completo en cada pulsación; reutilizarlo debería reducir el p95 de búsqueda sin alterar los resultados».

Mi hipótesis: [causa medible]. Experimento que la refutaría: [resultado contrario]. Presupuesto del experimento: [tiempo].

## Evaluar el coste de la solución
- Si añado caché: ¿cómo se invalida y cuánto ocupa? [respuesta].
- Si paralelizo: ¿qué coordinación o condiciones de carrera aparecen? [respuesta].
- Si difiero trabajo: ¿qué verá el usuario mientras tanto? [respuesta].
- Si reduzco precisión o calidad: ¿es aceptable y está explícito? [respuesta].

## Resultados comparables
| Escenario | Muestras | Antes p50 / p95 | Después p50 / p95 | Variación | Correctitud |
| --- | --- | --- | --- | --- | --- |
| [Habitual] | [N] | [ms] | [ms] | [%] | [Prueba] |
| [Grande / límite] | [N] | [ms] | [ms] | [%] | [Prueba] |

## Decisión de entrega
Beneficio percibido: [qué operación mejora]. Coste de mantenimiento: [qué se complica]. Señal de regresión a vigilar: [métrica]. Si el cambio no aporta una mejora reproducible, registraré el hallazgo y retiraré la complejidad añadida.
`,
hang: String.raw`
## Distinguir espera, lentitud y bloqueo
¿Hay progreso observable? [contador, log o estado]. ¿El consumo de CPU es alto o bajo? [medición]. ¿La interfaz deja de responder o solo una operación? [alcance].
Toma más de una captura separada en el tiempo: una pila detenida durante unos milisegundos puede ser normal.

| Momento | Hilo / tarea | Pila o punto de espera | Recurso esperado | Dueño del recurso |
| --- | --- | --- | --- | --- |
| [t0] | [ID] | [Función] | [Lock / señal / I/O] | [Tarea] |
| [t1] | [ID] | [Función] | [Recurso] | [Tarea] |

## Dibujar la dependencia de espera
Ejemplo didáctico de ciclo; reemplázalo por la evidencia de tu caso:

~~~mermaid
flowchart LR
  A[Tarea A: tiene lock 1] -->|espera lock 2| B[Tarea B: tiene lock 2]
  B -->|espera lock 1| A
~~~

Si no hay ciclo, investiga una notificación perdida, una promesa que nunca se resuelve, trabajo infinito o una llamada sin límite de espera.

## Experimentos controlados
| Cambio aislado | Predicción | Observación | Qué descarta |
| --- | --- | --- | --- |
| [Reducir concurrencia] | [Resultado] | [Evidencia] | [Hipótesis] |
| [Simular respuesta fallida] | [Resultado] | [Evidencia] | [Hipótesis] |

## Recuperación y consistencia
- Al cancelar: ¿qué recursos se liberan y qué estado queda? [contrato].
- Al vencer el timeout: ¿se cancela el trabajo o solo deja de esperarse? [evidencia].
- Al reintentar: ¿puede ejecutarse dos veces la operación? [riesgo e idempotencia].
- Al cerrar: ¿queda alguna tarea capaz de escribir después? [comprobación].

## Prueba del arreglo
Controla el orden con señales o barreras en la prueba, evitando depender de pausas arbitrarias. Registra el intercalado que reproducía el fallo, el límite de tiempo del test y la comprobación final de que no quedaron recursos bloqueados.
`,
bugs: String.raw`
## Alcance y prioridad con evidencia
Personas o flujos afectados: [quién]. Frecuencia medida: [fallos / intentos]. Consecuencia: [pérdida, bloqueo o molestia]. Alternativa temporal: [pasos o ninguna].
Separa severidad técnica de urgencia del negocio: un fallo poco frecuente puede ser grave si pierde datos.

## Caso mínimo que otra persona puede ejecutar
Estado inicial: [datos y configuración]. Permisos necesarios: [lista]. Conectividad: [condición].

| Paso | Acción exacta | Estado que espero ver |
| --- | --- | --- |
| 1 | [Abrir pantalla y seleccionar dato] | [Estado inicial] |
| 2 | [Pulsar control o escribir entrada] | [Cambio] |
| 3 | [Comprobar resultado] | [Diferencia con lo esperado] |

Ejemplo de redacción: «Con dos notas de cuerpos distintos, abrir Papelera y seleccionar la segunda. El título cambia, pero el editor conserva el cuerpo de la primera». Es más útil que «la papelera está rota».

## Matriz para acotar
| Variante | Reproduce | Qué cambió respecto al caso base |
| --- | --- | --- |
| [Perfil nuevo] | [Sí / no] | [Configuración] |
| [Versión anterior] | [Sí / no] | [Versión] |
| [Otro dato de entrada] | [Sí / no] | [Contenido] |

## Adjuntos explicados
- Log: [ruta o enlace]. La línea relevante es [marca de tiempo] porque [motivo].
- Captura: [referencia]. Muestra [estado incorrecto].
- Reproducción pequeña: [archivo o enlace]. Ejecutar con [comando].
Elimina credenciales y datos personales antes de compartir los adjuntos.

## Seguimiento hasta el cierre
Responsable: [nombre]. Hipótesis actual: [explicación todavía no confirmada]. Corrección: [commit]. Versión probada: [número].
- [ ] Se repitieron los pasos originales con el arreglo.
- [ ] Se comprobó la alternativa temporal y su retirada.
- [ ] Se registró un límite conocido si el cierre es parcial.
`,
dependency: String.raw`
## Verificar qué se está ejecutando realmente
Versión declarada en el manifiesto: [valor]. Versión resuelta en el lockfile: [valor]. Versión cargada en runtime: [evidencia]. Dependencia directa o transitiva: [cadena].
Comprueba si hay dos copias del paquete, requisitos peer incompatibles o artefactos compilados para otro runtime. No borres el lockfile sin guardar el caso reproducible.

## Laboratorio mínimo
Repositorio o carpeta aislada: [ruta]. Instalación reproducible: [comando]. Archivo de reproducción: [ruta]. Ejecución: [comando y salida exacta].
Quita capas de la app hasta poder mostrar una llamada que produce el comportamiento inesperado.

## Matriz de compatibilidad
| Paquete | Runtime | Plataforma | Configuración | Resultado |
| --- | --- | --- | --- | --- |
| [Versión conocida] | [Versión] | [SO / arquitectura] | [Opciones] | [Correcto] |
| [Versión con fallo] | [Mismo runtime] | [Misma plataforma] | [Mismas opciones] | [Fallo] |
| [Versión candidata] | [Runtime] | [Plataforma] | [Opciones] | [Resultado] |

## Contrastar con documentación primaria
Contrato documentado: [enlace y sección]. Cambio de versión relevante: [changelog]. Incidencia existente: [enlace o no localizada].
¿La app dependía de un comportamiento no documentado? [evidencia]. ¿Es un cambio incompatible anunciado o un defecto? [razón].

## Mitigación con fecha de caducidad
Elegida: [fijar versión / adaptar / parche / sustituir]. Motivo: [impacto y coste].
Riesgos de permanecer en la versión anterior: [seguridad, soporte o compatibilidad]. Prueba que permitirá retirar el parche: [nombre]. Responsable y fecha de revisión: [datos].

## Entrega reproducible
- [ ] Manifiesto y lockfile reflejan la misma intención.
- [ ] La instalación desde cero reproduce la solución.
- [ ] Se comprobó el empaquetado y el entorno real.
- [ ] El reporte externo, si se comparte, incluye solo el caso mínimo sin secretos.
`,
reading: String.raw`
## Mapa del argumento
No confundas una idea interesante con una conclusión demostrada. Reconstruye cómo llega la fuente a su tesis.

| Afirmación | Razón o evidencia | Supuesto | Referencia exacta |
| --- | --- | --- | --- |
| [Tesis principal] | [Dato, ejemplo o argumento] | [Condición] | [Página / sección] |
| [Conclusión secundaria] | [Evidencia] | [Supuesto] | [Referencia] |

## Notas durante la lectura
- Antes de leer pensaba: [idea].
- Esto cambió mi comprensión: [pasaje resumido y por qué].
- Esto sigue sin convencerme: [objeción concreta].
- Término nuevo: [definición en contexto y ejemplo propio].

## Ejemplo de síntesis frente a copia
Si un artículo explica una caché, un resumen útil no es enumerar sus encabezados: describe qué trabajo evita, cuándo los datos quedan obsoletos y qué coste de memoria acepta. Después relaciona esos límites con tu propio caso.

Mi síntesis en un párrafo: [problema → propuesta → evidencia → límites].

## Contrastar con otra fuente
Fuente alternativa: [referencia]. Coincidencia: [punto]. Diferencia: [punto]. ¿Hablan del mismo contexto y usan la misma definición? [análisis].
Dato o experimento que ayudaría a decidir: [prueba]. No presentes tu interpretación como una cita del autor.

## Convertir lectura en acción
| Idea aplicable | Lugar donde la usaré | Pequeño experimento | Cómo evaluaré el resultado |
| --- | --- | --- | --- |
| [Idea] | [Proyecto / hábito] | [Acción esta semana] | [Evidencia] |

## Recuperación sin el texto
1. ¿Cuál es la tesis y qué problema intenta resolver? [respuesta al repasar].
2. ¿Cuál es su evidencia más fuerte? [respuesta].
3. ¿En qué situación no debería generalizarla? [respuesta].
4. ¿Qué conexión puedo hacer con [[Otra lectura]]? [conexión].

Próximo repaso: [fecha]. Una pregunta abierta que merece otra lectura: [pregunta].
`,
'deep-dive': String.raw`
## Recursos y ruta de aprendizaje
Fuente principal: [documentación, capítulo o clase con sección]. Recurso complementario: [referencia]. Prerrequisitos que debo aclarar primero: [lista breve].
Pregunta que guía esta exploración: [algo que quiero poder explicar o construir al terminar].

## Preguntas a medida que avanzo
| Pregunta | Respuesta provisional | Evidencia | Qué falta comprobar |
| --- | --- | --- | --- |
| [¿Por qué hace falta?] | [Idea propia] | [Fuente / experimento] | [Duda] |
| [¿Qué cambia si…?] | [Predicción] | [Prueba] | [Límite] |

## Ejemplo trabajado: idempotencia
Ejemplo didáctico, reemplazable por tu tema: marcar una tarea como completada deja el mismo estado aunque se repita; alternar su estado no, porque dos ejecuciones revierten el primer cambio.

~~~typescript filename="examples/idempotency.ts" title="Asignar frente a alternar"
type Task = { done: boolean };
const complete = (task: Task): Task => ({ ...task, done: true });
const toggle = (task: Task): Task => ({ ...task, done: !task.done });
const task = { done: false };
// complete(complete(task)).done === true
// toggle(toggle(task)).done === false
~~~

Pregunta de límite: ¿basta con que el estado final sea igual si cada llamada también envía un correo? [razona sobre los efectos secundarios].

## Construir mi propio ejemplo
Situación: [caso de uso]. Entrada mínima: [dato]. Predicción: [resultado]. Pasos internos: [mecanismo]. Salida real: [evidencia].
Cambia una condición y vuelve a predecir: [variante]. Si no puedes predecir el resultado, vuelve a la parte del mecanismo que aún no entiendes.

## Errores de comprensión frecuentes
| Confusión | Por qué resulta tentadora | Distinción correcta |
| --- | --- | --- |
| [Concepto A = concepto B] | [Similitud] | [Diferencia y contraejemplo] |

## Lo que me llevo
- Regla breve que sí puedo usar: [regla].
- Límite que no debo olvidar: [condición].
- Aplicación a mi proyecto: [cambio pequeño].
- Pregunta que todavía no puedo responder: [pregunta y siguiente recurso].
`,
'feature-plan': String.raw`
## Flujo antes y después
Situación actual: [pasos, esfuerzo y punto de fallo]. Situación propuesta: [pasos y resultado visible].
Ejemplo de criterio concreto: «Al vaciar la papelera, se muestra cuántas notas se eliminarán; Cancelar conserva todas; Confirmar elimina solo las notas en papelera». Evita criterios como «que funcione bien».

## Estados y transiciones
| Estado | Acción | Estado siguiente | Feedback para el usuario |
| --- | --- | --- | --- |
| [Vacío] | [Crear] | [Editando] | [Foco y ayuda] |
| [Editando] | [Guardar] | [Guardado / error] | [Confirmación / recuperación] |
| [Operación pendiente] | [Cancelar] | [Estado anterior] | [Resultado] |

## Contratos y datos
Entrada: [tipo, límites y validación]. Salida: [tipo y errores]. Persistencia: [campos y dueño].
Compatibilidad con datos existentes: [cómo leerlos sin perder información]. Concurrencia: [qué ocurre si cambia el dato mientras la acción está abierta].
Privacidad y permisos necesarios: [datos y destino, si aplica].

## División en entregas revisables
| Entrega | Comportamiento usable | Dependencias | Prueba observable |
| --- | --- | --- | --- |
| 1 | [Mínimo completo] | [Ninguna / requisito] | [Caso] |
| 2 | [Mejora posterior] | [Entrega 1] | [Caso] |

## Plan de pruebas centrado en riesgos
- Camino habitual: [entrada y resultado].
- Sin datos / dato muy largo: [resultado].
- Error de red o disco, si aplica: [recuperación].
- Teclado, foco y cierre del diálogo: [comportamiento].
- Tema, tamaño de ventana y accesibilidad: [comprobación].
- Regresión más probable: [flujo anterior que debe conservarse].

## Entrega y aprendizaje
Señal de éxito: [uso o resultado medible]. Cómo observarla: [prueba o métrica]. Responsable: [nombre].
Preguntas que pueden posponerse: [lista]. Pregunta que bloquea la implementación: [decisión y fecha].
`,
'refactor-plan': String.raw`
## Dibujar la frontera del cambio
Módulos incluidos: [rutas]. Consumidores que dependen de ellos: [lista]. APIs públicas que no cambian: [contratos].
Evita mezclar una nueva función de producto con el cambio estructural: si es necesaria, descríbela como una entrega separada que pueda comprobarse por sí misma.

## Inventario del comportamiento existente
| Entrada o evento | Salida / error | Efecto secundario | Prueba actual |
| --- | --- | --- | --- |
| [Caso habitual] | [Resultado] | [Persistencia / evento] | [Nombre] |
| [Caso límite] | [Resultado] | [Efecto] | [Falta / nombre] |

Cuando no esté claro si un comportamiento extraño es intencional, documenta la duda antes de «corregirlo» dentro del refactor.

## Ejemplo de secuencia segura
Para separar almacenamiento de interfaz:
1. Capturar con pruebas cómo carga, guarda y falla el flujo actual.
2. Introducir una función de acceso con el mismo contrato.
3. Mover una operación detrás de esa función y comprobarla.
4. Migrar los consumidores uno a uno.
5. Retirar la ruta antigua cuando ningún consumidor la use.

Mi secuencia concreta:
| Commit | Movimiento de código | Comportamiento que protege | Cómo revertir |
| --- | --- | --- | --- |
| [1] | [Cambio acotado] | [Prueba] | [Acción] |
| [2] | [Cambio acotado] | [Prueba] | [Acción] |

## Riesgos de estado y ciclo de vida
- Referencias o cachés que podrían quedar obsoletas: [ubicación].
- Recursos que cambian de dueño: [suscripción, archivo, conexión].
- Orden de inicialización y cierre: [antes / después].
- Serialización o datos guardados: [compatibilidad].

## Evaluar si valió la pena
Antes necesitaba tocar [archivos] para [cambio real]; después necesito [archivos]. Las responsabilidades se distinguen porque [explicación].
Complejidad añadida que acepto: [coste]. Abstracción que retiré o evité: [motivo]. Deuda pendiente fuera del alcance: [tarea concreta].
`,
};
