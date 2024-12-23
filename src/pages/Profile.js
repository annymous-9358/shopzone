import React, { useEffect, useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';
import { Button } from '../components/ui/Button';

const Profile = () => {
  useAuthStore();
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({ street: '', city: '', state: '', zipCode: '', country: '', isDefault: false });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/api/users/profile');
        console.log('Profile response:', response.data);
        setProfile(response.data);
        setFormData({
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone || '',
        });
        setAddresses(response.data.addresses || []);
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile');
      }
    };

    fetchProfile();
  }, []);

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handleProfileUpdate = async () => {
    try {
      const response = await api.put('/api/users/profile', formData);
      console.log('Profile updated:', response.data);
      setProfile(response.data);
      setEditMode(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile');
    }
  };

  const handleAddressAdd = async () => {
    try {
      const response = await api.post('/api/users/profile/address', newAddress);
      console.log('Address added:', response.data);
      setAddresses(response.data.addresses || []);
      setNewAddress({ street: '', city: '', state: '', zipCode: '', country: '', isDefault: false });
    } catch (err) {
      console.error('Failed to add address:', err);
      setError('Failed to add address');
    }
  };

  const handleAddressDelete = async (index) => {
    try {
      const updatedAddresses = addresses.filter((_, i) => i !== index);
      const response = await api.put('/api/users/profile', { ...profile, addresses: updatedAddresses });
      console.log('Address deleted:', response.data);
      setAddresses(updatedAddresses);
    } catch (err) {
      console.error('Failed to delete address:', err);
      setError('Failed to delete address');
    }
  };

  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;
  if (!profile) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      <div className="bg-white p-4 shadow-md rounded-md">
        {editMode ? (
          <>
            <div>
              <label>Name:</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label>Email:</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label>Phone:</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="border p-2 rounded w-full"
              />
            </div>
            <Button onClick={handleProfileUpdate} className="mt-4">Save</Button>
          </>
        ) : (
          <>
            <p><strong>Name:</strong> {profile.name}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Phone:</strong> {profile.phone || 'N/A'}</p>
            <Button onClick={handleEditToggle} className="mt-4">Edit</Button>
          </>
        )}
      </div>

      <h3 className="text-xl font-bold mt-8 mb-4">Addresses</h3>
      <div className="space-y-4">
        {(Array.isArray(addresses) ? addresses : []).map((address, index) => (
          address ? (
            <div key={index} className="bg-white p-4 shadow-md rounded-md">
              <p>{address.street}, {address.city}, {address.state}, {address.zipCode}, {address.country}</p>
              <p><strong>Default:</strong> {address.isDefault ? 'Yes' : 'No'}</p>
              <Button onClick={() => handleAddressDelete(index)} className="mt-2">Delete</Button>
            </div>
          ) : null
        ))}
      </div>

      <h3 className="text-xl font-bold mt-8 mb-4">Add New Address</h3>
      <div className="bg-white p-4 shadow-md rounded-md">
        <div>
          <label>Street:</label>
          <input
            type="text"
            value={newAddress.street}
            onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label>City:</label>
          <input
            type="text"
            value={newAddress.city}
            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label>State:</label>
          <input
            type="text"
            value={newAddress.state}
            onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label>Zip Code:</label>
          <input
            type="text"
            value={newAddress.zipCode}
            onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label>Country:</label>
          <input
            type="text"
            value={newAddress.country}
            onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label>Default:</label>
          <input
            type="checkbox"
            checked={newAddress.isDefault}
            onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
          />
        </div>
        <Button onClick={handleAddressAdd} className="mt-4">Add Address</Button>
      </div>
    </div>
  );
};

export default Profile;
