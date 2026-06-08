const UsersSidebar = ({ users, notifications }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-surface-600">
        <h3 className="font-semibold text-sm text-gray-200">
          Online Users
          <span className="ml-2 text-xs bg-success/20 text-success px-2 py-0.5 rounded-full">
            {users.length}
          </span>
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {users.map((user) => (
          <div
            key={user.id || user.socketId}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-700/50 transition-colors"
          >
            <div className="w-2 h-2 bg-success rounded-full flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-sm text-gray-300 truncate block">{user.name}</span>
              {user.role && (
                <span className="text-xs text-gray-500 capitalize">{user.role}</span>
              )}
            </div>
          </div>
        ))}

        {users.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-4">No users online</p>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="border-t border-surface-600 p-3 space-y-1 max-h-32 overflow-y-auto">
          {notifications.slice(-5).map((notif, i) => (
            <p key={i} className="text-xs text-gray-500 italic">
              {notif}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default UsersSidebar;
