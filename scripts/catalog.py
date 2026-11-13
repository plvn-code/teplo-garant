"""Build src/data/catalog.json + public/images/p/*.webp from research/products.json and originals/p.

Photos: packshots on white are trimmed to the object, re-centred on a pure-white square and upscaled with
Lanczos + a light unsharp mask; interior renders keep their framing and are only resized/sharpened.
Outputs per product: <id>-<n>.webp (gallery, up to 1400 px) and <id>-<n>s.webp for the first two (cards, 640 px).
Cached: an existing webp is not rebuilt (delete it to rebuild). Usage: catalog.py [root]
"""
import glob, html, json, os, re, sys
import numpy as np
from PIL import Image, ImageFilter, ImageOps

ROOT = sys.argv[1] if len(sys.argv) > 1 else '.'
OUT = os.path.join(ROOT, 'public', 'images', 'p')
os.makedirs(OUT, exist_ok=True)
P = json.load(open(os.path.join(ROOT, 'research', 'products.json'), encoding='utf-8'))
BLOG = json.load(open(os.path.join(ROOT, 'research', 'blog.json'), encoding='utf-8'))
_bt = os.path.join(ROOT, 'research', 'blog-text.json')  # article text, extracted in the browser (old site blocks scripted fetches)
BLOG_TEXT = json.load(open(_bt, encoding='utf-8')) if os.path.exists(_bt) else {}

SECTIONS = [
    # id, old slug, name, short, lead
    ('dyzainerski-radiatory', 'dizainerski-radiatori', 'Дизайнерські радіатори', 'Дизайн-радіатори',
     'Трубчасті, вертикальні й горизонтальні радіатори з Італії, Бельгії та Німеччини — тепло, яке стає частиною інтер’єру.'),
    ('stalevi-radiatory', 'stalevi-radiatori', 'Сталеві радіатори', 'Сталеві',
     'Панельні радіатори 11, 21, 22 і 33 типу з боковим або нижнім підключенням для квартир, будинків і офісів.'),
    ('elektrychni-radiatory', 'radiatori-elektrichni', 'Електричні радіатори', 'Електричні',
     'Дизайнерські електрорадіатори, яким не потрібна система опалення: повісили, підключили — тепло.'),
    ('dyzainerski-rushnykosushky', 'dizajnerskie-polotenczesushiteli', 'Дизайнерські рушникосушки', 'Дизайн-рушникосушки',
     'Водяні, електричні та комбіновані рушникосушки від Zehnder, IRSAP, Vasco і Terma.'),
    ('vodiani-rushnykosushky', 'rushnikosushki', 'Водяні рушникосушки', 'Водяні',
     'Драбинки з нержавіючої сталі та хрому з нижнім підключенням до системи опалення чи ГВП.'),
    ('elektrychni-rushnykosushky', 'rushnikosushki-elektrichni', 'Електричні рушникосушки', 'Електричні рушникосушки',
     'Сушать і гріють незалежно від сезону, багато моделей — з терморегулятором і таймером.'),
    ('teny', 'teny-dlya-polotenczesushitelej', 'ТЕНи для рушникосушок', 'ТЕНи',
     'Електричні ТЕНи, які перетворюють водяну рушникосушку на комбіновану.'),
    ('krany', 'krani', 'Крани та термоголовки', 'Крани',
     'Кутові, прямі й термостатичні крани, термоголовки та вузли нижнього підключення.'),
    ('trymachi', 'aksesuary', 'Тримачі для рушників', 'Тримачі',
     'Навісні тримачі для рушників на дизайнерські радіатори IRSAP.'),
]
SEC_BY_OLD = {s[1]: s for s in SECTIONS}

