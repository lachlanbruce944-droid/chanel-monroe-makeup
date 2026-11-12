import csv, json, os
H = os.path.dirname(os.path.abspath(__file__))
meta = json.load(open(os.path.join(H, 'meta.json'), encoding='utf-8'))
done = {r['post_url'].rstrip('/').split('/')[-1] for r in csv.DictReader(open(r'M:\CMM-Site\final-draft\images\lessons\lessons.csv', encoding='utf-8-sig'))}
rp = os.path.join(H, 'rejected.json')
rej = set(json.load(open(rp))) if os.path.exists(rp) else set()
rej |= {c for c in meta if c not in done}
json.dump(sorted(rej), open(rp, 'w'), indent=0)
print(len(rej), 'reviewed and not used')
