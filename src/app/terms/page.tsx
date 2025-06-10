import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FileText, Scale } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for Share-A-Note. Learn about the terms and conditions for using our note sharing platform.',
};

export default function TermsPage() {
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
            <Scale className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          </div>

          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acceptance of Terms</h2>
              <p className="text-gray-700">
                By using Share-A-Note, you agree to be bound by these Terms of Service and our Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Service Description</h2>
              <p className="text-gray-700 mb-4">
                Share-A-Note is a web application that allows users to create and share notes anonymously through custom URLs. The service includes:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Anonymous note creation and editing</li>
                <li>Real-time collaborative editing</li>
                <li>Custom URL sharing</li>
                <li>Temporary note storage</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Responsibilities</h2>
              <p className="text-gray-700 mb-4">When using Share-A-Note, you agree to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Not use the service for illegal activities</li>
                <li>Not share harmful, offensive, or inappropriate content</li>
                <li>Not attempt to compromise the security of the service</li>
                <li>Respect the privacy and rights of other users</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Content and Data</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>You retain ownership of content you create</li>
                <li>Notes are automatically deleted after 30 days of inactivity</li>
                <li>We reserve the right to remove content that violates these terms</li>
                <li>You use the service at your own risk</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
              <p className="text-gray-700">
                Share-A-Note is provided "as is" without warranties. We are not liable for any data loss, 
                damages, or issues arising from the use of this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to Terms</h2>
              <p className="text-gray-700">
                We may update these terms from time to time. Continued use of the service constitutes 
                acceptance of any changes.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
