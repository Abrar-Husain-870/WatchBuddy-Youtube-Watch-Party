import React, { useState, useEffect } from 'react';
import {
  Compass,
  Shuffle,
  Play,
  Share2,
  Check,
  CheckCircle,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import {
  EXPLORE_CATEGORIES,
  getRandomizedVideos
} from '../data/viralVideoEngine';

export function ExplorePage({
  selectedCategory = 'All',
  onSelectCategory,
  onSelectVideoForParty,
  room,
  canControl
}) {
  const [currentCategory, setCurrentCategory] = useState(selectedCategory || 'All');
  const [videos, setVideos] = useState([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Sync with prop when selected from sidebar
  useEffect(() => {
    if (selectedCategory) {
      setCurrentCategory(selectedCategory);
    }
  }, [selectedCategory]);

  // Load fresh randomized recommendations on category change
  useEffect(() => {
    loadFreshVideos(currentCategory);
  }, [currentCategory]);

  const loadFreshVideos = (cat) => {
    setIsShuffling(true);
    // Slight tick gives visual feedback that new dynamic viral videos were pulled
    setTimeout(() => {
      const freshList = getRandomizedVideos(cat, 16);
      setVideos(freshList);
      setIsShuffling(false);
    }, 150);
  };

  const handleShuffleClick = () => {
    loadFreshVideos(currentCategory);
  };

  const handleCategoryChange = (catId) => {
    setCurrentCategory(catId);
    if (onSelectCategory) {
      onSelectCategory(catId);
    }
  };

  const handleCopyLink = (videoId, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${videoId}`);
    setCopiedId(videoId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#303030]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FF0033]/10 border border-[#FF0033]/20 text-[#FF0033]">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#F1F1F1] tracking-tight">
                Explore Viral & Trending
              </h1>
              <p className="text-xs sm:text-sm text-[#AAAAAA]">
                Randomized viral videos across YouTube. Select a category or shuffle anytime.
              </p>
            </div>
          </div>
        </div>

        {/* Right Controls: Category Dropdown & Shuffle Button */}
        <div className="flex items-center gap-3">
          {/* Category Dropdown (matching user's request for dropdown selection) */}
          <div className="relative">
            <select
              value={currentCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="appearance-none bg-[#181818] border border-[#303030] text-[#F1F1F1] text-xs sm:text-sm font-medium rounded-xl px-4 py-2.5 pr-9 hover:border-[#717171] focus:outline-none focus:border-[#FF0033] transition cursor-pointer"
            >
              {EXPLORE_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-[#181818] text-[#F1F1F1]">
                  {cat.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#AAAAAA] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Shuffle Recommendations Button */}
          <button
            onClick={handleShuffleClick}
            disabled={isShuffling}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#212121] hover:bg-[#272727] active:bg-[#303030] border border-[#303030] text-[#F1F1F1] text-xs sm:text-sm font-medium rounded-xl transition shadow-sm"
            title="Randomize & pull fresh viral videos"
          >
            <Shuffle className={`w-4 h-4 text-[#3EA6FF] ${isShuffling ? 'animate-spin' : ''}`} />
            <span>Shuffle</span>
          </button>
        </div>
      </div>

      {/* 2. Horizontal Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {EXPLORE_CATEGORIES.map((cat) => {
          const isSelected = currentCategory.toLowerCase() === cat.id.toLowerCase();
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                isSelected
                  ? 'bg-[#F1F1F1] text-[#0F0F0F] font-semibold shadow-sm'
                  : 'bg-[#272727] text-[#F1F1F1] hover:bg-[#383838]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* 3. Category Description & Count */}
      <div className="flex items-center justify-between text-xs text-[#AAAAAA]">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#F0B429]" />
          Showing fresh viral picks for <strong className="text-[#F1F1F1] font-medium">{currentCategory}</strong>
        </span>
        <span>{videos.length} recommendations</span>
      </div>

      {/* 4. Dynamic Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6">
        {videos.map((video) => (
          <div
            key={video.id}
            className="group flex flex-col bg-[#181818]/60 hover:bg-[#181818] border border-transparent hover:border-[#303030] rounded-xl overflow-hidden transition-all duration-200"
          >
            {/* 16:9 Thumbnail Container */}
            <div className="relative aspect-video w-full bg-[#212121] overflow-hidden rounded-t-xl">
              <img
                src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=640&h=360&fit=crop';
                }}
              />

              {/* Duration Badge */}
              <div className="absolute bottom-2 right-2 bg-black/85 text-[#F1F1F1] text-[11px] font-medium px-1.5 py-0.5 rounded tracking-tight">
                {video.duration}
              </div>

              {/* Hover Quick Action Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => onSelectVideoForParty(video.id)}
                  className="px-3 py-2 bg-[#FF0033] hover:bg-[#CC0029] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-lg transform translate-y-1 group-hover:translate-y-0 transition-transform"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  {room && canControl ? 'Play in Room' : 'Start Party'}
                </button>
              </div>
            </div>

            {/* Video Metadata */}
            <div className="p-3 flex flex-col flex-1 justify-between gap-3">
              <div className="flex gap-2.5">
                <img
                  src={video.channelAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop'}
                  alt={video.channel}
                  className="w-8 h-8 rounded-full object-cover border border-[#303030] flex-shrink-0 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-sm font-medium text-[#F1F1F1] leading-snug line-clamp-2 group-hover:text-white transition cursor-pointer"
                    onClick={() => onSelectVideoForParty(video.id)}
                    title={video.title}
                  >
                    {video.title}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-[#AAAAAA] mt-1 truncate">
                    <span className="truncate">{video.channel}</span>
                    <CheckCircle className="w-3 h-3 text-[#717171] fill-[#717171]/20 flex-shrink-0" />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#717171] mt-0.5">
                    <span>{video.views}</span>
                    <span>•</span>
                    <span>{video.uploaded}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-2 border-t border-[#303030]/60 flex items-center justify-between">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#272727] text-[#AAAAAA]">
                  {video.category}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleCopyLink(video.id, e)}
                    className="p-1.5 rounded-lg hover:bg-[#272727] text-[#AAAAAA] hover:text-[#F1F1F1] transition"
                    title="Copy video link"
                  >
                    {copiedId === video.id ? (
                      <Check className="w-3.5 h-3.5 text-[#2BAE66]" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={() => onSelectVideoForParty(video.id)}
                    className="px-2.5 py-1 bg-[#272727] hover:bg-[#FF0033] text-[#F1F1F1] hover:text-white text-xs font-medium rounded-lg transition flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Watch</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

