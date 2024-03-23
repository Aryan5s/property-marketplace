const {sequelize , DataTypes } = require('../config/db');
const {Snowflake} = require('@theinternetfolks/snowflake')

const Property = sequelize.define('property', {
    id: {
        type: DataTypes.STRING,
        primaryKey : true,
        defaultValue : Snowflake.generate()
    },
    location: {
        type: DataTypes.STRING(40),
        allowNull: false
    },
    rooms: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    cost: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    owner : {
        type : DataTypes.STRING(100),
        allowNull : false,
        references : {
            model : 'Users',
            key : 'id'
        }
    },

     property_status : {
        type : DataTypes.STRING(100),
        allowNull : false,
    }
});

module.exports =  Property;