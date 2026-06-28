/**
 * Digital Halloween Invitation Card
 * Logic for Card Opening, Canvas Spiderwebs & Bats, and Spooky Web Audio Synth.
 */

// --- Global States (using var for TDZ safety in tests) ---
var cardOpen = false;
var openingAngle = 0; // 0 to Math.PI (0 to 180 degrees)
var targetAngle = 0;
var firstUserInteraction = false;
var audioCtxAmbient = null;
var ambientStarted = false;
var musicStarted = false;
var isMuted = false;
var spookyAudio = null;

// Export variables/functions to window for QUnit tests (placed at top for early access)
window.cardApp = {
    getCardOpen: () => cardOpen,
    setCardOpen: (v) => { cardOpen = v; },
    getMusicStarted: () => musicStarted,
    setMusicStarted: (v) => { musicStarted = v; },
    getSpookyAudio: () => spookyAudio,
    setSpookyAudio: (audioObj) => { spookyAudio = audioObj; },
    getIsMuted: () => isMuted,
    setIsMuted: (v) => { isMuted = v; },
    toggleCard: (e) => toggleCard(e),
    startMusic: () => startMusic()
};

// Canvas setup
const canvas = document.getElementById('animation-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
// Helper to get active card element (prevents stale refs in unit test suites)
function getCardElement() {
    return document.getElementById('halloween-card');
}

// Bats & Webs arrays
const bats = [];
const webStrands = [];
const MAX_BATS = 25;

// Bat silhouette — body + ears + articulated wings with wingtip fingers
// NOTE: no shadowBlur — too expensive on mobile canvas
function drawBatPath(c, x, y, width, height, flapFactor) {
    c.save();
    c.translate(x, y);
    const flap = Math.abs(flapFactor); // 0..1

    c.fillStyle = '#180e28';

    // ── Body ─────────────────────────────────────────────
    c.beginPath();
    c.ellipse(0, height * 0.05, width * 0.07, height * 0.18, 0, 0, Math.PI * 2);
    c.fill();

    // ── Ears ──────────────────────────────────────────────
    c.beginPath();
    c.moveTo(-width * 0.055, -height * 0.06);
    c.lineTo(-width * 0.12, -height * 0.34 - flap * height * 0.04);
    c.lineTo(-width * 0.01, -height * 0.07);
    c.moveTo( width * 0.055, -height * 0.06);
    c.lineTo( width * 0.12, -height * 0.34 - flap * height * 0.04);
    c.lineTo( width * 0.01, -height * 0.07);
    c.fill();

    // ── Wings ─────────────────────────────────────────────
    const wingDip = -flap * height * 0.45;
    // Left
    c.beginPath();
    c.moveTo(-width * 0.07, height * 0.0);
    c.quadraticCurveTo(-width * 0.28, wingDip, -width * 0.50, -flap * height * 0.08);
    c.quadraticCurveTo(-width * 0.40, height * 0.14, -width * 0.33, height * 0.18);
    c.quadraticCurveTo(-width * 0.26, height * 0.08, -width * 0.22, height * 0.20);
    c.quadraticCurveTo(-width * 0.16, height * 0.10, -width * 0.12, height * 0.22);
    c.quadraticCurveTo(-width * 0.08, height * 0.14, -width * 0.07, height * 0.12);
    c.closePath();
    c.fill();
    // Right (mirror)
    c.beginPath();
    c.moveTo( width * 0.07, height * 0.0);
    c.quadraticCurveTo( width * 0.28, wingDip,  width * 0.50, -flap * height * 0.08);
    c.quadraticCurveTo( width * 0.40, height * 0.14,  width * 0.33, height * 0.18);
    c.quadraticCurveTo( width * 0.26, height * 0.08,  width * 0.22, height * 0.20);
    c.quadraticCurveTo( width * 0.16, height * 0.10,  width * 0.12, height * 0.22);
    c.quadraticCurveTo( width * 0.08, height * 0.14,  width * 0.07, height * 0.12);
    c.closePath();
    c.fill();

    // ── Eyes (flat fill, no shadow) ───────────────────────
    c.fillStyle = '#cc2200';
    c.beginPath();
    c.ellipse(-width * 0.025, -height * 0.04, width * 0.018, height * 0.022, 0, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.ellipse( width * 0.025, -height * 0.04, width * 0.018, height * 0.022, 0, 0, Math.PI * 2);
    c.fill();

    c.restore();
}

// --- Audio System ---
// Phase 2: Evil laugh (plays once when card opens for the first time)
// Phase 3: RHPS music (starts after laugh, persists through card close/reopen)


// --- Sound Button State ---
function setSoundBtnIcon() {
    const btn = document.getElementById('sound-toggle');
    if (!btn) return;
    btn.innerHTML = isMuted ? '🔇' : '🔊';
    btn.setAttribute('aria-label', isMuted ? 'Ton einschalten' : 'Ton ausschalten');
}

// ── 2. EVIL LAUGH (MP3) ──────────────────────────────────────────────────
function playEvilLaugh(onEnded) {
    try {
        const laugh = new Audio('assets/evil_laugh.mp3');
        laugh.volume = isMuted ? 0 : 0.7;
        laugh.play().catch(e => console.log('Laugh play blocked:', e));
        laugh.addEventListener('ended', () => {
            if (typeof onEnded === 'function') onEnded();
        });
        // Fallback: if ended event never fires within 10s, call onEnded anyway
        setTimeout(() => {
            if (typeof onEnded === 'function') onEnded();
        }, 10000);
    } catch(e) {
        console.log('Laugh MP3 failed:', e);
        if (typeof onEnded === 'function') onEnded();
    }
}
// ── 3. RHPS MUSIC (MP3) ──────────────────────────────────────────────────
function startMusic() {
    if (!spookyAudio) {
        spookyAudio = new Audio('assets/rhps_time_warp_song_cut.mp3');
        spookyAudio.loop = true;
        spookyAudio.volume = isMuted ? 0 : 0.35;
    }
    musicStarted = true;
    
    // Crucial: Only play if card remains open!
    if (cardOpen && !isMuted) {
        spookyAudio.play().catch(e => console.log('Music play blocked:', e));
    }
}
// ── MUTE CONTROL ─────────────────────────────────────────────────────────
function applyMuteState() {
    if (spookyAudio) {
        spookyAudio.volume = isMuted ? 0 : 0.35;
    }
    setSoundBtnIcon();
}

// Compatibility alias used elsewhere in the code
function initSynth() { }
function updateMuteState() { applyMuteState(); }
function synthRunning() { return musicStarted; }

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
        // More visible: orange-tinted strands with glow
        ctx.strokeStyle = this.snapped
            ? `rgba(210, 180, 140, ${this.opacity * (1 - this.snapProgress)})`
            : `rgba(235, 215, 180, ${this.opacity})`;
        ctx.lineWidth = this.snapped ? Math.max(0.3, 2.2 * (1 - this.snapProgress)) : 2.2;
        ctx.lineCap = 'round';
        ctx.shadowColor = 'rgba(255, 180, 80, 0.35)';
        ctx.shadowBlur = 4;
        ctx.beginPath();

        if (!this.snapped) {
            const midX = (xLeft + xRight) / 2;
            const midY = y + this.slack;
            ctx.moveTo(xLeft, y);
            ctx.quadraticCurveTo(midX, midY, xRight, y);
            ctx.stroke();
        } else {
            if (this.snapProgress < 1) {
                const midX = (xLeft + xRight) / 2;
                const snapX = midX;
                const snapY = y + this.slack;

                const leftEndX  = xLeft  + (snapX - xLeft)  * (1 - this.snapProgress);
                const leftEndY  = y      + (snapY - y)       * (1 - this.snapProgress);
                ctx.moveTo(xLeft, y);
                ctx.quadraticCurveTo((xLeft + leftEndX) / 2, y + this.slack / 2, leftEndX, leftEndY);

                const rightEndX = xRight - (xRight - snapX) * (1 - this.snapProgress);
                const rightEndY = y      + (snapY - y)       * (1 - this.snapProgress);
                ctx.moveTo(xRight, y);
                ctx.quadraticCurveTo((xRight + rightEndX) / 2, y + this.slack / 2, rightEndX, rightEndY);

                ctx.stroke();
            }
        }
        ctx.shadowBlur = 0;
    }
}

