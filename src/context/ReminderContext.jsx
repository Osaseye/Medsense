import { createContext, useContext, useState, useEffect } from 'react';
import { useNotification } from './NotificationContext';
import { FaCoffee, FaSun, FaMoon, FaClock } from 'react-icons/fa';

const ReminderContext = createContext();

export const useReminder = () => {
  const context = useContext(ReminderContext);
  if (!context) {
    throw new Error('useReminder must be used within a ReminderProvider');
  }
  return context;
};

export const ReminderProvider = ({ children }) => {
  const { sendSystemNotification, requestSystemPermission } = useNotification();
  
  // Initial dummy data moved from Reminders.jsx
  const [reminders, setReminders] = useState([
    {
      id: 1,
      time: '08:00',
      label: 'Morning Meds',
      medications: ['Lisinopril', 'Vitamin D3'],
      active: true,
      icon: <FaCoffee className="text-orange-400" />
    },
    {
      id: 2,
      time: '14:00',
      label: 'Afternoon Dose',
      medications: ['Amoxicillin'],
      active: true,
      icon: <FaSun className="text-yellow-400" />
    },
    {
      id: 3,
      time: '21:00',
      label: 'Evening Routine',
      medications: ['Metformin', 'Magnesium'],
      active: false,
      icon: <FaMoon className="text-indigo-400" />
    }
  ]);

  // Request permission on mount
  useEffect(() => {
    requestSystemPermission();
  }, [requestSystemPermission]);

  // Check for reminders every minute
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${currentHours}:${currentMinutes}`;

      reminders.forEach(reminder => {
        if (reminder.active && reminder.time === currentTime) {
          // Simple check to avoid spamming (in a real app, track 'lastNotified')
          // For this demo, we assume the interval aligns or we accept one notification per minute match
          sendSystemNotification(
            `Time for your ${reminder.label}`, 
            `Take: ${reminder.medications.join(', ')}`
          );
        }
      });
    };

    const intervalId = setInterval(checkReminders, 60000); // Check every minute
    
    // Also check immediately on load/change just in case (optional, maybe skip to avoid instant alerts on refresh)
    // checkReminders(); 

    return () => clearInterval(intervalId);
  }, [reminders, sendSystemNotification]);

  const addReminder = (reminder) => {
    setReminders(prev => [...prev, { ...reminder, id: Date.now(), active: true, icon: <FaClock className="text-blue-400" /> }]);
  };

  const updateReminder = (id, updatedData) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, ...updatedData } : r));
  };

  const deleteReminder = (id) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const toggleReminder = (id) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  return (
    <ReminderContext.Provider value={{ reminders, addReminder, updateReminder, deleteReminder, toggleReminder }}>
      {children}
    </ReminderContext.Provider>
  );
};
