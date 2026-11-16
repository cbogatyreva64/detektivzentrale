# Detektivzentrale

Digitaler Begleiter zum Detektiv-Adventskalender für Kinder, die noch nicht lesen.
Jeden Tag gibt es einen Fall: Die App spielt die Nachricht der „Detektivzentrale“ ab, das Rätsel wird offline in der Wohnung gelöst,
dann wird die gefundene Zahl ins Zahlenschloss getippt. Es gibt Stempel in der Fallakte und Fotos im Forschertagebuch.

Progressive Web App (Preact, TypeScript, Vite). **Kein Backend, kein Login, kein Tracking, keine Anfragen nach außen.**
Fortschritt, Sprachaufnahmen und Fotos bleiben lokal auf dem iPad (IndexedDB). Nach dem ersten Laden funktioniert die App auch ohne Internet.

---

## 1. Veröffentlichen (GitHub Pages)

Die App ist eine statische Seite. Am iPad braucht sie **https**, sonst funktionieren Kamera, Mikrofon und Offline-Modus nicht.

1. Auf GitHub ein Repository anlegen, z. B. `detektivzentrale`.
   - **Öffentlich:** GitHub Pages ist kostenlos. Im Code stehen nur Titel und Codes, keine persönlichen Daten.
   - **Privat:** Pages braucht dann GitHub Pro. Alternativ das private Repo mit einem kostenlosen Dienst wie Cloudflare Pages oder Netlify verbinden
     (Build-Befehl `npm run build`, Ausgabeordner `dist`).
2. Den Code auf den Branch `main` hochladen.
3. Im Repository: **Settings → Pages → Source: „GitHub Actions“**.
4. Der mitgelieferte Workflow `.github/workflows/deploy.yml` baut und testet die App bei jedem Push auf `main` und veröffentlicht sie.
   Die Adresse lautet dann `https://<benutzername>.github.io/detektivzentrale/`.

Lokal ansehen geht auch (`npm run build` und dann `npm run preview`). Auf dem iPad im WLAN fehlt dann aber https, deshalb nur zum Ausprobieren am PC.

## 2. Einrichten auf dem iPad

1. Die Adresse in **Safari** öffnen und die App einmal komplett laden. Danach funktioniert sie offline.
2. **Nicht** „Zum Home-Bildschirm“ hinzufügen. QR-Codes öffnen immer Safari, und eine installierte Web-App hätte einen eigenen, getrennten Speicher.
   Die App fragt den Browser, ob er die Daten dauerhaft behalten darf. Im Elternbereich unter „Fotos“ steht, ob das geklappt hat.
3. Im **Elternbereich** (siehe unten) pro Tag die Sprachnachricht aufnehmen und die Adresse der App für die QR-Codes eintragen.
4. **QR-Codes und Code-Sticker drucken**, aufkleben und verstecken.
5. Im Testmodus alles einmal durchklicken. Danach **Testmodus beenden** und **Fortschritt zurücksetzen**.
6. Tipp: Mit **Geführter Zugriff** (Einstellungen → Bedienungshilfen) bleibt das iPad in Safari, und das Kind kann die App nicht verlassen.
7. Steht der Lautlos-Modus an, sind die Effekt-Töne stumm. Die Sprachnachrichten laufen trotzdem.

**Updates:** Nach einer neuen Version lädt die App die Änderung im Hintergrund.
Eingespielt wird sie erst, wenn der Kalender angezeigt wird oder Safari im Hintergrund ist, also nie mitten in einem Fall.

## 3. Elternbereich

**Öffnen:** Unten rechts im Kalender ist ein blasses Schlüssel-Symbol. Darauf **3 Sekunden** gedrückt halten.
Dabei füllt sich ein dünner Ring. Danach eine Einmaleins-Aufgabe lösen.
Nach 15 Minuten ohne Aktivität oder mit „Zurück zur Kinderansicht“ ist der Bereich wieder gesperrt.

**Pro Tag** (Zeile antippen):
- **Code** ändern. Ein eigener Code ist gelb markiert. „Standard“ stellt den Code aus `days.json` wieder her. Danach den Sticker neu drucken.
- **Aufnahme** für Deutsch (D) und Russisch (Д): „Aufnehmen“, dann „Stopp“. Danach anhören und bei Bedarf neu aufnehmen.
  Alternativ eine fertige Audio-Datei hochladen, z. B. ein Sprachmemo als `.m4a`. Beim ersten Aufnehmen fragt Safari nach dem Mikrofon.
  Gibt es für eine Sprache keine Aufnahme, sieht das Kind den Sprachknopf nicht. Fehlen beide Aufnahmen, ist der Play-Button grau.
- **Detektiv-Effekt** (standardmäßig an): Die Stimme klingt wie über Funk, darunter läuft leise Krimi-Musik,
  am Anfang rauscht das Funkgerät, am Ende piept es. Die App mischt das selbst, ohne Internet.
  Das Original bleibt gespeichert, der Haken lässt sich jederzeit wieder entfernen.

