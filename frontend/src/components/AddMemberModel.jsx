import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useChatStore } from "../store/useChatStore";
import { User, UserPlus, X, ChevronDown } from "lucide-react";

const AddMemberModel = ({ groupId, onClose }) => {
  const { users, getUsers, selectedGroup, addMemberToGroup } = useChatStore();
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  useEffect(() => {
    const currentIds = selectedGroup.members.map((m) => m.user);
    const filtered = users.filter((u) => !currentIds.includes(u._id));
    setAvailableUsers(filtered);
  }, [users, selectedGroup]);

  const handleAdd = async () => {
    if (!selectedUserId) return toast.error("Please select a user");
    
    setLoading(true);
    try {
      await addMemberToGroup(groupId, selectedUserId);
      onClose();
    } catch (error) {
      toast.error("Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-base-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Add New Member</h2>
              <p className="text-xs text-base-content/60">
                {selectedGroup?.name}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="btn btn-sm btn-circle btn-ghost"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Select Member</span>
            </label>
            <div className="relative">
              <select
                className="select select-bordered w-full pl-10 pr-10 appearance-none"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">Choose a user to add...</option>
                {availableUsers.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.fullname}
                  </option>
                ))}
              </select>
              <div className="absolute left-3 top-3 text-base-content/50">
                <User size={16} />
              </div>
              <div className="absolute right-3 top-3 text-base-content/50">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button 
              onClick={onClose} 
              className="btn btn-ghost hover:bg-base-300"
            >
              Cancel
            </button>
            <button 
              onClick={handleAdd} 
              className="btn btn-primary gap-2"
              disabled={!selectedUserId || loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <UserPlus size={16} />
              )}
              Add Member
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMemberModel;