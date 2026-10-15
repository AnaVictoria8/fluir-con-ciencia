"""PDF descargable con el plano y las fichas vigentes. Requiere Python + reportlab y Node.
Ejecutar después de node tools/generate_plan2d.mjs.
"""
from pathlib import Path
import json, math, re, subprocess, xml.etree.ElementTree as ET
from html import escape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Flowable, KeepTogether, PageBreak
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4

ROOT = Path(__file__).resolve().parents[1]
js = """import fs from 'node:fs';import vm from 'node:vm';import {PLAN2D} from './assets/plan2d-data.js';const ctx={window:{}};vm.runInNewContext(fs.readFileSync('assets/map-data.js','utf8'),ctx);console.log(JSON.stringify({...ctx.window.WATER_MAP_DATA,PLAN2D}));"""
data = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', js], cwd=ROOT, text=True))
modules, plan = data['MODULES'], data['PLAN2D']
svg = ET.parse(ROOT / 'assets/plano-sector.svg').getroot()
INK, TEAL = HexColor('#183f38'), HexColor('#0e7c86')

# El SVG generado usa únicamente polígonos, círculos, rectángulos, textos y trazos.
# Se trasladan como vectores al PDF para mantener nítidos el plano y sus etiquetas.
def path(c, d, fill, stroke):
    tokens = re.findall(r'[A-Za-z]|[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?', d)
    p, x, y, command, i = c.beginPath(), 0, 0, None, 0
    while i < len(tokens):
        if tokens[i].isalpha():
            command = tokens[i]; i += 1
            if command in 'Zz': p.close(); continue
        relative = command.islower(); kind = command.upper()
        if kind in ('M', 'L'):
            xx, yy = map(float, tokens[i:i+2]); i += 2
            if relative: xx, yy = xx+x, yy+y
            x, y = xx, yy
            (p.moveTo if kind == 'M' else p.lineTo)(x, y)
            command = 'l' if relative else 'L'
        elif kind in ('H', 'V'):
            v = float(tokens[i]); i += 1
            if kind == 'H': x = x+v if relative else v
            else: y = y+v if relative else v
            p.lineTo(x, y)
        else: raise ValueError(f'Trazo SVG no admitido: {command}')
    c.drawPath(p, fill=fill, stroke=stroke)

def svg_element(c, e):
    tag = e.tag.rsplit('}', 1)[-1]
    if tag in ('defs', 'title', 'desc'): return
    c.saveState()
    if tag == 'g':
        transform = e.get('transform', '')
        if transform:
            match = re.fullmatch(r'translate\(([-.\d]+)[, ]+([-.\d]+)\)', transform)
            if not match: raise ValueError(transform)
            c.translate(*map(float, match.groups()))
        for child in e: svg_element(c, child)
        c.restoreState(); return
    fill, stroke = e.get('fill', '#34594a' if tag == 'text' else '#000000'), e.get('stroke', 'none')
    if fill.startswith('url('): fill = '#e3ead9'
    if stroke == 'currentColor': stroke = '#34594a'
    if fill != 'none': c.setFillColor(HexColor(fill))
    if stroke != 'none': c.setStrokeColor(HexColor(stroke))
    c.setLineWidth(float(e.get('stroke-width', '.1'))); c.setLineCap(1)
    f, s = int(fill != 'none'), int(stroke != 'none')
    if tag == 'rect': c.rect(*[float(e.get(k, 0)) for k in ('x', 'y', 'width', 'height')], fill=f, stroke=s)
    elif tag == 'circle': c.circle(*[float(e.get(k, 0)) for k in ('cx', 'cy', 'r')], fill=f, stroke=s)
    elif tag == 'polygon':
        nums = list(map(float, re.findall(r'[-+]?(?:\d*\.\d+|\d+)', e.get('points'))))
        p = c.beginPath(); p.moveTo(*nums[:2])
        for i in range(2, len(nums), 2): p.lineTo(*nums[i:i+2])
        p.close(); c.drawPath(p, fill=f, stroke=s)
    elif tag == 'path': path(c, e.get('d'), f, s)
    elif tag == 'text':
        c.translate(float(e.get('x', 0)), float(e.get('y', 0))); c.scale(1, -1)
        c.setFont('Helvetica-Bold', float(e.get('font-size', '.75')))
        c.drawCentredString(0, 0, ''.join(e.itertext()))
    else: raise ValueError(f'Elemento SVG no admitido: {tag}')
    c.restoreState()

