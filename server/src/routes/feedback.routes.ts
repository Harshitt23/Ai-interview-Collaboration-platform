import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { submitFeedback } from "../controllers/feedback.controller";

const router = Router();

router.post("/", authMiddleware, submitFeedback);

export default router;
