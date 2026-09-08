// ============================================================================
// Subway Surfers: Procedural Texture Generator
// Creates high-resolution canvas textures for Three.js without external images
// ============================================================================

if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r = 0) {
        if (typeof r === 'number') r = [r, r, r, r];
        const [tl, tr, br, bl] = r.length === 1 ? [r[0], r[0], r[0], r[0]] : (r.length === 2 ? [r[0], r[1], r[0], r[1]] : r);
        this.beginPath();
        this.moveTo(x + tl, y);
        this.lineTo(x + w - tr, y);
        this.quadraticCurveTo(x + w, y, x + w, y + tr);
        this.lineTo(x + w, y + h - br);
        this.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
        this.lineTo(x + bl, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - bl);
        this.lineTo(x, y + tl);
        this.quadraticCurveTo(x, y, x + tl, y);
        this.closePath();
        return this;
    };
}

const TextureGenerator = {
    cache: {},

    // ------------------------------------------------------------------------
    // Vibrant Graffiti Wall Texture
    // ------------------------------------------------------------------------
    createGraffitiTexture(variant = 0) {
        const key = 'graffiti_' + variant;
        if (this.cache[key]) return this.cache[key];

        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Concrete brick/wall background
        ctx.fillStyle = '#6e7075';
        ctx.fillRect(0, 0, 512, 256);

        // Brick mortar lines
        ctx.strokeStyle = '#505256';
        ctx.lineWidth = 3;
        for (let y = 0; y < 256; y += 32) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(512, y);
            ctx.stroke();
            const offset = (y / 32) % 2 === 0 ? 0 : 32;
            for (let x = offset; x < 512; x += 64) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x, y + 32);
                ctx.stroke();
            }
        }

        // Add weather grime / splatters
        for (let i = 0; i < 200; i++) {
            ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.06)';
            ctx.beginPath();
            ctx.arc(Math.random() * 512, Math.random() * 256, Math.random() * 4, 0, Math.PI * 2);
            ctx.fill();
        }

        // Wild graffiti tags
        const words = [
            { text: 'SURF', colors: ['#ff0055', '#ff9900', '#ffff00'] },
            { text: 'RUSH', colors: ['#00e5ff', '#00ff66', '#ffffff'] },
            { text: 'SUBWAY', colors: ['#9d00ff', '#ff00aa', '#00ffff'] },
            { text: 'TAG', colors: ['#ff3300', '#ffcc00', '#33ccff'] }
        ];
        const tag = words[variant % words.length];

        ctx.save();
        ctx.translate(256, 128);
        ctx.rotate((Math.random() - 0.5) * 0.2);

        // Bubble 3D Drop Shadow
        ctx.font = '900 86px Impact, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillStyle = '#0a0a14';
        ctx.fillText(tag.text, 12, 12);

        // Thick black stroke
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 18;
        ctx.lineJoin = 'round';
        ctx.strokeText(tag.text, 0, 0);

        // Neon outline
        ctx.strokeStyle = tag.colors[0];
        ctx.lineWidth = 10;
        ctx.strokeText(tag.text, 0, 0);

        // Gradient fill
        const grad = ctx.createLinearGradient(0, -50, 0, 50);
        grad.addColorStop(0, tag.colors[1]);
        grad.addColorStop(1, tag.colors[2]);
        ctx.fillStyle = grad;
        ctx.fillText(tag.text, 0, 0);

        // Spray drip effects
        ctx.fillStyle = tag.colors[2];
        for (let i = -140; i <= 140; i += 35) {
            const dripLen = 20 + Math.random() * 45;
            ctx.beginPath();
            ctx.arc(i, 40, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(i - 3, 40, 6, dripLen);
            ctx.beginPath();
            ctx.arc(i, 40 + dripLen, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        // Spray paint splatter stars
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px Arial';
        ctx.fillText('★', -160, -35);
        ctx.fillText('★', 165, 30);
        ctx.fillText('⚡', 150, -40);

        ctx.restore();

        const texture = new THREE.CanvasTexture(canvas);
        this.cache[key] = texture;
        return texture;
    },

    // ------------------------------------------------------------------------
    // Yellow & Black Hazard Caution Stripes (Ramps, Bumpers, Hurdles)
    // ------------------------------------------------------------------------
    createHazardTexture() {
        if (this.cache.hazard) return this.cache.hazard;

        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#f5c200'; // Bright cautionary yellow
        ctx.fillRect(0, 0, 256, 256);

        ctx.fillStyle = '#1e1e24'; // Dark charcoal black
        const stripeWidth = 32;
        for (let x = -256; x < 512; x += stripeWidth * 2) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x + stripeWidth, 0);
            ctx.lineTo(x + stripeWidth - 256, 256);
            ctx.lineTo(x - 256, 256);
            ctx.closePath();
            ctx.fill();
        }

        // Inner metallic border line
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 6;
        ctx.strokeRect(3, 3, 250, 250);

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        this.cache.hazard = texture;
        return texture;
    },

    // ------------------------------------------------------------------------
    // Subway Train Side Livery (Silver, Blue/Red Trim, Windows, Doors)
    // ------------------------------------------------------------------------
    createTrainSideTexture(type = 'blue') {
        const key = 'train_side_' + type;
        if (this.cache[key]) return this.cache[key];

        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        const primaryColor = type === 'blue' ? '#0070ba' : '#c82828';
        const bodyColor = '#dcdde1'; // Brushed steel

        // Metal carriage base
        ctx.fillStyle = bodyColor;
        ctx.fillRect(0, 0, 1024, 512);

        // Horizontal ribbed grooves (stainless steel texture)
        ctx.fillStyle = 'rgba(0,0,0,0.06)';
        for (let y = 140; y < 512; y += 14) {
            ctx.fillRect(0, y, 1024, 6);
        }

        // Bold colored racing stripe along windows
        ctx.fillStyle = primaryColor;
        ctx.fillRect(0, 100, 1024, 180);

        // Window cutouts with dark glass and reflection highlights
        for (let i = 0; i < 5; i++) {
            const wx = 60 + i * 190;
            // Window frame
            ctx.fillStyle = '#2f3640';
            ctx.beginPath();
            ctx.roundRect(wx, 120, 130, 130, 12);
            ctx.fill();

            // Glass
            const glassGrad = ctx.createLinearGradient(wx, 120, wx + 130, 250);
            glassGrad.addColorStop(0, '#102538');
            glassGrad.addColorStop(0.5, '#1e3c5a');
            glassGrad.addColorStop(1, '#0a1622');
            ctx.fillStyle = glassGrad;
            ctx.beginPath();
            ctx.roundRect(wx + 4, 124, 122, 122, 8);
            ctx.fill();

            // Reflection diagonal
            ctx.fillStyle = 'rgba(255,255,255,0.18)';
            ctx.beginPath();
            ctx.moveTo(wx + 20, 124);
            ctx.lineTo(wx + 60, 124);
            ctx.lineTo(wx + 30, 246);
            ctx.lineTo(wx - 10, 246);
            ctx.fill();

            // Passenger silhouette in some windows
            if (i % 2 === 1) {
                ctx.fillStyle = 'rgba(10, 15, 25, 0.6)';
                ctx.beginPath();
                ctx.arc(wx + 65, 175, 18, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(wx + 65, 230, 32, 24, 0, 0, Math.PI, true);
                ctx.fill();
            }
        }

        // Passenger Doors
        [0, 512, 1000].forEach(dx => {
            ctx.fillStyle = '#718093';
            ctx.fillRect(dx - 12, 100, 24, 400);
            ctx.strokeStyle = '#2f3542';
            ctx.lineWidth = 4;
            ctx.strokeRect(dx - 12, 100, 24, 400);
        });

        // Subway logo & fleet number
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px Arial';
        ctx.fillText('METRO LINE 7', 380, 70);
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = 'bold 24px monospace';
        ctx.fillText('CAR #4092', 430, 340);

        // Lower hazard edge
        ctx.fillStyle = '#2f3542';
        ctx.fillRect(0, 480, 1024, 32);

        const texture = new THREE.CanvasTexture(canvas);
        this.cache[key] = texture;
        return texture;
    },

    // ------------------------------------------------------------------------
    // Subway Train Front Texture (Windshield, Destination Sign, Lights)
    // ------------------------------------------------------------------------
    createTrainFrontTexture(type = 'blue') {
        const key = 'train_front_' + type;
        if (this.cache[key]) return this.cache[key];

        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        const primaryColor = type === 'blue' ? '#0070ba' : '#c82828';

        // Face color
        ctx.fillStyle = primaryColor;
        ctx.fillRect(0, 0, 512, 512);

        // Destination LED Display
        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.roundRect(80, 40, 352, 60, 10);
        ctx.fill();
        ctx.fillStyle = '#ffb300'; // Amber LED
        ctx.font = '900 32px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('DOWNTOWN EXP', 256, 70);

        // Large front curved windshield
        ctx.fillStyle = '#1b222c';
        ctx.beginPath();
        ctx.roundRect(60, 120, 392, 220, 20);
        ctx.fill();

        const glassGrad = ctx.createLinearGradient(60, 120, 452, 340);
        glassGrad.addColorStop(0, '#243a50');
        glassGrad.addColorStop(1, '#0e1722');
        ctx.fillStyle = glassGrad;
        ctx.beginPath();
        ctx.roundRect(70, 130, 372, 200, 14);
        ctx.fill();

        // Windshield wiper
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(256, 330);
        ctx.lineTo(200, 180);
        ctx.stroke();

        // Dual high-intensity headlights
        [110, 402].forEach(hx => {
            // Chrome bezel
            ctx.fillStyle = '#dcdde1';
            ctx.beginPath();
            ctx.arc(hx, 410, 42, 0, Math.PI * 2);
            ctx.fill();
            // Glowing lens
            ctx.fillStyle = '#fffae0';
            ctx.beginPath();
            ctx.arc(hx, 410, 34, 0, Math.PI * 2);
            ctx.fill();
            // Bright center
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(hx, 410, 18, 0, Math.PI * 2);
            ctx.fill();
        });

        // Center red warning light
        ctx.fillStyle = '#e84118';
        ctx.beginPath();
        ctx.arc(256, 380, 16, 0, Math.PI * 2);
        ctx.fill();

        // Front heavy bumper grill
        ctx.fillStyle = '#2f3542';
        ctx.fillRect(40, 465, 432, 47);
        ctx.fillStyle = '#1e232a';
        for (let x = 60; x < 450; x += 30) {
            ctx.fillRect(x, 472, 16, 34);
        }

        const texture = new THREE.CanvasTexture(canvas);
        this.cache[key] = texture;
        return texture;
    },

    // ------------------------------------------------------------------------
    // Golden Coin Texture (With Embossed Star)
    // ------------------------------------------------------------------------
    createCoinTexture() {
        if (this.cache.coin) return this.cache.coin;

        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Outer golden rim
        const outerGrad = ctx.createRadialGradient(128, 128, 60, 128, 128, 128);
        outerGrad.addColorStop(0, '#ffd700');
        outerGrad.addColorStop(0.7, '#f39c12');
        outerGrad.addColorStop(1, '#b7791f');
        ctx.fillStyle = outerGrad;
        ctx.beginPath();
        ctx.arc(128, 128, 120, 0, Math.PI * 2);
        ctx.fill();

        // Inner ridge
        ctx.strokeStyle = '#ffeaa7';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(128, 128, 105, 0, Math.PI * 2);
        ctx.stroke();

        // Inner face
        const innerGrad = ctx.createRadialGradient(110, 110, 10, 128, 128, 90);
        innerGrad.addColorStop(0, '#fff475');
        innerGrad.addColorStop(0.8, '#f1c40f');
        innerGrad.addColorStop(1, '#d4ac0d');
        ctx.fillStyle = innerGrad;
        ctx.beginPath();
        ctx.arc(128, 128, 95, 0, Math.PI * 2);
        ctx.fill();

        // Embossed 5-Point Star
        ctx.save();
        ctx.translate(128, 128);
        ctx.fillStyle = '#ffeaa7';
        ctx.shadowColor = 'rgba(180, 110, 10, 0.6)';
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        ctx.shadowBlur = 4;

        ctx.beginPath();
        const spikes = 5;
        const outerRadius = 55;
        const innerRadius = 25;
        let rot = (Math.PI / 2) * 3;
        const step = Math.PI / spikes;

        ctx.moveTo(0, -outerRadius);
        for (let i = 0; i < spikes; i++) {
            let x = Math.cos(rot) * outerRadius;
            let y = Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;
            x = Math.cos(rot) * innerRadius;
            y = Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(0, -outerRadius);
        ctx.closePath();
        ctx.fill();

        ctx.restore();

        const texture = new THREE.CanvasTexture(canvas);
        this.cache.coin = texture;
        return texture;
    },

    // ------------------------------------------------------------------------
    // Railway Wooden Tie (Sleeper) Texture
    // ------------------------------------------------------------------------
    createTieTexture() {
        if (this.cache.tie) return this.cache.tie;

        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        // Dark weathered treated wood
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(0, 0, 256, 64);

        // Woodgrain lines
        for (let y = 0; y < 64; y += 4) {
            ctx.strokeStyle = Math.random() > 0.5 ? '#2d1b18' : '#4e342e';
            ctx.lineWidth = 1 + Math.random() * 2;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(256, y + (Math.random() - 0.5) * 4);
            ctx.stroke();
        }

        // Metal fastener plates on ties where rails sit
        [50, 206].forEach(fx => {
            ctx.fillStyle = '#212121';
            ctx.fillRect(fx - 14, 12, 28, 40);
            ctx.fillStyle = '#9e9e9e'; // Bolt heads
            ctx.beginPath();
            ctx.arc(fx - 7, 20, 3, 0, Math.PI * 2);
            ctx.arc(fx + 7, 20, 3, 0, Math.PI * 2);
            ctx.arc(fx - 7, 44, 3, 0, Math.PI * 2);
            ctx.arc(fx + 7, 44, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        const texture = new THREE.CanvasTexture(canvas);
        this.cache.tie = texture;
        return texture;
    },

    // ------------------------------------------------------------------------
    // Ballast Gravel Track Bed Texture
    // ------------------------------------------------------------------------
    createBallastTexture() {
        if (this.cache.ballast) return this.cache.ballast;

        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#546e7a'; // Cool grey base
        ctx.fillRect(0, 0, 512, 512);

        // Procedural crushed stone noise
        const colors = ['#37474f', '#455a64', '#78909c', '#90a4ae', '#263238'];
        for (let i = 0; i < 4000; i++) {
            ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const s = 2 + Math.random() * 5;
            ctx.beginPath();
            ctx.rect(x, y, s, s);
            ctx.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 16);
        this.cache.ballast = texture;
        return texture;
    },

    // ------------------------------------------------------------------------
    // Cartoon Sky Gradient with Fluffy Clouds
    // ------------------------------------------------------------------------
    createSkyTexture() {
        if (this.cache.sky) return this.cache.sky;

        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Bright vibrant tropical gradient
        const grad = ctx.createLinearGradient(0, 0, 0, 512);
        grad.addColorStop(0, '#1e88e5');    // Deep cartoon azure
        grad.addColorStop(0.5, '#42a5f5');  // Mid sky blue
        grad.addColorStop(0.85, '#90caf9'); // Soft horizon blue
        grad.addColorStop(1, '#e3f2fd');    // Warm horizon glow
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1024, 512);

        // Fluffy cumulus clouds
        const drawCloud = (cx, cy, scale) => {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.beginPath();
            ctx.arc(cx, cy, 35 * scale, 0, Math.PI * 2);
            ctx.arc(cx + 35 * scale, cy - 10 * scale, 45 * scale, 0, Math.PI * 2);
            ctx.arc(cx + 80 * scale, cy, 38 * scale, 0, Math.PI * 2);
            ctx.arc(cx + 40 * scale, cy + 15 * scale, 40 * scale, 0, Math.PI * 2);
            ctx.fill();
        };

        drawCloud(150, 120, 1.2);
        drawCloud(450, 80, 0.9);
        drawCloud(800, 140, 1.4);
        drawCloud(980, 90, 0.8);

        const texture = new THREE.CanvasTexture(canvas);
        this.cache.sky = texture;
        return texture;
    }
};

window.TextureGenerator = TextureGenerator;
