QUnit.module('Halloween Invitation Card Tests', function(hooks) {

    hooks.beforeEach(function() {
        // Reset states using the new OOP structure
        if (window.cardApp) {
            window.cardApp.cardController.cardOpen = false;
            window.cardApp.animationEngine.openingAngle = 0;
            window.cardApp.animationEngine.targetAngle = 0;
            window.cardApp.audioManager.isMuted = true;
            window.cardApp.animationEngine.bats = [];
            window.cardApp.animationEngine.initWebStrands();
            
            const card = window.cardApp.getCardElement();
            if (card) {
                card.classList.remove('open');
            }
        }
    });

    QUnit.test('Initial State Configuration', function(assert) {
        assert.ok(window.cardApp, 'cardApp should be initialized');
        assert.strictEqual(window.cardApp.cardController.cardOpen, false, 'Card should start in closed state');
        assert.strictEqual(window.cardApp.animationEngine.openingAngle, 0, 'Opening angle should start at 0');
        assert.strictEqual(window.cardApp.animationEngine.targetAngle, 0, 'Target angle should start at 0');
        assert.strictEqual(window.cardApp.audioManager.isMuted, true, 'Audio should start muted');
        assert.strictEqual(window.cardApp.animationEngine.bats.length, 0, 'No bats should exist initially');
    });

    QUnit.test('Card Open State Toggle', function(assert) {
        // Call toggle function
        window.cardApp.cardController.toggleCard({ target: window.cardApp.getCardElement() });
        
        assert.strictEqual(window.cardApp.cardController.cardOpen, true, 'Card should transition to open');
        assert.strictEqual(window.cardApp.animationEngine.targetAngle, Math.PI, 'Target angle should be Math.PI (180 degrees) when open');
        
        const card = window.cardApp.getCardElement();
        if (card) {
            assert.ok(card.classList.contains('open'), 'Card element should have "open" class');
        }
        
        assert.ok(window.cardApp.animationEngine.bats.length > 0, 'Opening the card should trigger bat spawning');
        
        // Toggle again to close
        window.cardApp.cardController.toggleCard({ target: window.cardApp.getCardElement() });
        assert.strictEqual(window.cardApp.cardController.cardOpen, false, 'Card should transition to closed');
        assert.strictEqual(window.cardApp.animationEngine.targetAngle, 0, 'Target angle should return to 0');
        if (card) {
            assert.notOk(card.classList.contains('open'), 'Card element should not have "open" class');
        }
    });

    QUnit.test('Spiderweb Generation & Snapping State', function(assert) {
        assert.strictEqual(window.cardApp.animationEngine.webStrands.length, 12, 'Should initialize exactly 12 web strands');
        
        // Verify web strand structure
        const strand = window.cardApp.animationEngine.webStrands[0];
        assert.ok(strand.relY >= 0.08 && strand.relY <= 0.95, 'Strand relY should be within expected vertical distribution');
        assert.strictEqual(strand.snapped, false, 'Strands should start unsnapped');

        // Test update coords & snap detection
        const creaseX = 200;
        const cardTop = 50;
        const cardHeight = 400;
        const cardW = 300;
        
        // Update at angle = 0
        let coords = strand.update(creaseX, cardTop, cardHeight, 0, cardW);
        assert.ok(coords.xLeft > creaseX, 'At 0 degrees, left attach point is right of crease');
        assert.strictEqual(strand.snapped, false, 'Strand must not snap at 0 degrees');

        // Update at opening angle > 1.25 rad (e.g. 1.5 rad)
        strand.update(creaseX, cardTop, cardHeight, 1.5, cardW);
        assert.strictEqual(strand.snapped, true, 'Strand should snap when opening angle exceeds 1.25 radians');
    });

    QUnit.test('Bat Spawning and Particle Animation Physics', function(assert) {
        window.cardApp.animationEngine.bats = [];
        window.cardApp.animationEngine.spawnBats(150, 300);
        
        assert.strictEqual(window.cardApp.animationEngine.bats.length, 25, 'Should spawn exactly 25 bats');
        
        const testBat = window.cardApp.animationEngine.bats[0];
        assert.strictEqual(testBat.x, 150, 'Bat spawn X should match crease X');
        assert.ok(testBat.y >= 250 && testBat.y <= 350, 'Bat spawn Y should be clustered near crease Y');
        assert.ok(testBat.vy < 0, 'Bat should have upwards vertical velocity (vy < 0)');
        
        // Run update frame
        const initialY = testBat.y;
        testBat.update();
        assert.ok(testBat.y < initialY, 'Bat should move upwards in the next frame');
        assert.ok(testBat.opacity < 1.0, 'Bat opacity should decay on update');
    });

    QUnit.test('Audio Mute Toggle', function(assert) {
        window.cardApp.audioManager.isMuted = false;
        const initialMuteState = window.cardApp.audioManager.isMuted;

        // Toggle via the manager
        window.cardApp.audioManager.toggleMute();

        assert.notStrictEqual(window.cardApp.audioManager.isMuted, initialMuteState, 'Mute state should toggle');
    });

    QUnit.test('Audio Pauses on Card Close', function(assert) {
        let spookyPaused = false;
        let laughPaused = false;

        // Mock audio objects
        window.cardApp.audioManager.spookyAudio = { pause: () => { spookyPaused = true; }, paused: false };
        window.cardApp.audioManager.currentLaughAudio = { pause: () => { laughPaused = true; }, paused: false };
        
        window.cardApp.cardController.cardOpen = true;

        // Call toggle to close the card
        window.cardApp.cardController.toggleCard({ target: window.cardApp.getCardElement() });

        assert.strictEqual(window.cardApp.cardController.cardOpen, false, 'Card should be closed');
        assert.strictEqual(spookyPaused, true, 'spookyAudio.pause() should be called');
        assert.strictEqual(laughPaused, true, 'currentLaughAudio.pause() should be called');
    });

    QUnit.test('SVG Injection', function(assert) {
        // Run inject method
        window.cardApp.injectSVGs();
        
        const leftContainer = document.getElementById('left-deco-container');
        const rightContainer = document.getElementById('right-deco-container');
        
        if (leftContainer && window.SvgData) {
            assert.ok(leftContainer.innerHTML.includes('<svg'), 'Left container should contain injected SVG markup');
        } else {
            assert.ok(true, 'Test environment missing DOM nodes or SVG data for injection');
        }
    });

});
