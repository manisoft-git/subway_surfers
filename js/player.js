// ============================================================================
// Subway Surfers: Player Controller & Locomotion Animation Engine
// 3-Lane physics, jumping arcs, ducking slides, hoverboard & jetpack
// ============================================================================

class Player {
    constructor(scene, particles) {
        this.scene = scene;
        this.particles = particles;

        // Model
        this.rig = ModelFactory.createPlayer();
        this.mesh = this.rig.root;
        this.scene.add(this.mesh);

        // Lane setup: -1: Left (-2.5m), 0: Middle (0m), 1: Right (+2.5m)
        this.laneSpacing = 2.5;
        this.currentLane = 0;
        this.targetX = 0;

        // Position & Physics
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.vy = 0;
        this.gravity = -30.0;
        this.groundY = 0;
        this.currentPlatform = null; // Train roof if standing on train

        // State Machine
        this.isGrounded = true;
        this.isJumping = false;
        this.isSliding = false;
        this.slideTimer = 0;
        this.slideDuration = 0.72;

        // Power-up States
        this.hasHoverboard = false;
        this.hoverboardTimer = 0;
        this.hasSneakers = false;
        this.sneakersTimer = 0;
        this.hasMagnet = false;
        this.magnetTimer = 0;
        this.hasJetpack = false;
        this.jetpackTimer = 0;
        this.hasMultiplier = false;
        this.multiplierTimer = 0;
        this.hasHeadstart = false;
        this.headstartTimer = 0;

        // Invulnerability (after hoverboard save or revive)
        this.invulnerable = false;
        this.invulnerableTimer = 0;

        // Stumble mechanic (inspector catches up)
        this.stumbleTimer = 0;

        // Animation timing
        this.animTime = 0;
        this.runSpeed = 16.0; // Simulated world speed

        // Collision Hitbox dimensions
        this.collider = {
            width: 0.8,
            height: 1.8,
            depth: 0.8,
            centerY: 0.9
        };
    }

    reset() {
        this.currentLane = 0;
        this.targetX = 0;
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.vy = 0;
        this.groundY = 0;
        this.isGrounded = true;
        this.isJumping = false;
        this.isSliding = false;
        this.slideTimer = 0;

        this.hasHoverboard = false;
        this.hoverboardTimer = 0;
        this.hasSneakers = false;
        this.sneakersTimer = 0;
        this.hasMagnet = false;
        this.magnetTimer = 0;
        this.hasJetpack = false;
        this.jetpackTimer = 0;
        this.hasMultiplier = false;
        this.multiplierTimer = 0;
        this.hasHeadstart = false;
        this.headstartTimer = 0;
        this.invulnerable = false;
        this.invulnerableTimer = 0;
        this.stumbleTimer = 0;

        this.rig.boardGroup.visible = false;
        this.rig.jetpackGroup.visible = false;
        this.mesh.visible = true;
        this.mesh.position.set(0, 0, 0);
        this.mesh.rotation.set(0, 0, 0);

        if (window.soundManager) {
            window.soundManager.stopJetpack();
        }
    }

    // ------------------------------------------------------------------------
    // Player Input Actions
    // ------------------------------------------------------------------------

    moveLeft() {
        if (this.currentLane > -1) {
            this.currentLane--;
            this.targetX = this.currentLane * this.laneSpacing;
            if (window.soundManager) window.soundManager.playSwipe();
        }
    }

    moveRight() {
        if (this.currentLane < 1) {
            this.currentLane++;
            this.targetX = this.currentLane * this.laneSpacing;
            if (window.soundManager) window.soundManager.playSwipe();
        }
    }

    jump() {
        if (this.hasJetpack) return;

        if (this.isGrounded || this.y <= this.groundY + 0.3) {
            this.isJumping = true;
            this.isGrounded = false;
            this.isSliding = false; // Cancel slide if jumping

            if (this.hasSneakers) {
                this.vy = 18.5; // Massive leap over entire trains
                if (window.soundManager) window.soundManager.playSuperSneakers();
            } else {
                this.vy = 12.0; // Standard crisp jump
                if (window.soundManager) window.soundManager.playJump();
            }

            this.particles.spawnSlideDust(this.x, this.y, this.z);
            if (window.game && window.game.missions) window.game.missions.recordEvent('jumps', 1);
        }
    }

