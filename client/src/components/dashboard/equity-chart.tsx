import { useQuery } from "@tanstack/react-query";
import { useRef, useEffect, useState, useCallback } from "react";
import Chart from "chart.js/auto";
import BalanceSettings from './balance-settings.js';
import { connectRealtime, subscribePortfolioUpdates, disconnectRealtime } from "../../lib/realtime.js";
import { usePortfolioSnapshots } from "../../hooks/use-portfolio.js";
import type { PortfolioSnapshot } from "../../lib/types.js";

interface EquityChartProps {
  userId: number;
}

export default function EquityChart({ userId }: EquityChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const [initialBalance, setInitialBalance] = useState(127450);
  const [profitTargetPercent, setProfitTargetPercent] = useState(10);
  const [maxDrawdownPercent, setMaxDrawdownPercent] = useState(10);
  const [realtimeSnapshots, setRealtimeSnapshots] = useState<PortfolioSnapshot[] | undefined>(undefined);

  const [timeframe, setTimeframe] = useState('30');  // '30', '90', '365', 'all'

  // Get portfolio snapshots using the custom hook
  const { data: snapshots, isLoading } = usePortfolioSnapshots(userId);

  useEffect(() => {
    const socket = connectRealtime();
    subscribePortfolioUpdates(userId, (data: { snapshots?: PortfolioSnapshot[] }) => {
      if (data.snapshots) setRealtimeSnapshots(data.snapshots);
    });
    return () => {
      disconnectRealtime();
    };
  }, [userId]);

  // Calculate profit target lines based on current balance setting
  const profitTarget = initialBalance * (1 + profitTargetPercent / 100);
  const maxDrawdownLimit = initialBalance * (1 - maxDrawdownPercent / 100);

  // Move chartSnapshots to top-level so it's available in the effect dependency array
  const chartSnapshots = realtimeSnapshots || snapshots;

  // Helper function to determine optimal data points based on screen width
  const getOptimalDataPoints = useCallback(() => {
    // Get the current viewport width
    const viewportWidth = window.innerWidth;
    if (viewportWidth < 640) { // Mobile
      return { limit: 10, skip: 3 };
    } else if (viewportWidth < 1024) { // Tablet
      return { limit: 15, skip: 2 };
    } else { // Desktop
      return { limit: 30, skip: 1 };
    }
  }, []);

  // Helper function to remove outliers from data
  const removeOutliers = useCallback((data: number[]): number[] => {
    if (data.length < 5) return data; // Not enough data to detect outliers
    
    // Sort the data
    const sortedData = [...data].sort((a, b) => a - b);
    
    // Calculate Q1 and Q3
    const q1Index = Math.floor(sortedData.length * 0.25);
    const q3Index = Math.floor(sortedData.length * 0.75);
    const q1 = sortedData[q1Index];
    const q3 = sortedData[q3Index];
    
    // Calculate IQR and bounds
    const iqr = q3 - q1;
    const lowerBound = q1 - iqr * 2.5;
    const upperBound = q3 + iqr * 2.5;
    
    // Filter out extreme outliers but keep the data within bounds
    return data.map(value => {
      if (value < lowerBound) return lowerBound;
      if (value > upperBound) return upperBound;
      return value;
    });
  }, []);

  // Calculate performance metrics from the chart data
  const calculateMetrics = useCallback((data: number[]) => {
    if (!data || data.length < 2) return null;
    
    const startValue = data[0];
    const endValue = data[data.length - 1];
    const absoluteChange = endValue - startValue;
    const percentChange = (absoluteChange / startValue) * 100;
    
    // Calculate high and low
    const high = Math.max(...data);
    const low = Math.min(...data);
    const maxDrawdown = ((high - low) / high) * 100;
    
    return {
      startValue,
      endValue,
      absoluteChange,
      percentChange,
      high,
      low,
      maxDrawdown
    };
  }, []);
  
  // Calculate metrics if we have data
  const metrics = chartSnapshots && chartSnapshots.length > 0 
    ? calculateMetrics(chartSnapshots.slice(-parseInt(timeframe === 'all' ? '365' : timeframe))
        .map((s: PortfolioSnapshot) => parseFloat(s.balance)))
    : null;

  // Add window resize listener
  useEffect(() => {
    const handleResize = () => {
      // Force chart rerender when window size changes significantly
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || isLoading) return;

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Get the number of days to display based on timeframe
    const daysToDisplay = timeframe === 'all' ? Infinity : parseInt(timeframe);
    
    // Get optimal data density based on screen size
    const { limit, skip } = getOptimalDataPoints();
    
    // Process data for chart
    const filteredSnapshots = (chartSnapshots ?? [])
      .sort((a: PortfolioSnapshot, b: PortfolioSnapshot) => new Date(a.snapshotTime).getTime() - new Date(b.snapshotTime).getTime())
      .slice(-daysToDisplay);
    
    // Skip some data points on smaller screens for better readability
    const sampledSnapshots = timeframe === 'all' || filteredSnapshots.length <= limit 
      ? filteredSnapshots 
      : filteredSnapshots.filter((_: any, index: number) => index % skip === 0 || index === filteredSnapshots.length - 1);
    
    const labels = sampledSnapshots.map((snapshot: PortfolioSnapshot) => {
      const date = new Date(snapshot.snapshotTime);
      // Format date differently based on timeframe
      if (timeframe === '30') {
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      } else if (timeframe === '90') {
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      } else {
        return date.toLocaleDateString(undefined, { month: 'short', year: '2-digit', day: 'numeric' });
      }
    });

    const balanceData = sampledSnapshots.map((snapshot: PortfolioSnapshot) => 
      parseFloat(snapshot.balance)
    );
    
    // Process data to remove extreme outliers that could distort the chart
    const cleanBalanceData = removeOutliers(balanceData);
    
    // For target and drawdown lines, we need to create arrays matching the data length
    const targetLine = Array(Math.max(labels.length, 2)).fill(profitTarget);
    const drawdownLine = Array(Math.max(labels.length, 2)).fill(maxDrawdownLimit);

    // Demo portfolio progression data
    const fallbackLabels = ['Jan 1', 'Jan 15', 'Feb 1', 'Feb 15', 'Mar 1', 'Mar 15', 'Apr 1', 'Apr 15', 'May 1', 'May 15', 'Jun 1', 'Current'];
    const fallbackData = [100000, 105000, 102000, 108000, 115000, 112000, 118000, 125000, 120000, 127000, 124000, 127450];
    
    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels.length > 0 ? labels : fallbackLabels,
        datasets: [
          {
            label: 'Account Balance',
            data: balanceData.length > 0 ? cleanBalanceData : fallbackData,
            borderColor: '#F9E086',
            backgroundColor: function(context) {
              const chart = context.chart;
              const {ctx, chartArea} = chart;
              if (!chartArea) {
                return 'rgba(249, 224, 134, 0.1)';
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
            data: balanceData.length > 0 ? targetLine : new Array(fallbackLabels.length).fill(profitTarget),
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
            data: balanceData.length > 0 ? drawdownLine : new Array(fallbackLabels.length).fill(maxDrawdownLimit),
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
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
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
                if (typeof context.raw === 'number') {
                  return 'Balance: $' + context.raw.toLocaleString();
                }
                return 'Balance: $' + context.raw;
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
              color: '#9CA3AF',
              maxRotation: 45,
              minRotation: 0
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
            },
            // Begin y axis at zero only if the min data point is close to zero
            beginAtZero: Math.min(...(balanceData.length ? balanceData : fallbackData)) < 10000
          }
        },
        elements: {
          point: {
            // Dynamically set point radius based on data length
            radius: sampledSnapshots.length > 20 ? 2 : (sampledSnapshots.length > 10 ? 3 : 4),
            hoverRadius: 6
          }
        }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [chartSnapshots, isLoading, initialBalance, profitTargetPercent, maxDrawdownPercent, timeframe, getOptimalDataPoints, removeOutliers]);

  return (
    <div className="glass-morphism p-6 rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Portfolio Equity Progression</h2>
          <p className="text-sm text-gray-400">Track your trading performance with precision analytics</p>
        </div>
        <div className="flex items-center space-x-4">
          {metrics && (
            <div className="hidden md:flex items-center space-x-3 text-xs mr-2">
              <div className="flex flex-col items-center px-3 py-2 bg-white/5 rounded-lg">
                <span className="text-gray-400 mb-1">Change</span>
                <span className={`font-medium ${metrics.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {metrics.percentChange >= 0 ? '+' : ''}{metrics.percentChange.toFixed(2)}%
                </span>
              </div>
              <div className="flex flex-col items-center px-3 py-2 bg-white/5 rounded-lg">
                <span className="text-gray-400 mb-1">Max DD</span>
                <span className="font-medium text-red-500">
                  {metrics.maxDrawdown.toFixed(2)}%
                </span>
              </div>
            </div>
          )}
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
            profitTargetPercent={profitTargetPercent}
            maxDrawdownPercent={maxDrawdownPercent}
            onProfitTargetUpdate={setProfitTargetPercent}
            onMaxDrawdownUpdate={setMaxDrawdownPercent}
          />
          <select 
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
          >
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last Year</option>
            <option value="all">All Time</option>
          </select>
          <button className="text-gold hover:text-bronze transition-colors">
            <i className="fas fa-expand-arrows-alt"></i>
          </button>
        </div>
      </div>
      <div className="h-80">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-t-2 border-gold mb-3"></div>
            <p className="text-sm text-gold">Loading portfolio data...</p>
          </div>
        ) : chartSnapshots && chartSnapshots.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <i className="fas fa-chart-line text-3xl text-gray-400 mb-3"></i>
            <h3 className="text-white text-lg font-medium mb-1">No portfolio data available</h3>
            <p className="text-gray-400 text-sm max-w-md">
              Begin by importing trades or adding your starting balance to see your portfolio progression.
            </p>
          </div>
        ) : (
          <canvas ref={canvasRef}></canvas>
        )}
      </div>
    </div>
  );
}
