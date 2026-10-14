# Tinta para Windows

Tinta es una app de escritorio de notas Markdown para uso personal, construida a partir del análisis de la estructura visual y los flujos de Inkdrop. Es una implementación independiente con su propia carpeta de datos.

## Abrir la app

Abre `Tinta-Windows/Tinta-win32-x64/Tinta.exe`. Conserva la carpeta completa: el ejecutable necesita los archivos que lo acompañan. No requiere instalar Node.js, crear una cuenta ni iniciar Inkdrop.

Si usas el ZIP, extráelo completo antes de ejecutar `Tinta.exe`. Puedes crear un acceso directo al ejecutable desde el Explorador de Windows. El paquete es para Windows x64 y no tiene firma digital comercial.

## Qué puedes hacer

- Crear, editar y buscar notas, con guardado automático y conservación de cambios al cerrar.
- Organizar por libretas, etiquetas, favoritas y estados: activa, en pausa, completada y descartada.
- Editar Markdown con colores, deshacer/rehacer, búsqueda dentro de la nota, listas, tablas, tareas y bloques de código.
- Escribir `/` para insertar bloques y `[[` para autocompletar enlaces a notas existentes.
- Alternar entre editor, vista previa y ambas vistas; cambiar el tamaño de los paneles o activar el modo enfoque.
- Marcar tareas directamente en la vista previa.
- Crear notas desde plantillas y convertir una nota en plantilla.
- Enviar notas a la papelera, restaurarlas o eliminarlas definitivamente.
- Importar archivos `.md`, `.markdown` y `.txt`, exportar una nota como Markdown y exportar/restaurar la colección completa en JSON.
- Usar tema claro u oscuro y ajustar el tamaño de letra del editor.

## Dónde se guardan las notas

La app utiliza `%APPDATA%\Tinta\notes.json`. Puedes abrir esa carpeta desde el icono de carpeta de la barra inferior o desde Preferencias. Se mantienen dos generaciones anteriores de respaldo; no sustituyen una copia externa periódica.

En Preferencias, **Exportar copia** guarda todas las notas y sus metadatos. **Restaurar copia** pide confirmar antes de reemplazar la colección actual. La importación de Markdown añade notas a la colección.

Las notas se guardan localmente, sin sincronización con servidores. Las imágenes remotas que incluyas en Markdown requieren conexión. El límite actual de la colección es de 64 MB. La app no lee ni modifica los datos personales de Inkdrop.

## Atajos

| Teclas | Acción |
| --- | --- |
| Ctrl+N | Crear nota |
| Ctrl+K | Buscar y abrir una nota |
| Ctrl+Shift+F | Buscar en la colección |
| Ctrl+F | Buscar dentro del editor |
| Ctrl+B / Ctrl+I | Negrita / cursiva |
| Ctrl+Z / Ctrl+Y | Deshacer / rehacer |
| Ctrl+Shift+P | Cambiar vista |
| Ctrl+. | Modo enfoque |
| Ctrl+, | Preferencias |
| Ctrl+S | Guardar ahora |
| / | Autocompletar bloques |
| [[ | Autocompletar enlaces entre notas |

## Alcance de esta versión

Esta primera versión reproduce la estructura central de escritura y organización. No incluye la nube de Inkdrop, su sistema de plugins, servicios de IA, cifrado de notas, historial de revisiones, libretas anidadas ni gestión de archivos adjuntos locales. Los movimientos y colores se basan en la captura y los estilos inspeccionados; no se afirma una reproducción exacta de todas las animaciones del producto original.

## Código y análisis

La carpeta `Tinta` contiene el código fuente; `Analisis-Inkdrop.md` explica los hallazgos y `REA-resumen.json` conserva el identificador de evidencia y sus límites. El análisis REA tiene cobertura parcial, documentada en el informe.

Para desarrollar, usa Node.js 24 y ejecuta desde `Tinta`: `npm ci`, `node node_modules/electron/install.js`, `npm run build` y `npm start`. `npm test` verifica el almacenamiento. El archivo `package-lock.json` fija las dependencias de esta entrega.
