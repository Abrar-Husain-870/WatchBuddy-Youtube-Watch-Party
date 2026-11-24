import React, { useState } from 'react';
import { CATEGORIES, DISCOVERY_VIDEOS } from '../data/discoveryVideos';
import { Play, Users, Plus, LogIn, MoreVertical, Radio } from 'lucide-react';

export function HomeDiscovery({
  onSelectVideoForParty,
  onOpenCreateModal,
  onOpenJoinModal
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredVideos = selectedCategory === 'All'
    ? DISCOVERY_VIDEOS
    : DISCOVERY_VIDEOS.filter(v => v.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Category Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#F1F1F1] text-[#0F0F0F] font-semibold'
                  : 'bg-[#272727] hover:bg-[#383838] text-[#F1F1F1]'
              }`}
            >
              {category === 'Live' && <span className="w-1.5 h-1.5 rounded-full bg-[#FF0033] animate-pulse" />}
              <span>{category}</span>
            </button>
          );
        })}
      </div>

      {/* "Watch Together" Hero Action Banner */}
      <div className="bg-[#181818] border border-[#303030] rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF0033] animate-pulse" />
            <h2 className="text-base sm:text-lg font-bold text-[#F1F1F1]">
              Watch Together in Real-Time
            </h2>
          </div>
          <p className="text-xs text-[#AAAAAA] max-w-xl">
            Synchronize playback, scrub through scenes together, manage host & moderator roles, and chat live with friends.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onOpenJoinModal}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-[#272727] hover:bg-[#383838] border border-[#303030] text-xs font-semibold text-[#F1F1F1] transition flex items-center justify-center gap-2"
          >
            <LogIn className="w-3.5 h-3.5 text-[#3EA6FF]" />
            <span>Join Room</span>
          </button>
          <button
            onClick={onOpenCreateModal}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-[#FF0033] hover:bg-[#CC0029] text-xs font-semibold text-white transition flex items-center justify-center gap-2 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Party</span>
          </button>
        </div>
      </div>

      {/* Video Discovery Grid */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-sm font-semibold text-[#AAAAAA] uppercase tracking-wider">
            {selectedCategory === 'All' ? 'Recommended for Watch Parties' : `${selectedCategory} Watch Parties`}
          </h3>
          <span className="text-xs text-[#717171]">
            {filteredVideos.length} {filteredVideos.length === 1 ? 'video' : 'videos'}
          </span>
        </div>

        {filteredVideos.length === 0 ? (
          <div className="p-12 text-center bg-[#181818] border border-[#303030] rounded-xl text-[#717171]">
            <p className="text-sm">No videos found for this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-7">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                className="group cursor-pointer flex flex-col space-y-2.5"
                onClick={() => onSelectVideoForParty(video.id)}
              >
                {/* 16:9 Thumbnail Container */}
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-[#181818] border border-[#303030]/50 group-hover:border-[#555555] transition">
                  <img
                    src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                    alt={video.title}
                    onError={(e) => {
                      // Fallback to medium quality or generic background if HQ thumbnail isn't found
                      e.target.onerror = null;
                      e.target.src = `https://img.youtube.com/vi/${video.id}/0.jpg`;
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />

                  {/* Duration or LIVE Badge */}
                  <div className={`absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[11px] font-semibold tracking-tight ${
                    video.duration === 'LIVE'
                      ? 'bg-[#FF0033] text-white flex items-center gap-1 uppercase'
                      : 'bg-black/80 text-white'
                  }`}>
                    {video.duration === 'LIVE' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                    <span>{video.duration}</span>
                  </div>

                  {/* Hover Quick Action Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <div className="px-3.5 py-2 rounded-full bg-[#FF0033] text-white text-xs font-semibold flex items-center gap-2 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition duration-200">
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Watch with Friends</span>
                    </div>
                  </div>
                </div>

                {/* Video Info: Avatar, Title, Metadata */}
                <div className="flex gap-3 px-0.5">
                  <img
                    src={video.channelAvatar}
                    alt={video.channel}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop';
                    }}
                    className="w-9 h-9 rounded-full object-cover shrink-0 mt-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-medium text-[#F1F1F1] line-clamp-2 leading-snug group-hover:text-white transition">
                      {video.title}
                    </h4>
                    <p className="text-xs text-[#AAAAAA] mt-1 hover:text-[#F1F1F1] transition">
                      {video.channel}
                    </p>
                    <p className="text-xs text-[#717171] leading-tight">
                      {video.views} • {video.uploaded}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-[#717171] hover:text-[#F1F1F1] p-1 self-start opacity-0 group-hover:opacity-100 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectVideoForParty(video.id);
                    }}
                    title="Watch Party options"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
