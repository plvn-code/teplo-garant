"""Parse research/pages/*.html (old OpenCart product pages) → research/products.json."""
import html, json, os, re, sys, urllib.parse

ROOT = sys.argv[1] if len(sys.argv) > 1 else '.'
PAGES = os.path.join(ROOT, 'research', 'pages')
sm = json.load(open(os.path.join(ROOT, 'research', 'sitemap.json'), encoding='utf-8'))

def slug_of(u):
    return urllib.parse.unquote(urllib.parse.urlparse(u).path).strip('/').replace('/', '__')

def text(s):
    s = re.sub(r'<br\s*/?>', '\n', s)
    s = re.sub(r'<[^>]+>', '', s)
    s = html.unescape(s).replace('\xa0', ' ')
    return re.sub(r'[ \t]+', ' ', s).strip()

def money(s):
    s = re.sub(r'[^\d]', '', s or '')
    return int(s) if s else None

def original(u):
    # .../image/cache/catalog/X/name-1000x1000-product_popup.jpg -> .../image/catalog/X/name.jpg
    m = re.match(r'(https://teplogarant\.in\.ua/image/)cache/(catalog/.+?)-\d+x\d+(?:-[a-z_]+)?(\.\w+)$', u)
    return m.group(1) + m.group(2) + m.group(3) if m else u

def desc_blocks(h):
    h = re.sub(r'<div class="us-video">.*?</button>\s*</div>', '', h, flags=re.S)
    h = re.sub(r'<(script|style|iframe)[^>]*>.*?</\1>', '', h, flags=re.S)
    h = re.sub(r'<img[^>]*>', '', h)
    out = []
    for m in re.finditer(r'<(h[1-6]|p|li|div)[^>]*>(.*?)</\1>', h, flags=re.S):
        tag, inner = m.group(1), m.group(2)
        if re.search(r'<(p|div|li|h\d)\b', inner):
            continue
        t = text(inner)
        if not t or len(t) < 2:
            continue
        kind = 'h' if tag.startswith('h') else ('li' if tag == 'li' else 'p')
        if kind == 'p' and len(t) < 90 and t.endswith(':'):
            kind = 'h'
        for line in [x.strip() for x in t.split('\n') if x.strip()]:
            if line.startswith('•'):
                out.append({'t': 'li', 'x': line.lstrip('• ').strip()})
            else:
                out.append({'t': kind, 'x': line})
    if not out:
        t = text(h)
        out = [{'t': 'p', 'x': x.strip()} for x in t.split('\n') if x.strip()]
    # dedupe consecutive
    res = []
    for b in out:
        if not res or res[-1] != b:
            res.append(b)
    return res

