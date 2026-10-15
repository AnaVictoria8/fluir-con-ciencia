# Fluir con-ciencia, gotas de vida: Experiencias Hídricas en el Maule

**Fluir con-ciencia, gotas de vida** — propuesta de **7 módulos interactivos sobre el agua** para el **sector de entrada del Jardín Botánico & Arboretum de la Universidad de Talca**: mapa interactivo con recorrido, distribución, interacciones y guión museográfico preliminar.

## Publicación

- **Mapa interactivo:** https://anavictoria8.github.io/fluir-con-ciencia/

## Contenido del repositorio

| Archivo | Descripción |
|---|---|
| `index.html` | Mapa interactivo (autocontenido, sin dependencias). Incluye vista del sector de entrada y vista general, recorrido guiado 1→7, fichas por módulo y versión imprimible. |
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

## Cómo editar

Todo el contenido editable está en `index.html`:

- `PROJECT` — nombre del proyecto y URL pública.
- `MODULES` — textos de los 7 módulos (nombre, pregunta, mensaje, interacción, fichas) y posición en el mapa (`sx`, `sy`, en fracciones del mapa del sector).
- `ROUTE`, `ZONE`, `REFS` — recorrido, zona de stands y etiquetas de referencia.
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
