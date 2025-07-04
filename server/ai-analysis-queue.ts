import { Queue, Worker, Job } from 'bullmq';

// TODO: Implement or import performAIAnalysis and updateTradeAnalysis
// import { performAIAnalysis } from './agents/ai-integration/ai-analysis.js';
// import { storage } from './storage.js';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = {
  url: redisUrl,
  maxRetriesPerRequest: null,
};

export const aiAnalysisQueue = new Queue('trade-ai-analysis', { connection });

// Worker to process AI analysis jobs
new Worker('trade-ai-analysis', async (job: Job) => {
  const { tradeId } = job.data;
  // const analysis = await performAIAnalysis(tradeId);
  // await storage.updateTradeAnalysis(tradeId, analysis);
  // Placeholder: Log job for now
  console.log(`Processing AI analysis for trade ${tradeId}`);
}, { connection });

// Helper to enqueue a trade for AI analysis with priority
export async function enqueueTradeAIAnalysis(tradeId: number, priority: number = 3) {
  await aiAnalysisQueue.add('analyze', { tradeId }, { priority });
}

// Monitoring: Expose a function to get job counts and status
export async function getAIAnalysisQueueStats() {
  return {
    waiting: await aiAnalysisQueue.getWaitingCount(),
    active: await aiAnalysisQueue.getActiveCount(),
    completed: await aiAnalysisQueue.getCompletedCount(),
    failed: await aiAnalysisQueue.getFailedCount(),
    delayed: await aiAnalysisQueue.getDelayedCount(),
  };
}
