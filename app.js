/**
 * Digital Halloween Invitation Card
 * Logic for Card Opening, Canvas Spiderwebs & Bats, and Spooky Web Audio Synth.
 */

// --- Global States ---
let cardOpen = false;
let openingAngle = 0; // 0 to Math.PI (0 to 180 degrees)
let targetAngle = 0;
let firstUserInteraction = false;

// Canvas setup
const canvas = document.getElementById('animation-canvas');
const ctx = canvas.getContext('2d');
// Helper to get active card element (prevents stale refs in unit test suites)
function getCardElement() {
    return document.getElementById('halloween-card');
}

// Bats & Webs arrays
const bats = [];
const webStrands = [];
const MAX_BATS = 25;

// Bat path SVG helper
// Stylized bat silhouette: drawn relative to center (0, 0)
function drawBatPath(c, x, y, width, height, flapFactor) {
    c.save();
    c.translate(x, y);
    c.fillStyle = '#1b122c';
    c.beginPath();
    
    // Left Wing
    c.moveTo(0, -height * 0.2);
    c.quadraticCurveTo(-width * 0.3, -height * 0.8 * flapFactor, -width * 0.5, -height * 0.3 * flapFactor);
    c.quadraticCurveTo(-width * 0.35, height * 0.1, -width * 0.2, height * 0.2);
    c.quadraticCurveTo(-width * 0.1, height * 0.5, 0, height * 0.4);
    
    // Right Wing (mirrored)
    c.quadraticCurveTo(width * 0.1, height * 0.5, width * 0.2, height * 0.2);
    c.quadraticCurveTo(width * 0.35, height * 0.1, width * 0.5, -height * 0.3 * flapFactor);
    c.quadraticCurveTo(width * 0.3, -height * 0.8 * flapFactor, 0, -height * 0.2);
    
    c.fill();
    c.restore();
}

// --- Audio System ---
// Phase 1: Ambient spooky synth (page load → card first open)
// Phase 2: Evil laugh (plays once when card opens for the first time)
// Phase 3: RHPS music (starts after laugh, persists through card close/reopen)

let audioCtxAmbient = null;
let ambientStarted = false;
let musicStarted = false; // once true, never goes back to ambient
let isMuted = false;
let spookyAudio = null; // the RHPS MP3

// --- Sound Button State ---
function setSoundBtnIcon() {
    const btn = document.getElementById('sound-toggle');
    if (!btn) return;
    btn.innerHTML = isMuted ? '🔇' : '🔊';
    btn.setAttribute('aria-label', isMuted ? 'Ton einschalten' : 'Ton ausschalten');
}

// ── 1. AMBIENT WEB AUDIO SYNTH ───────────────────────────────────────────
function startAmbient() {
    if (ambientStarted || musicStarted) return;
    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioCtxAmbient = new AudioContextClass();

        const masterGain = audioCtxAmbient.createGain();
        masterGain.gain.setValueAtTime(isMuted ? 0 : 0.0, audioCtxAmbient.currentTime);
        masterGain.gain.linearRampToValueAtTime(isMuted ? 0 : 0.7, audioCtxAmbient.currentTime + 2.0);
        masterGain.connect(audioCtxAmbient.destination);

        // Low eerie drone (two detuned triangle oscillators)
        [55, 55.4, 82.5].forEach((freq, i) => {
            const osc = audioCtxAmbient.createOscillator();
            osc.type = i === 2 ? 'sine' : 'triangle';
            osc.frequency.setValueAtTime(freq, audioCtxAmbient.currentTime);
            const g = audioCtxAmbient.createGain();
            g.gain.setValueAtTime(i === 2 ? 0.025 : 0.04, audioCtxAmbient.currentTime);
            osc.connect(g);
            g.connect(masterGain);
            osc.start();
        });

        // Wind: filtered noise
        const bufSize = audioCtxAmbient.sampleRate * 3;
        const noiseBuf = audioCtxAmbient.createBuffer(1, bufSize, audioCtxAmbient.sampleRate);
        const d = noiseBuf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
        const noise = audioCtxAmbient.createBufferSource();
        noise.buffer = noiseBuf;
        noise.loop = true;
        const windFilt = audioCtxAmbient.createBiquadFilter();
        windFilt.type = 'bandpass';
        windFilt.Q.value = 4;
        windFilt.frequency.value = 350;
        const windGain = audioCtxAmbient.createGain();
        windGain.gain.value = 0.018;
        noise.connect(windFilt);
        windFilt.connect(windGain);
        windGain.connect(masterGain);
        noise.start();

        // Slowly sweep wind filter
        setInterval(() => {
            if (!audioCtxAmbient || audioCtxAmbient.state !== 'running') return;
            windFilt.frequency.exponentialRampToValueAtTime(
                200 + Math.random() * 700,
                audioCtxAmbient.currentTime + 4 + Math.random() * 5
            );
        }, 6000);

        // Store masterGain so mute can control it
        audioCtxAmbient._masterGain = masterGain;
        ambientStarted = true;
    } catch(e) {
        console.log('Ambient audio init failed:', e);
    }
}

