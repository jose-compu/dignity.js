let audioContext;

function getContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

function tone({ frequency, duration = 0.12, type = 'sine', gain = 0.04 }) {
  const ctx = getContext();
  const oscillator = ctx.createOscillator();
  const volume = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  volume.gain.value = gain;

  oscillator.connect(volume);
  volume.connect(ctx.destination);

  oscillator.start();
  oscillator.stop(ctx.currentTime + duration);
}

export function playMoveSound() {
  tone({ frequency: 280, duration: 0.08, type: 'triangle' });
}

export function playCaptureSound() {
  tone({ frequency: 180, duration: 0.14, type: 'square', gain: 0.05 });
  setTimeout(() => tone({ frequency: 120, duration: 0.1, type: 'square', gain: 0.04 }), 70);
}

export function playCheckSound() {
  tone({ frequency: 520, duration: 0.18, type: 'sawtooth', gain: 0.03 });
}

export function playGameStartSound() {
  [220, 330, 440].forEach((frequency, index) => {
    setTimeout(() => tone({ frequency, duration: 0.16, type: 'triangle', gain: 0.035 }), index * 90);
  });
}

export async function resumeAudio() {
  const ctx = getContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
}
