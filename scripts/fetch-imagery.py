"""Download unmodified, georeferenced CC BY 4.0 EOX 2016 WMS cutouts."""
import concurrent.futures, json, math, pathlib, urllib.parse, urllib.request
root=pathlib.Path(__file__).resolve().parents[1]
sites=json.loads((root/'terrain/manifest.json').read_text())
def fetch(item):
    name,s=item
    half=s['extentKm']/2
    dy=half/111.32;dx=half/(111.32*math.cos(math.radians(s['lat'])))
    bbox=[s['lon']-dx,s['lat']-dy,s['lon']+dx,s['lat']+dy]
    params=dict(service='WMS',request='GetMap',version='1.1.1',layers='s2cloudless',styles='',format='image/jpeg',srs='EPSG:4326',bbox=','.join(map(str,bbox)),width=1536,height=1536)
    url='https://tiles.maps.eox.at/wms?'+urllib.parse.urlencode(params)
    with urllib.request.urlopen(url,timeout=90) as r:
        if 'image' not in r.headers.get('Content-Type',''):raise RuntimeError(r.read().decode())
        data=r.read()
    if not data.startswith(b'\xff\xd8'):raise RuntimeError('Expected JPEG')
    (root/'terrain'/f'{name}.jpg').write_bytes(data)
    print(name,len(data),flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:list(pool.map(fetch,sites.items()))
