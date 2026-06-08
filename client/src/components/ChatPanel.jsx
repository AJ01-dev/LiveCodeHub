import { useState, useRef, useEffect } from 'react';
import PanelHeader from './PanelHeader';

const ChatPanel = ({ messages, onSend, currentUserId, onLoadMore, hasMore, loadingMore }) => {
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  };

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <aside className="w-56 lg:w-64 xl:w-72 flex-shrink-0 hidden md:flex flex-col border-l border-gh-border bg-[#181818] h-full">
      <PanelHeader title="Chat" count={messages.length} />

      <div className="flex-1 overflow-y-auto min-h-0">
        {hasMore && (
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="w-full text-2xs text-gh-accent hover:text-gh-fg font-mono py-2 border-b border-gh-border disabled:opacity-50"
          >
            {loadingMore ? 'loading…' : '↑ load older'}
          </button>
        )}

        {messages.length === 0 ? (
          <p className="text-2xs text-gh-muted font-mono px-3 py-6 text-center">no messages</p>
        ) : (
          <div className="divide-y divide-gh-border/50">
            {messages.map((msg) => {
              const isOwn =
                msg.sender?.id === currentUserId || msg.sender?._id === currentUserId;
              return (
                <div key={msg._id || `${msg.timestamp}-${msg.text}`} className="px-3 py-2">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span
                      className={`text-2xs font-mono font-medium ${
                        isOwn ? 'text-gh-accent' : 'text-gh-purple'
                      }`}
                    >
                      {msg.sender?.name || 'unknown'}
                    </span>
                    <span className="text-2xs text-gh-fg-subtle font-mono">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-gh-fg leading-relaxed break-words">{msg.text}</p>
                </div>
              );
            })}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-gh-border p-2">
        <div className="flex gap-1">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="message…"
            className="input-field flex-1 text-xs py-1.5 font-mono"
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="btn-primary text-2xs px-2 disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </form>
    </aside>
  );
};

export default ChatPanel;
