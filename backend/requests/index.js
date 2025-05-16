const express = require('express');
const router = express.Router();
const db = require('../_helpers/db');
const authorize = require('../_middleware/authorize');
const Role = require('../_helpers/role');

// Apply authorize middleware to routes that need it
router.post('/', authorize(), create);
router.get('/', authorize(), getAll);
router.get('/employee/:employeeId', authorize(), getByEmployeeId);
router.get('/:id', authorize(), getById);
router.put('/:id', authorize(), update);
router.delete('/:id', authorize(), _delete);

async function create(req, res, next) {
    try {
        console.log('Creating request with data:', JSON.stringify(req.body));
        
        // Check for required fields
        if (!req.body.type || !req.body.employeeId) {
            return res.status(400).json({ message: 'Type and employeeId are required' });
        }
        
        // Check if items exist and have required fields
        if (!req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
            return res.status(400).json({ message: 'At least one item is required' });
        }
        
        // Validate items
        for (const item of req.body.items) {
            if (!item.name) {
                return res.status(400).json({ message: 'All items must have a name' });
            }
            if (!item.quantity || item.quantity < 1) {
                return res.status(400).json({ message: 'All items must have a quantity greater than 0' });
            }
        }
        
        // Create the request
        const request = await db.Request.create({
            type: req.body.type,
            status: req.body.status || 'Pending',
            employeeId: req.body.employeeId,
            details: req.body.details || {}
        });
        
        // Create the request items
        const items = req.body.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            requestId: request.id
        }));
        
        await db.RequestItem.bulkCreate(items);
        
        // Create a workflow for the request
        await db.Workflow.create({
            employeeId: request.employeeId,
            type: 'Request',
            status: 'Pending',
            details: { requestId: request.id }
        });
        
        // Fetch the complete request with items to return
        const createdRequest = await db.Request.findByPk(request.id, {
            include: [{ model: db.RequestItem }]
        });
        
        res.status(201).json(createdRequest);
    } catch (err) { 
        console.error('Error creating request:', err);
        next(err); 
    }
}

async function getAll(req, res, next) {
    try {
        const requests = await db.Request.findAll({
            include: [{ model: db.RequestItem }, { model: db.Employee }]
        });
        res.json(requests);
    } catch (err) { next(err); }
}

async function getById(req, res, next) {
    try {
        const request = await db.Request.findByPk(req.params.id, {
            include: [{ model: db.RequestItem }, { model: db.Employee }]
        });
        
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }
        
        // Check if user has permission to access this request
        // Admin can access any request, users can only access their own
        const isAdmin = req.user && req.user.role === Role.Admin;
        
        // For regular users, check if they own the request by retrieving their employee record
        let isOwner = false;
        if (req.user) {
            const employee = await db.Employee.findOne({ where: { userId: req.user.id } });
            isOwner = employee && employee.id === request.employeeId;
        }
        
        if (!isAdmin && !isOwner) {
            return res.status(403).json({ message: 'Unauthorized access to this request' });
        }
        
        res.json(request);
    } catch (err) { 
        console.error('Error retrieving request:', err);
        next(err); 
    }
}

async function getByEmployeeId(req, res, next) {
    try {
        const requests = await db.Request.findAll({
            where: { employeeId: req.params.employeeId },
            include: [{ model: db.RequestItem }]
        });
        res.json(requests);
    } catch (err) { next(err); }
}

async function update(req, res, next) {
    try {
        const request = await db.Request.findByPk(req.params.id);
        if (!request) return res.status(404).json({ message: 'Request not found' });
        
        // Check if user has permission to update this request
        const isAdmin = req.user && req.user.role === Role.Admin;
        
        // For regular users, check if they own the request
        let isOwner = false;
        if (req.user) {
            const employee = await db.Employee.findOne({ where: { userId: req.user.id } });
            isOwner = employee && employee.id === request.employeeId;
        }
        
        if (!isAdmin && !isOwner) {
            return res.status(403).json({ message: 'Unauthorized access to modify this request' });
        }
        
        // Update request fields
        if (req.body.type) request.type = req.body.type;
        if (req.body.status) request.status = req.body.status;
        if (req.body.details) request.details = req.body.details;
        
        await request.save();
        
        // Update items if provided
        if (req.body.items && Array.isArray(req.body.items)) {
            // Delete existing items
            await db.RequestItem.destroy({ where: { requestId: request.id } });
            
            // Create new items
            const items = req.body.items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                requestId: request.id
            }));
            
            await db.RequestItem.bulkCreate(items);
        }
        
        // Fetch the updated request with items to return
        const updatedRequest = await db.Request.findByPk(request.id, {
            include: [{ model: db.RequestItem }]
        });
        
        res.json(updatedRequest);
    } catch (err) { 
        console.error('Error updating request:', err);
        next(err); 
    }
}

async function _delete(req, res, next) {
    try {
        const request = await db.Request.findByPk(req.params.id);
        if (!request) return res.status(404).json({ message: 'Request not found' });
        
        // Check if user has permission to delete this request
        const isAdmin = req.user && req.user.role === Role.Admin;
        
        // For regular users, check if they own the request
        let isOwner = false;
        if (req.user) {
            const employee = await db.Employee.findOne({ where: { userId: req.user.id } });
            isOwner = employee && employee.id === request.employeeId;
        }
        
        if (!isAdmin && !isOwner) {
            return res.status(403).json({ message: 'Unauthorized access to delete this request' });
        }
        
        // Delete associated items first
        await db.RequestItem.destroy({ where: { requestId: request.id } });
        
        // Then delete the request
        await request.destroy();
        
        res.json({ message: 'Request deleted successfully' });
    } catch (err) { 
        console.error('Error deleting request:', err);
        next(err); 
    }
}

module.exports = router; 