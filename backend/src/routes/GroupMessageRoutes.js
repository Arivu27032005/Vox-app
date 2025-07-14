import express from "express";
import GroupMessage from "../models/GroupMessageSchema.js";

const router = express.Router();

router.put("/:messageId/ignore", async (req, res) => {
  const { userId } = req.body;

  try {
    const message = await GroupMessage.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (!message.ignoredBy.includes(userId)) {
      message.ignoredBy.push(userId);
      await message.save();
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Ignore Message Error:", err);
    res.status(500).json({ error: "Failed to ignore message" });
  }
});

export default router;