BRANDS = {
    # id: (name, country, line)
    'irsap': ('IRSAP', 'Італія', 'Tesi, Arpa, Sax, Ellipsis — ікони італійського дизайну'),
    'zehnder': ('Zehnder', 'Швейцарія · Німеччина', 'Charleston, Forma, Yucca, Zmart — 125 років тепла'),
    'vasco': ('Vasco', 'Бельгія', 'Скульптурні радіатори Viola, Tulipa, Zana, Bano'),
    'stelrad': ('Stelrad', 'Нідерланди', 'Офіційний дистриб’ютор: Compact, Novello, Vertex'),
    'thermic': ('Thermic', 'Бельгія', 'Електричні та водяні дизайн-радіатори'),
    'quinn': ('Quinn', 'Англія', 'Сталеві панельні Integrale і Quattro'),
    'purmo': ('Purmo', 'Фінляндія', 'Сталеві радіатори Ventil Compact і Finimetal'),
    'radson': ('Radson', 'Бельгія', 'Paros, Integra, E-Flow — бельгійська якість'),
    'terma': ('Terma', 'Польща', 'Рушникосушки й ТЕНи з терморегулятором'),
    'mario': ('Mario', 'Україна', 'Водяні рушникосушки з нержавіючої сталі'),
    'vario-term': ('Vario Term', 'Польща', 'Крани, термоголовки, ТЕНи'),
    'komex': ('Komex', 'Польща', 'Вузли підключення та крани'),
    'belrad': ('Belrad', 'Україна', 'Рушникосушки та комплектуючі'),
    'hybro': ('HYBRO Technologies', 'Україна', 'Електричні нагрівальні елементи'),
    'raftec': ('Raftec', 'Україна', 'Крани та комплекти підключення'),
    'instal-projekt': ('Instal Projekt', 'Польща', 'Дизайн-рушникосушки'),
}
BRAND_ALIASES = {'irsap': 'irsap', 'zehnder': 'zehnder', 'vasco': 'vasco', 'stelrad': 'stelrad', 'quinn': 'quinn',
                 'purmo group': 'purmo', 'purmo': 'purmo', 'radson': 'radson', 'terma': 'terma', 'mario': 'mario',
                 'vario term': 'vario-term', 'komex': 'komex', 'belrad': 'belrad', 'hybro technologies': 'hybro',
                 'raftec': 'raftec', 'instal projekt': 'instal-projekt', 'thermic': 'thermic'}

SUBS = {
    'dyzainerski-radiatory': [('vertykalni', 'Вертикальні'), ('horyzontalni', 'Горизонтальні')],
    'stalevi-radiatory': [('tip-11', '11 тип'), ('tip-21', '21 тип'), ('tip-22', '22 тип'), ('tip-33', '33 тип')],
    'dyzainerski-rushnykosushky': [('vodiani', 'Водяні'), ('elektrychni', 'Електричні'), ('kombinovani', 'Комбіновані')],
    'krany': [('termostatychni', 'Термостатичні'), ('termoholovky', 'Термоголовки'), ('pid-ten', 'Під ТЕН'), ('kutovi', 'Кутові'), ('priami', 'Прямі')],
}

COLOR_MAP = [('Білий', r'біл|white|9016|9010|ral ?9003'), ('Чорний', r'чорн|black|9005'),
             ('Графіт', r'графіт|graphit|anthrac|антрац|сір|titan|титан|9006'), ('Хром', r'хром|chrom|нерж|inox|сатин|satin|алюмін|steel'),
             ('Золото', r'золот|gold|латун')]


def spec(p, key):
    for g, k, v in p['specs']:
        if k == key:
            return [x.strip() for x in v.split(';') if x.strip()]
    return []


def norm_color(p):
    raw = ' '.join(spec(p, 'Колір')) or ''
    for hay in (raw, p['name']):
        h = hay.lower()
        for name, rx in COLOR_MAP:
            if re.search(rx, h):
                return name
    return None


def sub_of(sec, p):
    kinds = [x.lower() for x in spec(p, 'Види')]
    if sec == 'dyzainerski-radiatory':
        if 'вертикальні' in kinds or re.search(r'вертикал', p['name'], re.I):
            return 'vertykalni'
        if 'горизонтальні' in kinds or re.search(r'горизонтал', p['name'], re.I):
            return 'horyzontalni'
    if sec == 'stalevi-radiatory':
        t = (spec(p, 'Тип') or [''])[0]
        m = re.search(r'\b(11|21|22|33)\b', t) or re.search(r'\b(11|21|22|33)\s*тип', p['name'], re.I)
        return f'tip-{m.group(1)}' if m else None
    if sec == 'dyzainerski-rushnykosushky':
        if 'комбіновані' in kinds:
            return 'kombinovani'
        if 'електричні' in kinds or re.search(r'електр', p['name'], re.I):
            return 'elektrychni'
        return 'vodiani'
    if sec == 'krany':
        t = ' '.join(spec(p, 'Тип крана') + spec(p, 'Тип корпуса')).lower() + ' ' + p['name'].lower()
        if 'термоголов' in t:
            return 'termoholovky'
        if 'тен' in t.split() or 'під тен' in t:
            return 'pid-ten'
        if 'термостат' in t or 'терморегул' in t:
            return 'termostatychni'
        if 'кутов' in t:
            return 'kutovi'
        if 'прям' in t:
            return 'priami'
    return None


def ascii_slug(s):
    """Old OpenCart slugs sometimes contain a Cyrillic «і»; the new URLs are plain ASCII."""
    s = s.replace('і', 'i').replace('І', 'i').replace('ї', 'yi').replace('є', 'ye')
    return re.sub(r'[^a-z0-9-]+', '-', s.lower()).strip('-')


