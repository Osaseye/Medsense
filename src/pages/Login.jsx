import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaGoogle, FaApple, FaUserInjured, FaUserNurse } from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('patient');

  const handleLogin = (e) => {
    e.preventDefault();
    localStorage.setItem('userRole', role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex w-1/2 bg-navy relative overflow-hidden items-center justify-center">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-navy to-primary opacity-90 z-10"></div>
        <img src="/logo.png" alt="MedSense" className="absolute top-8 left-8 h-10 w-10 z-20 brightness-0 invert" />
        <div className="relative z-20 text-white p-12 max-w-xl">
          <h2 className="text-4xl font-heading font-bold mb-6">Welcome Back!</h2>
          <p className="text-blue-100 text-lg">
            Your health journey continues here. Log in to access your dashboard, reminders, and caregiver updates.
          </p>
        </div>
        {/* Decorative Circles */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary rounded-full blur-3xl opacity-20"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-secondary rounded-full blur-3xl opacity-20"></div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <img src="/logo.png" alt="MedSense" className="h-12 w-12 mx-auto lg:mx-0 mb-4 lg:hidden" />
            <h2 className="text-3xl font-heading font-bold text-navy">Log In</h2>
            <p className="text-muted mt-2">Please enter your details to continue.</p>
          </div>
          
          <form className="space-y-5" onSubmit={handleLogin}>
            {/* Role Selector */}
            <div className="flex p-1 bg-blue-50 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setRole('patient')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  role === 'patient' ? 'bg-white text-primary shadow-sm' : 'text-muted hover:text-navy'
                }`}
              >
                <FaUserInjured /> Patient
              </button>
              <button
                type="button"
                onClick={() => setRole('caregiver')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  role === 'caregiver' ? 'bg-white text-primary shadow-sm' : 'text-muted hover:text-navy'
                }`}
              >
                <FaUserNurse /> Caregiver
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <FaEnvelope />
                </div>
                <input 
                  type="email" 
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-blue-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <FaLock />
                </div>
                <input 
                  type="password" 
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-blue-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded text-primary focus:ring-primary border-gray-300" />
                <span className="text-muted">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-primary font-bold hover:underline">Forgot Password?</Link>
            </div>
            
            <button type="submit" className="block w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-primary/30 text-center">
              Sign In
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-blue-100"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 px-4 py-3 border border-blue-100 rounded-xl hover:bg-blue-50 transition-colors font-medium text-navy bg-white">
              <FaGoogle className="text-red-500" /> Google
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 border border-blue-100 rounded-xl hover:bg-blue-50 transition-colors font-medium text-navy bg-white">
              <FaApple className="text-black" /> Apple
            </button>
          </div>
          
          <p className="text-center text-sm text-muted">
            Don't have an account? <Link to="/register" className="text-primary font-bold hover:underline">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
