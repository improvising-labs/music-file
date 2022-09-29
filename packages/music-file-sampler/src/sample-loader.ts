import { getPitchesBetween, Pitch } from './note-pitch'
import { MFSample } from './sample'
import { MFSampleManager } from './sample-manager'

export class MFSampleLoader {
  constructor(
    private readonly ctx: AudioContext,
    private readonly manager: MFSampleManager,
  ) {}

  async loadSampleFromURL(
    instrumentURI: string,
    sampleURI: string,
    url: string,
  ): Promise<void> {
    const res = await fetch(url)
    const arrayBuffer = await res.arrayBuffer()
    const sampleBuffer = await this.ctx.decodeAudioData(arrayBuffer)
    const sample = new MFSample(sampleBuffer)

    this.manager.addSample(instrumentURI, sampleURI, sample)
  }

  async loadInstrumentFromURL(
    instrumentURI: string,
    baseUrl: string,
    {
      pitchRange = ['A1', 'Gb7'],
      sampleFilenameResolver = pitch => `${pitch}.mp3`,
      sampleURIResolver = pitch => `sample:${pitch}`,
    }: {
      readonly pitchRange?: readonly [Pitch, Pitch]
      readonly sampleFilenameResolver?: (pitch: Pitch) => string
      readonly sampleURIResolver?: (pitch: Pitch) => string
    } = {},
  ): Promise<void> {
    await Promise.all(
      getPitchesBetween(pitchRange[0], pitchRange[1]).map(pitch => {
        const sampleURI = sampleURIResolver(pitch)
        const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
        const url = new URL(sampleFilenameResolver(pitch), base)

        return this.loadSampleFromURL(instrumentURI, sampleURI, url.href)
      }),
    )
  }
}
