import { FaChartLine, FaCalendarCheck, FaTrophy, FaExclamationCircle, FaArrowUp } from 'react-icons/fa';

const Adherence = () => {
  const weeklyData = [
    { day: 'Mon', value: 100, status: 'perfect' },
    { day: 'Tue', value: 100, status: 'perfect' },
    { day: 'Wed', value: 80, status: 'good' },
    { day: 'Thu', value: 100, status: 'perfect' },
    { day: 'Fri', value: 60, status: 'warning' },
    { day: 'Sat', value: 100, status: 'perfect' },
    { day: 'Sun', value: 100, status: 'perfect' },
  ];

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
            <h3 className="font-bold text-navy text-lg">Overall Score</h3>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-navy">92%</span>
            <span className="text-success font-bold text-sm mb-1 flex items-center gap-1">
              <FaArrowUp /> 4%
            </span>
          </div>
          <p className="text-muted text-sm mt-2">Better than last month</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-50">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600 text-xl">
              <FaTrophy />
            </div>
            <h3 className="font-bold text-navy text-lg">Current Streak</h3>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-navy">12</span>
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
            <span className="text-4xl font-bold text-navy">1</span>
            <span className="text-muted font-bold text-sm mb-1">this week</span>
          </div>
          <p className="text-muted text-sm mt-2">Vitamin D (Fri)</p>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-blue-50">
        <h3 className="text-xl font-bold text-navy mb-8 flex items-center gap-2">
          <FaCalendarCheck className="text-primary" /> Weekly Overview
        </h3>
        
        <div className="flex items-end justify-between h-64 gap-2 md:gap-4">
          {weeklyData.map((day, index) => (
            <div key={index} className="flex flex-col items-center gap-3 flex-1 h-full justify-end group">
              <div className="relative w-full flex justify-center h-full items-end bg-blue-50/50 rounded-t-xl overflow-hidden">
                <div 
                  className={`w-full max-w-[60px] rounded-t-xl transition-all duration-1000 group-hover:opacity-80 relative
                    ${day.value === 100 ? 'bg-primary' : day.value >= 80 ? 'bg-blue-300' : 'bg-red-300'}
                  `}
                  style={{ height: `${day.value}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-navy text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {day.value}%
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
            <h3 className="text-2xl font-bold mb-2">You're doing great, John!</h3>
            <p className="text-blue-100 text-lg max-w-xl">
              Your adherence has improved by 15% since you started using MedSense. 
              Consistent medication intake is key to your health goals.
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
