import express from 'express';
import { protectRoute } from '../middlewares/auth.middlewares.js';
import { getMessages, getUsersForSidebar, sendMessage } from '../controllers/message.controller.js';
import { messageLimiter } from '../lib/rateLimiters.js';

const router=express.Router()

router.get("/users",protectRoute,getUsersForSidebar)
router.get("/:id",protectRoute,getMessages)
router.post("/send/:id",messageLimiter,protectRoute,sendMessage)
export default router