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
  constructor(
    public readonly audioBuffer: AudioBuffer,
    public readonly adsr: MFSampleADSR = {
      attackAmp: 1,
      attackTime: 0,
      decayAmp: 0.7,
      decayTime: 0.5,
      sustainAmp: 0.8,
      sustainTime: 0.7,
      releaseAmp: 0,
      releaseTime: 0.3,
    },
  ) {}
}
