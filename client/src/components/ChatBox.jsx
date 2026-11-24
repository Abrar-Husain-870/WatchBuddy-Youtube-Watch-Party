import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Activity, Crown, Shield } from 'lucide-react';

export function ChatBox({ chatMessages, onSendMessage, currentUser }) {
  const [tab, setTab] = useState('chat'); // 'chat' | 'activity'
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, tab]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const getRoleBadge = (role) => {
    if (role === 'Host') {
      return <Crown className="w-2.5 h-2.5 text-amber-400 inline" />;
    }
    if (role === 'Moderator') {
      return <Shield className="w-2.5 h-2.5 text-blue-400 inline" />;
    }
    return null;
  };

  const userMessages = chatMessages.filter(m => !m.isSystem);
  const activityMessages = chatMessages.filter(m => m.isSystem);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col h-[420px]">
      {/* Header Tabs */}
      <div className="flex items-center justify-between p-2.5 border-b border-slate-800">
        <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
              tab === 'chat'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat</span>
          </button>
          <button
            onClick={() => setTab('activity')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
              tab === 'activity'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Activity</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-500 px-2 font-mono">
          {tab === 'chat' ? `${userMessages.length} msgs` : `${activityMessages.length} events`}
        </span>
      </div>

      {/* Message Feed */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {tab === 'chat' ? (
          userMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs">
              <MessageSquare className="w-6 h-6 mb-2 stroke-slate-600" />
              <p>No messages yet.</p>
              <p className="text-[11px] text-slate-600 mt-0.5">Say hello to the watch party!</p>
            </div>
          ) : (
            userMessages.map((msg) => {
              const isSelf = msg.userId === currentUser?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                      {msg.username}
                      {getRoleBadge(msg.role)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
                  </div>
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs break-words shadow-sm ${
                      isSelf
                        ? 'bg-purple-600 text-white rounded-br-none'
                        : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/60'
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              );
            })
          )
        ) : (
          activityMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs">
              <Activity className="w-6 h-6 mb-2 stroke-slate-600" />
              <p>No activity logged yet.</p>
            </div>
          ) : (
            activityMessages.map((evt) => (
              <div
                key={evt.id}
                className="text-[11px] text-slate-400 bg-slate-950/60 border border-slate-800/80 rounded-xl p-2 flex items-center justify-between"
              >
                <span>{evt.message}</span>
                <span className="text-[10px] text-slate-600 font-mono ml-2 shrink-0">{evt.timestamp}</span>
              </div>
            ))
          )
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Row */}
      {tab === 'chat' && (
        <form onSubmit={handleSend} className="p-2.5 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 text-xs text-slate-100 placeholder-slate-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-600 text-white transition shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}

