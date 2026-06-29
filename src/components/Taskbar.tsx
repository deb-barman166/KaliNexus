import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Wifi, WifiOff, Battery, Volume2, ChevronUp } from 'lucide-react';
import { useSystemStore } from '../store/useSystemStore';

const START_MENU_APPS = [
  {
    id: 'terminal',
    title: 'Terminal',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Kali-dragon-icon.svg',
    component: 'terminal',
    allowMultiple: true
  },
  {
    id: 'fileExplorer',
    title: 'File System',
    icon: 'https://cdn-icons-png.flaticon.com/512/3767/3767084.png',
    component: 'fileExplorer',
    allowMultiple: true
  },
  {
    id: 'browser',
    title: 'Web Browser',
    icon: 'https://cdn-icons-png.flaticon.com/512/3003/3003511.png',
    component: 'browser',
    allowMultiple: true
  },
  {
    id: 'textEditor',
    title: 'Text Editor',
    icon: 'https://cdn-icons-png.flaticon.com/512/888/888883.png',
    component: 'textEditor',
    allowMultiple: true
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: 'https://cdn-icons-png.flaticon.com/512/3132/3132084.png',
    component: 'settings',
    allowMultiple: false
  }
];

export const Taskbar: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [isStartOpen, setIsStartOpen] = useState(false);
  const { windows, activeWindowId, focusWindow, minimizeWindow, openWindow, isOnline, setIsOnline } = useSystemStore();
  const startMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (startMenuRef.current && !startMenuRef.current.contains(event.target as Node)) {
        setIsStartOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleWindowClick = (id: string, isMinimized: boolean) => {
    if (activeWindowId === id && !isMinimized) {
      minimizeWindow(id);
    } else {
      focusWindow(id);
    }
  };

  return (
    <div className="h-10 bg-[#1a1b26]/90 backdrop-blur-md border-t border-[#2a2b3d] flex items-center justify-between px-2 z-[9999] relative select-none">
      {/* Left side - Start button & open apps */}
      <div className="flex items-center h-full gap-1" ref={startMenuRef}>
        <button 
          onClick={() => setIsStartOpen(!isStartOpen)}
          className={`h-8 w-10 flex items-center justify-center hover:bg-white/10 rounded transition-colors group ${isStartOpen ? 'bg-white/10' : ''}`}
        >
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/2/2b/Kali-dragon-icon.svg" 
            alt="Kali" 
            className="w-5 h-5 group-hover:scale-110 transition-transform"
          />
        </button>
        
        {isStartOpen && (
          <div className="absolute bottom-10 left-0 w-64 bg-[#1e1e1e] border border-[#333] rounded-tr-lg shadow-2xl flex flex-col py-2 z-[10000]">
            <div className="px-4 py-2 text-xs text-gray-500 font-semibold uppercase tracking-wider border-b border-[#333] mb-2">
              Applications
            </div>
            {START_MENU_APPS.map(app => (
              <button 
                key={app.id}
                onClick={() => {
                  openWindow(app.id, app.title, app.icon, app.component, app.allowMultiple);
                  setIsStartOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-2 hover:bg-blue-600 hover:text-white text-left transition-colors"
              >
                <img src={app.icon} className="w-6 h-6" alt={app.title} />
                <span className="text-sm text-gray-200">{app.title}</span>
              </button>
            ))}
          </div>
        )}
        
        <div className="w-px h-5 bg-white/10 mx-1" />

        <div className="flex items-center gap-1">
          {windows.map((w) => (
            <button
              key={w.id}
              onClick={() => handleWindowClick(w.id, w.isMinimized)}
              className={`h-8 px-3 flex items-center gap-2 rounded transition-all max-w-[150px]
                ${activeWindowId === w.id && !w.isMinimized 
                  ? 'bg-white/15 shadow-inner border-b-2 border-blue-500' 
                  : 'hover:bg-white/10 border-b-2 border-transparent'}`}
            >
              <img src={w.icon} alt={w.title} className="w-4 h-4" />
              <span className="text-xs text-gray-200 truncate">{w.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right side - System tray */}
      <div className="flex items-center h-full gap-2 text-gray-300">
        <button className="p-1.5 hover:bg-white/10 rounded transition-colors">
          <ChevronUp size={16} />
        </button>
        <button 
          onClick={() => setIsOnline(!isOnline)}
          className={`p-1 flex items-center gap-1 px-2 rounded transition-all text-xs border border-transparent select-none cursor-pointer ${
            isOnline 
              ? 'text-green-400 bg-green-500/10 hover:bg-green-500/25 border-green-500/20 hover:border-green-500/40' 
              : 'text-red-400 bg-red-500/10 hover:bg-red-500/25 border-red-500/20 hover:border-red-500/40'
          }`}
          title={isOnline ? "Internet: Connected (Click to Go Offline)" : "Internet: Disconnected (Click to Go Online)"}
        >
          {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
          <span className="text-[10px] font-bold uppercase tracking-wider">{isOnline ? 'Online' : 'Offline'}</span>
        </button>
        <button className="p-1.5 hover:bg-white/10 rounded transition-colors">
          <Volume2 size={14} />
        </button>
        <button className="p-1.5 hover:bg-white/10 rounded transition-colors flex items-center gap-1">
          <Battery size={14} />
          <span className="text-xs">100%</span>
        </button>
        <div className="px-2 py-1 hover:bg-white/10 rounded transition-colors cursor-default text-xs flex flex-col items-end justify-center">
          <span>{format(time, 'HH:mm')}</span>
          <span className="text-[10px] text-gray-400">{format(time, 'dd/MM/yyyy')}</span>
        </div>
      </div>
    </div>
  );
};
