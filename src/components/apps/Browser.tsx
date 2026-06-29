import React, { useState } from 'react';
import { Search, ArrowLeft, ArrowRight, RotateCw, Home, WifiOff } from 'lucide-react';
import { useSystemStore } from '../../store/useSystemStore';

export const Browser: React.FC = () => {
  const [url, setUrl] = useState('https://www.kali.org');
  const [inputUrl, setInputUrl] = useState('https://www.kali.org');
  const [isLoading, setIsLoading] = useState(false);
  const { isOnline, setIsOnline } = useSystemStore();

  const handleNavigate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let targetUrl = inputUrl;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
      setInputUrl(targetUrl);
    }
    setIsLoading(true);
    setUrl(targetUrl);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-gray-300">
      {/* Browser Toolbar */}
      <div className="flex items-center gap-2 p-2 bg-[#2d2d2d] border-b border-[#333]">
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded hover:bg-white/10 disabled:opacity-50" disabled={!isOnline}>
            <ArrowLeft size={16} />
          </button>
          <button className="p-1.5 rounded hover:bg-white/10 disabled:opacity-50" disabled={!isOnline}>
            <ArrowRight size={16} />
          </button>
          <button 
            className="p-1.5 rounded hover:bg-white/10"
            disabled={!isOnline}
            onClick={() => { setIsLoading(true); setTimeout(() => setIsLoading(false), 500); }}
          >
            <RotateCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button 
            className="p-1.5 rounded hover:bg-white/10"
            onClick={() => { setInputUrl('https://www.kali.org'); setUrl('https://www.kali.org'); }}
          >
            <Home size={16} />
          </button>
        </div>

        <form onSubmit={handleNavigate} className="flex-1 flex items-center gap-2 bg-[#1a1a1a] px-3 py-1.5 rounded-full border border-[#444] focus-within:border-blue-500 transition-colors">
          <Search size={14} className="text-gray-400" />
          <input 
            type="text" 
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="bg-transparent outline-none border-none text-sm w-full text-white disabled:opacity-60"
            placeholder={isOnline ? "Search or enter web address" : "Network offline - Address routing disabled"}
            disabled={!isOnline}
          />
        </form>
      </div>

      {/* Browser Content */}
      <div className="flex-1 bg-white relative">
        {isLoading && isOnline && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
            <RotateCw size={32} className="animate-spin text-blue-500" />
          </div>
        )}

        {!isOnline ? (
          <div className="w-full h-full bg-[#111218] flex flex-col items-center justify-center text-center p-6 text-gray-300 select-none">
            <div className="bg-[#1b1c24] border border-red-500/20 p-8 rounded-lg max-w-md shadow-2xl flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-red-950/40 flex items-center justify-center border border-red-500/30 mb-4 animate-bounce">
                <WifiOff size={28} className="text-red-400" />
              </div>
              <h2 className="text-lg font-bold text-red-400 mb-2 uppercase tracking-widest">Network Offline</h2>
              <p className="text-xs text-gray-400 leading-relaxed mb-6">
                Live Internet address routing is currently offline. You cannot load external websites or query cloud endpoints.
              </p>
              
              <div className="bg-black/30 p-4 rounded text-left border border-white/5 mb-6 w-full">
                <span className="text-[11px] font-mono text-cyan-400">$ ping -c 1 github.com</span>
                <p className="text-[11px] text-red-400 font-mono mt-1">ping: github.com: Name or service not known</p>
              </div>

              <button 
                onClick={() => setIsOnline(true)}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/60 bg-cyan-950/20 px-4 py-2 rounded transition-all cursor-pointer"
              >
                Toggle Online Mode
              </button>
            </div>
          </div>
        ) : (
          <iframe 
            src={url} 
            className="w-full h-full border-none bg-white"
            title="Browser"
            onLoad={() => setIsLoading(false)}
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        )}
      </div>
    </div>
  );
};