def clean_name(n):
    n = re.sub(r'\s+', ' ', n).strip()
    n = n.replace(' x ', '×').replace('х', 'х')
    n = re.sub(r'(\d)\s*[xхX×]\s*(\d)', r'\1×\2', n)
    n = re.sub(r'\s*Cod\.\s*\d+\s*$', '', n)
    return n


def dims(p):
    h = (spec(p, 'Висота') or [''])[0]
    w = (spec(p, 'Ширина') or [''])[0]
    h, w = re.sub(r'\D', '', h), re.sub(r'\D', '', w)
    if h and w:
        return f'{h}×{w}'
    m = re.search(r'(\d{3,4})\s*[×xх]\s*(\d{2,4})', p['name'])
    return f'{m.group(1)}×{m.group(2)}' if m else None


# ---------- images ----------
def load_rgb(f):
    im = Image.open(f)
    im = ImageOps.exif_transpose(im)
    if im.mode in ('P', 'LA', 'RGBA') or 'transparency' in im.info:
        im = im.convert('RGBA')
        bg = Image.new('RGB', im.size, (255, 255, 255))
        bg.paste(im, mask=im.split()[3])
        return bg
    return im.convert('RGB')


def is_packshot(a):
    """Frame mostly (near) white → studio packshot."""
    h, w, _ = a.shape
    b = max(2, min(h, w) // 40)
    frame = np.concatenate([a[:b].reshape(-1, 3), a[-b:].reshape(-1, 3), a[:, :b].reshape(-1, 3), a[:, -b:].reshape(-1, 3)])
    return (frame.min(axis=1) > 236).mean() > 0.9


def build(src, dst_big, dst_small):
    im = load_rgb(src)
    a = np.asarray(im)
    pack = is_packshot(a)
    if pack:
        mask = a.min(axis=2) < 238
        ys, xs = np.where(mask)
        if len(xs):
            x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
            im = im.crop((x0, y0, x1, y1))
        w, h = im.size
        side = int(max(w, h) / 0.84)
        target = 1400
        scale = target / side
        im = im.resize((max(1, round(w * scale)), max(1, round(h * scale))), Image.LANCZOS)
        im = im.filter(ImageFilter.UnsharpMask(radius=1.4, percent=70, threshold=2))
        canvas = Image.new('RGB', (target, target), (255, 255, 255))
        canvas.paste(im, ((target - im.width) // 2, (target - im.height) // 2))
        arr = np.asarray(canvas).copy()
        arr[arr.min(axis=2) > 246] = 255  # clean paper-white background
        im = Image.fromarray(arr)
    else:
        w, h = im.size
        scale = min(1200 / max(w, h), 2.0)
        if scale != 1:
            im = im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
        im = im.filter(ImageFilter.UnsharpMask(radius=1.2, percent=55, threshold=3))
    if not os.path.exists(dst_big):
        im.save(dst_big, "WEBP", quality=(84 if pack else 74), method=6)
    if dst_small and not os.path.exists(dst_small):
        s = im.copy()
        s.thumbnail((640, 640), Image.LANCZOS)
        s.save(dst_small, 'WEBP', quality=80, method=6)
    return ('w' if pack else 'p'), round(im.width / im.height, 3)


meta_path = os.path.join(ROOT, 'research', 'image-meta.json')
meta = json.load(open(meta_path)) if os.path.exists(meta_path) else {}

products = []
for p in P:
    sec = SEC_BY_OLD.get(p['crumb_urls'][0].rstrip('/').rsplit('/', 1)[-1]) if p.get('crumb_urls') else None
    if not sec or not p.get('price'):
        continue
    sid = sec[0]
    bkey = (p.get('brand') or '').strip().lower()
    bid = BRAND_ALIASES.get(bkey)
    if not bid:
        low = p['name'].lower()
        bid = next((v for k, v in BRAND_ALIASES.items() if k in low), None)
    imgs = []
    for i in range(min(4, len(p["images"]))):
        src = (glob.glob(os.path.join(ROOT, 'originals', 'p', f"{p['id']}-{i}.*")) or [None])[0]
        key = f"{p['id']}-{i}"
        big = os.path.join(OUT, f'{key}.webp')
        small = os.path.join(OUT, f'{key}s.webp') if i < 2 else None
        if key in meta and os.path.exists(big) and (not small or os.path.exists(small)):
            imgs.append(meta[key]); continue
        if not src:
            continue
        try:
            kind, ar = build(src, big, small)
        except Exception as e:
            print('img fail', src, e); continue
        meta[key] = [kind, ar]
        imgs.append(meta[key])
    specs = [[k, v.replace(' ;', ';')] for g, k, v in p['specs'] if k not in ('Виробник',)]
    variants = []
    for g in p.get('variants', []):
        opts = [{'v': o['v'], 's': o['slug'], 'on': o['active']} for o in g['opts']]
        variants.append({'t': g['title'], 'o': opts})
    power = (spec(p, 'Тепловіддача') or spec(p, 'Потужність') or [None])[0]
    con = (spec(p, 'Підключення') or [None])[0]
    con = con if con in ('Нижнє', 'Бічне') else None
    products.append({
        'id': int(p['id']), 'slug': ascii_slug(p['slug']), 'oldSlug': p['slug'], 'name': clean_name(p['name']), 'price': p['price'], 'old': p['old'] if p['old'] and p['old'] > p['price'] else None,
        'section': sid, 'sub': sub_of(sid, p), 'brand': bid, 'stock': p.get('availability') == 'InStock',
        'color': norm_color(p), 'con': con, 'country': (spec(p, 'Країна виробник') or [None])[0],
        'dims': dims(p), 'power': power, 'area': p.get('area'), 'warranty': (spec(p, 'Гарантія') or [None])[0],
        'imgs': imgs, 'specs': specs, 'variants': variants, 'desc': [[b['t'], b['x']] for b in p['desc']],
        'video': p.get('video'), 'reviews': [{**r, 't': html.unescape(r['t']).replace('\xa0', ' ').strip()} for r in p.get('reviews', [])], 'rating': p.get('rating'),
        'popular': 'Популярний' in (p.get('stickers') or []), 'code': p.get('code'),
    })
json.dump(meta, open(meta_path, 'w'))

old2new = {x['oldSlug']: x['slug'] for x in products}
for x in products:
    for g in x['variants']:
        for o in g['o']:
            o['s'] = old2new.get(o['s'], o['s'])
slugs = {x['slug'] for x in products}
for x in products:  # keep only variant links that exist in the new catalogue
    x['variants'] = [g for g in ({'t': g['t'], 'o': [o for o in g['o'] if o['s'] in slugs]} for g in x['variants']) if len(g['o']) > 1]

sections = []
for sid, old, name, short, lead in SECTIONS:
    items = [x for x in products if x['section'] == sid]
    subs = [{'id': i, 'name': n, 'count': sum(1 for x in items if x['sub'] == i)} for i, n in SUBS.get(sid, [])]
    sections.append({'id': sid, 'old': old, 'name': name, 'short': short, 'lead': lead, 'count': len(items), 'subs': [s for s in subs if s['count']]})

brands = []
for bid, (name, country, line) in BRANDS.items():
    n = sum(1 for x in products if x['brand'] == bid)
    if n:
        brands.append({'id': bid, 'name': name, 'country': country, 'line': line, 'count': n})
brands.sort(key=lambda b: -b['count'])

# ---------- blog ----------
BOUT = os.path.join(ROOT, 'public', 'images', 'blog')
os.makedirs(BOUT, exist_ok=True)
blog = []
for b in BLOG:
    slug = b['slug'].split('__')[-1]
    cover = None
    src = (glob.glob(os.path.join(ROOT, 'originals', 'blog', f'{slug}.*')) or [None])[0]
    dst = os.path.join(BOUT, f'{slug}.webp')
    if src and not os.path.exists(dst):
        im = load_rgb(src)
        im.thumbnail((1400, 1400), Image.LANCZOS)
        im.save(dst, 'WEBP', quality=80, method=6)
    if os.path.exists(dst):
        cover = True
    desc = [list(x) for x in BLOG_TEXT.get(slug, [])] or [[d['t'], d['x']] for d in b['desc'] if len(d['x']) > 1]
    if desc and desc[0][1].rstrip(':').lower() in ('зміст', 'содержание'):  # drop the table of contents
        desc = desc[1:]
        while desc and desc[0][0] == 'li':
            desc = desc[1:]
    words = sum(len(d[1].split()) for d in desc)
    blog.append({'slug': slug, 'old': b['slug'], 'title': b['name'], 'cover': bool(cover), 'mins': max(2, round(words / 180)), 'desc': desc})

data = {'products': products, 'sections': sections, 'brands': brands, 'blog': blog}
os.makedirs(os.path.join(ROOT, 'src', 'data'), exist_ok=True)
json.dump(data, open(os.path.join(ROOT, 'src', 'data', 'catalog.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
from collections import Counter
print(len(products), 'products;', [(s['id'], s['count'], [(x['id'], x['count']) for x in s['subs']]) for s in sections])
print('brands', [(b['id'], b['count']) for b in brands], 'no brand', sum(1 for x in products if not x['brand']))
print('colors', Counter(x['color'] for x in products), 'imgs', Counter(len(x['imgs']) for x in products))
print('kinds', Counter(i[0] for x in products for i in x['imgs']), 'blog', len(blog))
