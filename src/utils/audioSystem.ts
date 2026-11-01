/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Web Audio API realistic Telephone Sound and Voice DSP Filter
let audioCtx: AudioContext | null = null;
let ringOsc: OscillatorNode | null = null;
let ringGain: GainNode | null = null;
let ringInterval: number | null = null;
let ambientOsc: OscillatorNode | null = null;
let ambientGain: GainNode | null = null;
let ambientInterval: number | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Play DTMF Touch Tone
export function playDTMF(digit: string, durationMs = 120) {
  try {
    const ctx = getAudioContext();
    const dtmfFrequencies: Record<string, [number, number]> = {
      '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
      '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
      '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
      '*': [941, 1209], '0': [941, 1336], '#': [941, 1477],
    };

    const freqs = dtmfFrequencies[digit] || [700, 1200];
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.frequency.value = freqs[0];
    osc2.frequency.value = freqs[1];

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (durationMs / 1000));

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + (durationMs / 1000));
    osc2.stop(now + (durationMs / 1000));
  } catch (err) {
    console.warn('Audio DTMF warning:', err);
  }
}

// Start telephone ringback tone (e.g. French/European 425Hz tone)
export function startTelephoneRing() {
  stopTelephoneRing();
  try {
    const ctx = getAudioContext();
    const pulseRing = () => {
      if (!ctx || ctx.state === 'closed') return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = 425;

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
      gain.gain.setValueAtTime(0.12, now + 1.2);
      gain.gain.linearRampToValueAtTime(0.001, now + 1.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.3);
    };

    pulseRing();
    ringInterval = window.setInterval(pulseRing, 3500);
  } catch (e) {
    console.warn('Ring tone error:', e);
  }
}

// Stop ringback tone
export function stopTelephoneRing() {
  if (ringInterval) {
    clearInterval(ringInterval);
    ringInterval = null;
  }
  if (ringOsc) {
    try { ringOsc.stop(); } catch { /* ignore */ }
    ringOsc = null;
  }
}

// Play relay click when telephone picks up
export function playPickupClick() {
  stopTelephoneRing();
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Line connect pop
    const bufferSize = ctx.sampleRate * 0.04;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.008));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value = 2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
  } catch (e) {
    console.warn('Pickup audio click error:', e);
  }
}

// Play telephone disconnect busy signal
export function playHangupTone() {
  stopTelephoneRing();
  stopAmbientSound();
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 425;

      const burstTime = now + (i * 0.5);
      gain.gain.setValueAtTime(0.1, burstTime);
      gain.gain.setValueAtTime(0.001, burstTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(burstTime);
      osc.stop(burstTime + 0.25);
    }
  } catch (e) {
    console.warn('Hangup tone error:', e);
  }
}

// Ambient background sounds (smoke detector intermittent beep, store chime, etc.)
export function startAmbientSound(category: string) {
  stopAmbientSound();
  try {
    const ctx = getAudioContext();

    if (category === 'FIRE') {
      // Periodic smoke detector beep
      const beep = () => {
        if (!ctx) return;
        const now = ctx.currentTime;
        for (let b = 0; b < 3; b++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = 3200; // Smoke detector piezo frequency

          const t = now + (b * 0.15);
          gain.gain.setValueAtTime(0.03, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(t);
          osc.stop(t + 0.09);
        }
      };
      beep();
      ambientInterval = window.setInterval(beep, 6000);
    }
  } catch (err) {
    console.warn('Ambient sound err:', err);
  }
}

export function stopAmbientSound() {
  if (ambientInterval) {
    clearInterval(ambientInterval);
    ambientInterval = null;
  }
}

// Web Speech Synthesis with Realistic Telephone Filter & Voice Selection
export function speakText(
  text: string,
  lang: 'fr' | 'en',
  voiceProfile: { pitch: number; rate: number; langFr?: string; langEn?: string; gender?: 'male' | 'female' },
  onStart?: () => void,
  onEnd?: () => void
): () => void {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    if (onStart) onStart();
    setTimeout(() => { if (onEnd) onEnd(); }, 2000);
    return () => {};
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.pitch = voiceProfile.pitch;
  utterance.rate = voiceProfile.rate;
  utterance.lang = lang === 'fr' ? 'fr-FR' : 'en-US';

  // Voice matching
  const voices = window.speechSynthesis.getVoices();
  const targetPrefix = lang === 'fr' ? 'fr' : 'en';
  const matchingVoices = voices.filter(v => v.lang.toLowerCase().startsWith(targetPrefix));

  if (matchingVoices.length > 0) {
    // Attempt gender-based voice match
    const voiceCandidate = matchingVoices.find(v => {
      const name = v.name.toLowerCase();
      if (voiceProfile.gender === 'female') {
        return name.includes('female') || name.includes('marie') || name.includes('julie') || name.includes('amélie') || name.includes('samantha') || name.includes('victoria') || name.includes('zira');
      } else {
        return name.includes('male') || name.includes('thomas') || name.includes('jean') || name.includes('nicolas') || name.includes('david') || name.includes('george') || name.includes('guy');
      }
    }) || matchingVoices[0];

    utterance.voice = voiceCandidate;
  }

  utterance.onstart = () => {
    if (onStart) onStart();
  };

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    console.warn('SpeechSynthesis error:', e);
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);

  // Return cancel handle
  return () => {
    window.speechSynthesis.cancel();
  };
}
