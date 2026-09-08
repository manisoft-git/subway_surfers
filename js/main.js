// ============================================================================
// Subway Surfers: Main Game Coordinator & Loop
// Three.js Scene, Camera Director, Touch Swipe Listener & State Machine
// ============================================================================

class SubwaySurfersGame {
    constructor() {
        this.container = document.getElementById('game-container');

        // Scene, Camera, Renderer
        this.scene = null;
        this.camera = null;
        this.renderer = null;

        // Subsystems
        this.particles = null;
        this.player = null;
        this.inspector = null;
        this.world = null;
        this.ui = null;

        // Game State
        this.state = 'START'; // 'START', 'RUNNING', 'PAUSED', 'GAMEOVER'
        this.baseSpeed = 16.0;
        this.currentSpeed = 16.0;
        this.maxSpeed = 30.0;
        this.speedRampRate = 0.08;

        this.score = 0;
        this.coinsCollected = 0;
        this.runDistance = 0;
        this.baseMultiplier = 1;

        // Word Hunt
        this.wordHunt = { S: false, U: false, R: false, F: false };

        // Timing
        this.clock = new THREE.Clock();
        this.lastTime = performance.now();

        this.initThree();
        this.initEntities();
        this.initControls();

        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Kick off render loop
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    initThree() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = TextureGenerator.createSkyTexture();
        this.scene.fog = new THREE.Fog(0x90caf9, 60, 220);

        // Camera (Subway Surfers dynamic third-person follow)
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(65, aspect, 0.1, 400);
        this.camera.position.set(0, 3.4, 6.5);

        // WebGL Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // Lighting (Vibrant tropical cartoon sunlight)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
        this.scene.add(ambientLight);

        const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x546e7a, 0.4);
        hemiLight.position.set(0, 50, 0);
        this.scene.add(hemiLight);