**Testmodus:** Ein Datum wählen oder mit „+1 Tag“ weiterschalten. Unten erscheint ein gestreiftes Band, solange er aktiv ist.
- **Testdaten löschen:** Beendet den Testmodus, setzt alle Fälle auf „ungelöst“ und löscht alle Fotos. Aufnahmen und Codes bleiben erhalten.
- **Nur Fälle zurücksetzen:** wie oben, aber Fotos bleiben.
- **Einzelnen Fall zurücksetzen:** in der Tagesliste die Zeile öffnen und „Fall zurücksetzen“ wählen.

**Sprachnachrichten:** Textentwürfe für alle 24 Tage stehen in [`docs/sprechtexte.md`](docs/sprechtexte.md).

**Ton:** Effekt-Töne an/aus und Lautstärke.

**Fotos:** alle Bilder ansehen, einzelne löschen und alle als ZIP herunterladen. Am iPad landet die ZIP-Datei in „Dateien“.

**Druckvorlagen:**
- Zuerst die **Adresse der App** eintragen, z. B. `https://<name>.github.io/detektivzentrale/`.
  Bei `localhost` oder einer Adresse ohne https warnt die App.
- **QR-Codes:** 24 Codes auf einer A4-Seite, jeder mit Lupe und Tagesnummer. Jeder Code öffnet direkt seinen Tag (`…/#tag-5`).
- **Code-Sticker:** große Zahl mit Würfelbild (1–9) oder Zehnerfeldern (ab 10). Es gelten immer die aktuellen Codes.
  Das kleine graue „T5“ oben links ist nur für dich.
- Im Druckdialog **A4 und 100 %** wählen, nicht „An Seite anpassen“. Dann entlang der gestrichelten Linien schneiden.

## 4. Für das Kind

- **Kalender:** 24 Türen. Gesperrte Türen sind grau mit Schloss und wackeln beim Antippen. Die heutige Tür hat einen goldenen Rand.
  Verpasste Tage lassen sich nachholen.
- **Tag:** großer Play-Button für die Nachricht, daneben das Fund-Symbol (Lego, Reagenzglas, Buch). Darunter das Zahlenschloss:
  Die eingetippte Zahl erscheint auch als Punkte, damit das Kind sie mit dem Sticker vergleichen kann.
  Bei einer falschen Zahl wackelt das Schloss freundlich. Bei der richtigen springt es auf, und der Stempel fliegt in die Fallakte.
- **Fallakte** (Ordner-Symbol): alle Stempel. Nach dem 24. gibt es die Medaille „Meisterdetektiv“.
- **Forschertagebuch** (grünes Heft): An Experiment-Tagen (3, 5, 9, 12, 15, 19, 21, 22) gibt es nach dem Lösen einen Kamera-Button.
  Die Kresse (Tag 9) erscheint als Zeitreihe mit einem Punkt pro Tag. Fotos werden auf höchstens 1600 px verkleinert.

## 5. Entwicklung

Voraussetzung: Node.js ab Version 22. Auf diesem PC liegt eine portable Version ohne Admin-Rechte in `%LOCALAPPDATA%\nodejs`.
Damit `npm` in jedem Terminal funktioniert, den Ordner einmal zur Benutzer-Variable `Path` hinzufügen:
Windows-Suche, dann „Umgebungsvariablen für dieses Konto bearbeiten“, dann `Path` bearbeiten und `%LOCALAPPDATA%\nodejs` eintragen.

```bash
npm install        # einmalig
npm run dev        # Entwicklungsserver auf http://localhost:5173 (ohne Service Worker)
npm test           # Unit-Tests
npm run build      # fertige Seite inkl. Service Worker in dist/
npm run preview    # gebaute Seite lokal ansehen
```

Getestet werden Datumssperre, Code-Prüfung, Speicherung, Kindersperre, Punktdarstellung, QR-Codes (Rundlauf: erzeugen und wieder lesen),
Foto-Verkleinerung und Kresse-Zeitreihe.

**Daten:** `src/data/days.json` enthält die 24 Tage. Die Standard-Codes wurden einmal zufällig erzeugt (`scripts/generate-days.mjs`).
Das Skript nicht erneut ausführen, sonst passen gedruckte Sticker nicht mehr.

**Icons:** `node scripts/make-icons.mjs` zeichnet die App-Icons neu in `public/`. Dafür braucht es keine Zusatzprogramme.

**Aufbau:**

```
src/
  lib/         Logik ohne Oberfläche (Datum, Codes, Speicher, QR, Fotos, Aufnahme, Töne)
  components/  Bausteine (Zahlenschloss, Stempel, Punkte, Fotos, Icons)
  views/       Kalender, Tag, Fallakte, Forschertagebuch, Elternbereich (parent/)
  store.ts     App-Zustand (lädt aus IndexedDB)
  pwa.ts       Service Worker und sichere Updates
tests/         Vitest
```
