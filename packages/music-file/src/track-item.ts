import { MFChord, MFChordJSON } from './chord'
import { MFNote, MFNoteJSON } from './note'
import { MFRef, MFRefJSON } from './ref'

export type MFTrackItemSource = MFTrackItemFragment | MFNote | MFChord | MFRef
export type MFTrackItemSourceType =
  | typeof MFTrackItemFragment
  | typeof MFNote
  | typeof MFChord
  | typeof MFRef

export type MFTrackItemSourceJSON =
  | MFTrackItemFragmentJSON
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

  static is(other: unknown): other is MFTrackItem {
    return other instanceof MFTrackItem
  }

  static fromJSON(json: MFTrackItemJSON): MFTrackItem {
    if (json.__type !== 'trackItem') {
      throw new Error('invalid trackItem json type')
    }

    const source =
      json.source.__type === 'trackItemFragment'
        ? MFTrackItemFragment.fromJSON(json.source)
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

  isTimeWithin(begin: number, end: number): boolean {
    return (
      (this.begin <= begin && this.end > begin) ||
      (this.begin >= begin && this.begin < end)
    )
  }

  isTimeOverlappedWith(other: MFTrackItem): boolean {
    return this.isTimeWithin(other.begin, other.end)
  }

  isConsecutiveTo(other: MFTrackItem): boolean {
    return this.end === other.begin
  }

  compareTo(other: MFTrackItem) {
    if (this.begin === other.begin) {
      if (this.end === other.end) {
        return 0
      }

      return this.end < other.end ? -1 : 1
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
      source: this.source.toJSON(),
      begin: this.begin,
      duration: this.duration,
    }
  }
}

export class MFTrackItemArray {
  constructor(private readonly items: readonly MFTrackItem[] = []) {}

  static is(other: unknown): other is MFTrackItemArray {
    return other instanceof MFTrackItemArray
  }

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

  has(item: MFTrackItem): boolean
  has(predicate: (value: MFTrackItem) => boolean): boolean
  has(target: MFTrackItem | ((value: MFTrackItem) => boolean)) {
    if (typeof target === 'function') {
      return this.items.some(target)
    }

    return this.items.includes(target)
  }

  indexOf(item: MFTrackItem): number
  indexOf(predicate: (value: MFTrackItem) => boolean): number
  indexOf(target: MFTrackItem | ((value: MFTrackItem) => boolean)) {
    if (typeof target === 'function') {
      return this.items.findIndex(target)
    }

    return this.items.indexOf(target)
  }

  at(index: number): MFTrackItem {
    return this.items[index]
  }

  slice(start?: number, end?: number): MFTrackItemArray {
    return new MFTrackItemArray(this.items.slice(start, end))
  }

  computeInsertPos(item: MFTrackItem): number {
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

  insert(item: MFTrackItem): MFTrackItemArray {
    const index = this.computeInsertPos(item)

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
}

export interface MFTrackItemFragmentJSON {
  readonly __type: 'trackItemFragment'
  readonly duration: number
  readonly items: readonly MFTrackItemJSON[]
}

export class MFTrackItemFragment {
  public readonly duration: number
  public readonly items: MFTrackItemArray

  constructor({
    duration,
    items,
  }: {
    readonly duration: number
    readonly items?: MFTrackItemArray
  }) {
    this.duration = duration
    this.items = items ?? new MFTrackItemArray()
  }

  static is(other: unknown): other is MFTrackItemFragment {
    return other instanceof MFTrackItemFragment
  }

  static fromJSON(json: MFTrackItemFragmentJSON): MFTrackItemFragment {
    if (json.__type !== 'trackItemFragment') {
      throw new Error('invalid trackItemFragement json type')
    }

    return new MFTrackItemFragment({
      duration: json.duration,
      items: MFTrackItemArray.fromJSON(json.items),
    })
  }

  equals(other: unknown): boolean {
    return (
      other instanceof MFTrackItemFragment &&
      other.duration === this.duration &&
      other.items.equals(this.items)
    )
  }

  copy({
    duration,
    items,
  }: {
    readonly duration?: number
    readonly items?: MFTrackItemArray
  }): MFTrackItemFragment {
    return new MFTrackItemFragment({
      duration: duration ?? this.duration,
      items: items ?? this.items,
    })
  }

  toJSON(): MFTrackItemFragmentJSON {
    return {
      __type: 'trackItemFragment',
      duration: this.duration,
      items: this.items.toJSON(),
    }
  }
}
