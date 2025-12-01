import { FaUserFriends, FaUserPlus, FaShieldAlt, FaEnvelope, FaEllipsisH, FaPlus } from 'react-icons/fa';
import { useState } from 'react';
import Modal from '../components/Modal';
import { useNotification } from '../context/NotificationContext';

const Caregiver = () => {
  const { success, info } = useNotification();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    relation: '',
    role: 'Viewer'
  });

  const [caregivers, setCaregivers] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      relation: 'Daughter',
      email: 'sarah.j@example.com',
      role: 'Admin',
      status: 'Active',
      avatar: 'SJ'
    },
    {
      id: 2,
      name: 'Dr. James Wilson',
      relation: 'Doctor',
      email: 'dr.wilson@clinic.com',
      role: 'Viewer',
      status: 'Pending',
      avatar: 'JW'
    }
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInviteForm(prev => ({ ...prev, [name]: value }));
  };

  const handleInvite = (e) => {
    e.preventDefault();
    const newCaregiver = {
      id: Date.now(),
      name: inviteForm.name,
      relation: inviteForm.relation,
      email: inviteForm.email,
      role: inviteForm.role,
      status: 'Pending',
      avatar: inviteForm.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    };
    setCaregivers([...caregivers, newCaregiver]);
    success(`Invitation sent to ${inviteForm.email}`);
    setIsInviteModalOpen(false);
    setInviteForm({ name: '', email: '', relation: '', role: 'Viewer' });
  };

  const handleManagePermissions = (name) => {
    info(`Managing permissions for ${name}`);
  };

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
        title="Invite Caregiver"
      >
        <form className="space-y-4" onSubmit={handleInvite}>
          <div>
            <label className="block text-sm font-bold text-navy mb-1">Name</label>
            <input 
              type="text" 
              name="name"
              value={inviteForm.name}
              onChange={handleInputChange}
              className="w-full p-3 rounded-xl border border-blue-100 focus:border-primary outline-none" 
              placeholder="e.g. John Doe" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-navy mb-1">Email</label>
            <input 
              type="email" 
              name="email"
              value={inviteForm.email}
              onChange={handleInputChange}
              className="w-full p-3 rounded-xl border border-blue-100 focus:border-primary outline-none" 
              placeholder="e.g. john@example.com" 
              required 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-navy mb-1">Relation</label>
              <input 
                type="text" 
                name="relation"
                value={inviteForm.relation}
                onChange={handleInputChange}
                className="w-full p-3 rounded-xl border border-blue-100 focus:border-primary outline-none" 
                placeholder="e.g. Doctor" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-navy mb-1">Role</label>
              <select 
                name="role"
                value={inviteForm.role}
                onChange={handleInputChange}
                className="w-full p-3 rounded-xl border border-blue-100 focus:border-primary outline-none"
              >
                <option>Viewer</option>
                <option>Admin</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors">
            Send Invitation
          </button>
        </form>
      </Modal>

      {/* Caregivers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {caregivers.map((person) => (
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
        ))}

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
