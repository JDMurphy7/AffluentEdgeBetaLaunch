import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient.js";
import { useToast } from "../../hooks/use-toast.js";

interface TradeInputProps {
  userId: number;
}

export default function TradeInput({ userId }: TradeInputProps) {
  const [inputMode, setInputMode] = useState<'natural' | 'advanced'>('natural');
  const [naturalInput, setNaturalInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createTradeMutation = useMutation({
    mutationFn: async (tradeData: any) => {
      const response = await apiRequest('POST', '/api/trades', tradeData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/trades/${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/portfolio/${userId}/metrics`] });
      toast({
        title: "Trade Added Successfully",
        description: "Your trade has been logged and analyzed.",
      });
      setNaturalInput('');
    },
    onError: (error) => {
      toast({
        title: "Error Adding Trade",
        description: "Failed to add trade. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleNaturalLanguageSubmit = async () => {
    if (!naturalInput.trim()) return;

    setIsAnalyzing(true);
    try {
      const tradeData = {
        userId,
        naturalLanguageInput: naturalInput,
        // Default values that will be overridden by AI parsing
        symbol: 'UNKNOWN',
        assetClass: 'forex',
        direction: 'long',
        entryPrice: '0',
        quantity: '1',
        status: 'open',
        entryTime: new Date().toISOString(),
      };

      await createTradeMutation.mutateAsync(tradeData);
    } catch (error) {
      console.error('Error processing trade:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="glass-morphism p-6 rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Quick Trade Entry</h2>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setInputMode('natural')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              inputMode === 'natural' 
                ? 'bg-gold/20 text-gold' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Natural Language
          </button>
          <button 
            onClick={() => setInputMode('advanced')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              inputMode === 'advanced' 
                ? 'bg-gold/20 text-gold' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Advanced Form
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {inputMode === 'natural' ? (
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <textarea 
                className="w-full bg-white/10 border border-white/20 rounded-lg p-4 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-gold/50 transition-colors" 
                rows={3}
                placeholder="Describe your trade across any market:
• Forex: 'Went long EUR/USD at 1.0850, SL 1.0800, TP 1.0920'
• Crypto: 'Bought 0.5 BTC at $45000, stop $44000'  
• Commodities: 'Shorted 10oz GOLD at $2050, target $2020'
• Stocks: 'Long 100 AAPL @ $175, exit $180'
• Indices: 'Long S&P500 at 4500, stop 4450'"
                value={naturalInput}
                onChange={(e) => setNaturalInput(e.target.value)}
                disabled={isAnalyzing}
              />
            </div>
            <button 
              onClick={handleNaturalLanguageSubmit}
              disabled={!naturalInput.trim() || isAnalyzing}
              className="gradient-gold text-black px-6 py-4 rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2 inline-block"></div>
                  Analyzing
                </>
              ) : (
                <>
                  <i className="fas fa-brain mr-2"></i>Analyze
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gold mb-2">Asset Class</label>
              <select className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-gold/50 transition-colors">
                <option value="forex">Forex</option>
                <option value="crypto">Crypto</option>
                <option value="commodities">Commodities</option>
                <option value="stocks">Stocks</option>
                <option value="indices">Indices</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gold mb-2">Symbol</label>
              <input 
                type="text" 
                className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-gold/50 transition-colors"
                placeholder="EUR/USD, BTC/USD, GOLD, AAPL, SPX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gold mb-2">Direction</label>
              <select className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-gold/50 transition-colors">
                <option value="long">Long</option>
                <option value="short">Short</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gold mb-2">Entry Price</label>
              <input 
                type="number" 
                step="0.00001"
                className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-gold/50 transition-colors"
                placeholder="0.00000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gold mb-2">Stop Loss</label>
              <input 
                type="number" 
                step="0.00001"
                className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-gold/50 transition-colors"
                placeholder="0.00000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gold mb-2">Take Profit</label>
              <input 
                type="number" 
                step="0.00001"
                className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-gold/50 transition-colors"
                placeholder="0.00000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gold mb-2">Position Size</label>
              <input 
                type="number" 
                step="0.01"
                className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-gold/50 transition-colors"
                placeholder="1.00"
              />
            </div>
          </div>
        )}
        
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <div className="flex items-center space-x-2">
            <i className="fas fa-camera text-gold"></i>
            <span>Screenshot Upload</span>
          </div>
          <div className="flex items-center space-x-2">
            <i className="fas fa-microphone text-bronze"></i>
            <span>Voice Input</span>
          </div>
          <div className="flex items-center space-x-2">
            <i className="fas fa-link text-blue-400"></i>
            <span>Broker Integration</span>
          </div>
        </div>
      </div>
    </div>
  );
}
