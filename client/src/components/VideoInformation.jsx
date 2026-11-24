import React, { useState } from 'react';
import { Share2, Copy, Check, Users, Video, MessageSquarePlus } from 'lucide-react';
import { DISCOVERY_VIDEOS } from '../data/discoveryVideos';

export function VideoInformation({
  room,
  currentUser,
  participantsCount,
  canControl,
  onOpenChangeVideo,
  onOpenSuggestVideo
}) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyLink = () => {
    if (!room?.roomId) return;
    const url = `${window.location.origin}?room=${room.roomId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    if (!room?.roomId) return;
    navigator.clipboard.writeText(room.roomId);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Video titles lookup from discovery list or fallback
  const getVideoTitle = (id) => {
    const found = DISCOVERY_VIDEOS.find(v => v.id === id);
    if (found) return found.title;
    return `YouTube Video (${id || 'Synchronized Watch Party'})`;
  };

  return (
    <div className="space-y-3 pt-3 pb-4 border-b border-[#303030]">
      {/* Video Title */}
      <h1 className="text-base sm:text-lg lg:text-xl font-semibold text-[#F1F1F1] leading-snug">
        {getVideoTitle(room?.videoId)}
      </h1>

      {/* Details & Actions Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Channel & Room Metadata */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#272727] flex items-center justify-center text-sm font-bold text-[#F1F1F1] border border-[#303030]">
            🍿
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#F1F1F1]">WatchBuddy Party</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#272727] text-[#AAAAAA] font-mono">
                {room?.roomId}
              </span>
            </div>
            <p className="text-xs text-[#717171] flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2BAE66]" />
              {participantsCount} {participantsCount === 1 ? 'person watching' : 'people watching'}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Share / Copy Link Button */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#272727] hover:bg-[#383838] text-xs font-medium text-[#F1F1F1] transition active:scale-95"
            title="Copy invite link to clipboard"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-[#2BAE66]" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
          </button>

          {/* Copy Code Button */}
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#272727] hover:bg-[#383838] text-xs font-medium text-[#F1F1F1] transition active:scale-95"
            title="Copy Room Code"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-[#2BAE66]" /> : <Copy className="w-3.5 h-3.5 text-[#AAAAAA]" />}
            <span className="hidden sm:inline">Code</span>
          </button>

          {/* Change Video / Suggest Video Button */}
          {canControl ? (
            <button
              onClick={onOpenChangeVideo}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FF0033] hover:bg-[#CC0029] text-xs font-medium text-white transition active:scale-95 shadow-sm"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Change Video</span>
            </button>
          ) : (
            <button
              onClick={onOpenSuggestVideo}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#272727] hover:bg-[#383838] border border-[#303030] text-xs font-medium text-[#3EA6FF] transition active:scale-95"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-[#3EA6FF]" />
              <span>Suggest Video</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
