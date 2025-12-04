import { createContext, useContext, useState, useEffect } from 'react';
import { useNotification } from './NotificationContext';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';
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
  const { currentUser } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [todaysLogs, setTodaysLogs] = useState([]);

  // Request permission on mount
  useEffect(() => {
    requestSystemPermission();
  }, [requestSystemPermission]);

  // Fetch today's logs to prevent duplicate notifications
  useEffect(() => {
    if (!currentUser) return;
    
    const today = new Date().toISOString().split('T')[0];
    const startOfDay = new Date(today).toISOString();
    
    const q = query(
      collection(db, "users", currentUser.uid, "logs"),
      where("timestamp", ">=", startOfDay)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => doc.data());
      setTodaysLogs(logs);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Fetch reminders from Firestore
  useEffect(() => {
    if (!currentUser) {
      setReminders([]);
      return;
    }

    const q = query(collection(db, 'users', currentUser.uid, 'reminders'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        icon: <FaClock className="text-blue-400" /> 
      }));
      setReminders(rems);
    });

    return unsubscribe;
  }, [currentUser]);

  // Check for reminders every minute
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${currentHours}:${currentMinutes}`;

      // Calculate time 5 minutes from now for early warning
      const fiveMinsLater = new Date(now.getTime() + 5 * 60000);
      const laterHours = fiveMinsLater.getHours().toString().padStart(2, '0');
      const laterMinutes = fiveMinsLater.getMinutes().toString().padStart(2, '0');
      const timeInFiveMins = `${laterHours}:${laterMinutes}`;
      
      const todayString = now.toISOString().split('T')[0];

      reminders.forEach(reminder => {
        if (!reminder.active) return;
        
        // Check date if specified
        if (reminder.date && reminder.date !== todayString) return;

        // Check if already taken
        const isTaken = todaysLogs.some(log => 
          log.reminderId === reminder.id && 
          log.action === 'taken'
        );

        if (isTaken) {
          console.log(`Reminder ${reminder.label} already taken. Skipping.`);
          return;
        }

        console.log(`Checking reminder: ${reminder.label} at ${reminder.time} vs ${currentTime}`);

        // 1. Check for exact time
        if (reminder.time === currentTime) {
          console.log("Triggering ON TIME notification");
          sendSystemNotification(
            `Time for your ${reminder.label}`, 
            `Take: ${reminder.medications.join(', ')}`,
            {
              tag: `reminder-${reminder.id}-now`,
              requireInteraction: true,
              vibrate: [300, 100, 300, 100, 300]
            }
          );
        }

        // 2. Check for 5 minutes before
        if (reminder.time === timeInFiveMins) {
          console.log("Triggering 5 MIN WARNING notification");
          sendSystemNotification(
            `Upcoming Dose: ${reminder.label}`, 
            `Prepare to take ${reminder.medications.join(', ')} in 5 minutes.`,
            {
              tag: `reminder-${reminder.id}-soon`,
              requireInteraction: false,
              vibrate: [200, 100, 200]
            }
          );
        }
      });
    };

    const intervalId = setInterval(checkReminders, 60000); // Check every minute
    
    // Run immediately on mount to check if we just missed a minute boundary
    checkReminders();

    return () => clearInterval(intervalId);
  }, [reminders, todaysLogs, sendSystemNotification]);

  const addReminder = async (reminder) => {
    if (!currentUser) return;
    await addDoc(collection(db, 'users', currentUser.uid, 'reminders'), {
      ...reminder,
      active: true,
      createdAt: new Date().toISOString()
    });
  };

  const updateReminder = async (id, updatedData) => {
    if (!currentUser) return;
    await updateDoc(doc(db, 'users', currentUser.uid, 'reminders', id), updatedData);
  };

  const deleteReminder = async (id) => {
    if (!currentUser) return;
    await deleteDoc(doc(db, 'users', currentUser.uid, 'reminders', id));
  };

  const toggleReminder = async (id) => {
    if (!currentUser) return;
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      await updateDoc(doc(db, 'users', currentUser.uid, 'reminders', id), {
        active: !reminder.active
      });
    }
  };

  return (
    <ReminderContext.Provider value={{ reminders, addReminder, updateReminder, deleteReminder, toggleReminder }}>
      {children}
    </ReminderContext.Provider>
  );
};
