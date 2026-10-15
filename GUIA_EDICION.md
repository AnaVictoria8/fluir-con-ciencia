# Guía de edición — Fluir con-ciencia, gotas de vida

La portada `index.html` abre directamente la maqueta `maqueta3d.html`. El plano actualizado está en `mapa2d.html`. Ambas vistas comparten los textos de `assets/map-data.js` y la distribución de `assets/garden-layout.js`. Al subir cambios al repositorio, GitHub Pages actualiza el sitio público en ~1 minuto.

- **Sitio público:** https://anavictoria8.github.io/fluir-con-ciencia/
- **Repositorio:** https://github.com/AnaVictoria8/fluir-con-ciencia

## Formas de editar

### 1. Pedir los cambios (la más simple)
Escribe el cambio deseado (texto, posición de un módulo, color, etc.) a la persona que administra el proyecto en el computador. El cambio se aplica, se sube y se verifica.

### 2. Editar directamente en GitHub (para textos simples)
1. Entra a https://github.com/AnaVictoria8/fluir-con-ciencia con tu cuenta de colaborador (por ejemplo, raulrojas22)
2. Abre el archivo (ej: `assets/map-data.js`) → botón del lápiz ✏️
3. Edita el texto → botón verde **Commit changes**
4. En ~1 minuto el sitio se actualiza solo

*Recomendado para: cambiar títulos, nombres, textos de módulos, README. Para cambios visuales (mover módulos en el mapa, recorrido), mejor la vía 1.*

### 3. Editar en el computador del proyecto
Los archivos están en `Documents/proyecto_agua_vic/`. Servir la carpeta por HTTP (por ejemplo, `python3 -m http.server 8765 --bind 127.0.0.1`) y abrir `http://127.0.0.1:8765/` para previsualizar. Para publicar los cambios se suben al repositorio (requiere acceso de colaborador).

## Dónde está cada cosa

| Qué quiero cambiar | Dónde |
|---|---|
| Nombre del proyecto y subtítulo | `assets/map-data.js`, bloque `PROJECT` (y el `<h1>`/`<p>` del encabezado) |
| Textos de los 7 módulos (nombre, pregunta, mensaje, interacción, aprendizaje, fichas) | `assets/map-data.js`, bloque `const MODULES = [...]` — un objeto por módulo |
| Posición de un módulo en el mapa | `assets/garden-layout.js`, `STAND_LAYOUT`: `position: [x,z]` en metros; `yaw` orienta su frente. Luego regenerar el 2D. |
| Recorrido naranjo (ida y regreso) | Se calcula con `visitor-navigation.js`, evitando los mismos obstáculos del 3D; el generador produce los tramos 2D. |
| Explanadas y anchos | `ACCESS_AREAS` y `pathWidth` en `assets/garden-layout.js` |
| Etiquetas de referencia (Baños, Administración…) | `tools/generate_plan2d.mjs` y geometría de `garden-buildings.js` |
| Color de un módulo | Campo `color` de ese módulo |

Tras cambiar posiciones, edificios, explanadas u obstáculos, ejecutar:

```bash
node tools/generate_plan2d.mjs
node tools/generate_plan2d.mjs --check
node tools/check_garden_layout.mjs
node tools/check_station_framing.mjs
```

No editar `plan2d-data.js` ni los SVG generados a mano. El comprobador detecta si el plano quedó desactualizado respecto del modelo.

## Interacciones del mapa

- Seleccionar un número del mapa o del navegador inferior centra la cámara y abre la ficha correspondiente.
- El recorrido animado avanza por los caminos, se detiene 8 segundos en cada estación y regresa al acceso. Se puede pausar, continuar y cambiar su velocidad.
- “Capas del mapa” controla recorrido, huellas y nombres. Los nombres se distribuyen evitando colisiones; en móvil se prioriza el seleccionado.
- El panel de módulos incluye demostraciones conceptuales y accesos al tour 360°, mapa interactivo y PDF oficiales de UTalca. El contenido externo se carga bajo demanda y ofrece enlace de apertura independiente.
- El plano tiene las mismas huellas y orientaciones que el 3D. Los stands 4–6 y baños miran hacia la laguna; el modelo deja 3 m entre estos stands y 4 m por delante. Las dimensiones interpretadas deben comprobarse en terreno.

