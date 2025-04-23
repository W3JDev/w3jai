import { useState, useEffect, useRef } from 'react';
import { Camera, Video, StopCircle, Download, X } from 'lucide-react';
import VideoService from '../utils/videoService';

const VideoChat = ({ onClose, onError, onCapture }) => {
  const videoRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [videoService] = useState(() => new VideoService());

  useEffect(() => {
    // Start the video stream when the component mounts
    startStream();

    // Clean up when the component unmounts
    return () => {
      stopStream();
    };
  }, []);

  const startStream = async () => {
    try {
      const stream = await videoService.startStream();
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Failed to start video stream:', err);
      onError && onError(err.message || 'Failed to access camera');
    }
  };

  const stopStream = () => {
    if (videoService) {
      videoService.stopStream();
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsStreaming(false);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      try {
        const result = await videoService.stopRecording();
        if (result) {
          setRecordedVideo(result.url);
        }
        setIsRecording(false);
      } catch (err) {
        onError && onError(err.message || 'Failed to stop recording');
      }
    } else {
      try {
        setRecordedVideo(null);
        await videoService.startRecording();
        setIsRecording(true);
      } catch (err) {
        onError && onError(err.message || 'Failed to start recording');
      }
    }
  };

  const captureFrame = async () => {
    try {
      if (!videoRef.current) return;
      
      const result = await videoService.captureFrame(videoRef.current);
      if (result && onCapture) {
        onCapture(result);
      }
    } catch (err) {
      onError && onError(err.message || 'Failed to capture frame');
    }
  };

  const downloadVideo = () => {
    if (!recordedVideo) return;
    
    const a = document.createElement('a');
    a.href = recordedVideo;
    a.download = `video-${new Date().toISOString()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative bg-gray-800 rounded-2xl overflow-hidden max-w-2xl w-full shadow-2xl">
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <h2 className="text-xl font-bold text-white mb-4">Video Chat</h2>
          
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
            {recordedVideo ? (
              <video
                src={recordedVideo}
                className="w-full h-full object-cover"
                controls
                autoPlay
              />
            ) : (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
            )}
          </div>
          
          <div className="flex justify-center space-x-4 mt-4">
            {recordedVideo ? (
              <>
                <button
                  onClick={() => setRecordedVideo(null)}
                  className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-500 transition-colors"
                >
                  New Recording
                </button>
                <button
                  onClick={downloadVideo}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors flex items-center gap-2"
                >
                  <Download size={16} />
                  Download
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={toggleRecording}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    isRecording
                      ? 'bg-red-600 hover:bg-red-500'
                      : 'bg-blue-600 hover:bg-blue-500'
                  } text-white transition-colors`}
                  disabled={!isStreaming}
                >
                  {isRecording ? (
                    <>
                      <StopCircle size={16} />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Video size={16} />
                      Record Video
                    </>
                  )}
                </button>
                <button
                  onClick={captureFrame}
                  className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-500 transition-colors flex items-center gap-2"
                  disabled={!isStreaming}
                >
                  <Camera size={16} />
                  Take Photo
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoChat;
