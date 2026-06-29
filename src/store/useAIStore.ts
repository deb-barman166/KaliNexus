import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AIProvider = 'gemini' | 'openai' | 'claude' | 'openrouter' | 'huggingface' | 'nvidia' | 'ollama';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  baseUrl: string; // Used for Ollama or custom endpoints
}

interface AIState {
  configs: Record<AIProvider, AIConfig>;
  activeProvider: AIProvider;
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }>;
  setActiveProvider: (provider: AIProvider) => void;
  updateConfig: (provider: AIProvider, updates: Partial<AIConfig>) => void;
  addChatMessage: (role: 'user' | 'assistant', content: string) => void;
  clearChatHistory: () => void;
}

const defaultConfigs: Record<AIProvider, AIConfig> = {
  gemini: {
    provider: 'gemini',
    apiKey: '',
    model: 'gemini-2.5-flash',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
  },
  openai: {
    provider: 'openai',
    apiKey: '',
    model: 'gpt-4o-mini',
    baseUrl: 'https://api.openai.com/v1',
  },
  claude: {
    provider: 'claude',
    apiKey: '',
    model: 'claude-3-5-sonnet-20241022',
    baseUrl: 'https://api.anthropic.com/v1',
  },
  openrouter: {
    provider: 'openrouter',
    apiKey: '',
    model: 'google/gemini-2.5-flash',
    baseUrl: 'https://openrouter.ai/api/v1',
  },
  huggingface: {
    provider: 'huggingface',
    apiKey: '',
    model: 'meta-llama/Llama-3.3-70B-Instruct',
    baseUrl: 'https://api-inference.huggingface.co/models',
  },
  nvidia: {
    provider: 'nvidia',
    apiKey: '',
    model: 'meta/llama-3.1-405b-instruct',
    baseUrl: 'https://integrate.api.nvidia.com/v1',
  },
  ollama: {
    provider: 'ollama',
    apiKey: '',
    model: 'llama3',
    baseUrl: 'http://localhost:11434',
  },
};

export const useAIStore = create<AIState>()(
  persist(
    (set) => ({
      configs: defaultConfigs,
      activeProvider: 'gemini',
      chatHistory: [],
      setActiveProvider: (provider) => set({ activeProvider: provider }),
      updateConfig: (provider, updates) => set((state) => ({
        configs: {
          ...state.configs,
          [provider]: { ...state.configs[provider], ...updates },
        },
      })),
      addChatMessage: (role, content) => set((state) => ({
        chatHistory: [...state.chatHistory, { role, content, timestamp: new Date().toLocaleTimeString() }],
      })),
      clearChatHistory: () => set({ chatHistory: [] }),
    }),
    {
      name: 'kali-web-ai-config',
    }
  )
);
