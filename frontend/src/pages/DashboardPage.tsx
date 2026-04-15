import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Trash2, Search } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { useHistory, useDeleteSession } from '../hooks/useHistory';
import { ConfidenceBadge } from '../components/ui/ConfidenceBadge';
import { Spinner } from '../components/ui/Spinner';
import { HistoryItem } from '../types';

export function DashboardPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: historyData, isLoading } = useHistory(page);
  const deleteSessionMutation = useDeleteSession();

  const filteredItems = useMemo(() => {
    if (!historyData?.items) return [];
    return historyData.items.filter((item) =>
      item.query.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [historyData?.items, searchQuery]);

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this session?')) {
      try {
        await deleteSessionMutation.mutateAsync(id);
        toast.success('Session deleted');
      } catch (err) {
        toast.error('Failed to delete session');
      }
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Dashboard">
        <div className="flex items-center justify-center h-full">
          <Spinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Dashboard">
      <div className="p-6 h-full overflow-y-auto">
        {/* Search */}
        <div className="mb-6 flex items-center gap-2">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Sessions Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {historyData?.items.length === 0
                ? 'No debugging sessions yet. Start by asking a question in the chat.'
                : 'No results found.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {filteredItems.map((item) => (
              <HistoryCard
                key={item.id}
                item={item}
                onNavigate={() => navigate(`/chat?session=${item.id}`)}
                onDelete={() => handleDelete(item.id)}
                isDeleting={deleteSessionMutation.isPending}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {historyData && historyData.total > 10 && (
          <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {page} of {Math.ceil(historyData.total / 10)}
            </span>
            <button
              onClick={() =>
                setPage((p) =>
                  Math.min(Math.ceil(historyData.total / 10), p + 1)
                )
              }
              disabled={page >= Math.ceil(historyData.total / 10)}
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

interface HistoryCardProps {
  item: HistoryItem;
  onNavigate: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

function HistoryCard({
  item,
  onNavigate,
  onDelete,
  isDeleting,
}: HistoryCardProps) {
  return (
    <div
      onClick={onNavigate}
      className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg dark:hover:shadow-gray-900 transition cursor-pointer"
    >
      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {item.query.substring(0, 80)}
            {item.query.length > 80 ? '...' : ''}
          </p>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
          {item.response?.root_cause?.substring(0, 120) ||
            'No root cause'}
        </p>
        <div className="flex flex-col gap-2">
          <ConfidenceBadge confidence={item.response?.confidence || 0} />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(item.created_at).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          disabled={isDeleting}
          className="w-full px-2 py-1 rounded text-xs bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40 transition disabled:opacity-50 flex items-center justify-center gap-1"
        >
          <Trash2 className="w-3 h-3" />
          Delete
        </button>
      </div>
    </div>
  );
}
