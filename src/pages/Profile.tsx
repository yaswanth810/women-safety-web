import { useState, useEffect } from 'react';
import { User, Phone, Mail, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export const Profile = () => {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);
  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhoneNumber(user.phone_number || '');
      if (Array.isArray(user.emergency_contacts)) {
        setEmergencyContacts(user.emergency_contacts);
      }
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const result = await updateProfile({
        full_name: fullName,
        phone_number: phoneNumber,
        emergency_contacts: emergencyContacts
      });

      if (result.success) {
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = () => {
    if (!newContact.name || !newContact.email) {
      alert('Please fill in at least name and email');
      return;
    }

    setEmergencyContacts([...emergencyContacts, newContact]);
    setNewContact({ name: '', email: '', phone: '' });
  };

  const handleRemoveContact = (index: number) => {
    setEmergencyContacts(emergencyContacts.filter((_, i) => i !== index));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4">
        <div className="text-center">
          <User size={48} className="text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Please Login</h1>
          <p className="text-gray-600 mb-4">You need to be logged in to view your profile.</p>
          <a href="/login" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Login Now
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Profile</h1>
        <p className="text-xl text-gray-600 mb-12">Manage your account information and emergency contacts</p>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg border border-green-300">
            {successMessage}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <User size={24} />
            Account Information
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 capitalize">
                {user?.role}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Emergency Contacts */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Phone size={24} />
            Emergency Contacts
          </h3>

          {emergencyContacts.length > 0 && (
            <div className="mb-8 space-y-3">
              {emergencyContacts.map((contact, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{contact.name}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <Mail size={16} />
                      {contact.email}
                    </p>
                    {contact.phone && (
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <Phone size={16} />
                        {contact.phone}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveContact(idx)}
                    className="text-red-600 hover:text-red-700 flex-shrink-0"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Add Emergency Contact</h4>
            <div className="space-y-3 mb-4">
              <input
                type="text"
                placeholder="Contact name"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="email"
                placeholder="Contact email"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="tel"
                placeholder="Contact phone (optional)"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleAddContact}
                className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Add Contact
              </button>
            </div>
          </div>

          <button
            onClick={handleUpdateProfile}
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 mt-6"
          >
            {loading ? 'Saving...' : 'Save Emergency Contacts'}
          </button>
        </div>
      </div>
    </div>
  );
};
