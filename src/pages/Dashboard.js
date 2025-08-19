import React, { useState } from 'react';
import { signOut } from '@aws-amplify/auth';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
// eslint-disable-next-line no-unused-vars
  const [documents, setDocuments] = useState([]); // Placeholder empty list
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/login';
    } catch (error) {
      alert('Error signing out: ' + error.message);
    }
  };

  const handleCreateDoc = () => {
    // Navigate to editor page for new document
    navigate('/editor/new');
  };

  return (
    <div>
      <h2>Your Documents</h2>
      {documents.length === 0 ? (
        <p>No documents yet.</p>
      ) : (
        <ul>
          {documents.map(doc => (
            <li key={doc.id}>{doc.title}</li>
          ))}
        </ul>
      )}
      <button onClick={handleCreateDoc}>Create New Document</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Dashboard;
