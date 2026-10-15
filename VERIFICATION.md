# Verificación 1.5.0

128 comprobaciones automatizadas distintas aprobadas, sin contar repeticiones:

- 44 unitarias: almacenamiento, recuperación, snapshots, enlaces, exportación, predicción local, categorías, metadatos, atajos, división de resaltado multilínea y vaciado de papelera con selección válida.
- 14 de escritorio base, sobre el ejecutable 1.5: creación, Markdown, tareas, búsqueda, vistas, enlaces, papelera, cierre y persistencia.
- 12 de Vim, enlaces y compatibilidad, desde el proyecto.
- 16 de plantillas, exportación HTML/PDF, cancelación de IA simulada y persistencia, desde el proyecto.
- 16 de biblioteca, menús, etiquetas, Mermaid, metadatos, controles inertes y atajos personalizados, sobre el ejecutable 1.5.
- 12 de controles del preview, formato y atajos con Vim, contexto de prosa/SQL y sugerencias Mermaid, sobre el ejecutable 1.5.
- 14 de la versión 1.5, desde el proyecto y sobre el ejecutable final.

## Casos específicos de esta entrega

Se compara el cuerpo completo de varias plantillas incluidas, una plantilla personal y dos notas en papelera, con Vim activado y desactivado. Se comprueba que el título y el preview correspondan, que el editor permanezca de solo lectura cuando corresponde, que navegar no cambie las notas y que el historial de deshacer sobreviva al regreso a la nota editable.

Los previews aparecen con hover y foco de teclado, permiten desplazar el contenido y cierran con Escape. No cambian la selección ni crean notas. El selector Ctrl+T aplica el cuerpo ampliado completo. Se verificó y corrigió el caso de desplazamiento de la lista inmediatamente después de pasar el ratón.

El botón de vaciado y el menú contextual requieren confirmación. Cancelar recibe el foco inicial y conserva las notas. Confirmar incluye las notas ocultas por búsqueda y conserva notas activas y plantillas. El menú admite Shift+F10 y queda deshabilitado con papelera vacía. Las pruebas unitarias cubren notas restauradas después de abrir la confirmación, notas recién enviadas a papelera y eliminación de la última nota de una colección. El reinicio confirma la persistencia y el snapshot previo intacto.

Los bloques numerados y de texto ajustan líneas sin desbordamiento horizontal. Los números siguientes se colocan después de toda la altura de la línea anterior. Se verifica copia exacta de tabulaciones, Unicode, espacios y saltos de línea, sin números ni metadatos. Los comentarios multilínea conservan el resaltado, incluidas líneas vacías.

La imagen copiada se decodifica como PNG y se examinan sus píxeles: esquina transparente, píxeles exteriores con alfa cero y figuras con píxeles opacos. El fondo de la app sigue visible. La exportación HTML mantiene código ajustado y SVG sin botones interactivos; las suites anteriores también validan PDF y temas de exportación.

## Revisión y empaquetado

- Compilación Vite y empaquetado Electron Windows x64 correctos. Persiste el aviso de tamaño de bundle; no impide compilar ni arrancar.
- Capturas del preview de plantilla y de código/diagrama revisadas en Gruvbox. Pruebas anteriores cubren selectores y diagramas al cambiar entre claro y oscuro.
- Git: rama de desarrollo separada, merge local a main y etiqueta v1.5.0. Código, guía, verificación y manifest acompañan la entrega.
- ZIP comprobado por CRC. SHA-256 de ejecutables anteriores comparados antes y después del trabajo.

## Límites de las pruebas

Las pruebas usan perfiles aislados, con notas ficticias. No leen ni modifican la colección personal. Ollama se simula en las suites de regresión; esta entrega no cambia modelos ni repite la evaluación real realizada en 1.4.

El portapapeles nativo de Windows no está disponible en este entorno de automatización. Se sustituyen sus métodos solo dentro del proceso de prueba y se verifica el texto y la imagen PNG que reciben. No se comprobó el pegado en Word ni el formatter de un editor externo: el destino decide si conserva la transparencia y si formatea al pegar.

Los procesos de prueba usan --no-sandbox y --disable-gpu, solo en pruebas. El lanzamiento normal conserva sandbox, aislamiento de contexto y Node desactivado en el editor. Una reanudación del chat revocó el permiso temporal para conexiones locales; se restableció y todas las suites finales pasaron. Los primeros intentos también corrigieron un selector interno del editor y el comportamiento de hover al desplazar la lista.

Vaciar papelera elimina notas de la colección actual. No purga backups o snapshots históricos ni equivale a un borrado seguro del disco. El formato de guardado permanece compatible con el esquema 1.
