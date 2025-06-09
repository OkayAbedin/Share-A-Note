# ShareACode - Share Notes Instantly

A modern, real-time collaborative note-sharing application built with Next.js 14, Firebase, and TypeScript. Create and share notes with custom URLs - no registration required!

## ✨ Features

- **🔗 Custom URLs**: Share notes with memorable links like `shareacode.vercel.app/noteno123`
- **⚡ Real-time Collaboration**: Multiple users can edit simultaneously with live updates
- **🚫 No Registration**: Anonymous authentication - start writing immediately
- **💾 Auto-save**: Notes are automatically saved as you type
- **📱 Responsive Design**: Works seamlessly on desktop and mobile
- **🎨 Modern UI**: Clean, intuitive interface built with Tailwind CSS
- **🔄 Offline Support**: Basic offline detection and status indicators

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Firebase Firestore (real-time database)
- **Authentication**: Firebase Anonymous Auth
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
   git clone <your-repo-url>
   cd shareacode
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
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in your Firebase configuration in `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

5. **Deploy Firestore rules** (optional, for production)
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

## 📁 Project Structure

```
src/
├── app/
│   ├── [id]/           # Dynamic note pages
│   ├── page.tsx        # Home page
│   ├── layout.tsx      # Root layout
│   └── globals.css     # Global styles
├── lib/
│   ├── firebase.ts     # Firebase configuration
│   └── utils.ts        # Utility functions
└── types/
    └── index.ts        # TypeScript type definitions
```

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
   npm run export
   ```

2. **Deploy to Netlify**
   - Drag and drop the `out` folder to Netlify
   - Or connect your GitHub repository

## 🔧 Configuration

### Firebase Security Rules

The included Firestore rules allow:
- Anonymous users to read and write notes
- Users to create new notes
- Users to update existing notes
- Proper data validation

### Environment Variables

All Firebase configuration should be stored in environment variables for security:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## 📝 Usage

1. **Create a note**: Click "New Note" on the home page
2. **Share**: Copy the URL and share it with others
3. **Collaborate**: Anyone with the link can edit in real-time
4. **Auto-save**: Changes are automatically saved as you type

## 🔄 How It Works

1. **Anonymous Authentication**: Users are automatically signed in anonymously
2. **Real-time Updates**: Firestore real-time listeners sync changes across all users
3. **Custom URLs**: Each note gets a unique ID (e.g., `noteno123`)
4. **Auto-save**: Debounced saving prevents excessive writes
5. **Conflict Resolution**: Last write wins for simplicity

## 🛡️ Security

- Anonymous authentication provides basic security
- Firestore rules prevent unauthorized access
- Environment variables protect sensitive configuration
- Client-side validation prevents malformed data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Firebase](https://firebase.google.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)

---

**Happy note sharing! 📝✨**
