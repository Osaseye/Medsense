import { FaFilePrescription, FaUserMd, FaClinicMedical, FaPhone, FaPlus, FaDownload, FaTrash } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { useNotification } from '../context/NotificationContext';
import { useMedication } from '../context/MedicationContext';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase';

const Prescriptions = () => {
  const { success, info, error } = useNotification();
  const { medications } = useMedication();
  const { currentUser } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newRx, setNewRx] = useState({
    selectedMedicationId: '',
    rxNumber: '',
    doctor: '',
    pharmacy: '',
    refills: ''
  });

  useEffect(() => {
    if (!currentUser) return;

    const q = query(collection(db, "users", currentUser.uid, "prescriptions"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rxData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPrescriptions(rxData);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching prescriptions:", err);
      error("Failed to load prescriptions");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRx(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPrescription = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    
    const selectedMed = medications.find(m => m.id.toString() === newRx.selectedMedicationId.toString());
    const medName = selectedMed ? selectedMed.name : 'Unknown Med';

    try {
      const rxToAdd = {
        medication: medName,
        rxNumber: newRx.rxNumber,
        doctor: newRx.doctor,
        pharmacy: newRx.pharmacy,
        date: new Date().toLocaleDateString(),
        expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString(),
        status: 'Active',
        refills: parseInt(newRx.refills) || 0,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "users", currentUser.uid, "prescriptions"), rxToAdd);
      
      success('Prescription added successfully');
      setIsAddModalOpen(false);
      setNewRx({ selectedMedicationId: '', rxNumber: '', doctor: '', pharmacy: '', refills: '' });
    } catch (err) {
      console.error("Error adding prescription:", err);
      error("Failed to add prescription");
    }
  };

  const handleDeletePrescription = async (id) => {
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, "users", currentUser.uid, "prescriptions", id));
      success('Prescription deleted');
    } catch (err) {
      console.error("Error deleting prescription:", err);
      error("Failed to delete prescription");
    }
  };

  const handleCall = (pharmacy) => {
    info(`Calling ${pharmacy}...`);
  };

  const handleDownload = (rxNumber) => {
    info(`Downloading prescription ${rxNumber}...`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-navy">Prescriptions</h1>
          <p className="text-muted text-lg">Digital records of your doctor's prescriptions.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-primary/30 flex items-center gap-2 hover:-translate-y-1"
        >
          <FaPlus /> Add Prescription
        </button>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Prescription"
      >
        <form className="space-y-4" onSubmit={handleAddPrescription}>
          <div>
            <label className="block text-sm font-bold text-navy mb-1">Medication</label>
            <select
              name="selectedMedicationId"
              value={newRx.selectedMedicationId}
              onChange={handleInputChange}
              className="w-full p-3 rounded-xl border border-blue-100 focus:border-primary outline-none"
              required
            >
              <option value="">Select a medication</option>
              {medications.map(med => (
                <option key={med.id} value={med.id}>{med.name} ({med.dosage})</option>
              ))}
            </select>
            <p className="text-xs text-muted mt-1">Select from your added medications.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-navy mb-1">Rx Number</label>
              <input 
                type="text" 
                name="rxNumber"
                value={newRx.rxNumber}
                onChange={handleInputChange}
                className="w-full p-3 rounded-xl border border-blue-100 focus:border-primary outline-none" 
                placeholder="e.g. RX-123456" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-navy mb-1">Refills</label>
              <input 
                type="number" 
                name="refills"
                value={newRx.refills}
                onChange={handleInputChange}
                className="w-full p-3 rounded-xl border border-blue-100 focus:border-primary outline-none" 
                placeholder="e.g. 3" 
                required 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-navy mb-1">Doctor</label>
            <input 
              type="text" 
              name="doctor"
              value={newRx.doctor}
              onChange={handleInputChange}
              className="w-full p-3 rounded-xl border border-blue-100 focus:border-primary outline-none" 
              placeholder="e.g. Dr. Smith" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-navy mb-1">Pharmacy</label>
            <input 
              type="text" 
              name="pharmacy"
              value={newRx.pharmacy}
              onChange={handleInputChange}
              className="w-full p-3 rounded-xl border border-blue-100 focus:border-primary outline-none" 
              placeholder="e.g. CVS Pharmacy" 
              required 
            />
          </div>
          <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors">
            Save Prescription
          </button>
        </form>
      </Modal>

      {/* Prescriptions List */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <p className="text-center text-muted">Loading prescriptions...</p>
        ) : prescriptions.length > 0 ? (
          prescriptions.map((rx) => (
            <div key={rx.id} className="bg-white p-6 rounded-3xl shadow-sm border border-blue-50 hover:shadow-md transition-all">
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                
                {/* Main Info */}
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-primary text-2xl shadow-inner shrink-0">
                    <FaFilePrescription />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold text-navy">{rx.medication}</h3>
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                        rx.status === 'Active' ? 'bg-green-100 text-success' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {rx.status}
                      </span>
                    </div>
                    <p className="text-muted font-medium mb-4">Rx #: {rx.rxNumber}</p>
                    
                    <div className="flex flex-wrap gap-6 text-sm">
                      <div className="flex items-center gap-2 text-navy font-medium">
                        <FaUserMd className="text-primary" /> {rx.doctor}
                      </div>
                      <div className="flex items-center gap-2 text-navy font-medium">
                        <FaClinicMedical className="text-primary" /> {rx.pharmacy}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details & Actions */}
                <div className="flex flex-col justify-between items-end gap-4 border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6 min-w-[200px]">
                  <div className="text-right w-full lg:w-auto">
                    <p className="text-sm text-muted">Refills Remaining</p>
                    <p className="text-2xl font-bold text-navy">{rx.refills}</p>
                  </div>
                  
                  <div className="flex gap-3 w-full lg:w-auto">
                    <button 
                      onClick={() => handleCall(rx.pharmacy)}
                      className="flex-1 lg:flex-none px-4 py-2 rounded-lg border border-blue-100 text-primary font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaPhone /> Call
                    </button>
                    <button 
                      onClick={() => handleDownload(rx.rxNumber)}
                      className="flex-1 lg:flex-none px-4 py-2 rounded-lg bg-blue-50 text-primary font-bold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaDownload /> PDF
                    </button>
                    <button 
                      onClick={() => handleDeletePrescription(rx.id)}
                      className="flex-1 lg:flex-none px-4 py-2 rounded-lg border border-red-100 text-error font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted">
            No prescriptions added yet.
          </div>
        )}
      </div>
    </div>
  );
};
export default Prescriptions;
