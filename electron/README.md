# Escritorio y almacenamiento de Tinta

`main.cjs` abre el paquete local de Vite (`dist/index.html`) en una ventana Electron sin marco, con una sola instancia por carpeta de datos. El proceso de renderizado tiene sandbox, aislamiento de contexto y Node.js desactivado. Solo el documento principal de Tinta puede utilizar los canales IPC. La navegación se limita a la app; los enlaces HTTP/HTTPS se abren en el navegador del sistema. No se permiten otros protocolos externos, credenciales en URLs, ventanas nuevas, webviews ni solicitudes de permisos.

## Carpeta de datos

Por defecto: `%APPDATA%/Tinta`. `TINTA_DATA_DIR` permite cambiarla, incluidos los datos de sesión, caché y logs de Electron, para pruebas o instalaciones separadas.

- `notes.json`: estado actual, esquema `version: 1`.
- `notes.backup.json`: generación anterior válida (en el primer guardado, la inicial).
- `notes.backup.2.json`: una generación válida anterior adicional.
- `*.corrupt-<fecha>-<id>`: original dañado conservado antes de una reparación.

El guardado valida el documento completo, toma una copia inmutable antes de entrar a la cola y procesa las escrituras en orden. Cada archivo nuevo se escribe en un temporal adyacente, se sincroniza a disco y se renombra sobre el destino. No se borra el archivo anterior antes del reemplazo. Los guardados sin cambios no rotan las copias anteriores. Si hay cambios externos desde la carga, el guardado se detiene y pide reiniciar para evitar sobrescribirlos. El esquema exige el cuaderno `inbox`, que utiliza la interfaz al importar o mover notas.

La carga solo devuelve `null` cuando no existen ni el archivo principal ni sus copias. Si el principal está dañado, busca una copia válida y comunica la recuperación. Cargar no modifica los archivos. Al guardar tras una recuperación, conserva una copia exclusiva de cada archivo inválido que deba sustituirse. Si no hay ninguna copia válida, rechaza la carga y el guardado: el renderer debe mostrar el error y nunca guardar datos de ejemplo en ese caso. Un archivo ilegible no se sustituye.

Límites: 64 MB por colección/copia, 16 millones de caracteres por cuerpo, 100 000 notas. La importación de archivos de texto acepta hasta 16 MB por archivo. Las copias se validan antes de ofrecer su restauración; importar solo lee y devuelve el estado, y la interfaz confirma cuándo reemplazarlo.

## Contrato `window.tinta`

- `platform`: plataforma de Electron (`win32` en Windows).
- `load(): Promise<state | null>`: carga validada; rechaza si se requiere recuperación manual.
- `save(state): Promise<{ ok: true }>`: resuelve después del guardado en disco.
- `getStorageStatus(): Promise<{ dataPath, recoveredFrom, warning }>`: consultar tras cargar. `warning` es una cadena en español cuando se recuperó una copia.
- `importFiles(): Promise<{ name, body }[]>`: abre un selector múltiple de Markdown/texto; cancelar devuelve `[]`.
- `exportNote({ title, body }): Promise<boolean>`: guarda `.md` con diálogo.
- `exportBackup(state): Promise<boolean>`: valida y exporta JSON con diálogo.
- `importBackup(): Promise<state | null>`: selecciona y valida JSON, sin sobrescribir todavía las notas.
- `openDataFolder(): Promise<boolean>`: abre la carpeta de datos en el Explorador.
- `openExternal(url): Promise<boolean>`: abre únicamente URLs HTTP/HTTPS sin credenciales.
- `windowAction('minimize' | 'maximize' | 'close')`: controles de ventana; maximizar alterna restaurar/maximizar.
- `onWindowState(callback): unsubscribe`: entrega `{ maximized: boolean }`, incluido el estado inicial.
- `onBeforeClose(async callback): unsubscribe`: **registrar un callback que cancele el debounce y espere el guardado de la versión más reciente**. El preload confirma el cierre automáticamente cuando el callback resuelve. Si rechaza, la ventana permanece abierta y la interfaz debe mostrar el error. Main drena además la cola de almacenamiento antes de cerrar.
- `readyToClose()`: confirmación explícita alternativa; no se necesita con el callback anterior.

Si el editor no responde durante 12 segundos al cerrar, Tinta permite volver a las notas o cerrar conservando únicamente lo ya guardado. En `TINTA_TEST_MODE=1`, no se muestran diálogos: importar devuelve valores vacíos, exportar devuelve `false`, y el cierre sin respuesta se cancela. La interfaz de uso normal conserva sus diálogos.

## Desarrollo y pruebas

`TINTA_DEV_URL` acepta solo un servidor HTTP de loopback. `npm start` usa `dist` cuando esta variable no está definida. DevTools están disponibles únicamente en desarrollo o modo de prueba.

Ejecutar `npm test` desde la carpeta del proyecto. Las pruebas de Node verifican persistencia y recarga, importación/exportación JSON, rechazo de esquemas, concurrencia, dos generaciones de respaldo, conservación de corrupción, recuperación, cambios externos y fallos de escritura. Crean y eliminan solamente carpetas temporales propias. `TINTA_TEST_ROOT` permite elegir la raíz temporal.

Seguridad de Electron consultada: https://www.electronjs.org/docs/latest/tutorial/security/ y https://www.electronjs.org/docs/latest/api/browser-window.
