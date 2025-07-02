// Advanced trade validation logic
export function validateTrade(trade: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!trade.symbol) errors.push('Missing symbol');
  if (!trade.direction) errors.push('Missing direction');
  if (typeof trade.entry !== 'number') errors.push('Invalid entry price');
  if (typeof trade.exit !== 'number') errors.push('Invalid exit price');
  if (typeof trade.stopLoss !== 'number') errors.push('Invalid stop loss');
  if (typeof trade.takeProfit !== 'number') errors.push('Invalid take profit');
  return { valid: errors.length === 0, errors };
}
