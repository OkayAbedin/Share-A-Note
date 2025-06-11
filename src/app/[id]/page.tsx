'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { signInAnonymously, User } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { Note } from '@/types';
import { 
  FileText, 
  Share2, 
  Copy, 
  Users, 
  Clock, 
  Save,
  AlertCircle,
  Code,
  Download,
  FileDown
} from 'lucide-react';
import { formatTimestamp } from '@/lib/utils';
import { firebaseTracker } from '@/lib/firebase-analytics';
import { NoteCleanup } from '@/lib/note-cleanup';
import toast, { Toaster } from 'react-hot-toast';
import CodeEditor from '@uiw/react-textarea-code-editor';
import FirebaseUsageDisplay from '@/components/FirebaseUsageDisplay';

export default function NotePage() {
  const params = useParams();
  const router = useRouter();
  const noteId = params.id as string;  const [note, setNote] = useState<Note | null>(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false); // Track if note has been loaded from Firestore
  const [isCodeView, setIsCodeView] = useState(false); // Track code formatting view
  const [codeLanguage, setCodeLanguage] = useState('javascript'); // Default code language
  const [lastUserEdit, setLastUserEdit] = useState<number>(0); // Timestamp of last user edit
  const [isTyping, setIsTyping] = useState(false); // Track if user is actively typing
  const [cursorPosition, setCursorPosition] = useState<{start: number, end: number} | null>(null); // Preserve cursor position
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Track unsaved changes
  // Local storage for offline backup and reduced Firebase reads
  const [localBackup, setLocalBackup] = useState<{content: string, title: string, timestamp: number} | null>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const externalUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // LOCAL STORAGE UTILITIES FOR CLIENT-SIDE STORAGE (MANUAL SAVE ONLY)
  const saveToLocalStorage = (content: string, title: string, isUnsaved: boolean = false) => {
    try {
      const backup = {
        content,
        title,
        timestamp: Date.now(),
        noteId,
        isUnsaved
      };
      localStorage.setItem(`note_backup_${noteId}`, JSON.stringify(backup));
      setLocalBackup(backup);
      console.log('💾 Saved to localStorage', { isUnsaved });
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  };
  // Function to preserve cursor position when content updates
  const preserveCursorPosition = () => {
    if (contentRef.current) {
      setCursorPosition({
        start: contentRef.current.selectionStart || 0,
        end: contentRef.current.selectionEnd || 0
      });
    }
    if (titleRef.current) {
      setCursorPosition({
        start: titleRef.current.selectionStart || 0,
        end: titleRef.current.selectionEnd || 0
      });
    }
  };
  // Function to restore cursor position after content updates
  const restoreCursorPosition = () => {
    if (cursorPosition && contentRef.current && document.activeElement === contentRef.current) {
      contentRef.current.setSelectionRange(cursorPosition.start, cursorPosition.end);
    }
    if (cursorPosition && titleRef.current && document.activeElement === titleRef.current) {
      titleRef.current.setSelectionRange(cursorPosition.start, cursorPosition.end);
    }
  };

  // Debounced external update function to prevent rapid updates
  const debouncedExternalUpdate = (newContent: string, newTitle: string) => {
    if (externalUpdateTimeoutRef.current) {
      clearTimeout(externalUpdateTimeoutRef.current);
    }
    
    externalUpdateTimeoutRef.current = setTimeout(() => {
      console.log('🔄 Applying debounced external update');
      preserveCursorPosition();
      setContent(newContent);
      setTitle(newTitle);
      setTimeout(restoreCursorPosition, 0);
    }, 100); // Small delay to batch rapid updates
  };
  const loadFromLocalStorage = () => {
    try {
      const backup = localStorage.getItem(`note_backup_${noteId}`);
      if (backup) {
        const parsed = JSON.parse(backup);
        setLocalBackup(parsed);
        console.log('📱 Loaded from localStorage', {
          contentLength: parsed.content?.length || 0,
          title: parsed.title,
          age: Date.now() - parsed.timestamp,
          isUnsaved: parsed.isUnsaved
        });
        
        // If there are unsaved changes in localStorage, mark as unsaved
        if (parsed.isUnsaved) {
          setHasUnsavedChanges(true);
        }
        
        return parsed;
      }
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
    }
    return null;
  };

  // Initialize local storage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined' && noteId) {
      loadFromLocalStorage();
    }
  }, [noteId]);

  // Initialize authentication and load note
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Initializing Firebase authentication...');
        
        // Check if user is already authenticated
        if (auth.currentUser) {
          console.log('User already authenticated:', auth.currentUser.uid);
          setUser(auth.currentUser);
          return;
        }
        
        // Sign in anonymously
        const result = await signInAnonymously(auth);
        console.log('Anonymous sign-in successful:', result.user.uid);
        setUser(result.user);
      } catch (error) {
        console.error('Authentication failed:', error);
        toast.error('Failed to authenticate. Please refresh the page.');
      }
    };

    // Listen to auth state changes
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log('Auth state changed - user authenticated:', user.uid);
        setUser(user);
      } else {
        console.log('Auth state changed - user not authenticated');
        initializeAuth();
      }
    });

    return () => unsubscribeAuth();
  }, []);// Listen to note changes in real-time
  useEffect(() => {
    if (!noteId || !user) return;

    console.log('Setting up note listener for:', noteId, 'user:', user.uid);
    const noteRef = doc(db, 'notes', noteId);    const unsubscribe = onSnapshot(
      noteRef,
      (docSnapshot) => {
        // Track Firebase read operation
        firebaseTracker.trackRead();
        
        console.log('Note snapshot received:', docSnapshot.exists(), docSnapshot.data());
          if (docSnapshot.exists()) {
          const noteData = docSnapshot.data() as Note;
          console.log('✅ Found existing note:', {
            id: noteData.id,
            title: noteData.title,
            contentLength: noteData.content?.length || 0,
            hasContent: !!noteData.content,
            collaborators: noteData.collaborators?.length || 0
          });
          
          // Always update the note state to keep metadata current (expiry info, collaborators, etc.)
          setNote(noteData);
            // Always update the state with the latest data from Firestore on initial load
          // After initialization, only update if content is significantly different (to avoid cursor jumping)
          if (!isInitialized) {            console.log('📥 Initial load - setting content from Firestore');            setContent(noteData.content || '');
            setTitle(noteData.title || '');
            
            // Load code view preference and language from saved note
            if (noteData.isCodeView !== undefined) {
              setIsCodeView(noteData.isCodeView);
              console.log('📥 Loaded code view preference:', noteData.isCodeView);
            }
            if (noteData.codeLanguage) {
              setCodeLanguage(noteData.codeLanguage);
              console.log('📥 Loaded code language preference:', noteData.codeLanguage);
            }            // Check if we have newer unsaved changes in localStorage
            const localData = loadFromLocalStorage();
            if (localData && localData.isUnsaved && localData.timestamp > (noteData.updatedAt?.toMillis?.() || 0)) {
              console.log('📱 Found newer unsaved changes in localStorage, using local version');
              setContent(localData.content);
              setTitle(localData.title);
              setHasUnsavedChanges(true);
              
              // Silent restore - no toast notification
            } else {
              // Clear any old localStorage data that's been saved
              saveToLocalStorage(noteData.content || '', noteData.title || '', false);
              setHasUnsavedChanges(false);
            }
            
            setIsInitialized(true);} else {
            // Only update if the content is significantly different (avoid minor changes from real-time collaboration)
            const contentChanged = noteData.content !== content;
            const titleChanged = noteData.title !== title;
            
            // AGGRESSIVE TYPING PROTECTION - Multiple layers of protection
            const isUserTyping = document.activeElement === contentRef.current || 
                                document.activeElement === titleRef.current ||
                                document.activeElement?.tagName === 'TEXTAREA' ||
                                document.activeElement?.tagName === 'INPUT';
            
            // Extended protection window - 5 seconds after last edit
            const timeSinceLastEdit = Date.now() - lastUserEdit;
            const isTooSoonAfterEdit = timeSinceLastEdit < 5000;
            
            // Additional protection - check if currently in typing state
            const isCurrentlyTyping = isTyping;
            
            // Only update if ALL protection conditions are false
            const shouldAllowUpdate = !isUserTyping && !isTooSoonAfterEdit && !isCurrentlyTyping;
              if ((contentChanged || titleChanged) && shouldAllowUpdate) {
              console.log('📥 Content changed from external source, scheduling debounced update:', {
                contentChanged,
                titleChanged,
                newContentLength: noteData.content?.length || 0,
                currentContentLength: content.length,
                userTyping: isUserTyping,
                timeSinceLastEdit: timeSinceLastEdit + 'ms',
                currentlyTyping: isCurrentlyTyping
              });
              
              // Use debounced update instead of immediate update
              debouncedExternalUpdate(noteData.content || '', noteData.title || '');
            } else if ((contentChanged || titleChanged) && !shouldAllowUpdate) {
              console.log('🚫 Skipping external update - user is actively typing', {
                userTyping: isUserTyping,
                isTooSoonAfterEdit: isTooSoonAfterEdit,
                isCurrentlyTyping: isCurrentlyTyping,
                timeSinceLastEdit: timeSinceLastEdit + 'ms'
              });            }
            
            // Update code view preferences if they changed - but only if user is not typing
            if ((noteData.isCodeView !== undefined && noteData.isCodeView !== isCodeView) && shouldAllowUpdate) {
              setIsCodeView(noteData.isCodeView);
              console.log('📥 Updated code view preference from external source:', noteData.isCodeView);
            } else if ((noteData.isCodeView !== undefined && noteData.isCodeView !== isCodeView) && !shouldAllowUpdate) {
              console.log('🚫 Skipping code view update - user is actively typing');
            }
            
            if (noteData.codeLanguage && noteData.codeLanguage !== codeLanguage && shouldAllowUpdate) {
              setCodeLanguage(noteData.codeLanguage);
              console.log('📥 Updated code language preference from external source:', noteData.codeLanguage);
            } else if (noteData.codeLanguage && noteData.codeLanguage !== codeLanguage && !shouldAllowUpdate) {
              console.log('🚫 Skipping code language update - user is actively typing');
            }
          }
          console.log('Note loaded successfully:', noteData);
        } else {
          // Note doesn't exist - just set empty state, don't auto-create
          console.log('❌ Note does not exist in Firestore, setting empty state');          setNote(null);
          setContent('');
          setTitle('');
          setIsInitialized(true);        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Error listening to note:', error);
        setHasError(true);
        toast.error('Failed to load note. Please check your connection and refresh.');
        setIsLoading(false);
      }
    );

    return () => {
      console.log('Cleaning up note listener');
      unsubscribe();
    };
  }, [noteId, user]); // Removed content and title from dependencies  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + C to toggle code view
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        toggleCodeView();
      }
      // Ctrl/Cmd + Shift + S to manual save
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        manualSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCodeView]);  // Handle cleanup before component unmounts or page unloads
  useEffect(() => {
    // Only cleanup timers, don't save automatically (we have manual save system)
    const handleBeforeUnload = () => {
      // Just clean up timers on unload, don't auto-save to Firebase
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (externalUpdateTimeoutRef.current) {
        clearTimeout(externalUpdateTimeoutRef.current);
      }
      
      // If there are unsaved changes, notify the user
      if (hasUnsavedChanges) {
        console.log('⚠️ Note has unsaved changes on page unload');
        // This will prompt a browser confirmation dialog asking if the user wants to leave
        // Note: This only works in some browsers and situations due to security restrictions
        return "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Just clean up timers when component unmounts, don't auto-save to Firebase
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (externalUpdateTimeoutRef.current) {
        clearTimeout(externalUpdateTimeoutRef.current);
      }
    };
  }, [hasUnsavedChanges]);
  // Manual save functionality - ONLY saves when user clicks save button
  const saveNote = async (newContent: string, newTitle: string, showToast = true) => {
    if (!user || !noteId) {
      console.log('Cannot save: missing user or noteId', { user: !!user, noteId });
      return;
    }

    // If the component is still initializing, DO NOT save
    if (!isInitialized) {
      console.log('🚫 PREVENTED: Attempted save before initialization complete.');
      return;
    }

    console.log('💾 MANUAL SAVE - Saving note to Firestore:', { 
      noteId, 
      contentLength: newContent.length, 
      title: newTitle, 
      userUid: user.uid
    });
    setIsSaving(true);

    try {
      const noteRef = doc(db, 'notes', noteId);
      
      // Apply default title only when saving to database
      const finalTitle = newTitle.trim() || 'Untitled Note';
      const noteData: Record<string, unknown> = {
        id: noteId,
        content: newContent,
        title: finalTitle,
        updatedAt: serverTimestamp(),
        lastEditedBy: user.uid,
        collaborators: note?.collaborators?.includes(user.uid) 
          ? note.collaborators 
          : [...(note?.collaborators || []), user.uid],
        isCodeView: isCodeView,
        codeLanguage: codeLanguage,
      };

      // For new notes, also add createdAt
      if (!note) {
        noteData.createdAt = serverTimestamp();
      }

      await setDoc(noteRef, noteData, { merge: true });

      // Track Firebase write operation
      firebaseTracker.trackWrite();      console.log('✅ Note saved successfully to Firestore');
      setLastSaved(new Date());
      
      // Save to localStorage as saved (not unsaved)
      saveToLocalStorage(newContent, finalTitle, false);
      setHasUnsavedChanges(false);
      
      if (showToast) {
        toast.success('Note saved successfully!', { duration: 3000 });
      }
    } catch (error: unknown) {
      console.error('❌ Error saving note:', error);
      toast.error('Failed to save note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };  // Manual save function - called only when user clicks save button
  const manualSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveNote(content, title, true);
  };

  // Content change handler - ONLY saves to localStorage, no auto-save to Firebase
  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    console.log('📝 Content changed (client-side only):', { 
      length: newContent.length,
      noteId
    });
    
    // Set typing state to prevent external updates
    setIsTyping(true);
    
    // Clear any existing typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to clear typing state after user stops typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
    
    // Update state
    setContent(newContent);
    setLastUserEdit(Date.now());
    
    // ONLY save to localStorage (client-side), NOT to Firebase
    if (isInitialized) {
      saveToLocalStorage(newContent, title, true); // Mark as unsaved
      setHasUnsavedChanges(true);
    }
  }, [title, noteId, isInitialized]);

  // Title change handler - ONLY saves to localStorage, no auto-save to Firebase
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    console.log('📝 Title changed (client-side only):', { newTitle, noteId });
    
    // Set typing state to prevent external updates
    setIsTyping(true);
    
    // Clear any existing typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to clear typing state after user stops typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
    
    // Update state
    setTitle(newTitle);
    setLastUserEdit(Date.now());
    
    // ONLY save to localStorage (client-side), NOT to Firebase
    if (isInitialized) {
      saveToLocalStorage(content, newTitle, true); // Mark as unsaved
      setHasUnsavedChanges(true);
    }
  }, [content, noteId, isInitialized]);
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
      toast.error('Failed to copy link');
    }
  };

  // Remove blur save since we only save manually now
  const handleBlurSave = () => {
    // No automatic save on blur - only manual saves
    console.log('📝 Input blur - no auto-save (manual save only)');
  };  const toggleCodeView = () => {
    const newCodeView = !isCodeView;
    
    // Set typing protection to prevent external updates from overriding this change
    setIsTyping(true);
    setLastUserEdit(Date.now());
    
    // Clear any existing typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to clear typing state after change is made
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000); // Extended timeout for UI changes
    
    setIsCodeView(newCodeView);
    toast.success(newCodeView ? 'Switched to code view' : 'Switched to plain text view');
      // Save to localStorage only - no automatic Firebase save
    if (isInitialized) {
      saveToLocalStorage(content, title, true); // Mark as unsaved since view preference changed
      setHasUnsavedChanges(true);
    }
  };  const handleLanguageChange = (language: string) => {
    // Set typing protection to prevent external updates from overriding this change
    setIsTyping(true);
    setLastUserEdit(Date.now());
    
    // Clear any existing typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to clear typing state after change is made
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000); // Extended timeout for UI changes
    
    setCodeLanguage(language);
    toast.success(`Code language set to ${language}`);
      // Save to localStorage only - no automatic Firebase save
    if (isInitialized) {
      saveToLocalStorage(content, title, true); // Mark as unsaved since language preference changed
      setHasUnsavedChanges(true);
    }
  };const downloadNote = (format: 'txt' | 'md' | 'json' | 'code') => {
    const noteData = {
      id: noteId,
      title: title,
      content: content,
      createdAt: note?.createdAt || new Date(),
      updatedAt: note?.updatedAt || new Date(),
      collaborators: note?.collaborators || []
    };

    let fileContent = '';
    let fileName = '';
    let mimeType = '';

    switch (format) {
      case 'txt':
        fileContent = `${title}\n${'='.repeat(title.length)}\n\n${content}`;
        fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
        mimeType = 'text/plain';
        break;
      case 'md':
        fileContent = `# ${title}\n\n${isCodeView ? `\`\`\`${codeLanguage}\n${content}\n\`\`\`` : content}`;
        fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
        mimeType = 'text/markdown';
        break;
      case 'json':
        fileContent = JSON.stringify({...noteData, language: isCodeView ? codeLanguage : 'text'}, null, 2);
        fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
        mimeType = 'application/json';
        break;
      case 'code':
        // Get file extension based on language
        const getFileExtension = (lang: string) => {
          const extensionMap: Record<string, string> = {
            javascript: 'js',
            typescript: 'ts',
            python: 'py',
            java: 'java',
            cpp: 'cpp',
            csharp: 'cs',
            php: 'php',
            ruby: 'rb',
            go: 'go',
            rust: 'rs',
            html: 'html',
            css: 'css',
            sql: 'sql',
            json: 'json',
            xml: 'xml',
            yaml: 'yaml',
            markdown: 'md',
            bash: 'sh',
            powershell: 'ps1',
            dockerfile: 'dockerfile'
          };
          return extensionMap[lang] || 'txt';
        };
        
        fileContent = content;
        fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${getFileExtension(codeLanguage)}`;
        mimeType = 'text/plain';
        break;
    }

    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`Note downloaded as ${format === 'code' ? `${codeLanguage} file` : format.toUpperCase()}`);
  };
  const copyFormattedContent = async (format: 'md' | 'json') => {
    let formattedContent = '';
    
    switch (format) {
      case 'md':
        formattedContent = `# ${title}\n\n${content}`;
        break;
      case 'json':
        const noteData = {
          id: noteId,
          title: title,
          content: content,
          createdAt: note?.createdAt || new Date(),
          updatedAt: note?.updatedAt || new Date(),
          collaborators: note?.collaborators || []
        };
        formattedContent = JSON.stringify(noteData, null, 2);
        break;
    }

    try {
      await navigator.clipboard.writeText(formattedContent);
      toast.success(`${format.toUpperCase()} content copied to clipboard!`);
    } catch (err) {
      console.error('Failed to copy formatted content:', err);
      toast.error('Failed to copy content');
    }  };  // Get note expiry information - always show based on last save time
  const noteExpiryInfo = useMemo(() => {
    // Use current timestamp as fallback if no note data exists
    // This ensures expiry info always shows, even for new notes
    const timestamp = note?.updatedAt || note?.createdAt || new Date();
    
    // Always calculate expiry info based on the timestamp,
    // regardless of editing, saving status, or note existence
    return NoteCleanup.getNoteExpiryInfo(timestamp);
  }, [note]);

  // Update loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-zinc-300">
            {!user ? 'Authenticating...' : 'Loading note...'}
          </p>
          <p className="text-sm text-zinc-500 mt-2">Note ID: {noteId}</p>
        </div>
      </div>
    );
  }

  // Update error screen
  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-400 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto mb-2" />
            <h2 className="text-xl font-semibold">Connection Error</h2>
          </div>
          <p className="text-zinc-400 mb-4">
            Failed to connect to the database. This could be due to:
          </p>
          <ul className="text-sm text-zinc-500 text-left mb-6">
            <li>• Network connection issues</li>
            <li>• Firebase configuration problems</li>
            <li>• Firestore rules blocking access</li>
          </ul>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600/90 text-white rounded hover:bg-blue-600 transition-colors backdrop-blur-sm border border-blue-500/20"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Toaster position="top-right" />
      
      {/* Firebase Usage Display - Development Only */}
      <FirebaseUsageDisplay />
      
      {/* Header */}
      <header className="glass-strong border-b border-zinc-800/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img src="/apple-icon.svg" alt="Share-A-Note" className="h-6 w-6" />
                <span className="text-lg font-semibold text-zinc-100">
                  {noteId}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Status indicators */}
              <div className="flex items-center space-x-3 text-sm text-zinc-400">
                {!isOnline && (
                  <div className="flex items-center space-x-1 text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Offline</span>
                  </div>
                )}
                
                {hasUnsavedChanges && (
                  <div className="flex items-center space-x-1 text-orange-400">
                    <AlertCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Unsaved changes</span>
                  </div>
                )}
                
                {isSaving && (
                  <div className="flex items-center space-x-1 text-blue-400">
                    <Save className="h-4 w-4 animate-pulse" />
                    <span className="hidden sm:inline">Saving...</span>
                  </div>
                )}
                
                {lastSaved && !isSaving && !hasUnsavedChanges && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      Saved {formatTimestamp(lastSaved)}
                    </span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-2">
                {/* Download dropdown */}
                <div className="relative group">
                  <button className="flex items-center space-x-1 px-3 py-1 text-sm bg-emerald-600/90 text-white rounded hover:bg-emerald-600 transition-all duration-200 backdrop-blur-sm border border-emerald-500/20">
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Download</span>
                  </button>

                  {/* Dropdown menu */}
                  <div className="absolute right-0 mt-1 w-48 glass border border-zinc-800/50 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
                    <div className="px-3 py-2 text-xs font-semibold text-zinc-400 border-b border-zinc-800/50">Download</div>
                    <button
                      onClick={() => downloadNote('txt')}
                      className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800/50 flex items-center space-x-2 transition-colors"
                    >
                      <FileDown className="h-3 w-3" />
                      <span>Text (.txt)</span>
                    </button>
                    <button
                      onClick={() => downloadNote('md')}
                      className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800/50 flex items-center space-x-2 transition-colors"
                    >
                      <FileDown className="h-3 w-3" />
                      <span>Markdown (.md)</span>
                    </button>
                    {isCodeView && (
                      <button
                        onClick={() => downloadNote('code')}
                        className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800/50 flex items-center space-x-2 transition-colors"
                      >
                        <Code className="h-3 w-3" />
                        <span>{codeLanguage} file</span>
                      </button>
                    )}
                    <button
                      onClick={() => downloadNote('json')}
                      className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800/50 flex items-center space-x-2 transition-colors"
                    >
                      <FileDown className="h-3 w-3" />
                      <span>JSON (.json)</span>
                    </button>
                    
                    <div className="px-3 py-2 text-xs font-semibold text-zinc-400 border-t border-b border-zinc-800/50">Copy to Clipboard</div>
                    <button
                      onClick={() => copyFormattedContent('md')}
                      className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800/50 flex items-center space-x-2 transition-colors"
                    >
                      <Copy className="h-3 w-3" />
                      <span>Markdown format</span>
                    </button>
                    <button
                      onClick={() => copyFormattedContent('json')}
                      className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800/50 flex items-center space-x-2 transition-colors"
                    >
                      <Copy className="h-3 w-3" />
                      <span>JSON format</span>
                    </button>
                  </div>
                </div>

                <button
                  onClick={manualSave}
                  disabled={isSaving}
                  className={`px-3 py-1 text-sm ${
                    hasUnsavedChanges 
                      ? 'bg-orange-600/90 hover:bg-orange-600 animate-pulse' 
                      : 'bg-blue-600/90 hover:bg-blue-600'
                  } text-white rounded transition-all duration-200 backdrop-blur-sm border ${
                    hasUnsavedChanges ? 'border-orange-500/20' : 'border-blue-500/20'
                  } disabled:opacity-50 flex items-center space-x-1`}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>{hasUnsavedChanges ? 'Save*' : 'Save'}</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={copyToClipboard}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-zinc-600/90 text-white rounded hover:bg-zinc-600 transition-all duration-200 backdrop-blur-sm border border-zinc-500/20"
                >
                  <Copy className="h-4 w-4" />
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="glass rounded-lg border border-zinc-800/50">
          {/* Title input */}
          <div className="border-b border-zinc-800/50 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Title input */}
              <input
                ref={titleRef}
                type="text"
                value={title}
                onChange={handleTitleChange}
                onBlur={handleBlurSave}
                onKeyDown={() => {
                  setIsTyping(true);
                  setLastUserEdit(Date.now());
                }}
                onKeyUp={() => {
                  // Clear typing timeout and set new one
                  if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                  }
                  typingTimeoutRef.current = setTimeout(() => {
                    setIsTyping(false);
                  }, 1000);
                }}
                placeholder="Enter note title..."
                className="w-full sm:flex-1 text-lg sm:text-2xl font-bold text-zinc-100 placeholder-zinc-500 border-none outline-none bg-transparent"
              />
              
              {/* Code/Plain toggle and language selector */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                {/* Code formatting toggle */}
                <button
                  onClick={toggleCodeView}
                  className={`flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200 ${
                    isCodeView 
                      ? 'bg-purple-600/90 text-white hover:bg-purple-600 border border-purple-500/20' 
                      : 'bg-zinc-700/50 text-zinc-300 hover:bg-zinc-700 border border-zinc-600/20'
                  } backdrop-blur-sm`}
                >
                  <Code className="h-4 w-4" />
                  <span>{isCodeView ? 'Plain Text' : 'Code View'}</span>
                </button>

                {/* Language selector - only show in code view */}
                {isCodeView && (
                  <select
                    value={codeLanguage}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="px-3 py-2 text-sm border border-zinc-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 bg-zinc-800/50 text-zinc-300 w-full sm:min-w-32 sm:w-auto backdrop-blur-sm"
                  >
                    <option value="javascript" className="text-zinc-100 bg-zinc-800">JavaScript</option>
                    <option value="typescript" className="text-zinc-100 bg-zinc-800">TypeScript</option>
                    <option value="python" className="text-zinc-100 bg-zinc-800">Python</option>
                    <option value="java" className="text-zinc-100 bg-zinc-800">Java</option>
                    <option value="cpp" className="text-zinc-100 bg-zinc-800">C++</option>
                    <option value="csharp" className="text-zinc-100 bg-zinc-800">C#</option>
                    <option value="php" className="text-zinc-100 bg-zinc-800">PHP</option>
                    <option value="ruby" className="text-zinc-100 bg-zinc-800">Ruby</option>
                    <option value="go" className="text-zinc-100 bg-zinc-800">Go</option>
                    <option value="rust" className="text-zinc-100 bg-zinc-800">Rust</option>
                    <option value="html" className="text-zinc-100 bg-zinc-800">HTML</option>
                    <option value="css" className="text-zinc-100 bg-zinc-800">CSS</option>
                    <option value="sql" className="text-zinc-100 bg-zinc-800">SQL</option>
                    <option value="json" className="text-zinc-100 bg-zinc-800">JSON</option>
                    <option value="xml" className="text-zinc-100 bg-zinc-800">XML</option>
                    <option value="yaml" className="text-zinc-100 bg-zinc-800">YAML</option>
                    <option value="markdown" className="text-zinc-100 bg-zinc-800">Markdown</option>
                    <option value="bash" className="text-zinc-100 bg-zinc-800">Bash</option>
                    <option value="powershell" className="text-zinc-100 bg-zinc-800">PowerShell</option>
                    <option value="dockerfile" className="text-zinc-100 bg-zinc-800">Dockerfile</option>
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Content area */}
          <div className="p-4">
            {isCodeView ? (
              <div className="space-y-4">
                {/* Direct code editor with syntax highlighting */}
                <CodeEditor
                  value={content}
                  language={codeLanguage}
                  placeholder={`Start typing your ${codeLanguage} code here...`}
                  onChange={(evn) => {
                    const newContent = evn.target.value;
                    
                    // Set typing state to prevent external updates
                    setIsTyping(true);
                    
                    // Clear any existing typing timeout
                    if (typingTimeoutRef.current) {
                      clearTimeout(typingTimeoutRef.current);
                    }
                    
                    // Set timeout to clear typing state after user stops typing
                    typingTimeoutRef.current = setTimeout(() => {
                      setIsTyping(false);
                    }, 1000);
                    
                    setContent(newContent);
                    setLastUserEdit(Date.now());
                    if (isInitialized) {
                      saveToLocalStorage(newContent, title, true);
                      setHasUnsavedChanges(true);
                    }
                  }}
                  onBlur={handleBlurSave}
                  padding={16}
                  style={{
                    fontSize: 14,
                    backgroundColor: "#18181b",
                    color: "#e4e4e7",
                    fontFamily: 'ui-monospace,SFMono-Regular,"SF Mono",Monaco,Consolas,"Liberation Mono","Menlo",monospace',
                    minHeight: '500px',
                    border: '1px solid rgba(39, 39, 42, 0.5)',
                    borderRadius: '6px'
                  }}
                />
              </div>
            ) : (
              <textarea
                ref={contentRef}
                value={content}
                onChange={handleContentChange}
                onBlur={handleBlurSave}
                onKeyDown={() => {
                  setIsTyping(true);
                  setLastUserEdit(Date.now());
                }}
                onKeyUp={() => {
                  // Clear typing timeout and set new one
                  if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                  }
                  typingTimeoutRef.current = setTimeout(() => {
                    setIsTyping(false);
                  }, 1000);
                }}
                placeholder="Start typing your note here... Anyone with this link can edit this note in real-time!"
                className="w-full h-96 text-zinc-300 placeholder-zinc-500 border-none outline-none resize-none bg-transparent leading-relaxed"
                style={{ minHeight: '500px' }}
              />
            )}
          </div>
        </div>

        {/* Info section */}
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Note expiry warning */}
          <div className="glass border border-red-500/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-5 w-5 text-red-400" />
              <h3 className="font-semibold text-red-300">
                Note Expiry
              </h3>
            </div>
            <p className="text-sm text-red-200">
              {noteExpiryInfo?.isExpired 
                ? `This note has expired and will be deleted automatically.`
                : noteExpiryInfo && noteExpiryInfo.daysUntilExpiry !== undefined && noteExpiryInfo.daysUntilExpiry <= 3
                ? `This note will be deleted in ${noteExpiryInfo.daysUntilExpiry} day${noteExpiryInfo.daysUntilExpiry !== 1 ? 's' : ''}.`
                : `This note will be automatically deleted in ${noteExpiryInfo?.daysUntilExpiry ?? 14} days.`
              }
              <br />
              <span className="text-xs opacity-75">
                Notes are deleted after 2 weeks of inactivity to save server resources.
              </span>
            </p>
          </div>

          <div className="glass border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Share2 className="h-5 w-5 text-blue-400" />
              <h3 className="font-semibold text-blue-300">Share this note</h3>
            </div>
            <p className="text-blue-200 text-sm mb-3">
              Anyone with this link can view and edit this note in real-time.
            </p>
            <div className="flex items-center space-x-2">
              <code className="flex-1 px-3 py-2 bg-zinc-800/50 border border-blue-500/20 rounded text-sm font-mono text-blue-300 truncate">
                {typeof window !== 'undefined' ? window.location.href : ''}
              </code>
              <button
                onClick={copyToClipboard}
                className="px-3 py-2 bg-blue-600/90 text-white rounded hover:bg-blue-600 transition-all duration-200 backdrop-blur-sm border border-blue-500/20"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="glass border border-purple-500/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Code className="h-5 w-5 text-purple-400" />
              <h3 className="font-semibold text-purple-300">Code Editor</h3>
            </div>
            <p className="text-purple-200 text-sm mb-2">
              Direct code editing with syntax highlighting for 20+ languages.
            </p>
            <div className="space-y-1 text-xs text-purple-300">
              <div className="flex items-center space-x-2">
                <Download className="h-3 w-3" />
                <span>Download as language-specific files</span>
              </div>
              <div className="flex items-center space-x-2">
                <Code className="h-3 w-3" />
                <span>Ctrl+Shift+C: Toggle code view</span>
              </div>
              <div className="flex items-center space-x-2">
                <Save className="h-3 w-3" />
                <span>Ctrl+Shift+S: Manual save</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
