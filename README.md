# Tinta 1.1.0 — notas conectadas, Vim y Gruvbox

Abre `Tinta-1.1.0-Windows/Tinta-win32-x64/Tinta.exe`. Conserva la carpeta completa; si usas el ZIP, extráelo antes de ejecutar la app.

## Actualizar sin perder notas

1. Cierra Tinta 1.0 normalmente para que termine de guardar.
2. Abre Tinta 1.1. Usa la misma carpeta `%APPDATA%\Tinta`, por lo que tus notas aparecen automáticamente.
3. Al cargar una colección existente, se crea `notes.before-v1.1.0.json`. Esa copia de actualización no se sobrescribe en futuros inicios. Los dos respaldos rotativos habituales siguen funcionando.

El ejecutable y el ZIP anteriores se conservan. Los datos mantienen el esquema 1 y se verificó que Tinta 1.0 puede leerlos. Solo una versión puede usar la misma carpeta de notas a la vez. La app no tiene firma digital comercial.

## Crear y conectar notas

Escribe `[[Contexto de mi proyecto` y elige **Crear «Contexto de mi proyecto»** con Enter. La opción permanece al escribir espacios. Se crea la nota en la misma libreta y se inserta el enlace; permaneces en el origen para seguir escribiendo.

- Si el título ya existe, se ofrece enlazarlo, evitando duplicados por diferencias de mayúsculas o espacios.
- El editor muestra `[[Contexto de mi proyecto]]` en azul, o aguamarina en Gruvbox. Haz clic o usa Ctrl+Enter para abrirlo.
- La nota de destino muestra **Enlazadas a esta nota** bajo sus fechas. Haz clic en una entrada para volver al origen.
- Las referencias nuevas usan un ID estable y siguen conectadas al cambiar el título. Las referencias antiguas por título se convierten al renombrar desde Tinta.
- Una referencia completa a una nota inexistente también permite crearla al hacer clic desde el editor o la vista previa.
- El ID se oculta visualmente en el editor, pero se conserva en el Markdown exportado como `[[id|etiqueta]]`. Otros editores pueden necesitar una conversión para resolver esos enlaces.

## Vim y números relativos

Activa **Modo Vim** en Preferencias o con el botón VIM de la barra del editor. Está desactivado inicialmente para conservar tu forma de escribir anterior.

| Teclas | Acción en Vim |
| --- | --- |
| i / a / o | Entrar a insertar |
| Esc | Volver a normal |
| h j k l | Moverse |
| 3j, 2w | Movimientos con conteo |
| gg / G | Inicio / final |
| dd / yy / p | Borrar / copiar / pegar una línea |
| u / Ctrl+R | Deshacer / rehacer |
| v / V | Selección visual / por líneas |
| /texto, Enter, n | Buscar y siguiente coincidencia |
| :w, Enter | Guardar |

La línea actual muestra su número absoluto; las demás muestran la distancia al cursor. **Números relativos** puede desactivarse en Preferencias para usar numeración absoluta. El cursor de bloque parpadea en normal y la línea activa queda resaltada. El autocompletado Markdown funciona en insertar. Se utiliza el motor Vim para CodeMirror; no es una instalación completa de Vim ni soporte para vimrc o plugins de Vim.

## Gruvbox y movimiento

En Preferencias → Apariencia elige **Gruvbox**, Oscuro o Claro. Gruvbox se aplica a navegación, editor, sintaxis, vista previa, menús y cursor. Las transiciones de selección, paneles y referencias usan tiempos cortos inspirados en los estilos observados de Inkdrop y respetan la preferencia de reducir movimiento.

Son estilos propios basados en las capturas y los artefactos inspeccionados. No se midió en ejecución cada animación de Inkdrop ni se afirma equivalencia exacta con todas ellas. IA y plugins siguen pospuestos.

## Git y próximas versiones

El repositorio local está en la carpeta de código `Tinta`. `v1.0.0` conserva la entrega inicial. La versión nueva se desarrolló en `feat/wiki-vim-gruvbox`, dentro de un worktree separado, y se fusiona en `main` después de superar las pruebas, con etiqueta `v1.1.0`.

`AGENTS.md` establece el flujo futuro: rama y worktree, datos de prueba aislados, pruebas relevantes, commits, merge y una carpeta nueva por versión. Editar código no reemplaza el programa que tienes abierto. No se publicó ningún repositorio remoto.

El archivo `Tinta-repositorio.bundle` conserva el historial Git. Se puede recuperar con `git clone Tinta-repositorio.bundle Tinta`.

## Funciones y datos

Se mantienen libretas, etiquetas, estados, favoritas, plantillas, papelera, búsqueda, importación/exportación Markdown, copias JSON, vista dividida, modo enfoque y guardado automático. Ctrl+N crea una nota; Ctrl+K abre el buscador; Ctrl+Shift+P cambia de vista; Ctrl+, abre Preferencias. En Vim, Ctrl+N/P se reservan para sus comandos dentro del editor.

Las notas se guardan en `%APPDATA%\Tinta\notes.json`. Preferencias permite abrir la carpeta y exportar una copia completa. El límite de la colección es 64 MB. No hay sincronización remota, cifrado de notas, historial de revisiones ni gestión de adjuntos locales.

## Desarrollo

Node.js 24. Desde la carpeta de código:

```text
npm ci
node node_modules/electron/install.js
npm run build
npm start
npm test
npm run test:desktop
npm run test:desktop:v11
npm run package
```

`TINTA_DATA_DIR` permite usar notas independientes para pruebas. Los tests crean sus propios datos en `.test-results`. En el entorno restringido de Codex se verificó la interfaz con opciones de lanzamiento de prueba `--no-sandbox --disable-gpu`; el ejecutable normal mantiene sandbox y aislamiento de contexto. `TINTA_ELECTRON_PATH` permite elegir un runtime de prueba y `TINTA_RELEASE_DIR` cambia la carpeta de empaquetado.

Fuentes técnicas: [motor Vim para CodeMirror](https://github.com/replit/codemirror-vim), [Gruvbox original](https://github.com/morhetz/gruvbox) y el informe de artefactos `Analisis-Inkdrop.md` de la entrega inicial. Las licencias se conservan en `THIRD-PARTY-NOTICES.txt`; Electron y Chromium incluyen sus avisos en el paquete.
