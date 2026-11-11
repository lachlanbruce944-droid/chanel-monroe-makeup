"""For brands not found on Adore Beauty, try the brand's own Shopify store (/products.json). Writes data/brand-shopify-raw.json."""
import json, os, time, urllib.request
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36', 'Accept': 'application/json'}
SITES = {'Adorn Cosmetics': 'adorncosmetics.com.au', 'Bloom Cosmetics': 'bloomcosmetics.com', 'Bali Body': 'au.balibodyco.com', 'Natio': 'www.natio.com.au',
 'Ere Perez': 'ereperez.com', 'Frank Body': 'frankbody.com', 'Go-To Skincare': 'gotoskincare.com', 'Fenty Beauty': 'fentybeauty.com', 'Rare Beauty': 'www.rarebeauty.com',
 'Danessa Myricks Beauty': 'danessamyricksbeauty.com', 'Mehron': 'www.mehron.com', 'Ben Nye': 'www.bennye.com', 'Fusion Body Art': 'fusionbodyart.com', 'MooGoo': 'moogoo.com.au',
 'Issada': 'www.issada.com', 'Skin O2': 'www.skino2.com.au', 'Roccoco Botanicals': 'roccoco.com', 'Cannabella': 'cannabella.com.au', 'Cedar & Stone': 'cedarandstone.com.au',
 "Oil 'o' Eve": 'oiloeve.com', 'Garbo & Kelly': 'garboandkelly.com', 'Makeup Cartel': 'makeupcartel.com.au', 'Clean Beauty Market': 'cleanbeautymarket.com.au',
 'Lash & Brow Professional': 'www.lashandbrow.com.au', 'Lust Minerals': 'lustminerals.com.au', 'Noosa Naturals': 'noosanaturals.com.au', 'Charlotte Tilbury': 'www.charlottetilbury.com',
 'Laura Mercier': 'www.lauramercier.com', 'NARS': 'www.narscosmetics.com', 'MECCA Cosmetica': 'www.mecca.com', 'Eye of Horus': 'eyeofhoruscosmetics.com', 'Kryolan': 'global.kryolan.com'}
skip = set(json.load(open(os.path.join(ROOT, 'data', 'brand-adore-raw.json'), encoding='utf-8')).keys()) if False else set()
res = {}
for name, dom in SITES.items():
    try:
        j = json.loads(urllib.request.urlopen(urllib.request.Request('https://%s/products.json?limit=60' % dom, headers=UA), timeout=25).read())
        items = []
        for p in j.get('products', []):
            if not p.get('images'): continue
            if any(w in (p.get('title', '') + ' ' + p.get('product_type', '')).lower() for w in ['gift card', 'sample', 'tester', 'bundle', 'merch', 'tote']): continue
            items.append({'name': p['title'], 'url': 'https://%s/products/%s' % (dom, p['handle']), 'img': p['images'][0]['src'].split('?')[0]})
        res[name] = {'src': dom, 'items': items[:14]}; print('OK ', name, len(items))
    except Exception as e:
        res[name] = None; print('ERR', name, str(e)[:60])
    time.sleep(1)
json.dump(res, open(os.path.join(ROOT, 'data', 'brand-shopify-raw.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
