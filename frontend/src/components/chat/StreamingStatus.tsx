export function StreamingStatus({
  message,
}: {
  message: string | null;
}) {
  if (!message) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 animate-fade-in">
      <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
      <span>{message}</span>
    </div>
  );
}
