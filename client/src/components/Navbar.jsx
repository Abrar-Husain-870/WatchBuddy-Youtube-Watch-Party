import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Search,
  Plus,
  Copy,
  Check,
  LogOut,
  Crown,
  Shield,
  User,
  X,
  Play,
  ArrowLeft
} from 'lucide-react';
import { searchVideos } from '../data/viralVideoEngine';
import { fetchLiveYouTubeSearch } from '../services/youtubeApi';
import { extractYouTubeId } from '../utils/youtubeHelper';

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
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const searchContainerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (val.trim().length > 0) {
      // If it's a direct URL or ID, no text suggestions needed
      if (extractYouTubeId(val)) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      // 1. Instant local matches
      const localMatches = searchVideos(val).slice(0, 6);
      if (localMatches.length > 0) {
        setSuggestions(localMatches);
        setShowSuggestions(true);
      }

      // 2. Debounced live YouTube query
      debounceTimerRef.current = setTimeout(async () => {
        try {
          const liveResults = await fetchLiveYouTubeSearch(val.trim());
          if (liveResults && liveResults.length > 0) {
            setSuggestions(liveResults.slice(0, 6));
            setShowSuggestions(true);
          }
        } catch (err) {}
      }, 250);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setShowSuggestions(false);
    setIsMobileSearchOpen(false);
    onSearchSubmit(searchInput.trim());
  };

  const handleSelectSuggestion = (videoId) => {
    setShowSuggestions(false);
    setSearchInput('');
    setIsMobileSearchOpen(false);
    onSearchSubmit(videoId);
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
    <header className="fixed top-0 left-0 right-0 h-14 bg-[#0F0F0F] border-b border-[#303030] z-50 px-3 sm:px-4 flex items-center justify-between gap-2 sm:gap-4">
      {/* Mobile Search Overlay */}
      {isMobileSearchOpen ? (
        <div className="flex sm:hidden items-center w-full gap-2 animate-fade-in">
          <button
            onClick={() => setIsMobileSearchOpen(false)}
            className="p-2 rounded-full hover:bg-[#272727] text-[#AAAAAA] hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <form onSubmit={handleSearch} className="flex-1 flex items-center">
            <input
              type="text"
              autoFocus
              placeholder="Search videos or paste YouTube link..."
              value={searchInput}
              onChange={handleInputChange}
              className="w-full h-9 px-3.5 bg-[#181818] border border-[#303030] rounded-l-full text-xs text-[#F1F1F1] outline-none focus:border-[#FF0033]"
            />
            <button
              type="submit"
              className="h-9 px-4 bg-[#272727] border border-l-0 border-[#303030] rounded-r-full text-white"
            >
              <Search className="w-4 h-4 text-[#AAAAAA]" />
            </button>
          </form>
        </div>
      ) : (
        <>
          {/* Left: Menu & WatchBuddy Brand */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
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

          {/* Center: YouTube-style Search Bar with Live Suggestions Dropdown */}
          <div
            ref={searchContainerRef}
            className="flex-1 max-w-2xl mx-auto hidden sm:block relative"
          >
            <form onSubmit={handleSearch} className="flex items-center w-full">
              <div className="relative flex-1 flex items-center">
                <input
                  type="text"
                  placeholder="Search videos or paste a YouTube URL"
                  value={searchInput}
                  onChange={handleInputChange}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true);
                  }}
                  className="w-full h-10 px-4 bg-[#121212] border border-[#303030] focus:border-[#FF0033] text-sm text-[#F1F1F1] placeholder-[#717171] rounded-l-full outline-none transition"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      setSuggestions([]);
                      setShowSuggestions(false);
                    }}
                    className="absolute right-3 text-[#717171] hover:text-[#F1F1F1] text-xs p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                title="Search or load video"
                className="h-10 px-6 bg-[#222222] hover:bg-[#272727] border border-l-0 border-[#303030] rounded-r-full text-[#F1F1F1] flex items-center justify-center transition active:bg-[#303030]"
              >
                <Search className="w-4 h-4 text-[#AAAAAA]" />
              </button>
            </form>

            {/* Live Search Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-11 left-0 right-14 bg-[#212121] border border-[#303030] rounded-2xl shadow-2xl overflow-hidden z-50 py-2 animate-fade-in">
                <div className="px-3 py-1 text-[11px] font-semibold text-[#717171] uppercase tracking-wider">
                  Suggestions
                </div>
                {suggestions.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => handleSelectSuggestion(video.id)}
                    className="px-3 py-2 hover:bg-[#272727] cursor-pointer flex items-center gap-3 transition"
                  >
                    <img
                      src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
                      alt={video.title}
                      referrerPolicy="no-referrer"
                      className="w-12 h-7 object-cover rounded bg-[#0F0F0F] flex-shrink-0"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`;
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-[#F1F1F1] truncate">
                        {video.title}
                      </p>
                      <p className="text-[11px] text-[#AAAAAA] truncate">
                        {video.channel} • {video.category}
                      </p>
                    </div>
                    <Play className="w-3.5 h-3.5 text-[#AAAAAA] flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Actions, Connection Status & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Mobile Search Icon Toggle */}
            <button
              onClick={() => setIsMobileSearchOpen(true)}
              className="sm:hidden p-2 rounded-full hover:bg-[#272727] text-[#AAAAAA] hover:text-[#F1F1F1]"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Socket Connection Status */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#181818] border border-[#303030] text-[11px] font-medium"
              title={
                isConnected
                  ? 'WebSocket server connected'
                  : 'WebSocket server disconnected'
              }
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-[#2BAE66]' : 'bg-[#FF4E45] animate-ping'
                }`}
              />
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
                  {copiedCode ? (
                    <Check className="w-3.5 h-3.5 text-[#2BAE66]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-[#AAAAAA]" />
                  )}
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
                  className="px-3.5 py-1.5 rounded-full bg-[#212121] hover:bg-[#272727] text-xs font-medium text-[#F1F1F1] border border-[#303030] transition hidden xs:inline"
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
        </>
      )}
    </header>
  );
}
