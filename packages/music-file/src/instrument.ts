export interface MFInstrumentJSON {
  readonly __type: 'instrument'
  readonly name: string
  readonly resourceURI: string
}

export class MFInstrument {
  public readonly name: string
  public readonly resourceURI: string

  constructor({
    name,
    resourceURI,
  }: {
    readonly name: string
    readonly resourceURI: string
  }) {
    this.name = name
    this.resourceURI = resourceURI
  }

  static fromJSON(json: MFInstrumentJSON): MFInstrument {
    if (json.__type !== 'instrument') {
      throw new Error('invalid instrument json type')
    }

    return new MFInstrument({
      name: json.name,
      resourceURI: json.resourceURI,
    })
  }

  equals(other: unknown): boolean {
    return (
      other instanceof MFInstrument &&
      other.name === this.name &&
      other.resourceURI === this.resourceURI
    )
  }

  copy({
    name,
    resourceURI,
  }: {
    readonly name?: string
    readonly resourceURI?: string
  } = {}): MFInstrument {
    return new MFInstrument({
      name: name ?? this.name,
      resourceURI: resourceURI ?? this.resourceURI,
    })
  }

  toJSON(): MFInstrumentJSON {
    return {
      __type: 'instrument',
      name: this.name,
      resourceURI: this.resourceURI,
    }
  }
}
