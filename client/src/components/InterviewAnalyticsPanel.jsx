const StatCell = ({ label, value }) => (
  <div className="border border-gh-border rounded-md px-3 py-2 bg-gh-canvas">
    <p className="text-lg font-mono font-semibold text-gh-fg">{value}</p>
    <p className="text-2xs text-gh-muted uppercase tracking-wide mt-0.5">{label}</p>
  </div>
);

const InterviewAnalyticsPanel = ({ analytics, onClose }) => {
  if (!analytics) return null;

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="border-t border-gh-border bg-gh-subtle flex-shrink-0 max-h-48 overflow-y-auto">
      <div className="panel-header normal-case">
        <span>Interview Analytics</span>
        {onClose && (
          <button onClick={onClose} className="text-gh-muted hover:text-gh-fg font-mono text-2xs">
            [close]
          </button>
        )}
      </div>

      <div className="p-3 grid grid-cols-3 sm:grid-cols-6 gap-2">
        <StatCell label="Duration" value={formatDuration(analytics.durationSeconds || 0)} />
        <StatCell label="Keystrokes" value={analytics.totalKeystrokes || 0} />
        <StatCell label="Saves" value={analytics.codeSaves || 0} />
        <StatCell label="Runs" value={analytics.codeRuns || 0} />
        <StatCell label="Pastes" value={analytics.pasteEvents || 0} />
        <StatCell label="Lines" value={analytics.finalLineCount || 0} />
      </div>

      {analytics.activityTimeline?.length > 0 && (
        <div className="px-3 pb-3 border-t border-gh-border pt-2">
          <p className="text-2xs text-gh-muted uppercase tracking-wide mb-1">Timeline</p>
          <div className="space-y-0.5">
            {analytics.activityTimeline.slice(-8).map((item, i) => (
              <div key={i} className="flex gap-2 text-2xs font-mono text-gh-muted">
                <span className="text-gh-fg-subtle w-16 flex-shrink-0">
                  {new Date(item.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
                <span className="text-gh-fg capitalize">{item.type?.replace('_', ' ')}</span>
                <span>({item.role})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewAnalyticsPanel;
