import React, { useState, useEffect } from 'react';
import { AlertTriangle, Crown, Shield, User, X, LogOut, ArrowRight } from 'lucide-react';

export function HostLeaveModal({
  isOpen,
  onClose,
  currentUser,
  participants = [],
  onTransferAndLeave,
  onEndParty
}) {
  const eligibleCandidates = participants.filter((p) => p.id !== currentUser?.id);

  // Pre-select the first Moderator, or the first eligible participant
  const defaultCandidate =
    eligibleCandidates.find((p) => p.role === 'Moderator') || eligibleCandidates[0];

  const [selectedUserId, setSelectedUserId] = useState(defaultCandidate?.id || '');

  useEffect(() => {
    if (eligibleCandidates.length > 0 && (!selectedUserId || !eligibleCandidates.some(c => c.id === selectedUserId))) {
      setSelectedUserId(defaultCandidate?.id || eligibleCandidates[0]?.id || '');
    }
  }, [participants, currentUser, selectedUserId]);

  if (!isOpen) return null;

  const handleTransferAndLeave = () => {
    if (!selectedUserId) return;
    onTransferAndLeave(selectedUserId);
    onClose();
  };

  const handleEndParty = () => {
    onEndParty();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#212121] border border-[#303030] rounded-xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#303030] bg-[#181818]">
          <div className="flex items-center gap-2 text-[#FF4E45]">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <h3 className="text-base font-semibold text-[#F1F1F1]">
              Host Departure Restriction
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#272727] text-[#AAAAAA] hover:text-[#F1F1F1] transition"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Rule Invariant Warning Banner */}
          <div className="p-3.5 rounded-lg bg-[#FF4E45]/10 border border-[#FF4E45]/25 text-xs text-[#F1F1F1] leading-relaxed">
            <span className="font-semibold text-[#FF4E45] block mb-1">
              👑 A Watch Party cannot exist without a Host.
            </span>
            Because other participants are currently in this room, you cannot leave without choosing a successor or ending the party.
          </div>

          {/* Option A: Transfer Host & Leave */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#F1F1F1] uppercase tracking-wider flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-[#FFD700]" />
                Option 1: Transfer Host & Leave
              </span>
              <span className="text-[11px] text-[#AAAAAA]">
                Party continues smoothly
              </span>
            </div>

            <p className="text-xs text-[#AAAAAA]">
              Select a member to become the new Room Host before you exit:
            </p>

            {/* Member Selection List */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {eligibleCandidates.map((member) => {
                const isSelected = selectedUserId === member.id;
                return (
                  <div
                    key={member.id}
                    onClick={() => setSelectedUserId(member.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${
                      isSelected
                        ? 'bg-[#272727] border-[#FF0033] shadow-sm'
                        : 'bg-[#181818] border-[#303030] hover:border-[#404040]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-[#303030] flex items-center justify-center font-bold text-xs text-[#F1F1F1] flex-shrink-0">
                        {member.username.charAt(0).toUpperCase()}
                      </div>

                      {/* Name & Role */}
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-[#F1F1F1] truncate">
                          {member.username}
                        </p>
                        <div className="flex items-center gap-1 text-[11px] text-[#AAAAAA]">
                          {member.role === 'Moderator' ? (
                            <>
                              <Shield className="w-3 h-3 text-[#3EA6FF]" />
                              <span className="text-[#3EA6FF]">Moderator</span>
                            </>
                          ) : (
                            <>
                              <User className="w-3 h-3 text-[#717171]" />
                              <span>Participant</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Radio Indicator */}
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? 'border-[#FF0033] bg-[#FF0033]'
                          : 'border-[#555555]'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              disabled={!selectedUserId || eligibleCandidates.length === 0}
              onClick={handleTransferAndLeave}
              className="w-full py-2.5 px-4 rounded-lg bg-[#F1F1F1] hover:bg-white text-black font-semibold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              <Crown className="w-4 h-4 text-[#D97706]" />
              <span>Transfer Host to Selected Member & Leave</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#303030] w-full" />
            <span className="bg-[#212121] px-3 text-[11px] font-semibold text-[#717171] uppercase tracking-wider absolute">
              OR
            </span>
          </div>

          {/* Option B: End Party for Everyone */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#FF4E45] uppercase tracking-wider flex items-center gap-1.5">
                <LogOut className="w-4 h-4 text-[#FF4E45]" />
                Option 2: End Party for Everyone
              </span>
              <span className="text-[11px] text-[#FF4E45]">
                Destructive action
              </span>
            </div>

            <p className="text-xs text-[#AAAAAA]">
              Terminate the room now. All {eligibleCandidates.length} other participants and moderators will be disconnected and returned to the discovery screen.
            </p>

            <button
              type="button"
              onClick={handleEndParty}
              className="w-full py-2.5 px-4 rounded-lg bg-[#FF0033] hover:bg-[#CC0029] text-white font-semibold text-xs flex items-center justify-center gap-2 transition shadow-md active:scale-98"
            >
              <LogOut className="w-4 h-4" />
              <span>End Watch Party for Everyone</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#303030] bg-[#181818] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#272727] hover:bg-[#303030] text-[#F1F1F1] text-xs font-medium transition"
          >
            Cancel & Stay in Room
          </button>
        </div>
      </div>
    </div>
  );
}
