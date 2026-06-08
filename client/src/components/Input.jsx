const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-xs font-medium text-gh-muted">{label}</label>
      )}
      <input
        className={`input-field ${error ? 'border-gh-danger focus:ring-gh-danger/30 focus:border-gh-danger' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-gh-danger text-2xs">{error}</p>}
    </div>
  );
};

export default Input;
