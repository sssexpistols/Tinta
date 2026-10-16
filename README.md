# Tinta

Un cuaderno local para Windows: Markdown, Vim, notas enlazadas, plantillas de estudio y desarrollo, Mermaid, fórmulas y gráficos. La IA con Ollama es opcional.

## Instalar y actualizar

Descarga **Tinta-Setup-1.6.0.exe** desde [Releases](https://github.com/sssexpistols/Tinta/releases). El instalador Windows x64 incluye el runtime: no necesitas Node.js, Python ni una distribución TeX.

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
npm test
npm run build
npm start
```

Usa ramas y una carpeta aislada: `$env:TINTA_DATA_DIR = "$pwd\.test-results\manual"`. No pruebes sobre notas personales. Las suites `npm run test:desktop` y `npm run test:desktop:v11` hasta `:v16` crean sus propios perfiles.

`npm run installer` genera NSIS en `.build/release`. Solo empaqueta el frontend compilado y las dependencias necesarias de escritorio. El workflow de GitHub prueba y construye al subir una etiqueta `v*`; publica únicamente si los pasos pasan. Incrementa la versión, el lockfile y las notas de release antes de etiquetar. No incluyas modelos, notas personales ni cachés en Git.

Consulta [CHANGELOG.md](CHANGELOG.md), [VERIFICATION.md](VERIFICATION.md) y [THIRD-PARTY-NOTICES.txt](THIRD-PARTY-NOTICES.txt).

