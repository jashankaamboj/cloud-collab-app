import React, { useState, useEffect } from 'react';
import {
  getCurrentUser,
  fetchUserAttributes,
  updateUserAttributes,
  updatePassword,
} from '@aws-amplify/auth';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Profile() {
  const [user, setUser] = useState(null);
  const [attributes, setAttributes] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Password change states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const current = await getCurrentUser();
      setUser(current);

      // returns a map like { email: 'a@b.com', name: '...', phone_number: '...' }
      const attrs = await fetchUserAttributes();
      setAttributes(attrs || {});
    } catch (error) {
      console.error('Error fetching user/attributes', error);
      toast.error('Failed to load user info.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAttributes = async () => {
    setUpdating(true);
    try {
      // Only send keys we care about (email is read-only here)
      const payload = {};
      if (typeof attributes.name === 'string') payload.name = attributes.name;
      if (typeof attributes.phone_number === 'string') payload.phone_number = attributes.phone_number;

      await updateUserAttributes({
        userAttributes: payload,
      });

      toast.success('User attributes updated!');
    } catch (error) {
      console.error('Error updating attributes', error);
      toast.error('Failed to update attributes.');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      toast.warning('Please fill in both old and new password.');
      return;
    }
    try {
      await updatePassword({ oldPassword, newPassword });
      toast.success('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
    } catch (error) {
      console.error('Error changing password', error);
      toast.error('Failed to change password.');
    }
  };

  if (loading) return <p>Loading user info...</p>;

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h2>User Profile</h2>

      <div>
        <label>Email (readonly):</label><br />
        <input
          type="email"
          value={attributes.email || ''}
          disabled
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
        />
      </div>

      <div>
        <label>Name:</label><br />
        <input
          type="text"
          value={attributes.name || ''}
          onChange={e => setAttributes({ ...attributes, name: e.target.value })}
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
          disabled={updating}
        />
      </div>

      <div>
        <label>Phone Number:</label><br />
        <input
          type="tel"
          value={attributes.phone_number || ''}
          onChange={e => setAttributes({ ...attributes, phone_number: e.target.value })}
          placeholder="+1234567890"
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
          disabled={updating}
        />
      </div>

      <button onClick={handleUpdateAttributes} disabled={updating} style={{ padding: '8px 16px', fontSize: 16 }}>
        Update Profile
      </button>

      <hr style={{ margin: '20px 0' }} />

      <h3>Change Password</h3>

      <div>
        <label>Old Password:</label><br />
        <input
          type="password"
          value={oldPassword}
          onChange={e => setOldPassword(e.target.value)}
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
        />
      </div>

      <div>
        <label>New Password:</label><br />
        <input
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
        />
      </div>

      <button onClick={handleChangePassword} style={{ padding: '8px 16px', fontSize: 16 }}>
        Change Password
      </button>

      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}

export default Profile;
