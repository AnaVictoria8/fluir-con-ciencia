"""Recalcula longitudes WGS84 sobre la copia pública de OpenStreetMap; sin red."""
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def haversine(a, b):
    lon1, lat1, lon2, lat2 = map(math.radians, [*a, *b])
    h = math.sin((lat2-lat1)/2)**2 + math.cos(lat1)*math.cos(lat2)*math.sin((lon2-lon1)/2)**2
    return 2 * 6371008.8 * math.asin(min(1, math.sqrt(h)))

def main():
    data = json.loads((ROOT / 'assets/geo/jardin_osm.geojson').read_text())
    rows = []
    for f in data['features']:
        if f['geometry']['type'] != 'LineString':
            continue
        p = f['geometry']['coordinates']
        rows.append({'osmWay': f['properties']['osmWay'], 'source': f['properties']['source'],
                     'lengthMeters': round(sum(haversine(a,b) for a,b in zip(p,p[1:])), 2),
                     'endToEndMeters': round(haversine(p[0],p[-1]), 2),
                     'start': p[0], 'end': p[-1]})
    out = {'method': 'Suma de segmentos geodésicos esféricos (haversine, radio medio 6371008.8 m).',
           'accuracy': 'Estimación cartográfica; no levantamiento topográfico. Decimales solo para reproducibilidad.',
           'retrievedOn': data['retrievedOn'], 'paths': rows}
    (ROOT / 'assets/geo/mediciones.json').write_text(json.dumps(out, ensure_ascii=False, indent=2)+'\n')
    for r in rows:
        print(f"OSM {r['osmWay']}: {r['lengthMeters']:.1f} m siguiendo el trazado; {r['endToEndMeters']:.1f} m entre extremos")

if __name__ == '__main__':
    main()
