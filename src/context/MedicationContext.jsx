import { createContext, useContext, useState } from 'react';
import { useNotification } from './NotificationContext';

const MedicationContext = createContext();

export const useMedication = () => useContext(MedicationContext);

export const MedicationProvider = ({ children }) => {
  const { success } = useNotification();
  
  const [medications, setMedications] = useState([
    {
      id: 1,
      name: 'Amoxicillin',
      dosage: '500mg',
      type: 'Capsule',
      frequency: 'Twice daily',
      instructions: 'Take with food',
      refills: 2,
      remaining: 14,
      total: 30,
      color: 'bg-blue-100 text-primary'
    },
    {
      id: 2,
      name: 'Lisinopril',
      dosage: '10mg',
      type: 'Tablet',
      frequency: 'Once daily',
      instructions: 'Take in the morning',
      refills: 5,
      remaining: 25,
      total: 30,
      color: 'bg-indigo-100 text-indigo-600'
    },
    {
      id: 3,
      name: 'Vitamin D3',
      dosage: '2000 IU',
      type: 'Softgel',
      frequency: 'Once daily',
      instructions: 'Take with a meal',
      refills: 0,
      remaining: 5,
      total: 90,
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      id: 4,
      name: 'Metformin',
      dosage: '500mg',
      type: 'Tablet',
      frequency: 'Twice daily',
      instructions: 'Take with evening meal',
      refills: 1,
      remaining: 45,
      total: 60,
      color: 'bg-green-100 text-green-600'
    }
  ]);

  const addMedication = (med) => {
    const newMed = {
      ...med,
      id: Date.now(),
      remaining: med.total || 30,
      color: 'bg-blue-100 text-primary' // Default color for now
    };
    setMedications([...medications, newMed]);
    success('Medication added successfully');
  };

  const updateMedication = (id, updatedMed) => {
    setMedications(medications.map(med => med.id === id ? { ...med, ...updatedMed } : med));
    success('Medication updated');
  };

  const deleteMedication = (id) => {
    setMedications(medications.filter(med => med.id !== id));
    success('Medication deleted');
  };

  return (
    <MedicationContext.Provider value={{ medications, addMedication, updateMedication, deleteMedication }}>
      {children}
    </MedicationContext.Provider>
  );
};
