# 🎃 Interaktive Halloween-Einladungskarte

Eine hochmoderne, animierte digitale Einladungskarte für Carmens 70. Geburtstag im schaurig-schönen Halloween-Stil. Die Karte ist vollständig responsiv gestaltet und bietet eine flüssige 3D-Faltung sowie interaktive Animationen auf allen gängigen Smartphones (iOS & Android) sowie Desktop-Browsern.

🔗 **Live-Version:** [https://phimafusion.github.io/halloween-einladung/](https://phimafusion.github.io/halloween-einladung/)

---

## ⚡ Features & Interaktionen

- **Responsive 3D-Buchfaltung**: Die Karte öffnet sich bei Klick oder Touch realistisch im 3D-Raum. Auf Smartphones fliegt die Vorderseite dynamisch nach oben rechts weg, um Platz für die Inhalte zu schaffen.
- **Micro-Animationen & Effekte**:
  - **Wackelnde Timeline-Emojis**: Die Emojis im Ablauf (`🗝️`, `🥘`, `🧛`, `👻`) sind vergrößert (`1.4rem`), vertikal mittig am Text ausgerichtet und wiegen sich leicht zeitversetzt hin und her (`wiggleEmoji`).
  - **HTML5 Canvas Fledermäuse**: Beim Öffnen brechen physikalisch berechnete Fledermaus-Partikel aus dem Kartenfalzen aus und fliegen in den Himmel.
  - **Dynamische Spinnweben**: Zarte, mathematisch animierte Spinnenfäden hängen von den Bildschirmrändern herab und schwingen sanft im Wind.
- **Gruselige Audio-Kulisse**:
  - Ein schauriges Lachen (*Evil Laugh*) erklingt beim ersten Öffnen, gefolgt von einer Loop-Spur von *"Time Warp"* (Rocky Horror Picture Show).
  - **Stummschaltung**: Dezenter Sound-Toggle-Button oben rechts (`🔇` / `🔊`).
  - **Automatische Pause**: Die Musik pausiert sofort beim Schließen der Karte, beim Wechseln des Browser-Tabs oder beim Minimieren der App.

---

## 🏗️ Architektur & Code-Struktur

Das Projekt basiert auf reinem **HTML5, Vanilla CSS3 und ES6 JavaScript** (ohne externe Frameworks oder schwere Build-Tools):

- **Core-Architektur (Object-Oriented ES6)**:
  - `CardController` ([app.js](app.js)): Steuert das Öffnen/Schließen der Karte, DOM-Klassen und Tab-Sichtbarkeits-Events.
  - `AnimationEngine` ([app.js](app.js)): Verwaltet das HTML5 Canvas, den Render-Loop sowie Partikel-Klassen (`Bat`, `WebStrand`).
  - `AudioManager` ([app.js](app.js)): Kapselt HTML5 Audio-Objekte, Lautstärkeregelung und Autoplay-Fallback.
- **SVG-Kapselung**: Komplette Entkopplung großer Vektorgrafiken in [assets/svgData.js](assets/svgData.js). Dadurch bleibt die [index.html](index.html) extrem schlank und lesbar (ohne CORS-Restriktionen).
- **Design-System**: Umfassendes CSS-Token-System in [style.css](style.css) mit benutzerdefinierten Eigenschaften (`:root`), Typography (`Creepster`, `Fredericka the Great`, `Montserrat`) und 3D-Transforms.

---

## 💻 Lokale Entwicklung

Kein Build-Step (wie Webpack, Vite oder Babel) erforderlich!

**Variante 1: Direktes Öffnen**
Öffne die Datei `index.html` per Doppelklick in deinem Browser.

**Variante 2: Lokaler Webserver (Empfohlen)**
Starte einen lokalen Python-Webserver im Projektverzeichnis:
```bash
py -m http.server 8080
```
Öffne anschließend [http://localhost:8080](http://localhost:8080) im Browser.

---

## 🧪 Tests & Qualitätssicherung

Das Projekt ist mit automatisierten Unit-Tests auf Basis von **QUnit** abgesichert.

- **Tests ausführen:** Öffne die Datei [tests.html](tests.html) oder navigiere im lokalen Server zu `http://localhost:8080/tests.html`.
- **Testabdeckung (~87,5 %):** Überprüft werden u. a. die Initialisierung aller Manager, das Togglen von 3D-DOM-Zuständen, die Partikel-Physik, das Auslösen der SVG-Injection sowie die automatische Audio-Stummschaltung beim Schließen der Karte.
