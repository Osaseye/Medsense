import { FaChartLine, FaCalendarCheck, FaTrophy, FaExclamationCircle, FaArrowUp } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

const Adherence = () => {
  const { currentUser } = useAuth();
  const [logs, setLogs] = useState([]);
  const [streak, setStreak] = useState(0);
  const [weeklyData, setWeeklyData] = useState([
    { day: 'Mon', value: 0, status: 'warning' },
    { day: 'Tue', value: 0, status: 'warning' },
    { day: 'Wed', value: 0, status: 'warning' },
    { day: 'Thu', value: 0, status: 'warning' },
    { day: 'Fri', value: 0, status: 'warning' },
    { day: 'Sat', value: 0, status: 'warning' },
    { day: 'Sun', value: 0, status: 'warning' },
  ]);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!currentUser) return;
      try {
        const q = query(collection(db, "users", currentUser.uid, "logs"), orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);
        const fetchedLogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLogs(fetchedLogs);
        calculateStats(fetchedLogs);
      } catch (err) {
        console.error("Error fetching logs:", err);
      }
    };

    fetchLogs();
  }, [currentUser]);

  const calculateStats = (logs) => {
    // Calculate Streak (consecutive days with at least one log)
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Group logs by date string
    const logsByDate = {};
    logs.forEach(log => {
      const date = new Date(log.timestamp).toDateString();
      logsByDate[date] = true;
    });

    // Check backwards from today
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (logsByDate[d.toDateString()]) {
        currentStreak++;
      } else if (i === 0 && !logsByDate[d.toDateString()]) {
        // If today hasn't happened yet, don't break streak, just ignore
        continue;
      } else {
        break;
      }
    }
    setStreak(currentStreak);

    // Calculate Weekly Data
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const newWeeklyData = [];
    
    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      const hasLog = logsByDate[d.toDateString()];
      
      newWeeklyData.push({
        day: dayName,
        value: hasLog ? 100 : 0,
        status: hasLog ? 'perfect' : 'warning'
      });
    }
    setWeeklyData(newWeeklyData);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-navy">Adherence History</h1>
        <p className="text-muted text-lg">Track your progress and medication consistency.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-50">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-primary text-xl">
              <FaChartLine />
            </div>
            <h3 className="font-bold text-navy text-lg">Total Doses</h3>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-navy">{logs.length}</span>
            <span className="text-success font-bold text-sm mb-1 flex items-center gap-1">
              <FaArrowUp /> recorded
            </span>
          </div>
          <p className="text-muted text-sm mt-2">Keep tracking!</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-50">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600 text-xl">
              <FaTrophy />
            </div>
            <h3 className="font-bold text-navy text-lg">Current Streak</h3>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-navy">{streak}</span>
            <span className="text-muted font-bold text-sm mb-1">days</span>
          </div>
          <p className="text-muted text-sm mt-2">Keep it up!</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-50">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-error text-xl">
              <FaExclamationCircle />
            </div>
            <h3 className="font-bold text-navy text-lg">Missed Doses</h3>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-navy">0</span>
            <span className="text-muted font-bold text-sm mb-1">reported</span>
          </div>
          <p className="text-muted text-sm mt-2">No missed doses reported</p>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-blue-50">
        <h3 className="text-xl font-bold text-navy mb-8 flex items-center gap-2">
          <FaCalendarCheck className="text-primary" /> Last 7 Days
        </h3>
        
        <div className="flex items-end justify-between h-64 gap-2 md:gap-4">
          {weeklyData.map((day, index) => (
            <div key={index} className="flex flex-col items-center gap-3 flex-1 h-full justify-end group">
              <div className="relative w-full flex justify-center h-full items-end bg-blue-50/50 rounded-t-xl overflow-hidden">
                <div 
                  className={`w-full max-w-[60px] rounded-t-xl transition-all duration-1000 group-hover:opacity-80 relative
                    ${day.value === 100 ? 'bg-primary' : 'bg-gray-200'}
                  `}
                  style={{ height: `${day.value === 0 ? 10 : day.value}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-navy text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {day.value === 100 ? 'Taken' : 'No Data'}
                  </div>
                </div>
              </div>
              <span className="font-bold text-muted text-sm">{day.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-primary to-blue-600 rounded-3xl p-8 text-white shadow-lg shadow-primary/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold mb-2">You're doing great, {currentUser?.displayName?.split(' ')[0] || 'User'}!</h3>
            <p className="text-blue-100 text-lg max-w-xl">
              Consistent medication intake is key to your health goals. 
              {streak > 0 ? ` You've been consistent for ${streak} days!` : " Start your streak today!"}
            </p>
          </div>
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <span className="text-4xl">⭐</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Adherence;
