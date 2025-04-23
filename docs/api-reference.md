# W3J Assistant API Reference

This document provides detailed information about the API endpoints and services used in the W3J Assistant application.

## Table of Contents

1. [Server API Endpoints](#server-api-endpoints)
2. [Supabase API](#supabase-api)
3. [AI Provider APIs](#ai-provider-apis)
4. [External Service APIs](#external-service-apis)
5. [Authentication](#authentication)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)
8. [Response Formats](#response-formats)

## Server API Endpoints

### Health Check

```
GET /api/health
```

Returns the health status of the API server.

**Response**

```json
{
  "status": "ok",
  "timestamp": "2023-06-01T12:00:00.000Z"
}
```

### Brave Search

```
GET /api/brave-search
```

Proxies requests to the Brave Search API.

**Query Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| q | string | The search query |
| count | number | Number of results to return (default: 10) |
| offset | number | Result offset for pagination (default: 0) |
| lang | string | Search language (default: en) |

**Response**

Returns the Brave Search API response.

### OpenAI Chat

```
POST /api/openai/chat
```

Proxies requests to the OpenAI Chat API.

**Request Body**

```json
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "stream": false
}
```

**Response**

Returns the OpenAI API response.

### GROQ Chat

```
POST /api/groq/chat
```

Proxies requests to the GROQ Chat API.

**Request Body**

```json
{
  "model": "llama3-70b",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "stream": false
}
```

**Response**

Returns the GROQ API response.

### Anthropic Chat

```
POST /api/anthropic/chat
```

Proxies requests to the Anthropic Chat API.

**Request Body**

```json
{
  "model": "claude-3-opus",
  "messages": [
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "stream": false
}
```

**Response**

Returns the Anthropic API response.

### ElevenLabs TTS

```
POST /api/elevenlabs/tts
```

Proxies requests to the ElevenLabs Text-to-Speech API.

**Request Body**

```json
{
  "text": "Hello, this is a test of text-to-speech.",
  "voice_id": "EXAVITQu4vr4xnSDxMaL",
  "model_id": "eleven_monolingual_v1",
  "voice_settings": {
    "stability": 0.5,
    "similarity_boost": 0.75,
    "style": 0.0,
    "use_speaker_boost": true
  }
}
```

**Response**

Returns the audio data as a binary stream with Content-Type: audio/mpeg.

## Supabase API

The application uses Supabase for authentication, database, and storage.

### Authentication

```javascript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      full_name: 'John Doe'
    }
  }
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Sign out
const { error } = await supabase.auth.signOut();
```

### Profiles

```javascript
// Get user profile
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();

// Update user profile
const { data, error } = await supabase
  .from('profiles')
  .upsert({
    id: userId,
    full_name: 'John Doe',
    updated_at: new Date().toISOString()
  })
  .select()
  .single();
```

### User Preferences

```javascript
// Get user preferences
const { data, error } = await supabase
  .from('user_preferences')
  .select('*')
  .eq('user_id', userId)
  .single();

// Update user preferences
const { data, error } = await supabase
  .from('user_preferences')
  .upsert({
    user_id: userId,
    preferences: {
      theme: 'dark',
      defaultProvider: 'openai'
    },
    updated_at: new Date().toISOString()
  })
  .select()
  .single();
```

### Chat Sessions

```javascript
// Get chat sessions
const { data, error } = await supabase
  .from('chat_sessions')
  .select('*')
  .eq('user_id', userId)
  .order('updated_at', { ascending: false });

// Create chat session
const { data, error } = await supabase
  .from('chat_sessions')
  .insert({
    id: sessionId,
    user_id: userId,
    title: 'New Chat',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })
  .select()
  .single();
```

### Chat Messages

```javascript
// Get chat messages
const { data, error } = await supabase
  .from('chat_messages')
  .select('*')
  .eq('session_id', sessionId)
  .order('created_at', { ascending: true });

// Save chat message
const { data, error } = await supabase
  .from('chat_messages')
  .insert({
    id: messageId,
    session_id: sessionId,
    role: 'user',
    content: 'Hello, how are you?',
    created_at: new Date().toISOString()
  })
  .select()
  .single();
```

### Menu Data

```javascript
// Get menu categories
const { data, error } = await supabase
  .from('menu_categories')
  .select('*')
  .order('display_order', { ascending: true });

// Get menu items
const { data, error } = await supabase
  .from('menu_items')
  .select(`
    *,
    menu_categories(id, name)
  `)
  .order('name', { ascending: true });
```

## AI Provider APIs

### OpenAI API

The application uses the OpenAI API for chat completions.

**Endpoint**: `https://api.openai.com/v1/chat/completions`

**Request**:

```json
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "stream": false
}
```

**Response**:

```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677858242,
  "model": "gpt-4o",
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "I'm doing well, thank you for asking! How can I help you today?"
      },
      "index": 0,
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 13,
    "completion_tokens": 15,
    "total_tokens": 28
  }
}
```

### Anthropic API

The application uses the Anthropic API for chat completions.

**Endpoint**: `https://api.anthropic.com/v1/messages`

**Request**:

```json
{
  "model": "claude-3-opus",
  "messages": [
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "stream": false
}
```

**Response**:

```json
{
  "id": "msg_01XxXxXxXxXxXxXxXxXxXxXx",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "I'm doing well, thank you for asking! How can I help you today?"
    }
  ],
  "model": "claude-3-opus",
  "stop_reason": "end_turn",
  "usage": {
    "input_tokens": 10,
    "output_tokens": 15
  }
}
```

### GROQ API

The application uses the GROQ API for chat completions.

**Endpoint**: `https://api.groq.com/openai/v1/chat/completions`

**Request**:

```json
{
  "model": "llama3-70b",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "stream": false
}
```

**Response**:

```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677858242,
  "model": "llama3-70b",
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "I'm doing well, thank you for asking! How can I help you today?"
      },
      "index": 0,
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 13,
    "completion_tokens": 15,
    "total_tokens": 28
  }
}
```

## External Service APIs

### ElevenLabs API

The application uses the ElevenLabs API for text-to-speech.

**Endpoint**: `https://api.elevenlabs.io/v1/text-to-speech/{voice_id}`

**Request**:

```json
{
  "text": "Hello, this is a test of text-to-speech.",
  "model_id": "eleven_monolingual_v1",
  "voice_settings": {
    "stability": 0.5,
    "similarity_boost": 0.75,
    "style": 0.0,
    "use_speaker_boost": true
  }
}
```

**Response**:

Binary audio data with Content-Type: audio/mpeg.

### Brave Search API

The application uses the Brave Search API for web search.

**Endpoint**: `https://api.search.brave.com/res/v1/web/search`

**Request**:

```
GET https://api.search.brave.com/res/v1/web/search?q=example+query&count=10&offset=0&search_lang=en
```

**Response**:

```json
{
  "query": {
    "original": "example query"
  },
  "web": {
    "results": [
      {
        "title": "Example Result",
        "url": "https://example.com",
        "description": "This is an example search result."
      }
    ],
    "total": 1000
  }
}
```

## Authentication

The application uses Supabase Auth for authentication.

### JWT Format

Supabase Auth uses JWT (JSON Web Tokens) for authentication. The token contains:

- **Header**: Algorithm and token type
- **Payload**: User ID, email, and other claims
- **Signature**: Cryptographic signature

### Token Refresh

Tokens are automatically refreshed by the Supabase client when they expire.

### Security Considerations

- Tokens are stored in localStorage by default
- The application uses HTTPS for all API requests
- API keys are encrypted before storage

## Error Handling

The application uses a standardized error handling approach:

```javascript
try {
  // API call
} catch (error) {
  if (error.response) {
    // Server responded with an error status
    console.error('API error:', error.response.data);
    return {
      error: {
        status: error.response.status,
        message: error.response.data.message || 'An error occurred',
        details: error.response.data
      }
    };
  } else if (error.request) {
    // Request was made but no response received
    console.error('Network error:', error.request);
    return {
      error: {
        status: 0,
        message: 'Network error. Please check your connection.',
        details: error.request
      }
    };
  } else {
    // Error in setting up the request
    console.error('Request error:', error.message);
    return {
      error: {
        status: 0,
        message: error.message,
        details: error
      }
    };
  }
}
```

## Rate Limiting

The application implements rate limiting to prevent abuse:

```javascript
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);
```

## Response Formats

### Success Response

```json
{
  "data": {
    // Response data
  },
  "error": null
}
```

### Error Response

```json
{
  "data": null,
  "error": {
    "status": 400,
    "message": "Invalid request",
    "details": {
      // Error details
    }
  }
}
```

### Structured Output

The application supports structured output for AI responses:

```json
{
  "type": "structured_output",
  "data": {
    "title": "Menu Items",
    "items": [
      {
        "name": "Grilled Salmon",
        "price": 18.99,
        "description": "Fresh salmon fillet grilled to perfection",
        "dietary_info": ["gluten-free"]
      },
      {
        "name": "Vegetable Pasta",
        "price": 14.99,
        "description": "Pasta with seasonal vegetables",
        "dietary_info": ["vegetarian"]
      }
    ]
  }
}
```