products = []
for url, sm_img in sm['products'].items():
    f = os.path.join(PAGES, slug_of(url) + '.html')
    if not os.path.exists(f):
        continue
    s = open(f, encoding='utf-8').read()
    s = re.sub(r'<style.*?</style>', '', s, flags=re.S)
    p = {'url': url, 'slug': slug_of(url)}
    lds = re.findall(r'<script type="application/ld\+json">(.*?)</script>', s, re.S)
    prod = None
    for ld in lds:
        try:
            j = json.loads(ld)
        except Exception:
            try:
                j = json.loads(re.sub(r',\s*([}\]])', r'\1', ld))
            except Exception:
                continue
        if isinstance(j, dict) and j.get('@type') == 'Product':
            prod = j
        if isinstance(j, dict) and j.get('@type') == 'BreadcrumbList':
            p['crumbs'] = [html.unescape(i['item']['name']) for i in j['itemListElement']][:-1]
            p['crumb_urls'] = [i['item']['@id'] for i in j['itemListElement']][:-1]
    h1 = re.search(r'<h1[^>]*>(.*?)</h1>', s, re.S)
    p['name'] = text(h1.group(1)) if h1 else (prod or {}).get('name')
    p['id'] = (prod or {}).get('productID') or (re.search(r"cart\.add\('(\d+)'", s) or [None, None])[1]
    m = re.search(r'Код товару:\s*<span[^>]*>(.*?)</span>', s)
    p['code'] = text(m.group(1)) if m else (prod or {}).get('model')
    m = re.search(r'us-product-info-item-manufacturer">.*?<a[^>]*>(.*?)</a>', s, re.S)
    p['brand'] = text(m.group(1)) if m else (prod or {}).get('brand')
    m = re.search(r'us-product-info-item-stock">Наявність:\s*<span[^>]*>(.*?)</span>', s, re.S)
    p['stock'] = text(m.group(1)) if m else None
    # prices: main block
    blk = re.search(r'<div class="us-price-block[^"]*"[^>]*>(.*?)</div>\s*(?:<div class="us-product-one-click|<div class="us-product-cart|<div class="row)', s, re.S)
    b = blk.group(1) if blk else ''
    new = re.search(r'us-price-new[^>]*>(.*?)<', b)
    old = re.search(r'us-price-old[^>]*>(.*?)<', b)
    act = re.search(r'us-price-actual[^>]*>(.*?)<', b)
    if new:
        p['price'] = money(new.group(1)); p['old'] = money(old.group(1)) if old else None
    else:
        p['price'] = money(act.group(1)) if act else None; p['old'] = None
    if not p['price']:
        mm = re.search(r'rm-product-mobile-fixed-price[^>]*>\s*(.*?)</div>', s, re.S)
        if mm:
            vals = [money(x) for x in re.findall(r'>([\d\s]+грн)', mm.group(1))]
            vals = [v for v in vals if v]
            if vals:
                p['price'] = min(vals); p['old'] = max(vals) if len(vals) > 1 else None
    # stickers
    st = re.search(r'us-product-stickers[^"]*">(.*?)</div>\s*</div>', s, re.S)
    p['stickers'] = [text(x) for x in re.findall(r'us-product-stickers-item[^>]*>(.*?)</div>', st.group(1), re.S)] if st else []
    # gallery
    main = re.search(r'us-product-photo-main(.*?)us-product-right', s, re.S)
    gal = re.findall(r'href="(https://teplogarant\.in\.ua/image/cache/[^"]+)" class="oct-gallery"', main.group(1) if main else s)
    p['images'] = list(dict.fromkeys(original(g) for g in gal)) or [original(sm_img)]
    # specs
    at = re.search(r'id="us-product-attributes"(.*?)(?:id="us-product-page-reviews"|us-related)', s, re.S)
    specs = []
    if at:
        for grp in re.split(r'<div class="us-product-attributes-title">', at.group(1))[1:]:
            gname = text(grp.split('</div>', 1)[0])
            for k, v in re.findall(r'us-product-attr-item[^>]*>\s*<span>(.*?)</span>\s*<span>(.*?)</span>', grp, re.S):
                specs.append([gname, text(k).rstrip(':').strip(), text(v).replace(' ;', ';')])
    p['specs'] = specs
    m = re.search(r'Площа обігріву:\s*<span>(.*?)</span>', s)
    p['area'] = text(m.group(1)) if m else None
    # variants
    var = []
    for g in re.findall(r'<div class="hpm-group[^>]*>(.*?)<div class="hpm-clearfix">', s, re.S):
        title = text(re.search(r'hpm-title">(.*?)</div>', g, re.S).group(1))
        opts = []
        for a in re.finditer(r'(?:<a href="([^"]+)">\s*)?<div class="hpm-item( active)?">\s*<div class="hcol-filter">(.*?)</div>', g, re.S):
            opts.append({'v': text(a.group(3)), 'slug': slug_of(a.group(1)) if a.group(1) else p['slug'], 'active': bool(a.group(2))})
        var.append({'title': title, 'opts': opts})
    p['variants'] = var
    # description
    d = re.search(r'<div class="us-product-description-cont">(.*?)</div>\s*</div>\s*</div>\s*(?:<div id="us-product-attributes"|<div class="us-product-attributes)', s, re.S)
    if not d:
        d = re.search(r'<div class="us-product-description-cont">(.*?)id="us-product-attributes"', s, re.S)
    p['desc'] = desc_blocks(d.group(1)) if d else []
    yt = re.search(r'youtu(?:\.be/|be\.com/(?:watch\?v=|embed/))([\w-]{11})', d.group(1) if d else '')
    p['video'] = yt.group(1) if yt else None
    # reviews + rating
    if prod:
        p['reviews'] = [{'n': html.unescape(r['author']['name']), 'd': r.get('datePublished'), 't': html.unescape(r.get('description', '')).strip(), 'r': int(r['reviewRating']['ratingValue'])} for r in prod.get('review', []) or []]
        ar = prod.get('aggregateRating') or {}
        p['rating'] = float(ar['ratingValue']) if ar.get('ratingValue') else None
        p['availability'] = (prod.get('offers') or {}).get('availability', '').rsplit('/', 1)[-1]
    else:
        p['reviews'] = []; p['rating'] = None; p['availability'] = None
    # related
    rel = re.search(r'id="us-related-products-row"(.*?)</section>|id="us-related-products-row"(.*)', s, re.S)
    rr = rel.group(1) or rel.group(2) if rel else ''
    p['related'] = list(dict.fromkeys(slug_of(u) for u in re.findall(r'us-module-title">\s*<a[^>]*href="([^"]+)"', rr)))[:12]
    products.append(p)

json.dump(products, open(os.path.join(ROOT, 'research', 'products.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(products), 'products')
from collections import Counter
print(Counter(tuple(p.get('crumbs') or []) for p in products).most_common(30))
print(Counter(p['brand'] for p in products).most_common())
print(Counter(p['stock'] for p in products))
print('no price', sum(1 for p in products if not p['price']), 'sale', sum(1 for p in products if p['old']))
print('no desc', sum(1 for p in products if not p['desc']), 'imgs', sum(len(p['images']) for p in products))
