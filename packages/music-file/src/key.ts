export const MUSIC_FILE_KEY_NAMES = [
  'C',
  'D',
  'E',
  'F',
  'G',
  'A',
  'B',
  'C#',
  'Cb',
  'Db',
  'Eb',
  'F#',
  'Gb',
  'Ab',
  'Bb',
] as const

export const MUSIC_FILE_ORDERED_KEY_NAMES = [
  'C',
  'C#',
  'D',
  'Eb',
  'E',
  'F',
  'F#',
  'G',
  'Ab',
  'A',
  'Bb',
  'B',
] as const

export const MUSIC_FILE_KEY_NAME_OFFSET_MAP = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
  'C#': 1,
  Cb: 11,
  Db: 1,
  Eb: 3,
  'F#': 6,
  Gb: 6,
  Ab: 8,
  Bb: 10,
} as const

export type MFKeyName = typeof MUSIC_FILE_KEY_NAMES[number]
export type MFKeyOffset = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11

export interface MFKeyJSON {
  readonly __type: 'key'
  readonly name: string
}

export class MFKey {
  constructor(public readonly name: MFKeyName) {}

  static is(other: unknown): other is MFKey {
    return other instanceof MFKey
  }

  static fromJSON(json: MFKeyJSON): MFKey {
    if (json.__type !== 'key') {
      throw new Error('invalid key json type')
    }

    return new MFKey(ensureValidKeyName(json.name))
  }

  get offset(): MFKeyOffset {
    return MUSIC_FILE_KEY_NAME_OFFSET_MAP[this.name]
  }

  getUpper(steps: number = 1): MFKey {
    const offset = this.offset + steps

    if (offset < 0 || offset > MUSIC_FILE_ORDERED_KEY_NAMES.length - 1) {
      return this
    }

    return new MFKey(MUSIC_FILE_ORDERED_KEY_NAMES[offset])
  }

  getLower(steps: number = 1): MFKey {
    const offset = this.offset - steps

    if (offset < 0 || offset > MUSIC_FILE_ORDERED_KEY_NAMES.length - 1) {
      return this
    }

    return new MFKey(MUSIC_FILE_ORDERED_KEY_NAMES[offset])
  }

  equals(other: unknown): boolean {
    return other instanceof MFKey && other.name === this.name
  }

  copy({ name }: { readonly name?: MFKeyName } = {}): MFKey {
    return new MFKey(name ?? this.name)
  }

  toJSON(): MFKeyJSON {
    return {
      __type: 'key',
      name: this.name,
    }
  }
}

export const isValidKeyName = (x: string): x is MFKeyName => {
  return MUSIC_FILE_KEY_NAMES.includes(x as MFKeyName)
}

export const ensureValidKeyName = (x: string): MFKeyName => {
  if (!isValidKeyName(x)) {
    throw new Error(`${x} is not a valid key name`)
  }

  return x
}
