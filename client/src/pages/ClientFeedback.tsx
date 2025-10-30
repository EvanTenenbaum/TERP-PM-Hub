import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Loader2, Send, CheckCircle } from 'lucide-react';

export default function ClientFeedback() {
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = trpc.feedback.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setFeedback('');
      setTimeout(() => setSubmitted(false), 3000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback.trim()) {
      submitMutation.mutate({ feedback: feedback.trim() });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900">Share Your Feedback</h1>
          <p className="mt-2 text-lg text-gray-600">
            We'd love to hear your ideas, suggestions, or concerns
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        {submitted && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-green-800 font-medium">
              Thank you! Your feedback has been submitted successfully.
            </p>
          </div>
        )}

        {/* Feedback Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="feedback" className="block text-sm font-semibold text-gray-700 mb-2">
                What's on your mind?
              </label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your ideas, report issues, or suggest improvements..."
                className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400"
                disabled={submitMutation.isPending}
              />
              <p className="mt-2 text-sm text-gray-500">
                Be as detailed as you'd like. We review every submission.
              </p>
            </div>

            <button
              type="submit"
              disabled={!feedback.trim() || submitMutation.isPending}
              className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Feedback
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">What happens next?</h3>
          <ul className="text-sm text-blue-800 space-y-1.5 ml-4 list-disc">
            <li>Our team reviews your feedback within 24-48 hours</li>
            <li>We'll prioritize and plan implementation based on impact</li>
            <li>You'll see your suggestions reflected in future updates</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
