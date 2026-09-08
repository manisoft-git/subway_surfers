// ============================================================================
// Subway Surfers: Missions & Permanent Multiplier Engine
// Classic 3-mission progression system leveling up permanent multiplier up to 30x!
// ============================================================================

class MissionsManager {
    constructor(game) {
        this.game = game;
        this.storageKey = 'subway_surfers_missions_v1';
        this.data = this.loadData();

        // Runtime stats per run
        this.runStats = {
            jumps: 0,
            slides: 0,
            coins: 0,
            score: 0,
            distance: 0,
            hoverboardsUsed: 0,
            powerupsCollected: 0,
            magnets: 0,
            jetpacks: 0,
            sneakers: 0,
            trainsPassed: 0
        };
    }

    loadData() {
        const defaultData = {
            currentSet: 1,
            multiplier: 1,
            missions: [
                { id: 1, desc: 'Jump 15 times', target: 15, current: 0, singleRun: false, type: 'jumps' },
                { id: 2, desc: 'Collect 150 coins', target: 150, current: 0, singleRun: false, type: 'coins' },
                { id: 3, desc: 'Score 5,000 points in 1 run', target: 5000, current: 0, singleRun: true, type: 'score' }
            ]
        };

        try {
            const raw = localStorage.getItem(this.storageKey);
            if (raw) return Object.assign(defaultData, JSON.parse(raw));
        } catch (e) {
            console.warn('Missions load error:', e);
        }
        return defaultData;
    }

    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (e) {
            console.warn('Missions save error:', e);
        }
    }

    resetRunStats() {
        this.runStats = {
            jumps: 0,
            slides: 0,
            coins: 0,
            score: 0,
            distance: 0,
            hoverboardsUsed: 0,
            powerupsCollected: 0,
            magnets: 0,
            jetpacks: 0,
            sneakers: 0,
            trainsPassed: 0
        };

        // Reset progress on single-run missions
        for (const m of this.data.missions) {
            if (m.singleRun && m.current < m.target) {
                m.current = 0;
            }
        }
    }

    recordEvent(type, amount = 1) {
        if (this.runStats[type] !== undefined) {
            this.runStats[type] += amount;
        }

        let anyCompleted = false;
        for (const m of this.data.missions) {
            if (m.current >= m.target) continue;

            if (m.type === type) {
                if (m.singleRun) {
                    m.current = this.runStats[type];
                } else {
                    m.current += amount;
                }

                if (m.current >= m.target) {
                    m.current = m.target;
                    anyCompleted = true;
                }
            }
        }

        if (anyCompleted) {
            this.checkSetCompletion();
            this.save();
        }
    }

    checkSetCompletion() {
        const allDone = this.data.missions.every(m => m.current >= m.target);
        if (allDone) {
            // Level up permanent multiplier!
            if (this.data.multiplier < 30) {
                this.data.multiplier++;
            }
            this.data.currentSet++;
            this.generateNextMissionSet(this.data.currentSet);
            this.save();

            if (window.soundManager) {
                window.soundManager.playMysteryBoxOpen();
            }

            // Reward bonus coins
            if (this.game && this.game.ui) {
                this.game.ui.saveData.coins += 250;
                this.game.ui.save();
            }

            alert(`🏆 MISSION SET COMPLETED! Permanent Multiplier is now ${this.data.multiplier}X! (+250 Bonus Coins)`);
        }
    }

    generateNextMissionSet(setNum) {
        const templates = [
            { desc: `Jump ${15 + setNum * 5} times`, target: 15 + setNum * 5, singleRun: false, type: 'jumps' },
            { desc: `Slide under ${10 + setNum * 3} high barriers`, target: 10 + setNum * 3, singleRun: false, type: 'slides' },
            { desc: `Collect ${100 + setNum * 50} coins in 1 run`, target: 100 + setNum * 50, singleRun: true, type: 'coins' },
            { desc: `Score ${5000 + setNum * 5000} points in 1 run`, target: 5000 + setNum * 5000, singleRun: true, type: 'score' },
            { desc: `Pick up ${2 + Math.floor(setNum / 2)} Jetpacks`, target: 2 + Math.floor(setNum / 2), singleRun: false, type: 'jetpacks' },
            { desc: `Pick up ${3 + Math.floor(setNum / 2)} Magnets`, target: 3 + Math.floor(setNum / 2), singleRun: false, type: 'magnets' },
            { desc: `Use ${1 + Math.floor(setNum / 3)} Hoverboards in 1 run`, target: 1 + Math.floor(setNum / 3), singleRun: true, type: 'hoverboardsUsed' }
        ];

        // Pick 3 distinct missions
        const shuffled = [...templates].sort(() => Math.random() - 0.5);
        this.data.missions = shuffled.slice(0, 3).map((m, idx) => ({
            id: idx + 1,
            desc: m.desc,
            target: m.target,
            current: 0,
            singleRun: m.singleRun,
            type: m.type
        }));
    }
}

window.MissionsManager = MissionsManager;
