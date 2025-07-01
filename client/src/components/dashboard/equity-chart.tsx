import { useQuery } from "@tanstack/react-query";
import { useRef, useEffect, useState } from "react";
import Chart from "chart.js/auto";
import BalanceSettings from './balance-settings';

interface EquityChartProps {
  userId: number;
}

export default function EquityChart({ userId }: EquityChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const [initialBalance, setInitialBalance] = useState(100000);

  const { data: snapshots, isLoading } = useQuery({
    queryKey: [`/api/portfolio/${userId}/snapshots`],
  });

  // Calculate profit target lines based on current balance setting
  const profitTarget = initialBalance * 1.10; // 10% profit target
  const maxDrawdownLimit = initialBalance * 0.90; // 10% max drawdown

  useEffect(() => {
    if (!canvasRef.current || isLoading) return;

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Process data for chart
    const labels = snapshots?.slice(-30).map((snapshot) => {
      const date = new Date(snapshot.snapshotTime);
      return date.toLocaleDateString();
    }) || [];

    const balanceData = snapshots?.slice(-30).map((snapshot) => 
      parseFloat(snapshot.balance)
    ) || [];

    // FTMO-style fallback data ($100k challenge account)
    const fallbackLabels = ['Jan 1', 'Jan 15', 'Feb 1', 'Feb 15', 'Mar 1', 'Mar 15', 'Apr 1', 'Apr 15', 'May 1', 'May 15', 'Jun 1', 'Current'];
    const fallbackData = [100000, 105000, 102000, 108000, 115000, 112000, 118000, 125000, 120000, 127000, 124000, 127450];
    


    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels.length > 0 ? labels : fallbackLabels,
        datasets: [
          {
            label: 'Account Balance',
            data: balanceData.length > 0 ? balanceData : fallbackData,
            borderColor: '#F9E086',
            backgroundColor: function(context) {
              const chart = context.chart;
              const {ctx, chartArea} = chart;
              if (!chartArea) {
                return null;
              }
              const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
              gradient.addColorStop(0, 'rgba(249, 224, 134, 0.3)');
              gradient.addColorStop(1, 'rgba(249, 224, 134, 0.05)');
              return gradient;
            },
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#F9E086',
            pointBorderColor: '#E4BB76',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Profit Target',
            data: new Array(fallbackLabels.length).fill(profitTarget),
            borderColor: '#22C55E',
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0,
            pointHoverRadius: 0
          },
          {
            label: 'Max Drawdown',
            data: new Array(fallbackLabels.length).fill(maxDrawdownLimit),
            borderColor: '#EF4444',
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0,
            pointHoverRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(15, 15, 15, 0.9)',
            borderColor: '#F9E086',
            borderWidth: 1,
            titleColor: '#F9E086',
            bodyColor: '#FFFFFF',
            callbacks: {
              label: function(context) {
                return 'Balance: $' + context.raw.toLocaleString();
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
            ticks: {
              color: '#9CA3AF'
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
            ticks: {
              color: '#9CA3AF',
              callback: function(value) {
                return '$' + (Number(value) / 1000) + 'K';
              }
            }
          }
        }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [snapshots, isLoading, initialBalance]);

  return (
    <div className="glass-morphism p-6 rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">FTMO-Style Equity Progression</h2>
          <p className="text-sm text-gray-400">Track your account like a professional prop firm challenge</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-0.5 bg-green-500"></div>
              <span className="text-gray-400">Target: ${(profitTarget / 1000).toFixed(0)}K</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-0.5 bg-red-500"></div>
              <span className="text-gray-400">Max DD: ${(maxDrawdownLimit / 1000).toFixed(0)}K</span>
            </div>
          </div>
          <BalanceSettings 
            userId={userId}
            currentBalance={initialBalance}
            onBalanceUpdate={setInitialBalance}
          />
          <select className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white">
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>Last Year</option>
            <option>All Time</option>
          </select>
          <button className="text-gold hover:text-bronze transition-colors">
            <i className="fas fa-expand-arrows-alt"></i>
          </button>
        </div>
      </div>
      <div className="h-80">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
          </div>
        ) : (
          <canvas ref={canvasRef}></canvas>
        )}
      </div>
    </div>
  );
}
