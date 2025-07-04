import OpenAI from "openai";
import type { Trade } from "../../shared/schema.js";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "default_key"
});

export interface AITradeAnalysis {
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  analysis: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    strategyNotes: string;
    riskAssessment: string;
  };
  strategyAdherence: number; // 0-100
  riskManagementScore: 'A' | 'B' | 'C' | 'D' | 'F';
}

export async function analyzeTradeWithAI(trade: Trade): Promise<AITradeAnalysis> {
  try {
    const prompt = `
Analyze this trading performance with focus on strategy discipline over profit/loss:

Trade Details:
- Symbol: ${trade.symbol}
- Asset Class: ${trade.assetClass}
- Direction: ${trade.direction}
- Entry Price: ${trade.entryPrice}
- Exit Price: ${trade.exitPrice}
- Stop Loss: ${trade.stopLoss}
- Take Profit: ${trade.takeProfit}
- Quantity: ${trade.quantity}
- P&L: ${trade.pnl}
- Strategy: ${trade.strategyId ? 'Strategy-based' : 'Discretionary'}
- Notes: ${trade.notes || 'None'}

Evaluate based on:
1. Risk Management (stop loss placement, position sizing)
2. Strategy Adherence (rule following vs emotional decisions)
3. Entry/Exit Timing
4. Risk-Reward Ratio
5. Trade Documentation

Provide analysis in JSON format with:
- grade: Overall grade (A-F) based on discipline, not profit
- analysis: {strengths, weaknesses, suggestions, strategyNotes, riskAssessment}
- strategyAdherence: Percentage score (0-100)
- riskManagementScore: Letter grade (A-F)

Focus on process over outcome. A profitable trade with poor discipline should get a lower grade than a disciplined losing trade.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional trading coach who evaluates trades based on discipline and strategy adherence, not just profit/loss. Provide constructive feedback to help improve trading performance."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      grade: result.grade || 'C',
      analysis: {
        strengths: result.analysis?.strengths || [],
        weaknesses: result.analysis?.weaknesses || [],
        suggestions: result.analysis?.suggestions || [],
        strategyNotes: result.analysis?.strategyNotes || '',
        riskAssessment: result.analysis?.riskAssessment || '',
      },
      strategyAdherence: Math.max(0, Math.min(100, result.strategyAdherence || 50)),
      riskManagementScore: result.riskManagementScore || 'C',
    };

  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to analyze trade with AI");
  }
}

export async function parseNaturalLanguageInput(input: string): Promise<Partial<Trade>> {
  try {
    const prompt = `
Parse this natural language trading input into structured data:

"${input}"

Extract and return JSON with these fields (only include fields that can be determined):
- symbol: Trading pair/instrument (e.g., "EUR/USD", "BTC/USD", "GOLD")
- assetClass: "forex", "crypto", "commodities", "stocks", or "indices"
- direction: "long" or "short"
- entryPrice: Entry price as number
- exitPrice: Exit price as number (if mentioned)
- stopLoss: Stop loss price as number (if mentioned)
- takeProfit: Take profit price as number (if mentioned)
- quantity: Position size as number
- pnl: Profit/loss amount as number (if trade is closed)
- status: "open" or "closed"
- notes: Any additional context or reasoning

Examples:
"Bought 100 TSLA @ $250, SL $245, TP $270" → {symbol: "TSLA", assetClass: "stocks", direction: "long", entryPrice: 250, stopLoss: 245, takeProfit: 270, quantity: 100, status: "open"}
"Went long EUR/USD at 1.0850, stopped out at 1.0800" → {symbol: "EUR/USD", assetClass: "forex", direction: "long", entryPrice: 1.0850, exitPrice: 1.0800, status: "closed"}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a trading data parser. Extract structured trading information from natural language descriptions. Only include fields that can be clearly determined from the input."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    // Clean and validate the extracted data
    const cleanedResult: Partial<Trade> = {};
    
    if (result.symbol) cleanedResult.symbol = result.symbol;
    if (result.assetClass) cleanedResult.assetClass = result.assetClass;
    if (result.direction) cleanedResult.direction = result.direction;
    if (result.entryPrice) cleanedResult.entryPrice = result.entryPrice.toString();
    if (result.exitPrice) cleanedResult.exitPrice = result.exitPrice.toString();
    if (result.stopLoss) cleanedResult.stopLoss = result.stopLoss.toString();
    if (result.takeProfit) cleanedResult.takeProfit = result.takeProfit.toString();
    if (result.quantity) cleanedResult.quantity = result.quantity.toString();
    if (result.pnl) cleanedResult.pnl = result.pnl.toString();
    if (result.status) cleanedResult.status = result.status;
    if (result.notes) cleanedResult.notes = result.notes;

    return cleanedResult;

  } catch (error) {
    console.error("Failed to parse natural language input:", error);
    throw new Error("Failed to parse natural language input");
  }
}
