import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import Input from '../components/Input';
import { copyRoomLink } from '../components/RoomCard';
import { useAuth } from '../context/AuthContext';
import { roomService } from '../services';

const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript' },
  { id: 'python', name: 'Python' },
  { id: 'java', name: 'Java' },
  { id: 'cpp', name: 'C++' },
];

const RoomSettings = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', language: 'javascript' });

  useEffect(() => {
    fetchData();
  }, [roomId]);

  const fetchData = async () => {
    try {
      const [roomRes, historyRes] = await Promise.all([
        roomService.getRoom(roomId),
        roomService.getRoomHistory(roomId),
      ]);

      const roomData = roomRes.data.data.room;
      const isOwner = String(roomData.owner._id || roomData.owner) === String(user.id);

      if (!isOwner) {
        toast.error('Only the room owner can access settings');
        navigate(`/room/${roomId}`);
        return;
      }

      setForm({
        name: roomData.name || '',
        description: roomData.description || '',
        language: roomData.language,
      });
      setHistory(historyRes.data.data.snapshots);
    } catch {
      toast.error('Failed to load room settings');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await roomService.updateSettings(roomId, form);
      toast.success('Settings saved');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this room permanently?')) return;
    setDeleting(true);
    try {
      await roomService.deleteRoom(roomId);
      toast.success('Room deleted');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete room');
    } finally {
      setDeleting(false);
    }
  };

  const handleRestoreSnapshot = (snapshot) => {
    if (!window.confirm('Restore this code version?')) return;
    navigate(`/room/${roomId}`, {
      state: { restoredCode: snapshot.code, restoredLanguage: snapshot.language },
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gh-canvas">
        <span className="w-5 h-5 border border-gh-border border-t-gh-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gh-canvas">
      <Navbar user={user} onLogout={handleLogout} />

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gh-border">
          <div>
            <Link to={`/room/${roomId}`} className="text-2xs text-gh-accent font-mono hover:underline">
              ← back to room
            </Link>
            <h1 className="text-base font-semibold text-gh-fg mt-2">Room settings</h1>
            <p className="font-mono text-2xs text-gh-muted mt-0.5">{roomId}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => copyRoomLink(roomId)}>
            copy link
          </Button>
        </div>

        <div className="gh-card p-4 mb-4">
          <h2 className="section-label normal-case text-sm">General</h2>
          <form onSubmit={handleSave} className="space-y-3">
            <Input
              label="Room name"
              placeholder="session-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              maxLength={60}
            />
            <div>
              <label className="block text-xs font-medium text-gh-muted mb-1">Description</label>
              <textarea
                className="input-field min-h-[72px] resize-none text-xs font-mono"
                placeholder="optional"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                maxLength={200}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gh-muted mb-1">Language</label>
              <select
                className="input-field font-mono text-xs"
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.id}>{lang.name}</option>
                ))}
              </select>
              <p className="text-2xs text-gh-muted font-mono mt-1">resets code to template</p>
            </div>
            <Button type="submit" loading={saving} size="sm">Save</Button>
          </form>
        </div>

        <div className="gh-card p-4 mb-4">
          <h2 className="section-label normal-case text-sm">Code history</h2>
          {history.length === 0 ? (
            <p className="text-2xs text-gh-muted font-mono">no snapshots yet</p>
          ) : (
            <div className="divide-y divide-gh-border border border-gh-border rounded-md overflow-hidden">
              {history.map((snap) => (
                <div
                  key={snap._id}
                  className="flex items-center justify-between px-3 py-2 bg-gh-canvas hover:bg-gh-subtle"
                >
                  <div>
                    <p className="text-xs text-gh-fg font-mono">
                      {snap.savedBy?.name || 'unknown'} · {snap.language}
                    </p>
                    <p className="text-2xs text-gh-muted">
                      {new Date(snap.savedAt).toLocaleString()}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => handleRestoreSnapshot(snap)}>
                    restore
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="gh-card p-4 border-gh-danger/40">
          <h2 className="text-sm font-semibold text-gh-danger mb-1">Danger zone</h2>
          <p className="text-2xs text-gh-muted font-mono mb-3">
            deletes room, messages, and history permanently
          </p>
          <Button variant="danger" loading={deleting} onClick={handleDelete} size="sm">
            Delete room
          </Button>
        </div>
      </main>
    </div>
  );
};

export default RoomSettings;
