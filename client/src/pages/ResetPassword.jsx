import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from '../components/AuthLayout';
import PasswordInput from '../components/PasswordInput';
import Button from '../components/Button';
import { authService } from '../services';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error('Invalid reset link');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { data } = await authService.resetPassword({ token, password });
      toast.success(data.message);
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout
        mode="login"
        title="Invalid link"
        subtitle="This password reset link is missing or expired"
        footerText="Need a new link?"
        footerLink="/forgot-password"
        footerLinkLabel="Request reset"
      >
        <Link to="/forgot-password" className="text-sm text-gh-accent hover:underline">
          Request a new reset link
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      mode="login"
      title="Set new password"
      subtitle="Choose a new password for your account"
      footerText="Back to"
      footerLink="/login"
      footerLinkLabel="Sign in"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <PasswordInput
          label="New password"
          placeholder="min 6 chars"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <PasswordInput
          label="Confirm password"
          placeholder="repeat password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <div className="pt-2">
          <Button type="submit" loading={loading} className="w-full">
            Reset password
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
