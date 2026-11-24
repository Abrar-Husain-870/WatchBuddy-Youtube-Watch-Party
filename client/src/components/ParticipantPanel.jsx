import React, { useState } from 'react';
import { Crown, Shield, User, MoreVertical, UserMinus, ShieldAlert, ShieldCheck, ArrowRightLeft } from 'lucide-react';

export function ParticipantPanel({
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
        return <Crown className="w-3 h-3 text-[#FF0033]" />;
      case 'Moderator':
        return <Shield className="w-3 h-3 text-[#3EA6FF]" />;
      default:
        return <User className="w-3 h-3 text-[#AAAAAA]" />;
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Host':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FF0033]/15 text-[#FF0033] border border-[#FF0033]/30">
            Host
          </span>
        );
      case 'Moderator':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#3EA6FF]/15 text-[#3EA6FF] border border-[#3EA6FF]/30">
            Moderator
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#272727] text-[#AAAAAA] border border-[#303030]">
            Viewer
          </span>
        );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto divide-y divide-[#303030]/50 p-2 space-y-1">
      {participants.map((p) => {
        const isSelf = p.id === currentUser?.id;

        return (
          <div
            key={p.id}
            className="p-2 flex items-center justify-between rounded-lg hover:bg-[#272727]/60 transition relative group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Avatar with initial */}
              <div className="w-7 h-7 rounded-full bg-[#272727] flex items-center justify-center text-xs font-bold text-[#F1F1F1] shrink-0 border border-[#303030]">
                {p.username.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-[#F1F1F1] truncate">
                    {p.username}
                  </span>
                  {isSelf && (
                    <span className="text-[10px] text-[#717171] font-mono">(You)</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {getRoleBadge(p.role)}
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2BAE66]" title="Online" />
                </div>
              </div>
            </div>

            {/* Host Contextual Actions (3-dot menu) */}
            {isHost && !isSelf && (
              <div className="relative">
                <button
                  onClick={() => setActiveMenuId(activeMenuId === p.id ? null : p.id)}
                  className="p-1 rounded-full hover:bg-[#383838] text-[#AAAAAA] hover:text-[#F1F1F1] transition"
                  title="Manage user"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {activeMenuId === p.id && (
                  <div
                    className="absolute right-0 top-7 z-50 w-48 rounded-xl bg-[#212121] border border-[#303030] shadow-2xl p-1 text-xs space-y-0.5"
                    onMouseLeave={() => setActiveMenuId(null)}
                  >
                    {/* Promote / Demote */}
                    {p.role === 'Participant' ? (
                      <button
                        onClick={() => {
                          onAssignRole(p.id, 'Moderator');
                          setActiveMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#272727] text-[#3EA6FF] transition text-left"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Promote to Moderator</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          onAssignRole(p.id, 'Participant');
                          setActiveMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#272727] text-[#AAAAAA] transition text-left"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
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
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#272727] text-[#F1F1F1] transition text-left"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-[#FF0033]" />
                      <span>Transfer Host</span>
                    </button>

                    {/* Remove from Room */}
                    <button
                      onClick={() => {
                        if (confirm(`Remove ${p.username} from this watch party?`)) {
                          onRemoveParticipant(p.id);
                        }
                        setActiveMenuId(null);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#FF4E45]/20 text-[#FF4E45] transition text-left"
                    >
                      <UserMinus className="w-3.5 h-3.5" />
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
  );
}

