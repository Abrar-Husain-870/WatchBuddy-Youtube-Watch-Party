import React, { useState } from 'react';
import { Menu, Search, Plus, Copy, Check, LogOut, Crown, Shield, User, Link as LinkIcon } from 'lucide-react';

export function Navbar({
  room,
  currentUser,
  isConnected,
  onLeaveRoom,
  onOpenCreateModal,
  onOpenJoinModal,
  onSidebarToggle,
  onSearchSubmit,
  onNavigateHome
}) {
  const [searchInput, setSearchInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    onSearchSubmit(searchInput.trim());
    setSearchInput('');
  };

  const handleCopyCode = () => {
    if (!room?.roomId) return;
    navigator.clipboard.writeText(room.roomId);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Host':
        return <Crown className="w-3.5 h-3.5 text-[#FF0033]" />;
      case 'Moderator':
        return <Shield className="w-3.5 h-3.5 text-[#3EA6FF]" />;
      default:
        return <User className="w-3.5 h-3.5 text-[#AAAAAA]" />;
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-[#0F0F0F] border-b border-[#303030] z-50 px-4 flex items-center justify-between gap-4">
      {/* Left: Menu & WatchBuddy Brand */}
      <div className="flex items-center gap-4 shrink-0">
        <button
          onClick={onSidebarToggle}
          className="p-2 rounded-full hover:bg-[#272727] text-[#F1F1F1] transition active:scale-95 flex items-center justify-center"
          title="Toggle Sidebar"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            if (onNavigateHome) onNavigateHome();
          }}
          className="flex items-center gap-2 group cursor-pointer"
        >
          {/* YouTube-like WatchBuddy Play Badge */}
          <div className="w-7 h-5 rounded-md bg-[#FF0033] flex items-center justify-center shadow-sm group-hover:bg-[#CC0029] transition">
            <div className="w-0 h-0 border-y-[4px] border-y-transparent border-l-[7px] border-l-white ml-0.5" />
          </div>
          <span className="font-bold tracking-tight text-lg text-[#F1F1F1] flex items-center">
            Watch<span className="text-[#FF0033]">Buddy</span>
          </span>
        </a>
      </div>

      {/* Center: YouTube-style Search Bar */}
      <div className="flex-1 max-w-2xl mx-auto hidden sm:block">
        <form onSubmit={handleSearch} className="flex items-center w-full">
          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              placeholder="Search videos or paste a YouTube URL"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full h-10 px-4 bg-[#121212] border border-[#303030] focus:border-[#1C62B9] text-sm text-[#F1F1F1] placeholder-[#717171] rounded-l-full outline-none transition"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-3 text-[#717171] hover:text-[#F1F1F1] text-xs"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="submit"
            title="Search or load video"
            className="h-10 px-6 bg-[#222222] hover:bg-[#272727] border border-l-0 border-[#303030] rounded-r-full text-[#F1F1F1] flex items-center justify-center transition"
          >
            <Search className="w-4 h-4 text-[#AAAAAA]" />
          </button>
        </form>
      </div>

      {/* Right: Actions, Connection Status & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Socket Connection Status */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#181818] border border-[#303030] text-[11px] font-medium"
          title={isConnected ? 'WebSocket server connected' : 'WebSocket server disconnected'}
        >
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#2BAE66]' : 'bg-[#FF4E45] animate-ping'}`} />
          <span className="hidden md:inline text-[#AAAAAA]">
            {isConnected ? 'Connected' : 'Connecting...'}
          </span>
        </div>

        {/* If inside room: Room Code, User info & Leave button */}
        {room && currentUser ? (
          <>
            {/* Room Code Chip */}
            <button
              onClick={handleCopyCode}
              title="Click to copy Room Code"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#212121] hover:bg-[#272727] border border-[#303030] text-xs font-mono font-medium text-[#F1F1F1] transition"
            >
              <span>Room: {room.roomId}</span>
              {copiedCode ? <Check className="w-3.5 h-3.5 text-[#2BAE66]" /> : <Copy className="w-3.5 h-3.5 text-[#AAAAAA]" />}
            </button>

            {/* User Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#181818] border border-[#303030]">
              <div className="w-5 h-5 rounded-full bg-[#272727] flex items-center justify-center text-[10px] font-bold text-[#F1F1F1]">
                {currentUser.username.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-medium text-[#F1F1F1] max-w-[80px] truncate hidden sm:inline">
                {currentUser.username}
              </span>
              <div title={`Role: ${currentUser.role}`}>
                {getRoleIcon(currentUser.role)}
              </div>
            </div>

            {/* Leave Room Button */}
            <button
              onClick={onLeaveRoom}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#212121] hover:bg-[#272727] hover:text-[#FF4E45] text-[#AAAAAA] text-xs font-medium border border-[#303030] transition"
              title="Leave Room"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Leave</span>
            </button>
          </>
        ) : (
          /* If NOT in a room: Create Room and Join Room Buttons */
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenJoinModal}
              className="px-3.5 py-1.5 rounded-full bg-[#212121] hover:bg-[#272727] text-xs font-medium text-[#F1F1F1] border border-[#303030] transition"
            >
              Join Room
            </button>

            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FF0033] hover:bg-[#CC0029] text-xs font-medium text-white transition shadow-sm active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Room</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
