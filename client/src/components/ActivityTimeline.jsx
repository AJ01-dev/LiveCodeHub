const ActivityTimeline = ({ rooms }) => {
  if (!rooms.length) {
    return (
      <div className="gh-card px-4 py-6 text-center">
        <p className="text-xs text-gh-muted font-mono">No recent activity</p>
      </div>
    );
  }

  const events = rooms.slice(0, 8).map((room) => ({
    id: room.roomId,
    label: room.name || room.roomId,
    sub: room.lastVisitedAt
      ? `Visited ${new Date(room.lastVisitedAt).toLocaleString()}`
      : `Created ${new Date(room.createdAt).toLocaleDateString()}`,
    lang: room.language,
    interview: room.interviewMode,
  }));

  return (
    <div className="gh-card divide-y divide-gh-border">
      {events.map((event) => (
        <div key={event.id} className="flex items-start gap-3 px-4 py-3">
          <div className="mt-1 w-2 h-2 rounded-full bg-gh-accent flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gh-fg font-medium truncate">{event.label}</p>
            <p className="text-2xs text-gh-muted font-mono mt-0.5">{event.sub}</p>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <span className="badge font-mono capitalize">{event.lang}</span>
            {event.interview && <span className="badge-warning">intv</span>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityTimeline;
