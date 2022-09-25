import { MFKey, MFKeyJSON } from './key'
import { MFSignature, MFSignatureJSON } from './signature'
import { MFTrackArray, MFTrackJSON } from './track'
import {
  ensureValidUnitNoteType,
  MFUnitNoteType,
  MFUnitNoteTypeJSON,
} from './unit-note-type'

export const MUSIC_FILE_CURRENT_VERSION = '0.1-alpha'
export const MUSIC_FILE_SUPPORT_VERSIONS = ['0.1-alpha']

export interface MFMusicFileJSON {
  readonly __type: 'musicFile'
  readonly __version: string
  readonly name: string
  readonly key: MFKeyJSON
  readonly signature: MFSignatureJSON
  readonly unitNoteType: MFUnitNoteTypeJSON
  readonly bpm: number
  readonly numBars: number
  readonly tracks: readonly MFTrackJSON[]
}

export class MFMusicFile {
  public readonly name: string
  public readonly key: MFKey
  public readonly signature: MFSignature
  public readonly unitNoteType: MFUnitNoteType
  public readonly bpm: number
  public readonly numBars: number
  public readonly tracks: MFTrackArray

  public readonly numTicksPerBeat: number
  public readonly numTicksPerBar: number
  public readonly numTicks: number
  public readonly tickMs: number
  public readonly milliseconds: number

  public readonly minValidNumTicks: number
  public readonly minValidNumBars: number

  constructor({
    name,
    key,
    signature,
    unitNoteType,
    bpm,
    numBars,
    tracks,
  }: {
    readonly name: string
    readonly key: MFKey
    readonly signature: MFSignature
    readonly unitNoteType: MFUnitNoteType
    readonly bpm: number
    readonly numBars: number
    readonly tracks?: MFTrackArray
  }) {
    this.name = name
    this.key = key
    this.signature = signature
    this.unitNoteType = unitNoteType
    this.bpm = bpm
    this.numBars = numBars
    this.tracks = tracks ?? new MFTrackArray()

    this.numTicksPerBeat = unitNoteType / signature.beatNoteType
    this.numTicksPerBar = signature.numBeats * this.numTicksPerBeat
    this.numTicks = numBars * this.numTicksPerBar
    this.tickMs = (60 * 1000) / (this.numTicksPerBeat * bpm)
    this.milliseconds = this.numTicks * this.tickMs

    const longestTrackTicks =
      this.tracks
        .toArray()
        .filter(track => track.items.length > 0)
        .map(track => track.items.last.end)
        .sort()[0] ?? 0

    this.minValidNumTicks = longestTrackTicks
    this.minValidNumBars = Math.ceil(longestTrackTicks / this.numTicksPerBar)
  }

  static fromJSON(json: MFMusicFileJSON): MFMusicFile {
    if (json.__type !== 'musicFile') {
      throw new Error('invalid musicFile json type')
    }

    if (!MUSIC_FILE_SUPPORT_VERSIONS.includes(json.__version)) {
      throw new Error('unsupported musicFile version')
    }

    return new MFMusicFile({
      name: json.name,
      key: MFKey.fromJSON(json.key),
      signature: MFSignature.fromJSON(json.signature),
      unitNoteType: ensureValidUnitNoteType(json.unitNoteType),
      bpm: json.bpm,
      numBars: json.numBars,
      tracks: MFTrackArray.fromJSON(json.tracks),
    })
  }

  equals(other: unknown): boolean {
    return (
      other instanceof MFMusicFile &&
      other.name === this.name &&
      other.key === this.key &&
      other.signature.equals(this.signature) &&
      other.unitNoteType === this.unitNoteType &&
      other.bpm === this.bpm &&
      other.numBars === this.numBars &&
      other.tracks.equals(this.tracks)
    )
  }

  copy({
    name,
    key,
    signature,
    unitNoteType,
    bpm,
    numBars,
    tracks,
  }: {
    readonly name?: string
    readonly key?: MFKey
    readonly signature?: MFSignature
    readonly unitNoteType?: MFUnitNoteType
    readonly bpm?: number
    readonly numBars?: number
    readonly tracks?: MFTrackArray
  } = {}): MFMusicFile {
    return new MFMusicFile({
      name: name ?? this.name,
      key: key ?? this.key,
      signature: signature ?? this.signature,
      unitNoteType: unitNoteType ?? this.unitNoteType,
      bpm: bpm ?? this.bpm,
      numBars: numBars ?? this.numBars,
      tracks: tracks ?? this.tracks,
    })
  }

  toJSON(): MFMusicFileJSON {
    return {
      __type: 'musicFile',
      __version: MUSIC_FILE_CURRENT_VERSION,
      name: this.name,
      key: this.key.toJSON(),
      signature: this.signature.toJSON(),
      unitNoteType: this.unitNoteType,
      bpm: this.bpm,
      numBars: this.numBars,
      tracks: this.tracks.toJSON(),
    }
  }
}
