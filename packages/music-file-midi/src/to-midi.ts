import { writeMidi } from 'midi-file'
import { MFMusicFile } from 'music-file'

export const convertMusicFileToMIDI = (musicFile: MFMusicFile) => {
  return writeMidi({
    header: {
      format: 0,
      numTracks: musicFile.tracks.length,
    },
    tracks: musicFile.tracks.toArray().map(track => {
      console.log(track)
      return []
    }),
  })
}
