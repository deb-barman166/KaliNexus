import React, { useState } from 'react';
import { Monitor, Cpu, HardDrive, Shield, User, Save } from 'lucide-react';
import { useSystemStore } from '../../store/useSystemStore';

export const Settings: React.FC = () => {
  const { user, updateUser } = useSystemStore();
  const [name, setName] = useState(user.name);
  const [pass, setPass] = useState(user.pass);
  const [saved, setSaved] = useState(false);

  const handleSaveUser = () => {
    updateUser(name, pass);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-gray-300 overflow-auto">
      <div className="p-6 max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-8">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/2/2b/Kali-dragon-icon.svg" 
            alt="Kali" 
            className="w-16 h-16"
          />
          <div>
            <h1 className="text-2xl font-bold text-white">Kali Web OS</h1>
            <p className="text-gray-400">Version 2026.1 (Simulated Environment)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Account */}
          <div className="bg-[#2d2d2d] p-4 rounded-lg border border-[#333] md:col-span-2">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <User size={18} className="text-blue-400" />
              User Account
            </h2>
            <div className="space-y-4 text-sm max-w-md">
              <div className="flex flex-col gap-1">
                <label className="text-gray-400">Username</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[#1a1a1a] border border-[#444] rounded px-3 py-2 text-white outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-gray-400">Password</label>
                <input 
                  type="password" 
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  className="bg-[#1a1a1a] border border-[#444] rounded px-3 py-2 text-white outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button 
                  onClick={handleSaveUser}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
                >
                  <Save size={16} />
                  Save Changes
                </button>
                {saved && <span className="text-green-400">Saved successfully!</span>}
              </div>
            </div>
          </div>

          {/* System Info */}
          <div className="bg-[#2d2d2d] p-4 rounded-lg border border-[#333]">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Monitor size={18} className="text-blue-400" />
              System Information
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">OS Name</span>
                <span className="text-gray-300">Kali GNU/Linux Rolling</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">OS Type</span>
                <span className="text-gray-300">64-bit</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">GNOME Version</span>
                <span className="text-gray-300">43.2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Windowing System</span>
                <span className="text-gray-300">Wayland (Simulated)</span>
              </div>
            </div>
          </div>

          {/* Hardware */}
          <div className="bg-[#2d2d2d] p-4 rounded-lg border border-[#333]">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Cpu size={18} className="text-green-400" />
              Hardware
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Processor</span>
                <span className="text-gray-300">Virtual Web CPU @ 3.2GHz</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Memory</span>
                <span className="text-gray-300">16.0 GiB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Graphics</span>
                <span className="text-gray-300">WebGPU / WebGL</span>
              </div>
            </div>
          </div>

          {/* Storage */}
          <div className="bg-[#2d2d2d] p-4 rounded-lg border border-[#333]">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <HardDrive size={18} className="text-purple-400" />
              Storage
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Capacity</span>
                <span className="text-gray-300">256 GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Used</span>
                <span className="text-gray-300">42.5 GB</span>
              </div>
              <div className="w-full bg-[#1a1a1a] rounded-full h-2 mt-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '16%' }}></div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-[#2d2d2d] p-4 rounded-lg border border-[#333]">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Shield size={18} className="text-red-400" />
              Security Status
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-green-400">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                System is up to date
              </div>
              <div className="flex items-center gap-2 text-green-400">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Firewall active
              </div>
              <div className="flex items-center gap-2 text-yellow-400">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                Simulated environment
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
