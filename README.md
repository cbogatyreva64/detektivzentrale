# Detektivzentrale

Digitaler Begleiter zum Detektiv-Adventskalender. Progressive Web App mit Preact, TypeScript und Vite.
Alle Daten (Fortschritt, Aufnahmen, Fotos) bleiben lokal auf dem Gerät in IndexedDB. Es gibt kein Backend und kein Tracking.

> Stand: Kalender, Tagesansicht, Zahlenschloss, Fallakte, Elternbereich und Druckvorlagen sind fertig.
> Forschertagebuch und Offline-Modus folgen.

## Elternbereich

**Öffnen:** Unten rechts im Kalender ist ein blasses Schlüssel-Symbol. Darauf **3 Sekunden** gedrückt halten.
Dabei füllt sich ein dünner Ring. Danach eine Einmaleins-Aufgabe lösen.
Nach 15 Minuten ohne Aktivität oder mit „Zurück zur Kinderansicht“ ist der Bereich wieder gesperrt.

**Pro Tag** (Zeile antippen):
- **Code** ändern. Ein eigener Code ist gelb markiert. „Standard“ stellt den Code aus `days.json` wieder her. Danach den Sticker neu drucken.
- **Aufnahme** für Deutsch (D) und Russisch (Д): „Aufnehmen“, dann „Stopp“. Danach anhören und bei Bedarf neu aufnehmen.
  Alternativ eine fertige Audio-Datei hochladen, z. B. ein Sprachmemo als `.m4a`. Beim ersten Aufnehmen fragt Safari nach dem Mikrofon.
  Gibt es für eine Sprache keine Aufnahme, sieht das Kind den Sprachknopf nicht. Fehlen beide Aufnahmen, ist der Play-Button grau.

**Testmodus:** Ein Datum wählen oder mit „+1 Tag“ weiterschalten. Unten erscheint ein gestreiftes Band, solange er aktiv ist.
Danach „Testmodus beenden“ und **„Fortschritt zurücksetzen“**, damit am 1.12. alles frisch ist.
Zurücksetzen löscht nur die gelösten Fälle. Aufnahmen, Codes und Fotos bleiben erhalten.

**Ton:** Effekt-Töne an/aus und Lautstärke. **Fotos:** alle Bilder aus dem Forschertagebuch als ZIP herunterladen.

**Druckvorlagen:**
- Zuerst die **Adresse der App** eintragen, also die GitHub-Pages-Adresse, z. B. `https://<name>.github.io/detektivzentrale/`.
  Steht dort `localhost`, warnt die App, weil solche QR-Codes am iPad nicht funktionieren.
- **QR-Codes drucken:** 24 Codes auf einer A4-Seite, jeder mit Lupe und Tagesnummer. Jeder Code öffnet direkt seinen Tag (`…/#tag-5`).
- **Code-Sticker drucken:** große Zahl mit Würfelbild (1–9) oder Zehnerfeldern (ab 10). Es gelten immer die aktuellen Codes.
  Das kleine graue „T5“ oben links ist nur für dich.
- Im Druckdialog **A4 und 100 %** wählen, nicht „An Seite anpassen“. Dann entlang der gestrichelten Linien schneiden.
- Wenn du einen Code änderst, den Sticker neu drucken. Ändert sich die Adresse der App, die QR-Codes neu drucken.

## Entwicklung

Voraussetzung: Node.js ab Version 22. Auf diesem PC liegt eine portable Version ohne Admin-Rechte in `%LOCALAPPDATA%\nodejs`.
Damit `npm` in jedem Terminal funktioniert, diesen Ordner einmal zur Benutzer-Variable `Path` hinzufügen:
Windows-Suche, dann „Umgebungsvariablen für dieses Konto bearbeiten“, dann `Path` bearbeiten und `%LOCALAPPDATA%\nodejs` eintragen.

```bash
npm install        # einmalig
npm run dev        # Entwicklungsserver auf http://localhost:5173
npm test           # Unit-Tests (Datumssperre, Code-Prüfung, Speicherung)
npm run build      # fertige Seite in dist/
```

## Daten

`src/data/days.json` enthält die 24 Tage. Die Standard-Codes wurden einmal zufällig erzeugt (`scripts/generate-days.mjs`).
Das Skript nicht erneut ausführen, sonst passen bereits gedruckte Sticker nicht mehr.

Zahlen bis 9 erscheinen als Würfelbild. Ab 10 erscheinen sie als Zehnerfelder (2 × 5 Punkte, ein volles Feld pro Zehner).

## Hinweise iPad

- Die App immer in **Safari** nutzen und nicht zum Home-Bildschirm hinzufügen. QR-Codes öffnen immer Safari, und eine installierte Web-App hätte einen eigenen, getrennten Speicher.
- Steht der Stummschalter bzw. der Lautlos-Modus an, sind die Effekt-Töne stumm. Die Sprachnachrichten laufen trotzdem.
