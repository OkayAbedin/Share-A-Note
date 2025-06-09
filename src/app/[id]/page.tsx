'use client';

import { useState, useEffect, useRef } from 'react';
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
  Home,
  Save,
  AlertCircle,
  Code,
  Download,
  FileDown
} from 'lucide-react';
import { formatTimestamp } from '@/lib/utils';
import toast, { Toaster } from 'react-hot-toast';
import CodeEditor from '@uiw/react-textarea-code-editor';

export default function NotePage() {
  const params = useParams();
  const router = useRouter();
  const noteId = params.id as string;
  const [note, setNote] = useState<Note | null>(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);  const [user, setUser] = useState<User | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);  const [isOnline, setIsOnline] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false); // Track if note has been loaded from Firestore
  const [isCodeView, setIsCodeView] = useState(false); // Track code formatting view
  const [codeLanguage, setCodeLanguage] = useState('javascript'); // Default code language
  
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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
    const noteRef = doc(db, 'notes', noteId);
      const unsubscribe = onSnapshot(
      noteRef,
      (docSnapshot) => {
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
          
          setNote(noteData);
          
          // Always update the state with the latest data from Firestore on initial load
          // After initialization, only update if content is significantly different (to avoid cursor jumping)
          if (!isInitialized) {
            console.log('📥 Initial load - setting content from Firestore');
            setContent(noteData.content || '');
            setTitle(noteData.title || 'Untitled Note');
            setIsInitialized(true);
          } else {
            // Only update if the content is significantly different (avoid minor changes from real-time collaboration)
            const contentChanged = noteData.content !== content;
            const titleChanged = noteData.title !== title;
            
            if (contentChanged || titleChanged) {
              console.log('📥 Content changed from external source, updating:', {
                contentChanged,
                titleChanged,
                newContentLength: noteData.content?.length || 0,
                currentContentLength: content.length
              });
              setContent(noteData.content || '');
              setTitle(noteData.title || 'Untitled Note');
            }
          }          
          console.log('Note loaded successfully:', noteData);
        } else {
          // Note doesn't exist - just set empty state, don't auto-create
          console.log('❌ Note does not exist in Firestore, setting empty state');
          setNote(null);
          setContent('');
          setTitle('Untitled Note');
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
  }, [isCodeView]);// Save before component unmounts or page unloads
  useEffect(() => {
    // Define the save function inside this effect to avoid dependency issues
    const saveBeforeUnload = (unloadContent: string, unloadTitle: string) => {
      if (!user || !noteId || !isInitialized) return;
      
      // Only save if there are changes
      if (unloadContent !== note?.content || unloadTitle !== note?.title) {
        console.log('💾 Saving on page unload/component unmount');
          // Inline the save logic to avoid dependencies
        const noteRef = doc(db, 'notes', noteId);
        const noteData: Record<string, unknown> = {
          id: noteId,
          content: unloadContent,
          title: unloadTitle,
          updatedAt: serverTimestamp(),
          lastEditedBy: user.uid,
          collaborators: note?.collaborators?.includes(user.uid)
            ? note.collaborators
            : [...(note?.collaborators || []), user.uid],
        };
        
        setDoc(noteRef, noteData, { merge: true })
          .then(() => console.log('Saved before unload'))
          .catch(err => console.error('Failed to save before unload:', err));
      }
    };
    
    const handleBeforeUnload = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Only save if initialized and there are actual changes
      if (isInitialized) {
        saveBeforeUnload(content, title);
      } else {
        console.log('🚫 Skipped unload save - note not initialized');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Also save when component unmounts (but only if initialized)
      handleBeforeUnload();
    };
  }, [user, noteId, content, title, note?.content, note?.title, note?.collaborators, isInitialized]);

  // Auto-save functionality
  const saveNote = async (newContent: string, newTitle: string, showToast = false) => {
    if (!user || !noteId) {
      console.log('Cannot save: missing user or noteId', { user: !!user, noteId });
      return;
    }

    // CRITICAL FIX: If the component is still initializing, DO NOT save (prevents overwrite)
    if (!isInitialized) {
      console.log('🚫 PREVENTED: Attempted save before initialization complete.');
      console.log('This would have overwritten the note with:', { 
        contentLength: newContent.length,
        title: newTitle,
        isInitializing: !isInitialized 
      });
      return;
    }    // Don't save if content hasn't actually changed (but allow first save when note is null)
    // Apply default title for comparison
    const finalTitle = newTitle.trim() || 'Untitled Note';
    if (note && newContent === note?.content && finalTitle === note?.title) {
      console.log('No changes detected, skipping save');
      return;
    }

    console.log('Saving note:', { 
      noteId, 
      contentLength: newContent.length, 
      title: newTitle, 
      userUid: user.uid,
      isInitialized
    });
    setIsSaving(true);    try {
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
      };// For new notes, also add createdAt
      if (!note) {
        noteData.createdAt = serverTimestamp();
      }

      await setDoc(noteRef, noteData, { merge: true });

      console.log('Note saved successfully to Firestore');
      setLastSaved(new Date());
      
      // Only show toast for manual saves or when explicitly requested
      if (showToast) {
        toast.success('Note saved!', { duration: 2000 });
      }
    } catch (error: unknown) {
      console.error('Error saving note:', error);
      console.error('Error details:', {
        code: error && typeof error === 'object' && 'code' in error ? error.code : 'unknown',
        message: error && typeof error === 'object' && 'message' in error ? error.message : 'unknown',
        noteId,
        userUid: user?.uid
      });
      toast.error('Failed to save note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };  // Debounced save - longer delay for better UX
  const debouncedSave = (newContent: string, newTitle: string) => {
    // Don't save until note has been properly initialized from Firestore
    if (!isInitialized) {
      console.log('🚫 Skipping save - note not yet initialized from Firestore');
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    console.log('⏱️ Debounced save scheduled in 3 seconds...', {
      contentLength: newContent.length,
      title: newTitle,
      hasExistingNote: !!note,
      isInitialized
    });

    saveTimeoutRef.current = setTimeout(() => {
      console.log('⏰ Debounced save executing now...');
      saveNote(newContent, newTitle, false); // Don't show toast for auto-saves
    }, 3000); // Save after 3 seconds of inactivity
  };
  // Save when user leaves the text area
  const handleBlurSave = () => {
    // Don't save until note has been properly initialized from Firestore
    if (!isInitialized) {
      console.log('🚫 Skipping blur save - note not yet initialized from Firestore');
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    // Save immediately when user clicks away, but don't show toast
    saveNote(content, title, false);
  };  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    console.log('📝 Content changed:', { 
      length: newContent.length, 
      hasExistingNote: !!note,
      noteId,
      isInitialized
    });
    
    // Update state
    setContent(newContent);
    
    // Only trigger save if already initialized
    if (isInitialized) {
      debouncedSave(newContent, title);
    } else {
      console.log('🚫 Skipped content save - note not initialized');
    }
  };
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value; // Allow empty titles during editing
    console.log('📝 Title changed:', { 
      newTitle, 
      hasExistingNote: !!note,
      noteId,
      isInitialized
    });
    
    // Update state
    setTitle(newTitle);
    
    // Only trigger save if already initialized
    if (isInitialized) {
      debouncedSave(content, newTitle);
    } else {
      console.log('🚫 Skipped title save - note not initialized');
    }
  };
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
      toast.error('Failed to copy link');
    }
  };  const manualSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveNote(content, title, true); // Show toast for manual saves
  };

  const toggleCodeView = () => {
    setIsCodeView(!isCodeView);
    toast.success(isCodeView ? 'Switched to plain text view' : 'Switched to code view');
  };

  const handleLanguageChange = (language: string) => {
    setCodeLanguage(language);
    toast.success(`Code language set to ${language}`);
  };  const downloadNote = (format: 'txt' | 'md' | 'json' | 'code') => {
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
    }
  };if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {!user ? 'Authenticating...' : 'Loading note...'}
          </p>
          <p className="text-sm text-gray-400 mt-2">Note ID: {noteId}</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto mb-2" />
            <h2 className="text-xl font-semibold">Connection Error</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Failed to connect to the database. This could be due to:
          </p>
          <ul className="text-sm text-gray-500 text-left mb-6">
            <li>• Network connection issues</li>
            <li>• Firebase configuration problems</li>
            <li>• Firestore rules blocking access</li>
          </ul>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Home className="h-5 w-5" />
                <span className="hidden sm:inline">Home</span>
              </button>
              
              <div className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-blue-600" />
                <span className="text-lg font-semibold text-gray-900">
                  {noteId}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Status indicators */}
              <div className="flex items-center space-x-3 text-sm text-gray-500">
                {!isOnline && (
                  <div className="flex items-center space-x-1 text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Offline</span>
                  </div>
                )}
                
                {isSaving && (
                  <div className="flex items-center space-x-1 text-blue-500">
                    <Save className="h-4 w-4 animate-pulse" />
                    <span className="hidden sm:inline">Saving...</span>
                  </div>
                )}
                
                {lastSaved && !isSaving && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      Saved {formatTimestamp(lastSaved)}
                    </span>
                  </div>
                )}
              </div>              {/* Action buttons */}
              <div className="flex items-center space-x-2">                {/* Code formatting toggle */}
                <button
                  onClick={toggleCodeView}
                  className={`flex items-center space-x-1 px-3 py-1 text-sm rounded transition-colors ${
                    isCodeView 
                      ? 'bg-purple-600 text-white hover:bg-purple-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Code className="h-4 w-4" />
                  <span className="hidden sm:inline">{isCodeView ? 'Plain' : 'Code'}</span>
                </button>

                {/* Language selector - only show in code view */}
                {isCodeView && (
                  <select
                    value={codeLanguage}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="csharp">C#</option>
                    <option value="php">PHP</option>
                    <option value="ruby">Ruby</option>
                    <option value="go">Go</option>
                    <option value="rust">Rust</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="sql">SQL</option>
                    <option value="json">JSON</option>
                    <option value="xml">XML</option>
                    <option value="yaml">YAML</option>
                    <option value="markdown">Markdown</option>
                    <option value="bash">Bash</option>
                    <option value="powershell">PowerShell</option>
                    <option value="dockerfile">Dockerfile</option>
                  </select>
                )}

                {/* Download dropdown */}
                <div className="relative group">
                  <button className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Download</span>
                  </button>                  {/* Dropdown menu */}
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 border-b">Download</div>
                    <button
                      onClick={() => downloadNote('txt')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <FileDown className="h-3 w-3" />
                      <span>Text (.txt)</span>
                    </button>
                    <button
                      onClick={() => downloadNote('md')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <FileDown className="h-3 w-3" />
                      <span>Markdown (.md)</span>
                    </button>
                    {isCodeView && (
                      <button
                        onClick={() => downloadNote('code')}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <Code className="h-3 w-3" />
                        <span>{codeLanguage} file</span>
                      </button>
                    )}
                    <button
                      onClick={() => downloadNote('json')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <FileDown className="h-3 w-3" />
                      <span>JSON (.json)</span>
                    </button>
                    
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 border-t border-b">Copy to Clipboard</div>
                    <button
                      onClick={() => copyFormattedContent('md')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <Copy className="h-3 w-3" />
                      <span>Markdown format</span>
                    </button>
                    <button
                      onClick={() => copyFormattedContent('json')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <Copy className="h-3 w-3" />
                      <span>JSON format</span>
                    </button>
                  </div>
                </div>

                <button
                  onClick={manualSave}
                  disabled={isSaving}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Save
                </button>
                
                <button
                  onClick={copyToClipboard}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  <Copy className="h-4 w-4" />
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>{/* Debug info - remove in production */}
              {process.env.NODE_ENV === 'development' && (
                <>
                  <button
                    onClick={() => {
                      console.log('Debug Info:', {
                        user: user?.uid,
                        noteId,
                        note,
                        content,
                        title,
                        isLoading,
                        hasError
                      });
                      toast.success('Debug info logged to console');
                    }}
                    className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                  >
                    Debug
                  </button>
                  <button
                    onClick={() => {
                      console.log('Force saving current content...');
                      saveNote(content, title, true);
                    }}
                    className="px-2 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                  >
                    Force Save
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border">          {/* Title input */}
          <div className="border-b p-4">
            <div className="flex items-center justify-between gap-4">
              {/* Title input - left side */}
              <input
                ref={titleRef}
                type="text"
                value={title}
                onChange={handleTitleChange}
                onBlur={handleBlurSave}
                placeholder="Enter note title..."
                className="flex-1 text-2xl font-bold text-gray-900 placeholder-gray-400 border-none outline-none bg-transparent"
              />
              
              {/* Code/Plain toggle and language selector - right side */}
              <div className="flex items-center space-x-3">
                {/* Code formatting toggle */}
                <button
                  onClick={toggleCodeView}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                    isCodeView 
                      ? 'bg-purple-600 text-white hover:bg-purple-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Code className="h-4 w-4" />
                  <span>{isCodeView ? 'Plain Text' : 'Code View'}</span>
                </button>

                {/* Language selector - only show in code view */}
                {isCodeView && (
                  <select
                    value={codeLanguage}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-700 min-w-32"
                  >
                    <option value="javascript" className="text-gray-900 bg-white">JavaScript</option>
                    <option value="typescript" className="text-gray-900 bg-white">TypeScript</option>
                    <option value="python" className="text-gray-900 bg-white">Python</option>
                    <option value="java" className="text-gray-900 bg-white">Java</option>
                    <option value="cpp" className="text-gray-900 bg-white">C++</option>
                    <option value="csharp" className="text-gray-900 bg-white">C#</option>
                    <option value="php" className="text-gray-900 bg-white">PHP</option>
                    <option value="ruby" className="text-gray-900 bg-white">Ruby</option>
                    <option value="go" className="text-gray-900 bg-white">Go</option>
                    <option value="rust" className="text-gray-900 bg-white">Rust</option>
                    <option value="html" className="text-gray-900 bg-white">HTML</option>
                    <option value="css" className="text-gray-900 bg-white">CSS</option>
                    <option value="sql" className="text-gray-900 bg-white">SQL</option>
                    <option value="json" className="text-gray-900 bg-white">JSON</option>
                    <option value="xml" className="text-gray-900 bg-white">XML</option>
                    <option value="yaml" className="text-gray-900 bg-white">YAML</option>
                    <option value="markdown" className="text-gray-900 bg-white">Markdown</option>
                    <option value="bash" className="text-gray-900 bg-white">Bash</option>
                    <option value="powershell" className="text-gray-900 bg-white">PowerShell</option>
                    <option value="dockerfile" className="text-gray-900 bg-white">Dockerfile</option>
                  </select>
                )}
              </div>
            </div>
          </div>{/* Content area */}
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
                    setContent(newContent);
                    if (isInitialized) {
                      debouncedSave(newContent, title);
                    }
                  }}
                  onBlur={handleBlurSave}
                  padding={16}                  style={{
                    fontSize: 14,
                    backgroundColor: "#000000",
                    color: "#ffffff",
                    fontFamily: 'ui-monospace,SFMono-Regular,"SF Mono",Monaco,Consolas,"Liberation Mono","Menlo",monospace',
                    minHeight: '500px',
                    border: '1px solid #374151',
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
                placeholder="Start typing your note here... Anyone with this link can edit this note in real-time!"
                className="w-full h-96 text-gray-700 placeholder-gray-400 border-none outline-none resize-none bg-transparent leading-relaxed"
                style={{ minHeight: '500px' }}
              />
            )}
          </div>
        </div>        {/* Info section */}
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Share2 className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Share this note</h3>
            </div>
            <p className="text-blue-700 text-sm mb-3">
              Anyone with this link can view and edit this note in real-time.
            </p>
            <div className="flex items-center space-x-2">
              <code className="flex-1 px-3 py-2 bg-white border border-blue-200 rounded text-sm font-mono text-blue-800 truncate">
                {typeof window !== 'undefined' ? window.location.href : ''}
              </code>
              <button
                onClick={copyToClipboard}
                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-green-900">Collaboration</h3>
            </div>            <p className="text-green-700 text-sm">
              {note?.collaborators?.length || 0} people have edited this note.
              Changes are saved automatically when you stop typing or click away.
            </p>
          </div>          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Code className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">Code Editor</h3>
            </div>
            <p className="text-purple-700 text-sm mb-2">
              Direct code editing with syntax highlighting for 20+ languages.
            </p>
            <div className="space-y-1 text-xs text-purple-600">
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
