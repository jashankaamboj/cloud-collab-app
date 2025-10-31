import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import awsExports from './aws-exports';
import App from './App';
import '@aws-amplify/ui-react/styles.css';

Amplify.configure(awsExports);

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Authenticator>
      {({ signOut, user }) => <App user={user} signOut={signOut} />}
    </Authenticator>
  </React.StrictMode>
);
