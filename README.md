# Tinta

Un cuaderno local para Windows: Markdown, Vim, notas enlazadas, plantillas de estudio y desarrollo, Mermaid, fórmulas y gráficos. La IA con Ollama es opcional.

## Instalar y actualizar

Descarga **Tinta-Setup-1.7.0.exe** desde [Releases](https://github.com/sssexpistols/Tinta/releases). El instalador Windows x64 incluye el runtime: no necesitas Node.js, Python ni una distribución TeX.

La opción **Configurar la IA local al abrir Tinta** abre un asistente después de instalar. Puedes omitirla y usar **Preferencias → Instalar IA en este equipo** cuando quieras. Ollama y sus modelos se descargan por separado. La app propone Qwen2.5 1.5B, 3B o 7B según la RAM; la velocidad también depende de CPU, GPU y memoria libre. Los modelos requieren aproximadamente 1–5 GB adicionales y la primera carga puede tardar.

El instalador no tiene certificado de firma de código. Windows puede mostrar «Editor desconocido». Comprueba que la descarga provenga de este repositorio; no necesitas desactivar las protecciones de Windows.

En **Preferencias → Actualizaciones** puedes buscar, descargar y elegir **Guardar y reiniciar**. La app consulta las releases al abrir; no descarga automáticamente ni instala al cerrar sin tu elección. Cada release debe incluir el instalador, `.blockmap` y `latest.yml`. La instalación sustituye los archivos de la app y conserva los datos; las carpetas portátiles antiguas no se borran automáticamente.

## Tus notas

Guardado automático en `%APPDATA%\Tinta`. Exporta una copia JSON desde Preferencias o una nota Markdown desde su menú. La exportación de vista previa ofrece HTML y PDF con elección de tema.

Se conserva el esquema de datos y se crea una copia previa `notes.before-v1.6.0.json` al actualizar. Cierra normalmente una versión portátil anterior antes de abrir la instalada. Las pruebas usan perfiles aislados.

- Libretas, etiquetas con Enter, favoritos, estados, búsqueda y papelera con confirmación al vaciar.
- `[[Título de otra nota]]` enlaza o crea una nota, incluso con espacios. Las referencias entrantes aparecen en preview.
- Plantillas por categorías y preview al pasar el ratón. **Ctrl+T** aplica una plantilla cuando la nota está vacía.
- Temas oscuro, claro y Gruvbox; Vim y números relativos opcionales. Atajos personalizables.
- **Ctrl+N** nueva nota, **Ctrl+B** negrita, **Ctrl+I** cursiva, **Ctrl+S** guardar, **Ctrl+K** buscar y abrir; disponibles también en Vim insertar y visual.
- `/` ofrece bloques de tabla, tarea, código, fórmula, gráfico y regresión, entre otros.

## Abrir Markdown y tomar apuntes

**Ctrl+O**, el menú **Abrir Markdown…** y arrastrar archivos sobre la app abren archivos .md, .markdown, .mdown y .txt. El instalador añade Tinta a **Abrir con** en Windows para Markdown sin cambiar tu aplicación predeterminada. También se reciben archivos cuando Tinta ya está abierta.

Cada archivo se guarda como una **copia editable en la colección**. El original no se modifica ni se sincroniza; exporta Markdown desde el menú de la nota para llevar tus cambios a disco. Se admite UTF-8 y UTF-16 con BOM, hasta 16 MB por archivo y 50 archivos por selección. Las imágenes relativas a carpetas externas no se importan como adjuntos.

- **Ctrl+U** subraya la selección con HTML `<u>texto</u>`.
- **Ctrl+Shift+H** resalta con `==texto==`.
- **Ctrl+Alt+N** inserta una nota al pie con su referencia editable.
- **Ctrl+Alt+U / Ctrl+Alt+D** insertan superíndice/subíndice.
- **Ctrl+Shift+M**, o el botón del libro, abre **Recursos para apuntes**: fórmulas, gráficos, cálculo, citas, glosario y preguntas de repaso.
- Los atajos se pueden personalizar; los valores guardados tienen prioridad sobre los nuevos defaults.

Los recuadros se escriben con `> [!NOTE] Título` y líneas citadas debajo. También funcionan TIP, IMPORTANT, WARNING, QUESTION, EXAMPLE, SUMMARY y QUOTE. Las referencias `[^fuente]` se vinculan con `[^fuente]: Autor y página`. La biblioteca incluye una respuesta plegable y plantillas de análisis literario y ensayo argumentativo.

Las etiquetas de Mermaid usan la misma fuente al medir y al dibujar. Nodos y mensajes ajustan líneas según las capacidades del tipo de diagrama; las leyendas y títulos amplían el área SVG para no recortarse. Se conservan zoom, ampliación y PNG transparente.

## Corrección de escritura

La configuración inicial usa **Español (MX)** si el idioma preferido de Windows es `es-MX`; en otro caso usa **English (US)**. Puedes activar ambos simultáneamente o desactivar la función.

**Revisar escritura**, en la barra del editor, ofrece cambios para aceptar individualmente. Las reglas locales incluyen `o oprimir → u oprimir`, repeticiones y algunos artículos ingleses. La revisión adicional con Ollama admite hasta 12.000 caracteres. Se excluyen código y fórmulas; no se reescribe automáticamente la nota. El menú contextual ofrece ortografía cuando el diccionario de Electron está disponible. La cobertura es limitada; no detectar problemas no garantiza un texto correcto.

## Matemáticas, química y gráficos

Usa `$E=mc^2$` dentro de un párrafo, `$$...$$` en bloque o cercas `math`, `latex` y `tex`:

```math
E_k=\frac12 mv^2,\qquad \ce{2H2 + O2 -> 2H2O}
```

MathJax renderiza notación matemática y química `mhchem` localmente. No compila documentos LaTeX completos ni ejecuta comandos, paquetes arbitrarios o archivos externos.

Los bloques `plot` usan JSON. Regresión con datos **didácticos**:

```plot
{"title":"Regresión lineal","points":[[0,1],[1,3],[2,5]],"regression":"linear"}
```

Funciones de una variable:

```plot
{"title":"Funciones","x":[-5,5],"y":[-2,8],"functions":["x^2","sin(x)"]}
```

Admite `x`, `pi`, `e`, `+ - * / ^`, paréntesis y `sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `sqrt`, `abs`, `exp`, `log`, `ln`, `log10`, `floor`, `ceil`. Multiplicación explícita: `2*x`. La regresión calcula pendiente, intercepto y R²; comprueba unidades, supuestos y significado de los datos. No es un sistema algebraico simbólico. La plantilla **Modelo matemático y regresión** guía el proceso.

Las fórmulas en bloque, gráficos y Mermaid tienen controles para ampliar, mover, restablecer, copiar fuente y copiar PNG transparente con los colores del tema. El programa donde pegues puede aplanar la transparencia. HTML/PDF conserva los recursos sin botones. El código ajusta sus líneas al ancho y se copia con espacios y saltos originales; el formatter al pegar lo configura el editor de destino.

## Predicción local

Tinta solo consulta Ollama en `127.0.0.1:11434` y rechaza los modelos de nube. Usa el contexto cercano al cursor; en prosa excluye bloques de código ajenos. **Tab** acepta y **Esc** descarta. Mover el cursor, abrir una nota o aceptar una sugerencia no inicia otra petición. Se descartan duplicados del texto que ya existe después del cursor.

Para invitar una estructura, termina un párrafo descriptivo con «Los pasos son:», «Este diagrama muestra…», «La fórmula de…» o «Gráfico de…», seguido de una línea vacía. Revisa el resultado: el modelo puede equivocarse, tardar o no producir una continuación utilizable. No se garantiza corrección gramatical, científica ni del código.

## Desarrollo y releases

```powershell
npm ci
node node_modules/electron/install.js
npm test
npm run build
npm start
```

Usa ramas y una carpeta aislada: `$env:TINTA_DATA_DIR = "$pwd\.test-results\manual"`. No pruebes sobre notas personales. Las suites `npm run test:desktop` y `npm run test:desktop:v11` hasta `:v16` crean sus propios perfiles.

`npm run installer` genera NSIS en `.build/release`. Solo empaqueta el frontend compilado y las dependencias necesarias de escritorio. El workflow de GitHub prueba y construye al subir una etiqueta `v*`; publica únicamente si los pasos pasan. Incrementa la versión, el lockfile y las notas de release antes de etiquetar. No incluyas modelos, notas personales ni cachés en Git.

Para preparar solo la carpeta ejecutable: `npm run build` y `npm run installer -- --dir`. No requiere compilar NSIS. Para una release desde Actions también puedes ejecutar el workflow sobre `main` con `publish` activado; las pruebas y la instalación aislada deben completarse antes de publicar.

El flujo usa el ejecutor estándar gratuito de Windows en este repositorio público. No guarda cachés ni artefactos de Actions: los binarios se adjuntan directamente a GitHub Releases. No utiliza Git LFS, Packages, ejecutores de pago ni servicios de IA de nube.

Consulta [CHANGELOG.md](CHANGELOG.md), [VERIFICATION.md](VERIFICATION.md) y [THIRD-PARTY-NOTICES.txt](THIRD-PARTY-NOTICES.txt).

## Cálculo local (1.7)

Los bloques `calculate` muestran resultados numéricos y su método. Ejemplos:

```calculate
{"operation":"integral","expression":"x^2","from":0,"to":3}
```

```calculate
{"operation":"derivative","expression":"sin(x)","at":0}
```

```calculate
{"operation":"statistics","values":[2,4,4,6,9]}
```

Son aproximaciones numéricas, no álgebra simbólica. Simpson compuesto necesita continuidad y suavidad; la diferencia entre resoluciones no garantiza el error ni detecta todas las singularidades. Las derivadas usan diferencias centrales. La estadística incluye media, mediana, extremos y desviación estándar muestral.

Un gráfico puede incluir `derivatives:["x^2"]` junto con `functions` (seis curvas en total, antes del ajuste de regresión). Se añaden sinh, cosh, tanh, asinh, acosh, atanh, cbrt, log2, round y sign. Las funciones trigonométricas usan radianes.

La biblioteca ofrece matrices, sistemas, límites, integrales, sumatorias, probabilidad, vectores, física, química y cancelaciones. También se aceptan delimitadores LaTeX de bloque con barra invertida y corchetes.
