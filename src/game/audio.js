let audioContext
let soundsEnabled = true

const SOUND_PATTERNS = {
  jump: [
    { frequency: 280, endFrequency: 520, duration: 0.13, waveform: 'triangle' },
  ],
  coin: [
    { frequency: 740, duration: 0.07, delay: 0, waveform: 'square' },
    { frequency: 1040, duration: 0.1, delay: 0.055, waveform: 'triangle' },
  ],
  hit: [
    { frequency: 260, endFrequency: 95, duration: 0.22, waveform: 'sawtooth' },
  ],
  fall: [
    { frequency: 210, endFrequency: 65, duration: 0.34, waveform: 'triangle' },
  ],
  level: [
    { frequency: 392, duration: 0.09, delay: 0, waveform: 'square' },
    { frequency: 587, duration: 0.09, delay: 0.1, waveform: 'square' },
    { frequency: 784, duration: 0.12, delay: 0.2, waveform: 'triangle' },
    { frequency: 659, duration: 0.18, delay: 0.34, waveform: 'triangle' },
  ],
}

export function setGameSoundsEnabled(enabled) {
  soundsEnabled = enabled
}

export function unlockGameAudio() {
  if (typeof window === 'undefined') return false
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext
  if (!AudioContextConstructor) return false

  if (!audioContext) audioContext = new AudioContextConstructor()
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch((error) => {
      console.warn('Could not enable game audio.', error)
    })
  }
  return true
}

export function playGameSound(name) {
  if (!soundsEnabled || !audioContext || audioContext.state !== 'running') return
  const pattern = SOUND_PATTERNS[name]
  if (!pattern) return

  const now = audioContext.currentTime
  pattern.forEach((note) => {
    const start = now + (note.delay || 0)
    const oscillator = audioContext.createOscillator()
    const volume = audioContext.createGain()
    oscillator.type = note.waveform
    oscillator.frequency.setValueAtTime(note.frequency, start)
    if (note.endFrequency) {
      oscillator.frequency.exponentialRampToValueAtTime(
        note.endFrequency,
        start + note.duration
      )
    }
    volume.gain.setValueAtTime(0.0001, start)
    volume.gain.exponentialRampToValueAtTime(0.075, start + 0.012)
    volume.gain.exponentialRampToValueAtTime(0.0001, start + note.duration)
    oscillator.connect(volume)
    volume.connect(audioContext.destination)
    oscillator.start(start)
    oscillator.stop(start + note.duration + 0.01)
  })
}
