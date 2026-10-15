# Guía de edición — Fluir con-ciencia, gotas de vida

La vista principal es `index.html`; la alternativa 3D es `maqueta3d.html`. Ambas comparten los textos y datos de módulos de `assets/map-data.js`. Al subir cambios al repositorio, GitHub Pages actualiza el sitio público en ~1 minuto.

- **Sitio público:** https://anavictoria8.github.io/fluir-con-ciencia/
- **Repositorio:** https://github.com/AnaVictoria8/fluir-con-ciencia

## Formas de editar

### 1. Pedir los cambios (la más simple)
Escribe el cambio deseado (texto, posición de un módulo, color, etc.) a la persona que administra el proyecto en el computador. El cambio se aplica, se sube y se verifica.

### 2. Editar directamente en GitHub (para textos simples)
1. Entra a https://github.com/AnaVictoria8/fluir-con-ciencia con la cuenta AnaVictoria8
2. Abre el archivo (ej: `index.html`) → botón del lápiz ✏️
3. Edita el texto → botón verde **Commit changes**
4. En ~1 minuto el sitio se actualiza solo

*Recomendado para: cambiar títulos, nombres, textos de módulos, README. Para cambios visuales (mover módulos en el mapa, recorrido), mejor la vía 1.*

### 3. Editar en el computador del proyecto
Los archivos están en `Documents/proyecto_agua_vic/`. Abrir `index.html` con doble clic para previsualizar. Para publicar los cambios se suben al repositorio (requiere acceso de colaborador).

## Dónde está cada cosa

| Qué quiero cambiar | Dónde |
|---|---|
| Nombre del proyecto y subtítulo | `assets/map-data.js`, bloque `PROJECT` (y el `<h1>`/`<p>` del encabezado) |
| Textos de los 7 módulos (nombre, pregunta, mensaje, interacción, aprendizaje, fichas) | `assets/map-data.js`, bloque `const MODULES = [...]` — un objeto por módulo |
| Posición de un módulo en el mapa | Campo `sx` (horizontal) e `sy` (vertical) de ese módulo. Son fracciones de 0 a 1 del mapa del sector (ej: `0.30` = 30%) |
| Recorrido naranjo (ida y regreso) | `ARRIVAL` define la llegada de cada módulo y `TOUR_LEGS` sus tramos; `ROUTE` se calcula automáticamente |
| Áreas destacadas (línea segmentada) | `const ZONE = [...]` — un polígono por cada costado, sin incluir la plaza central |
| Etiquetas de referencia (Baños, Administración…) | `const REFS = [...]` |
| Color de un módulo | Campo `color` de ese módulo |

## Interacciones del mapa

- Seleccionar un número del mapa o del navegador inferior centra la cámara y abre la ficha correspondiente.
- El recorrido animado avanza por los caminos, se detiene 8 segundos en cada estación y regresa al acceso. Se puede pausar, continuar y cambiar su velocidad.
- “Capas del mapa” controla recorrido, huellas y nombres. Los nombres se distribuyen evitando colisiones; en móvil se prioriza el seleccionado.
- El panel de módulos incluye demostraciones conceptuales y accesos al tour 360°, mapa interactivo y PDF oficiales de UTalca. El contenido externo se carga bajo demanda y ofrece enlace de apertura independiente.
- Las posiciones y huellas son referenciales: las distancias reales y los 3 m libres propuestos deben comprobarse en terreno.

## Parámetros útiles de la URL

- `?view=general` — vista general del jardín
- `?mod=4` — abre directo la ficha del módulo 4
- `?tab=ruta` o `?tab=ficha` — pestañas del panel
- `?tour=1` — inicia el recorrido guiado automático
- `?printpreview=1` — vista previa del documento imprimible

## Regenerar los PDF (requiere Chrome, en el computador del proyecto)

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --print-to-pdf=plano_fluir_con_ciencia.pdf --no-pdf-header-footer index.html

"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --print-to-pdf=documento/documento_postulacion.pdf --no-pdf-header-footer documento/documento_postulacion.html
```

## Estructura del proyecto

| Archivo | Contenido |
|---|---|
| `index.html` | Mapa interactivo completo (contenido editable) |
| `plano_fluir_con_ciencia.pdf` | Plano/maqueta imprimible |
| `documento/documento_postulacion.html` | Documento de postulación (texto editable) |
| `documento/documento_postulacion.pdf` | Documento en PDF (incluye figura) |
| `documento/documento_postulacion.docx` | Documento editable en Word (solo texto) |
| `assets/` | Imágenes del mapa y figura |

## Vista 3D y cartografía

`assets/maqueta3d.js` define la escena y las posiciones propuestas `SITES` en metros locales. Los senderos y lagunas proceden de `assets/geo/jardin_osm.geojson`; no se escalan a partir del plano ilustrado. El archivo `MEDIDAS_Y_FUENTES.md` distingue cifras institucionales, medidas cartográficas y dimensiones de diseño. Three.js 0.186.1 y su licencia están en `assets/vendor/three/`. Para probar el 3D se necesita servir la carpeta por HTTP.

## Personaje y audioguía

- Un único personaje de 1,70 m se mueve con flechas / WASD, controles táctiles o clic en el suelo. Elegir un módulo lo hace caminar hasta su frente. El recorrido automático utiliza el mismo personaje y conserva su posición al pausar.
- `assets/visitor-navigation.js` calcula rutas que evitan agua y huellas de los stands. Las rutas son virtuales y no certifican transitabilidad en terreno.
- `assets/audio-guide.js`, arreglo `SUMMARIES`, contiene los siete resúmenes narrados. Se pronuncia también el número y el nombre del stand.
- Además de los MP3 incluidos, se pueden elegir voces de Web Speech del navegador. Se priorizan las de Chile, luego Latinoamérica; el selector informa qué voces existen. Los siete MP3 de `assets/audio/` ofrecen una alternativa en español latino de México (Paulina), disponible incluso sin voces del navegador. Si una voz del dispositivo falla, se pasa al audio incluido.
- La narración automática está desactivada al abrir la página. Se activa con “Escuchar al llegar a cada stand”. No se reproducen varias narraciones a la vez.

Al cambiar un resumen de `SUMMARIES`, ejecutar `node tools/generar_audios.mjs` para actualizar los MP3; requiere macOS con Paulina y ffmpeg. La aplicación publicada reproduce esos archivos y no necesita estas herramientas.

## Monitores Espacio DTC+

Cada módulo tiene dos monitores fijos en poses de explicación, con poleras naranjas y ESPACIO DTC+ en pecho y espalda. La marca grande se dibuja en `dtcCanvas` en `assets/maqueta3d.js`; el grupo `staff` contiene los 14 monitores y el grupo `people` conserva al visitante controlable. Sus gestos respetan la preferencia de movimiento reducido y se acentúan durante la narración del módulo.
