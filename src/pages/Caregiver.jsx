import { FaUserFriends, FaUserPlus, FaShieldAlt, FaEnvelope, FaEllipsisH, FaPlus, FaSearch } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, onSnapshot, query, updateDoc, arrayUnion, doc, where, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const Caregiver = () => {
  const { success, info, error } = useNotification();
  const { currentUser, userData } = useAuth();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  
  const [caregivers, setCaregivers] = useState([]); // My connected caregivers
  const [availableCaregivers, setAvailableCaregivers] = useState([]); // All caregivers in system
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch my connected caregivers
  useEffect(() => {
    if (!currentUser) return;

    const q = query(collection(db, "users", currentUser.uid, "caregivers"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const caregiversData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCaregivers(caregiversData);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching caregivers:", err);
      error("Failed to load caregivers");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, error]);

  // Fetch all available caregivers when modal opens
  useEffect(() => {
    if (isInviteModalOpen) {
      const fetchCaregivers = async () => {
        try {
          const q = query(collection(db, "users"), where("role", "==", "caregiver"));
          const snapshot = await getDocs(q);
          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setAvailableCaregivers(data);
        } catch (err) {
          console.error("Error fetching available caregivers:", err);
        }
      };
      fetchCaregivers();
    }
  }, [isInviteModalOpen]);

  const handleManualInvite = async () => {
    if (!currentUser || !searchTerm) return;
    const email = searchTerm.toLowerCase().trim();

    try {
       // 1. Add to my caregivers list as Pending (using email as ID since we don't have UID)
       await addDoc(collection(db, "users", currentUser.uid, "caregivers"), {
        name: email.split('@')[0],
        email: email,
        relation: 'Caregiver',
        role: 'Viewer',
        status: 'Pending',
        avatar: email.charAt(0).toUpperCase(),
        createdAt: new Date().toISOString()
      });

      // 2. Update main user document
      await updateDoc(doc(db, "users", currentUser.uid), {
        caregiverEmails: arrayUnion(email)
      });

      success(`Invitation sent to ${email}`);
      setIsInviteModalOpen(false);
      setSearchTerm('');
    } catch (err) {
       console.error("Error sending manual invite:", err);
       error("Failed to send invitation");
    }
  };

  const handleSendInvite = async (caregiver) => {
    if (!currentUser) return;

    try {
      // 1. Create invitation in caregiver's collection
      await addDoc(collection(db, "users", caregiver.id, "invitations"), {
        patientId: currentUser.uid,
        patientName: userData?.name || currentUser.email,
        patientEmail: currentUser.email.toLowerCase(),
        status: 'pending',
        timestamp: new Date().toISOString()
      });

      // 2. Add to my caregivers list as Pending
      // We use the caregiver's UID as the doc ID to easily update it later
      await setDoc(doc(db, "users", currentUser.uid, "caregivers", caregiver.id), {
        name: caregiver.name || 'Unknown',
        email: caregiver.email.toLowerCase(),
        relation: 'Caregiver', // Default
        role: 'Viewer', // Default
        status: 'Pending',
        avatar: (caregiver.name || 'C').substring(0, 2).toUpperCase(),
        createdAt: new Date().toISOString()
      });

      success(`Invitation sent to ${caregiver.name}`);
      setIsInviteModalOpen(false);
    } catch (err) {
      console.error("Error sending invitation:", err);
      error("Failed to send invitation");
    }
  };

  const handleManagePermissions = (name) => {
    info(`Managing permissions for ${name}`);
  };

  const filteredAvailableCaregivers = availableCaregivers.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-navy">Caregiver Access</h1>
          <p className="text-muted text-lg">Share your health data with trusted family and doctors.</p>
        </div>
        <button 
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-primary/30 flex items-center gap-2 hover:-translate-y-1"
        >
          <FaUserPlus /> Invite Caregiver
        </button>
      </div>

      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Find a Caregiver"
      >
        <div className="space-y-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 p-3 rounded-xl border border-blue-100 focus:border-primary outline-none"
            />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {filteredAvailableCaregivers.length > 0 ? (
              filteredAvailableCaregivers.map(caregiver => {
                const isAlreadyConnected = caregivers.some(c => c.id === caregiver.id);
                return (
                  <div key={caregiver.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-primary font-bold">
                        {(caregiver.name || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-navy">{caregiver.name}</p>
                        <p className="text-xs text-muted">{caregiver.email}</p>
                      </div>
                    </div>
                    {isAlreadyConnected ? (
                      <span className="text-xs font-bold text-muted bg-gray-200 px-3 py-1 rounded-full">
                        {caregivers.find(c => c.id === caregiver.id)?.status}
                      </span>
                    ) : (
                      <button 
                        onClick={() => handleSendInvite(caregiver)}
                        className="text-sm bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-600 transition-colors"
                      >
                        Invite
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4">
                <p className="text-muted mb-4">No registered caregivers found.</p>
                {searchTerm.includes('@') && (
                  <button 
                    onClick={handleManualInvite}
                    className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-600 transition-colors"
                  >
                    Invite {searchTerm}
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Helper text */}
          <p className="text-xs text-muted text-center pt-2 border-t border-gray-50">
            Can't find them? Type their email to invite them directly.
          </p>
        </div>
      </Modal>

      {/* Caregivers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <p className="text-muted col-span-full text-center">Loading caregivers...</p>
        ) : caregivers.length > 0 ? (
          caregivers.map((person) => (
            <div key={person.id} className="bg-white p-6 rounded-3xl shadow-sm border border-blue-50 hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-primary font-bold text-xl border-2 border-white shadow-sm">
                  {person.avatar}
                </div>
                <button className="text-muted hover:text-primary transition-colors">
                  <FaEllipsisH />
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-navy">{person.name}</h3>
                <p className="text-muted font-medium">{person.relation}</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-muted">
                  <FaEnvelope className="text-primary" /> {person.email}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted">
                  <FaShieldAlt className="text-primary" /> {person.role} Access
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  person.status === 'Active' ? 'bg-green-100 text-success' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {person.status}
                </span>
                <button 
                  onClick={() => handleManagePermissions(person.name)}
                  className="text-sm font-bold text-primary hover:underline"
                >
                  Manage Permissions
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-muted">
            No caregivers added yet.
          </div>
        )}

        {/* Add New Placeholder */}
        <button 
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-blue-50/50 border-2 border-dashed border-blue-200 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 hover:bg-blue-50 transition-colors group min-h-[250px]"
        >
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-blue-300 group-hover:text-primary group-hover:scale-110 transition-all shadow-sm">
            <FaPlus className="text-2xl" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-navy group-hover:text-primary transition-colors">Invite New Caregiver</h3>
            <p className="text-muted text-sm">Grant access to a family member</p>
          </div>
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-white p-6 rounded-2xl border border-blue-100 flex items-start gap-4">
        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-primary shrink-0">
          <FaUserFriends />
        </div>
        <div>
          <h4 className="font-bold text-navy mb-1">About Caregiver Access</h4>
          <p className="text-sm text-muted">
            Caregivers can view your adherence history and receive alerts if you miss a dose. 
            You can revoke access at any time. Admin access allows them to modify your medication schedule.
          </p>
        </div>
      </div>
    </div>
  );
};
export default Caregiver;
