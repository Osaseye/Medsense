import { Link } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { useNotification } from '../context/NotificationContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const { success, error } = useNotification();

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      success('Password reset email sent! Check your inbox.');
    } catch (err) {
      console.error(err);
      error('Failed to send reset email. Please check the address.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-blue-50 w-full max-w-md text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-primary text-2xl mx-auto mb-6">
          <FaEnvelope />
        </div>
        
        <h2 className="text-2xl font-heading font-bold text-navy mb-2">Forgot Password?</h2>
        <p className="text-muted mb-8">No worries! Enter your email address and we'll send you a link to reset your password.</p>
        
        <form className="space-y-6 text-left" onSubmit={handleReset}>
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-blue-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
              placeholder="you@example.com"
              required
            />
          </div>
          
          <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-primary/30">
            Send Reset Link
          </button>
        </form>
        
        <div className="mt-8">
          <Link to="/login" className="inline-flex items-center gap-2 text-muted hover:text-primary font-medium transition-colors">
            <FaArrowLeft className="text-sm" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
