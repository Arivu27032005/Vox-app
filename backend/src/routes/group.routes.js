import express from "express";
import GroupMessage from "../models/GroupMessageSchema.js";
import {
  createGroup,
  promoteMember,
  demoteMember,
  addMemberToGroup,
  getAllGroupsForUser,
  getGroupById,
  getGroupMessages,
  sendGroupMessage,
  respondToImportantMessage,
  setGroupIdentity,
  ignoreImportantMessage,
} from "../controllers/group.controllers.js";

import { protectRoute } from "../middlewares/auth.middlewares.js";

const router = express.Router();

router.use(protectRoute);

router.post("/", createGroup);
router.get("/", getAllGroupsForUser);
router.post("/set-identity", setGroupIdentity);
router.get("/:groupId", getGroupById);
router.post("/promote", promoteMember);
router.post("/demote", demoteMember);
router.post("/add-member", addMemberToGroup);
router.get("/:groupId/messages", getGroupMessages);
router.post("/:groupId/messages", sendGroupMessage);
router.post("/important-response/:messageId", respondToImportantMessage);
router.put("/group-messages/:messageId/ignore", ignoreImportantMessage);

export default router;