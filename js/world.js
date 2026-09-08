// ============================================================================
// Subway Surfers: Infinite Procedural World & Track Chunk Engine
// Rails, ballast, graffiti walls, gantries, moving trains, obstacles & coins
// ============================================================================

class TrackChunk {
    constructor(scene, chunkIndex, length = 60) {
        this.scene = scene;
        this.chunkIndex = chunkIndex;
        this.length = length;
        this.group = new THREE.Group();
        this.scene.add(this.group);

        this.obstacles = [];
        this.collectibles = [];
        this.movingTrains = [];

        this.buildStaticScenery();
    }

    buildStaticScenery() {
        const len = this.length;
        const ballastMat = new THREE.MeshLambertMaterial({ map: TextureGenerator.createBallastTexture() });
        const tieMat = new THREE.MeshLambertMaterial({ map: TextureGenerator.createTieTexture() });
        const railMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2 });

        // Track Ballast Ground (width 12m, length 60m)
        const groundGeo = new THREE.PlaneGeometry(12, len);
        const groundMesh = new THREE.Mesh(groundGeo, ballastMat);
        groundMesh.rotation.x = -Math.PI / 2;
        groundMesh.position.y = -0.05;
        groundMesh.receiveShadow = true;
        this.group.add(groundMesh);

        // 3 Track Sets (Lanes: -2.5, 0.0, 2.5)
        const lanes = [-2.5, 0.0, 2.5];
        lanes.forEach(laneX => {
            // Steel Rails (Two rails per lane, gauge 1.4m)
            [-0.7, 0.7].forEach(railOffset => {
                const railGeo = new THREE.BoxGeometry(0.1, 0.14, len);
                const railMesh = new THREE.Mesh(railGeo, railMat);
                railMesh.position.set(laneX + railOffset, 0.07, 0);
                railMesh.castShadow = true;
                this.group.add(railMesh);
            });

            // Wooden Ties (Sleepers) spaced every 1.5m
            const tieGeo = new THREE.BoxGeometry(2.0, 0.1, 0.28);
            for (let z = -len / 2 + 0.75; z < len / 2; z += 1.5) {
                const tie = new THREE.Mesh(tieGeo, tieMat);
                tie.position.set(laneX, 0.04, z);
                tie.receiveShadow = true;
                this.group.add(tie);
            }
        });

        // Left and Right Concrete Graffiti Walls
        [-5.6, 5.6].forEach((wallX, idx) => {
            const wallGeo = new THREE.BoxGeometry(0.6, 4.5, len);
            const graffitiTexture = TextureGenerator.createGraffitiTexture(this.chunkIndex * 2 + idx);
            graffitiTexture.wrapS = THREE.RepeatWrapping;
            graffitiTexture.wrapT = THREE.RepeatWrapping;
            graffitiTexture.repeat.set(3, 1);

            const wallMat = new THREE.MeshLambertMaterial({ map: graffitiTexture });
            const wallMesh = new THREE.Mesh(wallGeo, wallMat);
            wallMesh.position.set(wallX, 2.25, 0);
            wallMesh.castShadow = true;
            wallMesh.receiveShadow = true;
            this.group.add(wallMesh);

            // Concrete wall top coping rim
            const rimGeo = new THREE.BoxGeometry(0.8, 0.2, len);
            const rimMat = new THREE.MeshLambertMaterial({ color: 0x57606f });
            const rimMesh = new THREE.Mesh(rimGeo, rimMat);
            rimMesh.position.set(wallX, 4.55, 0);
            this.group.add(rimMesh);
        });

        // Steel Overhead Catenary Gantries (arch every 30m)
        [-15, 15].forEach(gz => {
            const gantryGroup = new THREE.Group();
            gantryGroup.position.set(0, 0, gz);

            const frameMat = new THREE.MeshLambertMaterial({ color: 0x2f3542 });

            // Cross beam across all 3 tracks
            const beamGeo = new THREE.BoxGeometry(11.4, 0.4, 0.4);
            const beam = new THREE.Mesh(beamGeo, frameMat);
            beam.position.y = 5.2;
            gantryGroup.add(beam);

            // Left & right support pillars
            const pillarGeo = new THREE.CylinderGeometry(0.18, 0.2, 5.4, 8);
            const leftPillar = new THREE.Mesh(pillarGeo, frameMat);
            leftPillar.position.set(-5.3, 2.7, 0);
            gantryGroup.add(leftPillar);

            const rightPillar = new THREE.Mesh(pillarGeo, frameMat);
            rightPillar.position.set(5.3, 2.7, 0);
            gantryGroup.add(rightPillar);

            // Warning lights on gantry
            lanes.forEach(lx => {
                const signalGeo = new THREE.BoxGeometry(0.3, 0.6, 0.2);
                const signalMesh = new THREE.Mesh(signalGeo, frameMat);
                signalMesh.position.set(lx, 4.6, 0);
                gantryGroup.add(signalMesh);

                const bulbGeo = new THREE.SphereGeometry(0.1, 8, 8);
                const bulb = new THREE.Mesh(bulbGeo, new THREE.MeshBasicMaterial({ color: 0x2ed573 })); // Green signal
                bulb.position.set(lx, 4.45, 0.12);
                gantryGroup.add(bulb);
            });

            this.group.add(gantryGroup);
        });
    }

    clearDynamicEntities() {
        for (const obs of this.obstacles) {
            this.group.remove(obs.mesh);
        }
        this.obstacles.length = 0;

        for (const col of this.collectibles) {
            this.group.remove(col.mesh);
        }
        this.collectibles.length = 0;

        this.movingTrains.length = 0;
    }

    // ------------------------------------------------------------------------
    // Procedural Pattern Populator
    // ------------------------------------------------------------------------
    populate(isInitialChunk = false, distanceSoFar = 0) {
        this.clearDynamicEntities();

        // If it's the very first chunk near start, keep track clear for safe takeoff
        if (isInitialChunk) {
            // Just place a friendly coin trail in middle lane
            this.spawnCoinRow(0, -10, -45, 8);
            return;
        }

        const lanes = [-2.5, 0, 2.5];
        const difficulty = Math.min(1.0, distanceSoFar / 1500);

        // Pattern selection based on difficulty
        const patternRoll = Math.random();

        if (patternRoll < 0.28) {
            // Pattern A: High and Low barriers in different lanes
            const hurdleLanes = [...lanes].sort(() => Math.random() - 0.5);
            // Lane 1: Low hurdle (jump)
            this.spawnObstacle('low_barrier', hurdleLanes[0], -15);
            this.spawnCoinArc(hurdleLanes[0], -15);

            // Lane 2: High hurdle (slide)
            this.spawnObstacle('high_barrier', hurdleLanes[1], -35);
            this.spawnCoinRow(hurdleLanes[1], -38, -32, 3, 0.5); // Low coins under hurdle

            // Open lane has a power-up or letter!
            if (Math.random() < 0.45) {
                this.spawnRandomPowerUp(hurdleLanes[2], -25);
            } else {
                this.spawnCoinRow(hurdleLanes[2], -10, -45, 6);
            }
        } else if (patternRoll < 0.55) {
            // Pattern B: Stationary Train with Ramp!
            const trainLane = lanes[Math.floor(Math.random() * lanes.length)];
            const otherLanes = lanes.filter(l => l !== trainLane);

            // Train with ramp
            this.spawnTrain(trainLane, -25, { hasRamp: true, type: Math.random() > 0.5 ? 'blue' : 'red' });
            // Coins on top of train roof!
            this.spawnCoinRow(trainLane, -32, -12, 6, 4.3);

            // An obstacle in one other lane
            const blockedOther = otherLanes[0];
            this.spawnObstacle('low_barrier', blockedOther, -20);

            // Collectible in the remaining open lane
            this.spawnCoinRow(otherLanes[1], -10, -45, 6);
        } else if (patternRoll < 0.78) {
            // Pattern C: Moving Oncoming Train!
            const oncomingLane = lanes[Math.floor(Math.random() * lanes.length)];
            const otherLanes = lanes.filter(l => l !== oncomingLane);

            // Moving train approaching from ahead
            this.spawnMovingTrain(oncomingLane, -55, { type: 'red' });

            // Obstacle in one remaining lane
            if (Math.random() > 0.3) {
                this.spawnObstacle('high_barrier', otherLanes[0], -25);
            }
            this.spawnCoinRow(otherLanes[1], -10, -40, 5);

            if (Math.random() < 0.4) {
                this.spawnRandomPowerUp(otherLanes[0], -10);
            }
        } else {
            // Pattern D: Two Trains Side-by-Side (Narrow escape route!)
            const freeLaneIdx = Math.floor(Math.random() * 3);
            lanes.forEach((lx, idx) => {
                if (idx !== freeLaneIdx) {
                    const hasRamp = Math.random() > 0.5;
                    this.spawnTrain(lx, -25, { hasRamp, type: idx === 0 ? 'blue' : 'red' });
                    if (hasRamp) {
                        this.spawnCoinRow(lx, -32, -12, 5, 4.3);
                    }
                } else {
                    // Open escape path with dense coin reward and power-up
                    this.spawnCoinRow(lx, -8, -48, 8);
                    if (Math.random() < 0.5) {
                        this.spawnRandomPowerUp(lx, -28);
                    }
                }
            });
        }

        // Sky coins for jetpack users in this chunk
        this.spawnSkyCoins();
    }

    // ------------------------------------------------------------------------
    // Spawners
    // ------------------------------------------------------------------------

    spawnObstacle(type, x, z) {
        let mesh;
        if (type === 'low_barrier') {
            mesh = ModelFactory.createLowBarrier();
        } else {
            mesh = ModelFactory.createHighBarrier();
        }
        mesh.position.set(x, 0, z);
        this.group.add(mesh);

        this.obstacles.push({
            type,
            mesh,
            x,
            y: 0,
            z,
            width: mesh.userData.width || 2.2,
            height: mesh.userData.height || 1.2,
            depth: 0.6,
            jumpable: !!mesh.userData.jumpable,
            slidable: !!mesh.userData.slidable,
            clearanceY: mesh.userData.clearanceY || 0
        });
    }

    spawnTrain(x, z, options = {}) {
        const mesh = ModelFactory.createTrain(options);
        mesh.position.set(x, 0, z);
        this.group.add(mesh);

        this.obstacles.push({
            type: 'train',
            mesh,
            x,
            y: 0,
            z,
            width: 2.4,
            height: 3.6,
            depth: options.hasRamp ? 28.0 : 22.0,
            roofY: 3.9,
            hasRamp: !!options.hasRamp,
            rampLength: 6.0
        });
    }

    spawnMovingTrain(x, z, options = {}) {
        const mesh = ModelFactory.createTrain(options);
        mesh.position.set(x, 0, z);
        this.group.add(mesh);

        const trainObj = {
            type: 'train',
            mesh,
            x,
            y: 0,
            z,
            width: 2.4,
            height: 3.6,
            depth: 22.0,
            roofY: 3.9,
            hasRamp: false,
            isMoving: true,
            speed: 12.0, // Oncoming speed
            hornBlown: false
        };

        this.obstacles.push(trainObj);
        this.movingTrains.push(trainObj);
    }

    spawnCoinRow(x, startZ, endZ, count = 6, y = 0.9) {
        const step = (endZ - startZ) / (count - 1 || 1);
        for (let i = 0; i < count; i++) {
            const z = startZ + step * i;
            const coinMesh = ModelFactory.createCoin();
            coinMesh.position.set(x, y, z);
            this.group.add(coinMesh);

            this.collectibles.push({
                type: 'coin',
                mesh: coinMesh,
                x,
                y,
                z,
                radius: 0.55,
                collected: false
            });
        }
    }

    spawnCoinArc(x, centerZ, peakY = 2.4) {
        // Beautiful parabolic jump arc over a low hurdle
        const offsets = [
            { dz: 4.0, y: 1.0 },
            { dz: 2.0, y: 1.8 },
            { dz: 0.0, y: peakY },
            { dz: -2.0, y: 1.8 },
            { dz: -4.0, y: 1.0 }
        ];
        offsets.forEach(off => {
            const coinMesh = ModelFactory.createCoin();
            coinMesh.position.set(x, off.y, centerZ + off.dz);
            this.group.add(coinMesh);

            this.collectibles.push({
                type: 'coin',
                mesh: coinMesh,
                x,
                y: off.y,
                z: centerZ + off.dz,
                radius: 0.55,
                collected: false
            });
        });
    }

    spawnSkyCoins() {
        // Rows of coins up at Y = 7.5 for jetpack flight
        const lanes = [-2.5, 0, 2.5];
        const skyLane = lanes[Math.floor(Math.random() * lanes.length)];
        for (let z = -10; z >= -50; z -= 4.0) {
            const coinMesh = ModelFactory.createCoin();
            coinMesh.position.set(skyLane, 7.5, z);
            this.group.add(coinMesh);

            this.collectibles.push({
                type: 'coin',
                mesh: coinMesh,
                x: skyLane,
                y: 7.5,
                z,
                radius: 0.55,
                collected: false
            });
        }
    }

    spawnRandomPowerUp(x, z, y = 1.1) {
        const types = ['magnet', 'sneakers', 'jetpack', 'multiplier', 'letter', 'mystery_box', 'headstart'];
        const chosen = types[Math.floor(Math.random() * types.length)];
        let mesh;

        if (chosen === 'magnet') mesh = ModelFactory.createMagnet();
        else if (chosen === 'sneakers') mesh = ModelFactory.createSuperSneakers();
        else if (chosen === 'jetpack') mesh = ModelFactory.createJetpackItem();
        else if (chosen === 'multiplier') mesh = ModelFactory.create2xMultiplier();
        else if (chosen === 'mystery_box') mesh = ModelFactory.createMysteryBox();
        else if (chosen === 'headstart') mesh = ModelFactory.createHeadstartItem();
        else {
            const letters = ['S', 'U', 'R', 'F'];
            const char = letters[Math.floor(Math.random() * letters.length)];
            mesh = ModelFactory.createLetter(char);
        }

        mesh.position.set(x, y, z);
        this.group.add(mesh);

        this.collectibles.push({
            type: chosen,
            mesh,
            x,
            y,
            z,
            letter: mesh.userData.letter || null,
            radius: 0.8,
            collected: false
        });
    }
}

