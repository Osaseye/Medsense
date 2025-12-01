import { FaUser, FaBell, FaCog, FaLock, FaSignOutAlt, FaChevronRight } from 'react-icons/fa';
import { useNotification } from '../context/NotificationContext';

const Settings = () => {
  const { info, success } = useNotification();

  const handleSignOut = () => {
    success('Signed out successfully');
  };

  const handleNavigate = (section) => {
    info(`Opening ${section} settings...`);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-navy">Settings</h1>
        <p className="text-muted text-lg">Manage your account preferences and configurations.</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-blue-50">
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 text-center sm:text-left">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-primary text-3xl font-bold border-4 border-white shadow-sm">
            JD
          </div>
          <div>
            <h2 className="text-2xl font-bold text-navy">John Doe</h2>
            <p className="text-muted">john.doe@example.com</p>
            <button 
              onClick={() => handleNavigate('Profile')}
              className="text-primary font-bold text-sm mt-1 hover:underline"
            >
              Edit Profile
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div 
            onClick={() => handleNavigate('Personal Information')}
            className="flex items-center justify-between p-4 hover:bg-blue-50/50 rounded-xl transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-primary group-hover:bg-white group-hover:shadow-sm transition-all">
                <FaUser />
              </div>
              <div>
                <p className="font-bold text-navy">Personal Information</p>
                <p className="text-sm text-muted">Update your name and contact details</p>
              </div>
            </div>
            <FaChevronRight className="text-gray-300 group-hover:text-primary transition-colors" />
          </div>

          <div 
            onClick={() => handleNavigate('Notifications')}
            className="flex items-center justify-between p-4 hover:bg-blue-50/50 rounded-xl transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-primary group-hover:bg-white group-hover:shadow-sm transition-all">
                <FaBell />
              </div>
              <div>
                <p className="font-bold text-navy">Notifications</p>
                <p className="text-sm text-muted">Manage email and push alerts</p>
              </div>
            </div>
            <FaChevronRight className="text-gray-300 group-hover:text-primary transition-colors" />
          </div>

          <div 
            onClick={() => handleNavigate('App Preferences')}
            className="flex items-center justify-between p-4 hover:bg-blue-50/50 rounded-xl transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-primary group-hover:bg-white group-hover:shadow-sm transition-all">
                <FaCog />
              </div>
              <div>
                <p className="font-bold text-navy">App Preferences</p>
                <p className="text-sm text-muted">Timezone, Language, and Display</p>
              </div>
            </div>
            <FaChevronRight className="text-gray-300 group-hover:text-primary transition-colors" />
          </div>

          <div 
            onClick={() => handleNavigate('Security')}
            className="flex items-center justify-between p-4 hover:bg-blue-50/50 rounded-xl transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-primary group-hover:bg-white group-hover:shadow-sm transition-all">
                <FaLock />
              </div>
              <div>
                <p className="font-bold text-navy">Security</p>
                <p className="text-sm text-muted">Change password and 2FA</p>
              </div>
            </div>
            <FaChevronRight className="text-gray-300 group-hover:text-primary transition-colors" />
          </div>
        </div>
      </div>

      {/* Sign Out */}
      <button 
        onClick={handleSignOut}
        className="w-full p-4 rounded-xl border border-red-100 text-error font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
      >
        <FaSignOutAlt /> Sign Out
      </button>
    </div>
  );
};
export default Settings;
