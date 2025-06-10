import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield, Eye, Lock, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for Share-A-Note. Learn how we protect your data and maintain your anonymity.',
};

export default function PrivacyPage() {
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
            <Shield className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          </div>

          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Eye className="w-6 h-6 mr-2 text-blue-600" />
                What We Collect
              </h2>
              <p className="text-gray-700 mb-4">
                Share-A-Note is designed with privacy in mind. We collect minimal information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Note content you create (stored temporarily)</li>
                <li>Anonymous session data for collaboration</li>
                <li>Basic usage analytics (no personal identification)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Lock className="w-6 h-6 mr-2 text-blue-600" />
                Data Protection
              </h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>No user accounts or personal information required</li>
                <li>Notes are automatically deleted after 14 days of inactivity</li>
                <li>All data is encrypted in transit</li>
                <li>We never sell or share your data with third parties</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-6 h-6 mr-2 text-blue-600" />
                Anonymous Usage
              </h2>
              <p className="text-gray-700 mb-4">
                Share-A-Note uses Firebase Anonymous Authentication, which means:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>You can use the service without creating an account</li>
                <li>Your identity remains anonymous</li>
                <li>We cannot trace notes back to individuals</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact</h2>
              <p className="text-gray-700">
                If you have questions about this privacy policy, please contact us through our GitHub repository.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
