// ============================================================================
// Subway Surfers: Full Authentic UI, Shop, Characters & Mystery Box Engine
// Multi-tab shop, character & hoverboard selection, missions progress & mystery boxes
// ============================================================================

class UIManager {
    constructor(game) {
        this.game = game;
        this.storageKey = 'subway_surfers_save_v1';
        this.saveData = this.loadSaveData();

        this.elements = {
            hud: document.getElementById('hud'),
            scoreVal: document.getElementById('hud-score-val'),
            highScoreVal: document.getElementById('hud-highscore-val'),
            coinsVal: document.getElementById('hud-coins-val'),
            multiplierBadge: document.getElementById('hud-multiplier'),
            powerupContainer: document.getElementById('powerup-timers'),

            wordHunt: document.getElementById('word-hunt'),
            letterS: document.getElementById('letter-s'),
            letterU: document.getElementById('letter-u'),
            letterR: document.getElementById('letter-r'),
            letterF: document.getElementById('letter-f'),

            startScreen: document.getElementById('start-screen'),
            startBtn: document.getElementById('start-btn'),
            openShopBtn: document.getElementById('open-shop-btn'),
            titleCoins: document.getElementById('title-coins'),
            titleHighScore: document.getElementById('title-highscore'),
            missionsOverview: document.getElementById('missions-overview'),

            gameOverModal: document.getElementById('game-over-modal'),
            finalScore: document.getElementById('final-score'),
            finalCoins: document.getElementById('final-coins'),
            finalDistance: document.getElementById('final-distance'),
            newBestBadge: document.getElementById('new-best-badge'),
            restartBtn: document.getElementById('restart-btn'),
            reviveBtn: document.getElementById('revive-btn'),
            gameOverShopBtn: document.getElementById('gameover-shop-btn'),

            shopModal: document.getElementById('shop-modal'),
            closeShopBtn: document.getElementById('close-shop-btn'),
            shopCoinsVal: document.getElementById('shop-coins-val'),

            audioBtn: document.getElementById('audio-toggle-btn'),
            pauseBtn: document.getElementById('pause-btn'),

            mysteryBoxModal: document.getElementById('mystery-box-modal'),
            boxRewardContent: document.getElementById('box-reward-content'),
            claimBoxBtn: document.getElementById('claim-box-btn'),

            touchControls: document.getElementById('mobile-dpad')
        };

        this.activeShopTab = 'upgrades';
        this.initEventListeners();
        this.applySelectedLoadout();
        this.refreshShopUI();
        this.updateHUD(0, 0, 1);
    }

