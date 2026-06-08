import { getAvatarColor, getInitials } from '../utils/avatar';

const SIZES = {
  sm: 'w-6 h-6 text-2xs',
  md: 'w-7 h-7 text-xs',
  lg: 'w-9 h-9 text-sm',
};

const UserAvatar = ({ name, email, size = 'sm', online = true, className = '' }) => {
  const seed = email || name || '?';
  const initials = getInitials(name);
  const color = getAvatarColor(seed);

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      <div
        className={`${SIZES[size]} rounded-md flex items-center justify-center font-mono font-semibold text-white`}
        style={{ backgroundColor: color }}
        title={name}
      >
        {initials}
      </div>
      <span
        className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#181818] ${
          online ? 'bg-gh-success' : 'bg-gh-muted'
        }`}
      />
    </div>
  );
};

export default UserAvatar;
