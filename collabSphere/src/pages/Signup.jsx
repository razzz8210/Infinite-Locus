import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, FileText, Users, Zap, Shield } from 'lucide-react';
import { useAuth, useToast } from '../context';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!name) newErrors.name = 'Name is required';
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = (field) =>
    `w-full pl-12 pr-4 py-3.5 bg-white/80 backdrop-blur-sm border ${
      errors[field] ? 'border-red-400' : 'border-gray-200'
    } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition-all duration-200 text-sm`;

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-20 xl:px-28 bg-gradient-to-br from-blue-50/60 via-white to-indigo-50/40 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-32 -left-32 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-72 h-72 bg-indigo-200/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 w-full max-w-md mx-auto py-10">
          {/* Logo */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200/60 shadow-sm mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-800">CollabSphere</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
              Create an account
            </h1>
            <p className="text-gray-500 mt-2 text-base">
              Sign up and start collaborating for free
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClasses('name')}
                />
              </div>
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClasses('email')}
                />
              </div>
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClasses('password')}
                />
              </div>
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClasses('confirmPassword')}
                />
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>

            {/* Terms */}
            <div className="text-sm">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-400 cursor-pointer"
                  required
                />
                <span className="text-gray-600">
                  I agree to the{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Privacy Policy</a>
                </span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200/50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed text-sm tracking-wide"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 mx-auto" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : 'Create Account'}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
            <span>
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                Sign in
              </Link>
            </span>
            <a href="#" className="hover:text-gray-700 transition-colors">Terms & Conditions</a>
          </div>
        </div>
      </div>

      {/* Right Side - Visual Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(30, 105, 191, 0.8),rgba(237, 205, 76, 0.79))' }}>
        {/* Animated background shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-32 left-20 w-48 h-48 bg-orange-300/20 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '6s' }} />
          <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-yellow-300/15 rounded-full blur-xl animate-pulse" style={{ animationDuration: '5s' }} />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px'
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
          {/* Collaboration illustration */}
          <div className="relative mb-12">
            <div className="w-28 h-28 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-2xl border border-white/30">
              <FileText className="w-14 h-14 text-white" />
            </div>
            <div className="absolute -top-6 -right-8 w-14 h-14 bg-white/25 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl border border-white/30 auth-float" style={{ animationDelay: '0s' }}>
              <Users className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -bottom-4 -left-10 w-12 h-12 bg-white/25 backdrop-blur-md rounded-xl flex items-center justify-center shadow-xl border border-white/30 auth-float" style={{ animationDelay: '1s' }}>
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="absolute top-1/2 -right-14 w-10 h-10 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center shadow-xl border border-white/30 auth-float" style={{ animationDelay: '2s' }}>
              <Shield className="w-5 h-5 text-white" />
            </div>
          </div>

          <h2 className="text-3xl font-bold mb-4 text-center">Start Building Together</h2>
          <p className="text-white/80 text-center max-w-sm text-lg leading-relaxed">
            Join thousands of teams already collaborating in real-time on CollabSphere.
          </p>

          {/* Feature cards */}
          <div className="mt-12 space-y-4 w-full max-w-sm">
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center gap-4 auth-slide-up shadow-lg" style={{ animationDelay: '0.2s' }}>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">Team Collaboration</p>
                <p className="text-white/70 text-xs mt-0.5">Work with your team in real time</p>
              </div>
            </div>
            
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center gap-4 auth-slide-up shadow-lg" style={{ animationDelay: '0.4s' }}>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">Instant Sync</p>
                <p className="text-white/70 text-xs mt-0.5">Changes sync across all devices instantly</p>
              </div>
            </div>

            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center gap-4 auth-slide-up shadow-lg" style={{ animationDelay: '0.6s' }}>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">Secure & Private</p>
                <p className="text-white/70 text-xs mt-0.5">Enterprise-grade security for your data</p>
              </div>
            </div>
          </div>

          {/* User avatars */}
          
        </div>
      </div>
    </div>
  );
};

export default Signup;
