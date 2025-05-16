// Simple fallback server that redirects to backend/server.js
console.log('Starting from root server.js...');
console.log('Current directory:', process.cwd());
console.log('Attempting to load backend/server.js');

try {
  // Try to load the actual server
  require('./backend/server.js');
} catch (error) {
  console.error('Error loading backend/server.js:', error);
  
  // If the main server fails, start a simple express server
  const express = require('express');
  const app = express();
  const port = process.env.PORT || 3000;
  
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Fallback server running. Main server failed to start.',
      error: error.message,
      stack: error.stack
    });
  });
  
  app.listen(port, () => {
    console.log(`Fallback server listening on port ${port}`);
  });
} 