    loadSaveData() {
        const defaultData = {
            highScore: 0,
            coins: 350,
            keys: 5,
            mysteryBoxes: 0,
            upgrades: {
                magnet: 1,
                sneakers: 1,
                jetpack: 1,
                multiplier: 1
            },
            selectedChar: 'jake',
            unlockedChars: ['jake'],
            selectedBoard: 'classic',
            unlockedBoards: ['classic'],
            useHeadstart: false,
            useScoreBooster: false
        };

        try {
            const raw = localStorage.getItem(this.storageKey);
            if (raw) return Object.assign(defaultData, JSON.parse(raw));
        } catch (e) {
            console.warn('localStorage read error:', e);
        }
        return defaultData;
    }

    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.saveData));
        } catch (e) {
            console.warn('localStorage write error:', e);
        }
    }

    applySelectedLoadout() {
        if (!this.game || !this.game.player) return;
        // Update character model
        if (ModelFactory.createCharacter) {
            const oldMesh = this.game.player.mesh;
            this.game.scene.remove(oldMesh);
            this.game.player.rig = ModelFactory.createCharacter(this.saveData.selectedChar);
            this.game.player.mesh = this.game.player.rig.root;
            this.game.scene.add(this.game.player.mesh);

            if (ModelFactory.attachHoverboardMesh) {
                ModelFactory.attachHoverboardMesh(this.game.player.rig.boardGroup, this.saveData.selectedBoard);
            }
        }
    }

    initEventListeners() {
        // Start Game with Intro Cutscene!
        this.elements.startBtn.addEventListener('click', () => {
            this.playIntroCutscene(() => {
                this.game.start();
            });
        });

        // Restart Game
        this.elements.restartBtn.addEventListener('click', () => {
            this.game.restart();
        });

        // Revive with Key
        this.elements.reviveBtn.addEventListener('click', () => {
            if (this.saveData.keys > 0) {
                this.saveData.keys--;
                this.save();
                this.game.revive();
            } else {
                alert('No keys left! Run further to collect keys or complete missions!');
            }
        });

        // Shop Modal Open/Close
        this.elements.openShopBtn.addEventListener('click', () => this.openShop());
        this.elements.gameOverShopBtn.addEventListener('click', () => this.openShop());
        this.elements.closeShopBtn.addEventListener('click', () => this.closeShop());

        // Audio Toggle
        this.elements.audioBtn.addEventListener('click', () => {
            const muted = window.soundManager ? window.soundManager.toggleMute() : false;
            this.elements.audioBtn.textContent = muted ? '🔇' : '🔊';
        });

        // Pause Toggle
        this.elements.pauseBtn.addEventListener('click', () => {
            this.game.togglePause();
        });

        // Claim Mystery Box
        if (this.elements.claimBoxBtn) {
            this.elements.claimBoxBtn.addEventListener('click', () => {
                this.elements.mysteryBoxModal.style.display = 'none';
                if (this.game.state === 'PAUSED') {
                    this.game.togglePause();
                }
            });
        }

        // Shop Tabs Navigation
        const tabs = document.querySelectorAll('.shop-tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.activeShopTab = tab.dataset.tab;
                this.refreshShopUI();
            });
        });

        // Mobile Controls
        const bindBtn = (id, action) => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    action();
                }, { passive: false });
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    action();
                });
            }
        };

        bindBtn('btn-left', () => this.game.player.moveLeft());
        bindBtn('btn-right', () => this.game.player.moveRight());
        bindBtn('btn-jump', () => this.game.player.jump());
        bindBtn('btn-slide', () => this.game.player.slide());
        bindBtn('btn-board', () => this.game.player.activateHoverboard());
    }

    // ------------------------------------------------------------------------
    // Iconic Intro Cutscene: Jake sprays train, Inspector whistle, chase begins!
    // ------------------------------------------------------------------------
    playIntroCutscene(onComplete) {
        if (window.soundManager) {
            window.soundManager.resume();
            window.soundManager.playSprayCan();
            setTimeout(() => {
                window.soundManager.playWhistle();
                window.soundManager.playDogBark();
            }, 500);
        }

        // Quick cinematic pause before launching
        setTimeout(() => {
            onComplete();
        }, 750);
    }

    showStartScreen() {
        this.elements.startScreen.style.display = 'flex';
        this.elements.hud.style.display = 'none';
        this.elements.gameOverModal.style.display = 'none';
        this.elements.titleCoins.textContent = this.saveData.coins.toLocaleString();
        this.elements.titleHighScore.textContent = this.saveData.highScore.toLocaleString();

        this.renderMissionsPreview();
    }

    renderMissionsPreview() {
        if (!this.elements.missionsOverview || !this.game.missions) return;
        const m = this.game.missions.data;
        let html = `<div class="mission-set-badge">SET ${m.currentSet} • MULTIPLIER: ${m.multiplier}X</div>`;
        m.missions.forEach(item => {
            const pct = Math.min(100, Math.floor((item.current / item.target) * 100));
            const isDone = item.current >= item.target;
            html += `
                <div class="mission-preview-item ${isDone ? 'completed' : ''}">
                    <div class="mission-desc">${isDone ? '✓ ' : ''}${item.desc}</div>
                    <div class="mission-bar-track">
                        <div class="mission-bar-fill" style="width:${pct}%"></div>
                    </div>
                </div>
            `;
        });
        this.elements.missionsOverview.innerHTML = html;
    }

    showHUD() {
        this.elements.startScreen.style.display = 'none';
        this.elements.gameOverModal.style.display = 'none';
        this.elements.hud.style.display = 'block';
    }

    showGameOver(score, coinsEarned, distance, isNewBest) {
        this.elements.gameOverModal.style.display = 'flex';
        this.elements.finalScore.textContent = Math.floor(score).toLocaleString();
        this.elements.finalCoins.textContent = `+${coinsEarned}`;
        this.elements.finalDistance.textContent = `${Math.floor(distance)}m`;
        this.elements.newBestBadge.style.display = isNewBest ? 'block' : 'none';
        this.elements.reviveBtn.textContent = `🔑 REVIVE (Keys: ${this.saveData.keys})`;
    }

    updateHUD(score, coins, multiplier) {
        this.elements.scoreVal.textContent = Math.floor(score).toLocaleString();
        this.elements.highScoreVal.textContent = this.saveData.highScore.toLocaleString();
        this.elements.coinsVal.textContent = (this.saveData.coins + coins).toLocaleString();
        this.elements.multiplierBadge.textContent = `${multiplier}x`;
    }

    updateWordHunt(letters) {
        this.elements.letterS.classList.toggle('active', letters.S);
        this.elements.letterU.classList.toggle('active', letters.U);
        this.elements.letterR.classList.toggle('active', letters.R);
        this.elements.letterF.classList.toggle('active', letters.F);
    }

    updatePowerUpMeters(player) {
        const container = this.elements.powerupContainer;
        container.innerHTML = '';

        const renderMeter = (name, icon, timeLeft, maxTime, color) => {
            if (timeLeft <= 0) return;
            const pct = Math.max(0, Math.min(100, (timeLeft / maxTime) * 100));
            const div = document.createElement('div');
            div.className = 'powerup-bar-item';
            div.innerHTML = `
                <div class="powerup-icon" style="background:${color}">${icon}</div>
                <div class="powerup-progress-track">
                    <div class="powerup-progress-fill" style="width:${pct}%; background:${color}"></div>
                </div>
            `;
            container.appendChild(div);
        };

        if (player.hasHoverboard) {
            renderMeter('Board', '🛹', player.hoverboardTimer, 30, '#00f3ff');
        }
        if (player.hasMagnet) {
            renderMeter('Magnet', '🧲', player.magnetTimer, 15, '#ff4757');
        }
        if (player.hasSneakers) {
            renderMeter('Sneakers', '👟', player.sneakersTimer, 15, '#2ed573');
        }
        if (player.hasJetpack) {
            renderMeter('Jetpack', '🚀', player.jetpackTimer, 10, '#ffa502');
        }
        if (player.hasMultiplier) {
            renderMeter('2X', '★', player.multiplierTimer, 15, '#e056fd');
        }
        if (player.hasHeadstart) {
            renderMeter('Boost', '⚡', player.headstartTimer, 6, '#ffd32a');
        }
    }

    // ------------------------------------------------------------------------
    // Mystery Box Reward Popup
    // ------------------------------------------------------------------------
    openMysteryBoxReward() {
        const rewards = [
            { type: 'coins', amount: 250, label: '250 Gold Coins!', icon: '🪙' },
            { type: 'coins', amount: 500, label: '500 Gold Coins!', icon: '🪙' },
            { type: 'coins', amount: 1000, label: '1,000 Gold Coins!', icon: '💰' },
            { type: 'keys', amount: 1, label: '+1 Revive Key!', icon: '🔑' },
            { type: 'keys', amount: 2, label: '+2 Revive Keys!', icon: '🔑' }
        ];

        const won = rewards[Math.floor(Math.random() * rewards.length)];

        if (won.type === 'coins') {
            this.saveData.coins += won.amount;
        } else if (won.type === 'keys') {
            this.saveData.keys += won.amount;
        }
        this.save();

        if (this.elements.boxRewardContent) {
            this.elements.boxRewardContent.innerHTML = `
                <div class="reward-icon-anim">${won.icon}</div>
                <div class="reward-title">MYSTERY BOX PRIZE!</div>
                <div class="reward-value">${won.label}</div>
            `;
            this.elements.mysteryBoxModal.style.display = 'flex';
        }
    }

    openShop() {
        this.refreshShopUI();
        this.elements.shopModal.style.display = 'flex';
    }

    closeShop() {
        this.elements.shopModal.style.display = 'none';
        this.elements.titleCoins.textContent = this.saveData.coins.toLocaleString();
        this.applySelectedLoadout();
    }

    refreshShopUI() {
        this.elements.shopCoinsVal.textContent = this.saveData.coins.toLocaleString();
        const listEl = document.getElementById('shop-content-area');
        if (!listEl) return;
        listEl.innerHTML = '';

        if (this.activeShopTab === 'upgrades') {
            this.renderUpgradesTab(listEl);
        } else if (this.activeShopTab === 'characters') {
            this.renderCharactersTab(listEl);
        } else if (this.activeShopTab === 'boards') {
            this.renderBoardsTab(listEl);
        } else if (this.activeShopTab === 'missions') {
            this.renderMissionsTab(listEl);
        }
    }

    renderUpgradesTab(listEl) {
        const upgradeTypes = [
            { key: 'magnet', name: 'Coin Magnet', icon: '🧲', baseCost: 100 },
            { key: 'sneakers', name: 'Super Sneakers', icon: '👟', baseCost: 100 },
            { key: 'jetpack', name: 'Jetpack', icon: '🚀', baseCost: 150 },
            { key: 'multiplier', name: '2X Multiplier', icon: '★', baseCost: 120 }
        ];

        upgradeTypes.forEach(up => {
            const currentLvl = this.saveData.upgrades[up.key] || 1;
            const cost = up.baseCost * currentLvl * 1.5;
            const isMax = currentLvl >= 5;

            const item = document.createElement('div');
            item.className = 'shop-item-card';
            item.innerHTML = `
                <div class="shop-item-info">
                    <span class="shop-item-icon">${up.icon}</span>
                    <div>
                        <div class="shop-item-title">${up.name}</div>
                        <div class="shop-item-level">Level ${currentLvl} / 5</div>
                    </div>
                </div>
                <button class="shop-buy-btn ${isMax ? 'disabled' : ''}">
                    ${isMax ? 'MAXED' : `🪙 ${Math.floor(cost)}`}
                </button>
            `;

            const btn = item.querySelector('.shop-buy-btn');
            if (!isMax) {
                btn.addEventListener('click', () => {
                    if (this.saveData.coins >= cost) {
                        this.saveData.coins -= Math.floor(cost);
                        this.saveData.upgrades[up.key]++;
                        this.save();
                        this.refreshShopUI();
                        if (window.soundManager) window.soundManager.playPowerup();
                    } else {
                        alert('Not enough coins! Run more to collect coins!');
                    }
                });
            }
            listEl.appendChild(item);
        });
    }

    renderCharactersTab(listEl) {
        const characters = [
            { id: 'jake', name: 'Jake', desc: 'The Iconic Subway Skater', cost: 0, icon: '🧢' },
            { id: 'tricky', name: 'Tricky', desc: 'Beanie Skater Girl', cost: 800, icon: '🎀' },
            { id: 'fresh', name: 'Fresh', desc: 'Boombox Stereo King', cost: 1500, icon: '📻' }
        ];

        characters.forEach(char => {
            const isUnlocked = this.saveData.unlockedChars.includes(char.id);
            const isSelected = this.saveData.selectedChar === char.id;

            const item = document.createElement('div');
            item.className = 'shop-item-card';
            item.innerHTML = `
                <div class="shop-item-info">
                    <span class="shop-item-icon">${char.icon}</span>
                    <div>
                        <div class="shop-item-title">${char.name}</div>
                        <div class="shop-item-level">${char.desc}</div>
                    </div>
                </div>
                <button class="shop-buy-btn ${isSelected ? 'disabled' : ''}">
                    ${isSelected ? 'EQUIPPED' : (isUnlocked ? 'SELECT' : `🪙 ${char.cost}`)}
                </button>
            `;

            const btn = item.querySelector('.shop-buy-btn');
            if (!isSelected) {
                btn.addEventListener('click', () => {
                    if (isUnlocked) {
                        this.saveData.selectedChar = char.id;
                        this.save();
                        this.refreshShopUI();
                        this.applySelectedLoadout();
                    } else if (this.saveData.coins >= char.cost) {
                        this.saveData.coins -= char.cost;
                        this.saveData.unlockedChars.push(char.id);
                        this.saveData.selectedChar = char.id;
                        this.save();
                        this.refreshShopUI();
                        this.applySelectedLoadout();
                        if (window.soundManager) window.soundManager.playMysteryBoxOpen();
                    } else {
                        alert('Not enough coins to unlock this character!');
                    }
                });
            }
            listEl.appendChild(item);
        });
    }

    renderBoardsTab(listEl) {
        const boards = [
            { id: 'classic', name: 'Classic Pink', desc: 'Standard Reliable Hoverboard', cost: 0, icon: '🛹' },
            { id: 'star', name: 'Star Blaster', desc: 'Golden Star Deck with Glowing Rim', cost: 400, icon: '⭐' },
            { id: 'flame', name: 'Flame Bouncer', desc: 'Fiery Thrusters & Speed Boost', cost: 800, icon: '🔥' },
            { id: 'cyber', name: 'Cyber Neon', desc: 'Futuristic Electric Pulse Grid', cost: 1200, icon: '⚡' }
        ];

        boards.forEach(b => {
            const isUnlocked = this.saveData.unlockedBoards.includes(b.id);
            const isSelected = this.saveData.selectedBoard === b.id;

            const item = document.createElement('div');
            item.className = 'shop-item-card';
            item.innerHTML = `
                <div class="shop-item-info">
                    <span class="shop-item-icon">${b.icon}</span>
                    <div>
                        <div class="shop-item-title">${b.name}</div>
                        <div class="shop-item-level">${b.desc}</div>
                    </div>
                </div>
                <button class="shop-buy-btn ${isSelected ? 'disabled' : ''}">
                    ${isSelected ? 'EQUIPPED' : (isUnlocked ? 'SELECT' : `🪙 ${b.cost}`)}
                </button>
            `;

            const btn = item.querySelector('.shop-buy-btn');
            if (!isSelected) {
                btn.addEventListener('click', () => {
                    if (isUnlocked) {
                        this.saveData.selectedBoard = b.id;
                        this.save();
                        this.refreshShopUI();
                        this.applySelectedLoadout();
                    } else if (this.saveData.coins >= b.cost) {
                        this.saveData.coins -= b.cost;
                        this.saveData.unlockedBoards.push(b.id);
                        this.saveData.selectedBoard = b.id;
                        this.save();
                        this.refreshShopUI();
                        this.applySelectedLoadout();
                        if (window.soundManager) window.soundManager.playMysteryBoxOpen();
                    } else {
                        alert('Not enough coins to unlock this hoverboard!');
                    }
                });
            }
            listEl.appendChild(item);
        });
    }

    renderMissionsTab(listEl) {
        if (!this.game.missions) return;
        const m = this.game.missions.data;

        const header = document.createElement('div');
        header.className = 'missions-tab-header';
        header.innerHTML = `
            <div class="multiplier-display">SCORE MULTIPLIER: <span>${m.multiplier}X</span></div>
            <div class="set-counter">Current Mission Set: <strong>#${m.currentSet}</strong></div>
            <p style="font-size:13px; color:#a4b0be; margin-top:4px;">Complete all 3 missions to permanently level up your score multiplier!</p>
        `;
        listEl.appendChild(header);

        m.missions.forEach(item => {
            const pct = Math.min(100, Math.floor((item.current / item.target) * 100));
            const isDone = item.current >= item.target;

            const card = document.createElement('div');
            card.className = `shop-item-card ${isDone ? 'mission-card-done' : ''}`;
            card.innerHTML = `
                <div style="width:100%;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                        <span style="font-size:16px; color:#ffffff;">${isDone ? '✅ ' : ''}${item.desc}</span>
                        <span style="font-size:14px; color:#ffdd59;">${item.current} / ${item.target}</span>
                    </div>
                    <div class="mission-bar-track">
                        <div class="mission-bar-fill" style="width:${pct}%"></div>
                    </div>
                </div>
            `;
            listEl.appendChild(card);
        });
    }
}

window.UIManager = UIManager;
