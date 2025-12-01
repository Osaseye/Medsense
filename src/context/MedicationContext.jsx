import { createContext, useContext, useState, useEffect } from 'react';
import { useNotification } from './NotificationContext';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query } from 'firebase/firestore';

const MedicationContext = createContext();

export const useMedication = () => useContext(MedicationContext);

export const MedicationProvider = ({ children }) => {
  const { success, error } = useNotification();
  const { currentUser } = useAuth();
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setMedications([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'users', currentUser.uid, 'medications'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const meds = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMedications(meds);
      setLoading(false);
    }, (err) => {
      console.error(err);
      error('Failed to fetch medications');
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  const addMedication = async (med) => {
    if (!currentUser) return;
    try {
      await addDoc(collection(db, 'users', currentUser.uid, 'medications'), {
        ...med,
        createdAt: new Date().toISOString(),
        color: 'bg-blue-100 text-primary' // Default
      });
      success('Medication added successfully');
    } catch (err) {
      console.error(err);
      error('Failed to add medication');
    }
  };

  const updateMedication = async (id, updatedMed) => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, 'users', currentUser.uid, 'medications', id), updatedMed);
      success('Medication updated');
    } catch (err) {
      console.error(err);
      error('Failed to update medication');
    }
  };

  const deleteMedication = async (id) => {
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'medications', id));
      success('Medication deleted');
    } catch (err) {
      console.error(err);
      error('Failed to delete medication');
    }
  };

  return (
    <MedicationContext.Provider value={{ medications, addMedication, updateMedication, deleteMedication, loading }}>
      {children}
    </MedicationContext.Provider>
  );
};
