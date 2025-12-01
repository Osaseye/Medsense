import { FaPills, FaCheck, FaClock, FaExclamationTriangle, FaPlus, FaUserInjured, FaChartLine, FaBell } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { useNotification } from '../context/NotificationContext';

const PatientDashboard = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { success, info } = useNotification();

  const handleTakeNow = () => {
    success('Medication marked as taken!');
  };

  const handleSnooze = () => {
    info('Reminder snoozed for 15 minutes.');
  };

  const handleCheckboxChange = (e) => {
    if (e.target.checked) {
      success('Dose completed!');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold text-navy">Good Morning, John! ☀️</h2>
          <p className="text-muted text-lg">Here's your medication snapshot for today.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-primary/30 flex items-center gap-2 hover:-translate-y-1"
        >
          <FaPlus /> Add Medication
        </button>
      </header>

      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title="Add New Medication"
      >
        <form className="space-y-4" onSubmit={(e) => {
          e.preventDefault();
          success('Medication added successfully!');
          setIsAddModalOpen(false);
        }}>
          <div>
            <label className="block text-sm font-bold text-navy mb-1">Medication Name</label>
            <input type="text" className="w-full p-3 rounded-xl border border-blue-100 focus:border-primary outline-none" placeholder="e.g. Amoxicillin" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-navy mb-1">Dosage</label>
              <input type="text" className="w-full p-3 rounded-xl border border-blue-100 focus:border-primary outline-none" placeholder="e.g. 500mg" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-navy mb-1">Frequency</label>
              <select className="w-full p-3 rounded-xl border border-blue-100 focus:border-primary outline-none">
                <option>Once daily</option>
                <option>Twice daily</option>
                <option>As needed</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors">
            Save Medication
          </button>
        </form>
      </Modal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Next Dose Card */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-blue-50 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform"></div>
          <h3 className="text-lg font-heading font-bold text-navy mb-6 flex items-center gap-2">
            <FaClock className="text-primary" /> Next Dose
          </h3>
          
          <div className="flex items-center gap-6 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-primary text-3xl shadow-inner">
              <FaPills />
            </div>
            <div>
              <p className="font-bold text-2xl text-navy">Amoxicillin</p>
              <p className="text-muted font-medium">500mg • With food</p>
              <p className="text-primary font-bold mt-1">2:00 PM</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={handleTakeNow}
              className="flex-1 bg-success text-white py-3 rounded-xl font-bold text-sm hover:bg-green-600 transition-colors shadow-lg shadow-success/20 flex items-center justify-center gap-2"
            >
              <FaCheck /> Take Now
            </button>
            <button 
              onClick={handleSnooze}
              className="flex-1 bg-blue-50 text-navy py-3 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors"
            >
              Snooze
            </button>
          </div>
        </div>

        {/* Adherence Card */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-blue-50 hover:shadow-md transition-all">
          <h3 className="text-lg font-heading font-bold text-navy mb-6">Adherence Score</h3>
          <div className="flex items-center gap-8">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="#E0F2FE" strokeWidth="8" fill="transparent" />
                <circle cx="48" cy="48" r="40" stroke="#1A73E8" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset="20" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-bold text-2xl text-navy">
                92%
              </div>
            </div>
            <div>
              <p className="text-lg font-bold text-navy">Excellent!</p>
              <p className="text-sm text-muted mb-2">You're doing great.</p>
              <p className="text-xs font-bold text-success bg-green-50 px-2 py-1 rounded-lg inline-block">
                ↑ 4% from last week
              </p>
            </div>
          </div>
        </div>

        {/* Alerts Card */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-blue-50 hover:shadow-md transition-all">
          <h3 className="text-lg font-heading font-bold text-navy mb-6">Recent Alerts</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-red-50 rounded-2xl border border-red-100">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-error shadow-sm shrink-0">
                <FaExclamationTriangle />
              </div>
              <div>
                <p className="font-bold text-navy">Missed Dose</p>
                <p className="text-sm text-muted">Vitamin D • Yesterday, 9:00 AM</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-primary shadow-sm shrink-0">
                <FaPills />
              </div>
              <div>
                <p className="font-bold text-navy">Refill Needed</p>
                <p className="text-sm text-muted">Lisinopril • 5 days left</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <section>
        <h3 className="text-xl font-heading font-bold text-navy mb-6">Today's Schedule</h3>
        <div className="bg-white rounded-3xl shadow-sm border border-blue-50 overflow-hidden">
          {/* Morning */}
          <div className="p-4 bg-blue-50/50 border-b border-blue-50 flex justify-between items-center">
            <span className="font-bold text-primary uppercase tracking-wider text-sm">Morning</span>
          </div>
          <div className="p-6 hover:bg-blue-50/30 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-blue-50 last:border-0">
            <div className="flex items-center gap-6">
              <div className="relative flex items-center justify-center">
                <input type="checkbox" className="peer appearance-none w-6 h-6 border-2 border-blue-200 rounded-lg checked:bg-success checked:border-success transition-all cursor-pointer" checked readOnly />
                <FaCheck className="absolute text-white text-xs opacity-0 peer-checked:opacity-100 pointer-events-none" />
              </div>
              <div>
                <p className="font-bold text-navy text-lg line-through opacity-50">Lisinopril</p>
                <p className="text-sm text-muted">10mg • With food</p>
              </div>
            </div>
            <span className="text-sm font-bold text-muted bg-blue-50 px-3 py-1 rounded-lg self-end sm:self-auto">8:00 AM</span>
          </div>

          {/* Afternoon */}
          <div className="p-4 bg-blue-50/50 border-y border-blue-50 flex justify-between items-center">
            <span className="font-bold text-primary uppercase tracking-wider text-sm">Afternoon</span>
          </div>
          <div className="p-6 hover:bg-blue-50/30 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-6">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  className="peer appearance-none w-6 h-6 border-2 border-blue-200 rounded-lg checked:bg-success checked:border-success transition-all cursor-pointer" 
                  onChange={handleCheckboxChange}
                />
                <FaCheck className="absolute text-white text-xs opacity-0 peer-checked:opacity-100 pointer-events-none" />
              </div>
              <div>
                <p className="font-bold text-navy text-lg">Amoxicillin</p>
                <p className="text-sm text-muted">500mg</p>
              </div>
            </div>
            <span className="text-sm font-bold text-primary bg-blue-100 px-3 py-1 rounded-lg self-end sm:self-auto">2:00 PM</span>
          </div>
        </div>
      </section>
    </div>
  );
};

const CaregiverDashboard = () => {
  const { info } = useNotification();
  
  const patients = [
    { id: 1, name: 'John Doe', status: 'Good', adherence: 92, lastUpdate: '10 mins ago', alerts: 0 },
    { id: 2, name: 'Mary Smith', status: 'Attention', adherence: 75, lastUpdate: '1 hour ago', alerts: 2 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold text-navy">Caregiver Portal</h2>
          <p className="text-muted text-lg">Monitoring {patients.length} patients.</p>
        </div>
        <button 
          onClick={() => info('Invite feature coming soon')}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-primary/30 flex items-center gap-2 hover:-translate-y-1"
        >
          <FaPlus /> Add Patient
        </button>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-50">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-primary">
              <FaUserInjured />
            </div>
            <h3 className="font-bold text-navy">Total Patients</h3>
          </div>
          <p className="text-3xl font-bold text-navy">2</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-50">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-error">
              <FaExclamationTriangle />
            </div>
            <h3 className="font-bold text-navy">Critical Alerts</h3>
          </div>
          <p className="text-3xl font-bold text-navy">2</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-50">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-success">
              <FaCheck />
            </div>
            <h3 className="font-bold text-navy">Avg Adherence</h3>
          </div>
          <p className="text-3xl font-bold text-navy">84%</p>
        </div>
      </div>

      {/* Patient List */}
      <section>
        <h3 className="text-xl font-heading font-bold text-navy mb-6">Your Patients</h3>
        <div className="grid grid-cols-1 gap-6">
          {patients.map(patient => (
            <div key={patient.id} className="bg-white p-6 rounded-3xl shadow-sm border border-blue-50 hover:shadow-md transition-all">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-500">
                    {patient.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-navy">{patient.name}</h4>
                    <p className="text-sm text-muted">Last active: {patient.lastUpdate}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-center">
                    <p className="text-xs font-bold text-muted uppercase mb-1">Adherence</p>
                    <span className={`font-bold text-lg ${patient.adherence > 80 ? 'text-success' : 'text-warning'}`}>
                      {patient.adherence}%
                    </span>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xs font-bold text-muted uppercase mb-1">Status</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      patient.status === 'Good' ? 'bg-green-100 text-success' : 'bg-red-100 text-error'
                    }`}>
                      {patient.status}
                    </span>
                  </div>

                  <button className="px-4 py-2 rounded-xl border border-blue-100 text-primary font-bold hover:bg-blue-50 transition-colors">
                    View Profile
                  </button>
                </div>
              </div>
              
              {patient.alerts > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2 text-error text-sm font-bold">
                  <FaBell />
                  {patient.alerts} missed doses reported today
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const Dashboard = () => {
  const [role, setRole] = useState(() => localStorage.getItem('userRole') || 'patient');

  return role === 'caregiver' ? <CaregiverDashboard /> : <PatientDashboard />;
};

export default Dashboard;
