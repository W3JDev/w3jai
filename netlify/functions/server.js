const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Handled by Netlify headers
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// Enable CORS for all routes
app.use(cors());

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));

// Helper function to validate API keys
const getApiKeyForProvider = (provider) => {
  const keys = {
    openai: process.env.OPENAI_API_KEY,
    groq: process.env.GROQ_API_KEY,
    deepseek: process.env.DEEPSEEK_API_KEY,
    huggingface: process.env.HUGGINGFACE_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    openrouter: process.env.OPENROUTER_API_KEY,
    elevenlabs: process.env.ELEVENLABS_API_KEY,
    brave: process.env.BRAVE_API_KEY
  };

  const key = keys[provider];
  if (!key) {
    throw new Error(`API key for provider '${provider}' not found`);
  }
  return key;
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Proxy endpoint for Brave Search API
app.get('/api/brave-search', async (req, res) => {
  try {
    const apiKey = getApiKeyForProvider('brave');
    const query = req.query.q;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
      params: {
        q: query,
        count: req.query.count || 10,
        offset: req.query.offset || 0,
        search_lang: req.query.lang || 'en'
      },
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': apiKey
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Brave Search API error:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch from Brave Search API',
      details: error.response?.data || error.message
    });
  }
});

// Proxy endpoint for OpenAI API
app.post('/api/openai/chat', [
  body('messages').isArray().notEmpty(),
  body('model').isString().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const apiKey = getApiKeyForProvider('openai');
    const { messages, model, stream = false } = req.body;

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model,
      messages,
      stream
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      responseType: stream ? 'stream' : 'json'
    });

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      response.data.pipe(res);
    } else {
      res.json(response.data);
    }
  } catch (error) {
    console.error('OpenAI API error:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch from OpenAI API',
      details: error.response?.data || error.message
    });
  }
});

// Proxy endpoint for GROQ API
app.post('/api/groq/chat', [
  body('messages').isArray().notEmpty(),
  body('model').isString().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const apiKey = getApiKeyForProvider('groq');
    const { messages, model, stream = false } = req.body;

    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model,
      messages,
      stream
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      responseType: stream ? 'stream' : 'json'
    });

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      response.data.pipe(res);
    } else {
      res.json(response.data);
    }
  } catch (error) {
    console.error('GROQ API error:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch from GROQ API',
      details: error.response?.data || error.message
    });
  }
});

// Proxy endpoint for Anthropic API
app.post('/api/anthropic/chat', [
  body('messages').isArray().notEmpty(),
  body('model').isString().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const apiKey = getApiKeyForProvider('anthropic');
    const { messages, model, stream = false } = req.body;

    // Convert messages to Anthropic format if needed
    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));

    const response = await axios.post('https://api.anthropic.com/v1/messages', {
      model,
      messages: formattedMessages,
      stream
    }, {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      responseType: stream ? 'stream' : 'json'
    });

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      response.data.pipe(res);
    } else {
      res.json(response.data);
    }
  } catch (error) {
    console.error('Anthropic API error:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch from Anthropic API',
      details: error.response?.data || error.message
    });
  }
});

// Proxy endpoint for ElevenLabs API
app.post('/api/elevenlabs/tts', [
  body('text').isString().notEmpty(),
  body('voice_id').isString().optional(),
  body('model_id').isString().optional()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const apiKey = getApiKeyForProvider('elevenlabs');
    const { text, voice_id = 'EXAVITQu4vr4xnSDxMaL', model_id = 'eleven_monolingual_v1', voice_settings } = req.body;

    const response = await axios.post(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
      text,
      model_id,
      voice_settings: voice_settings || {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true
      }
    }, {
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      responseType: 'arraybuffer'
    });

    res.set('Content-Type', 'audio/mpeg');
    res.send(response.data);
  } catch (error) {
    console.error('ElevenLabs API error:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch from ElevenLabs API',
      details: error.response?.data || error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
  });
});

// Export the serverless function
module.exports.handler = serverless(app);
