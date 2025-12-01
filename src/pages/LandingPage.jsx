import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaHeartbeat, FaUserNurse, FaBell, FaChartLine, FaLock, FaCheck, FaClock, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import ctaBg from '../assets/cta-bg.jpg';

const LandingPage = () => {
  const [heroState, setHeroState] = useState('due'); // due, taken, snoozed

  const handleTake = () => setHeroState('taken');
  const handleSnooze = () => setHeroState('snoozed');

  return (
    <div className="min-h-screen bg-background font-sans text-navy overflow-x-hidden">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4 relative z-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="MedSense Logo" className="h-10 w-10" />
            <span className="text-2xl font-heading font-bold text-primary">MedSense</span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-navy hover:text-primary font-medium transition-colors">Features</a>
            <a href="#how-it-works" className="text-navy hover:text-primary font-medium transition-colors">How it Works</a>
            <Link to="/login" className="font-medium text-navy hover:text-primary transition-colors">Log In</Link>
            <Link to="/login" className="bg-primary text-white px-6 py-2 rounded-full font-medium hover:bg-blue-600 transition-colors shadow-lg shadow-primary/30">
              Get Started
            </Link>
          </div>

          {/* Mobile Join Button (Replaces Hamburger) */}
          <Link to="/login" className="md:hidden bg-primary text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-blue-600 transition-colors shadow-lg shadow-primary/30">
            Join Now
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="container mx-auto px-6 py-12 md:py-24 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6 text-center md:text-left z-10 order-1 md:order-1">
          <div className="inline-block px-4 py-1 bg-blue-50 text-primary rounded-full text-sm font-semibold tracking-wide animate-fade-in-up">
            HEALTHCARE REIMAGINED
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-bold leading-tight text-navy animate-fade-in-up delay-100">
            Never Miss a Dose <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Ever Again.
            </span>
          </h1>
          <p className="text-lg text-muted md:max-w-lg mx-auto md:mx-0 animate-fade-in-up delay-200">
            The smart medication reminder system that keeps you on track, connects you with caregivers, and secures your health history.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start animate-fade-in-up delay-300">
            <Link to="/login" className="bg-primary text-white px-8 py-3.5 rounded-full font-bold text-lg hover:bg-blue-600 transition-all shadow-xl shadow-primary/30 hover:-translate-y-1">
              Start Your Journey
            </Link>
            <button className="px-8 py-3.5 rounded-full font-bold text-lg text-navy border-2 border-blue-100 hover:border-primary hover:text-primary transition-all">
              How It Works
            </button>
          </div>
        </div>
        
        <div className="flex-1 relative w-full flex justify-center order-2 md:order-2">
          {/* Background Blobs */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
          
          {/* Interactive Card Container */}
          <div className="relative z-10 w-full max-w-md">
            {/* Main Card */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl border border-blue-50 transform transition-all duration-500 hover:scale-[1.02] hover:shadow-blue-200/50">
              {heroState === 'due' && (
                <div className="animate-fade-in">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-primary text-2xl">
                        <FaBell />
                      </div>
                      <div>
                        <p className="font-heading font-bold text-xl text-navy">Amoxicillin</p>
                        <p className="text-muted">500mg • With food</p>
                      </div>
                    </div>
                    <span className="bg-blue-50 text-primary px-3 py-1 rounded-full text-xs font-bold">NOW</span>
                  </div>
                  
                  <div className="space-y-3 mb-8">
                    <div className="h-2 bg-blue-50 rounded-full w-full overflow-hidden">
                      <div className="h-full w-2/3 bg-primary rounded-full"></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted font-medium">
                      <span>Progress</span>
                      <span>66%</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={handleTake} className="bg-success text-white py-3 rounded-xl font-bold text-sm hover:bg-green-600 transition-colors shadow-lg shadow-success/20">
                      Take Now
                    </button>
                    <button onClick={handleSnooze} className="bg-blue-50 text-muted py-3 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors">
                      Snooze
                    </button>
                  </div>
                </div>
              )}

              {heroState === 'taken' && (
                <div className="text-center py-8 animate-fade-in">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-success text-4xl mx-auto mb-6">
                    <FaCheck />
                  </div>
                  <h3 className="text-2xl font-bold text-navy mb-2">Great Job!</h3>
                  <p className="text-muted mb-6">You've taken your medication on time.</p>
                  <button onClick={() => setHeroState('due')} className="text-primary font-bold hover:underline">
                    Undo
                  </button>
                </div>
              )}

              {heroState === 'snoozed' && (
                <div className="text-center py-8 animate-fade-in">
                  <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 text-4xl mx-auto mb-6">
                    <FaClock />
                  </div>
                  <h3 className="text-2xl font-bold text-navy mb-2">Snoozed</h3>
                  <p className="text-muted mb-6">We'll remind you again in 15 minutes.</p>
                  <button onClick={() => setHeroState('due')} className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-600 transition-colors">
                    Take Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-navy mb-4">Complete Health Management</h2>
            <p className="text-muted text-lg">More than just reminders. MedSense is a complete ecosystem for your medication adherence and health records.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<FaBell />} 
              title="Smart Reminders" 
              desc="Automated notifications via push, SMS, or email ensuring you never miss a dose."
            />
            <FeatureCard 
              icon={<FaChartLine />} 
              title="Adherence Tracking" 
              desc="Visualize your progress with detailed reports and insights to keep you motivated."
            />
            <FeatureCard 
              icon={<FaUserNurse />} 
              title="Caregiver Connect" 
              desc="Keep loved ones in the loop with real-time alerts and adherence sharing."
            />
            <FeatureCard 
              icon={<FaLock />} 
              title="Secure Vault" 
              desc="Bank-grade encryption for your prescription history and medical data."
            />
            <FeatureCard 
              icon={<FaShieldAlt />} 
              title="HIPAA Compliant" 
              desc="Built with strict healthcare regulations to ensure your privacy is protected."
            />
            <FeatureCard 
              icon={<FaHeartbeat />} 
              title="Health Insights" 
              desc="Track patterns and improve your health outcomes with data-driven suggestions."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-navy text-white relative overflow-hidden bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `linear-gradient(rgba(10, 25, 47, 0.85), rgba(10, 25, 47, 0.95)), url(${ctaBg})` }}>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">Ready to take control?</h2>
          <p className="text-blue-100 mb-10 max-w-xl mx-auto text-lg">Join thousands of users who trust MedSense for their daily medication management.</p>
          <Link to="/login" className="inline-block bg-secondary text-navy px-10 py-4 rounded-full font-bold text-lg hover:bg-teal-400 transition-all shadow-lg hover:shadow-teal-400/30 hover:-translate-y-1">
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white pt-16 pb-8 border-t border-blue-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <img src="/logo.png" alt="MedSense Logo" className="h-8 w-8" />
                <span className="text-xl font-heading font-bold text-navy">MedSense</span>
              </div>
              <p className="text-muted text-sm leading-relaxed mb-6">
                Empowering patients and caregivers with smart tools for better health outcomes.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"><FaFacebook /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"><FaTwitter /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"><FaInstagram /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"><FaLinkedin /></a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-navy mb-6">Product</h4>
              <ul className="space-y-4 text-sm text-muted">
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">For Caregivers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-navy mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-muted">
                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-navy mb-6">Legal</h4>
              <ul className="space-y-4 text-sm text-muted">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">HIPAA Compliance</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-blue-50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted text-sm">© 2025 MedSense. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-muted">
              <span>Made with ❤️ for better health</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="p-8 rounded-3xl bg-white border border-blue-50 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 hover:-translate-y-1 group text-center">
    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-primary flex items-center justify-center text-2xl mb-6 mx-auto group-hover:bg-primary group-hover:text-white transition-colors">
      {icon}
    </div>
    <h3 className="text-xl font-heading font-bold text-navy mb-3">{title}</h3>
    <p className="text-muted leading-relaxed">{desc}</p>
  </div>
);

export default LandingPage;
