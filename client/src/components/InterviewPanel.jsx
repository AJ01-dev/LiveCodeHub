import Button from './Button';
import InterviewTimer from './InterviewTimer';

const ROLE_LABELS = {
  interviewer: { label: 'interviewer', className: 'badge-accent' },
  candidate: { label: 'candidate', className: 'badge-success' },
};

const InterviewPanel = ({
  interview,
  role,
  isInterviewer,
  onStart,
  onEnd,
  onEnable,
  loading,
  remainingSeconds,
  elapsedSeconds,
  readOnly,
  onReadOnlyChange,
}) => {
  if (!interview && !isInterviewer) return null;

  const status = interview?.status || 'none';
  const roleBadge = role ? ROLE_LABELS[role] : null;
  const showReadOnlyToggle = role === 'interviewer' && interview?.status === 'active';

  return (
    <div className="flex items-center gap-2 flex-wrap px-3 h-9 bg-gh-subtle border-b border-gh-border text-2xs">
      {interview && <span className="badge-warning">interview mode</span>}

      {roleBadge && (
        <span className={roleBadge.className}>{roleBadge.label}</span>
      )}

      {interview && (
        <InterviewTimer
          remainingSeconds={remainingSeconds}
          elapsedSeconds={elapsedSeconds}
          durationMinutes={interview.durationMinutes}
          status={status}
        />
      )}

      {isInterviewer && (
        <div className="flex items-center gap-1.5">
          {!interview && (
            <Button size="sm" variant="secondary" onClick={onEnable} loading={loading}>
              Enable
            </Button>
          )}
          {interview?.status === 'idle' && (
            <Button size="sm" variant="primary" onClick={onStart} loading={loading}>
              Start
            </Button>
          )}
          {interview?.status === 'active' && (
            <Button size="sm" variant="danger" onClick={onEnd} loading={loading}>
              End
            </Button>
          )}
        </div>
      )}

      {showReadOnlyToggle && (
        <label className="flex items-center gap-1.5 ml-1 cursor-pointer font-mono text-gh-muted hover:text-gh-fg">
          <input
            type="checkbox"
            checked={readOnly}
            onChange={(e) => onReadOnlyChange?.(e.target.checked)}
            className="rounded border-gh-border"
          />
          <span>read-only</span>
        </label>
      )}
    </div>
  );
};

export default InterviewPanel;
