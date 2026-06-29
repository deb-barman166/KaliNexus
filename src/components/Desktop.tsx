import React from 'react';
import { Rnd } from 'react-rnd';
import { useSystemStore } from '../store/useSystemStore';
import { Taskbar } from './Taskbar';
import { Window } from './Window';
import { Terminal } from './apps/Terminal';
import { FileExplorer } from './apps/FileExplorer';
import { Browser } from './apps/Browser';
import { TextEditor } from './apps/TextEditor';
import { Settings } from './apps/Settings';
import { AIAssistant } from './apps/AIAssistant';

const APPS = {
  terminal: Terminal,
  fileExplorer: FileExplorer,
  browser: Browser,
  textEditor: TextEditor,
  settings: Settings,
  aiAssistant: AIAssistant,
};

const DESKTOP_ICONS = [
  {
    id: 'terminal',
    title: 'Terminal',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Kali-dragon-icon.svg',
    component: 'terminal',
    allowMultiple: true
  },
  {
    id: 'aiAssistant',
    title: 'AI Assistant',
    icon: 'https://cdn-icons-png.flaticon.com/512/2103/2103832.png',
    component: 'aiAssistant',
    allowMultiple: false
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

export const Desktop: React.FC = () => {
  const { windows, openWindow, desktopIcons, updateIconPosition } = useSystemStore();

  return (
    <div 
      className="w-full h-screen overflow-hidden flex flex-col bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070&auto=format&fit=crop)' }}
    >
      {/* Desktop Area */}
      <div className="flex-1 relative w-full h-full">
        {/* Desktop Icons */}
        {DESKTOP_ICONS.map((app, index) => {
          const pos = desktopIcons[app.id] || { x: 20, y: 20 + index * 100 };
          return (
            <Rnd
              key={app.id}
              position={pos}
              onDragStop={(e, d) => {
                if (d.x !== pos.x || d.y !== pos.y) {
                  updateIconPosition(app.id, d.x, d.y);
                }
              }}
              bounds="parent"
              enableResizing={false}
              className="z-0"
            >
              <div
                className="w-20 flex flex-col items-center gap-1 p-2 rounded hover:bg-white/10 cursor-pointer group transition-colors"
                onDoubleClick={() => openWindow(app.id, app.title, app.icon, app.component, app.allowMultiple)}
                onClick={(e) => {
                  if (window.matchMedia('(pointer: coarse)').matches) {
                    openWindow(app.id, app.title, app.icon, app.component, app.allowMultiple);
                  }
                }}
              >
                <img src={app.icon} alt={app.title} className="w-10 h-10 drop-shadow-lg group-hover:scale-105 transition-transform pointer-events-none" />
                <span className="text-xs text-white font-medium text-center drop-shadow-md bg-black/30 px-1 rounded pointer-events-none">
                  {app.title}
                </span>
              </div>
            </Rnd>
          );
        })}

        {/* Windows */}
        {windows.map((w) => {
          const AppComponent = APPS[w.component as keyof typeof APPS];
          return (
            <Window key={w.id} id={w.id} title={w.title} icon={w.icon}>
              {AppComponent ? <AppComponent {...(w.props || {})} /> : <div className="p-4 text-white">App not found</div>}
            </Window>
          );
        })}
      </div>

      {/* Taskbar */}
      <Taskbar />
    </div>
  );
};
