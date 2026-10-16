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

Vite compila correctamente. La carpeta Electron x64 se genera con sus dependencias de escritorio. En este equipo el compilador NSIS falla al iniciar con «Illegal System DLL Relocation»; no se han cambiado las protecciones del sistema. El workflow de GitHub construye el instalador en Windows, repite las suites, prueba el ejecutable empaquetado y hace una instalación silenciosa en una carpeta aislada antes de publicar. El resultado verificable de cada compilación está en [Actions](https://github.com/sssexpistols/Tinta/actions).

`npm audit --omit=dev`: cero vulnerabilidades conocidas en dependencias de producción en la comprobación de esta entrega. Se actualizó el parser XML transitivo a 0.9.12. Vite advierte sobre el tamaño de algunos bundles; no impide compilar o arrancar.

## Límites

- Perfiles de prueba con notas ficticias; nunca se prueba sobre la colección personal.
- Ollama y las descargas se simulan para regresión. No se descargan modelos en la computadora del usuario durante las pruebas. La calidad y velocidad de un modelo real varían.
- Se comprueban los datos enviados al portapapeles simulado, no el pegado en Word ni el formatter de un editor externo.
- No existe todavía una actualización real entre dos releases públicas de Tinta; la primera release establece el canal. El guardado previo y los estados del actualizador están cubiertos con pruebas.
- La instalación no cuenta con certificado comercial de firma de código.
- Los procesos automatizados usan `--no-sandbox --disable-gpu`; el lanzamiento normal conserva el sandbox del renderer.
- Vaciar papelera elimina las notas de la colección actual, no purga snapshots o backups históricos. Se mantiene el esquema 1.
