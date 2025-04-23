class VoiceService {
  constructor(openRouterKey, elevenLabsKey = null, selectedModel = 'anthropic/claude-2') {
    this.openRouterKey = openRouterKey;
    this.elevenLabsKey = elevenLabsKey;
    this.selectedModel = selectedModel;
    this.recognition = null;
    this.isListening = false;
    this.transcribedText = '';
    this.initSpeechRecognition();
  }

  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
    }
  }

  async processVoiceInput() {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      this.transcribedText = '';
      this.isListening = true;

      this.recognition.onresult = async (event) => {
        const result = event.results[event.results.length - 1];
        this.transcribedText = result[0].transcript;

        if (result.isFinal) {
          this.isListening = false;
          this.recognition.stop();

          try {
            const aiResponse = await this.sendToOpenRouter(this.transcribedText);
            let audioUrl = null;

            if (this.elevenLabsKey && aiResponse) {
              audioUrl = await this.textToSpeech(aiResponse);
            }

            resolve({
              text: this.transcribedText,
              response: aiResponse,
              audio: audioUrl
            });
          } catch (error) {
            reject(error);
          }
        }
      };

      this.recognition.onerror = (event) => {
        this.isListening = false;
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          this.recognition.start();
        }
      };

      this.recognition.start();
    });
  }

  async sendToOpenRouter(text, file = null, image = null) {
    try {
      let messages = [
        {
          role: "system",
          content: "You are Smith, a helpful AI assistant engaging in natural conversation. Keep responses concise and engaging."
        },
        { role: "user", content: text }
      ];

      // If file is provided, add its content to the message
      if (file) {
        const fileContent = await this.readFileContent(file);
        messages[1].content += `\n\nFile content:\n${fileContent}`;
      }

      // If image is provided, mention it in the message
      if (image) {
        messages[1].content += `\n\n[Image attached: The user has shared an image with you. Please respond accordingly.]`;
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'W3J Assistant'
        },
        body: JSON.stringify({
          model: this.selectedModel,
          messages,
          stream: true,
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      let result = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.choices?.[0]?.delta?.content) {
                result += data.choices[0].delta.content;
                // Call onProgress if provided
                if (this.onProgress) {
                  this.onProgress(result);
                }
              }
            } catch (e) {
              // Ignore JSON parse errors from incomplete chunks
            }
          }
        }
      }

      return result;
    } catch (error) {
      console.error('OpenRouter API error:', error);
      throw error;
    }
  }

  async readFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Error reading file'));

      if (file.type.startsWith('text/')) {
        reader.readAsText(file);
      } else if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        reject(new Error('Unsupported file type'));
      }
    });
  }

  async textToSpeech(text) {
    if (!this.elevenLabsKey) return null;

    try {
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL', {
        method: 'POST',
        headers: {
          'xi-api-key': this.elevenLabsKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error('ElevenLabs API error:', error);
      return null;
    }
  }

  stopRecognition() {
    if (this.recognition) {
      this.isListening = false;
      this.recognition.stop();
    }
  }

  setProgressCallback(callback) {
    this.onProgress = callback;
  }
}

export default VoiceService;
