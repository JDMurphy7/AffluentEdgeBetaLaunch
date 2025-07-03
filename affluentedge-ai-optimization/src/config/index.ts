import { OptimizerAgent } from '../agents/optimizer';
import { LegacyAgent } from '../agents/legacyAgent';

const config = {
    agents: {
        optimizer: {
            enabled: true,
            instance: new OptimizerAgent(),
            cacheKeyPrefix: 'trade_cache_',
        },
        legacy: {
            enabled: true,
            instance: new LegacyAgent(),
        },
    },
    openAI: {
        apiKey: process.env.OPENAI_API_KEY || '',
    },
    caching: {
        enabled: true,
        expirationTime: 3600, // in seconds
    },
    performanceMetrics: {
        trackExecutionTime: true,
        trackCacheHits: true,
    },
};

export default config;