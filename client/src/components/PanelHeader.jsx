const PanelHeader = ({ title, count, actions }) => (
  <div className="panel-header">
    <span>
      {title}
      {count !== undefined && (
        <span className="ml-2 font-mono normal-case text-gh-subtle">{count}</span>
      )}
    </span>
    {actions && <div className="flex items-center gap-1 normal-case">{actions}</div>}
  </div>
);

export default PanelHeader;
