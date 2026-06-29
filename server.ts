import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable JSON request body parsing
  app.use(express.json());

  // ==========================================
  // ONLINE / INTERNET-DEPENDENT ENDPOINTS
  // ==========================================

  // Endpoint to check which API keys are loaded from the server-side .env file
  // This informs the frontend if it can run online with pre-configured keys.
  app.get('/api/ai-config', (req, res) => {
    res.json({
      gemini: !!process.env.GEMINI_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
      claude: !!process.env.CLAUDE_API_KEY || !!process.env.ANTHROPIC_API_KEY,
      openrouter: !!process.env.OPENROUTER_API_KEY,
      huggingface: !!process.env.HUGGINGFACE_API_KEY,
      nvidia: !!process.env.NVIDIA_API_KEY,
    });
  });

  // Proxy endpoint to perform AI queries on the server.
  // INTERNET REQUIRED: This endpoint connects to external LLM APIs (Google, OpenAI, Anthropic, etc.)
  // It resolves CORS issues and hides user keys in the .env file.
  app.post('/api/ai', async (req, res) => {
    try {
      const { provider, model, prompt, history = [], apiKey: clientApiKey, baseUrl } = req.body;

      if (!provider) {
        return res.status(400).json({ error: 'Provider is required.' });
      }

      // 1. Resolve API key: Priority to server-side .env, fallback to client-sent key
      let resolvedApiKey = '';
      switch (provider) {
        case 'gemini':
          resolvedApiKey = process.env.GEMINI_API_KEY || clientApiKey || '';
          break;
        case 'openai':
          resolvedApiKey = process.env.OPENAI_API_KEY || clientApiKey || '';
          break;
        case 'claude':
          resolvedApiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY || clientApiKey || '';
          break;
        case 'openrouter':
          resolvedApiKey = process.env.OPENROUTER_API_KEY || clientApiKey || '';
          break;
        case 'huggingface':
          resolvedApiKey = process.env.HUGGINGFACE_API_KEY || clientApiKey || '';
          break;
        case 'nvidia':
          resolvedApiKey = process.env.NVIDIA_API_KEY || clientApiKey || '';
          break;
        case 'ollama':
          resolvedApiKey = clientApiKey || ''; // Ollama usually does not require a key
          break;
      }

      if (provider !== 'ollama' && !resolvedApiKey) {
        return res.status(401).json({
          error: `API Key for ${provider.toUpperCase()} is not set in the server's .env file and was not provided in the client settings.`,
        });
      }

      const messages = [...history, { role: 'user', content: prompt }];

      // 2. Query the respective provider via server-to-server request
      switch (provider) {
        case 'gemini': {
          const targetModel = model || 'gemini-2.5-flash';
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${resolvedApiKey}`;
          
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: messages.map((msg: any) => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }],
              })),
            }),
          });

          if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err?.error?.message || `Gemini API Error: ${response.statusText}`);
          }

          const data: any = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) throw new Error('No response content returned from Gemini.');
          return res.json({ text });
        }

        case 'openai': {
          const targetUrl = `${baseUrl || 'https://api.openai.com/v1'}/chat/completions`;
          const targetModel = model || 'gpt-4o-mini';

          const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${resolvedApiKey}`,
            },
            body: JSON.stringify({
              model: targetModel,
              messages: messages.map((msg: any) => ({
                role: msg.role === 'assistant' ? 'assistant' : 'user',
                content: msg.content,
              })),
            }),
          });

          if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err?.error?.message || `OpenAI API Error: ${response.statusText}`);
          }

          const data: any = await response.json();
          const text = data?.choices?.[0]?.message?.content || '';
          return res.json({ text });
        }

        case 'claude': {
          const targetUrl = 'https://api.anthropic.com/v1/messages';
          const targetModel = model || 'claude-3-5-sonnet-20241022';

          const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              'x-api-key': resolvedApiKey,
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
              model: targetModel,
              max_tokens: 1024,
              messages: messages.map((msg: any) => ({
                role: msg.role === 'assistant' ? 'assistant' : 'user',
                content: msg.content,
              })),
            }),
          });

          if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err?.error?.message || `Claude API Error: ${response.statusText}`);
          }

          const data: any = await response.json();
          const text = data?.content?.[0]?.text || '';
          return res.json({ text });
        }

        case 'openrouter': {
          const targetUrl = `${baseUrl || 'https://openrouter.ai/api/v1'}/chat/completions`;
          const targetModel = model || 'google/gemini-2.5-flash';

          const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${resolvedApiKey}`,
              'X-Title': 'Kali Linux Simulator Web OS',
            },
            body: JSON.stringify({
              model: targetModel,
              messages: messages.map((msg: any) => ({
                role: msg.role === 'assistant' ? 'assistant' : 'user',
                content: msg.content,
              })),
            }),
          });

          if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err?.error?.message || `OpenRouter API Error: ${response.statusText}`);
          }

          const data: any = await response.json();
          const text = data?.choices?.[0]?.message?.content || '';
          return res.json({ text });
        }

        case 'huggingface': {
          const targetModel = model || 'meta-llama/Llama-3.3-70B-Instruct';
          const targetUrl = `${baseUrl || 'https://api-inference.huggingface.co/models'}/${targetModel}`;

          const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${resolvedApiKey}`,
            },
            body: JSON.stringify({
              inputs: prompt,
              parameters: {
                max_new_tokens: 512,
                return_full_text: false,
              },
            }),
          });

          if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err?.error?.message || `Hugging Face API Error: ${response.statusText}`);
          }

          const data: any = await response.json();
          let text = '';
          if (Array.isArray(data) && data[0]?.generated_text) {
            text = data[0].generated_text;
          } else {
            text = JSON.stringify(data);
          }
          return res.json({ text });
        }

        case 'nvidia': {
          const targetUrl = `${baseUrl || 'https://integrate.api.nvidia.com/v1'}/chat/completions`;
          const targetModel = model || 'meta/llama-3.1-405b-instruct';

          const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${resolvedApiKey}`,
            },
            body: JSON.stringify({
              model: targetModel,
              messages: messages.map((msg: any) => ({
                role: msg.role === 'assistant' ? 'assistant' : 'user',
                content: msg.content,
              })),
              max_tokens: 1024,
            }),
          });

          if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err?.error?.message || `Nvidia API Error: ${response.statusText}`);
          }

          const data: any = await response.json();
          const text = data?.choices?.[0]?.message?.content || '';
          return res.json({ text });
        }

        case 'ollama': {
          // OFFLINE: Local Ollama runs on localhost. The server can proxy it or connect locally.
          const cleanBaseUrl = (baseUrl || 'http://localhost:11434').replace(/\/$/, '');
          const url = `${cleanBaseUrl}/api/chat`;

          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: model || 'llama3',
              messages: messages.map((msg: any) => ({
                role: msg.role === 'assistant' ? 'assistant' : 'user',
                content: msg.content,
              })),
              stream: false,
            }),
          });

          if (!response.ok) {
            throw new Error(`Ollama Error: Failed to connect to ${cleanBaseUrl}. Make sure your local Ollama is running and CORS is enabled.`);
          }

          const data: any = await response.json();
          const text = data?.message?.content || '';
          return res.json({ text });
        }

        default:
          return res.status(400).json({ error: `Unknown provider: ${provider}` });
      }
    } catch (err: any) {
      console.error('Server-side AI Proxy Error:', err);
      return res.status(500).json({ error: err.message || 'An internal server error occurred.' });
    }
  });

  // ==========================================
  // VITE DEVELOPMENT MIDDLEWARE / STATIC FILES
  // ==========================================

  if (process.env.NODE_ENV !== 'production') {
    // Development mode: Run Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built static files from /dist
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Kali Server] Listening on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer();
