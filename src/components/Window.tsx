import React from 'react';
import { Rnd } from 'react-rnd';
import { X, Minus, Square } from 'lucide-react';
import { useSystemStore } from '../store/useSystemStore';

interface WindowProps {
  id: string;
  title: string;
  icon?: string;
  children: React.ReactNode;
}

export const Window: React.FC<WindowProps> = ({ id, title, icon, children }) => {
  const windowState = useSystemStore((state) => state.windows.find((w) => w.id === id));
  const { closeWindow, minimizeWindow, maximizeWindow, focusWindow, updateWindowPosition, updateWindowSize, activeWindowId } = useSystemStore();

  if (!windowState || windowState.isMinimized) return null;

  const isActive = activeWindowId === id;

  return (
    <Rnd
      size={{ width: windowState.width, height: windowState.height }}
      position={{ x: windowState.x, y: windowState.y }}
      onDragStop={(e, d) => {
        if (d.x !== windowState.x || d.y !== windowState.y) {
          updateWindowPosition(id, d.x, d.y);
        }
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        updateWindowSize(id, ref.style.width, ref.style.height);
        updateWindowPosition(id, position.x, position.y);
      }}
      minWidth={300}
      minHeight={200}
      bounds="parent"
      dragHandleClassName="window-handle"
      disableDragging={windowState.isMaximized}
      enableResizing={!windowState.isMaximized}
      style={{
        zIndex: windowState.zIndex,
        display: windowState.isOpen ? 'flex' : 'none',
      }}
      className={`absolute flex flex-col bg-[#1e1e1e] border ${isActive ? 'border-[#4a4a4a] shadow-2xl' : 'border-[#333] shadow-lg'} rounded-t-lg overflow-hidden transition-shadow duration-200 ${windowState.isMaximized ? '!w-full !h-[calc(100%-40px)] !top-0 !left-0 !transform-none' : ''}`}
      onMouseDown={() => focusWindow(id)}
    >
      {/* Title Bar */}
      <div className="window-handle flex items-center justify-between bg-[#2d2d2d] px-3 py-2 cursor-move select-none">
        <div className="flex items-center gap-2 text-gray-300">
          {icon && <img src={icon} alt="icon" className="w-4 h-4" />}
          <span className="text-sm font-medium tracking-wide">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); minimizeWindow(id); }}
            className="p-1 hover:bg-[#444] rounded text-gray-400 hover:text-white transition-colors"
          >
            <Minus size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); maximizeWindow(id); }}
            className="p-1 hover:bg-[#444] rounded text-gray-400 hover:text-white transition-colors"
          >
            <Square size={12} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); closeWindow(id); }}
            className="p-1 hover:bg-red-500 rounded text-gray-400 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-[#121212] relative">
        {children}
        {!isActive && <div className="absolute inset-0 bg-transparent z-10" />}
      </div>
    </Rnd>
  );
};
