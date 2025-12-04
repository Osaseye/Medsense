import { FaPills, FaPlus, FaSearch, FaFilter, FaEllipsisV, FaPrescriptionBottleAlt, FaTrash, FaPen } from 'react-icons/fa';
import { useState } from 'react';
import Modal from '../components/Modal';
import { useMedication } from '../context/MedicationContext';

const Medications = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedMed, setSelectedMed] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const { medications, addMedication, deleteMedication, updateMedication } = useMedication();

  const [newMed, setNewMed] = useState({
    name: '',
    dosage: '',
    type: 'Tablet',
    instructions: ''
  });

  const filteredMedications = medications.filter(med => 
    med.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMed(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddMedication = (e) => {
    e.preventDefault();
    const medicationData = {
      name: newMed.name,
      dosage: newMed.dosage,
      type: newMed.type,
      frequency: 'Daily', // Default for now
      instructions: newMed.instructions,
      refills: 1,
      remaining: 30,
      total: 30,
    };
    
    if (isEditMode && editId) {
      updateMedication(editId, medicationData);
    } else {
      addMedication(medicationData);
    }
    
    setIsAddModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewMed({ name: '', dosage: '', type: 'Tablet', instructions: '' });
    setIsEditMode(false);
    setEditId(null);
  };

  const handleViewMedication = (med) => {
    setSelectedMed(med);
    setIsViewModalOpen(true);
  };

  const handleEditMedication = () => {
    if (selectedMed) {
      setNewMed({
        name: selectedMed.name,
        dosage: selectedMed.dosage,
        type: selectedMed.type,
        instructions: selectedMed.instructions || ''
      });
      setEditId(selectedMed.id);
      setIsEditMode(true);
      setIsViewModalOpen(false);
      setIsAddModalOpen(true);
    }
  };

  const handleDeleteMedication = () => {
    if (selectedMed) {
      deleteMedication(selectedMed.id);
      setIsViewModalOpen(false);
      setSelectedMed(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-navy">Medications</h1>
          <p className="text-muted text-lg">Manage your active prescriptions and supplements.</p>
        </div>
        <button 
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-primary/30 flex items-center gap-2 hover:-translate-y-1"
        >
          <FaPlus /> Add New Medication
        </button>
      </div>

      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title={isEditMode ? "Edit Medication" : "Add New Medication"}
      >
        <form className="space-y-4" onSubmit={handleAddMedication}>
          <div>
            <label className="block text-sm font-bold text-navy mb-1">Medication Name</label>
            <input 
              type="text" 
              name="name"
              value={newMed.name}
              onChange={handleInputChange}
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
                name="dosage"
                value={newMed.dosage}
                onChange={handleInputChange}
                className="w-full p-3 rounded-xl border border-blue-100 focus:border-primary outline-none" 
                placeholder="e.g. 500mg" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-navy mb-1">Type</label>
              <select 
                name="type"
                value={newMed.type}
                onChange={handleInputChange}
                className="w-full p-3 rounded-xl border border-blue-100 focus:border-primary outline-none"
              >
                <option>Tablet</option>
                <option>Capsule</option>
                <option>Liquid</option>
                <option>Injection</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-navy mb-1">Instructions</label>
            <textarea 
              name="instructions"
              value={newMed.instructions}
              onChange={handleInputChange}
              className="w-full p-3 rounded-xl border border-blue-100 focus:border-primary outline-none" 
              rows="3" 
              placeholder="e.g. Take with food..."
            ></textarea>
          </div>
          <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors">
            {isEditMode ? "Update Medication" : "Save Medication"}
          </button>
        </form>
      </Modal>

      {/* View/Edit Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Medication Details"
      >
        {selectedMed && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-16 h-16 rounded-2xl ${selectedMed.color} flex items-center justify-center text-3xl shadow-inner`}>
                <FaPills />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-navy">{selectedMed.name}</h3>
                <p className="text-primary font-medium">{selectedMed.dosage} • {selectedMed.type}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-blue-50 p-3 rounded-xl">
                <span className="block text-muted text-xs font-bold uppercase mb-1">Frequency</span>
                <span className="font-bold text-navy">{selectedMed.frequency}</span>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl">
                <span className="block text-muted text-xs font-bold uppercase mb-1">Refills</span>
                <span className="font-bold text-navy">{selectedMed.refills} remaining</span>
              </div>
            </div>

            <div>
              <span className="block text-muted text-xs font-bold uppercase mb-1">Instructions</span>
              <p className="text-navy bg-gray-50 p-3 rounded-xl border border-gray-100">{selectedMed.instructions}</p>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button 
                onClick={handleEditMedication}
                className="flex-1 py-3 rounded-xl border border-blue-100 text-primary font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
              >
                <FaPen /> Edit
              </button>
              <button 
                onClick={handleDeleteMedication}
                className="flex-1 py-3 rounded-xl border border-red-100 text-error font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <FaTrash /> Delete
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input 
            type="text" 
            placeholder="Search medications..." 
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-blue-100 focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="px-6 py-3 rounded-xl border border-blue-100 text-navy font-bold hover:bg-blue-50 transition-colors flex items-center gap-2">
          <FaFilter /> Filter
        </button>
      </div>

      {/* Medications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMedications.map((med) => (
          <div 
            key={med.id} 
            onClick={() => handleViewMedication(med)}
            className="bg-white p-6 rounded-3xl shadow-sm border border-blue-50 hover:shadow-md transition-all group cursor-pointer"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`w-14 h-14 rounded-2xl ${med.color} flex items-center justify-center text-2xl shadow-inner`}>
                <FaPills />
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewMedication(med);
                }}
                className="text-muted hover:text-primary transition-colors p-2"
              >
                <FaEllipsisV />
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-navy mb-1">{med.name}</h3>
              <p className="text-primary font-medium">{med.dosage} • {med.type}</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-muted">
                <span className="font-bold text-navy">Frequency:</span> {med.frequency}
              </div>
              <div className="flex items-center gap-3 text-sm text-muted">
                <span className="font-bold text-navy">Instructions:</span> {med.instructions}
              </div>
            </div>

            <div className="bg-blue-50/50 rounded-xl p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-bold text-navy flex items-center gap-2">
                  <FaPrescriptionBottleAlt className="text-primary" /> Supply
                </span>
                <span className={`${med.remaining < 10 ? 'text-error' : 'text-success'} font-bold`}>
                  {med.remaining} left
                </span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ${med.remaining < 10 ? 'bg-error' : 'bg-primary'}`}
                  style={{ width: `${(med.remaining / med.total) * 100}%` }}
                ></div>
              </div>
              <div className="mt-2 text-xs text-muted text-right">
                {med.refills} refills remaining
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Medications;
