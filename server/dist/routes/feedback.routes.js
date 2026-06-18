"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const feedback_controller_1 = require("../controllers/feedback.controller");
const router = (0, express_1.Router)();
router.get("/", auth_middleware_1.authMiddleware, feedback_controller_1.getFeedbacks);
router.post("/", auth_middleware_1.authMiddleware, feedback_controller_1.submitFeedback);
exports.default = router;
