import { ensureValidNoteName, MFNoteName } from './note'

export interface MFInstrumentJSON {
  readonly __type: 'instrument'
  readonly name: string
  readonly resourceURI: string
  readonly unpitched: boolean
  readonly noteNameMapping: Partial<Record<string, string>>
}

export class MFInstrument {
  public readonly name: string
  public readonly resourceURI: string
  public readonly unpitched: boolean
  public readonly noteNameMapping: Partial<Record<MFNoteName, string>>

  constructor({
    name,
    resourceURI,
    unpitched = false,
    noteNameMapping = {},
  }: {
    readonly name: string
    readonly resourceURI: string
    readonly unpitched?: boolean
    readonly noteNameMapping?: Partial<Record<MFNoteName, string>>
  }) {
    this.name = name
    this.resourceURI = resourceURI
    this.unpitched = unpitched
    this.noteNameMapping = noteNameMapping
  }

  static is(other: unknown): other is MFInstrument {
    return other instanceof MFInstrument
  }

  static fromJSON(json: MFInstrumentJSON): MFInstrument {
    if (json.__type !== 'instrument') {
      throw new Error('invalid instrument json type')
    }

    return new MFInstrument({
      name: json.name,
      resourceURI: json.resourceURI,
      unpitched: json.unpitched,
      noteNameMapping: json.noteNameMapping,
    })
  }

  equals(other: unknown): boolean {
    return (
      other instanceof MFInstrument &&
      other.name === this.name &&
      other.resourceURI === this.resourceURI &&
      other.unpitched === this.unpitched &&
      Object.keys(other.noteNameMapping)
        .map(ensureValidNoteName)
        .every(key => this.noteNameMapping[key] === other.noteNameMapping[key])
    )
  }

  copy({
    name,
    resourceURI,
    unpitched,
    noteNameMapping,
  }: {
    readonly name?: string
    readonly resourceURI?: string
    readonly unpitched?: boolean
    readonly noteNameMapping?: Partial<Record<MFNoteName, string>>
  } = {}): MFInstrument {
    return new MFInstrument({
      name: name ?? this.name,
      resourceURI: resourceURI ?? this.resourceURI,
      unpitched: unpitched ?? this.unpitched,
      noteNameMapping: noteNameMapping ?? this.noteNameMapping,
    })
  }

  toJSON(): MFInstrumentJSON {
    return {
      __type: 'instrument',
      name: this.name,
      resourceURI: this.resourceURI,
      unpitched: this.unpitched,
      noteNameMapping: this.noteNameMapping,
    }
  }
}
