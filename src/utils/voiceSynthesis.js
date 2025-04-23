class VoiceSynthesizer {
  constructor() {
    this.voices = [];
    this.selectedVoice = null;
    this.synth = window.speechSynthesis;
    this.loadVoices();
  }

  loadVoices() {
    this.voices = this.synth.getVoices();
    if (this.voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.voices = this.synth.getVoices();
      };
    }
  }

  setVoice(voiceName) {
    this.selectedVoice = this.voices.find(voice => voice.name === voiceName);
  }

  async speak(text, onEnd = () => {}) {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => {
        onEnd();
        resolve();
      };
      this.synth.speak(utterance);
    });
  }

  stop() {
    this.synth.cancel();
  }
}

export default VoiceSynthesizer;