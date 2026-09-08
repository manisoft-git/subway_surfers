// ============================================================================
// Subway Surfers: Procedural 3D Models Builder
// Articulated characters, subway trains, track obstacles & power-ups
// ============================================================================

const ModelFactory = {
    // ------------------------------------------------------------------------
    // Player Character (Jake: Backwards Cap, Hoodie, Backpack, Sneakers)
    // ------------------------------------------------------------------------
    createPlayer() {
        const root = new THREE.Group();

        // Standard materials
        const skinMat = new THREE.MeshLambertMaterial({ color: 0xffdbac });
        const hoodieMat = new THREE.MeshLambertMaterial({ color: 0x2e86de }); // Electric blue hoodie
        const innerShirtMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const pantsMat = new THREE.MeshLambertMaterial({ color: 0x34495e }); // Denim jeans
        const shoeMat = new THREE.MeshLambertMaterial({ color: 0xee5253 }); // Red high-tops
        const soleMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const capMat = new THREE.MeshLambertMaterial({ color: 0xe74c3c }); // Red cap
        const hairMat = new THREE.MeshLambertMaterial({ color: 0x5d4037 }); // Brown hair
        const backpackMat = new THREE.MeshLambertMaterial({ color: 0x10ac84 }); // Teal backpack

        // Base container for vertical bouncing/bobbing
        const bodyContainer = new THREE.Group();
        root.add(bodyContainer);

        // Hips / Pelvis
        const hips = new THREE.Group();
        hips.position.y = 0.85;
        bodyContainer.add(hips);

        const pelvisGeo = new THREE.BoxGeometry(0.36, 0.2, 0.24);
        const pelvisMesh = new THREE.Mesh(pelvisGeo, pantsMat);
        pelvisMesh.castShadow = true;
        hips.add(pelvisMesh);

        // Torso / Spine
        const torso = new THREE.Group();
        torso.position.y = 0.1;
        hips.add(torso);

        const torsoGeo = new THREE.BoxGeometry(0.42, 0.5, 0.28);
        const torsoMesh = new THREE.Mesh(torsoGeo, hoodieMat);
        torsoMesh.position.y = 0.25;
        torsoMesh.castShadow = true;
        torso.add(torsoMesh);

        // Hoodie zipper / inner shirt stripe
        const innerShirtGeo = new THREE.PlaneGeometry(0.12, 0.44);
        const innerShirtMesh = new THREE.Mesh(innerShirtGeo, innerShirtMat);
        innerShirtMesh.position.set(0, 0.25, 0.142);
        torso.add(innerShirtMesh);

        // Backpack on back
        const backpackGeo = new THREE.BoxGeometry(0.34, 0.4, 0.16);
        const backpackMesh = new THREE.Mesh(backpackGeo, backpackMat);
        backpackMesh.position.set(0, 0.25, -0.2);
        backpackMesh.castShadow = true;
        torso.add(backpackMesh);

        // Spray cans sticking out of backpack
        const canGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.16, 8);
        const can1 = new THREE.Mesh(canGeo, new THREE.MeshLambertMaterial({ color: 0x9b59b6 }));
        can1.position.set(-0.09, 0.48, -0.2);
        can1.rotation.z = -0.2;
        torso.add(can1);

        const can2 = new THREE.Mesh(canGeo, new THREE.MeshLambertMaterial({ color: 0xf1c40f }));
        can2.position.set(0.09, 0.48, -0.2);
        can2.rotation.z = 0.2;
        torso.add(can2);

        // Head Group
        const headGroup = new THREE.Group();
        headGroup.position.y = 0.54;
        torso.add(headGroup);

        // Neck
        const neckGeo = new THREE.CylinderGeometry(0.09, 0.1, 0.08, 8);
        const neckMesh = new THREE.Mesh(neckGeo, skinMat);
        neckMesh.position.y = 0.04;
        headGroup.add(neckMesh);

        // Head
        const headGeo = new THREE.BoxGeometry(0.3, 0.3, 0.28);
        const headMesh = new THREE.Mesh(headGeo, skinMat);
        headMesh.position.y = 0.2;
        headMesh.castShadow = true;
        headGroup.add(headMesh);

        // Hair front fringe
        const hairGeo = new THREE.BoxGeometry(0.31, 0.08, 0.1);
        const hairMesh = new THREE.Mesh(hairGeo, hairMat);
        hairMesh.position.set(0, 0.32, 0.1);
        headGroup.add(hairMesh);

        // Eyes
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
        const eyeGeo = new THREE.BoxGeometry(0.04, 0.05, 0.02);
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.07, 0.22, 0.142);
        headGroup.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.07, 0.22, 0.142);
        headGroup.add(rightEye);

        // Backwards Baseball Cap
        const capDomeGeo = new THREE.SphereGeometry(0.18, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2);
        const capDome = new THREE.Mesh(capDomeGeo, capMat);
        capDome.position.set(0, 0.28, 0);
        headGroup.add(capDome);

        // Cap Visor pointing backward
        const visorGeo = new THREE.BoxGeometry(0.24, 0.025, 0.16);
        const visorMesh = new THREE.Mesh(visorGeo, capMat);
        visorMesh.position.set(0, 0.27, -0.18);
        visorMesh.rotation.x = 0.1;
        headGroup.add(visorMesh);

        // Left Arm Hierarchy
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.25, 0.44, 0);
        torso.add(leftShoulder);

        const upperArmGeo = new THREE.BoxGeometry(0.11, 0.24, 0.11);
        const leftUpperArm = new THREE.Mesh(upperArmGeo, hoodieMat);
        leftUpperArm.position.y = -0.12;
        leftShoulder.add(leftUpperArm);

        const leftElbow = new THREE.Group();
        leftElbow.position.y = -0.24;
        leftShoulder.add(leftElbow);

        const forearmGeo = new THREE.BoxGeometry(0.09, 0.22, 0.09);
        const leftForearm = new THREE.Mesh(forearmGeo, skinMat);
        leftForearm.position.y = -0.11;
        leftElbow.add(leftForearm);

        // Right Arm Hierarchy
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.25, 0.44, 0);
        torso.add(rightShoulder);

        const rightUpperArm = new THREE.Mesh(upperArmGeo, hoodieMat);
        rightUpperArm.position.y = -0.12;
        rightShoulder.add(rightUpperArm);

        const rightElbow = new THREE.Group();
        rightElbow.position.y = -0.24;
        rightShoulder.add(rightElbow);

        const rightForearm = new THREE.Mesh(forearmGeo, skinMat);
        rightForearm.position.y = -0.11;
        rightElbow.add(rightForearm);

        // Spray can held in right hand
        const handCan = new THREE.Mesh(canGeo, new THREE.MeshLambertMaterial({ color: 0x00d2d3 }));
        handCan.position.set(0, -0.22, 0.08);
        handCan.rotation.x = Math.PI / 2;
        rightElbow.add(handCan);

        // Left Leg Hierarchy
        const leftHip = new THREE.Group();
        leftHip.position.set(-0.12, -0.05, 0);
        hips.add(leftHip);

        const thighGeo = new THREE.BoxGeometry(0.14, 0.36, 0.14);
        const leftThigh = new THREE.Mesh(thighGeo, pantsMat);
        leftThigh.position.y = -0.18;
        leftHip.add(leftThigh);

        const leftKnee = new THREE.Group();
        leftKnee.position.y = -0.36;
        leftHip.add(leftKnee);

        const shinGeo = new THREE.BoxGeometry(0.12, 0.34, 0.12);
        const leftShin = new THREE.Mesh(shinGeo, pantsMat);
        leftShin.position.y = -0.17;
        leftKnee.add(leftShin);

        // Left Sneaker
        const footGeo = new THREE.BoxGeometry(0.14, 0.12, 0.26);
        const leftShoe = new THREE.Mesh(footGeo, shoeMat);
        leftShoe.position.set(0, -0.34, 0.05);
        leftShoe.castShadow = true;
        leftKnee.add(leftShoe);

        const soleGeo = new THREE.BoxGeometry(0.15, 0.04, 0.28);
        const leftSole = new THREE.Mesh(soleGeo, soleMat);
        leftSole.position.set(0, -0.39, 0.05);
        leftKnee.add(leftSole);

        // Right Leg Hierarchy
        const rightHip = new THREE.Group();
        rightHip.position.set(0.12, -0.05, 0);
        hips.add(rightHip);

        const rightThigh = new THREE.Mesh(thighGeo, pantsMat);
        rightThigh.position.y = -0.18;
        rightHip.add(rightThigh);

        const rightKnee = new THREE.Group();
        rightKnee.position.y = -0.36;
        rightHip.add(rightKnee);

        const rightShin = new THREE.Mesh(shinGeo, pantsMat);
        rightShin.position.y = -0.17;
        rightKnee.add(rightShin);

        // Right Sneaker
        const rightShoe = new THREE.Mesh(footGeo, shoeMat);
        rightShoe.position.set(0, -0.34, 0.05);
        rightShoe.castShadow = true;
        rightKnee.add(rightShoe);

        const rightSole = new THREE.Mesh(soleGeo, soleMat);
        rightSole.position.set(0, -0.39, 0.05);
        rightKnee.add(rightSole);

        // --------------------------------------------------------------------
        // Hoverboard Attachment (Under Feet)
        // --------------------------------------------------------------------
        const boardGroup = new THREE.Group();
        boardGroup.position.set(0, 0.06, 0);
        boardGroup.visible = false;
        root.add(boardGroup);

        // Hoverboard deck
        const boardShape = new THREE.Shape();
        boardShape.moveTo(-0.25, -0.6);
        boardShape.lineTo(0.25, -0.6);
        boardShape.quadraticCurveTo(0.3, 0, 0.25, 0.6);
        boardShape.quadraticCurveTo(0, 0.75, -0.25, 0.6);
        boardShape.quadraticCurveTo(-0.3, 0, -0.25, -0.6);

        const boardGeo = new THREE.BoxGeometry(0.48, 0.06, 1.2);
        const boardMat = new THREE.MeshLambertMaterial({ color: 0xff007f });
        const boardMesh = new THREE.Mesh(boardGeo, boardMat);
        boardMesh.castShadow = true;
        boardGroup.add(boardMesh);

        // Neon Glow Trim
        const trimGeo = new THREE.BoxGeometry(0.51, 0.03, 1.23);
        const trimMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
        const trimMesh = new THREE.Mesh(trimGeo, trimMat);
        boardGroup.add(trimMesh);

        // Hover Thruster Rings
        const thrusterGeo = new THREE.CylinderGeometry(0.08, 0.06, 0.05, 12);
        const thrusterMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
        const thruster1 = new THREE.Mesh(thrusterGeo, thrusterMat);
        thruster1.position.set(0, -0.04, -0.35);
        boardGroup.add(thruster1);
        const thruster2 = new THREE.Mesh(thrusterGeo, thrusterMat);
        thruster2.position.set(0, -0.04, 0.35);
        boardGroup.add(thruster2);

        // --------------------------------------------------------------------
        // Jetpack Attachment (On Torso Back)
        // --------------------------------------------------------------------
        const jetpackGroup = new THREE.Group();
        jetpackGroup.position.set(0, 0.25, -0.25);
        jetpackGroup.visible = false;
        torso.add(jetpackGroup);

        const tankGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.45, 12);
        const tankMat = new THREE.MeshLambertMaterial({ color: 0xdcdde1 });
        const tank1 = new THREE.Mesh(tankGeo, tankMat);
        tank1.position.set(-0.12, 0, 0);
        jetpackGroup.add(tank1);

        const tank2 = new THREE.Mesh(tankGeo, tankMat);
        tank2.position.set(0.12, 0, 0);
        jetpackGroup.add(tank2);

        // Red top caps
        const capGeom = new THREE.ConeGeometry(0.08, 0.1, 12);
        const capM = new THREE.MeshBasicMaterial({ color: 0xe84118 });
        const jetCap1 = new THREE.Mesh(capGeom, capM);
        jetCap1.position.set(-0.12, 0.26, 0);
        jetpackGroup.add(jetCap1);
        const jetCap2 = new THREE.Mesh(capGeom, capM);
        jetCap2.position.set(0.12, 0.26, 0);
        jetpackGroup.add(jetCap2);

        // Thruster Nozzles
        const nozGeo = new THREE.CylinderGeometry(0.05, 0.09, 0.1, 12);
        const nozMat = new THREE.MeshLambertMaterial({ color: 0x2f3640 });
        const noz1 = new THREE.Mesh(nozGeo, nozMat);
        noz1.position.set(-0.12, -0.25, 0);
        jetpackGroup.add(noz1);
        const noz2 = new THREE.Mesh(nozGeo, nozMat);
        noz2.position.set(0.12, -0.25, 0);
        jetpackGroup.add(noz2);

        // --------------------------------------------------------------------
        // Super Sneakers Attachment (Enlarged Spring Boots)
        // --------------------------------------------------------------------
        const springBootGroup = new THREE.Group();
        springBootGroup.visible = false;
        root.add(springBootGroup);

        return {
            root,
            bodyContainer,
            hips,
            torso,
            headGroup,
            leftShoulder,
            leftElbow,
            rightShoulder,
            rightElbow,
            leftHip,
            leftKnee,
            rightHip,
            rightKnee,
            boardGroup,
            jetpackGroup
        };
    },

    // ------------------------------------------------------------------------
    // Grumpy Inspector & Bulldog Chaser
    // ------------------------------------------------------------------------
    createInspector() {
        const root = new THREE.Group();

        const uniformMat = new THREE.MeshLambertMaterial({ color: 0x192a56 }); // Deep police navy
        const beltMat = new THREE.MeshLambertMaterial({ color: 0x2f3640 });
        const buckleMat = new THREE.MeshLambertMaterial({ color: 0xf1c40f }); // Gold buckle
        const skinMat = new THREE.MeshLambertMaterial({ color: 0xffdbac });
        const mustacheMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const shoeMat = new THREE.MeshLambertMaterial({ color: 0x1e272e });

        const bodyContainer = new THREE.Group();
        root.add(bodyContainer);

        // Stout round belly
        const bellyGeo = new THREE.BoxGeometry(0.56, 0.6, 0.44);
        const bellyMesh = new THREE.Mesh(bellyGeo, uniformMat);
        bellyMesh.position.y = 0.9;
        bellyMesh.castShadow = true;
        bodyContainer.add(bellyMesh);

        // Belt
        const beltGeo = new THREE.BoxGeometry(0.58, 0.08, 0.46);
        const beltMesh = new THREE.Mesh(beltGeo, beltMat);
        beltMesh.position.y = 0.72;
        bodyContainer.add(beltMesh);

        // Buckle
        const buckleGeo = new THREE.BoxGeometry(0.12, 0.1, 0.48);
        const buckleMesh = new THREE.Mesh(buckleGeo, buckleMat);
        buckleMesh.position.y = 0.72;
        bodyContainer.add(buckleMesh);

        // Head
        const headGeo = new THREE.BoxGeometry(0.36, 0.36, 0.34);
        const headMesh = new THREE.Mesh(headGeo, skinMat);
        headMesh.position.y = 1.34;
        headMesh.castShadow = true;
        bodyContainer.add(headMesh);

        // Handlebar mustache
        const mustacheGeo = new THREE.BoxGeometry(0.26, 0.08, 0.08);
        const mustacheMesh = new THREE.Mesh(mustacheGeo, mustacheMat);
        mustacheMesh.position.set(0, 1.28, 0.18);
        bodyContainer.add(mustacheMesh);

        // Peaked Inspector Cap
        const capGeo = new THREE.CylinderGeometry(0.24, 0.22, 0.15, 12);
        const capMesh = new THREE.Mesh(capGeo, uniformMat);
        capMesh.position.y = 1.55;
        bodyContainer.add(capMesh);

        const capVisorGeo = new THREE.BoxGeometry(0.28, 0.02, 0.14);
        const capVisor = new THREE.Mesh(capVisorGeo, beltMat);
        capVisor.position.set(0, 1.5, 0.18);
        bodyContainer.add(capVisor);

        // Arms
        const leftArm = new THREE.Group();
        leftArm.position.set(-0.35, 1.1, 0);
        bodyContainer.add(leftArm);
        const armGeo = new THREE.BoxGeometry(0.14, 0.44, 0.14);
        const leftArmMesh = new THREE.Mesh(armGeo, uniformMat);
        leftArmMesh.position.y = -0.22;
        leftArm.add(leftArmMesh);

        const rightArm = new THREE.Group();
        rightArm.position.set(0.35, 1.1, 0);
        bodyContainer.add(rightArm);
        const rightArmMesh = new THREE.Mesh(armGeo, uniformMat);
        rightArmMesh.position.y = -0.22;
        rightArm.add(rightArmMesh);

        // Police Baton held in right hand
        const batonGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.45, 8);
        const batonMesh = new THREE.Mesh(batonGeo, beltMat);
        batonMesh.position.set(0, -0.42, 0.15);
        batonMesh.rotation.x = Math.PI / 2.5;
        rightArm.add(batonMesh);

        // Legs
        const legGeo = new THREE.BoxGeometry(0.18, 0.55, 0.18);
        const leftLeg = new THREE.Group();
        leftLeg.position.set(-0.16, 0.6, 0);
        bodyContainer.add(leftLeg);
        const leftLegMesh = new THREE.Mesh(legGeo, uniformMat);
        leftLegMesh.position.y = -0.25;
        leftLeg.add(leftLegMesh);

        const leftBoot = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.12, 0.28), shoeMat);
        leftBoot.position.set(0, -0.5, 0.04);
        leftLeg.add(leftBoot);

        const rightLeg = new THREE.Group();
        rightLeg.position.set(0.16, 0.6, 0);
        bodyContainer.add(rightLeg);
        const rightLegMesh = new THREE.Mesh(legGeo, uniformMat);
        rightLegMesh.position.y = -0.25;
        rightLeg.add(rightLegMesh);

        const rightBoot = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.12, 0.28), shoeMat);
        rightBoot.position.set(0, -0.5, 0.04);
        rightLeg.add(rightBoot);

        // --------------------------------------------------------------------
        // Bulldog Chaser Running Alongside
        // --------------------------------------------------------------------
        const dogGroup = new THREE.Group();
        dogGroup.position.set(0.8, 0, 0);
        root.add(dogGroup);

        const dogMat = new THREE.MeshLambertMaterial({ color: 0x8d6e63 }); // Brown bulldog fur
        const collarMat = new THREE.MeshLambertMaterial({ color: 0xe84118 }); // Spiked collar

        // Chunky dog torso
        const dogBodyGeo = new THREE.BoxGeometry(0.32, 0.28, 0.52);
        const dogBody = new THREE.Mesh(dogBodyGeo, dogMat);
        dogBody.position.y = 0.28;
        dogGroup.add(dogBody);

        // Dog head
        const dogHeadGeo = new THREE.BoxGeometry(0.28, 0.25, 0.26);
        const dogHead = new THREE.Mesh(dogHeadGeo, dogMat);
        dogHead.position.set(0, 0.38, 0.32);
        dogGroup.add(dogHead);

        // Spiked collar
        const collarGeo = new THREE.BoxGeometry(0.3, 0.06, 0.28);
        const collarMesh = new THREE.Mesh(collarGeo, collarMat);
        collarMesh.position.set(0, 0.32, 0.22);
        dogGroup.add(collarMesh);

        // Stubby bounding legs
        const dogLegGeo = new THREE.BoxGeometry(0.08, 0.2, 0.08);
        const dogLegs = [];
        [[-0.12, 0.18], [0.12, 0.18], [-0.12, -0.18], [0.12, -0.18]].forEach(pos => {
            const leg = new THREE.Mesh(dogLegGeo, dogMat);
            leg.position.set(pos[0], 0.1, pos[1]);
            dogGroup.add(leg);
            dogLegs.push(leg);
        });

        return {
            root,
            bodyContainer,
            leftArm,
            rightArm,
            leftLeg,
            rightLeg,
            dogGroup,
            dogLegs
        };
    },

    // ------------------------------------------------------------------------
    // Subway Train Carriages (Static & Moving)
    // ------------------------------------------------------------------------
    createTrain(options = {}) {
        const { type = 'blue', length = 22, hasRamp = false } = options;
        const group = new THREE.Group();

        const sideTexture = TextureGenerator.createTrainSideTexture(type);
        const frontTexture = TextureGenerator.createTrainFrontTexture(type);
        const hazardTexture = TextureGenerator.createHazardTexture();

        const width = 2.4;
        const height = 3.6;

        // Side material (uses custom train texture)
        const sideMat = new THREE.MeshLambertMaterial({ map: sideTexture });
        const frontMat = new THREE.MeshLambertMaterial({ map: frontTexture });
        const roofMat = new THREE.MeshLambertMaterial({ color: 0x95a5a6 });
        const bottomMat = new THREE.MeshLambertMaterial({ color: 0x2c3e50 });

        // Body geometry
        // Face order: Right(+x), Left(-x), Top(+y), Bottom(-y), Front(+z), Back(-z)
        const materials = [
            sideMat,   // right
            sideMat,   // left
            roofMat,   // top (where player runs)
            bottomMat, // bottom
            frontMat,  // front
            frontMat   // back
        ];

        const bodyGeo = new THREE.BoxGeometry(width, height, length);
        const bodyMesh = new THREE.Mesh(bodyGeo, materials);
        bodyMesh.position.y = height / 2 + 0.3; // Raised for bogies/wheels
        bodyMesh.castShadow = true;
        bodyMesh.receiveShadow = true;
        group.add(bodyMesh);

        // Train Roof Walkway Non-Slip Track
        const roofWalkGeo = new THREE.PlaneGeometry(1.6, length - 1);
        const roofWalkMat = new THREE.MeshLambertMaterial({ color: 0x7f8c8d });
        const roofWalk = new THREE.Mesh(roofWalkGeo, roofWalkMat);
        roofWalk.rotation.x = -Math.PI / 2;
        roofWalk.position.y = height + 0.31;
        roofWalk.receiveShadow = true;
        group.add(roofWalk);

        // Roof AC units / vents
        const acGeo = new THREE.BoxGeometry(1.2, 0.25, 2.5);
        const acMat = new THREE.MeshLambertMaterial({ color: 0x576574 });
        for (let z = -length / 3; z <= length / 3; z += length / 3) {
            const ac = new THREE.Mesh(acGeo, acMat);
            ac.position.set(0, height + 0.44, z);
            group.add(ac);
        }

        // Under-carriage Wheel Bogies
        const wheelMat = new THREE.MeshLambertMaterial({ color: 0x1e272e });
        const bogieGeo = new THREE.BoxGeometry(width - 0.4, 0.45, 2.5);
        [-length / 2 + 2.5, length / 2 - 2.5].forEach(bz => {
            const bogie = new THREE.Mesh(bogieGeo, bottomMat);
            bogie.position.set(0, 0.3, bz);
            group.add(bogie);

            // Steel wheels
            const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.15, 12);
            [-0.8, 0.8].forEach(wz => {
                [-width / 2 + 0.2, width / 2 - 0.2].forEach(wx => {
                    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
                    wheel.rotation.z = Math.PI / 2;
                    wheel.position.set(wx, 0.3, bz + wz);
                    group.add(wheel);
                });
            });
        });

        // --------------------------------------------------------------------
        // Ramp Attachment (Rear inclined ramp to run up onto train roof)
        // --------------------------------------------------------------------
        if (hasRamp) {
            const rampLength = 6.0;
            const rampGroup = new THREE.Group();
            rampGroup.position.set(0, 0, length / 2 + rampLength / 2);

            // Wedge geometry
            const rampGeo = new THREE.BoxGeometry(width - 0.2, 0.2, rampLength);
            const rampMat = new THREE.MeshLambertMaterial({ map: hazardTexture });
            const rampMesh = new THREE.Mesh(rampGeo, rampMat);

            const rampAngle = Math.atan2(height, rampLength);
            rampMesh.rotation.x = rampAngle;
            rampMesh.position.y = height / 2 + 0.15;
            rampMesh.castShadow = true;
            rampMesh.receiveShadow = true;
            rampGroup.add(rampMesh);

            // Side guard rails
            const railGeo = new THREE.BoxGeometry(0.1, 0.6, rampLength);
            const railMat = new THREE.MeshLambertMaterial({ color: 0xe74c3c });
            const leftRail = new THREE.Mesh(railGeo, railMat);
            leftRail.rotation.x = rampAngle;
            leftRail.position.set(-width / 2 + 0.1, height / 2 + 0.45, 0);
            rampGroup.add(leftRail);

            const rightRail = new THREE.Mesh(railGeo, railMat);
            rightRail.rotation.x = rampAngle;
            rightRail.position.set(width / 2 - 0.1, height / 2 + 0.45, 0);
            rampGroup.add(rightRail);

            group.add(rampGroup);
        }

        // Bounding collision metadata
        group.userData = {
            width,
            height,
            length: hasRamp ? length + 6.0 : length,
            roofY: height + 0.3,
            hasRamp
        };

        return group;
    },

    // ------------------------------------------------------------------------
    // Track Hurdles & Barriers (Jump Over & Slide Under)
    // ------------------------------------------------------------------------
    createLowBarrier() {
        const group = new THREE.Group();
        const hazardMat = new THREE.MeshLambertMaterial({ map: TextureGenerator.createHazardTexture() });
        const postMat = new THREE.MeshLambertMaterial({ color: 0x7f8c8d });

        // Barrier Planks (Jumpable) - Height ~1.0m
        const plankGeo = new THREE.BoxGeometry(2.2, 0.45, 0.15);
        const plank = new THREE.Mesh(plankGeo, hazardMat);
        plank.position.y = 0.65;
        plank.castShadow = true;
        group.add(plank);

        // Support Posts
        const postGeo = new THREE.CylinderGeometry(0.06, 0.08, 1.1, 8);
        [-0.9, 0.9].forEach(px => {
            const post = new THREE.Mesh(postGeo, postMat);
            post.position.set(px, 0.55, 0);
            post.castShadow = true;
            group.add(post);

            // Flashing warning beacon
            const lightGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.12, 8);
            const light = new THREE.Mesh(lightGeo, new THREE.MeshBasicMaterial({ color: 0xff9f43 }));
            light.position.set(px, 1.15, 0);
            group.add(light);
        });

        group.userData = {
            type: 'low_barrier',
            width: 2.2,
            height: 1.1,
            jumpable: true
        };

        return group;
    },

    createHighBarrier() {
        const group = new THREE.Group();
        const frameMat = new THREE.MeshLambertMaterial({ color: 0x34495e });
        const signMat = new THREE.MeshLambertMaterial({ map: TextureGenerator.createHazardTexture() });

        // Steel overhead gantry crossbar - Clearance underneath ~1.1m (Slide under!)
        const barGeo = new THREE.BoxGeometry(2.4, 0.6, 0.2);
        const barMesh = new THREE.Mesh(barGeo, signMat);
        barMesh.position.y = 2.1;
        barMesh.castShadow = true;
        group.add(barMesh);

        // Warning hanging pipes
        const pipeGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8);
        const pipeMat = new THREE.MeshLambertMaterial({ color: 0xe74c3c });
        for (let x = -0.8; x <= 0.8; x += 0.4) {
            const pipe = new THREE.Mesh(pipeGeo, pipeMat);
            pipe.position.set(x, 1.55, 0);
            group.add(pipe);
        }

        // Side upright steel pillars
        const pillarGeo = new THREE.BoxGeometry(0.15, 2.6, 0.15);
        [-1.15, 1.15].forEach(px => {
            const pillar = new THREE.Mesh(pillarGeo, frameMat);
            pillar.position.set(px, 1.3, 0);
            pillar.castShadow = true;
            group.add(pillar);
        });

        group.userData = {
            type: 'high_barrier',
            width: 2.4,
            height: 2.6,
            clearanceY: 1.25, // Player must slide/duck to pass!
            slidable: true
        };

        return group;
    },

    // ------------------------------------------------------------------------
    // Collectibles: Coins, Letters & Power-Ups
    // ------------------------------------------------------------------------
    createCoin() {
        const group = new THREE.Group();
        const coinMat = new THREE.MeshLambertMaterial({
            map: TextureGenerator.createCoinTexture(),
            color: 0xffe600
        });

        // Cylinder coin with bevel
        const coinGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.09, 20);
        const coinMesh = new THREE.Mesh(coinGeo, coinMat);
        coinMesh.rotation.x = Math.PI / 2;
        group.add(coinMesh);

        group.userData = { type: 'coin', radius: 0.5 };
        return group;
    },

    createMagnet() {
        const group = new THREE.Group();

        // U-Shape Horseshoe Magnet
        const redMat = new THREE.MeshLambertMaterial({ color: 0xee5253 });
        const silverMat = new THREE.MeshLambertMaterial({ color: 0xf5f6fa });

        // Arc top
        const arcGeo = new THREE.TorusGeometry(0.32, 0.1, 8, 16, Math.PI);
        const arcMesh = new THREE.Mesh(arcGeo, redMat);
        arcMesh.rotation.z = Math.PI;
        group.add(arcMesh);

        // Two prongs
        const prongGeo = new THREE.BoxGeometry(0.18, 0.35, 0.18);
        const prongL = new THREE.Mesh(prongGeo, redMat);
        prongL.position.set(-0.32, -0.18, 0);
        group.add(prongL);

        const prongR = new THREE.Mesh(prongGeo, redMat);
        prongR.position.set(0.32, -0.18, 0);
        group.add(prongR);

        // Silver magnetic tips
        const tipGeo = new THREE.BoxGeometry(0.18, 0.14, 0.18);
        const tipL = new THREE.Mesh(tipGeo, silverMat);
        tipL.position.set(-0.32, -0.4, 0);
        group.add(tipL);

        const tipR = new THREE.Mesh(tipGeo, silverMat);
        tipR.position.set(0.32, -0.4, 0);
        group.add(tipR);

        // Glowing magnetic aura sphere
        const auraGeo = new THREE.SphereGeometry(0.55, 12, 12);
        const auraMat = new THREE.MeshBasicMaterial({ color: 0x00d2d3, wireframe: true, transparent: true, opacity: 0.4 });
        group.add(new THREE.Mesh(auraGeo, auraMat));

        group.userData = { type: 'magnet' };
        return group;
    },

    createSuperSneakers() {
        const group = new THREE.Group();

        // High-top neon sneaker with spring
        const bootGeo = new THREE.BoxGeometry(0.4, 0.35, 0.7);
        const bootMat = new THREE.MeshLambertMaterial({ color: 0x1dd1a1 }); // Neon green
        const bootMesh = new THREE.Mesh(bootGeo, bootMat);
        bootMesh.position.y = 0.25;
        group.add(bootMesh);

        // Spring coil underneath
        const springGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.25, 12);
        const springMat = new THREE.MeshLambertMaterial({ color: 0xfeca57 });
        const springMesh = new THREE.Mesh(springGeo, springMat);
        springMesh.position.y = -0.05;
        group.add(springMesh);

        // Wing decals
        const wingGeo = new THREE.BoxGeometry(0.04, 0.2, 0.3);
        const wingMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const wingL = new THREE.Mesh(wingGeo, wingMat);
        wingL.position.set(-0.24, 0.3, 0);
        wingL.rotation.z = -0.3;
        group.add(wingL);

        const wingR = new THREE.Mesh(wingGeo, wingMat);
        wingR.position.set(0.24, 0.3, 0);
        wingR.rotation.z = 0.3;
        group.add(wingR);

        group.userData = { type: 'sneakers' };
        return group;
    },

    createJetpackItem() {
        const group = new THREE.Group();

        const tankMat = new THREE.MeshLambertMaterial({ color: 0xff9f43 });
        const nozzleMat = new THREE.MeshLambertMaterial({ color: 0x576574 });

        // Dual rocket canisters
        const tankGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.65, 12);
        const t1 = new THREE.Mesh(tankGeo, tankMat);
        t1.position.x = -0.2;
        group.add(t1);

        const t2 = new THREE.Mesh(tankGeo, tankMat);
        t2.position.x = 0.2;
        group.add(t2);

        // Thruster flame cone
        const flameGeo = new THREE.ConeGeometry(0.12, 0.28, 8);
        const flameMat = new THREE.MeshBasicMaterial({ color: 0xff4757 });
        const f1 = new THREE.Mesh(flameGeo, flameMat);
        f1.position.set(-0.2, -0.45, 0);
        f1.rotation.x = Math.PI;
        group.add(f1);

        const f2 = new THREE.Mesh(flameGeo, flameMat);
        f2.position.set(0.2, -0.45, 0);
        f2.rotation.x = Math.PI;
        group.add(f2);

        group.userData = { type: 'jetpack' };
        return group;
    },

    create2xMultiplier() {
        const group = new THREE.Group();

        // 5-point Gold Star Medallion
        const starGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.12, 8);
        const starMat = new THREE.MeshLambertMaterial({ color: 0xff9f1a });
        const starMesh = new THREE.Mesh(starGeo, starMat);
        starMesh.rotation.x = Math.PI / 2;
        group.add(starMesh);

        // '2X' 3D block text proxy
        const textGeo = new THREE.BoxGeometry(0.5, 0.3, 0.16);
        const textMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        group.add(new THREE.Mesh(textGeo, textMat));

        group.userData = { type: 'multiplier' };
        return group;
    },

    // ------------------------------------------------------------------------
    // Daily Word Hunt Letters ('S', 'U', 'R', 'F')
    // ------------------------------------------------------------------------
    createLetter(char = 'S') {
        const group = new THREE.Group();

        // High-contrast canvas texture for 3D letter block
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#ff3838';
        ctx.fillRect(0, 0, 128, 128);

        ctx.strokeStyle = '#fff200';
        ctx.lineWidth = 10;
        ctx.strokeRect(5, 5, 118, 118);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 90px Impact, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(char, 64, 68);

        const tex = new THREE.CanvasTexture(canvas);
        const mat = new THREE.MeshLambertMaterial({ map: tex });
        const boxGeo = new THREE.BoxGeometry(0.7, 0.7, 0.2);
        const mesh = new THREE.Mesh(boxGeo, mat);
        group.add(mesh);

        // Surrounding glow halo
        const haloGeo = new THREE.RingGeometry(0.5, 0.65, 16);
        const haloMat = new THREE.MeshBasicMaterial({ color: 0xfffa65, side: THREE.DoubleSide });
        group.add(new THREE.Mesh(haloGeo, haloMat));

        group.userData = { type: 'letter', letter: char };
        return group;
    },

    // ------------------------------------------------------------------------
    // Mystery Box (Iconic Purple & Gold Striped Cube with Ribbon)
    // ------------------------------------------------------------------------
    createMysteryBox() {
        const group = new THREE.Group();

        const boxGeo = new THREE.BoxGeometry(0.75, 0.75, 0.75);
        const boxMat = new THREE.MeshLambertMaterial({ color: 0x8e44ad });
        const box = new THREE.Mesh(boxGeo, boxMat);
        box.castShadow = true;
        group.add(box);

        // Gold cross ribbons
        const ribMat = new THREE.MeshLambertMaterial({ color: 0xf1c40f });
        const r1 = new THREE.Mesh(new THREE.BoxGeometry(0.77, 0.77, 0.16), ribMat);
        group.add(r1);

        const r2 = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.77, 0.77), ribMat);
        group.add(r2);

        // Glowing question mark aura
        const auraGeo = new THREE.SphereGeometry(0.68, 12, 12);
        const auraMat = new THREE.MeshBasicMaterial({ color: 0xfffa65, wireframe: true, transparent: true, opacity: 0.4 });
        group.add(new THREE.Mesh(auraGeo, auraMat));

        group.userData = { type: 'mystery_box' };
        return group;
    },

    // ------------------------------------------------------------------------
    // Headstart Supersonic Rocket Boost Pickup
    // ------------------------------------------------------------------------
    createHeadstartItem() {
        const group = new THREE.Group();
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0xffd32a }); // Bright Gold
        const wingMat = new THREE.MeshLambertMaterial({ color: 0xff3f34 }); // Red fins

        // Rocket fuselage
        const fuseGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.9, 12);
        const fuse = new THREE.Mesh(fuseGeo, bodyMat);
        group.add(fuse);

        // Nosecone
        const coneGeo = new THREE.ConeGeometry(0.18, 0.35, 12);
        const cone = new THREE.Mesh(coneGeo, wingMat);
        cone.position.y = 0.6;
        group.add(cone);

        // Stabilizer fins
        const finGeo = new THREE.BoxGeometry(0.04, 0.3, 0.6);
        const fin1 = new THREE.Mesh(finGeo, wingMat);
        fin1.position.y = -0.3;
        group.add(fin1);

        const fin2 = new THREE.Mesh(finGeo, wingMat);
        fin2.position.y = -0.3;
        fin2.rotation.y = Math.PI / 2;
        group.add(fin2);

        group.userData = { type: 'headstart' };
        return group;
    },

    // ------------------------------------------------------------------------
    // Subway Tunnel Portal Arch
    // ------------------------------------------------------------------------
    createTunnelArch() {
        const group = new THREE.Group();
        const archMat = new THREE.MeshLambertMaterial({ color: 0x3d3d3d });
        const lampMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });

        const beam = new THREE.Mesh(new THREE.BoxGeometry(11.8, 1.8, 1.5), archMat);
        beam.position.y = 5.6;
        group.add(beam);

        const postL = new THREE.Mesh(new THREE.BoxGeometry(1.2, 5.6, 1.5), archMat);
        postL.position.set(-5.3, 2.8, 0);
        group.add(postL);

        const postR = new THREE.Mesh(new THREE.BoxGeometry(1.2, 5.6, 1.5), archMat);
        postR.position.set(5.3, 2.8, 0);
        group.add(postR);

        // Sodium lamps
        [-3.2, 0, 3.2].forEach(lx => {
            const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), lampMat);
            lamp.position.set(lx, 4.8, 0.8);
            group.add(lamp);
        });

        return group;
    }
};

window.ModelFactory = ModelFactory;
