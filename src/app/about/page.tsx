import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Info, Zap, Shield, Users, Globe, Heart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about Share-A-Note - a privacy-focused collaborative note sharing platform built for simplicity and anonymity.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link 
          href="/" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="flex items-center mb-6">
            <Info className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">About Share-A-Note</h1>
          </div>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                Share-A-Note was created to provide a simple, privacy-focused way to share notes and collaborate 
                with others without the hassle of creating accounts or worrying about data privacy. We believe 
                that sharing ideas should be effortless and anonymous.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Key Features</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <Zap className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Instant Creation</h3>
                    <p className="text-gray-600">Create and share notes in seconds with no registration required.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Privacy First</h3>
                    <p className="text-gray-600">Anonymous usage with automatic note deletion after 30 days.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Real-time Collaboration</h3>
                    <p className="text-gray-600">Multiple people can edit the same note simultaneously.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Globe className="w-6 h-6 text-orange-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Easy Sharing</h3>
                    <p className="text-gray-600">Share notes with custom URLs that are easy to remember and share.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Technology Stack</h2>
              <p className="text-gray-700 mb-4">
                Share-A-Note is built with modern web technologies to ensure speed, reliability, and security:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Next.js 14:</strong> React framework with App Router for optimal performance</li>
                <li><strong>TypeScript:</strong> Type-safe development for better code quality</li>
                <li><strong>Firebase:</strong> Real-time database and anonymous authentication</li>
                <li><strong>Tailwind CSS:</strong> Modern styling for responsive design</li>
                <li><strong>Vercel:</strong> Fast and reliable hosting platform</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Use Cases</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    Quick note sharing between devices
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    Collaborative meeting notes
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    Temporary project documentation
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    Anonymous feedback collection
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    Quick code snippet sharing
                  </li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <Heart className="w-6 h-6 text-red-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Open Source</h3>
                </div>
                <p className="text-gray-700">
                  Share-A-Note is open source and available on GitHub. We welcome contributions, 
                  feedback, and suggestions from the community to make the platform even better.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
