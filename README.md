# Fluir con-ciencia, gotas de vida: Experiencias Hídricas en el Maule

**Fluir con-ciencia, gotas de vida** — propuesta de **7 módulos interactivos sobre el agua** para el **sector de entrada del Jardín Botánico & Arboretum de la Universidad de Talca**: mapa interactivo con recorrido, distribución, interacciones y guión museográfico preliminar.

## Publicación

- **Mapa interactivo:** https://anavictoria8.github.io/fluir-con-ciencia/

## Contenido del repositorio

| Archivo | Descripción |
|---|---|
| `index.html` | Mapa interactivo 2D con datos locales compartidos. Incluye vista del sector de entrada y vista general, recorrido continuo 1→7 con pausa y velocidad, capas, fichas con demostraciones conceptuales, acceso a recursos oficiales y versión imprimible. |
| `plano_fluir_con_ciencia.pdf` | Plano de la propuesta en PDF (generado desde `index.html`). |
| `documento/documento_postulacion.html` | Documento de postulación: descripción detallada de la experiencia + guión museográfico preliminar. |
| `documento/documento_postulacion.pdf` | El mismo documento en PDF (incluye la figura del plano). |
| `documento/documento_postulacion.docx` | Versión editable para copiar/pegar en formularios (solo texto; la figura va en el PDF). |
| `assets/` | Mapa base (recortes del mapa oficial UTalca) y figura del plano. |

## Parámetros útiles del mapa interactivo

Se pueden compartir vistas específicas con parámetros en la URL:

- `?view=general` — vista general del jardín
- `?mod=4` — abre la ficha del módulo 4
- `?tab=ruta` — abre la pestaña de recorrido (`mods`, `ruta`, `ficha`)
- `?tour=1` — inicia el recorrido guiado automático
- `?printpreview=1` — vista previa del documento imprimible (PDF)

## Maqueta 3D y medidas

- `maqueta3d.html`: alternativa 3D con cámara libre, vistas de conjunto / superior / entrada, selección de siete stands, visita animada, un personaje de 1,70 m que camina y medición horizontal entre dos puntos.
- `assets/garden-layout.js`: superficies de tierra y distribución compacta del acceso: tres stands frente a la casa, uno en el borde del ramal izquierdo y tres antes de los baños. Define anchos interpretados de caminos y las orientaciones de cada stand.
- `assets/visitor-navigation.js`: navegación por una cuadrícula en metros, restringida a caminos y explanadas, con rutas que evitan áreas verdes, lagunas, construcciones y stands.
- `assets/audio-guide.js`: resúmenes de las siete estaciones y lectura mediante las voces en español del navegador; prioriza `es-CL`, luego otras voces latinoamericanas. Incluye siete archivos MP3 en español latino de México (voz Paulina) como alternativa independiente de las voces del dispositivo. Si se ofrece una voz chilena, se prioriza; si esa voz falla, se usa el audio incluido. No requiere un servicio de pago.
- `assets/maqueta3d.js` y `assets/maqueta3d.css`: escena y controles. Las ubicaciones propuestas en metros locales están en `SITES`; el origen corresponde a una intersección de senderos OSM.
- `assets/geo/jardin_osm.geojson`: copia de referencia de senderos, lagunas y ámbito cartográfico, con atribución y enlaces a los elementos originales.
- `MEDIDAS_Y_FUENTES.md`: fuentes institucionales, longitudes calculadas, método y limitaciones. `python tools/medir_cartografia.py` reproduce los cálculos sin red.
- `assets/vendor/three/`: Three.js 0.186.1 y OrbitControls, licencia MIT. La vista no descarga librerías desde terceros.

Cada stand incluye dos monitores de Espacio DTC+ con poleras naranjas, marca grande en pecho y espalda y gestos de explicación. Se ubican dentro de la huella del módulo, separados del personaje visitante.

Toca o haz clic en el suelo o en un stand para caminar; la cámara sigue al personaje automáticamente. Arrastrar con un dedo o con el botón izquierdo gira e inclina la vista sin cambiar de modo. La rueda o el pellizco acercan y alejan. El ángulo y la distancia elegidos se conservan al caminar. Al llegar a una estación elegida o durante la visita animada, la cámara encuadra automáticamente el frente del stand y al visitante; se puede volver a girar o acercar libremente. Para desplazar libremente el mapa, arrastra con dos dedos, con el botón derecho o con Mayús. «Centrarme» vuelve a centrar la cámara; «Ver jardín» muestra el conjunto. «Más vistas» reúne stands del acceso, entrada exterior y vista superior. Las flechas / WASD y la botonera desplegable permiten movimiento directo. «Detener» aparece mientras caminas; Esc también detiene al personaje. El recorrido automático permite pausar y continuar; mirar alrededor y acercar no lo interrumpen. El modo de medición desactiva el movimiento por clic.

“Escuchar resumen” lee el nombre y una síntesis del módulo actual. Hay pausa, continuación y detención. La lectura al llegar es opcional y está apagada inicialmente; si se activa, el recorrido espera a que termine la narración antes de continuar. El selector ofrece el audio incluido y las voces reales en español del navegador. El texto del resumen siempre está disponible. Para regenerar los MP3 después de editar los resúmenes: `node tools/generar_audios.mjs` (macOS, voz Paulina y ffmpeg).

