export interface MFSampleADSR {
  readonly attackAmp: number
  readonly attackTime: number
  readonly decayAmp: number
  readonly decayTime: number
  readonly sustainAmp: number
  readonly sustainTime: number
  readonly releaseAmp: number
  readonly releaseTime: number
}

export class MFSample {
  public readonly adsr: MFSampleADSR

  constructor(public readonly audioBuffer: AudioBuffer) {
    const { duration } = audioBuffer

    this.adsr = {
      attackAmp: 1,
      attackTime: 0,
      decayAmp: 0.7,
      decayTime: duration * 0.4,
      sustainAmp: 0.8,
      sustainTime: duration * 0.7,
      releaseAmp: 0,
      releaseTime: duration * 0.2,
    }
  }
}
