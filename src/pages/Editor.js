import React from 'react';
import { useParams } from 'react-router-dom';

function Editor() {
  const { id } = useParams(); // Document ID or "new"

  return (
    <div>
      <h2>Document Editor</h2>
      <p>Editing document ID: {id}</p>
      {/* TODO: Add real-time editor here */}
    </div>
  );
}

export default Editor;
