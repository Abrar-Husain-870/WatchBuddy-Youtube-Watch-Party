import React, { useState } from 'react';
import {
  Home,
  Compass,
  Users,
  Clock,
  PlusCircle,
  PlaySquare,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Music2,
  Clapperboard,
  Radio,
  Gamepad2,
  Podcast,
  Dices,
  Star
} from 'lucide-react';

export function Sidebar({
  isExpanded,
  onToggle,
  activeTab,
  onTabChange,
  selectedExploreCategory,
  onSelectExploreCategory,
  room,
  onOpenCreateModal,
  onOpenJoinModal
}) {
  const [showAllExplore, setShowAllExplore] = useState(true);

  const mainNavItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'parties', label: 'Watch Parties', icon: Users },
    { id: 'history', label: 'History', icon: Clock }
  ];

  const exploreCategories = [
    { id: 'Music', label: 'Music', icon: Music2 },
    { id: 'Movies & TV', label: 'Movies & TV', icon: Clapperboard },
    { id: 'Live', label: 'Live', icon: Radio },
    { id: 'Gaming', label: 'Gaming', icon: Gamepad2 },
    { id: 'Podcasts', label: 'Podcasts', icon: Podcast },
    { id: 'Playables', label: 'Playables', icon: Dices },
    { id: 'Memberships', label: 'Memberships', icon: Star }
  ];

  const visibleExplore = showAllExplore
    ? exploreCategories
    : exploreCategories.slice(0, 4);

  const handleCategoryClick = (categoryId) => {
    if (onSelectExploreCategory) {
      onSelectExploreCategory(categoryId);
    }
    onTabChange('explore');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`fixed top-14 left-0 bottom-0 bg-[#0F0F0F] border-r border-[#303030] z-40 transition-all duration-200 overflow-y-auto ${
          isExpanded ? 'w-[230px]' : 'w-[72px]'
        } hidden md:flex flex-col py-3 px-2`}
      >
        {/* Main Navigation */}
        <div className="space-y-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex ${
                  isExpanded
                    ? 'items-center gap-4 px-3 py-2.5 rounded-xl text-left'
                    : 'flex-col items-center justify-center py-3 px-1 rounded-xl'
                } transition ${
                  isActive
                    ? 'bg-[#272727] text-[#F1F1F1] font-semibold'
                    : 'text-[#AAAAAA] hover:bg-[#272727] hover:text-[#F1F1F1]'
                }`}
                title={!isExpanded ? item.label : undefined}
              >
                <Icon
                  className={`${isExpanded ? 'w-5 h-5' : 'w-5 h-5 mb-1'} ${
                    isActive ? 'text-[#FF0033]' : ''
                  }`}
                />
                <span className={isExpanded ? 'text-sm' : 'text-[10px] tracking-tight'}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Divider */}
        {isExpanded && <div className="h-[1px] bg-[#303030] my-3 mx-2" />}

        {/* Explore Section (matching user's YouTube sidebar design) */}
        {isExpanded && (
          <div className="space-y-1">
            <div className="px-3 py-1.5 text-xs font-semibold text-[#AAAAAA] uppercase tracking-wider">
              Explore
            </div>

            {visibleExplore.map((item) => {
              const Icon = item.icon;
              const isCatActive =
                activeTab === 'explore' && selectedExploreCategory === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleCategoryClick(item.id)}
                  className={`w-full flex items-center gap-4 px-3 py-2 rounded-xl text-left text-sm transition ${
                    isCatActive
                      ? 'bg-[#272727] text-[#F1F1F1] font-semibold'
                      : 'text-[#AAAAAA] hover:bg-[#272727] hover:text-[#F1F1F1]'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isCatActive ? 'text-[#FF0033]' : 'text-[#AAAAAA]'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Show more / Show fewer toggle */}
            <button
              onClick={() => setShowAllExplore(!showAllExplore)}
              className="w-full flex items-center gap-4 px-3 py-2 rounded-xl text-left text-sm text-[#AAAAAA] hover:bg-[#272727] hover:text-[#F1F1F1] transition"
            >
              {showAllExplore ? (
                <>
                  <ChevronUp className="w-5 h-5 text-[#AAAAAA]" />
                  <span>Show fewer</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-5 h-5 text-[#AAAAAA]" />
                  <span>Show more</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Divider */}
        {isExpanded && <div className="h-[1px] bg-[#303030] my-3 mx-2" />}

        {/* Watch Parties Section */}
        {isExpanded && (
          <div className="px-2 space-y-2">
            <h4 className="px-1 text-xs font-semibold uppercase tracking-wider text-[#717171]">
              Watch Parties
            </h4>

            {room ? (
              <div
                onClick={() => onTabChange('home')}
                className="p-2.5 rounded-xl bg-[#181818] border border-[#303030] space-y-2 cursor-pointer hover:border-[#FF0033]/50 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#F1F1F1] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#FF0033] animate-pulse" />
                    Live Room
                  </span>
                  <span className="text-[11px] font-mono text-[#3EA6FF]">
                    {room.roomId}
                  </span>
                </div>
                <p className="text-[11px] text-[#717171] truncate">
                  Now playing: {room.videoId}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <button
                  onClick={onOpenCreateModal}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-[#AAAAAA] hover:bg-[#272727] hover:text-[#F1F1F1] transition"
                >
                  <PlusCircle className="w-4 h-4 text-[#FF0033]" />
                  <span>New Watch Party</span>
                </button>
                <button
                  onClick={onOpenJoinModal}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-[#AAAAAA] hover:bg-[#272727] hover:text-[#F1F1F1] transition"
                >
                  <PlaySquare className="w-4 h-4 text-[#3EA6FF]" />
                  <span>Join with Code</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Bottom Toggle Sidebar Button */}
        <div className="mt-auto pt-2 border-t border-[#303030]">
          <button
            onClick={onToggle}
            className={`w-full flex items-center rounded-lg hover:bg-[#272727] text-[#AAAAAA] hover:text-[#F1F1F1] transition ${
              isExpanded
                ? 'justify-between px-3 py-2 text-xs font-medium bg-[#181818]/60 border border-[#303030]'
                : 'justify-center p-2.5'
            }`}
            title={isExpanded ? 'Collapse Sidebar' : 'Expand Sidebar'}
          >
            <span className="flex items-center gap-2">
              {isExpanded ? (
                <>
                  <PanelLeftClose className="w-4 h-4 text-[#AAAAAA]" />
                  <span>Collapse Sidebar</span>
                </>
              ) : (
                <PanelLeftOpen className="w-5 h-5 text-[#AAAAAA]" />
              )}
            </span>
            {isExpanded && <ChevronLeft className="w-3.5 h-3.5 text-[#717171]" />}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/70 z-50 md:hidden flex animate-fade-in"
          onClick={onToggle}
        >
          <div
            className="w-[260px] bg-[#0F0F0F] h-full p-4 border-r border-[#303030] space-y-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#303030]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-4 rounded bg-[#FF0033] flex items-center justify-center">
                  <div className="w-0 h-0 border-y-[3px] border-y-transparent border-l-[6px] border-l-white ml-0.5" />
                </div>
                <span className="font-bold text-[#F1F1F1]">WatchBuddy</span>
              </div>
              <button
                onClick={onToggle}
                className="p-1.5 rounded-full hover:bg-[#272727] text-[#AAAAAA] hover:text-[#F1F1F1]"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Main Nav */}
            <div className="space-y-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      onToggle();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm ${
                      isActive
                        ? 'bg-[#272727] text-[#F1F1F1] font-semibold'
                        : 'text-[#AAAAAA] hover:bg-[#272727] hover:text-[#F1F1F1]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="h-[1px] bg-[#303030]" />

            {/* Mobile Explore Section */}
            <div className="space-y-1">
              <div className="px-3 py-1 text-xs font-semibold text-[#AAAAAA] uppercase tracking-wider">
                Explore
              </div>
              {exploreCategories.map((item) => {
                const Icon = item.icon;
                const isCatActive =
                  activeTab === 'explore' && selectedExploreCategory === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleCategoryClick(item.id);
                      onToggle();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm ${
                      isCatActive
                        ? 'bg-[#272727] text-[#F1F1F1] font-semibold'
                        : 'text-[#AAAAAA] hover:bg-[#272727] hover:text-[#F1F1F1]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
