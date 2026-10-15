# Verificación 1.3.0

93 comprobaciones distintas aprobadas, sin contar repeticiones:

- 34 pruebas unitarias de almacenamiento, snapshots, enlaces, exportación, IA local, catálogo, metadatos de código y atajos.
- 14 comprobaciones de regresión de escritorio desde el proyecto y el ejecutable 1.3.
- 12 comprobaciones de enlaces, Vim, números relativos y compatibilidad, desde el proyecto y el ejecutable 1.3.
- 16 comprobaciones de plantillas, temas, exportación, predicción simulada y persistencia, desde el proyecto y el ejecutable 1.3.
- 16 comprobaciones nuevas de la versión 1.3 en el ejecutable empaquetado; las primeras 15 también se comprobaron desde el proyecto.
- Una integración con Ollama real y qwen2.5-coder:3b desde el ejecutable 1.3: sugerencia de código, aceptación con Tab y comprobación exacta del texto guardado.

## Funciones nuevas comprobadas

Catálogo de 17 plantillas incluidas, categorías, búsqueda, plantillas personales y creación de notas editables sin modificar el original. El catálogo incluido no se escribe como notas en la colección. Una nota vacía ofrece el selector y conserva su título al aplicar una plantilla.

Etiquetas en línea con Enter, sugerencias y Escape. Menú contextual sobre la nota correcta: duplicar, fijar, mover, copiar referencia, enviar a papelera y restaurar. Selector de estado temático y presencia de la animación de salida de diálogos.

Mermaid real, actualización con el tema, errores de sintaxis recuperables y eliminación de enlaces ejecutables. Código con filename, title y números de línea. Exportación HTML/PDF con SVG renderizado, encabezados de código y tema independiente.

Atajos personalizados, conflictos, persistencia tras reinicio y restablecimiento. Notas y ajustes sobreviven al reinicio sin errores JavaScript.

## Ollama real

Se descargó qwen2.5-coder:3b (3,1B, Q4_K_M) y se activó en el archivo independiente de configuración de IA del usuario. Se comprobó el servidor local y la integración usando únicamente texto ficticio. La prueba final del ejecutable tardó aproximadamente siete segundos desde insertar el prefijo hasta aceptar y guardar la sugerencia, incluyendo la pausa de escritura y carga del modelo. Los tiempos varían con el equipo y la carga; no son una garantía.

Las pruebas simuladas adicionales verifican IA desactivada sin solicitudes, cancelación al cambiar de nota, descarte con Escape, interacción con Vim, fallo del servidor sin impedir el guardado, rechazo de modelos remotos y desactivación persistente. Hermes no se modificó.

## Revisión visual y entrega

- Compilación Vite y empaquetado Electron Windows x64 correctos. El aviso de tamaño de bundle no impide compilar; Mermaid se carga bajo demanda.
- Capturas Gruvbox del editor, diagrama y menú de estado inspeccionadas.
- PDF final renderizado con Poppler: una página, diagrama completo, metadatos y código legibles. La regresión también comprueba exportación larga multipágina.
- HTML incluye estilos y SVG propios, con política que bloquea scripts. PDF adapta la vista a A4; no es una captura de los paneles de la app. Imágenes HTTPS siguen siendo externas y enlaces internos se exportan como texto.
- Esquema de notas 1 conservado. Snapshot inmutable notes.before-v1.3.0.json antes de guardar una colección existente. Las pruebas usan perfiles aislados, nunca la colección personal.
- Ejecutables anteriores verificados por SHA-256 y conservados. Entrega versionada con código, bundle Git y ZIP comprobado mediante CRC.

## Límites de la comprobación

El entorno automatizado no permite comprobar el portapapeles nativo de Windows: la prueba sustituye únicamente sus métodos en el proceso de prueba y verifica la referencia enviada por IPC. La app normal escribe y comprueba la lectura del portapapeles; muestra error si no puede acceder.

Los lanzadores de pruebas usan --no-sandbox y --disable-gpu por restricciones del entorno. No se incorporan al ejecutable normal: el editor conserva sandbox, aislamiento de contexto y Node desactivado. Los primeros intentos del turno fallaron al abrir conexiones locales bloqueadas por permisos; después de conceder acceso, las suites terminaron correctamente.

No se probaron otros sistemas operativos, firma comercial, plugins ni colecciones de tamaño extremo. Las animaciones y estilos son propios inspirados en las referencias; no se afirma equivalencia exacta con Inkdrop. La calidad semántica de las sugerencias de IA requiere revisión del usuario.
