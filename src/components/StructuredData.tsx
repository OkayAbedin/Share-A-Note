'use client';

import { useEffect } from 'react';

export default function StructuredData() {
  useEffect(() => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Share-A-Note",
      "description": "Create and share collaborative notes with custom URLs. No account required. Perfect for quick sharing, team collaboration, and anonymous note-taking.",
      "url": process.env.NEXT_PUBLIC_BASE_URL || "https://shareanote.vercel.app",
      "applicationCategory": "ProductivityApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "creator": {
        "@type": "Organization",
        "name": "Share-A-Note"
      },
      "featureList": [
        "Anonymous note creation",
        "Real-time collaboration",
        "Custom URL sharing",
        "Markdown support",
        "No account required"
      ]
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null;
}
