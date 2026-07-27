"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/v1/admin/login', {
        email,
        password
      });

      if (response.data.status) {
        const { token, ...user } = response.data.data;
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminUser', JSON.stringify(user));
        router.replace('/dashboard');
      } else {
        setError(response.data.message || 'Login failed.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'Could not connect to server. Ensure backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#EBF8FE] px-6 relative font-sans">
      {/* Light Neumorphic Login Card */}
      <div className="relative w-full max-w-md neu-card p-8 rounded-3xl space-y-6">
        
        {/* Header Branding with LM Logo */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full neu-card p-3 flex items-center justify-center mb-4 bg-[#EBF8FE]">
            <img src="/logo.png" alt="THE-LAWMEN'S" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">THE-LAWMEN'S</h2>
          <p className="text-xs font-semibold text-[#25AAE2] mt-1 uppercase tracking-wider">Administrative Console</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs font-bold text-red-700 text-center">
            {error}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email / Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Mail className="h-4 w-4 text-[#25AAE2]" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@yopmail.com"
                className="w-full neu-input py-3 pl-10 pr-4 text-sm text-slate-800 focus:outline-none focus:border-[#25AAE2]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Lock className="h-4 w-4 text-[#25AAE2]" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full neu-input py-3 pl-10 pr-12 text-sm text-slate-800 focus:outline-none focus:border-[#25AAE2]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="neu-btn w-full py-3.5 text-sm font-bold disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
