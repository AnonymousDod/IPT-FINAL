const config = require('config.json');
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

module.exports = db = {};

initialize();

async function initialize() {
    const { host, port, user, password, database } = config.database;
    
    // First create the database if it doesn't exist
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    await connection.end();

    // Then create the Sequelize connection with all necessary parameters
    const sequelize = new Sequelize(database, user, password, {
        host,
        port,
        dialect: 'mysql',
        logging: false, // Set to console.log to see SQL queries
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    });

    // Test the connection
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        throw error;
    }

    db.Account = require('../accounts/account.model')(sequelize);
    db.RefreshToken = require('../accounts/refresh-token.model')(sequelize);
    

    // New models
    db.Employee = require('../employees/employee.model')(sequelize);
    db.Department = require('../departments/department.model')(sequelize);
    db.Request = require('../requests/request.model')(sequelize);
    db.RequestItem = require('../requests/request-item.model')(sequelize);
    db.Workflow = require('../workflows/workflow.model')(sequelize);
    

    // Associations
    db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
    db.RefreshToken.belongsTo(db.Account);

    db.Employee.belongsTo(db.Account, { foreignKey: 'userId', as: 'user' });
    db.Employee.belongsTo(db.Department, { foreignKey: 'departmentId' });
    db.Department.hasMany(db.Employee, { foreignKey: 'departmentId' });

    db.Request.belongsTo(db.Employee, { foreignKey: 'employeeId' });
    db.Request.hasMany(db.RequestItem, { foreignKey: 'requestId' });
    db.RequestItem.belongsTo(db.Request, { foreignKey: 'requestId' });

    db.Workflow.belongsTo(db.Employee, { foreignKey: 'employeeId' });

    await sequelize.sync({ alter: true });
}