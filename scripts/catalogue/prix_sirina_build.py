import json, statistics, collections, sys
S, OUT = sys.argv[1], sys.argv[2]
ours = json.load(open(f"{S}/ours_full.json")); pr = {int(k): v for k, v in json.load(open(f"{S}/prix.json")).items()}
ratios = collections.defaultdict(list)
for o in ours:
    if o["id"] in pr: ratios[(o["brand"], o["category"])].append(pr[o["id"]]["price"] / o["price"])
glob = statistics.median(r for v in ratios.values() for r in v)
def factor(b, c):
    r = ratios.get((b, c), [])
    if len(r) < 4: r = [x for (bb, _), v in ratios.items() if bb == b for x in v]
    return max(0.45, min(1.3, statistics.median(r) if len(r) >= 4 else glob))
out = {}
for o in ours:
    if o["id"] in pr:
        v = pr[o["id"]]
        out[o["id"]] = {"price": v["price"], "oldPrice": v.get("oldPrice"), "source": v["url"], "gender": v.get("gender")}
    else:
        out[o["id"]] = {"price": max(29, round(o["price"] * factor(o["brand"], o["category"]) / 10) * 10 - 1), "estimate": True}
json.dump({str(k): {kk: vv for kk, vv in v.items() if vv is not None} for k, v in sorted(out.items())}, open(OUT, "w"), ensure_ascii=False, separators=(",", ":"))
print(len(out), "dont relevés:", sum(1 for v in out.values() if "source" in v), "genres corrigés:", sum(1 for o in ours if o["id"] in pr and pr[o["id"]].get("gender") and pr[o["id"]]["gender"] != o["gender"]))
