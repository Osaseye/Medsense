import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaPills, FaBell, FaChartLine, FaFilePrescription, FaUserNurse, FaCog, FaSignOutAlt, FaBars, FaTimes, FaUserInjured } from 'react-icons/fa';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { userRole, logout, currentUser, userData } = useAuth();
  
  const role = userRole || 'patient';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-navy hover:bg-blue-50';
  };

  const NavItem = ({ to, icon, label }) => (
    <Link 
      to={to} 
      onClick={() => setIsSidebarOpen(false)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive(to)}`}
    >
      <span className="text-lg">{icon}</span>
      {label}
    </Link>
  );

  return (
    <div className="flex h-screen bg-background font-sans text-navy overflow-hidden">
      {/* Header (Mobile Only) */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white z-30 px-6 py-4 shadow-sm flex justify-between items-center">
        <h1 className="text-xl font-heading font-bold text-primary flex items-center gap-2">
          <img src="/logo.png" alt="MedSense" className="h-8 w-8" /> MedSense
        </h1>
        <div className="flex items-center gap-4">
          <Link to="/dashboard/settings" className="text-navy text-xl p-2 hover:bg-blue-50 rounded-full transition-colors">
            <FaCog />
          </Link>
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
            {userData?.name ? userData.name.charAt(0).toUpperCase() : (role === 'patient' ? 'P' : 'C')}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation (Floating Cylinder) */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-white shadow-2xl rounded-full px-6 py-3 flex items-center gap-6 border border-blue-50">
          <Link to="/dashboard" className={`text-2xl p-2 transition-colors ${location.pathname === '/dashboard' ? 'text-primary' : 'text-gray-400'}`}>
            <FaHome />
          </Link>
          
          {role === 'patient' ? (
            <>
              <Link to="/dashboard/medications" className={`text-2xl p-2 transition-colors ${location.pathname === '/dashboard/medications' ? 'text-primary' : 'text-gray-400'}`}>
                <FaPills />
              </Link>
              <Link to="/dashboard/reminders" className={`text-2xl p-2 transition-colors ${location.pathname === '/dashboard/reminders' ? 'text-primary' : 'text-gray-400'}`}>
                <FaBell />
              </Link>
              <Link to="/dashboard/adherence" className={`text-2xl p-2 transition-colors ${location.pathname === '/dashboard/adherence' ? 'text-primary' : 'text-gray-400'}`}>
                <FaChartLine />
              </Link>
              <Link to="/dashboard/prescriptions" className={`text-2xl p-2 transition-colors ${location.pathname === '/dashboard/prescriptions' ? 'text-primary' : 'text-gray-400'}`}>
                <FaFilePrescription />
              </Link>
            </>
          ) : (
            <>
              {/* Caregiver Mobile Nav Items */}
              <Link to="/dashboard/patients" className={`text-2xl p-2 transition-colors ${location.pathname === '/dashboard/patients' ? 'text-primary' : 'text-gray-400'}`}>
                <FaUserInjured />
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Sidebar (Desktop Only) */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl flex-col">
        <div className="p-6 border-b border-blue-50 flex justify-between items-center">
          <h1 className="text-2xl font-heading font-bold text-primary flex items-center gap-3">
            <img src="/logo.png" alt="MedSense" className="h-8 w-8" /> MedSense
          </h1>
        </div>
        
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          <p className="text-xs font-bold text-muted uppercase tracking-wider mb-4 px-4">Menu</p>
          <NavItem to="/dashboard" icon={<FaHome />} label="Dashboard" />
          
          {role === 'patient' && (
            <>
              <NavItem to="/dashboard/medications" icon={<FaPills />} label="Medications" />
              <NavItem to="/dashboard/reminders" icon={<FaBell />} label="Reminders" />
              <NavItem to="/dashboard/adherence" icon={<FaChartLine />} label="Adherence" />
              <NavItem to="/dashboard/prescriptions" icon={<FaFilePrescription />} label="Prescriptions" />
            </>
          )}

          {role === 'caregiver' && (
            <>
              {/* Caregiver specific links can go here */}
            </>
          )}
          
          <div className="pt-6 mt-6 border-t border-blue-50">
            <p className="text-xs font-bold text-muted uppercase tracking-wider mb-4 px-4">Account</p>
            <NavItem to="/dashboard/settings" icon={<FaCog />} label="Settings" />
          </div>
        </nav>
        
        <div className="p-6 border-t border-blue-50 bg-blue-50/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
              {userData?.name ? userData.name.charAt(0).toUpperCase() : (role === 'patient' ? 'P' : 'C')}
            </div>
            <div>
              <p className="text-sm font-bold text-navy">{userData?.name || (role === 'patient' ? 'Patient' : 'Caregiver')}</p>
              <p className="text-xs text-muted capitalize">{role} Account</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-error text-sm font-medium hover:bg-red-50 py-2 rounded-lg transition-colors"
          >
            <FaSignOutAlt /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background w-full pt-20 md:pt-8 md:pl-72">
        <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
