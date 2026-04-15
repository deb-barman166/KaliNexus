import React, { useState, useRef, useEffect } from 'react';
import { Folder, File, ChevronRight, ChevronLeft, Home, HardDrive, Upload, Download, Trash2, Edit2, Link as LinkIcon } from 'lucide-react';
import { useFileSystemStore } from '../../store/useFileSystemStore';
import { useSystemStore } from '../../store/useSystemStore';

export const FileExplorer: React.FC = () => {
  const { currentPath, setCurrentPath, readDir, getFile, renameNode, rm, writeFile, mkdir, createSymlink } = useFileSystemStore();
  const { openWindow } = useSystemStore();
  const [history, setHistory] = useState<string[]>([currentPath]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: string | null } | null>(null);
  const [renamingItem, setRenamingItem] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(path);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const openItem = (itemName: string) => {
    const itemPath = currentPath === '/' ? `/${itemName}` : `${currentPath}/${itemName}`;
    const node = getFile(itemPath);
    
    if (node?.type === 'dir') {
      handleNavigate(itemPath);
    } else if (node?.type === 'file') {
      openWindow('textEditor', 'Text Editor', 'https://cdn-icons-png.flaticon.com/512/888/888883.png', 'textEditor', true, { filePath: itemPath });
    } else if (node?.type === 'symlink' && node.target) {
      const targetNode = getFile(node.target);
      if (targetNode?.type === 'dir') {
        handleNavigate(node.target);
      } else if (targetNode?.type === 'file') {
        openWindow('textEditor', 'Text Editor', 'https://cdn-icons-png.flaticon.com/512/888/888883.png', 'textEditor', true, { filePath: node.target });
      }
    }
  };

  const goBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentPath(history[historyIndex - 1]);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentPath(history[historyIndex + 1]);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, itemName: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, item: itemName });
  };

  const handleRenameSubmit = (oldName: string) => {
    if (newName && newName !== oldName) {
      renameNode(`${currentPath}/${oldName}`, newName);
    }
    setRenamingItem(null);
  };

  const handleDelete = (itemName: string) => {
    rm(`${currentPath}/${itemName}`);
  };

  const handleDownload = (itemName: string) => {
    const node = getFile(`${currentPath}/${itemName}`);
    if (node && node.type === 'file' && node.content !== undefined) {
      const blob = new Blob([node.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = itemName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      alert('Downloading folders or shortcuts is not supported in this simulation yet.');
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        writeFile(`${currentPath}/${file.name}`, content);
      };
      reader.readAsText(file); // Reading as text for simulation simplicity
    }
  };

  const contents = readDir(currentPath) || {};

  return (
    <div 
      className="flex flex-col h-full bg-[#1e1e1e] text-gray-300 select-none relative"
      onContextMenu={(e) => handleContextMenu(e, null)}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 bg-[#2d2d2d] border-b border-[#333]">
        <button 
          onClick={goBack}
          disabled={historyIndex === 0}
          className="p-1 rounded hover:bg-white/10 disabled:opacity-50 disabled:hover:bg-transparent"
        >
          <ChevronLeft size={18} />
        </button>
        <button 
          onClick={goForward}
          disabled={historyIndex === history.length - 1}
          className="p-1 rounded hover:bg-white/10 disabled:opacity-50 disabled:hover:bg-transparent"
        >
          <ChevronRight size={18} />
        </button>
        
        <div className="flex-1 flex items-center gap-2 bg-[#1a1a1a] px-3 py-1 rounded border border-[#333]">
          <Home size={14} className="text-gray-400" />
          <input 
            type="text" 
            value={currentPath}
            readOnly
            className="bg-transparent outline-none border-none text-sm w-full"
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-48 bg-[#252526] border-r border-[#333] p-2 flex flex-col gap-1">
          <div className="text-xs font-semibold text-gray-500 mb-2 px-2 uppercase tracking-wider">Places</div>
          <button 
            onClick={() => handleNavigate('/home/kali')}
            className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-white/5 ${currentPath.startsWith('/home/kali') ? 'bg-blue-500/20 text-blue-400' : ''}`}
          >
            <Home size={16} />
            Home
          </button>
          <button 
            onClick={() => handleNavigate('/')}
            className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-white/5 ${currentPath === '/' ? 'bg-blue-500/20 text-blue-400' : ''}`}
          >
            <HardDrive size={16} />
            File System
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 overflow-auto bg-[#1e1e1e]">
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {Object.values(contents).map((item) => (
              <div 
                key={item.name}
                onClick={() => openItem(item.name)}
                onContextMenu={(e) => handleContextMenu(e, item.name)}
                // Support long press for mobile
                onTouchStart={(e) => {
                  const timer = setTimeout(() => handleContextMenu(e as any, item.name), 500);
                  e.currentTarget.dataset.timer = timer.toString();
                }}
                onTouchEnd={(e) => {
                  clearTimeout(Number(e.currentTarget.dataset.timer));
                }}
                className="flex flex-col items-center gap-2 p-2 rounded hover:bg-white/5 cursor-pointer group relative"
              >
                <div className="relative">
                  {item.type === 'dir' ? (
                    <Folder size={48} className="text-blue-400 group-hover:scale-105 transition-transform" />
                  ) : item.type === 'symlink' ? (
                    <div className="relative group-hover:scale-105 transition-transform">
                      <File size={48} className="text-gray-400" />
                      <LinkIcon size={16} className="absolute bottom-0 right-0 text-blue-400 bg-[#1e1e1e] rounded-full p-0.5" />
                    </div>
                  ) : (
                    <File size={48} className="text-gray-400 group-hover:scale-105 transition-transform" />
                  )}
                </div>
                
                {renamingItem === item.name ? (
                  <input
                    autoFocus
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onBlur={() => handleRenameSubmit(item.name)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(item.name)}
                    className="text-xs text-center bg-[#333] text-white px-1 outline-none w-full"
                  />
                ) : (
                  <span className="text-xs text-center break-all line-clamp-2">{item.name}</span>
                )}
              </div>
            ))}
            {Object.keys(contents).length === 0 && (
              <div className="col-span-full text-center text-gray-500 mt-10">
                Folder is empty
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="fixed bg-[#2d2d2d] border border-[#444] rounded shadow-xl py-1 z-50 min-w-[150px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {contextMenu.item ? (
            <>
              <button 
                className="w-full text-left px-4 py-1.5 text-sm hover:bg-blue-500 hover:text-white flex items-center gap-2"
                onClick={() => {
                  openItem(contextMenu.item!);
                  setContextMenu(null);
                }}
              >
                <Folder size={14} /> Open
              </button>
              <button 
                className="w-full text-left px-4 py-1.5 text-sm hover:bg-blue-500 hover:text-white flex items-center gap-2"
                onClick={() => {
                  setRenamingItem(contextMenu.item);
                  setNewName(contextMenu.item!);
                  setContextMenu(null);
                }}
              >
                <Edit2 size={14} /> Rename
              </button>
              <button 
                className="w-full text-left px-4 py-1.5 text-sm hover:bg-blue-500 hover:text-white flex items-center gap-2"
                onClick={() => {
                  const name = prompt('Shortcut Name:', `${contextMenu.item} - Shortcut`);
                  if (name) {
                    createSymlink(`${currentPath}/${contextMenu.item}`, `${currentPath}/${name}`);
                  }
                  setContextMenu(null);
                }}
              >
                <LinkIcon size={14} /> Create Shortcut
              </button>
              <button 
                className="w-full text-left px-4 py-1.5 text-sm hover:bg-blue-500 hover:text-white flex items-center gap-2"
                onClick={() => {
                  handleDownload(contextMenu.item!);
                  setContextMenu(null);
                }}
              >
                <Download size={14} /> Download
              </button>
              <div className="h-px bg-[#444] my-1" />
              <button 
                className="w-full text-left px-4 py-1.5 text-sm hover:bg-red-500 hover:text-white flex items-center gap-2 text-red-400"
                onClick={() => {
                  handleDelete(contextMenu.item!);
                  setContextMenu(null);
                }}
              >
                <Trash2 size={14} /> Delete
              </button>
            </>
          ) : (
            <>
              <button 
                className="w-full text-left px-4 py-1.5 text-sm hover:bg-blue-500 hover:text-white flex items-center gap-2"
                onClick={() => {
                  const name = prompt('New Folder Name:');
                  if (name) mkdir(`${currentPath}/${name}`);
                  setContextMenu(null);
                }}
              >
                <Folder size={14} /> New Folder
              </button>
              <button 
                className="w-full text-left px-4 py-1.5 text-sm hover:bg-blue-500 hover:text-white flex items-center gap-2"
                onClick={() => {
                  const name = prompt('New File Name:');
                  if (name) writeFile(`${currentPath}/${name}`, '');
                  setContextMenu(null);
                }}
              >
                <File size={14} /> New File
              </button>
              <div className="h-px bg-[#444] my-1" />
              <button 
                className="w-full text-left px-4 py-1.5 text-sm hover:bg-blue-500 hover:text-white flex items-center gap-2"
                onClick={() => {
                  fileInputRef.current?.click();
                  setContextMenu(null);
                }}
              >
                <Upload size={14} /> Upload File
              </button>
            </>
          )}
        </div>
      )}
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleUpload} 
        className="hidden" 
      />
    </div>
  );
};
