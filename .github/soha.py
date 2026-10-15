# «Soha yangiliklari»: uzcharm.uz dan oxirgi yangiliklarni oladi (3 tilda) -> JSON.
# Faqat standart kutubxona: GitHub vazifasida ham, build.py da ham ishlaydi.
#   python soha.py chiqish.json
import html, json, re, sys, urllib.request
from datetime import datetime, timezone

ROOT = "https://uzcharm.uz"
N = 4
# Hammasi katta harf bilan yozilgan sarlavhalarda shu so'zlar asl ko'rinishida qoladi
KEEP = {"uzcharmexpo": "UzCharmExpo", "eurasia": "Eurasia", "caitme": "CAITME", "aymod": "AYMOD", "o‘zcharmsanoat": "O‘zcharmsanoat",
        "toshkentda": "Toshkentda", "toshkent": "Toshkent", "andijon": "Andijon", "o‘zbekiston": "O‘zbekiston", "узчармсаноат": "Узчармсаноат",
        "ташкенте": "Ташкенте", "ташкент": "Ташкент", "узбекистан": "Узбекистан", "tashkent": "Tashkent", "uzbekistan": "Uzbekistan",
        "international": "International", "exhibition": "Exhibition"}
ITEM = re.compile(r'<img src="([^"]+)"[^>]*class="[^"]*img__news-insite[^"]*">\s*<div class="news-text">\s*<h1>(.*?)</h1>.*?href="(/\w\w/news/(\d+)/(\d+)/(\d+)/[^"]+)"', re.S)


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (oltinkol-zona; soha yangiliklari)"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", errors="replace")


def tidy(t):
    t = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", t))).strip()
    letters = [c for c in t if c.isalpha()]
    if letters and sum(c.isupper() for c in letters) / len(letters) > .7:   # HAMMASI KATTA -> oddiy
        words = t.lower().split(" ")
        t = " ".join(KEEP.get(w.strip("«»\"“”.,:;!?"), None) and w.replace(w.strip("«»\"“”.,:;!?"), KEEP[w.strip("«»\"“”.,:;!?")]) or w for w in words)
        t = t[:1].upper() + t[1:]
        t = re.sub(r"(\d)-(ya|я)\b", r"\1-\2", t)
    return t


def fetch(n=N):
    by = {}
    for L in ("uz", "ru", "en"):
        for img, title, href, y, m, d in ITEM.findall(get(f"{ROOT}/{L}/news/")):
            key = href.split("/news/", 1)[1]
            it = by.setdefault(key, {"d": f"{int(y):04d}-{int(m):02d}-{int(d):02d}", "t": {}, "url": {}, "img": ROOT + img})
            it["t"][L] = tidy(title); it["url"][L] = ROOT + href
    items = sorted((v for v in by.values() if "uz" in v["t"]), key=lambda v: v["d"], reverse=True)[:n]
    for v in items:
        for L in ("ru", "en"):
            v["t"].setdefault(L, v["t"]["uz"]); v["url"].setdefault(L, v["url"]["uz"])
    if not items: raise RuntimeError("uzcharm.uz: yangilik topilmadi (sahifa tuzilishi o'zgargan bo'lishi mumkin)")
    return items


def write(path, items):
    """Faqat ro'yxat o'zgargan bo'lsa yozadi. True — o'zgardi."""
    try: old = json.load(open(path, encoding="utf-8"))["items"]
    except Exception: old = None
    if old == items: return False
    json.dump({"updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%MZ"), "src": ROOT, "items": items},
              open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    return True


if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "soha.json"
    print("o'zgardi" if write(out, fetch()) else "o'zgarmadi", out)
