import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield, Eye, Lock, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for Share-A-Note. Learn how we protect your data and maintain your anonymity.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-dark">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link 
          href="/" 
          className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="glass rounded-lg border border-zinc-800/50 p-8">
          <div className="flex items-center mb-6">
            <Shield className="w-8 h-8 text-blue-400 mr-3" />
            <h1 className="text-3xl font-bold text-zinc-100">Privacy Policy</h1>
          </div>

          <div className="prose prose-invert max-w-none">
            <p className="text-lg text-zinc-400 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-zinc-100 mb-4 flex items-center">
                <Eye className="w-6 h-6 mr-2 text-blue-400" />
                What We Collect
              </h2>
              <p className="text-zinc-300 mb-4">
                Share-A-Note is designed with privacy in mind. We collect minimal information:
              </p>
              <ul className="list-disc pl-6 text-zinc-300 space-y-2">
                <li>Note content you create (stored temporarily)</li>
                <li>Anonymous session data for collaboration</li>
                <li>Basic usage analytics (no personal identification)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-zinc-100 mb-4 flex items-center">
                <Lock className="w-6 h-6 mr-2 text-blue-400" />
                Data Protection
              </h2>
              <ul className="list-disc pl-6 text-zinc-300 space-y-2">
                <li>No user accounts or personal information required</li>
                <li>Notes are automatically deleted after 14 days of inactivity</li>
                <li>All data is encrypted in transit</li>
                <li>We never sell or share your data with third parties</li>
              </ul>
            </section>            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-zinc-100 mb-4 flex items-center">
                <Users className="w-6 h-6 mr-2 text-blue-400" />
                Anonymous Usage
              </h2>
              <p className="text-zinc-300 mb-4">
                Share-A-Note uses Firebase Anonymous Authentication, which means:
              </p>
              <ul className="list-disc pl-6 text-zinc-300 space-y-2">
                <li>You can use the service without creating an account</li>
                <li>Your identity remains anonymous</li>
                <li>We cannot trace notes back to individuals</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-zinc-100 mb-4">Contact</h2>
              <p className="text-zinc-300">
                If you have questions about this privacy policy, please contact us through our GitHub repository.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
