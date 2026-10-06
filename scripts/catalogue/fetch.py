import json,subprocess,sys
UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126.0 Safari/537.36'
STORES=['lattafa-usa.com','armaf.com','afnan.com','frenchavenue.com','zimayaperfumes.com','rayhaanperfumes.com','maisonasrar.com','geparlys.com','parisbleu.fr','parisbleu.com','franckolivier.fr','us.ruebrocaparfums.com','maisonalhambra-usa.com','beautyhouse.com']
def get(u):
    r=subprocess.run(['curl','-sL','-m','40','-A',UA,u],capture_output=True,text=True)
    return r.stdout
for st in (sys.argv[1:] or STORES):
    allp=[]
    for page in range(1,80):
        try: ps=json.loads(get(f'https://{st}/products.json?limit=250&page={page}')).get('products',[])
        except Exception as e: print(st,'page',page,'ERR',e); break
        if not ps: break
        allp+=ps
    try: cur=json.loads(get(f'https://{st}/cart.js')).get('currency')
    except Exception: cur=None
    json.dump({'store':st,'currency':cur,'products':allp},open(f'{st}.json','w'))
    print(st,len(allp),cur,flush=True)
