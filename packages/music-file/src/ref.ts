export interface MFRefJSON {
  readonly __type: 'ref'
  readonly name: string
  readonly typeURI: string
  readonly resourceURI: string
}

export class MFRef {
  public readonly name: string
  public readonly typeURI: string
  public readonly resourceURI: string

  constructor({
    name,
    typeURI,
    resourceURI,
  }: {
    readonly name: string
    readonly typeURI: string
    readonly resourceURI: string
  }) {
    this.name = name
    this.typeURI = typeURI
    this.resourceURI = resourceURI
  }

  static fromJSON(json: MFRefJSON): MFRef {
    if (json.__type !== 'ref') {
      throw new Error('invalid sample json type')
    }

    return new MFRef({
      name: json.name,
      typeURI: json.typeURI,
      resourceURI: json.resourceURI,
    })
  }

  equals(other: unknown): boolean {
    return (
      other instanceof MFRef &&
      other.name === this.name &&
      other.resourceURI === this.resourceURI
    )
  }

  copy({
    name,
    typeURI,
    resourceURI,
  }: {
    readonly name?: string
    readonly typeURI?: string
    readonly resourceURI?: string
  } = {}): MFRef {
    return new MFRef({
      name: name ?? this.name,
      typeURI: typeURI ?? this.typeURI,
      resourceURI: resourceURI ?? this.resourceURI,
    })
  }

  toJSON(): MFRefJSON {
    return {
      __type: 'ref',
      name: this.name,
      typeURI: this.typeURI,
      resourceURI: this.resourceURI,
    }
  }
}