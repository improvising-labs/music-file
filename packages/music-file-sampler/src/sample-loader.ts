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
    url: string,
  ): Promise<void> {
    const res = await fetch(url)
    const json: Record<string, string> = await res.json()

    await Promise.all(
      Object.entries(json).map(([sampleURI, url]) => {
        return this.loadSampleFromURL(instrumentURI, sampleURI, url)
      }),
    )
  }
}
