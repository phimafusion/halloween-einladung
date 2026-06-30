# 🎃 Interaktive Halloween-Einladungskarte

Eine animierte, digitale Einladungskarte für Carmens 70. Geburtstag im schaurig-schönen Halloween-Stil. Die Karte ist optimiert für die flüssige Darstellung auf allen gängigen Smartphones und Desktop-Browsern.

🔗 **Live-Version:** [https://phimafusion.github.io/halloween-einladung/](https://phimafusion.github.io/halloween-einladung/)

---

## ⚡ Features & Interaktionen

- **Responsive 3D-Faltung**: Die Karte öffnet sich bei einem Klick oder Tippen wie ein echtes Buch. Dank CSS 3D-Transforms wirkt dies realistisch, auf dem Handy fliegt das Cover sogar dynamisch nach oben weg, um mehr Platz für den Text zu machen.
- **HTML5 Canvas Animationen**: 
  - **Fledermäuse**: Beim Öffnen brechen Fledermaus-Partikel aus dem Falz aus, flattern und fliegen physikalisch berechnet in den "Himmel".
  - **Reißende Spinnenfäden**: Beim Aufklappen dehnen sich Spinnenfäden, die bei einem größeren Öffnungswinkel physikalisch korrekt zerreißen und zurückschnellen.
- **Gruselige Audio-Kulisse**: Ein "Evil Laugh" erklingt beim ersten Öffnen, gefolgt von einem schaurigen Cover von *"Time Warp"* (Rocky Horror Picture Show).
- **Intelligente Hintergrund-Pausierung**: Die Karte pausiert die Musik automatisch auf allen Geräten (iOS/Android/Desktop), sobald der Tab gewechselt wird oder die App in den Hintergrund rückt.
- **Stummschaltung**: Über einen dezenten Audio-Button oben rechts lässt sich die Tonspur jederzeit komplett muten.

---

## 🏗️ Architektur & Code-Struktur

Die Codebase wurde kürzlich einem vollständigen Refactoring unterzogen, um maximale Wartbarkeit und Stabilität zu gewährleisten:

- **Core**: Semantisches HTML5 & Vanilla CSS3 (ohne externe Frameworks).
- **Objektorientiertes JavaScript (ES6)**: Die gesamte Logik ist sauber in spezialisierte Klassen aufgeteilt:
  - `CardController`: Verwaltet die DOM-Klicks, CSS-Klassen und das Sichtbarkeits-Management (Tab in den Hintergrund).
  - `AnimationEngine`: Steuert den Canvas, die Physik der Fledermäuse (`Bat`) und die Spinnenfäden (`WebStrand`).
  - `AudioManager`: Kapselt die MP3-Integration, das Muten und Pausieren/Abspielen.
- **SVG-Management**: Große Vektorgrafiken wurden aus der `index.html` entfernt und in `assets/svgData.js` als Template-Strings ausgelagert. Dies hält das HTML extrem schlank, während die Grafiken per JS injiziert werden – ganz ohne `fetch()`-CORS-Probleme!

---

## 💻 Lokale Entwicklung

Die Anwendung kommt komplett ohne Build-Step (wie Webpack oder Vite) aus. Da keine Ajax/Fetch-Anfragen für die Grafiken genutzt werden, funktioniert alles direkt lokal.

**Variante 1: Direktes Öffnen (Empfohlen)**
Du kannst die `index.html` Datei einfach direkt in deinem Browser öffnen (Doppelklick). 

**Variante 2: Lokaler Webserver**
Falls du einen lokalen Server bevorzugst (z. B. für strikte Audio-Sicherheitsrichtlinien mancher Browser):
```bash
python -m http.server 8000
```
Öffne anschließend [http://localhost:8000](http://localhost:8000) im Browser.

---

## 🧪 Tests (QUnit)

Das Projekt verfügt über ein automatisiertes Test-Setup mit dem **QUnit-Framework**, welches die Stabilität der JS-Klassen sicherstellt.

- **Tests ausführen:** Öffne einfach die Datei `tests.html` im Root-Verzeichnis deines Browsers.
- **Was getestet wird:** Die Tests überprüfen unter anderem die initiale Objekt-Instanziierung, das korrekte Togglen der DOM-Klassen beim Öffnen, die Physik-Veränderungen der Spinnenfäden, die Partikel-Berechnung sowie das sofortige Pausieren der Audio-Objekte bei Karten-Schließung oder Mute-Klicks.
