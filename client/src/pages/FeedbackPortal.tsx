import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Loader2, Archive, Lightbulb, AlertCircle, Sparkles } from 'lucide-react';

export default function FeedbackPortal() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const { data: feedbackItems, isLoading } = trpc.feedback.list.useQuery({
    includeArchived: showArchived,
  });

  const { data: selectedItem, refetch: refetchSelected } = trpc.feedback.getWithSuggestions.useQuery(
    { id: selectedId! },
    { enabled: !!selectedId }
  );

  const generateSuggestions = trpc.feedback.generateSuggestions.useMutation({
    onSuccess: () => {
      refetchSelected();
    },
  });

  const archiveMutation = trpc.feedback.archive.useMutation({
    onSuccess: () => {
      window.location.reload(); // Simple reload for now
    },
  });

  const handleGenerateSuggestions = () => {
    if (selectedId) {
      generateSuggestions.mutate({ id: selectedId });
    }
  };

  const handleArchive = () => {
    if (selectedId && confirm('Archive this feedback?')) {
      archiveMutation.mutate({ id: selectedId });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const activeItems = feedbackItems?.filter(item => item.status !== 'archived') || [];
  const archivedItems = feedbackItems?.filter(item => item.status === 'archived') || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Client Feedback Portal</h1>
              <p className="mt-1 text-sm text-gray-500">
                View and manage customer feedback with AI-powered suggestions
              </p>
            </div>
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                showArchived
                  ? 'bg-gray-100 border-gray-300 text-gray-700'
                  : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Archive className="w-4 h-4 inline mr-2" />
              {showArchived ? 'Hide Archived' : 'Show Archived'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Feedback List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Active Feedback ({activeItems.length})
              </h2>
              <div className="space-y-2">
                {activeItems.map((item) => (
                  <button
                    key={item.itemId}
                    onClick={() => setSelectedId(item.itemId)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedId === item.itemId
                        ? 'bg-blue-50 border-blue-300 shadow-sm'
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {item.type === 'IDEA' ? (
                        <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
                {activeItems.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No active feedback
                  </p>
                )}
              </div>
            </div>

            {showArchived && archivedItems.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h2 className="text-lg font-semibold text-gray-500 mb-4">
                  Archived ({archivedItems.length})
                </h2>
                <div className="space-y-2">
                  {archivedItems.map((item) => (
                    <button
                      key={item.itemId}
                      onClick={() => setSelectedId(item.itemId)}
                      className={`w-full text-left p-3 rounded-lg border transition-all opacity-60 ${
                        selectedId === item.itemId
                          ? 'bg-gray-50 border-gray-300'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {item.type === 'IDEA' ? (
                          <Lightbulb className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-600 truncate">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Detail View */}
          <div className="lg:col-span-2">
            {selectedItem ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {selectedItem.type === 'IDEA' ? (
                        <Lightbulb className="w-5 h-5 text-yellow-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="text-xs font-medium text-gray-500">
                        {selectedItem.type}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {selectedItem.itemId}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedItem.title}
                    </h2>
                  </div>
                  {selectedItem.status !== 'archived' && (
                    <button
                      onClick={handleArchive}
                      disabled={archiveMutation.isPending}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Archive className="w-4 h-4 inline mr-2" />
                      Archive
                    </button>
                  )}
                </div>

                {/* Full Message */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Full Message</h3>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedItem.description || 'No description provided'}
                    </p>
                  </div>
                </div>

                {/* AI Suggestions */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      AI Suggestions
                    </h3>
                    {!selectedItem.aiSuggestions && (
                      <button
                        onClick={handleGenerateSuggestions}
                        disabled={generateSuggestions.isPending}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {generateSuggestions.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Generate Suggestions
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {selectedItem.aiSuggestions ? (
                    <div className="space-y-4">
                      {/* Where to Apply */}
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h4 className="text-sm font-semibold text-blue-900 mb-2">
                          Where to Apply
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedItem.aiSuggestions.where.map((module, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                            >
                              {module}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* How to Implement */}
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <h4 className="text-sm font-semibold text-green-900 mb-2">
                          How to Implement
                        </h4>
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {selectedItem.aiSuggestions.how}
                        </p>
                      </div>

                      {/* Confidence Score */}
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Confidence Score
                        </h4>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full transition-all"
                              style={{ width: `${selectedItem.aiSuggestions.confidence}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-700">
                            {selectedItem.aiSuggestions.confidence}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-8 border border-gray-200 text-center">
                      <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">
                        Click "Generate Suggestions" to get AI-powered insights
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Select Feedback to View
                </h3>
                <p className="text-gray-600">
                  Choose a feedback item from the list to see details and AI suggestions
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
