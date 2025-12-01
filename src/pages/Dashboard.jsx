import { FaPills, FaCheck, FaClock, FaExclamationTriangle, FaPlus, FaUserInjured, FaChartLine, FaBell, FaUserPlus } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { useMedication } from '../context/MedicationContext';
import { useReminder } from '../context/ReminderContext';
import { collection, query, where, getDocs, addDoc, onSnapshot, updateDoc, doc, arrayUnion, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const PatientDashboard = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { success, info, error } = useNotification();
  const { currentUser, userData } = useAuth();
  const { medications, addMedication } = useMedication();
  const { reminders } = useReminder();
  
  const [nextDose, setNextDose] = useState(null);
  const [todaysSchedule, setTodaysSchedule] = useState([]);
  const [todaysLogs, setTodaysLogs] = useState([]);

  // New Medication Form State
  const [newMed, setNewMed] = useState({
    name: '',
    dosage: '',
    frequency: 'Once daily'
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Fetch today's logs
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

  useEffect(() => {
    if (reminders.length > 0) {
      // Filter out inactive reminders
      const activeReminders = reminders.filter(r => r.active);
      
      // Sort reminders by time
      const sorted = [...activeReminders].sort((a, b) => a.time.localeCompare(b.time));
      
      // Map schedule with taken status
      const scheduleWithStatus = sorted.map(reminder => {
        const isTaken = todaysLogs.some(log => 
          log.reminderId === reminder.id && 
          log.action === 'taken'
        );
        return { ...reminder, isTaken };
      });

      setTodaysSchedule(scheduleWithStatus);

      // Find next dose (not taken yet)
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      // Find first reminder that is after current time AND not taken
      // OR if all future ones are taken, maybe show nothing?
      // The requirement says: "shouldnt still be seeing the take no button in the next dose unless it is set in the reminder again"
      // This implies we skip taken ones.
      
      const next = scheduleWithStatus.find(r => r.time > currentTime && !r.isTaken) || 
                   scheduleWithStatus.find(r => !r.isTaken); // Wrap around to first untaken if any
      
      setNextDose(next);
    } else {
      setTodaysSchedule([]);
      setNextDose(null);
    }
  }, [reminders, todaysLogs]);

  const handleTakeNow = async (reminder = nextDose) => {
    if (!currentUser || !reminder) return;
    try {
      await addDoc(collection(db, "users", currentUser.uid, "logs"), {
        action: 'taken',
        medications: reminder.medications,
        reminderId: reminder.id,
        timestamp: new Date().toISOString()
      });
      success('Medication marked as taken!');
    } catch (err) {
      console.error("Error logging dose:", err);
      error('Failed to log dose');
    }
  };

  const handleCheckDose = (reminder) => {
    if (reminder.isTaken) return;
    handleTakeNow(reminder);
  };

  const handleSnooze = () => {
    info('Reminder snoozed for 15 minutes.');
  };

  const handleAddMedication = async (e) => {
    e.preventDefault();
    try {
      await addMedication(newMed);
      success('Medication added successfully!');
      setIsAddModalOpen(false);
      setNewMed({ name: '', dosage: '', frequency: 'Once daily' });
    } catch (err) {
      error('Failed to add medication');
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold text-navy">
            {getGreeting()}, {userData?.name || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User'}! ☀️
          </h2>
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
        <form className="space-y-4" onSubmit={handleAddMedication}>
          <div>
            <label className="block text-sm font-bold text-navy mb-1">Medication Name</label>
            <input 
              type="text" 
              value={newMed.name}
              onChange={(e) => setNewMed({...newMed, name: e.target.value})}
              className="w-full p-3 rounded-xl border border-blue-100 focus:border-primary outline-none" 
              placeholder="e.g. Amoxicillin" 
              required 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-navy mb-1">Dosage</label>
              <input 
                type="text" 
                value={newMed.dosage}
                onChange={(e) => setNewMed({...newMed, dosage: e.target.value})}
                className="w-full p-3 rounded-xl border border-blue-100 focus:border-primary outline-none" 
                placeholder="e.g. 500mg" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-navy mb-1">Frequency</label>
              <select 
                value={newMed.frequency}
                onChange={(e) => setNewMed({...newMed, frequency: e.target.value})}
                className="w-full p-3 rounded-xl border border-blue-100 focus:border-primary outline-none"
              >
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
          
          {nextDose ? (
            <>
              <div className="flex items-center gap-6 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-primary text-3xl shadow-inner">
                  <FaPills />
                </div>
                <div>
                  <p className="font-bold text-2xl text-navy">{nextDose.medications?.[0] || 'Medication'}</p>
                  <p className="text-muted font-medium">{nextDose.label || 'Scheduled Dose'}</p>
                  <p className="text-primary font-bold mt-1">{nextDose.time}</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => handleTakeNow(nextDose)}
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
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted">No upcoming doses for today.</p>
              <p className="text-xs text-muted mt-2">Great job staying on track!</p>
            </div>
          )}
        </div>

        {/* Adherence Card */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-blue-50 hover:shadow-md transition-all">
          <h3 className="text-lg font-heading font-bold text-navy mb-6">Adherence Score</h3>
          <div className="flex items-center gap-8">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="#E0F2FE" strokeWidth="8" fill="transparent" />
                <circle cx="48" cy="48" r="40" stroke="#1A73E8" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset="0" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-bold text-2xl text-navy">
                100%
              </div>
            </div>
            <div>
              <p className="text-lg font-bold text-navy">Excellent!</p>
              <p className="text-sm text-muted mb-2">You're doing great.</p>
            </div>
          </div>
        </div>

        {/* Alerts Card */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-blue-50 hover:shadow-md transition-all">
          <h3 className="text-lg font-heading font-bold text-navy mb-6">Recent Alerts</h3>
          <div className="space-y-4">
            {medications.filter(m => m.remaining < 5).length > 0 ? (
              medications.filter(m => m.remaining < 5).map(med => (
                <div key={med.id} className="flex items-start gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-primary shadow-sm shrink-0">
                    <FaPills />
                  </div>
                  <div>
                    <p className="font-bold text-navy">Refill Needed</p>
                    <p className="text-sm text-muted">{med.name} • {med.remaining} left</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted text-center py-4">No active alerts.</p>
            )}
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <section>
        <h3 className="text-xl font-heading font-bold text-navy mb-6">Today's Schedule</h3>
        <div className="bg-white rounded-3xl shadow-sm border border-blue-50 overflow-hidden">
          {todaysSchedule.length > 0 ? (
            todaysSchedule.map((schedule, index) => (
              <div key={schedule.id} className={`p-6 hover:bg-blue-50/30 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${index !== todaysSchedule.length - 1 ? 'border-b border-blue-50' : ''} ${schedule.isTaken ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-6">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      checked={schedule.isTaken || false}
                      onChange={() => handleCheckDose(schedule)}
                      disabled={schedule.isTaken}
                      className="peer appearance-none w-6 h-6 border-2 border-blue-200 rounded-lg checked:bg-success checked:border-success transition-all cursor-pointer disabled:cursor-not-allowed" 
                    />
                    <FaCheck className={`absolute text-white text-xs pointer-events-none ${schedule.isTaken ? 'opacity-100' : 'opacity-0'}`} />
                  </div>
                  <div>
                    <p className={`font-bold text-navy text-lg ${schedule.isTaken ? 'line-through text-muted' : ''}`}>{schedule.medications?.join(', ')}</p>
                    <p className="text-sm text-muted">{schedule.label}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-primary bg-blue-100 px-3 py-1 rounded-lg self-end sm:self-auto">{schedule.time}</span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-muted">
              No reminders scheduled for today.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const CaregiverDashboard = () => {
  const { info, success, error, currentUser } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [pendingConnections, setPendingConnections] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch invitations (Standard)
  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, "users", currentUser.uid, "invitations"), where("status", "==", "pending"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setInvitations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [currentUser]);

  const handleAcceptInvite = async (invite) => {
    if (!currentUser) return;
    
    try {
      console.log("Accepting invite:", invite);
      const caregiverEmail = currentUser.email.toLowerCase(); // Normalize to lowercase

      // 1. Update invitation status (if it's a standard invite)
      if (!invite.isManual) {
        await updateDoc(doc(db, "users", currentUser.uid, "invitations", invite.id), {
          status: 'accepted'
        });
      }

      // 2. Update patient's caregiver list to Active
      const patientCaregiversRef = collection(db, "users", invite.patientId, "caregivers");
      
      // Check if a document with the caregiver's UID already exists (Standard Invite)
      const caregiverDocRef = doc(db, "users", invite.patientId, "caregivers", currentUser.uid);
      const caregiverDocSnap = await getDoc(caregiverDocRef);

      if (caregiverDocSnap.exists()) {
        // Found by UID - just update status
        await updateDoc(caregiverDocRef, {
          status: 'Active',
          email: caregiverEmail, // Ensure email is up to date/normalized
          updatedAt: new Date().toISOString()
        });
      } else {
        // Not found by UID, try finding by email (Manual Invite or legacy)
        const q = query(patientCaregiversRef, where("email", "==", caregiverEmail));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Found existing doc(s) by email (likely manual invite with random ID)
          const existingDoc = querySnapshot.docs[0];
          
          // Delete old (random ID), create new with correct UID
          await deleteDoc(existingDoc.ref);
          await setDoc(doc(db, "users", invite.patientId, "caregivers", currentUser.uid), {
            ...existingDoc.data(),
            status: 'Active',
            email: caregiverEmail,
            role: existingDoc.data().role || 'Viewer',
            updatedAt: new Date().toISOString()
          });
        } else {
          // No doc found at all? Create one.
          await setDoc(doc(db, "users", invite.patientId, "caregivers", currentUser.uid), {
            status: 'Active',
            email: caregiverEmail,
            role: 'Viewer',
            updatedAt: new Date().toISOString()
          });
        }
      }

      // 3. Add self to patient's caregiverEmails array
      await setDoc(doc(db, "users", invite.patientId), {
        caregiverEmails: arrayUnion(caregiverEmail)
      }, { merge: true });

      success(`Accepted invitation from ${invite.patientName}`);
      setPendingConnections(prev => prev.filter(p => p.patientId !== invite.patientId));
      setRefreshTrigger(prev => prev + 1);

    } catch (err) {
      console.error("Error accepting invite:", err);
      error("Failed to accept invitation");
    }
  };

  const handleRejectInvite = async (invite) => {
    try {
      if (!invite.isManual) {
        await updateDoc(doc(db, "users", currentUser.uid, "invitations", invite.id), {
          status: 'rejected'
        });
      }
      
      // Also update patient side to Rejected
      const q = query(collection(db, "users", invite.patientId, "caregivers"), where("email", "==", currentUser.email));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        await updateDoc(snapshot.docs[0].ref, { status: 'Rejected' });
      }

      info(`Rejected invitation from ${invite.patientName}`);
      setPendingConnections(prev => prev.filter(p => p.patientId !== invite.patientId));
    } catch (err) {
      console.error("Error rejecting invite:", err);
      error("Failed to reject invitation");
    }
  };

  // Fetch patients linked to this caregiver
  useEffect(() => {
    if (!currentUser?.email) return;

    const fetchPatients = async () => {
      try {
        const caregiverEmail = currentUser.email.toLowerCase();
        // Query users who have listed this caregiver's email
        const q = query(collection(db, "users"), where("caregiverEmails", "array-contains", caregiverEmail));
        const querySnapshot = await getDocs(q);
        
        const activePatients = [];
        const pending = [];

        await Promise.all(querySnapshot.docs.map(async (doc) => {
          const data = doc.data();
          const uid = doc.id;
          
          // Fetch specific caregiver role/status for this user
          const caregiverQuery = query(
            collection(db, "users", uid, "caregivers"), 
            where("email", "==", caregiverEmail)
          );
          const caregiverSnapshot = await getDocs(caregiverQuery);
          
          if (!caregiverSnapshot.empty) {
            const connectionData = caregiverSnapshot.docs[0].data();
            const status = connectionData.status || 'Active';
            
            if (status === 'Pending') {
              pending.push({
                id: 'manual_' + uid,
                patientId: uid,
                patientName: data.name || data.email,
                patientEmail: data.email,
                isManual: true
              });
            } else if (status === 'Active') {
               // Fetch logs and meds for active patients
               const logsRef = collection(db, "users", uid, "logs");
               const logsSnapshot = await getDocs(logsRef);
               const logs = logsSnapshot.docs.map(d => d.data());
               
               // Calculate adherence
               const today = new Date();
               const last7Days = Array.from({length: 7}, (_, i) => {
                 const d = new Date();
                 d.setDate(today.getDate() - i);
                 return d.toISOString().split('T')[0];
               });
               
               const daysWithMeds = new Set(logs.map(log => log.timestamp.split('T')[0]));
               const adherenceCount = last7Days.filter(day => daysWithMeds.has(day)).length;
               const adherence = Math.round((adherenceCount / 7) * 100);

               const medsRef = collection(db, "users", uid, "medications");
               const medsSnapshot = await getDocs(medsRef);
               const medications = medsSnapshot.docs.map(d => d.data());

               activePatients.push({
                 id: uid,
                 ...data,
                 role: connectionData.role || 'Viewer',
                 adherence,
                 status: adherence > 80 ? 'Good' : (adherence > 50 ? 'Fair' : 'At Risk'),
                 lastUpdate: logs.length > 0 ? new Date(logs[logs.length-1].timestamp).toLocaleDateString() : 'Never',
                 alerts: 0,
                 medications,
                 logs
               });
            }
          }
        }));

        setPatients(activePatients);
        setPendingConnections(pending);
      } catch (error) {
        console.error("Error fetching patients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [currentUser, invitations, refreshTrigger]);

  const handleViewProfile = (patient) => {
    setSelectedPatient(patient);
    setIsDetailsOpen(true);
  };

  const allInvites = [...invitations, ...pendingConnections];

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold text-navy">Caregiver Portal</h2>
          <p className="text-muted text-lg">Monitoring {patients.length} patients.</p>
        </div>
        <button 
          onClick={() => setIsAddPatientOpen(true)}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-primary/30 flex items-center gap-2 hover:-translate-y-1"
        >
          <FaPlus /> Add Patient
        </button>
      </header>

      {/* Invitations Section */}
      {allInvites.length > 0 && (
        <section className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
          <h3 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
            <FaBell className="text-primary" /> Pending Invitations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allInvites.map(invite => (
              <div key={invite.id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
                <div>
                  <p className="font-bold text-navy">{invite.patientName}</p>
                  <p className="text-xs text-muted">{invite.patientEmail}</p>
                  {invite.isManual && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Manual Invite</span>}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleAcceptInvite(invite)}
                    className="bg-success text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-600 transition-colors"
                  >
                    Accept
                  </button>
                  <button 
                    onClick={() => handleRejectInvite(invite)}
                    className="bg-red-50 text-error px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Add Patient Instruction Modal */}
      <Modal
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
        title="Add New Patient"
      >
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-primary text-2xl mx-auto">
            <FaUserPlus />
          </div>
          <p className="text-navy font-medium">
            To add a patient, they must invite you from their dashboard.
          </p>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-left">
            <p className="text-sm text-muted mb-2">Ask your patient to:</p>
            <ol className="list-decimal list-inside text-sm text-navy space-y-2">
              <li>Log in to their MedSense account</li>
              <li>Go to <strong>Caregiver Access</strong> in the menu</li>
              <li>Click <strong>Invite Caregiver</strong></li>
              <li>Search for your name or email: <span className="font-bold text-primary">{currentUser?.email}</span></li>
              <li>Click <strong>Invite</strong></li>
            </ol>
          </div>
          <button 
            onClick={() => setIsAddPatientOpen(false)}
            className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors"
          >
            Got it
          </button>
        </div>
      </Modal>

      {/* Patient Details Modal */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title={selectedPatient ? `${selectedPatient.name || selectedPatient.email}'s Profile` : 'Patient Details'}
      >
        {selectedPatient && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary font-bold text-xl">
                {(selectedPatient.name || selectedPatient.email).charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-navy">{selectedPatient.name || selectedPatient.email}</h4>
                <p className="text-sm text-muted">Status: <span className="font-bold text-primary">{selectedPatient.status}</span></p>
                <p className="text-xs text-muted mt-1">Your Access: <span className="font-bold text-navy uppercase">{selectedPatient.role}</span></p>
              </div>
            </div>

            <div>
              <h5 className="font-bold text-navy mb-3 flex items-center gap-2"><FaPills /> Medications</h5>
              <div className="space-y-2">
                {selectedPatient.medications?.length > 0 ? (
                  selectedPatient.medications.map((med, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl">
                      <span className="font-medium text-navy">{med.name}</span>
                      <span className="text-sm text-muted">{med.dosage} • {med.frequency}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted">No medications listed.</p>
                )}
              </div>
            </div>

            <div>
              <h5 className="font-bold text-navy mb-3 flex items-center gap-2"><FaChartLine /> Recent Activity</h5>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedPatient.logs?.length > 0 ? (
                  selectedPatient.logs.slice(0, 5).map((log, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl text-sm">
                      <span className="text-navy">Taken {log.medications?.join(', ')}</span>
                      <span className="text-muted">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted">No recent activity.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-50">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-primary">
              <FaUserInjured />
            </div>
            <h3 className="font-bold text-navy">Total Patients</h3>
          </div>
          <p className="text-3xl font-bold text-navy">{patients.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-50">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-error">
              <FaExclamationTriangle />
            </div>
            <h3 className="font-bold text-navy">Critical Alerts</h3>
          </div>
          <p className="text-3xl font-bold text-navy">0</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-50">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-success">
              <FaCheck />
            </div>
            <h3 className="font-bold text-navy">Avg Adherence</h3>
          </div>
          <p className="text-3xl font-bold text-navy">
            {patients.length > 0 
              ? Math.round(patients.reduce((acc, p) => acc + p.adherence, 0) / patients.length) 
              : 0}%
          </p>
        </div>
      </div>

      {/* Patient List */}
      <section>
        <h3 className="text-xl font-heading font-bold text-navy mb-6">Your Patients</h3>
        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            <p className="text-center text-muted">Loading patients...</p>
          ) : patients.length > 0 ? (
            patients.map(patient => (
              <div key={patient.id} className="bg-white p-6 rounded-3xl shadow-sm border border-blue-50 hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-500">
                      {(patient.name || patient.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-navy">{patient.name || patient.email}</h4>
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

                    <button 
                      onClick={() => handleViewProfile(patient)}
                      className="px-4 py-2 rounded-xl border border-blue-100 text-primary font-bold hover:bg-blue-50 transition-colors"
                    >
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
            ))
          ) : (
            <p className="text-center text-muted">No patients found. Click "Add Patient" to see how to connect.</p>
          )}
        </div>
      </section>
    </div>
  );
};

const Dashboard = () => {
  const { userRole } = useAuth();
  const role = userRole || 'patient';

  return role === 'caregiver' ? <CaregiverDashboard /> : <PatientDashboard />;
};

export default Dashboard;