// ----------------------------------------------------------------------------
// World Manager
// ----------------------------------------------------------------------------
class WorldManager {
    constructor(scene, particles) {
        this.scene = scene;
        this.particles = particles;

        this.chunkLength = 60;
        this.numChunks = 5;
        this.chunks = [];
        this.worldZ = 0; // Cumulative distance traveled

        this.initChunks();
    }

    initChunks() {
        for (let i = 0; i < this.numChunks; i++) {
            const chunk = new TrackChunk(this.scene, i, this.chunkLength);
            // Position chunk in world: chunk 0 at Z = 0, chunk 1 at Z = -60, chunk 2 at -120...
            chunk.group.position.z = -i * this.chunkLength;
            chunk.populate(i < 2, 0);
            this.chunks.push(chunk);
        }
    }

    reset() {
        this.worldZ = 0;
        for (let i = 0; i < this.chunks.length; i++) {
            const chunk = this.chunks[i];
            chunk.group.position.z = -i * this.chunkLength;
            chunk.populate(i < 2, 0);
        }
    }

    update(dt, currentSpeed, player, onCollect) {
        const moveDist = currentSpeed * dt;
        this.worldZ += moveDist;

        // Move all chunks backward toward positive Z (endless runner coordinate system)
        for (let i = 0; i < this.chunks.length; i++) {
            const chunk = this.chunks[i];
            chunk.group.position.z += moveDist;

            // Update moving oncoming trains in this chunk
            for (const train of chunk.movingTrains) {
                train.z += train.speed * dt; // Moves forward toward player relative to chunk
                train.mesh.position.z = train.z;

                // Absolute train Z in world space
                const absTrainZ = chunk.group.position.z + train.z;
                // Train horn warning when approaching within 45m
                if (!train.hornBlown && absTrainZ < player.z && absTrainZ > player.z - 45) {
                    if (window.soundManager) window.soundManager.playTrainHorn();
                    train.hornBlown = true;
                }
            }

            // Animate spinning collectibles
            for (const col of chunk.collectibles) {
                if (col.collected) continue;
                col.mesh.rotation.y += dt * 3.5;
                if (col.type !== 'coin') {
                    // Floating bob
                    col.mesh.position.y = col.y + Math.sin(Date.now() * 0.005) * 0.15;
                }

                // Coin Magnet attraction physics
                if (player.hasMagnet && col.type === 'coin') {
                    // Calculate world position of coin
                    const absCoinX = col.x;
                    const absCoinY = col.y;
                    const absCoinZ = chunk.group.position.z + col.z;

                    const dx = player.x - absCoinX;
                    const dy = player.y - absCoinY;
                    const dz = player.z - absCoinZ;
                    const distSq = dx * dx + dy * dy + dz * dz;

                    if (distSq < 16 * 16) {
                        // Vacuum toward player!
                        col.x += dx * 14.0 * dt;
                        col.y += dy * 14.0 * dt;
                        col.z += dz * 14.0 * dt;
                        col.mesh.position.set(col.x, col.y, col.z);
                    }
                }

                // Check collision with player
                const absX = col.x;
                const absY = col.mesh.position.y;
                const absZ = chunk.group.position.z + col.z;

                const dx = Math.abs(player.x - absX);
                const dy = Math.abs(player.collider.centerY - absY);
                const dz = Math.abs(player.z - absZ);

                if (dx < 0.8 && dy < 1.4 && dz < 1.1) {
                    // Collected!
                    col.collected = true;
                    col.mesh.visible = false;
                    this.particles.spawnCoinSparkles(absX, absY, absZ);
                    onCollect(col);
                }
            }

            // Chunk recycling: If a chunk is fully behind player, reposition ahead
            if (chunk.group.position.z > this.chunkLength) {
                // Find chunk furthest ahead
                let minZ = 0;
                for (const c of this.chunks) {
                    if (c.group.position.z < minZ) minZ = c.group.position.z;
                }
                chunk.group.position.z = minZ - this.chunkLength;
                chunk.populate(false, this.worldZ);
            }
        }
    }