        const sunLight = new THREE.DirectionalLight(0xfffaed, 0.9);
        sunLight.position.set(20, 40, 25);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 1024;
        sunLight.shadow.mapSize.height = 1024;
        sunLight.shadow.camera.near = 10;
        sunLight.shadow.camera.far = 100;
        sunLight.shadow.camera.left = -15;
        sunLight.shadow.camera.right = 15;
        sunLight.shadow.camera.top = 20;
        sunLight.shadow.camera.bottom = -20;
        this.scene.add(sunLight);
    }

    initEntities() {
        this.particles = new ParticleSystem(this.scene);
        this.player = new Player(this.scene, this.particles);
        this.inspector = new InspectorChaser(this.scene);
        this.world = new WorldManager(this.scene, this.particles);
        this.missions = new MissionsManager(this);
        this.ui = new UIManager(this);

        this.ui.showStartScreen();
    }

    // ------------------------------------------------------------------------
    // Touch & Keyboard Input Systems
    // ------------------------------------------------------------------------

    initControls() {
        // Keyboard Listener
        window.addEventListener('keydown', (e) => {
            if (this.state === 'START') {
                if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
                    this.start();
                }
                return;
            }

            if (this.state === 'GAMEOVER') {
                if (e.code === 'Space' || e.code === 'Enter') {
                    this.restart();
                }
                return;
            }

            if (this.state !== 'RUNNING') return;

            switch (e.code) {
                case 'ArrowLeft':
                case 'KeyA':
                    this.player.moveLeft();
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.player.moveRight();
                    break;
                case 'ArrowUp':
                case 'KeyW':
                    this.player.jump();
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.player.slide();
                    break;
                case 'Space':
                    this.player.activateHoverboard();
                    break;
                case 'KeyP':
                    this.togglePause();
                    break;
            }
        });

        // Mobile Touch Swipe Listener
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;
        let lastTapTime = 0;

        window.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                touchStartTime = Date.now();

                // Double-tap detection for Hoverboard
                const now = Date.now();
                if (now - lastTapTime < 300) {
                    if (this.state === 'RUNNING') {
                        this.player.activateHoverboard();
                    }
                }
                lastTapTime = now;
            }
        }, { passive: true });

        window.addEventListener('touchend', (e) => {
            if (e.changedTouches.length === 0) return;
            const deltaX = e.changedTouches[0].clientX - touchStartX;
            const deltaY = e.changedTouches[0].clientY - touchStartY;
            const deltaTime = Date.now() - touchStartTime;

            // Must be a swipe gesture
            const absX = Math.abs(deltaX);
            const absY = Math.abs(deltaY);
            const minSwipeDist = 30;

            if (Math.max(absX, absY) > minSwipeDist) {
                if (this.state === 'START') {
                    this.start();
                    return;
                }

                if (this.state !== 'RUNNING') return;

                if (absX > absY) {
                    // Horizontal swipe
                    if (deltaX < 0) this.player.moveLeft();
                    else this.player.moveRight();
                } else {
                    // Vertical swipe
                    if (deltaY < 0) this.player.jump();
                    else this.player.slide();
                }
            }
        }, { passive: true });
    }

    // ------------------------------------------------------------------------
    // Game Lifecycle
    // ------------------------------------------------------------------------

    start() {
        this.state = 'RUNNING';
        this.score = 0;
        this.coinsCollected = 0;
        this.runDistance = 0;
        this.currentSpeed = this.baseSpeed;
        this.wordHunt = { S: false, U: false, R: false, F: false };
        this.baseMultiplier = this.missions ? this.missions.data.multiplier : 1;

        if (this.missions) {
            this.missions.resetRunStats();
        }

        this.player.reset();
        this.inspector.reset();
        this.world.reset();
        this.particles.reset();

        this.ui.showHUD();
        this.ui.updateWordHunt(this.wordHunt);

        if (window.soundManager) {
            window.soundManager.startMusic();
        }
    }

    restart() {
        this.start();
    }

    revive() {
        this.state = 'RUNNING';
        this.player.invulnerable = true;
        this.player.invulnerableTimer = 3.0; // 3s revive shield
        this.player.y = 0.5;
        this.player.vy = 0;
        this.inspector.currentOffsetZ = 5.5; // push inspector back
        this.ui.showHUD();

        if (window.soundManager) {
            window.soundManager.startMusic();
        }
    }

    togglePause() {
        if (this.state === 'RUNNING') {
            this.state = 'PAUSED';
            if (window.soundManager) window.soundManager.stopMusic();
        } else if (this.state === 'PAUSED') {
            this.state = 'RUNNING';
            if (window.soundManager) window.soundManager.startMusic();
        }
    }

    gameOver() {
        this.state = 'GAMEOVER';
        this.inspector.tackle();

        if (window.soundManager) {
            window.soundManager.playCrash();
            window.soundManager.playGameOver();
        }

        this.particles.spawnCrashBurst(this.player.x, this.player.y + 0.8, this.player.z);

        // Bank coins
        this.ui.saveData.coins += this.coinsCollected;

        // Check High Score
        let isNewBest = false;
        if (this.score > this.ui.saveData.highScore) {
            this.ui.saveData.highScore = Math.floor(this.score);
            isNewBest = true;
        }
        this.ui.save();

        setTimeout(() => {
            this.ui.showGameOver(this.score, this.coinsCollected, this.runDistance, isNewBest);
        }, 800);
    }

    // ------------------------------------------------------------------------
    // Collectible Handler
    // ------------------------------------------------------------------------

    handleCollect(col) {
        if (col.type === 'coin') {
            this.coinsCollected++;
            if (this.missions) this.missions.recordEvent('coins', 1);
            const mult = this.player.hasMultiplier ? 2 : 1;
            this.score += 60 * mult;
            if (window.soundManager) window.soundManager.playCoin();
        } else if (col.type === 'magnet') {
            const upLevel = this.ui.saveData.upgrades.magnet || 1;
            this.player.collectMagnet(12 + upLevel * 3);
        } else if (col.type === 'sneakers') {
            const upLevel = this.ui.saveData.upgrades.sneakers || 1;
            this.player.collectSneakers(12 + upLevel * 3);
        } else if (col.type === 'jetpack') {
            const upLevel = this.ui.saveData.upgrades.jetpack || 1;
            this.player.collectJetpack(8 + upLevel * 2);
        } else if (col.type === 'multiplier') {
            const upLevel = this.ui.saveData.upgrades.multiplier || 1;
            this.player.collectMultiplier(12 + upLevel * 3);
        } else if (col.type === 'mystery_box') {
            if (window.soundManager) window.soundManager.playMysteryBoxOpen();
            this.ui.openMysteryBoxReward();
        } else if (col.type === 'headstart') {
            this.player.collectHeadstart(7);
        } else if (col.type === 'letter' && col.letter) {
            this.wordHunt[col.letter] = true;
            this.ui.updateWordHunt(this.wordHunt);
            if (window.soundManager) window.soundManager.playPowerup();

            // Check if all S-U-R-F collected!
            if (this.wordHunt.S && this.wordHunt.U && this.wordHunt.R && this.wordHunt.F) {
                // Word Hunt Jackpot: 500 bonus coins!
                this.coinsCollected += 500;
                this.wordHunt = { S: false, U: false, R: false, F: false };
                this.ui.updateWordHunt(this.wordHunt);
                alert('🎉 JACKPOT! Word Hunt Complete: +500 Gold Coins!');
            }
        }
    }

    // ------------------------------------------------------------------------
    // Dynamic Follow Camera
    // ------------------------------------------------------------------------

    updateCamera(dt) {
        let targetCamX = this.player.x * 0.7;
        let targetCamY = 3.2 + this.player.y * 0.45;
        let targetCamZ = 6.2;

        if (this.player.hasJetpack) {
            targetCamY = 9.0;
            targetCamZ = 8.5;
        } else if (this.player.isSliding) {
            targetCamY = 2.4; // Low camera dip
        }

        this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, targetCamX, 10 * dt);
        this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, targetCamY, 8 * dt);
        this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, targetCamZ, 10 * dt);

        // Look slightly down and ahead of the runner
        const lookTarget = new THREE.Vector3(
            this.player.x * 0.35,
            this.player.y * 0.4 + 1.2,
            -10.0
        );
        this.camera.lookAt(lookTarget);
    }

    // ------------------------------------------------------------------------
    // Main Game Loop
    // ------------------------------------------------------------------------

    animate() {
        requestAnimationFrame(this.animate);

        const dt = Math.min(this.clock.getDelta(), 0.05);

        if (this.state === 'RUNNING') {
            // Speed progression (Headstart supersonic speed boost)
            const targetSpeed = this.player.hasHeadstart ? 42.0 : Math.min(this.maxSpeed, this.baseSpeed + this.speedRampRate * this.runDistance * 0.04);
            this.currentSpeed = THREE.MathUtils.lerp(this.currentSpeed, targetSpeed, dt * 5);

            const distInc = this.currentSpeed * dt;
            this.runDistance += distInc;
            if (this.missions) this.missions.recordEvent('distance', distInc);

            // Multiplier
            const activeMultiplier = (this.missions ? this.missions.data.multiplier : 1) * (this.player.hasMultiplier ? 2 : 1);
            const scoreInc = distInc * 2.5 * activeMultiplier;
            this.score += scoreInc;
            if (this.missions) this.missions.recordEvent('score', scoreInc);

            // Subsystem updates
            this.player.update(dt, this.currentSpeed);
            this.inspector.update(dt, this.player, this.currentSpeed);
            this.world.update(dt, this.currentSpeed, this.player, (col) => this.handleCollect(col));
            this.particles.update(dt);

            // Collision check
            if (!this.player.hasJetpack && !this.player.invulnerable) {
                const colResult = this.world.checkCollisions(this.player);
                if (colResult.hit) {
                    // If player is on hoverboard, hoverboard takes the hit!
                    if (this.player.triggerHoverboardShieldBreak()) {
                        // Shield popped! Player saved!
                        this.inspector.surgeForward();
                    } else {
                        // Game Over!
                        this.gameOver();
                    }
                }
            }

            // HUD
            this.ui.updateHUD(this.score, this.coinsCollected, activeMultiplier);
            this.ui.updatePowerUpMeters(this.player);
        } else if (this.state === 'START' || this.state === 'GAMEOVER') {
            // Gentle idle animations
            this.particles.update(dt);
        }

        this.updateCamera(dt);
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Bootstrap when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    window.game = new SubwaySurfersGame();
});
