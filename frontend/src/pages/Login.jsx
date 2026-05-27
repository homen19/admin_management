import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, User, AlertCircle } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(153,27,27,0.22),rgba(11,19,32,0.85))] font-sans relative overflow-hidden">
      {/* Decorative blurred circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-900/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-md p-8 bg-[#0B1320]/80 backdrop-blur-xl border border-slate-800/40 rounded-3xl shadow-2xl ring-1 ring-amber-500/15 shadow-amber-500/5 animate-fade-in">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-primary-900 text-amber-400 p-3 rounded-2xl shadow-lg font-bold text-2xl font-academic mb-4 border border-amber-500/25">
            IIT
          </div>
          <h2 className="text-2xl font-bold text-white font-academic tracking-wide">IIT Admin Portal</h2>
          <p className="text-slate-300 text-sm mt-1 font-outfit">Office & Operations Management System</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-900/50 text-rose-200 text-sm flex items-start gap-3">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                <User size={18} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-800/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/40 transition-all font-outfit"
                placeholder="Enter username"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Password</label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3 bg-slate-950/60 border border-slate-800/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/40 transition-all font-outfit"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-primary-800 hover:bg-primary-750 text-white rounded-xl font-academic font-bold border border-amber-500/20 shadow-lg shadow-primary-950/50 hover:shadow-amber-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Demo Credentials Footer */}
        <div className="mt-8 pt-6 border-t border-slate-800/60 text-center">
          <p className="text-xs text-slate-400">Demo Usernames (Password: <code className="bg-slate-950 text-slate-300 px-1 py-0.5 rounded">password</code>)</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2 text-[10px] text-slate-300 font-outfit">
            <span className="bg-slate-950/50 px-2 py-1 rounded border border-slate-800/40"><b className="text-purple-300">Admin:</b> admin</span>
            <span className="bg-slate-950/50 px-2 py-1 rounded border border-slate-800/40"><b className="text-blue-300">Staff:</b> staff_rahul</span>
            <span className="bg-slate-950/50 px-2 py-1 rounded border border-slate-800/40"><b className="text-emerald-300">Faculty:</b> prof_sharma</span>
            <span className="bg-slate-950/50 px-2 py-1 rounded border border-slate-800/40"><b className="text-amber-300">Student:</b> stud_amit</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
