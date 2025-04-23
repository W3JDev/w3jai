exports.handler = async function(event, context) {
  // Check which environment variables are available
  const envKeys = {
    openai: !!process.env.VITE_OPENAI_API_KEY,
    anthropic: !!process.env.VITE_ANTHROPIC_API_KEY,
    groq: !!process.env.VITE_GROQ_API_KEY,
    elevenlabs: !!process.env.VITE_ELEVENLABS_API_KEY,
    brave: !!process.env.VITE_BRAVE_API_KEY
  };

  // Log environment variables (masked for security)
  console.log('Environment variables check:', {
    openai: process.env.VITE_OPENAI_API_KEY ? 'Set (masked)' : 'Not set',
    anthropic: process.env.VITE_ANTHROPIC_API_KEY ? 'Set (masked)' : 'Not set',
    groq: process.env.VITE_GROQ_API_KEY ? 'Set (masked)' : 'Not set',
    elevenlabs: process.env.VITE_ELEVENLABS_API_KEY ? 'Set (masked)' : 'Not set',
    brave: process.env.VITE_BRAVE_API_KEY ? 'Set (masked)' : 'Not set'
  });

  // Also check for non-VITE prefixed keys
  const nonViteKeys = {
    openai: !!process.env.OPENAI_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    groq: !!process.env.GROQ_API_KEY,
    elevenlabs: !!process.env.ELEVENLABS_API_KEY,
    brave: !!process.env.BRAVE_API_KEY
  };

  console.log('Non-VITE environment variables check:', nonViteKeys);

  // Return both sets of keys
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type'
    },
    body: JSON.stringify({
      viteKeys: envKeys,
      nonViteKeys: nonViteKeys
    })
  };
};
