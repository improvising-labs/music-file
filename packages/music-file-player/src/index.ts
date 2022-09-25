import {
  MFChord,
  MFMusicFile,
  MFNote,
  MFRef,
  MFTrack,
  MFTrackItem,
} from 'music-file'
import { MFSamplePlayer } from 'music-file-sampler'

export class MFMusicFilePlayback {
  private readonly onTick?: (currentTick: number) => void
  private readonly onEnd?: (currentTick: number) => void

  private currentTick: number
  private disposed: boolean

  constructor(
    private readonly samplePlayer: MFSamplePlayer,
    private readonly musicFile: MFMusicFile,
    {
      initialTick = 0,
      onTick,
      onEnd,
    }: {
      readonly initialTick?: number
      readonly onTick?: (currentTick: number) => void
      readonly onEnd?: (currentTick: number) => void
    } = {},
  ) {
    this.onTick = onTick
    this.onEnd = onEnd

    this.currentTick = initialTick
    this.disposed = false

    this.tick()
  }

  dispose(): void {
    this.samplePlayer.stopAllSamples()
    this.disposed = true
  }

  private tick(): void {
    if (this.disposed) {
      return
    }

    if (this.currentTick >= this.musicFile.numTicks) {
      this.onEnd?.(this.currentTick)
      return
    }

    for (const track of this.musicFile.tracks.toArray()) {
      for (const trackItem of track.items.toArray()) {
        if (trackItem.begin === this.currentTick) {
          this.playTrackItem(track, trackItem)
        }
      }
    }

    this.onTick?.(this.currentTick)
    this.currentTick++

    setTimeout(this.tick.bind(this), this.musicFile.tickMs)
  }

  private playTrackItem(track: MFTrack, trackItem: MFTrackItem): void {
    if (trackItem.source instanceof MFNote) {
      this.samplePlayer.playSampleByNote({
        instrumentURI: track.instrument.resourceURI,
        note: trackItem.source,
        key: this.musicFile.key,
        volume: track.volume,
        durationMs: trackItem.duration * this.musicFile.tickMs,
      })
    } else if (trackItem.source instanceof MFChord) {
      this.samplePlayer.playSamplesByChord({
        instrumentURI: track.instrument.resourceURI,
        chord: trackItem.source,
        key: this.musicFile.key,
        volume: track.volume,
        durationMs: trackItem.duration * this.musicFile.tickMs,
      })
    } else if (trackItem.source instanceof MFRef) {
      if (trackItem.source.typeURI === 'type:sampler:sample') {
        this.samplePlayer.playSample({
          instrumentURI: track.instrument.resourceURI,
          sampleURI: trackItem.source.resourceURI,
          volume: track.volume,
          durationMs: trackItem.duration * this.musicFile.tickMs,
        })
      }
    }
  }
}

export class MFMusicFilePlayer {
  constructor(private readonly samplePlayer: MFSamplePlayer) {}

  createPlayback(
    musicFile: MFMusicFile,
    params: {
      readonly initialTick?: number
      readonly onTick?: (currentTick: number) => void
      readonly onEnd?: (currentTick: number) => void
    } = {},
  ): MFMusicFilePlayback {
    return new MFMusicFilePlayback(this.samplePlayer, musicFile, params)
  }
}
