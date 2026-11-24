import React, { useState, useEffect } from 'react';
import {
  Clock,
  Crown,
  ShieldCheck,
  Users,
  Play,
  RotateCcw,
  Trash2,
  Share2,
  Copy,
  Check,
  Film,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import {
  getHistorySessions,
  saveHistorySessions,
  INITIAL_HISTORY_SESSIONS
} from '../utils/historyManager';

export function HistoryPage({
  onSelectVideoForParty,
  onJoinRoomDirectly,
  room,
  canControl
}) {
  const [activeTab, setActiveTab] = useState('sessions'); // 'sessions' | 'videos'
  const [sessions, setSessions] = useState(() => getHistorySessions());
  const [copiedCode, setCopiedCode] = useState(null);

  // Reload history from localStorage
  useEffect(() => {
    setSessions(getHistorySessions());
  }, []);

  const handleCopyCode = (code, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your watch party history?')) {
      localStorage.removeItem('watchbuddy_room_history');
      setSessions([]);
    }
  };

  const handleRestoreDemoHistory = () => {
    saveHistorySessions(INITIAL_HISTORY_SESSIONS);
    setSessions(INITIAL_HISTORY_SESSIONS);
  };

  // Flatten all videos for "Shared Video History" tab
  const allWatchedVideos = sessions.flatMap(s =>
    (s.videos || []).map(v => ({
      ...v,
      roomCode: s.roomCode,
      sessionDate: s.date,
      adminName: s.admin?.name || 'Host'
    }))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#303030]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#2BAE66]/10 border border-[#2BAE66]/20 text-[#2BAE66]">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#F1F1F1] tracking-tight">
                Watch Party History
              </h1>
              <p className="text-xs sm:text-sm text-[#AAAAAA]">
                Past watch parties, admin/moderator roles, attendee logs, and watched videos.
              </p>
            </div>
          </div>
        </div>

        {/* Clear / Reset Actions */}
        <div className="flex items-center gap-2">
          {sessions.length === 0 ? (
            <button
              onClick={handleRestoreDemoHistory}
              className="px-3.5 py-2 bg-[#212121] hover:bg-[#272727] border border-[#303030] text-[#F1F1F1] text-xs font-medium rounded-xl transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#3EA6FF]" />
              <span>Load Sample History</span>
            </button>
          ) : (
            <button
              onClick={handleClearHistory}
              className="px-3 py-2 bg-[#212121] hover:bg-[#FF4E45]/20 hover:text-[#FF4E45] border border-[#303030] text-[#AAAAAA] text-xs font-medium rounded-xl transition flex items-center gap-1.5"
              title="Clear all recorded history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[#303030] pb-2">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition flex items-center gap-2 ${
            activeTab === 'sessions'
              ? 'bg-[#F1F1F1] text-[#0F0F0F] font-semibold'
              : 'text-[#AAAAAA] hover:text-[#F1F1F1] hover:bg-[#272727]'
          }`}
        >
          <span>Watch Party Sessions</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#272727] text-[#F1F1F1]">
            {sessions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('videos')}
          className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition flex items-center gap-2 ${
            activeTab === 'videos'
              ? 'bg-[#F1F1F1] text-[#0F0F0F] font-semibold'
              : 'text-[#AAAAAA] hover:text-[#F1F1F1] hover:bg-[#272727]'
          }`}
        >
          <span>Shared Video History</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#272727] text-[#F1F1F1]">
            {allWatchedVideos.length}
          </span>
        </button>
      </div>

      {/* 3. Empty State */}
      {sessions.length === 0 && (
        <div className="py-16 text-center space-y-4 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-full bg-[#181818] border border-[#303030] flex items-center justify-center mx-auto text-[#717171]">
            <Film className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#F1F1F1]">No watch history yet</h3>
          <p className="text-xs text-[#AAAAAA]">
            Join or start a watch party to automatically log sessions, participants, and videos watched.
          </p>
          <button
            onClick={handleRestoreDemoHistory}
            className="px-4 py-2 bg-[#FF0033] hover:bg-[#CC0029] text-white text-xs font-semibold rounded-xl transition"
          >
            Load Sample History
          </button>
        </div>
      )}

      {/* 4. TAB 1: WATCH PARTY SESSIONS */}
      {activeTab === 'sessions' && sessions.length > 0 && (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="p-5 rounded-2xl bg-[#181818] border border-[#303030] hover:border-[#717171]/40 transition space-y-4"
            >
              {/* Session Top Bar: Room Code, Date, Quick Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#303030]/60">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-[#272727] border border-[#303030] rounded-xl flex items-center gap-2">
                    <span className="text-xs text-[#AAAAAA]">Room:</span>
                    <span className="font-mono text-sm font-bold text-[#3EA6FF]">
                      #{session.roomCode}
                    </span>
                    <button
                      onClick={(e) => handleCopyCode(session.roomCode, e)}
                      className="text-[#AAAAAA] hover:text-white p-0.5"
                      title="Copy room code"
                    >
                      {copiedCode === session.roomCode ? (
                        <Check className="w-3.5 h-3.5 text-[#2BAE66]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <span className="text-xs text-[#717171]">•</span>
                  <span className="text-xs text-[#AAAAAA]">{session.date}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (session.videos?.[0]) {
                        onSelectVideoForParty(session.videos[0].id);
                      }
                    }}
                    className="px-3 py-1.5 bg-[#272727] hover:bg-[#FF0033] text-[#F1F1F1] hover:text-white text-xs font-medium rounded-xl transition flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Re-watch Session</span>
                  </button>
                </div>
              </div>

              {/* Roles & Attendees Details (Requested by User) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-[#0F0F0F]/60 rounded-xl border border-[#303030]/60 text-xs">
                {/* Admin / Host */}
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-[#F0B429]/15 text-[#F0B429]">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-[#717171] uppercase tracking-wider block">
                      Admin / Host
                    </span>
                    <span className="font-semibold text-[#F1F1F1]">
                      {session.admin?.name || 'Host'}
                    </span>
                  </div>
                </div>

                {/* Moderators */}
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-[#3EA6FF]/15 text-[#3EA6FF]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-[#717171] uppercase tracking-wider block">
                      Moderator(s)
                    </span>
                    <span className="font-medium text-[#F1F1F1]">
                      {session.moderators && session.moderators.length > 0
                        ? session.moderators.map(m => m.name).join(', ')
                        : 'None assigned'}
                    </span>
                  </div>
                </div>

                {/* Attendees / Participants */}
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-[#2BAE66]/15 text-[#2BAE66]">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] text-[#717171] uppercase tracking-wider block">
                      Participants ({session.participants?.length || 1})
                    </span>
                    <span className="font-medium text-[#AAAAAA] truncate block">
                      {session.participants?.join(', ') || 'Alex'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Videos Played in this Room */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#AAAAAA] uppercase tracking-wider">
                  Videos Watched ({session.videos?.length || 0})
                </span>

                <div className="space-y-2">
                  {session.videos?.map((vid, idx) => (
                    <div
                      key={`${vid.id}-${idx}`}
                      className="p-2.5 rounded-xl bg-[#212121]/60 hover:bg-[#212121] border border-[#303030]/60 flex items-center justify-between gap-3 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* 16:9 Mini Thumbnail */}
                        <div className="relative aspect-video w-20 bg-[#0F0F0F] rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={`https://img.youtube.com/vi/${vid.id}/hqdefault.jpg`}
                            alt={vid.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=640&h=360&fit=crop';
                            }}
                          />
                          <div className="absolute bottom-1 right-1 bg-black/85 text-[10px] text-white px-1 rounded">
                            {vid.duration}
                          </div>
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-medium text-[#F1F1F1] truncate">
                            {vid.title}
                          </h4>
                          <p className="text-[11px] text-[#717171]">
                            {vid.channel} • Watched at {vid.watchedAt}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => onSelectVideoForParty(vid.id)}
                        className="px-2.5 py-1 bg-[#272727] hover:bg-[#FF0033] text-[#F1F1F1] hover:text-white text-xs font-medium rounded-lg transition flex items-center gap-1 flex-shrink-0"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Watch</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. TAB 2: SHARED VIDEO HISTORY */}
      {activeTab === 'videos' && (
        <div className="space-y-3">
          <div className="text-xs text-[#AAAAAA] pb-1">
            All videos ever watched across any watch party room:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allWatchedVideos.map((video, idx) => (
              <div
                key={`${video.id}-${idx}`}
                className="group bg-[#181818] border border-[#303030] hover:border-[#717171] rounded-xl overflow-hidden flex flex-col justify-between transition"
              >
                {/* 16:9 Thumbnail */}
                <div className="relative aspect-video w-full bg-[#212121] overflow-hidden">
                  <img
                    src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=640&h=360&fit=crop';
                    }}
                  />
                  <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-[#3EA6FF]">
                    #{video.roomCode}
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/80 text-[10px] text-white px-1.5 py-0.5 rounded">
                    {video.duration}
                  </div>
                </div>

                <div className="p-3 flex flex-col flex-1 justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-[#F1F1F1] line-clamp-2">
                      {video.title}
                    </h3>
                    <p className="text-xs text-[#717171] mt-1">
                      {video.channel} • Watched in #{video.roomCode}
                    </p>
                    <p className="text-[11px] text-[#717171]">
                      Date: {video.sessionDate}
                    </p>
                  </div>

                  <button
                    onClick={() => onSelectVideoForParty(video.id)}
                    className="w-full py-1.5 bg-[#272727] hover:bg-[#FF0033] text-[#F1F1F1] hover:text-white text-xs font-medium rounded-lg transition flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Watch in New Party</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

