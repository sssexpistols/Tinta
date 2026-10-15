# Tinta 1.5.0 — plantillas completas y preview más práctico

Cierra normalmente la versión anterior y abre `Tinta-1.5.0-Windows/Tinta-win32-x64/Tinta.exe`. La esquina superior muestra **Tinta 1.5**. Conserva la carpeta completa o extrae el ZIP antes de abrirlo.

## Cambios de esta versión

- **Plantillas y Papelera:** el editor Markdown carga el cuerpo correcto al cambiar de documento, también con Vim. Volver a una nota conserva su historial de deshacer.
- **Preview de plantillas:** deja el ratón sobre una tarjeta unos instantes, en la biblioteca o en Ctrl+T. También aparece con foco de teclado. Puedes mover el ratón al preview y desplazarte por su contenido. Escape lo cierra. Ver el preview no selecciona, crea ni modifica notas.
- **17 plantillas ampliadas:** cada estructura contiene preguntas guía, tablas, ejemplos o experimentos y un cierre adaptado a su propósito. Los ejemplos didácticos están identificados para que puedas reemplazarlos. Tus plantillas personales no se reescriben. Las notas que ya creaste desde una plantilla tampoco cambian.
- **Vaciar papelera:** botón en el panel y opción al hacer clic derecho sobre Papelera (o Shift+F10). La confirmación indica el total, incluidas notas ocultas por la búsqueda. Cancelar no elimina nada. Confirmar elimina las notas de la colección; no es un borrado seguro de los snapshots o copias de seguridad existentes.
- **PNG transparente:** Copiar imagen del diagrama conserva colores, figuras y texto del tema, con el exterior transparente. El fondo de la vista previa permanece igual. Algunos programas de destino pueden aplanar la transparencia al pegar; el PNG generado por Tinta contiene canal alfa.
- **Código con ajuste de línea:** las líneas largas se ajustan al ancho de la vista previa, incluidos bloques numerados. El botón Copiar código conserva tabulaciones, espacios y saltos reales: no añade saltos visuales ni números de línea. Para aplicar automáticamente el formatter al pegar, activa esa opción en el editor de destino.

Las categorías son Estudio, Desarrollo, Investigación, Planning, Organización y Mis plantillas. Incluyen Cornell, sesiones de estudio, código limpio, patrones, despliegue, tareas, errores, decisiones de arquitectura, exploración del código, rendimiento, bloqueos, dependencias, lecturas, conceptos, planificación de funciones y refactoring.

## Controles en la vista previa

Los diagramas Mermaid tienen botones para **copiar su fuente**, **copiar una imagen PNG**, **acercar**, **alejar**, **restablecer** y **ampliar**. Arrastra el diagrama para desplazarte. Con el diagrama enfocado puedes usar `+`, `-`, `0` y las flechas; Ctrl+rueda ajusta el zoom. Escape cierra la vista ampliada y devuelve el foco al botón de apertura.

El botón **Copiar código** copia únicamente el contenido del bloque, sin filename, título ni números de línea. Los controles respetan el tema y no aparecen en las exportaciones HTML/PDF. La exportación conserva el diagrama completo, independientemente del zoom de la ventana.

## Predicción de texto, código y Markdown

La app distingue el bloque actual antes de limitar el contexto. En prosa excluye los bloques de código anteriores; dentro de un bloque usa su lenguaje y su contenido. Conserva el párrafo cercano, el título y el encabezado como orientación. También reconoce cercas dentro de citas y bloques largos.

Al escribir una frase, intenta continuar esa frase. Para invitar una estructura, termina el párrafo con una indicación y deja una línea vacía, por ejemplo:

- `Los pasos para preparar un commit son:` → lista.
- `Un ejemplo de este comando:` → ejemplo en Markdown.
- `Este diagrama muestra editar archivos, preparar cambios con git add y registrar con git commit:` → bloque Mermaid.

**Tab** acepta y **Esc** descarta. Aceptar ya no inicia una cadena de nuevas peticiones: la siguiente sugerencia espera una nueva edición. Se filtran respuestas de código fuera de contexto, duplicados y repeticiones del prefijo. Una respuesta descartada no aparece ni modifica la nota.

