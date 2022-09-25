export const MUSIC_FILE_OCTAVES = [1, 2, 3, 4, 5, 6, 7] as const

export const MUSIC_FILE_MIN_OCTAVE = 1
export const MUSIC_FILE_MAX_OCTAVE = 7

export type MFOctave = typeof MUSIC_FILE_OCTAVES[number]
export type MFOctaveJSON = number

export const isValidNoteOctave = (x: number): x is MFOctave => {
  return x >= MUSIC_FILE_MIN_OCTAVE && x <= MUSIC_FILE_MAX_OCTAVE
}

export const ensureValidOctave = (x: number): MFOctave => {
  if (!isValidNoteOctave(x)) {
    throw new Error(`${x} is not a valid ocatve`)
  }

  return x
}
