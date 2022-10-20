import { MFInstrument, MFInstrumentJSON } from './instrument'
import { MFTrackItemArray, MFTrackItemJSON } from './track-item'

export interface MFTrackJSON {
  readonly __type: 'track'
  readonly name: string
  readonly instrument: MFInstrumentJSON
  readonly volume: number
  readonly solo: boolean
  readonly muted: boolean
  readonly items: readonly MFTrackItemJSON[]
}

export class MFTrack {
  public readonly name: string
  public readonly instrument: MFInstrument
  public readonly volume: number
  public readonly solo: boolean
  public readonly muted: boolean
  public readonly items: MFTrackItemArray

  constructor({
    name,
    instrument,
    volume = 100,
    solo = false,
    muted = false,
    items,
  }: {
    readonly name: string
    readonly instrument: MFInstrument
    readonly volume?: number
    readonly solo?: boolean
    readonly muted?: boolean
    readonly items?: MFTrackItemArray
  }) {
    this.name = name
    this.instrument = instrument
    this.volume = volume
    this.solo = solo
    this.muted = muted
    this.items = items ?? new MFTrackItemArray()
  }

  static is(other: unknown): other is MFTrack {
    return other instanceof MFTrack
  }

  static fromJSON(json: MFTrackJSON): MFTrack {
    if (json.__type !== 'track') {
      throw new Error('invalid track json type')
    }

    return new MFTrack({
      name: json.name,
      instrument: MFInstrument.fromJSON(json.instrument),
      volume: json.volume,
      solo: json.solo,
      muted: json.muted,
      items: MFTrackItemArray.fromJSON(json.items),
    })
  }

  equals(other: unknown): boolean {
    return (
      other instanceof MFTrack &&
      other.name === this.name &&
      other.instrument.equals(this.instrument) &&
      other.volume === this.volume &&
      other.solo === this.solo &&
      other.muted === this.muted &&
      other.items.equals(this.items)
    )
  }

  copy({
    name,
    instrument,
    volume,
    solo,
    muted,
    items,
  }: {
    readonly name?: string
    readonly instrument?: MFInstrument
    readonly volume?: number
    readonly solo?: boolean
    readonly muted?: boolean
    readonly items?: MFTrackItemArray
  }): MFTrack {
    return new MFTrack({
      name: name ?? this.name,
      instrument: instrument ?? this.instrument,
      volume: volume ?? this.volume,
      solo: solo ?? this.solo,
      muted: muted ?? this.muted,
      items: items ?? this.items,
    })
  }

  toJSON(): MFTrackJSON {
    return {
      __type: 'track',
      name: this.name,
      instrument: this.instrument.toJSON(),
      volume: this.volume,
      solo: this.solo,
      muted: this.muted,
      items: this.items.toJSON(),
    }
  }
}

export class MFTrackArray {
  constructor(private readonly tracks: readonly MFTrack[] = []) {}

  static is(other: unknown): other is MFTrackArray {
    return other instanceof MFTrackArray
  }

  static fromJSON(json: readonly MFTrackJSON[]): MFTrackArray {
    return new MFTrackArray(json.map(MFTrack.fromJSON))
  }

  static fromArray(items: readonly MFTrack[]): MFTrackArray {
    return new MFTrackArray(items)
  }

  get length(): number {
    return this.tracks.length
  }

  get isEmpty(): boolean {
    return this.length === 0
  }

  get isNotEmpty(): boolean {
    return this.length > 0
  }

  get first(): MFTrack {
    if (this.isEmpty) {
      throw new Error('no elements in the array')
    }

    return this.tracks[0]
  }

  get firstOrNull(): MFTrack | null {
    if (this.isEmpty) {
      throw null
    }

    return this.tracks[0]
  }

  get last(): MFTrack {
    if (this.isEmpty) {
      throw new Error('no elements in the array')
    }

    return this.tracks[this.tracks.length - 1]
  }

  get lastOrNull(): MFTrack | null {
    if (this.isEmpty) {
      throw null
    }

    return this.tracks[this.tracks.length - 1]
  }

  has(track: MFTrack): boolean
  has(predicate: (value: MFTrack) => boolean): boolean
  has(target: MFTrack | ((value: MFTrack) => boolean)) {
    if (typeof target === 'function') {
      return this.tracks.some(target)
    }

    return this.tracks.includes(target)
  }

  indexOf(track: MFTrack): number
  indexOf(predicate: (value: MFTrack) => boolean): number
  indexOf(target: MFTrack | ((value: MFTrack) => boolean)) {
    if (typeof target === 'function') {
      return this.tracks.findIndex(target)
    }

    return this.tracks.indexOf(target)
  }

  at(index: number): MFTrack {
    return this.tracks[index]
  }

  slice(start?: number, end?: number): MFTrackArray {
    return new MFTrackArray(this.tracks.slice(start, end))
  }

  insert(track: MFTrack): MFTrackArray {
    return new MFTrackArray(this.tracks.concat(track))
  }

  insertAt(index: number, track: MFTrack): MFTrackArray {
    return new MFTrackArray(
      this.tracks
        .slice(0, index)
        .concat(track)
        .concat(this.tracks.slice(index)),
    )
  }

  delete(track: MFTrack): MFTrackArray {
    return new MFTrackArray(this.tracks.filter(value => value !== track))
  }

  deleteAt(index: number): MFTrackArray {
    return new MFTrackArray(
      this.tracks.slice(0, index).concat(this.tracks.slice(index + 1)),
    )
  }

  replace(source: MFTrack, replacer: MFTrack): MFTrackArray {
    return new MFTrackArray(
      Object.assign(this.tracks.slice(), {
        [this.tracks.indexOf(source)]: replacer,
      }),
    )
  }

  replaceAt(
    index: number,
    replacer: MFTrack | ((track: MFTrack) => MFTrack),
  ): MFTrackArray {
    return new MFTrackArray(
      Object.assign(this.tracks.slice(), {
        [index]:
          typeof replacer === 'function'
            ? replacer(this.tracks[index])
            : replacer,
      }),
    )
  }

  swap(a: number, b: number): MFTrackArray {
    return new MFTrackArray(
      Object.assign(this.tracks.slice(), {
        [a]: this.tracks[b],
        [b]: this.tracks[a],
      }),
    )
  }

  equals(other: unknown): boolean {
    return (
      other instanceof MFTrackArray &&
      other.tracks.length === this.tracks.length &&
      other.tracks.every((val, index) => val === this.tracks[index])
    )
  }

  toArray(): readonly MFTrack[] {
    return this.tracks
  }

  toJSON(): readonly MFTrackJSON[] {
    return this.tracks.map(track => track.toJSON())
  }
}
