# W3J Assistant

A modern, real-time AI chat application with text, voice, and video capabilities.

![W3J Assistant](screenshot.png)

## Features

### Core Features

- 🤖 Real-time AI chat with streaming responses
- 🎙️ Voice chat with speech recognition
- 📁 File upload support (text/images)
- 🎥 Video chat with recording and image capture
- 🔍 Web search capabilities
- 💬 Customizable system prompts
- 🤖 Advanced reasoning with step-by-step thinking
- 🌐 Multiple AI model support
- 🎨 Modern, responsive UI
- 🔒 User authentication and profiles with Supabase
- 💾 Chat history with session management
- 🍽️ Menu data integration for restaurant assistant
- 📊 Structured output rendering
- 📈 Usage analytics and admin dashboard
- ♿ Comprehensive accessibility features
- 🌐 Internationalization with multiple languages
- 🔧 User preferences and settings

### AI Models

- Multiple AI Provider Support
  - OpenRouter Integration
    - Claude 2
    - Gemini Pro
    - Llama 2 70B
    - Mistral 7B
  - OpenAI Direct Integration
    - GPT-3.5 Turbo
    - GPT-4
    - GPT-4 Turbo
    - GPT-4o
    - GPT-4 Vision
  - Anthropic Direct Integration
    - Claude 3 Opus
    - Claude 3 Sonnet
    - Claude 3 Haiku
  - Google Gemini Direct Integration
    - Gemini Pro
    - Gemini Pro Vision
    - Gemini 1.5 Pro
  - GROQ Integration
    - Llama 3 70B
    - Llama 3 8B
    - Mixtral 8x7B
    - Gemma 7B
  - Deepseek Integration
    - Deepseek Chat
    - Deepseek Coder
    - Deepseek LLM 67B
  - Hugging Face Integration
    - Mixtral 8x7B
    - Llama 2 70B
    - Gemma 7B
    - Phi-2
    - StableLM Zephyr 3B
- Voice Synthesis with ElevenLabs
- Real-time streaming responses
- Advanced reasoning capabilities
- Tool function support for web search and other capabilities

### Technical Features

- ⚡ Real-time WebSocket communication
- 🔊 Advanced audio processing
- 📹 Video recording and image capture
- 🤖 Modular AI provider architecture
- 🔍 Web search integration
- 💬 System prompt customization
- 📱 Mobile-first responsive design
- 🔒 Secure API key management
- 🎯 High-performance architecture

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Modern web browser

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/w3j-assistant.git

# Navigate to project directory
cd w3j-assistant

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

