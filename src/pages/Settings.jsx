import { FaUser, FaBell, FaCog, FaLock, FaSignOutAlt, FaChevronRight, FaUserNurse, FaCheckCircle, FaTimesCircle, FaDownload, FaApple, FaAndroid, FaMobileAlt, FaShareAlt } from 'react-icons/fa';
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
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deviceType, setDeviceType] = useState('unknown');
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

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Detect device type and PWA installation status
  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
    }

    // Detect device type
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isMobile = /mobile/.test(userAgent) || isIOS || isAndroid;

    if (isIOS) {
      setDeviceType('ios');
    } else if (isAndroid) {
      setDeviceType('android');
    } else if (isMobile) {
      setDeviceType('mobile');
    } else {
      setDeviceType('desktop');
    }

    // Listen for beforeinstallprompt event (Android/Desktop)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

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
    } else if (section === 'Notifications') {
      setIsNotificationsModalOpen(true);
    } else {
      info(`Opening ${section} settings...`);
    }
  };

  const handleRequestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      error('This browser does not support notifications');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        success('Notifications enabled! You will receive medication reminders.');
        
        // Send a test notification using the proper method
        try {
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification('MedSense Notifications Enabled', {
              body: 'You will now receive medication reminders.',
              icon: '/logo.png',
              badge: '/logo.png',
              tag: 'test-notification',
              vibrate: [200, 100, 200]
            });
          } else {
            new Notification('MedSense Notifications Enabled', {
              body: 'You will now receive medication reminders.',
              icon: '/logo.png',
              badge: '/logo.png',
              vibrate: [200, 100, 200]
            });
          }
        } catch (err) {
          console.error('Test notification error:', err);
        }
      } else if (permission === 'denied') {
        error('Notifications blocked. Please enable them in your browser settings.');
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      error('Failed to request notification permission');
    }
  };

  const handleInstallClick = () => {
    setIsInstallModalOpen(true);
  };

  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      success('App is being installed!');
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setIsInstallModalOpen(false);
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

          {!isInstalled && (
            <div 
              onClick={handleInstallClick}
              className="flex items-center justify-between p-4 hover:bg-blue-50/50 rounded-xl transition-colors cursor-pointer group border-2 border-primary/20"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white group-hover:shadow-lg transition-all">
                  <FaDownload />
                </div>
                <div>
                  <p className="font-bold text-navy flex items-center gap-2">
                    Install MedSense App
                    {deviceType === 'ios' && <FaApple className="text-gray-600" />}
                    {deviceType === 'android' && <FaAndroid className="text-green-600" />}
                  </p>
                  <p className="text-sm text-muted">Get the full app experience</p>
                </div>
              </div>
              <FaChevronRight className="text-gray-300 group-hover:text-primary transition-colors" />
            </div>
          )}
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

      <Modal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        title="Notification Settings"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <h3 className="font-bold text-navy mb-2 flex items-center gap-2">
              <FaBell className="text-primary" />
              System Notifications Status
            </h3>
            <div className="flex items-center gap-2 mb-2">
              {notificationPermission === 'granted' ? (
                <>
                  <FaCheckCircle className="text-success" />
                  <span className="text-sm font-medium text-success">Enabled</span>
                </>
              ) : notificationPermission === 'denied' ? (
                <>
                  <FaTimesCircle className="text-error" />
                  <span className="text-sm font-medium text-error">Blocked</span>
                </>
              ) : (
                <>
                  <FaBell className="text-warning" />
                  <span className="text-sm font-medium text-warning">Not Set</span>
                </>
              )}
            </div>
            <p className="text-sm text-muted">
              {notificationPermission === 'granted' 
                ? 'You will receive medication reminders even when the app is closed.'
                : notificationPermission === 'denied'
                ? 'Notifications are blocked. You can enable them in your browser settings.'
                : 'Allow notifications to receive medication reminders outside the app.'}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-navy text-sm">About System Notifications</h4>
            <div className="text-sm text-muted space-y-2">
              <p>✓ Receive reminders even when MedSense is closed</p>
              <p>✓ Get alerts 5 minutes before and at scheduled times</p>
              <p>✓ Works on desktop and mobile devices</p>
              <p className="text-xs mt-3 p-2 bg-yellow-50 rounded-lg border border-yellow-100">
                <strong>iOS Users:</strong> For the best experience, add MedSense to your home screen and enable notifications when prompted.
              </p>
            </div>
          </div>

          {notificationPermission !== 'granted' && (
            <button 
              onClick={handleRequestNotificationPermission}
              className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <FaBell /> {notificationPermission === 'denied' ? 'Try Again' : 'Enable Notifications'}
            </button>
          )}

          {notificationPermission === 'denied' && (
            <div className="text-xs text-muted p-3 bg-gray-50 rounded-xl">
              <strong>How to enable manually:</strong>
              <ul className="list-disc ml-4 mt-2 space-y-1">
                <li>Click the lock icon in your browser's address bar</li>
                <li>Find "Notifications" and change to "Allow"</li>
                <li>Reload the page and try again</li>
              </ul>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        title="Install MedSense App"
      >
        <div className="space-y-6">
          {deviceType === 'ios' ? (
            // iOS Installation Instructions
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                <FaApple className="text-2xl text-gray-800 mt-1" />
                <div>
                  <h3 className="font-bold text-navy mb-1">iOS Installation</h3>
                  <p className="text-sm text-muted">Follow these steps to install MedSense on your iPhone or iPad:</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
                  <div>
                    <p className="font-medium text-navy">Tap the Share button</p>
                    <p className="text-sm text-muted flex items-center gap-2 mt-1">
                      <FaShareAlt className="text-primary" /> 
                      Look for the share icon at the bottom of Safari (or top-right corner)
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
                  <div>
                    <p className="font-medium text-navy">Select "Add to Home Screen"</p>
                    <p className="text-sm text-muted mt-1">
                      Scroll down in the share menu and tap "Add to Home Screen"
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
                  <div>
                    <p className="font-medium text-navy">Confirm Installation</p>
                    <p className="text-sm text-muted mt-1">
                      Tap "Add" in the top-right corner to install MedSense
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-success text-white flex items-center justify-center font-bold text-sm flex-shrink-0">4</div>
                  <div>
                    <p className="font-medium text-navy">Launch the App</p>
                    <p className="text-sm text-muted mt-1">
                      Find the MedSense icon on your home screen and open it
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100 text-sm">
                <p className="font-medium text-yellow-800 mb-1">📱 Important for iOS Users:</p>
                <p className="text-yellow-700">
                  After installation, open the app from your home screen and allow notifications when prompted for the best experience.
                </p>
              </div>

              <button 
                onClick={() => setIsInstallModalOpen(false)}
                className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors"
              >
                Got it!
              </button>
            </div>
          ) : deviceType === 'android' || deferredPrompt ? (
            // Android Installation with Prompt
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-start gap-3">
                <FaAndroid className="text-2xl text-green-600 mt-1" />
                <div>
                  <h3 className="font-bold text-navy mb-1">Android Installation</h3>
                  <p className="text-sm text-muted">Install MedSense for quick access and offline functionality.</p>
                </div>
              </div>

              <div className="flex flex-col items-center text-center py-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-3xl mb-4 shadow-lg">
                  <FaMobileAlt />
                </div>
                <p className="text-sm text-muted mb-6">
                  Click the button below to install MedSense on your device. The app will be added to your home screen.
                </p>
              </div>

              <div className="space-y-2">
                <button 
                  onClick={handleInstallApp}
                  disabled={!deferredPrompt}
                  className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <FaDownload /> Install Now
                </button>
                <button 
                  onClick={() => setIsInstallModalOpen(false)}
                  className="w-full bg-gray-100 text-navy py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  Maybe Later
                </button>
              </div>

              <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-sm text-center">
                <p className="text-muted">
                  ✓ Works offline  •  ✓ Faster loading  •  ✓ Push notifications
                </p>
              </div>
            </div>
          ) : (
            // Desktop or other devices
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                <FaDownload className="text-2xl text-primary mt-1" />
                <div>
                  <h3 className="font-bold text-navy mb-1">Desktop Installation</h3>
                  <p className="text-sm text-muted">Install MedSense on your computer for quick access.</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
                  <div>
                    <p className="font-medium text-navy">Look for the install icon</p>
                    <p className="text-sm text-muted mt-1">
                      Check your browser's address bar for an install icon (usually a computer with a down arrow)
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
                  <div>
                    <p className="font-medium text-navy">Click Install</p>
                    <p className="text-sm text-muted mt-1">
                      Click the icon and confirm to install MedSense
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-success text-white flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
                  <div>
                    <p className="font-medium text-navy">Launch from desktop</p>
                    <p className="text-sm text-muted mt-1">
                      Find MedSense in your applications and open it anytime
                    </p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsInstallModalOpen(false)}
                className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors"
              >
                Understood
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
export default Settings;
