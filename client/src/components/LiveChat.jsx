import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

export function LiveChat({
  chatMessages,
  onSendMessage,
  currentUser
}) {
  const [inputText, setInputText] = useState('');
  const containerRef = useRef(null);
  const isNearBottomRef = useRef(true);

  // Check if user is scrolled near bottom inside the chat container
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    isNearBottomRef.current = scrollHeight - scrollTop - clientHeight < 60;
  };

  // Scroll ONLY the inner chat div. Never scrolls the browser window/page.
  useEffect(() => {
    if (isNearBottomRef.current && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const getUsernameColor = (role) => {
    switch (role) {
      case 'Host':
        return 'text-[#FF0033] font-semibold';
      case 'Moderator':
        return 'text-[#3EA6FF] font-semibold';
      default:
        return 'text-[#AAAAAA] font-medium';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Scrollable Chat Feed */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 p-3 overflow-y-auto space-y-2 text-xs"
      >
        {chatMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-[#717171] space-y-1">
            <p className="font-medium text-[#AAAAAA]">Live Chat</p>
            <p className="text-[11px]">Chat with everyone in the room in real time.</p>
          </div>
        ) : (
          chatMessages.map((msg) => {
            // System message (joined/left/promoted)
            if (msg.isSystem) {
              return (
                <div
                  key={msg.id}
                  className="py-1 px-2.5 rounded bg-[#181818] border border-[#303030]/60 text-[11px] text-[#AAAAAA] text-center"
                >
                  <span>{msg.message}</span>
                </div>
              );
            }

            // Normal user message
            return (
              <div key={msg.id} className="flex items-start gap-2 leading-relaxed">
                <div className="w-6 h-6 rounded-full bg-[#272727] flex items-center justify-center text-[10px] font-bold text-[#F1F1F1] shrink-0 mt-0.5 border border-[#303030]">
                  {msg.username ? msg.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="inline items-baseline gap-1.5 mr-1.5">
                    <span className={`text-[11px] ${getUsernameColor(msg.role)}`}>
                      {msg.username}
                    </span>
                    <span className="text-[10px] text-[#717171] font-mono ml-1.5">
                      {msg.timestamp}
                    </span>
                  </div>
                  <span className="text-[#F1F1F1] break-words">
                    {msg.message}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Sticky Bottom Input Bar */}
      <form onSubmit={handleSend} className="p-2.5 border-t border-[#303030] bg-[#181818] flex items-center gap-2">
        <input
          type="text"
          placeholder="Say something..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 px-3.5 py-2 rounded-full bg-[#121212] border border-[#303030] focus:border-[#1C62B9] focus:outline-none text-xs text-[#F1F1F1] placeholder-[#717171]"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2 rounded-full bg-[#FF0033] hover:bg-[#CC0029] disabled:bg-[#272727] disabled:text-[#717171] text-white transition shadow-sm"
          title="Send message"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
