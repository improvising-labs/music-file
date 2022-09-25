export const MUSIC_FILE_UNIT_NOTE_TYPES = [128, 64, 32, 16] as const

export type MFUnitNoteType = typeof MUSIC_FILE_UNIT_NOTE_TYPES[number]
export type MFUnitNoteTypeJSON = number

export const isValidUnitNoteType = (x: number): x is MFUnitNoteType => {
  return MUSIC_FILE_UNIT_NOTE_TYPES.includes(x as MFUnitNoteType)
}

export const ensureValidUnitNoteType = (x: number): MFUnitNoteType => {
  if (!isValidUnitNoteType(x)) {
    throw new Error(`${x} is not a valid unitNoteType`)
  }

  return x
}
