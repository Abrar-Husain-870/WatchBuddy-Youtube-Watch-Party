import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Play,
  Share2,
  UserPlus,
  Radio,
  Sparkles,
  ExternalLink,
  Check,
  UserCheck,
  Trash2,
  Tv,
  Crown,
  ShieldCheck,
  Circle
} from 'lucide-react';

const INITIAL_FRIENDS = [
  {
    id: 'f-1',
    name: 'Alex Rivera',
    handle: '@alex_r',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop',
    status: 'in_party',
    roomCode: 'LOFI-CHILL',
    videoTitle: 'lofi hip hop radio 📚 - beats to relax/study to',
    lastSeen: 'Now'
  },
  {
    id: 'f-2',
    name: 'Bella Chen',
    handle: '@bellacodes',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop',
    status: 'online',
    roomCode: null,
    videoTitle: null,
    lastSeen: 'Online'
  },
  {
    id: 'f-3',
    name: 'Charlie Smith',
    handle: '@charlie_s',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
    status: 'in_party',
    roomCode: 'ROCK-CLASSICS',
    videoTitle: 'Queen - Bohemian Rhapsody (Official Remaster)',
    lastSeen: 'Now'
  },
  {
    id: 'f-4',
    name: 'David Kim',
    handle: '@dkim_music',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop',
    status: 'online',
    roomCode: null,
    videoTitle: null,
    lastSeen: 'Online'
  },
  {
    id: 'f-5',
    name: 'Emma Watson',
    handle: '@emma_w',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop',
    status: 'offline',
    roomCode: null,
    videoTitle: null,
    lastSeen: '2h ago'
  },
  {
    id: 'f-6',
    name: 'Jake Reynolds',
    handle: '@jake_gaming',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop',
    status: 'offline',
    roomCode: null,
    videoTitle: null,
    lastSeen: 'Yesterday'
  }
];

const COMMUNITY_PARTIES = [
  {
    roomCode: 'LOFI-CHILL',
    title: 'Study & Chill Beats 24/7',
    host: 'Alex Rivera',
    videoId: '5qap5aO4i9A',
    participantsCount: 5,
    category: 'Music'
  },
  {
    roomCode: 'ROCK-CLASSICS',
    title: '80s & 90s Legendary Anthems',
    host: 'Charlie Smith',
    videoId: 'fJ9rUzIMcZQ',
    participantsCount: 4,
    category: 'Music'
  },
  {
    roomCode: 'GTA6-WATCH',
    title: 'GTA VI Breakdown & Easter Eggs',
    host: 'GameMaster_X',
    videoId: 'QdBZY2fkU-0',
    participantsCount: 8,
    category: 'Gaming'
  },
  {
    roomCode: 'INTERSTELLAR-OST',
    title: 'Hans Zimmer Cinematic Experience',
    host: 'SoundtrackLover',
    videoId: 'UDVtMYqUAyw',
    participantsCount: 6,
    category: 'Movies & TV'
  }
];

