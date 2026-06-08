import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import { authService } from '../services';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authService.forgotPassword({ email });
      setSent(true);
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      mode="login"
      title="Forgot password"
      subtitle="Enter your email and we'll send a reset link"
      footerText="Remember your password?"
      footerLink="/login"
      footerLinkLabel="Sign in"
    >
      {sent ? (
        <div className="space-y-4">
          <p className="text-sm text-gh-muted">
            If <span className="text-gh-fg font-mono">{email}</span> is registered, check your
            inbox for a reset link. It expires in 1 hour.
          </p>
          <Link to="/login" className="text-sm text-gh-accent hover:underline">
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="pt-2">
            <Button type="submit" loading={loading} className="w-full">
              Send reset link
            </Button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