    slide() {
        if (this.hasJetpack) return;

        if (!this.isGrounded) {
            // Fast air drop / dive down into slide!
            this.vy = -24.0;
            this.isSliding = true;
            this.slideTimer = this.slideDuration;
            if (window.soundManager) window.soundManager.playSlide();
            if (window.game && window.game.missions) window.game.missions.recordEvent('slides', 1);
            return;
        }

        if (!this.isSliding) {
            this.isSliding = true;
            this.slideTimer = this.slideDuration;
            if (window.soundManager) window.soundManager.playSlide();
            this.particles.spawnSlideDust(this.x, this.y, this.z);
            if (window.game && window.game.missions) window.game.missions.recordEvent('slides', 1);
        }
    }

    activateHoverboard() {
        if (this.hasHoverboard || this.hasJetpack) return;
        this.hasHoverboard = true;
        this.hoverboardTimer = 30.0;
        this.rig.boardGroup.visible = true;
        if (window.soundManager) window.soundManager.playHoverboard();
        this.particles.spawnBoardTrail(this.x, this.y, this.z);
        if (window.game && window.game.missions) window.game.missions.recordEvent('hoverboardsUsed', 1);
    }

    triggerHoverboardShieldBreak() {
        if (!this.hasHoverboard) return false;
        this.hasHoverboard = false;
        this.hoverboardTimer = 0;
        this.rig.boardGroup.visible = false;
        this.invulnerable = true;
        this.invulnerableTimer = 1.6; // 1.6s grace period

        if (window.soundManager) window.soundManager.playShieldPop();
        this.particles.spawnCrashBurst(this.x, this.y + 0.5, this.z);
        return true;
    }

    // ------------------------------------------------------------------------
    // Power-up Triggers
    // ------------------------------------------------------------------------

    collectMagnet(duration = 15) {
        this.hasMagnet = true;
        this.magnetTimer = duration;
        if (window.soundManager) window.soundManager.playPowerup();
        if (window.game && window.game.missions) window.game.missions.recordEvent('magnets', 1);
    }

    collectSneakers(duration = 15) {
        this.hasSneakers = true;
        this.sneakersTimer = duration;
        if (window.soundManager) window.soundManager.playPowerup();
        if (window.game && window.game.missions) window.game.missions.recordEvent('sneakers', 1);
    }

    collectMultiplier(duration = 15) {
        this.hasMultiplier = true;
        this.multiplierTimer = duration;
        if (window.soundManager) window.soundManager.playPowerup();
    }

    collectJetpack(duration = 10) {
        this.hasJetpack = true;
        this.jetpackTimer = duration;
        this.rig.jetpackGroup.visible = true;
        this.isGrounded = false;
        this.isSliding = false;
        if (window.soundManager) {
            window.soundManager.playPowerup();
            window.soundManager.startJetpack();
        }
        if (window.game && window.game.missions) window.game.missions.recordEvent('jetpacks', 1);
    }

    collectHeadstart(duration = 6) {
        this.hasHeadstart = true;
        this.headstartTimer = duration;
        this.invulnerable = true;
        this.invulnerableTimer = duration;
        if (window.soundManager) window.soundManager.playPowerup();
    }

    stumble() {
        this.stumbleTimer = 2.5;
        if (window.soundManager) {
            window.soundManager.playStumble();
            window.soundManager.playWhistle();
        }
    }

    // ------------------------------------------------------------------------
    // Physics & Frame Update
    // ------------------------------------------------------------------------

