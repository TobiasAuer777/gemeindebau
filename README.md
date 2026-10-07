# Gemeindebau · Tabernacle Church

Planungs- und Mitmach-Plattform für den Umbau der Werkstatt in der Konzstraße 9 (Mannheim) zum Gemeindesaal.

**Seite:** https://tobiasauer777.github.io/gemeindebau/

## Was drin ist
- **Kalender** – jeder trägt ein, wann er kommt und was er am liebsten macht (Reihenfolge oder „alles gleich“); alle sehen, wer wann da ist.
- **Aufgaben** – Board für die Bauleitung, Zuweisung an Teams und Personen, Fotos und Notizen pro Aufgabe.
- **Bautagebuch** – Tagesfortschritt mit Text und Bildern.
- **Teams**, **Materialliste** (Bestellwünsche mit Freigabe), **Werkzeugliste** (wer bringt was mit).
- **Benutzer** (nur Admin) – Rollen, Zugänge sperren, letzte Anmeldung. Ein Konto (E-Mail + Passwort) gilt auf allen Geräten.
- **Halle** – Grundriss zum Planen (Bühne, Bestuhlung, Tische …) und begehbare 3D-Ansicht mit LED-Wand 10 × 3 m.

## Technik
- Eine einzige Seite (`index.html`), gebaut aus `src/` mit `python3 bauen.py <SUPABASE_URL> <ANON_KEY>`.
- Daten, Anmeldung und Fotos liegen bei Supabase (Datenbank: `supabase/schema.sql`, danach `supabase/002_benutzer_phasen.sql` im SQL Editor ausführen), geschützt durch Row Level Security: Lesen nur für Mitglieder mit Gemeinde-Code, Bauleitung darf mehr.
- Der „anon“-Schlüssel in `index.html` ist öffentlich gedacht; ohne Anmeldung + Gemeinde-Code sind keine Daten lesbar.
