const config = require('config.json');
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

module.exports = db = {};

initialize();

async function initialize() {
    // Use environment variables if available, otherwise use config.json
    const dbConfig = {
        host: process.env.DB_HOST || config.database.host,
        port: process.env.DB_PORT || config.database.port,
        user: process.env.DB_USER || config.database.user,
        password: process.env.DB_PASSWORD || config.database.password,
        database: process.env.DB_NAME || config.database.database
    };
    
    console.log('Connecting to database with configuration:', {
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        database: dbConfig.database
    });
    
    try {
        // First create the database if it doesn't exist
        const connection = await mysql.createConnection({ 
            host: dbConfig.host, 
            port: dbConfig.port, 
            user: dbConfig.user, 
            password: dbConfig.password 
        });
        
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
        await connection.end();
        console.log('Database exists or was created successfully');
    } catch (error) {
        console.error('Error creating database:', error);
        throw error;
    }

    // Then create the Sequelize connection with all necessary parameters
    const sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: 'mysql',
        logging: console.log, // Log SQL queries during startup
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        dialectOptions: {
            connectTimeout: 60000 // Increase connection timeout
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

    // Use sync with caution in production - consider using migrations
    try {
        await sequelize.sync({ alter: true });
        console.log('Database models synchronized successfully');
    } catch (error) {
        console.error('Error synchronizing database models:', error);
        throw error;
    }
}