function stopAmbient() {
    if (!audioCtxAmbient) return;
    const g = audioCtxAmbient._masterGain;
    if (g) {
        g.gain.linearRampToValueAtTime(0, audioCtxAmbient.currentTime + 1.5);
    }
    setTimeout(() => {
        try { audioCtxAmbient.close(); } catch(e) {}
        audioCtxAmbient = null;
    }, 1600);
}

// ── 2. EVIL LAUGH SYNTHESIZER ─────────────────────────────────────────────
function playEvilLaugh() {
    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        const ac = new AudioContextClass();
        const master = ac.createGain();
        master.gain.setValueAtTime(isMuted ? 0 : 0.5, ac.currentTime);
        master.connect(ac.destination);

        // Build 5 laugh "ha" bursts
        const laughTimes = [0, 0.35, 0.62, 0.82, 0.98, 1.18, 1.35, 1.55, 1.7, 1.82];
        laughTimes.forEach((t, i) => {
            const osc = ac.createOscillator();
            osc.type = 'sawtooth';
            // Descending pitch per burst group for realism
            const base = 220 - Math.floor(i / 2) * 12;
            osc.frequency.setValueAtTime(base * 1.2, ac.currentTime + t);
            osc.frequency.exponentialRampToValueAtTime(base * 0.7, ac.currentTime + t + 0.28);

            const dist = ac.createWaveShaper();
            const curve = new Float32Array(256);
            for (let j = 0; j < 256; j++) {
                const x = (j * 2) / 256 - 1;
                curve[j] = (Math.PI + 120) * x / (Math.PI + 120 * Math.abs(x));
            }
            dist.curve = curve;

            const g = ac.createGain();
            g.gain.setValueAtTime(0, ac.currentTime + t);
            g.gain.linearRampToValueAtTime(0.4, ac.currentTime + t + 0.04);
            g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + t + 0.28);

            osc.connect(dist);
            dist.connect(g);
            g.connect(master);
            osc.start(ac.currentTime + t);
            osc.stop(ac.currentTime + t + 0.35);
        });

        // Close context after laugh
        setTimeout(() => { try { ac.close(); } catch(e) {} }, 2500);
    } catch(e) {
        console.log('Laugh synth failed:', e);
    }
}

// ── 3. RHPS MUSIC (MP3) ──────────────────────────────────────────────────
function startMusic() {
    if (musicStarted) return;
    musicStarted = true;
    if (!spookyAudio) {
        spookyAudio = new Audio('assets/rhps_time_warp_song_cut.mp3');
        spookyAudio.loop = true;
        spookyAudio.volume = isMuted ? 0 : 0.35;
    }
    // Slight delay so laugh plays first
    setTimeout(() => {
        spookyAudio.play().catch(e => console.log('Music play blocked:', e));
    }, 300);
}

// ── MUTE CONTROL ─────────────────────────────────────────────────────────
function applyMuteState() {
    if (audioCtxAmbient && audioCtxAmbient._masterGain) {
        const target = isMuted ? 0 : 0.7;
        audioCtxAmbient._masterGain.gain.linearRampToValueAtTime(
            target, audioCtxAmbient.currentTime + 0.4
        );
    }
    if (spookyAudio) {
        spookyAudio.volume = isMuted ? 0 : 0.35;
    }
    setSoundBtnIcon();
}

