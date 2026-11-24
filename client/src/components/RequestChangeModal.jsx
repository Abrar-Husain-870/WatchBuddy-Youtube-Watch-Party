import React, { useState } from 'react';
import { extractYouTubeId } from '../utils/youtubeHelper';
import { Check, X, Send, Video, Play, Pause, Bell } from 'lucide-react';

export function RequestChangeModal({
  isOpen,
  onClose,
  onSubmitRequest,
  incomingRequests,
  onResolveRequest,
  canControl
}) {
  const [requestType, setRequestType] = useState('change_video'); // 'change_video' | 'play' | 'pause'
  const [videoUrl, setVideoUrl] = useState('');
  const [previewId, setPreviewId] = useState(null);
  const [error, setError] = useState('');

  const handleUrlChange = (val) => {
    setVideoUrl(val);
    const id = extractYouTubeId(val);
    setPreviewId(id);
    if (error) setError('');
  };

  const handleSendRequest = (e) => {
    e.preventDefault();
    if (requestType === 'change_video') {
      const extractedId = extractYouTubeId(videoUrl);
      if (!extractedId) {
        return setError('Please enter a valid YouTube URL or 11-char ID.');
      }
      setError('');
      onSubmitRequest('change_video', { videoId: extractedId });
    } else {
      setError('');
      onSubmitRequest(requestType, {});
    }
    setVideoUrl('');
    setPreviewId(null);
    onClose();
  };

  return (
    <>
      {/* 1. Host/Moderator Incoming Request Banner (YouTube Dark Style) */}
      {canControl && incomingRequests && incomingRequests.length > 0 && (
        <div className="fixed bottom-5 right-5 z-50 space-y-2 max-w-sm w-full">
          {incomingRequests.map((req) => (
            <div
              key={req.id}
              className="bg-[#212121] border border-[#303030] rounded-xl p-4 shadow-2xl space-y-3 animate-fade-in"
            >
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#FF0033] animate-pulse" />
                <h4 className="text-xs font-semibold text-[#F1F1F1]">
                  Suggestion from <span className="text-[#3EA6FF]">{req.requesterName}</span>
                </h4>
              </div>

              {req.type === 'change_video' && req.details?.videoId ? (
                <div className="flex items-center gap-3 bg-[#181818] p-2 rounded-lg border border-[#303030]">
                  <img
                    src={`https://img.youtube.com/vi/${req.details.videoId}/hqdefault.jpg`}
                    alt="Suggested Thumbnail"
                    className="w-16 h-9 object-cover rounded"
                  />
                  <div className="text-xs min-w-0 flex-1">
                    <p className="text-[#AAAAAA]">Suggested Video:</p>
                    <p className="font-mono text-[#F1F1F1] truncate">{req.details.videoId}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#AAAAAA]">
                  Requested playback action: <span className="font-bold text-[#F1F1F1]">{req.type.toUpperCase()}</span>
                </p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => onResolveRequest(req.id, true)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[#2BAE66] hover:bg-[#259758] text-white text-xs font-semibold transition"
                >
                  <Check className="w-3.5 h-3.5" /> Approve
                </button>
                <button
                  onClick={() => onResolveRequest(req.id, false)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[#272727] hover:bg-[#383838] text-[#AAAAAA] hover:text-[#F1F1F1] text-xs font-semibold transition"
                >
                  <X className="w-3.5 h-3.5" /> Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Participant Request Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#212121] border border-[#303030] rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#303030]">
              <h3 className="text-sm font-semibold text-[#F1F1F1] flex items-center gap-2">
                <span>Suggest Action to Host & Moderator</span>
              </h3>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-[#AAAAAA] hover:text-[#F1F1F1] hover:bg-[#272727]"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#717171] mt-2 mb-4">
              Submit your video suggestion or playback request. The Host or Moderator can approve it in real-time.
            </p>

            <form onSubmit={handleSendRequest} className="space-y-4">
              {/* Type selector */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRequestType('change_video')}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
                    requestType === 'change_video'
                      ? 'bg-[#272727] border-[#FF0033] text-[#F1F1F1]'
                      : 'bg-[#181818] border-[#303030] text-[#717171] hover:text-[#F1F1F1]'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" /> Video
                </button>
                <button
                  type="button"
                  onClick={() => setRequestType('play')}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
                    requestType === 'play'
                      ? 'bg-[#272727] border-[#FF0033] text-[#F1F1F1]'
                      : 'bg-[#181818] border-[#303030] text-[#717171] hover:text-[#F1F1F1]'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" /> Play
                </button>
                <button
                  type="button"
                  onClick={() => setRequestType('pause')}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
                    requestType === 'pause'
                      ? 'bg-[#272727] border-[#FF0033] text-[#F1F1F1]'
                      : 'bg-[#181818] border-[#303030] text-[#717171] hover:text-[#F1F1F1]'
                  }`}
                >
                  <Pause className="w-3.5 h-3.5" /> Pause
                </button>
              </div>

              {requestType === 'change_video' && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-[#AAAAAA]">
                    YouTube Video URL or ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={videoUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-[#121212] border border-[#303030] focus:border-[#1C62B9] focus:outline-none text-xs text-[#F1F1F1] placeholder-[#717171]"
                  />

                  {/* Real-time YouTube Thumbnail Preview */}
                  {previewId && (
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-[#181818] border border-[#303030] mt-2">
                      <img
                        src={`https://img.youtube.com/vi/${previewId}/hqdefault.jpg`}
                        alt="Preview"
                        className="w-20 h-12 object-cover rounded"
                      />
                      <div className="text-xs text-[#AAAAAA]">
                        <span className="text-[#2BAE66] font-medium">✓ Valid Video ID</span>
                        <p className="font-mono text-[#F1F1F1] text-[11px]">{previewId}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {error && <p className="text-xs text-[#FF4E45]">{error}</p>}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 rounded-lg bg-[#272727] hover:bg-[#383838] text-[#AAAAAA] hover:text-[#F1F1F1] text-xs font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-[#FF0033] hover:bg-[#CC0029] text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