    // ------------------------------------------------------------------------
    // Collision Detection & Ground Support (Train Roofs & Obstacles)
    // ------------------------------------------------------------------------
    checkCollisions(player) {
        let detectedGroundY = 0;
        let onPlatform = false;

        for (const chunk of this.chunks) {
            const chunkZ = chunk.group.position.z;

            for (const obs of chunk.obstacles) {
                const absX = obs.x;
                const absZ = chunkZ + obs.z;

                const halfW = obs.width / 2;
                const halfD = obs.depth / 2;

                // Player bounds
                const pMinX = player.x - player.collider.width / 2;
                const pMaxX = player.x + player.collider.width / 2;
                const pMinZ = player.z - player.collider.depth / 2;
                const pMaxZ = player.z + player.collider.depth / 2;
                const pMinY = player.y;
                const pMaxY = player.y + player.collider.height;

                // Obstacle bounds
                const oMinX = absX - halfW;
                const oMaxX = absX + halfW;
                const oMinZ = absZ - halfD;
                const oMaxZ = absZ + halfD;

                // Overlap on X and Z
                const overlapX = (pMinX < oMaxX && pMaxX > oMinX);
                const overlapZ = (pMinZ < oMaxZ && pMaxZ > oMinZ);

                if (obs.type === 'train') {
                    // Check if player is on train roof
                    if (overlapX && overlapZ) {
                        if (pMinY >= obs.roofY - 0.4) {
                            // Standing or running on train roof!
                            detectedGroundY = Math.max(detectedGroundY, obs.roofY);
                            onPlatform = true;
                            continue;
                        }
                    }

                    // Check ramp entrance (rear ramp of train)
                    if (obs.hasRamp && overlapX) {
                        const rampStartZ = oMaxZ;
                        const rampEndZ = oMaxZ - obs.rampLength;
                        if (player.z <= rampStartZ && player.z >= rampEndZ) {
                            // On ramp: calculate ramp height slope
                            const progress = (rampStartZ - player.z) / obs.rampLength;
                            const rampY = progress * obs.roofY;
                            if (player.y <= rampY + 0.5) {
                                detectedGroundY = Math.max(detectedGroundY, rampY);
                                onPlatform = true;
                                continue;
                            }
                        }
                    }

                    // Direct train crash (Frontal or side)
                    if (overlapX && overlapZ) {
                        if (pMaxY > 0.4 && pMinY < obs.roofY - 0.2) {
                            return { hit: true, type: 'train', obstacle: obs };
                        }
                    }
                } else if (obs.type === 'low_barrier') {
                    if (overlapX && overlapZ) {
                        // Low barrier requires jumping over (height ~1.1m)
                        if (pMinY >= obs.height - 0.15) {
                            // Safely jumped over!
                            continue;
                        } else if (pMinY >= obs.height - 0.45) {
                            // Grazed edge: Stumble!
                            player.stumble();
                            continue;
                        } else {
                            // Direct hit
                            return { hit: true, type: 'low_barrier', obstacle: obs };
                        }
                    }
                } else if (obs.type === 'high_barrier') {
                    if (overlapX && overlapZ) {
                        // High barrier requires sliding under
                        if (player.isSliding) {
                            // Player is ducking safely underneath!
                            continue;
                        } else {
                            // Standing or jumping into overhead barrier: CRASH!
                            return { hit: true, type: 'high_barrier', obstacle: obs };
                        }
                    }
                }
            }
        }

        // Apply ground height
        player.groundY = detectedGroundY;
        return { hit: false };
    }
}

window.WorldManager = WorldManager;
