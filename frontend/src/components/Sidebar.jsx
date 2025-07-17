import React, { useEffect, useState, useRef } from 'react';
import { useChatStore } from '../store/useChatStore';
import SidebarSkeleton from './skeleton/SidebarSkeleton';
import { Users, Repeat, Menu } from "lucide-react";
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    getUsers();
    fetchGroups();
  }, []);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsMobileSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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

  if (isUsersLoading) return <SidebarSkeleton />;

  // Render the floating sidebar button for mobile
  const MobileSidebarButton = () => (
    <button
      onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      className="lg:hidden fixed bottom-4 left-4 z-40 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition"
    >
      <Menu className="size-5" />
    </button>
  );

  // Render the sidebar content
  const SidebarContent = () => (
    <div className='h-full w-full flex flex-col bg-base-100 shadow-sm'>
      {/* Header with toggle button */}
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
            <span className="text-white">Switch <Repeat className="size-3" /></span>
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

      {/* Scrollable content */}
      <div className='overflow-y-auto flex-1 w-full p-2 lg:p-3'>
        {/* GROUPS LIST */}
        {showGroups ? (
          <>
            <button
              onClick={() => setShowCreateGroupModal(true)}
              className="w-full bg-primary text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-primary/90 transition mb-3 lg:mb-4 border border-primary/20"
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
                  onClick={() => {
                    fetchGroupById(group._id);
                    setIsMobileSidebarOpen(false);
                  }}
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
            {/* CHATS LIST */}
            <div className='text-xs text-zinc-500 uppercase font-semibold mb-1 px-1 lg:px-2 border-b border-base-300 pb-1'>
              Chats
            </div>
            {filteredUsers.length === 0 ? (
              <div className='text-sm text-zinc-400 px-2'>No contacts available</div>
            ) : (
              filteredUsers.map((user) => (
                <button
                  key={user._id}
                  onClick={() => {
                  setSelectedUser(user);
                  setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full p-2 lg:p-3 flex items-center gap-2 lg:gap-3 hover:bg-base-300 transition-colors rounded-lg border border-transparent hover:border-base-300 ${
                  selectedUser?._id === user._id ? "bg-base-300 border-base-300" : ""
                  }`}
                >
               <div className='relative flex items-center gap-2'>
               <img
               src={user.profilePic || "/avatar.jpg"}
               alt={user.name}
               className='size-8 lg:size-10 object-cover rounded-full border border-base-200'
               />
              <span className='font-medium text-sm truncate max-w-[120px] lg:hidden'>
              {user.fullname}
              </span>
              {onlineUsers.includes(user._id) && (
             <span className='absolute bottom-0 right-0 lg:right-auto lg:left-9 size-2 lg:size-3 bg-green-500 rounded-full ring-1 lg:ring-2 ring-base-100' />
            )}
       </div>
     {/* Desktop name and status */}
        <div className='hidden lg:flex flex-col text-left min-w-0'>
             <div className='font-medium truncate'>{user.fullname}</div>
                <div className='text-xs lg:text-sm text-zinc-400'>
                  {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                 </div>
                </div>
               </button>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar - Always visible */}
      <aside className='hidden lg:block h-full w-72 border-r-2 border-base-300'>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar - Floating panel */}
      {isMobileSidebarOpen && (
        <div 
          ref={sidebarRef}
          className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-base-100 shadow-xl border-r-2 border-base-300 transform transition-transform duration-300 ease-in-out"
          style={{ maxHeight: '100vh' }}
        >
          <SidebarContent />
        </div>
      )}

      {/* Mobile Sidebar Toggle Button - Always visible on mobile */}
      <div className="lg:hidden fixed bottom-4 left-4 z-40">
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition"
        >
          <Menu className="size-5" />
        </button>
      </div>

      {/* Create Group */}
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
