import express, { Request, Response } from "express";

import {
  signup,
  login,
  getMe,
} from "../controllers/auth.controller";

import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/test", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Auth route working",
  });
});

router.post("/signup", signup);

router.post("/login", login);

router.get("/me", authMiddleware, getMe);

export default router;