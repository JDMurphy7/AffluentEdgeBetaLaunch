import { Router } from "express";
import { getAIAnalysisQueueStats } from "../../ai-analysis-queue.js";

const router = Router();

router.get("/stats", async (req, res, next) => {
  try {
    const stats = await getAIAnalysisQueueStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

export default router;
