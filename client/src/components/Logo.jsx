const Logo = ({ size = 'md' }) => {
  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className={`flex items-center gap-2 font-mono font-medium ${sizes[size]}`}>
      <span className="text-gh-accent">{`{ }`}</span>
      <span className="text-gh-fg tracking-tight">LiveCodeHub</span>
    </div>
  );
};

export default Logo;
