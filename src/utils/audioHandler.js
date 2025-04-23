class AudioHandler {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.gainNode = this.audioContext.createGain();
    this.processor = null;
    this.stream = null;
  }

  async initializeStream() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      const source = this.audioContext.createMediaStreamSource(this.stream);
      source.connect(this.analyser);
      this.analyser.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);
      
      return true;
    } catch (error) {
      console.error('Failed to initialize audio stream:', error);
      return false;
    }
  }

  startProcessing(onAudioData) {
    this.processor = this.audioContext.createScriptProcessor(1024, 1, 1);
    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      onAudioData(inputData);
    };
    
    this.analyser.connect(this.processor);
    this.processor.connect(this.audioContext.destination);
  }

  stopProcessing() {
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  setVolume(value) {
    this.gainNode.gain.value = value;
  }
}

export default AudioHandler;