"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFeedbacks = exports.submitFeedback = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const submitFeedback = async (req, res) => {
    const { roomId, rating, strengths, improvements } = req.body;
    const interviewerId = req.userId;
    if (!roomId || !rating || !strengths || !improvements) {
        return res.status(400).json({ success: false, message: "All fields are required." });
    }
    if (rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: "Rating must be 1–5." });
    }
    const feedback = await prisma_1.default.feedback.create({
        data: {
            roomId,
            rating: Number(rating),
            strengths,
            improvements,
            interviewerId,
        },
    });
    return res.status(201).json({ success: true, feedback });
};
exports.submitFeedback = submitFeedback;
const getFeedbacks = async (req, res) => {
    const interviewerId = req.userId;
    const feedbacks = await prisma_1.default.feedback.findMany({
        where: { interviewerId },
        orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ success: true, feedbacks });
};
exports.getFeedbacks = getFeedbacks;