// --- Setup/Initialize Web Strands ---
function initWebStrands() {
    webStrands.length = 0;
    // 12 strands for better visibility
    for (let i = 0; i < 12; i++) {
        const relY = 0.08 + (i * 0.075) + Math.random() * 0.03;
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
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// --- Card Toggle Logic ---
function toggleCard(event) {
    // Avoid toggling card if mute button is clicked
    if (event && event.target.closest('#sound-toggle')) return;

    if (!firstUserInteraction) {
        firstUserInteraction = true;
    }

    cardOpen = !cardOpen;

    const card = getCardElement();
    const perspective = card ? card.closest('.card-perspective') : null;

    if (cardOpen) {
        if (card) card.classList.add('open');
        if (perspective) perspective.classList.add('card-open');
        targetAngle = Math.PI;

        // Spawn bats from the crease
        const rect = getCardElement() ? getCardElement().getBoundingClientRect() : { left: 0, top: 0, height: 0, width: 0 };
        const creaseX = rect.left + rect.width * 0.5; // center of card for mobile
        const centerY = rect.top + rect.height * 0.35;
        spawnBats(creaseX, centerY);

        // Reset webs
        initWebStrands();

        // On FIRST card open: play laugh, then start music after laugh ends
        if (!musicStarted) {
            playEvilLaugh(() => startMusic());
        } else {
            // On subsequent opens: resume music if it was paused
            if (spookyAudio && !isMuted) {
                spookyAudio.play().catch(e => console.log('Music play blocked:', e));
            }
        }

        // Mobile Phase 2: after 3D flip completes, slide inner-right page in below
        if (window.innerWidth <= 600) {
            setTimeout(() => {
                if (perspective) perspective.classList.add('card-pages-visible');
            }, 1300);
        }
    } else {
        if (card) card.classList.remove('open');
        if (perspective) {
            perspective.classList.remove('card-open');
            perspective.classList.remove('card-pages-visible');
        }
        targetAngle = 0;
        
        // Pause music when card closes
        if (spookyAudio) {
            spookyAudio.pause();
        }
    }
}

// --- Main Animation Loop ---
function animate() {
    requestAnimationFrame(animate);
    if (!ctx) return; // safety check for headless or test environments
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

// Event delegation for sound-toggle to survive QUnit fixture teardowns
document.addEventListener('click', (e) => {
    const btn = e.target.closest('#sound-toggle');
    if (btn) {
        e.stopPropagation();
        isMuted = !isMuted;
        applyMuteState();
        setSoundBtnIcon();
    }
});

// On first click/touch anywhere on the page, flag first interaction (but no ambient synth starts)
function handleFirstInteraction() {
    if (firstUserInteraction) return;
    firstUserInteraction = true;
}
document.addEventListener('click', handleFirstInteraction, { once: true });
document.addEventListener('touchstart', handleFirstInteraction, { once: true });

// Initial Setup
if (canvas) {
    resizeCanvas();
    initWebStrands();
    setSoundBtnIcon(); // set to unmuted icon initially
    requestAnimationFrame(animate);
}
