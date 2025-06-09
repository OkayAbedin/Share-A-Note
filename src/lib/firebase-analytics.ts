// Firebase usage analytics and optimization utilities
export class FirebaseUsageTracker {
  private static instance: FirebaseUsageTracker;
  private dailyReads: number = 0;
  private dailyWrites: number = 0;
  private dailyDeletes: number = 0;
  private lastResetDate: string = '';

  // Firebase Free Tier Daily Limits
  static readonly LIMITS = {
    READS: 50000,
    WRITES: 20000,
    DELETES: 20000,
    STORAGE_GB: 1,
    BANDWIDTH_GB: 10
  };

  private constructor() {
    this.loadFromStorage();
  }

  static getInstance(): FirebaseUsageTracker {
    if (!this.instance) {
      this.instance = new FirebaseUsageTracker();
    }
    return this.instance;
  }

  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  }
  private loadFromStorage(): void {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    try {
      const today = this.getTodayDate();
      const stored = localStorage.getItem('firebase_usage_tracker');
      
      if (stored) {
        const data = JSON.parse(stored);
        
        // Reset counters if it's a new day
        if (data.date === today) {
          this.dailyReads = data.reads || 0;
          this.dailyWrites = data.writes || 0;
          this.dailyDeletes = data.deletes || 0;
          this.lastResetDate = data.date;
        } else {
          this.resetDailyCounters();
        }
      } else {
        this.resetDailyCounters();
      }
    } catch (error) {
      console.warn('Failed to load Firebase usage data:', error);
      this.resetDailyCounters();
    }
  }
  private saveToStorage(): void {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    try {
      const data = {
        date: this.getTodayDate(),
        reads: this.dailyReads,
        writes: this.dailyWrites,
        deletes: this.dailyDeletes
      };
      localStorage.setItem('firebase_usage_tracker', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save Firebase usage data:', error);
    }
  }

  private resetDailyCounters(): void {
    this.dailyReads = 0;
    this.dailyWrites = 0;
    this.dailyDeletes = 0;
    this.lastResetDate = this.getTodayDate();
    this.saveToStorage();
  }

  // Track operations
  trackRead(count: number = 1): void {
    this.dailyReads += count;
    this.saveToStorage();
    this.checkLimits();
  }

  trackWrite(count: number = 1): void {
    this.dailyWrites += count;
    this.saveToStorage();
    this.checkLimits();
  }

  trackDelete(count: number = 1): void {
    this.dailyDeletes += count;
    this.saveToStorage();
    this.checkLimits();
  }

  // Get current usage
  getUsage() {
    return {
      reads: {
        count: this.dailyReads,
        limit: FirebaseUsageTracker.LIMITS.READS,
        percentage: (this.dailyReads / FirebaseUsageTracker.LIMITS.READS) * 100
      },
      writes: {
        count: this.dailyWrites,
        limit: FirebaseUsageTracker.LIMITS.WRITES,
        percentage: (this.dailyWrites / FirebaseUsageTracker.LIMITS.WRITES) * 100
      },
      deletes: {
        count: this.dailyDeletes,
        limit: FirebaseUsageTracker.LIMITS.DELETES,
        percentage: (this.dailyDeletes / FirebaseUsageTracker.LIMITS.DELETES) * 100
      }
    };
  }

  // Check if we're approaching limits
  private checkLimits(): void {
    const usage = this.getUsage();
    
    // Warning thresholds
    const WARNING_THRESHOLD = 80; // 80%
    const DANGER_THRESHOLD = 95; // 95%

    if (usage.reads.percentage >= DANGER_THRESHOLD) {
      console.warn('🚨 FIREBASE ALERT: Approaching daily read limit!', usage.reads);
    } else if (usage.reads.percentage >= WARNING_THRESHOLD) {
      console.warn('⚠️ Firebase Warning: High read usage', usage.reads);
    }

    if (usage.writes.percentage >= DANGER_THRESHOLD) {
      console.warn('🚨 FIREBASE ALERT: Approaching daily write limit!', usage.writes);
    } else if (usage.writes.percentage >= WARNING_THRESHOLD) {
      console.warn('⚠️ Firebase Warning: High write usage', usage.writes);
    }
  }

  // Check if we should throttle operations
  shouldThrottleWrites(): boolean {
    return this.dailyWrites >= FirebaseUsageTracker.LIMITS.WRITES * 0.9; // 90% of limit
  }

  shouldThrottleReads(): boolean {
    return this.dailyReads >= FirebaseUsageTracker.LIMITS.READS * 0.9; // 90% of limit
  }

  // Get recommendations for optimization
  getOptimizationRecommendations(): string[] {
    const usage = this.getUsage();
    const recommendations: string[] = [];

    if (usage.writes.percentage > 50) {
      recommendations.push('Consider increasing auto-save debounce time');
      recommendations.push('Use local storage for frequent edits');
      recommendations.push('Implement write batching for multiple changes');
    }

    if (usage.reads.percentage > 50) {
      recommendations.push('Cache note data in local storage');
      recommendations.push('Reduce real-time listener frequency');
      recommendations.push('Use offline-first approach');
    }

    return recommendations;
  }

  // Log daily summary
  logDailySummary(): void {
    const usage = this.getUsage();
    console.group('📊 Firebase Daily Usage Summary');
    console.log('Reads:', `${usage.reads.count}/${usage.reads.limit} (${usage.reads.percentage.toFixed(1)}%)`);
    console.log('Writes:', `${usage.writes.count}/${usage.writes.limit} (${usage.writes.percentage.toFixed(1)}%)`);
    console.log('Deletes:', `${usage.deletes.count}/${usage.deletes.limit} (${usage.deletes.percentage.toFixed(1)}%)`);
    
    const recommendations = this.getOptimizationRecommendations();
    if (recommendations.length > 0) {
      console.log('💡 Optimization Recommendations:');
      recommendations.forEach(rec => console.log(`  • ${rec}`));
    }
    console.groupEnd();
  }
}

// Export singleton instance
export const firebaseTracker = FirebaseUsageTracker.getInstance();
