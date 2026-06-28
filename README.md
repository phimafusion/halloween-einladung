# 🎃 Halloween Einladungskarte zum 70. Geburtstag

Eine interaktive, digitale Einladungskarte für Carmens 70. Geburtstag im schaurig-schönen Halloween-Stil. Optimiert für die Darstellung auf allen gängigen Smartphones direkt im Browser.

🔗 **Live-Version:** [https://phimafusion.github.io/halloween-einladung/](https://phimafusion.github.io/halloween-einladung/)

---

## ⚡ Features & Interaktionen

- **3D-Kartenfaltung**: Öffnet sich bei Klick/Tippen wie ein echtes Buch von rechts nach links.
- **Dehnbare & reißende Spinnenfäden**: Beim Aufklappen dehnen sich realistische Spinnenfäden auf der Innenseite, die bei größerem Öffnungswinkel physikalisch korrekt zerreißen und zurückschnellen.
- **Herausfliegende Fledermäuse**: Beim Öffnen brechen Fledermaus-Partikel aus dem Falz aus, flattern und fliegen geschmeidig nach oben weg.
- **Time Warp Spooky Synth**: Ein integrierter Web-Audio-Synthesizer spielt eine atmosphärische, schaurige Version des Refrains von *"Time Warp"* (Rocky Horror Picture Show) ab, verfeinert mit Hall- und Echo-Effekten.
- **Stummschaltung**: Ein schwebender Audio-Button oben rechts erlaubt das einfache Ein- und Ausschalten der Tonspur.

---

## 🛠️ Technologie-Stack

- **Core**: Semantisches HTML5
- **Styling**: Vanilla CSS3 (unter Verwendung von CSS 3D-Transforms, Perspective, CSS-Variablen und Keyframe-Animationen)
- **Logik & Audio**: Modernes ES6+ JavaScript, HTML5 Canvas API (für Partikel und Fäden), Web Audio API (für die Audiosynthese)

---

## 💻 Lokale Entwicklung

Um das Projekt lokal auszuführen:

1. Starte einen lokalen Webserver im Projektverzeichnis (z. B. mit Python):
   ```bash
   python -m http.server 8000
   ```
2. Öffne [http://localhost:8000](http://localhost:8000) im Browser.

---

## 🧪 Tests ausführen

Das Projekt verfügt über ein automatisiertes Test-Setup mit **QUnit**:
- Öffne lokal die Test-Suite im Browser unter: [http://localhost:8000/tests/tests.html](http://localhost:8000/tests/tests.html)
- Die Tests überprüfen die Initialisierung der Zustände, die Faltungslogik, die Spinnenfaden-Physik und die Fledermaus-Partikel.
