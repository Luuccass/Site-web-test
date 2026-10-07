"""One-off import of the owner's wine list (docs/content/owner-input-2026-10-06.md) into content/wines.json.

After this import, content/wines.json is the source of truth: edit it directly.
"""
import json
import re
import sys

src, dst = sys.argv[1:3]
text = open(src, encoding="utf-8").read()

by_glass = []
glass = re.search(r"## Vins au verre ou en pot.*?\n(.*?)\n## ", text, re.S).group(1)
for line in glass.splitlines():
    m = re.match(r"- (BLANC|ROUGE|ROSÉ) – (.+?) — (.+)$", line.strip())
    if not m:
        continue
    colour = {"BLANC": "blanc", "ROUGE": "rouge", "ROSÉ": "rose"}[m.group(1)]
    name, prices = m.group(2), m.group(3)
    nums = [float(p.replace(",", ".")) for p in re.findall(r"(\d+,\d{2})", prices)]
    if len(nums) == 3:
        sizes = [{"cl": 12, "price": nums[0]}, {"cl": 25, "price": nums[1]}, {"cl": 46, "price": nums[2]}]
    else:
        sizes = [{"cl": 12, "price": nums[0]}]
    by_glass.append({"colour": colour, "name": name.strip(), "sizes": sizes})

bottles = []
sections = [("## Vins rouges (bouteille)", "rouge"), ("## Vins blancs (bouteille)", "blanc"), ("## Vins rosés", "rose"), ("## Les bulles", "bulles")]
for heading, colour in sections:
    m = re.search(re.escape(heading) + r"\n(.*?)(?=\n## |\Z)", text, re.S)
    if not m:
        continue
    region = None
    for line in m.group(1).splitlines():
        line = line.strip()
        if line.startswith("### "):
            region = line[4:].strip()
            continue
        mm = re.match(r"- (.+?) — (\d+(?:,\d+)?) €(.*)$", line)
        if not mm:
            continue
        name, price, rest = mm.group(1), float(mm.group(2).replace(",", ".")), mm.group(3)
        entry = {"colour": colour, "region": region or ("Champagne" if colour == "bulles" else "Provence et ailleurs"), "name": name.strip(), "price": price}
        if "1,5 l" in name or "1,5 l" in rest:
            entry["format"] = "Magnum 1,5 l"
        if "to confirm" in rest or "currency missing" in rest:
            entry["toConfirm"] = True
        bottles.append(entry)

json.dump({"updatedAt": "2026-10-06", "byGlass": by_glass, "bottles": bottles}, open(dst, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print(len(by_glass), "by the glass,", len(bottles), "bottles")
