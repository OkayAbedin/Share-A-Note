import { useState, useEffect } from 'react';
import { firebaseTracker } from '@/lib/firebase-analytics';
import { BarChart3, Database, AlertTriangle, CheckCircle } from 'lucide-react';

interface FirebaseUsageDisplayProps {
  className?: string;
}

export default function FirebaseUsageDisplay({ className = '' }: FirebaseUsageDisplayProps) {
  const [usage, setUsage] = useState(firebaseTracker.getUsage());
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Update usage every 30 seconds
    const interval = setInterval(() => {
      setUsage(firebaseTracker.getUsage());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Don't show in production or during SSR
  if (process.env.NODE_ENV === 'production' || !isMounted) {
    return null;
  }
  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-400 bg-red-500/20 border-red-500/20';
    if (percentage >= 75) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/20';
    if (percentage >= 50) return 'text-blue-400 bg-blue-500/20 border-blue-500/20';
    return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/20';
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 90) return <AlertTriangle className="h-4 w-4" />;
    if (percentage >= 75) return <BarChart3 className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  const recommendations = firebaseTracker.getOptimizationRecommendations();
  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {!isExpanded ? (
        // Collapsed view - just an icon
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center space-x-2 px-3 py-2 glass-strong text-zinc-100 rounded-lg shadow-lg hover:glass transition-all duration-200 border border-zinc-800/50"
          title="Firebase Usage Stats"
        >
          <Database className="h-4 w-4" />
          <span className="text-xs font-mono">
            {Math.max(usage.reads.percentage, usage.writes.percentage).toFixed(0)}%
          </span>
        </button>
      ) : (
        // Expanded view - full stats
        <div className="glass border border-zinc-800/50 rounded-lg shadow-xl p-4 max-w-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-zinc-400" />
              <h3 className="font-semibold text-zinc-100">Firebase Usage</h3>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-zinc-400 hover:text-zinc-300 transition-colors"
            >
              ×
            </button>
          </div>

          <div className="space-y-3">
            {/* Reads */}
            <div className={`p-3 rounded-lg border ${getStatusColor(usage.reads.percentage)}`}>
              <div className="flex items-center space-x-2 mb-1">
                {getStatusIcon(usage.reads.percentage)}
                <span className="font-medium text-sm">Reads</span>
              </div>
              <div className="text-xs font-mono">
                {usage.reads.count.toLocaleString()} / {usage.reads.limit.toLocaleString()}
              </div>              <div className="w-full bg-zinc-700/50 rounded-full h-2 mt-1">
                <div
                  className="bg-current rounded-full h-2 transition-all duration-300"
                  style={{ width: `${Math.min(usage.reads.percentage, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs mt-1">
                {usage.reads.percentage.toFixed(1)}% used
              </div>
            </div>

            {/* Writes */}
            <div className={`p-3 rounded-lg border ${getStatusColor(usage.writes.percentage)}`}>
              <div className="flex items-center space-x-2 mb-1">
                {getStatusIcon(usage.writes.percentage)}
                <span className="font-medium text-sm">Writes</span>
              </div>
              <div className="text-xs font-mono">
                {usage.writes.count.toLocaleString()} / {usage.writes.limit.toLocaleString()}
              </div>              <div className="w-full bg-zinc-700/50 rounded-full h-2 mt-1">
                <div
                  className="bg-current rounded-full h-2 transition-all duration-300"
                  style={{ width: `${Math.min(usage.writes.percentage, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs mt-1">
                {usage.writes.percentage.toFixed(1)}% used
              </div>
            </div>

            {/* Deletes */}
            <div className={`p-3 rounded-lg border ${getStatusColor(usage.deletes.percentage)}`}>
              <div className="flex items-center space-x-2 mb-1">
                {getStatusIcon(usage.deletes.percentage)}
                <span className="font-medium text-sm">Deletes</span>
              </div>
              <div className="text-xs font-mono">
                {usage.deletes.count.toLocaleString()} / {usage.deletes.limit.toLocaleString()}
              </div>              <div className="w-full bg-zinc-700/50 rounded-full h-2 mt-1">
                <div
                  className="bg-current rounded-full h-2 transition-all duration-300"
                  style={{ width: `${Math.min(usage.deletes.percentage, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs mt-1">
                {usage.deletes.percentage.toFixed(1)}% used
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="mt-3 pt-3 border-t border-zinc-800/50">
              <h4 className="font-medium text-xs text-zinc-300 mb-2">💡 Optimization Tips:</h4>
              <ul className="space-y-1">
                {recommendations.slice(0, 3).map((rec, index) => (
                  <li key={index} className="text-xs text-zinc-400">
                    • {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="mt-3 pt-3 border-t border-zinc-800/50 flex space-x-2">
            <button
              onClick={() => firebaseTracker.logDailySummary()}
              className="flex-1 px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30 transition-colors border border-blue-500/20"
            >
              Log Summary
            </button>
            <button
              onClick={() => {
                console.log('Current Firebase Usage:', usage);
                console.log('Recommendations:', recommendations);
              }}
              className="flex-1 px-2 py-1 text-xs bg-zinc-700/50 text-zinc-300 rounded hover:bg-zinc-700 transition-colors border border-zinc-600/20"
            >
              Debug
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
