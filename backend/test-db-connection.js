const mysql = require('mysql2/promise');
const config = require('./config.json');

async function testConnection() {
    try {
        console.log('Attempting to connect to MySQL database...');
        console.log('Connection details:', {
            host: config.database.host,
            port: config.database.port,
            user: config.database.user,
            database: config.database.database
        });

        const connection = await mysql.createConnection({
            host: config.database.host,
            port: config.database.port,
            user: config.database.user,
            password: config.database.password,
            database: config.database.database,
            connectTimeout: 10000 // 10 seconds timeout
        });

        console.log('Successfully connected to MySQL database!');
        
        // Test a simple query
        const [rows] = await connection.execute('SELECT 1 as test');
        console.log('Query test result:', rows);

        await connection.end();
        console.log('Connection closed successfully.');
    } catch (error) {
        console.error('Error connecting to the database:');
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        if (error.errno) console.error('Error number:', error.errno);
        if (error.sqlState) console.error('SQL State:', error.sqlState);
        if (error.sqlMessage) console.error('SQL Message:', error.sqlMessage);
    }
}

testConnection(); 