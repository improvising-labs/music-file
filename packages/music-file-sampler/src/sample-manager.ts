import { MFSample } from './sample'

export interface MFSampleCollection {
  [instrumentURI: string]: {
    [sampleURI: string]: MFSample
  }
}

export class MFSampleManager {
  private readonly collection: MFSampleCollection = {}

  addInstrument(
    instrumentURI: string,
    sampleMap: Record<string, MFSample>,
  ): void {
    this.collection[instrumentURI] = sampleMap
  }

  addSample(instrumentURI: string, sampleURI: string, sample: MFSample): void {
    this.collection[instrumentURI] ??= {}
    this.collection[instrumentURI][sampleURI] = sample
  }

  deleteInstrument(instrumentURI: string): void {
    if (instrumentURI in this.collection) {
      delete this.collection[instrumentURI]
    }
  }

  deleteSample(instrumentURI: string, sampleURI: string): void {
    if (instrumentURI in this.collection) {
      delete this.collection[instrumentURI][sampleURI]
    }
  }

  hasInstrumentURI(instrumentURI: string): boolean {
    return instrumentURI in this.collection
  }

  hasSampleURI(instrumentURI: string, sampleURI: string): boolean {
    return (
      instrumentURI in this.collection &&
      sampleURI in this.collection[instrumentURI]
    )
  }

  getInstrumentURIs(): string[] {
    return Object.keys(this.collection)
  }

  getSampleURIs(instrumentURI: string): string[] {
    if (!this.hasInstrumentURI(instrumentURI)) {
      return []
    }

    return Object.keys(this.collection[instrumentURI])
  }

  resolveSample(instrumentURI: string, sampleURI: string): MFSample {
    if (!this.hasSampleURI(instrumentURI, sampleURI)) {
      throw new Error('sample is not found')
    }

    return this.collection[instrumentURI][sampleURI]
  }
}
