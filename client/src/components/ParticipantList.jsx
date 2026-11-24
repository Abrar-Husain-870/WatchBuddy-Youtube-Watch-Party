import React, { useState } from 'react';
import { Crown, Shield, User, MoreVertical, UserMinus, ShieldAlert, ShieldCheck, ArrowRightLeft } from 'lucide-react';

export function ParticipantList({
  participants,
  currentUser,
  isHost,
  onAssignRole,
  onRemoveParticipant,
  onTransferHost
}) {
  const [activeMenuId, setActiveMenuId] = useState(null);

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Host':
        return <Crown className="w-3.5 h-3.5 text-amber-400" />;
      case 'Moderator':
        return <Shield className="w-3.5 h-3.5 text-blue-400" />;
      default:
        return <User className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getRolePill = (role) => {
    switch (role) {
      case 'Host':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
            Host
          </span>
        );
      case 'Moderator':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
            Moderator
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            Viewer
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <span>Participants</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/20 text-purple-300">
            {participants.length}
          </span>
        </h3>
        <span className="text-[11px] text-slate-500">
          {isHost ? 'You are Host' : `Role: ${currentUser?.role || 'Viewer'}`}
        </span>
      </div>

      {/* Participant List */}
      <div className="divide-y divide-slate-800/60 overflow-y-auto max-h-72 mt-2 space-y-1">
        {participants.map((p) => {
          const isSelf = p.id === currentUser?.id;
          const isTargetHost = p.role === 'Host';

          return (
            <div
              key={p.id}
              className="pt-2 pb-2 px-2 flex items-center justify-between rounded-xl hover:bg-slate-800/40 transition group relative"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                  {getRoleIcon(p.role)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-200 truncate">
                      {p.username}
                    </span>
                    {isSelf && (
                      <span className="text-[10px] text-purple-400 font-mono">(You)</span>
                    )}
                  </div>
                  <div className="mt-0.5">{getRolePill(p.role)}</div>
                </div>
              </div>

              {/* Host Action Dropdown */}
              {isHost && !isSelf && (
                <div className="relative">
                  <button
                    onClick={() => setActiveMenuId(activeMenuId === p.id ? null : p.id)}
                    className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
                    title="Manage participant"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {activeMenuId === p.id && (
                    <div
                      className="absolute right-0 top-8 z-50 w-48 rounded-xl bg-slate-950 border border-slate-800 shadow-2xl p-1 text-xs space-y-1"
                      onMouseLeave={() => setActiveMenuId(null)}
                    >
                      {/* Promote / Demote */}
                      {p.role === 'Participant' ? (
                        <button
                          onClick={() => {
                            onAssignRole(p.id, 'Moderator');
                            setActiveMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-blue-500/20 text-blue-300 transition text-left"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                          <span>Promote to Moderator</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            onAssignRole(p.id, 'Participant');
                            setActiveMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 transition text-left"
                        >
                          <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                          <span>Demote to Viewer</span>
                        </button>
                      )}

                      {/* Transfer Host */}
                      <button
                        onClick={() => {
                          if (confirm(`Transfer Host privileges to ${p.username}?`)) {
                            onTransferHost(p.id);
                          }
                          setActiveMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-amber-500/20 text-amber-300 transition text-left"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
                        <span>Transfer Host</span>
                      </button>

                      {/* Kick Participant */}
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${p.username} from this watch party?`)) {
                            onRemoveParticipant(p.id);
                          }
                          setActiveMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-rose-500/20 text-rose-300 transition text-left"
                      >
                        <UserMinus className="w-3.5 h-3.5 text-rose-400" />
                        <span>Remove from Room</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

