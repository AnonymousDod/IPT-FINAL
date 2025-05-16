const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Workflow = sequelize.define('Workflow', {
        employeeId: { type: DataTypes.INTEGER, allowNull: false },
        type: { type: DataTypes.STRING, allowNull: false },
        status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Pending' },
        details: { type: DataTypes.JSON, allowNull: true }
    }, {
        timestamps: false
    });
    return Workflow;
}; 