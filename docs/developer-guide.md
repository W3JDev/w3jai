# W3J Assistant Developer Guide

This document provides comprehensive information for developers working with the W3J Assistant codebase.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Setup & Installation](#setup--installation)
6. [Configuration](#configuration)
7. [Key Components](#key-components)
8. [Services](#services)
9. [API Integration](#api-integration)
10. [Database Schema](#database-schema)
11. [Authentication](#authentication)
12. [Internationalization](#internationalization)
13. [Accessibility](#accessibility)
14. [Testing](#testing)
15. [Deployment](#deployment)
16. [Contributing Guidelines](#contributing-guidelines)

## Project Overview

W3J Assistant is a modern AI chat application with multi-provider support, user authentication, chat history, and menu data integration. It provides a responsive UI for desktop and mobile devices, with features like voice input/output, file uploads, and structured output rendering.

### Key Features

- Multi-provider AI support (OpenAI, Anthropic, GROQ, Deepseek, Hugging Face)
- User authentication and profile management
- Chat history with session management
- Menu data integration for restaurant assistant
- Voice input and output
- Web search capability
- Structured output rendering
- Accessibility features
- Internationalization support

## Architecture

The application follows a modern React architecture with context-based state management and service-oriented design.

### High-Level Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Frontend │────▶│  API Services   │────▶│  AI Providers   │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                      │                       │
         │                      │                       │
         ▼                      ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│    Supabase     │◀───▶│  MCP Server     │◀───▶│  External APIs  │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Data Flow

1. User interacts with the React frontend
2. React components use context providers for state management
3. Service modules handle business logic and API calls
4. External services (AI providers, Supabase, etc.) process requests
5. Results flow back through the same path to update the UI

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router
- i18next (internationalization)

### Backend
- Node.js
- Express
- Supabase (PostgreSQL)

### AI Integration
- OpenAI API
- Anthropic API
- GROQ API
- Deepseek API
- Hugging Face API
- ElevenLabs API (voice)

### Testing
- Vitest
- React Testing Library
- MSW (Mock Service Worker)

### Deployment
- Docker
- Netlify

## Project Structure

```
w3j-assistant/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── Auth/        # Authentication components
│   │   ├── ChatHistory/ # Chat history components
│   │   ├── User/        # User profile components
│   │   └── ...
│   ├── contexts/        # React context providers
│   ├── i18n/            # Internationalization
│   │   └── locales/     # Translation files
│   ├── pages/           # Page components
│   ├── services/        # Service modules
│   │   └── providers/   # AI provider adapters
│   ├── styles/          # Global styles
│   ├── utils/           # Utility functions
│   ├── App.jsx          # Main App component
│   └── main.jsx         # Entry point
├── supabase/            # Supabase configuration
│   └── migrations/      # Database migrations
├── tests/               # Test files
├── docs/                # Documentation
├── .env.example         # Example environment variables
├── docker-compose.yml   # Docker configuration
├── Dockerfile           # Docker build configuration
├── netlify.toml         # Netlify configuration
└── package.json         # Project dependencies
```

## Setup & Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- API keys for AI providers (OpenAI, Anthropic, etc.)

### Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/w3j-assistant.git
   cd w3j-assistant
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Fill in your API keys and Supabase configuration in the `.env` file.

5. Start the development server:
   ```bash
   npm run dev
   ```

## Configuration

### Environment Variables

| Variable | Description |
|----------|-------------|
| VITE_SUPABASE_URL | Supabase project URL |
| VITE_SUPABASE_ANON_KEY | Supabase anonymous key |
| VITE_OPENAI_KEY | OpenAI API key |
| VITE_ANTHROPIC_KEY | Anthropic API key |
| VITE_GROQ_KEY | GROQ API key |
| VITE_DEEPSEEK_KEY | Deepseek API key |
| VITE_HUGGINGFACE_KEY | Hugging Face API key |
| VITE_ELEVENLABS_KEY | ElevenLabs API key for voice |
| VITE_BRAVE_API_KEY | Brave Search API key |
| VITE_API_URL | API URL for server-side proxy |
| VITE_MCP_SERVER_URL | MCP server URL |

### Supabase Setup

1. Create a new Supabase project
2. Run the SQL migrations in `supabase/migrations/` to set up the database schema
3. Configure authentication providers in the Supabase dashboard
4. Update your `.env` file with the Supabase URL and anon key

## Key Components

### App Component

The main application component that sets up routing and global providers.

```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, ChatProvider, AnalyticsProvider, AccessibilityProvider } from './contexts';
import { Chat, Dashboard } from './pages';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AnalyticsProvider>
          <AccessibilityProvider>
            <ChatProvider>
              <Routes>
                <Route path="/" element={<Chat />} />
                <Route path="/dashboard" element={<Dashboard />} />
              </Routes>
            </ChatProvider>
          </AccessibilityProvider>
        </AnalyticsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

### Context Providers

The application uses several context providers for state management:

- **AuthContext**: Manages user authentication state
- **ChatContext**: Manages chat state and history
- **AnalyticsContext**: Manages analytics tracking
- **AccessibilityContext**: Manages accessibility preferences

### Chat Component

The main chat interface component that handles user interactions.

### Settings Component

Component for managing application settings and API keys.

## Services

### ChatService

The main service for handling chat interactions with AI providers.

```javascript
// src/services/ChatService.js
class ChatService {
  constructor() {
    this.provider = this.getProvider();
    this.history = [];
  }

  getProvider() {
    // Initialize the appropriate provider based on settings
  }

  async sendMessage(message, options = {}) {
    try {
      // Process message with the current provider
      return await this.provider.sendMessage(message, options);
    } catch (error) {
      // Handle error and try fallback if enabled
      if (options.fallbackEnabled) {
        const fallbackProvider = this.getFallbackProvider();
        return await fallbackProvider.sendMessage(message, options);
      }
      throw error;
    }
  }
}
```

### Provider Adapters

Adapter classes for different AI providers:

- **OpenAIAdapter**: Adapter for OpenAI API
- **AnthropicAdapter**: Adapter for Anthropic API
- **GroqAdapter**: Adapter for GROQ API
- **DeepseekAdapter**: Adapter for Deepseek API
- **HuggingFaceAdapter**: Adapter for Hugging Face API

### Supabase Services

Services for interacting with Supabase:

- **userService**: Manages user profiles and preferences
- **chatHistoryService**: Manages chat history
- **menuService**: Manages menu data

## API Integration

### AI Provider Integration

The application supports multiple AI providers through adapter classes:

```javascript
// src/services/providers/OpenAIAdapter.js
class OpenAIAdapter {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.openai.com/v1';
  }

  async sendMessage(message, options = {}) {
    // Format message for OpenAI API
    // Send request to OpenAI
    // Process and return response
  }
}
```

### Tool Functions

The application supports tool functions for AI providers:

```javascript
// src/utils/toolFunctions.js
const toolFunctions = [
  {
    name: 'web_search',
    description: 'Search the web for information',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query'
        }
      },
      required: ['query']
    }
  }
];

export default toolFunctions;
```

## Database Schema

### Tables

- **profiles**: User profile information
- **user_preferences**: User preferences and settings
- **user_api_keys**: Encrypted API keys for users
- **chat_sessions**: Chat session metadata
- **chat_messages**: Individual chat messages
- **menu_categories**: Menu categories
- **menu_items**: Menu items with details
- **restaurant_info**: Restaurant information
- **analytics_events**: Analytics event tracking

### Relationships

```
profiles
  ↑
  | (1:1)
auth.users
  ↓
  | (1:many)
  ├── user_preferences
  ├── user_api_keys
  └── chat_sessions
       ↓
       | (1:many)
       └── chat_messages

menu_categories
  ↓
  | (1:many)
  └── menu_items
```

## Authentication

The application uses Supabase Auth for authentication:

```javascript
// src/services/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;

export const signInWithEmail = async (email, password) => {
  // Sign in logic
};

export const signUpWithEmail = async (email, password, metadata = {}) => {
  // Sign up logic
};
```

## Internationalization

The application uses i18next for internationalization:

```javascript
// src/i18n/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en/translation.json';
import esTranslation from './locales/es/translation.json';
// ... other languages

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      es: { translation: esTranslation },
      // ... other languages
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
```

## Accessibility

The application includes several accessibility features:

- High contrast mode
- Large text mode
- Reduced motion mode
- Screen reader optimizations
- Keyboard navigation
- ARIA attributes

```javascript
// src/contexts/AccessibilityContext.jsx
export const AccessibilityProvider = ({ children }) => {
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [screenReaderMode, setScreenReaderMode] = useState(false);
  
  // Apply preferences to document
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    // ... other preferences
  }, [highContrast, largeText, reducedMotion, screenReaderMode]);
  
  // ... provider implementation
};
```

## Testing

The application uses Vitest and React Testing Library for testing:

```javascript
// src/components/Auth/Login.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Login from './Login';

describe('Login Component', () => {
  it('renders correctly', () => {
    render(<Login />);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });
  
  it('handles form submission', async () => {
    // Test implementation
  });
});
```

## Deployment

### Docker Deployment

```bash
# Build and run with Docker
docker-compose up -d
```

### Netlify Deployment

```bash
# Deploy to Netlify
npm run netlify:deploy
```

## Contributing Guidelines

### Code Style

- Follow the existing code style
- Use ESLint and Prettier for formatting
- Write meaningful commit messages

### Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests for your changes
5. Run the test suite
6. Submit a pull request

### Development Workflow

1. Pick an issue from the issue tracker
2. Create a branch for the issue
3. Implement the feature or fix
4. Write tests
5. Submit a pull request
6. Address review comments
