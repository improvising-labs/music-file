import {
  MFChord,
  MFMusicFile,
  MFNote,
  MFRef,
  MFTrackItem,
  MFTrackItemFragment,
} from 'music-file'
import { MFSamplePlayer } from 'music-file-sampler'

export type PlaybackSubscriber = (currentTick: number, end?: boolean) => void

export interface PlaybackState {
  musicFile: MFMusicFile
  timeline: Record<number, [number, MFTrackItem][]>
}

export class MFMusicFilePlayer {
  private currentTick: number
  private playing: boolean
  private state: PlaybackState | null
  private subscribers: PlaybackSubscriber[]

  constructor(private readonly samplePlayer: MFSamplePlayer) {
    this.currentTick = 0
    this.playing = false
    this.state = null
    this.subscribers = []
  }

  setMusicFile(musicFile: MFMusicFile) {
    this.state = this.compileState(musicFile)
  }

  setCurrentTick(tick: number): MFMusicFilePlayer {
    if (this.state === null) {
      throw new Error('state is not compiled')
    }

    this.currentTick = tick

    return this
  }

  getCurrentTick(): number {
    return this.currentTick
  }

  isPlaying(): boolean {
    return this.playing
  }

  start(): MFMusicFilePlayer {
    if (this.state === null) {
      throw new Error('state is not compiled')
    }

    this.playing = true
    this.tick()

    return this
  }

  stop(): MFMusicFilePlayer {
    if (this.state === null) {
      throw new Error('state is not compiled')
    }

    this.playing = false

    return this
  }

  subscribe(cb: PlaybackSubscriber): () => void {
    this.subscribers.push(cb)

    return () => {
      this.subscribers = this.subscribers.filter(value => value !== cb)
    }
  }

  private tick(): void {
    if (!this.playing || !this.state) {
      return
    }

    if (this.currentTick >= this.state.musicFile.numTicks) {
      this.playing = false
      this.notifySubscribers()
      return
    }

    if (this.currentTick in this.state.timeline) {
      for (const [trackNum, item] of this.state.timeline[this.currentTick]) {
        this.playTrackItem(trackNum, item)
      }
    }

    this.notifySubscribers()
    this.currentTick++

    setTimeout(this.tick.bind(this), this.state.musicFile.tickMs)
  }

  private playTrackItem(trackNum: number, trackItem: MFTrackItem): void {
    if (!this.playing || !this.state) {
      return
    }

    const { key, tickMs, tracks } = this.state.musicFile
    const { instrument, volume } = tracks.at(trackNum)
    const { source, duration } = trackItem

    if (MFNote.is(source)) {
      this.samplePlayer.playSampleByNote({
        instrumentURI: instrument.resourceURI,
        note: source,
        key,
        volume,
        durationMs: duration * tickMs,
      })
    } else if (MFChord.is(source)) {
      this.samplePlayer.playSamplesByChord({
        instrumentURI: instrument.resourceURI,
        chord: source,
        key,
        volume,
        durationMs: duration * tickMs,
      })
    } else if (MFRef.is(source)) {
      if (source.typeURI === 'type:sampler:sample') {
        this.samplePlayer.playSample({
          instrumentURI: instrument.resourceURI,
          sampleURI: source.resourceURI,
          volume,
          durationMs: duration * tickMs,
        })
      }
    }
  }

  private compileState(musicFile: MFMusicFile): PlaybackState {
    const { tracks } = musicFile

    const state: PlaybackState = {
      musicFile,
      timeline: {},
    }

    for (let trackNum = 0; trackNum < musicFile.tracks.length; trackNum++) {
      const { items } = tracks.at(trackNum)

      for (const item of items.toArray()) {
        const { source } = item

        if (MFTrackItemFragment.is(source)) {
          for (const subItem of source.items.toArray()) {
            state.timeline[item.begin + subItem.begin] ??= []
            state.timeline[item.begin + subItem.begin].push([trackNum, subItem])
          }
        } else {
          state.timeline[item.begin] ??= []
          state.timeline[item.begin].push([trackNum, item])
        }
      }
    }

    return state
  }

  private notifySubscribers(): void {
    if (!this.state) {
      return
    }

    const currentTick = this.currentTick
    const end = currentTick === this.state.musicFile.numTicks

    this.subscribers.forEach(cb => cb(currentTick, end))
  }
}
