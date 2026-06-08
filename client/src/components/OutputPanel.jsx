import { useState } from 'react';
import Button from './Button';

export const OutputPanelWithRun = ({
  onRun,
  loading,
  output,
  error,
  compileOutput,
  status,
  time,
  memory,
}) => {
  const [stdin, setStdin] = useState('');
  const [activeTab, setActiveTab] = useState('output');

  const tabs = [
    { id: 'output', label: 'OUTPUT' },
    { id: 'input', label: 'STDIN' },
    { id: 'error', label: 'ERRORS' },
  ];

  const hasErrors = error || compileOutput;

  return (
    <div className="flex flex-col h-full bg-gh-canvas border-t border-gh-border">
      {/* Panel tab bar */}
      <div className="flex items-center h-9 bg-gh-subtle border-b border-gh-border flex-shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={activeTab === tab.id ? 'tab-active' : 'tab'}
          >
            {tab.label}
            {tab.id === 'error' && hasErrors && (
              <span className="ml-1.5 w-1.5 h-1.5 bg-gh-danger inline-block" />
            )}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-3 px-3">
          {status && (
            <span
              className={`text-2xs font-mono ${
                status === 'Accepted' ? 'text-gh-success' : 'text-gh-warning'
              }`}
            >
              {status}
              {time && ` · ${time}s`}
              {memory && ` · ${memory}kb`}
            </span>
          )}
          <Button size="sm" onClick={() => onRun(stdin)} loading={loading}>
            Run
          </Button>
        </div>
      </div>

      {/* Console body */}
      <div className="flex-1 overflow-auto min-h-[120px]">
        {loading ? (
          <div className="flex items-center gap-2 text-gh-muted font-mono text-xs p-3">
            <span className="w-3 h-3 border border-gh-muted border-t-transparent rounded-full animate-spin" />
            executing…
          </div>
        ) : activeTab === 'output' ? (
          <pre className="terminal-output min-h-full">
            {output || '$ awaiting execution…'}
          </pre>
        ) : activeTab === 'input' ? (
          <textarea
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            placeholder="# stdin input"
            className="w-full h-full min-h-[100px] bg-gh-canvas text-gh-fg font-mono text-xs p-3 resize-none focus:outline-none placeholder:text-gh-fg-subtle"
          />
        ) : (
          <pre className="terminal-output text-gh-danger min-h-full">
            {compileOutput || error || '$ no errors'}
          </pre>
        )}
      </div>
    </div>
  );
};

export default OutputPanelWithRun;
