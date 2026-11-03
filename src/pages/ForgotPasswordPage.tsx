import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Shield,
} from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      setError('Please provide a valid registered email address.');
      return;
    }

    setLoading(true);
    const result = await resetPassword(email);

    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error || 'Failed to dispatch reset request.');
    }
    setLoading(false);
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#141B15] border border-[#273128] rounded-xs">
            <span className="w-1.5 h-1.5 bg-[#B6FF4A] rotate-45" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#B6FF4A]">
              SECURITY RECOVERY
            </span>
          </div>

          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#F4F7F1] tracking-tight">
            FORGOT YOUR PASSWORD?
          </h2>

          <p className="text-sm text-[#A0AAA0]">
            It happens. Enter your email and we'll help you get back into HUSTL.
          </p>
        </div>

        {/* Form or Success Card */}
        <Card className="p-6 sm:p-8 bg-[#141B15] border-[#273128] space-y-5">
          {submitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 bg-[#101510] border border-[#B6FF4A] text-[#B6FF4A] flex items-center justify-center mx-auto rounded-none">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="font-display font-bold text-xl text-[#F4F7F1]">
                  Recovery Instructions Dispatched
                </h3>
                <p className="text-xs text-[#A0AAA0] max-w-sm mx-auto leading-relaxed">
                  If an account exists for <strong className="text-[#F4F7F1]">{email}</strong>, you will receive an encrypted reset token and instructions within 2 minutes.
                </p>
              </div>

              <div className="pt-4 flex flex-col gap-2">
                <Link to="/login" className="w-full">
                  <Button fullWidth size="md" variant="primary">
                    Return to Log In
                  </Button>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setEmail('');
                  }}
                  className="text-xs font-mono text-[#A0AAA0] hover:text-[#F4F7F1] py-2 cursor-pointer"
                >
                  Try a different email address
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-xs flex items-start gap-2 text-xs font-mono text-red-300">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <Input
                label="Registered Account Email"
                type="email"
                placeholder="name@university.edu or domain.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={loading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Send Reset Link
              </Button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-[#A0AAA0] hover:text-[#B6FF4A] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Account Login</span>
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </AuthLayout>
  );
};
