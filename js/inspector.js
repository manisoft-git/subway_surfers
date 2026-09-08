// ============================================================================
// Subway Surfers: Inspector & Bulldog AI Chaser Engine
// Dynamic pursuer mechanics, stumble reactions & procedural run animations
// ============================================================================

class InspectorChaser {
    constructor(scene) {
        this.scene = scene;
        this.rig = ModelFactory.createInspector();
        this.mesh = this.rig.root;
        this.scene.add(this.mesh);

        this.x = 0;
        this.y = 0;
        this.z = 4.5; // Offset behind player
        this.targetOffsetZ = 6.0; // Normal distance behind camera/player
        this.currentOffsetZ = 3.5; // Close behind at start

        this.animTime = 0;
        this.isTackling = false;
        this.tackleProgress = 0;
    }

    reset() {
        this.x = 0;
        this.y = 0;
        this.currentOffsetZ = 3.2; // Starts close behind
        this.targetOffsetZ = 5.5; // Will ease back
        this.isTackling = false;
        this.tackleProgress = 0;
        this.mesh.visible = true;
    }

    // Triggered when player stumbles on an obstacle edge
    surgeForward() {
        this.currentOffsetZ = 2.2; // Right at player's heels!
        this.targetOffsetZ = 2.4;
    }

    // Triggered when player hits an obstacle dead-on (Game Over)
    tackle() {
        this.isTackling = true;
        this.tackleProgress = 0;
    }

    update(dt, player, currentSpeed) {
        this.animTime += dt * (currentSpeed / 6.0);

        if (this.isTackling) {
            this.tackleProgress += dt * 3.0;
            this.x = THREE.MathUtils.lerp(this.x, player.x, 10 * dt);
            this.z = THREE.MathUtils.lerp(this.z, player.z + 0.8, 10 * dt);
            this.y = THREE.MathUtils.lerp(this.y, player.y, 8 * dt);

            // Tackle lunge pose
            this.rig.leftArm.rotation.x = -1.8;
            this.rig.rightArm.rotation.x = -1.8;
            this.rig.bodyContainer.rotation.x = 0.6;
            this.mesh.position.set(this.x, this.y, this.z);
            return;
        }

        // Target follow lane
        this.x = THREE.MathUtils.lerp(this.x, player.x, 8.0 * dt);
        this.y = THREE.MathUtils.lerp(this.y, player.y, 10.0 * dt);

        // Distance control:
        // If player recently stumbled, stay close; else gradually fall back
        if (player.stumbleTimer > 0) {
            this.targetOffsetZ = 2.2; // Very close
        } else {
            this.targetOffsetZ = 5.8; // Farther behind
        }

        this.currentOffsetZ = THREE.MathUtils.lerp(this.currentOffsetZ, this.targetOffsetZ, 1.2 * dt);
        this.z = player.z + this.currentOffsetZ;

        this.mesh.position.set(this.x, this.y, this.z);

        // Run animations
        const t = this.animTime * 11.0;

        // Inspector run cycle
        this.rig.bodyContainer.position.y = Math.abs(Math.sin(t)) * 0.14;
        const swing = Math.sin(t) * 0.85;
        this.rig.leftArm.rotation.x = swing;
        this.rig.rightArm.rotation.x = -swing;
        this.rig.leftLeg.rotation.x = -swing * 0.9;
        this.rig.rightLeg.rotation.x = swing * 0.9;

        // Dog bounding animation
        const dtDog = this.animTime * 16.0;
        this.rig.dogGroup.position.y = Math.abs(Math.sin(dtDog)) * 0.18;
        this.rig.dogLegs.forEach((leg, idx) => {
            leg.rotation.x = Math.sin(dtDog + idx * Math.PI) * 0.7;
        });
    }
}

window.InspectorChaser = InspectorChaser;
