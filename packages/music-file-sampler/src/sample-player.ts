import { MFChord, MFKey, MFNote } from 'music-file'
import { getChordPitches, getNotePitch, Pitch } from './note-pitch'
import { MFSample } from './sample'
import { MFSampleManager } from './sample-manager'

export class MFSampleNode {
  private readonly sourceNode: AudioBufferSourceNode
  private readonly gainNode: GainNode

  private readonly onSoundOn?: (sampleNode: MFSampleNode) => void
  private readonly onSoundOff?: (sampleNode: MFSampleNode) => void

  constructor(
    private readonly ctx: AudioContext,
    private readonly sample: MFSample,
    private readonly volume: number,
    {
      onSoundOn,
      onSoundOff,
    }: {
      readonly onSoundOn?: (sampleNode: MFSampleNode) => void
      readonly onSoundOff?: (sampleNode: MFSampleNode) => void
    } = {},
  ) {
    this.onSoundOn = onSoundOn
    this.onSoundOff = onSoundOff

    this.sourceNode = ctx.createBufferSource()
    this.gainNode = ctx.createGain()

    this.sourceNode.connect(this.gainNode)
    this.gainNode.connect(this.ctx.destination)

    this.sourceNode.playbackRate.value = 1
    this.sourceNode.buffer = sample.audioBuffer

    this.sourceNode.onended = () => {
      this.gainNode.disconnect()
      this.sourceNode.disconnect()
    }
  }

  soundOn(): void {
    const now = this.ctx.currentTime
    const gainValue = this.volume / 100

    const {
      attackAmp,
      attackTime,
      decayAmp,
      decayTime,
      sustainAmp,
      sustainTime,
    } = this.sample.adsr

    this.gainNode.gain
      .linearRampToValueAtTime(gainValue * attackAmp, now + attackTime)
      .linearRampToValueAtTime(
        gainValue * decayAmp,
        now + attackTime + decayTime,
      )
      .linearRampToValueAtTime(
        gainValue * sustainAmp,
        now + attackTime + sustainTime,
      )

    this.sourceNode.start()

    this.onSoundOn?.(this)
  }

  soundOff(): void {
    const now = this.ctx.currentTime
    const gainValue = this.gainNode.gain.value

    const { releaseAmp, releaseTime } = this.sample.adsr

    this.gainNode.gain.linearRampToValueAtTime(
      gainValue * releaseAmp,
      now + releaseTime,
    )

    this.sourceNode.stop(now + releaseTime)

    this.onSoundOff?.(this)
  }

  setVolume(volume: number): void {
    const now = this.ctx.currentTime
    const gainValue = volume / 100

    this.gainNode.gain.cancelScheduledValues(now).setValueAtTime(gainValue, now)
  }
}

export class MFSamplePlayer {
  private readonly playingSampleNodes: Set<MFSampleNode>

  constructor(
    private readonly ctx: AudioContext,
    private readonly manager: MFSampleManager,
  ) {
    this.playingSampleNodes = new Set<MFSampleNode>()
  }

  playSample({
    instrumentURI,
    sampleURI,
    volume = 100,
    durationMs = 0,
  }: {
    readonly instrumentURI: string
    readonly sampleURI: string
    readonly volume?: number
    readonly durationMs?: number
  }): MFSampleNode {
    const sample = this.manager.resolveSample(instrumentURI, sampleURI)
    const sampleNode = new MFSampleNode(this.ctx, sample, volume, {
      onSoundOn: node => this.playingSampleNodes.add(node),
      onSoundOff: node => this.playingSampleNodes.delete(node),
    })

    sampleNode.soundOn()

    if (durationMs > 0) {
      setTimeout(() => sampleNode.soundOff(), durationMs)
    }

    return sampleNode
  }

  playSampleByNote({
    instrumentURI,
    note,
    key,
    volume = 100,
    durationMs = 0,
    sampleURIResolver = pitch => `sample:${pitch}`,
  }: {
    readonly instrumentURI: string
    readonly note: MFNote
    readonly key: MFKey
    readonly volume?: number
    readonly durationMs?: number
    readonly sampleURIResolver?: (pitch: Pitch) => string
  }): MFSampleNode {
    const pitch = getNotePitch(note, key)
    const sampleURI = sampleURIResolver(pitch)

    return this.playSample({
      instrumentURI,
      sampleURI,
      volume,
      durationMs,
    })
  }

  playSamplesByChord({
    instrumentURI,
    chord,
    key,
    volume = 100,
    durationMs = 0,
    sampleURIResolver = pitch => `sample:${pitch}`,
  }: {
    readonly instrumentURI: string
    readonly chord: MFChord
    readonly key: MFKey
    readonly volume?: number
    readonly durationMs?: number
    readonly sampleURIResolver?: (pitch: Pitch) => string
  }): readonly MFSampleNode[] {
    return getChordPitches(chord, key).map(pitch =>
      this.playSample({
        instrumentURI,
        sampleURI: sampleURIResolver(pitch),
        volume,
        durationMs,
      }),
    )
  }

  stopAllSamples(): void {
    this.playingSampleNodes.forEach(node => node.soundOff())
  }
}