export function WatchPartiesPage({
  room,
  currentUser,
  onOpenCreateModal,
  onOpenJoinModal,
  onJoinRoomDirectly,
  onReturnToRoom
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'friends' | 'rooms'
  const [friends, setFriends] = useState(() => {
    try {
      const stored = localStorage.getItem('watchbuddy_friends');
      return stored ? JSON.parse(stored) : INITIAL_FRIENDS;
    } catch {
      return INITIAL_FRIENDS;
    }
  });

  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [newFriendName, setNewFriendName] = useState('');
  const [newFriendHandle, setNewFriendHandle] = useState('');
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState('');

  // Persist friends
  useEffect(() => {
    try {
      localStorage.setItem('watchbuddy_friends', JSON.stringify(friends));
    } catch (e) {
      console.error('Failed to save friends list', e);
    }
  }, [friends]);

  const handleAddFriend = (e) => {
    e.preventDefault();
    if (!newFriendName.trim()) return;

    const newFriend = {
      id: `f-${Date.now()}`,
      name: newFriendName.trim(),
      handle: newFriendHandle.trim()
        ? (newFriendHandle.startsWith('@') ? newFriendHandle.trim() : `@${newFriendHandle.trim()}`)
        : `@${newFriendName.toLowerCase().replace(/\s+/g, '_')}`,
      avatar: `https://images.unsplash.com/photo-${1534528741775 + (friends.length * 1000)}?w=80&h=80&fit=crop`,
      status: 'online',
      roomCode: null,
      videoTitle: null,
      lastSeen: 'Just added'
    };

    setFriends([newFriend, ...friends]);
    setNewFriendName('');
    setNewFriendHandle('');
    setIsAddFriendOpen(false);
  };

  const handleRemoveFriend = (id) => {
    setFriends(friends.filter(f => f.id !== id));
  };

  const handleInviteFriend = (friend) => {
    if (room) {
      const link = `${window.location.origin}?room=${room.roomId}`;
      navigator.clipboard.writeText(link);
      setInviteSuccessMsg(`Invite link for room ${room.roomId} copied for ${friend.name}!`);
    } else {
      setInviteSuccessMsg(`Started party invite with ${friend.name}! Please create a room first.`);
      onOpenCreateModal();
    }
    setTimeout(() => setInviteSuccessMsg(''), 3500);
  };

  const onlineFriends = friends.filter(f => f.status === 'online' || f.status === 'in_party');

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#303030]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#3EA6FF]/10 border border-[#3EA6FF]/20 text-[#3EA6FF]">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#F1F1F1] tracking-tight">
                Watch Parties & Friends
              </h1>
              <p className="text-xs sm:text-sm text-[#AAAAAA]">
                Join public parties, hang out with friends, and watch videos together in real-time.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Room Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenJoinModal}
            className="px-3.5 py-2 bg-[#212121] hover:bg-[#272727] text-[#F1F1F1] border border-[#303030] text-xs sm:text-sm font-medium rounded-xl transition flex items-center gap-2"
          >
            <Tv className="w-4 h-4 text-[#3EA6FF]" />
            <span>Join with Code</span>
          </button>
          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 bg-[#FF0033] hover:bg-[#CC0029] text-white text-xs sm:text-sm font-semibold rounded-xl transition flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Create Party</span>
          </button>
        </div>
      </div>

      {/* Invite Notification Banner */}
      {inviteSuccessMsg && (
        <div className="p-3 bg-[#2BAE66]/15 border border-[#2BAE66]/30 rounded-xl text-xs sm:text-sm text-[#2BAE66] flex items-center justify-between animate-fade-in">
          <span className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            {inviteSuccessMsg}
          </span>
          <button onClick={() => setInviteSuccessMsg('')} className="text-[#AAAAAA] hover:text-white">✕</button>
        </div>
      )}

      {/* Active User Room Banner (if user is currently in a room) */}
      {room && (
        <div className="p-4 bg-[#181818] border border-[#303030] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#FF0033] animate-pulse flex-shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-[#FF0033]">
                  Your Live Room
                </span>
                <span className="text-sm font-mono font-bold text-[#F1F1F1]">
                  #{room.roomId}
                </span>
              </div>
              <p className="text-xs text-[#AAAAAA] mt-0.5">
                Video: <span className="text-[#F1F1F1]">{room.videoId}</span> • {room.participants?.length || 1} watching now
              </p>
            </div>
          </div>
          <button
            onClick={onReturnToRoom}
            className="px-4 py-2 bg-[#FF0033] hover:bg-[#CC0029] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Return to Live Party</span>
          </button>
        </div>
      )}

      {/* Navigation Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#303030] pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition ${
            activeTab === 'all'
              ? 'bg-[#F1F1F1] text-[#0F0F0F] font-semibold'
              : 'text-[#AAAAAA] hover:text-[#F1F1F1] hover:bg-[#272727]'
          }`}
        >
          All Activity
        </button>
        <button
          onClick={() => setActiveTab('friends')}
          className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition flex items-center gap-1.5 ${
            activeTab === 'friends'
              ? 'bg-[#F1F1F1] text-[#0F0F0F] font-semibold'
              : 'text-[#AAAAAA] hover:text-[#F1F1F1] hover:bg-[#272727]'
          }`}
        >
          <span>Friends</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#272727] text-[#F1F1F1]">
            {friends.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('rooms')}
          className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition flex items-center gap-1.5 ${
            activeTab === 'rooms'
              ? 'bg-[#F1F1F1] text-[#0F0F0F] font-semibold'
              : 'text-[#AAAAAA] hover:text-[#F1F1F1] hover:bg-[#272727]'
          }`}
        >
          <span>Active Parties</span>
          <span className="w-2 h-2 rounded-full bg-[#2BAE66]" />
        </button>
      </div>

      {/* 2. FRIENDS SECTION (Requested by User) */}
      {(activeTab === 'all' || activeTab === 'friends') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#F1F1F1] flex items-center gap-2">
                <span>Friends</span>
                <span className="text-xs font-normal text-[#AAAAAA]">
                  ({onlineFriends.length} online of {friends.length})
                </span>
              </h2>
            </div>

            <button
              onClick={() => setIsAddFriendOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#212121] hover:bg-[#272727] border border-[#303030] text-[#F1F1F1] text-xs font-medium rounded-xl transition"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#3EA6FF]" />
              <span>Add Friend</span>
            </button>
          </div>

          {/* Friends Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {friends.map((friend) => {
              const isParty = friend.status === 'in_party';
              const isOnline = friend.status === 'online';

              return (
                <div
                  key={friend.id}
                  className="p-3.5 rounded-xl bg-[#181818] border border-[#303030] hover:border-[#717171]/40 flex flex-col justify-between gap-3 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar with Status Dot */}
                      <div className="relative">
                        <img
                          src={friend.avatar}
                          alt={friend.name}
                          className="w-10 h-10 rounded-full object-cover border border-[#303030]"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop';
                          }}
                        />
                        <span
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#181818] ${
                            isParty
                              ? 'bg-[#FF0033] animate-pulse'
                              : isOnline
                              ? 'bg-[#2BAE66]'
                              : 'bg-[#717171]'
                          }`}
                          title={isParty ? 'In Watch Party' : isOnline ? 'Online' : 'Offline'}
                        />
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-[#F1F1F1] truncate">
                          {friend.name}
                        </h4>
                        <p className="text-xs text-[#717171]">{friend.handle}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveFriend(friend.id)}
                      className="text-[#717171] hover:text-[#FF4E45] p-1 transition"
                      title="Remove friend"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Friend Status / Current Video */}
                  <div className="text-xs bg-[#212121]/80 rounded-lg p-2 border border-[#303030]/60">
                    {isParty ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[#FF0033] font-medium">
                          <Radio className="w-3 h-3" />
                          <span>Watching in #{friend.roomCode}</span>
                        </div>
                        <p className="text-[#AAAAAA] truncate text-[11px]">
                          {friend.videoTitle}
                        </p>
                      </div>
                    ) : isOnline ? (
                      <div className="flex items-center gap-1.5 text-[#2BAE66]">
                        <Circle className="w-2 h-2 fill-current" />
                        <span>Online & available to watch</span>
                      </div>
                    ) : (
                      <div className="text-[#717171]">
                        <span>Last seen: {friend.lastSeen}</span>
                      </div>
                    )}
                  </div>

                  {/* Contextual Action Button */}
                  <div className="flex items-center gap-2 pt-1">
                    {isParty ? (
                      <button
                        onClick={() => onJoinRoomDirectly(friend.roomCode)}
                        className="w-full py-1.5 bg-[#3EA6FF] hover:bg-[#3492e2] text-black text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Join #{friend.roomCode}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleInviteFriend(friend)}
                        className="w-full py-1.5 bg-[#272727] hover:bg-[#303030] text-[#F1F1F1] text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition border border-[#303030]"
                      >
                        <Share2 className="w-3 h-3 text-[#3EA6FF]" />
                        <span>Invite to Party</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. ACTIVE WATCH PARTIES LIST */}
      {(activeTab === 'all' || activeTab === 'rooms') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#F1F1F1] flex items-center gap-2">
              <span>Active Public Rooms</span>
              <span className="w-2 h-2 rounded-full bg-[#2BAE66] animate-pulse" />
            </h2>
            <span className="text-xs text-[#AAAAAA]">Real-time synchronization enabled</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {COMMUNITY_PARTIES.map((party) => (
              <div
                key={party.roomCode}
                className="group bg-[#181818] border border-[#303030] hover:border-[#717171] rounded-xl overflow-hidden flex flex-col justify-between transition"
              >
                {/* 16:9 Thumbnail */}
                <div className="relative aspect-video w-full bg-[#212121] overflow-hidden min-h-[140px]">
                  <img
                    src={`https://i.ytimg.com/vi/${party.videoId}/hqdefault.jpg`}
                    alt={party.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://i.ytimg.com/vi/${party.videoId}/mqdefault.jpg`;
                    }}
                  />
                  <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-[#3EA6FF] font-bold">
                    #{party.roomCode}
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[10px] text-white flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2BAE66] animate-pulse" />
                    <span>{party.participantsCount} watching</span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-3 flex flex-col flex-1 justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-[#F1F1F1] line-clamp-1">
                      {party.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-[#AAAAAA] mt-1">
                      <Crown className="w-3 h-3 text-[#F0B429]" />
                      <span>Host: {party.host}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onJoinRoomDirectly(party.roomCode)}
                    className="w-full py-2 bg-[#272727] hover:bg-[#FF0033] text-[#F1F1F1] hover:text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Join Party</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Add Friend Modal */}
      {isAddFriendOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsAddFriendOpen(false)}
        >
          <div
            className="bg-[#181818] border border-[#303030] rounded-2xl p-6 w-full max-w-md space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#303030]">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#3EA6FF]" />
                <h3 className="text-lg font-bold text-[#F1F1F1]">Add a Friend</h3>
              </div>
              <button
                onClick={() => setIsAddFriendOpen(false)}
                className="text-[#AAAAAA] hover:text-[#F1F1F1] text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddFriend} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#AAAAAA] mb-1.5">
                  Friend's Display Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jordan Miller"
                  value={newFriendName}
                  onChange={(e) => setNewFriendName(e.target.value)}
                  required
                  autoFocus
                  className="w-full bg-[#0F0F0F] border border-[#303030] rounded-xl px-3.5 py-2.5 text-sm text-[#F1F1F1] focus:outline-none focus:border-[#3EA6FF] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#AAAAAA] mb-1.5">
                  Handle / Username (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. @jordan_m"
                  value={newFriendHandle}
                  onChange={(e) => setNewFriendHandle(e.target.value)}
                  className="w-full bg-[#0F0F0F] border border-[#303030] rounded-xl px-3.5 py-2.5 text-sm text-[#F1F1F1] focus:outline-none focus:border-[#3EA6FF] transition"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddFriendOpen(false)}
                  className="px-4 py-2 bg-[#212121] hover:bg-[#272727] text-[#AAAAAA] text-xs font-medium rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3EA6FF] hover:bg-[#3492e2] text-black text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Save Friend</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

