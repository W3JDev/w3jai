import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { useNavigate } from 'react-router-dom';
import ChatSessionsList from '../components/ChatHistory/ChatSessionsList';
import StructuredOutputRenderer from '../components/StructuredOutputRenderer';
import AuthModal from '../components/Auth/AuthModal';
import { Mic, StopCircle, Send, FileUp, Menu, X, PlusCircle, User, Settings } from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';
import { useTranslation } from 'react-i18next';
import ChatService from '../services/ChatService';

const Chat = () => {
  const { user, authModalOpen, openAuthModal, closeAuthModal, preferences } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    currentSessionId,
    messages,
    loading,
    error,
    menuData,
    createNewSession,
    selectSession,
    addMessage,
    setError
  } = useChat();

  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatServiceRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize chat service and speech recognition
  useEffect(() => {
    initializeChatService();
    initializeSpeechRecognition();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [preferences]);

  const initializeChatService = () => {
    try {
      const defaultSystemPrompt = 'You are a helpful AI assistant for a restaurant called Table & Apron. Your primary role is to assist customers with menu information, recommendations, and answer questions about the restaurant. Be friendly, professional, and helpful.';

      // Get API keys and settings from user preferences
      if (preferences) {
        const { defaultProvider, defaultModel, defaultSystemPrompt: userSystemPrompt, apiKeys, useEnvKeys } = preferences;

        console.log('User preferences:', { defaultProvider, defaultModel, useEnvKeys });

        // Check if user wants to use environment variables
        if (useEnvKeys) {
          console.log('User prefers to use environment variables');
          // Use environment variables - check both VITE_ prefixed and non-prefixed
          const envKeys = {
            openai: import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.OPENAI_API_KEY || '',
            anthropic: import.meta.env.VITE_ANTHROPIC_API_KEY || import.meta.env.ANTHROPIC_API_KEY || '',
            groq: import.meta.env.VITE_GROQ_API_KEY || import.meta.env.GROQ_API_KEY || '',
            elevenlabs: import.meta.env.VITE_ELEVENLABS_API_KEY || import.meta.env.ELEVENLABS_API_KEY || '',
            brave: import.meta.env.VITE_BRAVE_API_KEY || import.meta.env.BRAVE_API_KEY || ''
          };

          console.log('Environment keys available:', {
            openai: !!envKeys.openai,
            anthropic: !!envKeys.anthropic,
            groq: !!envKeys.groq,
            elevenlabs: !!envKeys.elevenlabs,
            brave: !!envKeys.brave
          });

          // Use the default provider if it has an environment key
          if (defaultProvider && envKeys[defaultProvider]) {
            console.log(`Initializing ChatService with environment ${defaultProvider} key`);
            chatServiceRef.current = new ChatService({
              provider: defaultProvider,
              apiKey: envKeys[defaultProvider],
              model: defaultModel,
              systemPrompt: userSystemPrompt || defaultSystemPrompt
            });
            return;
          }

          // Otherwise use any available environment key, prioritizing OpenAI
          if (envKeys.openai) {
            console.log('Initializing ChatService with environment OpenAI key');
            chatServiceRef.current = new ChatService({
              provider: 'openai',
              apiKey: envKeys.openai,
              model: 'gpt-4o',
              systemPrompt: userSystemPrompt || defaultSystemPrompt
            });
            return;
          } else if (envKeys.anthropic) {
            console.log('Initializing ChatService with environment Anthropic key');
            chatServiceRef.current = new ChatService({
              provider: 'anthropic',
              apiKey: envKeys.anthropic,
              model: 'claude-3-opus-20240229',
              systemPrompt: userSystemPrompt || defaultSystemPrompt
            });
            return;
          } else if (envKeys.groq) {
            console.log('Initializing ChatService with environment Groq key');
            chatServiceRef.current = new ChatService({
              provider: 'groq',
              apiKey: envKeys.groq,
              model: 'llama3-70b-8192',
              systemPrompt: userSystemPrompt || defaultSystemPrompt
            });
            return;
          }

          // If no environment keys are available, fall back to user's API keys
          console.log('No environment keys available, falling back to user API keys');
        }

        // Use user's API keys if available
        if (defaultProvider && apiKeys && apiKeys[defaultProvider]) {
          console.log(`Initializing ChatService with user's ${defaultProvider} key`);
          chatServiceRef.current = new ChatService({
            provider: defaultProvider,
            apiKey: apiKeys[defaultProvider],
            model: defaultModel,
            systemPrompt: userSystemPrompt || defaultSystemPrompt
          });
          return;
        }
      }

      // Fallback to environment variables - prioritize OpenAI
      console.log('Falling back to environment variables');
      const openaiKey = import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.OPENAI_API_KEY;
      const anthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY || import.meta.env.ANTHROPIC_API_KEY;
      const groqKey = import.meta.env.VITE_GROQ_API_KEY || import.meta.env.GROQ_API_KEY;

      console.log(`Environment keys available: OpenAI: ${!!openaiKey}, Anthropic: ${!!anthropicKey}, Groq: ${!!groqKey}`);

      if (openaiKey) {
        console.log('Initializing ChatService with OpenAI environment key');
        chatServiceRef.current = new ChatService({
          provider: 'openai',
          apiKey: openaiKey,
          model: 'gpt-4o',
          systemPrompt: defaultSystemPrompt
        });
      } else if (anthropicKey) {
        console.log('Initializing ChatService with Anthropic environment key');
        chatServiceRef.current = new ChatService({
          provider: 'anthropic',
          apiKey: anthropicKey,
          model: 'claude-3-opus-20240229',
          systemPrompt: defaultSystemPrompt
        });
      } else if (groqKey) {
        console.log('Initializing ChatService with Groq environment key');
        chatServiceRef.current = new ChatService({
          provider: 'groq',
          apiKey: groqKey,
          model: 'llama3-70b-8192',
          systemPrompt: defaultSystemPrompt
        });
      } else {
        // Create an empty service that will prompt for API keys when used
        console.log('No API keys available, creating empty ChatService');
        setError('No API key found. Please add your API key in the Settings page or contact the administrator.');
        chatServiceRef.current = new ChatService();
      }
    } catch (error) {
      console.error('Error initializing chat service:', error);
      setError('Failed to initialize chat service. Please check your API keys in settings.');
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !currentFile) return;

    if (!user) {
      openAuthModal();
      return;
    }

    // Add user message to chat
    const userContent = currentFile
      ? `${inputMessage}\n[Attached file: ${currentFile.name}]`
      : inputMessage;

    await addMessage('user', userContent, {
      file: currentFile ? {
        name: currentFile.name,
        type: currentFile.type
      } : null
    });

    setInputMessage('');
    setCurrentFile(null);
    setIsProcessing(true);

    try {
      // Initialize chat service if needed
      if (!chatServiceRef.current) {
        initializeChatService();
      }

      // Check if we have a properly initialized chat service
      if (!chatServiceRef.current.provider) {
        throw new Error('No AI provider configured. Please add your API keys in the Settings page.');
      }

      // Process the message
      const response = await chatServiceRef.current.sendMessage(inputMessage, {
        file: currentFile,
        menuData
      });

      // Add AI response to chat
      await addMessage('assistant', response.text, {
        audio: response.audio
      });

      // Play audio if available
      if (response.audio) {
        const audio = new Audio(response.audio);
        await audio.play();
      }
    } catch (err) {
      console.error('Error sending message:', err);

      // Show a more helpful error message based on the error
      if (err.message.includes('API key') || err.message.includes('provider')) {
        setError('API configuration error: Please go to Settings and add your API keys.');
      } else if (err.message.includes('ChatService not initialized')) {
        setError('Chat service not initialized: Please go to Settings and add your API keys.');
      } else {
        setError('Failed to get a response. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCurrentFile(file);
      setInputMessage(prev =>
        `${prev}${prev ? '\n' : ''}[Attached file: ${file.name}]`
      );
    }
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition is not supported in your browser');
      return;
    }

    try {
      setIsListening(true);

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');

        setInputMessage(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current.start();
        }
      };

      recognitionRef.current.start();
    } catch (err) {
      console.error('Voice input error:', err);
      setIsListening(false);
      setError('Failed to start voice input');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleNewChat = async () => {
    await createNewSession();
    setInputMessage('');
    setCurrentFile(null);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-72 bg-gray-800 transform transition-transform duration-300 ease-in-out ${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold">W3J Assistant</h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="p-1 rounded-full hover:bg-gray-700 md:hidden"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <PlusCircle size={18} />
              <span>New Chat</span>
            </button>
          </div>

          {user ? (
            <ChatSessionsList
              userId={user.id}
              onSelectSession={selectSession}
              onNewSession={createNewSession}
              currentSessionId={currentSessionId}
              className="flex-1 overflow-y-auto"
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              <User size={48} className="text-gray-500 mb-4" />
              <p className="text-gray-400 text-center mb-4">Sign in to save your chat history</p>
              <button
                onClick={openAuthModal}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="bg-gray-800 p-4 flex items-center justify-between">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 rounded-full hover:bg-gray-700 md:hidden"
          >
            <Menu size={20} />
          </button>

          <h1 className="text-xl font-bold hidden md:block">W3J Assistant</h1>

          <div className="flex items-center gap-4">
            <LanguageSelector />

            <button
              onClick={() => navigate('/settings')}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors"
              title={t('settings.title')}
            >
              <Settings size={20} />
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {user.email.charAt(0).toUpperCase()}
                </div>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
              >
                {t('auth.signIn')}
              </button>
            )}
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-900">
          {loading && messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mb-4">
                W
              </div>
              <h2 className="text-2xl font-bold mb-2">{t('chat.welcome.title')}</h2>
              <p className="text-gray-400 max-w-md mb-8">
                {t('chat.welcome.subtitle')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
                <button
                  onClick={() => setInputMessage(t('chat.suggestions.menu'))}
                  className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors"
                >
                  {t('chat.suggestions.menu')}
                </button>
                <button
                  onClick={() => setInputMessage(t('chat.suggestions.vegetarian'))}
                  className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors"
                >
                  {t('chat.suggestions.vegetarian')}
                </button>
                <button
                  onClick={() => setInputMessage(t('chat.suggestions.specials'))}
                  className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors"
                >
                  {t('chat.suggestions.specials')}
                </button>
                <button
                  onClick={() => setInputMessage(t('chat.suggestions.hours'))}
                  className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors"
                >
                  {t('chat.suggestions.hours')}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={msg.id || i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-white'
                    }`}
                  >
                    <div className="font-medium text-sm opacity-75 mb-1">
                      {msg.role === 'user' ? 'You' : 'W3J Assistant'}
                    </div>

                    <StructuredOutputRenderer
                      content={msg.content}
                      onAction={(action, payload) => {
                        if (action === 'send_message' && payload.message) {
                          setInputMessage(payload.message);
                          handleSendMessage();
                        }
                      }}
                    />

                    {msg.metadata?.file && (
                      <div className="mt-2 p-2 bg-gray-700/50 rounded text-sm">
                        📎 {msg.metadata.file.name}
                      </div>
                    )}

                    {msg.metadata?.audio && (
                      <audio
                        controls
                        src={msg.metadata.audio}
                        className="mt-2 w-full"
                      />
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-500/20 border-t border-red-500/50 text-red-200">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Input area */}
        <div className="p-4 bg-gray-800 border-t border-gray-700">
          <div className="flex items-center gap-2">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`p-2 rounded-full ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title={isListening ? t('chat.stopVoice') : t('chat.startVoice')}
            >
              {isListening ? <StopCircle size={20} /> : <Mic size={20} />}
            </button>

            <div className="relative flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={t('chat.typeMessage')}
                className="w-full p-3 pr-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute right-12 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-300"
                title={t('chat.attachFile')}
              >
                <FileUp size={18} />
              </button>
            </div>

            <button
              onClick={handleSendMessage}
              disabled={isProcessing || (!inputMessage.trim() && !currentFile)}
              className={`p-3 rounded-full bg-blue-600 text-white ${
                isProcessing || (!inputMessage.trim() && !currentFile)
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-blue-700'
              }`}
              title={t('chat.send')}
            >
              <Send size={20} />
            </button>
          </div>

          {currentFile && (
            <div className="mt-2 p-2 bg-gray-700 rounded-lg flex items-center justify-between">
              <span className="text-sm text-gray-300 truncate">
                📎 {currentFile.name}
              </span>
              <button
                onClick={() => setCurrentFile(null)}
                className="p-1 text-gray-400 hover:text-gray-300"
                title="Remove file"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={closeAuthModal}
        onAuthSuccess={closeAuthModal}
      />
    </div>
  );
};

export default Chat;
