# Verificación 1.6.0

146 comprobaciones locales distintas aprobadas el 16 de octubre de 2026:

| Suite | Casos |
| --- | ---: |
| Unitarias: almacenamiento, enlaces, contexto, gramática, gráficos, descarga y actualizaciones | 54 |
| Escritorio base | 14 |
| Vim, enlaces y compatibilidad | 12 |
| Plantillas, exportación e IA simulada | 16 |
| Biblioteca, menús, etiquetas, Mermaid y atajos | 16 |
| Preview y atajos Markdown/Vim | 12 |
| Plantillas, papelera y copia de recursos | 14 |
| Escritura, ciencia y configuración opcional de IA | 8 |

La suite nueva reproduce aceptar una sugerencia, volver con Ctrl+Home, hacer clic al inicio y esperar sin escribir. No se hacen nuevas peticiones ni reaparece texto fantasma. También rechaza una respuesta que repite el texto posterior al cursor.

Se comprueban idioma inicial y selección bilingüe, offsets de corrección, exclusión de código/matemáticas, sintaxis LaTeX, mhchem, funciones seguras sin eval, regresión y R², zoom, exportación HTML y PNG con píxeles visibles y canal alfa transparente. La plantilla matemática no modifica plantillas personales.

La configuración opcional permite continuar sin descargar. Una descarga simulada completa activa el modelo; fallar o cancelar no lo activa. Las actualizaciones simuladas no instalan sin una descarga terminada y un guardado correcto. La prueba de disco lleno confirma que se conserva abierta la app.

## Empaquetado y CI

La suite 1.6 también pasó sus 8 casos sobre `win-unpacked/Tinta.exe`, usando un perfil aislado. El paquete incluye sus dependencias y funciona sin Node.js instalado por separado. Para esta comprobación local fue necesario dar lectura/ejecución del directorio generado al sandbox de aplicaciones de Windows; no se cambiaron los permisos de las notas.

La [validación completa en GitHub Actions](https://github.com/sssexpistols/Tinta/actions/runs/38975040052) aprobó las 146 comprobaciones de origen, la compilación NSIS, los 8 casos del ejecutable empaquetado y los mismos 8 casos sobre la aplicación instalada en una carpeta aislada. La instalación silenciosa terminó correctamente y se verificó el ejecutable instalado antes de abrirlo.

Vite compila correctamente. La carpeta Electron x64 se genera con sus dependencias de escritorio. En el entorno local el compilador NSIS no pudo iniciar; la compilación y la instalación se validaron en Windows de GitHub. El workflow repite las suites y exige que la aplicación instalada pase antes de publicar. Usa únicamente un runner estándar del repositorio público, sin cachés ni artefactos de Actions: los binarios se publican directamente en Releases. El resultado verificable de cada compilación está en [Actions](https://github.com/sssexpistols/Tinta/actions).

`npm audit --omit=dev`: cero vulnerabilidades conocidas en dependencias de producción en la comprobación de esta entrega. Se actualizó el parser XML transitivo a 0.9.12. Vite advierte sobre el tamaño de algunos bundles; no impide compilar o arrancar.

## Límites

- Perfiles de prueba con notas ficticias; nunca se prueba sobre la colección personal.
- Ollama y las descargas se simulan para regresión. No se descargan modelos en la computadora del usuario durante las pruebas. La calidad y velocidad de un modelo real varían.
- Se comprueban los datos enviados al portapapeles simulado, no el pegado en Word ni el formatter de un editor externo.
- No existe todavía una actualización real entre dos releases públicas de Tinta; la primera release establece el canal. El guardado previo y los estados del actualizador están cubiertos con pruebas.
- La instalación no cuenta con certificado comercial de firma de código.
- Los procesos automatizados usan `--no-sandbox --disable-gpu`; el lanzamiento normal conserva el sandbox del renderer.
- Vaciar papelera elimina las notas de la colección actual, no purga snapshots o backups históricos. Se mantiene el esquema 1.
