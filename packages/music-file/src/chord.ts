import { MFNote, MFNoteName, MUSIC_FILE_NOTE_NAMES } from './note'
import {
  ensureValidOctave,
  MFOctave,
  MFOctaveJSON,
  MUSIC_FILE_MAX_OCTAVE,
} from './octave'

export const MUSIC_FILE_CHORD_NAMES = [
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'I7',
  'II7',
  'III7',
  'IV7',
  'V7',
  'VI7',
  'VII7',
  'i',
  'ii',
  'iii',
  'iv',
  'v',
  'vi',
  'vii',
  'vii-dim',
  'V/V',
  'i7',
  'ii7',
  'iii7',
  'iv7',
  'v7',
  'vi7',
  'vii7',
] as const

export const MUSIC_FILE_CHORD_NAME_NOTE_NAMES_MAP: Record<
  MFChordName,
  readonly MFNoteName[]
> = {
  I: ['do', 'mi', 'sol'],
  II: ['re', 'fa#', 'la'],
  III: ['mi', 'sol#', 'ti'],
  IV: ['fa', 'la', 'do'],
  V: ['sol', 'ti', 're'],
  VI: ['la', 'do#', 'mi'],
  VII: ['ti', 're#', 'fa#'],
  I7: ['do', 'mi', 'sol', 'ti'],
  II7: ['re', 'fa#', 'la', 'do#'],
  III7: ['mi', 'sol#', 'ti', 're#'],
  IV7: ['fa', 'la', 'do', 'mi'],
  V7: ['sol', 'ti', 're', 'fa#'],
  VI7: ['la', 'do#', 'mi', 'sol#'],
  VII7: ['ti', 're#', 'fa#', 'la#'],
  i: ['do', 're#', 'sol'],
  ii: ['re', 'fa', 'la'],
  iii: ['mi', 'sol', 'ti'],
  iv: ['fa', 'sol#', 'do'],
  v: ['sol', 'la#', 're'],
  vi: ['la', 'do', 'mi'],
  vii: ['ti', 're', 'fa#'],
  'vii-dim': ['ti', 're', 'fa'],
  'V/V': ['re', 'fa#', 'la'],
  i7: ['do', 're#', 'sol', 'la#'],
  ii7: ['re', 'fa', 'la', 'do'],
  iii7: ['mi', 'sol', 'ti', 're'],
  iv7: ['fa', 'sol#', 'do', 're#'],
  v7: ['sol', 'la#', 're', 'fa'],
  vi7: ['la', 'do', 'mi', 'sol'],
  vii7: ['ti', 're', 'fa#', 'la'],
} as const

export type MFChordName = typeof MUSIC_FILE_CHORD_NAMES[number]

export interface MFChordJSON {
  readonly __type: 'chord'
  readonly name: string
  readonly octave: MFOctaveJSON
}

export class MFChord {
  constructor(
    public readonly name: MFChordName,
    public readonly octave: MFOctave,
  ) {}

  static is(other: unknown): other is MFChord {
    return other instanceof MFChord
  }

  static fromJSON(json: MFChordJSON): MFChord {
    if (json.__type !== 'chord') {
      throw new Error('invalid chord json type')
    }

    return new MFChord(
      ensureValidChordName(json.name),
      ensureValidOctave(json.octave),
    )
  }

  get notes(): readonly MFNote[] {
    const noteNames = MUSIC_FILE_CHORD_NAME_NOTE_NAMES_MAP[this.name]
    const notes: MFNote[] = []

    let octave = this.octave
    let prevIndex = -1

    for (const noteName of noteNames) {
      const index = MUSIC_FILE_NOTE_NAMES.indexOf(noteName)

      if (index < prevIndex) {
        octave = Math.min(octave + 1, MUSIC_FILE_MAX_OCTAVE) as MFOctave
      }

      prevIndex = index

      notes.push(new MFNote(noteName, octave))
    }

    return notes
  }

  get span(): number {
    const notes = this.notes

    const upperBoundOffset = notes[notes.length - 1].offset
    const lowerBoundOffset = notes[0].offset

    return upperBoundOffset - lowerBoundOffset + 1
  }

  equals(other: unknown): boolean {
    return (
      other instanceof MFChord &&
      other.name === this.name &&
      other.octave === this.octave
    )
  }

  copy({
    name,
    octave,
  }: {
    readonly name?: MFChordName
    readonly octave?: MFOctave
  } = {}): MFChord {
    return new MFChord(name ?? this.name, octave ?? this.octave)
  }

  toJSON(): MFChordJSON {
    return {
      __type: 'chord',
      name: this.name,
      octave: this.octave,
    }
  }
}

export const isValidChordName = (x: string): x is MFChordName => {
  return MUSIC_FILE_CHORD_NAMES.includes(x as MFChordName)
}

export const ensureValidChordName = (x: string): MFChordName => {
  if (!isValidChordName(x)) {
    throw new Error(`${x} is not a valid chord name`)
  }

  return x
}
