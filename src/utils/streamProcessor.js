class StreamProcessor {
  constructor() {
    this.decoder = new TextDecoder();
    this.encoder = new TextEncoder();
    this.buffer = '';
    this.chunkSize = 4096; // Optimal chunk size for streaming
    this.processingQueue = [];
  }

  async *processStreamGenerator(response) {
    const reader = response.body.getReader();
    let partialChunk = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = this.decoder.decode(value, { stream: true });
      const messages = this.parseChunks(partialChunk + chunk);
      partialChunk = messages.partial;

      for (const message of messages.complete) {
        if (message.text) {
          yield message.text;
        }
      }
    }
  }

  parseChunks(data) {
    const lines = data.split('\n');
    const complete = [];
    let partial = '';

    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i];
      if (line.startsWith('data: ')) {
        try {
          const parsed = JSON.parse(line.slice(6));
          if (parsed.candidates?.[0]?.content?.parts?.[0]?.text) {
            complete.push({
              text: parsed.candidates[0].content.parts[0].text
            });
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }

    partial = lines[lines.length - 1];
    return { complete, partial };
  }

  optimizeChunkSize(data) {
    const encoded = this.encoder.encode(data);
    return encoded.length > this.chunkSize ? 
      this.decoder.decode(encoded.slice(0, this.chunkSize)) : 
      data;
  }
}

export default StreamProcessor;