import React, { useEffect, useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import SidebarSkeleton from './skeleton/SidebarSkeleton';
import { Users, Repeat, Menu, X } from "lucide-react";
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';
import { axiosInstance } from '../lib/axios';

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    isUsersLoading,
    setSelectedUser,
    groups,
    selectedGroup,
    fetchGroups,
    fetchGroupById,
    currentGroupRole
  } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showGroups, setShowGroups] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    getUsers();
    fetchGroups();
  }, []);

  const filteredUsers = showOnlineOnly
    ? users.filter(user => onlineUsers.includes(user._id))
    : users;

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return toast.error("Group name required");

    try {
      setIsCreating(true);
      const res = await axiosInstance.post("/groups", { groupName });
      toast.success("Group created");
      fetchGroups();
      setShowCreateGroupModal(false);
      setGroupName("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create group");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setIsMobileOpen(false);
  };

  const handleSelectGroup = (group) => {
    fetchGroupById(group._id);
    setIsMobileOpen(false);
  };

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition-transform hover:scale-110"
        aria-label={isMobileOpen ? "Close menu" : "Open menu"}
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Container (Hidden on Mobile when Closed) */}
      <aside className={`
        ${isMobileOpen ? 'fixed' : 'hidden lg:block'}
        h-screen w-[280px] max-w-full lg:w-20 xl:w-72
        border-r-2 border-base-300
        bg-base-100 shadow-sm
        z-30
      `}>
        {/* Header */}
        <div className='border-b-2 border-base-300 w-full p-4 lg:p-5 bg-base-100'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Users className="size-5 lg:size-6 text-primary" />
              <span className='font-medium hidden lg:block text-base'>
                {showGroups ? "Groups" : "Chats"}
              </span>
            </div>
            <button
              onClick={() => setShowGroups(prev => !prev)}
              className='btn btn-sm btn-circle btn-ghost hover:bg-base-300'
              title="Switch Chats/Groups"
            >
              <Repeat className="size-4" />
            </button>
          </div>

          {!showGroups && (
            <div className='mt-2 lg:mt-3 hidden lg:flex items-center gap-2'>
              <label className='cursor-pointer flex items-center gap-2'>
                <input
                  type="checkbox"
                  checked={showOnlineOnly}
                  onChange={(e) => setShowOnlineOnly(e.target.checked)}
                  className='checkbox checkbox-sm checkbox-primary'
                />
                <span className='text-sm'>Online only</span>
              </label>
              <span className='text-xs text-zinc-500'>
                ({onlineUsers.length - 1} online)
              </span>
            </div>
          )}
        </div>

        {/* Scrollable Content (Full Height - Scrollable) */}
        <div className='overflow-y-auto h-[70vh] lg:h-[calc(100vh-68px)] w-full p-2 lg:p-3'>
          {showGroups ? (
            <>
              <button
                onClick={() => setShowCreateGroupModal(true)}
                className="w-full bg-primary text-white py-2 px-3 rounded-lg mb-3 lg:mb-4"
              >
                + Create Group
              </button>

              <div className='text-xs text-zinc-500 uppercase font-semibold mb-1 px-1 lg:px-2 hidden lg:block border-b border-base-300 pb-1'>
                Your Groups
              </div>
              {groups.length === 0 ? (
                <div className='text-xs text-zinc-400 px-2'>No groups yet</div>
              ) : (
                groups.map((group) => (
                  <button
                    key={group._id}
                    onClick={() => handleSelectGroup(group)}
                    className={`w-full text-left p-2 lg:px-3 lg:py-2 rounded-lg hover:bg-base-300 transition border border-transparent hover:border-base-300 ${
                      selectedGroup?._id === group._id ? "bg-base-300 border-base-300" : ""
                    }`}
                  >
                    <div className='font-medium truncate text-xs lg:text-sm'>
                      {group.name}
                    </div>
                    {selectedGroup?._id === group._id && currentGroupRole !== "Member" && (
                      <div className='text-xs text-zinc-400 hidden lg:block'>
                        You are: {currentGroupRole}
                      </div>
                    )}
                  </button>
                ))
              )}
            </>
          ) : (
            <>
              <div className='text-xs text-zinc-500 uppercase font-semibold mb-1'>
                Chats
              </div>
              {filteredUsers.length === 0 ? (
                <div className='text-sm text-zinc-400 px-2'>No contacts available</div>
              ) : (
                   filteredUsers.map((user) => (
  <button
    key={user._id}
    onClick={() => handleSelectUser(user)}
    className={`w-full p-2 lg:p-3 flex items-center gap-2 lg:gap-3 hover:bg-base-300 transition-colors rounded-lg border border-transparent hover:border-base-300 ${
      selectedUser?._id === user._id ? "bg-base-300 border-base-300" : ""
    }`}
  >
    <div className='relative'>
      <img
        src={user.profilePic || "/avatar.jpg"}
        alt={user.name}
        className='size-8 lg:size-10 object-cover rounded-full border border-base-200'
      />
      {onlineUsers.includes(user._id) && (
        <span className='absolute bottom-0 right-0 size-2 lg:size-3 bg-green-500 rounded-full ring-1 lg:ring-2 ring-base-100' />
      )}
    </div>
    {/* Changed: Always show name (mobile+desktop) */}
    <div className='text-left min-w-0'>
      <div className='font-medium truncate text-sm'>{user.fullname}</div>
      <div className='text-xs text-zinc-400 lg:block'>
        {onlineUsers.includes(user._id) ? "Online" : "Offline"}
      </div>
    </div>
  </button>
))
              )}
            </>
          )}
        </div>
      </aside>

      {/* Create Group Modal */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-lg p-4 lg:p-6 w-[90%] max-w-md border-2 border-base-300 shadow-lg">
            <h2 className="text-lg font-semibold mb-3">Create New Group</h2>
            <input
              type="text"
              placeholder="Group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="input input-bordered w-full mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setShowCreateGroupModal(false)} 
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                className="btn btn-primary"
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;