import React, { useState } from 'react';
import { Play, Pause, RotateCcw, FastForward, Search, Lock, MessageSquarePlus } from 'lucide-react';
import { extractYouTubeId, formatTime } from '../utils/youtubeHelper';

export function VideoControls({
  playState,
  currentTime = 0,
  duration = 0,
  canControl,
  onPlay,
  onPause,
  onSeek,
  onChangeVideo,
  onOpenSuggestVideo,
  isChangeVideoOpen,
  setIsChangeVideoOpen
}) {
  const [urlInput, setUrlInput] = useState('');
  const [inputError, setInputError] = useState('');

  const isPlaying = playState === 'playing';

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    const extractedId = extractYouTubeId(urlInput);
    if (!extractedId) {
      setInputError('Invalid YouTube URL or 11-char ID.');
      return;
    }

    setInputError('');
    onChangeVideo(extractedId);
    setUrlInput('');
    setIsChangeVideoOpen(false);
  };

  const handleTogglePlay = () => {
    if (!canControl) return;
    if (isPlaying) {
      onPause(currentTime);
    } else {
      onPlay(currentTime);
    }
  };

  const handleQuickSeek = (secondsDelta) => {
    if (!canControl) return;
    const newTime = Math.max(0, (currentTime || 0) + secondsDelta);
    onSeek(newTime);
  };

  const handleScrubberChange = (e) => {
    if (!canControl) return;
    const seekSeconds = Number(e.target.value);
    onSeek(seekSeconds);
  };

  const maxDuration = duration > 0 ? duration : Math.max(currentTime, 100);

  return (
    <div className="bg-[#181818] border border-[#303030] rounded-xl p-3.5 space-y-3">
      {/* Change Video Input Bar (Collapsible / Toggleable for Host/Mod) */}
      {canControl && isChangeVideoOpen && (
        <form onSubmit={handleUrlSubmit} className="p-3 bg-[#121212] border border-[#303030] rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#F1F1F1]">Change Room Video</span>
            <button
              type="button"
              onClick={() => setIsChangeVideoOpen(false)}
              className="text-[#717171] hover:text-[#F1F1F1] text-xs"
            >
              ✕
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Paste YouTube Video URL (e.g. https://www.youtube.com/watch?v=...)"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                if (inputError) setInputError('');
              }}
              className="flex-1 px-3 py-1.5 rounded-md bg-[#212121] border border-[#303030] focus:border-[#1C62B9] focus:outline-none text-xs text-[#F1F1F1] placeholder-[#717171]"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-md bg-[#FF0033] hover:bg-[#CC0029] text-white text-xs font-medium transition shadow-sm"
            >
              Load Video
            </button>
          </div>
          {inputError && <p className="text-xs text-[#FF4E45]">{inputError}</p>}
        </form>
      )}

      {/* YouTube Red Scrubber Bar */}
      <div className="flex items-center gap-3">
        <input
          type="range"
          min="0"
          max={maxDuration}
          step="0.5"
          value={currentTime || 0}
          disabled={!canControl}
          onChange={handleScrubberChange}
          className="flex-1 accent-[#FF0033] cursor-pointer"
          title={canControl ? 'Seek position' : 'Playback synchronized by Host'}
        />
        <div className="text-xs font-mono text-[#AAAAAA] shrink-0">
          <span className="text-[#F1F1F1] font-semibold">{formatTime(currentTime)}</span>
          <span className="text-[#717171]"> / {formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls Row */}
      <div className="flex items-center justify-between pt-1">
        {/* Play / Pause / Seek Buttons */}
        <div className="flex items-center gap-2">
          {/* Play/Pause Button */}
          <button
            disabled={!canControl}
            onClick={handleTogglePlay}
            className={`flex items-center justify-center w-9 h-9 rounded-full transition ${
              canControl
                ? 'bg-[#F1F1F1] hover:bg-white text-black active:scale-95 shadow-sm'
                : 'bg-[#272727] text-[#717171] cursor-not-allowed'
            }`}
            title={canControl ? (isPlaying ? 'Pause' : 'Play') : 'Only Host/Mod can control playback'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          {/* Quick Seek -10s */}
          <button
            disabled={!canControl}
            onClick={() => handleQuickSeek(-10)}
            className={`p-2 rounded-full transition ${
              canControl
                ? 'hover:bg-[#272727] text-[#F1F1F1]'
                : 'text-[#717171] cursor-not-allowed'
            }`}
            title="Rewind 10s"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Quick Seek +10s */}
          <button
            disabled={!canControl}
            onClick={() => handleQuickSeek(10)}
            className={`p-2 rounded-full transition ${
              canControl
                ? 'hover:bg-[#272727] text-[#F1F1F1]'
                : 'text-[#717171] cursor-not-allowed'
            }`}
            title="Fast Forward 10s"
          >
            <FastForward className="w-4 h-4" />
          </button>
        </div>

        {/* Status / Participant Action button */}
        <div className="flex items-center gap-2">
          {canControl ? (
            <span className="text-xs font-medium text-[#2BAE66] bg-[#2BAE66]/10 px-2.5 py-1 rounded-full border border-[#2BAE66]/20">
              Controls Active
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#717171] hidden sm:inline flex items-center gap-1">
                <Lock className="w-3 h-3" /> Synced with Host
              </span>
              <button
                onClick={onOpenSuggestVideo}
                className="text-xs text-[#3EA6FF] bg-[#3EA6FF]/10 hover:bg-[#3EA6FF]/20 border border-[#3EA6FF]/30 px-3 py-1 rounded-full transition flex items-center gap-1.5"
              >
                <MessageSquarePlus className="w-3.5 h-3.5" />
                <span>Suggest Action</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
