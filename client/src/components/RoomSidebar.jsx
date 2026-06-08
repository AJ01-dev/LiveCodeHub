import { Link } from 'react-router-dom';
import PanelHeader from './PanelHeader';
import UserAvatar from './UserAvatar';
import ActivityFeed from './ActivityFeed';
import { copyRoomLink } from './RoomCard';

const RoomSidebar = ({
  roomId,
  roomName,
  language,
  interviewMode,
  isOwner,
  users,
  activities,
  currentUserId,
}) => {
  return (
    <aside className="w-56 xl:w-60 flex-shrink-0 hidden md:flex flex-col border-r border-gh-border bg-[#181818] h-full">
      <PanelHeader title="Room" />
      <div className="px-3 py-2 border-b border-gh-border space-y-2">
        {roomName && (
          <p className="text-xs text-gh-fg font-medium truncate">{roomName}</p>
        )}
        <div className="flex items-center gap-2">
          <span className="font-mono text-2xs text-gh-accent">{roomId}</span>
          <button
            onClick={() => copyRoomLink(roomId)}
            className="text-2xs text-gh-muted hover:text-gh-accent font-mono"
            title="Copy invite link"
          >
            [link]
          </button>
        </div>
        <div className="flex flex-wrap gap-1">
          <span className="badge font-mono capitalize">{language}</span>
          {interviewMode && <span className="badge-warning">interview</span>}
          {isOwner && <span className="badge-accent">owner</span>}
        </div>
        {isOwner && (
          <Link
            to={`/room/${roomId}/settings`}
            className="block text-2xs text-gh-muted hover:text-gh-accent font-mono"
          >
            → room settings
          </Link>
        )}
      </div>

      <PanelHeader title="Participants" count={users.length} />
      <div className="flex-1 overflow-y-auto min-h-0 max-h-[45%]">
        {users.length === 0 ? (
          <p className="text-2xs text-gh-muted px-3 py-4 font-mono">no connections</p>
        ) : (
          <ul className="py-1">
            {users.map((user) => {
              const isSelf = String(user.id) === String(currentUserId);
              return (
                <li
                  key={user.socketId || user.id}
                  className={`flex items-center gap-2.5 px-3 py-2 hover:bg-gh-subtle/50 ${
                    isSelf ? 'bg-gh-accent-muted/20' : ''
                  }`}
                >
                  <UserAvatar
                    name={user.name}
                    email={user.email || user.id}
                    online
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gh-fg truncate">
                      {user.name}
                      {isSelf && (
                        <span className="text-gh-muted font-mono text-2xs ml-1">(you)</span>
                      )}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-2xs text-gh-success font-mono">online</span>
                      {user.role && (
                        <span className="text-2xs text-gh-muted font-mono capitalize">
                          · {user.role}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <PanelHeader title="Activity" count={activities.length} />
      <div className="max-h-40 overflow-y-auto border-t border-gh-border flex-shrink-0">
        <ActivityFeed activities={activities} />
      </div>
    </aside>
  );
};

export default RoomSidebar;
