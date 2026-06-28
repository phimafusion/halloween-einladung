/**
 * Digital Halloween Invitation Card
 * Logic for Card Opening, Canvas Spiderwebs & Bats, and Spooky Web Audio Synth.
 */

// --- Global States ---
let cardOpen = false;
let openingAngle = 0; // 0 to Math.PI (0 to 180 degrees)
let targetAngle = 0;

// Audio context and synth nodes
let audioCtx = null;
let synthRunning = false;
let isMuted = true;
let droneNode = null;
let droneLfo = null;
let noiseNode = null;
let windFilter = null;
let masterGain = null;
let chimeTimer = null;

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

// --- Spooky Ambient Synthesizer ---
function initSynth() {
    if (audioCtx) return;
    
    // Create AudioContext
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
    
    // Master Gain
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0, audioCtx.currentTime); // Start silent
    masterGain.connect(audioCtx.destination);
    
    // 1. Low Spooky Drone
    // Oscillator 1: Sawtooth or Triangle at low frequency (55Hz / A1)
    const osc1 = audioCtx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(55, audioCtx.currentTime);
    
    // Oscillator 2: Detuned slightly (55.5Hz)
    const osc2 = audioCtx.createOscillator();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(55.5, audioCtx.currentTime);
    
    const droneFilter = audioCtx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(120, audioCtx.currentTime);
    
    const droneGain = audioCtx.createGain();
    droneGain.gain.setValueAtTime(0.06, audioCtx.currentTime); // Low volume
    
    // Connect Drone
    osc1.connect(droneFilter);
    osc2.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(masterGain);
    
    // Drone LFO to modulate volume slowly (creepy breathing effect)
    droneLfo = audioCtx.createOscillator();
    droneLfo.frequency.setValueAtTime(0.2, audioCtx.currentTime); // 0.2 Hz
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(0.02, audioCtx.currentTime);
    
    droneLfo.connect(lfoGain);
    lfoGain.connect(droneGain.gain);
    
    osc1.start();
    osc2.start();
    droneLfo.start();
    
    // 2. Wind sweep effect (filtered noise)
    // Generate white noise buffer
    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    
    noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;
    
    windFilter = audioCtx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.Q.setValueAtTime(3.0, audioCtx.currentTime);
    windFilter.frequency.setValueAtTime(400, audioCtx.currentTime);
    
    const windGain = audioCtx.createGain();
    windGain.gain.setValueAtTime(0.015, audioCtx.currentTime); // very quiet
    
    noiseNode.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(masterGain);
    
    noiseNode.start();
    
    // Animate wind filter sweeps
    setInterval(() => {
        if (!isMuted && audioCtx.state === 'running') {
            const now = audioCtx.currentTime;
            // Sweep frequency between 300Hz and 900Hz slowly
            const targetFreq = 300 + Math.random() * 600;
            const sweepDuration = 3 + Math.random() * 4;
            windFilter.frequency.exponentialRampToValueAtTime(targetFreq, now + sweepDuration);
        }
    }, 5000);
    
    // 3. Time Warp Spooky Sequencer
    nextNoteTime = audioCtx.currentTime;
    sequencerInterval = setInterval(scheduleNotes, 50);
    
    synthRunning = true;
}

// Time Warp Melody definition
const A3 = 220.00;
const C4 = 261.63;
const D4 = 293.66;
const E4 = 329.63;
const F4 = 349.23;
const G4 = 392.00;
const A4 = 440.00;
const R = 0; // Rest

const timeWarpMelody = [
    // It's just a jump to the left
    { f: E4, d: 0.5 }, { f: E4, d: 0.5 }, { f: E4, d: 0.5 }, { f: E4, d: 0.5 },
    { f: D4, d: 0.5 }, { f: C4, d: 0.5 }, { f: A3, d: 1.0 }, { f: R, d: 0.5 },
    // And then a step to the right
    { f: E4, d: 0.5 }, { f: E4, d: 0.5 }, { f: E4, d: 0.5 }, { f: E4, d: 0.5 },
    { f: G4, d: 0.5 }, { f: E4, d: 1.5 }, { f: R, d: 0.5 },
    // With your hands on your hips
    { f: E4, d: 0.5 }, { f: E4, d: 0.5 }, { f: E4, d: 0.5 }, { f: D4, d: 0.5 },
    { f: C4, d: 0.5 }, { f: A3, d: 1.0 }, { f: R, d: 0.5 },
    // You bring your knees in tight
    { f: E4, d: 0.5 }, { f: E4, d: 0.5 }, { f: E4, d: 0.5 }, { f: G4, d: 0.5 },
    { f: E4, d: 1.5 }, { f: R, d: 0.5 },
    // But it's the pelvic thrust
    { f: A4, d: 0.5 }, { f: A4, d: 0.5 }, { f: A4, d: 0.5 }, { f: G4, d: 0.5 },
    { f: F4, d: 0.5 }, { f: E4, d: 0.5 }, { f: D4, d: 1.0 }, { f: R, d: 0.5 },
    // That really drives you insane
    { f: E4, d: 0.5 }, { f: F4, d: 0.5 }, { f: G4, d: 0.5 }, { f: E4, d: 0.5 },
    { f: D4, d: 0.5 }, { f: C4, d: 1.5 }, { f: R, d: 0.5 },
    // Let's do the Time Warp again
    { f: A4, d: 1.0 }, { f: G4, d: 0.5 }, { f: E4, d: 0.5 }, { f: D4, d: 0.5 },
    { f: C4, d: 0.5 }, { f: A3, d: 2.0 }, { f: R, d: 1.0 },
    // Let's do the Time Warp again
    { f: A4, d: 1.0 }, { f: G4, d: 0.5 }, { f: E4, d: 0.5 }, { f: D4, d: 0.5 },
    { f: C4, d: 0.5 }, { f: A3, d: 2.0 }, { f: R, d: 2.0 }
];

