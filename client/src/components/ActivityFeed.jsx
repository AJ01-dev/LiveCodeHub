const ACTIVITY_ICONS = {
  join: '→',
  leave: '←',
  code_executed: '▶',
  language_changed: '{}',
  interview_started: '◎',
  interview_ended: '■',
};

const formatTime = (timestamp) =>
  new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const ActivityFeed = ({ activities }) => {
  if (!activities.length) {
    return (
      <p className="text-2xs text-gh-muted font-mono px-3 py-4">no activity yet</p>
    );
  }

  return (
    <div className="overflow-y-auto">
      {activities.slice(-12).reverse().map((activity) => (
        <div
          key={activity.id}
          className="flex items-start gap-2 px-3 py-1.5 border-b border-gh-border/50 last:border-0"
        >
          <span className="text-2xs font-mono text-gh-accent w-4 flex-shrink-0 mt-0.5">
            {ACTIVITY_ICONS[activity.type] || '·'}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-2xs text-gh-fg leading-relaxed">{activity.message}</p>
            <p className="text-2xs text-gh-fg-subtle font-mono mt-0.5">
              {formatTime(activity.timestamp)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;
