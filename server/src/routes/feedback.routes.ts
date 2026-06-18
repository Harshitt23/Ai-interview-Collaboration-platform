import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { submitFeedback, getFeedbacks } from "../controllers/feedback.controller";

const router = Router();

router.get("/", authMiddleware, getFeedbacks);
router.post("/", authMiddleware, submitFeedback);

export default router;