class PlanDrawing(Flowable):
    def __init__(self): self.width, self.height = 340, 340*65/47
    def draw(self):
        c = self.canv; c.saveState(); c.translate(0, self.height); c.scale(self.width/47, -self.width/47); c.translate(24, 30)
        c.setFillColor(HexColor('#e3ead9')); c.rect(-24,-30,47,65,fill=1,stroke=0)
        clip=c.beginPath();clip.rect(-24,-30,47,65);c.clipPath(clip,stroke=0,fill=0)
        for child in svg: svg_element(c, child)
        frame=plan['frames']['sector']
        def world(p): return [frame['xmin']+p[0]*47, frame['zmin']+p[1]*65]
        c.setStrokeColor(HexColor('#d99a22')); c.setLineWidth(.18); c.setDash(.7,.6)
        for leg in plan['legs']:
            p=c.beginPath();p.moveTo(*world(leg[0]))
            for point in leg[1:]: p.lineTo(*world(point))
            c.drawPath(p)
        c.setDash()
        for stand, module in zip(plan['stands'], modules):
            x,z=stand['position'];color=HexColor(module['color']);c.saveState();c.translate(x,z);c.rotate(-math.degrees(stand['yaw']))
            c.setStrokeColor(color);c.setFillColor(white);c.setLineWidth(.15);c.rect(-1.25,-1.25,2.5,2.5,fill=1,stroke=1)
            p=c.beginPath();p.moveTo(0,1.25);p.lineTo(0,2.8);p.moveTo(-.4,2.4);p.lineTo(0,2.8);p.lineTo(.4,2.4);c.drawPath(p);c.restoreState()
            c.setFillColor(color);c.setStrokeColor(white);c.setLineWidth(.18);c.circle(x,z,1.15,fill=1,stroke=1)
            c.saveState();c.translate(x,z);c.scale(1,-1);c.setFillColor(white);c.setFont('Helvetica-Bold',1.3);c.drawCentredString(0,-.45,str(stand['id']));c.restoreState()
        c.restoreState()

styles={
 'title':ParagraphStyle('title',fontName='Helvetica-Bold',fontSize=20,leading=24,textColor=INK,spaceAfter=8),
 'sub':ParagraphStyle('sub',fontSize=10,leading=14,textColor=TEAL,spaceAfter=10),
 'body':ParagraphStyle('body',fontSize=9.5,leading=13.5,textColor=INK,spaceAfter=7),
 'small':ParagraphStyle('small',fontSize=8,leading=11,textColor=INK,spaceAfter=7),
 'h2':ParagraphStyle('h2',fontName='Helvetica-Bold',fontSize=13,leading=17,textColor=TEAL,spaceAfter=10),
 'card':ParagraphStyle('card',fontName='Helvetica-Bold',fontSize=12,leading=16,textColor=INK,spaceAfter=7),
}
def clean(t): return escape(t.replace('–','-').replace('—','-').replace('\u2011','-'))
def para(t, style='body'): return Paragraph(t, styles[style])
output=ROOT/'plano_fluir_con_ciencia.pdf'
doc=SimpleDocTemplate(str(output),pagesize=A4,leftMargin=34,rightMargin=34,topMargin=32,bottomMargin=36,title=data['PROJECT']['nombre'],author='Fluir con-ciencia - Espacio DTC+')
story=[para('Fluir con-ciencia, gotas de vida','title'),para(clean(data['PROJECT']['sub']),'sub'),para('Plano de implantación y fichas de las siete estaciones','h2'),para('Los stands 1-3 están frente a la casa y el 7 al borde del camino lateral. Los stands 4-6 y los baños miran hacia la laguna. La propuesta deja 3 m entre estos stands y una franja frontal de 4 m. Huellas de 2,5 × 2,5 m; dimensiones y circulación a validar en terreno.')]
legend=[]
for m,s in zip(modules,plan['stands']):
    legend += [para(f'<font color="{m["color"]}"><b>{m["id"]}. {clean(m["nombre"])}</b></font>','small'),para(clean(s['area']),'small'),Spacer(1,5)]
legend += [Spacer(1,5),para('Las flechas indican el frente de los stands. Línea discontinua: recorrido sugerido. Norte arriba.','small')]
table=Table([[PlanDrawing(),legend]],colWidths=[352,175]);table.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),6)]))
story += [table,Spacer(1,7),para('Cartografía © OpenStreetMap contributors. Explanadas y edificios interpretados de referencias UTalca. Misma distribución que las vistas 2D y 3D.','small'),PageBreak(),para('Fichas de los módulos','title')]
for m,s in zip(modules,plan['stands']):
    card=[para(f'<font color="{m["color"]}">{m["id"]}.</font> {clean(m["nombre"])}','card'),para(f'<i>{clean(m["pregunta"])}</i>','sub')]
    for label,key in [('Ubicación','area'),('Mensaje clave','mensaje'),('Interacción','interaccion'),('Aprendizaje','aprende')]:
        card.append(para(f'<b>{label}.</b> {clean(s[key] if key=="area" else m[key])}'))
    card += [para(clean(' · '.join(m['chips'])),'small'),Spacer(1,14)]
    story.append(KeepTogether(card))

def footer(c, doc):
    c.setStrokeColor(TEAL);c.setLineWidth(.5);c.line(34,29,A4[0]-34,29)
    c.setFont('Helvetica',7);c.setFillColor(INK);c.drawString(34,18,'Fluir con-ciencia · Propuesta referencial');c.drawRightString(A4[0]-34,18,str(doc.page))
doc.build(story,onFirstPage=footer,onLaterPages=footer)
print(output)