// Compatibility alias used elsewhere in the code
function initSynth() { startAmbient(); }
function updateMuteState() { applyMuteState(); }
function synthRunning() { return ambientStarted || musicStarted; }

// --- Particles & Physics ---

class Bat {
    constructor(startX, startY) {
        this.x = startX;
        this.y = startY;
        // Make them at least 100% larger (doubled base width)
        this.width = 24 + Math.random() * 40;
        this.height = this.width * 0.5;
        // Fly upwards and outwards - much slower
        this.vx = (Math.random() - 0.5) * 3;
        this.vy = -1.2 - Math.random() * 2.0;
        this.flapSpeed = 0.08 + Math.random() * 0.12;
        this.flapPhase = Math.random() * Math.PI * 2;
        this.opacity = 1;
        // Larger scale range
        this.scale = 1.0 + Math.random() * 0.8;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.flapPhase += this.flapSpeed;
        
        // Sinuosity (wiggle left/right slightly)
        this.x += Math.sin(this.flapPhase) * 0.4;
        
        // Slowly shrink and fade out (slower decay to match slower flight)
        this.opacity -= 0.004;
        if (this.scale > 0.1) this.scale -= 0.001;
    }

    draw() {
        const currentFlap = Math.sin(this.flapPhase);
        ctx.globalAlpha = Math.max(0, this.opacity);
        drawBatPath(ctx, this.x, this.y, this.width * this.scale, this.height * this.scale, currentFlap);
        ctx.globalAlpha = 1;
    }
}

class WebStrand {
    constructor(relY, originalDist) {
        // Position relative to card height
        this.relY = relY; 
        this.originalDist = originalDist;
        this.snapped = false;
        this.snapProgress = 0; // 0 to 1 for snap animation
        this.snapAngle = Math.random() * Math.PI; // direction of retraction
        this.slack = 10 + Math.random() * 15; // natural droop
        this.opacity = 0.7 + Math.random() * 0.3;
    }

    update(creaseX, cardTop, cardHeight, coverAngle) {
        const y = cardTop + cardHeight * this.relY;
        const cardW = getCardElement() ? getCardElement().offsetWidth : 300;
        
        // Calculate points based on 3D rotation projection
        // Left attachment (on the folding cover)
        // If angle = 0, X = creaseX + relDistance
        // Projection X = creaseX + relDistance * cos(angle)
        // Let's attach at 20% of card width from crease
        const attachDist = cardW * 0.15; 
        const xLeft = creaseX + attachDist * Math.cos(coverAngle);
        // Right attachment (static on inside-right page)
        const xRight = creaseX + attachDist;
        
        const dist = xRight - xLeft;
        
        // Snap condition: if cover opened past 75 degrees (~1.3 rad) or distance exceeds threshold
        if (coverAngle > 1.25 && !this.snapped) {
            this.snapped = true;
        }

        if (this.snapped) {
            this.snapProgress += 0.05;
        }

        return { xLeft, xRight, y };
    }

    draw(xLeft, xRight, y) {
        ctx.strokeStyle = `rgba(235, 230, 220, ${this.opacity})`;
        ctx.lineWidth = this.snapped ? Math.max(0.1, 1 - this.snapProgress) : 1.2;
        ctx.lineCap = 'round';
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = 2;
        ctx.beginPath();
        
        if (!this.snapped) {
            // Draw a curved line to represent droop
            const midX = (xLeft + xRight) / 2;
            const midY = y + this.slack;
            ctx.moveTo(xLeft, y);
            ctx.quadraticCurveTo(midX, midY, xRight, y);
            ctx.stroke();
        } else {
            // Retract the snapped ends
            if (this.snapProgress < 1) {
                const midX = (xLeft + xRight) / 2;
                const snapX = midX;
                const snapY = y + this.slack;
                
                // Left half retracting
                const leftEndX = xLeft + (snapX - xLeft) * (1 - this.snapProgress);
                const leftEndY = y + (snapY - y) * (1 - this.snapProgress);
                ctx.moveTo(xLeft, y);
                ctx.quadraticCurveTo((xLeft + leftEndX)/2, y + this.slack/2, leftEndX, leftEndY);
                
                // Right half retracting
                const rightEndX = xRight - (xRight - snapX) * (1 - this.snapProgress);
                const rightEndY = y + (snapY - y) * (1 - this.snapProgress);
                ctx.moveTo(xRight, y);
                ctx.quadraticCurveTo((xRight + rightEndX)/2, y + this.slack/2, rightEndX, rightEndY);
                
                ctx.stroke();
            }
        }
        ctx.shadowBlur = 0; // reset
    }
}

