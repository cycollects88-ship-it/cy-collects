import React from 'react';

const TestApp: React.FC = () => {
  console.log("TestApp - Rendering...");
  
  return (
    <div style={{ padding: '20px', backgroundColor: 'lightblue' }}>
      <h1>Test App - This should show if React is working</h1>
      <p>If you can see this, React is rendering correctly.</p>
    </div>
  );
};

export default TestApp;