    update(dt, currentSpeed) {
        this.animTime += dt * (currentSpeed / 6.0);

        // Power-up timers
        if (this.hasHoverboard) {
            this.hoverboardTimer -= dt;
            this.particles.spawnBoardTrail(this.x, this.y, this.z);
            if (this.hoverboardTimer <= 0) {
                this.hasHoverboard = false;
                this.rig.boardGroup.visible = false;
            }
        }

        if (this.hasSneakers) {
            this.sneakersTimer -= dt;
            if (this.sneakersTimer <= 0) this.hasSneakers = false;
        }

        if (this.hasMagnet) {
            this.magnetTimer -= dt;
            if (this.magnetTimer <= 0) this.hasMagnet = false;
        }

        if (this.hasMultiplier) {
            this.multiplierTimer -= dt;
            if (this.multiplierTimer <= 0) this.hasMultiplier = false;
        }

        if (this.hasHeadstart) {
            this.headstartTimer -= dt;
            this.particles.spawnJetpackPlume(this.x, this.y, this.z);
            if (this.headstartTimer <= 0) {
                this.hasHeadstart = false;
            }
        }

        if (this.invulnerable) {
            this.invulnerableTimer -= dt;
            // Flashing flicker effect
            this.mesh.visible = Math.floor(this.invulnerableTimer * 20) % 2 === 0;
            if (this.invulnerableTimer <= 0) {
                this.invulnerable = false;
                this.mesh.visible = true;
            }
        }

        if (this.stumbleTimer > 0) {
            this.stumbleTimer -= dt;
        }

        // --------------------------------------------------------------------
        // Jetpack Sky Mode Physics
        // --------------------------------------------------------------------
        if (this.hasJetpack) {
            this.jetpackTimer -= dt;
            this.particles.spawnJetpackPlume(this.x, this.y, this.z);

            // Fly high up at 7.5m
            const targetSkyY = 7.5;
            this.y += (targetSkyY - this.y) * 4.0 * dt;
            this.vy = 0;

            if (this.jetpackTimer <= 0) {
                this.hasJetpack = false;
                this.rig.jetpackGroup.visible = false;
                if (window.soundManager) window.soundManager.stopJetpack();
            }
        } else {
            // Standard vertical gravity physics
            this.vy += this.gravity * dt;
            this.y += this.vy * dt;

            // Landing check on current ground / roof height
            if (this.y <= this.groundY) {
                this.y = this.groundY;
                this.vy = 0;
                if (!this.isGrounded) {
                    this.isGrounded = true;
                    this.isJumping = false;
                    this.particles.spawnSlideDust(this.x, this.y, this.z);
                }
            } else {
                this.isGrounded = false;
            }
        }

        // Horizontal lane movement interpolation
        const laneDist = this.targetX - this.x;
        this.x += laneDist * 16.0 * dt;

        // Slide duration timer
        if (this.isSliding) {
            this.slideTimer -= dt;
            if (this.isGrounded) {
                this.particles.spawnSlideDust(this.x, this.y, this.z);
            }
            if (this.slideTimer <= 0) {
                this.isSliding = false;
            }
        }

        // Update Hitbox based on state
        if (this.isSliding) {
            this.collider.height = 0.7;
            this.collider.centerY = this.y + 0.35;
        } else {
            this.collider.height = 1.8;
            this.collider.centerY = this.y + 0.9;
        }

        // Mesh position
        this.mesh.position.set(this.x, this.y, this.z);

        // Banking lean on lane switch
        const bankAngle = -laneDist * 0.12;
        this.mesh.rotation.z = THREE.MathUtils.lerp(this.mesh.rotation.z, bankAngle, 12 * dt);

        // Update procedural skeletal animations
        this.updateAnimations(dt);
    }

    // ------------------------------------------------------------------------
    // Procedural Skeletal Animations
    // ------------------------------------------------------------------------

