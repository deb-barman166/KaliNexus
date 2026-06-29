import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, Key, Settings, Loader2, Cpu, Copy, Check, Terminal } from 'lucide-react';
import { useAIStore, AIProvider } from '../../store/useAIStore';
import { queryAI } from '../../utils/aiService';

const PROVIDER_NAMES: Record<AIProvider, string> = {
  gemini: 'Google Gemini',
  openai: 'OpenAI GPT',
  claude: 'Anthropic Claude',
  openrouter: 'OpenRouter',
  huggingface: 'Hugging Face',
  nvidia: 'Nvidia NIM',
  ollama: 'Local Ollama',
};

const DEFAULT_MODELS: Record<AIProvider, string[]> = {
  gemini: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-flash'],
  openai: ['gpt-4o-mini', 'gpt-4o', 'o1-mini'],
  claude: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
  openrouter: ['google/gemini-2.5-flash', 'meta-llama/llama-3.3-70b-instruct', 'deepseek/deepseek-chat'],
  huggingface: ['meta-llama/Llama-3.3-70B-Instruct', 'mistralai/Mistral-7B-Instruct-v0.3'],
  nvidia: ['meta/llama-3.1-405b-instruct', 'nvidia/llama-3.1-nemotron-70b-instruct'],
  ollama: ['llama3', 'llama3.1', 'mistral', 'codellama', 'phi3'],
};

import { useSystemStore } from '../../store/useSystemStore';

