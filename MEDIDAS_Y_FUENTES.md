# Base métrica del jardín y de la maqueta 3D

Consulta: **14 de octubre de 2026**. Las cifras siguientes distinguen información institucional, mediciones sobre cartografía y dimensiones del proyecto.

## Datos publicados por UTalca

- **13 hectáreas** de extensión del Jardín Botánico: [página institucional](https://www.utalca.cl/vinculacion/jardin-botanico-y-arboretum/) y [sitio del jardín](https://www.vinculacion.utalca.cl/index.php/jardin-botanico/).
- **3 hectáreas** del Arboretum colindante: [sitio del jardín](https://www.vinculacion.utalca.cl/index.php/jardin-botanico/). Se conserva la distinción de la fuente; no se suman ambas cifras para deducir una geometría.
- La primera sección inaugurada en 2006 tenía **6,5 hectáreas**: [Reporte de Sustentabilidad 2015, p. 122](https://www.vinculacion.utalca.cl/assets/reporte_gri_2015.pdf). Explica por qué aparecen cifras distintas en sitios turísticos antiguos.
- Los nuevos recorridos **UTalcamina, de 800 m a 1,1 km**, conectan accesos del campus con el jardín: [noticia institucional del 2 de octubre de 2026](https://www.utalca.cl/noticias/inauguran-senderos-abiertos-a-la-comunidad-en-campus-lircay/). No son las longitudes del recorrido de stands ni un circuito interno completo del jardín.

## Distancias calculadas a partir de coordenadas

Se descargó cartografía vectorial de la API pública de OpenStreetMap del entorno del jardín. Se conserva una selección sin datos de usuarios en `assets/geo/jardin_osm.geojson`, con atribución, identificadores, fecha de descarga y fecha de edición de cada elemento.

| Trazado cartográfico | Longitud siguiendo todos sus puntos | Distancia recta entre extremos |
|---|---:|---:|
| [Sendero OSM 725218720](https://www.openstreetmap.org/way/725218720) | ≈266 m | ≈232 m |
| [Sendero OSM 725218721](https://www.openstreetmap.org/way/725218721) | ≈373 m | ≈214 m |
| [Sendero OSM 725218722](https://www.openstreetmap.org/way/725218722) | ≈148 m | ≈109 m |
| [Sendero OSM 725221067](https://www.openstreetmap.org/way/725221067) | ≈89 m | ≈62 m |

Son longitudes de **elementos cartográficos completos**, no necesariamente recorridos turísticos nombrados por UTalca. No se suman: algunos pueden compartir conexiones o pertenecer a alternativas de recorrido. Sus extremos y coordenadas se registran en `assets/geo/mediciones.json`.

Método: suma de segmentos mediante haversine, radio terrestre medio 6.371.008,8 m. Reproducir con `python tools/medir_cartografia.py`. Los decimales del JSON son de cálculo, no una declaración de precisión de campo.

El polígono OSM 725218719 mide aproximadamente 11,0 ha y tiene envolvente norte–sur de 601 m y este–oeste de 529 m. **No coincide con las 13 ha institucionales**, por lo que no se utiliza como certificación de superficie ni se fuerza su escala para igualarla. La cartografía puede estar incompleta o delimitar otro ámbito.

## Qué se usa en 3D

- Senderos y lagunas se construyen con sus coordenadas OSM, proyectadas a un marco local en metros alrededor de `lat -35.4058339, lon -71.631515`.
- La zona de entrada se contrastó visualmente con imágenes aéreas públicas de [Esri World Imagery](https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer). Esas imágenes no se incorporan al sitio ni se usan para afirmar anchos exactos de senderos.
- Los stands son una **propuesta de implantación** junto al acceso, en dos grupos, y no ubicaciones levantadas en terreno. La vista 3D usa una base geográfica distinta del mapa ilustrado 2D: sus posiciones no deben interpretarse como una transformación exacta entre ambos.
- Cada stand tiene huella propuesta de **2,5 × 2,5 m**, cubierta de **2,7 m** de alto y mesón de **0,85 m**. La persona de referencia mide **1,70 m**. Son dimensiones de diseño, no medidas encontradas del jardín.
- El acceso, el mobiliario y los tipos de vegetación se interpretan visualmente a partir del tour 360° y fotografías, con posiciones y dimensiones aproximadas (véase la actualización del 15 de octubre). Las cubiertas corresponden a la propuesta de stands.
- La herramienta de medir calcula separaciones horizontales entre puntos del modelo; no mide pendientes ni garantiza que el trayecto sea transitable.

## Qué queda sin verificar

No se encontró, entre los recursos revisados, un plano acotado del acceso con anchos peatonales, linderos de zonas de animales, arbolado, instalaciones y ubicación exacta de baños/administración. El [plano ilustrado oficial](https://www.vinculacion.utalca.cl/assets/jb/mapadigital/mapa_digital_jardin_botanico_y_aboretum.pdf) y el [tour 360°](https://interactive.utalca.cl/pbotanico/Tour_Jbotanico_v2/) sirven para reconocer el entorno; sus versiones revisadas no aportan una escala métrica ni posiciones GPS por panorama utilizables para ese ajuste.

La separación definitiva de módulos, permisos de ocupación y el objetivo de mantener 3 m libres en circulación deben validarse con el equipo del jardín. No se deducen de las 13 hectáreas ni del tamaño de los iconos del plano ilustrado.

## Reconstrucción visual del acceso · 15 de octubre de 2026

Se recorrieron visualmente los panoramas del **acceso exterior y el sendero interior** del [tour 360° institucional](https://interactive.utalca.cl/pbotanico/Tour_Jbotanico_v2/). Se contrastaron con el [plano ilustrado oficial de 2025](https://www.vinculacion.utalca.cl/assets/jb/mapadigital/mapa_digital_jardin_botanico_y_aboretum.pdf), las [fotografías institucionales](https://www.utalca.cl/vinculacion/jardin-botanico-y-arboretum/) y la [referencia fotográfica del acceso de Ruta Accesible](https://rutaaccesible.com/jardin-botanico-de-talca-accesibilidad/).

Elementos observados e interpretados en `assets/garden-environment.js`:

- Placa oscura «Jardín Botánico · Universidad de Talca», flor y base baja de hormigón.
- Empalizada de postes de madera de alturas irregulares y cerco verde de malla junto al acceso.
- Explanada y senderos de tierra compactada, bancas blancas de hormigón, atril amarillo y baranda baja de madera junto al agua.
- Álamos de porte estrecho, árboles de copa ancha, arbustos y vegetación acuática. Se representan tipos de porte; no se certifica la especie ni la posición individual de cada ejemplar.

Las coordenadas de senderos y lagunas siguen siendo las de OSM. Se amplió el recorte del entorno para incluir completas las dos lagunas próximas del sector sur, además del tramo de agua junto a los stands. El tramo oriental de este último continúa fuera del modelo.

**La reconstrucción del mobiliario y la vegetación es visual y aproximada**, no un levantamiento topográfico, fotogrametría ni inventario actualizado. El tour registra el estado al momento de su captura. Las panorámicas del tour se consultaron como referencia; no se descargaron ni se redistribuyen como texturas del modelo. El atril utiliza la imagen del mapa oficial que ya formaba parte de los recursos locales de la propuesta. Las texturas de terreno y los objetos 3D se generan localmente con código. La marca de la placa es una interpretación gráfica referencial.

La persona comienza delante del acceso y la navegación evita el letrero, el cerco, los troncos, las bancas y las barandas, además del agua y los stands. La abertura del acceso se mantiene transitable. El botón «Entrada» permite comparar el conjunto con la referencia real enlazada en la propia maqueta.

### Casa, caseta y baños del acceso

Se añadieron volúmenes de referencia en `assets/garden-buildings.js`: casa a la izquierda al entrar, caseta exterior y baños a la derecha, siguiendo la orientación indicada por el usuario y las referencias disponibles. Para los baños se revisó la fotografía exterior amplia de la galería «Baño accesible» de [Ruta Accesible](https://rutaaccesible.com/jardin-botanico-de-talca-accesibilidad/): cubierta gris, centro blanco con puertas y paños laterales de listones de madera verticales. Para la caseta se observó el panorama del acceso del [tour institucional](https://interactive.utalca.cl/pbotanico/Tour_Jbotanico_v2/): revestimiento de madera oscura, ventanas y alero.

La casa, el pabellón, la caseta y la rampa tienen dimensiones y emplazamientos aproximados; no se atribuye una función administrativa verificada a la casa ni se certifica una pendiente de accesibilidad a partir del modelo. Las etiquetas del mapa y sus botones sirven para localizar estos hitos. La vegetación evita las nuevas huellas y el visitante las rodea.

### Orientación de la casa corregida con referencia visual del usuario

La imagen del tour compartida por el usuario muestra la fachada de la casa al entrar y mirar a la izquierda: puerta ocre, ventanas con rejas, frontón triangular, porche con barandas cruzadas y estructura de emparrado al costado. Se corrigió el giro del volumen para que su frente mire a la explanada interior (sur local, +z), en vez de hacia el exterior del acceso. Se ajustaron la cubierta a dos aguas, el porche y la huella usada por la navegación. Las proporciones y la posición siguen siendo aproximadas.


### Explanada y distribución de stands corregidas con la referencia del acceso

El 15 de octubre de 2026 se volvió a revisar «Entrada» y «Entrada Jardín» del [tour institucional](https://interactive.utalca.cl/pbotanico/Tour_Jbotanico_v2/), junto con la captura aportada por el usuario. Se observa una explanada continua de tierra frente a la casa y caminos amplios; representar todos los ejes OSM como franjas uniformes de 2,8 m subestimaba visualmente este espacio. Las áreas verdes se conservan como zonas ajardinadas, fuera de la implantación y del recorrido del visitante.

`assets/garden-layout.js` concentra esta interpretación. La propuesta sitúa los módulos **1, 2 y 3 frente a la casa**, el **7 en el borde izquierdo del ramal lateral**, y los **4, 5 y 6 en la explanada derecha del acceso, antes de los baños**. Los stands se orientan hacia la circulación; se mantiene acceso a la casa y al frente de los baños.

Los ejes geográficos y los contornos de agua originales se conservan. Los caminos se representan con anchos de **4,5 m**, **6–7 m en los tramos próximos al acceso** y **8 m en el ramal lateral próximo a la casa**, más polígonos continuos de explanada. **Estos anchos y polígonos son aproximaciones de la maqueta a partir de referencias visuales, no mediciones del jardín ni una propuesta de pavimentar áreas verdes.** No se ha deducido una escala métrica de la captura panorámica.

La misma definición de superficie sirve para dibujar la tierra, excluir vegetación generada de los pasos y calcular las rutas. `node tools/check_garden_layout.mjs` verifica que las huellas completas estén sobre esas superficies, sin invadir obstáculos o agua; comprueba la conexión de las siete estaciones y de los accesos a casa y baños, un paso central de 3 m y una franja de 3 m hacia los baños **dentro de la geometría del modelo**. La comprobación no sustituye la validación de distancias y circulaciones en terreno.


### Orientación hacia la laguna, paso libre y entrada exterior

Se corrigió la orientación del pabellón de baños y de los módulos 4–6 para que sus frentes miren hacia la laguna (este local). La rampa, sus barandas, la llegada y la vista de los baños giran con el edificio. Los tres stands se desplazan hacia el borde exterior de la explanada, conservando **3 m entre huellas** y una **franja frontal continua de 4 m en la geometría de la maqueta**. Las pruebas comprueban esa franja y las conexiones de recorrido; no se presentan como anchos medidos en terreno.

El panorama «Entrada» del [tour institucional](https://interactive.utalca.cl/pbotanico/Tour_Jbotanico_v2/) muestra el paso a la izquierda de la placa de piedra cuando se mira desde fuera: zócalo y bordes de hormigón, base inclinada del letrero, panel del mapa adyacente, postes de madera irregulares, cerco verde lateral, banca y explanada de tierra. Se corrigió la posición del letrero al lado derecho del paso y se reinterpretaron esos elementos. La vista «Entrada exterior» permite revisar esta cara del acceso sin confundirla con la distribución interior de stands.
