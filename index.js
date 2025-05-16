// This is a root-level entry point for Render
console.log('Starting from root index.js...');
// Redirect to the server in the backend folder
require('./backend/server.js');

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable JSON body parsing
app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Simple health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// TEST ENDPOINT: Mock login for testing when backend is unavailable
app.post('/accounts/authenticate', (req, res) => {
  const { email, password } = req.body;
  
  console.log('Login attempt:', { email, password });
  
  // Simple mock authentication - any email with @test.com and password "password"
  if (email && email.includes('@test.com') && password === 'password') {
    res.json({
      id: 1,
      email: email,
      firstName: 'Test',
      lastName: 'User',
      token: 'fake-jwt-token',
      role: 'User'
    });
  } else {
    // Simulate authentication failure
    res.status(400).json({ message: 'Email or password is incorrect' });
  }
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