export const AIAssistant: React.FC = () => {
  const { configs, activeProvider, chatHistory, setActiveProvider, updateConfig, addChatMessage, clearChatHistory } = useAIStore();
  const isOnline = useSystemStore((state) => state.isOnline);
  const [envKeysLoaded, setEnvKeysLoaded] = useState<Record<string, boolean>>({});
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentConfig = configs[activeProvider];
  const hasKey = !isOnline || activeProvider === 'ollama' || !!currentConfig.apiKey || !!envKeysLoaded[activeProvider];

  useEffect(() => {
    // Check which keys are pre-loaded in .env server-side
    fetch('/api/ai-config')
      .then(res => res.json())
      .catch(() => ({}))
      .then(data => setEnvKeysLoaded(data || {}));
  }, [activeProvider]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    addChatMessage('user', userMessage);
    setLoading(true);
    setStatusMessage(null);

    try {
      const response = await queryAI(activeProvider, currentConfig, userMessage, chatHistory);
      addChatMessage('assistant', response);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'An error occurred during query.' });
      addChatMessage('assistant', `⚠️ Error: ${err.message || 'Failed to get response from AI provider.'}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#111] text-gray-200 font-sans relative">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between p-3 bg-[#1e1e1e] border-b border-[#333] shadow-md">
        <div className="flex items-center gap-2">
          <Cpu className="text-cyan-400 w-5 h-5 animate-pulse" />
          <span className="font-bold tracking-wider text-cyan-400 text-sm uppercase hidden sm:inline">Kali AI Assistant</span>
          {!isOnline ? (
            <span className="text-[10px] bg-red-950/40 text-red-400 border border-red-900/40 px-1.5 py-0.5 rounded font-mono font-bold uppercase">Offline Mode</span>
          ) : envKeysLoaded[activeProvider] ? (
            <span className="text-[10px] bg-green-950/40 text-green-400 border border-green-900/40 px-1.5 py-0.5 rounded font-mono font-bold uppercase">🔑 .env Loaded</span>
          ) : activeProvider === 'ollama' ? (
            <span className="text-[10px] bg-blue-950/40 text-blue-400 border border-blue-900/40 px-1.5 py-0.5 rounded font-mono font-bold uppercase">Local Endpoint</span>
          ) : currentConfig.apiKey ? (
            <span className="text-[10px] bg-cyan-950/40 text-cyan-400 border border-cyan-900/40 px-1.5 py-0.5 rounded font-mono font-bold uppercase">🔑 Browser Key</span>
          ) : (
            <span className="text-[10px] bg-yellow-950/40 text-yellow-400 border border-yellow-900/40 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider animate-pulse">🔑 Key Required</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Provider Select */}
          <select
            value={activeProvider}
            onChange={(e) => {
              setActiveProvider(e.target.value as AIProvider);
              setStatusMessage(null);
            }}
            className="bg-[#2a2a2a] text-gray-200 border border-[#444] rounded px-2.5 py-1 text-xs outline-none focus:border-cyan-500 cursor-pointer"
          >
            {Object.entries(PROVIDER_NAMES).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>

          {/* Action Buttons */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded text-gray-400 hover:text-cyan-400 hover:bg-[#2a2a2a] transition-all ${showSettings ? 'text-cyan-400 bg-[#2a2a2a]' : ''}`}
            title="API Settings"
          >
            <Settings size={16} />
          </button>
          <button
            onClick={clearChatHistory}
            className="p-1.5 rounded text-gray-400 hover:text-red-400 hover:bg-[#2a2a2a] transition-all"
            title="Clear Chat History"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Settings Panel (Overlay sidebar style) */}
        {showSettings && (
          <div className="absolute inset-y-0 right-0 w-80 bg-[#1a1a1a] border-l border-[#333] shadow-2xl p-4 flex flex-col gap-4 z-20 overflow-y-auto transform transition-all duration-300">
            <div className="flex items-center justify-between border-b border-[#333] pb-2">
              <span className="text-sm font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Key size={14} /> {PROVIDER_NAMES[activeProvider]} Config
              </span>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-[#2d2d2d]">Close</button>
            </div>

            {/* API Key */}
            {activeProvider !== 'ollama' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-medium">API Key / Token</label>
                <input
                  type="password"
                  placeholder={`Enter ${PROVIDER_NAMES[activeProvider]} API Key`}
                  value={currentConfig.apiKey}
                  onChange={(e) => updateConfig(activeProvider, { apiKey: e.target.value })}
                  className="bg-[#2a2a2a] text-gray-100 border border-[#444] rounded px-3 py-1.5 text-xs outline-none focus:border-cyan-500 w-full font-mono"
                />
                <p className="text-[10px] text-gray-500">Keys are stored locally in your browser storage.</p>
              </div>
            )}

            {/* Base URL (if customisable or Ollama) */}
            {(activeProvider === 'ollama' || activeProvider === 'openai' || activeProvider === 'openrouter') && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-medium">Base URL</label>
                <input
                  type="text"
                  placeholder="Base endpoint URL"
                  value={currentConfig.baseUrl}
                  onChange={(e) => updateConfig(activeProvider, { baseUrl: e.target.value })}
                  className="bg-[#2a2a2a] text-gray-100 border border-[#444] rounded px-3 py-1.5 text-xs outline-none focus:border-cyan-500 w-full font-mono"
                />
              </div>
            )}

            {/* Model Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-medium">Model Name</label>
              <div className="flex gap-1">
                <input
                  type="text"
                  placeholder="Model identifier"
                  value={currentConfig.model}
                  onChange={(e) => updateConfig(activeProvider, { model: e.target.value })}
                  className="flex-1 bg-[#2a2a2a] text-gray-100 border border-[#444] rounded px-3 py-1.5 text-xs outline-none focus:border-cyan-500 font-mono"
                />
              </div>
              
              <div className="flex flex-wrap gap-1 mt-1">
                {DEFAULT_MODELS[activeProvider]?.map((modelName) => (
                  <button
                    key={modelName}
                    onClick={() => updateConfig(activeProvider, { model: modelName })}
                    className={`text-[10px] px-2 py-0.5 rounded border transition-all ${
                      currentConfig.model === modelName
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                        : 'bg-[#2a2a2a] text-gray-400 border-[#333] hover:border-gray-500'
                    }`}
                  >
                    {modelName.split('/').pop()}
                  </button>
                ))}
              </div>
            </div>

            {activeProvider === 'ollama' && (
              <div className="bg-[#252525] p-3 rounded border border-cyan-500/20 text-[11px] text-gray-400 flex flex-col gap-1.5">
                <span className="font-semibold text-cyan-400 flex items-center gap-1">
                  <Terminal size={12} /> Local Ollama Notes
                </span>
                <p>Ensure Ollama is running on your machine and CORS is enabled:</p>
                <code className="bg-[#111] p-1.5 rounded text-cyan-300 select-all font-mono break-all text-[10px]">
                  OLLAMA_ORIGINS="*" ollama serve
                </code>
              </div>
            )}
          </div>
        )}

        {/* Chat History Panel */}
        <div className="flex-1 flex flex-col h-full bg-[#111] relative">
          {/* Status Overlay */}
          {statusMessage && (
            <div className={`p-2.5 text-xs text-center border-b ${
              statusMessage.type === 'error' ? 'bg-red-950/40 border-red-800/30 text-red-300' : 'bg-green-950/40 border-green-800/30 text-green-300'
            }`}>
              {statusMessage.text}
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
                <Bot className="w-16 h-16 text-[#333] mb-3 animate-pulse" />
                <h3 className="text-base font-semibold text-gray-400">Welcome to Kali AI Assistant</h3>
                <p className="text-xs text-gray-500 max-w-sm mt-1">
                  Configure your preferred provider (Gemini, OpenRouter, GPT, Claude, Nvidia NIM, Hugging Face, or Local Ollama) using the settings icon.
                </p>
                {activeProvider !== 'ollama' && !currentConfig.apiKey && (
                  <button
                    onClick={() => setShowSettings(true)}
                    className="mt-4 px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold tracking-wide flex items-center gap-1.5 transition-colors shadow-md"
                  >
                    <Key size={12} /> Configure API Key
                  </button>
                )}
              </div>
            ) : (
              chatHistory.map((msg, index) => {
                const isAssistant = msg.role === 'assistant';
                return (
                  <div
                    key={index}
                    className={`flex gap-3 max-w-4xl ${isAssistant ? '' : 'ml-auto flex-row-reverse'}`}
                  >
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 shadow-md ${
                      isAssistant ? 'bg-cyan-950 border border-cyan-500/40 text-cyan-400' : 'bg-purple-950 border border-purple-500/40 text-purple-400'
                    }`}>
                      {isAssistant ? <Bot size={16} /> : <User size={16} />}
                    </div>

                    {/* Content Bubble */}
                    <div className={`flex flex-col max-w-[85%] rounded p-3 text-sm relative group ${
                      isAssistant 
                        ? 'bg-[#1b1b1b] border border-[#2d2d2d] text-gray-200' 
                        : 'bg-[#2a1b35] border border-purple-900/40 text-gray-100'
                    }`}>
                      {/* Copy Button */}
                      <button
                        onClick={() => copyToClipboard(msg.content, index)}
                        className="absolute top-2 right-2 p-1 rounded bg-[#2a2a2a] hover:bg-[#3d3d3d] text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Copy message"
                      >
                        {copiedIndex === index ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                      </button>

                      {/* Header (Role + Time) */}
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-1.5">
                        <span className="font-semibold uppercase tracking-wider">
                          {isAssistant ? 'KALI-AI' : 'USER'}
                        </span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </div>

                      {/* Message Body */}
                      <div className="leading-relaxed break-words whitespace-pre-wrap font-mono text-[13px]">
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded flex items-center justify-center bg-cyan-950 border border-cyan-500/40 text-cyan-400 shrink-0">
                  <Bot size={16} className="animate-spin" />
                </div>
                <div className="bg-[#1b1b1b] border border-[#2d2d2d] rounded p-3 text-sm flex items-center gap-2 text-gray-400 font-mono text-[13px]">
                  <Loader2 size={14} className="animate-spin text-cyan-400" />
                  Generating secure terminal payload...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSend} className="p-3 bg-[#1e1e1e] border-t border-[#333] flex gap-2 items-center">
            <input
              type="text"
              placeholder={
                !hasKey
                  ? "🔒 Please configure your API key first..."
                  : !isOnline
                  ? "🔌 Offline Mode Active (Local AI Guides available)"
                  : `Ask Kali AI Assistant (${currentConfig.model})...`
              }
              disabled={!hasKey}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-[#111] text-gray-200 border border-[#333] rounded px-3 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || (!input.trim()) || !hasKey}
              className="p-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-800 disabled:opacity-50 text-white rounded transition-colors shadow-md flex items-center justify-center"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
