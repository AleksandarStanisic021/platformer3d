let audioContext
let soundsEnabled = true
let rainIntensity = 0
let rainSource
let rainGain
let lastRainGain = 0

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

const ENEMY_SOUND_NOTES = {
  slime: [
    { frequency: 190, endFrequency: 125, duration: 0.18, waveform: 'triangle' },
    { frequency: 280, endFrequency: 220, duration: 0.12, delay: 0.1, waveform: 'sine' },
  ],
  blaze: [
    { frequency: 420, endFrequency: 165, duration: 0.28, waveform: 'sawtooth' },
    { frequency: 610, endFrequency: 350, duration: 0.16, delay: 0.08, waveform: 'triangle' },
  ],
  wisp: [
    { frequency: 680, endFrequency: 910, duration: 0.32, waveform: 'sine' },
    { frequency: 980, endFrequency: 740, duration: 0.24, delay: 0.12, waveform: 'sine' },
  ],
  orc: [
    { frequency: 105, endFrequency: 78, duration: 0.3, waveform: 'sawtooth' },
    { frequency: 145, endFrequency: 115, duration: 0.2, delay: 0.18, waveform: 'triangle' },
  ],
}

export function setGameSoundsEnabled(enabled) {
  soundsEnabled = enabled
  syncRainAudio()
}

export function setRainSoundIntensity(intensity) {
  rainIntensity = Math.max(0, Math.min(1, intensity))
  syncRainAudio()
}

function syncRainAudio() {
  if (!audioContext || audioContext.state !== 'running') return

  const targetGain = soundsEnabled ? rainIntensity * 0.045 : 0
  if (targetGain > 0.001 && !rainSource) {
    const buffer = audioContext.createBuffer(
      1,
      audioContext.sampleRate * 2,
      audioContext.sampleRate
    )
    const samples = buffer.getChannelData(0)
    for (let i = 0; i < samples.length; i += 1) {
      samples[i] = Math.random() * 2 - 1
    }

    const filter = audioContext.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 2600
    rainGain = audioContext.createGain()
    rainGain.gain.value = 0
    rainSource = audioContext.createBufferSource()
    rainSource.buffer = buffer
    rainSource.loop = true
    rainSource.connect(filter)
    filter.connect(rainGain)
    rainGain.connect(audioContext.destination)
    rainSource.start()
  }

  if (!rainGain || Math.abs(targetGain - lastRainGain) < 0.002) return
  rainGain.gain.setTargetAtTime(targetGain, audioContext.currentTime, 0.16)
  lastRainGain = targetGain
}

export function unlockGameAudio() {
  if (typeof window === 'undefined') return false
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext
  if (!AudioContextConstructor) return false

  if (!audioContext) audioContext = new AudioContextConstructor()
  if (audioContext.state === 'suspended') {
    audioContext.resume()
      .then(syncRainAudio)
      .catch((error) => console.warn('Could not enable game audio.', error))
  } else {
    syncRainAudio()
  }
  return true
}

export function playGameSound(name) {
  if (!soundsEnabled || !audioContext || audioContext.state !== 'running') return
  const pattern = SOUND_PATTERNS[name]
  if (!pattern) return

  playNotes(pattern, 0.075)
}

export function playEnemySound(type) {
  if (!soundsEnabled || !audioContext || audioContext.state !== 'running') return
  const pattern = ENEMY_SOUND_NOTES[type]
  if (pattern) playNotes(pattern, 0.028)
}

function playNotes(pattern, peakVolume) {
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
    volume.gain.exponentialRampToValueAtTime(peakVolume, start + 0.012)
    volume.gain.exponentialRampToValueAtTime(0.0001, start + note.duration)
    oscillator.connect(volume)
    volume.connect(audioContext.destination)
    oscillator.start(start)
    oscillator.stop(start + note.duration + 0.01)
  })
}
