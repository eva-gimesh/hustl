import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Mail,
  Lock,
  Sparkles,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logIn, isSupabaseActive } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please provide a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setLoading(true);
    const result = await logIn(email, password, rememberMe);

    if (result.success) {
      const fromPath = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(fromPath);
    } else {
      setServerError(result.error || 'Authentication failed. Please check credentials.');
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('hamlin.jaiju@gmail.com');
    setPassword('password123');
    setErrors({});
    setServerError('');
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#141B15] border border-[#273128] rounded-xs">
            <span className="w-1.5 h-1.5 bg-[#B6FF4A] rotate-45" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#B6FF4A]">
              DESK AUTHENTICATION
            </span>
          </div>

          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#F4F7F1] tracking-tight">
            WELCOME BACK.
          </h2>

          <p className="text-sm text-[#A0AAA0]">
            Pick up where your ambition left off.
          </p>
        </div>

        {/* Form Card */}
        <Card className="p-6 sm:p-8 bg-[#141B15] border-[#273128] space-y-5">
          {serverError && (
            <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-xs flex items-start gap-2.5 text-xs font-mono text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Address */}
            <div>
              <Input
                label="Email Address"
                type="email"
                placeholder="name@university.edu or company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                error={errors.email}
                leftIcon={<Mail className="w-4 h-4" />}
              />
            </div>

            {/* Password */}
            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your secret"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: '' });
                }}
                error={errors.password}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#A0AAA0] hover:text-[#F4F7F1] focus:outline-none cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
            </div>

            {/* Options: Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs font-mono">
              <label className="flex items-center gap-2 text-[#A0AAA0] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-[#B6FF4A] h-3.5 w-3.5 rounded-none bg-[#101510] border-[#273128] cursor-pointer"
                />
                <span>Remember session</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-[#B6FF4A] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Log In
            </Button>
          </form>

          {/* Quick Demo Fill Helper */}
          <div className="p-3 bg-[#101510] border border-[#273128] rounded-xs flex items-center justify-between text-xs font-mono">
            <span className="text-[#A0AAA0]">Evaluating the platform?</span>
            <button
              type="button"
              onClick={handleDemoFill}
              className="text-[#B6FF4A] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" /> Auto-fill Demo
            </button>
          </div>

          {/* Social Sign-in Note */}
          <div className="pt-2 border-t border-[#273128]">
            <button
              type="button"
              onClick={() => {
                if (isSupabaseActive) {
                  alert('Supabase Google OAuth initiated.');
                } else {
                  setServerError('Google sign-in requires Supabase OAuth credentials in .env.');
                }
              }}
              className="w-full py-2.5 px-4 bg-[#101510] border border-[#273128] hover:border-[#A0AAA0] text-[#F4F7F1] text-xs font-mono uppercase tracking-wider rounded-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.4 8.9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.8l3.7-6.1z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.4-6.7-5.3L1.6 16c1.9 3.8 5.8 7 10.4 7z"
                />
              </svg>
              <span>Log in with Google</span>
            </button>
          </div>

          {/* Signup Link */}
          <div className="pt-2 text-center text-xs font-mono text-[#A0AAA0]">
            New to HUSTL?{' '}
            <Link to="/signup" className="text-[#B6FF4A] font-bold hover:underline">
              Create an account
            </Link>
          </div>
        </Card>
      </div>
    </AuthLayout>
  );
};
