import express from 'express';
import { checkAuth, login, logout, signup, updateProfile } from '../controllers/auth.controllers.js';
import { protectRoute } from '../middlewares/auth.middlewares.js';
import { authLimiter } from '../lib/rateLimiters.js';
const router=express.Router()

router.post("/signup",authLimiter,signup)
router.post("/login",authLimiter,login)
router.post("/logout",logout)
router.put("/update-profile",protectRoute,updateProfile)
router.get("/check",protectRoute,checkAuth)

export default router