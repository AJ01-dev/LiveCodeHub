import SaveStatus from './SaveStatus';

const StatusBar = ({
  connected,
  language,
  roomId,
  saveStatus,
  lastSavedAt,
  userCount,
  onLanguageChange,
  languages,
  isOwner,
}) => (
  <footer className="statusbar flex-shrink-0">
    <div className="status-item">
      <span className={`status-dot ${connected ? 'bg-gh-success' : 'bg-gh-danger'}`} />
      <span>{connected ? 'Connected' : 'Disconnected'}</span>
    </div>

    {roomId && (
      <div className="status-item font-mono opacity-90">{roomId}</div>
    )}

    {languages && (
      <select
        value={language}
        onChange={(e) => onLanguageChange?.(e.target.value)}
        disabled={!isOwner}
        className="bg-transparent border-none text-white text-2xs font-mono opacity-90 cursor-pointer focus:outline-none disabled:opacity-50"
      >
        {languages.map((l) => (
          <option key={l.id} value={l.id} className="bg-gh-subtle text-gh-fg">
            {l.name}
          </option>
        ))}
      </select>
    )}

    <div className="ml-auto flex items-center gap-4">
      {userCount !== undefined && (
        <span className="opacity-90">{userCount} online</span>
      )}
      <SaveStatus status={saveStatus} lastSavedAt={lastSavedAt} light />
    </div>
  </footer>
);

export default StatusBar;
