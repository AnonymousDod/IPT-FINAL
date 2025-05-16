// This is a root-level entry point for Render
console.log('Starting from root index.js...');
// Redirect to the server in the backend folder
require('./backend/server.js');

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable JSON body parsing
app.use(express.json());

// Simple health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Proxy to the actual backend
app.use('/api', (req, res) => {
  res.json({
    message: 'Backend API proxy placeholder',
    endpoint: req.path,
    method: req.method
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 