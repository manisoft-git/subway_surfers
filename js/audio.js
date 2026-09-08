// ============================================================================
// Subway Surfers: Authentic Procedural Web Audio Engine
// 100% Self-Contained Web Audio Synthesizer (Zero External Audio Files)
// Recreates the iconic Subway Surfers groove, melodies, instruments & sound FX
// ============================================================================

class SoundManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.sfxGain = null;
        this.musicGain = null;
        this.muted = false;
        this.musicPlaying = false;
        this.bpm = 128;
        this.step = 0;
        this.timer = null;
        this.streak = 0;
        this.streakTimer = null;
        this.jetpackOsc = null;
        this.jetpackGain = null;
        this.jetpackNoise = null;
    }

    init() {
        if (this.ctx) return;
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        this.ctx = new AudioCtx();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.75, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(0.48, this.ctx.currentTime);
        this.musicGain.connect(this.masterGain);
    }

    resume() {
        if (!this.ctx) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.masterGain) {
            this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.75, this.ctx ? this.ctx.currentTime : 0);
        }
        return this.muted;
    }

    // ------------------------------------------------------------------------
    // Music Sequencer: Iconic Subway Surfers Bouncy Funk Groove
    // ------------------------------------------------------------------------
    startMusic() {
        this.resume();
        if (this.musicPlaying) return;
        this.musicPlaying = true;
        this.step = 0;
        const stepInterval = (60 / this.bpm) / 4; // 16th notes (~117ms)

        // Iconic Bouncy Subway Slap Bassline (32 steps loop)
        const bassline = [
            48, 0, 48, 51, 0, 53, 0, 48,
            46, 0, 48, 0, 51, 53, 55, 53,
            44, 0, 44, 46, 0, 48, 0, 44,
            43, 0, 43, 46, 48, 51, 53, 48
        ];

        // Catchy Marimba / Steel Drum Hook (Iconic Subway Surfers motif)
        const marimbaLead = [
            72, 75, 79, 84, 0, 82, 0, 79,
            77, 0, 75, 77, 79, 0, 75, 72,
            72, 75, 79, 84, 0, 82, 0, 84,
            87, 84, 82, 79, 75, 77, 79, 72
        ];

        // Funky Kalimba / Whistle Counter-Melody
        const kalimbaFill = [
            0, 0, 84, 0, 87, 0, 84, 0,
            0, 82, 0, 0, 79, 0, 75, 0,
            0, 0, 84, 0, 87, 0, 89, 0,
            91, 0, 89, 87, 84, 0, 0, 0
        ];

        const tick = () => {
            if (!this.musicPlaying) return;
            const now = this.ctx.currentTime;
            const s = this.step % 32;

            // Kick drum on beats 0, 4, 8, 12, 16, 20, 24, 28 (Punchy 4-on-floor with syncopation)
            if (s % 4 === 0 || s === 14 || s === 30) {
                this.playKick(now, s % 4 === 0 ? 0.45 : 0.28);
            }

            // Snare / Rimshot on beats 4, 12, 20, 28
            if (s % 8 === 4) {
                this.playSnare(now);
            }

            // Shuffling 16th Hi-Hats with accent on off-beats
            if (s % 2 === 0) {
                const isAccent = (s % 4 === 2);
                this.playHiHat(now, isAccent ? 0.05 : 0.02, isAccent ? 0.12 : 0.06);
            }

            // Slap Bass Synth
            const bass = bassline[s];
            if (bass) {
                this.playSlapBass(this.midiToFreq(bass - 12), now, 0.14);
            }

            // Marimba / Kalimba Tropical Lead
            const lead = marimbaLead[s];
            if (lead) {
                this.playMarimba(this.midiToFreq(lead), now, 0.18);
            }

            // Whistle / Kalimba Fill
            const fill = kalimbaFill[s];
            if (fill) {
                this.playWhistleSynth(this.midiToFreq(fill), now, 0.12);
            }

            this.step++;
            const nextTime = (stepInterval * 1000) - 2;
            this.timer = setTimeout(tick, Math.max(8, nextTime));
        };

        tick();
    }

    stopMusic() {
        this.musicPlaying = false;
        if (this.timer) clearTimeout(this.timer);
    }

    midiToFreq(m) {
        return 440 * Math.pow(2, (m - 69) / 12);
    }

    playKick(time, vol = 0.4) {
        if (!this.ctx || this.muted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.musicGain);

        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(32, time + 0.11);

        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

        osc.start(time);
        osc.stop(time + 0.12);
    }

    playSnare(time) {
        if (!this.ctx || this.muted) return;
        const bufferSize = this.ctx.sampleRate * 0.12;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.22));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1200, time);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.28, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        noise.start(time);
        noise.stop(time + 0.12);

        // Body pop under snare
        const osc = this.ctx.createOscillator();
        const oscG = this.ctx.createGain();
        osc.frequency.setValueAtTime(220, time);
        osc.frequency.exponentialRampToValueAtTime(80, time + 0.08);
        oscG.gain.setValueAtTime(0.18, time);
        oscG.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
        osc.connect(oscG);
        oscG.connect(this.musicGain);
        osc.start(time);
        osc.stop(time + 0.08);
    }

    playHiHat(time, dur = 0.03, vol = 0.08) {
        if (!this.ctx || this.muted) return;
        const bufferSize = this.ctx.sampleRate * dur;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(7500, time);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        noise.start(time);
        noise.stop(time + dur);
    }

    playSlapBass(freq, time, dur = 0.14) {
        if (!this.ctx || this.muted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, time);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, time);
        filter.frequency.exponentialRampToValueAtTime(320, time + dur);
        filter.Q.setValueAtTime(5, time);

        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        osc.start(time);
        osc.stop(time + dur);
    }

    playMarimba(freq, time, dur = 0.18) {
        if (!this.ctx || this.muted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        // Harmonics
        const osc2 = this.ctx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq * 3, time);

        gain.gain.setValueAtTime(0.24, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(this.musicGain);

        osc.start(time);
        osc2.start(time);
        osc.stop(time + dur);
        osc2.stop(time + dur);
    }

    playWhistleSynth(freq, time, dur = 0.12) {
        if (!this.ctx || this.muted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        osc.frequency.linearRampToValueAtTime(freq * 1.05, time + dur * 0.5);

        gain.gain.setValueAtTime(0.12, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

        osc.connect(gain);
        gain.connect(this.musicGain);

        osc.start(time);
        osc.stop(time + dur);
    }

    // ------------------------------------------------------------------------
    // Sound FX Library
    // ------------------------------------------------------------------------

    // Spray paint hiss sound (Jake spraying graffiti on train in intro!)
    playSprayCan() {
        this.resume();
        if (!this.ctx || this.muted) return;
        const now = this.ctx.currentTime;
        const dur = 0.45;
        const bufferSize = this.ctx.sampleRate * dur;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.8;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(3200, now);
        filter.Q.setValueAtTime(2.5, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        noise.start(now);
        noise.stop(now + dur);
    }

    // Bulldog bark
    playDogBark() {
        this.resume();
        if (!this.ctx || this.muted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(190, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.15);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(900, now);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.16);
    }

    // High-pitched musical arpeggio coin chime (do-re-mi-fa-so-la-ti-do)
    playCoin() {
        this.resume();
        if (!this.ctx || this.muted) return;

        this.streak = (this.streak + 1) % 12;
        clearTimeout(this.streakTimer);
        this.streakTimer = setTimeout(() => { this.streak = 0; }, 650);

        const notes = [987.77, 1174.66, 1318.51, 1567.98, 1760.00, 1975.53, 2093.00, 2349.32];
        const freq = notes[this.streak % notes.length];

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.08);

        gain.gain.setValueAtTime(0.32, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.12);
    }

    playSwipe() {
        this.resume();
        if (!this.ctx || this.muted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(680, now + 0.09);

        gain.gain.setValueAtTime(0.24, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.1);
    }

    playJump() {
        this.resume();
        if (!this.ctx || this.muted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(820, now + 0.16);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.18);
    }

    playSlide() {
        this.resume();
        if (!this.ctx || this.muted) return;
        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.25;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.5));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(300, now + 0.25);
        filter.Q.setValueAtTime(3.0, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        noise.start(now);
        noise.stop(now + 0.25);
    }

    playSuperSneakers() {
        this.resume();
        if (!this.ctx || this.muted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(1020, now + 0.22);

        gain.gain.setValueAtTime(0.42, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.25);
    }

    playHoverboard() {
        this.resume();
        if (!this.ctx || this.muted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(940, now + 0.28);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, now);

        gain.gain.setValueAtTime(0.38, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.35);
    }

    startJetpack() {
        this.resume();
        if (!this.ctx || this.muted || this.jetpackOsc) return;
        const now = this.ctx.currentTime;

        // Dual low rumble + roar noise
        this.jetpackOsc = this.ctx.createOscillator();
        this.jetpackGain = this.ctx.createGain();
        this.jetpackOsc.type = 'sawtooth';
        this.jetpackOsc.frequency.setValueAtTime(75, now);
        this.jetpackGain.gain.setValueAtTime(0.22, now);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500, now);

        this.jetpackOsc.connect(filter);
        filter.connect(this.jetpackGain);
        this.jetpackGain.connect(this.sfxGain);

        this.jetpackOsc.start(now);
    }

    stopJetpack() {
        if (this.jetpackOsc) {
            try {
                this.jetpackOsc.stop();
                this.jetpackOsc.disconnect();
            } catch (e) {}
            this.jetpackOsc = null;
            this.jetpackGain = null;
        }
    }

    playTrainHorn() {
        this.resume();
        if (!this.ctx || this.muted) return;
        const now = this.ctx.currentTime;

        // Resonant brass chord (D4 + F#4 + A4)
        [293.66, 369.99, 440.00].forEach((freq) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now);

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1400, now);

            gain.gain.setValueAtTime(0.18, now);
            gain.gain.setValueAtTime(0.18, now + 0.55);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(now);
            osc.stop(now + 0.95);
        });
    }

    playWhistle() {
        this.resume();
        if (!this.ctx || this.muted) return;
        const now = this.ctx.currentTime;
        [0, 0.17].forEach(offset => {
            const t = now + offset;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(2700, t);
            osc.frequency.linearRampToValueAtTime(2900, t + 0.05);
            osc.frequency.linearRampToValueAtTime(2600, t + 0.12);

            gain.gain.setValueAtTime(0.28, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(t);
            osc.stop(t + 0.14);
        });
    }

    playStumble() {
        this.resume();
        if (!this.ctx || this.muted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(55, now + 0.2);

        gain.gain.setValueAtTime(0.42, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.22);
    }

    playCrash() {
        this.resume();
        if (!this.ctx || this.muted) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(130, now);
        osc.frequency.exponentialRampToValueAtTime(25, now + 0.45);
        oscGain.gain.setValueAtTime(0.55, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.connect(oscGain);
        oscGain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.45);

        const bufferSize = this.ctx.sampleRate * 0.45;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2500, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        noise.start(now);
        noise.stop(now + 0.45);
    }

    playPowerup() {
        this.resume();
        if (!this.ctx || this.muted) return;
        const now = this.ctx.currentTime;
        const chord = [523.25, 659.25, 783.99, 1046.50];
        chord.forEach((freq, idx) => {
            const t = now + idx * 0.06;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(t);
            osc.stop(t + 0.25);
        });
    }

    playShieldPop() {
        this.resume();
        if (!this.ctx || this.muted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.28);

        gain.gain.setValueAtTime(0.48, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.3);
    }

    playMysteryBoxOpen() {
        this.resume();
        if (!this.ctx || this.muted) return;
        const now = this.ctx.currentTime;
        // Big triumphant fanfare: C4 -> E4 -> G4 -> C5
        [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
            const t = now + idx * 0.08;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, t);

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1800, t);

            gain.gain.setValueAtTime(0.28, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(t);
            osc.stop(t + 0.35);
        });
    }

    playGameOver() {
        this.resume();
        this.stopMusic();
        if (!this.ctx || this.muted) return;
        const now = this.ctx.currentTime;
        const notes = [440, 415.3, 392, 369.99];
        notes.forEach((freq, idx) => {
            const t = now + idx * 0.18;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, t);

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(650, t);

            gain.gain.setValueAtTime(0.32, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(t);
            osc.stop(t + 0.25);
        });
    }
}

window.soundManager = new SoundManager();
