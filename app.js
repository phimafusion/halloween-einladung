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

// --- Audio setup ---
let spookyAudio = null;

function initSynth() {
    if (synthRunning) return;
    try {
        if (!spookyAudio) {
            spookyAudio = new Audio('assets/rhps_time_warp_song_cut.mp3');
            spookyAudio.loop = true;
            spookyAudio.volume = 0.3; // atmospheric volume
        }
        spookyAudio.play().catch(e => console.log("Audio play blocked by browser:", e));
    } catch(err) {
        console.log("Audio not supported or mocked:", err);
    }
    synthRunning = true;
}

function updateMuteState() {
    const soundBtn = document.getElementById('sound-toggle');
    if (isMuted) {
        if (spookyAudio) {
            spookyAudio.muted = true;
        }
        soundBtn.innerHTML = '🔇';
        soundBtn.setAttribute('aria-label', 'Ton einschalten');
    } else {
        initSynth();
        if (spookyAudio) {
            spookyAudio.muted = false;
            try {
                spookyAudio.play().catch(e => console.log("Audio play blocked by browser:", e));
            } catch(err) {}
        }
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
