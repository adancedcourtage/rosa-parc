import json,os,io,subprocess,concurrent.futures as cf
from PIL import Image, ImageDraw, ImageChops
OUT=os.path.expanduser('~/Desktop/rosa-parc/src/assets/produits')
UA='Mozilla/5.0 (Macintosh) Chrome/126.0'
imgs=json.load(open('images.json'))
def fetch(u):
    sep='&' if '?' in u else '?'
    r=subprocess.run(['curl','-sL','-m','40','-A',UA,u+sep+'width=900'],capture_output=True)
    return Image.open(io.BytesIO(r.stdout))
def flatten(im):
    if im.mode in ('RGBA','LA','P'):
        im=im.convert('RGBA'); bg=Image.new('RGBA',im.size,(255,255,255,255)); bg.alpha_composite(im); return im, bg.convert('RGB'), True
    return im, im.convert('RGB'), False
def bright(im):
    W,H=im.size; px=[im.getpixel(c) for c in [(2,2),(W-3,2),(2,H-3),(W-3,H-3)]]
    return min(sum(p)/3 for p in px)
def process(slug):
    dst=f'{OUT}/{slug}.webp'
    if os.path.exists(dst): return slug,'skip'
    chosen=None
    for u in imgs[slug][:3]:
        try:
            raw,im,alpha=flatten(fetch(u))
        except Exception: continue
        if chosen is None: chosen=im
        if alpha or bright(im)>=215: chosen=im; break
    if chosen is None: return slug,'fail'
    im=chosen; W,H=im.size
    if bright(im)>=200:
        for c in [(0,0),(W-1,0),(0,H-1),(W-1,H-1)]: ImageDraw.floodfill(im,c,(255,255,255),thresh=16)
        diff=ImageChops.difference(im,Image.new('RGB',im.size,(255,255,255))).convert('L').point(lambda v:255 if v>10 else 0)
        box=diff.getbbox()
        if box: im=im.crop(box)
        pad=int(max(im.size)*0.08)
        cv=Image.new('RGB',(im.width+2*pad,im.height+2*pad),(255,255,255)); cv.paste(im,(pad,pad)); im=cv
        status='ok'
    else: status='dark'
    im.thumbnail((800,800),Image.LANCZOS)
    im.save(dst,'WEBP',quality=78,method=5)
    return slug,status
res={}
with cf.ThreadPoolExecutor(16) as ex:
    for n,(slug,st) in enumerate(ex.map(process,list(imgs))):
        res[slug]=st
        if n%100==0: print(n,flush=True)
json.dump(res,open('images_status.json','w'))
from collections import Counter; print(Counter(res.values()))
