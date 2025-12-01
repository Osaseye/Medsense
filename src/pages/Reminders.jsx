import { FaBell, FaClock, FaPlus, FaTrash, FaPen } from 'react-icons/fa';
import { useState } from 'react';
import Modal from '../components/Modal';
import { useNotification } from '../context/NotificationContext';
import { useMedication } from '../context/MedicationContext';
import { useReminder } from '../context/ReminderContext';

const Reminders = () => {
  const { success } = useNotification();
  const { medications } = useMedication();
  const { reminders, addReminder, updateReminder, deleteReminder, toggleReminder } = useReminder();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [newReminder, setNewReminder] = useState({
    time: '',
    label: '',
    date: '', // Optional specific date
    selectedMedicationId: ''
  });

  const handleDeleteReminder = (id) => {
    deleteReminder(id);
    success('Reminder deleted');
  };

  const handleEditReminder = (reminder) => {
    setIsEditMode(true);
    setEditingId(reminder.id);
    // For simplicity, we'll just take the first medication if multiple, or empty
    // In a real app, we'd handle multi-select properly
    const medName = reminder.medications[0];
    const med = medications.find(m => m.name === medName);
    
    setNewReminder({
      time: reminder.time,
      label: reminder.label,
      date: reminder.date || '',
      selectedMedicationId: med ? med.id : ''
    });
    setIsAddModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReminder(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveReminder = (e) => {
    e.preventDefault();
    const selectedMed = medications.find(m => m.id.toString() === newReminder.selectedMedicationId.toString());
    const medName = selectedMed ? selectedMed.name : 'Unknown Med';

    const reminderData = {
      time: newReminder.time,
      label: newReminder.label,
      date: newReminder.date || null, // Save date if present
      medications: [medName]
    };

    if (isEditMode) {
      updateReminder(editingId, reminderData);
      success('Reminder updated!');
    } else {
      addReminder(reminderData);
      success('New reminder set!');
    }
    
    setIsAddModalOpen(false);
    setIsEditMode(false);
    setEditingId(null);
    setNewReminder({ time: '', label: '', date: '', selectedMedicationId: '' });
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setNewReminder({ time: '', label: '', date: '', selectedMedicationId: '' });
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-navy">Reminders</h1>
          <p className="text-muted text-lg">Customize when you receive medication alerts.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-primary/30 flex items-center gap-2 hover:-translate-y-1"
        >
          <FaPlus /> New Reminder
        </button>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={isEditMode ? "Edit Reminder" : "Set New Reminder"}
      >
        <form className="space-y-4" onSubmit={handleSaveReminder}>
          <div>
            <label className="block text-sm font-bold text-navy mb-1">Time</label>
            <input 
              type="time" 
              name="time"
              value={newReminder.time}
              onChange={handleInputChange}
              className="w-full p-3 rounded-xl border border-blue-100 focus:border-primary outline-none" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-navy mb-1">Date (Optional)</label>
            <input 
              type="date" 
              name="date"
              value={newReminder.date}
              onChange={handleInputChange}
              className="w-full p-3 rounded-xl border border-blue-100 focus:border-primary outline-none" 
            />
            <p className="text-xs text-muted mt-1">Leave blank for daily reminder</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-navy mb-1">Label</label>
            <input 
              type="text" 
              name="label"
              value={newReminder.label}
              onChange={handleInputChange}
              className="w-full p-3 rounded-xl border border-blue-100 focus:border-primary outline-none" 
              placeholder="e.g. Morning Meds" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-navy mb-1">Medication</label>
            <select
              name="selectedMedicationId"
              value={newReminder.selectedMedicationId}
              onChange={handleInputChange}
              className="w-full p-3 rounded-xl border border-blue-100 focus:border-primary outline-none"
              required
            >
              <option value="">Select a medication</option>
              {medications.map(med => (
                <option key={med.id} value={med.id}>{med.name} ({med.dosage})</option>
              ))}
            </select>
            <p className="text-xs text-muted mt-1">Only medications from your list can be selected.</p>
          </div>
          <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors">
            {isEditMode ? "Update Reminder" : "Create Reminder"}
          </button>
        </form>
      </Modal>

      {/* Reminders List */}
      <div className="space-y-4">
        {reminders.map((reminder) => (
          <div key={reminder.id} className={`bg-white p-6 rounded-3xl shadow-sm border transition-all ${reminder.active ? 'border-blue-50 opacity-100' : 'border-gray-100 opacity-75'}`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${reminder.active ? 'bg-blue-50' : 'bg-gray-50 grayscale'}`}>
                  <FaClock />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold text-navy">{reminder.time}</h3>
                    <span className="text-sm font-bold text-muted bg-gray-100 px-2 py-0.5 rounded-md">{reminder.label}</span>
                    {reminder.date && (
                      <span className="text-xs font-bold text-primary bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        {new Date(reminder.date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-muted font-medium flex items-center gap-2">
                    <FaBell className="text-xs" />
                    {reminder.medications.join(', ')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                <div className="flex items-center gap-2 mr-4">
                  <span className={`text-sm font-bold ${reminder.active ? 'text-success' : 'text-muted'}`}>
                    {reminder.active ? 'Active' : 'Paused'}
                  </span>
                  <button 
                    onClick={() => toggleReminder(reminder.id)}
                    className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${reminder.active ? 'bg-success' : 'bg-gray-200'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${reminder.active ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
                </div>
                
                <div className="flex gap-2 border-l border-gray-100 pl-4">
                  <button 
                    onClick={() => handleEditReminder(reminder)}
                    className="p-2 text-muted hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <FaPen />
                  </button>
                  <button 
                    onClick={() => handleDeleteReminder(reminder.id)}
                    className="p-2 text-muted hover:text-error hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Settings Hint */}
      <div className="bg-blue-50 rounded-2xl p-6 flex items-start gap-4">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary shrink-0 shadow-sm">
          <FaClock />
        </div>
        <div>
          <h4 className="font-bold text-navy mb-1">Smart Scheduling</h4>
          <p className="text-sm text-muted">MedSense automatically adjusts reminder times based on your timezone and daylight savings changes. You can customize this in Settings.</p>
        </div>
      </div>
    </div>
  );
};
export default Reminders;
