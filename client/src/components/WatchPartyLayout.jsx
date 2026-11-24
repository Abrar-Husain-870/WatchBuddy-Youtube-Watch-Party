import React, { useState, useRef } from 'react';
import { VideoPlayer } from './VideoPlayer';
import { VideoInformation } from './VideoInformation';
import { VideoControls } from './VideoControls';
import { ParticipantPanel } from './ParticipantPanel';
import { LiveChat } from './LiveChat';
import { MessageSquare, Users } from 'lucide-react';

export function WatchPartyLayout({
  room,
  currentUser,
  participants,
  chatMessages,
  canControl,
  isHost,
  onPlay,
  onPause,
  onSeek,
  onChangeVideo,
  onAssignRole,
  onRemoveParticipant,
  onTransferHost,
  onSendMessage,
  onOpenSuggestVideo
}) {
  const [rightPanelTab, setRightPanelTab] = useState('chat'); // 'chat' | 'participants'
  const [isChangeVideoOpen, setIsChangeVideoOpen] = useState(false);
  const [localTime, setLocalTime] = useState(room.currentTime || 0);
  const [duration, setDuration] = useState(0);
  const playerRefExternal = useRef(null);

  const handleTimeUpdate = (time, dur) => {
    setLocalTime(time);
    if (dur && dur > 0) setDuration(dur);
  };

  const handleControlsPlay = (time) => {
    if (playerRefExternal.current) {
      try {
        playerRefExternal.current.playVideo();
      } catch (e) {}
    }
    onPlay(time);
  };

  const handleControlsPause = (time) => {
    if (playerRefExternal.current) {
      try {
        playerRefExternal.current.pauseVideo();
      } catch (e) {}
    }
    onPause(time);
  };

  const handleControlsSeek = (time) => {
    if (playerRefExternal.current) {
      try {
        playerRefExternal.current.seekTo(time, true);
      } catch (e) {}
    }
    onSeek(time);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
      {/* Left Column (Video, Info, Controls) - ~75% width on desktop */}
      <div className="lg:col-span-8 xl:col-span-9 space-y-4">
        {/* Hero Video Player */}
        <VideoPlayer
          videoId={room.videoId}
          playState={room.playState}
          currentTime={room.currentTime}
          lastSeek={room.lastSeek}
          lastUpdated={room.lastUpdated}
          canControl={canControl}
          onPlay={onPlay}
          onPause={onPause}
          onTimeUpdate={handleTimeUpdate}
          playerRefExternal={playerRefExternal}
        />

        {/* Video Information & Share Actions */}
        <VideoInformation
          room={room}
          currentUser={currentUser}
          participantsCount={participants.length}
          canControl={canControl}
          onOpenChangeVideo={() => setIsChangeVideoOpen(!isChangeVideoOpen)}
          onOpenSuggestVideo={onOpenSuggestVideo}
        />

        {/* Playback Controls & Change Video Input */}
        <VideoControls
          playState={room.playState}
          currentTime={localTime}
          duration={duration}
          canControl={canControl}
          onPlay={handleControlsPlay}
          onPause={handleControlsPause}
          onSeek={handleControlsSeek}
          onChangeVideo={onChangeVideo}
          onOpenSuggestVideo={onOpenSuggestVideo}
          isChangeVideoOpen={isChangeVideoOpen}
          setIsChangeVideoOpen={setIsChangeVideoOpen}
        />
      </div>

      {/* Right Column: Collaboration Panel (Live Chat & Participants) - ~25% width */}
      <div className="lg:col-span-4 xl:col-span-3">
        <div className="bg-[#181818] border border-[#303030] rounded-xl flex flex-col h-[550px] lg:h-[calc(100vh-80px)] sticky top-16 shadow-xl overflow-hidden">
          {/* YouTube Live Chat Style Tab Switcher */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#303030] bg-[#181818]">
            <div className="flex gap-1 bg-[#121212] p-1 rounded-lg border border-[#303030]">
              <button
                onClick={() => setRightPanelTab('chat')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  rightPanelTab === 'chat'
                    ? 'bg-[#272727] text-[#F1F1F1] shadow-sm'
                    : 'text-[#AAAAAA] hover:text-[#F1F1F1]'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#FF0033]" />
                <span>Live Chat</span>
              </button>
              <button
                onClick={() => setRightPanelTab('participants')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  rightPanelTab === 'participants'
                    ? 'bg-[#272727] text-[#F1F1F1] shadow-sm'
                    : 'text-[#AAAAAA] hover:text-[#F1F1F1]'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-[#3EA6FF]" />
                <span>Participants ({participants.length})</span>
              </button>
            </div>
          </div>

          {/* Tab Body */}
          {rightPanelTab === 'chat' ? (
            <LiveChat
              chatMessages={chatMessages}
              onSendMessage={onSendMessage}
              currentUser={currentUser}
            />
          ) : (
            <ParticipantPanel
              participants={participants}
              currentUser={currentUser}
              isHost={isHost}
              onAssignRole={onAssignRole}
              onRemoveParticipant={onRemoveParticipant}
              onTransferHost={onTransferHost}
            />
          )}
        </div>
      </div>
    </div>
  );
}
