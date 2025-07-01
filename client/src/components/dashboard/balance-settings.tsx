import { useState } from 'react';

interface BalanceSettingsProps {
  userId: number;
  currentBalance: number;
  onBalanceUpdate: (newBalance: number) => void;
}

export default function BalanceSettings({ userId, currentBalance, onBalanceUpdate }: BalanceSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputBalance, setInputBalance] = useState(currentBalance.toString());

  const presetBalances = [
    { label: '$25K Challenge', value: 25000 },
    { label: '$50K Challenge', value: 50000 },
    { label: '$100K Challenge', value: 100000 },
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
        <div className="absolute top-12 right-0 w-80 bg-charcoal border border-white/20 rounded-xl p-6 shadow-xl z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Account Settings</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gold mb-3">Challenge Presets</label>
            <div className="space-y-2">
              {presetBalances.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handleBalanceUpdate(preset.value)}
                  className="w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10 hover:border-gold/30"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white">{preset.label}</span>
                    <span className="text-sm text-gold">${preset.value.toLocaleString()}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gold mb-2">Custom Amount</label>
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <input
                  type="number"
                  value={inputBalance}
                  onChange={(e) => setInputBalance(e.target.value)}
                  placeholder="Enter custom amount"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-gold/50 transition-colors"
                />
              </div>
              <button
                onClick={handleCustomUpdate}
                className="px-4 py-2 bg-gold text-black font-medium rounded-lg hover:bg-bronze transition-colors"
              >
                Set
              </button>
            </div>
          </div>

          <div className="bg-white/5 p-3 rounded-lg border border-gold/20">
            <div className="flex items-center space-x-2 mb-1">
              <i className="fas fa-info-circle text-gold text-sm"></i>
              <span className="text-sm font-medium text-gold">FTMO-Style Tracking</span>
            </div>
            <p className="text-xs text-gray-300">
              Set your starting balance to match your prop firm challenge requirements. 
              This will automatically adjust profit targets and drawdown limits.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}