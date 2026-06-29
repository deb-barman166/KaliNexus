import React, { useState, useEffect, useRef } from 'react';

interface PythonInterpreterProps {
  filename: string;
  fileContent: string;
  initialArgs: string[];
}

export const PythonInterpreter: React.FC<PythonInterpreterProps> = ({
  filename,
  fileContent,
  initialArgs,
}) => {
  const [outputs, setOutputs] = useState<string[]>([]);
  const [isWaiting, setIsWaiting] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [finished, setFinished] = useState(false);

  const lineIndexRef = useRef(0);
  const varsRef = useRef<Record<string, string>>({
    'sys.argv': JSON.stringify(initialArgs),
  });

  const lines = fileContent.split('\n');
  const inputResolveRef = useRef<((val: string) => void) | null>(null);

  useEffect(() => {
    let active = true;

    const run = async () => {
      while (lineIndexRef.current < lines.length && active) {
        const rawLine = lines[lineIndexRef.current];
        lineIndexRef.current++;
        const line = rawLine.trim();

        // Skip empty lines or comments
        if (!line || line.startsWith('#')) {
          continue;
        }

        // 1. time.sleep(X)
        if (line.includes('time.sleep(')) {
          const match = line.match(/time\.sleep\(([^)]+)\)/);
          if (match) {
            const sec = parseFloat(match[1]);
            await new Promise((r) => setTimeout(r, isNaN(sec) ? 400 : Math.min(sec * 1000, 2000)));
          }
          continue;
        }

        // 2. print(...)
        if (line.startsWith('print(')) {
          const match = line.match(/^print\((.*)\)$/);
          if (match) {
            let expr = match[1].trim();
            let evaluated = expr;

            // Strip outer quotes if single string
            if ((evaluated.startsWith('"') && evaluated.endsWith('"')) || (evaluated.startsWith("'") && evaluated.endsWith("'"))) {
              evaluated = evaluated.slice(1, -1);
            } else if (evaluated.startsWith('f"') && evaluated.endsWith('"')) {
              // f-string parsing
              evaluated = evaluated.slice(2, -1);
              evaluated = evaluated.replace(/\{([^}]+)\}/g, (_, g) => {
                const varName = g.trim();
                return varsRef.current[varName] !== undefined ? varsRef.current[varName] : `{${varName}}`;
              });
            } else if (evaluated.startsWith("f'") && evaluated.endsWith("'")) {
              evaluated = evaluated.slice(2, -1);
              evaluated = evaluated.replace(/\{([^}]+)\}/g, (_, g) => {
                const varName = g.trim();
                return varsRef.current[varName] !== undefined ? varsRef.current[varName] : `{${varName}}`;
              });
            } else {
              // Handle simple string addition like: "text " + var or var + " text"
              const parts = evaluated.split('+').map(p => p.trim());
              let combined = '';
              for (const part of parts) {
                if ((part.startsWith('"') && part.endsWith('"')) || (part.startsWith("'") && part.endsWith("'"))) {
                  combined += part.slice(1, -1);
                } else if (varsRef.current[part] !== undefined) {
                  combined += varsRef.current[part];
                } else {
                  combined += part;
                }
              }
              evaluated = combined;
            }

            // Unescape ANSI and newlines
            evaluated = evaluated
              .replace(/\\x1b/g, '\x1b')
              .replace(/\\u001b/g, '\x1b')
              .replace(/\\n/g, '\n');

            setOutputs((prev) => [...prev, evaluated]);
            // Slight delay so the lines roll out with feeling of execution
            await new Promise((r) => setTimeout(r, 60));
          }
          continue;
        }

        // 3. input(...)
        if (line.includes('input(')) {
          const assignMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*input\((.*)\)$/);
          const directMatch = line.match(/^input\((.*)\)$/);

          let promptStr = '';
          let targetVar: string | undefined;

          if (assignMatch) {
            targetVar = assignMatch[1];
            let inner = assignMatch[2].trim();
            if ((inner.startsWith('"') && inner.endsWith('"')) || (inner.startsWith("'") && inner.endsWith("'"))) {
              promptStr = inner.slice(1, -1);
            } else {
              promptStr = inner;
            }
          } else if (directMatch) {
            let inner = directMatch[1].trim();
            if ((inner.startsWith('"') && inner.endsWith('"')) || (inner.startsWith("'") && inner.endsWith("'"))) {
              promptStr = inner.slice(1, -1);
            } else {
              promptStr = inner;
            }
          }

          promptStr = promptStr.replace(/\\x1b/g, '\x1b').replace(/\\u001b/g, '\x1b');

          setPromptText(promptStr);
          setIsWaiting(true);

          const userInput = await new Promise<string>((resolve) => {
            inputResolveRef.current = resolve;
          });

          if (targetVar) {
            varsRef.current[targetVar] = userInput;
          }
          continue;
        }

        // 4. Basic variable assignment (e.g., opt = "1")
        const directAssign = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*['"]([^'"]+)['"]$/);
        if (directAssign) {
          varsRef.current[directAssign[1]] = directAssign[2];
          continue;
        }

        // 5. Conditions (if / elif)
        if (line.startsWith('if ')) {
          const match = line.match(/^if\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*==\s*['"]([^'"]+)['"]\s*:/);
          if (match) {
            const varName = match[1];
            const targetVal = match[2];
            const currentVal = varsRef.current[varName];

            if (currentVal !== targetVal) {
              // Skip block until next elif, else, or less indented line
              let indentLevel = rawLine.length - rawLine.trimStart().length;
              let nextIdx = lineIndexRef.current;
              let foundNext = false;
              while (nextIdx < lines.length) {
                const nextRaw = lines[nextIdx];
                const nextTrim = nextRaw.trim();
                const nextIndent = nextRaw.length - nextRaw.trimStart().length;
                if (nextTrim && nextIndent <= indentLevel && !nextTrim.startsWith('#')) {
                  lineIndexRef.current = nextIdx;
                  foundNext = true;
                  break;
                }
                nextIdx++;
              }
              if (!foundNext) {
                lineIndexRef.current = lines.length;
              }
            }
          }
          continue;
        }

        if (line.startsWith('elif ')) {
          const match = line.match(/^elif\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*==\s*['"]([^'"]+)['"]\s*:/);
          if (match) {
            const varName = match[1];
            const targetVal = match[2];
            const currentVal = varsRef.current[varName];

            if (currentVal !== targetVal) {
              // Skip block
              let indentLevel = rawLine.length - rawLine.trimStart().length;
              let nextIdx = lineIndexRef.current;
              let foundNext = false;
              while (nextIdx < lines.length) {
                const nextRaw = lines[nextIdx];
                const nextTrim = nextRaw.trim();
                const nextIndent = nextRaw.length - nextRaw.trimStart().length;
                if (nextTrim && nextIndent <= indentLevel && !nextTrim.startsWith('#')) {
                  lineIndexRef.current = nextIdx;
                  foundNext = true;
                  break;
                }
                nextIdx++;
              }
              if (!foundNext) {
                lineIndexRef.current = lines.length;
              }
            }
          } else {
            // General elif fallback - skip if not matching
            let indentLevel = rawLine.length - rawLine.trimStart().length;
            lineIndexRef.current = skipIndentBlock(lines, lineIndexRef.current, indentLevel);
          }
          continue;
        }

        if (line.startsWith('else:')) {
          // If we are executing else normally, it is fine.
          // Note: If we had run a previous 'if' or 'elif', the interpreter would have skipped over 'else:'.
          // So if we hit 'else:' naturally, we execute it.
          continue;
        }
      }

      if (active) {
        setFinished(true);
      }
    };

    run();

    return () => {
      active = false;
    };
  }, [fileContent]);

  const skipIndentBlock = (linesList: string[], startIdx: number, baseIndent: number): number => {
    let idx = startIdx;
    while (idx < linesList.length) {
      const raw = linesList[idx];
      const trim = raw.trim();
      const indent = raw.length - raw.trimStart().length;
      if (trim && indent <= baseIndent && !trim.startsWith('#')) {
        return idx;
      }
      idx++;
    }
    return linesList.length;
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isWaiting) return;

    const value = inputValue;
    setInputValue('');
    setIsWaiting(false);

    // Show input in terminal feed
    setOutputs((prev) => [...prev, `${promptText}${value}`]);

    if (inputResolveRef.current) {
      inputResolveRef.current(value);
    }
  };

  const renderAnsi = (text: string) => {
    const parts = text.split(/(\x1b\[[0-9;]*m)/);
    let currentColorClass = 'text-gray-300';
    let isBold = false;

    return parts.map((part, idx) => {
      if (part.startsWith('\x1b[')) {
        if (part === '\x1b[0m') {
          currentColorClass = 'text-gray-300';
          isBold = false;
        } else if (part.includes('36')) {
          currentColorClass = 'text-cyan-400';
        } else if (part.includes('32')) {
          currentColorClass = 'text-green-400';
        } else if (part.includes('33')) {
          currentColorClass = 'text-yellow-400';
        } else if (part.includes('31')) {
          currentColorClass = 'text-red-400';
        } else if (part.includes('35')) {
          currentColorClass = 'text-fuchsia-400';
        } else if (part.includes('34')) {
          currentColorClass = 'text-blue-400';
        }

        if (part.includes('1;')) {
          isBold = true;
        }
        return null;
      }

      return (
        <span key={idx} className={`${currentColorClass} ${isBold ? 'font-bold' : ''}`}>
          {part}
        </span>
      );
    });
  };

  return (
    <div className="text-gray-300 font-mono leading-relaxed bg-[#0b0c10] p-4 rounded border border-[#1f2430] shadow-xl max-w-full overflow-x-auto">
      <div className="text-[10px] text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-1.5 mb-2.5 flex justify-between">
        <span>Python Interpreter Simulator (v3.11)</span>
        <span className="text-cyan-500 font-bold">{filename}</span>
      </div>

      <div className="flex flex-col gap-1 select-text">
        {outputs.map((out, idx) => (
          <div key={idx} className="whitespace-pre-wrap min-h-[1.2rem]">
            {renderAnsi(out)}
          </div>
        ))}
      </div>

      {isWaiting && (
        <form onSubmit={handleInputSubmit} className="flex items-center gap-1.5 mt-2 bg-black/40 p-1 px-2 rounded border border-white/5">
          <span className="whitespace-pre text-yellow-400 font-semibold">{renderAnsi(promptText)}</span>
          <input
            type="text"
            value={inputValue}
            autoFocus
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 bg-transparent text-white outline-none border-none p-0 font-mono text-sm ring-0 focus:ring-0"
          />
        </form>
      )}

      {finished && (
        <div className="text-[10px] text-gray-500 border-t border-gray-800 pt-1.5 mt-3 text-right">
          --- Process finished with exit code 0 ---
        </div>
      )}
    </div>
  );
};
