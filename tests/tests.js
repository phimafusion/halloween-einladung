QUnit.module('Halloween Invitation Card Tests', function(hooks) {

    hooks.beforeEach(function() {
        // Reset states before each test
        cardOpen = false;
        openingAngle = 0;
        targetAngle = 0;
        isMuted = true;
        bats.length = 0;
        initWebStrands();
        if (getCardElement()) {
            getCardElement().classList.remove('open');
        }
    });

    QUnit.test('Initial State Configuration', function(assert) {
        assert.strictEqual(cardOpen, false, 'Card should start in closed state');
        assert.strictEqual(openingAngle, 0, 'Opening angle should start at 0');
        assert.strictEqual(targetAngle, 0, 'Target angle should start at 0');
        assert.strictEqual(isMuted, true, 'Audio should start muted');
        assert.strictEqual(bats.length, 0, 'No bats should exist initially');
    });

    QUnit.test('Card Open State Toggle', function(assert) {
        // Call toggle function
        toggleCard({ target: getCardElement() });
        
        assert.strictEqual(cardOpen, true, 'Card should transition to open');
        assert.strictEqual(targetAngle, Math.PI, 'Target angle should be Math.PI (180 degrees) when open');
        assert.ok(getCardElement().classList.contains('open'), 'Card element should have "open" class');
        assert.ok(bats.length > 0, 'Opening the card should trigger bat spawning');
        
        // Toggle again to close
        toggleCard({ target: getCardElement() });
        assert.strictEqual(cardOpen, false, 'Card should transition to closed');
        assert.strictEqual(targetAngle, 0, 'Target angle should return to 0');
        assert.notOk(getCardElement().classList.contains('open'), 'Card element should not have "open" class');
    });

    QUnit.test('Spiderweb Generation & Snapping State', function(assert) {
        assert.strictEqual(webStrands.length, 8, 'Should initialize exactly 8 web strands');
        
        // Verify web strand structure
        const strand = webStrands[0];
        assert.ok(strand.relY >= 0.15 && strand.relY <= 0.95, 'Strand relY should be within expected vertical distribution');
        assert.strictEqual(strand.snapped, false, 'Strands should start unsnapped');

        // Test update coords & snap detection
        // Mock a crease position and card sizes
        const creaseX = 200;
        const cardTop = 50;
        const cardHeight = 400;
        
        // Update at angle = 0
        let coords = strand.update(creaseX, cardTop, cardHeight, 0);
        assert.ok(coords.xLeft > creaseX, 'At 0 degrees, left attach point is right of crease');
        assert.strictEqual(strand.snapped, false, 'Strand must not snap at 0 degrees');

        // Update at opening angle > 1.25 rad (e.g. 1.5 rad)
        strand.update(creaseX, cardTop, cardHeight, 1.5);
        assert.strictEqual(strand.snapped, true, 'Strand should snap when opening angle exceeds 1.25 radians');
    });

    QUnit.test('Bat Spawning and Particle Animation Physics', function(assert) {
        // Spawn bats at position (150, 300)
        spawnBats(150, 300);
        
        assert.strictEqual(bats.length, 25, 'Should spawn exactly 25 bats');
        
        const testBat = bats[0];
        assert.strictEqual(testBat.x, 150, 'Bat spawn X should match crease X');
        assert.ok(testBat.y >= 250 && testBat.y <= 350, 'Bat spawn Y should be clustered near crease Y');
        assert.ok(testBat.vy < 0, 'Bat should have upwards vertical velocity (vy < 0)');
        
        // Run update frame
        const initialY = testBat.y;
        testBat.update();
        assert.ok(testBat.y < initialY, 'Bat should move upwards in the next frame');
        assert.ok(testBat.opacity < 1.0, 'Bat opacity should decay on update');
    });
});