## Parámetros útiles de la URL de `mapa2d.html`

- `?view=general` — vista general del jardín
- `?mod=4` — abre directo la ficha del módulo 4
- `?tab=ruta` o `?tab=ficha` — pestañas del panel
- `?tour=1` — inicia el recorrido guiado automático
- `?printpreview=1` — vista previa del documento imprimible

## Regenerar los PDF

El botón «Descargar PDF» descarga el archivo directamente. Para actualizarlo después de regenerar el plano 2D, usar Node y Python con `reportlab`:

```bash
python3 tools/generate_plan_pdf.py
```

Para el documento de postulación (requiere Chrome):

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --print-to-pdf=documento/documento_postulacion.pdf --no-pdf-header-footer documento/documento_postulacion.html
```

## Estructura del proyecto

| Archivo | Contenido |
|---|---|
| `index.html` | Portada hacia el 3D y compatibilidad con enlaces 2D anteriores |
| `mapa2d.html` | Plano 2D y fichas; impresión con la distribución vigente |
| `plano_fluir_con_ciencia.pdf` | Plano y fichas vigentes; descarga directa desde el botón del 2D |
| `documento/documento_postulacion.html` | Documento de postulación (texto editable) |
| `documento/documento_postulacion.pdf` | Documento en PDF (incluye figura) |
| `documento/documento_postulacion.docx` | Documento editable en Word (solo texto) |
| `assets/` | Imágenes del mapa y figura |

## Vista 3D y cartografía

`assets/maqueta3d.js` define la escena. Las posiciones y orientaciones en metros locales están en `assets/garden-layout.js`; el 2D se genera desde esos mismos datos. `assets/garden-geometry.js` comparte la proyección y el recorte geográfico entre las vistas. Los senderos y lagunas proceden de `assets/geo/jardin_osm.geojson`; no se escalan a partir del plano ilustrado. El archivo `MEDIDAS_Y_FUENTES.md` distingue cifras institucionales, medidas cartográficas y dimensiones de diseño. Three.js 0.186.1 y su licencia están en `assets/vendor/three/`. Para probar el 3D se necesita servir la carpeta por HTTP.

## Personaje y audioguía

- Un único personaje de 1,70 m se mueve con flechas / WASD, controles táctiles o clic en el suelo. Elegir un módulo lo hace caminar hasta su frente. El recorrido automático utiliza el mismo personaje y conserva su posición al pausar.
- `assets/visitor-navigation.js` calcula rutas que evitan agua y huellas de los stands. Las rutas son virtuales y no certifican transitabilidad en terreno.
- `assets/audio-guide.js`, arreglo `SUMMARIES`, contiene los siete resúmenes narrados. Se pronuncia también el número y el nombre del stand.
- Además de los MP3 incluidos, se pueden elegir voces de Web Speech del navegador. Se priorizan las de Chile, luego Latinoamérica; el selector informa qué voces existen. Los siete MP3 de `assets/audio/` ofrecen una alternativa en español latino de México (Paulina), disponible incluso sin voces del navegador. Si una voz del dispositivo falla, se pasa al audio incluido.
- La narración automática está desactivada al abrir la página. Se activa con “Escuchar al llegar a cada stand”. No se reproducen varias narraciones a la vez.

Al cambiar un resumen de `SUMMARIES`, ejecutar `node tools/generar_audios.mjs` para actualizar los MP3; requiere macOS con Paulina y ffmpeg. La aplicación publicada reproduce esos archivos y no necesita estas herramientas.

## Monitores Espacio DTC+

Cada módulo tiene dos monitores fijos en poses de explicación, con poleras naranjas y ESPACIO DTC+ en pecho y espalda. La marca grande se dibuja en `dtcCanvas` en `assets/maqueta3d.js`; el grupo `staff` contiene los 14 monitores y el grupo `people` conserva al visitante controlable. Sus gestos respetan la preferencia de movimiento reducido y se acentúan durante la narración del módulo.
