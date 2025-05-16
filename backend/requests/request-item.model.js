const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const RequestItem = sequelize.define('RequestItem', {
        name: { type: DataTypes.STRING, allowNull: false },
        quantity: { type: DataTypes.INTEGER, allowNull: false },
        requestId: { type: DataTypes.INTEGER, allowNull: false }
    }, {
        timestamps: false
    });
    return RequestItem;
}; 