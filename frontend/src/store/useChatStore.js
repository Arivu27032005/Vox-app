import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  groups: [],
  selectedGroup: null,
  groupMembers: [],
  currentGroupRole: null,
  isGroupsLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  setGroupIdentity: async ({ groupId, displayName, userId }) => {
  try {
    const res = await axiosInstance.post("/groups/set-identity", {
      groupId,
      displayName,
      userId,
    });
    set({ selectedGroup: res.data.group });
    toast.success("Group identity set");
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to set identity");
  }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messagedata) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messagedata);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    const socket = useAuthStore.getState().socket;
    if (!selectedUser || !socket?.connected) return;

    socket.off("newMessage");
    socket.on("newMessage", (newMessage) => {
      if (newMessage.senderId !== selectedUser._id) return;
      set((state) => ({
        messages: [...state.messages, newMessage],
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newMessage");
  },
  
  getGroupMessages: async (groupId) => {
  set({ isMessagesLoading: true });
  try {
    const res = await axiosInstance.get(`/groups/${groupId}/messages`);
    // only set once here
    set({ messages: res.data });
  } catch (e) {
    toast.error("Failed to load messages");
  } finally {
    set({ isMessagesLoading: false });
  }
  },

  sendGroupMessage: async ({ groupId, content, isImportant, importantType }) => {
    try {
      const messageType =
        isImportant && importantType?.type === "strict"
          ? "StrictReply"
          : isImportant
          ? "ShouldReply"
          : "Normal";

      const strictScope =
        messageType === "StrictReply"
          ? importantType?.scope === "all"
            ? "All"
            : "MembersOnly"
          : "None";

      const res = await axiosInstance.post(`/groups/${groupId}/messages`, {
        content,
        messageType,
        strictScope,
      });
    } catch (err) {
      console.error("Failed to send group message:", err);
      toast.error("Failed to send group message");
    }
  },

  subscribeToGroupMessages: () => {
  const { selectedGroup } = get();
  const socket = useAuthStore.getState().socket;

  if (!selectedGroup || !socket?.connected) return;

  const groupId = selectedGroup._id;

  socket.emit("joinGroups", [groupId]);

  socket.off("groupMessage");
  socket.off("groupMemberRoleUpdated");
  socket.off("importantMessageRespondersUpdated");

  socket.on("groupMessage", (newMessage) => {
    if (String(newMessage.group) === String(groupId)) {
      set((state) => ({
        messages: [...state.messages, newMessage],
      }));
    }
  });

  socket.on("groupMemberRoleUpdated", ({ groupId: updatedGroupId, updatedMember }) => {
    if (String(updatedGroupId) !== String(groupId)) return;

    set((state) => {
      const updatedMembers = state.selectedGroup.members.map((m) =>
        String(m.user?._id || m.user) === String(updatedMember.user)
          ? { ...m, role: updatedMember.newRole }
          : m
      );

      return {
        selectedGroup: {
          ...state.selectedGroup,
          members: updatedMembers,
        },
      };
    });
  });

  socket.on("importantMessageRespondersUpdated", ({ messageId, responders }) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg._id === messageId ? { ...msg, responders } : msg
      ),
    }));
  });

  socket.off("importantMessageIgnored");
  socket.on("importantMessageIgnored", ({ messageId, userId }) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg._id === messageId
          ? { ...msg, ignoredBy: [...(msg.ignoredBy || []), userId] }
          : msg
      ),
    }));
  });
  },

  unsubscribeFromGroupMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("groupMessage");
  },

  respondToImportantMessage: async ({ messageId, status, infoMessage }) => {
    try {
      const authUser = useAuthStore.getState().authUser;
      const { messages } = get();
      const formattedStatus = status === "success" ? "Success" : "Unable";

      const res = await axiosInstance.post(`/groups/important-response/${messageId}`, {
        status: formattedStatus,
        infoMessage,
      });

      toast.success("Response recorded");

      const socket = useAuthStore.getState().socket;
      if (socket?.connected) {
        socket.emit("importantResponseSubmitted", {
          messageId,
          status: formattedStatus,
          infoMessage,
        });
      }

      const updatedMessages = messages.map((msg) =>
        msg._id === messageId
          ? {
              ...msg,
              responders: [
                ...(msg.responders || []),
                {
                  user: authUser._id,
                  status: formattedStatus,
                  infoMessage,
                },
              ],
            }
          : msg
      );

      set({ messages: updatedMessages });
    } catch (error) {
      console.error("Important message response error", error);
      toast.error(error.response?.data?.message || "Failed to respond");
    }
  },

  ignoreImportantMessage: async ({ messageId, userId }) => {
  try {
    const { data } = await axiosInstance.put(
      `/groups/group-messages/${messageId}/ignore`,
      { userId }
    );
    return data;
  } catch (err) {
    console.error("Ignore failed:", err);
    throw err;
  }
  },

  getShouldBlockChat: ({ authUserId, selectedGroup, messages }) => {
  try {
    const strictMsg = [...messages]
      .reverse()
      .find((m) => m.messageType === "StrictReply");

    if (!strictMsg) return false;

    const scope = strictMsg.strictScope?.toLowerCase(); // Normalize scope string

    const userEntry = selectedGroup?.members?.find(
      (m) => String(m.user?._id || m.user) === String(authUserId)
    );
    const userRole = userEntry?.role;

    if (!userRole) return false;

    const hasResponded = strictMsg.responders?.some(
      (r) => String(r.user?._id || r.user) === String(authUserId)
    );

    if (hasResponded) return false;

    const shouldBlock =
      (scope === "membersonly" && userRole === "Member") ||
      (scope === "all" && ["Member", "Officer"].includes(userRole));

    return shouldBlock;
  } catch (err) {
    console.error("getShouldBlockChat error:", err);
    return false;
  }
  },
  
  setSelectedGroup: (group) => {
  if (!group) {
    set({
      selectedGroup: null,
      currentGroupRole: null,
      groupMembers: [],
      messages: [], 
      selectedUser: null ,
    });
    return;
  }

  const currentUserId = useAuthStore.getState().authUser._id;
  const memberEntry = group.members.find(
    (m) => m.user.toString() === currentUserId.toString()
  );
  const role = memberEntry?.role || null;

  set({
    selectedGroup: group,
    selectedUser: null,
    currentGroupRole: role,
    groupMembers: group.members,
    messages: [],
  });
  },

  fetchGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const res = await axiosInstance.get("/groups");
      set({ groups: res.data });
    } catch (error) {
      toast.error("Failed to load groups");
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  fetchGroupById: async (groupId) => {
    try {
      const res = await axiosInstance.get(`/groups/${groupId}`);
      const group = res.data;
      const authUser = useAuthStore.getState().authUser;
      const myEntry = group.members.find((m) => m.user.toString() === authUser._id.toString());
      const myRole = myEntry?.role || "Member";

      get().setSelectedGroup(group);
      get().setCurrentGroupRole(myRole);
    } catch (error) {
      toast.error("Failed to load group");
    }
  },

  addMemberToGroup: async (groupId, userId) => {
    try {
      const res = await axiosInstance.post("/groups/add-member", {
        groupId,
        newMember: { user: userId },
      });

      set((state) => ({
        selectedGroup: {
          ...state.selectedGroup,
          members: res.data.group.members,
        },
      }));
      toast.success("Member added successfully")
    } catch (err) {
      toast.error(err.response?.data?.message || "Error adding member");
    }
  },

  promoteMember: async (groupId, targetUserId, newRole) => {
    try {
      const res = await axiosInstance.post("/groups/promote", {
        groupId,
        targetUserId,
        newRole,
      });

      set((state) => ({
        selectedGroup: {
          ...state.selectedGroup,
          members: res.data.group.members,
        },
      }));

      toast.success(`Promoted to ${newRole}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Promotion failed");
    }
  },

  demoteMember: async (groupId, targetUserId) => {
  try {
    const res = await axiosInstance.post("/groups/demote", {
      groupId,
      targetUserId,
    });
    
    set((state) => ({
      selectedGroup: {
        ...state.selectedGroup,
        members: res.data.group.members,
      },
    }));
    
    toast.success("Member demoted to Member");
  } catch (err) {
    toast.error(err.response?.data?.message || "Demotion failed");
  }
  },
  
  setSelectedUser: (user) => {
  if (!user) {
    set({ selectedUser: null });
    return;
  }
  set({
    selectedUser: user,
    selectedGroup: null, 
    messages: [] 
  });
  }, 
  setGroups: (groups) => set({ groups }),
  setCurrentGroupRole: (role) => set({ currentGroupRole: role }),
}));
