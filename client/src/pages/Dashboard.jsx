import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import Input from '../components/Input';
import RoomCard from '../components/RoomCard';
import StatsPanel from '../components/StatsPanel';
import ActivityTimeline from '../components/ActivityTimeline';
import { useAuth } from '../context/AuthContext';
import { roomService } from '../services';
import { parseRoomId } from '../utils/roomId';

const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript' },
  { id: 'python', name: 'Python' },
  { id: 'java', name: 'Java' },
  { id: 'cpp', name: 'C++' },
];

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [ownedRooms, setOwnedRooms] = useState([]);
  const [recentRooms, setRecentRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [joinId, setJoinId] = useState('');
  const [joining, setJoining] = useState(false);
  const [selectedLang, setSelectedLang] = useState('javascript');
  const [interviewMode, setInterviewMode] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const [ownedRes, recentRes] = await Promise.all([
        roomService.getMyRooms(),
        roomService.getRecentRooms(),
      ]);
      setOwnedRooms(ownedRes.data.data.rooms.map((r) => ({ ...r, isOwner: true })));
      setRecentRooms(recentRes.data.data.rooms);
    } catch {
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    setCreating(true);
    try {
      const { data } = await roomService.createRoom({
        language: selectedLang,
        interviewMode,
        durationMinutes: interviewMode ? durationMinutes : undefined,
      });
      toast.success(interviewMode ? 'Interview room created' : 'Room created');
      navigate(`/room/${data.data.room.roomId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create room');
    } finally {
      setCreating(false);
      setShowCreateModal(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    const { roomId, error } = parseRoomId(joinId);
    if (error) {
      toast.error(error);
      return;
    }
    setJoining(true);
    try {
      await roomService.joinRoom(roomId);
      navigate(`/room/${roomId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Room not found');
    } finally {
      setJoining(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const openRoom = (roomId) => navigate(`/room/${roomId}`);
  const interviewCount = ownedRooms.filter((r) => r.interviewMode).length;

  return (
    <div className="min-h-screen bg-gh-canvas flex flex-col">
      <Navbar user={user} onLogout={handleLogout} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-base font-semibold text-gh-fg">Dashboard</h1>
            <p className="text-2xs text-gh-muted font-mono mt-0.5">
              {user?.email}
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>New room</Button>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <StatsPanel
            ownedCount={ownedRooms.length}
            recentCount={recentRooms.length}
            interviewCount={interviewCount}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column — join + your rooms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Join */}
            <section>
              <h2 className="section-label">Join room</h2>
              <form onSubmit={handleJoinRoom} className="flex gap-2">
                <Input
                  placeholder="ROOM_ID or paste room link"
                  value={joinId}
                  onChange={(e) => setJoinId(e.target.value)}
                  className="flex-1 font-mono"
                />
                <Button type="submit" loading={joining} variant="secondary">
                  Join
                </Button>
              </form>
            </section>

            {/* Your rooms — GitHub repo list style */}
            <section>
              <h2 className="section-label">Your rooms</h2>
              {loading ? (
                <div className="flex justify-center py-8">
                  <span className="w-5 h-5 border border-gh-border border-t-gh-accent rounded-full animate-spin" />
                </div>
              ) : ownedRooms.length === 0 ? (
                <div className="gh-card px-4 py-8 text-center">
                  <p className="text-xs text-gh-muted font-mono mb-3">no rooms yet</p>
                  <Button onClick={() => setShowCreateModal(true)} variant="secondary">
                    Create room
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {ownedRooms.map((room) => (
                    <RoomCard key={room._id} room={room} onOpen={openRoom} />
                  ))}
                </div>
              )}
            </section>

            {/* Recent */}
            <section>
              <h2 className="section-label">Recent rooms</h2>
              {loading ? null : recentRooms.length === 0 ? (
                <div className="gh-card px-4 py-6 text-center">
                  <p className="text-xs text-gh-muted font-mono">no recent activity</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentRooms.map((room) => (
                    <RoomCard
                      key={`recent-${room.roomId}`}
                      room={room}
                      onOpen={openRoom}
                      showLastVisited
                    />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right column — activity timeline */}
          <div>
            <h2 className="section-label">Activity</h2>
            {loading ? (
              <div className="gh-card px-4 py-8 flex justify-center">
                <span className="w-4 h-4 border border-gh-border border-t-gh-accent rounded-full animate-spin" />
              </div>
            ) : (
              <ActivityTimeline rooms={recentRooms} />
            )}
          </div>
        </div>
      </main>

      {/* Create modal — no backdrop blur */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="gh-card w-full max-w-md p-4">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gh-border">
              <h2 className="text-sm font-semibold text-gh-fg">New room</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gh-muted hover:text-gh-fg font-mono text-xs"
              >
                [esc]
              </button>
            </div>

            <p className="text-2xs text-gh-muted font-mono mb-3">select language</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setSelectedLang(lang.id)}
                  className={`px-3 py-2 rounded-md border text-left text-xs font-mono transition-colors ${
                    selectedLang === lang.id
                      ? 'border-gh-accent text-gh-accent bg-gh-accent-muted'
                      : 'border-gh-border text-gh-muted hover:border-[#484f58] hover:text-gh-fg'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>

            <label className="flex items-start gap-2 p-2 border border-gh-border rounded-md cursor-pointer hover:border-[#484f58] mb-3">
              <input
                type="checkbox"
                checked={interviewMode}
                onChange={(e) => setInterviewMode(e.target.checked)}
                className="mt-0.5"
              />
              <div>
                <p className="text-xs text-gh-fg">Interview mode</p>
                <p className="text-2xs text-gh-muted font-mono">roles · timer · analytics</p>
              </div>
            </label>

            {interviewMode && (
              <div className="mb-4">
                <label className="block text-2xs text-gh-muted font-mono mb-1">duration</label>
                <select
                  className="input-field font-mono text-xs"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                >
                  {[30, 45, 60, 90, 120].map((m) => (
                    <option key={m} value={m}>{m} min</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-2 pt-3 border-t border-gh-border">
              <Button variant="secondary" className="flex-1" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button className="flex-1" loading={creating} onClick={handleCreateRoom}>
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
