# Verificación 1.4.0

112 comprobaciones automatizadas distintas aprobadas, sin contar repeticiones:

- 41 unitarias: almacenamiento y recuperación, snapshots, enlaces, predicción local, exportación, categorías, metadatos, atajos y contexto de prosa/código.
- 14 de escritorio base: creación, tareas, estado, etiquetas, búsqueda, vistas, enlaces, papelera, cierre y persistencia. Ejecutadas en el paquete 1.4.
- 12 de Vim, enlaces y compatibilidad de versiones, desde el proyecto.
- 16 de plantillas, exportación HTML/PDF, IA simulada, cancelación, Vim y persistencia, desde el proyecto.
- 16 de biblioteca, menús, etiquetas, Mermaid, metadatos, controles inertes y atajos personalizados. Desde el proyecto y el paquete 1.4.
- 12 nuevas de la versión 1.4, desde el proyecto y el paquete final.
- Una integración real con qwen2.5:7b: sugerencia, aceptación con Tab y verificación exacta del contenido guardado en un perfil de prueba del ejecutable 1.4.

## Casos nuevos

Copiar código sin título, ruta ni números; Mermaid copia su fuente y genera una imagen PNG válida; zoom, desplazamiento y reset; diálogo ampliado con Escape, devolución del foco y bloqueo de atajos detrás del diálogo. HTML conserva SVG sin botones. Se comprueba que un diagrama horizontal cabe en el ancho disponible.

Negrita, deshacer y rehacer sin Vim; cursiva en insertar y negrita en visual; Ctrl+N desde ambos modos con el editor enfocado; tareas, encabezados y búsqueda local. Las combinaciones ya personalizadas sobreviven a la incorporación de nuevos atajos.

La IA recibe prosa sin código anterior, no encadena solicitudes al aceptar, rechaza Rust dentro de SQL y permite aceptar un bloque Mermaid y verlo renderizado. Las pruebas unitarias cubren cercas dentro de citas, contextos extensos, cierres correctos, separación entre palabras y eliminación de prefijos repetidos.

## Comparación real de modelos

Se probaron cuatro entradas ficticias con qwen2.5-coder:3b y qwen2.5:7b. El modelo de 7B produjo mejores continuaciones en estos ejemplos: prosa en español, una explicación de ramas de Git, SQL y un diagrama con editar → git add → git commit. Las últimas consultas directas con el modelo cargado tardaron aproximadamente 0,3–0,8 segundos; la prueba final dentro de la app tardó unos 1,9 segundos incluyendo la pausa de escritura y guardado. No son garantías de latencia ni una evaluación general de calidad.

Se conservó el modelo 3B, se guardó ollama.before-v1.4.0.json y se seleccionó qwen2.5:7b. Las pruebas no abrieron ni editaron las notas personales. Los filtros reducen errores de contexto, pero no garantizan que todas las sugerencias sean correctas.

## Revisión visual y empaquetado

- Build Vite y paquete Electron Windows x64 correctos. Mermaid continúa cargándose bajo demanda; persiste el aviso de tamaño de bundle.
- Captura final del ejecutable revisada: diagrama horizontal completo, iconos, controles, márgenes y tema oscuro.
- Exportaciones HTML/PDF de regresión mantienen diagramas y código; HTML no contiene controles interactivos. El PDF mantiene paginación y tema; no es una captura píxel a píxel de la ventana.
- Código etiquetado, manifest de versión, ZIP con comprobación CRC y bundle Git completo. Los ejecutables anteriores se comparan por SHA-256.

## Límites del entorno

El portapapeles nativo de Windows no está disponible para automatización. Las pruebas sustituyen sus métodos únicamente dentro del proceso de prueba, verifican el texto recibido y comprueban que la imagen PNG generada se decodifica como nativeImage no vacía. La aplicación normal comprueba el resultado y muestra un fallo si no puede copiar.

Los procesos de prueba usan --no-sandbox y --disable-gpu, que no forman parte del lanzamiento normal. La app mantiene sandbox, aislamiento de contexto y Node desactivado en el editor. Todos los perfiles de prueba están aislados. Algunos intentos iniciales fallaron por permisos locales retirados al reanudar el chat, por selectores que también encontraban los nuevos iconos SVG y por una respuesta simulada que repetía siempre el mismo texto; se corrigieron el entorno o las pruebas y las suites finales pasaron.

No se probaron otros sistemas operativos, firma comercial, plugins ni todas las posibles sintaxis de Mermaid. Las combinaciones de Inkdrop y Obsidian no son idénticas: se documentan las disponibles en Tinta y se permite personalizarlas.
