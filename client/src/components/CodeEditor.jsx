import { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';

const LANGUAGE_MAP = {
  javascript: 'javascript',
  python: 'python',
  java: 'java',
  cpp: 'cpp',
};

const CodeEditor = ({ code, language, onChange, readOnly = false, onPaste }) => {
  const editorRef = useRef(null);
  const isProgrammaticUpdate = useRef(false);

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
    if (!readOnly) editor.focus();

    if (onPaste) {
      editor.onDidPaste(() => onPaste());
    }
  };

  useEffect(() => {
    if (editorRef.current && code !== editorRef.current.getValue()) {
      isProgrammaticUpdate.current = true;
      const position = editorRef.current.getPosition();
      editorRef.current.setValue(code);
      if (position) {
        editorRef.current.setPosition(position);
      }
      requestAnimationFrame(() => {
        isProgrammaticUpdate.current = false;
      });
    }
  }, [code]);

  const handleChange = (value) => {
    if (isProgrammaticUpdate.current) return;
    onChange?.(value);
  };

  return (
    <div className="h-full bg-[#1e1e1e]">
      <Editor
        height="100%"
        language={LANGUAGE_MAP[language] || 'javascript'}
        value={code}
        onChange={handleChange}
        onMount={handleEditorMount}
        theme="vs-dark"
        options={{
          fontSize: 13,
          fontFamily: 'JetBrains Mono, Consolas, monospace',
          fontLigatures: true,
          minimap: { enabled: true, scale: 1 },
          scrollBeyondLastLine: false,
          wordWrap: 'off',
          automaticLayout: true,
          tabSize: 2,
          readOnly,
          padding: { top: 8 },
          lineNumbers: 'on',
          renderLineHighlight: 'line',
          cursorBlinking: 'solid',
          smoothScrolling: false,
          roundedSelection: false,
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true,
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
        }}
      />
    </div>
  );
};

export default CodeEditor;
