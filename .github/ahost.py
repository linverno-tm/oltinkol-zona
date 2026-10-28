"""GitHub Pages build'idan ahost nusxasi (_ahost/): yo'llar /oltinkol-zona/ → /, havolalar → andijoncharmpoyabzal.uz."""
import os
import re
import shutil

DOMEN = "https://andijoncharmpoyabzal.uz"
PAGES = "https://linverno-tm.github.io/oltinkol-zona"
CHIQ = "_ahost"
MATN = (".html", ".xml", ".txt", ".js", ".css", ".json", ".webmanifest", ".svg", ".mjs")

shutil.rmtree(CHIQ, ignore_errors=True)
shutil.copytree(".", CHIQ, ignore=shutil.ignore_patterns(".git", ".github", ".nojekyll", CHIQ))
soni = 0
for root, _, files in os.walk(CHIQ):
    for f in files:
        if not f.lower().endswith(MATN):
            continue
        p = os.path.join(root, f)
        t = open(p, encoding="utf-8", errors="surrogateescape").read()
        n = t.replace(PAGES + "/", DOMEN + "/").replace(PAGES, DOMEN).replace("/oltinkol-zona/", "/")
        n = re.sub(r'(["\'(])/oltinkol-zona(["\')])', r"\1/\2", n)
        if n != t:
            open(p, "w", encoding="utf-8", errors="surrogateescape", newline="").write(n)
            soni += 1
print(f"{CHIQ}: {soni} ta fayl domenga moslandi")
