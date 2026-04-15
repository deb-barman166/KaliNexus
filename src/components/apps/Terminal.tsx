import React, { useState, useRef, useEffect } from 'react';
import { useFileSystemStore } from '../../store/useFileSystemStore';
import { executeCommand } from '../../utils/commands';
import { useSystemStore } from '../../store/useSystemStore';

export const Terminal: React.FC = () => {
  const { user } = useSystemStore();
  const [terminalUser, setTerminalUser] = useState(user.name);
  const [isPromptingPassword, setIsPromptingPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
  const [history, setHistory] = useState<{ command: string; output: React.ReactNode }[]>([
    {
      command: '',
      output: (
        <div className="text-blue-400 mb-2">
          <div>┌──({terminalUser}㉿kali)-[~]</div>
          <div>└─$ Welcome to Kali Web OS. Type 'help' to get started.</div>
        </div>
      ),
    },
  ]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { currentPath, setCurrentPath } = useFileSystemStore();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (isPromptingPassword) {
        const pass = passwordInput;
        setPasswordInput('');
        setIsPromptingPassword(false);
        
        if (pass === user.pass) {
          setTerminalUser('root');
          setHistory((prev) => [
            ...prev,
            { command: '', output: '' }
          ]);
        } else {
          setHistory((prev) => [
            ...prev,
            { command: '', output: <div className="text-red-400">su: Authentication failure</div> }
          ]);
        }
        return;
      }

      const cmd = input.trim();
      setInput('');
      
      if (cmd) {
        setCommandHistory((prev) => [...prev, cmd]);
        setHistoryIndex(-1);
        
        if (cmd.toLowerCase() === 'clear') {
          setHistory([]);
          return;
        }

        if (cmd.toLowerCase() === 'sudo su' || cmd.toLowerCase() === 'su') {
          setHistory((prev) => [
            ...prev,
            { command: cmd, output: <div>[sudo] password for {terminalUser}: </div> }
          ]);
          setIsPromptingPassword(true);
          return;
        }

        if (cmd.toLowerCase() === 'exit' && terminalUser === 'root') {
          setTerminalUser(user.name);
          setHistory((prev) => [
            ...prev,
            { command: cmd, output: <div>exit</div> }
          ]);
          return;
        }

        const output = await executeCommand(cmd, terminalUser, currentPath, setCurrentPath);
        
        setHistory((prev) => [
          ...prev,
          {
            command: cmd,
            output,
          },
        ]);
      } else {
        setHistory((prev) => [
          ...prev,
          {
            command: '',
            output: '',
          },
        ]);
      }
    } else if (e.key === 'ArrowUp' && !isPromptingPassword) {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown' && !isPromptingPassword) {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      }
    }
  };

  const displayPath = currentPath.replace(`/home/${user.name}`, '~');
  const promptChar = terminalUser === 'root' ? '#' : '$';
  const promptColor = terminalUser === 'root' ? 'text-red-500' : 'text-blue-400';

  return (
    <div 
      className="w-full h-full bg-[#0c0c0c] text-[#00ff00] font-mono text-sm p-2 overflow-auto"
      onClick={() => inputRef.current?.focus()}
    >
      {history.map((item, i) => (
        <div key={i} className="mb-1">
          {item.command && (
            <div className="flex gap-2 text-gray-300">
              <span className={promptColor}>┌──({terminalUser}㉿kali)-[{displayPath}]</span>
            </div>
          )}
          {item.command && (
            <div className="flex gap-2 text-gray-300 mb-1">
              <span className={promptColor}>└─{promptChar}</span>
              <span className="text-white">{item.command}</span>
            </div>
          )}
          <div className="whitespace-pre-wrap break-words">{item.output}</div>
        </div>
      ))}
      
      <div className="flex flex-col">
        {!isPromptingPassword && (
          <div className={promptColor}>┌──({terminalUser}㉿kali)-[{displayPath}]</div>
        )}
        <div className="flex items-center gap-2">
          {!isPromptingPassword && <span className={promptColor}>└─{promptChar}</span>}
          <input
            ref={inputRef}
            type={isPromptingPassword ? 'password' : 'text'}
            value={isPromptingPassword ? passwordInput : input}
            onChange={(e) => isPromptingPassword ? setPasswordInput(e.target.value) : setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none border-none text-white caret-white"
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>
      <div ref={bottomRef} />
    </div>
  );
};
