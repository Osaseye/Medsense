import { useState, useEffect } from 'react';
import { FaPills, FaTimes, FaCheck, FaClock } from 'react-icons/fa';
import { useReminder } from '../context/ReminderContext';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

const InAppReminderAlert = () => {
  const { reminders } = useReminder();
  const { currentUser } = useAuth();
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [shownAlerts, setShownAlerts] = useState(new Set());

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${currentHours}:${currentMinutes}`;

      // Calculate time 5 minutes from now
      const fiveMinsLater = new Date(now.getTime() + 5 * 60000);
      const laterHours = fiveMinsLater.getHours().toString().padStart(2, '0');
      const laterMinutes = fiveMinsLater.getMinutes().toString().padStart(2, '0');
      const timeInFiveMins = `${laterHours}:${laterMinutes}`;
      
      const todayString = now.toISOString().split('T')[0];

      reminders.forEach(reminder => {
        if (!reminder.active) return;
        
        // Check date if specified
        if (reminder.date && reminder.date !== todayString) return;

        const alertKeyNow = `${reminder.id}-now-${todayString}`;
        const alertKeySoon = `${reminder.id}-soon-${todayString}`;

        // Check for exact time
        if (reminder.time === currentTime && !shownAlerts.has(alertKeyNow)) {
          const alert = {
            id: alertKeyNow,
            reminderId: reminder.id,
            type: 'now',
            title: `Time for your ${reminder.label}`,
            message: `Take: ${reminder.medications.join(', ')}`,
            medications: reminder.medications,
            time: reminder.time,
            timestamp: Date.now()
          };
          
          setActiveAlerts(prev => [...prev, alert]);
          setShownAlerts(prev => new Set([...prev, alertKeyNow]));
          
          // Play sound
          playNotificationSound();
        }

        // Check for 5 minutes before
        if (reminder.time === timeInFiveMins && !shownAlerts.has(alertKeySoon)) {
          const alert = {
            id: alertKeySoon,
            reminderId: reminder.id,
            type: 'soon',
            title: `Upcoming: ${reminder.label}`,
            message: `Prepare to take ${reminder.medications.join(', ')} in 5 minutes`,
            medications: reminder.medications,
            time: reminder.time,
            timestamp: Date.now()
          };
          
          setActiveAlerts(prev => [...prev, alert]);
          setShownAlerts(prev => new Set([...prev, alertKeySoon]));
          
          // Play sound
          playNotificationSound();
        }
      });
    };

    const intervalId = setInterval(checkReminders, 10000); // Check every 10 seconds for more responsiveness
    checkReminders();

    return () => clearInterval(intervalId);
  }, [reminders, shownAlerts]);

  const playNotificationSound = () => {
    try {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      console.log('Could not play sound:', e);
    }
  };

  const handleTakeNow = async (alert) => {
    if (!currentUser) return;
    
    try {
      await addDoc(collection(db, "users", currentUser.uid, "logs"), {
        action: 'taken',
        medications: alert.medications,
        reminderId: alert.reminderId,
        timestamp: new Date().toISOString()
      });
      
      handleDismiss(alert.id);
    } catch (err) {
      console.error("Error logging dose:", err);
    }
  };

  const handleDismiss = (alertId) => {
    setActiveAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const handleSnooze = (alert) => {
    handleDismiss(alert.id);
    
    // Re-show after 5 minutes
    setTimeout(() => {
      setActiveAlerts(prev => [...prev, { ...alert, id: `${alert.id}-snoozed`, timestamp: Date.now() }]);
      playNotificationSound();
    }, 5 * 60000);
  };

  if (activeAlerts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 max-w-md w-full px-4 sm:px-0">
      {activeAlerts.map(alert => (
        <div
          key={alert.id}
          className={`
            animate-slide-in-right bg-white rounded-2xl shadow-2xl border-2 overflow-hidden
            ${alert.type === 'now' ? 'border-error' : 'border-warning'}
          `}
        >
          {/* Header */}
          <div className={`
            p-4 flex items-center justify-between
            ${alert.type === 'now' ? 'bg-gradient-to-r from-error to-red-500' : 'bg-gradient-to-r from-warning to-yellow-500'}
          `}>
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                {alert.type === 'now' ? <FaPills className="text-xl" /> : <FaClock className="text-xl" />}
              </div>
              <div>
                <h3 className="font-bold text-lg">{alert.title}</h3>
                <p className="text-sm opacity-90">{alert.time}</p>
              </div>
            </div>
            <button
              onClick={() => handleDismiss(alert.id)}
              className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          {/* Body */}
          <div className="p-4">
            <p className="text-navy font-medium mb-4">{alert.message}</p>
            
            {alert.type === 'now' ? (
              <div className="flex gap-2">
                <button
                  onClick={() => handleTakeNow(alert)}
                  className="flex-1 bg-success text-white py-3 rounded-xl font-bold hover:bg-green-600 transition-all shadow-lg shadow-success/30 flex items-center justify-center gap-2 hover:scale-105"
                >
                  <FaCheck /> Take Now
                </button>
                <button
                  onClick={() => handleSnooze(alert)}
                  className="px-4 bg-blue-50 text-navy py-3 rounded-xl font-bold hover:bg-blue-100 transition-colors"
                >
                  Snooze 5m
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => handleDismiss(alert.id)}
                  className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors"
                >
                  Got it
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default InAppReminderAlert;