// --- Setup/Initialize Web Strands ---
function initWebStrands() {
    webStrands.length = 0;
    // Spawn 8 web strands down the crease
    for (let i = 0; i < 8; i++) {
        const relY = 0.15 + (i * 0.1) + Math.random() * 0.05; // distribute along the middle
        webStrands.push(new WebStrand(relY, 40));
    }
}

// --- Spawn Bats ---
function spawnBats(x, y) {
    for (let i = 0; i < MAX_BATS; i++) {
        // staggered delay or spawn instantly with varying velocities
        bats.push(new Bat(x, y + (Math.random() - 0.5) * 100));
    }
}

// --- Resize Handler ---
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// --- Card Toggle Logic ---
function toggleCard(event) {
    // Avoid toggling card if mute button is clicked
    if (event && event.target.closest('#sound-toggle')) return;

    // Ensure ambient has started on first interaction
    if (!firstUserInteraction) {
        firstUserInteraction = true;
        startAmbient();
    }

    cardOpen = !cardOpen;

    if (cardOpen) {
        const card = getCardElement();
        if (card) card.classList.add('open');
        targetAngle = Math.PI;

        // Spawn bats from the crease
        const rect = getCardElement() ? getCardElement().getBoundingClientRect() : { left: 0, top: 0, height: 0, width: 0 };
        const creaseX = rect.left;
        const centerY = rect.top + rect.height / 2;
        spawnBats(creaseX, centerY);

        // Reset webs
        initWebStrands();

        // On FIRST card open: stop ambient, play laugh, start music
        if (!musicStarted) {
            stopAmbient();
            playEvilLaugh();
            startMusic();
        }
        // On subsequent opens: music is already running, nothing to change
    } else {
        const card = getCardElement();
        if (card) card.classList.remove('open');
        targetAngle = 0;
        // Music keeps playing when card closes
    }
}

// --- Main Animation Loop ---
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Smoothly interpolate cover angle
    // Using a fast spring-like step to match CSS transitions
    openingAngle += (targetAngle - openingAngle) * 0.08;
    
    const card = getCardElement();
    const rect = card ? card.getBoundingClientRect() : { left: 0, top: 0, height: 0 };
    // Crease is at the left edge of the card container
    const creaseX = rect.left;
    const cardTop = rect.top;
    const cardHeight = rect.height;
    
    // Draw and update Webs
    if (openingAngle > 0.01) {
        webStrands.forEach(strand => {
            const pts = strand.update(creaseX, cardTop, cardHeight, openingAngle);
            strand.draw(pts.xLeft, pts.xRight, pts.y);
        });
    }
    
    // Draw and update Bats
    for (let i = bats.length - 1; i >= 0; i--) {
        const bat = bats[i];
        bat.update();
        bat.draw();
        // Remove dead/offscreen bats
        if (bat.opacity <= 0 || bat.y < -50) {
            bats.splice(i, 1);
        }
    }
}

// --- Event Listeners ---
window.addEventListener('resize', resizeCanvas);
if (getCardElement()) {
    getCardElement().addEventListener('click', toggleCard);
}

document.getElementById('sound-toggle').addEventListener('click', (e) => {
    e.stopPropagation();
    isMuted = !isMuted;
    // If user un-mutes before any interaction, start ambient
    if (!isMuted && !firstUserInteraction) {
        firstUserInteraction = true;
        startAmbient();
    }
    applyMuteState();
    setSoundBtnIcon();
});

// On first click/touch anywhere on the page, start ambient
// (browser autoplay policy: audio requires user gesture)
function handleFirstInteraction() {
    if (firstUserInteraction) return;
    firstUserInteraction = true;
    startAmbient();
}
document.addEventListener('click', handleFirstInteraction, { once: true });
document.addEventListener('touchstart', handleFirstInteraction, { once: true });

// Initial Setup
resizeCanvas();
initWebStrands();
setSoundBtnIcon(); // set to unmuted icon initially
requestAnimationFrame(animate);
