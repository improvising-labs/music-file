import {
  ensureValidOctave,
  MFOctave,
  MFOctaveJSON,
  MUSIC_FILE_MAX_OCTAVE,
  MUSIC_FILE_MIN_OCTAVE,
} from './octave'

export const MUSIC_FILE_NOTE_NAMES = [
  'do',
  'do#',
  're',
  're#',
  'mi',
  'fa',
  'fa#',
  'sol',
  'sol#',
  'la',
  'la#',
  'ti',
] as const

export const MUSIC_FILE_NOTE_OCTAVE_SPAN = MUSIC_FILE_NOTE_NAMES.length

export const MUSIC_FILE_MIN_NOTE_OFFSET =
  MUSIC_FILE_MIN_OCTAVE * MUSIC_FILE_NOTE_OCTAVE_SPAN

export const MUSIC_FILE_MAX_NOTE_OFFSET =
  (MUSIC_FILE_MAX_OCTAVE + 1) * MUSIC_FILE_NOTE_OCTAVE_SPAN - 1

export type MFNoteName = typeof MUSIC_FILE_NOTE_NAMES[number]

export interface MFNoteJSON {
  readonly __type: 'note'
  readonly name: string
  readonly octave: MFOctaveJSON
}

export class MFNote {
  constructor(
    public readonly name: MFNoteName,
    public readonly octave: MFOctave,
  ) {}

  static fromJSON(json: MFNoteJSON): MFNote {
    if (json.__type !== 'note') {
      throw new Error('invalid note json type')
    }

    return new MFNote(
      ensureValidNoteName(json.name),
      ensureValidOctave(json.octave),
    )
  }

  static fromOffset(offset: number) {
    const octave = Math.floor(offset / MUSIC_FILE_NOTE_OCTAVE_SPAN)
    const noteIndex = offset % MUSIC_FILE_NOTE_OCTAVE_SPAN
    const noteName = MUSIC_FILE_NOTE_NAMES[noteIndex]

    return new MFNote(noteName, ensureValidOctave(octave))
  }

  get accidental(): boolean {
    return this.name.includes('#')
  }

  get offset(): number {
    const baseIndex = this.octave * MUSIC_FILE_NOTE_OCTAVE_SPAN
    const index = MUSIC_FILE_NOTE_NAMES.indexOf(this.name)

    return baseIndex + index
  }

  getUpper(steps: number = 1): MFNote {
    const offset = this.offset + steps

    if (
      offset < MUSIC_FILE_MIN_NOTE_OFFSET ||
      offset > MUSIC_FILE_MAX_NOTE_OFFSET
    ) {
      return this
    }

    return MFNote.fromOffset(offset)
  }

  getLower(steps: number = 1): MFNote {
    const offset = this.offset - steps

    if (
      offset < MUSIC_FILE_MIN_NOTE_OFFSET ||
      offset > MUSIC_FILE_MAX_NOTE_OFFSET
    ) {
      return this
    }

    return MFNote.fromOffset(offset)
  }

  equals(other: unknown): boolean {
    return (
      other instanceof MFNote &&
      other.name === this.name &&
      other.octave === this.octave
    )
  }

  copy({
    name,
    octave,
  }: {
    readonly name?: MFNoteName
    readonly octave?: MFOctave
  } = {}): MFNote {
    return new MFNote(name ?? this.name, octave ?? this.octave)
  }

  toJSON(): MFNoteJSON {
    return {
      __type: 'note',
      name: this.name,
      octave: this.octave,
    }
  }
}

export const isValidNoteName = (x: string): x is MFNoteName => {
  return MUSIC_FILE_NOTE_NAMES.includes(x as MFNoteName)
}

export const ensureValidNoteName = (x: string): MFNoteName => {
  if (!isValidNoteName(x)) {
    throw new Error(`${x} is not a valid note name`)
  }

  return x
}
