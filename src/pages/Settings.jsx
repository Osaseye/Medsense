import { FaUser, FaBell, FaCog, FaLock, FaSignOutAlt, FaChevronRight, FaUserNurse } from 'react-icons/fa';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Modal from '../components/Modal';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { info, success, error } = useNotification();
  const { currentUser, logout, userRole } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const navigate = useNavigate();
  // Initialize state directly from currentUser if available
  const [profileData, setProfileData] = useState({
    displayName: currentUser?.displayName || '',
    phoneNumber: currentUser?.phoneNumber || ''
  });

  // Update local state when currentUser changes (e.g. after a refresh)
  useEffect(() => {
    if (currentUser) {
       setProfileData(prev => {
         if (prev.displayName !== (currentUser.displayName || '') || prev.phoneNumber !== (currentUser.phoneNumber || '')) {
           return {
             displayName: currentUser.displayName || '',
             phoneNumber: currentUser.phoneNumber || ''
           };
         }
         return prev;
       });
    }
  }, [currentUser?.displayName, currentUser?.phoneNumber]);

  const handleSignOut = async () => {
    try {
      await logout();
      success('Signed out successfully');
    } catch (err) {
      console.error(err);
      error('Failed to sign out');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      // Update Firestore user document
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        name: profileData.displayName,
        phone: profileData.phoneNumber
      });
      
      success('Profile updated successfully');
      setIsProfileModalOpen(false);
    } catch (err) {
      console.error(err);
      error('Failed to update profile');
    }
  };

  const handleNavigate = (section) => {
    if (section === 'Profile' || section === 'Personal Information') {
      setIsProfileModalOpen(true);
    } else {
      info(`Opening ${section} settings...`);
    }
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
            {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : (currentUser?.email?.charAt(0).toUpperCase() || 'U')}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-navy">{currentUser?.displayName || 'User'}</h2>
            <p className="text-muted">{currentUser?.email}</p>
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

          {userRole === 'patient' && (
            <div 
              onClick={() => navigate('/dashboard/caregiver')}
              className="flex items-center justify-between p-4 hover:bg-blue-50/50 rounded-xl transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-primary group-hover:bg-white group-hover:shadow-sm transition-all">
                  <FaUserNurse />
                </div>
                <div>
                  <p className="font-bold text-navy">Caregiver Access</p>
                  <p className="text-sm text-muted">Manage caregiver permissions</p>
                </div>
              </div>
              <FaChevronRight className="text-gray-300 group-hover:text-primary transition-colors" />
            </div>
          )}

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

      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="Edit Profile"
      >
        <form className="space-y-4" onSubmit={handleUpdateProfile}>
          <div>
            <label className="block text-sm font-bold text-navy mb-1">Display Name</label>
            <input 
              type="text" 
              value={profileData.displayName}
              onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
              className="w-full p-3 rounded-xl border border-blue-100 focus:border-primary outline-none" 
              placeholder="John Doe" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-navy mb-1">Phone Number</label>
            <input 
              type="tel" 
              value={profileData.phoneNumber}
              onChange={(e) => setProfileData({...profileData, phoneNumber: e.target.value})}
              className="w-full p-3 rounded-xl border border-blue-100 focus:border-primary outline-none" 
              placeholder="+1 234 567 8900" 
            />
          </div>
          <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors">
            Save Changes
          </button>
        </form>
      </Modal>
    </div>
  );
};
export default Settings;
