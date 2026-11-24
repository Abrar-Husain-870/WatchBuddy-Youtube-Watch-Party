import React, { useState, useEffect } from 'react';
import { PlusCircle, LogIn, Sparkles, Video, Users, ShieldCheck, Zap } from 'lucide-react';

export function RoomLobby({ onCreateRoom, onJoinRoom, defaultRoomCode = '' }) {
  const [tab, setTab] = useState('create'); // 'create' | 'join'
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState(defaultRoomCode);
  const [customCode, setCustomCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (defaultRoomCode) {
      setRoomCode(defaultRoomCode);
      setTab('join');
    }
  }, [defaultRoomCode]);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      return setError('Please enter your display name.');
    }
    setError('');
    onCreateRoom(username.trim(), customCode.trim() || null);
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      return setError('Please enter your display name.');
    }
    if (!roomCode.trim()) {
      return setError('Please enter a room code.');
    }
    setError('');
    onJoinRoom(roomCode.trim(), username.trim());
  };

  return (
    <div className="min-h-[calc(100vh-70px)] flex flex-col justify-center items-center px-4 py-8">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Synchronized Video Streaming
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Watch Together, <span className="text-purple-400">Anywhere</span>
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Synchronized YouTube watch parties with real-time controls, role management, and chat.
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-xl mb-6 border border-slate-800/80">
            <button
              type="button"
              onClick={() => { setTab('create'); setError(''); }}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                tab === 'create'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              Create Room
            </button>
            <button
              type="button"
              onClick={() => { setTab('join'); setError(''); }}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                tab === 'join'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Join Room
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          {tab === 'create' ? (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Your Display Name (Host)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm text-slate-100 placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 flex justify-between">
                  <span>Custom Room Code (Optional)</span>
                  <span className="text-slate-500">e.g. MOVIE-NIGHT</span>
                </label>
                <input
                  type="text"
                  placeholder="Leave blank for auto-generated code"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm font-mono text-slate-100 placeholder-slate-500"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/30 transition transform active:scale-[0.98]"
              >
                Start Watch Party
              </button>
            </form>
          ) : (
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Your Display Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm text-slate-100 placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Room Code or Link
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter 6-char code or room URL"
                  value={roomCode}
                  onChange={(e) => {
                    // Extract code if user pasted a full URL
                    const val = e.target.value;
                    const urlMatch = val.match(/[?&]room=([a-zA-Z0-9_-]+)/);
                    if (urlMatch) {
                      setRoomCode(urlMatch[1].toUpperCase());
                    } else {
                      setRoomCode(val.toUpperCase());
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm font-mono tracking-wider text-slate-100 placeholder-slate-500"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/30 transition transform active:scale-[0.98]"
              >
                Join Watch Party
              </button>
            </form>
          )}
        </div>

        {/* Feature Badges */}
        <div className="grid grid-cols-3 gap-3 mt-6 text-center text-slate-400">
          <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800 flex flex-col items-center">
            <Zap className="w-4 h-4 text-amber-400 mb-1" />
            <span className="text-[11px] font-medium text-slate-300">Live Sync</span>
            <span className="text-[10px] text-slate-500">Sub-second</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800 flex flex-col items-center">
            <ShieldCheck className="w-4 h-4 text-blue-400 mb-1" />
            <span className="text-[11px] font-medium text-slate-300">Roles</span>
            <span className="text-[10px] text-slate-500">Host & Mod</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800 flex flex-col items-center">
            <Users className="w-4 h-4 text-purple-400 mb-1" />
            <span className="text-[11px] font-medium text-slate-300">Rooms</span>
            <span className="text-[10px] text-slate-500">Share via link</span>
          </div>
        </div>
      </div>
    </div>
  );
}

