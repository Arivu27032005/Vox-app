import Group from "../models/group.model.js";
import User from "../models/user.model.js";
import GroupMessage from "../models/GroupMessageSchema.js";
import Message from "../models/message.model.js"
import mongoose from "mongoose";

export const createGroup = async (req, res) => {
  try {
    const { groupName } = req.body;

    if (!groupName) {
      return res.status(400).json({ message: "Group name is required" });
    }

    const creatorId = req.user._id;
    const user = await User.findById(creatorId).select("fullname");
    const newGroup = new Group({
      name: groupName,
      members: [
        {
          user: creatorId,
          role: "Leader",
          displayName: user?.fullname || "",
          userId: null,
        },
      ],
    });

    await newGroup.save();

    res.status(201).json({
      _id: newGroup._id,
      name: newGroup.name,
      role: "Leader", 
    });
  } catch (error) {
    console.error("Create Group Error:", error.message);
    res.status(500).json({ message: "Failed to create group" });
  }
};

export const setGroupIdentity = async (req, res) => {
  try {
    const { groupId, displayName, userId } = req.body;
    const currentUserId = req.user._id;

    if (!displayName || !userId) {
      return res.status(400).json({ message: "Both display name and user ID are required" });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const isDuplicate = group.members.some(
      (m) => m.userId?.toLowerCase() === userId.toLowerCase() && m.user.toString() !== currentUserId.toString()
    );
    if (isDuplicate) {
      return res.status(400).json({ message: "User ID already taken in this group" });
    }
    
    const member = group.members.find((m) => m.user.toString() === currentUserId.toString());
    if (!member) return res.status(403).json({ message: "You are not part of this group" });

    member.displayName = displayName;
    member.userId = userId;

    await group.save();
    res.status(200).json({ message: "Identity set successfully", group });
  } catch (err) {
    console.error("SetGroupIdentity error", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const promoteMember = async (req, res) => {
  try {
    const { groupId, targetUserId, newRole } = req.body;
    const currentUserId = req.user._id;

    if (!groupId || !targetUserId || !newRole) {
      return res.status(400).json({ message: "groupId, targetUserId, and newRole are required" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const currentUserEntry = group.members.find(
      (member) => member.user.toString() === currentUserId.toString()
    );
    if (!currentUserEntry) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    const currentRole = currentUserEntry.role;

    if (newRole === "Assistant") {
      if (currentRole !== "Leader") {
        return res.status(403).json({ message: "Only Leader can assign Assistant role" });
      }

      const existingAssistant = group.members.find(
        (member) => member.role === "Assistant"
      );

      if (existingAssistant) {
        return res.status(400).json({ message: "Only one Assistant is allowed per group" });
      }
    }

    if (newRole === "Officer" && !["Leader", "Assistant"].includes(currentRole)) {
      return res.status(403).json({ message: "Only Leader or Assistant can assign Officer role" });
    }

    const targetMember = group.members.find(
      (member) => member.user.toString() === targetUserId
    );
    if (!targetMember) {
      return res.status(404).json({ message: "Target member not found in group" });
    }

    targetMember.role = newRole;
    await group.save();

    req.app.get("io").to(groupId).emit("groupMemberRoleUpdated", {
      groupId,
      updatedMember: {
        user: targetUserId,
        newRole,
      },
    });

    res.status(200).json({ message: `User promoted to ${newRole}`, group });
  } catch (error) {
    console.error("Promote Error:", error.message);
    res.status(500).json({ message: "Server error during promotion" });
  }
};

export const demoteMember = async (req, res) => {
  try {
    const { groupId, targetUserId } = req.body;
    const currentUserId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const currentUserEntry = group.members.find(
      m => String(m.user) === String(currentUserId)
    );
    const currentRole = currentUserEntry?.role;

    const targetMember = group.members.find(
      m => String(m.user) === String(targetUserId)
    );
    
    if (currentRole === "Leader") {
      if (!["Assistant", "Officer"].includes(targetMember.role)) {
        return res.status(403).json({ message: "Leader can only demote Assistants and Officers" });
      }
    }
    else if (currentRole === "Assistant") {
      if (targetMember.role !== "Officer") {
        return res.status(403).json({ message: "Assistant can only demote Officers" });
      }
    }
    else {
      return res.status(403).json({ message: "You don't have permission to demote" });
    }

    targetMember.role = "Member";
    await group.save();

    req.app.get("io").to(groupId).emit("groupMemberRoleUpdated", {
      groupId,
      updatedMember: {
        user: targetUserId,
        newRole: "Member",
      },
    });

    res.status(200).json({ message: "User demoted to Member", group });
  } catch (error) {
    console.error("Demote Error:", error.message);
    res.status(500).json({ message: "Server error during demotion" });
  }
};

export const addMemberToGroup = async (req, res) => {
  try {
    const { groupId, newMember } = req.body;
    const currentUserId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const currentUserEntry = group.members.find(
      (m) => m.user.toString() === currentUserId.toString()
    );
    
    if (!currentUserEntry || !['Leader', 'Assistant', 'Officer'].includes(currentUserEntry.role)) {
      return res.status(403).json({ message: "You are not able to add members" });
    }

    const alreadyInGroup = group.members.some(
      (m) => m.user.toString() === newMember.user
    );
    if (alreadyInGroup) {
      return res.status(400).json({ message: "User already in group" });
    }

    group.members.push({
      user: newMember.user,
      displayName: "",
      userId: null,
      role: "Member",
      joinedAt: new Date(),
    });

    await group.save();
    res.status(200).json({message :"Member added successfully", group });
  } catch (error) {
    console.error("Add Member Error:", error.message);
    res.status(500).json({ message: "Server error while adding member" });
  }
};

export const changeDisplayName = async (req, res) => {
  try {
    const { groupId, displayName, userId } = req.body;
    const currentUserId = req.user._id;

    if (!groupId || !displayName || !userId) {
      return res.status(400).json({ message: "groupId, displayName, and userId are required" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const member = group.members.find(
      (m) => m.user.toString() === currentUserId.toString()
    );

    if (!member) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    member.displayName = displayName;
    member.userId = userId;

    await group.save();

    res.status(200).json({ message: "Your group identity has been updated", group });

  } catch (error) {
    console.error("Error in updating displayName/userId:", error.message);
    res.status(500).json({ message: "Server error while updating name/ID" });
  }
};

export const getAllGroupsForUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await Group.find({ "members.user": userId })
      .select("_id name members")
      .lean();

    const userGroups = groups.map((group) => {
      const userEntry = group.members.find(
        (m) => m.user.toString() === userId.toString()
      );
      return {
        _id: group._id,
        name: group.name,
        role: userEntry?.role || "Member"
      };
    });

    res.status(200).json(userGroups);
  } catch (error) {
    console.error("Get Groups Error:", error.message);
    res.status(500).json({ message: "Failed to fetch groups" });
  }
};

export const getGroupById = async (req, res) => {
  try {
    const userId = req.user._id;
    const groupId = req.params.groupId;

    const group = await Group.findById(groupId).lean();

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const isMember = group.members.some(
      (m) => m.user.toString() === userId.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(group);
  } catch (error) {
    console.error("Get Group Error:", error.message);
    res.status(500).json({ message: "Failed to get group details" });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.user._id;

    const group = await Group.findById(groupId).populate("members.user");
    if (!group) return res.status(404).json({ message: "Group not found" });

    const member = group.members.find(
      (m) => String(m.user?._id || m.user) === String(userId)
    );
    if (!member) return res.status(403).json({ message: "Not a group member" });

    const rawMessages = await GroupMessage.find({
      group: groupId,
      createdAt: { $gte: member.joinedAt || new Date(0) },
    })
      .sort({ createdAt: 1 })
      .populate("sender", "fullname profilePic");

    const messages = rawMessages.map((msg) => {
      const member = group.members.find(
        (m) => m.user.toString() === msg.sender._id.toString()
      );

      return {
        _id: msg._id,
        text: msg.text,
        image: msg.image || null,
        sender: {
          _id: msg.sender._id,
          profilePic: msg.sender.profilePic,
          displayName: member?.displayName || msg.sender.fullname || "Member",
        },
        messageType: msg.messageType || "Normal",
        strictScope: msg.strictScope || "None",
        responders: msg.responders || [],
        ignoredBy: msg.ignoredBy || [],
        group: msg.group,
        createdAt: msg.createdAt,
      };
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Get Group Messages Error:", error.message);
    res.status(500).json({ message: "Server error while fetching messages" });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { content, messageType, strictScope, image } = req.body;
    const { groupId } = req.params;
    const senderId = req.user._id;

    if (!content && !image) {
      return res.status(400).json({
        message: "Message content or image is required",
      });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const isMember = group.members.some(
      (m) => m.user.toString() === senderId.toString()
    );
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group" });
    }

    const strictMessages = await Message.find({
      group: groupId,
      messageType: "StrictReply",
    });

    for (let msg of strictMessages) {
      const alreadyResponded = msg.responders?.some(
        (r) => r.user.toString() === senderId.toString()
      );

      const isRestricted =
        msg.strictScope === "All" ||
        (msg.strictScope === "MembersOnly" &&
          group.members.some(
            (m) =>
              m.user.toString() === senderId.toString() &&
              m.role === "Member"
          ));

      if (!alreadyResponded && isRestricted) {
        return res.status(403).json({
          message:
            "You must respond to a strict important message before sending new messages.",
        });
      }
    }

    const finalType =
      messageType === "StrictReply"
        ? "StrictReply"
        : messageType === "ShouldReply" || messageType === "NormalImportant"
        ? "ShouldReply"
        : "Normal";

    const finalScope =
      finalType === "StrictReply"
        ? strictScope === "All"
          ? "All"
          : "MembersOnly"
        : "None";

    const newMessage = await GroupMessage.create({
      sender: senderId,
      group: groupId,
      text: content || null,
      image: image || null,
      messageType: finalType,
      strictScope: finalScope,
      responders: [],
    });

    const sender = await User.findById(senderId).select("fullname profilePic");

    const senderEntry = group.members.find(
      (m) => m.user.toString() === senderId.toString()
    );

    const populatedMessage = {
      _id: newMessage._id,
      text: newMessage.text,
      image: newMessage.image || null,
      sender: {
        _id: senderId,
        profilePic: sender.profilePic,
        displayName: senderEntry?.displayName || "Member",
      },
      messageType: finalType,
      strictScope: finalScope,
      group: groupId,
      createdAt: newMessage.createdAt,
      responders: [],
    };

    req.io?.to(`group_${groupId}`).emit("groupMessage", populatedMessage);

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Send Group Message Error:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};
 
export const respondToImportantMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { status, infoMessage } = req.body;
    const userId = req.user._id;

    if (!status || !["Success", "Unable"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const message = await GroupMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    
    const existingIndex = message.responders.findIndex(
      (r) => r.user.toString() === userId.toString()
    );

    if (existingIndex !== -1) {
      message.responders[existingIndex].status = status;
      message.responders[existingIndex].infoMessage = infoMessage;
    } else {
      message.responders.push({
        user: userId,
        status,
        infoMessage,
      });
    }

    await message.save();

    await message.populate("responders.user", "fullname userId");

    req.app.get("io")
      .to(`group_${message.group}`)
      .emit("importantMessageRespondersUpdated", {
        messageId,
        responders: message.responders,
      });

    res.status(200).json({ message: "Response recorded", responders: message.responders });
  } catch (error) {
    console.error("Respond error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const ignoreImportantMessage = async (req, res) => {
  try {
    const { userId } = req.body;
    const messageId = req.params.messageId;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const message = await GroupMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    const alreadyIgnored = message.ignoredBy.some(
      (id) => id.toString() === userId
    );

    if (!alreadyIgnored) {
      message.ignoredBy.push(userId);
      await message.save();
    }

    res.status(200).json({ success: true, ignoredBy: message.ignoredBy });
  } catch (err) {
    console.error("Ignore Important Message Error:", err);
    res.status(500).json({ error: "Failed to ignore message" });
  }
};
