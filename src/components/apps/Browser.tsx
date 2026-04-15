import React, { useState } from 'react';
import { Search, ArrowLeft, ArrowRight, RotateCw, Home } from 'lucide-react';

export const Browser: React.FC = () => {
  const [url, setUrl] = useState('https://www.kali.org');
  const [inputUrl, setInputUrl] = useState('https://www.kali.org');
  const [isLoading, setIsLoading] = useState(false);

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
          <button className="p-1.5 rounded hover:bg-white/10 disabled:opacity-50">
            <ArrowLeft size={16} />
          </button>
          <button className="p-1.5 rounded hover:bg-white/10 disabled:opacity-50">
            <ArrowRight size={16} />
          </button>
          <button 
            className="p-1.5 rounded hover:bg-white/10"
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
            className="bg-transparent outline-none border-none text-sm w-full text-white"
            placeholder="Search or enter web address"
          />
        </form>
      </div>

      {/* Browser Content */}
      <div className="flex-1 bg-white relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
            <RotateCw size={32} className="animate-spin text-blue-500" />
          </div>
        )}
        <iframe 
          src={url} 
          className="w-full h-full border-none"
          title="Browser"
          onLoad={() => setIsLoading(false)}
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      </div>
    </div>
  );
};
