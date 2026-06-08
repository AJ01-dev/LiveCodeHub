import toast from 'react-hot-toast';

export const getRoomLink = (roomId) => `${window.location.origin}/room/${roomId}`;

export const copyRoomLink = (roomId) => {
  navigator.clipboard.writeText(getRoomLink(roomId));
  toast.success('Room link copied');
};

const RoomCard = ({ room, onOpen, showLastVisited = false }) => {
  const displayName = room.name || room.roomId;
  const isOwner = room.isOwner === true;

  const handleCopy = (e) => {
    e.stopPropagation();
    copyRoomLink(room.roomId);
  };

  const timestamp = showLastVisited && room.lastVisitedAt
    ? new Date(room.lastVisitedAt).toLocaleString()
    : new Date(room.createdAt).toLocaleDateString();

  const timestampLabel = showLastVisited && room.lastVisitedAt ? 'visited' : 'created';

  return (
    <div
      className="gh-card px-4 py-3 cursor-pointer group"
      onClick={() => onOpen(room.roomId)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-gh-accent font-mono text-xs">{room.roomId}</span>
            {room.interviewMode && <span className="badge-warning">interview</span>}
            {isOwner && <span className="badge-accent">owner</span>}
          </div>
          <p className="text-sm text-gh-fg font-medium mt-1 truncate">{displayName}</p>
          {room.description && (
            <p className="text-2xs text-gh-muted mt-1 line-clamp-1">{room.description}</p>
          )}
        </div>
        <span className="badge font-mono capitalize flex-shrink-0">{room.language}</span>
      </div>

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gh-border">
        <span className="text-2xs text-gh-muted font-mono">
          {timestampLabel} {timestamp}
        </span>
        <button
          onClick={handleCopy}
          className="text-2xs text-gh-muted hover:text-gh-accent font-mono opacity-0 group-hover:opacity-100"
        >
          copy link
        </button>
      </div>
    </div>
  );
};

export default RoomCard;
