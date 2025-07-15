import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 7,
  message: 'Too many login attempts, please try again later'
});

export const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: 'You are sending messages too fast!'
});
