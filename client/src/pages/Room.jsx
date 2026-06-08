import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import CodeEditor from '../components/CodeEditor';
import ChatPanel from '../components/ChatPanel';
import RoomSidebar from '../components/RoomSidebar';
import { OutputPanelWithRun } from '../components/OutputPanel';
import StatusBar from '../components/StatusBar';
import InterviewPanel from '../components/InterviewPanel';
import InterviewAnalyticsPanel from '../components/InterviewAnalyticsPanel';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useInterviewTimer } from '../hooks/useInterviewTimer';
import { roomService, executionService, interviewService } from '../services';
import { connectSocket, disconnectSocket, getSocket } from '../services/socket';

const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript' },
  { id: 'python', name: 'Python' },
  { id: 'java', name: 'Java' },
  { id: 'cpp', name: 'C++' },
];

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();

  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [roomName, setRoomName] = useState('');
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activities, setActivities] = useState([]);
  const [connected, setConnected] = useState(false);
  const [interviewerReadOnly, setInterviewerReadOnly] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved');
  const [lastSavedAt, setLastSavedAt] = useState(null);

  const [interviewMode, setInterviewMode] = useState(false);
  const [interview, setInterview] = useState(null);
  const [interviewRole, setInterviewRole] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [interviewLoading, setInterviewLoading] = useState(false);

  const { elapsedSeconds, remainingSeconds } = useInterviewTimer(interview);

  const isInterviewer = interviewRole === 'interviewer';
  const isReadOnly = isInterviewer && interview?.status === 'active' && interviewerReadOnly;

  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [compileOutput, setCompileOutput] = useState('');
  const [runStatus, setRunStatus] = useState('');
  const [runTime, setRunTime] = useState(null);
  const [runMemory, setRunMemory] = useState(null);

  const [showOutput, setShowOutput] = useState(true);

  const codeRef = useRef(code);
  const isRemoteUpdate = useRef(false);
  const saveTimeout = useRef(null);
  const pendingRestore = useRef(null);
  const restoredCodeRef = useRef(location.state?.restoredCode);
  const restoredLanguageRef = useRef(location.state?.restoredLanguage);

  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  const addActivity = useCallback((activity) => {
    setActivities((prev) => [
      ...prev,
      {
        id: activity.id || `${activity.type}-${Date.now()}`,
        type: activity.type,
        message: activity.message,
        timestamp: activity.timestamp || new Date().toISOString(),
        user: activity.user,
        metadata: activity.metadata,
      },
    ]);
  }, []);

  useEffect(() => {
    if (!token || !roomId) return;

    let cancelled = false;
    const socket = connectSocket(token);

    const joinRoom = () => {
      setConnected(true);
      socket.emit('join-room', { roomId });
    };

    const handleRoomJoined = ({ room, users: roomUsers, interview: interviewData, role }) => {
      const restored = pendingRestore.current;
      const initialCode = restored ?? room.code;

      setCode(initialCode);
      setLanguage(room.language);
      setRoomName(room.name || '');
      setLastSavedAt(room.lastSavedAt || null);
      setInterviewMode(room.interviewMode || false);
      setInterview(interviewData || null);
      if (role) setInterviewRole(role);
      setUsers(roomUsers);
      setLoading(false);
      codeRef.current = initialCode;

      if (restored) {
        pendingRestore.current = null;
        restoredCodeRef.current = null;
        setSaveStatus('saving');
        socket.emit('save-code', { roomId, code: restored });
        socket.emit('code-change', { roomId, code: restored });
      }
    };

    socket.on('connect', joinRoom);
    socket.io.on('reconnect', joinRoom);

    socket.on('connect_error', () => {
      toast.error('Failed to connect to room');
      setLoading(false);
    });

    socket.on('room-joined', handleRoomJoined);

    socket.on('room-error', ({ message }) => {
      toast.error(message);
    });

    socket.on('code-update', ({ code: newCode }) => {
      isRemoteUpdate.current = true;
      setCode(newCode);
      codeRef.current = newCode;
    });

    socket.on('language-update', ({ language: newLang, code: newCode }) => {
      isRemoteUpdate.current = true;
      setLanguage(newLang);
      setCode(newCode);
      codeRef.current = newCode;
      toast.success(`Language changed to ${newLang}`);
    });

    socket.on('room-activity', (activity) => {
      addActivity(activity);
    });

    socket.on('new-message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('users-update', ({ users: roomUsers }) => {
      setUsers(roomUsers);
    });

    socket.on('user-joined', ({ user: joinedUser, users: roomUsers }) => {
      setUsers(roomUsers);
      toast.success(`${joinedUser.name} joined`, { icon: '👋' });
    });

    socket.on('user-left', ({ user: leftUser, users: roomUsers }) => {
      setUsers(roomUsers);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('code-saved', ({ savedAt }) => {
      setSaveStatus('saved');
      setLastSavedAt(savedAt);
    });

    socket.on('code-save-error', () => {
      setSaveStatus('error');
    });

    socket.on('interview-started', ({ interview: startedInterview }) => {
      setInterview(startedInterview);
      setInterviewerReadOnly(true);
      addActivity({
        type: 'interview_started',
        message: 'Interview started',
      });
      toast.success('Interview started!', { icon: '🎯' });
    });

    socket.on('interview-readonly-update', ({ readOnly }) => {
      setInterviewerReadOnly(readOnly);
    });

    socket.on('interview-ended', ({ interview: endedInterview, analytics: endedAnalytics }) => {
      setInterview(endedInterview);
      setAnalytics(endedAnalytics);
      setShowAnalytics(true);
      setInterviewerReadOnly(false);
      addActivity({
        type: 'interview_ended',
        message: 'Interview ended',
      });
      toast.success('Interview ended');
    });

    const initRoom = async () => {
      try {
        const [roomRes, messagesRes, interviewRes] = await Promise.all([
          roomService.getRoom(roomId),
          roomService.getMessages(roomId),
          interviewService.getInterview(roomId).catch(() => ({ data: { data: { interview: null } } })),
          roomService.joinRoom(roomId).catch(() => null),
        ]);

        if (cancelled) return;

        const room = roomRes.data.data.room;
        const restored = restoredCodeRef.current;
        const ownerCheck = String(room.owner._id || room.owner) === String(user.id);

        setCode(restored ?? room.code);
        setLanguage(restoredLanguageRef.current ?? room.language);
        setRoomName(room.name || '');
        setLastSavedAt(room.lastSavedAt || null);
        setIsOwner(ownerCheck);
        setInterviewMode(room.interviewMode || false);
        setInterview(interviewRes.data.data.interview);
        codeRef.current = restored ?? room.code;

        if (room.interviewMode) {
          try {
            const roleRes = await interviewService.assignRole(roomId);
            setInterviewRole(roleRes.data.data.role);
          } catch {
            setInterviewRole(ownerCheck ? 'interviewer' : 'candidate');
          }
        }

        if (restored) {
          pendingRestore.current = restored;
        }

        const formattedMessages = messagesRes.data.data.messages.map((msg) => ({
          ...msg,
          sender: { id: msg.sender._id, name: msg.sender.name },
        }));
        setMessages(formattedMessages);
        setHasMoreMessages(messagesRes.data.data.hasMore ?? false);
      } catch {
        if (!cancelled) {
          toast.error('Room not found');
          navigate('/dashboard');
        }
        return;
      }

      if (cancelled) return;

      if (socket.connected) {
        joinRoom();
      }
    };

    initRoom();

    return () => {
      cancelled = true;
      clearTimeout(saveTimeout.current);
      socket.emit('leave-room', { roomId });
      socket.off('connect', joinRoom);
      socket.io.off('reconnect', joinRoom);
      socket.off('connect_error');
      socket.off('room-joined', handleRoomJoined);
      socket.off('room-error');
      socket.off('code-update');
      socket.off('language-update');
      socket.off('room-activity');
      socket.off('new-message');
      socket.off('users-update');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('disconnect');
      socket.off('code-saved');
      socket.off('code-save-error');
      socket.off('interview-started');
      socket.off('interview-readonly-update');
      socket.off('interview-ended');
      disconnectSocket();
    };
  }, [roomId, token, user.id, navigate, addActivity]);

  const handleLoadMoreMessages = async () => {
    if (!messages.length || loadingMore) return;

    setLoadingMore(true);
    try {
      const oldest = messages[0].timestamp;
      const { data } = await roomService.getMessages(roomId, { before: oldest, limit: 50 });
      const older = data.data.messages.map((msg) => ({
        ...msg,
        sender: { id: msg.sender._id, name: msg.sender.name },
      }));
      setMessages((prev) => [...older, ...prev]);
      setHasMoreMessages(data.data.hasMore);
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleCodeChange = (value) => {
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }

    if (isReadOnly) return;

    const newCode = value || '';
    setCode(newCode);
    codeRef.current = newCode;
    setSaveStatus('unsaved');

    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('code-change', { roomId, code: newCode });

      clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => {
        setSaveStatus('saving');
        socket.emit('save-code', { roomId, code: newCode });
      }, 2000);
    }
  };

  const handlePaste = () => {
    const socket = getSocket();
    if (socket?.connected && interview?.status === 'active') {
      socket.emit('code-change', { roomId, code: codeRef.current, isPaste: true });
    }
  };

  const handleEnableInterview = async () => {
    setInterviewLoading(true);
    try {
      const { data } = await interviewService.enableInterview(roomId, 60);
      setInterview(data.data.interview);
      setInterviewMode(true);
      setInterviewRole('interviewer');
      toast.success('Interview mode enabled');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to enable interview mode');
    } finally {
      setInterviewLoading(false);
    }
  };

  const handleStartInterview = async () => {
    setInterviewLoading(true);
    try {
      const { data } = await interviewService.startInterview(roomId);
      setInterview(data.data.interview);
      toast.success('Interview started!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start interview');
    } finally {
      setInterviewLoading(false);
    }
  };

  const handleEndInterview = async () => {
    if (!window.confirm('End the interview? Analytics will be generated.')) return;
    setInterviewLoading(true);
    try {
      const { data } = await interviewService.endInterview(roomId);
      setInterview(data.data.interview);
      setAnalytics(data.data.analytics);
      setShowAnalytics(true);
      toast.success('Interview ended');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to end interview');
    } finally {
      setInterviewLoading(false);
    }
  };

  const handleReadOnlyChange = (enabled) => {
    setInterviewerReadOnly(enabled);
    const socket = getSocket();
    if (socket?.connected && isInterviewer) {
      socket.emit('interview-readonly', { roomId, readOnly: enabled });
    }
  };

  const handleViewAnalytics = async () => {
    try {
      const { data } = await interviewService.getAnalytics(roomId);
      setAnalytics(data.data.analytics);
      setShowAnalytics(true);
    } catch {
      toast.error('No analytics available');
    }
  };

  const handleLanguageChange = async (newLang) => {
    if (newLang === language) return;

    if (isOwner) {
      try {
        await roomService.updateLanguage(roomId, newLang);
        const socket = getSocket();
        if (socket?.connected) {
          const defaultCodes = {
            javascript: `// Welcome to CodeCollab!\nfunction greet(name) {\n  console.log("Hello, " + name + "!");\n}\n\ngreet("World");\n`,
            python: `# Welcome to CodeCollab!\ndef greet(name):\n    print(f"Hello, {name}!")\n\ngreet("World")\n`,
            java: `// Welcome to CodeCollab!\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n`,
            cpp: `// Welcome to CodeCollab!\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}\n`,
          };
          socket.emit('language-change', { roomId, language: newLang, code: defaultCodes[newLang] });
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to change language');
      }
    } else {
      toast.error('Only the room owner can change the language');
    }
  };

  const handleSendMessage = (text) => {
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('chat-message', { roomId, text });
    }
  };

  const handleRunCode = async (stdin) => {
    if (isReadOnly) {
      toast.error('Interviewer cannot run code during active interview');
      return;
    }

    setRunning(true);
    setOutput('');
    setError('');
    setCompileOutput('');
    setRunStatus('');
    setRunTime(null);
    setRunMemory(null);

    try {
      const { data } = await executionService.runCode({
        sourceCode: codeRef.current,
        language,
        stdin,
      });

      const result = data.data;
      setOutput(result.stdout);
      setError(result.stderr);
      setCompileOutput(result.compileOutput);
      setRunStatus(result.status);
      setRunTime(result.time);
      setRunMemory(result.memory);
      setShowOutput(true);

      const socket = getSocket();
      if (socket?.connected) {
        socket.emit('room-activity', {
          roomId,
          type: 'code_executed',
          message: `${user.name} executed code · ${result.status}`,
          metadata: { status: result.status, language },
        });

        if (interview?.status === 'active') {
          socket.emit('track-activity', {
            roomId,
            type: 'run_code',
            metadata: { status: result.status, language },
          });
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Code execution failed');
      setError(err.response?.data?.message || 'Execution failed');
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gh-canvas">
        <div className="flex flex-col items-center gap-2">
          <span className="w-5 h-5 border border-gh-border border-t-gh-accent rounded-full animate-spin" />
          <p className="text-2xs text-gh-muted font-mono">joining {roomId}…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gh-canvas overflow-hidden">
      {/* Title bar */}
      <header className="titlebar flex-shrink-0">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="mr-2">
          ← dashboard
        </Button>
        <span className="font-mono text-2xs text-gh-accent">{roomId}</span>
        {roomName && (
          <span className="text-2xs text-gh-muted ml-2 truncate hidden sm:inline">/ {roomName}</span>
        )}
        {isReadOnly && (
          <span className="badge-warning ml-2 hidden sm:inline">read-only</span>
        )}
        <div className="ml-auto flex items-center gap-2">
          {interview?.status === 'ended' && analytics && (
            <Button size="sm" variant="secondary" onClick={() => setShowAnalytics(!showAnalytics)}>
              analytics
            </Button>
          )}
          {interview?.status === 'ended' && !analytics && isOwner && (
            <Button size="sm" variant="secondary" onClick={handleViewAnalytics}>
              load analytics
            </Button>
          )}
        </div>
      </header>

      {/* Interview controls */}
      {(interviewMode || interview) && (
        <InterviewPanel
          interview={interview}
          role={interviewRole}
          isInterviewer={isOwner}
          onStart={handleStartInterview}
          onEnd={handleEndInterview}
          onEnable={handleEnableInterview}
          loading={interviewLoading}
          remainingSeconds={remainingSeconds}
          elapsedSeconds={elapsedSeconds}
          readOnly={interviewerReadOnly}
          onReadOnlyChange={handleReadOnlyChange}
        />
      )}

      {/* IDE layout */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        <RoomSidebar
          roomId={roomId}
          roomName={roomName}
          language={language}
          interviewMode={interviewMode}
          isOwner={isOwner}
          users={users}
          activities={activities}
          currentUserId={user.id}
        />

        {/* Center: editor + terminal */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className={`flex-1 min-h-0 ${showOutput ? '' : 'flex-grow'}`}>
            <CodeEditor
              code={code}
              language={language}
              onChange={handleCodeChange}
              readOnly={isReadOnly}
              onPaste={handlePaste}
            />
          </div>

          {showOutput && (
            <div className="h-52 flex-shrink-0">
              <OutputPanelWithRun
                onRun={handleRunCode}
                loading={running}
                output={output}
                error={error}
                compileOutput={compileOutput}
                status={runStatus}
                time={runTime}
                memory={runMemory}
              />
            </div>
          )}

          {showAnalytics && analytics && (
            <InterviewAnalyticsPanel
              analytics={analytics}
              onClose={() => setShowAnalytics(false)}
            />
          )}
        </div>

        <ChatPanel
          messages={messages}
          onSend={handleSendMessage}
          currentUserId={user.id}
          onLoadMore={handleLoadMoreMessages}
          hasMore={hasMoreMessages}
          loadingMore={loadingMore}
        />
      </div>

      {/* Status bar */}
      <StatusBar
        connected={connected}
        language={language}
        roomId={roomId}
        saveStatus={saveStatus}
        lastSavedAt={lastSavedAt}
        userCount={users.length}
        onLanguageChange={handleLanguageChange}
        languages={LANGUAGES}
        isOwner={isOwner}
      />
    </div>
  );
};

export default Room;
