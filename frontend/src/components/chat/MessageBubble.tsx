import { Message } from '../../types';
import { DebugReport } from './DebugReport';
import { StreamingStatus } from './StreamingStatus';

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-2xl rounded-lg p-4 ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
        }`}
      >
        <p className="text-sm">{message.content}</p>

        {isUser === false && (
          <>
            {message.isStreaming ? (
              <StreamingStatus message="Processing..." />
            ) : message.result ? (
              <DebugReport result={message.result} />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
