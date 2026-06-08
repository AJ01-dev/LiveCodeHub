import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`text-xs font-mono px-2 py-1 rounded-md border ${
        location.pathname === to
          ? 'text-gh-fg border-gh-border bg-gh-subtle'
          : 'text-gh-muted border-transparent hover:text-gh-fg hover:border-gh-border'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="titlebar sticky top-0 z-50">
      <Link to="/dashboard" className="mr-4">
        <Logo size="sm" />
      </Link>

      <nav className="hidden sm:flex items-center gap-1 mr-auto">
        {navLink('/dashboard', 'dashboard')}
        {navLink('/profile', 'profile')}
      </nav>

      <div className="flex items-center gap-2 ml-auto">
        <span className="text-2xs text-gh-muted font-mono hidden sm:inline">{user?.name}</span>
        <button
          onClick={onLogout}
          className="text-2xs text-gh-muted hover:text-gh-danger font-mono px-2 py-1 border border-transparent hover:border-gh-border rounded-md"
        >
          logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
