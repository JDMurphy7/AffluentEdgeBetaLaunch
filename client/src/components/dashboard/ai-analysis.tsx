export default function AIAnalysis() {
  return (
    <div className="glass-gold p-6 rounded-xl">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gold/30 rounded-lg flex items-center justify-center">
          <i className="fas fa-brain text-black"></i>
        </div>
        <div>
          <h3 className="font-semibold text-white">Discipline-Based AI Analysis</h3>
          <p className="text-sm text-gray-300">Graded on strategy adherence, not profit/loss</p>
        </div>
      </div>
      
      <div className="bg-white/5 p-4 rounded-lg mb-4 border border-gold/20">
        <div className="flex items-center space-x-2 mb-2">
          <i className="fas fa-info-circle text-gold"></i>
          <span className="text-sm font-medium text-gold">Why Discipline Over Profit?</span>
        </div>
        <p className="text-xs text-gray-300">
          A profitable trade that breaks your rules gets a poor grade. A disciplined losing trade that follows your strategy gets a high grade. 
          This builds long-term consistency and prevents bad habits from forming.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white/10 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Strategy Adherence</span>
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">92%</span>
          </div>
          <p className="text-sm text-white">Excellent rule-following discipline</p>
        </div>
        
        <div className="bg-white/10 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Risk Management</span>
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">A</span>
          </div>
          <p className="text-sm text-white">Consistent position sizing & stops</p>
        </div>
        
        <div className="bg-white/10 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Process Quality</span>
            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">B</span>
          </div>
          <p className="text-sm text-white">Good analysis & documentation</p>
        </div>
      </div>
      
      <div className="bg-white/10 p-4 rounded-lg">
        <h4 className="font-medium text-white mb-2">Discipline-Focused Insights</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Your trend following trades show 95% rule adherence - keep this consistency</li>
          <li>• Risk management excellent across forex, crypto, and commodities</li>
          <li>• Consider documenting market context more thoroughly for better grades</li>
          <li>• Recent ICT concept trades perfectly executed - textbook discipline</li>
        </ul>
      </div>
    </div>
  );
}
