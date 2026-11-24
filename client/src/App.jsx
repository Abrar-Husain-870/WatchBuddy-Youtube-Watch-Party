import React, { useState, useEffect } from 'react';
import { useWatchParty } from './hooks/useWatchParty';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { HomeDiscovery } from './components/HomeDiscovery';
import { WatchPartyLayout } from './components/WatchPartyLayout';
import { ExplorePage } from './components/ExplorePage';
import { WatchPartiesPage } from './components/WatchPartiesPage';
import { HistoryPage } from './components/HistoryPage';
import { RoomModal } from './components/RoomModal';
import { RequestChangeModal } from './components/RequestChangeModal';
import { Toast } from './components/Toast';
import { extractYouTubeId } from './utils/youtubeHelper';
import { Play } from 'lucide-react';

export default function App() {
  const {
    isConnected,
    currentUser,
    room,
    participants,
    chatMessages,
    systemAlert,
    incomingRequests,
    isKicked,
    canControl,
    isHost,
    createRoom,
    joinRoom,
    leaveRoom,
    sendPlay,
    sendPause,
    sendSeek,
    sendChangeVideo,
    assignRole,
    removeParticipant,
    transferHost,
    submitChangeRequest,
    resolveChangeRequest,
    sendChat
  } = useWatchParty();

  // Navigation & UI state
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'explore' | 'parties' | 'history'
  const [selectedExploreCategory, setSelectedExploreCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [roomModalTab, setRoomModalTab] = useState('create'); // 'create' | 'join'
  const [modalInitialRoomCode, setModalInitialRoomCode] = useState('');
  const [modalInitialVideoId, setModalInitialVideoId] = useState(null);
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);

  // Auto-detect ?room=CODE in URL for direct shareable links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setModalInitialRoomCode(roomParam);
      setRoomModalTab('join');
      setIsRoomModalOpen(true);
    }
  }, []);

  // When a room is created or joined, automatically switch view to the Watch Party Room
  useEffect(() => {
    if (room?.roomId) {
      setActiveTab('home');
    }
  }, [room?.roomId]);

  // When clicking on a video in Explore/Home/History to start a party with it
  const handleSelectVideoForParty = (videoId) => {
    if (room && canControl) {
      sendChangeVideo(videoId);
      setActiveTab('home');
    } else {
      setModalInitialVideoId(videoId);
      setRoomModalTab('create');
      setIsRoomModalOpen(true);
    }
  };

  // When clicking to join a specific room directly from Friends or Public Parties
  const handleJoinRoomDirectly = (roomCode) => {
    setModalInitialRoomCode(roomCode);
    setRoomModalTab('join');
    setIsRoomModalOpen(true);
  };

  // Top search bar submission (URLs, 11-char IDs, and keyword text search)
  const handleSearchSubmit = (query) => {
    if (!query || !query.trim()) return;
    const extractedId = extractYouTubeId(query);
    if (extractedId) {
      if (room && canControl) {
        sendChangeVideo(extractedId);
        setActiveTab('home');
      } else if (room && !canControl) {
        setIsSuggestModalOpen(true);
      } else {
        setModalInitialVideoId(extractedId);
        setRoomModalTab('create');
        setIsRoomModalOpen(true);
      }
    } else {
      // Keyword search (e.g. "avengers", "gta", "lofi", "rock", etc.)
      setSearchQuery(query.trim());
      setActiveTab('explore');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#F1F1F1] flex flex-col font-sans">
      {/* 1. Global YouTube Dark Navigation Bar */}
      <Navbar
        room={room}
        currentUser={currentUser}
        isConnected={isConnected}
        onLeaveRoom={leaveRoom}
        onOpenCreateModal={() => {
          setModalInitialVideoId(null);
          setModalInitialRoomCode('');
          setRoomModalTab('create');
          setIsRoomModalOpen(true);
        }}
        onOpenJoinModal={() => {
          setModalInitialRoomCode('');
          setRoomModalTab('join');
          setIsRoomModalOpen(true);
        }}
        onSidebarToggle={() => setSidebarExpanded(!sidebarExpanded)}
        onSearchSubmit={handleSearchSubmit}
        onNavigateHome={() => {
          setSearchQuery('');
          setActiveTab('home');
        }}
        canControl={canControl}
      />

      <div className="flex pt-14 min-h-[calc(100vh-56px)]">
        {/* 2. Collapsible Left Sidebar */}
        <Sidebar
          isExpanded={sidebarExpanded}
          onToggle={() => setSidebarExpanded(!sidebarExpanded)}
          activeTab={activeTab}
          onTabChange={(tab) => {
            setSearchQuery('');
            setActiveTab(tab);
          }}
          selectedExploreCategory={selectedExploreCategory}
          onSelectExploreCategory={(cat) => {
            setSearchQuery('');
            setSelectedExploreCategory(cat);
            setActiveTab('explore');
          }}
          room={room}
          onOpenCreateModal={() => {
            setModalInitialVideoId(null);
            setModalInitialRoomCode('');
            setRoomModalTab('create');
            setIsRoomModalOpen(true);
          }}
          onOpenJoinModal={() => {
            setModalInitialRoomCode('');
            setRoomModalTab('join');
            setIsRoomModalOpen(true);
          }}
        />

        {/* 3. Main Content Area */}
        <main
          className={`flex-1 transition-all duration-200 p-4 sm:p-6 overflow-x-hidden ${
            sidebarExpanded ? 'md:ml-[230px]' : 'md:ml-[72px]'
          }`}
        >
          {/* Sticky Active Party Banner when browsing other tabs while in room */}
          {room && activeTab !== 'home' && (
            <div className="mb-6 p-3.5 bg-[#181818] border border-[#303030] rounded-2xl flex items-center justify-between shadow-xl animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#FF0033] animate-pulse flex-shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#FF0033] uppercase tracking-wider">
                      Live Party in Session
                    </span>
                    <span className="text-xs font-mono font-bold text-[#3EA6FF]">
                      #{room.roomId}
                    </span>
                  </div>
                  <p className="text-xs text-[#AAAAAA]">
                    {participants.length} watching • Video: {room.videoId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('home')}
                className="px-4 py-2 bg-[#FF0033] hover:bg-[#CC0029] text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-md transition"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Return to Video</span>
              </button>
            </div>
          )}

          {/* View Routing */}
          {activeTab === 'explore' ? (
            <ExplorePage
              selectedCategory={selectedExploreCategory}
              onSelectCategory={setSelectedExploreCategory}
              onSelectVideoForParty={handleSelectVideoForParty}
              searchQuery={searchQuery}
              onClearSearch={() => setSearchQuery('')}
              room={room}
              canControl={canControl}
            />
          ) : activeTab === 'parties' ? (
            <WatchPartiesPage
              room={room}
              currentUser={currentUser}
              onOpenCreateModal={() => {
                setModalInitialVideoId(null);
                setModalInitialRoomCode('');
                setRoomModalTab('create');
                setIsRoomModalOpen(true);
              }}
              onOpenJoinModal={() => {
                setModalInitialRoomCode('');
                setRoomModalTab('join');
                setIsRoomModalOpen(true);
              }}
              onJoinRoomDirectly={handleJoinRoomDirectly}
              onReturnToRoom={() => setActiveTab('home')}
            />
          ) : activeTab === 'history' ? (
            <HistoryPage
              onSelectVideoForParty={handleSelectVideoForParty}
              onJoinRoomDirectly={handleJoinRoomDirectly}
              room={room}
              canControl={canControl}
            />
          ) : room ? (
            /* Inside Watch Party Room (YouTube Watch Layout) */
            <WatchPartyLayout
              room={room}
              currentUser={currentUser}
              participants={participants}
              chatMessages={chatMessages}
              canControl={canControl}
              isHost={isHost}
              onPlay={sendPlay}
              onPause={sendPause}
              onSeek={sendSeek}
              onChangeVideo={sendChangeVideo}
              onAssignRole={assignRole}
              onRemoveParticipant={removeParticipant}
              onTransferHost={transferHost}
              onSendMessage={sendChat}
              onOpenSuggestVideo={() => setIsSuggestModalOpen(true)}
            />
          ) : (
            /* Homepage / Discovery Page (YouTube Discovery Grid) */
            <HomeDiscovery
              onSelectVideoForParty={handleSelectVideoForParty}
              onOpenCreateModal={() => {
                setModalInitialVideoId(null);
                setModalInitialRoomCode('');
                setRoomModalTab('create');
                setIsRoomModalOpen(true);
              }}
              onOpenJoinModal={() => {
                setModalInitialRoomCode('');
                setRoomModalTab('join');
                setIsRoomModalOpen(true);
              }}
            />
          )}
        </main>
      </div>

      {/* 4. Create / Join Room Modal */}
      <RoomModal
        isOpen={isRoomModalOpen}
        initialTab={roomModalTab}
        initialRoomCode={modalInitialRoomCode || new URLSearchParams(window.location.search).get('room') || ''}
        initialVideoId={modalInitialVideoId}
        onClose={() => {
          setIsRoomModalOpen(false);
          setModalInitialVideoId(null);
        }}
        onCreateRoom={(name, customCode, videoId) => {
          createRoom(name, customCode, videoId || modalInitialVideoId);
          setActiveTab('home');
        }}
        onJoinRoom={(code, name) => {
          joinRoom(code, name);
          setActiveTab('home');
        }}
      />

      {/* 5. Participant Suggestion Modal & Host Incoming Approval Banner */}
      <RequestChangeModal
        isOpen={isSuggestModalOpen}
        onClose={() => setIsSuggestModalOpen(false)}
        onSubmitRequest={submitChangeRequest}
        incomingRequests={incomingRequests}
        onResolveRequest={resolveChangeRequest}
        canControl={canControl}
      />

      {/* 6. YouTube-style Toast Notifications */}
      <Toast alert={systemAlert} />
    </div>
  );
}
