import React, { useState } from 'react';
import { signUp, confirmSignUp } from '@aws-amplify/auth';
import { useNavigate } from 'react-router-dom';

// ✅ Import toast
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [stage, setStage] = useState('signup');
  const navigate = useNavigate();

  const handleSignUp = async () => {
    try {
      await signUp({
        username,
        password,
        options: { userAttributes: { email } },
      });
      toast.success('✅ Signup successful! Check your email for the code.');
      setStage('confirm');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(`❌ Signup failed: ${error.message}`);
    }
  };

  const handleConfirmSignUp = async () => {
    try {
      await confirmSignUp({ username, confirmationCode });
      toast.success('✅ Confirmation successful! Please login.');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error) {
      console.error('Confirmation error:', error);
      toast.error(`❌ Confirmation failed: ${error.message}`);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      {stage === 'signup' ? (
        <div>
          <h2>Sign Up</h2>
          <input
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{ width: '100%', marginBottom: 10, padding: 8 }}
          />
          <input
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', marginBottom: 10, padding: 8 }}
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', marginBottom: 10, padding: 8 }}
          />
          <button onClick={handleSignUp} style={{ padding: '8px 16px' }}>
            Sign Up
          </button>
        </div>
      ) : (
        <div>
          <h2>Confirm Sign Up</h2>
          <input
            placeholder="Confirmation Code"
            value={confirmationCode}
            onChange={e => setConfirmationCode(e.target.value)}
            style={{ width: '100%', marginBottom: 10, padding: 8 }}
          />
          <button onClick={handleConfirmSignUp} style={{ padding: '8px 16px' }}>
            Confirm
          </button>
        </div>
      )}

      {/* ✅ Toast container */}
      <ToastContainer position="bottom-right" autoClose={2000} />
    </div>
  );
}

export default Signup;
