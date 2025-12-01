import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaArrowRight, FaUserNurse, FaUserInjured, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const Register = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const { error, success } = useNotification();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signup(formData.email, formData.password, role, formData.name);
      success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      error(err.message.replace('Firebase: ', ''));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex w-1/2 bg-primary relative overflow-hidden items-center justify-center">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary to-navy opacity-90 z-10"></div>
        <img src="/logo.png" alt="MedSense" className="absolute top-8 left-8 h-10 w-10 z-20 brightness-0 invert" />
        <div className="relative z-20 text-white p-12 max-w-xl">
          <h2 className="text-4xl font-heading font-bold mb-6">Join the MedSense Community</h2>
          <p className="text-blue-100 text-lg mb-8">
            Start your journey towards better health management. Track medications, connect with caregivers, and stay healthy.
          </p>
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
              <h3 className="font-bold text-xl mb-1">10k+</h3>
              <p className="text-sm text-blue-100">Active Users</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
              <h3 className="font-bold text-xl mb-1">98%</h3>
              <p className="text-sm text-blue-100">Adherence Rate</p>
            </div>
          </div>
        </div>
        {/* Decorative Circles */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary rounded-full blur-3xl opacity-20"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-20"></div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <img src="/logo.png" alt="MedSense" className="h-12 w-12 mx-auto lg:mx-0 mb-4 lg:hidden" />
            <h2 className="text-3xl font-heading font-bold text-navy">Create Account</h2>
            <p className="text-muted mt-2">Step {step} of 2: {step === 1 ? 'Choose your role' : 'Personal Details'}</p>
          </div>

          {step === 1 ? (
            <div className="space-y-4 animate-fade-in">
              <p className="text-navy font-medium mb-4">I am a...</p>
              <button 
                onClick={() => setRole('patient')}
                className={`w-full p-6 rounded-2xl border-2 flex items-center gap-4 transition-all ${role === 'patient' ? 'border-primary bg-blue-50' : 'border-gray-100 hover:border-blue-100'}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${role === 'patient' ? 'bg-primary text-white' : 'bg-blue-50 text-muted'}`}>
                  <FaUserInjured />
                </div>
                <div className="text-left">
                  <h3 className={`font-bold ${role === 'patient' ? 'text-primary' : 'text-navy'}`}>Patient</h3>
                  <p className="text-sm text-muted">I want to track my medications</p>
                </div>
              </button>

              <button 
                onClick={() => setRole('caregiver')}
                className={`w-full p-6 rounded-2xl border-2 flex items-center gap-4 transition-all ${role === 'caregiver' ? 'border-primary bg-blue-50' : 'border-gray-100 hover:border-blue-100'}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${role === 'caregiver' ? 'bg-primary text-white' : 'bg-blue-50 text-muted'}`}>
                  <FaUserNurse />
                </div>
                <div className="text-left">
                  <h3 className={`font-bold ${role === 'caregiver' ? 'text-primary' : 'text-navy'}`}>Caregiver</h3>
                  <p className="text-sm text-muted">I want to monitor a patient</p>
                </div>
              </button>

              <button 
                onClick={() => setStep(2)}
                className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-primary/30 mt-6 flex items-center justify-center gap-2"
              >
                Continue <FaArrowRight />
              </button>
            </div>
          ) : (
            <form className="space-y-5 animate-fade-in" onSubmit={handleRegister}>
              <div>
                <label className="block text-sm font-medium text-navy mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <FaUser />
                  </div>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-blue-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <FaEnvelope />
                  </div>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-blue-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                    placeholder="you@example.com"
                    required
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
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-blue-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted hover:text-primary transition-colors"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-navy border border-blue-100 hover:bg-blue-50 transition-colors"
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-[2] bg-primary text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-primary/30 text-center disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? <><FaSpinner className="animate-spin" /> Creating...</> : 'Create Account'}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-muted">
            Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};


export default Register;
