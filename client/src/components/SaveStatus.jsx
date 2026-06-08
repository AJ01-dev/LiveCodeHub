const SaveStatus = ({ status, lastSavedAt, light = false }) => {
  const labels = {
    saving: 'Saving…',
    saved: 'Saved',
    unsaved: 'Modified',
    error: 'Save error',
  };

  const colors = light
    ? {
        saving: 'text-white/80',
        saved: 'text-white',
        unsaved: 'text-white/70',
        error: 'text-[#ffb4b0]',
      }
    : {
        saving: 'text-gh-warning',
        saved: 'text-gh-success',
        unsaved: 'text-gh-muted',
        error: 'text-gh-danger',
      };

  return (
    <div className={`flex items-center gap-1.5 text-2xs font-mono ${colors[status] || 'text-gh-muted'}`}>
      {status === 'saving' && (
        <span className="w-2 h-2 border border-current border-t-transparent rounded-full animate-spin" />
      )}
      {status === 'saved' && <span className="status-dot bg-current" />}
      <span>{labels[status] || status}</span>
      {status === 'saved' && lastSavedAt && !light && (
        <span className="text-gh-subtle">
          {new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
    </div>
  );
};

export default SaveStatus;
