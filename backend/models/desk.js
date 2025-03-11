'use strict';
const {
	Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class desk extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			// desk.hasMany(models.user_desk, {
			// 	foreignKey: 'desk_id',
			// 	targetKey: 'desk_id',
			// 	onDelete: 'CASCADE'
			// })
			// desk.hasMany(models.agency, {
			//     foreignKey: 'agency_id',
			//     onDelete: 'CASCADE'
			// })
			// desk.belongsTo(models.section, {
			// 	foreignKey: 'section_id',
			// 	targetKey: 'section_id',
			// 	onDelete: 'CASCADE'
			// })
		}
	};
	desk.init({
		desk_id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			allowNull: false,
			autoIncrement: true,
		},
		desk_name: DataTypes.STRING,
		is_active: DataTypes.BOOLEAN,
		created_by: DataTypes.INTEGER,
		created_date: DataTypes.DATE,
		modified_by: DataTypes.INTEGER,
		modified_date: DataTypes.DATE
	}, {
		sequelize,
		modelName: 'desk',
		timestamps: false,
		freezeTableName: true
	});
	return desk;
};