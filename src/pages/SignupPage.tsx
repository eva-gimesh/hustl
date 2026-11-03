import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, isSupabaseActive } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (pass.length === 0) return { score: 0, label: '', color: 'bg-transparent' };
    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-400' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-[#7CCB37]' };
    return { score: 4, label: 'Strong', color: 'bg-[#B6FF4A]' };
  };

  const strength = getPasswordStrength(password);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full legal or builder name is required.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please provide a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!acceptTerms) {
      newErrors.terms = 'You must accept the terms and conditions.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setLoading(true);
    const result = await signUp(fullName, email, password);

    if (result.success) {
      // Redirect to onboarding role selection
      navigate('/onboarding');
    } else {
      setServerError(result.error || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#141B15] border border-[#273128] rounded-xs">
            <span className="w-1.5 h-1.5 bg-[#B6FF4A] rotate-45" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#B6FF4A]">
              ACCOUNT INITIALIZATION
            </span>
          </div>

          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#F4F7F1] tracking-tight">
            CREATE YOUR HUSTL ACCOUNT.
          </h2>

          <p className="text-sm text-[#A0AAA0]">
            Your skills deserve a platform. Start building your next opportunity.
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <Input
                label="Full Name"
                placeholder="e.g. Elena Rostova"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors({ ...errors, fullName: '' });
                }}
                error={errors.fullName}
              />
            </div>

            {/* Email Address */}
            <div>
              <Input
                label="Email Address"
                type="email"
                placeholder="name@university.edu or domain.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                error={errors.email}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  error={errors.password}
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

              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#A0AAA0]">Password Strength:</span>
                    <span
                      className={`font-bold ${
                        strength.score >= 3 ? 'text-[#B6FF4A]' : 'text-[#A0AAA0]'
                      }`}
                    >
                      {strength.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 h-1 bg-[#101510] border border-[#273128] rounded-none">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full transition-colors ${
                          step <= strength.score ? strength.color : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                }}
                error={errors.confirmPassword}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-[#A0AAA0] hover:text-[#F4F7F1] focus:outline-none cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#A0AAA0] select-none">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => {
                    setAcceptTerms(e.target.checked);
                    if (errors.terms) setErrors({ ...errors, terms: '' });
                  }}
                  className="mt-0.5 accent-[#B6FF4A] h-4 w-4 rounded-none bg-[#101510] border-[#273128] cursor-pointer"
                />
                <span>
                  I agree to the HUSTL{' '}
                  <span className="text-[#F4F7F1] underline">Terms of Service</span> and{' '}
                  <span className="text-[#F4F7F1] underline">Privacy Policy</span>.
                </span>
              </label>
              {errors.terms && <p className="text-xs text-red-400 font-mono mt-1">{errors.terms}</p>}
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
              Create Account
            </Button>
          </form>

          {/* Social Sign-in Note */}
          <div className="pt-4 border-t border-[#273128] space-y-3">
            <button
              type="button"
              onClick={() => {
                if (isSupabaseActive) {
                  // If real Supabase Google OAuth is enabled
                  alert('Supabase Google OAuth initiated.');
                } else {
                  setServerError('Google sign-in requires Supabase OAuth credentials configured in .env.');
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
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Login Link */}
          <div className="pt-2 text-center text-xs font-mono text-[#A0AAA0]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#B6FF4A] font-bold hover:underline">
              Log in
            </Link>
          </div>
        </Card>
      </div>
    </AuthLayout>
  );
};
