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
            const savings = await this.optimizerAgent.getCostSavings(tradeData);
            return savings;
        } catch (error) {
            console.error('OptimizerAgent failed, falling back to LegacyAgent:', error);
            return await this.legacyAgent.getCostSavings(tradeData);
        }
    }
}

export default new CostReducer();