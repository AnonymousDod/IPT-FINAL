module.exports = errorHandler;

function errorHandler(err, req, res, next) {
    // Enhanced error logging with request details
    console.error('GLOBAL ERROR HANDLER:', {
        error: err,
        method: req.method,
        url: req.originalUrl,
        body: req.body,
        headers: req.headers
    });

    switch (true) {
        case typeof err === 'string':
            // custom application error
            const is404 = err.toLowerCase().endsWith('not found');
            const statusCode = is404 ? 404 : 400;
            return res.status(statusCode).json({ message: err });
        case err.name === 'UnauthorizedError':
            // jwt authentication error
            return res.status(401).json({ message: 'Unauthorized' });
        case err.name === 'ValidationError':
            // mongoose validation error
            return res.status(400).json({ message: err.message });
        case err.name === 'SequelizeValidationError':
            // sequelize validation error
            return res.status(400).json({ message: err.errors.map(e => e.message).join(', ') });
        default:
            return res.status(500).json({ message: err.message || 'An unknown error occurred' });
    }
}