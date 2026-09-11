"""Build small, offline elevation grids from public Terrarium elevation tiles.

These are elevation datasets, not generated pictures. Historical Krakatau and
pre-eruption Pinatubo are interpreted at runtime and explicitly labelled.
"""
import concurrent.futures, io, json, math, pathlib, struct, urllib.request
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / 'terrain'
OUT.mkdir(exist_ok=True)
CACHE = ROOT / 'output' / 'terrain-cache'
CACHE.mkdir(parents=True, exist_ok=True)
SITES = {
 'krakatau': (-6.102,105.423,20,12,'Krakatau island group'),
 'pinatubo': (15.142,120.35,22,12,'Mount Pinatubo, Philippines'),
 'aceh': (5.47,95.27,32,11,'Western Aceh, Sumatra'),
 'sanriku': (39.02,141.7,32,11,'Sanriku coast, northeastern Japan'),
 'kilauea': (19.6,-155.5,120,9,'Hawaiʻi island'),
 'rift': (64.27,-21.12,22,11,'Þingvellir rift, Iceland'),
}
N = 193
def pixel(lat, lon, zoom):
    size = 256 * 2**zoom
    return (lon+180)/360*size, (1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2*size
def fetch(key):
    z,x,y=key
    path=CACHE/f'{z}-{x}-{y}.png'
    if not path.exists():
        url=f'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'
        with urllib.request.urlopen(url,timeout=40) as response:
            data=response.read()
        path.write_bytes(data)
    return key, Image.open(path).convert('RGB')
manifest={}
for name,(lat,lon,extent,z,label) in SITES.items():
    points=[]; keys=set()
    for row in range(N):
        north=(.5-row/(N-1))*extent
        for col in range(N):
            east=(col/(N-1)-.5)*extent
            px,py=pixel(lat+north/111.32,lon+east/(111.32*math.cos(math.radians(lat))),z)
            ix,iy=int(px),int(py)
            points.append((ix,iy,px-ix,py-iy))
            for dx,dy in [(0,0),(1,0),(0,1),(1,1)]:keys.add((z,(ix+dx)//256,(iy+dy)//256))
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        tiles=dict(pool.map(fetch,keys))
    def value(x,y):
        r,g,b=tiles[(z,x//256,y//256)].getpixel((x%256,y%256))
        return r*256+g+b/256-32768
    values=[]
    for x,y,u,v in points:
        a=value(x,y)*(1-u)+value(x+1,y)*u
        b=value(x,y+1)*(1-u)+value(x+1,y+1)*u
        values.append(round(max(-32767,min(32767,a*(1-v)+b*v))))
    # Remove isolated positive spikes, retaining ridgelines supported by neighbours.
    clean=values.copy()
    for row in range(1,N-1):
        for col in range(1,N-1):
            i=row*N+col
            neighbours=sorted(values[(row+dy)*N+col+dx] for dy in [-1,0,1] for dx in [-1,0,1] if dx or dy)
            if values[i]>neighbours[-1]+80 and values[i]>neighbours[4]+150:clean[i]=neighbours[4]
    values=clean
    (OUT/f'{name}.bin').write_bytes(struct.pack('<'+'h'*len(values),*values))
    manifest[name]={'lat':lat,'lon':lon,'extentKm':extent,'size':N,'label':label,'minMetres':min(values),'maxMetres':max(values),'sourceZoom':z,'file':f'terrain/{name}.bin'}
    print(name,len(keys),'tiles',min(values),max(values),flush=True)
(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