Para probar ambas vistas, servir esta carpeta por HTTP, por ejemplo `python -m http.server 8765 --bind 127.0.0.1`, y abrir `http://127.0.0.1:8765/`. La opción 3D necesita WebGL y un servidor HTTP (también funciona en GitHub Pages).

La base 3D utiliza coordenadas geográficas, mientras que la base 2D es un plano ilustrado sin escala. Las posiciones de los stands son propuestas en ambas vistas y no una transformación exacta entre ellas. No deben usarse como plano de ejecución sin validar el terreno.

## Cómo editar

Los datos compartidos por ambas vistas están en `assets/map-data.js`; `index.html` contiene la presentación y las interacciones del mapa 2D:

- `PROJECT` — nombre del proyecto y URL pública.
- `MODULES` — textos de los 7 módulos (nombre, pregunta, mensaje, interacción, fichas) y posición en el mapa (`sx`, `sy`, en fracciones del mapa del sector).
- `ARRIVAL`, `TOUR_LEGS` — llegadas en el camino y tramos del recorrido (incluido el regreso al acceso); `ROUTE` se deriva de ellos.
- `ZONE`, `REFS` — dos áreas de implantación y etiquetas de referencia.
- `DEMOS` — demostraciones conceptuales de las fichas (sin mediciones reales).
- `RESOURCES` — tour 360° y mapa interactivo oficial, cargados solo al abrirlos.

La distribución compacta reúne los módulos 1, 2, 3 y 7 en la pradera poniente y 4, 5 y 6 junto al camino oriente. Las huellas no están a escala: dimensiones, separación y ancho libre se validan en terreno. El recorrido automático dedica 8 segundos a cada estación y permite pausa, reanudación y cambio de velocidad. En móvil, el botón de módulos abre y cierra el panel. El movimiento se reduce si el sistema tiene activada esa preferencia.
- Los mismos datos alimentan automáticamente las fichas del panel y el PDF imprimible.

## Regenerar los PDF

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --print-to-pdf=plano_fluir_con_ciencia.pdf --no-pdf-header-footer index.html

"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --print-to-pdf=documento/documento_postulacion.pdf --no-pdf-header-footer documento/documento_postulacion.html
```

## Créditos

Mapa base: mapa oficial del **Jardín Botánico & Arboretum, Universidad de Talca** (uso referencial para esta propuesta; la ubicación definitiva de los módulos se ajustará junto al equipo del jardín). Esquema no a escala.

La vista 3D incorpora una reconstrucción visual del acceso basada en el tour 360° UTalca: letrero con base de hormigón, postes de madera irregulares, cerco verde, bancas, caminos de tierra y vegetación de distintos portes. Las vistas «Stands del acceso» y «Entrada exterior» muestran sus dos caras. La instalación se concentra en las explanadas de tierra del acceso. El recorte ampliado incluye las dos lagunas próximas completas. `assets/garden-environment.js` genera los objetos y las texturas localmente, con vegetación instanciada. Las posiciones del mobiliario y los árboles son aproximadas; sus fuentes y alcance están en `MEDIDAS_Y_FUENTES.md`. La navegación evita estos nuevos obstáculos y conserva libre el acceso.

`assets/garden-buildings.js` incorpora la casa de la izquierda, la caseta y los baños de la derecha, con fachadas y cubiertas interpretadas de referencias. Las etiquetas y los accesos «Reconoce la entrada» acercan la cámara a cada estructura. Un dedo gira la vista; dos dedos permiten desplazar y acercar sin activar la caminata por accidente. Los clics en edificios los enfocan y los números de stands restauran el seguimiento del visitante.


La distribución 3D sigue la referencia de la explanada compartida el 15 de octubre: los stands 1–3 quedan frente a la casa, el 7 al borde del camino lateral izquierdo y los stands 4–6 antes de los baños. Los módulos 4–6 y el pabellón de baños miran hacia la laguna; el stand lateral mira hacia el camino. Entre 4–6 quedan 3 m y por delante se conserva una franja continua de 4 m en la maqueta. Las vistas inicial y superior se centran en esta instalación compacta. Los anchos de caminos y contornos de tierra son interpretaciones visuales; las coordenadas OSM no proporcionan esos anchos. `node tools/check_garden_layout.mjs` comprueba las huellas completas, los obstáculos, las rutas entre estaciones y el espacio de circulación representado.


`assets/station-framing.js` calcula una toma frontal que incluye la cubierta completa y al visitante, reserva espacio para los controles y compara ángulos para evitar edificios u otros stands por delante. Al llegar se retiran los rótulos grandes y las ayudas de la escena. `node tools/check_station_framing.mjs` comprueba 35 encuadres de las siete estaciones en tamaños de móvil, tablet y escritorio.

La vista «Entrada exterior» muestra el letrero a la derecha del paso al entrar, sobre una base de hormigón inclinada; el panel del mapa queda junto a la empalizada. Se incorporan el zócalo bajo, los bordes de hormigón del acceso, una explanada exterior más amplia, una banca y vegetación lateral, siguiendo el panorama «Entrada» del tour institucional. Las dimensiones siguen siendo aproximadas.
