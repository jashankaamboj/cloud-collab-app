import React, { useState } from 'react';
import { signUp, confirmSignUp } from '@aws-amplify/auth';

function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [stage, setStage] = useState('signup');

  const handleSignUp = async () => {
    try {
      await signUp({
        username,
        password,
        attributes: { email },
      });
      alert('Signup successful! Please check your email for confirmation code.');
      setStage('confirm');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleConfirmSignUp = async () => {
    try {
      await confirmSignUp(username, confirmationCode);
      alert('Confirmation successful! You can now login.');
      setStage('signup');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      {stage === 'signup' ? (
        <div>
          <h2>Sign Up</h2>
          <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
          <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          <button onClick={handleSignUp}>Sign Up</button>
        </div>
      ) : (
        <div>
          <h2>Confirm Sign Up</h2>
          <input
            placeholder="Confirmation Code"
            value={confirmationCode}
            onChange={e => setConfirmationCode(e.target.value)}
          />
          <button onClick={handleConfirmSignUp}>Confirm</button>
        </div>
      )}
    </div>
  );
}

export default Signup;
