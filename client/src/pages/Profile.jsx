import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services';

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [name, setName] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await authService.getProfile();
      setProfile(data.data);
      setName(data.data.user.name);
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await authService.updateProfile({ name });
      updateUser(data.data.user);
      toast.success('Profile updated');
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setChangingPassword(true);
    try {
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
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
        <h1 className="text-base font-semibold text-gh-fg mb-1">Profile</h1>
        <p className="text-2xs text-gh-muted font-mono mb-6">account settings</p>

        <div className="grid grid-cols-3 gap-px bg-gh-border border border-gh-border rounded-md overflow-hidden mb-6">
          {[
            { label: 'Rooms created', value: profile?.stats?.ownedRooms ?? 0 },
            { label: 'Rooms visited', value: profile?.stats?.roomsVisited ?? 0 },
            { label: 'Messages sent', value: profile?.stats?.messagesSent ?? 0 },
          ].map((stat) => (
            <div key={stat.label} className="bg-gh-subtle px-4 py-3">
              <p className="text-xl font-mono font-semibold text-gh-fg">{stat.value}</p>
              <p className="text-2xs text-gh-muted mt-0.5 uppercase tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="gh-card p-4 mb-4">
          <h2 className="section-label normal-case text-sm">Account</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-3">
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Email" value={profile?.user?.email || ''} disabled />
            <p className="text-2xs text-gh-muted font-mono">
              member since {new Date(profile?.user?.createdAt).toLocaleDateString()}
            </p>
            <Button type="submit" loading={saving} size="sm">
              Save
            </Button>
          </form>
        </div>

        <div className="gh-card p-4">
          <h2 className="section-label normal-case text-sm">Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <Input
              label="Current"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              required
            />
            <Input
              label="New"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              required
            />
            <Input
              label="Confirm"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              required
            />
            <Button type="submit" loading={changingPassword} variant="secondary" size="sm">
              Change password
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Profile;
