import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play } from 'lucide-react';

/**
 * YouTube Video Player Component
 * Robust IFrame API integration with fail-safe script loading and polling fallback.
 */
export function VideoPlayer({
  videoId,
  playState,
  currentTime,
  lastSeek,
  lastUpdated,
  canControl,
  onPlay,
  onPause,
  onTimeUpdate,
  playerRefExternal
}) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const isRemoteSyncRef = useRef(false);
  const remoteSyncTimeoutRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [needsUserGesture, setNeedsUserGesture] = useState(false);

  // Keep mutable refs for props to prevent stale closure bugs in YouTube IFrame event callbacks
  const canControlRef = useRef(canControl);
  canControlRef.current = canControl;

  const onPlayRef = useRef(onPlay);
  onPlayRef.current = onPlay;

  const onPauseRef = useRef(onPause);
  onPauseRef.current = onPause;

  const onTimeUpdateRef = useRef(onTimeUpdate);
  onTimeUpdateRef.current = onTimeUpdate;

  // Safe remote sync marker that self-clears after 600ms so controls never get stuck
  const markRemoteSync = useCallback(() => {
    isRemoteSyncRef.current = true;
    if (remoteSyncTimeoutRef.current) clearTimeout(remoteSyncTimeoutRef.current);
    remoteSyncTimeoutRef.current = setTimeout(() => {
      isRemoteSyncRef.current = false;
    }, 600);
  }, []);

  // Sync external ref whenever player is ready, attaching helper for layout controls
  useEffect(() => {
    if (playerRefExternal) {
      if (playerRef.current) {
        playerRef.current.markRemoteSync = markRemoteSync;
      }
      playerRefExternal.current = playerRef.current;
    }
  }, [playerRefExternal, isReady, markRemoteSync]);

  // Handler ref always pointing to freshest logic
  const handlePlayerStateChangeRef = useRef(null);
  handlePlayerStateChangeRef.current = (event) => {
    // If state change was caused by a remote WebSocket sync, do NOT echo back to server!
    if (isRemoteSyncRef.current) {
      isRemoteSyncRef.current = false;
      if (remoteSyncTimeoutRef.current) clearTimeout(remoteSyncTimeoutRef.current);
      return;
    }

    // Always check the current canControlRef value!
    if (!canControlRef.current) {
      return;
    }

    const state = event.data;
    const playerTime =
      playerRef.current && typeof playerRef.current.getCurrentTime === 'function'
        ? playerRef.current.getCurrentTime()
        : 0;

    // YT.PlayerState.PLAYING = 1
    if (state === 1) {
      if (onPlayRef.current) onPlayRef.current(playerTime);
    }
    // YT.PlayerState.PAUSED = 2
    else if (state === 2) {
      if (onPauseRef.current) onPauseRef.current(playerTime);
    }
  };

  // Fail-safe YouTube IFrame API Initialization
  useEffect(() => {
    let checkInterval = null;
    let isMounted = true;

    const tryInitPlayer = () => {
      if (!isMounted) return false;
      if (window.YT && window.YT.Player && containerRef.current) {
        // If player already initialized, do not re-create
        if (playerRef.current) return true;

        try {
          playerRef.current = new window.YT.Player(containerRef.current, {
            videoId: videoId || 'dQw4w9WgXcQ',
            playerVars: {
              autoplay: 0,
              controls: 1, // Full native controls for audio, fullscreen, CC
              disablekb: 0,
              modestbranding: 1,
              rel: 0,
              enablejsapi: 1,
              origin: window.location.origin
            },
            events: {
              onReady: (event) => {
                if (!isMounted) return;
                setIsReady(true);
                event.target.markRemoteSync = markRemoteSync;
                if (playerRefExternal) playerRefExternal.current = event.target;

                // Sync initial time
                if (currentTime && currentTime > 0) {
                  try {
                    event.target.seekTo(currentTime, true);
                  } catch (e) {}
                }

                // If room is playing, start playback
                if (playState === 'playing') {
                  try {
                    const p = event.target.playVideo();
                    if (p && typeof p.catch === 'function') {
                      p.catch(() => setNeedsUserGesture(true));
                    }
                  } catch (err) {
                    setNeedsUserGesture(true);
                  }
                }
              },
              onStateChange: (event) => {
                if (handlePlayerStateChangeRef.current) {
                  handlePlayerStateChangeRef.current(event);
                }
              },
              onError: (err) => {
                console.warn('YouTube Player Event Error:', err.data);
              }
            }
          });
          return true;
        } catch (e) {
          console.warn('Error during new window.YT.Player instantiation:', e);
          return false;
        }
      }
      return false;
    };

    // 1. Try immediate init if window.YT.Player already loaded
    if (!tryInitPlayer()) {
      // 2. Add script if not in document
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }

      // 3. Chain onYouTubeIframeAPIReady callback
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        tryInitPlayer();
      };

      // 4. Polling fallback in case onYouTubeIframeAPIReady already fired
      checkInterval = setInterval(() => {
        if (tryInitPlayer()) {
          clearInterval(checkInterval);
        }
      }, 100);
    }

    return () => {
      isMounted = false;
      if (checkInterval) clearInterval(checkInterval);
      if (remoteSyncTimeoutRef.current) clearTimeout(remoteSyncTimeoutRef.current);
      if (playerRef.current) {
        try {
          if (typeof playerRef.current.destroy === 'function') {
            playerRef.current.destroy();
          }
        } catch (e) {}
        playerRef.current = null;
      }
      if (playerRefExternal) {
        playerRefExternal.current = null;
      }
    };
  }, []);

  // Regular time and duration ticker for UI scrubber (every 500ms)
  useEffect(() => {
    const timer = setInterval(() => {
      if (isReady && playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        try {
          const time = playerRef.current.getCurrentTime();
          const duration = typeof playerRef.current.getDuration === 'function' ? playerRef.current.getDuration() : 0;
          if (onTimeUpdateRef.current && typeof time === 'number') {
            onTimeUpdateRef.current(time, duration);
          }
        } catch (e) {}
      }
    }, 500);

    return () => clearInterval(timer);
  }, [isReady]);

  // Handle Video ID change
  useEffect(() => {
    if (!isReady || !playerRef.current || !videoId) return;

    try {
      const currentUrl = typeof playerRef.current.getVideoUrl === 'function' ? playerRef.current.getVideoUrl() : '';
      if (!currentUrl.includes(videoId)) {
        markRemoteSync();
        playerRef.current.loadVideoById({
          videoId: videoId,
          startSeconds: 0
        });
        if (playState === 'paused' && typeof playerRef.current.pauseVideo === 'function') {
          playerRef.current.pauseVideo();
        }
      }
    } catch (e) {
      console.warn('Error loading video by ID:', e);
    }
  }, [videoId, isReady, markRemoteSync]);

  // Handle Play/Pause synchronization from remote server
  useEffect(() => {
    if (!isReady || !playerRef.current) return;

    try {
      const currentYtState = typeof playerRef.current.getPlayerState === 'function'
        ? playerRef.current.getPlayerState()
        : -1;

      if (playState === 'playing' && currentYtState !== 1) {
        markRemoteSync();
        if (typeof currentTime === 'number' && currentTime > 0 && typeof playerRef.current.seekTo === 'function') {
          playerRef.current.seekTo(currentTime, true);
        }
        if (typeof playerRef.current.playVideo === 'function') {
          const res = playerRef.current.playVideo();
          if (res && typeof res.catch === 'function') {
            res.catch(() => setNeedsUserGesture(true));
          }
        }
      } else if (playState === 'paused' && currentYtState === 1) {
        markRemoteSync();
        if (typeof playerRef.current.pauseVideo === 'function') {
          playerRef.current.pauseVideo();
        }
        if (typeof currentTime === 'number' && typeof playerRef.current.seekTo === 'function') {
          playerRef.current.seekTo(currentTime, true);
        }
      }
    } catch (e) {
      console.warn('Error syncing playback state:', e);
    }
  }, [playState, isReady, markRemoteSync]);

  // Handle explicit Seek events
  useEffect(() => {
    if (!isReady || !playerRef.current || !lastSeek) return;

    try {
      markRemoteSync();
      if (typeof playerRef.current.seekTo === 'function') {
        playerRef.current.seekTo(lastSeek.time, true);
      }
    } catch (e) {
      console.warn('Error handling seek event:', e);
    }
  }, [lastSeek, isReady, markRemoteSync]);

  // Periodic Gentle Drift Sync (checks every 4s, corrects only if > 3s out of sync)
  useEffect(() => {
    if (!isReady || !playerRef.current || playState !== 'playing' || !lastUpdated) return;

    const driftInterval = setInterval(() => {
      try {
        if (!playerRef.current || typeof playerRef.current.getCurrentTime !== 'function') return;
        const currentLocalTime = playerRef.current.getCurrentTime();
        const elapsedSinceLastUpdate = Math.max(0, (Date.now() - lastUpdated) / 1000);
        const expectedTime = (currentTime || 0) + elapsedSinceLastUpdate;
        const drift = Math.abs(currentLocalTime - expectedTime);

        // Only snap if drift is significant (> 3.0s)
        if (drift > 3.0 && typeof playerRef.current.seekTo === 'function') {
          markRemoteSync();
          playerRef.current.seekTo(expectedTime, true);
        }
      } catch (e) {}
    }, 4000);

    return () => clearInterval(driftInterval);
  }, [isReady, playState, currentTime, lastUpdated, markRemoteSync]);

  // User gesture button to bypass browser autoplay restrictions
  const handleUserGestureStart = () => {
    setNeedsUserGesture(false);
    if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
      markRemoteSync();
      try {
        playerRef.current.playVideo();
      } catch (e) {}
    }
  };

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-[#303030] shadow-xl group">
      <div ref={containerRef} className="w-full h-full min-h-[220px]" />

      {/* Browser Autoplay / Audio Gesture Unblocker Banner */}
      {needsUserGesture && (
        <div
          onClick={handleUserGestureStart}
          className="absolute inset-0 z-30 bg-black/80 flex flex-col items-center justify-center cursor-pointer p-4 text-center transition animate-fade-in"
        >
          <div className="w-16 h-16 rounded-full bg-[#FF0033] flex items-center justify-center text-white mb-3 shadow-lg shadow-[#FF0033]/30 hover:scale-105 transition">
            <Play className="w-8 h-8 fill-current ml-1" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Click to Watch & Listen</h3>
          <p className="text-xs text-[#AAAAAA] max-w-xs">
            Your browser requires a click to enable sound and video synchronization.
          </p>
        </div>
      )}

      {/* Participant Watch-Only Status Badge (Subtle, non-intrusive) */}
      {!canControl && !needsUserGesture && (
        <div className="absolute top-3 left-3 pointer-events-none px-2.5 py-1 rounded bg-[#0F0F0F]/80 backdrop-blur border border-[#303030] text-[11px] font-medium text-[#AAAAAA] flex items-center gap-1.5 shadow">
          <span className="w-2 h-2 rounded-full bg-[#2BAE66]" />
          <span>Synced with room</span>
        </div>
      )}
    </div>
  );
}