Se seleccionó **qwen2.5:7b** para este equipo, tras compararlo con qwen2.5-coder:3b usando ejemplos ficticios de español, Git, SQL y Mermaid. El modelo anterior permanece instalado y puede elegirse en Preferencias. La descarga ocupa unos 4,7 GB; la generación utiliza exclusivamente el servidor local. Hermes no se modificó.

En la comparación, las consultas del modelo cargado tardaron aproximadamente 0,3–0,8 segundos; la primera carga tardó más. La app añade una pausa de escritura antes de consultar. Son observaciones, no garantías. Los modelos pueden equivocarse: revisa las afirmaciones, el código y los diagramas antes de aceptar.

Referencia del modelo: [Qwen2.5 en Ollama](https://ollama.com/library/qwen2.5).

## Atajos y Vim

Los atajos de la app tienen prioridad sobre Vim. **Ctrl+N crea una nota desde el editor también en insertar y visual.** Los comandos normales de Vim siguen disponibles; Ctrl+N/P dejan de estar reservados para el autocompletado de Vim porque se usan para acciones de Tinta.

Los comandos de Markdown actúan cuando el editor tiene el foco. Ahora también aparecen en **Preferencias → Personalizar atajos de teclado**. Puedes cambiar sus combinaciones y restablecerlas. Si un nuevo atajo coincide con una combinación personalizada de la versión 1.3, se conserva la combinación antigua y se asigna otra disponible al nuevo comando.

| Acción | Teclas iniciales |
| --- | --- |
| Negrita / cursiva | Ctrl+B / Ctrl+I |
| Tachado | Ctrl+Shift+X |
| Enlace | Ctrl+Shift+K |
| Código en línea / bloque | Ctrl+E / Ctrl+Shift+C |
| Lista de tareas | Ctrl+Alt+T |
| Viñetas / lista numerada | Ctrl+Alt+L / Ctrl+Alt+O |
| Cita | Ctrl+Alt+Q |
| Tabla / separador | Ctrl+Alt+B / Ctrl+Alt+R |
| Encabezados 1–6 | Ctrl+Alt+1…6 |
| Buscar en la nota | Ctrl+F |
| Deshacer / rehacer | Ctrl+Z / Ctrl+Y; Ctrl+Shift+Z también rehace |
| Nueva nota / guardar | Ctrl+N / Ctrl+S |
| Buscar y abrir nota | Ctrl+K; Ctrl+P conserva su alias si está libre |
| Plantilla en nota vacía | Ctrl+T |
| Preferencias | Ctrl+, |

Las combinaciones de diferentes editores no son idénticas: Tinta mantiene Ctrl+K para buscar notas y Ctrl+Shift+K para enlaces. Se pueden personalizar. Las operaciones de formato envuelven el texto seleccionado o insertan un campo de ejemplo si no hay selección; no activan un modo de texto enriquecido permanente.

## Datos, desarrollo y versiones

Se conserva el esquema 1 y la misma colección local. Al abrir una colección existente se crea `notes.before-v1.5.0.json` una sola vez antes de los guardados de esta versión. No reemplaza snapshots anteriores. Las pruebas utilizan perfiles separados, nunca las notas personales.

La configuración local de Ollama se mantiene; esta entrega no cambia ni descarga modelos. No modifica la integración de IA, sus filtros de contexto ni los atajos de la versión 1.4.

Desarrollo en `feat/templates-trash-preview-fixes`, worktree separado, merge local probado a `main` y etiqueta `v1.5.0`. No se publica a un remoto. Los ejecutables anteriores siguen disponibles. Evita abrir simultáneamente dos versiones sobre la misma colección: se detectan escrituras externas para impedir sobrescrituras.

El ZIP de código contiene la versión etiquetada y el archivo `.bundle` conserva el historial Git. Para desarrollar: `npm ci`, `npm run build`, `npm test`. La suite nueva se ejecuta con `npm run test:desktop:v15` y crea su propio perfil aislado. Consulta `VERIFICATION.md` para conocer las pruebas realizadas y sus límites.
