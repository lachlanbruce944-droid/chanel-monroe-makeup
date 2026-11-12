import json, os
R2 = os.path.dirname(os.path.abspath(__file__))
order = json.load(open(os.path.join(R2, 'clip_order.json')))
cand = json.load(open(os.path.join(R2, 'candidates.json')))
picked = {p['code'] for p in json.load(open(os.path.join(R2, 'picked.json')))}
TEXT = [2, 6, 11, 15, 17, 18, 23, 26, 28, 29, 38, 41, 43, 45, 49, 50, 56, 57, 58]
out = {order[i]: 'text overlay or caption' for i in TEXT}
out[order[3]] = 'CapCut watermark'; out[order[8]] = 'product close-ups only'; out[order[52]] = 'cartoon character sticker'
for c in (cand if isinstance(cand, list) else cand.values()):
    k = c['code'] if isinstance(c, dict) else c
    if k not in picked: out.setdefault(k, 'cover review: not a fit')
p = r'M:\CMM-Site\final-draft\data\rejected.json'
old = json.load(open(p, encoding='utf-8')) if os.path.exists(p) else {}
old.update(out)
json.dump(old, open(p, 'w', encoding='utf-8'), indent=0)
print(len(old), 'rejected codes')
