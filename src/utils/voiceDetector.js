class VoiceDetector {
  constructor(audioContext) {
    this.audioContext = audioContext;
    this.analyzer = audioContext.createAnalyser();
    this.threshold = -45; // dB
    this.smoothing = 0.95;
  }

  connect(source) {
    source.connect(this.analyzer);
  }

  detectVoice() {
    const fftSize = 2048;
    this.analyzer.fftSize = fftSize;
    const bufferLength = this.analyzer.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);
    this.analyzer.getFloatFrequencyData(dataArray);
    
    const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
    return average > this.threshold;
  }

  setThreshold(value) {
    this.threshold = value;
  }

  setSmoothingTimeConstant(value) {
    this.analyzer.smoothingTimeConstant = value;
  }
}

export default VoiceDetector;