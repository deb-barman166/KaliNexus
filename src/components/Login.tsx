import React, { useState } from 'react';
import { useSystemStore } from '../store/useSystemStore';
import { Lock } from 'lucide-react';

export const Login: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const { user, login } = useSystemStore();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div 
      className="w-full h-screen flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070&auto=format&fit=crop)' }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      
      <div className="z-10 flex flex-col items-center gap-6 p-8 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl w-full max-w-sm">
        <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] overflow-hidden">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/2/2b/Kali-dragon-icon.svg" 
            alt="User" 
            className="w-16 h-16 object-contain"
          />
        </div>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white tracking-wider">{user.name}</h2>
        </div>

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={16} className="text-gray-400" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              className={`w-full bg-black/50 border ${error ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'} rounded-md py-2 pl-10 pr-4 text-white placeholder-gray-400 outline-none transition-colors`}
              placeholder="Password"
              autoFocus
            />
          </div>
          
          {error && (
            <p className="text-red-400 text-xs text-center">Sorry, that didn't work. Please try again.</p>
          )}

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-md transition-colors"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};
