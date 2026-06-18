-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "strengths" TEXT NOT NULL,
    "improvements" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "interviewerId" TEXT NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
