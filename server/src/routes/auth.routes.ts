import express, { Request, Response } from "express";

import { signup } from "../controllers/auth.controller";

const router = express.Router();

router.get("/test", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Auth route working",
  });
});

router.post("/signup", signup);

export default router;