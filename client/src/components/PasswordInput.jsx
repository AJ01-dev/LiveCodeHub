import { useState } from 'react';

const PasswordInput = ({ label, error, className = '', ...props }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-xs font-medium text-gh-muted">{label}</label>
      )}
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          className={`input-field pr-16 ${error ? 'border-gh-danger focus:ring-gh-danger/30 focus:border-gh-danger' : ''} ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-2xs text-gh-muted hover:text-gh-fg font-mono px-1"
          tabIndex={-1}
        >
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
      {error && <p className="text-gh-danger text-2xs">{error}</p>}
    </div>
  );
};

export default PasswordInput;
