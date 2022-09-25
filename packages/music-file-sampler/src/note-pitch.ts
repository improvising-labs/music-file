import {
  MFChord,
  MFKey,
  MFNote,
  MFOctave,
  MUSIC_FILE_MIN_NOTE_OFFSET,
  MUSIC_FILE_OCTAVES,
} from 'music-file'

export type Tone =
  | 'C'
  | 'Db'
  | 'D'
  | 'Eb'
  | 'E'
  | 'F'
  | 'Gb'
  | 'G'
  | 'Ab'
  | 'A'
  | 'Bb'
  | 'B'

export type Pitch = `${Tone}${MFOctave}`

export const TONES: readonly Tone[] = [
  'C',
  'Db',
  'D',
  'Eb',
  'E',
  'F',
  'Gb',
  'G',
  'Ab',
  'A',
  'Bb',
  'B',
] as const

export const PITCHES = MUSIC_FILE_OCTAVES.reduce<readonly Pitch[]>(
  (pitches, octave) => [
    ...pitches,
    ...TONES.map(pitch => `${pitch}${octave}` as const),
  ],
  [],
)

export const PITCH_INDEX_MAP = PITCHES.reduce<Record<string, number>>(
  (prev, curr, index) => {
    prev[curr] = index
    return prev
  },
  {},
)

export const getPitchesBetween = (from: Pitch, to: Pitch) => {
  return PITCHES.slice(PITCH_INDEX_MAP[from], PITCH_INDEX_MAP[to])
}

export const getNotePitch = (note: MFNote, key: MFKey) => {
  return PITCHES[note.offset + key.offset - MUSIC_FILE_MIN_NOTE_OFFSET]
}

export const getChordPitches = (chord: MFChord, key: MFKey) => {
  return chord.notes.map(note => getNotePitch(note, key))
}
