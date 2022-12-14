import {
  MFMusicFile,
  MFTrack,
  MFTrackArray,
  MFTrackItem,
  MFTrackItemArray,
} from 'music-file'

export type UpdateParams<S, T> = ((params: S) => T) | T

export type MFMusicFileUpdateParams = UpdateParams<
  MFMusicFile,
  Parameters<MFMusicFile['copy']>[0]
>

export type MFTrackUpdateParams = UpdateParams<
  MFTrack,
  Parameters<MFTrack['copy']>[0]
>

export type MFTrackItemUpdateParams = UpdateParams<
  MFTrackItem,
  Parameters<MFTrackItem['copy']>[0]
>

const resolveParams = <S, T>(value: S, params: UpdateParams<S, T>) => {
  return typeof params === 'function'
    ? (params as (params: S) => T)(value)
    : params
}

export interface ChangeActions {
  readonly musicFile: {
    readonly get: () => MFMusicFile
    readonly update: (params: MFMusicFileUpdateParams) => void
    readonly ensureMinValidNumBars: () => void
    readonly tracks: {
      readonly get: () => MFTrackArray
      readonly select: (target: number | MFTrack) => {
        readonly get: () => MFTrack
        readonly update: (params: MFTrackUpdateParams) => MFTrack
        readonly delete: () => void
        readonly items: {
          readonly get: () => MFTrackItemArray
          readonly select: (target: number | MFTrackItem) => {
            readonly get: () => MFTrackItem
            readonly update: (params: MFTrackItemUpdateParams) => MFTrackItem
            readonly delete: () => void
          }
          readonly insert: (trackItem: MFTrackItem) => number
        }
      }
      readonly insert: (track: MFTrack) => number
      readonly insertAt: (trackNum: number, track: MFTrack) => void
      readonly swap: (a: number, b: number) => void
    }
  }
}

export const makeChanges = (
  musicFile: MFMusicFile,
  cb: (actions: ChangeActions) => void,
): MFMusicFile => {
  let updatedMusicFile = musicFile

  cb({
    musicFile: {
      get: () => updatedMusicFile,
      update: params => {
        const resolvedParams = resolveParams(updatedMusicFile, params)

        updatedMusicFile = updatedMusicFile.copy(resolvedParams)
      },
      ensureMinValidNumBars: () => {
        if (updatedMusicFile.minValidNumBars > updatedMusicFile.numBars) {
          updatedMusicFile = updatedMusicFile.copy({
            numBars: updatedMusicFile.minValidNumBars,
          })
        }
      },
      tracks: {
        get: () => updatedMusicFile.tracks,
        select: target => {
          const trackNum =
            typeof target === 'number'
              ? target
              : updatedMusicFile.tracks
                  .toArray()
                  .findIndex(value => value === target)

          const track = updatedMusicFile.tracks.at(trackNum)

          return {
            get: () => track,
            update: params => {
              const resolvedParams = resolveParams(track, params)
              const updated = track.copy(resolvedParams)

              updatedMusicFile = updatedMusicFile.copy({
                tracks: updatedMusicFile.tracks.replaceAt(trackNum, updated),
              })

              return updated
            },
            delete: () => {
              updatedMusicFile = updatedMusicFile.copy({
                tracks: updatedMusicFile.tracks.deleteAt(trackNum),
              })
            },
            items: {
              get: () => track.items,
              select: target => {
                const pos =
                  typeof target === 'number'
                    ? target
                    : track.items.toArray().findIndex(value => value === target)

                const trackItem = track.items.at(pos)

                return {
                  get: () => trackItem,
                  update: params => {
                    const resolvedParams = resolveParams(trackItem, params)
                    const updated = trackItem.copy(resolvedParams)

                    updatedMusicFile = updatedMusicFile.copy({
                      tracks: updatedMusicFile.tracks.replaceAt(
                        trackNum,
                        track.copy({
                          items: updatedMusicFile.tracks
                            .at(trackNum)
                            .items.replace(trackItem, updated),
                        }),
                      ),
                    })

                    return updated
                  },
                  delete: () => {
                    updatedMusicFile = updatedMusicFile.copy({
                      tracks: updatedMusicFile.tracks.replaceAt(
                        trackNum,
                        track.copy({
                          items: updatedMusicFile.tracks
                            .at(trackNum)
                            .items.deleteAt(pos),
                        }),
                      ),
                    })
                  },
                }
              },
              insert: trackItem => {
                updatedMusicFile = updatedMusicFile.copy({
                  tracks: updatedMusicFile.tracks.replaceAt(
                    trackNum,
                    track.copy({
                      items: track.items.insert(trackItem),
                    }),
                  ),
                })

                return updatedMusicFile.tracks
                  .at(trackNum)
                  .items.toArray()
                  .indexOf(trackItem)
              },
            },
          }
        },
        insert: track => {
          updatedMusicFile = updatedMusicFile.copy({
            tracks: updatedMusicFile.tracks.insert(track),
          })

          return updatedMusicFile.tracks.toArray().indexOf(track)
        },
        insertAt: (trackNum, track) => {
          updatedMusicFile = updatedMusicFile.copy({
            tracks: updatedMusicFile.tracks.insertAt(trackNum, track),
          })
        },
        swap: (a, b) => {
          updatedMusicFile = updatedMusicFile.copy({
            tracks: updatedMusicFile.tracks.swap(a, b),
          })
        },
      },
    },
  })

  return updatedMusicFile
}
