# Verificación 1.7.0

## Pruebas locales

- 60 casos unitarios: almacenamiento y recuperación, contexto de IA, configuración opcional, enlaces, importación UTF-8/UTF-16, anotaciones, notas al pie, cálculo seguro y compatibilidad de atajos.
- 92 casos de las suites de escritorio anteriores: editor, Vim, plantillas, papelera, exportación, IA simulada y ciencia.
- 11 escenarios nuevos de escritorio: apertura al iniciar y con la app abierta, archivos arrastrados, Ctrl+O, formato/undo, notas al pie, biblioteca, cálculos, siete tipos Mermaid, copia PNG transparente y exportación HTML.

Las pruebas usan TINTA_DATA_DIR aislados, nunca las notas del usuario. Los archivos Markdown de prueba se verifican sin modificaciones tras abrirlos.

Los diagramas de flujo, secuencia, estado, clases, entidades, mapas mentales y pastel se prueban con texto largo. Se comparan los límites del contenido SVG con el viewBox y con un viewport estrecho, se comprueba ajuste de líneas y se inspecciona la captura ampliada. Los títulos largos de plot se comprueban dentro del SVG.

El cálculo numérico se contrasta con valores conocidos; entradas no finitas o código JavaScript se rechazan. Se preservan las advertencias sobre aproximaciones y se comprueba que el HTML exportado contiene fórmulas, anotaciones, referencias y resultados resueltos.

## Instalador y publicación

El workflow de Windows repite las suites desde el lockfile, construye NSIS y prueba las suites 1.6 y 1.7 sobre el ejecutable empaquetado y sobre la instalación silenciosa en un directorio aislado. Solo publica cuando todas las etapas pasan. El resultado de cada ejecución puede consultarse en https://github.com/sssexpistols/Tinta/actions.

Se usa un runner estándar del repositorio público, sin cachés ni artefactos de Actions. La colección personal y la instalación existente no se usan en pruebas. La app se ofrece en Abrir con, sin sustituir la aplicación predeterminada del usuario.

## Límites

- El ajuste de líneas depende de las capacidades de cada tipo Mermaid. Para los tipos con leyendas de una línea se amplía el área dibujada para conservar el texto completo.
- La apertura importa una copia; no sincroniza el archivo original ni importa sus imágenes relativas como adjuntos.
- Cálculo numérico y notación LaTeX; no álgebra simbólica ni compilación de documentos TeX completos.
- IA simulada en regresión; no se descargan modelos ni se envían notas a proveedores externos.
- Instalador sin certificado comercial de firma de código.
