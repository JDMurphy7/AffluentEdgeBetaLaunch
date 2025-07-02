import { useState } from 'react';

interface BalanceSettingsProps {
  userId: number;
  currentBalance: number;
  onBalanceUpdate: (newBalance: number) => void;
  profitTargetPercent?: number;
  maxDrawdownPercent?: number;
  onProfitTargetUpdate?: (percent: number) => void;
  onMaxDrawdownUpdate?: (percent: number) => void;
}

export default function BalanceSettings({ 
  userId, 
  currentBalance, 
  onBalanceUpdate,
  profitTargetPercent = 10,
  maxDrawdownPercent = 10,
  onProfitTargetUpdate,
  onMaxDrawdownUpdate
}: BalanceSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputBalance, setInputBalance] = useState(currentBalance.toString());
  const [inputProfitTarget, setInputProfitTarget] = useState(profitTargetPercent.toString());
  const [inputMaxDrawdown, setInputMaxDrawdown] = useState(maxDrawdownPercent.toString());

  const presetBalances = [
    { label: '$25K Account', value: 25000 },
    { label: '$50K Account', value: 50000 },
    { label: '$100K Account', value: 100000 },
  ];

  const handleBalanceUpdate = (value: number) => {
    onBalanceUpdate(value);
    setInputBalance(value.toString());
    setIsOpen(false);
  };

  const handleCustomUpdate = () => {
    const value = parseFloat(inputBalance);
    if (!isNaN(value) && value > 0) {
      handleBalanceUpdate(value);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
      >
        <i className="fas fa-cog text-gold text-sm"></i>
        <span className="text-sm text-white">Customize Balance</span>
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 w-80 max-h-96 bg-charcoal border border-white/20 rounded-xl p-4 shadow-xl z-50 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Account Settings</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gold mb-2">Popular Presets</label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {presetBalances.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handleBalanceUpdate(preset.value)}
                  className="w-full text-left px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10 hover:border-gold/30"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white">{preset.label}</span>
                    <span className="text-xs text-gold">${preset.value.toLocaleString()}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gold mb-2">Custom Amount</label>
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <input
                  type="number"
                  value={inputBalance}
                  onChange={(e) => setInputBalance(e.target.value)}
                  placeholder="Enter custom amount"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-gold/50 transition-colors"
                />
              </div>
              <button
                onClick={handleCustomUpdate}
                className="px-3 py-1.5 bg-gold text-black font-medium rounded-lg hover:bg-bronze transition-colors text-sm"
              >
                Set
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-gold mb-1">Profit Target %</label>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  value={inputProfitTarget}
                  onChange={(e) => setInputProfitTarget(e.target.value)}
                  placeholder="10"
                  min="1"
                  max="100"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-gold/50 transition-colors"
                />
                <button
                  onClick={() => {
                    const value = parseFloat(inputProfitTarget);
                    if (!isNaN(value) && value > 0 && value <= 100 && onProfitTargetUpdate) {
                      onProfitTargetUpdate(value);
                    }
                  }}
                  className="px-2 py-1 bg-green-600 text-white font-medium rounded text-xs hover:bg-green-700 transition-colors"
                >
                  Set
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gold mb-1">Max Drawdown %</label>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  value={inputMaxDrawdown}
                  onChange={(e) => setInputMaxDrawdown(e.target.value)}
                  placeholder="10"
                  min="1"
                  max="50"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-gold/50 transition-colors"
                />
                <button
                  onClick={() => {
                    const value = parseFloat(inputMaxDrawdown);
                    if (!isNaN(value) && value > 0 && value <= 50 && onMaxDrawdownUpdate) {
                      onMaxDrawdownUpdate(value);
                    }
                  }}
                  className="px-2 py-1 bg-red-600 text-white font-medium rounded text-xs hover:bg-red-700 transition-colors"
                >
                  Set
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white/5 p-2 rounded-lg border border-gold/20">
            <div className="flex items-center space-x-2 mb-1">
              <i className="fas fa-info-circle text-gold text-xs"></i>
              <span className="text-xs font-medium text-gold">Professional Tracking</span>
            </div>
            <p className="text-xs text-gray-300 leading-tight">
              Set your balance to match your trading account. Profit targets and drawdown limits adjust automatically.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}