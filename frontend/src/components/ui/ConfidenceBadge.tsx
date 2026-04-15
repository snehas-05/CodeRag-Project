export function ConfidenceBadge({ confidence }: { confidence: number }) {
  const percentage = Math.round(confidence * 100);
  let bgColor = 'bg-red-100 text-red-800';
  let label = 'Low confidence';

  if (confidence >= 0.8) {
    bgColor = 'bg-green-100 text-green-800';
    label = 'High confidence';
  } else if (confidence >= 0.6) {
    bgColor = 'bg-yellow-100 text-yellow-800';
    label = 'Medium confidence';
  }

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${bgColor}`}
    >
      {label} ({percentage}%)
    </span>
  );
}
