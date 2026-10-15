# Guía de edición — Fluir con-ciencia, gotas de vida

El sitio es un archivo `index.html` autocontenido. Al subir cambios al repositorio, GitHub Pages actualiza el sitio público en ~1 minuto.

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

## Dónde está cada cosa en `index.html`

| Qué quiero cambiar | Dónde |
|---|---|
| Nombre del proyecto y subtítulo | Bloque `PROJECT` (y el `<h1>`/`<p>` del encabezado) |
| Textos de los 7 módulos (nombre, pregunta, mensaje, interacción, aprendizaje, fichas) | Bloque `const MODULES = [...]` — un objeto por módulo |
| Posición de un módulo en el mapa | Campo `sx` (horizontal) e `sy` (vertical) de ese módulo. Son fracciones de 0 a 1 del mapa del sector (ej: `0.30` = 30%) |
| Recorrido naranjo (bucle) | `const ROUTE = [...]` — lista de puntos `[x, y]` |
| Zona destacada (línea segmentada) | `const ZONE = [...]` |
| Etiquetas de referencia (Baños, Administración…) | `const REFS = [...]` |
| Color de un módulo | Campo `color` de ese módulo |

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
