// Cost optimizer for OpenAI API usage
export class CostOptimizer {
  private totalCost: number = 0;
  private costSaved: number = 0;

  addCost(amount: number) {
    this.totalCost += amount;
  }

  addCostSaved(amount: number) {
    this.costSaved += amount;
  }

  getTotalCost(): number {
    return this.totalCost;
  }

  getCostSaved(): number {
    return this.costSaved;
  }

  getSavingsRate(): number {
    if (this.totalCost === 0) return 0;
    return this.costSaved / this.totalCost;
  }
}
