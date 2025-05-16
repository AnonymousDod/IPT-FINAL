const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Department = sequelize.define('Department', {
        name: { type: DataTypes.STRING, allowNull: false, unique: true },
        description: { type: DataTypes.STRING, allowNull: true }
    }, {
        timestamps: false
    });
    return Department;
}; 