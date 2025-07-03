import { OptimizerAgent } from '../agents/optimizer';
import { LegacyAgent } from '../agents/legacyAgent';

class CostReducer {
    private optimizerAgent: OptimizerAgent;
    private legacyAgent: LegacyAgent;

    constructor() {
        this.optimizerAgent = new OptimizerAgent();
        this.legacyAgent = new LegacyAgent();
    }

    public async reduceCosts(tradeData: any): Promise<number> {
        try {
            // You must provide two arguments for OptimizerAgent.getCostSavings
            // For demonstration, use dummy values (replace with real logic as needed)
            const originalCost = tradeData.originalCost ?? 0;
            const optimizedCost = tradeData.optimizedCost ?? 0;
            const savings = await this.optimizerAgent.getCostSavings(originalCost, optimizedCost);
            return savings;
        } catch (error) {
            console.error('OptimizerAgent failed, falling back to LegacyAgent:', error);
            // LegacyAgent.getCostSavings takes no arguments
            return await this.legacyAgent.getCostSavings();
        }
    }
}

export default new CostReducer();