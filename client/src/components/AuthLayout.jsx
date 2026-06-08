import { Link } from 'react-router-dom';
import Logo from './Logo';

const FEATURES = [
  {
    title: 'Real-time collaboration',
    description: 'Code together with live sync, chat, and shared rooms.',
  },
  {
    title: 'Run code instantly',
    description: 'Execute JavaScript, Python, Java, and C++ from the browser.',
  },
  {
    title: 'Interview-ready',
    description: 'Host technical interviews with roles, timers, and analytics.',
  },
];

const AuthLayout = ({ mode, title, subtitle, children, footerText, footerLink, footerLinkLabel }) => {
  const isLogin = mode === 'login';

  return (
    <div className="min-h-screen flex bg-gh-canvas">
      {/* Left — product story */}
      <aside className="hidden lg:flex flex-col justify-between w-[45%] xl:w-[42%] px-12 xl:px-16 py-12 border-r border-gh-border/60">
        <div>
          <Logo size="lg" />
          <p className="mt-8 text-lg text-gh-fg font-medium leading-snug max-w-sm">
            Collaborative coding for modern engineering teams.
          </p>
          <p className="mt-3 text-sm text-gh-muted leading-relaxed max-w-md">
            Create rooms, pair program in real time, and ship interviews without
            switching tools.
          </p>
        </div>

        <ul className="space-y-6 max-w-md">
          {FEATURES.map((feature) => (
            <li key={feature.title} className="flex gap-4">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gh-accent flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gh-fg">{feature.title}</p>
                <p className="text-sm text-gh-muted mt-1 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <p className="text-xs text-gh-fg-subtle">
          © {new Date().getFullYear()} LiveCodeHub
        </p>
      </aside>

      {/* Right — auth card */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="lg:hidden mb-10">
          <Logo size="lg" />
        </div>

        <div className="w-full max-w-[400px]">
          <div className="rounded-xl border border-gh-border bg-gh-subtle/40 p-8">
            {/* Tab switcher */}
            <div className="flex p-1 rounded-lg bg-gh-canvas border border-gh-border mb-8">
              <Link
                to="/login"
                className={`flex-1 text-center text-sm font-medium py-2 rounded-md transition-colors ${
                  isLogin
                    ? 'bg-gh-subtle text-gh-fg shadow-sm'
                    : 'text-gh-muted hover:text-gh-fg'
                }`}
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className={`flex-1 text-center text-sm font-medium py-2 rounded-md transition-colors ${
                  !isLogin
                    ? 'bg-gh-subtle text-gh-fg shadow-sm'
                    : 'text-gh-muted hover:text-gh-fg'
                }`}
              >
                Register
              </Link>
            </div>

            <div className="mb-6">
              <h1 className="text-xl font-semibold text-gh-fg tracking-tight">{title}</h1>
              <p className="text-sm text-gh-muted mt-1.5">{subtitle}</p>
            </div>

            {children}

            <p className="text-sm text-gh-muted text-center mt-8 pt-6 border-t border-gh-border">
              {footerText}{' '}
              <Link
                to={footerLink}
                className="text-gh-accent hover:text-gh-fg transition-colors font-medium"
              >
                {footerLinkLabel}
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
