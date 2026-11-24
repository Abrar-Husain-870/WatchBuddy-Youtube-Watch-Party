import React, { useState, useEffect } from 'react';
import { X, PlusCircle, LogIn, Video } from 'lucide-react';
import { extractYouTubeId } from '../utils/youtubeHelper';

export function RoomModal({
  isOpen,
  initialTab = 'create', // 'create' | 'join'
  initialRoomCode = '',
  initialVideoId = null,
  onClose,
  onCreateRoom,
  onJoinRoom
}) {
  const [tab, setTab] = useState(initialTab);
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState(initialRoomCode);
  const [customCode, setCustomCode] = useState('');
  const [videoIdInput, setVideoIdInput] = useState(initialVideoId || '');
  const [error, setError] = useState('');

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (initialRoomCode) {
      setRoomCode(initialRoomCode);
      setTab('join');
    }
  }, [initialRoomCode]);

  useEffect(() => {
    if (initialVideoId) {
      setVideoIdInput(initialVideoId);
    }
  }, [initialVideoId]);

  if (!isOpen) return null;

  const currentEffectiveVideoId =
    (videoIdInput && (extractYouTubeId(videoIdInput) || videoIdInput.trim())) ||
    initialVideoId ||
    'dQw4w9WgXcQ';

  const handleCreate = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      return setError('Please enter your display name.');
    }
    setError('');

    let finalVideoId = initialVideoId;
    if (videoIdInput && videoIdInput.trim()) {
      const extracted = extractYouTubeId(videoIdInput.trim());
      finalVideoId = extracted || videoIdInput.trim();
    }

    onCreateRoom(username.trim(), customCode.trim() || null, finalVideoId || null);
    onClose();
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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#212121] border border-[#303030] rounded-xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#303030]">
          <h3 className="text-base font-semibold text-[#F1F1F1] flex items-center gap-2">
            <span>{tab === 'create' ? 'Start a Watch Party' : 'Join a Watch Party'}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#272727] text-[#AAAAAA] hover:text-[#F1F1F1] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 bg-[#181818] border-b border-[#303030]">
          <button
            type="button"
            onClick={() => { setTab('create'); setError(''); }}
            className={`py-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition ${
              tab === 'create'
                ? 'border-[#FF0033] text-[#F1F1F1] bg-[#212121]'
                : 'border-transparent text-[#AAAAAA] hover:text-[#F1F1F1]'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-[#FF0033]" />
            Create Room
          </button>
          <button
            type="button"
            onClick={() => { setTab('join'); setError(''); }}
            className={`py-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition ${
              tab === 'join'
                ? 'border-[#FF0033] text-[#F1F1F1] bg-[#212121]'
                : 'border-transparent text-[#AAAAAA] hover:text-[#F1F1F1]'
            }`}
          >
            <LogIn className="w-4 h-4 text-[#3EA6FF]" />
            Join Room
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-[#FF4E45]/10 border border-[#FF4E45]/30 text-[#FF4E45] text-xs font-medium">
              {error}
            </div>
          )}

          {tab === 'create' ? (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#AAAAAA] mb-1.5">
                  Display Name (Host)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#121212] border border-[#303030] focus:border-[#FF0033] focus:outline-none text-sm text-[#F1F1F1] placeholder-[#717171]"
                  autoFocus
                />
              </div>

              {/* Pre-selected or Custom Video Input */}
              <div>
                <label className="block text-xs font-medium text-[#AAAAAA] mb-1.5 flex justify-between">
                  <span>YouTube Video</span>
                  <span className="text-[#717171]">Pre-selected or paste URL</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. YouTube URL or ID"
                    value={videoIdInput}
                    onChange={(e) => setVideoIdInput(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-[#121212] border border-[#303030] focus:border-[#FF0033] focus:outline-none text-sm text-[#F1F1F1] placeholder-[#717171]"
                  />
                  <Video className="w-4 h-4 text-[#FF0033] absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Video Thumbnail Preview */}
              {currentEffectiveVideoId && (
                <div className="p-2.5 rounded-xl bg-[#181818] border border-[#303030] flex items-center gap-3">
                  <img
                    src={`https://img.youtube.com/vi/${currentEffectiveVideoId}/hqdefault.jpg`}
                    alt="Selected Video"
                    className="w-16 h-9 object-cover rounded-md bg-[#0F0F0F] flex-shrink-0"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=640&h=360&fit=crop';
                    }}
                  />
                  <div className="text-xs min-w-0">
                    <span className="text-[#AAAAAA] text-[11px] block">Initial Party Video:</span>
                    <p className="font-mono text-[#F1F1F1] font-medium truncate max-w-[220px]">
                      {currentEffectiveVideoId}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#AAAAAA] mb-1.5 flex justify-between">
                  <span>Custom Room Code (Optional)</span>
                  <span className="text-[#717171]">e.g. PARTY1</span>
                </label>
                <input
                  type="text"
                  placeholder="Leave blank for auto-generated code"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#121212] border border-[#303030] focus:border-[#FF0033] focus:outline-none text-sm font-mono text-[#F1F1F1] placeholder-[#717171]"
                />
              </div>

              <p className="text-xs text-[#717171]">
                You will be assigned as <span className="text-[#F1F1F1] font-semibold">Host</span> with full control over playback and roles.
              </p>

              <button
                type="submit"
                className="w-full mt-2 py-2.5 px-4 rounded-lg bg-[#FF0033] hover:bg-[#CC0029] text-white font-medium text-sm transition shadow-sm active:scale-95"
              >
                Create Room & Watch
              </button>
            </form>
          ) : (
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#AAAAAA] mb-1.5">
                  Your Display Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#121212] border border-[#303030] focus:border-[#3EA6FF] focus:outline-none text-sm text-[#F1F1F1] placeholder-[#717171]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#AAAAAA] mb-1.5">
                  Room Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WATCH-9A2"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#121212] border border-[#303030] focus:border-[#3EA6FF] focus:outline-none text-sm font-mono text-[#F1F1F1] placeholder-[#717171]"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2.5 px-4 rounded-lg bg-[#3EA6FF] hover:bg-[#3492e2] text-black font-semibold text-sm transition shadow-sm active:scale-95"
              >
                Join Room
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
