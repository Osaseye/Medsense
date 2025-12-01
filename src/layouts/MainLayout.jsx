import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaPills, FaBell, FaChartLine, FaFilePrescription, FaUserNurse, FaCog, FaSignOutAlt, FaBars, FaTimes, FaUserInjured } from 'react-icons/fa';
import { useState, useEffect } from 'react';

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [role, setRole] = useState('patient');

  useEffect(() => {
    const savedRole = localStorage.getItem('userRole');
    if (savedRole) {
      setRole(savedRole);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
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
      {/* Header (Visible on all screens) */}
      <div className="fixed top-0 left-0 right-0 bg-white z-30 px-6 py-4 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-navy text-2xl p-2 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <FaBars />
          </button>
          <h1 className="text-xl font-heading font-bold text-primary flex items-center gap-2">
            <img src="/logo.png" alt="MedSense" className="h-8 w-8" /> MedSense
          </h1>
        </div>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-navy/50 z-40 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Fixed Drawer) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-blue-50 flex justify-between items-center">
          <h1 className="text-2xl font-heading font-bold text-primary flex items-center gap-3">
            <img src="/logo.png" alt="MedSense" className="h-8 w-8" /> MedSense
          </h1>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="text-muted hover:text-primary transition-colors"
          >
            <FaTimes size={24} />
          </button>
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
              <NavItem to="/dashboard/caregiver" icon={<FaUserNurse />} label="Caregiver Access" />
            </>
          )}

          {role === 'caregiver' && (
            <>
              {/* Caregiver specific links can go here */}
              {/* For now, they just see Dashboard and Settings */}
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
              {role === 'patient' ? 'JD' : 'CN'}
            </div>
            <div>
              <p className="text-sm font-bold text-navy">{role === 'patient' ? 'John Doe' : 'Caregiver Nurse'}</p>
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
      <main className="flex-1 overflow-y-auto bg-background w-full pt-20">
        <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
