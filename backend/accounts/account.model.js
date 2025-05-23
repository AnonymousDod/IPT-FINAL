const { DataTypes } = require('sequelize');
const Role = require('../_helpers/role');

module.exports = model;

function model(sequelize) {
    const attributes = {
        email: { type: DataTypes.STRING, allowNull: false },
        passwordHash: { type: DataTypes.STRING, allowNull: false },
        title: { type: DataTypes.STRING, allowNull: true },
        firstName: { type: DataTypes.STRING, allowNull: false },
        lastName: { type: DataTypes.STRING, allowNull: false },
        acceptTerms: { type: DataTypes.BOOLEAN },
        role: { 
            type: DataTypes.STRING, 
            allowNull: false,
            defaultValue: Role.User 
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'Active'
        },
        verificationToken: { type: DataTypes.STRING },
        verified: { type: DataTypes.DATE },
        resetToken: { type: DataTypes.STRING },
        resetTokenExpires: { type: DataTypes.DATE },
        passwordReset: { type: DataTypes.DATE },
        created: { 
            type: DataTypes.DATE, 
            allowNull: false, 
            defaultValue: DataTypes.NOW 
        },
        updated: { 
            type: DataTypes.DATE, 
            allowNull: false, 
            defaultValue: DataTypes.NOW 
        },
        isVerified: {
            type: DataTypes.VIRTUAL,
            get() { return !!(this.verified || this.passwordReset); }
        }
    };

    const options = {
        timestamps: false,
        defaultScope: {
            attributes: { exclude: ['passwordHash'] }
        },
        scopes: {
            withHash: { attributes: {}, }
        }
    };

    return sequelize.define('account', attributes, options);
}
