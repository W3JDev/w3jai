# Deployment Guide

This guide provides instructions for deploying the W3J Assistant application to Netlify.

## Prerequisites

- Node.js 18+ installed
- Git installed
- Netlify account
- Supabase account with project set up

## Deployment Steps

### 1. Prepare Your Environment Variables

Make sure your `.env` file contains all the necessary environment variables:

```
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_KEY=your_supabase_service_key
VITE_ENCRYPTION_KEY=your_encryption_key_for_api_keys

# AI Provider API Keys
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key
VITE_GROQ_API_KEY=your_groq_api_key
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key
VITE_HUGGINGFACE_API_KEY=your_huggingface_api_key
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key
VITE_BRAVE_API_KEY=your_brave_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_GOOGLE_SEARCH_CONSOLE_API_KEY=your_google_search_console_api_key

# Server Configuration
VITE_API_URL=your_api_url
VITE_MCP_SERVER_URL=your_mcp_server_url
```

### 2. Build the Application Locally

```bash
npm run build
```

This will create a `dist` directory with the built application.

### 3. Deploy to Netlify

#### Option 1: Drag and Drop Deployment

1. Go to [Netlify](https://app.netlify.com/)
2. Log in to your account
3. Drag and drop the `dist` directory to the Netlify dashboard
4. Wait for the deployment to complete
5. Configure your environment variables in the Netlify dashboard:
   - Go to Site settings > Build & deploy > Environment
   - Add all the required environment variables from your .env file

#### Option 2: Using Netlify CLI

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Log in to Netlify:
   ```bash
   netlify login
   ```

3. Initialize Netlify site:
   ```bash
   netlify init
   ```

4. Deploy to Netlify:
   ```bash
   netlify deploy --prod
   ```

5. Configure your environment variables in the Netlify dashboard:
   - Go to Site settings > Build & deploy > Environment
   - Add all the required environment variables from your .env file

### 4. Set Up Netlify Functions

1. In the Netlify dashboard, go to Functions
2. Make sure the functions directory is set to `netlify/functions`
3. Verify that the server function is deployed correctly

### 5. Configure Netlify Redirects

Make sure your `netlify.toml` file contains the following redirects:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 6. Set Up Custom Domain (Optional)

1. In the Netlify dashboard, go to Domain settings
2. Click "Add custom domain"
3. Follow the instructions to set up your custom domain

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check the build logs for errors
   - Make sure all dependencies are installed
   - Verify that the build command is correct

2. **API Errors**
   - Check that all environment variables are set correctly
   - Verify that the API keys are valid
   - Check the Netlify function logs for errors

3. **Database Connection Issues**
   - Verify that the Supabase URL and keys are correct
   - Check that the database is accessible from Netlify
   - Verify that the database schema is set up correctly

4. **Missing Environment Variables**
   - Make sure all required environment variables are set in the Netlify dashboard
   - Check that the variable names match those used in the application

### Getting Help

If you encounter issues that you cannot resolve, please:

1. Check the Netlify documentation: https://docs.netlify.com/
2. Check the Supabase documentation: https://supabase.io/docs
3. Contact support for assistance
