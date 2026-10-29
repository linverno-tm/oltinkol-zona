"""GitHub Pages build'idan ahost nusxasi (_ahost/): yo'llar /oltinkol-zona/ → /, havolalar → andijoncharmpoyabzal.uz."""
import base64
import hashlib
import os
import re
import shutil
import ssl
import urllib.request

DOMEN = "https://andijoncharmpoyabzal.uz"
PAGES = "https://linverno-tm.github.io/oltinkol-zona"
CHIQ = "_ahost"
MATN = (".html", ".xml", ".txt", ".js", ".css", ".json", ".webmanifest", ".svg", ".mjs")


def csp_xesh(html):
    """Yo'llar almashgach ichki skriptlar o'zgaradi — CSP'dagi sha256 xeshlarini qayta hisoblaymiz."""
    xesh = []
    for m in re.finditer(r"<script(?![^>]*\bsrc=)([^>]*)>(.*?)</script>", html, re.S):
        if "application/ld+json" in m.group(1):
            continue
        h = "'sha256-" + base64.b64encode(hashlib.sha256(m.group(2).encode("utf-8", "surrogateescape")).digest()).decode() + "'"
        if h not in xesh:
            xesh.append(h)

    def almashtir(m):
        qism = re.sub(r"\s*'sha256-[^']+'", "", m.group(0))
        return qism + "".join(" " + h for h in xesh)
    return re.sub(r"script-src [^;\"]*", almashtir, html, count=1)


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
        if f.endswith(".html") and f != "404.html":
            n = re.sub(r'<meta name="robots" content="noindex, ?nofollow">', '<meta name="robots" content="index, follow">', n)
        if f.endswith(".html"):
            n = csp_xesh(n)
        if n != t:
            open(p, "w", encoding="utf-8", errors="surrogateescape", newline="").write(n)
            soni += 1
print(f"{CHIQ}: {soni} ta fayl domenga moslandi")

# Domen nusxasi Google'ga ochiq; github.io nusxasi yopiq qoladi — dublikat bo'lmasin.
with open(os.path.join(CHIQ, "robots.txt"), "w", encoding="utf-8", newline="\n") as r:
    r.write(f"User-agent: *\nAllow: /\nSitemap: {DOMEN}/sitemap.xml\n")
print("robots.txt: Google'ga ochiq")

# IndexNow kaliti (ochiq bo'lishi shart): Yandex va Bing yangi sahifalarni akkauntsiz shu orqali qabul qiladi.
INDEXNOW = "f599f5f0d043d577731d71229570bdbf"
with open(os.path.join(CHIQ, f"{INDEXNOW}.txt"), "w", encoding="utf-8", newline="\n") as k:
    k.write(INDEXNOW)

# Google Search Console egalik fayli (Qidiruv MCP orqali tasdiqlangan) — o'chirilsa egalik yo'qoladi.
GOOGLE = "google7d9a42a374645eb1.html"
with open(os.path.join(CHIQ, GOOGLE), "w", encoding="utf-8", newline="\n") as g:
    g.write(f"google-site-verification: {GOOGLE}")

# Yandex Webmaster egalik fayli — o'chirilsa egalik yo'qoladi.
YANDEX = "f9ccaad1c6ee8b5e"
with open(os.path.join(CHIQ, f"yandex_{YANDEX}.html"), "w", encoding="utf-8", newline="\n") as y:
    y.write('<html>\n    <head>\n        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">\n'
            f'    </head>\n    <body>Verification: {YANDEX}</body>\n</html>\n')

# HTTPS'ga yo'naltirish faqat domen sertifikati haqiqiy bo'lsa yoqiladi — aks holda sayt ochilmay qoladi.
try:
    urllib.request.urlopen(DOMEN + "/robots.txt", timeout=20, context=ssl.create_default_context())
    sertifikat = True
except Exception as e:
    sertifikat = False
    print(f"HTTPS hali tayyor emas ({type(e).__name__}) — yo'naltirish qo'yilmadi")
if sertifikat:
    with open(os.path.join(CHIQ, ".htaccess"), "w", encoding="utf-8", newline="\n") as h:
        h.write(
            r"RewriteEngine On" "\n"
            r"RewriteCond %{REQUEST_URI} !^/\.well-known/" "\n"
            r"RewriteCond %{HTTPS} off" "\n"
            r"RewriteCond %{HTTP:X-Forwarded-Proto} !https" "\n"
            r"RewriteRule ^ https://andijoncharmpoyabzal.uz%{REQUEST_URI} [L,R=301]" "\n"
            r"RewriteCond %{REQUEST_URI} !^/\.well-known/" "\n"
            r"RewriteCond %{HTTP_HOST} ^www\. [NC]" "\n"
            r"RewriteRule ^ https://andijoncharmpoyabzal.uz%{REQUEST_URI} [L,R=301]" "\n"
        )
    print(".htaccess: HTTPS'ga yo'naltirish yoqildi")
