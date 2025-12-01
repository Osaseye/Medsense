import { useState, useEffect } from 'react';
import { FaUserPlus, FaPills, FaChartLine, FaBell, FaSearch } from 'react-icons/fa';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, setDoc, arrayUnion, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const Patients = () => {
  const { info, success, error, currentUser } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [pendingConnections, setPendingConnections] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

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
      const caregiverEmail = currentUser.email.toLowerCase();

      if (!invite.isManual) {
        await updateDoc(doc(db, "users", currentUser.uid, "invitations", invite.id), {
          status: 'accepted'
        });
      }

      const patientCaregiversRef = collection(db, "users", invite.patientId, "caregivers");
      const caregiverDocRef = doc(db, "users", invite.patientId, "caregivers", currentUser.uid);
      const caregiverDocSnap = await getDoc(caregiverDocRef);

      if (caregiverDocSnap.exists()) {
        await updateDoc(caregiverDocRef, {
          status: 'Active',
          email: caregiverEmail,
          updatedAt: new Date().toISOString()
        });
      } else {
        const q = query(patientCaregiversRef, where("email", "==", caregiverEmail));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const existingDoc = querySnapshot.docs[0];
          await deleteDoc(existingDoc.ref);
          await setDoc(doc(db, "users", invite.patientId, "caregivers", currentUser.uid), {
            ...existingDoc.data(),
            status: 'Active',
            email: caregiverEmail,
            role: existingDoc.data().role || 'Viewer',
            updatedAt: new Date().toISOString()
          });
        } else {
          await setDoc(doc(db, "users", invite.patientId, "caregivers", currentUser.uid), {
            status: 'Active',
            email: caregiverEmail,
            role: 'Viewer',
            updatedAt: new Date().toISOString()
          });
        }
      }

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
        const q = query(collection(db, "users"), where("caregiverEmails", "array-contains", caregiverEmail));
        const querySnapshot = await getDocs(q);
        
        const activePatients = [];
        const pending = [];

        await Promise.all(querySnapshot.docs.map(async (doc) => {
          const data = doc.data();
          const uid = doc.id;
          
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
               const logsRef = collection(db, "users", uid, "logs");
               const logsSnapshot = await getDocs(logsRef);
               const logs = logsSnapshot.docs.map(d => d.data());
               
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
  const filteredPatients = patients.filter(p => 
    (p.name || p.email).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold text-navy">Patients</h2>
          <p className="text-muted text-lg">Manage and monitor your patients.</p>
        </div>
        <button 
          onClick={() => setIsAddPatientOpen(true)}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-primary/30 flex items-center gap-2 hover:-translate-y-1"
        >
          <FaUserPlus /> Add Patient
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

      {/* Search Bar */}
      <div className="relative">
        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search patients..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-blue-100 focus:border-primary outline-none"
        />
      </div>

      {/* Patient List */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <p className="text-center text-muted">Loading patients...</p>
        ) : filteredPatients.length > 0 ? (
          filteredPatients.map(patient => (
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
          <p className="text-center text-muted">No patients found matching your search.</p>
        )}
      </div>

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
    </div>
  );
};

export default Patients;
