# MusicFile

MusicFile is an open-source JSON-based format to store the representation of a music piece.

Today, MIDI is still the most common format to store a music that performed by instruments, although it was designed to be a data exchange protocol between devices and softwares. However, it's obviously that MIDI is too complex and difficult for most software developers. Even though there are a lot of MIDI libraries that can manipulate MIDI files, it still costs lots of time to learn the concepts and specifications of MIDI format.

The purpose of MusicFile is to replace MIDI for most scenarios in developing music softwares, plugins, and even games. To make the thing straight-forward, MusicFile uses solfege-based music system, which doesn't require developers to have any previous knowledge in music theory. Also, we're continously building around the ecosystem of MusicFile, including samplers, convertors, bundlers, renderers and even more cool stuffs.

## Natively immutable

`music-file` library is fully immutable. It requires you to write reducers to create a modified MusicFile for any operations. Although the immutability increases the difficulty in developing based on the library, it protects you from mistakenly mutating the original MusicFile. The immutability will also help you manage states and renders when using libraries like `react`.

## What is an URI in MusicFile

`MFInstrument` and `MFRef` have a field called `resourceURI`. It will be used to locate the resource they will use. For example, in `music-file-sampler` library, the resourceURIs will be used to locate the samples of an instrument.
