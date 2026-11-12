"""Pull the main on-page SEO from Gold Coast makeup-artist websites into seo/competitors.json + a readable report."""
import json, re, urllib.request, html, os
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36', 'Accept-Language': 'en-AU,en;q=0.9'}
CANDS = {
 'Natalie Lucas Makeup': ['natalielucasmakeup.com.au', 'natalielucasmakeup.com', 'natalielucas.com.au'],
 'Tamika Draper Hair and Makeup': ['tamikadraper.com.au', 'tamikadraper.com', 'tamikadraperhairandmakeup.com.au'],
 'The Makeup Hut': ['themakeuphut.com.au'],
 'Inspired Artistry': ['inspiredartistry.com.au'],
 'Lucia Face Art': ['luciafaceart.com.au', 'luciafaceart.com'],
 'Glam by Anna Borg': ['glambyannaborg.com.au', 'glambyannaborg.com'],
 'Danazmakeup': ['danazmakeup.com', 'danazmakeup.com.au'],
 'Lara Quinn Makeup': ['laraquinnmakeup.com.au', 'laraquinnmakeup.com', 'laraquinn.com.au'],
 'Danielle Matthews Makeup': ['daniellematthewsmakeup.com.au', 'daniellematthewsmakeupartist.com.au', 'daniellematthews.com.au'],
 'Shikarni Jane': ['shikarnijane.com.au', 'shikarnijane.com'],
 'Madame Minx': ['madameminx.com.au'],
 'Beauty Magic': ['beautymagic100.com'],
 'Dianolla MUA': ['dianollamua.com.au', 'dianolla.com.au'],
 'Goddess Makeup Design': ['goddessmakeupdesign.com.au', 'goddessmakeupdesign.com'],
}
def grab(dom):
    last = ''
    for u in ('https://www.' + dom, 'https://' + dom):
        try:
            r = urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=20)
            return r.geturl(), r.read().decode('utf-8', 'ignore')
        except Exception as e: last = str(e)[:60]
    return None, last
def tx(s): return html.unescape(re.sub(r'<[^>]+>', ' ', s or '')).strip()
def meta(p, n):
    m = re.search(r'<meta[^>]+(?:name|property)=["\']%s["\'][^>]*content=["\']([^"\']*)' % n, p, re.I) or re.search(r'<meta[^>]+content=["\']([^"\']*)["\'][^>]+(?:name|property)=["\']%s["\']' % n, p, re.I)
    return html.unescape(m.group(1)).strip() if m else ''
out = []
for name, doms in CANDS.items():
    for d in doms:
        url, page = grab(d)
        if url:
            body = re.sub(r'(?is)<(script|style|noscript)[^>]*>.*?</\1>', ' ', page)
            words = re.findall(r"[A-Za-z']+", tx(body))
            schema = sorted(set(re.findall(r'"@type"\s*:\s*"([A-Za-z]+)"', page)))
            low = ' '.join(words).lower()
            kw = {k: low.count(k) for k in ['makeup artist', 'gold coast', 'bridal', 'wedding', 'mobile', 'formal', 'hair', 'airbrush', 'broadbeach', 'burleigh', 'surfers paradise', 'robina', 'tweed', 'brisbane', 'byron']}
            t = re.search(r'(?is)<title[^>]*>(.*?)</title>', page)
            out.append({'name': name, 'url': url, 'title': tx(t.group(1)) if t else '',
                        'description': meta(page, 'description'), 'og_title': meta(page, 'og:title'),
                        'h1': [tx(h)[:90] for h in re.findall(r'(?is)<h1[^>]*>(.*?)</h1>', page)][:3],
                        'h2': [tx(h)[:70] for h in re.findall(r'(?is)<h2[^>]*>(.*?)</h2>', page)][:8],
                        'schema': schema, 'words': len(words), 'keyword_counts': kw,
                        'platform': next((p for p, s in [('Squarespace', 'squarespace'), ('Wix', 'wix.com'), ('WordPress', 'wp-content'), ('Shopify', 'cdn.shopify'), ('Showit', 'showit')] if s in page), '?')})
            break
    else:
        out.append({'name': name, 'url': None, 'error': 'no site found at ' + ', '.join(doms)})
json.dump(out, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'competitors.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
for o in out:
    if not o.get('url'): print('--', o['name'], 'NOT FOUND'); continue
    print('==', o['name'], o['url'], '|', o['platform'], '| words', o['words'], '| schema', ','.join(o['schema']))
    print('   TITLE:', o['title'][:110]); print('   DESC :', o['description'][:170]); print('   H1   :', ' / '.join(o['h1'])[:150]); print('   H2   :', ' / '.join(o['h2'])[:200])
    print('   KW   :', ' '.join('%s=%d' % (k, v) for k, v in o['keyword_counts'].items() if v))