let tempo = 100; // slower BPM for spooky feel
let beatDur = 60 / tempo;
let nextNoteTime = 0;
let noteIndex = 0;
let sequencerInterval = null;

function playSpookyNote(freq, startTime, duration) {
    if (!audioCtx || isMuted || audioCtx.state !== 'running') return;
    
    // Spooky triangle sound
    const osc = audioCtx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);
    
    // Add detune for chorus effect
    const osc2 = audioCtx.createOscillator();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(freq * 0.995, startTime);
    
    const noteGain = audioCtx.createGain();
    noteGain.gain.setValueAtTime(0, startTime);
    noteGain.gain.linearRampToValueAtTime(0.05, startTime + 0.05); // soft spooky attack
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + 0.4); // slightly longer release
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, startTime); // warm, dark spooky tone
    
    // Delay effect
    const delay = audioCtx.createDelay();
    delay.delayTime.setValueAtTime(0.25, startTime);
    const delayGain = audioCtx.createGain();
    delayGain.gain.setValueAtTime(0.2, startTime);
    
    // Connections
    osc.connect(filter);
    osc2.connect(filter);
    
    // Feed filter into noteGain and also into delay
    filter.connect(noteGain);
    filter.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(noteGain); // feedback
    
    noteGain.connect(masterGain);
    
    osc.start(startTime);
    osc.stop(startTime + duration + 0.5);
    osc2.start(startTime);
    osc2.stop(startTime + duration + 0.5);
}

function scheduleNotes() {
    if (!audioCtx || audioCtx.state !== 'running' || isMuted) return;
    
    while (nextNoteTime < audioCtx.currentTime + 0.1) {
        const item = timeWarpMelody[noteIndex];
        if (item.f !== R) {
            playSpookyNote(item.f, nextNoteTime, item.d * beatDur);
        }
        nextNoteTime += item.d * beatDur;
        noteIndex = (noteIndex + 1) % timeWarpMelody.length;
    }
}

function updateMuteState() {
    const soundBtn = document.getElementById('sound-toggle');
    if (isMuted) {
        masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
        soundBtn.innerHTML = '🔇';
        soundBtn.setAttribute('aria-label', 'Ton einschalten');
    } else {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        // Reset next note time so it doesn't try to catch up with past notes
        nextNoteTime = audioCtx.currentTime;
        masterGain.gain.linearRampToValueAtTime(1.0, audioCtx.currentTime + 0.5);
        soundBtn.innerHTML = '🔊';
        soundBtn.setAttribute('aria-label', 'Ton ausschalten');
    }
}

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
    
    cardOpen = !cardOpen;
    
    if (cardOpen) {
        const card = getCardElement();
        if (card) card.classList.add('open');
        targetAngle = Math.PI; // 180 degrees
        
        // Spawn bats from the crease
        const rect = getCardElement() ? getCardElement().getBoundingClientRect() : { left: 0, top: 0, height: 0, width: 0 };
        // Crease is on the left edge of the card container
        const creaseX = rect.left;
        const centerY = rect.top + rect.height / 2;
        spawnBats(creaseX, centerY);
        
        // Initialize/reset webs when opening
        initWebStrands();
        
        // Init & play audio
        initSynth();
        if (isMuted) {
            isMuted = false;
            updateMuteState();
        }
    } else {
        const card = getCardElement();
        if (card) card.classList.remove('open');
        targetAngle = 0;
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
    initSynth();
    isMuted = !isMuted;
    updateMuteState();
});

// Initial Setup
resizeCanvas();
initWebStrands();
requestAnimationFrame(animate);
