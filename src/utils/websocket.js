import { GoogleGenerativeAI } from "@google/generative-ai";

class WebSocketManager {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-pro",
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 2048,
      }
    });
    this.audioContext = null;
    this.mediaStream = null;
    this.chat = null;
    this.connect(); // Initialize chat session on construction
  }

  async connect() {
    try {
      if (!this.chat) {
        this.chat = await this.model.startChat({
          history: [],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 2048,
          }
        });
      }
      return true;
    } catch (error) {
      console.error('Connection error:', error);
      throw error;
    }
  }

  async sendMessage(text) {
    try {
      if (!this.chat) {
        await this.connect();
      }
      const result = await this.chat.sendMessage(text);
      const response = await result.response;
      const responseText = await response.text();
      return responseText;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }

  async startAudioStream() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Audio input not supported');
    }

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000,
      });
      
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      const processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      processor.onaudioprocess = async (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        await this.processAudioChunk(inputData);
      };

      source.connect(processor);
      processor.connect(this.audioContext.destination);
      
      return this.mediaStream;
    } catch (error) {
      console.error('Audio stream error:', error);
      throw error;
    }
  }

  async processAudioChunk(audioData) {
    try {
      if (!this.chat) {
        await this.connect();
      }

      const audioArray = new Float32Array(audioData);
      const base64Audio = this.encodeAudioToBase64(audioArray);
      
      const result = await this.chat.sendMessage("Processing audio input...");
      const response = await result.response;
      const responseText = await response.text();
      
      if (responseText) {
        this.onMessage({
          role: 'assistant',
          content: responseText
        });
      }
    } catch (error) {
      console.error('Process audio error:', error);
    }
  }

  encodeAudioToBase64(audioData) {
    // Convert Float32Array to Int16Array (16-bit PCM)
    const pcm16 = new Int16Array(audioData.length);
    for (let i = 0; i < audioData.length; i++) {
      pcm16[i] = Math.max(-1, Math.min(1, audioData[i])) * 32767;
    }
    
    // Create WAV header
    const buffer = new ArrayBuffer(44 + pcm16.length * 2);
    const view = new DataView(buffer);
    
    // Write WAV header
    const writeString = (view, offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + pcm16.length * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, 16000, true);
    view.setUint32(28, 16000 * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, pcm16.length * 2, true);
    
    // Write PCM data
    for (let i = 0; i < pcm16.length; i++) {
      view.setInt16(44 + i * 2, pcm16[i], true);
    }
    
    // Convert to base64
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  cleanup() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
  }

  setMessageHandler(callback) {
    this.onMessage = callback;
  }
}

export default WebSocketManager;