    updateAnimations(dt) {
        const r = this.rig;

        if (this.hasJetpack) {
            // Horizontal Superman Flying Pose
            r.torso.rotation.x = 1.2;
            r.headGroup.rotation.x = -0.9;
            r.leftShoulder.rotation.x = -2.8;
            r.rightShoulder.rotation.x = -2.8;
            r.leftHip.rotation.x = 0.3;
            r.rightHip.rotation.x = 0.3;
            r.leftKnee.rotation.x = 0.2;
            r.rightKnee.rotation.x = 0.2;
            r.bodyContainer.position.y = 0;
            return;
        }

        if (this.hasHoverboard) {
            // Cool Surfer Stance
            r.torso.rotation.y = 0.5;
            r.torso.rotation.x = 0.15;
            r.headGroup.rotation.y = -0.4;
            r.headGroup.rotation.x = 0;

            r.leftShoulder.rotation.x = 0.4;
            r.leftShoulder.rotation.z = -0.4;
            r.rightShoulder.rotation.x = -0.4;
            r.rightShoulder.rotation.z = 0.4;

            r.leftHip.rotation.x = 0.2;
            r.rightHip.rotation.x = -0.2;
            r.leftKnee.rotation.x = 0.4;
            r.rightKnee.rotation.x = 0.4;

            // Gentle floating hoverboard bob
            r.boardGroup.position.y = 0.08 + Math.sin(this.animTime * 6) * 0.04;
            r.bodyContainer.position.y = r.boardGroup.position.y;
            return;
        }

        if (this.isSliding) {
            // Sliding / Ducking Pose
            r.torso.rotation.x = -0.7;
            r.torso.rotation.y = 0;
            r.headGroup.rotation.x = 0.6;
            r.bodyContainer.position.y = -0.45;

            r.leftShoulder.rotation.x = -1.2;
            r.rightShoulder.rotation.x = -1.2;

            r.leftHip.rotation.x = -1.3;
            r.rightHip.rotation.x = -1.3;
            r.leftKnee.rotation.x = 1.4;
            r.rightKnee.rotation.x = 1.4;
            return;
        }

        if (!this.isGrounded) {
            // Jump Air Pose
            r.torso.rotation.x = 0.2;
            r.torso.rotation.y = 0;
            r.headGroup.rotation.x = -0.15;
            r.bodyContainer.position.y = 0;

            // Arms outward for balance
            r.leftShoulder.rotation.x = -1.8;
            r.leftShoulder.rotation.z = -0.5;
            r.rightShoulder.rotation.x = -1.8;
            r.rightShoulder.rotation.z = 0.5;

            // Legs bent/tucked
            r.leftHip.rotation.x = 0.8;
            r.rightHip.rotation.x = 0.5;
            r.leftKnee.rotation.x = 1.1;
            r.rightKnee.rotation.x = 0.9;
            return;
        }

        // --------------------------------------------------------------------
        // Dynamic Bouncy Run Cycle
        // --------------------------------------------------------------------
        const t = this.animTime * 12.0;

        // Torso bounce & slight roll
        r.bodyContainer.position.y = Math.abs(Math.sin(t)) * 0.12;
        r.torso.rotation.x = 0.18; // Leaning forward with determination
        r.torso.rotation.y = Math.sin(t) * 0.1;
        r.torso.rotation.z = 0;
        r.headGroup.rotation.x = -0.1;
        r.headGroup.rotation.y = -Math.sin(t) * 0.05;

        // Arm swing (opposite to legs)
        const armSwing = Math.sin(t) * 0.9;
        r.leftShoulder.rotation.x = armSwing;
        r.leftShoulder.rotation.z = -0.15;
        r.leftElbow.rotation.x = 0.6 + Math.max(0, -armSwing * 0.5);

        r.rightShoulder.rotation.x = -armSwing;
        r.rightShoulder.rotation.z = 0.15;
        r.rightElbow.rotation.x = 0.6 + Math.max(0, armSwing * 0.5);

        // Leg stride
        const legSwing = Math.sin(t) * 1.1;
        r.leftHip.rotation.x = -legSwing;
        r.rightHip.rotation.x = legSwing;

        // Knee bends backward on back swing
        r.leftKnee.rotation.x = Math.max(0.1, legSwing > 0 ? legSwing * 1.2 : 0.2);
        r.rightKnee.rotation.x = Math.max(0.1, -legSwing > 0 ? -legSwing * 1.2 : 0.2);
    }
}

window.Player = Player;
