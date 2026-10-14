# Verificación 1.1.0

- 22 pruebas de almacenamiento, compatibilidad, snapshot de actualización y resolución de enlaces: aprobadas.
- 14 comprobaciones de regresión de la interfaz 1.0: aprobadas.
- 12 comprobaciones de la interfaz 1.1: aprobadas tanto desde el proyecto como desde el ejecutable empaquetado.
- Compilación Vite de producción: correcta. La advertencia de tamaño de bundle continúa; no es un fallo de ejecución.
- El validador original de Tinta 1.0 aceptó una colección guardada por 1.1 con Gruvbox, Vim, referencias estables y notas creadas en la prueba.

Los casos nuevos comprueban creación de referencias con espacios, conservación de la nota origen, ID oculto, navegación, backlinks, renombres, creación desde vista previa, tema, modo insertar/normal/visual, movimientos con conteo, números relativos, `dd`, deshacer, búsqueda, `:w`, persistencia y snapshot inmutable. No hubo errores JavaScript en los recorridos completados.

Las pruebas utilizaron colecciones aisladas; no se leyeron ni modificaron notas personales. El entorno de Codex requirió opciones de lanzamiento de prueba `--no-sandbox --disable-gpu` y acceso a localhost para Playwright. Esas opciones no forman parte del lanzamiento normal distribuido. Los diálogos nativos de importación/exportación ya fueron verificados en 1.0 y no se modificaron en esta entrega.

Se inspeccionó visualmente la captura de Gruvbox con cursor Vim, numeración relativa y backlinks. La referencia visual fue la captura del usuario y los estilos previamente extraídos de Inkdrop. Los bundles inspeccionados declaran transiciones cortas, pero no permiten afirmar igualdad exacta con cada animación o con el plugin Vim de Inkdrop.

No se verificó un sistema operativo distinto, una distribución firmada, compatibilidad con vimrc ni un volumen extremo de notas. IA y plugins continúan fuera de alcance.
