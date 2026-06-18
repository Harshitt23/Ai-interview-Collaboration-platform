import { Request, Response } from "express";
import prisma from "../utils/prisma";

interface AuthRequest extends Request {
  userId?: string;
}

export const submitFeedback = async (req: AuthRequest, res: Response) => {
  const { roomId, rating, strengths, improvements } = req.body;
  const interviewerId = req.userId!;

  if (!roomId || !rating || !strengths || !improvements) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: "Rating must be 1–5." });
  }

  const feedback = await prisma.feedback.create({
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

export const getFeedbacks = async (req: AuthRequest, res: Response) => {
  const interviewerId = req.userId!;

  const feedbacks = await prisma.feedback.findMany({
    where: { interviewerId },
    orderBy: { createdAt: "desc" },
  });

  return res.status(200).json({ success: true, feedbacks });
};
