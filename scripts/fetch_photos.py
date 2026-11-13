"""Download product photos (originals, max 5 per product) → originals/p/<id>-<n>.<ext>. Skips files already on disk."""
import json, os, sys, time, urllib.request, urllib.parse
from concurrent.futures import ThreadPoolExecutor

ROOT = sys.argv[1] if len(sys.argv) > 1 else '.'
OUT = os.path.join(ROOT, 'originals', 'p')
os.makedirs(OUT, exist_ok=True)
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36'
P = json.load(open(os.path.join(ROOT, 'research', 'products.json'), encoding='utf-8'))
have = {f.rsplit('.', 1)[0] for f in os.listdir(OUT)}
jobs = []
for p in P:
    for i, u in enumerate(p['images'][:5]):
        if f"{p['id']}-{i}" in have:
            continue
        ext = os.path.splitext(urllib.parse.urlparse(u).path)[1].lower() or '.jpg'
        jobs.append((u, os.path.join(OUT, f"{p['id']}-{i}{ext}")))

def fetch(job):
    u, f = job
    q = urllib.parse.quote(u, safe=':/%')
    for _ in range(3):
        try:
            data = urllib.request.urlopen(urllib.request.Request(q, headers={'User-Agent': UA}), timeout=60).read()
            open(f, 'wb').write(data)
            time.sleep(0.4)
            return 'ok'
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return 'missing'
            time.sleep(8)
        except Exception:
            time.sleep(4)
    return 'fail'

print(len(jobs), 'to fetch')
with ThreadPoolExecutor(2) as ex:
    res = list(ex.map(fetch, jobs))
from collections import Counter
print(Counter(res))
