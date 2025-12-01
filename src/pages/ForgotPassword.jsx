import { Link } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';

const ForgotPassword = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-blue-50 w-full max-w-md text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-primary text-2xl mx-auto mb-6">
          <FaEnvelope />
        </div>
        
        <h2 className="text-2xl font-heading font-bold text-navy mb-2">Forgot Password?</h2>
        <p className="text-muted mb-8">No worries! Enter your email address and we'll send you a link to reset your password.</p>
        
        <form className="space-y-6 text-left">
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Email Address</label>
            <input 
              type="email" 
              className="w-full px-4 py-3 rounded-xl border border-blue-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
              placeholder="you@example.com"
            />
          </div>
          
          <button className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-primary/30">
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
