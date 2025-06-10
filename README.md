# <img src="public/apple-icon.svg" alt="Share-A-Note" width="32" height="32" align="center"> Share-A-Note - Share Notes Instantly

A modern, privacy-focused collaborative note-sharing application built with Next.js 15, Firebase, and TypeScript. Create and share notes with custom URLs - no registration required!

## ✨ Features

- **🔗 Custom URLs**: Share notes with memorable links like `shareanote.vercel.app/abc123def`
- **⚡ Real-time Collaboration**: Multiple users can edit simultaneously with live updates
- **🚫 No Registration**: Anonymous authentication - start writing immediately
- **💾 Manual Save System**: Control when your changes are saved to prevent conflicts
- **🖥️ Code Editor**: Syntax highlighting for 20+ programming languages
- **📱 Responsive Design**: Works seamlessly on desktop and mobile
- **🎨 Modern UI**: Clean, intuitive interface built with Tailwind CSS
- **🔄 Offline Support**: Offline detection with local storage backup
- **⏰ Auto-expiry**: Notes automatically deleted after 14 days of inactivity
- **📥 Multi-format Export**: Download as TXT, Markdown, JSON, or language-specific files
- **⌨️ Keyboard Shortcuts**: Quick actions with Ctrl+Shift+S (save) and Ctrl+Shift+C (toggle code view)

## 🚀 Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS 4
- **Backend**: Firebase Firestore (real-time database)
- **Authentication**: Firebase Anonymous Auth
- **Code Editor**: @uiw/react-textarea-code-editor
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Deployment**: Vercel (recommended)

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/OkayAbedin/Share-A-Note.git
   cd share-a-note
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Firestore Database
   - Enable Authentication (Anonymous sign-in)
   - Copy your Firebase config

4. **Configure environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

5. **Deploy Firestore rules**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init firestore
   firebase deploy --only firestore:rules
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note**: This project has been renamed from "NoteKeeper" to "Share-A-Note" for better branding.

## 📁 Project Structure

```
src/
├── app/
│   ├── [id]/           # Dynamic note pages (/note123)
│   ├── about/          # About page
│   ├── privacy/        # Privacy policy page
│   ├── terms/          # Terms of service page
│   ├── page.tsx        # Home page
│   ├── layout.tsx      # Root layout with metadata
│   ├── sitemap.ts      # SEO sitemap generation
│   ├── robots.ts       # Search engine crawling rules
│   ├── error.tsx       # Global error boundary
│   ├── loading.tsx     # Global loading component
│   ├── not-found.tsx   # 404 page
│   └── globals.css     # Global styles with Tailwind
├── components/
│   ├── Analytics.tsx           # Analytics component
│   ├── Button.tsx              # Reusable button component
│   ├── CopyButton.tsx          # Copy to clipboard button
│   ├── FirebaseUsageDisplay.tsx # Firebase usage tracker (dev only)
│   ├── LoadingSpinner.tsx      # Loading spinner component
│   └── StructuredData.tsx      # SEO structured data
├── hooks/
│   ├── useDebounce.ts          # Debounce hook for performance
│   └── useNetworkStatus.ts     # Network status detection
├── lib/
│   ├── firebase.ts             # Firebase configuration
│   ├── firebase-analytics.ts   # Firebase usage tracking
│   ├── note-cleanup.ts         # Automatic note expiry system
│   └── utils.ts                # Utility functions
└── types/
    └── index.ts                # TypeScript type definitions
```

## 🎯 Key Features Explained

### Manual Save System
Unlike traditional auto-save, Share-A-Note uses a manual save system to prevent conflicts in real-time collaboration:
- Changes are saved to local storage automatically for backup
- Manual save (Ctrl+Shift+S) syncs to Firebase
- Unsaved changes indicator shows when you have local changes
- Real-time updates from other users don't override your typing

### Code Editor
Built-in syntax highlighting for 20+ programming languages:
- JavaScript, TypeScript, Python, Java, C++, C#, PHP, Ruby, Go, Rust
- HTML, CSS, SQL, JSON, XML, YAML, Markdown
- Bash, PowerShell, Dockerfile
- Toggle between plain text and code view (Ctrl+Shift+C)
- Download code as language-specific files

### Privacy & Security
- Anonymous authentication only - no personal data required
- Notes automatically expire after 14 days of inactivity
- Individual note URLs are excluded from search engines
- Local storage backup for offline work
- Firebase usage tracking (development only) to optimize costs

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add your environment variables in Vercel dashboard
   - Deploy!

### Deploy to Netlify

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Connect your GitHub repository to Netlify
   - Configure build settings: `npm run build` and publish directory: `.next`
   - Add environment variables in Netlify dashboard

## 🔧 Configuration

### Firebase Security Rules

The included Firestore rules (`firestore.rules`) allow:
- Anonymous users to read and write notes
- Simple authentication check (any authenticated user)
- Suitable for collaborative editing

### Environment Variables

Required environment variables for production:

- `NEXT_PUBLIC_FIREBASE_API_KEY` - Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase auth domain  
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Firebase sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID` - Firebase app ID
- `NEXT_PUBLIC_BASE_URL` - Base URL for SEO (e.g., https://yourdomain.com)

### Note Expiry System

Automatic cleanup system built-in:
- Notes expire after 14 days of inactivity
- Cleanup runs every 24 hours
- Expiry warnings shown 3 days before deletion
- Configurable in `src/lib/note-cleanup.ts`

## 🔍 SEO and Search Engine Optimization

Share-A-Note is optimized for search engines with:

- **Automatic Sitemap**: Generated at `/sitemap.xml`
- **SEO-friendly URLs**: Clean, descriptive paths
- **Meta Tags**: Comprehensive metadata for all pages
- **Open Graph**: Social media sharing optimization
- **Structured Data**: JSON-LD schema for search engines
- **Mobile-first**: Responsive design for better rankings
- **Fast Loading**: Optimized for Core Web Vitals

### SEO Features Included

- `src/app/sitemap.ts` - Dynamic sitemap generation
- `src/app/robots.ts` - Search engine crawling rules  
- `src/components/StructuredData.tsx` - JSON-LD structured data
- `src/app/layout.tsx` - Comprehensive meta tags and Open Graph
- Static pages: About, Privacy Policy, Terms of Service

### Privacy-Focused SEO

Our SEO implementation respects user privacy:
- Individual note URLs are excluded from search engines
- Only public pages (home, about, privacy, terms) are indexed
- User-generated content remains private and anonymous

## ⌨️ Keyboard Shortcuts

- **Ctrl+Shift+S** (or Cmd+Shift+S): Manual save to Firebase
- **Ctrl+Shift+C** (or Cmd+Shift+C): Toggle between plain text and code view

## 📊 Firebase Usage Optimization

Built-in Firebase usage tracking (development only):
- Monitors daily read/write/delete operations
- Displays usage against Firebase free tier limits
- Helps optimize costs and prevent overages
- Local storage for client-side analytics
- Automatic cleanup system to reduce storage costs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js 15](https://nextjs.org/)
- Powered by [Firebase](https://firebase.google.com/)
- Styled with [Tailwind CSS 4](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)
- Code editor by [@uiw/react-textarea-code-editor](https://github.com/uiwjs/react-textarea-code-editor)

---

**Happy note sharing! 📝✨**
