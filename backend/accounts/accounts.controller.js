const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const accountService = require('./account.service');

const authorize = require("../_middleware/authorize");

const Role = require("../_helpers/role");



// Authentication and account management endpoints
router.post('/authenticate', authenticateSchema, authenticate);
router.post('/register', registerSchema, register);
router.post('/verify-email', verifyEmailSchema, verifyEmail);
router.post('/refresh-token', refreshTokenSchema, refreshToken);
router.post('/revoke-token', authorize(), revokeTokenSchema, revokeToken);
router.post('/forgot-password', forgotPasswordSchema, forgotPassword);
router.post('/validate-reset-token', validateResetTokenSchema, validateResetToken);
router.post('/reset-password', resetPasswordSchema, resetPassword);
router.get('/', getAll);
router.get('/:id', authorize(), getById);
router.post('/', authorize(Role.Admin), createSchema, create);
router.put('/:id', updateSchema, update);
router.delete('/:id', authorize(), _delete);

module.exports = router;

// Validates login credentials format
function authenticateSchema(req, res, next) {
    const schema = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

// Handles user authentication and returns JWT token
function authenticate(req, res, next) {
    const { email, password } = req.body;
    const ipAddress = req.ip;
    accountService.authenticate({ email, password, ipAddress })
        .then(({ refreshToken, ...account }) => {
            setTokenCookie(res, refreshToken);
            res.json(account);
        })
        .catch(next);
}

// Validates new user registration data
function registerSchema(req, res, next) {
    const schema = Joi.object({
        title: Joi.string().required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
        acceptTerms: Joi.boolean().valid(true).required()
    });
    validateRequest(req, next, schema);
}

// Creates new user account and sends verification email
function register(req, res, next) {
    accountService.register(req.body, req.get('origin'))
        .then(() => res.json({ message: 'Registration successful, please check your email for verification instructions' }))
        .catch(next);
}

// Validates email verification token format
function verifyEmailSchema(req, res, next) {
    const schema = Joi.object({
        token: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

// Verifies user's email address using token
function verifyEmail(req, res, next) {
    accountService.verifyEmail(req.body)
        .then(() => res.json({ message: 'Verification successful, you can now login' }))
        .catch(next);
}

// Validates email format for password reset request
function forgotPasswordSchema(req, res, next) {
    const schema = Joi.object({
      email: Joi.string().email().required()
    });
    validateRequest(req, next, schema);
}

// Validates refresh token format
function refreshTokenSchema(req, res, next) {
    const schema = Joi.object({
        token: Joi.string().empty('')
    });
    validateRequest(req, next, schema);
}

// Refreshes JWT token using refresh token
function refreshToken(req, res, next) {
    const token = req.cookies.refreshToken;
    const ipAddress = req.ip;
    accountService.refreshToken({ token, ipAddress })
        .then(({ refreshToken, ...account }) => {
            setTokenCookie(res, refreshToken);
            res.json(account);
        })
        .catch(next);
}

// Validates token format for revocation
function revokeTokenSchema(req, res, next) {
    const schema = Joi.object({
        token: Joi.string().empty('')
    });
    validateRequest(req, next, schema);
}

// Revokes refresh token with authorization check
function revokeToken(req, res, next) {
    const token = req.body.token || req.cookies.refreshToken;
    const ipAddress = req.ip;

    if (!token) return res.status(400).json({ message: 'Token is required' });

    if (!req.ownsToken(token) && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    accountService.revokeToken({ token, ipAddress })
        .then(() => res.json({ message: 'Token revoked' }))
        .catch(next);
}

// Initiates password reset process and sends reset email
function forgotPassword(req, res, next) {
    accountService.forgotPassword(req.body, req.get('origin'))
      .then(() => res.json({ message: 'Please check your email for password reset instructions' }))
      .catch(next);
}

// Validates password reset token format
function validateResetTokenSchema(req, res, next) {
    const schema = Joi.object({
      token: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

// Checks if password reset token is valid
function validateResetToken(req, res, next) {
    accountService.validateResetToken(req.body)
      .then(() => res.json({ message: 'Token is valid' }))
      .catch(next);
}

// Validates new password format for reset
function resetPasswordSchema(req, res, next) {
    const schema = Joi.object({
      token: Joi.string().required(),
      password: Joi.string().min(6).required(),
      confirmPassword: Joi.string().valid(Joi.ref('password')).required()
    });
    validateRequest(req, next, schema);
}

// Updates user password using reset token
function resetPassword(req, res, next) {
    accountService.resetPassword(req.body)
      .then(() => res.json({ message: 'Password reset successful, you can now login' }))
      .catch(next);
}

// Retrieves all user accounts (admin only)
function getAll(req, res, next) {
    accountService.getAll()
      .then(accounts => res.json(accounts))
      .catch(next);
}

// Retrieves specific user account with authorization check
function getById(req, res, next) {
    if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    accountService.getById(req.params.id)
      .then(account => account ? res.json(account) : res.sendStatus(404))
      .catch(next);
}

// Validates new account creation data (admin only)
function createSchema(req, res, next) {
    const schema = Joi.object({
      title: Joi.string().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
      role: Joi.string().valid(Role.Admin, Role.User).required(),
      status: Joi.string().valid('Active', 'Inactive').required()
    });
    validateRequest(req, next, schema);
}

// Creates new user account (admin only)
function create(req, res, next) {
    accountService.create(req.body)
      .then(account => res.json(account))
      .catch(next);
}

// Validates account update data with role-based rules
function updateSchema(req, res, next) {
    const schemaRules = {
      title: Joi.string().empty(''),
      firstName: Joi.string().empty(''),
      lastName: Joi.string().empty(''),
      email: Joi.string().email().empty(''),
      password: Joi.string().min(6).empty(''),
      confirmPassword: Joi.string().valid(Joi.ref('password')).empty(''),
      status: Joi.string().valid('Active', 'Inactive').empty(''),
      // Always allow role to be updated (no auth)
      role: Joi.string().valid('Admin', 'User').empty('')
    };

    const schema = Joi.object(schemaRules).with('password', 'confirmPassword');
    validateRequest(req, next, schema);
}

// Updates user account with authorization check
function update(req, res, next) {
    accountService.update(req.params.id, req.body)
      .then(account => res.json(account))
      .catch(error => {
        console.error('Update error:', error);
        next(error);
      });
}

// Deletes user account with authorization check
function _delete(req, res, next) {
    if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    accountService.delete(req.params.id)
      .then(() => res.json({ message: 'Account deleted successfully' }))
      .catch(next);
}

// Sets HTTP-only cookie with refresh token
function setTokenCookie(res, token) {
    const cookieOptions = {
      httpOnly: true,
      expires: new Date(Date.now() + 7*24*60*60*1000)
    };
    res.cookie('refreshToken', token, cookieOptions);
}
