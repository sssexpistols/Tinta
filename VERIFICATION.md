# Verificación 1.2.0

71 comprobaciones distintas aprobadas, sin contar repeticiones:

- 29 pruebas unitarias: almacenamiento, compatibilidad, snapshots, enlaces, predicción local y construcción segura del documento exportado.
- 14 comprobaciones de regresión 1.0 desde el proyecto.
- 12 comprobaciones de enlaces y Vim 1.1, desde el proyecto y desde el ejecutable 1.2 empaquetado.
- 16 comprobaciones 1.2 en el ejecutable empaquetado. Las primeras 14 también se comprobaron desde el proyecto; paginación larga y fallo de generación se añadieron al recorrido final empaquetado.

## Casos nuevos

IA desactivada sin conexiones; Ctrl+T conserva identidad y título; no reemplaza texto existente; menús temáticos con teclado; cursor suave en ambos modos y movimiento reducido; HTML con tema independiente y saneado; PDF real con colores; apertura independiente de HTML; exportación multipágina; aceptación de texto fantasma con Tab; descarte con Esc; cancelación al cambiar de nota; interacción con Vim normal/insertar; fallo del servidor sin impedir guardado; desactivación sin nuevas solicitudes; persistencia al reiniciar y ausencia de errores JavaScript.

Las pruebas de IA usan un servidor HTTP ficticio en un puerto loopback aleatorio y notas artificiales. Se comprueba el contrato `/api/tags`, `/api/show`, `/api/generate`, contexto limitado, rechazo de modelos remotos, cancelación y tratamiento de errores. La integración no se ha evaluado con un modelo real: Ollama no se encontró en PATH ni en las ubicaciones estándar revisadas. No se descargaron modelos.

## Revisión visual y archivos

- Compilación de producción Vite y paquete Electron Windows x64 correctos. Persiste el aviso de tamaño de bundle; no impide la compilación.
- Capturas de la app Gruvbox y HTML claro inspeccionadas.
- PDF Gruvbox renderizado con Poppler: código Rust, tabla, tareas y texto legibles.
- PDF largo: nueve páginas; extracción con pypdf conserva las 90 secciones y el marcador final. Primera y última página renderizadas para revisar la paginación.
- Los archivos HTML incluyen estilos propios, resaltado, título escapado y política que bloquea scripts. Las imágenes HTTPS siguen siendo externas.
- La configuración de IA queda fuera de notas y backups JSON. La colección conserva esquema 1 y los campos compatibles con versiones anteriores.

Los lanzadores automatizados usan `--no-sandbox --disable-gpu` por las restricciones del entorno de pruebas. No se incorporan al ejecutable ni a sus accesos directos normales. La aplicación mantiene sandbox, aislamiento de contexto y Node desactivado en el editor. Todos los perfiles de prueba están aislados; no se abrió la colección personal.

## Límites comprobados

El PDF conserva el estilo, pero adapta la vista continua a páginas A4; no es una captura píxel a píxel de la ventana. Los enlaces internos se exportan como texto y las imágenes web necesitan conexión. No se probaron un modelo real, otros sistemas operativos, una firma comercial, plugins, un servidor Ollama modificado ni colecciones de tamaño extremo. Los estilos son propios inspirados en las referencias; no se afirma equivalencia exacta con cada animación de Inkdrop.
