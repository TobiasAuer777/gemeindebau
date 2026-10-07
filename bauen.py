"""Baut die Gemeindebau-App zu einer einzigen Datei.
  index.html          – vollständige Seite für GitHub Pages (mit Supabase-Konfiguration)
  dist/vorschau.html  – Seiteninhalt für die Claude-Vorschau (ohne Doctype/Head, Beispieldaten)
Aufruf: python3 bauen.py [SUPABASE_URL] [ANON_KEY]
"""
import sys, json
from pathlib import Path
H = Path(__file__).parent; SRC = H/"src"; OUT = H/"dist"; OUT.mkdir(exist_ok=True)
url = sys.argv[1] if len(sys.argv) > 1 else ""
key = sys.argv[2] if len(sys.argv) > 2 else ""
css = (SRC/"style.css").read_text()
js = "\n".join((SRC/f).read_text() for f in ("data.js", "halle.js", "app.js"))
logo = (SRC/"logo160.txt").read_text().strip()
fav = (SRC/"logo64.txt").read_text().strip()

KOPF = """<title>Gemeindebau Tabernacle</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@600;700&family=JetBrains+Mono:wght@500&display=swap">"""
SKRIPTE = """<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js"></script>"""

def inhalt(konfig):
    return (f"{KOPF}\n<style>\n{css}\n</style>\n<div id=\"wurzel\"></div>\n{SKRIPTE}\n"
            f"<script>\nconst LOGO={json.dumps(logo)};\nwindow.GB_KONFIG={json.dumps(konfig)};\n{js}\n</script>\n")

# Vorschau (Artifact): immer Beispieldaten
(OUT/"vorschau.html").write_text(inhalt({}))
# Echte Seite
voll = f"""<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#14254f"><link rel="icon" href="{fav}"><link rel="apple-touch-icon" href="{logo}">
<meta name="robots" content="noindex">
{inhalt({"url": url, "anonKey": key})}</html>"""
voll = voll.replace("<div id=\"wurzel\"></div>", "</head><body><div id=\"wurzel\"></div>", 1).replace("</script>\n</html>", "</script>\n</body></html>")
(H/"index.html").write_text(voll)
print("gebaut: index.html", (H/"index.html").stat().st_size//1024, "KB | live:", bool(url))
