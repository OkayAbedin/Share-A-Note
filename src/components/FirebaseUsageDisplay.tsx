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
    if (percentage >= 90) return 'text-red-600 bg-red-50 border-red-200';
    if (percentage >= 75) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (percentage >= 50) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-green-600 bg-green-50 border-green-200';
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
          className="flex items-center space-x-2 px-3 py-2 bg-gray-800 text-white rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
          title="Firebase Usage Stats"
        >
          <Database className="h-4 w-4" />
          <span className="text-xs font-mono">
            {Math.max(usage.reads.percentage, usage.writes.percentage).toFixed(0)}%
          </span>
        </button>
      ) : (
        // Expanded view - full stats
        <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-4 max-w-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Firebase Usage</h3>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600"
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
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
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
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
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
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
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
            <div className="mt-3 pt-3 border-t border-gray-200">
              <h4 className="font-medium text-xs text-gray-700 mb-2">💡 Optimization Tips:</h4>
              <ul className="space-y-1">
                {recommendations.slice(0, 3).map((rec, index) => (
                  <li key={index} className="text-xs text-gray-600">
                    • {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="mt-3 pt-3 border-t border-gray-200 flex space-x-2">
            <button
              onClick={() => firebaseTracker.logDailySummary()}
              className="flex-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              Log Summary
            </button>
            <button
              onClick={() => {
                console.log('Current Firebase Usage:', usage);
                console.log('Recommendations:', recommendations);
              }}
              className="flex-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              Debug
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
