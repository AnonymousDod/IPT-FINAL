require('rootpath')();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorHandler = require('_middleware/error-handler');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// Updated CORS configuration to explicitly allow frontend domains
app.use(cors({
  origin: ['https://ipt-final-e2bdf.web.app', 'http://localhost:4200'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Add a simple test endpoint
app.get('/', (req, res) => {
  res.json({ message: 'API is working!' });
});

// api routes
app.use('/accounts', require('./accounts/accounts.controller'));
app.use('/employees', require('./employees/index'));
app.use('/departments', require('./departments/index'));
app.use('/requests', require('./requests/index'));
app.use('/workflows', require('./workflows/index'));

// swagger docs route - temporarily commented out
app.use('/api-docs', require('_helpers/swagger'));

// global error handler
app.use(errorHandler);

// start server
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
app.listen(port, () => console.log('Server listening on port ' + port));