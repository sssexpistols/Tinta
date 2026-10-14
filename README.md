# Tinta 1.2.0 — plantillas, exportación visual y predicción local

Abre `Tinta-1.2.0-Windows/Tinta-win32-x64/Tinta.exe`. Si usas el ZIP, extráelo y conserva la carpeta completa.

## Actualizar

1. Cierra la versión anterior normalmente para que termine de guardar.
2. Abre Tinta 1.2. Tus notas aparecerán desde la misma carpeta `%APPDATA%\Tinta`.
3. Antes de guardar una colección existente se conserva `notes.before-v1.2.0.json`. Esa copia no se reemplaza en los siguientes inicios. Se mantienen los respaldos rotativos y las copias de actualizaciones anteriores.

Se conservan los ejecutables y ZIP de 1.0 y 1.1. Los datos mantienen el esquema 1. Una sola versión puede abrir la colección a la vez. El programa es portable y no tiene firma comercial.

## Menús, cursor y estilos

Los selectores de estado, libreta y orden usan el tema activo, incluidos iconos, resaltado, animación y navegación con flechas, Enter y Escape. El cursor usa una transición suave de opacidad, tanto en escritura normal como en Vim. Se respeta la preferencia de reducir movimiento de Windows.

El tema Gruvbox incluye colores cálidos, enlaces y bloques de código con lenguaje y resaltado. Se conservan las referencias `[[...]]`, la creación con espacios, backlinks, Vim, números relativos y las tres vistas.

## Plantillas

En una nota vacía pulsa **Ctrl+T**. La plantilla se aplica a esa misma nota y conserva su identidad y un título personalizado. Si ya existe texto, el atajo no lo reemplaza. También puedes crear una nota desde el menú **Crear desde plantilla**.

Disponibles para todas las colecciones, además de tus propias plantillas:

- Sesión de estudio: objetivo, ideas, práctica y repaso.
- Apuntes Cornell: preguntas, apuntes y resumen.
- Revisión de código limpio: intención, responsabilidades, errores y pruebas.
- Patrón de diseño: problema, alternativa simple, participantes y decisión.
- Despliegue de una app: preparación, publicación, comprobación y vuelta atrás.
- Tareas y prioridades: hoy, pendientes, bloqueos y próximos pasos.
- Investigación de un error: reproducción, hipótesis y regresión.
- Decisión de arquitectura: opciones, motivos y consecuencias.

Rellena los campos entre corchetes. Las plantillas incluidas son estructuras de partida; no se agregan como notas ni duplican tus plantillas al actualizar. Puedes guardar una copia modificada como plantilla personal desde el menú de la nota.

## Exportar lo que ves

Abre **Opciones de la nota → Exportar vista previa…** y elige:

- **HTML:** documento independiente con estilos y resaltado incluidos, para abrir en un navegador.
- **PDF:** documento paginado en A4 que conserva colores, tablas, tareas y código.
- **Oscuro, Claro o Gruvbox**, independientemente del tema de edición.
- Incluir o quitar fechas y referencias entrantes.

Se exporta el contenido renderizado completo, no una captura de la ventana ni solo el fragmento visible. PDF adapta el contenido al papel, por lo que los saltos de línea y página pueden diferir de la vista dividida. Las referencias internas se conservan como texto; no incluyen el resto de la colección. Las imágenes web requieren conexión y no se incrustan como archivos locales. El Markdown editable sigue disponible en **Exportar Markdown**; la copia JSON conserva toda la colección.

## Predicción con Ollama

Desactivada inicialmente. Requiere [Ollama para Windows](https://ollama.com/download/windows) y un modelo descargado localmente. Esta entrega no instala Ollama ni descarga modelos automáticamente.

1. Abre Ollama y descarga un modelo apropiado para la memoria de tu equipo.
2. En Tinta abre **Preferencias → Predicción local · Ollama**.
3. Pulsa **Buscar modelos locales**, elige uno y **Activar predicción**.
4. Escribe y haz una pausa. La sugerencia aparece en texto tenue: **Tab** la inserta; **Esc** la descarta. También puedes seguir escribiendo para descartarla.

En Vim solo se solicita mientras estás en modo insertar. Esc descarta y vuelve a normal. Una sugerencia no se guarda hasta que la aceptas y se cancela al editar, cambiar de nota o salir del editor. Se puede desactivar desde Preferencias.

La app se conecta únicamente a `http://127.0.0.1:11434`, no admite redirecciones ni proveedores externos y rechaza modelos identificados como remotos o de nube. Envía al servidor local hasta 6.000 caracteres anteriores y 1.000 posteriores al cursor; no envía otras notas. La configuración vive en `ollama.json`, fuera de las exportaciones de notas. No necesitas API key. Los modelos no confiables o un servidor local modificado quedan fuera de esta comprobación.

La integración fue probada con un servidor Ollama de prueba local: descubrimiento, generación, aceptación, cancelación, fallos y Vim. No se midió calidad ni velocidad con un modelo real instalado en este equipo. Si Ollama no está disponible, puedes seguir escribiendo y guardando normalmente.

## Git y recuperación

El código está en `Tinta`. La versión se desarrolló en `feat/templates-export-ollama` dentro de otro worktree, con datos ficticios aislados, antes de fusionarla a `main` y etiquetarla como `v1.2.0`. No se publicó un repositorio remoto.

El archivo `Tinta-1.2.0-repositorio.bundle` conserva el historial y las etiquetas. Para restaurarlo:

```powershell
git clone Tinta-1.2.0-repositorio.bundle Tinta
```

Cada versión futura debe seguir `AGENTS.md`: rama separada, pruebas, merge y carpeta de distribución nueva. Las pruebas nunca utilizan las notas personales.

## Atajos principales

| Atajo | Acción |
| --- | --- |
| Ctrl+N | Nueva nota |
| Ctrl+T | Plantilla en nota vacía |
| Ctrl+K | Buscar y abrir |
| Ctrl+Shift+F | Buscar en todas las notas |
| Ctrl+Shift+P | Cambiar vista |
| Ctrl+, | Preferencias |
| Ctrl+S / Vim `:w` | Guardar |
| `[[` | Enlazar o crear nota |
| `/` | Insertar bloque Markdown |
| Tab / Esc | Aceptar / descartar sugerencia local |

## Desarrollo

```powershell
npm ci
npm run build
npm test
npm run test:desktop
npm run test:desktop:v11
npm run test:desktop:v12
```

Las pruebas crean sus propias carpetas `.test-results`. `test:desktop:v12` levanta un servidor ficticio en un puerto local aleatorio; no usa tu Ollama real. Las opciones `--no-sandbox --disable-gpu` están limitadas a los lanzadores de prueba para el entorno automatizado. La aplicación distribuida conserva sandbox, aislamiento de contexto y acceso a Node desactivado en el editor.

Referencias de implementación: [API de generación de Ollama](https://docs.ollama.com/api/generate), [modelos locales](https://docs.ollama.com/api/tags), [exportación PDF de Electron](https://www.electronjs.org/docs/latest/api/web-contents#contentsprinttopdfoptions).
