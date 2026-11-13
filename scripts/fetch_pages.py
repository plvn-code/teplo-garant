"""Download product + info pages of teplogarant.in.ua (Ukrainian) into research/pages/."""
import json, os, sys, time, urllib.request, urllib.parse
from concurrent.futures import ThreadPoolExecutor

ROOT = sys.argv[1] if len(sys.argv) > 1 else '.'
OUT = os.path.join(ROOT, 'research', 'pages')
os.makedirs(OUT, exist_ok=True)
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36'
sm = json.load(open(os.path.join(ROOT, 'research', 'sitemap.json'), encoding='utf-8'))
urls = list(sm['products'].keys())
urls += [u for u in sm['others'] if 'index.php' not in u]
urls += ['https://teplogarant.in.ua/contact-us/', 'https://teplogarant.in.ua/manufacturer/']

def slug(u):
    p = urllib.parse.unquote(urllib.parse.urlparse(u).path).strip('/') or 'home'
    return p.replace('/', '__')

def get(u):
    f = os.path.join(OUT, slug(u) + '.html')
    if os.path.exists(f) and os.path.getsize(f) > 5000:
        return 'cached'
    for attempt in range(3):
        try:
            req = urllib.request.Request(u, headers={'User-Agent': UA, 'Accept-Language': 'uk'})
            data = urllib.request.urlopen(req, timeout=40).read()
            open(f, 'wb').write(data)
            time.sleep(2.5)
            return 'ok'
        except Exception as e:
            err = e
            time.sleep(30)
    return f'fail {err}'

with ThreadPoolExecutor(1) as ex:
    res = list(ex.map(get, urls))
from collections import Counter
print(Counter(r.split()[0] for r in res))
for u, r in zip(urls, res):
    if r.startswith('fail'): print(u, r)
