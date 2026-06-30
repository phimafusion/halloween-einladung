/**
 * Digital Halloween Invitation Card
 * Logic for Card Opening, Canvas Spiderwebs & Bats, and Spooky Web Audio Synth.
 */

// --- Audio System ---
class AudioManager {
    constructor() {
        this.isMuted = false;
        this.musicStarted = false;
        this.spookyAudio = null;
        this.currentLaughAudio = null;
        
        this.updateBtnIcon();
    }

    updateBtnIcon() {
        const btn = document.getElementById('sound-toggle');
        if (!btn) return;
        btn.innerHTML = this.isMuted ? '🔇' : '🔊';
        btn.setAttribute('aria-label', this.isMuted ? 'Ton einschalten' : 'Ton ausschalten');
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.spookyAudio) {
            this.spookyAudio.volume = this.isMuted ? 0 : 0.35;
        }
        if (this.currentLaughAudio) {
            this.currentLaughAudio.volume = this.isMuted ? 0 : 0.7;
        }
        this.updateBtnIcon();
    }

    playEvilLaugh(onEnded) {
        try {
            this.currentLaughAudio = new Audio('assets/evil_laugh.mp3');
            this.currentLaughAudio.volume = this.isMuted ? 0 : 0.7;
            this.currentLaughAudio.play().catch(e => console.log('Laugh play blocked:', e));
            this.currentLaughAudio.addEventListener('ended', () => {
                this.currentLaughAudio = null;
                if (typeof onEnded === 'function') onEnded();
            });
            setTimeout(() => {
                this.currentLaughAudio = null;
                if (typeof onEnded === 'function') onEnded();
            }, 10000);
        } catch(e) {
            console.log('Laugh MP3 failed:', e);
            if (typeof onEnded === 'function') onEnded();
        }
    }

    startMusic(isCardOpen) {
        if (!this.spookyAudio) {
            this.spookyAudio = new Audio('assets/rhps_time_warp_song_cut.mp3');
            this.spookyAudio.loop = true;
            this.spookyAudio.volume = this.isMuted ? 0 : 0.35;
        }
        this.musicStarted = true;
        if (isCardOpen && !this.isMuted) {
            this.spookyAudio.play().catch(e => console.log('Music play blocked:', e));
        }
    }

    pauseAllAudio() {
        if (this.spookyAudio && !this.spookyAudio.paused) this.spookyAudio.pause();
        if (this.currentLaughAudio && !this.currentLaughAudio.paused) this.currentLaughAudio.pause();
    }

    resumeAudio(isCardOpen) {
        if (isCardOpen && !this.isMuted && this.spookyAudio) {
            this.spookyAudio.play().catch(e => console.log('Music resume blocked:', e));
        }
    }
}

