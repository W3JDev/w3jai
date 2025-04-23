class AudioProcessor {
  constructor() {
    this.sampleRate = 16000;
    this.encoder = new TextEncoder();
  }

  processAudioChunk(audioData) {
    const audioArray = new Float32Array(audioData);
    const scaledData = this.scaleAudioData(audioArray);
    const encoded = this.encoder.encode(scaledData);
    return Buffer.from(encoded).toString('base64');
  }

  scaleAudioData(audioData) {
    return Array.from(audioData).map(x => Math.max(-1, Math.min(1, x)) * 32767);
  }
}

export default AudioProcessor;