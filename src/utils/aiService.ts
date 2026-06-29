import { AIConfig, AIProvider } from '../store/useAIStore';
import { useSystemStore } from '../store/useSystemStore';
import { getOfflineAIResponse } from './offlineAi';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * ONLINE & OFFLINE COMBINED AI SERVICE
 * 
 * - ONLINE: Connects to the backend Express server-to-server proxy (/api/ai),
 *   which securely uses API keys defined in the server's .env file.
 * - OFFLINE: If the user is offline or selects offline mode, this service
 *   bypasses the server and returns smart, local cyber-security guides immediately.
 */
export async function queryAI(
  provider: AIProvider,
  config: AIConfig,
  prompt: string,
  history: ChatMessage[] = []
): Promise<string> {
  const isOnline = useSystemStore.getState().isOnline;

  // ==========================================
  // OFFLINE MODE: Fall back to local AI engine
  // ==========================================
  if (!isOnline) {
    // Return a rich, local simulated response without any network traffic
    return getOfflineAIResponse(prompt);
  }

  // ==========================================
  // ONLINE MODE: Request backend secure proxy
  // ==========================================
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      provider,
      model: config.model,
      prompt,
      history: history.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      })),
      apiKey: config.apiKey, // Sent only as a fallback if not configured in server's .env
      baseUrl: config.baseUrl,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.error || `API Error: Server returned ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.text;
}
