import { MFChord, MFChordJSON } from './chord'
import { MFNote, MFNoteJSON } from './note'
import { MFRef, MFRefJSON } from './ref'

const _isReadonlyArray = (arg: any): arg is ReadonlyArray<any> =>
  Array.isArray(arg)

export type MFTrackItemSource = MFTrackItemArray | MFNote | MFChord | MFRef
export type MFTrackItemSourceType =
  | typeof MFTrackItemArray
  | typeof MFNote
  | typeof MFChord
  | typeof MFRef

export type MFTrackItemSourceJSON =
  | readonly MFTrackItemJSON[]
  | MFNoteJSON
  | MFChordJSON
  | MFRefJSON

export interface MFTrackItemJSON {
  readonly __type: 'trackItem'
  readonly source: MFTrackItemSourceJSON
  readonly begin: number
  readonly duration: number
}

export class MFTrackItem {
  public readonly source: MFTrackItemSource
  public readonly begin: number
  public readonly duration: number

  constructor({
    source,
    begin,
    duration,
  }: {
    readonly source: MFTrackItemSource
    readonly begin: number
    readonly duration: number
  }) {
    this.source = source
    this.begin = begin
    this.duration = duration
  }

  static fromJSON(json: MFTrackItemJSON): MFTrackItem {
    if (json.__type !== 'trackItem') {
      throw new Error('invalid trackItem json type')
    }

    const source = _isReadonlyArray(json.source)
      ? MFTrackItemArray.fromJSON(json.source)
      : json.source.__type === 'note'
      ? MFNote.fromJSON(json.source)
      : json.source.__type === 'chord'
      ? MFChord.fromJSON(json.source)
      : json.source.__type === 'ref'
      ? MFRef.fromJSON(json.source)
      : null

    if (source === null) {
      throw new Error('invalid trackItem source json type')
    }

    return new MFTrackItem({
      source,
      begin: json.begin,
      duration: json.duration,
    })
  }

  get end(): number {
    return this.begin + this.duration
  }

  get sourceType(): MFTrackItemSourceType {
    return this.source.constructor as MFTrackItemSourceType
  }

  isTimeOverlappedWith(other: MFTrackItem): boolean {
    const ranges = [
      [this.begin, this.begin + this.duration],
      [other.begin, other.begin + other.duration],
    ]

    return (
      (ranges[0][0] <= ranges[1][0] && ranges[0][1] > ranges[1][0]) ||
      (ranges[1][0] <= ranges[0][0] && ranges[1][1] > ranges[0][0])
    )
  }

  isConsecutiveTo(other: MFTrackItem): boolean {
    return this.begin + this.duration === other.begin
  }

  compareTo(other: MFTrackItem) {
    if (this.begin === other.begin) {
      if (this.duration === other.duration) {
        return 0
      }

      return this.duration < other.duration ? -1 : 1
    } else {
      return this.begin < other.begin ? -1 : 1
    }
  }

  equals(other: unknown): boolean {
    return (
      other instanceof MFTrackItem &&
      other.source.equals(this.source) &&
      other.begin === this.begin &&
      other.duration === this.duration
    )
  }

  copy({
    source,
    begin,
    duration,
  }: {
    readonly source?: MFTrackItemSource
    readonly begin?: number
    readonly duration?: number
  }): MFTrackItem {
    return new MFTrackItem({
      source: source ?? this.source,
      begin: begin ?? this.begin,
      duration: duration ?? this.duration,
    })
  }

  toJSON(): MFTrackItemJSON {
    return {
      __type: 'trackItem',
      source: _isReadonlyArray(this.source)
        ? this.source.map(item => item.toJSON())
        : this.source.toJSON(),
      begin: this.begin,
      duration: this.duration,
    }
  }
}

export class MFTrackItemArray {
  constructor(private readonly items: readonly MFTrackItem[] = []) {}

  static fromJSON(json: readonly MFTrackItemJSON[]): MFTrackItemArray {
    return new MFTrackItemArray(json.map(MFTrackItem.fromJSON))
  }

  static fromArray(items: readonly MFTrackItem[]): MFTrackItemArray {
    return new MFTrackItemArray(items)
  }

  get length(): number {
    return this.items.length
  }

  get isEmpty(): boolean {
    return this.length === 0
  }

  get isNotEmpty(): boolean {
    return this.length > 0
  }

  get first(): MFTrackItem {
    if (this.isEmpty) {
      throw new Error('no elements in the array')
    }

    return this.items[0]
  }

  get firstOrNull(): MFTrackItem | null {
    if (this.isEmpty) {
      throw null
    }

    return this.items[0]
  }

  get last(): MFTrackItem {
    if (this.isEmpty) {
      throw new Error('no elements in the array')
    }

    return this.items[this.items.length - 1]
  }

  get lastOrNull(): MFTrackItem | null {
    if (this.isEmpty) {
      throw null
    }

    return this.items[this.items.length - 1]
  }

  has(item: MFTrackItem): boolean {
    return this.items.includes(item)
  }

  at(index: number): MFTrackItem {
    return this.items[index]
  }

  slice(start?: number, end?: number): MFTrackItemArray {
    return new MFTrackItemArray(this.items.slice(start, end))
  }

  insert(item: MFTrackItem): MFTrackItemArray {
    const index = this.computeTrackItemInsertPos(item)

    return new MFTrackItemArray(
      this.items.slice(0, index).concat(item).concat(this.items.slice(index)),
    )
  }

  delete(item: MFTrackItem): MFTrackItemArray {
    return new MFTrackItemArray(this.items.filter(value => value !== item))
  }

  deleteAt(index: number): MFTrackItemArray {
    return new MFTrackItemArray(
      this.items.slice(0, index).concat(this.items.slice(index + 1)),
    )
  }

  replace(source: MFTrackItem, replacer: MFTrackItem): MFTrackItemArray {
    return this.delete(source).insert(replacer)
  }

  equals(other: unknown): boolean {
    return (
      other instanceof MFTrackItemArray &&
      other.items.length === this.items.length &&
      other.items.every((val, index) => val === this.items[index])
    )
  }

  toArray(): readonly MFTrackItem[] {
    return this.items
  }

  toJSON(): readonly MFTrackItemJSON[] {
    return this.items.map(item => item.toJSON())
  }

  private computeTrackItemInsertPos(item: MFTrackItem) {
    if (this.items.length === 0 || this.items[0].begin > item.begin) {
      return 0
    } else {
      let index = this.items.length - 1

      while (index >= 0) {
        const current = this.items[index]

        if (current.begin <= item.begin) {
          if (current.compareTo(item) < 0) {
            return index + 1
          } else {
            return index
          }
        }

        index--
      }

      return 0
    }
  }
}
