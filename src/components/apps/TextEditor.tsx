import React, { useState, useEffect } from 'react';
import { Save, FileText } from 'lucide-react';
import { useFileSystemStore } from '../../store/useFileSystemStore';

export const TextEditor: React.FC<{ filePath?: string }> = ({ filePath }) => {
  const { currentPath, writeFile, readFile } = useFileSystemStore();
  
  const initialFilename = filePath ? filePath.split('/').pop() || 'untitled.txt' : 'untitled.txt';
  const [content, setContent] = useState('');
  const [filename, setFilename] = useState(initialFilename);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    if (filePath) {
      const fileContent = readFile(filePath);
      if (fileContent !== null) {
        setContent(fileContent);
      }
    }
  }, [filePath, readFile]);

  const handleSave = () => {
    const dir = filePath ? filePath.split('/').slice(0, -1).join('/') : currentPath;
    const path = `${dir}/${filename}`.replace('//', '/');
    const success = writeFile(path, content);
    if (success) {
      setSaveStatus('Saved successfully');
      setTimeout(() => setSaveStatus(''), 2000);
    } else {
      setSaveStatus('Error saving file');
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-gray-300">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 bg-[#2d2d2d] border-b border-[#333]">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-blue-400" />
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            className="bg-transparent outline-none border-b border-transparent focus:border-blue-500 text-sm px-1"
            placeholder="Filename"
          />
        </div>
        <div className="flex items-center gap-3">
          {saveStatus && <span className="text-xs text-green-400">{saveStatus}</span>}
          <button 
            onClick={handleSave}
            className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded transition-colors"
          >
            <Save size={14} />
            Save
          </button>
        </div>
      </div>

      {/* Editor */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 bg-[#1e1e1e] text-gray-300 p-4 outline-none resize-none font-mono text-sm"
        placeholder="Start typing..."
        spellCheck={false}
      />
    </div>
  );
};
