import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/auth';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(email, name, password);
      navigate('/dashboard');
    } catch (err) {
      setError((err as Error).message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Create your account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md px-3 py-2">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input
            className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-indigo-500 hover:bg-indigo-400 disabled:opacity-60 text-sm font-semibold py-2"
        >
          {loading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>
      <p className="text-sm text-slate-400 mt-4">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-300 hover:text-indigo-200">
          Login
        </Link>
      </p>
    </div>
  );
};

export default SignupPage;