### API Keys Setup
1. AI Provider API (Required - choose one)
   - OpenRouter API
     - Visit [OpenRouter](https://openrouter.ai)
     - Create an account
     - Generate API key
     - Add to .env: `VITE_OPENROUTER_KEY=your_key`
   - OpenAI API
     - Visit [OpenAI](https://platform.openai.com)
     - Create an account
     - Generate API key
     - Add to .env: `VITE_OPENAI_KEY=your_key`
   - Google Gemini API
     - Visit [Google AI Studio](https://makersuite.google.com)
     - Create an account
     - Generate API key
     - Add to .env: `VITE_GEMINI_KEY=your_key`
   - GROQ API
     - Visit [GROQ](https://console.groq.com)
     - Create an account
     - Generate API key
     - Add to .env: `VITE_GROQ_KEY=your_key`
   - Deepseek API
     - Visit [Deepseek](https://platform.deepseek.com)
     - Create an account
     - Generate API key
     - Add to .env: `VITE_DEEPSEEK_KEY=your_key`
   - Hugging Face API
     - Visit [Hugging Face](https://huggingface.co)
     - Create an account
     - Generate API key
     - Add to .env: `VITE_HUGGINGFACE_KEY=your_key`

2. ElevenLabs API (Optional - for voice)
   - Visit [ElevenLabs](https://elevenlabs.io)
   - Create an account
   - Generate API key
   - Add to .env: `VITE_ELEVENLABS_KEY=your_key`

3. Google Search API (Optional - for web search)
   - Visit [Google Cloud Console](https://console.cloud.google.com)
   - Create a project and enable Custom Search API
   - Generate API key
   - Create a Custom Search Engine and get the CSE ID
   - Add to .env:
     - `VITE_GOOGLE_API_KEY=your_key`
     - `VITE_GOOGLE_CSE_ID=your_cse_id`

4. Supabase (Required - for authentication and data storage)
   - Visit [Supabase](https://supabase.io)
   - Create a new project
   - Get your project URL, anon key, and service key
   - Add to .env:
     - `VITE_SUPABASE_URL=your_supabase_url`
     - `VITE_SUPABASE_ANON_KEY=your_supabase_anon_key`
     - `VITE_SUPABASE_SERVICE_KEY=your_supabase_service_key`
     - `VITE_ENCRYPTION_KEY=your_encryption_key_for_api_keys`
   - Run the SQL migrations in `supabase/migrations/` to set up the database schema
   - The migrations will create tables for:
     - User profiles and preferences
     - API key storage (encrypted)
     - Chat history
     - Analytics tracking
     - Restaurant information

## Development

### Project Structure
```
react-ai-chat/
├── src/
│   ├── utils/
│   │   ├── aiService.js       # Base AI service interface
│   │   ├── aiServiceFactory.js # Factory for creating AI services
│   │   ├── openRouterService.js # OpenRouter implementation
│   │   ├── openAIService.js   # OpenAI implementation
│   │   ├── geminiService.js   # Google Gemini implementation
│   │   ├── chatService.js     # Unified chat service
│   │   ├── videoService.js    # Video processing
│   │   ├── websocket.js       # WebSocket management
│   │   ├── audioProcessor.js  # Audio handling
│   │   └── streamProcessor.js # Stream management
│   ├── components/
│   │   ├── VideoChat.jsx     # Video chat component
│   │   └── ui/
│   │       └── card.jsx      # UI components
│   ├── App.jsx              # Main component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── public/
│   └── favicon.svg         # App icon
└── docs/
    ├── DOCUMENTATION.md    # Technical docs
    ├── ROADMAP.md         # Development plan
    ├── TESTING_PLAN.md    # Testing strategy
    └── VIDEO_IMPLEMENTATION.md  # Video features
```

### Available Scripts
```bash
# Development
npm run dev         # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build

# Testing
npm run test       # Run tests
npm run test:watch # Watch mode
npm run test:coverage # Coverage report

# Linting
npm run lint       # Run ESLint
npm run format    # Format with Prettier
```

## Testing

### Running Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Test Categories
1. Unit Tests
   - Components
   - Services
   - Utilities

2. Integration Tests
   - Chat flow
   - Voice processing
   - Video processing
   - File handling

3. E2E Tests
   - Complete user flows
   - API integration
   - Error scenarios

## Deployment

### Build for Production
```bash
# Build
npm run build

# Preview
npm run preview
```

### Deployment Options
1. Netlify
   - Connect repository
   - Configure build settings
   - Deploy

2. Docker
```bash
# Build image
docker build -t w3j-assistant .

# Run container
docker run -p 80:80 w3j-assistant
```

## Security

### API Key Protection
- Environment variables
- Local storage encryption
- Secure transmission

### Content Security
- Input validation
- File type checking
- Size limitations

### Data Protection
- Local processing
- Secure storage
- Privacy controls

## Contributing

### Getting Started
1. Fork repository
2. Create feature branch
3. Make changes
4. Submit pull request

### Guidelines
- Follow code style
- Add tests
- Update documentation
- Keep commits clean

## Documentation

### Technical Docs
- [Main Documentation](DOCUMENTATION.md)
- [Video Implementation](VIDEO_IMPLEMENTATION.md)
- [Testing Plan](TESTING_PLAN.md)
- [Security & Deployment](SECURITY_DEPLOYMENT.md)

### Roadmap
See [ROADMAP.md](ROADMAP.md) for planned features and enhancements.

## Support

### Resources
- [Issue Tracker](https://github.com/yourusername/w3j-assistant/issues)
- [Documentation](docs/)
- [Discussions](https://github.com/yourusername/w3j-assistant/discussions)

### Getting Help
1. Check documentation
2. Search issues
3. Open new issue
4. Join discussions

## License
MIT License - see [LICENSE](LICENSE) for details

## Acknowledgments
- OpenRouter API
- ElevenLabs
- Supabase
- React community
- Open source contributors

---

Built with ❤️ using React, Vite, and TailwindCSS
