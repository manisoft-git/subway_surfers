// ============================================================================
// Subway Surfers: Particle Effects System
// High performance pooled particles for jetpack, hoverboard, coins, crashes
// ============================================================================

class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.pool = [];
        this.maxParticles = 300;

        // Shared geometries and materials for low draw calls
        this.sparkGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
        this.coinSparkMat = new THREE.MeshBasicMaterial({ color: 0xffe600 });
        this.boardFlameMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
        this.jetFlameMat = new THREE.MeshBasicMaterial({ color: 0xff3838 });
        this.smokeMat = new THREE.MeshBasicMaterial({ color: 0xdcdde1, transparent: true, opacity: 0.6 });
        this.dustMat = new THREE.MeshBasicMaterial({ color: 0x8395a7, transparent: true, opacity: 0.5 });
    }

    spawn(x, y, z, vx, vy, vz, mat, life = 0.4, scale = 1.0) {
        let p;
        if (this.particles.length >= this.maxParticles) {
            p = this.particles.shift();
        } else if (this.pool.length > 0) {
            p = this.pool.pop();
        } else {
            p = new THREE.Mesh(this.sparkGeo, mat);
            this.scene.add(p);
        }

        p.material = mat;
        p.position.set(x, y, z);
        p.scale.set(scale, scale, scale);
        p.visible = true;

        p.userData = {
            vx, vy, vz,
            life,
            maxLife: life,
            initialScale: scale
        };

        this.particles.push(p);
    }

    // Sparkle burst on coin pickup
    spawnCoinSparkles(x, y, z) {
        for (let i = 0; i < 8; i++) {
            const ang = (i / 8) * Math.PI * 2;
            const spd = 2 + Math.random() * 3;
            this.spawn(
                x, y, z,
                Math.cos(ang) * spd,
                1.5 + Math.random() * 3,
                Math.sin(ang) * spd,
                this.coinSparkMat,
                0.35 + Math.random() * 0.2,
                0.8 + Math.random() * 0.5
            );
        }
    }

    // Ground dust puff on jump landing or sliding
    spawnSlideDust(x, y, z) {
        for (let i = 0; i < 4; i++) {
            this.spawn(
                x + (Math.random() - 0.5) * 0.4,
                y + 0.1,
                z + (Math.random() - 0.5) * 0.4,
                (Math.random() - 0.5) * 2,
                0.8 + Math.random() * 1.5,
                -4 - Math.random() * 3,
                this.dustMat,
                0.3,
                0.9
            );
        }
    }

    // Hoverboard thruster glowing particle trail
    spawnBoardTrail(x, y, z) {
        for (let i = 0; i < 2; i++) {
            this.spawn(
                x + (Math.random() - 0.5) * 0.3,
                y,
                z + 0.5 + Math.random() * 0.2,
                (Math.random() - 0.5) * 0.8,
                (Math.random() - 0.5) * 0.5,
                2 + Math.random() * 2,
                this.boardFlameMat,
                0.25,
                0.7
            );
        }
    }

    // Jetpack twin rocket fire & smoke
    spawnJetpackPlume(x, y, z) {
        [-0.15, 0.15].forEach(dx => {
            // Flame core
            this.spawn(
                x + dx,
                y - 0.25,
                z + 0.2,
                (Math.random() - 0.5) * 0.5,
                -3 - Math.random() * 4,
                1 + Math.random() * 2,
                this.jetFlameMat,
                0.2,
                0.8
            );
            // Smoke puff
            if (Math.random() > 0.4) {
                this.spawn(
                    x + dx + (Math.random() - 0.5) * 0.2,
                    y - 0.4,
                    z + 0.3,
                    (Math.random() - 0.5) * 1.0,
                    -1.5 - Math.random() * 2,
                    3 + Math.random() * 2,
                    this.smokeMat,
                    0.4,
                    1.2
                );
            }
        });
    }

    // Crash explosion
    spawnCrashBurst(x, y, z) {
        for (let i = 0; i < 25; i++) {
            const vx = (Math.random() - 0.5) * 8;
            const vy = 2 + Math.random() * 6;
            const vz = (Math.random() - 0.5) * 8;
            const mat = Math.random() > 0.5 ? this.jetFlameMat : this.coinSparkMat;
            this.spawn(x, y, z, vx, vy, vz, mat, 0.6 + Math.random() * 0.4, 1.4);
        }
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            const u = p.userData;

            u.life -= dt;
            if (u.life <= 0) {
                p.visible = false;
                this.particles.splice(i, 1);
                this.pool.push(p);
                continue;
            }

            // Move
            p.position.x += u.vx * dt;
            p.position.y += u.vy * dt;
            p.position.z += u.vz * dt;

            // Gravity effect on sparks
            u.vy -= 9.8 * dt * 0.5;

            // Scale down with age
            const progress = u.life / u.maxLife;
            const sc = u.initialScale * progress;
            p.scale.set(sc, sc, sc);
        }
    }

    reset() {
        for (const p of this.particles) {
            p.visible = false;
            this.pool.push(p);
        }
        this.particles.length = 0;
    }
}

window.ParticleSystem = ParticleSystem;
