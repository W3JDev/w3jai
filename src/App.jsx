import { useState, useEffect, useRef } from 'react';
import { Settings as SettingsIcon, Mic, StopCircle, Volume2, VolumeX, FileUp, X, Video, Camera } from 'lucide-react';
import ChatService from './services/ChatService';
import { VideoChat, StructuredOutputRenderer, Settings } from './components/LazyComponents';
import menuIntegration from './utils/menuIntegration';
import ErrorBoundary from './components/ErrorBoundary';
import { withRetry } from './utils/errorHandling';
import config from './config/config';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [elevenLabsKey, setElevenLabsKey] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('openrouter');
  const [selectedModel, setSelectedModel] = useState('anthropic/claude-2');
  const [availableModels, setAvailableModels] = useState([]);
  const [availableProviders, setAvailableProviders] = useState([]);
  const [systemPrompt, setSystemPrompt] = useState("You are Smith, a helpful AI assistant engaging in natural conversation. Keep responses concise and engaging.");
  const [braveApiKey, setBraveApiKey] = useState('');
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [mcpServerUrl, setMcpServerUrl] = useState('http://localhost:3000');
  const [useMcpServer, setUseMcpServer] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const [currentFile, setCurrentFile] = useState(null);
  const [showVideo, setShowVideo] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showUtilityMenu, setShowUtilityMenu] = useState(false);
  const [isSendHovered, setIsSendHovered] = useState(false);

  const chatServiceRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const sendButtonRef = useRef(null);
  const utilityMenuRef = useRef(null);

  useEffect(() => {
    // Initialize chat service
    chatServiceRef.current = new ChatService();

    // Get available providers
    setAvailableProviders(chatServiceRef.current.getSupportedProviders());

    // Load saved settings
    const savedApiKey = localStorage.getItem('apiKey');
    const savedElevenLabsKey = localStorage.getItem('elevenLabsKey');
    const savedProvider = localStorage.getItem('selectedProvider');
    const savedModel = localStorage.getItem('selectedModel');
    const savedSystemPrompt = localStorage.getItem('systemPrompt');
    const savedBraveApiKey = localStorage.getItem('braveApiKey');
    const savedWebSearchEnabled = localStorage.getItem('webSearchEnabled');
    const savedMcpServerUrl = localStorage.getItem('mcpServerUrl');
    const savedUseMcpServer = localStorage.getItem('useMcpServer');

    if (savedApiKey) {
      setApiKey(savedApiKey);
      setShowSettings(false);
    }
    if (savedElevenLabsKey) setElevenLabsKey(savedElevenLabsKey);
    if (savedProvider) setSelectedProvider(savedProvider);
    if (savedModel) setSelectedModel(savedModel);
    if (savedSystemPrompt) setSystemPrompt(savedSystemPrompt);
    if (savedBraveApiKey) setBraveApiKey(savedBraveApiKey);
    if (savedWebSearchEnabled) setWebSearchEnabled(savedWebSearchEnabled === 'true');
    if (savedMcpServerUrl) setMcpServerUrl(savedMcpServerUrl);
    if (savedUseMcpServer) setUseMcpServer(savedUseMcpServer === 'true');

    // Initialize chat service if keys exist
    if (savedApiKey) {
      initializeChatService(savedProvider, savedApiKey, savedElevenLabsKey, savedModel);
    }

    // Initialize speech recognition
    initializeSpeechRecognition();
  }, []);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      chatContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Track cursor position for interactive send button eyes
  useEffect(() => {
    const handleMouseMove = (e) => {
      const eyes = document.querySelectorAll('.send-button-eye');

      eyes.forEach(eye => {
        if (eye) {
          const rect = eye.getBoundingClientRect();
          const eyeCenterX = rect.left + rect.width / 2;
          const eyeCenterY = rect.top + rect.height / 2;

          // Calculate distance from cursor to eye center
          const distX = e.clientX - eyeCenterX;
          const distY = e.clientY - eyeCenterY;

          // Limit the movement range (in pixels)
          const maxMove = 3;
          const moveX = Math.max(-maxMove, Math.min(maxMove, distX / 10));
          const moveY = Math.max(-maxMove, Math.min(maxMove, distY / 10));

          // Move the pupil (using the ::before pseudo-element)
          eye.style.setProperty('--pupil-x', `${moveX}px`);
          eye.style.setProperty('--pupil-y', `${moveY}px`);
        }
      });
    };

    // Handle touch move for mobile devices
    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        const touch = e.touches[0];
        const eyes = document.querySelectorAll('.send-button-eye');

        eyes.forEach(eye => {
          if (eye) {
            const rect = eye.getBoundingClientRect();
            const eyeCenterX = rect.left + rect.width / 2;
            const eyeCenterY = rect.top + rect.height / 2;

            // Calculate distance from touch to eye center
            const distX = touch.clientX - eyeCenterX;
            const distY = touch.clientY - eyeCenterY;

            // Limit the movement range (in pixels)
            const maxMove = 3;
            const moveX = Math.max(-maxMove, Math.min(maxMove, distX / 10));
            const moveY = Math.max(-maxMove, Math.min(maxMove, distY / 10));

            // Move the pupil (using the ::before pseudo-element)
            eye.style.setProperty('--pupil-x', `${moveX}px`);
            eye.style.setProperty('--pupil-y', `${moveY}px`);
          }
        });

        setIsSendHovered(true); // Show hover state on touch
      }
    };

    // Handle touch end
    const handleTouchEnd = () => {
      // Reset hover state with a small delay to make animation smoother
      setTimeout(() => {
        setIsSendHovered(false);

        // Reset eye positions
        const eyes = document.querySelectorAll('.send-button-eye');
        eyes.forEach(eye => {
          eye.style.setProperty('--pupil-x', '0px');
          eye.style.setProperty('--pupil-y', '0px');
        });
      }, 150);
    };

    // Handle click outside utility menu
    const handleClickOutside = (e) => {
      // Check if the click is outside the utility menu and not on the utility menu button
      if (utilityMenuRef.current && !utilityMenuRef.current.contains(e.target) &&
          !e.target.closest('button[title="Utilities"]')) {
        setShowUtilityMenu(false);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [messages]); // Re-run when messages change to ensure eyes are updated after new messages

  const handleProgress = (partialResponse) => {
    setMessages(prev => {
      const newMessages = [...prev];
      const lastMessage = newMessages[newMessages.length - 1];
      if (lastMessage && lastMessage.role === 'assistant') {
        lastMessage.content = partialResponse;
      } else {
        newMessages.push({
          role: 'assistant',
          content: partialResponse
        });
      }
      return newMessages;
    });
  };

  const initializeChatService = async (provider, key, elevenLabsKey, model) => {
    try {
      if (!chatServiceRef.current) {
        chatServiceRef.current = new ChatService();
      }

      await chatServiceRef.current.initialize({
        provider: provider,
        apiKey: key,
        elevenLabsKey: elevenLabsKey,
        model: model,
        systemPrompt: systemPrompt,
        braveApiKey: braveApiKey,
        serverUrl: useMcpServer ? mcpServerUrl : null
      });

      chatServiceRef.current.setProgressCallback(handleProgress);
      chatServiceRef.current.setWebSearchEnabled(webSearchEnabled);

      // Get available models for the selected provider
      const models = await chatServiceRef.current.getAvailableModels();
      setAvailableModels(models);
    } catch (err) {
      console.error('Failed to initialize chat service:', err);
      setError(err.message || 'Failed to initialize chat service');
    }
  };

  const initializeSpeechRecognition = () => {
    // Use the browser's built-in SpeechRecognition API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      console.log('Speech recognition initialized successfully');
    } else {
      console.warn('Speech Recognition API not supported in this browser');
    }
  };

  const startStreaming = async () => {
    if (!apiKey) {
      setError(`Please enter ${selectedProvider} API key for voice chat`);
      return;
    }

    if (!recognitionRef.current) {
      setError('Speech recognition is not supported in your browser');
      return;
    }

    try {
      setIsListening(true);
      setIsStreaming(true);

      let transcribedText = '';

      // Set up recognition handlers
      recognitionRef.current.onresult = async (event) => {
        const result = event.results[event.results.length - 1];
        transcribedText = result[0].transcript;

        if (result.isFinal) {
          recognitionRef.current.stop();
          setIsListening(false);

          // Add user's transcribed message
          setMessages(prev => [...prev, {
            role: 'user',
            content: transcribedText
          }]);

          // Get AI response
          const response = await chatServiceRef.current.processVoiceInput(transcribedText);

          // Add AI's response with audio if available
          if (response.response) {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: response.response,
              audio: response.audio
            }]);

            // Play audio response if available
            if (response.audio) {
              const audio = new Audio(response.audio);
              await audio.play();
            }
          }

          setIsStreaming(false);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
        setIsStreaming(false);
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current.start();
        }
      };

      recognitionRef.current.start();

    } catch (err) {
      console.error('Voice chat error:', err);
      setError(err.message);
    } finally {
      setIsStreaming(false);
      setIsListening(false);
    }
  };

  const stopStreaming = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsStreaming(false);
    setIsListening(false);
  };

  const saveSettings = async () => {
    try {
      setError('');
      if (apiKey) {
        localStorage.setItem('apiKey', apiKey);
        localStorage.setItem('selectedProvider', selectedProvider);
        localStorage.setItem('selectedModel', selectedModel);
        localStorage.setItem('systemPrompt', systemPrompt);
        localStorage.setItem('braveApiKey', braveApiKey);
        localStorage.setItem('webSearchEnabled', webSearchEnabled.toString());
        localStorage.setItem('mcpServerUrl', mcpServerUrl);
        localStorage.setItem('useMcpServer', useMcpServer.toString());

        // Initialize chat service with new settings
        await initializeChatService(selectedProvider, apiKey, elevenLabsKey, selectedModel);
      }
      if (elevenLabsKey) {
        localStorage.setItem('elevenLabsKey', elevenLabsKey);
      }
      setShowSettings(false);
    } catch (err) {
      console.error('Settings error:', err);
      setError(err.message || 'Failed to save settings');
    }
  };

  const handleProviderChange = async (provider) => {
    setSelectedProvider(provider);

    // Reset model selection when provider changes
    if (chatServiceRef.current) {
      try {
        // Create a temporary service to get models
        const tempService = new ChatService();
        await tempService.initialize({ provider, apiKey });
        const models = await tempService.getAvailableModels();
        setAvailableModels(models);

        // Set default model for the provider
        if (models.length > 0) {
          setSelectedModel(models[0].id);
        }
      } catch (err) {
        console.error('Failed to get models for provider:', err);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !currentFile && !capturedImage) return;
    if (!apiKey) {
      setError(`Please enter ${selectedProvider} API key for chat`);
      return;
    }

    const userMessage = {
      role: 'user',
      content: inputMessage,
      file: currentFile,
      image: capturedImage
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setCurrentFile(null);
    setCapturedImage(null);
    setIsLoading(true);
    setError('');

    try {
      // Check if this is a menu-related query
      const menuResponse = menuIntegration.processMenuMessage(inputMessage);

      if (menuResponse) {
        // If we got a response from the menu integration, use it
        // Send just the JSON without any wrapper text to ensure clean rendering
        const aiMessage = {
          role: 'assistant',
          content: JSON.stringify(menuResponse),
          timestamp: new Date().toISOString(),
          isMenuResponse: true
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Otherwise, send the message to the AI service
        if (!chatServiceRef.current || !chatServiceRef.current.aiService) {
          await initializeChatService(selectedProvider, apiKey, elevenLabsKey, selectedModel);
        }

        const options = {
          file: currentFile,
          image: capturedImage
        };

        const response = await chatServiceRef.current.sendMessage(inputMessage, options);

        if (response.text) {
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
              lastMessage.content = response.text;
              if (response.audio) {
                lastMessage.audio = response.audio;
              }
            } else {
              newMessages.push({
                role: 'assistant',
                content: response.text,
                audio: response.audio
              });
            }
            return newMessages;
          });

          // Play audio if available
          if (response.audio) {
            const audio = new Audio(response.audio);
            await audio.play();
          }
        }
      }
    } catch (err) {
      console.error('Send message error:', err);
      setError(err.message || 'Failed to send message');
      // Remove the user's message if there was an error
      setMessages(prev => prev.slice(0, -1));
      setInputMessage(userMessage.content); // Restore the input
      setCurrentFile(userMessage.file); // Restore the file
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('text/') || file.type.startsWith('image/')) {
        setCurrentFile(file);
        setInputMessage(prev =>
          `${prev}${prev ? '\n' : ''}[Attached file: ${file.name}]`
        );
      } else {
        setError('Only text and image files are supported');
      }
    }
  };

  return (
    <div className="w-full h-full min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-rendering-optimized flex flex-col">
      <div className="absolute w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-pink-500/10 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      <div className="w-full max-w-full lg:max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex-1 flex flex-col">
      <div className="flex justify-between items-center mb-4 bg-gray-800/50 p-4 rounded-2xl backdrop-blur-sm border border-gray-700/50 shadow-lg animate-slideIn">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">W</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text font-bold gradient-text animate-gradientShift">W3J</span>
            <span className="text-gray-300">Assistant</span>
            <span className="text-xs text-gray-400 bg-gray-700/70 px-2 py-1 rounded-full">(Smith)</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowVideo(true)}
              className="p-2 rounded-full bg-gray-700/70 hover:bg-gray-600 text-white transition-all duration-200 transform hover:scale-105 hover-lift border border-gray-600/30 backdrop-blur-sm"
              title="Video Chat"
              aria-label="Open video chat"
            >
              <Video size={20} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-full bg-gray-700/70 hover:bg-gray-600 text-white transition-all duration-200 transform hover:scale-105 hover-lift border border-gray-600/30 backdrop-blur-sm"
              title="Settings"
              aria-label="Toggle settings"
            >
              <SettingsIcon size={20} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {showSettings && (
        <ErrorBoundary>
          <Settings
            apiKey={apiKey}
            setApiKey={setApiKey}
            elevenLabsKey={elevenLabsKey}
            setElevenLabsKey={setElevenLabsKey}
            selectedProvider={selectedProvider}
            setSelectedProvider={setSelectedProvider}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            systemPrompt={systemPrompt}
            setSystemPrompt={setSystemPrompt}
            braveApiKey={braveApiKey}
            setBraveApiKey={setBraveApiKey}
            webSearchEnabled={webSearchEnabled}
            setWebSearchEnabled={setWebSearchEnabled}
            mcpServerUrl={mcpServerUrl}
            setMcpServerUrl={setMcpServerUrl}
            useMcpServer={useMcpServer}
            setUseMcpServer={setUseMcpServer}
            availableModels={availableModels}
            setAvailableModels={setAvailableModels}
            onSave={saveSettings}
            onProviderChange={handleProviderChange}
          />
        </ErrorBoundary>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 text-red-100 rounded-2xl animate-slideIn shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-200 mb-1">Error</h3>
              <p className="text-red-100">{error}</p>
            </div>
          </div>
        </div>
      )}

      {showVideo && (
        <VideoChat
          onClose={() => setShowVideo(false)}
          onError={(errorMsg) => setError(errorMsg)}
          onCapture={(result) => {
            setCapturedImage(result.url);
            setShowVideo(false);
            setInputMessage(prev => `${prev}${prev ? '\n' : ''}[Captured image]`);
          }}
        />
      )}

      <div
        ref={chatContainerRef}
        className="flex-1 min-h-[60vh] bg-gray-800/70 rounded-2xl mb-4 overflow-y-auto backdrop-blur-sm border border-gray-700/50 custom-scrollbar shadow-xl relative"
      >
        {messages.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 animate-fadeIn">
            <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl animate-pulse relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50 blur-md animate-blob"></div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-3 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text animate-gradientShift">Welcome to W3J Assistant</h2>
            <p className="text-gray-300 max-w-md mb-8 text-lg">Ask me anything about your menu, get recommendations, or help with any other questions you might have.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
              <button onClick={() => {setInputMessage("What's on the menu today?"); handleSendMessage();}} className="p-4 rounded-xl bg-gray-700/80 hover:bg-gray-600 text-white text-left pl-5 border border-gray-600/50 hover:border-blue-500/50 transition-all duration-200 shadow-md hover:shadow-xl transform hover:scale-[1.02] backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <span>What's on the menu today?</span>
                </div>
              </button>
              <button onClick={() => {setInputMessage("Can you recommend something vegetarian?"); handleSendMessage();}} className="p-4 rounded-xl bg-gray-700/80 hover:bg-gray-600 text-white text-left pl-5 border border-gray-600/50 hover:border-green-500/50 transition-all duration-200 shadow-md hover:shadow-xl transform hover:scale-[1.02] backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <span>Recommend something vegetarian</span>
                </div>
              </button>
              <button onClick={() => {setInputMessage("Tell me about your specials"); handleSendMessage();}} className="p-4 rounded-xl bg-gray-700/80 hover:bg-gray-600 text-white text-left pl-5 border border-gray-600/50 hover:border-purple-500/50 transition-all duration-200 shadow-md hover:shadow-xl transform hover:scale-[1.02] backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <span>Tell me about your specials</span>
                </div>
              </button>
              <button onClick={() => {setInputMessage("What are your opening hours?"); handleSendMessage();}} className="p-4 rounded-xl bg-gray-700/80 hover:bg-gray-600 text-white text-left pl-5 border border-gray-600/50 hover:border-pink-500/50 transition-all duration-200 shadow-md hover:shadow-xl transform hover:scale-[1.02] backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span>What are your opening hours?</span>
                </div>
              </button>
            </div>
          </div>
        )}
        <div className="p-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] p-3 sm:p-4 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 message-user border border-blue-400/30'
                    : 'bg-gray-700/90 message-assistant border border-gray-600/30'
                } ${msg.isMenuResponse ? 'menu-response w-full sm:w-auto' : ''} text-white shadow-lg hover-lift transition-all duration-200 backdrop-blur-sm`}
              >
                <div className="font-medium mb-1 text-sm opacity-75">
                  {msg.role === 'user' ? 'You' : 'Smith'}
                </div>
                <StructuredOutputRenderer
                  content={msg.content}
                  onAction={(action, payload) => {
                    console.log('Action triggered:', action, payload);
                    // Handle different actions
                    if (action === 'send_message' && payload.message) {
                      setInputMessage(payload.message);
                      handleSendMessage();
                    } else if (action === 'open_link' && payload.url) {
                      window.open(payload.url, '_blank');
                    } else if (action === 'update_message' && payload.content) {
                      // Update the current message with new content
                      setMessages(prev => {
                        const newMessages = [...prev];
                        const lastMessage = newMessages[newMessages.length - 1];
                        if (lastMessage && lastMessage.role === 'assistant') {
                          lastMessage.content = payload.content;
                        }
                        return newMessages;
                      });
                    }
                  }}
                />
                {msg.file && (
                  <div className="mt-2 p-2 bg-gray-800/50 rounded-lg text-sm">
                    📎 {msg.file.name}
                  </div>
                )}
                {msg.audio && (
                  <audio
                    controls
                    src={msg.audio}
                    className="mt-2 w-full rounded-lg"
                    onEnded={() => URL.revokeObjectURL(msg.audio)}
                  />
                )}
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="Captured image"
                    className="mt-2 w-full max-h-64 object-contain rounded-lg"
                  />
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="w-full mb-4">
        <div className="relative w-full rounded-2xl bg-gray-800/70 shadow-lg backdrop-blur-sm border border-gray-700/50 overflow-hidden">
          {/* Input field with voice button on left */}
          <div className="relative flex items-center">
            {/* Voice recording button - moved to left */}
            <div className="pl-3">
              <button
                type="button"
                onClick={isStreaming ? stopStreaming : startStreaming}
                className={`p-2.5 rounded-full transition-all duration-200 transform hover:scale-105 ${isStreaming ? 'bg-red-500/80 text-white pulse-animation' : 'bg-gray-700/80 hover:bg-gray-600 text-gray-300 hover:text-white'}`}
                title={isStreaming ? 'Stop recording' : 'Voice input'}
              >
                {isStreaming ? <StopCircle size={18} /> : <Mic size={18} />}
                {isStreaming && <span className="sr-only">Stop recording</span>}
              </button>
            </div>

            <input
              type="text"
              id="message-input"
              name="message-input"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask anything"
              className="w-full p-4 pl-3 pr-32 bg-transparent text-white focus:outline-none focus:ring-0 border-0 text-base"
            />

            {/* Action buttons container */}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2.5">
              {/* Utility menu button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUtilityMenu(!showUtilityMenu)}
                  className="p-2.5 rounded-full bg-gray-700/80 hover:bg-gray-600 text-gray-300 hover:text-white transition-all duration-200 transform hover:scale-105"
                  title="Utilities"
                  aria-expanded={showUtilityMenu}
                  aria-haspopup="true"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="1"></circle>
                    <circle cx="12" cy="5" r="1"></circle>
                    <circle cx="12" cy="19" r="1"></circle>
                  </svg>
                </button>

                {/* Utility dropdown menu */}
                {showUtilityMenu && (
                  <div
                    ref={utilityMenuRef}
                    className="absolute right-0 bottom-full mb-2 w-48 bg-gray-800/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-700/50 p-2 z-50 utility-menu"
                  >
                    <div className="grid gap-1">
                      {/* Attach file button */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="text/*,image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          fileInputRef.current?.click();
                          setShowUtilityMenu(false);
                        }}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-700/80 text-gray-300 hover:text-white transition-all duration-200 utility-button text-left"
                      >
                        <FileUp size={16} />
                        <span>Attach file</span>
                      </button>

                      {/* Search button */}
                      <button
                        type="button"
                        onClick={() => {
                          setInputMessage("Search the web for: ");
                          document.getElementById("message-input").focus();
                          setShowUtilityMenu(false);
                        }}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-700/80 text-gray-300 hover:text-white transition-all duration-200 utility-button text-left"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <span>Web search</span>
                      </button>

                      {/* Reason button */}
                      <button
                        type="button"
                        onClick={() => {
                          setInputMessage("Please explain why: ");
                          document.getElementById("message-input").focus();
                          setShowUtilityMenu(false);
                        }}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-700/80 text-gray-300 hover:text-white transition-all duration-200 utility-button text-left"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h13l4-3.5L18 6Z"></path>
                          <path d="M12 13v8"></path>
                          <path d="M12 3v3"></path>
                        </svg>
                        <span>Get reasoning</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Interactive Send button with face */}
              <button
                ref={sendButtonRef}
                type="button"
                onClick={handleSendMessage}
                onMouseEnter={() => setIsSendHovered(true)}
                onMouseLeave={() => setIsSendHovered(false)}
                onMouseDown={() => sendButtonRef.current?.classList.add('active')}
                onMouseUp={() => sendButtonRef.current?.classList.remove('active')}
                onTouchStart={() => {
                  sendButtonRef.current?.classList.add('active');
                  setIsSendHovered(true);
                }}
                onTouchEnd={() => {
                  sendButtonRef.current?.classList.remove('active');
                  // Delay resetting hover state to make animation smoother
                  setTimeout(() => setIsSendHovered(false), 150);
                }}
                disabled={(!inputMessage.trim() && !currentFile && !capturedImage) || isLoading}
                className={`relative p-2.5 rounded-lg shadow-md send-button-face ${(inputMessage.trim() || currentFile || capturedImage) && !isLoading ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'bg-gray-700/80 text-gray-300 cursor-not-allowed'}`}
                title={isLoading ? 'Sending...' : 'Send message'}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <div className="w-6 h-6 relative">
                    {/* Face or send arrow based on input state */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {/* When input is empty, show eyes */}
                      <div className={`transition-opacity duration-300 ${(inputMessage.trim() || currentFile || capturedImage) ? 'opacity-0 absolute' : 'opacity-100'}`}>
                        <div className="flex justify-center space-x-1.5">
                          {/* Left eye */}
                          <div className="send-button-eye"></div>
                          {/* Right eye */}
                          <div className="send-button-eye"></div>
                        </div>
                      </div>

                      {/* When input has content, show send arrow */}
                      <div className={`transition-all duration-300 transform ${(inputMessage.trim() || currentFile || capturedImage) ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transform rotate-45">
                          <path d="M5 12h14" />
                          <path d="M12 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Status indicators */}
          <div className="px-5 py-1 flex items-center text-xs text-gray-400">
            {isListening && (
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                <span className="loading-dots">Listening</span>
              </div>
            )}
            {isStreaming && <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse ml-auto"></div>}
          </div>

          {/* Attached file indicator */}
          {currentFile && (
            <div className="px-4 py-2 bg-gray-700/80 text-white text-xs flex items-center justify-between border-t border-gray-600/30">
              <span className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                </svg>
                {currentFile.name}
              </span>
              <button
                type="button"
                onClick={() => {
                  setCurrentFile(null);
                  setInputMessage(prev => prev.replace(`[Attached file: ${currentFile.name}]`, '').trim());
                }}
                className="p-1 hover:bg-gray-600 rounded-full"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

export default App;
