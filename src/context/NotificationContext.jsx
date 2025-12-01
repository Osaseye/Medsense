import { createContext, useContext, useState, useCallback } from 'react';
import { FaCheckCircle, FaInfoCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((type, message, duration = 3000) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message }]);

    setTimeout(() => {
      removeNotification(id);
    }, duration);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const requestSystemPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notification');
      return false;
    }
    
    if (Notification.permission === 'granted') {
      return true;
    }
    
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }, []);

  const sendSystemNotification = useCallback((title, body) => {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/logo.png',
          badge: '/logo.png',
          vibrate: [200, 100, 200]
        });
      } catch (e) {
        console.error("Notification error:", e);
      }
    }
  }, []);

  const success = (msg) => {
    addNotification('success', msg);
    sendSystemNotification('Success', msg);
  };

  const error = (msg) => {
    addNotification('error', msg);
    sendSystemNotification('Error', msg);
  };

  const info = (msg) => {
    addNotification('info', msg);
    sendSystemNotification('Info', msg);
  };

  return (
    <NotificationContext.Provider value={{ success, error, info, requestSystemPermission, sendSystemNotification }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {notifications.map(notif => (
          <div 
            key={notif.id}
            className={`
              flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg text-white min-w-[300px] animate-slide-up
              ${notif.type === 'success' ? 'bg-success' : notif.type === 'error' ? 'bg-error' : 'bg-primary'}
            `}
          >
            <span className="text-xl">
              {notif.type === 'success' && <FaCheckCircle />}
              {notif.type === 'error' && <FaExclamationCircle />}
              {notif.type === 'info' && <FaInfoCircle />}
            </span>
            <p className="font-medium flex-1">{notif.message}</p>
            <button onClick={() => removeNotification(notif.id)} className="opacity-80 hover:opacity-100">
              <FaTimes />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
