class VideoService {
  constructor(config = {}) {
    this.stream = null;
    this.recorder = null;
    this.chunks = [];
    this.config = {
      maxDuration: config.maxDuration || 300, // 5 minutes default
      resolution: config.resolution || { width: 1280, height: 720 },
      frameRate: config.frameRate || 30,
      bitrate: config.bitrate || 2500000,
      codec: config.codec || 'h264'
    };
    this.isRecording = false;
  }

  async startStream() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: this.config.resolution.width },
          height: { ideal: this.config.resolution.height },
          frameRate: { ideal: this.config.frameRate },
          facingMode: 'user'
        },
        audio: true
      });
      return this.stream;
    } catch (error) {
      console.error('Error starting video stream:', error);
      throw error;
    }
  }

  stopStream() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.isRecording) {
      this.stopRecording();
    }
  }

  async startRecording() {
    if (!this.stream) {
      throw new Error('No active stream to record');
    }

    try {
      const options = {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: this.config.bitrate
      };

      // Check if the browser supports the specified mime type
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm;codecs=vp8';
        
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options.mimeType = 'video/webm';
          
          if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options.mimeType = '';
          }
        }
      }

      this.chunks = [];
      this.recorder = new MediaRecorder(this.stream, options);
      
      this.recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };

      this.recorder.start(1000); // Collect data in 1-second chunks
      this.isRecording = true;
      
      // Set a timeout for maximum recording duration
      if (this.config.maxDuration > 0) {
        setTimeout(() => {
          if (this.isRecording) {
            this.stopRecording();
          }
        }, this.config.maxDuration * 1000);
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  async stopRecording() {
    if (!this.recorder || this.recorder.state === 'inactive') {
      return null;
    }

    return new Promise((resolve) => {
      this.recorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        this.chunks = [];
        this.isRecording = false;
        resolve({ blob, url });
      };
      
      this.recorder.stop();
    });
  }

  async captureFrame(videoElement) {
    if (!videoElement) {
      throw new Error('Video element is required to capture frame');
    }

    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        resolve({ blob, url });
      }, 'image/jpeg', 0.95);
    });
  }
}

export default VideoService;