// --- Particles & Physics ---
function drawBatPath(c, x, y, width, height, flapFactor) {
    c.save();
    c.translate(x, y);
    const flap = Math.abs(flapFactor); 

    c.fillStyle = '#180e28';
    c.beginPath();
    c.ellipse(0, height * 0.05, width * 0.07, height * 0.18, 0, 0, Math.PI * 2);
    c.fill();

    c.beginPath();
    c.moveTo(-width * 0.055, -height * 0.06);
    c.lineTo(-width * 0.12, -height * 0.34 - flap * height * 0.04);
    c.lineTo(-width * 0.01, -height * 0.07);
    c.moveTo( width * 0.055, -height * 0.06);
    c.lineTo( width * 0.12, -height * 0.34 - flap * height * 0.04);
    c.lineTo( width * 0.01, -height * 0.07);
    c.fill();

    const wingDip = -flap * height * 0.45;
    c.beginPath();
    c.moveTo(-width * 0.07, height * 0.0);
    c.quadraticCurveTo(-width * 0.28, wingDip, -width * 0.50, -flap * height * 0.08);
    c.quadraticCurveTo(-width * 0.40, height * 0.14, -width * 0.33, height * 0.18);
    c.quadraticCurveTo(-width * 0.26, height * 0.08, -width * 0.22, height * 0.20);
    c.quadraticCurveTo(-width * 0.16, height * 0.10, -width * 0.12, height * 0.22);
    c.quadraticCurveTo(-width * 0.08, height * 0.14, -width * 0.07, height * 0.12);
    c.closePath();
    c.fill();
    
    c.beginPath();
    c.moveTo( width * 0.07, height * 0.0);
    c.quadraticCurveTo( width * 0.28, wingDip,  width * 0.50, -flap * height * 0.08);
    c.quadraticCurveTo( width * 0.40, height * 0.14,  width * 0.33, height * 0.18);
    c.quadraticCurveTo( width * 0.26, height * 0.08,  width * 0.22, height * 0.20);
    c.quadraticCurveTo( width * 0.16, height * 0.10,  width * 0.12, height * 0.22);
    c.quadraticCurveTo( width * 0.08, height * 0.14,  width * 0.07, height * 0.12);
    c.closePath();
    c.fill();

    c.fillStyle = '#cc2200';
    c.beginPath();
    c.ellipse(-width * 0.025, -height * 0.04, width * 0.018, height * 0.022, 0, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.ellipse( width * 0.025, -height * 0.04, width * 0.018, height * 0.022, 0, 0, Math.PI * 2);
    c.fill();

    c.restore();
}

class Bat {
    constructor(startX, startY) {
        this.x = startX;
        this.y = startY;
        this.width = 24 + Math.random() * 40;
        this.height = this.width * 0.5;
        this.vx = (Math.random() - 0.5) * 3;
        this.vy = -1.2 - Math.random() * 2.0;
        this.flapSpeed = 0.08 + Math.random() * 0.12;
        this.flapPhase = Math.random() * Math.PI * 2;
        this.opacity = 1;
        this.scale = 1.0 + Math.random() * 0.8;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.flapPhase += this.flapSpeed;
        this.x += Math.sin(this.flapPhase) * 0.4;
        this.opacity -= 0.004;
        if (this.scale > 0.1) this.scale -= 0.001;
    }

    draw(ctx) {
        const currentFlap = Math.sin(this.flapPhase);
        ctx.globalAlpha = Math.max(0, this.opacity);
        drawBatPath(ctx, this.x, this.y, this.width * this.scale, this.height * this.scale, currentFlap);
        ctx.globalAlpha = 1;
    }
}

class WebStrand {
    constructor(relX) {
        this.relX = relX;
        this.length = 80 + Math.random() * 200;
        this.phase = Math.random() * Math.PI * 2;
        this.speed = 0.005 + Math.random() * 0.015;
        this.sway = 10 + Math.random() * 20;
        this.opacity = 0.15 + Math.random() * 0.25;
    }

    draw(ctx, canvasWidth) {
        this.phase += this.speed;
        const x = this.relX * canvasWidth;
        const currentSway = Math.sin(this.phase) * this.sway;
        
        ctx.strokeStyle = `rgba(235, 215, 180, ${this.opacity})`;
        ctx.lineWidth = 0.8; // Sehr feine Fäden
        ctx.beginPath();
        ctx.moveTo(x, 0);
        
        // Zeichnet einen leicht geschwungenen, hängenden Faden
        ctx.quadraticCurveTo(x + currentSway * 0.5, this.length * 0.5, x + currentSway, this.length);
        ctx.stroke();
    }
}

class AnimationEngine {
    constructor() {
        this.bats = [];
        this.webStrands = [];
        this.openingAngle = 0;
        this.targetAngle = 0;
        this.MAX_BATS = 25;
        
        if (this.canvas) {
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
            this.initWebStrands();
            requestAnimationFrame(() => this.animate());
        }
    }

    get canvas() { return document.getElementById('animation-canvas'); }
    get ctx() { return this.canvas ? this.canvas.getContext('2d') : null; }
    get cardElement() { return document.getElementById('halloween-card'); }

    resizeCanvas() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    initWebStrands() {
        this.webStrands = [];
        // Fäden auf der linken Seite (0% bis 15% der Bildschirmbreite)
        for (let i = 0; i < 8; i++) {
            this.webStrands.push(new WebStrand(Math.random() * 0.15));
        }
        // Fäden auf der rechten Seite (85% bis 100% der Bildschirmbreite)
        for (let i = 0; i < 8; i++) {
            this.webStrands.push(new WebStrand(0.85 + Math.random() * 0.15));
        }
    }

    spawnBats(x, y) {
        for (let i = 0; i < this.MAX_BATS; i++) {
            this.bats.push(new Bat(x, y + (Math.random() - 0.5) * 100));
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.openingAngle += (this.targetAngle - this.openingAngle) * 0.08;
        
        // Zeichne die hängenden Fäden dauerhaft im Hintergrund
        this.webStrands.forEach(strand => {
            strand.draw(this.ctx, this.canvas.width);
        });
        
        for (let i = this.bats.length - 1; i >= 0; i--) {
            const bat = this.bats[i];
            bat.update();
            bat.draw(this.ctx);
            if (bat.opacity <= 0 || bat.y < -50) {
                this.bats.splice(i, 1);
            }
        }
    }
}

class CardController {
    constructor(audioManager, animationEngine) {
        this.audioManager = audioManager;
        this.animationEngine = animationEngine;
        this.cardOpen = false;
        
        // Event delegation for the card toggle
        document.addEventListener('click', (e) => {
            const card = e.target.closest('#halloween-card');
            if (card) {
                this.toggleCard(e);
            }
        });

        // Setup sound toggle
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('#sound-toggle');
            if (btn) {
                e.stopPropagation();
                this.audioManager.toggleMute();
            }
        });

        this.setupVisibilityHandling();
    }

    get cardElement() {
        return document.getElementById('halloween-card');
    }

    toggleCard(event) {
        if (event && event.target && event.target.closest('#sound-toggle')) return;

        this.cardOpen = !this.cardOpen;
        document.body.classList.toggle('card-is-open', this.cardOpen);

        const perspective = this.cardElement ? this.cardElement.closest('.card-perspective') : null;

        if (this.cardOpen) {
            if (this.cardElement) this.cardElement.classList.add('open');
            if (perspective) perspective.classList.add('card-open');
            this.animationEngine.targetAngle = Math.PI;

            const rect = this.cardElement ? this.cardElement.getBoundingClientRect() : { left: 0, top: 0, height: 0, width: 0 };
            const creaseX = rect.left + rect.width * 0.5; 
            const centerY = rect.top + rect.height * 0.35;
            this.animationEngine.spawnBats(creaseX, centerY);
            this.animationEngine.initWebStrands();

            if (!this.audioManager.musicStarted) {
                this.audioManager.playEvilLaugh(() => this.audioManager.startMusic(this.cardOpen));
            } else {
                if (this.audioManager.spookyAudio && !this.audioManager.isMuted) {
                    this.audioManager.spookyAudio.play().catch(e => console.log('Music play blocked:', e));
                }
            }

            if (window.innerWidth <= 600) {
                setTimeout(() => {
                    if (perspective) perspective.classList.add('card-pages-visible');
                }, 1200);
            }
        } else {
            if (this.cardElement) this.cardElement.classList.remove('open');
            if (perspective) {
                perspective.classList.remove('card-open');
                perspective.classList.remove('card-pages-visible');
            }
            this.animationEngine.targetAngle = 0;
            
            this.audioManager.pauseAllAudio();
        }
    }

    setupVisibilityHandling() {
        const handlePause = () => this.audioManager.pauseAllAudio();
        const handleResume = () => {
            if (!document.hidden && document.visibilityState !== 'hidden') {
                this.audioManager.resumeAudio(this.cardOpen);
            }
        };

        document.addEventListener("visibilitychange", () => {
            if (document.hidden || document.visibilityState === 'hidden') handlePause();
            else handleResume();
        });

        window.addEventListener("blur", handlePause);
        window.addEventListener("pagehide", handlePause);
        window.addEventListener("focus", handleResume);

        setInterval(() => {
            if (document.hidden || document.visibilityState === 'hidden') {
                handlePause();
            }
        }, 500);
    }
}

// Inject SVGs
function injectSVGs() {
    if (window.SvgData) {
        const leftContainer = document.getElementById('left-deco-container');
        if (leftContainer) leftContainer.innerHTML = window.SvgData.leftDeco;
        
        const rightContainer = document.getElementById('right-deco-container');
        if (rightContainer) rightContainer.innerHTML = window.SvgData.rightDeco;
    }
}

// App Initialization
injectSVGs();
const audioManager = new AudioManager();
const animationEngine = new AnimationEngine();
const cardController = new CardController(audioManager, animationEngine);

// Export for tests
window.cardApp = {
    audioManager,
    animationEngine,
    cardController,
    injectSVGs,
    getCardElement: () => document.getElementById('halloween-card')
};
