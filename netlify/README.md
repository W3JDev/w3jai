# Netlify Deployment

This directory contains files for deploying the application to Netlify.

## Deployment Steps

1. **Set up Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize Netlify site**
   ```bash
   netlify init
   ```

4. **Set up environment variables**
   - Go to your Netlify site dashboard
   - Navigate to Site settings > Build & deploy > Environment
   - Add all the required environment variables from your .env file

   Required environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ENCRYPTION_KEY`
   - `OPENAI_API_KEY`
   - `GROQ_API_KEY`
   - `DEEPSEEK_API_KEY`
   - `HUGGINGFACE_API_KEY`
   - `ANTHROPIC_API_KEY`
   - `OPENROUTER_API_KEY`
   - `ELEVENLABS_API_KEY`
   - `BRAVE_API_KEY`
   - `GEMINI_API_KEY`
   - `GOOGLE_SEARCH_CONSOLE_API_KEY`

5. **Deploy to Netlify**
   ```bash
   netlify deploy --prod
   ```

## Functions

The `functions` directory contains serverless functions that will be deployed to Netlify Functions.

- `server.js`: Main API server that handles proxying requests to various AI providers

## Build Configuration

The build configuration is defined in the `netlify.toml` file in the root directory.

## Troubleshooting

If you encounter issues with the deployment:

1. Check the Netlify build logs for errors
2. Verify that all environment variables are set correctly
3. Make sure the Netlify site is linked to the correct repository
4. Try running `netlify build` locally to debug build issues
