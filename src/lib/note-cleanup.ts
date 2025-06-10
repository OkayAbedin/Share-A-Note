// Note cleanup utilities for automatic deletion of old notes
import { collection, query, where, getDocs, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export class NoteCleanup {
  private static readonly CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly NOTE_EXPIRY_DAYS = 14; // 2 weeks
  private static cleanupTimer: NodeJS.Timeout | null = null;

  /**
   * Initialize automatic cleanup system
   * This will run cleanup every 24 hours in the background
   */
  static initializeCleanup() {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    console.log('🧹 Initializing note cleanup system...');
    
    // Run cleanup immediately on startup
    this.runCleanup();
    
    // Schedule regular cleanup every 24 hours
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    
    this.cleanupTimer = setInterval(() => {
      this.runCleanup();
    }, this.CLEANUP_INTERVAL_MS);

    console.log('✅ Note cleanup system initialized');
  }

  /**
   * Stop the automatic cleanup system
   */
  static stopCleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
      console.log('🛑 Note cleanup system stopped');
    }
  }

  /**
   * Run cleanup process to delete notes older than 2 weeks
   */
  static async runCleanup() {
    try {
      console.log('🧹 Running note cleanup...');
      
      // Calculate cutoff date (2 weeks ago)
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.NOTE_EXPIRY_DAYS);
      const cutoffTimestamp = Timestamp.fromDate(cutoffDate);

      console.log(`🗓️ Deleting notes older than: ${cutoffDate.toISOString()}`);

      // Query for old notes
      const notesRef = collection(db, 'notes');
      const oldNotesQuery = query(
        notesRef,
        where('updatedAt', '<', cutoffTimestamp)
      );

      const querySnapshot = await getDocs(oldNotesQuery);
      const notesToDelete = querySnapshot.docs;

      if (notesToDelete.length === 0) {
        console.log('✅ No old notes found for cleanup');
        return { deleted: 0, errors: 0 };
      }

      console.log(`🗑️ Found ${notesToDelete.length} notes to delete`);

      let deleted = 0;
      let errors = 0;

      // Delete old notes
      for (const noteDoc of notesToDelete) {
        try {
          await deleteDoc(doc(db, 'notes', noteDoc.id));
          deleted++;
          console.log(`✅ Deleted note: ${noteDoc.id}`);
        } catch (error) {
          errors++;
          console.error(`❌ Failed to delete note ${noteDoc.id}:`, error);
        }
      }

      const result = { deleted, errors };
      console.log(`🧹 Cleanup completed:`, result);
      
      // Store cleanup stats in localStorage for monitoring
      try {
        const cleanupStats = {
          lastCleanup: new Date().toISOString(),
          deleted,
          errors,
          cutoffDate: cutoffDate.toISOString()
        };
        localStorage.setItem('note_cleanup_stats', JSON.stringify(cleanupStats));
      } catch (e) {
        console.warn('Failed to save cleanup stats to localStorage:', e);
      }

      return result;
    } catch (error) {
      console.error('❌ Error during note cleanup:', error);
      return { deleted: 0, errors: 1 };
    }
  }

  /**
   * Get cleanup statistics from localStorage
   */
  static getCleanupStats() {
    try {
      const stats = localStorage.getItem('note_cleanup_stats');
      return stats ? JSON.parse(stats) : null;
    } catch (error) {
      console.warn('Failed to load cleanup stats:', error);
      return null;
    }
  }

  /**
   * Manual cleanup trigger (for testing or administrative purposes)
   */
  static async manualCleanup() {
    console.log('🧹 Manual cleanup triggered');
    return await this.runCleanup();
  }

  /**
   * Check if a note is expired (older than 2 weeks)
   */
  static isNoteExpired(updatedAt: Timestamp | Date): boolean {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.NOTE_EXPIRY_DAYS);
    
    const noteDate = updatedAt instanceof Timestamp ? updatedAt.toDate() : updatedAt;
    return noteDate < cutoffDate;
  }

  /**
   * Get expiry information for a note
   */
  static getNoteExpiryInfo(updatedAt: Timestamp | Date) {
    const noteDate = updatedAt instanceof Timestamp ? updatedAt.toDate() : updatedAt;
    const now = new Date();
    const expiryDate = new Date(noteDate);
    expiryDate.setDate(expiryDate.getDate() + this.NOTE_EXPIRY_DAYS);
    
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      isExpired: this.isNoteExpired(updatedAt),
      expiryDate,
      daysUntilExpiry: Math.max(0, daysUntilExpiry),
      ageInDays: Math.floor((now.getTime() - noteDate.getTime()) / (1000 * 60 * 60 * 24))
    };
  }
}

// Auto-initialize cleanup when module is imported in browser
if (typeof window !== 'undefined') {
  // Delay initialization to avoid blocking app startup
  setTimeout(() => {
    NoteCleanup.initializeCleanup();
  }, 5000); // 5 seconds delay
}
