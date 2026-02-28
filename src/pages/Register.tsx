import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Register() {
  const [searchParams] = useSearchParams();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [discord, setDiscord] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [referralValid, setReferralValid] = useState<boolean | null>(null);
  const [referralChecking, setReferralChecking] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const ref = (searchParams.get('ref') || searchParams.get('referral') || '').trim();
    if (ref) {
      setReferralCode(ref.toUpperCase());
    }
  }, []);

  useEffect(() => {
    let timer: any;
    const code = referralCode.trim().toUpperCase();
    if (!code) {
      setReferralValid(null);
      return;
    }
    if (!/^[A-Z0-9]{6,12}$/.test(code)) {
      setReferralValid(false);
      return;
    }
    setReferralChecking(true);
    timer = setTimeout(async () => {
      try {
        const r = await api.get(`/referral/validate?code=${encodeURIComponent(code)}`);
        setReferralValid(!!r?.valid);
      } catch (e: any) {
        const msg = String(e?.message || '');
        if (/not\s*found|404|cannot connect|temporarily unavailable/i.test(msg)) {
          setReferralValid(null); // backend unavailable — defer to server on submit
        } else {
          setReferralValid(false); // explicit invalid
        }
      } finally {
        setReferralChecking(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [referralCode]);

  const validateForm = () => {
    if (!username.trim()) {
      setError('Username is required');
      return false;
    }
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return false;
    }
    if (!password) {
      setError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!discord.trim()) {
      setError('Discord username is required');
      return false;
    }
    if (!/^[a-zA-Z0-9._]{2,32}$/.test(discord.trim())) {
      setError('Enter your Discord username (no spaces; letters, numbers, . or _)');
      return false;
    }
    if (referralCode.trim()) {
      const code = referralCode.trim().toUpperCase();
      if (!/^[A-Z0-9]{6,12}$/.test(code)) {
        setError('Referral code must be 6–12 alphanumeric characters');
        return false;
      }
      if (referralValid === false) {
        setError('Invalid referral code');
        return false;
      }
      if (referralChecking) {
        setError('Validating referral code… Please wait');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const code = referralCode.trim() ? referralCode.trim().toUpperCase() : undefined;
      const data = await api.post('/auth/register', { username, email, password, referralCode: code, discord: discord.trim() });
      login(data.token, data.user);
      setSuccess('Account created successfully. Redirecting...');
      setTimeout(() => navigate('/'), 2000);
    } catch (err: any) {
      console.error('Registration error:', err);
      const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
      const msg = String(err?.message || '');
      if (msg.toLowerCase().includes('connect') || msg.toLowerCase().includes('temporarily unavailable')) {
        setError(isLocal ? 'Cannot connect to backend. Is the server running on port 5000?' : 'Service temporarily unavailable. Please try again shortly.');
      } else if (/username|email/i.test(msg)) {
        setError(msg);
      } else if (msg) {
        setError(msg);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-stretch">
        <div className="hidden md:flex flex-col justify-center p-10 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent">
          <div className="text-5xl font-extrabold hero-title mb-4">IMPERIUMX</div>
          <div className="text-gray-300 mb-6">Premium Gaming Accounts Marketplace</div>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>• Secure warranty on all accounts</li>
            <li>• Average delivery under 15 minutes</li>
            <li>• Earn points and referral commission</li>
          </ul>
        </div>
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-8 w-full border border-white/20 shadow-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-gray-400">Join ImperiumX today</p>
        </div>

        <div className="relative rounded-2xl p-6 mb-6 border border-amber-400/25 bg-gradient-to-br from-amber-500/10 to-white/5 shadow-[0_10px_40px_-15px_rgba(212,175,55,0.35)]">
          <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)' }} />
          <div className="flex items-center justify-between mb-5">
            <div className="text-2xl font-extrabold tracking-wide">Grand Reopening Privileges</div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30">
              Invitation Only
            </span>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="p-5 rounded-xl bg-white/5 border border-white/10">
              <div className="text-sm uppercase tracking-widest text-amber-300 mb-2">Founders’ Bonus</div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-400">Phase I</div>
                    <div className="text-lg font-semibold">First 50 accounts</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-extrabold">$10</div>
                    <div className="text-xs text-gray-400">1,000 points</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-400">Phase II</div>
                    <div className="text-lg font-semibold">Next 200 accounts</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-extrabold">$5</div>
                    <div className="text-xs text-gray-400">500 points</div>
                  </div>
                </div>
                <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden" aria-label="Points conversion">
                  <div className="h-2 bg-amber-400/70 w-full" />
                </div>
                <div className="text-xs text-gray-400">Conversion: 100 points = $1</div>
              </div>
            </div>
            <div className="p-5 rounded-xl bg-white/5 border border-white/10">
              <div className="text-sm uppercase tracking-widest text-amber-300 mb-2">Referral Privileges</div>
              <div className="space-y-2 text-gray-300">
                <div className="font-semibold">Private referral earnings</div>
                <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                  <li>Earn up to 35% on qualified guest purchases</li>
                  <li>Receive 500 points for each successful guest</li>
                  <li>Personal referral code and earnings overview in Profile</li>
                </ul>
              </div>
              <div className="mt-3 text-xs text-gray-400">Privileges extend to members in good standing. Terms apply.</div>
            </div>
          </div>
          <div className="mt-5 text-sm text-gray-300">
            Join ImperiumX and enjoy a welcome credit worth <span className="font-bold">$10 (1,000 points)</span> during Phase I or <span className="font-bold">$5 (500 points)</span> during Phase II, extended with our compliments to new members.
          </div>
        </div>



        {success && (
          <div className="bg-green-500/20 border-2 border-green-500 text-green-500 p-4 rounded-xl mb-6 text-center">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border-2 border-red-500 text-red-500 p-4 rounded-xl mb-6 text-center whitespace-pre-line">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
            required
            autoComplete="username"
          />
          <Input
            label="Discord Username (not nickname)"
            type="text"
            value={discord}
            onChange={(e) => setDiscord(e.target.value)}
            placeholder="e.g., gamer.pro or cool_name"
            required
            autoComplete="off"
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            autoComplete="email"
          />

          <div>
            <label className="block text-gray-300 mb-2 font-semibold">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl focus:outline-none focus:border-red-500 text-white transition-all pr-12"
                placeholder="Create a password"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <Input
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
            autoComplete="new-password"
          />

          <Input
            label="Referral Code (optional)"
            type="text"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
            placeholder="Referral code (6–12 chars, e.g., AB12CD34)"
            maxLength={12}
            autoComplete="off"
          />
          {referralCode && (
            <div className="text-xs mt-1">
              {referralChecking && <span className="text-gray-400">Checking code…</span>}
              {!referralChecking && referralValid === true && <span className="text-green-500">Code is valid</span>}
              {!referralChecking && referralValid === false && <span className="text-red-500">Invalid code</span>}
              {!referralChecking && referralValid === null && <span className="text-amber-400">Couldn’t verify now — will validate on submit</span>}
            </div>
          )}

          <Button type="submit" disabled={loading} full size="lg">
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-red-500 hover:underline font-semibold">
            Login Here
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
}
