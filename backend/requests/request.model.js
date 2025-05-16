const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Request = sequelize.define('Request', {
        type: { type: DataTypes.STRING, allowNull: false },
        status: { type: DataTypes.STRING, allowNull: false },
        employeeId: { type: DataTypes.INTEGER, allowNull: false },
        details: { type: DataTypes.JSON, allowNull: true }
    }, {
        timestamps: false
    });
    return Request;
}; 