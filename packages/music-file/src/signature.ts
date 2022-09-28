export const MUSIC_FILE_SIGNATURE_TUPLES = [
  [2, 2],
  [2, 4],
  [3, 4],
  [4, 4],
  [6, 8],
  [9, 8],
  [12, 8],
] as const

export type MFSignatureTuple = typeof MUSIC_FILE_SIGNATURE_TUPLES[number]
export type MFSignatureNumBeats = MFSignatureTuple[0]
export type MFSignatureBeatNoteType = MFSignatureTuple[1]

export interface MFSignatureJSON {
  readonly __type: 'signature'
  readonly numBeats: number
  readonly beatNoteType: number
}

export class MFSignature {
  constructor(
    public readonly numBeats: MFSignatureNumBeats,
    public readonly beatNoteType: MFSignatureBeatNoteType,
  ) {}

  static fromJSON(json: MFSignatureJSON): MFSignature {
    if (json.__type !== 'signature') {
      throw new Error('invalid signature json type')
    }

    return new MFSignature(
      ensureValidSignatureNumBeats(json.numBeats),
      ensureValidSignatureBeatNoteType(json.beatNoteType),
    )
  }

  get tuple(): MFSignatureTuple {
    return [this.numBeats, this.beatNoteType] as MFSignatureTuple
  }

  equals(other: unknown): boolean {
    return (
      other instanceof MFSignature &&
      other.numBeats == this.numBeats &&
      other.beatNoteType === this.beatNoteType
    )
  }

  copy({
    numBeats,
    beatNoteType,
  }: {
    readonly numBeats?: MFSignatureNumBeats
    readonly beatNoteType?: MFSignatureBeatNoteType
  } = {}): MFSignature {
    return new MFSignature(
      numBeats ?? this.numBeats,
      beatNoteType ?? this.beatNoteType,
    )
  }

  toJSON(): MFSignatureJSON {
    return {
      __type: 'signature',
      numBeats: this.numBeats,
      beatNoteType: this.beatNoteType,
    }
  }
}

export const isValidSignatureNumBeats = (
  x: number,
): x is MFSignatureNumBeats => {
  return MUSIC_FILE_SIGNATURE_TUPLES.some(tuple => tuple[0] === x)
}

export const ensureValidSignatureNumBeats = (
  x: number,
): MFSignatureNumBeats => {
  if (!isValidSignatureNumBeats(x)) {
    throw new Error(`${x} is not a valid signature numBeats`)
  }

  return x
}

export const isValidSignatureBeatNoteType = (
  x: number,
): x is MFSignatureBeatNoteType => {
  return MUSIC_FILE_SIGNATURE_TUPLES.some(tuple => tuple[1] === x)
}

export const ensureValidSignatureBeatNoteType = (
  x: number,
): MFSignatureBeatNoteType => {
  if (!isValidSignatureBeatNoteType(x)) {
    throw new Error(`${x} is not a valid signature beatNoteType`)
  }

  return x
}
