/**
 * Express server to handle API requests and serve the application
 * Acts as a secure proxy for all AI provider API calls
 */
// Use ES module syntax
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import path from 'path';
import { URL } from 'url';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "https://api.openai.com", "https://api.groq.com", "https://api.deepseek.com",
                  "https://api.huggingface.co", "https://api.elevenlabs.io", "https://api.search.brave.com",
                  "https://openrouter.ai"],
      mediaSrc: ["'self'", "blob:"],
      fontSrc: ["'self'"],
    },
  },
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

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Proxy endpoint for Brave Search API
app.get('/api/brave-search', async (req, res) => {
  try {
    const apiKey = req.headers['x-subscription-token'];
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    console.log(`Proxying Brave Search request for query: "${query}"`);

    // Forward the request to Brave Search API
    const braveUrl = new URL('https://api.search.brave.com/res/v1/web/search');

    // Copy all query parameters
    Object.keys(req.query).forEach(key => {
      braveUrl.searchParams.append(key, req.query[key]);
    });

    // Add required parameters if not present
    if (!braveUrl.searchParams.has('search_lang')) {
      braveUrl.searchParams.append('search_lang', 'en');
    }

    if (!braveUrl.searchParams.has('safesearch')) {
      braveUrl.searchParams.append('safesearch', 'moderate');
    }

    console.log('Forwarding request to:', braveUrl.toString());

    const response = await axios.get(braveUrl.toString(), {
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': apiKey,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    // Return the response from Brave Search API
    return res.json(response.data);
  } catch (error) {
    console.error('Brave Search proxy error:', error.message);

    // If we have a response from the API, forward it
    if (error.response) {
      console.error('API error response:', error.response.data);
      return res.status(error.response.status).json(error.response.data);
    }

    // Otherwise, return a generic error
    return res.status(500).json({
      error: 'Failed to fetch from Brave Search API',
      details: error.message
    });
  }
});

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

// Proxy endpoint for OpenRouter API
app.post('/api/openrouter/chat', [
  body('messages').isArray().notEmpty(),
  body('model').isString().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const apiKey = getApiKeyForProvider('openrouter');
    const { messages, model, stream = false } = req.body;

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model,
      messages,
      stream
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': req.headers.origin || 'http://localhost:3001',
        'X-Title': 'W3J Assistant'
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
    console.error('OpenRouter API error:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch from OpenRouter API',
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

// Catch-all route to serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access the app at http://localhost:${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api/`);
});
