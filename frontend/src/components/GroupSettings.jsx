import React, { useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import AddMemberModel from './AddMemberModel';
import { UserPlus } from 'lucide-react';

const GroupSettings = () => {
  const { selectedGroup, promoteMember, demoteMember } = useChatStore();
  const { authUser } = useAuthStore();

  const [showAddModal, setShowAddModal] = useState(false);

  if (!selectedGroup) return null;

  const currentUserEntry = selectedGroup.members.find(
    (m) => String(m.user?._id || m.user) === String(authUser._id)
  );

  const currentRole = currentUserEntry?.role;
  const canAddMembers = ["Leader", "Assistant", "Officer"].includes(currentRole);

  const handlePromote = async (memberId, newRole) => {
    await promoteMember(selectedGroup._id, memberId, newRole);
  };

  const handleDemote = async (memberId) => {
    await demoteMember(selectedGroup._id, memberId);
  };

  return (
    <div className="p-4 bg-base-100 rounded-lg border border-base-300 w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Group Members</h2>
        {canAddMembers && (
          <button 
            onClick={() => setShowAddModal(true)} 
            className="btn btn-sm btn-primary gap-1"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        )}
      </div>

      <ul className="space-y-2">
        {selectedGroup.members.map((member) => {
          const isTargetMember = String(member.user?._id || member.user) !== String(authUser._id);
          const alreadyHasAssistant = selectedGroup.members.some(
            (m) => m.role === "Assistant"
          );

          const canPromoteToOfficer =
            isTargetMember &&
            ["Leader", "Assistant"].includes(currentRole) &&
            member.role === "Member";

          const canPromoteToAssistant =
            currentRole === "Leader" &&
            isTargetMember &&
            ["Member", "Officer"].includes(member.role) &&
            !alreadyHasAssistant;
          
          const canDemoteToMember = 
            isTargetMember &&
            (
              (currentRole === "Leader" && ["Assistant", "Officer"].includes(member.role)) ||
              (currentRole === "Assistant" && member.role === "Officer")
            );

          return (
            <li 
              key={member.user?._id || member.user} 
              className="flex justify-between items-center py-2 border-b border-base-200 last:border-0"
            >
              <div>
                <div className="font-medium">{member.displayName || "Unnamed"}</div>
                <div className="text-sm text-base-content/70">{member.userId || "No ID"}</div>
                <div className="text-xs text-base-content/50">Role: {member.role}</div>
              </div>

              <div className="flex gap-1">
                {canPromoteToOfficer && (
                  <button
                    className="btn btn-xs btn-outline"
                    onClick={() => handlePromote(member.user?._id || member.user, "Officer")}
                  >
                    To Officer
                  </button>
                )}

                {canPromoteToAssistant && (
                  <button
                    className="btn btn-xs btn-outline"
                    onClick={() => handlePromote(member.user?._id || member.user, "Assistant")}
                  >
                    To Assistant
                  </button>
                )}
                
                {canDemoteToMember && (
                  <button
                    className="btn btn-xs btn-outline btn-error"
                    onClick={() => handleDemote(member.user?._id || member.user)}
                  >
                    To Member
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {showAddModal && (
        <AddMemberModel
          groupId={selectedGroup._id}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
};

export default GroupSettings;