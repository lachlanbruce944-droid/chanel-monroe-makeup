"""Keep the Lessons tab at 60: drop near-duplicates (files moved to M:\\CMM-Site\\_removed\\lessons, codes logged as rejected)."""
import csv, json, os, shutil
L = r'M:\CMM-Site\final-draft\images\lessons'; BIN = r'M:\CMM-Site\_removed\lessons'; os.makedirs(BIN, exist_ok=True)
DROP = {'5-minute makeup', 'Healed lips, before and after', 'Colour combos to try', 'A long-wear base, step by step', 'Warm or cool? The drape test'}
p = os.path.join(L, 'lessons.csv'); rows = list(csv.DictReader(open(p, encoding='utf-8-sig', newline='')))
keep = [r for r in rows if r['title'] not in DROP]
for r in rows:
    if r['title'] in DROP:
        for f in (r['file'], r['poster']):
            if os.path.exists(os.path.join(L, f)): shutil.move(os.path.join(L, f), os.path.join(BIN, f))
rp = r'M:\CMM-Site\CMM-Lessons\rejected.json'; rej = set(json.load(open(rp)))
rej |= {r['post_url'].rstrip('/').split('/')[-1] for r in rows if r['title'] in DROP}; json.dump(sorted(rej), open(rp, 'w'), indent=0)
with open(p, 'w', encoding='utf-8', newline='') as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0].keys()), quoting=csv.QUOTE_ALL); w.writeheader(); w.writerows(keep)
print(len(rows), '->', len(keep))
